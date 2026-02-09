# Plan d'Implémentation - School Administration System

## Vue d'ensemble

Roadmap MVP → V2 → V3 avec sprints de 2 semaines. Focus sur livraison rapide d'un MVP fonctionnel, puis itérations pour fonctionnalités avancées.

---

## MVP (6-8 semaines)

**Objectif** : Application fonctionnelle permettant la gestion de base d'une école (élèves, classes, notes, présences, communication).

---

### Sprint 0 : Setup & Infrastructure (Semaine 1)

**Durée** : 1 semaine

#### Tâches
- [ ] Setup monorepo (Turborepo)
- [ ] Configuration packages (db, shared, ui, web)
- [ ] Setup PostgreSQL + Prisma
- [ ] Setup Redis (cache + queue)
- [ ] Setup S3/MinIO (stockage fichiers)
- [ ] Configuration CI/CD (GitHub Actions)
- [ ] Setup Docker Compose (dev environment)
- [ ] Configuration ESLint, Prettier, TypeScript
- [ ] Setup Sentry (monitoring)

#### Livrables
- ✅ Repo structuré et fonctionnel
- ✅ Base de données créée
- ✅ Environnement dev opérationnel
- ✅ CI/CD basique

#### Définition de Fait
- Tests unitaires passent
- Linter passe
- Build réussit
- Docker Compose démarre sans erreur

---

### Sprint 1 : Auth & Multi-Tenant (Semaine 2)

**Durée** : 2 semaines

#### Tâches
- [ ] Modèle User, School, Membership, Role, Permission
- [ ] Migration Prisma (auth tables)
- [ ] API Auth (register, login, logout, refresh)
- [ ] JWT tokens (access + refresh)
- [ ] Middleware auth (Next.js)
- [ ] Middleware tenant isolation
- [ ] RLS PostgreSQL policies
- [ ] RBAC middleware (permissions)
- [ ] UI Login/Register
- [ ] Tests auth (unit + integration)

#### Livrables
- ✅ Authentification fonctionnelle
- ✅ Isolation multi-tenant garantie
- ✅ RBAC basique opérationnel
- ✅ Pages login/register

#### Définition de Fait
- Utilisateur peut créer compte et se connecter
- Isolation tenant testée (un user ne voit pas données autre école)
- Permissions vérifiées (403 si pas autorisé)

---

### Sprint 2 : Établissement & Structure (Semaine 3-4)

**Durée** : 2 semaines

#### Tâches
- [ ] Modèles : Campus, AcademicYear, Period, Level, Class, Room
- [ ] Migration Prisma
- [ ] API Établissement
  - [ ] CRUD School settings
  - [ ] CRUD AcademicYear
  - [ ] CRUD Period
  - [ ] CRUD Level
  - [ ] CRUD Class
  - [ ] CRUD Room
- [ ] UI Admin : Paramètres école
- [ ] UI Admin : Gestion années scolaires
- [ ] UI Admin : Gestion classes
- [ ] Tests (unit + integration)

#### Livrables
- ✅ Configuration école complète
- ✅ Gestion années scolaires et périodes
- ✅ Gestion classes et salles
- ✅ Interface admin fonctionnelle

#### Définition de Fait
- Admin peut créer année scolaire
- Admin peut créer classes
- Admin peut configurer périodes

---

### Sprint 3 : Élèves & Admissions (Semaine 5-6)

**Durée** : 2 semaines

#### Tâches
- [ ] Modèles : Student, Guardian, StudentGuardian, Enrollment
- [ ] Migration Prisma
- [ ] Génération matricule automatique
- [ ] API Élèves
  - [ ] CRUD Student
  - [ ] CRUD Guardian
  - [ ] Lien Student ↔ Guardian
  - [ ] CRUD Enrollment
  - [ ] Upload documents
  - [ ] Recherche/filtres
- [ ] UI Admin : Liste élèves
- [ ] UI Admin : Formulaire création élève
- [ ] UI Admin : Dossier élève (détail)
- [ ] UI Admin : Gestion parents/tuteurs
- [ ] Import CSV/Excel (basique)
- [ ] Tests

#### Livrables
- ✅ Gestion élèves complète
- ✅ Gestion parents/tuteurs
- ✅ Inscription élèves dans classes
- ✅ Import basique

#### Définition de Fait
- Admin peut créer élève avec matricule auto
- Admin peut lier parents à élève
- Admin peut inscrire élève dans classe
- Import CSV fonctionne (format standard)

---

### Sprint 4 : Professeurs & Matières (Semaine 7)

**Durée** : 1 semaine

