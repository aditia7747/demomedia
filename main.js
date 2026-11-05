import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider,
  signInWithPopup,
  signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getDatabase, 
  ref, 
  get, 
  set, 
  update, 
  remove 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// 1. CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyBlISjGEArUzKBmVsA3n5RyUBeLOOUgxdw",
  authDomain: "kevnaipromptersss.firebaseapp.com",
  databaseURL: "https://kevnaipromptersss-default-rtdb.firebaseio.com",
  projectId: "kevnaipromptersss",
  storageBucket: "kevnaipromptersss.firebasestorage.app",
  messagingSenderId: "221519062124",
  appId: "1:221519062124:web:039ff682106e37bf772449"
};
const GEMINI_API_KEY = "AIzaSyDpGn2De8UL9lXIHblX5AUh7ePq_gQehb0";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const googleProvider = new GoogleAuthProvider();

const ROLE_LIMITS = {
  free: 5,
  vip: 50,
  reseller: 200,
  admin: 999999
};

let currentUser = null;
let userData = null;
let silentDeviceKey = null;
let deviceUsedToday = 0;
let isRegisterMode = false;
let currentImageBase64 = null;

// 2. DEVICE FINGERPRINTING
async function getSilentDeviceFingerprint() {
  if (silentDeviceKey) return silentDeviceKey;

  const traits = [
    navigator.platform || '',
    navigator.language || '',
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    String(window.devicePixelRatio || 1),
    String(navigator.hardwareConcurrency || 4),
    Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  ];

  try {
    const glCanvas = document.createElement('canvas');
    const gl = glCanvas.getContext('webgl') || glCanvas.getContext('experimental-webgl');
    if (gl) {
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      if (dbg) traits.push(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '');
    }
  } catch (e) {}

  try {
    const c = document.createElement('canvas');
    c.width = 180;
    c.height = 40;
    const ctx = c.getContext('2d');
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#B8FF01';
    ctx.fillRect(5, 5, 60, 20);
    ctx.fillStyle = '#111111';
    ctx.fillText('KevnAIStudio3D', 10, 18);
    traits.push(c.toDataURL().slice(-64));
  } catch (e) {}

  const msgBuffer = new TextEncoder().encode(traits.join('|'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hex = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, 16);

  silentDeviceKey = `dfp_${hex}`;
  return silentDeviceKey;
}

function getJakartaDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

// 3. MASTER SYSTEM PROMPT V1.7
const MASTER_SYSTEM_INSTRUCTION = `You are an ultra-precise visual reverse-engineering system following V1.7 Reference-Adaptive Rules.
Perform a 99.9% accurate visual analysis of the uploaded reference image and generate a final AI image generation prompt in English.
CRITICAL V1.7 RULES:
1. Reference Structure Supremacy: Never guess, add, remove, or redesign visual content not present in the reference image. Strictly preserve original orientation, aspect ratio, camera roll, tilt, Dutch angle, crop, framing, mirror reflection, or multi-panel collage structure. Do NOT auto-straighten, do NOT normalize orientation, and do NOT force 9:16 if the reference differs.
2. Facial Identity & Realistic Clean Skin: Strictly match facial geometry, eye shape, nose structure, lips, jawline, expression, and makeup (if present, preserve accurately; if absent, do not add). Describe skin as a clean, smooth, healthy, and natural complexion with authentic soft micro skin texture and fine natural pores, completely free from blemishes, acne, pimples, blackheads, enlarged pores, pitted scars, oily sheen, or artificial imperfections (while avoiding plastic skin smoothing or beauty filters).
3. Candid iPhone 17 Pro Physics: Simulate a genuine, unedited raw candid smartphone photograph captured in the real world using an iPhone 17 Pro in lighting and perspective matching the reference.

Return ONLY a valid JSON object with these exact 3 keys (each value must be a single continuous paragraph without line breaks inside the paragraph):
{
  "part1_edit": "Must start with: 'Edit and preserve the original face and identity of every visible person based on the reference image provided. Do not change facial identity...' and exhaustively describe every visible subject, facial features, clean skin complexion, hair, exact pose, hands/fingers, clothing layers/patterns, accessories, foreground/midground/background objects, spatial occlusion, reflections, lighting, and exact camera orientation/tilt/framing.",
  "part2_desc": "Must start with: 'The final image must appear as a genuine, unedited raw candid smartphone photograph captured in the real world using an iPhone 17 Pro...' and describe authentic clean skin physics, lighting behavior, tactile surface/fabric micro-textures, and native smartphone optical characteristics.",
  "part3_neg": "Must start with: 'Negative prompt: wrong identity, different face, facial distortion, altered facial geometry, generic AI face, beauty filter, airbrushed skin, plastic skin...' and list all forbidden alterations, skin defects (acne, pimples, blackheads, enlarged pores, pitted skin, oily skin), wrong hair/clothing/pose, artificial bokeh, studio lighting, auto-straightened composition, and elements not present in the original reference image."
}`;

// 4. AUTH & USER DATA SYNC
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  await getSilentDeviceFingerprint();
  if (user) {
    await syncUserProfileAndQuota(user);
    toggleLoggedInView(true);
  } else {
    userData = null;
    toggleLoggedInView(false);
  }
});

