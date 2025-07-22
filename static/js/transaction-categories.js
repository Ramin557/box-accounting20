/**
 * Transaction Categories Manager for Persian Accounting System
 * Expense and Income categorization with Persian labels
 */

class TransactionCategoriesManager {
    constructor() {
        this.categories = {
            income: [
                { id: 'salary', name: 'حقوق و دستمزد', icon: 'fas fa-money-bill-wave', color: '#28a745' },
                { id: 'sales', name: 'فروش محصولات', icon: 'fas fa-shopping-cart', color: '#17a2b8' },
                { id: 'services', name: 'ارائه خدمات', icon: 'fas fa-handshake', color: '#6f42c1' },
                { id: 'investment', name: 'سرمایه‌گذاری', icon: 'fas fa-chart-line', color: '#fd7e14' },
                { id: 'rent_income', name: 'اجاره دریافتی', icon: 'fas fa-home', color: '#20c997' },
                { id: 'commission', name: 'کمیسیون', icon: 'fas fa-percentage', color: '#e83e8c' },
                { id: 'other_income', name: 'سایر درآمدها', icon: 'fas fa-plus-circle', color: '#6c757d' }
            ],
            expense: [
                { id: 'rent', name: 'اجاره و هزینه‌های مسکن', icon: 'fas fa-home', color: '#dc3545' },
                { id: 'food', name: 'خوراک و آشامیدنی', icon: 'fas fa-utensils', color: '#fd7e14' },
                { id: 'transport', name: 'حمل و نقل', icon: 'fas fa-car', color: '#20c997' },
                { id: 'utilities', name: 'آب، برق، گاز', icon: 'fas fa-bolt', color: '#ffc107' },
                { id: 'health', name: 'بهداشت و درمان', icon: 'fas fa-hospital', color: '#e83e8c' },
                { id: 'education', name: 'آموزش', icon: 'fas fa-graduation-cap', color: '#6f42c1' },
                { id: 'entertainment', name: 'تفریح و سرگرمی', icon: 'fas fa-gamepad', color: '#17a2b8' },
                { id: 'shopping', name: 'خرید و لوازم', icon: 'fas fa-shopping-bag', color: '#28a745' },
                { id: 'office', name: 'لوازم اداری', icon: 'fas fa-briefcase', color: '#6c757d' },
                { id: 'marketing', name: 'تبلیغات و بازاریابی', icon: 'fas fa-bullhorn', color: '#dc3545' },
                { id: 'maintenance', name: 'تعمیر و نگهداری', icon: 'fas fa-tools', color: '#fd7e14' },
                { id: 'insurance', name: 'بیمه', icon: 'fas fa-shield-alt', color: '#20c997' },
                { id: 'tax', name: 'مالیات', icon: 'fas fa-receipt', color: '#ffc107' },
                { id: 'other_expense', name: 'سایر هزینه‌ها', icon: 'fas fa-minus-circle', color: '#6c757d' }
            ]
        };
        this.init();
    }

    init() {
        this.injectCategorySelectors();
        this.setupCategoryFilters();
        this.setupCategoryStats();
    }

    getAllCategories() {
        return {
            ...this.categories.income,
            ...this.categories.expense
        };
    }

    getCategoryById(id) {
        const allCategories = [...this.categories.income, ...this.categories.expense];
        return allCategories.find(cat => cat.id === id);
    }

    getCategoriesByType(type) {
        return this.categories[type] || [];
    }

    injectCategorySelectors() {
        // Find all forms that need category selectors
        const targetForms = document.querySelectorAll('form:has(input[name*="amount"], input[name*="price"])');
        
        targetForms.forEach(form => {
            this.addCategorySelector(form);
        });
    }

    addCategorySelector(form) {
        // Look for amount input to determine placement
        const amountInput = form.querySelector('input[name*="amount"], input[name*="price"], input[name*="total"]');
        if (!amountInput) return;

        // Check if category selector already exists
        if (form.querySelector('.transaction-category-selector')) return;

        const categoryContainer = this.createCategorySelector();
        
        // Insert after amount input container
        const amountContainer = amountInput.closest('.mb-3, .form-group, .col-md-6') || amountInput.parentElement;
        amountContainer.parentNode.insertBefore(categoryContainer, amountContainer.nextSibling);
    }

