/**
 * game3.js - Juego 3 "Semáforo accesible"
 * - Selector visible "Modo visual" (id="visualMode").
 * - Cambiar modo NO reinicia el juego.
 * - Además: cambia los colores del chip + botones (Correcto/Advertencia/Error)
 *   según el modo elegido para que sea más distinguible para daltónicos.
 * - Mantiene patrón + texto + icono (accesible).
 */

(function () {
    const $ = (id) => document.getElementById(id);

    // UI refs
    const chip = $("chip");
    const chipIcon = $("chipIcon");
    const chipText = $("chipText");

    const titleEl = $("title");
    const descEl = $("desc");
    const msgEl = $("msg");
    const timerText = $("timerText");

    const levelEl = $("level");
    const scoreEl = $("score");
    const streakEl = $("streak");

    const visualModeEl = $("visualMode");

    const btnOk = $("btnOk");
    const btnWarn = $("btnWarn");
    const btnErr = $("btnErr");

    // Botones
    $("backBtn")?.addEventListener("click", () => (window.location.href = "main.html"));
    $("restartBtn")?.addEventListener("click", () => resetGame());

    btnOk?.addEventListener("click", () => answer("ok"));
    btnWarn?.addEventListener("click", () => answer("warn"));
    btnErr?.addEventListener("click", () => answer("err"));

    // Estado del juego (persistente durante la sesión)
    const state = {
        level: 1,
        score: 0,
        streak: 0,

        current: null,
        timeLeft: 0,
        timer: null,

        // paleta activa del juego (se actualiza según visualMode)
        palette: null,
        mode: "normal",
    };

    // Dataset sin emojis
    const DATA = [
        { type: "ok",   title: "Conexion estable",          desc: "La red responde bien y no hay perdida de paquetes." },
        { type: "ok",   title: "Carga completada",          desc: "La operacion finalizo sin problemas." },
        { type: "ok",   title: "Cuenta verificada",         desc: "El usuario completo el proceso de verificacion." },
        { type: "ok",   title: "Actualizacion aplicada",    desc: "Los cambios se instalaron correctamente." },

        { type: "warn", title: "Bateria baja",              desc: "Quedan pocos minutos. Conecta el cargador pronto." },
        { type: "warn", title: "Latencia elevada",          desc: "La respuesta esta lenta, pero el servicio sigue activo." },
        { type: "warn", title: "Almacenamiento casi lleno", desc: "Libera espacio para evitar fallos." },
        { type: "warn", title: "Uso alto de CPU",           desc: "Se recomienda cerrar procesos o esperar a que baje la carga." },

        { type: "err",  title: "Error de autenticacion",    desc: "Credenciales incorrectas o token expirado." },
        { type: "err",  title: "Servicio no disponible",    desc: "No se puede conectar con el servidor." },
        { type: "err",  title: "Archivo corrupto",          desc: "El sistema no puede abrir el recurso solicitado." },
        { type: "err",  title: "Fallo de escritura",        desc: "No se pudo guardar el cambio en el sistema." }
    ];

    document.addEventListener("DOMContentLoaded", () => {
        // 1) Aplicar modo visual guardado (CSS)
        const saved = normalizeMode(localStorage.getItem("colorMode") || "normal");
        state.mode = saved;

        window.colorManager?.setMode?.(saved);

        // 2) Paleta del juego según modo
        state.palette = getPaletteForMode(saved);
        applyPaletteToUI();

        // 3) Sincronizar select "modo visual"
        if (visualModeEl) {
            visualModeEl.value = saved;

            visualModeEl.addEventListener("change", () => {
                const mode = normalizeMode(visualModeEl.value);
                state.mode = mode;

                localStorage.setItem("colorMode", mode);
                window.colorManager?.setMode?.(mode);

                // actualizar paleta interna del juego (chip + botones)
                state.palette = getPaletteForMode(mode);
                applyPaletteToUI();

                // NO reiniciar juego
                showMsg("Modo visual aplicado. Se ajustaron los colores del juego y el progreso se mantiene.");
            });
        }

        // 4) Iniciar
        updateStats();
        hideMsg();
        nextRound();
    });

    function normalizeMode(mode) {
        return (mode || "normal").toString().replace("color-mode-", "");
    }

    /* =========================================================
       PALETAS “SEGURAS” SEGÚN MODO
       Idea: evitar pares problemáticos:
         - protanopia / deuteranopia: evitar rojo vs verde
         - tritanopia: evitar azul vs amarillo
       Usamos combinaciones con alto contraste perceptual.
    ========================================================= */

    function getPaletteForMode(mode) {
        // Cada color tiene:
        // - solid: para bordes/texto
        // - bg: para fondo (suave)
        // - patternA/patternB: para patrón con gradiente
        const palettes = {
            normal: {
                ok:   { solid: "hsl(145 60% 35%)", bg: "hsla(145,60%,35%,.14)", patternA:"hsla(145,60%,35%,.22)", patternB:"hsla(145,60%,35%,.08)" },
                warn: { solid: "hsl(42 90% 40%)",  bg: "hsla(42,90%,40%,.16)",  patternA:"hsla(42,90%,40%,.25)",  patternB:"hsla(42,90%,40%,.10)" },
                err:  { solid: "hsl(3 75% 45%)",   bg: "hsla(3,75%,45%,.14)",   patternA:"hsla(3,75%,45%,.22)",   patternB:"hsla(3,75%,45%,.08)" }
            },

            // Para protanopia/deuteranopia: evitamos rojo/verde como diferencia principal.
            // Usamos AZUL / NARANJA / MORADO (más distinguibles).
            protanopia: {
                ok:   { solid: "hsl(210 85% 40%)", bg: "hsla(210,85%,40%,.14)", patternA:"hsla(210,85%,40%,.24)", patternB:"hsla(210,85%,40%,.08)" },
                warn: { solid: "hsl(28 90% 45%)",  bg: "hsla(28,90%,45%,.16)",  patternA:"hsla(28,90%,45%,.26)",  patternB:"hsla(28,90%,45%,.10)" },
                err:  { solid: "hsl(285 65% 45%)", bg: "hsla(285,65%,45%,.14)", patternA:"hsla(285,65%,45%,.24)", patternB:"hsla(285,65%,45%,.08)" }
            },
            deuteranopia: {
                ok:   { solid: "hsl(210 85% 40%)", bg: "hsla(210,85%,40%,.14)", patternA:"hsla(210,85%,40%,.24)", patternB:"hsla(210,85%,40%,.08)" },
                warn: { solid: "hsl(28 90% 45%)",  bg: "hsla(28,90%,45%,.16)",  patternA:"hsla(28,90%,45%,.26)",  patternB:"hsla(28,90%,45%,.10)" },
                err:  { solid: "hsl(285 65% 45%)", bg: "hsla(285,65%,45%,.14)", patternA:"hsla(285,65%,45%,.24)", patternB:"hsla(285,65%,45%,.08)" }
            },

            // Para tritanopia: evitamos azul vs amarillo como diferencia principal.
            // Usamos VERDE / ROJO / MORADO (y patrón).
            tritanopia: {
                ok:   { solid: "hsl(155 65% 35%)", bg: "hsla(155,65%,35%,.14)", patternA:"hsla(155,65%,35%,.24)", patternB:"hsla(155,65%,35%,.08)" },
                warn: { solid: "hsl(5 75% 45%)",   bg: "hsla(5,75%,45%,.14)",   patternA:"hsla(5,75%,45%,.24)",   patternB:"hsla(5,75%,45%,.08)" },
                err:  { solid: "hsl(275 70% 45%)", bg: "hsla(275,70%,45%,.14)", patternA:"hsla(275,70%,45%,.24)", patternB:"hsla(275,70%,45%,.08)" }
            }
        };

        return palettes[mode] || palettes.normal;
    }

    // Aplica estilo a botones y chip según la paleta
    function applyPaletteToUI() {
        if (!state.palette) return;

        // Botones: que sean distinguibles incluso si el usuario mira solo periferia
        stylePickButton(btnOk, state.palette.ok);
        stylePickButton(btnWarn, state.palette.warn);
        stylePickButton(btnErr, state.palette.err);

        // Chip se pinta al vuelo en applyChip(), aquí solo forzamos re-render si ya hay current
        if (state.current) applyChip(state.current.type);
    }

    function stylePickButton(btn, c) {
        if (!btn) return;
        btn.style.borderColor = "rgba(0,0,0,0.12)";
        btn.style.boxShadow = "none";
        btn.style.background = repeatingLinear(c.patternA, c.patternB);
        btn.style.color = "rgba(0,0,0,0.88)";
    }

    function repeatingLinear(a, b) {
        return `repeating-linear-gradient(45deg, ${a}, ${a} 10px, ${b} 10px, ${b} 20px)`;
    }

    /* =========================
       Rondas / Timer
    ========================== */

    function nextRound() {
        hideMsg();

        state.current = randomItem(DATA);

        // Chip accesible: icono + texto + patrón (clases ok/warn/err)
        applyChip(state.current.type);

        titleEl.textContent = state.current.title;
        descEl.textContent = state.current.desc;

        // Dificultad: menos tiempo al subir nivel
        const base = 7;
        state.timeLeft = Math.max(3, base - Math.floor(state.level / 2));

        startTimer();
    }

    function startTimer() {
        stopTimer();
        tick();
        state.timer = setInterval(tick, 1000);
    }

    function tick() {
        timerText.textContent = `Tiempo: ${state.timeLeft}s`;
        state.timeLeft -= 1;

        if (state.timeLeft < 0) {
            stopTimer();
            state.score = Math.max(0, state.score - 5);
            state.streak = 0;
            updateStats();
            showMsg("Tiempo agotado. Identifica el estado por texto, patron e icono.");
            setTimeout(nextRound, 850);
        }
    }

    function stopTimer() {
        if (state.timer) clearInterval(state.timer);
        state.timer = null;
    }

    /* =========================
       Respuestas
    ========================== */

    function answer(pick) {
        if (!state.current) return;

        stopTimer();

        if (pick === state.current.type) {
            state.streak += 1;
            state.score += 10 + Math.min(10, state.streak);

            // Subir nivel cada 3 aciertos seguidos
            if (state.streak % 3 === 0) state.level += 1;

            showMsg("Respuesta correcta. Se baso en texto, patron e icono.");
        } else {
            state.score = Math.max(0, state.score - 5);
            state.streak = 0;
            showMsg("Respuesta incorrecta. No dependas del color; lee el texto y el patron.");
        }

        updateStats();
        setTimeout(nextRound, 850);
    }

    function resetGame() {
        stopTimer();
        state.level = 1;
        state.score = 0;
        state.streak = 0;
        state.current = null;
        updateStats();
        hideMsg();
        nextRound();
    }

    /* =========================
       Chip accesible (usa paleta)
    ========================== */

    function applyChip(type) {
        chip.classList.remove("ok", "warn", "err");

        const p = state.palette || getPaletteForMode(state.mode);

        // Iconos sin emoji (más académico/serio)
        if (type === "ok") {
            chip.classList.add("ok");
            if (chipIcon) chipIcon.textContent = "[OK]";
            if (chipText) chipText.textContent = "CORRECTO";
            paintChip(p.ok);
        } else if (type === "warn") {
            chip.classList.add("warn");
            if (chipIcon) chipIcon.textContent = "[!]";
            if (chipText) chipText.textContent = "ADVERTENCIA";
            paintChip(p.warn);
        } else {
            chip.classList.add("err");
            if (chipIcon) chipIcon.textContent = "[X]";
            if (chipText) chipText.textContent = "ERROR";
            paintChip(p.err);
        }
    }

    function paintChip(c) {
        if (!chip) return;
        chip.style.borderColor = "rgba(0,0,0,0.12)";
        chip.style.background = repeatingLinear(c.patternA, c.patternB);
        chip.style.color = "rgba(0,0,0,0.9)";
    }

    /* =========================
       UI helpers
    ========================== */

    function updateStats() {
        levelEl.textContent = `Nivel: ${state.level}`;
        scoreEl.textContent = `Puntaje: ${state.score}`;
        streakEl.textContent = `Racha: ${state.streak}`;
    }

    function showMsg(text) {
        msgEl.style.display = "block";
        msgEl.textContent = text;
    }

    function hideMsg() {
        msgEl.style.display = "none";
        msgEl.textContent = "";
    }

    function randomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
})();
