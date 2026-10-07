# Explicación del proyecto — TPE Interfaces (UNICEN)

Guía de estudio para la defensa oral. Explica qué es cada archivo, qué pasa desde que se abre el sitio, cómo funcionan los carruseles y qué preguntas pueden hacer.

**Aclaración clave:** la pantalla de carga y `templatesListos` no están conectados entre sí. El loader dura 5 segundos por reloj; no espera a los templates ni a la API.

---

## 1. Mapeo y arquitectura general

| Carpeta / archivo | Qué es, en simple |
|---|---|
| `index.html` | La Home. Casi vacía: tiene "huecos" (`#header-container`, `#game-sections`, `#footer-container`) que rellena JavaScript. |
| `pages/` | Las otras páginas: `login.html`, `register.html`, `game_solitare.html`. |
| `templates/` | Pedazos de HTML reutilizables (*partials*): `header.html`, `header-auth.html` (header simple de login/registro) y `fat-footer.html`. |
| `css/` | Un archivo por responsabilidad: `base.css` (común), `header.css`, `footer.css`, `home.css`, `loading.css`, `login.css`, `register.css`, `game.css`. |
| `js/main.js` | Común a todas las páginas: inyecta header y footer con `fetch`. |
| `js/loading.js` | La pantalla de carga de 5 segundos (solo en la Home). |
| `js/home.js` | Arma los carruseles de la Home con datos locales y de la API de la cátedra. |
| `js/menu-hambur.js` | Abre y cierra el menú de categorías. |
| `js/form-utils.js` | Validaciones compartidas (objeto `Formulario`). |
| `js/login.js`, `js/register.js` | Reglas propias de cada formulario; usan `Formulario`. |
| `assets/` | Imágenes: portadas por categoría en `assets/games/<categoria>/`, íconos, etc. |

### Analogía: un shopping

Cada página es un local distinto, pero todos comparten la misma entrada y el mismo cartel de salida (header y footer). En vez de construir la entrada en cada local, hay un único molde guardado en el depósito (`templates/`), y un empleado (`main.js`) lo coloca en cada local al abrir. El CSS es la decoración, `assets/` la mercadería y `home.js` el repositor que llena las góndolas (los carruseles).

---

## 2. El flujo de la aplicación, paso a paso (Home)

1. **El navegador lee el `<head>`** y carga los 5 CSS. Encuentra `<script src="js/loading.js">` **sin `defer`**, así que lo ejecuta en ese mismo momento, antes de dibujar el body.
2. **`loading.js` crea el overlay** con `document.createElement` y lo agrega. Como el `<body>` todavía no existe, usa `document.body || document.documentElement`. También agrega la clase `is-cargando` al `<html>`.
3. **`is-cargando` solo hace una cosa:** `overflow: hidden`, o sea, bloquea el scroll mientras carga (`css/loading.css`, línea 91).
4. **Arranca la animación** con `requestAnimationFrame`. En cada cuadro calcula `avance = tiempo transcurrido / 5000`, actualiza el número y el ancho de la barra. Al llegar a 1 pinta 100%, espera 450 ms, agrega `is-hidden`, saca `is-cargando` y elimina el overlay.
5. **Mientras tanto, el navegador sigue leyendo el body** y encuentra los tres scripts con `defer` (`main.js`, `menu-hambur.js`, `home.js`). `defer` significa: "descargalos en paralelo, pero ejecutalos en orden cuando el HTML ya esté completo".
6. **`main.js` se ejecuta** y calcula `BASE_TEMPLATES`. En `DOMContentLoaded` lanza dos `fetch` en paralelo (header y footer) con `Promise.all`. El resultado queda guardado en la constante global `templatesListos`.
7. **`menu-hambur.js` hace `templatesListos.then(conectarMenu)`**: espera a que el header exista en el DOM antes de buscar el botón del menú. Sin esa espera, `querySelector(".menu-trigger")` devolvería `null`.
8. **`home.js`** dibuja primero los 3 destacados fijos (GTA VI, Peg Solitaire, RDR2) y la sección Premium con datos locales. Después pide los juegos a la API; cuando responde, completa el carrusel grande y las categorías. Si la API falla, devuelve `[]` y la página queda con lo local.

### En login y registro

El flujo es igual pero sin loader. El contenedor dice `data-template="header-auth.html"` para pedir otro header. Como esas páginas no tienen `#footer-container`, `cargarTemplate` devuelve `Promise.resolve()` y no pasa nada.

### En la página del juego

`game_solitare.html` solo carga `main.js` y `menu-hambur.js`. No tiene un script propio del juego: hoy esa página es maquetación.

---

## 3. Explicación técnica llana

### `BASE_TEMPLATES` (`js/main.js`, línea 16)

```js
new URL("../templates/", document.currentScript.src).href
```

