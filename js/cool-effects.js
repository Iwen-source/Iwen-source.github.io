/* ============================================
   董雨飞的技术博客 - Stellar主题炫酷特效
   特效：雪花飘落 / 星空闪烁 / 顶部进度条 / 鼠标光轨 / 波纹扩散 / 视差滚动 / 数字动画 / 3D卡片 / 标题渐变 / 毛玻璃
   ============================================ */
(function () {
  'use strict';

  /* ========== 固定夜景：移除任何主题残留，永远保持夜空模式 ========== */
  try { window.localStorage.removeItem('Stellar.theme'); } catch (e) {}
  var themeKiller = new MutationObserver(function () {
    document.documentElement.removeAttribute('data-theme');
  });
  themeKiller.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  document.documentElement.removeAttribute('data-theme');

  /* 雪花与星星固定为白色（夜景） */
  function snowRGB() {
    return '255,255,255'; // 固定夜景：白色雪花
  }

  /* ========== 0. 雪花飘落（前景层，不挡交互） ========== */
  var snowCanvas = document.createElement('canvas');
  snowCanvas.id = 'snow-bg';
  snowCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9996;pointer-events:none;';
  document.documentElement.appendChild(snowCanvas);
  var sctx = snowCanvas.getContext('2d');
  function resizeSnow() {
    snowCanvas.width = window.innerWidth;
    snowCanvas.height = window.innerHeight;
  }
  resizeSnow();
  window.addEventListener('resize', resizeSnow);

  var flakes = [];
  var FLAKE_COUNT = Math.min(160, Math.max(60, Math.floor(window.innerWidth / 10)));
  var BIG_FLAKE_COUNT = 18; // 大雪花数量
  for (var fi = 0; fi < FLAKE_COUNT + BIG_FLAKE_COUNT; fi++) {
    var isBig = fi >= FLAKE_COUNT;
    flakes.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: isBig ? (Math.random() * 8 + 8) : (Math.random() * 3 + 0.8), // 大雪花 8~16px，小雪花 0.8~3.8px
      speedY: Math.random() * 1.2 + 0.4,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.02 + 0.008,
      opacity: isBig ? (Math.random() * 0.35 + 0.45) : (Math.random() * 0.6 + 0.3), // 大雪花 0.45~0.8 更醒目
      isBig: isBig,
      rot: Math.random() * Math.PI * 2,       // 花瓣旋转角
      rotSpeed: (Math.random() - 0.5) * 0.05  // 花瓣旋转速度
    });
  }
  /* 画六角形雪花：6 条主枝 + 每枝两条 ±60° 侧枝 */
  function drawSnowflake(ctx, x, y, r) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (var i = 0; i < 6; i++) {
      var a = i * Math.PI / 3;
      var cosA = Math.cos(a), sinA = Math.sin(a);
      // 主枝
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + cosA * r, y + sinA * r);
      ctx.stroke();
      // 侧枝：主枝 65% 处向外分叉（±60°）
      var bx = x + cosA * r * 0.65;
      var by = y + sinA * r * 0.65;
      var l = r * 0.35;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(a + Math.PI / 3) * l, by + Math.sin(a + Math.PI / 3) * l);
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(a - Math.PI / 3) * l, by + Math.sin(a - Math.PI / 3) * l);
      ctx.stroke();
    }
  }
  function drawSnow() {
    sctx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);
    var rgb = snowRGB();
    for (var i = 0; i < flakes.length; i++) {
      var f = flakes[i];
      f.sway += f.swaySpeed;
      f.rot += f.rotSpeed;
      f.y += f.speedY;
      f.x += Math.sin(f.sway) * 0.6;
      if (f.y > window.innerHeight + 5) { f.y = -5; f.x = Math.random() * window.innerWidth; }
      if (f.x > window.innerWidth + 5) f.x = -5;
      if (f.x < -5) f.x = window.innerWidth + 5;
      if (f.isBig) {
        // 大雪花：六角形晶体
        sctx.strokeStyle = 'rgba(' + rgb + ',' + f.opacity + ')';
        sctx.lineWidth = Math.max(1, f.r * 0.18);
        drawSnowflake(sctx, f.x, f.y, f.r);
      } else {
        // 小雪花：细碎圆点
        sctx.beginPath();
        sctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        sctx.fillStyle = 'rgba(' + rgb + ',' + f.opacity + ')';
        sctx.fill();
      }
    }
    requestAnimationFrame(drawSnow);
  }
  drawSnow();

  /* ========== 0.5 星空闪烁（前景层，透明背景） ========== */
  var starCanvas = document.createElement('canvas');
  starCanvas.id = 'star-bg';
  starCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9995;pointer-events:none;';
  document.documentElement.appendChild(starCanvas);
  var stctx = starCanvas.getContext('2d');
  function resizeStars() {
    starCanvas.width = window.innerWidth;
    starCanvas.height = window.innerHeight;
  }
  resizeStars();
  window.addEventListener('resize', resizeStars);

  var stars = [];
  var STAR_COUNT = Math.min(90, Math.floor(window.innerWidth / 18));
  for (var sj = 0; sj < STAR_COUNT; sj++) {
    stars.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.03 + 0.01
    });
  }
  function drawStars() {
    stctx.clearRect(0, 0, starCanvas.width, starCanvas.height);
    var srgb = snowRGB();
    for (var s = 0; s < stars.length; s++) {
      var st = stars[s];
      st.phase += st.speed;
      var twinkle = (Math.sin(st.phase) + 1) / 2;
      stctx.beginPath();
      stctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      stctx.fillStyle = 'rgba(' + srgb + ',' + (twinkle * 0.7 + 0.1) + ')';
      stctx.fill();
    }
    requestAnimationFrame(drawStars);
  }
  drawStars();

  /* ========== 1. 顶部渐变进度条 ========== */
  var bar = document.createElement('div');
  bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;width:0;background:linear-gradient(90deg,#00E5FF,#7C3AED,#00B4FF,#00E5FF);background-size:300% 100%;z-index:99999;transition:width .15s ease;box-shadow:0 0 12px #00E5FF;animation:gradientFlow 2s linear infinite;';
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
  trailCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9998;';
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
      trail.push({ x: e.clientX, y: e.clientY, life: 1, hue: 185 + Math.sin(Date.now() / 500) * 30 });
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
    ripple.style.cssText = 'position:fixed;left:' + e.clientX + 'px;top:' + e.clientY + 'px;width:10px;height:10px;border-radius:50%;border:2px solid #00E5FF;z-index:9997;pointer-events:none;transform:translate(-50%,-50%);animation:rippleExpand .6s ease-out forwards;';
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
      background: linear-gradient(135deg, #00E5FF 0%, #7C3AED 55%, #FF4D6D 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    ::selection { background: rgba(0,229,255,.3); color: #0284C7; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: linear-gradient(180deg,#00E5FF,#7C3AED); border-radius: 3px; }
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

  /* ========== 8. 页面不可见时暂停雪花与星空（省性能） ========== */
  document.addEventListener('visibilitychange', function () {
    document.documentElement.style.setProperty('--fx-paused', document.hidden ? 'paused' : '');
  });

  /* ========== 8. 流星雨：点击页面触发，大量流星划过夜空 ========== */
  var meteorCanvas = document.createElement('canvas');
  meteorCanvas.id = 'meteor-layer';
  meteorCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9994;pointer-events:none;';
  document.documentElement.appendChild(meteorCanvas);
  var mctx = meteorCanvas.getContext('2d');
  function resizeMeteor() {
    meteorCanvas.width = window.innerWidth;
    meteorCanvas.height = window.innerHeight;
  }
  resizeMeteor();
  window.addEventListener('resize', resizeMeteor);

  var meteors = [];
  var METEOR_DECAY = 0.01;

  function spawnMeteor() {
    var w = meteorCanvas.width;
    var h = meteorCanvas.height;
    meteors.push({
      x: Math.random() * w * 1.15 - w * 0.07,          // 从天空上部/侧面任意处
      y: Math.random() * h * 0.45,
      angle: Math.PI / 4 + (Math.random() * 0.5 - 0.25), // 斜向下方（45°±15°）
      speed: 7 + Math.random() * 7,
      len: 140 + Math.random() * 150,                    // 修长拖尾
      life: 1,
      decay: 0.005 + Math.random() * 0.01,
      width: 1.2 + Math.random() * 1.8                   // 细锐流星
    });
  }

  function shootMeteorShower() {
    var n = 32 + Math.floor(Math.random() * 26); // 每次 32~57 颗
    for (var i = 0; i < n; i++) {
      (function (delay) {
        setTimeout(spawnMeteor, delay);
      })(i * 55 + Math.random() * 50); // 接连涌现，形成"很多很多"的流星雨
    }
  }
  document.addEventListener('click', shootMeteorShower);

  function drawMeteors() {
    mctx.clearRect(0, 0, meteorCanvas.width, meteorCanvas.height);
    for (var i = meteors.length - 1; i >= 0; i--) {
      var mt = meteors[i];
      mt.x += Math.cos(mt.angle) * mt.speed;
      mt.y += Math.sin(mt.angle) * mt.speed;
      mt.life -= mt.decay;
      if (mt.life <= 0 || mt.y > meteorCanvas.height + 30 || mt.x > meteorCanvas.width + 30) {
        meteors.splice(i, 1);
        continue;
      }
      var hx = mt.x, hy = mt.y;
      var len = mt.len * (0.35 + 0.65 * mt.life); // 尾部随流星消失自然缩短
      var cosA = Math.cos(mt.angle), sinA = Math.sin(mt.angle);
      // 头部辉光（柔和的淡蓝光晕）
      var glowR = mt.width * 7;
      var glow = mctx.createRadialGradient(hx, hy, 0, hx, hy, glowR);
      glow.addColorStop(0, 'rgba(205,228,255,' + (mt.life * 0.55) + ')');
      glow.addColorStop(1, 'rgba(205,228,255,0)');
      mctx.fillStyle = glow;
      mctx.fillRect(hx - glowR, hy - glowR, glowR * 2, glowR * 2);
      // 锥形拖尾：分段绘制，线宽从头到尾递减，颜色渐隐（告别生硬直线）
      var SEGS = 10;
      for (var s = 0; s < SEGS; s++) {
        var t0 = s / SEGS;
        var t1 = (s + 1) / SEGS;
        var x0 = hx - cosA * len * t0;
        var y0 = hy - sinA * len * t0;
        var x1 = hx - cosA * len * t1;
        var y1 = hy - sinA * len * t1;
        mctx.strokeStyle = 'rgba(215,235,255,' + (mt.life * (1 - t0) * 0.9) + ')';
        mctx.lineWidth = Math.max(0.3, mt.width * (1 - t0));
        mctx.lineCap = 'round';
        mctx.beginPath();
        mctx.moveTo(x0, y0);
        mctx.lineTo(x1, y1);
        mctx.stroke();
      }
      // 头部亮核
      mctx.beginPath();
      mctx.arc(hx, hy, mt.width * 1.5, 0, Math.PI * 2);
      mctx.fillStyle = 'rgba(255,255,255,' + mt.life + ')';
      mctx.fill();
    }
    requestAnimationFrame(drawMeteors);
  }
  drawMeteors();

  console.log('%c🌠 夜景特效已加载：雪花 + 星空 + 点击流星雨', 'color:#A9C7FF;font-size:13px;font-weight:bold;');
})();
