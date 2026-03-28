// Wedding Admin Functions
// Core functionality for admin operations

// Banner Management Functions
// Use global bannerSlides from admin-main.js if available, otherwise create new
if (typeof window.bannerSlides === 'undefined') {
    window.bannerSlides = [];
}

// Initialize banner management
function initBannerManagement() {
    console.log('🚀 initBannerManagement called');
    console.log('📊 siteData:', siteData);
    console.log('📊 window.bannerSlides:', window.bannerSlides);
    loadBannerSlides();
    refreshBannerPreview();
}

// Clear and reload banner data from server
async function reloadBannerData() {
    try {
        const response = await fetch(window.location.origin + '/api/data');
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                siteData = result.data;
                loadBannerSlides();
                refreshBannerPreview();
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công',
                    text: 'Đã tải lại dữ liệu banner từ server',
                    confirmButtonText: 'OK'
                });
            }
        }
    } catch (error) {
        console.error('Error reloading banner data:', error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Không thể tải lại dữ liệu từ server',
            confirmButtonText: 'OK'
        });
    }
}

// Clear all banner slides
function clearBannerSlides() {
    Swal.fire({
        title: 'Xác nhận xóa',
        text: 'Bạn có chắc chắn muốn xóa tất cả ảnh banner?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xóa tất cả',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            window.bannerSlides = [];
            updateSiteDataBanner();
            renderBannerSlides();
            refreshBannerPreview();
            saveBannerDataToServer();
            
            Swal.fire({
                icon: 'success',
                title: 'Thành công',
                text: 'Đã xóa tất cả ảnh banner!',
                confirmButtonText: 'OK'
            });
        }
    });
}

// Load banner slides from site data
function loadBannerSlides() {
    console.log('🔄 loadBannerSlides called');
    console.log('📊 window.bannerSlides:', window.bannerSlides);
    console.log('📊 siteData:', siteData);
    console.log('📊 siteData.hero:', siteData?.hero);
    console.log('📊 siteData.hero.slides:', siteData?.hero?.slides);
    
    // Sync with global bannerSlides from admin-main.js
    if (window.bannerSlides && Array.isArray(window.bannerSlides) && window.window.bannerSlides.length > 0) {
        // window.bannerSlides = window.bannerSlides;
        console.log('✅ Using existing bannerSlides from window:', window.bannerSlides);
    } else if (siteData && siteData.hero && siteData.hero.slides) {
        window.bannerSlides = [...siteData.hero.slides];
        console.log('✅ Loading bannerSlides from siteData:', window.bannerSlides);
    } else {
        window.bannerSlides = [];
        console.log('⚠️ Initializing empty bannerSlides');
    }
    console.log('🎯 Calling renderBannerSlides');
    renderBannerSlides();
}

