/**
 * Dropdown Management System
 * Handles add/edit/delete operations for category, unit, and material type dropdowns
 */

class DropdownManager {
    constructor() {
        this.initializeEventListeners();
        console.log('Dropdown Manager initialized successfully');
    }

    initializeEventListeners() {
        // Wait for DOM to be ready
        document.addEventListener('DOMContentLoaded', () => {
            this.attachButtonListeners();
        });

        // Also try immediate attachment in case DOM is already ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.attachButtonListeners());
        } else {
            this.attachButtonListeners();
        }
    }

    attachButtonListeners() {
        // Category management buttons
        this.attachCategoryListeners();
        
        // Unit management buttons  
        this.attachUnitListeners();
        
        // Material type management buttons
        this.attachMaterialListeners();
    }

    attachCategoryListeners() {
        const categorySection = document.querySelector('#category')?.closest('.input-group');
        if (categorySection) {
            const addBtn = categorySection.querySelector('.btn-outline-primary');
            const editBtn = categorySection.querySelector('.btn-outline-info');
            const deleteBtn = categorySection.querySelector('.btn-outline-danger');

            if (addBtn) {
                addBtn.addEventListener('click', () => this.addCategory());
            }
            if (editBtn) {
                editBtn.addEventListener('click', () => this.editCategories());
            }
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this.deleteCategory());
            }
        }
    }

    attachUnitListeners() {
        const unitSection = document.querySelector('#unit')?.closest('.input-group');
        if (unitSection) {
            const addBtn = unitSection.querySelector('.btn-outline-primary');
            const editBtn = unitSection.querySelector('.btn-outline-info');  
            const deleteBtn = unitSection.querySelector('.btn-outline-danger');

            if (addBtn) {
                addBtn.addEventListener('click', () => this.addUnit());
            }
            if (editBtn) {
                editBtn.addEventListener('click', () => this.editUnits());
            }
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this.deleteUnit());
            }
        }
    }

    attachMaterialListeners() {
        const materialSection = document.querySelector('#material_type')?.closest('.input-group');
        if (materialSection) {
            const addBtn = materialSection.querySelector('.btn-outline-primary');
            const editBtn = materialSection.querySelector('.btn-outline-info');
            const deleteBtn = materialSection.querySelector('.btn-outline-danger');

            if (addBtn) {
                addBtn.addEventListener('click', () => this.addMaterial());
            }
            if (editBtn) {
                editBtn.addEventListener('click', () => this.editMaterials());
            }
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this.deleteMaterial());
            }
        }
    }

    // Category management methods
    addCategory() {
        const newCategory = prompt('نام دسته‌بندی جدید را وارد کنید:');
        if (newCategory && newCategory.trim()) {
            this.addOptionToSelect('category', newCategory.trim());
            this.showSuccess(`دسته‌بندی "${newCategory}" با موفقیت اضافه شد`);
        }
    }

    editCategories() {
        const select = document.getElementById('category');
        const currentValue = select.value;
        if (!currentValue) {
            this.showWarning('ابتدا یک دسته‌بندی را انتخاب کنید');
            return;
        }
        
        const newName = prompt('نام جدید برای دسته‌بندی:', currentValue);
        if (newName && newName.trim() && newName.trim() !== currentValue) {
            this.updateSelectOption('category', currentValue, newName.trim());
            this.showSuccess(`دسته‌بندی به "${newName}" تغییر یافت`);
        }
    }

    deleteCategory() {
        const select = document.getElementById('category');
        const currentValue = select.value;
        if (!currentValue) {
            this.showWarning('ابتدا یک دسته‌بندی را انتخاب کنید');
            return;
        }
        
        if (confirm(`آیا مطمئن هستید که می‌خواهید دسته‌بندی "${currentValue}" را حذف کنید؟`)) {
            this.removeSelectOption('category', currentValue);
            this.showSuccess(`دسته‌بندی "${currentValue}" حذف شد`);
        }
    }

    // Unit management methods
    addUnit() {
        const newUnit = prompt('نام واحد جدید را وارد کنید:');
        if (newUnit && newUnit.trim()) {
            this.addOptionToSelect('unit', newUnit.trim());
            this.showSuccess(`واحد "${newUnit}" با موفقیت اضافه شد`);
        }
    }

    editUnits() {
        const select = document.getElementById('unit');
        const currentValue = select.value;
        if (!currentValue) {
            this.showWarning('ابتدا یک واحد را انتخاب کنید');
            return;
        }
        
        const newName = prompt('نام جدید برای واحد:', currentValue);
        if (newName && newName.trim() && newName.trim() !== currentValue) {
            this.updateSelectOption('unit', currentValue, newName.trim());
            this.showSuccess(`واحد به "${newName}" تغییر یافت`);
        }
    }

    deleteUnit() {
        const select = document.getElementById('unit');
        const currentValue = select.value;
        if (!currentValue) {
            this.showWarning('ابتدا یک واحد را انتخاب کنید');
            return;
        }
        
        if (confirm(`آیا مطمئن هستید که می‌خواهید واحد "${currentValue}" را حذف کنید؟`)) {
            this.removeSelectOption('unit', currentValue);
            this.showSuccess(`واحد "${currentValue}" حذف شد`);
        }
    }

    // Material management methods
    addMaterial() {
        const newMaterial = prompt('نام نوع مواد جدید را وارد کنید:');
        if (newMaterial && newMaterial.trim()) {
            this.addOptionToSelect('material_type', newMaterial.trim());
            this.showSuccess(`نوع مواد "${newMaterial}" با موفقیت اضافه شد`);
        }
    }

    editMaterials() {
        const select = document.getElementById('material_type');
        const currentValue = select.value;
        if (!currentValue) {
            this.showWarning('ابتدا یک نوع مواد را انتخاب کنید');
            return;
        }
        
        const newName = prompt('نام جدید برای نوع مواد:', currentValue);
        if (newName && newName.trim() && newName.trim() !== currentValue) {
            this.updateSelectOption('material_type', currentValue, newName.trim());
            this.showSuccess(`نوع مواد به "${newName}" تغییر یافت`);
        }
    }

    deleteMaterial() {
        const select = document.getElementById('material_type');
        const currentValue = select.value;
        if (!currentValue) {
            this.showWarning('ابتدا یک نوع مواد را انتخاب کنید');
            return;
        }
        
        if (confirm(`آیا مطمئن هستید که می‌خواهید نوع مواد "${currentValue}" را حذف کنید؟`)) {
            this.removeSelectOption('material_type', currentValue);
            this.showSuccess(`نوع مواد "${currentValue}" حذف شد`);
        }
    }

    // Helper methods
    addOptionToSelect(selectId, optionText) {
        const select = document.getElementById(selectId);
        if (select) {
            const option = document.createElement('option');
            option.value = optionText;
            option.textContent = optionText;
            select.appendChild(option);
            select.value = optionText; // Select the newly added option
        }
    }

    updateSelectOption(selectId, oldValue, newValue) {
        const select = document.getElementById(selectId);
        if (select) {
            const option = select.querySelector(`option[value="${oldValue}"]`);
            if (option) {
                option.value = newValue;
                option.textContent = newValue;
                select.value = newValue;
            }
        }
    }

    removeSelectOption(selectId, optionValue) {
        const select = document.getElementById(selectId);
        if (select) {
            const option = select.querySelector(`option[value="${optionValue}"]`);
            if (option) {
                option.remove();
                select.value = ''; // Clear selection
            }
        }
    }

    // Notification methods
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showWarning(message) {
        this.showNotification(message, 'warning');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            direction: rtl;
        `;
        
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

// Initialize the dropdown manager
new DropdownManager();