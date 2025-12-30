# Signalisation_Orford

Application web de gestion des rapports de signalisation pour le Mont Orford.

## 🚧 Description

Cette application permet aux patrouilleurs de capturer l'état de la signalisation sur les pistes de ski via:
- **Photo** de la signalisation
- **Statut** (Ouverte / Attention requise / Fermée)

Les rapports sont ensuite consultables et gérables via une interface d'administration.

## 📁 Structure du projet

```
Signalisation_Orford/
├── index.html              # Page principale de rapport
├── pages/
│   └── admin.html          # Page d'administration
├── css/
│   └── main.css            # Styles CSS
├── js/
│   ├── common.js           # Fonctions utilitaires
│   ├── auth.js             # Authentification Firebase
│   ├── trails-data.js      # Données des secteurs/pistes
│   ├── signalisation.js    # Logique du formulaire
│   └── admin.js            # Logique admin
└── README.md
```

## 🔐 Authentification

L'application utilise le système d'authentification partagé avec:
- **Orford_Patrouille** (portail principal)
- **Infraction_Orford**
- **Inspection_Orford**

### Accès requis

Pour accéder à Signalisation_Orford, les utilisateurs doivent avoir:
- Un compte actif dans la collection `inspectors`
- Le champ `allowSignalisation: true` dans leur profil

## 📊 Structure des données Firebase

### Collection: `signalisations`

```javascript
{
  inspectorId: string,          // UID de l'inspecteur
  inspectorName: string,        // Nom de l'inspecteur
  status: string | null,        // 'ouverte' | 'attention-requise' | 'fermee'
  statusDisplayName: string,    // Nom d'affichage du statut
  photoUrl: string | null,      // URL de la photo (Firebase Storage)
  sector: string,               // ID du secteur
  sectorDisplayName: string,    // Nom d'affichage du secteur
  trail: string,                // Nom de la piste
  comments: string | null,      // Commentaires de l'inspecteur
  resolved: boolean,            // Marqué comme résolu par admin
  archived: boolean,            // Archivé par admin
  adminComments: string | null, // Commentaires admin
  createdAt: Timestamp,         // Date de création
  modifiedAt: Timestamp,        // Date de modification
  resolvedAt: Timestamp | null, // Date de résolution
  archivedAt: Timestamp | null, // Date d'archivage
  adminModifiedAt: Timestamp    // Date modification admin
}
```

## 🛡️ Règles Firebase

Ajouter ces règles à votre configuration Firebase:

```javascript
// Collection signalisations
match /signalisations/{signalisationId} {
  // Lecture: utilisateurs authentifiés
  allow read: if request.auth != null;
  
  // Création: utilisateurs authentifiés
  allow create: if request.auth != null;
  
  // Modification: propriétaire ou admin
  allow update: if request.auth != null && 
      (request.auth.uid == resource.data.inspectorId || 
      get(/databases/$(database)/documents/inspectors/$(request.auth.uid)).data.role == 'admin');
  
  // Suppression: admin uniquement
  allow delete: if request.auth != null &&
      get(/databases/$(database)/documents/inspectors/$(request.auth.uid)).data.role == 'admin';
}
```

## ✨ Fonctionnalités

### Page Rapport (index.html)

- **Sélecteur de rapport**: Nouveau ou existant (pour modification)
- **Statut**: Liste déroulante (Ouverte/Attention requise/Fermée)
- **Photo**: Capture via caméra ou sélection de fichier
- **Localisation**: Secteur + Piste (obligatoires)
- **Commentaires**: Optionnels
- **Inspecteur**: Rempli automatiquement
- **Date/Heure**: Timestamp automatique

### Page Admin (pages/admin.html)

- **Liste des rapports**: Tableau triable et filtrable
- **Filtres**: 
  - Par secteur
  - Afficher/masquer les résolus
  - Afficher/masquer les archivés
- **Tri**: Par date ou par secteur
- **Modal détail**: 
  - Visualisation complète du rapport
  - Commentaires admin
  - Checkbox Résolu
  - Checkbox Archivé

## 🔗 Intégration

### Menu Principal (Orford_Patrouille)

Ajouter le lien vers Signalisation_Orford avec l'icône 🚧

### Champ utilisateur

Ajouter le champ `allowSignalisation: boolean` aux utilisateurs dans la collection `inspectors`.

## 📱 Responsive

L'application est entièrement responsive avec:
- Navigation mobile avec menu hamburger
- Formulaires adaptés aux écrans tactiles
- Tableaux scrollables sur mobile

## 🎨 Thème

Couleur principale: **Orange (#d97706)** - Thème construction/signalisation
