# Quick Start Guide - School Administration System

## 🚀 Démarrage Rapide

### 1. Prérequis

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose (pour infrastructure)
- PostgreSQL (ou utiliser Supabase comme dans votre .env)

### 2. Installation

```bash
# Cloner le repo (si pas déjà fait)
# git clone <repo-url>
# cd school-admin-system

# Installer dépendances
pnpm install

# Vérifier configuration
# Le fichier .env doit être configuré (vous utilisez Supabase)
```

### 3. Setup Base de Données

#### Option A : Supabase (votre configuration actuelle)

```bash
# Votre DATABASE_URL est déjà configurée dans .env
# Générer le client Prisma
cd packages/db
pnpm db:generate

# Créer les migrations
pnpm db:migrate

# (Optionnel) Seeder avec données de test
pnpm db:seed
```

#### Option B : Docker Compose (local)

```bash
# Démarrer PostgreSQL, Redis, MinIO
docker-compose up -d

# Vérifier services
docker-compose ps

# Setup database
cd packages/db
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### 4. Démarrer l'Application

```bash
# Depuis la racine
pnpm dev

# L'application sera accessible sur http://localhost:3000
```

---

## 🧪 Tests Rapides

### Test 1 : Créer un Compte

1. Aller sur `http://localhost:3000/register`
2. Remplir :
   - Email : `admin@test.com`
   - Password : `Test123456`
   - Prénom : `Admin`
   - Nom : `Test`
3. Cliquer "Créer mon compte"
4. ✅ Redirection vers `/login`

### Test 2 : Se Connecter

1. Aller sur `http://localhost:3000/login`
2. Se connecter avec `admin@test.com` / `Test123456`
3. ✅ Redirection vers `/dashboard`

### Test 3 : Créer une Année Scolaire

1. Aller sur `/admin/school/academic-years`
2. Cliquer "Nouvelle année scolaire"
3. Remplir :
   - Nom : `2024-2025`
   - Date début : `2024-09-01`
   - Date fin : `2025-06-30`
4. Cliquer "Créer"
5. ✅ Année créée dans la liste

### Test 4 : Créer un Niveau

1. Aller sur `/admin/school/levels`
2. Cliquer "Nouveau niveau"
3. Remplir :
   - Code : `6EME`
   - Nom : `Sixième`
   - Ordre : `6`
4. Cliquer "Créer"
5. ✅ Niveau créé

### Test 5 : Créer une Classe

1. Aller sur `/admin/school/classes`
2. Cliquer "Nouvelle classe"
3. Sélectionner année scolaire créée
4. Sélectionner niveau créé
5. Nom : `6ème A`
6. Capacité : `30`
7. Cliquer "Créer"
8. ✅ Classe créée

### Test 6 : Créer une Matière

1. Aller sur `/admin/subjects`
2. Cliquer "Nouvelle matière"
3. Remplir :
   - Code : `MATH`
   - Nom : `Mathématiques`
4. Cliquer "Créer"
5. ✅ Matière créée

### Test 7 : Inscrire un Élève

1. Aller sur `/admin/students`
2. Cliquer "Nouvel élève"
3. Remplir :
   - Prénom : `Alice`
   - Nom : `Martin`
   - Date naissance : `2010-05-15`
   - Sélectionner année scolaire
   - Sélectionner classe
4. Cliquer "Inscrire"
5. ✅ Élève créé avec matricule généré

### Test 8 : Créer un Créneau EDT

