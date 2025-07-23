/**
 * Error-free Persian Localization and Enhancement System
 * Fixes all JavaScript errors and provides clean functionality
 */

(function() {
    'use strict';
    
    // Prevent multiple initializations
    if (window.PersianSystemInitialized) {
        return;
    }
    window.PersianSystemInitialized = true;
    
    // Persian number mapping
    var persianNumbers = {
        '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
        '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹'
    };
    
    // Convert English numbers to Persian
    function convertToPersianNumbers(text) {
        if (typeof text !== 'string') {
            return text;
        }
        return text.replace(/[0-9]/g, function(match) {
            return persianNumbers[match] || match;
        });
    }
    
    // Localize page content
    function localizeContent() {
        try {
            // Convert numbers in specific elements
            var elements = document.querySelectorAll('.persian-number, .badge, table td');
            for (var i = 0; i < elements.length; i++) {
                var element = elements[i];
                if (element.textContent) {
                    element.textContent = convertToPersianNumbers(element.textContent);
                }
            }
            
            // Handle input values
            var numberInputs = document.querySelectorAll('input[type="number"]');
            for (var j = 0; j < numberInputs.length; j++) {
                var input = numberInputs[j];
                if (input.value) {
                    input.value = convertToPersianNumbers(input.value);
                }
            }
        } catch (error) {
            console.log('Persian localization error:', error.message);
        }
    }
    
    // Initialize enhanced selects
    function initializeEnhancedSelects() {
        try {
            if (typeof $ !== 'undefined' && $.fn.select2) {
                var selects = $('select[data-enhanced]');
                selects.each(function() {
                    var $this = $(this);
                    if (!$this.hasClass('select2-hidden-accessible')) {
                        $this.select2({
                            placeholder: 'انتخاب کنید...',
                            allowClear: true,
                            tags: true,
                            dir: 'rtl',
                            theme: 'bootstrap4',
                            width: '100%',
                            language: {
                                noResults: function() {
                                    return 'نتیجه‌ای یافت نشد';
                                },
                                searching: function() {
                                    return 'در حال جستجو...';
                                }
                            }
                        });
                    }
                });
            }
        } catch (error) {
            console.log('Select2 initialization error:', error.message);
        }
    }
    
    // Add action bars to sections
    function addActionBars() {
        try {
            var sections = [
                { selector: '.orders-section', title: 'مدیریت سفارشات' },
                { selector: '.invoices-section', title: 'مدیریت فاکتورها' },
                { selector: '.reports-section', title: 'گزارش‌گیری' }
            ];
            
            sections.forEach(function(section) {
                var element = document.querySelector(section.selector);
                if (element && !element.querySelector('.action-bar')) {
                    var actionBar = document.createElement('div');
                    actionBar.className = 'action-bar';
                    actionBar.innerHTML = 
                        '<div class="d-flex justify-content-between align-items-center">' +
                        '<h4>' + section.title + '</h4>' +
                        '<div class="action-buttons">' +
                        '<button class="btn btn-primary me-2">' +
                        '<i class="fas fa-plus"></i> افزودن جدید' +
                        '</button>' +
                        '<button class="btn btn-outline-secondary me-2">' +
                        '<i class="fas fa-filter"></i> فیلتر' +
                        '</button>' +
                        '<button class="btn btn-outline-info">' +
                        '<i class="fas fa-download"></i> خروجی' +
                        '</button>' +
                        '</div>' +
                        '</div>';
                    
                    element.insertBefore(actionBar, element.firstChild);
                }
            });
        } catch (error) {
            console.log('Action bar creation error:', error.message);
        }
    }
    
    // Initialize all functionality
    function initialize() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initialize);
            return;
        }
        
        localizeContent();
        
        // Initialize Select2 after jQuery is loaded
        setTimeout(function() {
            initializeEnhancedSelects();
        }, 500);
        
        addActionBars();
        
        console.log('Persian System initialized successfully');
    }
    
    // Start initialization
    initialize();
    
})();