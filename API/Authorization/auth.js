// =============================================================
// LE GARDIEN DES ROUTES : LA VERIFICATION DU TOKEN
//
// auth est un "middleware" : une fonction qui s'execute AVANT la route.
// Express lui donne 3 parametres :
// - req  : la demande du client
// - res  : la reponse que l'on peut renvoyer
// - next : la fonction a appeler pour dire "tout va bien, continue vers la route"
//
// Si le token est absent, mal ecrit, faux ou expire, on n'arrive jamais
// jusqu'a la route : on repond tout de suite une erreur 401 (Unauthorized),
// qui veut dire "tu n'as pas le droit, identifie-toi d'abord".
//
// Meme principe que le fichier auth.js de l'exemple Contacts de la prof.
// =============================================================


// jsonwebtoken sait fabriquer et verifier des tokens JWT
import jwt from 'jsonwebtoken';

// La cle secrete, lue depuis le fichier .env
import { privateKey } from './private_key.js';


const auth = (req, res, next) => {
    // try = "essaie d'executer ce code"
    try {
        // Le token voyage dans l'en-tete "Authorization" de la requete.
        // Il ressemble a : Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.A1b2C3...
        const authorization = req.headers.authorization;

        // 1er controle : cet en-tete existe-t-il ?
        // S'il n'y a rien, c'est que le client ne s'est pas connecte
        if (!authorization) {
            return res.status(401).json({ error: 'Token manquant' });
        }

        // split(' ') coupe le texte a chaque espace :
        // "Bearer eyJhbGci..." devient le tableau ["Bearer", "eyJhbGci..."]
        const parts = authorization.split(' ');

        // 2e controle : il doit y avoir exactement 2 morceaux,
        // et le premier doit etre le mot "Bearer", qui est le format standard
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ error: 'Format du token invalide' });
        }

        // Le token lui-meme est le 2e morceau du tableau
        const token = parts[1];

        // 3e controle, le plus important.
        // jwt.verify() refait le calcul de la signature avec notre cle secrete.
        // Si le token a ete modifie, s'il a ete signe avec une autre cle,
        // ou si sa date d'expiration est passee, cette ligne provoque une erreur
        // et le programme saute directement dans le catch, tout en bas.
        //
        // decodedToken contient ce qu'on avait mis dedans au moment du login :
        // { userId: 1, iat: 1761500000, exp: 1761503600 }
        // iat = date de creation du token, exp = date d'expiration,
        // comptees en secondes depuis le 1er janvier 1970.
        const decodedToken = jwt.verify(token, privateKey);

        // On range l'identifiant de l'utilisateur dans req.auth,
        // pour que la route qui suit sache QUI fait la demande
        req.auth = {
            userId: decodedToken.userId,
        };

        // next() dit a Express : le controle est passe, tu peux executer la route.
        // Sans cette ligne, la requete resterait bloquee ici pour toujours.
        next();
    } catch (error) {
        // On arrive ici quand jwt.verify() a refuse le token.
        // Le vrai message reste dans le terminal du serveur, pour le developpeur,
        // et le client recoit un message general.
        console.error(error);
        res.status(401).json({ error: 'Token invalide ou expire' });
    }
};


// On exporte la fonction pour pouvoir la brancher sur les routes
export default auth;
