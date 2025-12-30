/**
 * auth.js
 * Firebase Authentication for Signalisation system
 * Uses shared inspectors collection from Ski-Track
 * Checks for allowSignalisation access
 */

// Firebase configuration (same as Ski-Track and Infraction projects)
const firebaseConfig = {
  apiKey: "AIzaSyDcBZrwGTskM7QUvanzLTACEJ_T-55j-DA",
  authDomain: "trail-inspection.firebaseapp.com",
  projectId: "trail-inspection",
  storageBucket: "trail-inspection.firebasestorage.app",
  messagingSenderId: "415995272058",
  appId: "1:415995272058:web:dc476de8ffee052e2ad4c3",
  measurementId: "G-EBLYWBM9YB"
};

// Firebase services
let auth = null;
let db = null;
let storage = null;
let firebaseInitialized = false;

// Current user data
let currentUser = null;
let currentUserData = null;

/**
 * Initialize Firebase
 * @returns {boolean} True if initialization succeeded
 */
function initializeFirebase() {
  if (firebaseInitialized) return true;
  
  if (typeof firebase === 'undefined') {
    console.error('Firebase SDK not loaded');
    return false;
  }
  
  try {
    if (firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }
    
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();
    firebaseInitialized = true;
    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return false;
  }
}

/**
 * Wait for Firebase to be available
 * @returns {Promise} Resolves when Firebase is ready
 */
function waitForFirebase() {
  return new Promise((resolve, reject) => {
    if (firebaseInitialized) {
      resolve();
      return;
    }
    
    if (typeof firebase !== 'undefined' && firebase.apps !== undefined) {
      if (initializeFirebase()) {
        resolve();
        return;
      }
    }
    
    let attempts = 0;
    const maxAttempts = 50;
    
    const checkFirebase = setInterval(() => {
      attempts++;
      
      if (typeof firebase !== 'undefined' && firebase.apps !== undefined) {
        clearInterval(checkFirebase);
        if (initializeFirebase()) {
          resolve();
        } else {
          reject(new Error('Failed to initialize Firebase'));
        }
      } else if (attempts >= maxAttempts) {
        clearInterval(checkFirebase);
        reject(new Error('Firebase SDK failed to load'));
      }
    }, 100);
  });
}

/**
 * Show access denied message
 * @param {string} message - Message to display
 */
function showAccessDenied(message) {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.innerHTML = `
      <div class="loading-content">
        <p style="color: #dc2626; margin-bottom: 1rem; font-size: 1.125rem;">⚠️ Accès refusé</p>
        <p style="color: #6b7280; margin-bottom: 1.5rem;">${message}</p>
        <a href="https://vvaraldi.github.io/Orford_Patrouille/index.html" class="btn btn-primary">
          Retour au menu principal
        </a>
      </div>
    `;
  }
}

/**
 * Redirect to login (portal)
 */
function redirectToLogin() {
  // Redirect to main portal for login
  window.location.href = 'https://vvaraldi.github.io/Orford_Patrouille/index.html';
}

/**
 * Handle logout
 */
async function handleLogout(e) {
  if (e) e.preventDefault();
  
  try {
    await auth.signOut();
    redirectToLogin();
  } catch (error) {
    console.error('Logout error:', error);
    showMessage('Erreur lors de la déconnexion', 'error');
  }
}

/**
 * Check authentication status
 * Checks for allowSignalisation access
 */
async function checkAuthStatus() {
  const loading = document.getElementById('loading');
  const mainContent = document.getElementById('main-content');
  const loginLink = document.getElementById('login-link');
  const mobileLoginLink = document.getElementById('mobile-login-link');
  const adminLink = document.getElementById('admin-link');
  const mobileAdminLink = document.getElementById('mobile-admin-link');
  
  // Wait for Firebase to be ready
  try {
    await waitForFirebase();
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    if (loading) {
      loading.innerHTML = `
        <div class="loading-content">
          <p style="color: #dc2626; margin-bottom: 1rem;">Erreur de chargement Firebase.</p>
          <p style="color: #6b7280; font-size: 0.875rem; margin-bottom: 1rem;">Veuillez rafraîchir la page.</p>
          <button onclick="location.reload()" class="btn btn-primary">Rafraîchir</button>
        </div>
      `;
    }
    return;
  }
  
  auth.onAuthStateChanged(async function(user) {
    if (user) {
      currentUser = user;
      
      try {
        // Get user data from inspectors collection
        const inspectorDoc = await db.collection('inspectors').doc(user.uid).get();
        
        if (inspectorDoc.exists) {
          currentUserData = inspectorDoc.data();
          currentUserData.uid = user.uid;
          
          // Check if user is active
          if (currentUserData.status !== 'active') {
            showAccessDenied('Votre compte a été désactivé. Contactez l\'administrateur.');
            await auth.signOut();
            return;
          }
          
          // Check if user has signalisation access
          if (currentUserData.allowSignalisation !== true) {
            showAccessDenied('Vous n\'avez pas accès au système de signalisation. Contactez l\'administrateur.');
            await auth.signOut();
            return;
          }
          
          // User is authorized - show content
          if (loading) loading.style.display = 'none';
          if (mainContent) mainContent.style.display = 'block';
          
          // Update UI based on role
          updateUIForRole(currentUserData.role);
          
          // Dispatch authenticated event
          document.dispatchEvent(new CustomEvent('userAuthenticated', {
            detail: currentUserData
          }));
          
        } else {
          // User not found in inspectors collection
          showAccessDenied('Utilisateur non trouvé. Contactez l\'administrateur.');
          await auth.signOut();
        }
        
      } catch (error) {
        console.error('Error checking auth status:', error);
        showAccessDenied('Erreur lors de la vérification des accès.');
        await auth.signOut();
      }
      
    } else {
      // Not logged in - redirect to portal
      currentUser = null;
      currentUserData = null;
      redirectToLogin();
    }
  });
}

/**
 * Update UI elements based on user role
 * @param {string} role - User role
 */
function updateUIForRole(role) {
  const adminLink = document.getElementById('admin-link');
  const mobileAdminLink = document.getElementById('mobile-admin-link');
  const loginLink = document.getElementById('login-link');
  const mobileLoginLink = document.getElementById('mobile-login-link');
  
  // Show admin link for admins
  if (role === 'admin') {
    if (adminLink) adminLink.style.display = 'block';
    if (mobileAdminLink) mobileAdminLink.style.display = 'block';
  }
  
  // Update login links to logout
  if (loginLink) {
    loginLink.textContent = 'Déconnexion';
    loginLink.href = '#';
    loginLink.onclick = handleLogout;
  }
  
  if (mobileLoginLink) {
    mobileLoginLink.textContent = 'Déconnexion';
    mobileLoginLink.href = '#';
    mobileLoginLink.onclick = handleLogout;
  }
}

/**
 * Get current user data
 * @returns {Object|null} Current user data
 */
function getCurrentUser() {
  return currentUserData;
}

/**
 * Get current user ID
 * @returns {string|null} Current user ID
 */
function getCurrentUserId() {
  return currentUser ? currentUser.uid : null;
}

/**
 * Check if current user is admin
 * @returns {boolean} True if admin
 */
function isAdmin() {
  return currentUserData && currentUserData.role === 'admin';
}

/**
 * Get Firebase config
 * @returns {Object} Firebase config
 */
function getFirebaseConfig() {
  return firebaseConfig;
}

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, checking auth status...');
  checkAuthStatus();
});
