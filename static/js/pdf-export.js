/**
 * PDF Export functionality for Persian Accounting System
 * Enhanced with professional features and Persian formatting
 */

// Initialize PDF export functionality
document.addEventListener('DOMContentLoaded', function() {
    initializePDFExports();
});

/**
 * Initialize all PDF export buttons
 */
function initializePDFExports() {
    // Add PDF export buttons to reports
    addPDFExportButtons();
    
    // Setup event listeners
    setupPDFEventListeners();
}

/**
 * Add PDF export buttons to appropriate pages
 */
function addPDFExportButtons() {
    // Find tables that should have PDF export
    const exportableElements = [
        { selector: '.table', buttonText: 'دانلود PDF', icon: 'fas fa-file-pdf' },
        { selector: '#financial-summary', buttonText: 'دانلود گزارش مالی', icon: 'fas fa-chart-line' },
        { selector: '#invoice-container', buttonText: 'دانلود فاکتور', icon: 'fas fa-file-invoice' }
    ];
    
    exportableElements.forEach(item => {
        const elements = document.querySelectorAll(item.selector);
        elements.forEach((element, index) => {
            if (!element.querySelector('.pdf-export-btn')) {
                addExportButton(element, item.buttonText, item.icon, index);
            }
        });
    });
}

/**
 * Add export button to an element
 */
function addExportButton(element, buttonText, icon, index) {
    const exportButton = document.createElement('button');
    exportButton.className = 'btn btn-outline-danger btn-sm pdf-export-btn';
    exportButton.innerHTML = `<i class="${icon}"></i> ${buttonText}`;
    exportButton.setAttribute('data-export-target', index);
    
    // Find the best place to insert the button
    const cardHeader = element.closest('.card')?.querySelector('.card-header');
    const parentContainer = element.parentElement;
    
    if (cardHeader) {
        const buttonContainer = cardHeader.querySelector('.btn-group') || 
                               cardHeader.querySelector('.d-flex') || 
                               cardHeader;
        
        if (!buttonContainer.querySelector('.pdf-export-btn')) {
            buttonContainer.appendChild(exportButton);
        }
    } else if (parentContainer) {
        const buttonWrapper = document.createElement('div');
        buttonWrapper.className = 'd-flex justify-content-end mb-3';
        buttonWrapper.appendChild(exportButton);
        parentContainer.insertBefore(buttonWrapper, element);
    }
}

/**
 * Setup event listeners for PDF export
 */
function setupPDFEventListeners() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.pdf-export-btn')) {
            e.preventDefault();
            const button = e.target.closest('.pdf-export-btn');
            const targetIndex = button.getAttribute('data-export-target');
            
            // Determine what to export based on the page and element
            if (window.location.pathname.includes('invoice') && targetIndex !== null) {
                exportInvoicePDF(button);
            } else if (window.location.pathname.includes('report')) {
                exportReportPDF(button);
            } else {
                exportTablePDF(button);
            }
        }
    });
}

/**
 * Export invoice as PDF
 */
