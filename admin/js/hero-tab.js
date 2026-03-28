// Hero Tab JavaScript
console.log('🚀 Hero tab script loaded');
console.log('🔍 Window initializeHero function exists:', typeof window.initializeHero);
console.log('🔍 Current window.location:', window.location.href);

// Hero-specific variables
let heroData = {};

// Initialize hero tab
function initializeHero() {
    console.log('🚀 Initializing hero tab');
    console.log('📊 Current window.siteData:', window.siteData);
    
    // First check if window.siteData exists and has data
    if (window.siteData && Object.keys(window.siteData).length > 0) {
        console.log('📊 Using existing window.siteData');
        heroData = window.siteData;
    }
    
    // Load data from API (will update heroData and window.siteData)
    loadHeroDataFromAPI().then(() => {
        console.log('✅ Hero data loaded from API, filling fields...');
        console.log('📊 Final heroData:', heroData);
        console.log('📊 Final window.siteData:', window.siteData);
        
        // IMPORTANT: Fill form fields FIRST
        fillHeroFormFields();
        
        // Setup event listeners AFTER filling (with delay)
        setTimeout(() => {
            setupHeroEventListeners();
        }, 700); // Wait for fillHeroFormFields to complete (500ms + buffer)
        
        // Initialize banner management
        initializeHeroBannerManagement();
    }).catch(error => {
        console.error('❌ Error loading hero data:', error);
        // Use window.siteData as fallback
        if (typeof window.siteData !== 'undefined' && window.siteData && Object.keys(window.siteData).length > 0) {
            console.log('📊 Using global siteData as fallback:', window.siteData);
            heroData = window.siteData;
            fillHeroFormFields();
            setTimeout(() => {
                setupHeroEventListeners();
            }, 700);
            initializeHeroBannerManagement();
        } else {
            console.error('❌ No data available from API or window.siteData');
            // Still try to fill fields in case window.siteData gets loaded later
            setTimeout(() => {
                fillHeroFormFields();
                setTimeout(() => {
                    setupHeroEventListeners();
                }, 700);
                initializeHeroBannerManagement();
            }, 1000);
        }
    });
}

// Load data from API
async function loadHeroDataFromAPI() {
    console.log('🔄 Loading hero data from API...');
    
    try {
        const response = await fetch(window.location.origin + '/api/data');
        console.log('📡 API Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📊 API Response:', result);
        
        if (result.success && result.data) {
            heroData = result.data;
            console.log('✅ Hero data loaded:', heroData);
            console.log('📊 Hero section data:', heroData.hero);
            console.log('📊 Full heroData structure:', JSON.stringify(heroData, null, 2));
            
            // Fix nested structure - move hero.hero to hero
            if (heroData.hero && heroData.hero.hero) {
                console.log('🔧 Fixing nested hero structure...');
                heroData.hero = heroData.hero.hero;
                console.log('✅ Fixed hero data:', heroData.hero);
            }
            
            if (typeof window !== 'undefined') {
                window.siteData = heroData;
                siteData = heroData; // Keep local variable in sync
                console.log('✅ Updated global siteData');
            }
        } else {
            throw new Error('API response invalid');
        }
    } catch (error) {
        console.error('❌ Error loading hero data:', error);
        heroData = {
            hero: {
                groomName: '',
                brideName: '',
                weddingDate: '',
                weddingTime: '',
                weddingLocation: '',
                slides: []
            },
            meta: {
                title: '',
                description: '',
                primaryColor: '#9f5958'
            }
        };
        console.log('⚠️ Using default hero data');
    }
}

