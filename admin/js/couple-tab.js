// Couple Tab JavaScript
console.log('🚀 Couple tab script loaded');

// Couple-specific variables
let coupleData = {};

// Initialize couple tab
function initializeCouple() {
    console.log('🚀 Initializing couple tab');
    
    // Load data from API
    loadCoupleDataFromAPI().then(() => {
        console.log('✅ Couple data loaded from API, filling fields...');
        
        // Fill form fields
        fillCoupleFormFields();
        
        // Setup event listeners
        setTimeout(() => {
            setupCoupleEventListeners();
        }, 500);
        
    }).catch(error => {
        console.error('❌ Error loading couple data:', error);
        if (typeof window.siteData !== 'undefined' && window.siteData) {
            console.log('📊 Using global siteData as fallback:', window.siteData);
            coupleData = window.siteData;
            fillCoupleFormFields();
            setTimeout(() => {
                setupCoupleEventListeners();
            }, 500);
        }
    });
}

// Load data from API
async function loadCoupleDataFromAPI() {
    console.log('🔄 Loading couple data from API...');
    
    try {
        const response = await fetch('window.location.origin/api/data');
        console.log('📡 API Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📊 API Response:', result);
        
        if (result.success && result.data) {
            coupleData = result.data;
            console.log('✅ Couple data loaded:', coupleData);
            console.log('📊 Couple section data:', coupleData.couple);
            
            if (typeof window !== 'undefined') {
                window.siteData = coupleData;
                console.log('✅ Updated global siteData');
            }
        } else {
            throw new Error('API response invalid');
        }
    } catch (error) {
        console.error('❌ Error loading couple data:', error);
        coupleData = {
            couple: {
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
                }
            }
        };
        console.log('⚠️ Using default couple data');
    }
}

// Fill form fields
function fillCoupleFormFields() {
    console.log('🔄 Filling couple form fields...');
    console.log('📊 Couple data:', coupleData);
    
    setTimeout(() => {
        const fields = ['groomNameDetail', 'groomDescription', 'groomFather', 'groomMother', 
                       'brideNameDetail', 'brideDescription', 'brideFather', 'brideMother'];
        console.log('🔍 Checking form fields:');
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            console.log(`  ${fieldId}: ${field ? 'EXISTS' : 'NOT FOUND'}`);
        });
        
        if (coupleData.couple) {
            console.log('📊 Couple section data:', coupleData.couple);
            
            // Groom data
            if (coupleData.couple.groom) {
                setCoupleFieldValue('groomNameDetail', coupleData.couple.groom.name);
                setCoupleFieldValue('groomDescription', coupleData.couple.groom.description);
            }
            
            // Bride data
            if (coupleData.couple.bride) {
                setCoupleFieldValue('brideNameDetail', coupleData.couple.bride.name);
                setCoupleFieldValue('brideDescription', coupleData.couple.bride.description);
            }
            
            // Parents data
            if (coupleData.couple.parents) {
                if (coupleData.couple.parents.groom) {
                    setCoupleFieldValue('groomFather', coupleData.couple.parents.groom.father);
                    setCoupleFieldValue('groomMother', coupleData.couple.parents.groom.mother);
                }
                if (coupleData.couple.parents.bride) {
                    setCoupleFieldValue('brideFather', coupleData.couple.parents.bride.father);
                    setCoupleFieldValue('brideMother', coupleData.couple.parents.bride.mother);
                }
            }
        }
        
        console.log('✅ Couple form fields filled');
    }, 500);
}

// Set field value with debug
function setCoupleFieldValue(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.value = value || '';
        console.log(`✔ Couple: Set field ${fieldId} = ${value || '(empty)'}`);
    } else {
        console.log(`❌ Couple: Field ${fieldId} not found`);
    }
}

// Setup event listeners
function setupCoupleEventListeners() {
    console.log('🔧 Setting up couple event listeners...');
    
    const fields = ['groomNameDetail', 'groomDescription', 'groomFather', 'groomMother', 
                   'brideNameDetail', 'brideDescription', 'brideFather', 'brideMother'];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', updateCoupleDataFromForm);
            console.log(`✔ Event listener added for ${fieldId}`);
        }
    });
}

// Update data from form
function updateCoupleDataFromForm() {
    console.log('🔄 Updating couple data from form...');
    
    if (!coupleData.couple) {
        coupleData.couple = {};
    }
    
    if (!coupleData.couple.groom) {
        coupleData.couple.groom = {};
    }
    
    if (!coupleData.couple.bride) {
        coupleData.couple.bride = {};
    }
    
    if (!coupleData.couple.parents) {
        coupleData.couple.parents = {};
    }
    
    if (!coupleData.couple.parents.groom) {
        coupleData.couple.parents.groom = {};
    }
    
    if (!coupleData.couple.parents.bride) {
        coupleData.couple.parents.bride = {};
    }
    
    // Update groom data
    coupleData.couple.groom.name = document.getElementById('groomNameDetail')?.value || '';
    coupleData.couple.groom.description = document.getElementById('groomDescription')?.value || '';
    
    // Update bride data
    coupleData.couple.bride.name = document.getElementById('brideNameDetail')?.value || '';
    coupleData.couple.bride.description = document.getElementById('brideDescription')?.value || '';
    
    // Update parents data
    coupleData.couple.parents.groom.father = document.getElementById('groomFather')?.value || '';
    coupleData.couple.parents.groom.mother = document.getElementById('groomMother')?.value || '';
    coupleData.couple.parents.bride.father = document.getElementById('brideFather')?.value || '';
    coupleData.couple.parents.bride.mother = document.getElementById('brideMother')?.value || '';
    
    console.log('✅ Couple data updated from form');
}

