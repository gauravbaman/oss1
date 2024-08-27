const fs = require('fs');
const path = require('path');
const mega = require('mega');
const { Buffer } = require('buffer');

exports.handler = async function (event, context) {
    try {
        if (event.httpMethod !== 'POST') {
            return {
                statusCode: 405,
                body: 'Method Not Allowed',
            };
        }

        const contentType = event.headers['content-type'] || event.headers['Content-Type'];

        if (!contentType.startsWith('multipart/form-data')) {
            return {
                statusCode: 400,
                body: 'Unsupported content type',
            };
        }

        // Decode the body
        const body = Buffer.from(event.body, 'base64');

        // Extract the boundary from the content type
        const boundary = contentType.split('boundary=')[1];

        if (!boundary) {
            return {
                statusCode: 400,
                body: 'Boundary not found',
            };
        }

        const parts = body.toString().split(`--${boundary}`);

        // Find the file part
        const filePart = parts.find(part => part.includes('Content-Disposition: form-data; name="file";'));

        if (!filePart) {
            return {
                statusCode: 400,
                body: 'File part not found',
            };
        }

        // Extract the file data
        const fileDataStartIndex = filePart.indexOf('\r\n\r\n') + 4;
        const fileDataEndIndex = filePart.lastIndexOf('\r\n');
        const fileData = filePart.slice(fileDataStartIndex, fileDataEndIndex);

        // Save the file to a temporary directory (in Netlify functions, use /tmp)
        const filePath = path.join('/tmp', 'uploaded-file.zip');
        fs.writeFileSync(filePath, fileData);

        // Set up MEGA credentials
        const megaClient = mega({
            email: process.env.MEGA_EMAIL,
            password: process.env.MEGA_PASSWORD
        });

        // Upload file to MEGA
        await new Promise((resolve, reject) => {
            megaClient.upload(filePath, 'MEGA folder path', (error, file) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(file);
                }
            });
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'File uploaded successfully to MEGA!' }),
        };
    } catch (error) {
        console.error('Error during file upload:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'File upload failed. Please try again.' }),
        };
    }
};