// Fill form fields
function fillHeroFormFields() {
    console.log('🔄 Filling hero form fields...');
    console.log('📊 Hero data:', heroData);
    console.log('📊 Window siteData:', window.siteData);
    console.log('📊 Hero data keys:', Object.keys(heroData));
    
    // Use heroData or fallback to window.siteData
    const dataSource = heroData && Object.keys(heroData).length > 0 ? heroData : (window.siteData || {});
    console.log('📊 Using dataSource:', dataSource);
    
    setTimeout(() => {
        const fields = ['groomName', 'brideName', 'weddingDate', 'weddingTime', 'weddingLocation', 'mainTitle', 'description', 'primaryColor'];
        console.log('🔍 Checking form fields:');
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            console.log(`  ${fieldId}: ${field ? 'EXISTS' : 'NOT FOUND'}`);
        });
        
        // Try multiple data sources for groom/bride names
        let groomName = '';
        let brideName = '';
        
        // Priority 1: heroData.hero or dataSource.hero
        if (dataSource.hero) {
            groomName = dataSource.hero.groomName || '';
            brideName = dataSource.hero.brideName || '';
            console.log('📊 From hero section:', { groomName, brideName });
        }
        
        // Priority 2: couple section (if hero doesn't have names)
        if ((!groomName || !brideName) && dataSource.couple) {
            if (!groomName && dataSource.couple.groom) {
                groomName = dataSource.couple.groom.name || dataSource.couple.groomName || '';
            }
            if (!brideName && dataSource.couple.bride) {
                brideName = dataSource.couple.bride.name || dataSource.couple.brideName || '';
            }
            console.log('📊 From couple section:', { groomName, brideName });
        }
        
        // Priority 3: Root level (legacy structure)
        if (!groomName && dataSource.groomName) {
            groomName = dataSource.groomName;
        }
        if (!brideName && dataSource.brideName) {
            brideName = dataSource.brideName;
        }
        console.log('📊 Final names:', { groomName, brideName });
        
        // Fill names
        if (groomName) {
            setHeroFieldValue('groomName', groomName);
            console.log('✅ Set groomName:', groomName);
        } else {
            console.warn('⚠️ groomName not found in any data source');
        }
        
        if (brideName) {
            setHeroFieldValue('brideName', brideName);
            console.log('✅ Set brideName:', brideName);
        } else {
            console.warn('⚠️ brideName not found in any data source');
        }
        
        // Fill hero section data
        if (dataSource.hero) {
            console.log('📊 Hero section data:', dataSource.hero);
            
            setHeroFieldValue('weddingDate', dataSource.hero.weddingDate);
            setHeroFieldValue('weddingTime', dataSource.hero.weddingTime || '11:00');
            setHeroFieldValue('weddingLocation', dataSource.hero.weddingLocation);
            
            // Load banner slides
            if (dataSource.hero.slides && dataSource.hero.slides.length > 0) {
                console.log('🖼️ Loading banner slides:', dataSource.hero.slides);
                window.bannerSlides = dataSource.hero.slides;
                heroData.hero = heroData.hero || {};
                heroData.hero.slides = dataSource.hero.slides;
                renderHeroBannerSlides();
            } else {
                console.log('⚠️ No banner slides found');
            }
        } else {
            console.log('⚠️ hero section not found in dataSource');
            
            // Try direct API call as last resort
            fetch(window.location.origin + '/api/data')
                .then(response => response.json())
                .then(data => {
                    console.log('🔄 Direct API call result:', data);
                    if (data.success && data.data) {
                        const apiData = data.data;
                        
                        // Try to get names from API response
                        const apiGroomName = apiData.hero?.groomName || 
                                            apiData.couple?.groom?.name || 
                                            apiData.couple?.groomName || 
                                            apiData.groomName || '';
                        const apiBrideName = apiData.hero?.brideName || 
                                           apiData.couple?.bride?.name || 
                                           apiData.couple?.brideName || 
                                           apiData.brideName || '';
                        
                        if (apiGroomName) {
                            setHeroFieldValue('groomName', apiGroomName);
                            console.log('✅ Set groomName from API:', apiGroomName);
                        }
                        if (apiBrideName) {
                            setHeroFieldValue('brideName', apiBrideName);
                            console.log('✅ Set brideName from API:', apiBrideName);
                        }
                        
                        if (apiData.hero) {
                            setHeroFieldValue('weddingDate', apiData.hero.weddingDate);
                            setHeroFieldValue('weddingLocation', apiData.hero.weddingLocation);
                        }
                        
                        console.log('✅ Hero fields filled from direct API call!');
                    }
                })
                .catch(error => {
                    console.error('❌ Direct API call failed:', error);
                });
        }
        
        // Fill meta data
        if (dataSource.meta) {
            console.log('📊 Meta section data:', dataSource.meta);
            setHeroFieldValue('mainTitle', dataSource.meta.title);
            setHeroFieldValue('description', dataSource.meta.description);
            setHeroFieldValue('primaryColor', dataSource.meta.primaryColor || '#9f5958');
        }
        
        console.log('✅ Hero form fields filled');
    }, 500);
}

