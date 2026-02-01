/**
 * test.js - Test orientativo de daltonismo (NO diagnóstico médico)
 * - Placas tipo Ishihara generadas con Canvas (sin imágenes externas)
 * - NO redibuja la placa al seleccionar una opción
 * - Placas determinísticas (si vuelves atrás no cambian)
 * - Resultado casi siempre clasifica (indeterminado muy raro)
 * - Guarda daltonismType y aplica automáticamente el colorMode (CSS)
 */
(function () {
    const $ = (id) => document.getElementById(id);

    // --- (Opcional) guard de sesión ---
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
        window.location.href = "login.html";
        return;
    }

    // ---- Paletas (dos grupos de colores para los puntos) ----
    const palette = {
        controlA: ["#2C3E50", "#34495E", "#22313F"],
        controlB: ["#8E44AD", "#9B59B6", "#7D3C98"],

        redGreenA: ["#D35400", "#E67E22", "#CA6F1E"], // naranja/rojo
        redGreenB: ["#1E8449", "#27AE60", "#239B56"], // verdes

        protanA: ["#C0392B", "#E74C3C", "#CD6155"],   // rojos
        protanB: ["#7DCEA0", "#52BE80", "#27AE60"],   // verdes claros

        deutanA: ["#2ECC71", "#27AE60", "#58D68D"],   // verdes
        deutanB: ["#F39C12", "#F5B041", "#D68910"],   // amarillos/naranjas

        tritanA: ["#2874A6", "#3498DB", "#2E86C1"],   // azules
        tritanB: ["#F4D03F", "#F7DC6F", "#D4AC0D"]    // amarillos
    };

    // ---- Data del test ----
    // correctIndex: índice de la opción correcta (lo que "normalmente" se ve)
    const PLATES = [
        {
            id: "C1",
            type: "control",
            label: "Placa 1 (control)",
            target: "12",
            options: ["12", "8", "3", "No veo nada"],
            correctIndex: 0,
            generator: (ctx, seed) => drawNumberPlate(ctx, "12", palette.controlA, palette.controlB, seed)
        },
        {
            id: "RG1",
            type: "rg",
            label: "Placa 2",
            target: "7",
            options: ["7", "1", "4", "No veo nada"],
            correctIndex: 0,
            generator: (ctx, seed) => drawNumberPlate(ctx, "7", palette.redGreenA, palette.redGreenB, seed)
        },
        {
            id: "RG2",
            type: "rg",
            label: "Placa 3",
            target: "45",
            options: ["45", "29", "15", "No veo nada"],
            correctIndex: 0,
            generator: (ctx, seed) => drawNumberPlate(ctx, "45", palette.redGreenB, palette.redGreenA, seed)
        },
        {
            id: "P1",
            type: "protan",
            label: "Placa 4",
            target: "6",
            options: ["6", "8", "No veo nada", "2"],
            correctIndex: 0,
            generator: (ctx, seed) => drawNumberPlate(ctx, "6", palette.protanA, palette.protanB, seed)
        },
        {
            id: "D1",
            type: "deutan",
            label: "Placa 5",
            target: "3",
            options: ["3", "5", "No veo nada", "9"],
            correctIndex: 0,
            generator: (ctx, seed) => drawNumberPlate(ctx, "3", palette.deutanA, palette.deutanB, seed)
        },
        {
            id: "T1",
            type: "tritan",
            label: "Placa 6",
            target: "16",
            options: ["16", "18", "No veo nada", "10"],
            correctIndex: 0,
            generator: (ctx, seed) => drawNumberPlate(ctx, "16", palette.tritanA, palette.tritanB, seed)
        },
        {
            id: "T2",
            type: "tritan",
            label: "Placa 7",
            target: "2",
            options: ["2", "5", "No veo nada", "7"],
            correctIndex: 0,
            generator: (ctx, seed) => drawNumberPlate(ctx, "2", palette.tritanB, palette.tritanA, seed)
        },
        {
            id: "RG3",
            type: "rg",
            label: "Placa 8",
            target: "9",
            options: ["9", "0", "6", "No veo nada"],
            correctIndex: 0,
            generator: (ctx, seed) => drawNumberPlate(ctx, "9", palette.redGreenA, palette.redGreenB, seed)
        }
    ];

    // ---- Estado ----
    let index = 0;
    const answers = new Array(PLATES.length).fill(null);

    // Seeds determinísticos por placa (para que no cambie al volver atrás)
    const seeds = PLATES.map((p, i) => hashSeed(`${p.id}:${i}`));

    // ---- UI refs ----
    const canvas = $("plate");
    const ctx = canvas.getContext("2d");
    const answersWrap = $("answers");

    const title = $("title");
    const progress = $("progress");

    const prevBtn = $("prevBtn");
    const nextBtn = $("nextBtn");

    const resultBox = $("resultBox");
    const resultPill = $("resultPill");
    const resultHint = $("resultHint");
    const saveBtn = $("saveBtn");
    const restartBtn = $("restartBtn");

    const backBtn = $("backBtn");
    const homeBtn = $("homeBtn");

    // ---- Navegación ----
    backBtn?.addEventListener("click", () => (window.location.href = "main.html"));
    homeBtn?.addEventListener("click", () => (window.location.href = "main.html"));

    prevBtn.addEventListener("click", () => {
        if (index > 0) {
            index--;
            render(true); // redibuja porque cambiaste de placa
        }
    });

    nextBtn.addEventListener("click", () => {
        if (answers[index] == null) {
            alert("Selecciona una opción antes de continuar.");
            return;
        }
        if (index < PLATES.length - 1) {
            index++;
            render(true); // redibuja por nueva placa
        } else {
            showResult();
        }
    });

    restartBtn.addEventListener("click", () => {
        for (let i = 0; i < answers.length; i++) answers[i] = null;
        index = 0;
        resultBox.style.display = "none";
        render(true);
    });

    saveBtn.addEventListener("click", () => {
        const result = computeResult();

        // Guarda tipo detectado
        localStorage.setItem("daltonismType", result.type);

        // ✅ aplica automáticamente el modo del CSS
        localStorage.setItem("colorMode", result.recommendedMode);
        if (window.colorManager?.setMode) window.colorManager.setMode(result.recommendedMode);

        // evita que main vuelva a preguntar
        localStorage.setItem("firstTimeDone", "true");

        window.location.href = "main.html";
    });

    // ---- Render ----
    // redrawPlate: true => dibuja placa (cambio de pregunta)
    // redrawPlate: false => NO dibuja placa (solo marca selección)
    function render(redrawPlate) {
        const p = PLATES[index];

        title.textContent = p.label;
        progress.textContent = `${index + 1}/${PLATES.length}`;

        if (redrawPlate) {
            clearPlate(ctx);
            p.generator(ctx, seeds[index]);
        }

        // Render opciones (siempre, para que quede consistente)
        answersWrap.innerHTML = "";
        p.options.forEach((opt, optIndex) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "answer-btn";
            btn.textContent = opt;

            btn.addEventListener("click", () => {
                answers[index] = optIndex;
                markSelectedAnswer(); // ✅ NO redibuja canvas
            });

            answersWrap.appendChild(btn);
        });

        // marca selección actual
        markSelectedAnswer();

        // Prev/Next state
        prevBtn.disabled = index === 0;
        prevBtn.style.opacity = index === 0 ? "0.6" : "1";

        nextBtn.textContent = index === PLATES.length - 1 ? "Finalizar" : "Siguiente";
    }

    function markSelectedAnswer() {
        const buttons = answersWrap.querySelectorAll(".answer-btn");
        buttons.forEach((b, i) => {
            if (answers[index] === i) {
                b.style.borderColor = "var(--primary-color)";
                b.style.boxShadow = "var(--focus-ring)";
            } else {
                b.style.borderColor = "var(--border-color)";
                b.style.boxShadow = "none";
            }
        });
    }

    // ---- Resultado ----
    function showResult() {
        const result = computeResult();
        resultPill.textContent = result.label;
        resultHint.textContent =
            `Resultado orientativo para personalizar accesibilidad. Modo recomendado: ${prettyMode(result.recommendedMode)}.`;

        resultBox.style.display = "block";
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }

    function computeResult() {
        let missControl = 0;
        let missRG = 0;
        let missProtan = 0;
        let missDeutan = 0;
        let missTritan = 0;

        PLATES.forEach((p, i) => {
            const chosen = answers[i];
            const correct = p.correctIndex;
            const incorrect = (chosen == null) || (chosen !== correct);

            if (p.type === "control" && incorrect) missControl++;
            if (p.type === "rg" && incorrect) missRG++;
            if (p.type === "protan" && incorrect) missProtan++;
            if (p.type === "deutan" && incorrect) missDeutan++;
            if (p.type === "tritan" && incorrect) missTritan++;
        });

        // Indeterminado MUY raro: solo si falla 2 controles (o sea, algo pasó)
        if (missControl >= 2) {
            const current = localStorage.getItem("colorMode") || "normal";
            return { type: "unknown", label: "Indeterminado", recommendedMode: current };
        }

        // Tritan si falla 2 o más tritan
        if (missTritan >= 2) {
            return { type: "tritanopia", label: "Tritanopía", recommendedMode: "tritanopia" };
        }

        // Rojo-verde si falla 2 o más rg
        if (missRG >= 2) {
            // desempate protan vs deutan
            if (missProtan > missDeutan) {
                return { type: "protanopia", label: "Protanopía", recommendedMode: "protanopia" };
            }
            if (missDeutan > missProtan) {
                return { type: "deuteranopia", label: "Deuteranopía", recommendedMode: "deuteranopia" };
            }
            // empate: forzamos deuteranopia (más común)
            return { type: "deuteranopia", label: "Deuteranopía", recommendedMode: "deuteranopia" };
        }

        // Si casi no falla => normal
        return { type: "normal", label: "Normal", recommendedMode: "normal" };
    }

    function prettyMode(mode) {
        return {
            normal: "Normal",
            deuteranopia: "Deuteranopía",
            protanopia: "Protanopía",
            tritanopia: "Tritanopía"
        }[mode] || "Normal";
    }

    // ---- Canvas drawing ----
    function clearPlate(ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawNumberPlate(ctx, text, paletteA, paletteB, seed) {
        // máscara con texto
        const off = document.createElement("canvas");
        off.width = canvas.width;
        off.height = canvas.height;
        const octx = off.getContext("2d");

        octx.clearRect(0, 0, off.width, off.height);
        octx.fillStyle = "#000";
        octx.textAlign = "center";
        octx.textBaseline = "middle";

        const fontSize = text.length === 2 ? 150 : text.length === 1 ? 170 : 120;
        octx.font = `900 ${fontSize}px Segoe UI, Arial`;
        octx.fillText(text, off.width / 2, off.height / 2 + 8);

        const img = octx.getImageData(0, 0, off.width, off.height).data;

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const radius = canvas.width * 0.48;

        // random determinístico
        const rng = { v: (seed >>> 0) || 1 };

        const N = 1800;
        for (let i = 0; i < N; i++) {
            const r = radius * Math.sqrt(seededRandom(rng));
            const ang = seededRandom(rng) * Math.PI * 2;
            const x = cx + r * Math.cos(ang);
            const y = cy + r * Math.sin(ang);

            const ix = Math.max(0, Math.min(off.width - 1, Math.floor(x)));
            const iy = Math.max(0, Math.min(off.height - 1, Math.floor(y)));
            const idx = (iy * off.width + ix) * 4;

            const inText = img[idx + 3] > 0;
            const color = pick(inText ? paletteA : paletteB, rng);

            const dot = 3 + seededRandom(rng) * 4;
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.arc(x, y, dot, 0, Math.PI * 2);
            ctx.fill();
        }

        // borde leve
        ctx.beginPath();
        ctx.strokeStyle = "rgba(0,0,0,0.08)";
        ctx.lineWidth = 2;
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    function pick(arr, rng) {
        const i = Math.floor(seededRandom(rng) * arr.length);
        return arr[i];
    }

    // ---- RNG helpers ----
    function hashSeed(str) {
        // FNV-1a 32-bit
        let h = 2166136261;
        for (let i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    }

    function seededRandom(seedObj) {
        // xorshift32
        let x = seedObj.v >>> 0;
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        seedObj.v = x >>> 0;
        return seedObj.v / 4294967296;
    }

    // Init
    document.addEventListener("DOMContentLoaded", () => {
        // aplica modo actual
        if (window.colorManager?.getMode) {
            window.colorManager.setMode(window.colorManager.getMode());
            window.colorManager.updateToggleButtonText?.();
        }
        render(true);
    });
})();
