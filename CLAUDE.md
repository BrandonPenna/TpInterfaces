# Contexto Académico y Directrices para Claude Code - TPE Interfaces (UNICEN)

Este archivo define las reglas estrictas de desarrollo, restricciones tecnológicas y requerimientos obligatorios que deben cumplirse en este proyecto universitario. Cualquier refactorización o modificación de código debe alinearse rigurosamente con estas pautas.

## 🛠️ Stack Tecnológico Restringido
- **Frontend nativo obligatorio:** HTML5, CSS3 y JavaScript vainilla (Vanilla JS).
- **PROHIBIDO usar frameworks de JavaScript:** No utilizar Angular, React, Vue, Svelte, etc.
- **PROHIBIDO usar frameworks/librerías CSS:** No utilizar Bootstrap, Tailwind CSS, Bulma, etc. El diseño y los estilos deben ser puros (CSS nativo).
- **Arquitectura:** Estilo MVC o modular basado en componentes limpios y nativos.

---

## 🎮 Requerimientos Obligatorios del Trabajo Práctico (Entregable Nº3: Videojuego BLOCKA + Filtros)

El código resultante y las modificaciones de simplificación **deben** garantizar que se cumplan al 100% los siguientes puntos académicos del **TPE3**:

### 1. Mecánica del Juego BLOCKA
- **Dinámica principal:** Un "Blocka" es una imagen descompuesta en partes (por defecto 4 subimágenes) que aparecen rotadas respecto a su posición original[cite: 1]. El usuario debe rotarlas hasta armar la imagen final[cite: 1].
- **Controles de rotación:** 
  - Clic derecho: Gira la subimagen hacia la derecha[cite: 1].
  - Clic izquierdo: Gira la subimagen hacia la izquierda[cite: 1].
- **Temporizador y Niveles:**
  - El nivel incluye un temporizador que inicia al presionar "Comenzar" y se detiene al completar la imagen (marcando el récord)[cite: 1].
  - Al terminar, permite volver al Menú Principal o continuar al siguiente nivel[cite: 1].
  - Debe contener **al menos tres niveles** obligatorios[cite: 1].
- **Filtros por Niveles:**
  - Para incrementar la dificultad, la imagen aparece desordenada y con un filtro aplicado en tiempo de carga (setup del nivel)[cite: 1].
  - Filtros obligatorios a utilizar: **a) Escala de grises, b) Brillo (30%), c) Negativo**[cite: 1].
  - Al terminar de armar la imagen, los filtros se quitan y se observa la imagen original en RGB[cite: 1].
- **Banco de Imágenes:**
  - Debe existir un banco de al menos 6 imágenes; al iniciar el nivel, el sistema elige una aleatoriamente[cite: 1].

### 2. Páginas, Maquetación y UX del Juego Blocka
- El juego debe tener su **propia página de ejecución**, con el mismo diseño estético que el *Peg Solitaire* (integrado sobre la estructura general del sitio)[cite: 1].
- Debe incluir:
  - Lugar de ejecución visible[cite: 1].
  - Instrucciones de juego claras[cite: 1].
  - Imágenes representativas del juego[cite: 1].

### 3. Requerimientos Generales del Sitio (Home, Páginas y Extras anteriores)
- **Páginas e Interacción (Mínimo 3 páginas):**
  - Home de Inicio (con juegos destacados, acceso a ejecución de juegos y carruseles).
  - Páginas de detalle / ejecución de juegos (incluyendo *Blocka* para este TPE3, además de secciones generales).
  - Sección de Login / Registro (con animaciones en caso de éxito).
  - *Mobile First* exclusivo para la **Home** (el resto puede ser Desktop).
- **Animaciones y Efectos Visuales CSS (Sin librerías externas):**
  - Hover en botones (al menos 3 animaciones CSS de hover diferentes).
  - Animaciones Keyframe (%) (prohibido usar spritesheets).
  - Carruseles fluidos con transiciones programadas (carrusel principal grande en el centro con laterales ocultos a medias, y carruseles normales inferiores).
- **Pantalla de Carga (Loading):**
  - Al cargar la Home se ejecuta **siempre** un loading simulado de **5 segundos** (prohibido usar GIF; debe mostrar porcentaje numérico en tiempo real y animación gráfica de carga CSS nativa).
- **Contenidos de Datos:**
  - Prohibido texto *Lorem Ipsum* genérico. Títulos de juegos reales de diferente longitud.

---

## ⭐ Ítems Extra (Requeridos para Promocionar - Mínimo 2 obligatorios)
*(Implementar según los requerimientos de la cátedra para mejorar nota / promocionar)*:
1. **Animación previa de selección:** Previo a iniciar el nivel se muestran todas las imágenes en miniatura (*thumbnails*) y, mediante una animación, se selecciona aleatoriamente la imagen con la que se jugará[cite: 2].
2. **Configuración de cantidad de subimágenes:** Permitir configurar la cantidad de piezas de la Blocka: **4, 6 u 8**[cite: 2].
3. **Ayudita:** Opción para que el sistema ubique correctamente una de las subimágenes y la deje fija (suma 5 segundos de penalización al contador)[cite: 2].
4. **Temporizador de tiempo máximo:** Niveles avanzados con límite de tiempo estricto; si el usuario no resuelve la blocka a tiempo, pierde el nivel[cite: 2].

---

## 📅 Condiciones de Entrega
- **Deadline:** Hasta el **14/10/2026 a las 23:59:59 hs**[cite: 2].
- **Despliegue:** Branch `gh-pages` de GitHub[cite: 2].

## ⚠️ Reglas de Oro para la Refactorización (Claude Code)
- **NO romper el diseño visual:** Limpia el código y elimina redundancias, pero mantén intacta la estructura estética, maquetación y posicionamiento de la interfaz.
- **Mantener clases e IDs críticos:** No alteres los selectores CSS que dan vida a los carruseles, la lógica de rotación de imágenes del Blocka, los filtros CSS, las animaciones de carga o los hovers.
- **Modularización limpia:** Organiza el JavaScript y el CSS de manera legible y ordenada para facilitar la defensa del práctico ante la cátedra.