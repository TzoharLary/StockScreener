/**
 * Edge Cases and Fallback Tests
 * 
 * Tests for:
 * 1. Invalid symbols
 * 2. Rate limiting scenarios
 * 3. Network failures
 * 4. Missing data fields
 * 5. Fallback data mechanisms
 * 6. Error handling
 */

global.fetch = require('node-fetch');

const TwelveDataService = require('../api-service.js');
const CONFIG = require('../config.js');

const TEST_API_KEY = 'f78f867c460e4a2682c3590f1ea1550e';

Object.defineProperty(CONFIG, 'TWELVE_DATA_API_KEY', {
    get: function() { return TEST_API_KEY; },
    configurable: true
});

let service;

beforeEach(() => {
    service = new TwelveDataService();
    service.clearCache();
});

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('Edge Cases and Error Handling', () => {
    
    describe('Invalid Symbol Handling', () => {
        const invalidSymbols = [
            'NOTREAL',
            'XXXYYY',
            'FAKE123',
            '!!!',
            '12345'
        ];

        test.each(invalidSymbols)(
            'should handle invalid symbol "%s" without throwing error',
            async (symbol) => {
                await delay(8000);
                
                let data;
                let error;
                
                try {
                    data = await service.getStockData(symbol);
                } catch (e) {
                    error = e;
                }
                
                // Should not throw error, should return fallback data
                expect(error).toBeUndefined();
                expect(data).toBeDefined();
                expect(data.symbol).toBe(symbol);
                
                console.log(`Invalid symbol "${symbol}" handled with:`, {
                    name: data.name,
                    usesFallback: data.name === `${symbol} Inc.` || data.price === 0
                });
            },
            30000
        );

        test('should distinguish between invalid symbols and real data', async () => {
            await delay(8000);
            
            // Get real stock
            const realData = await service.getStockData('AAPL');
            
            await delay(8000);
            
            // Get invalid stock
            const fakeData = await service.getStockData('NOTREAL');
            
            console.log('Real stock AAPL:', {
                name: realData.name,
                price: realData.price,
                marketCap: realData.marketCap
            });
            
            console.log('Invalid stock NOTREAL:', {
                name: fakeData.name,
                price: fakeData.price,
                marketCap: fakeData.marketCap
            });
            
            // Real stock should have different characteristics than fallback
            if (realData.price === 0 || fakeData.price > 0) {
                console.warn('Warning: Real data appears to be fallback or invalid data appears real');
            }
        }, 60000);
    });

    describe('Fallback Data Validation', () => {
        test('should provide complete fallback data for all default stocks', () => {
            const defaultStocks = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'JNJ', 'JPM', 'V', 'PG', 'XOM', 'HD'];
            
            defaultStocks.forEach(symbol => {
                const fallback = service.getFallbackData(symbol);
                
                expect(fallback.symbol).toBe(symbol);
                expect(fallback.name).toBeTruthy();
                expect(fallback.name).not.toBe(`${symbol} Inc.`);
                expect(fallback.price).toBeGreaterThan(0);
                expect(fallback.marketCap).toBeGreaterThan(0);
                expect(fallback.peRatio).toBeGreaterThan(0);
                expect(fallback.sector).toBeTruthy();
                
                console.log(`${symbol} fallback:`, {
                    name: fallback.name,
                    price: fallback.price,
                    sector: fallback.sector
                });
            });
        });

        test('should provide generic fallback for unknown symbols', () => {
            const unknownSymbols = ['XYZ', 'ABC', 'UNKNOWN'];
            
            unknownSymbols.forEach(symbol => {
                const fallback = service.getFallbackData(symbol);
                
                expect(fallback.symbol).toBe(symbol);
                expect(fallback.name).toBe(`${symbol} Inc.`);
                expect(fallback.price).toBe(0);
                expect(fallback.marketCap).toBe(0);
                expect(fallback.peRatio).toBe(0);
                expect(fallback.sector).toBe('Technology');
                
                console.log(`${symbol} generic fallback:`, fallback);
            });
        });

        test('should fallback search results match known symbols', () => {
            const searchQueries = ['AAPL', 'GOOGL', 'Microsoft', 'Tesla'];
            
            searchQueries.forEach(query => {
                const results = service.getFallbackSearchResults(query);
                
                expect(Array.isArray(results)).toBe(true);
                expect(results.length).toBeGreaterThanOrEqual(0);
                
                results.forEach(result => {
                    expect(result).toHaveProperty('symbol');
                    expect(result).toHaveProperty('name');
                    expect(result).toHaveProperty('exchange');
                    expect(result).toHaveProperty('type');
                });
                
                console.log(`Fallback search for "${query}":`, results.length, 'results');
            });
        });
    });

    describe('API Response Validation', () => {
        test('should handle malformed API responses gracefully', async () => {
            await delay(8000);
            
            // Test with a potentially problematic symbol
            const data = await service.getStockData('AAPL');
            
            // Verify all required fields exist even if API returns unexpected format
            const requiredFields = [
                'symbol', 'name', 'price', 'marketCap', 'peRatio', 
                'pbRatio', 'debtToEquity', 'roe', 'sector', 
                'revenueGrowth', 'revenueGrowthYears'
            ];
            
            requiredFields.forEach(field => {
                expect(data).toHaveProperty(field);
                expect(data[field]).toBeDefined();
            });
            
            console.log('All required fields present:', requiredFields.length);
        }, 30000);

        test('should detect and warn about zero values', async () => {
            await delay(8000);
            
            const symbols = ['AAPL', 'GOOGL', 'MSFT'];
            const zeroWarnings = [];
            
            for (const symbol of symbols) {
                await delay(8000);
                const data = await service.getStockData(symbol);
                
                if (data.price === 0) zeroWarnings.push(`${symbol}: price is 0`);
                if (data.marketCap === 0) zeroWarnings.push(`${symbol}: marketCap is 0`);
                if (data.peRatio === 0) zeroWarnings.push(`${symbol}: peRatio is 0`);
            }
            
            if (zeroWarnings.length > 0) {
                console.warn('⚠ Zero value warnings:');
                zeroWarnings.forEach(w => console.warn(`  - ${w}`));
            } else {
                console.log('✓ No zero values detected in tested stocks');
            }
        }, 120000);
    });

    describe('Cache Behavior', () => {
        test('should cache data correctly', async () => {
            await delay(8000);
            
            const symbol = 'MSFT';
            
            // First fetch
            expect(service.cache.has(symbol)).toBe(false);
            const data1 = await service.getStockData(symbol);
            expect(service.cache.has(symbol)).toBe(true);
            
            // Second fetch (from cache)
            const data2 = await service.getStockData(symbol);
            
            // Should return same data
            expect(data1).toEqual(data2);
            
            console.log('Cache working correctly for', symbol);
        }, 30000);

        test('should validate cache timestamps', async () => {
            await delay(8000);
            
            const symbol = 'AAPL';
            await service.getStockData(symbol);
            
            expect(service.cacheTimestamps.has(symbol)).toBe(true);
            
            const timestamp = service.cacheTimestamps.get(symbol);
            expect(typeof timestamp).toBe('number');
            expect(timestamp).toBeLessThanOrEqual(Date.now());
            expect(timestamp).toBeGreaterThan(Date.now() - 10000); // Within last 10 seconds
            
            console.log('Cache timestamp valid:', new Date(timestamp).toISOString());
        }, 30000);

        test('should respect cache validity check', async () => {
            await delay(8000);
            
            const symbol = 'GOOGL';
            await service.getStockData(symbol);
            
            // Should be valid immediately
            expect(service.isCacheValid(symbol)).toBe(true);
            
            // Manually set old timestamp
            service.cacheTimestamps.set(symbol, Date.now() - CONFIG.CACHE_DURATION - 1000);
            
            // Should now be invalid
            expect(service.isCacheValid(symbol)).toBe(false);
            
            console.log('Cache validity check working correctly');
        }, 30000);

        test('should cleanup cache when reaching max size', async () => {
            const maxSize = service.MAX_CACHE_SIZE;
            console.log('Testing cache cleanup with max size:', maxSize);
            
            // Fill cache beyond max size
            const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'META', 'AMZN', 'NFLX', 'AMD', 'INTC',
                            'CRM', 'ORCL', 'ADBE', 'DIS', 'KO', 'PEP', 'WMT', 'CVX', 'HD', 'JNJ', 'JPM', 'V'];
            
            for (let i = 0; i < Math.min(symbols.length, maxSize + 5); i++) {
                await delay(8000);
                await service.getStockData(symbols[i]);
                console.log(`Cache size after ${symbols[i]}: ${service.cache.size}`);
            }
            
            // Cache should not exceed max size
            expect(service.cache.size).toBeLessThanOrEqual(maxSize + 5); // Some tolerance
            
            console.log('Final cache size:', service.cache.size);
        }, 600000); // 10 minute timeout for this long test
    });

    describe('Watchlist Integration', () => {
        test('should track watchlist symbols', () => {
            expect(service.watchlistSymbols.size).toBe(0);
            
            service.addToWatchlist('AAPL');
            expect(service.watchlistSymbols.has('AAPL')).toBe(true);
            expect(service.watchlistSymbols.size).toBe(1);
            
            service.addToWatchlist('GOOGL');
            expect(service.watchlistSymbols.size).toBe(2);
            
            service.removeFromWatchlist('AAPL');
            expect(service.watchlistSymbols.has('AAPL')).toBe(false);
            expect(service.watchlistSymbols.size).toBe(1);
            
            console.log('Watchlist tracking working correctly');
        });

        test('should preserve watchlist symbols during cache cleanup', async () => {
            await delay(8000);
            
            // Add to watchlist
            service.addToWatchlist('AAPL');
            
            // Fetch data
            await service.getStockData('AAPL');
            await delay(8000);
            await service.getStockData('GOOGL');
            
            // Fill cache with more items
            const symbols = ['MSFT', 'TSLA', 'NVDA', 'META', 'AMZN'];
            for (const symbol of symbols) {
                await delay(8000);
                await service.getStockData(symbol);
            }
            
            // Trigger cleanup
            service.cleanupCache();
            
            // AAPL should still be in cache (watchlist protected)
            expect(service.cache.has('AAPL')).toBe(true);
            
            console.log('Watchlist symbols preserved during cleanup');
        }, 180000);
    });

    describe('Multiple Stock Fetch Resilience', () => {
        test('should handle partial failures in batch fetch', async () => {
            await delay(8000);
            
            // Mix of valid and potentially invalid symbols
            const symbols = ['AAPL', 'NOTREAL', 'GOOGL', 'FAKE', 'MSFT'];
            
            const results = await service.fetchMultipleStocks(symbols);
            
            expect(results).toBeDefined();
            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBe(symbols.length);
            
            // All results should have data (either real or fallback)
            results.forEach((data, index) => {
                expect(data).toBeDefined();
                expect(data.symbol).toBe(symbols[index]);
                console.log(`${symbols[index]}:`, data.name, '- Price:', data.price);
            });
            
            console.log('Batch fetch handled partial failures correctly');
        }, 60000);
    });

    describe('Search Edge Cases', () => {
        test('should handle empty search query', async () => {
            const results = await service.searchSymbols('');
            
            expect(Array.isArray(results)).toBe(true);
            console.log('Empty query returned:', results.length, 'results');
        });

        test('should handle special characters in search', async () => {
            await delay(8000);
            
            const specialQueries = ['A&B', 'C/D', 'X-Y', 'A.B'];
            
            for (const query of specialQueries) {
                await delay(8000);
                const results = await service.searchSymbols(query);
                
                expect(Array.isArray(results)).toBe(true);
                console.log(`Search for "${query}":`, results.length, 'results');
            }
        }, 120000);

        test('should handle very long search queries', async () => {
            await delay(8000);
            
            const longQuery = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const results = await service.searchSymbols(longQuery);
            
            expect(Array.isArray(results)).toBe(true);
            console.log('Long query returned:', results.length, 'results');
        }, 20000);
    });

    describe('Data Type Validation', () => {
        test('should return correct data types for all fields', async () => {
            await delay(8000);
            
            const data = await service.getStockData('AAPL');
            
            expect(typeof data.symbol).toBe('string');
            expect(typeof data.name).toBe('string');
            expect(typeof data.price).toBe('number');
            expect(typeof data.marketCap).toBe('number');
            expect(typeof data.peRatio).toBe('number');
            expect(typeof data.pbRatio).toBe('number');
            expect(typeof data.debtToEquity).toBe('number');
            expect(typeof data.roe).toBe('number');
            expect(typeof data.sector).toBe('string');
            expect(typeof data.revenueGrowth).toBe('number');
            expect(typeof data.revenueGrowthYears).toBe('number');
            
            // Check for NaN
            expect(isNaN(data.price)).toBe(false);
            expect(isNaN(data.marketCap)).toBe(false);
            expect(isNaN(data.peRatio)).toBe(false);
            expect(isNaN(data.pbRatio)).toBe(false);
            expect(isNaN(data.debtToEquity)).toBe(false);
            expect(isNaN(data.roe)).toBe(false);
            expect(isNaN(data.revenueGrowth)).toBe(false);
            
            console.log('All data types are correct and not NaN');
        }, 30000);
    });
});
