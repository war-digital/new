// ===== Guest Name from URL =====
const urlParams = new URLSearchParams(window.location.search);
const guestName = urlParams.get('to') || 'Tamu Undangan';
document.getElementById('guestName').textContent = guestName;

// ===== Open Invitation =====
function openInvitation() {
    const cover = document.getElementById('cover');
    const content = document.getElementById('invitation-content');
    cover.classList.add('opened');
    content.classList.remove('hidden-content');
    content.classList.add('show-content');
    setTimeout(() => { cover.style.display = 'none'; }, 900);

    // Inisialisasi observer SETELAH konten tampil & layout selesai dihitung
    // Delay 600ms cukup untuk browser selesai render sebelum observer dipasang
    setTimeout(initObservers, 600);
}

// ===== Countdown Timer =====
const weddingDate = new Date('2026-08-15T08:00:00+08:00').getTime();
function updateCountdown() {
    const now = new Date().getTime();
    const diff = weddingDate - now;
    if (diff <= 0) {
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        return;
    }
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    document.getElementById('days').textContent = String(d).padStart(2, '0');
    document.getElementById('hours').textContent = String(h).padStart(2, '0');
    document.getElementById('minutes').textContent = String(m).padStart(2, '0');
    document.getElementById('seconds').textContent = String(s).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ===== Scroll Animations =====
// initObservers dipanggil dari openInvitation() — SETELAH undangan dibuka,
// bukan saat halaman load. Ini mencegah semua elemen langsung "visible"
// sebelum user scroll ke slide masing-masing.

function initObservers() {
    const root = document.getElementById('invitation-content');

    // Opsi observer standar — hanya trigger saat elemen benar-benar masuk layar
    // rootMargin negatif: elemen harus masuk 10% dari atas/bawah viewport dulu
    const obsOpts = {
        threshold: 0.12,
        root,
        rootMargin: '-5% 0px -5% 0px'
    };

    // Observer umum untuk semua kelas animasi
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, obsOpts);

    document.querySelectorAll(
        '.anim-fade, .anim-scale, .anim-left, .anim-right, .anim-up, .anim-zoom, .anim-blur, ' +
        '.pcard, .ev-photo, .s4-card, .gl-item'
    ).forEach(el => observer.observe(el));

    // ===== Slide 1 — elemen pertama langsung visible saat undangan dibuka =====
    // (sudah di viewport, tidak perlu scroll)
    document.querySelectorAll('#slide1 .anim-fade, #slide1 .anim-scale, #slide1 .anim-left, #slide1 .anim-right, #slide1 .anim-up, #slide1 .anim-zoom, #slide1 .anim-blur').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), 300 + i * 120);
    });

    // ===== Slide 2 — Cinematic sequential reveal =====
    let s2Played = false;
    const s2TriggerObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !s2Played) {
                s2Played = true;
                const header = document.querySelector('#slide2 .s2-header');
                const groom = document.querySelector('.s2-profile--groom');
                const divider = document.querySelector('.s2-divider-wrap');
                const bride = document.querySelector('.s2-profile--bride');

                if (header) header.classList.add('visible');
                setTimeout(() => {
                    if (groom) groom.classList.add('visible');
                    setTimeout(() => {
                        if (divider) divider.classList.add('visible');
                        setTimeout(() => {
                            if (bride) bride.classList.add('visible');
                        }, 700);
                    }, 1800);
                }, 400);

                s2TriggerObs.disconnect();
            }
        });
    }, { threshold: 0.05, root, rootMargin: '-5% 0px -5% 0px' });

    const slide2El = document.getElementById('slide2');
    if (slide2El) s2TriggerObs.observe(slide2El);
}

// Dipanggil dari openInvitation() di bawah — bukan setTimeout langsung

// Slide .active is now managed by updateActiveBg() scroll handler below

// ===== Nav Dots =====
const contentEl = document.getElementById('invitation-content');
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.nav-dot');

// ===== Smooth scroll ke slide via container (bukan window) =====
function smoothScrollTo(targetEl, duration) {
    const container = document.getElementById('invitation-content');
    const start = container.scrollTop;
    const end = targetEl.offsetTop;
    const change = end - start;
    const startTime = performance.now();

    function ease(t) {
        // ease in-out cubic — terasa natural, tidak tiba-tiba
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        container.scrollTop = start + change * ease(progress);
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

dots.forEach(dot => {
    dot.addEventListener('click', () => {
        const target = document.getElementById(dot.dataset.target);
        if (target) smoothScrollTo(target, 900);
    });
});

// nav dot active state synced in updateActiveSlide()

// ===== Gallery Lightbox =====
function openLightbox(el) {
    const img = el.querySelector('img');
    document.getElementById('lightbox-img').src = img.src;
    document.getElementById('lightbox').classList.add('active');
}
function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

// ===== Copy Text =====
function copyText(text) {
    navigator.clipboard.writeText(text).then(() => showToast('Berhasil disalin!')).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy');
        document.body.removeChild(ta); showToast('Berhasil disalin!');
    });
}
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
}

