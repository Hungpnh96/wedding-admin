/**
 * Wedding Story Management
 * Quản lý câu chuyện cưới với đầy đủ tính năng CRUD
 */

// Global variables
let currentStories = [];
let currentEditingStory = null;
let draggedElement = null;
let tempUploadedImageUrl = null; // Lưu ảnh vừa upload chưa lưu vào story

// Initialize story management when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📚 DOMContentLoaded fired in story-management.js');
    // Đợi một chút để siteData được load
    setTimeout(initializeStoryManagement, 100);
});

// Also try to initialize immediately if DOM is already ready
if (document.readyState === 'loading') {
    console.log('📚 DOM still loading, waiting for DOMContentLoaded');
} else {
    console.log('📚 DOM already ready, initializing immediately');
    setTimeout(initializeStoryManagement, 100);
}

// Export for external calls
window.initializeStoryManagement = initializeStoryManagement;
window.renderStoriesList = renderStoriesList;
window.uploadStoryImage = uploadStoryImage;
window.handleStoryImageSelect = handleStoryImageSelect;
window.removeStoryImage = removeStoryImage;

console.log('📚 story-management.js loaded');
console.log('📚 initializeStoryManagement function:', typeof initializeStoryManagement);
console.log('📚 renderStoriesList function:', typeof renderStoriesList);
console.log('📚 window.initializeStoryManagement:', typeof window.initializeStoryManagement);
console.log('📚 window.renderStoriesList:', typeof window.renderStoriesList);

/**
 * Initialize story management
 */
function initializeStoryManagement() {
    console.log('🎬 Initializing Story Management...');
    console.log('📚 DOM ready:', document.readyState);
    console.log('📚 storiesGrid element exists:', !!document.getElementById('storiesGrid'));
    
    // Load stories from data
    loadStories();
    
    // Setup form event listeners
    setupStoryFormListeners();
    
    // Setup drag and drop
    setupDragAndDrop();
    
    console.log('✅ Story Management initialized');
}

/**
 * Load stories from site data
 */
async function loadStories() {
    console.log('📚 Loading stories...');
    
    try {
        // Load data from main API
        const response = await fetch(window.location.origin + '/api/data');
        const result = await response.json();
        
        if (result.success && result.data && result.data.story && Array.isArray(result.data.story)) {
            currentStories = [...result.data.story];
            console.log('📚 Loaded stories from API:', currentStories.length, 'stories');
            console.log('📚 Stories data:', currentStories);
        } else {
            currentStories = [];
            console.log('📚 No stories found in API response');
            console.log('📚 API response:', result);
        }
        
        console.log('🔄 Calling renderStoriesList...');
        renderStoriesList();
        
    } catch (error) {
        console.error('📚 Error loading stories:', error);
        currentStories = [];
        renderStoriesList();
    }
}

/**
 * Load data from API
 */
async function loadDataFromAPI() {
    try {
        const response = await fetch(window.location.origin + '/api/data');
        const result = await response.json();
        
        if (result.success && result.data) {
            window.siteData = result.data;
            siteData = result.data; // Set global siteData
            console.log('📚 Data loaded from API:', result.data);
        } else {
            console.error('📚 Failed to load data from API:', result.message);
        }
    } catch (error) {
        console.error('📚 Error loading data from API:', error);
    }
}

/**
 * Render stories list
 */
