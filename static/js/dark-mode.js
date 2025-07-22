/**
 * Dynamic Dark Mode Switcher with Smooth Transitions
 * Persian Accounting System - Enhanced UX
 */

class DarkModeManager {
    constructor() {
        this.isDarkMode = false;
        this.transitionDuration = 300; // milliseconds
        this.init();
    }

    init() {
        // Load saved preference or detect system preference
        this.loadPreference();
        
        // Apply initial theme
        this.applyTheme(false); // No transition on initial load
        
        // Setup toggle button
        this.setupToggleButton();
        
        // Listen for system theme changes
        this.listenForSystemChanges();
        
        // Setup keyboard shortcut (Ctrl+Shift+D)
        this.setupKeyboardShortcut();
    }

    loadPreference() {
        // Check localStorage first
        const saved = localStorage.getItem('darkMode');
        if (saved !== null) {
            this.isDarkMode = saved === 'true';
            return;
        }

        // Fall back to system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.isDarkMode = true;
        }
    }

    savePreference() {
        localStorage.setItem('darkMode', this.isDarkMode.toString());
    }

    applyTheme(withTransition = true) {
        const root = document.documentElement;
        const body = document.body;
        
        if (!root || !body) return;
        
        if (withTransition) {
            // Add transition class
            root.style.setProperty('--transition-duration', `${this.transitionDuration}ms`);
            body.classList.add('theme-transitioning');
            
            // Remove transition class after animation
            setTimeout(() => {
                if (body) {
                    body.classList.remove('theme-transitioning');
                }
            }, this.transitionDuration + 50);
        }

        if (this.isDarkMode) {
            if (body) body.classList.add('dark-mode');
            this.applyDarkVariables();
        } else {
            if (body) body.classList.remove('dark-mode');
            this.applyLightVariables();
        }

        // Update toggle button state
        this.updateToggleButton();
        
        // Update meta theme color for mobile browsers
        this.updateMetaThemeColor();
    }

    applyDarkVariables() {
        const root = document.documentElement;
        if (!root) return;
        
        // Primary colors
        root.style.setProperty('--bs-body-bg', '#121212');
        root.style.setProperty('--bs-body-color', '#ffffff');
        root.style.setProperty('--bs-text-muted', '#b0b0b0');
        
        // Card and surface colors
        root.style.setProperty('--bs-card-bg', '#1e1e1e');
        root.style.setProperty('--bs-border-color', '#333333');
        root.style.setProperty('--bs-secondary-bg', '#2a2a2a');
        
        // Navigation colors
        root.style.setProperty('--navbar-bg', '#1a1a1a');
        root.style.setProperty('--sidebar-bg', '#1e1e1e');
        root.style.setProperty('--sidebar-border', '#333333');
        
        // Form colors
        root.style.setProperty('--bs-form-control-bg', '#2a2a2a');
        root.style.setProperty('--bs-form-control-color', '#ffffff');
        root.style.setProperty('--bs-form-control-border', '#444444');
        
        // Table colors
        root.style.setProperty('--bs-table-bg', 'transparent');
        root.style.setProperty('--bs-table-striped-bg', '#252525');
        root.style.setProperty('--bs-table-hover-bg', '#2a2a2a');
        
        // Button variants
        root.style.setProperty('--bs-btn-close-color', '#ffffff');
        
        // Alert colors (darker variants)
        root.style.setProperty('--bs-success-bg', '#0f2419');
        root.style.setProperty('--bs-success-border', '#26544c');
        root.style.setProperty('--bs-danger-bg', '#2c1618');
        root.style.setProperty('--bs-danger-border', '#5a2c32');
        root.style.setProperty('--bs-warning-bg', '#2b1f17');
        root.style.setProperty('--bs-warning-border', '#5a4a3a');
        root.style.setProperty('--bs-info-bg', '#0c1d2b');
        root.style.setProperty('--bs-info-border', '#1e3a52');
    }

    applyLightVariables() {
        const root = document.documentElement;
        if (!root) return;
        
        // Reset to default Bootstrap values
        root.style.setProperty('--bs-body-bg', '#ffffff');
        root.style.setProperty('--bs-body-color', '#212529');
        root.style.setProperty('--bs-text-muted', '#6c757d');
        
        root.style.setProperty('--bs-card-bg', '#ffffff');
        root.style.setProperty('--bs-border-color', '#dee2e6');
        root.style.setProperty('--bs-secondary-bg', '#f8f9fa');
        
        root.style.setProperty('--navbar-bg', '#ffffff');
        root.style.setProperty('--sidebar-bg', '#f8f9fa');
        root.style.setProperty('--sidebar-border', '#dee2e6');
        
        root.style.setProperty('--bs-form-control-bg', '#ffffff');
        root.style.setProperty('--bs-form-control-color', '#212529');
        root.style.setProperty('--bs-form-control-border', '#ced4da');
        
        root.style.setProperty('--bs-table-bg', 'transparent');
        root.style.setProperty('--bs-table-striped-bg', 'rgba(0, 0, 0, 0.05)');
        root.style.setProperty('--bs-table-hover-bg', 'rgba(0, 0, 0, 0.075)');
        
        root.style.setProperty('--bs-btn-close-color', '#000000');
        
        // Reset alert colors
        root.style.setProperty('--bs-success-bg', '#d1eddf');
        root.style.setProperty('--bs-success-border', '#a3cfbb');
        root.style.setProperty('--bs-danger-bg', '#f8d7da');
        root.style.setProperty('--bs-danger-border', '#f1aeb5');
        root.style.setProperty('--bs-warning-bg', '#fff3cd');
        root.style.setProperty('--bs-warning-border', '#ffecb5');
        root.style.setProperty('--bs-info-bg', '#d1ecf1');
        root.style.setProperty('--bs-info-border', '#abdde5');
    }

    setupToggleButton() {
        // Find existing toggle button or create one
        let toggleBtn = document.getElementById('darkModeToggle');
        
        if (!toggleBtn) {
            toggleBtn = this.createToggleButton();
        }
        
        toggleBtn.addEventListener('click', () => {
            this.toggle();
        });
    }

    createToggleButton() {
        try {
            // Create toggle button
            const toggleBtn = document.createElement('button');
            toggleBtn.id = 'darkModeToggle';
            toggleBtn.className = 'btn btn-outline-secondary btn-sm dark-mode-toggle';
            toggleBtn.setAttribute('aria-label', 'تغییر حالت تم');
            toggleBtn.setAttribute('title', 'تغییر حالت روشن/تیره (Ctrl+Shift+D)');
            
            // Create icon container
            const iconContainer = document.createElement('span');
            iconContainer.className = 'toggle-icon';
            
            const sunIcon = document.createElement('i');
            sunIcon.className = 'fas fa-sun sun-icon';
            
            const moonIcon = document.createElement('i');
            moonIcon.className = 'fas fa-moon moon-icon';
            
            iconContainer.appendChild(sunIcon);
            iconContainer.appendChild(moonIcon);
            toggleBtn.appendChild(iconContainer);
            
            // Add to navigation area with fallbacks
            let inserted = false;
            
            // Try to find user dropdown first
            const userDropdown = document.querySelector('.dropdown');
            if (userDropdown && userDropdown.parentElement) {
                userDropdown.parentElement.insertBefore(toggleBtn, userDropdown);
                inserted = true;
            }
            
            // Fallback: add to navbar
            if (!inserted) {
                const navbar = document.querySelector('.navbar .container-fluid, .navbar .container, .navbar-nav');
                if (navbar) {
                    navbar.appendChild(toggleBtn);
                    inserted = true;
                }
            }
            
            // Final fallback: add to body (temporary placement)
            if (!inserted) {
                console.warn('Could not find suitable navbar location, adding to body');
                document.body.appendChild(toggleBtn);
                // Add some basic positioning
                toggleBtn.style.position = 'fixed';
                toggleBtn.style.top = '10px';
                toggleBtn.style.right = '10px';
                toggleBtn.style.zIndex = '9999';
            }
            
            return toggleBtn;
        } catch (error) {
            console.error('Error creating toggle button:', error);
            return null;
        }
    }

    updateToggleButton() {
        const toggleBtn = document.getElementById('darkModeToggle');
        if (!toggleBtn) return;
        
        const sunIcon = toggleBtn.querySelector('.sun-icon');
        const moonIcon = toggleBtn.querySelector('.moon-icon');
        
        // Check if icons exist before accessing their style
        if (!sunIcon || !moonIcon) return;
        
        if (this.isDarkMode) {
            toggleBtn.setAttribute('title', 'تغییر به حالت روشن (Ctrl+Shift+D)');
            sunIcon.style.opacity = '1';
            moonIcon.style.opacity = '0';
        } else {
            toggleBtn.setAttribute('title', 'تغییر به حالت تیره (Ctrl+Shift+D)');
            sunIcon.style.opacity = '0';
            moonIcon.style.opacity = '1';
        }
    }

    updateMetaThemeColor() {
        let metaTheme = document.querySelector('meta[name="theme-color"]');
        if (!metaTheme) {
            metaTheme = document.createElement('meta');
            metaTheme.name = 'theme-color';
            document.head.appendChild(metaTheme);
        }
        
        metaTheme.content = this.isDarkMode ? '#121212' : '#ffffff';
    }

    setupKeyboardShortcut() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggle();
                
                // Show brief notification
                this.showToggleNotification();
            }
        });
    }

    showToggleNotification() {
        // Remove existing notification
        const existing = document.querySelector('.dark-mode-notification');
        if (existing) {
            existing.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = 'dark-mode-notification';
        notification.textContent = this.isDarkMode ? 'حالت تیره فعال شد' : 'حالت روشن فعال شد';
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    listenForSystemChanges() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                // Only auto-switch if user hasn't manually set a preference
                if (localStorage.getItem('darkMode') === null) {
                    this.isDarkMode = e.matches;
                    this.applyTheme(true);
                }
            });
        }
    }

    toggle() {
        this.isDarkMode = !this.isDarkMode;
        this.savePreference();
        this.applyTheme(true);
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { isDarkMode: this.isDarkMode }
        }));
    }

    // Public API
    setDarkMode(enabled) {
        if (this.isDarkMode !== enabled) {
            this.toggle();
        }
    }

    getCurrentTheme() {
        return this.isDarkMode ? 'dark' : 'light';
    }
}

