/**
 * admin.js
 * Admin panel functionality for managing signalisation reports
 */

class AdminManager {
  constructor() {
    this.currentReportId = null;
    this.showResolved = false;
    this.showArchived = false;
    this.filterSector = '';
    this.sortBy = 'date';
    this.reportsData = [];
    
    // Wait for authentication
    document.addEventListener('userAuthenticated', (e) => {
      this.userData = e.detail;
      
      // Check if user is admin
      if (this.userData.role !== 'admin') {
        alert('Accès non autorisé. Vous devez être administrateur.');
        window.location.href = '../index.html';
        return;
      }
      
      this.init();
    });
  }
  
  init() {
    this.bindElements();
    this.bindEvents();
    this.loadReports();
  }
  
  bindElements() {
    // Table
    this.reportsTbody = document.getElementById('signalisations-tbody');
    
    // Filters
    this.filterSectorSelect = document.getElementById('filter-sector');
    this.sortBySelect = document.getElementById('sort-by');
    this.showResolvedCheckbox = document.getElementById('show-resolved');
    this.showArchivedCheckbox = document.getElementById('show-archived');
    this.refreshBtn = document.getElementById('refresh-btn');
    
    // Modal
    this.modal = document.getElementById('signalisation-modal');
    this.modalBody = document.getElementById('signalisation-modal-body');
    this.closeModalBtn = document.getElementById('close-signalisation-modal');
    this.closeModalFooterBtn = document.getElementById('close-signalisation-btn');
    this.saveAdminBtn = document.getElementById('save-admin-btn');
    this.resolvedCheckbox = document.getElementById('modal-resolved-checkbox');
    this.archivedCheckbox = document.getElementById('modal-archived-checkbox');
  }
  
