document.addEventListener("DOMContentLoaded", () => {

  const gameArea = document.getElementById("gameArea");
  const hero = document.getElementById("hero");
  const scoreEl = document.getElementById("score");
  const recordEl = document.getElementById("record");
  const livesEl = document.getElementById("lives");

  const leftBtn = document.getElementById("left");
  const rightBtn = document.getElementById("right");

  // ===== ИГРОВОЕ СОСТОЯНИЕ =====
  let heroWidth = 150;
  let heroHeight = 150;
  let heroX = (gameArea.clientWidth - heroWidth) / 2;
  hero.style.left = heroX + "px";

  let score = 0;
  let lives = 3;
  let gameOver = false;

  let baseFallSpeed = 2.5;
  let speedMultiplier = 1;

  let record = Number(localStorage.getItem("record") || 0);
  recordEl.textContent = record;

  const HERO_SPEED = 6;

  // ===== ПЕРЕМЕННЫЕ СПАВНА =====
  let spawnInterval = 900; // время между волнами
  let spawnCount = 1;      // предметов за волну
  let spawnDelay = 150;    // задержка между предметами в одной волне
  let spawnTimer = null;   // объявляем до использования

  // ===== УПРАВЛЕНИЕ ГЕРОЕМ =====
  let leftPressed = false;
  let rightPressed = false;

  document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") leftPressed = true;
    if (e.key === "ArrowRight") rightPressed = true;
  });

  document.addEventListener("keyup", e => {
    if (e.key === "ArrowLeft") leftPressed = false;
    if (e.key === "ArrowRight") rightPressed = false;
  });

  function bindButton(btn, dir) {
    btn.addEventListener("touchstart", e => {
      e.preventDefault();
      if (dir === "left") leftPressed = true;
      else rightPressed = true;
    });
    btn.addEventListener("touchend", e => {
      if (dir === "left") leftPressed = false;
      else rightPressed = false;
    });
    btn.addEventListener("mousedown", () => {
      if (dir === "left") leftPressed = true;
      else rightPressed = true;
    });
    btn.addEventListener("mouseup", () => {
      if (dir === "left") leftPressed = false;
      else rightPressed = false;
    });
    btn.addEventListener("mouseleave", () => {
      if (dir === "left") leftPressed = false;
      else rightPressed = false;
    });
  }

  bindButton(leftBtn, "left");
  bindButton(rightBtn, "right");

  // ===== ПРЕДМЕТЫ =====
  const goodImages = ["edi.png","hw.png","hsm.png"];
  const badImage = "bug.png";

  const GOOD_SIZE = 36;
  const BAD_SIZE = 27;

  let items = [];

  // ===== СПАВН ВОЛНЫ =====
  function spawnWave() {
    if (gameOver) return;

    for (let i = 0; i < spawnCount; i++) {
      setTimeout(() => {
        spawnItem();
      }, i * spawnDelay);
    }
  }

  function spawnItem() {
    if (gameOver) return;

    const isBad = Math.random() < 0.25;
    const item = document.createElement("img");
    item.className = "item";
    item.src = isBad ? badImage : goodImages[Math.floor(Math.random()*goodImages.length)];
    const size = isBad ? BAD_SIZE : GOOD_SIZE;
    item.style.width = size + "px";
    item.style.height = size + "px";
    item.style.position = "absolute";
    let x = Math.random() * (gameArea.clientWidth - size);
    let y = -size;
    item.style.left = x + "px";
    item.style.top = y + "px";
    gameArea.appendChild(item);

    const speed = baseFallSpeed * speedMultiplier * (0.95 + Math.random() * 0.1);

    items.push({el: item, x, y, size, speed, isBad});
  }

  // ===== ОБНОВЛЕНИЕ =====
  function update() {
    if (gameOver) return;

    // движение героя
    if (leftPressed) heroX -= HERO_SPEED;
    if (rightPressed) heroX += HERO_SPEED;

    if (heroX < 0) heroX = 0;
    if (heroX > gameArea.clientWidth - heroWidth) heroX = gameArea.clientWidth - heroWidth;
    hero.style.left = heroX + "px";

    // падение предметов
    for (let i = items.length-1; i>=0; i--) {
      const item = items[i];
      item.y += item.speed;
      item.el.style.top = item.y + "px";

      const catchLine = gameArea.clientHeight - heroHeight - 5;
const caught = item.y + item.size >= catchLine &&
                      item.x + item.size > heroX &&
                      item.x < heroX + heroWidth;

      if (caught) {
        if (item.isBad) {
          lives--;
          if (livesEl) livesEl.textContent = "❤️".repeat(lives);
          if (lives <= 0) {
            endGame();
            return;
          }
        } else {
          score += 10;
          scoreEl.textContent = score;

          // ускорение каждые 50 очков
          if (score % 50 === 0) {
            speedMultiplier += 0.25;
          }

          // увеличение количества предметов каждые 100 очков
          if (score % 100 === 0 && spawnCount < 4) {
            spawnCount++;
          }
        }

        gameArea.removeChild(item.el);
        items.splice(i,1);
        continue;
      }

      if (item.y > gameArea.clientHeight) {
        gameArea.removeChild(item.el);
        items.splice(i,1);
      }
    }

    requestAnimationFrame(update);
  }

  // ===== КОНЕЦ ИГРЫ =====
  function endGame() {
    gameOver = true;

    if (score > record) {
      record = score;
      localStorage.setItem("record", record);
      recordEl.textContent = record;
    }

    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0,0,0,0.8)";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "10";
    overlay.style.color = "#fff";

    const title = document.createElement("div");
    title.textContent = "Игра окончена";
    title.style.fontSize = "24px";
    title.style.marginBottom = "12px";

    const scoreText = document.createElement("div");
    scoreText.textContent = "Очки: " + score;
    scoreText.style.marginBottom = "20px";


    const btn = document.createElement("button");
    btn.textContent = "Начать заново";
    btn.style.padding = "14px 28px";
    btn.style.borderRadius = "50px";
    btn.style.border = "none";
    btn.style.fontSize = "18px";
    btn.style.background = "#236192";
    btn.style.color = "#fff";

    btn.addEventListener("click", () => location.reload());

    overlay.appendChild(title);
    overlay.appendChild(scoreText);
    overlay.appendChild(btn);
    gameArea.appendChild(overlay);
  }

  // ===== СТАРТ =====
  startSpawner();
  update();

  // ===== Функция для запуска спавнера =====
  function startSpawner() {
    if (spawnTimer) clearInterval(spawnTimer);
    spawnTimer = setInterval(() => {
      if (!gameOver) spawnWave();
    }, spawnInterval);
  }

});
