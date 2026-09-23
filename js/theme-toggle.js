/* ============================================
   主题切换按钮（右上角 白天/黑夜）+ 黑夜星空背景
   ============================================ */
(function () {
  'use strict';

  /* ---------- 当前主题模式 ---------- */
  function currentMode() {
    var t = document.documentElement.getAttribute('data-theme');
    if (t === 'light' || t === 'dark') return t;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /* ---------- 右上角主题切换按钮 ---------- */
  var btn = document.createElement('div');
  btn.id = 'theme-toggle-btn';
  btn.title = '切换白天 / 黑夜主题';
  function updateIcon() {
    btn.textContent = currentMode() === 'dark' ? '☀️' : '🌙';
  }
  updateIcon();
  btn.addEventListener('click', function () {
    var next = currentMode() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { window.localStorage.setItem('Stellar.theme', next); } catch (e) {}
    updateIcon();
  });
  document.body.appendChild(btn);
  // 监听主题变化，图标自动同步
  new MutationObserver(updateIcon).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  /* ---------- 黑夜星空背景层（仅 dark 模式绘制） ---------- */
  var night = document.createElement('canvas');
  night.id = 'night-bg';
  night.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;';
  document.body.appendChild(night);
  var nctx = night.getContext('2d');

  var stars = [];
  var STAR_TOTAL = 150;
  for (var i = 0; i < STAR_TOTAL; i++) {
    stars.push({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.6 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.05 + 0.01
    });
  }
  function resizeNight() {
    night.width = window.innerWidth;
    night.height = window.innerHeight;
  }
  resizeNight();
  window.addEventListener('resize', resizeNight);

  function drawNight() {
    var w = night.width;
    var h = night.height;
    if (currentMode() === 'dark') {
      // 深蓝夜空渐变
      var g = nctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#070b1f');
      g.addColorStop(0.45, '#0b1233');
      g.addColorStop(1, '#04060d');
      nctx.fillStyle = g;
      nctx.fillRect(0, 0, w, h);

      // 星云光晕（蓝紫）
      var nebulas = [
        { x: 0.20, y: 0.30, r: 320, c: 'rgba(80,120,255,0.10)' },
        { x: 0.82, y: 0.68, r: 280, c: 'rgba(160,90,255,0.08)' },
        { x: 0.55, y: 0.12, r: 220, c: 'rgba(60,160,255,0.07)' }
      ];
      for (var k = 0; k < nebulas.length; k++) {
        var nb = nebulas[k];
        var ng = nctx.createRadialGradient(nb.x * w, nb.y * h, 0, nb.x * w, nb.y * h, nb.r);
        ng.addColorStop(0, nb.c);
        ng.addColorStop(1, 'rgba(0,0,0,0)');
        nctx.fillStyle = ng;
        nctx.fillRect(0, 0, w, h);
      }

      // 闪烁星星
      for (var s = 0; s < stars.length; s++) {
        var st = stars[s];
        st.phase += st.speed;
        var tw = (Math.sin(st.phase) + 1) / 2;
        nctx.beginPath();
        nctx.arc(st.x * w, st.y * h, st.r, 0, Math.PI * 2);
        nctx.fillStyle = 'rgba(255,255,255,' + (tw * 0.55 + 0.25) + ')';
        nctx.fill();
      }
    } else {
      nctx.clearRect(0, 0, w, h);
    }
    requestAnimationFrame(drawNight);
  }
  drawNight();

  console.log('%c🌙 主题切换 + 星空背景已加载', 'color:#7c3aed;font-size:13px;font-weight:bold;');
})();
