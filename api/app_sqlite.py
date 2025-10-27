#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Wedding Website API với SQLite Database
Chuyên nghiệp quản lý dữ liệu website cưới động
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
import shutil
import time
import sqlite3
from datetime import datetime
from werkzeug.utils import secure_filename
from PIL import Image
import uuid
import logging

# Cấu hình logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Cấu hình
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_FILE = os.path.join(BASE_DIR, 'data', 'wedding.db')
BACKUP_DIR = os.path.join(BASE_DIR, 'data', 'backups')
UPLOAD_DIR = os.path.join(BASE_DIR, 'public', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Tạo thư mục cần thiết
os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
os.makedirs(BACKUP_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, 'gallery'), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, 'story'), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, 'couple'), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, 'qr'), exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, 'public', 'images', 'qr'), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, 'banner'), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, 'thumbs'), exist_ok=True)

def get_db_connection():
    """Tạo kết nối database"""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    """Khởi tạo database và các bảng"""
    conn = get_db_connection()
    
    # Tạo bảng settings
    conn.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tạo bảng site_data (thay thế sections)
    conn.execute('''
        CREATE TABLE IF NOT EXISTS site_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tạo bảng uploads
    conn.execute('''
        CREATE TABLE IF NOT EXISTS uploads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            original_name TEXT,
            file_path TEXT NOT NULL,
            file_type TEXT,
            file_size INTEGER,
            upload_type TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tạo bảng backups
    conn.execute('''
        CREATE TABLE IF NOT EXISTS backups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            file_path TEXT NOT NULL,
            size INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tạo bảng payments
    conn.execute('''
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            recipient_name TEXT NOT NULL,
            bank_name TEXT NOT NULL,
            account_number TEXT NOT NULL,
            title TEXT,
            description TEXT,
            qr_code_url TEXT,
            is_active BOOLEAN DEFAULT 1,
            sort_order INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tạo dữ liệu mặc định
    default_data = {
        "meta": {
            "title": "Wedding Website",
            "description": "Our Wedding Day",
            "primaryColor": "#9f5958"
        },
        "hero": {
            "groomName": "Chú rể",
            "brideName": "Cô dâu",
            "weddingDate": "2025-01-01",
            "weddingLocation": "Việt Nam"
        },
        "admin": {
            "version": "2.0.0",
            "lastUpdate": datetime.now().isoformat()
        }
    }
    
    # Kiểm tra xem đã có dữ liệu chưa
    cursor = conn.execute('SELECT COUNT(*) FROM site_data')
    count = cursor.fetchone()[0]
    
    if count == 0:
        # Thêm dữ liệu mặc định
        for section_name, section_data in default_data.items():
            conn.execute(
                'INSERT INTO site_data (key, value) VALUES (?, ?)',
                (section_name, json.dumps(section_data, ensure_ascii=False))
            )
        
        logger.info("Đã tạo dữ liệu mặc định trong database")
    
    conn.commit()
    conn.close()
    logger.info("Database SQLite đã được khởi tạo thành công")

def allowed_file(filename):
    """Kiểm tra file có được phép upload không"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_data():
    """Load toàn bộ dữ liệu từ database"""
    conn = get_db_connection()
    cursor = conn.execute('SELECT key, value FROM site_data')
    rows = cursor.fetchall()
    conn.close()
    
    data = {}
    for row in rows:
        try:
            section_data = json.loads(row['value'])
            
            # Loại bỏ dataUrl khỏi stories để tránh làm chậm response
            if row['key'] == 'story' and isinstance(section_data, list):
                for story in section_data:
                    if isinstance(story, dict) and 'dataUrl' in story:
                        del story['dataUrl']
            
            data[row['key']] = section_data
        except json.JSONDecodeError:
            logger.error(f"Lỗi parse JSON cho section {row['key']}")
            data[row['key']] = {}
    
    # Đảm bảo chỉ có story, không có data.story
    # Nếu có data.story, merge vào story
    if 'data' in data and 'story' in data['data'] and isinstance(data['data']['story'], list):
        if 'story' in data and isinstance(data['story'], list):
            # Merge stories, ưu tiên story trực tiếp
            data['story'] = data['story'] + [s for s in data['data']['story'] if s not in data['story']]
        else:
            data['story'] = data['data']['story']
        # Xóa data.story để tránh xung đột
        if 'data' in data and 'story' in data['data']:
            del data['data']['story']
    
    return data

def save_data(data):
    """Lưu toàn bộ dữ liệu vào database"""
    try:
        # Tạo backup trước khi lưu
        create_backup()
        
        conn = get_db_connection()
        
        for section_name, section_data in data.items():
            # Cập nhật thời gian
            if section_name == 'admin':
                section_data['lastUpdate'] = datetime.now().isoformat()
            
            # Insert hoặc update section
            conn.execute(
                '''INSERT OR REPLACE INTO site_data (key, value, updated_at) 
                   VALUES (?, ?, CURRENT_TIMESTAMP)''',
                (section_name, json.dumps(section_data, ensure_ascii=False))
            )
        
        conn.commit()
        conn.close()
        
        logger.info("Dữ liệu đã được lưu thành công vào database")
        return True
    except Exception as e:
        logger.error(f"Lỗi lưu dữ liệu: {e}")
        return False

def deep_merge(target, source):
    """Deep merge hai dictionary"""
    for key, value in source.items():
        if key in target:
            if isinstance(target[key], dict) and isinstance(value, dict):
                deep_merge(target[key], value)
            else:
                target[key] = value
        else:
            target[key] = value
    return target

def create_backup():
    """Tạo backup database"""
    if os.path.exists(DB_FILE):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = os.path.join(BACKUP_DIR, f"wedding-db_{timestamp}.db")
        shutil.copy2(DB_FILE, backup_file)
        
        # Lưu thông tin backup vào database
        conn = get_db_connection()
        conn.execute(
            'INSERT INTO backups (filename, file_path, size) VALUES (?, ?, ?)',
            (os.path.basename(backup_file), backup_file, os.path.getsize(backup_file))
        )
        conn.commit()
        
        # Quản lý backup - chỉ giữ 5 bản mới nhất
        cleanup_old_backups(conn)
        
        conn.close()
        
        logger.info(f"Backup tạo tại: {backup_file}")

def cleanup_old_backups(conn):
    """Xóa các backup cũ, chỉ giữ 5 bản mới nhất"""
    try:
        # Lấy danh sách backup theo thời gian tạo (mới nhất trước)
        cursor = conn.execute('''
            SELECT id, filename, file_path 
            FROM backups 
            ORDER BY created_at DESC
        ''')
        backups = cursor.fetchall()
        
        # Nếu có nhiều hơn 5 backup, xóa các backup cũ
        if len(backups) > 5:
            backups_to_delete = backups[5:]  # Lấy từ backup thứ 6 trở đi
            
            for backup in backups_to_delete:
                backup_id, filename, file_path = backup
                
                # Xóa file backup từ disk
                if os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                        logger.info(f"Đã xóa backup file: {filename}")
                    except Exception as e:
                        logger.error(f"Lỗi xóa file backup {filename}: {e}")
                
                # Xóa record khỏi database
                conn.execute('DELETE FROM backups WHERE id = ?', (backup_id,))
                logger.info(f"Đã xóa backup record: {filename}")
            
            conn.commit()
            logger.info(f"Đã dọn dẹp {len(backups_to_delete)} backup cũ, giữ lại 5 bản mới nhất")
            
    except Exception as e:
        logger.error(f"Lỗi dọn dẹp backup: {e}")

def optimize_image(image_path, max_width=1920, quality=85):
    """Tối ưu hóa hình ảnh"""
    try:
        with Image.open(image_path) as img:
            # Chuyển đổi RGBA sang RGB nếu cần
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            
            # Resize nếu cần
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
            
            # Lưu với chất lượng tối ưu
            img.save(image_path, 'JPEG', quality=quality, optimize=True)
            logger.info(f"Đã tối ưu hình ảnh: {image_path}")
            
    except Exception as e:
        logger.error(f"Lỗi tối ưu hình ảnh {image_path}: {e}")

def create_thumbnail(image_path, thumb_path, size=(300, 300)):
    """Tạo thumbnail cho hình ảnh"""
    try:
        with Image.open(image_path) as img:
            # Chuyển đổi sang RGB nếu cần
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            
            # Tạo thumbnail với crop center
            img.thumbnail(size, Image.Resampling.LANCZOS)
            
            # Crop center square
            width, height = img.size
            if width != height:
                min_side = min(width, height)
                left = (width - min_side) / 2
                top = (height - min_side) / 2
                right = left + min_side
                bottom = top + min_side
                img = img.crop((left, top, right, bottom))
                img = img.resize(size, Image.Resampling.LANCZOS)
            
            os.makedirs(os.path.dirname(thumb_path), exist_ok=True)
            img.save(thumb_path, 'JPEG', quality=80, optimize=True)
            logger.info(f"Đã tạo thumbnail: {thumb_path}")
            
    except Exception as e:
        logger.error(f"Lỗi tạo thumbnail {image_path}: {e}")

# API Routes

@app.route('/api/data', methods=['GET'])
def get_data():
    """Lấy toàn bộ dữ liệu website"""
    try:
        data = load_data()
        return jsonify({
            "success": True,
            "data": data,
            "message": "Dữ liệu đã được tải thành công từ SQLite"
        })
    except Exception as e:
        logger.error(f"Lỗi lấy dữ liệu: {e}")
        return jsonify({
            "success": False,
            "message": f"Lỗi lấy dữ liệu: {str(e)}"
        }), 500

@app.route('/api/data', methods=['POST'])
def save_all_data():
    """Lưu toàn bộ dữ liệu website (MERGE với dữ liệu hiện có)"""
    try:
        new_data = request.json
        if not new_data:
            return jsonify({
                "success": False,
                "message": "Dữ liệu không hợp lệ"
            }), 400
        
        # Load dữ liệu hiện có
        current_data = load_data()
        
        # Merge dữ liệu mới với dữ liệu hiện có (deep merge)
        # Đặc biệt xử lý cho story section để replace hoàn toàn
        merged_data = deep_merge(current_data, new_data)
        
        # Nếu có story mới, replace hoàn toàn story cũ
        if 'story' in new_data:
            merged_data['story'] = new_data['story']
            # Đảm bảo không có data.story
            if 'data' in merged_data and 'story' in merged_data['data']:
                del merged_data['data']['story']
        
        if save_data(merged_data):
            return jsonify({
                "success": True,
                "message": "Dữ liệu đã được lưu thành công vào SQLite"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Lỗi lưu dữ liệu"
            }), 500
            
    except Exception as e:
        logger.error(f"Lỗi lưu dữ liệu: {e}")
        return jsonify({
            "success": False,
            "message": f"Lỗi lưu dữ liệu: {str(e)}"
        }), 500

@app.route('/api/data/<section>', methods=['GET'])
def get_section_data(section):
    """Lấy dữ liệu của một phần cụ thể"""
    try:
        conn = get_db_connection()
        cursor = conn.execute('SELECT value FROM site_data WHERE key = ?', (section,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            data = json.loads(row['value'])
            return jsonify({
                "success": True,
                "data": data,
                "message": f"Dữ liệu {section} đã được tải thành công"
            })
        else:
            return jsonify({
                "success": False,
                "message": f"Phần {section} không tồn tại"
            }), 404
    except Exception as e:
        logger.error(f"Lỗi lấy dữ liệu {section}: {e}")
        return jsonify({
            "success": False,
            "message": f"Lỗi lấy dữ liệu: {str(e)}"
        }), 500

@app.route('/api/data/<section>', methods=['POST'])
def update_section_data(section):
    """Cập nhật dữ liệu của một phần cụ thể"""
    try:
        section_data = request.json
        
        if not section_data:
            return jsonify({
                "success": False,
                "message": "Dữ liệu không hợp lệ"
            }), 400
        
        # Cập nhật thời gian nếu là admin section
        if section == 'admin':
            section_data['lastUpdate'] = datetime.now().isoformat()
        
        conn = get_db_connection()
        conn.execute(
            '''INSERT OR REPLACE INTO site_data (key, value, updated_at) 
               VALUES (?, ?, CURRENT_TIMESTAMP)''',
            (section, json.dumps(section_data, ensure_ascii=False))
        )
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": f"Dữ liệu {section} đã được cập nhật thành công"
        })
            
    except Exception as e:
        logger.error(f"Lỗi cập nhật {section}: {e}")
        return jsonify({
            "success": False,
            "message": f"Lỗi cập nhật dữ liệu: {str(e)}"
        }), 500

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Upload file (hình ảnh, audio, v.v.)"""
    try:
        if 'file' not in request.files:
            return jsonify({
                "success": False,
                "message": "Không có file được chọn"
            }), 400
        
        file = request.files['file']
        upload_type = request.form.get('type', 'general')  # gallery, story, couple, qr, banner, general
        
        if file.filename == '':
            return jsonify({
                "success": False,
                "message": "Không có file được chọn"
            }), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                "success": False,
                "message": "Định dạng file không được hỗ trợ"
            }), 400
        
        # Tạo tên file có ý nghĩa
        filename = secure_filename(file.filename)
        file_ext = filename.rsplit('.', 1)[1].lower()
        
        # Tạo tên file theo loại upload
        if upload_type == 'groom':
            unique_filename = f"groom_image.{file_ext}"
        elif upload_type == 'bride':
            unique_filename = f"bride_image.{file_ext}"
        elif upload_type == 'groomQR':
            unique_filename = f"groom_qr.{file_ext}"
        elif upload_type == 'brideQR':
            unique_filename = f"bride_qr.{file_ext}"
        elif upload_type == 'banner':
            timestamp = int(time.time())
            # Create more descriptive filename
            original_name = secure_filename(file.filename)
            name_without_ext = os.path.splitext(original_name)[0]
            unique_filename = f"banner_{timestamp}_{name_without_ext}.{file_ext}"
        else:
            # Cho gallery và story
            timestamp = int(time.time())
            unique_filename = f"{upload_type}_{timestamp}.{file_ext}"
        
        # Xác định thư mục upload - Tất cả ảnh đều lưu vào /public/images/
        if upload_type == 'banner':
            upload_subdir = os.path.join(BASE_DIR, 'public', 'images', 'banner')
        elif upload_type == 'gallery':
            upload_subdir = os.path.join(BASE_DIR, 'public', 'images', 'gallery')
        elif upload_type == 'story':
            upload_subdir = os.path.join(BASE_DIR, 'public', 'images', 'story')
        elif upload_type == 'couple':
            upload_subdir = os.path.join(BASE_DIR, 'public', 'images', 'couple')
        elif upload_type == 'event':
            upload_subdir = os.path.join(BASE_DIR, 'public', 'images', 'event')
        elif upload_type in ['groom', 'bride']:
            upload_subdir = os.path.join(BASE_DIR, 'public', 'images', 'couple')
        elif upload_type in ['qr', 'groomQR', 'brideQR']:
            upload_subdir = os.path.join(BASE_DIR, 'public', 'images', 'qr')
        else:
            upload_subdir = os.path.join(BASE_DIR, 'public', 'images', 'general')
        
        os.makedirs(upload_subdir, exist_ok=True)
        
        file_path = os.path.join(upload_subdir, unique_filename)
        
        # Lưu file
        file.save(file_path)
        
        # Lưu thông tin file vào database
        conn = get_db_connection()
        conn.execute(
            '''INSERT INTO uploads (filename, original_name, file_path, file_type, file_size, upload_type) 
               VALUES (?, ?, ?, ?, ?, ?)''',
            (unique_filename, file.filename, file_path, file_ext, os.path.getsize(file_path), upload_type)
        )
        conn.commit()
        conn.close()
        
        # Tối ưu hình ảnh
        if file_ext in ['jpg', 'jpeg', 'png', 'webp']:
            optimize_image(file_path)
            
            # Tạo thumbnail cho gallery
            if upload_type == 'gallery':
                thumb_dir = os.path.join(BASE_DIR, 'public', 'images', 'thumbs')
                os.makedirs(thumb_dir, exist_ok=True)
                thumb_path = os.path.join(thumb_dir, unique_filename)
                create_thumbnail(file_path, thumb_path)
        
        # Trả về đường dẫn file - Tất cả ảnh đều trong /public/images/
        if upload_type == 'banner':
            relative_path = f"./public/images/banner/{unique_filename}"
        elif upload_type == 'gallery':
            relative_path = f"./public/images/gallery/{unique_filename}"
        elif upload_type == 'story':
            relative_path = f"./public/images/story/{unique_filename}"
        elif upload_type == 'couple':
            relative_path = f"./public/images/couple/{unique_filename}"
        elif upload_type == 'event':
            relative_path = f"./public/images/event/{unique_filename}"
        elif upload_type in ['groom', 'bride']:
            relative_path = f"./public/images/couple/{unique_filename}"
        elif upload_type in ['qr', 'groomQR', 'brideQR']:
            relative_path = f"./public/images/qr/{unique_filename}"
        else:
            relative_path = f"./public/images/general/{unique_filename}"
        
        return jsonify({
            "success": True,
            "message": "File đã được upload thành công",
            "url": relative_path,
            "data": {
                "filename": unique_filename,
                "path": relative_path,
                "type": upload_type,
                "size": os.path.getsize(file_path)
            }
        })
        
    except Exception as e:
        logger.error(f"Lỗi upload file: {e}")
        return jsonify({
            "success": False,
            "message": f"Lỗi upload file: {str(e)}"
        }), 500