async function syncUserProfileAndQuota(user) {
  const todayWIB = getJakartaDate();
  const now = Date.now();
  const fp = await getSilentDeviceFingerprint();
  const isEmailAdmin = user.email && user.email.toLowerCase() === 'admin@kevnai.com';

  const devUsageRef = ref(db, `device_usage/${fp}/${todayWIB}`);
  const devSnap = await get(devUsageRef);
  deviceUsedToday = devSnap.exists() ? (Number(devSnap.val().used) || 0) : 0;

  const userRef = ref(db, `users/${user.uid}`);
  const userSnap = await get(userRef);

  if (!userSnap.exists()) {
    const initialRole = isEmailAdmin ? 'admin' : 'free';
    const initialUsed = initialRole === 'free' ? deviceUsedToday : 0;
    const newProfile = {
      email: user.email,
      role: initialRole,
      dailyLimit: ROLE_LIMITS[initialRole],
      usedToday: initialUsed,
      extraLimit: 0,
      extraExpiresAt: 0,
      vipExpiresAt: 0,
      deviceFp: fp,
      lastResetDate: todayWIB,
      createdAt: now
    };
    await set(userRef, newProfile);
    userData = newProfile;
  } else {
    userData = userSnap.val();
    const updates = {};

    if (isEmailAdmin && userData.role !== 'admin') {
      updates.role = 'admin';
      updates.dailyLimit = ROLE_LIMITS.admin;
      userData.role = 'admin';
      userData.dailyLimit = ROLE_LIMITS.admin;
    }

    if (userData.lastResetDate !== todayWIB) {
      updates.usedToday = 0;
      updates.lastResetDate = todayWIB;
      userData.usedToday = 0;
      userData.lastResetDate = todayWIB;
    }

    if ((userData.role === 'vip' || userData.role === 'reseller') && userData.vipExpiresAt > 0 && now > userData.vipExpiresAt) {
      updates.role = 'free';
      updates.dailyLimit = ROLE_LIMITS.free;
      updates.vipExpiresAt = 0;
      userData.role = 'free';
      userData.dailyLimit = ROLE_LIMITS.free;
      userData.vipExpiresAt = 0;
      showToast('Masa aktif paket member telah berakhir.', 'info');
    }

    if (userData.extraLimit > 0 && userData.extraExpiresAt > 0 && now > userData.extraExpiresAt) {
      updates.extraLimit = 0;
      updates.extraExpiresAt = 0;
      userData.extraLimit = 0;
      userData.extraExpiresAt = 0;
    }

    if (userData.deviceFp !== fp) {
      updates.deviceFp = fp;
      userData.deviceFp = fp;
    }

    if (userData.role === 'free') {
      const effectiveUsed = Math.max(userData.usedToday || 0, deviceUsedToday);
      if (effectiveUsed !== userData.usedToday) {
        updates.usedToday = effectiveUsed;
        userData.usedToday = effectiveUsed;
      }
      if (effectiveUsed !== deviceUsedToday) {
        await set(devUsageRef, { used: effectiveUsed, updatedAt: now });
        deviceUsedToday = effectiveUsed;
      }
    }

    if (Object.keys(updates).length > 0) {
      await update(userRef, updates);
    }
  }

  renderDashboardMetrics();
}

