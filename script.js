const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const statusDiv = document.getElementById("status");

let gameRunning = false;
let selectedBoss = 0;

// INPUT
let keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// PLAYER
let player = { x: 60, y: 200, w: 30, h: 30, speed: 5, hp: 10 };
let bullets = [];

// BOSS TEMPLATE
function createBoss(type) {
    const b = { x: 820, y: 200, w: 40, h: 80, dy: 2, hp: 20 };
    b.type = type;
    return b;
}
let boss = null;

// START GAME
function startGame(bossNum) {
    selectedBoss = bossNum;
    player.hp = 10;
    bullets = [];
    boss = createBoss(bossNum);
    document.getElementById("menu").style.display = "none";
    canvas.style.display = "block";
    statusDiv.textContent = "";
    gameRunning = true;
    requestAnimationFrame(gameLoop);
}

// SHOOT
function shoot() {
    bullets.push({
        x: player.x + player.w,
        y: player.y + player.h / 2 - 2,
        w: 10,
        h: 4,
        speed: 8
    });
}

// GAME LOOP
function gameLoop() {
    if (!gameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // PLAYER MOVEMENT
    if (keys["w"]) player.y -= player.speed;
    if (keys["s"]) player.y += player.speed;
    player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));

    // DRAW PLAYER
    ctx.fillStyle = "cyan";
    ctx.fillRect(player.x, player.y, player.w, player.h);

    // SHOOT
    if (keys[" "]) shoot();

    // BULLETS
    ctx.fillStyle = "white";
    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        b.x += b.speed;
        ctx.fillRect(b.x, b.y, b.w, b.h);

        // COLLISION WITH BOSS
        if (b.x + b.w > boss.x && b.x < boss.x + boss.w &&
            b.y + b.h > boss.y && b.y < boss.y + boss.h) {
            boss.hp--;
            bullets.splice(i, 1);
            continue;
        }

        if (b.x > canvas.width) bullets.splice(i, 1);
    }

    // BOSS MOVEMENT
    boss.y += boss.dy;
    if (boss.y <= 0 || boss.y + boss.h >= canvas.height) boss.dy *= -1;

    // BOSS ATTACKS
    if (Math.random() < 0.02) { // simple random damage
        if (Math.abs(player.y - boss.y) < 40) player.hp--;
    }

    // DRAW BOSS
    ctx.fillStyle = boss.type === 1 ? "red" : boss.type === 2 ? "orange" : "purple";
    ctx.fillRect(boss.x, boss.y, boss.w, boss.h);

    // DRAW HEALTH
    ctx.fillStyle = "lime";
    ctx.fillRect(20, 20, (player.hp / 10) * 100, 10);
    ctx.fillStyle = "pink";
    ctx.fillRect(canvas.width - 120, 20, (boss.hp / 20) * 100, 10);

    // CHECK WIN/LOSE
    if (player.hp <= 0) {
        statusDiv.textContent = "You Lose!";
        gameRunning = false;
        canvas.style.display = "none";
        document.getElementById("menu").style.display = "block";
        return;
    }
    if (boss.hp <= 0) {
        statusDiv.textContent = "You Win!";
        gameRunning = false;
        canvas.style.display = "none";
        document.getElementById("menu").style.display = "block";
        return;
    }

    requestAnimationFrame(gameLoop);
}
