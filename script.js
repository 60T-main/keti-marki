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
  var target = new Date('2026-09-14T18:00:00');
  var days  = document.getElementById('cd-days');
  var hours = document.getElementById('cd-hours');
  var mins  = document.getElementById('cd-mins');
  var secs  = document.getElementById('cd-secs');

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
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
  var form   = document.getElementById('rsvp-form');
  var thanks = document.getElementById('rsvp-thanks');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    form.hidden = true;
    thanks.hidden = false;
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
      time: '16:00',
      title: 'განრიგი',
      location: 'ლოკაცია',
      body: 'დამატებითი ინფორმაცია ამ ღონისძიების შესახებ.'
    },
    event2: {
      time: '18:00',
      title: 'განრიგი',
      location: 'ლოკაცია',
      body: 'დამატებითი ინფორმაცია ამ ღონისძიების შესახებ.'
    },
    event3: {
      time: '20:00',
      title: 'განრიგი',
      location: 'ლოკაცია',
      body: 'დამატებითი ინფორმაცია ამ ღონისძიების შესახებ.'
    },
    event4: {
      time: '00:00',
      title: 'განრიგი',
      location: 'ლოკაცია',
      body: 'დამატებითი ინფორმაცია ამ ღონისძიების შესახებ.'
    }
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
