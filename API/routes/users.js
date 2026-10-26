// =============================================================
// LES ROUTES DES UTILISATEURS (exercice 9)
//
// Deux routes seulement :
// - POST /api/users/signup : creer un compte. Le mot de passe est hache.
// - POST /api/users/login  : se connecter. On recoit un token en echange.
//
// Le token recu au login devra ensuite etre envoye a chaque appel
// des routes des activites, qui sont maintenant protegees.
//
// Meme organisation que le fichier users.js de l'exemple Contacts de la prof.
// =============================================================


// express, pour creer le routeur
import express from 'express';

// bcrypt, pour comparer le mot de passe tape avec celui qui est hache dans la base
import bcrypt from 'bcrypt';

// jsonwebtoken, pour fabriquer le token
import jwt from 'jsonwebtoken';

// Les requetes SQL de la table users
import { db_users } from '../db/db-users.js';

// La cle secrete qui sert a signer le token
import { privateKey } from '../Authorization/private_key.js';

// La fonction qui verifie qu'une valeur n'est pas vide (deja ecrite a l'exercice 6)
import { isEmpty } from '../helper.js';


const usersRouter = express.Router();


// CREER UN COMPTE

/**
 * @openapi
 * /api/users/signup:
 *   post:
 *     summary: Cree un compte utilisateur.
 *     description: Enregistre un utilisateur dans la base. Le mot de passe est hache par bcrypt, jamais enregistre en clair.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: farah
 *               password:
 *                 type: string
 *                 example: monMotDePasse
 *             required:
 *               - username
 *               - password
 *     responses:
 *       200:
 *         description: Le compte a bien ete cree.
 *       400:
 *         description: Un champ est vide, ou le nom d utilisateur est deja pris.
 *       500:
 *         description: Erreur interne du serveur ou de la base de donnees.
 */
usersRouter.post('/signup', async (req, res) => {
    try {
        // Le nom d'utilisateur et le mot de passe arrivent dans le body
        const { username, password } = req.body || {};

        // On refuse les champs vides, comme pour les activites a l'exercice 6
        if (isEmpty(username) || isEmpty(password)) {
            return res.status(400).json({ error: "Le nom d'utilisateur et le mot de passe sont obligatoires." });
        }

        // createUser() hache le mot de passe puis enregistre l'utilisateur
        const newUser = await db_users.createUser(username, password);

        res.json({ message: "L'utilisateur " + newUser.username + ' a bien ete cree !', user: newUser });
    } catch (error) {
        console.error(error);

        // La colonne username est UNIQUE dans la base : si le nom existe deja,
        // MySQL refuse l'insertion et renvoie cette erreur precise.
        // C'est le client qui s'est trompe, donc on repond 400 et non 500.
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "Ce nom d'utilisateur est deja pris." });
        }

        res.status(500).json({ error: 'Une erreur interne est survenue.' });
    }
});


// SE CONNECTER

/**
 * @openapi
 * /api/users/login:
 *   post:
 *     summary: Connecte un utilisateur et renvoie un token.
 *     description: Verifie le nom d utilisateur et le mot de passe, puis renvoie un token valable une heure.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: farah
 *               password:
 *                 type: string
 *                 example: monMotDePasse
 *             required:
 *               - username
 *               - password
 *     responses:
 *       200:
 *         description: Connexion reussie, le token est dans la reponse.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Utilisateur connecte
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Un champ est vide.
 *       401:
 *         description: Nom d utilisateur ou mot de passe incorrect.
 *       500:
 *         description: Erreur interne du serveur ou de la base de donnees.
 */
usersRouter.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body || {};

        if (isEmpty(username) || isEmpty(password)) {
            return res.status(400).json({ error: "Le nom d'utilisateur et le mot de passe sont obligatoires." });
        }

        // On cherche l'utilisateur dans la base
        const user = await db_users.getUserByUserName(username);

        // S'il n'existe pas, on repond 401 avec un message general.
        // On ne dit pas "cet utilisateur n'existe pas" : cela renseignerait
        // un attaquant sur les comptes qui existent vraiment.
        if (user === undefined) {
            return res.status(401).json({ error: "Nom d'utilisateur ou mot de passe incorrect." });
        }

        // bcrypt.compare() rehache le mot de passe tape et le compare a celui de la base.
        // On ne peut pas comparer les deux textes directement : le hachage de bcrypt
        // n'est jamais deux fois identique.
        const isPwdValid = await bcrypt.compare(password, user.password);

        if (!isPwdValid) {
            return res.status(401).json({ error: "Nom d'utilisateur ou mot de passe incorrect." });
        }

        // Le mot de passe est bon : on fabrique le token.
        // jwt.sign() prend 3 choses :
        // 1. ce qu'on veut mettre dedans, ici l'id de l'utilisateur
        // 2. la cle secrete, qui sert a le signer
        // 3. les options, ici une duree de validite d'une heure
        //
        // Un token a 3 parties separees par des points : l'en-tete (l'algorithme utilise),
        // les donnees, et la signature. Les donnees ne sont pas secretes, elles sont
        // seulement encodees : c'est la signature qui empeche de les modifier.
        const token = jwt.sign(
            { userId: user.id },
            privateKey,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Utilisateur connecte', token: token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Une erreur interne est survenue.' });
    }
});


// On exporte le routeur pour pouvoir l'utiliser dans app.js
export default usersRouter;
