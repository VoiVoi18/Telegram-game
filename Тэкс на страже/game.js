document.addEventListener("DOMContentLoaded", () => {

  const gameArea = document.getElementById("gameArea");
  const hero = document.getElementById("hero");
  const scoreEl = document.getElementById("score");
  const livesEl = document.getElementById("lives");
  const recordEl = document.getElementById("record");

  let score = 0;
  let lives = 3;
  let gameOver = false;

  // ===== РЕКОРД =====
  let record = localStorage.getItem("record") || 0;
  recordEl.textContent = record;

  // ===== ГЕРОЙ =====
  let heroX = 0;
  const heroSpeed = 5; // ← регулируй плавность тут

  function heroWidth() {
    return hero.offsetWidth;
  }

  function heroHeight() {
    return hero.offsetHeight;
  }

  function initHeroPosition() {
    heroX = (gameArea.clientWidth - heroWidth()) / 2;
    hero.style.left = heroX + "px";
  }

  initHeroPosition();

  // ===== УПРАВЛЕНИЕ =====
  let leftPressed = false;
  let rightPressed = false;

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") leftPressed = true;
    if (e.key === "ArrowRight") rightPressed = true;
  });

  document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") leftPressed = false;
    if (e.key === "ArrowRight") rightPressed = false;
  });

  // Кнопки на экране (тач)
  const leftBtn = document.getElementById("left");
  const rightBtn = document.getElementById("right");

  leftBtn.addEventListener("touchstart", () => leftPressed = true);
  leftBtn.addEventListener("touchend", () => leftPressed = false);
  leftBtn.addEventListener("mousedown", () => leftPressed = true);
  leftBtn.addEventListener("mouseup", () => leftPressed = false);
  leftBtn.addEventListener("mouseleave", () => leftPressed = false);

  rightBtn.addEventListener("touchstart", () => rightPressed = true);
  rightBtn.addEventListener("touchend", () => rightPressed = false);
  rightBtn.addEventListener("mousedown", () => rightPressed = true);
  rightBtn.addEventListener("mouseup", () => rightPressed = false);
  rightBtn.addEventListener("mouseleave", () => rightPressed = false);

  function updateHero() {
    if (gameOver) return;

    if (leftPressed) heroX -= heroSpeed;
    if (rightPressed) heroX += heroSpeed;

    if (heroX < 0) heroX = 0;
    if (heroX > gameArea.clientWidth - heroWidth()) {
      heroX = gameArea.clientWidth - heroWidth();
    }

    hero.style.left = heroX + "px";
    requestAnimationFrame(updateHero);
  }

  requestAnimationFrame(updateHero);

  // ===== ПРЕДМЕТЫ =====
  const goodImages = [
    "edi.png",
    "hw.png",
    "hsm.png"
  ];
  const badImage = "bug.png";
  let baseSpeed = 2;

  function spawnItem() {
    if (gameOver) return;

    const item = document.createElement("img");
    item.className = "item";

    const isGood = Math.random() > 0.3;
    item.src = isGood
      ? goodImages[Math.floor(Math.random() * goodImages.length)]
      : badImage;

    item.dataset.good = isGood ? "true" : "false";

    const itemSize = 36;
    let x = Math.random() * (gameArea.clientWidth - itemSize);
    let y = -itemSize;

    item.style.left = x + "px";
    item.style.top = y + "px";
    gameArea.appendChild(item);

    const speed = baseSpeed + Math.random() * 1.5;

    const interval = setInterval(() => {
      if (gameOver) {
        clearInterval(interval);
        item.remove();
        return;
      }

      y += speed;
      item.style.top = y + "px";

      // ===== КОЛЛИЗИЯ (до середины героя) =====
      const heroTop = hero.offsetTop;
      const heroMid = heroTop + heroHeight() / 2;

      const collision =
        y + itemSize >= heroMid &&
        x + itemSize >= heroX &&
        x <= heroX + heroWidth();

      if (collision) {
        clearInterval(interval);
        item.remove();

        if (item.dataset.good === "true") {
          score += 10;
          scoreEl.textContent = score;
          baseSpeed = 2 + Math.floor(score / 50);
        } else {
          lives--;
          livesEl.textContent = "❤️".repeat(lives);
          if (lives <= 0) endGame();
        }
      }
if (y > gameArea.clientHeight) {
        clearInterval(interval);
        item.remove();
      }
    }, 16);
  }

  // ===== КОНЕЦ ИГРЫ =====
  function endGame() {
    gameOver = true;

    if (score > record) {
      localStorage.setItem("record", score);
    }

    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0,0,0,0.8)";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.color = "#fff";

    const title = document.createElement("div");
    title.textContent = "💥 Игра окончена";
    title.style.fontSize = "22px";
    title.style.marginBottom = "12px";

    const result = document.createElement("div");
    result.textContent = "Очки: " + score;
    result.style.marginBottom = "16px";
const button = document.createElement("button");
button.textContent = "Начать заново";

// Стили кнопки
button.style.padding = "14px 28px";
button.style.fontSize = "18px";
button.style.border = "none";
button.style.borderRadius = "50px"; // круглая
button.style.background = "#236192"; // основной цвет
button.style.color = "#ffffff"; // белый текст
button.style.cursor = "pointer";
button.style.transition = "all 0.2s ease";

 // Добавим hover эффект
button.addEventListener("mouseover", () => {
  button.style.background = "#1b4d75"; // темнее при наведении
});
button.addEventListener("mouseout", () => {
  button.style.background = "#236192";
});

button.addEventListener("click", () => location.reload());

    overlay.appendChild(title);
    overlay.appendChild(result);
    overlay.appendChild(button);
    gameArea.appendChild(overlay);
  }

  setInterval(spawnItem, 900);
});