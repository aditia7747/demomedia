/**
 * KEVNAIMUSIC - ENGINE UTAMA
 * Terintegrasi penuh dengan Iroha API & Web Audio API
 */

// ==========================================
// 1. KONFIGURASI GLOBAL API
// ==========================================
const CONFIG = {
  BASE_URL: 'https://api.iroha-api.web.id/v1/KevnAImusic',
  API_KEY: 'iroha_267d3ed4b6d2afa34b83e7aa6747ee35bd29c9d7eea10cd6',
  STORAGE_HISTORY_KEY: 'kevn_aimusic_history_v1',
  DEFAULT_COVER: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600'
};

// ==========================================
// 2. STATE MANAGER
// ==========================================
const AppState = {
  currentTrack: null,
  searchResults: [],
  history: [],
  isPlaying: false,
  isMuted: false,
  volume: 0.85,
  downloadInProgress: false
};

// ==========================================
// 3. ELEMEN DOM
// ==========================================
const DOM = {
  searchForm: document.getElementById('search-form'),
  searchInput: document.getElementById('search-input'),
  btnSearch: document.getElementById('btn-search'),
  
  // Player elements
  playerCard: document.getElementById('player-card'),
  tiltWrapper: document.getElementById('card-tilt-container'),
  vinylDisc: document.getElementById('vinyl-disc'),
  vinylCenterImg: document.getElementById('vinyl-center-img'),
  albumCover: document.getElementById('album-cover'),
  trackTitle: document.getElementById('track-title'),
  trackArtist: document.getElementById('track-artist'),
  trackAlbum: document.getElementById('track-album'),
  trackDurationBadge: document.getElementById('track-duration-badge'),
  
  // Controls
  nativeAudio: document.getElementById('native-audio'),
  btnPlay: document.getElementById('btn-play'),
  iconPlay: document.getElementById('icon-play'),
  iconPause: document.getElementById('icon-pause'),
  btnPrev: document.getElementById('btn-prev'),
  btnNext: document.getElementById('btn-next'),
  
  // Timeline
  seekBar: document.getElementById('seek-bar'),
  seekFill: document.getElementById('seek-fill'),
  currentTime: document.getElementById('current-time'),
  totalTime: document.getElementById('total-time'),
  
  // Volume
  btnMute: document.getElementById('btn-mute'),
  volumeSlider: document.getElementById('volume-slider'),
  volumeFill: document.getElementById('volume-fill'),
  
  // Actions
  btnDownload: document.getElementById('btn-download'),
  downloadBtnText: document.getElementById('download-btn-text'),
  downloadProgressBar: document.getElementById('download-progress-bar'),
  btnOpenOfficial: document.getElementById('btn-open-official'),
  
  // Visualizer Canvas
  canvas: document.getElementById('visualizer-canvas'),
  
  // Tabs & Lists
  tabBtnSearch: document.getElementById('tab-btn-search'),
  tabBtnHistory: document.getElementById('tab-btn-history'),
  tabPaneSearch: document.getElementById('tab-search'),
  tabPaneHistory: document.getElementById('tab-history'),
  searchResultsList: document.getElementById('search-results-list'),
  historyResultsList: document.getElementById('history-results-list'),
  searchCount: document.getElementById('search-count'),
  historyCount: document.getElementById('history-count'),
  btnClearHistory: document.getElementById('btn-clear-history'),
  toastContainer: document.getElementById('toast-container')
};

// ==========================================
// 4. HAPTIC FEEDBACK (ANDROID / MOBILE)
// ==========================================
function triggerHaptic(type = 'light') {
  if ('vibrate' in navigator) {
    if (type === 'light') navigator.vibrate(12);
    else if (type === 'medium') navigator.vibrate([22]);
    else if (type === 'success') navigator.vibrate([15, 60, 25]);
    else if (type === 'error') navigator.vibrate([40, 40, 40]);
  }
}

// ==========================================
// 5. TOAST NOTIFIKASI TAKTIL
// ==========================================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  DOM.toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ==========================================
// 6. FORMATTER WAKTU (MM:SS)
// ==========================================
function formatTime(seconds) {
  if (isNaN(seconds) || seconds === null) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// ==========================================
// 7. WEB AUDIO API VISUALIZER
// ==========================================
let audioContext = null;
let analyser = null;
let dataArray = null;
let audioSource = null;
let visualizerAnimationId = null;

function setupWebAudio() {
  if (audioContext) return;
  try {
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtxClass();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 64;

    // Menghubungkan native audio ke analyzer
    audioSource = audioContext.createMediaElementSource(DOM.nativeAudio);
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);

    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
  } catch (err) {
    console.warn('Web Audio API mode fallback diaktifkan:', err);
  }
}

