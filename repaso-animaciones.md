# Repaso de animaciones para la defensa

Apunte de estudio. Los números de línea corresponden al estado actual de los archivos.

## 1. Las dos herramientas

| | `transition` | `animation` + `@keyframes` |
|---|---|---|
| Qué hace | anima el paso entre dos estados | sigue una secuencia de pasos por porcentaje |
| Cuándo arranca | cuando cambia una propiedad (hover, clase, estilo puesto por JS) | sola, apenas el elemento tiene la animación |
| Pasos intermedios | no | sí (0%, 40%, 100%...) |
| Repetición | no | sí, con `infinite` |

Cómo se lee cada una:

```css
transition: transform 340ms ease;
/*          propiedad dura  curva */

animation: exito-pop 700ms 150ms ease-out both;
/*         nombre    dura  espera curva   relleno */
```

- `infinite`: se repite sin fin.
- `forwards`: al terminar queda en el estado final.
- `both`: además aplica el estado inicial durante la espera.

## 2. Cómo saber de quién es una línea

Subir hasta la `{` más cercana y leer el selector.

| El selector termina en | El estilo es para |
|---|---|
| `.boton` | el botón, siempre |
| `.boton:hover` | el botón, con el mouse encima |
| `.boton::before` | el pseudo-elemento, siempre |
| `.boton:hover::before` | el pseudo-elemento, con el mouse sobre el botón |

- `:` (uno) es una condición: `:hover`, `:active`, `:disabled`.
- `::` (dos) es otro elemento: `::before`, `::after`.
- La `transition` de un elemento solo anima los cambios de ese elemento.

Casi todos los hovers tienen estos cuatro bloques:

| | Reposo | Hover |
|---|---|---|
| **Botón** | prepara el terreno y define su `transition` | cambia lo propio |
| **Pseudo-elemento** | está escondido y define su `transition` | pasa a verse o a moverse |

Las tres líneas que preparan el botón:

| Línea | Para qué |
|---|---|
| `position: relative` | que el pseudo-elemento se ubique dentro del botón |
| `overflow: hidden` | que se recorte lo que sobresale |
| `isolation: isolate` | que el pseudo-elemento quede entre el fondo y el texto |

## 3. Sentidos de `translate` y `box-shadow`

| | Positivo | Negativo |
|---|---|---|
| Primer valor (X) | derecha | izquierda |
| Segundo valor (Y) | abajo | arriba |

## 4. Hovers de botones (la consigna pide 3 distintos)

