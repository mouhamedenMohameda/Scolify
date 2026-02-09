# Structure du Repo & Conventions de Code

## Vue d'ensemble

Monorepo géré avec **Turborepo** pour optimiser les builds et la gestion des dépendances entre packages.

---

## 1. Structure du Repo

```
school-admin-system/
├── apps/
│   ├── web/                          # Next.js app (frontend + API routes)
│   │   ├── app/                      # App Router (Next.js 14+)
│   │   │   ├── (auth)/              # Route group auth
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (dashboard)/         # Route group dashboard
│   │   │   │   ├── admin/
│   │   │   │   ├── teacher/
│   │   │   │   ├── parent/
│   │   │   │   └── student/
│   │   │   ├── api/                 # API Routes
│   │   │   │   ├── auth/
│   │   │   │   ├── students/
│   │   │   │   ├── classes/
│   │   │   │   ├── grades/
│   │   │   │   └── ...
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/              # Composants spécifiques app
│   │   │   ├── dashboard/
│   │   │   ├── students/
│   │   │   └── ...
│   │   ├── lib/                      # Utils app-specific
│   │   │   ├── auth.ts
│   │   │   ├── api-client.ts
│   │   │   └── utils.ts
│   │   ├── services/                 # Services layer (domain logic)
│   │   │   ├── student.service.ts
│   │   │   ├── class.service.ts
│   │   │   ├── grade.service.ts
│   │   │   └── ...
│   │   ├── middleware.ts             # Next.js middleware (auth, tenant)
│   │   ├── next.config.js
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── api/                          # API séparée (optionnel V2)
│       └── src/
│           ├── modules/
│           ├── common/
│           └── main.ts
│
├── packages/
│   ├── db/                           # Prisma schema + client
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   └── client.ts            # Prisma client export
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── shared/                       # Code partagé front/back
│   │   ├── src/
│   │   │   ├── types/               # Types TypeScript
│   │   │   │   ├── student.ts
│   │   │   │   ├── grade.ts
│   │   │   │   └── index.ts
│   │   │   ├── constants/           # Constantes métier
│   │   │   │   ├── student-status.ts
│   │   │   │   ├── invoice-status.ts
│   │   │   │   └── index.ts
│   │   │   ├── utils/               # Utils partagés
│   │   │   │   ├── date.ts
│   │   │   │   ├── format.ts
│   │   │   │   └── index.ts
│   │   │   └── validations/         # Zod schemas
│   │   │       ├── student.schema.ts
│   │   │       ├── grade.schema.ts
│   │   │       └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui/                           # Composants UI réutilisables
│   │   ├── src/
│   │   │   ├── components/          # shadcn/ui + custom
│   │   │   │   ├── ui/              # shadcn components
│   │   │   │   │   ├── button.tsx
│   │   │   │   │   ├── input.tsx
│   │   │   │   │   └── ...
│   │   │   │   ├── forms/           # Form components
│   │   │   │   │   ├── student-form.tsx
│   │   │   │   │   └── ...
│   │   │   │   └── data-table/      # Data table component
│   │   │   ├── hooks/               # React hooks
│   │   │   │   ├── use-student.ts
│   │   │   │   └── ...
│   │   │   └── styles/             # Tailwind config
│   │   │       └── globals.css
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── config/                       # Config partagée
│       ├── eslint/                   # ESLint config
│       ├── typescript/               # TS config base
│       └── tailwind/                 # Tailwind config
│
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions CI/CD
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml           # Dev environment
│
├── docs/                             # Documentation
│   ├── 01-architecture-globale.md
│   ├── 02-modules-metiers.md
│   └── ...
│
├── .env.example                      # Template variables d'environnement
├── .gitignore
├── package.json                      # Root workspace
├── turbo.json                        # Turborepo config
├── pnpm-workspace.yaml               # PNPM workspace (ou npm/yarn)
└── README.md
```

---

## 2. Conventions de Code

### 2.1 Langage & Formatage

- **Langage** : TypeScript strict
- **Formatter** : Prettier (config partagée)
- **Linter** : ESLint avec règles strictes
- **Imports** : Ordre alphabétique, groupes (external → internal → relative)

**Exemple** :
```typescript
// External
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

// Internal (packages)
import { StudentStatus } from "@school-admin/shared/constants";
import { studentSchema } from "@school-admin/shared/validations";

// Relative
import { StudentService } from "./student.service";
```

---

### 2.2 Nommage

#### Fichiers
- **Composants React** : `PascalCase.tsx` (ex: `StudentForm.tsx`)
- **Services** : `kebab-case.service.ts` (ex: `student.service.ts`)
- **Types** : `kebab-case.ts` (ex: `student.types.ts`)
- **Utils** : `kebab-case.ts` (ex: `date.utils.ts`)
- **Constants** : `kebab-case.ts` (ex: `student-status.ts`)

