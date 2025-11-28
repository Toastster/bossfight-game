// === CANVAS SETUP ===
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// === INPUT HANDLING ===
let keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// === GAME VARIABLES ===
let player, boss, bullets, bossBullets, gameRunning=false, bossID;

// === PLAYER CREATION ===
function createPlayer() {
    return { 
        x:60, 
        y:canvas.height/2-15, 
        width:30, 
        height:30, 
        speed:5, 
        hp:5, 
        shootCooldown:0 
    };
}

// === BOSS CREATION ===
function createBoss(id) {
    if(id===1) return {name:"Inferno Serpent", color:"#ff6600", hp:50, y:canvas.height/2-40, dy:2, pattern:1, attackTimer:0};
    if(id===2) return {name:"Forest Guardian", color:"#33cc33", hp:60, y:canvas.height/2-40, dy:1.8, pattern:2, attackTimer:0};
    if(id===3) return {name:"Void Eye", color:"#9900ff", hp:45, y:canvas.height/2-40, dy:2.2, pattern:3, attackTimer:0};
}

// === START GAME ===
function startGame(id){
    bossID = id;
    document.getElementById("menu").style.display="none";
    canvas.style.display="block";
    player = createPlayer();
    boss = createBoss(id);
    bullets = [];
    bossBullets = [];
    gameRunning = true;
    requestAnimationFrame(gameLoop);
}

// === SHOOT PLAYER BULLETS ===
function shoot(){
    if(player.shootCooldown<=0){
        bullets.push({
            x:player.x+player.width, 
            y:player.y+player.height/2-2, 
            width:10, 
            height:4, 
            speed:8
        });
        player.shootCooldown = 15;
    }
}

// === BOSS SHOOTING PATTERNS ===
function bossShoot(){
    if(boss.pattern===1){
        // single big bullet
        bossBullets.push({x:860, y:boss.y+40, speed:-6, size:12, color:"#ff6600"});
    } 
    else if(boss.pattern===2){
        // double bullets top and bottom
        bossBullets.push({x:860, y:boss.y+10, speed:-5, size:10, color:"#33cc33"});
        bossBullets.push({x:860, y:boss.y+70, speed:-5, size:10, color:"#33cc33"});
    } 
    else if(boss.pattern===3){
        // triple spread
        bossBullets.push({x:860, y:boss.y+40, speed:-4, size:10, color:"#9900ff", dy:-2});
        bossBullets.push({x:860, y:boss.y+40, speed:-4, size:10, color:"#9900ff", dy:0});
        bossBullets.push({x:860, y:boss.y+40, speed:-4, size:10, color:"#9900ff", dy:2});
    }
}

// === GAME LOOP ===
function gameLoop(){
    if(!gameRunning) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // --- PLAYER MOVEMENT ---
    if(keys["w"] && player.y>0) player.y-=player.speed;
    if(keys["s"] && player.y<canvas.height-player.height) player.y+=player.speed;
    if(keys[" "]) shoot();
    if(player.shootCooldown>0) player.shootCooldown--;

    // --- DRAW PLAYER ---
    ctx.fillStyle="cyan";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // --- PLAYER BULLETS ---
    for(let i=bullets.length-1;i>=0;i--){
        let b = bullets[i];
        b.x += b.speed;
        ctx.fillStyle="white";
        ctx.fillRect(b.x, b.y, b.width, b.height);

        // Collision with boss
        if(b.x+ b.width >= 820 && b.x <= 860 && b.y + b.height >= boss.y && b.y <= boss.y+80){
            boss.hp--;
            bullets.splice(i,1);
        }
        else if(b.x>canvas.width) bullets.splice(i,1);
    }

    // --- BOSS MOVEMENT ---
    boss.y += boss.dy;
    if(boss.y<0 || boss.y+80>canvas.height) boss.dy*=-1;
    ctx.fillStyle=boss.color;
    ctx.fillRect(820,boss.y,40,80);

    // --- BOSS SHOOTING ---
    boss.attackTimer++;
    if(boss.attackTimer>50){ bossShoot(); boss.attackTimer=0; }

    // --- BOSS BULLETS ---
    for(let i=bossBullets.length-1;i>=0;i--){
        let b = bossBullets[i];
        b.x += b.speed;
        if(b.dy) b.y += b.dy;
        ctx.fillStyle=b.color;
        ctx.beginPath();
        ctx.arc(b.x,b.y,b.size,0,Math.PI*2);
        ctx.fill();

        // Collision with player
        if(b.x-b.size<player.x+player.width && b.x+b.size>player.x && b.y-b.size<player.y+player.height && b.y+b.size>player.y){
            player.hp--;
            bossBullets.splice(i,1);
        } 
        else if(b.x+b.size<0 || b.y<0 || b.y>canvas.height) bossBullets.splice(i,1);
    }

    // --- HUD ---
    ctx.fillStyle="white";
    ctx.font="20px Arial";
    ctx.fillText("Player HP: "+player.hp,20,30);
    ctx.fillText(boss.name+" HP: "+boss.hp,700,30);

    // --- CHECK END GAME ---
    if(player.hp<=0){ endGame("YOU DIED"); return; }
    if(boss.hp<=0){ endGame("YOU WIN!"); return; }

    requestAnimationFrame(gameLoop);
}

// === END GAME FUNCTION ===
function endGame(text){
    gameRunning=false;
    ctx.fillStyle="white";
    ctx.font="40px Arial";
    ctx.fillText(text,canvas.width/2-100,canvas.height/2);
}
