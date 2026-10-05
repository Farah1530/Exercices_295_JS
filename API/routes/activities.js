// =============================================================
// FICHIER DES ROUTES DES ACTIVITES
// Une "route" = une adresse (URL) + une methode (GET, POST, PUT, DELETE)
// Chaque route dit au serveur quoi faire quand un client l'appelle.
//
// Rappel sur les 2 parametres presents dans TOUTES les routes :
// - req (request)  = la demande du client : l'URL, les parametres, le body
// - res (response) = la reponse qu'on renvoie au client
//
// Depuis l'exercice 5, les donnees viennent de la base MySQL "app_activities".
// Comme dans l'exemple Contacts de la prof, ce fichier ne contient AUCUNE
// requete SQL : chaque route appelle une fonction de db/db-activities.js,
// et c'est cette fonction qui parle a MySQL.
//
// Les routes sont "async" car la base de donnees met un peu de temps a repondre :
// "await" attend sa reponse avant de passer a la ligne suivante.
//
// EXERCICE 6 : GESTION DES ERREURS
// Chaque route met son code dans un bloc try / catch.
// Si la connexion a la base ne se fait pas (mauvais mot de passe, base inexistante...),
// l'erreur est attrapee par le catch, et le client recoit une erreur 500 en JSON.
//
// Pour la securite, le client ne recoit jamais le vrai message d'erreur :
// il pourrait donner des informations sur notre base de donnees.
// Le vrai message s'affiche seulement dans le terminal du serveur.
//
// EXERCICE 6 : VALIDATION DES DONNEES
// Avant d'interroger la base, chaque route verifie ce que le client a envoye :
// - l'id doit etre un nombre entier positif (GET par id, PUT, DELETE)
// - le nom, la date et la duree ne doivent pas etre vides (POST, PUT)
// - la duree doit etre inferieure a 144 (POST, PUT)
// Si une donnee n'est pas correcte, on renvoie le code 400 (Bad Request =
// "requete incorrecte") : c'est le client qui a envoye une mauvaise demande.


// EXERCICE 7 : LES PARAMETRES DE L'URL
// La route GET de la liste accepte 2 parametres facultatifs, ecrits apres un "?" :
// - name  : ne garder que les activites dont le nom contient ce mot (3 caracteres minimum)
// - limit : ne renvoyer que les x premieres activites trouvees
// Exemple : http://localhost:3000/api/activities?name=ski&limit=2
// On importe express pour pouvoir utiliser le Router
import express from 'express';

// On importe l'objet "db", qui contient toutes les fonctions d'acces a la base
// Les accolades sont obligatoires, car db-activities.js fait "export { db }"
import { db } from '../db/db-activities.js';

// On importe les fonctions de validation depuis helper.js
import { isValidId, isEmpty, isValidDuration, isValidSearchName, isValidLimit, MAX_DURATION, MIN_SEARCH_LENGTH } from '../helper.js';

// On cree un routeur Express
// Le Router permet de regrouper les routes liees aux activites dans un fichier separe
// au lieu de tout ecrire dans app.js
const activitiesRouter = express.Router();


// LIRE toutes les activites

// Route GET "/" (qui correspond a /api/activities dans app.js)
/**
 * @openapi
 * /api/activities:
 *   get:
 *     summary: Affiche la liste des activites.
 *     description: Renvoie toutes les activites. Les deux parametres name et limit sont facultatifs.
 *     parameters:
 *       - in: query
 *         name: name
 *         required: false
 *         schema:
 *           type: string
 *         description: Ne garde que les activites dont le nom contient ce mot (3 caracteres minimum).
 *         example: cours
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *         description: Nombre maximum d activites renvoyees.
 *         example: 3
 *     responses:
 *       200:
 *         description: La liste des activites.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activities:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/activity"
 *       400:
 *         description: Le mot recherche fait moins de 3 caracteres, ou la limite est incorrecte.
 *       500:
 *         description: Erreur interne du serveur ou de la base de donnees.
 */
