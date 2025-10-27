/**
 * Wedding Admin API Client
 * Chuyên nghiệp giao tiếp với backend API
 */

class WeddingAdminAPI {
    constructor() {
        // Tự động detect base URL dựa trên current location
        this.baseURL = this.getBaseURL();
        this.headers = {
            'Content-Type': 'application/json'
        };
    }

    getBaseURL() {
        // Nếu đang chạy từ file:// thì dùng localhost
        if (window.location.protocol === 'file:') {
            return 'http://localhost:5001/api';
        }
        
        // Nếu đang chạy từ web server thì dùng relative path
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const port = window.location.port;
        
        // Nếu có port cụ thể (development)
        if (port && port !== '80' && port !== '443') {
            return `${protocol}//${hostname}:${port}/api`;
        }
        
        // Production hoặc default port
        return `${protocol}//${hostname}/api`;
    }

    // Utility methods
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.headers,
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    }

    // Data management
    async getData() {
        return this.request('/data');
    }

    async loadData() {
        return this.getData();
    }

    async saveData(data) {
        return this.request('/data', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async getSection(section) {
        return this.request(`/data/${section}`);
    }

    async updateSection(section, data) {
        return this.request(`/data/${section}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // File upload
    async uploadFile(file, type = 'general') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        return this.request('/upload', {
            method: 'POST',
            headers: {}, // Remove Content-Type for FormData
            body: formData
        });
    }

    async uploadMultipleFiles(files, type = 'gallery') {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        formData.append('type', type);

        return this.request('/upload/multiple', {
            method: 'POST',
            headers: {},
            body: formData
        });
    }

    // Backup & Restore
    async listBackups() {
        return this.request('/backups');
    }

    async restoreBackup(filename) {
        return this.request(`/backup/restore/${filename}`, {
            method: 'POST'
        });
    }

    // Import/Export
    async exportData() {
        return this.request('/export');
    }

    async importData(file) {
        const formData = new FormData();
        formData.append('file', file);

        return this.request('/import', {
            method: 'POST',
            headers: {},
            body: formData
        });
    }

    // Health check
    async healthCheck() {
        return this.request('/health');
    }
}

// Global instance
window.weddingAPI = new WeddingAdminAPI();
