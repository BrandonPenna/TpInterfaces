# Documentación: Animación de los Carruseles (Home)

Este documento explica **dónde está** y **cómo funciona** la animación de los carruseles de la Home (`index.html`), línea por línea, y describe qué hace cada método.

---

## 1. ¿Dónde está la animación?

La animación se reparte entre **dos archivos** que trabajan en equipo:

| Archivo | Qué aporta | Líneas |
|---|---|---|
| `js/home.js` | Mueve el carrusel **cuadro a cuadro** (`requestAnimationFrame`) con una curva de velocidad suave, y agrega/quita las clases que disparan la animación CSS. | 145–157, 197–231, 233–374, 391–399, 418–434 |
| `css/home.css` | Define las **animaciones `@keyframes` por porcentaje** que inclinan y achican las tarjetas mientras se desliza, más el estilo y hover de las flechas. | 41–215, 258–282, 441–481 |
| `index.html` | Contenedor vacío del carrusel grande que el JS rellena. | 26–30 |

### Flujo general (resumen)

```
Usuario hace clic en una flecha
        │
        ▼
Listener delegado de "click" (home.js:392)
        │  detecta .carousel-arrow y decide dirección (+1 / -1)
        ▼
deslizar(carousel, dir)  (home.js:346)
        │
        ├─► destinoDelSlide() calcula a qué scrollLeft ir
        ├─► desactiva scroll-snap
        ├─► agrega clase .is-sliding-next / .is-sliding-prev al track
        │        │
        │        ▼
        │   CSS: @keyframes carousel-slide-next / -prev (650 ms)
        │   → las tarjetas se inclinan, se achican y vuelven
        │
        └─► requestAnimationFrame(cuadro) durante 650 ms
                 → scrollLeft = inicio + distancia * easeInOutCubic(t)
                 → al terminar: restaura snap y quita la clase
        │
        ▼
Evento "scroll" → actualizarFlechas() oculta la flecha si se llegó a un extremo
```

**Clave:** el movimiento (JS) y el efecto visual (CSS) duran **exactamente lo mismo: 650 ms**. Por eso la constante `DURACION_SLIDE = 650` en JS coincide con `animation: ... 650ms` en CSS.

---

## 2. Estructura HTML de un carrusel

### 2.1 Carrusel grande — `index.html:26-30`

```html
<div class="carousel-box carousel-box--featured">
  <div class="carousel carousel--featured">
    <div class="carousel__track" data-track></div>
  </div>
</div>
```

| Línea | Explicación |
|---|---|
| `carousel-box` | Caja **externa**. Es la que tiene `position: relative` y posiciona las flechas. |
| `carousel` | Ventana visible con `overflow-x: auto`: es el elemento que **scrollea**. |
| `carousel__track` | Fila (flex) con todas las tarjetas. Arranca vacía; `renderizar()` la llena. |

### 2.2 Carruseles por categoría (generados por JS en `renderizar()`, `home.js:213-230`)

```
section.game-section
 ├─ h2 (nombre de la categoría)
 └─ div.carousel-box
     ├─ button.carousel-arrow--prev   ← flechas()
     ├─ button.carousel-arrow--next
     └─ div.carousel
         └─ div.carousel__track
             └─ article.game-card × 7
```

**¿Por qué las flechas están en `.carousel-box` y no dentro de `.carousel`?** Porque `.carousel` scrollea: si las flechas fueran hijas suyas se moverían junto con las tarjetas. Al estar en la caja externa quedan fijas a los costados.

---

## 3. CSS línea por línea (`css/home.css`)

### 3.1 Caja de las flechas — líneas 44–66

```css
.carousel-box {
  --flecha-size: 34px;
  --flecha-offset: 8px;
  position: relative;
}
```

| Línea | Qué hace |
|---|---|
| `--flecha-size: 34px;` | Variable CSS: tamaño de las flechas en carruseles normales (móvil). |
| `--flecha-offset: 8px;` | Variable CSS: distancia de la flecha al borde del carrusel. |
| `position: relative;` | Hace que las flechas (`position: absolute`) se ubiquen respecto a esta caja. |

```css
.carousel-box--featured {
  --flecha-size: 52px;
  --flecha-offset: 14px;
  --gap: 20px;
  --card-w: min(420px, calc((100vw - 2 * var(--gap)) / 2));
  --card-h: calc(var(--card-w) * 0.7009);
  --card-r: calc(var(--card-w) * 0.0611);
  max-width: calc(2 * (var(--card-w) + var(--gap)));
  margin-inline: auto;
}
```

| Línea | Qué hace |
|---|---|
| `--flecha-size: 52px; --flecha-offset: 14px;` | Flechas más grandes para el carrusel destacado. |
| `--gap: 20px;` | Espacio entre tarjetas destacadas. |
| `--card-w: min(420px, …)` | Ancho de tarjeta: la mitad del ancho de pantalla menos los huecos, con tope de 420px. |
| `--card-h: calc(var(--card-w) * 0.7009);` | Alto proporcional al ancho (relación de aspecto del diseño) → la imagen no se deforma. |
| `--card-r: calc(var(--card-w) * 0.0611);` | Radio de borde proporcional al ancho. |
| `max-width: calc(2 * (card-w + gap));` | El carrusel mide exactamente **2 tarjetas + 2 huecos**. Así, al centrar una tarjeta, las dos vecinas quedan **cortadas a la mitad** (efecto "laterales ocultos a medias" que pide la consigna). |
| `margin-inline: auto;` | Centra el carrusel horizontalmente en la página. |

