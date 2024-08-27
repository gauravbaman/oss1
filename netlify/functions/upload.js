const Buffer = require('buffer').Buffer;

exports.handler = async function(event, context) {
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

        // Optionally, save the file or perform other operations here
        const filePath = `/tmp/uploaded-file.zip`;
        require('fs').writeFileSync(filePath, fileData);

        return {
            statusCode:

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'File uploaded successfully!' }),
    };
};

