# Bug Fix Action Plan - StockScreener Project

**Created:** 2024  
**Status:** DRAFT - Awaiting Review  
**Total Bugs to Fix:** 33 bugs identified  
**Estimated Total Time:** 21+ hours  

---

## 📋 Overview

This action plan outlines a systematic approach to fixing all 33 identified bugs in the StockScreener project. The plan is organized by priority, with clear dependencies and validation steps for each phase.

---

## 🎯 Execution Strategy

### Principles:
1. **Fix Critical bugs first** - Address breaking issues immediately
2. **Incremental implementation** - Test after each fix
3. **Dependency awareness** - Group related fixes together
4. **Validation at each step** - Run linter and manual tests
5. **Adaptive planning** - Update plan if dependencies discovered

### Validation Process for Each Fix:
- [ ] Run ESLint to check for syntax errors
- [ ] Manually test the affected feature
- [ ] Verify no new bugs introduced
- [ ] Commit with descriptive message
- [ ] Document any plan adjustments needed

---

## Phase 1: Critical Bugs (Week 1 - Day 1)
**Estimated Time:** 3 hours  
**Goal:** Fix bugs that break core functionality  
**Status:** 🔴 Not Started

### Step 1.1: Fix Stock Details Modal Property Names (BUG-001)
**File:** `js/stock-details.js:77`  
**Time:** 2 minutes  
**Priority:** CRITICAL  

**Issue:** Modal shows "N/A" for all company names due to property mismatch

**Change:**
```javascript
// Line 77 - BEFORE:
<span class="stock-name-large">${stockData.companyName || 'N/A'}</span>

// AFTER:
<span class="stock-name-large">${stockData.name || 'N/A'}</span>
```

**Validation:**
- [ ] Run linter
- [ ] Click on stock row to open modal
- [ ] Verify company name displays correctly
- [ ] Test with multiple stocks

**Dependencies:** None

---

### Step 1.2: Fix Stock Details API Call (BUG-003)
**File:** `js/stock-details.js:60`  
**Time:** 2 minutes  
**Priority:** CRITICAL  

**Issue:** Stock details fail to load due to incorrect method call

**Change:**
```javascript
// Line 60 - BEFORE:
return this.apiService ? await this.apiService.fetchStockData([symbol]).then(data => data[0]) : null;

// AFTER:
return this.apiService ? await this.apiService.getStockData(symbol) : null;
```

**Validation:**
- [ ] Run linter
- [ ] Click stock row when data not pre-loaded
- [ ] Verify loading indicator appears
- [ ] Verify stock details load correctly

**Dependencies:** Depends on Step 1.1 (same file)

---

### Step 1.3: Add Missing Price Change Properties (BUG-002)
**File:** `js/stock-details.js:81-86`  
**Time:** 30 minutes  
**Priority:** CRITICAL  

**Issue:** Price change data never displays in modal

**Option A: Extract from API Response**
Update `api-service.js` formatStockData() to include:
```javascript
change: parseFloat(quote?.change || 0),
changePercent: parseFloat(quote?.percent_change || 0)
```

**Option B: Calculate from Previous Close**
Add calculation in formatStockData():
```javascript
const previousClose = parseFloat(quote?.previous_close || quote?.price || 0);
const change = price - previousClose;
const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
```

**Option C: Remove Display Code**
If data unavailable, remove the display logic entirely from lines 81-86

**Validation:**
- [ ] Run linter
- [ ] Check API response for available fields
- [ ] Verify change displays (or confirm removal)
- [ ] Test with multiple stocks

**Dependencies:** Depends on Steps 1.1 and 1.2 (same file)

**Decision Required:** Need to check API response format to determine best approach

---

### Step 1.4: Fix XSS Vulnerability in Table Rendering (BUG-006)
**File:** `app.html:635`  
**Time:** 30 minutes  
**Priority:** CRITICAL (Security)  

**Issue:** XSS vulnerability with inline onclick handlers

**Change:** Replace inline event handlers with event delegation

**Implementation:**
1. Remove inline onclick from table row (line 635)
2. Add event listener in JavaScript section
3. Update watchlist button click handler
4. Test with various stock data

**Code Changes:**
```javascript
// Remove inline onclick from line 635
<tr data-symbol="${stock.symbol}" class="stock-row">

// Add event delegation
document.getElementById('stockTableBody').addEventListener('click', (e) => {
    const row = e.target.closest('.stock-row');
    if (row && !e.target.closest('.watchlist-btn')) {
        const symbol = row.dataset.symbol;
        const stockData = stockData.find(s => s.symbol === symbol);
        stockDetailsView.showStockDetails(symbol, stockData);
    }
});
```