### 3.2 Botón flecha — líneas 68–97

```css
.carousel-arrow {
  position: absolute;
  z-index: 4;
  top: 50%;
  width: var(--flecha-size);
  height: calc(var(--flecha-size) * 0.88);
  padding: 0;
  border: 0;
  background: transparent;
  transform: translateY(-50%);
  cursor: pointer;
  transition: filter 160ms ease, opacity 200ms ease;
}
```

| Línea | Qué hace |
|---|---|
| `position: absolute;` | Se ubica libremente dentro de `.carousel-box`. |
| `z-index: 4;` | Queda por encima de las tarjetas. |
| `top: 50%;` + `transform: translateY(-50%);` | Centrado vertical perfecto. |
| `width / height` | Tamaño según la variable; el alto es 88% del ancho (proporción del SVG). |
| `padding: 0; border: 0; background: transparent;` | Quita el estilo por defecto del `<button>`: sólo se ve el SVG. |
| `cursor: pointer;` | Manito al pasar el mouse. |
| `transition: filter …, opacity 200ms` | Suaviza el cambio de brillo y el desvanecimiento al deshabilitarse. |

```css
.carousel-arrow img { display:block; width:100%; height:100%; transform: scaleX(-1); }
.carousel-arrow--prev { left: var(--flecha-offset); }
.carousel-arrow--next { right: var(--flecha-offset); }
```

| Línea | Qué hace |
|---|---|
| `transform: scaleX(-1);` | Espeja el SVG horizontalmente: los archivos `btnant.svg`/`btnsig.svg` vienen apuntando al revés, así apuntan hacia afuera. |
| `left / right: var(--flecha-offset)` | Coloca cada flecha en su costado. |

### 3.3 Hover de las flechas — líneas 101–118

```css
.carousel-arrow:hover {
  animation: arrow-nudge 900ms ease-in-out infinite;
}
.carousel-arrow:hover img {
  filter: drop-shadow(0 0 10px rgba(57,255,20,0.9)) drop-shadow(0 0 26px rgba(57,255,20,0.5));
  transform: scaleX(-1) scale(1.12);
  transition: transform 160ms ease;
}
@keyframes arrow-nudge {
  0%, 100% { transform: translateY(-50%); }
  50%      { transform: translateY(calc(-50% - 7px)); }
}
```

| Línea | Qué hace |
|---|---|
| `animation: arrow-nudge 900ms ease-in-out infinite;` | Mientras el mouse está encima, la flecha "rebota" en un ciclo de 900 ms, sin fin. |
| `filter: drop-shadow(...) drop-shadow(...)` | Doble sombra verde neón → efecto de brillo. |
| `transform: scaleX(-1) scale(1.12);` | Mantiene el espejado y agranda la imagen un 12%. |
| `0%, 100% { translateY(-50%) }` | Posición normal (centrada) al inicio y fin del ciclo. |
| `50% { translateY(-50% - 7px) }` | A mitad del ciclo sube 7px → movimiento de balanceo. |

> Nota: `translateY(-50%)` se repite en el keyframe porque la animación **reemplaza** el `transform` del botón; si no, perdería el centrado vertical.

### 3.4 Flecha deshabilitada — líneas 122–125

```css
.carousel-arrow:disabled { opacity: 0; pointer-events: none; }
```

Cuando JS pone `disabled = true` (se llegó al extremo), la flecha se vuelve invisible (con la transición de opacidad de 200 ms) y deja de recibir clics.

### 3.5 Base común del carrusel — líneas 128–147

```css
.carousel {
  position: relative;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x proximity;
  scrollbar-width: none;
  overscroll-behavior-x: contain;
}
.carousel::-webkit-scrollbar { display: none; }
.carousel__track {
  display: flex;
  align-items: center;
  width: max-content;
  will-change: transform;
}
```

| Línea | Qué hace |
|---|---|
| `overflow-x: auto;` | Permite scroll horizontal (con el dedo, trackpad o por JS vía `scrollLeft`). |
| `overflow-y: hidden;` | Sin scroll vertical. |
| `scroll-snap-type: x proximity;` | Al soltar el scroll manual, "imanta" la tarjeta más cercana si está cerca de su punto de anclaje. |
| `scrollbar-width: none;` + `::-webkit-scrollbar { display:none }` | Oculta la barra de scroll (Firefox y Chrome/Safari respectivamente). |
| `overscroll-behavior-x: contain;` | Evita que al llegar al final se dispare el "atrás" del navegador o el scroll de la página. |
| `display: flex; align-items: center;` | Tarjetas en fila, centradas verticalmente. |
| `width: max-content;` | El track mide lo que suman todas las tarjetas → más ancho que el carrusel → hay scroll. |
| `will-change: transform;` | Le avisa al navegador que habrá transformaciones para optimizar el renderizado. |

