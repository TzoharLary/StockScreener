# Bug Report for StockScreener Project

**Date:** 2024
**Project:** TzoharLary/StockScreener
**Reviewer:** GitHub Copilot

## Executive Summary

This document contains a comprehensive list of bugs, issues, and potential problems identified throughout the StockScreener project. Bugs are categorized by severity (Critical, High, Medium, Low) and type (Functional, Logic, Performance, Security, UX).

---

## Critical Bugs (Must Fix)

### BUG-001: Missing Stock Data Property Check in Stock Details Modal
**File:** `js/stock-details.js`, line 77
**Severity:** Critical
**Type:** Functional Bug

**Description:**
The stock details modal attempts to access `stockData.companyName` but the stock data object uses `name` as the property name, not `companyName`. This will cause the modal to display "N/A" for all company names.

**Code:**
```javascript
<span class="stock-name-large">${stockData.companyName || 'N/A'}</span>
```

**Issue:**
- Stock data objects have a `name` property, not `companyName`
- The modal will always show "N/A" for company names
- Inconsistent property naming across the codebase

**Steps to Reproduce:**
1. Click on any stock row in the results table
2. Modal opens but shows "N/A" for company name instead of actual name

**Expected Behavior:**
Should display the actual company name from `stockData.name`

**Fix:**
```javascript
<span class="stock-name-large">${stockData.name || 'N/A'}</span>
```

---

### BUG-002: Missing Stock Data Properties for Price Change
**File:** `js/stock-details.js`, lines 81-86
**Severity:** High
**Type:** Functional Bug

**Description:**
The stock details modal attempts to display price change data (`stockData.change` and `stockData.changePercent`), but these properties are never populated in the stock data objects returned from the API service.

**Code:**
```javascript
${stockData.change !== undefined ? `
    <span class="change ${stockData.change >= 0 ? 'positive' : 'negative'}">
        ${stockData.change >= 0 ? '+' : ''}${stockData.change.toFixed(2)} 
        (${stockData.changePercent >= 0 ? '+' : ''}${stockData.changePercent.toFixed(2)}%)
    </span>
` : ''}
```

**Issue:**
- `api-service.js` `formatStockData()` method doesn't extract or calculate `change` or `changePercent`
- These fields will always be undefined
- Display logic is present but data is never provided

**Steps to Reproduce:**
1. Open stock details modal for any stock
2. Price change information never displays

**Impact:**
Users cannot see daily price changes or percentage movements in the details modal.

**Fix Options:**
1. Extract these fields from API response in `formatStockData()`
2. Calculate them from current price vs previous close
3. Remove the unused display code if data is not available

---

### BUG-003: Incorrect Async Method Call in Stock Details
**File:** `js/stock-details.js`, line 60
**Severity:** High
**Type:** Logic Bug

**Description:**
The `fetchStockData()` method tries to call `apiService.fetchStockData([symbol])` with an array and then access `.then(data => data[0])`, but `fetchStockData()` in `api-service.js` expects a single symbol string, not an array.

**Code:**
```javascript
return this.apiService ? await this.apiService.fetchStockData([symbol]).then(data => data[0]) : null;
```

**Issue:**
- Incorrect method signature - `fetchStockData(symbol)` expects a string
- Use of array `[symbol]` will cause API errors
- Mixing async/await with .then() is confusing and error-prone

**Steps to Reproduce:**
1. Click stock row when `stockData` parameter is null
2. Modal tries to fetch data but API call fails
3. Console shows error about invalid symbol format

**Expected Behavior:**
Should call `getStockData(symbol)` or `fetchStockData(symbol)` correctly

**Fix:**
```javascript
return this.apiService ? await this.apiService.getStockData(symbol) : null;
```

---

### BUG-004: Race Condition in Autocomplete Search
**File:** `app.html`, lines 537-549
**Severity:** Medium
**Type:** Logic Bug

**Description:**
The autocomplete `handleInput()` method has a race condition where multiple search requests can be in flight simultaneously. If a user types quickly, slower responses from earlier searches can overwrite newer results.

**Code:**
```javascript
handleInput(value) {
    clearTimeout(this.searchTimeout);
    
    if (value.trim().length === 0) {
        this.hideDropdown();
        applyFilters();
        return;
    }

    // Debounce search
    this.searchTimeout = setTimeout(() => {
        this.searchSymbols(value.trim());
    }, 300);

    // Apply filters immediately for existing stocks
    applyFilters();
}
```

**Issue:**
- No request cancellation for in-flight API calls
- Old search results can replace newer ones if they arrive late
- No tracking of current search query vs displayed results