// Render banner slides list
function renderBannerSlides() {
    console.log('🎨 renderBannerSlides called');
    console.log('📊 bannerSlides:', bannerSlides);
    const container = document.getElementById('bannerSlidesList');
    console.log('📦 Container:', container);
    if (!container) {
        console.warn('⚠️ Container bannerSlidesList not found');
        return;
    }

    if (window.bannerSlides.length === 0) {
        console.log('📭 No banner slides, showing empty state');
        container.innerHTML = `
            <div class="banner-empty-state">
                <i class="fas fa-images"></i>
                <h5>Chưa có ảnh banner</h5>
                <p>Nhấn "Thêm ảnh banner" để bắt đầu tạo slideshow</p>
            </div>
        `;
        return;
    }
    
    console.log('🎯 Rendering', window.bannerSlides.length, 'banner slides');

    container.innerHTML = window.bannerSlides.map((slide, index) => `
        <div class="banner-slide-item ${index === 0 ? 'is-primary' : ''}" data-slide-id="${slide.id}">
            <img src="${slide.src}" alt="${slide.title}" class="banner-slide-preview" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik04MCA1MEgxMjBWNTBIODBaIiBmaWxsPSIjQ0NDQ0NDIi8+CjxwYXRoIGQ9Ik04MCA2MEgxMjBWNjBIODBaIiBmaWxsPSIjQ0NDQ0NDIi8+CjxwYXRoIGQ9Ik04MCA3MEgxMjBWNzBIODBaIiBmaWxsPSIjQ0NDQ0NDIi8+Cjwvc3ZnPgo='">
            <div class="banner-slide-info">
                <h6 class="banner-slide-title">${slide.title} ${index === 0 ? '<span class="badge bg-primary ms-2">Ảnh chính</span>' : ''}</h6>
                <div class="banner-slide-actions">
                    <button class="btn btn-outline-info btn-sm" onclick="uploadSlideImage('${slide.id}')" title="Tải ảnh">
                        <i class="fas fa-upload"></i>
                    </button>
                    <button class="btn btn-outline-primary btn-sm" onclick="editBannerSlide('${slide.id}')" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-success btn-sm" onclick="setPrimaryBanner('${slide.id}')" title="Đặt làm ảnh chính">
                        <i class="fas fa-star"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" onclick="removeBannerSlide('${slide.id}')" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <p class="banner-slide-description">${slide.description || 'Không có mô tả'}</p>
            ${slide.originalName ? `<small class="text-muted">File gốc: ${slide.originalName}</small>` : ''}
            ${slide.uploadDate ? `<small class="text-muted d-block">Upload: ${new Date(slide.uploadDate).toLocaleString('vi-VN')}</small>` : ''}
            <div class="banner-slide-order">
                <span class="text-muted">Thứ tự:</span>
                <button class="btn btn-outline-secondary btn-sm" onclick="moveBannerSlide('${slide.id}', 'up')" ${index === 0 ? 'disabled' : ''}>
                    <i class="fas fa-arrow-up"></i>
                </button>
                <input type="number" class="form-control" value="${index + 1}" min="1" max="${window.bannerSlides.length}" 
                       onchange="reorderBannerSlide('${slide.id}', this.value)">
                <button class="btn btn-outline-secondary btn-sm" onclick="moveBannerSlide('${slide.id}', 'down')" ${index === window.bannerSlides.length - 1 ? 'disabled' : ''}>
                    <i class="fas fa-arrow-down"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Add new banner slide
function addBannerSlide() {
    const slideId = 'slide-' + Date.now();
    const newSlide = {
        id: slideId,
        src: '',
        title: 'Banner mới',
        description: 'Mô tả banner',
        visible: true
    };
    
    window.bannerSlides.push(newSlide);
    window.bannerSlides = window.bannerSlides;
    updateSiteDataBanner();
    renderBannerSlides();
    showAlert('Đã thêm banner mới. Vui lòng tải ảnh để hoàn tất.', 'success');
}

// Upload banner image
function uploadBannerImage() {
    const input = document.getElementById('bannerFileInput');
    if (input) {
        input.click();
    }
}

// Handle banner file selection
function handleBannerFileSelect(input) {
    const files = Array.from(input.files);
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            uploadBannerFile(file);
        }
    });
    
    // Reset input
    input.value = '';
}

// Handle banner drag over
function handleBannerDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
}

// Handle banner drag leave
function handleBannerDragLeave(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
}

// Handle banner drop
function handleBannerDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    
    const files = Array.from(event.dataTransfer.files);
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            uploadBannerFile(file);
        }
    });
}

// Upload image for specific slide
function uploadSlideImage(slideId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            uploadSlideFile(slideId, file);
        }
    };
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
}

// Upload file for specific slide
function uploadSlideFile(slideId, file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Vui lòng chọn file ảnh (JPG, PNG, WebP)',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'File quá lớn. Vui lòng chọn file nhỏ hơn 5MB',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'banner');
    formData.append('folder', 'banner');
    
    Swal.fire({
        title: 'Đang tải ảnh...',
        text: 'Vui lòng đợi',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    fetch(window.location.origin + '/api/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update slide with new image
            if (!window.bannerSlides) window.bannerSlides = [];
            const slideIndex = window.bannerSlides.findIndex(s => s.id === slideId);
            if (slideIndex !== -1) {
                const fileName = file.name.replace(/\.[^/.]+$/, "");
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const newFileName = `banner_${timestamp}_${fileName}.webp`;
                
                window.bannerSlides[slideIndex].src = data.url || `./public/images/banner/${newFileName}`;
                window.bannerSlides[slideIndex].originalName = file.name;
                window.bannerSlides[slideIndex].uploadDate = new Date().toISOString();
                
                window.bannerSlides = window.bannerSlides;
                updateSiteDataBanner();
                renderBannerSlides();
                refreshBannerPreview();
                saveBannerDataToServer();
                
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công',
                    text: `Đã tải ảnh thành công! File: ${newFileName}`,
                    confirmButtonText: 'OK'
                });
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Lỗi khi tải ảnh: ' + data.message,
                confirmButtonText: 'OK'
            });
        }
    })
    .catch(error => {
        console.error('Upload error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Lỗi khi tải ảnh: ' + error.message,
            confirmButtonText: 'OK'
        });
    });
}

// Upload banner file
function uploadBannerFile(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Vui lòng chọn file ảnh (JPG, PNG, WebP)',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'File quá lớn. Vui lòng chọn file nhỏ hơn 5MB',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'banner');
    formData.append('folder', 'banner'); // Specify folder
    
    Swal.fire({
        title: 'Đang tải ảnh...',
        text: 'Vui lòng đợi',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    fetch(window.location.origin + '/api/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Add new slide with uploaded image
            const slideId = 'slide-' + Date.now();
            const fileName = file.name.replace(/\.[^/.]+$/, "");
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const newFileName = `banner_${timestamp}_${fileName}.webp`;
            
            const newSlide = {
                id: slideId,
                src: data.url || `./public/images/banner/${newFileName}`,
                title: fileName,
                description: 'Ảnh banner đã tải lên',
                visible: true,
                originalName: file.name,
                uploadDate: new Date().toISOString()
            };
            
            if (!window.bannerSlides) window.bannerSlides = [];
            window.bannerSlides.push(newSlide);
            window.bannerSlides = window.bannerSlides;
            updateSiteDataBanner();
            renderBannerSlides();
            refreshBannerPreview();
            saveBannerDataToServer();
            Swal.fire({
                icon: 'success',
                title: 'Thành công',
                text: `Đã tải ảnh thành công! File: ${newFileName}`,
                confirmButtonText: 'OK'
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Lỗi khi tải ảnh: ' + data.message,
                confirmButtonText: 'OK'
            });
        }
    })
    .catch(error => {
        console.error('Upload error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Lỗi khi tải ảnh: ' + error.message,
            confirmButtonText: 'OK'
        });
    });
}

// Edit banner slide
function editBannerSlide(slideId) {
    if (!window.bannerSlides || !Array.isArray(window.bannerSlides)) return;
    const slide = window.bannerSlides.find(s => s.id === slideId);
    if (!slide) return;
    
    Swal.fire({
        title: 'Chỉnh sửa banner',
        html: `
            <div class="mb-3">
                <label class="form-label">Tiêu đề:</label>
                <input type="text" id="editTitle" class="form-control" value="${slide.title || ''}" placeholder="Nhập tiêu đề">
            </div>
            <div class="mb-3">
                <label class="form-label">Mô tả:</label>
                <textarea id="editDescription" class="form-control" rows="3" placeholder="Nhập mô tả">${slide.description || ''}</textarea>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Lưu',
        cancelButtonText: 'Hủy',
        preConfirm: () => {
            const title = document.getElementById('editTitle').value;
            const description = document.getElementById('editDescription').value;
            
            if (!title.trim()) {
                Swal.showValidationMessage('Vui lòng nhập tiêu đề');
                return false;
            }
            
            return { title: title.trim(), description: description.trim() };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            slide.title = result.value.title;
            slide.description = result.value.description;
            
            updateSiteDataBanner();
            renderBannerSlides();
            refreshBannerPreview();
            saveBannerDataToServer();
            
            Swal.fire({
                icon: 'success',
                title: 'Thành công',
                text: 'Đã cập nhật thông tin banner',
                confirmButtonText: 'OK'
            });
        }
    });
}

