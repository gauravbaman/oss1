const multiparty = require('multiparty');
const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    const form = new multiparty.Form();
    const data = await new Promise((resolve, reject) => {
        form.parse(event, function(err, fields, files) {
            if (err) reject(err);
            resolve({ fields, files });
        });
    });

    // Save file to /tmp directory (limited in size, suitable for small files)
    const file = data.files.file[0];
    const tempPath = path.join('/tmp', file.originalFilename);
    fs.renameSync(file.path, tempPath);

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'File uploaded successfully!' }),
    };
};

