import {
  ACCEPTED_TYPES,
  DEFAULTS,
  LAYOUTS,
  MAX_PHOTO_BYTES,
  ROLES,
  STORAGE_KEY,
  defaultCaption,
  hashId,
  slugify,
} from "./config.js";
import { BadgeCanvas, loadImage, makeParticles } from "./canvas.js";

const $ = (id) => document.getElementById(id);

const state = {
  role: ROLES.find((r) => r.id === DEFAULTS.roleId) || ROLES[0],
  name: DEFAULTS.name,
  country: DEFAULTS.country,
  org: DEFAULTS.org,
  github: DEFAULTS.github,
  quote: DEFAULTS.quote,
  layout: DEFAULTS.layout,
  photoDataUrl: null,
  photoImage: null,
  caption: "",
  particles: makeParticles(),
};

/** @type {BadgeCanvas} */
let renderer;
let rafId = 0;
let debounceTimer = 0;
let busy = false;

function setStatus(message, kind = "") {
  const el = $("status");
  el.textContent = message || "";
  el.className = `status ${kind}`.trim();
}

function scheduleRender() {
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    rafId = 0;
    paint();
  });
}

function paint() {
  const id = renderer.render({
    role: state.role,
    name: state.name,
    country: state.country,
    org: state.org,
    github: state.github,
    quote: state.quote,
    layout: state.layout,
    photoImage: state.photoImage,
    particles: state.particles,
  });
  $("contributorId").textContent = id;
  $("badgeCanvas").setAttribute(
    "aria-label",
    `Badge preview for ${state.name || "contributor"}, ${state.role.label}`
  );
}

function persist() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        roleId: state.role.id,
        name: state.name,
        country: state.country,
        org: state.org,
        github: state.github,
        quote: state.quote,
        layout: state.layout,
        caption: state.caption,
      })
    );
  } catch {
    /* private mode */
  }
}

function restore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    const role = ROLES.find((r) => r.id === saved.roleId);
    if (role) state.role = role;
    if (saved.name) state.name = saved.name;
    if (saved.country) state.country = saved.country;
    if (saved.org) state.org = saved.org;
    if (saved.github) state.github = saved.github;
    if (typeof saved.quote === "string") state.quote = saved.quote;
    if (saved.layout && LAYOUTS[saved.layout]) state.layout = saved.layout;
    if (typeof saved.caption === "string") state.caption = saved.caption;
  } catch {
    /* ignore corrupt storage */
  }
}

function syncForm() {
  $("nameInput").value = state.name;
  $("countryInput").value = state.country;
  $("orgInput").value = state.org;
  $("githubInput").value = state.github;
  $("quoteInput").value = state.quote;
  if (!state.caption) state.caption = defaultCaption(state.role);
  $("captionInput").value = state.caption;

  document.querySelectorAll("[data-role]").forEach((btn) => {
    const active = btn.dataset.role === state.role.id;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
    if (active) btn.style.setProperty("--chip-accent", state.role.c1);
  });
  document.querySelectorAll("[data-layout]").forEach((btn) => {
    const active = btn.dataset.layout === state.layout;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
  $("previewFrame").dataset.layout = state.layout;
}

function refreshCaption(force = false) {
  const generated = defaultCaption(state.role);
  if (force || !$("captionInput").dataset.dirty) {
    state.caption = generated;
    $("captionInput").value = generated;
  }
}

function debounceRender() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    persist();
    scheduleRender();
  }, 120);
}

function renderRoleChips() {
  const grid = $("roleGrid");
  grid.innerHTML = "";
  for (const role of ROLES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip";
    btn.dataset.role = role.id;
    btn.textContent = role.label;
    btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", () => {
      state.role = role;
      state.particles = makeParticles();
      refreshCaption();
      syncForm();
      persist();
      scheduleRender();
    });
    grid.appendChild(btn);
  }
}

