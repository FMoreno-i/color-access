(function () {
    const $ = (id) => document.getElementById(id);

    document.addEventListener("DOMContentLoaded", () => {
        // aplica modo guardado
        const mode = localStorage.getItem("colorMode") || "normal";
        window.colorManager?.setMode?.(mode);

        setupOverlayColorPicker();
        setup();
        newRound();
    });

    const boardEl = $("board");
    const levelEl = $("level");
    const scoreEl = $("score");
    const deltaEl = $("delta");
    const msgEl = $("msg");

    const trainingModeEl = $("trainingMode");
    const assistToggleEl = $("assistToggle");

    $("backBtn")?.addEventListener("click", () => (window.location.href = "main.html"));
    $("restartBtn")?.addEventListener("click", () => reset());

    $("easierBtn")?.addEventListener("click", () => { delta += 6; newRound(); });
    $("harderBtn")?.addEventListener("click", () => { delta = Math.max(6, delta - 4); newRound(); });

    trainingModeEl?.addEventListener("change", () => newRound());
    assistToggleEl?.addEventListener("change", () => newRound());

    // botón para abrir colores en medio juego
    $("colorsBtn")?.addEventListener("click", () => {
        if (colorOverlay) closeColorModal();
        else openColorModal();
    });

    let level = 1;
    let score = 0;
    let delta = 28;
    let oddIndex = 0;

    // overlay de colores
    let colorOverlay = null;
    let optionsPanel = $("color-options");
    let optionsHome = null;

    function setup() {
        boardEl.innerHTML = "";
    }

    function reset() {
        level = 1;
        score = 0;
        delta = 28;
        hideMsg();
        newRound();
    }

    function newRound() {
        hideMsg();

        const size = level <= 2 ? 5 : 6;
        const cells = size * size;

        // Ajuste de tamaño (igual que antes)
        boardEl.style.gridTemplateColumns = `repeat(${size}, 52px)`;

        // Modo de entrenamiento
        const mode = (trainingModeEl?.value || "auto");
        const daltonism = localStorage.getItem("daltonismType") || "normal";

        const realTrainingMode = (mode === "auto")
            ? inferTrainingMode(daltonism)
            : mode;

        // Asistencia: alto contraste / invertir
        const assist = !!assistToggleEl?.checked;

        // Genera colores dependiendo del tipo
        const colors = generateColors(realTrainingMode, delta, assist);

        oddIndex = rand(0, cells - 1);

        boardEl.innerHTML = "";
        for (let i = 0; i < cells; i++) {
            const cell = document.createElement("button");
            cell.type = "button";
            cell.className = "cell";
            cell.style.background = i === oddIndex ? colors.odd : colors.normal;
            cell.setAttribute("aria-label", "Celda del tablero");
            cell.addEventListener("click", () => pick(i));
            boardEl.appendChild(cell);
        }

        renderStats(realTrainingMode, assist);
    }

    function pick(i) {
        if (i === oddIndex) {
            score += 10;
            level += 1;
            delta = Math.max(6, delta - 2);
            showMsg("¡Correcto! Subes de nivel.");
            setTimeout(newRound, 550);
        } else {
            score = Math.max(0, score - 5);
            delta += 2;
            showMsg("Casi. Ajusté un poco la diferencia para ayudarte.");
            setTimeout(newRound, 650);
        }
        renderStats();
    }

    function renderStats(trainingMode, assist) {
        levelEl.textContent = `Nivel: ${level}`;
        scoreEl.textContent = `Puntaje: ${score}`;
        deltaEl.textContent = `Diferencia: ${delta}${assist ? " (asistido)" : ""}${trainingMode ? " · " + labelMode(trainingMode) : ""}`;
    }

    function labelMode(m) {
        return {
            luminance: "Contraste",
            redgreen: "Rojo–Verde",
            blueyellow: "Azul–Amarillo"
        }[m] || "Auto";
    }

    function inferTrainingMode(daltonismType) {
        if (daltonismType === "tritanopia") return "blueyellow";
        if (daltonismType === "protanopia" || daltonismType === "deuteranopia") return "redgreen";
        return "luminance";
    }

    /**
     * Genera colores base y odd según modo:
     * - luminance: misma tonalidad, cambia principalmente L
     * - redgreen: tonos entre rojo/verde que se confunden
     * - blueyellow: tonos entre azul/amarillo
     */
    function generateColors(trainingMode, delta, assist) {
        // si asistencia: sube diferencia efectiva
        const effectiveDelta = assist ? Math.max(delta, 26) : delta;

        if (trainingMode === "redgreen") {
            // base cerca de 20° (rojo/naranja) vs 120° (verde)
            const baseChoice = Math.random() < 0.5 ? "red" : "green";
            const baseH = baseChoice === "red" ? rand(10, 35) : rand(105, 140);
            const oddH  = baseChoice === "red" ? rand(105, 140) : rand(10, 35);

            const s = 60 + rand(-8, 8);
            const l = 52 + rand(-6, 6);

            // odd y normal con luminancia parecida, cambia más el tono (más desafiante)
            const normal = `hsl(${baseH} ${s}% ${l}%)`;
            const odd = `hsl(${oddH} ${s}% ${l}%)`;

            // asistencia: también cambia luminancia para hacerlo más obvio
            if (assist) {
                const oddL = clamp(l + (Math.random() < 0.5 ? -1 : 1) * (effectiveDelta / 2), 18, 82);
                return { normal, odd: `hsl(${oddH} ${s}% ${oddL}%)` };
            }
            return { normal, odd };
        }

        if (trainingMode === "blueyellow") {
            // base cerca de azul (200°) vs amarillo (55°)
            const baseChoice = Math.random() < 0.5 ? "blue" : "yellow";
            const baseH = baseChoice === "blue" ? rand(190, 220) : rand(45, 65);
            const oddH  = baseChoice === "blue" ? rand(45, 65) : rand(190, 220);

            const s = 65 + rand(-8, 8);
            const l = 55 + rand(-6, 6);

            const normal = `hsl(${baseH} ${s}% ${l}%)`;
            const odd = `hsl(${oddH} ${s}% ${l}%)`;

            if (assist) {
                const oddL = clamp(l + (Math.random() < 0.5 ? -1 : 1) * (effectiveDelta / 2), 18, 82);
                return { normal, odd: `hsl(${oddH} ${s}% ${oddL}%)` };
            }
            return { normal, odd };
        }

        // default: luminance/contrast
        const h = rand(0, 360);
        const s = 55 + rand(-10, 10);
        const l = 55 + rand(-8, 8);

        // si asistencia: odd se separa más en L
        const jump = assist ? Math.max(effectiveDelta, 28) : effectiveDelta;
        const oddL = clamp(l + (Math.random() < 0.5 ? -1 : 1) * (jump / 2), 18, 82);

        return {
            normal: `hsl(${h} ${s}% ${l}%)`,
            odd: `hsl(${h} ${s}% ${oddL}%)`
        };
    }

    /* =====================
       Overlay Color Picker (cambiar modo visual en mitad del juego)
    ====================== */
    function setupOverlayColorPicker() {
        if (!optionsPanel) return;

        optionsHome = optionsPanel.parentElement;

        optionsPanel.querySelectorAll(".color-option").forEach(opt => {
            opt.addEventListener("click", () => {
                const mode = opt.getAttribute("data-mode");
                if (!mode) return;

                // guarda y aplica con el manager (usa tu CSS)
                localStorage.setItem("colorMode", mode);
                window.colorManager?.setMode?.(mode);

                closeColorModal();
            });
        });
    }

    function openColorModal() {
        if (colorOverlay || !optionsPanel) return;

        // sacar el panel de donde esté y mostrarlo en overlay
        colorOverlay = document.createElement("div");
        colorOverlay.className = "color-modal-overlay";

        // muestra y mete dentro overlay
        optionsPanel.style.display = "block";
        optionsPanel.classList.remove("hidden");
        colorOverlay.appendChild(optionsPanel);

        document.body.appendChild(colorOverlay);
        requestAnimationFrame(() => colorOverlay.classList.add("open"));

        // cerrar click fuera
        colorOverlay.addEventListener("click", closeColorModal);

        // click dentro no cierra
        optionsPanel.addEventListener("click", stopOverlayClose);

        // ESC
        document.addEventListener("keydown", escOverlayClose);
    }

    function closeColorModal() {
        if (!colorOverlay || !optionsPanel) return;

        colorOverlay.classList.remove("open");

        // devolver al lugar original
        optionsPanel.style.display = "none";
        optionsPanel.classList.add("hidden");
        optionsHome.appendChild(optionsPanel);

        optionsPanel.removeEventListener("click", stopOverlayClose);
        document.removeEventListener("keydown", escOverlayClose);

        colorOverlay.remove();
        colorOverlay = null;
    }

    function stopOverlayClose(e) { e.stopPropagation(); }
    function escOverlayClose(e) { if (e.key === "Escape") closeColorModal(); }

    /* ===================== */
    function showMsg(t) {
        msgEl.style.display = "block";
        msgEl.textContent = t;
    }
    function hideMsg() {
        msgEl.style.display = "none";
        msgEl.textContent = "";
    }
    function rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    function clamp(x, a, b) {
        return Math.max(a, Math.min(b, x));
    }
})();
