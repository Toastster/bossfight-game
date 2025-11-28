const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const statusDiv = document.getElementById("status");
const menuDiv = document.getElementById("menu");

const upBtn = document.getElementById("upBtn");
const downBtn = document.getElementById("downBtn");
const shootBtn = document.getElementById("shootBtn");

let gameRunning = false;
let selectedBoss = 0;

// PLAYER
let player = { x: 60, y: 220, w: 32, h: 32, speed: 5, hp: 10 };
let bullets = [];

// BOSS TEMPLATE
let boss = null;

function createBoss(type) {
    const b = { x: 820, y: 200, w: 32, h: 32, dy: 2, hp: 20, type: type, attackCooldown: 0 };
    return b;
}

// PIXEL ART SPRITES (Base64 PNG, 32x32)
// Player sprite: simple cyan square
const playerSprite = new Image();
playerSprite.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABKUlEQVRYR+3XwQ2CQBRE0fN4Cu4ANkAN0AjSAZcANdAC0gGZACcAvVjo1YqK5WLPtOf2dC0AfgdQB7jr2HRJwq3QoIrYTmKkqgIqxDkKk0gGpSlQCl2DAi7IHZQjViSPYGJKw4n2WCCfQiQkqKpEi7I0x4/PAx4wZxlPn0kCeowzRMb6b5uYoxuE1+VwRXsC+oWAPOA8sF8N50VQH9a3u+cZbAqRwBcxI1A9x0x0RfBa+Ba5oL2z6R03wAAAD//wMA6x4B3Igd1oQAAAAASUVORK5CYII=";

// Boss sprites: simple colored squares
const bossSprites = {
    1: new Image(), // Toxic Rex
    2: new Image(), // Storm Serpent
    3: new Image()  // Forge Titan
};

bossSprites[1].src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAv0lEQVRYR+3WQQrCQBRE0bLIDLE0g6gU6AF6ADqADqADqADqADqAHa2krZ0b7ZkVd3dq2zt9JkCBF0AxD9q3S5RzA6j2yMA7Epk+GGLVahwC+M9kZ5q4GgBVhMyvU3QgFXtYAVtCIm4iVAqgFqXQDbDki0AJxXkR6xG9wGVpRxYAkc2Gf8CGFqQh9Q+IQn6+5O/wS27N0AAAAASUVORK5CYII=";
bossSprites[2].src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA2klEQVRYR+3XwQ2CMBAF0Ew0AjoAK4Aj4AjoAjoAK4Aj4AjoAjoAK4AKwl7X4R2UGslNn7MYFvhuUII4hUszQAaUEhIUXbLUgBhtwDyIWT+YAAp7AKFQE9iAlc1hGk8OQF8wI5T+BDEd4e3H4iok5lL8lcoj0vEEyL0rFsIVC0pOVwAj4E8xZ3dVCD06E3m1UXgJ0qkCz2Zgk6xDd4B0ezR2H+h6FxBwbP0JH4AeQgNEXw2sAAAAASUVORK5CYII=";
bossSprites[3].src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAtklEQVRYR+3XwQ2CMAxF0RtIDuAGuACuABsADsADsADsADsADt4mYbbnZ1Iq7yxuYjAIuQCuAFZ7P4tqA3UwDIaMDEpUQK4E3UAFYoAlZoAhhNCDUQhbKxA5JVBXyExRflJk+vGxM1koRix2QFVqBM6QKpQCdIKSkO0gAmIV5P+z2ACdQh1+rEoJcCfkF3oP4GF3qJ7QAAAABJRU5ErkJggg==";

// INPUT
let keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// Touch controls
let touchInput = { up: false, down: false, shoot: false };
upBtn.addEventListener("touchstart", e=>{ touchInput.up=true; e.preventDefault(); });
upBtn.addEventListener("touchend", e=>{ touchInput.up=false; e.preventDefault(); });
downBtn.addEventListener("touchstart", e=>{ touchInput.down=true; e.preventDefault(); });
downBtn.addEventListener("touchend", e=>{ touchInput.down=false; e.preventDefault(); });
shootBtn.addEventListener("touchstart", e=>{ touchInput.shoot=true; e.preventDefault(); });
shootBtn.addEventListener("touchend", e=>{ touchInput.shoot=false; e.preventDefault(); });

