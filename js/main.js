(function () {
  "use strict";
  var S = window.SITE || {};
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;
  document.documentElement.classList.add("js");

  /* ---------- settings from config.js ---------- */
  function host(u) { try { return new URL(u).host; } catch (e) { return u; } }
  document.querySelectorAll("[data-link]").forEach(function (a) {
    var u = a.dataset.link === "lab" ? S.labUrl : S.testUrl;
    if (u) a.href = u;
  });
  document.querySelectorAll("[data-url]").forEach(function (el) {
    var u = el.dataset.url === "lab" ? S.labUrl : S.testUrl;
    if (u) el.textContent = host(u);
  });
  var em = document.querySelector('[data-contact="email"]');
  if (em && S.email) { em.href = "mailto:" + S.email; em.textContent = S.email; }
  var ph = document.querySelector('[data-contact="phone"]');
  if (ph) {
    if (S.phone) { ph.href = "tel:" + S.phone.replace(/[^+\d]/g, ""); ph.textContent = S.phone; }
    else if (S.phone === "") ph.closest("li").remove();
  }
  var li = document.querySelector('[data-contact="linkedin"]');
  if (li && S.linkedin) li.href = S.linkedin;

  /* ---------- nav + scroll progress ---------- */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  var bar = document.getElementById("progress");
  var tl = document.getElementById("timeline");
  function onScroll() {
    nav.classList.toggle("stuck", window.scrollY > 30);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.setProperty("--p", max > 0 ? (window.scrollY / max).toFixed(4) : 0);
    if (tl) {
      var r = tl.getBoundingClientRect();
      tl.style.setProperty("--progress", Math.max(0, Math.min(r.height - 12, window.innerHeight * 0.6 - r.top)) + "px");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll); onScroll();
  function setMenu(open) {
    links.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  toggle.addEventListener("click", function () { setMenu(!links.classList.contains("open")); });
  links.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* ---------- hero: typed roles ---------- */
  var roleEl = document.getElementById("role");
  var roles = ["Mathematics teacher", "Data scientist", "Computer-vision researcher", "Builder of classroom tools"];
  if (roleEl && !reduce) {
    var ri = 0, ci = roles[0].length, dir = -1, wait = 60;
    (function type() {
      if (wait > 0) { wait--; }
      else {
        ci += dir;
        if (ci <= 0) { dir = 1; ri = (ri + 1) % roles.length; ci = 0; }
        if (ci >= roles[ri].length) { dir = -1; ci = roles[ri].length; wait = 50; }
        roleEl.textContent = roles[ri].slice(0, ci);
      }
      setTimeout(type, dir > 0 ? 55 : 28);
    })();
  }

  /* ---------- hero: formulas drift with the pointer ---------- */
  var fxs = [].slice.call(document.querySelectorAll(".fx"));
  if (!reduce && fxs.length && window.matchMedia("(pointer:fine)").matches) {
    var hero = document.querySelector(".hero"), px = 0, py = 0, tx = 0, ty = 0, moving = false;
    hero.addEventListener("pointermove", function (e) {
      tx = e.clientX / window.innerWidth - 0.5; ty = e.clientY / window.innerHeight - 0.5;
      if (!moving) { moving = true; requestAnimationFrame(step); }
    });
    var step = function () {
      px += (tx - px) * 0.08; py += (ty - py) * 0.08;
      fxs.forEach(function (f) { var d = +f.dataset.depth; f.style.transform = "translate(" + (-px * d * 4).toFixed(1) + "px," + (-py * d * 4).toFixed(1) + "px)"; });
      if (Math.abs(tx - px) + Math.abs(ty - py) > 0.002) requestAnimationFrame(step); else moving = false;
    };
  }

  /* ---------- hero board: a curve, the area under it, and a tangent riding along ---------- */
  var cv = document.getElementById("board");
  if (cv && cv.getContext) {
    var ctx = cv.getContext("2d"), W = 0, H = 0, dpr = 1, start = null, raf = null;
    var f = function (x) {
      return H - 62 - 30 * Math.sin(x * 7.2 + 0.6) - 14 * Math.sin(x * 15.5 + 2.1) - 10 * x;
    };
    var size = function () {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    var grid = function () {
      var g = 60;
      ctx.lineWidth = 1; ctx.strokeStyle = "rgba(246,243,234,0.045)";
      ctx.beginPath();
      for (var x = g; x < W; x += g) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); }
      for (var y = g; y < H; y += g) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); }
      ctx.stroke();
    };
    var path = function (upto, close) {
      ctx.beginPath();
      var n = Math.max(2, Math.round(260 * upto));
      for (var i = 0; i <= n; i++) {
        var t = (i / n) * upto, X = t * W, Y = f(t);
        if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
      }
      if (close) { ctx.lineTo(upto * W, H); ctx.lineTo(0, H); ctx.closePath(); }
    };
    var curve = function (upto) {
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.lineWidth = 8; ctx.strokeStyle = "rgba(95,212,255,0.10)"; path(upto); ctx.stroke();
      ctx.lineWidth = 2.4; ctx.strokeStyle = "rgba(95,212,255,0.7)"; path(upto); ctx.stroke();
    };
    var ride = function (t) {
      var X = t * W, Y = f(t), e = 0.002;
      // area under the curve up to the moving point
      var grad = ctx.createLinearGradient(0, H - 110, 0, H);
      grad.addColorStop(0, "rgba(255,95,162,0.34)"); grad.addColorStop(1, "rgba(255,95,162,0.08)");
      ctx.fillStyle = grad; path(t, true); ctx.fill();
      ctx.setLineDash([5, 7]); ctx.lineWidth = 1.5; ctx.strokeStyle = "rgba(255,95,162,0.7)";
      ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X, H); ctx.stroke(); ctx.setLineDash([]);
      // tangent
      var slope = (f(t + e) - f(t - e)) / (2 * e * W);
      var len = Math.min(170, W * 0.2), dx = len / Math.sqrt(1 + slope * slope), dy = slope * dx;
      ctx.lineWidth = 2; ctx.strokeStyle = "rgba(255,200,87,0.9)";
      ctx.beginPath(); ctx.moveTo(X - dx, Y - dy); ctx.lineTo(X + dx, Y + dy); ctx.stroke();
      ctx.fillStyle = "#ffc857"; ctx.beginPath(); ctx.arc(X, Y, 6, 0, 6.3); ctx.fill();
      ctx.font = 'italic 21px "Latin Modern", Georgia, serif';
      ctx.fillStyle = "rgba(255,200,87,0.95)";
      ctx.fillText("dy/dx = " + (-slope).toFixed(2), Math.min(X + 16, W - 150), Y - 18);
      if (X > 150) { ctx.fillStyle = "rgba(255,95,162,0.9)"; ctx.fillText("∫ f(x) dx", Math.max(20, X - 130), H - 16); }
    };
    var frame = function (now) {
      if (start === null) start = now;
      var s = (now - start) / 1000;
      ctx.clearRect(0, 0, W, H); grid();
      var drawn = Math.min(1, Math.max(0, (s - 0.5) / 2.2));
      if (drawn >= 1) ride(0.5 + 0.42 * Math.sin((s - 2.7) * 0.22 - 1.2));
      curve(1 - Math.pow(1 - drawn, 3));
      raf = requestAnimationFrame(frame);
    };
    var still = function () { ctx.clearRect(0, 0, W, H); grid(); ride(0.62); curve(1); };
    size();
    if (reduce) still(); else raf = requestAnimationFrame(frame);
    window.addEventListener("resize", function () { size(); if (reduce) still(); });
    if (!reduce && hasIO) {
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { if (!raf) raf = requestAnimationFrame(frame); }
        else if (raf) { cancelAnimationFrame(raf); raf = null; }
      }).observe(cv);
    }
  }

  /* ---------- scroll reveals ---------- */
  var groups = [
    [".band h2, .section-intro, .about-text p, .paper-title, .paper-meta, .research p, .results, .research .btn, .scan, .write p, .skills, .form", 0],
    [".facts > div", 0.07], [".project", 0.06], [".gallery .g", 0.1], [".reels-head", 0], [".reel", 0.07], [".portal", 0.14], [".contact li", 0.06]
  ];
  groups.forEach(function (g) {
    var byParent = new Map();
    document.querySelectorAll(g[0]).forEach(function (el) {
      el.classList.add("reveal");
      var n = byParent.get(el.parentNode) || 0; byParent.set(el.parentNode, n + 1);
      if (g[1]) el.style.setProperty("--d", (n * g[1]).toFixed(2) + "s");
    });
  });
  var stops = [].slice.call(document.querySelectorAll(".stop"));
  if (hasIO) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add(e.target.classList.contains("stop") ? "seen" : "in"); io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -12% 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
    stops.forEach(function (s) { io.observe(s); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
    stops.forEach(function (s) { s.classList.add("seen"); });
  }

  /* ---------- count-up for the two numbers ---------- */
  if (!reduce && hasIO) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        var end = +e.target.dataset.count, t0 = performance.now();
        (function tick(now) {
          var k = Math.min(1, (now - t0) / 1400), v = Math.round(end * (1 - Math.pow(1 - k, 3)));
          e.target.textContent = v.toLocaleString("en-IN");
          if (k < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll("[data-count]").forEach(function (n) { cio.observe(n); });
  }

  /* ---------- projects: one open at a time ---------- */
  var projects = document.querySelectorAll(".project");
  projects.forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) projects.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* ---------- photo lightbox ---------- */
  var lb = document.getElementById("lightbox"), lbImg = document.getElementById("lbImg"), lbCap = document.getElementById("lbCap");
  document.querySelectorAll(".shot").forEach(function (b) {
    b.setAttribute("aria-label", "Enlarge photo: " + (b.dataset.cap || ""));
    b.addEventListener("click", function () {
      if (!lb.showModal) { window.open(b.dataset.full, "_blank"); return; }
      lbImg.src = b.dataset.full; lbImg.alt = b.querySelector("img").alt; lbCap.textContent = b.dataset.cap || "";
      lb.showModal();
    });
  });
  document.getElementById("lbClose").addEventListener("click", function () { lb.close(); });
  lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });


  /* ---------- reels: filter, scroll, play one at a time ---------- */
  var row = document.getElementById("reelRow"), reelEls = [].slice.call(document.querySelectorAll(".reel"));
  function stopOthers(keep) {
    document.querySelectorAll(".reel video").forEach(function (v) { if (v !== keep) v.pause(); });
  }
  document.querySelectorAll(".reel-play").forEach(function (b) {
    b.addEventListener("click", function () {
      var v = document.createElement("video");
      v.controls = true; v.playsInline = true; v.preload = "metadata";
      v.poster = b.querySelector("img").src; v.src = b.dataset.src;
      v.setAttribute("aria-label", b.getAttribute("aria-label").replace("Play: ", ""));
      v.addEventListener("play", function () { stopOthers(v); });
      b.replaceWith(v); v.play().catch(function () {}); v.focus();
    });
  });
  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      document.querySelectorAll(".chip").forEach(function (c) { var on = c === chip; c.classList.toggle("on", on); c.setAttribute("aria-pressed", String(on)); });
      var want = chip.dataset.filter; stopOthers(null);
      reelEls.forEach(function (r) { r.hidden = want !== "all" && r.dataset.kind !== want; });
      row.scrollTo({ left: 0, behavior: reduce ? "auto" : "smooth" });
    });
  });
  function nudge(dir) { row.scrollBy({ left: dir * row.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" }); }
  document.getElementById("reelPrev").addEventListener("click", function () { nudge(-1); });
  document.getElementById("reelNext").addEventListener("click", function () { nudge(1); });

  /* ---------- write-to-me form → Google Sheet ---------- */
  var form = document.getElementById("noteForm"), status = document.getElementById("noteStatus"), send = document.getElementById("noteSend");
  function say(msg, cls) { status.className = "form-status " + (cls || ""); status.innerHTML = msg; }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var d = new FormData(form), name = (d.get("name") || "").trim(), msg = (d.get("message") || "").trim();
    form.name.classList.toggle("bad", !name); form.message.classList.toggle("bad", !msg);
    if (!name || !msg) { say("Add your name and a message, then send again.", "err"); (name ? form.message : form.name).focus(); return; }
    if (d.get("website")) { say("Message sent. Thank you for writing.", "ok"); form.reset(); return; } // spam trap

    if (!S.formEndpoint) { // not connected yet → fall back to email
      var body = msg + "\n\n" + name + " (" + d.get("role") + ")" + (d.get("contact") ? "\n" + d.get("contact") : "");
      window.location.href = "mailto:" + S.email + "?subject=" + encodeURIComponent("A note from " + name) + "&body=" + encodeURIComponent(body);
      say("Your email app should open with the message ready to send.", "ok");
      return;
    }
    d.append("page", location.href);
    send.disabled = true; send.textContent = "Sending";
    fetch(S.formEndpoint, { method: "POST", mode: "no-cors", body: new URLSearchParams(d) })
      .then(function () { say("Message sent. Thank you for writing.", "ok"); form.reset(); })
      .catch(function () { say('The message did not go through. Check your connection and send again, or email <a href="mailto:' + S.email + '">' + S.email + "</a>.", "err"); })
      .finally(function () { send.disabled = false; send.textContent = "Send message"; });
  });
})();