@app.route('/api/backups', methods=['GET'])
def list_backups():
    """Liệt kê các file backup"""
    try:
        conn = get_db_connection()
        cursor = conn.execute('SELECT filename, created_at, size FROM backups ORDER BY created_at DESC')
        backups = []
        for row in cursor.fetchall():
            backups.append({
                "filename": row['filename'],
                "created": row['created_at'],
                "size": row['size']
            })
        conn.close()
        
        return jsonify({
            "success": True,
            "data": backups,
            "message": f"Tìm thấy {len(backups)} backup"
        })
        
    except Exception as e:
        logger.error(f"Lỗi liệt kê backup: {e}")
        return jsonify({
            "success": False,
            "message": f"Lỗi liệt kê backup: {str(e)}"
        }), 500

@app.route('/api/backup/restore/<filename>', methods=['POST'])
def restore_backup(filename):
    """Khôi phục từ file backup"""
    try:
        backup_file = os.path.join(BACKUP_DIR, filename)
        
        if not os.path.exists(backup_file):
            return jsonify({
                "success": False,
                "message": "File backup không tồn tại"
            }), 404
        
        # Tạo backup hiện tại trước khi restore
        create_backup()
        
        # Copy backup file thành file chính
        shutil.copy2(backup_file, DB_FILE)
        
        return jsonify({
            "success": True,
            "message": f"Đã khôi phục từ backup {filename}"
        })
        
    except Exception as e:
        logger.error(f"Lỗi khôi phục backup: {e}")
        return jsonify({
            "success": False,
            "message": f"Lỗi khôi phục backup: {str(e)}"
        }), 500