activitiesRouter.get('/', async (req, res) => {
    // try = "essaie d'executer ce code"
    try {
        // EXERCICE 7 : les parametres de l'URL se trouvent dans req.query.
        // Pour l'URL http://localhost:3000/api/activities?name=ski&limit=2 :
        //   req.query.name  vaut "ski"
        //   req.query.limit vaut "2"  (les parametres arrivent toujours sous forme de texte)
        // Si le parametre n'est pas ecrit dans l'URL, il vaut undefined.
        const { name, limit } = req.query;

        // CAS 2 : si un nom est recherche, il doit faire au moins 3 caracteres
        if (name !== undefined && !isValidSearchName(name)) {
            const message = `Le nom recherche doit contenir au moins ${MIN_SEARCH_LENGTH} caracteres.`;
            return res.status(400).json({ error: message });
        }

        // CAS 3 : si une limite est demandee, elle doit etre un nombre entier positif.
        // Number() transforme le texte de l'URL en nombre : "2" devient 2.
        const limitNombre = limit === undefined ? undefined : Number(limit);
        if (limit !== undefined && !isValidLimit(limitNombre)) {
            return res.status(400).json({ error: 'La limite doit etre un nombre entier positif.' });
        }

        // On passe les 2 parametres a la base, qui construit la requete SQL.
        // Sans parametre, elle renvoie toutes les activites, comme avant.
        const activities = await db.getAllActivities({ name, limit: limitNombre });

        // On renvoie la liste rangee dans un objet : { activities: [...] }
        // comme la prof le fait avec { contacts }
        res.json({ activities });
    } catch (error) {
        // catch = si une erreur se produit dans le try, le programme saute directement ici.
        // Exemple : la connexion a la base ne se fait pas, a cause d'un mauvais mot de passe.
        // "error" contient la description de l'erreur.

        // 1. On affiche le vrai message d'erreur dans le terminal du serveur, pour le developpeur
        console.error(error);

        // 2. On renvoie au client le code 500 (Internal Server Error = "erreur interne du serveur"),
        //    avec un message general qui ne donne aucun detail sur notre base de donnees
        res.status(500).json({ error: 'Une erreur interne est survenue.' });
    }
});


// LIRE une seule activite

// Route GET "/:id" (qui correspond a /api/activities/:id dans app.js)
/**
 * @openapi
 * /api/activities/{id}:
 *   get:
 *     summary: Affiche une seule activite.
 *     description: Renvoie l activite qui porte l identifiant demande.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifiant de l activite.
 *         example: 1
 *     responses:
 *       200:
 *         description: L activite demandee.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activity:
 *                   $ref: "#/components/schemas/activity"
 *       400:
 *         description: L identifiant n est pas un nombre entier positif.
 *       404:
 *         description: Aucune activite ne porte cet identifiant.
 *       500:
 *         description: Erreur interne du serveur ou de la base de donnees.
 */
activitiesRouter.get('/:id', async (req, res) => {
    try {
        // req.params.id est toujours du texte, Number() le transforme en nombre.
        // On utilise Number() et pas parseInt() : parseInt("12abc") donnerait 12,
        // alors que Number("12abc") donne NaN, et l'id est bien refuse.
        const id = Number(req.params.id);

        // Si l'id n'est pas un nombre entier positif, on arrete tout de suite avec un 400.
        // Le return arrete la fonction : la base de donnees n'est meme pas interrogee.
        if (!isValidId(id)) {
            return res.status(400).json({ error: "L'identifiant doit etre un nombre entier positif." });
        }

        // On demande a la base l'activite qui a cet id
        const activity = await db.getActivityById(id);

        // Si aucune activite n'a cet id, la base renvoie undefined.
        // !activity veut dire "s'il n'y a pas d'activite".
        if (!activity) {
            const message = "L'activite demandee n'existe pas. Merci de réessayer avec un autre identifiant.";

            // 404 (Not Found) : la ressource demandee est introuvable.
            // Le return arrete la fonction : la ligne res.json() plus bas n'est pas executee.
            return res.status(404).json({ error: message });
        }

        res.json({ activity });
    } catch (error) {
        // Meme gestion d'erreur que dans la route precedente :
        // le vrai message dans le terminal, un message general et le code 500 pour le client
        console.error(error);
        res.status(500).json({ error: 'Une erreur interne est survenue.' });
    }
});


