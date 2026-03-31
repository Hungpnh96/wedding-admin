document.addEventListener('DOMContentLoaded', function () {
    const popupContent = document.getElementById('popupContent');
    const popupIcon = document.getElementById('popupIcon');

    // // Hiện popup khi hover vào icon
    // popupIcon.addEventListener('click', function () {
        // popupContent.style.display = popupContent.style.display === 'none' ? 'block' : 'none';
    // });
});

// Hàm mở Google Maps - fallback chỉ dùng khi giftregistry chưa gán hàm động
if (typeof openMap0 === 'undefined') {
    window.openMap0 = function() { window.open('https://maps.app.goo.gl/HGeyEjyBCQTnHsHW8', '_blank'); };
}
if (typeof openMap1 === 'undefined') {
    window.openMap1 = function() { window.open('https://maps.app.goo.gl/HGeyEjyBCQTnHsHW8', '_blank'); };
}
if (typeof openMap2 === 'undefined') {
    window.openMap2 = function() { window.open('https://maps.app.goo.gl/Z61KJw8RehUqcSaq8', '_blank'); };
}
if (typeof openMap3 === 'undefined') {
    window.openMap3 = function() { window.open('https://maps.app.goo.gl/ZTQpja9Br7zKVruBA', '_blank'); };
}