- **Problema:** `index.html` está en la raíz y `login.html` en `pages/`. Desde uno la ruta sería `templates/header.html` y desde el otro `../templates/header.html`.
- **Solución:** en vez de calcular la ruta desde la página, se calcula desde el propio archivo `main.js`, que siempre está en `js/`. "Un nivel arriba y entro a templates" vale siempre.
- `document.currentScript` solo existe mientras el script se está ejecutando, por eso se guarda en una constante al principio.

### `resolverRutas` y la expresión regular (`js/main.js`, línea 23)

```js
/(\s(?:src|href)\s*=\s*)(["'])(\.\.\/[^"']+)\2/g
```

- **Problema:** el header tiene rutas como `../assets/icons/logo.png`, pensadas desde `templates/`. Al inyectarlo en `index.html`, ese `../` apuntaría fuera del proyecto y las imágenes se romperían.
- **Qué busca la regex**, por partes:
  - `(\s(?:src|href)\s*=\s*)` → un atributo `src=` o `href=`.
  - `(["'])` → la comilla que abre, simple o doble.
  - `(\.\.\/[^"']+)` → una ruta que empiece con `../`.
  - `\2` → la misma comilla que abrió.
  - `g` → todas las apariciones, no solo la primera.
- **Qué hace:** reemplaza cada ruta por su URL absoluta con `new URL(ruta, BASE_TEMPLATES)`. Las rutas que no empiezan con `../` (como `#` o `https://...`) no se tocan.

### `cargarTemplate` nunca falla

Tiene un `.catch` que solo escribe en consola. Así, si el footer no carga, `Promise.all` igual se resuelve y el menú se conecta. Un error no tira abajo toda la página.

### IIFE: `(function () { ... })();`

Todos los JS están envueltos en una función que se ejecuta sola. Sirve para que las variables no queden globales ni se pisen entre archivos. Las únicas globales a propósito son `templatesListos` y `Formulario`.

### El loader usa `requestAnimationFrame` y no `setInterval`

Se sincroniza con el refresco de pantalla y mide el tiempo real con `performance.now()`, así dura 5 segundos exactos aunque la PC sea lenta. La función `suavizar` (`t*t*(3-2t)`) hace que arranque lento, acelere y frene al final.

### Validación de formularios

`validarCampos` recorre los inputs y aplica un objeto de reglas: `{ nombreDelCampo: función que devuelve el error o "" }`. Login y registro comparten el motor y solo cambian las reglas.

Expresiones regulares de registro:

- `SOLO_LETRAS` = `/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/` → solo letras (con acentos) y espacios, de principio a fin.
- `/\s/` → detecta espacios; el nickname no puede tenerlos.

Al registrarse con éxito, `mostrarAnimacionExito` agrega la clase `is-success` y una tarjeta con un tilde SVG que se dibuja con `@keyframes` (`css/register.css`).

---

## 4. Los carruseles de `home.js`

Hay **dos carruseles que funcionan de forma totalmente distinta**: el grande no se desplaza (las tarjetas están apiladas y se mueven con `transform`), y los de abajo sí se desplazan (scroll real, animado a mano).

### 4.1 Cómo se organiza el archivo

| Sección | Qué hace |
|---|---|
| 1. Datos y estado | Los 3 destacados fijos, la categoría Premium, las categorías y la variable `activo`. |
| 2. Plantillas | Funciones que devuelven el HTML de una tarjeta como texto. |
| 3. Datos de la API | Pide los juegos, los convierte a nuestro formato y los reparte. |
| 4. Render | Mete ese HTML en la página con `innerHTML`. |
| 5. Posición inicial | Acomoda los carruseles de abajo para que los bordes queden cortados. |
| 6. Coverflow | El carrusel grande. |
| 7. Desplazamiento animado | Los carruseles por categoría. |
| 8. Clics | Un solo listener para flechas, carrito y tarjetas. |
| 9. Inicio | Arranca todo en `DOMContentLoaded`. |

**Analogía:** es una cocina. Los datos son los ingredientes, las plantillas son los moldes, el render es emplatar, y las secciones 6 a 8 son el mozo que atiende lo que pide el cliente.

### 4.2 El carrusel grande (coverflow)

**La idea:** todas las tarjetas están en el mismo lugar, apiladas en el centro. El CSS lo logra con `position: absolute; left: 50%` (`css/home.css`, línea 193). JavaScript le da a cada una un `transform` distinto según qué tan lejos está de la tarjeta activa.

**Una sola variable manda:** `activo`, el índice de la tarjeta que está al frente. Cambiar de juego es cambiar ese número y volver a acomodar todas.

**`distanciaCircular(i)`** (`js/home.js`, línea 436) responde: "¿a cuántos lugares está la tarjeta `i` de la activa, y de qué lado?".

```js
let distancia = ((i - activo) % n + n) % n;
if (distancia > n / 2) distancia -= n;
```

