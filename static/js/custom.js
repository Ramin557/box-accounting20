/**
 * Persian Accounting System - Custom JavaScript
 * Enhanced with accessibility and UX improvements
 */

// Global variables
var darkMode = localStorage.getItem('darkMode') === 'true';

/**
 * Initialize all components when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    initializePersianDatePickers();
    setupFormValidation();
    initializeDropdowns();
    fixChartDisplay();
    addCurrentPersianDate();
    
    // New accessibility and UX features
    enhanceDeleteButtons();
    initializeLoadingStates();
    setupEmptyStates();
    setupAccessibleForms();
    initializeNumberFormatting();
    setupKeyboardNavigation();
    
    // Initialize dropdowns
    initializeDropdowns();
});


/**
 * Initialize dropdowns
 */
function initializeDropdowns() {
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const dropdownMenu = this.nextElementSibling;
            
            // Close other dropdowns
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                if (menu !== dropdownMenu) {
                    menu.classList.remove('show');
                    const otherToggle = menu.previousElementSibling;
                    if (otherToggle) {
                        otherToggle.setAttribute('aria-expanded', 'false');
                    }
                }
            });
            
            // Toggle current dropdown
            if (dropdownMenu) {
                dropdownMenu.classList.toggle('show');
                this.setAttribute('aria-expanded', dropdownMenu.classList.contains('show'));
            }
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            const openDropdowns = document.querySelectorAll('.dropdown-menu.show');
            openDropdowns.forEach(dropdown => {
                dropdown.classList.remove('show');
                const toggle = dropdown.previousElementSibling;
                if (toggle && toggle.classList.contains('dropdown-toggle')) {
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });
        }
    });
}

/**
 * Fix chart display issues
 */
function fixChartDisplay() {
    const performanceChartElement = document.getElementById('performanceChart');
    if (performanceChartElement && typeof Chart !== 'undefined') {
        performanceChartElement.style.height = '250px';
        Chart.defaults.font.family = "'Vazir', 'IRANSans', sans-serif";
        Chart.defaults.font.size = 12;
    }
}

/**
 * Setup form validation
 */
function setupFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
                
                const invalidFields = form.querySelectorAll(':invalid');
                invalidFields.forEach(field => {
                    field.classList.add('is-invalid');
                    
                    field.addEventListener('input', function() {
                        if (this.checkValidity()) {
                            this.classList.remove('is-invalid');
                        }
                    });
                });
            }
            
            form.classList.add('was-validated');
        });
    });
}

/**
 * Initialize Persian Date Pickers
 */
function initializePersianDatePickers() {
    const dateInputs = document.querySelectorAll('input[data-persian-datepicker="true"], input[type="date"]');
    
    dateInputs.forEach(input => {
        initializeMdPersianDateTimePicker(input);
    });
    
    const dateRangeInputs = document.querySelectorAll('input[name*="from_date"], input[name*="to_date"], input[name*="start_date"], input[name*="end_date"]');
    
    dateRangeInputs.forEach(input => {
        if (input.getAttribute('data-persian-datepicker') === 'true') {
            return;
        }
        
        initializeMdPersianDateTimePicker(input);
    });
}

/**
 * Initialize MD Bootstrap Persian DateTime Picker for a specific input
 */
