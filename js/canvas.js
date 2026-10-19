import { C, LAYOUTS, LOGO_SRC, hashId, hexToRgba } from "./config.js";

/**
 * @typedef {import('./config.js').Role} Role
 * @typedef {{
 *   role: Role,
 *   name: string,
 *   country: string,
 *   org: string,
 *   github: string,
 *   quote: string,
 *   layout: keyof typeof LAYOUTS,
 *   photoImage: HTMLImageElement | null,
 *   particles: Array<{ x: number, y: number, r: number }>,
 * }} BadgeState
 */

function drawRoundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawTrackedText(ctx, text, x, y, tracking) {
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + tracking;
  }
  return cx - x;
}

function wrapText(ctx, text, maxW, maxLines) {
  const words = text.split(" ");
  let line = "";
  const lines = [];
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    } else {
      line = test;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  return lines;
}

function goldFill(ctx, x0, y0, x1, y1, c1 = C.goldSoft, c2 = C.goldDeep) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, c1);
  g.addColorStop(0.45, C.gold);
  g.addColorStop(1, c2);
  return g;
}

/**
 * Layout-aware geometry so Square / Story / LinkedIn are not cramped copies.
 * @param {string} layout
 * @param {number} w
 * @param {number} h
 */
function geometry(layout, w, h) {
  const scale = w / 1080;
  const pad = (layout === "story" ? 72 : layout === "linkedin" ? 40 : 56) * scale;

  if (layout === "linkedin") {
    const photoR = 118 * scale;
    return {
      scale,
      pad,
      landscape: true,
      photoR,
      photoCx: pad + 56 * scale + photoR,
      photoCy: h / 2 + 36 * scale,
      textX: pad + 56 * scale + photoR * 2 + 44 * scale,
      textAlign: "left",
      nameSize: 36 * scale,
      roleSize: 42 * scale,
      metaSize: 16 * scale,
      quoteSize: 17 * scale,
      quoteMax: 3,
      headerY: pad + 18 * scale,
    };
  }

  const photoR = (layout === "story" ? 228 : 148) * scale;
  const photoCy =
    layout === "story" ? pad + 700 * scale : pad + 560 * scale;

  return {
    scale,
    pad,
    landscape: false,
    photoR,
    photoCx: w / 2,
    photoCy,
    textX: w / 2,
    textAlign: "center",
    nameSize: (layout === "story" ? 48 : 40) * scale,
    roleSize: (layout === "story" ? 72 : 58) * scale,
    metaSize: (layout === "story" ? 20 : 18) * scale,
    quoteSize: (layout === "story" ? 24 : 20) * scale,
    quoteMax: layout === "story" ? 4 : 2,
    headerY: pad + 28 * scale,
  };
}

function drawCoverCircle(ctx, img, cx, cy, r) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const side = Math.min(iw, ih);
  const sx = (iw - side) / 2;
  const sy = (ih - side) / 2;
  ctx.drawImage(img, sx, sy, side, side, cx - r, cy - r, r * 2, r * 2);
}