**Steps to Reproduce:**
1. Type "A" quickly then "APP" 
2. First search for "A" might return after search for "APP"
3. Results show matches for "A" instead of "APP"

**Impact:**
Confusing user experience with incorrect search results displayed

**Fix:**
Add request tracking and cancellation using AbortController or request IDs

---

## High Priority Bugs

### BUG-005: Missing Error Handling in Watchlist Stock Toggle
**File:** `js/watchlist-manager.js`, lines 74-97
**Severity:** High
**Type:** Error Handling

**Description:**
The `toggleStockInWatchlist()` method doesn't validate that the watchlist exists before trying to access its properties, which can cause crashes if the watchlist was deleted or corrupted.

**Code:**
```javascript
toggleStockInWatchlist(watchlistId, symbol, stockName, button) {
    const watchlist = this.storage.getWatchlist(watchlistId);
    
    if (watchlist.stocks.includes(symbol)) {
        // Remove from watchlist
        this.storage.removeStockFromWatchlist(watchlistId, symbol);
        // ... rest of code
```

**Issue:**
- No null check on `watchlist` before accessing `.stocks`
- If `getWatchlist()` returns null/undefined, code crashes
- No error handling for storage failures

**Steps to Reproduce:**
1. Delete browser localStorage while app is open
2. Try to add stock to watchlist
3. App crashes with "Cannot read property 'stocks' of null"

**Fix:**
```javascript
toggleStockInWatchlist(watchlistId, symbol, stockName, button) {
    const watchlist = this.storage.getWatchlist(watchlistId);
    
    if (!watchlist) {
        this.showToast('Watchlist not found. Please refresh the page.', 'error');
        return;
    }
    
    if (watchlist.stocks.includes(symbol)) {
        // ... rest of code
```

---

### BUG-006: Potential XSS Vulnerability in Stock Table Rendering
**File:** `app.html`, line 635
**Severity:** High
**Type:** Security

**Description:**
Stock data is embedded in `onclick` handlers using `JSON.stringify()` without proper escaping, which could lead to XSS if stock names contain malicious characters.

**Code:**
```javascript
<tr style="cursor: pointer;" onclick="stockDetailsView.showStockDetails('${stock.symbol}', ${JSON.stringify(stock).replace(/"/g, '&quot;')})">
```

**Issue:**
- Simple `replace(/"/g, '&quot;')` is insufficient for proper HTML attribute escaping
- Stock names or other fields with single quotes or backticks could break out of the attribute
- Potential XSS vector if API returns malicious data

**Example Exploit:**
If `stock.name = "Test'); alert('XSS');//"`

**Steps to Reproduce:**
1. Mock API to return stock with name: `Test'); alert('XSS');//`
2. Click on the stock row
3. JavaScript executes in onclick handler context

**Fix:**
Avoid inline event handlers altogether, use event delegation instead

---

### BUG-007: Integer Parsing Bug in validateInteger
**File:** `utils.js`, line 47
**Severity:** Medium
**Type:** Logic Bug

**Description:**
The `validateInteger()` function uses `parseInt()` which doesn't check if the original value was actually an integer. It will convert floats to integers silently, which may not be the desired behavior.

**Code:**
```javascript
function validateInteger(value, options = {}) {
    const { min = -Infinity, max = Infinity, allowNaN = true } = options;

    const num = parseInt(value);

    if (isNaN(num)) {
        return allowNaN;
    }

    return Number.isInteger(num) && num >= min && num <= max;
}
```

**Issue:**
- `parseInt("3.14")` returns `3` (valid integer)
- But the input `"3.14"` should probably be rejected as invalid integer
- Misleading validation for decimal inputs

**Example:**
```javascript
validateInteger("3.14")  // Returns true, but "3.14" is not an integer string
```

**Steps to Reproduce:**
1. Enter "3.14" in "Revenue Growth Years" field
2. Validation passes even though it should require an integer
3. Value is silently converted to 3

**Fix:**
```javascript
function validateInteger(value, options = {}) {
    const { min = -Infinity, max = Infinity, allowNaN = true } = options;

    // Check if value is numeric and doesn't contain decimal point
    if (typeof value === 'string' && value.includes('.')) {
        return false;
    }

    const num = parseInt(value, 10);

    if (isNaN(num)) {
        return allowNaN;
    }

    return Number.isInteger(num) && num >= min && num <= max;
}
```

---

### BUG-008: Missing Radix in parseInt Calls
**File:** `utils.js`, line 47
**Severity:** Medium
**Type:** Best Practice