// Auto-initialize when DOM is ready
function initializeDarkMode() {
    try {
        if (document.body && document.documentElement) {
            // Check if DarkModeManager is already initialized
            if (window.darkModeManager) {
                return;
            }
            
            window.darkModeManager = new DarkModeManager();
            console.log('Dark mode manager initialized successfully');
        } else {
            console.warn('DOM not ready, retrying in 100ms');
            setTimeout(initializeDarkMode, 100);
        }
    } catch (error) {
        console.error('Error initializing dark mode:', error);
        // Fallback: Simple dark mode toggle
        setupSimpleDarkMode();
    }
}

// Simple fallback dark mode
function setupSimpleDarkMode() {
    try {
        const savedTheme = localStorage.getItem('darkMode');
        if (savedTheme === 'true') {
            document.body.classList.add('dark-mode');
        }
        console.log('Fallback dark mode initialized');
    } catch (e) {
        console.warn('Could not setup fallback dark mode');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDarkMode);
} else {
    // DOM is already loaded
    initializeDarkMode();
}

// Export for global access
window.DarkModeManager = DarkModeManager;

// Global function for template compatibility
window.toggleDarkMode = function() {
    if (window.darkModeManager) {
        window.darkModeManager.toggle();
    } else {
        // Fallback: try to initialize and then toggle
        initializeDarkMode();
        setTimeout(() => {
            if (window.darkModeManager) {
                window.darkModeManager.toggle();
            }
        }, 100);
    }
};