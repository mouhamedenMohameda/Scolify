# Modules Métiers - School Administration System

## Vue d'ensemble

Ce document détaille tous les modules métiers de l'application, leurs objectifs, workflows, règles métier et interfaces utilisateur.

---

## A. Gestion Établissement & Années Scolaires

### Objectifs
- Gérer la configuration de base de l'école (tenant)
- Définir les années scolaires, périodes, calendrier
- Gérer les ressources (salles, équipements)

### Pages UI
- `/admin/school/settings` : Paramètres école (nom, logo, adresse, contacts)
- `/admin/school/campuses` : Gestion campus (si multi-campus)
- `/admin/school/academic-years` : Création/édition années scolaires
- `/admin/school/periods` : Configuration périodes (trimestres/semestres)
- `/admin/school/calendar` : Calendrier scolaire (jours fériés, vacances)
- `/admin/school/schedule` : Horaires généraux (début/fin journée, récréations)
- `/admin/school/rooms` : Gestion salles et ressources
- `/admin/school/levels` : Niveaux scolaires (CP, CE1, ..., Terminale)

### Objets Métiers
- `School` : École (tenant)
- `Campus` : Site géographique (optionnel)
- `AcademicYear` : Année scolaire (ex: 2024-2025)
- `Period` : Période d'évaluation (Trimestre 1, Semestre 1, etc.)
- `CalendarEvent` : Événement calendrier (vacances, jours fériés, événements)
- `ScheduleTemplate` : Template horaires
- `Room` : Salle (classe, labo, salle polyvalente)
- `Resource` : Ressource (projecteur, équipement)

### Workflows
1. **Création école** : Admin plateforme crée tenant → Admin école configure
2. **Année scolaire** : Création → Activation → Clôture (archivage)
3. **Calendrier** : Import depuis fichier ou création manuelle
4. **Salles** : Création → Affectation capacité → Disponibilité

### Règles Métier
- Une seule année scolaire active par école à la fois
- Les périodes doivent être contiguës et non chevauchantes
- Les salles peuvent être réservées pour des créneaux spécifiques
- Le calendrier bloque les créations de cours sur jours fériés

---

## B. Gestion Élèves & Admissions

### Objectifs
- Gérer le processus d'inscription/préinscription
- Maintenir les dossiers élèves complets
- Gérer les liens parents/tuteurs et autorisations

### Pages UI
- `/admin/students` : Liste élèves (filtres, recherche)
- `/admin/students/new` : Formulaire inscription
- `/admin/students/[id]` : Dossier élève complet
- `/admin/students/[id]/documents` : Pièces jointes
- `/admin/students/[id]/health` : Informations santé/allergies
- `/admin/admissions` : Préinscriptions en attente
- `/admin/admissions/[id]` : Traitement préinscription
- `/admin/guardians` : Gestion parents/tuteurs
- `/admin/students/[id]/guardians` : Liens parents-élève

### Objets Métiers
- `Student` : Élève
- `PreEnrollment` : Préinscription (workflow avant validation)
- `Enrollment` : Inscription active (lien élève ↔ année scolaire ↔ classe)
- `Guardian` : Parent/Tuteur
- `StudentGuardian` : Lien élève-parent (avec type : père, mère, tuteur, etc.)
- `StudentDocument` : Pièce jointe (certificat, photo, etc.)
- `HealthRecord` : Informations santé (allergies, médicaments, restrictions)
- `Consent` : Consentements RGPD (photo, communication, etc.)

### Workflows
1. **Préinscription** :
   - Parent remplit formulaire → Préinscription créée
   - Secrétariat vérifie documents → Validation/Rejet
   - Si validé → Inscription créée → Matricule généré

2. **Inscription** :
   - Création dossier élève → Upload documents
   - Affectation classe → Génération matricule
   - Notification parents (accès compte)