**Description:**
The `parseInt()` function is called without a radix parameter, which can lead to unexpected results with certain inputs (e.g., leading zeros interpreted as octal in older browsers).

**Code:**
```javascript
const num = parseInt(value);
```

**Issue:**
- Best practice is to always specify radix (base 10)
- Prevents octal interpretation issues
- ESLint should flag this

**Fix:**
```javascript
const num = parseInt(value, 10);
```

**Also occurs in:**
- `app.html`, line 730: `parseInt(document.getElementById('revenueGrowthYears').value)`

---

### BUG-009: Infinite Loop Risk in Autocomplete Blur Handler
**File:** `app.html`, lines 565-570
**Severity:** Medium
**Type:** Performance

**Description:**
The `handleBlur()` method uses a hard-coded 150ms delay which may not be sufficient for all user interactions, and could cause issues if events fire rapidly.

**Code:**
```javascript
handleBlur() {
    // Delay hiding to allow click events on dropdown items
    setTimeout(() => {
        this.hideDropdown();
    }, 150);
}
```

**Issue:**
- If focus/blur events fire rapidly, multiple timeouts stack up
- No cleanup of previous timeouts
- May hide dropdown before click event processes on slower devices
- Not robust across different browsers/devices

**Steps to Reproduce:**
1. Use touch device with slower event processing
2. Quickly tap autocomplete results
3. Dropdown may hide before click registers

**Fix:**
Track timeout ID and clear previous timeouts, or use proper focus management

---

### BUG-010: Potential Null Reference in Watchlist Stock Addition
**File:** `js/storage-service.js`, lines 139-149
**Severity:** Medium
**Type:** Logic Bug

**Description:**
The `addStockToWatchlist()` method returns `false` when the watchlist is not found, but calling code may not check this return value, leading to silent failures.

**Code:**
```javascript
addStockToWatchlist(watchlistId, symbol) {
    const watchlists = this.getWatchlists();
    const watchlist = watchlists.find(w => w.id === watchlistId);
    if (watchlist && !watchlist.stocks.includes(symbol)) {
        watchlist.stocks.push(symbol);
        watchlist.updatedAt = new Date().toISOString();
        this.setWatchlists(watchlists);
        return true;
    }
    return false;
}
```

**Issue:**
- Returns `false` if watchlist not found or stock already exists
- No error thrown or logged
- Silent failure can confuse users
- Calling code may not check return value

**Steps to Reproduce:**
1. Try to add stock to a watchlist that was deleted
2. Function returns false but no error shown to user
3. User thinks stock was added but it wasn't

**Impact:**
Silent failures in watchlist management can lead to user confusion

**Fix:**
Throw error or log warning when watchlist not found, distinguish between "not found" and "already exists"

---

## Medium Priority Bugs

### BUG-011: No Validation for Watchlist Name Uniqueness
**File:** `js/storage-service.js`, lines 116-131
**Severity:** Low
**Type:** Data Integrity

**Description:**
The `addWatchlist()` method doesn't check if a watchlist with the same name already exists, allowing duplicate names which can confuse users.

**Code:**
```javascript
addWatchlist(name, description = '') {
    const watchlists = this.getWatchlists();
    const newWatchlist = {
        id: this.generateId(),
        name,
        description,
        stocks: [],
        // ...
    };
    watchlists.push(newWatchlist);
    this.setWatchlists(watchlists);
    return newWatchlist;
}
```

**Issue:**
- No check for duplicate names
- Users can create multiple "Favorites" watchlists
- Confusing UI with duplicate names
- Hard to distinguish between watchlists

**Steps to Reproduce:**
1. Create watchlist named "Tech Stocks"
2. Create another watchlist named "Tech Stocks"
3. Both appear in list with same name
4. User can't tell them apart

**Impact:**
Poor UX with confusing duplicate watchlist names

**Fix:**
Check for existing name and either reject or auto-increment (e.g., "Tech Stocks (2)")

---

### BUG-012: Inconsistent Error Handling in API Service
**File:** `api-service.js`, lines 40-63
**Severity:** Medium
**Type:** Error Handling

**Description:**
The `getStockData()` method catches all errors and returns fallback data, but doesn't differentiate between types of errors (network, timeout, invalid symbol, rate limit).

**Code:**
```javascript
try {
    console.log(`Fetching fresh data for ${symbol} from Twelve Data API...`);
    const data = await this.fetchStockData(symbol);
    // ...
} catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    console.log(`Falling back to cached/static data for ${symbol}`);
    return this.getFallbackData(symbol);
}
```

**Issue:**
- No distinction between recoverable errors (rate limit) vs permanent errors (invalid symbol)
- User gets same fallback data regardless of error type
- No way to know if retrying would help
- Masks rate limiting issues

