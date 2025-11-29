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

// Fonction pour activer les champs de saisie d'une ligne spécifique.
function activerLigne(index) {
    // Log dans la console pour le débogage.
    console.log("Activation de la ligne:", index);
    
    // Parcourt toutes les lignes de la grille.
    tousLesMots.forEach((cell, i) => {
        // Récupère les inputs de la ligne.
        const inputs = cell.querySelectorAll("input");
        // Parcourt tous les inputs.
        inputs.forEach(input => {
            // Si la ligne N'EST PAS l'index actuel OU si la lettre a déjà été trouvée via indice.
            if (i !== index || lettresCorrectes[input.dataset.position] !== null) {
                // Désactive l'input.
                input.disabled = true;
                // Définit une couleur de fond désactivée.
                input.style.backgroundColor = "#333";
            } else {
                // Active l'input pour la saisie.
                input.disabled = false;
                // Définit une couleur de fond pour la saisie (noir).
                input.style.backgroundColor = "black";
            }
        });
    });
    
    // Récupère la ligne actuellement activée.
    const currentCell = tousLesMots[index];
    // Récupère les inputs de cette ligne.
    const inputs = currentCell.querySelectorAll("input");
    // Trouve le premier champ d'entrée vide ET non désactivé.
    const firstEmptyInput = Array.from(inputs).find(input => 
        input.value === "" && !input.disabled
    );
    
    // Si un champ vide et actif est trouvé.
    if (firstEmptyInput) {
        // Met le focus dessus.
        firstEmptyInput.focus();
    // Sinon, si la ligne a des champs.
    } else if (inputs.length > 0) {
        // Met le focus sur le premier champ (peut-être pour forcer l'événement de validation).
        inputs[0].focus();
    }
    
    // Ajoute des écouteurs d'événements pour la saisie et les touches de navigation.
    inputs.forEach((input, i) => {
        // Saute les champs désactivés (ceux pré-remplis par indice).
        if (input.disabled) return;
        
        // Gère la saisie d'une lettre.
        input.addEventListener("input", function(e) {
            // Convertit la valeur en majuscule.
            const value = e.target.value.toUpperCase();
            // Met à jour la valeur du champ en majuscule.
            e.target.value = value;
            
            // Si une valeur a été saisie ET que ce n'est pas le dernier champ.
            if (value && i < inputs.length - 1) {
                // Récupère le champ suivant.
                const nextInput = inputs[i + 1];
                // Si le champ suivant n'est pas désactivé.
                if (!nextInput.disabled) {
                    // Déplace le focus vers le champ suivant.
                    nextInput.focus();
                }
            }
            
            // Vérifie si tous les champs de la ligne sont remplis.
            const allFilled = Array.from(inputs).every(inp => inp.value !== "");
            // Si tous sont remplis.
            if (allFilled) {
                // Valide le mot après un court délai.
                setTimeout(() => verifierMot(index), 300);
            }
        });
        
        // Gère les touches du clavier (flèches, Entrée, Backspace).
        input.addEventListener("keydown", function(e) {
            // Gère la flèche Droite.
            if (e.key === "ArrowRight" && i < inputs.length - 1) {
                e.preventDefault(); // Empêche le comportement par défaut (déplacement du curseur dans le champ).
                const nextInput = inputs[i + 1];
                if (!nextInput.disabled) nextInput.focus();
            }
            // Gère la flèche Gauche.
            if (e.key === "ArrowLeft" && i > 0) {
                e.preventDefault();
                const prevInput = inputs[i - 1];
                if (!prevInput.disabled) prevInput.focus();
            }
            
            // Gère la touche Entrée.
            if (e.key === "Enter") {
                e.preventDefault();
                // Valide le mot.
                verifierMot(index);
            }
            
            // Gère la touche Backspace (si le champ est vide).
            if (e.key === "Backspace" && !e.target.value && i > 0) {
                e.preventDefault();
                const prevInput = inputs[i - 1];
                // Si le champ précédent n'est pas désactivé.
                if (!prevInput.disabled) {
                    // Efface la valeur du champ précédent.
                    prevInput.value = "";
                    // Déplace le focus vers le champ précédent.
                    prevInput.focus();
                }
            }
        });
        
        // Gère la sélection du texte lors du focus (pour faciliter l'effacement).
        input.addEventListener("focus", function() {
            this.select();
        });
    });
}

