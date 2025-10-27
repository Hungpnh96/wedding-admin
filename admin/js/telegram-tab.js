// telegram-tab.js - Quản lý cấu hình Telegram trong admin
console.log('📱 Loading telegram-tab.js...');

// Initialize telegram management
window.initializeTelegram = function() {
    console.log('📱 Initializing telegram management...');
    
    try {
        // Create telegram tab content
        const telegramContent = `
            <div class="tab-pane fade" id="telegram" role="tabpanel">
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-12">
                            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                                <h1 class="h2">
                                    <i class="fas fa-paper-plane text-primary"></i> Cấu Hình Telegram
                                </h1>
                            </div>
                            
                            <div class="row">
                                <div class="col-lg-8">
                                    <!-- Configuration Form -->
                                    <div class="card mb-4">
                                        <div class="card-header">
                                            <h4><i class="fas fa-cog me-2"></i>Cấu Hình Bot Telegram</h4>
                                        </div>
                                        <div class="card-body">
                                            <form id="telegramConfigForm">
                                                <div class="mb-3">
                                                    <label for="telegramBotToken" class="form-label">Bot Token</label>
                                                    <input type="password" class="form-control" id="telegramBotToken" placeholder="Nhập Bot Token từ @BotFather">
                                                    <div class="form-text">
                                                        Lấy Bot Token từ <a href="https://t.me/BotFather" target="_blank">@BotFather</a> trên Telegram
                                                    </div>
                                                </div>
                                                
                                                <div class="mb-3">
                                                    <label for="telegramChatId" class="form-label">Chat ID</label>
                                                    <input type="text" class="form-control" id="telegramChatId" placeholder="Nhập Chat ID để nhận thông báo">
                                                    <div class="form-text">
                                                        Chat ID của nhóm hoặc cá nhân sẽ nhận thông báo
                                                    </div>
                                                </div>
                                                
                                                <div class="mb-3">
                                                    <div class="form-check">
                                                        <input class="form-check-input" type="checkbox" id="telegramEnabled">
                                                        <label class="form-check-label" for="telegramEnabled">
                                                            Kích hoạt thông báo Telegram
                                                        </label>
                                                    </div>
                                                    <div class="form-text">
                                                        Khi bật, hệ thống sẽ gửi thông báo qua Telegram khi có lời chúc mới
                                                    </div>
                                                </div>
                                                
                                                <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                                    <button type="button" class="btn btn-outline-secondary" onclick="loadTelegramConfig()">
                                                        <i class="fas fa-sync-alt"></i> Làm mới
                                                    </button>
                                                    <button type="submit" class="btn btn-primary">
                                                        <i class="fas fa-save"></i> Lưu Cấu Hình
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>

                                    <!-- Test Section -->
                                    <div class="card">
                                        <div class="card-header">
                                            <h5><i class="fas fa-vial me-2"></i>Kiểm Tra Kết Nối</h5>
                                        </div>
                                        <div class="card-body">
                                            <p class="text-muted">Gửi tin nhắn thử để kiểm tra cấu hình Telegram</p>
                                            <button class="btn btn-outline-primary" onclick="testTelegram()" id="telegramTestBtn">
                                                <i class="fas fa-paper-plane"></i> Gửi Tin Nhắn Thử
                                            </button>
                                            <div id="telegramTestResult" class="mt-3" style="display: none;"></div>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-lg-4">
                                    <!-- Status Card -->
                                    <div class="card mb-4">
                                        <div class="card-header">
                                            <h4><i class="fas fa-info-circle me-2"></i>Trạng Thái</h4>
                                        </div>
                                        <div class="card-body">
                                            <div id="telegramStatusInfo">
                                                <div class="d-flex align-items-center mb-2">
                                                    <span class="status-indicator status-disabled me-2"></span>
                                                    <span>Đang tải...</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Help Card -->
                                    <div class="card mb-4">
                                        <div class="card-header">
                                            <h4><i class="fas fa-question-circle me-2"></i>Hướng Dẫn</h4>
                                        </div>
                                        <div class="card-body">
                                            <ol class="step-list">
                                                <li>Tạo bot mới với <a href="https://t.me/BotFather" target="_blank">@BotFather</a></li>
                                                <li>Lấy Bot Token từ @BotFather</li>
                                                <li>Thêm bot vào nhóm hoặc chat riêng</li>
                                                <li>Lấy Chat ID bằng cách gửi tin nhắn cho bot</li>
                                                <li>Nhập thông tin vào form bên trái</li>
                                                <li>Lưu cấu hình và kiểm tra kết nối</li>
                                            </ol>
                                        </div>
                                    </div>

                                    <!-- Stats Card -->
                                    <div class="card">
                                        <div class="card-header">
                                            <h4><i class="fas fa-chart-line me-2"></i>Thống Kê</h4>
                                        </div>
                                        <div class="card-body">
                                            <div id="telegramStatsInfo">
                                                <p class="text-muted">Đang tải thống kê...</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add to tab content
        const contentContainer = document.getElementById('adminTabContent');
        if (contentContainer) {
            contentContainer.innerHTML = telegramContent;
        } else {
            console.error('adminTabContent container not found');
            return;
        }
        
        // Data will be loaded automatically when tab is activated
        
        // Form submit handler
        setTimeout(() => {
            const form = document.getElementById('telegramConfigForm');
            if (form) {
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    saveTelegramConfig();
                });
            }
        }, 200);
        
        console.log('📱 Telegram management initialized');
    } catch (error) {
        console.error('Error initializing telegram:', error);
        showTelegramError('Có lỗi khi khởi tạo trang Telegram');
    }
};

// Also expose as global function for compatibility
window.loadTelegramConfig = loadTelegramConfig;
window.saveTelegramConfig = saveTelegramConfig;
window.testTelegram = testTelegram;
window.updateTelegramStatus = updateTelegramStatus;
window.showTelegramError = showTelegramError;

// Load Telegram configuration
async function loadTelegramConfig() {
    try {
        console.log('🔄 Loading telegram config from API...');
        
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch('http://localhost:5001/api/telegram/config', {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();

        console.log('📊 Telegram API Response:', data);

        if (data.success) {
            const config = data.data;
            console.log('✅ Successfully loaded telegram config:', config);
            
            try {
                // Populate form fields safely
                const botTokenField = document.getElementById('telegramBotToken');
                const chatIdField = document.getElementById('telegramChatId');
                const enabledField = document.getElementById('telegramEnabled');
                
                if (botTokenField) botTokenField.value = config.bot_token || '';
                if (chatIdField) chatIdField.value = config.chat_id || '';
                if (enabledField) enabledField.checked = config.enabled || false;
                
                // Update status display immediately
                updateTelegramStatus(config);
                
                console.log('📱 Telegram config loaded successfully:', {
                    hasToken: !!config.bot_token,
                    hasChatId: !!config.chat_id,
                    enabled: config.enabled
                });
            } catch (domError) {
                console.error('DOM Error:', domError);
                showTelegramError('Có lỗi khi cập nhật giao diện');
            }
        } else {
            showTelegramError('Không thể tải cấu hình: ' + data.message);
        }
    } catch (error) {
        console.error('Error loading telegram config:', error);
        if (error.name === 'AbortError') {
            showTelegramError('Kết nối quá chậm. Vui lòng thử lại.');
        } else {
            showTelegramError('Có lỗi xảy ra khi tải cấu hình: ' + error.message);
        }
    }
}

// Save Telegram configuration
async function saveTelegramConfig() {
    try {
        const botTokenField = document.getElementById('telegramBotToken');
        const chatIdField = document.getElementById('telegramChatId');
        const enabledField = document.getElementById('telegramEnabled');
        
        if (!botTokenField || !chatIdField || !enabledField) {
            showTelegramError('Không tìm thấy các trường form cần thiết');
            return;
        }
        
        const config = {
            bot_token: botTokenField.value,
            chat_id: chatIdField.value,
            enabled: enabledField.checked
        };

        // Check if there's existing configuration and show warning
        const hasExistingConfig = config.bot_token || config.chat_id;
        
        if (hasExistingConfig) {
            const result = await Swal.fire({
                title: 'Cập nhật cấu hình Telegram',
                text: 'Bạn có chắc chắn muốn cập nhật cấu hình Telegram hiện tại?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Cập nhật',
                cancelButtonText: 'Hủy'
            });

            if (!result.isConfirmed) {
                return;
            }
        }

        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch('http://localhost:5001/api/telegram/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        const data = await response.json();

        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Cấu hình Telegram đã được lưu'
            });
            loadTelegramConfig(); // Reload to show updated status
        } else {
            showTelegramError('Không thể lưu cấu hình: ' + data.message);
        }
    } catch (error) {
        console.error('Error saving telegram config:', error);
        if (error.name === 'AbortError') {
            showTelegramError('Kết nối quá chậm. Vui lòng thử lại.');
        } else {
            showTelegramError('Có lỗi xảy ra khi lưu cấu hình: ' + error.message);
        }
    }
}

// Test Telegram connection
async function testTelegram() {
    const testBtn = document.getElementById('telegramTestBtn');
    const testResult = document.getElementById('telegramTestResult');
    
    testBtn.disabled = true;
    testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
    
    try {
        // Create a test blessing
        const testData = {
            name: 'Test User',
            from: 'Cô dâu',
            content: 'Đây là tin nhắn thử từ hệ thống Wedding Admin. Nếu bạn nhận được tin nhắn này, cấu hình Telegram đã hoạt động chính xác! 🎉'
        };

        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch('http://localhost:5001/api/blessing/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        const data = await response.json();

        if (data.success) {
            testResult.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i> 
                    Tin nhắn thử đã được gửi thành công! Kiểm tra Telegram để xác nhận.
                </div>
            `;
        } else {
            testResult.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle"></i> 
                    Không thể gửi tin nhắn thử: ${data.message}
                </div>
            `;
        }
    } catch (error) {
        console.error('Error testing telegram:', error);
        if (error.name === 'AbortError') {
            testResult.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-clock"></i> 
                    Kết nối quá chậm. Vui lòng kiểm tra cấu hình và thử lại.
                </div>
            `;
        } else {
            testResult.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle"></i> 
                    Có lỗi xảy ra khi gửi tin nhắn thử: ${error.message}
                </div>
            `;
        }
    } finally {
        testBtn.disabled = false;
        testBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi Tin Nhắn Thử';
        testResult.style.display = 'block';
    }
}

// Update status display
function updateTelegramStatus(config) {
    try {
        const statusInfo = document.getElementById('telegramStatusInfo');
        if (!statusInfo) {
            console.warn('telegramStatusInfo element not found');
            return;
        }
        
        let statusHtml = '';
        
        if (config.enabled && config.bot_token && config.chat_id) {
            statusHtml = `
                <div class="d-flex align-items-center mb-2">
                    <span class="status-indicator status-enabled me-2"></span>
                    <span class="text-success">Telegram đã được kích hoạt</span>
                </div>
                <div class="mb-2">
                    <small class="text-muted">Bot Token: ${config.bot_token.substring(0, 10)}...</small>
                </div>
                <div class="mb-2">
                    <small class="text-muted">Chat ID: ${config.chat_id}</small>
                </div>
                <div class="alert alert-success mt-3">
                    <i class="fas fa-check-circle"></i>
                    <strong>Cấu hình hoàn chỉnh:</strong><br>
                    ✅ Bot Token: Đã cấu hình<br>
                    ✅ Chat ID: Đã cấu hình<br>
                    ✅ Trạng thái: Đã kích hoạt
                </div>
            `;
        } else {
            statusHtml = `
                <div class="d-flex align-items-center mb-2">
                    <span class="status-indicator status-disabled me-2"></span>
                    <span class="text-danger">Telegram chưa được cấu hình</span>
                </div>
                <div class="mb-2">
                    <small class="text-muted">Vui lòng nhập đầy đủ thông tin và kích hoạt</small>
                </div>
                <div class="alert alert-warning mt-3">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Cấu hình hiện tại:</strong><br>
                    ${config.bot_token ? '✅' : '❌'} Bot Token: ${config.bot_token ? 'Đã cấu hình' : 'Chưa cấu hình'}<br>
                    ${config.chat_id ? '✅' : '❌'} Chat ID: ${config.chat_id ? 'Đã cấu hình' : 'Chưa cấu hình'}<br>
                    ${config.enabled ? '✅' : '❌'} Trạng thái: ${config.enabled ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
                </div>
            `;
        }
        
        statusInfo.innerHTML = statusHtml;
    } catch (error) {
        console.error('Error updating telegram status:', error);
    }
}

// Show error
function showTelegramError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: message
    });
}

// Show current configuration info
function showCurrentConfigInfo(config) {
    const statusInfo = document.getElementById('telegramStatusInfo');
    
    let statusHtml = '';
    
    if (config.enabled && config.bot_token && config.chat_id) {
        statusHtml = `
            <div class="d-flex align-items-center mb-2">
                <span class="status-indicator status-enabled me-2"></span>
                <span class="text-success">Telegram đã được kích hoạt</span>
            </div>
            <div class="mb-2">
                <small class="text-muted">Bot Token: ${config.bot_token.substring(0, 10)}...</small>
            </div>
            <div class="mb-2">
                <small class="text-muted">Chat ID: ${config.chat_id}</small>
            </div>
            <div class="alert alert-info mt-3">
                <i class="fas fa-info-circle"></i>
                <strong>Cấu hình hiện tại:</strong><br>
                Bot Token: ${config.bot_token ? 'Đã cấu hình' : 'Chưa cấu hình'}<br>
                Chat ID: ${config.chat_id ? 'Đã cấu hình' : 'Chưa cấu hình'}<br>
                Trạng thái: ${config.enabled ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
            </div>
        `;
    } else {
        statusHtml = `
            <div class="d-flex align-items-center mb-2">
                <span class="status-indicator status-disabled me-2"></span>
                <span class="text-danger">Telegram chưa được cấu hình</span>
            </div>
            <div class="mb-2">
                <small class="text-muted">Vui lòng nhập đầy đủ thông tin và kích hoạt</small>
            </div>
            <div class="alert alert-warning mt-3">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>Cấu hình hiện tại:</strong><br>
                Bot Token: ${config.bot_token ? 'Đã cấu hình' : 'Chưa cấu hình'}<br>
                Chat ID: ${config.chat_id ? 'Đã cấu hình' : 'Chưa cấu hình'}<br>
                Trạng thái: ${config.enabled ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
            </div>
        `;
    }
    
    statusInfo.innerHTML = statusHtml;
}

console.log('📱 telegram-tab.js loaded successfully');
