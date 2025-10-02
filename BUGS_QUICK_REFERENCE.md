# Bug Quick Reference - StockScreener

**Quick summary of all identified bugs for rapid assessment and prioritization**

---

## 🔴 Critical Priority (Fix Immediately)

| ID | Bug | File | Impact |
|---|---|---|---|
| BUG-001 | Wrong property name `companyName` vs `name` in modal | `js/stock-details.js:77` | Modal shows "N/A" instead of company name |
| BUG-002 | Missing `change` and `changePercent` properties | `js/stock-details.js:81-86` | Price change never displays |
| BUG-003 | Wrong API method call in fetchStockData | `js/stock-details.js:60` | Stock details fail to load |

---

## 🟠 High Priority (Fix Soon)

| ID | Bug | File | Impact |
|---|---|---|---|
| BUG-004 | Race condition in autocomplete search | `app.html:537-549` | Wrong search results displayed |
| BUG-005 | Missing null check in watchlist toggle | `js/watchlist-manager.js:74-97` | App crashes if watchlist deleted |
| BUG-006 | XSS vulnerability in table rendering | `app.html:635` | Security risk with malicious stock data |
| BUG-007 | validateInteger accepts floats | `utils.js:47` | Silently converts "3.14" to integer |
| BUG-012 | Inconsistent error handling in API | `api-service.js:40-63` | Can't distinguish error types |

---

## 🟡 Medium Priority (Fix When Possible)

| ID | Bug | File | Impact |
|---|---|---|---|
| BUG-008 | Missing radix in parseInt | `utils.js:47` | Potential octal interpretation |
| BUG-009 | Autocomplete blur timeout issues | `app.html:565-570` | May hide before click registers |
| BUG-010 | Silent failure in addStockToWatchlist | `js/storage-service.js:139-149` | No error when watchlist not found |
| BUG-011 | No watchlist name uniqueness check | `js/storage-service.js:116-131` | Confusing duplicate names |
| BUG-013 | Unbounded cache growth | `api-service.js:14-15` | Memory leak over time |
| BUG-026 | No localStorage quota handling | `js/storage-service.js` | Crashes when storage full |
| BUG-027 | Race condition in data loading | `app.html:661-706` | Duplicate API calls, wrong results |
| BUG-033 | API key stored in plain text | `config.js:17-19` | Security vulnerability |

---

## 🟢 Low Priority (Nice to Have)

| ID | Bug | File | Impact |
|---|---|---|---|
| BUG-014 | formatLargeNumber edge cases | `utils.js:80-89` | Shows "$NaN" or "$-5B" |
| BUG-015 | Inconsistent symbol case handling | `app.html:720` | Potential duplicates |
| BUG-016 | No validation for min > max filters | `app.html:724-777` | Confusing "no results" |
| BUG-017 | Missing ARIA labels | `app.html:634-657` | Poor accessibility |
| BUG-018 | setTimeout not cleared in errors | `app.html:481-487` | Minor resource leak |
| BUG-019 | No debounce on filter application | `app.html:552` | Performance lag when typing |
| BUG-020 | Modal can trap users | `app.html:319-328` | No escape from modal |
| BUG-021 | Unused isLoading flag | `app.html:353-388` | Dead code |
| BUG-022 | Inconsistent search comparison | `app.html:759-762` | Confusing behavior |
| BUG-023 | Magic number for fallback detection | `app.html:674` | Fragile detection |
| BUG-024 | No symbol search sanitization | `app.html:548` | Potential API errors |
| BUG-025 | Case-sensitive duplicate detection | `app.html:461-463` | Could allow duplicates |
| BUG-028 | No event listener cleanup | `app.html:573-591` | Memory leak |
| BUG-029 | Incorrect market cap labels | `app.html:114-116` | Boundary confusion |
| BUG-030 | Missing input min validation | `app.html:122+` | Allows negative values |
| BUG-031 | Stale fallback data | `api-service.js:330-357` | Misleading old prices |
| BUG-032 | No debounce cleanup | `app.html:537-549` | Minor resource leak |

---

## Edge Cases Identified

| ID | Description | Impact |
|---|---|---|
| EDGE-001 | Empty DEFAULT_STOCKS array | App loads with no data |
| EDGE-002 | No maximum stock limit | Performance issues with 1000+ stocks |
| EDGE-003 | No offline detection | Confusing timeout errors |

---

## Bug Categories

### By Type:
- **Functional Bugs:** 8
- **Logic Bugs:** 7
- **Security Issues:** 2
- **Performance Issues:** 5
- **Error Handling:** 6
- **UX Issues:** 4
- **Code Quality:** 5
- **Accessibility:** 1
- **Resource Leaks:** 3

### By Severity Distribution:
```
Critical:  ████░░░░░░ (3 bugs)  - 9%
High:      █████░░░░░ (5 bugs)  - 15%
Medium:    ████████░░ (8 bugs)  - 24%
Low:       ████████████████ (17 bugs) - 52%
```

---

## Top 5 Most Critical Fixes

1. **BUG-001**: Fix stock details modal property name (2 min fix)
2. **BUG-003**: Fix stock details API call (2 min fix)
3. **BUG-006**: Remove inline onclick with JSON.stringify (30 min fix)
4. **BUG-005**: Add null check in watchlist manager (5 min fix)
5. **BUG-004**: Fix autocomplete race condition (20 min fix)

**Total estimated time for critical fixes: ~60 minutes**

---

## Recommended Fix Order

### Phase 1: Critical Fixes (Day 1)
- BUG-001, BUG-002, BUG-003 (Stock details modal)
- BUG-006 (XSS vulnerability)
- BUG-005 (Watchlist null check)

### Phase 2: High Priority (Week 1)
- BUG-004 (Autocomplete race condition)
- BUG-007, BUG-008 (Validation improvements)
- BUG-012 (Error handling)

### Phase 3: Medium Priority (Week 2)
- BUG-013 (Cache management)
- BUG-026 (localStorage error handling)
- BUG-027 (Loading race condition)
- BUG-033 (Security documentation)

### Phase 4: Low Priority (As time permits)
- Address remaining low-priority bugs
- Fix edge cases
- Code quality improvements

---

## Testing Priority

### Must Test:
1. Stock details modal display
2. Watchlist add/remove operations
3. Autocomplete search functionality
4. Filter application with edge cases
5. localStorage quota handling

### Should Test:
1. Rapid clicking/typing scenarios
2. Offline behavior
3. Large datasets (100+ stocks)
4. XSS attack vectors
5. Accessibility with screen readers

### Nice to Test:
1. Long-running sessions
2. Browser compatibility
3. Mobile device performance
4. Multiple tabs open
5. localStorage full scenarios

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Total Bugs Documented:** 33
