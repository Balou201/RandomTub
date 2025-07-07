// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- ÉLÉMENTS DU DOM ---
    const surpriseButton = document.getElementById('surpriseButton');
    const buttonTextSpan = document.getElementById('buttonText'); // On réutilise cet ID
    const clickCountDisplay = document.getElementById('clickCountDisplay');
    const clickRankDisplay = document.getElementById('clickRank');
    const clicksToNextRankDisplay = document.getElementById('clicksToNextRank');
    const overallProgressBar = document.getElementById('overallProgressBar');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const mainContainer = document.getElementById('mainContainer');
    const progressBar = document.getElementById('progressBar');
    const channelMissingAlert = document.getElementById('channelMissingAlert');
    const body = document.body;

    // --- DONNÉES ET CONFIGURATION ---
    // YOUTUBE_CHANNELS est chargé depuis youtube-channels.js.
    // On s'assure qu'il est défini et non vide.
    if (typeof YOUTUBE_CHANNELS === 'undefined' || YOUTUBE_CHANNELS.length === 0) {
        console.error("YOUTUBE_CHANNELS n'est pas défini ou est vide. Assurez-vous que youtube-channels.js est correctement chargé et contient des URLs.");
        channelMissingAlert.classList.add('active');
        surpriseButton.disabled = true;
        buttonTextSpan.textContent = "Pas de chaînes !"; // Mise à jour du texte du bouton
    }

    let clickCount = 0;
    let intervalId;

    // Définition des paliers de clics et des rangs/thèmes associés
    const clickTiers = [
        { count: 0, rank: 'Bronze', themeClass: 'theme-bronze', buttonText: 'Surprenez-moi !' },
        { count: 25, rank: 'Argent', themeClass: 'theme-silver', buttonText: 'Passez à l\'Argent !' },
        { count: 50, rank: 'Or', themeClass: 'theme-gold', buttonText: 'Atteignez l\'Or !' },
        { count: 100, rank: 'Platine', themeClass: 'theme-platinum', buttonText: 'Direction le Platine !' },
        { count: 250, rank: 'Diamant', themeClass: 'theme-diamond', buttonText: 'Le rang Diamant vous attend !' },
        { count: 500, rank: 'Maître', themeClass: 'theme-master', buttonText: 'Félicitations, Maître !' }, // Nouveau rang
    ];

    // --- FONCTIONS DE GESTION DU STOCKAGE LOCAL ---

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

    // --- FONCTIONS DE GESTION DU THÈME ET DE L'AFFICHAGE ---

    /**
     * Détermine le palier de clic actuel et retourne l'objet correspondant.
     */
    function getCurrentClickTier() {
        for (let i = clickTiers.length - 1; i >= 0; i--) {
            if (clickCount >= clickTiers[i].count) {
                return clickTiers[i];
            }
        }
        return clickTiers[0];
    }

    /**
     * Met à jour le texte du compteur, le rang, la barre de progression et applique le thème de la page.
     */
    function updatePageThemeAndAppearance() {
        clickCountDisplay.textContent = clickCount;

        const currentTier = getCurrentClickTier();
        clickRankDisplay.textContent = currentTier.rank;
        buttonTextSpan.textContent = currentTier.buttonText; // Met à jour le texte du bouton

        // Mise à jour de la barre de progression globale et du texte de clics restants
        const nextTierIndex = clickTiers.indexOf(currentTier) + 1;
        if (nextTierIndex < clickTiers.length) {
            const nextTier = clickTiers[nextTierIndex];
            const clicksNeeded = nextTier.count - clickCount;
            clicksToNextRankDisplay.textContent = Math.max(0, clicksNeeded); // Ne pas afficher de négatif

            const currentTierStart = currentTier.count;
            const nextTierEnd = nextTier.count;
            const progressRange = nextTierEnd - currentTierStart;
            const clicksIntoRange = clickCount - currentTierStart;
            const progressPercentage = (progressRange > 0) ? (clicksIntoRange / progressRange) * 100 : 100;
            overallProgressBar.style.width = `${progressPercentage}%`;
            overallProgressBar.style.backgroundColor = getProgressBarColorForTier(nextTier.themeClass); // Couleur de la barre en fonction du prochain rang
        } else {
            // Dernier rang atteint
            clicksToNextRankDisplay.textContent = 'max';
            overallProgressBar.style.width = '100%';
            overallProgressBar.style.backgroundColor = getProgressBarColorForTier(currentTier.themeClass); // Couleur du rang actuel
        }

        // Retire toutes les classes de thème précédentes du body
        clickTiers.forEach(tier => {
            body.classList.remove(tier.themeClass);
        });
        // Applique la nouvelle classe de thème
        body.classList.add(currentTier.themeClass);
    }

    /**
     * Retourne une couleur de barre de progression basée sur la classe de thème.
     */
    function getProgressBarColorForTier(themeClass) {
        // Ces couleurs doivent correspondre à celles définies dans votre CSS pour les boutons des thèmes
        switch (themeClass) {
            case 'theme-bronze': return 'var(--bronze-btn-bg)';
            case 'theme-silver': return 'var(--silver-btn-bg)';
            case 'theme-gold': return 'var(--gold-btn-bg)';
            case 'theme-platinum': return 'var(--platinum-btn-bg)';
            case 'theme-diamond': return 'var(--diamond-btn-bg)';
            case 'theme-master': return 'var(--master-btn-bg)';
            default: return 'var(--primary-red)';
        }
    }

    // --- FONCTION PRINCIPALE DE REDIRECTION ALÉATOIRE ---

    /**
     * Gère le processus de redirection vers une chaîne YouTube aléatoire.
     * Inclut l'incrémentation du compteur, l'affichage du chargement et la progression.
     */
    function triggerRandomRedirect() {
        if (typeof YOUTUBE_CHANNELS === 'undefined' || YOUTUBE_CHANNELS.length === 0) {
            channelMissingAlert.classList.add('active');
            return;
        }

        // --- GESTION DU COMPTEUR DE CLICS ---
        clickCount++;
        saveClickCount();
        updatePageThemeAndAppearance();

        // --- GESTION DE L'INTERFACE UTILISATEUR PENDANT LE CHARGEMENT ---
        channelMissingAlert.classList.remove('active');
        surpriseButton.disabled = true;
        loadingOverlay.classList.add('active');
        mainContainer.classList.add('loading');

        // --- ANIMATION DE LA BARRE DE PROGESSION ---
        progressBar.style.width = '0%';
        let progress = 0;
        const totalLoadingTime = Math.random() * 1500 + 1500; // Temps de chargement aléatoire entre 1.5 et 3 secondes

        intervalId = setInterval(() => {
            progress += (100 / (totalLoadingTime / 100));
            if (progress >= 100) {
                progress = 100;
                clearInterval(intervalId);
            }
            progressBar.style.width = progress + '%';
        }, 100);

        // --- REDIRECTION APRÈS LE DÉLAI DE CHARGEMENT ---
        setTimeout(() => {
            clearInterval(intervalId);

            const randomIndex = Math.floor(Math.random() * YOUTUBE_CHANNELS.length);
            const randomChannelUrl = YOUTUBE_CHANNELS[randomIndex];

            loadingOverlay.classList.remove('active');
            mainContainer.classList.remove('loading');
            surpriseButton.disabled = false;
            progressBar.style.width = '0%';

            window.location.href = randomChannelUrl; // La redirection est de retour !
        }, totalLoadingTime);
    }

    // --- ÉCOUTEURS D'ÉVÉNEMENTS ---
    surpriseButton.addEventListener('click', triggerRandomRedirect);

    // --- INITIALISATION AU CHARGEMENT DE LA PAGE ---
    loadClickCount(); // Charge les clics et met à jour l'apparence au démarrage
});