### 3.6 ⭐ Transición entre imágenes (la animación principal) — líneas 152–194

```css
.carousel__track.is-sliding-next > * {
  animation: carousel-slide-next 650ms ease-in-out;
}
.carousel__track.is-sliding-prev > * {
  animation: carousel-slide-prev 650ms ease-in-out;
}
```

| Línea | Qué hace |
|---|---|
| `.carousel__track.is-sliding-next > *` | Selecciona **cada tarjeta** (hijo directo) del track **sólo mientras** el track tiene la clase `is-sliding-next` (la pone JS al ir hacia la derecha). |
| `animation: carousel-slide-next 650ms ease-in-out;` | Ejecuta el keyframe una sola vez, en 650 ms, arrancando y terminando suave. |
| `.is-sliding-prev` | Lo mismo pero hacia la izquierda, con el keyframe espejado. |

```css
@keyframes carousel-slide-next {
  0%   { transform: none;                     filter: none; }
  40%  { transform: skewX(-7deg) scale(0.94); filter: brightness(0.8); }
  75%  { transform: skewX(2deg)  scale(1.01); }
  100% { transform: none;                     filter: none; }
}
```

| Porcentaje | Tiempo aprox. | Qué le pasa a la tarjeta |
|---|---|---|
| `0%` | 0 ms | Estado normal. |
| `40%` | 260 ms | Se **inclina** −7° (`skewX`) hacia el lado del movimiento, se **achica** al 94% y se **oscurece** al 80% de brillo → sensación de velocidad / arrastre. |
| `75%` | ~490 ms | "Rebote": se inclina levemente al lado contrario (+2°) y se pasa un poquito de tamaño (101%) → efecto de **inercia** al frenar. |
| `100%` | 650 ms | Vuelve al estado normal. |

`@keyframes carousel-slide-prev` (líneas 178–194) es **idéntico pero con los ángulos invertidos** (`skewX(7deg)` en 40% y `skewX(-2deg)` en 75%), para que la inclinación siempre acompañe la dirección del movimiento.

> ✅ Cumple la consigna: animación por `@keyframes` con **porcentajes**, sin spritesheets ni librerías.

### 3.7 Carrusel grande — líneas 197–215

```css
.carousel--featured {
  height: var(--card-h);
  padding-block: 28px;
  margin-top: 14px;
  margin-bottom: -28px;
}
.carousel--featured .carousel__track {
  gap: var(--gap);
  height: var(--card-h);
  padding-inline: calc((100% - var(--card-w)) / 2);
}
```

| Línea | Qué hace |
|---|---|
| `height: var(--card-h);` | Alto igual al de la tarjeta. |
| `padding-block: 28px;` + márgenes negativos | Da aire arriba y abajo dentro del área scrolleable para que el efecto hover (tarjeta sube 6px + brillo) **no se corte**, sin mover el resto del layout. |
| `gap: var(--gap);` | Separación entre tarjetas. |
| `padding-inline: calc((100% - card-w) / 2);` | Relleno a los costados del track igual a "medio carrusel menos media tarjeta". Esto permite **centrar incluso la primera y la última tarjeta**. |

`.featured-card` (línea 217–227) agrega `scroll-snap-align: center;` → al scrollear a mano, se imanta la tarjeta al centro.

### 3.8 Carruseles por categoría — líneas 265–282

```css
.game-section .carousel {
  margin-top: 10px;
  padding-block: 24px;
  margin-bottom: -24px;
  scroll-snap-type: none;
}
.game-section .carousel__track {
  --card-w: 240px;
  gap: 18px;
  height: 165px;
}
```

| Línea | Qué hace |
|---|---|
| `padding-block` + márgenes | Igual que en el grande: espacio para que no se corte el hover. |
| `scroll-snap-type: none;` | Sin imán: la posición inicial deja tarjetas cortadas en los bordes y el snap las "corregiría". |
| `--card-w: 240px; gap: 18px; height: 165px;` | Tamaño de tarjeta y separación en móvil. |

### 3.9 Escritorio — media query `(min-width: 901px)`, líneas 441–481

Sólo cambian **valores**, la lógica es la misma (Mobile First):

| Selector | Cambio |
|---|---|
| `.carousel-box` | Flechas de 58px, a 12px del borde. |
| `.carousel-box--featured` | Flechas de 118px, gap 76.409px, tarjeta de hasta 605.394px (medidas del diseño). `--card-h` y `--card-r` se recalculan solas. |
| `.carousel--featured` | Alto = tarjeta + 56px de aire. |
| `.game-section .carousel__track` | Tarjeta de 280px, gap 43px, alto 192px. |

---

## 4. JavaScript línea por línea (`js/home.js`)

Todo el código está dentro de una **IIFE** `(function () { "use strict"; ... })();` (líneas 11 y 436) para no ensuciar el ámbito global.

### 4.1 `flechas()` — líneas 148–157

