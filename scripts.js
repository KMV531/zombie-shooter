const canvas = document.getElementById("jeu");
const ctx = canvas.getContext("2d");

// --- 1. CHARGEMENT DES FICHIERS IMAGES ---

// Image de fond
const imgFond = new Image();
imgFond.src = "./assets/FOND.jpg";

// Image du Joueur
const imgJoueur = new Image();
imgJoueur.src = "./assets/tir.png";

// Image du Zombie
const imgZombie = new Image();
imgZombie.src = "./assets/zombie.png";

// --- 2. VARIABLES DU JEU ---
let score = 0;
let vies = 3;
let jeuActif = true;

// Le Joueur (J'ai mis 60x60 pour qu'on voit bien le soldat)
const joueur = { x: 50, y: 180, w: 60, h: 60 };

let balles = [];
let zombies = [];
const touches = {};

// --- 3. GESTION DU CLAVIER ---
window.addEventListener("keydown", function (e) {
  touches[e.key] = true;

  // Tirer avec ESPACE
  if (e.key === " " && jeuActif) {
    // La balle part du bout du fusil (à peu près au milieu droite du joueur)
    balles.push({
      x: joueur.x + joueur.w - 10,
      y: joueur.y + joueur.h / 2 - 2, // Ajusté pour être au niveau de l'arme
      w: 12,
      h: 6,
      speed: 10,
    });
  }
  // Recharger avec R
  if (!jeuActif && e.key === "r") {
    location.reload();
  }
});

window.addEventListener("keyup", function (e) {
  touches[e.key] = false;
});

// --- 4. BOUCLE PRINCIPALE ---
function boucler() {
  if (!jeuActif) return;

  // A. DESSINER LE FOND (Première étape obligatoire)
  // On dessine l'image pour qu'elle remplisse tout le canvas (800x400)
  ctx.drawImage(imgFond, 0, 0, canvas.width, canvas.height);

  // B. Gérer le mouvement du joueur
  if (touches["ArrowUp"] && joueur.y > 0) joueur.y -= 5;
  if (touches["ArrowDown"] && joueur.y < canvas.height - joueur.h)
    joueur.y += 5;

  // C. DESSINER LE JOUEUR
  // On dessine l'image 'tir.png' aux coordonnées du joueur
  ctx.drawImage(imgJoueur, joueur.x, joueur.y, joueur.w, joueur.h);

  // D. Gérer les Balles
  for (let i = 0; i < balles.length; i++) {
    let b = balles[i];
    b.x += b.speed;

    // Dessin de la balle (trait jaune pour faire un laser/balle)
    ctx.fillStyle = "#ffcc00";
    ctx.fillRect(b.x, b.y, b.w, b.h);

    // Supprimer balle hors écran
    if (b.x > canvas.width) {
      balles.splice(i, 1);
      i--;
    }
  }

  // E. Créer des Zombies (Aléatoire)
  if (Math.random() < 0.02) {
    zombies.push({
      x: canvas.width,
      y: Math.random() * (canvas.height - 60), // -60 car le zombie fait 60px de haut
      w: 50,
      h: 60, // Taille du zombie
      speed: Math.random() * 2 + 1,
    });
  }

  // F. Gérer les Zombies
  for (let i = 0; i < zombies.length; i++) {
    let z = zombies[i];
    z.x -= z.speed;

    // DESSINER LE ZOMBIE
    ctx.drawImage(imgZombie, z.x, z.y, z.w, z.h);

    // -- Collisions Balle vs Zombie --
    for (let j = 0; j < balles.length; j++) {
      let b = balles[j];
      // Formule de collision rectangle vs rectangle
      if (
        b.x < z.x + z.w &&
        b.x + b.w > z.x &&
        b.y < z.y + z.h &&
        b.h + b.y > z.y
      ) {
        zombies.splice(i, 1); // Supprime Zombie
        balles.splice(j, 1); // Supprime Balle
        score += 10;
        document.getElementById("score").innerText = score;
        i--;
        break;
      }
    }

    // -- Game Over (Zombie touche gauche ou Joueur) --
    // Ici on simplifie : si le zombie dépasse la gauche de l'écran
    if (z.x < 0) {
      zombies.splice(i, 1);
      i--;
      vies--;
      document.getElementById("vies").innerText = vies;

      if (vies <= 0) {
        jeuActif = false;
        // Affichage Game Over
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; // Fond semi-transparent pour lire le texte
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "red";
        ctx.font = "bold 50px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText(
          "Appuie sur 'R' pour rejouer",
          canvas.width / 2,
          canvas.height / 2 + 40,
        );
      }
    }
  }

  requestAnimationFrame(boucler);
}

// Lancer le jeu
boucler();
