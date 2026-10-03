// ==========================================
// KODE CONFIG FIREBASE MU (WAJIB GANTI!)
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyD1vPEK_A6KRqRSLyxl_or6IoQ4ut79sIc",
  authDomain: "webarcadia-52d32.firebaseapp.com",
  projectId: "webarcadia-52d32",
  storageBucket: "webarcadia-52d32.firebasestorage.app",
  messagingSenderId: "71936415046",
  appId: "1:71936415046:web:435a54d05fe76c90c5c147",
  measurementId: "G-H2LCX72800"
};
// PENGAMAN (Try-Catch): Biar web gak nyangkut loading kalau config masih kosong
try {
    firebase.initializeApp(firebaseConfig);
    window.auth = firebase.auth();
    window.db = firebase.firestore();
} catch (error) {
    console.error("Firebase Error:", error);
    alert("⚠️ WARNING: Config Firebase belum diisi dengan benar! Fitur database tidak akan jalan. Buka script.js untuk mengisi config.");
}

const googleProvider = new firebase.auth.GoogleAuthProvider();

// ==========================================
// WEB AUDIO API (SOUND EFFECTS)
// ==========================================
let audioCtx;
function initAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); if (audioCtx.state === 'suspended') audioCtx.resume(); }
document.addEventListener('click', initAudio, { once: true });

function playSound(type) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator(); const gainNode = audioCtx.createGain();
    osc.connect(gainNode); gainNode.connect(audioCtx.destination);
    
    if (type === 'toast') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(800, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start(); osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'chat') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(400, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start(); osc.stop(audioCtx.currentTime + 0.15);
    }
}

// ==========================================
// UI HELPER: TOAST, MODAL, CONTEXT MENU, TEMA
// ==========================================
function showToast(message) {
    playSound('toast'); const container = document.getElementById('toast-container');
    const toast = document.createElement('div'); toast.className = 'toast'; toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
}

document.addEventListener('contextmenu', (e) => {
    e.preventDefault(); const ctxMenu = document.getElementById('custom-context-menu'); ctxMenu.style.display = 'block';
    let x = e.pageX, y = e.pageY;
    if(x + ctxMenu.offsetWidth > window.innerWidth) x -= ctxMenu.offsetWidth;
    if(y + ctxMenu.offsetHeight > window.innerHeight) y -= ctxMenu.offsetHeight;
    ctxMenu.style.left = `${x}px`; ctxMenu.style.top = `${y}px`;
});
document.addEventListener('click', (e) => { if(!e.target.classList.contains('context-item')) document.getElementById('custom-context-menu').style.display = 'none'; });
document.getElementById('ctx-refresh').addEventListener('click', () => location.reload());
document.getElementById('ctx-support').addEventListener('click', () => { document.querySelector('.nav-btn[data-target="ticket"]').click(); document.getElementById('custom-context-menu').style.display = 'none'; });
document.getElementById('ctx-theme').addEventListener('click', () => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#a855f7'];
    applyTheme(colors[Math.floor(Math.random() * colors.length)]);
    document.getElementById('custom-context-menu').style.display = 'none'; showToast("Tema Aksen diacak!");
});

function applyTheme(hexColor) {
    document.documentElement.style.setProperty('--accent', hexColor);
    document.querySelectorAll('.color-circle').forEach(c => { c.classList.remove('active'); if(c.getAttribute('data-color') === hexColor) c.classList.add('active'); });
}

// Light/Dark Mode Toggle
const themeBtn = document.getElementById('theme-toggle-btn');
let isLightMode = localStorage.getItem('arcadia_light_mode') === 'true';
if(isLightMode) { document.body.classList.add('light-mode'); themeBtn.innerText = '🌙'; }
themeBtn.addEventListener('click', () => {
    isLightMode = !isLightMode;
    if(isLightMode) { document.body.classList.add('light-mode'); themeBtn.innerText = '🌙'; }
    else { document.body.classList.remove('light-mode'); themeBtn.innerText = '☀️'; }
    localStorage.setItem('arcadia_light_mode', isLightMode);
});

// BUG FIX: Pengamanan Parse Markdown
function parseMarkdown(text) {
    if (!text) return "";
    let safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    safeText = safeText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    safeText = safeText.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    return safeText;
}