function exportInvoicePDF(button) {
    const invoiceContainer = document.getElementById('invoice-container') || 
                            button.closest('.card') || 
                            document.querySelector('.invoice-details');
    
    if (!invoiceContainer) {
        showAlert('خطا در یافتن محتوای فاکتور', 'error');
        return;
    }
    
    // Show loading state
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="loading-spinner"></span> در حال تولید PDF...';
    button.disabled = true;
    
    // PDF options for invoice
    const opt = {
        margin: [10, 10, 10, 10],
        filename: `invoice_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            putOnlyUsedFonts: true
        }
    };
    
    // Create a clean version for PDF
    const cleanContainer = prepareInvoiceForPDF(invoiceContainer);
    
    // Generate PDF
    html2pdf()
        .from(cleanContainer)
        .set(opt)
        .save()
        .then(() => {
            // Reset button
            button.innerHTML = originalText;
            button.disabled = false;
            showAlert('فاکتور با موفقیت دانلود شد', 'success');
        })
        .catch(error => {
            console.error('PDF generation error:', error);
            button.innerHTML = originalText;
            button.disabled = false;
            showAlert('خطا در تولید PDF', 'error');
        });
}

/**
 * Export report as PDF
 */
function exportReportPDF(button) {
    const reportContainer = document.querySelector('.main-content') || 
                           button.closest('.card') ||
                           document.querySelector('.container-fluid');
    
    // Show loading state
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="loading-spinner"></span> در حال تولید گزارش...';
    button.disabled = true;
    
    // PDF options for reports
    const opt = {
        margin: [15, 10, 15, 10],
        filename: `report_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { 
            scale: 1.5,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            height: window.innerHeight,
            width: window.innerWidth
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait'
        }
    };
    
    // Create a clean version for PDF
    const cleanContainer = prepareReportForPDF(reportContainer);
    
    // Generate PDF
    html2pdf()
        .from(cleanContainer)
        .set(opt)
        .save()
        .then(() => {
            // Reset button
            button.innerHTML = originalText;
            button.disabled = false;
            showAlert('گزارش با موفقیت دانلود شد', 'success');
        })
        .catch(error => {
            console.error('PDF generation error:', error);
            button.innerHTML = originalText;
            button.disabled = false;
            showAlert('خطا در تولید گزارش', 'error');
        });
}

/**
 * Export table as PDF
 */
