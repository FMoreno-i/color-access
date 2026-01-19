/**
 * color-manager.js
 * Maneja el cambio de modos de color y persiste en localStorage
 */
(function () {
    const MODES = ["normal", "deuteranopia", "protanopia", "tritanopia"];

    function setBodyMode(mode) {
        const body = document.body;

        body.classList.remove(
            "color-mode-normal",
            "color-mode-deuteranopia",
            "color-mode-protanopia",
            "color-mode-tritanopia"
        );

        if (MODES.includes(mode)) {
            body.classList.add("color-mode-" + mode);
            localStorage.setItem("colorMode", mode);
        } else {
            body.classList.add("color-mode-normal");
            localStorage.setItem("colorMode", "normal");
        }
    }

    function getSavedMode() {
        const saved = localStorage.getItem("colorMode");
        if (saved && MODES.includes(saved)) return saved;
        return "normal";
    }

    function toggleOptions() {
        const options = document.getElementById("color-options");
        if (!options) return;
        options.classList.toggle("hidden");
    }

    function setupColorUI() {
        const toggleBtn = document.getElementById("color-toggle-btn");
        const options = document.getElementById("color-options");

        if (toggleBtn) toggleBtn.addEventListener("click", toggleOptions);

        if (options) {
            options.querySelectorAll(".color-option").forEach(opt => {
                opt.addEventListener("click", () => {
                    const mode = opt.getAttribute("data-mode");
                    setBodyMode(mode);
                    options.classList.add("hidden");
                    updateToggleButtonText();
                });
            });
        }

        // Cierra panel al click fuera
        document.addEventListener("click", (e) => {
            if (!options || options.classList.contains("hidden")) return;
            if (e.target.closest(".color-accessibility-section")) return;
            options.classList.add("hidden");
        });
    }

    function updateToggleButtonText() {
        const btn = document.getElementById("color-toggle-btn");
        if (!btn) return;

        const mode = getSavedMode();
        const label = {
            normal: "Normal",
            deuteranopia: "Deuteranopía",
            protanopia: "Protanopía",
            tritanopia: "Tritanopía"
        }[mode];

        btn.textContent = "CAMBIAR COLORES (" + label + ")";
    }

    document.addEventListener("DOMContentLoaded", () => {
        setBodyMode(getSavedMode());
        setupColorUI();
        updateToggleButtonText();
    });

    window.colorManager = { setMode: setBodyMode, getMode: getSavedMode, updateToggleButtonText };
})();
