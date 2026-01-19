let colorOverlay = null;
let optionsPanel = null;
let optionsHome = null; // 👈 padre original

document.addEventListener("DOMContentLoaded", () => {
    // Solo MAIN
    if (document.querySelector(".header-main")) {
        optionsPanel = document.getElementById("color-options");
        if (optionsPanel) optionsHome = optionsPanel.parentElement; // 👈 guardar una sola vez

        setupTopbarActions();
        setupColorPickerInMain();
    }

    applyUser();
    applySavedColorMode();
    setupFirstTimeModal();
});

function applySavedColorMode() {
    const mode = localStorage.getItem("colorMode") || "normal";
    applyMode(mode);
}

function applyMode(mode) {
    // normaliza por si llega "color-mode-xxx"
    mode = (mode || "normal").toString().replace("color-mode-", "");

    // ✅ Quitar cualquier modo previo (importante)
    document.body.classList.remove(
        "color-mode-normal",
        "color-mode-deuteranopia",
        "color-mode-protanopia",
        "color-mode-tritanopia"
    );

    // ✅ Poner el nuevo modo
    document.body.classList.add(`color-mode-${mode}`);

    // ✅ Debug (para ver en consola)
    console.log("Modo aplicado:", mode, "Body class:", document.body.className);
}


function openColorModal() {
    if (colorOverlay || !optionsPanel || !optionsHome) return;

    colorOverlay = document.createElement("div");
    colorOverlay.className = "color-modal-overlay";

    // meter panel dentro del overlay
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

    // devolver SIEMPRE al padre original
    optionsHome.appendChild(optionsPanel);

    // ocultar panel para que no quede abajo visible
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


function applyUser() {
    const savedUser = localStorage.getItem("loggedUser") || "Usuario";
    const span = document.getElementById("mainUser");
    if (span) span.textContent = savedUser;
}

/* =========================
   ✅ COLOR: aplicar lo elegido en login
   - Usa localStorage.colorMode (misma key para login/signup/main)
========================= */
function applySavedColorMode() {
    const mode = localStorage.getItem("colorMode") || "normal";

    // Si existe colorManager, él manda
    if (window.colorManager && typeof window.colorManager.setMode === "function") {
        window.colorManager.setMode(mode);

        // si tu manager tiene texto/botón, lo actualiza
        if (typeof window.colorManager.updateToggleButtonText === "function") {
            window.colorManager.updateToggleButtonText();
        }
        return;
    }

    // fallback por clases en body
    document.body.classList.remove(
        "color-mode-normal",
        "color-mode-deuteranopia",
        "color-mode-protanopia",
        "color-mode-tritanopia"
    );
    document.body.classList.add(`color-mode-${mode}`);
}

/* ✅ Guardar + aplicar */
function setModeAndSave(mode) {
    localStorage.setItem("colorMode", mode);
    applySavedColorMode();
}

/**
 * Modal:
 * - Si quieres que salga SIEMPRE al iniciar sesión:
 *   en login.js pon: localStorage.removeItem("firstTimeDone");
 * - Aquí lo dejamos con lógica firstTimeDone.
 */
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

    // ✅ se muestra si firstTimeDone NO es true
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


function setupTopbarActions() {
    const settingsBtn = document.getElementById("settingsBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("loggedUser");
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


function setupColorPickerInMain() {
    if (!optionsPanel) return;

    optionsPanel.querySelectorAll(".color-option").forEach(opt => {
        opt.addEventListener("click", () => {
            const mode = opt.getAttribute("data-mode");
            if (!mode) return;

            localStorage.setItem("colorMode", mode);
            applyMode(mode);          // ✅ cambia el color SIEMPRE
            closeColorModal();        // ✅ se cierra y luego puedes abrir otra vez sin refrescar
        });
    });
}


function toggleColorOptions(forceOpen) {
    const options = document.getElementById("color-options");
    if (!options) return;

    // forceOpen: true => abre, false => cierra, undefined => toggle
    if (forceOpen === true) {
        options.classList.remove("hidden");
    } else if (forceOpen === false) {
        options.classList.add("hidden");
    } else {
        options.classList.toggle("hidden");
    }
}

function setupQuickButtons() {
    const openTestBtn = document.getElementById("openTestBtn");
    const openColorsBtn = document.getElementById("openColorsBtn");

    if (openTestBtn) {
        openTestBtn.addEventListener("click", () => {
            window.location.href = "test.html";
        });
    }

    if (openColorsBtn) {
        openColorsBtn.addEventListener("click", () => {
            toggleColorOptions();
        });
    }
}
