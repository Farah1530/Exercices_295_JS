# Aide-mémoire Git

Fiche adaptée à ton projet : dépôt `Exercices_295_JS`, branches `main` et `exercice-5-mysql`.

Toutes ces commandes se tapent dans le terminal, **placé dans le dossier `c295`**.

---

## 1. Savoir où j'en suis

C'est le réflexe à avoir avant et après chaque action.

```bash
git status
```
Affiche les fichiers modifiés, ceux prêts à être commités, et la branche actuelle.

```bash
git branch
```
Liste tes branches locales. L'étoile `*` marque celle où tu es.

```bash
git log --oneline
```
Affiche l'historique des commits, un par ligne. Appuie sur `q` pour sortir.

```bash
git diff
```
Montre exactement ce que tu as changé depuis le dernier commit, ligne par ligne.

---

## 2. Enregistrer mon travail

Un commit se fait toujours en deux temps : d'abord on choisit les fichiers, ensuite on enregistre.

```bash
git add nom-du-fichier.js
```
Prépare **un fichier** pour le prochain commit.

```bash
git add .
```
Prépare **tous** les fichiers modifiés. Vérifie avec `git status` avant, pour ne pas ajouter quelque chose par erreur.

```bash
git commit -m "Ajout de la route DELETE"
```
Enregistre les fichiers préparés, avec un message qui explique ce que tu as fait.

> **Le message compte.** Écris ce que le changement apporte, pas « modifications ». Dans six mois, c'est ce message qui te dira ce que tu as fait.

---

## 3. Envoyer sur GitHub

```bash
git push
```
Envoie tes commits sur GitHub. Sans push, ton travail reste uniquement sur ton PC.

```bash
git push -u origin nom-de-la-branche
```
Pour la **première fois** qu'on envoie une nouvelle branche. Le `-u` crée le lien entre ta branche locale et celle de GitHub. Les fois suivantes, `git push` tout court suffit.

---

## 4. Récupérer ce qui est sur GitHub

```bash
git pull
```
Récupère les changements présents sur GitHub et les applique à ton dossier. Utile si tu travailles depuis deux ordinateurs, par exemple l'école et la maison.

```bash
git clone https://github.com/Farah1530/Exercices_295_JS.git
```
Télécharge un dépôt complet dans un nouveau dossier. À faire une seule fois, sur un nouveau PC.

---

## 5. Les branches

Une branche est une version parallèle du projet. Tu peux essayer quelque chose sans casser ce qui marche.

```bash
git branch nom-de-la-branche
```
Crée une branche, sans y aller.

```bash
git checkout nom-de-la-branche
```
Va sur une branche existante. **Attention** : le contenu de tes fichiers change sur le disque pour correspondre à cette branche.

```bash
git checkout -b nom-de-la-branche
```
Crée une branche **et** y va, en une seule commande. C'est celle qu'on utilise le plus.

```bash
git checkout main
git merge exercice-5-mysql
```
Fusionne le travail d'une branche dans une autre. Ici : se placer sur `main`, puis y intégrer `exercice-5-mysql`.

```bash
git branch -d nom-de-la-branche
```
Supprime une branche locale devenue inutile, une fois son travail fusionné.

---

## 6. Annuler

```bash
git restore nom-du-fichier.js
```
Annule tes modifications sur un fichier et le remet comme au dernier commit. **Irréversible**, ce que tu avais tapé est perdu.

```bash
git restore --staged nom-du-fichier.js
```
Retire un fichier de la préparation, sans toucher à son contenu. À utiliser après un `git add` fait par erreur.

```bash
git commit --amend -m "Nouveau message"
```
Corrige le **dernier** commit : son message, ou son contenu si tu as fait un `git add` avant. À n'utiliser que si tu ne l'as pas encore poussé.

```bash
git revert abc1234
```
Crée un nouveau commit qui annule un commit précédent. C'est la méthode sûre : rien n'est effacé de l'historique.

---

## 7. Situations courantes

**« Je ne sais plus ce que j'ai modifié »**
```bash
git status
git diff
```

**« J'ai oublié un fichier dans mon dernier commit »**
```bash
git add le-fichier-oublie.js
git commit --amend --no-edit
```

**« Je veux voir le projet tel qu'il était à un commit »**
```bash
git show abc1234
```

**« Mon push est refusé »**

C'est que GitHub a des commits que tu n'as pas. Récupère-les d'abord :
```bash
git pull
git push
```

**« Je veux savoir qui a écrit cette ligne »**
```bash
git blame nom-du-fichier.js
```

---

## 8. À ne jamais faire

**Ne commite jamais un mot de passe ni une clé.** Même supprimé ensuite, il reste visible dans l'historique. C'est pour ça que ton mot de passe MySQL est dans `.env`, qui est ignoré par git.

**Ne commite jamais `node_modules`.** Ce sont des milliers de fichiers réinstallables avec `npm install`.

**Évite `git push --force`** sur un projet partagé : cette commande écrase l'historique de GitHub, donc potentiellement le travail des autres.

---

## Le cycle de tous les jours

```bash
git status                          # où j'en suis
git add .                           # je prépare mes changements
git commit -m "Message clair"       # j'enregistre
git push                            # j'envoie sur GitHub
```