#### Tâches
- [ ] Modèles : Teacher, Subject, TeacherAssignment
- [ ] Migration Prisma
- [ ] API Professeurs
  - [ ] CRUD Teacher
  - [ ] CRUD Subject
  - [ ] CRUD TeacherAssignment
- [ ] UI Admin : Liste professeurs
- [ ] UI Admin : Gestion matières
- [ ] UI Admin : Affectation prof ↔ classe ↔ matière
- [ ] Tests

#### Livrables
- ✅ Gestion professeurs
- ✅ Gestion matières
- ✅ Affectations professeurs

#### Définition de Fait
- Admin peut créer professeur
- Admin peut créer matière
- Admin peut affecter professeur à classe/matière

---

### Sprint 5 : Emploi du Temps (Semaine 8)

**Durée** : 1 semaine (MVP simplifié)

#### Tâches
- [ ] Modèles : Timetable, TimetableSlot, TimetableException
- [ ] Migration Prisma
- [ ] API EDT
  - [ ] CRUD Timetable
  - [ ] CRUD TimetableSlot (manuel)
  - [ ] Détection conflits basique
  - [ ] CRUD Exceptions
- [ ] UI Admin : Création EDT manuelle
- [ ] UI Admin : Vue EDT (semaine)
- [ ] UI Prof : Mon EDT
- [ ] UI Élève : Mon EDT
- [ ] Tests

#### Livrables
- ✅ EDT manuel fonctionnel
- ✅ Visualisation EDT (semaine)
- ✅ Détection conflits basique

#### Définition de Fait
- Admin peut créer créneaux EDT manuellement
- Conflits détectés (prof/salle/classe)
- Prof et élève voient leur EDT

**Note** : Générateur automatique EDT reporté en V2.

---

### Sprint 6 : Présences (Semaine 9)

**Durée** : 1 semaine

#### Tâches
- [ ] Modèles : AttendanceRecord, Justification
- [ ] Migration Prisma
- [ ] API Présences
  - [ ] CRUD AttendanceRecord (pointage)
  - [ ] CRUD Justification
  - [ ] Validation justificatifs
  - [ ] Statistiques présences
- [ ] UI Prof : Pointage par cours
- [ ] UI Admin : Vue d'ensemble présences
- [ ] UI Admin : Validation justificatifs
- [ ] UI Parent : Absences enfants
- [ ] Notifications absences (email)
- [ ] Tests

#### Livrables
- ✅ Pointage présences fonctionnel
- ✅ Gestion justificatifs
- ✅ Notifications parents

#### Définition de Fait
- Prof peut pointer présences par cours
- Notification automatique si absence
- Parent peut voir absences enfants
- Admin peut valider justificatifs

---

### Sprint 7 : Notes & Bulletins (Semaine 10-11)

**Durée** : 2 semaines

#### Tâches
- [ ] Modèles : Assessment, Grade, ReportCard, ReportCardComment
- [ ] Migration Prisma
- [ ] Calcul moyennes automatique
- [ ] API Notes
  - [ ] CRUD Assessment
  - [ ] CRUD Grade (batch saisie)
  - [ ] Calcul moyennes
  - [ ] Génération bulletins (batch job)
- [ ] Génération PDF bulletins (Puppeteer)
- [ ] UI Prof : Création évaluation
- [ ] UI Prof : Saisie notes
- [ ] UI Admin : Génération bulletins
- [ ] UI Parent : Notes enfants
- [ ] UI Élève : Mes notes
- [ ] Tests

#### Livrables
- ✅ Saisie notes complète
- ✅ Calcul moyennes automatique
- ✅ Génération bulletins PDF
- ✅ Consultation notes (prof/parent/élève)

#### Définition de Fait
- Prof peut créer évaluation et saisir notes
- Moyennes calculées automatiquement
- Bulletins PDF générés (batch job)
- Parent et élève voient notes

---

### Sprint 8 : Communication (Semaine 12)

**Durée** : 1 semaine

#### Tâches
- [ ] Modèles : MessageThread, Message, Announcement, Notification
- [ ] Migration Prisma
- [ ] API Communication
  - [ ] CRUD Messages (messagerie interne)
  - [ ] CRUD Announcements
  - [ ] CRUD Notifications
  - [ ] Envoi emails (Resend)
- [ ] UI : Messagerie (liste conversations)
- [ ] UI : Conversation (messages)
- [ ] UI Admin : Création annonces
- [ ] UI : Centre notifications
- [ ] Notifications automatiques (absences, notes, etc.)
- [ ] Tests

#### Livrables
- ✅ Messagerie interne fonctionnelle
- ✅ Annonces
- ✅ Notifications (in-app + email)

