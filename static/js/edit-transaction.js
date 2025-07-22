/**
 * Edit Transaction Functionality for Persian Accounting System
 * Based on code review suggestions for transaction editing
 */

class TransactionEditor {
    constructor() {
        this.currentEditId = null;
        this.originalData = null;
        this.init();
    }

    init() {
        this.setupEditButtons();
        this.setupEditModal();
        this.setupFormHandlers();
    }

    setupEditButtons() {
        // Add edit buttons to existing transaction rows
        const transactionRows = document.querySelectorAll('tbody tr, .transaction-item');
        
        transactionRows.forEach((row, index) => {
            if (!row.querySelector('.edit-transaction-btn')) {
                this.addEditButton(row, index);
            }
        });
    }

    addEditButton(row, index) {
        // Find the action column or create one
        let actionCell = row.querySelector('.actions, td:last-child, .transaction-actions');
        
        if (!actionCell) {
            actionCell = document.createElement('td');
            actionCell.className = 'actions';
            row.appendChild(actionCell);
        }

        // Create edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-outline-primary edit-transaction-btn me-1';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.setAttribute('title', 'ویرایش تراکنش');
        editBtn.setAttribute('data-transaction-id', index);
        
        editBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.openEditModal(row, index);
        });

        // Insert before delete button if exists
        const deleteBtn = actionCell.querySelector('.delete-btn, .btn-danger');
        if (deleteBtn) {
            actionCell.insertBefore(editBtn, deleteBtn);
        } else {
            actionCell.appendChild(editBtn);
        }
    }

    setupEditModal() {
        // Create edit modal if it doesn't exist
        let modal = document.querySelector('#editTransactionModal');
        if (!modal) {
            modal = this.createEditModal();
            document.body.appendChild(modal);
        }
        
        return modal;
    }

    createEditModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'editTransactionModal';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-edit me-2"></i>ویرایش تراکنش
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <form id="editTransactionForm">
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">عنوان تراکنش</label>
                                        <input type="text" class="form-control" name="title" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">مبلغ (ریال)</label>
                                        <input type="number" class="form-control" name="amount" required>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">تاریخ</label>
                                        <input type="date" class="form-control" name="date" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">نوع تراکنش</label>
                                        <select class="form-select" name="type" required>
                                            <option value="">انتخاب کنید...</option>
                                            <option value="income">درآمد</option>
                                            <option value="expense">هزینه</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">توضیحات</label>
                                <textarea class="form-control" name="description" rows="3"></textarea>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">دسته‌بندی</label>
                                        <select class="form-select" name="category">
                                            <option value="">انتخاب دسته‌بندی...</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">وضعیت</label>
                                        <select class="form-select" name="status">
                                            <option value="completed">تکمیل شده</option>
                                            <option value="pending">در انتظار</option>
                                            <option value="cancelled">لغو شده</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-1"></i>انصراف
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-1"></i>ذخیره تغییرات
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        return modal;
    }

    openEditModal(row, transactionId) {
        const modal = this.setupEditModal();
        const form = modal.querySelector('#editTransactionForm');
        
        // Extract data from row
        const transactionData = this.extractTransactionData(row);
        
        // Store current edit info
        this.currentEditId = transactionId;
        this.originalData = { ...transactionData };
        
        // Populate form
        this.populateEditForm(form, transactionData);
        
        // Show modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        // Focus on first input
        setTimeout(() => {
            form.querySelector('input[name="title"]').focus();
        }, 300);
    }

    extractTransactionData(row) {
        // Extract data from table row - this is a simplified version
        // In a real application, you would have the actual data structure
        
        const cells = row.querySelectorAll('td');
        const data = {
            title: cells[0]?.textContent.trim() || '',
            amount: this.extractAmount(cells[1]?.textContent || '0'),
            date: this.extractDate(cells[2]?.textContent || ''),
            type: this.detectTransactionType(row),
            description: cells[3]?.textContent.trim() || '',
            category: '',
            status: 'completed'
        };
        
        return data;
    }

    extractAmount(amountText) {
        // Extract numeric value from Persian currency format
        const cleanText = amountText.replace(/[^\d]/g, '');
        return parseInt(cleanText) || 0;
    }

    extractDate(dateText) {
        // Convert Persian date to ISO format if needed
        // This is a simplified version
        const today = new Date();
        return today.toISOString().split('T')[0];
    }

    detectTransactionType(row) {
        // Detect if it's income or expense based on styling or content
        if (row.classList.contains('income', 'plus', 'positive')) {
            return 'income';
        } else if (row.classList.contains('expense', 'minus', 'negative')) {
            return 'expense';
        }
        
        // Check for color indicators
        const amountCell = row.querySelector('td:nth-child(2)');
        if (amountCell) {
            const style = window.getComputedStyle(amountCell);
            const color = style.color;
            
            if (color.includes('28, 167, 69') || color.includes('green')) {
                return 'income';
            } else if (color.includes('220, 53, 69') || color.includes('red')) {
                return 'expense';
            }
        }
        
        return 'expense'; // Default
    }

    populateEditForm(form, data) {
        // Fill form fields with transaction data
        Object.keys(data).forEach(key => {
            const field = form.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = data[key];
            }
        });
        
        // Update category options based on type
        this.updateCategoryOptions(form, data.type);
        
        // Set category if available
        if (data.category) {
            setTimeout(() => {
                const categoryField = form.querySelector('[name="category"]');
                if (categoryField) {
                    categoryField.value = data.category;
                }
            }, 100);
        }
    }

    updateCategoryOptions(form, type) {
        const categorySelect = form.querySelector('[name="category"]');
        if (!categorySelect || !window.transactionCategories) return;
        
        categorySelect.innerHTML = '<option value="">انتخاب دسته‌بندی...</option>';
        
        const categories = window.transactionCategories.getCategoriesByType(type);
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }

    setupFormHandlers() {
        // Handle form submission
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'editTransactionForm') {
                e.preventDefault();
                this.handleFormSubmission(e.target);
            }
        });
        
        // Handle transaction type change
        document.addEventListener('change', (e) => {
            if (e.target.name === 'type' && e.target.closest('#editTransactionForm')) {
                this.updateCategoryOptions(e.target.closest('form'), e.target.value);
            }
        });
        
        // Handle amount formatting
        document.addEventListener('input', (e) => {
            if (e.target.name === 'amount' && e.target.closest('#editTransactionForm')) {
                this.formatAmountInput(e.target);
            }
        });
    }

    formatAmountInput(input) {
        let value = input.value.replace(/[^\d]/g, '');
        if (value) {
            const formattedValue = parseInt(value).toLocaleString('fa-IR');
            // Store raw value in data attribute
            input.setAttribute('data-raw-value', value);
            // Don't update display value while typing to avoid cursor issues
        }
    }

    handleFormSubmission(form) {
        const formData = new FormData(form);
        const transactionData = {};
        
        // Extract form data
        for (let [key, value] of formData.entries()) {
            transactionData[key] = value;
        }
        
        // Get raw amount value
        const amountInput = form.querySelector('[name="amount"]');
        if (amountInput && amountInput.hasAttribute('data-raw-value')) {
            transactionData.amount = amountInput.getAttribute('data-raw-value');
        }
        
        // Validate data
        if (this.validateTransactionData(transactionData)) {
            this.saveTransaction(transactionData);
        }
    }

    validateTransactionData(data) {
        const errors = [];
        
        if (!data.title || data.title.trim() === '') {
            errors.push('عنوان تراکنش الزامی است');
        }
        
        if (!data.amount || parseInt(data.amount) <= 0) {
            errors.push('مبلغ باید بیشتر از صفر باشد');
        }
        
        if (!data.type) {
            errors.push('نوع تراکنش الزامی است');
        }
        
        if (!data.date) {
            errors.push('تاریخ الزامی است');
        }
        
        if (errors.length > 0) {
            this.showErrors(errors);
            return false;
        }
        
        return true;
    }

    showErrors(errors) {
        const errorHtml = errors.map(error => 
            `<div class="alert alert-danger alert-dismissible fade show">
                <i class="fas fa-exclamation-triangle me-2"></i>${error}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>`
        ).join('');
        
        const modal = document.querySelector('#editTransactionModal');
        const modalBody = modal.querySelector('.modal-body');
        
        // Remove existing errors
        modalBody.querySelectorAll('.alert-danger').forEach(alert => alert.remove());
        
        // Add new errors at the top
        modalBody.insertAdjacentHTML('afterbegin', errorHtml);
    }

    saveTransaction(data) {
        // Show loading state
        const submitBtn = document.querySelector('#editTransactionForm button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>در حال ذخیره...';
        submitBtn.disabled = true;
        
        // Simulate API call - replace with actual implementation
        setTimeout(() => {
            this.updateTransactionRow(data);
            this.closeEditModal();
            this.showSuccessMessage('تراکنش با موفقیت به‌روزرسانی شد');
            
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 1000);
    }

    updateTransactionRow(data) {
        // Find the row being edited
        const rows = document.querySelectorAll('tbody tr, .transaction-item');
        const currentRow = rows[this.currentEditId];
        
        if (!currentRow) return;
        
        // Update row content
        const cells = currentRow.querySelectorAll('td');
        if (cells.length >= 4) {
            cells[0].textContent = data.title;
            cells[1].innerHTML = this.formatCurrency(data.amount);
            cells[2].textContent = this.formatDate(data.date);
            cells[3].textContent = data.description;
        }
        
        // Update row styling based on type
        currentRow.className = currentRow.className.replace(/\b(income|expense|plus|minus)\b/g, '');
        currentRow.classList.add(data.type);
        
        // Add visual feedback
        currentRow.style.backgroundColor = '#d4edda';
        setTimeout(() => {
            currentRow.style.backgroundColor = '';
        }, 2000);
    }

    formatCurrency(amount) {
        const numericAmount = parseInt(amount) || 0;
        return `<span class="currency-formatted">${numericAmount.toLocaleString('fa-IR')} ریال</span>`;
    }

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fa-IR');
        } catch (e) {
            return dateString;
        }
    }

    closeEditModal() {
        const modal = document.querySelector('#editTransactionModal');
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) {
            bsModal.hide();
        }
        
        // Clear form
        const form = modal.querySelector('#editTransactionForm');
        form.reset();
        
        // Clear stored data
        this.currentEditId = null;
        this.originalData = null;
    }

    showSuccessMessage(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-success alert-dismissible fade show position-fixed';
        alert.style.top = '20px';
        alert.style.right = '20px';
        alert.style.zIndex = '9999';
        alert.style.minWidth = '300px';
        
        alert.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alert);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 3000);
    }

    // Public method to refresh edit buttons when new transactions are added
    refreshEditButtons() {
        this.setupEditButtons();
    }
}

// Initialize transaction editor
document.addEventListener('DOMContentLoaded', function() {
    window.transactionEditor = new TransactionEditor();
    console.log('Transaction editor initialized');
});

// Export for global use
window.TransactionEditor = TransactionEditor;