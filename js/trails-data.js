/**
 * trails-data.js
 * Trail and sector data for Mont Orford
 * Shared between Signalisation and other projects
 */

const TRAILS_DATA = {
  'mont-orford': {
    name: 'Mont-Orford',
    trails: [
      '4 km',
      'Alpage',
      'Arpège',
      'Courant',
      'Coyote',
      'Crocus',
      'Des Caps',
      'Fleur de Lys',
      'Grande Coulée',
      'La Mésange',
      'La Perdrix',
      'Le Chevreuil',
      'Le Lièvre',
      'Le Lynx',
      'Le Wapiti',
      'Liaison',
      'Loustic',
      'Macareux',
      'Mocassin',
      'Normand',
      'Orfordienne',
      'Quatre Vents',
      'Slalom',
      'Sommet',
      'Sous-Bois des Caps',
      'Tempo',
      'Toutou',
      'Tunnel'
    ]
  },
  'giroux-nord': {
    name: 'Mont Giroux Nord',
    trails: [
      'Boréale',
      'Escapade',
      'Grande Allée',
      'Les Bosquets',
      'Panoramique',
      'Pic-Bois',
      'Plein Vent',
      'Prélude',
      'Promenade',
      'Sous-Bois Giroux'
    ]
  },
  'giroux-est': {
    name: 'Mont Giroux Est',
    trails: [
      'De Là-Haut',
      'Détour',
      'La Longue',
      'Le Raccourci',
      'Les Aventuriers',
      'Nord-Est',
      'Panorama',
      'Retour Est',
      'Sol-Bois',
      'Sur La Crête'
    ]
  },
  'alfred-desrochers': {
    name: 'Mont Alfred-DesRochers',
    trails: [
      'Alfred',
      'Chemin de la Montagne',
      'Contour',
      'Des Écoliers',
      'Grand Duc',
      'Jonction Alfred',
      'La Familiale',
      'La Seigneuriale',
      'L\'Écureuil',
      'L\'Orignal',
      'Les Découvreurs',
      'Les Pionniers',
      'Petite Sœur',
      'Trappeur'
    ]
  },
  'remontees': {
    name: 'Remontées mécaniques',
    trails: [
      'Télésiège du Sommet',
      'Télésiège Giroux',
      'Télésiège Alfred',
      'Télésiège École',
      'Téléski T-Bar',
      'Tapis Roulant 1',
      'Tapis Roulant 2'
    ]
  },
  'randonnee-alpine': {
    name: 'Randonnée alpine',
    trails: [
      'Sentier du Mont-Orford',
      'Sentier du Lac Stukely',
      'Sentier des Crêtes',
      'Sentier du Vieux-Moulin',
      'Boucle du Lac Fraser'
    ]
  }
};

/**
 * Get trails for a specific sector
 * @param {string} sectorId - The sector ID
 * @returns {Array} Array of trail names
 */
function getTrailsForSector(sectorId) {
  const sector = TRAILS_DATA[sectorId];
  return sector ? sector.trails : [];
}

/**
 * Get sector name by ID
 * @param {string} sectorId - The sector ID
 * @returns {string} Sector display name
 */
function getSectorName(sectorId) {
  const sector = TRAILS_DATA[sectorId];
  return sector ? sector.name : '';
}

/**
 * Get all sectors as options
 * @returns {Array} Array of {id, name} objects
 */
function getAllSectors() {
  return Object.keys(TRAILS_DATA).map(id => ({
    id: id,
    name: TRAILS_DATA[id].name
  }));
}

/**
 * Populate trail select based on sector selection
 * @param {HTMLSelectElement} sectorSelect - Sector select element
 * @param {HTMLSelectElement} trailSelect - Trail select element
 */
function setupSectorTrailSelects(sectorSelect, trailSelect) {
  if (!sectorSelect || !trailSelect) return;
  
  sectorSelect.addEventListener('change', function() {
    const sectorId = this.value;
    
    // Clear and reset trail select
    trailSelect.innerHTML = '<option value="">-- Sélectionner une piste --</option>';
    
    if (sectorId && TRAILS_DATA[sectorId]) {
      const trails = TRAILS_DATA[sectorId].trails;
      trails.forEach(trail => {
        const option = document.createElement('option');
        option.value = trail;
        option.textContent = trail;
        trailSelect.appendChild(option);
      });
      trailSelect.disabled = false;
    } else {
      trailSelect.innerHTML = '<option value="">-- Sélectionner d\'abord un secteur --</option>';
      trailSelect.disabled = true;
    }
  });
}
