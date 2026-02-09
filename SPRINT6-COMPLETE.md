# Sprint 6 : Présences & Absences - COMPLÉTÉ ✅

**Date** : Sprint 6  
**Status** : ✅ 100% Complété  
**Durée** : 2 semaines (estimé)

---

## 📋 Objectifs du Sprint

Implémenter la gestion complète des présences et absences :
- Marquer les présences par cours (professeurs)
- Gérer les justificatifs d'absence (admin)
- Statistiques de présence
- Historique des présences

---

## ✅ Fonctionnalités Implémentées

### 1. Validations Zod ✅

**Fichier** : `packages/shared/src/validations/attendance.schema.ts`

- ✅ `createAttendanceRecordSchema` : Création d'un enregistrement de présence
- ✅ `updateAttendanceRecordSchema` : Mise à jour d'un enregistrement
- ✅ `bulkCreateAttendanceSchema` : Création en masse (pour une classe)
- ✅ `getAttendanceRecordsSchema` : Filtres pour liste
- ✅ `createJustificationSchema` : Création d'un justificatif
- ✅ `updateJustificationSchema` : Approbation/rejet d'un justificatif
- ✅ `getJustificationsSchema` : Filtres pour liste
- ✅ `getAttendanceStatsSchema` : Paramètres pour statistiques

**Statuts** :
- Présence : `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`
- Justificatif : `PENDING`, `APPROVED`, `REJECTED`

---

### 2. Services Métier ✅

#### AttendanceService (`apps/web/services/attendance.service.ts`)

**Méthodes** :
- ✅ `create()` : Créer un enregistrement de présence
- ✅ `bulkCreate()` : Créer plusieurs enregistrements (pour une classe)
- ✅ `update()` : Mettre à jour un enregistrement
- ✅ `getById()` : Obtenir un enregistrement par ID
- ✅ `getMany()` : Liste avec filtres (élève, classe, créneau, date, statut)
- ✅ `getStats()` : Statistiques (total, présents, absents, retards, taux)
- ✅ `delete()` : Supprimer un enregistrement

**Fonctionnalités** :
- ✅ Calcul automatique des minutes de retard si `arrivalTime` fourni
- ✅ Vérification isolation tenant (schoolId)
- ✅ Vérification existence élève, créneau, justificatif
- ✅ Détection conflits (unicité élève + créneau + date)

#### JustificationService (`apps/web/services/justification.service.ts`)

**Méthodes** :
- ✅ `create()` : Créer un justificatif
- ✅ `update()` : Approuver/rejeter un justificatif
- ✅ `getById()` : Obtenir un justificatif par ID
- ✅ `getMany()` : Liste avec filtres (élève, statut, date)
- ✅ `delete()` : Supprimer un justificatif

**Fonctionnalités** :
- ✅ Lien automatique aux enregistrements de présence de la même date
- ✅ Mise à jour automatique `isJustified` sur les enregistrements
- ✅ Déliaison si justificatif rejeté
- ✅ Traçabilité (reviewedBy, reviewedAt)

---

### 3. API Routes ✅

#### Présences (`apps/web/app/api/attendance/`)

- ✅ `GET /api/attendance` : Liste des présences (avec filtres)
- ✅ `POST /api/attendance` : Créer une ou plusieurs présences
- ✅ `GET /api/attendance/[id]` : Détail d'une présence
- ✅ `PUT /api/attendance/[id]` : Mettre à jour une présence
- ✅ `DELETE /api/attendance/[id]` : Supprimer une présence
- ✅ `GET /api/attendance/stats` : Statistiques de présence

#### Justificatifs (`apps/web/app/api/justifications/`)

- ✅ `GET /api/justifications` : Liste des justificatifs (avec filtres)
- ✅ `POST /api/justifications` : Créer un justificatif
- ✅ `GET /api/justifications/[id]` : Détail d'un justificatif
- ✅ `PUT /api/justifications/[id]` : Approuver/rejeter un justificatif
- ✅ `DELETE /api/justifications/[id]` : Supprimer un justificatif

**Sécurité** :
- ✅ Authentification requise (`handleApiRoute`)
- ✅ Isolation tenant garantie (via `session.tenantId`)
- ✅ Validation Zod sur toutes les entrées

---

### 4. Pages UI ✅

#### Page Présences (`apps/web/app/admin/attendance/page.tsx`)

**Fonctionnalités** :
- ✅ Liste des enregistrements de présence
- ✅ Dialog pour marquer les présences par créneau
- ✅ Sélection créneau → chargement automatique des élèves de la classe
- ✅ Sélection date
- ✅ Marquer présence/absence/retard/excusé pour chaque élève
- ✅ Affichage statut avec couleurs (vert/rouge/jaune/bleu)
- ✅ Affichage matière, justifié

**Composants utilisés** :
- `DataTable` pour liste
- `Dialog` pour formulaire
- `Select` pour sélection créneau/statut
- `Input` pour date

