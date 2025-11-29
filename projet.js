// Déclaration de la variable qui stockera le mot à deviner.
let MOT_A_DEVINER = "";
// Déclaration de la variable qui stocke l'index de la tentative en cours (commence à 0).
let tentativeActuelle = 0;
// Tableau qui stockera les éléments DOM de chaque ligne/tentative du jeu (pour la grille).
let tousLesMots = [];
// Tableau qui stocke les lettres correctement placées et devinées (initialisé avec 'null' pour les lettres inconnues).
let lettresCorrectes = [];
// Ensemble (Set) pour stocker les lettres qui ont été trouvées (correctement placées ou présentes dans le mot).
let lettresTrouvees = new Set();
// Objet pour suivre l'état d'utilisation des indices (taille, première lettre, dernière lettre).
let indiceUtilise = {
    taille: false, // Indique si l'indice sur la taille a été utilisé.
    premiere: false, // Indique si l'indice sur la première lettre a été utilisé.
    derniere: false // Indique si l'indice sur la dernière lettre a été utilisé.
};
// Variable pour stocker le score du joueur.
let score = 0;
// Variable pour stocker le nom du joueur actuel.
let currentPlayer = "";
// Indicateur pour savoir si le nom du joueur a été défini lors de la session.
let playerNameChanged = false;