// Set primary banner
function setPrimaryBanner(slideId) {
    if (!window.bannerSlides || !Array.isArray(window.bannerSlides)) return;
    const slideIndex = window.bannerSlides.findIndex(s => s.id === slideId);
    if (slideIndex === -1) return;
    
    // Move slide to first position
    const slide = window.bannerSlides.splice(slideIndex, 1)[0];
    window.bannerSlides.unshift(slide);
    window.bannerSlides = window.bannerSlides;
    
    updateSiteDataBanner();
    renderBannerSlides();
    refreshBannerPreview();
    saveBannerDataToServer();
    Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Đã đặt làm ảnh banner chính!',
        confirmButtonText: 'OK'
    });
}

// Remove banner slide
function removeBannerSlide(slideId) {
    if (!window.bannerSlides || !Array.isArray(window.bannerSlides)) return;
    
    Swal.fire({
        title: 'Xác nhận xóa',
        text: 'Bạn có chắc chắn muốn xóa ảnh banner này?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            window.bannerSlides = window.bannerSlides.filter(s => s.id !== slideId);
            window.bannerSlides = window.bannerSlides;
            updateSiteDataBanner();
            renderBannerSlides();
            refreshBannerPreview();
            saveBannerDataToServer();
            
            Swal.fire({
                icon: 'success',
                title: 'Thành công',
                text: 'Đã xóa ảnh banner!',
                confirmButtonText: 'OK'
            });
        }
    });
}

// Move banner slide
function moveBannerSlide(slideId, direction) {
    if (!window.bannerSlides || !Array.isArray(window.bannerSlides)) return;
    const slideIndex = window.bannerSlides.findIndex(s => s.id === slideId);
    if (slideIndex === -1) return;
    
    const newIndex = direction === 'up' ? slideIndex - 1 : slideIndex + 1;
    if (newIndex < 0 || newIndex >= window.bannerSlides.length) return;
    
    // Swap slides
    [window.bannerSlides[slideIndex], window.bannerSlides[newIndex]] = [window.bannerSlides[newIndex], window.bannerSlides[slideIndex]];
    window.bannerSlides = window.bannerSlides;
    
    updateSiteDataBanner();
    renderBannerSlides();
    refreshBannerPreview();
    saveBannerDataToServer();
}

// Reorder banner slide
function reorderBannerSlide(slideId, newOrder) {
    if (!window.bannerSlides || !Array.isArray(window.bannerSlides)) return;
    const slideIndex = window.bannerSlides.findIndex(s => s.id === slideId);
    if (slideIndex === -1) return;
    
    const targetIndex = parseInt(newOrder) - 1;
    if (targetIndex < 0 || targetIndex >= window.bannerSlides.length) return;
    
    // Move slide to new position
    const slide = window.bannerSlides.splice(slideIndex, 1)[0];
    window.bannerSlides.splice(targetIndex, 0, slide);
    window.bannerSlides = window.bannerSlides;
    
    updateSiteDataBanner();
    renderBannerSlides();
    refreshBannerPreview();
    saveBannerDataToServer();
}

// Update site data with banner slides
function updateSiteDataBanner() {
    if (!siteData.hero) siteData.hero = {};
    siteData.hero.slides = bannerSlides;
}

// Save banner data to server
async function saveBannerDataToServer() {
    try {
        const response = await fetch(window.location.origin + '/api/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(siteData)
        });
        
        if (response.ok) {
            console.log('Banner data saved to server');
        } else {
            console.error('Failed to save banner data to server');
        }
    } catch (error) {
        console.error('Error saving banner data to server:', error);
    }
}

// Refresh banner preview
function refreshBannerPreview() {
    console.log('refreshBannerPreview called - bannerSlides:', bannerSlides);
    const container = document.getElementById('bannerPreview');
    if (!container) return;
    
    const groomName = document.getElementById('groomName')?.value || siteData.hero?.groomName || 'Chú rể';
    const brideName = document.getElementById('brideName')?.value || siteData.hero?.brideName || 'Cô dâu';
    const weddingDate = document.getElementById('weddingDate')?.value || siteData.hero?.weddingDate || '';
    const weddingTime = document.getElementById('weddingTime')?.value || siteData.hero?.weddingTime || '';
    const weddingLocation = document.getElementById('weddingLocation')?.value || siteData.hero?.weddingLocation || '';
    
    // Format date
    let formattedDate = '';
    if (weddingDate) {
        const date = new Date(weddingDate);
        formattedDate = date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // Format time
    let formattedTime = '';
    if (weddingTime) {
        const [hours, minutes] = weddingTime.split(':');
        formattedTime = `${hours}:${minutes}`;
    }
    
    // Get primary banner image
    const primarySlide = ((window.bannerSlides && Array.isArray(window.bannerSlides)) && window.bannerSlides.length > 0) ? 
        (window.bannerSlides.find(s => s.visible) || window.bannerSlides[0]) : null;
    const backgroundImage = primarySlide ? `url('${primarySlide.src}')` : '';
    
    container.innerHTML = `
        <div class="banner-preview-content" style="background-image: ${backgroundImage}; background-size: cover; background-position: center;">
            <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px;">
                <h1 class="banner-preview-title">${groomName} & ${brideName}</h1>
                <p class="banner-preview-subtitle">${formattedDate}${formattedTime ? ' - ' + formattedTime : ''}</p>
                ${weddingLocation ? `<p class="banner-preview-date">${weddingLocation}</p>` : ''}
            </div>
        </div>
    `;
}

// Save changes to site data
async function saveChanges(onlyVisibility = false) {
    try {
        showAlert('Đang lưu thay đổi...', 'info');

        // Sync window.siteData → siteData nếu tab khác đã fetch data mới hơn
        if (window.siteData && window.siteData !== siteData) {
            siteData = window.siteData;
        }

        // Update last modified time
        if (!siteData.admin) siteData.admin = {};
        siteData.admin.lastUpdate = new Date().toISOString();
        
        // Convert to JSON
        const dataStr = JSON.stringify(siteData, null, 2);
        
        // Save to localStorage for immediate effect
        localStorage.setItem('siteDataOverride', dataStr);
        
        // Update embedded data in index.html for preview
        if (window.embeddedSiteData) {
            Object.assign(window.embeddedSiteData, siteData);
        }
        
        // Save to API
        try {
            let dataToSave = siteData;
            
            // If only saving visibility settings, only send visibility section
            if (onlyVisibility && siteData.visibility) {
                dataToSave = {
                    visibility: siteData.visibility,
                    admin: siteData.admin || {}
                };
                console.log('💾 Saving only visibility settings:', dataToSave);
            }
            
            const response = await fetch(window.location.origin + '/api/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSave)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Data saved to API:', result);
            } else {
                console.warn('⚠️ API save returned non-ok status:', response.status);
            }
        } catch (apiError) {
            console.error('❌ Error saving to API:', apiError);
            // Don't fail the whole operation if API save fails
        }
        
        // Trigger real-time update on index page
        triggerIndexUpdate();
        
        // Show success message
        showAlert('Đã lưu thành công! Website sẽ cập nhật ngay lập tức.', 'success');
        
        console.log('✅ Changes saved:', onlyVisibility ? 'visibility only' : 'full data');
        
    } catch (error) {
        console.error('Error saving changes:', error);
        showAlert('Lỗi khi lưu thay đổi', 'error');
    }
}

