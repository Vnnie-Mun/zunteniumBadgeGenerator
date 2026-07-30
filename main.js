
import React, { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Download, Copy, Check, Shield, Sparkles, RotateCw, X, Image as ImageIcon } from "lucide-react";

// ---------------------------------------------------------------------------
// Design tokens (per brief): cyan / violet / green on near-black, glassmorphism
// ---------------------------------------------------------------------------
const C = {
  primary: "#00E5FF",
  secondary: "#7B61FF",
  accent: "#00FF88",
  bg: "#070B14",
  card: "#101827",
  muted: "#94A3B8",
};

const ROLES = [
  { id: "developer", label: "Developer", c1: C.primary, c2: C.secondary },
  { id: "ai-engineer", label: "AI Engineer", c1: C.secondary, c2: C.accent },
  { id: "quantum-engineer", label: "Quantum Engineer", c1: C.accent, c2: C.primary },
  { id: "researcher", label: "Researcher", c1: C.primary, c2: C.accent },
  { id: "instructor", label: "Instructor", c1: C.secondary, c2: C.primary },
  { id: "core-team", label: "Core Team", c1: C.accent, c2: C.secondary },
  { id: "community-leader", label: "Community Leader", c1: C.primary, c2: C.secondary },
  { id: "cybersecurity", label: "Cybersecurity Specialist", c1: C.secondary, c2: C.accent },
  { id: "cloud-engineer", label: "Cloud Engineer", c1: C.accent, c2: C.primary },
  { id: "blockchain", label: "Blockchain Developer", c1: C.primary, c2: C.accent },
  { id: "data-scientist", label: "Data Scientist", c1: C.secondary, c2: C.primary },
  { id: "iot-engineer", label: "IoT Engineer", c1: C.accent, c2: C.secondary },
  { id: "software-engineer", label: "Software Engineer", c1: C.primary, c2: C.secondary },
  { id: "mentor", label: "Mentor", c1: C.secondary, c2: C.accent },
  { id: "volunteer", label: "Volunteer", c1: C.accent, c2: C.primary },
  { id: "oss-contributor", label: "Open Source Contributor", c1: C.primary, c2: C.accent },
  { id: "partner", label: "Partner", c1: C.secondary, c2: C.primary },
];

const LAYOUTS = {
  square: { label: "Square", w: 1080, h: 1080, ratio: "1 / 1" },
  story: { label: "Portrait (Story)", w: 1080, h: 1920, ratio: "9 / 16" },
  linkedin: { label: "Landscape (LinkedIn)", w: 1200, h: 630, ratio: "1200 / 630" },
};

function hashId(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  const s = h.toString(36).toUpperCase().padStart(6, "0").slice(0, 6);
  return `ZTN-${s}`;
}

