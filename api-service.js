// Twelve Data API Service
// Documentation: https://twelvedata.com/docs
// This service uses the following endpoints:
// - /quote - Real-time and historical stock quotes
// - /statistics - Fundamental statistics and valuation metrics
// - /profile - Company profile and sector information
// - /symbol_search - Search for stock symbols
// Rate limits (free tier): 8 calls/min, 800 calls/day
// Attribution: "Data powered by Twelve Data API" is displayed in the UI
class TwelveDataService {
    constructor() {
        this.apiKey = CONFIG.TWELVE_DATA_API_KEY;
        this.baseUrl = CONFIG.TWELVE_DATA_BASE_URL;
        this.cache = new Map();
        this.cacheTimestamps = new Map();
    }

    // Check if cached data is still valid
    isCacheValid(symbol) {
        if (!this.cache.has(symbol) || !this.cacheTimestamps.has(symbol)) {
            return false;
        }
        const timestamp = this.cacheTimestamps.get(symbol);
        return (Date.now() - timestamp) < CONFIG.CACHE_DURATION;
    }

    // Get cached data or fetch new data
    async getStockData(symbol) {
        // If using demo API key, return fallback data directly
        if (this.apiKey === 'demo') {
            console.log(`Using demo mode - returning fallback data for ${symbol}`);
            return this.getFallbackData(symbol);
        }

        if (this.isCacheValid(symbol)) {
            console.log(`Using cached data for ${symbol}`);
            return this.cache.get(symbol);
        }

        try {
            console.log(`Fetching fresh data for ${symbol} from Twelve Data API...`);
            const data = await this.fetchStockData(symbol);
            this.cache.set(symbol, data);
            this.cacheTimestamps.set(symbol, Date.now());

            // If data appears invalid (all zeros), warn and suggest fallback
            if (data.price === 0 && data.marketCap === 0 && data.peRatio === 0) {
                console.warn(`⚠️  API returned invalid data for ${symbol}. This could be due to:`);
                console.warn('   - Rate limiting (free tier: 8 calls/min, 800/day)');
                console.warn('   - Symbol not found');
                console.warn('   - API endpoint format mismatch');
                console.warn('   Using fallback data instead...');
                const fallback = this.getFallbackData(symbol);
                this.cache.set(symbol, fallback);
                return fallback;
            }

            return data;
        } catch (error) {
            console.error(`Error fetching data for ${symbol}:`, error);
            console.log(`Falling back to cached/static data for ${symbol}`);
            return this.getFallbackData(symbol);
        }
    }

    // Fetch comprehensive stock data from Twelve Data API
    // Note: This method makes 3 parallel API calls (quote, statistics, profile)
    // which counts as 3 calls against the rate limit (8/min, 800/day for free tier)
    async fetchStockData(symbol) {
        const endpoints = {
            quote: `${this.baseUrl}/quote?symbol=${symbol}&apikey=${this.apiKey}`,
            fundamentals: `${this.baseUrl}/statistics?symbol=${symbol}&apikey=${this.apiKey}`,
            profile: `${this.baseUrl}/profile?symbol=${symbol}&apikey=${this.apiKey}`
        };

        try {
            // Fetch data from multiple endpoints in parallel
            const [quoteResponse, statisticsResponse, profileResponse] = await Promise.all([
                this.fetchWithTimeout(endpoints.quote),
                this.fetchWithTimeout(endpoints.fundamentals),
                this.fetchWithTimeout(endpoints.profile)
            ]);

            const quote = await quoteResponse.json();
            const statistics = await statisticsResponse.json();
            const profile = await profileResponse.json();

            // Log responses for debugging
            console.log(`API responses for ${symbol}:`, { quote, statistics, profile });

            // Combine data into our required format
            return this.formatStockData(symbol, quote, statistics, profile);
        } catch (error) {
            throw new Error(`Failed to fetch data for ${symbol}: ${error.message}`);
        }
    }

