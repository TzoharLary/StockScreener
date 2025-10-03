// Stock Details View - Detailed information modal for individual stocks
class StockDetailsView {
    constructor(apiService) {
        this.apiService = apiService;
    }

    // Show detailed stock information
    async showStockDetails(symbol, stockData = null) {
        // Create modal with loading state
        const modal = this.createModal(symbol);
        document.body.appendChild(modal);

        // Add show class to display the modal
        setTimeout(() => modal.classList.add('show'), 10);

        try {
            // Fetch detailed data if not provided
            if (!stockData) {
                stockData = await this.fetchStockData(symbol);
            }

            // Update modal with data
            this.updateModalContent(modal, symbol, stockData);
        } catch (error) {
            console.error(`Error loading details for ${symbol}:`, error);
            this.showError(modal, `Failed to load details for ${symbol}`);
        }
    }

    // Create modal structure
    createModal(symbol) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay stock-details-modal';
        modal.innerHTML = `
            <div class="modal modal-large">
                <div class="modal-header">
                    <h2>Loading ${symbol}...</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-content">
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                        <p>Loading stock details...</p>
                    </div>
                </div>
            </div>
        `;

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        return modal;
    }

    // Fetch stock data from API
    async fetchStockData(symbol) {
        // Use getStockData which properly fetches data for a single symbol
        return this.apiService ? await this.apiService.getStockData(symbol) : null;
    }

    // Update modal with stock data
    updateModalContent(modal, symbol, stockData) {
        const modalHeader = modal.querySelector('.modal-header h2');
        const modalContent = modal.querySelector('.modal-content');

        if (!stockData) {
            this.showError(modal, `No data available for ${symbol}`);
            return;
        }

        modalHeader.innerHTML = `
            <div class="stock-header">
                <div class="stock-title">
                    <span class="stock-symbol-large">${symbol}</span>
                    <span class="stock-name-large">${stockData.name || 'N/A'}</span>
                </div>
                <div class="stock-price-large">
                    <span class="price">$${stockData.price ? stockData.price.toFixed(2) : 'N/A'}</span>
                </div>
            </div>
        `;

        modalContent.innerHTML = `
            <div class="stock-details-tabs">
                <button class="tab-btn active" data-tab="fundamentals">Fundamentals</button>
                <button class="tab-btn" data-tab="financials">Financial Metrics</button>
                <button class="tab-btn" data-tab="profile">Company Profile</button>
            </div>

            <div class="stock-details-content">
                <!-- Fundamentals Tab -->
                <div class="tab-content active" data-tab="fundamentals">
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-label">Market Cap</div>
                            <div class="metric-value">${this.formatMarketCap(stockData.marketCap)}</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-label">P/E Ratio</div>
                            <div class="metric-value">${stockData.peRatio !== undefined && stockData.peRatio !== null ? stockData.peRatio.toFixed(2) : 'N/A'}</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-label">P/B Ratio</div>
                            <div class="metric-value">${stockData.pbRatio !== undefined && stockData.pbRatio !== null ? stockData.pbRatio.toFixed(2) : 'N/A'}</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-label">ROE</div>
                            <div class="metric-value ${stockData.roe > 15 ? 'positive' : ''}">${stockData.roe !== undefined && stockData.roe !== null ? stockData.roe.toFixed(2) + '%' : 'N/A'}</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-label">Debt/Equity</div>
                            <div class="metric-value ${stockData.debtToEquity < 1 ? 'positive' : stockData.debtToEquity > 2 ? 'negative' : ''}">${stockData.debtToEquity !== undefined && stockData.debtToEquity !== null ? stockData.debtToEquity.toFixed(2) : 'N/A'}</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-label">EPS</div>
                            <div class="metric-value">${stockData.eps !== undefined && stockData.eps !== null ? '$' + stockData.eps.toFixed(2) : 'N/A'}</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-label">Dividend Yield</div>
                            <div class="metric-value">${stockData.dividendYield !== undefined && stockData.dividendYield !== null ? stockData.dividendYield.toFixed(2) + '%' : 'N/A'}</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-label">Sector</div>
                            <div class="metric-value">${stockData.sector || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <!-- Financials Tab -->
                <div class="tab-content" data-tab="financials">
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-label">Revenue</div>
                            <div class="metric-value">${stockData.revenue ? this.formatLargeNumber(stockData.revenue) : 'N/A'}</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-label">Net Income</div>
                            <div class="metric-value">${stockData.netIncome ? this.formatLargeNumber(stockData.netIncome) : 'N/A'}</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-label">Operating Margin</div>
                            <div class="metric-value">${stockData.operatingMargin !== undefined && stockData.operatingMargin !== null ? stockData.operatingMargin.toFixed(2) + '%' : 'N/A'}</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-label">Profit Margin</div>
                            <div class="metric-value">${stockData.profitMargin !== undefined && stockData.profitMargin !== null ? stockData.profitMargin.toFixed(2) + '%' : 'N/A'}</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-label">Revenue Growth</div>
                            <div class="metric-value ${stockData.revenueGrowth > 0 ? 'positive' : 'negative'}">${stockData.revenueGrowth !== undefined && stockData.revenueGrowth !== null ? stockData.revenueGrowth.toFixed(2) + '%' : 'N/A'}</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-label">Earnings Growth</div>
                            <div class="metric-value ${stockData.earningsGrowth > 0 ? 'positive' : 'negative'}">${stockData.earningsGrowth !== undefined && stockData.earningsGrowth !== null ? stockData.earningsGrowth.toFixed(2) + '%' : 'N/A'}</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-label">Cash Flow</div>
                            <div class="metric-value">${stockData.cashFlow ? this.formatLargeNumber(stockData.cashFlow) : 'N/A'}</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-label">Free Cash Flow</div>
                            <div class="metric-value">${stockData.freeCashFlow ? this.formatLargeNumber(stockData.freeCashFlow) : 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <!-- Profile Tab -->
                <div class="tab-content" data-tab="profile">
                    <div class="profile-section">
                        <h3>Company Information</h3>
                        <div class="profile-grid">
                            <div class="profile-item">
                                <strong>Company Name:</strong>
                                <span>${stockData.companyName || 'N/A'}</span>
                            </div>
                            <div class="profile-item">
                                <strong>Symbol:</strong>
                                <span>${symbol}</span>
                            </div>
                            <div class="profile-item">
                                <strong>Sector:</strong>
                                <span>${stockData.sector || 'N/A'}</span>
                            </div>
                            <div class="profile-item">
                                <strong>Industry:</strong>
                                <span>${stockData.industry || 'N/A'}</span>
                            </div>
                            <div class="profile-item">
                                <strong>Exchange:</strong>
                                <span>${stockData.exchange || 'N/A'}</span>
                            </div>
                            <div class="profile-item">
                                <strong>Country:</strong>
                                <span>${stockData.country || 'N/A'}</span>
                            </div>
                        </div>
                        ${stockData.description ? `
                            <div class="profile-description">
                                <h4>About</h4>
                                <p>${stockData.description}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>

            <div class="stock-details-actions">
                <button class="btn btn-primary" onclick="watchlistManager.showWatchlistSelector('${symbol}', '${stockData.companyName || symbol}')">
                    ⭐ Add to Watchlist
                </button>
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                    Close
                </button>
            </div>
        `;

        // Setup tab switching
        this.setupTabs(modal);
    }

    // Setup tab functionality
    setupTabs(modal) {
        const tabButtons = modal.querySelectorAll('.tab-btn');
        const tabContents = modal.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;

                // Update active states
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                button.classList.add('active');
                modal.querySelector(`.tab-content[data-tab="${tabName}"]`).classList.add('active');
            });
        });
    }

    // Show error in modal
    showError(modal, message) {
        const modalContent = modal.querySelector('.modal-content');
        modalContent.innerHTML = `
            <div class="error-box">
                <p>${message}</p>
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                    Close
                </button>
            </div>
        `;
    }

    // Format market cap
    formatMarketCap(marketCap) {
        if (!marketCap || marketCap === 0) return 'N/A';
        if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
        if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
        if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
        return `$${marketCap.toFixed(2)}`;
    }

    // Format large numbers
    formatLargeNumber(num) {
        if (!num || num === 0) return 'N/A';
        if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
        return `$${num.toFixed(2)}`;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StockDetailsView;
}
