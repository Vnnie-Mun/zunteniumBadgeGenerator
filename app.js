const C = {
  primary: '#FFFFFF',
  secondary: '#1E3A5F',
  accent: '#4A7BA7',
  bg: '#F8F9FA',
  card: '#FFFFFF',
  muted: '#6B7280',
  border: '#E5E7EB',
  dark: '#1F2937',
};

const ROLES = [
  { id: 'developer', label: 'Developer', c1: C.primary, c2: C.secondary },
  { id: 'ai-engineer', label: 'AI Engineer', c1: C.secondary, c2: C.accent },
  { id: 'quantum-engineer', label: 'Quantum Engineer', c1: C.accent, c2: C.primary },
  { id: 'researcher', label: 'Researcher', c1: C.primary, c2: C.accent },
];

const LAYOUTS = {
  square: { label: 'Square', w: 1080, h: 1080, ratio: '1 / 1' },
  story: { label: 'Portrait', w: 1080, h: 1920, ratio: '9 / 16' },
  linkedin: { label: 'LinkedIn', w: 1200, h: 630, ratio: '1200 / 630' },
};

function hashId(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return `ZTN-${h.toString(36).toUpperCase().padStart(6, '0').slice(0, 6)}`;
}

function hexToRgba(hex, a) {
  const v = hex.replace('#', '');
  const r = parseInt(v.substring(0, 2), 16);
  const g = parseInt(v.substring(2, 4), 16);
  const b = parseInt(v.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const state = {
  role: ROLES[0],
  name: 'Amara Okafor',
  country: 'Nigeria',
  org: 'Zuntenium Labs',
  github: 'amaraokafor',
  quote: "Building Africa's Deep Tech Future.",
  layout: 'square',
  photo: null,
  caption: '',
  particles: [],
};

function init() {
  bindControls();
  state.particles = Array.from({ length: 22 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    r: Math.random() * 2 + 0.5,
    d: Math.random() * 6 + 4,
    delay: Math.random() * 4,
    key: i,
  }));
  refreshCaption();
  render();
}

function bindControls() {
  document.querySelectorAll('[data-role]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.role = ROLES.find((r) => r.id === btn.dataset.role) || ROLES[0];
      state.particles = Array.from({ length: 22 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        r: Math.random() * 2 + 0.5,
        d: Math.random() * 6 + 4,
        delay: Math.random() * 4,
        key: i,
      }));
      document.querySelectorAll('[data-role]').forEach((b) => b.classList.toggle('active', b.dataset.role === state.role.id));
      refreshCaption();
      render();
    });
  });

  document.querySelectorAll('[data-layout]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.layout = btn.dataset.layout;
      document.querySelectorAll('[data-layout]').forEach((b) => b.classList.toggle('active', b.dataset.layout === state.layout));
      render();
    });
  });

  document.getElementById('nameInput').addEventListener('input', (e) => {
    state.name = e.target.value;
    render();
  });

  document.getElementById('countryInput').addEventListener('input', (e) => {
    state.country = e.target.value;
    render();
  });

  document.getElementById('orgInput').addEventListener('input', (e) => {
    state.org = e.target.value;
    render();
  });

  document.getElementById('githubInput').addEventListener('input', (e) => {
    state.github = e.target.value;
    render();
  });

  document.getElementById('quoteInput').addEventListener('input', (e) => {
    state.quote = e.target.value;
    render();
  });

  document.getElementById('captionInput').addEventListener('input', (e) => {
    state.caption = e.target.value;
  });

  document.getElementById('fileInput').addEventListener('change', (e) => {
    handleFile(e.target.files?.[0]);
  });

  const dropzone = document.getElementById('dropzone');
  dropzone.addEventListener('click', () => document.getElementById('fileInput').click());
  ['dragenter', 'dragover'].forEach((ev) => {
    dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      dropzone.classList.add('active');
    });
  });
  ['dragleave', 'drop'].forEach((ev) => {
    dropzone.addEventListener(ev, () => dropzone.classList.remove('active'));
  });
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer?.files?.[0]);
  });

  document.getElementById('downloadBtn').addEventListener('click', downloadBadge);
  document.getElementById('copyBtn').addEventListener('click', copyCaption);
}

function refreshCaption() {
  state.caption = `🚀 Proud to be an Official Zuntenium ${state.role.label}.\n\nTogether we're building Africa's future in AI, Quantum Computing, and Deep Technology.\n\n#Zuntenium #ArtificialIntelligence #QuantumComputing #OpenSource #AfricaTech #Innovation`;
  const captionInput = document.getElementById('captionInput');
  if (captionInput) captionInput.value = state.caption;
}

function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  if (file.size > 8 * 1024 * 1024) {
    alert('That image is over 8MB. Choose a smaller file.');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    state.photo = reader.result;
    render();
  };
  reader.readAsDataURL(file);
}

