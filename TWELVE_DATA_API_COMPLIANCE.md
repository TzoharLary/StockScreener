# Twelve Data API Compliance and Usage Guide

This document details how StockScreener uses the Twelve Data API in compliance with their terms of service and best practices.

## API Documentation

Official Twelve Data API documentation: https://twelvedata.com/docs

## Endpoints Used

All endpoints used are available in the free tier:

### 1. Quote Endpoint (`/quote`)
- **Purpose**: Get real-time stock price and basic quote data
- **URL**: `https://api.twelvedata.com/quote?symbol={symbol}&apikey={apikey}`
- **Response Fields Used**: `close`, `price`, `regularMarketPrice`, `last_price`, `name`
- **Rate**: 1 API call per request
- **Free Tier**: ✅ Available

### 2. Statistics Endpoint (`/statistics`)
- **Purpose**: Get fundamental statistics and valuation metrics
- **URL**: `https://api.twelvedata.com/statistics?symbol={symbol}&apikey={apikey}`
- **Response Fields Used**: 
  - Valuation metrics: `pe_ratio`, `pb_ratio`
  - Balance sheet: `debt_to_equity`
  - Income statement: `roe`, `revenue_growth`
  - Market data: `market_cap`, `shares_outstanding`
- **Rate**: 1 API call per request
- **Free Tier**: ✅ Available

### 3. Profile Endpoint (`/profile`)
- **Purpose**: Get company profile and sector information
- **URL**: `https://api.twelvedata.com/profile?symbol={symbol}&apikey={apikey}`
- **Response Fields Used**: `name`, `longName`, `sector`, `industry`, `shares_outstanding`, `market_cap`
- **Rate**: 1 API call per request
- **Free Tier**: ✅ Available

### 4. Symbol Search Endpoint (`/symbol_search`)
- **Purpose**: Search for stock symbols (autocomplete functionality)
- **URL**: `https://api.twelvedata.com/symbol_search?symbol={query}&apikey={apikey}`
- **Response Fields Used**: `symbol`, `instrument_name`, `exchange`, `instrument_type`
- **Rate**: 1 API call per request
- **Free Tier**: ✅ Available

## API Key Authentication

### Method
API key is passed as a URL query parameter: `?apikey={your_api_key}`

### Storage Priority
The application checks for API keys in the following order:
1. **localStorage** (browser) - User-provided via UI
2. **Environment variable** (`TWELVE_DATA_API_KEY`) - For Node.js environments
3. **Demo mode** - Fallback using static data

### Security
- API keys are stored locally in the user's browser (localStorage)
- Never committed to version control
- Masked in UI display (shows only last 4 characters)

## Rate Limits

### Free Tier Limits
- **Per Minute**: 8 API calls
- **Per Day**: 800 API calls

### Application Usage
Each stock lookup uses **3 API calls** in parallel:
1. `/quote` - 1 call
2. `/statistics` - 1 call
3. `/profile` - 1 call

**Result**: With 8 calls/minute limit, you can fetch ~2-3 stocks per minute.

### Rate Limit Handling
When rate limits are exceeded (HTTP 429), the application:
1. Logs a clear error message
2. Falls back to cached data (if available)
3. Falls back to static fallback data (if no cache)
4. Displays user-friendly error: "Rate limit exceeded. Free tier allows 8 calls/min, 800 calls/day."

### Optimization Strategies
- **Caching**: 5-minute cache duration reduces redundant API calls
- **Demo Mode**: No API calls, uses static data
- **Fallback Data**: Prevents API calls when data is already available

## Compliance Requirements

### Attribution (Required for Free Tier)
✅ **Implemented**: The UI displays "Data powered by Twelve Data API"
- Location: Below the stock table in `app.html`
- Always visible when using the API

### HTTPS Requirement
✅ **Implemented**: Base URL uses HTTPS
- `TWELVE_DATA_BASE_URL: 'https://api.twelvedata.com'`

### User-Agent Header
✅ **Implemented**: Descriptive User-Agent with project URL
- `User-Agent: StockScreener/1.0 (https://github.com/TzoharLary/StockScreener)`

### Error Handling
✅ **Implemented**: Specific handling for Twelve Data error codes
- **401**: Invalid API key
- **429**: Rate limit exceeded
- **404**: Symbol not found or endpoint unavailable
- **400**: Bad request

## Best Practices Implemented

### 1. Caching Strategy
- Duration: 5 minutes (`CACHE_DURATION: 300000` ms)
- Reduces API calls by reusing recent data
- Cleared when user manually refreshes

### 2. Graceful Degradation
- Falls back to cached data on API errors
- Falls back to static data if no cache available
- Never shows broken state to users

### 3. Parallel Requests
- Uses `Promise.all()` to fetch quote, statistics, and profile simultaneously
- Reduces total request time from ~3 seconds to ~1 second
- Note: Still counts as 3 separate API calls

### 4. Comprehensive Logging
- Logs all API requests and responses
- Logs rate limit warnings
- Logs when fallback data is used
- Helps debug API issues

### 5. Request Timeout
- 10-second timeout for all API requests
- Prevents hanging on slow/unresponsive API
- Controlled by `REQUEST_TIMEOUT: 10000` ms

## Known Limitations

### Free Tier Restrictions
1. **Rate Limits**: 8 calls/min may be restrictive for bulk operations
2. **Daily Limit**: 800 calls/day limits to ~266 stock fetches per day
3. **Data Delay**: Free tier may have delayed data (not real-time)
4. **Symbol Coverage**: Not all symbols may be available

### Endpoint Availability
Some advanced endpoints are not available in free tier:
- Time series historical data (limited)
- Options data
- Technical indicators
- Advanced fundamentals

## Troubleshooting

### Common Issues

#### "Invalid API key" (401 Error)
- Verify API key is correct
- Check that key is active at https://twelvedata.com/
- Ensure key is properly stored in localStorage

#### "Rate limit exceeded" (429 Error)
- Wait 1 minute before making more requests
- Use caching to reduce API calls
- Consider upgrading to paid tier

#### "Symbol not found" (404 Error)
- Verify symbol is correct (e.g., "AAPL" not "Apple")
- Some international symbols may not be available
- Try using the symbol search endpoint first

#### All Values Show as Zero
- May indicate API response format mismatch
- Application automatically falls back to static data
- Check browser console for detailed API responses

## Upgrading to Paid Tier

If you need more API calls or advanced features:
1. Visit https://twelvedata.com/pricing
2. Choose a plan that fits your needs
3. Update your API key in the application settings
4. Higher tiers provide:
   - More API calls per minute/day
   - Real-time data
   - Advanced endpoints
   - WebSocket support
   - Historical data

## Contact

For API issues or questions:
- Twelve Data Support: https://twelvedata.com/contact
- StockScreener Issues: https://github.com/TzoharLary/StockScreener/issues

## References

- Twelve Data API Docs: https://twelvedata.com/docs
- Twelve Data Pricing: https://twelvedata.com/pricing
- Rate Limits: https://twelvedata.com/docs#rate-limits
- Error Codes: https://twelvedata.com/docs#errors
