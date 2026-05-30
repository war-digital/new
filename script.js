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
const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add('visible');

        } else {

            entry.target.classList.remove('visible');

        }

    });

}, {
    threshold: 0.15,
    root: document.getElementById('invitation-content')
});

function initObservers() {
    document
        .querySelectorAll(
            '.anim-fade, .anim-scale, .anim-left, .anim-right, .anim-up, .anim-zoom, .anim-blur'
        )
        .forEach(el => observer.observe(el));

    // Observe pcard elements for photo drop-from-top animation
    const pcardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, {
        threshold: 0.2,
        root: document.getElementById('invitation-content')
    });

    document.querySelectorAll('.pcard').forEach(el => pcardObserver.observe(el));

    // Observe ev-photo elements
    const evPhotoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, {
        threshold: 0.15,
        root: document.getElementById('invitation-content')
    });
    document.querySelectorAll('.ev-photo').forEach(el => evPhotoObserver.observe(el));

    // Observe s4-card elements
    const s4Observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, {
        threshold: 0.15,
        root: document.getElementById('invitation-content')
    });
    document.querySelectorAll('.s4-card').forEach(el => s4Observer.observe(el));

    // Observe gl-item elements for gallery entrance animation
    const glObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, {
        threshold: 0.1,
        root: document.getElementById('invitation-content')
    });
    document.querySelectorAll('.gl-item').forEach(el => glObserver.observe(el));
}

setTimeout(initObservers, 500);

// Slide .active is now managed by updateActiveBg() scroll handler below

// ===== Nav Dots =====
const contentEl = document.getElementById('invitation-content');
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.nav-dot');

dots.forEach(dot => {
    dot.addEventListener('click', () => {
        const target = document.getElementById(dot.dataset.target);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
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