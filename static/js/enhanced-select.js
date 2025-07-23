/**
 * Enhanced Select Dropdown with Select2
 * Provides search, add new items, and dark mode compatibility
 */

$(document).ready(function() {
    // Persian translations for Select2
    $.fn.select2.defaults.set('language', {
        errorLoading: function () {
            return 'نتایج قابل بارگیری نیست.';
        },
        inputTooLong: function (args) {
            var overChars = args.input.length - args.maximum;
            return 'لطفاً ' + overChars + ' کاراکتر را حذف کنید.';
        },
        inputTooShort: function (args) {
            var remainingChars = args.minimum - args.input.length;
            return 'لطفاً ' + remainingChars + ' کاراکتر یا بیشتر وارد کنید.';
        },
        loadingMore: function () {
            return 'در حال بارگیری نتایج بیشتر...';
        },
        maximumSelected: function (args) {
            return 'شما فقط می‌توانید ' + args.maximum + ' آیتم انتخاب کنید.';
        },
        noResults: function () {
            return 'هیچ نتیجه‌ای یافت نشد.';
        },
        searching: function () {
            return 'در حال جستجو...';
        },
        removeAllItems: function () {
            return 'همه آیتم‌ها را حذف کن';
        }
    });

    // Initialize Enhanced Select Dropdowns
    function initializeEnhancedSelects() {
        // Find all select elements with data-enhanced attribute
        $('select[data-enhanced]').each(function() {
            const $select = $(this);
            const config = $select.data('enhanced');
            
            // Default configuration
            const defaultConfig = {
                placeholder: 'انتخاب کنید...',
                allowClear: true,
                tags: true,
                tokenSeparators: [',', ' '],
                dir: 'rtl',
                theme: 'bootstrap4',
                width: '100%'
            };
            
            // Merge configurations
            const finalConfig = $.extend({}, defaultConfig, config);
            
            // Initialize Select2
            $select.select2(finalConfig);
            
            // Handle new tag creation
            $select.on('select2:select', function(e) {
                const data = e.params.data;
                
                // If it's a new tag (has no id or id equals text)
                if (data.newTag || !data.id || data.id === data.text) {
                    // Store in localStorage if storage key is provided
                    if (config && config.storageKey) {
                        const existingItems = JSON.parse(localStorage.getItem(config.storageKey) || '[]');
                        if (!existingItems.includes(data.text)) {
                            existingItems.push(data.text);
                            localStorage.setItem(config.storageKey, JSON.stringify(existingItems));
                        }
                    }
                    
                    // Show success message
                    showNotification('success', `"${data.text}" به گزینه‌ها اضافه شد.`);
                }
            });
        });
        
        // Initialize category management dropdowns
        initializeCategoryDropdowns();
        
        // Initialize unit dropdowns
        initializeUnitDropdowns();
    }
    
    // Category dropdown initialization
    function initializeCategoryDropdowns() {
        $('select[name="category"], #category').each(function() {
            const $select = $(this);
            
            if ($select.hasClass('select2-hidden-accessible')) {
                return; // Already initialized
            }
            
            $select.select2({
                placeholder: 'دسته‌بندی محصول را انتخاب کنید',
                allowClear: true,
                tags: true,
                dir: 'rtl',
                theme: 'bootstrap4',
                width: '100%',
                createTag: function(params) {
                    const term = $.trim(params.term);
                    if (term === '') {
                        return null;
                    }
                    
                    return {
                        id: term,
                        text: term,
                        newTag: true
                    };
                }
            });
            
            // Load existing categories from localStorage
            loadStoredOptions($select, 'productCategories');
        });
    }
    
    // Unit dropdown initialization
    function initializeUnitDropdowns() {
        $('select[name="unit"], #unit').each(function() {
            const $select = $(this);
            
            if ($select.hasClass('select2-hidden-accessible')) {
                return; // Already initialized
            }
            
            $select.select2({
                placeholder: 'واحد اندازه‌گیری را انتخاب کنید',
                allowClear: true,
                tags: true,
                dir: 'rtl',
                theme: 'bootstrap4',
                width: '100%',
                createTag: function(params) {
                    const term = $.trim(params.term);
                    if (term === '') {
                        return null;
                    }
                    
                    return {
                        id: term,
                        text: term,
                        newTag: true
                    };
                }
            });
            
            // Load existing units from localStorage
            loadStoredOptions($select, 'measurementUnits');
        });
    }
    
    // Load stored options from localStorage
    function loadStoredOptions($select, storageKey) {
        const storedItems = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        storedItems.forEach(function(item) {
            // Check if option already exists
            if ($select.find(`option[value="${item}"]`).length === 0) {
                const newOption = new Option(item, item, false, false);
                $select.append(newOption);
            }
        });
        
        // Refresh Select2 to show new options
        $select.trigger('change');
    }
    
    // Show notification
    function showNotification(type, message) {
        const alertClass = type === 'success' ? 'alert-success' : 'alert-info';
        const iconClass = type === 'success' ? 'fas fa-check-circle' : 'fas fa-info-circle';
        
        const notification = $(`
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert" style="position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 400px;">
                <i class="${iconClass}"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `);
        
        $('body').append(notification);
        
        // Auto remove after 3 seconds
        setTimeout(function() {
            notification.alert('close');
        }, 3000);
    }
    
    // Dark mode compatibility for Select2
    function applySelect2DarkMode() {
        if (document.body.classList.contains('dark-mode')) {
            // Apply dark mode styles to Select2
            $('<style>')
                .prop('type', 'text/css')
                .html(`
                    .select2-container--bootstrap4 .select2-selection {
                        background-color: #2a2a2a !important;
                        border-color: #555 !important;
                        color: #e0e0e0 !important;
                    }
                    
                    .select2-container--bootstrap4 .select2-selection__rendered {
                        color: #e0e0e0 !important;
                    }
                    
                    .select2-container--bootstrap4 .select2-selection__placeholder {
                        color: #aaa !important;
                    }
                    
                    .select2-dropdown {
                        background-color: #2a2a2a !important;
                        border-color: #555 !important;
                        color: #e0e0e0 !important;
                    }
                    
                    .select2-container--bootstrap4 .select2-results__option {
                        color: #e0e0e0 !important;
                    }
                    
                    .select2-container--bootstrap4 .select2-results__option--highlighted {
                        background-color: #4fc3f7 !important;
                        color: #121212 !important;
                    }
                    
                    .select2-search__field {
                        background-color: #2a2a2a !important;
                        border-color: #555 !important;
                        color: #e0e0e0 !important;
                    }
                    
                    .select2-container--bootstrap4 .select2-selection--multiple .select2-selection__choice {
                        background-color: #4fc3f7 !important;
                        color: #121212 !important;
                        border-color: #4fc3f7 !important;
                    }
                `)
                .appendTo('head');
        }
    }
    
    // Initialize on page load
    initializeEnhancedSelects();
    
    // Apply dark mode styles
    applySelect2DarkMode();
    
    // Re-initialize after dark mode toggle
    $(document).on('click', '#darkModeToggle', function() {
        setTimeout(function() {
            applySelect2DarkMode();
        }, 100);
    });
    
    // Re-initialize for dynamically added selects
    $(document).on('DOMNodeInserted', function(e) {
        if ($(e.target).is('select') || $(e.target).find('select').length > 0) {
            setTimeout(initializeEnhancedSelects, 100);
        }
    });
});