| Botón | Patrón | Cómo funciona | Dónde |
|---|---|---|---|
| "Agregar" | círculo que se expande | `::before` redondo, de `scale(0)` a `scale(1)` en 300 ms | [home.css:420-470](css/home.css#L420-L470) |
| "Iniciar sesión" / "Registrarme" | barrido de luz | `::before` con degradado, de `translateX(-140%)` a `280%` en 340 ms; el botón crece con `scale(1.04)` y brilla | [login.css:244-271](css/login.css#L244-L271) |
| "Crear cuenta" / "Ya tengo cuenta" | capa desplazada | sin pseudo-elemento: `translate(-4px, -4px)` y `box-shadow: 4px 4px 0` en 200 ms | [login.css:230-239](css/login.css#L230-L239) |
| Google / Facebook | línea que se dibuja | `::after` de 3px, de `scaleX(0)` a `scaleX(1)` con `transform-origin: left` en 260 ms | [login.css:184-206](css/login.css#L184-L206) |

Notas:

- El menú hamburguesa no cuenta como botón.
- "Crear cuenta" es un enlace `<a>` con aspecto de botón; "Agregar" e "Iniciar sesión" son `<button>`.
- En "Iniciar sesión", el crecimiento del botón se anima con la `transition` de la regla compartida ([login.css:225](css/login.css#L225)); el `box-shadow` no está en esa lista y aparece de golpe.

### Qué tocar

| Botón | Velocidad | Otros valores |
|---|---|---|
| "Agregar" | `300ms` en [home.css:452](css/home.css#L452) (y el `color` de la 431) | color del círculo en la 450; texto en hover en la 460 |
| "Iniciar sesión" | `340ms` en [login.css:261](css/login.css#L261) | inclinación `-18deg` en 260 y 265; ancho `45%` en 257; `scale(1.04)` en 270 |
| "Crear cuenta" | `200ms` en [login.css:233](css/login.css#L233) | los `4px` de las líneas 237 y 238, iguales |
| Google / Facebook | `260ms` en [login.css:195](css/login.css#L195) | grosor en 191; `transform-origin` en 194 |

## 5. Animaciones `@keyframes` por porcentaje (12)

| Animación | Dónde | Qué hace |
|---|---|---|
| `loader-salto` | [loading.css:97](css/loading.css#L97) | los puntitos suben 7px y bajan |
| `loader-pulso` | [loading.css:102](css/loading.css#L102) | el texto "Cargando juegos..." late |
| `carousel-slide` | [home.css:156](css/home.css#L156) | las tarjetas se inclinan y se achican al deslizar |
| `arrow-nudge` | [home.css:104](css/home.css#L104) | la flecha rebota mientras el mouse está encima |
| `label-pulse` | [home.css:289](css/home.css#L289) | el puntito de la etiqueta del juego central late |
| `registro-brillo` | [register.css:101](css/register.css#L101) | el formulario late con brillo neón |
| `exito-aparece` | [register.css:116](css/register.css#L116) | aparece la tarjeta blanca de éxito |
| `exito-pop` | [register.css:125](css/register.css#L125) | el ícono crece con rebote (0%, 60%, 80%, 100%) |
| `exito-trazo` | [register.css:145](css/register.css#L145) | se dibujan el círculo y el tilde |
| `exito-texto` | [register.css:151](css/register.css#L151) | el texto sube y aparece |
| `trailer-pulse` | [game.css:342](css/game.css#L342) | el ícono de play del tráiler late |
| `comment-breathe` | [game.css:498](css/game.css#L498) | los botones de la página del juego "respiran" |

## 6. Loading

| Parte | Cómo funciona | Dónde |
|---|---|---|
| Puntitos | tres `<i>` redondos con `loader-salto` de 0,9 s en bucle | [loading.css:46-55](css/loading.css#L46-L55) |
| Efecto de ola | `animation-delay` distinto: 0, 0,15 y 0,3 s | [loading.css:58-59](css/loading.css#L58-L59) |
| Texto | `loader-pulso` de 1,6 s en bucle | [loading.css:86](css/loading.css#L86) |
| Barra | JS cambia el `width`; `transition: width 0.1s linear` lo suaviza | [loading.css:76](css/loading.css#L76) |
| Salida | `transition: opacity 0.5s`; JS espera 500 ms y elimina el overlay | [loading.css:16](css/loading.css#L16), [loading.js:62](js/loading.js#L62) |
| Duración | `DURACION = 5000` (la consigna exige 5 s) | [loading.js:12](js/loading.js#L12) |

El porcentaje lo calcula `animar` con `requestAnimationFrame` a partir del tiempo real transcurrido, así dura 5 segundos en cualquier máquina. El overlay queda visible unos 6 segundos en total: 5 de progreso, 450 ms mostrando el 100% y 500 ms de desvanecido.

## 7. Carruseles

| | Carrusel grande | Carruseles por categoría |
|---|---|---|
| Qué hace JS | cambia `transform`, `opacity` y `z-index` de cada tarjeta | mueve `scrollLeft` cuadro a cuadro con `requestAnimationFrame` |
| Qué anima | la `transition` de `.featured-card` (650 ms) | la curva `easeInOutCubic` y, a la vez, `@keyframes carousel-slide` |
| Dónde | [home.js:446-471](js/home.js#L446-L471), [home.css:205](css/home.css#L205) | [home.js:511-536](js/home.js#L511-L536), [home.css:146-172](css/home.css#L146-L172) |

Qué tocar:

- Velocidad del grande: `650ms` en [home.css:205](css/home.css#L205).
- Giro, separación y profundidad del grande: los números de [home.js:464](js/home.js#L464) (`50`, `60 + lejos * 22`, `-220px`).
- Velocidad de los de abajo: `DURACION_SLIDE` en [home.js:481](js/home.js#L481) y los `650ms` de [home.css:148](css/home.css#L148) y [153](css/home.css#L153). Tienen que coincidir.
- Inclinación de las tarjetas al deslizar: `-7deg` en [home.css:162](css/home.css#L162).

## 8. Éxito del registro

[register.js:87-100](js/register.js#L87-L100) agrega la clase `is-success` al formulario e inserta la tarjeta con el SVG. Lo demás es CSS encadenado con retrasos.

| Arranca en | Dura | Qué pasa | Animación |
|---|---|---|---|
| 0 ms | 1200 ms | el formulario late con brillo | `registro-brillo` |
| 0 ms | 350 ms | aparece la tarjeta blanca | `exito-aparece` |
| 150 ms | 700 ms | el ícono crece con rebote | `exito-pop` |
| 200 ms | 650 ms | se dibuja el círculo | `exito-trazo` |
| 750 ms | 400 ms | se dibuja el tilde | `exito-trazo` |
| 1000 ms | 500 ms | sube "¡Cuenta creada!" | `exito-texto` |
| 1200 ms | 500 ms | sube el texto chico | `exito-texto` |

- El dibujado usa `stroke-dasharray` y `stroke-dashoffset`: el trazo es una sola raya del largo del dibujo, desplazada para que quede oculta; la animación lleva el desplazamiento a 0.
- La secuencia termina a los 1,7 s y la redirección al login ocurre a los 2,6 s (`DURACION_EXITO` en [register.js:12](js/register.js#L12)).
- Para que corra hay que completar los siete campos con datos válidos y marcar el captcha.

## 9. Cosas a probar antes de la defensa

- Clic en una tarjeta del carrusel grande que esté a 2 o 3 lugares del centro: por cómo está escrito `colocarDestacados`, es probable que el cambio salte sin animación.
- En un celular real: si al desplazar la página los carruseles de abajo vuelven solos a su posición inicial (por el evento `resize`).
- Tocar una flecha de un carrusel de abajo dos veces muy seguido: puede quedar desalineado.
- Si la computadora tiene desactivados los efectos de animación de Windows, se apagan la transición de "Agregar", la del aviso del carrito y el latido del texto del loading ([home.css:570-575](css/home.css#L570-L575), [loading.css:109-112](css/loading.css#L109-L112)).
