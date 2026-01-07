# ColorAccess

## Descripción del proyecto

ColorAccess es una aplicación web interactiva basada en juegos y tests de daltonismo, orientada a la detección, educación y apoyo de personas con diferentes tipos de deficiencia en la visión del color, específicamente Deuteranopía, Protanopía y Tritanopía.

El proyecto tiene como objetivo ofrecer una experiencia accesible, intuitiva y visualmente inclusiva. Para su desarrollo se diseñaron prototipos de baja fidelidad, los cuales fueron evaluados utilizando las 10 heurísticas de usabilidad de Nielsen. A partir de estas evaluaciones, se obtuvieron recomendaciones que permitieron mejorar aspectos clave como el contraste, la navegación y el feedback visual, implementadas posteriormente en el prototipo de alta fidelidad.

---

## Objetivos

- Detectar posibles tipos de daltonismo mediante tests interactivos  
- Educar a los usuarios sobre la visión del color y sus variaciones  
- Ofrecer una experiencia web accesible e inclusiva  
- Aplicar principios de usabilidad y accesibilidad en el diseño de interfaces  

---

## Alcance del proyecto

- Aplicación web ejecutada en el navegador  
- Tests y juegos visuales interactivos  
- Evaluación de usabilidad basada en heurísticas  
- No requiere instalación ni configuración avanzada  

---

## 🚀 Cómo ejecutar la aplicación

### Requisitos previos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- No se requiere instalación de software adicional

### Pasos para ejecutar

1. **Clona o descarga el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd color-access
   ```

2. **Abre el archivo principal**
   - Abre `index.html` en tu navegador web
   - O ejecuta un servidor local (ver opciones abajo)

3. **Opciones para ejecutar localmente**

   **Opción A: Abrir directamente**
   - Haz doble clic en `index.html`
   - Se abrirá en tu navegador predeterminado

   **Opción B: Usar servidor local (recomendado)**
   ```bash
   # Si tienes Python instalado
   python -m http.server 8000

   # O con Node.js
   npx serve .

   # O con PHP
   php -S localhost:8000
   ```

4. **Accede a la aplicación**
   - Abre http://localhost:8000 en tu navegador
   - La aplicación se cargará automáticamente

### Estructura del proyecto

```
color-access/
│
├── index.html                 # Página de bienvenida
├── src/
│   ├── html/
│   │   └── login.html         # Pantalla de inicio de sesión
│   ├── css/
│   │   ├── styles.css         # Estilos principales
│   │   └── color-modes.css    # Modos de color para accesibilidad
│   └── js/
│       ├── color-manager.js   # Sistema de gestión de colores
│       └── login.js           # Lógica de la página de login
├── assets/                    # Imágenes y recursos estáticos
├── docs/                      # Documentación adicional
└── README.md                  # Este archivo
```

### Funcionalidades implementadas

- ✅ Pantalla de inicio de sesión
- ✅ Sistema de cambio de colores para accesibilidad
- ✅ Modos de color: Normal, Deuteranopía, Protanopía, Tritanopía
- ✅ Persistencia de preferencias en localStorage
- ✅ Interfaz responsive y accesible

---

## Tecnologías utilizadas (Tech Stack)

### Frontend
- HTML5
- CSS3
- JavaScript (ES6+)

### Diseño y Prototipado
- Figma (prototipos de baja y alta fidelidad)

### Accesibilidad y UX
- WCAG 2.1
- Heurísticas de Usabilidad de Nielsen
- Buenas prácticas de contraste y feedback visual

### Herramientas
- Git
- GitHub
- Visual Studio Code  
  

---

## Accesibilidad

El diseño de ColorWise prioriza la accesibilidad mediante:
- Uso adecuado del contraste de colores  
- Navegación clara e intuitiva  
- Feedback visual comprensible  
- Estructura semántica del contenido  
- Consideraciones para usuarios con deficiencia en la visión del color  

---

## Metodología

1. Investigación sobre daltonismo y accesibilidad web  
2. Diseño de prototipos de baja fidelidad  
3. Evaluación mediante las 10 heurísticas de Nielsen  
4. Identificación de problemas de usabilidad  
5. Aplicación de mejoras en el prototipo de alta fidelidad  

---

## Estructura del repositorio

```text
color-wise/
│
├── README.md
├── docs/
│   ├── user-stories.md
│   ├── requirements.md
│   └── architecture.md
│
├── src/
│   └── (source code)
│
├── tests/
├── .gitignore
└── LICENSE
