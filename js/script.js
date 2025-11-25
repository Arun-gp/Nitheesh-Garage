// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSCFnbac7MsV4xDdD-gx_CG_4q6mGUEMI",
  authDomain: "nitheesh-garage.firebaseapp.com",
  projectId: "nitheesh-garage",
  storageBucket: "nitheesh-garage.firebasestorage.app",
  messagingSenderId: "839936311214",
  appId: "1:839936311214:web:52fcc205e21e1bb7ced23f",
  measurementId: "G-TZQQKCZ8T2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// User authentication state
let currentUser = null;

// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuBtn.innerHTML = navLinks.classList.contains('active') 
        ? '<i class="fas fa-times"></i>' 
        : '<i class="fas fa-bars"></i>';
    
    if (!navLinks.classList.contains('active')) {
        closeProfileDropdown();
        closeBikesDropdown();
    }
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links a, .dropdown-item, .nav-dropdown-item').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        closeProfileDropdown();
        closeBikesDropdown();
    });
});

// Bikes Dropdown Functions
function toggleBikesDropdown(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const navDropdown = document.querySelector('.nav-dropdown');
    const dropdownMenu = document.getElementById('bikesDropdownMenu');
    
    // Close profile dropdown if open
    closeProfileDropdown();
    
    if (navDropdown.classList.contains('active')) {
        closeBikesDropdown();
    } else {
        navDropdown.classList.add('active');
        dropdownMenu.style.display = 'block';
    }
}

function closeBikesDropdown() {
    const navDropdown = document.querySelector('.nav-dropdown');
    const dropdownMenu = document.getElementById('bikesDropdownMenu');
    
    if (navDropdown) {
        navDropdown.classList.remove('active');
    }
    if (dropdownMenu) {
        dropdownMenu.style.display = 'none';
    }
}

// Close bikes dropdown when clicking outside
document.addEventListener('click', function(event) {
    const navDropdown = document.querySelector('.nav-dropdown');
    const isClickInside = navDropdown && navDropdown.contains(event.target);
    
    if (!isClickInside) {
        closeBikesDropdown();
    }
});

// Load bikes in navbar dropdown
async function loadBikesInNavbar() {
    const bikesNavList = document.getElementById('bikesNavList');
    
    try {
        const querySnapshot = await db.collection('bikes').orderBy('createdAt', 'desc').limit(10).get();
        
        if (querySnapshot.empty) {
            bikesNavList.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--gray); font-size: 0.9rem;">No bikes available</div>';
            return;
        }
        
        let bikesHTML = '';
        querySnapshot.forEach((doc) => {
            const bike = doc.data();
            const bikeId = doc.id;
            bikesHTML += `
                <a onclick="showBikeFromNav('${bikeId}')" class="nav-dropdown-item">
                    <img src="${bike.imageUrl}" alt="${bike.name}" class="nav-bike-image">
                    <div class="nav-bike-info">
                        <span class="nav-bike-name">${bike.name}</span>
                        <span class="nav-bike-price">₹${parseInt(bike.price).toLocaleString('en-IN')}</span>
                    </div>
                </a>
            `;
        });
        
        bikesNavList.innerHTML = bikesHTML;
        
    } catch (error) {
        console.error('Error loading navbar bikes:', error);
        bikesNavList.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--primary); font-size: 0.9rem;">Error loading bikes</div>';
    }
}

// Show specific bike from navbar
function showBikeFromNav(bikeId) {
    showSection('bikes');
    closeBikesDropdown();
    
    // Scroll to the specific bike after a short delay
    setTimeout(() => {
        const bikeCards = document.querySelectorAll('.bike-card');
        bikeCards.forEach(card => {
            if (card.dataset.bikeId === bikeId) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                card.style.animation = 'highlightBike 2s ease';
            }
        });
    }, 300);
}

// Modal Functions
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function showSignupModal() {
    document.getElementById('signupModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    closeLoginModal();
}

function closeSignupModal() {
    document.getElementById('signupModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    
    if (event.target === loginModal) {
        closeLoginModal();
    }
    if (event.target === signupModal) {
        closeSignupModal();
    }
});

// Firebase Authentication Functions
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const button = event.target.querySelector('button[type="submit"]');
    
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    try {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
        
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        currentUser = userCredential.user;
        
        closeLoginModal();
        updateAuthUI();
        showMessage('Login successful! Welcome back.', 'success');
        
    } catch (error) {
        console.error('Login error:', error);
        let message = 'Login failed. Please try again.';
        
        switch (error.code) {
            case 'auth/user-not-found':
                message = 'No account found with this email.';
                break;
            case 'auth/wrong-password':
                message = 'Incorrect password. Please try again.';
                break;
            case 'auth/invalid-email':
                message = 'Invalid email address.';
                break;
        }
        
        showMessage(message, 'error');
    } finally {
        button.disabled = false;
        button.innerHTML = 'Sign In';
    }
}

