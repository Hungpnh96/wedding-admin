#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script khởi động Wedding API với SQLite Database
"""

import os
import sys
import subprocess
import signal
import time
from pathlib import Path

# Thêm thư mục api vào Python path
api_dir = Path(__file__).parent / 'api'
sys.path.insert(0, str(api_dir))

def start_server():
    """Khởi động server SQLite"""
    print("🚀 Đang khởi động Wedding API với SQLite Database...")
    print("📍 Database: SQLite")
    print("🌐 URL: http://localhost:5001")
    print("📊 Admin Panel: http://localhost:5001/admin.html")
    print("=" * 50)
    
    try:
        # Import và chạy app SQLite
        from app_sqlite import app, init_database
        
        # Khởi tạo database
        init_database()
        print("✅ Database SQLite đã được khởi tạo thành công")
        
        # Chạy server
        port = int(os.environ.get('PORT', 5001))
        app.run(host='0.0.0.0', port=port, debug=True)
        
    except KeyboardInterrupt:
        print("\n🛑 Server đã được dừng")
    except Exception as e:
        print(f"❌ Lỗi khởi động server: {e}")
        return False
    
    return True

if __name__ == '__main__':
    start_server()

