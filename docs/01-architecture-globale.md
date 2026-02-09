# Architecture Globale - School Administration System

## 1. Vue d'ensemble

### 1.1 Contexte Produit

**SaaS Multi-Tenant** : Application web de gestion scolaire complète permettant à plusieurs écoles (tenants) d'être isolées et indépendantes sur une même plateforme.

**Caractéristiques principales** :
- **Multi-tenant** : Isolation complète des données par école (tenant)
- **Multi-rôles** : 12+ types d'utilisateurs avec permissions granulaires
- **Responsive** : Web app adaptée mobile/tablette/desktop
- **Internationalisation** : FR en priorité, architecture i18n prête
- **Conformité** : RGPD, sécurité renforcée, audit trail

**Utilisateurs cibles** :
1. **Admin Plateforme** : Super-admin de la plateforme SaaS
2. **Admin École** : Direction de l'établissement
3. **Secrétariat** : Gestion administrative et admissions
4. **Professeurs** : Gestion pédagogique, notes, présences
5. **Élèves** : Consultation EDT, notes, devoirs
6. **Parents** : Suivi enfants, communication, paiements
7. **Comptable/Finance** : Gestion facturation et paiements
8. **Surveillants/Discipline** : Vie scolaire, incidents
9. **Bibliothécaire** : Gestion bibliothèque
10. **Infirmier** : Suivi santé élèves
11. **Chauffeur/Transport** : Gestion transport scolaire
12. **RH** : Gestion ressources humaines (optionnel)
13. **Responsable Cantine** : Gestion restauration (optionnel)

---

## 2. Architecture Technique

### 2.1 Stack Technologique

#### Frontend
- **Framework** : Next.js 14+ (App Router) + TypeScript
- **UI Kit** : shadcn/ui + Tailwind CSS
- **State Management** : Zustand (global) + React Query (server state)
- **Forms** : React Hook Form + Zod (validation)
- **Realtime** : Server-Sent Events (SSE) pour notifications
- **PDF Client** : jsPDF / react-pdf pour génération côté client (optionnel)

#### Backend
- **Architecture** : Monorepo Next.js avec API Routes + Services Layer
- **Alternative** : NestJS séparé (pour V2 si besoin de scalabilité)
- **Validation** : Zod schemas
- **ORM** : Prisma
- **Database** : PostgreSQL 15+ (avec Row Level Security - RLS)
- **Cache** : Redis (sessions, cache queries fréquentes)
- **Queue** : BullMQ (Redis-based) pour jobs asynchrones
- **Files Storage** : S3-compatible (MinIO dev, AWS S3 prod)
- **Search** : PostgreSQL Full-Text Search (v1), OpenSearch (V2)
- **PDF Generation** : Puppeteer / PDFKit (serveur)
- **Email** : Resend / SendGrid
- **SMS** : Twilio (optionnel)

#### Infrastructure & DevOps
- **Containerization** : Docker + Docker Compose (dev)
- **Deployment** : Fly.io / Render (MVP) → Kubernetes (V2)
- **CI/CD** : GitHub Actions
- **Monitoring** : Sentry (errors), Logtail (logs), Vercel Analytics
- **Secrets** : Environment variables + Vault (prod)

### 2.2 Architecture Logique

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Next.js    │  │   React      │  │   Zustand    │      │
│  │   App Router │  │   Components │  │   State      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS SERVER (Edge/Node)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Routes Layer                         │  │
│  │  /api/auth  /api/students  /api/classes  /api/...   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Services Layer (Domain Logic)            │  │
│  │  StudentService  ClassService  GradeService  ...     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Middleware Layer                         │  │
│  │  Auth  RBAC  Tenant Isolation  Validation  Audit    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  PostgreSQL  │   │    Redis     │   │  S3/MinIO   │
│  (Multi-     │   │  (Cache +    │   │  (Files)    │
│   Tenant)    │   │   Queue)     │   │             │
└──────────────┘   └──────────────┘   └──────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│              Background Jobs (BullMQ Workers)               │
│  Email  SMS  PDF Generation  Reports  Cleanup              │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Séparation en Packages (Monorepo)

```
school-admin-system/
├── apps/
│   ├── web/                    # Next.js frontend + API routes
│   │   ├── app/                # App Router pages
│   │   ├── api/                # API routes handlers
│   │   ├── components/         # UI components spécifiques app
│   │   └── lib/                # Utils app-specific
│   │
│   └── api/                    # API séparée (optionnel V2)
│       └── src/
│           ├── modules/        # Modules métier
│           ├── common/         # Middleware, guards
│           └── main.ts
│
├── packages/
│   ├── db/                     # Prisma schema + migrations
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── src/
│   │       └── client.ts       # Prisma client export
│   │
│   ├── shared/                 # Code partagé front/back
│   │   ├── types/              # Types TypeScript
│   │   ├── constants/          # Constantes métier
│   │   ├── utils/              # Utils partagés
│   │   └── validations/        # Zod schemas
│   │
│   ├── ui/                     # Composants UI réutilisables
│   │   ├── components/         # shadcn/ui + custom
│   │   ├── hooks/              # React hooks
│   │   └── styles/             # Tailwind config
│   │
│   └── config/                 # Config partagée (ESLint, TS, etc.)
│
├── docker-compose.yml          # Dev environment
├── package.json                # Root workspace
└── turbo.json                  # Turborepo config
```

### 2.4 Patterns & Conventions