**Validation:**
- [ ] Run linter
- [ ] Test clicking stock rows
- [ ] Test clicking watchlist button (should not open details)
- [ ] Test with special characters in stock names
- [ ] Verify no XSS possible

**Dependencies:** None, but affects user interaction flow

---

### Step 1.5: Add Null Check in Watchlist Manager (BUG-005)
**File:** `js/watchlist-manager.js:74`  
**Time:** 5 minutes  
**Priority:** HIGH  

**Issue:** App crashes when watchlist is null/undefined

**Change:**
```javascript
// Line 74 - Add null check
toggleStockInWatchlist(watchlistId, symbol, stockName, button) {
    const watchlist = this.storage.getWatchlist(watchlistId);
    
    // ADD THIS:
    if (!watchlist) {
        this.showToast('Watchlist not found. Please refresh the page.', 'error');
        return;
    }
    
    if (watchlist.stocks.includes(symbol)) {
        // ... rest of code
    }
}
```

**Validation:**
- [ ] Run linter
- [ ] Clear localStorage and try adding to watchlist
- [ ] Verify error message shows
- [ ] Verify app doesn't crash

**Dependencies:** None

---

## Phase 2: High Priority Bugs (Week 1 - Days 2-3)
**Estimated Time:** 6 hours  
**Goal:** Improve stability and fix validation issues  
**Status:** 🟡 Not Started

### Step 2.1: Fix Autocomplete Race Condition (BUG-004)
**File:** `app.html:537-549`  
**Time:** 1 hour  
**Priority:** HIGH  

**Issue:** Multiple searches can return in wrong order

**Implementation:**
1. Add request ID tracking
2. Cancel previous requests using AbortController
3. Only display results if they match current query

**Code:**
```javascript
class StockAutocomplete {
    constructor() {
        // ... existing code
        this.currentRequestId = 0;
        this.abortController = null;
    }

    async searchSymbols(query) {
        // Cancel previous request
        if (this.abortController) {
            this.abortController.abort();
        }
        
        this.abortController = new AbortController();
        const requestId = ++this.currentRequestId;
        
        try {
            const results = await this.apiService.searchSymbols(query, this.abortController.signal);
            
            // Only update if this is still the latest request
            if (requestId === this.currentRequestId) {
                this.searchResults = results;
                this.updateDropdown(results);
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Search error:', error);
            }
        }
    }
}
```

**Validation:**
- [ ] Run linter
- [ ] Type quickly in search box
- [ ] Verify results match current query
- [ ] Test on slow connection

**Dependencies:** May require updates to api-service.js to accept signal

---

### Step 2.2: Fix validateInteger Function (BUG-007)
**File:** `utils.js:44-54`  
**Time:** 15 minutes  
**Priority:** HIGH  

**Issue:** Accepts "3.14" as valid integer

**Change:**
```javascript
function validateInteger(value, options = {}) {
    const { min = -Infinity, max = Infinity, allowNaN = true } = options;

    // Check if string contains decimal point
    if (typeof value === 'string' && value.includes('.')) {
        return false;
    }

    const num = parseInt(value, 10); // Also add radix (BUG-008)

    if (isNaN(num)) {
        return allowNaN;
    }

    return Number.isInteger(num) && num >= min && num <= max;
}
```

**Validation:**
- [ ] Run linter
- [ ] Test validateInteger("3.14") === false
- [ ] Test validateInteger("3") === true
- [ ] Test with Revenue Growth Years field

**Dependencies:** None

---

### Step 2.3: Add Missing Radix to parseInt (BUG-008)
**File:** `utils.js:47` and `app.html:730`  
**Time:** 10 minutes  
**Priority:** MEDIUM (bundled with 2.2)  

**Issue:** Missing radix parameter in parseInt calls

**Changes:**
```javascript
// utils.js line 47
const num = parseInt(value, 10);

// app.html line 730
const revenueGrowthYears = parseInt(document.getElementById('revenueGrowthYears').value, 10);
```

**Validation:**
- [ ] Run linter
- [ ] Test with various inputs
- [ ] Verify no octal interpretation

**Dependencies:** Combined with Step 2.2

---