// Set field value
function setHeroFieldValue(fieldId, value) {
    const field = document.getElementById(fieldId);
    console.log(`🔍 setHeroFieldValue called: fieldId=${fieldId}, value="${value}", field=${field ? 'EXISTS' : 'NOT FOUND'}`);
    
    if (field && value !== undefined && value !== null && value !== '') {
        field.value = value;
        console.log(`✅ Hero: Set field ${fieldId} = ${value}`);
        field.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
        console.log(`❌ Hero: Field ${fieldId} not found or value invalid (value: "${value}", type: ${typeof value})`);
        if (!field) {
            console.log(`   Field ${fieldId} not found in DOM`);
        } else if (value === undefined || value === null || value === '') {
            console.log(`   Value is empty/null/undefined`);
        }
    }
}

// Setup event listeners
function setupHeroEventListeners() {
    console.log('🔄 Setting up hero event listeners...');
    const heroFields = ['groomName', 'brideName', 'weddingDate', 'weddingTime', 'weddingLocation', 'mainTitle', 'description', 'primaryColor'];
    heroFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', updateHeroDataFromForm);
            console.log(`✅ Event listener added for ${fieldId}`);
        }
    });
}

// Update data from form
function updateHeroDataFromForm() {
    if (!heroData) heroData = {};
    if (!heroData.hero) heroData.hero = {};
    if (!heroData.meta) heroData.meta = {};
    
    // Update hero fields ONLY
    heroData.hero.groomName = document.getElementById('groomName')?.value || '';
    heroData.hero.brideName = document.getElementById('brideName')?.value || '';
    heroData.hero.weddingDate = document.getElementById('weddingDate')?.value || '';
    heroData.hero.weddingTime = document.getElementById('weddingTime')?.value || '';
    heroData.hero.weddingLocation = document.getElementById('weddingLocation')?.value || '';
    
    heroData.meta.title = document.getElementById('mainTitle')?.value || '';
    heroData.meta.description = document.getElementById('description')?.value || '';
    
    // Remove any duplicate root-level fields
    delete heroData.brideName;
    delete heroData.groomName;
    delete heroData.weddingDate;
    delete heroData.weddingLocation;
    delete heroData.weddingTime;
    delete heroData.slides;
    heroData.meta.primaryColor = document.getElementById('primaryColor')?.value || '#9f5958';
}

// Banner management
function initializeHeroBannerManagement() {
    console.log('🚀 Initializing hero banner management');
    setTimeout(renderHeroBannerSlides, 300);
}

