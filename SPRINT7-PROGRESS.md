# Sprint 7 : Notes & Bulletins - EN COURS 🚧

**Date** : Sprint 7  
**Status** : 🚧 ~40% Complété  
**Progression** : Services créés, API routes en cours

---

## ✅ Complété

### 1. Validations Zod ✅

**Fichier** : `packages/shared/src/validations/grade.schema.ts`

- ✅ `createAssessmentSchema` : Création évaluation
- ✅ `updateAssessmentSchema` : Mise à jour évaluation
- ✅ `publishAssessmentSchema` : Publication évaluation
- ✅ `createGradeSchema` : Création note
- ✅ `bulkCreateGradesSchema` : Création en masse notes
- ✅ `updateGradeSchema` : Mise à jour note
- ✅ `generateReportCardSchema` : Génération bulletin
- ✅ `publishReportCardSchema` : Publication bulletin
- ✅ `createReportCardCommentSchema` : Ajout commentaire

**Enums** :
- `AssessmentType` : TEST, HOMEWORK, PROJECT, ORAL
- `ReportCardStatus` : DRAFT, GENERATED, PUBLISHED
- `CompetencyLevel` : NOT_ACQUIRED, IN_PROGRESS, ACQUIRED, MASTERED

---

### 2. Services Métier ✅

#### AssessmentService (`apps/web/services/assessment.service.ts`)

**Méthodes** :
- ✅ `create()` : Créer évaluation
- ✅ `update()` : Mettre à jour évaluation
- ✅ `publish()` : Publier/dépublier évaluation
- ✅ `getById()` : Obtenir évaluation par ID
- ✅ `getMany()` : Liste avec filtres
- ✅ `delete()` : Supprimer évaluation

**Fonctionnalités** :
- ✅ Vérification isolation tenant
- ✅ Vérification période appartient à année scolaire classe
- ✅ Gestion publication (isPublished, publishedAt)

#### GradeService (`apps/web/services/grade.service.ts`)

**Méthodes** :
- ✅ `create()` : Créer note
- ✅ `bulkCreate()` : Créer notes en masse (pour une évaluation)
- ✅ `update()` : Mettre à jour note
- ✅ `getById()` : Obtenir note par ID
- ✅ `getMany()` : Liste avec filtres
- ✅ `calculateStudentAverage()` : Calculer moyenne élève pour période
- ✅ `delete()` : Supprimer note

**Fonctionnalités** :
- ✅ Vérification score ≤ maxScore
- ✅ Vérification élève inscrit dans classe
- ✅ Calcul moyenne pondérée (coefficients)
- ✅ Normalisation score sur 20 (système français)

#### ReportCardService (`apps/web/services/report-card.service.ts`)

**Méthodes** :
- ✅ `generate()` : Générer bulletin (calcul moyennes)
- ✅ `generatePDF()` : Générer PDF (placeholder)
- ✅ `publish()` : Publier bulletin
- ✅ `getById()` : Obtenir bulletin par ID
- ✅ `getMany()` : Liste avec filtres
- ✅ `addComment()` : Ajouter commentaire matière
- ✅ `delete()` : Supprimer bulletin

**Fonctionnalités** :
- ✅ Calcul moyennes par matière
- ✅ Calcul moyenne générale
- ✅ Détermination mention (PASSABLE, ASSEZ_BIEN, BIEN, TRES_BIEN)
- ✅ Gestion statuts (DRAFT, GENERATED, PUBLISHED)

---

## 🚧 En Cours

### 3. API Routes

**À créer** :
- [ ] `/api/assessments` : CRUD évaluations
- [ ] `/api/assessments/[id]` : Détail, mise à jour, suppression
- [ ] `/api/assessments/[id]/publish` : Publication
- [ ] `/api/grades` : CRUD notes
- [ ] `/api/grades/bulk` : Création en masse
- [ ] `/api/grades/[id]` : Détail, mise à jour, suppression
- [ ] `/api/grades/average` : Calcul moyenne
- [ ] `/api/report-cards` : Liste bulletins
- [ ] `/api/report-cards/generate` : Génération bulletin
- [ ] `/api/report-cards/[id]` : Détail bulletin
- [ ] `/api/report-cards/[id]/publish` : Publication
- [ ] `/api/report-cards/[id]/comments` : Gestion commentaires

---

## 📋 À Faire

### 4. Génération PDF Bulletins

- [ ] Installer Puppeteer
- [ ] Créer template HTML bulletin
- [ ] Implémenter génération PDF
- [ ] Upload PDF vers S3
- [ ] Retourner URL PDF

### 5. Pages UI

- [ ] Page prof : `/admin/grades` - Saisie notes
- [ ] Page admin : `/admin/assessments` - Gestion évaluations
- [ ] Page admin : `/admin/report-cards` - Gestion bulletins
- [ ] Page parent/élève : `/grades` - Voir notes et bulletins

---

## 📊 Métriques

- **Services créés** : 3 (`AssessmentService`, `GradeService`, `ReportCardService`)
- **Validations Zod** : 9 schémas
- **Lignes de code** : ~1200 lignes
- **API routes** : 0/13 créées
- **Pages UI** : 0/4 créées

---

## 🎯 Prochaines Étapes

1. Créer toutes les API routes
2. Implémenter génération PDF
3. Créer pages UI
4. Tests

---

**Status** : 🚧 En cours  
**Estimation** : ~60% restant
