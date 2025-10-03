// Stock Autocomplete - Search functionality for adding new stocks
class StockAutocomplete {
    constructor() {
        this.searchTimeout = null;
        this.selectedIndex = -1;
        this.searchResults = [];
        this.isLoading = false;
        this.apiService = null;
        this.currentRequestId = 0; // Track request order
        this.abortController = null; // For canceling requests
        this.blurTimeout = null; // Track blur timeout (BUG-009)
        this.onStockAdded = null; // Callback when new stock is added
        this.onFilterApply = null; // Callback to apply filters
        this.onStockSelected = null; // Callback when stock is selected from autocomplete
    }

    setApiService(apiService) {
        this.apiService = apiService;
    }

    setCallbacks(onStockAdded, onFilterApply, onStockSelected = null) {
        this.onStockAdded = onStockAdded;
        this.onFilterApply = onFilterApply;
        this.onStockSelected = onStockSelected;
    }

    async searchSymbols(query) {
        if (!this.apiService || query.length < 1) {
            return [];
        }

        // Cancel previous request
        if (this.abortController) {
            this.abortController.abort();
        }

        // Create new abort controller for this request
        this.abortController = new AbortController();
        const requestId = ++this.currentRequestId;

        this.isLoading = true;
        this.updateDropdown([]);
        this.showLoading();

        try {
            const results = await this.apiService.searchSymbols(query);

            // Only update if this is still the latest request
            if (requestId === this.currentRequestId) {
                this.searchResults = results;
                this.isLoading = false;
                this.updateDropdown(results);
            }
            return results;
        } catch (error) {
            // Ignore abort errors (expected when canceling)
            if (error.name !== 'AbortError' && requestId === this.currentRequestId) {
                console.error('Autocomplete search error:', error);
                this.isLoading = false;
                this.updateDropdown([]);
            }
            return [];
        }
    }

    updateDropdown(results) {
        const dropdown = document.getElementById('autocompleteDropdown');
        const searchInput = document.getElementById('stockSearch');

        if (this.isLoading) {
            return; // Loading display handled separately
        }

        if (results.length === 0) {
            const query = searchInput.value.trim();
            if (query.length > 0) {
                dropdown.innerHTML = '<div class="autocomplete-no-results">No results found</div>';
                dropdown.classList.add('show');
                searchInput.classList.add('has-results');
            } else {
                this.hideDropdown();
            }
            return;
        }

        const html = results.map((result, index) => `
            <div class="autocomplete-item" 
                 data-index="${index}"
                 onclick="autocomplete.selectItem(${index})"
                 onmouseenter="autocomplete.highlightItem(${index})">
                <div class="autocomplete-symbol">${result.symbol}</div>
                <div class="autocomplete-name">${result.name}</div>
                <div class="autocomplete-exchange">${result.exchange} • ${result.type}</div>
            </div>
        `).join('');

        dropdown.innerHTML = html;
        dropdown.classList.add('show');
        searchInput.classList.add('has-results');
        this.selectedIndex = -1;
    }

    showLoading() {
        const dropdown = document.getElementById('autocompleteDropdown');
        const searchInput = document.getElementById('stockSearch');

        dropdown.innerHTML = '<div class="autocomplete-loading">Searching...</div>';
        dropdown.classList.add('show');
        searchInput.classList.add('has-results');
    }

    hideDropdown() {
        const dropdown = document.getElementById('autocompleteDropdown');
        const searchInput = document.getElementById('stockSearch');

        dropdown.classList.remove('show');
        searchInput.classList.remove('has-results');
        this.selectedIndex = -1;
    }

    highlightItem(index) {
        const items = document.querySelectorAll('.autocomplete-item');
        items.forEach((item, i) => {
            if (i === index) {
                item.classList.add('highlighted');
                this.selectedIndex = index;
            } else {
                item.classList.remove('highlighted');
            }
        });
    }

    async selectItem(index) {
        if (index < 0 || index >= this.searchResults.length) {
            return;
        }

        // Clear blur timeout when item selected (BUG-009)
        if (this.blurTimeout) {
            clearTimeout(this.blurTimeout);
            this.blurTimeout = null;
        }

        const selected = this.searchResults[index];
        const searchInput = document.getElementById('stockSearch');

        searchInput.value = `${selected.symbol} - ${selected.name}`;
        this.hideDropdown();

        // Call callback to add stock (if provided)
        if (this.onStockAdded) {
            await this.onStockAdded(selected);
        }

        // Call callback to show stock details (if provided)
        if (this.onStockSelected) {
            await this.onStockSelected(selected);
        }

        // Apply filters
        if (this.onFilterApply) {
            this.onFilterApply();
        }

        // Focus back to input
        searchInput.blur();
    }

    handleKeydown(event) {
        const dropdown = document.getElementById('autocompleteDropdown');

        if (!dropdown.classList.contains('show')) {
            return;
        }

        switch (event.key) {
        case 'ArrowDown':
            event.preventDefault();
            this.selectedIndex = Math.min(this.selectedIndex + 1, this.searchResults.length - 1);
            this.highlightItem(this.selectedIndex);
            break;

        case 'ArrowUp':
            event.preventDefault();
            this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
            if (this.selectedIndex >= 0) {
                this.highlightItem(this.selectedIndex);
            } else {
                document.querySelectorAll('.autocomplete-item').forEach(item => {
                    item.classList.remove('highlighted');
                });
            }
            break;

        case 'Enter':
            event.preventDefault();
            if (this.selectedIndex >= 0) {
                this.selectItem(this.selectedIndex);
            }
            break;

        case 'Escape':
            event.preventDefault();
            this.hideDropdown();
            break;
        }
    }

    handleInput(value) {
        clearTimeout(this.searchTimeout);

        if (value.trim().length === 0) {
            this.hideDropdown();
            if (this.onFilterApply) {
                this.onFilterApply();
            }
            return;
        }

        // Debounce search
        this.searchTimeout = setTimeout(() => {
            this.searchSymbols(value.trim());
        }, 300);

        // Apply filters immediately for existing stocks
        if (this.onFilterApply) {
            this.onFilterApply();
        }
    }

    handleFocus() {
        const searchInput = document.getElementById('stockSearch');
        const value = searchInput.value.trim();

        if (value.length > 0 && this.searchResults.length > 0) {
            document.getElementById('autocompleteDropdown').classList.add('show');
            searchInput.classList.add('has-results');
        }
    }

    handleBlur() {
        // Clear previous timeout (BUG-009)
        if (this.blurTimeout) {
            clearTimeout(this.blurTimeout);
        }

        // Delay hiding to allow click events on dropdown items
        // Increased from 150ms to 200ms for better touch device support
        this.blurTimeout = setTimeout(() => {
            this.hideDropdown();
            this.blurTimeout = null;
        }, 200);
    }
}

// Event handlers for the search input (globally accessible for inline handlers)
window.handleSearchInput = function(value) {
    if (window.autocomplete) {
        window.autocomplete.handleInput(value);
    }
};

window.handleSearchKeydown = function(event) {
    if (window.autocomplete) {
        window.autocomplete.handleKeydown(event);
    }
};

window.handleSearchFocus = function() {
    if (window.autocomplete) {
        window.autocomplete.handleFocus();
    }
};

window.handleSearchBlur = function() {
    if (window.autocomplete) {
        window.autocomplete.handleBlur();
    }
};
