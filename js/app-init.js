// App Initialization and API Key Management
// Handles app startup, user mode detection, and API key modal

class AppInitializer {
    constructor(storage, onApiKeyChange) {
        this.storage = storage;
        this.onApiKeyChange = onApiKeyChange; // Callback when API key changes
    }

    // Check user mode and show appropriate banner
    initializeApp() {
        const userMode = this.storage.getUserMode();
        const apiKey = this.storage.getApiKey();

        // If no API key or mode set, redirect to landing page
        if (!apiKey || !userMode) {
            window.location.href = 'index.html';
            return;
        }

        // Show appropriate banner
        if (userMode === 'demo') {
            document.getElementById('demoBanner').style.display = 'block';
        } else if (userMode === 'full' && apiKey && apiKey !== 'demo') {
            document.getElementById('welcomeBanner').style.display = 'flex';
            document.getElementById('maskedApiKey').textContent = this.storage.getMaskedApiKey();
        }
    }

    switchToFullMode() {
        this.openApiKeyModal();
    }

    // API Key Management
    checkApiKey() {
        const apiKey = this.storage.getApiKey();
        if (!apiKey) {
            // Redirect to landing page if no API key
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    openApiKeyModal() {
        const modal = document.getElementById('apiKeyModal');
        modal.classList.add('show');
        document.getElementById('apiKeyInput').focus();
    }

    closeApiKeyModal() {
        const modal = document.getElementById('apiKeyModal');
        modal.classList.remove('show');
    }

    saveApiKey() {
        const apiKeyInput = document.getElementById('apiKeyInput');
        const apiKey = apiKeyInput.value.trim();

        if (!apiKey) {
            alert('Please enter an API key');
            return;
        }

        // Save to storage
        this.storage.setApiKey(apiKey);
        this.storage.setUserMode('full');

        // Close modal
        this.closeApiKeyModal();

        // Update banner
        document.getElementById('demoBanner').style.display = 'none';
        document.getElementById('welcomeBanner').style.display = 'flex';
        document.getElementById('maskedApiKey').textContent = this.storage.getMaskedApiKey();

        // Notify callback about API key change
        if (this.onApiKeyChange) {
            this.onApiKeyChange();
        }

        // Show success message
        alert('API key saved successfully! Loading stock data...');
    }

    useDemoMode() {
        this.storage.setApiKey('demo');
        this.storage.setUserMode('demo');
        this.closeApiKeyModal();

        // Update banner
        document.getElementById('demoBanner').style.display = 'block';
        document.getElementById('welcomeBanner').style.display = 'none';

        // Notify callback about mode change
        if (this.onApiKeyChange) {
            this.onApiKeyChange();
        }

        alert('Using demo mode. Note: Demo mode has limited functionality.');
    }

    setupEventListeners() {
        // Close modal when clicking outside
        document.addEventListener('click', (event) => {
            const modal = document.getElementById('apiKeyModal');
            if (event.target === modal) {
                // Don't close if API key is not set
                const apiKey = this.storage.getApiKey();
                if (apiKey && apiKey !== '') {
                    this.closeApiKeyModal();
                }
            }
        });

        // Handle Enter key in API key input
        document.addEventListener('DOMContentLoaded', () => {
            const apiKeyInput = document.getElementById('apiKeyInput');
            if (apiKeyInput) {
                apiKeyInput.addEventListener('keypress', (event) => {
                    if (event.key === 'Enter') {
                        this.saveApiKey();
                    }
                });
            }

            // Initialize app mode
            this.initializeApp();
        });
    }
}

// Make functions globally accessible for inline onclick handlers
window.switchToFullMode = function() {
    if (window.appInitializer) {
        window.appInitializer.switchToFullMode();
    }
};

window.openApiKeyModal = function() {
    if (window.appInitializer) {
        window.appInitializer.openApiKeyModal();
    }
};

window.closeApiKeyModal = function() {
    if (window.appInitializer) {
        window.appInitializer.closeApiKeyModal();
    }
};

window.saveApiKey = function() {
    if (window.appInitializer) {
        window.appInitializer.saveApiKey();
    }
};

window.useDemoMode = function() {
    if (window.appInitializer) {
        window.appInitializer.useDemoMode();
    }
};
