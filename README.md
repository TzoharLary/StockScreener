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

## Demo Data

The application includes sample data from 10 major stocks including:
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

## Getting Started

### Option 1: Direct Browser Access
Simply open `index.html` in your web browser to start using the stock screener.

### Option 2: Local Server
To run with a local server (recommended for better performance):

```bash
# Using Python 3
python3 -m http.server 8000

# Or using Node.js
npm start

# Then open http://localhost:8000 in your browser
```

## Usage

1. **Set Filter Criteria**: Use the filter panel to set your desired screening parameters
2. **Apply Filters**: Click "Apply Filters" to see stocks that match your criteria
3. **Clear Filters**: Click "Clear All" to reset all filters and see all stocks
4. **Review Results**: The results table shows all matching stocks with their key financial metrics

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Styling**: Custom CSS with modern design patterns
- **Data**: Mock JSON data structure (easily replaceable with real API)

## Future Enhancements

- Integration with real financial data APIs (Alpha Vantage, Financial Modeling Prep, etc.)
- Additional filtering criteria (dividend yield, revenue growth, etc.)
- Stock charts and detailed company information
- Save and load custom screening profiles
- Export filtered results to CSV/Excel
