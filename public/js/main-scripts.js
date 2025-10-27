// Main JavaScript for Wedding Website

// Global variables
var photoGalleries = [];
let galleryItemNumber = 0;
let cropArea = null; // Biến toàn cục cho Croppie

// Document ready function
$(document).ready(function() {
    // Initialize loading overlay
    $('.btn-blessing').click(function () {
        $('#loading-overlay').show();
        // Giả lập delay 2 giây để kiểm tra loading
        setTimeout(function () {
            $('#loading-overlay').hide();
        }, 2000);
    });

    // Initialize header functionality
    initializeHeader();
    
    // Initialize hero slideshow
    initializeHeroSlideshow();
    
    // Initialize gallery
    initializeGallery();
    
    // Initialize RSVP form
    initializeRSVP();
    
    // Initialize couple data loading
    initializeCoupleData();
    
    // Initialize other components
    initializeComponents();
});

// Google Analytics
window.dataLayer = window.dataLayer || [];

function gtag() {
    dataLayer.push(arguments);
}
gtag('js', new Date());
gtag('config', 'G-8YPZ7RCX4G');

// Touch event handling
document.addEventListener("touchstart", function(event) {
    if (event.touches.length > 1) {
        event.preventDefault();
    }
}, { passive: false });

// Header functionality
function initializeHeader() {
    // Header scroll effect
    $(window).scroll(function() {
        if ($(this).scrollTop() > 100) {
            $('.header').addClass('scrolled');
        } else {
            $('.header').removeClass('scrolled');
        }
    });
}

// Hero slideshow functionality - OVERRIDE EXISTING FUNCTION
window.initializeHeroSlideshow = function() {
    console.log('🎬 Initializing Hero Slideshow (OVERRIDE)');
    const slides = document.querySelectorAll('.ht-slide');
    let currentSlide = 0;
    
    console.log(`📸 Found ${slides.length} slides`);
    
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
        console.log(`🔄 Slide changed to: ${currentSlide + 1}/${slides.length}`);
    }
    
    // Initialize first slide
    if (slides.length > 0) {
        showSlide(0);
        
        // Auto-advance slides every 5 seconds
        setInterval(nextSlide, 5000);
    } else {
        console.log('❌ No slides found');
    }
};

// Gallery functionality
function initializeGallery() {
    // Gallery popup functionality
    window.onclick = function(event) {
        const popup = document.getElementById('gallery-popup');
        if (event.target === popup) {
            popup.style.display = 'none';
        }
    }
    
    // Gallery item click handlers
    $('.gallery-item').on('click', function() {
        const imgSrc = $(this).find('img').attr('src');
        const popup = document.getElementById('gallery-popup');
        const popupImg = popup.querySelector('img');
        
        popupImg.src = imgSrc;
        popup.style.display = 'flex';
    });
    
    // Close popup
    $('.popup-close').on('click', function() {
        $('#gallery-popup').hide();
    });
}

// RSVP functionality
function initializeRSVP() {
    // RSVP form submission
    $('#rsvp-form').on('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        
        // Show loading
        $('#loading-overlay').show();
        
        // Simulate form submission
        setTimeout(function() {
            $('#loading-overlay').hide();
            Swal.fire({
                title: 'Cảm ơn bạn!',
                text: 'Chúng tôi đã nhận được lời chúc của bạn.',
                icon: 'success',
                confirmButtonText: 'OK'
            });
        }, 2000);
    });
    
    // Emoji picker functionality
    $('.emoji-picker').on('click', function() {
        // Toggle emoji picker
        $(this).next('.emoji-picker-panel').toggle();
    });
}

// Map functionality
$('.map-tutorial').off('click').on('click', function(e) {
    e.preventDefault();
    
    Swal.fire({
        title: 'Hướng dẫn',
        text: 'Nhấn vào bản đồ để xem vị trí chi tiết',
        icon: 'info',
        confirmButtonText: 'OK'
    });
});

