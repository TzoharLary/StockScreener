# Test Suite Documentation

## Overview

This comprehensive test suite validates all Twelve Data API endpoints and statistics for the StockScreener application. The tests ensure that every piece of data displayed to users is accurate and complete.

## Test Files

### 1. `api-service.test.js` - Core API Tests
Tests all Twelve Data API endpoints and data retrieval:
- Service initialization
- `/quote` endpoint for stock prices
- `/statistics` endpoint for fundamental metrics
- `/profile` endpoint for company information
- `/symbol_search` endpoint for autocomplete
- Cache management
- Fallback data mechanisms

### 2. `search-display.test.js` - Integration Tests
Tests the complete user flow from search to data display:
- Searching for companies by name
- Selecting stocks from search results
- Displaying all statistics correctly
- Detecting zero values (ensuring real data is shown)
- Data completeness reports
- Autocomplete functionality

### 3. `edge-cases.test.js` - Edge Cases and Error Handling
Tests error scenarios and edge cases:
- Invalid symbols
- Rate limiting
- Network failures
- Missing data fields
- Fallback behavior
- Cache cleanup
- Watchlist integration
- Batch fetch resilience
- Special characters in search
- Data type validation

## API Key Configuration

The tests use the API key provided in the issue: `f78f867c460e4a2682c3590f1ea1550e`

This key is hardcoded in the test files to ensure consistent testing.

## Running the Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test api-service.test.js
npm test search-display.test.js
npm test edge-cases.test.js
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

## Important Notes

### Rate Limiting
The Twelve Data free tier has the following limits:
- **8 API calls per minute**
- **800 API calls per day**

Each test includes delays (`await delay(8000)`) to respect these limits. This means:
- Tests run slowly by design (8+ seconds between API calls)
- Full test suite may take 30-60 minutes to complete
- Do not run all tests repeatedly to avoid hitting daily limit

### Test Timeouts
Individual tests have extended timeouts (20-60 seconds) to accommodate:
- API rate limiting delays
- Network latency
- API response time

### Expected Behavior

#### Successful Tests
Tests pass when:
- API returns valid data
- All required fields are present
- Data types are correct
- No critical fields are zero (price, marketCap, peRatio)

#### Warnings vs Failures
The tests distinguish between:
- **Warnings**: Single fields with zero values (logged but don't fail test)
- **Failures**: All critical fields are zero or missing required fields

### Zero Value Detection
The tests specifically check for zero values as requested in the issue:
> "I don't get a zero instead of what I'm supposed to see"

When zeros are detected, tests will:
1. Log warnings to console
2. Fail if ALL critical fields (price, marketCap, peRatio) are zero
3. Pass if some fields are zero (may indicate valid data, e.g., companies with no debt)

## Test Coverage

### Companies Tested

**Default Stocks (in demo):**
- AAPL - Apple Inc.
- GOOGL - Alphabet Inc.
- MSFT - Microsoft Corporation
- TSLA - Tesla Inc.
- JNJ - Johnson & Johnson
- JPM - JPMorgan Chase & Co.
- V - Visa Inc.
- PG - Procter & Gamble
- XOM - Exxon Mobil Corporation
- HD - The Home Depot Inc.

**Additional Companies:**
- NVDA - NVIDIA Corporation
- META - Meta Platforms Inc.
- AMZN - Amazon.com Inc.
- NFLX - Netflix Inc.
- AMD - Advanced Micro Devices Inc.
- INTC - Intel Corporation
- CRM - Salesforce Inc.
- ORCL - Oracle Corporation
- ADBE - Adobe Inc.
- DIS - The Walt Disney Company

### Statistics Tested

For each company, the following statistics are validated:
1. **Symbol** - Stock ticker
2. **Name** - Company name
3. **Price** - Current stock price
4. **Market Cap** - Market capitalization
5. **P/E Ratio** - Price-to-Earnings ratio
6. **P/B Ratio** - Price-to-Book ratio
7. **Debt-to-Equity** - Debt-to-Equity ratio
8. **ROE** - Return on Equity
9. **Revenue Growth** - Revenue growth percentage
10. **Sector** - Business sector
11. **Revenue Growth Years** - Years of consistent growth

### API Endpoints Tested

1. **Quote Endpoint** (`/quote`)
   - Stock price
   - Market data
   - Trading information

2. **Statistics Endpoint** (`/statistics`)
   - Fundamental metrics
   - Valuation ratios
   - Financial data

3. **Profile Endpoint** (`/profile`)
   - Company name
   - Sector information
   - Business description

4. **Symbol Search Endpoint** (`/symbol_search`)
   - Autocomplete functionality
   - Company name search
   - Symbol lookup

## Interpreting Test Results

### Console Output

Tests provide detailed console output including:
- Raw API responses
- Formatted data for each symbol
- Zero value warnings
- Data completeness reports
- Search results
- Cache behavior

Example output:
```
✓ Company Name: Apple Inc.
✓ Price: $175.43
✓ Market Cap: $2800.00B
✓ P/E Ratio: 28.5
⚠ WARNING: P/B Ratio is 0 for AAPL
✓ Debt-to-Equity: 1.73
✓ ROE: 26.4%
✓ Revenue Growth: 8.1%
✓ Sector: Technology
```

### Data Completeness Report

The `search-display.test.js` file includes a comprehensive data completeness report that shows which fields are populated for each stock:

```
=== DATA COMPLETENESS REPORT ===

AAPL (9/9):
  Name: ✓
  Price: ✓
  Market Cap: ✓
  P/E Ratio: ✓
  P/B Ratio: ✓
  Debt/Equity: ✓
  ROE: ✓
  Sector: ✓
  Revenue Growth: ✓
```

### Debugging Failed Tests

If tests fail:

1. **Check API Rate Limits**
   - Have you exceeded 8 calls/min?
   - Have you exceeded 800 calls/day?

2. **Check API Key**
   - Is the API key valid?
   - Is it the correct tier?

3. **Check Network**
   - Is internet connection stable?
   - Are there firewall issues?

4. **Check API Status**
   - Is Twelve Data API operational?
   - Visit: https://twelvedata.com/status

5. **Review Console Logs**
   - Look for warning messages
   - Check raw API responses
   - Identify which specific fields are problematic

## Continuous Integration

These tests can be integrated into CI/CD pipelines, but be aware:
- Tests are slow (rate limiting delays)
- Daily API limit may be reached
- Consider running only critical tests in CI
- Use demo mode for rapid development testing

## Future Enhancements

Potential improvements to the test suite:
- Mock API responses for faster testing
- Separate integration vs unit tests
- Performance benchmarking
- Historical data comparison
- Automated regression testing
- Test data snapshots
