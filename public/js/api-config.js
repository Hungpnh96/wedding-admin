// API Configuration
// This ensures both admin and frontend call the same localhost:5001 API
window.API_CONFIG = {
    // Always use localhost:5001 for API calls (same as admin)
    // Even when frontend is deployed on https://hungpnh.dev
    getBaseUrl: function() {
        // Always use localhost:5001 regardless of current domain
        return 'http://localhost:5001';
    },
    
    // Get full API URL
    getApiUrl: function(endpoint) {
        const baseUrl = this.getBaseUrl();
        return baseUrl + '/api' + (endpoint.startsWith('/') ? endpoint : '/' + endpoint);
    }
};

// Helper function for easy API calls
window.apiCall = function(endpoint, options = {}) {
    const url = window.API_CONFIG.getApiUrl(endpoint);
    console.log('🌐 API Call:', url);
    
    return fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });
};
