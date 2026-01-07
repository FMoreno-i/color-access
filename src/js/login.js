/**
 * Login.js - Lógica específica para la página de inicio de sesión
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeLoginPage();
});

function initializeLoginPage() {
    setupFormValidation();
    setupRegisterLink();
    updateColorModeDisplay();
}

/**
 * Configura la validación del formulario de login
 */
function setupFormValidation() {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (validateLoginForm(username, password)) {
                // Simular proceso de login (sin backend)
                handleLoginSuccess(username);
            }
        });
    }
}

/**
 * Valida los campos del formulario
 */
function validateLoginForm(username, password) {
    let isValid = true;
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

    hideErrorMessage();
    return true;
}

/**
 * Resalta o quita el resaltado de un campo
 */
function highlightField(fieldId, highlight) {
    const field = document.getElementById(fieldId);
    if (field) {
        if (highlight) {
            field.style.borderColor = '#e74c3c';
            field.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.2)';
        } else {
            field.style.borderColor = '#ddd';
            field.style.boxShadow = 'none';
        }
    }
}

/**
 * Muestra mensaje de error
 */
function showErrorMessage(message) {
    hideErrorMessage(); // Remover mensaje anterior si existe

    const errorDiv = document.createElement('div');
    errorDiv.id = 'error-message';
    errorDiv.innerHTML = message;
    errorDiv.style.cssText = `
        background-color: #f8d7da;
        color: #721c24;
        padding: 10px;
        border-radius: 5px;
        margin-bottom: 1rem;
        border: 1px solid #f5c6cb;
        font-size: 0.9rem;
    `;

    const form = document.getElementById('login-form');
    if (form) {
        form.insertBefore(errorDiv, form.firstChild);
    }
}

/**
 * Oculta mensaje de error
 */
function hideErrorMessage() {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
}

/**
 * Maneja el login exitoso
 */
function handleLoginSuccess(username) {
    // Mostrar mensaje de éxito
    showSuccessMessage(`¡Bienvenido ${username}! Redirigiendo...`);

    // Simular redirección después de 2 segundos
    setTimeout(() => {
        // En una aplicación real, aquí iría la navegación a la página principal
        alert('Funcionalidad completa próximamente. Por ahora solo tenemos la pantalla de login con cambio de colores.');
    }, 2000);
}

/**
 * Muestra mensaje de éxito
 */
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.id = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = `
        background-color: #d4edda;
        color: #155724;
        padding: 10px;
        border-radius: 5px;
        margin-bottom: 1rem;
        border: 1px solid #c3e6cb;
        font-size: 0.9rem;
        text-align: center;
    `;

    const form = document.getElementById('login-form');
    if (form) {
        form.insertBefore(successDiv, form.firstChild);
    }
}

/**
 * Configura el enlace de registro
 */
function setupRegisterLink() {
    const registerLink = document.getElementById('register-link');

    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Funcionalidad de registro próximamente. Por ahora solo tenemos la pantalla de login con cambio de colores.');
        });
    }
}

/**
 * Actualiza la visualización del modo de color actual
 */
function updateColorModeDisplay() {
    // Esta función se llama cuando se carga la página para actualizar el botón
    if (window.colorManager) {
        window.colorManager.updateToggleButtonText();
    }
}