3. **Transfert** :
   - Demande transfert → Validation admin
   - Export dossier → Import autre école (ou suppression)

4. **Radiations** :
   - Changement statut → Archivage données (RGPD)
   - Rétention configurable (ex: 5 ans)

### Règles Métier
- Matricule unique par école (format: `SCHOOL-YYYY-NNNN`)
- Un élève peut avoir plusieurs tuteurs (parents séparés)
- Autorisations parentales : qui peut récupérer enfant, autoriser sortie, etc.
- Documents obligatoires : certificat naissance, photo, certificat médical (selon pays)
- Statuts : `PRE_ENROLLED`, `ENROLLED`, `SUSPENDED`, `TRANSFERRED`, `GRADUATED`, `DROPPED_OUT`

---

## C. Gestion Classes, Groupes & Scolarité

### Objectifs
- Organiser les élèves en classes et groupes
- Gérer les affectations, passages, redoublements

### Pages UI
- `/admin/classes` : Liste classes (par niveau, année)
- `/admin/classes/new` : Création classe
- `/admin/classes/[id]` : Détail classe (élèves, EDT, profs)
- `/admin/classes/[id]/students` : Affectation élèves
- `/admin/groups` : Groupes (TP, TD, options)
- `/admin/students/[id]/history` : Historique scolarité

### Objets Métiers
- `Class` : Classe (ex: "6ème A", "CM2 B")
- `Group` : Groupe (ex: "TP Math", "Option Latin")
- `Level` : Niveau scolaire (CP, CE1, ..., Terminale)
- `Stream` : Filière (Générale, Pro, Technique)
- `ClassEnrollment` : Affectation élève ↔ classe (avec dates)
- `Promotion` : Passage niveau supérieur (batch)
- `Retention` : Redoublement

### Workflows
1. **Création classe** :
   - Sélection niveau → Nom classe → Capacité max
   - Affectation professeur principal

2. **Affectation élèves** :
   - Sélection élèves → Assignation classe
   - Vérification capacité → Notification parents

3. **Passage/Redoublement** :
   - Fin année → Évaluation élèves
   - Décision passage/redoublement → Batch update
   - Création nouvelles classes année suivante

4. **Groupes** :
   - Création groupe (ex: TP Math) → Affectation élèves depuis plusieurs classes
   - Utilisé pour EDT et évaluations

### Règles Métier
- Capacité max par classe (configurable)
- Un élève ne peut être dans qu'une seule classe principale par période
- Les groupes peuvent mélanger élèves de différentes classes
- Historique complet conservé (audit trail)

---

## D. Professeurs & RH

### Objectifs
- Gérer les professeurs et leurs affectations
- Suivre les matières, charges horaires, disponibilités
- Gérer absences et remplacements

### Pages UI
- `/admin/teachers` : Liste professeurs
- `/admin/teachers/new` : Création professeur
- `/admin/teachers/[id]` : Dossier professeur
- `/admin/teachers/[id]/assignments` : Affectations (classes, matières)
- `/admin/teachers/[id]/schedule` : EDT professeur
- `/admin/subjects` : Matières enseignées
- `/admin/teachers/absences` : Gestion absences profs
- `/admin/teachers/substitutions` : Remplacements

### Objets Métiers
- `Teacher` : Professeur (hérite de User)
- `Subject` : Matière (Math, Français, etc.)
- `TeacherAssignment` : Affectation prof ↔ classe ↔ matière
- `TeachingLoad` : Charge horaire (heures/semaine)
- `TeacherAbsence` : Absence professeur
- `Substitution` : Remplacement (prof remplaçant, période)

### Workflows
1. **Création professeur** :
   - Création compte → Affectation matières
   - Définition charge horaire → Génération EDT (optionnel)

2. **Affectation** :
   - Sélection classe + matière → Assignation professeur
   - Vérification disponibilité → Confirmation

3. **Absence/Remplacement** :
   - Déclaration absence → Recherche remplaçant
   - Affectation remplaçant → Notification classes concernées

