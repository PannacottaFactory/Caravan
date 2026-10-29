# Caravan — Mécaniques de jeu (rétro-ingénierie du projet Unity)

> Source : projet Unity 2022.3.8f1, version Android 1.148 (`com.PannacottaFactory.Caravan`).
> Toutes les valeurs ci-dessous ont été lues dans le code C# (`Assets/Scripts/`) **et** dans les valeurs sérialisées des scènes (`Assets/Scenes/*.unity`), car une grande partie des données est saisie dans l'inspecteur Unity et n'apparaît pas dans le code.
>
> Les passages marqués **⚠️ Ambigu / bug** signalent un comportement du code qui semble involontaire ou dont l'intention n'est pas claire. Ils ne sont **pas** corrigés ici : ils décrivent ce que fait réellement le jeu.

---

## Sommaire

1. [Vue d'ensemble](#1-vue-densemble)
2. [Ressources et statistiques](#2-ressources-et-statistiques)
3. [Démarrage d'une partie](#3-démarrage-dune-partie)
4. [Déroulement d'un tour (jour)](#4-déroulement-dun-tour-jour)
5. [Actions du joueur](#5-actions-du-joueur)
6. [Événements](#6-événements)
7. [Factions](#7-factions)
8. [Mode Traveler et « Prepare your caravan »](#8-mode-traveler-et--prepare-your-caravan-)
9. [Fin de partie : défaite, victoire, score](#9-fin-de-partie--défaite-victoire-score)
10. [Progression méta (déblocages)](#10-progression-méta-déblocages)
11. [Sauvegarde](#11-sauvegarde)
12. [Où sont stockées les données](#12-où-sont-stockées-les-données)
13. [Liste des ambiguïtés et bugs relevés](#13-liste-des-ambiguïtés-et-bugs-relevés)

---

## 1. Vue d'ensemble

Jeu de commerce au tour par tour. Le joueur dirige une caravane pendant un nombre fixe de **jours** (15 en mode *Classical*, 20 en mode *Traveler*). **Chaque jour, il fait une seule action** qui fait passer au jour suivant : acheter, vendre, recruter un marchand, acheter un chameau ou épargner. Il doit nourrir son équipage (marchands + chameaux), respecter la capacité de charge, et finir avec le plus de points possible (or + valeur des biens + équipage).

Des personnages spéciaux (le Marchand mystérieux, la Vieille sorcière) et, en mode Traveler, une catastrophe interviennent à des jours tirés au hasard. Ces événements **ne consomment pas de jour**.

Avant la partie, le joueur choisit une **faction** (22 factions, débloquées progressivement par le score), chacune avec un bonus.

Scènes Unity (ordre du build) : `Title` → `Faction` → (`PrepareCaravan` si mode Traveler) → `PlayScene`.

---

## 2. Ressources et statistiques

### 2.1 Statistiques de la caravane

Variables dans [GlobalVariables.cs](../../Caravan/Assets/Scripts/GlobalVariables.cs) (valeurs initiales lues dans `PlayScene.unity`).

| Variable (code) | Rôle | Valeur initiale (Classical) |
|---|---|---|
| `currentmaxgold` | **Or réel** du joueur (la variable `gold` n'est qu'un compteur animé qui rattrape `currentmaxgold`) | 10 (puis +20 de revenu au jour 1 → **30**) |
| `traders` | Nombre de marchands | 1 |
| `camels` | Nombre de chameaux | 1 |
| `traderincome` | Or gagné par marchand et par jour | 20 |
| `dailyincomebonus` | Bonus fixe de revenu journalier | 0 |
| `tradercost` | Prix d'un marchand | 25 |
| `camelcost` | Prix d'un chameau | 30 |
| `camelload` | Capacité de charge par chameau | 30 |
| `weightbonus` | Bonus fixe de capacité | 0 |
| `weight` | Poids transporté (**compteur tenu à la main**, pas recalculé depuis l'inventaire, voir §13) | 10 (5 nourritures × 2) |
| `maxweight` | Capacité max (calculée) | 30 |
| `savingrate` | Taux d'épargne (float) | 0,5 (50 %) |
| `traderfoodconsumption` | Nourriture consommée par marchand / jour | 1 |
| `camelfoodconsumption` | Nourriture consommée par chameau / jour | 1 |
| `bonusfoodconsumption` | Modificateur de consommation (objet Corne d'abondance) | 0 |
| `foodweight` | Poids d'une nourriture, utilisé pour retirer le poids consommé | 2 |
| `spicessellprice` | Prix de vente des épices (utilisé seulement si Mahaji ou Route de Mahaji) | 10 |
| `day` / `maxday` | Jour courant / dernier jour | 0 / 15 |

### 2.2 Marchandises

Données sérialisées dans `PlayScene.unity`, composants `BuyGlobalPanel.ResourcesInfos` et `SellPanel.ResourcesInfos` (**deux tableaux distincts**, un pour l'achat, un pour la vente).

| Ressource (`name`) | Poids unitaire | Prix d'achat | Prix de vente | Valeur en points (fin de partie) | Stock initial |
|---|---|---|---|---|---|
| food (nourriture) | 2 | 3 | 2 | **0** (non comptée) | 5 |
| spices (épices) | 4 | 5 | 10 | 5 | 0 |
| pottery (poterie) | 5 | 20 | 33 | 20 | 0 |
| marble (marbre) | 20 | 110 | 300 | 110 | 0 |
| silk (soie) | 8 | 530 | 1150 | 530 | 0 |
| jewelry (bijoux) | 12 | 900 | 2500 | 900 | 0 |

Les prix sont **fixes** : il n'y a pas de fluctuation de marché, seulement des modificateurs (faction, marchand, sorcière, catastrophe, améliorations Traveler).

Les quantités possédées sont dupliquées : `GlobalVariables.TotalFood/TotalSpices/...` + `QuantityOwned` dans chacun des deux tableaux. Elles sont resynchronisées par `SynchronizePanels()` / `TakeFromGlovar()` ([BuyGlobalPanel.cs:380](../../Caravan/Assets/Scripts/BuyGlobalPanel.cs#L380), [SellPanel.cs:345](../../Caravan/Assets/Scripts/SellPanel.cs#L345)).

### 2.3 Formules dérivées

- **Revenu journalier** ([GlobalVariables.cs:356](../../Caravan/Assets/Scripts/GlobalVariables.cs#L356)) :
  `dailyincome = traderincome × traders + dailyincomebonus`
- **Capacité max** ([GlobalVariables.cs:964](../../Caravan/Assets/Scripts/GlobalVariables.cs#L964)) :
  - Classical : `maxweight = camelload × camels + weightbonus`
  - Traveler : `maxweight = Prepare.initialweight + camelload × camels + weightbonus`
- **Consommation affichée** ([GlobalVariables.cs:1009](../../Caravan/Assets/Scripts/GlobalVariables.cs#L1009)) :
  `totalfoodconsumption = traders × traderfoodconsumption + camels × camelfoodconsumption + bonusfoodconsumption`, bornée à ≥ 0 pour l'affichage, et affichée 0 le dernier jour.
- **Or épargnable** ([SavePanel.cs:93](../../Caravan/Assets/Scripts/SavePanel.cs#L93)) :
  `goldsaved = round(currentmaxgold × savingrate)` (`Mathf.Round` = arrondi bancaire en C# : 0,5 → pair le plus proche).
- `weight` ne descend jamais sous 0 (bornage dans `WeightUpdate`).

---

## 3. Démarrage d'une partie

Ordre dans `GlobalVariables.Start()` ([GlobalVariables.cs:150](../../Caravan/Assets/Scripts/GlobalVariables.cs#L150)) :

1. `maxday = 15` (Classical) ou `20` (Traveler).
2. `PrepareUpdate()` — uniquement en Traveler : remplace les valeurs de départ (voir §8).
3. `FactionImpact()` — applique le bonus de la faction (voir §7).
4. `WeightUpdate()` — calcule `maxweight`.
5. `DayUpdate()` — passe du jour 0 au **jour 1** : ajoute le revenu du jour, calcule l'or épargnable, vérifie marchand / sorcière / catastrophe.

D'autres scripts appliquent aussi des effets dans leur propre `Start()` (`MerchantPanel`, `WitchPanel`, `Disaster`, `SavePanel`, `RecruitPanel`, `AddCamel`, `BuyGlobalPanel`, `SellPanel`) : tirage des jours d'événements, prix du marchand, effets des améliorations Traveler.

> ⚠️ **Ambigu** : tous les scripts ont `executionOrder: 0`, donc l'ordre des `Start()` entre eux n'est pas garanti par Unity. Exemple concret : `SellPanel.Start()` applique le prix des épices de Mahaji en lisant `spicessellprice`, que `GlobalVariables.FactionImpact()` augmente. Si `SellPanel.Start()` passe en premier, le bonus de Mahaji n'est pas appliqué. À vérifier en jeu.

**État au jour 1 en Classical, faction Normalia** (correspond à la capture d'écran) : or 30 (+20/jour), poids 10/30, nourriture 5 (−2/jour), 1 marchand, 1 chameau, épargne 50 %.

---

## 4. Déroulement d'un tour (jour)

Un « tour » = une action validée. Il n'y a pas de bouton « passer le jour » : il faut agir.

### 4.1 Séquence exacte

Pour chaque action (achat, vente, recrutement, chameau, épargne) :

1. **Effet de l'action** (or, poids, inventaire, équipage…).
2. **Consommation de nourriture** `DayConsumption()` ([BuyGlobalPanel.cs:420](../../Caravan/Assets/Scripts/BuyGlobalPanel.cs#L420)) :
   - `food -= traders × traderfoodconsumption + camels × camelfoodconsumption + bonusfoodconsumption`
   - `weight -= (même quantité) × foodweight` (sauf Gayawaku, dont la nourriture ne pèse rien)
   - La consommation porte sur l'équipage **après** l'action : un marchand ou un chameau recruté mange dès le jour de son recrutement.
   - La nourriture achetée dans la journée est disponible pour la consommation du jour.
3. **`DayUpdate()`** ([GlobalVariables.cs:423](../../Caravan/Assets/Scripts/GlobalVariables.cs#L423)) :
   - **a.** Si `food < 0` **et** `day < maxday` → **DÉFAITE** (fin du traitement).
   - **b.** Sinon, si `day < maxday` :
     1. `day += 1`
     2. Affichage « Day N/max » ou « Last day ! » si `day == maxday`
     3. `TradersUpdate()` (affichages, consommation prévue)
     4. `WeightUpdate()` (recalcule `maxweight`)
     5. `GoldUpdate()` → **`currentmaxgold += dailyincome`**
     6. `SavePanel.GoldSaved()` → recalcule l'or épargnable sur l'or *après* revenu
     7. Vérifie le Marchand, la Sorcière, la Catastrophe pour ce nouveau jour (§6)
     8. Mémorise l'état de début de jour (pour le « continuer » après défaite, §9.1)
   - **c.** Sinon (`day == maxday`, donc l'action du dernier jour vient d'être jouée) → **VICTOIRE** : un dernier revenu journalier est ajouté, puis le score est calculé (§9.2).

### 4.2 Conséquences

- Avec `maxday = 15`, le joueur joue **15 actions** (jours 1 à 15). La 15ᵉ déclenche la victoire.
- Le revenu est versé **au début de chaque jour**, y compris au jour 1 (au démarrage) et une dernière fois à la victoire, soit `maxday + 1` versements au total.
- **Le dernier jour, la nourriture ne peut pas tuer** : la défaite exige `day < maxday`. Si la nourriture devient négative le dernier jour, elle est remise à 0 pour l'affichage.
- Avoir exactement 0 nourriture n'est pas une défaite : il faut **strictement moins de 0** après consommation.

> ⚠️ **Bug** : pour Recruter, Ajouter un chameau et Épargner, le code appelle `DayConsumption()` **deux fois** (une fois sur le tableau d'achat, une fois sur celui de vente). La quantité de nourriture n'est retirée qu'une fois (chaque tableau a sa propre copie), mais **le poids est retiré deux fois**. Le code « compense » en ré-ajoutant `traders × foodweight + camels × foodweight + bonusfoodconsumption × foodweight` ([RecruitPanel.cs:69-88](../../Caravan/Assets/Scripts/RecruitPanel.cs#L69-L88), [AddCamel.cs:55-78](../../Caravan/Assets/Scripts/AddCamel.cs#L55-L78), [SavePanel.cs:69-87](../../Caravan/Assets/Scripts/SavePanel.cs#L69-L87)). Cette compensation suppose une consommation de 1 par membre. Avec *Camelization* ou la catastrophe *Camelsick* (chameaux ×2), le poids baisse plus que la nourriture réellement consommée : le joueur gagne de la capacité « fantôme ».

---

## 5. Actions du joueur

Quatre onglets en bas de l'écran de jeu : **Buy**, **Sell**, **Crew** (Recruit / Add), **Save gold**. Changer d'onglet annule les quantités sélectionnées mais non validées (`Reinitialize()`).

### 5.1 Acheter (Buy) — [BuyGlobalPanel.cs:232](../../Caravan/Assets/Scripts/BuyGlobalPanel.cs#L232)

- Le joueur règle une quantité par ressource avec −/+. Pas de plafond sur le « + » : la validation se fait au bouton.
- `TotalCost = Σ prix_achat × quantité`, `TotalWeight = Σ poids × quantité`. Les compteurs passent en rouge si `TotalCost > or` ou `TotalWeight > maxweight − weight`.
- **Validation « Buy now »** :
  - Accepté si `TotalCost ≤ or` **et** `weight + TotalWeight ≤ maxweight` **et** `TotalCost > 0`.
  - Accepté aussi si tout est gratuit (`TotalCost == 0`, `TotalWeight > 0`, ça rentre en poids). Cas de la nourriture gratuite de Cornecopea.
  - Messages d'erreur : `Not enough gold`, `Not enough pods`, `No resource to buy`.
- Effet : `or -= TotalCost`, `weight += TotalWeight`, inventaire mis à jour, puis consommation et jour suivant.

### 5.2 Vendre (Sell) — [SellPanel.cs:189](../../Caravan/Assets/Scripts/SellPanel.cs#L189)

- −/+ par ressource, le « + » est limité au stock possédé. On peut vendre de la nourriture (2 or).
- Validation si `TotalEarns > 0`, sinon `No resource to sell`.
- Effet : `or += TotalEarns` (+100 si l'objet *Hand of Midas* a été acheté), `weight -= Σ poids vendus`, puis consommation et jour suivant.
- ⚠️ Vendre toute sa nourriture peut provoquer la défaite immédiatement (la consommation passe après la vente).

### 5.3 Recruter un marchand (Crew → Recruit) — [RecruitPanel.cs:44](../../Caravan/Assets/Scripts/RecruitPanel.cs#L44)

- Condition : `or ≥ tradercost` (25), sinon `Not enough gold`.
- Effet : `traders += 1`, `or -= tradercost`. Eduming : `savingrate += 0,1`. Puis consommation et jour suivant.
- Le nouveau marchand rapporte dès le revenu du jour suivant.

### 5.4 Ajouter un chameau (Crew → Add) — [AddCamel.cs:32](../../Caravan/Assets/Scripts/AddCamel.cs#L32)

- Condition : `or ≥ camelcost` (30).
- Effet : `camels += 1`, `or -= camelcost`, capacité `+camelload`. Puis consommation et jour suivant.

### 5.5 Épargner (Save gold) — [SavePanel.cs:41](../../Caravan/Assets/Scripts/SavePanel.cs#L41)

- Toujours possible (aucune condition).
- Effet :
  1. `or += goldsaved`, soit `round(or_en_début_de_jour × savingrate)`. Le montant est recalculé quand l'or change hors action (achat chez le marchand, vol).
  2. `savingrate -= 0,1`, sauf faction Petrinov ou pouvoir de sorcière *Vertue of Patience*.
  3. `savingrate` est ensuite ramené à au moins 0,1.
  4. Consommation et jour suivant.
- Avec un taux de 50 % : +50 %, puis +40 %, +30 %, +20 %, puis +10 % à chaque fois.

> ⚠️ **Bug** : la borne à 0,1 n'est appliquée que dans `Save()`. La catastrophe *Savingcrisis* (−0,3) peut rendre le taux négatif. L'épargne fait alors **perdre** de l'or avant que la borne ne s'applique.

### 5.6 Épargne gratuite (Sanctifan uniquement) — [SavePanel.cs:107](../../Caravan/Assets/Scripts/SavePanel.cs#L107)

- Bouton « Save once », utilisable **une fois par partie**.
- `or += goldsaved`, **sans** baisse du taux, **sans** consommation et **sans** passer de jour.

### 5.7 Actions sans coût en jour

- Acheter un objet au Marchand mystérieux (§6.1).
- Choisir un pouvoir de la Sorcière (§6.2, obligatoire).
- Valider une catastrophe (§6.3, obligatoire).
- Moonin : appeler le marchand à tout moment (§7).
- Consulter l'objet acheté (onglet latéral), retourner au menu (avec confirmation, la partie est perdue).

---

## 6. Événements

Les jours sont tirés au début de chaque partie avec `UnityEngine.Random.Range(min, max)`, où `max` est **exclu**.

| Événement | Condition de déblocage | Jour (Classical) | Jour (Traveler) |
|---|---|---|---|
| Marchand mystérieux | faction n°5 (Tocaccialli) débloquée | 5, 6 ou 7 | 7, 8 ou 9 |
| Vieille sorcière | faction n°14 (Kifuaï) débloquée | 9, 10 ou 11 | 11, 12 ou 13 |
| Catastrophe | mode Traveler uniquement | — | 15, 16 ou 17 |

Les fenêtres ne se chevauchent pas (sauf si Moonin appelle le marchand). Les événements apparaissent au début du jour tiré, après le revenu.

### 6.1 Marchand mystérieux — [MerchantPanel.cs](../../Caravan/Assets/Scripts/MerchantPanel.cs)

- La veille de son arrivée, un avertissement s'affiche (`MerchantWarning`), sauf pour Moonin.
- Le joueur peut acheter **un seul objet** (si `prix ≤ or`) ou partir (« Leave »). Dans les deux cas, le marchand ne revient pas.
- Sélection par défaut : Cornucopia.
- Prix (Vilparino : −20 %) :

| Objet | Prix | Prix Vilparino | Effet décrit | Effet réel dans le code |
|---|---|---|---|---|
| Cornucopia | 25 | 20 | Réduit la consommation de 2 | `bonusfoodconsumption = −2` si la consommation totale est > 1, sinon −1 |
| Route to Mahaji | 25 | 20 | Prix de vente des épices +20 | `spicessellprice += 20` puis appliqué (10 → 30 ; Mahaji 15 → 35) |
| Wooden statuette | 25 | 20 | +500 points par chameau et marchand en fin de partie | `victorystatuettepoints = 500` (voir §9.2) |
| Canvas bag | 50 | 40 | +20 capacité | `weightbonus += 20` |
| Leader's necklace | 50 | 40 | Ajoute un marchand | `traders += 1` (Eduming : épargne +10 %) |
| Hand of Midas | 50 | 40 | +100 or à chaque vente | +100 or par action Vendre validée |
| Sturdy saddle | 100 | 80 | Capacité des chameaux 30 → 50 | `camelload += 20` |
| Magic Clepsydra | 100 | 80 | Un jour de plus | `maxday += 1` |
| Blue Treasure | 100 | 80 | Épargne +20 % | `savingrate += 0,2` |

> ⚠️ **Bug** : le bonus de Cornucopia est figé au moment de l'achat. Si l'équipage diminue ensuite (catastrophe *Tradersleft* ou *Seer*), la consommation peut devenir négative : `DayConsumption` **ajoute** alors de la nourriture chaque jour. L'affichage, lui, est borné à 0.

### 6.2 Vieille sorcière — [WitchPanel.cs](../../Caravan/Assets/Scripts/WitchPanel.cs)

- Le joueur **doit** choisir un pouvoir parmi 8. Il n'y a pas de bouton pour partir. Chaque pouvoir combine un bonus et un malus.

| Pouvoir | Bonus | Malus | Effet réel dans le code |
|---|---|---|---|
| Present's Gift | Capacité max +20 | Épargne −20 % | `weightbonus += 20` ; `savingrate −= 0,2` (borné à ≥ 0) |
| Vertue of Patience | Le taux d'épargne ne baisse plus | Prix d'achat des bijoux +100 | flag `VertueOfPatience` ; bijoux 900 → 1000 |
| Midas Was a Trader | « 150 or par jour par marchand » | Prix de vente du marbre → 0 | `traderincome += 150` (donc 170/marchand, 190 pour Bajaar) ; vente marbre = 0 |
| Camelization | +10 capacité par chameau | Les chameaux mangent 2× plus | `camelload += 10` ; `camelfoodconsumption ×= 2` |
| Time Is Money | +1 jour | Prix de vente des bijoux −500 | `maxday += 1` ; bijoux 2500 → 2000 |
| Animal Lover | +2 chameaux | −1 jour | `camels += 2` ; `maxday −= 1` |
| Oasis of Sanctifan | Plus de consommation de nourriture | Prix d'achat de la soie +200 | consommations marchands et chameaux = 0, `bonusfoodconsumption = 0` ; soie 530 → 730 |
| The Stonecutter | Poids du marbre −15 | Prix d'achat du marbre +60 | poids marbre 20 → 5 (achat et vente) ; prix 110 → 170 |

> ⚠️ **Bug (Stonecutter)** : le poids du marbre déjà transporté est corrigé de `−10 × quantité` au lieu de `−15 × quantité`.
> ⚠️ **Ambigu** : les commentaires du code ne correspondent pas toujours aux valeurs (« silk price +100 » pour +200, « prix d'un jewelry = 0 » pour −500). Les textes affichés au joueur correspondent, eux, au code.

### 6.3 Catastrophes (Traveler uniquement) — [Disaster.cs](../../Caravan/Assets/Scripts/Disaster.cs)

- Une catastrophe tirée **uniformément** parmi 12 (données dans `PlayScene.unity`, `Disaster.DisastersInfos`). Le joueur ne peut que cliquer sur « Continue ».
- La fonction de filtrage `CheckAvailableDisasters()` existe mais son appel est **commenté** : toutes les catastrophes sont toujours possibles.

| `name` | Texte d'effet | Effet réel |
|---|---|---|
| Steal | Vous perdez 25 % de votre or | `or = round(or × 0,75)` |
| Brokeleg | −10 capacité max | `weightbonus −= 10` (le poids peut dépasser la capacité ; seul l'achat est alors bloqué) |
| Tradersleft | Vous perdez vos marchands | `traders = 0` |
| Marblecrisis | Prix de vente du marbre → 0 | vente marbre = 0 |
| Savingcrisis | Épargne −30 % | `savingrate −= 0,3` (peut devenir négatif, voir §5.5) |
| Silkpenury | Prix d'achat de la soie +200 | soie +200 |
| Seer | −1 chameau, +1 jour | `camels −= 1` (⚠️ peut passer à −1 si 0 chameau) ; `maxday += 1` |
| Heavyfood | Poids de la nourriture doublé | poids unitaire ×2, `foodweight ×2`, `weight += 2 × nourriture possédée` (⚠️ s'applique aussi à Gayawaku, dont la nourriture pèse 0 : poids fantôme) |
| Jewelrycrisis | Bijoux 2500 → 1800 | vente bijoux −700 (relatif, donc pas toujours 1800) |
| Silkcrisis | Soie 1150 → 800 | vente soie −350 (relatif) |
| Foodcrisis | Prix d'achat de la nourriture → 15 | achat nourriture = 15 (absolu, même pour Cornecopea) |
| Camelsick | Consommation des chameaux ×2 | `camelfoodconsumption ×= 2` |

---

## 7. Factions

22 factions, données dans `Faction.unity` (composant `FactionManager.FactionsInfos`) : position, nom, histoire, texte du bonus, seuils de déblocage. Les effets sont codés en dur, principalement dans [GlobalVariables.FactionImpact()](../../Caravan/Assets/Scripts/GlobalVariables.cs#L175).

| # | Faction | Bonus affiché | Implémentation | Score pour débloquer la suivante | Score Classical pour débloquer son Traveler |
|---|---|---|---|---|---|
| 1 | Normalia | No effect | — | 3 000 | 14 000 |
| 2 | Fang-Mô | Begin with 1 pottery | poterie = 1, poids +5 | 5 000 | 18 000 |
| 3 | L'Exquise | Traders don't need food | `traderfoodconsumption = 0` | 12 000 | 24 000 |
| 4 | Mahaji | Spices 10 → 15 | `spicessellprice += 5` (voir §3, ordre non garanti) | 8 000 | 14 000 |
| 5 | Tocaccialli | One more day | `maxday += 1` | 12 000 | 15 000 |
| 6 | Bajaar | Traders income doubled | `traderincome ×2` (40) ; Classical : or de départ −10 → 30 au jour 1 (⚠️ le commentaire parle de 25) ; Traveler : 50 si l'amélioration « Traders income » est prise | 20 000 | 42 000 |
| 7 | Doba Lao | Saving +20 % | `savingrate += 0,2` (70 %) | 10 000 | 15 000 |
| 8 | Huangoz | Marble 110 → 90 | achat marbre = 90 | 11 000 | 18 000 |
| 9 | Port-Willam | Initial weight +15 | `weightbonus += 15` | 10 000 | 13 000 |
| 10 | Moonin | Call the merchant at any moment | pas de jour tiré ; bouton « appeler le marchand », une fois | 9 000 | 15 000 |
| 11 | Cornecopea | Food is free | achat nourriture = 0 | 10 000 | 20 000 |
| 12 | Eduming | Each new trader +10 % saving | +0,1 à chaque recrutement (et via le Leader's necklace) | 10 000 | 15 000 |
| 13 | Octoyashi | Begins with 8 food | nourriture = 8, poids +6 | 10 000 | 18 000 |
| 14 | Kifuaï | Initial gold +10 | or +10 | 8 000 | 12 000 |
| 15 | Skjollird | Camels cost more but carry more | chameau 35 or, capacité 40 | 10 000 | 25 000 |
| 16 | Petrinov | Always saves at the same rate | le taux ne baisse pas | 8 000 | 14 000 |
| 17 | Jilliqo | Daily income +10 | `dailyincomebonus = 10` (or de départ −10 pour compenser le 1ᵉʳ revenu) | 9 000 | 14 000 |
| 18 | Gayawaku | Food weighs nothing | poids nourriture = 0, poids initial −10 | 12 000 | 18 000 |
| 19 | Vilparino | Merchant −20 % | prix du marchand réduits | 8 000 | 14 000 |
| 20 | Sanctifan | Can save once for free | bouton « Save once » | — | 16 000 |
| 21 | Mehaz | Camels don't need food | `camelfoodconsumption = 0` | — | 20 000 |
| 22 | Ipartus | Silk −100 | achat soie 430 | — | 20 000 |

> ⚠️ **Bug (Octoyashi en Traveler)** : en Traveler, la nourriture de départ est mise à 0 et le poids à 0, puis Octoyashi fixe la nourriture à 8 et ajoute seulement +6 au poids (calculé pour le mode Classical). Résultat : 8 nourritures pour un poids de 6 au lieu de 16.
> ⚠️ **Ambigu (Bajaar)** : le texte du panneau Recruter est d'abord fixé à `traderincome × 2` (80), puis écrasé par `RecruitText()` (40). La valeur finale affichée dépend de l'ordre d'appel.

---

## 8. Mode Traveler et « Prepare your caravan »

- Débloqué globalement quand la faction n°20 (Sanctifan) est débloquée en Classical ([FactionManager.cs:355](../../Caravan/Assets/Scripts/FactionManager.cs#L355)). Chaque faction doit en plus avoir atteint son propre seuil Traveler en Classical (tableau §7).
- Description affichée : « 20 days - Manage your Caravan - Disasters ».
- Le jeu passe par la scène `PrepareCaravan` ([Prepare.cs](../../Caravan/Assets/Scripts/Prepare.cs)).

### 8.1 Valeurs de départ (`PrepareUpdate`, [GlobalVariables.cs:1040](../../Caravan/Assets/Scripts/GlobalVariables.cs#L1040))

| | Classical | Traveler |
|---|---|---|
| Or au jour 1 | 30 | 10 (pas de revenu sans marchand) |
| Marchands / chameaux | 1 / 1 | 0 / 0 |
| Nourriture / poids | 5 / 10 | 0 / 0 |
| Capacité | 30 | 20 (`initialweight`) |
| Jours | 15 | 20 |
| Marchand mystérieux / sorcière / catastrophe | jours 5-7 / 9-11 / — | jours 7-9 / 11-13 / 15-17 |

### 8.2 Améliorations (3 points à répartir)

10 améliorations activables ou désactivables, 1 point chacune, 3 points au total (`Prepare.points = 3`). Les effets sont répartis dans plusieurs scripts.

| Index | Nom | Effet | Appliqué dans |
|---|---|---|---|
| 0 | Weight | +10 capacité initiale | `Prepare.PrepareEffects` (bouton « Let's go ») |
| 1 | Gold | +10 or initial | idem |
| 2 | Pottery | Prix d'achat poterie −5 | `BuyGlobalPanel.PrepareEffects` |
| 3 | Marble | Poids marbre −5 | `BuyGlobalPanel` + `SellPanel` |
| 4 | Jewelry | Prix de vente bijoux +300 | `SellPanel` |
| 5 | Trader | Coût d'un marchand −10 | `RecruitPanel` |
| 6 | Camel | Chameaux gratuits | `AddCamel` |
| 7 | Traders income | Revenu par marchand +5 | `RecruitPanel` (Bajaar : `GlobalVariables`) |
| 8 | Load capacity | Capacité par chameau +5 | `AddCamel` |
| 9 | Saving | Épargne +5 % | `SavePanel` |

> ⚠️ **Bug** : deux combinaisons perdent un effet à cause d'un `else if` :
> - **Pottery + Marble** : la réduction de poids du marbre n'est pas appliquée côté achat, mais l'est côté vente ([BuyGlobalPanel.cs:556-577](../../Caravan/Assets/Scripts/BuyGlobalPanel.cs#L556-L577)).
> - **Trader + Traders income** : le +5 de revenu est ignoré ([RecruitPanel.cs:113-126](../../Caravan/Assets/Scripts/RecruitPanel.cs#L113-L126)).

---

## 9. Fin de partie : défaite, victoire, score

### 9.1 Défaite — [GlobalVariables.cs:426](../../Caravan/Assets/Scripts/GlobalVariables.cs#L426)

- Unique condition : nourriture < 0 après la consommation, avant le dernier jour.
- Il n'y a pas de défaite liée à l'or ni au poids.
- Écran de défaite avec deux choix :
  - **Regarder une vidéo récompensée** (AdMob), qui appelle `ContinueGame()` ([GlobalVariables.cs:624](../../Caravan/Assets/Scripts/GlobalVariables.cs#L624)). L'or, le poids et l'inventaire reviennent à leur état du **début du jour** où le joueur est mort. La dernière action est annulée si c'était un recrutement (−1 marchand), un chameau (−1) ou une épargne (+0,1 au taux, sauf Petrinov). On rejoue le même jour. Ce « continuer » n'est **pas limité** en nombre.
  - **Retour au menu** (avec interstitiel publicitaire, voir le document de portage).
- ⚠️ `ContinueGame` n'annule pas les effets du marchand ou de la sorcière achetés ce jour-là. Pour une épargne avec *Vertue of Patience*, le taux est quand même augmenté de 0,1.

### 9.2 Victoire et score — [GlobalVariables.cs:479-582](../../Caravan/Assets/Scripts/GlobalVariables.cs#L479-L582)

Après l'action du dernier jour (sans défaite possible) :

1. Revenu journalier ajouté une dernière fois.
2. Nourriture négative remise à 0.
3. Calcul du score :

```
extra = traders×25 + camels×30
      + spices×5 + pottery×20 + marble×110 + silk×530 + jewelry×900
      + victorystatuettepoints × (traders + camels)     // 500 si Wooden statuette, sinon 0
total = or + extra
```

- La nourriture ne rapporte rien. Les biens sont valorisés à leur **prix d'achat de base**, pas à leur prix de vente, et sans tenir compte des modificateurs.
- Vérification avec la capture : 4539 or + 1 marchand × 25 + 2 chameaux × 30 = **4624** ✔.

4. Une phrase d'accroche est tirée au hasard parmi 14 (`Random.Range(1, 15)`).
5. Le meilleur score de la faction et du mode est sauvegardé s'il est battu, et « New record! » s'affiche.
6. Déblocages, succès Google Play, envoi au classement Google Play.
7. Boutons : partager (capture + NativeShare) et menu.

---

## 10. Progression méta (déblocages)

Code : [FactionManager.cs](../../Caravan/Assets/Scripts/FactionManager.cs). Les états « débloqué » ne sont **pas sauvegardés** : ils sont recalculés à chaque chargement à partir des meilleurs scores.

- **Faction suivante (Classical)** : faction *i* débloquée si `highscorenormal(i−1) ≥ scoretounlocknextnormal(i−1)`, pour les positions 1 à 19 → débloque jusqu'à Sanctifan (n°20).
- **Mehaz et Ipartus (n°21-22)** : débloquées seulement par l'achat « No Ads ».
- **Traveler par faction** : `highscorenormal(i) ≥ scoretounlockexpert(i)`.
- **Mode Traveler (global)** : Sanctifan débloquée.
- **Marchand mystérieux** : Tocaccialli (n°5) débloquée → popup sur l'écran titre une seule fois.
- **Vieille sorcière** : Kifuaï (n°14) débloquée → popup.
- **Demande de note Google Play** : Mahaji (n°4) débloquée → popup.

> ⚠️ **Bug** : dans `CheckIfNextFactionUnlocked()`, la branche « No Ads » s'applique à `position > 19`, donc aussi à **Sanctifan** (position 20). Acheter « No Ads » débloque Sanctifan et, par ricochet, le mode Traveler. Le texte de l'écran, lui, ne promet le No Ads que pour les factions 21 et 22.
> ⚠️ **Ambigu** : l'affichage « Faction unlocked » teste `>` alors que le déblocage teste `≥`. Un score exactement égal au seuil débloque la faction mais affiche encore « Make N points… ».

**Succès Google Play** (`CheckAchievements`) : scores ≥ 5 000 / 15 000 / 30 000 / 60 000 / 80 000 / 100 000 ; ≥ 5 chameaux ; ≥ 5 marchands ; ≥ 3 épargnes dans une partie ; marchand débloqué ; sorcière débloquée ; Traveler débloqué. Succès incrémentaux : marchands et chameaux cumulés, 20 morts, 10 / 100 / 1 000 parties terminées. Il y a 22 × 2 classements (un par faction et par mode).

---

## 11. Sauvegarde

- **Plugin** : Easy Save 3 (`ES3`). Easy Save 2 est présent dans le projet mais n'est plus utilisé.
- **Réglages** (`Assets/Plugins/Easy Save 3/Resources/ES3/ES3 Default Settings.prefab`) : fichier `SaveData.Es3.format.JSON` dans le dossier persistant de l'appareil, format JSON, **chiffré en AES** (mot de passe en clair dans le prefab).
- **Il n'y a pas de sauvegarde en cours de partie** : quitter ou revenir au menu fait perdre la partie. Seule la progression méta est sauvegardée.

| Clé ES3 | Type | Écrit par | Contenu |
|---|---|---|---|
| `HighscoreNormal<NomFaction>` | int | `GlobalVariables.SaveHighscoresFactions` | meilleur score Classical (22 clés) |
| `HighscoreExpert<NomFaction>` | int | idem | meilleur score Traveler (22 clés) |
| `NoAds` | bool | `GoogleIAP.SaveNoAds` | achat « No Ads » effectué |
| `MerchantNeverUnlocked` | bool | `GameManager` | popup « marchand débloqué » déjà vu |
| `WitchNeverUnlocked` | bool | idem | popup sorcière vu |
| `TravelermodeNeverUnlocked` | bool | idem | popup Traveler vu |
| `NotificationNeverShowed` | bool | idem | popup « notez le jeu » vu |
| `normalunlocked`, `expertunlocked` | `Factions[]` | `SaveFactionsUnlocked` (**jamais appelé**) | ancien format, encore **chargé** s'il existe |

> ⚠️ **Ambigu** : si une ancienne sauvegarde contient `normalunlocked`, `LoadInto` écrase tout le tableau des factions, y compris les noms, histoires et seuils. Les modifications de données faites depuis ne s'appliqueraient pas à ces joueurs.
> ⚠️ **Bug mineur** : `GameManager.ActualizeCharactersUnlocked()` appelle `ES3.Load` sans affecter le résultat. Ça fonctionne seulement parce que l'absence de la clé suffit à décider.

L'état « muet » du son n'est pas sauvegardé : il est gardé en mémoire par l'`AudioManager` persistant.

---

## 12. Où sont stockées les données

Il n'y a **aucun fichier de données dédié** (pas de ScriptableObject, JSON ou CSV de gameplay). Les données sont réparties ainsi :

| Donnée | Emplacement |
|---|---|
| Ressources (poids, prix d'achat, stock initial) | `Assets/Scenes/PlayScene.unity` → `BuyGlobalPanel.ResourcesInfos` |
| Ressources (prix de vente) | `PlayScene.unity` → `SellPanel.ResourcesInfos` |
| Statistiques de départ | `PlayScene.unity` → `GlobalVariables` |
| Catastrophes (textes) | `PlayScene.unity` → `Disaster.DisastersInfos` ; effets codés dans `Disaster.cs` |
| Factions (textes, seuils) | `Assets/Scenes/Faction.unity` → `FactionManager.FactionsInfos` ; effets dans `GlobalVariables.FactionImpact` et ailleurs |
| Améliorations Traveler | `Assets/Scenes/PrepareCaravan.unity` → `Prepare.ImprovmentsInfos` + valeurs `initial*` |
| Objets du marchand | codés en dur dans `MerchantPanel.cs` (noms, textes, prix, effets) |
| Pouvoirs de la sorcière | codés en dur dans `WitchPanel.cs` |
| Valeurs en points | codées en dur dans `GlobalVariables.DayUpdate` |
| Phrases d'accroche de victoire | codées en dur dans `GlobalVariables.DayUpdate` |
| Textes du tutoriel, des crédits, des popups | `Assets/Scenes/Title.unity` (composants `Text`) |
| Produit In-App | `Assets/Resources/IAPProductCatalog.json` (`noads`) |
| Identifiants des succès et classements | `Assets/GPGSIds.cs` + en dur dans `GlobalVariables.cs` |

---

## 13. Liste des ambiguïtés et bugs relevés

Récapitulatif à trancher avant le portage (reproduire ou corriger ?) :

| # | Sujet | Description courte | Réf. |
|---|---|---|---|
| B1 | Poids tenu à la main | `weight` est un compteur modifié à chaque opération, pas recalculé depuis l'inventaire. Plusieurs effets le désynchronisent (B2, B3, B4, B11). | §2.1 |
| B2 | Double consommation compensée | Recruter, Chameau, Épargner : le poids est faux si la consommation par membre est ≠ 1. | §4.2 |
| B3 | Stonecutter | Correction de poids −10/marbre au lieu de −15. | §6.2 |
| B4 | Heavyfood + Gayawaku | Ajoute du poids à une nourriture qui pèse 0. | §6.3 |
| B5 | Cornucopia figée | La consommation peut devenir négative et créer de la nourriture. | §6.1 |
| B6 | Taux d'épargne négatif | Savingcrisis peut rendre l'épargne perdante. | §5.5 |
| B7 | Seer | Le nombre de chameaux peut devenir négatif. | §6.3 |
| B8 | No Ads débloque Sanctifan | et donc le mode Traveler. | §10 |
| B9 | `>` vs `≥` | Affichage du déblocage incohérent à égalité. | §10 |
| B10 | `else if` des améliorations | Pottery+Marble et Trader+Traders income perdent un effet. | §8.2 |
| B11 | Octoyashi en Traveler | 8 nourritures pour un poids de 6. | §7 |
| B12 | Ordre des `Start()` | Bonus de Mahaji (et peut-être d'autres) dépend d'un ordre non garanti. | §3 |
| B13 | Continue après défaite | Illimité ; n'annule ni le marchand ni la sorcière ; incohérent avec Vertue of Patience. | §9.1 |
| B14 | Dernier jour | La consommation est appliquée mais ne peut pas tuer. Intention probable : « pas de consommation le dernier jour ». | §4.2 |
| B15 | `CheckAvailableDisasters` désactivée | Filtrage des catastrophes impossibles prévu mais commenté. | §6.3 |
| B16 | Valeurs en points ≠ modificateurs | Le score utilise les prix d'achat de base même si la faction ou un événement les modifie. Intentionnel ? | §9.2 |
| B17 | Ancienne sauvegarde `normalunlocked` | Écrase les données de factions. | §11 |
| B18 | Arrondi bancaire | `Mathf.Round` arrondit 0,5 au pair ; `Math.round` en JS arrondit 0,5 vers le haut. Petites différences possibles sur l'épargne et le vol. | §2.3 |
