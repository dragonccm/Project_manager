// Fuzzy search utilities for SearchableSelect component
// Provides intelligent search with typo tolerance and ranking

export interface SearchResult<T = any> {
  item: T;
  score: number;
  matches: Array<{
    indices: [number, number][];
    value: string;
    key: string;
  }>;
}

export interface FuzzySearchOptions {
  keys: string[]; // Fields to search in
  threshold: number; // 0.0 = perfect match, 1.0 = match anything
  distance: number; // Maximum distance between characters
  minMatchCharLength: number; // Minimum character length to be considered a match
  shouldSort: boolean; // Whether to sort results by score
  includeMatches: boolean; // Include match indices for highlighting
  includeScore: boolean; // Include search scores
  isCaseSensitive: boolean;
  findAllMatches: boolean;
  tokenize: boolean; // Break search into tokens
  location: number; // Where in the text to start looking for matches
}

const DEFAULT_OPTIONS: FuzzySearchOptions = {
  keys: [],
  threshold: 0.4,
  distance: 100,
  minMatchCharLength: 1,
  shouldSort: true,
  includeMatches: true,
  includeScore: true,
  isCaseSensitive: false,
  findAllMatches: false,
  tokenize: false,
  location: 0
};

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate match score based on pattern and text
 */
function calculateScore(pattern: string, text: string, options: FuzzySearchOptions): number {
  if (!pattern || !text) return 0;
  
  const patternLower = options.isCaseSensitive ? pattern : pattern.toLowerCase();
  const textLower = options.isCaseSensitive ? text : text.toLowerCase();
  
  // Exact match gets highest score
  if (textLower === patternLower) return 1;
  
  // Starts with pattern gets high score
  if (textLower.startsWith(patternLower)) return 0.8;
  
  // Contains pattern gets medium score
  if (textLower.includes(patternLower)) return 0.6;
  
  // Use Levenshtein distance for fuzzy matching
  const maxLength = Math.max(patternLower.length, textLower.length);
  if (maxLength === 0) return 1;
  
  const distance = levenshteinDistance(patternLower, textLower);
  const similarity = 1 - distance / maxLength;
  
  return similarity > options.threshold ? similarity * 0.4 : 0;
}

/**
 * Find match indices for highlighting
 */
function findMatches(pattern: string, text: string, options: FuzzySearchOptions): [number, number][] {
  if (!pattern || !text) return [];
  
  const patternLower = options.isCaseSensitive ? pattern : pattern.toLowerCase();
  const textLower = options.isCaseSensitive ? text : text.toLowerCase();
  const matches: [number, number][] = [];
  
  let startIndex = 0;
  let index = textLower.indexOf(patternLower, startIndex);
  
  while (index !== -1) {
    matches.push([index, index + patternLower.length - 1]);
    startIndex = index + 1;
    index = textLower.indexOf(patternLower, startIndex);
  }
  
  return matches;
}

/**
 * Get value from nested object using dot notation
 */
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : '';
  }, obj);
}

/**
 * Main fuzzy search function
 */
export function fuzzySearch<T>(
  items: T[],
  query: string,
  options: Partial<FuzzySearchOptions> = {}
): SearchResult<T>[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  if (!query.trim() || !items.length) {
    return items.map(item => ({
      item,
      score: 1,
      matches: []
    }));
  }
  
  const results: SearchResult<T>[] = [];
  
  for (const item of items) {
    let bestScore = 0;
    let bestMatches: SearchResult<T>['matches'] = [];
    
    // If no keys specified, convert item to string and search
    if (opts.keys.length === 0) {
      const text = String(item);
      const score = calculateScore(query, text, opts);
      if (score > 0) {
        bestScore = score;
        if (opts.includeMatches) {
          bestMatches = [{
            indices: findMatches(query, text, opts),
            value: text,
            key: 'item'
          }];
        }
      }
    } else {
      // Search in specified keys
      for (const key of opts.keys) {
        const value = getNestedValue(item, key);
        if (!value) continue;
        
        const text = String(value);
        const score = calculateScore(query, text, opts);
        
        if (score > bestScore) {
          bestScore = score;
          if (opts.includeMatches) {
            bestMatches = [{
              indices: findMatches(query, text, opts),
              value: text,
              key
            }];
          }
        }
      }
    }
    
    if (bestScore > opts.threshold) {
      results.push({
        item,
        score: bestScore,
        matches: bestMatches
      });
    }
  }
  
  // Sort by score if requested
  if (opts.shouldSort) {
    results.sort((a, b) => b.score - a.score);
  }
  
  return results;
}

/**
 * Highlight matches in text based on match indices
 * Returns array of text parts with isHighlighted flag
 */
export function highlightMatches(
  text: string,
  matches: [number, number][]
): Array<{ text: string; isHighlighted: boolean }> {
  if (!matches.length) return [{ text, isHighlighted: false }];
  
  const result: Array<{ text: string; isHighlighted: boolean }> = [];
  let lastIndex = 0;
  
  matches.forEach(([start, end]) => {
    // Add text before match
    if (start > lastIndex) {
      result.push({ text: text.slice(lastIndex, start), isHighlighted: false });
    }
    
    // Add highlighted match
    result.push({ text: text.slice(start, end + 1), isHighlighted: true });
    
    lastIndex = end + 1;
  });
  
  // Add remaining text
  if (lastIndex < text.length) {
    result.push({ text: text.slice(lastIndex), isHighlighted: false });
  }
  
  return result;
}

/**
 * Create a simple search function for basic use cases
 */
export function createSearcher<T>(keys: string[], options?: Partial<FuzzySearchOptions>) {
  return (items: T[], query: string) => {
    return fuzzySearch(items, query, { ...options, keys });
  };
}

export default {
  fuzzySearch,
  highlightMatches,
  createSearcher
};