- La lista se piensa como un reloj, no como una fila: después del último viene el primero.
- `((x % n) + n) % n` es el truco para que el resto nunca dé negativo. En JavaScript `-1 % 7` da `-1`, y necesitamos `6`.
- Si la distancia es más de media vuelta, conviene ir por el otro lado, y por eso se resta `n`.
- Ejemplo con 7 tarjetas y `activo = 0`: la tarjeta 6 da distancia 6, que es mayor que 3,5, así que queda en `-1`: está una posición a la izquierda.

**`colocarDestacados()`** (`js/home.js`, línea 446) recorre las tarjetas y a cada una le aplica:

- `distancia === 0` → de frente, sin giro, con la clase `is-active`.
- Las demás → `translateX` (se corre al costado, más lejos cuanto mayor la distancia), `translateZ(-220px)` (se aleja) y `rotateY(±50deg)` (gira hacia el centro).
- `zIndex = 10 - lejos` → las más cercanas tapan a las lejanas.
- `opacity = 0` si está a más de 3 lugares.

**¿Y la animación?** JavaScript no anima nada: solo cambia el `transform`. La animación la hace el CSS con `transition: transform 650ms cubic-bezier(...)` en `.featured-card`. El efecto 3D sale de `perspective: 1000px` en el track.

**El detalle fino:** cuando una tarjeta pasa del extremo derecho al izquierdo, cruzaría toda la pantalla por delante. Para evitarlo:

```js
const salta = Math.abs(distancia - anterior) > 1;
if (salta) tarjeta.style.transition = "none";
// ...se aplica la posición nueva...
void tarjeta.offsetWidth;
tarjeta.style.transition = "";
```

- Si la distancia cambió más de 1 de golpe, esa tarjeta dio la vuelta.
- Se le apaga la transición, se la mueve y se vuelve a prender.
- `void tarjeta.offsetWidth` obliga al navegador a aplicar el cambio en ese instante (forzar un *reflow*). Sin esa línea, el navegador juntaría los dos cambios y animaría igual.

**En celular** se puede deslizar el dedo: se guarda la X en `touchstart`, se compara en `touchend`, y si se movió más de 40 px se llama a `moverDestacados`.

### 4.3 Los carruseles por categoría

**La idea:** acá sí hay scroll real. `.carousel` tiene `overflow-x: auto` con la barra oculta, y `.carousel__track` es un `display: flex` con todas las tarjetas en fila.

**`deslizar(carousel, dir)`** (`js/home.js`, línea 511) hace dos cosas a la vez durante 650 ms:

1. **Mueve el scroll cuadro a cuadro** con `requestAnimationFrame`:
   ```js
   const t = Math.min(1, (ahora - t0) / DURACION_SLIDE);
   carousel.scrollLeft = inicio + distancia * easeInOutCubic(t);
   ```
   `t` va de 0 a 1 según el tiempo real. `easeInOutCubic` lo curva para que arranque suave, acelere y frene.
2. **Agrega la clase `is-sliding-next` o `is-sliding-prev`**, que dispara el `@keyframes carousel-slide` (`css/home.css`, línea 156): las tarjetas se inclinan, se achican y se oscurecen, y vuelven.

Ese `@keyframes` es por porcentajes (0%, 40%, 75%, 100%) y usa una variable CSS `--dir` (1 o -1) para invertir la inclinación. Así una sola animación sirve para los dos sentidos.

**`destinoDelSlide`** calcula cuánto avanzar: las tarjetas que entran enteras menos una, para que siempre quede una conocida como referencia. Como avanza en múltiplos exactos de "tarjeta + hueco", los bordes siguen cortados.

**`mejorScroll`** (`js/home.js`, línea 393) resuelve la posición inicial. Prueba cada scroll posible, píxel por píxel, y se queda con aquel donde las tarjetas de los dos bordes quedan cortadas de forma pareja. El recorte es la pista visual de "hay más juegos para ver". Se recalcula en `resize`.

**`actualizarFlechas`** deshabilita la flecha "anterior" al principio y la "siguiente" al final.

### 4.4 Los clics: delegación de eventos

Hay **un solo** `addEventListener("click")` en `document` (`js/home.js`, línea 554), no uno por botón.

- **Por qué:** las tarjetas se crean con `innerHTML` y se vuelven a crear cuando responde la API. Un listener puesto sobre una tarjeta se perdería al redibujar.
- **Cómo:** el clic "sube" (burbujea) hasta `document`, y con `evento.target.closest(".carousel-arrow")` se averigua qué se tocó.
- Lo mismo con el scroll, pero ese evento no burbujea, así que se escucha en fase de captura (el `true` del final, línea 623).

### 4.5 La API

