// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- ÉLÉMENTS DU DOM ---
    const surpriseButton = document.getElementById('surpriseButton');
    const buttonSpan = surpriseButton.querySelector('span'); // Sélectionne le span à l'intérieur du bouton
    const clickCountDisplay = document.getElementById('clickCountDisplay');
    const clickRankDisplay = document.getElementById('clickRank'); // Nouveau
    const loadingOverlay = document.getElementById('loadingOverlay');
    const mainContainer = document.getElementById('mainContainer');
    const progressBar = document.getElementById('progressBar');
    const channelMissingAlert = document.getElementById('channelMissingAlert');
    const body = document.body; // Référence à l'élément body pour changer les classes de thème
    const pageTitle = document.getElementById('pageTitle');
    const pageDescription = document.getElementById('pageDescription');

    // --- DONNÉES ET CONFIGURATION ---
    // La constante YOUTUBE_CHANNELS est maintenant chargée depuis youtube-channels.js
    // S'assurer qu'elle est définie. Si ce n'est pas le cas, cela signifie que
    // youtube-channels.js n'a pas été chargé ou est vide.
    if (typeof YOUTUBE_CHANNELS === 'undefined' || YOUTUBE_CHANNELS.length === 0) {
        // En cas de problème avec la liste des chaînes, on met un placeholder
        // et on affiche l'alerte dès le chargement.
        console.error("YOUTUBE_CHANNELS n'est pas défini ou est vide. Assurez-vous que youtube-channels.js est correctement chargé.");
        channelMissingAlert.classList.add('active');
        surpriseButton.disabled = true; // Désactive le bouton s'il n'y a pas de chaînes
        buttonSpan.textContent = "Pas de chaînes !";
    }

    let clickCount = 0; // Initialisation du compteur de clics
    let intervalId;     // Pour gérer l'intervalle de la barre de progression

    // Définition des paliers de clics et des rangs/thèmes associés
    const clickTiers = [
        { count: 0, rank: 'Bronze', themeClass: 'theme-bronze', buttonText: 'Surprenez-moi !' },
        { count: 25, rank: 'Argent', themeClass: 'theme-silver', buttonText: 'Passez à l\'Argent !' },
        { count: 50, rank: 'Or', themeClass: 'theme-gold', buttonText: 'Atteignez l\'Or !' },
        { count: 100, rank: 'Platine', themeClass: 'theme-platinum', buttonText: 'Direction le Platine !' },
        { count: 250, rank: 'Diamant', themeClass: 'theme-diamond', buttonText: 'Le rang Diamant vous attend !' },
        // Vous pouvez ajouter plus de paliers ici si vous le souhaitez !
        // { count: 500, rank: 'Maître', themeClass: 'theme-master', buttonText: 'Maître des clics !' },
    ];

    // --- FONCTIONS DE GESTION DU COMPTEUR ET DU STYLE ---

    /**
     * Charge le nombre de clics depuis le stockage local du navigateur.
     */
    function loadClickCount() {
        const savedCount = localStorage.getItem('surpriseButtonClickCount');
        if (savedCount) {
            clickCount = parseInt(savedCount, 10);
        }
        updatePageThemeAndAppearance(); // Met à jour l'apparence au chargement
    }

    /**
     * Sauvegarde le nombre de clics actuel dans le stockage local du navigateur.
     */
    function saveClickCount() {
        localStorage.setItem('surpriseButtonClickCount', clickCount);
    }

    /**
     * Détermine le rang et le thème actuel en fonction du nombre de clics.
     * @returns {object} L'objet du palier de clic correspondant.
     */
    function getCurrentClickTier() {
        // Parcours les paliers en ordre décroissant pour trouver le bon rang
        for (let i = clickTiers.length - 1; i >= 0; i--) {
            if (clickCount >= clickTiers[i].count) {
                return clickTiers[i];
            }
        }
        return clickTiers[0]; // Retourne le premier palier (Bronze) par défaut
    }

    /**
     * Met à jour l'affichage du compteur, le rang et applique/retire les classes CSS
     * pour changer le design de la page entière et du bouton.
     */
    function updatePageThemeAndAppearance() {
        clickCountDisplay.textContent = clickCount;

        const currentTier = getCurrentClickTier();
        clickRankDisplay.textContent = currentTier.rank; // Met à jour l'affichage du rang
        buttonSpan.textContent = currentTier.buttonText; // Met à jour le texte du bouton

        // Supprime toutes les classes de thème précédentes du body
        clickTiers.forEach(tier => {
            body.classList.remove(tier.themeClass);
        });

        // Applique la nouvelle classe de thème
        body.classList.add(currentTier.themeClass);

        // Mise à jour de la couleur de la barre de progression (optionnel, mais sympa)
        // Vous pouvez définir ces couleurs dans vos variables CSS pour les thèmes
        // et les récupérer ici si vous le souhaitez. Pour cet exemple, on se base sur --primary-red
        // ou d'autres couleurs spécifiques aux thèmes si vous les mettez dans les variables.
        if (currentTier.themeClass === 'theme-bronze') progressBar.style.backgroundColor = 'var(--bronze-btn-bg)';
        else if (currentTier.themeClass === 'theme-silver') progressBar.style.backgroundColor = 'var(--silver-btn-bg)';
        else if (currentTier.themeClass === 'theme-gold') progressBar.style.backgroundColor = 'var(--gold-btn-bg)';
        else if (currentTier.themeClass === 'theme-platinum') progressBar.style.backgroundColor = 'var(--platinum-btn-bg)';
        else if (currentTier.themeClass === 'theme-diamond') progressBar.style.backgroundColor = 'var(--diamond-btn-bg)';

        // Mise à jour des couleurs de h1 et p directement si non gérées par les variables globales du body.
        // Ou on peut faire en sorte que les thèmes CSS gèrent ça via héritage.
        // Ici, on part du principe que les thèmes CSS gèrent déjà les couleurs de texte.
    }

    // --- FONCTION PRINCIPALE DE REDIRECTION ALÉATOIRE ---

    /**
     * Gère le processus de redirection vers une chaîne YouTube aléatoire.
     * Inclut l'incrémentation du compteur, l'affichage du chargement et la progression.
     */
    function triggerRandomRedirect() {
        // Vérifie si des chaînes YouTube sont configurées (YOUTUBE_CHANNELS vient de youtube-channels.js)
        if (typeof YOUTUBE_CHANNELS === 'undefined' || YOUTUBE_CHANNELS.length === 0) {
            channelMissingAlert.classList.add('active'); // Affiche un message d'alerte
            return; // Arrête la fonction
        }

        // --- GESTION DU COMPTEUR DE CLICS ---
        clickCount++;         // Incrémente le compteur
        saveClickCount();     // Sauvegarde le nouveau nombre
        updatePageThemeAndAppearance(); // Met à jour l'affichage, le rang et le style de la page immédiatement

        // --- GESTION DE L'INTERFACE UTILISATEUR PENDANT LE CHARGEMENT ---
        channelMissingAlert.classList.remove('active'); // Cache l'alerte si elle était visible
        surpriseButton.disabled = true;                // Désactive le bouton pour éviter les clics multiples
        loadingOverlay.classList.add('active');        // Affiche l'overlay de chargement
        mainContainer.classList.add('loading');        // Applique un style au conteneur principal (ex: réduction)

        // --- ANIMATION DE LA BARRE DE PROGESSION ---
        progressBar.style.width = '0%'; // Réinitialise la barre de progression
        let progress = 0;
        // Temps de chargement aléatoire entre 1.5 et 3 secondes pour varier l'expérience
        const totalLoadingTime = Math.random() * 1500 + 1500;

        intervalId = setInterval(() => {
            // Incrémente la progression de manière à atteindre 100% au totalLoadingTime
            progress += (100 / (totalLoadingTime / 100));
            if (progress >= 100) {
                progress = 100;
                clearInterval(intervalId); // Arrête l'intervalle une fois à 100%
            }
            progressBar.style.width = progress + '%'; // Met à jour la largeur de la barre
        }, 100); // Met à jour toutes les 100 millisecondes

        // --- REDIRECTION APRÈS LE DÉLAI DE CHARGEMENT ---
        setTimeout(() => {
            clearInterval(intervalId); // S'assure que l'intervalle est bien stoppé

            // Sélectionne une chaîne aléatoire
            const randomIndex = Math.floor(Math.random() * YOUTUBE_CHANNELS.length);
            const randomChannelUrl = YOUTUBE_CHANNELS[randomIndex];

            // Réinitialise l'interface utilisateur après le chargement
            loadingOverlay.classList.remove('active');
            mainContainer.classList.remove('loading');
            surpriseButton.disabled = false;
            progressBar.style.width = '0%'; // Réinitialise pour le prochain clic

            // Effectue la redirection
            window.location.href = randomChannelUrl;
        }, totalLoadingTime);
    }

    // --- ÉCOUTEURS D'ÉVÉNEMENTS ---

    // Ajoute un écouteur d'événement 'click' au bouton surprise
    surpriseButton.addEventListener('click', triggerRandomRedirect);

    // Charge le nombre de clics et met à jour l'apparence de la page
    // dès que le contenu du DOM est entièrement chargé.
    loadClickCount();
});
