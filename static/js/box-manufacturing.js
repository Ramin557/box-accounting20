/**
 * Box Manufacturing Business Logic
 * Persian Accounting System - Manufacturing Features
 */

class BoxManufacturingManager {
    constructor() {
        this.boxTypes = {
            'corrugated': { name: 'مقوای موج‌دار', icon: '📦', strength: 'متوسط' },
            'cardboard': { name: 'مقوای ساده', icon: '📄', strength: 'کم' },
            'kraft': { name: 'کرافت', icon: '📋', strength: 'زیاد' },
            'microflute': { name: 'میکرو فلوت', icon: '📑', strength: 'کم' },
            'doublewall': { name: 'دو جداره', icon: '📊', strength: 'زیاد' },
            'triplewall': { name: 'سه جداره', icon: '📚', strength: 'خیلی زیاد' }
        };
        
        this.standardSizes = {
            'small': { name: 'کوچک', dimensions: [20, 15, 10] },
            'medium': { name: 'متوسط', dimensions: [30, 25, 20] },
            'large': { name: 'بزرگ', dimensions: [40, 35, 30] },
            'xl': { name: 'خیلی بزرگ', dimensions: [50, 45, 40] },
            'custom': { name: 'سفارشی', dimensions: [0, 0, 0] }
        };
        
        this.init();
    }
    
    init() {
        this.initializeBoxCalculator();
        this.initializeMaterialSelector();
        this.initializeSizeSelector();
        this.setupProductionStatusUpdates();
    }
    
    initializeBoxCalculator() {
        // Box volume and cost calculator
        const calculatorInputs = document.querySelectorAll('.box-calculator input');
        calculatorInputs.forEach(input => {
            input.addEventListener('input', this.calculateBoxMetrics.bind(this));
        });
    }
    
    calculateBoxMetrics() {
        const length = parseFloat(document.querySelector('[data-dimension="length"]')?.value) || 0;
        const width = parseFloat(document.querySelector('[data-dimension="width"]')?.value) || 0;
        const height = parseFloat(document.querySelector('[data-dimension="height"]')?.value) || 0;
        const quantity = parseInt(document.querySelector('[data-field="quantity"]')?.value) || 1;
        
        // Calculate volume (in cubic centimeters)
        const volume = length * width * height;
        
        // Calculate surface area for material cost
        const surfaceArea = 2 * (length * width + length * height + width * height);
        
        // Estimate material cost (example pricing)
        const materialCostPerCm2 = 0.05; // ریال per square cm
        const materialCost = surfaceArea * materialCostPerCm2;
        
        // Production cost calculation
        const laborCost = this.calculateLaborCost(volume, quantity);
        const totalCost = (materialCost + laborCost) * quantity;
        
        // Update display
        this.updateCalculationResults({
            volume: volume,
            surfaceArea: surfaceArea,
            materialCost: materialCost,
            laborCost: laborCost,
            totalCost: totalCost,
            quantity: quantity
        });
    }
    
    calculateLaborCost(volume, quantity) {
        // Labor cost based on complexity and volume
        const baseRate = 500; // ریال base rate
        const volumeMultiplier = Math.log10(volume / 1000 + 1);
        const quantityDiscount = quantity > 100 ? 0.9 : quantity > 50 ? 0.95 : 1;
        
        return baseRate * volumeMultiplier * quantityDiscount;
    }
    