function renderHeroBannerSlides() {
    console.log('🎨 Rendering hero banner slides');
    const container = document.getElementById('bannerSlidesList');
    if (!container) {
        console.log('❌ Banner slides container not found');
        return;
    }
    
    if (!heroData.hero || !heroData.hero.slides || heroData.hero.slides.length === 0) {
        container.innerHTML = `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="image-upload-area" data-upload-type="banner" onclick="selectHeroBannerImage()" style="border: 2px dashed #dee2e6; border-radius: 8px; padding: 40px 20px; text-align: center; cursor: pointer; transition: all 0.3s ease; background: #f8f9fa; min-height: 250px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                    <div class="upload-placeholder" style="color: #6c757d;">
                        <i class="fas fa-image fa-3x mb-3" style="color: #6c757d;"></i>
                        <p style="margin: 0; font-size: 16px;">Nhấn để tải ảnh banner</p>
                    </div>
                </div>
            </div>
        `;
        // Also update preview
        renderBannerPreview();
        return;
    }
    
    container.innerHTML = heroData.hero.slides.map((slide, index) => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="image-upload-area" data-upload-type="banner" onclick="updateHeroBannerImage('${slide.id}')" style="border: 2px dashed #dee2e6; border-radius: 8px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.3s ease; background: #f8f9fa; position: relative; min-height: 250px; display: flex; flex-direction: column; justify-content: center;">
                <div class="upload-placeholder" style="color: #6c757d; display: none;">
                    <i class="fas fa-image fa-2x mb-2" style="color: #6c757d;"></i>
                    <p style="margin: 0; font-size: 14px;">Nhấn để thay đổi ảnh</p>
                </div>
                <img src="${slide.src}" alt="${slide.title}" class="uploaded-image" style="width: 100%; height: auto; max-height: 200px; object-fit: contain; border-radius: 8px; box-shadow: inset 0 0 0 15px #fff; cursor: pointer;" title="Click để thay đổi ảnh">
                <div class="banner-slide-info mt-2">
                    <h6 class="banner-slide-title mb-2" style="font-size: 14px; font-weight: 600;">${slide.title}</h6>
                    <div class="banner-slide-actions">
                        <button class="btn btn-sm btn-outline-secondary me-1" onclick="event.stopPropagation(); editHeroBannerSlide('${slide.id}')" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="event.stopPropagation(); deleteHeroBannerSlide('${slide.id}')" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('') + `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="image-upload-area" data-upload-type="banner" onclick="selectHeroBannerImage()" style="border: 2px dashed #dee2e6; border-radius: 8px; padding: 40px 20px; text-align: center; cursor: pointer; transition: all 0.3s ease; background: #f8f9fa; min-height: 250px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <div class="upload-placeholder" style="color: #6c757d;">
                    <i class="fas fa-plus fa-3x mb-3" style="color: #6c757d;"></i>
                    <p style="margin: 0; font-size: 16px;">Thêm ảnh banner</p>
                </div>
            </div>
        </div>
    `;
    
    // Also update preview
    renderBannerPreview();
}

// Banner functions
function addBannerSlide() {
    console.log('➕ Adding new banner slide');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = function(e) {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                uploadHeroBannerFile(file);
            }
        });
    };
    input.click();
}

// Delete old banner files
async function deleteOldBannerFiles() {
    console.log('🗑️ Cleaning up old banner files...');
    
    try {
        // Get current banner files from data
        const currentSlides = heroData.hero?.slides || [];
        const currentFilenames = currentSlides.map(slide => {
            const pathParts = slide.src.split('/');
            return pathParts[pathParts.length - 1]; // Get filename
        });
        
        console.log('📊 Current banner files:', currentFilenames);
        
        // Get all banner files from directory
        const dirResponse = await fetch(window.location.origin + '/api/list-files?type=banner');
        const dirData = await dirResponse.json();
        
        if (dirData.success && dirData.files) {
            const allFiles = dirData.files;
            console.log('📁 All banner files:', allFiles);
            
            // Find files to delete (not in current slides)
            const filesToDelete = allFiles.filter(filename => 
                !currentFilenames.includes(filename)
            );
            
            console.log('🗑️ Files to delete:', filesToDelete);
            
            // Delete each old file
            for (const filename of filesToDelete) {
                try {
                    const deleteResponse = await fetch(window.location.origin + '/api/delete-file', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            filename: filename,
                            type: 'banner'
                        })
                    });
                    
                    const deleteResult = await deleteResponse.json();
                    if (deleteResult.success) {
                        console.log(`✅ Deleted old file: ${filename}`);
                    } else {
                        console.log(`⚠️ Failed to delete: ${filename}`);
                    }
                } catch (error) {
                    console.error(`❌ Error deleting ${filename}:`, error);
                }
            }
        }
    } catch (error) {
        console.error('❌ Error cleaning old files:', error);
    }
}

