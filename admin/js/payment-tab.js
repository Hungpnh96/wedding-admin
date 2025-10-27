// Payment Management Tab JavaScript
// Quản lý thông tin chuyển khoản

// Global variables
let payments = [];
let globalMessage = '';

// Initialize payment tab
window.initializePayment = function() {
    console.log('🔄 Initializing Payment tab...');
    
    const contentContainer = document.getElementById('adminTabContent');
    if (!contentContainer) {
        console.error('❌ Content container not found');
        return;
    }
    
    // Load payment content from external file
    fetch('./admin-pages/payment.html')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.text();
        })
        .then(html => {
            console.log('✅ Payment content loaded');
            contentContainer.innerHTML = html;
            
            // Initialize after content is loaded
            setTimeout(() => {
                loadPayments();
                loadGlobalMessage();
            }, 100);
        })
        .catch(error => {
            console.error('❌ Error loading payment content:', error);
            contentContainer.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Không thể tải nội dung quản lý chuyển khoản. Lỗi: ${error.message}
                </div>
            `;
        });
};

// Load payments from API
async function loadPayments() {
    try {
        console.log('🔄 Loading payments...');
        const response = await fetch('http://localhost:5001/api/payment/list');
        const data = await response.json();

        if (data.success) {
            payments = data.data;
            renderPayments();
            console.log('✅ Payments loaded:', payments.length);
        } else {
            showPaymentError('Không thể tải danh sách chuyển khoản: ' + data.message);
        }
    } catch (error) {
        console.error('Error loading payments:', error);
        showPaymentError('Có lỗi xảy ra khi tải danh sách chuyển khoản');
    }
}

// Load global message
async function loadGlobalMessage() {
    try {
        const response = await fetch('http://localhost:5001/api/payment/global-message');
        const data = await response.json();

        if (data.success) {
            globalMessage = data.data.message || '';
            const messageElement = document.getElementById('globalMessage');
            if (messageElement) {
                messageElement.value = globalMessage;
            }
        }
    } catch (error) {
        console.error('Error loading global message:', error);
    }
}

// Render payments list
function renderPayments() {
    const container = document.getElementById('paymentList');
    if (!container) return;
    
    if (payments.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-credit-card fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">Chưa có thông tin chuyển khoản</h5>
                <p class="text-muted">Hãy thêm thông tin chuyển khoản đầu tiên</p>
            </div>
        `;
        return;
    }

    let html = '';
    payments.forEach((payment, index) => {
        html += `
            <div class="payment-item" data-id="${payment.id}">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <div class="payment-info">
                            <h6 class="mb-2">
                                <i class="fas fa-user me-2"></i>${payment.title || payment.recipient_name}
                                ${payment.is_active ? '<span class="badge bg-success ms-2">Đang hiển thị</span>' : '<span class="badge bg-secondary ms-2">Ẩn</span>'}
                            </h6>
                            <div class="row">
                                <div class="col-md-6">
                                    <p class="mb-1"><strong>Ngân hàng:</strong> ${payment.bank_name}</p>
                                    <p class="mb-1"><strong>Tên:</strong> ${payment.recipient_name}</p>
                                </div>
                                <div class="col-md-6">
                                    <p class="mb-1"><strong>STK:</strong> ${payment.account_number}</p>
                                    <p class="mb-1"><strong>Thứ tự:</strong> ${payment.sort_order}</p>
                                </div>
                            </div>
                            ${payment.description ? `<p class="mb-0 text-muted"><small>${payment.description}</small></p>` : ''}
                        </div>
                    </div>
                    <div class="col-md-2 text-center">
                        <div class="qr-code-container">
                            ${payment.qr_code_url ? 
                                `<img src="${payment.qr_code_url}" alt="QR Code" class="img-fluid" style="max-width: 80px;">` :
                                `<i class="fas fa-qrcode text-muted"></i>`
                            }
                        </div>
                    </div>
                    <div class="col-md-2 text-end">
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="editPayment(${payment.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deletePayment(${payment.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Show add payment modal
function showAddPaymentModal() {
    document.getElementById('paymentModalTitle').innerHTML = '<i class="fas fa-plus"></i> Thêm Thông Tin Chuyển Khoản';
    document.getElementById('paymentForm').reset();
    document.getElementById('paymentId').value = '';
    document.getElementById('qrPreview').innerHTML = `
        <i class="fas fa-qrcode fa-3x text-muted"></i>
        <p class="text-muted mt-2">QR Code sẽ được tạo tự động</p>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
    modal.show();
}

// Edit payment
function editPayment(id) {
    const payment = payments.find(p => p.id === id);
    if (!payment) return;

    document.getElementById('paymentModalTitle').innerHTML = '<i class="fas fa-edit"></i> Chỉnh Sửa Thông Tin Chuyển Khoản';
    document.getElementById('paymentId').value = payment.id;
    document.getElementById('recipientName').value = payment.recipient_name;
    document.getElementById('bankName').value = payment.bank_name;
    document.getElementById('accountNumber').value = payment.account_number;
    document.getElementById('title').value = payment.title || '';
    document.getElementById('description').value = payment.description || '';
    document.getElementById('isActive').checked = payment.is_active;
    document.getElementById('sortOrder').value = payment.sort_order;

    // Show QR code preview
    if (payment.qr_code_url) {
        document.getElementById('qrPreview').innerHTML = `
            <img src="${payment.qr_code_url}" alt="QR Code" class="img-fluid" style="max-width: 150px;">
        `;
    }

    const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
    modal.show();
}

// Save payment
async function savePayment() {
    const form = document.getElementById('paymentForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const paymentId = document.getElementById('paymentId').value || null;
    const qrFile = document.getElementById('qrCodeFile').files[0];
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('recipient_name', document.getElementById('recipientName').value);
    formData.append('bank_name', document.getElementById('bankName').value);
    formData.append('account_number', document.getElementById('accountNumber').value);
    formData.append('title', document.getElementById('title').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('is_active', document.getElementById('isActive').checked);
    formData.append('sort_order', parseInt(document.getElementById('sortOrder').value));
    
    if (qrFile) {
        formData.append('qr_code_file', qrFile);
    }

    try {
        const url = paymentId ? 
            `http://localhost:5001/api/payment/${paymentId}` : 
            'http://localhost:5001/api/payment';
        
        const method = paymentId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: paymentId ? 'Thông tin chuyển khoản đã được cập nhật' : 'Thông tin chuyển khoản đã được thêm'
            });
            
            // Close modal and reload data
            bootstrap.Modal.getInstance(document.getElementById('paymentModal')).hide();
            loadPayments();
        } else {
            showPaymentError('Không thể lưu thông tin: ' + data.message);
        }
    } catch (error) {
        console.error('Error saving payment:', error);
        showPaymentError('Có lỗi xảy ra khi lưu thông tin');
    }
}

// Delete payment
async function deletePayment(id) {
    const payment = payments.find(p => p.id === id);
    if (!payment) return;

    const result = await Swal.fire({
        title: 'Xác nhận xóa',
        text: `Bạn có chắc chắn muốn xóa thông tin chuyển khoản "${payment.title || payment.recipient_name}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`http://localhost:5001/api/payment/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Đã xóa!',
                    text: 'Thông tin chuyển khoản đã được xóa'
                });
                loadPayments();
            } else {
                showPaymentError('Không thể xóa: ' + data.message);
            }
        } catch (error) {
            console.error('Error deleting payment:', error);
            showPaymentError('Có lỗi xảy ra khi xóa thông tin');
        }
    }
}