function render() {
  const canvas = document.getElementById('badgeCanvas');
  if (!canvas) return;
  const { w, h } = LAYOUTS[state.layout];
  const scale = w / 1080;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, w, h);

  // Subtle top border accent
  ctx.fillStyle = C.secondary;
  ctx.fillRect(0, 0, w, 4 * scale);

  // Draw logo at top
  const logoY = 30 * scale;
  const logoSize = 40 * scale;
  const logoCx = w / 2;
  const logoCy = logoY + 25 * scale;
  
  // Logo outer circle (navy blue)
  ctx.fillStyle = C.secondary;
  ctx.beginPath();
  ctx.arc(logoCx, logoCy, logoSize / 2 + 4 * scale, 0, Math.PI * 2);
  ctx.fill();
  
  // Logo inner circle (white)
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(logoCx, logoCy, logoSize / 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Logo "Z" text (navy)
  ctx.fillStyle = C.secondary;
  ctx.font = `bold ${28 * scale}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Z', logoCx, logoCy);

  // Brand text below logo
  ctx.fillStyle = C.secondary;
  ctx.font = `bold ${20 * scale}px Arial, sans-serif`;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'center';
  ctx.fillText('ZUNTENIUM', logoCx, logoCy + logoSize + 12 * scale);
  
  ctx.fillStyle = C.muted;
  ctx.font = `${12 * scale}px Arial, sans-serif`;
  ctx.fillText('Official Contributor Badge', logoCx, logoCy + logoSize + 32 * scale);

  const photoR = (state.layout === 'linkedin' ? 130 : 170) * scale;
  const photoCx = w / 2;
  const photoCy = logoY + logoSize + 120 * scale;

  // Photo ring with diplomatic blue
  ctx.save();
  ctx.beginPath();
  ctx.arc(photoCx, photoCy, photoR + 8 * scale, 0, Math.PI * 2);
  ctx.strokeStyle = C.secondary;
  ctx.lineWidth = 6 * scale;
  ctx.shadowColor = C.secondary;
  ctx.shadowBlur = 20 * scale;
  ctx.stroke();
  ctx.restore();

  // Clip circle for photo
  ctx.save();
  ctx.beginPath();
  ctx.arc(photoCx, photoCy, photoR, 0, Math.PI * 2);
  ctx.clip();
  
  if (state.photo) {
    const img = new Image();
    img.onload = () => {
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const side = Math.min(iw, ih);
      const sx = (iw - side) / 2;
      const sy = (ih - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, photoCx - photoR, photoCy - photoR, photoR * 2, photoR * 2);
    };
    img.src = state.photo;
  } else {
    ctx.fillStyle = '#F3F4F6';
    ctx.fillRect(photoCx - photoR, photoCy - photoR, photoR * 2, photoR * 2);
    ctx.fillStyle = C.muted;
    ctx.font = `${64 * scale}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((state.name || '?').charAt(0).toUpperCase(), photoCx, photoCy);
  }
  ctx.restore();

  // Name / role / country
  const contentY = photoCy + photoR + 40 * scale;
  ctx.textAlign = 'center';
  ctx.fillStyle = C.dark;
  ctx.font = `700 ${44 * scale}px 'Space Grotesk', sans-serif`;
  ctx.fillText(state.name || 'Your Name', w / 2, contentY);

  ctx.font = `600 ${22 * scale}px Inter, sans-serif`;
  ctx.fillStyle = C.secondary;
  ctx.fillText(state.role.label.toUpperCase(), w / 2, contentY + 60 * scale);

  ctx.fillStyle = C.muted;
  ctx.font = `400 ${18 * scale}px Inter, sans-serif`;
  const meta = [state.country, state.org].filter(Boolean).join('  ·  ');
  ctx.fillText(meta, w / 2, contentY + 96 * scale);

  // Quote
  if (state.quote) {
    ctx.font = `italic 400 ${20 * scale}px Inter, sans-serif`;
    ctx.fillStyle = '#374151';
    const maxW = w - 140 * scale;
    const words = `"${state.quote}"`.split(' ');
    let line = '';
    const lines = [];
    words.forEach((word) => {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line);
        line = word + ' ';
      } else {
        line = test;
      }
    });
    lines.push(line);
    const quoteY = contentY + 140 * scale;
    lines.slice(0, 2).forEach((l, i) => {
      ctx.fillText(l.trim(), w / 2, quoteY + i * 28 * scale);
    });
  }

  // Footer
  const contributorId = hashId(`${state.name}-${state.role.id}-${state.github}`);
  const contributorEl = document.getElementById('contributorId');
  if (contributorEl) contributorEl.textContent = contributorId;

  ctx.textAlign = 'center';
  ctx.font = `500 ${14 * scale}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = C.muted;
  ctx.fillText(contributorId, w / 2, h - 50 * scale);

  if (state.github) {
    ctx.fillStyle = C.secondary;
    ctx.fillText(`github.com/${state.github}`, w / 2, h - 28 * scale);
  }
}


function downloadBadge() {
  const canvas = document.getElementById('badgeCanvas');
  const link = document.createElement('a');
  link.download = `zuntenium-badge-${state.role.id}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function copyCaption() {
  navigator.clipboard?.writeText(state.caption).catch(() => {});
  const btn = document.getElementById('copyBtn');
  const original = btn.textContent;
  btn.textContent = 'Copied';
  setTimeout(() => {
    btn.textContent = original;
  }, 1600);
}

window.addEventListener('DOMContentLoaded', init);
