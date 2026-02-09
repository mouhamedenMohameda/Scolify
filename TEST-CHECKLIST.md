# Checklist de Test - School Administration System

## ✅ Tests à Effectuer

### 🔐 Authentification

- [ ] **Register**
  - [ ] Créer compte avec email valide
  - [ ] Vérifier validation email invalide
  - [ ] Vérifier validation mot de passe faible
  - [ ] Vérifier redirection après création

- [ ] **Login**
  - [ ] Se connecter avec bonnes credentials
  - [ ] Vérifier erreur avec mauvais mot de passe
  - [ ] Vérifier erreur avec email inexistant
  - [ ] Vérifier redirection vers dashboard

- [ ] **Logout**
  - [ ] Se déconnecter
  - [ ] Vérifier redirection vers login
  - [ ] Vérifier cookies supprimés

- [ ] **Session**
  - [ ] Vérifier session persistante (refresh page)
  - [ ] Vérifier expiration token
  - [ ] Vérifier refresh token

---

### 🏫 Établissement

- [ ] **Années Scolaires**
  - [ ] Créer année scolaire
  - [ ] Activer année scolaire
  - [ ] Vérifier désactivation autres années
  - [ ] Vérifier validation dates (fin > début)

- [ ] **Périodes**
  - [ ] Créer période (trimestre)
  - [ ] Vérifier validation dates dans limites année
  - [ ] Modifier période
  - [ ] Supprimer période

- [ ] **Niveaux**
  - [ ] Créer niveau
  - [ ] Vérifier unicité code
  - [ ] Modifier niveau
  - [ ] Essayer supprimer niveau avec classes (erreur attendue)

- [ ] **Classes**
  - [ ] Créer classe
  - [ ] Vérifier unicité nom par année
  - [ ] Modifier classe
  - [ ] Voir détail classe
  - [ ] Essayer supprimer classe avec élèves (erreur attendue)

- [ ] **Salles**
  - [ ] Créer salle
  - [ ] Modifier salle
  - [ ] Supprimer salle
  - [ ] Essayer supprimer salle utilisée (erreur attendue)

---

### 👥 Élèves

- [ ] **Création**
  - [ ] Créer élève
  - [ ] Vérifier génération matricule automatique
  - [ ] Vérifier création inscription automatique
  - [ ] Vérifier validation champs requis

- [ ] **Recherche**
  - [ ] Rechercher par nom
  - [ ] Rechercher par prénom
  - [ ] Rechercher par matricule
  - [ ] Vérifier filtres (classe, niveau, statut)

- [ ] **Détail**
  - [ ] Voir détail élève
  - [ ] Vérifier informations affichées
  - [ ] Vérifier classe actuelle
  - [ ] Vérifier section parents

- [ ] **Import CSV**
  - [ ] Upload fichier CSV
  - [ ] Vérifier auto-détection mapping
  - [ ] Vérifier preview données
  - [ ] Importer élèves
  - [ ] Vérifier erreurs affichées si données invalides

- [ ] **Parents/Tuteurs**
  - [ ] Créer parent
  - [ ] Lier parent à élève
  - [ ] Vérifier relation affichée
  - [ ] Définir contact principal
  - [ ] Vérifier un seul contact principal

---

### 👨‍🏫 Professeurs & Matières

- [ ] **Matières**
  - [ ] Créer matière
  - [ ] Vérifier unicité code
  - [ ] Modifier matière
  - [ ] Supprimer matière

- [ ] **Professeurs**
  - [ ] Créer professeur (nécessite utilisateur existant)
  - [ ] Voir liste professeurs
  - [ ] Rechercher professeur
  - [ ] Modifier professeur

- [ ] **Affectations**
  - [ ] Créer affectation prof ↔ classe ↔ matière
  - [ ] Vérifier unicité affectation
  - [ ] Voir affectations d'un professeur
  - [ ] Supprimer affectation

---

### 📅 Emploi du Temps

- [ ] **Création EDT**
  - [ ] Créer emploi du temps
  - [ ] Activer emploi du temps
  - [ ] Vérifier désactivation autres EDT

- [ ] **Créneaux**
  - [ ] Créer créneau
  - [ ] Vérifier validation heures (fin > début)
  - [ ] Vérifier validation classe OU groupe requis
  - [ ] Voir créneau dans tableau

- [ ] **Conflits**
  - [ ] Créer créneau avec conflit professeur
  - [ ] Vérifier erreur conflit
  - [ ] Créer créneau avec conflit classe
  - [ ] Vérifier erreur conflit
  - [ ] Créer créneau avec conflit salle
  - [ ] Vérifier erreur conflit

- [ ] **Exceptions**
  - [ ] Créer exception (annulation)
  - [ ] Créer exception (changement salle)
  - [ ] Voir exceptions dans liste
  - [ ] Supprimer exception

- [ ] **Vue Semaine**
  - [ ] Voir tableau semaine
  - [ ] Vérifier créneaux affichés correctement
  - [ ] Vérifier informations créneaux (matière, classe, prof, salle)

---

### 🔒 Sécurité & Isolation

- [ ] **Isolation Tenant**
  - [ ] Créer 2 écoles (via DB ou API)
  - [ ] Créer élèves dans chaque école
  - [ ] Vérifier qu'une école ne voit pas élèves de l'autre
  - [ ] Vérifier qu'on ne peut pas accéder données autre école

- [ ] **Permissions**
  - [ ] Vérifier accès routes protégées sans auth (redirection)
  - [ ] Vérifier accès routes avec auth valide
  - [ ] Vérifier erreur 403 si pas permissions

---

### 🐛 Bugs à Vérifier

- [ ] **Validation**
  - [ ] Essayer créer élève sans nom (erreur attendue)
  - [ ] Essayer créer classe avec nom existant (erreur attendue)
  - [ ] Essayer créer période hors limites année (erreur attendue)

- [ ] **Contraintes Métier**
  - [ ] Essayer supprimer classe avec élèves (erreur attendue)
  - [ ] Essayer supprimer niveau avec classes (erreur attendue)
  - [ ] Essayer créer 2 années actives (seule dernière active)

- [ ] **Edge Cases**
  - [ ] Créer élève avec date naissance future (validation)
  - [ ] Créer créneau avec heures inversées (erreur attendue)
  - [ ] Import CSV avec colonnes manquantes (gestion erreurs)

---

## 📋 Résultats Attendus

### ✅ Succès

- Toutes les fonctionnalités core fonctionnent
- Validation des données fonctionne
- Isolation tenant garantie
- Conflits détectés correctement
- UI responsive et intuitive

### ⚠️ Problèmes Connus

- Tests unitaires/e2e à créer
- Gestion erreurs à améliorer (messages utilisateur)
- Performance à optimiser (grandes listes)
- Export données à implémenter

---

## 🎯 Critères de Validation

### Fonctionnels
- ✅ Toutes les fonctionnalités MVP implémentées fonctionnent
- ✅ Validation des données correcte
- ✅ Contraintes métier respectées
- ✅ Isolation tenant garantie

### Techniques
- ✅ Application démarre sans erreur
- ✅ Base de données fonctionne
- ✅ API routes répondent correctement
- ✅ UI s'affiche correctement

### UX
- ✅ Navigation intuitive
- ✅ Formulaires clairs
- ✅ Messages d'erreur compréhensibles
- ✅ Feedback utilisateur (loading, success)

---

**Status** : ✅ Checklist créée  
**Action** : Tester chaque point, puis continuer Sprint 6