// Save global message
async function saveGlobalMessage() {
    const message = document.getElementById('globalMessage').value;

    try {
        const response = await fetch('http://localhost:5001/api/payment/global-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();

        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Thông điệp chung đã được lưu'
            });
            globalMessage = message;
        } else {
            showPaymentError('Không thể lưu thông điệp: ' + data.message);
        }
    } catch (error) {
        console.error('Error saving global message:', error);
        showPaymentError('Có lỗi xảy ra khi lưu thông điệp');
    }
}

// Show error
function showPaymentError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: message
    });
}

// Preview QR code when file is selected
function previewQRCode(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('qrPreview').innerHTML = `
                <img src="${e.target.result}" alt="QR Code Preview" class="img-fluid" style="max-width: 150px;">
                <p class="text-muted mt-2"><small>Preview QR Code</small></p>
            `;
        };
        reader.readAsDataURL(file);
    } else {
        document.getElementById('qrPreview').innerHTML = `
            <i class="fas fa-qrcode fa-3x text-muted"></i>
            <p class="text-muted mt-2">Chưa có QR code</p>
        `;
    }
}

// Expose functions globally
window.showAddPaymentModal = showAddPaymentModal;
window.editPayment = editPayment;
window.savePayment = savePayment;
window.deletePayment = deletePayment;
window.saveGlobalMessage = saveGlobalMessage;
window.loadPayments = loadPayments;
window.loadGlobalMessage = loadGlobalMessage;
window.previewQRCode = previewQRCode;
