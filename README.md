# 💒 Wedding Website Admin System

Hệ thống quản lý website cưới chuyên nghiệp với admin panel động, cho phép người dùng không biết code vẫn có thể tùy chỉnh website theo sở thích.

## ✨ Tính năng chính

### 🎯 Dành cho người dùng cuối
- **Giao diện admin thân thiện**: Không cần kiến thức lập trình
- **Quản lý dữ liệu động**: Thay đổi tên, ngày cưới, địa điểm một cách dễ dàng
- **Upload ảnh tự động**: Tối ưu hóa và tạo thumbnail tự động
- **Quản lý thư viện ảnh**: Thêm, xóa, sắp xếp ảnh cưới
- **Tùy chỉnh câu chuyện**: Thêm/sửa các mốc thời gian quan trọng
- **Cấu hình thanh toán**: QR code, thông tin tài khoản
- **Tùy chỉnh giao diện**: Màu sắc, font chữ, layout
- **Xem trước realtime**: Kiểm tra thay đổi ngay lập tức

### 🔧 Dành cho developer
- **API RESTful**: Backend Python Flask chuyên nghiệp
- **Cấu trúc dữ liệu JSON**: Dễ mở rộng và tùy chỉnh
- **Hệ thống backup**: Tự động sao lưu dữ liệu
- **Upload file nâng cao**: Hỗ trợ nhiều định dạng, tối ưu hóa
- **Responsive design**: Tương thích mọi thiết bị
- **SEO optimized**: Tối ưu cho công cụ tìm kiếm

## 🚀 Cài đặt và sử dụng

### 🐳 Docker (Khuyến nghị)

**Yêu cầu**: Docker >= 20.10, Docker Compose >= 2.0

```bash
# Clone project
git clone https://github.com/your-repo/wedding-admin.git
cd wedding-admin

# Development Environment
docker-compose up --build

# Production Environment (với Nginx)
docker-compose --profile production up --build -d

# Hoặc sử dụng Make (optional)
make dev
```

**Truy cập**:
- **Development**: Admin Panel: `http://localhost:5001/admin.html`
- **Production**: Website: `http://localhost:80/admin.html`
- **API**: `http://localhost:5001/api/` hoặc `http://localhost:80/api/`

### 🐍 Python (Truyền thống)

**Yêu cầu hệ thống**:
- Python 3.7+ 
- Trình duyệt web hiện đại (Chrome, Firefox, Safari, Edge)

```bash
# Clone project
git clone https://github.com/your-repo/wedding-admin.git
cd wedding-admin

# Cài đặt dependencies
pip install -r requirements.txt

# Khởi chạy server
python start-sqlite-server.py
```

**Truy cập**:
- Admin Panel: `http://localhost:5001/admin.html`
- Website: `http://localhost:5001/index.html`

### Cài đặt thủ công (nâng cao)

1. **Cài đặt dependencies**
```bash
pip install -r requirements.txt
```

2. **Khởi chạy API server**
```bash
cd api
python app_sqlite.py
```

3. **Khởi chạy static server** (terminal khác)
```bash
python -m http.server 8000
```

## 📚 Hướng dẫn sử dụng

### 1. Quản lý thông tin cơ bản
- Truy cập tab **"Trang chủ"** để cập nhật tên cô dâu chú rể
- Thay đổi ngày cưới, địa điểm tổ chức
- Tùy chỉnh màu sắc chủ đạo

### 2. Quản lý thông tin cặp đôi
- Tab **"Cặp đôi"**: Thêm mô tả về chú rể và cô dâu
- Upload ảnh cá nhân cho từng người
- Cập nhật thông tin cha mẹ

### 3. Quản lý câu chuyện tình yêu
- Tab **"Câu chuyện"**: Thêm/sửa các mốc thời gian
- Upload ảnh minh họa cho từng câu chuyện
- Sắp xếp thứ tự hiển thị

### 4. Quản lý thư viện ảnh
- Tab **"Thư viện ảnh"**: Upload nhiều ảnh cùng lúc
- Kéo thả ảnh để upload nhanh
- Ẩn/hiện, xóa ảnh không mong muốn

### 5. Cấu hình thanh toán
- Tab **"Chuyển khoản"**: Thêm thông tin ngân hàng
- Upload QR code cho chú rể và cô dâu
- Tùy chỉnh lời cảm ơn

### 6. Quản lý sự kiện
- Tab **"Sự kiện"**: Thông tin lễ cưới và tiệc cưới
- Địa điểm, thời gian, link Google Maps
- Mô tả chi tiết cho từng sự kiện

### 7. Tùy chỉnh giao diện
- Tab **"Giao diện"**: Thay đổi màu sắc
- Chọn font chữ phù hợp
- Áp dụng theme có sẵn

