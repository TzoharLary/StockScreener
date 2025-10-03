// Main Application Logic - Stock data management, filtering, and rendering

class MainApp {
    constructor(apiService, storage, watchlistManager) {
        this.apiService = apiService;
        this.storage = storage;
        this.watchlistManager = watchlistManager;
        this.stockData = [];
        this.filteredData = [];
        this.isLoading = false;
        this.loadingInProgress = false; // Prevent concurrent loads (BUG-027)
        this.stockDetailsView = null;
    }

    setStockDetailsView(stockDetailsView) {
        this.stockDetailsView = stockDetailsView;
    }

    setApiService(apiService) {
        this.apiService = apiService;
    }

    renderStockTable(data) {
        const tableBody = document.getElementById('stockTableBody');
        const resultsCount = document.getElementById('resultsCount');

        if (this.isLoading) {
            resultsCount.textContent = 'Loading stock data...';
            tableBody.innerHTML = `
                <tr>
                    <td colspan="10" class="loading">
                        <h3>Loading data from Twelve Data API...</h3>
                        <p>Please wait while we fetch the latest stock information</p>
                    </td>
                </tr>
            `;
            return;
        }

        resultsCount.textContent = `Found ${data.length} stocks matching criteria`;

        if (data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="10" class="no-results">
                        <h3>No stocks found</h3>
                        <p>Try adjusting your filter criteria</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = data.map(stock => `
            <tr class="stock-row" data-symbol="${escapeHtml(stock.symbol)}" style="cursor: pointer;">
                <td>
                    <div class="stock-symbol">${escapeHtml(stock.symbol)}</div>
                </td>
                <td>
                    <div class="stock-name">${escapeHtml(stock.name)}</div>
                </td>
                <td>$${stock.price.toFixed(2)}</td>
                <td>${formatLargeNumber(stock.marketCap)}</td>
                <td>${stock.peRatio.toFixed(1)}</td>
                <td>${stock.pbRatio.toFixed(1)}</td>
                <td>${stock.debtToEquity.toFixed(2)}</td>
                <td class="${stock.roe >= 20 ? 'positive' : ''}">${stock.roe.toFixed(1)}%</td>
                <td>${escapeHtml(stock.sector)}</td>
                <td style="text-align: center;">
                    <button class="btn btn-sm watchlist-btn" 
                            data-symbol="${escapeHtml(stock.symbol)}" 
                            data-name="${escapeHtml(stock.name)}"
                            style="padding: 0.5rem; font-size: 1.2rem; background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%); border: none; color: white; border-radius: 5px; cursor: pointer;"
                            title="Add to Watchlist">
                        ⭐
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Load stock data from API
    async loadStockData() {
        // Prevent concurrent loads (BUG-027)
        if (this.loadingInProgress) {
            console.log('Load already in progress, skipping...');
            return;
        }

        this.loadingInProgress = true;
        this.isLoading = true;
        this.renderStockTable([]); // Show loading state

        try {
            console.log('Loading stock data from Twelve Data API...');
            this.stockData = await this.apiService.fetchMultipleStocks(CONFIG.DEFAULT_STOCKS);
            this.filteredData = [...this.stockData];

            console.log('Stock data loaded successfully:', this.stockData.length, 'stocks');

            // Check if we're using fallback data (indicated by exact match with known fallback)
            const usingFallback = this.stockData.some(stock =>
                stock.symbol === 'AAPL' && stock.price === 175.43
            );

            const dataSource = document.getElementById('dataSource');
            if (dataSource) {
                if (usingFallback) {
                    dataSource.textContent = 'Using fallback data (Twelve Data API unavailable in this environment)';
                    dataSource.style.color = '#f39c12';
                } else {
                    dataSource.textContent = 'Data powered by Twelve Data API';
                    dataSource.style.color = '#666';
                }
            }

        } catch (error) {
            console.error('Error loading stock data:', error);
            logError(error, { context: 'loadStockData' });

            // Use fallback data as last resort
            this.stockData = CONFIG.DEFAULT_STOCKS.map(symbol => this.apiService.getFallbackData(symbol));
            this.filteredData = [...this.stockData];

            const dataSource = document.getElementById('dataSource');
            if (dataSource) {
                const errorMsg = getUserFriendlyErrorMessage(error);
                dataSource.textContent = `Using fallback data (${errorMsg})`;
                dataSource.style.color = '#e74c3c';
            }
        } finally {
            this.isLoading = false;
            this.loadingInProgress = false; // Reset flag
            this.renderStockTable(this.filteredData);
        }
    }

    // Add refresh functionality
    async refreshData() {
        this.apiService.clearCache();
        await this.loadStockData();
    }

    async addStockFromAutocomplete(selectedStock) {
        // Check if stock is already in stockData
        const existingStock = this.stockData.find(stock =>
            stock.symbol.toUpperCase() === selectedStock.symbol.toUpperCase()
        );

        if (existingStock) {
            // Return existing stock data
            return existingStock;
        }

        // Show loading state
        const resultsCount = document.getElementById('resultsCount');
        resultsCount.textContent = `Loading data for ${selectedStock.symbol}...`;

        try {
            // Fetch the stock data
            const newStockData = await this.apiService.getStockData(selectedStock.symbol);

            // Add to stockData array
            this.stockData.push(newStockData);

            console.log(`Added ${selectedStock.symbol} to stock data`);

            // Return the newly fetched stock data
            return newStockData;
        } catch (error) {
            console.error(`Failed to fetch data for ${selectedStock.symbol}:`, error);
            resultsCount.textContent = `Error loading ${selectedStock.symbol}. Try again.`;
            setTimeout(() => {
                this.applyFilters();
            }, 2000);
            return null;
        }
    }

    async showStockDetailsFromAutocomplete(selectedStock) {
        // First, ensure the stock data is loaded
        const stockData = await this.addStockFromAutocomplete(selectedStock);

        // If stock data was successfully fetched, show the details modal
        if (stockData && this.stockDetailsView) {
            this.stockDetailsView.showStockDetails(selectedStock.symbol, stockData);
        }
    }

    applyFilters() {
        // Sanitize search input
        let stockSearch = sanitizeSearchQuery(document.getElementById('stockSearch').value).toLowerCase();

        // Extract symbol if user selected from autocomplete (format: "SYMBOL - Company Name")
        if (stockSearch.includes(' - ')) {
            stockSearch = stockSearch.split(' - ')[0].toLowerCase();
        }

        const marketCap = document.getElementById('marketCap').value;
        const peRatio = parseFloat(document.getElementById('peRatio').value);
        const peRatioMin = parseFloat(document.getElementById('peRatioMin').value);
        const pbRatio = parseFloat(document.getElementById('pbRatio').value);
        const debtToEquity = parseFloat(document.getElementById('debtToEquity').value);
        const roe = parseFloat(document.getElementById('roe').value);
        const revenueGrowth = parseFloat(document.getElementById('revenueGrowth').value);
        const revenueGrowthYears = parseInt(document.getElementById('revenueGrowthYears').value, 10);
        const sector = document.getElementById('sector').value;

        // Validate numeric inputs
        const validations = [
            { value: peRatio, name: 'P/E Ratio', min: 0 },
            { value: peRatioMin, name: 'Min P/E Ratio', min: 0 },
            { value: pbRatio, name: 'P/B Ratio', min: 0 },
            { value: debtToEquity, name: 'Debt/Equity', min: 0 },
            { value: roe, name: 'ROE', min: -100, max: 1000 },
            { value: revenueGrowth, name: 'Revenue Growth', min: -100, max: 1000 },
            { value: revenueGrowthYears, name: 'Revenue Growth Years', min: 1, max: 10 }
        ];

        for (const validation of validations) {
            if (!isNaN(validation.value)) {
                if (!validateNumber(validation.value, {
                    min: validation.min || 0,
                    max: validation.max || Infinity,
                    allowNaN: true
                })) {
                    showError(`${validation.name} must be between ${validation.min || 0} and ${validation.max || 'infinity'}`, 'resultsCount');
                    return;
                }
            }
        }

        // Validate min/max relationship (BUG-016)
        if (!isNaN(peRatio) && !isNaN(peRatioMin) && peRatioMin > peRatio) {
            showError('P/E Ratio Min cannot be greater than Max', 'resultsCount');
            return;
        }

        this.filteredData = this.stockData.filter(stock => {
            // Search filter (by name or ticker)
            if (stockSearch &&
                !stock.name.toLowerCase().includes(stockSearch) &&
                !stock.symbol.toLowerCase().includes(stockSearch)) {
                return false;
            }

            // Market Cap filter
            if (marketCap && getMarketCapCategory(stock.marketCap) !== marketCap) {
                return false;
            }

            // P/E Ratio filter (max)
            if (!isNaN(peRatio) && stock.peRatio > peRatio) {
                return false;
            }

            // P/E Ratio filter (min)
            if (!isNaN(peRatioMin) && stock.peRatio < peRatioMin) {
                return false;
            }

            // P/B Ratio filter
            if (!isNaN(pbRatio) && stock.pbRatio > pbRatio) {
                return false;
            }

            // Debt/Equity filter
            if (!isNaN(debtToEquity) && stock.debtToEquity > debtToEquity) {
                return false;
            }

            // ROE filter
            if (!isNaN(roe) && stock.roe < roe) {
                return false;
            }

            // Revenue Growth filter
            if (!isNaN(revenueGrowth) && stock.revenueGrowth < revenueGrowth) {
                return false;
            }

            // Revenue Growth Years filter
            if (!isNaN(revenueGrowthYears) && stock.revenueGrowthYears < revenueGrowthYears) {
                return false;
            }

            // Sector filter
            if (sector && stock.sector !== sector) {
                return false;
            }

            return true;
        });

        this.renderStockTable(this.filteredData);
    }

    clearFilters() {
        document.getElementById('stockSearch').value = '';
        document.getElementById('marketCap').value = '';
        document.getElementById('peRatio').value = '';
        document.getElementById('peRatioMin').value = '';
        document.getElementById('pbRatio').value = '';
        document.getElementById('debtToEquity').value = '';
        document.getElementById('roe').value = '';
        document.getElementById('revenueGrowth').value = '';
        document.getElementById('revenueGrowthYears').value = '';
        document.getElementById('sector').value = '';

        this.filteredData = [...this.stockData];
        this.renderStockTable(this.filteredData);
    }

    setupEventListeners() {
        // Add event delegation for stock table clicks
        const tableBody = document.getElementById('stockTableBody');
        if (tableBody) {
            tableBody.addEventListener('click', (e) => {
                const row = e.target.closest('.stock-row');
                if (row && !e.target.closest('.watchlist-btn')) {
                    const symbol = row.dataset.symbol;
                    const stock = this.stockData.find(s => s.symbol === symbol);
                    if (stock && this.stockDetailsView) {
                        this.stockDetailsView.showStockDetails(symbol, stock);
                    }
                }

                // Handle watchlist button clicks
                const watchlistBtn = e.target.closest('.watchlist-btn');
                if (watchlistBtn) {
                    e.stopPropagation();
                    const symbol = watchlistBtn.dataset.symbol;
                    const name = watchlistBtn.dataset.name;
                    if (this.watchlistManager) {
                        this.watchlistManager.showWatchlistSelector(symbol, name);
                    }
                }
            });
        }
    }
}

// Make functions globally accessible for inline onclick handlers
window.applyFilters = function() {
    if (window.mainApp) {
        window.mainApp.applyFilters();
    }
};

window.clearFilters = function() {
    if (window.mainApp) {
        window.mainApp.clearFilters();
    }
};

window.refreshData = function() {
    if (window.mainApp) {
        window.mainApp.refreshData();
    }
};
