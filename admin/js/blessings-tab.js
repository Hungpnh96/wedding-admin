// blessings-tab.js - Quản lý lời chúc trong admin
console.log('📝 Loading blessings-tab.js...');

// Initialize blessings management
window.initializeBlessings = function() {
    console.log('💝 Initializing blessings management...');
    
    // Create blessings tab content
    const blessingsContent = `
        <div class="tab-pane fade" id="blessings" role="tabpanel">
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                            <h1 class="h2">
                                <i class="fas fa-heart text-danger"></i> Quản Lý Lời Chúc
                            </h1>
                            <div class="btn-toolbar mb-2 mb-md-0">
                                <button class="btn btn-outline-secondary" onclick="refreshBlessings()">
                                    <i class="fas fa-sync-alt"></i> Làm mới
                                </button>
                            </div>
                        </div>

                        <!-- Filter Section -->
                        <div class="card mb-4">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-4">
                                        <label for="blessingSearch" class="form-label">Tìm kiếm</label>
                                        <input type="text" class="form-control" id="blessingSearch" placeholder="Tên hoặc nội dung...">
                                    </div>
                                    <div class="col-md-3">
                                        <label for="blessingStatus" class="form-label">Trạng thái</label>
                                        <select class="form-select" id="blessingStatus">
                                            <option value="">Tất cả</option>
                                            <option value="true">Đã duyệt</option>
                                            <option value="false">Chưa duyệt</option>
                                        </select>
                                    </div>
                                    <div class="col-md-2">
                                        <label for="blessingPerPage" class="form-label">Hiển thị</label>
                                        <select class="form-select" id="blessingPerPage">
                                            <option value="10">10</option>
                                            <option value="20">20</option>
                                            <option value="50">50</option>
                                        </select>
                                    </div>
                                    <div class="col-md-3 d-flex align-items-end">
                                        <button class="btn btn-primary me-2" onclick="applyBlessingFilters()">
                                            <i class="fas fa-search"></i> Lọc
                                        </button>
                                        <button class="btn btn-outline-secondary" onclick="clearBlessingFilters()">
                                            <i class="fas fa-times"></i> Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Blessings List -->
                        <div class="card">
                            <div class="card-body">
                                <div id="blessingsList">
                                    <div class="text-center py-4">
                                        <div class="spinner-border text-primary" role="status">
                                            <span class="visually-hidden">Đang tải...</span>
                                        </div>
                                        <p class="mt-2">Đang tải lời chúc...</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Pagination -->
                        <nav aria-label="Blessings pagination" id="blessingsPagination" style="display: none;">
                            <ul class="pagination justify-content-center" id="blessingsPaginationList">
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add to tab content
    const contentContainer = document.getElementById('adminTabContent');
    if (contentContainer) {
        contentContainer.innerHTML = blessingsContent;
    } else {
        console.error('adminTabContent container not found');
        return;
    }
    
            // Data will be loaded automatically when tab is activated
    
    console.log('💝 Blessings management initialized');
};

// Also expose as global function for compatibility
window.loadBlessings = loadBlessings;
window.refreshBlessings = refreshBlessings;
window.applyBlessingFilters = applyBlessingFilters;
window.clearBlessingFilters = clearBlessingFilters;
window.approveBlessing = approveBlessing;
window.rejectBlessing = rejectBlessing;
window.deleteBlessing = deleteBlessing;
window.changeBlessingPage = changeBlessingPage;

// Load blessings from API
async function loadBlessings() {
    try {
        console.log('🔄 Loading blessings from API...');
        
        const params = new URLSearchParams({
            page: window.currentBlessingPage || 1,
            per_page: window.currentBlessingPerPage || 10,
            search: window.currentBlessingSearch || '',
            approved: window.currentBlessingStatus || ''
        });

        console.log('📡 API URL:', `${window.location.origin}/api/blessing/admin/list?${params}`);

        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(`${window.location.origin}/api/blessing/admin/list?${params}`, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();

        console.log('📊 API Response:', data);

        if (data.success) {
            console.log('✅ Successfully loaded blessings:', data.data.length, 'items');
            renderBlessings(data.data);
            renderBlessingPagination(data.pagination);
        } else {
            console.error('❌ API Error:', data.message);
            showBlessingError('Không thể tải danh sách lời chúc: ' + data.message);
        }
    } catch (error) {
        console.error('Error loading blessings:', error);
        if (error.name === 'AbortError') {
            showBlessingError('Kết nối quá chậm. Vui lòng thử lại.');
        } else {
            showBlessingError('Có lỗi xảy ra khi tải lời chúc: ' + error.message);
        }
    }
}

// Render blessings list
function renderBlessings(blessings) {
    const container = document.getElementById('blessingsList');
    
    if (blessings.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-heart-broken fa-3x text-muted mb-3"></i>
                <h4>Không có lời chúc nào</h4>
                <p class="text-muted">Chưa có lời chúc nào phù hợp với bộ lọc hiện tại.</p>
            </div>
        `;
        return;
    }

    const html = blessings.map(blessing => `
        <div class="blessing-item border-bottom pb-3 mb-3">
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <div class="d-flex align-items-center mb-2">
                        <span class="badge ${blessing.is_approved ? 'bg-success' : 'bg-warning'} me-2">
                            ${blessing.is_approved ? 'Đã duyệt' : 'Chưa duyệt'}
                        </span>
                        <strong class="me-3">${blessing.name}</strong>
                        <small class="text-muted me-3">
                            <i class="fas fa-users"></i> ${blessing.from}
                        </small>
                        <small class="text-muted">
                            <i class="fas fa-clock"></i> ${formatBlessingDate(blessing.created_at)}
                        </small>
                    </div>
                    <div class="blessing-content">
                        ${blessing.content}
                    </div>
                </div>
                <div class="blessing-actions ms-3">
                    ${!blessing.is_approved ? `
                        <button class="btn btn-success btn-sm" onclick="approveBlessing(${blessing.id})">
                            <i class="fas fa-check"></i> Duyệt
                        </button>
                    ` : `
                        <button class="btn btn-warning btn-sm" onclick="rejectBlessing(${blessing.id})">
                            <i class="fas fa-times"></i> Từ chối
                        </button>
                    `}
                    <button class="btn btn-danger btn-sm ms-1" onclick="deleteBlessing(${blessing.id})">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

// Render pagination
function renderBlessingPagination(pagination) {
    const nav = document.getElementById('blessingsPagination');
    const list = document.getElementById('blessingsPaginationList');
    
    if (pagination.total_pages <= 1) {
        nav.style.display = 'none';
        return;
    }

    nav.style.display = 'block';
    
    let html = '';
    
    // Previous button
    html += `
        <li class="page-item ${window.currentBlessingPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeBlessingPage(${window.currentBlessingPage - 1})">Trước</a>
        </li>
    `;
    
    // Page numbers
    const startPage = Math.max(1, window.currentBlessingPage - 2);
    const endPage = Math.min(pagination.total_pages, window.currentBlessingPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        html += `
            <li class="page-item ${i === window.currentBlessingPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changeBlessingPage(${i})">${i}</a>
            </li>
        `;
    }
    
    // Next button
    html += `
        <li class="page-item ${window.currentBlessingPage === pagination.total_pages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeBlessingPage(${window.currentBlessingPage + 1})">Sau</a>
        </li>
    `;
    
    list.innerHTML = html;
}

// Change page
function changeBlessingPage(page) {
    window.currentBlessingPage = page;
    loadBlessings();
}

// Apply filters
function applyBlessingFilters() {
    console.log('🔄 applyBlessingFilters called');
    
    // Check if elements exist before accessing them
    const searchElement = document.getElementById('blessingSearch');
    const statusElement = document.getElementById('blessingStatus');
    const perPageElement = document.getElementById('blessingPerPage');
    
    if (!searchElement || !statusElement || !perPageElement) {
        console.log('⚠️ Blessing form elements not found, trying to load blessings directly');
        loadBlessings();
        return;
    }
    
    window.currentBlessingSearch = searchElement.value;
    window.currentBlessingStatus = statusElement.value;
    window.currentBlessingPerPage = parseInt(perPageElement.value);
    window.currentBlessingPage = 1;
    
    console.log('🔄 Blessing filters applied:', {
        search: window.currentBlessingSearch,
        status: window.currentBlessingStatus,
        perPage: window.currentBlessingPerPage
    });
    
    loadBlessings();
}

// Clear filters
function clearBlessingFilters() {
    document.getElementById('blessingSearch').value = '';
    document.getElementById('blessingStatus').value = '';
    document.getElementById('blessingPerPage').value = '10';
    window.currentBlessingSearch = '';
    window.currentBlessingStatus = '';
    window.currentBlessingPerPage = 10;
    window.currentBlessingPage = 1;
    loadBlessings();
}

// Approve blessing
async function approveBlessing(blessingId) {
    try {
        const response = await fetch(`${window.location.origin}/api/blessing/admin/${blessingId}/approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ approved: true })
        });

        const data = await response.json();

        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Lời chúc đã được duyệt'
            });
            loadBlessings();
        } else {
            showBlessingError('Không thể duyệt lời chúc: ' + data.message);
        }
    } catch (error) {
        console.error('Error approving blessing:', error);
        showBlessingError('Có lỗi xảy ra khi duyệt lời chúc');
    }
}