#### Définition de Fait
- Utilisateurs peuvent échanger messages
- Admin peut créer annonces
- Notifications automatiques fonctionnent

---

### Sprint 9 : Documents & Exports (Semaine 13)

**Durée** : 1 semaine

#### Tâches
- [ ] Modèles : Document, DocumentTemplate
- [ ] Migration Prisma
- [ ] API Documents
  - [ ] CRUD Document
  - [ ] CRUD DocumentTemplate
  - [ ] Génération documents (certificats, attestations)
- [ ] API Exports
  - [ ] Export élèves (CSV/Excel)
  - [ ] Export notes (Excel)
  - [ ] Export présences (CSV)
- [ ] UI Admin : Génération documents
- [ ] UI Admin : Exports
- [ ] Jobs asynchrones (BullMQ)
- [ ] Tests

#### Livrables
- ✅ Génération documents officiels
- ✅ Exports CSV/Excel fonctionnels
- ✅ Jobs asynchrones opérationnels

#### Définition de Fait
- Admin peut générer certificat scolarité
- Admin peut exporter données (CSV/Excel)
- Exports volumineux en background

---

### Sprint 10 : RGPD & Finalisation MVP (Semaine 14)

**Durée** : 1 semaine

#### Tâches
- [ ] Modèles : Consent, AuditLog
- [ ] Migration Prisma
- [ ] API RGPD
  - [ ] Gestion consentements
  - [ ] Export données utilisateur
  - [ ] Anonymisation données
- [ ] Audit logging (actions sensibles)
- [ ] UI : Gestion consentements
- [ ] UI : Export données personnelles
- [ ] Tests d'isolation tenant (complets)
- [ ] Tests de sécurité
- [ ] Documentation utilisateur (basique)
- [ ] Déploiement staging
- [ ] Tests end-to-end

#### Livrables
- ✅ Conformité RGPD (basique)
- ✅ Audit trail complet
- ✅ Tests complets
- ✅ Application déployée (staging)

#### Définition de Fait
- Consentements trackés
- Export données fonctionne
- Tests passent (unit + integration + e2e)
- Application déployée et testée

---

## MVP - Résumé

**Durée totale** : 14 semaines (~3.5 mois)

**Fonctionnalités MVP** :
- ✅ Auth + Multi-tenant + RBAC
- ✅ Gestion établissement (années, classes, salles)
- ✅ Gestion élèves + parents
- ✅ Gestion professeurs + matières
- ✅ EDT manuel
- ✅ Présences + justificatifs
- ✅ Notes + bulletins PDF
- ✅ Communication (messagerie, annonces, notifications)
- ✅ Documents + exports
- ✅ RGPD (basique)

**Modules exclus MVP** :
- ❌ Finances (facturation)
- ❌ Discipline (incidents, sanctions)
- ❌ Devoirs (mini-LMS)
- ❌ Bibliothèque
- ❌ Transport
- ❌ Cantine
- ❌ Générateur EDT automatique
- ❌ Analytics avancés

---

## V2 (8-10 semaines)

**Objectif** : Compléter les modules manquants et améliorer l'existant.

---

### Sprint 11 : Finances (Semaine 15-17)

**Durée** : 3 semaines

#### Tâches
- [ ] Modèles : Invoice, InvoiceItem, Payment, Discount, Scholarship
- [ ] Migration Prisma
- [ ] API Finances
  - [ ] CRUD Invoice
  - [ ] Calcul automatique (remises, taxes)
  - [ ] CRUD Payment
  - [ ] Intégration Stripe (paiement en ligne)
  - [ ] Relances automatiques
  - [ ] Exports comptables
- [ ] UI Admin : Gestion factures
- [ ] UI Admin : Enregistrement paiements
- [ ] UI Parent : Mes factures
- [ ] UI Parent : Paiement en ligne (Stripe)
- [ ] Jobs : Relances automatiques
- [ ] Tests

#### Livrables
- ✅ Facturation complète
- ✅ Paiements en ligne (Stripe)
- ✅ Relances automatiques

---

### Sprint 12 : Discipline (Semaine 18-19)

**Durée** : 2 semaines

#### Tâches
- [ ] Modèles : Incident, StudentIncident, Sanction
- [ ] Migration Prisma
- [ ] API Discipline
  - [ ] CRUD Incident
  - [ ] CRUD Sanction
  - [ ] Workflow approbation
- [ ] UI Admin/Surveillant : Déclaration incidents
- [ ] UI Admin : Application sanctions
- [ ] UI Parent : Incidents enfants
- [ ] Notifications parents (incidents/sanctions)
- [ ] Tests

#### Livrables
- ✅ Gestion incidents
- ✅ Gestion sanctions
- ✅ Communication parents