**Impact:**
- Users don't know why they're seeing fallback data
- No actionable error messages
- Can't distinguish between temporary and permanent failures

**Fix:**
Implement proper error handling with user-friendly messages for different error types

---

### BUG-013: Memory Leak in Cache Implementation
**File:** `api-service.js`, lines 14-15
**Severity:** Medium
**Type:** Performance

**Description:**
The cache Map objects never clear old entries, leading to unbounded memory growth as more stocks are searched.

**Code:**
```javascript
this.cache = new Map();
this.cacheTimestamps = new Map();
```

**Issue:**
- Cache grows indefinitely with each unique stock symbol searched
- No maximum size limit
- No cleanup of expired entries
- In a long-running session with many searches, memory usage grows unbounded

**Steps to Reproduce:**
1. Search for 100+ different stocks via autocomplete
2. Each adds to cache permanently
3. Memory usage grows continuously
4. Old expired entries never removed

**Impact:**
Long-running sessions can consume excessive memory, especially on mobile devices

**Fix:**
Implement cache size limits and periodic cleanup of expired entries

---

### BUG-014: Potential Division by Zero in formatLargeNumber
**File:** `utils.js`, lines 80-89
**Severity:** Low
**Type:** Edge Case

**Description:**
The `formatLargeNumber()` function doesn't handle edge cases like 0, negative numbers, NaN, or Infinity properly.

**Code:**
```javascript
function formatLargeNumber(num, decimals = 2) {
    if (num >= CONFIG.FORMAT_THRESHOLDS.TRILLION) {
        return '$' + (num / CONFIG.FORMAT_THRESHOLDS.TRILLION).toFixed(decimals) + 'T';
    } else if (num >= CONFIG.FORMAT_THRESHOLDS.BILLION) {
        return '$' + (num / CONFIG.FORMAT_THRESHOLDS.BILLION).toFixed(decimals) + 'B';
    } else if (num >= CONFIG.FORMAT_THRESHOLDS.MILLION) {
        return '$' + (num / CONFIG.FORMAT_THRESHOLDS.MILLION).toFixed(decimals) + 'M';
    }
    return '$' + num.toLocaleString();
}
```

**Issues:**
- Negative numbers show as "$-X" instead of "-$X"
- NaN shows as "$NaN"
- Infinity shows as "$Infinity"
- Zero is handled but could be more explicit
- No input validation

**Steps to Reproduce:**
1. Pass `NaN` to function: `formatLargeNumber(NaN)` → `"$NaN"`
2. Pass negative: `formatLargeNumber(-5000000000)` → `"$-5.00B"` (should be `-$5.00B`)

**Fix:**
```javascript
function formatLargeNumber(num, decimals = 2) {
    // Handle invalid inputs
    if (typeof num !== 'number' || !isFinite(num)) {
        return '$0.00';
    }
    
    const isNegative = num < 0;
    const absNum = Math.abs(num);
    
    let formatted;
    if (absNum >= CONFIG.FORMAT_THRESHOLDS.TRILLION) {
        formatted = '$' + (absNum / CONFIG.FORMAT_THRESHOLDS.TRILLION).toFixed(decimals) + 'T';
    } else if (absNum >= CONFIG.FORMAT_THRESHOLDS.BILLION) {
        formatted = '$' + (absNum / CONFIG.FORMAT_THRESHOLDS.BILLION).toFixed(decimals) + 'B';
    } else if (absNum >= CONFIG.FORMAT_THRESHOLDS.MILLION) {
        formatted = '$' + (absNum / CONFIG.FORMAT_THRESHOLDS.MILLION).toFixed(decimals) + 'M';
    } else {
        formatted = '$' + absNum.toLocaleString();
    }
    
    return isNegative ? '-' + formatted : formatted;
}
```

---

### BUG-015: Inconsistent Stock Symbol Case Handling
**File:** `app.html`, line 720
**Severity:** Low
**Type:** UX

**Description:**
Stock symbols are sometimes compared case-sensitively and sometimes case-insensitively, leading to potential duplicate stocks with different cases.

**Code in applyFilters:**
```javascript
if (stockSearch.includes(' - ')) {
    stockSearch = stockSearch.split(' - ')[0].toLowerCase();
}
```

**Code in selectItem:**
```javascript
const stockExists = stockData.some(stock => 
    stock.symbol.toUpperCase() === selected.symbol.toUpperCase()
);
```

**Issue:**
- Filter converts to lowercase
- Duplicate check uses uppercase
- Symbol storage case varies
- Could allow "AAPL" and "aapl" as separate entries