function toggleLoggedInView(isLoggedIn) {
  const navLoginBtn = document.getElementById('navLoginBtn');
  const navUserMenu = document.getElementById('navUserMenu');
  const memberDashboard = document.getElementById('memberDashboard');
  const guestBanner = document.getElementById('guestBanner');

  if (isLoggedIn) {
    navLoginBtn.classList.add('hidden');
    navUserMenu.classList.remove('hidden');
    memberDashboard.classList.remove('hidden');
    guestBanner.classList.add('hidden');
  } else {
    navLoginBtn.classList.remove('hidden');
    navUserMenu.classList.add('hidden');
    memberDashboard.classList.add('hidden');
    guestBanner.classList.remove('hidden');
  }
  updateGenerateBtnUI();
}

function renderDashboardMetrics() {
  if (!userData) return;

  document.getElementById('userEmailDisplay').textContent = userData.email || '';

  const roleBadge = document.getElementById('userRoleBadge');
  const adminBtn = document.getElementById('navAdminBtn');
  const expiryText = document.getElementById('roleExpiryText');
  const quotaLeftEl = document.getElementById('quotaLeftDisplay');
  const quotaMaxEl = document.getElementById('quotaMaxDisplay');
  const extraCountEl = document.getElementById('extraQuotaCount');

  const role = userData.role || 'free';
  extraCountEl.textContent = userData.extraLimit || 0;

  if (role === 'admin') {
    roleBadge.textContent = 'ADMIN STUDIO';
    roleBadge.className = 'badge-3d bg-brand-violet text-white text-xs px-3 py-0.5 uppercase';
    adminBtn.classList.remove('hidden');
    expiryText.textContent = 'Akses penuh tanpa batas kuota';
    quotaLeftEl.textContent = '∞';
    quotaMaxEl.textContent = '∞';
  } else {
    adminBtn.classList.add('hidden');
    const maxDaily = ROLE_LIMITS[role] || 5;
    const used = role === 'free'
      ? Math.max(userData.usedToday || 0, deviceUsedToday)
      : (userData.usedToday || 0);
    const rem = Math.max(0, maxDaily - used);

    quotaLeftEl.textContent = rem;
    quotaMaxEl.textContent = maxDaily;

    if (role === 'vip') {
      roleBadge.textContent = 'VIP MEMBER';
      roleBadge.className = 'badge-3d bg-brand-amber text-black text-xs px-3 py-0.5 uppercase';
    } else if (role === 'reseller') {
      roleBadge.textContent = 'RESELLER PRO';
      roleBadge.className = 'badge-3d bg-brand-cyan text-black text-xs px-3 py-0.5 uppercase';
    } else {
      roleBadge.textContent = 'MEMBER REGULER';
      roleBadge.className = 'badge-3d bg-brand-lime text-black text-xs px-3 py-0.5 uppercase';
    }

    if ((role === 'vip' || role === 'reseller') && userData.vipExpiresAt > 0) {
      const expStr = new Date(userData.vipExpiresAt).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
      expiryText.textContent = `Masa aktif s/d ${expStr}`;
    } else {
      expiryText.textContent = 'Pembaruan kuota pukul 00:00 WIB';
    }
  }

  updateGenerateBtnUI();
}

// 5. AUTH HANDLERS
const authForm = document.getElementById('authForm');
const switchAuthModeBtn = document.getElementById('switchAuthModeBtn');

switchAuthModeBtn.addEventListener('click', () => {
  isRegisterMode = !isRegisterMode;
  document.getElementById('authModalTitle').textContent = isRegisterMode ? 'Daftar Akun Baru' : 'Masuk ke Akun';
  document.getElementById('authModalSubtitle').textContent = isRegisterMode
    ? 'Buat akun baru untuk mulai mengonversi foto referensi menjadi prompt.'
    : 'Silakan masuk menggunakan alamat email dan kata sandi Anda.';
  document.getElementById('authSubmitBtn').textContent = isRegisterMode ? 'Daftar Sekarang' : 'Masuk Sekarang';
  switchAuthModeBtn.textContent = isRegisterMode
    ? 'Sudah punya akun? Masuk di sini'
    : 'Belum punya akun? Daftar Akun Baru';
});

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  const btn = document.getElementById('authSubmitBtn');
  const origText = btn.textContent;

  btn.disabled = true;
  btn.textContent = 'Memproses...';

  try {
    if (isRegisterMode) {
      await createUserWithEmailAndPassword(auth, email, password);
      showToast('Akun berhasil dibuat! Selamat datang di KevnAI Studio.', 'success');
    } else {
      await signInWithEmailAndPassword(auth, email, password);
      showToast('Berhasil masuk ke akun Anda.', 'success');
    }
    window.closeModal('authModal');
    authForm.reset();
  } catch (err) {
    let msg = 'Terjadi kendala saat memproses akun.';
    if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
      msg = 'Email atau kata sandi yang dimasukkan belum sesuai.';
    } else if (err.code === 'auth/email-already-in-use') {
      msg = 'Email ini sudah terdaftar. Silakan masuk ke akun Anda.';
    } else if (err.code === 'auth/weak-password') {
      msg = 'Kata sandi minimal terdiri dari 6 karakter.';
    }
    showToast(msg, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = origText;
  }
});