#### Variables & Fonctions
- **Variables** : `camelCase` (ex: `studentId`, `isActive`)
- **Fonctions** : `camelCase` (ex: `getStudentById`, `calculateAverage`)
- **Constantes** : `UPPER_SNAKE_CASE` (ex: `MAX_STUDENTS_PER_CLASS`)
- **Types/Interfaces** : `PascalCase` (ex: `Student`, `StudentFormData`)
- **Enums** : `PascalCase` avec valeurs `UPPER_SNAKE_CASE` (ex: `StudentStatus.ENROLLED`)

#### Classes
- **Classes** : `PascalCase` (ex: `StudentService`, `GradeCalculator`)
- **Méthodes privées** : Préfixe `_` (ex: `_validateStudent()`)

---

### 2.3 Structure des Services (Domain Logic)

Pattern DDD léger :

```typescript
// packages/shared/src/types/student.ts
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  // ...
}

export interface CreateStudentInput {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  // ...
}

// apps/web/services/student.service.ts
import { PrismaClient } from "@school-admin/db";
import { CreateStudentInput, Student } from "@school-admin/shared/types";

export class StudentService {
  constructor(private prisma: PrismaClient) {}

  async create(input: CreateStudentInput, schoolId: string): Promise<Student> {
    // Validation
    const validated = studentSchema.parse(input);
    
    // Business logic
    const matricule = await this._generateMatricule(schoolId);
    
    // Persistence
    const student = await this.prisma.student.create({
      data: {
        ...validated,
        schoolId,
        matricule,
      },
    });
    
    // Events (optionnel)
    await this._emitEvent("student.created", student);
    
    return student;
  }

  private async _generateMatricule(schoolId: string): Promise<string> {
    // Implementation
  }
}
```

---

### 2.4 Structure des API Routes

```typescript
// apps/web/app/api/students/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { StudentService } from "@/services/student.service";
import { getPrismaClient } from "@school-admin/db";
import { getCurrentUser, getCurrentTenant } from "@/lib/auth";
import { studentSchema } from "@school-admin/shared/validations";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const tenantId = await getCurrentTenant(request);
    
    // Check permissions
    await checkPermission(user, tenantId, "students:read:all");
    
    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    
    // Service call
    const prisma = getPrismaClient();
    const service = new StudentService(prisma);
    const result = await service.findAll(tenantId, { page, limit });
    
    return NextResponse.json({
      success: true,
      data: result.students,
      pagination: result.pagination,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const tenantId = await getCurrentTenant(request);
    
    await checkPermission(user, tenantId, "students:write:all");
    
    const body = await request.json();
    const validated = studentSchema.parse(body);
    
    const prisma = getPrismaClient();
    const service = new StudentService(prisma);
    const student = await service.create(validated, tenantId);
    
    return NextResponse.json(
      { success: true, data: { student } },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
```

---

### 2.5 Structure des Composants React

```typescript
// apps/web/components/students/StudentList.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Student } from "@school-admin/shared/types";
import { DataTable } from "@school-admin/ui/components/data-table";
import { Button } from "@school-admin/ui/components/ui/button";

interface StudentListProps {
  classId?: string;
}

export function StudentList({ classId }: StudentListProps) {
  const [page, setPage] = useState(1);
  
  const { data, isLoading } = useQuery({
    queryKey: ["students", { classId, page }],
    queryFn: () => fetchStudents({ classId, page }),
  });
  
  if (isLoading) return <div>Chargement...</div>;
  
  return (
    <div>
      <DataTable
        data={data?.students || []}
        columns={studentColumns}
        pagination={data?.pagination}
        onPageChange={setPage}
      />
    </div>
  );
}
```

---

### 2.6 Validation avec Zod

```typescript
// packages/shared/src/validations/student.schema.ts
import { z } from "zod";

export const studentSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  dateOfBirth: z.date(),
  gender: z.enum(["M", "F", "OTHER"]).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  classId: z.string().uuid(),
  academicYearId: z.string().uuid(),
  healthNotes: z.string().optional(),
  allergies: z.array(z.string()).default([]),
});

export type StudentFormData = z.infer<typeof studentSchema>;
```

---

### 2.7 Gestion des Erreurs

```typescript
// packages/shared/src/errors/index.ts
export class DomainError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "DomainError";
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, public field?: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string) {
    super(`${resource} not found`, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = "Permission denied") {
    super(message, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

// apps/web/lib/errors.ts
export function handleError(error: unknown): NextResponse {
  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        details: { field: error.field },
      },
      { status: 422 }
    );
  }
  
  if (error instanceof NotFoundError) {
    return NextResponse.json(
      { success: false, error: error.message, code: error.code },
      { status: 404 }
    );
  }
  
  if (error instanceof ForbiddenError) {
    return NextResponse.json(
      { success: false, error: error.message, code: error.code },
      { status: 403 }
    );
  }
  
  // Log unknown errors
  console.error("Unknown error:", error);
  
  return NextResponse.json(
    { success: false, error: "Internal server error" },
    { status: 500 }
  );
}
```

---

### 2.8 Tests

#### Structure des Tests

```
apps/web/
├── __tests__/
│   ├── unit/
│   │   ├── services/
│   │   │   └── student.service.test.ts
│   │   └── utils/
│   ├── integration/
│   │   └── api/
│   │       └── students.test.ts
│   └── e2e/
│       └── students.spec.ts
```

