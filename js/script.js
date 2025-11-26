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

// Bikes data stored in memory
let bikesData = [
    {
        id: 1,
        name: 'Yamaha MT-15',
        price: '1,67,000',
        description: 'Powerful 155cc street bike with aggressive styling and advanced features.',
        image: 'https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=600',
        features: ['155cc Engine', 'ABS', '35 kmpl']
    },
    {
        id: 2,
        name: 'Royal Enfield Classic 350',
        price: '1,93,000',
        description: 'Iconic cruiser with timeless design and thumping engine character.',
        image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600',
        features: ['350cc Engine', 'Classic Design', '40 kmpl']
    },
    {
        id: 3,
        name: 'KTM 390 Adventure',
        price: '3,20,000',
        description: 'Adventure tourer built for both on-road and off-road escapades.',
        image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600',
        features: ['373cc Engine', 'Adventure Ready', '30 kmpl']
    },
    {
        id: 4,
        name: 'Honda CB Shine',
        price: '78,000',
        description: 'Reliable commuter bike known for its fuel efficiency and low maintenance.',
        image: 'https://images.unsplash.com/photo-1599819177461-6d45c0e875f5?w=600',
        features: ['125cc Engine', 'Fuel Efficient', '65 kmpl']
    },
    {
        id: 5,
        name: 'Revolt RV 400',
        price: '1,28,000',
        description: 'Smart electric bike with swappable batteries and AI connectivity.',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
        features: ['Electric', 'AI Features', '150 km Range']
    },
    {
        id: 6,
        name: 'Vespa Sprint',
        price: '1,05,000',
        description: 'Stylish and premium scooter with Italian design and smooth performance.',
        image: 'https://images.unsplash.com/photo-1609078746796-9a358cefb1c6?w=600',
        features: ['150cc Engine', 'Premium Design', '45 kmpl']
    }
];
let nextId = 7;

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
    
    // Close profile dropdown when mobile menu is toggled
    if (!navLinks.classList.contains('active')) {
        closeProfileDropdown();
    }
});

// Close mobile menu and dropdown when clicking on a link
document.querySelectorAll('.nav-links a, .dropdown-item').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        closeProfileDropdown();
    });
});

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
    
    // Simple validation
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    try {
        // Show loading state
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
        // Reset button state
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
    
    // Validation
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
        // Show loading state
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        currentUser = userCredential.user;
        
        // Update user profile
        await currentUser.updateProfile({
            displayName: name
        });
        
        // Store additional user data in Firestore (you'll need to set this up)
        // await storeUserData(currentUser.uid, { name, email, phone });
        
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
        // Reset button state
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
}

function closeProfileDropdown() {
    const profileDropdown = document.querySelector('.profile-dropdown');
    profileDropdown.classList.remove('active');
}

// Close profile dropdown when clicking outside
document.addEventListener('click', function(event) {
    const profileDropdown = document.querySelector('.profile-dropdown');
    const isClickInside = profileDropdown.contains(event.target);
    
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

// Update the updateAuthUI function
function updateAuthUI() {
    const authButtons = document.querySelector('.auth-buttons');
    const userProfile = document.querySelector('.user-profile');
    
    if (currentUser) {
        // Hide auth buttons
        authButtons.style.display = 'none';
        userProfile.style.display = 'block';
        
        // Update profile information
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
        // Show auth buttons, hide profile
        authButtons.style.display = 'flex';
        userProfile.style.display = 'none';
        closeProfileDropdown();
    }
}

// Utility Functions
function showMessage(message, type = 'info') {
    // Remove existing messages
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
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => messageDiv.remove(), 300);
        }
    }, 5000);
}

// Check if user is logged in on page load
window.addEventListener('load', function() {
    updateAuthUI();
    renderBikes();
    renderAdminBikes();
    
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
    `;
    document.head.appendChild(style);
});

// Section Navigation
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-links a');

    sections.forEach(section => section.classList.remove('active'));
    navLinks.forEach(link => link.classList.remove('active'));

    document.getElementById(sectionId).classList.add('active');

    // Update active nav link
    const activeLink = document.querySelector(`.nav-links a[onclick="showSection('${sectionId}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // Close mobile menu if open
    navLinks.classList.remove('active');
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';

    window.scrollTo(0, 0);

    if (sectionId === 'bikes') {
        renderBikes();
    } else if (sectionId === 'admin') {
        renderAdminBikes();
    }
}

// Render bikes on the bikes page
function renderBikes() {
    const bikesGrid = document.getElementById('bikesGrid');
    bikesGrid.innerHTML = bikesData.map(bike => `
        <div class="bike-card">
            <div class="bike-badge">Available</div>
            <img src="${bike.image}" alt="${bike.name}" class="bike-image">
            <div class="bike-info">
                <h3>${bike.name}</h3>
                <p class="bike-price">â‚¹${bike.price}</p>
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
    `).join('');
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

// Render bikes in admin panel
function renderAdminBikes() {
    const bikesList = document.getElementById('bikesList');
    if (bikesData.length === 0) {
        bikesList.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">No bikes added yet</p>';
        return;
    }
    bikesList.innerHTML = bikesData.map(bike => `
        <div class="bike-item">
            <img src="${bike.image}" alt="${bike.name}">
            <div class="bike-item-info">
                <h4>${bike.name}</h4>
                <p class="bike-item-price">â‚¹${bike.price}</p>
                <p>${bike.description}</p>
            </div>
            <button class="delete-btn" onclick="deleteBike(${bike.id})">Delete</button>
        </div>
    `).join('');
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

// Add new bike
function addBike(event) {
    event.preventDefault();

    const name = document.getElementById('bikeName').value;
    const price = document.getElementById('bikePrice').value;
    const description = document.getElementById('bikeDescription').value;
    const imageFile = document.getElementById('bikeImage').files[0];

    if (!imageFile) {
        showMessage('Please select an image', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const newBike = {
            id: nextId++,
            name: name,
            price: parseInt(price).toLocaleString('en-IN'),
            description: description,
            image: e.target.result,
            features: ['Feature 1', 'Feature 2', 'Feature 3'] // Default features
        };

        bikesData.push(newBike);

        // Reset form
        event.target.reset();
        document.getElementById('imagePreview').style.display = 'none';

        // Update admin list
        renderAdminBikes();

        showMessage('Bike added successfully!', 'success');
    };
    reader.readAsDataURL(imageFile);
}

// Delete bike
function deleteBike(id) {
    if (confirm('Are you sure you want to delete this bike?')) {
        bikesData = bikesData.filter(bike => bike.id !== id);
        renderAdminBikes();
        showMessage('Bike deleted successfully!', 'success');
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