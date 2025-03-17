const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const auth = require("basic-auth"); // Add this

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Configure directories
const publicDir = path.join(__dirname, 'public');
const uploadDir = path.join(__dirname, 'uploads');
const imagesDir = path.join(__dirname, 'images');

// Ensure directories exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log('Created uploads directory');
}
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
  console.log('Created images directory');
}

// Serve static files from public directory
app.use(express.static(publicDir));
app.use('/uploads', express.static(uploadDir));
app.use('/images', express.static(imagesDir));

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = req.path === '/upload-captured' ? 'images/' : 'uploads/';
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const prefix = req.path === '/upload-captured' ? 'captured_' : '';
        cb(null, prefix + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Serve index.html at root (publicly accessible)
app.get('/', (req, res) => {
    console.log('GET / - Serving index.html');
    res.sendFile(path.join(publicDir, 'index.html'));
});

// Basic Authentication Middleware
const adminAuth = (req, res, next) => {
    const user = auth(req);
    const adminUsername = process.env.ADMIN_USERNAME || "sp_adminapnel";
    const adminPassword = process.env.ADMIN_PASSWORD || "@sp_admiinpanel2025"; // Set your password (change this!)

    if (!user || user.name !== adminUsername || user.pass !== adminPassword) {
        res.set('WWW-Authenticate', 'Basic realm="Admin Panel"');
        return res.status(401).send('Authentication required.');
    }
    next();
};

// Protect admin routes with authentication
app.get('/admin', adminAuth, (req, res) => {
    console.log('GET /admin - Serving admin.html');
    res.sendFile(path.join(publicDir, 'admin.html'));
});

app.get('/all-images', adminAuth, (req, res) => {
    fs.readdir(uploadDir, (err, uploadFiles) => {
        if (err) {
            console.error('GET /all-images - Error reading upload directory:', err);
            return res.status(500).json({ error: 'Failed to read upload directory', details: err.message });
        }
        fs.readdir(imagesDir, (err, capturedFiles) => {
            if (err) {
                console.error('GET /all-images - Error reading images directory:', err);
                return res.status(500).json({ error: 'Failed to read images directory', details: err.message });
            }
            const allImages = [
                ...uploadFiles.map(file => ({ name: file, type: 'gallery' })),
                ...capturedFiles.map(file => ({ name: file, type: 'captured' }))
            ];
            console.log('GET /all-images - All images served:', allImages);
            res.json(allImages);
        });
    });
});

app.post('/uploads', adminAuth, upload.single('image'), (req, res) => {
    console.log('POST /uploads - Uploaded gallery image:', req.file.filename);
    res.status(200).json({ message: 'Image uploaded', filename: req.file.filename });
});

app.delete('/delete/:type/:filename', adminAuth, (req, res) => {
    const { type, filename } = req.params;
    const dir = type === 'captured' ? imagesDir : uploadDir;
    const filePath = path.join(dir, filename);

    fs.unlink(filePath, err => {
        if (err) {
            console.error(`DELETE /delete/${type}/${filename} - Error deleting image:`, err);
            return res.status(500).json({ error: 'Failed to delete image', details: err.message });
        }
        console.log(`DELETE /delete/${type}/${filename} - Deleted image:`, filename);
        res.status(200).json({ message: 'Image deleted' });
    });
});

// Public routes (no authentication)
app.post('/upload-captured', upload.single('image'), (req, res) => {
    console.log('POST /upload-captured - Uploaded captured image:', req.file.filename);
    res.status(200).json({ message: 'Captured image uploaded', filename: req.file.filename });
});

app.get('/public-images', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            console.error('GET /public-images - Error reading upload directory:', err);
            return res.status(500).json({ error: 'Failed to read upload directory', details: err.message });
        }
        console.log('GET /public-images - Public images served:', files);
        res.json(files);
    });
});

// Handle undefined routes
app.use((req, res) => {
    console.log(`404 - Endpoint not found: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
