/**
 * UI/UX Enhancement JavaScript for Persian Accounting System
 * Addresses layout, responsiveness, visual states, and accessibility issues
 */

class UIEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.setupResponsiveGrid();
        this.setupButtonStates();
        this.setupFormValidation();
        this.setupAccessibility();
        this.setupChartFixes();
        this.setupLoadingStates();
        this.setupPersianNumbers();
    }

    // 1. RESPONSIVE GRID FIXES
    setupResponsiveGrid() {
        // Fix Bootstrap grid overlapping issues
        const gridItems = document.querySelectorAll('.col-md-6.col-lg-4');
        
        const handleResize = () => {
            const width = window.innerWidth;
            
            // Clear any existing clear styles
            gridItems.forEach(item => {
                item.style.clear = '';
            });
            
            // Apply appropriate clearing based on viewport
            if (width >= 992) {
                // Large screens: clear every 3rd item
                gridItems.forEach((item, index) => {
                    if ((index + 1) % 3 === 1) {
                        item.style.clear = 'left';
                    }
                });
            } else if (width >= 768) {
                // Medium screens: clear every 2nd item
                gridItems.forEach((item, index) => {
                    if ((index + 1) % 2 === 1) {
                        item.style.clear = 'left';
                    }
                });
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial call
    }

    // 2. BUTTON VISUAL STATES
    setupButtonStates() {
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(btn => {
            // Add loading state capability
            if (!btn.querySelector('.spinner')) {
                const spinner = document.createElement('span');
                spinner.className = 'spinner';
                spinner.setAttribute('aria-hidden', 'true');
                btn.insertBefore(spinner, btn.firstChild);
            }

            // Wrap text content
            if (!btn.querySelector('.btn-text')) {
                const textNodes = Array.from(btn.childNodes).filter(node => 
                    node.nodeType === Node.TEXT_NODE && node.textContent.trim()
                );
                
                if (textNodes.length > 0) {
                    const wrapper = document.createElement('span');
                    wrapper.className = 'btn-text';
                    wrapper.textContent = textNodes.map(node => node.textContent).join('');
                    textNodes.forEach(node => node.remove());
                    btn.appendChild(wrapper);
                }
            }

            // Enhanced hover effects
            btn.addEventListener('mouseenter', () => {
                if (!btn.disabled && !btn.classList.contains('loading')) {
                    btn.style.transform = 'translateY(-1px)';
                }
            });

            btn.addEventListener('mouseleave', () => {
                if (!btn.disabled && !btn.classList.contains('loading')) {
                    btn.style.transform = 'translateY(0)';
                }
            });

            // Click effect
            btn.addEventListener('mousedown', () => {
                if (!btn.disabled && !btn.classList.contains('loading')) {
                    btn.style.transform = 'translateY(0)';
                }
            });

            btn.addEventListener('mouseup', () => {
                if (!btn.disabled && !btn.classList.contains('loading')) {
                    btn.style.transform = 'translateY(-1px)';
                }
            });
        });
    }

    // 3. FORM VALIDATION ENHANCEMENTS
    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, select, textarea');
            
            inputs.forEach(input => {
                // Clear validation states on input
                input.addEventListener('input', () => {
                    this.clearValidationState(input);
                });

                input.addEventListener('change', () => {
                    this.clearValidationState(input);
                });

                // Add blur validation
                input.addEventListener('blur', () => {
                    this.validateInput(input);
                });
            });

            // Form submission with loading state
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                    return false;
                }
                
                // Add loading state to submit button
                const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
                if (submitBtn) {
                    this.setButtonLoading(submitBtn, true);
                }
            });
        });
    }

    clearValidationState(input) {
        input.classList.remove('is-valid', 'is-invalid');
        const feedback = input.parentNode.querySelector('.invalid-feedback, .valid-feedback');
        if (feedback) {
            feedback.style.opacity = '0';
        }
    }

    validateInput(input) {
        const isValid = input.checkValidity();
        
        if (isValid) {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
        } else {
            input.classList.remove('is-valid');
            input.classList.add('is-invalid');
        }

        // Show appropriate feedback
        const invalidFeedback = input.parentNode.querySelector('.invalid-feedback');
        const validFeedback = input.parentNode.querySelector('.valid-feedback');
        
        if (invalidFeedback) {
            invalidFeedback.style.opacity = isValid ? '0' : '1';
        }
        if (validFeedback) {
            validFeedback.style.opacity = isValid ? '1' : '0';
        }

        return isValid;
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        let isFormValid = true;

        inputs.forEach(input => {
            if (!this.validateInput(input)) {
                isFormValid = false;
            }
        });

        return isFormValid;
    }

    // 4. ACCESSIBILITY ENHANCEMENTS
    setupAccessibility() {
        // Add proper labels to form controls
        const inputs = document.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
                const label = document.querySelector(`label[for="${input.id}"]`);
                if (label) {
                    input.setAttribute('aria-labelledby', label.id || `label-${input.id}`);
                    if (!label.id) {
                        label.id = `label-${input.id}`;
                    }
                }
            }

            // Add required indicator
            if (input.hasAttribute('required')) {
                const label = document.querySelector(`label[for="${input.id}"]`);
                if (label && !label.classList.contains('required')) {
                    label.classList.add('required');
                }
            }
        });

        // Enhanced delete button accessibility
        const deleteButtons = document.querySelectorAll('.delete-btn, .btn-delete, [onclick*="delete"]');
        
        deleteButtons.forEach(btn => {
            if (!btn.getAttribute('aria-label')) {
                const text = btn.textContent.trim() || 'حذف';
                btn.setAttribute('aria-label', `${text} - این عملیات قابل بازگشت نیست`);
            }
            
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            });
        });

        // Skip link for keyboard navigation
        if (!document.querySelector('.skip-link')) {
            const skipLink = document.createElement('a');
            skipLink.href = '#main-content';
            skipLink.className = 'skip-link';
            skipLink.textContent = 'پرش به محتوای اصلی';
            document.body.insertBefore(skipLink, document.body.firstChild);
        }

        // Add main content landmark
        const mainContent = document.querySelector('.container-fluid, .container');
        if (mainContent && !mainContent.getAttribute('role')) {
            mainContent.setAttribute('role', 'main');
            mainContent.id = 'main-content';
        }
    }

    // 5. CHART.JS FIXES
    setupChartFixes() {
        // Wait for Chart.js to load
        if (typeof Chart !== 'undefined') {
            this.initializeCharts();
        } else {
            // Retry after a delay if Chart.js not loaded yet
            setTimeout(() => {
                if (typeof Chart !== 'undefined') {
                    this.initializeCharts();
                }
            }, 1000);
        }
    }

    initializeCharts() {
        const chartContainers = document.querySelectorAll('.chart-container');
        
        chartContainers.forEach(container => {
            const canvas = container.querySelector('canvas');
            if (!canvas) return;

            // Fix data structure issues
            const ctx = canvas.getContext('2d');
            
            // Default chart configuration with proper data structure
            const defaultConfig = {
                type: 'line',
                data: {
                    labels: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'],
                    datasets: [{
                        label: 'فروش',
                        data: [12, 19, 3, 5, 2, 3],
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            labels: {
                                font: {
                                    family: 'Vazirmatn'
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            };

            // Initialize chart if not already done
            if (!canvas.chart) {
                try {
                    canvas.chart = new Chart(ctx, defaultConfig);
                } catch (error) {
                    console.error('Chart initialization error:', error);
                }
            }
        });
    }

    // 6. LOADING STATES
    setupLoadingStates() {
        // Global AJAX loading indicator
        if (typeof $ !== 'undefined') {
            $(document).ajaxStart(() => {
                this.showGlobalLoading();
            });

            $(document).ajaxStop(() => {
                this.hideGlobalLoading();
            });
        }
    }

    setButtonLoading(button, loading) {
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
            const spinner = button.querySelector('.spinner');
            if (spinner) {
                spinner.style.display = 'inline-block';
            }
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            const spinner = button.querySelector('.spinner');
            if (spinner) {
                spinner.style.display = 'none';
            }
        }
    }

    showGlobalLoading() {
        if (!document.querySelector('.global-loading')) {
            const loading = document.createElement('div');
            loading.className = 'global-loading';
            loading.innerHTML = `
                <div class="loading-backdrop">
                    <div class="loading-spinner">
                        <div class="spinner-border text-primary" role="status">
                            <span class="sr-only">در حال بارگذاری...</span>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(loading);
        }
    }

    hideGlobalLoading() {
        const loading = document.querySelector('.global-loading');
        if (loading) {
            loading.remove();
        }
    }

    // 7. PERSIAN NUMBER FORMATTING
    setupPersianNumbers() {
        const numberElements = document.querySelectorAll('.persian-numbers, [data-persian-numbers]');
        
        numberElements.forEach(element => {
            const text = element.textContent;
            const persianNumbers = this.toPersianNumbers(text);
            element.textContent = persianNumbers;
        });

        // Auto-format currency inputs
        const currencyInputs = document.querySelectorAll('input[data-currency]');
        
        currencyInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const value = e.target.value.replace(/[^\d]/g, '');
                const formatted = this.formatCurrency(value);
                e.target.value = formatted;
            });
        });
    }

    toPersianNumbers(str) {
        const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
        const englishDigits = '0123456789';
        
        let result = str;
        for (let i = 0; i < englishDigits.length; i++) {
            result = result.replace(new RegExp(englishDigits[i], 'g'), persianDigits[i]);
        }
        return result;
    }

    formatCurrency(value) {
        if (!value) return '';
        return parseInt(value).toLocaleString('fa-IR');
    }

    // 8. TABLE ENHANCEMENTS  
    setupTableEnhancements() {
        const tables = document.querySelectorAll('.table');
        
        tables.forEach(table => {
            // Add hover effects
            const rows = table.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                row.addEventListener('mouseenter', () => {
                    row.style.backgroundColor = 'rgba(13, 110, 253, 0.1)';
                    row.style.transform = 'translateX(-2px)';
                });

                row.addEventListener('mouseleave', () => {
                    row.style.backgroundColor = '';
                    row.style.transform = '';
                });
            });

            // Empty state handling
            if (rows.length === 0) {
                const tbody = table.querySelector('tbody');
                const thead = table.querySelector('thead');
                const colCount = thead ? thead.querySelectorAll('th').length : 1;
                
                const emptyRow = document.createElement('tr');
                const emptyCell = document.createElement('td');
                emptyCell.colSpan = colCount;
                emptyCell.className = 'text-center py-5 text-muted';
                emptyCell.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <h5>هیچ داده‌ای یافت نشد</h5>
                        <p>اطلاعاتی برای نمایش وجود ندارد</p>
                    </div>
                `;
                emptyRow.appendChild(emptyCell);
                tbody.appendChild(emptyRow);
            }
        });
    }
}

// Initialize UI enhancements when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new UIEnhancements();
});

// Additional global functions for backward compatibility
window.UIEnhancements = UIEnhancements;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIEnhancements;
}