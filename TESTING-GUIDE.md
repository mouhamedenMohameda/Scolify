# Guide de Test - School Administration System

## 🧪 Tests Rapides

### 1. Setup Initial

```bash
# Installer dépendances
pnpm install

# Démarrer infrastructure
docker-compose up -d

# Vérifier services
docker-compose ps

# Setup database
cd packages/db
pnpm db:generate
pnpm db:migrate

# Retour racine
cd ../..

# Démarrer app
pnpm dev
```

L'application sera accessible sur `http://localhost:3000`

---

## 2. Tests Auth (Sprint 1)

### Test Register
1. Aller sur `http://localhost:3000/register`
2. Remplir formulaire :
   - Email : `admin@school.com`
   - Password : `SecurePass123`
   - Prénom : `Admin`
   - Nom : `Test`
3. Cliquer "Créer mon compte"
4. ✅ Vérifier redirection vers `/login`

### Test Login
1. Aller sur `http://localhost:3000/login`
2. Se connecter avec :
   - Email : `admin@school.com`
   - Password : `SecurePass123`
3. ✅ Vérifier redirection vers `/dashboard`

### Test Dashboard
1. Vérifier affichage dashboard
2. ✅ Vérifier nom utilisateur affiché
3. ✅ Vérifier liens navigation fonctionnels

---

## 3. Tests Établissement (Sprint 2)

### Test Créer Année Scolaire
1. Aller sur `/admin/school/academic-years`
2. Cliquer "Nouvelle année scolaire"
3. Remplir :
   - Nom : `2024-2025`
   - Date début : `2024-09-01`
   - Date fin : `2025-06-30`
4. Cliquer "Créer"
5. ✅ Vérifier année créée dans la liste

### Test Créer Niveau
1. Aller sur `/admin/school/levels`
2. Cliquer "Nouveau niveau"
3. Remplir :
   - Code : `6EME`
   - Nom : `Sixième`
   - Ordre : `6`
4. Cliquer "Créer"
5. ✅ Vérifier niveau créé

### Test Créer Classe
1. Aller sur `/admin/school/classes`
2. Cliquer "Nouvelle classe"
3. Sélectionner année scolaire créée
4. Sélectionner niveau créé
5. Nom : `6ème A`
6. Capacité : `30`
7. Cliquer "Créer"
8. ✅ Vérifier classe créée

### Test Créer Salle
1. Aller sur `/admin/school/rooms`
2. Cliquer "Nouvelle salle"
3. Remplir :
   - Nom : `Salle 101`
   - Type : `Salle de classe`
   - Capacité : `30`
4. Cliquer "Créer"
5. ✅ Vérifier salle créée

---

## 4. Tests Élèves (Sprint 3)

### Test Créer Élève
1. Aller sur `/admin/students`
2. Cliquer "Nouvel élève"
3. Remplir :
   - Prénom : `Alice`
   - Nom : `Martin`
   - Date naissance : `2010-05-15`
   - Sélectionner année scolaire
   - Sélectionner classe
4. Cliquer "Inscrire"
5. ✅ Vérifier élève créé avec matricule généré
6. ✅ Vérifier inscription automatique dans classe

### Test Recherche Élève
1. Dans la liste élèves, utiliser la barre de recherche
2. Taper "Alice"
3. ✅ Vérifier filtrage en temps réel

### Test Détail Élève
1. Cliquer "Voir" sur un élève
2. ✅ Vérifier informations affichées
3. ✅ Vérifier classe actuelle
4. ✅ Vérifier section parents/tuteurs

### Test Import CSV
1. Aller sur `/admin/students/import`
2. Créer fichier CSV exemple :
```csv
prénom,nom,date de naissance,email
Bob,Dupont,2010-03-20,bob@example.com
Claire,Durand,2010-07-10,claire@example.com
```
3. Upload fichier
4. Vérifier mapping auto-détecté
5. Sélectionner année scolaire et classe
6. Vérifier preview
7. Cliquer "Importer"
8. ✅ Vérifier élèves importés

---

## 5. Tests Professeurs (Sprint 4)

### Test Créer Matière
1. Aller sur `/admin/subjects`
2. Cliquer "Nouvelle matière"
3. Remplir :
   - Code : `MATH`
   - Nom : `Mathématiques`
4. Cliquer "Créer"
5. ✅ Vérifier matière créée

### Test Créer Professeur
**Note** : Nécessite un utilisateur existant