// AJOUTER une activite

// Route POST "/" (qui correspond a /api/activities dans app.js)
/**
 * @openapi
 * /api/activities:
 *   post:
 *     summary: Ajoute une activite.
 *     description: Cree une nouvelle activite. L identifiant est genere par MySQL.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Cours de guitare
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-10-01"
 *               duration:
 *                 type: integer
 *                 example: 75
 *             required:
 *               - name
 *               - startDate
 *               - duration
 *     responses:
 *       200:
 *         description: L activite a bien ete creee.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Activite creee
 *                 activity:
 *                   $ref: "#/components/schemas/activity"
 *       400:
 *         description: Le nom, la date ou la duree est vide, ou la duree depasse 144.
 *       500:
 *         description: Erreur interne du serveur ou de la base de donnees.
 */
activitiesRouter.post('/', async (req, res) => {
    try {
        // Les donnees envoyees par le client (le Body dans Postman) sont dans req.body
        // On en sort les 3 valeurs d'un coup (destructuration)
        // Si le client n'envoie aucun body du tout, req.body vaut undefined,
        // et sortir 3 valeurs de "undefined" ferait planter la route (erreur 500).
        // "|| {}" veut dire : si req.body n'existe pas, on utilise un objet vide a la place.
        // Les 3 valeurs sont alors undefined, et la verification juste en dessous
        // renvoie proprement une erreur 400.
        const { name, startDate, duration } = req.body || {};

        // Le nom, la date et la duree ne doivent pas etre vides.
        // Les || veulent dire "OU" : il suffit qu'UN seul champ soit vide pour refuser.
        if (isEmpty(name) || isEmpty(startDate) || isEmpty(duration)) {
            return res.status(400).json({ error: 'Le nom, la date et la duree sont obligatoires.' });
        }

        // La duree doit etre inferieure a 144
        if (!isValidDuration(duration)) {
            return res.status(400).json({ error: `La duree doit etre un nombre inferieur a ${MAX_DURATION}.` });
        }

        // On demande a la base de creer l'activite.
        // Elle nous renvoie l'activite complete, avec l'id genere par MySQL
        const newActivity = await db.createActivity({ name, startDate, duration });

        const message = `L'activite ${newActivity.name} a bien ete creee !`;
        res.json({ message: message, activity: newActivity });
    } catch (error) {
        // Meme gestion d'erreur : message dans le terminal, code 500 pour le client
        console.error(error);
        res.status(500).json({ error: 'Une erreur interne est survenue.' });
    }
});


// MODIFIER une activite

// Route PUT "/:id" (qui correspond a /api/activities/:id dans app.js)
/**
 * @openapi
 * /api/activities/{id}:
 *   put:
 *     summary: Modifie une activite.
 *     description: Remplace le nom, la date et la duree de l activite demandee.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifiant de l activite a modifier.
 *         example: 2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Cours de guitare avance
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-10-01"
 *               duration:
 *                 type: integer
 *                 example: 90
 *             required:
 *               - name
 *               - startDate
 *               - duration
 *     responses:
 *       200:
 *         description: L activite a bien ete modifiee.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Activite modifiee
 *                 activity:
 *                   $ref: "#/components/schemas/activity"
 *       400:
 *         description: Identifiant incorrect, champ vide, ou duree superieure ou egale a 144.
 *       404:
 *         description: Aucune activite ne porte cet identifiant.
 *       500:
 *         description: Erreur interne du serveur ou de la base de donnees.
 */