### Step 2.4: Improve API Error Handling (BUG-012)
**File:** `api-service.js:40-63`  
**Time:** 2 hours  
**Priority:** HIGH  

**Issue:** Can't distinguish between different error types

**Implementation:**
1. Add specific error messages for different cases
2. Return error info instead of just fallback
3. Update UI to show appropriate messages

**Code:**
```javascript
async getStockData(symbol) {
    if (this.apiKey === 'demo') {
        return this.getFallbackData(symbol);
    }

    if (this.isCacheValid(symbol)) {
        return this.cache.get(symbol);
    }

    try {
        const data = await this.fetchStockData(symbol);
        this.cache.set(symbol, data);
        this.cacheTimestamps.set(symbol, Date.now());
        return data;
    } catch (error) {
        // Distinguish error types
        if (error instanceof APIError) {
            if (error.statusCode === 429) {
                console.warn(`Rate limit exceeded for ${symbol}`);
                // Use cache if available, even if expired
                if (this.cache.has(symbol)) {
                    console.log(`Using stale cache for ${symbol}`);
                    return this.cache.get(symbol);
                }
            } else if (error.statusCode === 404) {
                console.warn(`Symbol ${symbol} not found`);
            }
        }
        
        return this.getFallbackData(symbol);
    }
}
```

**Validation:**
- [ ] Run linter
- [ ] Test with rate limit
- [ ] Test with invalid symbol
- [ ] Test with network error
- [ ] Verify appropriate messages shown

**Dependencies:** Requires error classes from errors.js

---

## Phase 3: Medium Priority Bugs (Week 2)
**Estimated Time:** 12 hours  
**Goal:** Fix memory leaks, race conditions, and storage issues  
**Status:** 🟢 Not Started

### Step 3.1: Fix Unbounded Cache Growth (BUG-013)
**File:** `api-service.js:14-15`  
**Time:** 2 hours  
**Priority:** MEDIUM  

**Issue:** Cache never clears old entries

**Implementation:**
```javascript
class TwelveDataService {
    constructor() {
        this.apiKey = CONFIG.TWELVE_DATA_API_KEY;
        this.baseUrl = CONFIG.TWELVE_DATA_BASE_URL;
        this.cache = new Map();
        this.cacheTimestamps = new Map();
        this.MAX_CACHE_SIZE = 100; // Add limit
    }

    // Add cache cleanup method
    cleanupCache() {
        if (this.cache.size > this.MAX_CACHE_SIZE) {
            // Remove oldest 20 entries
            const sortedByTime = Array.from(this.cacheTimestamps.entries())
                .sort((a, b) => a[1] - b[1])
                .slice(0, 20);
            
            sortedByTime.forEach(([symbol]) => {
                this.cache.delete(symbol);
                this.cacheTimestamps.delete(symbol);
            });
        }
    }

    // Call in getStockData after setting cache
    async getStockData(symbol) {
        // ... existing code
        this.cache.set(symbol, data);
        this.cacheTimestamps.set(symbol, Date.now());
        this.cleanupCache(); // ADD THIS
        return data;
    }
}
```

**Validation:**
- [ ] Run linter
- [ ] Search for 150+ stocks
- [ ] Verify cache doesn't exceed limit
- [ ] Check memory usage

**Dependencies:** None

---

### Step 3.2: Add localStorage Quota Error Handling (BUG-026)
**File:** `js/storage-service.js` (multiple methods)  
**Time:** 2 hours  
**Priority:** MEDIUM  

**Issue:** No error handling when storage is full

**Implementation:**
Wrap all localStorage.setItem calls in try/catch:

```javascript
setWatchlists(watchlists) {
    try {
        localStorage.setItem(this.STORAGE_KEYS.WATCHLISTS, JSON.stringify(watchlists));
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            console.error('localStorage quota exceeded');
            // Show user-friendly error
            if (typeof showError === 'function') {
                showError('Storage quota exceeded. Please clear some watchlists.', 'resultsCount');
            }
        } else {
            throw error;
        }
    }
}
```

**Apply to methods:**
- setWatchlists()
- setPreferences()
- setApiKey()
- setUserMode()

**Validation:**
- [ ] Run linter
- [ ] Mock quota exceeded error
- [ ] Verify error message displays
- [ ] App doesn't crash

**Dependencies:** None

---

### Step 3.3: Fix Data Loading Race Condition (BUG-027)
**File:** `app.html:661-706`  
**Time:** 1 hour  
**Priority:** MEDIUM  

