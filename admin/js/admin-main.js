// Wedding Admin Main JavaScript
let siteData = {};
let isDataLoaded = false;
let bannerSlides = [];

// Make siteData globally accessible
window.siteData = siteData;

// Initialize admin when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
    loadSiteData();
    setupEventListeners();
});

// Initialize admin interface
function initializeAdmin() {
    console.log('Initializing Wedding Admin...');
    
    // Show loading overlay
    showLoadingOverlay();
    
    // Initialize tabs
    initializeTabs();
    
    // Initialize form elements
    initializeFormElements();
    
    // Initialize image upload areas
    initializeImageUploads();
    
    // Initialize color pickers
    initializeColorPickers();
    
    // Initialize range sliders
    initializeRangeSliders();
    
    // Initialize banner management
    initializeBannerManagement();
    
    // Load initial content - let admin.html handle this
    // if (typeof window.loadTabContent === 'function') {
    //     window.loadTabContent('overview');
    // }
    
    // Hide loading overlay
    setTimeout(() => {
        hideLoadingOverlay();
    }, 1000);
}

// Initialize Bootstrap tabs
function initializeTabs() {
    const tabTriggers = document.querySelectorAll('[data-bs-toggle="pill"]');
    tabTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-bs-target');
            const tabName = targetId.replace('#', '');
            
            console.log('🔄 Tab clicked:', tabName);
            
            // Remove active class from all nav links
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Clear dynamic content first
            clearDynamicContent();
            
            // Load tab content
            loadTabContent(tabName);
        });
    });
}

