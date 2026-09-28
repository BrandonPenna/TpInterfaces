// Ruta base de templates resuelta desde este propio archivo (js/main.js),
// para que funcione desde la raíz (index.html) y desde subcarpetas (pages/).
const BASE_TEMPLATES = new URL('../templates/', document.currentScript.src).href;

// Ruta base de las imágenes del catálogo, resuelta igual que los templates.
const BASE_IMAGENES = new URL('../assets/games/', document.currentScript.src).href;

// Los partials usan rutas relativas a templates/ (ej: ../assets/icons/logo.png).
// Como se inyectan en páginas que están a distinta profundidad, las convertimos
// a URLs absolutas resolvinglas contra la ruta del propio template.
function resolverRutas(html) {
    return html.replace(
        /(\s(?:src|href)\s*=\s*)(["'])(\.\.\/[^"']+)\2/g,
        (match, prefijo, comilla, ruta) => prefijo + comilla + new URL(ruta, BASE_TEMPLATES).href + comilla
    );
}

// Función para cargar componentes reutilizables (Header y Footer)
// Cada contenedor puede pedir su propio partial con data-template="archivo.html".
// Si no lo indica, se usa el partial por defecto de ese contenedor.
function cargarTemplate(idContenedor, partialPorDefecto) {
    const contenedor = document.getElementById(idContenedor);
    if (!contenedor) return;

    const rutaArchivo = BASE_TEMPLATES + (contenedor.dataset.template || partialPorDefecto);

    fetch(rutaArchivo)
        .then(response => {
            if (!response.ok) throw new Error(`No se pudo cargar ${rutaArchivo}`);
            return response.text();
        })
        .then(data => {
            contenedor.innerHTML = resolverRutas(data);
        })
        .catch(error => console.error('Error cargando template:', error));
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarTemplate('header-container', 'header.html');
    cargarTemplate('footer-container', 'fat-footer.html');
});

/* ============================================================
   PEG SOLITAIRE - CyberPunk | JavaScript vanilla
   Sin dependencias. Cada bloque es independiente:
   podés copiar/pegar sólo las funciones que necesites.
   ============================================================ */
(function () {
    "use strict";

    /* ---------- 1. BOTONES DE COMPARTIR ---------- */
    function share(url) {
        window.open(url, "_blank", "noopener,noreferrer");
    }

    document.querySelectorAll("[data-share]").forEach(function (button) {
        button.addEventListener("click", function () {
            share(button.dataset.share);
        });
    });

    var copyLink = document.getElementById("copy-link");
    if (copyLink) {
        copyLink.addEventListener("click", function () {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
            }
        });
    }

})();

/* ============================================================
   CATÁLOGO DE JUEGOS | JavaScript vanilla
   Genera los destacados y las secciones de la home.
   Cada categoría lee las portadas de su carpeta dentro de
   assets/games/ (premium, accion, aventura, ...).
   ============================================================ */