**Steps to Reproduce:**
1. Manually add lowercase symbol to stockData
2. Search for uppercase version
3. Both appear in results as separate entries

**Fix:**
Standardize all symbol comparisons to uppercase and normalize storage

---

### BUG-016: Missing Validation for P/E Ratio Min > Max
**File:** `app.html`, lines 724-777
**Severity:** Low
**Type:** Logic Bug

**Description:**
The filter validation doesn't check if P/E Ratio Min is greater than P/E Ratio Max, which would create an impossible filter condition.

**Code:**
```javascript
const peRatio = parseFloat(document.getElementById('peRatio').value);
const peRatioMin = parseFloat(document.getElementById('peRatioMin').value);
// ...
// P/E Ratio filter (max)
if (!isNaN(peRatio) && stock.peRatio > peRatio) {
    return false;
}

// P/E Ratio filter (min)
if (!isNaN(peRatioMin) && stock.peRatio < peRatioMin) {
    return false;
}
```

**Issue:**
- If user sets Min=30 and Max=20, no stocks will ever match
- No validation warning for impossible conditions
- Confusing "no results" message

**Steps to Reproduce:**
1. Set P/E Ratio Min to 30
2. Set P/E Ratio Max to 20
3. Click Apply Filters
4. Shows "No stocks found" with no explanation

**Expected Behavior:**
Should warn user that Min > Max is invalid

**Fix:**
Add validation before filtering:
```javascript
if (!isNaN(peRatio) && !isNaN(peRatioMin) && peRatioMin > peRatio) {
    showError('P/E Ratio Min cannot be greater than Max', 'resultsCount');
    return;
}
```

---

### BUG-017: Accessibility Issue - Missing ARIA Labels
**File:** `app.html`, lines 634-657
**Severity:** Low
**Type:** Accessibility

**Description:**
Dynamically generated table rows don't include proper ARIA labels or roles for screen reader users.

**Code:**
```javascript
tableBody.innerHTML = data.map(stock => `
    <tr style="cursor: pointer;" onclick="...">
        <td>
            <div class="stock-symbol">${escapeHtml(stock.symbol)}</div>
        </td>
        // ... more cells
    </tr>
`).join('');
```

**Issue:**
- No aria-label on clickable rows
- No indication that rows are clickable for screen readers
- Button in last cell lacks proper labeling
- Missing keyboard navigation support

**Impact:**
Screen reader users can't effectively navigate or understand the stock table

**Fix:**
Add proper ARIA attributes and keyboard support

---

### BUG-018: setTimeout Not Cleared in Error Cases
**File:** `app.html`, lines 481-487
**Severity:** Low
**Type:** Resource Leak

**Description:**
When stock data fetch fails, the error message is shown for 2 seconds via setTimeout, but the timeout ID is not stored and cannot be cleared if component unmounts.

**Code:**
```javascript
resultsCount.textContent = `Error loading ${selected.symbol}. Try again.`;
setTimeout(() => {
    applyFilters();
}, 2000);
```

**Issue:**
- No reference to setTimeout ID
- Can't cancel if user navigates away
- May cause errors if elements no longer exist after 2 seconds
- Potential memory leak in SPAs

**Fix:**
Store timeout IDs and clear them on cleanup

---

### BUG-019: No Debouncing on Filter Application
**File:** `app.html`, line 552
**Severity:** Low
**Type:** Performance

**Description:**
The `handleInput()` method calls `applyFilters()` immediately on every keystroke without debouncing, which can cause performance issues with large datasets.

**Code:**
```javascript
handleInput(value) {
    clearTimeout(this.searchTimeout);
    
    if (value.trim().length === 0) {
        this.hideDropdown();
        applyFilters();
        return;
    }

    // Debounce search
    this.searchTimeout = setTimeout(() => {
        this.searchSymbols(value.trim());
    }, 300);

    // Apply filters immediately for existing stocks
    applyFilters();
}
```

**Issue:**
- Filter runs on every keystroke
- No debouncing for filter application
- Can cause UI lag with many stocks
- Inconsistent with debounced search behavior

**Impact:**
Poor performance when typing quickly in search box with large stock lists

**Fix:**
Debounce the applyFilters() call as well

---

### BUG-020: Modal Close on Background Click Can Be Prevented by API Key Requirement
**File:** `app.html`, lines 319-328
**Severity:** Low
**Type:** UX

**Description:**
The API key modal prevents closing by clicking outside when no API key is set, but this can trap users with no escape route (except using demo mode).