function initializeMdPersianDateTimePicker(input) {
    if (input.hasAttribute('data-md-picker-initialized')) {
        return;
    }
    input.setAttribute('data-md-picker-initialized', 'true');
    
    input.type = 'text';
    input.placeholder = 'انتخاب تاریخ شمسی';
    input.dir = 'rtl';
    input.readOnly = true;
    input.style.cursor = 'pointer';
    
    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group';
    input.parentNode.insertBefore(inputGroup, input);
    inputGroup.appendChild(input);
    
    const inputGroupText = document.createElement('span');
    inputGroupText.className = 'input-group-text';
    inputGroupText.innerHTML = '<i class="fas fa-calendar-alt"></i>';
    inputGroup.appendChild(inputGroupText);
    
    if (typeof $ !== 'undefined' && $.fn.MdPersianDateTimePicker) {
        $(input).MdPersianDateTimePicker({
            targetTextSelector: input,
            englishNumber: true,
            textFormat: 'yyyy-MM-dd',
            isGregorian: false,
            selectedDateToShow: new Date(),
            holidayList: [
                { month: 1, day: 1, title: "نوروز" },
                { month: 1, day: 2, title: "نوروز" },
                { month: 1, day: 3, title: "نوروز" },
                { month: 1, day: 4, title: "نوروز" },
                { month: 1, day: 12, title: "روز جمهوری اسلامی" },
                { month: 1, day: 13, title: "روز طبیعت (سیزده بدر)" },
                { month: 2, day: 11, title: "پیروزی انقلاب اسلامی" },
                { month: 3, day: 14, title: "رحلت امام خمینی" },
                { month: 3, day: 15, title: "قیام ۱۵ خرداد" }
            ],
            modalMode: true,
            placement: 'bottom',
            rangeSelector: false,
            enableTimePicker: false
        });
    }
}

/**
 * Enhance delete buttons for better accessibility
 */
function enhanceDeleteButtons() {
    const deleteElements = document.querySelectorAll('.delete-btn, [class*="delete"]');
    
    deleteElements.forEach(element => {
        // If it's a div, convert it to a proper button
        if (element.tagName === 'DIV') {
            const button = document.createElement('button');
            button.className = element.className;
            button.innerHTML = element.innerHTML;
            button.type = 'button';
            
            // Copy onclick handler if exists
            if (element.onclick) {
                button.onclick = element.onclick;
            }
            
            // Add proper ARIA attributes
            const itemText = element.closest('tr') ? 
                element.closest('tr').querySelector('td:first-child')?.textContent : 
                'آیتم';
            button.setAttribute('aria-label', `حذف ${itemText}`);
            button.setAttribute('title', `حذف ${itemText}`);
            
            element.parentNode.replaceChild(button, element);
        } else if (element.tagName === 'BUTTON' || element.tagName === 'A') {
            // Enhance existing buttons
            if (!element.getAttribute('aria-label')) {
                const itemText = element.closest('tr') ? 
                    element.closest('tr').querySelector('td:first-child')?.textContent : 
                    'آیتم';
                element.setAttribute('aria-label', `حذف ${itemText}`);
                element.setAttribute('title', `حذف ${itemText}`);
            }
        }
    });
}

/**
 * Initialize loading states for better UX
 */
function initializeLoadingStates() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
            if (submitButton) {
                const originalText = submitButton.textContent || submitButton.value;
                submitButton.disabled = true;
                
                if (submitButton.tagName === 'BUTTON') {
                    submitButton.innerHTML = '<span class="loading-spinner"></span> در حال پردازش...';
                } else {
                    submitButton.value = 'در حال پردازش...';
                }
                
                // Reset after 5 seconds in case of network issues
                setTimeout(() => {
                    submitButton.disabled = false;
                    if (submitButton.tagName === 'BUTTON') {
                        submitButton.textContent = originalText;
                    } else {
                        submitButton.value = originalText;
                    }
                }, 5000);
            }
        });
    });
}

/**
 * Setup empty states for better UX
 */
function setupEmptyStates() {
    const tables = document.querySelectorAll('table tbody');
    
    tables.forEach(tbody => {
        if (tbody.children.length === 0 || 
            (tbody.children.length === 1 && tbody.children[0].textContent.trim() === '')) {
            
            const emptyState = document.createElement('tr');
            emptyState.className = 'empty-state-row';
            emptyState.innerHTML = `
                <td colspan="100%" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h5>اطلاعاتی برای نمایش وجود ندارد</h5>
                    <p>هنوز هیچ رکوردی ثبت نشده است. اولین مورد خود را اضافه کنید.</p>
                </td>
            `;
            tbody.appendChild(emptyState);
        }
    });
}

/**
 * Setup accessible forms with proper labels
 */
