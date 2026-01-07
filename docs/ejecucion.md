# Guía de Ejecución - ColorAccess

## Ejecutar la aplicación

### Método 1: Servidor Local (Recomendado)

#### Con Python (si tienes Python instalado)
```bash
# Navega al directorio del proyecto
cd color-access

# Inicia servidor en puerto 8000
python -m http.server 8000
```

#### Con Node.js (si tienes Node.js instalado)
```bash
# Instala serve globalmente (solo la primera vez)
npm install -g serve

# Navega al directorio del proyecto
cd color-access

# Inicia el servidor
serve .
```

#### Con PHP (si tienes PHP instalado)
```bash
# Navega al directorio del proyecto
cd color-access

# Inicia servidor en puerto 8000
php -S localhost:8000
```

### Método 2: Abrir directamente en el navegador

1. Abre tu explorador de archivos
2. Navega a la carpeta del proyecto
3. Haz doble clic en `index.html`
4. La aplicación se abrirá en tu navegador predeterminado

## Acceder a la aplicación

Una vez iniciado el servidor o abierto el archivo:

1. Abre tu navegador web
2. Ve a: `http://localhost:8000` (si usaste servidor)
3. O simplemente abre `index.html` directamente

## Funcionalidades de la HU-01

### Cambio de Colores para Accesibilidad

En la pantalla de inicio de sesión encontrarás:

- **Botón "CAMBIAR COLORES"**: Letra grande y negra como solicitaste
- Al hacer clic, se muestran 4 opciones:
  - **Normal**: Color #7AC6FF
  - **Deuteranopía**: Color #FF807A
  - **Protanopía**: Color #F6FF7A
  - **Tritanopía**: Color #88FF90

### Cómo funciona

1. Haz clic en "CAMBIAR COLORES"
2. Selecciona el modo de color que prefieras
3. Los colores de toda la aplicación cambiarán automáticamente
4. La preferencia se guarda y se mantendrá al recargar la página

## Navegación

- `index.html`: Página de bienvenida (redirige automáticamente a login)
- `src/html/login.html`: Pantalla principal de inicio de sesión

## Notas importantes

- La aplicación funciona completamente sin backend
- Todas las preferencias se guardan localmente en tu navegador
- Es completamente responsive y funciona en móviles
- No requiere conexión a internet una vez cargada
