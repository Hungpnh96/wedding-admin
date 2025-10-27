// Admin API Configuration
// This ensures admin calls use the same domain as frontend
window.ADMIN_API_CONFIG = {
    // Use the current domain for API calls
    getBaseUrl: function() {
        // Use current domain (hungpnh.dev) for API calls
        return window.location.origin;
    },
    
    // Get full API URL
    getApiUrl: function(endpoint) {
        const baseUrl = this.getBaseUrl();
        return baseUrl + '/api' + (endpoint.startsWith('/') ? endpoint : '/' + endpoint);
    }
};

// Helper function for easy API calls in admin
window.adminApiCall = function(endpoint, options = {}) {
    const url = window.ADMIN_API_CONFIG.getApiUrl(endpoint);
    console.log('🔧 Admin API Call:', url);
    
    return fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });
};
