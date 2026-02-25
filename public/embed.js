(function () {
  "use strict";

  // ─── CONFIG ───
  var WIDGET_URL = "https://hta-chatbot.vercel.app";
  var BUTTON_SIZE = 70;
  var BUTTON_MARGIN = 24;
  var CHAT_WIDTH = 420;
  var CHAT_HEIGHT = 650;
  var CHAT_MARGIN = 24;
  var Z_INDEX = 2147483647;

  // ─── STATE ───
  var isOpen = false;
  var iframe = null;
  var triggerBtn = null;
  var style = null;

  // ─── INJECT STYLES INTO HOST PAGE ───
  function injectStyles() {
    style = document.createElement("style");
    style.id = "hta-chatbot-embed-styles";
    style.textContent =
      /* ── Trigger button ── */
      "#hta-chat-trigger {" +
      "  position: fixed;" +
      "  bottom: " + BUTTON_MARGIN + "px;" +
      "  right: " + BUTTON_MARGIN + "px;" +
      "  width: " + BUTTON_SIZE + "px;" +
      "  height: " + BUTTON_SIZE + "px;" +
      "  border-radius: 50%;" +
      "  border: none;" +
      "  cursor: pointer;" +
      "  z-index: " + Z_INDEX + ";" +
      "  background: radial-gradient(circle at 30% 30%, #d4854a, #C0581C 60%, #8a3e10);" +
      "  box-shadow: 0 4px 20px rgba(192, 88, 28, 0.5), 0 8px 40px rgba(0,0,0,0.3);" +
      "  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease;" +
      "  display: flex;" +
      "  align-items: center;" +
      "  justify-content: center;" +
      "  padding: 0;" +
      "  outline: none;" +
      "  overflow: visible;" +
      "}" +
      "#hta-chat-trigger:hover {" +
      "  transform: scale(1.08);" +
      "  box-shadow: 0 6px 28px rgba(192, 88, 28, 0.6), 0 12px 50px rgba(0,0,0,0.35);" +
      "}" +
      "#hta-chat-trigger.hta-hidden { display: none !important; }" +
      "#hta-chat-trigger img {" +
      "  width: 42px;" +
      "  height: 42px;" +
      "  object-fit: contain;" +
      "  border-radius: 50%;" +
      "  pointer-events: none;" +
      "}" +

      /* ── Hover lines ── */
      "#hta-chat-trigger .hta-hover-lines { position:absolute; top:-10px; left:-10px; width:40px; height:40px; pointer-events:none; z-index:5; }" +
      "#hta-chat-trigger .hta-hline { position:absolute; background:linear-gradient(to bottom,#22d3ee,#154054); border-radius:10px; opacity:0; transition:all 0.4s cubic-bezier(0.175,0.885,0.32,1.275); filter:drop-shadow(0 0 5px rgba(60,88,95,0.8)); }" +
      "#hta-chat-trigger .hta-l1 { width:3px; height:10px; transform:rotate(-45deg); top:15px; left:5px; }" +
      "#hta-chat-trigger .hta-l2 { width:3px; height:10px; transform:rotate(-25deg); top:5px; left:15px; }" +
      "#hta-chat-trigger .hta-l3 { width:3px; height:10px; transform:rotate(0deg); top:0px; left:28px; }" +
      "#hta-chat-trigger:hover .hta-hline { opacity:1; }" +
      "#hta-chat-trigger:hover .hta-l1 { transform:rotate(-45deg) translate(-5px,-5px); }" +
      "#hta-chat-trigger:hover .hta-l2 { transform:rotate(-25deg) translate(-3px,-8px); }" +
      "#hta-chat-trigger:hover .hta-l3 { transform:rotate(0deg) translate(2px,-10px); }" +

      /* ── Chat iframe ── */
      "#hta-chat-frame {" +
      "  position: fixed;" +
      "  bottom: " + CHAT_MARGIN + "px;" +
      "  right: " + CHAT_MARGIN + "px;" +
      "  width: " + CHAT_WIDTH + "px;" +
      "  height: " + CHAT_HEIGHT + "px;" +
      "  max-height: calc(100vh - 48px);" +
      "  max-width: calc(100vw - 32px);" +
      "  border: none;" +
      "  border-radius: 28px;" +
      "  z-index: " + Z_INDEX + ";" +
      "  box-shadow: 0 24px 70px rgba(0,0,0,0.4), 0 0 42px rgba(192,98,28,0.24);" +
      "  opacity: 0;" +
      "  transform: translateY(20px) scale(0.95);" +
      "  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);" +
      "  pointer-events: none;" +
      "  background: transparent;" +
      "}" +
      "#hta-chat-frame.hta-open {" +
      "  opacity: 1;" +
      "  transform: translateY(0) scale(1);" +
      "  pointer-events: auto;" +
      "}" +

      /* ── Responsive: Tablet ── */
      "@media screen and (max-width: 1024px) {" +
      "  #hta-chat-frame { width: 400px; height: 630px; }" +
      "  #hta-chat-trigger { width: 64px; height: 64px; }" +
      "}" +

      /* ── Responsive: Small tablet / large phone ── */
      "@media screen and (max-width: 768px) {" +
      "  #hta-chat-frame { width: 380px; height: 600px; bottom: 20px; right: 20px; }" +
      "  #hta-chat-trigger { width: 58px; height: 58px; bottom: 20px; right: 20px; }" +
      "}" +

      /* ── Responsive: Phone ── */
      "@media screen and (max-width: 600px) {" +
      "  #hta-chat-frame {" +
      "    width: calc(100vw - 16px) !important;" +
      "    height: calc(100vh - 80px) !important;" +
      "    max-height: calc(100vh - 80px) !important;" +
      "    bottom: 8px !important;" +
      "    right: 8px !important;" +
      "    left: 8px !important;" +
      "    border-radius: 24px !important;" +
      "  }" +
      "  #hta-chat-trigger { width: 54px; height: 54px; bottom: 18px; right: 18px; }" +
      "  #hta-chat-trigger img { width: 36px; height: 36px; }" +
      "}" +

      /* ── Responsive: Very small phone ── */
      "@media screen and (max-width: 380px) {" +
      "  #hta-chat-frame {" +
      "    width: calc(100vw - 12px) !important;" +
      "    height: calc(100vh - 60px) !important;" +
      "    max-height: calc(100vh - 60px) !important;" +
      "    bottom: 6px !important;" +
      "    right: 6px !important;" +
      "    left: 6px !important;" +
      "    border-radius: 20px !important;" +
      "  }" +
      "  #hta-chat-trigger { width: 50px; height: 50px; bottom: 14px; right: 14px; }" +
      "}";

    document.head.appendChild(style);
  }

  // ─── CREATE TRIGGER BUTTON ───
  function createTrigger() {
    triggerBtn = document.createElement("button");
    triggerBtn.id = "hta-chat-trigger";
    triggerBtn.setAttribute("aria-label", "Open chat");

    var triggerIcon = document.createElement("img");
    triggerIcon.src = WIDGET_URL + "/imag1.webp";
    triggerIcon.alt = "Chat";
    triggerIcon.onerror = function () {
      triggerBtn.innerHTML =
        '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>' +
        "</svg>";
    };
    triggerBtn.appendChild(triggerIcon);

    // Hover lines
    var lines = document.createElement("div");
    lines.className = "hta-hover-lines";
    lines.innerHTML =
      '<span class="hta-hline hta-l1"></span>' +
      '<span class="hta-hline hta-l2"></span>' +
      '<span class="hta-hline hta-l3"></span>';
    triggerBtn.appendChild(lines);

    triggerBtn.addEventListener("click", function () {
      openChat();
    });

    document.body.appendChild(triggerBtn);
  }

  // ─── CREATE IFRAME ───
  function createIframe() {
    iframe = document.createElement("iframe");
    iframe.id = "hta-chat-frame";
    iframe.src = WIDGET_URL + "?embed=true";
    iframe.setAttribute("allow", "microphone; clipboard-write");
    iframe.setAttribute("title", "Transcend Chat Assistant");
    document.body.appendChild(iframe);
  }

  // ─── OPEN / CLOSE ───
  function openChat() {
    if (!iframe) createIframe();
    isOpen = true;
    iframe.classList.add("hta-open");
    triggerBtn.classList.add("hta-hidden");
    // Tell iframe widget it's been opened
    try {
      iframe.contentWindow.postMessage({ type: "HTA_CHAT_OPEN" }, "*");
    } catch (e) {
      // iframe might not be ready yet
    }
  }

  function closeChat() {
    isOpen = false;
    if (iframe) iframe.classList.remove("hta-open");
    if (triggerBtn) triggerBtn.classList.remove("hta-hidden");
  }

  // ─── LISTEN FOR MESSAGES FROM IFRAME ───
  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || !data.type) return;

    switch (data.type) {
      case "HTA_CHAT_CLOSE":
        closeChat();
        break;
      case "HTA_CHAT_READY":
        // Widget loaded and ready
        break;
    }
  });

  // ─── INIT (runs once) ───
  function init() {
    // Prevent double initialization
    if (document.getElementById("hta-chat-trigger")) return;
    if (document.getElementById("hta-chatbot-embed-styles")) return;
    injectStyles();
    createTrigger();
    // Pre-create iframe so it's ready when user clicks
    createIframe();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();