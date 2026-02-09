# Configuration Environnement Production

Guide pour configurer les variables d'environnement en production.

---

## 🔐 Variables Requises

### Base de Données (Supabase)

```bash
# Connection pooling (pour l'application)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"

# Connexion directe (pour migrations Prisma)
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

**Comment obtenir ces URLs** :
1. Aller sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionner votre projet
3. Settings > Database
4. Copier "Connection string" (Pooling mode) pour `DATABASE_URL`
5. Copier "Connection string" (Direct connection) pour `DIRECT_URL`

---

### Authentification JWT

```bash
# Secret pour access tokens (minimum 32 caractères)
JWT_SECRET="[GÉNÉRER UN SECRET SÉCURISÉ]"

# Secret pour refresh tokens (minimum 32 caractères)
JWT_REFRESH_SECRET="[GÉNÉRER UN SECRET SÉCURISÉ]"

# Durées d'expiration (optionnel, valeurs par défaut)
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
```

**Générer des secrets sécurisés** :
```bash
# Option 1 : Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2 : OpenSSL
openssl rand -hex 32

# Option 3 : En ligne
# https://randomkeygen.com/
```

⚠️ **IMPORTANT** : Ne jamais utiliser les mêmes secrets en développement et production !

---

### Supabase (si utilisé)

```bash
# URL publique Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"

# Clé anonyme (publique, safe pour le frontend)
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Clé service role (PRIVÉE, jamais exposée au frontend)
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Comment obtenir** :
1. Supabase Dashboard > Settings > API
2. Copier "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
3. Copier "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copier "service_role" key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ SECRET)

---

### Redis (Optionnel pour MVP)

```bash
# Redis URL (Upstash, Redis Cloud, ou self-hosted)
REDIS_URL="redis://default:[PASSWORD]@[HOST]:[PORT]"

# Exemple Upstash
REDIS_URL="redis://default:abc123@usw1-xxx.upstash.io:6379"
```

