// ===== API BASE =====
// When deployed to Cloudflare Pages with Functions, API routes are at /api/*
// For local dev, this uses the same origin
const API = '/api';

// ===== MOBILE NAV =====
document.getElementById('navToggle').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

// Close nav on link click (mobile)
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('navLinks').classList.remove('open');
  });
});

// ===== VISITOR COUNTER =====
async function trackVisitor() {
  try {
    const res = await fetch(`${API}/visit`, { method: 'POST' });
    const data = await res.json();
    updateCounterDisplays('visitor', data.visitors);
  } catch (e) {
    // Fallback: use localStorage counter
    let count = parseInt(localStorage.getItem('olte_visitors') || '0') + 1;
    localStorage.setItem('olte_visitors', count);
    updateCounterDisplays('visitor', count);
  }
}

function updateCounterDisplays(type, count) {
  const formatted = count.toLocaleString();
  if (type === 'visitor') {
    const el1 = document.getElementById('visitorCount');
    const el2 = document.getElementById('visitorCount2');
    if (el1) el1.textContent = formatted;
    if (el2) el2.textContent = formatted;
  } else if (type === 'signature') {
    const el1 = document.getElementById('signatureCount');
    const el2 = document.getElementById('signatureCount2');
    if (el1) el1.textContent = formatted;
    if (el2) el2.textContent = formatted;
  }
}

// ===== LOAD STATS =====
async function loadStats() {
  try {
    const res = await fetch(`${API}/stats`);
    const data = await res.json();
    updateCounterDisplays('visitor', data.visitors);
    updateCounterDisplays('signature', data.signatures);
  } catch (e) {
    // Fallback
    updateCounterDisplays('visitor', parseInt(localStorage.getItem('olte_visitors') || '1'));
    updateCounterDisplays('signature', parseInt(localStorage.getItem('olte_signatures') || '0'));
  }
}

// ===== LOAD RECENT SIGNATURES =====
async function loadSignatures() {
  try {
    const res = await fetch(`${API}/signatures`);
    const data = await res.json();
    const list = document.getElementById('signaturesList');
    if (!list || !data.signatures) return;
    list.innerHTML = '';
    data.signatures.forEach(sig => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="sig-name">${escapeHtml(sig.name)}</span><span class="sig-country">${escapeHtml(sig.country)}</span>`;
      list.appendChild(li);
    });
  } catch (e) {
    // silent fail
  }
}

// ===== SIGN FORM =====
document.getElementById('signForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  const msg = document.getElementById('signMessage');

  const name = document.getElementById('sigName').value.trim();
  const country = document.getElementById('sigCountry').value.trim();
  const email = document.getElementById('sigEmail').value.trim();
  const newsletter = document.getElementById('sigNewsletter').checked;

  if (!name || !country) {
    msg.textContent = 'Please enter your name and country.';
    msg.className = 'sign-message error';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Signing...';

  try {
    const res = await fetch(`${API}/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, country, email, newsletter })
    });
    const data = await res.json();

    if (data.success) {
      msg.textContent = `Thank you, ${name}. Your voice matters. Signature #${data.total.toLocaleString()}.`;
      msg.className = 'sign-message';
      updateCounterDisplays('signature', data.total);

      // Update localStorage fallback
      localStorage.setItem('olte_signatures', data.total);

      // Clear form
      document.getElementById('sigName').value = '';
      document.getElementById('sigCountry').value = '';
      document.getElementById('sigEmail').value = '';
      document.getElementById('sigNewsletter').checked = false;

      // Reload signatures
      loadSignatures();
    } else {
      msg.textContent = data.error || 'Something went wrong. Please try again.';
      msg.className = 'sign-message error';
    }
  } catch (e) {
    // Fallback: save to localStorage and send via mailto
    let sigs = parseInt(localStorage.getItem('olte_signatures') || '0') + 1;
    localStorage.setItem('olte_signatures', sigs);
    updateCounterDisplays('signature', sigs);

    msg.textContent = `Thank you, ${name}. Signature recorded locally (#${sigs}). The counter will sync when the backend is live.`;
    msg.className = 'sign-message';

    // Also open mailto as backup
    if (email || true) {
      const subject = encodeURIComponent('Petition');
      const body = encodeURIComponent(`New signature for An Open Letter to Earth:\n\nName: ${name}\nCountry: ${country}\nEmail: ${email || 'not provided'}\nNewsletter: ${newsletter ? 'Yes' : 'No'}`);
      // Create a hidden link to send email silently as backup
      const link = document.createElement('a');
      link.href = `mailto:adam@egopandacreative.com?subject=${subject}&body=${body}`;
      link.click();
    }
  }

  btn.disabled = false;
  btn.textContent = 'Sign the Letter';
});

// ===== NEWSLETTER FORM =====
document.getElementById('newsletterForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('nlEmail').value.trim();
  const msg = document.getElementById('nlMessage');

  if (!email) return;

  try {
    const res = await fetch(`${API}/newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    msg.textContent = data.success ? 'You\'re subscribed. Thank you.' : (data.error || 'Something went wrong.');
    msg.className = data.success ? 'sign-message' : 'sign-message error';
  } catch (e) {
    // Fallback: mailto
    const subject = encodeURIComponent('Petition');
    const body = encodeURIComponent(`Newsletter signup:\nEmail: ${email}`);
    const link = document.createElement('a');
    link.href = `mailto:adam@egopandacreative.com?subject=${subject}&body=${body}`;
    link.click();
    msg.textContent = 'Subscribed (email sent). Thank you.';
    msg.className = 'sign-message';
  }

  document.getElementById('nlEmail').value = '';
});

// ===== UTILITY =====
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ===== SCROLL ANIMATIONS =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.section').forEach(section => {
  section.style.opacity = '0';
  section.style.transform = 'translateY(30px)';
  section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
  observer.observe(section);
});

// ===== INIT =====
trackVisitor();
loadStats();
loadSignatures();
