// Fetch and display images
async function fetchImages() {
    const response = await fetch("/images");
    const images = await response.json();
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = images.map(image => `
        <div class="gallery-item">
            <img src="/uploads/${image}" alt="${image}">
            <button class="delete-btn" onclick="deleteImage('${image}')">Delete</button>
        </div>
    `).join("");

    // Animate gallery items
    gsap.from(".gallery-item", {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.5,
        ease: "power2.out",
    });
}

// Upload image
document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const response = await fetch("/upload", {
        method: "POST",
        body: formData,
    });

    if (response.ok) {
        alert("Image uploaded successfully.");
        fetchImages();
    } else {
        alert("Failed to upload image.");
    }
});

// Delete image
async function deleteImage(filename) {
    const response = await fetch(`/delete/${filename}`, {
        method: "DELETE",
    });

    if (response.ok) {
        alert("Image deleted successfully.");
        fetchImages();
    } else {
        alert("Failed to delete image.");
    }
}

// Load images on page load
fetchImages();
