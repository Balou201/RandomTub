// script.js

document.addEventListener('DOMContentLoaded', () => {
    const findChannelButton = document.getElementById('findChannelButton');
    const channelLinkDisplay = document.getElementById('channelLink');
    const themeToggleButton = document.getElementById('themeToggleButton');
    const body = document.body;

    let themeClickCount = 0; // Compteur pour les clics sur le bouton de thème
    const themes = ['theme-default', 'theme-dark', 'theme-vibrant', 'theme-blue']; // Liste des thèmes disponibles

    // Fonction pour trouver une chaîne aléatoire (code existant)
    findChannelButton.addEventListener('click', () => {
        if (typeof YOUTUBE_CHANNELS !== 'undefined' && YOUTUBE_CHANNELS.length > 0) {
            const randomIndex = Math.floor(Math.random() * YOUTUBE_CHANNELS.length);
            const randomChannel = YOUTUBE_CHANNELS[randomIndex];
            
            channelLinkDisplay.innerHTML = `Découvrez cette chaîne : <a href="${randomChannel}" target="_blank" rel="noopener noreferrer">${randomChannel}</a>`;
        } else {
            channelLinkDisplay.textContent = "Aucune chaîne YouTube n'a été trouvée dans la liste. Veuillez vérifier 'youtube-channels.js'.";
        }
    });

    // Fonction pour changer le thème
    themeToggleButton.addEventListener('click', () => {
        // Supprime la classe de thème actuelle
        body.classList.remove(...themes); // Supprime toutes les classes de thème existantes

        // Incrémente le compteur et prend le modulo pour boucler à travers les thèmes
        themeClickCount = (themeClickCount + 1) % themes.length;
        
        // Applique la nouvelle classe de thème
        body.classList.add(themes[themeClickCount]);

        // Optionnel: Mettre à jour le texte du bouton de thème pour indiquer le thème actuel
        themeToggleButton.textContent = `Thème : ${getThemeName(themes[themeClickCount])}`;
    });

    // Fonction utilitaire pour obtenir un nom de thème plus lisible
    function getThemeName(themeClass) {
        switch (themeClass) {
            case 'theme-default':
                return 'Par défaut';
            case 'theme-dark':
                return 'Sombre';
            case 'theme-vibrant':
                return 'Vif';
            case 'theme-blue':
                return 'Marin';
            default:
                return 'Inconnu';
        }
    }

    // Initialise le texte du bouton de thème au chargement de la page
    themeToggleButton.textContent = `Thème : ${getThemeName(body.classList[0] || 'theme-default')}`;
});