#### Exemple Test Unitaire

```typescript
// apps/web/__tests__/unit/services/student.service.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { StudentService } from "@/services/student.service";

describe("StudentService", () => {
  let service: StudentService;
  let prisma: PrismaClient;
  
  beforeEach(() => {
    prisma = new PrismaClient();
    service = new StudentService(prisma);
  });
  
  it("should create student with generated matricule", async () => {
    const input = {
      firstName: "Alice",
      lastName: "Martin",
      dateOfBirth: new Date("2010-05-15"),
      classId: "uuid-class",
      academicYearId: "uuid-year",
    };
    
    const student = await service.create(input, "uuid-school");
    
    expect(student).toBeDefined();
    expect(student.matricule).toMatch(/^SCHOOL-\d{4}-\d{4}$/);
  });
});
```

#### Exemple Test E2E (Playwright)

```typescript
// apps/web/__tests__/e2e/students.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Students", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "admin@school.com");
    await page.fill('input[name="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("/admin/students");
  });
  
  test("should create new student", async ({ page }) => {
    await page.click('button:has-text("Nouvel élève")');
    await page.fill('input[name="firstName"]', "Alice");
    await page.fill('input[name="lastName"]', "Martin");
    await page.selectOption('select[name="classId"]', "uuid-class");
    await page.click('button:has-text("Enregistrer")');
    
    await expect(page.locator('text=Alice Martin')).toBeVisible();
  });
});
```

---

### 2.9 Configuration TypeScript

```json
// packages/config/typescript/base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "incremental": true
  }
}
```

---

### 2.10 Configuration ESLint

```json
// packages/config/eslint/base.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

---

### 2.11 Git Hooks (Husky)

```json
// .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm lint-staged
```

```json
// package.json (root)
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

---

### 2.12 Documentation Code

```typescript
/**
 * Service de gestion des élèves.
 * 
 * @example
 * ```typescript
 * const service = new StudentService(prisma);
 * const student = await service.create(input, schoolId);
 * ```
 */
export class StudentService {
  /**
   * Crée un nouvel élève avec génération automatique du matricule.
   * 
   * @param input - Données de l'élève
   * @param schoolId - ID de l'école (tenant)
   * @returns L'élève créé
   * @throws {ValidationError} Si les données sont invalides
   * @throws {ForbiddenError} Si l'utilisateur n'a pas les permissions
   */
  async create(
    input: CreateStudentInput,
    schoolId: string
  ): Promise<Student> {
    // Implementation
  }
}
```

---

## 3. Workflow de Développement

### 3.1 Setup Initial

```bash
# Install dependencies
pnpm install

# Setup database
cd packages/db
pnpm prisma generate
pnpm prisma migrate dev

# Start dev servers
pnpm dev
```

### 3.2 Création Nouvelle Feature

1. **Créer branche** : `git checkout -b feature/student-enrollment`
2. **Ajouter types** : `packages/shared/src/types/`
3. **Ajouter validations** : `packages/shared/src/validations/`
4. **Créer service** : `apps/web/services/`
5. **Créer API route** : `apps/web/app/api/`
6. **Créer composants UI** : `apps/web/components/`
7. **Ajouter tests** : `apps/web/__tests__/`
8. **Commit** : `git commit -m "feat: add student enrollment"`

### 3.3 Conventions de Commit

Format : `type(scope): message`

Types :
- `feat` : Nouvelle fonctionnalité
- `fix` : Correction bug
- `docs` : Documentation
- `style` : Formatage
- `refactor` : Refactoring
- `test` : Tests
- `chore` : Maintenance

Exemples :
- `feat(students): add bulk enrollment`
- `fix(grades): correct average calculation`
- `docs(api): update endpoints documentation`

---

## 4. Dépendances entre Packages

### 4.1 Graph de Dépendances

```
apps/web
  ├── packages/ui
  ├── packages/shared
  └── packages/db

packages/ui
  └── packages/shared

packages/shared
  └── (standalone)

packages/db
  └── (standalone)
```

### 4.2 Imports entre Packages

Utiliser les alias définis dans `tsconfig.json` :

```typescript
// Dans apps/web
import { Student } from "@school-admin/shared/types";
import { Button } from "@school-admin/ui/components/ui/button";
import { prisma } from "@school-admin/db";
```

---

## 5. Variables d'Environnement

```bash
# .env.example
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/school_admin"

# Auth
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
NEXTAUTH_URL="http://localhost:3000"

# Storage
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
S3_BUCKET="school-admin"

# Redis
REDIS_URL="redis://localhost:6379"

# Email
RESEND_API_KEY="re_..."

# Stripe (optionnel)
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Sentry (optionnel)
SENTRY_DSN="https://..."
```

---

## Conclusion

Cette structure :
- ✅ Monorepo organisé avec Turborepo
- ✅ Séparation claire des responsabilités
- ✅ Code partagé réutilisable
- ✅ Conventions cohérentes
- ✅ Tests intégrés
- ✅ CI/CD prêt

**Prochaines étapes** : Voir `07-plan-implementation.md` pour le plan d'implémentation détaillé.
