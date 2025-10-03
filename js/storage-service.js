// Storage Service - Manages localStorage for user preferences, API keys, and watchlists
class StorageService {
    constructor() {
        this.STORAGE_KEYS = {
            API_KEY: 'twelvedata_api_key',
            WATCHLISTS: 'stock_screener_watchlists',
            PREFERENCES: 'stock_screener_preferences',
            USER_MODE: 'stock_screener_mode' // 'demo' or 'full'
        };
        
        // Default preferences
        this.DEFAULT_PREFERENCES = {
            defaultView: 'table',
            visibleColumns: ['symbol', 'companyName', 'price', 'marketCap', 'peRatio', 'pbRatio', 'debtToEquity', 'roe', 'sector'],
            theme: 'light'
        };
    }

    // API Key Management
    getApiKey() {
        return localStorage.getItem(this.STORAGE_KEYS.API_KEY);
    }

    setApiKey(apiKey) {
        localStorage.setItem(this.STORAGE_KEYS.API_KEY, apiKey);
    }

    deleteApiKey() {
        localStorage.removeItem(this.STORAGE_KEYS.API_KEY);
    }

    getMaskedApiKey() {
        const key = this.getApiKey();
        if (!key || key === 'demo') return 'demo';
        if (key.length <= 8) return key;
        return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
    }

    // User Mode Management
    getUserMode() {
        return localStorage.getItem(this.STORAGE_KEYS.USER_MODE) || 'demo';
    }

    setUserMode(mode) {
        localStorage.setItem(this.STORAGE_KEYS.USER_MODE, mode);
    }

    isFullMode() {
        return this.getUserMode() === 'full' && this.getApiKey() && this.getApiKey() !== 'demo';
    }

    // Preferences Management
    getPreferences() {
        const stored = localStorage.getItem(this.STORAGE_KEYS.PREFERENCES);
        if (!stored) {
            return { ...this.DEFAULT_PREFERENCES };
        }
        try {
            const preferences = JSON.parse(stored);
            return { ...this.DEFAULT_PREFERENCES, ...preferences };
        } catch (error) {
            console.error('Error parsing preferences:', error);
            return { ...this.DEFAULT_PREFERENCES };
        }
    }

    setPreferences(preferences) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.error('localStorage quota exceeded when saving preferences');
            } else {
                throw error;
            }
        }
    }

    updatePreference(key, value) {
        const preferences = this.getPreferences();
        preferences[key] = value;
        this.setPreferences(preferences);
    }

    resetPreferences() {
        this.setPreferences(this.DEFAULT_PREFERENCES);
    }

    // Watchlist Management
    getWatchlists() {
        const stored = localStorage.getItem(this.STORAGE_KEYS.WATCHLISTS);
        if (!stored) {
            // Create default watchlist
            const defaultWatchlist = {
                id: this.generateId(),
                name: 'Favorites',
                description: 'My favorite stocks',
                stocks: [],
                notes: {},
                alerts: {},
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.setWatchlists([defaultWatchlist]);
            return [defaultWatchlist];
        }
        try {
            return JSON.parse(stored);
        } catch (error) {
            console.error('Error parsing watchlists:', error);
            return [];
        }
    }

    setWatchlists(watchlists) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.WATCHLISTS, JSON.stringify(watchlists));
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.error('localStorage quota exceeded when saving watchlists');
                // Try to show error to user if showError function exists
                if (typeof showError === 'function') {
                    showError('Storage quota exceeded. Please remove some watchlists or stocks.', 'resultsCount');
                } else {
                    alert('Storage quota exceeded. Please remove some watchlists or stocks.');
                }
            } else {
                throw error;
            }
        }
    }

    getWatchlist(id) {
        const watchlists = this.getWatchlists();
        return watchlists.find(w => w.id === id);
    }

    addWatchlist(name, description = '') {
        const watchlists = this.getWatchlists();
        
        // Check for duplicate name and auto-increment if needed (BUG-011)
        const existingNames = watchlists.map(w => w.name.toLowerCase());
        let finalName = name;
        let counter = 1;
        
        while (existingNames.includes(finalName.toLowerCase())) {
            counter++;
            finalName = `${name} (${counter})`;
        }
        
        const newWatchlist = {
            id: this.generateId(),
            name: finalName,
            description,
            stocks: [],
            notes: {},
            alerts: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        watchlists.push(newWatchlist);
        this.setWatchlists(watchlists);
        return newWatchlist;
    }

    deleteWatchlist(id) {
        const watchlists = this.getWatchlists();
        const filtered = watchlists.filter(w => w.id !== id);
        this.setWatchlists(filtered);
    }

    addStockToWatchlist(watchlistId, symbol) {
        const watchlists = this.getWatchlists();
        const watchlist = watchlists.find(w => w.id === watchlistId);
        
        if (!watchlist) {
            console.error(`Watchlist ${watchlistId} not found`);
            return { success: false, error: 'WATCHLIST_NOT_FOUND' };
        }
        
        if (watchlist.stocks.includes(symbol)) {
            console.log(`Stock ${symbol} already in watchlist ${watchlistId}`);
            return { success: false, error: 'ALREADY_EXISTS' };
        }
        
        watchlist.stocks.push(symbol);
        watchlist.updatedAt = new Date().toISOString();
        this.setWatchlists(watchlists);
        return { success: true };
    }

    removeStockFromWatchlist(watchlistId, symbol) {
        const watchlists = this.getWatchlists();
        const watchlist = watchlists.find(w => w.id === watchlistId);
        if (watchlist) {
            watchlist.stocks = watchlist.stocks.filter(s => s !== symbol);
            delete watchlist.notes[symbol];
            delete watchlist.alerts[symbol];
            watchlist.updatedAt = new Date().toISOString();
            this.setWatchlists(watchlists);
            return true;
        }
        return false;
    }

    setStockNote(watchlistId, symbol, note) {
        const watchlists = this.getWatchlists();
        const watchlist = watchlists.find(w => w.id === watchlistId);
        if (watchlist) {
            watchlist.notes[symbol] = note;
            watchlist.updatedAt = new Date().toISOString();
            this.setWatchlists(watchlists);
            return true;
        }
        return false;
    }

    setStockAlert(watchlistId, symbol, alert) {
        const watchlists = this.getWatchlists();
        const watchlist = watchlists.find(w => w.id === watchlistId);
        if (watchlist) {
            watchlist.alerts[symbol] = alert;
            watchlist.updatedAt = new Date().toISOString();
            this.setWatchlists(watchlists);
            return true;
        }
        return false;
    }

    isStockInAnyWatchlist(symbol) {
        const watchlists = this.getWatchlists();
        return watchlists.some(w => w.stocks.includes(symbol));
    }

    getWatchlistsForStock(symbol) {
        const watchlists = this.getWatchlists();
        return watchlists.filter(w => w.stocks.includes(symbol));
    }

    // Utility Methods
    generateId() {
        return `wl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    clearAllData() {
        Object.values(this.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }

    exportData() {
        const data = {};
        Object.entries(this.STORAGE_KEYS).forEach(([name, key]) => {
            const value = localStorage.getItem(key);
            if (value) {
                try {
                    data[name] = JSON.parse(value);
                } catch {
                    data[name] = value;
                }
            }
        });
        return data;
    }

    importData(data) {
        Object.entries(data).forEach(([name, value]) => {
            const key = this.STORAGE_KEYS[name];
            if (key) {
                const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
                localStorage.setItem(key, stringValue);
            }
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageService;
}
