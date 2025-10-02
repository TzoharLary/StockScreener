# GitHub Copilot Instructions for StockScreener

## Project Overview
StockScreener is a web application for screening stocks based on fundamental financial parameters. It allows users to filter stocks by various metrics such as P/E ratio, market capitalization, debt-to-equity ratio, return on equity (ROE), and sector.

## Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (no frameworks)
- **API Integration**: Twelve Data API for real-time stock data
- **Architecture**: Modular design with separate configuration and API service modules
- **Server**: Simple HTTP server (Python or Node.js) for local development

## Code Style and Conventions

### JavaScript
- Use ES6+ modern JavaScript features (classes, async/await, arrow functions)
- Use descriptive variable and function names in camelCase
- Add comments for complex logic and class methods
- Use async/await for asynchronous operations
- Implement proper error handling with try/catch blocks
- Follow the existing module pattern (check for CommonJS exports)

### CSS
- Inline styles in `index.html` for simplicity
- Use modern CSS features (flexbox, grid)
- Follow the existing gradient and shadow styling patterns
- Use semantic color variables where applicable
- Maintain responsive design principles

### HTML
- Use semantic HTML5 elements
- Maintain accessibility attributes
- Follow the existing structure with `.container`, `.header`, `.filter-panel` patterns

## Project Structure
```
StockScreener/
├── index.html          # Main HTML file with embedded CSS and JavaScript
├── config.js           # Configuration (API keys, settings, default stocks)
├── api-service.js      # TwelveDataService class for API interactions
├── package.json        # Project metadata and scripts
├── README.md           # Documentation
└── .github/
    └── copilot-instructions.md
```

## Key Components

### Configuration (config.js)
- Contains API keys, base URLs, and settings
- Exports CONFIG object for use in other modules
- Default stocks list: AAPL, GOOGL, MSFT, TSLA, JNJ, JPM, V, PG, XOM, HD

### API Service (api-service.js)
- `TwelveDataService` class handles all API interactions
- Implements caching (5-minute cache duration)
- Provides fallback data when API is unavailable
- Methods follow async/await pattern
- Handles multiple API endpoints (quote, fundamentals, profile)

### Main Application (index.html)
- Contains all UI, styling, and application logic
- Uses vanilla JavaScript (no jQuery or frameworks)
- Implements stock filtering, searching, and data display
- Includes autocomplete functionality for stock search

## Development Guidelines

### Running the Application
```bash
# Using Python 3
python3 -m http.server 8000

# Or using Node.js
npm start

# Then open http://localhost:8000 in browser
```

### Testing
- Currently no automated tests (manual testing only)
- Test by opening `index.html` directly or via local server
- Verify API integration, filtering, and search functionality

### Adding New Features
1. For new filter criteria: Add input elements in the filter panel and update `applyFilters()` function
2. For new API endpoints: Extend `TwelveDataService` class with new methods
3. For new UI components: Follow existing CSS patterns and maintain responsive design
4. Always provide fallback data for API failures

### API Integration
- API calls go through `TwelveDataService` class
- Always implement caching to minimize API calls
- Always provide fallback data (see `getFallbackData()` method)
- Handle timeout scenarios (REQUEST_TIMEOUT: 10 seconds)
- Use Promise.all() for parallel API requests

### Error Handling
- Catch and log API errors
- Fall back to cached or static data when API fails
- Provide user-friendly error messages
- Don't expose API keys or sensitive errors to users

### Security Considerations
- API keys are currently in config.js (consider environment variables for production)
- Validate user inputs before processing
- Sanitize data from API before rendering

## Common Tasks

### Adding a New Stock Symbol
1. Add symbol to `DEFAULT_STOCKS` array in `config.js`
2. Add fallback data to `getFallbackData()` method in `api-service.js`

### Adding a New Filter
1. Add HTML input element in the filter panel
2. Update `applyFilters()` function to include new criteria
3. Update `clearFilters()` to reset the new input

### Modifying API Integration
1. Update endpoint URLs in `fetchStockData()` method
2. Modify `formatStockData()` to handle new data structure
3. Update fallback data to match new format

## Future Enhancements (Planned)
- Additional filtering criteria (dividend yield, revenue growth)
- Stock charts and detailed company information
- Save and load custom screening profiles
- Export filtered results to CSV/Excel
- Watchlist functionality
- Portfolio tracking capabilities

## Best Practices
1. **Maintain Simplicity**: Keep the vanilla JavaScript approach, avoid adding frameworks
2. **Test API Changes**: Always test with live API and verify fallback behavior
3. **Preserve Caching**: Maintain the caching mechanism to reduce API calls
4. **Responsive Design**: Test on mobile and desktop viewports
5. **Progressive Enhancement**: Ensure basic functionality works without API
6. **Code Comments**: Add comments for complex logic and algorithms
7. **Error Recovery**: Always provide graceful degradation when features fail

## Debugging Tips
- Check browser console for JavaScript errors
- Verify API responses in Network tab
- Test with and without internet connection (fallback mode)
- Clear cache if seeing stale data (5-minute cache duration)
- Use browser DevTools for responsive design testing

## Dependencies
- No external JavaScript libraries or frameworks
- Pure vanilla JavaScript, HTML5, and CSS3
- Twelve Data API for stock data (external service)

## Performance Considerations
- Implement caching to minimize API calls
- Use Promise.all() for parallel requests
- Avoid unnecessary DOM manipulations
- Optimize table rendering for large datasets
- Consider debouncing for search autocomplete

## Accessibility
- Use semantic HTML elements
- Maintain keyboard navigation support
- Ensure sufficient color contrast
- Add ARIA labels where appropriate
- Test with screen readers when making UI changes