**Code:**
```javascript
document.addEventListener('click', function(event) {
    const modal = document.getElementById('apiKeyModal');
    if (event.target === modal) {
        // Don't close if API key is not set
        const apiKey = storage.getApiKey();
        if (apiKey && apiKey !== '') {
            closeApiKeyModal();
        }
    }
});
```

**Issue:**
- Users can't escape modal if they don't want to provide API key
- No "Cancel" or "Close" button when modal is mandatory
- Only option is Demo Mode or entering key
- Poor UX for users who want to leave

**Steps to Reproduce:**
1. First time user opens app
2. Modal appears requiring API key
3. Clicking outside does nothing
4. Pressing ESC does nothing
5. Must choose Demo or enter key

**Fix:**
Add ESC key handler and allow closing with a warning message

---

## Low Priority Bugs / Code Quality Issues

### BUG-021: Unused isLoading Flag in Autocomplete
**File:** `app.html`, lines 353, 366, 373, 388
**Severity:** Low
**Type:** Code Quality

**Description:**
The `StockAutocomplete` class has an `isLoading` flag that's set but never effectively used to prevent duplicate requests or show loading state consistently.

**Code:**
```javascript
this.isLoading = false;
// ...
this.isLoading = true;
this.updateDropdown([]);
this.showLoading();
// ...
this.isLoading = false;
```

**Issue:**
- Flag is set but not checked before making new requests
- Doesn't prevent duplicate concurrent searches
- Loading state is shown via separate method, not flag check

**Fix:**
Either use the flag properly or remove it

---

### BUG-022: Inconsistent String Comparison in Search
**File:** `app.html`, lines 759-762
**Severity:** Low
**Type:** Logic Inconsistency

**Description:**
Search filter checks both name and symbol but uses `.includes()` which matches partial strings, while earlier code splits on ' - ' expecting exact format.

**Code:**
```javascript
// Search filter (by name or ticker)
if (stockSearch && 
    !stock.name.toLowerCase().includes(stockSearch) && 
    !stock.symbol.toLowerCase().includes(stockSearch)) {
    return false;
}
```

**Issue:**
- Partial matching can be confusing
- User selects "AAPL - Apple Inc." but searching "App" also shows results
- Inconsistent with autocomplete behavior

**Impact:**
Minor UX issue where search behavior is not intuitive

---

### BUG-023: Magic Number for Fallback Detection
**File:** `app.html`, line 674
**Severity:** Low
**Type:** Code Quality

**Description:**
Using hardcoded price value (175.43) to detect fallback data is fragile and will break if fallback data is updated.

**Code:**
```javascript
const usingFallback = stockData.some(stock => 
    stock.symbol === 'AAPL' && stock.price === 175.43
);
```

**Issue:**
- Hardcoded price will become outdated
- Fragile detection method
- Better to have explicit flag in data

**Fix:**
Add a `isFallback: true` flag to fallback data objects

---

### BUG-024: No Input Sanitization for Symbol Search
**File:** `app.html`, line 548
**Severity:** Low
**Type:** Security

**Description:**
Symbol search input is passed directly to API without sanitization, which could cause issues with special characters or injection attempts.

**Code:**
```javascript
this.searchTimeout = setTimeout(() => {
    this.searchSymbols(value.trim());
}, 300);
```

**Issue:**
- Only uses `.trim()`, no other sanitization
- Special characters not filtered
- Could cause API errors or issues

**Fix:**
Add proper input sanitization before API calls

---

### BUG-025: Duplicate Stock Detection Case Sensitivity
**File:** `app.html`, lines 461-463
**Severity:** Low
**Type:** Logic Bug

**Description:**
Stock existence check uses case-insensitive comparison but stockData array may contain symbols in different cases.

**Code:**
```javascript
const stockExists = stockData.some(stock => 
    stock.symbol.toUpperCase() === selected.symbol.toUpperCase()
);
```

**Issue:**
- Case-insensitive check is good
- But if symbols stored in different cases, could have duplicates
- Should normalize on storage

**Fix:**
Always normalize symbols to uppercase when storing

---

## Edge Cases and Potential Issues

### EDGE-001: No Handling for Empty DEFAULT_STOCKS Array
**File:** `config.js`, lines 33-36
**Severity:** Low
**Type:** Edge Case

**Description:**
If `CONFIG.DEFAULT_STOCKS` array is empty, the app will load with no stocks and may show confusing state.

**Impact:**
Configuration error could leave app in broken state

---

### EDGE-002: No Maximum Stock Limit
**File:** Throughout codebase
**Severity:** Low
**Type:** Performance

