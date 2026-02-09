# Guide de Test - Sprint 6 : Présences & Absences

## 🧪 Tests Rapides

### Prérequis

1. ✅ Application démarrée (`pnpm dev`)
2. ✅ Base de données configurée et migrations appliquées
3. ✅ Données de test créées (optionnel : `pnpm db:seed`)
4. ✅ Connecté en tant qu'admin

---

## Test 1 : Marquer les Présences

### Étapes

1. **Aller sur `/admin/attendance`**
   - ✅ Page s'affiche avec liste des présences (vide au début)

2. **Cliquer "Marquer les présences"**
   - ✅ Dialog s'ouvre

3. **Sélectionner un créneau**
   - ✅ Si EDT créé, les créneaux s'affichent
   - ✅ Si pas de créneau, créer d'abord un EDT avec créneaux

4. **Sélectionner une date**
   - ✅ Date par défaut = aujourd'hui

5. **Vérifier chargement élèves**
   - ✅ Après sélection créneau, les élèves de la classe s'affichent
   - ✅ Chaque élève a un select pour statut (Présent/Absent/Retard/Excusé)

6. **Marquer présences**
   - ✅ Sélectionner statut pour chaque élève
   - ✅ Cliquer "Enregistrer"
   - ✅ Dialog se ferme
   - ✅ Liste des présences se met à jour

7. **Vérifier enregistrement**
   - ✅ Les présences apparaissent dans la liste
   - ✅ Statut affiché avec couleur (vert/rouge/jaune/bleu)
   - ✅ Date, matière, élève affichés correctement

---

## Test 2 : Créer un Justificatif

### Via API (pour tester)

```bash
# Créer un justificatif
curl -X POST http://localhost:3000/api/justifications \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "studentId": "<STUDENT_ID>",
    "date": "2024-12-15",
    "reason": "Maladie avec certificat médical"
  }'
```

### Vérifications

1. **Aller sur `/admin/justifications`**
   - ✅ Liste des justificatifs s'affiche
   - ✅ Justificatif créé apparaît avec statut "En attente"

2. **Vérifier lien automatique**
   - ✅ Si présence existe pour cet élève à cette date, elle est liée
   - ✅ `isJustified = true` sur l'enregistrement de présence

---

## Test 3 : Examiner un Justificatif

### Étapes

1. **Aller sur `/admin/justifications`**
   - ✅ Liste des justificatifs s'affiche

2. **Cliquer "Examiner" sur un justificatif en attente**
   - ✅ Dialog s'ouvre
   - ✅ Raison affichée
   - ✅ Date affichée
   - ✅ Document affiché si fourni

3. **Approuver le justificatif**
   - ✅ Sélectionner "Approuver"
   - ✅ Ajouter notes optionnelles
   - ✅ Cliquer "Enregistrer"
   - ✅ Statut passe à "Approuvé"
   - ✅ Liste se met à jour

4. **Vérifier impact sur présences**
   - ✅ Aller sur `/admin/attendance`
   - ✅ Vérifier que les présences liées ont `isJustified = true`

---

## Test 4 : Rejeter un Justificatif

### Étapes

1. **Créer un justificatif** (via API ou UI)

2. **Examiner et rejeter**
   - ✅ Sélectionner "Rejeter"
   - ✅ Ajouter notes (ex: "Certificat manquant")
   - ✅ Enregistrer

3. **Vérifier déliaison**
   - ✅ Aller sur `/admin/attendance`
   - ✅ Vérifier que les présences liées ont `isJustified = false`
   - ✅ `justificationId = null`

---

## Test 5 : Statistiques de Présence

### Via API

```bash
# Statistiques globales
curl http://localhost:3000/api/attendance/stats \
  -b cookies.txt

# Statistiques par élève
curl "http://localhost:3000/api/attendance/stats?studentId=<STUDENT_ID>" \
  -b cookies.txt

# Statistiques par classe
curl "http://localhost:3000/api/attendance/stats?classId=<CLASS_ID>" \
  -b cookies.txt

# Statistiques avec période
curl "http://localhost:3000/api/attendance/stats?dateFrom=2024-12-01&dateTo=2024-12-31" \
  -b cookies.txt
```

### Vérifications

- ✅ `total` : nombre total d'enregistrements
- ✅ `present`, `absent`, `late`, `excused` : compteurs par statut
- ✅ `presentRate` : taux de présence (%)
- ✅ `absentRate` : taux d'absence (%)

---

## Test 6 : Filtres Liste Présences

### Via API

```bash
# Filtrer par élève
curl "http://localhost:3000/api/attendance?studentId=<STUDENT_ID>" \
  -b cookies.txt

# Filtrer par classe
curl "http://localhost:3000/api/attendance?classId=<CLASS_ID>" \
  -b cookies.txt

# Filtrer par statut
curl "http://localhost:3000/api/attendance?status=ABSENT" \
  -b cookies.txt

# Filtrer par date
curl "http://localhost:3000/api/attendance?dateFrom=2024-12-01&dateTo=2024-12-31" \
  -b cookies.txt

# Combinaison
curl "http://localhost:3000/api/attendance?classId=<CLASS_ID>&status=ABSENT&dateFrom=2024-12-01" \
  -b cookies.txt
```

### Vérifications

- ✅ Résultats filtrés correctement
- ✅ Pagination fonctionne
- ✅ Isolation tenant garantie (pas d'accès aux données d'autres écoles)

---

## Test 7 : Calcul Retard Automatique

### Étapes

1. **Créer un créneau EDT** avec heure de début (ex: 08:00)

2. **Marquer présence avec retard**
   - ✅ Créer enregistrement avec `status = "LATE"`
   - ✅ Fournir `arrivalTime` (ex: 08:15)

3. **Vérifier calcul**
   - ✅ `minutesLate` calculé automatiquement (15 minutes dans l'exemple)
   - ✅ Vérifier dans la base de données ou via API

---

## Test 8 : Isolation Multi-Tenant

### Étapes

1. **Créer 2 écoles** (via DB ou API)

2. **Créer présences dans chaque école**

3. **Vérifier isolation**
   - ✅ Se connecter avec compte école 1
   - ✅ Voir uniquement présences école 1
   - ✅ Se connecter avec compte école 2
   - ✅ Voir uniquement présences école 2

---

## 🐛 Problèmes Connus / À Vérifier

1. **Page UI Présences** :
   - ⚠️ Le formulaire bulk create nécessite amélioration UX
   - ⚠️ Gestion erreurs à améliorer (messages utilisateur)

2. **Performance** :
   - ⚠️ Chargement élèves peut être lent si classe grande
   - ⚠️ Optimiser requêtes avec filtres multiples

3. **Validation** :
   - ⚠️ Vérifier gestion dates (timezone)
   - ⚠️ Vérifier validation statuts

---

## ✅ Checklist Complète

- [ ] Marquer présences par créneau
- [ ] Liste présences s'affiche
- [ ] Créer justificatif
- [ ] Examiner justificatif
- [ ] Approuver justificatif
- [ ] Rejeter justificatif
- [ ] Lien automatique justificatif ↔ présences
- [ ] Statistiques fonctionnent
- [ ] Filtres fonctionnent
- [ ] Calcul retard automatique
- [ ] Isolation tenant garantie
- [ ] Pagination fonctionne
- [ ] Gestion erreurs (messages clairs)

---

**Status** : ✅ Guide de test créé  
**Action** : Tester toutes les fonctionnalités, puis continuer Sprint 7
