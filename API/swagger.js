// =============================================================
// CONFIGURATION DE SWAGGER : LA DOCUMENTATION DE L'API
//
// Swagger sert a documenter une API REST. Il fabrique une page web ou l'on voit
// toutes les routes, ce qu'elles attendent et ce qu'elles renvoient,
// et ou l'on peut meme les essayer, sans Postman.
//
// Deux paquets travaillent ensemble :
// - swagger-jsdoc      lit les commentaires speciaux ecrits au-dessus des routes
//                      (ceux qui commencent par @openapi dans routes/activities.js)
//                      et fabrique avec eux un objet JSON au format OpenAPI
// - swagger-ui-express prend ce JSON et affiche la page web. Il est appele dans app.js
//
// Meme organisation que le fichier swagger.js de l'exemple Contacts de la prof.
// =============================================================


// On importe swagger-jsdoc, installe avec "npm install swagger-jsdoc"
import swaggerJsdoc from 'swagger-jsdoc';


// "options" contient tout le parametrage general de notre documentation
const options = {
    definition: {
        // La version du standard OpenAPI que l'on respecte
        openapi: '3.0.4',

        // Les informations affichees tout en haut de la page de documentation
        info: {
            title: 'Gestion des activites du CPNV',
            description: "API REST pour afficher, ajouter, modifier et supprimer des activites",
            version: '1.0.0',
        },

        // L'adresse de notre serveur.
        // C'est a cette adresse que la page enverra les requetes
        // quand on cliquera sur le bouton "Try it out"
        servers: [
            {
                url: 'http://localhost:3000/',
            },
        ],

        // Un "schema" decrit a quoi ressemble un objet de notre API.
        // On ecrit une seule fois a quoi ressemble une activite, puis chaque route
        // y fait reference avec $ref, au lieu de tout reecrire a chaque fois.
        components: {
            schemas: {
                activity: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 1,
                            description: "identifiant de l'activite, genere par MySQL",
                        },
                        name: {
                            type: 'string',
                            example: 'Cours de natation',
                            description: "nom de l'activite",
                        },
                        startDate: {
                            type: 'string',
                            format: 'date',
                            example: '2026-09-01',
                            description: 'date de debut, au format AAAA-MM-JJ',
                        },
                        duration: {
                            type: 'integer',
                            example: 60,
                            description: 'duree en minutes, obligatoirement inferieure a 144',
                        },
                    },
                    required: ['id', 'name', 'startDate', 'duration'],
                },
            },
        },
    },

    // Les fichiers dans lesquels swagger-jsdoc va chercher les commentaires @openapi.
    // Le chemin part du dossier d'ou on lance "npm start", c'est-a-dire le dossier API.
    apis: ['./routes/*.js'],
};


// swaggerJsdoc() lit les fichiers indiques ci-dessus et fabrique
// la description complete de l'API, au format JSON
const openApiSpecification = swaggerJsdoc(options);


// On exporte cette description pour pouvoir l'utiliser dans app.js
export { openApiSpecification };
