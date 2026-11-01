/* ============================================================
   JUEGO | Orquestador del Peg Solitaire
   Une Canvas, Tablero, Timer, Fichas y Hints. Se encarga de:
   - precargar imágenes antes de arrancar,
   - convertir las coordenadas del mouse al espacio del canvas,
   - drag & drop con validación de saltos y retorno animado,
   - el loop de renderizado (requestAnimationFrame),
   - el HUD, el fin de juego y el reinicio.
   Depende de: Timer, Ficha, Hint y Tablero (cargadas antes).
   ============================================================ */

/**
 * Controlador principal del juego.
 */
class Juego {
    /** Estados generales de la partida. */
    static ESTADOS = Object.freeze({
        CARGANDO: "cargando",
        JUGANDO: "jugando",
        VICTORIA: "victoria",
        SIN_MOVIMIENTOS: "sin-movimientos",
        TIEMPO_AGOTADO: "tiempo-agotado"
    });

    /**
     * Skins de ficha (el índice coincide con el <select>): ruta de la imagen,
     * relativa a pages/, y color neón del borde del juego para ese estilo.
     */
    static SKINS = Object.freeze([
        { src: "../assets/solitaire/ficha-estilo1.svg", color: "#b6ff1a" },   // lima
        { src: "../assets/solitaire/ficha-estilo2.svg", color: "#ff3df0" },   // magenta
        { src: "../assets/solitaire/ficha-estilo3.svg", color: "#00e5ff" }    // cian
    ]);

    /** Ruta de la imagen de fondo del tablero. */
    static FONDO = "../assets/solitaire/fondo.webp";

    /**
     * Crea el juego a partir de los elementos del DOM (no arranca solo: llamar a iniciar()).
     * @param {{canvas: HTMLCanvasElement, elFichas: HTMLElement, elTiempo: HTMLElement,
     *          selSkin: HTMLSelectElement, selLimite: HTMLSelectElement,
     *          btnReiniciar: HTMLButtonElement}} refs Elementos que usa el juego.
     */
    constructor(refs) {
        /** @type {HTMLCanvasElement} */
        this.canvas = refs.canvas;
        /** @type {CanvasRenderingContext2D} */
        this.ctx = this.canvas.getContext("2d");
        this.elFichas = refs.elFichas;
        this.elTiempo = refs.elTiempo;
        this.selSkin = refs.selSkin;
        this.selLimite = refs.selLimite;
        this.btnReiniciar = refs.btnReiniciar;

        /** @type {string} Uno de Juego.ESTADOS. */
        this.estado = Juego.ESTADOS.CARGANDO;
        /** @type {HTMLImageElement[]} Skins ya cargadas. */
        this.imagenesSkin = [];
        /** @type {Tablero} */
        this.tablero = new Tablero(this.canvas.width, this.canvas.height, 100);
        /** @type {Ficha[]} */
        this.fichas = [];
        /** @type {Hint[]} */
        this.hints = [];
        /** @type {?Ficha} Ficha que se está arrastrando. */
        this.fichaActiva = null;
        /** @type {boolean} true una vez hecho el primer click: el timer arranca ahí. */
        this.timerArrancado = false;
        /** @type {string} Tipografía del sitio, para que el texto del canvas combine con la página. */
        this.fuente = getComputedStyle(this.canvas).fontFamily || "sans-serif";
        /** @type {?{x: number, y: number, w: number, h: number}} Zona clickeable del botón del cartel de fin. */
        this.botonFin = null;
        /** @type {boolean} true mientras el cursor está sobre ese botón. */
        this.hoverBotonFin = false;
        /** @type {number} Instante (ms) en que terminó la partida, para animar la entrada del cartel. */
        this.finDesde = 0;

        /** @type {Timer} */
        this.timer = new Timer(
            this.limiteSegundos(),
            () => this.actualizarHUD(),
            () => this.terminar(Juego.ESTADOS.TIEMPO_AGOTADO)
        );

        this.loop = this.loop.bind(this);
        this.registrarEventos();
    }

    /**
     * Lee el tiempo límite elegido en el selector.
     * @returns {number} Segundos del límite (300 si el valor no es válido).
     */
    limiteSegundos() {
        return parseInt(this.selLimite.value, 10) || 300;
    }

