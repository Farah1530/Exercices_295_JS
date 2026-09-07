// Ce fichier simule une base de données d'activités
// En réalité on utiliserait une vraie base de données (MySQL, MongoDB, etc.)
// Ici on stocke les données directement dans un tableau JavaScript

// Chaque activité a 4 propriétés :
// - id        : identifiant unique (nombre entier)
// - name      : nom de l'activité (texte)
// - startDate : date de début (texte au format YYYY-MM-DD)
// - duration  : durée en minutes (nombre entier)
let activities = [
    {
        id: 1,
        name: "Cours de natation",
        startDate: "2026-09-01",
        duration: 60,
    },
    {
        id: 2,
        name: "Atelier peinture",
        startDate: "2026-09-05",
        duration: 90,
    },
    {
        id: 3,
        name: "Football junior",
        startDate: "2026-09-10",
        duration: 120,
    },
    {
        id: 4,
        name: "Yoga débutants",
        startDate: "2026-09-15",
        duration: 45,
    },
    {
        id: 5,
        name: "l'activité amiin",
        startDate: "2026-08-15",
        durantion: 60,
    }
];

// On exporte le tableau pour pouvoir l'utiliser dans d'autres fichiers
export default activities;