function renderStoriesList() {
    console.log('🎨 Rendering stories list...');
    console.log('📊 currentStories length:', currentStories.length);
    console.log('📊 currentStories data:', currentStories);
    const storiesGrid = document.getElementById('storiesGrid');
    console.log('🔍 storiesGrid element:', storiesGrid);
    if (!storiesGrid) {
        console.error('❌ storiesGrid element not found');
        return;
    }
    
    // Check if storiesGrid is visible
    const computedStyle = window.getComputedStyle(storiesGrid);
    console.log('🔍 storiesGrid display:', computedStyle.display);
    console.log('🔍 storiesGrid visibility:', computedStyle.visibility);
    console.log('🔍 storiesGrid parent display:', window.getComputedStyle(storiesGrid.parentElement).display);
    
    if (currentStories.length === 0) {
        storiesGrid.innerHTML = `
            <div class="empty-stories">
                <i class="fas fa-book-open"></i>
                <h5>Chưa có câu chuyện nào</h5>
                <p>Hãy thêm câu chuyện đầu tiên của bạn!</p>
                <button class="btn btn-custom mt-3" onclick="addStory()">
                    <i class="fas fa-plus me-2"></i>Thêm câu chuyện đầu tiên
                </button>
            </div>
        `;
        return;
    }
    
    storiesGrid.innerHTML = currentStories.map((story, index) => {
        // Normalize image path
        const normalizedSrc = normalizeStoryImagePath(story.src);
        console.log(`🖼️ Story ${index + 1} - Original src: ${story.src}, Normalized: ${normalizedSrc}`);
        
        return `
        <div class="story-card" data-story-id="${story.id}" data-index="${index}" draggable="true">
            <div class="drag-handle">
                <i class="fas fa-grip-vertical"></i>
            </div>
            <div class="story-status ${story.visible ? 'visible' : 'hidden'}">
                ${story.visible ? 'Hiển thị' : 'Ẩn'}
            </div>
            <div class="story-image">
                <img src="${normalizedSrc}" alt="${story.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">                                                                        
                <div class="image-placeholder" style="display: none; align-items: center; justify-content: center; height: 200px; background: #f8f9fa; color: #6c757d;">                                                
                    <i class="fas fa-image fa-3x"></i>
                </div>
            </div>
            <div class="story-content">
                <h4>${story.title}</h4>
                <p class="story-milestone">${story.milestone}</p>
                <p class="story-description">${story.description}</p>
            </div>
            <div class="story-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="editStory('${story.id}')" title="Chỉnh sửa">                                                                                                    
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteStory('${story.id}')" title="Xóa">                                                                                                         
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        `;
    }).join('');
}

/**
 * Setup story form event listeners
 */
function setupStoryFormListeners() {
    const storyForm = document.getElementById('storyFormElement');
    if (storyForm) {
        storyForm.addEventListener('submit', handleStoryFormSubmit);
    }
}

/**
 * Upload story image
 */
        // uploadStoryImage function is defined globally below

/**
 * Handle story image selection
 */
// handleStoryImageSelect function is defined below
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        alert('File ảnh quá lớn! Vui lòng chọn file nhỏ hơn 5MB.');
        return;
    }
    
    console.log('📸 File selected:', file.name, file.size, file.type);
    
    // Show loading
    const placeholder = document.getElementById('storyUploadPlaceholder');
    if (placeholder) {
        placeholder.innerHTML = '<i class="fas fa-spinner fa-spin fa-3x mb-3 text-primary"></i><p>Đang tải lên...</p>';
    }
    
    // Upload file
    const formData = new FormData();
    formData.append('file', file);
    
    fetch(window.location.origin + '/api/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        console.log('📸 Upload result:', result);
        if (result.success) {
            // Store the uploaded image URL
            tempUploadedImageUrl = result.filename;
            console.log('📸 Image uploaded successfully:', result.filename);
            
            // Show preview
            showStoryImagePreview(result.filename);
        } else {
            throw new Error(result.message || 'Upload failed');
        }
    })
    .catch(error => {
        console.error('📸 Upload error:', error);
        alert('Lỗi khi tải ảnh lên: ' + error.message);
        
        // Reset upload area
        resetStoryImageUpload();
    });
}

/**
 * Show story image preview
 */
function showStoryImagePreview(imageUrl) {
    console.log('📸 Showing story image preview:', imageUrl);
    
    const preview = document.getElementById('storyImagePreview');
    const actions = document.getElementById('storyImageActions');
    const placeholder = document.getElementById('storyUploadPlaceholder');
    
    if (preview && actions && placeholder) {
        preview.src = `window.location.origin${imageUrl}`;
        preview.style.display = 'block';
        actions.style.display = 'block';
        placeholder.style.display = 'none';
    }
}

