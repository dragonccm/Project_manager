// Enhanced PDF export utility with Vietnamese font support
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface PDFExportOptions {
  filename?: string;
  title?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'a3' | 'letter';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  fontSize?: number;
  font?: 'helvetica' | 'times' | 'courier' | 'arial';
  includeHeader?: boolean;
  includeFooter?: boolean;
  pageNumbers?: boolean;
  logoUrl?: string;
  watermark?: string;
  language?: 'vi' | 'en';
}

const DEFAULT_PDF_OPTIONS: Required<PDFExportOptions> = {
  filename: 'report.pdf',
  title: 'Project Report',
  orientation: 'portrait',
  format: 'a4',
  margins: { top: 20, right: 20, bottom: 20, left: 20 },
  fontSize: 10,
  font: 'helvetica',
  includeHeader: true,
  includeFooter: true,
  pageNumbers: true,
  logoUrl: '',
  watermark: '',
  language: 'vi'
};

/**
 * Vietnamese font data (base64 encoded)
 * For production, this should be loaded from external font files
 */
const VIETNAMESE_FONTS = {
  'NotoSans-Regular': {
    vfsName: 'NotoSans-Regular.ttf',
    family: 'NotoSans',
    style: 'normal',
    url: '/fonts/NotoSans-Regular.ttf',
    loaded: false
  }
} as const;

// Track loaded fonts to avoid mutating readonly structures
const loadedFontKeys = new Set<string>();

