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
      photoCy: h / 2 + 28 * scale,
      textX: pad + 56 * scale + photoR * 2 + 44 * scale,
      textAlign: "left",
      nameSize: 38 * scale,
      roleSize: 17 * scale,
      metaSize: 15 * scale,
      quoteSize: 17 * scale,
      quoteMax: 3,
      headerY: pad + 22 * scale,
    };
  }

  const photoR = (layout === "story" ? 220 : 168) * scale;
  const photoCy =
    layout === "story" ? pad + 420 * scale : pad + 250 * scale;

  return {
    scale,
    pad,
    landscape: false,
    photoR,
    photoCx: w / 2,
    photoCy,
    textX: w / 2,
    textAlign: "center",
    nameSize: (layout === "story" ? 52 : 44) * scale,
    roleSize: (layout === "story" ? 26 : 22) * scale,
    metaSize: (layout === "story" ? 20 : 18) * scale,
    quoteSize: (layout === "story" ? 24 : 20) * scale,
    quoteMax: layout === "story" ? 4 : 2,
    headerY: pad + 44 * scale,
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

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, w, h);

    const g1 = ctx.createRadialGradient(w * 0.2, h * 0.1, 0, w * 0.2, h * 0.1, w * 0.85);
    g1.addColorStop(0, hexToRgba(state.role.c1, 0.38));
    g1.addColorStop(1, hexToRgba(state.role.c1, 0));
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, w, h);

    const g2 = ctx.createRadialGradient(w * 0.85, h * 0.9, 0, w * 0.85, h * 0.9, w * 0.95);
    g2.addColorStop(0, hexToRgba(state.role.c2, 0.38));
    g2.addColorStop(1, hexToRgba(state.role.c2, 0));
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = hexToRgba("#FFFFFF", 0.28);
    for (const p of state.particles) {
      ctx.beginPath();
      ctx.arc((p.x / 100) * w, (p.y / 100) * h, p.r * (w / 1080), 0, Math.PI * 2);
      ctx.fill();
    }
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
    ctx.fillStyle = hexToRgba(C.card, 0.58);
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 40 * scale);
    ctx.fill();
    ctx.lineWidth = 2 * scale;
    const borderGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
    borderGrad.addColorStop(0, role.c1);
    borderGrad.addColorStop(1, role.c2);
    ctx.strokeStyle = borderGrad;
    ctx.shadowColor = role.c1;
    ctx.shadowBlur = 28 * scale;
    ctx.stroke();
    ctx.restore();

    ctx.textBaseline = "top";
    ctx.textAlign = "left";

    const brandX = cardX + 48 * scale;
    const brandY = g.headerY;
    if (this.logo) {
      const logoH = 36 * scale;
      const logoW = logoH * (this.logo.naturalWidth / this.logo.naturalHeight);
      ctx.save();
      drawRoundedRect(ctx, brandX, brandY, logoW, logoH, 8 * scale);
      ctx.clip();
      ctx.drawImage(this.logo, brandX, brandY, logoW, logoH);
      ctx.restore();
      ctx.fillStyle = C.white;
      ctx.font = `700 ${22 * scale}px "Space Grotesk", sans-serif`;
      ctx.fillText("ZUNTENIUM", brandX + logoW + 12 * scale, brandY + 2 * scale);
      ctx.fillStyle = C.muted;
      ctx.font = `400 ${14 * scale}px Inter, sans-serif`;
      ctx.fillText("Official Contributor Badge", brandX + logoW + 12 * scale, brandY + 26 * scale);
    } else {
      ctx.fillStyle = C.white;
      ctx.font = `700 ${28 * scale}px "Space Grotesk", sans-serif`;
      ctx.fillText("ZUNTENIUM", brandX, brandY);
      ctx.fillStyle = C.muted;
      ctx.font = `400 ${16 * scale}px Inter, sans-serif`;
      ctx.fillText("Official Contributor Badge", brandX, brandY + 36 * scale);
    }

    const pillText = "VERIFIED CONTRIBUTOR";
    ctx.font = `600 ${13 * scale}px Inter, sans-serif`;
    const pillW = ctx.measureText(pillText).width + 52 * scale;
    const pillH = 32 * scale;
    const pillX = cardX + cardW - 48 * scale - pillW;
    const pillY = g.headerY;
    ctx.fillStyle = hexToRgba(C.accent, 0.15);
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
    ctx.fill();
    ctx.strokeStyle = hexToRgba(C.accent, 0.55);
    ctx.lineWidth = 1 * scale;
    ctx.stroke();
    ctx.fillStyle = C.accent;
    ctx.beginPath();
    ctx.arc(pillX + 18 * scale, pillY + pillH / 2, 5 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#EAFBF3";
    ctx.textBaseline = "middle";
    ctx.fillText(pillText, pillX + 32 * scale, pillY + pillH / 2);
    ctx.textBaseline = "top";

    ctx.save();
    ctx.beginPath();
    ctx.arc(g.photoCx, g.photoCy, g.photoR + 8 * scale, 0, Math.PI * 2);
    const ringGrad = ctx.createLinearGradient(
      g.photoCx - g.photoR,
      g.photoCy - g.photoR,
      g.photoCx + g.photoR,
      g.photoCy + g.photoR
    );
    ringGrad.addColorStop(0, role.c1);
    ringGrad.addColorStop(1, role.c2);
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = 6 * scale;
    ctx.shadowColor = role.c1;
    ctx.shadowBlur = 36 * scale;
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
      ctx.fillStyle = "#1A2436";
      ctx.fillRect(g.photoCx - g.photoR, g.photoCy - g.photoR, g.photoR * 2, g.photoR * 2);
      ctx.fillStyle = C.muted;
      ctx.font = `700 ${64 * scale}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText((state.name || "?").charAt(0).toUpperCase(), g.photoCx, g.photoCy);
    }
    ctx.restore();

    const name = state.name || "Your Name";
    const contributorId = hashId(`${state.name}-${state.role.id}-${state.github}`);

    if (g.landscape) {
      let ty = g.photoCy - g.photoR + 8 * scale;
      ctx.textAlign = "left";
      ctx.fillStyle = C.white;
      ctx.font = `700 ${g.nameSize}px "Space Grotesk", sans-serif`;
      ctx.fillText(name, g.textX, ty);
      ty += g.nameSize + 14 * scale;

      const roleGrad = ctx.createLinearGradient(g.textX, 0, g.textX + 280 * scale, 0);
      roleGrad.addColorStop(0, role.c1);
      roleGrad.addColorStop(1, role.c2);
      ctx.fillStyle = roleGrad;
      ctx.font = `600 ${g.roleSize}px Inter, sans-serif`;
      ctx.fillText(state.role.label.toUpperCase(), g.textX, ty);
      ty += g.roleSize + 12 * scale;

      ctx.fillStyle = C.muted;
      ctx.font = `400 ${g.metaSize}px Inter, sans-serif`;
      const meta = [state.country, state.org].filter(Boolean).join("  ·  ");
      ctx.fillText(meta, g.textX, ty);
      ty += g.metaSize + 18 * scale;

      if (state.quote) {
        ctx.font = `italic 400 ${g.quoteSize}px Inter, sans-serif`;
        ctx.fillStyle = "#E2E8F0";
        const maxW = cardX + cardW - 48 * scale - g.textX;
        wrapText(ctx, `"${state.quote}"`, maxW, g.quoteMax).forEach((line, i) => {
          ctx.fillText(line, g.textX, ty + i * (g.quoteSize + 8 * scale));
        });
      }
    } else {
      const nameY = g.photoCy + g.photoR + (state.layout === "story" ? 72 : 36) * scale;
      ctx.textAlign = "center";
      ctx.fillStyle = C.white;
      ctx.font = `700 ${g.nameSize}px "Space Grotesk", sans-serif`;
      ctx.fillText(name, g.textX, nameY);

      const roleY = nameY + g.nameSize + 16 * scale;
      const roleGrad = ctx.createLinearGradient(g.textX - 160 * scale, 0, g.textX + 160 * scale, 0);
      roleGrad.addColorStop(0, role.c1);
      roleGrad.addColorStop(1, role.c2);
      ctx.fillStyle = roleGrad;
      ctx.font = `600 ${g.roleSize}px Inter, sans-serif`;
      ctx.fillText(state.role.label.toUpperCase(), g.textX, roleY);

      ctx.fillStyle = C.muted;
      ctx.font = `400 ${g.metaSize}px Inter, sans-serif`;
      const meta = [state.country, state.org].filter(Boolean).join("  ·  ");
      ctx.fillText(meta, g.textX, roleY + g.roleSize + 14 * scale);

      if (state.quote) {
        ctx.font = `italic 400 ${g.quoteSize}px Inter, sans-serif`;
        ctx.fillStyle = "#E2E8F0";
        const maxW = cardW - 140 * scale;
        const quoteY = roleY + g.roleSize + 14 * scale + g.metaSize + 28 * scale;
        wrapText(ctx, `"${state.quote}"`, maxW, g.quoteMax).forEach((line, i) => {
          ctx.fillText(line, g.textX, quoteY + i * (g.quoteSize + 10 * scale));
        });
      }
    }

    ctx.font = `500 ${15 * scale}px "JetBrains Mono", monospace`;
    ctx.fillStyle = C.muted;
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillText(contributorId, cardX + 48 * scale, cardY + cardH - 40 * scale);
    if (state.github) {
      ctx.textAlign = "right";
      ctx.fillStyle = C.primary;
      ctx.fillText(`github.com/${state.github}`, cardX + cardW - 48 * scale, cardY + cardH - 40 * scale);
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

export function makeParticles(count = 22) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    r: Math.random() * 2 + 0.5,
  }));
}
