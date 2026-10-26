
// ACCES A LA TABLE DES UTILISATEURS
//
// Comme db-activities.js, ce fichier contient les requetes SQL.
// Ici, celles qui concernent la table "users" : inscription et recherche
// d'un utilisateur au moment de la connexion.
//
// Meme organisation que le fichier db-users.js de l'exemple Contacts de la prof.



// bcrypt sert a hacher les mots de passe
import bcrypt from 'bcrypt';

// On reutilise le pool de connexions deja cree dans db-activities.js :
// inutile d'ouvrir un deuxieme reservoir de connexions vers la meme base
import { poolConn } from './db-activities.js';


const db_users = {

    // CREER un utilisateur (inscription)

    createUser: async (username, password) => {
        // bcrypt.hash() transforme le mot de passe en une longue suite de caracteres
        // que personne ne peut relire a l'envers, meme en connaissant le resultat.
        // Le 10 est le "cout" du calcul : plus il est eleve, plus le hachage est lent,
        // donc plus il est difficile a attaquer.
        //
        // C'est le point important de l'exercice : on n'enregistre JAMAIS
        // le mot de passe en clair dans la base de donnees.
        const hashPwd = await bcrypt.hash(password, 10);

        // On enregistre le nom d'utilisateur et le mot de passe HACHE
        const [result] = await poolConn.execute(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashPwd]
        );

        // On renvoie l'utilisateur cree, sans son mot de passe
        return { id: result.insertId, username };
    },



    // CHERCHER un utilisateur par son nom (connexion)

    getUserByUserName: async (username) => {
        // Le "?" est remplace par la valeur du tableau : cela evite les injections SQL,
        // exactement comme dans db-activities.js
        const [rows] = await poolConn.execute('SELECT * FROM users WHERE username = ?', [username]);

        // rows[0] vaut undefined si aucun utilisateur ne porte ce nom
        return rows[0];
    },
};


// On exporte l'objet pour pouvoir l'utiliser dans routes/users.js
export { db_users };
