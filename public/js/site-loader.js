/**
 * Site Loader - Load data from SQLite API
 * Thay thế cho việc load dữ liệu từ JSON file
 */

console.log('🚀 Site Loader Started');

let siteData = {};
let isDataLoaded = false;

// Load data from SQLite API
async function loadSiteData() {
    console.log('🔄 Loading site data from SQLite...');
    
    try {
        const response = await window.apiCall('/data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📦 SQLite API Result:', result);
        
        if (result.success && result.data) {
            siteData = result.data;
            isDataLoaded = true;
            
            console.log('✅ Site data loaded from SQLite:', siteData);
            
            // Update the page with loaded data
            updatePageWithData();
            
            // Trigger event for banner slides to update
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('siteDataUpdated'));
            }
            
            return;
        } else {
            throw new Error('SQLite API returned unsuccessful response');
        }
    } catch (error) {
        console.error('❌ Error loading site data from SQLite:', error);
        console.log('🔄 Falling back to embedded data...');
        
        // Fallback to embedded data if available
        if (typeof window.siteData !== 'undefined') {
            siteData = window.siteData;
            isDataLoaded = true;
            updatePageWithData();
        }
    }
}

// Update page elements with loaded data
function updatePageWithData() {
    console.log('🔄 Updating page with data...');
    
    if (!isDataLoaded) {
        console.log('❌ Data not loaded, skipping page update');
        return;
    }
    
    // Update hero section - prioritize hero data over couple data
    const groomName = siteData.hero?.groomName || siteData.couple?.groom?.name || 'Tên chú rể';
    const brideName = siteData.hero?.brideName || siteData.couple?.bride?.name || 'Tên cô dâu';
    
    console.log('🔍 Updating hero elements with:', { groomName, brideName });
    updateElement('groom-name', groomName);
    updateElement('bride-name', brideName);
    updateElement('welcome_male-name', groomName);
    updateElement('welcome_female-name', brideName);
    updateElement('invitation_male-name', groomName);
    updateElement('invitation_female-name', brideName);
    
    // Update couple descriptions with fallback to placeholder text
    const groomDescription = siteData.couple?.groom?.description || 'Mô tả về chú rể';
    const brideDescription = siteData.couple?.bride?.description || 'Mô tả về cô dâu';
    
    updateElement('groom-description', groomDescription);
    updateElement('bride-description', brideDescription);
    
    // Update couple images with fallback to placeholder images
    const groomImage = siteData.couple?.groomImage || '/public/images/placeholder-groom.svg';
    const brideImage = siteData.couple?.brideImage || '/public/images/placeholder-bride.svg';
    
    updateElementImage('groom-image', groomImage);
    updateElementImage('bride-image', brideImage);
    
    // Update wedding date
    if (siteData.hero && siteData.hero.weddingDate) {
        const date = new Date(siteData.hero.weddingDate);
        const formattedDate = `${date.getDate().toString().padStart(2, '0')} tháng ${(date.getMonth() + 1).toString().padStart(2, '0')} năm ${date.getFullYear()}`;
        updateElement('invitation_date', formattedDate);
        updateElement('preview-datepickerss', formattedDate);
    }
    
    if (siteData.hero) {
        updateElement('wedding-location', siteData.hero.weddingLocation);
        
        // Update banner slideshow
        if (siteData.hero.slides && siteData.hero.slides.length > 0) {
            updateBannerSlideshow(siteData.hero.slides);
        }
    }
    
    // Update meta information
    if (siteData.meta) {
        updateElement('site-title', siteData.meta.title);
        updateElement('site-description', siteData.meta.description);
        
        // Update page title
        if (siteData.meta.title) {
            document.title = siteData.meta.title;
        }
    }
    
    // Update couple information - handle both old and new data structure
    if (siteData.couple) {
        // Handle both old structure (groomName, brideName) and new structure (groom.name, bride.name)
        const groomName = siteData.couple.groom?.name || siteData.couple.groomName || '';
        const brideName = siteData.couple.bride?.name || siteData.couple.brideName || '';
        const groomDescription = siteData.couple.groom?.description || siteData.couple.groomDescription || '';
        const brideDescription = siteData.couple.bride?.description || siteData.couple.brideDescription || '';
        
        // Update couple names and descriptions using correct IDs
        updateElement('groom-name', groomName || 'Tên chú rể');
        updateElement('bride-name', brideName || 'Tên cô dâu');
        updateElement('groom-description', groomDescription || 'Mô tả về chú rể');
        updateElement('bride-description', brideDescription || 'Mô tả về cô dâu');
        
        // Update signature names
        updateElement('groom-signature-name', groomName || 'Tên chú rể');
        updateElement('bride-signature-name', brideName || 'Tên cô dâu');
        
        // Update parent information
        if (siteData.couple.parents) {
            const groomFather = siteData.couple.parents.groom?.father || '';
            const groomMother = siteData.couple.parents.groom?.mother || '';
            const brideFather = siteData.couple.parents.bride?.father || '';
            const brideMother = siteData.couple.parents.bride?.mother || '';
            
            updateElement('thanks_couple-info_groom-info_father-name', groomFather);
            updateElement('thanks_couple-info_groom-info_mother-name', groomMother);
            updateElement('thanks_couple-info_bride-info_father-name', brideFather);
            updateElement('thanks_couple-info_bride-info_mother-name', brideMother);
        }
        
        // Update couple images - handle both old structure (img1, img2) and new structure (groomImage, brideImage)
        updateCoupleImages();
    }
    
    // Update event information
    if (siteData.event) {
        updateElement('ceremony-date', siteData.event.ceremonyDate);
        updateElement('ceremony-time', siteData.event.ceremonyTime);
        updateElement('ceremony-venue', siteData.event.ceremonyVenue);
        updateElement('ceremony-address', siteData.event.ceremonyAddress);
        updateElement('reception-date', siteData.event.weddingDate);
        updateElement('reception-time', siteData.event.receptionTime);
        updateElement('reception-venue', siteData.event.receptionVenue);
        updateElement('reception-address', siteData.event.receptionAddress);
    }
    
    // Update payment information
    if (siteData.payment) {
        updateElement('bank-name', siteData.payment.bankName);
        updateElement('account-number', siteData.payment.accountNumber);
        updateElement('account-holder', siteData.payment.accountHolder);
        updateElement('payment-message', siteData.payment.message);
    }
    
    // Update stories
    if (siteData.story && Array.isArray(siteData.story)) {
        if (typeof updateStoriesSection === 'function') {
            updateStoriesSection(siteData.story);
        } else {
            console.log('⚠️ updateStoriesSection function not found, skipping stories update');
        }
    }
    
    console.log('✅ Page updated with data');
}

