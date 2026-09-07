// =============================================================
// FICHIER DES ROUTES DES ACTIVITES
// Une "route" = une adresse (URL) + une methode (GET, POST, DELETE...)
// Chaque route dit au serveur quoi faire quand un client l'appelle.
//
// Rappel sur les 2 parametres presents dans TOUTES les routes :
// - req (request)  = la demande du client : l'URL, les parametres, le body
// - res (response) = la reponse qu'on renvoie au client
//
// Rappel sur la fonction flechee : (req, res) => { ... }
// C'est juste une facon courte d'ecrire function(req, res) { ... }
// =============================================================

// On importe express pour pouvoir utiliser le Router
import express from 'express';

// On importe les donnees fictives des activites
// C'est notre "base de donnees" simulee sous forme de tableau
import activities from '../db/mock-activities.js';

// On cree un routeur Express
// Le Router permet de regrouper les routes liees aux activites dans un fichier separe
// au lieu de tout ecrire dans app.js
const activitiesRouter = express.Router();

// -------------------------------------------------------------
// LIRE toutes les activites
// -------------------------------------------------------------
// Route GET "/" (qui correspond a /api/activities dans app.js)
// Quand on fait GET http://localhost:3000/api/activities
// le serveur retourne toutes les activites en JSON
activitiesRouter.get('/', (req, res) => {
    // res.json() transforme le tableau JavaScript en texte JSON
    // et l'envoie au client. C'est ca qui met fin a la requete.
    res.json(activities);
});

// -------------------------------------------------------------
// LIRE une seule activite
// -------------------------------------------------------------
// Route GET "/:id" (qui correspond a /api/activities/:id dans app.js)
// :id est un parametre dynamique dans l'URL, par exemple /api/activities/2
activitiesRouter.get('/:id', (req, res) => {
    // req.params contient les parametres de l'URL (ceux ecrits avec ":")
    // req.params.id est TOUJOURS une chaine de caracteres : "2" et non 2
    // parseInt() la convertit en nombre, sinon la comparaison avec === echouerait
    const id = parseInt(req.params.id);

    // find() parcourt le tableau et retourne le PREMIER element qui correspond
    // Si aucune ne correspond, find() retourne undefined
    const activity = activities.find(activity => activity.id === id);

    // { activity } est un raccourci pour { activity: activity }
    res.json({ activity });
});

// -------------------------------------------------------------
// AJOUTER une activite (exercice 2)
// -------------------------------------------------------------
// Route POST "/" (qui correspond a /api/activities dans app.js)
// POST sert a CREER. Les donnees ne sont pas dans l'URL mais dans le "body"
// de la requete (dans Postman : onglet Body > raw > JSON)
activitiesRouter.post('/', (req, res) => {
    // req.body contient l'objet JSON envoye par le client
    // C'est la ligne app.use(express.json()) dans app.js qui permet de le lire.
    //
    // Cette ecriture s'appelle la destructuration. Elle est equivalente a :
    //   const name = req.body.name;
    //   const startDate = req.body.startDate;
    //   const duration = req.body.duration;
    const { name, startDate, duration } = req.body;

    // Calcul de l'id du nouvel element.
    // Faire "activities.length + 1" serait FAUX : si on supprime une activite
    // au milieu, la longueur diminue et on risque de recreer un id existant.
    //
    // Comment cette ligne fonctionne, de l'interieur vers l'exterieur :
    //   1. activities.map(...)  transforme [{id:1,...}, {id:2,...}] en [1, 2]
    //   2. les 3 points "..."   (spread) sortent les valeurs du tableau
    //                           pour les passer une par une : Math.max(1, 2)
    //   3. Math.max()           retourne le plus grand, ici 2
    //   4. + 1                  donne le prochain id libre, ici 3
    const id = Math.max(...activities.map(activity => activity.id)) + 1;

    // On construit la nouvelle activite
    const newActivity = { id, name, startDate, duration };

    // push() ajoute l'element a la fin du tableau
    activities.push(newActivity);

    // Les backticks ` ` permettent d'inserer une variable dans un texte avec ${ }
    const message = `L'activite ${newActivity.name} a bien ete creee !`;

    res.json({ message: message, activity: newActivity });
});

// -------------------------------------------------------------
// MODIFIER une activite (exercice 3)
// -------------------------------------------------------------
// Route PUT "/:id" (qui correspond a /api/activities/:id dans app.js)
// C'est un melange des deux autres routes :
//   - l'id de l'activite a modifier vient de l'URL, comme pour le DELETE
//   - les nouvelles valeurs viennent du body, comme pour le POST
activitiesRouter.put('/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const { name, startDate, duration } = req.body;

    // On utilise findIndex() et non find(), car pour remplacer un element
    // il faut pouvoir ecrire dans la case : activities[index] = ...
    const index = activities.findIndex(activity => activity.id === id);

    // On remplace completement l'ancienne activite par la nouvelle.
    // Attention : on reutilise le MEME id, sinon l'activite changerait d'identite.
    activities[index] = { id, name, startDate, duration };

    const message = `L'activite ${activities[index].name} a bien ete modifiee !`;
    res.json({ message: message, activity: activities[index] });
});

// -------------------------------------------------------------
// SUPPRIMER une activite (exercice 1)
// -------------------------------------------------------------
// Route DELETE "/:id" (qui correspond a /api/activities/:id dans app.js)
activitiesRouter.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);

    // findIndex() retourne la POSITION de l'activite dans le tableau, pas l'objet.
    // Difference a retenir :
    //   find()      -> { id: 2, name: "Atelier peinture", ... }
    //   findIndex() -> 1        (car c'est le 2e element, et on compte depuis 0)
    const index = activities.findIndex(activity => activity.id === id);

    // splice(index, 1) veut dire : a partir de la position "index", supprimer 1 element
    activities.splice(index, 1);

    res.json({ message: 'Activite supprimee' });
});

// On exporte le routeur pour pouvoir l'utiliser dans app.js
export default activitiesRouter;
