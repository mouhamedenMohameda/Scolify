# Guide de Test - Sprint 8 : Communication & Notifications

## 🧪 Tests Rapides

### Prérequis

1. ✅ Application démarrée (`pnpm dev`)
2. ✅ Base de données configurée
3. ✅ Connecté en tant qu'admin
4. ✅ Au moins 2 utilisateurs créés (pour tester messagerie)

---

## Test 1 : Messagerie

### Étapes

1. **Aller sur `/admin/messages`**
   - ✅ Page s'affiche avec liste conversations (vide au début)

2. **Créer une conversation**
   - ✅ Cliquer "Nouvelle conversation"
   - ✅ Sélectionner destinataires (dans un vrai app, charger liste utilisateurs)
   - ✅ Créer conversation
   - ✅ Conversation apparaît dans la liste

3. **Envoyer un message**
   - ✅ Sélectionner conversation
   - ✅ Zone messages s'affiche
   - ✅ Taper message dans input
   - ✅ Cliquer "Envoyer" ou appuyer Enter
   - ✅ Message apparaît dans la conversation

4. **Vérifier marquage comme lu**
   - ✅ Messages marqués automatiquement comme lus
   - ✅ Badge "non lu" disparaît

---

## Test 2 : Annonces

### Étapes

1. **Aller sur `/admin/announcements`**
   - ✅ Page s'affiche avec liste annonces

2. **Créer une annonce**
   - ✅ Cliquer "Nouvelle annonce"
   - ✅ Remplir :
     - Titre : "Réunion parents-professeurs"
     - Contenu : "La réunion aura lieu le..."
     - Type : "URGENT"
     - Audience : "ALL" ou sélectionner classes
   - ✅ Créer
   - ✅ Annonce apparaît dans la liste

3. **Vérifier filtrage**
   - ✅ Annonces filtrées selon audience
   - ✅ Annonces expirées non affichées

4. **Supprimer annonce**
   - ✅ Cliquer "Supprimer"
   - ✅ Confirmer
   - ✅ Annonce supprimée

---

## Test 3 : Notifications (API)

### Via API

```bash
# Créer notification
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "userId": "<USER_ID>",
    "type": "GRADE",
    "title": "Nouvelle note",
    "content": "Vous avez reçu une nouvelle note en Mathématiques"
  }'

# Liste notifications
curl http://localhost:3000/api/notifications \
  -b cookies.txt

# Marquer comme lue
curl -X PUT http://localhost:3000/api/notifications/<ID> \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"read": true}'

# Marquer toutes comme lues
curl -X PUT http://localhost:3000/api/notifications/read-all \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{}'
```

### Vérifications

- ✅ Notification créée
- ✅ Liste notifications fonctionne
- ✅ Compteur non lues correct
- ✅ Marquer comme lue fonctionne
- ✅ Marquer toutes comme lues fonctionne

---

## ✅ Checklist Complète

- [ ] Créer conversation
- [ ] Envoyer message
- [ ] Voir historique messages
- [ ] Messages marqués comme lus
- [ ] Créer annonce
- [ ] Filtrer annonces par audience
- [ ] Supprimer annonce
- [ ] Créer notification (API)
- [ ] Liste notifications (API)
- [ ] Marquer notification comme lue (API)

---

**Status** : ✅ Guide de test créé  
**Action** : Tester toutes les fonctionnalités, puis continuer Sprint 9