@app.route('/api/backup/cleanup', methods=['POST'])
def cleanup_backups():
    """Dọn dẹp backup cũ, chỉ giữ 5 bản mới nhất"""
    try:
        conn = get_db_connection()
        cleanup_old_backups(conn)
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Đã dọn dẹp backup cũ, giữ lại 5 bản mới nhất"
        })
        
    except Exception as e:
        logger.error(f"Lỗi dọn dẹp backup: {e}")
        return jsonify({
            "success": False,
            "message": f"Lỗi dọn dẹp backup: {str(e)}"
        }), 500

@app.route('/api/backup/stats', methods=['GET'])
def backup_stats():
    """Thống kê backup"""
    try:
        conn = get_db_connection()
        
        # Đếm tổng số backup
        cursor = conn.execute('SELECT COUNT(*) as total FROM backups')
        total_backups = cursor.fetchone()['total']
        
        # Lấy thông tin backup mới nhất
        cursor = conn.execute('''
            SELECT filename, created_at, size 
            FROM backups 
            ORDER BY created_at DESC 
            LIMIT 5
        ''')
        recent_backups = []
        for row in cursor.fetchall():
            recent_backups.append({
                "filename": row['filename'],
                "created": row['created_at'],
                "size": row['size']
            })
        
        # Tính tổng dung lượng backup
        cursor = conn.execute('SELECT SUM(size) as total_size FROM backups')
        total_size = cursor.fetchone()['total_size'] or 0
        
        conn.close()
        
        return jsonify({
            "success": True,
            "data": {
                "total_backups": total_backups,
                "total_size": total_size,
                "recent_backups": recent_backups,
                "max_backups": 5
            },
            "message": f"Có {total_backups} backup, tổng dung lượng: {total_size / 1024 / 1024:.2f} MB"
        })
        
    except Exception as e:
        logger.error(f"Lỗi thống kê backup: {e}")
        return jsonify({
            "success": False,
            "message": f"Lỗi thống kê backup: {str(e)}"
        }), 500