    // Fetch with timeout
    async fetchWithTimeout(url) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);

        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'StockScreener/1.0 (https://github.com/TzoharLary/StockScreener)'
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                // Handle Twelve Data API specific error codes
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

                // Try to get error details from response body
                try {
                    const errorData = await response.json();
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    } else if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                } catch (e) {
                    // Response body is not JSON, use default error message
                }

                // Provide specific guidance for common Twelve Data error codes
                if (response.status === 401) {
                    errorMessage = 'Invalid API key. Please check your Twelve Data API key.';
                } else if (response.status === 429) {
                    errorMessage = 'Rate limit exceeded. Free tier allows 8 calls/min, 800 calls/day.';
                } else if (response.status === 404) {
                    errorMessage = 'Symbol not found or endpoint not available.';
                } else if (response.status === 400) {
                    errorMessage = 'Bad request. Please check the symbol or parameters.';
                }

                if (typeof APIError !== 'undefined') {
                    throw new APIError(errorMessage, response.status);
                }
                throw new Error(errorMessage);
            }

            return response;
        } catch (error) {
            clearTimeout(timeoutId);

            // Handle abort/timeout
            if (error.name === 'AbortError') {
                const timeoutError = typeof TimeoutError !== 'undefined'
                    ? new TimeoutError('Request timed out', error)
                    : new Error('Request timed out');
                throw timeoutError;
            }

            // Handle network errors
            if (error instanceof TypeError && error.message.includes('fetch')) {
                const networkError = typeof NetworkError !== 'undefined'
                    ? new NetworkError('Network request failed', error)
                    : new Error('Network request failed');
                throw networkError;
            }

            throw error;
        }
    }

    // Format API response data to match our application structure
    formatStockData(symbol, quote, statistics, profile) {
        // Log raw API responses for debugging
        console.log(`Formatting data for ${symbol}:`, {
            quote: quote,
            statistics: statistics,
            profile: profile
        });

        // Check if API returned error messages
        if (quote?.status === 'error' || statistics?.status === 'error' || profile?.status === 'error') {
            console.warn(`API returned error for ${symbol}:`, {
                quoteError: quote?.message,
                statisticsError: statistics?.message,
                profileError: profile?.message
            });
        }

        // Extract price from quote - handle multiple possible field names
        const price = parseFloat(
            quote?.close ||
            quote?.price ||
            quote?.regularMarketPrice ||
            quote?.last_price ||
            0
        );

        // Extract market cap - try multiple sources
        const marketCap = this.calculateMarketCap(quote, statistics, profile);

        // Extract P/E ratio - try multiple paths
        const peRatio = parseFloat(
            statistics?.valuations_metrics?.pe_ratio ||
            statistics?.valuation?.pe_ratio ||
            statistics?.pe_ratio ||
            statistics?.statistics?.valuation?.trailingPE ||
            quote?.pe_ratio ||
            0
        );

        // Extract P/B ratio - try multiple paths
        const pbRatio = parseFloat(
            statistics?.valuations_metrics?.pb_ratio ||
            statistics?.valuation?.pb_ratio ||
            statistics?.pb_ratio ||
            statistics?.statistics?.valuation?.priceToBook ||
            0
        );

        // Extract debt to equity ratio - try multiple paths
        const debtToEquity = parseFloat(
            statistics?.balance_sheet?.debt_to_equity ||
            statistics?.financials?.balance_sheet?.debt_to_equity ||
            statistics?.debt_to_equity ||
            statistics?.statistics?.financial_data?.debtToEquity ||
            0
        );

        // Extract ROE - try multiple paths
        const roe = parseFloat(
            statistics?.income_statement?.roe ||
            statistics?.financials?.income_statement?.roe ||
            statistics?.roe ||
            statistics?.statistics?.financial_data?.returnOnEquity ||
            0
        );

        // Extract revenue growth - try multiple paths
        const revenueGrowth = parseFloat(
            statistics?.income_statement?.revenue_growth ||
            statistics?.financials?.income_statement?.revenue_growth ||
            statistics?.revenue_growth ||
            statistics?.statistics?.earnings?.revenueGrowth ||
            0
        );

        const formattedData = {
            symbol: symbol,
            name: profile?.name || quote?.name || profile?.longName || `${symbol} Inc.`,
            price: price,
            marketCap: marketCap,
            peRatio: peRatio,
            pbRatio: pbRatio,
            debtToEquity: debtToEquity,
            roe: roe,
            sector: profile?.sector || profile?.industry || this.guessSector(symbol),
            revenueGrowth: revenueGrowth,
            revenueGrowthYears: parseInt(
                statistics?.income_statement?.consistent_growth_years ||
                statistics?.consistent_growth_years ||
                1
            )
        };

        console.log(`Formatted data for ${symbol}:`, formattedData);

        // If all critical values are 0, log a warning
        if (formattedData.price === 0 && formattedData.marketCap === 0 && formattedData.peRatio === 0) {
            console.warn(`Warning: All values are 0 for ${symbol}. API may have returned unexpected format or is rate limited.`);
            console.warn('Consider using fallback data or checking API response structure.');
        }

        return formattedData;
    }

    // Calculate market cap from available data
    calculateMarketCap(quote, statistics, profile) {
        // Try to calculate from price * shares outstanding
        const price = parseFloat(
            quote?.close ||
            quote?.price ||
            quote?.regularMarketPrice ||
            quote?.last_price ||
            0
        );

        const sharesOutstanding = parseFloat(
            statistics?.statistics?.shares_outstanding ||
            statistics?.shares_outstanding ||
            profile?.shares_outstanding ||
            quote?.shares_outstanding ||
            0
        );

        if (price > 0 && sharesOutstanding > 0) {
            return price * sharesOutstanding;
        }

        // Try to get market cap directly from various sources
        const directMarketCap = parseFloat(
            statistics?.market_cap ||
            statistics?.statistics?.market_cap ||
            profile?.market_cap ||
            quote?.market_cap ||
            0
        );

        return directMarketCap;
    }

    // Fallback sector guessing based on symbol (basic mapping)
    guessSector(symbol) {
        const sectorMap = {
            'AAPL': 'Technology',
            'GOOGL': 'Technology',
            'MSFT': 'Technology',
            'TSLA': 'Consumer',
            'JNJ': 'Healthcare',
            'JPM': 'Financial',
            'V': 'Financial',
            'PG': 'Consumer',
            'XOM': 'Energy',
            'HD': 'Consumer',
            'NVDA': 'Technology'
        };
        return sectorMap[symbol] || 'Technology';
    }

    // Provide fallback data when API fails
    getFallbackData(symbol) {
        const fallbackData = {
            'AAPL': { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, marketCap: 2800000000000, peRatio: 28.5, pbRatio: 39.8, debtToEquity: 1.73, roe: 26.4, sector: 'Technology', revenueGrowth: 8.1, revenueGrowthYears: 4 },
            'GOOGL': { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 132.76, marketCap: 1650000000000, peRatio: 22.1, pbRatio: 5.2, debtToEquity: 0.12, roe: 18.7, sector: 'Technology', revenueGrowth: 12.5, revenueGrowthYears: 3 },
            'MSFT': { symbol: 'MSFT', name: 'Microsoft Corporation', price: 378.85, marketCap: 2820000000000, peRatio: 32.4, pbRatio: 12.1, debtToEquity: 0.37, roe: 35.1, sector: 'Technology', revenueGrowth: 11.2, revenueGrowthYears: 5 },
            'TSLA': { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, marketCap: 790000000000, peRatio: 65.7, pbRatio: 9.8, debtToEquity: 0.17, roe: 19.3, sector: 'Consumer', revenueGrowth: 47.2, revenueGrowthYears: 6 },
            'JNJ': { symbol: 'JNJ', name: 'Johnson & Johnson', price: 160.32, marketCap: 421000000000, peRatio: 15.6, pbRatio: 5.1, debtToEquity: 0.46, roe: 25.8, sector: 'Healthcare', revenueGrowth: 6.8, revenueGrowthYears: 2 },
            'JPM': { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 147.92, marketCap: 434000000000, peRatio: 10.8, pbRatio: 1.6, debtToEquity: 1.21, roe: 15.2, sector: 'Financial', revenueGrowth: 4.3, revenueGrowthYears: 1 },
            'V': { symbol: 'V', name: 'Visa Inc.', price: 258.73, marketCap: 544000000000, peRatio: 31.2, pbRatio: 13.4, debtToEquity: 0.36, roe: 38.7, sector: 'Financial', revenueGrowth: 9.7, revenueGrowthYears: 3 },
            'PG': { symbol: 'PG', name: 'Procter & Gamble', price: 155.21, marketCap: 369000000000, peRatio: 26.1, pbRatio: 7.8, debtToEquity: 0.54, roe: 29.9, sector: 'Consumer', revenueGrowth: 5.2, revenueGrowthYears: 2 },
            'XOM': { symbol: 'XOM', name: 'Exxon Mobil Corporation', price: 104.65, marketCap: 441000000000, peRatio: 14.3, pbRatio: 1.9, debtToEquity: 0.25, roe: 17.5, sector: 'Energy', revenueGrowth: 15.8, revenueGrowthYears: 1 },
            'HD': { symbol: 'HD', name: 'The Home Depot Inc.', price: 327.89, marketCap: 333000000000, peRatio: 24.7, pbRatio: 45.2, debtToEquity: 14.8, roe: 132.4, sector: 'Consumer', revenueGrowth: 7.4, revenueGrowthYears: 4 },
            'NVDA': { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 487.84, marketCap: 1200000000000, peRatio: 67.8, pbRatio: 47.3, debtToEquity: 0.42, roe: 71.2, sector: 'Technology', revenueGrowth: 125.9, revenueGrowthYears: 5 }
        };

        return fallbackData[symbol] || {
            symbol: symbol,
            name: `${symbol} Inc.`,
            price: 0,
            marketCap: 0,
            peRatio: 0,
            pbRatio: 0,
            debtToEquity: 0,
            roe: 0,
            sector: 'Technology',
            revenueGrowth: 0,
            revenueGrowthYears: 1
        };
    }

    // Fetch multiple stocks at once
    async fetchMultipleStocks(symbols = CONFIG.DEFAULT_STOCKS) {
        const promises = symbols.map(symbol => this.getStockData(symbol));
        const results = await Promise.allSettled(promises);

        return results.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                console.warn(`Failed to fetch ${symbols[index]}:`, result.reason);
                return this.getFallbackData(symbols[index]);
            }
        });
    }

    // Symbol search for autocomplete functionality
    async searchSymbols(query) {
        if (!query || query.length < 1) {
            return [];
        }

        // If using demo API key, return fallback search results directly
        if (this.apiKey === 'demo') {
            console.log(`Using demo mode - returning fallback search results for "${query}"`);
            return this.getFallbackSearchResults(query);
        }

        try {
            const url = `${this.baseUrl}/symbol_search?symbol=${encodeURIComponent(query)}&apikey=${this.apiKey}`;
            const response = await this.fetchWithTimeout(url);
            const data = await response.json();

            // Handle different possible response formats
            const results = data.data || data.result || data;

            if (Array.isArray(results)) {
                return results.slice(0, 10).map(item => ({
                    symbol: item.symbol || item.ticker || item.code,
                    name: item.instrument_name || item.name || item.company_name,
                    exchange: item.exchange || item.market || 'N/A',
                    type: item.instrument_type || item.type || 'Common Stock'
                }));
            }

            return [];
        } catch (error) {
            console.warn(`Symbol search failed for "${query}":`, error);
            return this.getFallbackSearchResults(query);
        }
    }

    // Fallback search results when API is unavailable
    getFallbackSearchResults(query) {
        const allSymbols = [
            { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', type: 'Common Stock' },
            { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', exchange: 'NASDAQ', type: 'Common Stock' },
            { symbol: 'GOOG', name: 'Alphabet Inc. Class C', exchange: 'NASDAQ', type: 'Common Stock' },
            { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', type: 'Common Stock' },
            { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', type: 'Common Stock' },
            { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE', type: 'Common Stock' },
            { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE', type: 'Common Stock' },
            { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE', type: 'Common Stock' },
            { symbol: 'PG', name: 'Procter & Gamble Company', exchange: 'NYSE', type: 'Common Stock' },
            { symbol: 'XOM', name: 'Exxon Mobil Corporation', exchange: 'NYSE', type: 'Common Stock' },
            { symbol: 'HD', name: 'The Home Depot Inc.', exchange: 'NYSE', type: 'Common Stock' },
            { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', type: 'Common Stock' },
            { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', type: 'Common Stock' },
            { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', type: 'Common Stock' },
            { symbol: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ', type: 'Common Stock' },
            { symbol: 'AMD', name: 'Advanced Micro Devices Inc.', exchange: 'NASDAQ', type: 'Common Stock' },
            { symbol: 'INTC', name: 'Intel Corporation', exchange: 'NASDAQ', type: 'Common Stock' },
            { symbol: 'CRM', name: 'Salesforce Inc.', exchange: 'NYSE', type: 'Common Stock' },
            { symbol: 'ORCL', name: 'Oracle Corporation', exchange: 'NYSE', type: 'Common Stock' },
            { symbol: 'ADBE', name: 'Adobe Inc.', exchange: 'NASDAQ', type: 'Common Stock' },
            { symbol: 'DIS', name: 'The Walt Disney Company', exchange: 'NYSE', type: 'Common Stock' },
            { symbol: 'KO', name: 'The Coca-Cola Company', exchange: 'NYSE', type: 'Common Stock' },
            { symbol: 'PEP', name: 'PepsiCo Inc.', exchange: 'NASDAQ', type: 'Common Stock' },
            { symbol: 'WMT', name: 'Walmart Inc.', exchange: 'NYSE', type: 'Common Stock' },
            { symbol: 'CVX', name: 'Chevron Corporation', exchange: 'NYSE', type: 'Common Stock' }
        ];

        const queryLower = query.toLowerCase();
        return allSymbols
            .filter(stock =>
                stock.symbol.toLowerCase().includes(queryLower) ||
                stock.name.toLowerCase().includes(queryLower)
            )
            .slice(0, 10);
    }

    // Clear cache (useful for manual refresh)
    clearCache() {
        this.cache.clear();
        this.cacheTimestamps.clear();
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TwelveDataService;
}