// Select hero banner image using common component
function selectHeroBannerImage() {
    console.log('📷 Selecting hero banner image');
    
    // Use common ImageUploadComponent
    if (typeof ImageUploadComponent !== 'undefined') {
        const uploader = new ImageUploadComponent({
            type: 'banner',
            onSuccess: (result) => {
                // Update image preview
                uploader.updateImagePreview('hero-banner-preview', result.url);
                
                // Add to slides
                const newSlide = {
                    id: `banner-${Date.now()}`,
                    src: result.url,
                    title: `Banner ${Date.now()}`,
                    description: 'Ảnh banner mới',
                    visible: true
                };
                
                if (!heroData.hero.slides) {
                    heroData.hero.slides = [];
                }
                heroData.hero.slides.push(newSlide);
                
                // Re-render slides
                renderHeroBannerSlides();
                
                // Clean up old files
                deleteOldBannerFiles();
                
                console.log('✅ Hero banner uploaded successfully');
            },
            onError: (error) => {
                console.error('❌ Upload error:', error);
            }
        });
        
        uploader.selectImage();
    } else {
        // Fallback to old method
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                uploadHeroBannerFile(file);
            }
        };
        input.click();
    }
}

// Update existing hero banner image
function updateHeroBannerImage(slideId) {
    console.log('📷 Updating hero banner image:', slideId);
    
    // Find the slide
    const slide = heroData.hero?.slides?.find(s => s.id === slideId);
    if (!slide) {
        Swal.fire('Lỗi', 'Không tìm thấy banner slide', 'error');
        return;
    }
    
    // Use common ImageUploadComponent
    if (typeof ImageUploadComponent !== 'undefined') {
        const uploader = new ImageUploadComponent({
            type: 'banner',
            onSuccess: (result) => {
                // Update slide image
                slide.src = result.url;
                
                // Re-render slides
                renderHeroBannerSlides();
                
                // Clean up old files
                deleteOldBannerFiles();
                
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: 'Đã cập nhật ảnh banner',
                    timer: 2000,
                    showConfirmButton: false
                });
                
                console.log('✅ Hero banner updated successfully');
            },
            onError: (error) => {
                console.error('❌ Upload error:', error);
            }
        });
        
        uploader.selectImage();
    } else {
        // Fallback to old method
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                // Update slide image
                slide.src = URL.createObjectURL(file);
                
                // Upload file
                uploadHeroBannerFile(file);
            }
        };
        input.click();
    }
}

function uploadHeroBannerFile(file) {
    console.log('📤 Uploading banner file:', file.name);
    
    // Show loading
    Swal.fire({
        title: 'Đang tải ảnh...',
        text: 'Vui lòng đợi',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'banner');
    
    fetch(window.location.origin + '/api/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('📡 Upload response:', data);
        
        if (data.success) {
            const newSlide = {
                id: 'banner-' + Date.now(),
                src: data.url || `./public/images/banner/${data.filename}`,
                title: `Banner ${Date.now()}`,
                description: 'Ảnh banner mới',
                visible: true
            };
            
            if (!heroData.hero) heroData.hero = {};
            if (!heroData.hero.slides) heroData.hero.slides = [];
            heroData.hero.slides.push(newSlide);
            
            renderHeroBannerSlides();
            
            // Clean up old files after successful upload
            setTimeout(() => {
                deleteOldBannerFiles();
            }, 1000);
            
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Đã thêm ảnh banner',
                timer: 2000,
                showConfirmButton: false
            });
            
            console.log('✅ Banner added successfully');
        } else {
            throw new Error(data.message || 'Upload failed');
        }
    })
    .catch(error => {
        console.error('❌ Upload error:', error);
        Swal.fire('Lỗi', `Không thể tải ảnh: ${error.message}`, 'error');
    });
}

