# Data Model - School Administration System

## Vue d'ensemble

Ce document décrit le modèle de données complet de l'application. Le schéma Prisma complet est disponible dans `packages/db/prisma/schema.prisma`.

**Stratégie Multi-Tenant** : Row Level Security (RLS) PostgreSQL avec `tenant_id` (via `school_id`) sur toutes les tables.

---

## 1. Tables Principales par Domaine

### 1.1 Multi-Tenant & Authentification

| Table | Description | Clés |
|-------|-------------|------|
| `School` | École (tenant) | `id`, `slug` (unique) |
| `User` | Utilisateur plateforme | `id`, `email` (unique) |
| `Membership` | Lien User ↔ School avec Role | `userId` + `schoolId` (unique) |
| `Role` | Rôle dans une école | `id`, `code` (unique) |
| `Permission` | Permission atomique | `id`, `code` (unique, format: "module:action:scope") |
| `RolePermission` | Association Role ↔ Permission | `roleId` + `permissionId` (unique) |

**Isolation** : Toutes les tables métier ont `schoolId` pour isolation tenant.

---

### 1.2 Établissement & Structure Académique

| Table | Description | Relations |
|-------|-------------|-----------|
| `Campus` | Site géographique | `schoolId` → School |
| `AcademicYear` | Année scolaire | `schoolId` → School |
| `Period` | Période (trimestre/semestre) | `academicYearId` → AcademicYear |
| `Level` | Niveau scolaire (CP, CE1, etc.) | `schoolId` → School |
| `Class` | Classe | `schoolId`, `academicYearId`, `levelId` |
| `Group` | Groupe (TP, TD, options) | `schoolId`, `classId` |
| `Room` | Salle | `schoolId`, `campusId` |

---

### 1.3 Élèves & Tuteurs

| Table | Description | Relations |
|-------|-------------|-----------|
| `Student` | Élève | `schoolId` → School, `matricule` (unique) |
| `Guardian` | Parent/Tuteur | `schoolId` → School, `email` (unique), `userId` (optionnel) |
| `StudentGuardian` | Lien élève-parent | `studentId` + `guardianId` (unique) |
| `Enrollment` | Inscription (élève ↔ année ↔ classe) | `studentId`, `academicYearId`, `classId` |
| `StudentGroup` | Affectation élève ↔ groupe | `studentId` + `groupId` (unique) |

**Statuts Student** : `PRE_ENROLLED`, `ENROLLED`, `SUSPENDED`, `TRANSFERRED`, `GRADUATED`, `DROPPED_OUT`

---

### 1.4 Professeurs & Matières

| Table | Description | Relations |
|-------|-------------|-----------|
| `Teacher` | Professeur | `schoolId` → School, `userId` → User (unique) |
| `Subject` | Matière | `schoolId` → School, `code` (unique par école) |
| `TeacherAssignment` | Affectation prof ↔ classe ↔ matière | `teacherId`, `classId`, `subjectId`, `academicYearId` |
| `TeacherAbsence` | Absence professeur | `teacherId` → Teacher |
| `Substitution` | Remplacement | `originalTeacherId`, `substituteTeacherId`, `timetableSlotId` |

---

### 1.5 Emploi du Temps

| Table | Description | Relations |
|-------|-------------|-----------|
| `Timetable` | Emploi du temps | `schoolId`, `academicYearId` |
| `TimetableSlot` | Créneau EDT | `timetableId`, `classId`/`groupId`, `subjectId`, `teacherId`, `roomId` |
| `TimetableException` | Exception (annulation, déplacement) | `slotId` + `date` (unique) |

**Champs TimetableSlot** :
- `dayOfWeek` : 0 (Lundi) à 6 (Dimanche)
- `startTime` / `endTime` : Format "HH:MM"
- `weekPattern` : "A", "B", "ALL" (semaines alternées)

---

### 1.6 Présences & Absences

| Table | Description | Relations |
|-------|-------------|-----------|
| `AttendanceRecord` | Enregistrement présence | `studentId`, `timetableSlotId` (optionnel), `date` |
| `Justification` | Justificatif absence | `studentId` |

