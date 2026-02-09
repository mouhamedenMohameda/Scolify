# Configuration Supabase - School Administration System

Guide pour configurer Supabase pour l'application School Administration System.

---

## 🎯 Pourquoi Supabase ?

Supabase fournit :
- ✅ PostgreSQL managé (15+)
- ✅ Connection pooling automatique
- ✅ Row Level Security (RLS) pour multi-tenant
- ✅ Dashboard pour gestion DB
- ✅ Backups automatiques
- ✅ Plan gratuit généreux

---

## 📋 Étapes de Configuration

### 1. Créer un Projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un compte (gratuit)
3. Créer un nouveau projet
4. Choisir :
   - **Nom** : `school-admin-system`
   - **Database Password** : Générer un mot de passe fort (⚠️ SAUVEGARDER)
   - **Region** : `Europe West (Paris)` (ou plus proche)
   - **Pricing Plan** : Free (suffisant pour MVP)

### 2. Récupérer les URLs de Connexion

#### Connection String (Pooling Mode)

1. Dashboard Supabase > Settings > Database
2. Section "Connection string"
3. Sélectionner "Pooling mode" (Transaction)
4. Copier l'URL → `DATABASE_URL`

Format :
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
```

#### Connection String (Direct)

1. Même page, section "Connection string"
2. Sélectionner "Direct connection"
3. Copier l'URL → `DIRECT_URL`

Format :
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require
```

⚠️ **Important** : Utiliser le port `6543` pour pooling (application) et `5432` pour direct (migrations).

### 3. Récupérer les Clés API

1. Dashboard Supabase > Settings > API
2. Copier :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ SECRET, jamais exposé)

---

## 🔧 Configuration Variables d'Environnement

Ajouter dans votre `.env` :

```bash
# Database - Supabase
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🗄️ Appliquer les Migrations Prisma

### Première Migration

```bash
# Aller dans le package db
cd packages/db

# Générer le client Prisma
pnpm db:generate

# Créer et appliquer les migrations
pnpm db:migrate dev --name init
```

### Migrations Futures

```bash
# Créer une nouvelle migration
pnpm db:migrate dev --name add_feature_name

# Appliquer migrations en production
pnpm db:migrate:deploy
```

---

## 🔒 Configuration Row Level Security (RLS)

### Activer RLS sur les Tables

⚠️ **À faire après migrations** : Activer RLS sur toutes les tables tenant-scoped.

Exemple SQL (à exécuter dans Supabase SQL Editor) :

```sql
-- Activer RLS sur toutes les tables avec school_id
ALTER TABLE "Student" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Class" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Teacher" ENABLE ROW LEVEL SECURITY;
-- ... etc pour toutes les tables

-- Créer policies (exemple pour Student)
CREATE POLICY "Users can only see students from their school"
ON "Student"
FOR SELECT
USING (
  school_id IN (
    SELECT school_id FROM "Membership" WHERE user_id = auth.uid()
  )
);
```

**Note** : Pour MVP, l'isolation tenant est gérée au niveau application. RLS PostgreSQL sera implémenté en V2.

---

## 📊 Utiliser Prisma Studio avec Supabase

```bash
# Depuis packages/db
cd packages/db
pnpm db:studio
```

Prisma Studio s'ouvrira et se connectera à votre base Supabase.

---

## 🧪 Tester la Connexion

### Test 1 : Health Check

```bash
# Démarrer l'app
pnpm dev

# Tester l'endpoint health
curl http://localhost:3000/api/health
```

### Test 2 : Prisma Studio

```bash
cd packages/db
pnpm db:studio
# Si Prisma Studio s'ouvre, la connexion fonctionne
```

### Test 3 : Créer un Utilisateur

1. Aller sur `http://localhost:3000/register`
2. Créer un compte
3. Vérifier dans Supabase Dashboard > Table Editor > User que l'utilisateur est créé

---

## 🔍 Monitoring & Logs

### Dashboard Supabase

- **Table Editor** : Voir/modifier données
- **SQL Editor** : Exécuter requêtes SQL
- **Database** : Voir structure, indexes, performances
- **Logs** : Voir logs de connexion, erreurs

### Métriques

Supabase Dashboard > Database > Metrics :
- Connexions actives
- Requêtes par seconde
- Taille base de données
- Backups

---

## 💾 Backups

### Backups Automatiques

Supabase fait des backups automatiques :
- **Free Plan** : Backups quotidiens (7 jours de rétention)
- **Pro Plan** : Backups horaires (7 jours) + point-in-time recovery

### Restauration

1. Dashboard Supabase > Database > Backups
2. Sélectionner un backup
3. Cliquer "Restore"

---

## 🚨 Limitations Free Plan

- **500 MB** de base de données
- **2 GB** de bande passante
- **500 MB** de stockage fichiers
- **2 projets** maximum

Pour MVP, c'est généralement suffisant. Pour production, considérer le plan Pro ($25/mois).

---

## 🔐 Sécurité

### Bonnes Pratiques

1. ✅ **Jamais exposer** `SUPABASE_SERVICE_ROLE_KEY` au frontend
2. ✅ **Utiliser RLS** pour isolation tenant (V2)
3. ✅ **Changer password** régulièrement
4. ✅ **Activer 2FA** sur compte Supabase
5. ✅ **Limiter accès** aux clés API

### Variables d'Environnement

- ✅ `DATABASE_URL` : Peut être publique (avec password)
- ✅ `DIRECT_URL` : Peut être publique (avec password)
- ✅ `NEXT_PUBLIC_SUPABASE_URL` : Publique (safe)
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Publique (safe, permissions limitées)
- ❌ `SUPABASE_SERVICE_ROLE_KEY` : **PRIVÉE** (permissions admin)

---

## 🐛 Dépannage

### Erreur : "Connection refused"

- Vérifier que `DATABASE_URL` utilise le port `6543` (pooling)
- Vérifier que `DIRECT_URL` utilise le port `5432` (direct)
- Vérifier firewall/IP whitelist dans Supabase

### Erreur : "Password authentication failed"

- Vérifier le mot de passe dans l'URL
- URL-encoder les caractères spéciaux (`%` pour `%`, etc.)
- Réinitialiser le mot de passe si nécessaire

### Erreur : "Too many connections"

- Utiliser `DATABASE_URL` avec pooling (`pgbouncer=true`)
- Vérifier que l'app utilise bien `DATABASE_URL` (pas `DIRECT_URL`)
- Augmenter le plan Supabase si nécessaire

### Erreur : "SSL required"

- Ajouter `?sslmode=require` à la fin de l'URL
- Vérifier que l'URL contient `sslmode=require`

---

## 📚 Ressources

- [Supabase Docs](https://supabase.com/docs)
- [Prisma + Supabase](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-supabase)
- [Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)

---

**Status** : ✅ Guide Supabase créé  
**Prochaine étape** : Configurer Supabase et appliquer les migrations
