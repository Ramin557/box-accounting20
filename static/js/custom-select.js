/**
 * Custom Editable Select Component
 * Persian Accounting System - Advanced UI Component
 * Features: Add, Edit, Delete options with search and local storage
 */

class CustomSelect {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            placeholder: 'یک گزینه انتخاب کنید',
            searchPlaceholder: 'جستجو...',
            addNewText: 'افزودن جدید',
            confirmDeleteText: 'آیا از حذف این گزینه مطمئن هستید؟',
            storageKey: 'customSelectOptions',
            allowAdd: true,
            allowEdit: true,
            allowDelete: true,
            ...options
        };
        
        this.data = this.loadData();
        this.selectedValue = null;
        this.isOpen = false;
        this.filteredData = [...this.data];
        
        this.init();
    }

    init() {
        this.createStructure();
        this.bindEvents();
        this.render();
    }

    createStructure() {
        // Get original select data if exists
        const originalSelect = this.element.querySelector('select');
        if (originalSelect) {
            const existingOptions = Array.from(originalSelect.options).map(opt => ({
                id: opt.value || opt.text,
                text: opt.text,
                value: opt.value || opt.text
            }));
            
            if (existingOptions.length > 0 && this.data.length === 0) {
                this.data = existingOptions;
                this.saveData();
            }
            
            // Hide original select
            originalSelect.style.display = 'none';
        }

        // Create custom select structure
        this.element.classList.add('custom-select-wrapper');
        
        const customSelectHTML = `
            <div class="custom-select" data-theme="${document.body.classList.contains('dark-mode') ? 'dark' : 'light'}">
                <div class="select-trigger" role="button" tabindex="0" aria-haspopup="listbox" aria-expanded="false">
                    <span class="select-value">${this.options.placeholder}</span>
                    <div class="select-arrow">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
                <div class="options-panel" role="listbox">
                    <div class="search-section">
                        <div class="search-box">
                            <i class="fas fa-search search-icon"></i>
                            <input type="text" class="search-input" placeholder="${this.options.searchPlaceholder}" autocomplete="off">
                        </div>
                    </div>
                    <ul class="options-list" role="group">
                        <!-- Options will be rendered here -->
                    </ul>
                    ${this.options.allowAdd ? `
                    <div class="options-footer">
                        <button type="button" class="add-new-btn">
                            <i class="fas fa-plus"></i>
                            <span>${this.options.addNewText}</span>
                        </button>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

        this.element.insertAdjacentHTML('beforeend', customSelectHTML);
        
        // Get references to key elements
        this.customSelect = this.element.querySelector('.custom-select');
        this.trigger = this.element.querySelector('.select-trigger');
        this.valueSpan = this.element.querySelector('.select-value');
        this.arrow = this.element.querySelector('.select-arrow i');
        this.panel = this.element.querySelector('.options-panel');
        this.searchInput = this.element.querySelector('.search-input');
        this.optionsList = this.element.querySelector('.options-list');
        this.addNewBtn = this.element.querySelector('.add-new-btn');

        // Create modal for add/edit
        this.createModal();
    }

    createModal() {
        const modalHTML = `
            <div class="custom-select-modal-overlay" style="display: none;">
                <div class="custom-select-modal">
                    <div class="modal-header">
                        <h4 class="modal-title">افزودن گزینه جدید</h4>
                        <button type="button" class="modal-close-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="modal-option-text">نام گزینه:</label>
                            <input type="text" id="modal-option-text" class="form-control" placeholder="نام گزینه را وارد کنید">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary modal-cancel-btn">انصراف</button>
                        <button type="button" class="btn btn-primary modal-save-btn">ذخیره</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        this.modal = document.querySelector('.custom-select-modal-overlay');
        this.modalTitle = this.modal.querySelector('.modal-title');
        this.modalInput = this.modal.querySelector('#modal-option-text');
        this.modalSaveBtn = this.modal.querySelector('.modal-save-btn');
        this.modalCancelBtn = this.modal.querySelector('.modal-cancel-btn');
        this.modalCloseBtn = this.modal.querySelector('.modal-close-btn');
    }

    bindEvents() {
        // Toggle dropdown
        this.trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        // Keyboard support for trigger
        this.trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Search functionality
        this.searchInput.addEventListener('input', (e) => {
            this.filterOptions(e.target.value);
        });

        // Add new option
        if (this.addNewBtn) {
            this.addNewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showModal('add');
            });
        }

        // Modal events
        this.modalSaveBtn.addEventListener('click', () => this.handleModalSave());
        this.modalCancelBtn.addEventListener('click', () => this.hideModal());
        this.modalCloseBtn.addEventListener('click', () => this.hideModal());
        
        // Modal overlay click to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });

        // Modal keyboard support
        this.modalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.handleModalSave();
            } else if (e.key === 'Escape') {
                this.hideModal();
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.close();
            }
        });

        // Listen for theme changes
        window.addEventListener('themeChanged', (e) => {
            this.customSelect.setAttribute('data-theme', e.detail.isDarkMode ? 'dark' : 'light');
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
                this.hideModal();
            }
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.isOpen = true;
        this.customSelect.classList.add('open');
        this.trigger.setAttribute('aria-expanded', 'true');
        this.panel.setAttribute('aria-hidden', 'false');
        
        // Focus search input
        setTimeout(() => {
            this.searchInput.focus();
        }, 100);
        
        // Reset search
        this.searchInput.value = '';
        this.filterOptions('');
    }

    close() {
        this.isOpen = false;
        this.customSelect.classList.remove('open');
        this.trigger.setAttribute('aria-expanded', 'false');
        this.panel.setAttribute('aria-hidden', 'true');
    }

    filterOptions(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        this.filteredData = this.data.filter(item => 
            item.text.toLowerCase().includes(term)
        );
        this.renderOptions();
    }

    render() {
        this.renderOptions();
    }

    renderOptions() {
        this.optionsList.innerHTML = '';
        
        if (this.filteredData.length === 0) {
            const emptyLi = document.createElement('li');
            emptyLi.className = 'option-item empty-state';
            emptyLi.innerHTML = `
                <span class="option-text">گزینه‌ای یافت نشد</span>
            `;
            this.optionsList.appendChild(emptyLi);
            return;
        }

        this.filteredData.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'option-item';
            li.setAttribute('role', 'option');
            li.setAttribute('data-value', item.value);
            
            if (item.value === this.selectedValue) {
                li.classList.add('selected');
                li.setAttribute('aria-selected', 'true');
            }

            li.innerHTML = `
                <span class="option-text">${item.text}</span>
                <div class="option-actions">
                    ${this.options.allowEdit ? `
                        <button type="button" class="action-btn edit-btn" title="ویرایش" data-index="${this.data.indexOf(item)}">
                            <i class="fas fa-edit"></i>
                        </button>
                    ` : ''}
                    ${this.options.allowDelete ? `
                        <button type="button" class="action-btn delete-btn" title="حذف" data-index="${this.data.indexOf(item)}">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            `;

            // Click to select
            li.addEventListener('click', (e) => {
                if (!e.target.closest('.option-actions')) {
                    this.selectOption(item);
                }
            });

            // Edit button
            const editBtn = li.querySelector('.edit-btn');
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.editOption(this.data.indexOf(item));
                });
            }

            // Delete button
            const deleteBtn = li.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteOption(this.data.indexOf(item));
                });
            }

            this.optionsList.appendChild(li);
        });
    }

    selectOption(item) {
        this.selectedValue = item.value;
        this.valueSpan.textContent = item.text;
        this.valueSpan.classList.add('has-value');
        
        // Update original select if exists
        const originalSelect = this.element.querySelector('select');
        if (originalSelect) {
            originalSelect.value = item.value;
            
            // Trigger change event
            const changeEvent = new Event('change', { bubbles: true });
            originalSelect.dispatchEvent(changeEvent);
        }
        
        // Dispatch custom event
        const customEvent = new CustomEvent('customSelectChange', {
            detail: { value: item.value, text: item.text, item: item }
        });
        this.element.dispatchEvent(customEvent);
        
        this.close();
    }

    showModal(mode, item = null) {
        this.modalMode = mode;
        this.editingItem = item;
        
        if (mode === 'add') {
            this.modalTitle.textContent = 'افزودن گزینه جدید';
            this.modalInput.value = '';
        } else if (mode === 'edit') {
            this.modalTitle.textContent = 'ویرایش گزینه';
            this.modalInput.value = item.text;
        }
        
        this.modal.style.display = 'flex';
        setTimeout(() => {
            this.modal.classList.add('show');
            this.modalInput.focus();
        }, 10);
    }

    hideModal() {
        this.modal.classList.remove('show');
        setTimeout(() => {
            this.modal.style.display = 'none';
        }, 300);
    }

    handleModalSave() {
        const text = this.modalInput.value.trim();
        
        if (!text) {
            this.modalInput.focus();
            return;
        }

        if (this.modalMode === 'add') {
            this.addOption(text);
        } else if (this.modalMode === 'edit') {
            this.updateOption(this.editingItem, text);
        }
        
        this.hideModal();
    }

    addOption(text) {
        const newItem = {
            id: Date.now().toString(),
            text: text,
            value: text
        };
        
        this.data.push(newItem);
        this.saveData();
        this.filterOptions(this.searchInput.value);
        
        // Show success animation
        this.showNotification('گزینه جدید اضافه شد', 'success');
    }

    editOption(index) {
        const item = this.data[index];
        if (item) {
            this.showModal('edit', item);
        }
    }

    updateOption(item, newText) {
        const index = this.data.indexOf(item);
        if (index !== -1) {
            this.data[index].text = newText;
            this.data[index].value = newText;
            
            // Update selected value display if this item is selected
            if (this.selectedValue === item.value) {
                this.valueSpan.textContent = newText;
            }
            
            this.saveData();
            this.filterOptions(this.searchInput.value);
            
            this.showNotification('گزینه ویرایش شد', 'success');
        }
    }

    deleteOption(index) {
        const item = this.data[index];
        if (!item) return;
        
        if (confirm(`${this.options.confirmDeleteText}\n"${item.text}"`)) {
            // If deleting selected item, reset selection
            if (this.selectedValue === item.value) {
                this.selectedValue = null;
                this.valueSpan.textContent = this.options.placeholder;
                this.valueSpan.classList.remove('has-value');
            }
            
            this.data.splice(index, 1);
            this.saveData();
            this.filterOptions(this.searchInput.value);
            
            this.showNotification('گزینه حذف شد', 'warning');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `custom-select-notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    loadData() {
        try {
            const stored = localStorage.getItem(this.options.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.warn('Error loading custom select data:', e);
            return [];
        }
    }

    saveData() {
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify(this.data));
        } catch (e) {
            console.warn('Error saving custom select data:', e);
        }
    }

    // Public API methods
    getValue() {
        return this.selectedValue;
    }

    setValue(value) {
        const item = this.data.find(item => item.value === value);
        if (item) {
            this.selectOption(item);
        }
    }

    getSelectedItem() {
        return this.data.find(item => item.value === this.selectedValue);
    }

    addData(items) {
        if (Array.isArray(items)) {
            items.forEach(item => {
                if (typeof item === 'string') {
                    this.data.push({ id: Date.now() + Math.random(), text: item, value: item });
                } else if (item.text) {
                    this.data.push({ ...item, id: item.id || Date.now() + Math.random() });
                }
            });
        }
        this.saveData();
        this.render();
    }

    destroy() {
        // Remove event listeners and DOM elements
        if (this.modal) {
            this.modal.remove();
        }
        
        const customSelectElement = this.element.querySelector('.custom-select');
        if (customSelectElement) {
            customSelectElement.remove();
        }
        
        // Show original select
        const originalSelect = this.element.querySelector('select');
        if (originalSelect) {
            originalSelect.style.display = '';
        }
    }
}

// Initialize all custom selects on page load
function initializeCustomSelects() {
    document.querySelectorAll('[data-custom-select]').forEach(element => {
        const options = JSON.parse(element.getAttribute('data-custom-select') || '{}');
        new CustomSelect(element, options);
    });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCustomSelects);
} else {
    initializeCustomSelects();
}

// Export for global access
window.CustomSelect = CustomSelect;
window.initializeCustomSelects = initializeCustomSelects;