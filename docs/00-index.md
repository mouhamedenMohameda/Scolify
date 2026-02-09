# Index de la Documentation - School Administration System

## 📖 Vue d'ensemble

Cette documentation complète décrit l'architecture, les modules métiers, le data model, les API, et le plan d'implémentation d'un système SaaS de gestion scolaire multi-tenant.

---

## 📑 Documents Disponibles

### 1. [Architecture Globale](01-architecture-globale.md)
**Vue d'ensemble technique et logique**

- Stack technologique (Next.js, PostgreSQL, Prisma, Redis, etc.)
- Architecture logique (diagrammes ASCII)
- Structure monorepo (packages, apps)
- Patterns & conventions (DDD léger)
- Stratégie multi-tenant (RLS PostgreSQL)
- Sécurité & conformité (RGPD)
- Scalabilité & performance
- Observabilité & déploiement

**À lire en premier** pour comprendre l'architecture globale.

---

### 2. [Modules Métiers](02-modules-metiers.md)
**Détail exhaustif de tous les modules**

18 modules documentés avec :
- Objectifs
- Pages UI
- Objets métiers
- Workflows détaillés
- Règles métier

**Modules** :
- A. Gestion établissement & années scolaires
- B. Gestion élèves & admissions
- C. Gestion classes, groupes & scolarité
- D. Professeurs & RH
- E. Emploi du temps & salles
- F. Présences & absences
- G. Notes, évaluations & bulletins
- H. Discipline & vie scolaire
- I. Communication & notifications
- J. Devoirs & contenus (mini-LMS)
- K. Finances / scolarité (facturation)
- L. Bibliothèque (optionnel)
- M. Transport scolaire (optionnel)
- N. Cantine (optionnel)
- O. Documents & archivage
- P. Paramétrage & référentiels
- Q. Reporting & exports
- R. Conformité / RGPD

**Priorisation** : Modules MVP vs V2 vs optionnels.

---

### 3. [RBAC & Permissions](03-rbac-permissions.md)
**Système de contrôle d'accès complet**

- Architecture RBAC (User → Membership → Role → Permission)
- Rôles système (12+ rôles : Admin, Prof, Parent, Élève, etc.)
- Matrice de permissions par module
- Implémentation technique (middleware, RLS)
- Audit & traçabilité
- Rôles personnalisables

**Format permissions** : `module:action:scope` (ex: `students:read:assigned`)

---

### 4. [Data Model](04-data-model.md)
**Schéma de données complet**

- Vue d'ensemble par domaine (18 domaines)
- Tables principales avec relations
- Indexation & performance
- Contraintes & validations
- Stratégie multi-tenant (RLS)
- Données sensibles & RGPD
- Migrations & évolution

**Schéma Prisma complet** : `packages/db/prisma/schema.prisma`

**~50+ tables** couvrant tous les modules métier.

---

### 5. [API Endpoints](05-api-endpoints.md)
**Spécification API REST complète**

- Format de réponse standardisé
- Authentification (JWT)
- Endpoints par module :
  - Auth (`/api/auth/*`)
  - Élèves (`/api/students/*`)
  - Classes (`/api/classes/*`)
  - Notes (`/api/assessments/*`, `/api/grades/*`)
  - Présences (`/api/attendance/*`)
  - EDT (`/api/timetable/*`)
  - Finances (`/api/invoices/*`, `/api/payments/*`)
  - Discipline (`/api/incidents/*`, `/api/sanctions/*`)
  - Communication (`/api/messages/*`, `/api/announcements/*`)
  - Devoirs (`/api/homework/*`)
  - Exports (`/api/exports/*`)
  - Paramétrage (`/api/settings/*`)
- Pagination, filtres, tri
- Gestion erreurs
- Jobs asynchrones

**100+ endpoints** documentés avec exemples.

---

### 6. [Structure Repo & Conventions](06-structure-repo.md)
**Organisation code et standards**

- Structure monorepo (Turborepo)
- Conventions de nommage
- Structure services (DDD léger)
- Structure API routes
- Structure composants React
- Validation (Zod)
- Gestion erreurs
- Tests (unit, integration, e2e)
- Configuration (TypeScript, ESLint, Prettier)
- Git hooks & workflow

**Standards de code** pour maintenir qualité et cohérence.

---

### 7. [Plan d'Implémentation](07-plan-implementation.md)
**Roadmap détaillée MVP → V2 → V3**

