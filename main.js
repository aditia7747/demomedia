(function () {
  "use strict";

  // 1. Proteksi Anti-Intip Source Code
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && ["I", "i", "J", "j", "C", "c"].includes(e.key)) ||
      (e.ctrlKey && ["U", "u", "S", "s"].includes(e.key))
    ) {
      e.preventDefault();
      return false;
    }
  });

  // 2. Suntikkan Meta, Font & Seluruh Desain Visual Taktil ke <head>
  document.head.insertAdjacentHTML(
    "beforeend",
    `<meta http-equiv="X-Content-Type-Options" content="nosniff">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@600;700&family=Outfit:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <style>
      :root {
        --bg-base: #050811;
        --bg-surface: #0b1122;
        --bg-elevated: #121b36;
        --primary: #00e5ff;
        --primary-dark: #0099b8;
        --secondary: #6366f1;
        --ledge-primary: #006b85;
        --ledge-dark: #03050b;
        --text-main: #f8fafc;
        --text-sub: #94a3b8;
        --border-light: rgba(255, 255, 255, 0.11);
        --border-accent: rgba(0, 229, 255, 0.3);
        --glow-color: rgba(0, 229, 255, 0.2);
      }

      [data-theme="gold"] {
        --primary: #fbbf24;
        --primary-dark: #d97706;
        --secondary: #f59e0b;
        --ledge-primary: #854d0e;
        --border-accent: rgba(251, 191, 36, 0.34);
        --glow-color: rgba(251, 191, 36, 0.2);
      }

      [data-theme="emerald"] {
        --primary: #10b981;
        --primary-dark: #059669;
        --secondary: #0ea5e9;
        --ledge-primary: #065f46;
        --border-accent: rgba(16, 185, 129, 0.34);
        --glow-color: rgba(16, 185, 129, 0.2);
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        -webkit-tap-highlight-color: transparent;
      }

      html, body {
        width: 100%;
        min-height: 100vh;
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        background-color: var(--bg-base);
        color: var(--text-main);
        overflow-x: hidden;
        scroll-behavior: smooth;
      }

      body {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 18px 14px 54px;
        position: relative;
        background-image:
          radial-gradient(circle at 12% 8%, var(--glow-color), transparent 38%),
          radial-gradient(circle at 88% 92%, rgba(99, 102, 241, 0.14), transparent 42%),
          linear-gradient(rgba(255, 255, 255, 0.018) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.018) 1px, transparent 1px);
        background-size: 100% 100%, 100% 100%, 34px 34px, 34px 34px;
      }

      .app-shell {
        width: 100%;
        max-width: 520px;
        position: relative;
        z-index: 2;
      }

      /* Top Navigation Bar */
      .top-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 11px 16px;
        margin-bottom: 20px;
        background: linear-gradient(180deg, rgba(24, 34, 66, 0.94) 0%, rgba(10, 15, 31, 0.98) 100%);
        border-radius: 20px;
        border: 1px solid var(--border-light);
        box-shadow:
          0 7px 0 var(--ledge-dark),
          0 14px 28px rgba(0, 0, 0, 0.65),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }

      .brand-mini {
        display: flex;
        align-items: center;
        gap: 9px;
        font-family: 'Outfit', sans-serif;
        font-weight: 800;
        font-size: 15px;
        letter-spacing: -0.2px;
        color: #ffffff;
      }

      .brand-mini-badge {
        width: 30px;
        height: 30px;
        border-radius: 9px;
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        color: #040711;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        box-shadow: 0 3px 0 var(--ledge-primary), inset 0 1px 0 rgba(255, 255, 255, 0.5);
      }

      .top-controls {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .theme-switcher {
        display: flex;
        align-items: center;
        gap: 9px;
        background: #060914;
        padding: 5px 9px;
        border-radius: 99px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.75);
      }

      .theme-dot {
        width: 21px;
        height: 21px;
        border-radius: 50%;
        cursor: pointer;
        border: 2px solid rgba(255, 255, 255, 0.25);
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.5), inset 0 2px 3px rgba(255, 255, 255, 0.45);
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.2s;
      }

      .theme-dot.active {
        transform: scale(1.18);
        border-color: #ffffff;
        box-shadow: 0 0 12px var(--primary), inset 0 2px 3px rgba(255, 255, 255, 0.65);
      }

      .btn-tactile-icon {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        background: linear-gradient(180deg, #1f2b4f 0%, #10172d 100%);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: var(--text-main);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 14px;
        box-shadow:
          0 4px 0 var(--ledge-dark),
          0 7px 14px rgba(0, 0, 0, 0.45),
          inset 0 1px 0 rgba(255, 255, 255, 0.18);
        transition: transform 0.12s, box-shadow 0.12s, color 0.2s;
      }

      .btn-tactile-icon:hover { color: var(--primary); }
      .btn-tactile-icon:active {
        transform: translateY(3px);
        box-shadow: 0 1px 0 var(--ledge-dark);
      }

      /* Hero Header */
      .hero-header {
        text-align: center;
        margin-bottom: 20px;
      }

      .hero-title {
        font-family: 'Outfit', sans-serif;
        font-size: clamp(27px, 6.8vw, 34px);
        font-weight: 800;
        letter-spacing: -0.6px;
        background: linear-gradient(180deg, #ffffff 25%, var(--primary) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        filter: drop-shadow(0 5px 14px rgba(0, 0, 0, 0.6));
        margin-bottom: 6px;
      }

      .hero-sub {
        font-size: 13px;
        color: var(--text-sub);
        font-weight: 500;
      }

      .metrics-bar {
        display: inline-flex;
        align-items: center;
        flex-wrap: wrap;
        justify-content: center;
        gap: 14px;
        margin-top: 12px;
        padding: 7px 16px;
        border-radius: 99px;
        background: linear-gradient(180deg, #0e152b, #080c19);
        border: 1px solid var(--border-light);
        font-size: 11.5px;
        color: var(--text-sub);
        box-shadow:
          0 4px 0 var(--ledge-dark),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }

      .metrics-bar strong {
        font-family: 'JetBrains Mono', monospace;
        color: var(--primary);
      }

      /* Main Vault Card */
      .vault-card {
        background: linear-gradient(165deg, rgba(22, 32, 62, 0.95) 0%, rgba(9, 14, 29, 0.98) 100%);
        border-radius: 28px;
        padding: 20px;
        border: 1.5px solid var(--border-accent);
        box-shadow:
          0 12px 0 var(--ledge-dark),
          0 26px 52px rgba(0, 0, 0, 0.8),
          inset 0 1px 1px rgba(255, 255, 255, 0.22);
        backdrop-filter: blur(16px);
      }

      /* Segmented 4-Platform Switcher */
      .platform-deck {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 7px;
        background: #060913;
        padding: 6px;
        border-radius: 18px;
        margin-bottom: 16px;
        border: 1px solid rgba(255, 255, 255, 0.07);
        box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.8);
      }

      .deck-btn {
        border: 1px solid transparent;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
        color: var(--text-sub);
        font-family: inherit;
        font-size: 11.5px;
        font-weight: 800;
        padding: 10px 6px;
        border-radius: 13px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 5px;
        transition: all 0.18s ease;
      }

      .deck-btn i {
        font-size: 15px;
      }

      .deck-btn:hover:not(.active) {
        color: #ffffff;
        border-color: rgba(255, 255, 255, 0.1);
      }

      .deck-btn.active {
        background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
        color: #040711;
        box-shadow:
          0 4px 0 var(--ledge-primary),
          0 8px 18px var(--glow-color),
          inset 0 1px 0 rgba(255, 255, 255, 0.5);
        transform: translateY(-1px);
      }

      .deck-btn.active:active {
        transform: translateY(2px);
        box-shadow: 0 1px 0 var(--ledge-primary);
      }

      .tab-view { display: none; }
      .tab-view.active { display: block; animation: viewFadeIn 0.24s ease-out; }

      @keyframes viewFadeIn {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Platform Mode Banner */
      .engine-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 9px 13px;
        margin-bottom: 12px;
        border-radius: 13px;
        background: rgba(6, 10, 21, 0.75);
        border: 1px solid rgba(255, 255, 255, 0.08);
        font-size: 11.5px;
        color: #cbd5e1;
        box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.55);
      }

      .engine-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-weight: 800;
        color: var(--primary);
      }

      .auto-detect-pill {
        font-size: 10.5px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 99px;
        background: rgba(0, 229, 255, 0.12);
        border: 1px solid var(--border-accent);
        color: var(--primary);
      }

      /* Input Field Well */
      .field-wrap {
        position: relative;
        display: flex;
        align-items: center;
        margin-bottom: 14px;
      }

      .field-wrap i.prefix-icon {
        position: absolute;
        left: 16px;
        color: var(--primary);
        font-size: 15px;
        pointer-events: none;
        transition: transform 0.2s;
      }

      .field-input {
        width: 100%;
        padding: 15px 102px 15px 44px;
        border-radius: 16px;
        background: #050812;
        border: 1.5px solid rgba(255, 255, 255, 0.13);
        color: #ffffff;
        font-family: inherit;
        font-size: 13.5px;
        font-weight: 500;
        outline: none;
        box-shadow:
          inset 0 4px 9px rgba(0, 0, 0, 0.85),
          0 1px 0 rgba(255, 255, 255, 0.08);
        transition: border-color 0.2s, box-shadow 0.2s;
      }

      .field-input::placeholder { color: #64748b; }
      .field-input:focus {
        border-color: var(--primary);
        box-shadow:
          inset 0 4px 9px rgba(0, 0, 0, 0.85),
          0 0 0 3px var(--glow-color);
      }

      .btn-paste-tactile {
        position: absolute;
        right: 8px;
        background: linear-gradient(180deg, #223059 0%, #121a34 100%);
        border: 1px solid var(--border-accent);
        color: var(--primary);
        padding: 8px 12px;
        border-radius: 11px;
        font-size: 12px;
        font-weight: 800;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
        box-shadow:
          0 3px 0 #050811,
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
        transition: transform 0.12s, box-shadow 0.12s;
      }

      .btn-paste-tactile:active {
        transform: translateY(2px);
        box-shadow: 0 1px 0 #050811;
      }

      .action-row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 10px;
      }

      .btn-primary-tactile {
        background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
        color: #040711;
        border: none;
        padding: 14px 20px;
        border-radius: 16px;
        font-family: 'Outfit', sans-serif;
        font-size: 15px;
        font-weight: 800;
        letter-spacing: 0.2px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        box-shadow:
          0 6px 0 var(--ledge-primary),
          0 12px 24px rgba(0, 0, 0, 0.5),
          inset 0 1px 0 rgba(255, 255, 255, 0.5);
        transition: transform 0.12s, box-shadow 0.12s, filter 0.2s;
      }

      .btn-primary-tactile:hover:not(:disabled) { filter: brightness(1.06); }
      .btn-primary-tactile:active:not(:disabled) {
        transform: translateY(4px);
        box-shadow: 0 2px 0 var(--ledge-primary);
      }
      .btn-primary-tactile:disabled { opacity: 0.65; cursor: wait; }

      .btn-clear-tactile {
        background: linear-gradient(180deg, #1f2b4f 0%, #11182d 100%);
        border: 1px solid rgba(255, 255, 255, 0.13);
        color: #cbd5e1;
        width: 52px;
        border-radius: 16px;
        font-size: 15px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow:
          0 6px 0 var(--ledge-dark),
          0 10px 18px rgba(0, 0, 0, 0.45),
          inset 0 1px 0 rgba(255, 255, 255, 0.16);
        transition: transform 0.12s, box-shadow 0.12s, color 0.2s, border-color 0.2s;
      }

      .btn-clear-tactile:hover {
        color: #fb7185;
        border-color: rgba(251, 113, 133, 0.45);
      }
      .btn-clear-tactile:active {
        transform: translateY(4px);
        box-shadow: 0 2px 0 var(--ledge-dark);
      }

      /* Progress Card */
      .progress-card {
        display: none;
        margin-top: 16px;
        background: #060914;
        border: 1px solid var(--border-accent);
        padding: 12px 14px;
        border-radius: 15px;
        box-shadow: inset 0 3px 6px rgba(0, 0, 0, 0.75);
      }

      .progress-meta {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        font-weight: 700;
        color: var(--primary);
        margin-bottom: 7px;
      }

      .progress-track {
        width: 100%;
        height: 8px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 99px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, var(--primary), var(--secondary));
        transition: width 0.15s ease;
      }

      .status-box {
        margin-top: 18px;
        padding: 24px 16px;
        border-radius: 18px;
        background: rgba(6, 9, 20, 0.8);
        border: 1px solid var(--border-light);
        text-align: center;
        box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.65);
      }

      .loader-ring {
        width: 36px;
        height: 36px;
        border: 3px solid rgba(255, 255, 255, 0.12);
        border-top-color: var(--primary);
        border-radius: 50%;
        animation: spinRing 0.75s linear infinite;
        margin: 0 auto 10px;
      }

      @keyframes spinRing { to { transform: rotate(360deg); } }

      /* Result Vault Card */
      .result-vault {
        margin-top: 20px;
        background: linear-gradient(180deg, #0e162c 0%, #070b17 100%);
        border: 1.5px solid var(--border-accent);
        border-radius: 24px;
        padding: 16px;
        box-shadow:
          0 10px 0 var(--ledge-dark),
          0 22px 42px rgba(0, 0, 0, 0.75),
          inset 0 1px 0 rgba(255, 255, 255, 0.16);
      }

      .creator-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        margin-bottom: 12px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.015));
        border: 1px solid rgba(255, 255, 255, 0.09);
        border-radius: 16px;
        box-shadow:
          0 4px 0 #04060d,
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }

      .creator-profile {
        display: flex;
        align-items: center;
        gap: 11px;
        min-width: 0;
      }

      .creator-avatar {
        width: 46px;
        height: 46px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--primary);
        background: #111827;
        cursor: pointer;
        flex-shrink: 0;
        box-shadow: 0 0 12px var(--glow-color);
      }

      .platform-icon-avatar {
        width: 46px;
        height: 46px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        color: #ffffff;
        flex-shrink: 0;
        box-shadow:
          0 4px 0 rgba(0, 0, 0, 0.5),
          inset 0 1px 0 rgba(255, 255, 255, 0.35);
      }

      .platform-icon-avatar.fb-brand {
        background: linear-gradient(135deg, #1877f2, #0d47a1);
      }

      .platform-icon-avatar.tb-brand {
        background: linear-gradient(135deg, #00d2ff, #3a7bd5);
      }

      .creator-text {
        min-width: 0;
      }

      .creator-text h4 {
        font-size: 14.5px;
        font-weight: 800;
        color: #ffffff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .creator-text a, .creator-text span.sub-handle {
        font-size: 12px;
        color: var(--primary);
        font-weight: 700;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .meta-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 12px;
      }

      .meta-pill {
        font-size: 11px;
        font-weight: 700;
        padding: 5px 10px;
        border-radius: 9px;
        background: #0a1020;
        border: 1px solid rgba(255, 255, 255, 0.09);
        color: #cbd5e1;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        box-shadow: 0 3px 0 #04060d;
      }

      .meta-pill i { color: var(--primary); }

      /* Video Stage (Anti-Black Screen) */
      .video-stage {
        position: relative;
        width: 100%;
        border-radius: 17px;
        overflow: hidden;
        background: #040711;
        margin-bottom: 10px;
        border: 1.5px solid rgba(255, 255, 255, 0.14);
        box-shadow:
          0 6px 0 #03050b,
          0 12px 28px rgba(0, 0, 0, 0.7);
        min-height: 250px;
        max-height: 410px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .video-stage video {
        width: 100%;
        max-height: 410px;
        object-fit: contain;
        display: block;
        position: relative;
        z-index: 1;
      }

      .video-poster-overlay {
        position: absolute;
        inset: 0;
        z-index: 3;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        background: #060913;
        transition: opacity 0.25s ease, visibility 0.25s ease;
      }

      .video-poster-overlay.hidden {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
      }

      .video-poster-overlay img.poster-bg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: brightness(0.8);
        transition: transform 0.35s ease;
      }

      .video-poster-overlay:hover img.poster-bg {
        transform: scale(1.03);
      }

      .play-orb-trigger {
        position: relative;
        z-index: 4;
        width: 68px;
        height: 68px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        color: #040711;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        padding-left: 4px;
        border: 3px solid rgba(255, 255, 255, 0.88);
        box-shadow:
          0 6px 0 var(--ledge-primary),
          0 0 28px var(--primary),
          0 12px 25px rgba(0, 0, 0, 0.75);
        transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .video-poster-overlay:active .play-orb-trigger {
        transform: scale(0.92) translateY(3px);
      }

      .poster-hint {
        position: relative;
        z-index: 4;
        margin-top: 12px;
        padding: 5px 13px;
        border-radius: 99px;
        background: rgba(6, 9, 19, 0.88);
        border: 1px solid var(--border-accent);
        color: #fff;
        font-size: 11.5px;
        font-weight: 700;
        backdrop-filter: blur(6px);
      }

      .video-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 6px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }

      .speed-group {
        display: flex;
        gap: 5px;
      }

      /* Caption & Hashtag Panel */
      .caption-panel {
        background: #090f20;
        border: 1px solid rgba(255, 255, 255, 0.09);
        border-radius: 15px;
        padding: 13px;
        margin-bottom: 12px;
        box-shadow: inset 0 3px 6px rgba(0, 0, 0, 0.6);
      }

      .caption-body {
        font-size: 13px;
        color: #f1f5f9;
        line-height: 1.55;
        margin-bottom: 11px;
        word-break: break-word;
      }

      .hashtag-inline {
        color: var(--primary);
        font-weight: 700;
        background: rgba(0, 229, 255, 0.1);
        padding: 1px 6px;
        border-radius: 6px;
        cursor: pointer;
        display: inline-block;
        margin: 1px 0;
        transition: background 0.15s;
      }

      .hashtag-inline:hover {
        background: rgba(0, 229, 255, 0.25);
      }

      .chip-group {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
      }

      .chip-btn {
        background: linear-gradient(180deg, #1d284b 0%, #10172d 100%);
        border: 1px solid rgba(255, 255, 255, 0.14);
        color: #e2e8f0;
        font-family: inherit;
        font-size: 11.5px;
        font-weight: 700;
        padding: 7px 11px;
        border-radius: 10px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        box-shadow:
          0 3px 0 #050811,
          inset 0 1px 0 rgba(255, 255, 255, 0.15);
        transition: transform 0.1s, border-color 0.2s, color 0.2s;
      }

      .chip-btn:hover, .chip-btn.active {
        border-color: var(--primary);
        color: var(--primary);
      }

      .chip-btn:active {
        transform: translateY(2px);
        box-shadow: 0 1px 0 #050811;
      }

      /* Audio Player Bar */
      .audio-bar {
        background: linear-gradient(90deg, rgba(0, 229, 255, 0.09), rgba(99, 102, 241, 0.09));
        border: 1px solid var(--border-accent);
        border-radius: 15px;
        padding: 11px 13px;
        margin-bottom: 12px;
        box-shadow: 0 4px 0 #04060d, inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }

      .audio-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .audio-info {
        display: flex;
        align-items: center;
        gap: 10px;
        overflow: hidden;
        flex: 1;
      }

      .audio-toggle {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        color: #040711;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        box-shadow: 0 3px 0 var(--ledge-primary);
      }

      .audio-toggle:active {
        transform: translateY(2px);
        box-shadow: 0 1px 0 var(--ledge-primary);
      }

      .audio-meta-text {
        overflow: hidden;
        flex: 1;
      }

      .audio-name {
        font-size: 12.5px;
        font-weight: 700;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: block;
      }

      .audio-time {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10.5px;
        color: var(--text-sub);
      }

      .audio-seek {
        width: 100%;
        height: 5px;
        margin-top: 9px;
        accent-color: var(--primary);
        cursor: pointer;
      }

      .eq-bars {
        display: flex;
        align-items: flex-end;
        gap: 3px;
        height: 16px;
      }

      .eq-bar {
        width: 3px;
        height: 4px;
        background: var(--primary);
        border-radius: 2px;
      }

      .eq-bars.playing .eq-bar {
        animation: eqBounce 0.55s infinite alternate ease-in-out;
      }
      .eq-bars.playing .eq-bar:nth-child(2) { animation-delay: 0.18s; }
      .eq-bars.playing .eq-bar:nth-child(3) { animation-delay: 0.35s; }

      @keyframes eqBounce {
        0% { height: 4px; }
        100% { height: 16px; }
      }

      /* Stats Row */
      .stats-row {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        margin-bottom: 14px;
      }

      .stat-cell {
        background: #0c1326;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 8px 4px;
        text-align: center;
        box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.55);
      }

      .stat-cell i {
        color: var(--primary);
        font-size: 12px;
        display: block;
        margin-bottom: 4px;
      }

      .stat-cell span {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11.5px;
        font-weight: 700;
        color: #ffffff;
      }

      /* Download Buttons Grid */
      .dl-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }

      .btn-dl-tactile {
        padding: 13px 12px;
        border-radius: 14px;
        background: linear-gradient(180deg, #1d284a 0%, #10172e 100%);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #ffffff;
        font-family: inherit;
        font-size: 12.5px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        text-decoration: none;
        box-shadow:
          0 4px 0 #050811,
          0 7px 14px rgba(0, 0, 0, 0.45),
          inset 0 1px 0 rgba(255, 255, 255, 0.16);
        transition: transform 0.12s, box-shadow 0.12s, border-color 0.2s;
      }

      .btn-dl-tactile:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
      .btn-dl-tactile:active:not(:disabled) {
        transform: translateY(3px);
        box-shadow: 0 1px 0 #050811;
      }
      .btn-dl-tactile:disabled { opacity: 0.55; cursor: not-allowed; }

      .btn-dl-tactile.span-full {
        grid-column: span 2;
      }

      .btn-dl-tactile.main-dl {
        grid-column: span 2;
        background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
        color: #040711;
        border: none;
        font-size: 13.5px;
        font-weight: 800;
        box-shadow:
          0 5px 0 var(--ledge-primary),
          0 9px 20px var(--glow-color),
          inset 0 1px 0 rgba(255, 255, 255, 0.5);
      }

      .btn-dl-tactile.main-dl:hover:not(:disabled) {
        color: #040711;
        filter: brightness(1.06);
      }

      .btn-dl-tactile.main-dl:active:not(:disabled) {
        transform: translateY(4px);
        box-shadow: 0 1px 0 var(--ledge-primary);
      }

      /* Terabox File List Cards */
      .tb-list-stack {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 12px;
      }

      .tb-file-card {
        background: linear-gradient(180deg, #131d38 0%, #0b1123 100%);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 16px;
        padding: 13px;
        box-shadow:
          0 5px 0 #04060d,
          inset 0 1px 0 rgba(255, 255, 255, 0.14);
      }

      .tb-file-top {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 11px;
      }

      .tb-thumb-box {
        width: 54px;
        height: 54px;
        border-radius: 12px;
        background: #060913;
        border: 1px solid var(--border-accent);
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: var(--primary);
        font-size: 22px;
      }

      .tb-thumb-box img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .tb-file-meta {
        min-width: 0;
        flex: 1;
      }

      .tb-file-title {
        font-size: 13px;
        font-weight: 800;
        color: #ffffff;
        word-break: break-word;
        line-height: 1.35;
        margin-bottom: 5px;
      }

      .tb-file-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .tb-badge {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10.5px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 6px;
        background: rgba(0, 229, 255, 0.12);
        color: var(--primary);
        border: 1px solid var(--border-accent);
      }

      .tb-notice-banner {
        font-size: 11px;
        color: #fcd34d;
        background: rgba(245, 158, 11, 0.1);
        border: 1px solid rgba(245, 158, 11, 0.3);
        padding: 9px 12px;
        border-radius: 12px;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      /* QR Code Drawer */
      .qr-drawer {
        display: none;
        margin-top: 14px;
        padding: 16px;
        background: linear-gradient(180deg, #101830, #090e1d);
        border-radius: 16px;
        text-align: center;
        border: 1.5px solid var(--border-accent);
        box-shadow: 0 6px 0 #04060d, inset 0 1px 0 rgba(255, 255, 255, 0.14);
      }

      .qr-preview-frame {
        display: inline-block;
        padding: 10px;
        background: #ffffff;
        border-radius: 14px;
        margin-bottom: 10px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
      }

      .qr-preview-frame img {
        width: 148px;
        height: 148px;
        display: block;
      }

      .qr-actions {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-top: 10px;
        flex-wrap: wrap;
      }

      /* Slideshow Grid */
      .slides-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 9px;
        margin-bottom: 12px;
        max-height: 310px;
        overflow-y: auto;
      }

      .slide-item {
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid var(--border-accent);
        background: #050811;
        box-shadow: 0 4px 0 #03050b;
      }

      .slide-item img {
        width: 100%;
        height: 140px;
        object-fit: cover;
        display: block;
      }

      .slide-item button {
        width: 100%;
        padding: 8px;
        font-size: 11.5px;
        font-weight: 700;
        background: #10172e;
        color: var(--primary);
        border: none;
        cursor: pointer;
      }

      /* FYP Feed Grid */
      .feed-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        margin-top: 14px;
        max-height: 440px;
        overflow-y: auto;
        padding-right: 3px;
      }

      .feed-item {
        background: #080c1a;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 14px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: 0 5px 0 #04060e;
      }

      .feed-cover {
        position: relative;
        height: 165px;
        background: #050811;
      }

      .feed-cover img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .feed-badge {
        position: absolute;
        bottom: 6px;
        left: 6px;
        background: rgba(0, 0, 0, 0.78);
        color: #fff;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        padding: 3px 7px;
        border-radius: 6px;
      }

      .feed-info { padding: 10px; }
      .feed-user {
        font-size: 11.5px;
        font-weight: 700;
        color: var(--primary);
        margin-bottom: 3px;
      }

      .feed-desc {
        font-size: 11px;
        color: var(--text-sub);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin-bottom: 8px;
      }

      /* History Hub */
      .history-hub {
        margin-top: 22px;
        padding-top: 18px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: none;
      }

      .history-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .history-title {
        font-size: 12.5px;
        font-weight: 700;
        color: #e2e8f0;
        display: flex;
        align-items: center;
        gap: 7px;
      }

      .history-title i { color: var(--primary); }

      .btn-wipe-history {
        background: rgba(244, 63, 94, 0.12);
        border: 1px solid rgba(244, 63, 94, 0.35);
        color: #fb7185;
        font-size: 11px;
        font-weight: 700;
        padding: 5px 11px;
        border-radius: 9px;
        cursor: pointer;
        box-shadow: 0 3px 0 rgba(0, 0, 0, 0.5);
        transition: transform 0.1s, background 0.2s;
      }

      .btn-wipe-history:hover { background: rgba(244, 63, 94, 0.22); }
      .btn-wipe-history:active { transform: translateY(2px); }

      .history-carousel {
        display: flex;
        gap: 10px;
        overflow-x: auto;
        padding: 4px 2px 10px;
        scrollbar-width: thin;
      }

      .history-item-card {
        flex: 0 0 82px;
        height: 106px;
        border-radius: 14px;
        overflow: hidden;
        position: relative;
        cursor: pointer;
        background: linear-gradient(145deg, #1b2646, #0d1326);
        border: 1.5px solid var(--border-accent);
        box-shadow:
          0 5px 0 #04060d,
          0 8px 16px rgba(0, 0, 0, 0.55);
        transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.2s;
      }

      .history-item-card:hover {
        transform: translateY(-3px);
        border-color: var(--primary);
      }

      .history-item-card:active {
        transform: translateY(2px);
        box-shadow: 0 2px 0 #04060d;
      }

      .history-item-card img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .history-plat-tag {
        position: absolute;
        top: 4px;
        left: 4px;
        font-size: 9px;
        font-weight: 800;
        padding: 2px 5px;
        border-radius: 5px;
        background: rgba(5, 8, 17, 0.88);
        color: var(--primary);
        border: 1px solid rgba(255, 255, 255, 0.18);
        z-index: 3;
      }

      .history-card-label {
        position: absolute;
        inset: auto 0 0 0;
        background: linear-gradient(to top, rgba(4, 6, 15, 0.96), transparent);
        color: #fff;
        font-size: 9.5px;
        font-weight: 700;
        padding: 14px 5px 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: center;
      }

      .history-del-single {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: rgba(6, 9, 19, 0.85);
        color: #fb7185;
        border: 1px solid rgba(255, 255, 255, 0.2);
        font-size: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 3;
      }

      /* Info Hub & Developer Signature */
      .info-hub-panel {
        margin-top: 22px;
        background: linear-gradient(160deg, rgba(24, 34, 66, 0.92) 0%, rgba(10, 15, 31, 0.97) 100%);
        border: 1px solid var(--border-accent);
        border-radius: 22px;
        padding: 18px 16px;
        text-align: left;
        position: relative;
        box-shadow:
          0 8px 0 var(--ledge-dark),
          0 18px 35px rgba(0, 0, 0, 0.65),
          inset 0 1px 0 rgba(255, 255, 255, 0.18);
      }

      .info-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .info-tag {
        font-size: 11.5px;
        font-weight: 800;
        color: var(--primary);
        text-transform: uppercase;
        letter-spacing: 0.8px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .btn-share-web {
        background: linear-gradient(180deg, #1f2b4f, #11182f);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        padding: 6px 11px;
        border-radius: 9px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        box-shadow: 0 3px 0 var(--ledge-dark);
      }

      .btn-share-web:active {
        transform: translateY(2px);
        box-shadow: 0 1px 0 var(--ledge-dark);
      }

      .about-web-desc {
        font-size: 12.5px;
        color: #cbd5e1;
        line-height: 1.55;
        margin-bottom: 14px;
        background: rgba(6, 9, 19, 0.65);
        border: 1px solid rgba(255, 255, 255, 0.07);
        padding: 11px 13px;
        border-radius: 13px;
      }

      .about-web-desc strong { color: var(--primary); }

      .howto-list {
        display: flex;
        flex-direction: column;
        gap: 9px;
        margin-bottom: 16px;
      }

      .step-card {
        display: flex;
        align-items: flex-start;
        gap: 11px;
        background: linear-gradient(180deg, #17213f, #0e1529);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 14px;
        padding: 11px 12px;
        box-shadow:
          0 4px 0 #050812,
          inset 0 1px 0 rgba(255, 255, 255, 0.12);
      }

      .step-num {
        width: 26px;
        height: 26px;
        border-radius: 8px;
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        color: #040711;
        font-family: 'Outfit', sans-serif;
        font-size: 13px;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 2px 0 var(--ledge-primary);
      }

      .step-text h5 {
        font-size: 12.5px;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 2px;
      }

      .step-text p {
        font-size: 11.5px;
        color: var(--text-sub);
        line-height: 1.45;
      }

      .dev-signature {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        width: 100%;
        padding: 12px 18px;
        border-radius: 14px;
        background: linear-gradient(90deg, rgba(0, 229, 255, 0.1), rgba(99, 102, 241, 0.16), rgba(0, 229, 255, 0.1));
        border: 1px solid var(--border-accent);
        box-shadow:
          0 4px 0 #04060e,
          inset 0 1px 0 rgba(255, 255, 255, 0.22);
        font-size: 13.5px;
        font-weight: 600;
        color: #f1f5f9;
      }

      .dev-signature strong {
        font-family: 'Outfit', sans-serif;
        font-weight: 800;
        color: var(--primary);
        letter-spacing: 0.3px;
      }

      .dev-signature i.fa-crown {
        color: #fbbf24;
        font-size: 14px;
        filter: drop-shadow(0 0 6px rgba(251, 191, 36, 0.5));
      }

      /* Toast Stack */
      .toast-stack {
        position: fixed;
        top: 16px;
        left: 16px;
        right: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        pointer-events: none;
        z-index: 9999;
      }

      .toast-msg {
        background: #0b1124;
        border: 1.5px solid var(--primary);
        color: #fff;
        padding: 11px 16px;
        border-radius: 13px;
        font-size: 12.5px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 9px;
        box-shadow: 0 8px 0 #03050c, 0 14px 28px rgba(0, 0, 0, 0.7);
        margin-bottom: 8px;
        animation: toastSlide 0.22s ease-out;
      }

      .toast-msg.error { border-color: #fb7185; }

      @keyframes toastSlide {
        from { opacity: 0; transform: translateY(-12px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>`
  );

  // 3. Render Struktur Utama HTML ke dalam <body>
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<div class="toast-stack" id="toastStack"></div>

    <div class="app-shell">
      <div class="top-bar">
        <div class="brand-mini">
          <div class="brand-mini-badge"><i class="fa-solid fa-bolt"></i></div>
          <span>KevnaiMedia</span>
        </div>
        <div class="top-controls">
          <div class="theme-switcher" title="Ganti Tema Warna">
            <div class="theme-dot active" id="dot-cyan" style="background: #00e5ff;" onclick="setTheme('cyan')"></div>
            <div class="theme-dot" id="dot-gold" style="background: #fbbf24;" onclick="setTheme('gold')"></div>
            <div class="theme-dot" id="dot-emerald" style="background: #10b981;" onclick="setTheme('emerald')"></div>
          </div>
          <button class="btn-tactile-icon" onclick="toggleFullScreen()" title="Mode Layar Penuh">
            <i class="fa-solid fa-expand"></i>
          </button>
        </div>
      </div>

      <div class="hero-header">
        <h1 class="hero-title" id="heroMainTitle">All-in-One Media Hub</h1>
        <p class="hero-sub" id="heroSubTitle">Unduh video TikTok, Facebook HD & berkas cloud Terabox secara instan</p>
        <div class="metrics-bar">
          <span><i class="fa-solid fa-cloud-arrow-down"></i> Total Unduhanmu: <strong id="statDownloads">0</strong></span>
          <span><i class="fa-solid fa-clock-rotate-left"></i> Riwayat: <strong id="statHistory">0</strong></span>
        </div>
      </div>

      <div class="vault-card">
        <div class="platform-deck">
          <button class="deck-btn active" id="tabBtnTiktok" onclick="switchPlatform('tiktok', this)">
            <i class="fa-brands fa-tiktok"></i>
            <span>TikTok</span>
          </button>
          <button class="deck-btn" id="tabBtnFacebook" onclick="switchPlatform('facebook', this)">
            <i class="fa-brands fa-facebook"></i>
            <span>Facebook</span>
          </button>
          <button class="deck-btn" id="tabBtnTerabox" onclick="switchPlatform('terabox', this)">
            <i class="fa-solid fa-box-open"></i>
            <span>Terabox</span>
          </button>
          <button class="deck-btn" id="tabBtnTrending" onclick="switchPlatform('trending', this)">
            <i class="fa-solid fa-fire"></i>
            <span>FYP Indo</span>
          </button>
        </div>

        <div id="view-downloader" class="tab-view active">
          <div class="engine-banner">
            <span class="engine-badge" id="engineStatusLabel">
              <i class="fa-brands fa-tiktok"></i> Mode TikTok Tanpa Watermark
            </span>
            <span class="auto-detect-pill" id="autoDetectBadge">Auto-Detect Aktif</span>
          </div>

          <div class="field-wrap">
            <i class="fa-solid fa-link prefix-icon" id="inputPrefixIcon"></i>
            <input id="mediaUrlInput" class="field-input" type="text" placeholder="Tempel tautan TikTok, Facebook, atau Terabox..." autocomplete="off" spellcheck="false">
            <button type="button" class="btn-paste-tactile" onclick="pasteClipboard()">
              <i class="fa-regular fa-paste"></i> Tempel
            </button>
          </div>

          <div class="action-row">
            <button id="processBtn" class="btn-primary-tactile" onclick="handleProcessClick()">
              <i class="fa-solid fa-bolt"></i> <span id="processBtnText">Ambil Media</span>
            </button>
            <button class="btn-clear-tactile" onclick="resetAll()" title="Bersihkan Kolom">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>

        <div id="view-trending" class="tab-view">
          <button id="trendBtn" class="btn-primary-tactile" style="width: 100%;" onclick="loadTrendingVideos()">
            <i class="fa-solid fa-arrows-rotate"></i> Segarkan Video FYP Indonesia
          </button>
          <div id="trendingResults" class="feed-grid"></div>
        </div>

        <div id="dlProgressCard" class="progress-card">
          <div class="progress-meta">
            <span id="dlProgressLabel">Menyiapkan unduhan...</span>
            <span id="dlProgressPct">0%</span>
          </div>
          <div class="progress-track">
            <div id="dlProgressFill" class="progress-fill"></div>
          </div>
        </div>

        <div id="result"></div>

        <div id="historySection" class="history-hub">
          <div class="history-top">
            <span class="history-title">
              <i class="fa-solid fa-clock-rotate-left"></i> Riwayat Terakhir Diproses
            </span>
            <button class="btn-wipe-history" onclick="clearHistory()">Hapus Semua</button>
          </div>
          <div id="historyList" class="history-carousel"></div>
        </div>

        <div class="info-hub-panel">
          <div class="info-head">
            <span class="info-tag">
              <i class="fa-solid fa-circle-info"></i> Tentang & Cara Pakai
            </span>
            <button class="btn-share-web" onclick="shareWebApp()">
              <i class="fa-solid fa-share-nodes"></i> Bagikan Web
            </button>
          </div>

          <div class="about-web-desc">
            <strong>KevnaiMedia</strong> adalah pusat pengunduh media multi-platform untuk menyimpan video <strong>TikTok</strong> tanpa watermark (MP4 HD, Slide Foto, MP3), video & Reels <strong>Facebook</strong> (HD 720p, SD 360p, MP3), serta mengekstrak daftar berkas *direct link* dari <strong>Terabox</strong> secara instan tanpa aplikasi tambahan.
          </div>

          <div class="howto-list">
            <div class="step-card">
              <div class="step-num">1</div>
              <div class="step-text">
                <h5>Salin Tautan Media</h5>
                <p>Salin tautan video dari <b>TikTok</b>, <b>Facebook</b> (Watch/Reels), atau tautan berbagi berkas dari <b>Terabox</b>.</p>
              </div>
            </div>
            <div class="step-card">
              <div class="step-num">2</div>
              <div class="step-text">
                <h5>Tempel pada Kolom Pintar</h5>
                <p>Ketuk tombol <b>Tempel</b>. Sistem pendeteksi pintar akan otomatis menyesuaikan mode platform dan siap memproses tautan.</p>
              </div>
            </div>
            <div class="step-card">
              <div class="step-num">3</div>
              <div class="step-text">
                <h5>Pratinjau & Unduh</h5>
                <p>Putar pratinjau video atau audio secara langsung, lalu unduh format <b>MP4 HD</b>, <b>MP3</b>, <b>Direct File Terabox</b>, maupun <b>Kode QR</b>.</p>
              </div>
            </div>
          </div>

          <div class="dev-signature">
            <i class="fa-solid fa-crown"></i>
            <span>Developer <strong>KevnAI</strong></span>
            <i class="fa-solid fa-crown"></i>
          </div>
        </div>
      </div>
    </div>`
  );

  // 4. State Global & Konfigurasi Platform
  let activePlatform = "tiktok";
  let currentMedia = null;
  let feedCache = [];
  let previewAudio = null;
  let lastRequestTime = 0;
  const COOLDOWN_MS = 1400;

  const PLATFORM_CONFIG = {
    tiktok: {
      icon: "fa-brands fa-tiktok",
      label: "Mode TikTok Tanpa Watermark",
      placeholder: "Tempel tautan video / slide TikTok di sini...",
      btnText: "Ambil Video TikTok"
    },
    facebook: {
      icon: "fa-brands fa-facebook",
      label: "Mode Facebook Downloader (HD 720p / SD / MP3)",
      placeholder: "Tempel tautan video Facebook / Reels / fb.watch...",
      btnText: "Ambil Video Facebook"
    },
    terabox: {
      icon: "fa-solid fa-box-open",
      label: "Mode Terabox Cloud File Extractor",
      placeholder: "Tempel share link Terabox (terabox.app / 1024tera)...",
      btnText: "Proses Berkas Terabox"
    }
  };

  function setTheme(theme) {
    if (theme === "gold" || theme === "emerald") {
      document.documentElement.setAttribute("data-theme", theme);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem("tt_royale_theme", theme);
    document.getElementById("dot-cyan").classList.toggle("active", theme === "cyan" || (!theme));
    document.getElementById("dot-gold").classList.toggle("active", theme === "gold");
    document.getElementById("dot-emerald").classList.toggle("active", theme === "emerald");
  }

  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  function switchPlatform(platform, btnEl) {
    document.querySelectorAll(".deck-btn").forEach((b) => b.classList.remove("active"));
    if (btnEl) {
      btnEl.classList.add("active");
    } else {
      const mapBtn = {
        tiktok: "tabBtnTiktok",
        facebook: "tabBtnFacebook",
        terabox: "tabBtnTerabox",
        trending: "tabBtnTrending"
      };
      const target = document.getElementById(mapBtn[platform]);
      if (target) target.classList.add("active");
    }

    const dlView = document.getElementById("view-downloader");
    const trView = document.getElementById("view-trending");

    if (platform === "trending") {
      dlView.classList.remove("active");
      trView.classList.add("active");
      if (document.getElementById("trendingResults").children.length === 0) {
        loadTrendingVideos();
      }
      return;
    }

    activePlatform = platform;
    trView.classList.remove("active");
    dlView.classList.add("active");

    const cfg = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.tiktok;
    const statusLabel = document.getElementById("engineStatusLabel");
    const inputEl = document.getElementById("mediaUrlInput");
    const prefixIcon = document.getElementById("inputPrefixIcon");
    const btnText = document.getElementById("processBtnText");

    if (statusLabel) statusLabel.innerHTML = `<i class="${cfg.icon}"></i> ${cfg.label}`;
    if (inputEl) inputEl.placeholder = cfg.placeholder;
    if (prefixIcon) prefixIcon.className = `${cfg.icon} prefix-icon`;
    if (btnText) btnText.textContent = cfg.btnText;
  }

  function showToast(msg, type = "info") {
    const stack = document.getElementById("toastStack");
    const el = document.createElement("div");
    el.className = `toast-msg ${type === "error" ? "error" : ""}`;
    const icon = type === "error" ? "fa-circle-exclamation" : "fa-circle-check";
    el.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(msg)}</span>`;
    stack.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 220);
    }, 2900);
  }

  // Deteksi & Validasi URL Multi-Platform
  function extractFirstUrl(raw) {
    if (!raw) return "";
    const match = raw.match(/https?:\/\/[^\s"'<>]+/i);
    return match ? match[0].trim() : raw.trim();
  }

  function detectPlatformFromUrl(rawUrl) {
    const candidate = extractFirstUrl(rawUrl);
    if (!candidate) return null;
    try {
      const parsed = new URL(candidate);
      const host = parsed.hostname.toLowerCase();

      const ttHosts = ["tiktok.com", "www.tiktok.com", "vt.tiktok.com", "vm.tiktok.com", "m.tiktok.com", "douyin.com"];
      if (ttHosts.some((h) => host === h || host.endsWith("." + h))) {
        return { platform: "tiktok", url: parsed.href };
      }

      const fbHosts = ["facebook.com", "www.facebook.com", "m.facebook.com", "web.facebook.com", "fb.watch", "fb.com"];
      if (fbHosts.some((h) => host === h || host.endsWith("." + h))) {
        return { platform: "facebook", url: parsed.href };
      }

      const tbKeywords = [
        "terabox",
        "1024tera",
        "1024terabox",
        "teraboxlink",
        "nephobox",
        "4funbox",
        "mirrobox",
        "momerybox",
        "teraboxapp",
        "teraboxurl",
        "freeterabox"
      ];
      if (tbKeywords.some((k) => host.includes(k))) {
        return { platform: "terabox", url: parsed.href };
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // Listener Input Pintar untuk Auto-Switch Platform
  const mediaInputEl = document.getElementById("mediaUrlInput");
  mediaInputEl.addEventListener("input", (e) => {
    const detected = detectPlatformFromUrl(e.target.value);
    const badge = document.getElementById("autoDetectBadge");
    if (detected) {
      if (detected.platform !== activePlatform) {
        switchPlatform(detected.platform, null);
      }
      if (badge) {
        badge.textContent = `Terdeteksi: ${detected.platform.toUpperCase()}`;
      }
    } else if (badge) {
      badge.textContent = "Auto-Detect Aktif";
    }
  });

  mediaInputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleProcessClick();
  });

  async function pasteClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return showToast("Clipboard kosong", "error");
      const clean = extractFirstUrl(text);
      mediaInputEl.value = clean;
      const detected = detectPlatformFromUrl(clean);
      if (detected && detected.platform !== activePlatform) {
        switchPlatform(detected.platform, null);
        showToast(`Tautan ${detected.platform.toUpperCase()} terdeteksi!`);
      } else {
        showToast("Tautan berhasil ditempel");
      }
    } catch (e) {
      showToast("Tekan tahan pada kolom untuk menempel tautan", "error");
    }
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[m]));
  }

  function formatCaptionWithHashtags(rawTitle) {
    const safe = escapeHtml(rawTitle || "Media Tanpa Judul");
    return safe.replace(/#[\w\u00C0-\u017F]+/g, (tag) => {
      return `<span class="hashtag-inline" onclick="copySingleTag('${tag}')" title="Klik untuk salin ${tag}">${tag}</span>`;
    });
  }

  function copySingleTag(tag) {
    navigator.clipboard.writeText(tag).then(() => {
      showToast(`Hashtag ${tag} disalin!`);
    });
  }

  function formatNum(n) {
    if (!n) return "0";
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toString();
  }

  function formatBytes(bytes) {
    if (!bytes) return "";
    if (typeof bytes === "string" && /[a-zA-Z]/.test(bytes)) return bytes;
    const num = Number(bytes);
    if (isNaN(num) || num <= 0) return "";
    if (num >= 1073741824) return (num / 1073741824).toFixed(2) + " GB";
    if (num >= 1048576) return (num / 1048576).toFixed(1) + " MB";
    if (num >= 1024) return (num / 1024).toFixed(0) + " KB";
    return num + " B";
  }

  function formatDuration(sec) {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function buildFallbackAvatar(name) {
    const clean = encodeURIComponent((name || "KM").slice(0, 2));
    return `https://ui-avatars.com/api/?name=${clean}&background=0d1428&color=00e5ff&bold=true&size=128`;
  }

  async function fetchJsonWithRetry(apiUrl, retries = 2) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const res = await fetch(apiUrl);
        const json = await res.json();
        return json;
      } catch (err) {
        if (attempt === retries) throw err;
        await new Promise((r) => setTimeout(r, 1100 * attempt));
      }
    }
  }

  function handleProcessClick() {
    const now = Date.now();
    if (now - lastRequestTime < COOLDOWN_MS) {
      return showToast("Mohon tunggu sebentar sebelum memproses lagi", "error");
    }
    lastRequestTime = now;

    const rawInput = mediaInputEl.value;
    const detected = detectPlatformFromUrl(rawInput);

    if (!detected) {
      showToast("Masukkan tautan resmi TikTok, Facebook, atau Terabox!", "error");
      mediaInputEl.focus();
      return;
    }

    if (detected.platform !== activePlatform) {
      switchPlatform(detected.platform, null);
    }

    mediaInputEl.value = detected.url;

    if (detected.platform === "tiktok") {
      processTiktokUrl(detected.url);
    } else if (detected.platform === "facebook") {
      processFacebookUrl(detected.url);
    } else if (detected.platform === "terabox") {
      processTeraboxUrl(detected.url);
    }
  }

  // =========================================================================
  // MESIN 1: TIKTOK DOWNLOADER (TIKWM API)
  // =========================================================================
  async function processTiktokUrl(validUrl) {
    const result = document.getElementById("result");
    const btn = document.getElementById("processBtn");

    stopAudioPreview();
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Memuat TikTok...';
    result.innerHTML = `
      <div class="status-box">
        <div class="loader-ring"></div>
        <p style="font-size:13px; color:var(--primary); font-weight:700;">Menghubungkan ke server media TikTok...</p>
      </div>
    `;

    try {
      const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(validUrl)}&hd=1`;
      const json = await fetchJsonWithRetry(apiUrl, 3);
      if (!json || json.code !== 0 || !json.data) {
        throw new Error(json?.msg || "Video TikTok tidak ditemukan atau bersifat privat.");
      }
      populateAndRenderTiktok(json.data, validUrl);
    } catch (err) {
      result.innerHTML = "";
      showToast(err.message || "Gagal memuat video TikTok.", "error");
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-bolt"></i> <span id="processBtnText">${PLATFORM_CONFIG[activePlatform].btnText}</span>`;
    }
  }

  function populateAndRenderTiktok(data, sourceUrl = "") {
    const authorName = data.author?.nickname || "Kreator TikTok";
    const coverImg = data.origin_cover || data.ai_dynamic_cover || data.cover || "";
    const avatarImg = data.author?.avatar || coverImg || buildFallbackAvatar(authorName);

    currentMedia = {
      platform: "tiktok",
      id: data.id || Date.now(),
      url: sourceUrl || `https://www.tiktok.com/@${data.author?.unique_id || "user"}/video/${data.id}`,
      title: data.title || "Video TikTok",
      play: data.play,
      hdplay: data.hdplay || data.play,
      wmplay: data.wmplay || data.play,
      music: data.music,
      musicTitle: data.music_info?.title || "Suara Asli",
      cover: coverImg,
      avatar: avatarImg,
      fallbackAvatar: buildFallbackAvatar(authorName),
      authorName: authorName,
      authorId: data.author?.unique_id || "tiktok",
      duration: data.duration || 0,
      size: data.size || 0,
      hdSize: data.hd_size || 0,
      region: data.region || "ID",
      createTime: data.create_time ? new Date(data.create_time * 1000).toLocaleDateString("id-ID") : "Terbaru",
      images: data.images || null,
      stats: {
        views: data.play_count,
        likes: data.digg_count,
        comments: data.comment_count,
        shares: data.share_count
      }
    };

    saveToHistory({
      id: "tt_" + currentMedia.id,
      platform: "tiktok",
      url: currentMedia.url,
      cover: currentMedia.cover,
      avatar: currentMedia.avatar,
      label: "@" + currentMedia.authorId
    });
    renderTiktokCard();
  }

  function renderTiktokCard() {
    const m = currentMedia;
    const result = document.getElementById("result");
    const isSlide = Array.isArray(m.images) && m.images.length > 0;

    let mediaPreview = "";
    if (isSlide) {
      const slides = m.images
        .map(
          (img, i) => `
        <div class="slide-item">
          <img src="${escapeHtml(img)}" referrerpolicy="no-referrer" alt="Slide ${i + 1}" loading="lazy">
          <button onclick="downloadSlide(${i}, this)">
            <i class="fa-solid fa-download"></i> Unduh Foto ${i + 1}
          </button>
        </div>
      `
        )
        .join("");
      mediaPreview = `
        <div class="slides-grid">${slides}</div>
        <button class="btn-dl-tactile main-dl" style="width:100%; margin-bottom:12px;" onclick="downloadAllSlides(this)">
          <i class="fa-solid fa-layer-group"></i> Unduh Semua Foto (${m.images.length} Slide)
        </button>
      `;
    } else {
      mediaPreview = `
        <div class="video-stage" id="videoStage">
          <div class="video-poster-overlay" id="videoPosterOverlay" onclick="startMainVideo()">
            <img class="poster-bg" src="${escapeHtml(m.cover)}" referrerpolicy="no-referrer" alt="Cover Video" onerror="this.onerror=null; this.src='${escapeHtml(m.avatar)}';">
            <div class="play-orb-trigger">
              <i class="fa-solid fa-play"></i>
            </div>
            <span class="poster-hint"><i class="fa-solid fa-circle-play"></i> Ketuk untuk Memutar Video (${formatDuration(m.duration)})</span>
          </div>

          <video id="mainVideoPlayer" controls playsinline preload="metadata" crossorigin="anonymous">
            <source src="${escapeHtml(m.play)}" type="video/mp4">
            <source src="${escapeHtml(m.hdplay)}" type="video/mp4">
          </video>
        </div>

        <div class="video-toolbar">
          <div class="speed-group">
            <button class="chip-btn active" onclick="setVideoSpeed(1, this)">1x</button>
            <button class="chip-btn" onclick="setVideoSpeed(1.5, this)">1.5x</button>
            <button class="chip-btn" onclick="setVideoSpeed(2, this)">2x</button>
          </div>
          <div style="display:flex; gap:6px;">
            <button class="chip-btn" onclick="captureVideoFrame()" title="Simpan Frame Video Jadi Gambar">
              <i class="fa-solid fa-camera"></i> Tangkap Frame
            </button>
            <button class="chip-btn" onclick="replayMainVideo()" title="Putar Ulang">
              <i class="fa-solid fa-rotate-right"></i>
            </button>
          </div>
        </div>
      `;
    }

    const sdLabel = m.size ? `(${formatBytes(m.size)})` : "";
    const hdLabel = m.hdSize ? `(${formatBytes(m.hdSize)})` : "";

    result.innerHTML = `
      <div class="result-vault">
        <div class="creator-row">
          <div class="creator-profile">
            <img class="creator-avatar" src="${escapeHtml(m.avatar)}" referrerpolicy="no-referrer" alt="Avatar"
              onerror="this.onerror=null; this.src='${escapeHtml(m.cover || m.fallbackAvatar)}';"
              onclick="triggerAssetDownload('avatar', this)" title="Klik untuk mengunduh foto profil">
            <div class="creator-text">
              <h4>${escapeHtml(m.authorName)}</h4>
              <a href="https://www.tiktok.com/@${encodeURIComponent(m.authorId)}" target="_blank" rel="noopener noreferrer">
                @${escapeHtml(m.authorId)} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:10px;"></i>
              </a>
            </div>
          </div>
          <button class="chip-btn" onclick="shareMedia()">
            <i class="fa-solid fa-share-nodes"></i> Bagikan
          </button>
        </div>

        <div class="meta-pills">
          <span class="meta-pill"><i class="fa-brands fa-tiktok"></i> TikTok</span>
          <span class="meta-pill"><i class="fa-regular fa-clock"></i> ${formatDuration(m.duration)}</span>
          <span class="meta-pill"><i class="fa-solid fa-earth-asia"></i> ${escapeHtml(m.region)}</span>
          <span class="meta-pill"><i class="fa-regular fa-calendar"></i> ${m.createTime}</span>
        </div>

        ${mediaPreview}

        <div class="caption-panel">
          <p class="caption-body">${formatCaptionWithHashtags(m.title)}</p>
          <div class="chip-group">
            <button class="chip-btn" onclick="copyCaption(false)">
              <i class="fa-regular fa-copy"></i> Salin Caption
            </button>
            <button class="chip-btn" onclick="copyCaption(true)">
              <i class="fa-solid fa-hashtag"></i> Salin Hashtag
            </button>
            <button class="chip-btn" id="qrToggleBtn" onclick="toggleQrCode()">
              <i class="fa-solid fa-qrcode"></i> QR Code
            </button>
          </div>
        </div>

        <div class="audio-bar">
          <div class="audio-top">
            <div class="audio-info">
              <button class="audio-toggle" id="audioPlayBtn" onclick="toggleAudioPreview()">
                <i class="fa-solid fa-play"></i>
              </button>
              <div class="audio-meta-text">
                <span class="audio-name"><i class="fa-solid fa-music"></i> ${escapeHtml(m.musicTitle)}</span>
                <span class="audio-time" id="audioTimeLabel">Klik putar untuk dengar MP3</span>
              </div>
            </div>
            <div class="eq-bars" id="eqVisualizer">
              <div class="eq-bar"></div>
              <div class="eq-bar"></div>
              <div class="eq-bar"></div>
            </div>
          </div>
          <input type="range" id="audioSeekBar" class="audio-seek" min="0" max="100" value="0" style="display:none;" oninput="seekAudioPreview(this.value)">
        </div>

        <div class="stats-row">
          <div class="stat-cell"><i class="fa-solid fa-play"></i><span>${formatNum(m.stats.views)}</span></div>
          <div class="stat-cell"><i class="fa-solid fa-heart"></i><span>${formatNum(m.stats.likes)}</span></div>
          <div class="stat-cell"><i class="fa-solid fa-comment"></i><span>${formatNum(m.stats.comments)}</span></div>
          <div class="stat-cell"><i class="fa-solid fa-share"></i><span>${formatNum(m.stats.shares)}</span></div>
        </div>

        <div class="dl-grid">
          ${
            !isSlide
              ? `
            <button class="btn-dl-tactile main-dl" onclick="triggerAssetDownload('play', this)">
              <i class="fa-solid fa-download"></i> Unduh MP4 Tanpa Watermark ${sdLabel}
            </button>
            <button class="btn-dl-tactile" onclick="triggerAssetDownload('hdplay', this)">
              <i class="fa-solid fa-bolt"></i> MP4 HD ${hdLabel}
            </button>
          `
              : ""
          }
          <button class="btn-dl-tactile ${isSlide ? "span-full" : ""}" onclick="triggerAssetDownload('music', this)">
            <i class="fa-solid fa-music"></i> Musik MP3
          </button>
          <button class="btn-dl-tactile span-full" onclick="triggerAssetDownload('cover', this)">
            <i class="fa-regular fa-image"></i> Unduh Thumbnail Cover HD
          </button>
        </div>

        ${renderQrDrawerMarkup()}
      </div>
    `;

    attachVideoStageListeners();
  }

  // =========================================================================
  // MESIN 2: FACEBOOK DOWNLOADER (IROHA API /v1/fbdown)
  // =========================================================================
  async function processFacebookUrl(validUrl) {
    const result = document.getElementById("result");
    const btn = document.getElementById("processBtn");

    stopAudioPreview();
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Memuat Facebook...';
    result.innerHTML = `
      <div class="status-box">
        <div class="loader-ring"></div>
        <p style="font-size:13px; color:var(--primary); font-weight:700;">Mengekstrak stream video Facebook (HD / SD / MP3)...</p>
      </div>
    `;

    try {
      const apiUrl = `https://api.iroha-api.web.id/v1/fbdown?url=${encodeURIComponent(validUrl)}`;
      const json = await fetchJsonWithRetry(apiUrl, 2);

      if (!json || json.status !== true || !json.data) {
        throw new Error(
          json?.message ||
            json?.msg ||
            "Video Facebook tidak dapat diproses. Pastikan video berstatus publik (bukan privat/teman saja)."
        );
      }

      const d = json.data;
      const hdStream = d.hd || d.hd_url || d.video_hd || "";
      const sdStream = d.sd || d.sd_url || d.video_sd || d.url || "";
      const mp3Stream = d.mp3 || d.audio || d.music || "";
      const thumbImg = d.thumbnail || d.cover || d.image || buildFallbackAvatar("FB");
      const primaryVideo = hdStream || sdStream;

      if (!primaryVideo && !mp3Stream) {
        throw new Error("Tautan unduhan video Facebook tidak ditemukan pada respons server.");
      }

      currentMedia = {
        platform: "facebook",
        id: Date.now(),
        url: validUrl,
        title: d.title || d.caption || d.description || "Video Facebook Reels / Watch",
        play: primaryVideo,
        hdplay: hdStream || primaryVideo,
        sdplay: sdStream || primaryVideo,
        music: mp3Stream,
        musicTitle: "Audio Video Facebook (MP3)",
        cover: thumbImg,
        avatar: thumbImg,
        fallbackAvatar: buildFallbackAvatar("FB"),
        authorName: d.author || "Facebook Video",
        authorId: "facebook"
      };

      saveToHistory({
        id: "fb_" + btoa(validUrl).slice(0, 12),
        platform: "facebook",
        url: validUrl,
        cover: thumbImg,
        avatar: thumbImg,
        label: "Facebook"
      });

      renderFacebookCard();
    } catch (err) {
      result.innerHTML = "";
      showToast(err.message || "Gagal memproses video Facebook.", "error");
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-bolt"></i> <span id="processBtnText">${PLATFORM_CONFIG[activePlatform].btnText}</span>`;
    }
  }

  function renderFacebookCard() {
    const m = currentMedia;
    const result = document.getElementById("result");

    const hasHd = Boolean(m.hdplay);
    const hasSd = Boolean(m.sdplay);
    const hasMp3 = Boolean(m.music);

    result.innerHTML = `
      <div class="result-vault">
        <div class="creator-row">
          <div class="creator-profile">
            <div class="platform-icon-avatar fb-brand">
              <i class="fa-brands fa-facebook-f"></i>
            </div>
            <div class="creator-text">
              <h4>${escapeHtml(m.authorName)}</h4>
              <a href="${escapeHtml(m.url)}" target="_blank" rel="noopener noreferrer">
                Buka Tautan Asli Facebook <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:10px;"></i>
              </a>
            </div>
          </div>
          <button class="chip-btn" onclick="shareMedia()">
            <i class="fa-solid fa-share-nodes"></i> Bagikan
          </button>
        </div>

        <div class="meta-pills">
          <span class="meta-pill"><i class="fa-brands fa-facebook"></i> Facebook Downloader</span>
          ${hasHd ? '<span class="meta-pill"><i class="fa-solid fa-high-definition"></i> HD 720p Tersedia</span>' : ""}
          ${hasSd ? '<span class="meta-pill"><i class="fa-solid fa-video"></i> SD 360p Tersedia</span>' : ""}
          ${hasMp3 ? '<span class="meta-pill"><i class="fa-solid fa-music"></i> MP3 Tersedia</span>' : ""}
        </div>

        <div class="video-stage" id="videoStage">
          <div class="video-poster-overlay" id="videoPosterOverlay" onclick="startMainVideo()">
            <img class="poster-bg" src="${escapeHtml(m.cover)}" referrerpolicy="no-referrer" alt="Thumbnail Facebook" onerror="this.onerror=null; this.src='${escapeHtml(m.fallbackAvatar)}';">
            <div class="play-orb-trigger">
              <i class="fa-solid fa-play"></i>
            </div>
            <span class="poster-hint"><i class="fa-solid fa-circle-play"></i> Ketuk untuk Pratinjau Video Facebook</span>
          </div>

          <video id="mainVideoPlayer" controls playsinline preload="metadata" crossorigin="anonymous">
            <source src="${escapeHtml(m.play)}" type="video/mp4">
            ${m.sdplay && m.sdplay !== m.play ? `<source src="${escapeHtml(m.sdplay)}" type="video/mp4">` : ""}
          </video>
        </div>

        <div class="video-toolbar">
          <div class="speed-group">
            <button class="chip-btn active" onclick="setVideoSpeed(1, this)">1x</button>
            <button class="chip-btn" onclick="setVideoSpeed(1.5, this)">1.5x</button>
            <button class="chip-btn" onclick="setVideoSpeed(2, this)">2x</button>
          </div>
          <div style="display:flex; gap:6px;">
            <button class="chip-btn" onclick="captureVideoFrame()">
              <i class="fa-solid fa-camera"></i> Tangkap Frame
            </button>
            <button class="chip-btn" onclick="replayMainVideo()">
              <i class="fa-solid fa-rotate-right"></i>
            </button>
          </div>
        </div>

        <div class="caption-panel">
          <p class="caption-body">${formatCaptionWithHashtags(m.title)}</p>
          <div class="chip-group">
            <button class="chip-btn" onclick="copyCaption(false)">
              <i class="fa-regular fa-copy"></i> Salin Judul
            </button>
            <button class="chip-btn" id="qrToggleBtn" onclick="toggleQrCode()">
              <i class="fa-solid fa-qrcode"></i> QR Code
            </button>
          </div>
        </div>

        ${
          hasMp3
            ? `
        <div class="audio-bar">
          <div class="audio-top">
            <div class="audio-info">
              <button class="audio-toggle" id="audioPlayBtn" onclick="toggleAudioPreview()">
                <i class="fa-solid fa-play"></i>
              </button>
              <div class="audio-meta-text">
                <span class="audio-name"><i class="fa-solid fa-music"></i> Audio Facebook MP3</span>
                <span class="audio-time" id="audioTimeLabel">Klik putar untuk dengar MP3</span>
              </div>
            </div>
            <div class="eq-bars" id="eqVisualizer">
              <div class="eq-bar"></div>
              <div class="eq-bar"></div>
              <div class="eq-bar"></div>
            </div>
          </div>
          <input type="range" id="audioSeekBar" class="audio-seek" min="0" max="100" value="0" style="display:none;" oninput="seekAudioPreview(this.value)">
        </div>
        `
            : ""
        }

        <div class="dl-grid">
          ${
            hasHd
              ? `
          <button class="btn-dl-tactile main-dl" onclick="triggerAssetDownload('hdplay', this)">
            <i class="fa-solid fa-bolt"></i> Unduh Video Facebook HD (720p)
          </button>`
              : ""
          }
          ${
            hasSd
              ? `
          <button class="btn-dl-tactile ${!hasHd ? "main-dl" : ""}" onclick="triggerAssetDownload('sdplay', this)">
            <i class="fa-solid fa-download"></i> Unduh Video SD (360p)
          </button>`
              : ""
          }
          ${
            hasMp3
              ? `
          <button class="btn-dl-tactile ${!hasSd && hasHd ? "span-full" : ""}" onclick="triggerAssetDownload('music', this)">
            <i class="fa-solid fa-music"></i> Unduh Audio MP3
          </button>`
              : ""
          }
          <button class="btn-dl-tactile span-full" onclick="triggerAssetDownload('cover', this)">
            <i class="fa-regular fa-image"></i> Unduh Thumbnail Video
          </button>
        </div>

        ${renderQrDrawerMarkup()}
      </div>
    `;

    attachVideoStageListeners();
  }

  // =========================================================================
  // MESIN 3: TERABOX FILE DOWNLOADER (IROHA API /v1/terabox)
  // =========================================================================
  function normalizeTeraboxFiles(rawData) {
    const extracted = [];
    const visited = new Set();

    function inspectNode(node) {
      if (!node || typeof node !== "object" || visited.has(node)) return;
      visited.add(node);

      if (Array.isArray(node)) {
        node.forEach(inspectNode);
        return;
      }

      // Cek apakah objek ini merepresentasikan 1 berkas Terabox
      const fileName =
        node.file_name ||
        node.filename ||
        node.server_filename ||
        node.name ||
        node.title ||
        "";

      const directUrl =
        node.dlink ||
        node.download_link ||
        node.direct_link ||
        node.downloadUrl ||
        node.url ||
        node.main_url ||
        node.src ||
        (node.download && typeof node.download === "string" ? node.download : "") ||
        "";

      const fastUrl =
        node.fast_download_link ||
        node.fast_link ||
        node.hd_link ||
        node.mirror_link ||
        node.dlink_fast ||
        "";

      const isDirectory = node.is_dir === 1 || node.is_dir === "1" || node.isdir === 1 || node.type === "folder";

      if (!isDirectory && (directUrl || fastUrl)) {
        const rawSize = node.size || node.file_size || node.sizebytes || node.formatted_size || "";
        const thumbUrl =
          node.thumb ||
          node.thumbnail ||
          node.image ||
          (node.thumbs && (node.thumbs.url3 || node.thumbs.url2 || node.thumbs.url1 || node.thumbs.icon)) ||
          "";

        extracted.push({
          name: fileName || `Berkas_Terabox_${extracted.length + 1}`,
          size: formatBytes(rawSize) || "Ukuran Berkas Cloud",
          directLink: directUrl || fastUrl,
          fastLink: fastUrl && fastUrl !== directUrl ? fastUrl : "",
          thumb: thumbUrl
        });
      }

      // Telusuri properti nested (seperti list, files, data, result, children)
      Object.values(node).forEach((child) => {
        if (child && typeof child === "object") {
          inspectNode(child);
        }
      });
    }

    inspectNode(rawData);
    return extracted;
  }

  async function processTeraboxUrl(validUrl) {
    const result = document.getElementById("result");
    const btn = document.getElementById("processBtn");

    stopAudioPreview();
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Mengekstrak Terabox...';
    result.innerHTML = `
      <div class="status-box">
        <div class="loader-ring"></div>
        <p style="font-size:13px; color:var(--primary); font-weight:700;">Mengambil daftar berkas & direct link Terabox...</p>
      </div>
    `;

    try {
      const apiUrl = `https://api.iroha-api.web.id/v1/terabox?url=${encodeURIComponent(validUrl)}`;
      const json = await fetchJsonWithRetry(apiUrl, 2);

      if (!json || json.status !== true || !json.data) {
        throw new Error(json?.message || json?.msg || "Gagal mengambil berkas dari tautan Terabox tersebut.");
      }

      const files = normalizeTeraboxFiles(json.data);
      if (files.length === 0) {
        throw new Error("Tidak ditemukan direct link berkas yang aktif pada tautan Terabox ini.");
      }

      const firstThumb = files[0].thumb || buildFallbackAvatar("TB");

      currentMedia = {
        platform: "terabox",
        id: Date.now(),
        url: validUrl,
        title: files.length === 1 ? files[0].name : `${files.length} Berkas Terabox Siap Diunduh`,
        cover: firstThumb,
        avatar: firstThumb,
        fallbackAvatar: buildFallbackAvatar("TB"),
        authorName: "Terabox Cloud Storage",
        authorId: "terabox",
        files: files
      };

      saveToHistory({
        id: "tb_" + btoa(validUrl).slice(0, 12),
        platform: "terabox",
        url: validUrl,
        cover: firstThumb,
        avatar: firstThumb,
        label: files[0].name.slice(0, 14)
      });

      renderTeraboxCard();
    } catch (err) {
      result.innerHTML = "";
      showToast(err.message || "Gagal mengekstrak tautan Terabox.", "error");
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-bolt"></i> <span id="processBtnText">${PLATFORM_CONFIG[activePlatform].btnText}</span>`;
    }
  }

  function isVideoFilename(name) {
    return /\.(mp4|mkv|webm|mov|avi|m4v)$/i.test(name || "");
  }

  function renderTeraboxCard() {
    const m = currentMedia;
    const result = document.getElementById("result");

    const fileCardsHtml = m.files
      .map((f, idx) => {
        const canPreviewVid = isVideoFilename(f.name);
        return `
        <div class="tb-file-card">
          <div class="tb-file-top">
            <div class="tb-thumb-box">
              ${
                f.thumb
                  ? `<img src="${escapeHtml(f.thumb)}" referrerpolicy="no-referrer" alt="Thumb" onerror="this.onerror=null; this.parentElement.innerHTML='<i class=\\'fa-solid fa-file-arrow-down\\'></i>';">`
                  : `<i class="fa-solid ${canPreviewVid ? "fa-file-video" : "fa-file-zipper"}"></i>`
              }
            </div>
            <div class="tb-file-meta">
              <div class="tb-file-title">${escapeHtml(f.name)}</div>
              <div class="tb-file-badges">
                <span class="tb-badge"><i class="fa-solid fa-hard-drive"></i> ${escapeHtml(f.size)}</span>
                <span class="tb-badge"><i class="fa-solid fa-bolt"></i> Direct Link Aktif</span>
              </div>
            </div>
          </div>

          <div class="dl-grid">
            <button class="btn-dl-tactile main-dl" onclick="downloadTeraboxItem(${idx}, 'direct', this)">
              <i class="fa-solid fa-cloud-arrow-down"></i> Unduh Direct Link Utama
            </button>
            ${
              f.fastLink
                ? `
              <button class="btn-dl-tactile span-full" onclick="downloadTeraboxItem(${idx}, 'fast', this)">
                <i class="fa-solid fa-rocket"></i> Unduh Fast Mirror Server
              </button>
            `
                : ""
            }
            ${
              canPreviewVid
                ? `
              <button class="btn-dl-tactile" onclick="previewTeraboxVideo(${idx})">
                <i class="fa-solid fa-circle-play"></i> Putar Pratinjau
              </button>
            `
                : ""
            }
            <button class="btn-dl-tactile ${!canPreviewVid ? "span-full" : ""}" onclick="copyTeraboxDirectLink(${idx})">
              <i class="fa-regular fa-copy"></i> Salin Direct Link
            </button>
          </div>
        </div>
      `;
      })
      .join("");

    result.innerHTML = `
      <div class="result-vault">
        <div class="creator-row">
          <div class="creator-profile">
            <div class="platform-icon-avatar tb-brand">
              <i class="fa-solid fa-box-open"></i>
            </div>
            <div class="creator-text">
              <h4>Terabox File Extractor</h4>
              <span class="sub-handle"><i class="fa-solid fa-Folder-open"></i> Ditemukan ${m.files.length} Berkas</span>
            </div>
          </div>
          <button class="chip-btn" id="qrToggleBtn" onclick="toggleQrCode()">
            <i class="fa-solid fa-qrcode"></i> QR Share
          </button>
        </div>

        <div class="tb-notice-banner">
          <i class="fa-solid fa-clock"></i>
          <span>Direct link Terabox memiliki masa aktif terbatas. Segera unduh berkas Anda.</span>
        </div>

        <div id="teraboxVideoPreviewSlot"></div>

        <div class="tb-list-stack">
          ${fileCardsHtml}
        </div>

        ${renderQrDrawerMarkup()}
      </div>
    `;
  }

  function downloadTeraboxItem(idx, mode, btnEl) {
    if (!currentMedia || !currentMedia.files || !currentMedia.files[idx]) return;
    const item = currentMedia.files[idx];
    const targetUrl = mode === "fast" && item.fastLink ? item.fastLink : item.directLink;
    if (!targetUrl) return showToast("Direct link tidak tersedia", "error");

    const cleanName = item.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    streamDownload(targetUrl, cleanName, btnEl);
  }

  function copyTeraboxDirectLink(idx) {
    if (!currentMedia || !currentMedia.files || !currentMedia.files[idx]) return;
    const link = currentMedia.files[idx].directLink;
    navigator.clipboard.writeText(link).then(() => {
      showToast("Direct link unduhan berhasil disalin!");
    });
  }

  function previewTeraboxVideo(idx) {
    if (!currentMedia || !currentMedia.files || !currentMedia.files[idx]) return;
    const item = currentMedia.files[idx];
    const slot = document.getElementById("teraboxVideoPreviewSlot");
    if (!slot) return;

    slot.innerHTML = `
      <div class="video-stage" style="margin-bottom:14px;">
        <video id="mainVideoPlayer" controls autoplay playsinline style="width:100%; max-height:380px;">
          <source src="${escapeHtml(item.directLink)}" type="video/mp4">
          ${item.fastLink ? `<source src="${escapeHtml(item.fastLink)}" type="video/mp4">` : ""}
        </video>
      </div>
    `;
    slot.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function renderQrDrawerMarkup() {
    return `
      <div id="qrBox" class="qr-drawer">
        <div class="qr-preview-frame">
          <img id="qrImg" src="" crossorigin="anonymous" alt="QR Code">
        </div>
        <p style="font-size:11.5px; color:var(--text-sub); margin-bottom:4px;">
          Scan kode QR ini atau unduh gambarnya untuk dibagikan ke perangkat lain
        </p>
        <div class="qr-actions">
          <button class="btn-dl-tactile" style="padding:9px 14px; font-size:12px;" onclick="downloadQrCodeImage(this)">
            <i class="fa-solid fa-download"></i> Unduh Gambar QR (PNG)
          </button>
          <button class="chip-btn" onclick="shareMedia()">
            <i class="fa-regular fa-copy"></i> Salin Link Media
          </button>
        </div>
      </div>
    `;
  }

  function attachVideoStageListeners() {
    const m = currentMedia;
    const vid = document.getElementById("mainVideoPlayer");
    if (vid && m) {
      vid.addEventListener("play", () => {
        stopAudioPreview();
        const ov = document.getElementById("videoPosterOverlay");
        if (ov) ov.classList.add("hidden");
      });
      vid.addEventListener("error", () => {
        const fallback = m.wmplay || m.sdplay;
        if (fallback && vid.src !== fallback) {
          vid.src = fallback;
        }
      });
    }
  }

  // Fungsi Kontrol Video Player
  function startMainVideo() {
    const vid = document.getElementById("mainVideoPlayer");
    const ov = document.getElementById("videoPosterOverlay");
    if (ov) ov.classList.add("hidden");
    if (vid) {
      stopAudioPreview();
      vid.play().catch(() => {
        vid.controls = true;
      });
    }
  }

  function replayMainVideo() {
    const vid = document.getElementById("mainVideoPlayer");
    if (!vid) return;
    vid.currentTime = 0;
    startMainVideo();
  }

  function setVideoSpeed(rate, btnEl) {
    const vid = document.getElementById("mainVideoPlayer");
    if (!vid) return;
    vid.playbackRate = rate;
    document.querySelectorAll(".speed-group .chip-btn").forEach((b) => b.classList.remove("active"));
    if (btnEl) btnEl.classList.add("active");
    showToast(`Kecepatan video: ${rate}x`);
  }

  function captureVideoFrame() {
    const vid = document.getElementById("mainVideoPlayer");
    if (!vid || !currentMedia) return;
    try {
      if (vid.readyState < 2) {
        return triggerAssetDownload("cover", null);
      }
      const canvas = document.createElement("canvas");
      canvas.width = vid.videoWidth || 720;
      canvas.height = vid.videoHeight || 1280;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) return triggerAssetDownload("cover", null);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Frame_${currentMedia.authorId}_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        showToast("Frame video berhasil disimpan!");
      }, "image/png");
    } catch (e) {
      triggerAssetDownload("cover", null);
    }
  }

  // FYP Trending Indonesia
  async function loadTrendingVideos() {
    const box = document.getElementById("trendingResults");
    const btn = document.getElementById("trendBtn");

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Memuat FYP Indonesia...';
    box.innerHTML = '<p style="grid-column:span 2; font-size:12px; color:var(--primary); padding:16px; text-align:center;">Mengambil daftar video populer...</p>';

    try {
      const json = await fetchJsonWithRetry(`https://www.tikwm.com/api/feed/list?region=ID&count=10`, 3);
      if (!json || !json.data) throw new Error("Gagal memuat feed");
      const videos = json.data;
      feedCache = videos;
      box.innerHTML = videos
        .map(
          (v, idx) => `
        <div class="feed-item">
          <div class="feed-cover">
            <img src="${escapeHtml(v.origin_cover || v.cover)}" referrerpolicy="no-referrer" alt="Cover" loading="lazy">
            <span class="feed-badge"><i class="fa-solid fa-play"></i> ${formatNum(v.play_count)}</span>
          </div>
          <div class="feed-info">
            <div class="feed-user">@${escapeHtml(v.author?.unique_id || "tiktok")}</div>
            <div class="feed-desc">${escapeHtml(v.title || "Video TikTok")}</div>
            <button class="btn-dl-tactile" style="width:100%; padding:8px; font-size:11.5px;" onclick="selectFromFeed(${idx})">
              <i class="fa-solid fa-download"></i> Pilih Video
            </button>
          </div>
        </div>
      `
        )
        .join("");
    } catch (e) {
      box.innerHTML = '<p style="grid-column:span 2; font-size:12px; color:var(--text-sub); padding:16px; text-align:center;">Server sedang sibuk. Klik tombol di atas untuk memuat ulang.</p>';
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Segarkan Video FYP Indonesia';
    }
  }

  function selectFromFeed(idx) {
    const item = feedCache[idx];
    if (!item) return;
    switchPlatform("tiktok", null);
    populateAndRenderTiktok(item);
    document.getElementById("result").scrollIntoView({ behavior: "smooth" });
  }

  // Audio Preview
  function toggleAudioPreview() {
    if (!currentMedia || !currentMedia.music) return;
    const btn = document.getElementById("audioPlayBtn");
    const eq = document.getElementById("eqVisualizer");
    const seek = document.getElementById("audioSeekBar");
    const timeLabel = document.getElementById("audioTimeLabel");

    const vid = document.getElementById("mainVideoPlayer");
    if (vid && !vid.paused) vid.pause();

    if (!previewAudio) {
      previewAudio = new Audio(currentMedia.music);
      previewAudio.addEventListener("timeupdate", () => {
        if (!previewAudio || !previewAudio.duration) return;
        const pct = (previewAudio.currentTime / previewAudio.duration) * 100;
        if (seek) {
          seek.style.display = "block";
          seek.value = pct;
        }
        if (timeLabel) {
          timeLabel.textContent = `${formatDuration(previewAudio.currentTime)} / ${formatDuration(previewAudio.duration)}`;
        }
      });
      previewAudio.onended = () => stopAudioPreview();
    }

    if (previewAudio.paused) {
      previewAudio
        .play()
        .then(() => {
          btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
          eq.classList.add("playing");
        })
        .catch(() => showToast("Audio tidak dapat diputar langsung", "error"));
    } else {
      previewAudio.pause();
      if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i>';
      if (eq) eq.classList.remove("playing");
    }
  }

  function seekAudioPreview(val) {
    if (previewAudio && previewAudio.duration) {
      previewAudio.currentTime = (val / 100) * previewAudio.duration;
    }
  }

  function stopAudioPreview() {
    if (previewAudio) {
      previewAudio.pause();
      previewAudio = null;
    }
    const btn = document.getElementById("audioPlayBtn");
    const eq = document.getElementById("eqVisualizer");
    if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i>';
    if (eq) eq.classList.remove("playing");
  }

  function copyCaption(onlyTags = false) {
    if (!currentMedia) return;
    let text = currentMedia.title || "";
    if (onlyTags) {
      const tags = text.match(/#[\w\u00C0-\u017F]+/g);
      if (!tags || tags.length === 0) return showToast("Tidak ditemukan hashtag", "error");
      text = tags.join(" ");
    }
    navigator.clipboard.writeText(text).then(() => {
      showToast(onlyTags ? "Semua hashtag berhasil disalin" : "Teks berhasil disalin");
    });
  }

  // QR Code Generator & Downloader
  function toggleQrCode() {
    if (!currentMedia) return;
    const box = document.getElementById("qrBox");
    const img = document.getElementById("qrImg");
    const btn = document.getElementById("qrToggleBtn");
    if (!box || !img) return;

    if (box.style.display === "block") {
      box.style.display = "none";
      if (btn) btn.classList.remove("active");
    } else {
      img.src = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=10&data=${encodeURIComponent(currentMedia.url)}`;
      box.style.display = "block";
      if (btn) btn.classList.add("active");
      box.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  async function downloadQrCodeImage(btnEl) {
    if (!currentMedia) return;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=12&data=${encodeURIComponent(currentMedia.url)}`;
    const filename = `QR_KevnaiMedia_${currentMedia.platform}_${Date.now()}.png`;
    const origHtml = btnEl ? btnEl.innerHTML : "";

    try {
      if (btnEl) {
        btnEl.disabled = true;
        btnEl.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Menyiapkan QR...';
      }

      const response = await fetch(qrApiUrl);
      const blob = await response.blob();
      const bitmap = await createImageBitmap(blob);

      const canvas = document.createElement("canvas");
      canvas.width = 460;
      canvas.height = 520;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#0b1124";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(30, 30, 400, 400);
      ctx.drawImage(bitmap, 30, 30, 400, 400);

      ctx.fillStyle = "#00e5ff";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${currentMedia.platform.toUpperCase()} • @${currentMedia.authorId}`, canvas.width / 2, 465);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "600 14px sans-serif";
      ctx.fillText("KevnaiMedia • Multi-Platform Downloader", canvas.width / 2, 492);

      canvas.toBlob((finalBlob) => {
        const blobUrl = URL.createObjectURL(finalBlob || blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
        showToast("Gambar QR Code berhasil diunduh!");
      }, "image/png");
    } catch (e) {
      streamDownload(qrApiUrl, filename, btnEl);
    } finally {
      if (btnEl) {
        btnEl.disabled = false;
        btnEl.innerHTML = origHtml;
      }
    }
  }

  async function shareMedia() {
    if (!currentMedia) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: currentMedia.authorName, text: currentMedia.title, url: currentMedia.url });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(currentMedia.url);
      showToast("Tautan media disalin");
    }
  }

  async function shareWebApp() {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "KevnaiMedia — TikTok, Facebook & Terabox Downloader",
          text: "Unduh video TikTok tanpa watermark, Facebook HD, dan berkas Terabox gratis di KevnaiMedia!",
          url: shareUrl
        });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(shareUrl);
      showToast("Tautan website berhasil disalin untuk dibagikan!");
    }
  }

  function triggerAssetDownload(type, btnEl) {
    if (!currentMedia) return;
    const base = ("KevnaiMedia_" + currentMedia.platform + "_" + currentMedia.id).replace(/[^a-zA-Z0-9_-]/g, "");
    if (type === "play") streamDownload(currentMedia.play, `${base}_NoWM.mp4`, btnEl);
    else if (type === "hdplay") streamDownload(currentMedia.hdplay, `${base}_HD.mp4`, btnEl);
    else if (type === "sdplay") streamDownload(currentMedia.sdplay, `${base}_SD.mp4`, btnEl);
    else if (type === "music") streamDownload(currentMedia.music, `${base}_Audio.mp3`, btnEl);
    else if (type === "cover") streamDownload(currentMedia.cover, `${base}_Thumbnail.jpg`, btnEl);
    else if (type === "avatar") streamDownload(currentMedia.avatar, `${base}_Avatar.jpg`, btnEl);
  }

  function downloadSlide(idx, btnEl) {
    if (!currentMedia || !currentMedia.images?.[idx]) return;
    streamDownload(currentMedia.images[idx], `KevnaiMedia_Slide_${idx + 1}.jpg`, btnEl);
  }

  async function downloadAllSlides(btnEl) {
    if (!currentMedia || !Array.isArray(currentMedia.images)) return;
    btnEl.disabled = true;
    for (let i = 0; i < currentMedia.images.length; i++) {
      btnEl.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Mengunduh (${i + 1}/${currentMedia.images.length})...`;
      await streamDownload(currentMedia.images[i], `KevnaiMedia_Slide_${i + 1}.jpg`, null);
    }
    btnEl.disabled = false;
    btnEl.innerHTML = `<i class="fa-solid fa-check"></i> Semua Slide Terunduh`;
  }

  async function streamDownload(fileUrl, filename, btnEl) {
    if (!fileUrl) return showToast("Tautan file tidak tersedia", "error");
    const origHtml = btnEl ? btnEl.innerHTML : "";
    const card = document.getElementById("dlProgressCard");
    const fill = document.getElementById("dlProgressFill");
    const pct = document.getElementById("dlProgressPct");
    const label = document.getElementById("dlProgressLabel");

    try {
      if (btnEl) {
        btnEl.disabled = true;
        btnEl.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Mengunduh...`;
      }
      card.style.display = "block";
      fill.style.width = "0%";
      pct.textContent = "0%";
      label.textContent = `Mengunduh ${filename}...`;

      const response = await fetch(fileUrl, { referrerPolicy: "no-referrer" });
      if (!response.ok) throw new Error("Stream fallback");

      const total = parseInt(response.headers.get("content-length") || "0", 10);
      let loaded = 0;
      const reader = response.body.getReader();
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        if (total > 0) {
          const p = Math.min(100, Math.round((loaded / total) * 100));
          fill.style.width = p + "%";
          pct.textContent = `${p}% (${formatBytes(loaded)})`;
        } else {
          fill.style.width = "82%";
          pct.textContent = formatBytes(loaded);
        }
      }

      const blob = new Blob(chunks);
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 6000);

      incrementDownloadCount();
      showToast(`Selesai: ${filename}`);
    } catch (e) {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
      incrementDownloadCount();
      showToast("Mengalihkan unduhan langsung ke tab baru...");
    } finally {
      setTimeout(() => {
        card.style.display = "none";
      }, 1000);
      if (btnEl) {
        btnEl.disabled = false;
        btnEl.innerHTML = origHtml;
      }
    }
  }

  function incrementDownloadCount() {
    const c = parseInt(localStorage.getItem("tt_royale_dl_count") || "0", 10) + 1;
    localStorage.setItem("tt_royale_dl_count", c);
    updateStatsUI();
  }

  function updateStatsUI() {
    const dl = localStorage.getItem("tt_royale_dl_count") || "0";
    const hist = JSON.parse(localStorage.getItem("tt_royale_history") || "[]");
    document.getElementById("statDownloads").textContent = dl;
    document.getElementById("statHistory").textContent = hist.length;
  }

  function saveToHistory(entry) {
    try {
      let list = JSON.parse(localStorage.getItem("tt_royale_history") || "[]");
      list = list.filter((x) => x.url !== entry.url && x.id !== entry.id);
      list.unshift({
        id: entry.id,
        platform: entry.platform || "tiktok",
        url: entry.url,
        cover: entry.cover,
        avatar: entry.avatar,
        label: entry.label || entry.authorId || "Media"
      });
      if (list.length > 12) list.pop();
      localStorage.setItem("tt_royale_history", JSON.stringify(list));
      renderHistory();
      updateStatsUI();
    } catch (e) {}
  }

  function renderHistory() {
    const section = document.getElementById("historySection");
    const listEl = document.getElementById("historyList");
    try {
      const list = JSON.parse(localStorage.getItem("tt_royale_history") || "[]");
      if (list.length === 0) {
        section.style.display = "none";
        return;
      }
      section.style.display = "block";
      const badgeMap = { tiktok: "TT", facebook: "FB", terabox: "TB" };

      listEl.innerHTML = list
        .map((item, idx) => {
          const platCode = badgeMap[item.platform] || "TT";
          const dispLabel = item.label || (item.authorId ? "@" + item.authorId : "Media");
          const fallbackImg = buildFallbackAvatar(platCode);
          return `
          <div class="history-item-card" onclick="reloadHistoryItem(${idx})" title="Muat ulang ${escapeHtml(dispLabel)}">
            <span class="history-plat-tag">${platCode}</span>
            <button class="history-del-single" onclick="deleteSingleHistory(event, ${idx})" title="Hapus">×</button>
            <img src="${escapeHtml(item.cover || fallbackImg)}" referrerpolicy="no-referrer" alt="Riwayat" onerror="this.onerror=null; this.src='${escapeHtml(item.avatar || fallbackImg)}';">
            <div class="history-card-label">${escapeHtml(dispLabel)}</div>
          </div>
        `;
        })
        .join("");
    } catch (e) {
      section.style.display = "none";
    }
  }

  function reloadHistoryItem(idx) {
    const list = JSON.parse(localStorage.getItem("tt_royale_history") || "[]");
    const item = list[idx];
    if (!item) return;

    const plat = item.platform || detectPlatformFromUrl(item.url)?.platform || "tiktok";
    switchPlatform(plat, null);
    mediaInputEl.value = item.url;
    handleProcessClick();
  }

  function deleteSingleHistory(e, idx) {
    e.stopPropagation();
    let list = JSON.parse(localStorage.getItem("tt_royale_history") || "[]");
    list.splice(idx, 1);
    localStorage.setItem("tt_royale_history", JSON.stringify(list));
    renderHistory();
    updateStatsUI();
  }

  function clearHistory() {
    localStorage.removeItem("tt_royale_history");
    renderHistory();
    updateStatsUI();
    showToast("Semua riwayat dihapus");
  }

  function resetAll() {
    stopAudioPreview();
    mediaInputEl.value = "";
    document.getElementById("result").innerHTML = "";
    const badge = document.getElementById("autoDetectBadge");
    if (badge) badge.textContent = "Auto-Detect Aktif";
    currentMedia = null;
    showToast("Kolom dibersihkan");
  }

  // 5. Ekspos Seluruh Fungsi ke Window agar Aman di-Encode / Obfuscate
  Object.assign(window, {
    setTheme,
    toggleFullScreen,
    switchPlatform,
    pasteClipboard,
    handleProcessClick,
    resetAll,
    loadTrendingVideos,
    selectFromFeed,
    startMainVideo,
    replayMainVideo,
    setVideoSpeed,
    captureVideoFrame,
    toggleAudioPreview,
    seekAudioPreview,
    copyCaption,
    copySingleTag,
    toggleQrCode,
    downloadQrCodeImage,
    shareMedia,
    shareWebApp,
    triggerAssetDownload,
    downloadSlide,
    downloadAllSlides,
    downloadTeraboxItem,
    copyTeraboxDirectLink,
    previewTeraboxVideo,
    reloadHistoryItem,
    deleteSingleHistory,
    clearHistory
  });

  // Inisialisasi Awal
  const savedTheme = localStorage.getItem("tt_royale_theme") || "cyan";
  setTheme(savedTheme);
  updateStatsUI();
  renderHistory();
})();
