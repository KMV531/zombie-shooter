const app = new PIXI.Application();
let zombies = [];
let textureZombie; // On déclare la variable ici pour qu'elle soit vide au départ

async function setup() {
  await app.init({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x1099bb,
  });
  document.body.appendChild(app.canvas);

  // --- CHARGEMENT DES ASSETS ---
  // On charge la map ET le zombie ici
  const textureMap = await PIXI.Assets.load("./assets/jeux-map.jpg");
  textureZombie = await PIXI.Assets.load("./assets/zombie-walk.png");

  // --- CRÉATION DU BACKGROUND ---
  const background = new PIXI.Sprite(textureMap);
  background.width = app.screen.width;
  background.height = app.screen.height;
  app.stage.addChild(background);

  // --- LA BOUCLE DE MOUVEMENT (Ticker) ---
  app.ticker.add((delta) => {
    for (let i = zombies.length - 1; i >= 0; i--) {
      const zombie = zombies[i];
      zombie.x -= 2 * delta.deltaTime;

      if (zombie.x < -100) {
        app.stage.removeChild(zombie);
        zombies.splice(i, 1);
      }
    }
  });

  // --- LANCEMENT DE L'INVASION ---
  // On ne commence à créer des zombies que quand tout est prêt
  setInterval(() => {
    createOneZombie(); // On appelle la fonction de création
  }, 5000);

  console.log("Jeu prêt et invasion commencée !");
}

// Ta fonction de création (plus besoin d'async ici car l'image est déjà chargée)
function createOneZombie() {
  const zombie = new PIXI.Sprite(textureZombie);
  zombie.anchor.set(0.5);
  zombie.x = app.screen.width + 50;
  zombie.y = Math.random() * app.screen.height;

  app.stage.addChild(zombie);
  zombies.push(zombie);
}

setup();