// Event initialization
function reInitEvent() {
    // Re-initialize event handlers
    initializeGallery();
    initializeRSVP();
}

// Blessing functionality
function initEvent() {
    // Initialize blessing form
    $('.btn-blessing').off('click').on('click', function(e) {
        e.preventDefault();
        
        const slug = $('input[name="slug"][hidden]').val();
        if (!slug) {
            Swal.fire({
                title: 'Lỗi',
                text: 'Không tìm thấy thông tin trang',
                icon: 'error'
            });
            return;
        }
        
        // Show loading
        $('#loading-overlay').show();
        
        // Simulate API call
        setTimeout(function() {
            $('#loading-overlay').hide();
            Swal.fire({
                title: 'Cảm ơn!',
                text: 'Lời chúc của bạn đã được gửi thành công.',
                icon: 'success'
            });
        }, 2000);
    });
}

// Fetch blessing data
function fetchBlessingData() {
    // Fetch existing blessings
    // This would typically make an API call
    console.log('Fetching blessing data...');
}

// Croppie functionality
function initializeCroppie() {
    if (typeof Croppie !== 'undefined') {
        cropArea = new Croppie(document.getElementById('crop-area'), {
            viewport: { width: 200, height: 200, type: 'circle' },
            boundary: { width: 300, height: 300 }
        });
    }
}

// Image upload functionality
$('#image-upload-form, #datepickerss, .d-flex-3').on('click', function() {
    // Handle image upload
    console.log('Image upload clicked');
});

// Back to top functionality
$(window).scroll(function() {
    if ($(this).scrollTop() > 100) {
        $('.back-to-top').fadeIn();
    } else {
        $('.back-to-top').fadeOut();
    }
});

$('.back-to-top').click(function() {
    $('html, body').animate({scrollTop: 0}, 800);
    return false;
});

// Initialize components - OVERRIDE EXISTING FUNCTION
window.initializeComponents = function() {
    console.log('🔧 Initializing Components (OVERRIDE)');
    
    // Initialize all components
    if (typeof initEvent === 'function') {
        initEvent();
    }
    if (typeof fetchBlessingData === 'function') {
        fetchBlessingData();
    }
    
    // Initialize croppie if available
    if (document.getElementById('crop-area')) {
        if (typeof initializeCroppie === 'function') {
            initializeCroppie();
        }
    }
    
    // Re-initialize hero slideshow after sections are loaded
    setTimeout(function() {
        if (typeof window.initializeHeroSlideshow === 'function') {
            window.initializeHeroSlideshow();
        }
    }, 1000);
    
    console.log('✅ Components initialized');
};

// Wedding Site Loader
window.addEventListener('load', function() {
    // Initialize site loader
    if (typeof SiteLoader !== 'undefined') {
        SiteLoader.init();
    }
});

// Log to server function
function logToServer(message) {
    console.log('Server log:', message);
    // This would typically send logs to server
}

// Initialize invitation section
function initInvitationSection() {
    // Initialize invitation functionality
    console.log('Initializing invitation section...');
}

// Initialize gallery section
function initGallerySection() {
    // Initialize gallery functionality
    console.log('Initializing gallery section...');
}

// Edit all sections functionality
$('#edit-all-section').on('click', function(e) {
    e.preventDefault();
    
    // Toggle edit mode for all sections
    $('.editable-parent').toggleClass('edit-mode');
    
    if ($('.editable-parent').hasClass('edit-mode')) {
        $(this).text('Thoát chế độ chỉnh sửa');
    } else {
        $(this).text('Chỉnh sửa tất cả');
    }
});

// Slide show images
var slidehow_images = [
    './images/gallery/1737170673_gallery-04.webp',
    './images/gallery/1737170673_gallery-07.webp',
    './images/gallery/1737170673_gallery-09.webp',
    './images/gallery/1737170673_gallery-19.webp',
    './images/gallery/1737170673_gallery-01.webp',
    './images/gallery/1737170673_gallery-16.webp',
    './images/gallery/1737170673_gallery-20.webp',
    './images/gallery/1737170673_gallery-15.webp',
    './images/gallery/1737170673_gallery-10.webp',
    './images/gallery/1737170673_gallery-11.webp'
];

