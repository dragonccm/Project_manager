// Enhanced CSV export utility with UTF-8 encoding support
// Handles Vietnamese characters and special symbols properly

export interface CSVExportOptions {
  filename?: string;
  delimiter?: string;
  includeHeaders?: boolean;
  encoding?: 'utf-8' | 'utf-8-bom';
  dateFormat?: string;
  timeFormat?: string;
  nullValue?: string;
  quoteAll?: boolean;
  escapeFormulas?: boolean;
}

const DEFAULT_OPTIONS: Required<CSVExportOptions> = {
  filename: 'export.csv',
  delimiter: ',',
  includeHeaders: true,
  encoding: 'utf-8-bom', // BOM ensures proper UTF-8 recognition in Excel
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm:ss',
  nullValue: '',
  quoteAll: false,
  escapeFormulas: true
};

/**
 * Convert data to CSV format with proper UTF-8 encoding
 */
export function exportToCSV(
  data: Record<string, any>[],
  options: CSVExportOptions = {}
): void {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  if (!data || data.length === 0) {
    throw new Error('No data provided for CSV export');
  }

  // Get all unique keys from data
  const headers = Array.from(
    new Set(data.flatMap(row => Object.keys(row)))
  ).sort();

  const csvContent = generateCSVContent(data, headers, opts);
  downloadCSV(csvContent, opts.filename, opts.encoding);
}

/**
 * Generate CSV content string
 */
function generateCSVContent(
  data: Record<string, any>[],
  headers: string[],
  options: Required<CSVExportOptions>
): string {
  const rows: string[] = [];

  // Add headers if requested
  if (options.includeHeaders) {
    const headerRow = headers.map(header => 
      formatCSVValue(header, options)
    ).join(options.delimiter);
    rows.push(headerRow);
  }

  // Add data rows
  data.forEach(row => {
    const csvRow = headers.map(header => {
      const value = row[header];
      return formatCSVValue(value, options);
    }).join(options.delimiter);
    rows.push(csvRow);
  });

  return rows.join('\n');
}

/**
 * Format a value for CSV output
 */
function formatCSVValue(
  value: any,
  options: Required<CSVExportOptions>
): string {
  // Handle null/undefined
  if (value == null) {
    return options.nullValue;
  }

  // Handle dates
  if (value instanceof Date) {
    return formatDate(value, options.dateFormat);
  }

  // Convert to string
  let stringValue = String(value);

  // Handle numbers with locale formatting
  if (typeof value === 'number') {
    // Keep numbers as-is for proper Excel recognition
    return stringValue;
  }

  // Escape formulas to prevent CSV injection
  if (options.escapeFormulas && /^[=+\-@]/.test(stringValue)) {
    stringValue = `'${stringValue}`;
  }

  // Handle special characters and quoting
  const needsQuoting = options.quoteAll ||
    stringValue.includes(options.delimiter) ||
    stringValue.includes('\n') ||
    stringValue.includes('\r') ||
    stringValue.includes('"');

  if (needsQuoting) {
    // Escape existing quotes by doubling them
    stringValue = stringValue.replace(/"/g, '""');
    return `"${stringValue}"`;
  }

  return stringValue;
}

/**
 * Format date according to specified format
 */
function formatDate(date: Date, format: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * Download CSV content as file
 */
function downloadCSV(
  content: string,
  filename: string,
  encoding: 'utf-8' | 'utf-8-bom'
): void {
  // Add BOM for UTF-8 if specified
  let csvData = content;
  if (encoding === 'utf-8-bom') {
    csvData = '\uFEFF' + content; // UTF-8 BOM
  }

  // Create blob with proper MIME type
  const blob = new Blob([csvData], {
    type: 'text/csv;charset=utf-8;'
  });

  // Create download link
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    // Fallback for older browsers
    window.open('data:text/csv;charset=utf-8,' + encodeURIComponent(csvData));
  }
}

/**
 * Export report data with proper Vietnamese character support
 */
export function exportReportToCSV(
  reportData: {
    title: string;
    data: Record<string, any>[];
    summary?: Record<string, any>;
    metadata?: Record<string, any>;
  },
  options: CSVExportOptions = {}
): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const defaultFilename = `${reportData.title}_${timestamp}.csv`;
  
  const csvOptions: CSVExportOptions = {
    filename: defaultFilename,
    encoding: 'utf-8-bom', // Ensures proper display in Excel
    includeHeaders: true,
    delimiter: ',',
    escapeFormulas: true,
    ...options
  };

  // Prepare data with metadata
  let exportData = [...reportData.data];

  // Add summary row if provided
  if (reportData.summary) {
    exportData.push({
      ...reportData.summary,
      _type: 'SUMMARY' // Mark as summary row
    });
  }

  // Add metadata as comments (Excel will ignore these)
  if (reportData.metadata) {
    const metadataRows = Object.entries(reportData.metadata).map(([key, value]) => ({
      _metadata: key,
      _value: value
    }));
    exportData = [...metadataRows, {}, ...exportData]; // Empty row separator
  }

  exportToCSV(exportData, csvOptions);
}

