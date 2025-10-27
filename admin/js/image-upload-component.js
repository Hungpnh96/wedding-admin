/**
 * Common Image Upload Component
 * Reusable component for image upload across all admin tabs
 */

class ImageUploadComponent {
    constructor(options = {}) {
        this.options = {
            uploadUrl: 'window.location.origin/api/upload',
            maxFileSize: 5 * 1024 * 1024, // 5MB
            allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
            onSuccess: null,
            onError: null,
            ...options
        };
    }

    /**
     * Show file selection dialog
     */
    selectImage(callback) {
        // Prevent multiple file dialogs
        if (this.isSelectingFile) {
            console.log('⚠️ Already selecting file, ignoring multiple clicks');
            return;
        }
        
        this.isSelectingFile = true;
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.validateAndUpload(file, callback);
            }
            this.isSelectingFile = false; // Reset flag after selection
        };
        
        // Reset flag if user cancels
        input.onblur = () => {
            setTimeout(() => {
                if (!input.files.length) {
                    this.isSelectingFile = false;
                    console.log('✅ File selection cancelled, reset flag');
                }
            }, 500);
        };
        
        input.click();
    }

    /**
     * Validate file and upload
     */
    async validateAndUpload(file, callback) {
        console.log('📤 ImageUploadComponent: Uploading file:', file.name);

        // Validate file type
        if (!this.options.allowedTypes.includes(file.type)) {
            const error = 'Vui lòng chọn file ảnh (JPG, PNG, WebP, GIF)';
            this.showError(error);
            if (callback) callback({ success: false, error });
            return;
        }

        // Validate file size
        if (file.size > this.options.maxFileSize) {
            const error = 'File quá lớn. Vui lòng chọn file nhỏ hơn 5MB';
            this.showError(error);
            if (callback) callback({ success: false, error });
            return;
        }

        // Show loading
        this.showLoading();

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', this.options.type || 'general');

            const response = await fetch(this.options.uploadUrl, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            console.log('📡 Upload result:', result);

            if (result.success) {
                this.showSuccess('Đã tải ảnh thành công');
                if (callback) callback({ success: true, result });
                if (this.options.onSuccess) this.options.onSuccess(result);
            } else {
                throw new Error(result.message || 'Upload thất bại');
            }
        } catch (error) {
            console.error('❌ Upload error:', error);
            this.showError(`Không thể tải ảnh: ${error.message}`);
            if (callback) callback({ success: false, error: error.message });
            if (this.options.onError) this.options.onError(error);
        }
    }

    /**
     * Update image preview in UI
     */
    updateImagePreview(previewId, imageUrl, hidePlaceholder = true) {
        const preview = document.getElementById(previewId);
        if (preview) {
            preview.src = imageUrl + '?t=' + Date.now(); // Force refresh
            preview.style.display = 'block';
            
            if (hidePlaceholder) {
                const placeholder = preview.parentElement.querySelector('.upload-placeholder');
                if (placeholder) {
                    placeholder.style.display = 'none';
                }
            }
            
            console.log('✅ Image preview updated:', previewId);
        } else {
            console.error('❌ Preview element not found:', previewId);
        }
    }

    /**
     * Show loading dialog
     */
    showLoading() {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Đang tải ảnh...',
                text: 'Vui lòng đợi',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
        }
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: message,
                timer: 2000,
                showConfirmButton: false
            });
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: message,
                confirmButtonText: 'OK'
            });
        }
    }

    /**
     * Create upload button
     */
    createUploadButton(text, onClick) {
        const button = document.createElement('button');
        button.className = 'btn btn-outline-primary btn-sm';
        button.innerHTML = `<i class="fas fa-upload me-2"></i>${text}`;
        button.onclick = onClick;
        return button;
    }

    /**
     * Create image preview container
     */
    createPreviewContainer(previewId, placeholderText) {
        return `
            <div class="image-upload-area" data-upload-type="image">
                <div class="upload-placeholder">
                    <i class="fas fa-image fa-3x mb-3"></i>
                    <p>${placeholderText}</p>
                </div>
                <img id="${previewId}" class="uploaded-image" style="display: none; width: 100%; height: auto; aspect-ratio: 1/1; object-fit: cover; border-radius: 12px; box-shadow: inset 0 0 0 15px #fff;">
            </div>
        `;
    }
}

// Export for global use
window.ImageUploadComponent = ImageUploadComponent;

console.log('✅ ImageUploadComponent loaded');
