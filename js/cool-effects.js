/* ============================================
   董雨飞的技术博客 - Stellar主题炫酷特效
   创新特效：3D卡片倾斜 / 鼠标光轨 / 波纹扩散 / 视差滚动 / 数字动画
   ============================================ */
(function () {
  'use strict';

  /* ========== 0. 雪花飘落动态背景 ========== */
  var snowCanvas = document.createElement('canvas');
  snowCanvas.id = 'snow-bg';
  snowCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;';
  document.documentElement.appendChild(snowCanvas);
  var sctx = snowCanvas.getContext('2d');
  function resizeSnow() {
    snowCanvas.width = window.innerWidth;
    snowCanvas.height = window.innerHeight;
  }
  resizeSnow();
  window.addEventListener('resize', resizeSnow);

  var flakes = [];
  var FLAKE_COUNT = 180;
  for (var fi = 0; fi < FLAKE_COUNT; fi++) {
    flakes.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 3 + 0.8,
      speedY: Math.random() * 1.2 + 0.4,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.02 + 0.008,
      opacity: Math.random() * 0.6 + 0.3
    });
  }
  function drawSnow() {
    sctx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);
    for (var i = 0; i < flakes.length; i++) {
      var f = flakes[i];
      f.sway += f.swaySpeed;
      f.y += f.speedY;
      f.x += Math.sin(f.sway) * 0.6;
      if (f.y > window.innerHeight + 5) { f.y = -5; f.x = Math.random() * window.innerWidth; }
      if (f.x > window.innerWidth + 5) f.x = -5;
      if (f.x < -5) f.x = window.innerWidth + 5;
      sctx.beginPath();
      sctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      sctx.fillStyle = 'rgba(255,255,255,' + f.opacity + ')';
      sctx.fill();
    }
    requestAnimationFrame(drawSnow);
  }
  drawSnow();

  /* ========== 1. 顶部渐变进度条 ========== */
  var bar = document.createElement('div');
  bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;width:0;background:linear-gradient(90deg,#00d4ff,#7c3aed,#ec4899,#00d4ff);background-size:300% 100%;z-index:99999;transition:width .15s ease;box-shadow:0 0 12px #00d4ff;animation:gradientFlow 2s linear infinite;';
  var style = document.createElement('style');
  style.textContent = '@keyframes gradientFlow{0%{background-position:0% 50%}100%{background-position:300% 50%}}';
  document.head.appendChild(style);
  document.documentElement.appendChild(bar);

  function updateBar() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (h.scrollTop / max) * 100 : 100;
    bar.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateBar);

  /* ========== 2. 鼠标光轨（渐变拖尾） ========== */
  var trailCanvas = document.createElement('canvas');
  trailCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:99998;';
  document.documentElement.appendChild(trailCanvas);
  var tctx = trailCanvas.getContext('2d');
  function resizeTrail() {
    trailCanvas.width = window.innerWidth;
    trailCanvas.height = window.innerHeight;
  }
  resizeTrail();
  window.addEventListener('resize', resizeTrail);

  var trail = [];
  var MAX_TRAIL = 20;
  var lastX = 0, lastY = 0;

  window.addEventListener('mousemove', function (e) {
    var dx = e.clientX - lastX;
    var dy = e.clientY - lastY;
    var speed = Math.sqrt(dx * dx + dy * dy);
    lastX = e.clientX;
    lastY = e.clientY;
    if (speed > 3) {
      trail.push({ x: e.clientX, y: e.clientY, life: 1, hue: 190 + Math.sin(Date.now() / 500) * 80 });
      if (trail.length > MAX_TRAIL) trail.shift();
    }
  });

  function drawTrail() {
    tctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
    for (var i = 0; i < trail.length; i++) {
      var p = trail[i];
      p.life -= 0.04;
      var size = p.life * 6;
      var grad = tctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
      grad.addColorStop(0, 'hsla(' + p.hue + ',100%,70%,' + p.life * 0.8 + ')');
      grad.addColorStop(1, 'hsla(' + p.hue + ',100%,50%,0)');
      tctx.beginPath();
      tctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      tctx.fillStyle = grad;
      tctx.fill();
    }
    requestAnimationFrame(drawTrail);
  }
  drawTrail();

  /* ========== 3. 卡片3D倾斜效果 ========== */
  function tiltCards() {
    var cards = document.querySelectorAll('.card-widget, .layout-card, .note-item, .archive-item, [class*="card"]:not(.no-tilt)');
    cards.forEach(function (card) {
      if (card.dataset.tilt) return;
      card.dataset.tilt = '1';
      card.style.transition = 'transform .15s ease-out, box-shadow .3s ease';
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var cx = rect.width / 2;
        var cy = rect.height / 2;
        var rx = ((y - cy) / cy) * -4;
        var ry = ((x - cx) / cx) * 4;
        card.style.transform = 'perspective(800px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) scale(1.02)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }
  tiltCards();
  setTimeout(tiltCards, 2000);

  /* ========== 4. 点击波纹扩散 ========== */
  document.addEventListener('click', function (e) {
    var ripple = document.createElement('div');
    ripple.style.cssText = 'position:fixed;left:' + e.clientX + 'px;top:' + e.clientY + 'px;width:10px;height:10px;border-radius:50%;border:2px solid #00d4ff;z-index:99997;pointer-events:none;transform:translate(-50%,-50%);animation:rippleExpand .6s ease-out forwards;';
    document.body.appendChild(ripple);
    setTimeout(function () { ripple.remove(); }, 600);
  });
  var rippleStyle = document.createElement('style');
  rippleStyle.textContent = '@keyframes rippleExpand{0%{width:10px;height:10px;opacity:1}100%{width:100px;height:100px;opacity:0}}';
  document.head.appendChild(rippleStyle);

  /* ========== 5. 文章进入视口动画 ========== */
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  function observePosts() {
    document.querySelectorAll('.layout-card, .note-item, .archive-item').forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity .6s ease, transform .6s ease';
      observer.observe(el);
    });
  }
  observePosts();
  setTimeout(observePosts, 1500);

  /* ========== 6. 标题渐变色 ========== */
  var titleStyle = document.createElement('style');
  titleStyle.textContent = `
    .article-title, .post-title h1, h1 {
      background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 50%, #ec4899 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    ::selection { background: rgba(0,212,255,.3); color: #00d4ff; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: linear-gradient(180deg,#00d4ff,#7c3aed); border-radius: 3px; }
    a:hover { transition: all .2s; }
  `;
  document.head.appendChild(titleStyle);

  /* ========== 7. 导航栏毛玻璃+发光 ========== */
  setTimeout(function () {
    var nav = document.querySelector('nav, .navbar, #nav, header');
    if (nav) {
      nav.style.backdropFilter = 'blur(16px)';
      nav.style.webkitBackdropFilter = 'blur(16px)';
    }
  }, 1000);

  console.log('%c✨ Stellar特效已加载', 'color:#00d4ff;font-size:13px;font-weight:bold;');
})();