**Services recommandés** :
- [Upstash](https://upstash.com/) : Serverless Redis (gratuit jusqu'à 10K commandes/jour)
- [Redis Cloud](https://redis.com/cloud/) : Managed Redis
- Self-hosted : Docker Redis

---

### Storage S3 (Optionnel pour MVP)

```bash
# Endpoint S3
S3_ENDPOINT="https://s3.amazonaws.com"
# ou pour DigitalOcean Spaces
# S3_ENDPOINT="https://[REGION].digitaloceanspaces.com"
# ou pour Cloudflare R2
# S3_ENDPOINT="https://[ACCOUNT-ID].r2.cloudflarestorage.com"

# Credentials
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET_NAME="school-admin-documents"
S3_REGION="us-east-1"
```

**Services recommandés** :
- [AWS S3](https://aws.amazon.com/s3/) : Standard
- [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces) : Simple et économique
- [Cloudflare R2](https://www.cloudflare.com/products/r2/) : Pas de frais de sortie
- [MinIO](https://min.io/) : Self-hosted (dev uniquement)

---

### Email (Optionnel pour MVP, Requis V2)

```bash
# Resend (recommandé)
RESEND_API_KEY="re_xxxxxxxxxxxxx"
EMAIL_FROM="noreply@yourdomain.com"

# Ou SendGrid
# SENDGRID_API_KEY="SG.xxxxxxxxxxxxx"
# EMAIL_FROM="noreply@yourdomain.com"
```

**Services recommandés** :
- [Resend](https://resend.com/) : Moderne, simple, 3000 emails/mois gratuits
- [SendGrid](https://sendgrid.com/) : 100 emails/jour gratuits
- [AWS SES](https://aws.amazon.com/ses/) : Économique à grande échelle

---

### Application

```bash
# Environnement
NODE_ENV="production"

# Port (généralement géré par la plateforme)
PORT="3000"

# URL publique de l'application (pour CORS, emails, etc.)
NEXT_PUBLIC_API_URL="https://yourdomain.com"
# ou
NEXT_PUBLIC_API_URL="https://your-app.fly.dev"
```

---

### Monitoring (Optionnel)

```bash
# Sentry (erreurs)
SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
SENTRY_AUTH_TOKEN="xxx"

# Logtail (logs)
LOGTAIL_SOURCE_TOKEN="xxx"
```

---

## 📋 Checklist Configuration Production

### Obligatoire

- [ ] `DATABASE_URL` configurée (Supabase pooling)
- [ ] `DIRECT_URL` configurée (Supabase direct)
- [ ] `JWT_SECRET` généré (32+ caractères)
- [ ] `JWT_REFRESH_SECRET` généré (32+ caractères)
- [ ] `NODE_ENV="production"`

### Optionnel MVP (Requis V2)

- [ ] `REDIS_URL` configurée
- [ ] `S3_*` configurées (si stockage fichiers)
- [ ] `RESEND_API_KEY` configurée (si emails)
- [ ] `SENTRY_DSN` configurée (si monitoring)

### Supabase (si utilisé)

- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurée
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurée
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurée (⚠️ SECRET)

---

## 🔒 Sécurité

### ✅ Bonnes Pratiques

1. **Secrets** : Jamais hardcodés dans le code
2. **Secrets différents** : Dev ≠ Production
3. **Rotation** : Changer secrets régulièrement
4. **Accès limité** : Seulement personnes nécessaires
5. **Audit** : Logger accès aux secrets

### ❌ À Éviter

- ❌ Commiter `.env` dans Git
- ❌ Partager secrets par email/Slack
- ❌ Utiliser secrets de dev en production
- ❌ Exposer `SUPABASE_SERVICE_ROLE_KEY` au frontend

---

## 🚀 Configuration par Plateforme

### Fly.io

```bash
# Définir secrets
fly secrets set DATABASE_URL="..."
fly secrets set JWT_SECRET="..."
fly secrets set JWT_REFRESH_SECRET="..."

# Voir secrets
fly secrets list

# Supprimer secret
fly secrets unset VARIABLE_NAME
```

### Render

1. Dashboard Render > Your Service > Environment
2. Ajouter chaque variable manuellement
3. Ou utiliser "Environment Variables" section

### Vercel

```bash
# Via CLI
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production

# Via Dashboard
# Project Settings > Environment Variables
```

### Docker

```bash
# Via fichier .env
docker run --env-file .env.production your-image

# Via variables individuelles
docker run -e DATABASE_URL="..." -e JWT_SECRET="..." your-image
```

---

## 🧪 Vérification Configuration

### Test Connexion Base de Données

```bash
# Depuis packages/db
cd packages/db
pnpm db:studio
# Si Prisma Studio s'ouvre, la connexion fonctionne
```

### Test Variables Environnement

Créer un endpoint de test (⚠️ À supprimer en production) :

```typescript
// apps/web/app/api/test-env/route.ts
export async function GET() {
  return Response.json({
    hasDatabase: !!process.env.DATABASE_URL,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasJwtRefresh: !!process.env.JWT_REFRESH_SECRET,
    nodeEnv: process.env.NODE_ENV,
  });
}
```

---

## 📝 Template `.env.production`

```bash
# ============================================
# BASE DE DONNÉES
# ============================================
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require"

# ============================================
# SUPABASE (si utilisé)
# ============================================
NEXT_PUBLIC_SUPABASE_URL="https://[REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# ============================================
# AUTHENTIFICATION
# ============================================
JWT_SECRET="[GÉNÉRER 32+ CARACTÈRES]"
JWT_REFRESH_SECRET="[GÉNÉRER 32+ CARACTÈRES]"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# ============================================
# REDIS (optionnel MVP)
# ============================================
REDIS_URL="redis://default:[PASSWORD]@[HOST]:6379"

# ============================================
# STORAGE S3 (optionnel MVP)
# ============================================
S3_ENDPOINT="https://s3.amazonaws.com"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET_NAME="school-admin-documents"
S3_REGION="us-east-1"

# ============================================
# EMAIL (optionnel MVP, requis V2)
# ============================================
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourdomain.com"

# ============================================
# APPLICATION
# ============================================
NODE_ENV="production"
PORT="3000"
NEXT_PUBLIC_API_URL="https://yourdomain.com"

# ============================================
# MONITORING (optionnel)
# ============================================
SENTRY_DSN=""
SENTRY_AUTH_TOKEN=""
LOGTAIL_SOURCE_TOKEN=""
```

---

## ✅ Validation Finale

Avant de déployer, vérifier :

1. ✅ Toutes les variables obligatoires sont définies
2. ✅ Secrets sont différents de ceux en dev
3. ✅ `DATABASE_URL` et `DIRECT_URL` fonctionnent
4. ✅ `JWT_SECRET` et `JWT_REFRESH_SECRET` sont générés
5. ✅ `NODE_ENV="production"`
6. ✅ `.env.production` n'est pas commité dans Git

---

**Status** : ✅ Guide de configuration production créé  
**Prochaine étape** : Configurer les variables selon votre plateforme de déploiement