    createCategorySelector() {
        const container = document.createElement('div');
        container.className = 'mb-3 transaction-category-selector';
        
        container.innerHTML = `
            <label class="form-label">
                <i class="fas fa-tags me-2"></i>دسته‌بندی تراکنش
            </label>
            <div class="category-type-tabs mb-2">
                <div class="btn-group w-100" role="group">
                    <input type="radio" class="btn-check" name="category_type" id="income_type" value="income">
                    <label class="btn btn-outline-success" for="income_type">
                        <i class="fas fa-plus-circle me-1"></i>درآمد
                    </label>
                    
                    <input type="radio" class="btn-check" name="category_type" id="expense_type" value="expense" checked>
                    <label class="btn btn-outline-danger" for="expense_type">
                        <i class="fas fa-minus-circle me-1"></i>هزینه
                    </label>
                </div>
            </div>
            <select class="form-select" name="transaction_category" id="transaction_category">
                <option value="">انتخاب دسته‌بندی...</option>
            </select>
            <div class="category-preview mt-2" style="display: none;">
                <div class="alert alert-info py-2">
                    <i class="category-icon"></i>
                    <span class="category-name"></span>
                </div>
            </div>
        `;

        this.setupCategorySelectorEvents(container);
        this.updateCategoryOptions(container, 'expense'); // Default to expenses

        return container;
    }

