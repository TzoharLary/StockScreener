// Configuration file for Stock Screener
// Copy this file to config.js and add your API key

const CONFIG = {
    // Twelve Data API Configuration
    // Get your free API key at: https://twelvedata.com/
    TWELVE_DATA_API_KEY: 'YOUR_API_KEY_HERE',
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
