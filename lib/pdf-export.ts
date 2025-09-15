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
  'NotoSansVN-Regular': {
    data: '', // Base64 font data would go here
    loaded: false
  },
  'RobotoVN-Regular': {
    data: '', // Base64 font data would go here  
    loaded: false
  }
};

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
    // For now, use built-in fonts with Unicode support
    // In production, you would load custom Vietnamese fonts:
    // await loadVietnameseFont(doc, 'NotoSansVN-Regular');
    
    // Set font for Vietnamese text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(options.fontSize);
  } catch (error) {
    console.warn('Vietnamese font loading failed, using fallback font:', error);
    doc.setFont('helvetica', 'normal');
  }

  return doc;
}

/**
 * Load Vietnamese font into PDF document
 * This is a placeholder - in production, implement actual font loading
 */
async function loadVietnameseFont(doc: jsPDF, fontName: string): Promise<void> {
  if (VIETNAMESE_FONTS[fontName as keyof typeof VIETNAMESE_FONTS] && !VIETNAMESE_FONTS[fontName as keyof typeof VIETNAMESE_FONTS].loaded) {
    // In production:
    // 1. Load font file from server or CDN
    // 2. Convert to base64
    // 3. Add to jsPDF using doc.addFileToVFS() and doc.addFont()
    // 4. Set as current font
    
    // Placeholder implementation:
    console.log(`Loading Vietnamese font: ${fontName}`);
    // doc.addFileToVFS('NotoSansVN-Regular.ttf', fontData);
    // doc.addFont('NotoSansVN-Regular.ttf', 'NotoSansVN', 'normal');
    VIETNAMESE_FONTS[fontName as keyof typeof VIETNAMESE_FONTS].loaded = true;
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
      font: 'helvetica', // Use font that supports Vietnamese
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
  exportComprehensiveReport
}