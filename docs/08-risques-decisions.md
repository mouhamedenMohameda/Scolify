# Risques & Points de Décision - School Administration System

## Vue d'ensemble

Ce document identifie les risques techniques, métier et organisationnels, ainsi que les points de décision nécessitant validation ou clarification.

---

## 1. Risques Techniques

### 1.1 Isolation Multi-Tenant

**Risque** : Fuite de données entre tenants (écoles).

**Impact** : Critique (sécurité, conformité RGPD).

**Mitigation** :
- ✅ RLS PostgreSQL + middleware Prisma
- ✅ Tests d'isolation automatiques
- ✅ Audit logs pour détection fuites
- ✅ Review code sécurité avant merge

**Décision** : Valider stratégie RLS vs séparation schémas DB (choix : RLS pour MVP, évolutif).

---

### 1.2 Performance & Scalabilité

**Risque** : Dégradation performance avec croissance (nombre écoles, élèves, données).

**Impact** : Élevé (UX dégradée, coûts infrastructure).

**Mitigation** :
- ✅ Indexation DB optimale
- ✅ Cache Redis (queries fréquentes)
- ✅ Pagination systématique
- ✅ Jobs asynchrones (exports, PDFs)
- ✅ Monitoring performance (APM)
- ✅ Partitioning tables volumineuses (V2)

**Décision** : Définir seuils performance acceptables (ex: <2s chargement pages, <500ms queries DB).

---

### 1.3 Génération EDT Automatique

**Risque** : Complexité algorithmique élevée (NP-complet), performance dégradée.

**Impact** : Moyen (fonctionnalité reportée MVP).

**Mitigation** :
- ✅ MVP : Création manuelle uniquement
- ✅ V2 : Algorithme heuristique (pas optimal mais rapide)
- ✅ V3 : Optimisation avec contraintes configurables

**Décision** : Valider approche MVP (manuel) vs intégration solution tierce (ex: FET).

---

### 1.4 Génération PDF Bulletins

**Risque** : Performance dégradée si génération synchrone (timeout, UX bloquée).

**Impact** : Moyen.

**Mitigation** :
- ✅ Jobs asynchrones (BullMQ)
- ✅ Cache PDFs générés
- ✅ Génération progressive (batch)
- ✅ Fallback : Génération à la demande

**Décision** : Valider stratégie génération (batch vs on-demand).

---

### 1.5 Intégration Paiement (Stripe)

**Risque** : Complexité webhooks, gestion erreurs, conformité PCI.

**Impact** : Moyen (V2).

**Mitigation** :
- ✅ Utilisation Stripe (conformité PCI gérée)
- ✅ Webhooks idempotents
- ✅ Retry logic pour échecs
- ✅ Tests webhooks (Stripe CLI)

**Décision** : Valider choix Stripe vs autres solutions (PayPal, etc.).

---

## 2. Risques Métier

### 2.1 Variabilité Systèmes Scolaires

**Risque** : Systèmes scolaires varient selon pays/régions (calendriers, notes, périodes).

**Impact** : Élevé (adoption limitée si trop rigide).

**Mitigation** :
- ✅ Paramétrage flexible (calendriers, barèmes, périodes)
- ✅ Configuration par école (settings JSON)
- ✅ Validation marché avant développement complet

**Décision** : Valider périmètre géographique initial (France uniquement ? Europe ?).

**Hypothèse MVP** : Système français (trimestres, notes 0-20, niveaux CP→Terminale).

---

### 2.2 Conformité RGPD

**Risque** : Non-conformité RGPD (sanctions, réputation).

**Impact** : Critique.

**Mitigation** :
- ✅ Consentements trackés
- ✅ Droit accès/suppression implémenté
- ✅ Audit logs complets
- ✅ Anonymisation données
- ✅ Validation juridique recommandée

**Décision** : Valider avec expert juridique avant production.

**Points à valider** :
- Rétention données (durées par type)
- Anonymisation vs suppression
- Transferts internationaux (si multi-pays)

---

### 2.3 Besoins Spécifiques Écoles

**Risque** : Fonctionnalités manquantes selon besoins spécifiques écoles.

**Impact** : Moyen (adoption limitée).

**Mitigation** :
- ✅ Paramétrage extensif
- ✅ Feedback utilisateurs (beta testeurs)
- ✅ Roadmap transparente
- ✅ Extensibilité architecture

**Décision** : Identifier écoles pilotes pour validation besoins.

---

### 2.4 Migration Données Existantes

**Risque** : Écoles ont déjà systèmes (Excel, autres logiciels), migration complexe.

**Impact** : Moyen (barrière adoption).

**Mitigation** :
- ✅ Import CSV/Excel robuste
- ✅ Mapping colonnes flexible
- ✅ Preview avant import
- ✅ Rollback possible
- ✅ Support migration (optionnel)

**Décision** : Valider formats d'import supportés (CSV, Excel, autres ?).

---

## 3. Risques Organisationnels

