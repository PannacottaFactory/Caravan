# Caravan — Analyse pour le portage web

Complément de [mecaniques.md](mecaniques.md) (règles du jeu). Ce document couvre : l'inventaire du projet Unity, les écrans, le plan de portage et les questions ouvertes.

---

## 1. Inventaire du projet

### 1.1 Taille et organisation

| Élément | Taille / nombre | Remarque |
|---|---|---|
| `Assets/` total | ~189 Mo | dont **117 Mo Firebase** + 33 Mo `Plugins/` : du code tiers, pas du contenu du jeu |
| Code du jeu | **24 scripts dans `Assets/Scripts/`, ~5 800 lignes** + 4 petits scripts à la racine d'`Assets/` | 439 fichiers `.cs` au total, le reste vient des plugins |
| Scènes | 4 : `Title`, `Faction`, `PrepareCaravan`, `PlayScene` (1,5 Mo, ~49 000 lignes YAML) | toute l'UI est construite dans les scènes (uGUI) |
| Prefabs | 11 (lignes achat/vente, boutons ±, audio, Google Services…) | |
| Sprites | ~85 PNG utiles dans `Assets/Resources/` | ressources, objets du marchand, pouvoirs de la sorcière, décor en parallaxe, cadres, icônes réseaux sociaux |
| Audio | 6 WAV (~26 Mo), dont la **musique de Tyler Cline (23,8 Mo)** | à convertir en OGG/MP3 pour le web |
| Polices | MATURASC (Matura MT Script), Manila Sans (Reg/Bld), Pajarakan Studs, Typographer Subway, fixedsys | **licences à vérifier** pour un usage web |
| Animations | 87 `.anim` / 61 `.controller` | glissements de panneaux, clignotements, popups, étoiles : à refaire en CSS |
| ScriptableObjects / fichiers de données | **aucun** | données dans les scènes et le code (voir `mecaniques.md` §12) |
| Tests | aucun | `com.unity.test-framework` installé mais inutilisé |
| Dossier `captures/` | **absent** | j'ai utilisé les 9 captures jointes à la conversation |
| Git | le projet **n'est pas un dépôt git** | à initialiser avant de commencer |

Architecture du code : singletons `MonoBehaviour` (`GlobalVariables`, `FactionManager`, `Prepare`, `GoogleAds`, `AudioManager`) fortement couplés. **La logique et l'affichage sont mélangés** dans chaque panneau : les règles modifient directement des `Text`, des `Animator` et des couleurs. Les boutons sont câblés dans l'éditeur (OnClick), souvent via des surcharges du prefab `BuyConfirm`. `FactionManager` et `Prepare` survivent au changement de scène uniquement grâce à leur référence statique, alors que leur GameObject est détruit.

### 1.2 Packages et plugins

| Plugin / package | Usage dans le jeu | Utilisé par le code ? |
|---|---|---|
| **Google Mobile Ads (AdMob)** | interstitiel 1 partie sur 2 au retour menu ; vidéo récompensée « continuer après défaite » | oui (`GoogleAds.cs`) |
| **Unity IAP** (`com.unity.purchasing` 5.0.1 + `Plugins/UnityPurchasing`, catalogue `noads`) | achat « No Ads + 2 Premium Factions » | oui (IAPButton dans `Title` → `GoogleIAP.NoAds`) |
| **Google Play Games Services** (`GooglePlayGames/`, `GPGSIds.cs`) | connexion, 44 classements, ~17 succès | oui |
| **Firebase** (App + Analytics) | initialisation seulement, aucun événement envoyé | à peine |
| Unity Analytics (`com.unity.analytics`) | — | non |
| **Easy Save 3** | sauvegarde chiffrée des meilleurs scores et des drapeaux | oui |
| Easy Save 2, Parse, UDP, UnityChannel | restes d'anciennes versions | **non** |
| **NativeShare** | partage d'une capture du score | oui (`ShareSocialMedia.cs`) |
| Play Services Resolver (EDM4U) | dépendances Android | outil de build |
| TextMesh Pro, uGUI, Timeline | UI | oui |
| Unity Recorder (`.csproj` + `Recordings/`) | captures vidéo (trailer) | éditeur seulement |
| Liens externes | Instagram, Twitter, Discord, Reddit, fiche Play Store | `Application.OpenURL` |

---

## 2. Écrans et éléments d'interface

Le format est **portrait mobile** (≈ 9:16).

### 2.1 Écran titre (`Title`)