// Save couple data
async function saveCoupleData() {
    console.log('💾 Saving couple data...');
    
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
        
        // Update data from form before saving
        updateCoupleDataFromForm();
        console.log('📊 Updated coupleData:', coupleData);
        
        // Use couple-specific API endpoint
        let result;
        if (typeof AdminAPI === 'undefined') {
            console.error('❌ AdminAPI not found, using fetch directly');
            const response = await fetch('window.location.origin/api/data/couple', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(coupleData.couple || coupleData)
            });
            result = await response.json();
        } else {
            const api = new AdminAPI();
            result = await api.saveData(coupleData);
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
function testCoupleData() {
    console.log('🧪 TESTING COUPLE DATA:');
    console.log('1. coupleData:', coupleData);
    console.log('2. window.coupleData:', window.coupleData);
    console.log('3. window.siteData:', window.siteData);
    
    // Test API call
    fetch('window.location.origin/api/data')
        .then(response => response.json())
        .then(data => {
            console.log('4. API Response:', data);
            console.log('5. API Couple data:', data.data?.couple);
            
            // Test form fields
            const fields = ['groomName', 'groomDescription', 'groomFather', 'groomMother', 
                           'brideName', 'brideDescription', 'brideFather', 'brideMother'];
            fields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                console.log(`6. Field ${fieldId}:`, field ? field.value : 'NOT FOUND');
            });
            
            // Force fill data
            if (data.data?.couple) {
                console.log('7. FORCE FILLING DATA...');
                if (data.data.couple.groom) {
                    setCoupleFieldValue('groomName', data.data.couple.groom.name);
                    setCoupleFieldValue('groomDescription', data.data.couple.groom.description);
                }
                if (data.data.couple.bride) {
                    setCoupleFieldValue('brideName', data.data.couple.bride.name);
                    setCoupleFieldValue('brideDescription', data.data.couple.bride.description);
                }
                if (data.data.couple.parents) {
                    if (data.data.couple.parents.groom) {
                        setCoupleFieldValue('groomFather', data.data.couple.parents.groom.father);
                        setCoupleFieldValue('groomMother', data.data.couple.parents.groom.mother);
                    }
                    if (data.data.couple.parents.bride) {
                        setCoupleFieldValue('brideFather', data.data.couple.parents.bride.father);
                        setCoupleFieldValue('brideMother', data.data.couple.parents.bride.mother);
                    }
                }
                console.log('8. Data filled!');
            }
        })
        .catch(error => {
            console.error('9. API Error:', error);
        });
}

// Select couple image using common component
function selectCoupleImage(type) {
    console.log('📷 Selecting couple image for:', type);
    
    // Use common ImageUploadComponent
    if (typeof ImageUploadComponent !== 'undefined') {
        const uploader = new ImageUploadComponent({
            type: type,
            onSuccess: (result) => {
                // Update image preview
                const previewId = type === 'groom' ? 'groom-image-preview' : 'bride-image-preview';
                uploader.updateImagePreview(previewId, result.url);
                
                // Update data
                if (type === 'groom') {
                    coupleData.couple.groomImage = result.url;
                } else {
                    coupleData.couple.brideImage = result.url;
                }
                
                console.log('✅ Couple image uploaded successfully');
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
                uploadCoupleImage(type, file);
            }
        };
        input.click();
    }
}

// Upload couple image
async function uploadCoupleImage(type, file) {
    console.log('📤 Uploading couple image:', type, file.name);
    
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
    formData.append('type', type === 'groom' ? 'groom' : 'bride');
    
    try {
        // Show loading
        Swal.fire({
            title: 'Đang tải ảnh...',
            text: 'Vui lòng đợi',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        const response = await fetch('window.location.origin/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        console.log('📡 Upload result:', result);
        
        if (result.success) {
            // Update data first
            if (type === 'groom') {
                coupleData.couple.groomImage = result.url;
            } else {
                coupleData.couple.brideImage = result.url;
            }
            
            // Force UI update with timeout to ensure DOM is ready
            setTimeout(() => {
                // Update image preview
                const previewId = type === 'groom' ? 'groom-image-preview' : 'bride-image-preview';
                const preview = document.getElementById(previewId);
                if (preview) {
                    preview.src = result.url + '?t=' + Date.now(); // Force refresh
                    preview.style.display = 'block';
                    
                    // Hide placeholder
                    const placeholder = preview.parentElement.querySelector('.upload-placeholder');
                    if (placeholder) {
                        placeholder.style.display = 'none';
                    }
                    
                    console.log('✅ Image preview updated for:', type);
                } else {
                    console.error('❌ Preview element not found:', previewId);
                }
            }, 100);
            
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Đã tải ảnh thành công',
                timer: 2000,
                showConfirmButton: false
            });
            
            console.log('✅ Couple image uploaded successfully');
        } else {
            throw new Error(result.message || 'Upload thất bại');
        }
    } catch (error) {
        console.error('❌ Upload error:', error);
        Swal.fire('Lỗi', `Không thể tải ảnh: ${error.message}`, 'error');
    }
}

// Export functions and data
window.initializeCouple = initializeCouple;
window.coupleData = coupleData; // Export data for saving
window.saveCoupleData = saveCoupleData; // Export save function
window.testCoupleData = testCoupleData; // Export test function
window.selectCoupleImage = selectCoupleImage; // Export image selection function
window.uploadCoupleImage = uploadCoupleImage; // Export image upload function

console.log('✅ Couple tab functions exported');
