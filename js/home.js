/* ============================================================
   HOME | Catálogo de juegos (index.html)
   Genera el carrusel de destacados y las secciones por categoría.
   Cada categoría lee las portadas de su carpeta dentro de
   assets/games/ (premium, accion, aventura, ...).
   ============================================================ */

// Ruta base de las imágenes del catálogo, resuelta desde este propio archivo.
const BASE_IMAGENES = new URL("../assets/games/", document.currentScript.src).href;

(function () {
    "use strict";

    /* ---------- 1. DATOS ---------- */

    // Carrusel grande: assets/games/juegos-momento/
    // El orden de la lista es el orden VISUAL. Peg Solitaire va en el centro
    // para que quede completo al cargar, con GTA VI asomando a la izquierda
    // y Red Dead Redemption 2 a la derecha.
    const DESTACADOS = [
        { titulo: "GTA VI", cover: "gta-vi-1560x880.jpg.webp", etiqueta: "Juego del momento" },
        { titulo: "Peg Solitaire - CyberPunk", cover: "peg-solitaire.webp", etiqueta: "Juego del momento", link: "pages/game_solitare.html" },
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

    // Escalones del título: la letra se achica a medida que el nombre crece,
    // para que entre siempre en la barra (220px en móvil / 260px en escritorio).
    // Los nombres cortos conservan el tamaño base, sin clase.
    const ESCALONES_TITULO = [
        { max: 13, clase: "" },
        { max: 17, clase: "game-card__title--med" },
        { max: Infinity, clase: "game-card__title--chico" }
    ];

    function claseTitulo(titulo) {
        return ESCALONES_TITULO.find(function (escalon) {
            return titulo.length <= escalon.max;
        }).clase;
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
        // El data-ir lo marca como clickeable y da el destino (ver delegación).
        const destino = juego.link ? ' data-ir="' + juego.link + '"' : '';
        return (
            '<article class="featured-card"' + destino + '>' +
                '<img src="' + portada("juegos-momento", juego.cover) + '" alt="Portada de ' + juego.titulo + '"' +
                    ' width="605" height="424" loading="' + (indice < 2 ? "eager" : "lazy") + '" decoding="async" />' +
                '<span class="featured-card__label">' + juego.etiqueta + '</span>' +
            '</article>'
        );
    }

    function tarjeta_juego(carpeta, juego) {
        // El bloque de precio + botón sólo se genera en juegos premium.
        const esPremium = typeof juego.precio === "string";

        const claseTituloTexto = claseTitulo(juego.titulo);
        const clasesTitulo = claseTituloTexto
            ? "game-card__title " + claseTituloTexto
            : "game-card__title";

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
                '<h3 class="' + clasesTitulo + '">' + juego.titulo + '</h3>' +
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

    // scrollLeft que deja una tarjeta centrada en su carrusel.
    function scrollParaCentrar(carousel, tarjeta) {
        const caja = carousel.getBoundingClientRect();
        const t = tarjeta.getBoundingClientRect();
        return carousel.scrollLeft + t.left - caja.left + t.width / 2 - caja.width / 2;
    }

    // Al cargar, cada carrusel se desplaza para que se vea el efecto de
    // "hay más juegos": las tarjetas de los bordes quedan cortadas.
    function alinearCarruseles() {
        document.querySelectorAll(".carousel").forEach(function (carousel) {
            const tarjetas = carousel.querySelectorAll(".carousel__track > *");
            if (!tarjetas.length) return;

            if (carousel.classList.contains("carousel--featured")) {
                // El CSS ya dimensiona este carrusel para que la tarjeta
                // central entre completa y las vecinas queden cortadas a la
                // mitad, así que basta con centrarla (índice 1 = Peg Solitaire).
                carousel.scrollLeft = scrollParaCentrar(carousel, tarjetas[1] || tarjetas[0]);
            } else {
                carousel.scrollLeft = mejorScroll(carousel, tarjetas);
            }
            actualizarFlechas(carousel);
        });
    }

    /* ---------- 5. FLECHAS: DESPLAZAMIENTO ANIMADO ---------- */

    const DURACION_SLIDE = 650; // ms; igual que la animación CSS carousel-slide-*

    // Curva de velocidad: arranca suave, acelera y frena al llegar.
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function maximoScroll(carousel) {
        return carousel.scrollWidth - carousel.clientWidth;
    }

    // Oculta la flecha "anterior" al principio y la "siguiente" al final.
    function actualizarFlechas(carousel) {
        const caja = carousel.closest(".carousel-box");
        if (!caja) return;
        const margen = 2; // tolerancia por redondeo de píxeles
        caja.querySelector(".carousel-arrow--prev").disabled = carousel.scrollLeft <= margen;
        caja.querySelector(".carousel-arrow--next").disabled = carousel.scrollLeft >= maximoScroll(carousel) - margen;
    }

    // A dónde tiene que ir el carrusel al tocar una flecha (dir = 1 o -1).
    function destinoDelSlide(carousel, dir) {
        const tarjetas = Array.from(carousel.querySelectorAll(".carousel__track > *"));

        if (carousel.classList.contains("carousel--featured")) {
            // Carrusel grande: centra la tarjeta vecina de la que hoy está al medio.
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

        // Carruseles por categoría: avanza de a "página" (las tarjetas que
        // entran enteras menos una, para no perder el contexto). Como se mueve
        // en múltiplos exactos de tarjeta + hueco, los bordes siguen cortados.
        const paso = tarjetas[1] ? tarjetas[1].offsetLeft - tarjetas[0].offsetLeft : carousel.clientWidth;
        const porPagina = Math.max(1, Math.floor(carousel.clientWidth / paso) - 1);
        return carousel.scrollLeft + dir * paso * porPagina;
    }

    // Anima el scroll cuadro a cuadro con requestAnimationFrame. Mientras dura,
    // la clase is-sliding-* dispara la animación @keyframes de las tarjetas.
    function deslizar(carousel, dir) {
        const inicio = carousel.scrollLeft;
        const destino = Math.max(0, Math.min(maximoScroll(carousel), destinoDelSlide(carousel, dir)));
        const distancia = destino - inicio;
        if (Math.abs(distancia) < 1) return;

        const track = carousel.querySelector(".carousel__track");
        cancelAnimationFrame(carousel.animacion);

        // El scroll-snap del carrusel grande "tironearía" en cada cuadro.
        carousel.style.scrollSnapType = "none";
        track.classList.remove("is-sliding-next", "is-sliding-prev");
        void track.offsetWidth; // reinicia la animación CSS si se toca seguido
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

    /* ---------- 6. CLICS: FLECHAS, CARRITO Y DESTACADOS ---------- */

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

    // Un solo listener delegado para todo lo que se genera por JS.
    document.addEventListener("click", function (evento) {
        // Flechas de los carruseles
        const flecha = evento.target.closest(".carousel-arrow");
        if (flecha) {
            const carousel = flecha.closest(".carousel-box").querySelector(".carousel");
            deslizar(carousel, flecha.classList.contains("carousel-arrow--next") ? 1 : -1);
            return;
        }

        // Botón "Agregar" de los juegos premium
        const boton = evento.target.closest(".game-card__add");
        if (boton) {
            boton.disabled = true;
            boton.textContent = "Agregado";
            mostrarAviso(boton.dataset.juego + " se agregó al carrito");
            return;
        }

        // Las tarjetas del carrusel grande con data-ir son clickeables:
        // redirigen al detalle del juego (puede ser una página por juego).
        const tarjeta = evento.target.closest(".featured-card[data-ir]");
        if (tarjeta) window.location.href = tarjeta.dataset.ir;
    });

    /* ---------- 7. INICIO ---------- */

    document.addEventListener("DOMContentLoaded", function () {
        renderizar();

        // El ancho de las tarjetas lo fija el CSS, así que alcanza con medir
        // una vez que el DOM está montado. Se repite al cambiar el tamaño
        // de la ventana porque los paddings dependen del ancho disponible.
        requestAnimationFrame(alinearCarruseles);
        window.addEventListener("resize", alinearCarruseles);

        // Con el dedo o el trackpad también se puede desplazar: las flechas
        // se actualizan con cualquier scroll. El evento scroll no burbujea,
        // por eso se escucha en fase de captura.
        document.addEventListener("scroll", function (evento) {
            const el = evento.target;
            if (el.classList && el.classList.contains("carousel")) actualizarFlechas(el);
        }, true);
    });

})();
