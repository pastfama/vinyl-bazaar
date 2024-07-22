const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');
const fs = require('fs');
const progress = require('progress-stream');

const app = express();
const port = 5000;

// Replace with your actual Pinata API key and secret key
const apiKey = '7ffffb980a75a9fc9ef1';
const secretApiKey = 'De07b68064cea659ce632debb3c99a413ad9b4a06cf73e1545381b47f5acdeed';

app.use(cors());
app.use(express.json());

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.fields([{ name: 'mp3' }, { name: 'jpeg' }]), async (req, res) => {
    const files = req.files;

    try {
        const mp3File = files.mp3[0];
        const jpegFile = files.jpeg[0];

        // Log file sizes
        console.log('MP3 file size:', mp3File.size);
        console.log('JPEG file size:', jpegFile.size);

        console.log('Starting upload of MP3 file:', mp3File.originalname);
        const mp3Form = new FormData();
        const mp3Stream = fs.createReadStream(mp3File.path);
        const mp3Progress = progress();
        mp3Stream.pipe(mp3Progress);
        mp3Form.append('file', mp3Progress);

        mp3Progress.on('progress', (progress) => {
            console.log(`MP3 Upload Progress: ${progress.percentage.toFixed(2)}%`);
        });

        const mp3Result = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', mp3Form, {
            maxContentLength: 'Infinity',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${mp3Form._boundary}`,
                'pinata_api_key': apiKey,
                'pinata_secret_api_key': secretApiKey
            }
        });

        fs.unlinkSync(mp3File.path); // Clean up the local file
        console.log('MP3 file uploaded successfully:', mp3Result.data.IpfsHash);

        console.log('Starting upload of JPEG file:', jpegFile.originalname);
        const jpegForm = new FormData();
        const jpegStream = fs.createReadStream(jpegFile.path);
        const jpegProgress = progress();
        jpegStream.pipe(jpegProgress);
        jpegForm.append('file', jpegProgress);

        jpegProgress.on('progress', (progress) => {
            console.log(`JPEG Upload Progress: ${progress.percentage.toFixed(2)}%`);
        });

        const jpegResult = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', jpegForm, {
            maxContentLength: 'Infinity',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${jpegForm._boundary}`,
                'pinata_api_key': apiKey,
                'pinata_secret_api_key': secretApiKey
            }
        });

        fs.unlinkSync(jpegFile.path); // Clean up the local file
        console.log('JPEG file uploaded successfully:', jpegResult.data.IpfsHash);

        res.json({
            success: true,
            mp3Hash: mp3Result.data.IpfsHash,
            jpegHash: jpegResult.data.IpfsHash
        });
    } catch (err) {
        console.error('Error uploading files:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