1. Aller sur `/admin/timetable`
2. Sélectionner année scolaire
3. Cliquer "Nouveau créneau"
4. Remplir :
   - Classe : `6ème A`
   - Matière : `Mathématiques`
   - Professeur : (créer d'abord un professeur si nécessaire)
   - Jour : `Lundi`
   - Heure début : `08:00`
   - Heure fin : `09:00`
5. Cliquer "Créer"
6. ✅ Créneau créé et visible dans le tableau

---

## 🔍 Vérifications

### Vérifier Base de Données

```bash
# Ouvrir Prisma Studio
cd packages/db
pnpm db:studio

# Vérifier tables créées
# Vérifier données seed (si seed exécuté)
```

### Vérifier API

```bash
# Health check
curl http://localhost:3000/api/health

# Devrait retourner :
# {"status":"ok","timestamp":"...","version":"0.1.0"}
```

### Vérifier Logs

```bash
# Vérifier logs Next.js dans le terminal
# Vérifier logs Prisma (queries SQL)
```

---

## 🐛 Dépannage

### Erreur : "Cannot find module '@school-admin/...'"

```bash
# Réinstaller dépendances
pnpm install
```

### Erreur : "Prisma Client not generated"

```bash
cd packages/db
pnpm db:generate
```

### Erreur : "Database connection failed"

**Pour Supabase** :
- Vérifier `DATABASE_URL` dans `.env`
- Vérifier que le projet Supabase est actif
- Vérifier les credentials

**Pour Docker** :
```bash
docker-compose up -d postgres
docker-compose logs postgres
```

### Erreur : "Port 3000 already in use"

```bash
# Changer port dans .env
PORT=3001

# Ou arrêter le processus
lsof -ti:3000 | xargs kill
```

### Erreur : "Migration failed"

```bash
# Reset database (ATTENTION : supprime toutes les données)
cd packages/db
pnpm db:reset

# Ou créer migration manuelle
pnpm db:migrate --name init
```

---

## 📝 Checklist Pré-Test

- [ ] Dépendances installées (`pnpm install`)
- [ ] Base de données configurée (`.env` avec `DATABASE_URL`)
- [ ] Client Prisma généré (`pnpm db:generate`)
- [ ] Migrations appliquées (`pnpm db:migrate`)
- [ ] (Optionnel) Données seed (`pnpm db:seed`)
- [ ] Application démarre (`pnpm dev`)
- [ ] Health check fonctionne (`/api/health`)

---

## 🎯 Tests Fonctionnels

### Test Complet : Workflow Élève

1. ✅ Créer année scolaire `2024-2025`
2. ✅ Créer niveau `6EME`
3. ✅ Créer classe `6ème A`
4. ✅ Créer matière `Mathématiques`
5. ✅ Inscrire élève `Alice Martin`
6. ✅ Vérifier matricule généré
7. ✅ Vérifier inscription automatique dans classe
8. ✅ Voir détail élève
9. ✅ Rechercher élève par nom

### Test Complet : Workflow EDT

1. ✅ Créer emploi du temps pour année scolaire
2. ✅ Créer créneau : `6ème A` - `Math` - `Lundi 8h-9h`
3. ✅ Vérifier créneau dans tableau
4. ✅ Essayer créer créneau conflictuel (même prof, même heure)
5. ✅ Vérifier erreur conflit
6. ✅ Créer exception (annulation cours)

---

## 📊 Données de Test (Seed)

Le script `packages/db/src/seed.ts` crée :

- ✅ 1 école : "École Test"
- ✅ 1 année scolaire : "2024-2025" (active)
- ✅ 3 périodes : Trimestre 1, 2, 3
- ✅ 9 niveaux : CP → 3EME
- ✅ 4 salles : Salle 101, 102, Labo, Info
- ✅ 7 matières : Français, Math, Anglais, etc.
- ✅ 2 classes : 6ème A, 6ème B

**Note** : Le seed nécessite que les migrations soient appliquées.

---

## 🚀 Commandes Utiles

```bash
# Développement
pnpm dev                    # Démarrer app
pnpm build                  # Build production
pnpm lint                   # Linter
pnpm type-check             # Vérifier types

# Database
pnpm db:generate            # Générer client Prisma
pnpm db:migrate             # Créer/appliquer migrations
pnpm db:seed                # Seeder données test
pnpm db:studio              # Ouvrir Prisma Studio
pnpm db:reset               # Reset DB + seed

# Infrastructure
docker-compose up -d        # Démarrer services
docker-compose down         # Arrêter services
docker-compose logs         # Voir logs
```

---

## ✅ Après Tests

Une fois les tests effectués, vous pouvez :

1. **Continuer développement** : Sprint 6 (Présences)
2. **Corriger bugs** : Si problèmes détectés
3. **Améliorer UI** : Ajuster selon retours tests
4. **Ajouter tests** : Créer tests unitaires/e2e

---

**Status** : ✅ Guide de démarrage rapide créé  
**Prochaine étape** : Tester l'application, puis continuer Sprint 6