async function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const button = event.target.querySelector('button[type="submit"]');
    
    if (!name || !email || !phone || !password || !confirmPassword) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters long', 'error');
        return;
    }
    
    try {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        currentUser = userCredential.user;
        
        await currentUser.updateProfile({
            displayName: name
        });
        
        // Store user data in Firestore
        await db.collection('users').doc(currentUser.uid).set({
            name: name,
            email: email,
            phone: phone,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        closeSignupModal();
        updateAuthUI();
        showMessage('Account created successfully! Welcome to Nitheesh Garage, ' + name, 'success');
        
    } catch (error) {
        console.error('Signup error:', error);
        let message = 'Signup failed. Please try again.';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'An account with this email already exists.';
                break;
            case 'auth/weak-password':
                message = 'Password is too weak. Please use a stronger password.';
                break;
            case 'auth/invalid-email':
                message = 'Invalid email address.';
                break;
        }
        
        showMessage(message, 'error');
    } finally {
        button.disabled = false;
        button.innerHTML = 'Create Account';
    }
}

async function signInWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        
        const result = await auth.signInWithPopup(provider);
        currentUser = result.user;
        
        // Store user data if new user
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (!userDoc.exists) {
            await db.collection('users').doc(currentUser.uid).set({
                name: currentUser.displayName,
                email: currentUser.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        closeLoginModal();
        closeSignupModal();
        updateAuthUI();
        showMessage('Google sign-in successful! Welcome, ' + currentUser.displayName, 'success');
        
    } catch (error) {
        console.error('Google sign-in error:', error);
        showMessage('Google sign-in failed. Please try again.', 'error');
    }
}

async function resetPassword() {
    const email = document.getElementById('loginEmail').value;
    
    if (!email) {
        showMessage('Please enter your email address first', 'error');
        return;
    }
    
    try {
        await auth.sendPasswordResetEmail(email);
        showMessage('Password reset email sent! Check your inbox.', 'success');
    } catch (error) {
        console.error('Password reset error:', error);
        showMessage('Failed to send reset email. Please check your email address.', 'error');
    }
}

// Profile Dropdown Functions
function toggleProfileDropdown() {
    const profileDropdown = document.querySelector('.profile-dropdown');
    profileDropdown.classList.toggle('active');
    
    // Close bikes dropdown if open
    closeBikesDropdown();
}

function closeProfileDropdown() {
    const profileDropdown = document.querySelector('.profile-dropdown');
    profileDropdown.classList.remove('active');
}

document.addEventListener('click', function(event) {
    const profileDropdown = document.querySelector('.profile-dropdown');
    const isClickInside = profileDropdown && profileDropdown.contains(event.target);
    
    if (!isClickInside) {
        closeProfileDropdown();
    }
});

async function logout() {
    try {
        await auth.signOut();
        currentUser = null;
        updateAuthUI();
        closeProfileDropdown();
        showMessage('You have been logged out successfully.', 'success');
    } catch (error) {
        console.error('Logout error:', error);
        showMessage('Logout failed. Please try again.', 'error');
    }
}

// Auth state listener
auth.onAuthStateChanged((user) => {
    currentUser = user;
    updateAuthUI();
});

function updateAuthUI() {
    const authButtons = document.querySelector('.auth-buttons');
    const userProfile = document.querySelector('.user-profile');
    
    if (currentUser) {
        authButtons.style.display = 'none';
        userProfile.style.display = 'block';
        
        const profileImage = document.getElementById('profileImage');
        const profileName = document.getElementById('profileName');
        const dropdownProfileImage = document.getElementById('dropdownProfileImage');
        const dropdownProfileName = document.getElementById('dropdownProfileName');
        const dropdownProfileEmail = document.getElementById('dropdownProfileEmail');
        
        const displayName = currentUser.displayName || currentUser.email.split('@')[0];
        const email = currentUser.email;
        const photoURL = currentUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face';
        
        profileImage.src = photoURL;
        profileName.textContent = displayName;
        dropdownProfileImage.src = photoURL;
        dropdownProfileName.textContent = displayName;
        dropdownProfileEmail.textContent = email;
        
    } else {
        authButtons.style.display = 'flex';
        userProfile.style.display = 'none';
        closeProfileDropdown();
    }
}

// Utility Functions
function showMessage(message, type = 'info') {
    const existingMessages = document.querySelectorAll('.custom-message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `custom-message ${type}-message`;
    messageDiv.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        z-index: 3000;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    if (type === 'success') {
        messageDiv.style.background = '#28a745';
    } else if (type === 'error') {
        messageDiv.style.background = '#dc3545';
    } else {
        messageDiv.style.background = '#17a2b8';
    }
    
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => messageDiv.remove(), 300);
        }
    }, 5000);
}