#### Domain-Driven Design (Léger)
```
services/
├── domain/                     # Entités métier pures
│   ├── student.ts
│   ├── class.ts
│   └── grade.ts
│
├── application/                # Use cases / services
│   ├── student.service.ts
│   ├── enrollment.service.ts
│   └── grade.service.ts
│
└── infrastructure/            # Implémentations techniques
    ├── prisma/
    ├── storage/
    └── email/
```

#### Validation & Erreurs
- **Validation** : Zod schemas dans `packages/shared/validations`
- **Erreurs** : Classes d'erreur custom (`DomainError`, `ValidationError`, `NotFoundError`)
- **API Responses** : Format standardisé `{ success: boolean, data?: T, error?: string }`

#### Multi-Tenant Strategy
- **Approche** : Row Level Security (RLS) PostgreSQL
- **Implementation** : `tenant_id` sur toutes les tables + RLS policies
- **Middleware** : Extraction `tenant_id` depuis JWT/session → injection dans Prisma context

---

## 3. Sécurité & Conformité

### 3.1 Authentification
- **Méthodes** : Email + Password, SSO (Google/Microsoft), MFA (TOTP)
- **Sessions** : JWT (access) + Refresh tokens (Redis)
- **Password** : Argon2id (hash), politique de complexité

### 3.2 Isolation Multi-Tenant
- **RLS** : Policies PostgreSQL par tenant
- **Middleware** : Vérification tenant_id sur chaque requête
- **Tests** : Tests d'isolement automatiques

### 3.3 Protection
- **TLS** : HTTPS obligatoire
- **XSS/CSRF** : Protection Next.js + headers sécurisés
- **Rate Limiting** : Upstash Ratelimit (Redis-based)
- **Input Validation** : Zod strict sur toutes les entrées

### 3.4 RGPD
- **Consentements** : Table `consents` avec historique
- **Droit à l'oubli** : Anonymisation (soft delete) avec rétention configurable
- **Droit d'accès** : Export données utilisateur (JSON/PDF)
- **Audit Log** : Toutes actions sensibles journalisées
- **Rétention** : Politique par type de données (ex: notes = 5 ans)

---

## 4. Scalabilité & Performance

### 4.1 Base de données
- **Indexation** : Index sur `tenant_id`, `user_id`, `student_id`, dates
- **Partitioning** : Tables volumineuses (audit_log, notifications) par date
- **Connection Pooling** : PgBouncer ou Prisma connection pool

### 4.2 Cache
- **Redis** : Cache queries fréquentes (EDT, classes, user sessions)
- **TTL** : Stratégie par type de données (EDT = 1h, classes = 24h)

### 4.3 Jobs Asynchrones
- **Queue** : BullMQ pour emails, PDFs, exports
- **Priorités** : Urgent (notifications) > Normal (emails) > Low (exports)

### 4.4 CDN & Assets
- **Static Assets** : Vercel CDN / Cloudflare
- **Files** : S3 avec CloudFront (prod)

---

## 5. Observabilité

### 5.1 Logging
- **Format** : JSON structuré
- **Niveaux** : ERROR, WARN, INFO, DEBUG
- **Champs** : tenant_id, user_id, action, duration, error

### 5.2 Monitoring
- **Errors** : Sentry (tracking + alerting)
- **Performance** : Vercel Analytics + custom metrics
- **Uptime** : Health checks endpoints

### 5.3 Traces
- **APM** : OpenTelemetry (optionnel V2)

---

## 6. Déploiement

### 6.1 Environnements
- **Development** : Docker Compose (local)
- **Staging** : Fly.io / Render (mirror prod)
- **Production** : Fly.io / Render (MVP) → Kubernetes (V2)

### 6.2 CI/CD Pipeline
```
GitHub Push
  ↓
GitHub Actions
  ├── Lint & Type Check
  ├── Unit Tests
  ├── Build
  ├── Integration Tests
  └── Deploy (Staging/Prod)
```

### 6.3 Migrations
- **Prisma Migrate** : Migrations versionnées
- **Rollback** : Stratégie de rollback documentée
- **Seeds** : Données de test par environnement

---

## 7. Hypothèses & Décisions

### 7.1 Hypothèses Métier
- **Système scolaire** : Modèle français (trimestres, niveaux CP→Terminale)
- **Langue** : Français en priorité, i18n pour extension
- **Monnaie** : EUR (configurable par tenant)
- **Fuseau horaire** : Europe/Paris (configurable)

### 7.2 Décisions Techniques
- **Monorepo** : Turborepo pour gestion workspace
- **API Style** : REST (v1) → tRPC (V2 optionnel)
- **Realtime** : SSE (simple) → WebSockets (V2 si besoin)
- **PDF** : Puppeteer (bulletins) + PDFKit (documents simples)

### 7.3 Points de Flexibilité
- **Calendrier** : Configurable (trimestres/semestres/annuel)
- **Système de notes** : Configurable (0-20, A-F, %, etc.)
- **Périodes** : Configurable par école

---

## 8. Prochaines Étapes

Voir les documents suivants :
- `02-modules-metiers.md` : Détail de tous les modules
- `03-rbac-permissions.md` : Matrice de permissions
- `04-data-model.md` : Schéma de données complet
- `05-api-endpoints.md` : Spécification API
- `06-structure-repo.md` : Structure détaillée + conventions
- `07-plan-implementation.md` : Roadmap MVP → V2
- `08-risques-decisions.md` : Risques et points à valider