document.getElementById('googleAuthBtn').addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, googleProvider);
    window.closeModal('authModal');
    showToast('Berhasil masuk dengan akun Google.', 'success');
  } catch (err) {
    showToast('Silakan masuk atau daftar menggunakan Email & Kata Sandi di atas.', 'info');
  }
});

document.getElementById('navLogoutBtn').addEventListener('click', async () => {
  await signOut(auth);
  showToast('Anda telah keluar dari sesi akun.', 'info');
});

// 6. VOUCHER HANDLER
document.getElementById('redeemForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser || !userData) {
    showToast('Silakan masuk ke akun terlebih dahulu.', 'error');
    return;
  }

  const input = document.getElementById('voucherInput');
  const code = input.value.trim().toUpperCase();
  if (!code) return;

  const btn = document.getElementById('redeemSubmitBtn');
  btn.disabled = true;
  btn.textContent = 'Memeriksa Voucher...';

  try {
    if (code === 'OWNER-KEVN777') {
      const userRef = ref(db, `users/${currentUser.uid}`);
      await update(userRef, {
        role: 'admin',
        dailyLimit: ROLE_LIMITS.admin
      });
      userData.role = 'admin';
      userData.dailyLimit = ROLE_LIMITS.admin;
      renderDashboardMetrics();
      window.closeModal('redeemModal');
      input.value = '';
      showToast('Akses Admin berhasil diaktifkan!', 'success');
      return;
    }

    const voucherRef = ref(db, `redeem_codes/${code}`);
    const snap = await get(voucherRef);

    if (!snap.exists()) {
      showToast('Kode voucher tidak ditemukan.', 'error');
      return;
    }

    const v = snap.val();
    const now = Date.now();

    if (v.isUsed) {
      showToast('Kode voucher ini sudah pernah digunakan.', 'error');
      return;
    }

    if (v.expiresAt && now > v.expiresAt) {
      showToast('Masa berlaku kode voucher ini telah habis.', 'error');
      return;
    }

    const userRef = ref(db, `users/${currentUser.uid}`);

    if (v.type === 'extra_quota') {
      const amount = Number(v.value) || 10;
      const days = Number(v.durationDays) || 7;
      const newExtra = (userData.extraLimit || 0) + amount;
      const newExtraExp = now + days * 24 * 60 * 60 * 1000;

      await update(userRef, {
        extraLimit: newExtra,
        extraExpiresAt: newExtraExp
      });
      userData.extraLimit = newExtra;
      userData.extraExpiresAt = newExtraExp;
      showToast(`Berhasil menambahkan +${amount} Kuota Tambahan (${days} hari).`, 'success');

    } else if (v.type === 'role_upgrade') {
      const targetRole = v.roleTarget || 'vip';
      const days = Number(v.durationDays) || 30;
      const baseTime = (userData.vipExpiresAt && userData.vipExpiresAt > now) ? userData.vipExpiresAt : now;
      const newExp = baseTime + days * 24 * 60 * 60 * 1000;
      const newLimit = ROLE_LIMITS[targetRole] || 50;

      await update(userRef, {
        role: targetRole,
        dailyLimit: newLimit,
        vipExpiresAt: newExp
      });
      userData.role = targetRole;
      userData.dailyLimit = newLimit;
      userData.vipExpiresAt = newExp;
      showToast(`Status member ditingkatkan ke ${targetRole.toUpperCase()} (${days} hari)!`, 'success');
    }

    await update(voucherRef, {
      isUsed: true,
      usedBy: currentUser.email,
      usedAt: now
    });

    renderDashboardMetrics();
    window.closeModal('redeemModal');
    input.value = '';
  } catch (err) {
    showToast('Gagal memproses voucher.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Gunakan Voucher Sekarang';
  }
});

