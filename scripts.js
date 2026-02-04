const canvas = document.getElementById("jeu");
const ctx = canvas.getContext("2d");

// ==========================================
// 1. CHARGEMENT DES RESSOURCES
// ==========================================

// --- Images ---
const imgFond = new Image();
imgFond.src = "./assets/fond.webp";

const imgJoueur = new Image();
imgJoueur.src = "./assets/tir.png";

const imgZombie = new Image();
imgZombie.src = "./assets/zombie.png";

// --- Sons ---
const america = new Audio("./assets/son/america.mp3");

// Musique Mode Normal
const zikNormal = new Audio("./assets/son/background_sound.mp3");
zikNormal.loop = true;
zikNormal.volume = 1;

// Musique Mode Hardcore 
const zikHardcore = new Audio("./assets/son/hardcore_gamer2.mp3"); 
zikHardcore.loop = true;
zikHardcore.volume = 1;

// ==========================================
// 2. VARIABLES GLOBALES
// ==========================================

let phase = "MENU"; // "MENU", "JEU", "GAMEOVER"
let sonActive = true;
let modeHardcore = false;

let score = 0;
let vies = 3;

const joueur = { x: 50, y: 180, w: 60, h: 60 };
let balles = [];
let zombies = [];
const touches = {};

// ==========================================
// 3. GESTION DES ENTRÉES
// ==========================================

// --- SOURIS (MENU) ---
canvas.addEventListener("mousedown", function(e) {
    if (phase === "MENU") {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Bouton JOUER (Centre)
        if (x > canvas.width/2 - 100 && x < canvas.width/2 + 100 && y > 150 && y < 210) {
            lancerJeu();
        }

        // Bouton SON (Bas Gauche)
        if (x > 50 && x < 250 && y > 300 && y < 350) {
            sonActive = !sonActive;
        }

        // Bouton MODE (Bas Droite)
        if (x > canvas.width - 250 && x < canvas.width - 50 && y > 300 && y < 350) {
            modeHardcore = !modeHardcore;
        }
    }
});

// --- CLAVIER (JEU) ---
window.addEventListener("keydown", function (e) {
  touches[e.key] = true;

  if (e.key === " " && phase === "JEU") {
    balles.push({
      x: joueur.x + joueur.w - 10,
      y: joueur.y + joueur.h / 2 - 2,
      w: 12,
      h: 6,
      speed: 10,
    });
    
    if (sonActive) {
        america.currentTime = 0;
        america.play();
    }
  }

  if (phase === "GAMEOVER" && e.key === "r") {
    location.reload(); 
  }
});

window.addEventListener("keyup", function (e) {
  touches[e.key] = false;
});

// ==========================================
// 4. FONCTIONS UTILITAIRES
// ==========================================

function lancerJeu() {
    score = 0;
    vies = 9999999999;
    balles = [];
    zombies = [];
    joueur.y = 180;
    document.getElementById("score").innerText = score;
    document.getElementById("vies").innerText = vies;

    // Gestion Musique
    zikNormal.pause();
    zikHardcore.pause();
    zikNormal.currentTime = 0;
    zikHardcore.currentTime = 0;

    // Sélection de la piste
    let musiqueChoisie = modeHardcore ? zikHardcore : zikNormal;

    if (sonActive) {
        // Si le navigateur bloque le son ou ne trouve pas le fichier, cela s'affichera dans la console (F12)
        let playPromise = musiqueChoisie.play();
        
        if (playPromise !== undefined) {
            playPromise.then(_ => {
                // La lecture a commencé
            })
            .catch(error => {
                console.log("Erreur lecture audio (Vérifie le nom du fichier !): " + error);
            });
        }
    }

    phase = "JEU";
}

// ==========================================
// 5. BOUCLE PRINCIPALE
// ==========================================

function boucler() {
  ctx.drawImage(imgFond, 0, 0, canvas.width, canvas.height);

  // --- MENU ---
  if (phase === "MENU") {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = "center";

      ctx.fillStyle = "white";
      ctx.font = "bold 40px Arial";
      ctx.fillText("ZOMBIE SHOOTER", canvas.width / 2, 80);

      // Bouton Jouer
      ctx.fillStyle = "#4CAF50";
      ctx.fillRect(canvas.width/2 - 100, 160, 200, 50);
      ctx.fillStyle = "white";
      ctx.font = "bold 30px Arial";
      ctx.fillText("JOUER", canvas.width / 2, 195);

      // Bouton Son
      ctx.fillStyle = sonActive ? "#4CAF50" : "#F44336"; 
      ctx.font = "bold 24px Arial";
      ctx.fillText("SON : " + (sonActive ? "ON" : "OFF"), 150, 330);
      ctx.fillStyle = "white";
      ctx.font = "16px Arial";
      ctx.fillText("(Cliquer)", 150, 355);

      // Bouton Mode
      ctx.fillStyle = modeHardcore ? "#FF5722" : "#2196F3";
      ctx.font = "bold 24px Arial";
      ctx.fillText("MODE : " + (modeHardcore ? "HARDCORE" : "NORMAL"), canvas.width - 150, 330);
      ctx.fillStyle = "white";
      ctx.font = "16px Arial";
      ctx.fillText("(Cliquer)", canvas.width - 150, 355);
  }

  // --- JEU ---
  else if (phase === "JEU") {
      if (touches["ArrowUp"] && joueur.y > 0) joueur.y -= 5;
      if (touches["ArrowDown"] && joueur.y < canvas.height - joueur.h) joueur.y += 5;

      ctx.drawImage(imgJoueur, joueur.x, joueur.y, joueur.w, joueur.h);

      for (let i = 0; i < balles.length; i++) {
        let b = balles[i];
        b.x += b.speed;
        ctx.fillStyle = "#ffcc00";
        ctx.fillRect(b.x, b.y, b.w, b.h);
        if (b.x > canvas.width) { balles.splice(i, 1); i--; }
      }

      let probaApparition = modeHardcore ? 0.05 : 0.02;
      if (Math.random() < probaApparition) {
        zombies.push({
          x: canvas.width,
          y: Math.random() * (canvas.height - 60),
          w: 50,
          h: 60,
          speed: Math.random() * 2 + 1 + (modeHardcore ? 2 : 0), 
        });
      }

      for (let i = 0; i < zombies.length; i++) {
        let z = zombies[i];
        z.x -= z.speed;
        ctx.drawImage(imgZombie, z.x, z.y, z.w, z.h);

        for (let j = 0; j < balles.length; j++) {
          let b = balles[j];
          if (b.x < z.x + z.w && b.x + b.w > z.x && b.y < z.y + z.h && b.h + b.y > z.y) {
            zombies.splice(i, 1);
            balles.splice(j, 1);
            score += 10;
            document.getElementById("score").innerText = score;
            i--;
            break;
          }
        }

        if (z.x < 0) {
          zombies.splice(i, 1);
          i--;
          vies--;
          document.getElementById("vies").innerText = vies;

          if (vies <= 0) {
            phase = "GAMEOVER";
            zikNormal.pause();
            zikHardcore.pause();
          }
        }
      }
  }

  // --- GAME OVER ---
  else if (phase === "GAMEOVER") {
       ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
       ctx.fillRect(0, 0, canvas.width, canvas.height);
       ctx.fillStyle = "red";
       ctx.font = "bold 50px Arial";
       ctx.textAlign = "center";
       ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
       ctx.fillStyle = "white";
       ctx.font = "20px Arial";
       ctx.fillText("Appuie sur 'R' pour rejouer", canvas.width / 2, canvas.height / 2 + 40);
  }

  requestAnimationFrame(boucler);
}

boucler();