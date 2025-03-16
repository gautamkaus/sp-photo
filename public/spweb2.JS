document.addEventListener("DOMContentLoaded", function () {
    // ✅ Smooth scrolling
    document.querySelectorAll('nav ul li a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ✅ Gallery Hover Zoom Effect
    document.querySelectorAll('.gallery-item img').forEach(image => {
        image.addEventListener('mouseenter', function () {
            this.style.transform = 'scale(1.1)';
        });
        image.addEventListener('mouseleave', function () {
            this.style.transform = 'scale(1)';
        });
    });

    // ✅ Logo Flash Effect + Shutter Sound
    const logoContainer = document.querySelector(".logo-container");
    const flashEffect = document.createElement("div");
    flashEffect.classList.add("flash-effect");
    document.body.appendChild(flashEffect);

    logoContainer.addEventListener("mouseenter", function () {
        const cameraSound = document.getElementById("cameraSound");
        cameraSound.currentTime = 0;
        cameraSound.play();

        // Flash Effect
        flashEffect.style.opacity = "1";
        setTimeout(() => {
            flashEffect.style.opacity = "0";
        }, 150);
    });

    // ✅ Camera Capture Setup
    const cameraFeed = document.getElementById("cameraFeed");
    const capturedImageContainer = document.getElementById("capturedImageContainer");
    const capturedImage = document.getElementById("capturedImage");
    const saveImageBtn = document.getElementById("saveImage");
    const closeCaptureBtn = document.getElementById("closeCapture");
    let stream;
    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");

    // Function to add watermark to captured image
    function addWatermark(imageElement) {
        const img = new Image();
        img.src = imageElement.src;

        img.onload = function () {
            // Set canvas dimensions to the image dimensions
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw the image onto the canvas
            context.drawImage(img, 0, 0);

            // Set watermark style
            context.font = '20px Arial';
            context.fillStyle = 'rgba(255, 255, 255, 0.7)';
            context.textAlign = 'right';
            context.textBaseline = 'bottom';

            // Add watermark text at the bottom right corner
            context.fillText('SP Photography', canvas.width - 20, canvas.height - 20);

            // Set the canvas content as the image source
            imageElement.src = canvas.toDataURL('image/png');
        };
    }

    // Function to Start Camera
    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" }
            });
            cameraFeed.srcObject = stream;
        } catch (error) {
            console.error("Camera access denied!", error);
        }
    }

    // Function to Capture Image
    function captureImage() {
        if (!stream) return;

        // Play Camera Shutter Sound
        const cameraSound = document.getElementById("cameraSound");
        cameraSound.currentTime = 0;
        cameraSound.play();

        // Flash Effect
        flashEffect.style.opacity = "1";
        setTimeout(() => flashEffect.style.opacity = "0", 150);

        // Capture Image
        canvas.width = cameraFeed.videoWidth;
        canvas.height = cameraFeed.videoHeight;
        context.drawImage(cameraFeed, 0, 0, canvas.width, canvas.height);
        capturedImage.src = canvas.toDataURL("image/png");

        // Add watermark to the captured image
        addWatermark(capturedImage);

        // Show Captured Image
        capturedImageContainer.style.display = "block";
    }

    // ✅ Capture Image on Logo Click
    logoContainer.addEventListener("click", function () {
        captureImage();
    });

    // ✅ Close Captured Image Preview
    closeCaptureBtn.addEventListener("click", function () {
        capturedImageContainer.style.display = "none";
    });

    // ✅ Save Image to Device
    saveImageBtn.addEventListener("click", function () {
        const a = document.createElement("a");
        a.href = capturedImage.src;
        a.download = "captured_moment.png";
        a.click();
    });

    // ✅ Start Camera on Page Load
    startCamera();
});

// ✅ Mobile Menu Toggle
function toggleMenu() {
    const navMenu = document.querySelector("nav ul");
    navMenu.classList.toggle("show");
}


document.addEventListener("DOMContentLoaded", function () {
    // Fetch images from the server and display them in the gallery
    fetchImages();

    // Function to fetch images from the server
    async function fetchImages() {
        try {
            const response = await fetch("/images");
            if (!response.ok) {
                throw new Error("Failed to fetch images.");
            }
            const images = await response.json();

            // Clear the gallery grid before adding new images
            const galleryGrid = document.getElementById("galleryGrid");
            galleryGrid.innerHTML = "";

            // Add each image to the gallery
            images.forEach(image => {
                const galleryItem = document.createElement("div");
                galleryItem.classList.add("gallery-item");

                const img = document.createElement("img");
                img.src = `/uploads/${image}`;
                img.alt = "Gallery Image";

                galleryItem.appendChild(img);
                galleryGrid.appendChild(galleryItem);
            });
        } catch (error) {
            console.error("Error fetching images:", error);
        }
    }

    // Your existing JavaScript code for other functionalities
    // ...
});