/**
 * signup.js - Lógica para registro
 */

document.addEventListener("DOMContentLoaded", () => {
    setupPasswordToggle();
    setupSelectArrow();
    setupDaltonismSelect();
    setupSignupForm();
    updateColorModeDisplay();
});

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

/* Flecha del select ▼ / ▲ */
function setupSelectArrow() {
    const wrapper = document.getElementById("daltonismWrapper");
    const select = document.getElementById("daltonismType");
    if (!wrapper || !select) return;

    select.addEventListener("mousedown", () => wrapper.classList.add("open"));
    select.addEventListener("touchstart", () => wrapper.classList.add("open"));

    select.addEventListener("change", () => wrapper.classList.remove("open"));
    select.addEventListener("blur", () => wrapper.classList.remove("open"));
}

/* Guardar tipo de daltonismo + aplicar modo */
function setupDaltonismSelect() {
    const select = document.getElementById("daltonismType");
    if (!select) return;

    const saved = localStorage.getItem("colorMode") || "normal";
    select.value = saved;

    if (window.colorManager && saved !== "unknown") {
        window.colorManager.setMode(saved);
        window.colorManager.updateToggleButtonText();
    }

    select.addEventListener("change", () => {
        const v = select.value;
        localStorage.setItem("daltonismType", v);
        localStorage.setItem("colorMode", v);

        if (window.colorManager && v !== "unknown") {
            window.colorManager.setMode(v);
            window.colorManager.updateToggleButtonText();
        }
    });
}

function setupSignupForm() {
    const form = document.getElementById("signup-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        hideMessages();

        const fullname = document.getElementById("fullname").value.trim();
        const email = document.getElementById("email").value.trim();
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirmPassword").value.trim();

        const errors = [];
        if (!fullname) errors.push("El nombre completo es requerido");
        if (!email) errors.push("El correo es requerido");
        if (!username) errors.push("El usuario es requerido");
        if (!password) errors.push("La contraseña es requerida");
        if (password && password.length < 6) errors.push("La contraseña debe tener mínimo 6 caracteres");
        if (password !== confirmPassword) errors.push("Las contraseñas no coinciden");

        if (errors.length > 0) {
            showErrorMessage(errors.join("<br>"));
            return;
        }

        showSuccessMessage("Registro exitoso. Redirigiendo a login...");

        setTimeout(() => {
            window.location.href = "login.html";
        }, 800);
    });
}

function showErrorMessage(htmlMessage) {
    hideMessages();

    const div = document.createElement("div");
    div.id = "message";
    div.className = "message message-error";
    div.innerHTML = htmlMessage;

    const form = document.getElementById("signup-form");
    if (form) form.insertBefore(div, form.firstChild);
}

function showSuccessMessage(message) {
    hideMessages();

    const div = document.createElement("div");
    div.id = "message";
    div.className = "message message-success";
    div.textContent = message;

    const form = document.getElementById("signup-form");
    if (form) form.insertBefore(div, form.firstChild);
}

function hideMessages() {
    const msg = document.getElementById("message");
    if (msg) msg.remove();
}

function updateColorModeDisplay() {
    if (window.colorManager) {
        window.colorManager.updateToggleButtonText();
    }
}
