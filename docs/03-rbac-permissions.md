# RBAC & Permissions - School Administration System

## 1. Vue d'ensemble

Système de contrôle d'accès basé sur les rôles (RBAC) avec :
- **Multi-tenant** : Isolation par école (tenant)
- **Rôles hiérarchiques** : Rôles système + rôles personnalisables par école
- **Permissions granulaires** : Contrôle fin par module et action
- **Héritage** : Rôles peuvent hériter de permissions d'autres rôles

---

## 2. Architecture RBAC

### 2.1 Modèle de Données

```
User (utilisateur système)
  ↓
Membership (appartenance User ↔ School avec Role)
  ↓
Role (rôle dans une école)
  ↓
Permission (permission spécifique)
  ↓
RolePermission (association Role ↔ Permission)
```

### 2.2 Concepts

- **User** : Utilisateur de la plateforme (peut avoir plusieurs membreships)
- **Membership** : Lien User ↔ School avec un Role spécifique
- **Role** : Rôle dans une école (ex: "Professeur", "Parent")
- **Permission** : Permission atomique (ex: `students:read`, `grades:write`)
- **Scope** : Portée de la permission (all, own, assigned)

---

## 3. Rôles Système

### 3.1 Rôles Globaux (Plateforme)

| Rôle | Description | Usage |
|------|-------------|-------|
| **PLATFORM_ADMIN** | Super-admin plateforme | Gestion tenants, support technique |
| **SUPPORT** | Support technique | Accès limité pour debugging |

### 3.2 Rôles École (Par Tenant)

| Rôle | Code | Description | Scope |
|------|------|-------------|-------|
| **Admin École** | `SCHOOL_ADMIN` | Direction, accès complet école | Toute l'école |
| **Secrétariat** | `SECRETARY` | Gestion administrative | Toute l'école (sauf finances sensibles) |
| **Professeur** | `TEACHER` | Enseignement, notes, présences | Classes assignées |
| **Élève** | `STUDENT` | Consultation propres données | Soi-même uniquement |
| **Parent** | `PARENT` | Suivi enfants | Enfants uniquement |
| **Comptable** | `ACCOUNTANT` | Gestion finances | Toute l'école (finances) |
| **Surveillant** | `SUPERVISOR` | Vie scolaire, discipline | Classes assignées |
| **Bibliothécaire** | `LIBRARIAN` | Gestion bibliothèque | Module bibliothèque |
| **Infirmier** | `NURSE` | Suivi santé | Données santé élèves |
| **Chauffeur** | `DRIVER` | Transport scolaire | Module transport |
| **RH** | `HR` | Ressources humaines | Module RH |
| **Responsable Cantine** | `CANTEEN_MANAGER` | Gestion cantine | Module cantine |

---

## 4. Matrice de Permissions

### Format : `module:action:scope`

