// ============================================================
// Meubles Concept – Interactive Furniture Designer
// ============================================================

/* ── Catalog filter ──────────────────────────────────────── */
(function initCatalogFilter() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".product-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const category = btn.dataset.filter;
      cards.forEach((card) => {
        const match =
          category === "all" || card.dataset.category === category;
        card.style.display = match ? "" : "none";
      });
    });
  });
})();

/* ── Furniture Designer (Canvas) ─────────────────────────── */
(function initDesigner() {
  const canvas = document.getElementById("roomCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // ── State ──────────────────────────────────────────────
  const state = {
    selectedColor: "#c8935a",
    selectedMaterial: "Lemn",
    width: 120,
    depth: 80,
    selectedFurniture: "sofa",
    items: [],
    dragging: null,
    dragOffsetX: 0,
    dragOffsetY: 0,
    nextId: 1,
  };

  // ── Furniture definitions ──────────────────────────────
  const FURNITURE = {
    sofa: { label: "Canapea", emoji: "🛋️", w: 130, h: 60 },
    bed: { label: "Pat", emoji: "🛏️", w: 120, h: 100 },
    table: { label: "Masă", emoji: "🪑", w: 80, h: 80 },
    wardrobe: { label: "Dulap", emoji: "🚪", w: 80, h: 50 },
    desk: { label: "Birou", emoji: "🖥️", w: 110, h: 60 },
    lamp: { label: "Lampă", emoji: "💡", w: 30, h: 30 },
    bookshelf: { label: "Raft", emoji: "📚", w: 90, h: 35 },
    tv: { label: "TV", emoji: "📺", w: 100, h: 15 },
  };

  const MIN_CANVAS_HEIGHT = 380;
  const TOOLBAR_HEIGHT = 88; // toolbar + status bar combined height

  // ── Canvas sizing ──────────────────────────────────────
  function resizeCanvas() {
    const wrapper = canvas.parentElement;
    canvas.width = wrapper.clientWidth;
    canvas.height = Math.max(MIN_CANVAS_HEIGHT, wrapper.clientHeight - TOOLBAR_HEIGHT);
    drawRoom();
  }

  function drawRoom() {
    const W = canvas.width;
    const H = canvas.height;

    // Floor
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#f5ede4";
    ctx.fillRect(0, 0, W, H);

    // Parquet lines
    ctx.strokeStyle = "rgba(200,147,90,0.15)";
    ctx.lineWidth = 1;
    const tileSize = 60;
    for (let x = 0; x < W; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Walls
    ctx.strokeStyle = "#3d2b1f";
    ctx.lineWidth = 6;
    ctx.strokeRect(12, 12, W - 24, H - 24);

    // Items
    state.items.forEach((item) => drawItem(item));

    // Status count
    const statusEl = document.getElementById("designerStatus");
    if (statusEl) {
      statusEl.textContent =
        state.items.length === 0
          ? "Adaugă mobilier folosind butoanele din stânga"
          : `${state.items.length} pies${state.items.length === 1 ? "ă" : "e"} de mobilier plasate`;
    }
  }

  function drawItem(item) {
    const { x, y, w, h, color, material, emoji, id } = item;

    // Shadow
    ctx.shadowColor = "rgba(0,0,0,0.18)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 4;

    // Box
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.fill();

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Outline
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.stroke();

    // Material label
    const MAX_MATERIAL_LABEL_LENGTH = 8;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.font = "600 10px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(material.slice(0, MAX_MATERIAL_LABEL_LENGTH), x + w / 2, y + h - 8);

    // Emoji
    ctx.font = `${Math.min(w, h) * 0.45}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, x + w / 2, y + h / 2 - 5);

    ctx.textBaseline = "alphabetic";
  }

  // ── Add furniture button ───────────────────────────────
  function addFurniture() {
    const def = FURNITURE[state.selectedFurniture];
    if (!def) return;
    const W = canvas.width;
    const H = canvas.height;
    const scaleW = (state.width / 100) * (W / 4);
    const scaleH = (state.depth / 100) * (H / 4);
    const itemW = Math.max(40, scaleW);
    const itemH = Math.max(30, scaleH);

    const cx = 24 + Math.random() * (W - 48 - itemW);
    const cy = 24 + Math.random() * (H - 48 - itemH);

    state.items.push({
      id: state.nextId++,
      type: state.selectedFurniture,
      emoji: def.emoji,
      x: Math.max(24, Math.min(W - itemW - 24, cx)),
      y: Math.max(24, Math.min(H - itemH - 24, cy)),
      w: itemW,
      h: itemH,
      color: state.selectedColor,
      material: state.selectedMaterial,
    });
    drawRoom();
    showToast(`Am adăugat ${def.label} în cameră`);
  }

  document.getElementById("addFurnitureBtn")?.addEventListener("click", addFurniture);

  // ── Clear ──────────────────────────────────────────────
  document.getElementById("clearRoomBtn")?.addEventListener("click", () => {
    state.items = [];
    drawRoom();
    showToast("Camera a fost curățată");
  });

  // ── Undo ──────────────────────────────────────────────
  document.getElementById("undoBtn")?.addEventListener("click", () => {
    if (state.items.length > 0) {
      state.items.pop();
      drawRoom();
    }
  });

  // ── Export / Screenshot ───────────────────────────────
  document.getElementById("exportBtn")?.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "camera-mea-concept.png";
    link.href = canvas.toDataURL();
    link.click();
    showToast("Design exportat cu succes!");
  });

  // ── Drag & Drop ────────────────────────────────────────
  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function hitTest(pos) {
    for (let i = state.items.length - 1; i >= 0; i--) {
      const item = state.items[i];
      if (
        pos.x >= item.x &&
        pos.x <= item.x + item.w &&
        pos.y >= item.y &&
        pos.y <= item.y + item.h
      ) {
        return i;
      }
    }
    return -1;
  }

  canvas.addEventListener("mousedown", (e) => {
    const pos = getPos(e);
    const idx = hitTest(pos);
    if (idx !== -1) {
      state.dragging = idx;
      state.dragOffsetX = pos.x - state.items[idx].x;
      state.dragOffsetY = pos.y - state.items[idx].y;
      canvas.style.cursor = "grabbing";
    }
  });

  canvas.addEventListener("mousemove", (e) => {
    if (state.dragging === null) return;
    const pos = getPos(e);
    const item = state.items[state.dragging];
    item.x = Math.max(14, Math.min(canvas.width - item.w - 14, pos.x - state.dragOffsetX));
    item.y = Math.max(14, Math.min(canvas.height - item.h - 14, pos.y - state.dragOffsetY));
    drawRoom();
  });

  canvas.addEventListener("mouseup", () => {
    state.dragging = null;
    canvas.style.cursor = "crosshair";
  });

  canvas.addEventListener("mouseleave", () => {
    state.dragging = null;
    canvas.style.cursor = "crosshair";
  });

  // Touch
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const pos = getPos(e);
    const idx = hitTest(pos);
    if (idx !== -1) {
      state.dragging = idx;
      state.dragOffsetX = pos.x - state.items[idx].x;
      state.dragOffsetY = pos.y - state.items[idx].y;
    }
  }, { passive: false });

  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (state.dragging === null) return;
    const pos = getPos(e);
    const item = state.items[state.dragging];
    item.x = Math.max(14, Math.min(canvas.width - item.w - 14, pos.x - state.dragOffsetX));
    item.y = Math.max(14, Math.min(canvas.height - item.h - 14, pos.y - state.dragOffsetY));
    drawRoom();
  }, { passive: false });

  canvas.addEventListener("touchend", () => { state.dragging = null; });

  // ── Color swatches ─────────────────────────────────────
  document.querySelectorAll(".swatch").forEach((sw) => {
    sw.addEventListener("click", () => {
      document.querySelectorAll(".swatch").forEach((s) => s.classList.remove("selected"));
      sw.classList.add("selected");
      state.selectedColor = sw.dataset.color;
    });
  });

  // ── Material buttons ───────────────────────────────────
  document.querySelectorAll(".material-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".material-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.selectedMaterial = btn.dataset.material;
    });
  });

  // ── Size sliders ───────────────────────────────────────
  const widthSlider = document.getElementById("widthSlider");
  const depthSlider = document.getElementById("depthSlider");
  const widthVal = document.getElementById("widthVal");
  const depthVal = document.getElementById("depthVal");

  widthSlider?.addEventListener("input", () => {
    state.width = parseInt(widthSlider.value);
    if (widthVal) widthVal.textContent = state.width + " cm";
  });

  depthSlider?.addEventListener("input", () => {
    state.depth = parseInt(depthSlider.value);
    if (depthVal) depthVal.textContent = state.depth + " cm";
  });

  // ── Furniture picker ───────────────────────────────────
  document.querySelectorAll(".furniture-pick-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".furniture-pick-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.selectedFurniture = btn.dataset.furniture;
    });
  });

  // ── Init ───────────────────────────────────────────────
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
})();

/* ── Contact form ─────────────────────────────────────────── */
(function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const success = document.getElementById("formSuccess");
    if (success) success.style.display = "block";
    form.reset();
    showToast("Mesajul a fost trimis cu succes! Vă vom contacta în curând.");
    setTimeout(() => { if (success) success.style.display = "none"; }, 5000);
  });
})();

/* ── Toast notification ───────────────────────────────────── */
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

/* ── Smooth scroll for nav links ─────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});