### 8. Cài đặt hiển thị
- Tab **"Cài đặt"**: Ẩn/hiện các phần của website
- Bật/tắt tính năng như nhạc nền, countdown
- Tối ưu cho mobile

## 🗂️ Cấu trúc dự án

```
wedding-admin/
├── 📁 api/                     # Backend API
│   ├── app_sqlite.py                  # Flask application
│   └── ...
├── 📁 admin/                   # Admin panel
│   ├── css/                    # Admin styles
│   ├── js/                     # Admin JavaScript
│   └── ...
├── 📁 data/                    # Dữ liệu động
│   ├── wedding-data.json       # Dữ liệu chính
│   └── backups/               # Backup files
├── 📁 public/                  # Website files
│   ├── js/                    # JavaScript
│   ├── css/                   # Styles
│   ├── images/                # Hình ảnh
│   └── uploads/               # Files upload
├── admin.html                  # Admin panel
├── index.html                  # Website chính
├── start-server.py            # Script khởi chạy
├── requirements.txt           # Python dependencies
└── README.md                  # Tài liệu này
```

## 🎨 Tùy chỉnh nâng cao

### Thêm theme màu mới
```json
{
  "theme": {
    "primaryColor": "#your-color",
    "secondaryColor": "#your-secondary",
    "accentColor": "#your-accent"
  }
}
```

### Thêm section mới
1. Cập nhật `data/wedding-data.json`
2. Thêm HTML template trong `index.html`
3. Cập nhật `public/js/site-loader.js`

### Tùy chỉnh upload
- Sửa `MAX_FILE_SIZE` trong `api/app_sqlite.py`
- Thêm định dạng file trong `ALLOWED_EXTENSIONS`

## 🔒 Bảo mật

### Khuyến nghị production
- Sử dụng HTTPS
- Thêm authentication cho admin panel
- Giới hạn upload file size
- Backup dữ liệu định kỳ

### Environment variables
```bash
export FLASK_ENV=production
export MAX_UPLOAD_SIZE=10MB
export BACKUP_RETENTION_DAYS=30
```

## 🚨 Xử lý sự cố

### Server không khởi động
1. Kiểm tra Python version: `python --version`
2. Cài đặt lại dependencies: `pip install -r requirements.txt`
3. Kiểm tra port có bị chiếm: `netstat -an | grep :5000`

### Upload ảnh lỗi
1. Kiểm tra dung lượng file (< 5MB)
2. Định dạng hỗ trợ: JPG, PNG, WebP, GIF
3. Kiểm tra quyền ghi thư mục `public/uploads/`

### Dữ liệu bị mất
1. Khôi phục từ backup: `data/backups/`
2. Import file JSON từ admin panel
3. Kiểm tra file `data/wedding-data.json`

### Website không hiển thị đúng
1. Xóa cache trình duyệt (Ctrl+F5)
2. Kiểm tra console lỗi (F12)
3. Reload dữ liệu từ admin panel

## 📱 Responsive Design

Website tự động tối ưu cho:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+) 
- 💻 Desktop (1024px+)
- 🖥️ Large screen (1200px+)

## 🌍 SEO & Performance

### Tối ưu có sẵn
- Meta tags động
- Open Graph tags
- Structured data (JSON-LD)
- Image lazy loading
- CSS/JS minification
- Gzip compression

### Google Analytics
Thêm tracking code vào `data/wedding-data.json`:
```json
{
  "analytics": {
    "enabled": true,
    "googleAnalytics": "GA-TRACKING-ID"
  }
}
```

## 🤝 Hỗ trợ

### Báo lỗi
- Tạo issue trên GitHub
- Gửi email: support@wedding-admin.com
- Gọi hotline: 1900-XXXX

### Đóng góp
1. Fork project
2. Tạo feature branch
3. Commit changes
4. Push và tạo Pull Request

## 📄 License

MIT License - Xem file [LICENSE](LICENSE) để biết chi tiết.

## 🎉 Credits

Được phát triển với ❤️ bởi:
- **Backend**: Python Flask, Pillow
- **Frontend**: HTML5, CSS3, JavaScript ES6
- **UI Framework**: Bootstrap 5
- **Icons**: Font Awesome 6

---

## 🆘 Hỗ trợ khẩn cấp

**Nếu gặp vấn đề gấp trong ngày cưới:**

1. **Backup khẩn cấp**: Copy toàn bộ thư mục `data/` 
2. **Khôi phục nhanh**: Chạy `python start-server.py`
3. **Hotline 24/7**: 1900-WEDDING
4. **Email SOS**: emergency@wedding-admin.com

**Nhớ test kỹ trước ngày cưới! 💒✨**# wedding-admin
