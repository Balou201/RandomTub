// script.js

document.addEventListener('DOMContentLoaded', () => {
    const findChannelButton = document.getElementById('findChannelButton');

    // Fonction pour rediriger vers une chaîne aléatoire
    findChannelButton.addEventListener('click', () => {
        if (typeof YOUTUBE_CHANNELS !== 'undefined' && YOUTUBE_CHANNELS.length > 0) {
            const randomIndex = Math.floor(Math.random() * YOUTUBE_CHANNELS.length);
            const randomChannel = YOUTUBE_CHANNELS[randomIndex];
            
            // Redirige directement l'utilisateur vers la chaîne aléatoire
            window.open(randomChannel, '_blank'); 
            // _blank ouvre le lien dans un nouvel onglet/fenêtre
        } else {
            // Message d'alerte si aucune chaîne n'est trouvée (devrait être rare)
            alert("Aucune chaîne YouTube n'a été trouvée dans la liste. Veuillez vérifier 'youtube-channels.js'.");
        }
    });
});
