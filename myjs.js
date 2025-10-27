
// document.getElementById('SendMessage').addEventListener('click', function () {
	// alert('test ok');
    // // Lấy giá trị từ các ô dữ liệu
    // const senderName = document.getElementById('senderName').value;
    // //const from = document.getElementById('from').value;
    // const content = document.getElementById('message').value;
	
	// // Lấy phần tử select
	// const selectElement = document.getElementById("from");

	// // Lấy text của option được chọn
	// const selectedText = selectElement.options[selectElement.selectedIndex].textContent;
	
    // // Tạo đối tượng dữ liệu JSON
    // const data = {
        // SenderName: senderName,
        // From: selectedText,
        // Content: content
    // };

    // // Hiển thị loading spinner
    // document.getElementById('loading').style.display = 'block';

    // fetch('https://hungpnh.dev/api/v1/telegram/sendMessage', {
	// //fetch('http://localhost:5000/api/v1/telegram/sendMessage', {
        // method: 'POST',
        // headers: {
            // 'Content-Type': 'application/json', // Đặt Content-Type là application/json
        // },
        // body: JSON.stringify(data) // Chuyển đổi đối tượng data thành chuỗi JSON
    // })
    // .then(response => {
        // // Ẩn loading spinner
        // document.getElementById('loading').style.display = 'none';
        
        // return response.json(); // Chuyển đổi phản hồi thành JSON
    // })
    // .then(data => {
        // // Kiểm tra mã trạng thái code trong phản hồi
        // if (data.code === 200) {
            // // Nếu code là 200, hiển thị thông báo thành công
            // Swal.fire({
                // icon: 'success',
                // title: 'Thành công!',
                // text: data.message // Hiển thị message từ phản hồi
            // });
        // } else {
            // // Nếu code không phải 200, hiển thị thông báo thất bại
            // Swal.fire({
                // icon: 'error',
                // title: 'Thất bại!',
                // text: data.message // Hiển thị message từ phản hồi
            // });
        // }
    // })
    // .catch(error => {
        // // Ẩn loading spinner khi có lỗi
        // document.getElementById('loading').style.display = 'none';
        
        // // Hiển thị thông báo lỗi hệ thống
        // Swal.fire({
            // icon: 'error',
            // title: 'Lỗi!',
            // text: `Đã xảy ra lỗi: ${error.message}. Vui lòng thử lại sau.`
        // });
    // });
// });



// document.addEventListener('gesturestart', function (e) {
    // e.preventDefault();
// });


// document.addEventListener("touchmove", function (event) {
    // if (event.touches.length > 1) {
        // event.preventDefault();
    // }
// }, { passive: false });


let isPlaying = false; // Biến trạng thái âm thanh

function playPause() {
	let volumeOffIcon = document.getElementById("playerVolumeOff");
	let volumeOnIcon = document.getElementById("playerVolumeOn");

	if (isPlaying) {
		volumeOffIcon.style.display = "block";
		volumeOnIcon.style.display = "none";
	} else {
		volumeOffIcon.style.display = "none";
		volumeOnIcon.style.display = "block";
	}

	isPlaying = !isPlaying; // Đảo trạng thái
}