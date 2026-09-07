// =============================================================
// CONNEXION A LA BASE DE DONNEES MYSQL
// =============================================================

// mysql2/promise permet d'ecrire des requetes avec async/await
// au lieu d'utiliser des callbacks (plus simple a lire)
import mysql from 'mysql2/promise';

// dotenv lit le fichier .env et met son contenu dans process.env
// Pourquoi ne pas ecrire le mot de passe directement ici ?
// Parce que ce fichier part sur GitHub, alors que .env est ignore par git.
// Un mot de passe publie sur GitHub reste visible dans l'historique,
// meme si on le retire ensuite.
import 'dotenv/config';

// createPool() cree un "reservoir" de connexions reutilisables
// C'est mieux qu'une seule connexion : si plusieurs requetes arrivent
// en meme temps, chacune peut utiliser une connexion libre du pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',

    // Le mot de passe vient du fichier .env, jamais du code
    password: process.env.DB_PASSWORD,

    database: 'app_activities',

    // Sans cette ligne, mysql2 transforme les colonnes DATE en objet Date JavaScript,
    // qui est en UTC : minuit le 01.09 en Suisse devient 22h00 le 31.08 en UTC,
    // et l'API renverrait une date decalee d'un jour.
    // dateStrings garde la date telle quelle, en texte : '2026-09-01'
    dateStrings: true,
});

// On exporte le pool pour pouvoir l'utiliser dans les routes
export default pool;
