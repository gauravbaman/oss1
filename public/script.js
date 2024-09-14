const emailWhitelist = ['allowedemail1@example.com', 'allowedemail2@example.com']; // Add your invite-based email addresses here

document.getElementById('uploadForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const emailInput = document.getElementById('email').value.trim(); // Get the email value
    const responseElement = document.getElementById('response');
    const progressBarFill = document.getElementById('progress-bar-fill');

    // Check if the email is in the whitelist
    if (!emailWhitelist.includes(emailInput)) {
        responseElement.textContent = "Your email is not invited to use this service.";
        return;
    }

    if (file && emailInput) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const fileData = event.target.result.split(',')[1]; // Get base64 data

            // Rename the file with the email
            const fileExtension = file.name.split('.').pop(); // Get the file extension
            const newFileName = `${emailInput}.${fileExtension}`; // Create a new filename using the email

            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/.netlify/functions/upload-to-mega', true);
            xhr.setRequestHeader('Content-Type', 'application/json');

            // Update progress bar during upload
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    progressBarFill.style.width = `${percentComplete}%`;
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    responseElement.textContent = `Password cracked successfully! Please check your email.`;
                } else {
                    responseElement.textContent = `Error occurred. Please try again.`;
                }
            };

            xhr.onerror = () => {
                responseElement.textContent = `Upload failed. Please try again.`;
            };

            // Send the file data along with the new file name and email
            xhr.send(JSON.stringify({
                fileData,
                fileName: newFileName,
                email: emailInput,
            }));
        };

        reader.readAsDataURL(file);
    } else {
        responseElement.textContent = "Please provide both an email and a file.";
    }
});
