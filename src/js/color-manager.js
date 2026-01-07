/**
 * ColorManager - Sistema de gestión de modos de color para accesibilidad
 * Maneja los diferentes modos de color para personas con daltonismo
 */
class ColorManager {
    constructor() {
        this.currentMode = 'normal';
        this.availableModes = {
            normal: {
                name: 'Normal',
                color: '#7AC6FF',
                class: 'color-mode-normal'
            },
            deuteranopia: {
                name: 'Deuteranopía',
                color: '#FF807A',
                class: 'color-mode-deuteranopia'
            },
            protanopia: {
                name: 'Protanopía',
                color: '#F6FF7A',
                class: 'color-mode-protanopia'
            },
            tritanopia: {
                name: 'Tritanopía',
                color: '#88FF90',
                class: 'color-mode-tritanopia'
            }
        };

        this.init();
    }

    /**
     * Inicializa el sistema de colores
     */
    init() {
        this.loadSavedMode();
        this.applyMode(this.currentMode);
        this.setupEventListeners();
    }

    /**
     * Carga el modo guardado desde localStorage
     */
    loadSavedMode() {
        const savedMode = localStorage.getItem('colorAccess-mode');
        if (savedMode && this.availableModes[savedMode]) {
            this.currentMode = savedMode;
        }
    }

    /**
     * Guarda el modo actual en localStorage
     */
    saveMode(mode) {
        localStorage.setItem('colorAccess-mode', mode);
    }

    /**
     * Aplica un modo de color cambiando la clase del body
     */
    applyMode(mode) {
        if (!this.availableModes[mode]) {
            console.warn(`Modo de color no válido: ${mode}`);
            return;
        }

        // Remover todas las clases de modo de color
        Object.values(this.availableModes).forEach(modeInfo => {
            document.body.classList.remove(modeInfo.class);
        });

        // Aplicar la nueva clase
        document.body.classList.add(this.availableModes[mode].class);
        this.currentMode = mode;
        this.saveMode(mode);

        console.log(`Modo de color aplicado: ${mode}`);
    }

    /**
     * Configura los event listeners para los botones de cambio de color
     */
    setupEventListeners() {
        // Botón principal para mostrar/ocultar opciones
        const toggleBtn = document.getElementById('color-toggle-btn');
        const optionsContainer = document.getElementById('color-options');

        if (toggleBtn && optionsContainer) {
            toggleBtn.addEventListener('click', () => {
                optionsContainer.classList.toggle('hidden');
            });
        }

        // Opciones individuales de color
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.applyMode(mode);

                // Ocultar las opciones después de seleccionar
                if (optionsContainer) {
                    optionsContainer.classList.add('hidden');
                }

                // Actualizar el texto del botón para mostrar el modo actual
                this.updateToggleButtonText();
            });
        });
    }

    /**
     * Actualiza el texto del botón para mostrar el modo actual
     */
    updateToggleButtonText() {
        const toggleBtn = document.getElementById('color-toggle-btn');
        if (toggleBtn) {
            const modeInfo = this.availableModes[this.currentMode];
            toggleBtn.textContent = `COLORES: ${modeInfo.name.toUpperCase()}`;
        }
    }

    /**
     * Obtiene el modo actual
     */
    getCurrentMode() {
        return this.currentMode;
    }

    /**
     * Obtiene información de un modo específico
     */
    getModeInfo(mode) {
        return this.availableModes[mode] || null;
    }

    /**
     * Obtiene todos los modos disponibles
     */
    getAvailableModes() {
        return this.availableModes;
    }
}

// Crear instancia global del ColorManager
const colorManager = new ColorManager();

// Hacer disponible globalmente para debugging
window.colorManager = colorManager;
