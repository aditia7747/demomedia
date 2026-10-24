/**
 * VANNMRTNZZ — MEDIA DOWNLOADER ENGINE
 * Integrasi penuh dengan Iroha REST API v1
 */

const API_CONFIG = {
  BASE_URL: "https://api.iroha-api.web.id",
  API_KEY: "iroha_267d3ed4b6d2afa34b83e7aa6747ee35bd29c9d7eea10cd6",
};

const GUIDE_TIPS = {
  1: "<strong>Tips Tahap 1:</strong> Tautan pendek seperti <code>vt.tiktok.com</code> maupun tautan penuh dari peramban desktop keduanya didukung penuh.",
  2: "<strong>Tips Tahap 2:</strong> Pada tab YouTube ke MP3, Anda cukup mengetik judul lagu dan nama penyanyi tanpa harus menyalin URL.",
  3: "<strong>Tips Tahap 3:</strong> Jika berkas terbuka di tab baru saat diklik, tekan titik tiga di pojok pemutar lalu pilih <strong>Download / Simpan</strong>.",
};

const FALLBACK_THUMBNAIL =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
      <rect width="640" height="400" fill="#121318"/>
      <circle cx="320" cy="200" r="50" fill="none" stroke="#00f0ff" stroke-width="4"/>
      <polygon points="308,180 345,200 308,220" fill="#00f0ff"/>
    </svg>`
  );

document.addEventListener("DOMContentLoaded", () => {
  initSplashScreen();
  initTabs();
  initPasteButtons();
  initGuideSteps();
  initForms();
});

/**
 * 1. Intro Cyber Scanner Loader selama 1 detik (1000ms)
 */
function initSplashScreen() {
  const splash = document.getElementById("splash-screen");
  if (!splash) return;

  setTimeout(() => {
    splash.classList.add("splash-hidden");
    setTimeout(() => {
      splash.remove();
    }, 500);
  }, 1000);
}

/**
 * 2. Logika Tab Switching (TikTok, YouTube MP3, Facebook)
 */
function initTabs() {
  const tabButtons = document.querySelectorAll(".tactile-tab");
  const tabPanels = document.querySelectorAll(".tab-panel");
  const statusContainer = document.getElementById("status-container");
  const resultContainer = document.getElementById("result-container");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");

      tabButtons.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });

      tabPanels.forEach((panel) => {
        panel.classList.remove("active");
        panel.hidden = true;
      });

      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      const activePanel = document.getElementById(`panel-${targetTab}`);
      if (activePanel) {
        activePanel.classList.add("active");
        activePanel.hidden = false;
      }

      statusContainer.innerHTML = "";
      resultContainer.innerHTML = "";
    });
  });
}

/**
 * 3. Tombol Tempel Cepat dari Clipboard
 */
function initPasteButtons() {
  const pasteButtons = document.querySelectorAll(".btn-paste");

  pasteButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const targetId = btn.getAttribute("data-target");
      const inputEl = document.getElementById(targetId);
      if (!inputEl) return;

      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          inputEl.value = text.trim();
          inputEl.focus();
        }
      } catch (err) {
        inputEl.focus();
        showError("Izin papan klip ditolak oleh peramban. Silakan tempel secara manual (Ctrl+V atau tahan lalu Tempel).");
      }
    });
  });
}

/**
 * 4. Panduan Penggunaan Interaktif
 */
function initGuideSteps() {
  const steps = document.querySelectorAll(".guide-step");
  const tipText = document.getElementById("guide-tip-text");

  steps.forEach((step) => {
    step.addEventListener("click", () => {
      steps.forEach((s) => s.classList.remove("active"));
      step.classList.add("active");

      const stepNum = step.getAttribute("data-step");
      if (tipText && GUIDE_TIPS[stepNum]) {
        tipText.innerHTML = GUIDE_TIPS[stepNum];
      }
    });
  });
}

/**
 * 5. Inisialisasi dan Validasi Form
 */
function initForms() {
  const formTikTok = document.getElementById("form-tiktok");
  const formYtMp3 = document.getElementById("form-ytmp3");
  const formFacebook = document.getElementById("form-facebook");

  if (formTikTok) {
    formTikTok.addEventListener("submit", async (e) => {
      e.preventDefault();
      const rawUrl = document.getElementById("input-tiktok").value.trim();
      if (!isValidHttpUrl(rawUrl)) {
        showError("Masukkan tautan video TikTok yang valid (diawali http:// atau https://).");
        return;
      }
      await handleTikTokDownload(rawUrl, formTikTok);
    });
  }

  if (formYtMp3) {
    formYtMp3.addEventListener("submit", async (e) => {
      e.preventDefault();
      const query = document.getElementById("input-ytmp3").value.trim();
      const quality = document.getElementById("select-bitrate").value;
      if (!query) {
        showError("Masukkan judul lagu atau kata kunci pencarian terlebih dahulu.");
        return;
      }
      await handleYouTubeMp3Download(query, quality, formYtMp3);
    });
  }

  if (formFacebook) {
    formFacebook.addEventListener("submit", async (e) => {
      e.preventDefault();
      const rawUrl = document.getElementById("input-facebook").value.trim();
      if (!isValidHttpUrl(rawUrl)) {
        showError("Masukkan tautan video atau reel Facebook yang valid (diawali http:// atau https://).");
        return;
      }
      await handleFacebookDownload(rawUrl, formFacebook);
    });
  }
}

/**
 * Helper: Validasi URL
 */
function isValidHttpUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

/**
 * Helper: Request ke Iroha API dengan Header Authorization Bearer
 */
async function fetchFromIroha(endpointPath) {
  const response = await fetch(`${API_CONFIG.BASE_URL}${endpointPath}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${API_CONFIG.API_KEY}`,
      Accept: "application/json",
    },
  });

  let json;
  try {
    json = await response.json();
  } catch (err) {
    throw new Error(`Respons server bukan format JSON yang valid (HTTP ${response.status}).`);
  }

  if (!response.ok) {
    const serverMsg = json?.message || json?.error || json?.msg || `Gagal memproses permintaan (HTTP ${response.status}).`;
    throw new Error(serverMsg);
  }

  if (json?.status === false || json?.ok === false || json?.success === false) {
    throw new Error(json?.message || json?.error || "Gagal mengambil data media dari tautan tersebut.");
  }

  return json;
}

/**
 * Helper: Ekstrak objek inti dari respons JSON API
 */
function unwrapPayload(json) {
  if (!json || typeof json !== "object") return {};
  if (json.result && typeof json.result === "object" && !Array.isArray(json.result)) {
    return json.result;
  }
  if (json.data && typeof json.data === "object" && !Array.isArray(json.data)) {
    return json.data;
  }
  return json;
}

/**
 * 6. Handler: TikTok Downloader
 * Endpoint: GET /v1/tt?url={encoded_url}
 */
async function handleTikTokDownload(url, formEl) {
  const submitBtn = formEl.querySelector(".btn-submit");
  setLoadingState(true, submitBtn, "Mengekstrak data video TikTok...");

  try {
    const encodedUrl = encodeURIComponent(url);
    const json = await fetchFromIroha(`/v1/tt?url=${encodedUrl}`);
    const data = unwrapPayload(json);

    // Ekstraksi fleksibel untuk berbagai skema respons TikTok API
    const title =
      data.title ||
      data.desc ||
      data.description ||
      data.caption ||
      "Video TikTok Tanpa Judul";

    const thumbnail =
      data.cover ||
      data.origin_cover ||
      data.thumbnail ||
      data.dynamic_cover ||
      data.author?.avatar ||
      FALLBACK_THUMBNAIL;

    const rawAuthor =
      data.author?.unique_id ||
      data.author?.nickname ||
      (typeof data.author === "string" ? data.author : null) ||
      data.username ||
      data.nickname ||
      "kreator";
    const authorHandle = String(rawAuthor).startsWith("@") ? rawAuthor : `@${rawAuthor}`;

    const views = formatNumber(
      data.play_count ?? data.stats?.playCount ?? data.views ?? data.statistics?.play_count
    );
    const likes = formatNumber(
      data.digg_count ?? data.stats?.diggCount ?? data.likes ?? data.statistics?.digg_count
    );

    // Cari link video HD, SD, dan MP3
    const mediaLinks = extractMediaLinks(data);
    const videoHdUrl =
      data.hdplay ||
      data.video_hd ||
      data.hd ||
      data.nowm_hd ||
      data.video?.hd ||
      mediaLinks.hd ||
      data.play ||
      data.nowm ||
      data.url;

    const videoSdUrl =
      data.play ||
      data.video_sd ||
      data.sd ||
      data.nowm ||
      data.wmplay ||
      data.video?.noWatermark ||
      data.video?.url ||
      mediaLinks.sd ||
      videoHdUrl;

    const audioMp3Url =
      (typeof data.music === "string" ? data.music : data.music?.play_url || data.music?.url) ||
      data.music_info?.play ||
      data.audio ||
      data.mp3 ||
      data.audio_url ||
      mediaLinks.audio;

    renderTikTokCard({
      title,
      thumbnail,
      authorHandle,
      views,
      likes,
      videoHdUrl,
      videoSdUrl,
      audioMp3Url,
    });
  } catch (err) {
    showError(err.message || "Terjadi kesalahan saat memproses tautan TikTok.");
  } finally {
    setLoadingState(false, submitBtn);
  }
}

/**
 * 7. Handler: YouTube ke MP3 Downloader
 * Endpoint: GET /v1/yt/s/play?query={encoded_query}&quality={bitrate}
 */
async function handleYouTubeMp3Download(query, quality, formEl) {
  const submitBtn = formEl.querySelector(".btn-submit");
  setLoadingState(true, submitBtn, `Mencari & mengonversi audio (${quality} kbps)...`);

  try {
    const encodedQuery = encodeURIComponent(query);
    const encodedQuality = encodeURIComponent(quality);
    const json = await fetchFromIroha(
      `/v1/yt/s/play?query=${encodedQuery}&quality=${encodedQuality}`
    );
    const data = unwrapPayload(json);

    const title =
      data.title ||
      data.metadata?.title ||
      data.video?.title ||
      data.name ||
      query;

    const thumbnail =
      data.thumbnail ||
      data.image ||
      data.thumb ||
      data.metadata?.thumbnail ||
      data.video?.thumbnail ||
      FALLBACK_THUMBNAIL;

    const channel =
      data.channel ||
      data.author?.name ||
      (typeof data.author === "string" ? data.author : null) ||
      data.uploader ||
      data.metadata?.channel ||
      data.metadata?.author ||
      "YouTube Music";

    const duration =
      data.duration?.timestamp ||
      (typeof data.duration === "string" || typeof data.duration === "number" ? data.duration : null) ||
      data.timestamp ||
      data.metadata?.duration ||
      "Audio";

    const mediaLinks = extractMediaLinks(data);
    const mp3Url =
      data.dlink ||
      data.download?.url ||
      data.download_url ||
      (typeof data.download === "string" ? data.download : null) ||
      data.audio ||
      data.mp3 ||
      data.dl_link ||
      data.link ||
      data.url ||
      mediaLinks.audio ||
      mediaLinks.hd;

    renderYouTubeMp3Card({
      title,
      thumbnail,
      channel,
      duration,
      quality,
      mp3Url,
    });
  } catch (err) {
    showError(err.message || "Gagal mengonversi lagu dari YouTube. Coba kata kunci lain.");
  } finally {
    setLoadingState(false, submitBtn);
  }
}

/**
 * 8. Handler: Facebook Downloader
 * Endpoint: GET /v1/fbdown?url={encoded_url}
 */
async function handleFacebookDownload(url, formEl) {
  const submitBtn = formEl.querySelector(".btn-submit");
  setLoadingState(true, submitBtn, "Mengekstrak tautan video Facebook...");

  try {
    const encodedUrl = encodeURIComponent(url);
    const json = await fetchFromIroha(`/v1/fbdown?url=${encodedUrl}`);
    const data = unwrapPayload(json);

    const title =
      data.title ||
      data.desc ||
      data.description ||
      data.caption ||
      "Video / Reel Facebook";

    const thumbnail =
      data.thumbnail ||
      data.thumb ||
      data.image ||
      data.cover ||
      data.picture ||
      FALLBACK_THUMBNAIL;

    const mediaLinks = extractMediaLinks(data);

    const videoHdUrl =
      data.hd ||
      data.video_hd ||
      data.hd_url ||
      data.HD ||
      data.links?.hd ||
      data.links?.HD ||
      mediaLinks.hd ||
      data.Normal_video ||
      data.url;

    const videoSdUrl =
      data.sd ||
      data.video_sd ||
      data.sd_url ||
      data.SD ||
      data.links?.sd ||
      data.links?.SD ||
      data.Normal_video ||
      mediaLinks.sd ||
      videoHdUrl;

    const audioMp3Url =
      data.audio ||
      data.mp3 ||
      data.audio_url ||
      data.music ||
      data.links?.audio ||
      mediaLinks.audio;

    renderFacebookCard({
      title,
      thumbnail,
      videoHdUrl,
      videoSdUrl,
      audioMp3Url,
    });
  } catch (err) {
    showError(err.message || "Gagal mengambil video Facebook. Pastikan video bersifat publik.");
  } finally {
    setLoadingState(false, submitBtn);
  }
}

/**
 * Helper: Ekstrak link dari array media/links/downloads jika API mengembalikan list kualitas
 */
function extractMediaLinks(data) {
  const found = { hd: null, sd: null, audio: null };
  const candidates =
    data.medias ||
    data.media ||
    data.links ||
    data.downloads ||
    (Array.isArray(data.result) ? data.result : null) ||
    (Array.isArray(data.data) ? data.data : null);

  if (!Array.isArray(candidates)) return found;

  candidates.forEach((item) => {
    if (!item || typeof item !== "object") return;
    const link = item.url || item.link || item.dlink || item.download;
    if (!link) return;

    const q = String(item.quality || item.resolution || item.label || item.type || "").toLowerCase();
    const ext = String(item.extension || item.format || "").toLowerCase();

    if (q.includes("audio") || q.includes("mp3") || ext === "mp3" || ext === "m4a") {
      if (!found.audio) found.audio = link;
    } else if (q.includes("hd") || q.includes("1080") || q.includes("720") || q.includes("high")) {
      if (!found.hd) found.hd = link;
    } else if (q.includes("sd") || q.includes("480") || q.includes("360") || q.includes("normal")) {
      if (!found.sd) found.sd = link;
    } else if (!found.hd) {
      found.hd = link;
    } else if (!found.sd) {
      found.sd = link;
    }
  });

  return found;
}

/**
 * Render Kartu Hasil: TikTok
 */
function renderTikTokCard({
  title,
  thumbnail,
  authorHandle,
  views,
  likes,
  videoHdUrl,
  videoSdUrl,
  audioMp3Url,
}) {
  const resultContainer = document.getElementById("result-container");

  resultContainer.innerHTML = `
    <article class="media-result-card">
      <div class="media-thumb-wrap">
        <img src="${escapeAttr(thumbnail)}" alt="Thumbnail TikTok" class="media-thumb" onerror="this.src='${FALLBACK_THUMBNAIL}'" />
        <span class="platform-chip">TikTok</span>
      </div>
      <div class="media-details">
        <div>
          <h3 class="media-title">${escapeHtml(title)}</h3>
          <div class="media-meta-list" style="margin-top: 10px;">
            <span class="meta-pill">Kreator: <strong>${escapeHtml(authorHandle)}</strong></span>
            <span class="meta-pill">Tayangan: <strong>${escapeHtml(views)}</strong></span>
            <span class="meta-pill">Suka: <strong>${escapeHtml(likes)}</strong></span>
          </div>
        </div>
        <div class="download-actions">
          ${renderDownloadButton(videoHdUrl, "Unduh Video HD", "btn-primary", "video")}
          ${renderDownloadButton(videoSdUrl, "Unduh Video Standar", "", "video")}
          ${renderDownloadButton(audioMp3Url, "Unduh Audio MP3", "btn-lime", "audio")}
        </div>
      </div>
    </article>
  `;
}

/**
 * Render Kartu Hasil: YouTube ke MP3
 */
function renderYouTubeMp3Card({
  title,
  thumbnail,
  channel,
  duration,
  quality,
  mp3Url,
}) {
  const resultContainer = document.getElementById("result-container");

  resultContainer.innerHTML = `
    <article class="media-result-card">
      <div class="media-thumb-wrap">
        <img src="${escapeAttr(thumbnail)}" alt="Thumbnail YouTube" class="media-thumb" onerror="this.src='${FALLBACK_THUMBNAIL}'" />
        <span class="platform-chip">YT MP3 • ${escapeHtml(quality)}kbps</span>
      </div>
      <div class="media-details">
        <div>
          <h3 class="media-title">${escapeHtml(title)}</h3>
          <div class="media-meta-list" style="margin-top: 10px;">
            <span class="meta-pill">Channel: <strong>${escapeHtml(channel)}</strong></span>
            <span class="meta-pill">Durasi: <strong>${escapeHtml(String(duration))}</strong></span>
            <span class="meta-pill">Bitrate: <strong>${escapeHtml(quality)} kbps</strong></span>
          </div>
        </div>
        <div>
          <div class="download-actions">
            ${renderDownloadButton(mp3Url, "Unduh MP3", "btn-lime", "audio")}
          </div>
          <div class="expiry-notice">
            <svg class="icon-svg-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Catatan: Tautan unduhan memiliki batas waktu kedaluwarsa. Segera simpan berkas setelah pemrosesan selesai.</span>
          </div>
        </div>
      </div>
    </article>
  `;
}

/**
 * Render Kartu Hasil: Facebook
 */
function renderFacebookCard({
  title,
  thumbnail,
  videoHdUrl,
  videoSdUrl,
  audioMp3Url,
}) {
  const resultContainer = document.getElementById("result-container");

  resultContainer.innerHTML = `
    <article class="media-result-card">
      <div class="media-thumb-wrap">
        <img src="${escapeAttr(thumbnail)}" alt="Thumbnail Facebook" class="media-thumb" onerror="this.src='${FALLBACK_THUMBNAIL}'" />
        <span class="platform-chip">Facebook</span>
      </div>
      <div class="media-details">
        <div>
          <h3 class="media-title">${escapeHtml(title)}</h3>
          <div class="media-meta-list" style="margin-top: 10px;">
            <span class="meta-pill">Sumber: <strong>Facebook Video / Reel</strong></span>
            <span class="meta-pill">Status: <strong>Siap Unduh</strong></span>
          </div>
        </div>
        <div class="download-actions">
          ${renderDownloadButton(videoHdUrl, "Unduh Kualitas HD", "btn-primary", "video")}
          ${renderDownloadButton(videoSdUrl, "Unduh Kualitas SD", "", "video")}
          ${renderDownloadButton(audioMp3Url, "Unduh Audio MP3", "btn-lime", "audio")}
        </div>
      </div>
    </article>
  `;
}

/**
 * Helper: Buat tombol tautan unduh 3D Tactile
 */
function renderDownloadButton(url, label, variantClass, iconType) {
  const iconSvg =
    iconType === "audio"
      ? `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`
      : `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>`;

  if (!url) {
    return `
      <button type="button" class="tactile-btn" disabled title="Format ini tidak tersedia untuk konten ini">
        ${iconSvg}
        <span>${escapeHtml(label)} (Tidak Tersedia)</span>
      </button>
    `;
  }

  return `
    <a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer" download class="tactile-btn ${variantClass}">
      ${iconSvg}
      <span>${escapeHtml(label)}</span>
    </a>
  `;
}

/**
 * State Loading & Pesan Error
 */
function setLoadingState(isLoading, submitBtn, message = "Memproses permintaan...") {
  const statusContainer = document.getElementById("status-container");
  const resultContainer = document.getElementById("result-container");

  if (submitBtn) {
    submitBtn.disabled = isLoading;
  }

  if (isLoading) {
    resultContainer.innerHTML = "";
    statusContainer.innerHTML = `
      <div class="loading-box">
        <div class="cyber-spinner"></div>
        <span>${escapeHtml(message)}</span>
      </div>
    `;
  } else {
    statusContainer.innerHTML = "";
  }
}

function showError(message) {
  const statusContainer = document.getElementById("status-container");
  statusContainer.innerHTML = `
    <div class="alert-box" role="alert">
      <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
      </svg>
      <div>
        <strong>Permintaan Gagal:</strong> ${escapeHtml(message)}
      </div>
    </div>
  `;
}

/**
 * Helper: Format Angka Statistik & Sanitasi HTML
 */
function formatNumber(num) {
  if (num === undefined || num === null || num === "") return "-";
  const parsed = Number(num);
  if (Number.isNaN(parsed)) return String(num);
  return new Intl.NumberFormat("id-ID").format(parsed);
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(str) {
  return escapeHtml(str);
}