// Preview website
function previewWebsite() {
    try {
        // Update embedded data for preview
        if (window.embeddedSiteData) {
            window.embeddedSiteData = siteData;
        }
        
        // Open preview modal
        const modal = new bootstrap.Modal(document.getElementById('previewModal'));
        modal.show();
        
        // Refresh iframe after modal is shown
        setTimeout(() => {
            const iframe = document.getElementById('previewFrame');
            if (iframe) {
                iframe.src = iframe.src; // Force refresh
            }
        }, 500);
        
    } catch (error) {
        console.error('Error previewing website:', error);
        showAlert('Lỗi khi xem trước website', 'error');
    }
}

// Download data
function downloadData() {
    try {
        const dataStr = JSON.stringify(siteData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'wedding-site-data.json';
        link.click();
        
        URL.revokeObjectURL(url);
        showAlert('Đã tải xuống dữ liệu!', 'success');
        
    } catch (error) {
        console.error('Error downloading data:', error);
        showAlert('Lỗi khi tải xuống dữ liệu', 'error');
    }
}

// Load data from file
function loadData() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.click();
    }
}

// Handle file upload
function handleFileUpload(input) {
    const file = input.files[0];
    if (!file) return;
    
    if (file.type !== 'application/json') {
        showAlert('Vui lòng chọn file JSON hợp lệ', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            siteData = data;
            isDataLoaded = true;
            
            // Update interface
            updateAdminInterface();
            
            showAlert('Đã tải dữ liệu thành công!', 'success');
            
        } catch (error) {
            console.error('Error parsing JSON:', error);
            showAlert('Lỗi khi đọc file JSON', 'error');
        }
    };
    reader.readAsText(file);
}

