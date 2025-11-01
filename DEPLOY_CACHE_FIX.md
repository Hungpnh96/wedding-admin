# Hướng dẫn xử lý cache khi deploy

## Các thay đổi đã thực hiện:

### 1. Flask Backend (`api/app_sqlite.py`)
- ✅ Thêm `Cache-Control: no-cache` cho HTML files (index.html, admin.html)
- ✅ Thêm `Cache-Control: no-cache` cho API `/api/data`
- ✅ Thêm ETag headers dựa trên file modification time
- ✅ Short cache (1 hour) với revalidation cho JS/CSS files

### 2. Nginx Config (`nginx.conf`)
- ✅ No-cache cho tất cả HTML files
- ✅ No-cache cho root route và admin panel
- ✅ Short cache (1 hour) cho JS/CSS trong `/admin/`
- ✅ Long cache (30 days) với revalidation cho images trong `/public/`

### 3. Frontend (`public/js/site-loader.js`)
- ✅ Thêm cache busting timestamp (`?t=timestamp`) cho API calls

## Cách deploy và clear cache:

### Option 1: Restart Docker containers
```bash
docker-compose down
docker-compose up -d --build
```

### Option 2: Clear browser cache manually
1. Mở DevTools (F12)
2. Right-click vào nút refresh
3. Chọn "Empty Cache and Hard Reload"

### Option 3: Force reload trong browser
- **Chrome/Edge**: Ctrl+Shift+R (Windows) hoặc Cmd+Shift+R (Mac)
- **Firefox**: Ctrl+F5 (Windows) hoặc Cmd+Shift+R (Mac)
- **Safari**: Cmd+Option+E (empty cache), sau đó Cmd+R

### Option 4: Clear cache programmatically (cho users)
Thêm vào `index.html` và `admin.html`:
```html
<script>
// Force reload if new version detected
if (localStorage.getItem('appVersion') !== '20250127') {
    localStorage.clear();
    localStorage.setItem('appVersion', '20250127');
    location.reload(true);
}
</script>
```

## Kiểm tra cache headers:

Sau khi deploy, kiểm tra headers:
```bash
# Check HTML files
curl -I http://your-server/index.html
curl -I http://your-server/admin.html

# Check API
curl -I http://your-server/api/data

# Should see:
# Cache-Control: no-cache, no-store, must-revalidate, max-age=0
# Pragma: no-cache
# Expires: 0
```

## Notes:
- Images trong `/public/` sẽ được cache 30 ngày (OK vì ít thay đổi)
- JS/CSS được cache 1 giờ với revalidation (balance giữa performance và freshness)
- HTML và API data không bao giờ được cache (luôn fresh)
- Cache busting timestamp được tự động thêm vào API calls