// Fonction exécutée lorsque le DOM (la structure HTML) est entièrement chargé.
document.addEventListener('DOMContentLoaded', function() {
    // Récupération du bouton pour démarrer le jeu (après la saisie du nom).
    const startGameBtn = document.getElementById("start-game-btn"); // ID corrigé
    // Récupération du champ de saisie pour le nom du joueur.
    const playerNameInput = document.getElementById("player-name-input");
    // Récupération du bouton "Let's play" (qui lance le jeu après la configuration du joueur).
    const boutton = document.getElementById("boutton");
    // Récupération de la barre latérale contenant les boutons d'indices.
    const indicesSidebar = document.getElementById("indices-sidebar");
    // Récupération du bouton d'indice de la taille du mot.
    const indiceTaille = document.getElementById("indice-taille");
    // Récupération du bouton d'indice de la première lettre.
    const indicePremiere = document.getElementById("indice-premiere");
    // Récupération du bouton d'indice de la dernière lettre.
    const indiceDerniere = document.getElementById("indice-derniere");
    
    // Cacher les éléments au début
    // Cache initialement la barre latérale des indices.
    indicesSidebar.style.display = "none";
    // Cache initialement le bouton "Let's play".
    boutton.style.display = "none";
    
    // Événement pour démarrer avec le nom
    // Ajoute un écouteur d'événement au clic du bouton de démarrage du jeu.
    startGameBtn.addEventListener("click", function() {
        // Récupère la valeur du champ du nom et supprime les espaces blancs inutiles (trim).
        const playerName = playerNameInput.value.trim();
        // Vérifie si le nom est vide.
        if (playerName === "") {
            // Affiche un message d'erreur temporaire.
            afficherMessageTemporaire("Veuillez entrer votre nom");
            // Met le focus sur le champ de saisie du nom.
            playerNameInput.focus();
            // Arrête l'exécution de la fonction.
            return;
        }
        
        // Stocke le nom du joueur.
        currentPlayer = playerName;
        // Met l'indicateur de changement de nom à true.
        playerNameChanged = true;
        
        // Masquer la configuration du joueur
        // Ajoute la classe 'hidden' pour masquer l'interface de saisie du nom.
        document.getElementById("player-setup").classList.add("hidden");
        
        // Afficher le bouton Let's play
        // Affiche le bouton "Let's play" (qui lance la partie).
        boutton.style.display = "block"; // Correction ici
        
        // Afficher le nom et score du joueur
        // Met à jour le contenu du nom du joueur affiché.
        document.getElementById("player-name").textContent = currentPlayer;
        // Rend visible l'affichage du nom et du score du joueur.
        document.getElementById("player-display").classList.add("visible");
        
        // Mettre à jour le score
        // Appelle la fonction pour mettre à jour l'affichage du score (qui est 0 au début).
        mettreAJourScore();
        
        // Log dans la console pour le débogage.
        console.log("Joueur configuré:", currentPlayer);
    });

    // Événement pour démarrer le jeu
    // Ajoute un écouteur d'événement au clic du bouton "Let's play".
    boutton.addEventListener("click", demarrerJeu);

    // Gestion des indices
    // Ajoute un écouteur au clic pour l'indice de la taille.
    indiceTaille.addEventListener("click", function() {
        // Vérifie si un mot est à deviner ET si l'indice n'a pas déjà été utilisé.
        if (MOT_A_DEVINER && !indiceUtilise.taille) {
            // Affiche un message temporaire avec la longueur du mot.
            afficherMessageIndice(`Le mot à deviner contient ${MOT_A_DEVINER.length} lettres`);
            // Désactive le bouton d'indice.
            this.disabled = true;
            // Réduit l'opacité du bouton pour indiquer qu'il est utilisé.
            this.style.opacity = "0.5";
            // Met à jour l'état d'utilisation de cet indice.
            indiceUtilise.taille = true;
        }
    });

    // Ajoute un écouteur au clic pour l'indice de la première lettre.
    indicePremiere.addEventListener("click", function() {
        // Vérifie si un mot est à deviner ET si l'indice n'a pas déjà été utilisé.
        if (MOT_A_DEVINER && !indiceUtilise.premiere) {
            // Affiche un message temporaire avec la première lettre (en majuscule).
            afficherMessageIndice(`Le mot commence par la lettre "${MOT_A_DEVINER[0].toUpperCase()}"`);
            // Désactive le bouton d'indice.
            this.disabled = true;
            // Réduit l'opacité du bouton pour indiquer qu'il est utilisé.
            this.style.opacity = "0.5";
            // Met à jour l'état d'utilisation de cet indice.
            indiceUtilise.premiere = true;
            
            // Pré-remplit la première case de la grille avec la première lettre.
            preRemplirLettre(0, MOT_A_DEVINER[0]);
        }
    });

    // Ajoute un écouteur au clic pour l'indice de la dernière lettre.
    indiceDerniere.addEventListener("click", function() {
        // Vérifie si un mot est à deviner ET si l'indice n'a pas déjà été utilisé.
        if (MOT_A_DEVINER && !indiceUtilise.derniere) {
            // Récupère la dernière lettre.
            const derniereLettre = MOT_A_DEVINER[MOT_A_DEVINER.length - 1];
            // Affiche un message temporaire avec la dernière lettre (en majuscule).
            afficherMessageIndice(`Le mot se termine par la lettre "${derniereLettre.toUpperCase()}"`);
            // Désactive le bouton d'indice.
            this.disabled = true;
            // Réduit l'opacité du bouton pour indiquer qu'il est utilisé.
            this.style.opacity = "0.5";
            // Met à jour l'état d'utilisation de cet indice.
            indiceUtilise.derniere = true;
            
            // Pré-remplit la dernière case de la grille avec la dernière lettre.
            preRemplirLettre(MOT_A_DEVINER.length - 1, derniereLettre);
        }
    });

    // Entrée pour valider le nom
    // Ajoute un écouteur pour la touche "keypress" (y compris "Enter") sur le champ du nom.
    playerNameInput.addEventListener("keypress", function(e) {
        // Vérifie si la touche pressée est "Enter".
        if (e.key === "Enter") {
            // Simule un clic sur le bouton de démarrage (pour valider le nom).
            startGameBtn.click();
        }
    });
    
    // Focus automatique sur le champ nom au chargement
    // Met le focus sur le champ de saisie du nom au chargement de la page.
    playerNameInput.focus();
});

