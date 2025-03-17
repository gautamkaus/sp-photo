const BASE_URL = window.location.origin;

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "sp_adminpanel";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "@sp_admiinpanel2025";

async function fetchImages() {
    try {
        const response = await fetch(`${BASE_URL}/all-images`, {
            headers: {
                'Authorization': 'Basic ' + btoa(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`)
            }
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Server error: ${response.status}, ${errorData.error || 'Unknown error'} - ${errorData.details || ''}`);
        }
        
        const images = await response.json();
        console.log("Fetched all images for admin:", images);
        
        const gallery = document.getElementById("gallery");
        if (!gallery) {
            console.error("Gallery element not found in DOM!");
            return;
        }
        const galleryImages = images.filter(img => img.type === 'gallery');
        gallery.innerHTML = galleryImages.length > 0
            ? galleryImages.map(img => `
                <div class="gallery-item">
                    <img src="${BASE_URL}/uploads/${img.name}" alt="${img.name}" onerror="console.error('Failed to load image: ${BASE_URL}/uploads/${img.name}')" onload="console.log('Loaded image: ${BASE_URL}/uploads/${img.name}')">
                    <button class="delete-btn" onclick="deleteImage('gallery', '${img.name}')">Delete</button>
                </div>
            `).join("")
            : "<p>No gallery images available.</p>";

        const capturedShots = document.getElementById("capturedShots");
        if (!capturedShots) {
            console.error("Captured shots element not found in DOM!");
            return;
        }
        const capturedImages = images.filter(img => img.type === 'captured');
        capturedShots.innerHTML = capturedImages.length > 0
            ? capturedImages.map(img => `
                <div class="gallery-item">
                    <img src="${BASE_URL}/images/${img.name}" alt="${img.name}" onerror="console.error('Failed to load image: ${BASE_URL}/images/${img.name}')" onload="console.log('Loaded image: ${BASE_URL}/images/${img.name}')">
                    <button class="delete-btn" onclick="deleteImage('captured', '${img.name}')">Delete</button>
                </div>
            `).join("")
            : "<p>No captured shots available.</p>";

        gsap.from(".gallery-item", {
            opacity: 0,
            y: 20,
            stagger: 0.1,
            duration: 0.5,
            ease: "power2.out",
        });
    } catch (error) {
        console.error("Error fetching images in admin:", error);
        document.getElementById("gallery").innerHTML = "<p>Unable to load gallery images.</p>";
        document.getElementById("capturedShots").innerHTML = "<p>Unable to load captured shots.</p>";
    }
}

document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
        const response = await fetch(`${BASE_URL}/uploads`, {
            method: "POST",
            body: formData,
            headers: {
                'Authorization': 'Basic ' + btoa(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`)
            }
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Upload failed: ${errorData.error || response.statusText}`);
        }
        alert("Image uploaded successfully.");
        fetchImages();
    } catch (error) {
        console.error("Error uploading image:", error);
        alert("Failed to upload image.");
    }
});

async function deleteImage(type, filename) {
    try {
        const response = await fetch(`${BASE_URL}/delete/${type}/${filename}`, {
            method: "DELETE",
            headers: {
                'Authorization': 'Basic ' + btoa(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`)
            }
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Delete failed: ${errorData.error || response.statusText}`);
        }
        alert("Image deleted successfully.");
        fetchImages();
    } catch (error) {
        console.error("Error deleting image:", error);
        alert("Failed to delete image.");
    }
}

fetchImages();
