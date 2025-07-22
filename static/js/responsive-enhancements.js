/**
 * Responsive Enhancements for Persian Accounting System
 * Mobile-friendly improvements and adaptive design
 */

class ResponsiveEnhancer {
    constructor() {
        this.breakpoints = {
            xs: 576,
            sm: 768,
            md: 992,
            lg: 1200,
            xl: 1400
        };
        this.init();
    }

    init() {
        this.setupResponsiveTables();
        this.setupMobileNavigation();
        this.setupResponsiveForms();
        this.setupViewportDetection();
        this.setupTouchEnhancements();
        this.addResizeListener();
    }

    getCurrentBreakpoint() {
        const width = window.innerWidth;
        if (width < this.breakpoints.xs) return 'xs';
        if (width < this.breakpoints.sm) return 'sm';
        if (width < this.breakpoints.md) return 'md';
        if (width < this.breakpoints.lg) return 'lg';
        return 'xl';
    }

    isMobile() {
        return this.getCurrentBreakpoint() === 'xs' || this.getCurrentBreakpoint() === 'sm';
    }

    setupResponsiveTables() {
        const tables = document.querySelectorAll('table:not(.responsive-enhanced)');
        
        tables.forEach(table => {
            this.makeTableResponsive(table);
            table.classList.add('responsive-enhanced');
        });
    }

    makeTableResponsive(table) {
        // Wrap table in responsive container
        const wrapper = document.createElement('div');
        wrapper.className = 'table-responsive-wrapper';
        
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
        
        // Add mobile view toggle
        if (this.isMobile()) {
            this.addMobileTableView(table);
        }
    }

    addMobileTableView(table) {
        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');
        
        if (!thead || !tbody) return;
        
        const headers = Array.from(thead.querySelectorAll('th')).map(th => th.textContent.trim());
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        // Create mobile cards view
        const mobileView = document.createElement('div');
        mobileView.className = 'mobile-table-view d-md-none';
        
        rows.forEach((row, index) => {
            const card = this.createMobileCard(headers, row, index);
            mobileView.appendChild(card);
        });
        
        table.parentNode.insertBefore(mobileView, table);
        
        // Hide original table on mobile
        table.classList.add('d-none', 'd-md-table');
    }

    createMobileCard(headers, row, index) {
        const card = document.createElement('div');
        card.className = 'card mobile-table-card mb-3';
        
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        
        const cells = Array.from(row.querySelectorAll('td'));
        
        cells.forEach((cell, cellIndex) => {
            if (cellIndex < headers.length) {
                const fieldRow = document.createElement('div');
                fieldRow.className = 'row mb-2';
                
                const labelCol = document.createElement('div');
                labelCol.className = 'col-5 fw-bold text-muted';
                labelCol.textContent = headers[cellIndex];
                
                const valueCol = document.createElement('div');
                valueCol.className = 'col-7';
                valueCol.innerHTML = cell.innerHTML;
                
                fieldRow.appendChild(labelCol);
                fieldRow.appendChild(valueCol);
                cardBody.appendChild(fieldRow);
            }
        });
        
        card.appendChild(cardBody);
        return card;
    }

    setupMobileNavigation() {
        if (!this.isMobile()) return;
        
        // Make sidebar collapsible on mobile
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            this.makeSidebarCollapsible(sidebar);
        }
        
