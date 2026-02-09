# Setup Guide - School Administration System

## ✅ Structure Créée

### Root Configuration
- ✅ `package.json` - Configuration monorepo avec Turborepo
- ✅ `turbo.json` - Configuration Turborepo pipeline
- ✅ `pnpm-workspace.yaml` - Configuration workspace PNPM
- ✅ `tsconfig.json` - Configuration TypeScript root
- ✅ `.eslintrc.json` - Configuration ESLint
- ✅ `.prettierrc` - Configuration Prettier
- ✅ `.gitignore` - Fichiers à ignorer
- ✅ `.env.example` - Template variables d'environnement
- ✅ `docker-compose.yml` - Infrastructure dev (PostgreSQL, Redis, MinIO)

### Package: `@school-admin/db`
- ✅ `package.json` - Dépendances Prisma
- ✅ `tsconfig.json` - Configuration TypeScript
- ✅ `prisma/schema.prisma` - Schéma de données complet (~50+ tables)
- ✅ `src/index.ts` - Export Prisma client
- ✅ `src/client.ts` - Client Prisma avec isolation tenant

### Package: `@school-admin/shared`
- ✅ `package.json` - Dépendances (Zod)
- ✅ `tsconfig.json` - Configuration TypeScript
- ✅ `src/index.ts` - Exports principaux
- ✅ `src/errors/` - Classes d'erreur custom
- ✅ `src/constants/` - Constantes métier (statuts, rôles, etc.)
- ✅ `src/types/` - Types TypeScript partagés
- ✅ `src/validations/` - Schémas Zod (student, common)
- ✅ `src/utils/` - Utilitaires (formatDate, formatCurrency, etc.)

### Package: `@school-admin/ui`
- ✅ `package.json` - Dépendances UI (Radix UI, Tailwind)
- ✅ `tsconfig.json` - Configuration TypeScript
- ✅ `tailwind.config.js` - Configuration Tailwind
- ✅ `src/index.ts` - Exports composants
- ✅ `src/lib/utils.ts` - Utilitaires (cn pour classes)
- ✅ `src/components/ui/` - Composants de base (Button, Input, Card)
- ✅ `src/styles/globals.css` - Styles globaux Tailwind

### App: `@school-admin/web`
- ✅ `package.json` - Dépendances Next.js
- ✅ `tsconfig.json` - Configuration TypeScript Next.js
- ✅ `next.config.js` - Configuration Next.js
- ✅ `tailwind.config.js` - Configuration Tailwind
- ✅ `postcss.config.js` - Configuration PostCSS
- ✅ `middleware.ts` - Middleware Next.js (auth/tenant)
- ✅ `app/layout.tsx` - Layout racine
- ✅ `app/page.tsx` - Page d'accueil
- ✅ `app/globals.css` - Styles globaux
- ✅ `app/api/health/route.ts` - Endpoint health check
- ✅ `lib/auth.ts` - Utilitaires auth (TODO)
- ✅ `lib/api-client.ts` - Client API avec helpers

### CI/CD
- ✅ `.github/workflows/ci.yml` - GitHub Actions CI

### Documentation
- ✅ `docs/` - Documentation complète (8 documents)
- ✅ `README.md` - Vue d'ensemble projet

---

## 🚀 Prochaines Étapes

### 1. Installation des Dépendances

```bash
# Installer toutes les dépendances
pnpm install
```

### 2. Setup Infrastructure

```bash
# Démarrer PostgreSQL, Redis, MinIO
docker-compose up -d

# Vérifier que les services sont démarrés
docker-compose ps
```

### 3. Configuration Base de Données

```bash
# Aller dans le package db
cd packages/db

# Générer le client Prisma
pnpm db:generate

# Créer la première migration
pnpm db:migrate

# (Optionnel) Ouvrir Prisma Studio pour explorer la DB
pnpm db:studio
```

### 4. Configuration Variables d'Environnement

```bash
# Copier le template
cp .env.example .env

# Éditer .env avec vos valeurs
# DATABASE_URL doit pointer vers votre PostgreSQL
# REDIS_URL doit pointer vers votre Redis
```