function drawGoldCorner(ctx, w, h, scale) {
  const size = Math.min(w, h) * 0.22;
  const g = ctx.createLinearGradient(w - size, h - size, w, h);
  g.addColorStop(0, hexToRgba(C.goldSoft, 0.15));
  g.addColorStop(0.35, C.gold);
  g.addColorStop(1, C.goldDeep);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(w, h - size);
  ctx.lineTo(w, h);
  ctx.lineTo(w - size, h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = hexToRgba(C.goldSoft, 0.55);
  ctx.lineWidth = 1.5 * scale;
  ctx.beginPath();
  ctx.moveTo(w - 8 * scale, h - size + 10 * scale);
  ctx.lineTo(w - size + 10 * scale, h - 8 * scale);
  ctx.stroke();
}

function drawOrbits(ctx, cx, cy, size, color) {
  ctx.save();
  ctx.translate(cx, cy);

  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.35);
  glow.addColorStop(0, hexToRgba(color, 0.22));
  glow.addColorStop(1, hexToRgba(color, 0));
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, size * 1.35, 0, Math.PI * 2);
  ctx.fill();

  const rings = [
    { rx: size, ry: size * 0.32, rot: -0.35, w: 1.6 },
    { rx: size * 0.82, ry: size * 0.26, rot: 0.72, w: 1.2 },
    { rx: size * 0.7, ry: size * 0.22, rot: -1.15, w: 1 },
  ];

  for (const ring of rings) {
    ctx.save();
    ctx.rotate(ring.rot);
    ctx.strokeStyle = hexToRgba(C.goldSoft, 0.72);
    ctx.lineWidth = ring.w;
    ctx.beginPath();
    ctx.ellipse(0, 0, ring.rx, ring.ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = goldFill(ctx, -6, -6, 6, 6);
    ctx.beginPath();
    ctx.arc(ring.rx, 0, Math.max(3.2, size * 0.035), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const core = ctx.createRadialGradient(-size * 0.08, -size * 0.08, 0, 0, 0, size * 0.14);
  core.addColorStop(0, "#FFF8E1");
  core.addColorStop(0.4, C.gold);
  core.addColorStop(1, C.goldDeep);
  ctx.fillStyle = core;
  ctx.shadowColor = hexToRgba(C.gold, 0.85);
  ctx.shadowBlur = size * 0.22;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Vector gold Z mark with a quantum orbit — reads like a premium monogram.
 */
function drawZMonogram(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  const cx = size / 2;
  const cy = size / 2;

  const disc = ctx.createRadialGradient(cx - size * 0.12, cy - size * 0.14, size * 0.05, cx, cy, size * 0.5);
  disc.addColorStop(0, "#1A150C");
  disc.addColorStop(1, "#050505");
  ctx.fillStyle = disc;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.5, 0, Math.PI * 2);
  ctx.fill();

  const ring = goldFill(ctx, 0, 0, size, size, C.goldSoft, color);
  ctx.strokeStyle = ring;
  ctx.lineWidth = Math.max(2.2, size * 0.045);
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.46, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = hexToRgba(C.goldDeep, 0.7);
  ctx.lineWidth = Math.max(1, size * 0.016);
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.38, 0, Math.PI * 2);
  ctx.stroke();

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.55);
  ctx.strokeStyle = hexToRgba(C.goldSoft, 0.85);
  ctx.lineWidth = Math.max(1.2, size * 0.024);
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.5, size * 0.17, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = goldFill(ctx, -4, -4, 4, 4);
  ctx.beginPath();
  ctx.arc(size * 0.5, 0, size * 0.045, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const inset = size * 0.27;
  const top = size * 0.3;
  const bot = size * 0.7;
  ctx.strokeStyle = goldFill(ctx, inset, top, size - inset, bot, "#FFF3C4", C.goldDeep);
  ctx.lineWidth = size * 0.1;
  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";
  ctx.shadowColor = hexToRgba(C.gold, 0.55);
  ctx.shadowBlur = size * 0.08;
  ctx.beginPath();
  ctx.moveTo(inset, top);
  ctx.lineTo(size - inset, top);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size - inset, top);
  ctx.lineTo(inset, bot);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(inset, bot);
  ctx.lineTo(size - inset, bot);
  ctx.stroke();

  ctx.restore();
}

function drawRuledLabel(ctx, text, cx, y, scale, color, font) {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const tw = ctx.measureText(text).width;
  const gap = 16 * scale;
  const lineW = 46 * scale;
  ctx.fillText(text, cx, y);
  ctx.strokeStyle = hexToRgba(C.gold, 0.7);
  ctx.lineWidth = 1.2 * scale;
  ctx.beginPath();
  ctx.moveTo(cx - tw / 2 - gap - lineW, y);
  ctx.lineTo(cx - tw / 2 - gap, y);
  ctx.moveTo(cx + tw / 2 + gap, y);
  ctx.lineTo(cx + tw / 2 + gap + lineW, y);
  ctx.stroke();
  ctx.restore();
}

