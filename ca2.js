let canvas;
let context;

let fpsInterval = 1000 / 60; // the denominator is frames-per-second
let now;
let then = Date.now();
//Create a player
let player = {
  image: new Image(),
  x: 400,
  y: 288,
  width: 60,
  height: 60,
  r: 30,
  frameX: 0,
  frameY: 0,
  xChange: 0,
  yChange: 0,
};
//Create an enemy
let enemy = {
  image: new Image(),
  x: 200,
  y: 108,
  width: 60,
  height: 60,
  r: 30,
  frameX: 0,
  frameY: 0,
  xChange: 0,
  yChange: 0,
};
//Set the bullet picture
let bulletIMG = new Image();
bulletIMG.src = "image/bullet.png";

let bullets = [];

function createBullet(x, y, direction, target) {
  return {
    x,
    y,
    direction,
    target,
  };
}

function updateBullet(bullet) {
  switch (bullet.direction) {
    case 0:
      bullet.y = bullet.y - 8;
      break;
    case 1:
      bullet.y = bullet.y + 8;
      break;
    case 2:
      bullet.x = bullet.x - 8;
      break;
    case 3:
      bullet.x = bullet.x + 8;
      break;
  }
  let distance = Math.sqrt(
    (bullet.x - bullet.target.x) ** 2 + (bullet.y - bullet.target.y) ** 2
  );
  if (distance < 30) {
    window.location.reload();
    if (bullet.target === enemy){
      window.alert("You won. Play Again?")
    } else {
      window.alert("You lost. Play Again?");
    }
  }
}

player.frameY = 1;
enemy.frameY = 0;

player.image.src = "image/tank.png";
enemy.image.src = "image/tank.png";

let backgroundImage = new Image();
let moveLeft = false;
let moveUp = false;
let moveRight = false;
let moveDown = false;
let fire = false; //

let enemyTurn = true; // ai turning lock
let enemyDirection; 

document.addEventListener("DOMContentLoaded", init, false);

