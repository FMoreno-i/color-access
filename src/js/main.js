let colorOverlay = null;
let optionsPanel = null;
let optionsHome = null;

document.addEventListener("DOMContentLoaded", () => {
    // Solo MAIN
    if (document.querySelector(".header-main")) {
        optionsPanel = document.getElementById("color-options");
        if (optionsPanel) optionsHome = optionsPanel.parentElement;

        setupTopbarActions();
        setupColorPickerInMain();
        setupQuickButtons();
    }

    applyUser();
    applySavedColorMode();
    setupFirstTimeModal();
});

/* =========================
   USER
========================= */
function applyUser() {
    const savedUser = localStorage.getItem("loggedUser") || "Usuario";
    const span = document.getElementById("mainUser");
    if (span) span.textContent = savedUser;
}

/* =========================
   COLOR - usa SOLO colorManager (una sola fuente de verdad)
========================= */
function applySavedColorMode() {
    const mode = localStorage.getItem("colorMode") || "normal";

    // Usa el manager siempre que exista
    if (window.colorManager && typeof window.colorManager.setMode === "function") {
        window.colorManager.setMode(mode);
        window.colorManager.updateToggleButtonText?.();
        return;
    }

    // Fallback si por alguna razón no cargó color-manager.js
    document.body.classList.remove(
        "color-mode-normal",
        "color-mode-deuteranopia",
        "color-mode-protanopia",
        "color-mode-tritanopia"
    );
    document.body.classList.add(`color-mode-${mode}`);
}

function setModeAndSave(mode) {
    localStorage.setItem("colorMode", mode);

    if (window.colorManager && typeof window.colorManager.setMode === "function") {
        window.colorManager.setMode(mode);
        window.colorManager.updateToggleButtonText?.();
    } else {
        applySavedColorMode();
    }
}

/* =========================
   MODAL DE COLORES (drawer)
========================= */
function openColorModal() {
    if (colorOverlay || !optionsPanel || !optionsHome) return;

    colorOverlay = document.createElement("div");
    colorOverlay.className = "color-modal-overlay";

    // mover panel dentro del overlay
    colorOverlay.appendChild(optionsPanel);

    // mostrar
    optionsPanel.classList.remove("hidden");
    document.body.appendChild(colorOverlay);

    requestAnimationFrame(() => colorOverlay.classList.add("open"));

    // cerrar click fuera
    colorOverlay.addEventListener("click", closeColorModal);

    // click dentro NO cierra
    optionsPanel.addEventListener("click", stopOverlayClose);

    // ESC cierra
    document.addEventListener("keydown", escOverlayClose);
}

function closeColorModal() {
    if (!colorOverlay || !optionsPanel || !optionsHome) return;

    colorOverlay.classList.remove("open");

    // devolver al padre original
    optionsHome.appendChild(optionsPanel);

    // ocultar panel
    optionsPanel.classList.add("hidden");

    // limpiar listeners
    optionsPanel.removeEventListener("click", stopOverlayClose);
    document.removeEventListener("keydown", escOverlayClose);

    // borrar overlay
    colorOverlay.remove();
    colorOverlay = null;
}

function stopOverlayClose(e) {
    e.stopPropagation();
}

function escOverlayClose(e) {
    if (e.key === "Escape") closeColorModal();
}

/* =========================
   TOPBAR: settings + logout
========================= */
function setupTopbarActions() {
    const settingsBtn = document.getElementById("settingsBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("loggedUser");
            localStorage.removeItem("isLoggedIn"); // ✅ importante
            window.location.href = "login.html";
        });
    }

    if (!settingsBtn) return;

    settingsBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (colorOverlay) closeColorModal();
        else openColorModal();
    });
}

/* =========================
   PICKER: click en opción de color
========================= */
function setupColorPickerInMain() {
    if (!optionsPanel) return;

    optionsPanel.querySelectorAll(".color-option").forEach((opt) => {
        opt.addEventListener("click", () => {
            const mode = opt.getAttribute("data-mode");
            if (!mode) return;

            setModeAndSave(mode); // ✅ aplica + guarda usando el manager
            closeColorModal();    // ✅ cierra overlay
        });
    });
}

/* =========================
   BOTONES RÁPIDOS
========================= */
function setupQuickButtons() {
    const openTestBtn = document.getElementById("openTestBtn");
    if (openTestBtn) {
        openTestBtn.addEventListener("click", () => {
            window.location.href = "test.html";
        });
    }
}

/* =========================
   MODAL FIRST TIME
========================= */
function setupFirstTimeModal() {
    const overlay = document.getElementById("firstTimeModal");
    const btnNo = document.getElementById("modalNo");
    const btnYes = document.getElementById("modalYes");

    if (!overlay || !btnNo || !btnYes) return;

    const openModal = () => {
        overlay.style.display = "flex";
        overlay.setAttribute("aria-hidden", "false");
    };

    const closeModal = () => {
        overlay.style.display = "none";
        overlay.setAttribute("aria-hidden", "true");
    };

    const alreadySeen = localStorage.getItem("firstTimeDone") === "true";
    if (!alreadySeen) openModal();

    const closeAndRemember = () => {
        localStorage.setItem("firstTimeDone", "true");
        closeModal();
    };

    btnNo.addEventListener("click", (e) => {
        e.preventDefault();
        closeAndRemember();
    });

    btnYes.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.setItem("firstTimeDone", "true");
        window.location.href = "test.html";
    });

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeAndRemember();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay.style.display === "flex") {
            closeAndRemember();
        }
    });
}
