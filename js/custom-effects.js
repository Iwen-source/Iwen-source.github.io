/* ============================================
   董雨飞的技术博客 - 炫酷特效脚本
   动态壁纸(雪花+星空+渐变) / 加载进度条 / 鼠标粒子 / 卡片悬浮
   ============================================ */

(function () {
  'use strict';

  /* ========================================================
     ★ 动态壁纸：雪花飘落 + 星空闪烁 + 渐变流动背景
     ======================================================== */
  var bgCanvas = document.createElement('canvas');
  bgCanvas.id = 'dynamic-wallpaper';
  bgCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-2;pointer-events:none;';
  document.documentElement.appendChild(bgCanvas);
  var bctx = bgCanvas.getContext('2d');

  function bgResize() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }
  bgResize();
  window.addEventListener('resize', bgResize);

  // 雪花粒子
  var flakes = [];
  var FLAKE_COUNT = Math.min(200, Math.floor(window.innerWidth / 6));
  for (var i = 0; i < FLAKE_COUNT; i++) {
    flakes.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2.5 + 0.8,
      speedY: Math.random() * 0.8 + 0.3,
      speedX: (Math.random() - 0.5) * 0.5,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.02 + 0.01,
      opacity: Math.random() * 0.6 + 0.3
    });
  }

  // 闪烁星星
  var stars = [];
  var STAR_COUNT = 80;
  for (var j = 0; j < STAR_COUNT; j++) {
    stars.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.03 + 0.01
    });
  }

  // 渐变流动色相
  var hue1 = 250, hue2 = 280;
  var hueDir = 1;

  function drawWallpaper() {
    var w = bgCanvas.width;
    var h = bgCanvas.height;

    // 渐变背景（缓慢流动）
    hue1 += hueDir * 0.15;
    hue2 += hueDir * 0.1;
    if (hue1 > 270 || hue1 < 240) hueDir *= -1;
    var grad = bctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, 'hsl(' + hue1 + ',60%,12%)');
    grad.addColorStop(0.5, 'hsl(' + ((hue1+20)%360) + ',50%,18%)');
    grad.addColorStop(1, 'hsl(' + hue2 + ',65%,15%)');
    bctx.fillStyle = grad;
    bctx.fillRect(0, 0, w, h);

    // 闪烁星星
    for (var s = 0; s < stars.length; s++) {
      var st = stars[s];
      st.phase += st.speed;
      var twinkle = (Math.sin(st.phase) + 1) / 2; // 0~1
      bctx.beginPath();
      bctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      bctx.fillStyle = 'rgba(255,255,255,' + (twinkle * 0.8) + ')';
      bctx.fill();
    }

    // 雪花飘落
    for (var f = 0; f < flakes.length; f++) {
      var fl = flakes[f];
      fl.sway += fl.swaySpeed;
      fl.y += fl.speedY;
      fl.x += fl.speedX + Math.sin(fl.sway) * 0.5;

      // 落地后从顶部重生
      if (fl.y > h + 5) {
        fl.y = -5;
        fl.x = Math.random() * w;
      }
      if (fl.x > w + 5) fl.x = -5;
      if (fl.x < -5) fl.x = w + 5;

      bctx.beginPath();
      bctx.arc(fl.x, fl.y, fl.r, 0, Math.PI * 2);
      bctx.fillStyle = 'rgba(255,255,255,' + fl.opacity + ')';
      bctx.fill();
    }

    requestAnimationFrame(drawWallpaper);
  }
  drawWallpaper();

  /* ========== 1. 顶部加载进度条 ========== */
  var bar = document.createElement('div');
  bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;width:0;background:linear-gradient(90deg,#667eea,#764ba2,#f093fb);z-index:99999;transition:width .2s ease,opacity .3s;box-shadow:0 0 10px #667eea;';
  document.documentElement.appendChild(bar);

  function updateBar() {
    var h = document.documentElement;
    var scrolled = h.scrollTop;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (scrolled / max) * 100 : 100;
    bar.style.width = pct + '%';
    bar.style.opacity = pct >= 100 ? '0' : '1';
  }
  window.addEventListener('scroll', updateBar);
  window.addEventListener('load', function () { bar.style.width = '100%'; setTimeout(function(){ bar.style.opacity = '0'; }, 300); });

  /* ========== 2. 鼠标跟随粒子 ========== */
  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99998;';
  document.documentElement.appendChild(canvas);
  var ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  var particles = [];
  var mouseX = 0, mouseY = 0;

  window.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (particles.length < 60 && Math.random() > 0.6) {
      particles.push({
        x: mouseX, y: mouseY,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2 - 0.5,
        life: 1,
        size: Math.random() * 3 + 1,
        hue: Math.floor(Math.random() * 60) + 220
      });
    }
  });

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx; p.y += p.vy; p.life -= 0.02;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(' + p.hue + ',80%,65%,' + p.life + ')';
      ctx.fill();
    }
    requestAnimationFrame(animate);
  }
  animate();

  /* ========== 3. 文章卡片悬浮效果增强 ========== */
  function enhanceCards() {
    var cards = document.querySelectorAll('.post-cards .post-cards__item, .article-sort-item');
    cards.forEach(function (card) {
      if (card.dataset.enhanced) return;
      card.dataset.enhanced = '1';
      card.style.transition = 'transform .3s cubic-bezier(.25,.46,.45,.94), box-shadow .3s ease';
      card.addEventListener('mouseenter', function () {
        card.style.transform = 'translateY(-8px) scale(1.02)';
        card.style.boxShadow = '0 12px 30px rgba(102,126,234,.35)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.boxShadow = '';
      });
    });
  }
  enhanceCards();
  setTimeout(enhanceCards, 1500);

  /* ========== 4. 页面切换淡入 ========== */
  document.documentElement.style.opacity = '0';
  document.documentElement.style.transition = 'opacity .5s ease';
  window.addEventListener('load', function () {
    document.documentElement.style.opacity = '1';
  });

  /* ========== 5. 回到顶部按钮呼吸光效 ========== */
  var observer = new MutationObserver(function () {
    var top = document.getElementById('toTop');
    if (top) {
      top.style.transition = 'all .3s ease';
      top.addEventListener('mouseenter', function () {
        top.style.boxShadow = '0 0 20px rgba(102,126,234,.6)';
      });
      top.addEventListener('mouseleave', function () {
        top.style.boxShadow = '';
      });
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  console.log('%c动态壁纸已加载 ❄️✨', 'color:#667eea;font-size:14px;font-weight:bold;');
})();
