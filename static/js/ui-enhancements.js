/**
 * UI Enhancements for Persian Accounting System
 * Back Button, Persian Calendar, Currency Formatting
 */

// ===== 1. Back Button Functionality =====
class AccountingBackButtonManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupBackButtons();
        this.setupBreadcrumbs();
    }

    setupBackButtons() {
        // Add back button to pages that need it
        const backButtonSelectors = [
            '.card-header:has(h3, h4, h5)',
            '.page-header',
            '.content-header'
        ];

        backButtonSelectors.forEach(selector => {
            const headers = document.querySelectorAll(selector);
            headers.forEach(header => {
                if (!header.querySelector('.back-button') && this.shouldAddBackButton()) {
                    this.addBackButton(header);
                }
            });
        });
    }

    shouldAddBackButton() {
        // Don't add back button on main pages
        const currentPath = window.location.pathname;
        const mainPages = ['/', '/dashboard', '/login', '/logout'];
        return !mainPages.includes(currentPath) && !currentPath.endsWith('/list') && !currentPath.endsWith('/');
    }

    addBackButton(container) {
        const backButton = document.createElement('button');
        backButton.className = 'btn btn-outline-secondary btn-sm back-button me-2';
        backButton.innerHTML = '<i class="fas fa-arrow-right"></i> بازگشت';
        backButton.setAttribute('title', 'بازگشت به صفحه قبل');
        
        backButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.goBack();
        });

        // Insert at the beginning of the container
        container.insertBefore(backButton, container.firstChild);
    }

    goBack() {
        // Try to go back in history, with fallback
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // Fallback to dashboard
            window.location.href = '/dashboard';
        }
    }

    setupBreadcrumbs() {
        // Auto-generate breadcrumbs if they don't exist
        const existingBreadcrumbs = document.querySelector('.breadcrumb');
        if (!existingBreadcrumbs) {
            this.generateBreadcrumbs();
        }
    }

    generateBreadcrumbs() {
        const path = window.location.pathname;
        const pathParts = path.split('/').filter(part => part !== '');
        
        if (pathParts.length === 0) return;

        const breadcrumbsContainer = document.createElement('nav');
        breadcrumbsContainer.setAttribute('aria-label', 'breadcrumb');
        breadcrumbsContainer.className = 'mb-3';

        const breadcrumbsList = document.createElement('ol');
        breadcrumbsList.className = 'breadcrumb';

        // Add home
        const homeItem = document.createElement('li');
        homeItem.className = 'breadcrumb-item';
        homeItem.innerHTML = '<a href="/dashboard"><i class="fas fa-home"></i> داشبورد</a>';
        breadcrumbsList.appendChild(homeItem);

        // Add path parts
        const pathNames = {
            'customers': 'مشتریان',
            'products': 'محصولات',
            'orders': 'سفارشات',
            'invoices': 'فاکتورها',
            'reports': 'گزارشات',
            'settings': 'تنظیمات',
            'add': 'اضافه کردن',
            'edit': 'ویرایش',
            'view': 'مشاهده'
        };

        let currentPath = '';
        pathParts.forEach((part, index) => {
            currentPath += '/' + part;
            const isLast = index === pathParts.length - 1;
            
            const item = document.createElement('li');
            item.className = `breadcrumb-item ${isLast ? 'active' : ''}`;
            
            const displayName = pathNames[part] || part;
            
            if (isLast) {
                item.textContent = displayName;
                item.setAttribute('aria-current', 'page');
            } else {
                item.innerHTML = `<a href="${currentPath}">${displayName}</a>`;
            }
            
            breadcrumbsList.appendChild(item);
        });

        breadcrumbsContainer.appendChild(breadcrumbsList);

        // Insert breadcrumbs after navbar or at the beginning of main content
        const mainContent = document.querySelector('main, .container-fluid, .container');
        if (mainContent && mainContent.children.length > 0) {
            mainContent.insertBefore(breadcrumbsContainer, mainContent.firstChild);
        }
    }
}

