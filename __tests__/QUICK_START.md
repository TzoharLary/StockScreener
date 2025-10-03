# Quick Start Guide - Running Tests

This guide helps you quickly get started with the StockScreener test suite.

## Prerequisites

✅ Node.js installed (v14 or higher)  
✅ npm installed  
✅ Internet connection (for API tests)

## Installation

```bash
# Navigate to project directory
cd StockScreener

# Install dependencies (if not already done)
npm install
```

## Running Tests

### Option 1: Quick Validation (Recommended First)

Run a subset of tests to verify everything is working (5-10 minutes):

```bash
./quick-test.sh
```

This runs:
- Initialization tests (no API calls)
- Fallback data tests (no API calls)
- One API connectivity test
- Cache behavior test

**Expected Output:**
```
=========================================
StockScreener - Quick API Test Runner
=========================================

1. Testing service initialization...
✓ should initialize with correct configuration (3 ms)
✓ should have empty cache on initialization (1 ms)

2. Testing fallback data...
✓ should provide fallback data for known symbols (10 ms)
✓ should provide generic fallback for unknown symbols (3 ms)

3. Testing API connectivity with AAPL...
✓ should fetch complete data for AAPL (8023 ms)

4. Testing cache behavior...
✓ should respect cache (15 ms)

=========================================
Quick tests completed!
=========================================
```

### Option 2: Full Test Suite

Run all 80+ tests (30-60 minutes due to API rate limiting):

```bash
npm test
```

⚠️ **Warning:** This makes many API calls. The free tier has a limit of 800 calls/day.

### Option 3: Specific Test Files

Run tests for a specific category:

```bash
# API endpoint tests only
npm test api-service.test.js

# Integration tests only
npm test search-display.test.js

# Edge case tests only
npm test edge-cases.test.js
```

### Option 4: Specific Test Patterns

Run tests matching a specific name:

```bash
# Run only initialization tests
npm test -- --testNamePattern="Service Initialization"

# Run only fallback tests
npm test -- --testNamePattern="Fallback Data"

# Run only AAPL tests
npm test -- --testNamePattern="AAPL"
```

## Understanding Test Output

### Success ✅

```
PASS __tests__/api-service.test.js
  ✓ should fetch complete data for AAPL (8023 ms)

AAPL Data: {
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "price": 175.43,
  "marketCap": 2800000000000,
  "peRatio": 28.5,
  ...
}

Test Suites: 1 passed
Tests: 1 passed
```

### Warning ⚠️

```
console.warn
  ⚠ WARNING: P/B Ratio is 0 for AAPL
```

This is logged but doesn't fail the test. Some zeros may be valid.

### Failure ❌

```
FAIL __tests__/api-service.test.js
  ✕ should fetch complete data for AAPL

  ❌ CRITICAL: All main fields are 0 for AAPL
  This indicates API is not returning proper data!
```

This indicates a real problem (likely API rate limit or connectivity issue).

## Common Issues and Solutions

### Issue: "Rate limit exceeded"

**Cause:** You've made too many API calls (limit: 8/min, 800/day)

**Solution:**
- Wait a few minutes and try again
- Use the quick test script instead of full suite
- Run specific tests instead of all tests

### Issue: "All values are 0"

**Cause:** API is rate limited or not responding properly

**Solution:**
- Check your internet connection
- Verify the API key is valid
- Wait a few minutes and retry
- Tests will automatically use fallback data

### Issue: "Tests take too long"

**Cause:** Tests include 8-second delays to respect API rate limits

**Solution:**
- This is expected behavior
- Use quick test script for faster validation
- Run specific test files instead of full suite

### Issue: "Cannot find module"

**Cause:** Dependencies not installed

**Solution:**
```bash
npm install
```

## Test Statistics

| Category | Test Count | Estimated Time |
|----------|-----------|----------------|
| Service Initialization | 2 | < 1 second |
| Default Stocks API | 10 | 80 seconds (with delays) |
| Additional Stocks API | 10 | 80 seconds (with delays) |
| Individual Statistics | 9 | 80 seconds (with delays) |
| Search Tests | 3 | 25 seconds (with delays) |
| Edge Cases | 7 | 60 seconds (with delays) |
| Integration Tests | 15+ | 120+ seconds (with delays) |
| Fallback/Cache Tests | 10 | < 5 seconds (no API) |
| **Total** | **80+** | **30-60 minutes** |

## What Each Test File Does

### `api-service.test.js`
Tests the core API service:
- Initialization
- Fetching data for all companies
- Validating all statistics
- Search functionality
- Cache management

### `search-display.test.js`
Tests the complete user flow:
- Searching for companies
- Selecting from results
- Displaying all data correctly
- Detecting zero values
- Data completeness

### `edge-cases.test.js`
Tests error scenarios:
- Invalid symbols
- Network failures
- Rate limiting
- Missing data
- Fallback behavior

## Next Steps

After running tests:

1. **Review Output** - Check console logs for warnings
2. **Check Coverage** - Run `npm run test:coverage` to see coverage report
3. **Document Results** - Use `__tests__/TEST_REPORT_TEMPLATE.md` to track findings
4. **Report Issues** - If tests fail, check the issue tracker

## Additional Resources

- **Detailed Documentation:** `__tests__/README.md`
- **Implementation Summary:** `__tests__/IMPLEMENTATION_SUMMARY.md`
- **Test Report Template:** `__tests__/TEST_REPORT_TEMPLATE.md`
- **Main README:** `README.md` (Testing section)

## Tips

💡 **Best Practice:** Start with the quick test script to verify setup, then run specific test files as needed.

💡 **Development:** Use `npm run test:watch` to automatically re-run tests as you make changes.

💡 **CI/CD:** Consider running only the quick tests in CI to avoid rate limits.

💡 **API Key:** Tests use the hardcoded API key from the issue. For production, use environment variables.

## Support

If you encounter issues:

1. Check the console output for specific error messages
2. Review `__tests__/README.md` for detailed documentation
3. Check if the API is operational: https://twelvedata.com/status
4. Verify your API key is valid and has available credits

---

**Ready to test?** Start with:
```bash
./quick-test.sh
```