    setupCategorySelectorEvents(container) {
        const typeRadios = container.querySelectorAll('input[name="category_type"]');
        const categorySelect = container.querySelector('#transaction_category');
        const preview = container.querySelector('.category-preview');
        
        // Handle category type change
        typeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const selectedType = e.target.value;
                this.updateCategoryOptions(container, selectedType);
            });
        });
        
        // Handle category selection
        categorySelect.addEventListener('change', (e) => {
            const categoryId = e.target.value;
            if (categoryId) {
                this.showCategoryPreview(container, categoryId);
            } else {
                preview.style.display = 'none';
            }
        });
    }

    updateCategoryOptions(container, type) {
        const categorySelect = container.querySelector('#transaction_category');
        const categories = this.getCategoriesByType(type);
        
        categorySelect.innerHTML = '<option value="">انتخاب دسته‌بندی...</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            option.setAttribute('data-icon', category.icon);
            option.setAttribute('data-color', category.color);
            categorySelect.appendChild(option);
        });
    }

    showCategoryPreview(container, categoryId) {
        const category = this.getCategoryById(categoryId);
        if (!category) return;
        
        const preview = container.querySelector('.category-preview');
        const icon = preview.querySelector('.category-icon');
        const name = preview.querySelector('.category-name');
        
        icon.className = `category-icon ${category.icon} me-2`;
        icon.style.color = category.color;
        name.textContent = category.name;
        
        preview.style.display = 'block';
    }

    setupCategoryFilters() {
        // Add category filters to report pages
        const reportContainers = document.querySelectorAll('.reports-container, .transactions-list');
        
        reportContainers.forEach(container => {
            this.addCategoryFilter(container);
        });
    }

    addCategoryFilter(container) {
        if (container.querySelector('.category-filter')) return;
        
        const filterContainer = document.createElement('div');
        filterContainer.className = 'category-filter mb-3';
        filterContainer.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <label class="form-label">فیلتر بر اساس نوع:</label>
                    <select class="form-select" id="filter_type">
                        <option value="">همه تراکنش‌ها</option>
                        <option value="income">درآمدها</option>
                        <option value="expense">هزینه‌ها</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">فیلتر بر اساس دسته‌بندی:</label>
                    <select class="form-select" id="filter_category">
                        <option value="">تمام دسته‌ها</option>
                    </select>
                </div>
            </div>
        `;
        
        container.insertBefore(filterContainer, container.firstChild);
        this.setupFilterEvents(filterContainer);
    }

    setupFilterEvents(filterContainer) {
        const typeFilter = filterContainer.querySelector('#filter_type');
        const categoryFilter = filterContainer.querySelector('#filter_category');
        
        typeFilter.addEventListener('change', (e) => {
            const selectedType = e.target.value;
            this.updateCategoryFilter(categoryFilter, selectedType);
            this.applyFilters();
        });
        
        categoryFilter.addEventListener('change', () => {
            this.applyFilters();
        });
    }

    updateCategoryFilter(categorySelect, type) {
        categorySelect.innerHTML = '<option value="">تمام دسته‌ها</option>';
        
        if (!type) {
            // Show all categories
            const allCategories = [...this.categories.income, ...this.categories.expense];
            allCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        } else {
            // Show categories for selected type
            const categories = this.getCategoriesByType(type);
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        }
    }

    applyFilters() {
        const typeFilter = document.querySelector('#filter_type');
        const categoryFilter = document.querySelector('#filter_category');
        
        if (!typeFilter || !categoryFilter) return;
        
        const selectedType = typeFilter.value;
        const selectedCategory = categoryFilter.value;
        
        // Apply filters to transaction rows
        const transactionRows = document.querySelectorAll('.transaction-row, tbody tr');
        
        transactionRows.forEach(row => {
            const shouldShow = this.shouldShowTransaction(row, selectedType, selectedCategory);
            row.style.display = shouldShow ? '' : 'none';
        });
        
        this.updateFilterStats();
    }

    shouldShowTransaction(row, selectedType, selectedCategory) {
        // This is a simplified implementation
        // In a real application, you would check the actual transaction data
        
        if (!selectedType && !selectedCategory) return true;
        
        // You would implement the actual filtering logic here
        // based on your transaction data structure
        
        return true; // Placeholder
    }

    setupCategoryStats() {
        // Add category-based statistics
        const statsContainers = document.querySelectorAll('.stats-container, .dashboard-stats');
        
        statsContainers.forEach(container => {
            this.addCategoryStats(container);
        });
    }

    addCategoryStats(container) {
        if (container.querySelector('.category-stats')) return;
        
        const statsContainer = document.createElement('div');
        statsContainer.className = 'category-stats mt-4';
        statsContainer.innerHTML = `
            <h5 class="mb-3">
                <i class="fas fa-chart-pie me-2"></i>آمار دسته‌بندی‌ها
            </h5>
            <div class="row">
                <div class="col-md-6">
                    <h6 class="text-success">درآمدها</h6>
                    <div class="income-categories-stats"></div>
                </div>
                <div class="col-md-6">
                    <h6 class="text-danger">هزینه‌ها</h6>
                    <div class="expense-categories-stats"></div>
                </div>
            </div>
        `;
        
        container.appendChild(statsContainer);
        this.updateCategoryStats(statsContainer);
    }

    updateCategoryStats(container) {
        // This would be connected to your actual transaction data
        // For now, this is a placeholder implementation
        
        const incomeStats = container.querySelector('.income-categories-stats');
        const expenseStats = container.querySelector('.expense-categories-stats');
        
        // Example implementation - replace with real data
        this.renderCategoryStatsList(incomeStats, 'income', {});
        this.renderCategoryStatsList(expenseStats, 'expense', {});
    }

    renderCategoryStatsList(container, type, data) {
        const categories = this.getCategoriesByType(type);
        
        container.innerHTML = categories.map(category => `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div class="d-flex align-items-center">
                    <i class="${category.icon} me-2" style="color: ${category.color}"></i>
                    <span class="small">${category.name}</span>
                </div>
                <span class="badge" style="background-color: ${category.color}">
                    ${data[category.id] || 0} تومان
                </span>
            </div>
        `).join('');
    }

    updateFilterStats() {
        // Update statistics after filtering
        const visibleRows = document.querySelectorAll('.transaction-row:not([style*="none"]), tbody tr:not([style*="none"])');
        
        // Calculate and display filtered stats
        console.log(`نمایش ${visibleRows.length} تراکنش`);
    }

    // Export categories data for other modules
    exportCategoriesData() {
        return {
            categories: this.categories,
            getCategoryById: (id) => this.getCategoryById(id),
            getCategoriesByType: (type) => this.getCategoriesByType(type)
        };
    }
}

// Initialize transaction categories
document.addEventListener('DOMContentLoaded', function() {
    window.transactionCategories = new TransactionCategoriesManager();
    console.log('Transaction categories initialized');
});

// Export for global use
window.TransactionCategoriesManager = TransactionCategoriesManager;