### 5. Démarrer l'Application

```bash
# Depuis la racine
pnpm dev

# L'application sera accessible sur http://localhost:3000
```

---

## 📁 Structure des Dossiers

```
school-admin-system/
├── apps/
│   └── web/                    # Next.js app
│       ├── app/                # App Router
│       │   ├── api/           # API routes
│       │   ├── layout.tsx
│       │   └── page.tsx
│       ├── lib/                # Utilitaires app
│       ├── components/         # Composants spécifiques app
│       └── middleware.ts
├── packages/
│   ├── db/                     # Prisma
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── src/
│   ├── shared/                 # Code partagé
│   │   └── src/
│   │       ├── errors/
│   │       ├── constants/
│   │       ├── types/
│   │       ├── validations/
│   │       └── utils/
│   └── ui/                     # Composants UI
│       └── src/
│           ├── components/
│           └── lib/
├── docs/                       # Documentation
├── docker-compose.yml
├── package.json
├── turbo.json
└── pnpm-workspace.yaml
```

---

## 🔧 Commandes Disponibles

### Depuis la racine

```bash
# Développement
pnpm dev                    # Démarrer tous les apps en dev

# Build
pnpm build                  # Build tous les packages/apps

# Lint & Format
pnpm lint                   # Linter tous les packages
pnpm format                 # Formatter avec Prettier

# Tests
pnpm test                   # Lancer tous les tests

# Type Check
pnpm type-check             # Vérifier types TypeScript

# Database
pnpm db:generate            # Générer client Prisma
pnpm db:migrate             # Créer migration
pnpm db:studio              # Ouvrir Prisma Studio
```

### Depuis un package spécifique

```bash
# Package db
cd packages/db
pnpm db:generate
pnpm db:migrate
pnpm db:studio

# App web
cd apps/web
pnpm dev
pnpm build
pnpm lint
```

---

## 🐛 Dépannage

### Erreur: "Cannot find module '@school-admin/...'"

**Solution** : Réinstaller les dépendances
```bash
pnpm install
```

### Erreur: "Prisma Client not generated"

**Solution** : Générer le client Prisma
```bash
cd packages/db
pnpm db:generate
```

### Erreur: "Database connection failed"

**Solution** : Vérifier que PostgreSQL est démarré
```bash
docker-compose up -d postgres
# Vérifier DATABASE_URL dans .env
```

### Erreur: "Port 3000 already in use"

**Solution** : Changer le port ou arrêter le processus
```bash
# Changer le port dans .env
PORT=3001

# Ou arrêter le processus
lsof -ti:3000 | xargs kill
```

---

## 📝 TODOs pour Sprint 1 (Auth & Multi-Tenant)

### À implémenter dans `apps/web/lib/auth.ts` :
- [ ] JWT verification
- [ ] User session management
- [ ] Token refresh logic

### À implémenter dans `apps/web/middleware.ts` :
- [ ] Extract JWT from request
- [ ] Verify token
- [ ] Extract tenant_id
- [ ] Inject tenant context

### À créer :
- [ ] API routes auth (`/api/auth/login`, `/api/auth/register`, etc.)
- [ ] Services auth (`auth.service.ts`)
- [ ] Pages login/register
- [ ] Tests auth (unit + integration)

---

## 🔗 Liens Utils

- [Documentation Architecture](docs/00-index.md)
- [Plan d'Implémentation](docs/07-plan-implementation.md)
- [Structure Repo](docs/06-structure-repo.md)
- [API Endpoints](docs/05-api-endpoints.md)

---

## ✅ Checklist Pré-Développement

- [ ] Dépendances installées (`pnpm install`)
- [ ] Infrastructure démarrée (`docker-compose up -d`)
- [ ] Base de données créée (`pnpm db:migrate`)
- [ ] Variables d'environnement configurées (`.env`)
- [ ] Application démarre (`pnpm dev`)
- [ ] Health check fonctionne (`http://localhost:3000/api/health`)

---

**Status** : ✅ Structure de base créée, prêt pour développement Sprint 1
