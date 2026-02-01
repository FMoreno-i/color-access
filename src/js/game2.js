/**
 * game2.js - Juego 2 "Empareja por patrón"
 * - Diseñado para daltónicos: el color puede engañar; el patrón (símbolo) manda.
 * - Permite cambiar el modo visual (normal/deuter/protan/tritan) EN MEDIO DE LA PARTIDA sin reiniciar nivel.
 * - "Reto" (trampa de color) puede cambiar (auto/none/redgreen/blueyellow). Cambiar reto sí reinicia el tablero (intencional).
 * - Sin emojis.
 */

(function () {
    const $ = (id) => document.getElementById(id);

    document.addEventListener("DOMContentLoaded", () => {
        // Aplicar modo guardado
        const mode = localStorage.getItem("colorMode") || "normal";
        window.colorManager?.setMode?.(mode);

        setupOverlayColorPicker();
        setupUI();
        startLevel(); // inicializa el tablero del nivel 1
    });

    // Navegación
    $("backBtn")?.addEventListener("click", () => (window.location.href = "main.html"));

    // UI refs
    const grid = $("grid");
    const levelEl = $("level");
    const pairsEl = $("pairs");
    const failsEl = $("fails");
    const msgEl = $("msg");
    const challengeModeEl = $("challengeMode");

    // Botón de colores (overlay)
    $("colorsBtn")?.addEventListener("click", () => {
        if (colorOverlay) closeColorModal();
        else openColorModal();
    });

    // Cambiar reto reinicia tablero (porque cambia el "tipo de trampa" del nivel)
    challengeModeEl?.addEventListener("change", () => {
        showMsg("Reto actualizado. Se reinició el tablero del nivel actual.");
        resetSelectionOnly();
        rebuildBoardForCurrentLevel(); // mantiene nivel, reinicia tablero del mismo nivel
    });

    // Patrones (símbolos)
    const SYMBOLS = ["●", "▲", "■", "✖", "◆", "★"];

    // Estado persistente (NO se pierde al cambiar modo visual)
    const state = {
        level: 1,
        matchedPairs: 0,
        totalPairs: 0,
        fails: 0,

        // cartas del tablero actual: {symbol, color, matched, element}
        cards: [],

        // selección actual
        firstCardIdx: null,
        lock: false
    };

    /* =========================
       Inicialización / Nivel
    ========================== */

    function setupUI() {
        updateInfo();
        hideMsg();
    }

    function startLevel() {
        state.matchedPairs = 0;
        state.fails = 0;
        resetSelectionOnly();
        buildNewBoardForLevel(state.level);
        renderBoardFromState();
        updateInfo();
        hideMsg();
    }

    function rebuildBoardForCurrentLevel() {
        // Mantiene level, reinicia tablero y conteos del nivel actual
        state.matchedPairs = 0;
        state.fails = 0;
        resetSelectionOnly();
        buildNewBoardForLevel(state.level);
        renderBoardFromState();
        updateInfo();
    }

    function buildNewBoardForLevel(level) {
        const symbolsCount = Math.min(2 + level, SYMBOLS.length);
        const usedSymbols = SYMBOLS.slice(0, symbolsCount);
        state.totalPairs = usedSymbols.length;

        const challenge = getChallengeMode();
        const colorPairs = buildColorPairs(challenge, usedSymbols);

        // Crear lista de símbolos duplicados
        const deck = shuffle([...usedSymbols, ...usedSymbols]);

        // Construir cartas con color asignado (queda fijo en el nivel)
        state.cards = deck.map((sym) => {
            const pair = colorPairs[sym];
            const color = pair ? pick(pair) : randomColor();
            return {
                symbol: sym,
                color,
                matched: false,
                element: null
            };
        });
    }

    /* =========================
       Render y UI (no reinicia)
    ========================== */

    function renderBoardFromState() {
        grid.innerHTML = "";

        state.cards.forEach((cardState, idx) => {
            const card = document.createElement("button");
            card.type = "button";
            card.className = "card";
            card.textContent = cardState.symbol;
            card.dataset.symbol = cardState.symbol;

            // Color "trampa" del nivel (fijo)
            card.style.color = cardState.color;

            if (cardState.matched) {
                card.classList.add("matched");
            }

            card.addEventListener("click", () => onPick(idx));

            cardState.element = card;
            grid.appendChild(card);
        });
    }

    function updateInfo() {
        levelEl.textContent = `Nivel: ${state.level}`;
        pairsEl.textContent = `Parejas: ${state.matchedPairs} / ${state.totalPairs}`;
        failsEl.textContent = `Errores: ${state.fails}`;
    }

    function showMsg(text) {
        if (!msgEl) return;
        msgEl.style.display = "block";
        msgEl.textContent = text;
    }

    function hideMsg() {
        if (!msgEl) return;
        msgEl.style.display = "none";
        msgEl.textContent = "";
    }

    function resetSelectionOnly() {
        state.firstCardIdx = null;
        state.lock = false;
        // limpiar selección visual
        state.cards.forEach((c) => c.element?.classList.remove("selected"));
    }

    /* =========================
       Lógica del juego
    ========================== */

    function onPick(idx) {
        if (state.lock) return;

        const c = state.cards[idx];
        if (!c || c.matched) return;

        // marcar selección
        c.element?.classList.add("selected");

        if (state.firstCardIdx == null) {
            state.firstCardIdx = idx;
            return;
        }

        // si clic en la misma carta, ignorar
        if (state.firstCardIdx === idx) return;

        state.lock = true;

        const first = state.cards[state.firstCardIdx];
        const second = c;

        const isMatch = first.symbol === second.symbol;

        if (isMatch) {
            first.matched = true;
            second.matched = true;
            first.element?.classList.add("matched");
            second.element?.classList.add("matched");
            state.matchedPairs += 1;

            showMsg("Coincidencia correcta. El patrón fue la pista principal.");
            endTurn();
            checkLevelComplete();
            return;
        }

        // no coincide
        state.fails += 1;
        showMsg("Coincidencia incorrecta. El color puede engañar, el patrón no.");

        // deseleccionar luego de un momento
        const firstIdx = state.firstCardIdx;
        setTimeout(() => {
            state.cards[firstIdx]?.element?.classList.remove("selected");
            second.element?.classList.remove("selected");
            endTurn();
        }, 600);

        updateInfo();
    }

    function endTurn() {
        state.firstCardIdx = null;
        state.lock = false;
        updateInfo();
    }

    function checkLevelComplete() {
        updateInfo();

        if (state.matchedPairs === state.totalPairs) {
            // sube nivel y genera nuevo tablero
            state.level += 1;
            showMsg("Nivel completado. Se incrementa la dificultad.");
            setTimeout(() => startLevel(), 800);
        }
    }

    /* =========================
       Modo reto (daltonismo)
    ========================== */

    function getChallengeMode() {
        const selected = (challengeModeEl?.value || "auto");

        if (selected !== "auto") return selected;

        // Auto según daltonismo detectado (del test)
        const dt = localStorage.getItem("daltonismType") || "normal";
        if (dt === "tritanopia") return "blueyellow";
        if (dt === "protanopia" || dt === "deuteranopia") return "redgreen";
        return "none";
    }

    /**
     * Retorna un mapa símbolo -> [colorA, colorB] para "trampa"
     * - none: null (color aleatorio por carta)
     * - redgreen: pares rojo/verde cercanos
     * - blueyellow: pares azul/amarillo cercanos
     */
    function buildColorPairs(challenge, usedSymbols) {
        const map = {};
        usedSymbols.forEach((s) => (map[s] = null));

        if (challenge === "none") return map;

        const RG = [
            ["hsl(20 70% 52%)", "hsl(120 42% 52%)"],
            ["hsl(30 65% 55%)", "hsl(110 40% 55%)"],
            ["hsl(15 60% 50%)", "hsl(130 38% 50%)"]
        ];

        const BY = [
            ["hsl(205 70% 50%)", "hsl(55 80% 55%)"],
            ["hsl(200 65% 52%)", "hsl(50 75% 58%)"],
            ["hsl(215 60% 48%)", "hsl(60 70% 55%)"]
        ];

        const pool = challenge === "blueyellow" ? BY : RG;

        usedSymbols.forEach((s, i) => {
            map[s] = pool[i % pool.length];
        });

        return map;
    }

    function randomColor() {
        const h = Math.floor(Math.random() * 360);
        return `hsl(${h} 65% 50%)`;
    }

    /* =========================
       Overlay de colores (no reinicia el nivel)
    ========================== */

    let colorOverlay = null;
    const optionsPanel = $("color-options");
    let optionsHome = null;

    function setupOverlayColorPicker() {
        if (!optionsPanel) return;

        optionsHome = optionsPanel.parentElement;

        optionsPanel.querySelectorAll(".color-option").forEach((opt) => {
            opt.addEventListener("click", () => {
                const mode = opt.getAttribute("data-mode");
                if (!mode) return;

                // Solo cambia visual + guarda. NO toca state.
                localStorage.setItem("colorMode", mode);
                window.colorManager?.setMode?.(mode);

                closeColorModal();

                // Mensaje opcional (no reinicia nada)
                showMsg("Modo visual aplicado. El progreso se mantiene.");
            });
        });
    }

    function openColorModal() {
        if (colorOverlay || !optionsPanel) return;

        colorOverlay = document.createElement("div");
        colorOverlay.className = "color-modal-overlay";

        optionsPanel.style.display = "block";
        optionsPanel.classList.remove("hidden");
        colorOverlay.appendChild(optionsPanel);

        document.body.appendChild(colorOverlay);
        requestAnimationFrame(() => colorOverlay.classList.add("open"));

        colorOverlay.addEventListener("click", closeColorModal);
        optionsPanel.addEventListener("click", stopOverlayClose);
        document.addEventListener("keydown", escOverlayClose);
    }

    function closeColorModal() {
        if (!colorOverlay || !optionsPanel) return;

        colorOverlay.classList.remove("open");

        optionsPanel.style.display = "none";
        optionsPanel.classList.add("hidden");
        optionsHome?.appendChild(optionsPanel);

        optionsPanel.removeEventListener("click", stopOverlayClose);
        document.removeEventListener("keydown", escOverlayClose);

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
       Utils
    ========================== */

    function pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function shuffle(arr) {
        // Fisher–Yates
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
})();