async function handleFile(file) {
  if (!file) return;
  const typeOk = ACCEPTED_TYPES.includes(file.type) || file.type.startsWith("image/");
  if (!typeOk) {
    setStatus("Please choose a PNG, JPG, or WebP image.", "error");
    return;
  }
  if (file.size > MAX_PHOTO_BYTES) {
    setStatus("That image is over 8MB. Choose a smaller file.", "error");
    return;
  }

  setBusy(true, "Processing photo…");
  try {
    const dataUrl = await readFile(file);
    const image = await loadImage(dataUrl);
    state.photoDataUrl = dataUrl;
    state.photoImage = image;
    updateDropzonePreview();
    setStatus("Photo added.", "ok");
    scheduleRender();
  } catch (err) {
    setStatus(err.message || "Could not load that photo.", "error");
  } finally {
    setBusy(false);
  }
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

function updateDropzonePreview() {
  const zone = $("dropzone");
  if (state.photoDataUrl) {
    zone.innerHTML = `
      <div class="dropzone-preview">
        <img src="${state.photoDataUrl}" alt="Uploaded profile photo thumbnail" />
        <div>
          <div>Photo added</div>
          <button type="button" id="removePhoto" class="button secondary" style="margin-top:8px;width:auto;padding:6px 10px;font-size:12px;">Remove photo</button>
        </div>
      </div>
    `;
    $("removePhoto").addEventListener("click", (e) => {
      e.stopPropagation();
      state.photoDataUrl = null;
      state.photoImage = null;
      $("fileInput").value = "";
      resetDropzone();
      scheduleRender();
    });
  } else {
    resetDropzone();
  }
}

function resetDropzone() {
  $("dropzone").innerHTML = `
    <div style="font-size: 1.6rem; margin-bottom: 6px;">📤</div>
    <div>Drop a photo here or click to browse</div>
    <div class="meta" style="margin-top: 4px;">PNG or JPG, up to 8MB</div>
  `;
}

function setBusy(value, message) {
  busy = value;
  $("downloadBtn").disabled = value;
  $("copyImageBtn").disabled = value;
  if (message) setStatus(message);
  else if (!value) setStatus("");
}

function filename() {
  const id = hashId(`${state.name}-${state.role.id}-${state.github}`);
  return `zuntenium-badge-${state.role.id}-${slugify(state.name)}-${id}.png`;
}

async function downloadBadge() {
  setBusy(true, "Rendering PNG…");
  try {
    paint();
    const blob = await renderer.toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename();
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Downloaded.", "ok");
  } catch (err) {
    setStatus(err.message || "Download failed.", "error");
  } finally {
    setBusy(false);
  }
}

async function copyImage() {
  if (!navigator.clipboard || !window.ClipboardItem) {
    setStatus("Clipboard images are not supported in this browser. Download instead.", "error");
    return;
  }
  setBusy(true, "Copying image…");
  try {
    paint();
    const blob = await renderer.toBlob();
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    setStatus("Badge copied to clipboard.", "ok");
  } catch (err) {
    setStatus(err.message || "Could not copy the image.", "error");
  } finally {
    setBusy(false);
  }
}

async function copyCaption() {
  try {
    await navigator.clipboard.writeText(state.caption);
    const btn = $("copyBtn");
    const original = btn.textContent;
    btn.textContent = "Copied";
    setTimeout(() => {
      btn.textContent = original;
    }, 1600);
    setStatus("Caption copied.", "ok");
  } catch {
    setStatus("Could not copy the caption.", "error");
  }
}

function bindControls() {
  ["nameInput", "countryInput", "orgInput", "githubInput", "quoteInput"].forEach((id) => {
    const field = id.replace("Input", "");
    const key = field === "name" ? "name" : field;
    $(id).addEventListener("input", (e) => {
      state[key] = e.target.value;
      debounceRender();
    });
  });

  $("captionInput").addEventListener("input", (e) => {
    state.caption = e.target.value;
    $("captionInput").dataset.dirty = "true";
    persist();
  });

  document.querySelectorAll("[data-layout]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.layout = btn.dataset.layout;
      syncForm();
      persist();
      scheduleRender();
    });
  });

  $("fileInput").addEventListener("change", (e) => handleFile(e.target.files?.[0]));

  const dropzone = $("dropzone");
  dropzone.addEventListener("click", () => $("fileInput").click());
  dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      $("fileInput").click();
    }
  });
  ["dragenter", "dragover"].forEach((ev) => {
    dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      dropzone.classList.add("active");
    });
  });
  ["dragleave", "drop"].forEach((ev) => {
    dropzone.addEventListener(ev, () => dropzone.classList.remove("active"));
  });
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer?.files?.[0]);
  });

  $("downloadBtn").addEventListener("click", downloadBadge);
  $("copyImageBtn").addEventListener("click", copyImage);
  $("copyBtn").addEventListener("click", copyCaption);
}

async function init() {
  restore();
  renderRoleChips();
  syncForm();
  renderer = new BadgeCanvas($("badgeCanvas"), { onReady: scheduleRender });
  bindControls();

  try {
    await document.fonts.ready;
  } catch {
    /* continue with fallbacks */
  }
  scheduleRender();
}

window.addEventListener("DOMContentLoaded", init);