### Règles Métier
- Un professeur peut enseigner plusieurs matières
- Charge horaire totale ≤ contrat (si RH activé)
- Les remplacements doivent respecter les compétences (matières)
- Historique des affectations conservé

---

## E. Emploi du Temps (Scheduling)

### Objectifs
- Générer et gérer les emplois du temps
- Résoudre les conflits (prof/salle/classe)
- Gérer les exceptions et récurrences

### Pages UI
- `/admin/timetable` : Vue d'ensemble EDT
- `/admin/timetable/generator` : Générateur automatique (V2)
- `/admin/timetable/classes/[id]` : EDT classe
- `/admin/timetable/teachers/[id]` : EDT professeur
- `/admin/timetable/rooms/[id]` : Réservations salle
- `/admin/timetable/conflicts` : Détection conflits
- `/teacher/timetable` : Mon EDT (prof)
- `/student/timetable` : Mon EDT (élève)

### Objets Métiers
- `Timetable` : Emploi du temps (année scolaire, période)
- `TimetableSlot` : Créneau (jour, heure, classe, matière, prof, salle)
- `TimetableException` : Exception (annulation, déplacement)
- `RecurrencePattern` : Pattern récurrence (semaines A/B, alternance)

### Workflows
1. **Création EDT** :
   - Sélection période → Classes concernées
   - Génération manuelle ou automatique (V2)
   - Vérification conflits → Résolution

2. **Modification** :
   - Édition créneau → Vérification disponibilités
   - Notification parties prenantes (prof, élèves, parents)

3. **Exceptions** :
   - Annulation cours → Notification
   - Déplacement salle → Mise à jour

### Règles Métier
- Pas de chevauchement : un prof ne peut être à 2 endroits
- Pas de chevauchement : une classe ne peut avoir 2 cours simultanés
- Réservation salle : vérification disponibilité
- Semaines A/B : alternance de créneaux (ex: TP alternés)

---

## F. Présences & Absences

### Objectifs
- Enregistrer les présences/absences par cours
- Gérer les retards et justificatifs
- Notifier les parents automatiquement

### Pages UI
- `/teacher/attendance` : Pointage par cours
- `/teacher/attendance/[classId]` : Liste élèves avec pointage
- `/admin/attendance/overview` : Vue d'ensemble (stats)
- `/admin/attendance/justifications` : Validation justificatifs
- `/admin/attendance/reports` : Rapports et exports
- `/parent/attendance` : Absences de mes enfants
- `/student/attendance` : Mes absences

### Objets Métiers
- `AttendanceRecord` : Enregistrement présence (cours, élève, statut)
- `AbsenceReason` : Raison absence (maladie, autorisée, etc.)
- `Justification` : Justificatif (document, raison, validé)
- `LateArrival` : Retard (durée, raison)

### Workflows
1. **Pointage** :
   - Professeur ouvre appel → Liste élèves classe
   - Coche présent/absent/retard → Enregistrement
   - Si absent → Notification parent automatique (SMS/Email)

2. **Justification** :
   - Parent upload justificatif → Statut "en attente"
   - Secrétariat valide/rejette → Notification parent

3. **Rapports** :
   - Calcul statistiques (taux présence, absences répétées)
   - Alertes : seuil absences non justifiées
   - Exports officiels (pour administration)

### Règles Métier
- Pointage obligatoire pour chaque cours (ou par journée selon config)
- Seuil d'alerte : X absences non justifiées → alerte admin
- Justificatifs : délai de dépôt (ex: 48h)
- Absences répétées : workflow escalade (prof → admin → direction)

---

## G. Notes, Évaluations & Bulletins

### Objectifs
- Saisir les notes et évaluations
- Calculer moyennes et classements
- Générer bulletins PDF

