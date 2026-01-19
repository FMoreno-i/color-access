/**
 * Login.js - Lógica específica para la página de inicio de sesión
 */

document.addEventListener('DOMContentLoaded', function () {
    initializeLoginPage();
});

function initializeLoginPage() {
    applySavedColorMode();          // ✅ NUEVO: aplica color guardado del usuario
    setupColorPersistence();            // ✅ NUEVO: guarda el modo al elegirlo
    setupFormValidation();
    setupPasswordToggle();
    updateColorModeDisplay();
}

/* =========================
   ✅ COLOR persistente
   - Lee y aplica localStorage.colorMode
========================= */
function applySavedColorMode() {
    const savedMode = localStorage.getItem("colorMode");
    if (!savedMode) return;

    if (window.colorManager && typeof window.colorManager.setMode === "function") {
        window.colorManager.setMode(savedMode);
        return;
    }

    // fallback por clases
    document.body.classList.remove(
        "color-mode-normal",
        "color-mode-deuteranopia",
        "color-mode-protanopia",
        "color-mode-tritanopia"
    );
    document.body.classList.add(`color-mode-${savedMode}`);
}

/* ✅ Guarda y aplica cuando el usuario elige modo */
function setModeAndSave(mode) {
    localStorage.setItem("colorMode", mode);

    if (window.colorManager && typeof window.colorManager.setMode === "function") {
        window.colorManager.setMode(mode);
    } else {
        applySavedColorMode();
    }

    updateColorModeDisplay();
}

/* ✅ Manejo del selector de colores en login.html */
function setupColorPicker() {
    const toggleBtn = document.getElementById("color-toggle-btn");
    const options = document.getElementById("color-options");
    if (!toggleBtn || !options) return;

    // abrir/cerrar panel
    toggleBtn.addEventListener("click", () => {
        options.classList.toggle("hidden");
    });

    // elegir modo
    options.querySelectorAll(".color-option").forEach(opt => {
        opt.addEventListener("click", () => {
            const mode = opt.getAttribute("data-mode");
            if (!mode) return;

            setModeAndSave(mode);
            options.classList.add("hidden");
        });
    });

    // cerrar al click fuera
    document.addEventListener("click", (e) => {
        if (options.classList.contains("hidden")) return;
        if (e.target.closest(".color-accessibility-section")) return;
        options.classList.add("hidden");
    });
}
function applySavedColorMode() {
    const savedMode = localStorage.getItem("colorMode");
    if (!savedMode) return;

    if (window.colorManager && typeof window.colorManager.setMode === "function") {
        window.colorManager.setMode(savedMode);
    } else {
        document.body.classList.remove(
            "color-mode-normal",
            "color-mode-deuteranopia",
            "color-mode-protanopia",
            "color-mode-tritanopia"
        );
        document.body.classList.add(`color-mode-${savedMode}`);
    }
}

function setupColorPersistence() {
    const options = document.getElementById("color-options");
    if (!options) return;

    options.querySelectorAll(".color-option").forEach(opt => {
        opt.addEventListener("click", () => {
            const mode = opt.getAttribute("data-mode");
            if (!mode) return;

            // ✅ guardar para que sea igual en main/home
            localStorage.setItem("colorMode", mode);

            // ✅ aplicar usando tu manager (sin tocar el botón)
            if (window.colorManager && typeof window.colorManager.setMode === "function") {
                window.colorManager.setMode(mode);
                if (typeof window.colorManager.updateToggleButtonText === "function") {
                    window.colorManager.updateToggleButtonText();
                }
            } else {
                applySavedColorMode();
            }
        });
    });
}

function setupFormValidation() {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (validateLoginForm(username, password)) {
                handleLoginSuccess(username);
            }
        });
    }
}

/* Toggle de contraseña con iconos */
function setupPasswordToggle() {
    document.querySelectorAll(".password-toggle").forEach(btn => {
        btn.addEventListener("click", () => {
            const input = document.getElementById(btn.dataset.target);
            if (!input) return;

            const eye = btn.querySelector(".icon-eye");
            const eyeOff = btn.querySelector(".icon-eye-off");

            const show = input.type === "password";
            input.type = show ? "text" : "password";

            if (eye && eyeOff) {
                eye.style.display = show ? "none" : "block";
                eyeOff.style.display = show ? "block" : "none";
            }
        });
    });
}

function validateLoginForm(username, password) {
    const errors = [];

    if (!username) {
        errors.push('El nombre de usuario es requerido');
        highlightField('username', true);
    } else {
        highlightField('username', false);
    }

    if (!password) {
        errors.push('La contraseña es requerida');
        highlightField('password', true);
    } else {
        highlightField('password', false);
    }

    if (errors.length > 0) {
        showErrorMessage(errors.join('<br>'));
        return false;
    }

    hideMessages();
    return true;
}

function highlightField(fieldId, highlight) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    if (highlight) {
        field.style.borderColor = '#e74c3c';
        field.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.2)';
    } else {
        field.style.borderColor = '';
        field.style.boxShadow = '';
    }
}

function showErrorMessage(htmlMessage) {
    hideMessages();

    const errorDiv = document.createElement('div');
    errorDiv.id = 'message';
    errorDiv.className = 'message message-error';
    errorDiv.innerHTML = htmlMessage;

    const form = document.getElementById('login-form');
    if (form) form.insertBefore(errorDiv, form.firstChild);
}

function showSuccessMessage(message) {
    hideMessages();

    const successDiv = document.createElement('div');
    successDiv.id = 'message';
    successDiv.className = 'message message-success';
    successDiv.textContent = message;

    const form = document.getElementById('login-form');
    if (form) form.insertBefore(successDiv, form.firstChild);
}

function hideMessages() {
    const msg = document.getElementById('message');
    if (msg) msg.remove();
}

function handleLoginSuccess(username) {
    showSuccessMessage(`¡Bienvenido ${username}!`);

    localStorage.setItem("loggedUser", username);
    localStorage.setItem("isLoggedIn", "true");

    // ✅ FORZAR MODAL cada login
    localStorage.removeItem("firstTimeDone");

    setTimeout(() => {
        window.location.href = "main.html";
    }, 800);
}


function updateColorModeDisplay() {
    if (window.colorManager && typeof window.colorManager.updateToggleButtonText === "function") {
        window.colorManager.updateToggleButtonText();
    }
}
