# Entrega 3: Blocka — Guía de Estudio y Defensa Oral

Apunte completo para estudiar cómo funcionan en conjunto [`pages/game_blocka.html`](pages/game_blocka.html), [`css/blocka.css`](css/blocka.css) y [`js/blocka.js`](js/blocka.js), conectado con la teoría de la cátedra (*Color, píxeles y filtros*) y con recetas listas por si piden cambios en vivo durante la defensa.

---

## 1. Cómo trabajan juntos los 3 archivos

La arquitectura separa estrictamente **estructura (HTML)**, **presentación/animaciones (CSS)** y **lógica/manipulación de píxeles (JS)**:

| Elemento / ID / Clase | En `game_blocka.html` | En `blocka.css` | En `blocka.js` |
|---|---|---|---|
| `#blocka-nivel`, `#blocka-filtro`, `#blocka-tiempo`, `#blocka-record` | Marcadores de la barra de estado (`.blocka__hud`, [líneas 33-38](pages/game_blocka.html#L33-L38)) | Grilla de 4 columnas (`.blocka__hud`, [líneas 18-47](css/blocka.css#L18-L47)) | Los actualiza con `textContent` en `mostrarNivel()`, `mostrarTiempo()` y `mostrarRecord()` |
| `#blocka-miniaturas` | Contenedor vacío ([línea 41](pages/game_blocka.html#L41)) | Grilla de 6 columnas; `.is-activa` aplica borde neón y `scale(1.1)` ([líneas 50-73](css/blocka.css#L50-L73)) | `crearMiniaturas()` inyecta las 6 `<img>`; `elegirImagen()` alterna `.is-activa` |
| `#blocka-board` | Contenedor vacío del tablero ([línea 45](pages/game_blocka.html#L45)) | CSS Grid dinámico que lee `--cols` y `--rows`; `.is-resuelto` pasa el `gap` de `3px` a `0` ([líneas 86-99](css/blocka.css#L86-L99)) | `armarTablero()` define `--cols` y `--rows`, vacía el tablero e inserta un `<canvas>` por pieza |
| `.blocka__pieza` | *(Lo crea JS dinámicamente)* | Da tamaño `100%`, `cursor: pointer` y anima el giro con `transition: transform 280ms ease` ([líneas 101-117](css/blocka.css#L101-L117)) | `crearPieza()` crea cada `<canvas>`, dibuja su recorte, aplica el filtro y cambia `style.transform` |
| `.is-fija` | *(La agrega JS en la ayudita)* | Quita el cursor de mano y pinta un borde interno neón con `box-shadow: inset` ([líneas 114-117](css/blocka.css#L114-L117)) | `ayudita()` la agrega al `<canvas>` de la pieza acomodada y pone `pieza.fija = true` |
| `#blocka-piezas`, `#blocka-comenzar`, `#blocka-ayuda`, `#blocka-siguiente`, `#blocka-menu` | Selector de piezas (`4`, `6`, `8`) y botones de control ([líneas 52-65](pages/game_blocka.html#L52-L65)) | Estilos de botones `.blocka__btn`, estados `:disabled` y `[hidden]` ([líneas 128-183](css/blocka.css#L128-L183)) | Habilita/deshabilita (`disabled`) o muestra/oculta (`hidden`) según el estado de la partida |

---

## 2. Flujo completo de una partida (paso a paso)

1. **Carga inicial**: Al abrir [`game_blocka.html`](pages/game_blocka.html), se ejecuta [`blocka.js`](js/blocka.js) al final gracias a `defer`. Llama a `crearMiniaturas()` (inserta las 6 imágenes del banco arriba del tablero) y a `volverAlMenu()` (deja el nivel en 0, el reloj en `00:00`, muestra el récord guardado para 4 piezas y habilita el botón **Comenzar**).
2. **Clic en "Comenzar" (`comenzar`)**:
   - Deshabilita el botón **Comenzar** y el selector de piezas para que el usuario no cambie nada a mitad de camino.
   - Llama a `elegirImagen()`, que elige un índice al azar (`0` a `5`) y con un `setInterval` cada `150 ms` va prendiendo y apagando la clase `.is-activa` en las miniaturas. Da **2 vueltas completas** y frena en la elegida.
3. **Carga asincrónica de la imagen (`new Image()`)**:
   - Después de `700 ms` de pausa para que se vea qué miniatura salió sorteada, crea un objeto `new Image()`, configura `img.onload = function () { ... }` y recién ahí asigna `img.src = IMAGENES[indice]`.
4. **Armado del tablero (`armarTablero` + `crearPieza`)**:
   - Cuando la imagen termina de cargar en memoria (`onload`), `armarTablero()` lee la grilla elegida (`4 → [2,2]`, `6 → [3,2]`, `8 → [4,2]`), configura las variables CSS `--cols` y `--rows` en `#blocka-board`, y recorre con un doble `for (fila, col)`.
   - Por cada celda llama a `crearPieza(col, fila, cols, filas)`, que:
     1. Crea un `<canvas>` cuadrado de `200 × 200` píxeles.
     2. Elige una rotación inicial al azar entre `90°`, `180°` o `270°` (nunca `0°`).
     3. Dibuja en el canvas la porción de la imagen que corresponde a esa `(col, fila)` con `dibujarPieza()`.
     4. Le aplica el filtro del nivel actual píxel a píxel con `aplicarFiltro()`.
     5. Aplica el giro visual inicial con `canvas.style.transform = rotate(...)`.
     6. Conecta los eventos `click` (gira `-90°`) y `contextmenu` (gira `+90°`).
5. **Durante el juego**:
   - Arranca el reloj (`setInterval(avanzarTiempo, 1000)`).
   - Cada clic en una pieza suma `-90` o `+90` a `pieza.rot`, actualiza el `transform` CSS y verifica si todas las piezas cumplen `pieza.rot % 360 === 0` (`piezas.every(estaBien)`).
6. **Fin del nivel (`ganar` o `perder`)**:
   - **Si todas las piezas están derechas (`ganar`)**: se frena el reloj, se redibuja cada pieza con `dibujarPieza()` **sin llamar a `aplicarFiltro()`** (así vuelve el color original de inmediato), se agrega `.is-resuelto` al tablero (las piezas se pegan sin bordes), se guarda el récord en `localStorage` si mejoró el tiempo, y se muestra el botón **Siguiente nivel** (o el mensaje final si era el nivel 3).
   - **Si se acaba el tiempo límite en los niveles 2 o 3 (`perder`)**: se frena el reloj, se bloquean los giros (`jugando = false`) y el botón **Comenzar** pasa a decir **"Reintentar"**.

---

## 3. Explicación bloque por bloque de `js/blocka.js`

### 3.1 Configuración y Estado ([líneas 10-52](js/blocka.js#L10-L52))

- **`NIVELES`**: Es un arreglo de objetos `{ filtro, nombre, limite }`. El nivel 1 no tiene límite (`0`), el nivel 2 tiene `120` segundos y el nivel 3 tiene `90` segundos.
- **`GRILLAS`**: Diccionario `{ 4: [2, 2], 6: [3, 2], 8: [4, 2] }` donde cada par es `[columnas, filas]`.
- **`piezas`**: Arreglo de objetos `{ canvas, col, fila, rot, fija }`. Guarda el estado lógico de cada cuadrante en memoria.
- **IIFE `(function () { "use strict"; ... })();`**: Envuelve todo el archivo para no ensuciar el `window` global con variables como `nivel` o `reloj`.

---

### 3.2 Filtros píxel a píxel con `ImageData` ([líneas 54-85](js/blocka.js#L54-L85))

Este es el corazón teórico de la Entrega 3 y sigue al pie de la letra el PDF de la cátedra:

```js
function aplicarFiltro(canvas, tipo) {
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (x + y * width) * 4;
            // ... modifica data[i], data[i + 1], data[i + 2] ...
        }
    }

    ctx.putImageData(imageData, 0, 0);
}
```

**Puntos clave que te pueden preguntar en la defensa:**

1. **¿Qué es `ImageData` y qué es `data`?**
   `ctx.getImageData(0, 0, width, height)` devuelve una **copia en memoria** de los píxeles del canvas. Su propiedad `data` es un arreglo plano (`Uint8ClampedArray`) donde cada píxel ocupa **4 posiciones consecutivas**:
   - `data[i]` → **R** (Rojo, `0` a `255`)
   - `data[i + 1]` → **G** (Verde, `0` a `255`)
   - `data[i + 2]` → **B** (Azul, `0` a `255`)
   - `data[i + 3]` → **A** (Alfa/Opacidad, `0` transparente a `255` opaco). En los filtros no lo tocamos porque la pieza sigue siendo totalmente opaca (`255`).
2. **¿Por qué la fórmula del índice es `(x + y * width) * 4`?**
   Porque pensamos la imagen como una matriz 2D `(x, y)`, pero en memoria vive en un arreglo 1D fila por fila. Para llegar a la fila `y` hay que saltar `y` filas completas de `width` píxeles (`y * width`), sumarle la columna `x`, y multiplicar todo por `4` porque cada píxel tiene 4 bytes (R, G, B, A).
3. **¿Por qué si modifico `imageData.data` no cambia el canvas hasta el final?**
   Porque `imageData` es una copia en memoria. El canvas recién se entera cuando ejecutamos `ctx.putImageData(imageData, 0, 0)` al terminar el doble `for`. Hacerlo una sola vez al final es muchísimo más rápido que pintar píxel por píxel con `fillRect`.
4. **¿Qué hace cada uno de los 3 filtros?**
   - **Escala de grises (`grises`)**:
     Usa la fórmula de luminancia perceptual **BT.601**:
     `const gris = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];`
     *¿Por qué esos números y no `(R + G + B) / 3`?* Porque el ojo humano es mucho más sensible al verde (`58.7%`), intermedio al rojo (`29.9%`) y poco sensible al azul (`11.4%`). Para que un píxel sea gris, sus tres canales R, G y B tienen que valer lo mismo (`gris`).
   - **Brillo +30% (`brillo`)**:
     Multiplica cada canal por `1.3` (`data[i] = data[i] * 1.3`).
     *¿Qué pasa si `220 * 1.3` da `286` (se pasa de 255) o da con decimales?* Como `data` es un **`Uint8ClampedArray`** (*clamped* = acotado), el propio arreglo recorta automáticamente cualquier valor mayor a `255` dejándolo en `255` (y menor a `0` en `0`) y además redondea los decimales. Por eso no hace falta `Math.min(255, ...)` ni `Math.round(...)`.
   - **Negativo (`negativo`)**:
     Invierte cada canal restándole su valor a 255: `255 - data[i]`. Lo que era oscuro pasa a claro y cada color pasa a su opuesto complementario.

---

### 3.3 Recorte proporcional y dibujo de cada pieza ([líneas 87-105](js/blocka.js#L87-L105))

```js
function dibujarPieza(pieza, cols, filas) {
    const proporcion = cols / filas;
    let ancho = imagen.naturalWidth;
    let alto = imagen.naturalHeight;
    if (ancho / alto > proporcion) ancho = alto * proporcion;
    else alto = ancho / proporcion;

    const x0 = (imagen.naturalWidth - ancho) / 2;
    const y0 = (imagen.naturalHeight - alto) / 2;
    const anchoPieza = ancho / cols;
    const altoPieza = alto / filas;

    const ctx = pieza.canvas.getContext("2d");
    ctx.drawImage(
        imagen,
        x0 + pieza.col * anchoPieza, y0 + pieza.fila * altoPieza, anchoPieza, altoPieza,
        0, 0, TAM, TAM
    );
}
```

- **¿Por qué hace ese cálculo de `proporcion`, `x0` e `y0`?**
  Porque cada pieza es un `<canvas>` **cuadrado** (`200 × 200`), pero las imágenes del banco son horizontales (`16:9`) y la grilla cambia de forma según la cantidad de piezas (`2×2` es cuadrada `1:1`, `3×2` es `1.5:1`, `4×2` es `2:1`). Si dividiéramos toda la imagen sin recortar, al meter cada pedazo en un canvas cuadrado la imagen se vería aplastada o estirada.
  Con `x0` e `y0` tomamos el **recorte central más grande posible** que tenga exactamente la proporción `cols / filas` (igual a como hace `object-fit: cover` en CSS).
- **¿Qué significan los 9 parámetros de `ctx.drawImage`?**
  1. `imagen`: la imagen original en memoria.
  2. `x0 + pieza.col * anchoPieza` (**sx**): desde qué X de la imagen original empezamos a cortar.
  3. `y0 + pieza.fila * altoPieza` (**sy**): desde qué Y de la imagen original empezamos a cortar.
  4. `anchoPieza` (**sw**): qué ancho cortamos de la imagen original.
  5. `altoPieza` (**sh**): qué alto cortamos de la imagen original.
  6. `0, 0, TAM, TAM` (**dx, dy, dw, dh**): dónde lo pegamos en el canvas de la pieza (desde `(0, 0)` ocupando todo el canvas de `200 × 200`).

---

### 3.4 Creación del tablero y rotación ([líneas 107-170](js/blocka.js#L107-L170))

- **Ángulo inicial (`rot`)**:
  `const rot = (Math.floor(Math.random() * 3) + 1) * 90;`
  `Math.floor(Math.random() * 3)` da `0, 1 o 2`. Al sumarle `1` da `1, 2 o 3`, y al multiplicar por `90` obtenemos **`90`, `180` o `270`**. Así garantizamos que **ninguna pieza arranque ya bien puesta (`0°`)**.
- **¿Por qué rotamos con CSS (`canvas.style.transform = rotate(...)`) y no rotando el contexto del canvas?**
  1. Porque CSS nos regala la animación suave entre giros con una sola línea (`transition: transform 280ms ease` en `.blocka__pieza`).
  2. Porque el contenido de píxeles del canvas se dibuja y filtra una sola vez al crear el nivel; al girar solo rota el elemento en pantalla.
- **¿Por qué `estaBien` mira `pieza.rot % 360 === 0` en vez de `pieza.rot === 0`?**
  Porque `pieza.rot` acumula grados (`270` → clic derecho `+90` → `360`). Si al llegar a `360` le pusiéramos `pieza.rot = 0`, la transición CSS vería que el número bajó de `270°` a `0°` y la pieza daría una vuelta entera hacia atrás en sentido contrario. Dejando que `rot` sea cualquier múltiplo de `360` (`..., -360, 0, 360, 720, ...`), el giro visual siempre va hacia el lado correcto, y con `% 360 === 0` sabemos que está derecha.
- **¿Por qué en el clic derecho se usa `contextmenu` y `e.preventDefault()`?**
  El evento `contextmenu` se dispara al hacer clic derecho. Llamamos a `e.preventDefault()` para bloquear el menú desplegable del navegador y que en su lugar la pieza gire `+90°`.
- **¿Cómo funciona `ayudita()`?**
  1. Filtra las piezas que todavía no están derechas (`const mal = piezas.filter((p) => !estaBien(p))`).
  2. Elige una al azar de esa lista.
  3. **Suma los 5 segundos de penalización antes de acomodarla**: si justo quedaba una sola pieza mal y usás la ayudita, el juego detecta la victoria inmediatamente después y guarda tu tiempo con los `+5 s` ya incluidos.
  4. Calcula `pieza.rot = Math.round(pieza.rot / 360) * 360;` (el múltiplo de `360°` más cercano para que la animación haga el camino más corto), la marca como `pieza.fija = true` (para que `girar()` la ignore) y le agrega la clase `.is-fija`.

---

### 3.5 Selección con miniaturas y carga asincrónica ([líneas 172-222](js/blocka.js#L172-L222))

- **Animación de ruleta (`elegirImagen`)**:
  Calcula `pasos = IMAGENES.length * 2 + elegida`. Un `setInterval` cada `150 ms` incrementa `paso` y prende la clase `.is-activa` únicamente en la miniatura `i === paso % IMAGENES.length`. Cuando `paso === pasos`, frena el `setInterval` y espera `700 ms` antes de avisar qué imagen tocó.
- **Carga asincrónica (`new Image()` y `onload`)**:
  Tal como explica la diapositiva 17 del PDF: asignar `img.src = ...` dispara la descarga en segundo plano y el script sigue de largo. Si intentáramos llamar a `armarTablero()` en la línea siguiente a `img.src`, la imagen todavía tendría ancho `0` y el canvas quedaría vacío. Por eso todo el inicio del nivel va dentro de `img.onload = function () { imagen = this; ... }`. Usamos `function ()` tradicional porque ahí `this` apunta a la imagen recién cargada (en una *arrow function*, `this` sería `undefined` en modo estricto).

---

### 3.6 Victoria y eliminación del filtro ([líneas 232-241](js/blocka.js#L232-L241))

```js
function ganar() {
    const [cols, filas] = GRILLAS[selPiezas.value];
    piezas.forEach((p) => dibujarPieza(p, cols, filas));
    tablero.classList.add("is-resuelto");
    // ...
}
```

- **Pregunta trampa clásica: "¿Cómo revierten el filtro cuando ganan? Porque el filtro de grises o el de brillo que saturó en 255 pierden información original."**
  **Respuesta**: No intentamos invertir la cuenta matemática sobre `ImageData`. Como tenemos guardada la imagen original intacta en la variable `imagen`, simplemente volvemos a llamar a `dibujarPieza(p, cols, filas)` en cada pieza sin llamar a `aplicarFiltro()`. Eso pisa el canvas con los píxeles RGB originales y además agregamos `.is-resuelto` al tablero para que el `gap` pase a `0` y las piezas se unan.

---

## 4. Cómo funciona `css/blocka.css`

Los 3 trucos más importantes del CSS para explicar en la defensa:

1. **Grilla adaptable con variables CSS ([`blocka.css:86-94`](css/blocka.css#L86-L94))**:
   ```css
   .blocka__board {
       display: grid;
       grid-template-columns: repeat(var(--cols, 2), 1fr);
       grid-template-rows: repeat(var(--rows, 2), 1fr);
       gap: 3px;
       width: min(100%, calc(var(--cols, 2) * 200px));
       aspect-ratio: var(--cols, 2) / var(--rows, 2);
       transition: gap 600ms ease;
   }
   ```
   En vez de tener una clase CSS para 4 piezas, otra para 6 y otra para 8, el CSS usa `var(--cols)` y `var(--rows)` que le manda JavaScript con `tablero.style.setProperty(...)`. Además, `aspect-ratio: var(--cols) / var(--rows)` asegura que cada celda de la grilla sea siempre un cuadrado perfecto.
2. **Unión de piezas al ganar ([`blocka.css:97-99`](css/blocka.css#L97-L99))**:
   `.blocka__board.is-resuelto { gap: 0; }` animado con `transition: gap 600ms ease`. Cuando ganás, la separación de `3px` entre piezas se cierra suavemente formando la foto entera.
3. **Animación del giro de cada pieza ([`blocka.css:101-107`](css/blocka.css#L101-L107))**:
   `.blocka__pieza` tiene `transition: transform 280ms ease`. JavaScript solo cambia el ángulo en `style.transform` y CSS interpola el giro.

---

## 5. Recetario de modificaciones en vivo (Defensa)

Si en la defensa te piden cambiar o agregar algo en el momento, acá tenés exactamente dónde y qué tocar:

### Caso A: "Agregá un filtro nuevo" (ej. Promedio/Blur, Binarización, Sepia o Grises por promedio)

Todos los filtros se agregan en [`aplicarFiltro` (`js/blocka.js`, líneas 55-85)](js/blocka.js#L55-L85), y luego ponés el nombre del filtro en `NIVELES` ([líneas 21-25](js/blocka.js#L21-L25)).

#### Opción 1: Filtro Binarización (Blanco y Negro puro por umbral)
Si el gris supera `128` va a blanco (`255`), si no, a negro (`0`):
```js
} else if (tipo === "binario") {
    const gris = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const valor = gris >= 128 ? 255 : 0;
    data[i] = valor;
    data[i + 1] = valor;
    data[i + 2] = valor;
}
```

#### Opción 2: Filtro Sepia
```js
} else if (tipo === "sepia") {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    data[i]     = 0.393 * r + 0.769 * g + 0.189 * b;
    data[i + 1] = 0.349 * r + 0.686 * g + 0.168 * b;
    data[i + 2] = 0.272 * r + 0.534 * g + 0.131 * b;
}
```

#### Opción 3: Filtro de un solo canal (ej. "Solo canal Rojo" de la diapositiva 18)
```js
} else if (tipo === "rojo") {
    data[i + 1] = 0; // apago G
    data[i + 2] = 0; // apago B
}
```

#### Opción 4: Filtro Promedio / Desenfoque (que mira a los vecinos — Diapositiva 22 del PDF)
¡Ojo! Como explica la diapositiva 22 del PDF, **un filtro de vecinos no puede pisar el mismo arreglo mientras lo lee**: necesita leer de `origen` (`src`) y escribir en `destino` (`dst`) con `ctx.createImageData(width, height)`:
```js
function aplicarFiltroPromedio(canvas) {
    const K = 2; // radio: ventana de 5x5
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const origen = ctx.getImageData(0, 0, width, height);
    const destino = ctx.createImageData(width, height);
    const src = origen.data, dst = destino.data;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, n = 0;
            for (let dy = -K; dy <= K; dy++) {
                for (let dx = -K; dx <= K; dx++) {
                    const nx = x + dx, ny = y + dy;
                    if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
                    const j = (nx + ny * width) * 4;
                    r += src[j]; g += src[j + 1]; b += src[j + 2];
                    n++;
                }
            }
            const i = (x + y * width) * 4;
            dst[i] = r / n; dst[i + 1] = g / n; dst[i + 2] = b / n;
            dst[i + 3] = src[i + 3];
        }
    }
    ctx.putImageData(destino, 0, 0);
}
```

---

### Caso B: "Agregá una opción de 9 piezas (3×3) o 16 piezas (4×4)"

Solo tocás **2 líneas** en todo el proyecto (el CSS se adapta solo gracias a `--cols` y `--rows`):
1. En [`pages/game_blocka.html` (línea 59)](pages/game_blocka.html#L59), agregás el `<option>`:
   ```html
   <option value="9">9 piezas</option>
   ```
2. En [`js/blocka.js` (línea 27)](js/blocka.js#L27), agregás la clave en `GRILLAS`:
   ```js
   const GRILLAS = { 4: [2, 2], 6: [3, 2], 8: [4, 2], 9: [3, 3] };
   ```

---

### Caso C: "Agregá un 4to nivel o cambiá el tiempo límite"

En [`js/blocka.js` (líneas 21-25)](js/blocka.js#L21-L25), agregás un objeto más al arreglo `NIVELES`. El indicador `1 / 4` y el pasaje de niveles se actualizan solos porque usan `NIVELES.length`:
```js
const NIVELES = [
    { filtro: "grises", nombre: "Escala de grises", limite: 0 },
    { filtro: "brillo", nombre: "Brillo 30%", limite: 120 },
    { filtro: "negativo", nombre: "Negativo", limite: 90 },
    { filtro: "promedio", nombre: "Desenfoque", limite: 60 }
];
```

---

### Caso D: "Que la ayudita solo se pueda usar 1 vez por nivel"

En [`js/blocka.js` (línea 156)](js/blocka.js#L156), dentro de `ayudita()`, agregás `btnAyuda.disabled = true;` después de usarla. Como `comenzar()` ya hace `btnAyuda.disabled = false;` al iniciar cada nivel, se rehabilitará sola en el siguiente nivel.

---

### Caso E: "Que cada pieza tenga un filtro distinto en el mismo nivel"

En [`js/blocka.js` (línea 117)](js/blocka.js#L117), dentro de `crearPieza()`, en vez de pasarle `NIVELES[nivel].filtro`, elegís uno al azar de una lista:
```js
const tipos = ["grises", "brillo", "negativo"];
const filtroAzar = tipos[Math.floor(Math.random() * tipos.length)];
aplicarFiltro(canvas, filtroAzar);
```

---

## 6. Preguntas frecuentes de defensa (Simulacro)

1. **¿Por qué usan un `<canvas>` por pieza en vez de un solo `<canvas>` para todo el tablero?**
   Porque al ser cada pieza su propio `<canvas>`, podemos rotarla con `transform: rotate(...)` de CSS y animarla con `transition` sin tener que borrar, rotar la matriz de transformación del contexto (`ctx.translate` / `ctx.rotate`) y redibujar todo el tablero en cada cuadro, ni volver a correr los filtros píxel a píxel cada vez que el jugador hace clic.
2. **¿Los filtros están hechos con CSS (`filter: grayscale(1)`) o con JavaScript (`ImageData`)?**
   En el tablero del juego están hechos **100% por software con `ImageData` píxel a píxel** en [`aplicarFiltro()`](js/blocka.js#L55-L85), como pide la consigna. Los filtros de CSS (`filter: grayscale(1)` y `filter: invert(1)`) solo se usaron en las 4 imágenes estáticas de ejemplo de la sección inferior "Imágenes del juego" ([`blocka.css:206-207`](css/blocka.css#L206-L207)).
3. **¿Qué pasa si abrís `game_blocka.html` con doble clic desde la carpeta (`file://`) en vez de usar Live Server?**
   Dos cosas fallan por seguridad del navegador (CORS):
   - `fetch` no puede cargar el header ni el footer (`main.js`).
   - El canvas queda *"tainted"* (contaminado) al dibujar una imagen local desde `file://`, y cuando llamás a `ctx.getImageData()` lanza un `SecurityError`. Por eso siempre se ejecuta sobre un servidor HTTP local (Live Server).
4. **En el filtro de vecinos (Promedio), ¿qué pasa en los píxeles del borde de la imagen donde no hay 25 vecinos?**
   El `if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;` descarta las coordenadas que caen fuera del canvas, y la variable `n` cuenta únicamente cuántos vecinos válidos existieron de verdad (por ejemplo, en una esquina con `K = 2` solo suma `9` píxeles en vez de `25`). Al dividir por `n` en lugar de dividir fijo por `25`, los bordes no quedan oscurecidos.