// Apply configuration function
function applyConfig(id) {
    // Apply configuration to element with given id
    const element = document.getElementById(id);
    if (element) {
        console.log('Applying config to:', id);
    }
}

// Initialize couple data loading from SQLite
function initializeCoupleData() {
    console.log('💑 Initializing couple data loading...');
    
    // Test elements first
    setTimeout(() => {
        testCoupleElements();
    }, 1000);
    
    // Load couple data from API
    loadCoupleData();
}

// Load couple data from SQLite API
async function loadCoupleData() {
    console.log('🔄 Loading couple data from SQLite...');
    
    try {
        const response = await fetch('/api/data/couple');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📦 Couple API Result:', result);
        
        if (result.success && result.data) {
            const coupleData = result.data;
            console.log('✅ Couple data loaded:', coupleData);
            
            // Update couple information on the page
            updateCoupleInformation(coupleData);
            
            return coupleData;
        } else {
            throw new Error('Couple API returned unsuccessful response');
        }
    } catch (error) {
        console.error('❌ Error loading couple data:', error);
        console.log('🔄 Falling back to default couple data...');
        
        // Fallback to default data
        loadDefaultCoupleData();
    }
}

// Test function to debug element finding
function testCoupleElements() {
    console.log('🔍 Testing couple elements...');
    
    const testIds = [
        'groom-name',
        'bride-name', 
        'thanks_couple-info_groom-draf_1',
        'thanks_couple-info_bride-draf_1',
        'thanks_couple-info_groom-info_invitation',
        'thanks_couple-info_bride-info_invitation',
        'couple_title_1',
        'thanks_couple-info_general-info_invitation',
        'thanks_couple-info_groom-info_father-name',
        'thanks_couple-info_groom-info_mother-name',
        'thanks_couple-info_bride-info_father-name',
        'thanks_couple-info_bride-info_mother-name',
        'couple_img_1',
        'couple_img_2'
    ];
    
    testIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`✅ Found: ${id}`);
        } else {
            console.log(`❌ Not found: ${id}`);
        }
    });
    
    // Also check for any elements with couple-related IDs
    const allElements = document.querySelectorAll('[id*="couple"], [id*="groom"], [id*="bride"], [id*="thanks"]');
    console.log('All couple-related elements:', Array.from(allElements).map(el => ({ id: el.id, tagName: el.tagName })));
}

// Update couple information on the page
function updateCoupleInformation(coupleData) {
    console.log('🔄 Updating couple information...');
    console.log('📦 Couple data structure:', coupleData);
    
    if (!coupleData) {
        console.log('❌ No couple data provided');
        return;
    }
    
    // Update groom information
    if (coupleData.groom) {
        updateCoupleElement('groom-name', coupleData.groom.name);
        updateCoupleElement('thanks_couple-info_groom-draf_1', 'The Groom');
        updateCoupleElement('thanks_couple-info_groom-info_invitation', coupleData.groom.description);
        
        // Update groom image
        if (coupleData.groomImage) {
            updateCoupleImage('couple_img_1', coupleData.groomImage);
        }
    }
    
    // Update bride information
    if (coupleData.bride) {
        updateCoupleElement('bride-name', coupleData.bride.name);
        updateCoupleElement('thanks_couple-info_bride-draf_1', 'The Bride');
        updateCoupleElement('thanks_couple-info_bride-info_invitation', coupleData.bride.description);
        
        // Update bride image
        if (coupleData.brideImage) {
            updateCoupleImage('couple_img_2', coupleData.brideImage);
        }
    }
    
    // Update parent information
    if (coupleData.parents) {
        // Groom parents
        if (coupleData.parents.groom) {
            updateCoupleElement('thanks_couple-info_groom-info_father-name', coupleData.parents.groom.father);
            updateCoupleElement('thanks_couple-info_groom-info_mother-name', coupleData.parents.groom.mother);
        }
        
        // Bride parents
        if (coupleData.parents.bride) {
            updateCoupleElement('thanks_couple-info_bride-info_father-name', coupleData.parents.bride.father);
            updateCoupleElement('thanks_couple-info_bride-info_mother-name', coupleData.parents.bride.mother);
        }
        
        // Parent titles
        updateCoupleElement('thanks_couple-info_groom-info_father-title', 'Con ông:');
        updateCoupleElement('thanks_couple-info_groom-info_mother-title', 'Con bà:');
        updateCoupleElement('thanks_couple-info_bride-info_father-title', 'Con ông:');
        updateCoupleElement('thanks_couple-info_bride-info_mother-title', 'Con bà:');
    }
    
    console.log('✅ Couple information updated successfully');
}