### 3.1 Dépassement Délais

**Risque** : MVP prend plus de temps que prévu (14 semaines).

**Impact** : Élevé (coûts, marché).

**Mitigation** :
- ✅ Priorisation stricte (MVP réduit si nécessaire)
- ✅ Sprints courts (2 semaines max)
- ✅ Définition de fait claire
- ✅ Revue sprint régulière
- ✅ Buffer intégré (20% temps)

**Décision** : Valider scope MVP réduit si nécessaire (quelles features sacrifier ?).

---

### 3.2 Dépendances Externes

**Risque** : Dépendances services externes (Stripe, Resend, S3) indisponibles.

**Impact** : Moyen.

**Mitigation** :
- ✅ Fallbacks (ex: email SMTP si Resend down)
- ✅ Retry logic
- ✅ Monitoring uptime services
- ✅ Alternatives identifiées

**Décision** : Valider choix services externes (alternatives préparées ?).

---

### 3.3 Maintenance & Support

**Risque** : Charge support élevée après lancement.

**Impact** : Moyen.

**Mitigation** :
- ✅ Documentation utilisateur complète
- ✅ FAQ / Knowledge base
- ✅ Onboarding guidé
- ✅ Support niveau 1 (chat/email)
- ✅ Monitoring proactif (erreurs, performance)

**Décision** : Valider modèle support (niveaux, SLA, outils).

---

## 4. Points de Décision Techniques

### 4.1 Stack Backend

**Choix** : Next.js API Routes vs NestJS séparé.

**Recommandation MVP** : Next.js API Routes (simplicité, monorepo).

**Recommandation V2** : Évaluer migration NestJS si besoin scalabilité.

**Décision** : ✅ Valider Next.js API Routes pour MVP.

---

### 4.2 Base de Données

**Choix** : PostgreSQL vs autres (MySQL, MongoDB).

**Recommandation** : PostgreSQL (RLS, JSON, full-text search, maturité).

**Décision** : ✅ PostgreSQL validé.

---

### 4.3 Authentification

**Choix** : JWT vs sessions, SSO (Google/Microsoft), MFA.

**Recommandation MVP** :
- JWT (access + refresh)
- SSO optionnel (V2)
- MFA optionnel (V2)

**Décision** : ✅ JWT validé, SSO/MFA en V2.

---

### 4.4 Stockage Fichiers

**Choix** : S3 (AWS) vs MinIO (self-hosted) vs autres.

**Recommandation MVP** : MinIO (dev) + S3 (prod).

**Décision** : ✅ MinIO/S3 validé.

---

### 4.5 Queue Jobs

**Choix** : BullMQ (Redis) vs autres (RabbitMQ, SQS).

**Recommandation** : BullMQ (simple, Redis déjà utilisé).

**Décision** : ✅ BullMQ validé.

---

### 4.6 Génération PDF

**Choix** : Puppeteer vs PDFKit vs autres.

**Recommandation** : Puppeteer (bulletins complexes) + PDFKit (documents simples).

**Décision** : ✅ Puppeteer validé pour bulletins.

---

### 4.7 Monitoring

**Choix** : Sentry (errors) + Logtail (logs) vs autres.

**Recommandation** : Sentry + Logtail (simplicité, intégration facile).

**Décision** : ✅ Sentry + Logtail validés.

---

## 5. Points de Décision Métier

### 5.1 Périmètre Géographique

**Question** : Quels pays/régions cibler initialement ?

**Recommandation MVP** : France uniquement (système français).

**Décision** : ⚠️ À valider avec business.

---

### 5.2 Modèle Tarifaire

**Question** : Gratuit, freemium, abonnement ?

**Recommandation** : Freemium (1 école gratuite, premium pour plus).

**Décision** : ⚠️ À valider avec business.

---

### 5.3 Modules Optionnels

**Question** : Quels modules optionnels prioriser (bibliothèque, transport, cantine) ?

**Recommandation** : Selon demande marché (feedback beta testeurs).

**Décision** : ⚠️ À valider avec business.

---

### 5.4 Support Langues

**Question** : Multi-langues dès MVP ou V2 ?

**Recommandation MVP** : Français uniquement, architecture i18n prête.

**Décision** : ✅ Français MVP, i18n V2.

---

### 5.5 Mobile App

**Question** : App mobile native ou PWA suffit ?

**Recommandation MVP** : PWA (responsive web).

**Recommandation V2** : Évaluer app native si demande.

**Décision** : ✅ PWA MVP, app native V2 optionnel.

---

## 6. Hypothèses Critiques

### 6.1 Système Scolaire

**Hypothèse** : Modèle français (trimestres, notes 0-20, niveaux CP→Terminale).

**Validation** : ⚠️ À confirmer avec écoles pilotes.

**Impact si faux** : Paramétrage nécessaire (prévu dans architecture).

---

### 6.2 Utilisateurs Cibles