// ===== Messages (LocalStorage) =====
function loadMessages() {
    const msgs = JSON.parse(localStorage.getItem('weddingMessages') || '[]');
    const list = document.getElementById('messagesList');
    list.innerHTML = msgs.map(m => `
        <div class="msg-item">
            <span class="msg-item-name">${m.name}</span>
            <span class="msg-item-attend">${m.attend}</span>
            <p class="msg-item-text">${m.text}</p>
            <p class="msg-item-time">${m.time}</p>
        </div>
    `).join('');
}

function submitMessage(e) {
    e.preventDefault();
    const name = document.getElementById('msgName').value.trim();
    const attend = document.getElementById('msgAttend').value;
    const text = document.getElementById('msgText').value.trim();
    if (!name || !text) return;
    const msgs = JSON.parse(localStorage.getItem('weddingMessages') || '[]');
    const now = new Date();
    msgs.unshift({
        name, attend, text,
        time: now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    });
    localStorage.setItem('weddingMessages', JSON.stringify(msgs));
    document.getElementById('messageForm').reset();
    loadMessages();
    showToast('Ucapan terkirim! 💕');
}

loadMessages();

// ===== Active Slide Tracker (Ken Burns + nav dots + pcard anim) =====
const container = document.getElementById('invitation-content');
const allSlides = document.querySelectorAll('.slide');

function updateActiveSlide() {
    const containerRect = container.getBoundingClientRect();
    const containerH = container.clientHeight;
    let current = 0;

    allSlides.forEach((slide, i) => {
        const rect = slide.getBoundingClientRect();
        if (rect.top <= containerRect.top + containerH * 0.5) current = i;
    });

    allSlides.forEach((slide, i) => {
        slide.classList.toggle('active', i === current);
    });

    // sync nav dots
    document.querySelectorAll('.nav-dot').forEach((d, i) =>
        d.classList.toggle('active', i === current));
}

container.addEventListener('scroll', updateActiveSlide, { passive: true });
setTimeout(updateActiveSlide, 100);

// ===== Credits scroll animation =====
const creditsTrack = document.getElementById('creditsTrack');
let creditsStarted = false;

function startCredits() {
    if (!creditsTrack) return;
    // Reset animation
    creditsTrack.classList.remove('rolling');
    creditsTrack.style.animation = 'none';
    creditsTrack.offsetHeight; // force reflow
    creditsTrack.style.animation = '';
    creditsTrack.classList.add('rolling');
    creditsStarted = true;
}

function checkCreditsSlide() {
    const slide8 = document.getElementById('slide8');
    if (!slide8) return;
    const rect = slide8.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const isVisible = rect.top < containerRect.bottom - 50 && rect.bottom > containerRect.top + 50;
    if (isVisible && !creditsStarted) {
        startCredits();
    }
    if (!isVisible) {
        creditsStarted = false;
    }
}

container.addEventListener('scroll', checkCreditsSlide, { passive: true });

// ===== Cover Photo Slideshow =====
function initCoverSlideshow() {
    const slides = document.querySelectorAll('.cover-photo-slide');
    if (slides.length === 0) return;
    let currentIndex = 0;

    setInterval(() => {
        slides[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % slides.length;
        slides[currentIndex].classList.add('active');
    }, 4000);
}
initCoverSlideshow();
// ===== Parallax dihapus — diganti fixed crossfade background =====
// Background berganti halus via CSS transition opacity di .slide-bg
// ketika class .active berpindah antar slide (dihandle updateActiveSlide)
// ===== Background Music =====
const bgMusic = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');
const musicIcon = document.getElementById('musicIcon');
let musicPlaying = false;

function setMusicState(playing) {
    musicPlaying = playing;
    if (playing) {
        musicIcon.className = 'fas fa-pause';
        musicBtn.classList.add('playing');
    } else {
        musicIcon.className = 'fas fa-music';
        musicBtn.classList.remove('playing');
    }
}

function toggleMusic() {
    if (!bgMusic) return;
    if (musicPlaying) {
        bgMusic.pause();
        setMusicState(false);
    } else {
        bgMusic.play().then(() => setMusicState(true)).catch(() => setMusicState(false));
    }
}

// Mulai musik saat tombol "Buka Undangan" diklik (di dalam user gesture)
// Override openInvitation agar musik ikut distart
const _origOpenInvMusic = window.openInvitation;
window.openInvitation = function () {
    _origOpenInvMusic && _origOpenInvMusic();

    // Coba putar langsung di dalam gesture (paling bisa di iOS/Android)
    if (bgMusic) {
        bgMusic.volume = 0;
        bgMusic.play().then(() => {
            setMusicState(true);
            // Fade in volume pelan-pelan agar tidak mengejutkan
            let vol = 0;
            const fadeIn = setInterval(() => {
                vol = Math.min(vol + 0.05, 0.75);
                bgMusic.volume = vol;
                if (vol >= 0.75) clearInterval(fadeIn);
            }, 120);
        }).catch(() => {
            // Kalau masih diblokir, tampilkan tombol musik agar user bisa klik manual
            setMusicState(false);
        });
    }
};