@app.route('/api/export', methods=['GET'])
def export_data():
    """Xuất dữ liệu ra file JSON"""
    try:
        data = load_data()
        return jsonify(data)
    except Exception as e:
        logger.error(f"Lỗi xuất dữ liệu: {e}")
        return jsonify({
            "success": False,
            "message": f"Lỗi xuất dữ liệu: {str(e)}"
        }), 500

@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    """Upload image file"""
    try:
        if 'file' not in request.files:
            return jsonify({
                "success": False,
                "message": "Không có file được tải lên"
            }), 400
        
        file = request.files['file']
        file_type = request.form.get('type', 'general')
        
        if file.filename == '':
            return jsonify({
                "success": False,
                "message": "Không có file được chọn"
            }), 400
        
        # Validate file type
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
        if not ('.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
            return jsonify({
                "success": False,
                "message": "Định dạng file không được hỗ trợ. Chỉ chấp nhận PNG, JPG, JPEG, GIF, WebP"
            }), 400
        
        # Generate unique filename
        timestamp = int(time.time() * 1000)
        filename = f"{timestamp}_{file.filename}"
        
        # Determine upload directory based on type
        if file_type == 'story':
            upload_dir = os.path.join(BASE_DIR, 'public', 'images', 'story')
        elif file_type == 'gallery':
            upload_dir = os.path.join(BASE_DIR, 'public', 'images', 'gallery')
        elif file_type == 'couple':
            upload_dir = os.path.join(BASE_DIR, 'public', 'images', 'couple')
        elif file_type == 'event':
            upload_dir = os.path.join(BASE_DIR, 'public', 'images', 'event')
        else:
            upload_dir = os.path.join(BASE_DIR, 'public', 'images', 'general')
        
        # Create directory if not exists
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save file
        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)
        
        # Generate URL
        file_url = f"/public/images/{file_type}/{filename}"
        
        logger.info(f"Image uploaded successfully: {file_url}")
        
        return jsonify({
            "success": True,
            "message": "Tải ảnh lên thành công",
            "url": file_url,
            "filename": filename
        })
        
    except Exception as e:
        logger.error(f"Error uploading image: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Lỗi khi tải ảnh lên: {str(e)}"
        }), 500

@app.route('/api/delete-image', methods=['POST'])
def delete_image():
    """Delete an image file"""
    try:
        data = request.json
        image_url = data.get('imageUrl')
        
        if not image_url:
            return jsonify({
                "success": False,
                "message": "Không có URL ảnh được cung cấp"
            }), 400
        
        # Convert URL to file path
        if image_url.startswith('/public/images/'):
            file_path = os.path.join(BASE_DIR, image_url[1:])  # Remove leading /
        elif image_url.startswith('./public/images/'):
            file_path = os.path.join(BASE_DIR, image_url[2:])  # Remove ./
        else:
            file_path = os.path.join(BASE_DIR, 'public', 'images', os.path.basename(image_url))
        
        # Check if file exists
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Image deleted: {file_path}")
            
            return jsonify({
                "success": True,
                "message": "Ảnh đã được xóa thành công"
            })
        else:
            return jsonify({
                "success": False,
                "message": "File không tồn tại"
            }), 404
            
    except Exception as e:
        logger.error(f"Error deleting image: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Lỗi khi xóa ảnh: {str(e)}"
        }), 500