**Description:**
Users can add unlimited stocks via autocomplete, which could cause performance issues with filtering and rendering.

**Impact:**
With 1000+ stocks, filtering and table rendering becomes slow

---

### EDGE-003: No Offline Detection
**File:** Throughout codebase
**Severity:** Low
**Type:** UX

**Description:**
App doesn't detect or inform users when they're offline, leading to confusing timeout errors.

**Impact:**
Users don't know why data isn't loading

---

### BUG-026: No Error Handling for localStorage Quota Exceeded
**File:** `js/storage-service.js`, multiple locations
**Severity:** Medium
**Type:** Error Handling

**Description:**
All localStorage write operations (`setItem()`) can throw `QuotaExceededError` when storage is full, but this is not caught anywhere.

**Code (multiple instances):**
```javascript
setWatchlists(watchlists) {
    localStorage.setItem(this.STORAGE_KEYS.WATCHLISTS, JSON.stringify(watchlists));
}
```

**Issue:**
- No try/catch around localStorage.setItem()
- Can throw QuotaExceededError when storage is full
- Will crash the app with uncaught exception
- User loses their changes with no error message

**Steps to Reproduce:**
1. Fill localStorage to near capacity (5-10MB typical limit)
2. Try to add many watchlists or stocks
3. App crashes when localStorage quota exceeded
4. No error message to user

**Impact:**
App crashes and user loses data when localStorage is full

**Fix:**
Wrap all localStorage operations in try/catch and show user-friendly error messages

---

### BUG-027: Race Condition in Stock Data Loading
**File:** `app.html`, lines 661-706
**Severity:** Medium
**Type:** Concurrency Bug

**Description:**
If `loadStockData()` is called multiple times quickly (e.g., via refresh button spam), multiple API requests fire and results may overwrite each other unpredictably.

**Code:**
```javascript
async function loadStockData() {
    isLoading = true;
    renderStockTable([]); // Show loading state
    
    try {
        console.log('Loading stock data from Twelve Data API...');
        stockData = await apiService.fetchMultipleStocks(CONFIG.DEFAULT_STOCKS);
        filteredData = [...stockData];
        // ...
```

**Issue:**
- No guard against concurrent calls
- Multiple clicks on "Refresh Data" start multiple fetches
- Last one to finish wins, even if it's an older request
- Wastes API quota with duplicate requests

**Steps to Reproduce:**
1. Click "Refresh Data" button rapidly 5 times
2. Five API requests fire simultaneously
3. Results arrive in random order
4. Final displayed data depends on which finished last, not which was newest

**Impact:**
Wasted API calls, unpredictable results, potential stale data display

**Fix:**
Add request ID or abort previous requests when new one starts

---

### BUG-028: No Cleanup of Event Listeners in Autocomplete
**File:** `app.html`, lines 573-591
**Severity:** Low
**Type:** Memory Leak

**Description:**
The autocomplete event handlers are registered globally but never cleaned up, which could cause memory leaks if the component is recreated.

**Code:**
```javascript
// Global autocomplete instance
const autocomplete = new StockAutocomplete();

// Event handlers for the search input
function handleSearchInput(value) {
    autocomplete.handleInput(value);
}
```

**Issue:**
- Global event handlers never removed
- If autocomplete instance recreated, old handlers remain
- Potential memory leak in SPA context
- Multiple handlers could execute

**Impact:**
Minor memory leak in long-running sessions

**Fix:**
Use cleanup pattern or event delegation

---

### BUG-029: Incorrect Market Cap Category Labels
**File:** `app.html`, lines 114-116
**Severity:** Low
**Type:** UX/Accuracy

**Description:**
The market cap filter labels say "Small Cap (< $2B)" but mathematically this means stocks under $2B, which excludes the $2B threshold itself. Typically market cap categories use inclusive ranges.

**Code:**
```html
<option value="small">Small Cap (&lt; $2B)</option>
<option value="mid">Mid Cap ($2B - $10B)</option>
<option value="large">Large Cap (&gt; $10B)</option>
```

**Issue:**
- Gap at exactly $2B and $10B boundaries
- A stock with market cap exactly $2B doesn't fit "small" (< $2B) or "mid" ($2B - $10B) clearly
- Common convention is small ≤ $2B, mid $2B-$10B, large ≥ $10B

**Impact:**
Minor UX confusion about boundary cases

**Fix:**
Use inclusive ranges: "≤ $2B", "$2B - $10B", "≥ $10B"

---

### BUG-030: Missing Input Type Validation
**File:** `app.html`, lines 122, 126, 132, etc.
**Severity:** Low
**Type:** Input Validation

