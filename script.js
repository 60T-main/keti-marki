const wrap = document.getElementById('wrap');
const scene = document.getElementById('scene');
const wax = document.getElementById('wax');
const hint = document.getElementById('hint');

let opened = false;

function openWrap() {
  if (opened) return;
  opened = true;

  // Start music synchronously (iOS Safari requires play() in gesture handler)
  if (window.startBgMusic) window.startBgMusic();

  // Immediately hide hint
  hint.classList.add('hidden');

  // Step 1: fade out wax seal
  wax.classList.add('fading');

  // Step 2: after seal fades, open flaps
  setTimeout(function () {
    wrap.classList.add('open');

    // Step 3: after flaps open, fade out overlay
    setTimeout(function () {
      scene.classList.add('hidden');
      document.body.classList.add('opened');
    }, 1200);
  }, 800);
}

wrap.addEventListener('click', openWrap);
wax.addEventListener('click', openWrap);

wrap.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' || e.key === ' ') openWrap();
});

/* ── Countdown ── */
(function () {
  var dateSource = document.querySelector('[data-wedding-datetime]');
  var targetIso = dateSource ? dateSource.getAttribute('data-wedding-datetime') : '';
  var target = targetIso ? new Date(targetIso) : new Date('2026-06-06T18:00:00+04:00');
  var days  = document.getElementById('cd-days');
  var hours = document.getElementById('cd-hours');
  var mins  = document.getElementById('cd-mins');
  var secs  = document.getElementById('cd-secs');

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    if (Number.isNaN(target.getTime())) {
      days.textContent = hours.textContent = mins.textContent = secs.textContent = '00';
      return;
    }
    var diff = target - Date.now();
    if (diff <= 0) {
      days.textContent = hours.textContent = mins.textContent = secs.textContent = '00';
      return;
    }
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    days.textContent  = pad(d);
    hours.textContent = pad(h);
    mins.textContent  = pad(m);
    secs.textContent  = pad(s);
  }

  tick();
  setInterval(tick, 1000);
}());

