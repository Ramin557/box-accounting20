/**
 * Advanced Form Enhancement with Validation
 * Optimized for Persian UI and better UX
 */

class FormEnhancer {
    constructor() {
        this.validationRules = {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            phone: /^(\+98|0)?9\d{9}$/,
            nationalId: /^\d{10}$/,
            postalCode: /^\d{10}$/,
            iban: /^IR\d{24}$/
        };
        
        this.persianMessages = {
            required: 'این فیلد الزامی است',
            email: 'فرمت ایمیل صحیح نیست',
            phone: 'شماره تلفن صحیح نیست',
            nationalId: 'کد ملی صحیح نیست',
            minLength: 'حداقل {min} کاراکتر وارد کنید',
            maxLength: 'حداکثر {max} کاراکتر مجاز است',
            number: 'فقط عدد وارد کنید',
            iban: 'شماره شبا صحیح نیست (مثال: IR123456789012345678901234)'
        };
        
        this.init();
    }
    
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.enhanceAllForms();
            this.addGlobalFormStyles();
        });
        
        // Handle dynamically added forms
        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver(() => {
                this.enhanceAllForms();
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }
    
    enhanceAllForms() {
        const forms = document.querySelectorAll('form:not([data-enhanced])');
        forms.forEach(form => this.enhanceForm(form));
    }
    
    enhanceForm(form) {
        form.setAttribute('data-enhanced', 'true');
        form.setAttribute('novalidate', 'true'); // Disable browser validation
        
        // Add form wrapper class
        form.classList.add('enhanced-form');
        
        // Enhance input fields
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => this.enhanceInput(input));
        
        // Add submit handler
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Add real-time validation
        form.addEventListener('input', (e) => this.validateField(e.target));
        form.addEventListener('blur', (e) => this.validateField(e.target), true);
    }
    
    enhanceInput(input) {
        if (input.hasAttribute('data-input-enhanced')) return;
        input.setAttribute('data-input-enhanced', 'true');
        
        // Add wrapper for styling
        this.wrapInput(input);
        
        // Add input type specific enhancements
        this.addInputTypeEnhancements(input);
        
        // Add character counter for text inputs with maxlength
        if (input.maxLength > 0 && (input.type === 'text' || input.type === 'textarea')) {
            this.addCharacterCounter(input);
        }
        
        // Add password toggle for password fields
        if (input.type === 'password') {
            this.addPasswordToggle(input);
        }
        
        // Format numbers for Persian display
        if (input.classList.contains('persian-number') || input.type === 'number') {
            this.addNumberFormatting(input);
        }
    }
    
    wrapInput(input) {
        if (input.parentElement.classList.contains('enhanced-input-wrapper')) return;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'enhanced-input-wrapper position-relative';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        
        // Add floating label if placeholder exists
        const placeholder = input.getAttribute('placeholder');
        if (placeholder && !input.previousElementSibling?.classList.contains('floating-label')) {
            const label = document.createElement('label');
            label.className = 'floating-label';
            label.textContent = placeholder;
            label.setAttribute('for', input.id || '');
            wrapper.insertBefore(label, input);
            input.removeAttribute('placeholder');
        }
    }
    
    addInputTypeEnhancements(input) {
        switch (input.type) {
            case 'tel':
            case 'phone':
                input.addEventListener('input', (e) => this.formatPhoneNumber(e.target));
                break;
                
            case 'email':
                input.addEventListener('blur', (e) => this.validateEmail(e.target));
                break;
                
            case 'number':
                input.addEventListener('input', (e) => this.formatNumber(e.target));
                break;
        }
        
        // Add special handling for Persian specific inputs
        if (input.classList.contains('national-id')) {
            input.addEventListener('input', (e) => this.formatNationalId(e.target));
        }
        
        if (input.classList.contains('iban')) {
            input.addEventListener('input', (e) => this.formatIban(e.target));
        }
    }
    
    addCharacterCounter(input) {
        const wrapper = input.parentElement;
        if (wrapper.querySelector('.character-counter')) return;
        
        const counter = document.createElement('div');
        counter.className = 'character-counter text-muted small';
        this.updateCharacterCounter(input, counter);
        wrapper.appendChild(counter);
        
        input.addEventListener('input', () => this.updateCharacterCounter(input, counter));
    }
    
    updateCharacterCounter(input, counter) {
        const current = input.value.length;
        const max = input.maxLength;
        counter.textContent = `${this.toPersianNumber(current)} / ${this.toPersianNumber(max)}`;
        
        if (current > max * 0.8) {
            counter.classList.add('text-warning');
        }
        if (current >= max) {
            counter.classList.add('text-danger');
            counter.classList.remove('text-warning');
        }
        if (current < max * 0.8) {
            counter.classList.remove('text-warning', 'text-danger');
        }
    }
    
    addPasswordToggle(input) {
        const wrapper = input.parentElement;
        if (wrapper.querySelector('.password-toggle')) return;
        
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'password-toggle btn btn-link position-absolute';
        toggle.innerHTML = '<i class="fas fa-eye"></i>';
        toggle.style.cssText = `
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            border: none;
            background: none;
            color: #6c757d;
            padding: 0;
            width: 20px;
            height: 20px;
        `;
        
        wrapper.appendChild(toggle);
        
        toggle.addEventListener('click', () => {
            if (input.type === 'password') {
                input.type = 'text';
                toggle.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                input.type = 'password';
                toggle.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    }
    
    addNumberFormatting(input) {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^\d]/g, '');
            if (value) {
                // Add thousand separators
                value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                e.target.value = this.toPersianNumber(value);
            }
        });
        
        input.addEventListener('focus', (e) => {
            // Remove formatting for editing
            let value = e.target.value.replace(/[,،]/g, '');
            e.target.value = this.toEnglishNumber(value);
        });
        
        input.addEventListener('blur', (e) => {
            // Re-apply formatting
            let value = e.target.value.replace(/[^\d]/g, '');
            if (value) {
                value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                e.target.value = this.toPersianNumber(value);
            }
        });
    }
    
    validateField(input) {
        if (!input || input.type === 'submit' || input.type === 'button') return;
        
        this.clearFieldError(input);
        
        let isValid = true;
        let errorMessage = '';
        
        // Required field validation
        if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            errorMessage = this.persianMessages.required;
        }
        
        // Type specific validation
        if (isValid && input.value.trim()) {
            switch (input.type) {
                case 'email':
                    if (!this.validationRules.email.test(input.value)) {
                        isValid = false;
                        errorMessage = this.persianMessages.email;
                    }
                    break;
                    
                case 'tel':
                    if (!this.validationRules.phone.test(input.value.replace(/\D/g, ''))) {
                        isValid = false;
                        errorMessage = this.persianMessages.phone;
                    }
                    break;
            }
            
            // Class specific validation
            if (input.classList.contains('national-id')) {
                if (!this.validateNationalId(input.value)) {
                    isValid = false;
                    errorMessage = this.persianMessages.nationalId;
                }
            }
            
            if (input.classList.contains('iban')) {
                if (!this.validationRules.iban.test(input.value.replace(/\s/g, ''))) {
                    isValid = false;
                    errorMessage = this.persianMessages.iban;
                }
            }
            
            // Length validation
            if (input.minLength && input.value.length < input.minLength) {
                isValid = false;
                errorMessage = this.persianMessages.minLength.replace('{min}', this.toPersianNumber(input.minLength.toString()));
            }
            
            if (input.maxLength && input.value.length > input.maxLength) {
                isValid = false;
                errorMessage = this.persianMessages.maxLength.replace('{max}', this.toPersianNumber(input.maxLength.toString()));
            }
        }
        
        if (!isValid) {
            this.showFieldError(input, errorMessage);
        } else {
            this.showFieldSuccess(input);
        }
        
        return isValid;
    }
    
    showFieldError(input, message) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        
        const wrapper = input.parentElement;
        const errorDiv = wrapper.querySelector('.invalid-feedback') || document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        
        if (!wrapper.querySelector('.invalid-feedback')) {
            wrapper.appendChild(errorDiv);
        }
        
        // Add shake animation
        input.style.animation = 'shake 0.5s';
        setTimeout(() => {
            input.style.animation = '';
        }, 500);
    }
    
    showFieldSuccess(input) {
        input.classList.add('is-valid');
        input.classList.remove('is-invalid');
        this.clearFieldError(input);
    }
    
    clearFieldError(input) {
        input.classList.remove('is-invalid', 'is-valid');
        const wrapper = input.parentElement;
        const errorDiv = wrapper.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
    
    handleFormSubmit(e) {
        const form = e.target;
        const inputs = form.querySelectorAll('input, textarea, select');
        let isFormValid = true;
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>در حال ارسال...';
            
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
                submitBtn.textContent = originalText;
            }, 2000);
        }
        
        // Validate all fields
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });
        
        if (!isFormValid) {
            e.preventDefault();
            
            // Focus on first invalid field
            const firstInvalid = form.querySelector('.is-invalid');
            if (firstInvalid) {
                firstInvalid.focus();
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            // Show error message
            this.showFormError('لطفاً خطاهای فرم را برطرف کنید.');
        }
    }
    
    showFormError(message) {
        // Remove existing alerts
        const existingAlert = document.querySelector('.form-error-alert');
        if (existingAlert) existingAlert.remove();
        
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger form-error-alert';
        alert.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Insert at top of page
        document.body.insertBefore(alert, document.body.firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }
    
    // Formatting methods
    formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.startsWith('98')) {
            value = '0' + value.substring(2);
        }
        
        if (value.length > 0 && !value.startsWith('0')) {
            value = '0' + value;
        }
        
        // Format: 0912 345 6789
        if (value.length > 4) {
            value = value.substring(0, 4) + ' ' + value.substring(4);
        }
        if (value.length > 8) {
            value = value.substring(0, 8) + ' ' + value.substring(8, 12);
        }
        
        input.value = this.toPersianNumber(value);
    }
    
    formatNationalId(input) {
        let value = input.value.replace(/\D/g, '').substring(0, 10);
        input.value = this.toPersianNumber(value);
    }
    
    formatIban(input) {
        let value = input.value.replace(/\s/g, '').toUpperCase();
        if (!value.startsWith('IR')) {
            if (/^\d/.test(value)) {
                value = 'IR' + value;
            }
        }
        
        // Add spaces every 4 characters
        value = value.replace(/(.{4})/g, '$1 ').trim();
        input.value = value;
    }
    
    validateNationalId(nationalId) {
        const id = nationalId.replace(/\D/g, '');
        if (id.length !== 10) return false;
        
        // Check for repeated digits
        if (/^(\d)\1{9}$/.test(id)) return false;
        
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(id.charAt(i)) * (10 - i);
        }
        
        const remainder = sum % 11;
        const checkDigit = parseInt(id.charAt(9));
        
        return (remainder < 2 && checkDigit === remainder) || 
               (remainder >= 2 && checkDigit === 11 - remainder);
    }
    
    validateEmail(input) {
        if (input.value && !this.validationRules.email.test(input.value)) {
            this.showFieldError(input, this.persianMessages.email);
        }
    }
    
    formatNumber(input) {
        let value = input.value.replace(/[^\d.-]/g, '');
        input.value = value;
    }
    
    // Utility methods
    toPersianNumber(str) {
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return str.replace(/[0-9]/g, (match) => persianDigits[parseInt(match)]);
    }
    
    toEnglishNumber(str) {
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        let result = str;
        persianDigits.forEach((persian, index) => {
            result = result.replace(new RegExp(persian, 'g'), index.toString());
        });
        return result;
    }
    
    addGlobalFormStyles() {
        if (document.getElementById('form-enhancement-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'form-enhancement-styles';
        style.textContent = `
            .enhanced-form .enhanced-input-wrapper {
                margin-bottom: 1rem;
            }
            
            .enhanced-form .floating-label {
                position: absolute;
                top: 0.75rem;
                right: 1rem;
                color: #6c757d;
                pointer-events: none;
                transition: all 0.2s ease-in-out;
                background: white;
                padding: 0 0.25rem;
                z-index: 2;
            }
            
            .enhanced-form .form-control:focus + .floating-label,
            .enhanced-form .form-control:not(:placeholder-shown) + .floating-label {
                top: -0.5rem;
                font-size: 0.875rem;
                color: var(--primary-color);
            }
            
            .enhanced-form .character-counter {
                position: absolute;
                bottom: -1.25rem;
                left: 0;
                font-size: 0.75rem;
            }
            
            .enhanced-form .form-control.is-invalid {
                animation: shake 0.5s ease-in-out;
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            
            .form-error-alert {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 9999;
                min-width: 300px;
                animation: slideDown 0.3s ease-out;
            }
            
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
            
            .enhanced-form .loading {
                position: relative;
                color: transparent !important;
            }
            
            .enhanced-form .loading::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 16px;
                height: 16px;
                margin: -8px 0 0 -8px;
                border: 2px solid transparent;
                border-top: 2px solid currentColor;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize Form Enhancer
window.FormEnhancerInstance = new FormEnhancer();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormEnhancer;
}