- **module** : `students`, `classes`, `grades`, `attendance`, `timetable`, `finance`, etc.
- **action** : `read`, `write`, `delete`, `export`, `approve`
- **scope** : `all` (toute l'école), `own` (ses propres données), `assigned` (classes assignées)

### 4.1 Module : Élèves (`students`)

| Permission | SCHOOL_ADMIN | SECRETARY | TEACHER | PARENT | STUDENT |
|------------|--------------|-----------|---------|--------|---------|
| `students:read:all` | ✅ | ✅ | ⚠️ assigned | ⚠️ own_children | ⚠️ own |
| `students:write:all` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `students:delete:all` | ✅ | ⚠️ | ❌ | ❌ | ❌ |
| `students:export:all` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `students:health:read` | ✅ | ✅ | ⚠️ assigned | ⚠️ own_children | ⚠️ own |
| `students:documents:read` | ✅ | ✅ | ⚠️ assigned | ⚠️ own_children | ⚠️ own |
| `students:documents:upload` | ✅ | ✅ | ⚠️ assigned | ⚠️ own_children | ❌ |

**Légende** :
- ✅ : Accès complet
- ⚠️ : Accès limité (scope)
- ❌ : Pas d'accès

### 4.2 Module : Classes (`classes`)

| Permission | SCHOOL_ADMIN | SECRETARY | TEACHER | PARENT | STUDENT |
|------------|--------------|-----------|---------|--------|---------|
| `classes:read:all` | ✅ | ✅ | ⚠️ assigned | ⚠️ children_classes | ⚠️ own_class |
| `classes:write:all` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `classes:students:assign` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `classes:export:all` | ✅ | ✅ | ⚠️ assigned | ❌ | ❌ |

### 4.3 Module : Notes (`grades`)

| Permission | SCHOOL_ADMIN | SECRETARY | TEACHER | PARENT | STUDENT |
|------------|--------------|-----------|---------|--------|---------|
| `grades:read:all` | ✅ | ✅ | ⚠️ assigned | ⚠️ own_children | ⚠️ own |
| `grades:write:all` | ✅ | ❌ | ⚠️ assigned | ❌ | ❌ |
| `grades:delete:all` | ✅ | ❌ | ⚠️ own | ❌ | ❌ |
| `grades:export:all` | ✅ | ✅ | ⚠️ assigned | ❌ | ❌ |
| `report_cards:generate:all` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `report_cards:read:all` | ✅ | ✅ | ⚠️ assigned | ⚠️ own_children | ⚠️ own |

### 4.4 Module : Présences (`attendance`)

| Permission | SCHOOL_ADMIN | SECRETARY | TEACHER | PARENT | STUDENT |
|------------|--------------|-----------|---------|--------|---------|
| `attendance:read:all` | ✅ | ✅ | ⚠️ assigned | ⚠️ own_children | ⚠️ own |
| `attendance:write:all` | ✅ | ✅ | ⚠️ assigned | ❌ | ❌ |
| `attendance:justify:all` | ✅ | ✅ | ⚠️ assigned | ⚠️ own_children | ❌ |
| `attendance:export:all` | ✅ | ✅ | ⚠️ assigned | ❌ | ❌ |

### 4.5 Module : Emploi du Temps (`timetable`)

| Permission | SCHOOL_ADMIN | SECRETARY | TEACHER | PARENT | STUDENT |
|------------|--------------|-----------|---------|--------|---------|
| `timetable:read:all` | ✅ | ✅ | ⚠️ assigned | ⚠️ children_classes | ⚠️ own |
| `timetable:write:all` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `timetable:conflicts:resolve` | ✅ | ✅ | ❌ | ❌ | ❌ |

### 4.6 Module : Finances (`finance`)

| Permission | SCHOOL_ADMIN | ACCOUNTANT | SECRETARY | PARENT | STUDENT |
|------------|--------------|------------|-----------|--------|---------|
| `invoices:read:all` | ✅ | ✅ | ⚠️ limited | ⚠️ own | ❌ |
| `invoices:write:all` | ✅ | ✅ | ⚠️ limited | ❌ | ❌ |
| `invoices:delete:all` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `payments:read:all` | ✅ | ✅ | ⚠️ limited | ⚠️ own | ❌ |
| `payments:write:all` | ✅ | ✅ | ⚠️ limited | ❌ | ❌ |
| `payments:approve:all` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `finance:export:all` | ✅ | ✅ | ❌ | ❌ | ❌ |

### 4.7 Module : Discipline (`discipline`)

| Permission | SCHOOL_ADMIN | SUPERVISOR | TEACHER | PARENT | STUDENT |
|------------|--------------|------------|---------|--------|---------|
| `incidents:read:all` | ✅ | ⚠️ assigned | ⚠️ assigned | ⚠️ own_children | ⚠️ own |
| `incidents:write:all` | ✅ | ⚠️ assigned | ⚠️ assigned | ❌ | ❌ |
| `sanctions:read:all` | ✅ | ⚠️ assigned | ⚠️ assigned | ⚠️ own_children | ⚠️ own |
| `sanctions:write:all` | ✅ | ⚠️ assigned | ❌ | ❌ | ❌ |
| `sanctions:approve:all` | ✅ | ⚠️ assigned | ❌ | ❌ | ❌ |

### 4.8 Module : Communication (`communication`)

| Permission | SCHOOL_ADMIN | SECRETARY | TEACHER | PARENT | STUDENT |
|------------|--------------|-----------|---------|--------|---------|
| `messages:read:all` | ✅ | ✅ | ⚠️ own_threads | ⚠️ own_threads | ⚠️ own_threads |
| `messages:write:all` | ✅ | ✅ | ⚠️ own_threads | ⚠️ own_threads | ⚠️ own_threads |
| `announcements:read:all` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `announcements:write:all` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `notifications:read:all` | ✅ | ✅ | ⚠️ own | ⚠️ own | ⚠️ own |

### 4.9 Module : Paramétrage (`settings`)

| Permission | SCHOOL_ADMIN | SECRETARY | TEACHER | PARENT | STUDENT |
|------------|--------------|-----------|---------|--------|---------|
| `settings:read:all` | ✅ | ✅ | ⚠️ limited | ❌ | ❌ |
| `settings:write:all` | ✅ | ⚠️ limited | ❌ | ❌ | ❌ |
| `settings:users:manage` | ✅ | ⚠️ limited | ❌ | ❌ | ❌ |
| `settings:roles:manage` | ✅ | ❌ | ❌ | ❌ | ❌ |

### 4.10 Modules Optionnels

#### Bibliothèque (`library`)
- `LIBRARIAN` : Accès complet
- `TEACHER`, `STUDENT`, `PARENT` : Lecture catalogue, gestion propres emprunts

#### Transport (`transport`)
- `DRIVER` : Accès complet module transport
- `SCHOOL_ADMIN`, `SECRETARY` : Gestion lignes, affectations
- `PARENT`, `STUDENT` : Consultation ligne assignée

#### Cantine (`canteen`)
- `CANTEEN_MANAGER` : Accès complet
- `SCHOOL_ADMIN`, `SECRETARY` : Gestion menus, abonnements
- `PARENT`, `STUDENT` : Consultation menus, abonnements

#### RH (`hr`)
- `HR` : Accès complet module RH
- `SCHOOL_ADMIN` : Accès complet
- `TEACHER` : Consultation propres données

---

## 5. Implémentation Technique

### 5.1 Middleware d'Authentification

```typescript
// Vérifie JWT + extrait tenant_id + user_id
export async function authMiddleware(req: Request) {
  const token = extractToken(req);
  const payload = verifyJWT(token);
  return {
    userId: payload.userId,
    tenantId: payload.tenantId,
    membershipId: payload.membershipId,
  };
}
```

### 5.2 Middleware RBAC

```typescript
// Vérifie permission avec scope
export async function checkPermission(
  userId: string,
  tenantId: string,
  permission: string,
  resource?: { studentId?: string; classId?: string; ... }
) {
  // 1. Récupérer membership + role
  const membership = await getMembership(userId, tenantId);
  const role = await getRole(membership.roleId);
  
  // 2. Vérifier permission
  const hasPermission = await checkRolePermission(role.id, permission);
  if (!hasPermission) throw new ForbiddenError();
  
  // 3. Appliquer scope
  return applyScope(permission, membership, resource);
}
```

### 5.3 Scope Application

**Exemples de scopes** :

- **`all`** : Pas de filtre (admin)
- **`assigned`** : Filtre sur classes assignées au professeur
- **`own_children`** : Filtre sur enfants du parent
- **`own`** : Filtre sur données de l'utilisateur lui-même
- **`limited`** : Accès partiel (ex: secrétariat voit factures mais pas finances sensibles)

### 5.4 Row Level Security (RLS)

PostgreSQL RLS policies appliquent l'isolation tenant + scope :

```sql
-- Exemple : Policy pour table students
CREATE POLICY student_isolation ON students
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
  AND (
    -- Scope "all" : pas de filtre supplémentaire
    -- Scope "assigned" : filtre sur classes assignées
    -- Scope "own_children" : filtre sur enfants
  );
```

---

## 6. Audit & Traçabilité

### 6.1 Actions Auditées

Toutes les actions sensibles sont journalisées :
- Modification notes
- Création/modification factures
- Application sanctions
- Modification EDT
- Accès données sensibles (santé, finances)
- Changements permissions

### 6.2 Format Audit Log

```typescript
{
  id: string;
  tenantId: string;
  userId: string;
  action: string; // "grade:update", "invoice:create"
  resourceType: string; // "grade", "invoice"
  resourceId: string;
  changes?: { before: any; after: any };
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}
```

---

## 7. Rôles Personnalisables

### 7.1 Concept

Les écoles peuvent créer des rôles personnalisés :
- Exemple : "Professeur Principal", "Coordonnateur Niveau"
- Héritage : Rôle peut hériter d'un rôle système
- Permissions : Ajout/suppression permissions spécifiques

### 7.2 Limitations

- Rôles système ne peuvent être modifiés
- Rôles personnalisés ne peuvent avoir plus de permissions que `SCHOOL_ADMIN`
- Audit : Toutes modifications rôles journalisées

---

## 8. Matrice Complète (Résumé)

| Rôle | Accès Principal | Restrictions |
|------|-----------------|--------------|
| **PLATFORM_ADMIN** | Toute la plateforme (tous tenants) | Aucune |
| **SCHOOL_ADMIN** | Toute l'école | Aucune (dans son école) |
| **SECRETARY** | Administration (sauf finances sensibles) | Pas de suppression majeure, pas de modification règles |
| **TEACHER** | Classes assignées uniquement | Pas d'accès finances, pas de modification structure |
| **STUDENT** | Données personnelles uniquement | Lecture seule (sauf profil) |
| **PARENT** | Données enfants uniquement | Lecture seule (sauf communication) |
| **ACCOUNTANT** | Module finances uniquement | Pas d'accès autres modules |
| **SUPERVISOR** | Vie scolaire, classes assignées | Pas d'accès notes, finances |
| **LIBRARIAN** | Module bibliothèque uniquement | Isolation module |
| **NURSE** | Données santé élèves | Isolation données santé |
| **DRIVER** | Module transport uniquement | Isolation module |
| **HR** | Module RH uniquement | Isolation module |
| **CANTEEN_MANAGER** | Module cantine uniquement | Isolation module |

---

## 9. Exemples d'Usage

### 9.1 Professeur consulte notes de sa classe

```typescript
// Permission requise : grades:read:assigned
// Scope appliqué : Filtre sur classes assignées au professeur
const grades = await gradeService.getGrades({
  classId: classId, // Vérifié : classe assignée au prof
  teacherId: currentUser.id,
});
```

### 9.2 Parent consulte absences de son enfant

```typescript
// Permission requise : attendance:read:own_children
// Scope appliqué : Filtre sur enfants du parent
const absences = await attendanceService.getAbsences({
  studentId: studentId, // Vérifié : enfant du parent
  parentId: currentUser.id,
});
```

### 9.3 Admin génère bulletin

```typescript
// Permission requise : report_cards:generate:all
// Scope : Pas de filtre (admin)
const reportCard = await reportCardService.generate({
  studentId: studentId,
  periodId: periodId,
});
```

---

## 10. Sécurité Supplémentaire

### 10.1 Vérifications Multiples

- **Middleware** : Vérification permission
- **Service Layer** : Vérification scope métier
- **Database RLS** : Isolation au niveau SQL
- **Frontend** : Masquage UI selon permissions (UX, pas sécurité)

### 10.2 Tests d'Isolation

Tests automatiques pour vérifier :
- Un utilisateur ne peut accéder aux données d'un autre tenant
- Un professeur ne peut voir que ses classes assignées
- Un parent ne peut voir que ses enfants

---

## 11. Migration & Évolution

### 11.1 Ajout Nouvelle Permission

1. Ajout permission dans enum `Permission`
2. Migration DB : Ajout colonne si nécessaire
3. Attribution aux rôles appropriés
4. Mise à jour middleware/service
5. Tests

### 11.2 Création Rôle Personnalisé

1. Admin école crée rôle via UI
2. Sélection permissions depuis liste
3. Enregistrement → Application immédiate
4. Audit log créé

---

## Conclusion

Ce système RBAC offre :
- ✅ Isolation multi-tenant garantie
- ✅ Permissions granulaires par module
- ✅ Scope flexible (all, assigned, own, etc.)
- ✅ Audit trail complet
- ✅ Extensibilité (rôles personnalisables)
- ✅ Sécurité en profondeur (middleware + service + DB)