/**
 * Remove story image
 */
function removeStoryImage() {
    console.log('📸 Removing story image...');
    tempUploadedImageUrl = null;
    
    const preview = document.getElementById('storyImagePreview');
    const actions = document.getElementById('storyImageActions');
    const placeholder = document.getElementById('storyUploadPlaceholder');
    
    if (preview && actions && placeholder) {
        preview.style.display = 'none';
        actions.style.display = 'none';
        placeholder.style.display = 'block';
    }
}

/**
 * Reset story image upload area
 */
function resetStoryImageUpload() {
    const uploadArea = document.querySelector('.image-upload-area[data-upload-type="story"]');
    if (uploadArea) {
        uploadArea.innerHTML = `
            <input type="file" id="storyImageInput" accept="image/*" style="display: none;" onchange="handleStoryImageSelect(event)">
            <div class="upload-placeholder" onclick="uploadStoryImage()">
                <i class="fas fa-image fa-3x mb-3"></i>
                <p>Nhấn để chọn ảnh</p>
                <small class="text-muted">JPG, PNG, WebP (Tối đa 5MB)</small>
            </div>
            <img id="storyImagePreview" class="uploaded-image" style="display: none;">
            <div id="storyImageActions" style="display: none; margin-top: 10px; text-align: center;">
                <button type="button" class="btn btn-sm btn-danger" onclick="removeStoryImage()">
                    <i class="fas fa-trash me-1"></i>Xóa ảnh
                </button>
            </div>
        `;
    }
}

/**
 * Handle story form submission
 */
async function handleStoryFormSubmit(e) {
    e.preventDefault();
    
    console.log('💾 Saving story...');
    
    try {
        const storyData = {
            milestone: document.getElementById('storyMilestone').value,
            title: document.getElementById('storyTitle').value,
            description: document.getElementById('storyDescription').value,
            visible: document.getElementById('storyVisible').checked,
            src: tempUploadedImageUrl || (currentEditingStory ? currentEditingStory.src : ''),
            id: currentEditingStory ? currentEditingStory.id : generateStoryId()
        };
        
        // Validate required fields
        if (!storyData.milestone || !storyData.title || !storyData.description) {
            showAlert('Vui lòng điền đầy đủ thông tin bắt buộc!', 'warning');
            return;
        }
        
        if (currentEditingStory) {
            // Update existing story
            const index = currentStories.findIndex(s => s.id === currentEditingStory.id);
            if (index !== -1) {
                currentStories[index] = { ...currentStories[index], ...storyData };
                console.log('✅ Story updated:', currentStories[index]);
            }
        } else {
            // Add new story
            currentStories.push(storyData);
            console.log('✅ New story added:', storyData);
        }
        
        // Update site data
        if (!siteData.story) siteData.story = [];
        siteData.story = [...currentStories];
        
        // Refresh display
        renderStoriesList();
        
        // Close form
        closeStoryForm();
        
        showAlert('Câu chuyện đã được lưu thành công!', 'success');
        
    } catch (error) {
        console.error('❌ Error saving story:', error);
        showAlert('Lỗi khi lưu câu chuyện: ' + error.message, 'error');
    }
}

/**
 * Save stories to server
 */