function setupAccessibleForms() {
    const inputs = document.querySelectorAll('input:not([aria-label]):not([id])');
    
    inputs.forEach((input, index) => {
        // Add ID if missing
        if (!input.id) {
            input.id = `input-${index}`;
        }
        
        // Create label if missing and input has placeholder
        if (input.placeholder && !document.querySelector(`label[for="${input.id}"]`)) {
            const label = document.createElement('label');
            label.htmlFor = input.id;
            label.className = 'sr-only';
            label.textContent = input.placeholder;
            input.parentNode.insertBefore(label, input);
        }
        
        // Add aria-label if still missing
        if (!input.getAttribute('aria-label') && input.placeholder) {
            input.setAttribute('aria-label', input.placeholder);
        }
    });
}

/**
 * Initialize number formatting for Persian locale
 */
function initializeNumberFormatting() {
    const numberElements = document.querySelectorAll('.number-format, .price, .amount');
    
    numberElements.forEach(element => {
        const value = parseFloat(element.textContent.replace(/[^\d.-]/g, ''));
        if (!isNaN(value)) {
            element.textContent = formatNumber(value);
        }
    });
}

/**
 * Format numbers in Persian locale
 */
function formatNumber(number) {
    return new Intl.NumberFormat('fa-IR').format(number);
}

/**
 * Setup keyboard navigation improvements
 */
function setupKeyboardNavigation() {
    // Enhanced focus management
    const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid #0d6efd';
            this.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = '';
            this.style.outlineOffset = '';
        });
    });
    
    // Add keyboard shortcuts for common actions
    document.addEventListener('keydown', function(e) {
        // Ctrl+N for new items
        if (e.ctrlKey && e.key === 'n') {
            const addButton = document.querySelector('.btn-primary[href*="add"], .btn-primary[href*="new"]');
            if (addButton) {
                e.preventDefault();
                addButton.click();
            }
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                const closeButton = openModal.querySelector('[data-bs-dismiss="modal"]');
                if (closeButton) {
                    closeButton.click();
                }
            }
        }
    });
}

/**
 * Add smooth animations to table rows
 */
function animateTableRows() {
    const newRows = document.querySelectorAll('tr.new-item');
    newRows.forEach(row => {
        row.classList.add('new-item');
        setTimeout(() => {
            row.classList.remove('new-item');
        }, 400);
    });
}

/**
 * Enhanced delete confirmation with accessibility
 */
function confirmDelete(message, itemName) {
    return new Promise((resolve) => {
        const confirmed = confirm(`${message}\n\nآیا از حذف "${itemName}" مطمئن هستید؟`);
        resolve(confirmed);
    });
}

/**
 * Add current Persian date to the page header
 */
function addCurrentPersianDate() {
    const header = document.querySelector('.d-flex.justify-content-between.align-items-center');
    if (header && !document.querySelector('.current-persian-date')) {
        const dateElement = document.createElement('div');
        dateElement.className = 'current-persian-date text-muted small';
        dateElement.style.direction = 'rtl';
        
        if (typeof persianDate !== 'undefined') {
            const today = new persianDate();
            dateElement.textContent = today.format('dddd، DD MMMM YYYY');
            
            const rightDiv = header.querySelector('div:last-child');
            if (rightDiv) {
                rightDiv.appendChild(dateElement);
            }
        }
    }
}

/**
 * Utility functions
 */

// Format numbers with Persian separators
function formatPersianNumber(number) {
    return number.toString().replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' ریال';
}

// Show loading spinner
function showLoading(element) {
    if (element) {
        element.innerHTML = '<div class="spinner-border spinner-border-sm" role="status"></div>';
    }
}

// Hide loading spinner
function hideLoading(element, originalText) {
    if (element) {
        element.innerHTML = originalText || 'تأیید';
    }
}

// Show alert message
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container');
    if (alertContainer) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        alertContainer.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
}

// Export functions for global use
window.toggleDarkMode = toggleDarkMode;
window.showAlert = showAlert;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.formatCurrency = formatCurrency;
window.formatPersianNumber = formatPersianNumber;

function confirmDelete(url) {
    if (confirm("آیا از حذف این مورد اطمینان دارید؟")) {
        window.location.href = url;
    }
}
// End of file