function drawVisualizer() {
  const ctx = DOM.canvas.getContext('2d');
  const width = DOM.canvas.width;
  const height = DOM.canvas.height;

  function renderFrame() {
    visualizerAnimationId = requestAnimationFrame(renderFrame);

    ctx.clearRect(0, 0, width, height);

    if (analyser && AppState.isPlaying) {
      analyser.getByteFrequencyData(dataArray);
    } else {
      // Idle / Fallback animation saat jeda
      if (dataArray) {
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = Math.max(0, dataArray[i] - 4);
        }
      }
    }

    const count = dataArray ? dataArray.length : 32;
    const barWidth = (width / count) * 1.5;
    let x = 0;

    for (let i = 0; i < count; i++) {
      let barHeight = 2;
      if (dataArray && dataArray[i] > 0) {
        barHeight = (dataArray[i] / 255) * height * 0.95;
      } else if (AppState.isPlaying) {
        // Simulasi osilasi jika CORS membatasi Web Audio Context
        barHeight = Math.sin(Date.now() / 200 + i) * 10 + 12;
      }

      // Neon Gradient Cyber Cyan
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, 'rgba(0, 229, 255, 0.2)');
      gradient.addColorStop(0.5, '#00e5ff');
      gradient.addColorStop(1, '#ffffff');

      ctx.fillStyle = gradient;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00e5ff';
      
      // Menggambar rounded visualizer bar
      ctx.beginPath();
      ctx.roundRect(x, height - barHeight, barWidth - 2, barHeight + 2, [3, 3, 0, 0]);
      ctx.fill();

      x += barWidth + 2;
    }
  }

  renderFrame();
}

function initCanvasResolution() {
  const rect = DOM.canvas.getBoundingClientRect();
  DOM.canvas.width = rect.width * window.devicePixelRatio || 300;
  DOM.canvas.height = rect.height * window.devicePixelRatio || 50;
}

// ==========================================
// 8. 3D PARALLAX TILT TACTILE EFFECT
// ==========================================
function initParallaxTilt() {
  const card = DOM.playerCard;
  const wrapper = DOM.tiltWrapper;

  if (!card || !wrapper) return;

  function handleMove(clientX, clientY) {
    const rect = wrapper.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -9; // Max 9 derajat
    const rotateY = ((x - centerX) / centerX) * 9;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
  }

  wrapper.addEventListener('mousemove', (e) => {
    handleMove(e.clientX, e.clientY);
  });

  wrapper.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  });

  // Touch support parallax
  wrapper.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  wrapper.addEventListener('touchend', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  });
}

// ==========================================
// 9. IROHA API INTEGRATION
// ==========================================

/**
 * Langkah A & B: Cari lagu lewat endpoint action=search
 */
async function searchMusic(query) {
  if (!query || query.trim() === '') return;
  
  triggerHaptic('light');
  DOM.btnSearch.disabled = true;
  DOM.btnSearch.innerText = 'Mencari...';
  renderSkeletons();

  const searchUrl = `${CONFIG.BASE_URL}?action=search&q=${encodeURIComponent(query)}&apikey=${CONFIG.API_KEY}`;

  try {
    const res = await fetch(searchUrl);
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    
    const json = await res.json();
    let items = [];

    // Parse hasil pencarian fleksibel
    if (Array.isArray(json)) {
      items = json;
    } else if (json.result && Array.isArray(json.result)) {
      items = json.result;
    } else if (json.data && Array.isArray(json.data)) {
      items = json.data;
    } else if (json.results && Array.isArray(json.results)) {
      items = json.results;
    }

    AppState.searchResults = items;
    DOM.searchCount.innerText = items.length;
    renderSearchResults(items);

    if (items.length > 0) {
      showToast(`Ditemukan ${items.length} trek lagu`, 'success');
      // Langkah C: Otomatis pilih trek pertama & minta link unduhannya
      const firstItem = items[0];
      const trackUrl = extractTrackUrl(firstItem);
      if (trackUrl) {
        await loadTrackDetailsAndPlay(firstItem, false);
      }
    } else {
      DOM.searchResultsList.innerHTML = `
        <div class="empty-state">
          <h3>Tidak Ditemukan</h3>
          <p>Lagu tidak ditemukan. Coba gunakan kata kunci artis atau judul lain.</p>
        </div>`;
      showToast('Lagu tidak ditemukan', 'error');
    }

  } catch (error) {
    console.error('Search API Error:', error);
    DOM.searchResultsList.innerHTML = `
      <div class="empty-state">
        <h3 style="color:#ff6b8b;">Gagal Memuat Lagu</h3>
        <p>Terjadi kendala pada gateway Iroha API: ${error.message}</p>
      </div>`;
    showToast('Koneksi API bermasalah', 'error');
  } finally {
    DOM.btnSearch.disabled = false;
    DOM.btnSearch.innerText = 'Cari';
  }
}

