// Watchlist Manager - UI and functionality for managing watchlists
class WatchlistManager {
    constructor(storageService) {
        this.storage = storageService;
        this.currentWatchlist = null;
        this.init();
    }

    init() {
        // Ensure at least one watchlist exists
        const watchlists = this.storage.getWatchlists();
        if (watchlists.length > 0) {
            this.currentWatchlist = watchlists[0].id;
        }
    }

    // Show watchlist selector UI
    showWatchlistSelector(symbol, stockName) {
        const watchlists = this.storage.getWatchlists();
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay watchlist-modal';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2>Add "${symbol}" to Watchlist</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-content">
                    <p class="modal-description">${stockName || symbol}</p>
                    ${watchlists.length === 0 ? `
                        <div class="info-box">
                            <p>You don't have any watchlists yet. Create one to get started!</p>
                        </div>
                    ` : ''}
                    <div class="watchlist-list">
                        ${watchlists.map(wl => `
                            <div class="watchlist-item ${wl.stocks.includes(symbol) ? 'in-watchlist' : ''}" 
                                 data-watchlist-id="${wl.id}">
                                <div class="watchlist-info">
                                    <div class="watchlist-name">
                                        ${wl.stocks.includes(symbol) ? '⭐' : '☆'} ${wl.name}
                                    </div>
                                    <div class="watchlist-description">${wl.description}</div>
                                    <div class="watchlist-count">${wl.stocks.length} stocks</div>
                                </div>
                                <button class="btn btn-sm ${wl.stocks.includes(symbol) ? 'btn-secondary' : 'btn-primary'}"
                                        onclick="watchlistManager.toggleStockInWatchlist('${wl.id}', '${symbol}', '${stockName}', this)">
                                    ${wl.stocks.includes(symbol) ? 'Remove' : 'Add'}
                                </button>
                            </div>
                        `).join('')}
                    </div>
                    <div class="modal-actions" style="margin-top: 1.5rem;">
                        <button class="btn btn-secondary" onclick="watchlistManager.showCreateWatchlistForm()">
                            + New Watchlist
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Toggle stock in watchlist
    toggleStockInWatchlist(watchlistId, symbol, stockName, button) {
        const watchlist = this.storage.getWatchlist(watchlistId);
        
        // Add null check
        if (!watchlist) {
            this.showToast('Watchlist not found. Please refresh the page.', 'error');
            return;
        }
        
        if (watchlist.stocks.includes(symbol)) {
            // Remove from watchlist
            this.storage.removeStockFromWatchlist(watchlistId, symbol);
            button.textContent = 'Add';
            button.classList.remove('btn-secondary');
            button.classList.add('btn-primary');
            button.closest('.watchlist-item').classList.remove('in-watchlist');
            button.closest('.watchlist-item').querySelector('.watchlist-name').textContent = 
                `☆ ${watchlist.name}`;
            this.showToast(`Removed ${symbol} from ${watchlist.name}`, 'info');
        } else {
            // Add to watchlist
            this.storage.addStockToWatchlist(watchlistId, symbol);
            button.textContent = 'Remove';
            button.classList.remove('btn-primary');
            button.classList.add('btn-secondary');
            button.closest('.watchlist-item').classList.add('in-watchlist');
            button.closest('.watchlist-item').querySelector('.watchlist-name').textContent = 
                `⭐ ${watchlist.name}`;
            this.showToast(`Added ${symbol} to ${watchlist.name}`, 'success');
        }
        
        // Update count
        const updatedWatchlist = this.storage.getWatchlist(watchlistId);
        button.closest('.watchlist-item').querySelector('.watchlist-count').textContent = 
            `${updatedWatchlist.stocks.length} stocks`;
    }

    // Show create watchlist form
    showCreateWatchlistForm() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay create-watchlist-modal';
        modal.innerHTML = `
            <div class="modal" style="max-width: 500px;">
                <div class="modal-header">
                    <h2>Create New Watchlist</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-content">
                    <div class="modal-input-group">
                        <label for="watchlist-name">Watchlist Name</label>
                        <input type="text" id="watchlist-name" placeholder="e.g., Tech Stocks, Dividend Stars" 
                               autocomplete="off" maxlength="50" required>
                    </div>
                    <div class="modal-input-group">
                        <label for="watchlist-description">Description (Optional)</label>
                        <textarea id="watchlist-description" rows="3" 
                                  placeholder="e.g., High-growth technology companies" 
                                  maxlength="200"></textarea>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Cancel
                    </button>
                    <button class="btn btn-primary" onclick="watchlistManager.createWatchlist()">
                        Create Watchlist
                    </button>
                </div>
            </div>
        `;
        
        // Remove any existing create watchlist modals
        document.querySelectorAll('.create-watchlist-modal').forEach(m => m.remove());
        
        document.body.appendChild(modal);
        
        // Focus on name input
        setTimeout(() => {
            document.getElementById('watchlist-name').focus();
        }, 100);
        
        // Handle Enter key
        modal.querySelector('#watchlist-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.createWatchlist();
            }
        });
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Create new watchlist
    createWatchlist() {
        const nameInput = document.getElementById('watchlist-name');
        const descInput = document.getElementById('watchlist-description');
        
        const name = nameInput.value.trim();
        const description = descInput.value.trim();
        
        if (!name) {
            alert('Please enter a watchlist name');
            nameInput.focus();
            return;
        }
        
        // Create the watchlist
        const newWatchlist = this.storage.addWatchlist(name, description);
        this.currentWatchlist = newWatchlist.id;
        
        // Close the modal
        document.querySelector('.create-watchlist-modal').remove();
        
        this.showToast(`Created watchlist "${name}"`, 'success');
        
        // If we're in the watchlist selector, refresh it
        const watchlistModal = document.querySelector('.watchlist-modal');
        if (watchlistModal) {
            watchlistModal.remove();
        }
    }

    // View all watchlists
    showAllWatchlists() {
        const watchlists = this.storage.getWatchlists();
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay all-watchlists-modal';
        modal.innerHTML = `
            <div class="modal" style="max-width: 800px;">
                <div class="modal-header">
                    <h2>My Watchlists</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-content">
                    ${watchlists.length === 0 ? `
                        <div class="info-box">
                            <p>You don't have any watchlists yet.</p>
                            <button class="btn btn-primary" onclick="watchlistManager.showCreateWatchlistForm()" 
                                    style="margin-top: 1rem;">
                                Create Your First Watchlist
                            </button>
                        </div>
                    ` : `
                        <div class="watchlists-grid">
                            ${watchlists.map(wl => `
                                <div class="watchlist-card" data-watchlist-id="${wl.id}">
                                    <div class="watchlist-card-header">
                                        <h3>${wl.name}</h3>
                                        <button class="btn-icon" onclick="watchlistManager.deleteWatchlist('${wl.id}')" 
                                                title="Delete watchlist">
                                            🗑️
                                        </button>
                                    </div>
                                    <p class="watchlist-card-description">${wl.description || 'No description'}</p>
                                    <div class="watchlist-card-stats">
                                        <span>${wl.stocks.length} stocks</span>
                                        <span>Updated: ${new Date(wl.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                    ${wl.stocks.length > 0 ? `
                                        <div class="watchlist-card-stocks">
                                            ${wl.stocks.slice(0, 5).map(s => `<span class="stock-tag">${s}</span>`).join('')}
                                            ${wl.stocks.length > 5 ? `<span class="stock-tag">+${wl.stocks.length - 5} more</span>` : ''}
                                        </div>
                                    ` : '<p class="text-muted">No stocks yet</p>'}
                                    <button class="btn btn-primary btn-sm" 
                                            onclick="watchlistManager.viewWatchlistStocks('${wl.id}')"
                                            style="margin-top: 1rem; width: 100%;">
                                        View Details
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                        <button class="btn btn-secondary" onclick="watchlistManager.showCreateWatchlistForm()" 
                                style="margin-top: 1.5rem;">
                            + Create New Watchlist
                        </button>
                    `}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // View stocks in a watchlist
    viewWatchlistStocks(watchlistId) {
        const watchlist = this.storage.getWatchlist(watchlistId);
        if (!watchlist) return;
        
        // Close all watchlists modal
        document.querySelector('.all-watchlists-modal')?.remove();
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay watchlist-details-modal';
        modal.innerHTML = `
            <div class="modal" style="max-width: 900px;">
                <div class="modal-header">
                    <div>
                        <h2>${watchlist.name}</h2>
                        <p class="text-muted">${watchlist.description || 'No description'}</p>
                    </div>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-content">
                    ${watchlist.stocks.length === 0 ? `
                        <div class="info-box">
                            <p>This watchlist is empty. Add stocks from the screening results!</p>
                        </div>
                    ` : `
                        <div class="stock-list">
                            ${watchlist.stocks.map(symbol => `
                                <div class="stock-list-item" data-symbol="${symbol}">
                                    <div class="stock-list-info">
                                        <span class="stock-symbol">${symbol}</span>
                                        ${watchlist.notes[symbol] ? `
                                            <span class="stock-note">${watchlist.notes[symbol]}</span>
                                        ` : ''}
                                    </div>
                                    <div class="stock-list-actions">
                                        <button class="btn btn-sm btn-secondary" 
                                                onclick="watchlistManager.addNoteToStock('${watchlistId}', '${symbol}')">
                                            📝 Note
                                        </button>
                                        <button class="btn btn-sm btn-secondary" 
                                                onclick="watchlistManager.removeStockFromWatchlist('${watchlistId}', '${symbol}')">
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Add note to stock
    addNoteToStock(watchlistId, symbol) {
        const watchlist = this.storage.getWatchlist(watchlistId);
        const currentNote = watchlist.notes[symbol] || '';
        
        const note = prompt(`Add a note for ${symbol}:`, currentNote);
        if (note !== null) {
            if (note.trim()) {
                this.storage.setStockNote(watchlistId, symbol, note.trim());
                this.showToast(`Note added to ${symbol}`, 'success');
                
                // Update the display if the details modal is open
                const noteElement = document.querySelector(`.stock-list-item[data-symbol="${symbol}"] .stock-note`);
                if (noteElement) {
                    noteElement.textContent = note.trim();
                } else {
                    // Add note element if it doesn't exist
                    const infoDiv = document.querySelector(`.stock-list-item[data-symbol="${symbol}"] .stock-list-info`);
                    if (infoDiv) {
                        const noteSpan = document.createElement('span');
                        noteSpan.className = 'stock-note';
                        noteSpan.textContent = note.trim();
                        infoDiv.appendChild(noteSpan);
                    }
                }
            } else {
                // Delete note if empty
                this.storage.setStockNote(watchlistId, symbol, '');
                const noteElement = document.querySelector(`.stock-list-item[data-symbol="${symbol}"] .stock-note`);
                if (noteElement) {
                    noteElement.remove();
                }
            }
        }
    }

    // Delete watchlist
    deleteWatchlist(watchlistId) {
        const watchlist = this.storage.getWatchlist(watchlistId);
        if (!watchlist) return;
        
        if (confirm(`Are you sure you want to delete "${watchlist.name}"? This cannot be undone.`)) {
            this.storage.deleteWatchlist(watchlistId);
            this.showToast(`Deleted watchlist "${watchlist.name}"`, 'info');
            
            // Close modal and refresh
            document.querySelector('.all-watchlists-modal')?.remove();
            this.showAllWatchlists();
        }
    }

    // Show toast notification
    showToast(message, type = 'info') {
        // Remove any existing toasts
        document.querySelectorAll('.toast').forEach(t => t.remove());
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WatchlistManager;
}
