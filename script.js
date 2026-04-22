const wrap = document.getElementById('wrap');
const scene = document.getElementById('scene');
const wax = document.getElementById('wax');
const hint = document.getElementById('hint');

let opened = false;

function openWrap() {
  if (opened) return;
  opened = true;

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
