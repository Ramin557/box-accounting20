// Custom Navigation Bar Implementation
class CustomNavigationManager {
    constructor() {
        this.initializeNavigation();
        this.bindEvents();
    }
    
    initializeNavigation() {
        // Set active navigation item based on current URL
        this.setActiveNavItem();
        
        // Initialize dark mode support
        this.updateNavigationTheme();
    }
    
    bindEvents() {
        // Navigation toggle
        window.toggleCustomNav = this.toggleCustomNav.bind(this);
        
        // CRUD operation handlers
        window.showAddModal = this.showAddModal.bind(this);
        window.showEditModal = this.showEditModal.bind(this);
        window.showDeleteModal = this.showDeleteModal.bind(this);
        
        // Theme change listener
        document.addEventListener('themeChanged', () => {
            this.updateNavigationTheme();
        });
    }
    
    toggleCustomNav() {
        const navMenu = document.getElementById('customNavMenu');
        if (navMenu) {
            navMenu.classList.toggle('show');
        }
    }
    
    setActiveNavItem() {
        const currentPath = window.location.pathname;
        const navItems = document.querySelectorAll('.custom-nav-item');
        
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href && currentPath.includes(href.split('/').pop())) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    updateNavigationTheme() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        const nav = document.querySelector('.custom-app-nav');
        
        if (nav) {
            if (isDarkMode) {
                nav.classList.add('dark-theme');
            } else {
                nav.classList.remove('dark-theme');
            }
        }
    }
    
    showAddModal() {
        const currentPage = this.getCurrentPageType();
        
        switch(currentPage) {
            case 'customers':
                this.openModal('#addCustomerModal');
                break;
            case 'products':
                this.openModal('#addProductModal');
                break;
            case 'orders':
                this.openModal('#addOrderModal');
                break;
            case 'invoices':
                this.openModal('#addInvoiceModal');
                break;
            case 'checks':
                this.openModal('#addCheckModal');
                break;
            case 'payments':
                this.openModal('#addReceiptModal');
                break;
            default:
                this.showGenericAddModal();
        }
    }
    
    showEditModal() {
        const selectedItems = this.getSelectedTableItems();
        
        if (selectedItems.length === 0) {
            this.showAlert('لطفاً یک مورد را برای ویرایش انتخاب کنید', 'warning');
            return;
        }
        
        if (selectedItems.length > 1) {
            this.showAlert('لطفاً فقط یک مورد را برای ویرایش انتخاب کنید', 'warning');
            return;
        }
        
        const itemId = selectedItems[0];
        this.editItem(itemId);
    }
    
    showDeleteModal() {
        const selectedItems = this.getSelectedTableItems();
        
        if (selectedItems.length === 0) {
            this.showAlert('لطفاً حداقل یک مورد را برای حذف انتخاب کنید', 'warning');
            return;
        }
        
        this.confirmDelete(selectedItems);
    }
    
    getCurrentPageType() {
        const path = window.location.pathname;
        
        if (path.includes('customers')) return 'customers';
        if (path.includes('products')) return 'products';
        if (path.includes('orders')) return 'orders';
        if (path.includes('invoices')) return 'invoices';
        if (path.includes('checks')) return 'checks';
        if (path.includes('payments') || path.includes('receipts')) return 'payments';
        
        return 'unknown';
    }
    
    getSelectedTableItems() {
        const checkboxes = document.querySelectorAll('table input[type="checkbox"]:checked');
        const selectedIds = [];
        
        checkboxes.forEach(checkbox => {
            const row = checkbox.closest('tr');
            const idCell = row.querySelector('[data-id]');
            if (idCell) {
                selectedIds.push(idCell.getAttribute('data-id'));
            }
        });
        
        return selectedIds;
    }
    
    openModal(modalSelector) {
        const modal = document.querySelector(modalSelector);
        if (modal) {
            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();
        } else {
            this.showGenericAddModal();
        }
    }
    
    showGenericAddModal() {
        const currentPage = this.getCurrentPageType();
        const pageNames = {
            'customers': 'مشتری',
            'products': 'محصول',
            'orders': 'سفارش',
            'invoices': 'فاکتور',
            'checks': 'چک',
            'payments': 'تراکنش'
        };
        
        const pageName = pageNames[currentPage] || 'مورد';
        this.showAlert(`برای افزودن ${pageName} جدید، از دکمه مربوطه در صفحه استفاده کنید`, 'info');
    }
    
    editItem(itemId) {
        const currentPage = this.getCurrentPageType();
        const pageNames = {
            'customers': 'مشتری',
            'products': 'محصول',
            'orders': 'سفارش',
            'invoices': 'فاکتور',
            'checks': 'چک',
            'payments': 'تراکنش'
        };
        
        const pageName = pageNames[currentPage] || 'مورد';
        this.showAlert(`ویرایش ${pageName} با شناسه ${itemId} در حال پیاده‌سازی است`, 'info');
    }
    
    confirmDelete(itemIds) {
        const itemCount = itemIds.length;
        const message = itemCount === 1 
            ? 'آیا از حذف این مورد اطمینان دارید؟'
            : `آیا از حذف ${itemCount} مورد انتخاب شده اطمینان دارید؟`;
        
        if (confirm(message)) {
            this.deleteItems(itemIds);
        }
    }
    
    deleteItems(itemIds) {
        // Simulate deletion process
        this.showAlert(`${itemIds.length} مورد با موفقیت حذف شد`, 'success');
        
        // Remove rows from table
        itemIds.forEach(id => {
            const row = document.querySelector(`[data-id="${id}"]`)?.closest('tr');
            if (row) {
                row.remove();
            }
        });
    }
    
    showAlert(message, type = 'info') {
        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 80px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Initialize custom navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new CustomNavigationManager();
});