function init() {
  canvas = document.querySelector("canvas");
  context = canvas.getContext("2d");

  backgroundImage.src = "image/background.png";
  window.addEventListener("keydown", activate, false);
  window.addEventListener("keyup", deactivate, false);

  draw();
  setInterval(() => {
    if (Math.random() + 0.6 > 1) {
      let bullet = createBullet(enemy.x, enemy.y, enemy.frameX, player);
      bullets.push(bullet);
    }
  }, 800);
}
function hit(obj1, obj2) { // chick collision
  let distance = Math.sqrt((obj1.x - obj2.x) ** 2 + (obj1.y - obj2.y) ** 2);
  if (distance <= obj2.r + obj1.r) {
    return true;
  }
  return false;
}
//Move enemy to chase player
function updateEnemy() {
  if (enemyTurn) {
    let directions = [];

    if (enemy.y > player.y + player.height) {
      directions.push("up");
    } else if (enemy.y + enemy.height < player.y) {
      directions.push("down");
    }

    if (enemy.x + enemy.width < player.x) {
      directions.push("right");
    } else if (enemy.x > player.x + player.width) {
      directions.push("left");
    }

    if (directions.length > 1) {
      if (Math.random() > 0.5) {
        directions.pop();
      } else {
        directions.shift();
      }
    }

    enemyDirection = directions[0];

    enemyTurn = false;
    window.setTimeout(() => {
      enemyTurn = true;
    }, 1000);
  }

  switch (enemyDirection) {
    case "up":
      enemy.y = enemy.y - 1;
      enemy.frameX = 0;
      break;
    case "down":
      enemy.y = enemy.y + 1;
      enemy.frameX = 1;
      break;
    case "left":
      enemy.x = enemy.x - 1;
      enemy.frameX = 2;
      break;
    case "right":
      enemy.x = enemy.x + 1;
      enemy.frameX = 3;
      break;
  }
}
function draw() {
  window.requestAnimationFrame(draw);
  let now = Date.now();
  let elapsed = now - then;
  if (elapsed <= fpsInterval) {
    return;
  }
  then = now - (elapsed % fpsInterval);

  //Handle key presses
  let old_x = player.x;
  let old_y = player.y;

  if (moveLeft) {
    player.xChange = player.xChange - 0.7;
  }
  if (moveRight) {
    player.xChange = player.xChange + 0.7;
  }
  if (moveUp) {
    player.yChange = player.yChange - 0.7;
  }
  if (moveDown) {
    player.yChange = player.yChange + 0.7;
  }

  if (moveLeft) {
    player.frameX = 2;
  }
  if (moveRight) {
    player.frameX = 3;
  }
  if (moveUp) {
    player.frameX = 0;
  }
  if (moveDown) {
    player.frameX = 1;
  }

  if (fire) {
    if (Math.random() + 0.18 > 1) {
      let bullet = createBullet(player.x, player.y, player.frameX, enemy);
      bullets.push(bullet);
    }
  }

  if (player.xChange > 5) {
    player.xChange = 5;
  } else if (player.xChange < -5) {
    player.xChange = -5;
  }
  if (player.yChange > 5) {
    player.yChange = 5;
  } else if (player.yChange < -5) {
    player.yChange = -5;
  }
  player.x = player.x + player.xChange;
  player.y = player.y + player.yChange;

  //Update the player
  if (hit(player, enemy)) {
    player.x = old_x;
    player.y = old_y;
  }

  updateEnemy();

  for (let i = 0; i < bullets.length; i++) {
    updateBullet(bullets[i]);
  }
  if (bullets.length > 500) {
    bullets = bullets.slice(bullets.length - 500, 500);
  }

  //Going off left or right
  if (player.x < 0) {
    player.x = 0;
  } else if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
  }
  if (player.y < 0) {
    player.y = 0;
  } else if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < canvas.height / 16; row++) {
    let dy = row * 16;

    for (let col = 0; col < canvas.width / 16; col++) {
      let dx = col * 16;

      context.drawImage(backgroundImage, 0, 0, 16, 16, dx, dy, 16, 16);
    }
  }

  // draw image
  context.drawImage(
    player.image,
    player.width * player.frameX,
    player.height * player.frameY,
    player.width,
    player.height,
    player.x,
    player.y,
    player.width,
    player.height
  );
  context.drawImage(
    enemy.image,
    enemy.width * enemy.frameX,
    enemy.height * enemy.frameY,
    enemy.width,
    enemy.height,
    enemy.x,
    enemy.y,
    enemy.width,
    enemy.height
  );
// set bullet position offset
  for (let i = 0; i < bullets.length; i++) {
    let x = bullets[i].x;
    let y = bullets[i].y;
    if (player.frameX === 0) {
      x = bullets[i].x + player.width / 2 - 14;
    } else if (player.frameX === 1) {
      x = bullets[i].x + player.width / 2 - 14;
    } else if (player.frameX === 2) {
      y = bullets[i].y + player.width / 2 - 14;
    } else if (player.frameX === 3) {
      y = bullets[i].y + player.width / 2 - 14;
    }
    context.drawImage(bulletIMG, x, y);
  }
}

function activate(event) {
  if (moveLeft || moveRight || moveUp || moveDown) {
    return;
  }
  let key = event.key;
  if (key === "ArrowLeft") {
    moveLeft = true;
  } else if (key === "ArrowUp") {
    moveUp = true;
  } else if (key === "ArrowRight") {
    moveRight = true;
  } else if (key === "ArrowDown") {
    moveDown = true;
  } else if (key === " ") {
    fire = true;
  }
}

function deactivate(event) {
  let key = event.key;
  if (key === "ArrowLeft") {
    moveLeft = false;
    player.xChange = 0;
  } else if (key === "ArrowUp") {
    moveUp = false;
    player.yChange = 0;
  } else if (key === "ArrowRight") {
    moveRight = false;
    player.xChange = 0;
  } else if (key === "ArrowDown") {
    moveDown = false;
    player.yChange = 0;
  } else if (key === " ") {
    fire = false;
  }
}