async function fetchFontAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch font: ${url}`);
  const arrayBuf = await res.arrayBuffer();
  // Convert to base64
  let binary = '';
  const bytes = new Uint8Array(arrayBuf);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

/**
 * Initialize PDF with Vietnamese font support
 */
async function initializePDFWithVietnameseFont(options: Required<PDFExportOptions>): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: options.orientation,
    unit: 'mm',
    format: options.format
  });

  // Add Vietnamese font support
  try {
    // Try loading NotoSans from public/fonts
    await loadVietnameseFont(doc, 'NotoSans-Regular');
    if (loadedFontKeys.has('NotoSans-Regular')) {
      doc.setFont('NotoSans', 'normal');
      console.log('Vietnamese font loaded successfully');
    } else {
      // Use Helvetica with proper encoding for Vietnamese characters
      doc.setFont('helvetica', 'normal');
      console.log('Using built-in font (helvetica) for text display');
    }
    doc.setFontSize(options.fontSize);
  } catch (error) {
    console.log('Using built-in font for text display:', error);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(options.fontSize);
  }

  return doc;
}

/**
 * Load Vietnamese font into PDF document
 * This function now gracefully handles missing font files
 */
async function loadVietnameseFont(doc: jsPDF, fontKey: keyof typeof VIETNAMESE_FONTS): Promise<void> {
  const font = VIETNAMESE_FONTS[fontKey];
  if (!font) return;
  if (loadedFontKeys.has(fontKey)) return;
  
  try {
    // Check if font file exists before trying to load it
    const fontResponse = await fetch(font.url, { method: 'HEAD' });
    if (!fontResponse.ok) {
      console.log(`Vietnamese font file not found at ${font.url}. Using built-in font.`);
      return;
    }
    
    const base64 = await fetchFontAsBase64(font.url);
    (doc as any).addFileToVFS(font.vfsName, base64);
    (doc as any).addFont(font.vfsName, font.family, font.style);
    loadedFontKeys.add(fontKey);
    console.log(`Successfully loaded Vietnamese font: ${fontKey}`);
  } catch (e) {
    console.log('Vietnamese font not available, using built-in font for proper display.', e);
    // No need to throw error, just continue with built-in font
  }
}

/**
 * Export data to PDF with proper Vietnamese support
 */
export async function exportToPDF(
  data: Record<string, any>[],
  columns: Array<{ header: string; dataKey: string; width?: number }>,
  options: PDFExportOptions = {}
): Promise<void> {
  const opts = { ...DEFAULT_PDF_OPTIONS, ...options };
  const doc = await initializePDFWithVietnameseFont(opts);
  const useVNFont = loadedFontKeys.has('NotoSans-Regular');

  // Add title and header
  if (opts.includeHeader) {
    addPDFHeader(doc, opts);
  }

  // Add table with data
  const tableData = data.map(row => 
    columns.map(col => formatPDFValue(row[col.dataKey]))
  );

  const tableHeaders = columns.map(col => col.header);
  const columnWidths = columns.map(col => col.width || undefined);

  doc.autoTable({
    head: [tableHeaders],
    body: tableData,
    startY: opts.includeHeader ? 40 : 20,
    margin: opts.margins,
    styles: {
      fontSize: opts.fontSize,
      font: useVNFont ? 'NotoSans' : 'helvetica',
      cellPadding: 3,
      overflow: 'linebreak',
      halign: 'left'
    },
    headStyles: {
      fillColor: [64, 133, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 248, 255]
    },
    columnStyles: columnWidths.reduce((acc, width, index) => {
      if (width) acc[index] = { cellWidth: width };
      return acc;
    }, {} as Record<number, any>),
    didParseCell: (data: any) => {
      // Ensure Vietnamese characters are properly handled
      if (data.cell.text && Array.isArray(data.cell.text)) {
        data.cell.text = data.cell.text.map((text: any) => 
          typeof text === 'string' ? text : String(text)
        );
      }
    }
  });

  // Add footer
  if (opts.includeFooter) {
    addPDFFooter(doc, opts);
  }

  // Add page numbers
  if (opts.pageNumbers) {
    addPageNumbers(doc, opts);
  }

  // Download the PDF
  doc.save(opts.filename);
}

type TemplateLike = {
  name: string;
  description?: string;
  template_data: {
    layout?: 'custom' | 'table';
    fields?: string[];
    fieldLayout?: Array<{ id: string; x: number; y: number; width: number; height: number }>;
  };
  created_at?: string;
};

export async function exportTemplateReportToPDF(
  template: TemplateLike,
  records: Array<Record<string, any>>,
  options: PDFExportOptions = {}
): Promise<void> {
  const opts = { ...DEFAULT_PDF_OPTIONS, ...options, title: template.name };
  const doc = await initializePDFWithVietnameseFont(opts);
  const useVNFont = loadedFontKeys.has('NotoSans-Regular');

  if (opts.includeHeader) {
    addPDFHeader(doc, opts);
  }

  const startY = opts.includeHeader ? 40 : 20;
  let currentY = startY;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const left = opts.margins.left;
  const right = opts.margins.right;
  const bottom = opts.margins.bottom;
  const usableWidth = pageWidth - left - right;

  const PX_TO_MM = 0.264583; // CSS px to mm

  const td = template.template_data || {} as any;
  const layoutType = td.layout || (td.fieldLayout && td.fieldLayout.length ? 'custom' : 'table');

  // When no records
  if (!records || records.length === 0) {
    doc.setFontSize(12);
    doc.setFont(useVNFont ? 'NotoSans' : 'helvetica', 'normal');
    doc.text('Không có dữ liệu', left, currentY);
    doc.save(opts.filename);
    return;
  }

  if (layoutType === 'custom' && td.fieldLayout && td.fieldLayout.length) {
    // Render each record respecting absolute positions
    const labelFontSize = Math.max(8, opts.fontSize - 2);
    const valueFontSize = Math.max(9, opts.fontSize);
    for (let idx = 0; idx < records.length; idx++) {
      const rec = records[idx];

      // Add page if near bottom
      const neededHeight = 120; // heuristic per record
      if (currentY + neededHeight > pageHeight - bottom) {
        doc.addPage();
        currentY = startY;
      }

      // Record header
      doc.setFontSize(12);
      doc.setFont(useVNFont ? 'NotoSans' : 'helvetica', 'bold');
      doc.text(`Record ${idx + 1}`, left, currentY);
      currentY += 6;

      // Draw fields
      td.fieldLayout.forEach((fl: any) => {
        const x = left + fl.x * PX_TO_MM;
        const y = currentY + fl.y * PX_TO_MM;
        const w = Math.min(fl.width * PX_TO_MM, usableWidth);
        const h = fl.height * PX_TO_MM;
        const val = rec[fl.id] != null ? String(rec[fl.id]) : 'N/A';

        // Label
        doc.setFontSize(labelFontSize);
        doc.setTextColor(120, 120, 120);
        doc.setFont(useVNFont ? 'NotoSans' : 'helvetica', 'normal');
        doc.text(`${fl.id}:`, x, y);

        // Value (wrap inside width)
        doc.setFontSize(valueFontSize);
        doc.setTextColor(0, 0, 0);
        doc.setFont(useVNFont ? 'NotoSans' : 'helvetica', 'bold');
        const lines = doc.splitTextToSize(val, Math.max(20, w));
        doc.text(lines, x, y + 4);
      });

      // Move down after record
      currentY += 10 +  (Math.max(...td.fieldLayout.map((fl: any) => (fl.y + fl.height))) * PX_TO_MM);
    }
  } else {
    // Simple table per selected fields
    const fields: string[] = td.fields && td.fields.length ? td.fields : Object.keys(records[0]);
    const columns = fields.map((f) => ({ header: f, dataKey: f }));
    await exportToPDF(records, columns, opts);
    return;
  }

  if (opts.includeFooter) addPDFFooter(doc, opts);
  if (opts.pageNumbers) addPageNumbers(doc, opts);
  doc.save(opts.filename);
}

/**
 * Add header to PDF
 */
function addPDFHeader(doc: jsPDF, options: Required<PDFExportOptions>): void {
  const pageWidth = doc.internal.pageSize.width;
  
  // Add logo if provided
  if (options.logoUrl) {
    // In production, load and add logo image
    // doc.addImage(logoUrl, 'PNG', 20, 10, 30, 15);
  }

  // Add title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const titleX = options.logoUrl ? 60 : 20;
  doc.text(options.title, titleX, 20);

  // Add date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const dateText = `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`;
  const dateWidth = doc.getTextWidth(dateText);
  doc.text(dateText, pageWidth - dateWidth - 20, 20);

  // Add separator line
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 30, pageWidth - 20, 30);
}

/**
 * Add footer to PDF
 */
function addPDFFooter(doc: jsPDF, options: Required<PDFExportOptions>): void {
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  
  // Add separator line
  doc.setDrawColor(200, 200, 200);
  doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);

  // Add footer text
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  
  const footerText = options.language === 'vi' 
    ? 'Được tạo bởi Project Manager System'
    : 'Generated by Project Manager System';
  
  doc.text(footerText, 20, pageHeight - 10);

  // Add timestamp
  const timestamp = new Date().toLocaleString('vi-VN');
  const timestampWidth = doc.getTextWidth(timestamp);
  doc.text(timestamp, pageWidth - timestampWidth - 20, pageHeight - 10);
}

/**
 * Add page numbers to PDF
 */
function addPageNumbers(doc: jsPDF, options: Required<PDFExportOptions>): void {
  const pageCount = doc.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    
    const pageText = `Trang ${i}/${pageCount}`;
    const pageTextWidth = doc.getTextWidth(pageText);
    const x = (pageWidth - pageTextWidth) / 2;
    
    doc.text(pageText, x, pageHeight - 5);
  }
}

/**
 * Format value for PDF display
 */
function formatPDFValue(value: any): string {
  if (value == null) return '';
  
  if (value instanceof Date) {
    return value.toLocaleDateString('vi-VN');
  }
  
  if (typeof value === 'number') {
    return value.toLocaleString('vi-VN');
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Có' : 'Không';
  }
  
  return String(value);
}

/**
 * Export tasks to PDF with Vietnamese formatting
 */
export async function exportTasksToPDF(
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
  options: PDFExportOptions = {}
): Promise<void> {
  const columns = [
    { header: 'Tiêu đề', dataKey: 'title', width: 40 },
    { header: 'Dự án', dataKey: 'project_name', width: 30 },
    { header: 'Trạng thái', dataKey: 'status', width: 25 },
    { header: 'Ưu tiên', dataKey: 'priority', width: 20 },
    { header: 'Thời gian (h)', dataKey: 'estimated_time_formatted', width: 25 },
    { header: 'Ngày', dataKey: 'date', width: 25 },
    { header: 'Hoàn thành', dataKey: 'completed', width: 20 }
  ];

  // Format tasks data
  const formattedTasks = tasks.map(task => ({
    ...task,
    estimated_time_formatted: task.estimated_time ? 
      Math.round(task.estimated_time / 60 * 10) / 10 : 0,
    date: new Date(task.date).toLocaleDateString('vi-VN')
  }));

  const pdfOptions: PDFExportOptions = {
    filename: `tasks_${new Date().toISOString().split('T')[0]}.pdf`,
    title: 'Báo cáo Task',
    ...options
  };

  await exportToPDF(formattedTasks, columns, pdfOptions);
}

/**
 * Export projects to PDF
 */
export async function exportProjectsToPDF(
  projects: Array<{
    id: string;
    name: string;
    description?: string;
    status: string;
    domain?: string;
    created_at: string;
    updated_at: string;
    task_count?: number;
    completed_tasks?: number;
  }>,
  options: PDFExportOptions = {}
): Promise<void> {
  const columns = [
    { header: 'Tên dự án', dataKey: 'name', width: 50 },
    { header: 'Trạng thái', dataKey: 'status', width: 30 },
    { header: 'Domain', dataKey: 'domain', width: 40 },
    { header: 'Tasks', dataKey: 'task_count', width: 20 },
    { header: 'Hoàn thành', dataKey: 'completed_tasks', width: 25 },
    { header: 'Tiến độ (%)', dataKey: 'progress', width: 25 },
    { header: 'Ngày tạo', dataKey: 'created_at_formatted', width: 30 }
  ];

  // Format projects data
  const formattedProjects = projects.map(project => ({
    ...project,
    progress: project.task_count ? 
      Math.round((project.completed_tasks || 0) / project.task_count * 100) : 0,
    created_at_formatted: new Date(project.created_at).toLocaleDateString('vi-VN')
  }));

  const pdfOptions: PDFExportOptions = {
    filename: `projects_${new Date().toISOString().split('T')[0]}.pdf`,
    title: 'Báo cáo Dự án',
    orientation: 'landscape', // More space for project data
    ...options
  };

  await exportToPDF(formattedProjects, columns, pdfOptions);
}

/**
 * Create comprehensive report with multiple sections
 */
export async function exportComprehensiveReport(
  data: {
    summary: Record<string, any>;
    projects: Array<any>;
    tasks: Array<any>;
    timeline: Array<any>;
  },
  options: PDFExportOptions = {}
): Promise<void> {
  const opts = { ...DEFAULT_PDF_OPTIONS, ...options };
  const doc = await initializePDFWithVietnameseFont(opts);

  let yPosition = 20;

  // Title page
  if (opts.includeHeader) {
    addPDFHeader(doc, opts);
    yPosition = 50;
  }

  // Summary section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Tổng quan', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  Object.entries(data.summary).forEach(([key, value]) => {
    doc.text(`${key}: ${formatPDFValue(value)}`, 25, yPosition);
    yPosition += 5;
  });

  yPosition += 10;

  // Projects summary table
  if (data.projects.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Dự án', 20, yPosition);
    
    const projectColumns = [
      { header: 'Tên dự án', dataKey: 'name', width: 50 },
      { header: 'Trạng thái', dataKey: 'status', width: 30 },
      { header: 'Tasks', dataKey: 'task_count', width: 20 },
      { header: 'Tiến độ (%)', dataKey: 'progress', width: 30 }
    ];

    doc.autoTable({
      head: [projectColumns.map(col => col.header)],
      body: data.projects.map(project => 
        projectColumns.map(col => formatPDFValue(project[col.dataKey]))
      ),
      startY: yPosition + 5,
      margin: opts.margins,
      styles: {
        fontSize: 9,
        font: 'helvetica'
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Add new page if needed
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // Tasks summary
  if (data.tasks.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Tasks gần đây', 20, yPosition);
    
    const taskColumns = [
      { header: 'Tiêu đề', dataKey: 'title', width: 60 },
      { header: 'Trạng thái', dataKey: 'status', width: 25 },
      { header: 'Ưu tiên', dataKey: 'priority', width: 25 },
      { header: 'Ngày', dataKey: 'date', width: 25 }
    ];

    doc.autoTable({
      head: [taskColumns.map(col => col.header)],
      body: data.tasks.slice(0, 10).map(task => // Limit to 10 recent tasks
        taskColumns.map(col => formatPDFValue(task[col.dataKey]))
      ),
      startY: yPosition + 5,
      margin: opts.margins,
      styles: {
        fontSize: 9,
        font: 'helvetica'
      }
    });
  }

  // Add footer and page numbers
  if (opts.includeFooter) {
    addPDFFooter(doc, opts);
  }
  
  if (opts.pageNumbers) {
    addPageNumbers(doc, opts);
  }

  // Download the PDF
  doc.save(opts.filename);
}

export default {
  exportToPDF,
  exportTasksToPDF, 
  exportProjectsToPDF,
  exportComprehensiveReport,
  exportTemplateReportToPDF
}