```js
function flechas() {
    return (
        '<button class="carousel-arrow carousel-arrow--prev" type="button" aria-label="Ver juegos anteriores">' +
            '<img src="' + BASE_IMAGENES + 'btnant.svg" alt="" width="118" height="104" />' +
        '</button>' +
        '<button class="carousel-arrow carousel-arrow--next" type="button" aria-label="Ver más juegos">' +
            '<img src="' + BASE_IMAGENES + 'btnsig.svg" alt="" width="118" height="104" />' +
        '</button>'
    );
}
```

| Línea | Explicación |
|---|---|
| `function flechas()` | Declara la función, sin parámetros. |
| `return (` | Devuelve un string de HTML. |
| `<button class="carousel-arrow carousel-arrow--prev" type="button" aria-label="…">` | Botón "anterior". `type="button"` evita que actúe como submit. `aria-label` describe el botón para lectores de pantalla. |
| `<img src="… btnant.svg" alt="" …>` | Imagen de la flecha. `alt=""` porque es decorativa (el texto accesible ya está en `aria-label`). `width/height` evitan saltos de layout. |
| Segundo `<button … --next>` | Igual, para "siguiente". |

- **Qué hace:** genera el HTML de las dos flechas.
- **Parámetros:** ninguno. **Retorna:** `string`.
- **Quién la llama:** `renderizar()` (una vez para el carrusel grande y una por cada categoría).

### 4.2 Parte de `renderizar()` que arma los carruseles — líneas 199–231

```js
const trackDestacados = document.querySelector(".carousel--featured .carousel__track");
if (trackDestacados) {
    trackDestacados.innerHTML = DESTACADOS.map(tarjeta_destacado).join("");
}
const boxDestacados = document.querySelector(".carousel-box--featured");
if (boxDestacados) {
    boxDestacados.insertAdjacentHTML("afterbegin", flechas());
}
```

| Línea | Explicación |
|---|---|
| `querySelector(".carousel--featured .carousel__track")` | Busca el track vacío del carrusel grande en `index.html`. |
| `if (trackDestacados)` | Protección por si no existe. |
| `DESTACADOS.map(tarjeta_destacado).join("")` | Convierte cada juego destacado en HTML de tarjeta y los une en un solo string. |
| `insertAdjacentHTML("afterbegin", flechas())` | Inserta las flechas **al principio** de `.carousel-box--featured`, sin borrar el carrusel que ya estaba. |

Luego (líneas 213–230), por cada categoría arma `section > h2 + .carousel-box > flechas() + .carousel > .carousel__track > tarjetas`.

### 4.3 `mejorScroll(carousel, tarjetas)` — líneas 243–269

```js
function mejorScroll(carousel, tarjetas) {
    const ancho = tarjetas[0].offsetWidth;
    const paso = tarjetas[1]
        ? tarjetas[1].offsetLeft - tarjetas[0].offsetLeft
        : ancho;
    if (!paso) return 0;

    const visible = carousel.clientWidth;
    const maximo = carousel.scrollWidth - visible;
    let mejor = 0, mejorPuntaje = -1;

    for (let s = 0; s <= maximo; s++) {
        const izquierda = ancho - (s % paso);
        const derecha = (s + visible) % paso;

        if (izquierda >= ancho || derecha >= ancho) continue;

        const puntaje = Math.min(izquierda, derecha);
        if (puntaje > mejorPuntaje) {
            mejorPuntaje = puntaje;
            mejor = s;
        }
    }
    return mejor;
}
```

| Línea | Explicación |
|---|---|
| `const ancho = tarjetas[0].offsetWidth;` | Ancho en píxeles de una tarjeta. |
| `const paso = tarjetas[1] ? … : ancho;` | Distancia entre el inicio de una tarjeta y la siguiente (= ancho + gap). Si hay una sola tarjeta, usa el ancho. |
| `if (!paso) return 0;` | Si mide 0 (todavía no se dibujó), no desplaza. |
| `const visible = carousel.clientWidth;` | Ancho visible del carrusel. |
| `const maximo = carousel.scrollWidth - visible;` | Máximo `scrollLeft` posible. |
| `let mejor = 0, mejorPuntaje = -1;` | Guardan la mejor posición encontrada y su puntaje. |
| `for (let s = 0; s <= maximo; s++)` | Prueba **cada píxel** de desplazamiento posible. |
| `izquierda = ancho - (s % paso);` | Cuánto se ve de la tarjeta cortada en el borde izquierdo. |
| `derecha = (s + visible) % paso;` | Cuánto se ve de la tarjeta cortada en el borde derecho. |
| `if (izquierda >= ancho \|\| derecha >= ancho) continue;` | Descarta posiciones donde algún borde muestra una tarjeta **entera** (no daría la pista de "hay más"). |
| `puntaje = Math.min(izquierda, derecha);` | El puntaje es el lado más chico: cuanto más grande, más parejo está el recorte en ambos bordes. |
| `if (puntaje > mejorPuntaje) {…}` | Si es mejor que el anterior, lo guarda. |
| `return mejor;` | Devuelve el `scrollLeft` ganador. |

