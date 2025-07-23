/**
 * Complete Persian Localization System
 * Converts all remaining English text to Persian and optimizes performance
 */

class PersianLocalization {
    constructor() {
        this.translations = {
            // User roles translation
            'Admin': 'مدیر',
            'Editor': 'ویرایشگر', 
            'Author': 'نویسنده',
            'Accountant': 'حسابدار',
            'Employee': 'کارمند',
            'Manager': 'سرپرست',
            'Super Admin': 'مدیر ارشد',
            'Sales Person': 'فروشنده',
            'Warehouse Manager': 'مدیر انبار',
            
            // Common UI elements
            'Loading...': 'در حال بارگذاری...',
            'Search...': 'جستجو...',
            'Save': 'ذخیره',
            'Cancel': 'انصراف',
            'Edit': 'ویرایش',
            'Delete': 'حذف',
            'Add': 'افزودن',
            'Submit': 'ارسال',
            'Reset': 'پاک کردن',
            'Update': 'بروزرسانی',
            'Create': 'ایجاد',
            'View': 'مشاهده',
            'Close': 'بستن',
            'Back': 'بازگشت',
            'Next': 'بعدی',
            'Previous': 'قبلی',
            'First': 'اول',
            'Last': 'آخر',
            
            // Table headers
            'Name': 'نام',
            'Email': 'ایمیل',
            'Phone': 'تلفن',
            'Address': 'آدرس',
            'Status': 'وضعیت',
            'Date': 'تاریخ',
            'Amount': 'مبلغ',
            'Description': 'توضیحات',
            'Actions': 'عملیات',
            'Created': 'ایجاد شده',
            'Updated': 'بروزرسانی شده',
            'Active': 'فعال',
            'Inactive': 'غیرفعال',
            
            // Sample names for tables
            'Albert Cook': 'علی احمدی',
            'Hallie Warner': 'فاطمه کریمی',
            'John Smith': 'محمد رضایی',
            'Mary Johnson': 'زهرا محمدی',
            'David Wilson': 'حسن علوی',
            'Sarah Davis': 'مریم جعفری',
            'Michael Brown': 'رضا نوری',
            'Lisa Anderson': 'سارا قاسمی',
            'James Taylor': 'امیر حسینی',
            'Jessica Martin': 'نازنین صالحی',
            
            // Business terms
            'Customer': 'مشتری',
            'Supplier': 'تامین کننده',
            'Product': 'محصول',
            'Order': 'سفارش',
            'Invoice': 'فاکتور',
            'Payment': 'پرداخت',
            'Transaction': 'تراکنش',
            'Report': 'گزارش',
            'Dashboard': 'داشبورد',
            'Settings': 'تنظیمات',
            
            // Status terms
            'Pending': 'در انتظار',
            'Processing': 'در حال پردازش',
            'Completed': 'تکمیل شده',
            'Cancelled': 'لغو شده',
            'Paid': 'پرداخت شده',
            'Unpaid': 'پرداخت نشده',
            'Overdue': 'سررسید گذشته',
            'Draft': 'پیش نویس',
            'Sent': 'ارسال شده',
            'Received': 'دریافت شده'
        };
        
        this.persianNumbers = {
            '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
            '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹'
        };
        
        this.init();
    }
    
    init() {
        // Run localization when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.localizeContent());
        } else {
            this.localizeContent();
        }
        
        // Watch for dynamic content changes
        this.observeContentChanges();
        
        // Convert numbers to Persian
        this.convertNumbersToPersian();
        
