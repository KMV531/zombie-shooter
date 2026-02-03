// 1. On crée l'application PixiJS
const app = new PIXI.Application();

async function setup() {
  // On attend que l'application soit prête
  await app.init({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x1099bb,
  });

  // On ajoute le canvas généré par Pixi dans le HTML
  document.body.appendChild(app.canvas);

  // 2. On charge l'image de la map
  // REMPLACEZ LE CHEMIN CI-DESSOUS
  const texture = await PIXI.Assets.load("./assets/jeux-map.jpg");

  // 3. On crée le Sprite (l'objet visuel)
  const background = new PIXI.Sprite(texture);

  // On force la map à prendre toute la taille de l'écran
  background.width = app.screen.width;
  background.height = app.screen.height;

  // 4. On l'ajoute à la scène (le Stage)
  app.stage.addChild(background);

  console.log("Map chargée avec succès !");
}

// On lance la fonction setup
setup();