function exportTablePDF(button) {
    const table = button.closest('.card')?.querySelector('.table') || 
                  document.querySelector('.table');
    
    if (!table) {
        showAlert('جدولی برای صادرات یافت نشد', 'error');
        return;
    }
    
    // Show loading state
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="loading-spinner"></span> در حال صادرات...';
    button.disabled = true;
    
    // Create a clean table for PDF
    const cleanTable = prepareTableForPDF(table);
    
    // PDF options for tables
    const opt = {
        margin: [10, 10, 10, 10],
        filename: `table_export_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'landscape'
        }
    };
    
    // Generate PDF
    html2pdf()
        .from(cleanTable)
        .set(opt)
        .save()
        .then(() => {
            // Reset button
            button.innerHTML = originalText;
            button.disabled = false;
            showAlert('جدول با موفقیت صادر شد', 'success');
        })
        .catch(error => {
            console.error('PDF generation error:', error);
            button.innerHTML = originalText;
            button.disabled = false;
            showAlert('خطا در صادرات جدول', 'error');
        });
}

/**
 * Prepare invoice container for PDF generation
 */
function prepareInvoiceForPDF(container) {
    const clone = container.cloneNode(true);
    
    // Remove unnecessary elements
    const elementsToRemove = [
        '.btn', '.dropdown', '.navbar', '.sidebar', '.breadcrumb',
        '.pdf-export-btn', '.delete-btn', '[data-bs-dismiss]'
    ];
    
    elementsToRemove.forEach(selector => {
        const elements = clone.querySelectorAll(selector);
        elements.forEach(el => el.remove());
    });
    
    // Add PDF-specific styling
    const style = document.createElement('style');
    style.textContent = `
        * {
            box-sizing: border-box;
        }
        body {
            font-family: 'Tahoma', 'Arial', sans-serif !important;
            direction: rtl !important;
            color: #000 !important;
            background: #fff !important;
            margin: 0;
            padding: 20px;
        }
        .card {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
        }
        .table {
            border-collapse: collapse !important;
            width: 100% !important;
        }
        .table th, .table td {
            border: 1px solid #000 !important;
            padding: 8px !important;
            text-align: right !important;
        }
        .table th {
            background-color: #f5f5f5 !important;
            font-weight: bold !important;
        }
        .text-primary, .text-success, .text-danger {
            color: #000 !important;
        }
        @page {
            margin: 20mm;
        }
    `;
    
    clone.insertBefore(style, clone.firstChild);
    return clone;
}

/**
 * Prepare report container for PDF generation
 */
function prepareReportForPDF(container) {
    const clone = container.cloneNode(true);
    
    // Remove navigation and UI elements
    const elementsToRemove = [
        '.navbar', '.sidebar', '.breadcrumb', '.btn-group',
        '.pdf-export-btn', '.delete-btn', '.dropdown'
    ];
    
    elementsToRemove.forEach(selector => {
        const elements = clone.querySelectorAll(selector);
        elements.forEach(el => el.remove());
    });
    
    // Add report header
    const header = document.createElement('div');
    header.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 15px;">
            <h1 style="margin: 0; font-size: 24px;">سیستم حسابداری</h1>
            <h2 style="margin: 10px 0 0 0; font-size: 18px;">گزارش مالی</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px;">تاریخ: ${new Date().toLocaleDateString('fa-IR')}</p>
        </div>
    `;
    
    clone.insertBefore(header, clone.firstChild);
    
    // Add PDF styling
    const style = document.createElement('style');
    style.textContent = `
        body {
            font-family: 'Tahoma', 'Arial', sans-serif !important;
            direction: rtl !important;
            color: #000 !important;
            background: #fff !important;
            margin: 0;
            padding: 15px;
            font-size: 12px;
        }
        .card {
            border: 1px solid #ddd !important;
            margin-bottom: 20px !important;
            page-break-inside: avoid;
        }
        .card-header {
            background-color: #f8f9fa !important;
            border-bottom: 1px solid #ddd !important;
            padding: 10px !important;
        }
        .table {
            font-size: 11px !important;
            border-collapse: collapse !important;
        }
        .table th, .table td {
            border: 1px solid #000 !important;
            padding: 6px !important;
        }
    `;
    
    clone.insertBefore(style, clone.firstChild);
    return clone;
}

/**
 * Prepare table for PDF generation
 */
function prepareTableForPDF(table) {
    const wrapper = document.createElement('div');
    const clone = table.cloneNode(true);
    
    // Remove action columns and buttons
    const actionCells = clone.querySelectorAll('th:last-child, td:last-child');
    actionCells.forEach(cell => {
        if (cell.textContent.includes('عملیات') || cell.querySelector('.btn')) {
            cell.remove();
        }
    });
    
    // Add header
    const header = document.createElement('div');
    header.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h2>لیست اطلاعات</h2>
            <p>تاریخ صادرات: ${new Date().toLocaleDateString('fa-IR')}</p>
        </div>
    `;
    
    wrapper.appendChild(header);
    wrapper.appendChild(clone);
    
    // Add styling
    const style = document.createElement('style');
    style.textContent = `
        body {
            font-family: 'Tahoma', 'Arial', sans-serif !important;
            direction: rtl !important;
            margin: 0;
            padding: 15px;
        }
        .table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 10px !important;
        }
        .table th, .table td {
            border: 1px solid #000 !important;
            padding: 5px !important;
            text-align: right !important;
        }
        .table th {
            background-color: #f0f0f0 !important;
            font-weight: bold !important;
        }
    `;
    
    wrapper.insertBefore(style, wrapper.firstChild);
    return wrapper;
}

/**
 * Enhanced date picker initialization with default today's date
 */
function initializeEnhancedDatePickers() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    
    dateInputs.forEach(input => {
        // Set default to today if empty
        if (!input.value) {
            input.valueAsDate = new Date();
        }
        
        // Add Persian calendar support
        if (input.dataset.persianDatepicker === 'true') {
            initializePersianDatePicker(input);
        }
        
        // Add validation
        input.addEventListener('change', function() {
            validateDateInput(this);
        });
    });
}

/**
 * Validate date input
 */
function validateDateInput(input) {
    const selectedDate = new Date(input.value);
    const today = new Date();
    
    if (selectedDate > today && input.name !== 'due_date') {
        showAlert('تاریخ نمی‌تواند آینده باشد', 'warning');
        input.value = today.toISOString().split('T')[0];
    }
}

// Initialize enhanced date pickers when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeEnhancedDatePickers();
});

// Export functions for global use
window.exportInvoicePDF = exportInvoicePDF;
window.exportReportPDF = exportReportPDF;
window.exportTablePDF = exportTablePDF;
window.initializeEnhancedDatePickers = initializeEnhancedDatePickers;