// Add table selection functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add checkboxes to table rows if they don't exist
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        const tbody = table.querySelector('tbody');
        if (tbody) {
            const rows = tbody.querySelectorAll('tr');
            rows.forEach((row, index) => {
                // Check if checkbox already exists
                if (!row.querySelector('input[type="checkbox"]')) {
                    const firstCell = row.querySelector('td');
                    if (firstCell) {
                        // Add data-id attribute if it doesn't exist
                        if (!firstCell.hasAttribute('data-id')) {
                            firstCell.setAttribute('data-id', index + 1);
                        }
                        
                        // Add checkbox to first cell
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.className = 'form-check-input me-2';
                        checkbox.style.float = 'right';
                        firstCell.insertBefore(checkbox, firstCell.firstChild);
                    }
                }
            });
        }
    });
    
    // Add master checkbox to table headers
    const tableHeaders = document.querySelectorAll('table thead tr');
    tableHeaders.forEach(header => {
        const firstTh = header.querySelector('th');
        if (firstTh && !firstTh.querySelector('input[type="checkbox"]')) {
            const masterCheckbox = document.createElement('input');
            masterCheckbox.type = 'checkbox';
            masterCheckbox.className = 'form-check-input me-2';
            masterCheckbox.addEventListener('change', function() {
                const table = this.closest('table');
                const checkboxes = table.querySelectorAll('tbody input[type="checkbox"]');
                checkboxes.forEach(cb => cb.checked = this.checked);
            });
            firstTh.insertBefore(masterCheckbox, firstTh.firstChild);
        }
    });
});

// Light mode toggle fix
function toggleDarkMode() {
    const body = document.body;
    const toggle = document.getElementById('darkModeToggle');
    const isDark = body.classList.contains('dark-mode');
    
    if (isDark) {
        // Switch to light mode
        body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
        if (toggle) {
            toggle.innerHTML = '<span class="toggle-icon"><i class="fas fa-moon moon-icon"></i></span> حالت تاریک';
        }
    } else {
        // Switch to dark mode
        body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
        if (toggle) {
            toggle.innerHTML = '<span class="toggle-icon"><i class="fas fa-sun sun-icon"></i></span> حالت روشن';
        }
    }
    
    // Trigger theme change event
    document.dispatchEvent(new Event('themeChanged'));
}