// Update couple images
function updateCoupleImages() {
    console.log('🔄 Updating couple images...');
    
    if (!siteData.couple) {
        console.log('❌ No couple data found');
        return;
    }
    
    // Handle groom image - both old structure (img1) and new structure (groomImage)
    const groomImagePath = siteData.couple.groomImage || siteData.couple.img1?.src || '';
    if (groomImagePath) {
        console.log('👰 Updating groom image:', groomImagePath);
        const groomImg = document.getElementById('couple_img_1');
        if (groomImg) {
            groomImg.src = groomImagePath;
            groomImg.style.display = 'block';
            console.log('✅ Groom image updated');
        } else {
            console.log('❌ Groom image element not found');
        }
    }
    
    // Handle bride image - both old structure (img2) and new structure (brideImage)
    const brideImagePath = siteData.couple.brideImage || siteData.couple.img2?.src || '';
    if (brideImagePath) {
        console.log('👰 Updating bride image:', brideImagePath);
        const brideImg = document.getElementById('couple_img_2');
        if (brideImg) {
            brideImg.src = brideImagePath;
            brideImg.style.display = 'block';
            console.log('✅ Bride image updated');
        } else {
            console.log('❌ Bride image element not found');
        }
    }
}


// Helper function to update element content
function updateElement(selector, value) {
    if (!value) return;
    
    console.log(`🔍 Looking for element: ${selector}, value: ${value}`);
    const element = document.querySelector(`[data-field="${selector}"], #${selector}, .${selector}`);
    if (element) {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.value = value;
        } else {
            element.textContent = value;
        }
        console.log(`✅ Updated ${selector}: ${value}`);
    } else {
        console.log(`❌ Element not found: ${selector}`);
        // Try to find by exact ID
        const elementById = document.getElementById(selector);
        if (elementById) {
            elementById.textContent = value;
            console.log(`✅ Updated by ID ${selector}: ${value}`);
        } else {
            console.log(`❌ Element by ID not found: ${selector}`);
        }
    }
}

// Helper function to update element image
function updateElementImage(selector, imageSrc) {
    if (!imageSrc) return;
    
    const element = document.querySelector(`[data-field="${selector}"], #${selector}, .${selector}`);
    if (element) {
        element.src = imageSrc;
        element.alt = selector.replace('-', ' ');
        console.log(`✅ Updated ${selector} image: ${imageSrc}`);
    } else {
        console.log(`❌ Element not found: ${selector}`);
    }
}

