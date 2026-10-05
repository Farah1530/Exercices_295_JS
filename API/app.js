// On importe le module express depuis node_modules
// Express est un framework qui facilite la création de serveurs web
import express from 'express';

// On importe swagger-ui-express, qui sait afficher la page web de documentation
import swaggerUi from 'swagger-ui-express';

// On importe la description de notre API, fabriquee dans swagger.js
import { openApiSpecification } from './swagger.js';

// On importe le routeur des activités depuis le fichier dédié
// Ce routeur contient toutes les routes liées aux activités
import activitiesRouter from './routes/activities.js';

// On crée une application Express
// "app" est l'objet principal qui représente notre serveur
const app = express();

// On définit le port sur lequel le serveur va écouter les requêtes
// Le port 3000 signifie qu'on accède au serveur via http://localhost:3000
const port = 3000;

// On dit à Express d'accepter et de lire automatiquement le JSON
// dans le corps des requêtes (utile pour les POST et PUT)
app.use(express.json());

// DOCUMENTATION DE L'API (Swagger)
// On branche la page de documentation sur l'adresse /api-docs :
// http://localhost:3000/api-docs
//
// swaggerUi.serve   fournit les fichiers de la page (html, css, javascript)
// swaggerUi.setup   construit la page a partir de la description fabriquee dans swagger.js
// explorer: true    ajoute la barre de recherche en haut de la page
//
// Cette ligne est placee AVANT le bloc des erreurs 404,
// sinon /api-docs serait traitee comme une URL inconnue.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpecification, { explorer: true }));

// Route GET sur "/" : quand quelqu'un accède à http://localhost:3000/
// le serveur répond avec le texte "Hello World!"
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Route GET sur "/api" : au lieu de répondre, on redirige vers "/"
// L'utilisateur sera automatiquement envoyé vers http://localhost:3000/
app.get('/api', (req, res) => {
    res.redirect('/');
});

// On connecte le routeur des activités à l'URL "/api/activities"
// Toutes les routes définies dans activitiesRouter seront accessibles sous /api/activities
app.use('/api/activities', activitiesRouter);

// ERREUR 404 : l'URL demandée n'existe pas dans notre API
// Express teste les routes dans l'ordre où elles sont écrites dans ce fichier.
// Ce bloc est placé APRÈS toutes les routes : on arrive donc ici seulement
// si AUCUNE route au-dessus ne correspond à l'URL demandée.
// Exemple : http://localhost:3000/api/utilisateurs
// app.use() sans adresse s'applique à toutes les URL et à toutes les méthodes (GET, POST, PUT, DELETE)
app.use((req, res) => {
    const message = "Impossible de trouver la ressource demandee ! donc essaye de trouver par toi meme debile va";

    // res.status(404) choisit le code HTTP 404 (Not Found = « non trouvé »)
    // .json() envoie ensuite le message au client, au format JSON
    res.status(404).json({ error: message });
});

// On démarre le serveur et on lui dit d'écouter sur le port défini
// La fonction callback s'exécute une seule fois au démarrage pour confirmer que ça tourne
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