// Load content for specific tab
function loadTabContent(tabName) {
    console.log('🔄 Loading tab content for:', tabName);
    const contentContainer = document.getElementById('adminTabContent');
    
    if (!contentContainer) {
        console.error('❌ Content container not found');
        return;
    }
    
    // Show loading
    showLoadingOverlay();
    
    // For blessings and telegram, use external files instead of dynamic content
    console.log('🔍 Checking tab name:', tabName, 'Type:', typeof tabName);
    if (tabName === 'blessings' || tabName === 'telegram') {
        console.log('🔄 Using external file for:', tabName);
        // Don't use dynamic content, go to external file loading
    } else {
        console.log('🔄 Using dynamic content for:', tabName);
        // Clear container first
        contentContainer.innerHTML = '';
        
        // Initialize tab content immediately without showLoading
        setTimeout(() => {
            initializeTabContent(tabName);
            hideLoadingOverlay();
            
            // Direct API call after content is loaded
            setTimeout(() => {
                if (tabName === 'blessings') {
                    console.log('🔄 Direct API call for blessings data (dynamic)...');
                    if (typeof window.applyBlessingFilters === 'function') {
                        console.log('🔄 Calling window.applyBlessingFilters() directly...');
                        window.applyBlessingFilters();
                    } else {
                        console.log('⚠️ window.applyBlessingFilters function not found');
                    }
                } else if (tabName === 'telegram') {
                    console.log('🔄 Direct API call for telegram config (dynamic)...');
                    if (typeof window.loadTelegramConfig === 'function') {
                        console.log('🔄 Calling window.loadTelegramConfig() directly...');
                        window.loadTelegramConfig();
                    } else {
                        console.log('⚠️ window.loadTelegramConfig function not found');
                    }
                }
            }, 1000); // Increased delay to 1 second
        }, 100);
        return;
    }
    
    console.log('🔄 Using external file for:', tabName);
    
    // Load content from external file for other tabs
    fetch(`./admin-pages/${tabName}.html`)
        .then(response => {
            console.log('📡 Fetch response:', response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.text();
        })
        .then(html => {
            console.log('✅ Content loaded for tab:', tabName, 'Length:', html.length);
            console.log('🔄 About to set innerHTML for tab:', tabName);
            
            try {
                contentContainer.innerHTML = html;
                console.log('✅ innerHTML set for tab:', tabName);
                
                // Initialize tab content after a short delay to ensure DOM is ready
                setTimeout(() => {
                    console.log('🔄 About to call initializeTabContent for:', tabName);
                    
                    // Don't call initializeTabContent for telegram and blessings when loading external files
                    // because it will conflict with the external HTML content
                    if (tabName !== 'telegram' && tabName !== 'blessings') {
                        initializeTabContent(tabName);
                        console.log('✅ initializeTabContent completed for:', tabName);
                    } else {
                        console.log('⏭️ Skipping initializeTabContent for external file tab:', tabName);
                    }
                    
                    // Direct API call for external file tabs
                    if (tabName === 'telegram') {
                        console.log('🔄 Setting up telegram direct API call...');
                        setTimeout(() => {
                            console.log('🔄 Direct API call for telegram config...');
                            console.log('🔍 window.loadTelegramConfig type:', typeof window.loadTelegramConfig);
                            console.log('🔍 window.loadConfig type:', typeof window.loadConfig);
                            console.log('🔍 Available window functions:', Object.keys(window).filter(k => k.includes('Telegram') || k.includes('loadConfig')));
                            
                            // Try both function names
                            if (typeof window.loadTelegramConfig === 'function') {
                                console.log('🔄 Calling window.loadTelegramConfig() directly...');
                                window.loadTelegramConfig();
                            } else if (typeof window.loadConfig === 'function') {
                                console.log('🔄 Calling window.loadConfig() directly...');
                                window.loadConfig();
                            } else {
                                console.log('⚠️ Neither loadTelegramConfig nor loadConfig function found');
                            }
                        }, 1000); // Increased delay to 1 second
                    } else if (tabName === 'blessings') {
                        console.log('🔄 Setting up blessings direct API call...');
                        setTimeout(() => {
                            console.log('🔄 Direct API call for blessings data...');
                            console.log('🔍 window.applyBlessingFilters type:', typeof window.applyBlessingFilters);
                            console.log('🔍 Available window functions:', Object.keys(window).filter(k => k.includes('Blessing')));
                            if (typeof window.applyBlessingFilters === 'function') {
                                console.log('🔄 Calling window.applyBlessingFilters() directly...');
                                window.applyBlessingFilters();
                            } else {
                                console.log('⚠️ window.applyBlessingFilters function not found');
                            }
                        }, 1000); // Increased delay to 1 second
                    }
                }, 100);
                
                hideLoadingOverlay();
            } catch (error) {
                console.error('❌ Error setting innerHTML:', error);
                hideLoadingOverlay();
            }
        })
        .catch(error => {
            console.error('❌ Error loading tab content:', error);
            contentContainer.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Không thể tải nội dung cho tab "${tabName}". Lỗi: ${error.message}
                </div>
            `;
            hideLoadingOverlay();
        });
}

// Expose loadTabContent globally
window.loadTabContent = loadTabContent;

// Clear dynamic content when switching tabs
function clearDynamicContent() {
    const contentContainer = document.getElementById('adminTabContent');
    if (contentContainer) {
        console.log('🧹 Clearing dynamic content...');
        // Always clear the container to ensure clean state
        contentContainer.innerHTML = '';
    }
}

// Initialize content for specific tab
function initializeTabContent(tabName) {
    console.log('🔍 initializeTabContent called for:', tabName);
    
    // Initialize Quill editors if present
    initializeQuillEditors();
    
    // Re-initialize form elements for the new content
    initializeFormElements();
    initializeImageUploads();
    initializeColorPickers();
    initializeRangeSliders();
    
    // Initialize tab-specific functionality
    console.log('🔍 Entering switch for tab:', tabName);
    switch(tabName) {
        case 'overview':
            loadOverviewData();
            break;
        case 'hero':
            console.log('🔍 In hero case');
            console.log('🔍 initializeHero function type:', typeof initializeHero);
            console.log('🔍 window.initializeHero function type:', typeof window.initializeHero);
            // Call initializeHero from hero-tab.js
            if (typeof initializeHero === 'function') {
                console.log('🔄 Calling initializeHero...');
                initializeHero();
            } else if (typeof window.initializeHero === 'function') {
                console.log('🔄 Calling window.initializeHero...');
                window.initializeHero();
            } else {
                console.error('❌ initializeHero function not found');
            }
            break;
        case 'couple':
            console.log('🔍 In couple case');
            console.log('🔍 initializeCouple function type:', typeof initializeCouple);
            console.log('🔍 window.initializeCouple function type:', typeof window.initializeCouple);
            // Call initializeCouple from couple-tab.js
            if (typeof initializeCouple === 'function') {
                console.log('🔄 Calling initializeCouple...');
                initializeCouple();
            } else if (typeof window.initializeCouple === 'function') {
                console.log('🔄 Calling window.initializeCouple...');
                window.initializeCouple();
            } else {
                console.error('❌ initializeCouple function not found');
            }
            break;
        case 'story':
            console.log('🔍 In story case');
            console.log('🔍 initializeStoryManagement function type:', typeof initializeStoryManagement);
            console.log('🔍 window.initializeStoryManagement function type:', typeof window.initializeStoryManagement);
            console.log('🔍 All window functions:', Object.keys(window).filter(k => k.includes('Story')));
            console.log('🔍 All window functions with Story:', Object.keys(window).filter(k => k.toLowerCase().includes('story')));
            console.log('🔍 All window functions with Management:', Object.keys(window).filter(k => k.toLowerCase().includes('management')));
            
            // Wait a bit for scripts to load
            setTimeout(() => {
                console.log('🔍 After timeout - initializeStoryManagement function type:', typeof initializeStoryManagement);
                console.log('🔍 After timeout - window.initializeStoryManagement function type:', typeof window.initializeStoryManagement);
                
                // Call initializeStoryManagement from story-management.js
                if (typeof initializeStoryManagement === 'function') {
                    console.log('🔄 Calling initializeStoryManagement...');
                    initializeStoryManagement();
                } else if (typeof window.initializeStoryManagement === 'function') {
                    console.log('🔄 Calling window.initializeStoryManagement...');
                    window.initializeStoryManagement();
                } else {
                    console.error('❌ initializeStoryManagement function not found');
                    console.log('🔍 Available functions:', Object.keys(window).filter(k => k.includes('Story')));
                    console.log('🔍 All window functions:', Object.keys(window).slice(0, 20));
                }
            }, 500);
            break;
        case 'blessings':
            console.log('🔍 In blessings case - calling initializeBlessings');
            if (typeof window.initializeBlessings === 'function') {
                console.log('🔄 Calling window.initializeBlessings...');
                window.initializeBlessings();
            } else {
                console.error('❌ window.initializeBlessings function not found');
            }
            break;
        case 'telegram':
            console.log('🔍 In telegram case - calling initializeTelegram');
            if (typeof window.initializeTelegram === 'function') {
                console.log('🔄 Calling window.initializeTelegram...');
                window.initializeTelegram();
            } else {
                console.error('❌ window.initializeTelegram function not found');
            }
            break;
        case 'gallery':
            loadGalleryData();
            break;
        case 'payment':
            loadPaymentData();
            break;
        case 'event':
            loadEventData();
            break;
        case 'wishes':
            loadWishesData();
            break;
        case 'theme':
            loadThemeData();
            break;
        case 'layout':
            loadLayoutData();
            break;
        case 'settings':
            loadSettingsData();
            break;
    }
}

// Initialize Quill editors
function initializeQuillEditors() {
    // This function will be called when Quill editors are needed
    // Implementation depends on specific requirements
}

// Load site data from JSON file
async function loadSiteData() {
    try {
        // First try to load from localStorage (current working data)
        const storedData = localStorage.getItem('siteDataOverride');
        if (storedData) {
            siteData = JSON.parse(storedData);
            isDataLoaded = true;
            console.log('Site data loaded from localStorage:', siteData);
            
            // Update banner slides
            if (siteData.hero && siteData.hero.slides) {
                bannerSlides = [...siteData.hero.slides];
            } else {
                bannerSlides = [];
            }
            
            updateAdminInterface();
            showAlert('Đã tải dữ liệu hiện tại từ localStorage', 'success');
            return;
        }
        
        // Then try to load from API
        try {
            const response = await fetch('window.location.origin/api/data');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success && result.data) {
                siteData = result.data;
                window.siteData = siteData; // Make it globally accessible
                isDataLoaded = true;
                console.log('Site data loaded from API:', siteData);
                console.log('window.siteData set to:', window.siteData);
                
                // Update banner slides
                if (siteData.hero && siteData.hero.slides) {
                    bannerSlides = [...siteData.hero.slides];
                    window.bannerSlides = bannerSlides;
                } else {
                    bannerSlides = [];
                    window.bannerSlides = bannerSlides;
                }
                
                // Update admin interface with loaded data
                updateAdminInterface();
                showAlert('Đã tải dữ liệu từ API', 'success');
            } else {
                throw new Error('API response invalid');
            }
            return;
        } catch (fetchError) {
            console.log('API not accessible, creating default data:', fetchError.message);
            // Create default data structure
            siteData = {
                admin: {
                    lastUpdate: new Date().toISOString()
                },
                hero: {
                    groomName: '',
                    brideName: '',
                    weddingDate: '',
                    weddingTime: '',
                    weddingLocation: '',
                    slides: []
                },
                meta: {
                    title: 'Wedding Website',
                    description: 'Website cưới',
                    primaryColor: '#9f5958'
                },
                couple: {
                    groomName: '',
                    brideName: '',
                    groomDescription: '',
                    brideDescription: ''
                },
                story: [],
                gallery: [],
                payment: {
                    bankName: '',
                    accountNumber: '',
                    accountHolder: '',
                    message: '',
                    visible: true
                },
                event: {
                    weddingDate: '',
                    weddingTime: '',
                    ceremonyDate: '',
                    ceremonyTime: '',
                    ceremonyVenue: '',
                    ceremonyAddress: '',
                    receptionVenue: '',
                    receptionTime: '',
                    receptionAddress: '',
                    googleMapsLink: '',
                    visible: true
                },
                wishes: {
                    customMessage: 'Hãy gửi lời chúc của bạn để chia sẻ niềm vui cùng chúng mình!',
                    visible: true,
                    suggestions: []
                },
                theme: {
                    primaryColor: '#9f5958',
                    secondaryColor: '#f8f9fa',
                    textColor: '#2c3e50',
                    backgroundColor: '#ffffff',
                    borderColor: '#dee2e6',
                    accentColor: '#e74c3c',
                    primaryFont: "'Segoe UI', sans-serif",
                    headingFont: "'Playfair Display', serif",
                    baseFontSize: 16,
                    headingFontSize: 32
                },
                layout: {
                    headerStyle: 'hero',
                    navStyle: 'top',
                    footerStyle: 'simple',
                    contentLayout: 'single',
                    sectionSpacing: 50,
                    borderRadius: 8,
                    boxShadow: 5,
                    animationStyle: 'none',
                    mobileOptimized: true,
                    touchFriendly: true,
                    fastLoading: true,
                    seoOptimized: true
                },
                visibility: {
                    sections: {
                        gallery: true,
                        story: true,
                        couple: true,
                        rsvp: true,
                        donate: true,
                        audio: true
                    }
                },
                additional: {
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
            
            window.siteData = siteData; // Make it globally accessible
            isDataLoaded = true;
            console.log('Site data initialized with default values:', siteData);
            console.log('window.siteData set to:', window.siteData);
            
            // Update banner slides
            bannerSlides = [];
            window.bannerSlides = bannerSlides;
            
            updateAdminInterface();
            showAlert('Đã khởi tạo dữ liệu mặc định', 'info');
            return;
        }
        
    } catch (error) {
        console.error('Error loading site data:', error);
        
        // Show error message but continue with default data
        showAlert('Không thể tải dữ liệu từ server. Sử dụng dữ liệu mặc định.', 'warning');
        
        // Initialize banner slides as empty array if no data loaded
        if (!isDataLoaded) {
            bannerSlides = [];
            window.bannerSlides = bannerSlides;
        }
    }
}

// Update admin interface with loaded data
function updateAdminInterface() {
    if (!isDataLoaded) return;
    
    console.log('Updating admin interface with data:', siteData);
    
    // Update overview statistics
    updateOverviewStats();
    
    // Update form fields
    updateFormFields();
    
    // Update image previews
    updateImagePreviews();
    
    // Update theme settings
    updateThemeSettings();
    
    // Update visibility settings
    updateVisibilitySettings();
    
    // Trigger tab-specific data loading
    triggerTabDataLoading();
}

// Trigger data loading for currently active tab
function triggerTabDataLoading() {
    const activeTab = document.querySelector('.nav-link.active');
    if (activeTab) {
        const tabName = activeTab.getAttribute('data-bs-target')?.replace('#', '');
        if (tabName) {
            console.log('Triggering data loading for tab:', tabName);
            // Call the specific tab's data loading function
            const loadFunction = window['load' + tabName.charAt(0).toUpperCase() + tabName.slice(1) + 'Data'];
            if (typeof loadFunction === 'function') {
                loadFunction();
            }
        }
    }
}

// Update overview statistics
function updateOverviewStats() {
    const totalImages = (siteData.gallery?.length || 0) + 
                       (siteData.hero?.slides?.length || 0) + 
                       (siteData.story?.length || 0);
    
    const totalStories = siteData.story?.length || 0;
    const totalSections = Object.keys(siteData.visibility?.sections || {}).length;
    const lastUpdated = siteData.admin?.lastUpdate || 'Chưa cập nhật';
    
    const totalImagesEl = document.getElementById('totalImages');
    const totalStoriesEl = document.getElementById('totalStories');
    const totalSectionsEl = document.getElementById('totalSections');
    const lastUpdatedEl = document.getElementById('lastUpdated');
    
    if (totalImagesEl) totalImagesEl.textContent = totalImages;
    if (totalStoriesEl) totalStoriesEl.textContent = totalStories;
    if (totalSectionsEl) totalSectionsEl.textContent = totalSections;
    if (lastUpdatedEl) lastUpdatedEl.textContent = lastUpdated;
}

// Update form fields with loaded data
function updateFormFields() {
    console.log('Updating form fields with data:', siteData);
    
    // Hero section
    if (siteData.hero) {
        console.log('Setting hero fields:', siteData.hero);
        setFieldValue('groomName', siteData.hero.groomName);
        setFieldValue('brideName', siteData.hero.brideName);
        setFieldValue('weddingDate', siteData.hero.weddingDate);
        setFieldValue('weddingTime', siteData.hero.weddingTime);
        setFieldValue('weddingLocation', siteData.hero.weddingLocation);
    }
    
    // Meta information
    if (siteData.meta) {
        console.log('Setting meta fields:', siteData.meta);
        setFieldValue('mainTitle', siteData.meta.title);
        setFieldValue('description', siteData.meta.description);
        setFieldValue('primaryColor', siteData.meta.primaryColor);
        setFieldValue('secondaryColor', siteData.meta.secondaryColor);
        setFieldValue('accentColor', siteData.meta.accentColor);
    }
    
    // Couple information
    if (siteData.couple) {
        console.log('Setting couple fields:', siteData.couple);
        setFieldValue('groomNameDetail', siteData.couple.groom?.name || '');
        setFieldValue('brideNameDetail', siteData.couple.bride?.name || '');
        setFieldValue('groomDescription', siteData.couple.groom?.description || '');
        setFieldValue('brideDescription', siteData.couple.bride?.description || '');
        
        // Parent information
        if (siteData.couple.parents) {
            setFieldValue('groomFather', siteData.couple.parents.groom?.father || '');
            setFieldValue('groomMother', siteData.couple.parents.groom?.mother || '');
            setFieldValue('brideFather', siteData.couple.parents.bride?.father || '');
            setFieldValue('brideMother', siteData.couple.parents.bride?.mother || '');
        }
    }
    
    // Payment information
    if (siteData.payment) {
        setFieldValue('bankName', siteData.payment.bankName);
        setFieldValue('accountNumber', siteData.payment.accountNumber);
        setFieldValue('accountHolder', siteData.payment.accountHolder);
        setFieldValue('paymentMessage', siteData.payment.message);
    }
    
    // Event information
    if (siteData.event) {
        setFieldValue('ceremonyDate', siteData.event.ceremonyDate);
        setFieldValue('ceremonyTime', siteData.event.ceremonyTime);
        setFieldValue('ceremonyVenue', siteData.event.ceremonyVenue);
        setFieldValue('ceremonyAddress', siteData.event.ceremonyAddress);
        setFieldValue('receptionDate', siteData.event.weddingDate);
        setFieldValue('receptionTime', siteData.event.receptionTime);
        setFieldValue('receptionVenue', siteData.event.receptionVenue);
        setFieldValue('receptionAddress', siteData.event.receptionAddress);
        setFieldValue('googleMapsLink', siteData.event.googleMapsLink);
    }
    
    // Wishes information
    if (siteData.wishes) {
        setFieldValue('wishesMessage', siteData.wishes.customMessage);
    }
    
    // Theme settings
    if (siteData.theme) {
        setFieldValue('themePrimaryColor', siteData.theme.primaryColor);
        setFieldValue('themeSecondaryColor', siteData.theme.secondaryColor);
        setFieldValue('themeTextColor', siteData.theme.textColor);
        setFieldValue('themeBackgroundColor', siteData.theme.backgroundColor);
        setFieldValue('themeBorderColor', siteData.theme.borderColor);
        setFieldValue('themeAccentColor', siteData.theme.accentColor);
        setFieldValue('themePrimaryFont', siteData.theme.primaryFont);
        setFieldValue('themeHeadingFont', siteData.theme.headingFont);
        setFieldValue('themeBaseFontSize', siteData.theme.baseFontSize);
        setFieldValue('themeHeadingFontSize', siteData.theme.headingFontSize);
    }
    
    // Additional information
    if (siteData.additional?.parents) {
        setFieldValue('groomFather', siteData.additional.parents.groom?.father);
        setFieldValue('groomMother', siteData.additional.parents.groom?.mother);
        setFieldValue('brideFather', siteData.additional.parents.bride?.father);
        setFieldValue('brideMother', siteData.additional.parents.bride?.mother);
    }
    
    console.log('Form fields updated successfully');
}

// Set field value helper
function setFieldValue(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field && value !== undefined) {
        if (field.type === 'checkbox') {
            field.checked = !!value;
        } else {
            field.value = value;
        }
        console.log(`✅ Set field ${fieldId} = ${value}`);
    } else {
        console.log(`❌ Field ${fieldId} not found or value undefined (value: ${value})`);
    }
}

// Update image previews
function updateImagePreviews() {
    // Couple images - use dataUrl for preview if available, otherwise use src
    if (siteData.couple?.img1) {
        const src = siteData.couple.img1.dataUrl || siteData.couple.img1.src;
        if (src) updateImagePreview('groomDetailPreview', src);
    }
    if (siteData.couple?.img2) {
        const src = siteData.couple.img2.dataUrl || siteData.couple.img2.src;
        if (src) updateImagePreview('brideDetailPreview', src);
    }
    
    // QR codes - use dataUrl for preview if available, otherwise use src
    if (siteData.payment?.qrCode || siteData.payment?.qrCodeData) {
        const src = siteData.payment.qrCodeData || siteData.payment.qrCode;
        if (src) updateImagePreview('qrCodePreview', src);
    }
    if (siteData.payment?.groomQR || siteData.payment?.groomQRData) {
        const src = siteData.payment.groomQRData || siteData.payment.groomQR;
        if (src) updateImagePreview('groomQRPreview', src);
    }
    if (siteData.payment?.brideQR || siteData.payment?.brideQRData) {
        const src = siteData.payment.brideQRData || siteData.payment.brideQR;
        if (src) updateImagePreview('brideQRPreview', src);
    }
}

// Update image preview helper
function updateImagePreview(previewId, src) {
    const preview = document.getElementById(previewId);
    if (preview && src) {
        preview.src = src;
        preview.style.display = 'block';
        preview.parentElement.querySelector('.upload-placeholder').style.display = 'none';
    }
}

// Update theme settings
function updateThemeSettings() {
    if (siteData.theme) {
        setFieldValue('primaryThemeColor', siteData.theme.primaryColor);
        setFieldValue('primaryThemeColorText', siteData.theme.primaryColor);
        setFieldValue('secondaryThemeColor', siteData.theme.secondaryColor);
        setFieldValue('secondaryThemeColorText', siteData.theme.secondaryColor);
        setFieldValue('textColor', siteData.theme.textColor);
        setFieldValue('textColorText', siteData.theme.textColor);
        setFieldValue('backgroundColor', siteData.theme.backgroundColor);
        setFieldValue('backgroundColorText', siteData.theme.backgroundColor);
        setFieldValue('borderColor', siteData.theme.borderColor);
        setFieldValue('borderColorText', siteData.theme.borderColor);
        setFieldValue('accentColor', siteData.theme.accentColor);
        setFieldValue('accentColorText', siteData.theme.accentColor);
        setFieldValue('primaryFont', siteData.theme.primaryFont);
        setFieldValue('headingFont', siteData.theme.headingFont);
        setFieldValue('baseFontSize', siteData.theme.baseFontSize);
        setFieldValue('headingFontSize', siteData.theme.headingFontSize);
    }
    
    if (siteData.layout) {
        setFieldValue('headerStyle', siteData.layout.headerStyle);
        setFieldValue('navStyle', siteData.layout.navStyle);
        setFieldValue('footerStyle', siteData.layout.footerStyle);
        setFieldValue('contentLayout', siteData.layout.contentLayout);
        setFieldValue('sectionSpacing', siteData.layout.sectionSpacing);
        setFieldValue('borderRadius', siteData.layout.borderRadius);
        setFieldValue('boxShadow', siteData.layout.boxShadow);
        setFieldValue('animationStyle', siteData.layout.animationStyle);
        setFieldValue('mobileOptimized', siteData.layout.mobileOptimized);
        setFieldValue('touchFriendly', siteData.layout.touchFriendly);
        setFieldValue('fastLoading', siteData.layout.fastLoading);
        setFieldValue('seoOptimized', siteData.layout.seoOptimized);
    }
}

// Update visibility settings
function updateVisibilitySettings() {
    if (siteData.visibility?.sections) {
        const sections = siteData.visibility.sections;
        setFieldValue('showGallery', sections.gallery);
        setFieldValue('showStory', sections.story);
        setFieldValue('showCouple', sections.couple);
        setFieldValue('showRSVP', sections.rsvp);
        setFieldValue('showDonate', sections.donate);
        setFieldValue('showAudio', sections.audio);
    }
}

// Load wishes suggestions
function loadWishesSuggestions() {
    const container = document.getElementById('wishesSuggestions');
    if (!container || !siteData.wishes?.suggestions) return;
    
    let html = '';
    siteData.wishes.suggestions.forEach((suggestion, index) => {
        html += `
        <div class="input-group mb-2">
            <input type="text" class="form-control" value="${suggestion}" 
                   oninput="updateWishSuggestion(${index}, this.value)">
            <button class="btn btn-outline-danger" onclick="removeWishSuggestion(${index})">
                <i class="fas fa-trash"></i>
            </button>
        </div>`;
    });
    
    container.innerHTML = html;
}

// Setup event listeners
function setupEventListeners() {
    // Form field change listeners
    setupFormListeners();
    
    // Image upload listeners
    setupImageUploadListeners();
    
    // Color picker listeners
    setupColorPickerListeners();
    
    // Range slider listeners
    setupRangeSliderListeners();
    
    // Button click listeners
    setupButtonListeners();
}

// Setup form listeners
function setupFormListeners() {
    // Hero section
    addFieldListener('groomName', (value) => updateSiteData('hero.groomName', value));
    addFieldListener('brideName', (value) => updateSiteData('hero.brideName', value));
    addFieldListener('weddingDate', (value) => updateSiteData('hero.weddingDate', value));
    addFieldListener('weddingLocation', (value) => updateSiteData('hero.weddingLocation', value));
    
    // Meta information
    addFieldListener('mainTitle', (value) => updateSiteData('meta.title', value));
    addFieldListener('description', (value) => updateSiteData('meta.description', value));
    addFieldListener('primaryColor', (value) => updateSiteData('meta.primaryColor', value));
    
    // Couple information
    addFieldListener('groomNameDetail', (value) => updateSiteData('couple.groomName', value));
    addFieldListener('brideNameDetail', (value) => updateSiteData('couple.brideName', value));
    addFieldListener('groomDescription', (value) => updateSiteData('couple.groomDescription', value));
    addFieldListener('brideDescription', (value) => updateSiteData('couple.brideDescription', value));
    
    // Additional information
    addFieldListener('groomFather', (value) => updateSiteData('additional.parents.groom.father', value));
    addFieldListener('groomMother', (value) => updateSiteData('additional.parents.groom.mother', value));
    addFieldListener('brideFather', (value) => updateSiteData('additional.parents.bride.father', value));
    addFieldListener('brideMother', (value) => updateSiteData('additional.parents.bride.mother', value));
    
    // Payment information
    addFieldListener('bankName', (value) => updateSiteData('payment.bankName', value));
    addFieldListener('accountNumber', (value) => updateSiteData('payment.accountNumber', value));
    addFieldListener('accountHolder', (value) => updateSiteData('payment.accountHolder', value));
    addFieldListener('paymentMessage', (value) => updateSiteData('payment.message', value));
    addFieldListener('paymentVisible', (value) => updateSiteData('payment.visible', value));
    
    // Event information
    addFieldListener('weddingDate', (value) => updateSiteData('event.weddingDate', value));
    addFieldListener('weddingTime', (value) => updateSiteData('event.weddingTime', value));
    addFieldListener('ceremonyDate', (value) => updateSiteData('event.ceremonyDate', value));
    addFieldListener('ceremonyTime', (value) => updateSiteData('event.ceremonyTime', value));
    addFieldListener('ceremonyVenue', (value) => updateSiteData('event.ceremonyVenue', value));
    addFieldListener('ceremonyAddress', (value) => updateSiteData('event.ceremonyAddress', value));
    addFieldListener('receptionVenue', (value) => updateSiteData('event.receptionVenue', value));
    addFieldListener('receptionTime', (value) => updateSiteData('event.receptionTime', value));
    addFieldListener('receptionAddress', (value) => updateSiteData('event.receptionAddress', value));
    addFieldListener('googleMapsLink', (value) => updateSiteData('event.googleMapsLink', value));
    addFieldListener('eventVisible', (value) => updateSiteData('event.visible', value));
    
    // Wishes information
    addFieldListener('wishesMessage', (value) => updateSiteData('wishes.customMessage', value));
    addFieldListener('wishesVisible', (value) => updateSiteData('wishes.visible', value));
    
    // Theme settings
    addFieldListener('primaryThemeColor', (value) => updateSiteData('theme.primaryColor', value));
    addFieldListener('secondaryThemeColor', (value) => updateSiteData('theme.secondaryColor', value));
    addFieldListener('textColor', (value) => updateSiteData('theme.textColor', value));
    addFieldListener('backgroundColor', (value) => updateSiteData('theme.backgroundColor', value));
    addFieldListener('borderColor', (value) => updateSiteData('theme.borderColor', value));
    addFieldListener('accentColor', (value) => updateSiteData('theme.accentColor', value));
    addFieldListener('primaryFont', (value) => updateSiteData('theme.primaryFont', value));
    addFieldListener('headingFont', (value) => updateSiteData('theme.headingFont', value));
    addFieldListener('baseFontSize', (value) => updateSiteData('theme.baseFontSize', parseInt(value)));
    addFieldListener('headingFontSize', (value) => updateSiteData('theme.headingFontSize', parseInt(value)));
    
    // Layout settings
    addFieldListener('headerStyle', (value) => updateSiteData('layout.headerStyle', value));
    addFieldListener('navStyle', (value) => updateSiteData('layout.navStyle', value));
    addFieldListener('footerStyle', (value) => updateSiteData('layout.footerStyle', value));
    addFieldListener('contentLayout', (value) => updateSiteData('layout.contentLayout', value));
    addFieldListener('sectionSpacing', (value) => updateSiteData('layout.sectionSpacing', parseInt(value)));
    addFieldListener('borderRadius', (value) => updateSiteData('layout.borderRadius', parseInt(value)));
    addFieldListener('boxShadow', (value) => updateSiteData('layout.boxShadow', parseInt(value)));
    addFieldListener('animationStyle', (value) => updateSiteData('layout.animationStyle', value));
    addFieldListener('mobileOptimized', (value) => updateSiteData('layout.mobileOptimized', value));
    addFieldListener('touchFriendly', (value) => updateSiteData('layout.touchFriendly', value));
    addFieldListener('fastLoading', (value) => updateSiteData('layout.fastLoading', value));
    addFieldListener('seoOptimized', (value) => updateSiteData('layout.seoOptimized', value));
    
    // Visibility settings
    addFieldListener('showGallery', (value) => updateSiteData('visibility.sections.gallery', value));
    addFieldListener('showStory', (value) => updateSiteData('visibility.sections.story', value));
    addFieldListener('showCouple', (value) => updateSiteData('visibility.sections.couple', value));
    addFieldListener('showRSVP', (value) => updateSiteData('visibility.sections.rsvp', value));
    addFieldListener('showDonate', (value) => updateSiteData('visibility.sections.donate', value));
    addFieldListener('showAudio', (value) => updateSiteData('visibility.sections.audio', value));
}

// Add field listener helper
function addFieldListener(fieldId, callback) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.addEventListener('input', function() {
            const value = field.type === 'checkbox' ? field.checked : field.value;
            callback(value);
        });
    }
}

// Update site data helper
function updateSiteData(path, value) {
    const keys = path.split('.');
    let current = siteData;
    
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
            current[keys[i]] = {};
        }
        current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    
    // Update last modified time
    if (!siteData.admin) siteData.admin = {};
    siteData.admin.lastUpdate = new Date().toISOString();
    
    console.log('Updated site data:', path, '=', value);
}

// Setup image upload listeners
function setupImageUploadListeners() {
    // Unified image upload handler
    document.addEventListener('click', function(e) {
        const uploadArea = e.target.closest('.image-upload-area[data-upload-type]');
        if (uploadArea) {
            e.preventDefault();
            e.stopPropagation();
            const type = uploadArea.getAttribute('data-upload-type');
            
            // Handle different upload types
            switch(type) {
                case 'groom':
                case 'bride':
                    uploadCoupleImage(type);
                    break;
                case 'qr':
                    uploadQRCode();
                    break;
                case 'groomQR':
                    uploadGroomQR();
                    break;
                case 'brideQR':
                    uploadBrideQR();
                    break;
                case 'story':
                    // Story upload is handled by story-management.js
                    if (typeof window.uploadStoryImage === 'function') {
                        window.uploadStoryImage();
                    }
                    break;
                default:
                    console.warn('Unknown upload type:', type);
            }
            return;
        }
        
        // Multiple image uploads (legacy onclick handler)
        if (e.target.closest('[onclick*="uploadMultipleImages"]')) {
            e.preventDefault();
            e.stopPropagation();
            uploadMultipleImages();
        }
    });
}

// Setup color picker listeners
function setupColorPickerListeners() {
    const colorPickers = document.querySelectorAll('.color-picker');
    colorPickers.forEach(picker => {
        picker.addEventListener('change', function() {
            const textField = document.getElementById(this.id.replace('Color', 'ColorText'));
            if (textField) {
                textField.value = this.value;
            }
        });
    });
    
    const colorTexts = document.querySelectorAll('.color-text');
    colorTexts.forEach(textField => {
        textField.addEventListener('input', function() {
            const picker = document.getElementById(this.id.replace('Text', ''));
            if (picker && /^#[0-9A-F]{6}$/i.test(this.value)) {
                picker.value = this.value;
            }
        });
    });
}

// Setup range slider listeners
function setupRangeSliderListeners() {
    const rangeSliders = document.querySelectorAll('.form-range');
    rangeSliders.forEach(slider => {
        slider.addEventListener('input', function() {
            const label = this.parentElement.querySelector('small');
            if (label) {
                label.textContent = this.value + 'px';
            }
        });
    });
}

// Setup button listeners
function setupButtonListeners() {
    // Save changes
    document.addEventListener('click', function(e) {
        if (e.target.closest('[onclick*="saveChanges"]')) {
            saveChanges();
        }
    });
    
    // Preview website
    document.addEventListener('click', function(e) {
        if (e.target.closest('[onclick*="previewWebsite"]')) {
            if (typeof previewWebsite === 'function') {
                previewWebsite();
            } else {
                console.log('previewWebsite function not available');
            }
        }
    });
    
    // Download data
    document.addEventListener('click', function(e) {
        if (e.target.closest('[onclick*="downloadData"]')) {
            downloadData();
        }
    });
    
    // Load data
    document.addEventListener('click', function(e) {
        if (e.target.closest('[onclick*="loadData"]')) {
            loadData();
        }
    });
    
    // Apply theme
    document.addEventListener('click', function(e) {
        if (e.target.closest('[onclick*="applyTheme"]')) {
            applyTheme();
        }
    });
    
    // Reset theme
    document.addEventListener('click', function(e) {
        if (e.target.closest('[onclick*="resetTheme"]')) {
            resetTheme();
        }
    });
    
    // Add story
    document.addEventListener('click', function(e) {
        if (e.target.closest('[onclick*="addStory"]')) {
            addStory();
        }
    });
    
    // Add gallery image
    document.addEventListener('click', function(e) {
        if (e.target.closest('[onclick*="addGalleryImage"]')) {
            addGalleryImage();
        }
    });
    
    // Add wish suggestion
    document.addEventListener('click', function(e) {
        if (e.target.closest('[onclick*="addWishSuggestion"]')) {
            addWishSuggestion();
        }
    });
}

// Initialize form elements
function initializeFormElements() {
    // Initialize file input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }
}

// Initialize image uploads
function initializeImageUploads() {
    // Create hidden file inputs for image uploads
    createHiddenFileInput('coupleImageInput', 'image/*');
    createHiddenFileInput('qrImageInput', 'image/*');
    createHiddenFileInput('multipleImageInput', 'image/*', true);
}

// Create hidden file input
function createHiddenFileInput(id, accept, multiple = false) {
    const input = document.createElement('input');
    input.type = 'file';
    input.id = id;
    input.accept = accept;
    input.multiple = multiple;
    input.style.display = 'none';
    document.body.appendChild(input);
}

// Initialize color pickers
function initializeColorPickers() {
    // Color presets
    const colorPresets = document.querySelectorAll('.color-preset');
    colorPresets.forEach(preset => {
        preset.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            applyColorPreset(theme);
        });
    });
}

// Initialize range sliders
function initializeRangeSliders() {
    const rangeSliders = document.querySelectorAll('.form-range');
    rangeSliders.forEach(slider => {
        // Update label on load
        const label = slider.parentElement.querySelector('small');
        if (label) {
            label.textContent = slider.value + 'px';
        }
    });
}

// Show loading overlay
function showLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

// Hide loading overlay
function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Show alert
function showAlert(message, type = 'info') {
    // Map types to SweetAlert2 icons
    const iconMap = {
        'success': 'success',
        'error': 'error',
        'warning': 'warning',
        'info': 'info'
    };
    
    const icon = iconMap[type] || 'info';
    
    Swal.fire({
        title: type === 'error' ? 'Lỗi!' : type === 'success' ? 'Thành công!' : type === 'warning' ? 'Cảnh báo!' : 'Thông báo',
        text: message,
        icon: icon,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: type === 'error' ? 4000 : 3000,
        timerProgressBar: true
    });
}

// Get alert icon
function getAlertIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-triangle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Initialize banner management
function initializeBannerManagement() {
    console.log('🚀 initializeBannerManagement called');
    console.log('📊 isDataLoaded:', isDataLoaded);
    console.log('📊 siteData:', siteData);
    console.log('📊 window.bannerSlides:', window.bannerSlides);
    
    // Wait for site data to be loaded
    const checkDataLoaded = setInterval(() => {
        console.log('⏰ Checking data loaded...', isDataLoaded);
        if (isDataLoaded && typeof initBannerManagement === 'function') {
            console.log('✅ Data loaded, calling initBannerManagement');
            initBannerManagement();
            clearInterval(checkDataLoaded);
        }
    }, 100);
    
    // Setup banner form event listeners
    setupBannerFormListeners();
}

// Setup banner form event listeners
function setupBannerFormListeners() {
    // Listen for changes in hero form fields
    const heroFields = ['groomName', 'brideName', 'weddingDate', 'weddingTime', 'weddingLocation', 'mainTitle', 'description', 'primaryColor'];
    
    heroFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', () => {
                refreshBannerPreview();
                updateSiteDataFromForm();
            });
        }
    });
}

// Update site data from form fields
function updateSiteDataFromForm() {
    if (!siteData.hero) siteData.hero = {};
    
    // Update hero data from form fields
    siteData.hero.groomName = document.getElementById('groomName')?.value || '';
    siteData.hero.brideName = document.getElementById('brideName')?.value || '';
    siteData.hero.weddingDate = document.getElementById('weddingDate')?.value || '';
    siteData.hero.weddingTime = document.getElementById('weddingTime')?.value || '';
    siteData.hero.weddingLocation = document.getElementById('weddingLocation')?.value || '';
    
    // Update meta data
    if (!siteData.meta) siteData.meta = {};
    siteData.meta.title = document.getElementById('mainTitle')?.value || '';
    siteData.meta.description = document.getElementById('description')?.value || '';
    siteData.meta.primaryColor = document.getElementById('primaryColor')?.value || '#9f5958';
    
    // Update banner slides
    console.log('updateSiteDataFromForm - bannerSlides:', bannerSlides);
    console.log('updateSiteDataFromForm - window.bannerSlides:', window.bannerSlides);
    if (window.bannerSlides && Array.isArray(window.bannerSlides)) {
        siteData.hero.slides = window.bannerSlides;
        console.log('Updated siteData.hero.slides from window.bannerSlides:', siteData.hero.slides);
    } else if (bannerSlides && Array.isArray(bannerSlides)) {
        siteData.hero.slides = bannerSlides;
        console.log('Updated siteData.hero.slides from bannerSlides:', siteData.hero.slides);
    } else {
        console.log('No valid bannerSlides found');
    }
}

// Save changes to server
async function saveChanges() {
    try {
        // Ensure siteData is initialized
        if (!siteData || Object.keys(siteData).length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Cảnh báo',
                text: 'Dữ liệu chưa được tải. Vui lòng đợi hoặc refresh trang.',
                confirmButtonText: 'OK'
            });
            return;
        }
        
        // Update siteData from form
        console.log('Before updateSiteDataFromForm - bannerSlides:', bannerSlides);
        console.log('Before updateSiteDataFromForm - siteData:', siteData);
        updateSiteDataFromForm();
        console.log('After updateSiteDataFromForm - siteData:', siteData);
        
        // Save to server
        const response = await fetch('window.location.origin/api/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(siteData)
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                // Save to localStorage as backup
                localStorage.setItem('weddingData', JSON.stringify(siteData));
                
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công',
                    text: 'Đã lưu thay đổi thành công!',
                    confirmButtonText: 'OK'
                });
            } else {
                throw new Error(result.message || 'Lỗi khi lưu dữ liệu');
            }
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error saving changes:', error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Lỗi lưu dữ liệu: ' + error.message,
            confirmButtonText: 'OK'
        });
    }
}

// Load data functions for each tab
function loadOverviewData() {
    updateOverviewStats();
}

// loadHeroData function moved to hero.html

function loadCoupleData() {
    console.log('🔄 Loading couple data...');
    if (siteData.couple) {
        setFieldValue('groomNameDetail', siteData.couple.groomName);
        setFieldValue('brideNameDetail', siteData.couple.brideName);
        setFieldValue('groomDescription', siteData.couple.groomDescription);
        setFieldValue('brideDescription', siteData.couple.brideDescription);
    }
}

function loadGalleryData() {
    console.log('🔄 Loading gallery data...');
    // Gallery data loading is handled in admin-functions.js
}

function loadPaymentData() {
    console.log('🔄 Loading payment data...');
    if (siteData.payment) {
        setFieldValue('bankName', siteData.payment.bankName);
        setFieldValue('accountNumber', siteData.payment.accountNumber);
        setFieldValue('accountHolder', siteData.payment.accountHolder);
        setFieldValue('paymentMessage', siteData.payment.message);
    }
}

function loadEventData() {
    console.log('🔄 Loading event data...');
    if (siteData.event) {
        setFieldValue('ceremonyDate', siteData.event.ceremonyDate);
        setFieldValue('ceremonyTime', siteData.event.ceremonyTime);
        setFieldValue('ceremonyVenue', siteData.event.ceremonyVenue);
        setFieldValue('ceremonyAddress', siteData.event.ceremonyAddress);
        setFieldValue('receptionDate', siteData.event.weddingDate);
        setFieldValue('receptionTime', siteData.event.receptionTime);
        setFieldValue('receptionVenue', siteData.event.receptionVenue);
        setFieldValue('receptionAddress', siteData.event.receptionAddress);
        setFieldValue('googleMapsLink', siteData.event.googleMapsLink);
    }
}

function loadWishesData() {
    console.log('🔄 Loading wishes data...');
    if (siteData.wishes) {
        setFieldValue('wishesMessage', siteData.wishes.customMessage);
    }
}

function loadThemeData() {
    console.log('🔄 Loading theme data...');
    if (siteData.theme) {
        setFieldValue('themePrimaryColor', siteData.theme.primaryColor);
        setFieldValue('themeSecondaryColor', siteData.theme.secondaryColor);
        setFieldValue('themeTextColor', siteData.theme.textColor);
        setFieldValue('themeBackgroundColor', siteData.theme.backgroundColor);
        setFieldValue('themeBorderColor', siteData.theme.borderColor);
        setFieldValue('themeAccentColor', siteData.theme.accentColor);
        setFieldValue('themePrimaryFont', siteData.theme.primaryFont);
        setFieldValue('themeHeadingFont', siteData.theme.headingFont);
        setFieldValue('themeBaseFontSize', siteData.theme.baseFontSize);
        setFieldValue('themeHeadingFontSize', siteData.theme.headingFontSize);
    }
}

function loadLayoutData() {
    console.log('🔄 Loading layout data...');
    if (siteData.layout) {
        setFieldValue('headerStyle', siteData.layout.headerStyle);
        setFieldValue('navStyle', siteData.layout.navStyle);
        setFieldValue('footerStyle', siteData.layout.footerStyle);
        setFieldValue('contentLayout', siteData.layout.contentLayout);
        setFieldValue('sectionSpacing', siteData.layout.sectionSpacing);
        setFieldValue('borderRadius', siteData.layout.borderRadius);
        setFieldValue('boxShadow', siteData.layout.boxShadow);
        setFieldValue('animationStyle', siteData.layout.animationStyle);
        setFieldValue('mobileOptimized', siteData.layout.mobileOptimized);
        setFieldValue('touchFriendly', siteData.layout.touchFriendly);
        setFieldValue('fastLoading', siteData.layout.fastLoading);
        setFieldValue('seoOptimized', siteData.layout.seoOptimized);
    }
}

function loadSettingsData() {
    console.log('🔄 Loading settings data...');
    if (siteData.visibility?.sections) {
        setFieldValue('showGallery', siteData.visibility.sections.gallery);
        setFieldValue('showStory', siteData.visibility.sections.story);
        setFieldValue('showCouple', siteData.visibility.sections.couple);
        setFieldValue('showRSVP', siteData.visibility.sections.rsvp);
        setFieldValue('showDonate', siteData.visibility.sections.donate);
        setFieldValue('showAudio', siteData.visibility.sections.audio);
    }
}

// Export functions for global access
window.saveChanges = saveChanges;
// window.previewWebsite = previewWebsite; // Function not defined yet
window.downloadData = downloadData;
window.loadData = loadData;
window.applyTheme = applyTheme;
window.resetTheme = resetTheme;
window.addStory = addStory;
window.addGalleryImage = addGalleryImage;
window.addWishSuggestion = addWishSuggestion;
window.uploadCoupleImage = uploadCoupleImage;
window.uploadQRCode = uploadQRCode;
window.uploadGroomQR = uploadGroomQR;
window.uploadBrideQR = uploadBrideQR;
window.uploadMultipleImages = uploadMultipleImages;
window.handleFileUpload = handleFileUpload;
window.applyColorPreset = applyColorPreset;
window.updateWishSuggestion = updateWishSuggestion;
window.removeWishSuggestion = removeWishSuggestion;
window.scrollToTop = scrollToTop;

// Export banner management functions
window.addBannerSlide = addBannerSlide;
window.uploadBannerImage = uploadBannerImage;
window.uploadSlideImage = uploadSlideImage;
window.handleBannerFileSelect = handleBannerFileSelect;
window.handleBannerDragOver = handleBannerDragOver;
window.handleBannerDragLeave = handleBannerDragLeave;
window.handleBannerDrop = handleBannerDrop;
window.editBannerSlide = editBannerSlide;
window.setPrimaryBanner = setPrimaryBanner;
window.removeBannerSlide = removeBannerSlide;
window.moveBannerSlide = moveBannerSlide;
window.reorderBannerSlide = reorderBannerSlide;
window.refreshBannerPreview = refreshBannerPreview;
window.initBannerManagement = initBannerManagement;
window.reloadBannerData = reloadBannerData;
window.clearBannerSlides = clearBannerSlides;
