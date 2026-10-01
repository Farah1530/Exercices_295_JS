
// ACCES A LA BASE DE DONNEES MYSQL
//
// Ce fichier contient TOUTES les requetes SQL du projet.
// Les routes (routes/activities.js) ne parlent jamais directement a MySQL :
// elles appellent les fonctions de ce fichier.
// C'est l'organisation de l'exemple Contacts de la prof (db/db-contacts.js).
//
// EXERCICE 6 : updateActivity renvoie null et deleteActivity renvoie false
// quand aucune activite n'a l'id demande. Les routes s'en servent pour
// renvoyer une erreur 404.



// mysql2/promise permet d'ecrire les requetes SQL avec async/await
import mysql from 'mysql2/promise';

// dotenv lit le fichier .env et met son contenu dans process.env.
// Cette ligne doit etre AVANT createPool(), sinon les parametres seraient encore vides.
// (La prof utilise process.loadEnvFile(), qui fait exactement la meme chose,
// integre directement a Node. dotenv est un paquet npm qui fait le meme travail.)
import 'dotenv/config';


// createPool() cree un "pool" de connexions : un reservoir de connexions
// a la base de donnees, qui sont reutilisees d'une requete a l'autre.
// Le pool est cree une seule fois, ici, et il est partage par toutes les fonctions du fichier.
// C'est plus rapide que d'ouvrir puis fermer une connexion a chaque requete.
//
// EXERCICE 6 : TOUS les parametres de connexion viennent du fichier .env.
// process.env.DB_HOST veut dire "la valeur de DB_HOST ecrite dans .env".
// Avantage : pour changer de serveur ou de mot de passe, on modifie .env,
// sans toucher au code, et aucune information sensible ne part sur GitHub.
const poolConn = mysql.createPool({
    // L'adresse du serveur MySQL (ici localhost = notre propre PC)
    host: process.env.DB_HOST,

    // L'utilisateur MySQL avec lequel on se connecte
    user: process.env.DB_USER,

    // Le mot de passe
    password: process.env.DB_PASSWORD,

    // Le port du serveur MySQL (3306 par defaut)
    port: process.env.DB_PORT,

    // La base de donnees creee par le script schema.sql
    database: process.env.DB_NAME,

    // Sans cette ligne, mysql2 transforme les dates en objet Date JavaScript,
    // qui est en UTC : minuit le 01.09 en Suisse devient 22h00 le 31.08,
    // et l'API renverrait une date decalee d'un jour.
    // dateStrings garde la date telle quelle, en texte : '2026-09-01'
    dateStrings: true,
});


// "db" est un objet qui regroupe toutes les operations que notre application
// peut faire sur la base de donnees.
// On les appelle ensuite avec un point : db.getAllActivities(), db.createActivity()...
const db = {

    // ---------------------------------------------------------
    // LIRE toutes les activites
    // ---------------------------------------------------------
    // EXERCICE 7 : cette fonction accepte maintenant 2 parametres facultatifs,
    // "name" (un mot a chercher dans le nom) et "limit" (le nombre maximum de resultats).
    // Les accolades { name, limit } sortent les 2 valeurs de l'objet recu.
    // Le "= {}" a la fin veut dire : si la route n'envoie aucun parametre,
    // on utilise un objet vide, et la fonction renvoie toutes les activites comme avant.
    getAllActivities: async ({ name, limit } = {}) => {
        // On construit la requete SQL morceau par morceau, selon les parametres recus.
        // Au depart, la requete de base : toutes les activites
        let sql = 'SELECT * FROM activities';

        // Le tableau des valeurs qui remplaceront les "?" de la requete
        const valeurs = [];

        // CAS 1 : chercher les activites dont le nom contient un mot.
        // LIKE compare du texte, et le signe % veut dire "n'importe quels caracteres".
        // '%ski%' trouve donc "Cours de ski", "Ski de fond" ou "Initiation au ski alpin".
        if (name !== undefined) {
            sql += ' WHERE name LIKE ?';
            valeurs.push(`%${name}%`);
        }

        // CAS 3 : limiter le nombre de resultats.
        // LIMIT 3 renvoie seulement les 3 premieres lignes trouvees.
        if (limit !== undefined) {
            sql += ' LIMIT ?';
            valeurs.push(limit);
        }

        // poolConn.execute() envoie la requete SQL a MySQL, avec une connexion libre du pool.
        // Le 2e argument contient les valeurs des "?" : jamais collees dans le texte
        // de la requete, pour eviter les injections SQL.
        // execute() renvoie toujours un tableau [rows, fields] :
        // on ne garde que "rows" = les lignes trouvees dans la table.
        const [rows] = await poolConn.execute(sql, valeurs);

        // On renvoie les lignes a la route qui a appele cette fonction
        return rows;
    },



    // LIRE une seule activite, a partir de son id

    getActivityById: async (id) => {
        // Le "?" est un espace reserve, remplace par la valeur du tableau [id].
        // On ne colle jamais l'id directement dans le texte de la requete :
        // ca evite les injections SQL (du code SQL glisse par un utilisateur malveillant)
        const [rows] = await poolConn.execute('SELECT * FROM activities WHERE id = ?', [id]);

        // rows est un tableau : l'activite trouvee est a la position 0
        return rows[0];
    },



    // AJOUTER une activite

    // Les accolades { name, startDate, duration } recoivent un objet
    // et en sortent directement les 3 valeurs (c'est la destructuration)
    createActivity: async ({ name, startDate, duration }) => {
        // INSERT INTO ajoute une nouvelle ligne dans la table.
        // On ne donne pas l'id : la colonne est AUTO_INCREMENT, MySQL le choisit seul.
        // Les 3 "?" sont remplis dans l'ordre par les 3 valeurs du tableau
        const [result] = await poolConn.execute(
            'INSERT INTO activities (name, startDate, duration) VALUES (?, ?, ?)',
            [name, startDate, duration]
        );

        // result.insertId contient l'id que MySQL vient de generer.
        // On renvoie l'activite complete, avec son nouvel id
        return { id: result.insertId, name, startDate, duration };
    },



    // MODIFIER une activite

    // On recoit 2 choses : l'id de l'activite a modifier, et ses nouvelles valeurs
    updateActivity: async (id, { name, startDate, duration }) => {
        // UPDATE modifie la ligne dont l'id correspond.
        // Attention : sans le WHERE, TOUTES les lignes de la table seraient modifiees !
        // On garde le resultat de la requete dans "result"
        const [result] = await poolConn.execute(
            'UPDATE activities SET name = ?, startDate = ?, duration = ? WHERE id = ?',
            [name, startDate, duration, id]
        );

        // affectedRows = nombre de lignes trouvees par le WHERE.
        // 0 veut dire qu'aucune activite n'a cet id : on renvoie null
        if (result.affectedRows === 0) {
            return null;
        }

        // On renvoie l'activite avec ses nouvelles valeurs (l'id, lui, ne change pas)
        return { id, name, startDate, duration };
    },



    // SUPPRIMER une activite

    deleteActivity: async (id) => {
        // DELETE FROM supprime la ligne dont l'id correspond.
        // Attention : sans le WHERE, TOUTE la table serait videe !
        const [result] = await poolConn.execute('DELETE FROM activities WHERE id = ?', [id]);

        // Renvoie true si une ligne a ete supprimee,
        // false si aucune activite n'avait cet id
        return result.affectedRows > 0;
    },
};


// On exporte l'objet "db" pour pouvoir l'utiliser dans les routes.
// Les accolades { db } exportent la variable sous son nom :
// il faudra donc aussi ecrire { db } au moment de l'importer.
export { db };
