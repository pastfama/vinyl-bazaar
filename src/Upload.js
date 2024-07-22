import React, { useState } from 'react';
import axios from 'axios';

const Upload = () => {
    const [mp3File, setMp3File] = useState(null);
    const [jpegFile, setJpegFile] = useState(null);
    const [response, setResponse] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.name === 'mp3') {
            setMp3File(e.target.files[0]);
        } else {
            setJpegFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('mp3', mp3File);
        formData.append('jpeg', jpegFile);

        try {
            const res = await axios.post('http://localhost:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setResponse(res.data);
        } catch (err) {
            console.error('Error uploading files', err);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>MP3 File:</label>
                    <input type="file" name="mp3" accept=".mp3" onChange={handleFileChange} required />
                </div>
                <div>
                    <label>JPEG File:</label>
                    <input type="file" name="jpeg" accept=".jpeg,.jpg" onChange={handleFileChange} required />
                </div>
                <button type="submit">Upload</button>
            </form>
            {response && (
                <div>
                    <h3>Upload Successful</h3>
                    <p>MP3 IPFS Hash: {response.mp3Hash}</p>
                    <p>JPEG IPFS Hash: {response.jpegHash}</p>
                </div>
            )}
        </div>
    );
};

export default Upload;
