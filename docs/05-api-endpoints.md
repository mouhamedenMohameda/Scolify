# API Endpoints - School Administration System

## Vue d'ensemble

API REST avec authentification JWT et isolation multi-tenant. Tous les endpoints nécessitent :
- Header `Authorization: Bearer <token>`
- Header `X-Tenant-Id: <schoolId>` (optionnel si dans JWT)

**Format de réponse standard** :
```typescript
{
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

---

## 1. Authentification

### POST `/api/auth/register`
Création compte utilisateur.

**Body** :
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response** : `{ success: true, data: { user: {...}, token: "..." } }`

---

### POST `/api/auth/login`
Connexion.

**Body** :
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response** : `{ success: true, data: { user: {...}, token: "..." } }`

---

### POST `/api/auth/refresh`
Rafraîchir token.

**Headers** : `Authorization: Bearer <refreshToken>`

**Response** : `{ success: true, data: { token: "..." } }`

---

### POST `/api/auth/logout`
Déconnexion.

**Response** : `{ success: true }`

---

## 2. Élèves

### GET `/api/students`
Liste élèves (paginated, filtrable).

**Query params** :
- `page` : Numéro page (défaut: 1)
- `limit` : Éléments par page (défaut: 20, max: 100)
- `search` : Recherche (nom, prénom, matricule)
- `status` : Filtre statut (`ENROLLED`, `SUSPENDED`, etc.)
- `classId` : Filtre par classe
- `levelId` : Filtre par niveau
- `sort` : Tri (`name`, `matricule`, `createdAt`)
- `order` : Ordre (`asc`, `desc`)

**Response** :
```json
{
  "success": true,
  "data": {
    "students": [...],
    "pagination": {...}
  }
}
```

**Permissions** : `students:read:all` ou `students:read:assigned` ou `students:read:own_children`

---

### GET `/api/students/:id`
Détail élève.

**Response** : `{ success: true, data: { student: {...} } }`

**Permissions** : `students:read:all` ou scope limité

---

### POST `/api/students`
Création élève.

**Body** :
```json
{
  "firstName": "Alice",
  "lastName": "Martin",
  "dateOfBirth": "2010-05-15",
  "gender": "F",
  "address": "123 Rue Example",
  "city": "Paris",
  "postalCode": "75001",
  "phone": "+33123456789",
  "email": "alice.martin@example.com",
  "classId": "uuid-class",
  "academicYearId": "uuid-year",
  "healthNotes": "Allergie aux arachides",
  "allergies": ["PEANUTS"]
}
```

**Response** : `{ success: true, data: { student: {...} } }`

**Permissions** : `students:write:all`

---

### PUT `/api/students/:id`
Modification élève.

**Body** : Champs à modifier (partiel)

**Response** : `{ success: true, data: { student: {...} } }`

**Permissions** : `students:write:all`

---

### DELETE `/api/students/:id`
Suppression élève (soft delete).

**Response** : `{ success: true }`

**Permissions** : `students:delete:all`

---

### GET `/api/students/:id/documents`
Documents de l'élève.

**Response** : `{ success: true, data: { documents: [...] } }`

---

### POST `/api/students/:id/documents`
Upload document.

**Body** : FormData avec fichier

**Response** : `{ success: true, data: { document: {...} } }`

---

### GET `/api/students/:id/guardians`
Parents/tuteurs de l'élève.

**Response** : `{ success: true, data: { guardians: [...] } }`

---

### POST `/api/students/:id/guardians`
Ajout parent/tuteur.

**Body** :
```json
{
  "guardianId": "uuid-guardian",
  "relationship": "MOTHER",
  "isPrimary": true,
  "canPickup": true,
  "canAuthorize": true
}
```

---

## 3. Classes

### GET `/api/classes`
Liste classes.

**Query params** :
- `academicYearId` : Filtre année scolaire
- `levelId` : Filtre niveau
- `search` : Recherche nom classe

**Response** : `{ success: true, data: { classes: [...] } }`

**Permissions** : `classes:read:all` ou scope limité

---

### GET `/api/classes/:id`
Détail classe.

**Response** : `{ success: true, data: { class: {...}, students: [...], teachers: [...] } }`

---

### POST `/api/classes`
Création classe.

**Body** :
```json
{
  "name": "6ème A",
  "code": "6A",
  "levelId": "uuid-level",
  "academicYearId": "uuid-year",
  "capacity": 30,
  "roomId": "uuid-room",
  "principalTeacherId": "uuid-teacher"
}
```

**Permissions** : `classes:write:all`

---

### PUT `/api/classes/:id/students`
Affectation élèves à classe.

**Body** :
```json
{
  "studentIds": ["uuid1", "uuid2", "uuid3"],
  "startDate": "2024-09-01"
}
```

**Permissions** : `classes:students:assign`

---

## 4. Notes & Évaluations

### GET `/api/assessments`
Liste évaluations.

**Query params** :
- `classId` : Filtre classe
- `subjectId` : Filtre matière
- `periodId` : Filtre période
- `teacherId` : Filtre professeur
- `isPublished` : Filtre publication

**Response** : `{ success: true, data: { assessments: [...] } }`

**Permissions** : `grades:read:all` ou scope limité

---

### POST `/api/assessments`
Création évaluation.

**Body** :
```json
{
  "name": "Contrôle Math Chapitre 3",
  "type": "TEST",
  "classId": "uuid-class",
  "subjectId": "uuid-subject",
  "periodId": "uuid-period",
  "maxScore": 20.00,
  "coefficient": 2.00,
  "date": "2024-10-15",
  "dueDate": "2024-10-20",
  "isPublished": false
}
```

**Permissions** : `grades:write:all` ou `grades:write:assigned`

---

### GET `/api/assessments/:id/grades`
Notes de l'évaluation.

**Response** : `{ success: true, data: { grades: [...] } }`

---

### POST `/api/assessments/:id/grades`
Saisie notes (batch).

**Body** :
```json
{
  "grades": [
    { "studentId": "uuid1", "score": 15.5, "comment": "Bien" },
    { "studentId": "uuid2", "score": 18.0, "comment": "Très bien" }
  ]
}
```

**Permissions** : `grades:write:all` ou `grades:write:assigned`

---

### PUT `/api/grades/:id`
Modification note.

**Body** :
```json
{
  "score": 16.5,
  "comment": "Amélioration"
}
```

**Permissions** : `grades:write:all` ou `grades:write:assigned` (own)

---

### GET `/api/students/:id/grades`
Notes d'un élève.

**Query params** :
- `periodId` : Filtre période
- `subjectId` : Filtre matière

**Response** : `{ success: true, data: { grades: [...] } }`

**Permissions** : `grades:read:all` ou scope limité

---

### GET `/api/report-cards`
Liste bulletins.

**Query params** :
- `studentId` : Filtre élève
- `periodId` : Filtre période
- `academicYearId` : Filtre année

**Response** : `{ success: true, data: { reportCards: [...] } }`

---

### POST `/api/report-cards/generate`
Génération bulletins (batch job).

**Body** :
```json
{
  "periodId": "uuid-period",
  "classId": "uuid-class", // Optionnel : générer pour une classe
  "studentIds": ["uuid1", "uuid2"] // Optionnel : générer pour élèves spécifiques
}
```

**Response** : `{ success: true, data: { jobId: "uuid-job" } }`

**Permissions** : `report_cards:generate:all`

---

### GET `/api/report-cards/:id`
Détail bulletin (avec PDF URL).

**Response** : `{ success: true, data: { reportCard: {...}, pdfUrl: "https://..." } }`

---

## 5. Présences

### GET `/api/attendance`
Liste présences.

**Query params** :
- `studentId` : Filtre élève
- `classId` : Filtre classe
- `date` : Filtre date (format: YYYY-MM-DD)
- `dateFrom` / `dateTo` : Plage dates
- `status` : Filtre statut (`PRESENT`, `ABSENT`, `LATE`)

**Response** : `{ success: true, data: { records: [...] } }`

**Permissions** : `attendance:read:all` ou scope limité

---

### POST `/api/attendance`
Création enregistrement présence (pointage).

**Body** :
```json
{
  "timetableSlotId": "uuid-slot",
  "date": "2024-10-15",
  "records": [
    { "studentId": "uuid1", "status": "PRESENT" },
    { "studentId": "uuid2", "status": "ABSENT", "reason": "Maladie" },
    { "studentId": "uuid3", "status": "LATE", "minutesLate": 15 }
  ]
}
```

**Permissions** : `attendance:write:all` ou `attendance:write:assigned`

---

### POST `/api/attendance/justifications`
Création justificatif.

**Body** :
```json
{
  "studentId": "uuid-student",
  "date": "2024-10-15",
  "reason": "Maladie",
  "documentUrl": "https://..." // Optionnel
}
```

**Response** : `{ success: true, data: { justification: {...} } }`

**Permissions** : `attendance:justify:all` ou `attendance:justify:own_children`

---

### PUT `/api/attendance/justifications/:id/approve`
Validation justificatif.

**Body** :
```json
{
  "status": "APPROVED", // ou "REJECTED"
  "notes": "Justificatif médical valide"
}
```

**Permissions** : `attendance:justify:all`

---

## 6. Emploi du Temps

### GET `/api/timetable`
Emploi du temps.

**Query params** :
- `academicYearId` : Année scolaire
- `classId` : Filtre classe
- `teacherId` : Filtre professeur
- `roomId` : Filtre salle
- `week` : Semaine (format: YYYY-WW)

**Response** : `{ success: true, data: { slots: [...] } }`

**Permissions** : `timetable:read:all` ou scope limité

---

### POST `/api/timetable/slots`
Création créneau EDT.

**Body** :
```json
{
  "timetableId": "uuid-timetable",
  "classId": "uuid-class",
  "subjectId": "uuid-subject",
  "teacherId": "uuid-teacher",
  "roomId": "uuid-room",
  "dayOfWeek": 1, // 0 = Lundi
  "startTime": "08:00",
  "endTime": "09:00",
  "weekPattern": "ALL", // "A", "B", "ALL"
  "startDate": "2024-09-01",
  "endDate": "2025-06-30"
}
```

**Permissions** : `timetable:write:all`

---

### PUT `/api/timetable/slots/:id`
Modification créneau.

**Body** : Champs à modifier

**Permissions** : `timetable:write:all`

---

### DELETE `/api/timetable/slots/:id`
Suppression créneau.

**Permissions** : `timetable:write:all`

---

### GET `/api/timetable/conflicts`
Détection conflits.

**Query params** :
- `timetableId` : Emploi du temps
- `dateFrom` / `dateTo` : Plage dates

**Response** : `{ success: true, data: { conflicts: [...] } }`

**Permissions** : `timetable:conflicts:resolve`

---

### POST `/api/timetable/exceptions`
Création exception (annulation, déplacement).

**Body** :
```json
{
  "slotId": "uuid-slot",
  "date": "2024-10-20",
  "type": "CANCELLED", // ou "MOVED", "ROOM_CHANGE"
  "newRoomId": "uuid-room", // Si type = "ROOM_CHANGE"
  "notes": "Jour férié"
}
```

**Permissions** : `timetable:write:all`

---

## 7. Finances

### GET `/api/invoices`
Liste factures.

**Query params** :
- `studentId` : Filtre élève
- `status` : Filtre statut
- `dateFrom` / `dateTo` : Plage dates
- `overdue` : Factures impayées (`true`/`false`)

**Response** : `{ success: true, data: { invoices: [...] } }`

**Permissions** : `invoices:read:all` ou scope limité

---

### POST `/api/invoices`
Création facture.

**Body** :
```json
{
  "studentId": "uuid-student",
  "type": "TUITION",
  "dueDate": "2024-11-01",
  "items": [
    {
      "description": "Mensualité Octobre 2024",
      "quantity": 1,
      "unitPrice": 500.00
    }
  ],
  "discounts": [
    {
      "type": "PERCENTAGE",
      "value": 10.00,
      "reason": "Réduction fratrie"
    }
  ]
}
```

**Permissions** : `invoices:write:all`

---

### GET `/api/invoices/:id`
Détail facture.

**Response** : `{ success: true, data: { invoice: {...}, payments: [...] } }`

---

### POST `/api/invoices/:id/payments`
Enregistrement paiement.

**Body** :
```json
{
  "amount": 500.00,
  "method": "BANK_TRANSFER",
  "reference": "VIR-2024-001",
  "receiptUrl": "https://..." // Optionnel
}
```

**Permissions** : `payments:write:all`

---

### POST `/api/invoices/:id/send`
Envoi facture par email.

**Response** : `{ success: true }`

**Permissions** : `invoices:write:all`

---

### GET `/api/payments`
Liste paiements.

**Query params** : Similaires à `/api/invoices`

**Response** : `{ success: true, data: { payments: [...] } }`

**Permissions** : `payments:read:all` ou scope limité

---

## 8. Discipline

### GET `/api/incidents`
Liste incidents.

**Query params** :
- `studentId` : Filtre élève
- `type` : Filtre type
- `status` : Filtre statut
- `dateFrom` / `dateTo` : Plage dates

**Response** : `{ success: true, data: { incidents: [...] } }`

**Permissions** : `incidents:read:all` ou scope limité

---

### POST `/api/incidents`
Création incident.

**Body** :
```json
{
  "date": "2024-10-15",
  "type": "FIGHT",
  "description": "Bagarre dans la cour",
  "location": "Cour de récréation",
  "students": [
    { "studentId": "uuid1", "role": "PERPETRATOR" },
    { "studentId": "uuid2", "role": "PERPETRATOR" }
  ]
}
```

**Permissions** : `incidents:write:all` ou `incidents:write:assigned`

---

### POST `/api/sanctions`
Création sanction.

**Body** :
```json
{
  "incidentId": "uuid-incident", // Optionnel
  "studentId": "uuid-student",
  "type": "DETENTION",
  "description": "Retenue pour bagarre",
  "startDate": "2024-10-20",
  "endDate": "2024-10-20"
}
```

**Permissions** : `sanctions:write:all` ou `sanctions:write:assigned`

---

### PUT `/api/sanctions/:id/approve`
Approbation sanction.

**Body** :
```json
{
  "status": "APPROVED"
}
```

**Permissions** : `sanctions:approve:all`

---

## 9. Communication

### GET `/api/messages`
Liste conversations.

**Response** : `{ success: true, data: { threads: [...] } }`

**Permissions** : `messages:read:all` (scope: own_threads)

---

### POST `/api/messages/threads`
Création conversation.

**Body** :
```json
{
  "participantIds": ["uuid1", "uuid2"],
  "subject": "Question sur les notes",
  "type": "DIRECT"
}
```

**Response** : `{ success: true, data: { thread: {...} } }`

---

### GET `/api/messages/threads/:id`
Messages d'une conversation.

**Query params** :
- `page` / `limit` : Pagination

**Response** : `{ success: true, data: { messages: [...] } }`

---

### POST `/api/messages/threads/:id/messages`
Envoi message.

**Body** :
```json
{
  "content": "Bonjour, j'aimerais discuter des notes de mon enfant.",
  "attachments": ["https://..."] // Optionnel
}
```

**Permissions** : `messages:write:all` (scope: own_threads)

---

### GET `/api/announcements`
Liste annonces.

**Query params** :
- `type` : Filtre type
- `active` : Annonces actives (`true`/`false`)

**Response** : `{ success: true, data: { announcements: [...] } }`

**Permissions** : `announcements:read:all`

---

### POST `/api/announcements`
Création annonce.

**Body** :
```json
{
  "title": "Réunion parents-professeurs",
  "content": "La réunion aura lieu le...",
  "type": "INFO",
  "targetAudience": ["ALL"], // ou ["TEACHERS", "PARENTS", "STUDENTS", "classId:uuid"]
  "publishDate": "2024-10-15",
  "expiryDate": "2024-10-30"
}
```

**Permissions** : `announcements:write:all`

---

### GET `/api/notifications`
Notifications utilisateur.

**Query params** :
- `isRead` : Filtre lu/non lu
- `type` : Filtre type

**Response** : `{ success: true, data: { notifications: [...] } }`

**Permissions** : `notifications:read:all` (scope: own)

---

### PUT `/api/notifications/:id/read`
Marquer notification comme lue.

**Response** : `{ success: true }`

---

## 10. Devoirs

### GET `/api/homework`
Liste devoirs.

**Query params** :
- `classId` : Filtre classe
- `subjectId` : Filtre matière
- `dueDateFrom` / `dueDateTo` : Plage dates
- `isPublished` : Filtre publication

**Response** : `{ success: true, data: { homeworks: [...] } }`

---

### POST `/api/homework`
Création devoir.

**Body** :
```json
{
  "classId": "uuid-class",
  "subjectId": "uuid-subject",
  "title": "Devoir Math Chapitre 3",
  "description": "Exercices pages 45-47",
  "dueDate": "2024-10-25",
  "attachments": ["https://..."]
}
```

**Permissions** : `homework:write:all` ou `homework:write:assigned`

---

### GET `/api/homework/:id/submissions`
Rendus du devoir.

**Response** : `{ success: true, data: { submissions: [...] } }`

---

### POST `/api/homework/:id/submit`
Soumission rendu (élève).

**Body** :
```json
{
  "content": "J'ai terminé les exercices...",
  "attachments": ["https://..."]
}
```

**Permissions** : `homework:submit:own`

---

### PUT `/api/homework/submissions/:id/grade`
Correction rendu (professeur).

**Body** :
```json
{
  "grade": 18.5,
  "feedback": "Excellent travail"
}
```

**Permissions** : `homework:grade:assigned`

---

## 11. Exports & Rapports

### POST `/api/exports/students`
Export élèves (CSV/Excel).

**Body** :
```json
{
  "format": "CSV", // ou "EXCEL"
  "filters": {
    "classId": "uuid-class",
    "status": "ENROLLED"
  },
  "fields": ["matricule", "firstName", "lastName", "email", "class"]
}
```

**Response** : `{ success: true, data: { jobId: "uuid-job", downloadUrl: "https://..." } }`

**Permissions** : `students:export:all`

---

### POST `/api/exports/grades`
Export notes.

**Body** :
```json
{
  "format": "EXCEL",
  "periodId": "uuid-period",
  "classId": "uuid-class"
}
```

**Permissions** : `grades:export:all`

---

### POST `/api/exports/attendance`
Export présences.

**Body** :
```json
{
  "format": "CSV",
  "dateFrom": "2024-09-01",
  "dateTo": "2024-10-31",
  "classId": "uuid-class"
}
```

**Permissions** : `attendance:export:all`

---

### GET `/api/reports/dashboard`
Données dashboard (KPIs).

**Query params** :
- `periodId` : Période
- `classId` : Classe (optionnel)

**Response** :
```json
{
  "success": true,
  "data": {
    "totalStudents": 250,
    "totalTeachers": 15,
    "attendanceRate": 95.5,
    "averageGrade": 14.2,
    "pendingInvoices": 5,
    "recentIncidents": 2
  }
}
```

**Permissions** : `reports:read:all`

---

## 12. Paramétrage

### GET `/api/settings/subjects`
Liste matières.

**Response** : `{ success: true, data: { subjects: [...] } }`

---

### POST `/api/settings/subjects`
Création matière.

**Body** :
```json
{
  "code": "MATH",
  "name": "Mathématiques",
  "levelId": "uuid-level",
  "color": "#FF5733"
}
```

**Permissions** : `settings:write:all`

---

### GET `/api/settings/roles`
Liste rôles.

**Response** : `{ success: true, data: { roles: [...] } }`

---

### POST `/api/settings/roles`
Création rôle personnalisé.

**Body** :
```json
{
  "name": "Professeur Principal",
  "description": "Professeur avec responsabilités classe",
  "permissions": ["students:read:assigned", "grades:write:assigned", ...]
}
```

**Permissions** : `settings:roles:manage`

---

## 13. Jobs Asynchrones

### GET `/api/jobs/:id`
Statut job asynchrone.

**Response** :
```json
{
  "success": true,
  "data": {
    "jobId": "uuid-job",
    "status": "COMPLETED", // PENDING, PROCESSING, COMPLETED, FAILED
    "progress": 100,
    "result": {
      "downloadUrl": "https://..."
    },
    "error": null
  }
}
```

---

## 14. Gestion des Erreurs

### Codes HTTP

- `200` : Succès
- `201` : Créé
- `400` : Requête invalide
- `401` : Non authentifié
- `403` : Permission refusée
- `404` : Ressource non trouvée
- `409` : Conflit (ex: doublon)
- `422` : Validation échouée
- `500` : Erreur serveur

### Format Erreur

```json
{
  "success": false,
  "error": "Message d'erreur",
  "code": "VALIDATION_ERROR", // Optionnel
  "details": {
    "field": "email",
    "message": "Email invalide"
  }
}
```

---

## 15. Pagination

Tous les endpoints list retournent pagination :

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Query params standards** :
- `page` : Numéro page (défaut: 1)
- `limit` : Éléments par page (défaut: 20, max: 100)

---

## 16. Filtres & Recherche

### Recherche textuelle

Paramètre `search` sur endpoints list :
- Recherche dans champs pertinents (nom, prénom, email, matricule, etc.)
- Recherche full-text PostgreSQL

### Filtres dates

- `date` : Date exacte (format: YYYY-MM-DD)
- `dateFrom` / `dateTo` : Plage dates

### Tri

- `sort` : Champ de tri
- `order` : `asc` ou `desc`

---

## Conclusion

Cette API REST :
- ✅ RESTful avec conventions standards
- ✅ Authentification JWT
- ✅ Isolation multi-tenant
- ✅ Permissions granulaires (RBAC)
- ✅ Pagination, filtres, tri
- ✅ Validation stricte (Zod)
- ✅ Gestion erreurs standardisée
- ✅ Jobs asynchrones pour opérations longues

**Alternative V2** : Migration vers tRPC pour type-safety end-to-end.