**Hypothèse** : Écoles privées/publiques françaises, 50-500 élèves.

**Validation** : ⚠️ À valider avec recherche marché.

**Impact si faux** : Adaptation nécessaire (ex: très grandes écoles).

---

### 6.3 Conformité Légale

**Hypothèse** : RGPD suffit pour conformité (pas d'autres réglementations spécifiques).

**Validation** : ⚠️ Validation juridique recommandée.

**Impact si faux** : Adaptations nécessaires.

---

## 7. Points Flous à Clarifier

### 7.1 Gestion Fratries

**Question** : Réduction frais pour fratries ? Gestion automatique ?

**Recommandation** : Support fratries (lien Student ↔ Student), réduction configurable.

**Décision** : ⚠️ À clarifier avec métier.

---

### 7.2 Redoublement

**Question** : Workflow redoublement (passage classe inférieure) ?

**Recommandation** : Changement classe manuel, historique conservé.

**Décision** : ✅ Workflow manuel validé.

---

### 7.3 Conseils de Classe

**Question** : Module dédié conseils de classe ou simple export notes/comportement ?

**Recommandation MVP** : Export notes/comportement suffit.

**Recommandation V2** : Module dédié si demande.

**Décision** : ✅ Export MVP, module V2 optionnel.

---

### 7.4 Bourses & Aides

**Question** : Gestion bourses/aides sociales intégrée ?

**Recommandation** : Table Scholarship créée, workflow à définir.

**Décision** : ⚠️ À clarifier avec métier.

---

### 7.5 Absences Profs

**Question** : Gestion absences profs + impact EDT automatique ?

**Recommandation MVP** : Gestion absences basique, remplacements manuels.

**Recommandation V2** : Impact EDT automatique.

**Décision** : ✅ Basique MVP, automatique V2.

---

## 8. Plan de Validation

### 8.1 Validation Technique

- [ ] Review architecture avec équipe technique
- [ ] POC isolation multi-tenant
- [ ] Tests performance (charges simulées)
- [ ] Review sécurité (penetration testing optionnel)

### 8.2 Validation Métier

- [ ] Identification écoles pilotes
- [ ] Interviews utilisateurs (admins, profs, parents)
- [ ] Validation workflows métier
- [ ] Validation conformité RGPD (expert juridique)

### 8.3 Validation Produit

- [ ] User stories validées
- [ ] Mockups UI validés
- [ ] Roadmap priorisée
- [ ] Modèle tarifaire validé

---

## 9. Checklist Pré-Lancement MVP

### Technique
- [ ] Tests passent (>80% coverage)
- [ ] Performance validée (<2s pages)
- [ ] Sécurité validée (isolation tenant, RBAC)
- [ ] Monitoring opérationnel (Sentry, logs)
- [ ] Backup/restore testé
- [ ] Documentation technique complète

### Métier
- [ ] Conformité RGPD validée
- [ ] Documentation utilisateur complète
- [ ] Onboarding guidé fonctionnel
- [ ] Support opérationnel

### Produit
- [ ] Beta testeurs identifiés
- [ ] Feedback intégré
- [ ] Roadmap V2 définie
- [ ] Modèle tarifaire finalisé

---

## 10. Décisions Critiques à Prendre

### Avant Sprint 0
1. ✅ Stack technique validée
2. ⚠️ Périmètre géographique (France uniquement ?)
3. ⚠️ Modèle tarifaire (freemium ?)
4. ⚠️ Écoles pilotes identifiées

### Avant Sprint 1
1. ⚠️ Validation workflows métier (interviews utilisateurs)
2. ⚠️ Conformité RGPD (expert juridique)

### Avant Sprint 6 (Présences)
1. ⚠️ Format pointage (par cours vs par journée)
2. ⚠️ Seuils alertes absences

### Avant Sprint 7 (Notes)
1. ⚠️ Barème notes (0-20 vs autres)
2. ⚠️ Calcul moyennes (pondération)
3. ⚠️ Mentions (seuils)

### Avant Sprint 11 (Finances V2)
1. ⚠️ Intégration paiement (Stripe vs autres)
2. ⚠️ Types frais (inscription, mensualités, activités)
3. ⚠️ Gestion bourses/aides

---

## Conclusion

**Risques identifiés** : 15+ risques (techniques, métier, organisationnels)

**Mitigations proposées** : Pour chaque risque

**Décisions à prendre** : 20+ points nécessitant validation

**Recommandation** :
1. Valider décisions critiques avant Sprint 0
2. Itérer avec écoles pilotes dès Sprint 3
3. Review régulière risques (chaque sprint)
4. Adaptation continue selon feedback

**Prochaines actions** :
1. Organiser session validation architecture
2. Identifier écoles pilotes
3. Valider conformité RGPD
4. Finaliser scope MVP

---

## Références

- Architecture globale : `01-architecture-globale.md`
- Modules métiers : `02-modules-metiers.md`
- Plan implémentation : `07-plan-implementation.md`