function editHeroBannerSlide(slideId) {
    console.log('✏️ Edit banner slide:', slideId);
    
    // Find the slide
    const slide = heroData.hero?.slides?.find(s => s.id === slideId);
    if (!slide) {
        Swal.fire('Lỗi', 'Không tìm thấy banner slide', 'error');
        return;
    }
    
    // Show edit dialog
    Swal.fire({
        title: 'Chỉnh sửa banner',
        html: `
            <div class="text-start">
                <div class="mb-3">
                    <label class="form-label">Tiêu đề:</label>
                    <input type="text" id="editSlideTitle" class="form-control" value="${slide.title || ''}">
                </div>
                <div class="mb-3">
                    <label class="form-label">Mô tả:</label>
                    <textarea id="editSlideDescription" class="form-control" rows="3">${slide.description || ''}</textarea>
                </div>
                <div class="mb-3">
                    <label class="form-label">Hiển thị:</label>
                    <select id="editSlideVisible" class="form-select">
                        <option value="true" ${slide.visible ? 'selected' : ''}>Có</option>
                        <option value="false" ${!slide.visible ? 'selected' : ''}>Không</option>
                    </select>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Lưu',
        cancelButtonText: 'Hủy',
        preConfirm: () => {
            const title = document.getElementById('editSlideTitle').value;
            const description = document.getElementById('editSlideDescription').value;
            const visible = document.getElementById('editSlideVisible').value === 'true';
            
            if (!title.trim()) {
                Swal.showValidationMessage('Vui lòng nhập tiêu đề');
                return false;
            }
            
            return { title, description, visible };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Update slide data
            slide.title = result.value.title;
            slide.description = result.value.description;
            slide.visible = result.value.visible;
            
            // Re-render slides
            renderHeroBannerSlides();
            
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Đã cập nhật banner slide',
                timer: 2000,
                showConfirmButton: false
            });
            
            console.log('✅ Banner slide updated:', slide);
        }
    });
}

// Edit banner slide (general function)
function editBannerSlide() {
    console.log('✏️ Edit banner slide (general)');
    
    if (!heroData.hero?.slides || heroData.hero.slides.length === 0) {
        Swal.fire('Thông báo', 'Chưa có banner slide nào để chỉnh sửa', 'info');
        return;
    }
    
    // Show slide selection
    const slideOptions = heroData.hero.slides.map(slide => 
        `<option value="${slide.id}">${slide.title || slide.id}</option>`
    ).join('');
    
    Swal.fire({
        title: 'Chọn banner để chỉnh sửa',
        html: `
            <div class="text-start">
                <div class="mb-3">
                    <label class="form-label">Banner slide:</label>
                    <select id="selectSlideToEdit" class="form-select">
                        ${slideOptions}
                    </select>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Chỉnh sửa',
        cancelButtonText: 'Hủy',
        preConfirm: () => {
            const slideId = document.getElementById('selectSlideToEdit').value;
            if (!slideId) {
                Swal.showValidationMessage('Vui lòng chọn banner slide');
                return false;
            }
            return slideId;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            editHeroBannerSlide(result.value);
        }
    });
}

function deleteHeroBannerSlide(slideId) {
    console.log('🗑️ Delete banner slide:', slideId);
    
    Swal.fire({
        title: 'Xác nhận xóa?',
        text: 'Bạn có chắc muốn xóa ảnh banner này?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            if (heroData.hero && heroData.hero.slides) {
                heroData.hero.slides = heroData.hero.slides.filter(s => s.id !== slideId);
                renderHeroBannerSlides();
                
                Swal.fire({
                    icon: 'success',
                    title: 'Đã xóa!',
                    text: 'Ảnh banner đã được xóa',
                    timer: 2000,
                    showConfirmButton: false
                });
                
                console.log('✅ Banner deleted');
            }
        }
    });
}

