
-- LES 5 REQUETES DE BASE, A TESTER DANS HEIDISQL
-- Selectionne une requete puis appuie sur F9 pour lancer
-- seulement celle-la (sinon F9 lance tout le fichier)


-- On travaille dans la base app_activities
USE app_activities;


-- 1. AFFICHER TOUTES LES ACTIVITES
-- C'est ce que fait la route GET /api/activities
SELECT * FROM activities;


-- 2. AFFICHER UNE ACTIVITE DONNEE
-- WHERE sert a filtrer : on ne garde que la ligne dont l'id vaut 3
-- C'est ce que fait la route GET /api/activities/3
SELECT * FROM activities WHERE id = 3;


-- 3. AJOUTER UNE ACTIVITE
-- On ne met pas l'id : MySQL le genere seul (AUTO_INCREMENT)
-- C'est ce que fait la route POST /api/activities
INSERT INTO activities (name, startDate, duration)
VALUES ('Cours de guitare', '2026-10-01', 75);

-- Pour voir l'id que MySQL vient de creer :
SELECT LAST_INSERT_ID();


-- 4. MODIFIER UNE ACTIVITE
-- SET indique les nouvelles valeurs, WHERE indique quelle ligne modifier
-- ATTENTION : sans le WHERE, TOUTES les lignes de la table seraient modifiees
-- C'est ce que fait la route PUT /api/activities/3
UPDATE activities
SET name = 'Football junior avance', startDate = '2026-09-10', duration = 130
WHERE id = 3;


-- 5. SUPPRIMER UNE ACTIVITE
-- Meme avertissement : sans le WHERE, toute la table serait videe
-- C'est ce que fait la route DELETE /api/activities/3
DELETE FROM activities WHERE id = 12;



-- BONUS : nettoyer les doublons du debut
-- (les activites 6 a 10, creees quand le script a ete lance 2 fois)

-- DELETE FROM activities WHERE id BETWEEN 6 AND 10;
