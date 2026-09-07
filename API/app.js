// On importe le module express depuis node_modules
// Express est un framework qui facilite la création de serveurs web
import express from 'express';

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

// On démarre le serveur et on lui dit d'écouter sur le port défini
// La fonction callback s'exécute une seule fois au démarrage pour confirmer que ça tourne
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