function clearBannerSlides() {
    console.log('🧹 Clear all banner slides');
    
    Swal.fire({
        title: 'Xác nhận xóa tất cả?',
        text: 'Bạn có chắc muốn xóa TẤT CẢ ảnh banner?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xóa tất cả',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            if (heroData.hero) {
                heroData.hero.slides = [];
                renderHeroBannerSlides();
                
                Swal.fire({
                    icon: 'success',
                    title: 'Đã xóa!',
                    text: 'Tất cả ảnh banner đã được xóa',
                    timer: 2000,
                    showConfirmButton: false
                });
                
                console.log('✅ All banners cleared');
            }
        }
    });
}

function reloadBannerData() {
    console.log('🔄 Reload banner data');
    loadHeroDataFromAPI().then(renderHeroBannerSlides);
}

function refreshPreview() {
    console.log('🔄 Refresh banner preview');
    renderBannerPreview();
}

// Render banner preview
function renderBannerPreview() {
    console.log('🎨 Rendering banner preview');
    const previewContainer = document.getElementById('bannerPreview');
    
    if (!previewContainer) {
        console.log('❌ Banner preview container not found');
        return;
    }
    
    if (!heroData.hero || !heroData.hero.slides || heroData.hero.slides.length === 0) {
        previewContainer.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="fas fa-images fa-3x mb-3"></i>
                <p>Chưa có ảnh banner để xem trước</p>
            </div>
        `;
        return;
    }
    
    // Render carousel preview
    const slides = heroData.hero.slides;
    previewContainer.innerHTML = `
        <div id="bannerCarousel" class="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-interval="3000">
            <div class="carousel-indicators">
                ${slides.map((slide, index) => `
                    <button type="button" data-bs-target="#bannerCarousel" data-bs-slide-to="${index}" 
                        ${index === 0 ? 'class="active" aria-current="true"' : ''} 
                        aria-label="Slide ${index + 1}"></button>
                `).join('')}
            </div>
            <div class="carousel-inner">
                ${slides.map((slide, index) => `
                    <div class="carousel-item ${index === 0 ? 'active' : ''}" data-bs-interval="3000">
                        <img src="${slide.src}" class="d-block w-100" alt="${slide.title}" 
                            style="max-height: 400px; object-fit: cover;">
                        <div class="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded p-2">
                            <h5>${slide.title}</h5>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#bannerCarousel" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#bannerCarousel" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
        </div>
    `;
    
    // Initialize carousel with auto-play
    setTimeout(() => {
        const carouselElement = document.getElementById('bannerCarousel');
        console.log('🔍 Carousel element:', carouselElement);
        console.log('🔍 Bootstrap available:', typeof bootstrap !== 'undefined');
        console.log('🔍 Bootstrap.Carousel:', typeof bootstrap?.Carousel);
        
        if (carouselElement && typeof bootstrap !== 'undefined') {
            try {
                new bootstrap.Carousel(carouselElement, {
                    interval: 3000,
                    ride: 'carousel',
                    pause: 'hover'
                });
                console.log('✅ Carousel initialized with auto-play');
            } catch (error) {
                console.error('❌ Carousel initialization error:', error);
            }
        } else {
            console.error('❌ Carousel initialization failed - missing element or bootstrap');
        }
    }, 100);
    
    console.log('✅ Banner preview rendered');
}

// Save hero data
async function saveHeroData() {
    console.log('💾 Saving hero data...');
    console.log('📊 Current heroData:', heroData);
    
    // Update data from form before saving
    updateHeroDataFromForm();
    console.log('📊 Updated heroData:', heroData);
    
    // Create clean data structure for saving
    const cleanHeroData = {
        hero: {
            groomName: heroData.hero?.groomName || '',
            brideName: heroData.hero?.brideName || '',
            weddingDate: heroData.hero?.weddingDate || '',
            weddingTime: heroData.hero?.weddingTime || '11:00',
            weddingLocation: heroData.hero?.weddingLocation || '',
            slides: heroData.hero?.slides || []
        }
    };
    
    console.log('📊 Clean heroData for saving:', cleanHeroData);
    
    try {
        // Show loading
        Swal.fire({
            title: 'Đang lưu...',
            text: 'Vui lòng đợi',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        // Use existing API - save to hero section specifically
        let result;
        if (typeof AdminAPI === 'undefined') {
            console.error('❌ AdminAPI not found, using fetch directly');
            const response = await fetch(window.location.origin + '/api/data/hero', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cleanHeroData.hero)
            });
            result = await response.json();
        } else {
            const api = new AdminAPI();
            result = await api.saveData(cleanHeroData);
        }
        
        console.log('📡 Save result:', result);
        
        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Đã lưu thay đổi',
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            throw new Error(result.message || 'Lưu thất bại');
        }
    } catch (error) {
        console.error('❌ Save error:', error);
        Swal.fire('Lỗi', `Không thể lưu: ${error.message}`, 'error');
    }
}

// Test function to debug data loading
function testHeroData() {
    console.log('🧪 TESTING HERO DATA:');
    console.log('1. heroData:', heroData);
    console.log('2. window.heroData:', window.heroData);
    console.log('3. window.siteData:', window.siteData);
    
    // Test API call
    fetch(window.location.origin + '/api/data')
        .then(response => response.json())
        .then(data => {
            console.log('4. API Response:', data);
            console.log('5. API Hero data:', data.data?.hero);
            
            // Test form fields
            const fields = ['groomName', 'brideName', 'weddingDate', 'weddingLocation'];
            fields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                console.log(`6. Field ${fieldId}:`, field ? field.value : 'NOT FOUND');
            });
            
            // Force fill data
            if (data.data?.hero) {
                console.log('7. FORCE FILLING DATA...');
                setHeroFieldValue('groomName', data.data.hero.groomName);
                setHeroFieldValue('brideName', data.data.hero.brideName);
                setHeroFieldValue('weddingDate', data.data.hero.weddingDate);
                setHeroFieldValue('weddingLocation', data.data.hero.weddingLocation);
                console.log('8. Data filled!');
            }
        })
        .catch(error => {
            console.error('9. API Error:', error);
        });
}