/**
 * Convert task data to CSV with time formatting
 */
export function exportTasksToCSV(
  tasks: Array<{
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    estimated_time?: number;
    actual_time?: number;
    date: string;
    project_name?: string;
    completed: boolean;
    created_at: string;
    updated_at: string;
  }>,
  options: CSVExportOptions = {}
): void {
  // Format tasks for CSV export
  const formattedTasks = tasks.map(task => ({
    'ID': task.id,
    'Tiêu đề': task.title,
    'Mô tả': task.description || '',
    'Dự án': task.project_name || '',
    'Trạng thái': task.status,
    'Mức độ ưu tiên': task.priority,
    'Thời gian dự kiến (giờ)': task.estimated_time ? Math.round(task.estimated_time / 60 * 10) / 10 : '',
    'Thời gian thực tế (giờ)': task.actual_time ? Math.round(task.actual_time / 60 * 10) / 10 : '',
    'Ngày': task.date,
    'Hoàn thành': task.completed ? 'Có' : 'Không',
    'Ngày tạo': new Date(task.created_at).toLocaleDateString('vi-VN'),
    'Ngày cập nhật': new Date(task.updated_at).toLocaleDateString('vi-VN')
  }));

  const csvOptions: CSVExportOptions = {
    filename: `tasks_${new Date().toISOString().split('T')[0]}.csv`,
    encoding: 'utf-8-bom',
    ...options
  };

  exportToCSV(formattedTasks, csvOptions);
}

/**
 * Convert project data to CSV
 */
export function exportProjectsToCSV(
  projects: Array<{
    id: string;
    name: string;
    description?: string;
    status: string;
    domain?: string;
    figma_link?: string;
    created_at: string;
    updated_at: string;
    task_count?: number;
    completed_tasks?: number;
  }>,
  options: CSVExportOptions = {}
): void {
  const formattedProjects = projects.map(project => ({
    'ID': project.id,
    'Tên dự án': project.name,
    'Mô tả': project.description || '',
    'Trạng thái': project.status,
    'Domain': project.domain || '',
    'Figma Link': project.figma_link || '',
    'Tổng số task': project.task_count || 0,
    'Task hoàn thành': project.completed_tasks || 0,
    'Tiến độ (%)': project.task_count ? 
      Math.round((project.completed_tasks || 0) / project.task_count * 100) : 0,
    'Ngày tạo': new Date(project.created_at).toLocaleDateString('vi-VN'),
    'Ngày cập nhật': new Date(project.updated_at).toLocaleDateString('vi-VN')
  }));

  const csvOptions: CSVExportOptions = {
    filename: `projects_${new Date().toISOString().split('T')[0]}.csv`,
    encoding: 'utf-8-bom',
    ...options
  };

  exportToCSV(formattedProjects, csvOptions);
}

/**
 * Validate CSV data before export
 */
export function validateCSVData(data: Record<string, any>[]): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(data)) {
    errors.push('Data must be an array');
    return { valid: false, errors, warnings };
  }

  if (data.length === 0) {
    warnings.push('No data to export');
  }

  // Check for common issues
  data.forEach((row, index) => {
    if (typeof row !== 'object' || row === null) {
      errors.push(`Row ${index + 1}: Invalid data type`);
      return;
    }

    // Check for extremely long text that might break CSV
    Object.entries(row).forEach(([key, value]) => {
      if (typeof value === 'string' && value.length > 32767) {
        warnings.push(`Row ${index + 1}, Column "${key}": Text exceeds Excel cell limit`);
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export default {
  exportToCSV,
  exportReportToCSV,
  exportTasksToCSV,
  exportProjectsToCSV,
  validateCSVData
};