**Issue:** Multiple refresh clicks cause duplicate requests

**Implementation:**
```javascript
let loadingInProgress = false;

async function loadStockData() {
    if (loadingInProgress) {
        console.log('Load already in progress, skipping...');
        return;
    }
    
    loadingInProgress = true;
    isLoading = true;
    renderStockTable([]);
    
    try {
        // ... existing loading code
    } finally {
        isLoading = false;
        loadingInProgress = false;
        renderStockTable(filteredData);
    }
}
```

**Validation:**
- [ ] Run linter
- [ ] Click Refresh rapidly multiple times
- [ ] Verify only one request fires
- [ ] Check network tab for duplicate requests

**Dependencies:** None

---

### Step 3.4: Document API Key Security (BUG-033)
**File:** `README.md` and `config.js`  
**Time:** 30 minutes  
**Priority:** MEDIUM (Documentation)  

**Issue:** API keys in plain text (inherent to client-side)

**Implementation:**
Add security notice to README.md and config.js

**Content:**
```markdown
## Security Notice

**API Key Storage:** This is a client-side application that stores API keys in localStorage. 
While we use the browser's localStorage, this data is accessible to any JavaScript running 
on the page and visible in browser DevTools.

**Recommendations:**
- Use only free-tier API keys with this application
- Do not use production or paid API keys
- Understand that client-side storage is inherently less secure
- For production use, consider implementing a backend proxy

**Best Practice:** The most secure approach would be to use a backend server that stores 
the API key securely and proxies requests. This client-side implementation is designed 
for personal use and development purposes.
```

**Validation:**
- [ ] Add to README.md
- [ ] Add comment in config.js
- [ ] Review with user

**Dependencies:** None

---

### Step 3.5: Add Silent Failure Logging (BUG-010)
**File:** `js/storage-service.js:139-149`  
**Time:** 30 minutes  
**Priority:** MEDIUM  

**Issue:** Silent failures when watchlist not found

**Change:**
```javascript
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
```

**Validation:**
- [ ] Run linter
- [ ] Try adding to non-existent watchlist
- [ ] Check console for error message
- [ ] Verify calling code handles response

**Dependencies:** May need to update watchlist-manager.js

---

### Step 3.6: Add Watchlist Name Uniqueness Check (BUG-011)
**File:** `js/storage-service.js:116-131`  
**Time:** 30 minutes  
**Priority:** MEDIUM  

**Issue:** Can create duplicate watchlist names

**Change:**
```javascript
addWatchlist(name, description = '') {
    const watchlists = this.getWatchlists();
    
    // Check for duplicate name
    const existingNames = watchlists.map(w => w.name.toLowerCase());
    let finalName = name;
    let counter = 1;
    
    while (existingNames.includes(finalName.toLowerCase())) {
        finalName = `${name} (${++counter})`;
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
```

**Validation:**
- [ ] Run linter
- [ ] Create watchlist "Test"
- [ ] Create another "Test"
- [ ] Verify second is "Test (2)"

**Dependencies:** None

---

### Step 3.7: Fix Autocomplete Blur Timeout (BUG-009)
**File:** `app.html:565-570`  
**Time:** 30 minutes  
**Priority:** MEDIUM  

**Issue:** Dropdown may hide before click registers

**Change:**
```javascript
class StockAutocomplete {
    constructor() {
        // ... existing
        this.blurTimeout = null;
    }

    handleBlur() {
        // Clear previous timeout
        if (this.blurTimeout) {
            clearTimeout(this.blurTimeout);
        }
        
        // Delay hiding to allow click events on dropdown items
        this.blurTimeout = setTimeout(() => {
            this.hideDropdown();
        }, 200); // Increased from 150ms
    }
    
    // Clear timeout when item selected
    selectItem(index) {
        if (this.blurTimeout) {
            clearTimeout(this.blurTimeout);
        }
        // ... rest of code
    }
}
```

**Validation:**
- [ ] Run linter
- [ ] Test on touch device if possible
- [ ] Verify dropdown stays visible for clicks
- [ ] Test rapid focus/blur

**Dependencies:** None

---

## Phase 4: Low Priority Bugs (Weeks 3-4)
**Estimated Time:** Variable  
**Goal:** Polish and edge case handling  
**Status:** 🟢 Not Started

### Step 4.1: Fix formatLargeNumber Edge Cases (BUG-014)
**File:** `utils.js:80-89`  
**Time:** 30 minutes  