// Initialize on page load
window.addEventListener('load', function() {
    updateAuthUI();
    loadBikesFromFirestore();
    loadBikesInNavbar();
    
    // Add CSS for message animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes highlightBike {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); box-shadow: 0 10px 30px rgba(230, 57, 70, 0.3); }
        }
    `;
    document.head.appendChild(style);
});

// Section Navigation
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-links > li > a');

    sections.forEach(section => section.classList.remove('active'));
    navLinks.forEach(link => link.classList.remove('active'));

    document.getElementById(sectionId).classList.add('active');

    const activeLink = document.querySelector(`.nav-links > li > a[onclick="showSection('${sectionId}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    navLinks.classList.remove('active');
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';

    window.scrollTo(0, 0);

    if (sectionId === 'bikes') {
        loadBikesFromFirestore();
    } else if (sectionId === 'admin') {
        loadAdminBikes();
    }
}

// Load bikes from Firestore
async function loadBikesFromFirestore() {
    const bikesGrid = document.getElementById('bikesGrid');
    const loadingBikes = document.getElementById('loadingBikes');
    
    try {
        loadingBikes.style.display = 'block';
        bikesGrid.innerHTML = '';
        
        const querySnapshot = await db.collection('bikes').orderBy('createdAt', 'desc').get();
        
        if (querySnapshot.empty) {
            bikesGrid.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 3rem; grid-column: 1/-1;">No bikes available at the moment. Check back soon!</p>';
            return;
        }
        
        let bikesHTML = '';
        querySnapshot.forEach((doc) => {
            const bike = doc.data();
            const bikeId = doc.id;
            bikesHTML += `
                <div class="bike-card" data-bike-id="${bikeId}">
                    <div class="bike-badge">Available</div>
                    <img src="${bike.imageUrl}" alt="${bike.name}" class="bike-image">
                    <div class="bike-info">
                        <h3>${bike.name}</h3>
                        <p class="bike-price">₹${parseInt(bike.price).toLocaleString('en-IN')}</p>
                        <div class="bike-features">
                            ${bike.features.map(feature => `
                                <div class="bike-feature">
                                    <i class="fas fa-check"></i>
                                    <span>${feature}</span>
                                </div>
                            `).join('')}
                        </div>
                        <p class="bike-description">${bike.description}</p>
                        <div class="bike-actions">
                            <button class="btn btn-primary btn-small" onclick="handleInquiry('${bike.name}')">Inquire Now</button>
                            <button class="btn btn-outline btn-small" onclick="showBikeDetails('${bike.name}')">View Details</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        bikesGrid.innerHTML = bikesHTML;
        
        // Reload navbar bikes
        loadBikesInNavbar();
        
    } catch (error) {
        console.error('Error loading bikes:', error);
        bikesGrid.innerHTML = '<p style="text-align: center; color: var(--primary); padding: 3rem; grid-column: 1/-1;">Error loading bikes. Please refresh the page.</p>';
    } finally {
        loadingBikes.style.display = 'none';
    }
}

function handleInquiry(bikeName) {
    if (!currentUser) {
        showLoginModal();
        showMessage('Please login to inquire about this bike.', 'info');
    } else {
        showMessage(`Thank you ${currentUser.displayName || 'User'}! We have received your inquiry about the ${bikeName}. Our team will contact you shortly.`, 'success');
    }
}

function showBikeDetails(bikeName) {
    showMessage(`Details for ${bikeName} will be shown here.`, 'info');
}

// Load bikes in admin panel
async function loadAdminBikes() {
    const bikesList = document.getElementById('bikesList');
    const loadingAdminBikes = document.getElementById('loadingAdminBikes');
    
    try {
        loadingAdminBikes.style.display = 'block';
        bikesList.innerHTML = '';
        
        const querySnapshot = await db.collection('bikes').orderBy('createdAt', 'desc').get();
        
        if (querySnapshot.empty) {
            bikesList.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">No bikes added yet</p>';
            return;
        }
        
        let bikesHTML = '';
        querySnapshot.forEach((doc) => {
            const bike = doc.data();
            bikesHTML += `
                <div class="bike-item">
                    <img src="${bike.imageUrl}" alt="${bike.name}">
                    <div class="bike-item-info">
                        <h4>${bike.name}</h4>
                        <p class="bike-item-price">₹${parseInt(bike.price).toLocaleString('en-IN')}</p>
                        <p>${bike.description}</p>
                    </div>
                    <button class="delete-btn" onclick="deleteBike('${doc.id}', '${bike.imagePath}')">Delete</button>
                </div>
            `;
        });
        
        bikesList.innerHTML = bikesHTML;
        
    } catch (error) {
        console.error('Error loading admin bikes:', error);
        bikesList.innerHTML = '<p style="text-align: center; color: var(--primary); padding: 2rem;">Error loading bikes.</p>';
    } finally {
        loadingAdminBikes.style.display = 'none';
    }
}

// Preview uploaded image
function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.getElementById('imagePreview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Add new bike to Firestore
async function addBike(event) {
    event.preventDefault();

    if (!currentUser) {
        showMessage('Please login to add bikes', 'error');
        showLoginModal();
        return;
    }

    const name = document.getElementById('bikeName').value;
    const price = document.getElementById('bikePrice').value;
    const description = document.getElementById('bikeDescription').value;
    const feature1 = document.getElementById('bikeFeature1').value;
    const feature2 = document.getElementById('bikeFeature2').value;
    const feature3 = document.getElementById('bikeFeature3').value;
    const imageFile = document.getElementById('bikeImage').files[0];
    const button = document.getElementById('addBikeBtn');

    if (!imageFile) {
        showMessage('Please select an image', 'error');
        return;
    }

    try {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding Bike...';

        // Upload image to Firebase Storage
        const timestamp = Date.now();
        const imagePath = `bikes/${timestamp}_${imageFile.name}`;
        const storageRef = storage.ref(imagePath);
        const uploadTask = await storageRef.put(imageFile);
        const imageUrl = await uploadTask.ref.getDownloadURL();

        // Add bike to Firestore
        await db.collection('bikes').add({
            name: name,
            price: price,
            description: description,
            features: [feature1, feature2, feature3],
            imageUrl: imageUrl,
            imagePath: imagePath,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: currentUser.uid
        });

        // Reset form
        event.target.reset();
        document.getElementById('imagePreview').style.display = 'none';

        // Reload admin bikes and navbar bikes
        await loadAdminBikes();
        await loadBikesInNavbar();

        showMessage('Bike added successfully!', 'success');

    } catch (error) {
        console.error('Error adding bike:', error);
        showMessage('Failed to add bike. Please try again.', 'error');
    } finally {
        button.disabled = false;
        button.innerHTML = 'Add Bike';
    }
}

// Delete bike from Firestore
async function deleteBike(bikeId, imagePath) {
    if (!currentUser) {
        showMessage('Please login to delete bikes', 'error');
        return;
    }

    if (!confirm('Are you sure you want to delete this bike?')) {
        return;
    }

    try {
        // Delete image from Storage
        if (imagePath) {
            const imageRef = storage.ref(imagePath);
            await imageRef.delete().catch(err => console.log('Image already deleted or not found'));
        }

        // Delete bike from Firestore
        await db.collection('bikes').doc(bikeId).delete();

        // Reload admin bikes and navbar bikes
        await loadAdminBikes();
        await loadBikesInNavbar();

        showMessage('Bike deleted successfully!', 'success');

    } catch (error) {
        console.error('Error deleting bike:', error);
        showMessage('Failed to delete bike. Please try again.', 'error');
    }
}

// Contact Form Submission
function handleContactSubmit(e) {
    e.preventDefault();
    showMessage('Thank you for contacting us! We will get back to you soon.', 'success');
    e.target.reset();
}

// Make functions globally available
window.showLoginModal = showLoginModal;
window.closeLoginModal = closeLoginModal;
window.showSignupModal = showSignupModal;
window.closeSignupModal = closeSignupModal;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.signInWithGoogle = signInWithGoogle;
window.resetPassword = resetPassword;
window.logout = logout;
window.showSection = showSection;
window.handleInquiry = handleInquiry;
window.showBikeDetails = showBikeDetails;
window.previewImage = previewImage;
window.addBike = addBike;
window.deleteBike = deleteBike;
window.handleContactSubmit = handleContactSubmit;
window.toggleProfileDropdown = toggleProfileDropdown;
window.closeProfileDropdown = closeProfileDropdown;
window.toggleBikesDropdown = toggleBikesDropdown;
window.closeBikesDropdown = closeBikesDropdown;
window.showBikeFromNav = showBikeFromNav;