        // Add mobile navigation toggle
        this.addMobileNavToggle();
    }

    makeSidebarCollapsible(sidebar) {
        sidebar.classList.add('mobile-sidebar');
        
        // Add overlay
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
        
        // Toggle functionality
        overlay.addEventListener('click', () => {
            this.closeMobileSidebar();
        });
    }

    addMobileNavToggle() {
        const navbar = document.querySelector('.navbar, .main-content');
        if (!navbar) return;
        
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'btn btn-outline-secondary d-md-none mobile-nav-toggle';
        toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        toggleBtn.setAttribute('title', 'منوی ناوبری');
        
        toggleBtn.addEventListener('click', () => {
            this.toggleMobileSidebar();
        });
        
        // Insert at the beginning of navbar
        if (navbar.firstChild) {
            navbar.insertBefore(toggleBtn, navbar.firstChild);
        } else {
            navbar.appendChild(toggleBtn);
        }
    }

    toggleMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        
        if (sidebar) {
            sidebar.classList.toggle('mobile-open');
            document.body.classList.toggle('sidebar-open');
            
            if (overlay) {
                overlay.classList.toggle('active');
            }
        }
    }

    closeMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        
        if (sidebar) {
            sidebar.classList.remove('mobile-open');
            document.body.classList.remove('sidebar-open');
            
            if (overlay) {
                overlay.classList.remove('active');
            }
        }
    }

    setupResponsiveForms() {
        const forms = document.querySelectorAll('form:not(.responsive-enhanced)');
        
        forms.forEach(form => {
            this.makeFormResponsive(form);
            form.classList.add('responsive-enhanced');
        });
    }

    makeFormResponsive(form) {
        // Stack form elements on mobile
        if (this.isMobile()) {
            const rows = form.querySelectorAll('.row');
            rows.forEach(row => {
                const cols = row.querySelectorAll('[class*="col-"]');
                cols.forEach(col => {
                    col.classList.add('col-12', 'mb-3');
                });
            });
        }
        
        // Make input groups stack on mobile
        const inputGroups = form.querySelectorAll('.input-group');
        inputGroups.forEach(group => {
            if (this.isMobile()) {
                group.classList.add('input-group-vertical');
            }
        });
    }

    setupViewportDetection() {
        // Add viewport classes to body
        document.body.classList.add(`viewport-${this.getCurrentBreakpoint()}`);
        
        if (this.isMobile()) {
            document.body.classList.add('is-mobile');
        }
        
        // Add touch detection
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
        }
    }

    setupTouchEnhancements() {
        if (!('ontouchstart' in window)) return;
        
        // Increase touch targets
        const smallButtons = document.querySelectorAll('.btn-sm, .btn-xs');
        smallButtons.forEach(btn => {
            btn.classList.add('touch-enhanced');
        });
        
        // Add touch-friendly dropdowns
        const dropdowns = document.querySelectorAll('.dropdown-toggle');
        dropdowns.forEach(dropdown => {
            dropdown.addEventListener('touchstart', function(e) {
                e.stopPropagation();
            });
        });
        
        // Improve form input touch experience
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            });
            
            input.addEventListener('blur', function() {
                this.classList.remove('touch-active');
            });
        });
    }

    addResizeListener() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }

    handleResize() {
        // Update viewport classes
        document.body.className = document.body.className.replace(/viewport-\w+/, '');
        document.body.classList.add(`viewport-${this.getCurrentBreakpoint()}`);
        
        // Update mobile class
        if (this.isMobile()) {
            document.body.classList.add('is-mobile');
        } else {
            document.body.classList.remove('is-mobile');
            this.closeMobileSidebar();
        }
        
        // Re-enhance tables if needed
        this.refreshResponsiveTables();
    }

    refreshResponsiveTables() {
        const mobileViews = document.querySelectorAll('.mobile-table-view');
        mobileViews.forEach(view => view.remove());
        
        const tables = document.querySelectorAll('table.responsive-enhanced');
        tables.forEach(table => {
            table.classList.remove('d-none', 'd-md-table');
            if (this.isMobile()) {
                this.addMobileTableView(table);
            }
        });
    }

    // Utility method to check if element is visible
    isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Smooth scroll for anchor links
    setupSmoothScroll() {
        const anchors = document.querySelectorAll('a[href^="#"]');
        
        anchors.forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = anchor.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// CSS for responsive enhancements (injected dynamically)
function injectResponsiveCSS() {
    const css = `
        /* Mobile Sidebar */
        @media (max-width: 767px) {
            .sidebar {
                position: fixed;
                top: 0;
                right: -100%;
                width: 280px;
                height: 100vh;
                z-index: 1050;
                transition: right 0.3s ease;
            }
            
            .sidebar.mobile-open {
                right: 0;
            }
            
            .sidebar-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 1040;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .sidebar-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            
            .main-content {
                margin-right: 0;
                padding: 1rem;
            }
            
            .mobile-nav-toggle {
                position: fixed;
                top: 15px;
                right: 15px;
                z-index: 1060;
            }
        }
        
        /* Mobile Table Cards */
        .mobile-table-card {
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .mobile-table-card .row:last-child {
            margin-bottom: 0;
        }
        
        /* Touch Enhancements */
        .touch-device .btn {
            min-height: 44px;
            padding: 0.5rem 1rem;
        }
        
        .touch-device .btn-sm {
            min-height: 38px;
        }
        
        .touch-device .form-control {
            min-height: 44px;
            font-size: 16px; /* Prevents zoom on iOS */
        }
        
        .touch-active {
            transform: scale(1.05);
            transition: transform 0.2s ease;
        }
        
        /* Responsive Table Wrapper */
        .table-responsive-wrapper {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
        }
        
        /* Input Group Vertical */
        @media (max-width: 767px) {
            .input-group-vertical {
                flex-direction: column;
            }
            
            .input-group-vertical .input-group-text,
            .input-group-vertical .form-control,
            .input-group-vertical .btn {
                border-radius: 0.375rem !important;
                margin-bottom: 0.5rem;
            }
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
}

// Initialize responsive enhancements
document.addEventListener('DOMContentLoaded', function() {
    injectResponsiveCSS();
    window.responsiveEnhancer = new ResponsiveEnhancer();
    console.log('Responsive enhancements initialized');
});

// Export for global use
window.ResponsiveEnhancer = ResponsiveEnhancer;