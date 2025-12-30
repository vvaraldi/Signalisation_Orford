/**
 * common.js
 * Common utility functions for Signalisation Mont Orford
 */

/**
 * Format a Firestore timestamp to readable date string
 * @param {Object} timestamp - Firestore timestamp
 * @returns {string} Formatted date string
 */
function formatDate(timestamp) {
  if (!timestamp) return '-';
  
  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp);
  }
  
  if (isNaN(date.getTime())) return '-';
  
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleDateString('fr-CA', options);
}

/**
 * Format date for display in selector (shorter format)
 * @param {Object} timestamp - Firestore timestamp
 * @returns {string} Short formatted date
 */
function formatDateShort(timestamp) {
  if (!timestamp) return '-';
  
  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp);
  }
  
  if (isNaN(date.getTime())) return '-';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${day}/${month} ${hours}:${minutes}`;
}

/**
 * Show a status message
 * @param {string} message - Message to display
 * @param {string} type - Message type ('success', 'error', 'warning', 'info')
 * @param {number} duration - Duration in ms (0 for persistent)
 */
function showMessage(message, type = 'info', duration = 5000) {
  const container = document.getElementById('status-messages');
  if (!container) {
    console.log(`[${type}] ${message}`);
    return;
  }
  
  const alert = document.createElement('div');
  alert.className = `alert alert-${type === 'error' ? 'danger' : type}`;
  alert.innerHTML = message;
  
  container.appendChild(alert);
  
  if (duration > 0) {
    setTimeout(() => {
      alert.remove();
    }, duration);
  }
  
  return alert;
}

/**
 * Show loading state on a button
 * @param {HTMLButtonElement} button - Button element
 * @param {boolean} loading - Whether to show loading state
 */
function setButtonLoading(button, loading) {
  if (!button) return;
  
  if (loading) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = 'Chargement...';
    button.classList.add('loading');
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || button.textContent;
    button.classList.remove('loading');
  }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Get sector display name
 * @param {string} sectorId - Sector ID
 * @returns {string} Display name
 */
function getSectorDisplayName(sectorId) {
  const sectors = {
    'mont-orford': 'Mont-Orford',
    'giroux-nord': 'Mont Giroux Nord',
    'giroux-est': 'Mont Giroux Est',
    'alfred-desrochers': 'Mont Alfred-DesRochers',
    'remontees': 'Remontées mécaniques',
    'randonnee-alpine': 'Randonnée alpine'
  };
  return sectors[sectorId] || sectorId || '-';
}

/**
 * Get status display name with emoji
 * @param {string} statusId - Status ID
 * @returns {string} Display name with emoji
 */
function getStatusDisplayName(statusId) {
  const statuses = {
    'ouverte': '🟢 Ouverte',
    'attention-requise': '🟡 Attention requise',
    'fermee': '🔴 Fermée'
  };
  return statuses[statusId] || statusId || '-';
}

/**
 * Get status badge class
 * @param {string} statusId - Status ID
 * @returns {string} Badge class
 */
function getStatusBadgeClass(statusId) {
  const classes = {
    'ouverte': 'badge-success',
    'attention-requise': 'badge-warning',
    'fermee': 'badge-danger'
  };
  return classes[statusId] || 'badge-secondary';
}

/**
 * Compress image before upload
 * @param {File} file - Image file
 * @param {number} maxWidth - Maximum width
 * @param {number} quality - JPEG quality (0-1)
 * @returns {Promise<Blob>} Compressed image blob
 */
function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Initialize mobile menu functionality
 */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  const closeBtn = document.getElementById('mobile-nav-close');
  
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      mobileNav.classList.add('active');
    });
  }
  
  if (closeBtn && mobileNav) {
    closeBtn.addEventListener('click', () => {
      mobileNav.classList.remove('active');
    });
  }
  
  // Close on link click
  const mobileLinks = document.querySelectorAll('.mobile-nav-links a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileNav) mobileNav.classList.remove('active');
    });
  });
}

// Initialize mobile menu on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initMobileMenu);