**Statuts AttendanceRecord** : `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`

**Unicité** : `studentId` + `timetableSlotId` + `date` (unique)

---

### 1.7 Notes & Évaluations

| Table | Description | Relations |
|-------|-------------|-----------|
| `Assessment` | Évaluation (devoir, contrôle) | `schoolId`, `classId`, `subjectId`, `teacherId`, `periodId` |
| `AssessmentAttachment` | Pièce jointe évaluation | `assessmentId` → Assessment |
| `Grade` | Note | `studentId` + `assessmentId` (unique) |
| `Competency` | Compétence (socle commun) | `schoolId`, `code` (unique) |
| `CompetencyGrade` | Évaluation compétence | `studentId`, `competencyId`, `periodId` |
| `ReportCard` | Bulletin | `studentId`, `academicYearId`, `periodId` |
| `ReportCardComment` | Appréciation matière | `reportCardId`, `subjectId`, `teacherId` |

**Champs Assessment** :
- `maxScore` : Score maximum (ex: 20.00)
- `coefficient` : Coefficient (ex: 1.00, 2.00)
- `isPublished` : Visibilité élèves/parents

**Statuts ReportCard** : `DRAFT`, `GENERATED`, `PUBLISHED`

---

### 1.8 Discipline

| Table | Description | Relations |
|-------|-------------|-----------|
| `Incident` | Incident | `schoolId` → School |
| `StudentIncident` | Lien incident ↔ élève | `incidentId` + `studentId` (unique) |
| `Sanction` | Sanction | `incidentId` (optionnel), `studentId` |

**Types Incident** : `FIGHT`, `INSULT`, `CHEATING`, `ABSENTEEISM`, etc.

**Types Sanction** : `WARNING_ORAL`, `WARNING_WRITTEN`, `DETENTION`, `SUSPENSION`, `EXPULSION`

**Statuts Sanction** : `PENDING`, `APPROVED`, `APPLIED`, `CANCELLED`

---

### 1.9 Finances

| Table | Description | Relations |
|-------|-------------|-----------|
| `Invoice` | Facture | `schoolId`, `studentId`, `invoiceNumber` (unique) |
| `InvoiceItem` | Ligne facture | `invoiceId` → Invoice |
| `InvoiceDiscount` | Remise | `invoiceId` → Invoice |
| `Payment` | Paiement | `invoiceId` → Invoice |
| `Scholarship` | Bourse | `schoolId`, `studentId` |

**Types Invoice** : `ENROLLMENT`, `TUITION`, `ACTIVITY`, `OTHER`

**Statuts Invoice** : `DRAFT`, `SENT`, `PAID`, `PARTIALLY_PAID`, `OVERDUE`, `CANCELLED`

**Champs Invoice** :
- `subtotal`, `discountAmount`, `taxAmount`, `total` : Montants
- `paidAmount` : Montant payé (pour paiements partiels)
- `paymentMethod` : `CASH`, `BANK_TRANSFER`, `CARD`, `CHECK`, `STRIPE`

---

### 1.10 Bibliothèque (Optionnel)

| Table | Description | Relations |
|-------|-------------|-----------|
| `Book` | Livre | `schoolId` → School |
| `BookCopy` | Exemplaire | `bookId` → Book, `barcode` (unique) |
| `Loan` | Emprunt | `studentId`, `copyId` |

**Statuts BookCopy** : `AVAILABLE`, `LOANED`, `LOST`, `DAMAGED`

**Statuts Loan** : `ACTIVE`, `RETURNED`, `OVERDUE`, `LOST`

---

### 1.11 Transport (Optionnel)

| Table | Description | Relations |
|-------|-------------|-----------|
| `TransportLine` | Ligne de bus | `schoolId` → School |
| `TransportStop` | Arrêt | `lineId` → TransportLine |
| `StudentTransport` | Affectation élève ↔ ligne | `studentId`, `lineId`, `stopId` |
| `TransportAttendance` | Présence transport | `transportId` + `date` (unique) |

