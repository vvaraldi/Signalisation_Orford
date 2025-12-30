/**
 * signalisation.js
 * Signalisation report form functionality
 */

class SignalisationForm {
  constructor() {
    this.currentReportId = null;
    this.isNewReport = true;
    this.photoFile = null;
    this.photoUrl = null;
    
    // Wait for authentication
    document.addEventListener('userAuthenticated', (e) => {
      this.userData = e.detail;
      this.init();
    });
  }
  
  init() {
    this.bindElements();
    this.bindEvents();
    this.setDefaultValues();
    this.loadUserReports();
  }
  
  bindElements() {
    // Form elements
    this.form = document.getElementById('signalisation-form');
    this.surveySelector = document.getElementById('survey-selector');
    this.saveBtn = document.getElementById('save-btn');
    this.modifyBtn = document.getElementById('modify-btn');
    
    // Form fields
    this.statusSelect = document.getElementById('status-select');
    this.sectorSelect = document.getElementById('sector-select');
    this.trailSelect = document.getElementById('trail-select');
    this.comments = document.getElementById('comments');
    this.inspectorName = document.getElementById('inspector-name');
    this.reportDatetime = document.getElementById('report-datetime');
    
    // Photo elements
    this.photoInput = document.getElementById('sign-photo');
    this.capturePhotoBtn = document.getElementById('capture-photo-btn');
    this.photoPreviewContainer = document.getElementById('photo-preview-container');
    this.photoPreview = document.getElementById('photo-preview');
    this.removePhotoBtn = document.getElementById('remove-photo-btn');
  }
  
  bindEvents() {
    // Survey selector change
    this.surveySelector.addEventListener('change', (e) => this.handleSurveyChange(e));
    
    // Sector change - populate trails
    setupSectorTrailSelects(this.sectorSelect, this.trailSelect);
    
    // Photo capture
    this.capturePhotoBtn.addEventListener('click', () => this.photoInput.click());
    this.photoInput.addEventListener('change', (e) => this.handlePhotoSelect(e));
    this.removePhotoBtn.addEventListener('click', () => this.removePhoto());
    
    // Form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.modifyBtn.addEventListener('click', () => this.handleModify());
  }
  
  setDefaultValues() {
    // Set inspector name
    this.inspectorName.value = this.userData.name || '';
    
    // Set current date and time
    const now = new Date();
    this.reportDatetime.value = formatDate({ toDate: () => now });
  }
  
