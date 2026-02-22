# 🪑 Meubles Concept

> **Application de conception de meubles** — dessinez vos étagères et armoires en millimètres, visualisez-les en 3D, planifiez votre pièce. Fonctionne hors-ligne sur ordinateur et téléphone.

---

## Comment tester l'application ?

### Ce dont vous avez besoin (à installer une seule fois)

1. **Node.js** — c'est le moteur qui fait tourner l'application sur votre ordinateur.
   → Téléchargez-le gratuitement sur **[nodejs.org](https://nodejs.org)** (choisissez la version marquée « LTS »).
   Installez-le comme n'importe quel logiciel (suivez l'assistant d'installation).

2. **Un terminal** (invite de commande) :
   - **Windows** : touche `⊞ Win` → tapez `cmd` → Entrée
   - **Mac** : `Cmd + Espace` → tapez `Terminal` → Entrée
   - **Linux** : `Ctrl + Alt + T`

---

### Lancer l'application (3 étapes)

Ouvrez le terminal, puis tapez les commandes suivantes **une par une** (appuyez sur Entrée après chaque ligne) :

```bash
# 1. Aller dans le dossier du projet
cd chemin/vers/Meubles_Concept

# 2. Installer les dépendances (à faire une seule fois)
npm install

# 3. Démarrer l'application
npm run dev
```

Après la 3e commande, vous verrez un message comme :
```
  ➜  Local:   http://localhost:5173/
```

**Ouvrez votre navigateur** (Chrome, Firefox, Edge…) et allez à l'adresse :
**http://localhost:5173/**

C'est tout — l'application s'affiche en français ! 🎉

---

## Comment utiliser l'application ?

L'application comprend **3 sections** accessibles depuis la barre de navigation en haut.

---

### 🛠️ Studio — Créer un meuble

1. Cliquez sur **Studio** dans la barre de navigation (ou sur le bouton « Commencer à concevoir » sur la page d'accueil).
2. Remplissez le formulaire à gauche :
   - **Nom** : donnez un nom à votre meuble (ex. : « Étagère salon »)
   - **Type** : choisissez entre *Étagère simple* ou *Armoire simple*
   - **Largeur / Profondeur / Hauteur** : dimensions en millimètres
   - **Épaisseur des panneaux** : épaisseur du bois (18 mm par défaut)
   - **Nombre d'étagères** : combien de tablettes à l'intérieur
   - **Socle** : hauteur du pied en bas (optionnel)
   - **Panneau arrière** : cochez pour ajouter un fond
   - **Matériau** : Bois, Laqué ou Métal
3. La **vue 3D à droite se met à jour automatiquement** en temps réel.
4. Utilisez la souris pour **faire tourner** le meuble en 3D (clic gauche + glisser), **zoomer** (molette) ou **déplacer** (clic droit + glisser).
5. Les boutons **iso / front / side / top** changent l'angle de vue.
6. Cliquez sur **Enregistrer** pour sauvegarder le meuble.
7. Cliquez sur **Exporter GLB** pour télécharger le meuble en fichier 3D (format `.glb`, compatible Blender, etc.).

---

### 🖼️ Showroom — Voir mes créations

1. Cliquez sur **Showroom** dans la barre de navigation.
2. Tous vos meubles sauvegardés apparaissent sous forme de cartes avec un aperçu 3D.
3. Cliquez sur une carte pour voir le meuble en grand avec ses dimensions.
4. Bouton **Modifier** → retourne dans le Studio pour modifier le meuble.
5. Bouton **Supprimer** → supprime définitivement le meuble (confirmation demandée).

---

### 📐 Planificateur de pièce — Disposer les meubles

1. Cliquez sur **Planificateur de pièce** dans la barre de navigation.
2. Remplissez les dimensions de votre pièce (longueur, largeur, hauteur en mm).
3. Donnez un nom à la pièce.
4. Cliquez sur **+ Ajouter un meuble** → choisissez un meuble parmi vos créations.
5. Le meuble apparaît sur le plan (vue de dessus). **Glissez-le** avec la souris pour le positionner.
6. Dans la liste à gauche, cliquez sur un meuble puis :
   - **↻** pour le faire pivoter de 90°
   - **✕** pour le retirer de la pièce
   - Modifiez les champs **X** et **Y** pour une position précise en mm
7. Si deux meubles se chevauchent, un **avertissement orange** apparaît.
8. La **grille magnétique** aligne automatiquement les meubles sur une grille de 100 mm (désactivable).
9. Cliquez sur **Enregistrer la pièce** pour sauvegarder.

---

### 🌍 Changer la langue

Cliquez sur **FR** ou **RO** en haut à droite de la barre de navigation pour basculer entre le français et le roumain.

---

## Commandes disponibles

| Commande | Ce que ça fait |
|---|---|
| `npm run dev` | Lance l'application en mode développement |
| `npm run build` | Crée une version prête pour la mise en ligne |
| `npm run preview` | Prévisualise la version de production |
| `npm run lint` | Vérifie la qualité du code |

---

## Fonctionnement hors-ligne

L'application est une **PWA** (Progressive Web App) : une fois chargée dans le navigateur, elle fonctionne **sans connexion internet**. Toutes vos créations sont sauvegardées localement sur votre appareil (IndexedDB).

Vous pouvez également **l'installer** sur votre ordinateur ou téléphone comme une application native : cherchez l'icône d'installation dans la barre d'adresse de votre navigateur.

---

## Technologies utilisées

| Rôle | Technologie |
|---|---|
| Interface | React 18 + React Router 6 |
| 3D | Three.js 0.163 + OrbitControls |
| Construction | Vite 5 + TypeScript 5 |
| PWA | vite-plugin-pwa (Workbox) |
| Stockage local | IndexedDB via `idb` |
| Traductions | i18next + react-i18next |