- `cargarJuegosApi` hace `fetch`, convierte cada juego a nuestro formato y, si falla, devuelve `[]`.
- `armarDestacados` toma los 4 mejor valorados y pone la mitad a cada lado de los 3 fijos, así Peg Solitaire queda en el medio.
- `armarCategorias` reparte cada juego en **una sola** categoría: entre las que le corresponden por género, la que menos juegos tiene. Así no se repiten y los carruseles quedan parejos (máximo 10 de la API por categoría).
- `noEsDestacado` evita que un juego del carrusel grande aparezca abajo.
- `clasesTitulo` achica la letra según el largo del título (hasta 13, hasta 17, más de 17 caracteres). Responde al requisito de títulos de distinta longitud.

---

## 5. Preguntas de defensa (simulacro)

### Arquitectura, rutas y asincronismo

**1. ¿Por qué cargan el header con `fetch` en vez de copiarlo en cada página?**
Para no repetir código: si cambio un link del menú, lo cambio en un solo archivo. Sin framework ni backend, `fetch` + `innerHTML` es la forma nativa de tener componentes reutilizables.

**2. Si abro `index.html` con doble clic, ¿funciona?**
No se ven header ni footer: `fetch` no puede leer archivos con `file://` por seguridad del navegador (CORS). Hace falta un servidor, como Live Server o GitHub Pages. El resto de la página sí carga, porque el error se captura.

**3. ¿Qué es una promesa y para qué sirve `templatesListos`?**
Una promesa es un "vale" por un resultado que todavía no llegó. `fetch` es asíncrono: el código sigue sin esperar. `templatesListos` es el vale que dice "el header y el footer ya están en la página"; el menú hamburguesa espera ese vale con `.then` antes de conectar sus eventos.

**4. ¿Por qué `Promise.all`?**
Lanza los dos pedidos en paralelo y espera a que terminen ambos. Es más rápido que pedir uno y después el otro.

**5. ¿Qué diferencia hay entre el script del loader y los demás?**
El loader va en el `<head>` sin `defer` para ejecutarse antes de que se pinte nada y tapar la página desde el primer instante. Los demás van con `defer` porque necesitan que el HTML ya exista y deben ejecutarse en orden (`main.js` primero, porque define `templatesListos`).

**6. ¿Su loading es real o simulado? ¿Cómo garantizan los 5 segundos?**
Simulado, como pide la consigna. Se calcula el avance con el tiempo real transcurrido sobre 5000 ms, no contando pasos, así que no se atrasa. No es un GIF: el número y la barra los actualiza JS, y los tres puntitos son un `@keyframes` por porcentajes (`loader-salto`).

**7. ¿Qué pasa si la API de la cátedra se cae?**
`cargarJuegosApi` tiene un `.catch` que devuelve una lista vacía. El carrusel grande queda con los tres juegos fijos y las categorías con sus portadas locales. La página nunca queda en blanco.

**8. ¿Dónde está el Mobile First?**
En `css/home.css` los estilos base son para celular y el escritorio se agrega con `@media (min-width: 901px)`. Mobile First es escribir primero lo chico y ampliar con `min-width`.

### Carruseles

**9. ¿La transición del carrusel es CSS o JavaScript?**
En el grande, CSS puro: JS solo cambia el `transform` y `transition` lo anima. En los de abajo es mixto: JS anima el scroll y un `@keyframes` deforma las tarjetas.

**10. ¿Por qué no usaron `scroll-behavior: smooth`?**
Porque no deja controlar la duración ni la curva, y la consigna pide una animación programada. Con `requestAnimationFrame` duran exactamente 650 ms, igual que el `@keyframes`.

**11. ¿Cómo hacen que el carrusel grande sea infinito?**
Con aritmética modular: el índice activo se calcula con `% n`, y la distancia se mide por el camino más corto del círculo.

**12. ¿Para qué sirve `void track.offsetWidth`?**
Para reiniciar una animación CSS. Sacar y poner la misma clase seguido no la reinicia; leer una medida entre medio obliga al navegador a registrar el cambio.

**13. ¿Qué es la delegación de eventos y por qué la usan?**
Un solo listener en un elemento padre que atiende a todos los hijos. Sirve porque las tarjetas se generan y regeneran dinámicamente.

**14. ¿Por qué se dibuja dos veces la Home?**
Primero con datos locales, para que haya contenido de inmediato; después con la API cuando responde. Si la API no responde, queda la primera versión.

**15. ¿Qué pasa si el usuario tiene activado "reducir movimiento"?**
Hay un `@media (prefers-reduced-motion: reduce)` en `css/home.css` (línea 570) que apaga transiciones. Es un punto de accesibilidad que suma mencionar.

---

## 6. Para practicar

Abrir la Home con las DevTools, tocar una flecha del carrusel grande y mirar cómo cambia el `style` de cada `.featured-card`: ahí se ve en vivo todo lo de la sección 4.2.
