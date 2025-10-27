#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Development Server cho Wedding Admin
Chạy Flask server với hot reload và serve static files
"""

import os
import sys
from flask import Flask, send_from_directory
from flask_cors import CORS

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import main app
from api.app_sqlite import app, init_database

# Enable CORS for all routes
CORS(app, resources={
    r"/api/*": {"origins": "*"},
    r"/admin*": {"origins": "*"},
    r"/*": {"origins": "*"}
})

# Serve admin.html at root admin route
@app.route('/admin')
def admin():
    """Serve admin panel"""
    return send_from_directory('.', 'admin.html')

@app.route('/admin/')
def admin_slash():
    """Serve admin panel with trailing slash"""
    return send_from_directory('.', 'admin.html')

if __name__ == '__main__':
    # Initialize database
    init_database()
    
    # Get port from environment or default
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_ENV', 'development') == 'development'
    
    print("🚀 Starting Wedding Admin Development Server...")
    print(f"📍 Admin Panel: http://localhost:{port}/admin")
    print(f"🌐 Main Website: http://localhost:{port}/")
    print(f"🔧 API Endpoint: http://localhost:{port}/api/")
    print(f"📊 Debug Mode: {debug}")
    print("\n" + "="*50)
    
    # Run server with debug mode
    app.run(
        host='0.0.0.0', 
        port=port, 
        debug=debug,
        use_reloader=True,
        threaded=True
    )