---

### 1.12 Cantine (Optionnel)

| Table | Description | Relations |
|-------|-------------|-----------|
| `Menu` | Menu | `schoolId` + `date` (unique) |
| `CanteenSubscription` | Abonnement | `studentId` → Student |
| `MealAttendance` | Présence repas | `studentId` + `date` (unique) |

**Types Subscription** : `DAILY`, `WEEKDAYS`, `CUSTOM`

---

### 1.13 Communication

| Table | Description | Relations |
|-------|-------------|-----------|
| `MessageThread` | Fil de conversation | - |
| `MessageThreadParticipant` | Participant thread | `threadId` + `userId` (unique) |
| `Message` | Message | `threadId`, `senderId` → User |
| `MessageAttachment` | Pièce jointe message | `messageId` → Message |
| `Announcement` | Annonce | `schoolId` → School |
| `Notification` | Notification système | `userId` → User |

**Types MessageThread** : `DIRECT`, `GROUP`, `CLASS`

**Types Notification** : `ABSENCE`, `GRADE`, `HOMEWORK`, `MESSAGE`, `INVOICE`, etc.

---

### 1.14 Devoirs (Mini-LMS)

| Table | Description | Relations |
|-------|-------------|-----------|
| `Homework` | Devoir | `schoolId`, `classId`, `subjectId`, `teacherId` |
| `HomeworkAttachment` | Pièce jointe devoir | `homeworkId` → Homework |
| `HomeworkSubmission` | Rendu élève | `homeworkId` + `studentId` (unique) |
| `HomeworkSubmissionAttachment` | Pièce jointe rendu | `submissionId` → HomeworkSubmission |

**Statuts Submission** : `SUBMITTED`, `LATE`, `GRADED`

---

### 1.15 Documents

| Table | Description | Relations |
|-------|-------------|-----------|
| `Document` | Document généré | `schoolId`, `studentId` (optionnel) |
| `DocumentTemplate` | Modèle document | `schoolId` → School |

**Types Document** : `CERTIFICATE`, `TRANSCRIPT`, `ATTESTATION`, `OTHER`

---

### 1.16 Audit & Conformité

| Table | Description | Relations |
|-------|-------------|-----------|
| `AuditLog` | Log audit | `schoolId` (optionnel), `userId` (optionnel) |
| `Consent` | Consentement RGPD | `userId` + `schoolId` + `type` (unique) |

**Champs AuditLog** :
- `action` : "grade:update", "invoice:create", etc.
- `resourceType` : "grade", "invoice", "student"
- `changes` : JSON `{ before: {...}, after: {...} }`

**Types Consent** : `PHOTO`, `COMMUNICATION`, `HEALTH_DATA`, etc.

---

## 2. Indexation & Performance

### 2.1 Index Critiques

Toutes les tables ont des index sur :
- `schoolId` (isolation tenant)
- Clés étrangères fréquentes (`studentId`, `classId`, `teacherId`, etc.)
- Champs de recherche (`email`, `matricule`, `invoiceNumber`, etc.)
- Champs de filtrage (`status`, `date`, `isActive`, etc.)

### 2.2 Index Composés

- `[schoolId, academicYearId, name]` sur `Class` (unicité)
- `[studentId, periodId]` sur `ReportCard` (unicité)
- `[studentId, timetableSlotId, date]` sur `AttendanceRecord` (unicité)
- `[slotId, date]` sur `TimetableException` (unicité)

---

## 3. Contraintes & Validations

### 3.1 Unicité

- `School.slug` : Unique globalement
- `User.email` : Unique globalement
- `Student.matricule` : Unique par école (via `schoolId`)
- `Membership` : `userId` + `schoolId` unique
- `Enrollment` : Un élève ne peut être dans qu'une classe par période (logique métier)

### 3.2 Contraintes Métier