// Update banner slideshow with dynamic slides
function updateBannerSlideshow(slides) {
    console.log('🔄 Updating banner slideshow with slides:', slides);
    
    const slidesContainer = document.querySelector('.ht-slides');
    if (!slidesContainer) {
        console.log('❌ Slides container not found');
        return;
    }
    
    // Clear existing slides
    slidesContainer.innerHTML = '';
    
    // Add new slides from database
    slides.forEach((slide, index) => {
        if (slide.visible && slide.src) {
            const slideElement = document.createElement('div');
            slideElement.className = `ht-slide ht-slide-${index}`;
            slideElement.style.backgroundImage = `url('${slide.src}')`;
            
            // Make first slide active
            if (index === 0) {
                slideElement.classList.add('active');
            }
            
            slidesContainer.appendChild(slideElement);
            console.log(`✅ Added slide ${index}: ${slide.src}`);
        }
    });
    
    // Update slideshow script variables
    updateSlideshowScript(slides.length);
    
    console.log(`✅ Banner slideshow updated with ${slides.length} slides`);
}

// Update slideshow script variables
function updateSlideshowScript(slideCount) {
    console.log('🔄 Updating slideshow script variables...');
    
    // Update the slideshow script to work with new slide count
    const slideshowScript = document.querySelector('script[data-slideshow]');
    if (slideshowScript) {
        // Remove old script
        slideshowScript.remove();
    }
    
    // Wait a bit for DOM to be ready, then create new script
    setTimeout(() => {
        const newScript = document.createElement('script');
        newScript.setAttribute('data-slideshow', 'true');
        newScript.textContent = `
            (function() {
                let slides = document.querySelectorAll('.ht-slide');
                let currentSlide = 0;
                const totalSlides = ${slideCount};
            
                function showSlide(index) {
                    slides.forEach((slide, i) => {
                        if (i === index) {
                            slide.classList.add('active');
                        } else {
                            slide.classList.remove('active');
                        }
                    });
                }
            
                function nextSlide() {
                    currentSlide = (currentSlide + 1) % totalSlides;
                    showSlide(currentSlide);
                }
            
                // Auto-advance slides every 5 seconds
                setInterval(nextSlide, 5000);
                
                // Initialize first slide
                showSlide(0);
                
                console.log('✅ Slideshow initialized with', totalSlides, 'slides');
            })();
        `;
        
        document.head.appendChild(newScript);
        console.log('✅ Slideshow script updated');
    }, 100);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Content Loaded, starting site loader...');
    loadSiteData();
});

// Also try to load when window loads
window.addEventListener('load', function() {
    console.log('🚀 Window loaded, ensuring data is loaded...');
    if (!isDataLoaded) {
        loadSiteData();
    }
});

// Make functions globally available
window.loadSiteData = loadSiteData;
window.updatePageWithData = updatePageWithData;
// Normalize image path to ensure it's a full URL
function normalizeImagePath(src) {
    if (!src) return '';
    
    console.log('🖼️ Normalizing image path:', src);
    
    // If already a full URL, return as is
    if (src.startsWith('http://') || src.startsWith('https://')) {
        console.log('🖼️ Already full URL:', src);
        return src;
    }
    
    // If starts with /public/, make it a full URL
    if (src.startsWith('/public/')) {
        const fullUrl = `http://localhost:5001${src}`;
        console.log('🖼️ Converted to full URL:', fullUrl);
        return fullUrl;
    }
    
    // If relative path, add /public/ prefix
    if (src.startsWith('./') || !src.startsWith('/')) {
        const fullUrl = `http://localhost:5001/public/images/story/${src}`;
        console.log('🖼️ Added prefix:', fullUrl);
        return fullUrl;
    }
    
    console.log('🖼️ No change needed:', src);
    return src;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM Content Loaded starting site loader');
    // Add delay to ensure all sections are loaded
    setTimeout(() => {
        loadSiteData();
    }, 1000);
});

// Also try to load immediately if DOM is already ready
if (document.readyState === 'loading') {
    console.log('📄 Document still loading, waiting for DOMContentLoaded...');
} else {
    console.log('📄 Document already ready, loading site data immediately...');
    setTimeout(() => {
        loadSiteData();
    }, 1000);
}

// Export for manual calling
window.loadSiteData = loadSiteData;

// window.updateStoriesSection = updateStoriesSection; // MOVED TO story.html
window.siteData = siteData;