function formatDate(timestamp) {
    if(!timestamp) return "Baru saja";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// LIVE SEARCH FILTER
document.getElementById('search-plugins').addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    document.querySelectorAll('#plugins-container .plugin-card').forEach(card => { card.style.display = card.innerText.toLowerCase().includes(val) ? 'flex' : 'none'; });
});
document.getElementById('search-series').addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    document.querySelectorAll('#series-container .plugin-card').forEach(card => { card.style.display = card.innerText.toLowerCase().includes(val) ? 'flex' : 'none'; });
});

// PREVIEW DENGAN TAB BARU (Anti-Refuse)
window.openPreview = function(url) { 
    window.open(url, '_blank'); 
}

document.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const targetId = e.target.getAttribute('data-target');
        if(targetId) document.getElementById(targetId).style.display = 'none';
        else { document.getElementById('iframe-modal').style.display = 'none'; document.getElementById('preview-iframe').src = ""; }
    });
});
window.onclick = function(event) { 
    if (event.target.classList.contains('modal')) { event.target.style.display = 'none'; document.getElementById('preview-iframe').src = ""; } 
}

// ==========================================
// INISIALISASI UTAMA & ANIMASI
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => { 
        const loader = document.getElementById('loading-screen'); 
        loader.style.opacity = '0'; 
        setTimeout(() => loader.style.display = 'none', 800); 
    }, 1500);

    let isAnimActive = localStorage.getItem('arcadia_anim') !== 'false';
    const toggleAnimBtn = document.getElementById('toggle-anim'); toggleAnimBtn.checked = isAnimActive;
    toggleAnimBtn.addEventListener('change', (e) => { isAnimActive = e.target.checked; localStorage.setItem('arcadia_anim', isAnimActive); });

    const canvas = document.getElementById('blackhole'); const ctx = canvas.getContext('2d');
    let width, height, cx, cy, particles = [];
    function initCanvas() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; cx = width/2; cy = height/2; }
    window.addEventListener('resize', initCanvas); initCanvas();
    for(let i=0; i<150; i++) particles.push({ angle: Math.random()*Math.PI*2, radius: Math.random()*width, speed: Math.random()*0.005+0.001, size: Math.random()*1.5+0.5 });
    
    function animate() {
        if(isAnimActive) {
            ctx.fillStyle = isLightMode ? 'rgba(248, 250, 252, 0.3)' : 'rgba(3, 3, 5, 0.2)'; 
            ctx.fillRect(0, 0, width, height);
            particles.forEach(p => { p.angle -= p.speed; p.radius -= p.speed*30; if(p.radius < 10) { p.radius = width/1.2; p.angle = Math.random()*Math.PI*2; }
                ctx.fillStyle = isLightMode ? `rgba(15, 23, 42, ${1-(p.radius/width)})` : `rgba(255, 255, 255, ${1-(p.radius/width)})`; 
                ctx.beginPath(); ctx.arc(cx + Math.cos(p.angle)*p.radius, cy + Math.sin(p.angle)*p.radius, p.size, 0, Math.PI*2); ctx.fill(); });
        } else { ctx.fillStyle = isLightMode ? '#f8fafc' : '#030305'; ctx.fillRect(0, 0, width, height); }
        requestAnimationFrame(animate);
    } animate();

    function switchTab(targetId) {
        document.querySelectorAll('.section').forEach(sec => { sec.style.opacity = '0'; sec.style.transform = 'translateY(15px)'; setTimeout(() => sec.classList.remove('active'), 300); });
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector(`.nav-btn[data-target="${targetId}"]`); if(activeBtn) activeBtn.classList.add('active');
        setTimeout(() => { const activeSection = document.getElementById(targetId); activeSection.classList.add('active'); setTimeout(() => { activeSection.style.opacity = '1'; activeSection.style.transform = 'translateY(0)'; }, 50); }, 300);
    }
    document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', e => switchTab(e.target.getAttribute('data-target'))));
    document.getElementById('btn-goto-admin').addEventListener('click', () => switchTab('admin-panel'));

    const panelLogin = document.getElementById('auth-panel-login'); const panelRegister = document.getElementById('auth-panel-register');
    document.querySelector('.switch-to-register').addEventListener('click', () => { panelLogin.classList.remove('active'); panelLogin.classList.add('slide-left'); panelRegister.classList.add('active'); panelRegister.classList.remove('slide-left'); });
    document.querySelector('.switch-to-login').addEventListener('click', () => { panelRegister.classList.remove('active'); panelRegister.classList.add('slide-left'); panelLogin.classList.add('active'); panelLogin.classList.remove('slide-left'); });

    // PENGAMAN: Jika database gagal init, hentikan eksekusi logic Auth bawah ini
    if (!window.auth || !window.db) return;

    let currentUser = null; let isAdmin = false; let unsubscribeProfile = null; let currentUserProfileData = {};

    auth.onAuthStateChanged(async (user) => {
        currentUser = user; const navAuth = document.getElementById('nav-auth');
        if (user) {
            navAuth.innerText = "Profile"; navAuth.setAttribute('data-target', 'profile');
            document.getElementById('view-prof-email').innerText = user.email;
            
            try {
                const adminDoc = await db.collection('admins').doc(user.email).get();
                isAdmin = adminDoc.exists && adminDoc.data().role === 'admin';
                document.getElementById('profile-admin-area').style.display = isAdmin ? 'block' : 'none';
                if(isAdmin) loadAdminData(); 
            } catch(e) {}
            
            // PROFILE SYNC GOOGLE
            const userDoc = await db.collection('users').doc(user.email).get();
            if(!userDoc.exists && user.displayName) {
                await db.collection('users').doc(user.email).set({ name: user.displayName, imgUrl: user.photoURL, status: 'online' });
            }

            if(unsubscribeProfile) unsubscribeProfile();
            unsubscribeProfile = db.collection('users').doc(user.email).onSnapshot(doc => {
                const defaultImg = `https://ui-avatars.com/api/?name=${user.email.charAt(0)}&background=3b82f6&color=fff`;
                if (doc.exists) {
                    const data = doc.data(); currentUserProfileData = data;
                    document.getElementById('view-prof-name').innerText = data.name + (isAdmin ? " 🛡️" : "");
                    document.getElementById('view-prof-bio').innerText = data.bio || "Belum ada bio.";
                    document.getElementById('view-prof-img').src = data.imgUrl || defaultImg;
                    
                    if(data.bannerUrl) { document.getElementById('view-prof-banner').style.backgroundImage = `url('${data.bannerUrl}')`; }
                    else { document.getElementById('view-prof-banner').style.background = "var(--border-color)"; }

                    const statusDot = document.getElementById('view-prof-status');
                    if(data.status === 'dnd') statusDot.style.background = '#ef4444';
                    else if(data.status === 'idle') statusDot.style.background = '#f59e0b';
                    else statusDot.style.background = '#10b981';

                    document.getElementById('edit-prof-name').value = data.name || ""; document.getElementById('edit-prof-bio').value = data.bio || "";
                    document.getElementById('edit-prof-img').value = data.imgUrl || ""; document.getElementById('edit-prof-banner').value = data.bannerUrl || "";
                    document.getElementById('edit-prof-status').value = data.status || "online";
                    if(data.themeColor) applyTheme(data.themeColor);
                } else {
                    currentUserProfileData = { name: "Pengguna Arcadia", imgUrl: defaultImg };
                    document.getElementById('view-prof-name').innerText = "Pengguna Arcadia" + (isAdmin ? " 🛡️" : "");
                    document.getElementById('view-prof-img').src = defaultImg;
                }
            });
            loadUserTicket(); loadGlobalChat();
            if (document.getElementById('auth').classList.contains('active')) switchTab('profile');
        } else {
            navAuth.innerText = "Login"; navAuth.setAttribute('data-target', 'auth'); isAdmin = false;
            applyTheme('#3b82f6'); currentUserProfileData = {};
            if(unsubscribeProfile) unsubscribeProfile();
            if (document.getElementById('profile').classList.contains('active') || document.getElementById('admin-panel').classList.contains('active')) switchTab('auth');
        }
    });

    document.getElementById('login-form').addEventListener('submit', async (e) => { 
        e.preventDefault(); const btn = document.getElementById('login-submit-btn'); btn.innerText = "Wait...";
        try { await auth.signInWithEmailAndPassword(document.getElementById('login-email').value, document.getElementById('login-password').value); e.target.reset(); showToast("Berhasil Login!"); } catch (err) { showToast(err.message); } btn.innerText = "Login";
    });

    document.getElementById('register-form').addEventListener('submit', async (e) => { 
        e.preventDefault(); 
        const pw = document.getElementById('reg-password').value; const confirmPw = document.getElementById('reg-confirm-password').value;
        if (pw !== confirmPw) return showToast("Password tidak sama!");
        const btn = document.getElementById('reg-submit-btn'); btn.innerText = "Wait...";
        try { await auth.createUserWithEmailAndPassword(document.getElementById('reg-email').value, pw); e.target.reset(); showToast("Akun Berhasil Dibuat!"); } catch (err) { showToast(err.message); } btn.innerText = "Register";
    });
    
    document.getElementById('google-login-btn').addEventListener('click', () => auth.signInWithPopup(googleProvider).then(()=>showToast("Login Google Berhasil")).catch(e => showToast(e.message)));
    document.getElementById('logout-btn').addEventListener('click', () => auth.signOut().then(()=>showToast("Berhasil Logout")));

    document.getElementById('passkey-login-btn').addEventListener('click', async () => {
        if (!window.PublicKeyCredential) { return showToast("Perangkat tidak mendukung Passkey."); }
        try {
            const challenge = new Uint8Array(32); crypto.getRandomValues(challenge);
            await navigator.credentials.get({ publicKey: { challenge: challenge, rpId: window.location.hostname, userVerification: "required" } });
            showToast("Autentikasi Passkey berhasil! Namun perlu Identity Platform untuk Login penuh.");
        } catch (e) { showToast("Gagal memuat Passkey."); }
    });

    const profDisplay = document.getElementById('profile-display'); const profForm = document.getElementById('profile-edit-form');
    document.getElementById('btn-show-edit-prof').addEventListener('click', () => { profDisplay.style.display = 'none'; profForm.style.display = 'block'; });
    document.getElementById('btn-cancel-edit-prof').addEventListener('click', () => { profForm.style.display = 'none'; profDisplay.style.display = 'flex'; });

    profForm.addEventListener('submit', async (e) => {
        e.preventDefault(); if(!currentUser) return;
        const btn = profForm.querySelector('button[type="submit"]'); btn.innerText = "Menyimpan...";
        let activeColor = '#3b82f6'; const activeCircle = document.querySelector('.color-circle.active');
        if(activeCircle) activeColor = activeCircle.getAttribute('data-color');
        try {
            await db.collection('users').doc(currentUser.email).set({ 
                name: document.getElementById('edit-prof-name').value, bio: document.getElementById('edit-prof-bio').value, 
                imgUrl: document.getElementById('edit-prof-img').value, bannerUrl: document.getElementById('edit-prof-banner').value,
                status: document.getElementById('edit-prof-status').value, themeColor: activeColor 
            }, { merge: true });
            profForm.style.display = 'none'; profDisplay.style.display = 'flex'; showToast("Profil & Preferensi Tersimpan!");
        } catch (err) { showToast("Gagal update profil."); }
        btn.innerText = "Simpan";
    });

    // ==========================================
    // KONTEN DINAMIS & EDITOR ADMIN 
    // ==========================================
    db.collection('settings').doc('homepage').onSnapshot(doc => {
        if(doc.exists) {
            document.getElementById('view-dash-title').innerText = doc.data().title || "Welcome to Arcadia";
            document.getElementById('view-dash-desc').innerText = doc.data().desc || "Pusat kontrol ekosistem Arcadia.";
            document.getElementById('edit-dash-title').value = doc.data().title || ""; document.getElementById('edit-dash-desc').value = doc.data().desc || "";
            const banner = document.getElementById('global-banner');
            if(doc.data().bannerText) {
                document.getElementById('banner-text').innerText = doc.data().bannerText; document.getElementById('edit-banner-text').value = doc.data().bannerText;
                banner.style.display = 'block';
            } else { banner.style.display = 'none'; document.getElementById('edit-banner-text').value = ""; }
        }
    });

    db.collection('plugins').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        const container = document.getElementById('plugins-container'); container.innerHTML = '';
        document.getElementById('stat-plugins').innerText = snapshot.size; 
        if(snapshot.empty) return container.innerHTML = '<p>Belum ada plugin tersedia.</p>';
        snapshot.forEach(doc => {
            const data = doc.data();
            container.innerHTML += `
                <div class="plugin-card">
                    <div class="plugin-icon">${data.icon}</div>
                    <h3 style="margin-bottom: 5px;">${data.title}</h3>
                    <p style="font-size:0.9rem; margin-bottom:15px; flex-grow: 1;">${data.desc}</p>
                    ${data.url ? `<button onclick="openPreview('${data.url}')" class="btn btn-outline w-100" style="padding: 8px;">View / Download ↗</button>` : ''}
                    ${isAdmin ? `
                        <div class="admin-actions">
                            <button class="btn-edit btn-edit-plug-target" data-id="${doc.id}" data-icon="${data.icon}" data-title="${data.title}" data-desc="${data.desc}" data-url="${data.url || ''}">Edit</button>
                            <button class="btn-del-new btn-del-plug-target" data-id="${doc.id}">Hapus</button>
                        </div>
                    ` : ''}
                </div>`;
        });
        
        document.querySelectorAll('.btn-edit-plug-target').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.getElementById('edit-plug-id').value = e.target.getAttribute('data-id'); document.getElementById('edit-plug-icon').value = e.target.getAttribute('data-icon');
                document.getElementById('edit-plug-title').value = e.target.getAttribute('data-title'); document.getElementById('edit-plug-desc').value = e.target.getAttribute('data-desc');
                document.getElementById('edit-plug-url').value = e.target.getAttribute('data-url'); document.getElementById('edit-plugin-modal').style.display = 'flex';
            });
        });
        document.querySelectorAll('.btn-del-plug-target').forEach(btn => { btn.addEventListener('click', (e) => { if(confirm("Yakin Hapus Plugin?")) db.collection('plugins').doc(e.target.getAttribute('data-id')).delete(); }); });
    });

    db.collection('series').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        const container = document.getElementById('series-container'); container.innerHTML = '';
        document.getElementById('stat-series').innerText = snapshot.size; 
        if(snapshot.empty) return container.innerHTML = '<p>Belum ada series tersedia.</p>';
        snapshot.forEach(doc => {
            const data = doc.data();
            container.innerHTML += `
                <div class="plugin-card" style="border-color: var(--accent); padding: 15px;">
                    <img src="${data.imgUrl}" class="series-img" alt="Series Image" onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'">
                    <h3 style="margin-bottom: 5px;">${data.title}</h3>
                    <p style="font-size:0.9rem; margin-bottom:15px; flex-grow: 1;">${data.desc}</p>
                    ${isAdmin ? `
                        <div class="admin-actions">
                            <button class="btn-edit btn-edit-series-target" data-id="${doc.id}" data-img="${data.imgUrl}" data-title="${data.title}" data-desc="${data.desc}">Edit</button>
                            <button class="btn-del-new btn-del-series-target" data-id="${doc.id}">Hapus</button>
                        </div>
                    ` : ''}
                </div>`;
        });
        
        document.querySelectorAll('.btn-edit-series-target').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.getElementById('edit-series-id').value = e.target.getAttribute('data-id'); document.getElementById('edit-series-img').value = e.target.getAttribute('data-img');
                document.getElementById('edit-series-title').value = e.target.getAttribute('data-title'); document.getElementById('edit-series-desc').value = e.target.getAttribute('data-desc'); document.getElementById('edit-series-modal').style.display = 'flex';
            });
        });
        document.querySelectorAll('.btn-del-series-target').forEach(btn => { btn.addEventListener('click', (e) => { if(confirm("Yakin Hapus Series?")) db.collection('series').doc(e.target.getAttribute('data-id')).delete(); }); });
    });

    db.collection('team').onSnapshot(snapshot => {
        const container = document.getElementById('team-container'); container.innerHTML = '';
        if(snapshot.empty) return container.innerHTML = '<p>Belum ada data tim.</p>';
        snapshot.forEach(doc => {
            const data = doc.data();
            container.innerHTML += `
                <div class="plugin-card" style="align-items: center; text-align: center;">
                    <img src="${data.imgUrl}" class="team-avatar" onerror="this.src='https://ui-avatars.com/api/?name=Team'">
                    <h3 style="margin-bottom: 2px;">${data.name}</h3>
                    <p style="font-size:0.85rem; color: var(--accent); font-weight: 600; margin-bottom:15px;">${data.role}</p>
                    <a href="${data.ytUrl}" target="_blank" class="btn btn-outline w-100" style="padding: 8px;">▶️ YouTube</a>
                    ${isAdmin ? `<button class="btn btn-danger btn-del-team" data-id="${doc.id}" style="margin-top:10px;">Hapus</button>` : ''}
                </div>`;
        });
        document.querySelectorAll('.btn-del-team').forEach(btn => { btn.addEventListener('click', (e) => { if(confirm("Hapus Anggota?")) db.collection('team').doc(e.target.getAttribute('data-id')).delete(); }); });
    });

    document.getElementById('admin-edit-dash').addEventListener('submit', async (e) => {
        e.preventDefault(); await db.collection('settings').doc('homepage').set({ title: document.getElementById('edit-dash-title').value, desc: document.getElementById('edit-dash-desc').value, bannerText: document.getElementById('edit-banner-text').value }, {merge: true}); showToast("Dashboard diperbarui!");
    });
    document.getElementById('admin-add-plugin').addEventListener('submit', async (e) => {
        e.preventDefault(); await db.collection('plugins').add({ icon: document.getElementById('add-plug-icon').value, title: document.getElementById('add-plug-title').value, desc: document.getElementById('add-plug-desc').value, url: document.getElementById('add-plug-url').value, createdAt: firebase.firestore.FieldValue.serverTimestamp() }); e.target.reset(); showToast("Plugin ditambahkan!");
    });
    document.getElementById('admin-add-series').addEventListener('submit', async (e) => {
        e.preventDefault(); await db.collection('series').add({ imgUrl: document.getElementById('add-series-img').value, title: document.getElementById('add-series-title').value, desc: document.getElementById('add-series-desc').value, createdAt: firebase.firestore.FieldValue.serverTimestamp() }); e.target.reset(); showToast("Series ditambahkan!");
    });
    document.getElementById('admin-add-team').addEventListener('submit', async (e) => {
        e.preventDefault(); await db.collection('team').add({ name: document.getElementById('add-team-name').value, role: document.getElementById('add-team-role').value, imgUrl: document.getElementById('add-team-img').value, ytUrl: document.getElementById('add-team-yt').value }); e.target.reset(); showToast("Anggota Team ditambahkan!");
    });

    document.getElementById('form-edit-plugin').addEventListener('submit', async (e) => {
        e.preventDefault(); const id = document.getElementById('edit-plug-id').value;
        await db.collection('plugins').doc(id).update({ icon: document.getElementById('edit-plug-icon').value, title: document.getElementById('edit-plug-title').value, desc: document.getElementById('edit-plug-desc').value, url: document.getElementById('edit-plug-url').value }); document.getElementById('edit-plugin-modal').style.display = 'none'; showToast("Plugin berhasil diedit!");
    });
    document.getElementById('form-edit-series').addEventListener('submit', async (e) => {
        e.preventDefault(); const id = document.getElementById('edit-series-id').value;
        await db.collection('series').doc(id).update({ imgUrl: document.getElementById('edit-series-img').value, title: document.getElementById('edit-series-title').value, desc: document.getElementById('edit-series-desc').value }); document.getElementById('edit-series-modal').style.display = 'none'; showToast("Series berhasil diedit!");
    });

    // ==========================================
    // DISCORD STYLE TICKET SYSTEM 
    // ==========================================
    function renderDiscordMessage(msg, containerId) {
        const box = document.getElementById(containerId); const div = document.createElement('div'); div.className = `discord-msg`;
        const badge = msg.isAdmin ? " 🛡️" : ""; const nameClass = msg.isAdmin ? "discord-name admin-name" : "discord-name";
        const parsedText = parseMarkdown(msg.text); const timeStr = formatDate(msg.timestamp);
        div.innerHTML = `
            <img src="${msg.avatarUrl || 'https://ui-avatars.com/api/?name=U&background=3b82f6&color=fff'}" class="discord-avatar">
            <div class="discord-content">
                <div class="discord-meta"><span class="${nameClass}">${msg.senderName || msg.sender}${badge}</span><span class="discord-time">${timeStr}</span></div>
                <div class="discord-text">${parsedText}</div>
            </div>`;
        box.appendChild(div); box.scrollTop = box.scrollHeight;
    }

    let userActiveTicketId = null; let unsubscribeUserChat = null;
    async function loadUserTicket() {
        if(!currentUser) return;
        db.collection("tickets").where("email", "==", currentUser.email).where("status", "==", "open").onSnapshot(snapshot => {
            if (!snapshot.empty) {
                const ticket = snapshot.docs[0]; userActiveTicketId = ticket.id;
                document.getElementById('ticket-create-view').style.display = 'none'; document.getElementById('ticket-chat-view').style.display = 'block'; document.getElementById('user-chat-subject').innerText = ticket.data().subject;
                if(unsubscribeUserChat) unsubscribeUserChat();
                let isInitialLoad = true;
                unsubscribeUserChat = db.collection("tickets").doc(userActiveTicketId).collection("messages").orderBy("timestamp", "asc").onSnapshot(msgSnap => {
                        document.getElementById('user-chat-box').innerHTML = ''; let lastSender = null;
                        msgSnap.forEach(doc => { const data = doc.data(); lastSender = data.sender; renderDiscordMessage(data, 'user-chat-box'); });
                        const supportBtn = document.getElementById('nav-support-btn');
                        if(lastSender && lastSender !== currentUser.email) {
                            if(!supportBtn.classList.contains('active')) document.getElementById('support-unread').style.display = 'inline-block';
                            if(!isInitialLoad) playSound('chat'); 
                        } else { document.getElementById('support-unread').style.display = 'none'; }
                        isInitialLoad = false;
                    });
            } else { userActiveTicketId = null; document.getElementById('ticket-create-view').style.display = 'block'; document.getElementById('ticket-chat-view').style.display = 'none'; document.getElementById('support-unread').style.display = 'none'; }
        });
        document.getElementById('nav-support-btn').addEventListener('click', () => { document.getElementById('support-unread').style.display = 'none'; });
    }

    document.getElementById('ticket-form').addEventListener('submit', async (e) => {
        e.preventDefault(); if (!currentUser) return showToast("Harap login!");
        const btn = e.target.querySelector('button'); btn.disabled = true; btn.innerText = "Memproses...";
        try {
            const newTicket = await db.collection("tickets").add({ email: currentUser.email, subject: document.getElementById('ticket-subject').value, status: "open", timestamp: firebase.firestore.FieldValue.serverTimestamp() });
            await newTicket.collection("messages").add({ text: "Halo! Silakan jelaskan masalahmu. Tim kami akan merespon secepatnya.", sender: "SYSTEM", senderName: "Arcadia System", isAdmin: true, avatarUrl: "https://ui-avatars.com/api/?name=SYS&background=ef4444&color=fff", timestamp: firebase.firestore.FieldValue.serverTimestamp() });
            e.target.reset(); showToast("Tiket Dibuka");
        } catch (err) { showToast("Gagal: " + err.message); } finally { btn.disabled = false; btn.innerText = "Buka Tiket Baru"; }
    });

    document.getElementById('user-chat-form').addEventListener('submit', async (e) => {
        e.preventDefault(); const input = document.getElementById('user-chat-input'); const text = input.value.trim();
        if(!text || !userActiveTicketId) return; input.value = '';
        let senderName = currentUserProfileData.name || "Kamu"; let avatarUrl = currentUserProfileData.imgUrl || `https://ui-avatars.com/api/?name=${currentUser.email.charAt(0)}&background=3b82f6&color=fff`;
        await db.collection("tickets").doc(userActiveTicketId).collection("messages").add({ text: text, sender: currentUser.email, senderName: senderName, avatarUrl: avatarUrl, isAdmin: isAdmin, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
    });

    // BUG FIX ADMIN REPLY
    let adminActiveTicketId = null; let unsubscribeAdminChat = null; let unsubscribeAdminTickets = null;
    function loadAdminData() {
        if(unsubscribeAdminTickets) unsubscribeAdminTickets();
        unsubscribeAdminTickets = db.collection("tickets").where("status", "==", "open").onSnapshot(snapshot => {
            document.getElementById('stat-tickets').innerText = snapshot.size;
            const list = document.getElementById('admin-ticket-list'); list.innerHTML = '';
            if (snapshot.empty) return list.innerHTML = '<p style="color:var(--text-muted);">Tidak ada tiket aktif.</p>';
            snapshot.forEach(doc => {
                const data = doc.data(); const div = document.createElement('div'); div.className = 'ticket-item';
                div.innerHTML = `<span><b>${data.subject}</b><br><small style="color:var(--text-muted)">${data.email}</small></span> <span style="color:var(--accent)">Balas 💬</span>`;
                div.onclick = () => {
                    adminActiveTicketId = doc.id; document.getElementById('admin-chat-view').style.display = 'block'; document.getElementById('admin-chat-target').innerText = data.email;
                    if(unsubscribeAdminChat) unsubscribeAdminChat();
                    let isInitialLoadAdmin = true;
                    unsubscribeAdminChat = db.collection("tickets").doc(adminActiveTicketId).collection("messages").orderBy("timestamp", "asc").onSnapshot(msgSnap => {
                            document.getElementById('admin-chat-box').innerHTML = ''; let lastSender = null;
                            msgSnap.forEach(mDoc => { const mData = mDoc.data(); lastSender = mData.sender; renderDiscordMessage(mData, 'admin-chat-box'); });
                            if(!isInitialLoadAdmin && lastSender && lastSender !== currentUser.email) playSound('chat');
                            isInitialLoadAdmin = false;
                        });
                }; list.appendChild(div);
            });
        });
    }

    document.getElementById('admin-chat-form').addEventListener('submit', async (e) => {
        e.preventDefault(); 
        try {
            const input = document.getElementById('admin-chat-input'); const text = input.value.trim();
            if(!text || !adminActiveTicketId) return; input.value = '';
            let avatarUrl = currentUserProfileData.imgUrl || `https://ui-avatars.com/api/?name=Admin&background=ef4444&color=fff`;
            await db.collection("tickets").doc(adminActiveTicketId).collection("messages").add({ text: text, sender: currentUser.email, senderName: "Arcadia Admin", avatarUrl: avatarUrl, isAdmin: true, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        } catch(err) { showToast("Gagal Membalas Tiket: " + err.message); }
    });

    document.getElementById('admin-close-ticket').addEventListener('click', async () => {
        if(!adminActiveTicketId) return;
        if(confirm("Yakin ingin menutup tiket ini?")) { await db.collection("tickets").doc(adminActiveTicketId).update({ status: "closed" }); document.getElementById('admin-chat-view').style.display = 'none'; adminActiveTicketId = null; if(unsubscribeAdminChat) unsubscribeAdminChat(); showToast("Tiket Ditutup."); }
    });

    // ==========================================
    // ARCADIACORD (JITSI + GLOBAL CHAT)
    // ==========================================
    let jitsiApi = null;
    document.getElementById('btn-join-voice').addEventListener('click', () => {
        if(!currentUser) return showToast("Harap Login untuk Join Voice Call!");
        document.getElementById('jitsi-join-prompt').style.display = 'none';
        document.getElementById('jitsi-meet-container').style.display = 'block';

        const domain = 'meet.jit.si';
        const options = {
            roomName: 'ArcadiaStudioGlobalRoom_Secret123',
            width: '100%', height: '100%',
            parentNode: document.querySelector('#jitsi-meet-container'),
            userInfo: { displayName: currentUserProfileData.name || "Arcadian" },
            configOverwrite: { startWithAudioMuted: true, startWithVideoMuted: true }
        };
        jitsiApi = new JitsiMeetExternalAPI(domain, options);
    });

    function loadGlobalChat() {
        let isInitGlobal = true;
        db.collection("global_chat").orderBy("timestamp", "asc").limitToLast(50).onSnapshot(snapshot => {
            document.getElementById('global-chat-box').innerHTML = '';
            snapshot.forEach(doc => { renderDiscordMessage(doc.data(), 'global-chat-box'); });
            if(!isInitGlobal) playSound('chat');
            isInitGlobal = false;
        });
    }

    document.getElementById('global-chat-form').addEventListener('submit', async (e) => {
        e.preventDefault(); if(!currentUser) return showToast("Login dulu buat ngetik!");
        const input = document.getElementById('global-chat-input'); const text = input.value.trim();
        if(!text) return; input.value = '';
        let senderName = currentUserProfileData.name || "Kamu";
        let avatarUrl = currentUserProfileData.imgUrl || `https://ui-avatars.com/api/?name=${currentUser.email.charAt(0)}&background=3b82f6&color=fff`;
        await db.collection("global_chat").add({ text: text, sender: currentUser.email, senderName: senderName, avatarUrl: avatarUrl, isAdmin: isAdmin, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
    });
});