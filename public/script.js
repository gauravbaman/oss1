function uploadFile() {
    const fileInput = document.getElementById('file');
    const emailInput = document.getElementById('email');
    const progressBarFill = document.getElementById('progress-bar-fill');

    const file = fileInput.files[0];
    const email = emailInput.value;

    if (!file || !email) {
        alert('Please provide an email and select a file.');
        return;
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('file', file);

    fetch('/.netlify/functions/upload', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert('File uploaded successfully!');
            progressBarFill.style.width = '0%';
            fileInput.value = '';
            emailInput.value = '';
        } else {
            alert('File upload failed. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('File upload failed. Please try again.');
    });
}