- **Qué hace:** calcula la posición inicial de un carrusel de categoría para que **las tarjetas de ambos bordes queden cortadas de forma pareja** (indicador visual de que hay más contenido).
- **Parámetros:** `carousel` (elemento `.carousel`), `tarjetas` (NodeList de tarjetas).
- **Retorna:** `number` (scrollLeft).
- **Quién la llama:** `alinearCarruseles()`.

### 4.4 `scrollParaCentrar(carousel, tarjeta)` — líneas 272–276

```js
function scrollParaCentrar(carousel, tarjeta) {
    const caja = carousel.getBoundingClientRect();
    const t = tarjeta.getBoundingClientRect();
    return carousel.scrollLeft + t.left - caja.left + t.width / 2 - caja.width / 2;
}
```

| Línea | Explicación |
|---|---|
| `caja = carousel.getBoundingClientRect();` | Posición y tamaño del carrusel en pantalla. |
| `t = tarjeta.getBoundingClientRect();` | Posición y tamaño de la tarjeta en pantalla. |
| `carousel.scrollLeft` | Desplazamiento actual. |
| `+ t.left - caja.left` | Distancia de la tarjeta al borde izquierdo del carrusel. |
| `+ t.width / 2 - caja.width / 2` | Ajuste para que el **centro** de la tarjeta coincida con el **centro** del carrusel. |

- **Qué hace:** calcula el `scrollLeft` que deja una tarjeta exactamente centrada.
- **Parámetros:** `carousel`, `tarjeta` (elemento). **Retorna:** `number`.
- **Quién la llama:** `alinearCarruseles()` y `destinoDelSlide()`.

### 4.5 `alinearCarruseles()` — líneas 280–295

```js
function alinearCarruseles() {
    document.querySelectorAll(".carousel").forEach(function (carousel) {
        const tarjetas = carousel.querySelectorAll(".carousel__track > *");
        if (!tarjetas.length) return;

        if (carousel.classList.contains("carousel--featured")) {
            carousel.scrollLeft = scrollParaCentrar(carousel, tarjetas[1] || tarjetas[0]);
        } else {
            carousel.scrollLeft = mejorScroll(carousel, tarjetas);
        }
        actualizarFlechas(carousel);
    });
}
```

| Línea | Explicación |
|---|---|
| `querySelectorAll(".carousel").forEach(…)` | Recorre todos los carruseles de la página. |
| `tarjetas = carousel.querySelectorAll(".carousel__track > *");` | Obtiene sus tarjetas. |
| `if (!tarjetas.length) return;` | Si está vacío, lo saltea. |
| `if (… "carousel--featured")` | ¿Es el carrusel grande? |
| `scrollParaCentrar(carousel, tarjetas[1] \|\| tarjetas[0])` | Centra la tarjeta de índice 1 (**Peg Solitaire**), con GTA VI y RDR2 a medio ver a los costados. |
| `else … mejorScroll(...)` | Para las categorías, usa el cálculo de recorte parejo. |
| `actualizarFlechas(carousel);` | Muestra/oculta las flechas según la nueva posición. |

- **Qué hace:** deja todos los carruseles en su posición inicial.
- **Parámetros:** ninguno. **Retorna:** nada.
- **Quién la llama:** el bloque `DOMContentLoaded` (al cargar y en cada `resize`).

### 4.6 `DURACION_SLIDE` y `easeInOutCubic(t)` — líneas 299–304

```js
const DURACION_SLIDE = 650;

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
```

| Línea | Explicación |
|---|---|
| `const DURACION_SLIDE = 650;` | Duración del deslizamiento en ms. **Debe coincidir** con los 650ms de la animación CSS. |
| `t < 0.5 ? 4 * t * t * t` | Primera mitad: curva cúbica → **arranca lento y acelera**. |
| `: 1 - Math.pow(-2 * t + 2, 3) / 2` | Segunda mitad: curva cúbica invertida → **desacelera hasta frenar**. |

- **Qué hace:** función de *easing*. Recibe el progreso lineal del tiempo (0 a 1) y devuelve el progreso "suavizado" (0 a 1).
- **Parámetros:** `t` (número entre 0 y 1). **Retorna:** `number` entre 0 y 1.
- **Quién la llama:** `cuadro()` dentro de `deslizar()`.

| t (tiempo) | 0 | 0.25 | 0.5 | 0.75 | 1 |
|---|---|---|---|---|---|
| resultado (recorrido) | 0 | 0.0625 | 0.5 | 0.9375 | 1 |

### 4.7 `maximoScroll(carousel)` — líneas 306–308

```js
function maximoScroll(carousel) {
    return carousel.scrollWidth - carousel.clientWidth;
}
```

- **Qué hace:** devuelve el `scrollLeft` máximo posible (ancho total del contenido − ancho visible).
- **Parámetros:** `carousel`. **Retorna:** `number`.
- **Quién la llama:** `actualizarFlechas()` y `deslizar()`.

### 4.8 `actualizarFlechas(carousel)` — líneas 311–317