// Fonction pour démarrer le jeu après la configuration du joueur.
function demarrerJeu() {
    // Récupère le conteneur principal du jeu.
    const gameContainer = document.querySelector(".game-container");
    // Récupère tous les éléments qui ont la classe "tile" (probablement des tuiles de la grille initiale).
    const tiles = document.querySelectorAll(".tile");
    // Récupère le bouton "Let's play".
    const boutton = document.getElementById("boutton");
    // Récupère la barre latérale des indices.
    const indicesSidebar = document.getElementById("indices-sidebar");
    
    // Masquer l'écran d'accueil
    // Cache le conteneur principal du jeu.
    gameContainer.style.display = "none";
    // Cache les tuiles de la grille initiale.
    tiles.forEach(tile => tile.style.display = "none");
    // Cache le bouton "Let's play".
    boutton.style.display = "none";
    
    // Afficher les indices
    // Affiche la barre latérale des indices.
    indicesSidebar.style.display = "flex";

    // Réinitialiser les indices
    // Appelle la fonction pour remettre les indices à l'état non utilisé.
    reinitialiserIndices();
    
    // Commencer le jeu
    // Appelle la fonction principale pour commencer la partie (charger le mot et la grille).
    commencerLeJeu();
}

// Fonction pour réinitialiser l'état des boutons d'indices.
function reinitialiserIndices() {
    // Récupère les boutons d'indices.
    const indiceTaille = document.getElementById("indice-taille");
    const indicePremiere = document.getElementById("indice-premiere");
    const indiceDerniere = document.getElementById("indice-derniere");
    
    // Vérifie si les éléments existent dans le DOM.
    if (indiceTaille && indicePremiere && indiceDerniere) {
        // Réactive les boutons.
        indiceTaille.disabled = false;
        indicePremiere.disabled = false;
        indiceDerniere.disabled = false;
        
        // Remet l'opacité à la normale.
        indiceTaille.style.opacity = "1";
        indicePremiere.style.opacity = "1";
        indiceDerniere.style.opacity = "1";
    }
    
    // Réinitialise l'objet de suivi de l'utilisation des indices.
    indiceUtilise = {
        taille: false,
        premiere: false,
        derniere: false
    };
}

// Fonction pour afficher un message d'indice temporaire.
function afficherMessageIndice(message) {
    // Crée un nouvel élément div pour le message.
    const messageIndice = document.createElement("div");
    // Ajoute une classe pour le style.
    messageIndice.className = "message-indice";
    // Définit le contenu du message.
    messageIndice.textContent = message;
    // Applique un style CSS pour le positionner et le formater.
    messageIndice.style.cssText = `
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 15px 30px;
        border-radius: 10px;
        font-size: 18px;
        font-weight: bold;
        z-index: 1000;
        border: 2px solid #4CAF50;
    `;
    
    // Ajoute le message au corps du document.
    document.body.appendChild(messageIndice);
    
    // Définit un minuteur pour supprimer le message après 3 secondes (3000 ms).
    setTimeout(() => {
        messageIndice.remove();
    }, 3000);
}

// Fonction pour pré-remplir une lettre dans la grille suite à l'utilisation d'un indice.
function preRemplirLettre(position, lettre) {
    // Parcourt toutes les lignes/tentatives (tousLesMots).
    tousLesMots.forEach((cell, index) => {
        // Ne modifie que la tentative actuelle et les tentatives futures.
        if (index >= tentativeActuelle) {
            // Récupère tous les champs d'entrée (inputs) de cette ligne.
            const inputs = cell.querySelectorAll("input");
            // Vérifie si le champ d'entrée à la position donnée existe.
            if (inputs[position]) {
                // Définit la valeur de l'input avec la lettre (en majuscule).
                inputs[position].value = lettre.toUpperCase();
                // Stocke la lettre dans le tableau des lettres trouvées correctement placées.
                lettresCorrectes[position] = lettre;
                // Ajoute la lettre à l'ensemble des lettres trouvées.
                lettresTrouvees.add(lettre);
                
                // Applique le style 'vert' pour indiquer que c'est une lettre correcte.
                inputs[position].style.backgroundColor = "green";
                inputs[position].style.color = "white";
                
                // Si c'est la ligne actuelle, désactive le champ pour empêcher la modification.
                if (index === tentativeActuelle) {
                    inputs[position].disabled = true;
                }
            }
        }
    });
    
    // Met à jour les autres lignes pour refléter l'indice (potentiellement redondant, mais assure la cohérence).
    mettreAJourLettresCorrectes();
}