### Pages UI
- `/teacher/grades` : Mes évaluations
- `/teacher/grades/new` : Création évaluation
- `/teacher/grades/[id]` : Saisie notes
- `/admin/grades/overview` : Vue d'ensemble notes
- `/admin/grades/report-cards` : Génération bulletins
- `/admin/grades/report-cards/[id]` : Bulletin individuel (PDF)
- `/parent/grades` : Notes de mes enfants
- `/student/grades` : Mes notes

### Objets Métiers
- `Assessment` : Évaluation (devoir, contrôle, oral)
- `Grade` : Note (élève, évaluation, note, coefficient)
- `Competency` : Compétence (socle commun, référentiel)
- `CompetencyGrade` : Évaluation compétence
- `ReportCard` : Bulletin (période, élève, moyennes, appréciations)
- `Comment` : Appréciation (professeur, matière, période)
- `GradingScale` : Barème (0-20, A-F, %, etc.)

### Workflows
1. **Création évaluation** :
   - Professeur crée évaluation → Définit barème, coefficient, date
   - Sélection classe → Publication (visible élèves/parents)

2. **Saisie notes** :
   - Ouverture évaluation → Liste élèves
   - Saisie notes → Validation → Calcul moyenne automatique

3. **Bulletin** :
   - Fin période → Génération bulletins (batch job)
   - Calcul moyennes par matière → Appréciations profs
   - Génération PDF → Notification parents

4. **Conseil de classe** :
   - Préparation conseil → Export notes/comportement
   - Décisions (passage, mention) → Enregistrement

### Règles Métier
- Barème configurable par école (0-20, A-F, %, etc.)
- Coefficients : pondération par matière
- Moyenne générale : calcul automatique (moyennes pondérées)
- Mentions : Assez Bien, Bien, Très Bien (selon moyenne)
- Contrôle de saisie : notes dans barème valide
- Appréciations : obligatoires pour bulletin (selon config)

---

## H. Discipline & Vie Scolaire

### Objectifs
- Enregistrer les incidents et sanctions
- Suivre le comportement des élèves
- Communiquer avec les parents

### Pages UI
- `/admin/discipline/incidents` : Liste incidents
- `/admin/discipline/incidents/new` : Création incident
- `/admin/discipline/sanctions` : Sanctions appliquées
- `/admin/discipline/students/[id]` : Historique discipline élève
- `/admin/discipline/reports` : Rapports comportement
- `/parent/discipline` : Incidents de mes enfants

### Objets Métiers
- `Incident` : Incident (date, élève(s), type, description, témoins)
- `Sanction` : Sanction (avertissement, retenue, exclusion, etc.)
- `DisciplinaryRecord` : Enregistrement discipline (lien incident ↔ sanction)
- `BehaviorNote` : Note comportement (positive/négative)

### Workflows
1. **Déclaration incident** :
   - Surveillant/Prof déclare → Formulaire (type, description, élèves impliqués)
   - Enregistrement → Notification admin/discipline

2. **Traitement** :
   - Admin discipline examine → Décision sanction
   - Application sanction → Notification parents
   - Suivi : vérification efficacité

3. **Historique** :
   - Consultation historique élève → Patterns comportement
   - Alertes : seuil incidents → réunion parents

### Règles Métier
- Types incidents : bagarre, insulte, tricherie, absentéisme, etc.
- Sanctions : avertissement oral, écrit, retenue, exclusion temporaire/définitive
- Escalade : X avertissements → sanction plus sévère
- Communication parents : obligatoire pour sanctions graves

---

## I. Communication & Notifications

### Objectifs
- Messagerie interne entre utilisateurs
- Annonces générales ou ciblées
- Notifications automatiques (emails, SMS)

### Pages UI
- `/messages` : Boîte de réception
- `/messages/[threadId]` : Conversation
- `/messages/new` : Nouveau message
- `/admin/announcements` : Gestion annonces
- `/admin/announcements/new` : Création annonce
- `/notifications` : Centre notifications
- `/admin/notifications/templates` : Modèles notifications