```js
function actualizarFlechas(carousel) {
    const caja = carousel.closest(".carousel-box");
    if (!caja) return;
    const margen = 2;
    caja.querySelector(".carousel-arrow--prev").disabled = carousel.scrollLeft <= margen;
    caja.querySelector(".carousel-arrow--next").disabled = carousel.scrollLeft >= maximoScroll(carousel) - margen;
}
```

| Línea | Explicación |
|---|---|
| `carousel.closest(".carousel-box")` | Sube en el DOM hasta la caja que contiene las flechas. |
| `if (!caja) return;` | Protección. |
| `const margen = 2;` | Tolerancia de 2px por redondeos de píxeles fraccionarios. |
| `….prev").disabled = scrollLeft <= margen;` | Si estamos al principio, deshabilita "anterior". |
| `….next").disabled = scrollLeft >= máximo - margen;` | Si estamos al final, deshabilita "siguiente". |

- **Qué hace:** oculta la flecha que ya no tiene sentido (el CSS `:disabled` la vuelve `opacity: 0`).
- **Parámetros:** `carousel`. **Retorna:** nada.
- **Quién la llama:** `alinearCarruseles()` y el listener de `scroll`.

### 4.9 `destinoDelSlide(carousel, dir)` — líneas 320–342

```js
function destinoDelSlide(carousel, dir) {
    const tarjetas = Array.from(carousel.querySelectorAll(".carousel__track > *"));

    if (carousel.classList.contains("carousel--featured")) {
        const caja = carousel.getBoundingClientRect();
        const centroCaja = caja.left + caja.width / 2;
        const distancias = tarjetas.map(function (t) {
            const r = t.getBoundingClientRect();
            return Math.abs(r.left + r.width / 2 - centroCaja);
        });
        const actual = distancias.indexOf(Math.min.apply(null, distancias));
        const vecina = tarjetas[Math.max(0, Math.min(tarjetas.length - 1, actual + dir))];
        return scrollParaCentrar(carousel, vecina);
    }

    const paso = tarjetas[1] ? tarjetas[1].offsetLeft - tarjetas[0].offsetLeft : carousel.clientWidth;
    const porPagina = Math.max(1, Math.floor(carousel.clientWidth / paso) - 1);
    return carousel.scrollLeft + dir * paso * porPagina;
}
```

| Línea | Explicación |
|---|---|
| `Array.from(…)` | Convierte el NodeList en array para poder usar `.map`. |
| `if (… "carousel--featured")` | **Caso carrusel grande:** |
| `centroCaja = caja.left + caja.width / 2;` | Coordenada X del centro del carrusel. |
| `distancias = tarjetas.map(…)` | Para cada tarjeta, distancia de su centro al centro del carrusel. |
| `actual = distancias.indexOf(Math.min.apply(null, distancias));` | Índice de la tarjeta **más cercana al centro** (la que se ve ahora). |
| `vecina = tarjetas[Math.max(0, Math.min(len - 1, actual + dir))];` | La tarjeta siguiente (`dir = 1`) o anterior (`dir = -1`), limitada para no salir del array. |
| `return scrollParaCentrar(carousel, vecina);` | Destino: centrar esa vecina. |
| `paso = …offsetLeft - …offsetLeft` | **Caso categorías:** distancia tarjeta + gap. |
| `porPagina = Math.max(1, Math.floor(clientWidth / paso) - 1);` | Cuántas tarjetas entran enteras, **menos una** (para que siempre quede una tarjeta de referencia). Mínimo 1. |
| `return scrollLeft + dir * paso * porPagina;` | Avanza/retrocede una "página". Como se mueve en múltiplos exactos de `paso`, los bordes siguen cortados igual que al inicio. |

- **Qué hace:** calcula a qué `scrollLeft` debe llegar el carrusel al tocar una flecha.
- **Parámetros:** `carousel`, `dir` (`1` = siguiente, `-1` = anterior). **Retorna:** `number`.
- **Quién la llama:** `deslizar()`.

### 4.10 ⭐ `deslizar(carousel, dir)` — el motor de la animación — líneas 346–374

```js
function deslizar(carousel, dir) {
    const inicio = carousel.scrollLeft;
    const destino = Math.max(0, Math.min(maximoScroll(carousel), destinoDelSlide(carousel, dir)));
    const distancia = destino - inicio;
    if (Math.abs(distancia) < 1) return;

    const track = carousel.querySelector(".carousel__track");
    cancelAnimationFrame(carousel.animacion);

    carousel.style.scrollSnapType = "none";
    track.classList.remove("is-sliding-next", "is-sliding-prev");
    void track.offsetWidth;
    track.classList.add(dir > 0 ? "is-sliding-next" : "is-sliding-prev");

    const t0 = performance.now();
    function cuadro(ahora) {
        const t = Math.min(1, (ahora - t0) / DURACION_SLIDE);
        carousel.scrollLeft = inicio + distancia * easeInOutCubic(t);

        if (t < 1) {
            carousel.animacion = requestAnimationFrame(cuadro);
            return;
        }
        carousel.style.scrollSnapType = "";
        track.classList.remove("is-sliding-next", "is-sliding-prev");
    }
    carousel.animacion = requestAnimationFrame(cuadro);
}
```