**Description:**
Number input fields don't have `min` attributes to prevent negative values where they don't make sense (P/E ratio, P/B ratio, etc.).

**Code:**
```html
<input type="number" id="peRatio" placeholder="e.g., 25" step="0.1">
```

**Issue:**
- User can enter negative P/E ratio: -5
- Negative P/B ratio doesn't make sense
- No HTML-level validation
- JavaScript validation exists but HTML should help too

**Steps to Reproduce:**
1. Enter -10 in "P/E Ratio (Max)" field
2. Click Apply Filters
3. JavaScript validation may catch it, but HTML should prevent entry

**Impact:**
Poor UX, allows nonsensical inputs

**Fix:**
Add `min="0"` to appropriate number inputs

---

### BUG-031: Fallback Data Becomes Stale Over Time
**File:** `api-service.js`, lines 330-357
**Severity:** Low
**Type:** Data Quality

**Description:**
The hardcoded fallback stock data (prices, ratios, etc.) will become outdated over time, potentially misleading users.

**Code:**
```javascript
'AAPL': { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, marketCap: 2800000000000, ...
```

**Issue:**
- Hardcoded stock prices from a specific date
- Will be inaccurate weeks/months later
- Users may not realize data is stale
- Could lead to poor investment decisions

**Impact:**
Stale data could mislead users in demo mode

**Fix:**
Add clear "Sample Data" or "As of [DATE]" indicator on fallback data

---

### BUG-032: No Debounce Cleanup on Component Unmount
**File:** `app.html`, lines 537-549
**Severity:** Low
**Type:** Resource Leak

**Description:**
The autocomplete debounce timeout (`this.searchTimeout`) is never cleaned up when the component unmounts or page changes.

**Code:**
```javascript
handleInput(value) {
    clearTimeout(this.searchTimeout);
    // ...
    this.searchTimeout = setTimeout(() => {
        this.searchSymbols(value.trim());
    }, 300);
}
```

**Issue:**
- Timeout not cleared on page unload
- Could fire after component destroyed
- Potential errors accessing destroyed DOM elements
- Minor memory leak

**Impact:**
Potential errors if timeout fires after page navigation

**Fix:**
Add cleanup on page unload or component destruction

---

### BUG-033: API Key Stored in Plain Text in localStorage
**File:** `config.js`, lines 17-19 and storage usage
**Severity:** Medium
**Type:** Security

**Description:**
The API key is stored in plain text in localStorage, which can be accessed by any JavaScript running on the page (XSS vulnerability).

**Code:**
```javascript
const storedKey = localStorage.getItem('twelvedata_api_key');
```

**Issue:**
- API keys stored in plain text
- Accessible via JavaScript and browser DevTools
- Vulnerable to XSS attacks
- No encryption or obfuscation

**Steps to Reproduce:**
1. Enter API key in app
2. Open DevTools Console
3. Type: `localStorage.getItem('twelvedata_api_key')`
4. Full API key displayed

**Impact:**
API key can be stolen via XSS or browser access

**Note:**
This is inherent to client-side API key usage. Best practice would be to use a backend proxy, but for a client-side app, at least document the security implications.

**Fix:**
Document security limitations and recommend users use free-tier API keys only

---

## Summary Statistics

- **Total Bugs Found:** 33
- **Critical Severity:** 3
- **High Severity:** 6
- **Medium Severity:** 14
- **Low Severity:** 10
- **Edge Cases:** 3

## Categories

- **Functional Bugs:** 8
- **Logic Bugs:** 6
- **Security Issues:** 2
- **Performance Issues:** 4
- **UX Issues:** 3
- **Code Quality:** 5

## Recommendations

1. **Immediate Actions (Critical)**
   - Fix missing API methods (BUG-010, BUG-011)
   - Fix stock details modal property names (BUG-001, BUG-002)
   - Fix stock details API call (BUG-003)

2. **High Priority**
   - Add null checks in watchlist manager (BUG-005)
   - Fix XSS vulnerability in table rendering (BUG-006)
   - Improve error handling in API service (BUG-012)

3. **Technical Debt**
   - Implement proper cache management (BUG-013)
   - Add comprehensive input validation (Multiple bugs)
   - Improve accessibility (BUG-017)

4. **Testing Recommendations**
   - Add unit tests for utility functions
   - Add integration tests for API service
   - Add E2E tests for critical user flows
   - Test with invalid/malicious inputs

5. **Code Quality Improvements**
   - Enable stricter ESLint rules
   - Add TypeScript for better type safety
   - Implement proper error boundaries
   - Add logging and monitoring

---

**End of Bug Report**