### Objets Métiers
- `MessageThread` : Fil de conversation (participants)
- `Message` : Message individuel (auteur, contenu, pièces jointes, lu)
- `Announcement` : Annonce (titre, contenu, destinataires, dates)
- `Notification` : Notification système (type, destinataire, lu, action)
- `NotificationTemplate` : Modèle (email, SMS, in-app)

### Workflows
1. **Messagerie** :
   - Envoi message → Création thread si nouveau
   - Notification destinataire → Réponse possible
   - Pièces jointes : upload fichiers

2. **Annonces** :
   - Création annonce → Sélection destinataires (tous, classe, niveau)
   - Publication → Notification push + email
   - Expiration : date de fin affichage

3. **Notifications automatiques** :
   - Événements déclencheurs : absence, note publiée, devoir, facture
   - Génération notification → Envoi selon préférences utilisateur
   - Centre notifications : historique consultable

### Règles Métier
- Messagerie : prof ↔ parent, admin ↔ tous, élève ↔ prof/parent
- Annonces : admin peut cibler (classe, niveau, tous)
- Notifications : préférences utilisateur (email/SMS/push)
- Rétention messages : configurable (ex: 2 ans)

---

## J. Devoirs & Contenus (Mini-LMS)

### Objectifs
- Publier devoirs avec consignes et pièces jointes
- Gérer les rendus élèves (optionnel)
- Suivre les corrections

### Pages UI
- `/teacher/homework` : Mes devoirs
- `/teacher/homework/new` : Création devoir
- `/teacher/homework/[id]` : Détail devoir (rendus)
- `/student/homework` : Mes devoirs à faire
- `/student/homework/[id]` : Détail devoir + rendu
- `/parent/homework` : Devoirs de mes enfants

### Objets Métiers
- `Homework` : Devoir (titre, consignes, classe, matière, date limite)
- `HomeworkAttachment` : Pièce jointe (fichier, lien)
- `HomeworkSubmission` : Rendu élève (fichier, date, statut)
- `HomeworkCorrection` : Correction (note, commentaires)

### Workflows
1. **Création devoir** :
   - Professeur crée → Consignes, pièces jointes, date limite
   - Publication → Visible élèves/parents

2. **Rendu** (optionnel) :
   - Élève upload fichier → Enregistrement rendu
   - Notification professeur → Correction

3. **Correction** :
   - Professeur corrige → Note + commentaires
   - Publication → Notification élève/parent

### Règles Métier
- Date limite : rappel automatique avant échéance
- Rendu tardif : marqué automatiquement
- Pièces jointes : taille max configurable

---

## K. Finances / Scolarité (Facturation)

### Objectifs
- Gérer les frais de scolarité (inscription, mensualités)
- Suivre les paiements et relances
- Exporter pour comptabilité

### Pages UI
- `/admin/finance/invoices` : Liste factures
- `/admin/finance/invoices/new` : Création facture
- `/admin/finance/invoices/[id]` : Détail facture
- `/admin/finance/payments` : Paiements reçus
- `/admin/finance/payments/new` : Enregistrement paiement
- `/admin/finance/students/[id]` : Historique financier élève
- `/admin/finance/reports` : Rapports financiers
- `/admin/finance/settings` : Paramètres (tarifs, remises)
- `/parent/invoices` : Mes factures
- `/parent/payments` : Mes paiements

### Objets Métiers
- `Invoice` : Facture (élève, montant, type, date échéance, statut)
- `InvoiceItem` : Ligne facture (description, quantité, prix unitaire)
- `Payment` : Paiement (facture, montant, méthode, date, référence)
- `Discount` : Remise (pourcentage ou montant fixe, raison)
- `Scholarship` : Bourse (montant, période, conditions)
- `PaymentMethod` : Méthode paiement (cash, virement, carte, chèque)

