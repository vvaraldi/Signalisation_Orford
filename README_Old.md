# Signalisation_Orford



Priorité 1


Priorité 2

first description of the functionnality

Signalisation_Orford should be a web application very similar to Infraction_Orford (which I added via Github to you knowledge base). Its purpose is to capture signs on ski tracks either via picture or by status ("fermé" ou "attention requise" ou "ouverte") logged as text.
A report page (index.html) and a admin.hmtl should be enough to manage it.
Index should replicate the Infraction_Orford index file to create a report.
	0 - Drop list  - by default on "Nouveau rapport" but will contain all report the user did in the past by date order (from the latest at the top)
	1 - Mandatory - status either or photo. Status is as a drop list for the 3 choices
	2 - Mandatory - Localidation obligatoire for the sector (same as Infraction (secteur)
	3 - Mandatory - trail within the sector (same as Infraction (piste))
	4 - optional - comments
	5 - Inspecteur (entrée automatique comme pour le reporting d'infraction)
	6 - Time stamp Date et heure (entrée automatique comme pour le reporting d'infraction)
	6 - Sauvegarde (or modifier if signaisation report is one from the past which was selected at the top)

Signalisation field should have a tiem stamp for "createdAt" as well as "modifiedAt" in case of modification

Admin page overlook all reports sorted by default by last creation date. possibility to click and view details (like the list in Infraction_Orford) and the possibility to add an admin comments... rest is not editable by admin.
Admin can tick a resolved check box and an archive check box.
Admin can descide to display or not archived report as well as resolved or not report (like Infraction_Orford). By default it should be unticked to mask resolved and archived reports.


complement :
1.1 Projet séparé sur GitHub
1.2 Use the same database (Firebase)
1.3 authentification is shared and managed by Orford_Patrouille which will link to this like it does for Infraction_Orford.  a filed "allowSignalisation" has a boolean to allow access to it.
2.1 list is identical
2.2 Both can be supplied but at least one should be present.
2.3 same logic as Infraction for the picture.
3.1 user can modify this own report only.
3.2 Resolved and Archived are in parallel and not linked
3.3 Ouverte means that people can use the given trail and that signs are inline with this decision.
4.1Admin can't change a status but can add Admin_comments and can click on resolved and archived
4.2 filters... on "secteur" or date created (by default)
4.3 no suppression allowed
5.1 Yes I need a link to menu principal like in INfraction_Orford
5.2 icon should be 🚧
6.1 No duplication for now
6.2 No nothing is public for those.