// ===== 2. Persian Calendar Integration =====
class AccountingPersianCalendarManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupPersianDatePickers();
        this.setupDateConversions();
    }

    setupPersianDatePickers() {
        // Find all date inputs that should have Persian calendar
        const dateInputs = document.querySelectorAll('input[type="date"], input[data-persian="true"]');
        
        dateInputs.forEach(input => {
            this.convertToPersianDatePicker(input);
        });
    }

    convertToPersianDatePicker(input) {
        // Create a wrapper for the Persian date picker
        const wrapper = document.createElement('div');
        wrapper.className = 'persian-datepicker-wrapper position-relative';
        
        // Create Persian input
        const persianInput = document.createElement('input');
        persianInput.type = 'text';
        persianInput.className = input.className + ' persian-date-input';
        persianInput.placeholder = 'انتخاب تاریخ شمسی...';
        persianInput.setAttribute('readonly', 'true');
        
        // Hide original input but keep it for form submission
        input.style.display = 'none';
        
        // Insert wrapper and Persian input
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(persianInput);
        wrapper.appendChild(input);
        
        // Add calendar icon
        const calendarIcon = document.createElement('button');
        calendarIcon.type = 'button';
        calendarIcon.className = 'btn btn-outline-secondary persian-calendar-btn';
        calendarIcon.innerHTML = '<i class="fas fa-calendar-alt"></i>';
        calendarIcon.setAttribute('title', 'انتخاب تاریخ شمسی');
        
        wrapper.appendChild(calendarIcon);
        
        // Setup click handlers
        [persianInput, calendarIcon].forEach(element => {
            element.addEventListener('click', () => {
                this.showPersianCalendar(input, persianInput);
            });
        });
        
        // Initialize with current value if exists
        if (input.value) {
            this.updatePersianDisplay(input, persianInput);
        } else {
            // Set to today's date
            const today = new Date();
            const persianToday = this.convertToPersian(today);
            persianInput.value = persianToday;
            input.value = today.toISOString().split('T')[0];
        }
    }

    showPersianCalendar(hiddenInput, displayInput) {
        // Simple Persian calendar implementation
        // For a full implementation, you would use a library like persian-datepicker
        const modal = this.createCalendarModal(hiddenInput, displayInput);
        document.body.appendChild(modal);
        
        // Show modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        // Remove modal when hidden
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }

    createCalendarModal(hiddenInput, displayInput) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">انتخاب تاریخ شمسی</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-4">
                                <label class="form-label">سال</label>
                                <select class="form-control persian-year" id="persianYear">
                                    ${this.generateYearOptions()}
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">ماه</label>
                                <select class="form-control persian-month" id="persianMonth">
                                    ${this.generateMonthOptions()}
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">روز</label>
                                <select class="form-control persian-day" id="persianDay">
                                    ${this.generateDayOptions()}
                                </select>
                            </div>
                        </div>
                        <div class="mt-3 text-center">
                            <button type="button" class="btn btn-secondary" id="todayBtn">امروز</button>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">انصراف</button>
                        <button type="button" class="btn btn-primary" id="selectDateBtn">انتخاب</button>
                    </div>
                </div>
            </div>
        `;

        // Setup event handlers
        modal.addEventListener('shown.bs.modal', () => {
            this.setupCalendarEvents(modal, hiddenInput, displayInput);
        });

        return modal;
    }

    setupCalendarEvents(modal, hiddenInput, displayInput) {
        const yearSelect = modal.querySelector('#persianYear');
        const monthSelect = modal.querySelector('#persianMonth');
        const daySelect = modal.querySelector('#persianDay');
        const todayBtn = modal.querySelector('#todayBtn');
        const selectBtn = modal.querySelector('#selectDateBtn');

        // Set current values
        const currentDate = hiddenInput.value ? new Date(hiddenInput.value) : new Date();
        const persianDate = this.convertToPersianObject(currentDate);
        
        yearSelect.value = persianDate.year;
        monthSelect.value = persianDate.month;
        daySelect.value = persianDate.day;

        // Today button
        todayBtn.addEventListener('click', () => {
            const today = new Date();
            const todayPersian = this.convertToPersianObject(today);
            yearSelect.value = todayPersian.year;
            monthSelect.value = todayPersian.month;
            daySelect.value = todayPersian.day;
        });

        // Select button
        selectBtn.addEventListener('click', () => {
            const selectedPersian = {
                year: parseInt(yearSelect.value),
                month: parseInt(monthSelect.value),
                day: parseInt(daySelect.value)
            };
            
            const gregorianDate = this.convertToGregorian(selectedPersian);
            const persianString = this.formatPersianDate(selectedPersian);
            
            hiddenInput.value = gregorianDate.toISOString().split('T')[0];
            displayInput.value = persianString;
            
            bootstrap.Modal.getInstance(modal).hide();
        });
    }

    generateYearOptions() {
        const currentYear = new Date().getFullYear();
        const currentPersianYear = currentYear - 621; // Approximate conversion
        let options = '';
        
        for (let i = currentPersianYear - 10; i <= currentPersianYear + 5; i++) {
            options += `<option value="${i}">${this.convertToPersianNumbers(i)}</option>`;
        }
        
        return options;
    }

    generateMonthOptions() {
        const months = [
            'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
            'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
        ];
        
        return months.map((month, index) => 
            `<option value="${index + 1}">${month}</option>`
        ).join('');
    }

    generateDayOptions() {
        let options = '';
        for (let i = 1; i <= 31; i++) {
            options += `<option value="${i}">${this.convertToPersianNumbers(i)}</option>`;
        }
        return options;
    }

    convertToPersian(date) {
        // Simplified conversion - in production use a proper library
        const options = { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            calendar: 'persian',
            locale: 'fa-IR'
        };
        
        try {
            return new Intl.DateTimeFormat('fa-IR-u-ca-persian', options).format(date);
        } catch (e) {
            // Fallback
            return date.toLocaleDateString('fa-IR');
        }
    }

    convertToPersianObject(date) {
        // Simplified conversion
        const persianString = this.convertToPersian(date);
        const parts = persianString.split('/');
        return {
            year: parseInt(parts[0]),
            month: parseInt(parts[1]),
            day: parseInt(parts[2])
        };
    }

    convertToGregorian(persianDate) {
        // Simplified conversion - in production use a proper library
        // This is approximate and should be replaced with a proper conversion
        const gregorianYear = persianDate.year + 621;
        return new Date(gregorianYear, persianDate.month - 1, persianDate.day);
    }

    formatPersianDate(persianDate) {
        const months = [
            'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
            'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
        ];
        
        return `${this.convertToPersianNumbers(persianDate.day)} ${months[persianDate.month - 1]} ${this.convertToPersianNumbers(persianDate.year)}`;
    }

    convertToPersianNumbers(num) {
        const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
        return num.toString().replace(/\d/g, digit => persianDigits[digit]);
    }

    updatePersianDisplay(hiddenInput, displayInput) {
        if (hiddenInput.value) {
            const date = new Date(hiddenInput.value);
            displayInput.value = this.convertToPersian(date);
        }
    }

    setupDateConversions() {
        // Add Persian date display to existing date inputs
        const existingDateInputs = document.querySelectorAll('input[type="date"]:not(.persian-date-input)');
        existingDateInputs.forEach(input => {
            if (!input.nextElementSibling?.classList.contains('persian-date-display')) {
                this.addPersianDateDisplay(input);
            }
        });
    }

    addPersianDateDisplay(input) {
        const display = document.createElement('div');
        display.className = 'persian-date-display text-muted small mt-1';
        display.style.fontSize = '0.8rem';
        
        const updateDisplay = () => {
            if (input.value) {
                const date = new Date(input.value);
                display.textContent = `تاریخ شمسی: ${this.convertToPersian(date)}`;
            } else {
                display.textContent = '';
            }
        };
        
        input.addEventListener('change', updateDisplay);
        input.parentNode.insertBefore(display, input.nextSibling);
        
        // Initial update
        updateDisplay();
    }
}

// ===== 3. Currency Formatting Manager =====
class AccountingCurrencyFormatter {
    constructor() {
        this.defaultCurrency = 'ریال';
        this.init();
    }

    init() {
        this.setupCurrencyFormatting();
        this.setupRealTimeFormatting();
    }

    setupCurrencyFormatting() {
        // Format existing currency displays
        const currencySelectors = [
            '.currency',
            '.price',
            '.amount',
            '[data-currency]',
            'td:contains("ریال")',
            'td:contains("تومان")'
        ];

        currencySelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => this.formatElement(el));
            } catch (e) {
                // Skip invalid selectors
            }
        });

        // Format table cells that look like currency
        this.formatTableCurrencies();
    }

    formatTableCurrencies() {
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                cells.forEach(cell => {
                    if (this.looksLikeCurrency(cell.textContent)) {
                        this.formatCurrencyCell(cell);
                    }
                });
            });
        });
    }

    looksLikeCurrency(text) {
        // Check if text looks like a currency value
        const cleanText = text.trim();
        return /^\d{1,3}(,\d{3})*$/.test(cleanText) || // Formatted numbers
               /^\d+$/.test(cleanText) ||                // Plain numbers
               cleanText.includes('ریال') ||
               cleanText.includes('تومان');
    }

    formatCurrencyCell(cell) {
        const text = cell.textContent.trim();
        const numbers = text.match(/\d+/g);
        
        if (numbers && numbers.length > 0) {
            const amount = parseInt(numbers.join(''));
            if (!isNaN(amount)) {
                const currency = text.includes('تومان') ? 'تومان' : 'ریال';
                cell.textContent = this.formatCurrency(amount, currency);
                cell.classList.add('currency-formatted');
            }
        }
    }

    formatElement(element) {
        const text = element.textContent.trim();
        const amount = this.extractAmount(text);
        
        if (amount !== null) {
            const currency = this.extractCurrency(text) || this.defaultCurrency;
            element.textContent = this.formatCurrency(amount, currency);
            element.classList.add('currency-formatted');
        }
    }

    extractAmount(text) {
        const match = text.match(/(\d{1,3}(?:,\d{3})*|\d+)/);
        if (match) {
            return parseInt(match[1].replace(/,/g, ''));
        }
        return null;
    }

    extractCurrency(text) {
        if (text.includes('تومان')) return 'تومان';
        if (text.includes('ریال')) return 'ریال';
        return null;
    }

    formatCurrency(amount, currency = 'ریال') {
        if (typeof amount !== 'number' || isNaN(amount)) return '0 ریال';
        
        const formattedAmount = amount.toLocaleString('fa-IR');
        return `${formattedAmount} ${currency}`;
    }

    setupRealTimeFormatting() {
        // Setup real-time formatting for input fields
        const currencyInputs = document.querySelectorAll('input[data-currency="true"], input[name*="price"], input[name*="amount"]');
        
        currencyInputs.forEach(input => {
            this.setupCurrencyInput(input);
        });
    }

    setupCurrencyInput(input) {
        // Add currency suffix
        const wrapper = document.createElement('div');
        wrapper.className = 'input-group';
        
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        
        const suffix = document.createElement('span');
        suffix.className = 'input-group-text';
        suffix.textContent = input.dataset.currency || this.defaultCurrency;
        wrapper.appendChild(suffix);
        
        // Format on input
        input.addEventListener('input', (e) => {
            this.formatInputValue(e.target);
        });
        
        // Initial format
        this.formatInputValue(input);
    }

    formatInputValue(input) {
        let value = input.value.replace(/[^\d]/g, '');
        if (value) {
            const number = parseInt(value);
            input.value = number.toLocaleString('fa-IR');
        }
    }

    // Static helper method for global use
    static format(amount, currency = 'ریال') {
        if (typeof amount !== 'number' || isNaN(amount)) return '0 ریال';
        return `${amount.toLocaleString('fa-IR')} ${currency}`;
    }
}

// ===== Auto-initialization =====
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize all managers
        window.backButtonManager = new AccountingBackButtonManager();
        window.persianCalendarManager = new AccountingPersianCalendarManager();
        window.currencyFormatter = new AccountingCurrencyFormatter();
        
        console.log('UI Enhancements initialized successfully');
    } catch (error) {
        console.error('Error initializing UI enhancements:', error);
    }
});

// Global helper functions
window.formatCurrency = (amount, currency = 'ریال') => {
    return AccountingCurrencyFormatter.format(amount, currency);
};

window.goBack = () => {
    if (window.backButtonManager) {
        window.backButtonManager.goBack();
    } else {
        window.history.back();
    }
};