/**
 * Normalisasi properti URL dari item hasil pencarian
 */
function extractTrackUrl(item) {
  return item.url || item.link || item.track_url || item.song_url || item.id || '';
}

/**
 * Langkah C & D: Ambil link unduhan MP3 & metadata langsung dari action=download
 */
async function loadTrackDetailsAndPlay(trackItem, autoPlay = true) {
  const rawUrl = extractTrackUrl(trackItem);
  if (!rawUrl) {
    showToast('Tautan lagu tidak valid', 'error');
    return;
  }

  showToast('Menyiapkan audio & tautan unduhan...', 'info');

  const downloadApiUrl = `${CONFIG.BASE_URL}?action=download&url=${encodeURIComponent(rawUrl)}&apikey=${CONFIG.API_KEY}`;

  try {
    const res = await fetch(downloadApiUrl);
    if (!res.ok) throw new Error(`HTTP Download Error: ${res.status}`);
    
    const data = await res.json();
    const downloadPayload = data.result || data.data || data;

    // Ekstraksi data lengkap
    const trackData = {
      title: downloadPayload.title || trackItem.title || trackItem.name || 'Judul Tanpa Nama',
      artist: downloadPayload.artist || trackItem.artist || trackItem.author || 'Artis Tidak Diketahui',
      album: downloadPayload.album || trackItem.album || 'KevnAImusic Official',
      duration: downloadPayload.duration || trackItem.duration || '03:30',
      cover: downloadPayload.cover || downloadPayload.image || trackItem.cover || trackItem.image || trackItem.thumbnail || CONFIG.DEFAULT_COVER,
      downloadUrl: downloadPayload.download_url || downloadPayload.url || downloadPayload.link || downloadPayload.mp3 || '',
      officialUrl: rawUrl
    };

    AppState.currentTrack = trackData;

    // Render ke Player 3D
    renderPlayer(trackData);

    // Simpan ke Riwayat
    saveToHistory(trackData);

    // Siapkan Sumber Audio
    if (trackData.downloadUrl) {
      DOM.nativeAudio.src = trackData.downloadUrl;
      DOM.nativeAudio.load();
      if (autoPlay) {
        playMusic();
      }
    } else {
      showToast('Tautan streaming MP3 tidak tersedia dari server', 'error');
    }

  } catch (err) {
    console.error('Download Action API Error:', err);
    showToast('Gagal memproses lagu: ' + err.message, 'error');
  }
}

// ==========================================
// 10. RENDER TAMPILAN
// ==========================================

function renderPlayer(track) {
  DOM.trackTitle.innerText = track.title;
  DOM.trackArtist.innerText = track.artist;
  DOM.trackAlbum.innerText = track.album;
  DOM.trackDurationBadge.innerText = typeof track.duration === 'number' ? formatTime(track.duration) : track.duration;
  
  DOM.albumCover.src = track.cover;
  DOM.vinylCenterImg.src = track.cover;

  if (track.officialUrl) {
    DOM.btnOpenOfficial.href = track.officialUrl;
  }

  // Reset Progress Download Bar
  DOM.downloadProgressBar.style.width = '0%';
  DOM.downloadBtnText.innerText = 'Unduh MP3 Kualitas Asli';
}

