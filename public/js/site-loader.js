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
        // Add cache busting timestamp to API call
        const cacheBuster = '?t=' + Date.now();
        const response = await window.apiCall('/data' + cacheBuster);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📦 SQLite API Result:', result);
        
        if (result.success && result.data) {
            siteData = result.data;
            window.siteData = siteData; // Make globally accessible
            isDataLoaded = true;
            
            console.log('✅ Site data loaded from SQLite:', siteData);
            console.log('📊 DEBUG - API Response data structure:');
            console.log('   hero:', siteData.hero);
            console.log('   hero.groomName:', siteData.hero?.groomName);
            console.log('   hero.brideName:', siteData.hero?.brideName);
            console.log('   couple:', siteData.couple);
            console.log('   couple.groom:', siteData.couple?.groom);
            console.log('   couple.bride:', siteData.couple?.bride);
            console.log('   visibility:', siteData.visibility);
            
            // Check welcome_male-name BEFORE updatePageWithData
            setTimeout(() => {
                const welcomeMaleEl = document.getElementById('welcome_male-name');
                console.log('🔍 DEBUG - BEFORE updatePageWithData():');
                console.log('   welcome_male-name element:', welcomeMaleEl);
                console.log('   welcome_male-name current value:', welcomeMaleEl ? welcomeMaleEl.textContent : 'NOT FOUND');
            }, 100);
            
            // Update biicore with backgrounds if available
            if (window.biicore && siteData.backgrounds) {
                if (!window.biicore.backgrounds) {
                    window.biicore.backgrounds = {};
                }
                window.biicore.backgrounds = { ...window.biicore.backgrounds, ...siteData.backgrounds };
                console.log('✅ Backgrounds added to biicore:', window.biicore.backgrounds);
            }
            
            // Update the page with loaded data
            updatePageWithData();
            
            // Apply visibility settings after sections are loaded (multiple attempts)
            const applyVisibilityWithRetry = (attempts = 0) => {
                if (attempts > 10) {
                    console.warn('⚠️ Could not apply visibility settings after 10 attempts');
                    return;
                }
                
                setTimeout(() => {
                    // Check if at least one section exists
                    const hasSections = document.querySelector('#gallery, #story, #couple, #rsvp, #donate');
                    
                    if (hasSections || attempts === 0) {
                        if (typeof applyVisibilitySettings === 'function') {
                            console.log(`👁️ Applying visibility settings (attempt ${attempts + 1})...`);
                            applyVisibilitySettings();
                        }
                    } else if (attempts < 10) {
                        applyVisibilityWithRetry(attempts + 1);
                    }
                }, attempts === 0 ? 300 : 500);
            };
            
            applyVisibilityWithRetry();
            
            // Trigger events for updates
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('siteDataUpdated'));
                window.dispatchEvent(new CustomEvent('siteDataLoaded', { detail: siteData }));
                
                // Also trigger biicoreLoaded if backgrounds were updated
                if (siteData.backgrounds) {
                    window.dispatchEvent(new CustomEvent('biicoreLoaded'));
                }
                
                // Trigger theme update if theme is available
                if (siteData.theme) {
                    window.dispatchEvent(new CustomEvent('themeLoaded'));
                }
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
    
    // Force update welcome_male-name and welcome_female-name directly (they might be in banner section)
    // Retry multiple times to ensure banner section is loaded
    const updateWelcomeNames = () => {
        const welcomeMaleEl = document.getElementById('welcome_male-name');
        const welcomeFemaleEl = document.getElementById('welcome_female-name');
        
        console.log('🔍 Retry update welcome names:');
        console.log('   welcome_male-name element:', welcomeMaleEl);
        console.log('   welcome_female-name element:', welcomeFemaleEl);
        console.log('   Expected groomName:', groomName);
        console.log('   Expected brideName:', brideName);
        
        if (welcomeMaleEl) {
            const currentValue = welcomeMaleEl.textContent.trim();
            console.log('   welcome_male-name current value:', currentValue);
            if (groomName && groomName !== 'Tên chú rể' && currentValue !== groomName) {
                welcomeMaleEl.textContent = groomName;
                console.log(`✅ Updated welcome_male-name: "${currentValue}" -> "${groomName}"`);
            } else if (currentValue === groomName) {
                console.log(`✅ welcome_male-name already correct: "${groomName}"`);
            }
        } else {
            console.log('   ⚠️ welcome_male-name element NOT FOUND');
        }
        
        if (welcomeFemaleEl) {
            const currentValue = welcomeFemaleEl.textContent.trim();
            console.log('   welcome_female-name current value:', currentValue);
            if (brideName && brideName !== 'Tên cô dâu' && currentValue !== brideName) {
                welcomeFemaleEl.textContent = brideName;
                console.log(`✅ Updated welcome_female-name: "${currentValue}" -> "${brideName}"`);
            } else if (currentValue === brideName) {
                console.log(`✅ welcome_female-name already correct: "${brideName}"`);
            }
        } else {
            console.log('   ⚠️ welcome_female-name element NOT FOUND');
        }
    };
    
    // Retry multiple times
    let retryCount = 0;
    const maxRetries = 10;
    const retryInterval = 500;
    
    function retryUpdateWelcomeNames() {
        updateWelcomeNames();
        retryCount++;
        if (retryCount < maxRetries) {
            setTimeout(retryUpdateWelcomeNames, retryInterval);
        } else {
            console.log('🔄 Finished retry attempts');
        }
    }
    
    // Start retry immediately and then at intervals
    updateWelcomeNames(); // First attempt immediately
    setTimeout(retryUpdateWelcomeNames, retryInterval); // Then retry at intervals
    
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
    
    // Update backgrounds - trigger background loaders
    if (siteData.backgrounds) {
        console.log('🖼️ Backgrounds data available:', siteData.backgrounds);
        
        // Trigger background loading functions if they exist
        if (typeof loadStoryBackground === 'function') {
            setTimeout(loadStoryBackground, 300);
        }
        if (typeof loadBigEventBackground === 'function') {
            setTimeout(loadBigEventBackground, 300);
        }
        if (typeof loadGiftRegistryBackground === 'function') {
            setTimeout(loadGiftRegistryBackground, 300);
        }
    }
    
    // Theme colors disabled - use default colors
    // applyThemeColors(); // Commented out
    
    // Apply visibility settings
    applyVisibilitySettings();
    
    console.log('✅ Page updated with data');
}

