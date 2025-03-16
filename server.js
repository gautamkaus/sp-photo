const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));

// API to upload images
app.post("/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }
    res.send("File uploaded successfully.");
});

// API to delete images
app.delete("/delete/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "uploads", filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(500).send("Failed to delete file.");
        }
        res.send("File deleted successfully.");
    });
});

// API to list all images
app.get("/images", (req, res) => {
    fs.readdir("uploads/", (err, files) => {
        if (err) {
            return res.status(500).send("Unable to read images.");
        }
        res.json(files);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});