**MVP (14 semaines, 10 sprints)** :
- Sprint 0 : Setup & Infrastructure
- Sprint 1 : Auth & Multi-Tenant
- Sprint 2 : Établissement & Structure
- Sprint 3 : Élèves & Admissions
- Sprint 4 : Professeurs & Matières
- Sprint 5 : Emploi du Temps
- Sprint 6 : Présences
- Sprint 7 : Notes & Bulletins
- Sprint 8 : Communication
- Sprint 9 : Documents & Exports
- Sprint 10 : RGPD & Finalisation

**V2 (8-10 semaines)** :
- Finances
- Discipline
- Devoirs
- Import/Export avancé
- Analytics & Reporting

**V3** : Modules optionnels, optimisations, ML/IA

**Planning global** : ~3.5 mois MVP, ~2.5 mois V2.

---

### 8. [Risques & Décisions](08-risques-decisions.md)
**Identification risques et points à valider**

**Risques techniques** :
- Isolation multi-tenant
- Performance & scalabilité
- Génération EDT automatique
- Génération PDF
- Intégration paiement

**Risques métier** :
- Variabilité systèmes scolaires
- Conformité RGPD
- Besoins spécifiques écoles
- Migration données existantes

**Risques organisationnels** :
- Dépassement délais
- Dépendances externes
- Maintenance & support

**Points de décision** :
- Stack technique
- Périmètre géographique
- Modèle tarifaire
- Modules optionnels

**20+ décisions** nécessitant validation.

---

## 🎯 Parcours de Lecture Recommandé

### Pour les Architectes / Tech Leads
1. Architecture Globale
2. Data Model
3. Structure Repo & Conventions
4. Risques & Décisions

### Pour les Développeurs
1. Architecture Globale (vue d'ensemble)
2. Structure Repo & Conventions
3. API Endpoints
4. Data Model (référence)

### Pour les Product Managers
1. Modules Métiers
2. Plan d'Implémentation
3. Risques & Décisions

### Pour les Stakeholders Business
1. Modules Métiers
2. Plan d'Implémentation (MVP)
3. Risques & Décisions (points métier)

---

## 🔍 Recherche Rapide

### Par Thème

**Authentification & Sécurité**
- Architecture Globale → Section 3 (Sécurité)
- RBAC & Permissions
- Data Model → Section 1.1 (Multi-Tenant & Auth)

**Modules Métier**
- Modules Métiers → Tous les modules
- API Endpoints → Endpoints par module
- Data Model → Tables par domaine

**Performance & Scalabilité**
- Architecture Globale → Section 4
- Data Model → Section 2 (Indexation)
- Risques & Décisions → Section 1.2

**Conformité RGPD**
- Modules Métiers → Module R (Conformité)
- Data Model → Section 6 (RGPD)
- Risques & Décisions → Section 2.2

**Planification**
- Plan d'Implémentation → Sprints détaillés
- Risques & Décisions → Section 3 (Organisationnels)

---

## 📊 Statistiques

- **Documents** : 8 documents complets
- **Modules métier** : 18 modules documentés
- **Tables DB** : ~50+ tables
- **API Endpoints** : 100+ endpoints
- **Rôles** : 12+ rôles système
- **Permissions** : Matrice complète par module
- **Sprints MVP** : 10 sprints (14 semaines)
- **Risques identifiés** : 15+ risques
- **Décisions à prendre** : 20+ points

---

## 🚀 Prochaines Étapes

1. **Validation Architecture** : Review technique avec équipe
2. **Validation Métier** : Interviews utilisateurs, écoles pilotes
3. **Validation Juridique** : Conformité RGPD
4. **Setup Repo** : Sprint 0 (infrastructure)
5. **Démarrage Développement** : Sprint 1 (Auth)

---

## 📝 Notes

- **Hypothèses** : Système scolaire français (trimestres, notes 0-20)
- **Périmètre MVP** : Fonctionnalités core, modules optionnels en V2
- **Flexibilité** : Architecture extensible, paramétrage par école
- **Conformité** : RGPD intégré dès le départ

---

## 🔗 Liens Utiles

- [README Principal](../README.md)
- [Schéma Prisma](../packages/db/prisma/schema.prisma)
- [Structure Repo](06-structure-repo.md)

---

**Dernière mise à jour** : Architecture complète définie, prêt pour implémentation.

**Status** : ✅ Documentation complète, 🚧 Implémentation à démarrer