activitiesRouter.put('/:id', async (req, res) => {
    try {
        // L'id de l'activite a modifier vient de l'URL.
        // Meme verification de l'id que pour le GET d'une activite.
        const id = Number(req.params.id);
        if (!isValidId(id)) {
            return res.status(400).json({ error: "L'identifiant doit etre un nombre entier positif." });
        }

        // Les nouvelles valeurs viennent du Body
        // Si le client n'envoie aucun body du tout, req.body vaut undefined,
        // et sortir 3 valeurs de "undefined" ferait planter la route (erreur 500).
        // "|| {}" veut dire : si req.body n'existe pas, on utilise un objet vide a la place.
        // Les 3 valeurs sont alors undefined, et la verification juste en dessous
        // renvoie proprement une erreur 400.
        const { name, startDate, duration } = req.body || {};

        // Memes verifications que pour le POST.
        // Le nom, la date et la duree ne doivent pas etre vides.
        // Les || veulent dire "OU" : il suffit qu'UN seul champ soit vide pour refuser.
        if (isEmpty(name) || isEmpty(startDate) || isEmpty(duration)) {
            return res.status(400).json({ error: 'Le nom, la date et la duree sont obligatoires.' });
        }

        // La duree doit etre inferieure a 144
        if (!isValidDuration(duration)) {
            return res.status(400).json({ error: `La duree doit etre un nombre inferieur a ${MAX_DURATION}.` });
        }

        // On demande a la base de modifier l'activite
        const updatedActivity = await db.updateActivity(id, { name, startDate, duration });

        // null = aucune activite n'a cet id
        if (!updatedActivity) {
            const message = "L'activite a modifier n'existe pas. Merci de reessayer avec un autre identifiant.";

            // 404 (Not Found) et return pour arreter la fonction
            return res.status(404).json({ error: message });
        }

        const message = `L'activite ${updatedActivity.name} a bien ete modifiee !`;
        res.json({ message: message, activity: updatedActivity });
    } catch (error) {
        // Meme gestion d'erreur : message dans le terminal, code 500 pour le client
        console.error(error);
        res.status(500).json({ error: 'Une erreur interne est survenue.' });
    }
});


// SUPPRIMER une activite

// Route DELETE "/:id" (qui correspond a /api/activities/:id dans app.js)
/**
 * @openapi
 * /api/activities/{id}:
 *   delete:
 *     summary: Supprime une activite.
 *     description: Supprime definitivement l activite qui porte l identifiant demande.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifiant de l activite a supprimer.
 *         example: 12
 *     responses:
 *       200:
 *         description: L activite a bien ete supprimee.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Activite supprimee
 *       400:
 *         description: L identifiant n est pas un nombre entier positif.
 *       404:
 *         description: Aucune activite ne porte cet identifiant.
 *       500:
 *         description: Erreur interne du serveur ou de la base de donnees.
 */
activitiesRouter.delete('/:id', async (req, res) => {
    try {
        // Pour supprimer, on a seulement besoin de l'id, qui vient de l'URL.
        // Meme verification de l'id que pour le GET d'une activite.
        const id = Number(req.params.id);
        if (!isValidId(id)) {
            return res.status(400).json({ error: "L'identifiant doit etre un nombre entier positif." });
        }

        // On demande a la base de supprimer l'activite.
        // deleted vaut true si elle a ete supprimee, false si elle n'existait pas
        const deleted = await db.deleteActivity(id);

        if (!deleted) {
            const message = "L'activite a supprimer n'existe pas. Merci de reessayer avec un autre identifiant.";

            // 404 (Not Found) et return pour arreter la fonction
            return res.status(404).json({ error: message });
        }

        res.json({ message: 'Activite supprimee' });
    } catch (error) {
        // Meme gestion d'erreur : message dans le terminal, code 500 pour le client
        console.error(error);
        res.status(500).json({ error: 'Une erreur interne est survenue.' });
    }
});

// On exporte le routeur pour pouvoir l'utiliser dans app.js
export default activitiesRouter;
