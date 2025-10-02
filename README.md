# StockScreener

A web application for screening stocks based on fundamental parameters. This application allows users to filter stocks by various financial metrics such as P/E ratio, market capitalization, debt-to-equity ratio, return on equity (ROE), and sector.

## 🚀 Live Demo

**Try it now: [https://tzoharlary.github.io/StockScreener/](https://tzoharlary.github.io/StockScreener/)**

No installation required! Just visit the link and enter your free Twelve Data API key to start screening stocks.

## Features

### 🏠 Professional Landing Page
- **Dual Entry Options**: Choose between Demo Mode or Full Version with API key
- **Easy Onboarding**: Step-by-step guide for obtaining free Twelve Data API key
- **Auto-Recognition**: Automatically logs in returning users based on stored preferences

### 🔐 API Key Management
- **Secure Storage**: API keys stored locally in browser (localStorage)
- **Flexible Modes**: 
  - **Demo Mode**: Explore with sample data (no API key needed)
  - **Full Mode**: Access live data with your API key
- **Settings Panel**: Manage API key through convenient gear icon (⚙️)
- **Privacy**: Masked API key display for security

### 📈 Advanced Stock Screening
- **Interactive Stock Filtering**: Filter stocks by multiple criteria including:
  - Market Cap (Small, Mid, Large cap)
  - P/E Ratio (Price-to-Earnings)
  - P/B Ratio (Price-to-Book)
  - Debt/Equity Ratio
  - ROE (Return on Equity)
  - Sector (Technology, Healthcare, Financial, Consumer, Energy, Industrial)

- **Real-time Results**: See filtered results instantly as you apply criteria
- **Smart Autocomplete**: Search by company name or ticker symbol with intelligent suggestions
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Clean Interface**: Modern, user-friendly design with clear data presentation

### 🔍 Detailed Stock View
Click any stock row to view comprehensive information:
- **Fundamentals Tab**: Market Cap, P/E Ratio, P/B Ratio, ROE, Debt/Equity, EPS, Dividend Yield
- **Financial Metrics Tab**: Revenue, Net Income, Operating/Profit Margins, Growth Rates, Cash Flow
- **Company Profile Tab**: Company information, sector, industry, exchange, country, description
- **Quick Actions**: Add to watchlist directly from the detail view

### ⭐ Watchlist Management
- **Multiple Watchlists**: Create unlimited custom watchlists with names and descriptions
- **Quick Access**: Floating star button (⭐) for instant watchlist management
- **Personalization**: Add personal notes to stocks in your watchlists
- **Organized View**: Grid layout showing all watchlists with stock counts
- **Actions**: Add/remove stocks, delete watchlists, view details
- **Persistent Storage**: All watchlists saved locally and persist across sessions
- **Toast Notifications**: Real-time feedback for all watchlist actions

### 🎨 Modern UI/UX
- **Smooth Animations**: Polished transitions, loading states, and hover effects
- **Professional Design**: Gradient themes, card layouts, and modern styling
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Mobile-First**: Fully responsive design that works on all devices
- **Loading States**: Spinner animations and skeleton screens for better UX

## Live Data Integration

The application is integrated with **Twelve Data API** to provide real-time stock fundamental data. It includes data for 10 major stocks:
- Apple (AAPL)
- Alphabet/Google (GOOGL)
- Microsoft (MSFT)
- Tesla (TSLA)
- Johnson & Johnson (JNJ)
- JPMorgan Chase (JPM)
- Visa (V)
- Procter & Gamble (PG)
- Exxon Mobil (XOM)
- The Home Depot (HD)

### API Features
- **Real-time Data**: Fetches live stock prices and fundamental metrics
- **Fallback System**: Gracefully falls back to cached data if API is unavailable
- **Caching**: 5-minute cache to minimize API calls and improve performance
- **Error Handling**: Robust error handling with informative user feedback

### Twelve Data API Compliance
This application follows Twelve Data API best practices:
- **Attribution**: Displays "Data powered by Twelve Data API" in the UI (required for free tier)
- **Rate Limiting**: Implements caching to respect rate limits (8 calls/min, 800 calls/day for free tier)
- **Error Handling**: Provides specific error messages for common API errors (401, 429, 404, 400)
- **HTTPS**: All API requests use HTTPS as required
- **User-Agent**: Includes descriptive User-Agent header with project URL

### Endpoints Used
The following Twelve Data endpoints are used (all available in free tier):
- `/quote` - Real-time stock quotes and prices
- `/statistics` - Fundamental statistics (P/E, P/B, debt/equity, ROE, etc.)
- `/profile` - Company profile information (name, sector, industry)
- `/symbol_search` - Stock symbol search for autocomplete

**Note**: Each stock lookup uses 3 API calls (quote + statistics + profile), so with the free tier limit of 8 calls/minute, you can fetch approximately 2 stocks per minute.

## Getting Started

### Quick Start (Recommended)

**Use the live demo - no installation needed!**

1. **Visit the live application**: [https://tzoharlary.github.io/StockScreener/](https://tzoharlary.github.io/StockScreener/)

2. **Get your free API key**:
   - Visit [https://twelvedata.com/](https://twelvedata.com/)
   - Sign up for a free account (takes 1 minute)
   - Get your API key from the dashboard
   - Free tier includes 800 API credits per day

3. **Enter your API key**:
   - When you first visit the app, you'll see a welcome modal
   - Paste your API key and click "Save API Key"
   - Your key is stored securely in your browser's localStorage
   - Start screening stocks immediately!

4. **Update your API key anytime**:
   - Click the ⚙️ settings button (bottom-right corner)
   - Enter a new API key or switch to demo mode

### Developer Setup (Local Development)

If you want to run the application locally or contribute to development:

1. **Clone or download this repository**

2. **Get a Twelve Data API Key**:
   - Visit [https://twelvedata.com/](https://twelvedata.com/)
   - Sign up for a free account
   - Get your API key from the dashboard
   - Free tier includes 800 API credits per day

3. **Run the application**:

   **Option 1: Direct Browser Access**
   - Simply open `index.html` in your web browser
   - Enter your API key when prompted

   **Option 2: Local Server (Recommended)**
   ```bash
   # Using Python 3
   python3 -m http.server 8000

   # Or using Node.js
   npm start

   # Then open http://localhost:8000 in your browser
   ```

   When the application loads, enter your API key in the modal that appears.

**Note**: The API key is stored in your browser's localStorage. You don't need to edit any files!

## Project Structure

```
StockScreener/
├── index.html              # Landing page with Demo/Full Version options
├── app.html                # Main application interface
├── config.js               # Configuration (API keys, settings, default stocks)
├── api-service.js          # Twelve Data API service class
├── errors.js               # Custom error classes
├── utils.js                # Utility functions
├── styles.css              # Main application styles
├── css/
│   ├── landing.css         # Landing page styles
│   └── components.css      # Component styles (modals, watchlists, etc.)
├── js/
│   ├── storage-service.js  # localStorage management
│   ├── watchlist-manager.js # Watchlist functionality
│   └── stock-details.js    # Stock details view
├── package.json            # Project metadata and scripts
└── README.md               # Documentation
```

## Usage

1. **Set Filter Criteria**: Use the filter panel to set your desired screening parameters
2. **Apply Filters**: Click "Apply Filters" to see stocks that match your criteria
3. **Clear Filters**: Click "Clear All" to reset all filters and see all stocks
4. **Refresh Data**: Click "Refresh Data" to fetch the latest data from Twelve Data API
5. **Review Results**: The results table shows all matching stocks with their key financial metrics

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **API Integration**: Twelve Data API for real-time stock data
- **Data Sources**: Live financial data with intelligent fallback system
- **Styling**: Custom CSS with modern design patterns
- **Architecture**: Modular design with separate configuration and API service modules

## Future Enhancements

See our detailed [Feature Roadmap](FEATURE_ROADMAP.md) for a comprehensive evaluation and prioritization of upcoming features.

### Priority 0 - Coming Soon
- 💾 Save/load custom screening profiles
- 📊 Export filtered results to CSV/Excel
- 🌙 Dark mode toggle

### Priority 1 - Planned
- 📈 Historical price charts with technical indicators
- 📰 Latest news and events for stocks

### Priority 2 - Under Consideration
- 🔔 Notifications/alerts for custom criteria
- 🌍 Multi-language support

### Priority 3 - Future Vision
- 💼 Full portfolio tracking capabilities

For detailed analysis, complexity estimates, and implementation details, see [FEATURE_ROADMAP.md](FEATURE_ROADMAP.md).
