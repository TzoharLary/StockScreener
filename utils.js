/**
 * Utility functions for validation, sanitization, and common operations
 */

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
function escapeHtml(str) {
    if (typeof str !== 'string') {
        return str;
    }

    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Validate numeric input
 * @param {any} value - Value to validate
 * @param {object} options - Validation options {min, max, allowNaN}
 * @returns {boolean} - Whether value is valid
 */
function validateNumber(value, options = {}) {
    const { min = -Infinity, max = Infinity, allowNaN = true } = options;

    const num = parseFloat(value);

    if (isNaN(num)) {
        return allowNaN;
    }

    return num >= min && num <= max;
}

/**
 * Validate integer input
 * @param {any} value - Value to validate
 * @param {object} options - Validation options {min, max, allowNaN}
 * @returns {boolean} - Whether value is valid
 */
function validateInteger(value, options = {}) {
    const { min = -Infinity, max = Infinity, allowNaN = true } = options;

    // Check if string contains decimal point (BUG-007)
    if (typeof value === 'string' && value.includes('.')) {
        return false;
    }

    const num = parseInt(value, 10); // Add radix (BUG-008)

    if (isNaN(num)) {
        return allowNaN;
    }

    return Number.isInteger(num) && num >= min && num <= max;
}

/**
 * Debounce function to limit execution rate
 * @param {function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {function} - Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Format large numbers with appropriate suffix (K, M, B, T)
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted string
 */
function formatLargeNumber(num, decimals = 2) {
    // Handle invalid inputs (BUG-014)
    if (typeof num !== 'number' || !isFinite(num)) {
        return '$0.00';
    }

    const isNegative = num < 0;
    const absNum = Math.abs(num);

    let formatted;
    if (absNum >= CONFIG.FORMAT_THRESHOLDS.TRILLION) {
        formatted = '$' + (absNum / CONFIG.FORMAT_THRESHOLDS.TRILLION).toFixed(decimals) + 'T';
    } else if (absNum >= CONFIG.FORMAT_THRESHOLDS.BILLION) {
        formatted = '$' + (absNum / CONFIG.FORMAT_THRESHOLDS.BILLION).toFixed(decimals) + 'B';
    } else if (absNum >= CONFIG.FORMAT_THRESHOLDS.MILLION) {
        formatted = '$' + (absNum / CONFIG.FORMAT_THRESHOLDS.MILLION).toFixed(decimals) + 'M';
    } else {
        formatted = '$' + absNum.toLocaleString();
    }

    return isNegative ? '-' + formatted : formatted;
}

/**
 * Get market cap category
 * @param {number} marketCap - Market capitalization
 * @returns {string} - Category: 'small', 'mid', or 'large'
 */
function getMarketCapCategory(marketCap) {
    if (marketCap < CONFIG.MARKET_CAP_THRESHOLDS.SMALL_CAP) {
        return 'small';
    }
    if (marketCap < CONFIG.MARKET_CAP_THRESHOLDS.MID_CAP) {
        return 'mid';
    }
    return 'large';
}

/**
 * Sanitize search query
 * @param {string} query - Search query to sanitize
 * @returns {string} - Sanitized query
 */
function sanitizeSearchQuery(query) {
    if (typeof query !== 'string') {
        return '';
    }
    // Remove special characters that could be problematic
    return query.trim().replace(/[<>"']/g, '');
}

/**
 * Show error message to user
 * @param {string} message - Error message
 * @param {string} elementId - Element ID to show error in
 */
function showError(message, elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
        return;
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.setAttribute('role', 'alert');

    // Remove any existing error messages
    const existingError = element.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    element.appendChild(errorDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

/**
 * Clear error messages
 * @param {string} elementId - Element ID to clear errors from
 */
function clearError(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
        return;
    }

    const errorDiv = element.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        escapeHtml,
        validateNumber,
        validateInteger,
        debounce,
        formatLargeNumber,
        getMarketCapCategory,
        sanitizeSearchQuery,
        showError,
        clearError
    };
}