// Theme colors function disabled
// function applyThemeColors() {
//     // Disabled - use default colors
// }

// Apply visibility settings from admin panel
function applyVisibilitySettings() {
    console.log('👁️ Applying visibility settings...');
    
    if (!siteData || !siteData.visibility || !siteData.visibility.sections) {
        console.log('⚠️ No visibility settings found, showing all sections by default');
        return;
    }
    
    const visibility = siteData.visibility.sections;
    console.log('👁️ Visibility settings:', visibility);
    
    // Map admin settings to section IDs on index page
    const sectionMap = {
        gallery: '#gallery',
        story: '#story',
        couple: '#couple',
        rsvp: '#rsvp',
        donate: '#donate',
        // invitation is controlled by showRSVP
        audio: 'audio' // Special handling for audio
    };
    
    // Apply visibility for each section
    Object.keys(sectionMap).forEach(key => {
        const sectionId = sectionMap[key];
        const isVisible = visibility[key] !== false; // Default to true if not set
        
        if (key === 'audio') {
            // Handle audio player visibility
            const audioElements = document.querySelectorAll('audio');
            audioElements.forEach(audio => {
                if (isVisible) {
                    audio.style.display = 'block';
                } else {
                    audio.style.display = 'none';
                }
            });
            
            // Also hide/show audio control buttons if any
            const audioControls = document.querySelectorAll('.audio-control, .music-control, .bii-player');
            audioControls.forEach(control => {
                if (isVisible) {
                    control.style.display = 'block';
                } else {
                    control.style.display = 'none';
                }
            });
        } else {
            // Handle regular sections
            const section = document.querySelector(sectionId);
            if (section) {
                if (isVisible) {
                    section.style.display = '';
                    section.style.visibility = '';
                    section.classList.remove('hidden');
                    section.removeAttribute('hidden');
                } else {
                    section.style.display = 'none';
                    section.style.visibility = 'hidden';
                    section.classList.add('hidden');
                    section.setAttribute('hidden', 'true');
                }
                console.log(`👁️ Section ${sectionId}: ${isVisible ? 'SHOWN' : 'HIDDEN'}`);
            } else {
                console.log(`⚠️ Section ${sectionId} not found on page`);
            }
        }
    });
    
    // Handle invitation section (bigevent) - controlled by showRSVP
    const invitationSection = document.querySelector('#invitation');
    if (invitationSection) {
        const showInvitation = visibility.rsvp !== false;
        if (showInvitation) {
            invitationSection.style.display = '';
            invitationSection.style.visibility = '';
            invitationSection.classList.remove('hidden');
            invitationSection.removeAttribute('hidden');
        } else {
            invitationSection.style.display = 'none';
            invitationSection.style.visibility = 'hidden';
            invitationSection.classList.add('hidden');
            invitationSection.setAttribute('hidden', 'true');
        }
        console.log(`👁️ Section #invitation: ${showInvitation ? 'SHOWN' : 'HIDDEN'}`);
    }
    
    console.log('✅ Visibility settings applied');
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
    
    // Try getElementById first (most reliable for IDs)
    let element = document.getElementById(selector);
    
    // If not found by ID, try querySelector
    if (!element) {
        element = document.querySelector(`[data-field="${selector}"], #${selector}, .${selector}`);
    }
    
    if (element) {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.value = value;
        } else {
            element.textContent = value;
        }
        console.log(`✅ Updated ${selector}: ${value} (found by ${element === document.getElementById(selector) ? 'getElementById' : 'querySelector'})`);
    } else {
        console.log(`❌ Element not found: ${selector}`);
        // Debug: Try to find similar elements
        const allWithName = document.querySelectorAll('[id*="name"], [id*="Name"]');
        console.log(`   Similar elements found:`, Array.from(allWithName).map(el => ({
            id: el.id,
            tagName: el.tagName,
            text: el.textContent?.substring(0, 30)
        })));
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

// Listen for theme updates - disabled
window.addEventListener('siteDataLoaded', function() {
    // setTimeout(applyThemeColors, 200); // Disabled
    setTimeout(updatePageWithData, 500);
});

window.addEventListener('themeLoaded', function() {
    // setTimeout(applyThemeColors, 200); // Disabled
});

// Also update when window loads to catch any late-loading sections
window.addEventListener('load', function() {
    if (isDataLoaded && siteData) {
        setTimeout(updatePageWithData, 1000);
    }
});


// Make functions globally available
window.loadSiteData = loadSiteData;
window.updatePageWithData = updatePageWithData;
// window.applyThemeColors = applyThemeColors; // Disabled
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
        const fullUrl = `${window.location.origin}${src}`;
        console.log('🖼️ Converted to full URL:', fullUrl);
        return fullUrl;
    }
    
    // If relative path, add /public/ prefix
    if (src.startsWith('./') || !src.startsWith('/')) {
        const fullUrl = `${window.location.origin}/public/images/story/${src}`;
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