  /**
   * Load user's previous reports
   */
  async loadUserReports() {
    try {
      const userId = getCurrentUserId();
      const snapshot = await db.collection('signalisations')
        .where('inspectorId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();
      
      // Clear existing options except "new"
      while (this.surveySelector.options.length > 1) {
        this.surveySelector.remove(1);
      }
      
      // Add reports to selector
      snapshot.forEach(doc => {
        const data = doc.data();
        const date = formatDateShort(data.createdAt);
        const trail = data.trail || 'N/A';
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = `${date} - ${trail}`;
        this.surveySelector.appendChild(option);
      });
      
    } catch (error) {
      console.error('Error loading reports:', error);
      showMessage('Erreur lors du chargement des rapports', 'error');
    }
  }
  
  /**
   * Handle survey selector change
   */
  async handleSurveyChange(e) {
    const selectedId = e.target.value;
    
    if (selectedId === 'new') {
      this.resetForm();
      return;
    }
    
    // Load selected report
    try {
      const doc = await db.collection('signalisations').doc(selectedId).get();
      
      if (doc.exists) {
        this.populateForm(doc.id, doc.data());
      }
      
    } catch (error) {
      console.error('Error loading report:', error);
      showMessage('Erreur lors du chargement du rapport', 'error');
    }
  }
  
  /**
   * Populate form with existing report data
   */
  populateForm(id, data) {
    this.currentReportId = id;
    this.isNewReport = false;
    
    // Show/hide buttons
    this.saveBtn.style.display = 'none';
    this.modifyBtn.style.display = '';
    
    // Populate fields
    this.statusSelect.value = data.status || '';
    
    // Populate sector and trail
    if (data.sector) {
      this.sectorSelect.value = data.sector;
      // Trigger change to populate trails
      this.sectorSelect.dispatchEvent(new Event('change'));
      
      // Wait a tick for trails to load, then set trail
      setTimeout(() => {
        if (data.trail) {
          this.trailSelect.value = data.trail;
        }
      }, 100);
    }
    
    this.comments.value = data.comments || '';
    
    // Handle photo
    if (data.photoUrl) {
      this.photoUrl = data.photoUrl;
      this.photoPreview.src = data.photoUrl;
      this.photoPreviewContainer.style.display = '';
      this.capturePhotoBtn.textContent = '📷 Changer la photo';
    } else {
      this.removePhoto();
    }
    
    showMessage('Rapport chargé. Modifiez les champs nécessaires et enregistrez.', 'info');
  }
  
  /**
   * Handle photo selection
   */
  async handlePhotoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      // Compress image
      const compressedBlob = await compressImage(file);
      this.photoFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });
      
      // Show preview
      this.photoPreview.src = URL.createObjectURL(this.photoFile);
      this.photoPreviewContainer.style.display = '';
      this.capturePhotoBtn.textContent = '📷 Changer la photo';
      
    } catch (error) {
      console.error('Error processing photo:', error);
      showMessage('Erreur lors du traitement de la photo', 'error');
    }
  }
  
  /**
   * Remove photo
   */
  removePhoto() {
    this.photoFile = null;
    this.photoUrl = null;
    this.photoInput.value = '';
    this.photoPreviewContainer.style.display = 'none';
    this.capturePhotoBtn.textContent = '📷 Prendre une photo';
  }
  
  /**
   * Upload photo to Firebase Storage
   */
  async uploadPhoto() {
    if (!this.photoFile) return this.photoUrl;
    
    const timestamp = Date.now();
    const fileName = `signalisations/${getCurrentUserId()}/${timestamp}_${this.photoFile.name}`;
    const storageRef = storage.ref(fileName);
    
    const snapshot = await storageRef.put(this.photoFile);
    return await snapshot.ref.getDownloadURL();
  }
  
  /**
   * Validate form - status OR photo required, sector and trail required
   */
  validateForm() {
    let isValid = true;
    const errors = [];
    
    // Check status OR photo (at least one required)
    const hasStatus = this.statusSelect.value !== '';
    const hasPhoto = this.photoFile !== null || this.photoUrl !== null;
    
    if (!hasStatus && !hasPhoto) {
      isValid = false;
      errors.push('Un statut OU une photo est requis');
      this.statusSelect.classList.add('is-invalid');
      this.capturePhotoBtn.classList.add('is-invalid');
    } else {
      this.statusSelect.classList.remove('is-invalid');
      this.capturePhotoBtn.classList.remove('is-invalid');
    }
    
    // Check sector (required)
    if (!this.sectorSelect.value) {
      isValid = false;
      errors.push('Le secteur est requis');
      this.sectorSelect.classList.add('is-invalid');
    } else {
      this.sectorSelect.classList.remove('is-invalid');
    }
    
    // Check trail (required)
    if (!this.trailSelect.value) {
      isValid = false;
      errors.push('La piste est requise');
      this.trailSelect.classList.add('is-invalid');
    } else {
      this.trailSelect.classList.remove('is-invalid');
    }
    
    // Show errors if any
    if (!isValid) {
      showMessage(errors.join('<br>'), 'error');
    }
    
    return isValid;
  }
  
  /**
   * Handle form submission (new report)
   */
  async handleSubmit(e) {
    e.preventDefault();
    
    if (!this.isNewReport) return;
    
    // Validate form
    if (!this.validateForm()) {
      return;
    }
    
    setButtonLoading(this.saveBtn, true);
    
    try {
      // Upload photo if exists
      const photoUrl = await this.uploadPhoto();
      
      // Prepare data
      const reportData = {
        inspectorId: getCurrentUserId(),
        inspectorName: this.userData.name,
        status: this.statusSelect.value || null,
        statusDisplayName: this.statusSelect.value ? getStatusDisplayName(this.statusSelect.value) : null,
        photoUrl: photoUrl || null,
        sector: this.sectorSelect.value,
        sectorDisplayName: getSectorDisplayName(this.sectorSelect.value),
        trail: this.trailSelect.value,
        comments: this.comments.value.trim() || null,
        resolved: false,
        archived: false,
        adminComments: null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        modifiedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      // Save to Firestore
      const docRef = await db.collection('signalisations').add(reportData);
      
      showMessage('Rapport enregistré avec succès!', 'success');
      
      // Reset form
      this.resetForm();
      
      // Reload reports list
      await this.loadUserReports();
      
    } catch (error) {
      console.error('Error saving report:', error);
      showMessage('Erreur lors de l\'enregistrement du rapport: ' + error.message, 'error');
    } finally {
      setButtonLoading(this.saveBtn, false);
    }
  }
  
  /**
   * Handle modification of existing report
   */
  async handleModify() {
    if (!this.currentReportId) return;
    
    // Validate form
    if (!this.validateForm()) {
      return;
    }
    
    setButtonLoading(this.modifyBtn, true);
    
    try {
      // Upload new photo if exists
      const photoUrl = await this.uploadPhoto();
      
      // Prepare update data
      const updateData = {
        status: this.statusSelect.value || null,
        statusDisplayName: this.statusSelect.value ? getStatusDisplayName(this.statusSelect.value) : null,
        photoUrl: photoUrl || this.photoUrl || null,
        sector: this.sectorSelect.value,
        sectorDisplayName: getSectorDisplayName(this.sectorSelect.value),
        trail: this.trailSelect.value,
        comments: this.comments.value.trim() || null,
        modifiedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      // Update in Firestore
      await db.collection('signalisations').doc(this.currentReportId).update(updateData);
      
      showMessage('Modifications enregistrées!', 'success');
      
      // Reload reports list
      await this.loadUserReports();
      
    } catch (error) {
      console.error('Error updating report:', error);
      showMessage('Erreur lors de la modification', 'error');
    } finally {
      setButtonLoading(this.modifyBtn, false);
    }
  }
  
  /**
   * Reset form to default state
   */
  resetForm() {
    this.currentReportId = null;
    this.isNewReport = true;
    
    // Show/hide buttons
    this.saveBtn.style.display = '';
    this.modifyBtn.style.display = 'none';
    
    // Reset selector
    this.surveySelector.value = 'new';
    
    // Reset fields
    this.setDefaultValues();
    this.statusSelect.value = '';
    this.sectorSelect.value = '';
    this.trailSelect.innerHTML = '<option value="">-- Sélectionner d\'abord un secteur --</option>';
    this.trailSelect.disabled = true;
    this.comments.value = '';
    
    // Reset photo
    this.removePhoto();
    
    // Remove validation classes
    this.statusSelect.classList.remove('is-invalid');
    this.sectorSelect.classList.remove('is-invalid');
    this.trailSelect.classList.remove('is-invalid');
    this.capturePhotoBtn.classList.remove('is-invalid');
  }
}

// Initialize signalisation form
const signalisationForm = new SignalisationForm();
