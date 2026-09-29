# Contexto Académico y Directrices para Claude Code - TPE Interfaces (UNICEN)

Este archivo define las reglas estrictas de desarrollo, restricciones tecnológicas y requerimientos obligatorios que deben cumplirse en este proyecto universitario. Cualquier refactorización o modificación de código debe alinearse rigurosamente con estas pautas.

## 🛠️ Stack Tecnológico Restringido
- **Frontend nativo obligatorio:** HTML5, CSS3 y JavaScript vainilla (Vanilla JS).
- **PROHIBIDO usar frameworks de JavaScript:** No utilizar Angular, React, Vue, Svelte, etc.
- **PROHIBIDO usar frameworks/librerías CSS:** No utilizar Bootstrap, Tailwind CSS, Bulma, etc. El diseño y los estilos deben ser puros (CSS nativo).
- **Arquitectura:** Estilo MVC o modular basado en componentes limpios y nativos.

## 🎯 Requerimientos Obligatorios del Trabajo Práctico
El código resultante y las modificaciones de simplificación **deben** garantizar que se cumplan al 100% los siguientes puntos académicos:

1. **Páginas e Interacción (Mínimo 3 páginas):**
   - Home de Inicio (con juegos destacados, acceso a ejecución de juegos como *Peg Solitaire*, y carruseles).
   - Páginas de detalle / ejecución de juegos (ej. *Peg Solitaire*, *GTA 6*, *Red Dead Redemption 2*).
   - Sección de Login / Registro (con animaciones en caso de éxito en el registro).
   - *Nota de diseño:* Se debe aplicar un enfoque **Mobile First** exclusivamente para la **Home** (el resto de las páginas pueden ser solo Desktop).

2. **Animaciones y Efectos Visuales CSS (Sin librerías externas):**
   - **Hover en botones:** Se deben implementar al menos **3 animaciones CSS de hover diferentes** en botones (usando patrones vistos en clase teórica, ej. Slide 14). *Atención:* El menú hamburguesa **no** cuenta como botón para este punto.
   - **Animaciones Keyframe (%):** Usar animaciones por `@keyframes` basadas en porcentajes (prohibido usar spritesheets).
   - **Carruseles / Galerías animadas:** La transición entre imágenes de la galería/carrusel debe tener una animación fluida programada (no sirve un simple desplazamiento estático o nativo sin transiciones). Debe haber un carrusel principal (grande en el centro, ej. *Peg Solitaire* y laterales ocultos a medias) y carruseles normales inferiores.

3. **Pantalla de Carga (Loading):**
   - Al cargar la Home se debe ejecutar **siempre** un loading simulado exacto de **5 segundos**.
   - **No puede ser un GIF**. Debe mostrar un porcentaje de avance numérico en tiempo real y una animación gráfica de carga nativa (cuadrado, círculo o spinner con CSS).

4. **Contenido de Datos (No genéricos):**
   - Prohibido usar texto *Lorem Ipsum* genérico.
   - Usar títulos de juegos reales y de **diferente longitud** (cortos y largos) para comprobar cómo se acomoda el diseño de forma responsiva.
   - Las imágenes deben ser variadas en colores y proporciones.
   - *(Plus)* Integración opcional con la API de la cátedra para el consumo de datos si se requiere: `https://github.com/jimartinezabadias/api-vj-interfaces`.

5. **Despliegue y Versiones:**
   - El proyecto está configurado para desplegarse mediante el branch `gh-pages` de GitHub.

## ⚠️ Reglas de Oro para la Refactorización (Claude Code)
- **NO romper el diseño visual:** Limpia el código, elimina redundancias y código muerto acumulado por iteraciones anteriores, pero mantén intacta la estructura estética, maquetación y posicionamiento de la interfaz.
- **Mantener clases e IDs críticos:** No alteres los selectores CSS que dan vida a los carruseles, las animaciones de carga, los hovers o el diseño Mobile First de la Home.
- **Modularización limpia:** Organiza el JavaScript y el CSS de manera legible y ordenada para facilitar la defensa del práctico ante la cátedra.