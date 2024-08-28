const { Storage } = require('megajs');

exports.handler = async (event, context) => {
    try {
        // Parse the uploaded file from the event (assuming it's sent as a base64 string)
        const { fileData, fileName } = JSON.parse(event.body);

        if (!fileData || !fileName) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'File data or file name is missing' }),
            };
        }

        // Connect to MEGA
        const storage = new Storage({
            email: '2021sp93045@wilp.bits-pilani.ac.in',  // Replace with your MEGA email
            password: '@#Gaurav3001',        // Replace with your MEGA password
        });

        await storage.ready;

        // Convert base64 file data to buffer and get its size
        const fileBuffer = Buffer.from(fileData, 'base64');
        const fileSize = fileBuffer.length;

        // Upload the file with specified size or enable buffering
        const uploadStream = storage.root.upload({
            name: fileName,
            size: fileSize,  // Specify the file size here
            allowUploadBuffering: true,  // Allow buffering
        });

        uploadStream.end(fileBuffer);

        const uploadedFile = await uploadStream.complete;

        // Get the shareable link for the uploaded file
        const link = await uploadedFile.link();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'File uploaded successfully', link }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
}