(function () {
    "use strict";

    /* ---------- 1. DATOS ---------- */

    // Carrusel grande: assets/games/juegos-momento/
    // El orden de la lista es el orden VISUAL. Peg Solitaire va en el centro
    // para que quede completo al cargar, con GTA VI asomando a la izquierda
    // y Red Dead Redemption 2 a la derecha.
    const DESTACADOS = [
        { titulo: "GTA VI", cover: "gta-vi-1560x880.jpg.webp", etiqueta: "Juego del momento" },
        { titulo: "Peg Solitaire - CyberPunk", cover: "peg-solitaire.webp", etiqueta: "Juego del momento" },
        { titulo: "Red Dead Redemption 2", cover: "rdr2.jpg", etiqueta: "Juego del momento" }
    ];

    // Una entrada por carpeta de assets/games/.
    // Sólo la categoría "premium" define `precio`: es la única que
    // muestra el precio y el botón de agregar al carrito.
    const CATEGORIAS = [
        {
            titulo: "Premium",
            carpeta: "premium",
            juegos: [
                { titulo: "Battle Arena", cover: "battle-arena_16x9-cover.avif", precio: "9.99" },
                { titulo: "Cubes", cover: "cubes.avif", precio: "4.99" },
                { titulo: "One Shot Duel", cover: "one-shot-duel-snipe-hide_16x9-cover.avif", precio: "5.99" },
                { titulo: "Patrol Racers NFL", cover: "patrol-racers-nfl_16x9-cover.avif", precio: "7.99" },
                { titulo: "Soulstone Fields", cover: "soulstone-fields_16x9-cover.avif", precio: "6.99" },
                { titulo: "Stickman", cover: "stickman.avif", precio: "3.99" },
                { titulo: "War the Knights", cover: "war-the-knights_16x9-cover.avif", precio: "8.99" }
            ]
        },
        {
            titulo: "Acción",
            carpeta: "accion",
            juegos: [
                { titulo: "300", cover: "300.webp" },
                { titulo: "Bodycamera Shooter", cover: "bodycamera-shooter_16x9-cover (1).avif" },
                { titulo: "Dead Land Survival", cover: "dead-land-survival_16x9-cover.avif" },
                { titulo: "Firestone Idle RPG", cover: "firestone-idle-rpg_16x9-cover.avif" },
                { titulo: "Hazmob", cover: "hazmob.avif" },
                { titulo: "Playground", cover: "playground_16x9-cover.avif" },
                { titulo: "Reign of Thorns", cover: "reign-of-thorns_16x9-cover.avif" }
            ]
        },
        {
            titulo: "Aventura",
            carpeta: "aventura",
            juegos: [
                { titulo: "8 Ball Pool", cover: "8-ball-pool-billiards-multiplayer_16x9-cover.avif" },
                { titulo: "Bloxd.io", cover: "bloxd.io.avif" },
                { titulo: "City Wars", cover: "city-wars_16x9-cover.avif" },
                { titulo: "Dead Land Survival", cover: "dead-land-survival_16x9-cover.avif" },
                { titulo: "Dig Out of Prison", cover: "dig-out-of-prison_16x9-cover.avif" },
                { titulo: "Playground", cover: "playground_16x9-cover.avif" },
                { titulo: "Rocket Goal", cover: "rocket_goal.avif" }
            ]
        },
        {
            titulo: "Carrera",
            carpeta: "carrera",
            juegos: [
                { titulo: "Go Kart Racing", cover: "go-kart-racing-game_16x9-cover.avif" },
                { titulo: "MX Offroad Master", cover: "mx-offroad-master_16x9-cover.avif" },
                { titulo: "Night City Racing", cover: "night-city-racing_16x9-cover.avif" },
                { titulo: "Real Car Driving", cover: "real-car-driving_16x9-cover.avif" },
                { titulo: "Rocket Goal", cover: "rocket_goal.avif" },
                { titulo: "Traffic Rider", cover: "traffic_rider.avif" },
                { titulo: "Xtreme City Drifting", cover: "xtreme-city-drifting_16x9-cover.avif" }
            ]
        },
        {
            titulo: "Deportes",
            carpeta: "deportes",
            juegos: [
                { titulo: "8 Ball Pool", cover: "8-ball-pool-billiards-multiplayer_16x9-cover.avif" },
                { titulo: "Go Kart Racing", cover: "go-kart-racing-game_16x9-cover.avif" },
                { titulo: "Island of Madness", cover: "island-of-madness_16x9-cover.avif" },
                { titulo: "Smash Karts", cover: "smash-karts_16x9-cover.avif" },
                { titulo: "Stickman Kombat 2D", cover: "stickman-kombat-2d_16x9-cover.avif" },
                { titulo: "Table Tennis Tour", cover: "table-tennis-world-tour_16x9-cover.avif" },
                { titulo: "Unmatched Ego 2", cover: "unmatched-ego-2_16x9-cover.avif" }
            ]
        },
        {
            titulo: "Estrategia",
            carpeta: "estrategia",
            juegos: [
                { titulo: "8 Ball Pool", cover: "8-ball-pool-billiards-multiplayer_16x9-cover.avif" },
                { titulo: "Chess Free", cover: "chess-free_16x9-cover.avif" },
                { titulo: "Skillwarz", cover: "skillwarz_16x9-cover.avif" },
                { titulo: "Space Waves", cover: "space-waves_16x9-cover.avif" },
                { titulo: "Table Tennis Tour", cover: "table-tennis-world-tour_16x9-cover.avif" },
                { titulo: "Warfare 1942", cover: "warfare-1942-riz_16x9-cover.avif" },
                { titulo: "Worldguessr", cover: "worldguessr_16x9-cover.avif" }
            ]
        },
        {
            titulo: "Simulación",
            carpeta: "simulacion",
            juegos: [
                { titulo: "300", cover: "300.webp" },
                { titulo: "Demolition Inc", cover: "demolition-inc_16x9-cover.avif" },
                { titulo: "Dig Out of Prison", cover: "dig-out-of-prison_16x9-cover.avif" },
                { titulo: "Heavy Truck Driver", cover: "heavy-truck-driver-ati_16x9-cover.avif" },
                { titulo: "Playground", cover: "playground_16x9-cover.avif" },
                { titulo: "Unmatched Ego 2", cover: "unmatched-ego-2_16x9-cover.avif" },
                { titulo: "Veck IO", cover: "veck-io_16x9-cover.avif" }
            ]
        }
    ];

    /* ---------- 2. PLANTILLAS DE TARJETA ---------- */

    // encodeURI en el nombre porque algunos archivos traen espacios o paréntesis.
    function portada(carpeta, archivo) {
        return BASE_IMAGENES + carpeta + "/" + encodeURI(archivo);
    }

    // Flechas de los costados. btnant = anterior (izquierda), btnsig = siguiente (derecha).
    // Los SVG vienen espejados entre sí, así que home.css los voltea con scaleX(-1)
    // para que la punta apunte hacia afuera una vez puestos en su lugar.
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

    function tarjeta_destacado(juego, indice) {
        return (
            '<article class="featured-card">' +
                '<img src="' + portada("juegos-momento", juego.cover) + '" alt="Portada de ' + juego.titulo + '"' +
                    ' width="605" height="424" loading="' + (indice < 2 ? "eager" : "lazy") + '" decoding="async" />' +
                '<span class="featured-card__label">' + juego.etiqueta + '</span>' +
            '</article>'
        );
    }

    function tarjeta_juego(carpeta, juego) {
        // El bloque de precio + botón sólo se genera en juegos premium.
        const esPremium = typeof juego.precio === "string";

        const acciones = esPremium
            ? '<div class="game-card__actions">' +
                '<span class="game-card__price">$' + juego.precio + '</span>' +
                '<button class="game-card__add" type="button" data-juego="' + juego.titulo + '">Agregar</button>' +
              '</div>'
            : '';

        return (
            '<article class="game-card">' +
                '<img class="game-card__cover" src="' + portada(carpeta, juego.cover) + '" alt="Portada de ' + juego.titulo + '"' +
                    ' width="301" height="192" loading="lazy" decoding="async" />' +
                '<h3 class="game-card__title">' + juego.titulo + '</h3>' +
                acciones +
            '</article>'
        );
    }

    /* ---------- 3. RENDER ---------- */

    function renderizar() {
        const trackDestacados = document.querySelector(".carousel--featured .carousel__track");
        if (trackDestacados) {
            trackDestacados.innerHTML = DESTACADOS.map(tarjeta_destacado).join("");
        }

        const boxDestacados = document.querySelector(".carousel-box--featured");
        if (boxDestacados) {
            boxDestacados.insertAdjacentHTML("afterbegin", flechas());
        }

        const contenedor = document.getElementById("game-sections");
        if (!contenedor) return;

        contenedor.innerHTML = CATEGORIAS.map(function (categoria, indice) {
            const id = "seccion-" + indice;
            return (
                '<section class="game-section" aria-labelledby="' + id + '">' +
                    '<h2 id="' + id + '">' + categoria.titulo + '</h2>' +
                    '<div class="carousel-box">' +
                        flechas() +
                        '<div class="carousel">' +
                            '<div class="carousel__track">' +
                                categoria.juegos.map(function (juego) {
                                    return tarjeta_juego(categoria.carpeta, juego);
                                }).join("") +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</section>'
            );
        }).join("");
    }

    /* ---------- 4. POSICIÓN INICIAL DE LOS CARRUSELES ---------- */

    // Devuelve el desplazamiento inicial de un carrusel normal: aquel en el
    // que la tarjeta del borde izquierdo y la del borde derecho quedan
    // cortadas y lo más parecidas entre sí.
    //
    // "Centrar" una tarjeta no siempre sirve: si el ancho del carrusel cae
    // justo entre dos tarjetas, centrar deja un borde pegado y el otro
    // tarjeta entera fuera de vista. Por eso se prueba cada posición posible
    // (son unas cientos) y se queda la que mejor reparte el recorte.
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
            const izquierda = ancho - (s % paso);      // parte visible del borde izquierdo
            const derecha = (s + visible) % paso;    // parte visible del borde derecho

            // Las dos tienen que quedar cortadas: si una mide el ancho
            // completo, ese borde no está avisando que se puede seguir.
            if (izquierda >= ancho || derecha >= ancho) continue;

            const puntaje = Math.min(izquierda, derecha);
            if (puntaje > mejorPuntaje) {
                mejorPuntaje = puntaje;
                mejor = s;
            }
        }
        return mejor;
    }

    // Al cargar, cada carrusel se desplaza para que se vea el efecto de
    // "hay más juegos": las tarjetas de los bordes quedan cortadas.
    function alinearCarruseles() {
        document.querySelectorAll(".carousel").forEach(function (carousel) {
            const tarjetas = carousel.querySelectorAll(".carousel__track > *");
            if (!tarjetas.length) return;

            const caja = carousel.getBoundingClientRect();

            if (carousel.classList.contains("carousel--featured")) {
                // El CSS ya dimensiona este carrusel para que la tarjeta
                // central entre completa y las vecinas queden cortadas a la
                // mitad, así que basta con centrarla (índice 1 = Peg Solitaire).
                const centro = tarjetas[1] || tarjetas[0];
                const t = centro.getBoundingClientRect();
                carousel.scrollLeft +=
                    t.left - caja.left + t.width / 2 - caja.width / 2;
                return;
            }

            carousel.scrollLeft = mejorScroll(carousel, tarjetas);
        });
    }

    /* ---------- 5. AVISO DEL CARRITO ---------- */


    function mostrarAviso(texto) {
        const aviso = document.querySelector(".cart-notice");
        if (!aviso) return;

        aviso.textContent = texto;
        aviso.classList.add("is-visible");

        clearTimeout(mostrarAviso.timer);
        mostrarAviso.timer = setTimeout(function () {
            aviso.classList.remove("is-visible");
        }, 2600);
    }

    document.addEventListener("click", function (evento) {
        const boton = evento.target.closest(".game-card__add");
        if (!boton) return;

        boton.disabled = true;
        boton.textContent = "Agregado";
        mostrarAviso(boton.dataset.juego + " se agregó al carrito");
    });

    /* ---------- 6. INICIO ---------- */

    document.addEventListener("DOMContentLoaded", function () {
        renderizar();

        // El ancho de las tarjetas lo fija el CSS, así que alcanza con medir
        // una vez que el DOM está montado. Se repite al cambiar el tamaño
        // de la ventana porque los paddings dependen del ancho disponible.
        requestAnimationFrame(alinearCarruseles);
        window.addEventListener("resize", alinearCarruseles);
    });

})();