async function saveStoriesToServer() {
    try {
        console.log('🔍 Debug: saveStoriesToServer called');
        console.log('🔍 Debug: currentStories:', currentStories);
        console.log('🔍 Debug: siteData before update:', siteData);
        
        // CHỈ gửi story data, không gửi toàn bộ siteData
        const storyData = {
            story: [...currentStories]
        };
        
        console.log('🔍 Debug: Sending only story data:', storyData);
        
        const response = await fetch(window.location.origin + '/api/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(storyData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('🔍 Debug: API response:', result);
        
        if (!result.success) {
            console.error('❌ API returned error:', result);
            throw new Error(result.message || 'Lỗi khi lưu dữ liệu');
        }
        
        console.log('✅ Stories saved to server successfully');
        
    } catch (error) {
        console.error('❌ Error saving to server:', error);
        throw error;
    }
}

/**
 * Add new story
 */
function addStory() {
    console.log('➕ Adding new story');
    
    currentEditingStory = null;
    tempUploadedImageUrl = null; // Reset ảnh tạm
    
    // Check if elements exist
    const storyForm = document.getElementById('storyForm');
    const storyMilestone = document.getElementById('storyMilestone');
    const storyTitle = document.getElementById('storyTitle');
    const storyDescription = document.getElementById('storyDescription');
    const storyVisible = document.getElementById('storyVisible');
    const storyImagePreview = document.getElementById('storyImagePreview');
    const storyFormTitle = document.getElementById('storyFormTitle');
    const storiesList = document.getElementById('storiesList');
    
    console.log('🔍 Element check:', {
        storyForm: !!storyForm,
        storyMilestone: !!storyMilestone,
        storyTitle: !!storyTitle,
        storyDescription: !!storyDescription,
        storyVisible: !!storyVisible,
        storyImagePreview: !!storyImagePreview,
        storyFormTitle: !!storyFormTitle,
        storiesList: !!storiesList
    });
    
    if (!storyForm) {
        console.error('❌ storyForm not found!');
        alert('Form không tìm thấy. Vui lòng refresh trang.');
        return;
    }
    
    // Reset form
    if (storyMilestone) storyMilestone.value = '';
    if (storyTitle) storyTitle.value = '';
    if (storyDescription) storyDescription.value = '';
    if (storyVisible) storyVisible.checked = true;
    if (storyImagePreview) storyImagePreview.style.display = 'none';
    
    const uploadPlaceholder = document.querySelector('.upload-placeholder');
    if (uploadPlaceholder) {
        uploadPlaceholder.style.display = 'flex';
    }
    
    // Update form title
    if (storyFormTitle) {
        storyFormTitle.textContent = 'Thêm câu chuyện mới';
    }
    
    // Show form
    storyForm.style.display = 'block';
    if (storiesList) {
        storiesList.style.display = 'none';
    }
    
    // Scroll to form
    storyForm.scrollIntoView({ behavior: 'smooth' });
    
    console.log('✅ Story form opened successfully');
}

/**
 * Edit story
 */
function editStory(storyId) {
    console.log('✏️ Editing story:', storyId);
    console.log('🔍 editStory called with storyId:', storyId);
    
    const story = currentStories.find(s => s.id === storyId);
    if (!story) {
        showAlert('Không tìm thấy câu chuyện!', 'error');
        return;
    }
    
    currentEditingStory = story;
    
    // Reset ảnh tạm khi edit story
    tempUploadedImageUrl = null;
    
    // Fill form with story data
    document.getElementById('storyMilestone').value = story.milestone || '';
    document.getElementById('storyTitle').value = story.title || '';
    document.getElementById('storyDescription').value = story.description || '';
    document.getElementById('storyVisible').checked = story.visible !== false;
    
    // Handle image
    const preview = document.getElementById('storyImagePreview');
    const placeholder = document.querySelector('#storyFormElement .upload-placeholder');
    const actions = document.getElementById('storyImageActions');
    
    if (story.src) {
        preview.src = story.src;
        preview.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
        if (actions) actions.style.display = 'block';
    } else {
        preview.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
        if (actions) actions.style.display = 'none';
    }
    
    // Update form title
    document.getElementById('storyFormTitle').textContent = 'Chỉnh sửa câu chuyện';
    
    // Show form
    document.getElementById('storyForm').style.display = 'block';
    document.getElementById('storiesList').style.display = 'none';
    
    // Scroll to form
    document.getElementById('storyForm').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Delete story
 */
async function deleteStory(storyId) {
    console.log('🗑️ Deleting story:', storyId);
    console.log('🔍 deleteStory called with storyId:', storyId);
    
    const story = currentStories.find(s => s.id === storyId);
    if (!story) {
        showAlert('Không tìm thấy câu chuyện!', 'error');
        return;
    }
    
    // Confirm deletion
    const confirmed = await Swal.fire({
        title: 'Xác nhận xóa',
        text: `Bạn có chắc chắn muốn xóa câu chuyện "${story.title}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    });
    
    if (!confirmed.isConfirmed) return;
    
    try {
        // Delete image file if exists
        if (story.src) {
            await deleteStoryImage(story.src);
        }
        
        // Remove from array
        currentStories = currentStories.filter(s => s.id !== storyId);
        
        // Save to server
        await saveStoriesToServer();
        
        // Refresh display
        renderStoriesList();
        
        showAlert('Câu chuyện đã được xóa thành công!', 'success');
        
    } catch (error) {
        console.error('❌ Error deleting story:', error);
        showAlert('Lỗi khi xóa câu chuyện: ' + error.message, 'error');
    }
}

/**
 * Delete story image file
 */
async function deleteStoryImage(imageSrc) {
    try {
        // Extract filename from src
        const filename = imageSrc.split('/').pop();
        if (!filename) return;
        
        // Call API to delete file
        const response = await fetch(window.location.origin + '/api/delete-file', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename: filename,
                type: 'story'
            })
        });
        
        if (response.ok) {
            console.log('✅ Story image deleted:', filename);
        } else {
            console.warn('⚠️ Could not delete story image:', filename);
        }
        
    } catch (error) {
        console.warn('⚠️ Error deleting story image:', error);
    }
}

/**
 * Toggle story visibility
 */
async function toggleStoryVisibility(storyId) {
    console.log('👁️ Toggling story visibility:', storyId);
    console.log('🔍 toggleStoryVisibility called with storyId:', storyId);
    
    const storyIndex = currentStories.findIndex(s => s.id === storyId);
    if (storyIndex === -1) {
        showAlert('Không tìm thấy câu chuyện!', 'error');
        return;
    }
    
    try {
        // Toggle visibility
        currentStories[storyIndex].visible = !currentStories[storyIndex].visible;
        
        // Save to server
        await saveStoriesToServer();
        
        // Refresh display
        renderStoriesList();
        
        const status = currentStories[storyIndex].visible ? 'hiển thị' : 'ẩn';
        showAlert(`Câu chuyện đã được ${status}!`, 'success');
        
    } catch (error) {
        console.error('❌ Error toggling story visibility:', error);
        showAlert('Lỗi khi thay đổi trạng thái hiển thị!', 'error');
    }
}

/**
 * Close story form
 */
function closeStoryForm() {
    document.getElementById('storyForm').style.display = 'none';
    document.getElementById('storiesList').style.display = 'block';
    currentEditingStory = null;
    
    // Xóa ảnh tạm nếu có
    if (tempUploadedImageUrl) {
        console.log('🗑️ Cleaning up temp uploaded image:', tempUploadedImageUrl);
        deleteStoryImage(tempUploadedImageUrl);
        tempUploadedImageUrl = null;
    }
    
    // Reset form and preview
    document.getElementById('storyFormElement').reset();
    const preview = document.getElementById('storyImagePreview');
    const placeholder = document.querySelector('#storyFormElement .upload-placeholder');
    const actions = document.getElementById('storyImageActions');
    
    preview.style.display = 'none';
    preview.src = '';
    if (placeholder) placeholder.style.display = 'flex';
    if (actions) actions.style.display = 'none';
}

/**
 * Remove image from story (xóa ảnh khỏi story)
 */
async function removeStoryImage() {
    try {
        // Xóa ảnh tạm nếu có (ảnh vừa upload chưa lưu)
        if (tempUploadedImageUrl) {
            console.log('🗑️ Removing temp uploaded image:', tempUploadedImageUrl);
            await deleteStoryImage(tempUploadedImageUrl);
            tempUploadedImageUrl = null;
        }
        
        // Xóa ảnh cũ nếu có (ảnh đã lưu trong story)
        if (currentEditingStory && currentEditingStory.src) {
            console.log('🗑️ Removing image from story:', currentEditingStory.src);
            await deleteStoryImage(currentEditingStory.src);
        }
        
        // Clear image preview
        const preview = document.getElementById('storyImagePreview');
        const placeholder = document.querySelector('#storyFormElement .upload-placeholder');
        const actions = document.getElementById('storyImageActions');
        
        preview.style.display = 'none';
        preview.src = '';
        if (placeholder) placeholder.style.display = 'flex';
        if (actions) actions.style.display = 'none';
        
        // Clear file input
        const fileInput = document.getElementById('storyImageInput');
        if (fileInput) fileInput.value = '';
        
        showAlert('Ảnh đã được xóa khỏi câu chuyện!', 'success');
        
    } catch (error) {
        console.error('❌ Error removing story image:', error);
        showAlert('Lỗi khi xóa ảnh: ' + error.message, 'error');
    }
}

/**
 * Upload story image
 */
function uploadStoryImage() {
    console.log('📸 Uploading story image...');
    const input = document.getElementById('storyImageInput');
    console.log('🔍 storyImageInput element:', !!input);
    
    if (input) {
        // Ensure input is enabled and visible
        input.style.display = 'block';
        input.disabled = false;
        
        // Try multiple methods to trigger file dialog
        try {
            input.focus();
            input.click();
            console.log('✅ File input clicked');
        } catch (error) {
            console.error('❌ Error clicking file input:', error);
            // Try alternative method
            const event = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            input.dispatchEvent(event);
            console.log('✅ File input clicked via dispatchEvent');
        }
        
        // Hide input again
        input.style.display = 'none';
    } else {
        console.error('❌ storyImageInput not found');
        alert('Không tìm thấy input file. Vui lòng refresh trang.');
    }
}

/**
 * Handle story image selection
 */
async function handleStoryImageSelect(event) {
    console.log('🖼️ handleStoryImageSelect called');
    const file = event.target.files[0];
    if (!file) {
        console.log('🔍 No file selected');
        return;
    }
    console.log('🔍 File selected:', file.name, file.size);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showAlert('Vui lòng chọn file ảnh hợp lệ!', 'warning');
        return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        showAlert('Kích thước file không được vượt quá 5MB!', 'warning');
        return;
    }
    
    try {
        showAlert('Đang tải ảnh lên...', 'info');
        
        // Upload file
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'story');
        
        const response = await fetch(window.location.origin + '/api/upload-image', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message || 'Lỗi khi tải ảnh lên');
        }
        
        // Update preview
        const preview = document.getElementById('storyImagePreview');
        const placeholder = document.querySelector('#storyFormElement .upload-placeholder');
        const actions = document.getElementById('storyImageActions');
        
        preview.src = result.url;
        preview.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
        if (actions) actions.style.display = 'block';
        
        // Lưu URL ảnh vừa upload vào biến tạm
        tempUploadedImageUrl = result.url;
        
        showAlert('Ảnh đã được tải lên thành công!', 'success');
        
    } catch (error) {
        console.error('❌ Error uploading story image:', error);
        showAlert('Lỗi khi tải ảnh lên: ' + error.message, 'error');
    }
}

/**
 * Handle story form submit
 */
function handleStorySubmit(event) {
    event.preventDefault();
    console.log('📝 Story form submitted');
    console.log('🔍 Debug: handleStorySubmit called');
    
    // Get form data
    const milestone = document.getElementById('storyMilestone').value.trim();
    const title = document.getElementById('storyTitle').value.trim();
    const description = document.getElementById('storyDescription').value.trim();
    const visible = document.getElementById('storyVisible').checked;
    
    // Validation
    if (!milestone || !title || !description) {
        showAlert('Vui lòng điền đầy đủ thông tin câu chuyện!', 'error');
        return;
    }
    
    // Get image data
    const imageFile = document.getElementById('storyImageInput')?.files[0];
    const currentImageSrc = document.getElementById('storyImagePreview')?.src;
    
    // Create story object
    const storyData = {
        milestone: milestone,
        title: title,
        description: description,
        visible: visible,
        src: currentImageSrc || '',
        imageFile: imageFile
    };
    
    console.log('🔍 Form data collected:', storyData);
    
    // Save story
    saveStory(storyData);
}

/**
 * Upload image file to server
 */
async function uploadImageFile(file) {
    try {
        console.log('📤 Uploading image file:', file.name);
        
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            return {
                success: false,
                message: 'Kích thước file quá lớn (tối đa 5MB)'
            };
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            return {
                success: false,
                message: 'File không phải là ảnh hợp lệ'
            };
        }
        
        // Create FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'story');
        
        // Upload to server
        const response = await fetch(window.location.origin + '/api/upload-image', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Image uploaded successfully:', result.url);
            return {
                success: true,
                url: result.url
            };
        } else {
            return {
                success: false,
                message: result.message || 'Lỗi khi tải ảnh lên'
            };
        }
        
    } catch (error) {
        console.error('❌ Error uploading image:', error);
        return {
            success: false,
            message: 'Lỗi khi tải ảnh lên: ' + error.message
        };
    }
}

/**
 * Save story to server - FUNCTION DUY NHẤT
 */
async function saveStory(storyData) {
    try {
        console.log('💾 Saving story:', storyData);
        
        // Handle image - nếu có ảnh tạm (đã upload), sử dụng ảnh tạm
        if (tempUploadedImageUrl) {
            console.log('📸 Using temp uploaded image:', tempUploadedImageUrl);
            storyData.src = tempUploadedImageUrl;
            
            // Nếu đang edit story và có ảnh cũ khác với ảnh tạm, xóa ảnh cũ
            if (currentEditingStory && currentEditingStory.src && currentEditingStory.src !== tempUploadedImageUrl) {
                console.log('🗑️ Deleting old image:', currentEditingStory.src);
                await deleteStoryImage(currentEditingStory.src);
            }
        } else if (storyData.imageFile) {
            // Nếu không có ảnh tạm nhưng có file mới, upload file
            if (currentEditingStory && currentEditingStory.src) {
                console.log('🗑️ Deleting old image before upload:', currentEditingStory.src);
                await deleteStoryImage(currentEditingStory.src);
            }
            
            const imageResult = await uploadImageFile(storyData.imageFile);
            if (imageResult.success) {
                storyData.src = imageResult.url;
            } else {
                showAlert('Lỗi khi tải ảnh lên: ' + imageResult.message, 'error');
                return;
            }
        }
        
        // Update current stories array
        if (currentEditingStory) {
            // Update existing story
            const index = currentStories.findIndex(s => s.id === currentEditingStory.id);
            if (index !== -1) {
                currentStories[index] = { ...currentEditingStory, ...storyData };
                console.log('🔍 Updated existing story at index:', index);
            }
        } else {
            // Add new story - TẠO ID cho story mới
            storyData.id = Date.now().toString();
            storyData.order = currentStories.length;
            currentStories.push(storyData);
            console.log('🔍 Added new story to currentStories:', storyData);
        }
        
        console.log('🔍 Current stories after update:', currentStories);
        
        // Save to server - CHỈ gọi saveStoriesToServer
        await saveStoriesToServer();
        
        // Xóa ảnh tạm sau khi lưu thành công
        tempUploadedImageUrl = null;
        
        // Refresh display
        renderStoriesList();
        
        // Close form
        closeStoryForm();
        
        showAlert('Lưu câu chuyện thành công!', 'success');
        
    } catch (error) {
        console.error('❌ Error saving story:', error);
        showAlert('Lỗi khi lưu câu chuyện: ' + error.message, 'error');
    }
}

/**
 * Setup drag and drop for reordering
 */
function setupDragAndDrop() {
    const storiesGrid = document.getElementById('storiesGrid');
    if (!storiesGrid) return;
    
    storiesGrid.addEventListener('dragstart', handleDragStart);
    storiesGrid.addEventListener('dragover', handleDragOver);
    storiesGrid.addEventListener('drop', handleDrop);
    storiesGrid.addEventListener('dragend', handleDragEnd);
}

/**
 * Handle drag start
 */
function handleDragStart(e) {
    if (!e.target.classList.contains('story-card')) return;
    
    draggedElement = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
}

/**
 * Handle drag over
 */
function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

/**
 * Handle drop
 */
async function handleDrop(e) {
    e.preventDefault();
    
    if (!draggedElement) return;
    
    const dropTarget = e.target.closest('.story-card');
    if (!dropTarget || dropTarget === draggedElement) return;
    
    try {
        const draggedIndex = parseInt(draggedElement.dataset.index);
        const targetIndex = parseInt(dropTarget.dataset.index);
        
        // Reorder array
        const draggedStory = currentStories[draggedIndex];
        currentStories.splice(draggedIndex, 1);
        currentStories.splice(targetIndex, 0, draggedStory);
        
        // Update site data
        siteData.story = [...currentStories];
        
        // Refresh display
        renderStoriesList();
        
        showAlert('Thứ tự câu chuyện đã được cập nhật!', 'success');
        
    } catch (error) {
        console.error('❌ Error reordering stories:', error);
        showAlert('Lỗi khi sắp xếp lại câu chuyện!', 'error');
    }
}

/**
 * Handle drag end
 */
function handleDragEnd(e) {
    if (e.target.classList.contains('story-card')) {
        e.target.classList.remove('dragging');
    }
    draggedElement = null;
}

/**
 * Generate unique story ID
 */
function generateStoryId() {
    return 'story-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Load story data when tab is activated
 */
function loadStoryData() {
    console.log('📚 Loading story data...');
    loadStories();
}

// Normalize story image path
function normalizeStoryImagePath(src) {
    if (!src) return '';
    
    console.log('🖼️ Normalizing story image path:', src);
    
    // If already a full URL, return as is
    if (src.startsWith('http://') || src.startsWith('https://')) {
        console.log('🖼️ Already full URL:', src);
        return src;
    }
    
    // If starts with /public/, make it a full URL
    if (src.startsWith('/public/')) {
        const fullUrl = `window.location.origin${src}`;
        console.log('🖼️ Converted to full URL:', fullUrl);
        return fullUrl;
    }
    
    // If relative path, add /public/ prefix
    if (src.startsWith('./') || !src.startsWith('/')) {
        const fullUrl = `window.location.origin/public/images/story/${src}`;
        console.log('🖼️ Added prefix:', fullUrl);
        return fullUrl;
    }
    
    console.log('🖼️ No change needed:', src);
    return src;
}

// Export functions for global access
window.addStory = addStory;
window.editStory = editStory;
window.deleteStory = deleteStory;
window.toggleStoryVisibility = toggleStoryVisibility;
window.closeStoryForm = closeStoryForm;
window.uploadStoryImage = uploadStoryImage;
window.loadStoryData = loadStoryData;
window.removeStoryImage = removeStoryImage;
window.normalizeStoryImagePath = normalizeStoryImagePath;

// Test function to verify global access
window.testStoryFunctions = function() {
    console.log('🔍 Testing story functions...');
    console.log('🔍 editStory:', typeof window.editStory);
    console.log('🔍 deleteStory:', typeof window.deleteStory);
    console.log('🔍 toggleStoryVisibility:', typeof window.toggleStoryVisibility);
    console.log('🔍 currentStories:', currentStories);
    return 'Functions exported successfully';
};

/**
 * Show alert message
 */
function showAlert(message, type = 'info') {
    console.log(`🔔 ${type.toUpperCase()}: ${message}`);
    
    // Try to use SweetAlert2 if available
    if (typeof Swal !== 'undefined') {
        const config = {
            title: type === 'error' ? 'Lỗi' : type === 'success' ? 'Thành công' : 'Thông báo',
            text: message,
            icon: type === 'error' ? 'error' : type === 'success' ? 'success' : 'info',
            confirmButtonText: 'OK'
        };
        Swal.fire(config);
    } else {
        // Fallback to browser alert
        alert(`${type.toUpperCase()}: ${message}`);
    }
}