// Fonction principale pour vérifier le mot saisi par le joueur.
function verifierMot(tentativeIndex) {
    // Récupère la ligne actuelle.
    const currentCell = tousLesMots[tentativeIndex];
    // Récupère les inputs de la ligne.
    const inputs = currentCell.querySelectorAll("input");
    
    // Variable pour stocker le mot reconstitué à partir des inputs.
    let motSaisi = "";
    // Indicateur pour savoir si tous les champs sont remplis.
    let tousRemplis = true;
    
    // Boucle pour construire le mot saisi et vérifier le remplissage.
    for (let i = 0; i < inputs.length; i++) {
        // Si un champ est vide.
        if (!inputs[i].value) {
            tousRemplis = false;
            break; // Sort de la boucle
        }
        // Ajoute la lettre (en minuscule) au mot saisi.
        motSaisi += inputs[i].value.toLowerCase();
    }
    
    // Si tous les champs ne sont pas remplis.
    if (!tousRemplis) {
        // Affiche un message d'erreur temporaire.
        afficherMessageTemporaire("Veuillez remplir tous les champs avant de valider");
        return; // Arrête la fonction.
    }
    
    // Vérifie si la longueur du mot correspond à la longueur attendue.
    if (motSaisi.length !== MOT_A_DEVINER.length) {
        // Affiche un message d'erreur temporaire (ne devrait pas se produire si tousRemplis est true).
        afficherMessageTemporaire(`Le mot doit contenir ${MOT_A_DEVINER.length} lettres`);
        return;
    }
    
    // Récupère le conteneur de décoration (pour le remplacer par les spans de couleur).
    const celldeco = currentCell.querySelector(".celldeco");
    // Vide le contenu du conteneur (enlève les inputs).
    celldeco.innerHTML = '';
    
    // Indicateur pour savoir si le mot entier est correct.
    let motCorrect = true;
    
    // Boucle pour comparer la saisie lettre par lettre avec le mot à deviner.
    for (let i = 0; i < MOT_A_DEVINER.length; i++) {
        // Crée un élément span pour afficher la lettre avec la bonne couleur.
        const lettre = document.createElement('span');
        lettre.className = 'letter';
        // Définit le contenu du span (lettre en majuscule).
        lettre.textContent = motSaisi[i].toUpperCase();
        
        // CAS 1 : Lettre correcte et bien placée (Vert).
        if (motSaisi[i] === MOT_A_DEVINER[i]) {
            lettre.classList.add('lettre-correcte');
            // Met à jour le tableau des lettres correctes.
            lettresCorrectes[i] = MOT_A_DEVINER[i];
            // Ajoute la lettre aux lettres trouvées.
            lettresTrouvees.add(MOT_A_DEVINER[i]);
        // CAS 2 : Lettre correcte mais mal placée (Jaune/Orange).
        } else if (MOT_A_DEVINER.includes(motSaisi[i])) {
            lettre.classList.add('lettre-mal-placee');
            motCorrect = false; // Le mot n'est pas entièrement correct.
        // CAS 3 : Lettre incorrecte (Grise).
        } else {
            lettre.classList.add('lettre-incorrecte');
            motCorrect = false; // Le mot n'est pas entièrement correct.
        }
        
        // Ajoute la span au conteneur.
        celldeco.appendChild(lettre);
    }
    
    // Met à jour les lignes suivantes avec les lettres correctement trouvées.
    mettreAJourLettresCorrectes();
    
    // Si le mot est entièrement correct.
    if (motCorrect) {
        // Calcule le score bonus (plus la tentative est basse, plus le score est haut).
        score += (6 - tentativeActuelle) * 100;
        // Met à jour l'affichage du score.
        mettreAJourScore();
        
        // Affiche le message de victoire après un court délai.
        setTimeout(() => {
            afficherMessageFin("🎉 Félicitations ! Vous avez trouvé le mot !", true);
        }, 500);
        return; // Arrête la fonction.
    }
    
    // Incrémente la tentative actuelle.
    tentativeActuelle++;
    
    // Si il reste des tentatives.
    if (tentativeActuelle < 6) {
        // Active la ligne suivante après un court délai (pour l'animation de vérification).
        setTimeout(() => {
            activerLigne(tentativeActuelle);
        }, 800);
    // Si c'était la dernière tentative (6 tentatives au total, index 5).
    } else {
        // Affiche le message de défaite.
        setTimeout(() => {
            afficherMessageFin(`💔 Dommage ! Le mot était : ${MOT_A_DEVINER.toUpperCase()}`, false);
        }, 800);
    }
}

// Fonction pour mettre à jour l'affichage des lettres correctement trouvées dans toutes les lignes.
function mettreAJourLettresCorrectes() {
    // Parcourt toutes les lignes.
    tousLesMots.forEach((cell, index) => {
        // Récupère les inputs.
        const inputs = cell.querySelectorAll("input");
        // Parcourt chaque input.
        inputs.forEach((input, i) => {
            // Si une lettre a été trouvée correctement à cette position.
            if (lettresCorrectes[i] !== null) {
                // Met à jour la valeur de l'input.
                input.value = lettresCorrectes[i].toUpperCase();
                // Désactive l'input.
                input.disabled = true;
                // Applique le style vert.
                input.style.backgroundColor = "green";
                input.style.color = "white";
            }
        });
    });
}

// Fonction pour mettre à jour l'affichage du score.
function mettreAJourScore() {
    // Récupère l'élément d'affichage du score.
    const scoreValue = document.getElementById("score-value");
    // Met à jour le texte avec la valeur actuelle du score.
    scoreValue.textContent = score;
}

