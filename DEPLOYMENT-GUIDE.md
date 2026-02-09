# Guide de Déploiement - School Administration System

## 🚀 Déploiement en Production

Ce guide couvre le déploiement du MVP sur différentes plateformes.

---

## 📋 Prérequis

### Services Requis

1. **PostgreSQL 15+**
   - Supabase (recommandé pour MVP)
   - AWS RDS
   - DigitalOcean Managed Database
   - Self-hosted PostgreSQL

2. **Redis** (optionnel pour MVP, requis pour V2)
   - Upstash (serverless)
   - Redis Cloud
   - Self-hosted Redis

3. **Storage S3** (optionnel pour MVP, requis pour V2)
   - AWS S3
   - DigitalOcean Spaces
   - Cloudflare R2
   - MinIO (self-hosted)

4. **Email** (optionnel pour MVP, requis pour V2)
   - Resend (recommandé)
   - SendGrid
   - AWS SES

---

## 🔧 Configuration Environnement

### Variables d'Environnement Requises

Créer un fichier `.env.production` :

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"
DIRECT_URL="postgresql://user:password@host:5432/dbname"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Redis (optionnel)
REDIS_URL="redis://host:6379"

# S3 Storage (optionnel)
S3_ENDPOINT="https://s3.amazonaws.com"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET_NAME="school-admin-documents"
S3_REGION="us-east-1"

# Email (optionnel)
RESEND_API_KEY="re_xxxxxxxxxxxxx"
EMAIL_FROM="noreply@yourdomain.com"

# App
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
NODE_ENV="production"
PORT="3000"
```

### Génération Secrets

```bash
# Générer JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🐳 Option 1 : Déploiement avec Docker

### Dockerfile

Créer `Dockerfile` :

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/*/

RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN cd packages/db && pnpm db:generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm build --filter=@school-admin/web

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose Production

Créer `docker-compose.prod.yml` :

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
    env_file:
      - .env.production
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: schooladmin
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Déploiement

```bash
# Build et démarrer
docker-compose -f docker-compose.prod.yml up -d

# Voir logs
docker-compose -f docker-compose.prod.yml logs -f

# Arrêter
docker-compose -f docker-compose.prod.yml down
```

---

## ☁️ Option 2 : Déploiement sur Fly.io

### Setup Fly.io

```bash
# Installer Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Créer app
fly launch
```

### fly.toml

```toml
app = "school-admin-system"
primary_region = "cdg"

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"
  PORT = "3000"

[[services]]
  internal_port = 3000
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

[[services.http_checks]]
  interval = "10s"
  timeout = "2s"
  grace_period = "5s"
  method = "GET"
  path = "/api/health"
```

### Déploiement

```bash
# Déployer
fly deploy

# Voir logs
fly logs

# Ouvrir app
fly open
```

---

## 🌐 Option 3 : Déploiement sur Render

### Setup Render

1. Créer compte Render
2. Créer "Web Service"
3. Connecter repo GitHub
4. Configurer :

**Build Command** :
```bash
cd packages/db && pnpm db:generate && cd ../.. && pnpm build --filter=@school-admin/web
```

**Start Command** :
```bash
cd apps/web && pnpm start
```

**Environment Variables** :
- Ajouter toutes les variables depuis `.env.production`

### Base de Données

1. Créer "PostgreSQL" sur Render
2. Copier `DATABASE_URL` dans variables d'environnement
3. Exécuter migrations :

```bash
cd packages/db
pnpm db:migrate:deploy
```

---

## 🔒 Sécurité Production

### Checklist Sécurité

- [ ] **Secrets** : Utiliser variables d'environnement, jamais hardcodés
- [ ] **HTTPS** : Forcer HTTPS (certificat SSL)
- [ ] **CORS** : Configurer CORS correctement
- [ ] **Rate Limiting** : Implémenter rate limiting (V2)
- [ ] **Headers Sécurité** : Ajouter security headers
- [ ] **Database** : Utiliser connection pooling
- [ ] **Backups** : Configurer backups automatiques DB
- [ ] **Monitoring** : Configurer Sentry/Logtail

### Security Headers (Next.js)

Créer `next.config.js` :

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## 📊 Monitoring & Observabilité

### Sentry (Erreurs)

1. Créer compte Sentry
2. Installer :

```bash
pnpm add @sentry/nextjs
```

3. Configurer dans `apps/web/sentry.client.config.ts` et `sentry.server.config.ts`

### Logtail (Logs)

1. Créer compte Logtail
2. Configurer dans variables d'environnement

---

## 🗄️ Migrations Base de Données

### Première Migration

```bash
# Générer migration
cd packages/db
pnpm db:migrate dev --name init

# Appliquer en production
pnpm db:migrate:deploy
```

### Migrations Futures

```bash
# Créer migration
pnpm db:migrate dev --name add_new_feature

# Appliquer en production
pnpm db:migrate:deploy
```

---

## 🔄 CI/CD avec GitHub Actions

Le workflow CI/CD est déjà configuré dans `.github/workflows/ci.yml`.

Pour déploiement automatique, ajouter :

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm build
      # Ajouter commandes de déploiement selon plateforme
```

---

## ✅ Checklist Pré-Déploiement

- [ ] Variables d'environnement configurées
- [ ] Secrets générés (JWT, etc.)
- [ ] Base de données créée et migrations appliquées
- [ ] Tests passent (`pnpm test`)
- [ ] Build réussit (`pnpm build`)
- [ ] Health check fonctionne (`/api/health`)
- [ ] SSL/HTTPS configuré
- [ ] Monitoring configuré (Sentry, logs)
- [ ] Backups DB configurés
- [ ] Documentation déploiement à jour

---

## 🐛 Dépannage

### Erreur : "Database connection failed"

- Vérifier `DATABASE_URL`
- Vérifier firewall/réseau
- Vérifier credentials

### Erreur : "Prisma Client not generated"

```bash
cd packages/db
pnpm db:generate
```

### Erreur : "Port already in use"

- Changer `PORT` dans `.env`
- Vérifier processus existants

### Erreur : "JWT secret missing"

- Générer secrets avec commande ci-dessus
- Ajouter dans variables d'environnement

---

## 📚 Ressources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Fly.io Docs](https://fly.io/docs/)
- [Render Docs](https://render.com/docs)
- [Supabase Docs](https://supabase.com/docs)

---

**Status** : ✅ Guide de déploiement créé  
**Prochaine étape** : Choisir plateforme et déployer