// Update individual couple element
function updateCoupleElement(elementId, value) {
    if (!value) return;
    
    // Try multiple selectors to find the element
    let element = document.getElementById(elementId);
    
    // If not found by ID, try by class or other selectors
    if (!element) {
        element = document.querySelector(`[id="${elementId}"]`);
    }
    
    if (!element) {
        element = document.querySelector(`.${elementId}`);
    }
    
    if (!element) {
        element = document.querySelector(`[data-field="${elementId}"]`);
    }
    
    if (element) {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.value = value;
        } else {
            element.textContent = value;
        }
        console.log(`✅ Updated couple element ${elementId}: ${value}`);
    } else {
        console.log(`❌ Couple element not found: ${elementId}`);
        // Debug: log all elements with similar IDs
        const allElements = document.querySelectorAll('[id*="couple"], [id*="groom"], [id*="bride"], [id*="thanks"]');
        console.log('Available elements:', Array.from(allElements).map(el => el.id));
    }
}

// Update couple image
function updateCoupleImage(imageId, imagePath) {
    if (!imagePath) return;
    
    const imageElement = document.getElementById(imageId);
    if (imageElement) {
        imageElement.src = imagePath;
        imageElement.style.display = 'block';
        console.log(`✅ Updated couple image ${imageId}: ${imagePath}`);
    } else {
        console.log(`❌ Couple image element not found: ${imageId}`);
    }
}

// Load default couple data (fallback)
function loadDefaultCoupleData() {
    console.log('🔄 Loading default couple data...');
    
    const defaultCoupleData = {
        groom: {
            name: 'Huy Hùng',
            description: 'Là một người hay cười nhưng lại sống nội tâm và hay khóc thầm, không thích đọc sách nhưng thích mua, thích đi du lịch và khám phá những vùng đất mới. Luôn cố gắng để trở thành người đàn ông tốt nhất cho người phụ nữ của mình.'
        },
        bride: {
            name: 'Ngọc Trâm',
            description: 'Là một người hay cười nhưng lại sống nội tâm và hay khóc thầm, không thích đọc sách nhưng thích mua, thích đi du lịch và khám phá những vùng đất mới. Luôn cố gắng để trở thành người phụ nữ tốt nhất cho người đàn ông của mình.'
        },
        groomImage: './index_files/tr6s9xNATb.webp',
        brideImage: './index_files/tBGvlcdeOw.webp',
        parents: {
            groom: {
                father: 'Phạm Ngọc Phương Anh',
                mother: 'Hà Thị Thanh Hà'
            },
            bride: {
                father: 'Cao Thọ Sơn',
                mother: 'Ngô Thị Thoa'
            }
        }
    };
    
    updateCoupleInformation(defaultCoupleData);
    console.log('✅ Default couple data loaded');
}

// Make couple functions globally available
window.loadCoupleData = loadCoupleData;
window.updateCoupleInformation = updateCoupleInformation;
window.initializeCoupleData = initializeCoupleData;
window.testCoupleElements = testCoupleElements;