| Élément | Rôle |
|---|---|
| Logo « Caravan — Buy, sell, profit » + décor animé (dunes, soleil/lune, caravane, ciel qui tourne) | ambiance |
| « - Play - » | aller au choix de faction |
| « How to play » | panneau tutoriel (règles en 5 lignes + « attention à la nourriture ») |
| Exit | quitter l'application |
| Haut-parleur | couper ou rétablir le son |
| Instagram / Twitter / Discord (+ Reddit) | liens externes |
| Icône personnage | crédits (Victor Roudaut, musique de Tyler Cline) |
| NO ADS | boutique : achat « No Ads + 2 Factions » |
| Podium | classements Google Play |
| Étoile | succès Google Play (ou notation, à confirmer) |
| Popups uniques | « Marchand débloqué », « Sorcière débloquée », « Mode Traveler débloqué », « Notez le jeu » (Rate now / No thanks), texte « alpha version », nouveautés |

### 2.2 Choix de mode et de faction (`Faction`)

| Élément | Rôle |
|---|---|
| Titre « Choose your Mode and your Faction » | |
| Bandeau du mode (« 15 days - No Disasters » / « 20 days - Manage your Caravan - Disasters ») + étiquette inclinée « Classical / Traveler Mode » | bascule de mode ; message d'avertissement si Traveler est verrouillé |
| Curseur (slider) + flèches ◀ ▶ | parcourir les 22 factions (en boucle) |
| Carte de faction : nom, histoire, « Effect : » (ou « ? » si verrouillée) | |
| Condition de déblocage (rouge) ou « Faction unlocked » (vert) | |
| Bouton Play (vert) / Locked (rouge) | lancer la partie |
| « High Score : N » | meilleur score de la faction dans ce mode |
| Retour menu | |

### 2.3 Préparation de la caravane (`PrepareCaravan`, Traveler uniquement)

| Élément | Rôle |
|---|---|
| Panneau du haut : or, capacité, marchands, chameaux, jours initiaux | récapitulatif |
| Compteur de points (3) | |
| Liste de 10 améliorations (cases à basculer, vertes si choisies) | dépenser les points |
| « Let's go » | lancer la partie |
| Retour | |

### 2.4 Écran de jeu (`PlayScene`)

| Zone / panneau | Rôle |
|---|---|
| **Barre du haut** : « Day N/15 » (ou « Last day ! »), bouton menu | |
| **HUD** : GOLD (or + revenu journalier), WEIGHT (x/max + jauge), FOOD (stock + consommation), CREW (marchands, chameaux) | état de la caravane ; l'or défile en compteur animé |
| **Onglets du bas** : Buy / Sell / Crew / Save gold | ouvrent les panneaux qui glissent depuis le bas |
| **Panneau Buy** | tableau : icône (info-bulle au clic), quantité possédée, prix, poids, − quantité +, coût, poids ; totaux coût/poids (rouges si dépassement) ; « Buy now » |
| **Panneau Sell** | même tableau avec prix de vente et gains ; particules de pièces à la vente ; « Sell now » |
| **Panneau Crew** | « Recruit » (25 or, +20/jour) OU « Add » (30 or, +30 capacité) ; rappel de la consommation |
| **Panneau Save gold** | « Earn X % of your current gold (+N) » ; bouton Save ; « Save once » (Sanctifan) |
| **Bandeau « Day N »** | animation de transition de jour |
| **Messages d'avertissement** | Not enough gold / pods, No resource to buy / sell |
| **Avertissement « le marchand arrive »** | la veille |
| **Panneau Marchand mystérieux** | portrait, réplique, liste de 9 objets + prix, curseur de sélection, Leave / Buy ; fumée et son |
| **Onglet latéral (flèche à gauche)** | rappel de l'objet acheté (image, nom, effet) |
| **Bouton « appeler le marchand »** (Moonin) | |
| **Panneau Sorcière** | portrait, réplique, 8 pouvoirs, cadre bonus (vert) + malus (rouge), « Choose » ; son |
| **Panneau Catastrophe** (Traveler) | description, effet, « Continue » |
| **Panneau Défaite** | texte, bouton vidéo récompensée « continuer », bouton menu |
| **Panneau Victoire** | faction, difficulté, détail des points par ligne, total, phrase d'accroche, « New record! », étoile, particules, partage, menu |
| **Confirmation de retour au menu** | Oui / Non |

Les captures marketing (bandeaux « Buy and sell at better price », « Trade with the mysterious merchant », « Challenge your friends ») sont des visuels de la fiche Play Store, pas des écrans du jeu.

---

## 3. Plan de portage (TypeScript + HTML/CSS + Vite)

### 3.1 Architecture cible

