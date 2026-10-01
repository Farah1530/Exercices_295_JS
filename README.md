# API de gestion des activités — ICT295

API REST qui permet de gérer les activités proposées au CPNV : les afficher, en ajouter,
les modifier et les supprimer. Elle est écrite en JavaScript avec Node.js et Express,
et ses données sont enregistrées dans une base de données MySQL.

Projet réalisé dans le cadre du module ICT295.

## Installation

Il faut Node.js et un serveur MySQL installés sur la machine.

1. Se placer dans le dossier du projet :

```bash
cd API
```

2. Installer les paquets utilisés par le projet :

```bash
npm install
```

3. Créer la base de données en lançant le script `db/schema.sql` dans HeidiSQL,
   ou dans la fenêtre Database d'IntelliJ. Il crée la base `app_activities`,
   la table `activities` et quelques activités de départ.

4. Copier le fichier `.env.example`, renommer la copie en `.env`,
   puis remplir les valeurs avec ses propres paramètres MySQL :

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=mon_mot_de_passe
DB_PORT=3306
DB_NAME=app_activities
```

Le fichier `.env` n'est jamais envoyé sur GitHub, puisqu'il contient le mot de passe.
C'est pour cette raison que le dépôt contient seulement `.env.example`, sans les valeurs.

5. Démarrer le serveur :

```bash
npm start
```

Le serveur répond alors sur http://localhost:3000

## Les routes de l'API

| Méthode | URL | Ce qu'elle fait |
|---|---|---|
| GET | `/api/activities` | Affiche toutes les activités |
| GET | `/api/activities?name=ski` | Affiche les activités dont le nom contient « ski » |
| GET | `/api/activities?limit=3` | Affiche seulement les 3 premières activités |
| GET | `/api/activities/2` | Affiche l'activité dont l'id est 2 |
| POST | `/api/activities` | Ajoute une activité |
| PUT | `/api/activities/2` | Modifie l'activité dont l'id est 2 |
| DELETE | `/api/activities/2` | Supprime l'activité dont l'id est 2 |

Les deux paramètres `name` et `limit` peuvent être utilisés ensemble :
`/api/activities?name=cours&limit=1`

Le POST et le PUT attendent un body au format JSON :

```json
{
  "name": "Cours de guitare",
  "startDate": "2026-10-01",
  "duration": 75
}
```

## Les codes de statut renvoyés

| Code | Quand |
|---|---|
| 200 | La demande a réussi |
| 400 | Les données envoyées sont incorrectes : id qui n'est pas un nombre entier positif, nom, date ou durée vide, durée supérieure ou égale à 144, mot recherché de moins de 3 caractères, limite incorrecte |
| 404 | L'URL demandée n'existe pas, ou aucune activité n'a l'id demandé |
| 500 | Une erreur s'est produite sur le serveur ou dans la base de données |

En cas d'erreur, le vrai message n'est jamais envoyé au client : il s'affiche uniquement
dans le terminal du serveur. Le client reçoit un message général, pour des raisons de sécurité.

## Organisation des fichiers

```
API
├── app.js                   le serveur Express, les routes de base et l'erreur 404
├── helper.js                les fonctions qui vérifient les données reçues
├── .env                     les paramètres de connexion (jamais envoyé sur GitHub)
├── .env.example             le modèle du fichier .env, sans les valeurs
├── db
│   ├── db-activities.js     toutes les requêtes SQL du projet
│   ├── schema.sql           création de la base et des données de départ
│   └── requetes.sql         exemples de requêtes SQL
└── routes
    └── activities.js        les routes de l'API
```

Les routes ne contiennent aucune requête SQL : elles appellent les fonctions
de `db/db-activities.js`, qui sont les seules à parler à MySQL.

## Les branches du dépôt

| Branche | Contenu |
|---|---|
| `main` | Le projet complet, exercices 1 à 7 |
| `exercices-1-4` | Les exercices 1 à 4, avec les données dans un tableau en mémoire |
| `exercice-5-mysql` | L'exercice 5, première version |
| `exercice-6-7-erreurs-parametres` | Même contenu que `main` |

## Les exercices du module

| Exercice | Sujet |
|---|---|
| 3 | Création de l'API et de la route GET, avec des données simulées dans un fichier JavaScript |
| 4 | Les routes POST, PUT et DELETE |
| 5 | Connexion à une base de données MySQL |
| 6 | Gestion des erreurs et validation des données |
| 7 | Paramètres `name` et `limit` dans l'URL |

## Auteur

Farah Mohamed Ahmed