### Workflows
1. **Création facture** :
   - Sélection élève → Type frais (inscription, mensualité, activité)
   - Calcul automatique (tarifs) → Application remises/bourses
   - Génération facture → Notification parent

2. **Paiement** :
   - Enregistrement paiement → Lien facture
   - Si intégration Stripe : webhook → Mise à jour automatique
   - Génération reçu PDF → Envoi parent

3. **Relances** :
   - Facture impayée après échéance → Relance automatique (email/SMS)
   - Escalade : X relances → Alerte admin

4. **Exports** :
   - Export comptable (CSV/Excel) → Intégration logiciel comptable
   - Rapports : recettes, impayés, prévisions

### Règles Métier
- Types frais : inscription (annuelle), mensualité (récurrente), activité (ponctuelle)
- Remises : applicables selon conditions (fratrie, bourse, etc.)
- Statuts facture : `DRAFT`, `SENT`, `PAID`, `PARTIALLY_PAID`, `OVERDUE`, `CANCELLED`
- Paiements partiels : autorisés (suivi solde restant)
- Intégration paiement : Stripe (carte) + modes manuels (cash, virement)

---

## L. Bibliothèque (Optionnel)

### Objectifs
- Gérer le catalogue de livres
- Suivre les emprunts et retours
- Gérer les pénalités de retard

### Pages UI
- `/library/books` : Catalogue livres
- `/library/books/new` : Ajout livre
- `/library/loans` : Emprunts actifs
- `/library/loans/new` : Nouvel emprunt
- `/library/returns` : Retours
- `/student/library` : Mes emprunts

### Objets Métiers
- `Book` : Livre (titre, auteur, ISBN, exemplaires)
- `BookCopy` : Exemplaire (code barre, état, localisation)
- `Loan` : Emprunt (élève, exemplaire, date début, date retour prévue, statut)
- `Penalty` : Pénalité (retard, perte, dégradation)

### Workflows
1. **Emprunt** :
   - Sélection livre → Vérification disponibilité
   - Création emprunt → Date retour calculée (durée configurable)
   - Notification élève/parent

2. **Retour** :
   - Scan code barre → Vérification état
   - Si retard → Calcul pénalité → Facturation (optionnel)
   - Mise à jour disponibilité

### Règles Métier
- Durée emprunt : configurable (ex: 2 semaines)
- Pénalités : montant/jour de retard (configurable)
- Limite emprunts : nombre max simultanés par élève

---

## M. Transport Scolaire (Optionnel)

### Objectifs
- Gérer les lignes de bus et arrêts
- Suivre la présence dans les transports
- Notifier parents en cas d'absence

### Pages UI
- `/admin/transport/lines` : Lignes de bus
- `/admin/transport/stops` : Arrêts
- `/admin/transport/students` : Affectation élèves ↔ lignes
- `/admin/transport/attendance` : Présence transport
- `/parent/transport` : Ligne de mon enfant

### Objets Métiers
- `TransportLine` : Ligne de bus (nom, itinéraire, horaires)
- `TransportStop` : Arrêt (nom, adresse, heure passage)
- `StudentTransport` : Affectation élève ↔ ligne ↔ arrêt
- `TransportAttendance` : Présence transport (date, élève, statut)

### Workflows
1. **Configuration** :
   - Création lignes → Définition arrêts et horaires
   - Affectation élèves → Notification parents

2. **Pointage** :
   - Chauffeur/surveillant pointe présence → Enregistrement
   - Si absent → Notification parent immédiate

### Règles Métier
- Un élève peut être sur une seule ligne
- Horaires : heures de passage par arrêt
- Alertes : absence non justifiée → notification parent

---

## N. Cantine (Optionnel)

### Objectifs
- Gérer les menus
- Suivre les abonnements et repas
- Gérer les allergies et restrictions