```
caravan-web/
├─ src/
│  ├─ engine/              ← logique pure : aucun import DOM, 100 % testable
│  │  ├─ data/             resources.ts, factions.ts, merchantItems.ts,
│  │  │                    witchPowers.ts, disasters.ts, improvements.ts, scoring.ts
│  │  ├─ state.ts          type GameState (immuable) + createGame(config)
│  │  ├─ modifiers.ts      calcul des prix, poids, capacité et consommation effectifs
│  │  ├─ actions.ts        buy, sell, recruit, addCamel, save, saveOnce,
│  │  │                    buyMerchantItem, leaveMerchant, chooseWitchPower,
│  │  │                    acknowledgeDisaster, callMerchant, retryDay
│  │  ├─ turn.ts           consommation → défaite/jour suivant → revenu → événements
│  │  ├─ scoring.ts        score final
│  │  ├─ rng.ts            générateur aléatoire avec graine (tests reproductibles)
│  │  └─ meta.ts           progression : meilleurs scores → déblocages
│  ├─ storage/             profil local versionné (localStorage), migrations
│  ├─ ui/
│  │  ├─ screens/          title, factionSelect, prepare, game, victory, defeat
│  │  ├─ components/       hud, tradeTable, crewPanel, savePanel, merchant, witch,
│  │  │                    disaster, toast, modal
│  │  ├─ router.ts         machine d'états des écrans
│  │  └─ audio.ts
│  ├─ styles/              variables CSS (palette sable/brun), mise en page, animations
│  └─ main.ts
├─ public/assets/          sprites (PNG/WebP), sons (OGG + MP3), polices (WOFF2)
└─ tests/                  Vitest : unitaires + scénarios de référence
```

Principes :

- **Le moteur est une fonction pure** : `(state, action, rng) → { state, events }`. L'UI envoie des actions et affiche l'état. Les `events` (nouveau jour, marchand arrive, défaite…) servent seulement aux animations et aux sons.
- **Ne pas reproduire les doubles tableaux** (achat/vente) ni la variable `weight` tenue à la main. Le poids sera **calculé** à partir de l'inventaire et des poids effectifs (modificateurs). Cela corrige d'office B1-B4 et B11 (si vous validez, question 1).
- Les effets de faction, marchand, sorcière, catastrophe et amélioration deviennent des **modificateurs déclaratifs** dans les données (`{ target: 'buyPrice', resource: 'silk', op: 'add', value: 200 }`) plutôt que des `if (name == "...")` dispersés. Ajouter ou équilibrer du contenu revient alors à modifier des données.
- Pour l'UI, je recommande du **TypeScript sans framework** (rendu par composants à partir de l'état) : le jeu a peu d'écrans et l'état est centralisé. Preact (~4 Ko) reste une option si vous préférez du JSX (question 10).

### 3.2 Étapes

