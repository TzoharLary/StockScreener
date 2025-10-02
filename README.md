# StockScreener

A web application for screening stocks based on fundamental parameters. This application allows users to filter stocks by various financial metrics such as P/E ratio, market capitalization, debt-to-equity ratio, return on equity (ROE), and sector.

## Features

- **Interactive Stock Filtering**: Filter stocks by multiple criteria including:
  - Market Cap (Small, Mid, Large cap)
  - P/E Ratio (Price-to-Earnings)
  - P/B Ratio (Price-to-Book)
  - Debt/Equity Ratio
  - ROE (Return on Equity)
  - Sector (Technology, Healthcare, Financial, Consumer, Energy, Industrial)

- **Real-time Results**: See filtered results instantly as you apply criteria
- **Responsive Design**: Works on desktop and mobile devices
- **Clean Interface**: Modern, user-friendly design with clear data presentation

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

## Getting Started

### Prerequisites

1. **Get a Twelve Data API Key** (Required for live data):
   - Visit [https://twelvedata.com/](https://twelvedata.com/)
   - Sign up for a free account
   - Get your API key from the dashboard
   - Free tier includes 800 API credits per day

### Setup Instructions

1. **Clone or download this repository**

2. **Configure your API key**:
   ```bash
   # Copy the example configuration file
   cp config.example.js config.js
   
   # Edit config.js and replace 'YOUR_API_KEY_HERE' with your actual API key
   ```

   **Important**: Never commit your `config.js` file with your API key to version control!

3. **Run the application**:

   **Option 1: Direct Browser Access**
   - Simply open `index.html` in your web browser

   **Option 2: Local Server (Recommended)**
   ```bash
   # Using Python 3
   python3 -m http.server 8000

   # Or using Node.js
   npm start

   # Then open http://localhost:8000 in your browser
   ```

### First-Time Setup Checklist
- [ ] Get Twelve Data API key
- [ ] Copy `config.example.js` to `config.js`
- [ ] Add your API key to `config.js`
- [ ] Verify `config.js` is listed in `.gitignore`
- [ ] Start the application

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

- Additional filtering criteria (dividend yield, revenue growth, etc.)
- Stock charts and detailed company information
- Save and load custom screening profiles
- Export filtered results to CSV/Excel
- Watchlist functionality
- Portfolio tracking capabilities
