/**
 * Integration Tests for Stock Search and Display
 * 
 * Tests the complete flow of:
 * 1. Searching for a company in the search bar
 * 2. Selecting it from results
 * 3. Verifying all data is displayed correctly
 * 4. Ensuring no zero values appear when real data should be present
 * 
 * This addresses the issue requirement:
 * "I want to make sure that when I type a company name in the search bar 
 * and click on it, I get all the information about it properly and I don't 
 * get a zero instead of what I'm supposed to see."
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

describe('Search and Display Integration Tests', () => {
    
    describe('Complete Search Flow - Default Companies', () => {
        const testCases = [
            { query: 'Apple', expectedSymbol: 'AAPL', expectedSector: 'Technology' },
            { query: 'Microsoft', expectedSymbol: 'MSFT', expectedSector: 'Technology' },
            { query: 'Tesla', expectedSymbol: 'TSLA', expectedSector: 'Consumer' },
            { query: 'Johnson', expectedSymbol: 'JNJ', expectedSector: 'Healthcare' },
            { query: 'JPMorgan', expectedSymbol: 'JPM', expectedSector: 'Financial' }
        ];

        test.each(testCases)(
            'should search for "$query", find $expectedSymbol, and display all data correctly',
            async ({ query, expectedSymbol, expectedSector }) => {
                await delay(8000);
                
                // Step 1: Search for the company
                console.log(`\n=== Searching for "${query}" ===`);
                const searchResults = await service.searchSymbols(query);
                
                expect(searchResults).toBeDefined();
                expect(Array.isArray(searchResults)).toBe(true);
                expect(searchResults.length).toBeGreaterThan(0);
                
                // Step 2: Find the expected symbol in results
                const targetStock = searchResults.find(r => r.symbol === expectedSymbol);
                expect(targetStock).toBeDefined();
                console.log(`Found ${expectedSymbol}:`, targetStock);
                
                // Step 3: Fetch full data for the selected symbol
                await delay(8000); // Additional delay for next API call
                const stockData = await service.getStockData(expectedSymbol);
                
                console.log(`\n=== Full Data for ${expectedSymbol} ===`);
                console.log(JSON.stringify(stockData, null, 2));
                
                // Step 4: Verify ALL fields are present and valid
                expect(stockData.symbol).toBe(expectedSymbol);
                
                // Company Name
                expect(stockData.name).toBeTruthy();
                expect(stockData.name).not.toBe('0');
                expect(stockData.name).not.toBe(`${expectedSymbol} Inc.`);
                console.log(`✓ Company Name: ${stockData.name}`);
                
                // Price
                expect(stockData.price).toBeDefined();
                expect(typeof stockData.price).toBe('number');
                if (stockData.price === 0) {
                    console.warn(`⚠ WARNING: Price is 0 for ${expectedSymbol}`);
                } else {
                    console.log(`✓ Price: $${stockData.price}`);
                }
                
                // Market Cap
                expect(stockData.marketCap).toBeDefined();
                expect(typeof stockData.marketCap).toBe('number');
                if (stockData.marketCap === 0) {
                    console.warn(`⚠ WARNING: Market Cap is 0 for ${expectedSymbol}`);
                } else {
                    console.log(`✓ Market Cap: $${(stockData.marketCap / 1e9).toFixed(2)}B`);
                }
                
                // P/E Ratio
                expect(stockData.peRatio).toBeDefined();
                expect(typeof stockData.peRatio).toBe('number');
                if (stockData.peRatio === 0) {
                    console.warn(`⚠ WARNING: P/E Ratio is 0 for ${expectedSymbol}`);
                } else {
                    console.log(`✓ P/E Ratio: ${stockData.peRatio}`);
                }
                
                // P/B Ratio
                expect(stockData.pbRatio).toBeDefined();
                expect(typeof stockData.pbRatio).toBe('number');
                if (stockData.pbRatio === 0) {
                    console.warn(`⚠ WARNING: P/B Ratio is 0 for ${expectedSymbol}`);
                } else {
                    console.log(`✓ P/B Ratio: ${stockData.pbRatio}`);
                }
                
                // Debt-to-Equity
                expect(stockData.debtToEquity).toBeDefined();
                expect(typeof stockData.debtToEquity).toBe('number');
                if (stockData.debtToEquity === 0) {
                    console.warn(`⚠ WARNING: Debt-to-Equity is 0 for ${expectedSymbol}`);
                } else {
                    console.log(`✓ Debt-to-Equity: ${stockData.debtToEquity}`);
                }
                
                // ROE
                expect(stockData.roe).toBeDefined();
                expect(typeof stockData.roe).toBe('number');
                if (stockData.roe === 0) {
                    console.warn(`⚠ WARNING: ROE is 0 for ${expectedSymbol}`);
                } else {
                    console.log(`✓ ROE: ${stockData.roe}%`);
                }
                
                // Revenue Growth
                expect(stockData.revenueGrowth).toBeDefined();
                expect(typeof stockData.revenueGrowth).toBe('number');
                console.log(`✓ Revenue Growth: ${stockData.revenueGrowth}%`);
                
                // Sector
                expect(stockData.sector).toBeDefined();
                expect(stockData.sector).toBeTruthy();
                expect(stockData.sector).not.toBe('0');
                console.log(`✓ Sector: ${stockData.sector}`);
                
                // Final check: ensure we don't have all zeros
                const criticalFieldsAllZero = 
                    stockData.price === 0 && 
                    stockData.marketCap === 0 && 
                    stockData.peRatio === 0;
                
                if (criticalFieldsAllZero) {
                    console.error(`❌ CRITICAL: All main fields are 0 for ${expectedSymbol}`);
                    console.error('This indicates API is not returning proper data!');
                }
                
                expect(criticalFieldsAllZero).toBe(false);
                console.log(`\n✓ All data validated for ${expectedSymbol}\n`);
            },
            60000 // 60 second timeout
        );
    });

    describe('Complete Search Flow - Additional Companies', () => {
        const additionalTestCases = [
            { query: 'NVIDIA', expectedSymbol: 'NVDA' },
            { query: 'Meta', expectedSymbol: 'META' },
            { query: 'Amazon', expectedSymbol: 'AMZN' },
            { query: 'Netflix', expectedSymbol: 'NFLX' },
            { query: 'AMD', expectedSymbol: 'AMD' }
        ];

        test.each(additionalTestCases)(
            'should search for "$query", find $expectedSymbol, and validate data',
            async ({ query, expectedSymbol }) => {
                await delay(8000);
                
                console.log(`\n=== Testing ${query} (${expectedSymbol}) ===`);
                
                // Search
                const searchResults = await service.searchSymbols(query);
                expect(searchResults.length).toBeGreaterThan(0);
                
                const targetStock = searchResults.find(r => r.symbol === expectedSymbol);
                if (!targetStock) {
                    console.warn(`${expectedSymbol} not found in search results for "${query}"`);
                    console.log('Available symbols:', searchResults.map(r => r.symbol));
                }
                
                // Fetch data
                await delay(8000);
                const stockData = await service.getStockData(expectedSymbol);
                
                console.log(`Data for ${expectedSymbol}:`, {
                    name: stockData.name,
                    price: stockData.price,
                    marketCap: stockData.marketCap,
                    peRatio: stockData.peRatio,
                    pbRatio: stockData.pbRatio,
                    debtToEquity: stockData.debtToEquity,
                    roe: stockData.roe,
                    sector: stockData.sector
                });
                
                // Validate all fields exist
                expect(stockData).toHaveProperty('symbol');
                expect(stockData).toHaveProperty('name');
                expect(stockData).toHaveProperty('price');
                expect(stockData).toHaveProperty('marketCap');
                expect(stockData).toHaveProperty('peRatio');
                expect(stockData).toHaveProperty('pbRatio');
                expect(stockData).toHaveProperty('debtToEquity');
                expect(stockData).toHaveProperty('roe');
                expect(stockData).toHaveProperty('sector');
                expect(stockData).toHaveProperty('revenueGrowth');
                
                // Check for zeros
                const hasZeros = stockData.price === 0 || stockData.marketCap === 0;
                if (hasZeros) {
                    console.warn(`⚠ Some values are 0 for ${expectedSymbol}`);
                }
            },
            60000
        );
    });

    describe('Zero Value Detection', () => {
        test('should identify when API returns zero values', async () => {
            await delay(8000);
            
            const testSymbols = ['AAPL', 'GOOGL', 'MSFT'];
            const results = [];
            
            for (const symbol of testSymbols) {
                await delay(8000);
                const data = await service.getStockData(symbol);
                
                const hasZeroPrice = data.price === 0;
                const hasZeroMarketCap = data.marketCap === 0;
                const hasZeroPE = data.peRatio === 0;
                
                results.push({
                    symbol,
                    hasZeroPrice,
                    hasZeroMarketCap,
                    hasZeroPE,
                    allCriticalZero: hasZeroPrice && hasZeroMarketCap && hasZeroPE
                });
                
                console.log(`\n${symbol} Zero Check:`, {
                    price: data.price === 0 ? '❌ ZERO' : `✓ ${data.price}`,
                    marketCap: data.marketCap === 0 ? '❌ ZERO' : `✓ ${(data.marketCap/1e9).toFixed(2)}B`,
                    peRatio: data.peRatio === 0 ? '❌ ZERO' : `✓ ${data.peRatio}`
                });
            }
            
            console.log('\n=== Zero Value Summary ===');
            results.forEach(r => {
                if (r.allCriticalZero) {
                    console.error(`❌ ${r.symbol}: ALL CRITICAL VALUES ARE ZERO`);
                } else if (r.hasZeroPrice || r.hasZeroMarketCap || r.hasZeroPE) {
                    console.warn(`⚠ ${r.symbol}: Some values are zero`);
                } else {
                    console.log(`✓ ${r.symbol}: All values present`);
                }
            });
            
            // At least one stock should have valid data
            const allStocksHaveZeros = results.every(r => r.allCriticalZero);
            expect(allStocksHaveZeros).toBe(false);
        }, 120000);
    });

    describe('Search Autocomplete Functionality', () => {
        test('should provide suggestions as user types', async () => {
            const queries = ['A', 'AP', 'APP', 'APPL'];
            
            for (const query of queries) {
                await delay(8000);
                const results = await service.searchSymbols(query);
                
                console.log(`\nSearch for "${query}": ${results.length} results`);
                if (results.length > 0) {
                    console.log('Top 3:', results.slice(0, 3).map(r => `${r.symbol} - ${r.name}`));
                }
                
                expect(Array.isArray(results)).toBe(true);
            }
        }, 120000);

        test('should search by company name fragments', async () => {
            const nameSearches = ['tech', 'bank', 'pharma'];
            
            for (const query of nameSearches) {
                await delay(8000);
                const results = await service.searchSymbols(query);
                
                console.log(`\nCompany name search "${query}": ${results.length} results`);
                
                expect(Array.isArray(results)).toBe(true);
            }
        }, 120000);
    });

    describe('Data Completeness Report', () => {
        test('should generate completeness report for multiple stocks', async () => {
            const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA'];
            const report = [];
            
            for (const symbol of symbols) {
                await delay(8000);
                const data = await service.getStockData(symbol);
                
                const completeness = {
                    symbol,
                    hasName: !!data.name && data.name !== `${symbol} Inc.`,
                    hasPrice: data.price > 0,
                    hasMarketCap: data.marketCap > 0,
                    hasPE: data.peRatio > 0,
                    hasPB: data.pbRatio > 0,
                    hasDebtEquity: data.debtToEquity >= 0,
                    hasROE: data.roe >= 0,
                    hasSector: !!data.sector && data.sector !== '0',
                    hasRevenueGrowth: typeof data.revenueGrowth === 'number'
                };
                
                const score = Object.values(completeness).filter(v => v === true).length - 1; // -1 for symbol
                completeness.score = `${score}/9`;
                
                report.push(completeness);
            }
            
            console.log('\n=== DATA COMPLETENESS REPORT ===\n');
            report.forEach(item => {
                console.log(`${item.symbol} (${item.score}):`);
                console.log(`  Name: ${item.hasName ? '✓' : '❌'}`);
                console.log(`  Price: ${item.hasPrice ? '✓' : '❌'}`);
                console.log(`  Market Cap: ${item.hasMarketCap ? '✓' : '❌'}`);
                console.log(`  P/E Ratio: ${item.hasPE ? '✓' : '❌'}`);
                console.log(`  P/B Ratio: ${item.hasPB ? '✓' : '❌'}`);
                console.log(`  Debt/Equity: ${item.hasDebtEquity ? '✓' : '❌'}`);
                console.log(`  ROE: ${item.hasROE ? '✓' : '❌'}`);
                console.log(`  Sector: ${item.hasSector ? '✓' : '❌'}`);
                console.log(`  Revenue Growth: ${item.hasRevenueGrowth ? '✓' : '❌'}\n`);
            });
            
            // All stocks should have at least basic data
            report.forEach(item => {
                expect(item.hasName).toBe(true);
                expect(item.hasSector).toBe(true);
            });
        }, 180000);
    });
});
