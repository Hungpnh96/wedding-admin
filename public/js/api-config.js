// API Configuration
window.API_CONFIG = {
    // Auto-detect API base URL
    getBaseUrl: function() {
        // If running on localhost, use localhost:5001
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:5001';
        }
        
        // If running on server, use same hostname with port 5001
        return window.location.protocol + '//' + window.location.hostname + ':5001';
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
