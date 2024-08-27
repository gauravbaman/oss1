const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// MEGA credentials from environment variables
const MEGA_EMAIL = process.env.MEGA_EMAIL;
const MEGA_PASSWORD = process.env.MEGA_PASSWORD;

async function uploadToMega(filePath) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));

  try {
    const response = await axios.post('https://api.mega.nz/upload', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${process.env.MEGA_ACCESS_TOKEN}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Upload failed');
  }
}

exports.handler = async function (event) {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: 'Method Not Allowed',
      };
    }

    const contentType = event.headers['content-type'] || event.headers['Content-Type'];
    if (!contentType || !contentType.startsWith('multipart/form-data')) {
      return {
        statusCode: 400,
        body: 'Unsupported content type',
      };
    }

    const body = Buffer.from(event.body, 'base64');
    const boundary = contentType.split('boundary=')[1];
    if (!boundary) {
      return {
        statusCode: 400,
        body: 'Boundary not found',
      };
    }

    const parts = body.toString().split(`--${boundary}`);
    const filePart = parts.find(part => part.includes('Content-Disposition: form-data; name="file";'));

    if (!filePart) {
      return {
        statusCode: 400,
        body: 'File part not found',
      };
    }

    const fileDataStartIndex = filePart.indexOf('\r\n\r\n') + 4;
    const fileDataEndIndex = filePart.lastIndexOf('\r\n');
    const fileData = filePart.slice(fileDataStartIndex, fileDataEndIndex);

    const filePath = path.join('/tmp', 'uploaded-file.zip');
    fs.writeFileSync(filePath, fileData);

    const uploadResult = await uploadToMega(filePath);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'File uploaded successfully to MEGA!', uploadResult }),
    };
  } catch (error) {
    console.error('Error during file upload:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'File upload failed. Please try again.' }),
    };
  }
};

