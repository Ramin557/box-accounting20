/**
 * Enhanced form functionality for Persian Accounting System
 * Improved date handling, validation, and UX features
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeEnhancedForms();
    setupFormValidation();
    initializeCalculationFields();
});

/**
 * Initialize enhanced form features
 */
function initializeEnhancedForms() {
    // Setup all date inputs with enhanced features
    setupEnhancedDateInputs();
    
    // Add auto-calculation for invoice forms
    setupInvoiceCalculations();
    
    // Handle form submission states
    setupFormSubmissionStates();
    
    // Initialize number formatting
    setupNumberFormatting();
}

/**
 * Setup enhanced date inputs with default values and validation
 */
function setupEnhancedDateInputs() {
    const dateInputs = document.querySelectorAll('input[type="date"], input[data-persian-datepicker="true"]');
    
    dateInputs.forEach(input => {
        // Set default date for transaction dates (not due dates)
        if (!input.value && input.type === 'date' && input.name !== 'due_date' && input.name !== 'end_date') {
            try {
                const today = new Date();
                input.valueAsDate = today;
            } catch (e) {
                // Fallback for inputs that don't support valueAsDate
                const todayString = today.toISOString().split('T')[0];
                input.value = todayString;
            }
        }
        
        // Add date validation
        input.addEventListener('change', function() {
            validateDateInput(this);
        });
        
        // Add Persian date display
        if (input.dataset.persianDatepicker === 'true') {
            addPersianDateDisplay(input);
        }
    });
}

/**
 * Add Persian date display alongside Gregorian date input
 */
function addPersianDateDisplay(input) {
    if (input.nextElementSibling?.classList.contains('persian-date-display')) {
        return; // Already added
    }
    
    const display = document.createElement('div');
    display.className = 'persian-date-display text-muted small mt-1';
    display.style.fontSize = '0.8rem';
    
    function updatePersianDisplay() {
        if (input.value) {
            try {
                const gregorianDate = new Date(input.value);
                const persianDate = convertToPersianDate(gregorianDate);
                display.textContent = `تاریخ شمسی: ${persianDate}`;
            } catch (e) {
                display.textContent = '';
            }
        } else {
            display.textContent = '';
        }
    }
    
    input.addEventListener('change', updatePersianDisplay);
    input.parentNode.insertBefore(display, input.nextSibling);
    updatePersianDisplay();
}

/**
 * Convert Gregorian date to Persian date string
 */
function convertToPersianDate(gregorianDate) {
    // Simple conversion - in production, use a proper Persian calendar library
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        calendar: 'persian',
        numberingSystem: 'persian'
    };
    
    try {
        return gregorianDate.toLocaleDateString('fa-IR', options);
    } catch (e) {
        // Fallback to basic format
        return gregorianDate.toLocaleDateString('fa-IR');
    }
}

/**
 * Setup invoice calculation features
 */
function setupInvoiceCalculations() {
    // Find invoice forms
    const invoiceForms = document.querySelectorAll('#invoiceForm, form[action*="invoice"]');
    
    invoiceForms.forEach(form => {
        setupInvoiceFormCalculations(form);
    });
}

/**
 * Setup calculations for invoice form
 */
function setupInvoiceFormCalculations(form) {
    const itemsTable = form.querySelector('#invoiceItemsTable, .invoice-items-table');
    if (!itemsTable) return;
    
    // Add calculation event listeners
    itemsTable.addEventListener('input', function(e) {
        if (e.target.matches('input[name*="quantity"], input[name*="unit_price"], input[name*="discount"]')) {
            calculateLineTotal(e.target);
            calculateInvoiceTotal(form);
        }
    });
    
    // Add delete item functionality
    itemsTable.addEventListener('click', function(e) {
        if (e.target.closest('.remove-item-btn')) {
            e.preventDefault();
            const row = e.target.closest('tr');
            
            // Add animation before removal
            row.classList.add('removing-item');
            setTimeout(() => {
                row.remove();
                calculateInvoiceTotal(form);
                
                // Show empty state if no items left
                const remainingRows = itemsTable.querySelectorAll('tbody tr');
                if (remainingRows.length === 0) {
                    addEmptyInvoiceItemRow(itemsTable);
                }
            }, 300);
        }
    });
}

/**
 * Calculate line total for invoice item
 */
function calculateLineTotal(input) {
    const row = input.closest('tr');
    if (!row) return;
    
    const quantity = parseFloat(row.querySelector('input[name*="quantity"]')?.value) || 0;
    const unitPrice = parseFloat(row.querySelector('input[name*="unit_price"]')?.value) || 0;
    const discount = parseFloat(row.querySelector('input[name*="discount"]')?.value) || 0;
    
    const lineTotal = (quantity * unitPrice) - discount;
    const lineTotalElement = row.querySelector('.line-total, input[name*="line_total"]');
    
    if (lineTotalElement) {
        if (lineTotalElement.tagName === 'INPUT') {
            lineTotalElement.value = lineTotal.toFixed(0);
        } else {
            lineTotalElement.textContent = formatNumber(lineTotal);
        }
    }
}

/**
 * Calculate invoice total
 */