| Línea | Explicación |
|---|---|
| `const inicio = carousel.scrollLeft;` | Posición de partida. |
| `const destino = Math.max(0, Math.min(maximoScroll, destinoDelSlide(...)));` | Posición de llegada, **acotada** entre 0 y el máximo (no puede salirse del carrusel). |
| `const distancia = destino - inicio;` | Cuántos píxeles hay que recorrer (positivo = derecha, negativo = izquierda). |
| `if (Math.abs(distancia) < 1) return;` | Si no hay nada que mover (ya en el extremo), sale sin animar. |
| `const track = carousel.querySelector(".carousel__track");` | El track, que recibirá la clase de animación CSS. |
| `cancelAnimationFrame(carousel.animacion);` | Si había una animación en curso (clic rápido repetido), la **cancela** para que no peleen dos animaciones. El id se guarda como propiedad del propio elemento. |
| `carousel.style.scrollSnapType = "none";` | Apaga el scroll-snap: si no, el navegador intentaría "imantar" en cada cuadro y la animación daría tirones. |
| `track.classList.remove("is-sliding-next", "is-sliding-prev");` | Quita cualquier clase anterior. |
| `void track.offsetWidth;` | **Truco de reflow:** leer `offsetWidth` obliga al navegador a recalcular estilos. Así, al volver a agregar la clase, la animación CSS **se reinicia desde 0%** aunque se haga clic varias veces seguidas. `void` descarta el valor. |
| `track.classList.add(dir > 0 ? "is-sliding-next" : "is-sliding-prev");` | Agrega la clase según la dirección → arranca el `@keyframes` en CSS. |
| `const t0 = performance.now();` | Momento exacto de inicio (alta precisión). |
| `function cuadro(ahora) {` | Función que se ejecuta **en cada frame** (~60 veces por segundo). `ahora` lo pasa `requestAnimationFrame`. |
| `const t = Math.min(1, (ahora - t0) / DURACION_SLIDE);` | Progreso del tiempo de 0 a 1 (topeado en 1). |
| `carousel.scrollLeft = inicio + distancia * easeInOutCubic(t);` | Mueve el carrusel a la posición correspondiente según la curva suave. |
| `if (t < 1) { carousel.animacion = requestAnimationFrame(cuadro); return; }` | Si no terminó, agenda el siguiente frame y guarda su id. |
| `carousel.style.scrollSnapType = "";` | Al terminar, restaura el snap (vuelve al valor del CSS). |
| `track.classList.remove(...)` | Quita la clase: las tarjetas quedan en estado normal y la animación queda lista para el próximo clic. |
| `carousel.animacion = requestAnimationFrame(cuadro);` | **Arranca** el bucle de animación. |

- **Qué hace:** anima el desplazamiento del carrusel desde la posición actual hasta el destino en 650 ms, con aceleración/desaceleración suave, mientras dispara la animación CSS de inclinación de las tarjetas.
- **Parámetros:** `carousel` (elemento `.carousel`), `dir` (`1` o `-1`).
- **Retorna:** nada.
- **Quién la llama:** el listener de clic.

**¿Por qué `requestAnimationFrame` y no `scrollTo({behavior: "smooth"})`?** Porque así se controla la **duración exacta** (650 ms, sincronizada con el CSS) y la **curva de velocidad**; el scroll suave nativo no permite ninguna de las dos, y la consigna pide una animación programada, no un desplazamiento nativo.

### 4.11 Listener de clic (parte de flechas) — líneas 392–399

```js
document.addEventListener("click", function (evento) {
    const flecha = evento.target.closest(".carousel-arrow");
    if (flecha) {
        const carousel = flecha.closest(".carousel-box").querySelector(".carousel");
        deslizar(carousel, flecha.classList.contains("carousel-arrow--next") ? 1 : -1);
        return;
    }
    ...
});
```

| Línea | Explicación |
|---|---|
| `document.addEventListener("click", …)` | **Delegación de eventos:** un solo listener en todo el documento, en vez de uno por flecha. Funciona aunque las flechas se creen después con JS. |
| `evento.target.closest(".carousel-arrow")` | Si se hizo clic en la flecha o en su `<img>` interna, encuentra el botón. |
| `flecha.closest(".carousel-box").querySelector(".carousel")` | Sube a la caja y baja al carrusel asociado a esa flecha. |
| `…contains("carousel-arrow--next") ? 1 : -1` | Dirección: `1` si es "siguiente", `-1` si es "anterior". |
| `return;` | Termina: no evalúa los otros casos (carrito, tarjetas). |

### 4.12 Inicio — `DOMContentLoaded`, líneas 418–434

```js
document.addEventListener("DOMContentLoaded", function () {
    renderizar();
    requestAnimationFrame(alinearCarruseles);
    window.addEventListener("resize", alinearCarruseles);

    document.addEventListener("scroll", function (evento) {
        const el = evento.target;
        if (el.classList && el.classList.contains("carousel")) actualizarFlechas(el);
    }, true);
});
```

