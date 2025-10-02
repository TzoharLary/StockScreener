// Configuration file for Stock Screener
// IMPORTANT: Keep your API key private and never commit it to version control
// If you don't have an API key, get one free at: https://twelvedata.com/
//
// Twelve Data API Documentation: https://twelvedata.com/docs
// Free tier includes: 8 API calls/minute, 800 API calls/day
// Attribution requirement: Display "Data powered by Twelve Data API" (included in UI)

const CONFIG = {
    // Twelve Data API Configuration
    // Priority order for API key:
    // 1. localStorage (user-provided via UI)
    // 2. Environment variable (for Node.js environments)
    // 3. Demo key (fallback for testing)
    get TWELVE_DATA_API_KEY() {
        // Check localStorage first (browser environment)
        if (typeof localStorage !== 'undefined') {
            const storedKey = localStorage.getItem('twelvedata_api_key');
            if (storedKey && storedKey !== 'demo') {
                return storedKey;
            }
        }
        // Check environment variable (Node.js)
        if (typeof process !== 'undefined' && process.env.TWELVE_DATA_API_KEY) {
            return process.env.TWELVE_DATA_API_KEY;
        }
        // Fallback to demo
        return 'demo';
    },
    TWELVE_DATA_BASE_URL: 'https://api.twelvedata.com',

    // Default stocks to fetch data for
    DEFAULT_STOCKS: [
        'AAPL', 'GOOGL', 'MSFT', 'TSLA', 'JNJ',
        'JPM', 'V', 'PG', 'XOM', 'HD'
    ],

    // API settings
    REQUEST_TIMEOUT: 10000, // 10 seconds
    CACHE_DURATION: 300000, // 5 minutes in milliseconds

    // UI Constants
    MARKET_CAP_THRESHOLDS: {
        SMALL_CAP: 2000000000,      // $2B
        MID_CAP: 10000000000         // $10B
    },

    // Formatting thresholds
    FORMAT_THRESHOLDS: {
        TRILLION: 1000000000000,
        BILLION: 1000000000,
        MILLION: 1000000
    },

    // Autocomplete settings
    AUTOCOMPLETE: {
        MIN_SEARCH_LENGTH: 1,
        MAX_RESULTS: 10,
        DEBOUNCE_DELAY: 300  // milliseconds
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}