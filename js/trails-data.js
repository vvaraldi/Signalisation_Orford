/**
 * trails-data.js
 * Trail and sector data for Mont Orford
 * Shared between Signalisation and other projects
 */

const TRAILS_DATA = {
  'mont-orford': {
    name: 'Mont-Orford',
    trails: [
      'Trois Ruisseaux',
      'Grande Coulée',
      'Inter',
      'Maxi',
      '4 KM',
      'Escapade',
      'Boisée',
      'Balade',
      'Connection',
      'Passe-Partout',
      'Belette',
      'L\'Initiation',
      'Mini-Passe',
      'Super Bas',
      'Contour',
      'L\'Intrépide',
      'Passe de l\'Ours',
      'Chevreuil',
      'Porc-Épic',
      'Passe à Liguori',
      'Petit Canyon',
      'L\'Orignal',
      'L\'Écureuil',
      'Arcade',
      'L\'Entre-Deux',
      'Diversion',
      'Rochers Jumeaux',
      'Express',
      'Passe',
      'Parc familial'
    ]
  },
  'giroux-nord': {
    name: 'Mont Giroux Nord',
    trails: [
      'Magog',
      'Familiale',
      'Jean-d\'Avignon',
      'Pente Douce',
      'Magnum',
      'Parc principal',
      'Parc Découverte',
      'La 45',
      'Mitaine',
      'La Passe 45',
      'Forêt magique',
      'Accès',
      'L\'Alternative',
      'Petite Coulée',
      'Gagnon',
      'Bowen',
      'Lièvre',
      'Adams'
    ]
  },
  'giroux-est': {
    name: 'Mont Giroux Est',
    trails: [
      'Sherbrooke',
      'Slalom',
      'Passe Montagne',
      'Labrecque',
      'Lacroix',
      'Dubreuil',
      'Boogie',
      'Sasquatch',
      'Nicolas Fontaine',
      'Lloyd Langlois'
    ]
  },
  'alfred-desrochers': {
    name: 'Mont Alfred-DesRochers',
    trails: [
      'Petite Ours',
      'Descente',
      'Le Lien',
      'Ookpic',
      'Grande-Allée',
      'Cascade',
      'Toussiski'
    ]
  },
  'remontees': {
    name: 'Remontées mécaniques',
    trails: [
      'Rapido',
      'Hybride',
      'Alfred-Desrochers',
      'Quad Giroux Nord',
      'Tapis Giroux Nord',
      'Quad Giroux Est'
    ]
  },
  'randonnee-alpine': {
    name: 'Randonnée alpine',
    trails: [
      'La tortue',
      'Le Renard',
      'Le tracé du Lynx',
      'Le lièvre',
      'Le campagnol',
      'La mille-Pattes',
      'L\'hermine',
      'L\'alouette',
      'L\'adams',
      'La carcajou',
      'L\'urubu'
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
