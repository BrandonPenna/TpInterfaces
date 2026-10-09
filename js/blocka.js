/* ============================================================
   BLOCKA | Lógica del juego (pages/game_blocka.html)
   - La imagen se corta en piezas que aparecen giradas.
   - Clic izquierdo gira a la izquierda, clic derecho a la derecha.
   - 3 niveles, cada uno con un filtro aplicado píxel a píxel (ImageData).
   - Extras: animación de selección con miniaturas, cantidad de piezas
     (4/6/8), ayudita (+5 s) y tiempo máximo.
   ============================================================ */
(function () {
    "use strict";

    // ---------- DATOS ----------
    // Banco de imágenes (6): el juego elige una al azar en cada nivel
    const IMAGENES = [
        "../assets/games/juegos-momento/rdr2.jpg",
        "../assets/games/juegos-momento/gta-vi-1560x880.jpg.webp",
        "../assets/games/juegos-momento/peg-solitaire.webp",
        "../assets/games/premium/cubes.avif",
        "../assets/games/carrera/traffic_rider.avif",
        "../assets/games/aventura/bloxd.io.avif"
    ];

    // limite = segundos máximos (0 = sin límite)
    const NIVELES = [
        { filtro: "grises", nombre: "Escala de grises", limite: 0 },
        { filtro: "brillo", nombre: "Brillo 30%", limite: 120 },
        { filtro: "negativo", nombre: "Negativo", limite: 90 }
    ];

    const GRILLAS = { 4: [2, 2], 6: [3, 2], 8: [4, 2] }; // [columnas, filas]
    const TAM = 200;          // lado en px del canvas de cada pieza
    const PENALIZACION = 5;   // segundos que suma la ayudita

    // ---------- ELEMENTOS ----------
    const tablero = document.getElementById("blocka-board");
    const elNivel = document.getElementById("blocka-nivel");
    const elFiltro = document.getElementById("blocka-filtro");
    const elTiempo = document.getElementById("blocka-tiempo");
    const elRecord = document.getElementById("blocka-record");
    const elMensaje = document.getElementById("blocka-mensaje");
    const selPiezas = document.getElementById("blocka-piezas");
    const btnComenzar = document.getElementById("blocka-comenzar");
    const btnAyuda = document.getElementById("blocka-ayuda");
    const btnSiguiente = document.getElementById("blocka-siguiente");
    const btnMenu = document.getElementById("blocka-menu");

    // Miniaturas de todo el banco (se muestran en la animación de selección)
    const miniaturas = IMAGENES.map((src) => {
        const mini = document.createElement("img");
        mini.src = src;
        mini.alt = "";
        document.getElementById("blocka-miniaturas").appendChild(mini);
        return mini;
    });

    // ---------- ESTADO ----------
    let nivel = 0;
    let imagen = null;
    let piezas = [];      // cada una: { canvas, col, fila, rot, fija }
    let jugando = false;
    let segundos = 0;
    let reloj = null;

    // ---------- FILTROS (píxel a píxel) ----------
    // Cada filtro modifica R, G y B del píxel que empieza en la posición i
    const FILTROS = {
        grises(data, i) {
            const gris = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            data[i] = data[i + 1] = data[i + 2] = gris;
        },
        brillo(data, i) {
            data[i] = Math.min(255, data[i] * 1.3);
            data[i + 1] = Math.min(255, data[i + 1] * 1.3);
            data[i + 2] = Math.min(255, data[i + 2] * 1.3);
        },
        negativo(data, i) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }
    };

    function aplicarFiltro(canvas, nombre) {
        const ctx = canvas.getContext("2d");
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < imageData.data.length; i += 4) {
            FILTROS[nombre](imageData.data, i);
        }
        ctx.putImageData(imageData, 0, 0);
    }

    // ---------- DIBUJO ----------
    // Dibuja en el canvas la parte (col, fila) de la imagen. Se recorta el
    // centro con la proporción de la grilla para que cada pieza sea cuadrada.
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

        pieza.canvas.getContext("2d").drawImage(
            imagen,
            x0 + pieza.col * anchoPieza, y0 + pieza.fila * altoPieza, anchoPieza, altoPieza,
            0, 0, TAM, TAM
        );
    }

    function armarTablero() {
        const [cols, filas] = GRILLAS[selPiezas.value];
        tablero.innerHTML = "";
        tablero.classList.remove("is-resuelto");
        tablero.style.setProperty("--cols", cols);
        tablero.style.setProperty("--rows", filas);
        piezas = [];

        for (let i = 0; i < cols * filas; i++) {
            const canvas = document.createElement("canvas");
            canvas.width = TAM;
            canvas.height = TAM;
            canvas.className = "blocka__pieza";

            const pieza = {
                canvas,
                col: i % cols,
                fila: Math.floor(i / cols),
                rot: (Math.floor(Math.random() * 3) + 1) * 90, // 90, 180 o 270
                fija: false
            };
            dibujarPieza(pieza, cols, filas);
            aplicarFiltro(canvas, NIVELES[nivel].filtro);
            girar(pieza, 0);

            canvas.addEventListener("click", () => girar(pieza, -90));       // izquierdo: izquierda
            canvas.addEventListener("contextmenu", (e) => {                  // derecho: derecha
                e.preventDefault();
                girar(pieza, 90);
            });

            tablero.appendChild(canvas);
            piezas.push(pieza);
        }
    }

    // ---------- JUEGO ----------
    const estaBien = (pieza) => pieza.rot % 360 === 0;

    function girar(pieza, grados) {
        if (pieza.fija || (!jugando && grados !== 0)) return;
        pieza.rot += grados;
        pieza.canvas.style.transform = `rotate(${pieza.rot}deg)`;
        if (jugando && piezas.every(estaBien)) ganar();
    }

    // Extra 1: animación previa. Se resalta una miniatura tras otra, cada vez
    // más lejos, hasta frenar en la imagen elegida al azar del banco.
    function elegirImagen(alTerminar) {
        const elegida = Math.floor(Math.random() * IMAGENES.length);
        const pasos = IMAGENES.length * 2 + elegida; // dos vueltas y frena en la elegida
        let paso = 0;

        const animacion = setInterval(() => {
            miniaturas.forEach((mini, i) => mini.classList.toggle("is-activa", i === paso % IMAGENES.length));
            if (paso === pasos) {
                clearInterval(animacion);
                setTimeout(() => alTerminar(elegida), 700);
            }
            paso++;
        }, 150);
    }

    function comenzar() {
        btnComenzar.disabled = true;
        selPiezas.disabled = true;
        btnSiguiente.hidden = true;
        btnMenu.hidden = true;
        tablero.innerHTML = "";
        elMensaje.textContent = "Eligiendo imagen al azar...";

        elegirImagen((indice) => {
            const img = new Image();
            img.onload = () => {
                imagen = img;
                armarTablero();
                segundos = 0;
                jugando = true;
                elMensaje.textContent = "¡Armá la imagen!";
                btnAyuda.disabled = false;
                mostrarRecord();
                mostrarTiempo();
                reloj = setInterval(avanzarTiempo, 1000);
            };
            img.src = IMAGENES[indice];
        });
    }

    function terminar(mensaje) {
        jugando = false;
        clearInterval(reloj);
        btnAyuda.disabled = true;
        elMensaje.textContent = mensaje;
        btnMenu.hidden = false;
    }

    function ganar() {
        // Se quitan los filtros: cada pieza se vuelve a dibujar en RGB original
        const [cols, filas] = GRILLAS[selPiezas.value];
        piezas.forEach((p) => dibujarPieza(p, cols, filas));
        tablero.classList.add("is-resuelto");

        guardarRecord();
        terminar(`¡Nivel superado en ${formatear(segundos)}!`);
        if (nivel < NIVELES.length - 1) btnSiguiente.hidden = false;
        else elMensaje.textContent += " ¡Completaste los 3 niveles!";
    }

    function perder() {
        terminar("¡Se acabó el tiempo! Perdiste el nivel.");
        btnComenzar.disabled = false;
        btnComenzar.textContent = "Reintentar";
    }

    // Ayudita: deja una pieza bien puesta y fija, y suma 5 segundos
    function ayudita() {
        const mal = piezas.filter((p) => !estaBien(p));
        if (!jugando || mal.length === 0) return;

        const pieza = mal[Math.floor(Math.random() * mal.length)];
        pieza.rot = Math.round(pieza.rot / 360) * 360;
        pieza.fija = true;
        pieza.canvas.classList.add("is-fija");
        girar(pieza, 0);

        segundos += PENALIZACION;
        mostrarTiempo();
        if (piezas.every(estaBien)) ganar();
    }

    // ---------- TIEMPO Y RÉCORD ----------
    function formatear(seg) {
        const m = String(Math.floor(seg / 60)).padStart(2, "0");
        const s = String(seg % 60).padStart(2, "0");
        return `${m}:${s}`;
    }

    function avanzarTiempo() {
        segundos++;
        mostrarTiempo();
        const limite = NIVELES[nivel].limite;
        if (limite && segundos >= limite) perder();
    }

    // Con tiempo máximo se muestra cuánto queda; sin límite, cuánto pasó
    function mostrarTiempo() {
        const limite = NIVELES[nivel].limite;
        elTiempo.textContent = formatear(limite ? Math.max(limite - segundos, 0) : segundos);
    }

    const claveRecord = () => `blocka-n${nivel + 1}-p${selPiezas.value}`;

    function mostrarRecord() {
        const guardado = localStorage.getItem(claveRecord());
        elRecord.textContent = guardado ? formatear(Number(guardado)) : "--:--";
    }

    function guardarRecord() {
        const guardado = Number(localStorage.getItem(claveRecord()));
        if (!guardado || segundos < guardado) {
            localStorage.setItem(claveRecord(), segundos);
            elRecord.textContent = formatear(segundos);
        }
    }

    // ---------- NIVELES Y MENÚ ----------
    function mostrarNivel() {
        elNivel.textContent = `${nivel + 1} / ${NIVELES.length}`;
        elFiltro.textContent = NIVELES[nivel].nombre;
        mostrarRecord();
    }

    function siguienteNivel() {
        nivel++;
        mostrarNivel();
        comenzar();
    }

    function volverAlMenu() {
        clearInterval(reloj);
        jugando = false;
        nivel = 0;
        segundos = 0;
        tablero.innerHTML = "";
        mostrarNivel();
        mostrarTiempo();
        elMensaje.textContent = "Elegí la cantidad de piezas y presioná Comenzar.";
        btnComenzar.textContent = "Comenzar";
        btnComenzar.disabled = false;
        selPiezas.disabled = false;
        btnAyuda.disabled = true;
        btnSiguiente.hidden = true;
        btnMenu.hidden = true;
    }

    // ---------- EVENTOS ----------
    btnComenzar.addEventListener("click", comenzar);
    btnAyuda.addEventListener("click", ayudita);
    btnSiguiente.addEventListener("click", siguienteNivel);
    btnMenu.addEventListener("click", volverAlMenu);
    selPiezas.addEventListener("change", mostrarRecord);

    volverAlMenu();
})();