/* ── RSVP form ── */
(function () {
  var API_URL = 'https://weddsites-backend.vercel.app/api/rsvp';
  var PROJECT_ID = 'keti-mark-2026';
  var form = document.getElementById('rsvp-form');
  var thanks = document.getElementById('rsvp-thanks');
  if (!form) return;

  function parseName(fullName) {
    var normalized = (fullName || '').trim().replace(/\s+/g, ' ');
    if (!normalized) return { name: '', surname: '' };
    var parts = normalized.split(' ');
    return {
      name: parts[0] || '',
      surname: parts.slice(1).join(' ')
    };
  }

  async function submitRsvp(payload) {
    var requestBody = {
      projectId: PROJECT_ID,
      name: payload.name,
      surname: payload.surname || '',
      attendance: payload.attendance,
      guestCount:
        payload.guestCount === undefined || payload.guestCount === null || payload.guestCount === ''
          ? undefined
          : Number(payload.guestCount)
    };

    var response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    var result = await response.json().catch(function () { return {}; });
    if (!response.ok) {
      throw new Error(result.error || 'RSVP submit failed');
    }
    return result;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    var fullName = document.getElementById('rsvp-name');
    var attendanceEl = form.querySelector('input[name="attending"]:checked');
    var guestCountEl = document.getElementById('rsvp-guests');
    var submitBtn = form.querySelector('button[type="submit"]');

    var parsed = parseName(fullName ? fullName.value : '');
    var attendance = attendanceEl ? attendanceEl.value : '';
    var guestCount = guestCountEl ? guestCountEl.value : '';

    if (!parsed.name) {
      thanks.hidden = false;
      thanks.textContent = 'გთხოვთ შეიყვანოთ სახელი.';
      return;
    }

    if (attendance !== 'yes' && attendance !== 'no') {
      thanks.hidden = false;
      thanks.textContent = 'გთხოვთ აირჩიოთ დასწრება.';
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    thanks.hidden = false;
    thanks.textContent = 'იგზავნება...';

    try {
      await submitRsvp({
        name: parsed.name,
        surname: parsed.surname,
        attendance: attendance,
        guestCount: attendance === 'yes' ? guestCount : ''
      });

      form.hidden = true;
      thanks.textContent = 'გმადლობთ! თქვენი პასუხი მიღებულია.';
    } catch (err) {
      thanks.textContent = 'დაფიქსირდა შეცდომა. გთხოვთ სცადოთ თავიდან.';
      console.error(err);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}());

/* ── Background music ── */
(function () {
  var audio   = document.getElementById('bg-audio');
  var toggle  = document.getElementById('music-toggle');
  if (!audio || !toggle) return;

  var TARGET_VOL = 0.5;
  var fadeTimer  = null;

  function clearFade() {
    if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null; }
  }

  function fadeUp() {
    clearFade();
    var step = TARGET_VOL / 30;
    fadeTimer = setInterval(function () {
      if (audio.volume + step >= TARGET_VOL) {
        audio.volume = TARGET_VOL;
        clearFade();
      } else {
        audio.volume = Math.min(audio.volume + step, TARGET_VOL);
      }
    }, 50);
  }

  function fadeOut(cb) {
    clearFade();
    fadeTimer = setInterval(function () {
      var next = Math.max(audio.volume - TARGET_VOL / 30, 0.005);
      if (next <= 0.005) {
        audio.volume = 0;
        audio.pause();
        clearFade();
        if (cb) cb();
      } else {
        audio.volume = next;
      }
    }, 50);
  }

  // Auto-start on first envelope interaction
  window.startBgMusic = function () {
    if (toggle.classList.contains('playing')) return;
    audio.volume = 0;
    audio.play().catch(function () {});
    toggle.classList.add('playing');
    fadeUp();
  };

  // iOS-safe: play() called synchronously in gesture, ramp volume separately
  toggle.addEventListener('click', function () {
    if (toggle.classList.contains('playing')) {
      toggle.classList.remove('playing');
      fadeOut();
    } else {
      audio.volume = 0;
      audio.play().catch(function () {});
      toggle.classList.add('playing');
      fadeUp();
    }
  });

  // Pause when tab is hidden, resume when visible again
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (!audio.paused) {
        audio.pause();
      }
    } else {
      if (toggle.classList.contains('playing')) {
        audio.play().catch(function () {});
        audio.volume = TARGET_VOL;
      }
    }
  });
}());

/* ── Night mode ── */
(function () {
  var toggle = document.getElementById('night-toggle');
  if (!toggle) return;

  function setNight(on) {
    document.body.classList.toggle('night', on);
    localStorage.setItem('night', on ? '1' : '0');
  }

  // Restore preference on load
  if (localStorage.getItem('night') === '1') {
    document.body.classList.add('night');
  }

  toggle.addEventListener('click', function () {
    setNight(!document.body.classList.contains('night'));
  });
}());

/* ── Timeline popups ── */
(function () {
  var overlay   = document.getElementById('tl-popup-overlay');
  var closeBtn  = document.getElementById('tl-popup-close');
  var elTime    = document.getElementById('tl-popup-time');
  var elTitle   = document.getElementById('tl-popup-title');
  var elLoc     = document.getElementById('tl-popup-location');
  var elBody    = document.getElementById('tl-popup-body');

  if (!overlay) return;

  var data = {
    event1: {
      time: '12:00',
      title: 'ფოტოსესია',
      location: '',
    },
    event2: {
      time: '15:00',
      title: 'ჯვრისწერა',
      location: '',
    },
    event3: {
      time: '18:00',
      title: 'ვახშამი',
      location: '',
    },
  };

  function openPopup(key) {
    var d = data[key];
    if (!d) return;
    elTime.textContent  = d.time;
    elTitle.textContent = d.title;
    elLoc.textContent   = d.location;
    elBody.textContent  = d.body;
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closePopup() {
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.tl-card[data-popup]').forEach(function (card) {
    card.addEventListener('click', function () {
      openPopup(card.dataset.popup);
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') openPopup(card.dataset.popup);
    });
  });

  closeBtn.addEventListener('click', closePopup);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closePopup();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePopup();
  });
}());