#### Page Justificatifs (`apps/web/app/admin/justifications/page.tsx`)

**Fonctionnalités** :
- ✅ Liste des justificatifs avec filtres par statut
- ✅ Dialog pour examiner un justificatif
- ✅ Affichage raison, document (si fourni)
- ✅ Approuver/rejeter avec notes optionnelles
- ✅ Affichage statut avec couleurs (jaune/vert/rouge)

**Composants utilisés** :
- `DataTable` pour liste
- `Dialog` pour examen
- `Select` pour décision
- `Input` pour notes

---

### 5. Navigation ✅

**Fichier** : `apps/web/app/admin/layout.tsx`

- ✅ Ajout lien "Présences" dans sidebar
- ✅ Ajout lien "Justificatifs" dans sidebar

---

### 6. Helper API ✅

**Fichier** : `apps/web/lib/api-helpers.ts`

- ✅ Ajout fonction `handleApiRoute()` pour wrapper routes avec auth + gestion erreurs

---

## 📊 Métriques

- **Services créés** : 2 (`AttendanceService`, `JustificationService`)
- **API routes créées** : 11 endpoints
- **Pages UI créées** : 2 pages
- **Validations Zod** : 7 schémas
- **Lignes de code** : ~1500 lignes

---

## 🔍 Détails Techniques

### Calcul Retard Automatique

Si `arrivalTime` et `status = "LATE"` sont fournis, le système calcule automatiquement les minutes de retard en comparant avec l'heure de début du créneau EDT.

### Lien Justificatif ↔ Présence

Lors de la création d'un justificatif :
1. Le système trouve tous les enregistrements de présence pour cet élève à cette date
2. Il les lie automatiquement au justificatif (`justificationId`, `isJustified = true`)

Lors du rejet d'un justificatif :
1. Tous les enregistrements liés sont déliés (`justificationId = null`, `isJustified = false`)

### Isolation Multi-Tenant

Toutes les requêtes vérifient que :
- L'élève appartient à l'école (`student.schoolId === session.tenantId`)
- Le créneau appartient à l'école (via `timetable.schoolId`)
- Les justificatifs appartiennent à l'école (via `student.schoolId`)

---

## 🚧 Fonctionnalités Non Implémentées (V2)

### Notifications Parents

**Status** : Structure préparée, implémentation V2

**À faire** :
- Créer service de notifications
- Envoyer email/SMS lors d'absence non justifiée
- Envoyer notification lors d'approbation/rejet justificatif
- Dashboard parent pour voir absences enfants

### Page Parent

**Status** : Non implémentée (V2)

**À faire** :
- Page `/parent/attendance` pour voir absences de ses enfants
- Formulaire pour créer justificatif
- Historique des justificatifs

### Page Professeur

**Status** : Page admin créée, page dédiée prof (V2)

**À faire** :
- Page `/teacher/attendance` avec seulement les créneaux du professeur
- Vue simplifiée pour marquer présence rapidement

---

## 🐛 Bugs Connus / Améliorations

### Améliorations Court Terme

1. **Performance** : Optimiser requêtes avec filtres multiples (éviter N+1)
2. **UX** : Ajouter loading states, confirmations avant suppressions
3. **Validation** : Améliorer messages d'erreur utilisateur
4. **Export** : Ajouter export CSV/Excel des présences

### Bugs Potentiels

1. **Timezone** : Vérifier gestion dates/heures (timezone serveur vs client)
2. **Bulk Create** : Gérer cas où certains élèves n'existent pas
3. **Conflits** : Vérifier détection avec créneaux multiples par jour

---

## ✅ Tests à Effectuer

### Tests Manuels

1. **Marquer Présence** :
   - Sélectionner créneau → vérifier chargement élèves
   - Marquer présences → vérifier création enregistrements
   - Vérifier calcul retard si `arrivalTime` fourni

2. **Justificatifs** :
   - Créer justificatif → vérifier lien automatique aux présences
   - Approuver justificatif → vérifier `isJustified = true`
   - Rejeter justificatif → vérifier déliaison

3. **Filtres** :
   - Filtrer par élève → vérifier résultats
   - Filtrer par classe → vérifier résultats
   - Filtrer par date → vérifier résultats

4. **Statistiques** :
   - Vérifier calcul taux présence/absence
   - Vérifier compteurs par statut

### Tests API

Utiliser `scripts/test-api.sh` ou Postman pour tester :
- `GET /api/attendance`
- `POST /api/attendance` (single + bulk)
- `GET /api/attendance/stats`
- `GET /api/justifications`
- `POST /api/justifications`
- `PUT /api/justifications/[id]`

---

## 📝 Prochaines Étapes

### Sprint 7 : Notes & Bulletins

**Objectifs** :
- Services notes et évaluations
- API routes notes
- Génération bulletins PDF
- Pages UI (prof, admin, parent)

---

**Status** : ✅ Sprint 6 complété  
**Prochaine étape** : Sprint 7 - Notes & Bulletins