| # | Étape | Livrable | Critère de fin |
|---|---|---|---|
| 0 | **Décisions et socle** | réponses aux questions ; `git init` ; projet Vite + TS strict + Vitest + ESLint/Prettier | `npm run dev` et `npm test` fonctionnent |
| 1 | **Données** | `engine/data/*.ts` transcrits depuis `mecaniques.md` | relecture de toutes les valeurs |
| 2 | **Moteur de base** | état, achat, vente, recrutement, chameau, épargne, consommation, revenu, défaite, victoire, score | tests unitaires de chaque formule ; **scénarios de référence** rejoués aussi dans le jeu Unity (ex. la partie de la capture « 4624 ») |
| 3 | **Factions et événements** | 22 factions, marchand, sorcière, catastrophes, mode Traveler et améliorations, RNG avec graine | un test par faction, objet, pouvoir et catastrophe |
| 4 | **Méta et sauvegarde** | meilleurs scores, déblocages, profil `localStorage` versionné ; option : sauvegarde de la partie en cours | tests de déblocage ; rechargement de page sans perte |
| 5 | **Interface fonctionnelle** | tous les écrans en HTML/CSS simple, sans habillage | une partie complète jouable au clavier et à la souris |
| 6 | **Habillage** | export des sprites, police, palette, décor en parallaxe (CSS), animations (glissements, clignotements, compteur d'or, particules), sons | comparaison visuelle avec les captures |
| 7 | **Responsive et accessibilité** | colonne portrait centrée sur desktop, plein écran sur mobile, zones tactiles ≥ 44 px, `prefers-reduced-motion`, focus clavier | tests sur Chrome/Firefox/Safari, iOS et Android |
| 8 | **Remplacements des services mobiles** | voir §3.3 | |
| 9 | **Finitions** | PWA (installable, hors ligne), traduction FR/EN si souhaitée, build et déploiement | Lighthouse ≥ 90, déploiement automatique |

Ordre recommandé : 0 → 1 → 2 → 3 → 5 (UI brute dès que le moteur tourne, pour jouer tôt) → 4 → 6 → 7 → 8 → 9.

### 3.3 Ce qui ne peut pas être porté tel quel

| Élément Unity | Problème sur le web | Suggestion |
|---|---|---|
| **AdMob** (interstitiels + vidéo récompensée) | SDK Android uniquement | **Supprimer les pubs**. Si vous voulez monétiser : version gratuite sur itch.io avec « payez ce que vous voulez », ou un SDK de portail (CrazyGames, Poki) si vous publiez là-bas. |
| **Vidéo récompensée « continuer »** | dépend d'AdMob | « Retenter le jour » gratuit, **limité à 1 fois par partie**, ou supprimé (question 4) |
| **Unity IAP « No Ads »** | Google Play Billing indisponible | Sans pub, l'achat n'a plus de sens. Débloquer Mehaz et Ipartus autrement : par score après Sanctifan, ou dès le départ (question 3). Si paiement voulu : Stripe Checkout + backend, à éviter pour un premier jet. |
| **Google Play Games** (classements, succès) | non disponible sur le web | Succès **locaux** (même liste, stockée en local). Classements : seulement le meilleur score local au début ; plus tard, petit backend (Supabase ou Firebase) **avec anti-triche minimal** (question 5). |
| **Firebase Analytics** | inutile | rien, ou une mesure d'audience sans cookie (Plausible, Umami) |
| **Easy Save 3** | dépend d'Unity | `localStorage` (JSON versionné). **Les sauvegardes Android ne pourront pas être importées** (fichier chiffré sur le téléphone) ; option : code d'import de progression (question 7). |
| **NativeShare** | dépend d'Android | Web Share API (`navigator.share`) sur mobile + repli « copier le texte » / « télécharger l'image ». Image du score générée dans un `<canvas>`. |
| **Exit / `Application.Quit`** | n'existe pas dans un navigateur | supprimer le bouton |
| **Popup « notez le jeu »** | lien Play Store | remplacer par un lien vers la page itch.io ou Discord, ou supprimer |
| **Animator / particules / TextMesh Pro** | — | CSS (transitions, keyframes) + quelques particules en canvas ou DOM |
| **Polices** | licences inconnues pour le web ; Matura MT est une police Microsoft | vérifier les licences ; sinon remplacer par des polices Google Fonts proches (question 8) |
| **Musique WAV 24 Mo** | trop lourde | OGG/MP3 ~128 kbps (~2-3 Mo), chargement différé ; démarrage après une interaction (règle des navigateurs). **Vérifier la licence de Tyler Cline pour le web.** |
| Identifiants (`google-services.json`, IDs AdMob, mot de passe ES3) | — | **ne pas les copier** dans le dépôt web |

---

## 4. Questions pour avancer

1. **Fidélité ou correction ?** Faut-il reproduire les bugs listés dans `mecaniques.md` §13 (B1 à B18), ou les corriger ? Ma recommandation : corriger B1-B11, B15 et B17 (involontaires et invisibles pour le joueur), et vous laisser trancher B13, B14 et B16, qui touchent à l'équilibrage.
2. **Monétisation** : version web entièrement gratuite et sans pub ? Ou une piste de revenu (itch.io « payez ce que vous voulez », portail de jeux) ?
3. **Factions premium Mehaz et Ipartus** : comment les débloquer sans achat ? (par score après Sanctifan / dès le début / supprimées)
4. **« Continuer » après défaite** : à supprimer, gratuit et illimité comme l'original, ou limité (1 fois par partie) ?
5. **Classements en ligne** : en voulez-vous dès la première version (il faut un backend), ou le meilleur score local suffit-il ?
6. **Langue** : anglais seulement comme l'original, ou français + anglais (système de traduction dès le départ) ?
7. **Progression** : nouveau départ pour tous les joueurs, ou mécanisme d'import ? Faut-il une sauvegarde **en cours de partie** (reprendre après fermeture de l'onglet), absente de l'original ?
8. **Droits sur les assets** : avez-vous les licences web pour la musique de Tyler Cline et les polices (Matura MT, Manila Sans, Pajarakan Studs, Typographer Subway) ? Avez-vous les sources des sprites en meilleure résolution (fichiers de travail) ?
9. **Hébergement cible** : itch.io, GitHub Pages, votre domaine, portail de jeux ? Cela change la gestion des chemins, du PWA et de la monétisation.
10. **UI** : TypeScript sans framework (ma recommandation) ou Preact/React ?
11. **Desktop** : garder une colonne portrait centrée (rapide, fidèle) ou concevoir une mise en page paysage dédiée ?
12. **Seuils et contenu** : les seuils de déblocage actuels sont-ils définitifs ? Le texte « alpha version » de l'écran titre laisse penser que non. Faut-il garder les 22 factions et les textes en l'état ?
13. **Comportements à vérifier sur le jeu Android** (si vous l'avez sous la main) : le bonus de Mahaji (épices à 15) s'applique-t-il vraiment (B12) ? À quoi sert le bouton étoile de l'écran titre (succès ou notation) ?
14. **Git** : puis-je initialiser un dépôt git (ou un dossier `caravan-web/` séparé) au moment de coder, pour versionner le portage ?