- **AcademicYear** : Une seule année active par école (`isActive = true`)
- **Period** : Dates doivent être dans les limites de `AcademicYear`
- **Enrollment** : `startDate` ≤ `endDate` (si `endDate` défini)
- **Invoice** : `paidAmount` ≤ `total`
- **Grade** : `score` ≤ `Assessment.maxScore` (validation applicative)

---

## 4. Stratégie Multi-Tenant

### 4.1 Row Level Security (RLS)

PostgreSQL RLS policies appliquent l'isolation :

```sql
-- Exemple : Policy pour table Student
CREATE POLICY student_isolation ON students
  FOR ALL
  USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
  );
```

### 4.2 Implémentation Prisma

Middleware Prisma injecte `tenant_id` dans chaque requête :

```typescript
prisma.$use(async (params, next) => {
  // Inject tenant_id from context
  if (params.args.where) {
    params.args.where.schoolId = currentTenantId;
  } else {
    params.args.where = { schoolId: currentTenantId };
  }
  return next(params);
});
```

### 4.3 Tests d'Isolation

Tests automatiques vérifient :
- Un utilisateur ne peut accéder aux données d'un autre tenant
- Les requêtes sans `schoolId` échouent
- Les jointures respectent l'isolation

---

## 5. Relations Clés

### 5.1 Hiérarchie École

```
School
  ├── Campus
  ├── AcademicYear
  │     └── Period
  ├── Level
  │     └── Class (via academicYearId)
  │           └── Group
  └── Room
```

### 5.2 Hiérarchie Élève

```
Student
  ├── Enrollment (↔ AcademicYear ↔ Class)
  ├── StudentGuardian (↔ Guardian)
  ├── StudentGroup (↔ Group)
  ├── AttendanceRecord
  ├── Grade (↔ Assessment)
  ├── ReportCard (↔ Period)
  └── Invoice
```

### 5.3 Hiérarchie Professeur

```
Teacher (↔ User)
  ├── TeacherAssignment (↔ Class ↔ Subject)
  ├── TimetableSlot
  ├── Assessment
  ├── AttendanceRecord
  └── TeacherAbsence → Substitution
```

---

## 6. Données Sensibles & RGPD

### 6.1 Données Personnelles

- **Student** : Nom, prénom, date de naissance, adresse, photo
- **Guardian** : Nom, prénom, email, téléphone, adresse
- **Health Data** : Allergies, médicaments (opt-in, chiffré)

### 6.2 Consentements

Table `Consent` track :
- Type de consentement
- Date de consentement/retrait
- Version du formulaire

### 6.3 Rétention

Politiques de rétention configurables :
- **Notes** : 5 ans après fin scolarité
- **Factures** : 10 ans (obligation légale)
- **Audit Logs** : 7 ans minimum

### 6.4 Anonymisation

Soft delete avec anonymisation :
- Suppression données identifiantes
- Conservation données agrégées (statistiques)
- Archivage sécurisé

---

## 7. Migrations & Évolution

### 7.1 Migrations Prisma

- Migrations versionnées dans `prisma/migrations/`
- Rollback possible (avec précautions)
- Seeds pour données de test

### 7.2 Évolution du Schéma

Stratégie :
1. Ajout colonnes : Toujours nullable d'abord, puis migration données
2. Suppression colonnes : Déprication → Archivage → Suppression
3. Relations : Vérification contraintes avant suppression

---

## 8. Performance & Optimisation

### 8.1 Partitioning (V2)

Tables volumineuses partitionnées par date :
- `audit_log` : Par mois
- `notifications` : Par mois
- `attendance_records` : Par année scolaire

### 8.2 Archivage

Données anciennes archivées :
- Années scolaires clôturées → Archivage
- Documents anciens → Stockage froid (S3 Glacier)

---

## Conclusion

Ce modèle de données :
- ✅ Supporte multi-tenant avec isolation garantie
- ✅ Couvre tous les modules métier
- ✅ Respecte RGPD (consentements, rétention, anonymisation)
- ✅ Optimisé pour performance (index, contraintes)
- ✅ Extensible (JSON fields pour flexibilité)

Le schéma Prisma complet est disponible dans `packages/db/prisma/schema.prisma`.
