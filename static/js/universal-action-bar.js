/**
 * Universal Action Bar System
 * Handles all action bar functionality across the application
 */

class UniversalActionBar {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeActionBars();
        console.log('Universal Action Bar initialized');
    }

    setupEventListeners() {
        // Add click handlers for all action buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.action-btn')) {
                this.handleActionClick(e);
            }
        });

        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    initializeActionBars() {
        // Add action bars to sections that don't have them
        const sections = [
            { selector: '.orders-section', title: 'مدیریت سفارشات', addUrl: '/orders/add' },
            { selector: '.invoices-section', title: 'مدیریت فاکتورها', addUrl: '/invoices/add' },
            { selector: '.reports-section', title: 'گزارش‌گیری', addUrl: '/reports/new' },
            { selector: '.settings-section', title: 'تنظیمات سیستم', addUrl: '/settings/new' }
        ];

        sections.forEach(section => {
            const element = document.querySelector(section.selector);
            if (element && !element.querySelector('.action-bar')) {
                this.createActionBar(element, section);
            }
        });
    }

    createActionBar(container, config) {
        const actionBar = document.createElement('div');
        actionBar.className = 'action-bar';
        actionBar.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h4>${config.title}</h4>
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><a href="/dashboard">داشبورد</a></li>
                            <li class="breadcrumb-item active">${config.title}</li>
                        </ol>
                    </nav>
                </div>
                <div class="action-buttons">
                    <button class="btn btn-primary-action action-btn" data-action="add" data-url="${config.addUrl}">
                        <i class="fas fa-plus"></i>
                        افزودن جدید
                    </button>
                    <button class="btn btn-filter action-btn" data-action="filter">
                        <i class="fas fa-filter"></i>
                        فیلتر
                    </button>
                    <button class="btn btn-export action-btn" data-action="export">
                        <i class="fas fa-download"></i>
                        خروجی Excel
                    </button>
                    <div class="dropdown">
                        <button class="btn btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item action-btn" data-action="print"><i class="fas fa-print"></i> چاپ</a></li>
                            <li><a class="dropdown-item action-btn" data-action="pdf"><i class="fas fa-file-pdf"></i> خروجی PDF</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item action-btn" data-action="settings"><i class="fas fa-cog"></i> تنظیمات</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        container.insertBefore(actionBar, container.firstChild);
    }

    handleActionClick(e) {
        e.preventDefault();
        const button = e.target.closest('.action-btn');
        const action = button.dataset.action;
        const url = button.dataset.url;

        // Add loading state
        this.setButtonLoading(button, true);

        switch (action) {
            case 'add':
                this.handleAdd(url, button);
                break;
            case 'edit':
                this.handleEdit(button);
                break;
            case 'delete':
                this.handleDelete(button);
                break;
            case 'filter':
                this.handleFilter(button);
                break;
            case 'export':
                this.handleExport(button);
                break;
            case 'print':
                this.handlePrint(button);
                break;
            case 'pdf':
                this.handlePdf(button);
                break;
            default:
                this.setButtonLoading(button, false);
        }
    }

    handleAdd(url, button) {
        if (url) {
            window.location.href = url;
        } else {
            this.setButtonLoading(button, false);
            this.showNotification('خطا', 'آدرس صفحه تعریف نشده است', 'error');
        }
    }

    handleEdit(button) {
        const id = button.dataset.id;
        const editUrl = button.dataset.editUrl || button.closest('[data-edit-url]')?.dataset.editUrl;
        
        if (editUrl && id) {
            window.location.href = editUrl.replace('{id}', id);
        } else {
            this.setButtonLoading(button, false);
            this.showNotification('خطا', 'اطلاعات ویرایش یافت نشد', 'error');
        }
    }

    handleDelete(button) {
        const id = button.dataset.id;
        const name = button.dataset.name || 'این آیتم';
        
        if (confirm(`آیا از حذف "${name}" اطمینان دارید؟`)) {
            const deleteUrl = button.dataset.deleteUrl || button.closest('[data-delete-url]')?.dataset.deleteUrl;
            
            if (deleteUrl && id) {
                // Perform delete operation
                fetch(deleteUrl.replace('{id}', id), {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': this.getCsrfToken()
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        this.showNotification('موفق', 'حذف با موفقیت انجام شد', 'success');
                        // Remove the row or reload the page
                        const row = button.closest('tr');
                        if (row) {
                            row.remove();
                        } else {
                            window.location.reload();
                        }
                    } else {
                        this.showNotification('خطا', data.message || 'حذف ناموفق بود', 'error');
                    }
                })
                .catch(error => {
                    this.showNotification('خطا', 'خطا در ارتباط با سرور', 'error');
                })
                .finally(() => {
                    this.setButtonLoading(button, false);
                });
            } else {
                this.setButtonLoading(button, false);
                this.showNotification('خطا', 'اطلاعات حذف یافت نشد', 'error');
            }
        } else {
            this.setButtonLoading(button, false);
        }
    }

    handleFilter(button) {
        // Toggle filter panel
        const filterPanel = document.querySelector('.filter-panel');
        if (filterPanel) {
            filterPanel.classList.toggle('d-none');
        } else {
            // Create and show filter panel
            this.createFilterPanel(button);
        }
        this.setButtonLoading(button, false);
    }

    handleExport(button) {
        // Export to Excel
        const table = document.querySelector('table');
        if (table) {
            this.exportTableToExcel(table);
            this.showNotification('موفق', 'فایل Excel ایجاد شد', 'success');
        } else {
            this.showNotification('خطا', 'جدولی برای خروجی یافت نشد', 'error');
        }
        this.setButtonLoading(button, false);
    }

    handlePrint(button) {
        window.print();
        this.setButtonLoading(button, false);
    }

    handlePdf(button) {
        // Use html2pdf library if available
        if (typeof html2pdf !== 'undefined') {
            const element = document.querySelector('.main-content');
            html2pdf().from(element).save('report.pdf');
            this.showNotification('موفق', 'فایل PDF ایجاد شد', 'success');
        } else {
            window.print();
            this.showNotification('اطلاع', 'لطفاً از دیالوگ چاپ گزینه PDF را انتخاب کنید', 'info');
        }
        this.setButtonLoading(button, false);
    }

    createFilterPanel(button) {
        const panel = document.createElement('div');
        panel.className = 'card filter-panel mt-3';
        panel.innerHTML = `
            <div class="card-header">
                <h5>فیلترهای جستجو</h5>
            </div>
            <div class="card-body">
                <form class="row g-3">
                    <div class="col-md-4">
                        <label class="form-label">جستجو در متن</label>
                        <input type="text" class="form-control" name="search" placeholder="کلمه کلیدی...">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">از تاریخ</label>
                        <input type="date" class="form-control" name="date_from">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">تا تاریخ</label>
                        <input type="date" class="form-control" name="date_to">
                    </div>
                    <div class="col-12">
                        <button type="submit" class="btn btn-primary">اعمال فیلتر</button>
                        <button type="button" class="btn btn-outline-secondary ms-2" onclick="this.closest('.filter-panel').classList.add('d-none')">انصراف</button>
                    </div>
                </form>
            </div>
        `;

        button.closest('.action-bar').insertAdjacentElement('afterend', panel);
    }

    exportTableToExcel(table) {
        const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
        const filename = `export_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, filename);
    }

    setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    showNotification(title, message, type = 'info') {
        const alertClass = {
            'success': 'alert-success',
            'error': 'alert-danger',
            'warning': 'alert-warning',
            'info': 'alert-info'
        }[type] || 'alert-info';

        const iconClass = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-triangle',
            'warning': 'fas fa-exclamation-circle',
            'info': 'fas fa-info-circle'
        }[type] || 'fas fa-info-circle';

        const notification = document.createElement('div');
        notification.className = `alert ${alertClass} alert-dismissible fade show`;
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
        notification.innerHTML = `
            <i class="${iconClass}"></i>
            <strong>${title}:</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        // Auto remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
    }

    getCsrfToken() {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    }

    handleKeyboardShortcuts(e) {
        // Ctrl+N - Add new
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            const addButton = document.querySelector('.action-btn[data-action="add"]');
            if (addButton) {
                addButton.click();
            }
        }

        // Ctrl+F - Filter
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            const filterButton = document.querySelector('.action-btn[data-action="filter"]');
            if (filterButton) {
                filterButton.click();
            }
        }

        // Ctrl+P - Print
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            window.print();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new UniversalActionBar();
});