function calculateInvoiceTotal(form) {
    const rows = form.querySelectorAll('#invoiceItemsTable tbody tr, .invoice-items-table tbody tr');
    let subtotal = 0;
    let totalDiscount = 0;
    
    rows.forEach(row => {
        const quantity = parseFloat(row.querySelector('input[name*="quantity"]')?.value) || 0;
        const unitPrice = parseFloat(row.querySelector('input[name*="unit_price"]')?.value) || 0;
        const discount = parseFloat(row.querySelector('input[name*="discount"]')?.value) || 0;
        
        subtotal += quantity * unitPrice;
        totalDiscount += discount;
    });
    
    const afterDiscount = subtotal - totalDiscount;
    const tax = Math.round(afterDiscount * 0.09); // 9% tax
    const total = afterDiscount + tax;
    
    // Update summary elements
    updateSummaryElement(form, '.subtotal', subtotal);
    updateSummaryElement(form, '.total-discount', totalDiscount);
    updateSummaryElement(form, '.tax-amount', tax);
    updateSummaryElement(form, '.total-amount', total);
}

/**
 * Update summary element with calculated value
 */
function updateSummaryElement(form, selector, value) {
    const element = form.querySelector(selector);
    if (element) {
        if (element.tagName === 'INPUT') {
            element.value = value.toFixed(0);
        } else {
            element.textContent = formatNumber(value);
        }
    }
}

/**
 * Add empty row to invoice items table
 */
function addEmptyInvoiceItemRow(table) {
    const tbody = table.querySelector('tbody');
    const emptyRow = document.createElement('tr');
    emptyRow.className = 'empty-state-row';
    emptyRow.innerHTML = `
        <td colspan="6" class="text-center text-muted py-4">
            <i class="fas fa-plus-circle fa-2x mb-2"></i>
            <p>هیچ قلمی اضافه نشده است</p>
            <button type="button" class="btn btn-outline-primary btn-sm" onclick="addInvoiceItem()">
                <i class="fas fa-plus"></i> افزودن قلم جدید
            </button>
        </td>
    `;
    tbody.appendChild(emptyRow);
}

/**
 * Setup number formatting for currency fields
 */
function setupNumberFormatting() {
    const numberInputs = document.querySelectorAll('input[name*="price"], input[name*="amount"], input[name*="total"], .number-format');
    
    numberInputs.forEach(input => {
        // Format on blur
        input.addEventListener('blur', function() {
            if (this.value) {
                const numericValue = parseFloat(this.value.replace(/[^\d.-]/g, ''));
                if (!isNaN(numericValue)) {
                    this.value = numericValue.toFixed(0);
                }
            }
        });
        
        // Only allow numbers
        input.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^\d.-]/g, '');
        });
    });
}

/**
 * Enhanced form validation
 */
function setupFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
                return false;
            }
        });
    });
}

/**
 * Validate form inputs
 */
function validateForm(form) {
    let isValid = true;
    const errors = [];
    
    // Check required fields
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            errors.push(`فیلد "${getFieldLabel(field)}" اجباری است`);
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    // Validate invoice items
    if (form.id === 'invoiceForm') {
        const itemRows = form.querySelectorAll('#invoiceItemsTable tbody tr:not(.empty-state-row)');
        if (itemRows.length === 0) {
            errors.push('حداقل یک قلم باید به فاکتور اضافه شود');
            isValid = false;
        }
    }
    
    // Show errors if any
    if (errors.length > 0) {
        showValidationErrors(errors);
    }
    
    return isValid;
}

/**
 * Get label text for a field
 */
function getFieldLabel(field) {
    const label = document.querySelector(`label[for="${field.id}"]`);
    return label ? label.textContent.replace('*', '').trim() : field.placeholder || field.name;
}

/**
 * Show validation errors
 */
function showValidationErrors(errors) {
    const errorHtml = errors.map(error => `<li>${error}</li>`).join('');
    showAlert(`
        <strong>خطاهای اعتبارسنجی:</strong>
        <ul class="mb-0 mt-2">${errorHtml}</ul>
    `, 'error');
}

/**
 * Setup form submission states
 */
function setupFormSubmissionStates() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = this.querySelector('button[type="submit"], input[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                const originalText = submitBtn.innerHTML || submitBtn.value;
                submitBtn.disabled = true;
                
                if (submitBtn.tagName === 'BUTTON') {
                    submitBtn.innerHTML = '<span class="loading-spinner"></span> در حال ذخیره...';
                } else {
                    submitBtn.value = 'در حال ذخیره...';
                }
                
                // Reset after timeout in case of network issues
                setTimeout(() => {
                    submitBtn.disabled = false;
                    if (submitBtn.tagName === 'BUTTON') {
                        submitBtn.innerHTML = originalText;
                    } else {
                        submitBtn.value = originalText;
                    }
                }, 10000);
            }
        });
    });
}

/**
 * Initialize calculation fields (for compatibility)
 */
function initializeCalculationFields() {
    // Legacy support for existing calculation functions
    window.calculateLineTotal = calculateLineTotal;
    window.calculateInvoiceTotal = calculateInvoiceTotal;
}

// Export functions for global use
window.setupEnhancedDateInputs = setupEnhancedDateInputs;
window.calculateLineTotal = calculateLineTotal;
window.calculateInvoiceTotal = calculateInvoiceTotal;
window.validateForm = validateForm;