export class BadgeCanvas {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas, { onReady } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.bgCache = document.createElement("canvas");
    this.bgCtx = this.bgCache.getContext("2d");
    this.bgKey = "";
    this.logo = null;
    this.onReady = onReady;
    this._loadLogo();
  }

  _loadLogo() {
    const img = new Image();
    img.onload = async () => {
      try {
        if (img.decode) await img.decode();
      } catch {
        /* ignore */
      }
      this.logo = img;
      this.onReady?.();
    };
    img.src = LOGO_SRC;
  }

  /**
   * Rebuild the cached aurora + particle layer only when role/layout/particles change.
   * @param {BadgeState} state
   * @param {number} w
   * @param {number} h
   */
  _ensureBackground(state, w, h) {
    const key = `${state.layout}:${state.role.id}:${w}x${h}:${state.particles.length}`;
    if (this.bgKey === key && this.bgCache.width === w) return;
    this.bgKey = key;
    this.bgCache.width = w;
    this.bgCache.height = h;
    const ctx = this.bgCtx;
    const scale = w / 1080;

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, w, h);

    const vignette = ctx.createRadialGradient(w * 0.5, h * 0.42, w * 0.1, w * 0.5, h * 0.42, w * 0.92);
    vignette.addColorStop(0, hexToRgba("#1A1408", 0.55));
    vignette.addColorStop(1, hexToRgba("#000000", 0.2));
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    const g1 = ctx.createRadialGradient(w * 0.82, h * 0.12, 0, w * 0.82, h * 0.12, w * 0.55);
    g1.addColorStop(0, hexToRgba(state.role.c1, 0.28));
    g1.addColorStop(1, hexToRgba(state.role.c1, 0));
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, w, h);

    const g2 = ctx.createRadialGradient(w * 0.08, h * 0.92, 0, w * 0.08, h * 0.92, w * 0.5);
    g2.addColorStop(0, hexToRgba(C.goldDeep, 0.22));
    g2.addColorStop(1, hexToRgba(C.goldDeep, 0));
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, w, h);

    for (const p of state.particles) {
      const px = (p.x / 100) * w;
      const py = (p.y / 100) * h;
      const pr = p.r * scale;
      ctx.fillStyle = hexToRgba(C.goldSoft, 0.22 + (p.r / 3) * 0.35);
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }

    drawOrbits(
      ctx,
      w * (state.layout === "linkedin" ? 0.9 : 0.84),
      h * (state.layout === "linkedin" ? 0.2 : 0.11),
      (state.layout === "linkedin" ? 130 : 190) * scale,
      state.role.c1
    );

    drawGoldCorner(ctx, w, h, scale);
  }

  _drawLogoMark(ctx, x, y, size) {
    if (!this.logo) {
      drawZMonogram(ctx, x, y, size, C.gold);
      return;
    }
    ctx.save();
    ctx.shadowColor = hexToRgba(C.gold, 0.55);
    ctx.shadowBlur = size * 0.18;
    ctx.globalCompositeOperation = "screen";
    ctx.drawImage(this.logo, x, y, size, size);
    ctx.restore();
  }

  _drawBrandLockup(ctx, x, y, scale, landscape) {
    const mark = (landscape ? 70 : 92) * scale;
    this._drawLogoMark(ctx, x, y, mark);

    const textX = x + mark + 18 * scale;
    const titleY = y + (landscape ? 10 : 14) * scale;
    const titleSize = landscape ? 22 : 30;

    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = C.white;
    ctx.font = `700 ${titleSize * scale}px "Cinzel", "Times New Roman", serif`;
    drawTrackedText(ctx, "ZUNTENIUM", textX, titleY, 3.2 * scale);

    const subY = titleY + (landscape ? 30 : 40) * scale;
    ctx.font = `500 ${landscape ? 10 : 11}px Inter, sans-serif`;
    ctx.fillStyle = C.gold;
    const subtitle = "AFRICA";
    const subW = ctx.measureText(subtitle).width;
    const rulePad = 12 * scale;
    const ruleLen = 36 * scale;
    ctx.strokeStyle = hexToRgba(C.gold, 0.8);
    ctx.lineWidth = 1.15 * scale;
    ctx.beginPath();
    ctx.moveTo(textX, subY + 6 * scale);
    ctx.lineTo(textX + ruleLen, subY + 6 * scale);
    ctx.moveTo(textX + ruleLen + rulePad + subW + rulePad, subY + 6 * scale);
    ctx.lineTo(textX + ruleLen + rulePad + subW + rulePad + ruleLen, subY + 6 * scale);
    ctx.stroke();
    ctx.fillText(subtitle, textX + ruleLen + rulePad, subY);

    const barY = subY + (landscape ? 22 : 26) * scale;
    ctx.strokeStyle = goldFill(ctx, textX, barY, textX + 168 * scale, barY);
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(textX, barY);
    ctx.lineTo(textX + 168 * scale, barY);
    ctx.stroke();

    return mark;
  }

  /**
   * Synchronous draw. Photo must already be a decoded HTMLImageElement.
   * @param {BadgeState} state
   */
  render(state) {
    const { w, h } = LAYOUTS[state.layout];
    const canvas = this.canvas;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const ctx = this.ctx;
    const g = geometry(state.layout, w, h);
    const { scale, pad } = g;
    const role = state.role;

    this._ensureBackground(state, w, h);
    ctx.drawImage(this.bgCache, 0, 0);

    const cardX = pad;
    const cardY = pad;
    const cardW = w - pad * 2;
    const cardH = h - pad * 2;

    ctx.save();
    ctx.strokeStyle = hexToRgba(C.gold, 0.28);
    ctx.lineWidth = 1.25 * scale;
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 18 * scale);
    ctx.stroke();
    ctx.restore();

    const brandX = cardX + 36 * scale;
    this._drawBrandLockup(ctx, brandX, g.headerY, scale, g.landscape);

    const name = state.name || "Your Name";
    const contributorId = hashId(`${state.name}-${state.role.id}-${state.github}`);

    if (g.landscape) {
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = C.white;
      ctx.font = `700 ${28 * scale}px "Outfit", "Space Grotesk", sans-serif`;
      ctx.fillText("OFFICIAL", g.textX, g.headerY + 8 * scale);
      ctx.fillStyle = goldFill(ctx, g.textX, 0, g.textX + 320 * scale, 0, role.c2, role.c1);
      ctx.font = `700 ${g.roleSize}px "Cinzel", serif`;
      ctx.fillText(role.label.toUpperCase(), g.textX, g.headerY + 40 * scale);
    } else {
      const kickerY = g.headerY + (state.layout === "story" ? 140 : 118) * scale;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = C.white;
      ctx.font = `700 ${(state.layout === "story" ? 64 : 52) * scale}px "Outfit", "Space Grotesk", sans-serif`;
      ctx.fillText("OFFICIAL", g.textX, kickerY);
      const roleText = role.label.toUpperCase();
      let roleSize = g.roleSize;
      ctx.font = `700 ${roleSize}px "Cinzel", serif`;
      const roleMax = cardW - 80 * scale;
      while (roleSize > g.roleSize * 0.55 && ctx.measureText(roleText).width > roleMax) {
        roleSize -= 2 * scale;
        ctx.font = `700 ${roleSize}px "Cinzel", serif`;
      }
      ctx.fillStyle = goldFill(ctx, g.textX - 220 * scale, 0, g.textX + 220 * scale, 0, role.c2, role.c1);
      ctx.fillText(roleText, g.textX, kickerY + (state.layout === "story" ? 78 : 62) * scale);

      const ruleY = kickerY + (state.layout === "story" ? 168 : 136) * scale;
      ctx.strokeStyle = hexToRgba(C.gold, 0.85);
      ctx.lineWidth = 1.4 * scale;
      ctx.beginPath();
      ctx.moveTo(g.textX - 90 * scale, ruleY);
      ctx.lineTo(g.textX + 90 * scale, ruleY);
      ctx.stroke();

      drawRuledLabel(
        ctx,
        "SHARE WHAT YOU KNOW",
        g.textX,
        ruleY + 32 * scale,
        scale,
        C.goldSoft,
        `500 ${13 * scale}px Inter, sans-serif`
      );
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(g.photoCx, g.photoCy, g.photoR + 14 * scale, 0, Math.PI * 2);
    ctx.strokeStyle = goldFill(
      ctx,
      g.photoCx - g.photoR,
      g.photoCy - g.photoR,
      g.photoCx + g.photoR,
      g.photoCy + g.photoR,
      role.c2,
      role.c1
    );
    ctx.lineWidth = 10 * scale;
    ctx.shadowColor = hexToRgba(C.gold, 0.7);
    ctx.shadowBlur = 32 * scale;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(g.photoCx, g.photoCy, g.photoR + 3 * scale, 0, Math.PI * 2);
    ctx.strokeStyle = hexToRgba("#050505", 0.9);
    ctx.lineWidth = 3 * scale;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(g.photoCx, g.photoCy, g.photoR, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    if (state.photoImage) {
      drawCoverCircle(ctx, state.photoImage, g.photoCx, g.photoCy, g.photoR);
    } else {
      ctx.fillStyle = "#14110C";
      ctx.fillRect(g.photoCx - g.photoR, g.photoCy - g.photoR, g.photoR * 2, g.photoR * 2);
      ctx.fillStyle = C.gold;
      ctx.font = `700 ${64 * scale}px Cinzel, serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText((state.name || "?").charAt(0).toUpperCase(), g.photoCx, g.photoCy + 4 * scale);
    }
    ctx.restore();

    if (g.landscape) {
      let ty = g.photoCy - g.photoR + 8 * scale;
      ctx.textAlign = "left";
      ctx.fillStyle = C.white;
      ctx.font = `700 ${g.nameSize}px "Outfit", "Space Grotesk", sans-serif`;
      ctx.fillText(name, g.textX, ty);
      ty += g.nameSize + 12 * scale;

      ctx.fillStyle = C.muted;
      ctx.font = `400 ${g.metaSize}px Inter, sans-serif`;
      const meta = [state.country, state.org].filter(Boolean).join("  ·  ");
      ctx.fillText(meta, g.textX, ty);
      ty += g.metaSize + 16 * scale;

      if (state.quote) {
        ctx.font = `italic 400 ${g.quoteSize}px Inter, sans-serif`;
        ctx.fillStyle = C.goldSoft;
        const maxW = cardX + cardW - 48 * scale - g.textX;
        wrapText(ctx, `"${state.quote}"`, maxW, g.quoteMax).forEach((line, i) => {
          ctx.fillText(line, g.textX, ty + i * (g.quoteSize + 8 * scale));
        });
      }
    } else {
      const nameY = g.photoCy + g.photoR + (state.layout === "story" ? 48 : 28) * scale;
      ctx.textAlign = "center";
      ctx.fillStyle = C.white;
      ctx.font = `700 ${g.nameSize}px "Outfit", "Space Grotesk", sans-serif`;
      ctx.fillText(name, g.textX, nameY);

      ctx.fillStyle = C.muted;
      ctx.font = `400 ${g.metaSize}px Inter, sans-serif`;
      const meta = [state.country, state.org].filter(Boolean).join("  ·  ");
      ctx.fillText(meta, g.textX, nameY + g.nameSize + 12 * scale);

      if (state.quote) {
        ctx.font = `italic 400 ${g.quoteSize}px Inter, sans-serif`;
        ctx.fillStyle = C.goldSoft;
        const maxW = cardW - 140 * scale;
        const quoteY = nameY + g.nameSize + 12 * scale + g.metaSize + 22 * scale;
        wrapText(ctx, `"${state.quote}"`, maxW, g.quoteMax).forEach((line, i) => {
          ctx.fillText(line, g.textX, quoteY + i * (g.quoteSize + 10 * scale));
        });
      }
    }

    ctx.font = `500 ${14 * scale}px "JetBrains Mono", monospace`;
    ctx.fillStyle = C.gold;
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillText(contributorId, cardX + 36 * scale, cardY + cardH - 32 * scale);
    if (state.github) {
      ctx.textAlign = "right";
      ctx.fillStyle = C.goldSoft;
      ctx.fillText(`github.com/${state.github}`, cardX + cardW - 36 * scale, cardY + cardH - 32 * scale);
    }

    return contributorId;
  }

  toPngDataUrl() {
    return this.canvas.toDataURL("image/png");
  }

  /**
   * @returns {Promise<Blob>}
   */
  toBlob() {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not export the badge."));
      }, "image/png");
    });
  }
}

/**
 * Decode a data URL into a usable Image, then force a paint.
 * @param {string} src
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      try {
        if (img.decode) await img.decode();
      } catch {
        /* decode() is best-effort */
      }
      resolve(img);
    };
    img.onerror = () => reject(new Error("Could not read that image. Try a PNG or JPG."));
    img.src = src;
  });
}

export function makeParticles(count = 28) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    r: Math.random() * 1.8 + 0.4,
  }));
}