---

### Sprint 13 : Devoirs (Semaine 20-21)

**Durée** : 2 semaines

#### Tâches
- [ ] Modèles : Homework, HomeworkSubmission
- [ ] Migration Prisma
- [ ] API Devoirs
  - [ ] CRUD Homework
  - [ ] CRUD Submission
  - [ ] Correction devoirs
- [ ] UI Prof : Création devoirs
- [ ] UI Élève : Devoirs à faire + rendu
- [ ] UI Parent : Devoirs enfants
- [ ] Notifications (rappel avant échéance)
- [ ] Tests

#### Livrables
- ✅ Gestion devoirs complète
- ✅ Rendu élèves
- ✅ Correction professeurs

---

### Sprint 14 : Import/Export Avancé (Semaine 22)

**Durée** : 1 semaine

#### Tâches
- [ ] Import élèves avancé (mapping colonnes, preview, rollback)
- [ ] Import notes (bulk)
- [ ] Import présences
- [ ] Exports personnalisables
- [ ] Templates exports
- [ ] UI : Import avec preview
- [ ] Tests

#### Livrables
- ✅ Import massif robuste
- ✅ Exports personnalisables

---

### Sprint 15 : Analytics & Reporting (Semaine 23-24)

**Durée** : 2 semaines

#### Tâches
- [ ] Dashboard admin (KPIs)
- [ ] Rapports présences (graphiques)
- [ ] Rapports notes (statistiques)
- [ ] Rapports finances
- [ ] Exports rapports (PDF)
- [ ] UI : Dashboards
- [ ] UI : Rapports
- [ ] Tests

#### Livrables
- ✅ Dashboards fonctionnels
- ✅ Rapports avec graphiques

---

## V3 (Fonctionnalités Avancées)

**Objectif** : Optimisations et fonctionnalités premium.

---

### Modules Optionnels

- **Bibliothèque** : Gestion catalogue, emprunts, pénalités
- **Transport** : Lignes bus, présence transport, notifications
- **Cantine** : Menus, abonnements, pointage repas
- **RH** : Gestion contrats, absences profs, remplacements

---

### Optimisations

- **Générateur EDT automatique** : Algorithme résolution contraintes
- **ML/IA** :
  - Détection anomalies présences
  - Prédiction risque décrochage
  - Recommandations pédagogiques
- **Performance** :
  - Cache avancé (Redis)
  - Partitioning tables volumineuses
  - CDN pour assets
- **Mobile** : App React Native (optionnel)

---

## Planning Global

| Phase | Durée | Sprints | Focus |
|-------|-------|---------|-------|
| **MVP** | 14 semaines | 0-10 | Fonctionnalités core |
| **V2** | 8-10 semaines | 11-15 | Modules complémentaires |
| **V3** | 8+ semaines | 16+ | Optimisations & premium |

**Total MVP** : ~3.5 mois  
**Total V2** : ~2.5 mois  
**Total V3** : ~2+ mois (ongoing)

---

## Critères de Succès MVP

### Fonctionnels
- ✅ Une école peut gérer ses élèves, classes, professeurs
- ✅ Les professeurs peuvent pointer présences et saisir notes
- ✅ Les parents peuvent consulter absences et notes de leurs enfants
- ✅ Les bulletins PDF sont générés automatiquement
- ✅ La communication fonctionne (messagerie, annonces)

### Techniques
- ✅ Isolation multi-tenant garantie
- ✅ Performance acceptable (<2s chargement pages)
- ✅ Tests passent (>80% coverage)
- ✅ Application déployée et stable

### Business
- ✅ Application utilisable en production
- ✅ Documentation utilisateur disponible
- ✅ Support basique opérationnel

---

## Risques & Mitigation

### Risques Techniques
- **Complexité EDT** : MVP avec création manuelle uniquement
- **Performance** : Monitoring dès le début, optimisation progressive
- **Scalabilité** : Architecture prête, optimisation V2

### Risques Métier
- **Besoins spécifiques écoles** : Paramétrage flexible, feedback utilisateurs
- **Conformité légale** : Validation juridique RGPD nécessaire

### Risques Planning
- **Dépassement délais** : Priorisation stricte, MVP réduit si nécessaire
- **Dépendances** : Identification précoce, alternatives préparées

---

## Prochaines Étapes

1. **Validation architecture** : Revue technique avec équipe
2. **Setup repo** : Sprint 0
3. **Démarrage développement** : Sprint 1 (Auth)
4. **Itérations** : Sprints suivants selon planning

**Document suivant** : `08-risques-decisions.md` pour détails risques et points à valider.