// Reject blessing
async function rejectBlessing(blessingId) {
    try {
        const response = await fetch(`${window.location.origin}/api/blessing/admin/${blessingId}/approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ approved: false })
        });

        const data = await response.json();

        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Lời chúc đã được từ chối'
            });
            loadBlessings();
        } else {
            showBlessingError('Không thể từ chối lời chúc: ' + data.message);
        }
    } catch (error) {
        console.error('Error rejecting blessing:', error);
        showBlessingError('Có lỗi xảy ra khi từ chối lời chúc');
    }
}

// Delete blessing
async function deleteBlessing(blessingId) {
    const result = await Swal.fire({
        title: 'Xác nhận xóa',
        text: 'Bạn có chắc chắn muốn xóa lời chúc này?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`${window.location.origin}/api/blessing/admin/${blessingId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: 'Lời chúc đã được xóa'
                });
                loadBlessings();
            } else {
                showBlessingError('Không thể xóa lời chúc: ' + data.message);
            }
        } catch (error) {
            console.error('Error deleting blessing:', error);
            showBlessingError('Có lỗi xảy ra khi xóa lời chúc');
        }
    }
}

// Refresh blessings
function refreshBlessings() {
    loadBlessings();
}

// Export blessings
function exportBlessings() {
    Swal.fire({
        icon: 'info',
        title: 'Tính năng sắp có',
        text: 'Tính năng xuất Excel sẽ được phát triển trong phiên bản tiếp theo.'
    });
}

// Show error
function showBlessingError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: message
    });
}

// Format date
function formatBlessingDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Initialize variables
window.currentBlessingPage = 1;
window.currentBlessingPerPage = 10;
window.currentBlessingSearch = '';
window.currentBlessingStatus = '';

console.log('📝 blessings-tab.js loaded successfully');