1. Créer d'abord un utilisateur via `/register` (ex: `teacher@school.com`)
2. Aller sur `/admin/teachers`
3. Cliquer "Nouveau professeur"
4. Sélectionner utilisateur créé
5. Remplir numéro employé (optionnel)
6. Cliquer "Créer"
7. ✅ Vérifier professeur créé

### Test Affectation
1. Via API ou interface (à créer) :
   - POST `/api/teacher-assignments`
   - Body :
```json
{
  "teacherId": "uuid-teacher",
  "classId": "uuid-class",
  "subjectId": "uuid-subject",
  "academicYearId": "uuid-year"
}
```
2. ✅ Vérifier affectation créée

---

## 6. Tests API Directs

### Test Health Check
```bash
curl http://localhost:3000/api/health
```
✅ Devrait retourner `{"status":"ok",...}`

### Test Liste Élèves
```bash
curl -H "Cookie: accessToken=..." http://localhost:3000/api/students
```
✅ Devrait retourner liste élèves

### Test Créer Élève (API)
```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=..." \
  -d '{
    "firstName": "Test",
    "lastName": "Student",
    "dateOfBirth": "2010-01-01",
    "classId": "uuid-class",
    "academicYearId": "uuid-year"
  }'
```
✅ Devrait créer élève avec matricule

---

## 7. Checklist Fonctionnalités

### Auth
- [ ] Register fonctionne
- [ ] Login fonctionne
- [ ] Logout fonctionne
- [ ] Dashboard accessible après login
- [ ] Redirection si non authentifié

### Établissement
- [ ] Créer année scolaire
- [ ] Activer année scolaire
- [ ] Créer période
- [ ] Créer niveau
- [ ] Créer classe
- [ ] Créer salle

### Élèves
- [ ] Créer élève
- [ ] Matricule généré automatiquement
- [ ] Inscription créée automatiquement
- [ ] Recherche fonctionne
- [ ] Filtres fonctionnent
- [ ] Détail élève affiche toutes infos
- [ ] Import CSV fonctionne

### Professeurs
- [ ] Créer matière
- [ ] Créer professeur
- [ ] Affectation prof ↔ classe ↔ matière

---

## 8. Tests de Régression

### Isolation Tenant
1. Créer 2 écoles (via API ou DB)
2. Créer élèves dans chaque école
3. ✅ Vérifier qu'une école ne voit pas les élèves de l'autre

### Validation Données
1. Essayer créer élève sans nom
2. ✅ Vérifier erreur validation
3. Essayer créer classe avec nom existant
4. ✅ Vérifier erreur conflit

### Contraintes Métier
1. Essayer supprimer classe avec élèves
2. ✅ Vérifier erreur (ne peut pas supprimer)
3. Essayer créer période hors limites année
4. ✅ Vérifier erreur validation

---

## 9. Performance

### Tests Charge
- [ ] Liste 100+ élèves charge rapidement
- [ ] Recherche réactive (<500ms)
- [ ] Pagination fonctionne

### Tests Base de Données
- [ ] Requêtes optimisées (vérifier logs Prisma)
- [ ] Pas de N+1 queries
- [ ] Index utilisés

---

## 10. Bugs Connus / TODOs

### À Corriger
- [ ] Page import CSV : useEffect pour fetch classes/academic years
- [ ] Page teachers : Fetch users list pour sélection
- [ ] Gestion erreurs : Améliorer messages utilisateur
- [ ] Tests : Créer tests unitaires et e2e

### Améliorations Futures
- [ ] Export élèves en CSV
- [ ] Bulk actions (sélection multiple)
- [ ] Historique scolarité complet
- [ ] Upload documents élèves

---

## 🐛 Dépannage

### Erreur : "Cannot find module"
```bash
pnpm install
```

### Erreur : "Prisma Client not generated"
```bash
cd packages/db
pnpm db:generate
```

### Erreur : "Database connection failed"
```bash
docker-compose up -d postgres
# Vérifier DATABASE_URL dans .env
```

### Erreur : "Port 3000 already in use"
```bash
# Changer port dans .env
PORT=3001
```

---

## 📝 Notes

- Les tests e2e complets seront créés avec Playwright (Sprint suivant)
- Les tests unitaires seront ajoutés progressivement
- Focus actuel : Fonctionnalités core opérationnelles

---

**Status** : ✅ Guide de test créé  
**Prochaine étape** : Sprint 5 - Emploi du Temps