    /**
     * Carga una imagen y espera a que esté lista.
     * Cómo: resuelve la promesa en onload y también en onerror (se informa por
     * consola) para que un asset roto no deje el juego trabado en "cargando".
     * @param {string} src Ruta de la imagen.
     * @returns {Promise<HTMLImageElement>} La imagen (completa o con error).
     */
    cargarImagen(src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => {
                console.error("No se pudo cargar la imagen:", src);
                resolve(img);
            };
            img.src = src;
        });
    }

    /**
     * Precarga las 3 skins y el fondo en paralelo.
     * @returns {Promise<void>} Se resuelve cuando todo terminó de cargar.
     */
    async precargar() {
        const [fondo, ...skins] = await Promise.all([
            this.cargarImagen(Juego.FONDO),
            ...Juego.SKINS.map((skin) => this.cargarImagen(skin.src))
        ]);
        this.tablero.fondo = fondo;
        this.imagenesSkin = skins;
    }

    /**
     * Arranca el juego: muestra "Cargando...", precarga recursos, arma las
     * fichas y lanza el loop de animación.
     * @returns {Promise<void>} Se resuelve cuando el loop ya está en marcha.
     */
    async iniciar() {
        this.dibujarCargando();
        await this.precargar();
        this.reiniciar();
        requestAnimationFrame(this.loop);
    }

    /**
     * Restablece todo: tablero, fichas, hints, timer y HUD.
     * Cómo: reinicia la matriz, vuelve a generar las fichas, detiene el timer
     * y lo deja con el límite elegido; el timer vuelve a arrancar con el primer click.
     * @returns {void}
     */
    reiniciar() {
        this.tablero.inicializar();
        this.limpiarSeleccion();
        this.crearFichas();
        this.aplicarColorEstilo();
        this.botonFin = null;
        this.hoverBotonFin = false;
        this.canvas.classList.remove("is-boton");
        this.estado = Juego.ESTADOS.JUGANDO;
        this.timerArrancado = false;
        this.timer.reiniciar(this.limiteSegundos()); // frena la cuenta y refresca el HUD
    }

    /**
     * Pinta el borde del juego con el color del estilo de ficha elegido.
     * Cómo: guarda el color en la variable CSS --color-estilo del contenedor
     * del juego (el padre del canvas), así la heredan el marco del canvas y los
     * bordes de los controles de arriba (solitaire.css); además se lo pasa al
     * tablero, que redibuja el filete de su placa con ese color.
     * @returns {void}
     */
    aplicarColorEstilo() {
        const color = this.colorEstilo();
        this.canvas.parentElement.style.setProperty("--color-estilo", color);
        this.tablero.setColorBorde(color);
    }

    /**
     * Cancela la selección actual: borra los hints y el cursor de arrastre.
     * Cómo: pone fichaActiva en null (guardándola antes), vacía la lista de
     * hints y quita la clase CSS que muestra la manito cerrada.
     * @returns {?Ficha} La ficha que estaba seleccionada, o null si no había.
     */
    limpiarSeleccion() {
        const ficha = this.fichaActiva;
        this.fichaActiva = null;
        this.hints = [];
        this.canvas.classList.remove("is-arrastrando");
        return ficha;
    }

    /**
     * Crea un objeto Ficha por cada casillero con ficha en la matriz.
     * @returns {void}
     */
    crearFichas() {
        const imagen = this.imagenesSkin[this.skinActual()];
        this.fichas = [];
        for (let f = 0; f < Tablero.TAMANIO; f++) {
            for (let c = 0; c < Tablero.TAMANIO; c++) {
                if (this.tablero.getEstado(f, c) !== Tablero.ESTADOS.FICHA) continue;
                const { x, y } = this.tablero.centroDe(f, c);
                this.fichas.push(new Ficha(f, c, x, y, imagen, this.tablero.radioFicha));
            }
        }
    }

    /**
     * Índice de la skin elegida en el selector.
     * @returns {number} Índice válido dentro de imagenesSkin (0 por defecto).
     */
    skinActual() {
        const i = parseInt(this.selSkin.value, 10);
        return i >= 0 && i < this.imagenesSkin.length ? i : 0;
    }

    /**
     * Conecta los eventos de mouse y de los controles.
     * Cómo: mousedown en el canvas; mousemove y mouseup en window para seguir
     * arrastrando aunque el cursor salga del canvas. Un cambio de skin se
     * aplica en vivo; uno de tiempo límite reinicia la partida.
     * @returns {void}
     */
    registrarEventos() {
        this.canvas.addEventListener("mousedown", (e) => this.alPresionar(e));
        window.addEventListener("mousemove", (e) => this.alMover(e));
        window.addEventListener("mouseup", () => this.alSoltar());

        this.btnReiniciar.addEventListener("click", () => this.reiniciar());
        this.selLimite.addEventListener("change", () => this.reiniciar());
        this.selSkin.addEventListener("change", () => {
            const imagen = this.imagenesSkin[this.skinActual()];
            this.fichas.forEach((f) => f.setImagen(imagen));
            this.aplicarColorEstilo();
        });
    }

    /**
     * Convierte un evento de mouse a coordenadas del canvas.
     * Cómo: el canvas se escala por CSS, así que se corrige con la relación
     * entre su tamaño lógico (canvas.width) y el mostrado (rect.width).
     * @param {MouseEvent} e Evento de mouse.
     * @returns {{x: number, y: number}} Posición en píxeles del canvas.
     */
    posicionMouse(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
            y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
        };
    }

    /**
     * Click sobre el canvas: selecciona una ficha y muestra sus hints.
     * Cómo: busca la ficha bajo el mouse (la última dibujada gana), la marca
     * como arrastrada, inicia el timer si es la primera vez y crea un Hint por
     * cada destino válido que devuelve el tablero.
     * @param {MouseEvent} e Evento mousedown.
     * @returns {void}
     */
    alPresionar(e) {
        if (e.button !== 0) return;
        const { x, y } = this.posicionMouse(e);

        // Con el cartel de fin en pantalla, el único click que importa es el del botón
        if (this.estado !== Juego.ESTADOS.JUGANDO) {
            if (this.sobreBotonFin(x, y)) this.reiniciar();
            return;
        }

        const ficha = [...this.fichas].reverse()
            .find((f) => f.estado === Ficha.ESTADOS.EN_TABLERO && f.contiene(x, y));
        if (!ficha) return;

        this.fichaActiva = ficha;
        ficha.comenzarArrastre(x, y);
        this.canvas.classList.add("is-arrastrando");

        if (!this.timerArrancado) {
            this.timerArrancado = true;
            this.timer.iniciar();
        }
        this.crearHints(ficha);
    }

    /**
     * Crea un Hint animado por cada casillero donde la ficha puede caer.
     * @param {Ficha} ficha Ficha seleccionada.
     * @returns {void}
     */
    crearHints(ficha) {
        const radio = this.tablero.radioFicha * 1.1;
        this.hints = this.tablero.movimientosDe(ficha.fila, ficha.col).map((m, i) => {
            const { x, y } = this.tablero.centroDe(m.destFila, m.destCol);
            return new Hint(x, y, radio, i * 0.8);
        });
    }

    /**
     * Movimiento del mouse: arrastra la ficha activa o, si terminó la
     * partida, detecta cuándo el cursor pasa sobre el botón "Reiniciar" del
     * cartel (para resaltarlo y mostrar la manito).
     * @param {MouseEvent} e Evento mousemove.
     * @returns {void}
     */
    alMover(e) {
        if (this.estado !== Juego.ESTADOS.JUGANDO) {
            const { x, y } = this.posicionMouse(e);
            this.hoverBotonFin = this.sobreBotonFin(x, y);
            this.canvas.classList.toggle("is-boton", this.hoverBotonFin);
            return;
        }
        if (!this.fichaActiva) return;
        const { x, y } = this.posicionMouse(e);
        this.fichaActiva.arrastrarA(x, y);
    }

    /**
     * Indica si un punto del canvas cae sobre el botón "Reiniciar" del cartel de fin.
     * @param {number} x Coordenada X en el espacio del canvas.
     * @param {number} y Coordenada Y en el espacio del canvas.
     * @returns {boolean} true si el cartel está visible y el punto está dentro del botón.
     */
    sobreBotonFin(x, y) {
        const b = this.botonFin;
        return !!b && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
    }

    /**
     * Soltar el mouse: valida el casillero destino.
     * Cómo: toma el casillero bajo el centro de la ficha; si es un salto válido
     * lo aplica, si no la ficha vuelve animada a su casillero de origen.
     * Siempre limpia los hints y el cursor de arrastre.
     * @returns {void}
     */
    alSoltar() {
        const ficha = this.limpiarSeleccion();
        if (!ficha) return;
        ficha.soltar();

        const destino = this.tablero.casilleroEn(ficha.x, ficha.y);
        const movimiento = destino
            ? this.tablero.esMovimientoValido(ficha.fila, ficha.col, destino.fila, destino.col)
            : null;

        if (movimiento) {
            this.ejecutarSalto(ficha, movimiento);
        } else {
            const origen = this.tablero.centroDe(ficha.fila, ficha.col);
            ficha.animarRetorno(origen.x, origen.y, 260);
        }
    }

    /**
     * Aplica un salto válido: actualiza la matriz, mueve la ficha, quita la
     * saltada y comprueba si terminó la partida.
     * @param {Ficha} ficha Ficha que saltó.
     * @param {object} movimiento Movimiento devuelto por Tablero.esMovimientoValido().
     * @returns {void}
     */
    ejecutarSalto(ficha, movimiento) {
        this.tablero.aplicarSalto(movimiento);
        this.fichas = this.fichas.filter(
            (f) => !(f.fila === movimiento.saltadaFila && f.col === movimiento.saltadaCol)
        );

        const destino = this.tablero.centroDe(movimiento.destFila, movimiento.destCol);
        ficha.fila = movimiento.destFila;
        ficha.col = movimiento.destCol;
        ficha.animarRetorno(destino.x, destino.y, 140); // desliza al casillero final

        this.actualizarHUD();
        this.evaluarFin();
    }

    /**
     * Evalúa el final después de cada movimiento exitoso.
     * Cómo: 1 sola ficha = victoria; si no, sin jugadas posibles = fin.
     * @returns {void}
     */
    evaluarFin() {
        if (this.tablero.contarFichas() === 1) {
            this.terminar(Juego.ESTADOS.VICTORIA);
        } else if (!this.tablero.hayMovimientos()) {
            this.terminar(Juego.ESTADOS.SIN_MOVIMIENTOS);
        }
    }

    /**
     * Finaliza la partida: frena el timer, devuelve a su casillero la ficha
     * que estuviera en mano y pasa al estado final (el overlay se dibuja en el loop).
     * @param {string} motivo Uno de Juego.ESTADOS (VICTORIA, SIN_MOVIMIENTOS, TIEMPO_AGOTADO).
     * @returns {void}
     */
    terminar(motivo) {
        if (this.estado !== Juego.ESTADOS.JUGANDO) return;
        this.timer.pausar();

        const enMano = this.limpiarSeleccion();
        if (enMano) {
            const origen = this.tablero.centroDe(enMano.fila, enMano.col);
            enMano.soltar();
            enMano.animarRetorno(origen.x, origen.y, 260);
        }
        this.estado = motivo;
        this.finDesde = performance.now();   // arranca la animación de entrada del cartel
        this.actualizarHUD();
    }

    /**
     * Refresca el HUD: cantidad de fichas, tiempo mm:ss y marca de urgencia
     * (rojo) cuando quedan 30 segundos o menos.
     * @returns {void}
     */
    actualizarHUD() {
        const fichas = String(this.tablero.contarFichas());
        if (this.elFichas.textContent !== fichas) this.elFichas.textContent = fichas;

        const tiempo = this.timer.formato();
        if (this.elTiempo.textContent !== tiempo) this.elTiempo.textContent = tiempo;

        const urgente = this.timerArrancado && this.timer.getRestante() <= 30;
        this.elTiempo.parentElement.classList.toggle("is-urgente", urgente);
    }

    /**
     * Loop principal (un frame): avanza animaciones y redibuja todo.
     * Orden: fondo y tablero, hints, fichas (la arrastrada al final, encima de
     * todas) y overlay si la partida terminó.
     * @param {number} ahora Marca de tiempo de requestAnimationFrame.
     * @returns {void}
     */
    loop(ahora) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.tablero.draw(ctx);
        this.hints.forEach((h) => h.draw(ctx, ahora));

        this.fichas.forEach((f) => f.actualizar(ahora));
        this.fichas.filter((f) => f !== this.fichaActiva).forEach((f) => f.draw(ctx));
        if (this.fichaActiva) this.fichaActiva.draw(ctx);

        if (this.estado !== Juego.ESTADOS.JUGANDO) this.dibujarOverlay(ctx, ahora);

        requestAnimationFrame(this.loop);
    }

    /**
     * Pantalla simple de espera mientras se cargan las imágenes.
     * @returns {void}
     */
    dibujarCargando() {
        const ctx = this.ctx;
        ctx.fillStyle = "#05060f";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = "#00e5ff";
        ctx.font = "700 36px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Cargando...", this.canvas.width / 2, this.canvas.height / 2);
    }

    /**
     * Color neón del estilo de ficha elegido.
     * @returns {string} Color CSS (por ejemplo "#ff3df0").
     */
    colorEstilo() {
        return Juego.SKINS[this.skinActual()].color;
    }

    /**
     * Textos y color del título del cartel según cómo terminó la partida.
     * "Sin movimientos" toma el color del estilo elegido; victoria (verde) y
     * tiempo agotado (rojo) conservan un color propio para que se entienda el resultado.
     * @returns {{titulo: string, detalle: string, color: string}} Contenido del cartel.
     */
    textoFin() {
        const E = Juego.ESTADOS;
        if (this.estado === E.VICTORIA) {
            const centro = this.tablero.getEstado(3, 3) === Tablero.ESTADOS.FICHA;
            return {
                titulo: "¡Victoria!",
                detalle: centro ? "Quedó una sola ficha, ¡y en el centro! Resultado perfecto."
                                : "Quedó una sola ficha en el tablero.",
                color: "#7dff9b"
            };
        }
        if (this.estado === E.TIEMPO_AGOTADO) {
            return { titulo: "¡Tiempo agotado!", detalle: "Se acabó el tiempo antes de terminar el tablero.", color: "#ff4d6d" };
        }
        return { titulo: "Sin movimientos", detalle: "No quedan jugadas posibles en el tablero.", color: this.colorEstilo() };
    }

    /**
     * Traza (sin dibujar) un rectángulo con esquinas redondeadas.
     * Cómo: arma el path con cuatro arcTo(), uno por esquina.
     * @param {CanvasRenderingContext2D} ctx Contexto 2D del canvas.
     * @param {number} x Borde izquierdo.
     * @param {number} y Borde superior.
     * @param {number} w Ancho.
     * @param {number} h Alto.
     * @param {number} r Radio de las esquinas.
     * @returns {void}
     */
    trazarRectRedondeado(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    /**
     * Dibuja un recuadro de dato (etiqueta chica arriba y valor grande abajo).
     * @param {CanvasRenderingContext2D} ctx Contexto 2D del canvas.
     * @param {number} x Borde izquierdo del recuadro.
     * @param {number} y Borde superior del recuadro.
     * @param {number} w Ancho.
     * @param {number} h Alto.
     * @param {string} etiqueta Texto chico en mayúsculas (por ejemplo "FICHAS RESTANTES").
     * @param {string} valor Texto grande con el dato.
     * @returns {void}
     */
    dibujarChip(ctx, x, y, w, h, etiqueta, valor) {
        this.trazarRectRedondeado(ctx, x, y, w, h, 16);
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.fillStyle = "#8fa3b5";
        ctx.font = `600 13px ${this.fuente}`;
        ctx.fillText(etiqueta, x + w / 2, y + 28);
        ctx.fillStyle = "#ffffff";
        ctx.font = `700 36px ${this.fuente}`;
        ctx.fillText(valor, x + w / 2, y + 66);
    }

    /**
     * Dibuja el cartel de fin de juego: un panel con vidrio oscuro, borde y
     * brillo del color del estilo, título, línea divisoria, explicación, dos
     * datos (fichas y tiempo restantes) y un botón "Reiniciar" clickeable.
     * Cómo: una capa oscura tapa el tablero; el panel entra con un fundido y un
     * pequeño deslizamiento (easeOutCubic, 400 ms) calculados con el tiempo
     * transcurrido desde que terminó la partida. La zona del botón se guarda en
     * this.botonFin (en su posición final) para detectar el click y el hover.
     * @param {CanvasRenderingContext2D} ctx Contexto 2D del canvas.
     * @param {number} ahora Marca de tiempo del frame (requestAnimationFrame).
     * @returns {void}
     */
    dibujarOverlay(ctx, ahora) {
        const { titulo, detalle, color } = this.textoFin();
        const acento = this.colorEstilo();
        const W = this.canvas.width;
        const H = this.canvas.height;
        const cx = W / 2;

        const t = Math.max(0, Math.min(1, (ahora - this.finDesde) / 400));
        const e = 1 - Math.pow(1 - t, 3);

        // Geometría del panel y del botón
        const pw = 760, ph = 420;
        const px = cx - pw / 2;
        const pyFinal = (H - ph) / 2;
        const py = pyFinal + (1 - e) * 28;
        const bw = 250, bh = 56;
        const bx = cx - bw / 2;
        const by = py + 340;
        this.botonFin = { x: bx, y: pyFinal + 340, w: bw, h: bh };

        ctx.save();
        ctx.globalAlpha = e;
        ctx.fillStyle = "rgba(0, 0, 10, 0.75)";
        ctx.fillRect(0, 0, W, H);

        // Panel: sombra + relleno degradado oscuro
        ctx.save();
        this.trazarRectRedondeado(ctx, px, py, pw, ph, 28);
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = 50;
        ctx.shadowOffsetY = 20;
        const vidrio = ctx.createLinearGradient(0, py, 0, py + ph);
        vidrio.addColorStop(0, "#1b2231");
        vidrio.addColorStop(1, "#0a0d15");
        ctx.fillStyle = vidrio;
        ctx.fill();
        ctx.restore();

        // Borde neón del estilo
        ctx.save();
        this.trazarRectRedondeado(ctx, px, py, pw, ph, 28);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = acento;
        ctx.shadowColor = acento;
        ctx.shadowBlur = 22;
        ctx.stroke();
        ctx.restore();

        // Encabezado y título
        ctx.textAlign = "center";
        ctx.fillStyle = "#8fa3b5";
        ctx.font = `600 17px ${this.fuente}`;
        if ("letterSpacing" in ctx) ctx.letterSpacing = "5px";
        ctx.fillText("FIN DE LA PARTIDA", cx, py + 52);
        if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";

        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.fillStyle = color;
        ctx.font = `800 66px ${this.fuente}`;
        ctx.fillText(titulo, cx, py + 125);
        ctx.restore();

        // Línea divisoria que se desvanece en los extremos
        const linea = ctx.createLinearGradient(cx - 200, 0, cx + 200, 0);
        linea.addColorStop(0, "rgba(255, 255, 255, 0)");
        linea.addColorStop(0.5, acento);
        linea.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = linea;
        ctx.fillRect(cx - 200, py + 150, 400, 2);

        ctx.fillStyle = "#dfe7f3";
        ctx.font = `500 23px ${this.fuente}`;
        ctx.fillText(detalle, cx, py + 196);

        // Datos de la partida
        this.dibujarChip(ctx, cx - 244, py + 226, 230, 90, "FICHAS RESTANTES", String(this.tablero.contarFichas()));
        this.dibujarChip(ctx, cx + 14, py + 226, 230, 90, "TIEMPO RESTANTE", this.timer.formato());

        // Botón Reiniciar (resalta cuando el cursor está encima)
        const hover = this.hoverBotonFin;
        ctx.save();
        this.trazarRectRedondeado(ctx, bx, by, bw, bh, 18);
        ctx.shadowColor = acento;
        ctx.shadowBlur = hover ? 28 : 12;
        const relleno = ctx.createLinearGradient(0, by, 0, by + bh);
        relleno.addColorStop(0, hover ? "rgba(255, 255, 255, 0.28)" : "rgba(255, 255, 255, 0.12)");
        relleno.addColorStop(1, "rgba(255, 255, 255, 0.04)");
        ctx.fillStyle = relleno;
        ctx.fill();
        ctx.lineWidth = hover ? 3 : 2;
        ctx.strokeStyle = acento;
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = "#ffffff";
        ctx.font = `700 22px ${this.fuente}`;
        if ("letterSpacing" in ctx) ctx.letterSpacing = "3px";
        ctx.fillText("REINICIAR", cx, by + 36);
        if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";

        ctx.restore();
    }
}