@app.route('/api/list-files', methods=['GET'])
def list_files():
    """List files in a directory"""
    try:
        file_type = request.args.get('type', 'general')
        
        # Xác định thư mục dựa trên loại
        if file_type == 'story':
            directory = os.path.join(BASE_DIR, 'public', 'images', 'story')
        elif file_type == 'gallery':
            directory = os.path.join(BASE_DIR, 'public', 'images', 'gallery')
        elif file_type == 'couple':
            directory = os.path.join(BASE_DIR, 'public', 'images', 'couple')
        elif file_type == 'banner':
            directory = os.path.join(BASE_DIR, 'public', 'images', 'banner')
        elif file_type == 'qr':
            directory = os.path.join(BASE_DIR, 'public', 'images', 'qr')
        else:
            directory = os.path.join(BASE_DIR, 'public', 'images', 'general')
        
        # Kiểm tra thư mục có tồn tại không
        if not os.path.exists(directory):
            return jsonify({
                "success": True,
                "files": []
            })
        
        # Lấy danh sách file
        files = []
        for filename in os.listdir(directory):
            file_path = os.path.join(directory, filename)
            if os.path.isfile(file_path):
                files.append(filename)
        
        return jsonify({
            "success": True,
            "files": files
        })
        
    except Exception as e:
        logger.error(f"Lỗi list files: {e}")
        return jsonify({
            "success": False,
            "message": f"Lỗi list files: {str(e)}"
        }), 500

@app.route('/api/delete-file', methods=['POST'])
def delete_file():
    """Xóa file ảnh"""
    try:
        data = request.json
        filename = data.get('filename')
        file_type = data.get('type', 'general')
        
        if not filename:
            return jsonify({
                "success": False,
                "message": "Tên file không được cung cấp"
            }), 400
        
        # Xác định đường dẫn file dựa trên loại
        if file_type == 'story':
            file_path = os.path.join(BASE_DIR, 'public', 'images', 'story', filename)
        elif file_type == 'gallery':
            file_path = os.path.join(BASE_DIR, 'public', 'images', 'gallery', filename)
        elif file_type == 'couple':
            file_path = os.path.join(BASE_DIR, 'public', 'images', 'couple', filename)
        elif file_type == 'banner':
            file_path = os.path.join(BASE_DIR, 'public', 'images', 'banner', filename)
        elif file_type == 'qr':
            file_path = os.path.join(BASE_DIR, 'public', 'images', 'qr', filename)
        else:
            file_path = os.path.join(BASE_DIR, 'public', 'images', 'general', filename)
        
        # Kiểm tra file có tồn tại không
        if not os.path.exists(file_path):
            logger.warning(f"File không tồn tại: {file_path}")
            return jsonify({
                "success": True,
                "message": "File đã được xóa hoặc không tồn tại"
            })
        
        # Xóa file
        os.remove(file_path)
        logger.info(f"Đã xóa file: {file_path}")
        
        # Xóa record trong database
        conn = get_db_connection()
        conn.execute('DELETE FROM uploads WHERE filename = ? AND upload_type = ?', (filename, file_type))
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "File đã được xóa thành công"
        })
        
    except Exception as e:
        logger.error(f"Lỗi xóa file: {e}")
        return jsonify({
            "success": False,
            "message": f"Lỗi xóa file: {str(e)}"
        }), 500

@app.route('/api/import', methods=['POST'])
def import_data():
    """Nhập dữ liệu từ file JSON"""
    try:
        if 'file' not in request.files:
            return jsonify({
                "success": False,
                "message": "Không có file được chọn"
            }), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({
                "success": False,
                "message": "Không có file được chọn"
            }), 400
        
        if not file.filename.endswith('.json'):
            return jsonify({
                "success": False,
                "message": "File phải có định dạng JSON"
            }), 400
        
        # Đọc và parse JSON
        content = file.read().decode('utf-8')
        data = json.loads(content)
        
        # Tạo backup trước khi import
        create_backup()
        
        # Lưu dữ liệu mới
        if save_data(data):
            return jsonify({
                "success": True,
                "message": "Dữ liệu đã được import thành công"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Lỗi lưu dữ liệu sau khi import"
            }), 500
            
    except json.JSONDecodeError:
        return jsonify({
            "success": False,
            "message": "File JSON không hợp lệ"
        }), 400
    except Exception as e:
        logger.error(f"Lỗi import dữ liệu: {e}")
        return jsonify({
            "success": False,
            "message": f"Lỗi import dữ liệu: {str(e)}"
        }), 500

# Static file serving
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    """Serve uploaded files"""
    return send_from_directory(UPLOAD_DIR, filename)

@app.route('/admin/<path:filename>')
def admin_files(filename):
    """Serve admin files (CSS, JS, etc.)"""
    admin_dir = os.path.join(BASE_DIR, 'admin')
    return send_from_directory(admin_dir, filename)

@app.route('/index_files/<path:filename>')
def index_files(filename):
    """Serve index_files (CSS, JS, etc.)"""
    index_files_dir = os.path.join(BASE_DIR, 'index_files')
    return send_from_directory(index_files_dir, filename)

@app.route('/')
def index():
    """Serve main website"""
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    """Serve static files"""
    return send_from_directory(BASE_DIR, filename)

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "success": True,
        "message": "Wedding API với SQLite đang chạy",
        "version": "2.0.0",
        "database": "SQLite",
        "timestamp": datetime.now().isoformat()
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "message": "API endpoint không tồn tại"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "message": "Lỗi server nội bộ"
    }), 500

if __name__ == '__main__':
    # Khởi tạo database
    init_database()
    
# ==================== BLESSING SYSTEM ====================

