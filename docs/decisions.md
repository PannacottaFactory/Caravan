# Décisions de portage

Réponses aux questions de [portage.md](portage.md) §4 (validées le 2026-10-29).

| Sujet | Décision |
|---|---|
| Pubs | Supprimées (pas d'interstitiel, pas de vidéo récompensée) |
| Monétisation | Aucune pour l'instant |
| Succès | En local (même liste que Google Play) |
| Sauvegarde | Navigateur (`localStorage`) : profil + partie en cours (reprise après fermeture de l'onglet) |
| Bugs B1-B18 | **Tous corrigés** ; l'équilibrage sera revu plus tard |
| Mehaz / Ipartus | Débloquées par score : Sanctifan ≥ **12 000** → Mehaz ; Mehaz ≥ **15 000** → Ipartus |
| « Continuer » après défaite | Gratuit et **illimité** (rejoue le jour de la défaite) |
| Classement | Première version en ligne (backend à choisir, GitHub Pages étant statique) |
| Langue | Anglais uniquement |
| Droits (musique, polices, sprites) | OK |
| Hébergement | GitHub Pages |
| UI | TypeScript sans framework |
| Format | Mise en page **paysage** dédiée (desktop), en plus du portrait mobile |
| Texte « alpha version » | Supprimé |
| Dépôt | `caravan-web/`, séparé du projet Unity |

## Seuils de Mehaz et Ipartus

Les seuils existants vont de 3 000 (Normalia) à 20 000 (Bajaar), la plupart entre 8 000 et 12 000. Les deux dernières factions sont placées dans le haut de la fourchette : 12 000 pour Mehaz (forte : les chameaux ne mangent pas), 15 000 pour Ipartus. Les valeurs sont dans `src/engine/data/factions.ts`.

## Corrections appliquées (réf. `mecaniques.md` §13)

| # | Correction dans le moteur web |
|---|---|
| B1-B4, B11 | Le poids n'est plus un compteur : il est **calculé** à partir de l'inventaire et des poids unitaires effectifs. Stonecutter, Heavyfood, Gayawaku, Octoyashi, Camelization sont donc toujours cohérents. |
| B5 | La Corne d'abondance réduit la consommation de 2 au moment du calcul ; la consommation ne descend jamais sous 0. |
| B6 | Le taux d'épargne est un entier (en %) jamais inférieur à 10 %, quelle que soit la cause de la baisse. |
| B7 | Marchands et chameaux ne descendent jamais sous 0 ; le Voyant (Seer) n'est tiré que s'il y a un chameau. |
| B8 | Plus d'achat « No Ads » : Sanctifan et le mode Traveler se débloquent uniquement par le score. |
| B9 | Déblocage et affichage utilisent la même condition (`≥`). |
| B10 | Toutes les améliorations s'additionnent (plus de `else if`). |
| B12 | Les bonus sont des modificateurs appliqués dans un ordre déterministe (au départ : additions, puis multiplications, puis valeurs fixées). |
| B13 | « Continuer » restaure l'état exact d'avant l'action fatale (y compris achats chez le marchand et pouvoir de la sorcière du jour). |
| B14 | Pas de consommation de nourriture le dernier jour. |
| B15 | Le filtre des catastrophes est réactivé, avec en plus : Tradersleft exige ≥ 1 marchand, Seer ≥ 1 chameau, Heavyfood une nourriture qui pèse. |
| B16 | Inchangé (équilibrage) : le score utilise les valeurs fixes des biens. |
| B17 | Sans objet (nouvelle sauvegarde). |
| B18 | Arrondi standard (`Math.round`). |

Autres choix :
- Vendre est accepté dès qu'au moins un bien est vendu, même à 0 or (utile pour se délester).
- Les textes des catastrophes Jewelrycrisis et Silkcrisis disent « decreased by 700 / 350 » (effet relatif), au lieu d'annoncer une valeur finale fausse.
- Bajaar (Classical) commence toujours avec 30 or, comme sur Android.