| Línea | Explicación |
|---|---|
| `DOMContentLoaded` | Espera a que el HTML esté cargado. |
| `renderizar();` | Crea tarjetas y flechas. |
| `requestAnimationFrame(alinearCarruseles);` | Espera al próximo frame para que el navegador ya haya calculado los tamaños, y recién ahí posiciona los carruseles. |
| `window.addEventListener("resize", alinearCarruseles);` | Si cambia el tamaño de la ventana, recalcula (los anchos dependen del viewport). |
| `document.addEventListener("scroll", …, true);` | Escucha el scroll de **cualquier** carrusel (también el manual con dedo/trackpad). El `true` usa **fase de captura**, porque el evento `scroll` de un elemento **no burbujea** hasta `document`. |
| `if (el.classList && …contains("carousel")) actualizarFlechas(el);` | Si lo que scrolleó es un carrusel, actualiza sus flechas. `el.classList &&` protege el caso en que el target sea el propio `document` (no tiene `classList`). |

---

## 5. Preguntas típicas de defensa

| Pregunta | Respuesta corta |
|---|---|
| ¿Dónde está la animación del carrusel? | En `css/home.css:152-194` (keyframes) + `js/home.js:346-374` (`deslizar`). |
| ¿Cómo se sincronizan JS y CSS? | Ambos duran 650 ms; JS agrega la clase `is-sliding-*` al empezar y la quita al terminar. |
| ¿Para qué sirve `void track.offsetWidth`? | Fuerza un reflow para que la animación CSS se reinicie si se hace clic seguido. |
| ¿Por qué se apaga el scroll-snap? | Porque el snap corregiría la posición en cada frame y la animación daría saltos. |
| ¿Por qué `cancelAnimationFrame`? | Para cortar una animación anterior si se vuelve a hacer clic antes de que termine. |
| ¿Por qué el scroll se escucha con `true`? | El evento `scroll` no burbujea; en fase de captura sí llega al `document`. |
| ¿Diferencia entre carrusel grande y chicos? | El grande centra la tarjeta vecina (de a una); los chicos avanzan una "página" (tarjetas visibles − 1). |
| ¿Cómo se logra que los laterales del grande se vean a medias? | El carrusel mide 2 tarjetas + 2 huecos; al centrar una tarjeta, las vecinas quedan cortadas a la mitad. |
| ¿Se usa alguna librería? | No. HTML, CSS y JS vainilla. |

---

## 6. Tabla resumen de métodos

| Método | Ubicación | Descripción |
|---|---|---|
| `flechas()` | `js/home.js:148` | Genera el HTML de las flechas anterior/siguiente. |
| `renderizar()` | `js/home.js:199` | Crea las tarjetas, las flechas y la estructura de todos los carruseles. |
| `mejorScroll(carousel, tarjetas)` | `js/home.js:243` | Posición inicial de los carruseles de categoría con bordes cortados de forma pareja. |
| `scrollParaCentrar(carousel, tarjeta)` | `js/home.js:272` | `scrollLeft` que centra una tarjeta. |
| `alinearCarruseles()` | `js/home.js:280` | Aplica la posición inicial a todos los carruseles. |
| `easeInOutCubic(t)` | `js/home.js:302` | Curva de velocidad suave (acelera y frena). |
| `maximoScroll(carousel)` | `js/home.js:306` | `scrollLeft` máximo posible. |
| `actualizarFlechas(carousel)` | `js/home.js:311` | Deshabilita/oculta las flechas en los extremos. |
| `destinoDelSlide(carousel, dir)` | `js/home.js:320` | Calcula a dónde ir al tocar una flecha. |
| `deslizar(carousel, dir)` | `js/home.js:346` | Anima el desplazamiento (rAF + easing) y dispara la animación CSS. |
| `cuadro(ahora)` | `js/home.js:362` | Función interna de `deslizar`: mueve el carrusel en cada frame. |
| Listener `click` | `js/home.js:392` | Detecta clic en flecha y llama a `deslizar`. |
| Listener `DOMContentLoaded` | `js/home.js:418` | Renderiza, alinea, escucha `resize` y `scroll`. |
| `@keyframes carousel-slide-next` | `css/home.css:160` | Inclina/achica las tarjetas al ir hacia la derecha. |
| `@keyframes carousel-slide-prev` | `css/home.css:178` | Lo mismo hacia la izquierda. |
| `@keyframes arrow-nudge` | `css/home.css:111` | Rebote de la flecha en hover. |

---

## 7. Cumplimiento de la consigna

- ✅ **Transición animada y fluida programada** entre imágenes: `deslizar()` con `requestAnimationFrame` + `easeInOutCubic` (no es un desplazamiento nativo estático).
- ✅ **Animaciones `@keyframes` por porcentaje** (0% / 40% / 75% / 100%), sin spritesheets.
- ✅ **Carrusel principal** grande al centro (Peg Solitaire) con laterales cortados a la mitad, y **carruseles normales** por categoría debajo.
- ✅ **Sin librerías ni frameworks**: todo en HTML, CSS y JavaScript vainilla.
- ✅ **Mobile First**: estilos base para celular y media query `(min-width: 901px)` para escritorio.