    updateCalculationResults(results) {
        const resultContainer = document.querySelector('.calculator-result');
        if (!resultContainer) return;
        
        resultContainer.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <strong>حجم:</strong> ${this.formatNumber(results.volume)} سانتی‌متر مکعب<br>
                    <strong>سطح:</strong> ${this.formatNumber(results.surfaceArea)} سانتی‌متر مربع<br>
                    <strong>تعداد:</strong> ${this.formatNumber(results.quantity)} عدد
                </div>
                <div class="col-md-6">
                    <strong>هزینه مواد:</strong> ${this.formatCurrency(results.materialCost)}<br>
                    <strong>هزینه کار:</strong> ${this.formatCurrency(results.laborCost)}<br>
                    <strong>مجموع:</strong> <span class="h5 text-warning">${this.formatCurrency(results.totalCost)}</span>
                </div>
            </div>
        `;
    }
    
    initializeMaterialSelector() {
        const materialOptions = document.querySelectorAll('.material-option');
        materialOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                // Remove previous selection
                materialOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Add selection to clicked option
                e.target.classList.add('selected');
                
                // Update hidden input if exists
                const materialInput = document.querySelector('[name="material_type"]');
                if (materialInput) {
                    materialInput.value = e.target.dataset.material;
                }
                
                // Recalculate costs based on material
                this.calculateBoxMetrics();
            });
        });
    }
    
    initializeSizeSelector() {
        const sizeOptions = document.querySelectorAll('.size-option');
        sizeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                // Remove previous selection
                sizeOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Add selection
                e.target.classList.add('selected');
                
                const sizeKey = e.target.dataset.size;
                if (sizeKey && this.standardSizes[sizeKey]) {
                    const dimensions = this.standardSizes[sizeKey].dimensions;
                    
                    // Auto-fill dimension inputs
                    const lengthInput = document.querySelector('[data-dimension="length"]');
                    const widthInput = document.querySelector('[data-dimension="width"]');
                    const heightInput = document.querySelector('[data-dimension="height"]');
                    
                    if (lengthInput) lengthInput.value = dimensions[0];
                    if (widthInput) widthInput.value = dimensions[1];
                    if (heightInput) heightInput.value = dimensions[2];
                    
                    // Trigger calculation
                    this.calculateBoxMetrics();
                }
            });
        });
    }
    
    setupProductionStatusUpdates() {
        // Auto-update production status based on time and actions
        const statusElements = document.querySelectorAll('.production-status');
        statusElements.forEach(element => {
            this.enhanceStatusDisplay(element);
        });
    }
    
    enhanceStatusDisplay(statusElement) {
        const status = statusElement.textContent.trim();
        const statusMap = {
            'در انتظار': 'status-pending',
            'در حال تولید': 'status-in-production',
            'تکمیل شده': 'status-completed',
            'ارسال شده': 'status-shipped'
        };
        
        // Add appropriate class
        Object.keys(statusMap).forEach(key => {
            if (status.includes(key)) {
                statusElement.className += ' ' + statusMap[key];
            }
        });
        
        // Add icon based on status
        const icons = {
            'در انتظار': '⏳',
            'در حال تولید': '🏭',
            'تکمیل شده': '✅',
            'ارسال شده': '🚚'
        };
        
        Object.keys(icons).forEach(key => {
            if (status.includes(key)) {
                statusElement.innerHTML = `${icons[key]} ${status}`;
            }
        });
    }
    
    // Persian number formatting
    formatNumber(number) {
        return new Intl.NumberFormat('fa-IR').format(Math.round(number));
    }
    
    // Persian currency formatting
    formatCurrency(amount) {
        const formatted = new Intl.NumberFormat('fa-IR').format(Math.round(amount));
        return `${formatted} ریال`;
    }
    
    // Generate box specifications string
    generateBoxSpecs(length, width, height, material) {
        const materialName = this.boxTypes[material]?.name || material;
        return `جعبه ${materialName} - ابعاد: ${length}×${width}×${height} سانتی‌متر`;
    }
    
    // Quick actions for manufacturing operations
    static quickActions = {
        startProduction: function(orderId) {
            if (confirm('آیا مطمئن هستید که می‌خواهید تولید این سفارش را شروع کنید؟')) {
                // Update status via AJAX
                fetch(`/orders/${orderId}/start-production`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': document.querySelector('[name=csrf_token]')?.value
                    }
                }).then(response => {
                    if (response.ok) {
                        location.reload();
                    }
                });
            }
        },
        
        completeProduction: function(orderId) {
            if (confirm('آیا تولید این سفارش تکمیل شده است؟')) {
                fetch(`/orders/${orderId}/complete-production`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': document.querySelector('[name=csrf_token]')?.value
                    }
                }).then(response => {
                    if (response.ok) {
                        location.reload();
                    }
                });
            }
        },
        
        printLabel: function(orderId) {
            window.open(`/orders/${orderId}/print-label`, '_blank');
        }
    };
}

// Persian Date Utilities for Manufacturing
class PersianManufacturingDate {
    static formatDeliveryDate(date) {
        // Convert to Persian calendar and add business days
        const persianDate = new Intl.DateTimeFormat('fa-IR-u-ca-persian').format(date);
        return `تحویل تا: ${persianDate}`;
    }
    
    static calculateProductionTime(volume, quantity) {
        // Estimate production time based on volume and quantity
        const baseHours = 2; // 2 hours base time
        const volumeFactor = Math.log10(volume / 1000 + 1);
        const quantityFactor = Math.sqrt(quantity);
        
        const totalHours = baseHours * volumeFactor * quantityFactor;
        const days = Math.ceil(totalHours / 8); // 8-hour work days
        
        return `${days} روز کاری`;
    }
}

// Enhanced Form Validation for Box Manufacturing
class ManufacturingFormValidator {
    static validateDimensions(length, width, height) {
        const errors = [];
        
        if (length <= 0 || width <= 0 || height <= 0) {
            errors.push('تمام ابعاد باید مثبت باشند');
        }
        
        if (length > 200 || width > 200 || height > 200) {
            errors.push('ابعاد نمی‌تواند بیشتر از ۲۰۰ سانتی‌متر باشد');
        }
        
        const volume = length * width * height;
        if (volume > 1000000) { // 1 cubic meter
            errors.push('حجم جعبه خیلی بزرگ است');
        }
        
        return errors;
    }
    
    static validateQuantity(quantity) {
        const errors = [];
        
        if (quantity <= 0) {
            errors.push('تعداد باید مثبت باشد');
        }
        
        if (quantity > 10000) {
            errors.push('حداکثر تعداد قابل سفارش ۱۰۰۰۰ عدد است');
        }
        
        return errors;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    try {
        window.boxManufacturingManager = new BoxManufacturingManager();
        console.log('Box manufacturing manager initialized successfully');
    } catch (error) {
        console.error('Error initializing box manufacturing manager:', error);
    }
});

// Export for global access
window.BoxManufacturingManager = BoxManufacturingManager;
window.PersianManufacturingDate = PersianManufacturingDate;
window.ManufacturingFormValidator = ManufacturingFormValidator;