// Fonction pour afficher un message d'information ou d'erreur temporaire.
function afficherMessageTemporaire(message) {
    // Crée un nouvel élément div.
    const messageTemp = document.createElement("div");
    // Définit le contenu.
    messageTemp.textContent = message;
    // Applique un style CSS pour l'afficher en haut de l'écran (avec fond rouge pour l'erreur).
    messageTemp.style.cssText = `
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 0, 0, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        font-size: 16px;
        z-index: 1000;
    `;
    
    // Ajoute le message au corps du document.
    document.body.appendChild(messageTemp);
    
    // Définit un minuteur pour supprimer le message après 2 secondes (2000 ms).
    setTimeout(() => {
        messageTemp.remove();
    }, 2000);
}

// Fonction pour afficher l'écran de fin de partie (victoire ou défaite).
function afficherMessageFin(message, victoire) {
    // Crée le conteneur du message de fin.
    const container = document.createElement("div");
    container.className = "message fin";
    // Définit le contenu HTML du message (inclut le message, le score, et les boutons).
    container.innerHTML = `
        <p>${message}</p>
        <p>Score actuel: ${score} points</p>
        <div class="button-group">
            <button class="btn-continuer">Continuer</button>
            <button class="btn-changer-joueur">Changer de joueur</button>
        </div>
    `;
    
    // Ajoute le conteneur au corps du document.
    document.body.appendChild(container);
    
    // Ajoute l'écouteur d'événement pour le bouton "Continuer" (Rejouer avec le même joueur).
    container.querySelector(".btn-continuer").addEventListener("click", function() {
        container.remove(); // Supprime le message de fin.
        rejouerMemeJoueur(); // Démarre une nouvelle partie.
    });
    
    // Ajoute l'écouteur d'événement pour le bouton "Changer de joueur".
    container.querySelector(".btn-changer-joueur").addEventListener("click", function() {
        // Réinitialiser le score si changement de joueur
        score = 0;
        playerNameChanged = false;
        container.remove(); // Supprime le message de fin.
        rejouerNouveauJoueur(); // Revient à l'écran de configuration du joueur.
    });
}

// Fonction pour rejouer avec le même joueur (revient à l'écran de démarrage avec le bouton "Let's play").
function rejouerMemeJoueur() {
    // Supprime tous les messages de fin de partie précédents.
    const messages = document.querySelectorAll(".message");
    messages.forEach(msg => msg.remove());
    
    // Récupère les éléments DOM nécessaires.
    const gameContainer = document.querySelector(".game-container");
    const tiles = document.querySelectorAll(".tile");
    const boutton = document.getElementById("boutton");
    const indicesSidebar = document.getElementById("indices-sidebar");
    
    // Affiche l'écran de démarrage/accueil.
    boutton.style.display = "block";
    gameContainer.style.display = "flex";
    tiles.forEach(tile => tile.style.display = "flex");
    indicesSidebar.style.display = "none";
    
    // Vide la grille précédente.
    const grille = document.getElementById("grille");
    grille.innerHTML = '';
    
    // Vide le tableau de suivi des lignes.
    tousLesMots = [];
}

// Fonction pour rejouer en changeant de joueur (revient à l'écran de saisie du nom).
function rejouerNouveauJoueur() {
    // Supprime tous les messages de fin de partie précédents.
    const messages = document.querySelectorAll(".message");
    messages.forEach(msg => msg.remove());
    
    // Récupère les éléments DOM nécessaires.
    const gameContainer = document.querySelector(".game-container");
    const tiles = document.querySelectorAll(".tile");
    const boutton = document.getElementById("boutton");
    const indicesSidebar = document.getElementById("indices-sidebar");
    const playerDisplay = document.getElementById("player-display");
    const playerSetup = document.getElementById("player-setup");
    
    // Réafficher la configuration du joueur
    // Rend visible l'écran de saisie du nom.
    playerSetup.classList.remove("hidden");
    // Cache les autres éléments du jeu.
    boutton.style.display = "none";
    gameContainer.style.display = "flex";
    tiles.forEach(tile => tile.style.display = "flex");
    indicesSidebar.style.display = "none";
    // Cache l'affichage du nom/score.
    playerDisplay.classList.remove("visible");
    
    // Réinitialiser le champ nom
    // Vide le champ de saisie du nom.
    document.getElementById("player-name-input").value = "";
    // Met le focus dessus.
    document.getElementById("player-name-input").focus();
    
    // Vide la grille précédente.
    const grille = document.getElementById("grille");
    grille.innerHTML = '';
    
    // Vide le tableau de suivi des lignes.
    tousLesMots = [];
}

// Gère l'événement de redimensionnement de la fenêtre.
window.addEventListener('resize', function() {
    // Si une partie est en cours (grille existe et tentatives non épuisées).
    if (tousLesMots.length > 0 && tentativeActuelle < 6) {
        // Ré-active la ligne actuelle pour s'assurer que le focus et les styles sont corrects après la redimension.
        activerLigne(tentativeActuelle);
    }
});