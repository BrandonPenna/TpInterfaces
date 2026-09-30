/* ============================================================
   HOME | Catálogo de juegos (index.html)
   Genera el carrusel de destacados y las secciones por categoría.
   Destacados y Premium usan sólo portadas locales de assets/games/; las
   demás categorías muestran sus juegos locales y se completan con la
   API de la cátedra.
   ============================================================ */

// Ruta base de las imágenes del catálogo, resuelta desde este propio archivo.
const BASE_IMAGENES = new URL("../assets/games/", document.currentScript.src).href;

(function () {
    "use strict";

    /* ---------- 1. DATOS ---------- */

    // Carrusel grande (coverflow). Por defecto las portadas salen de
    // assets/games/juegos-momento/; `carpeta` permite tomar otra.
    // El orden de la lista es el orden VISUAL y arranca centrado en el
    // juego con `inicial: true` (Peg Solitaire, entre GTA VI y RDR2).
    const DESTACADOS = [
        { titulo: "Reign of Thorns", cover: "reign-of-thorns_16x9-cover.avif", carpeta: "accion", etiqueta: "Acción" },
        { titulo: "Warfare 1942", cover: "warfare-1942-riz_16x9-cover.avif", carpeta: "estrategia", etiqueta: "Estrategia" },
        { titulo: "GTA VI", cover: "gta-vi-1560x880.jpg.webp", etiqueta: "Próximamente" },
        { titulo: "Peg Solitaire - CyberPunk", cover: "peg-solitaire.webp", etiqueta: "Juego recomendado", link: "pages/game_solitare.html", inicial: true },
        { titulo: "Red Dead Redemption 2", cover: "rdr2.jpg", etiqueta: "Juego del momento" },
        { titulo: "Heavy Truck Driver", cover: "heavy-truck-driver-ati_16x9-cover.avif", carpeta: "simulacion", etiqueta: "Simulación" },
        { titulo: "Night City Racing", cover: "night-city-racing_16x9-cover.avif", carpeta: "carrera", etiqueta: "Carrera" }
    ];

    // Premium es local (la API no trae precios): es la única categoría que
    // define `precio`, y por eso la única con precio y botón de carrito.
    const PREMIUM = {
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
    };

    // API de la cátedra (github.com/jimartinezabadias/api-vj-interfaces).
    const API_JUEGOS = "https://vj.interfaces.jima.com.ar/api/v2";

    // Las mismas categorías del menú y el footer. Cada una muestra sus
    // juegos locales (portadas de assets/games/<carpeta>/) y se completa con
    // los juegos de la API cuyos géneros figuran en `generos` (nombres en
    // inglés, como los devuelve la API).
    const CATEGORIAS = [
        {
            titulo: "Acción",
            carpeta: "accion",
            generos: ["Action", "Shooter", "Fighting"],
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
            generos: ["Adventure", "RPG", "Platformer"],
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
            generos: ["Racing"],
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
            generos: ["Sports"],
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
            generos: ["Strategy", "Puzzle"],
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
            generos: ["Simulation", "Massively Multiplayer"],
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

    // La etiqueta (arriba a la derecha) y el título sólo se muestran en la tarjeta del centro.
    function tarjeta_destacado(juego) {
        // El data-ir marca la tarjeta como jugable y da el destino (ver clics).
        const destino = juego.link ? ' data-ir="' + juego.link + '"' : '';
        return (
            '<article class="featured-card"' + destino + '>' +
                '<img src="' + portada(juego.carpeta || "juegos-momento", juego.cover) + '" alt="Portada de ' + juego.titulo + '"' +
                    ' width="605" height="424" decoding="async" />' +
                '<span class="featured-card__label">' + juego.etiqueta + '</span>' +
                '<div class="featured-card__info">' +
                    '<h3 class="featured-card__title">' + juego.titulo + '</h3>' +
                '</div>' +
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

        // Los juegos de la API traen la URL completa de su imagen en `imagen`.
        const src = juego.imagen || portada(carpeta, juego.cover);

        return (
            '<article class="game-card">' +
                '<img class="game-card__cover" src="' + src + '" alt="Portada de ' + juego.titulo + '"' +
                    ' width="301" height="192" loading="lazy" decoding="async" />' +
                '<h3 class="' + clasesTitulo + '">' + juego.titulo + '</h3>' +
                acciones +
            '</article>'
        );
    }

    /* ---------- 3. DATOS DE LA API ---------- */

    // Nombres del carrusel grande, para no repetir esos juegos abajo
    // (por ejemplo Red Dead Redemption 2, que también viene en la API).
    function normalizar(nombre) {
        return nombre.trim().toLowerCase();
    }

    const NOMBRES_DESTACADOS = DESTACADOS.map(function (juego) {
        return normalizar(juego.titulo);
    });

    function noEsDestacado(juego) {
        return !NOMBRES_DESTACADOS.includes(normalizar(juego.titulo));
    }

    function tieneGenero(categoria, juego) {
        return categoria.generos.some(function (g) { return juego.generos.includes(g); });
    }

    // Tope de juegos de la API por categoría, para que los carruseles no
    // queden desparejos (la API trae casi todo "Action").
    const MAX_API_POR_CATEGORIA = 10;

    // Arma las categorías: sus juegos locales + los de la API que les tocan.
    // Un juego de la API suele tener varios géneros; para que no se repita
    // entre carruseles va a una sola categoría: la que, entre las que le
    // corresponden y tienen lugar, tenga menos juegos hasta el momento.
    // Se reparten de mayor a menor rating.
    // Sin `juegosApi` (la API no respondió) quedan sólo los locales.
    function armarCategorias(juegosApi) {
        const juegos = (juegosApi || [])
            .map(function (j) {
                return {
                    titulo: j.name,
                    imagen: j.background_image_low_res || j.background_image,
                    rating: j.rating,
                    generos: j.genres.map(function (g) { return g.name; })
                };
            })
            .filter(noEsDestacado);

        const categorias = CATEGORIAS.map(function (categoria) {
            return {
                titulo: categoria.titulo,
                carpeta: categoria.carpeta,
                generos: categoria.generos,
                locales: categoria.juegos.filter(noEsDestacado),
                deApi: []
            };
        });

        function cantidad(c) {
            return c.locales.length + c.deApi.length;
        }

        juegos
            .sort(function (a, b) { return b.rating - a.rating; })
            .forEach(function (juego) {
                const destino = categorias
                    .filter(function (c) {
                        return tieneGenero(c, juego) && c.deApi.length < MAX_API_POR_CATEGORIA;
                    })
                    .sort(function (a, b) { return cantidad(a) - cantidad(b); })[0];
                if (destino) destino.deApi.push(juego);
            });

        return categorias.map(function (c) {
            return { titulo: c.titulo, carpeta: c.carpeta, juegos: c.locales.concat(c.deApi) };
        });
    }

    // Pide los juegos a la API; si falla, las categorías quedan con los locales.
    function cargarCategorias() {
        return fetch(API_JUEGOS)
            .then(function (respuesta) {
                if (!respuesta.ok) throw new Error("HTTP " + respuesta.status);
                return respuesta.json();
            })
            .then(armarCategorias)
            .catch(function (error) {
                console.warn("No se pudo usar la API, se muestran sólo los juegos locales.", error);
                return armarCategorias(null);
            });
    }

    /* ---------- 4. RENDER ---------- */

    function renderizarDestacados() {
        const trackDestacados = document.querySelector(".carousel--featured .carousel__track");
        if (trackDestacados) {
            trackDestacados.innerHTML = DESTACADOS.map(tarjeta_destacado).join("");
        }

        const boxDestacados = document.querySelector(".carousel-box--featured");
        if (boxDestacados) {
            boxDestacados.insertAdjacentHTML("afterbegin", flechas());
        }
    }

    // Premium va siempre primero; después las demás categorías.
    function renderizarCategorias(categorias) {
        const contenedor = document.getElementById("game-sections");
        if (!contenedor) return;

        contenedor.innerHTML = [PREMIUM].concat(categorias).map(function (categoria, indice) {
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

    /* ---------- 5. POSICIÓN INICIAL DE LOS CARRUSELES ---------- */

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

    // Al cargar, cada carrusel por categoría se desplaza para que se vea el
    // efecto de "hay más juegos": las tarjetas de los bordes quedan cortadas.
    function alinearCarruseles() {
        document.querySelectorAll(".game-section .carousel").forEach(function (carousel) {
            const tarjetas = carousel.querySelectorAll(".carousel__track > *");
            if (!tarjetas.length) return;
            carousel.scrollLeft = mejorScroll(carousel, tarjetas);
            actualizarFlechas(carousel);
        });
    }

    /* ---------- 6. CARRUSEL GRANDE: COVERFLOW ---------- */

    // Índice de la tarjeta que está al frente, en el centro.
    let activo = Math.max(0, DESTACADOS.findIndex(function (juego) { return juego.inicial; }));

    // Carrusel infinito: la lista se piensa como un círculo. La distancia de
    // una tarjeta a la activa es el camino más corto dando la vuelta, así que
    // siempre queda la mitad de las tarjetas a cada lado (el último juego
    // aparece a la izquierda del primero).
    function distanciaCircular(i) {
        const n = DESTACADOS.length;
        let distancia = ((i - activo) % n + n) % n;   // 0 .. n-1 hacia la derecha
        if (distancia > n / 2) distancia -= n;        // más cerca por la izquierda
        return distancia;
    }

    // Ubica cada tarjeta según su distancia a la activa: la del centro queda
    // de frente y las demás se corren a los costados, se alejan y giran hacia
    // el centro, apilándose. El `transition` de .featured-card anima el cambio.
    function colocarDestacados() {
        document.querySelectorAll(".featured-card").forEach(function (tarjeta, i) {
            const distancia = distanciaCircular(i);  // negativa = a la izquierda
            const lado = Math.sign(distancia);
            const lejos = Math.abs(distancia);

            // La tarjeta del extremo que pasa al otro lado salta sin
            // animación: si no, cruzaría todo el carrusel por delante.
            const anterior = Number(tarjeta.dataset.distancia);
            const salta = Math.abs(distancia - anterior) > 1;
            if (salta) tarjeta.style.transition = "none";

            tarjeta.dataset.distancia = distancia;
            tarjeta.classList.toggle("is-active", distancia === 0);
            tarjeta.style.zIndex = 10 - lejos;
            tarjeta.style.opacity = lejos > 3 ? 0 : 1;
            tarjeta.style.transform = distancia === 0
                ? "translateX(0) translateZ(0) rotateY(0deg)"
                : "translateX(" + lado * (60 + lejos * 22) + "%) translateZ(-220px) rotateY(" + -lado * 50 + "deg)";

            if (salta) {
                void tarjeta.offsetWidth;   // aplica la posición nueva sin transición
                tarjeta.style.transition = "";
            }
        });
    }

    function moverDestacados(dir) {
        const n = DESTACADOS.length;
        activo = ((activo + dir) % n + n) % n;
        colocarDestacados();
    }

    /* ---------- 7. CARRUSELES POR CATEGORÍA: DESPLAZAMIENTO ANIMADO ---------- */

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
        const tarjetas = carousel.querySelectorAll(".carousel__track > *");

        // Avanza de a "página" (las tarjetas que
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
            track.classList.remove("is-sliding-next", "is-sliding-prev");
        }
        carousel.animacion = requestAnimationFrame(cuadro);
    }

    /* ---------- 8. CLICS: FLECHAS, CARRITO Y DESTACADOS ---------- */

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
        // Flechas: el carrusel grande cambia la tarjeta activa, los demás se deslizan
        const flecha = evento.target.closest(".carousel-arrow");
        if (flecha) {
            const dir = flecha.classList.contains("carousel-arrow--next") ? 1 : -1;
            const caja = flecha.closest(".carousel-box");
            if (caja.classList.contains("carousel-box--featured")) moverDestacados(dir);
            else deslizar(caja.querySelector(".carousel"), dir);
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

        // Carrusel grande: una tarjeta lateral pasa al centro; la del centro,
        // si tiene data-ir, lleva al juego.
        const tarjeta = evento.target.closest(".featured-card");
        if (tarjeta) {
            const indice = Array.from(tarjeta.parentNode.children).indexOf(tarjeta);
            if (indice !== activo) moverDestacados(distanciaCircular(indice));
            else if (tarjeta.dataset.ir) window.location.href = tarjeta.dataset.ir;
        }
    });

    /* ---------- 9. INICIO ---------- */

    document.addEventListener("DOMContentLoaded", function () {
        renderizarDestacados();
        colocarDestacados();

        // Primero se dibujan los juegos locales y, cuando responde la API,
        // se vuelven a dibujar las categorías ya completas (mientras tanto
        // sigue la pantalla de carga de 5 s).
        renderizarCategorias(armarCategorias(null));
        cargarCategorias().then(function (categorias) {
            renderizarCategorias(categorias);
            requestAnimationFrame(alinearCarruseles);
        });

        // En celular, deslizar el dedo sobre el carrusel grande cambia de juego.
        const pista = document.querySelector(".carousel--featured");
        let inicioX = 0;
        pista.addEventListener("touchstart", function (e) {
            inicioX = e.touches[0].clientX;
        }, { passive: true });
        pista.addEventListener("touchend", function (e) {
            const dx = e.changedTouches[0].clientX - inicioX;
            if (Math.abs(dx) > 40) moverDestacados(dx < 0 ? 1 : -1);
        });

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