**Changes:**
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

**Validation:**
- [ ] Test with NaN, Infinity, negative numbers
- [ ] Verify proper formatting

---

### Step 4.2: Add Min/Max Filter Validation (BUG-016)
**File:** `app.html:714-756`  
**Time:** 20 minutes  

**Change:**
```javascript
function applyFilters() {
    // ... existing code
    
    const peRatio = parseFloat(document.getElementById('peRatio').value);
    const peRatioMin = parseFloat(document.getElementById('peRatioMin').value);
    
    // Validate min/max relationship
    if (!isNaN(peRatio) && !isNaN(peRatioMin) && peRatioMin > peRatio) {
        showError('P/E Ratio Min cannot be greater than Max', 'resultsCount');
        return;
    }
    
    // ... rest of filtering
}
```

---

### Step 4.3: Add Input Min Attributes (BUG-030)
**File:** `app.html:122, 126, 132, etc.`  
**Time:** 10 minutes  

**Change:**
Add `min="0"` to number inputs where negative values don't make sense:
```html
<input type="number" id="peRatio" placeholder="e.g., 25" step="0.1" min="0">
<input type="number" id="pbRatio" placeholder="e.g., 3" step="0.1" min="0">
```

---

### Step 4.4: Improve Market Cap Labels (BUG-029)
**File:** `app.html:114-116`  
**Time:** 5 minutes  

**Change:**
```html
<option value="small">Small Cap (≤ $2B)</option>
<option value="mid">Mid Cap ($2B - $10B)</option>
<option value="large">Large Cap (≥ $10B)</option>
```

---

### Step 4.5: Add Fallback Data Timestamp (BUG-031)
**File:** `api-service.js` and `app.html`  
**Time:** 30 minutes  

**Implementation:**
1. Add date to fallback data
2. Display "Sample data as of [DATE]" when using fallback
3. Update fallback detection

---

### Step 4.6-4.17: Additional Low Priority Fixes
(Detailed plans for remaining low-priority bugs)

- BUG-015: Symbol case normalization
- BUG-017: ARIA labels
- BUG-018: Timeout cleanup
- BUG-019: Filter debouncing
- BUG-020: Modal escape handling
- BUG-021: Remove unused isLoading
- BUG-022: Consistent search
- BUG-023: Remove magic number
- BUG-024: Symbol sanitization
- BUG-025: Duplicate prevention
- BUG-028: Event listener cleanup
- BUG-032: Debounce cleanup

---

## 📊 Progress Tracking

### Overall Status:
- [ ] Phase 1: Critical Bugs (0/5 complete)
- [ ] Phase 2: High Priority (0/4 complete)
- [ ] Phase 3: Medium Priority (0/7 complete)
- [ ] Phase 4: Low Priority (0/17 complete)

### Time Tracking:
- **Estimated Total:** 21+ hours
- **Spent:** 0 hours
- **Remaining:** 21+ hours

---

## 🔄 Plan Adaptations Log

*This section will document any changes made to the plan during implementation*

**No adaptations yet - plan is in draft state**

---

## ⚠️ Known Risks and Dependencies

### Risks:
1. **API Response Format Unknown** - May affect BUG-002 fix approach
2. **Breaking Changes** - XSS fix may affect existing event handling
3. **Browser Compatibility** - AbortController may need polyfill

### Dependencies:
1. BUG-001, BUG-002, BUG-003 all in same file - fix together
2. BUG-007 and BUG-008 both affect parseInt - combine
3. BUG-026 may affect multiple storage methods

---

## 📝 Next Steps

1. **Review this plan** with @TzoharLary
2. **Address any feedback** or questions
3. **Begin Phase 1** implementation
4. **Update plan** as issues discovered
5. **Report progress** after each phase

---

## 🤔 Questions for Review

1. **BUG-002 (Price Change):** Should I try to extract from API, calculate it, or remove the display code? Need to check actual API response format first.

2. **BUG-006 (XSS):** The event delegation approach will change how clicks work. Is this acceptable? Alternative is to better sanitize the data.

3. **Priority Adjustments:** Should any bugs be elevated or deprioritized based on current project needs?

4. **Testing Strategy:** Should I add automated tests while fixing, or keep minimal changes as per instructions?

5. **Documentation Updates:** Should I update the bug documentation files as bugs are fixed?

---

**Status:** 📋 READY FOR REVIEW  
**Awaiting approval to begin implementation**
