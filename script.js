// script.js

document.addEventListener('DOMContentLoaded', async () => {
    // --- ÉLÉMENTS DU DOM ---
    const surpriseButton = document.getElementById('surpriseButton');
    const buttonSpan = surpriseButton.querySelector('span');
    const clickCountDisplay = document.getElementById('clickCountDisplay');
    const clickRankDisplay = document.getElementById('clickRank');
    const clicksToNextRankDisplay = document.getElementById('clicksToNextRank'); // Nouveau
    const overallProgressBar = document.getElementById('overallProgressBar');   // Nouveau
    const moneyDisplay = document.getElementById('moneyDisplay');               // Nouveau
    const loadingOverlay = document.getElementById('loadingOverlay');
    const mainContainer = document.getElementById('mainContainer');
    const progressBar = document.getElementById('progressBar');
    const channelMissingAlert = document.getElementById('channelMissingAlert');
    const body = document.body;
    const shopContainer = document.getElementById('shopContainer');             // Nouveau
    const openShopBtn = document.getElementById('openShopBtn');                 // Nouveau
    const closeShopBtn = document.getElementById('closeShopBtn');               // Nouveau
    const cosmeticItemsContainer = shopContainer.querySelector('.cosmetic-items'); // Nouveau

    // Mode Développeur
    const devModePanel = document.getElementById('devModePanel');           // Nouveau
    const resetStatsBtn = document.getElementById('resetStatsBtn');         // Nouveau
    const toggleRedirectBtn = document.getElementById('toggleRedirectBtn'); // Nouveau
    const redirectStatus = document.getElementById('redirectStatus');       // Nouveau
    const setMoneyInput = document.getElementById('setMoneyInput');         // Nouveau
    const setMoneyBtn = document.getElementById('setMoneyBtn');             // Nouveau
    const setClicksInput = document.getElementById('setClicksInput');       // Nouveau
    const setClicksBtn = document.getElementById('setClicksBtn');           // Nouveau

    // --- DONNÉES ET CONFIGURATION ---
    // YOUTUBE_CHANNELS est chargé depuis youtube-channels.js.
    // On s'assure qu'il est défini et non vide.
    if (typeof YOUTUBE_CHANNELS === 'undefined' || YOUTUBE_CHANNELS.length === 0) {
        console.error("YOUTUBE_CHANNELS n'est pas défini ou est vide. Assurez-vous que youtube-channels.js est correctement chargé et contient des URLs.");
        channelMissingAlert.classList.add('active');
        surpriseButton.disabled = true;
        buttonSpan.textContent = "Pas de chaînes !";
    }

    let clickCount = 0;
    let money = 0; // Nouvelle variable pour l'argent
    let intervalId;
    let isRedirectEnabled = true; // Pour le mode développeur

    // Définition des paliers de clics et des rangs/thèmes associés
    const clickTiers = [
        { count: 0, rank: 'Bronze', themeClass: 'theme-bronze' },
        { count: 25, rank: 'Argent', themeClass: 'theme-silver' },
        { count: 50, rank: 'Or', themeClass: 'theme-gold' },
        { count: 100, rank: 'Platine', themeClass: 'theme-platinum' },
        { count: 250, rank: 'Diamant', themeClass: 'theme-diamond' },
        { count: 500, rank: 'Maître', themeClass: 'theme-master' }, // Nouveau rang au-delà du diamant
    ];

    // Définition des cosmétiques disponibles dans la boutique
    const cosmetics = [
        { id: 'btn-red', name: 'Bouton Rouge Classique', type: 'button-style', cost: 0, css: { 'background-color': '#ff0000', 'color': 'white', 'border-radius': '12px', 'box-shadow': '0 8px 18px rgba(0, 0, 0, 0.25)' }, equipped: false },
        { id: 'btn-blue', name: 'Bouton Bleu Océan', type: 'button-style', cost: 50, css: { 'background-color': '#007bff', 'color': 'white', 'border-radius': '20px', 'box-shadow': '0 8px 20px rgba(0, 123, 255, 0.4)' }, equipped: false },
        { id: 'btn-green', name: 'Bouton Vert Nature', type: 'button-style', cost: 100, css: { 'background-color': '#28a745', 'color': 'white', 'border-radius': '5px', 'box-shadow': '0 8px 18px rgba(40, 167, 69, 0.3)' }, equipped: false },
        { id: 'btn-gold-glitter', name: 'Bouton Or Scintillant', type: 'button-style', cost: 200, css: { 'background-color': '#ffd700', 'color': '#333', 'border-radius': '50px', 'box-shadow': '0 8px 25px rgba(255, 215, 0, 0.6)' }, equipped: false },
        { id: 'page-rainbow', name: 'Thème Arc-en-Ciel', type: 'page-style', cost: 500, css: { 'background': 'linear-gradient(90deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3)' }, equipped: false }
        // Ajoutez d'autres cosmétiques ici (boutons, arrière-plans, polices, etc.)
    ];

    // --- FONCTIONS DE GESTION DU STOCKAGE LOCAL ---

    /**
     * Charge les données de l'utilisateur (clics, argent, cosmétiques) depuis le LocalStorage.
     */
    function loadUserData() {
        const savedClickCount = localStorage.getItem('surpriseButtonClickCount');
        if (savedClickCount) {
            clickCount = parseInt(savedClickCount, 10);
        }

        const savedMoney = localStorage.getItem('userMoney');
        if (savedMoney) {
            money = parseInt(savedMoney, 10);
        }

        const savedCosmetics = localStorage.getItem('userCosmetics');
        if (savedCosmetics) {
            const parsedCosmetics = JSON.parse(savedCosmetics);
            // Fusionne les cosmétiques sauvegardés avec la liste par défaut pour gérer les nouveaux ajouts
            cosmetics.forEach(defaultCosmetic => {
                const saved = parsedCosmetics.find(sc => sc.id === defaultCosmetic.id);
                if (saved) {
                    defaultCosmetic.purchased = saved.purchased;
                    defaultCosmetic.equipped = saved.equipped;
                }
            });
        }
        updatePageThemeAndAppearance();
        updateMoneyDisplay();
    }

    /**
     * Sauvegarde les données de l'utilisateur dans le LocalStorage.
     */
    function saveUserData() {
        localStorage.setItem('surpriseButtonClickCount', clickCount);
        localStorage.setItem('userMoney', money);
        localStorage.setItem('userCosmetics', JSON.stringify(cosmetics.map(({ id, purchased, equipped }) => ({ id, purchased, equipped }))));
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

        // Applique les cosmétiques équipés
        applyEquippedCosmetics();
    }

    /**
     * Retourne une couleur de barre de progression basée sur la classe de thème.
     * Peut être étendue pour des couleurs plus spécifiques.
     */
    function getProgressBarColorForTier(themeClass) {
        switch (themeClass) {
            case 'theme-bronze': return 'var(--bronze-btn-bg)';
            case 'theme-silver': return 'var(--silver-btn-bg)';
            case 'theme-gold': return 'var(--gold-btn-bg)';
            case 'theme-platinum': return 'var(--platinum-btn-bg)';
            case 'theme-diamond': return 'var(--diamond-btn-bg)';
            case 'theme-master': return '#FF4500'; // Orange Rouge pour Maître
            default: return 'var(--primary-red)';
        }
    }

    /**
     * Met à jour l'affichage de l'argent.
     */
    function updateMoneyDisplay() {
        moneyDisplay.textContent = money;
        renderCosmeticShop(); // Met à jour la boutique pour refléter les fonds
    }

    // --- FONCTIONS DE GESTION DE LA BOUTIQUE ---

    /**
     * Ouvre la boutique de cosmétiques.
     */
    function openShop() {
        shopContainer.classList.add('active');
        renderCosmeticShop();
    }

    /**
     * Ferme la boutique de cosmétiques.
     */
    function closeShop() {
        shopContainer.classList.remove('active');
    }

    /**
     * Rend les articles de cosmétiques dans la boutique.
     */
    function renderCosmeticShop() {
        cosmeticItemsContainer.innerHTML = ''; // Vide le conteneur avant de re-rendre
        cosmetics.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('cosmetic-item');
            if (item.purchased) {
                itemDiv.classList.add('purchased');
            }
            if (item.equipped) {
                itemDiv.classList.add('equipped');
            }

            itemDiv.innerHTML = `
                <h4>${item.name}</h4>
                <p>${item.type === 'button-style' ? 'Style de Bouton' : 'Thème de Page'}</p>
                <p class="cost">${item.cost} <i class="fas fa-coins"></i></p>
                <button class="buy-btn" data-id="${item.id}" ${item.purchased ? 'disabled' : ''}>
                    ${item.purchased ? 'Acheté' : 'Acheter'}
                </button>
            `;

            const buyBtn = itemDiv.querySelector('.buy-btn');
            if (!item.purchased) {
                buyBtn.disabled = (money < item.cost); // Désactive si pas assez d'argent
                buyBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Empêche l'événement de cliquer sur l'itemDiv
                    purchaseCosmetic(item.id);
                });
            } else {
                // Si acheté, change le bouton en "Équiper" ou "Équipé"
                buyBtn.textContent = item.equipped ? 'Équipé' : 'Équiper';
                buyBtn.disabled = false; // Toujours enabled pour équiper/déséquiper
                buyBtn.classList.remove('buy-btn');
                buyBtn.classList.add('equip-btn'); // Nouvelle classe pour les boutons d'équipement

                // Permet de déséquiper si déjà équipé
                buyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleEquipCosmetic(item.id);
                });
            }
            cosmeticItemsContainer.appendChild(itemDiv);
        });
    }

    /**
     * Achète un cosmétique si l'utilisateur a suffisamment d'argent.
     * @param {string} id L'ID du cosmétique à acheter.
     */
    function purchaseCosmetic(id) {
        const item = cosmetics.find(c => c.id === id);
        if (item && !item.purchased && money >= item.cost) {
            money -= item.cost;
            item.purchased = true;
            item.equipped = true; // Équipe automatiquement à l'achat
            saveUserData();
            updateMoneyDisplay();
            renderCosmeticShop(); // Re-rend la boutique
            applyEquippedCosmetics(); // Applique le nouveau cosmétique
            console.log(`Acheté et équipé : ${item.name}`);
        } else if (item && money < item.cost) {
            alert("Pas assez d'argent pour acheter cet article !");
        }
    }

    /**
     * Équipe ou déséquipe un cosmétique acheté.
     * @param {string} id L'ID du cosmétique à équiper/déséquiper.
     */
    function toggleEquipCosmetic(id) {
        const itemToToggle = cosmetics.find(c => c.id === id);
        if (itemToToggle && itemToToggle.purchased) {
            // Si c'est un style de bouton, déséquipe les autres styles de bouton
            if (itemToToggle.type === 'button-style') {
                cosmetics.forEach(c => {
                    if (c.type === 'button-style' && c.id !== id) {
                        c.equipped = false;
                    }
                });
            }
            // Si c'est un style de page, déséquipe les autres styles de page
            if (itemToToggle.type === 'page-style') {
                cosmetics.forEach(c => {
                    if (c.type === 'page-style' && c.id !== id) {
                        c.equipped = false;
                    }
                });
            }

            itemToToggle.equipped = !itemToToggle.equipped; // Inverse l'état équipé

            saveUserData();
            updateMoneyDisplay();
            renderCosmeticShop();
            applyEquippedCosmetics();
            console.log(`${itemToToggle.equipped ? 'Équipé' : 'Déséquipé'} : ${itemToToggle.name}`);
        }
    }

    /**
     * Applique les styles des cosmétiques actuellement équipés.
     */
    function applyEquippedCosmetics() {
        // Réinitialise les styles par défaut du bouton et du corps
        surpriseButton.style = ''; // Efface les styles inline du bouton
        body.style = ''; // Efface les styles inline du body

        let defaultButtonApplied = false;
        let defaultPageThemeApplied = false;

        cosmetics.filter(c => c.equipped).forEach(item => {
            if (item.type === 'button-style') {
                for (const prop in item.css) {
                    surpriseButton.style[prop] = item.css[prop];
                }
                defaultButtonApplied = true;
            } else if (item.type === 'page-style') {
                for (const prop in item.css) {
                    body.style[prop] = item.css[prop];
                }
                defaultPageThemeApplied = true;
            }
        });

        // Si aucun cosmétique de style de bouton n'est équipé, applique le style du thème actuel
        if (!defaultButtonApplied) {
            const currentTier = getCurrentClickTier();
            // Applique la couleur de base du bouton du thème actuel
            surpriseButton.style.backgroundColor = getProgressBarColorForTier(currentTier.themeClass);
            surpriseButton.style.boxShadow = `0 8px 18px ${getProgressBarColorForTier(currentTier.themeClass).replace('rgb', 'rgba').replace(')', ', 0.4)')}`;
            // Autres styles de bouton par défaut si besoin
        }
        // Le thème de page est déjà géré par updatePageThemeAndAppearance via les classes CSS,
        // les cosmétiques de page le surcharge si équipé.
    }


    // --- FONCTION PRINCIPALE DE REDIRECTION ALÉATOIRE ---

    /**
     * Gère le processus de redirection vers une chaîne YouTube aléatoire.
     * Inclut l'incrémentation du compteur, l'ajout d'argent, l'affichage du chargement et la progression.
     */
    function triggerRandomRedirect() {
        if (typeof YOUTUBE_CHANNELS === 'undefined' || YOUTUBE_CHANNELS.length === 0) {
            channelMissingAlert.classList.add('active');
            return;
        }

        // --- GESTION DU COMPTEUR DE CLICS ET DE L'ARGENT ---
        clickCount++;
        money += 5; // Gagne 5 d'argent par clic
        saveUserData();
        updateMoneyDisplay();
        updatePageThemeAndAppearance();

        // Si la redirection est désactivée par le mode développeur, on s'arrête ici
        if (!isRedirectEnabled) {
            console.log("Redirection désactivée par le mode développeur.");
            return; // N'effectue pas le reste de la fonction de redirection
        }

        // --- GESTION DE L'INTERFACE UTILISATEUR PENDANT LE CHARGEMENT ---
        channelMissingAlert.classList.remove('active');
        surpriseButton.disabled = true;
        loadingOverlay.classList.add('active');
        mainContainer.classList.add('loading');

        // --- ANIMATION DE LA BARRE DE PROGESSION ---
        progressBar.style.width = '0%';
        let progress = 0;
        const totalLoadingTime = Math.random() * 1500 + 1500;

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

            window.location.href = randomChannelUrl;
        }, totalLoadingTime);
    }

    // --- FONCTIONS DU MODE DÉVELOPPEUR ---

    /**
     * Vérifie l'adresse IP locale pour activer le mode développeur.
     * C'est une méthode simple, à noter qu'elle n'est pas fiable à 100% pour la sécurité
     * car l'IP locale n'est pas toujours facile à obtenir ou peut être falsifiée.
     * Pour un usage local, c'est suffisant.
     */
    async function checkLocalIpForDevMode() {
        try {
            // Cette méthode est plus fiable mais nécessite un serveur pour des IPs externes
            // Pour l'IP locale, on peut utiliser des astuces ou se fier à une détection simplifiée.
            // Pour un environnement local de développement (ex: localhost, 127.0.0.1), on peut activer directement.
            const localIp = '192.168.1.93'; // L'IP que vous voulez cibler

            // Si vous utilisez un serveur de développement (ex: live-server), l'IP peut être 'localhost' ou '127.0.0.1'
            // window.location.hostname renverra l'IP ou le nom de domaine actuel.
            if (window.location.hostname === localIp || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                devModePanel.classList.add('active');
                console.log("Mode développeur activé car IP locale détectée.");
            } else {
                console.log("Mode développeur désactivé (IP non locale ou non reconnue).");
            }
        } catch (error) {
            console.error("Erreur lors de la vérification de l'IP pour le mode développeur:", error);
        }
    }


    /**
     * Réinitialise toutes les statistiques (clics, argent, cosmétiques).
     */
    function resetStats() {
        if (confirm("Êtes-vous sûr de vouloir réinitialiser toutes vos statistiques (clics, argent, cosmétiques) ? Cette action est irréversible.")) {
            clickCount = 0;
            money = 0;
            cosmetics.forEach(c => {
                c.purchased = false;
                c.equipped = false;
            });
            // Réapplique le style par défaut au bouton
            surpriseButton.style = '';
            saveUserData();
            updateMoneyDisplay();
            updatePageThemeAndAppearance();
            renderCosmeticShop();
            alert("Statistiques réinitialisées !");
        }
    }

    /**
     * Active ou désactive la redirection vers les chaînes YouTube.
     */
    function toggleRedirect() {
        isRedirectEnabled = !isRedirectEnabled;
        redirectStatus.textContent = `Redirection : ${isRedirectEnabled ? 'ACTIVÉE' : 'DÉSACTIVÉE'}`;
        redirectStatus.classList.toggle('disabled', !isRedirectEnabled);
        alert(`Redirection vers les chaînes YouTube ${isRedirectEnabled ? 'activée' : 'désactivée'}.`);
    }

    // --- ÉCOUTEURS D'ÉVÉNEMENTS ---

    surpriseButton.addEventListener('click', triggerRandomRedirect);
    openShopBtn.addEventListener('click', openShop);
    closeShopBtn.addEventListener('click', closeShop);

    // Écouteurs d'événements pour le mode développeur
    resetStatsBtn.addEventListener('click', resetStats);
    toggleRedirectBtn.addEventListener('click', toggleRedirect);
    setMoneyBtn.addEventListener('click', () => {
        const amount = parseInt(setMoneyInput.value, 10);
        if (!isNaN(amount)) {
            money = amount;
            saveUserData();
            updateMoneyDisplay();
            alert(`Argent défini à : ${money}`);
        } else {
            alert("Veuillez entrer un nombre valide pour l'argent.");
        }
    });
    setClicksBtn.addEventListener('click', () => {
        const amount = parseInt(setClicksInput.value, 10);
        if (!isNaN(amount)) {
            clickCount = amount;
            saveUserData();
            updatePageThemeAndAppearance();
            alert(`Clics définis à : ${clickCount}`);
        } else {
            alert("Veuillez entrer un nombre valide pour les clics.");
        }
    });


    // --- INITIALISATION AU CHARGEMENT DE LA PAGE ---
    loadUserData();
    checkLocalIpForDevMode(); // Vérifie l'IP pour le mode développeur au chargement
});