// Test carousel manually
function testCarousel() {
    console.log('🧪 Testing carousel...');
    const carouselElement = document.getElementById('bannerCarousel');
    console.log('🔍 Carousel element:', carouselElement);
    console.log('🔍 Bootstrap available:', typeof bootstrap !== 'undefined');
    
    if (carouselElement && typeof bootstrap !== 'undefined') {
        try {
            // Force initialize carousel
            const carousel = new bootstrap.Carousel(carouselElement, {
                interval: 3000,
                ride: 'carousel',
                pause: 'hover'
            });
            console.log('✅ Carousel initialized manually');
            
            // Test next slide
            setTimeout(() => {
                carousel.next();
                console.log('🔄 Moved to next slide');
            }, 2000);
            
        } catch (error) {
            console.error('❌ Manual carousel error:', error);
        }
    } else {
        console.error('❌ Cannot test carousel - missing element or bootstrap');
    }
}

// Export functions and data
window.initializeHero = initializeHero;
window.heroData = heroData; // Export data for saving
window.saveHeroData = saveHeroData; // Export save function
window.testHeroData = testHeroData; // Export test function
window.testCarousel = testCarousel; // Export test carousel function
window.addBannerSlide = addBannerSlide;
window.editHeroBannerSlide = editHeroBannerSlide;
window.deleteHeroBannerSlide = deleteHeroBannerSlide;
window.clearBannerSlides = clearBannerSlides;
window.reloadBannerData = reloadBannerData;
window.refreshPreview = refreshPreview;

console.log('✅ Hero tab functions exported');

