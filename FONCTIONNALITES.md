# QuizGame — État des fonctionnalités

Document de référence sur l’état d’implémentation du projet **QuizGame** (React Native CLI).  
Dernière mise à jour : **5 juin 2026**.

**Sources analysées** : code source (`src/`), tests Jest (`__tests__/`), `roadmap.md`, configuration native (Android/iOS).

**État des tests automatisés** : 16 suites, **53 tests passent** (`npm test`).

---

## Table des matières

1. [Résumé exécutif](#1-résumé-exécutif)
2. [Liste des fonctionnalités](#2-liste-des-fonctionnalités)
3. [Fonctionnalités correctement implémentées](#3-fonctionnalités-correctement-implémentées)
4. [Fonctionnalités incomplètes ou non validées](#4-fonctionnalités-incomplètes-ou-non-validées)
5. [Stratégies de complétion](#5-stratégies-de-complétion)
6. [Matrice de suivi par sprint](#6-matrice-de-suivi-par-sprint)

---

## 1. Résumé exécutif

QuizGame est une application de quiz compétitif par équipes avec tournoi à élimination directe. Deux modes de connexion sont prévus : **Online** (Firebase RTDB + code à 6 caractères) et **Offline LAN** (WebSocket + découverte Zeroconf).

| Zone | État global |
|------|-------------|
| Fondations (navigation, SQLite, MMKV, types) | ✅ Complet |
| Logique métier pure (équipes, bracket, scoring) | ✅ Complet et testé |
| Persistance SQLite (questionnaires, parties) | ✅ Complet et testé |
| Moteur de jeu hôte (`HostGameEngine`) | ✅ Complet côté logique ; UI hôte partielle |
| Mode LAN (lobby + tournoi) | 🟡 Code présent ; validation multi-appareils manquante |
| Mode Online (Firebase) | 🟡 Code + tests mock ; config iOS et tests réels manquants |
| PDF + génération IA (Gemini) | 🟡 Génération OK ; extraction PDF native absente |
| Catalogue public | 🟡 Code présent ; flux bout-en-bout non validé |
| Historique et classement | ✅ Complet côté logique + écran |
| Robustesse et release (S11) | ❌ Non démarré |

**Légende** : ✅ Complet · 🟡 Partiel / non validé · ❌ Absent

---

## 2. Liste des fonctionnalités

### 2.1 Navigation et accueil

| Fonctionnalité | Description |
|----------------|-------------|
| Écran d’accueil | Choix Online, LAN, PDF/IA, catalogue, historique, paramètres |
| Navigation stack | `RootNavigator` avec tous les écrans principaux |
| Bootstrap app | Init SQLite + MMKV au démarrage (`App.tsx`) |

### 2.2 Logique métier (domaine pur)

| Fonctionnalité | Description |
|----------------|-------------|
| Formation d’équipes | Round-robin, bonus consolation (`genererEquipes`) |
| Bracket élimination directe | Génération et avancement (`genererBracket`, `avancerBracket`) |
| Scoring par majorité | Score manche, vainqueur duel, bonus (`scoreMancheMajorite`, `calculerVainqueurDuel`) |
| Code partie | Génération et validation code 6 caractères (`genererCode6`, `isValidCode6`) |

### 2.3 Persistance locale

| Fonctionnalité | Description |
|----------------|-------------|
| SQLite v001 | 6 tables : parties, questionnaires, questions, historique, classement, cache public |
| Repositories | CRUD questionnaires, parties, historique, classement, cache public |
| Verrouillage questionnaires | `getQuestionsForPlayer()` sans réponse ; hôte seul via `HOST_TOKEN` |
| MMKV | Stockage clé-valeur léger (ping init) |

### 2.4 Moteur de jeu hôte

| Fonctionnalité | Description |
|----------------|-------------|
| FSM lobby → fin | États : idle, lobby, tournament, duel, finished |
| Timer questions | Expiration automatique, non-réponse = incorrect |
| Duels 10 questions | Reveal, scoring majorité, qualification bracket |
| Multi-rounds (S6) | Assignation questionnaire par duel/round, erreur si manquant en offline |
| Fin de partie | Déverrouillage questionnaires, historique, classement joueurs |
| Publication auto online | Questionnaires `is_public` publiés en fin de partie Firebase |

### 2.5 Synchronisation réseau

| Fonctionnalité | Description |
|----------------|-------------|
| Interface `SessionSync` | Contrat commun LAN / Firebase / mémoire |
| `InMemorySessionSync` | Transport local pour tests et debug |
| `LanSessionSync` | WebSocket TCP port 41234 + Zeroconf NSD |
| `FirebaseSessionSync` | RTDB + auth anonyme, anti-triche (pas de `reponse_correcte` côté client) |
| Messages sync | JOIN, LOCK_SALON, QUESTION, ANSWER, REVEAL, DUEL_END, GAME_END, etc. |

### 2.6 Interface utilisateur — Hôte

| Fonctionnalité | Description |
|----------------|-------------|
| Salon hôte (dashboard) | Liste joueurs, verrouillage salon |
| Bracket | Arbre tournoi, équipes, sélection questionnaires |
| Duel (vue hôte) | Timer, question, reveal, scores manches |
| Fin de partie | Classement, lien historique |
| Partie locale debug | Mode mémoire avec joueurs fictifs |

### 2.7 Interface utilisateur — Joueur

| Fonctionnalité | Description |
|----------------|-------------|
| Scan LAN | Zeroconf + fallback saisie IP |
| Lobby LAN / Online | Liste joueurs en attente |
| Duel joueur | QCM, soumission réponse, attente reveal |
| Fin tournoi (client) | Classement final |

### 2.8 Questionnaires et contenu

| Fonctionnalité | Description |
|----------------|-------------|
| Seed questionnaires | Génération locale pour tests/démo |
| PDF → IA (Gemini) | Extraction texte + génération QCM validée Zod |
| Clé API sécurisée | Keychain/Keystore via `ApiKeyStore` |
| Catalogue public | Publication Firebase, liste, recherche, téléchargement cache local |
| Sélection questionnaires | Couverture par round, assignation depuis cache public |

### 2.9 Historique et classement

| Fonctionnalité | Description |
|----------------|-------------|
| Historique parties | Liste, détail, révision QCM déverrouillés |
| Classement joueurs | Points, victoires, parties jouées (par pseudo) |

### 2.10 DevOps et release

| Fonctionnalité | Description |
|----------------|-------------|
| CI Android APK | GitHub Actions : build debug + release |
| Règles Firebase RTDB | `database.rules.json` (sessions + catalogue) |
| Permissions Android LAN | INTERNET, WIFI, multicast |
| Permissions iOS LAN | NSLocalNetworkUsageDescription, NSBonjourServices |

---

## 3. Fonctionnalités correctement implémentées

Les éléments ci-dessous sont **implémentés dans le code** et **couverts par des tests Jest** (ou validés structurellement pour l’UI de base).

### ✅ S0 — Fondations

- Arborescence `src/` complète, alias `@/` configuré
- Navigation React Navigation (Home → tous les écrans)
- SQLite migration v001 (6 tables)
- MMKV initialisé
- Types TypeScript partagés

### ✅ S1 — Domaine métier

- `genererEquipes`, `genererBracket`, `avancerBracket`
- `scoreMancheMajorite`, `calculerVainqueurDuel`
- `genererCode6`, `isValidCode6`
- Tests : `teams`, `bracket`, `scoring`, `code`

### ✅ S2 — Persistance et verrouillage

- `QuestionnaireRepository` : CRUD, filtrage réponses joueur/hôte
- `PartieRepository` : création, statuts, liaison questionnaires
- `HostQuestionService` : correction, reveal, enforcement verrouillage
- Tests : `QuestionnaireRepository`, `PartieRepository`, `HostQuestionService`

### ✅ S3 — Moteur hôte (logique)

- `HostGameEngine` : FSM complète lobby → fin
- Timer, collecte réponses, reveal, avancement bracket
- Écrans : `HostDashboardScreen`, `BracketScreen`, `DuelScreen`, `GameEndScreen`
- Tests : 9 scénarios incluant tournoi 4 équipes complet
- Mode debug local (`HostGame` + `InMemorySessionSync`)

### ✅ S6 — Multi-rounds (logique)

- Détection questionnaire manquant (`QuestionnaireNeededError`)
- Assignation `duel_id` / `round_index` en SQLite
- `QuestionnaireSelectScreen` intégré dans `BracketScreen`
- Tests S6 dans `HostGameEngine.test.ts`

### ✅ S8 — Génération IA (partie serveur)

- `QuestionGenerator` : appel Gemini, validation Zod, insertion SQLite
- `ApiKeyStore` + écran `SettingsScreen`
- `PdfUploadScreen` (flux UI complet)
- Tests : `QuestionGenerator`, `PdfExtractor` (mock)

### ✅ S9 — Catalogue public (logique)

- `PublicCatalogService` : publish, fetch, download, cache SQLite
- `PublicListScreen` : liste, recherche, pull-to-refresh
- Auto-publication fin de partie online (`HostGameContext`)
- Tests : `PublicCatalogService`

### ✅ S10 — Historique et classement

- `HistoriqueRepository`, `ClassementRepository`
- Enregistrement automatique en fin de partie (`HostGameEngine`)
- `HistoryScreen` : liste, détail, révision questionnaires terminés
- Lien depuis `GameEndScreen`
- Test intégré dans `HostGameEngine.test.ts`

### ✅ Infrastructure sync (unitaire)

- `LanSessionSync` : tests lobby, messages, réponses
- `FirebaseSessionSync` : tests avec mock RTDB en mémoire
- `messages.test.ts` : sérialisation messages WS

### ✅ CI

- Workflow GitHub Actions build APK Android (debug + release)

---

## 4. Fonctionnalités incomplètes ou non validées

### 🟡 S3 — Moteur hôte (UI hôte)

| Problème | Détail |
|----------|--------|
| Bouton debug toujours visible | `HostDashboardScreen` affiche « Ajouter un joueur (debug) » même en mode LAN/Online, sans vérifier le flag `debug` |
| Code partie peu visible | En mode Online, le code à 6 caractères n’est pas mis en avant pour le partage aux joueurs |
| Sélection questionnaires au verrouillage | Seul le round 0 est seedé automatiquement ; comportement voulu mais pas d’UI pré-verrouillage pour choisir des questionnaires réels (PDF/public) |

### 🟡 S4 — LAN lobby

| Problème | Détail |
|----------|--------|
| Validation multi-appareils absente | Code `LanSessionSync`, `ZeroconfService`, `ScanLanScreen` présent mais **aucun test sur appareils physiques** |
| Critères roadmap non cochés | Découverte 1-clic, déconnexion client, fallback IP non validés en conditions réelles |

### 🟡 S5 — LAN tournoi complet

| Problème | Détail |
|----------|--------|
| Pas de test E2E multi-appareils | Flux joueur (`LanClientScreen`, `PlayerDuelScreen`) codé mais non validé avec 4+ téléphones |
| Reconnexion joueur | Non implémentée (prévu S11) |

### 🟡 S6 — Questionnaires multi-rounds (UI / offline)

| Problème | Détail |
|----------|--------|
| `prepareAllMissing` utilise des seeds | Le bouton « Préparer les questionnaires publics manquants » appelle `seedQuestionnaires`, pas le cache public téléchargé |
| Pas de blocage pré-verrouillage offline | L’hôte peut verrouiller sans vérifier la couverture totale des rounds en mode LAN offline |

### 🟡 S7 — Firebase Online

| Problème | Détail |
|----------|--------|
| Config iOS absente | Pas de `GoogleService-Info.plist` → mode online **non fonctionnel sur iOS** |
| Tests uniquement mockés | `FirebaseSessionSync.test.ts` utilise un store RTDB en mémoire, pas Firebase réel |
| Pas de validation 4G/WiFi mixte | Critères roadmap S7 non cochés |
| Déploiement règles RTDB | Fichier `database.rules.json` présent mais déploiement prod non documenté |

### 🟡 S8 — PDF et extraction native

| Problème | Détail |
|----------|--------|
| **Extracteur PDF non branché** | `setPdfTextExtractor()` n’est jamais appelé dans `App.tsx` → erreur `PdfExtractorIndisponibleError` à l’usage |
| Dépendance native manquante | Aucune librairie d’extraction PDF installée (ex. `react-native-pdf-lib`, module custom) |
| Détection hors-ligne | `HorsLigneError` existe dans `QuestionGenerator` mais pas de `@react-native-community/netinfo` |

### 🟡 S9 — Catalogue public (E2E)

| Problème | Détail |
|----------|--------|
| Flux complet non validé | Publier sur appareil A → télécharger sur appareil B → utiliser en LAN offline : non testé |
| Intégration sélection hôte | Assignation depuis cache public existe, mais pas de workflow guidé avant verrouillage |

### ❌ S11 — Robustesse et release

| Problème | Détail |
|----------|--------|
| Reconnexion joueur | Absente |
| NetInfo / messages réseau | `@react-native-community/netinfo` non installé |
| Wake Lock Android / alerte iOS | Absents |
| Icône / splash custom | Icônes React Native par défaut |
| Checklist déploiement (roadmap 8.4) | Non validée (keystore signé, Firebase prod, App Store, etc.) |
| Tests de charge 16 joueurs | Non réalisés |

---

## 5. Stratégies de complétion

Pour chaque zone incomplète, voici une stratégie concrète ordonnée par priorité.

### 5.1 Extraction PDF native (S8 — bloquant)

**Objectif** : rendre le flux PDF → IA utilisable sur appareil.

1. Choisir et installer une librairie d’extraction texte PDF compatible React Native 0.85 (ex. wrapper natif ou module Expo bare-compatible).
2. Au bootstrap de `App.tsx`, appeler :
   ```typescript
   import { setPdfTextExtractor } from '@/services/PdfExtractor';
   setPdfTextExtractor(async (uri) => { /* extraction native */ });
   ```
3. Tester avec un PDF texte natif (non scanné) sur Android et iOS.
4. Conserver le fallback `PdfNonSupporteError` pour les PDF scannés.

**Effort estimé** : 2–3 jours.

---

### 5.2 UI hôte — polish S3/S6

**Objectif** : expérience hôte cohérente selon le mode de transport.

1. Dans `HostDashboardScreen`, n’afficher « Ajouter un joueur (debug) » que si `debug === true` (via `useHostGame()`).
2. Afficher le **code partie** en grand pour le mode Online (`state.sessionId`) avec bouton « Copier ».
3. Avant verrouillage en mode LAN :
   - Afficher `QuestionnaireSelectScreen` ou un résumé de couverture.
   - Désactiver « Boucler le salon » si `coverage` indique des questionnaires manquants en offline.
4. Remplacer `prepareAllMissing` : utiliser les questionnaires du `PublicCatalogRepository` en priorité, seed en dernier recours (debug uniquement).

**Effort estimé** : 1–2 jours.

---

### 5.3 Validation LAN multi-appareils (S4 + S5)

**Objectif** : confirmer le gameplay LAN sur WiFi réel.

1. **Protocole de test** (2 téléphones minimum, idéalement 4+) :
   - Téléphone A : Créer salon LAN → verrouiller → jouer tournoi.
   - Téléphones B/C/D : Scanner → rejoindre → répondre aux QCM.
2. Vérifier : découverte Zeroconf, fallback IP, sync reveal, scores bonus, écran fin.
3. Corriger les bugs réseau identifiés (reconnexion WS, messages perdus, ordre reveal).
4. Documenter les prérequis réseau (même sous-réseau, pas d’isolation AP).

**Effort estimé** : 3–5 jours (incluant corrections).

---

### 5.4 Firebase Online production (S7)

**Objectif** : mode online fonctionnel Android + iOS.

1. Créer projet Firebase prod, ajouter apps Android **et iOS**.
2. Placer `GoogleService-Info.plist` dans `ios/quizgame/`.
3. Déployer `database.rules.json` : `firebase deploy --only database`.
4. Tests manuels :
   - Hôte crée partie → code affiché.
   - Client rejoint par code (WiFi + 4G).
   - Tournoi 4 équipes complet.
   - Vérifier qu’aucun nœud client ne contient `reponse_correcte`.
5. Ajouter tests d’intégration optionnels avec Firebase Emulator Suite.

**Effort estimé** : 4–6 jours.

---

### 5.5 Catalogue public bout-en-bout (S9)

**Objectif** : boucler le cycle publier → télécharger → jouer offline.

1. Partie online terminée avec questionnaire `isPublic=true` → vérifier présence dans RTDB `/questionnaires_publics`.
2. Second appareil : `PublicListScreen` → télécharger → vérifier cache SQLite.
3. Partie LAN offline : assigner questionnaire téléchargé via `QuestionnaireSelectScreen` pour chaque round.
4. Ajouter indicateur « X questionnaires publics en cache » sur l’écran d’accueil ou le dashboard hôte.

**Effort estimé** : 2–3 jours.

---

### 5.6 Robustesse et release (S11)

**Objectif** : application stable en conditions réelles.

| Tâche | Approche |
|-------|----------|
| Reconnexion joueur | Re-JOIN avec même pseudo → réassocier `playerId` à l’équipe si duel en cours ; persister mapping côté hôte |
| NetInfo | Installer `@react-native-community/netinfo` ; bannière « Connexion perdue » sur client et hôte |
| Wake Lock Android | `react-native-keep-awake` ou flag natif pendant partie hôte |
| Alerte iOS arrière-plan | Modal « Gardez l’app ouverte » au démarrage partie hôte |
| Icône / splash | Remplacer assets par défaut dans `android/app/src/main/res` et `ios/quizgame/Images.xcassets` |
| Build release signé | Keystore Android, certificat iOS, incrémenter `versionCode` |
| Stress test | 8–16 joueurs LAN, mesurer latence reveal et stabilité WS |

**Effort estimé** : 5–7 jours.

---

### 5.7 Ordre de priorité recommandé

```
1. Extraction PDF (S8)          — débloque la création de contenu
2. UI hôte polish (S3/S6)       — quick wins, faible risque
3. Tests LAN multi-appareils    — valide le cœur produit offline
4. Firebase iOS + tests réels   — débloque le mode online complet
5. Catalogue E2E (S9)           — valeur ajoutée contenu partagé
6. Robustesse / release (S11)   — avant mise en store
```

---

## 6. Matrice de suivi par sprint

| Sprint | Nom | Code | Tests auto | Tests manuels | Statut |
|--------|-----|------|------------|---------------|--------|
| S0 | Fondations | ✅ | ✅ | ✅ | **Complet** |
| S1 | Domaine métier | ✅ | ✅ | — | **Complet** |
| S2 | Persistance | ✅ | ✅ | 🟡 | **Complet** |
| S3 | Moteur hôte FSM | ✅ | ✅ | 🟡 UI | **Quasi complet** |
| S4 | LAN lobby | ✅ | ✅ mock | ❌ | **À valider** |
| S5 | LAN tournoi | ✅ | ✅ mock | ❌ | **À valider** |
| S6 | Multi-rounds | ✅ | ✅ | 🟡 | **Quasi complet** |
| S7 | Firebase online | 🟡 iOS | ✅ mock | ❌ | **Partiel** |
| S8 | PDF + IA | 🟡 extract | ✅ | ❌ | **Partiel** |
| S9 | Catalogue public | ✅ | ✅ | ❌ | **À valider E2E** |
| S10 | Historique | ✅ | ✅ | 🟡 | **Complet** |
| S11 | Release | ❌ | — | ❌ | **Non démarré** |

---

## Annexe — Fichiers clés par domaine

| Domaine | Fichiers principaux |
|---------|---------------------|
| Domaine | `src/domain/*.ts` |
| Persistance | `src/data/sqlite/*.ts` |
| Moteur | `src/services/HostGameEngine.ts` |
| Sync LAN | `src/sync/LanSessionSync.ts`, `src/sync/lan/*` |
| Sync Online | `src/sync/FirebaseSessionSync.ts` |
| UI hôte | `src/ui/host/*`, `src/ui/screens/host/*`, `src/ui/screens/game/*` |
| UI client LAN | `src/ui/lan/*` |
| UI client Online | `src/ui/client/*`, `src/ui/online/*` |
| IA / PDF | `src/services/PdfExtractor.ts`, `QuestionGenerator.ts` |
| Catalogue | `src/services/PublicCatalogService.ts` |
| Tests | `__tests__/**/*.test.ts` |

Pour le détail de conception et les critères d’acceptation originaux, voir [`roadmap.md`](roadmap.md).
