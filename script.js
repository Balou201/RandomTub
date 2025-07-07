// script.js

document.addEventListener('DOMContentLoaded', () => {
    const findChannelButton = document.getElementById('findChannelButton');

    findChannelButton.addEventListener('click', () => {
        // Vérifie si YOUTUBE_CHANNELS est défini et n'est pas vide
        if (typeof YOUTUBE_CHANNELS !== 'undefined' && YOUTUBE_CHANNELS.length > 0) {
            const randomIndex = Math.floor(Math.random() * YOUTUBE_CHANNELS.length);
            const randomChannel = YOUTUBE_CHANNELS[randomIndex];
            
            // Ouvre la chaîne YouTube sélectionnée dans un nouvel onglet
            window.open(randomChannel, '_blank'); 
            
        } else {
            // Affiche une alerte si le tableau de chaînes est vide ou non défini
            alert("Oups ! Il semble qu'il n'y ait pas de chaînes YouTube à explorer. Veuillez vérifier le fichier 'youtube-channels.js' ou contacter l'administrateur.");
        }
    });
});
