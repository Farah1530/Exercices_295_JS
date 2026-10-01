
// FONCTIONS DE VALIDATION (exercice 6)
//
// Ce fichier regroupe les petites fonctions qui verifient les donnees
// envoyees par le client, AVANT de les donner a la base de donnees.
// C'est l'organisation de l'exemple Contacts de la prof (helper.js).
//
// Chaque fonction renvoie true si la valeur est correcte, false sinon.



// La duree maximale demandee par la consigne : elle doit etre INFERIEURE a 144
const MAX_DURATION = 144;


// Verifie qu'un id est valide : un nombre entier plus grand que 0.
// Exemples :
//   isValidId(5)     -> true
//   isValidId(NaN)   -> false  (Number("abc") donne NaN, "Not a Number")
//   isValidId(2.5)   -> false  (pas un entier)
//   isValidId(0)     -> false  (les id MySQL commencent a 1)
function isValidId(value) {
    return Number.isInteger(value) && value > 0;
}


// Verifie qu'une valeur est vide.
// Une valeur est vide si elle n'a pas ete envoyee (undefined ou null)
// ou si c'est un texte qui ne contient que des espaces.
// String(value) transforme la valeur en texte, pour pouvoir aussi tester un nombre.
// trim() enleve les espaces au debut et a la fin : "   " devient "".
function isEmpty(value) {
    return value === undefined || value === null || String(value).trim() === '';
}


// Verifie que la duree est un nombre strictement inferieur a 144.
// Number() transforme la duree en nombre, au cas ou elle arrive sous forme de texte ("60").
// Si ce n'est pas un nombre, Number() donne NaN, et NaN < 144 est faux : la duree est refusee.
function isValidDuration(duration) {
    return Number(duration) < MAX_DURATION;
}


// -- EXERCICE 7 : LES PARAMETRES DE L'URL

// La longueur minimale du mot recherche, demandee par la consigne
const MIN_SEARCH_LENGTH = 3;


// Verifie que le mot recherche dans le nom est assez long.
// Un mot trop court ramenerait beaucoup trop de resultats.
// Exemples :
//   isValidSearchName("ski")   -> true
//   isValidSearchName("sk")    -> false  (2 caracteres seulement)
//   isValidSearchName("  s  ") -> false  (trim() enleve les espaces : il reste 1 caractere)
function isValidSearchName(name) {
    return String(name).trim().length >= MIN_SEARCH_LENGTH;
}


// Verifie que la limite est un nombre entier plus grand que 0.
// C'est la meme regle que pour un id : on ne peut pas demander 0, -5 ou "abc" resultats.
function isValidLimit(value) {
    return Number.isInteger(value) && value > 0;
}


// On exporte les fonctions pour pouvoir les utiliser dans les routes
export { isValidId, isEmpty, isValidDuration, isValidSearchName, isValidLimit, MAX_DURATION, MIN_SEARCH_LENGTH };