### Pages UI
- `/admin/canteen/menus` : Menus (semaine/mois)
- `/admin/canteen/menus/new` : Création menu
- `/admin/canteen/subscriptions` : Abonnements élèves
- `/admin/canteen/attendance` : Pointage repas
- `/parent/canteen` : Abonnement de mon enfant

### Objets Métiers
- `Menu` : Menu (date, plats, prix)
- `CanteenSubscription` : Abonnement (élève, période, type)
- `MealAttendance` : Présence repas (date, élève, menu choisi)
- `DietaryRestriction` : Restriction alimentaire (allergie, régime)

### Workflows
1. **Menus** :
   - Création menus semaine → Publication
   - Notification parents → Choix repas (optionnel)

2. **Abonnements** :
   - Inscription élève → Paiement → Activation
   - Pointage repas → Débit abonnement

3. **Allergies** :
   - Déclaration allergie → Vérification menus
   - Alertes : menu incompatible → notification

### Règles Métier
- Types abonnements : quotidien, jours spécifiques, ponctuel
- Allergies : vérification automatique menus
- Facturation : débit automatique ou facture mensuelle

---

## O. Documents & Archivage

### Objectifs
- Générer documents officiels (certificats, attestations)
- Stocker et archiver les pièces jointes
- Gérer les modèles de documents

### Pages UI
- `/admin/documents/templates` : Modèles documents
- `/admin/documents/templates/new` : Création modèle
- `/admin/documents/generate` : Génération document
- `/admin/documents/archive` : Archivage
- `/student/documents` : Mes documents
- `/parent/documents` : Documents de mes enfants

### Objets Métiers
- `DocumentTemplate` : Modèle (certificat scolarité, attestation, etc.)
- `Document` : Document généré (élève, type, fichier PDF, date)
- `File` : Fichier stocké (nom, type, taille, URL S3)

### Workflows
1. **Génération** :
   - Sélection modèle → Paramètres (élève, période)
   - Génération PDF → Stockage S3
   - Notification destinataire → Téléchargement

2. **Archivage** :
   - Documents anciens → Archivage automatique (selon rétention)
   - Consultation archives → Accès contrôlé

### Règles Métier
- Modèles : variables dynamiques ({{student.name}}, {{date}}, etc.)
- Formats : PDF uniquement (sécurité)
- Rétention : selon type document (ex: bulletins = 5 ans)

---

## P. Paramétrage & Référentiels

### Objectifs
- Configurer les référentiels métier (matières, coefficients, etc.)
- Définir les règles de calcul et validations
- Gérer les templates et configurations

### Pages UI
- `/admin/settings/subjects` : Matières
- `/admin/settings/grading` : Barèmes et coefficients
- `/admin/settings/rules` : Règles métier
- `/admin/settings/templates` : Templates (emails, documents)
- `/admin/settings/permissions` : Permissions par rôle

### Objets Métiers
- `Subject` : Matière (nom, code, niveau)
- `GradingRule` : Règle calcul (coefficients, périodes, mentions)
- `Template` : Template (email, document, notification)
- `SystemConfig` : Configuration système (clés-valeurs)

### Workflows
1. **Configuration initiale** :
   - Import matières standard → Personnalisation
   - Définition coefficients → Validation

2. **Mise à jour** :
   - Modification règle → Vérification impact
   - Application → Notification utilisateurs si nécessaire

### Règles Métier
- Matières : hiérarchie (matière principale ↔ spécialités)
- Coefficients : validation somme = 100% (ou autre selon config)
- Templates : variables disponibles documentées

---

## Q. Reporting & Exports

### Objectifs
- Tableaux de bord avec statistiques
- Exports Excel/CSV pour analyses
- Rapports officiels (administration)

### Pages UI
- `/admin/dashboard` : Dashboard principal (KPIs)
- `/admin/reports/attendance` : Rapports présences
- `/admin/reports/grades` : Rapports notes
- `/admin/reports/finance` : Rapports financiers
- `/admin/reports/custom` : Rapports personnalisés
- `/admin/exports` : Exports disponibles

