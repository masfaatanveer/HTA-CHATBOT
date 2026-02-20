(function () {
  "use strict";

  // ─── CONFIG ───
  var WIDGET_URL = "https://hta-chatbot.vercel.app";
  var Z = 2147483647;

  // ─── STATE ───
  var isOpen = false;
  var iframe = null;
  var btn = null;
  var bubble = null;

  // ─── INJECT STYLES ───
  function injectStyles() {
    var s = document.createElement("style");
    s.id = "hta-embed-styles";
    s.textContent = [

      /* ── TRIGGER BUTTON ── */
      "#hta-trigger{",
      "  position:fixed;bottom:28px;right:28px;",
      "  width:70px;height:70px;",
      "  border-radius:50%;",
      "  background:rgba(255,255,255,0.15);",
      "  backdrop-filter:blur(14px);",
      "  -webkit-backdrop-filter:blur(14px);",
      "  border:none;",
      "  cursor:pointer;",
      "  display:flex;align-items:center;justify-content:center;",
      "  z-index:" + Z + ";",
      "  padding:0;outline:none;",
      "  transition:0.3s cubic-bezier(0.2,0.8,0.2,1);",
      "  overflow:visible;",
      "}",

      "#hta-trigger:hover{",
      "  transform:scale(1.05);",
      "}",

      /* Glow background behind button */
      "#hta-trigger .hta-glow{",
      "  position:absolute;",
      "  inset:-34px;",
      "  border-radius:50%;",
      "  background:radial-gradient(circle,rgba(85,200,255,0.22) 0%,rgba(120,90,255,0.18) 40%,transparent 100%);",
      "  filter:blur(30px);",
      "  opacity:0.55;",
      "  pointer-events:none;",
      "}",

      /* Icon wrapper */
      "#hta-trigger .hta-icon-wrap{",
      "  filter:drop-shadow(rgba(150,220,255,0.35) 0 0 4px);",
      "  display:flex;align-items:center;justify-content:center;",
      "}",

      /* Logo inside button */
      "#hta-trigger .hta-btn-logo{",
      "  width:42px;height:42px;",
      "  object-fit:contain;",
      "  pointer-events:none;",
      "}",

      /* ── HOVER LINES ── */
      "#hta-trigger .hta-hover-lines{",
      "  position:absolute;",
      "  top:-10px;left:-10px;",
      "  width:40px;height:40px;",
      "  pointer-events:none;",
      "  z-index:5;",
      "}",

      "#hta-trigger .hta-hline{",
      "  position:absolute;",
      "  background:linear-gradient(to bottom,#22d3ee,#154054);",
      "  border-radius:10px;",
      "  opacity:0;",
      "  transition:all 0.4s cubic-bezier(0.175,0.885,0.32,1.275);",
      "  filter:drop-shadow(0 0 5px rgba(60,88,95,0.8));",
      "}",

      "#hta-trigger .hta-l1{width:3px;height:10px;transform:rotate(-45deg);top:15px;left:5px}",
      "#hta-trigger .hta-l2{width:3px;height:10px;transform:rotate(-25deg);top:5px;left:15px}",
      "#hta-trigger .hta-l3{width:3px;height:10px;transform:rotate(0deg);top:0px;left:28px}",

      "#hta-trigger:hover .hta-hline{opacity:1}",
      "#hta-trigger:hover .hta-l1{transform:rotate(-45deg) translate(-5px,-5px)}",
      "#hta-trigger:hover .hta-l2{transform:rotate(-25deg) translate(-3px,-8px)}",
      "#hta-trigger:hover .hta-l3{transform:rotate(0deg) translate(2px,-10px)}",

      /* X icon — hidden by default */
      "#hta-trigger .hta-btn-x{",
      "  display:none;",
      "  pointer-events:none;",
      "}",

      /* Open state */
      "#hta-trigger.hta-open{",
      "  transform:rotate(90deg);",
      "}",
      "#hta-trigger.hta-open:hover{",
      "  transform:rotate(90deg) scale(1.05);",
      "}",
      "#hta-trigger.hta-open .hta-icon-wrap{display:none}",
      "#hta-trigger.hta-open .hta-hover-lines{display:none}",
      "#hta-trigger.hta-open .hta-glow{display:none}",
      "#hta-trigger.hta-open .hta-btn-x{display:block}",

      /* ── GREETING BUBBLE ── */
      "#hta-greeting{",
      "  position:fixed;bottom:38px;right:110px;",
      "  background:rgba(26,26,26,0.85);",
      "  backdrop-filter:blur(14px);",
      "  -webkit-backdrop-filter:blur(14px);",
      "  border:1.5px solid rgba(255,255,255,0.2);",
      "  color:#fff;",
      "  padding:14px 22px;",
      "  border-radius:50px;",
      '  font-family:"SF Pro Display",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;',
      "  font-size:14px;font-weight:600;",
      "  box-shadow:0 8px 24px rgba(0,0,0,0.5),0 0 42px rgba(192,98,28,0.15);",
      "  cursor:pointer;",
      "  z-index:" + (Z - 1) + ";",
      "  display:flex;align-items:center;gap:10px;",
      "  transform-origin:bottom right;",
      "  animation:htaZI 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;",
      "}",

      "#hta-greeting.hta-hide{",
      "  animation:htaZO 0.3s cubic-bezier(0.6,0,0.4,1) forwards;",
      "  pointer-events:none;",
      "}",

      "@keyframes htaZI{",
      "  from{opacity:0;transform:scale(0.3) translateY(20px)}",
      "  to{opacity:1;transform:scale(1) translateY(0)}",
      "}",
      "@keyframes htaZO{",
      "  from{opacity:1;transform:scale(1) translateY(0)}",
      "  to{opacity:0;transform:scale(0.3) translateY(20px)}",
      "}",

      /* ── IFRAME ── */
      "#hta-frame{",
      "  position:fixed;",
      "  bottom:110px;right:24px;",
      "  width:420px;height:648px;",
      "  border:1.5px solid rgba(255,255,255,0.2);",
      "  border-radius:28px;",
      "  overflow:hidden;",
      "  z-index:" + Z + ";",
      "  opacity:0;",
      "  transform:translateY(30px) scale(0.95);",
      "  transition:opacity 0.4s cubic-bezier(0.16,1,0.3,1),transform 0.4s cubic-bezier(0.16,1,0.3,1);",
      "  pointer-events:none;",
      "  background:linear-gradient(135deg,rgb(71,54,42) 0%,rgb(40,30,24) 50%,rgb(26,26,26) 100%);",
      "  box-shadow:rgba(192,98,28,0.24) 0 0 42px,rgba(0,0,0,0.4) 0 24px 70px;",
      "  visibility:hidden;",
      "}",

      "#hta-frame.hta-open{",
      "  opacity:1;transform:translateY(0) scale(1);pointer-events:auto;",
      "  visibility:visible;",
      "}",

      /* ── MOBILE ── */
      "@media(max-width:600px){",
      "  #hta-frame{",
      "    width:calc(100vw - 24px)!important;height:calc(100vh - 180px)!important;",
      "    bottom:100px!important;right:12px!important;",
      "  }",
      "  #hta-trigger{",
      "    width:64px!important;height:64px!important;",
      "    bottom:20px!important;right:20px!important;",
      "  }",
      "  #hta-greeting{",
      "    right:96px!important;bottom:28px!important;",
      "    font-size:13px!important;padding:12px 18px!important;",
      "  }",
      "}",

      "@media(max-width:480px){",
      "  #hta-frame{",
      "    width:calc(100vw - 16px)!important;height:calc(100vh - 160px)!important;",
      "    right:8px!important;bottom:90px!important;",
      "    border-radius:24px!important;",
      "  }",
      "  #hta-trigger{width:58px!important;height:58px!important}",
      "  #hta-trigger .hta-btn-logo{width:34px!important;height:34px!important}",
      "}",

    ].join("\n");
    document.head.appendChild(s);
  }

  // ─── CREATE TRIGGER BUTTON ───
  function createTrigger() {
    btn = document.createElement("button");
    btn.id = "hta-trigger";
    btn.setAttribute("aria-label", "Open chat");

    // Glow bg
    var glow = document.createElement("div");
    glow.className = "hta-glow";
    btn.appendChild(glow);

    // Hover lines (3 animated lines)
    var lines = document.createElement("div");
    lines.className = "hta-hover-lines";
    lines.innerHTML = '<span class="hta-hline hta-l1"></span><span class="hta-hline hta-l2"></span><span class="hta-hline hta-l3"></span>';
    btn.appendChild(lines);

    // Icon wrapper + logo
    var iconWrap = document.createElement("div");
    iconWrap.className = "hta-icon-wrap";
    var logo = document.createElement("img");
    logo.className = "hta-btn-logo";
    logo.src = WIDGET_URL + "/imag1.webp";
    logo.alt = "Transcend";
    logo.onerror = function () { this.style.display = "none"; };
    iconWrap.appendChild(logo);
    btn.appendChild(iconWrap);

    // X icon (shown when open)
    var x = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    x.setAttribute("class", "hta-btn-x");
    x.setAttribute("width", "28");
    x.setAttribute("height", "28");
    x.setAttribute("viewBox", "0 0 24 24");
    x.setAttribute("fill", "none");
    x.setAttribute("stroke", "white");
    x.setAttribute("stroke-width", "2.5");
    x.innerHTML = '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>';
    btn.appendChild(x);

    btn.addEventListener("click", toggle);
    document.body.appendChild(btn);
  }

  // ─── CREATE GREETING BUBBLE ───
  function createGreeting() {
    bubble = document.createElement("div");
    bubble.id = "hta-greeting";
    bubble.innerHTML = '<span>Need Theater Help?</span><span style="font-size:20px">\uD83C\uDFAC</span>';
    bubble.addEventListener("click", function () { openChat(); });
    document.body.appendChild(bubble);
  }

  // ─── CREATE IFRAME (preloaded on page load, hidden until clicked) ───
  function createIframe() {
    iframe = document.createElement("iframe");
    iframe.id = "hta-frame";
    iframe.src = WIDGET_URL + "/?embed=true";
    iframe.setAttribute("allow", "microphone; clipboard-write");
    iframe.setAttribute("title", "Transcend Chat Assistant");
    document.body.appendChild(iframe);
  }

  // ─── TOGGLE / OPEN / CLOSE ───
  function toggle() {
    isOpen ? closeChat() : openChat();
  }

  function openChat() {
    if (!iframe) createIframe();
    isOpen = true;
    btn.classList.add("hta-open");
    if (bubble) bubble.classList.add("hta-hide");
    iframe.classList.add("hta-open");
  }

  function closeChat() {
    isOpen = false;
    btn.classList.remove("hta-open");
    if (bubble) bubble.classList.remove("hta-hide");
    if (iframe) iframe.classList.remove("hta-open");
  }

  // ─── LISTEN FOR MESSAGES FROM IFRAME ───
  window.addEventListener("message", function (e) {
    if (e.origin !== WIDGET_URL.replace(/\/$/, "")) return;
    var d = e.data;
    if (d && d.type === "HTA_CHAT_CLOSE") closeChat();
  });

  // ─── INIT ───
  function init() {
    if (document.getElementById("hta-trigger")) return;
    injectStyles();
    createTrigger();
    createGreeting();
    createIframe(); // PRELOAD on page load — instant open when clicked
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();