// 7. IMAGE COMPRESSION & PREVIEW
const imageInput = document.getElementById('imageInput');
const previewWrapper = document.getElementById('previewWrapper');
const imagePreview = document.getElementById('imagePreview');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const changePhotoBtn = document.getElementById('changePhotoBtn');
const imageMetaBadge = document.getElementById('imageMetaBadge');

imageInput.addEventListener('change', (e) => {
  if (e.target.files && e.target.files[0]) {
    handleImageFile(e.target.files[0]);
  }
});

changePhotoBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  imageInput.value = '';
  currentImageBase64 = null;
  previewWrapper.classList.add('hidden');
  uploadPlaceholder.classList.remove('hidden');
  updateGenerateBtnUI();
});

function handleImageFile(file) {
  if (!file.type.startsWith('image/')) {
    showToast('Format file harus berupa foto (JPG, PNG, atau WebP).', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width;
      let h = img.height;
      const maxDim = 1024;

      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.86);
      currentImageBase64 = dataUrl.split(',')[1];

      imagePreview.src = dataUrl;
      imageMetaBadge.textContent = `${w} × ${h} px`;
      uploadPlaceholder.classList.add('hidden');
      previewWrapper.classList.remove('hidden');
      updateGenerateBtnUI();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function updateGenerateBtnUI() {
  const btn = document.getElementById('generateBtn');
  if (!currentUser) {
    btn.disabled = true;
    btn.className = 'btn-3d w-full py-4 px-5 text-sm sm:text-base bg-zinc-200 text-zinc-600 flex items-center justify-center gap-2';
    btn.innerHTML = `<span>Masuk Akun untuk Membuat Prompt</span>`;
  } else if (!currentImageBase64) {
    btn.disabled = true;
    btn.className = 'btn-3d w-full py-4 px-5 text-sm sm:text-base bg-zinc-200 text-zinc-600 flex items-center justify-center gap-2';
    btn.innerHTML = `<span>Pilih Foto Referensi Terlebih Dahulu</span>`;
  } else {
    btn.disabled = false;
    btn.className = 'btn-3d w-full py-4 px-5 text-sm sm:text-base bg-brand-lime text-black cursor-pointer flex items-center justify-center gap-2.5';
    btn.innerHTML = `
      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
      <span>Buat Prompt Sekarang</span>
    `;
  }
}

// 8. GEMINI PROMPT GENERATION
document.getElementById('generateBtn').addEventListener('click', async () => {
  if (!currentUser || !userData || !currentImageBase64) return;

  if (userData.role !== 'admin') {
    const maxDaily = ROLE_LIMITS[userData.role] || 5;
    const effectiveUsed = userData.role === 'free'
      ? Math.max(userData.usedToday || 0, deviceUsedToday)
      : (userData.usedToday || 0);
    const remDaily = maxDaily - effectiveUsed;
    const remExtra = userData.extraLimit || 0;

    if (remDaily <= 0 && remExtra <= 0) {
      showToast('Kuota harian gratis telah habis.', 'error');
      window.openModal('redeemModal');
      return;
    }
  }

  setGeneratingUI(true);

  try {
    const resultData = await requestGeminiVisionPrompt(currentImageBase64);
    await recordQuotaUsage();
    displaySingleBlockPrompt(resultData);
    showToast('Prompt berhasil dibuat dan siap disalin!', 'success');
  } catch (err) {
    showToast('Gagal menganalisis foto. Coba beberapa saat lagi.', 'error');
  } finally {
    setGeneratingUI(false);
  }
});

async function requestGeminiVisionPrompt(base64Image) {
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
  let lastError = null;

  for (const modelName of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
      const body = {
        contents: [{
          role: 'user',
          parts: [
            { text: MASTER_SYSTEM_INSTRUCTION },
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
          ]
        }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const json = await response.json();
      const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Empty response');

      const cleaned = rawText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (parsed.part1_edit && parsed.part2_desc && parsed.part3_neg) {
        return parsed;
      }
      throw new Error('Incomplete JSON keys');
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('Vision API error');
}

async function recordQuotaUsage() {
  if (userData.role === 'admin') return;

  const todayWIB = getJakartaDate();
  const fp = await getSilentDeviceFingerprint();
  const userRef = ref(db, `users/${currentUser.uid}`);
  const devUsageRef = ref(db, `device_usage/${fp}/${todayWIB}`);

  const maxDaily = ROLE_LIMITS[userData.role] || 5;
  let used = userData.role === 'free'
    ? Math.max(userData.usedToday || 0, deviceUsedToday)
    : (userData.usedToday || 0);
  let extra = userData.extraLimit || 0;

  if (used < maxDaily) {
    used += 1;
  } else if (extra > 0) {
    extra -= 1;
  }

  await update(userRef, {
    usedToday: used,
    extraLimit: extra
  });

  if (userData.role === 'free') {
    await set(devUsageRef, { used: used, updatedAt: Date.now() });
    deviceUsedToday = used;
  }

  userData.usedToday = used;
  userData.extraLimit = extra;
  renderDashboardMetrics();
}

function sanitizeParagraph(text) {
  return String(text || '')
    .replace(/^(BAGIAN\s*\d+\s*[-—:]\s*[^\n]*\n?)/i, '')
    .replace(/\r?\n|\r/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function displaySingleBlockPrompt(data) {
  let p1 = sanitizeParagraph(data.part1_edit);
  let p2 = sanitizeParagraph(data.part2_desc);
  let p3 = sanitizeParagraph(data.part3_neg);

  if (!p1.startsWith('Edit and preserve')) {
    p1 = 'Edit and preserve the original face and identity of every visible person based on the reference image provided. ' + p1;
  }
  if (!p2.startsWith('The final image')) {
    p2 = 'The final image must appear as a genuine, unedited raw candid smartphone photograph captured in the real world using an iPhone 17 Pro. ' + p2;
  }
  if (!p3.toLowerCase().startsWith('negative prompt:')) {
    p3 = 'Negative prompt: ' + p3;
  }

  const fullPromptBlock = `${p1}\n\n${p2}\n\n${p3}`;

  document.getElementById('unifiedPromptText').textContent = fullPromptBlock;
  const words = fullPromptBlock.split(/\s+/).filter(Boolean).length;
  document.getElementById('promptStatsBadge').textContent = `${words} Kata • 1 Blok Utuh`;

  document.getElementById('resultEmptyState').classList.add('hidden');
  document.getElementById('resultContent').classList.remove('hidden');
  document.getElementById('copyTopBtn').classList.remove('hidden');
}

function setGeneratingUI(isLoading) {
  const empty = document.getElementById('resultEmptyState');
  const loader = document.getElementById('resultLoadingState');
  const content = document.getElementById('resultContent');
  const btn = document.getElementById('generateBtn');

  if (isLoading) {
    empty.classList.add('hidden');
    content.classList.add('hidden');
    loader.classList.remove('hidden');
    btn.disabled = true;
    btn.innerHTML = `<span>Sedang Menganalisis Foto...</span>`;
  } else {
    loader.classList.add('hidden');
    updateGenerateBtnUI();
  }
}

// 9. WINDOW-BOUND ADMIN & UI METHODS
window.openAdminConsole = function() {
  if (!userData || userData.role !== 'admin') return;
  window.openModal('adminModal');
  window.loadAdminUsers();
  window.loadAdminVouchers();
};

window.switchAdminTab = function(tabId) {
  ['tabCreateVoucher', 'tabManageUsers', 'tabVoucherHistory'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById(tabId).classList.remove('hidden');

  const tabMap = {
    tabCreateVoucher: 'btnTabVoucher',
    tabManageUsers: 'btnTabUsers',
    tabVoucherHistory: 'btnTabHistory'
  };

  Object.entries(tabMap).forEach(([key, btnId]) => {
    const btn = document.getElementById(btnId);
    if (key === tabId) {
      btn.className = 'px-4 py-2.5 text-xs font-display font-extrabold rounded-t-xl border-t-[3px] border-x-[3px] border-brand-ink bg-brand-lime text-black whitespace-nowrap';
    } else {
      btn.className = 'px-4 py-2.5 text-xs font-display font-extrabold rounded-t-xl border-t-[3px] border-x-[3px] border-brand-ink bg-white text-zinc-700 whitespace-nowrap';
    }
  });

  if (tabId === 'tabManageUsers') window.loadAdminUsers();
  if (tabId === 'tabVoucherHistory') window.loadAdminVouchers();
};

function generateShortCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

window.createExtraQuotaVoucher = async function() {
  const amount = parseInt(document.getElementById('extraAmountInput').value, 10) || 25;
  const days = parseInt(document.getElementById('extraDurationDays').value, 10) || 7;
  const code = `KUOTA${amount}-${generateShortCode()}`;
  const now = Date.now();

  await set(ref(db, `redeem_codes/${code}`), {
    code,
    type: 'extra_quota',
    value: amount,
    durationDays: days,
    isUsed: false,
    createdAt: now,
    expiresAt: now + days * 24 * 60 * 60 * 1000
  });

  displayCreatedVoucher(code, `Kuota Tambahan +${amount} • Masa aktif ${days} hari`);
  showToast(`Voucher ${code} berhasil dibuat.`, 'success');
};

window.createRoleUpgradeVoucher = async function() {
  const roleTarget = document.getElementById('roleTargetSelect').value;
  const days = parseInt(document.getElementById('roleDurationDays').value, 10) || 30;
  const prefix = roleTarget.toUpperCase();
  const code = `${prefix}${days}H-${generateShortCode()}`;
  const now = Date.now();

  await set(ref(db, `redeem_codes/${code}`), {
    code,
    type: 'role_upgrade',
    roleTarget,
    durationDays: days,
    isUsed: false,
    createdAt: now,
    expiresAt: now + 30 * 24 * 60 * 60 * 1000
  });

  displayCreatedVoucher(code, `Paket ${prefix} • Durasi aktif ${days} hari`);
  showToast(`Voucher ${code} berhasil dibuat.`, 'success');
};

function displayCreatedVoucher(code, desc) {
  const box = document.getElementById('generatedCodeBox');
  document.getElementById('generatedCodeText').textContent = code;
  document.getElementById('generatedCodeDesc').textContent = desc;
  box.classList.remove('hidden');
}

window.copyGeneratedCode = function() {
  const code = document.getElementById('generatedCodeText').textContent;
  copyTextToClipboard(code);
  showToast(`Kode ${code} berhasil disalin.`, 'success');
};

window.loadAdminUsers = async function() {
  const tbody = document.getElementById('adminUsersTable');
  tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center">Memuat data pengguna...</td></tr>`;

  const snap = await get(ref(db, 'users'));
  if (!snap.exists()) {
    tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center">Belum ada pengguna terdaftar.</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  snap.forEach((child) => {
    const uid = child.key;
    const u = child.val();
    const role = u.role || 'free';
    const max = ROLE_LIMITS[role] || 5;
    const devFp = u.deviceFp || '';

    const tr = document.createElement('tr');
    tr.className = 'hover:bg-[#F3F1EC]';
    tr.innerHTML = `
      <td class="p-3 font-bold text-black truncate max-w-[180px]" title="${u.email}">${u.email || '-'}</td>
      <td class="p-3">
        <span class="badge-3d px-2.5 py-0.5 text-[10px] uppercase ${
          role === 'admin' ? 'bg-brand-violet text-white' :
          role === 'vip' ? 'bg-brand-amber text-black' :
          role === 'reseller' ? 'bg-brand-cyan text-black' :
          'bg-brand-lime text-black'
        }">${role}</span>
      </td>
      <td class="p-3 font-mono">${u.usedToday || 0} / ${role === 'admin' ? '∞' : max}</td>
      <td class="p-3 font-mono font-bold text-black">+${u.extraLimit || 0}</td>
      <td class="p-3 flex flex-wrap items-center gap-2">
        <select onchange="window.adminChangeUserRole('${uid}', this.value)" class="border-2 border-black rounded-lg bg-white px-2.5 py-1 text-xs font-bold">
          <option value="free" ${role === 'free' ? 'selected' : ''}>Reguler (5)</option>
          <option value="vip" ${role === 'vip' ? 'selected' : ''}>VIP (50)</option>
          <option value="reseller" ${role === 'reseller' ? 'selected' : ''}>Reseller (200)</option>
          <option value="admin" ${role === 'admin' ? 'selected' : ''}>Admin (∞)</option>
        </select>
        <button onclick="window.adminResetQuota('${uid}', '${devFp}')" class="btn-3d px-3 py-1 bg-brand-amber text-black text-[11px]">
          Reset Kuota
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
};

window.adminChangeUserRole = async function(uid, newRole) {
  const limit = ROLE_LIMITS[newRole] || 5;
  const exp = (newRole === 'vip' || newRole === 'reseller') ? Date.now() + 30 * 24 * 60 * 60 * 1000 : 0;
  await update(ref(db, `users/${uid}`), {
    role: newRole,
    dailyLimit: limit,
    vipExpiresAt: exp
  });
  if (currentUser && currentUser.uid === uid) {
    await syncUserProfileAndQuota(currentUser);
  }
  showToast(`Status pengguna diperbarui ke ${newRole.toUpperCase()}.`, 'success');
  window.loadAdminUsers();
};

window.adminResetQuota = async function(uid, devFp) {
  const todayWIB = getJakartaDate();
  await update(ref(db, `users/${uid}`), { usedToday: 0 });
  if (devFp) {
    await set(ref(db, `device_usage/${devFp}/${todayWIB}`), { used: 0, updatedAt: Date.now() });
  }
  if (currentUser && currentUser.uid === uid) {
    await syncUserProfileAndQuota(currentUser);
  }
  showToast('Pemakaian kuota harian berhasil direset ke 0.', 'success');
  window.loadAdminUsers();
};

window.loadAdminVouchers = async function() {
  const tbody = document.getElementById('adminVouchersTable');
  tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center">Memuat daftar voucher...</td></tr>`;

  const snap = await get(ref(db, 'redeem_codes'));
  if (!snap.exists()) {
    tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center">Belum ada voucher yang dibuat.</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  snap.forEach((child) => {
    const v = child.val();
    const benefit = v.type === 'extra_quota'
      ? `+${v.value} Kuota Tambahan (${v.durationDays || 7} hari)`
      : `Paket ${(v.roleTarget || 'VIP').toUpperCase()} (${v.durationDays || 30} hari)`;

    const tr = document.createElement('tr');
    tr.className = 'hover:bg-[#F3F1EC]';
    tr.innerHTML = `
      <td class="p-3 font-mono font-bold text-black select-all">${v.code}</td>
      <td class="p-3">${benefit}</td>
      <td class="p-3">
        ${v.isUsed
          ? `<span class="badge-3d px-2.5 py-0.5 bg-zinc-200 text-zinc-700 text-[10px]">Terpakai (${v.usedBy || ''})</span>`
          : `<span class="badge-3d px-2.5 py-0.5 bg-brand-lime text-black text-[10px]">Tersedia</span>`
        }
      </td>
      <td class="p-3 flex items-center gap-2">
        <button onclick="window.copyVoucherCode('${v.code}')" class="btn-3d px-3 py-1 bg-white text-black text-[11px]">Salin</button>
        <button onclick="window.removeVoucherCode('${v.code}')" class="btn-3d px-3 py-1 bg-brand-coral text-white text-[11px]">Hapus</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
};

window.copyVoucherCode = function(code) {
  copyTextToClipboard(code);
  showToast(`Kode ${code} berhasil disalin.`, 'success');
};

window.removeVoucherCode = async function(code) {
  await remove(ref(db, `redeem_codes/${code}`));
  showToast(`Voucher ${code} telah dihapus.`, 'info');
  window.loadAdminVouchers();
};

window.copyUnifiedPrompt = function(btn) {
  const text = document.getElementById('unifiedPromptText').textContent;
  if (!text) return;
  copyTextToClipboard(text);
  showToast('Prompt berhasil disalin ke clipboard!', 'success');

  if (btn) {
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<span>Berhasil Disalin! ✓</span>`;
    setTimeout(() => {
      btn.innerHTML = originalHTML;
    }, 1600);
  }
};

function copyTextToClipboard(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
  } catch (e) {}
  document.body.removeChild(ta);
}

window.openModal = function(id) {
  document.getElementById(id).classList.remove('hidden');
};

window.closeModal = function(id) {
  document.getElementById(id).classList.add('hidden');
};

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  const styleMap = {
    success: 'bg-brand-lime text-black',
    error: 'bg-brand-coral text-white',
    info: 'bg-brand-amber text-black'
  };
  toast.className = `card-3d-sm p-4 text-xs font-display font-extrabold pointer-events-auto flex items-center justify-between gap-3 transition-all duration-200 ${styleMap[type] || styleMap.info}`;
  toast.innerHTML = `
    <span class="leading-relaxed">${message}</span>
    <button onclick="this.parentElement.remove()" class="w-6 h-6 rounded-lg border-2 border-black bg-white text-black font-mono text-xs flex items-center justify-center shrink-0">✕</button>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 250);
  }, 3800);
}
