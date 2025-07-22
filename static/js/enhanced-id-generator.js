/**
 * Enhanced ID Generator for Persian Accounting System
 * Improved unique ID generation with timestamp + random combination
 */

class EnhancedIDGenerator {
    constructor() {
        this.counter = 0;
    }

    /**
     * Generate unique ID using timestamp + random combination
     * Based on code review suggestions for better uniqueness
     */
    generateUniqueID() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 8);
        const counter = (++this.counter).toString(36);
        
        return `${timestamp}-${random}-${counter}`;
    }

    /**
     * Generate numeric ID for database compatibility
     */
    generateNumericID() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return parseInt(`${timestamp}${random.toString().padStart(3, '0')}`);
    }

    /**
     * Generate Persian-safe ID (for forms and UI elements)
     */
    generatePersianSafeID() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 6);
        return `persian_${timestamp}_${random}`;
    }

    /**
     * Generate sequential ID with prefix
     */
    generateSequentialID(prefix = 'item') {
        const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').substr(0, 14);
        const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        return `${prefix}_${timestamp}_${random}`;
    }

    /**
     * Validate ID uniqueness in given array
     */
    isUnique(id, existingIds = []) {
        return !existingIds.includes(id);
    }

    /**
     * Generate guaranteed unique ID from array
     */
    generateUniqueFromArray(existingIds = [], generator = 'unique') {
        let attempts = 0;
        const maxAttempts = 100;
        
        while (attempts < maxAttempts) {
            let newId;
            
            switch (generator) {
                case 'numeric':
                    newId = this.generateNumericID();
                    break;
                case 'sequential':
                    newId = this.generateSequentialID();
                    break;
                case 'persian':
                    newId = this.generatePersianSafeID();
                    break;
                default:
                    newId = this.generateUniqueID();
            }
            
            if (this.isUnique(newId, existingIds)) {
                return newId;
            }
            
            attempts++;
        }
        
        // Fallback: use timestamp with high precision
        return `fallback_${Date.now()}_${Math.random().toString(36).substr(2)}`;
    }
}

// Global instance
window.idGenerator = new EnhancedIDGenerator();

// Global helper functions
window.generateID = () => window.idGenerator.generateUniqueID();
window.generateNumericID = () => window.idGenerator.generateNumericID();
window.generatePersianID = () => window.idGenerator.generatePersianSafeID();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedIDGenerator;
}