function renderSearchResults(items) {
  DOM.searchResultsList.innerHTML = '';
  
  items.forEach((item, index) => {
    const title = item.title || item.name || `Trek ${index + 1}`;
    const artist = item.artist || item.author || 'Artis tidak diketahui';
    const album = item.album || 'KevnAImusic Single';
    const cover = item.cover || item.image || item.thumbnail || CONFIG.DEFAULT_COVER;
    const duration = item.duration ? (typeof item.duration === 'number' ? formatTime(item.duration) : item.duration) : '';

    const el = document.createElement('div');
    el.className = 'track-item';
    el.innerHTML = `
      <div class="item-thumb">
        <img src="${cover}" alt="${title}" loading="lazy">
      </div>
      <div class="item-info">
        <div class="item-title" title="${title}">${title}</div>
        <div class="item-sub">
          <span>${artist}</span>
          ${duration ? `• <span>${duration}</span>` : ''}
        </div>
      </div>
      <div class="item-actions">
        <button class="tactile-btn mini tactile-btn-primary item-play-btn" title="Putar">
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
            <polygon points="6 3 20 12 6 21 6 3"></polygon>
          </svg>
        </button>
      </div>
    `;

    el.querySelector('.item-play-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      triggerHaptic('medium');
      loadTrackDetailsAndPlay(item, true);
    });

    el.addEventListener('click', () => {
      triggerHaptic('light');
      loadTrackDetailsAndPlay(item, true);
    });

    DOM.searchResultsList.appendChild(el);
  });
}

function renderSkeletons() {
  DOM.searchResultsList.innerHTML = `
    <div class="skeleton-item"></div>
    <div class="skeleton-item"></div>
    <div class="skeleton-item"></div>
    <div class="skeleton-item"></div>
  `;
}

// ==========================================
// 11. SISTEM AUDIO ENGINE (PLAY / PAUSE / SEEK)
// ==========================================

function playMusic() {
  if (!DOM.nativeAudio.src) return;

  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  } else {
    setupWebAudio();
  }

  DOM.nativeAudio.play().then(() => {
    AppState.isPlaying = true;
    document.body.classList.add('is-playing');
    DOM.iconPlay.classList.add('hidden');
    DOM.iconPause.classList.remove('hidden');
    triggerHaptic('light');
  }).catch(e => {
    console.warn('Audio Autoplay terblokir, menunggu interaksi pengguna:', e);
  });
}

function pauseMusic() {
  DOM.nativeAudio.pause();
  AppState.isPlaying = false;
  document.body.classList.remove('is-playing');
  DOM.iconPlay.classList.remove('hidden');
  DOM.iconPause.classList.add('hidden');
  triggerHaptic('light');
}

function togglePlay() {
  if (AppState.isPlaying) {
    pauseMusic();
  } else {
    playMusic();
  }
}

// ==========================================
// 12. SISTEM RIWAYAT (LOCAL STORAGE)
// ==========================================

function loadHistory() {
  try {
    const raw = localStorage.getItem(CONFIG.STORAGE_HISTORY_KEY);
    AppState.history = raw ? JSON.parse(raw) : [];
  } catch {
    AppState.history = [];
  }
  DOM.historyCount.innerText = AppState.history.length;
  renderHistory();
}

function saveToHistory(track) {
  // Cegah duplikasi berdasarkan title & artist
  AppState.history = AppState.history.filter(h => !(h.title === track.title && h.artist === track.artist));
  AppState.history.unshift({
    ...track,
    playedAt: Date.now()
  });

  // Batasi 40 riwayat terbaru
  if (AppState.history.length > 40) AppState.history.pop();

  localStorage.setItem(CONFIG.STORAGE_HISTORY_KEY, JSON.stringify(AppState.history));
  DOM.historyCount.innerText = AppState.history.length;
  renderHistory();
}

