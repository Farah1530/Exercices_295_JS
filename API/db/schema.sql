
-- SCRIPT DE CREATION DE LA BASE DE DONNEES "app_activities"
-- A lancer une seule fois dans HeidiSQL (ou un autre client MySQL)


-- On cree la base de donnees si elle n'existe pas deja
CREATE DATABASE IF NOT EXISTS app_activities;

-- On indique qu'on veut travailler dans cette base
USE app_activities;

-- On cree la table "activities"
-- id         : identifiant unique, genere automatiquement par MySQL (AUTO_INCREMENT)
--              -> on n'a donc plus besoin de calculer le prochain id nous-memes en JavaScript
-- name       : nom de l'activite (texte, 255 caracteres max)
-- startDate  : date de debut, au format DATE (ex: 2026-09-01)
-- duration   : duree en minutes (nombre entier)
CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    startDate DATE NOT NULL,
    duration INT NOT NULL
);

-- On insere les memes activites que dans mock-activities.js
-- (on ne precise pas l'id, MySQL le genere tout seul grace a AUTO_INCREMENT)
INSERT INTO activities (name, startDate, duration) VALUES
    ('Cours de natation', '2026-09-01', 60),
    ('Atelier peinture', '2026-09-05', 90),
    ('Football junior', '2026-09-10', 120),
    ('Yoga debutants', '2026-09-15', 45),
    ('Activite Amin', '2026-08-15', 60);


-- =============================================================
-- EXERCICE 9 : LA TABLE DES UTILISATEURS
-- Elle sert a l'authentification : un utilisateur s'inscrit (signup),
-- puis se connecte (login) pour recevoir un token.
-- =============================================================

-- id       : identifiant unique, genere automatiquement par MySQL
-- username : nom d'utilisateur. UNIQUE empeche deux comptes du meme nom
-- password : le mot de passe HACHE par bcrypt, jamais le mot de passe en clair.
--            Un hachage bcrypt fait 60 caracteres, on prevoit large avec 255.
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);
