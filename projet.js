let b = document.body;
let g = document.querySelector(".game-container");
let ti = document.querySelector(".tile");
let boutton = document.getElementById("boutton");

// Le mot à deviner est défini une seule fois
const MOT_A_DEVINER = "isra"; 

boutton.addEventListener("click", () => {
    g.style.display = "none";
    ti.style.display = "none";
    boutton.style.display = "none";
    b.classList.add("nouveau");

    let cellules = document.querySelectorAll(".cell");
    cellules.forEach(cell => cell.classList.add("celldeco"));

    // Appeler la fonction principale de jeu
    commencerLeJeu();
});

function commencerLeJeu() {
    // On travaille avec les 6 champs d'entrée
    const tousLesMots = [];
    for (let i = 1; i <= 6; i++) {
        tousLesMots.push(document.querySelector(".mot" + i));
    }

    // Le champ actif commence par le premier
    let tentativeActuelle = 0; 
    
    // Assurez-vous que seul le premier champ est actif au début
    tousLesMots.forEach((mot, index) => {
        if (mot) {
            mot.disabled = (index !== 0);
        }
    });

    // Mettre le focus sur le premier champ (mot1)
    if (tousLesMots[0]) {
        tousLesMots[0].focus();
    }


    tousLesMots.forEach((mots, i) => {
        if (!mots) return;

        mots.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                
                // Vérifie si ce champ est bien celui de la tentative actuelle
                if (i !== tentativeActuelle) {
                    return; // Ignore l'événement si ce n'est pas le champ attendu
                }
                
                let mot = mots.value.trim();
                
                // 1. Désactiver le champ actuel
                mots.disabled = true; 
                for (let c=0;c< mot.length;c++)
                    {
                         mots.classList.add("in_box_lettre");
                    }
                if (mot.toLowerCase() === MOT_A_DEVINER.toLowerCase()) {

                    alert("tu as gagné");
                    
                    
                    // On peut bloquer tous les autres champs ici après avoir gagné
                    tousLesMots.forEach(m => m.disabled = true);
                    return; 
                } 


                // 2. Préparer la prochaine tentative
                tentativeActuelle++;

                // 3. Déplacer le focus vers le prochain champ
                if (tentativeActuelle < 6) { 
                    const prochainMot = tousLesMots[tentativeActuelle];
                    if (prochainMot) {
                        prochainMot.disabled = false; // Réactiver le prochain champ
                        prochainMot.focus(); 
                    }
                } else {
                    // Si tentativeActuelle est >= 6, c'est la fin du jeu
                    alert("tu as perdu. Le mot était : " + MOT_A_DEVINER);
                }
            }
        });
    });
}

   

  

    