function renderHistory() {
  DOM.historyResultsList.innerHTML = '';
  
  if (AppState.history.length === 0) {
    DOM.historyResultsList.innerHTML = `
      <div class="empty-state">
        <h3>Belum Ada Riwayat</h3>
        <p>Lagu yang kamu putar akan otomatis tercatat di sini.</p>
      </div>`;
    return;
  }

  AppState.history.forEach((track, index) => {
    const el = document.createElement('div');
    el.className = 'track-item';
    el.innerHTML = `
      <div class="item-thumb">
        <img src="${track.cover}" alt="${track.title}" loading="lazy">
      </div>
      <div class="item-info">
        <div class="item-title">${track.title}</div>
        <div class="item-sub">${track.artist} • ${track.album}</div>
      </div>
      <div class="item-actions">
        <button class="tactile-btn mini tactile-btn-primary history-play-btn" title="Putar Sekarang">
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
            <polygon points="6 3 20 12 6 21 6 3"></polygon>
          </svg>
        </button>
        <button class="tactile-icon-btn mini history-del-btn" title="Hapus dari riwayat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;

    el.querySelector('.history-play-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      triggerHaptic('medium');
      renderPlayer(track);
      if (track.downloadUrl) {
        DOM.nativeAudio.src = track.downloadUrl;
        DOM.nativeAudio.load();
        playMusic();
      }
    });

    el.querySelector('.history-del-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      triggerHaptic('light');
      deleteHistoryItem(index);
    });

    DOM.historyResultsList.appendChild(el);
  });
}

function deleteHistoryItem(index) {
  AppState.history.splice(index, 1);
  localStorage.setItem(CONFIG.STORAGE_HISTORY_KEY, JSON.stringify(AppState.history));
  DOM.historyCount.innerText = AppState.history.length;
  renderHistory();
  showToast('Lagu dihapus dari riwayat', 'info');
}

function clearAllHistory() {
  if (AppState.history.length === 0) return;
  triggerHaptic('medium');
  AppState.history = [];
  localStorage.removeItem(CONFIG.STORAGE_HISTORY_KEY);
  DOM.historyCount.innerText = 0;
  renderHistory();
  showToast('Semua riwayat telah dihapus', 'info');
}

// ==========================================
// 13. FITUR UNDUHAN REAL-TIME STREAMING
// ==========================================

async function downloadCurrentTrack() {
  if (!AppState.currentTrack || !AppState.currentTrack.downloadUrl) {
    showToast('Pilih lagu terlebih dahulu untuk mengunduh', 'error');
    return;
  }

  if (AppState.downloadInProgress) {
    showToast('Unduhan sedang berjalan...', 'info');
    return;
  }

  triggerHaptic('medium');
  AppState.downloadInProgress = true;
  DOM.btnDownload.disabled = true;

  const url = AppState.currentTrack.downloadUrl;
  const fileName = `${AppState.currentTrack.artist} - ${AppState.currentTrack.title}.mp3`.replace(/[/\\?%*:|"<>]/g, '');

  try {
    DOM.downloadBtnText.innerText = 'Menyambungkan...';
    DOM.downloadProgressBar.style.width = '5%';

    const response = await fetch(url);
    if (!response.ok) throw new Error('Gagal mengambil file unduhan');

    const contentLength = response.headers.get('content-length');
    const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
    
    const reader = response.body.getReader();
    let receivedBytes = 0;
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      receivedBytes += value.length;

      if (totalBytes > 0) {
        const percent = Math.round((receivedBytes / totalBytes) * 100);
        const receivedMB = (receivedBytes / (1024 * 1024)).toFixed(1);
        const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);
        DOM.downloadProgressBar.style.width = `${percent}%`;
        DOM.downloadBtnText.innerText = `Mengunduh ${percent}% (${receivedMB}/${totalMB} MB)`;
      } else {
        const receivedMB = (receivedBytes / (1024 * 1024)).toFixed(1);
        DOM.downloadBtnText.innerText = `Mengunduh ${receivedMB} MB...`;
      }
    }

    // Buat Blob dan trigger save file
    const blob = new Blob(chunks, { type: 'audio/mpeg' });
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(blobUrl);

    DOM.downloadProgressBar.style.width = '100%';
    DOM.downloadBtnText.innerText = 'Selesai Mengunduh!';
    triggerHaptic('success');
    showToast('File MP3 berhasil disimpan ke perangkat!', 'success');

  } catch (err) {
    console.warn('Direct stream fetch download dibatasi oleh CORS, fallback ke browser download:', err);
    // Fallback bila server melarang stream CORS via fetch: Buka di window baru dengan tag download
    const fallbackLink = document.createElement('a');
    fallbackLink.href = url;
    fallbackLink.download = fileName;
    fallbackLink.target = '_blank';
    document.body.appendChild(fallbackLink);
    fallbackLink.click();
    fallbackLink.remove();

    DOM.downloadBtnText.innerText = 'Mengunduh via Browser...';
    showToast('Mengunduh langsung via peramban...', 'info');
  } finally {
    setTimeout(() => {
      AppState.downloadInProgress = false;
      DOM.btnDownload.disabled = false;
      DOM.downloadProgressBar.style.width = '0%';
      DOM.downloadBtnText.innerText = 'Unduh MP3 Kualitas Asli';
    }, 3500);
  }
}

// ==========================================
// 14. EVENT LISTENERS
// ==========================================

function initEvents() {
  // Submit Pencarian
  DOM.searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = DOM.searchInput.value;
    searchMusic(query);
  });

  // Play / Pause Master
  DOM.btnPlay.addEventListener('click', togglePlay);

  // Audio Timeline Update
  DOM.nativeAudio.addEventListener('timeupdate', () => {
    const cur = DOM.nativeAudio.currentTime;
    const dur = DOM.nativeAudio.duration;
    
    DOM.currentTime.innerText = formatTime(cur);

    if (!isNaN(dur) && dur > 0) {
      DOM.totalTime.innerText = formatTime(dur);
      const progressPercent = (cur / dur) * 100;
      DOM.seekBar.value = progressPercent;
      DOM.seekFill.style.width = `${progressPercent}%`;
    }
  });

  // Seekbar Input
  DOM.seekBar.addEventListener('input', () => {
    const dur = DOM.nativeAudio.duration;
    if (!isNaN(dur) && dur > 0) {
      const targetTime = (DOM.seekBar.value / 100) * dur;
      DOM.nativeAudio.currentTime = targetTime;
      DOM.seekFill.style.width = `${DOM.seekBar.value}%`;
    }
  });

  // Audio Selesai Berputar
  DOM.nativeAudio.addEventListener('ended', () => {
    pauseMusic();
    DOM.seekBar.value = 0;
    DOM.seekFill.style.width = '0%';
  });

  // Volume Slider
  DOM.volumeSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    DOM.nativeAudio.volume = val;
    AppState.volume = val;
    DOM.volumeFill.style.width = `${val * 100}%`;
  });

  // Mute Toggle
  DOM.btnMute.addEventListener('click', () => {
    AppState.isMuted = !AppState.isMuted;
    DOM.nativeAudio.muted = AppState.isMuted;
    triggerHaptic('light');
    if (AppState.isMuted) {
      DOM.volumeFill.style.width = '0%';
      DOM.btnMute.style.opacity = '0.5';
    } else {
      DOM.volumeFill.style.width = `${AppState.volume * 100}%`;
      DOM.btnMute.style.opacity = '1';
    }
  });

  // Prev / Next Mock Action
  DOM.btnNext.addEventListener('click', () => {
    triggerHaptic('light');
    if (AppState.searchResults.length > 1) {
      const currentIndex = AppState.searchResults.findIndex(s => s.title === AppState.currentTrack?.title);
      const nextIndex = (currentIndex + 1) % AppState.searchResults.length;
      loadTrackDetailsAndPlay(AppState.searchResults[nextIndex], true);
    } else {
      showToast('Tidak ada daftar trek selanjutnya', 'info');
    }
  });

  DOM.btnPrev.addEventListener('click', () => {
    triggerHaptic('light');
    if (AppState.searchResults.length > 1) {
      const currentIndex = AppState.searchResults.findIndex(s => s.title === AppState.currentTrack?.title);
      const prevIndex = (currentIndex - 1 + AppState.searchResults.length) % AppState.searchResults.length;
      loadTrackDetailsAndPlay(AppState.searchResults[prevIndex], true);
    } else {
      DOM.nativeAudio.currentTime = 0;
    }
  });

  // Unduh MP3
  DOM.btnDownload.addEventListener('click', downloadCurrentTrack);

  // Tab Switching
  DOM.tabBtnSearch.addEventListener('click', () => {
    triggerHaptic('light');
    DOM.tabBtnSearch.classList.add('active');
    DOM.tabBtnHistory.classList.remove('active');
    DOM.tabPaneSearch.classList.add('active');
    DOM.tabPaneHistory.classList.remove('active');
  });

  DOM.tabBtnHistory.addEventListener('click', () => {
    triggerHaptic('light');
    DOM.tabBtnHistory.classList.add('active');
    DOM.tabBtnSearch.classList.remove('active');
    DOM.tabPaneHistory.classList.add('active');
    DOM.tabPaneSearch.classList.remove('active');
  });

  // Hapus Semua Riwayat
  DOM.btnClearHistory.addEventListener('click', clearAllHistory);

  // Resize Canvas on Window Resize
  window.addEventListener('resize', initCanvasResolution);
}

// ==========================================
// 15. INISIALISASI SAAT HALAMAN DIMUAT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initEvents();
  initParallaxTilt();
  initCanvasResolution();
  drawVisualizer();
  loadHistory();

  // Volume slider visual init
  DOM.volumeFill.style.width = `${AppState.volume * 100}%`;
  DOM.nativeAudio.volume = AppState.volume;
});