// START GAME
function startGame(bossNum) {
    selectedBoss = bossNum;
    player.hp = 10;
    bullets = [];
    boss = createBoss(bossNum);
    menuDiv.style.display = "none";
    canvas.style.display = "block";
    document.getElementById("touchControls").style.display = "block";
    statusDiv.textContent = "";
    gameRunning = true;
    requestAnimationFrame(gameLoop);
}

// SHOOT
let shootCooldown = 0;
function shoot() {
    if(shootCooldown <= 0){
        bullets.push({ x: player.x + player.w, y: player.y + player.h/2 - 2, w: 8, h: 4, speed: 8 });
        shootCooldown = 15;
    }
}

// GAME LOOP
function gameLoop(){
    if(!gameRunning) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // PLAYER MOVEMENT
    let up = keys["w"] || touchInput.up;
    let down = keys["s"] || touchInput.down;
    let fire = keys[" "] || touchInput.shoot;

    if(up) player.y -= player.speed;
    if(down) player.y += player.speed;
    player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));

    // SHOOT
    if(fire) shoot();
    if(shootCooldown>0) shootCooldown--;

    // DRAW PLAYER
    ctx.drawImage(playerSprite, player.x, player.y, player.w, player.h);

    // BULLETS
    ctx.fillStyle="white";
    for(let i=bullets.length-1;i>=0;i--){
        let b = bullets[i];
        b.x += b.speed;
        ctx.fillRect(b.x,b.y,b.w,b.h);
        // Collision with boss
        if(b.x + b.w > boss.x && b.x < boss.x + boss.w &&
           b.y + b.h > boss.y && b.y < boss.y + boss.h){
               boss.hp--;
               bullets.splice(i,1);
               continue;
           }
        if(b.x > canvas.width) bullets.splice(i,1);
    }

    // BOSS MOVEMENT
    boss.y += boss.dy;
    if(boss.y <= 0 || boss.y + boss.h >= canvas.height) boss.dy*=-1;

    // BOSS ATTACKS
    if(boss.attackCooldown <= 0){
        bossAttack();
        boss.attackCooldown = 60; // cooldown frames
    } else boss.attackCooldown--;

    // DRAW BOSS
    ctx.drawImage(bossSprites[boss.type], boss.x, boss.y, boss.w, boss.h);

    // HEALTH BARS
    ctx.fillStyle = "lime";
    ctx.fillRect(20,20,(player.hp/10)*100,10);
    ctx.fillStyle = "pink";
    ctx.fillRect(canvas.width-120,20,(boss.hp/20)*100,10);

    // CHECK WIN/LOSE
    if(player.hp<=0){
        statusDiv.textContent = "You Lose!";
        gameRunning=false;
        canvas.style.display="none";
        menuDiv.style.display="block";
        return;
    }
    if(boss.hp<=0){
        statusDiv.textContent = "You Win!";
        gameRunning=false;
        canvas.style.display="none";
        menuDiv.style.display="block";
        return;
    }

    requestAnimationFrame(gameLoop);
}

// BOSS ATTACK FUNCTION
function bossAttack(){
    switch(boss.type){
        case 1: // Toxic Rex
            bullets.push({ x: boss.x-10, y: boss.y+boss.h/2-2, w:8, h:4, speed:-6 }); // acid spit
            break;
        case 2: // Storm Serpent
            for(let i=0;i<3;i++)
                bullets.push({ x: boss.x-10, y: boss.y + i*10, w:6, h:6, speed:-5 }); // lightning bolts
            break;
        case 3: // Forge Titan
            bullets.push({ x: boss.x-10, y: boss.y+boss.h/2-2, w:12, h:12, speed:-4 }); // lava rock
            break;
    }
}

// COLLISION FOR PLAYER HIT
function updatePlayerHit(){
    for(let i=bullets.length-1;i>=0;i--){
        let b=bullets[i];
        if(b.speed<0 && b.x < player.x + player.w &&
           b.x + b.w > player.x &&
           b.y < player.y + player.h &&
           b.y + b.h > player.y){
               player.hp--;
               bullets.splice(i,1);
        }
    }
}
setInterval(updatePlayerHit,16);
