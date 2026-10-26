// =============================================================
// LA CLE SECRETE DES TOKENS
//
// Cette cle sert a deux choses :
// - signer le token quand un utilisateur se connecte (routes/users.js)
// - verifier ce token a chaque requete (Authorization/auth.js)
//
// Elle est rangee dans le fichier .env, comme le mot de passe MySQL,
// parce que .env n'est jamais envoye sur GitHub.
// Si quelqu'un connaissait cette cle, il pourrait fabriquer de faux tokens
// et se faire passer pour n'importe quel utilisateur.
// =============================================================


// dotenv lit le fichier .env et met son contenu dans process.env
import 'dotenv/config';


// On va chercher la valeur de JWT_PRIVATE_KEY ecrite dans .env
const privateKey = process.env.JWT_PRIVATE_KEY;


// On exporte la cle pour pouvoir l'utiliser dans auth.js et dans routes/users.js
export { privateKey };