### Objets Métiers
- `Report` : Rapport (type, paramètres, date génération)
- `Export` : Export (format, filtres, statut)

### Workflows
1. **Génération rapport** :
   - Sélection type → Paramètres (période, classes, etc.)
   - Génération (batch job) → Notification complétion
   - Téléchargement → Archivage

2. **Exports** :
   - Sélection données → Format (Excel, CSV, PDF)
   - Génération → Téléchargement

### Règles Métier
- Formats : Excel (avec formattage), CSV (données brutes), PDF (rapports)
- Filtres : période, classe, niveau, etc.
- Performance : exports volumineux en background

---

## R. Conformité / RGPD

### Objectifs
- Gérer les consentements utilisateurs
- Permettre exercice droits RGPD (accès, suppression)
- Journaliser les accès aux données sensibles

### Pages UI
- `/admin/compliance/consents` : Gestion consentements
- `/admin/compliance/audit` : Logs d'audit
- `/admin/compliance/retention` : Politiques rétention
- `/user/privacy` : Mes données (accès, suppression)

### Objets Métiers
- `Consent` : Consentement (utilisateur, type, donné, retiré, date)
- `AuditLog` : Log audit (action, utilisateur, ressource, timestamp)
- `DataRetentionPolicy` : Politique rétention (type données, durée)
- `DataExport` : Export données utilisateur (fichier, date)

### Workflows
1. **Consentements** :
   - Demande consentement → Enregistrement
   - Retrait → Mise à jour → Application (ex: arrêt communications)

2. **Droit d'accès** :
   - Demande utilisateur → Génération export JSON/PDF
   - Livraison → Confirmation

3. **Droit à l'oubli** :
   - Demande suppression → Vérification (contraintes légales)
   - Anonymisation → Archivage (selon rétention)

4. **Audit** :
   - Actions sensibles → Journalisation automatique
   - Consultation logs → Traçabilité complète

### Règles Métier
- Types consentements : photo, communication, données santé, etc.
- Rétention : selon type (ex: notes = 5 ans, factures = 10 ans)
- Anonymisation : suppression données identifiantes, conservation agrégées
- Logs audit : rétention 7 ans minimum

---

## Résumé des Modules

| Module | Priorité MVP | Complexité | Dépendances |
|--------|--------------|------------|-------------|
| A. Établissement | ✅ Critique | Moyenne | - |
| B. Élèves & Admissions | ✅ Critique | Élevée | A |
| C. Classes & Scolarité | ✅ Critique | Moyenne | A, B |
| D. Professeurs | ✅ Critique | Moyenne | A |
| E. Emploi du Temps | ✅ Critique | Élevée | C, D |
| F. Présences | ✅ Critique | Moyenne | C, D, E |
| G. Notes & Bulletins | ✅ Critique | Élevée | C, D, F |
| H. Discipline | ⚠️ V2 | Moyenne | B, C |
| I. Communication | ✅ Critique | Moyenne | - |
| J. Devoirs | ⚠️ V2 | Faible | C, D |
| K. Finances | ⚠️ V2 | Élevée | B |
| L. Bibliothèque | ❌ Optionnel | Faible | B |
| M. Transport | ❌ Optionnel | Moyenne | B |
| N. Cantine | ❌ Optionnel | Moyenne | B |
| O. Documents | ✅ Critique | Faible | B, G |
| P. Paramétrage | ✅ Critique | Faible | - |
| Q. Reporting | ⚠️ V2 | Moyenne | Tous |
| R. RGPD | ✅ Critique | Moyenne | Tous |

**Légende** :
- ✅ Critique : Inclus dans MVP
- ⚠️ V2 : Prioritaire pour V2
- ❌ Optionnel : Fonctionnalité avancée
