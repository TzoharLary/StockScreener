// Configuration file for Stock Screener
const CONFIG = {
    // Twelve Data API Configuration
    TWELVE_DATA_API_KEY: 'f78f867c460e4a2682c3590f1ea1550e',
    TWELVE_DATA_BASE_URL: 'https://api.twelvedata.com',
    
    // Default stocks to fetch data for
    DEFAULT_STOCKS: [
        'AAPL', 'GOOGL', 'MSFT', 'TSLA', 'JNJ', 
        'JPM', 'V', 'PG', 'XOM', 'HD'
    ],
    
    // API settings
    REQUEST_TIMEOUT: 10000, // 10 seconds
    CACHE_DURATION: 300000, // 5 minutes in milliseconds
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}