@app.route('/api/blessing/send', methods=['POST'])
def send_blessing():
    """Gửi lời chúc và lưu vào database"""
    try:
        data = request.get_json()
        
        # Validate input
        required_fields = ['name', 'from', 'content']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'Trường {field} là bắt buộc'
                }), 400
        
        # Lưu vào database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Tạo bảng blessings nếu chưa có
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS blessings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                from_person TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_approved BOOLEAN DEFAULT 1
            )
        ''')
        
        # Insert blessing
        cursor.execute('''
            INSERT INTO blessings (name, from_person, content)
            VALUES (?, ?, ?)
        ''', (data['name'], data['from'], data['content']))
        
        blessing_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # Gửi thông báo Telegram
        try:
            send_telegram_notification(data)
        except Exception as e:
            logger.error(f"Telegram notification failed: {e}")
        
        return jsonify({
            'success': True,
            'message': 'Lời chúc đã được gửi thành công!',
            'blessing_id': blessing_id
        })
        
    except Exception as e:
        logger.error(f"Error sending blessing: {e}")
        return jsonify({
            'success': False,
            'message': 'Có lỗi xảy ra khi gửi lời chúc'
        }), 500

@app.route('/api/blessing/latest', methods=['GET'])
def get_latest_blessings():
    """Lấy 5 lời chúc mới nhất"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, name, from_person, content, created_at
            FROM blessings 
            WHERE is_approved = 1
            ORDER BY created_at DESC 
            LIMIT 5
        ''')
        
        blessings = cursor.fetchall()
        conn.close()
        
        result = []
        for blessing in blessings:
            result.append({
                'id': blessing['id'],
                'name': blessing['name'],
                'from': blessing['from_person'],
                'content': blessing['content'],
                'created_at': blessing['created_at']
            })
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        logger.error(f"Error getting latest blessings: {e}")
        return jsonify({
            'success': False,
            'message': 'Có lỗi xảy ra khi lấy lời chúc'
        }), 500