  bindEvents() {
    // Filter controls
    if (this.filterSectorSelect) {
      this.filterSectorSelect.addEventListener('change', () => {
        this.filterSector = this.filterSectorSelect.value;
        this.renderReports();
      });
    }
    
    if (this.sortBySelect) {
      this.sortBySelect.addEventListener('change', () => {
        this.sortBy = this.sortBySelect.value;
        this.renderReports();
      });
    }
    
    if (this.showResolvedCheckbox) {
      this.showResolvedCheckbox.addEventListener('change', () => {
        this.showResolved = this.showResolvedCheckbox.checked;
        this.loadReports();
      });
    }
    
    if (this.showArchivedCheckbox) {
      this.showArchivedCheckbox.addEventListener('change', () => {
        this.showArchived = this.showArchivedCheckbox.checked;
        this.loadReports();
      });
    }
    
    if (this.refreshBtn) {
      this.refreshBtn.addEventListener('click', () => this.loadReports());
    }
    
    // Modal controls
    if (this.closeModalBtn) {
      this.closeModalBtn.addEventListener('click', () => this.hideModal());
    }
    
    if (this.closeModalFooterBtn) {
      this.closeModalFooterBtn.addEventListener('click', () => this.hideModal());
    }
    
    if (this.saveAdminBtn) {
      this.saveAdminBtn.addEventListener('click', () => this.saveAdminChanges());
    }
    
    // Close modal on overlay click
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.hideModal();
        }
      });
    }
  }
  
  /**
   * Load reports from Firestore
   */
  async loadReports() {
    try {
      let query = db.collection('signalisations').orderBy('createdAt', 'desc');
      
      const snapshot = await query.get();
      
      // Store all data for client-side filtering
      this.reportsData = [];
      snapshot.forEach(doc => {
        const data = { id: doc.id, ...doc.data() };
        
        // Apply resolved/archived filters
        if (!this.showResolved && data.resolved === true) return;
        if (!this.showArchived && data.archived === true) return;
        
        this.reportsData.push(data);
      });
      
      this.renderReports();
      
    } catch (error) {
      console.error('Error loading reports:', error);
      if (this.reportsTbody) {
        this.reportsTbody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center" style="color: #dc2626;">
              Erreur de chargement: ${error.message}
            </td>
          </tr>
        `;
      }
    }
  }
  
  /**
   * Filter and sort reports, then render
   */
  renderReports() {
    if (!this.reportsTbody) return;
    
    // Filter by sector
    let filteredData = [...this.reportsData];
    if (this.filterSector) {
      filteredData = filteredData.filter(d => d.sector === this.filterSector);
    }
    
    // Sort data
    if (this.sortBy === 'date') {
      filteredData.sort((a, b) => {
        const dateA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
        const dateB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
        return dateB - dateA;
      });
    } else if (this.sortBy === 'sector') {
      filteredData.sort((a, b) => {
        const sectorA = (a.sectorDisplayName || '').toLowerCase();
        const sectorB = (b.sectorDisplayName || '').toLowerCase();
        return sectorA.localeCompare(sectorB, 'fr');
      });
    }
    
    if (filteredData.length === 0) {
      this.reportsTbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">Aucun rapport trouvé</td>
        </tr>
      `;
      return;
    }
    
    // Build HTML
    let html = '';
    filteredData.forEach(data => {
      const date = formatDate(data.createdAt);
      const sector = data.sectorDisplayName || getSectorDisplayName(data.sector);
      const trail = data.trail || '-';
      
      // Status badge
      let statusHtml = '-';
      if (data.status) {
        const badgeClass = getStatusBadgeClass(data.status);
        statusHtml = `<span class="badge ${badgeClass}">${data.statusDisplayName || getStatusDisplayName(data.status)}</span>`;
      }
      
      // State badges (resolved/archived)
      let stateHtml = '';
      if (data.resolved) {
        stateHtml += '<span class="badge badge-success">Résolu</span> ';
      }
      if (data.archived) {
        stateHtml += '<span class="badge badge-secondary">Archivé</span>';
      }
      if (!data.resolved && !data.archived) {
        stateHtml = '<span class="badge badge-primary">En cours</span>';
      }
      
      html += `
        <tr>
          <td>${date}</td>
          <td>${escapeHtml(sector)}</td>
          <td>${escapeHtml(trail)}</td>
          <td>${statusHtml}</td>
          <td>${escapeHtml(data.inspectorName) || '-'}</td>
          <td>${stateHtml}</td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="adminManager.viewReport('${data.id}')">
              Voir
            </button>
          </td>
        </tr>
      `;
    });
    
    this.reportsTbody.innerHTML = html;
  }
  
  /**
   * View report details in modal
   */
  async viewReport(id) {
    try {
      const doc = await db.collection('signalisations').doc(id).get();
      
      if (!doc.exists) {
        alert('Rapport non trouvé');
        return;
      }
      
      this.currentReportId = id;
      const data = doc.data();
      
      // Build modal content
      const date = formatDate(data.createdAt);
      const modifiedDate = data.modifiedAt ? formatDate(data.modifiedAt) : null;
      const sector = data.sectorDisplayName || getSectorDisplayName(data.sector);
      const trail = data.trail || '-';
      
      // Status display
      let statusHtml = '<p class="text-muted">Non spécifié</p>';
      if (data.status) {
        const badgeClass = getStatusBadgeClass(data.status);
        statusHtml = `<span class="badge ${badgeClass}">${data.statusDisplayName || getStatusDisplayName(data.status)}</span>`;
      }
      
      // Photo display
      let photoHtml = '<p class="text-muted">Aucune photo</p>';
      if (data.photoUrl) {
        photoHtml = `<img src="${data.photoUrl}" alt="Photo" class="signalisation-photo" onclick="window.open('${data.photoUrl}', '_blank')">`;
      }
      
      if (this.modalBody) {
        this.modalBody.innerHTML = `
          <div class="signalisation-details">
            <div class="detail-section">
              <h4>📍 Localisation</h4>
              <p><strong>Secteur:</strong> ${escapeHtml(sector)}</p>
              <p><strong>Piste:</strong> ${escapeHtml(trail)}</p>
            </div>
            
            <div class="detail-section">
              <h4>📊 Statut de la signalisation</h4>
              ${statusHtml}
            </div>
            
            <div class="detail-section">
              <h4>📷 Photo</h4>
              <div class="photos-grid">
                ${photoHtml}
              </div>
            </div>
            
            ${data.comments ? `
            <div class="detail-section">
              <h4>💬 Commentaires de l'inspecteur</h4>
              <p>${escapeHtml(data.comments)}</p>
            </div>
            ` : ''}
            
            <div class="detail-section">
              <h4>👤 Informations</h4>
              <p><strong>Inspecteur:</strong> ${escapeHtml(data.inspectorName) || '-'}</p>
              <p><strong>Créé le:</strong> ${date}</p>
              ${modifiedDate ? `<p><strong>Modifié le:</strong> ${modifiedDate}</p>` : ''}
            </div>
            
            <div class="detail-section">
              <h4>📝 Commentaires administratifs</h4>
              <textarea id="admin-comments" class="form-textarea" rows="4" 
                        placeholder="Entrez les commentaires administratifs...">${escapeHtml(data.adminComments) || ''}</textarea>
              ${data.adminModifiedAt ? 
                `<p class="text-muted" style="margin-top: 0.5rem; font-size: 0.875rem;">
                  Dernière modification admin: ${formatDate(data.adminModifiedAt)}
                </p>` : 
                ''}
            </div>
          </div>
        `;
      }
      
      // Set checkbox states
      if (this.resolvedCheckbox) {
        this.resolvedCheckbox.checked = data.resolved === true;
      }
      if (this.archivedCheckbox) {
        this.archivedCheckbox.checked = data.archived === true;
      }
      
      this.showModal();
      
    } catch (error) {
      console.error('Error loading report:', error);
      alert('Erreur lors du chargement du rapport');
    }
  }
  
  /**
   * Save admin changes (comments, resolved, archived)
   */
  async saveAdminChanges() {
    if (!this.currentReportId) return;
    
    try {
      const commentsEl = document.getElementById('admin-comments');
      const comments = commentsEl ? commentsEl.value.trim() : '';
      const resolved = this.resolvedCheckbox ? this.resolvedCheckbox.checked : false;
      const archived = this.archivedCheckbox ? this.archivedCheckbox.checked : false;
      
      const updateData = {
        adminComments: comments || null,
        resolved: resolved,
        archived: archived,
        adminModifiedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      // Add timestamp for resolved if being set to true
      if (resolved) {
        updateData.resolvedAt = firebase.firestore.FieldValue.serverTimestamp();
      }
      
      // Add timestamp for archived if being set to true
      if (archived) {
        updateData.archivedAt = firebase.firestore.FieldValue.serverTimestamp();
      }
      
      await db.collection('signalisations').doc(this.currentReportId).update(updateData);
      
      showMessage('Modifications enregistrées avec succès', 'success');
      this.hideModal();
      this.loadReports();
      
    } catch (error) {
      console.error('Error saving admin changes:', error);
      showMessage('Erreur lors de l\'enregistrement: ' + error.message, 'error');
    }
  }
  
  /**
   * Show modal
   */
  showModal() {
    if (this.modal) {
      this.modal.style.display = 'flex';
      this.modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }
  
  /**
   * Hide modal
   */
  hideModal() {
    if (this.modal) {
      this.modal.style.display = 'none';
      this.modal.classList.remove('active');
      document.body.style.overflow = '';
    }
    this.currentReportId = null;
  }
}

// Initialize the admin manager
const adminManager = new AdminManager();
