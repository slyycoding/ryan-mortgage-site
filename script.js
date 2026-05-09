/* ============================================================
   Ryan Chidgey — script.js
   Mortgage Consultant · Yellow Brick Road
   ============================================================ */

/* ─── Sticky header ──────────────────────────────────── */
const header = document.getElementById('siteHeader');
if (header) {
  const tick = () => header.classList.toggle('scrolled', window.scrollY > 16);
  window.addEventListener('scroll', tick, { passive: true });
  tick();
}

/* ─── Mobile menu ────────────────────────────────────── */
const toggle    = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');

if (toggle && mobileNav) {
  toggle.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  document.addEventListener('click', e => {
    if (
      mobileNav.classList.contains('open') &&
      !mobileNav.contains(e.target) &&
      !toggle.contains(e.target)
    ) closeMenu();
  });

  function closeMenu() {
    mobileNav.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
}

/* ─── Scroll reveal ──────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -28px 0px' });
  revealEls.forEach(el => io.observe(el));
}

/* ─── Active nav link on scroll ──────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');
if (sections.length && navLinks.length) {
  const map = {};
  navLinks.forEach(l => { map[l.getAttribute('href').slice(1)] = l; });

  const sio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        if (map[e.target.id]) map[e.target.id].classList.add('active');
      }
    });
  }, { rootMargin: '-36% 0px -58% 0px' });

  sections.forEach(s => sio.observe(s));
}

/* ─── Smooth scroll with header offset ───────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const offset = (header?.offsetHeight ?? 72) + 12;
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - offset,
      behavior: 'smooth'
    });
  });
});

/* ─── Repayment Calculator ───────────────────────────── */
const calcEl = {
  propertyValue: document.getElementById('propertyValue'),
  loanAmount:    document.getElementById('loanAmount'),
  loanTerm:      document.getElementById('loanTerm'),
  interestRate:  document.getElementById('interestRate'),
};
const displayEl = {
  propertyValue: document.getElementById('propertyValueDisplay'),
  loanAmount:    document.getElementById('loanAmountDisplay'),
  loanTerm:      document.getElementById('loanTermDisplay'),
  interestRate:  document.getElementById('interestRateDisplay'),
};

function fmt(key, val) {
  if (key === 'loanTerm')     return val + ' Year' + (val == 1 ? '' : 's');
  if (key === 'interestRate') return parseFloat(val).toFixed(2) + '%';
  return '$' + Number(val).toLocaleString('en-AU');
}

function updateTrack(input) {
  const min = parseFloat(input.min);
  const max = parseFloat(input.max);
  const pct = ((parseFloat(input.value) - min) / (max - min)) * 100;
  input.style.background =
    `linear-gradient(to right, var(--yellow) ${pct}%, var(--surface-high) ${pct}%)`;
}

function calcRepayment() {
  const loan     = parseFloat(calcEl.loanAmount?.value    ?? 400000);
  const termYrs  = parseInt(calcEl.loanTerm?.value         ?? 30);
  const rate     = parseFloat(calcEl.interestRate?.value   ?? 5.93);
  const propVal  = parseFloat(calcEl.propertyValue?.value  ?? 600000);
  const type     = document.querySelector('input[name="repaymentType"]:checked')?.value ?? 'pi';

  const monthlyRate = rate / 100 / 12;
  const n = termYrs * 12;
  let monthly;

  if (type === 'io') {
    monthly = loan * monthlyRate;
  } else {
    if (monthlyRate === 0) {
      monthly = loan / n;
    } else {
      monthly = loan * (monthlyRate * Math.pow(1 + monthlyRate, n))
                     / (Math.pow(1 + monthlyRate, n) - 1);
    }
  }

  const monthlyEl  = document.getElementById('calcMonthly');
  const depositEl  = document.getElementById('calcDeposit');
  const loanDispEl = document.getElementById('calcLoanDisplay');

  if (monthlyEl)  monthlyEl.textContent  = '$' + Math.round(monthly).toLocaleString('en-AU');
  if (depositEl)  depositEl.textContent  = '$' + Math.max(0, propVal - loan).toLocaleString('en-AU');
  if (loanDispEl) loanDispEl.textContent = '$' + loan.toLocaleString('en-AU');
}

Object.entries(calcEl).forEach(([key, input]) => {
  if (!input || !displayEl[key]) return;
  const sync = () => {
    displayEl[key].textContent = fmt(key, input.value);
    updateTrack(input);
    calcRepayment();
  };
  input.addEventListener('input', sync);
  sync(); // initialise
});

document.querySelectorAll('input[name="repaymentType"]').forEach(r => {
  r.addEventListener('change', calcRepayment);
});

/* ─── Dependants conditional field ───────────────────── */
const depYes        = document.getElementById('depYes');
const depNo         = document.getElementById('depNo');
const depCountField = document.getElementById('depCountField');

if (depYes && depNo && depCountField) {
  const syncDep = () => {
    depCountField.style.display = depYes.checked ? '' : 'none';
    if (!depYes.checked) {
      const depCount = document.getElementById('depCount');
      if (depCount) depCount.value = '';
    }
  };
  depYes.addEventListener('change', syncDep);
  depNo.addEventListener('change', syncDep);
}

/* ─── Application form ───────────────────────────────── */
const appForm   = document.getElementById('clientInfoForm');
const appStatus = document.getElementById('formStatus');

if (appForm && appStatus) {
  appForm.addEventListener('submit', async e => {
    e.preventDefault();

    // Basic required field check
    const required = appForm.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      if (!field.value.trim()) {
        field.style.borderBottomColor = '#f87171';
        valid = false;
        field.addEventListener('input', () => {
          field.style.borderBottomColor = '';
        }, { once: true });
      }
    });
    if (!valid) {
      appStatus.style.color = '#f87171';
      appStatus.textContent = '✗ Please fill in all required fields.';
      return;
    }

    const btn  = appForm.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Submitting…';
    appStatus.textContent = '';

    try {
      // Replace the action URL below with your Formspree / backend endpoint
      const res = await fetch(appForm.action || '#', {
        method:  'POST',
        body:    new FormData(appForm),
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) throw new Error();

      appForm.reset();
      if (depCountField) depCountField.style.display = 'none';
      appStatus.style.color   = '#86efac';
      appStatus.textContent   = '✓ Application received — Ryan will be in touch shortly.';
    } catch {
      appStatus.style.color   = '#f87171';
      appStatus.textContent   = '✗ Something went wrong. Please email ryan.chidgey@ybr.com.au directly.';
    } finally {
      btn.disabled    = false;
      btn.textContent = orig;
    }
  });
}

/* ─── File drop label updates ────────────────────────── */
document.querySelectorAll('.file-drop input[type="file"]').forEach(input => {
  input.addEventListener('change', () => {
    const label = input.closest('.file-drop')?.querySelector('.file-drop-label');
    if (!label) return;
    const count = input.files.length;
    label.textContent = count
      ? count === 1
        ? input.files[0].name
        : `${count} files selected`
      : 'Click or drag to upload';
  });
});
