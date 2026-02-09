# Notes de Corrections & Améliorations

## 🔧 Corrections Apportées

### 1. Page Import CSV
- ✅ Corrigé `useState` → `useEffect` pour fetch données
- ✅ Ajout dépendances dans useEffect

### 2. Seed Script
- ✅ Créé script seed avec données de test
- ✅ Ajout commande `db:seed` dans package.json
- ✅ Ajout commande `db:reset` pour reset + seed

---

## 📝 Améliorations Futures

### Court Terme (Sprint 6-7)

1. **Gestion Erreurs**
   - Améliorer messages erreurs utilisateur
   - Ajouter toasts/notifications
   - Gestion erreurs réseau

2. **Performance**
   - Optimiser requêtes DB (éviter N+1)
   - Ajouter pagination partout
   - Lazy loading composants

3. **UX**
   - Loading states partout
   - Confirmations avant suppressions
   - Messages succès après actions

### Moyen Terme (V2)

1. **Tests**
   - Tests unitaires (Vitest)
   - Tests intégration (API)
   - Tests e2e (Playwright)

2. **Export**
   - Export élèves CSV/Excel
   - Export notes
   - Export présences

3. **Recherche Avancée**
   - Filtres multiples
   - Recherche globale
   - Sauvegarde filtres

---

## 🐛 Bugs Potentiels à Surveiller

1. **Timezone** : Vérifier gestion dates/heures (timezone serveur vs client)
2. **Conflits EDT** : Vérifier détection avec semaines A/B
3. **Import CSV** : Gérer encodage fichiers (UTF-8, Windows-1252)
4. **Pagination** : Vérifier avec grandes listes (1000+ éléments)

---

## ✅ Prêt pour Tests

L'application est prête pour tests complets. Utiliser `TEST-CHECKLIST.md` pour tester systématiquement toutes les fonctionnalités.

**Prochaine étape après tests** : Sprint 6 - Présences & Absences