@app.route('/api/blessing/admin/list', methods=['GET'])
def get_blessings_admin():
    """Lấy danh sách lời chúc cho admin với paging và filter"""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        search = request.args.get('search', '')
        approved = request.args.get('approved', '')
        
        offset = (page - 1) * per_page
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Build query
        where_conditions = []
        params = []
        
        if search:
            where_conditions.append("(name LIKE ? OR content LIKE ?)")
            params.extend([f'%{search}%', f'%{search}%'])
        
        if approved != '':
            where_conditions.append("is_approved = ?")
            params.append(approved == 'true')
        
        where_clause = "WHERE " + " AND ".join(where_conditions) if where_conditions else ""
        
        # Count total
        count_query = f"SELECT COUNT(*) FROM blessings {where_clause}"
        cursor.execute(count_query, params)
        total = cursor.fetchone()[0]
        
        # Get blessings
        query = f'''
            SELECT id, name, from_person, content, created_at, is_approved
            FROM blessings 
            {where_clause}
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        '''
        cursor.execute(query, params + [per_page, offset])
        blessings = cursor.fetchall()
        conn.close()
        
        result = []
        for blessing in blessings:
            result.append({
                'id': blessing['id'],
                'name': blessing['name'],
                'from': blessing['from_person'],
                'content': blessing['content'],
                'created_at': blessing['created_at'],
                'is_approved': bool(blessing['is_approved'])
            })
        
        return jsonify({
            'success': True,
            'data': result,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'total_pages': (total + per_page - 1) // per_page
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting blessings for admin: {e}")
        return jsonify({
            'success': False,
            'message': 'Có lỗi xảy ra khi lấy danh sách lời chúc'
        }), 500

@app.route('/api/blessing/admin/<int:blessing_id>/approve', methods=['POST'])
def approve_blessing(blessing_id):
    """Duyệt/không duyệt lời chúc"""
    try:
        data = request.get_json()
        is_approved = data.get('approved', True)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE blessings 
            SET is_approved = ? 
            WHERE id = ?
        ''', (is_approved, blessing_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': f'Lời chúc đã được {"duyệt" if is_approved else "từ chối"}'
        })
        
    except Exception as e:
        logger.error(f"Error approving blessing: {e}")
        return jsonify({
            'success': False,
            'message': 'Có lỗi xảy ra khi duyệt lời chúc'
        }), 500

@app.route('/api/blessing/admin/<int:blessing_id>', methods=['DELETE'])
def delete_blessing(blessing_id):
    """Xóa lời chúc"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM blessings WHERE id = ?', (blessing_id,))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Lời chúc đã được xóa'
        })
        
    except Exception as e:
        logger.error(f"Error deleting blessing: {e}")
        return jsonify({
            'success': False,
            'message': 'Có lỗi xảy ra khi xóa lời chúc'
        }), 500

# ==================== TELEGRAM CONFIG ====================

@app.route('/api/telegram/config', methods=['GET'])
def get_telegram_config():
    """Lấy cấu hình Telegram"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Tạo bảng telegram_config nếu chưa có
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS telegram_config (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                bot_token TEXT,
                chat_id TEXT,
                enabled BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('SELECT * FROM telegram_config ORDER BY id DESC LIMIT 1')
        config = cursor.fetchone()
        conn.close()
        
        if config:
            return jsonify({
                'success': True,
                'data': {
                    'bot_token': config['bot_token'] or '',
                    'chat_id': config['chat_id'] or '',
                    'enabled': bool(config['enabled'])
                }
            })
        else:
            return jsonify({
                'success': True,
                'data': {
                    'bot_token': '',
                    'chat_id': '',
                    'enabled': False
                }
            })
            
    except Exception as e:
        logger.error(f"Error getting telegram config: {e}")
        return jsonify({
            'success': False,
            'message': 'Có lỗi xảy ra khi lấy cấu hình Telegram'
        }), 500

@app.route('/api/telegram/config', methods=['POST'])
def save_telegram_config():
    """Lưu cấu hình Telegram"""
    try:
        data = request.get_json()
        
        bot_token = data.get('bot_token', '')
        chat_id = data.get('chat_id', '')
        enabled = data.get('enabled', False)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Tạo bảng telegram_config nếu chưa có
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS telegram_config (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                bot_token TEXT,
                chat_id TEXT,
                enabled BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Insert hoặc update config
        cursor.execute('''
            INSERT OR REPLACE INTO telegram_config (id, bot_token, chat_id, enabled, updated_at)
            VALUES (1, ?, ?, ?, CURRENT_TIMESTAMP)
        ''', (bot_token, chat_id, enabled))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Cấu hình Telegram đã được lưu'
        })
        
    except Exception as e:
        logger.error(f"Error saving telegram config: {e}")
        return jsonify({
            'success': False,
            'message': 'Có lỗi xảy ra khi lưu cấu hình Telegram'
        }), 500

def send_telegram_notification(blessing_data):
    """Gửi thông báo qua Telegram"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Lấy cấu hình Telegram
        cursor.execute('SELECT * FROM telegram_config WHERE enabled = 1 ORDER BY id DESC LIMIT 1')
        config = cursor.fetchone()
        conn.close()
        
        if not config or not config['bot_token'] or not config['chat_id']:
            logger.info("Telegram not configured or disabled")
            return
        
        import requests
        
        bot_token = config['bot_token']
        chat_id = config['chat_id']
        
        message = f"""
🎉 **Lời chúc mới từ {blessing_data['name']}**

👤 **Người gửi:** {blessing_data['name']}
👥 **Quan hệ:** {blessing_data['from']}
💬 **Lời chúc:** {blessing_data['content']}

⏰ **Thời gian:** {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
        """
        
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        data = {
            'chat_id': chat_id,
            'text': message,
            'parse_mode': 'Markdown'
        }
        
        response = requests.post(url, data=data, timeout=10)
        
        if response.status_code == 200:
            logger.info("Telegram notification sent successfully")
        else:
            logger.error(f"Telegram notification failed: {response.text}")
            
    except Exception as e:
        logger.error(f"Error sending telegram notification: {e}")

# =============================================================================
# PAYMENT MANAGEMENT API ENDPOINTS
# =============================================================================

def save_qr_code_file(file):
    """Lưu file QR code được upload"""
    try:
        if file and allowed_file(file.filename):
            # Tạo tên file unique
            filename = f"qr_{int(time.time())}_{uuid.uuid4().hex[:8]}.{file.filename.rsplit('.', 1)[1].lower()}"
            filepath = os.path.join(BASE_DIR, 'public', 'images', 'qr', filename)
            
            # Lưu file
            file.save(filepath)
            
            return f"/public/images/qr/{filename}"
        return None
    except Exception as e:
        logger.error(f"Error saving QR code file: {e}")
        return None

def delete_qr_code(qr_url):
    """Xóa file QR code cũ"""
    try:
        if qr_url and (qr_url.startswith('/public/uploads/qr/') or qr_url.startswith('/public/images/qr/')):
            filename = os.path.basename(qr_url)
            
            # Try both locations
            old_path = os.path.join(UPLOAD_DIR, 'qr', filename)
            new_path = os.path.join(BASE_DIR, 'public', 'images', 'qr', filename)
            
            if os.path.exists(old_path):
                os.remove(old_path)
                logger.info(f"Deleted old QR code file: {old_path}")
            elif os.path.exists(new_path):
                os.remove(new_path)
                logger.info(f"Deleted QR code file: {new_path}")
    except Exception as e:
        logger.error(f"Error deleting QR code: {e}")

@app.route('/api/payment/list', methods=['GET'])
def get_payments():
    """Lấy danh sách thông tin chuyển khoản"""
    try:
        conn = get_db_connection()
        payments = conn.execute(
            'SELECT * FROM payments ORDER BY sort_order ASC, created_at DESC'
        ).fetchall()
        conn.close()
        
        return jsonify({
            'success': True,
            'data': [dict(payment) for payment in payments]
        })
    except Exception as e:
        logger.error(f"Error getting payments: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/payment', methods=['POST'])
def create_payment():
    """Tạo thông tin chuyển khoản mới"""
    try:
        # Handle both JSON and form data
        if request.is_json:
            data = request.get_json()
            qr_url = data.get('qr_code_url', '')
        else:
            # Handle form data with file upload
            data = {
                'recipient_name': request.form.get('recipient_name'),
                'bank_name': request.form.get('bank_name'),
                'account_number': request.form.get('account_number'),
                'title': request.form.get('title', ''),
                'description': request.form.get('description', ''),
                'is_active': request.form.get('is_active') == 'true',
                'sort_order': int(request.form.get('sort_order', 1))
            }
            
            # Handle QR code file upload
            qr_file = request.files.get('qr_code_file')
            if qr_file and qr_file.filename:
                qr_url = save_qr_code_file(qr_file)
                if not qr_url:
                    return jsonify({
                        'success': False,
                        'message': 'Không thể lưu file QR code'
                    }), 500
            else:
                qr_url = ''
        
        # Validate required fields
        required_fields = ['recipient_name', 'bank_name', 'account_number']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'Trường {field} là bắt buộc'
                }), 400
        
        # Insert into database
        conn = get_db_connection()
        conn.execute('''
            INSERT INTO payments (recipient_name, bank_name, account_number, title, description, qr_code_url, is_active, sort_order, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['recipient_name'],
            data['bank_name'],
            data['account_number'],
            data.get('title', ''),
            data.get('description', ''),
            qr_url,
            data.get('is_active', True),
            data.get('sort_order', 1),
            datetime.now().isoformat(),
            datetime.now().isoformat()
        ))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Thông tin chuyển khoản đã được tạo thành công'
        })
    except Exception as e:
        logger.error(f"Error creating payment: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/payment/<int:payment_id>', methods=['PUT'])
def update_payment(payment_id):
    """Cập nhật thông tin chuyển khoản"""
    try:
        # Get existing payment
        conn = get_db_connection()
        existing = conn.execute(
            'SELECT * FROM payments WHERE id = ?', (payment_id,)
        ).fetchone()
        
        if not existing:
            conn.close()
            return jsonify({
                'success': False,
                'message': 'Không tìm thấy thông tin chuyển khoản'
            }), 404
        
        # Handle both JSON and form data
        if request.is_json:
            data = request.get_json()
            new_qr_url = data.get('qr_code_url', existing['qr_code_url'])
        else:
            # Handle form data with file upload
            data = {
                'recipient_name': request.form.get('recipient_name'),
                'bank_name': request.form.get('bank_name'),
                'account_number': request.form.get('account_number'),
                'title': request.form.get('title', ''),
                'description': request.form.get('description', ''),
                'is_active': request.form.get('is_active') == 'true',
                'sort_order': int(request.form.get('sort_order', 1))
            }
            
            # Handle QR code file upload
            qr_file = request.files.get('qr_code_file')
            if qr_file and qr_file.filename:
                # Delete old QR code if exists
                delete_qr_code(existing['qr_code_url'])
                
                # Save new QR code
                new_qr_url = save_qr_code_file(qr_file)
                if not new_qr_url:
                    conn.close()
                    return jsonify({
                        'success': False,
                        'message': 'Không thể lưu file QR code mới'
                    }), 500
            else:
                new_qr_url = existing['qr_code_url']
        
        # Update database
        conn.execute('''
            UPDATE payments SET 
                recipient_name = ?, bank_name = ?, account_number = ?, 
                title = ?, description = ?, qr_code_url = ?, 
                is_active = ?, sort_order = ?, updated_at = ?
            WHERE id = ?
        ''', (
            data['recipient_name'],
            data['bank_name'],
            data['account_number'],
            data.get('title', ''),
            data.get('description', ''),
            new_qr_url,
            data.get('is_active', True),
            data.get('sort_order', 1),
            datetime.now().isoformat(),
            payment_id
        ))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Thông tin chuyển khoản đã được cập nhật thành công'
        })
    except Exception as e:
        logger.error(f"Error updating payment: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/payment/<int:payment_id>', methods=['DELETE'])
def delete_payment(payment_id):
    """Xóa thông tin chuyển khoản"""
    try:
        conn = get_db_connection()
        
        # Get payment info for QR code deletion
        payment = conn.execute(
            'SELECT * FROM payments WHERE id = ?', (payment_id,)
        ).fetchone()
        
        if not payment:
            conn.close()
            return jsonify({
                'success': False,
                'message': 'Không tìm thấy thông tin chuyển khoản'
            }), 404
        
        # Delete QR code file
        delete_qr_code(payment['qr_code_url'])
        
        # Delete from database
        conn.execute('DELETE FROM payments WHERE id = ?', (payment_id,))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Thông tin chuyển khoản đã được xóa thành công'
        })
    except Exception as e:
        logger.error(f"Error deleting payment: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/payment/global-message', methods=['GET'])
def get_global_message():
    """Lấy thông điệp chung"""
    try:
        conn = get_db_connection()
        setting = conn.execute(
            'SELECT value FROM settings WHERE key = ?', ('payment_global_message',)
        ).fetchone()
        conn.close()
        
        message = setting['value'] if setting else ''
        
        return jsonify({
            'success': True,
            'data': {'message': message}
        })
    except Exception as e:
        logger.error(f"Error getting global message: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/payment/global-message', methods=['POST'])
def save_global_message():
    """Lưu thông điệp chung"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        
        conn = get_db_connection()
        conn.execute('''
            INSERT OR REPLACE INTO settings (key, value, updated_at)
            VALUES (?, ?, ?)
        ''', ('payment_global_message', message, datetime.now().isoformat()))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Thông điệp chung đã được lưu thành công'
        })
    except Exception as e:
        logger.error(f"Error saving global message: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/payment/frontend', methods=['GET'])
def get_payment_frontend():
    """Lấy thông tin chuyển khoản cho frontend"""
    try:
        conn = get_db_connection()
        
        # Lấy thông điệp chung
        setting = conn.execute(
            'SELECT value FROM settings WHERE key = ?', ('payment_global_message',)
        ).fetchone()
        global_message = setting['value'] if setting else ''
        
        # Lấy danh sách payment đang active
        payments = conn.execute(
            'SELECT * FROM payments WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC'
        ).fetchall()
        conn.close()
        
        # Xử lý QR code URL
        processed_payments = []
        for payment in payments:
            payment_dict = dict(payment)
            
            # Nếu không có QR code từ upload, sử dụng QR mặc định
            if not payment_dict['qr_code_url']:
                # Sử dụng QR mặc định dựa trên sort_order hoặc id
                if payment_dict['sort_order'] == 1 or payment_dict['id'] % 2 == 1:
                    payment_dict['qr_code_url'] = '/public/images/default/qr/qr_man.webp'
                else:
                    payment_dict['qr_code_url'] = '/public/images/default/qr/qr_woman.webp'
            
            processed_payments.append(payment_dict)
        
        return jsonify({
            'success': True,
            'data': {
                'global_message': global_message,
                'payments': processed_payments
            }
        })
    except Exception as e:
        logger.error(f"Error getting payment frontend data: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/couple/info', methods=['GET'])
def get_couple_info():
    """Lấy thông tin couple cho footer"""
    try:
        conn = get_db_connection()
        
        # Lấy thông tin couple từ settings
        groom_name_setting = conn.execute(
            'SELECT value FROM settings WHERE key = ?', ('groom_name',)
        ).fetchone()
        bride_name_setting = conn.execute(
            'SELECT value FROM settings WHERE key = ?', ('bride_name',)
        ).fetchone()
        wedding_date_setting = conn.execute(
            'SELECT value FROM settings WHERE key = ?', ('wedding_date',)
        ).fetchone()
        contact_email_setting = conn.execute(
            'SELECT value FROM settings WHERE key = ?', ('contact_email',)
        ).fetchone()
        
        conn.close()
        
        # Xử lý data
        groom_name = groom_name_setting['value'] if groom_name_setting else 'Huy Hùng'
        bride_name = bride_name_setting['value'] if bride_name_setting else 'Ngọc Trâm'
        wedding_date = wedding_date_setting['value'] if wedding_date_setting else ''
        contact_email = contact_email_setting['value'] if contact_email_setting else 'hungpnh96@gmail.com'
        
        return jsonify({
            'success': True,
            'data': {
                'groom_name': groom_name,
                'bride_name': bride_name,
                'wedding_date': wedding_date,
                'contact_email': contact_email
            }
        })
    except Exception as e:
        logger.error(f"Error getting couple info: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

if __name__ == '__main__':
    # Khởi tạo database
    init_database()
    
    # Lấy port từ environment variable hoặc mặc định
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_ENV', 'development') == 'development'
    
    logger.info(f"🚀 Khởi động Wedding API với SQLite Database...")
    logger.info(f"📍 Database: SQLite ({DB_FILE})")
    logger.info(f"🌐 URL: http://0.0.0.0:{port}")
    logger.info(f"📊 Admin Panel: http://0.0.0.0:{port}/admin.html")
    logger.info(f"🔧 Debug Mode: {debug}")
    
    # Chạy server
    app.run(host='0.0.0.0', port=port, debug=debug)