function hexToRgba(hex, a) {
  const v = hex.replace("#", "");
  const r = parseInt(v.substring(0, 2), 16);
  const g = parseInt(v.substring(2, 4), 16);
  const b = parseInt(v.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export default function ZunteniumBadgeGenerator() {
  const [role, setRole] = useState(ROLES[0]);
  const [name, setName] = useState("Amara Okafor");
  const [country, setCountry] = useState("Nigeria");
  const [org, setOrg] = useState("Zuntenium Labs");
  const [github, setGithub] = useState("amaraokafor");
  const [quote, setQuote] = useState("Building Africa's Deep Tech Future.");
  const [layout, setLayout] = useState("square");
  const [photo, setPhoto] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [caption, setCaption] = useState("");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [particles, setParticles] = useState([]);

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const imgElRef = useRef(null);

  const contributorId = hashId(`${name}-${role.id}-${github}`);

  // stable ambient particles per role change
  useEffect(() => {
    const arr = Array.from({ length: 22 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: Math.random() * 2 + 0.5,
      d: Math.random() * 6 + 4,
      delay: Math.random() * 4,
      key: i,
    }));
    setParticles(arr);
  }, [role.id]);

  useEffect(() => {
    setCaption(
      `🚀 Proud to be an Official Zuntenium ${role.label}.\n\nTogether we're building Africa's future in AI, Quantum Computing, and Deep Technology.\n\n#Zuntenium #ArtificialIntelligence #QuantumComputing #OpenSource #AfricaTech #Innovation`
    );
  }, [role.id]);

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 8 * 1024 * 1024) {
      alert("That image is over 8MB. Choose a smaller file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setPhoto(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const drawRoundedRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  const renderToCanvas = useCallback(async () => {
    const { w, h } = LAYOUTS[layout];
    const canvas = canvasRef.current;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    const scale = w / 1080;

    // base background
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, w, h);

    // aurora gradient wash
    const g1 = ctx.createRadialGradient(w * 0.2, h * 0.1, 0, w * 0.2, h * 0.1, w * 0.8);
    g1.addColorStop(0, hexToRgba(role.c1, 0.35));
    g1.addColorStop(1, hexToRgba(role.c1, 0));
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, w, h);

    const g2 = ctx.createRadialGradient(w * 0.85, h * 0.9, 0, w * 0.85, h * 0.9, w * 0.9);
    g2.addColorStop(0, hexToRgba(role.c2, 0.35));
    g2.addColorStop(1, hexToRgba(role.c2, 0));
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, w, h);

    // ambient particles
    ctx.fillStyle = hexToRgba("#FFFFFF", 0.35);
    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc((p.x / 100) * w, (p.y / 100) * h, p.r * scale, 0, Math.PI * 2);
      ctx.fill();
    });

    // glass card
    const pad = 60 * scale;
    const cardX = pad;
    const cardY = pad;
    const cardW = w - pad * 2;
    const cardH = h - pad * 2;
    ctx.save();
    ctx.fillStyle = hexToRgba(C.card, 0.55);
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 40 * scale);
    ctx.fill();
    ctx.lineWidth = 2 * scale;
    const borderGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
    borderGrad.addColorStop(0, role.c1);
    borderGrad.addColorStop(1, role.c2);
    ctx.strokeStyle = borderGrad;
    ctx.shadowColor = role.c1;
    ctx.shadowBlur = 30 * scale;
    ctx.stroke();
    ctx.restore();

    // brand mark top-left
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `700 ${28 * scale}px 'Space Grotesk', sans-serif`;
    ctx.textBaseline = "top";
    ctx.fillText("ZUNTENIUM", cardX + 48 * scale, cardY + 44 * scale);
    ctx.fillStyle = C.muted;
    ctx.font = `400 ${16 * scale}px Inter, sans-serif`;
    ctx.fillText("Official Contributor Badge", cardX + 48 * scale, cardY + 80 * scale);

    // verified pill top-right
    const pillText = "VERIFIED CONTRIBUTOR";
    ctx.font = `600 ${14 * scale}px Inter, sans-serif`;
    const pillW = ctx.measureText(pillText).width + 56 * scale;
    const pillH = 34 * scale;
    const pillX = cardX + cardW - 48 * scale - pillW;
    const pillY = cardY + 44 * scale;
    ctx.fillStyle = hexToRgba(C.accent, 0.15);
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
    ctx.fill();
    ctx.strokeStyle = hexToRgba(C.accent, 0.6);
    ctx.lineWidth = 1 * scale;
    ctx.stroke();
    ctx.fillStyle = C.accent;
    ctx.beginPath();
    ctx.arc(pillX + 22 * scale, pillY + pillH / 2, 5 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#EAFBF3";
    ctx.fillText(pillText, pillX + 38 * scale, pillY + 10 * scale);

    // photo circle
    const photoR = (layout === "linkedin" ? 130 : 170) * scale;
    const photoCx = cardX + cardW / 2;
    const photoCy = cardY + (layout === "linkedin" ? 190 : 260) * scale;

    ctx.save();
    ctx.beginPath();
    ctx.arc(photoCx, photoCy, photoR + 8 * scale, 0, Math.PI * 2);
    const ringGrad = ctx.createLinearGradient(
      photoCx - photoR, photoCy - photoR, photoCx + photoR, photoCy + photoR
    );
    ringGrad.addColorStop(0, role.c1);
    ringGrad.addColorStop(1, role.c2);
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = 6 * scale;
    ctx.shadowColor = role.c1;
    ctx.shadowBlur = 40 * scale;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(photoCx, photoCy, photoR, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    if (imgElRef.current) {
      const img = imgElRef.current;
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const side = Math.min(iw, ih);
      const sx = (iw - side) / 2, sy = (ih - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, photoCx - photoR, photoCy - photoR, photoR * 2, photoR * 2);
    } else {
      ctx.fillStyle = "#1A2436";
      ctx.fillRect(photoCx - photoR, photoCy - photoR, photoR * 2, photoR * 2);
      ctx.fillStyle = C.muted;
      ctx.font = `${64 * scale}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText((name || "?").charAt(0).toUpperCase(), photoCx, photoCy - 32 * scale);
      ctx.textAlign = "left";
    }
    ctx.restore();

    // name / role / country
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `700 ${44 * scale}px 'Space Grotesk', sans-serif`;
    ctx.fillText(name || "Your Name", photoCx, photoCy + photoR + 36 * scale);

    ctx.font = `600 ${22 * scale}px Inter, sans-serif`;
    const roleGrad = ctx.createLinearGradient(photoCx - 150 * scale, 0, photoCx + 150 * scale, 0);
    roleGrad.addColorStop(0, role.c1);
    roleGrad.addColorStop(1, role.c2);
    ctx.fillStyle = roleGrad;
    ctx.fillText(role.label.toUpperCase(), photoCx, photoCy + photoR + 92 * scale);

    ctx.fillStyle = C.muted;
    ctx.font = `400 ${18 * scale}px Inter, sans-serif`;
    const meta = [country, org].filter(Boolean).join("  ·  ");
    ctx.fillText(meta, photoCx, photoCy + photoR + 128 * scale);

    // quote
    if (quote) {
      ctx.font = `italic 400 ${20 * scale}px Inter, sans-serif`;
      ctx.fillStyle = "#E2E8F0";
      const maxW = cardW - 140 * scale;
      const words = `"${quote}"`.split(" ");
      let line = "", lines = [];
      words.forEach((word) => {
        const test = line + word + " ";
        if (ctx.measureText(test).width > maxW && line) {
          lines.push(line);
          line = word + " ";
        } else {
          line = test;
        }
      });
      lines.push(line);
      const quoteY = photoCy + photoR + 172 * scale;
      lines.slice(0, 2).forEach((l, i) => {
        ctx.fillText(l.trim(), photoCx, quoteY + i * 28 * scale);
      });
    }

    // footer: id + github
    ctx.textAlign = "left";
    ctx.font = `500 ${16 * scale}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = C.muted;
    ctx.fillText(contributorId, cardX + 48 * scale, cardY + cardH - 60 * scale);

    if (github) {
      ctx.textAlign = "right";
      ctx.fillStyle = C.primary;
      ctx.fillText(`github.com/${github}`, cardX + cardW - 48 * scale, cardY + cardH - 60 * scale);
      ctx.textAlign = "left";
    }
  }, [role, name, country, org, github, quote, layout, particles, contributorId]);

  const handleDownload = async () => {
    setDownloading(true);
    // ensure image element (if any) is loaded before drawing
    await new Promise((resolve) => {
      if (!photo) return resolve();
      if (imgElRef.current && imgElRef.current.complete) return resolve();
      const img = new window.Image();
      img.onload = () => {
        imgElRef.current = img;
        resolve();
      };
      img.src = photo;
    });
    await renderToCanvas();
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zuntenium-badge-${role.id}-${contributorId}.png`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloading(false);
    }, "image/png");
  };

  const copyCaption = () => {
    navigator.clipboard?.writeText(caption).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      style={{
        minHeight: "100%",
        background: C.bg,
        color: "#fff",
        fontFamily: "Inter, sans-serif",
        padding: "0",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');
        * { box-sizing: border-box; }
        .zt-scroll::-webkit-scrollbar { width: 8px; }
        .zt-scroll::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 8px; }
        .zt-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 10px 14px;
          color: #fff;
          font-size: 14px;
          font-family: Inter, sans-serif;
          outline: none;
          transition: border-color .15s ease, box-shadow .15s ease;
        }
        .zt-input:focus {
          border-color: ${C.primary};
          box-shadow: 0 0 0 3px ${hexToRgba(C.primary, 0.15)};
        }
        .zt-input::placeholder { color: #566178; }
        .zt-label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: ${C.muted};
          text-transform: uppercase;
          margin-bottom: 6px;
          display: block;
        }
        .zt-role-chip {
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          border-radius: 10px;
          padding: 9px 12px;
          font-size: 12.5px;
          font-weight: 500;
          color: #cbd5e1;
          cursor: pointer;
          text-align: left;
          transition: transform .12s ease, border-color .15s ease;
        }
        .zt-role-chip:hover { transform: translateY(-1px); }
        @keyframes ztFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes ztPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .zt-particle { animation: ztPulse 4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .zt-particle { animation: none !important; }
        }
      `}</style>

      {/* top bar */}
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "18px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={16} color="#070B14" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16 }}>
              Zuntenium
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>Contributor Badge Generator</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: C.muted, textAlign: "right" }}>
          Building Africa's Future in AI, Quantum Computing &amp; Deep Technology
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(280px, 380px) 1fr",
          gap: 0,
          minHeight: "calc(100% - 68px)",
        }}
      >
        {/* controls */}
        <div
          className="zt-scroll"
          style={{
            borderRight: "1px solid rgba(255,255,255,0.06)",
            padding: 24,
            maxHeight: "82vh",
            overflowY: "auto",
          }}
        >
          {/* role picker */}
          <div style={{ marginBottom: 22 }}>
            <span className="zt-label">Contributor role</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r)}
                  className="zt-role-chip"
                  style={
                    role.id === r.id
                      ? {
                          borderColor: r.c1,
                          background: hexToRgba(r.c1, 0.12),
                          color: "#fff",
                        }
                      : {}
                  }
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* photo upload */}
          <div style={{ marginBottom: 22 }}>
            <span className="zt-label">Profile photo</span>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `1.5px dashed ${dragActive ? role.c1 : "rgba(255,255,255,0.14)"}`,
                borderRadius: 14,
                padding: 18,
                textAlign: "center",
                cursor: "pointer",
                background: dragActive ? hexToRgba(role.c1, 0.06) : "rgba(255,255,255,0.02)",
                transition: "all .15s ease",
              }}
            >
              {photo ? (
                <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
                  <img
                    src={photo}
                    alt="Uploaded"
                    style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }}
                  />
                  <div style={{ fontSize: 12.5, color: C.muted, textAlign: "left" }}>
                    Photo added
                    <div
                      onClick={(e) => { e.stopPropagation(); setPhoto(null); imgElRef.current = null; }}
                      style={{ color: "#f87171", cursor: "pointer", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <X size={12} /> Remove
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Upload size={20} color={C.muted} style={{ marginBottom: 6 }} />
                  <div style={{ fontSize: 13, color: "#cbd5e1" }}>Drag a photo here, or click to browse</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>PNG or JPG, up to 8MB</div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
          </div>

          {/* fields */}
          {[
            ["Full name", name, setName, "Your name"],
            ["Country", country, setCountry, "Country"],
            ["Organization", org, setOrg, "Company or team"],
            ["GitHub username", github, setGithub, "username"],
          ].map(([label, val, setter, placeholder]) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <span className="zt-label">{label}</span>
              <input
                className="zt-input"
                value={val}
                placeholder={placeholder}
                onChange={(e) => setter(e.target.value)}
              />
            </div>
          ))}

          <div style={{ marginBottom: 22 }}>
            <span className="zt-label">Short quote</span>
            <textarea
              className="zt-input"
              rows={2}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              style={{ resize: "none", fontFamily: "Inter, sans-serif" }}
            />
          </div>

          {/* layout */}
          <div style={{ marginBottom: 22 }}>
            <span className="zt-label">Format</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Object.entries(LAYOUTS).map(([key, l]) => (
                <button
                  key={key}
                  onClick={() => setLayout(key)}
                  className="zt-role-chip"
                  style={
                    layout === key
                      ? { borderColor: role.c1, background: hexToRgba(role.c1, 0.12), color: "#fff" }
                      : {}
                  }
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              width: "100%",
              padding: "13px 16px",
              borderRadius: 12,
              border: "none",
              background: `linear-gradient(135deg, ${role.c1}, ${role.c2})`,
              color: "#070B14",
              fontWeight: 700,
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: downloading ? "default" : "pointer",
              opacity: downloading ? 0.7 : 1,
              boxShadow: `0 8px 24px ${hexToRgba(role.c1, 0.25)}`,
            }}
          >
            <Download size={16} strokeWidth={2.5} />
            {downloading ? "Rendering…" : `Download PNG (${LAYOUTS[layout].w}×${LAYOUTS[layout].h})`}
          </button>

          {/* caption */}
          <div style={{ marginTop: 24 }}>
            <span className="zt-label">Suggested caption</span>
            <textarea
              className="zt-input"
              rows={5}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, lineHeight: 1.5, resize: "none" }}
            />
            <button
              onClick={copyCaption}
              style={{
                marginTop: 8,
                width: "100%",
                padding: "9px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.03)",
                color: "#e2e8f0",
                fontSize: 12.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                cursor: "pointer",
              }}
            >
              {copied ? <Check size={14} color={C.accent} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy caption"}
            </button>
          </div>
        </div>

        {/* preview */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(600px circle at 20% 20%, ${hexToRgba(role.c1, 0.12)}, transparent 60%), radial-gradient(600px circle at 80% 85%, ${hexToRgba(role.c2, 0.12)}, transparent 60%)`,
              transition: "background 0.4s ease",
            }}
          />
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: layout === "story" ? 340 : layout === "linkedin" ? 560 : 460,
              aspectRatio: LAYOUTS[layout].ratio,
              borderRadius: 28,
              overflow: "hidden",
              background: C.card,
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 60px ${hexToRgba(role.c1, 0.15)}`,
              animation: "ztFloat 6s ease-in-out infinite",
            }}
          >
            {/* particles */}
            {particles.map((p) => (
              <div
                key={p.key}
                className="zt-particle"
                style={{
                  position: "absolute",
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: p.r * 3,
                  height: p.r * 3,
                  borderRadius: "50%",
                  background: "#fff",
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.d}s`,
                  pointerEvents: "none",
                }}
              />
            ))}

            {/* border glow ring */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 28,
                padding: 2,
                background: `linear-gradient(135deg, ${role.c1}, ${role.c2})`,
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
                opacity: 0.8,
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "relative",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: layout === "linkedin" ? "20px 32px" : "36px 28px",
                justifyContent: layout === "linkedin" ? "center" : "flex-start",
              }}
            >
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: layout === "linkedin" ? 0 : 18,
                  position: layout === "linkedin" ? "absolute" : "static",
                  top: layout === "linkedin" ? 16 : undefined,
                  left: layout === "linkedin" ? 20 : undefined,
                  right: layout === "linkedin" ? 20 : undefined,
                }}
              >
                <div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: 1 }}>
                    ZUNTENIUM
                  </div>
                  <div style={{ fontSize: 10, color: C.muted }}>Official Contributor Badge</div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    background: hexToRgba(C.accent, 0.12),
                    border: `1px solid ${hexToRgba(C.accent, 0.4)}`,
                    borderRadius: 999,
                    padding: "4px 10px",
                    fontSize: 9.5,
                    fontWeight: 600,
                    color: "#c8ffe8",
                  }}
                >
                  <Shield size={10} color={C.accent} />
                  VERIFIED
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: layout === "linkedin" ? "row" : "column",
                  alignItems: "center",
                  gap: layout === "linkedin" ? 24 : 10,
                  flex: layout === "linkedin" ? undefined : 1,
                  justifyContent: layout === "linkedin" ? "center" : "flex-start",
                  marginTop: layout === "linkedin" ? 0 : 8,
                }}
              >
                <div
                  style={{
                    width: layout === "linkedin" ? 96 : 112,
                    height: layout === "linkedin" ? 96 : 112,
                    borderRadius: "50%",
                    padding: 3,
                    background: `linear-gradient(135deg, ${role.c1}, ${role.c2})`,
                    boxShadow: `0 0 30px ${hexToRgba(role.c1, 0.5)}`,
                    flexShrink: 0,
                  }}
                >
                  {photo ? (
                    <img
                      src={photo}
                      alt=""
                      ref={(el) => {
                        if (el && (!imgElRef.current || imgElRef.current.src !== el.src)) {
                          const im = new window.Image();
                          im.src = photo;
                          imgElRef.current = im;
                        }
                      }}
                      style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", display: "block", background: C.bg }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        background: "#1A2436",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ImageIcon size={28} color={C.muted} />
                    </div>
                  )}
                </div>

                <div style={{ textAlign: layout === "linkedin" ? "left" : "center" }}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: layout === "linkedin" ? 22 : 20 }}>
                    {name || "Your Name"}
                  </div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 12.5,
                      letterSpacing: 0.5,
                      backgroundImage: `linear-gradient(90deg, ${role.c1}, ${role.c2})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      marginTop: 3,
                    }}
                  >
                    {role.label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                    {[country, org].filter(Boolean).join(" · ")}
                  </div>
                  {quote && layout === "linkedin" && (
                    <div style={{ fontSize: 11, color: "#e2e8f0", marginTop: 8, fontStyle: "italic", maxWidth: 280 }}>
                      "{quote}"
                    </div>
                  )}
                </div>
              </div>

              {quote && layout !== "linkedin" && (
                <div style={{ fontSize: 12, color: "#e2e8f0", marginTop: 14, fontStyle: "italic", textAlign: "center", maxWidth: "90%" }}>
                  "{quote}"
                </div>
              )}

              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 9.5,
                  color: C.muted,
                  fontFamily: "'JetBrains Mono', monospace",
                  marginTop: layout === "linkedin" ? 0 : "auto",
                  paddingTop: layout === "linkedin" ? 0 : 16,
                  position: layout === "linkedin" ? "absolute" : "static",
                  bottom: layout === "linkedin" ? 14 : undefined,
                  left: layout === "linkedin" ? 20 : undefined,
                  right: layout === "linkedin" ? 20 : undefined,
                }}
              >
                <span>{contributorId}</span>
                {github && <span style={{ color: C.primary }}>github.com/{github}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
