document.addEventListener("DOMContentLoaded", function () {
    const cameraFeed = document.getElementById("cameraFeed");
    const capturedImageContainer = document.getElementById("capturedImageContainer");
    const capturedImage = document.getElementById("capturedImage");
    const saveImageBtn = document.getElementById("saveImage");
    const closeCaptureBtn = document.getElementById("closeCapture");
    const logoContainer = document.querySelector(".logo-container");
    const flashEffect = document.getElementById("flashEffect");
    const holoEffect = document.getElementById("holoEffect");
    const navLinks = document.querySelectorAll('.nav-link');
    const menuIcon = document.querySelector('.menu-icon');
    const sections = document.querySelectorAll('.section');
    const servicesContainer = document.querySelector('.services-container');
    const galleryGrid = document.getElementById("galleryGrid");
    let stream;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    let isDragging = false;
    let startX;
    let scrollLeft;

    const BASE_URL = 'http://localhost:3000'; // Update this to match your server URL

    // Mobile menu toggle
    menuIcon.addEventListener('click', () => {
        document.querySelector('.nav-links').classList.toggle('active');
    });

    // Scroll event for section focus and fade
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY + window.innerHeight / 2;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionBottom = sectionTop + sectionHeight;

            if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
                section.classList.add('focus');
                section.classList.remove('fade-out');
            } else {
                section.classList.remove('focus');
                section.classList.add('fade-out');
            }
        });
    });

    // Scroll and fade effect for services
    if (window.innerWidth <= 768) {
        servicesContainer.addEventListener('scroll', () => {
            const serviceItems = document.querySelectorAll('.service-item');
            const containerWidth = servicesContainer.offsetWidth;
            const scrollPosition = servicesContainer.scrollLeft;

            serviceItems.forEach(item => {
                const itemLeft = item.offsetLeft;
                const itemWidth = item.offsetWidth;
                const itemRight = itemLeft + itemWidth;

                if (scrollPosition >= itemLeft - containerWidth / 2 && scrollPosition <= itemRight - containerWidth / 2) {
                    item.classList.remove('fade-out');
                } else {
                    item.classList.add('fade-out');
                }
            });
        });

        const firstServiceItem = servicesContainer.querySelector('.service-item');
        if (firstServiceItem) {
            firstServiceItem.classList.remove('fade-out');
        }
    }

    // Click and drag functionality for services
    servicesContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX - servicesContainer.offsetLeft;
        scrollLeft = servicesContainer.scrollLeft;
        servicesContainer.style.cursor = 'grabbing';
    });

    servicesContainer.addEventListener('touchstart', (e) => {
        isDragging = true;
        startX = e.touches[0].pageX - servicesContainer.offsetLeft;
        scrollLeft = servicesContainer.scrollLeft;
        servicesContainer.style.cursor = 'grabbing';
    }, { passive: true });

    servicesContainer.addEventListener('mouseleave', () => {
        isDragging = false;
        servicesContainer.style.cursor = 'grab';
    });

    servicesContainer.addEventListener('mouseup', () => {
        isDragging = false;
        servicesContainer.style.cursor = 'grab';
    });

    servicesContainer.addEventListener('touchend', () => {
        isDragging = false;
        servicesContainer.style.cursor = 'grab';
    });

    servicesContainer.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - servicesContainer.offsetLeft;
        const walk = (x - startX) * 2;
        servicesContainer.scrollLeft = scrollLeft - walk;
    });

    servicesContainer.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.touches[0].pageX - servicesContainer.offsetLeft;
        const walk = (x - startX) * 2;
        servicesContainer.scrollLeft = scrollLeft - walk;
    }, { passive: false });

    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
            cameraFeed.srcObject = stream;
        } catch (error) {
            console.error("Camera access denied!", error);
        }
    }

    function addWatermark(imageElement) {
        const img = new Image();
        img.src = imageElement.src;
        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);
            context.font = '24px Playfair Display';
            context.fillStyle = 'rgba(255, 255, 255, 0.7)';
            context.textAlign = 'right';
            context.fillText('SP Photography', canvas.width - 20, canvas.height - 20);
            imageElement.src = canvas.toDataURL('image/png');
        };
    }

    async function uploadImage(imageSrc) {
        const blob = await fetch(imageSrc).then(res => res.blob());
        const formData = new FormData();
        formData.append("image", blob, `captured_${Date.now()}.png`);
        formData.append("category", "captured_shots");

        try {
            const response = await fetch(`${BASE_URL}/upload-captured`, {
                method: "POST",
                body: formData,
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Upload failed: ${errorData.error || response.statusText}`);
            }
            const data = await response.json();
            console.log("Uploaded captured image:", data.filename);
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    }

    function captureImage() {
        if (!stream) return;
        
        const cameraSound = document.getElementById("cameraSound");
        cameraSound.currentTime = 0;
        cameraSound.play();

        flashEffect.style.opacity = "0.7";
        holoEffect.style.opacity = "0.4";
        setTimeout(() => {
            flashEffect.style.opacity = "0";
            holoEffect.style.opacity = "0";
        }, 300);

        canvas.width = cameraFeed.videoWidth;
        canvas.height = cameraFeed.videoHeight;
        context.drawImage(cameraFeed, 0, 0, canvas.width, canvas.height);
        capturedImage.src = canvas.toDataURL("image/png");
        addWatermark(capturedImage);
        capturedImageContainer.style.display = "block";
        uploadImage(capturedImage.src);
    }

    async function fetchImages() {
        const galleryGrid = document.getElementById("galleryGrid");
        if (!galleryGrid) {
            console.error("Gallery grid element not found!");
            return;
        }

        galleryGrid.innerHTML = "<p>Loading gallery...</p>";
        
        try {
            const response = await fetch(`${BASE_URL}/public-images`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const images = await response.json();

            if (!Array.isArray(images) || images.length === 0) {
                galleryGrid.innerHTML = "<p>No images available at the moment.</p>";
                return;
            }

            galleryGrid.innerHTML = "";
            images.forEach((image, index) => {
                const galleryItem = document.createElement("div");
                galleryItem.classList.add("gallery-item");
                
                const img = document.createElement("img");
                const imageUrl = `${BASE_URL}/uploads/${image}`;
                img.src = imageUrl;
                img.alt = `Gallery Image ${index + 1}`;
                img.loading = "lazy";
                
                img.onerror = () => {
                    console.error(`Failed to load image: ${imageUrl}`);
                    img.alt = "Image unavailable";
                };
                
                galleryItem.appendChild(img);
                galleryGrid.appendChild(galleryItem);
            });

        } catch (error) {
            console.error("Error fetching images:", error.message);
            galleryGrid.innerHTML = "<p>Gallery temporarily unavailable. Please try again later.</p>";
        }
    }

    // Simple scroll handler for mobile gallery
    if (window.innerWidth <= 768) {
        galleryGrid.addEventListener('touchstart', (e) => {
            galleryGrid.style.scrollBehavior = 'auto';
        }, { passive: true });

        galleryGrid.addEventListener('touchend', () => {
            galleryGrid.style.scrollBehavior = 'smooth';
        });
    }

    logoContainer.addEventListener("click", captureImage);
    saveImageBtn.addEventListener("click", () => {
        const a = document.createElement("a");
        a.href = capturedImage.src;
        a.download = "captured_moment.png";
        a.click();
    });
    closeCaptureBtn.addEventListener("click", () => {
        capturedImageContainer.style.display = "none";
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.getElementById(this.getAttribute('href').substring(1));
            if (target && (this.getAttribute('href') === '#home' || this.getAttribute('href') === '#services')) {
                this.classList.add('active');
                setTimeout(() => this.classList.remove('active'), 500);
            }
            if (target) target.scrollIntoView({ behavior: 'smooth' });
            document.querySelector('.nav-links').classList.remove('active');
        });
    });

    startCamera();
    fetchImages();
});
