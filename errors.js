/**
 * Custom error classes for better error handling
 */

class APIError extends Error {
    constructor(message, statusCode = null, originalError = null) {
        super(message);
        this.name = 'APIError';
        this.statusCode = statusCode;
        this.originalError = originalError;
    }
}

class NetworkError extends Error {
    constructor(message, originalError = null) {
        super(message);
        this.name = 'NetworkError';
        this.originalError = originalError;
    }
}

class TimeoutError extends Error {
    constructor(message, originalError = null) {
        super(message);
        this.name = 'TimeoutError';
        this.originalError = originalError;
    }
}

class ValidationError extends Error {
    constructor(message, field = null) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
    }
}

/**
 * Get user-friendly error message
 * @param {Error} error - Error object
 * @returns {string} - User-friendly message
 */
function getUserFriendlyErrorMessage(error) {
    if (error instanceof TimeoutError) {
        return 'Request timed out. Please check your connection and try again.';
    }

    if (error instanceof NetworkError) {
        return 'Network error. Please check your internet connection.';
    }

    if (error instanceof APIError) {
        if (error.statusCode === 429) {
            return 'API rate limit exceeded. Please try again in a few minutes.';
        }
        if (error.statusCode === 401) {
            return 'API authentication failed. Please check your API key.';
        }
        if (error.statusCode >= 500) {
            return 'API server error. The service may be temporarily unavailable.';
        }
        return `API error: ${error.message}`;
    }

    if (error instanceof ValidationError) {
        return `Validation error: ${error.message}`;
    }

    return 'An unexpected error occurred. Please try again.';
}

/**
 * Log error with details
 * @param {Error} error - Error to log
 * @param {object} context - Additional context
 */
function logError(error, context = {}) {
    console.error('[Error]', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        context: context,
        timestamp: new Date().toISOString()
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        APIError,
        NetworkError,
        TimeoutError,
        ValidationError,
        getUserFriendlyErrorMessage,
        logError
    };
}
