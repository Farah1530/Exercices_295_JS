// =============================================================
// FICHIER DES ROUTES DES ACTIVITES
// Une "route" = une adresse (URL) + une methode (GET, POST, DELETE...)
// Chaque route dit au serveur quoi faire quand un client l'appelle.
//
// Rappel sur les 2 parametres presents dans TOUTES les routes :
// - req (request)  = la demande du client : l'URL, les parametres, le body
// - res (response) = la reponse qu'on renvoie au client
//
// Depuis l'exercice 5, les donnees ne viennent plus d'un tableau en memoire
// mais de la base de donnees MySQL "app_activities" (table "activities").
// C'est pour ca que chaque route est maintenant "async" : une requete SQL
// prend un peu de temps, et "await" sert a attendre sa reponse avant de continuer.
// =============================================================

// On importe express pour pouvoir utiliser le Router
import express from 'express';

// On importe le pool de connexion a la base de donnees MySQL
import pool from '../db/connection.js';

// On cree un routeur Express
// Le Router permet de regrouper les routes liees aux activites dans un fichier separe
// au lieu de tout ecrire dans app.js
const activitiesRouter = express.Router();


// LIRE toutes les activites

// Route GET "/" (qui correspond a /api/activities dans app.js)
activitiesRouter.get('/', async (req, res) => {
    // pool.query() envoie une requete SQL et attend le resultat
    // Elle retourne toujours un tableau [rows, fields], on ne garde que "rows"
    // (rows = les lignes retournees par la requete)
    const [rows] = await pool.query('SELECT * FROM activities');

    res.json(rows);
});


// LIRE une seule activite

// Route GET "/:id" (qui correspond a /api/activities/:id dans app.js)
activitiesRouter.get('/:id', async (req, res) => {
    // req.params.id est toujours une chaine de caracteres, parseInt() la convertit en nombre
    const id = parseInt(req.params.id);

    // Le "?" dans la requete est un espace reserve, rempli par la valeur du tableau [id]
    // C'est important de faire ca (et pas coller "id" directement dans le texte) :
    // ca evite les injections SQL, une faille ou un utilisateur malveillant
    // pourrait glisser du code SQL dans les donnees envoyees au serveur
    const [rows] = await pool.query('SELECT * FROM activities WHERE id = ?', [id]);

    // rows est un tableau. S'il y a une correspondance, elle est a la position 0
    const activity = rows[0];

    res.json({ activity });
});

// AJOUTER une activite

// Route POST "/" (qui correspond a /api/activities dans app.js)
activitiesRouter.post('/', async (req, res) => {
    // Les donnees envoyees par le client se trouvent dans req.body
    const { name, startDate, duration } = req.body;

    // INSERT INTO ajoute une nouvelle ligne dans la table
    // On ne precise pas l'id : la colonne est AUTO_INCREMENT, MySQL le genere seul
    const [result] = await pool.query(
        'INSERT INTO activities (name, startDate, duration) VALUES (?, ?, ?)',
        [name, startDate, duration]
    );

    // result.insertId contient l'id que MySQL vient de generer pour cette ligne
    const newActivity = { id: result.insertId, name, startDate, duration };

    const message = `L'activite ${newActivity.name} a bien ete creee !`;
    res.json({ message: message, activity: newActivity });
});


// MODIFIER une activite

// Route PUT "/:id" (qui correspond a /api/activities/:id dans app.js)
activitiesRouter.put('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const { name, startDate, duration } = req.body;

    // UPDATE modifie la ligne dont l'id correspond, sans toucher aux autres
    await pool.query(
        'UPDATE activities SET name = ?, startDate = ?, duration = ? WHERE id = ?',
        [name, startDate, duration, id]
    );

    const updatedActivity = { id, name, startDate, duration };

    const message = `L'activite ${updatedActivity.name} a bien ete modifiee !`;
    res.json({ message: message, activity: updatedActivity });
});


// SUPPRIMER une activite

// Route DELETE "/:id" (qui correspond a /api/activities/:id dans app.js)
activitiesRouter.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    // DELETE FROM supprime la ligne dont l'id correspond
    await pool.query('DELETE FROM activities WHERE id = ?', [id]);

    res.json({ message: 'Activite supprimee' });
});

// On exporte le routeur pour pouvoir l'utiliser dans app.js
export default activitiesRouter;