        // Update sample data in tables
        this.updateSampleData();
    }
    
    localizeContent() {
        // Find and replace all English text with Persian equivalents
        this.translateTextNodes(document.body);
        this.translateAttributes();
        this.translateFormElements();
    }
    
    translateTextNodes(element) {
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // Skip script and style tags
                    const parent = node.parentElement;
                    if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    // Only process text nodes with meaningful content
                    if (node.nodeValue.trim().length > 0) {
                        return NodeFilter.FILTER_ACCEPT;
                    }
                    return NodeFilter.FILTER_REJECT;
                }
            }
        );
        
        let node;
        while (node = walker.nextNode()) {
            let text = node.nodeValue.trim();
            
            // Check if this text should be translated
            for (const [english, persian] of Object.entries(this.translations)) {
                if (text.includes(english)) {
                    text = text.replace(new RegExp(english, 'gi'), persian);
                }
            }
            
            // Convert numbers
            text = this.convertTextNumbersToPersian(text);
            
            if (text !== node.nodeValue.trim()) {
                node.nodeValue = text;
            }
        }
    }
    
    translateAttributes() {
        // Translate common attributes like placeholder, title, alt
        const elementsWithPlaceholder = document.querySelectorAll('[placeholder]');
        elementsWithPlaceholder.forEach(element => {
            const placeholder = element.getAttribute('placeholder');
            for (const [english, persian] of Object.entries(this.translations)) {
                if (placeholder.includes(english)) {
                    element.setAttribute('placeholder', placeholder.replace(new RegExp(english, 'gi'), persian));
                }
            }
        });
        
        const elementsWithTitle = document.querySelectorAll('[title]');
        elementsWithTitle.forEach(element => {
            const title = element.getAttribute('title');
            for (const [english, persian] of Object.entries(this.translations)) {
                if (title.includes(english)) {
                    element.setAttribute('title', title.replace(new RegExp(english, 'gi'), persian));
                }
            }
        });
    }
    
    translateFormElements() {
        // Translate button text
        const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"], input[type="reset"]');
        buttons.forEach(button => {
            const text = button.textContent || button.value;
            for (const [english, persian] of Object.entries(this.translations)) {
                if (text.includes(english)) {
                    const newText = text.replace(new RegExp(english, 'gi'), persian);
                    if (button.textContent) {
                        button.textContent = newText;
                    } else {
                        button.value = newText;
                    }
                }
            }
        });
        
        // Translate option text in select elements
        const options = document.querySelectorAll('option');
        options.forEach(option => {
            const text = option.textContent;
            for (const [english, persian] of Object.entries(this.translations)) {
                if (text.includes(english)) {
                    option.textContent = text.replace(new RegExp(english, 'gi'), persian);
                }
            }
        });
    }
    
    convertNumbersToPersian() {
        // Find all elements that should display Persian numbers
        const numberElements = document.querySelectorAll('.persian-number, .stat-card h3, .badge, table td');
        
        numberElements.forEach(element => {
            if (element.textContent) {
                element.textContent = this.convertTextNumbersToPersian(element.textContent);
            }
        });
        
        // Convert numbers in input values
        const numberInputs = document.querySelectorAll('input[type="number"], .persian-number-input');
        numberInputs.forEach(input => {
            if (input.value) {
                input.value = this.convertTextNumbersToPersian(input.value);
            }
        });
    }
    
    convertTextNumbersToPersian(text) {
        return text.replace(/[0-9]/g, (match) => this.persianNumbers[match]);
    }
    
    updateSampleData() {
        // Update sample data in dashboard and tables
        this.updateDashboardData();
        this.updateTableData();
    }
    
    updateDashboardData() {
        // Update "Last Transactions" table in dashboard
        const transactionRows = document.querySelectorAll('table tbody tr');
        const persianTransactions = [
            {
                name: 'علی احمدی',
                amount: '۲,۵۰۰,۰۰۰ ریال',
                date: '۱۴۰۳/۰۲/۱۵',
                status: 'تکمیل شده'
            },
            {
                name: 'فاطمه کریمی', 
                amount: '۱,۸۰۰,۰۰۰ ریال',
                date: '۱۴۰۳/۰۲/۱۴',
                status: 'در انتظار'
            },
            {
                name: 'محمد رضایی',
                amount: '۳,۲۰۰,۰۰۰ ریال', 
                date: '۱۴۰۳/۰۲/۱۳',
                status: 'پرداخت شده'
            },
            {
                name: 'زهرا محمدی',
                amount: '۹۵۰,۰۰۰ ریال',
                date: '۱۴۰۳/۰۲/۱۲', 
                status: 'تکمیل شده'
            },
            {
                name: 'حسن علوی',
                amount: '۴,۱۰۰,۰۰۰ ریال',
                date: '۱۴۰۳/۰۲/۱۱',
                status: 'ارسال شده'
            }
        ];
        
        // Apply to appropriate table rows
        if (transactionRows.length >= 5) {
            transactionRows.forEach((row, index) => {
                if (index < persianTransactions.length) {
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 4) {
                        const transaction = persianTransactions[index];
                        
                        // Update name if it looks like a sample name
                        const nameCell = cells[0];
                        if (nameCell && this.isSampleEnglishName(nameCell.textContent)) {
                            nameCell.textContent = transaction.name;
                        }
                        
                        // Update amount
                        const amountCell = cells[1]; 
                        if (amountCell && /[\d,]+/.test(amountCell.textContent)) {
                            amountCell.textContent = transaction.amount;
                        }
                        
                        // Update date
                        const dateCell = cells[2];
                        if (dateCell && (/\d{4}-\d{2}-\d{2}/.test(dateCell.textContent) || /\d{2}\/\d{2}\/\d{4}/.test(dateCell.textContent))) {
                            dateCell.textContent = transaction.date;
                        }
                        
                        // Update status
                        const statusCell = cells[3];
                        if (statusCell) {
                            const statusBadge = statusCell.querySelector('.badge');
                            if (statusBadge) {
                                statusBadge.textContent = transaction.status;
                            } else {
                                statusCell.textContent = transaction.status;
                            }
                        }
                    }
                }
            });
        }
    }
    
    updateTableData() {
        // Update user tables with Persian names and roles
        const userTables = document.querySelectorAll('table');
        
        userTables.forEach(table => {
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach((row, index) => {
                const cells = row.querySelectorAll('td');
                
                // Check if this looks like a user table (has name, email, role columns)
                if (cells.length >= 3) {
                    const nameCell = cells[0];
                    const emailCell = cells[1]; 
                    const roleCell = cells[2];
                    
                    // Update name if it's a sample English name
                    if (nameCell && this.isSampleEnglishName(nameCell.textContent)) {
                        const persianNames = [
                            'علی احمدی', 'فاطمه کریمی', 'محمد رضایی', 'زهرا محمدی', 'حسن علوی',
                            'مریم جعفری', 'رضا نوری', 'سارا قاسمی', 'امیر حسینی', 'نازنین صالحی'
                        ];
                        if (persianNames[index]) {
                            nameCell.textContent = persianNames[index];
                        }
                    }
                    
                    // Update email domain to Persian company
                    if (emailCell && emailCell.textContent.includes('@')) {
                        const emailParts = emailCell.textContent.split('@');
                        if (emailParts.length === 2) {
                            // Create Persian-friendly email
                            const persianEmails = [
                                'ali.ahmadi@boxcompany.ir',
                                'fatemeh.karimi@boxcompany.ir', 
                                'mohammad.rezaei@boxcompany.ir',
                                'zahra.mohammadi@boxcompany.ir',
                                'hasan.alavi@boxcompany.ir'
                            ];
                            if (persianEmails[index]) {
                                emailCell.textContent = persianEmails[index];
                            }
                        }
                    }
                    
                    // Update role
                    if (roleCell) {
                        const roleBadge = roleCell.querySelector('.badge');
                        const roleText = roleBadge ? roleBadge.textContent : roleCell.textContent;
                        
                        for (const [english, persian] of Object.entries(this.translations)) {
                            if (roleText.includes(english)) {
                                const newRole = roleText.replace(new RegExp(english, 'gi'), persian);
                                if (roleBadge) {
                                    roleBadge.textContent = newRole;
                                } else {
                                    roleCell.textContent = newRole;
                                }
                                break;
                            }
                        }
                    }
                }
            });
        });
    }
    
    isSampleEnglishName(name) {
        const englishNamePattern = /^[A-Za-z\s]+$/;
        const commonEnglishNames = [
            'Albert Cook', 'Hallie Warner', 'John Smith', 'Mary Johnson', 
            'David Wilson', 'Sarah Davis', 'Michael Brown', 'Lisa Anderson',
            'James Taylor', 'Jessica Martin', 'Robert Jones', 'Jennifer White'
        ];
        
        return englishNamePattern.test(name.trim()) || 
               commonEnglishNames.some(commonName => name.includes(commonName));
    }
    
    observeContentChanges() {
        // Watch for dynamically added content
        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                // Localize new content
                                setTimeout(() => {
                                    this.translateTextNodes(node);
                                    this.translateAttributes();
                                    this.convertNumbersToPersian();
                                }, 100);
                            }
                        });
                    }
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }
    
    // Utility method to force refresh localization
    refresh() {
        this.localizeContent();
    }
    
    // Method to add new translations
    addTranslations(newTranslations) {
        Object.assign(this.translations, newTranslations);
        this.localizeContent();
    }
}

// Initialize Persian Localization
window.PersianLocalizationInstance = new PersianLocalization();

// Make it available globally for manual refresh
window.refreshPersianLocalization = () => {
    if (window.PersianLocalizationInstance) {
        window.PersianLocalizationInstance.refresh();
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PersianLocalization;
}