// Apply theme
async function applyTheme() {
    try {
        // Save theme to server
        if (!window.siteData) window.siteData = {};
        
        // Get theme values from form
        window.siteData.theme = {
            primaryColor: document.getElementById('primaryThemeColor')?.value || window.siteData.theme?.primaryColor || '#9f5958',
            secondaryColor: document.getElementById('secondaryThemeColor')?.value || window.siteData.theme?.secondaryColor || '#f8f9fa',
            textColor: document.getElementById('textColor')?.value || window.siteData.theme?.textColor || '#2c3e50',
            backgroundColor: document.getElementById('backgroundColor')?.value || window.siteData.theme?.backgroundColor || '#ffffff',
            borderColor: document.getElementById('borderColor')?.value || window.siteData.theme?.borderColor || '#dee2e6',
            accentColor: document.getElementById('accentColor')?.value || window.siteData.theme?.accentColor || '#e74c3c',
            customCSS: document.getElementById('customCSS')?.value || window.siteData.theme?.customCSS || ''
        };
        
        // Save to server
        const response = await fetch(`${window.location.origin}/api/data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(window.siteData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Update embedded data
            if (window.embeddedSiteData) {
                window.embeddedSiteData.theme = window.siteData.theme;
                window.embeddedSiteData.layout = window.siteData.layout;
            }
            
            showAlert('Đã áp dụng theme! Refresh trang index để xem thay đổi.', 'success');
        } else {
            throw new Error(result.message || 'Failed to save theme');
        }
        
    } catch (error) {
        console.error('Error applying theme:', error);
        showAlert('Lỗi khi áp dụng theme', 'error');
    }
}

// Reset theme
function resetTheme() {
    Swal.fire({
        title: 'Khôi phục theme mặc định?',
        text: 'Bạn có chắc chắn muốn khôi phục theme mặc định?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Khôi phục',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            try {
            // Reset to default theme
            siteData.theme = {
                primaryColor: "#9f5958",
                secondaryColor: "#f8f9fa",
                textColor: "#2c3e50",
                backgroundColor: "#ffffff",
                borderColor: "#dee2e6",
                accentColor: "#e74c3c",
                primaryFont: "'Segoe UI', sans-serif",
                headingFont: "'Playfair Display', serif",
                baseFontSize: 16,
                headingFontSize: 32
            };
            
            siteData.layout = {
                headerStyle: "hero",
                navStyle: "top",
                footerStyle: "simple",
                contentLayout: "single",
                sectionSpacing: 50,
                borderRadius: 8,
                boxShadow: 5,
                animationStyle: "fade",
                mobileOptimized: true,
                touchFriendly: true,
                fastLoading: true,
                seoOptimized: true
            };
            
            // Update interface
            updateThemeSettings();
            
            Swal.fire({
                title: 'Thành công!',
                text: 'Đã khôi phục theme mặc định',
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000
            });
            
            } catch (error) {
                console.error('Error resetting theme:', error);
                Swal.fire({
                    title: 'Lỗi!',
                    text: 'Lỗi khi khôi phục theme',
                    icon: 'error',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
            }
        }
    });
}

// Apply color preset
function applyColorPreset(theme) {
    const presets = {
        'wedding': {
            primaryColor: "#9f5958",
            secondaryColor: "#f8f9fa",
            textColor: "#2c3e50"
        },
        'romantic': {
            primaryColor: "#e74c3c",
            secondaryColor: "#fdf2f8",
            textColor: "#1f2937"
        },
        'elegant': {
            primaryColor: "#2c3e50",
            secondaryColor: "#ecf0f1",
            textColor: "#34495e"
        },
        'golden': {
            primaryColor: "#f39c12",
            secondaryColor: "#fef9e7",
            textColor: "#8b4513"
        },
        'forest': {
            primaryColor: "#27ae60",
            secondaryColor: "#eafaf1",
            textColor: "#1e8449"
        }
    };
    
    const preset = presets[theme];
    if (preset) {
        // Update site data
        if (!siteData.theme) siteData.theme = {};
        Object.assign(siteData.theme, preset);
        
        // Update form fields
        setFieldValue('primaryThemeColor', preset.primaryColor);
        setFieldValue('primaryThemeColorText', preset.primaryColor);
        setFieldValue('secondaryThemeColor', preset.secondaryColor);
        setFieldValue('secondaryThemeColorText', preset.secondaryColor);
        setFieldValue('textColor', preset.textColor);
        setFieldValue('textColorText', preset.textColor);
        
        showAlert(`Đã áp dụng bộ màu ${theme}!`, 'success');
    }
}

// Add story
function addStory() {
    try {
        if (!siteData.story) siteData.story = [];
        
        const newStory = {
            id: 'story-' + (siteData.story.length + 1),
            src: './public/images/gallery/gallery-01.jpg',
            visible: true,
            title: 'Câu chuyện mới',
            description: 'Mô tả câu chuyện',
            content: 'Nội dung câu chuyện của bạn...'
        };
        
        siteData.story.push(newStory);
        
        // Reload story data
        loadStoryData();
        
        showAlert('Đã thêm câu chuyện mới!', 'success');
        
    } catch (error) {
        console.error('Error adding story:', error);
        showAlert('Lỗi khi thêm câu chuyện', 'error');
    }
}

// Add gallery image
function addGalleryImage() {
    try {
        if (!siteData.gallery) siteData.gallery = [];
        
        const newImage = {
            id: 'gallery-' + (siteData.gallery.length + 1),
            src: './public/images/gallery/gallery-01.jpg',
            visible: true,
            title: 'Ảnh mới',
            category: 'gallery'
        };
        
        siteData.gallery.push(newImage);
        
        // Reload gallery data
        loadGalleryData();
        
        showAlert('Đã thêm ảnh gallery mới!', 'success');
        
    } catch (error) {
        console.error('Error adding gallery image:', error);
        showAlert('Lỗi khi thêm ảnh gallery', 'error');
    }
}

// Add wish suggestion
function addWishSuggestion() {
    try {
        if (!siteData.wishes) siteData.wishes = {};
        if (!siteData.wishes.suggestions) siteData.wishes.suggestions = [];
        
        siteData.wishes.suggestions.push('Lời chúc mới...');
        
        // Reload wishes data
        loadWishesSuggestions();
        
        showAlert('Đã thêm gợi ý lời chúc mới!', 'success');
        
    } catch (error) {
        console.error('Error adding wish suggestion:', error);
        showAlert('Lỗi khi thêm gợi ý lời chúc', 'error');
    }
}

// Update wish suggestion
function updateWishSuggestion(index, value) {
    if (siteData.wishes?.suggestions?.[index] !== undefined) {
        siteData.wishes.suggestions[index] = value;
    }
}

// Remove wish suggestion
function removeWishSuggestion(index) {
    Swal.fire({
        title: 'Xóa gợi ý?',
        text: 'Bạn có chắc chắn muốn xóa gợi ý này?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
        if (siteData.wishes?.suggestions) {
            siteData.wishes.suggestions.splice(index, 1);
            loadWishesSuggestions();
            Swal.fire({
                title: 'Đã xóa!',
                text: 'Gợi ý lời chúc đã được xóa',
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000
            });
        }
        }
    });
}

// Upload couple image
function uploadCoupleImage(type) {
    console.log('uploadCoupleImage called with type:', type);
    const input = document.getElementById('coupleImageInput');
    console.log('Found input element:', input);
    
    if (input) {
        input.onchange = function(e) {
            console.log('File input changed');
            const file = e.target.files[0];
            console.log('Selected file:', file);
            if (file) {
                console.log('Calling handleImageUpload with:', { file: file.name, type });
                handleImageUpload(file, type);
            } else {
                console.log('No file selected');
            }
        };
        console.log('Triggering file input click');
        input.click();
    } else {
        console.error('coupleImageInput not found!');
    }
}

// Upload QR code
function uploadQRCode() {
    const input = document.getElementById('qrImageInput');
    if (input) {
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                handleImageUpload(file, 'qr');
            }
        };
        input.click();
    }
}

// Upload groom QR
function uploadGroomQR() {
    const input = document.getElementById('qrImageInput');
    if (input) {
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                handleImageUpload(file, 'groomQR');
            }
        };
        input.click();
    }
}

// Upload bride QR
function uploadBrideQR() {
    const input = document.getElementById('qrImageInput');
    if (input) {
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                handleImageUpload(file, 'brideQR');
            }
        };
        input.click();
    }
}

// Upload multiple images
function uploadMultipleImages() {
    const input = document.getElementById('multipleImageInput');
    if (input) {
        input.onchange = function(e) {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                handleImageUpload(file, 'gallery');
            });
        };
        input.click();
    }
}

// Handle image upload - Server upload solution
async function handleImageUpload(file, type) {
    console.log('handleImageUpload called with:', { fileName: file.name, type, size: file.size });
    
    if (!file.type.startsWith('image/')) {
        console.log('Invalid file type:', file.type);
        showAlert('Vui lòng chọn file ảnh hợp lệ', 'error');
        return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        console.log('File too large:', file.size);
        showAlert('File ảnh quá lớn. Vui lòng chọn file nhỏ hơn 5MB', 'error');
        return;
    }
    
    console.log('Starting upload process...');
    showAlert('Đang tải ảnh lên server...', 'info');
    
    // Generate filename - use fixed names for couple/QR to enable overwriting
    let fileName;
    if (type === 'groom') {
        fileName = 'groom_image.jpg';
    } else if (type === 'bride') {
        fileName = 'bride_image.jpg';
    } else if (type === 'qr') {
        fileName = 'qr_code.jpg';
    } else if (type === 'groomQR') {
        fileName = 'groom_qr.jpg';
    } else if (type === 'brideQR') {
        fileName = 'bride_qr.jpg';
    } else {
        // For gallery/story, use timestamp to avoid conflicts
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop().toLowerCase();
        fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    }
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        const imageUrl = e.target.result;
        
        try {
            // Upload to server
            const response = await fetch('http://localhost:8001/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileData: imageUrl,
                    fileName: fileName,
                    fileType: type
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Upload successful:', result);
                
                // Update site data with server path
                updateSiteDataWithImage(type, result.filePath, imageUrl, fileName);
                
                showAlert(`✅ Đã tải ảnh ${type} thành công! File đã lưu: ${result.filePath}`, 'success');
                
            } else {
                const error = await response.text();
                throw new Error(`Server error: ${error}`);
            }
            
        } catch (error) {
            console.error('Upload failed:', error);
            showAlert(`❌ Lỗi khi tải ảnh lên server: ${error.message}`, 'error');
        }
    };
    
    reader.onerror = function() {
        showAlert('Lỗi khi đọc file ảnh', 'error');
    };
    
    reader.readAsDataURL(file);
}



// Get target directory based on type
function getTargetDirectory(type) {
    switch(type) {
        case 'groom':
        case 'bride':
            return 'couple';
        case 'qr':
        case 'groomQR':
        case 'brideQR':
            return 'qr';
        case 'gallery':
        case 'story':
            return 'gallery';
        default:
            return 'banner';
    }
}

// Update site data with image information
function updateSiteDataWithImage(type, imagePath, imageUrl, fileName) {
    // Update site data based on type
    switch(type) {
        case 'groom':
            if (!siteData.couple) siteData.couple = {};
            if (!siteData.couple.img1) siteData.couple.img1 = {};
            siteData.couple.img1.src = imagePath; // Use server path
            siteData.couple.img1.dataUrl = imageUrl; // Keep base64 for preview
            updateImagePreview('groomDetailPreview', imageUrl);
            break;
            
        case 'bride':
            if (!siteData.couple) siteData.couple = {};
            if (!siteData.couple.img2) siteData.couple.img2 = {};
            siteData.couple.img2.src = imagePath; // Use server path
            siteData.couple.img2.dataUrl = imageUrl; // Keep base64 for preview
            updateImagePreview('brideDetailPreview', imageUrl);
            break;
            
        case 'qr':
            if (!siteData.payment) siteData.payment = {};
            siteData.payment.qrCode = imagePath; // Use server path
            siteData.payment.qrCodeData = imageUrl; // Keep base64 for preview
            updateImagePreview('qrCodePreview', imageUrl);
            break;
            
        case 'groomQR':
            if (!siteData.payment) siteData.payment = {};
            siteData.payment.groomQR = imagePath; // Use server path
            siteData.payment.groomQRData = imageUrl; // Keep base64 for preview
            updateImagePreview('groomQRPreview', imageUrl);
            break;
            
        case 'brideQR':
            if (!siteData.payment) siteData.payment = {};
            siteData.payment.brideQR = imagePath; // Use server path
            siteData.payment.brideQRData = imageUrl; // Keep base64 for preview
            updateImagePreview('brideQRPreview', imageUrl);
            break;
            
        case 'gallery':
            if (!siteData.gallery) siteData.gallery = [];
            const newImage = {
                id: 'gallery-' + (siteData.gallery.length + 1),
                src: imagePath, // Use server path
                dataUrl: imageUrl, // Keep base64 for preview
                visible: true,
                title: fileName.replace(/\.[^/.]+$/, ''),
                category: 'gallery'
            };
            siteData.gallery.push(newImage);
            loadGalleryData();
            break;
            
        case 'story':
            // Handle story image upload
            if (!siteData.story) siteData.story = [];
            const storyImage = {
                id: 'story-' + (siteData.story.length + 1),
                src: imagePath, // Use server path
                dataUrl: imageUrl, // Keep base64 for preview
                visible: true,
                title: fileName.replace(/\.[^/.]+$/, ''),
                description: 'Câu chuyện mới',
                content: 'Nội dung câu chuyện...'
            };
            siteData.story.push(storyImage);
            loadStoryData();
            break;
    }
    
    // Save file info for tracking
    if (!siteData.admin) siteData.admin = {};
    if (!siteData.admin.uploadedFiles) siteData.admin.uploadedFiles = [];
    
    siteData.admin.uploadedFiles.push({
        originalName: fileName,
        fileName: fileName,
        path: imagePath,
        type: type,
        size: 0, // Will be updated if we have file size
        uploadTime: new Date().toISOString(),
        dataUrl: imageUrl
    });
}

// Load overview data
function loadOverviewData() {
    updateOverviewStats();
}

// Load hero data
function loadHeroData() {
    // Hero data is already loaded in updateFormFields
}

// Load couple data
function loadCoupleData() {
    console.log('🔄 Loading couple data...');
    console.log('📊 siteData.couple:', siteData.couple);
    
    if (siteData.couple) {
        // Update form fields with couple data
        updateCoupleFormFields();
        
        // Update couple images
        updateCoupleImages();
        
        console.log('✅ Couple data loaded successfully');
    } else {
        console.log('❌ No couple data found in siteData');
        // Initialize empty couple data structure
        if (!siteData.couple) {
            siteData.couple = {
                groom: {
                    name: '',
                    description: ''
                },
                bride: {
                    name: '',
                    description: ''
                },
                parents: {
                    groom: {
                        father: '',
                        mother: ''
                    },
                    bride: {
                        father: '',
                        mother: ''
                    }
                },
                groomImage: '',
                brideImage: ''
            };
        }
    }
}

// Load story data
function loadStoryData() {
    const container = document.getElementById('storiesList');
    if (!container) return;
    
    if (!siteData.story || siteData.story.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-book fa-3x mb-3"></i>
                <h6>Chưa có câu chuyện nào</h6>
                <p>Nhấn "Thêm câu chuyện" để bắt đầu</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    siteData.story.forEach((story, index) => {
        html += `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-4">
                            <img src="${story.src}" class="img-fluid rounded" alt="${story.title}" 
                                 style="max-height: 150px; object-fit: cover; width: 100%;"
                                 onerror="this.src='./public/images/gallery/gallery-01.jpg'">
                        </div>
                        <div class="col-md-8">
                            <div class="mb-2">
                                <label class="form-label">Tiêu đề</label>
                                <input type="text" class="form-control" value="${story.title || ''}" 
                                       oninput="updateStoryField(${index}, 'title', this.value)">
                            </div>
                            <div class="mb-2">
                                <label class="form-label">Mô tả</label>
                                <input type="text" class="form-control" value="${story.description || ''}" 
                                       oninput="updateStoryField(${index}, 'description', this.value)">
                            </div>
                            <div class="mb-2">
                                <label class="form-label">Nội dung</label>
                                <textarea class="form-control" rows="3" 
                                          oninput="updateStoryField(${index}, 'content', this.value)">${story.content || ''}</textarea>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" ${story.visible ? 'checked' : ''} 
                                           onchange="updateStoryField(${index}, 'visible', this.checked)">
                                    <label class="form-check-label">Hiển thị</label>
                                </div>
                                <div class="btn-group">
                                    <button class="btn btn-sm btn-outline-danger" onclick="removeStory(${index})">
                                        <i class="fas fa-trash me-1"></i>Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Load gallery data
function loadGalleryData() {
    const container = document.getElementById('galleryImages');
    if (!container) return;
    
    if (!siteData.gallery || siteData.gallery.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center text-muted py-4">
                <i class="fas fa-images fa-3x mb-3"></i>
                <h6>Chưa có ảnh gallery nào</h6>
                <p>Nhấn "Thêm ảnh" để bắt đầu</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    siteData.gallery.forEach((image, index) => {
        // Use dataUrl for preview if available, otherwise use src
        const previewSrc = image.dataUrl || image.src;
        html += `
            <div class="col-md-4 col-lg-3 mb-3">
                <div class="card">
                    <img src="${previewSrc}" class="card-img-top" alt="${image.title}" 
                         style="height: 200px; object-fit: cover;"
                         onerror="this.src='./public/images/gallery/gallery-01.jpg'">
                    <div class="card-body">
                        <h6 class="card-title">${image.title || 'Ảnh ' + (index + 1)}</h6>
                        <small class="text-muted d-block mb-2">
                            ${image.src ? `Đường dẫn: ${image.src}` : 'Chưa có đường dẫn'}
                        </small>
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" ${image.visible ? 'checked' : ''} 
                                       onchange="updateGalleryField(${index}, 'visible', this.checked)">
                                <label class="form-check-label">Hiển thị</label>
                            </div>
                            <button class="btn btn-sm btn-outline-danger" onclick="removeGalleryImage(${index})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Load payment data
function loadPaymentData() {
    // Payment data is already loaded in updateFormFields
}

// Load event data
function loadEventData() {
    // Event data is already loaded in updateFormFields
}

// Load wishes data
function loadWishesData() {
    // Wishes data is already loaded in updateFormFields
}

// Load theme data
function loadThemeData() {
    // Theme data is already loaded in updateFormFields
}

// Load layout data
function loadLayoutData() {
    // Layout data is already loaded in updateFormFields
}

// Load settings data
function loadSettingsData() {
    // Settings data is already loaded in updateFormFields
}

// Update story field
function updateStoryField(index, field, value) {
    if (siteData.story && siteData.story[index]) {
        siteData.story[index][field] = value;
    }
}

// Remove story
function removeStory(index) {
    Swal.fire({
        title: 'Xóa câu chuyện?',
        text: 'Bạn có chắc chắn muốn xóa câu chuyện này?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            if (siteData.story) {
                siteData.story.splice(index, 1);
                loadStoryData();
                Swal.fire({
                    title: 'Đã xóa!',
                    text: 'Câu chuyện đã được xóa',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000
                });
            }
        }
    });
}

// Update gallery field
function updateGalleryField(index, field, value) {
    if (siteData.gallery && siteData.gallery[index]) {
        siteData.gallery[index][field] = value;
    }
}

// Remove gallery image
function removeGalleryImage(index) {
    Swal.fire({
        title: 'Xóa ảnh?',
        text: 'Bạn có chắc chắn muốn xóa ảnh này?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            if (siteData.gallery) {
                siteData.gallery.splice(index, 1);
                loadGalleryData();
                Swal.fire({
                    title: 'Đã xóa!',
                    text: 'Ảnh đã được xóa khỏi gallery',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000
                });
            }
        }
    });
}

// Trigger real-time update on index page
function triggerIndexUpdate() {
    try {
        // Dispatch custom event for real-time updates
        const updateEvent = new CustomEvent('siteDataUpdated', {
            detail: { data: siteData }
        });
        window.dispatchEvent(updateEvent);
        
        // Also try to update iframe preview if open
        const previewFrame = document.getElementById('previewFrame');
        if (previewFrame && previewFrame.contentWindow) {
            try {
                previewFrame.contentWindow.postMessage({
                    type: 'siteDataUpdate',
                    data: siteData
                }, '*');
                
                // Force refresh iframe after a short delay
                setTimeout(() => {
                    if (previewFrame && previewFrame.contentWindow) {
                        previewFrame.src = previewFrame.src;
                    }
                }, 500);
            } catch (e) {
                console.log('Could not update preview frame:', e);
            }
        }
        
        // Try to update any open index.html windows
        try {
            // This will work if index.html is open in another tab/window
            window.postMessage({
                type: 'siteDataUpdate',
                data: siteData
            }, '*');
        } catch (e) {
            console.log('Could not post message to other windows:', e);
        }
        
        console.log('Triggered real-time update');
    } catch (error) {
        console.error('Error triggering update:', error);
    }
}

// Scroll to top function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Load data from index.html
async function loadDataFromIndex() {
    try {
        showAlert('Đang tải dữ liệu từ Index...', 'info');
        
        // Create hidden iframe to load index.html
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = './index.html';
        document.body.appendChild(iframe);
        
        iframe.onload = function() {
            try {
                const embeddedData = iframe.contentWindow.embeddedSiteData;
                if (embeddedData) {
                    // Merge with existing data to preserve any admin-specific settings
                    siteData = { ...siteData, ...embeddedData };
                    isDataLoaded = true;
                    
                    console.log('Data loaded from index:', siteData);
                    
                    // Update admin interface with new data
                    updateAdminInterface();
                    
                    // Update all tab content
                    loadTabContent('#overview');
                    loadTabContent('#hero');
                    loadTabContent('#couple');
                    loadTabContent('#story');
                    loadTabContent('#gallery');
                    loadTabContent('#payment');
                    loadTabContent('#event');
                    loadTabContent('#wishes');
                    loadTabContent('#theme');
                    
                    // Save to localStorage
                    localStorage.setItem('siteDataOverride', JSON.stringify(siteData));
                    
                    showAlert('Đã tải dữ liệu từ Index thành công! Tất cả form đã được cập nhật.', 'success');
                } else {
                    throw new Error('Không tìm thấy dữ liệu trong Index');
                }
            } catch (e) {
                console.error('Error extracting data from index:', e);
                showAlert('Lỗi khi tải dữ liệu từ Index: ' + e.message, 'error');
            } finally {
                document.body.removeChild(iframe);
            }
        };
        
        iframe.onerror = function() {
            document.body.removeChild(iframe);
            showAlert('Không thể tải Index.html', 'error');
        };
        
    } catch (error) {
        console.error('Error loading data from index:', error);
        showAlert('Lỗi khi tải dữ liệu từ Index', 'error');
    }
}

// Export uploaded files - Pure JavaScript solution
function exportUploadedFiles() {
    if (!siteData.admin?.uploadedFiles || siteData.admin.uploadedFiles.length === 0) {
        showAlert('Không có file nào để xuất', 'warning');
        return;
    }
    
    try {
        // Create a summary of uploaded files
        let summary = '# Danh sách file đã tải lên\n\n';
        summary += '| File gốc | Tên file mới | Đường dẫn | Loại | Kích thước | Thời gian |\n';
        summary += '|----------|--------------|-----------|------|------------|----------|\n';
        
        siteData.admin.uploadedFiles.forEach(file => {
            const sizeKB = (file.size / 1024).toFixed(2);
            const uploadTime = new Date(file.uploadTime).toLocaleString('vi-VN');
            summary += `| ${file.originalName} | ${file.fileName} | ${file.path} | ${file.type} | ${sizeKB} KB | ${uploadTime} |\n`;
        });
        
        summary += '\n## Hướng dẫn sử dụng\n';
        summary += '1. Tạo các thư mục sau trong public/images/:\n';
        summary += '   - couple/ (cho ảnh cặp đôi)\n';
        summary += '   - qr/ (cho mã QR)\n';
        summary += '   - gallery/ (cho ảnh gallery và story)\n';
        summary += '   - banner/ (cho ảnh banner khác)\n';
        summary += '2. Copy các file ảnh vào đúng thư mục tương ứng\n';
        summary += '3. Đảm bảo tên file khớp với tên trong bảng trên\n';
        summary += '\n## Lưu ý\n';
        summary += '- Các file đã được tải xuống tự động khi upload\n';
        summary += '- Nếu sử dụng Chrome/Edge, có thể chọn vị trí lưu file trực tiếp\n';
        summary += '- Với Firefox/Safari, file sẽ được tải xuống thư mục Downloads\n';
        
        // Download summary file
        const summaryBlob = new Blob([summary], {type: 'text/markdown'});
        const summaryUrl = URL.createObjectURL(summaryBlob);
        const summaryLink = document.createElement('a');
        summaryLink.href = summaryUrl;
        summaryLink.download = 'uploaded-files-summary.md';
        summaryLink.click();
        URL.revokeObjectURL(summaryUrl);
        
        // Download each image file (if not already downloaded)
        siteData.admin.uploadedFiles.forEach((file, index) => {
            setTimeout(() => {
                downloadImageFile(file.fileName, file.dataUrl);
            }, index * 500); // Delay to avoid browser blocking multiple downloads
        });
        
        showAlert(`Đang tải xuống ${siteData.admin.uploadedFiles.length} file và 1 file hướng dẫn...`, 'success');
        
    } catch (error) {
        console.error('Error exporting files:', error);
        showAlert('Lỗi khi xuất file', 'error');
    }
}

// Export functions for global access
window.updateStoryField = updateStoryField;
window.removeStory = removeStory;
window.updateGalleryField = updateGalleryField;
window.removeGalleryImage = removeGalleryImage;
window.triggerIndexUpdate = triggerIndexUpdate;
window.scrollToTop = scrollToTop;
window.loadDataFromIndex = loadDataFromIndex;
window.exportUploadedFiles = exportUploadedFiles;