// Fonction pour charger le mot à deviner et initialiser le jeu.
function commencerLeJeu() {
    // Utilise l'API Fetch pour charger un fichier JSON (supposément une liste de mots).
    fetch('p.json')
    // Traite la réponse pour vérifier si elle est OK.
    .then(response => {
        // Si la réponse n'est pas réussie (ex: fichier non trouvé).
        if (!response.ok) {
            // Lance une erreur.
            throw new Error('Erreur de chargement du fichier');
        }
        // Convertit le corps de la réponse en objet JSON.
        return response.json();
    })
    // Traite la liste de mots récupérée.
    .then(mots => {
        
        // Sélectionne un mot aléatoirement dans la liste et le met en minuscules.
        MOT_A_DEVINER = mots[Math.floor(Math.random() * mots.length)].toLowerCase();
        // Log le mot à deviner (pour le développeur).
        console.log("Mot à deviner:", MOT_A_DEVINER);
    
    // Appelle la fonction pour construire la grille de jeu.
    initialiserJeu();
})}

// Fonction pour initialiser la grille de jeu.
function initialiserJeu() {
    // Réinitialise la tentative actuelle à 0.
    tentativeActuelle = 0;
    // Crée un nouveau tableau de lettres correctes avec la taille du mot, rempli de 'null'.
    lettresCorrectes = new Array(MOT_A_DEVINER.length).fill(null);
    // Vide l'ensemble des lettres trouvées.
    lettresTrouvees.clear();
    // Vide le tableau des lignes de mots.
    tousLesMots = [];
    
    // Récupère l'élément de la grille.
    const grille = document.getElementById("grille");
    // Vide le contenu HTML de la grille (pour commencer une nouvelle partie).
    grille.innerHTML = '';
    
    // Boucle pour créer les 6 tentatives/lignes de la grille.
    for (let i = 0; i < 6; i++) {
        // Crée l'élément de liste (li) pour la cellule/ligne.
        const cell = document.createElement("li");
        cell.className = "cell";
        
        // Crée le conteneur décoratif pour les inputs.
        const celldeco = document.createElement("div");
        celldeco.className = "celldeco";
        // Stocke l'index de la tentative dans un attribut de données.
        celldeco.dataset.tentative = i;
        
        // Boucle pour créer les champs d'entrée (inputs) pour chaque lettre du mot.
        for (let j = 0; j < MOT_A_DEVINER.length; j++) {
            // Crée le champ d'entrée.
            const input = document.createElement("input");
            input.type = "text";
            input.className = "deco";
            // Limite la saisie à un seul caractère.
            input.maxLength = "1";
            // Stocke la position de la lettre.
            input.dataset.position = j;
            // Stocke l'index de la tentative.
            input.dataset.tentative = i;
            
            // Si une lettre a déjà été trouvée (suite à un indice).
            if (lettresCorrectes[j] !== null) {
                // Rempli le champ.
                input.value = lettresCorrectes[j].toUpperCase();
                // Désactive le champ.
                input.disabled = true;
                // Applique le style vert.
                input.style.backgroundColor = "green";
                input.style.color = "white";
            }
            
            // Ajoute l'input au conteneur décoratif.
            celldeco.appendChild(input);
        }
        
        // Ajoute le conteneur décoratif à la cellule/ligne.
        cell.appendChild(celldeco);
        // Ajoute la cellule à la grille.
        grille.appendChild(cell);
        // Assure que la cellule est visible.
        cell.style.display = "block";
        // Ajoute l'élément de la ligne au tableau de suivi.
        tousLesMots.push(cell);
    }
    
    // Utilise un petit délai pour s'assurer que le DOM est prêt avant d'activer la première ligne.
    setTimeout(() => {
        // Active la première ligne (index 0).
        activerLigne(0);
    }, 100);
}