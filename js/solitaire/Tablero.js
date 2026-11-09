/* ============================================================
   TABLERO | Lógica y dibujo del tablero de Peg Solitaire
   Grilla 7x7 con distintas formas (cruz, triángulo, diamante y
   flecha; ver Tablero.FORMAS). Los casilleros fuera de la forma
   son NULO. Al empezar, todos los casilleros tienen ficha menos
   uno elegido al azar.
   ============================================================ */

/**
 * Tablero lógico (matriz) + mapeo a coordenadas del canvas.
 */
class Tablero {
    /** Estados de un casillero de la matriz. */
    static ESTADOS = Object.freeze({
        NULO: -1,   // fuera de la cruz: no existe
        VACIO: 0,   // casillero jugable sin ficha
        FICHA: 1    // casillero jugable con ficha
    });

    /** Tamaño de la grilla (7x7). */
    static TAMANIO = 7;

    /** Direcciones de salto: [dFila, dCol] arriba, abajo, izquierda y derecha. */
    static DIRECCIONES = Object.freeze([[-1, 0], [1, 0], [0, -1], [0, 1]]);

    /**
     * Formas de tablero que puede elegir el usuario. Cada una es un "dibujo"
     * de 7 filas x 7 columnas: "X" = casillero jugable, "." = no existe (NULO).
     */
    static FORMAS = Object.freeze({
        normal: [
            "..XXX..",
            "..XXX..",
            "XXXXXXX",
            "XXXXXXX",
            "XXXXXXX",
            "..XXX..",
            "..XXX.."
        ],
        triangulo: [
            "...X...",
            "...X...",
            "..XXX..",
            "..XXX..",
            ".XXXXX.",
            ".XXXXX.",
            "XXXXXXX"
        ],
        diamante: [
            "...X...",
            "..XXX..",
            ".XXXXX.",
            "XXXXXXX",
            ".XXXXX.",
            "..XXX..",
            "...X..."
        ],
        flecha: [
            "...X...",
            "..XXX..",
            ".XXXXX.",
            "XXXXXXX",
            "..XXX..",
            "..XXX..",
            "..XXX.."
        ]
    });

    /**
     * Crea el tablero y lo deja en la posición inicial.
     * @param {number} anchoCanvas Ancho lógico del canvas, en píxeles.
     * @param {number} altoCanvas Alto lógico del canvas, en píxeles.
     * @param {number} [celda=100] Lado de cada casillero, en píxeles.
     * @param {?HTMLImageElement} [fondo=null] Imagen de fondo temática (opcional,
     *        también se puede asignar después con tablero.fondo = img).
     */
    constructor(anchoCanvas, altoCanvas, celda = 100, fondo = null) {
        /** @type {number} */
        this.anchoCanvas = anchoCanvas;
        /** @type {number} */
        this.altoCanvas = altoCanvas;
        /** @type {number} */
        this.celda = celda;
        /** @type {?HTMLImageElement} */
        this.fondo = fondo;
        /** @type {number} X de la esquina superior izquierda de la grilla (centrada en el canvas). */
        this.origenX = (anchoCanvas - Tablero.TAMANIO * celda) / 2;
        /** @type {number} */
        this.origenY = (altoCanvas - Tablero.TAMANIO * celda) / 2;
        /** @type {?HTMLCanvasElement} Capa estática (fondo + placa + huecos) ya dibujada. */
        this.capaEstatica = null;
        /** @type {string} Color neón del filete de la placa (cambia con el estilo de ficha). */
        this.colorBorde = "#39ff14";
        /** @type {number[][]} Matriz [fila][col] con valores de Tablero.ESTADOS. */
        this.matriz = [];
        this.inicializar();
    }

    /**
     * Radio recomendado para dibujar fichas y hints dentro de un casillero.
     * @returns {number} Radio en píxeles (≈ 40 % del lado de la celda).
     */
    get radioFicha() {
        return this.celda * 0.4;
    }

    /**
     * Arma la matriz inicial a partir de una de las Tablero.FORMAS: todos los
     * casilleros jugables con ficha y uno solo vacío, elegido al azar.
     * Cómo: recorre el dibujo de la forma; cada "X" pasa a FICHA y cada "." a
     * NULO. Después pone el hueco aleatorio. Como la forma puede cambiar, se
     * descarta la capa estática para que la placa se vuelva a dibujar.
     * @param {string} [forma="normal"] Clave de Tablero.FORMAS.
     * @returns {void}
     */
    inicializar(forma = "normal") {
        const { NULO, FICHA } = Tablero.ESTADOS;
        const dibujo = Tablero.FORMAS[forma] || Tablero.FORMAS.normal;

        this.matriz = dibujo.map((fila) => [...fila].map((letra) => letra === "X" ? FICHA : NULO));
        this.ponerHuecoAleatorio();
        this.capaEstatica = null;
    }

    /**
     * Vacía un casillero jugable al azar (el hueco inicial de la partida).
     * Cómo: junta todos los casilleros con ficha y elige uno con Math.random().
     * Si con ese hueco no se puede hacer ningún salto, lo vuelve a llenar y
     * prueba con otro, así la partida nunca arranca trabada.
     * @returns {void}
     */
    ponerHuecoAleatorio() {
        const { VACIO, FICHA } = Tablero.ESTADOS;
        const casilleros = [];
        for (let f = 0; f < Tablero.TAMANIO; f++) {
            for (let c = 0; c < Tablero.TAMANIO; c++) {
                if (this.matriz[f][c] === FICHA) casilleros.push({ fila: f, col: c });
            }
        }

        let hueco = null;
        do {
            if (hueco) this.matriz[hueco.fila][hueco.col] = FICHA;   // deshace el intento anterior
            hueco = casilleros[Math.floor(Math.random() * casilleros.length)];
            this.matriz[hueco.fila][hueco.col] = VACIO;
        } while (!this.hayMovimientos());
    }

    /**
     * Indica si un casillero existe dentro de la cruz.
     * @param {number} fila Fila lógica.
     * @param {number} col Columna lógica.
     * @returns {boolean} true si está dentro de la matriz y no es NULO.
     */
    esJugable(fila, col) {
        const n = Tablero.TAMANIO;
        return fila >= 0 && fila < n && col >= 0 && col < n &&
            this.matriz[fila][col] !== Tablero.ESTADOS.NULO;
    }

    /**
     * Lee el estado de un casillero.
     * @param {number} fila Fila lógica.
     * @param {number} col Columna lógica.
     * @returns {number} Un valor de Tablero.ESTADOS (NULO si está fuera de la grilla).
     */
    getEstado(fila, col) {
        return this.esJugable(fila, col) ? this.matriz[fila][col] : Tablero.ESTADOS.NULO;
    }

    /**
     * Coordenadas del centro de un casillero en el canvas (fila,col → píxeles).
     * Cómo: origen de la grilla + índice * lado de celda + media celda.
     * @param {number} fila Fila lógica.
     * @param {number} col Columna lógica.
     * @returns {{x: number, y: number}} Centro del casillero en píxeles.
     */
    centroDe(fila, col) {
        return {
            x: this.origenX + col * this.celda + this.celda / 2,
            y: this.origenY + fila * this.celda + this.celda / 2
        };
    }

    /**
     * Casillero que contiene un punto del canvas (píxeles → fila,col).
     * Cómo: resta el origen y divide por el lado de celda con Math.floor;
     * descarta los puntos fuera de la grilla o sobre casilleros NULOS.
     * @param {number} px Coordenada X en el espacio del canvas.
     * @param {number} py Coordenada Y en el espacio del canvas.
     * @returns {?{fila: number, col: number}} El casillero, o null si no hay ninguno.
     */
    casilleroEn(px, py) {
        const col = Math.floor((px - this.origenX) / this.celda);
        const fila = Math.floor((py - this.origenY) / this.celda);
        return this.esJugable(fila, col) ? { fila, col } : null;
    }

    /**
     * Calcula todos los saltos válidos de la ficha que está en un casillero.
     * Cómo: para cada una de las 4 direcciones, un salto es válido si el vecino
     * inmediato tiene FICHA y el casillero siguiente (a 2 pasos) es jugable y
     * está VACIO. Si el origen no tiene ficha devuelve lista vacía.
     * @param {number} fila Fila lógica de la ficha.
     * @param {number} col Columna lógica de la ficha.
     * @returns {{origenFila: number, origenCol: number, saltadaFila: number,
     *            saltadaCol: number, destFila: number, destCol: number}[]}
     *          Lista de movimientos posibles (puede estar vacía).
     */
    movimientosDe(fila, col) {
        const { FICHA, VACIO } = Tablero.ESTADOS;
        const movimientos = [];
        if (this.getEstado(fila, col) !== FICHA) return movimientos;

        for (const [df, dc] of Tablero.DIRECCIONES) {
            const sf = fila + df, sc = col + dc;           // casillero saltado
            const tf = fila + 2 * df, tc = col + 2 * dc;   // casillero destino
            if (this.getEstado(sf, sc) === FICHA && this.getEstado(tf, tc) === VACIO) {
                movimientos.push({
                    origenFila: fila, origenCol: col,
                    saltadaFila: sf, saltadaCol: sc,
                    destFila: tf, destCol: tc
                });
            }
        }
        return movimientos;
    }

    /**
     * Comprueba si mover de un casillero a otro es un salto válido.
     * Cómo: busca el destino entre los movimientos que devuelve movimientosDe().
     * @param {number} origenFila Fila de la ficha.
     * @param {number} origenCol Columna de la ficha.
     * @param {number} destFila Fila donde se la quiere soltar.
     * @param {number} destCol Columna donde se la quiere soltar.
     * @returns {?object} El movimiento (listo para aplicarSalto) o null si es inválido.
     */
    esMovimientoValido(origenFila, origenCol, destFila, destCol) {
        return this.movimientosDe(origenFila, origenCol)
            .find((m) => m.destFila === destFila && m.destCol === destCol) || null;
    }

    /**
     * Ejecuta un salto sobre la matriz: la ficha pasa al destino y se elimina
     * la saltada. No valida: se espera un movimiento obtenido de
     * movimientosDe() o esMovimientoValido().
     * @param {{origenFila: number, origenCol: number, saltadaFila: number,
     *          saltadaCol: number, destFila: number, destCol: number}} movimiento
     *        Movimiento a aplicar.
     * @returns {void}
     */
    aplicarSalto(movimiento) {
        const { VACIO, FICHA } = Tablero.ESTADOS;
        this.matriz[movimiento.origenFila][movimiento.origenCol] = VACIO;
        this.matriz[movimiento.saltadaFila][movimiento.saltadaCol] = VACIO;
        this.matriz[movimiento.destFila][movimiento.destCol] = FICHA;
    }

    /**
     * Determina si queda al menos una jugada en todo el tablero.
     * Cómo: recorre la matriz y corta apenas encuentra una ficha con
     * movimientosDe() no vacío.
     * @returns {boolean} true si todavía se puede mover alguna ficha.
     */
    hayMovimientos() {
        const n = Tablero.TAMANIO;
        for (let f = 0; f < n; f++) {
            for (let c = 0; c < n; c++) {
                if (this.movimientosDe(f, c).length > 0) return true;
            }
        }
        return false;
    }

    /**
     * Cuenta las fichas que siguen en el tablero.
     * @returns {number} Cantidad de casilleros con FICHA (32 al empezar).
     */
    contarFichas() {
        return this.matriz.reduce(
            (total, fila) => total + fila.filter((e) => e === Tablero.ESTADOS.FICHA).length, 0
        );
    }

    /**
     * Dibuja el tablero completo (fondo, placa y casilleros); las fichas las
     * dibuja la clase Ficha encima.
     * Cómo: todo esto es estático, así que se pinta una sola vez en un canvas
     * invisible (capa cacheada) y en cada frame solo se copia con drawImage.
     * Evita recalcular sombras y degradados costosos 60 veces por segundo.
     * @param {CanvasRenderingContext2D} ctx Contexto 2D del canvas.
     * @returns {void}
     */
    draw(ctx) {
        if (!this.capaEstatica) this.construirCapaEstatica();
        ctx.drawImage(this.capaEstatica, 0, 0);
    }

    /**
     * Pinta fondo + placa + casilleros en un canvas auxiliar y lo guarda.
     * @returns {void}
     */
    construirCapaEstatica() {
        const capa = document.createElement("canvas");
        capa.width = this.anchoCanvas;
        capa.height = this.altoCanvas;
        const c = capa.getContext("2d");

        this.dibujarFondo(c);
        this.dibujarPlaca(c);
        this.dibujarHuecos(c);

        this.capaEstatica = capa;
    }

    /**
     * Traza (sin rellenar) la forma del tablero, sea cual sea (cruz, triángulo...).
     * Cómo: agrega un cuadrado redondeado por cada casillero jugable, un poco más
     * grande que la celda (margen) para que se solapen con sus vecinos. Al
     * rellenar o recortar con ese path, todos los cuadrados se ven como una
     * sola placa. El radio es igual al margen para que no queden "muescas"
     * donde se juntan dos casilleros.
     * @param {CanvasRenderingContext2D} ctx Contexto sobre el que se traza el path.
     * @param {number} margen Píxeles que se agranda cada casillero hacia afuera.
     * @returns {{x0: number, y0: number, x1: number, y1: number}} Caja que contiene la forma.
     */
    trazarForma(ctx, margen) {
        const lado = this.celda + margen * 2;
        const caja = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };

        ctx.beginPath();
        for (let f = 0; f < Tablero.TAMANIO; f++) {
            for (let c = 0; c < Tablero.TAMANIO; c++) {
                if (!this.esJugable(f, c)) continue;
                const x = this.origenX + c * this.celda - margen;
                const y = this.origenY + f * this.celda - margen;
                ctx.roundRect(x, y, lado, lado, margen);
                caja.x0 = Math.min(caja.x0, x);
                caja.y0 = Math.min(caja.y0, y);
                caja.x1 = Math.max(caja.x1, x + lado);
                caja.y1 = Math.max(caja.y1, y + lado);
            }
        }
        return caja;
    }

    /**
     * Dibuja la placa del tablero con volumen: sombra proyectada, filete neón,
     * bisel, metal oscuro cepillado y reflejo superior.
     * Cómo: traza la forma una vez y la reutiliza. Primero la rellena con una
     * sombra grande hacia abajo (la placa "flota" sobre el fondo). Después
     * traza el filete y el bisel con líneas anchas y recién ahí pinta el metal
     * encima: así de esas líneas solo se ve la mitad de afuera (el borde) y no
     * las uniones entre casilleros. Por último, recortando a la forma (clip),
     * suma líneas finas horizontales y un brillo. El color del metal es neutro
     * para que las fichas destaquen sobre ella.
     * @param {CanvasRenderingContext2D} ctx Contexto 2D donde se dibuja.
     * @returns {void}
     */
    dibujarPlaca(ctx) {
        const b = this.trazarForma(ctx, 12);

        // Filete neón con el color del estilo (asoma por fuera del bisel)
        ctx.save();
        ctx.lineJoin = "round";
        ctx.lineWidth = 20;
        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = this.colorBorde;
        ctx.shadowColor = this.colorBorde;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.restore();

        // Metal oscuro: degradado diagonal gunmetal (tapa la mitad interna de los trazos)
        const metal = ctx.createLinearGradient(b.x0, b.y0, b.x1, b.y1);
        metal.addColorStop(0, "#2b303b");
        metal.addColorStop(0.35, "#151922");
        metal.addColorStop(0.7, "#0c0f16");
        metal.addColorStop(1, "#1d222d");
        ctx.fillStyle = metal;
        ctx.fill();

    }

    /**
     * Cambia el color del filete de la placa (el del estilo de ficha elegido).
     * Cómo: guarda el color y descarta la capa cacheada para que se vuelva a
     * dibujar con el color nuevo en el próximo frame. No hace nada si es el mismo.
     * @param {string} color Color CSS del filete (por ejemplo "#ff3df0").
     * @returns {void}
     */
    setColorBorde(color) {
        if (color === this.colorBorde) return;
        this.colorBorde = color;
        this.capaEstatica = null;
    }

    /**
     * Dibuja la hendidura de cada casillero jugable.
     * @param {CanvasRenderingContext2D} ctx Contexto 2D donde se dibuja.
     * @returns {void}
     */
    dibujarHuecos(ctx) {
        const r = this.radioFicha * 1.05;
        for (let f = 0; f < Tablero.TAMANIO; f++) {
            for (let c = 0; c < Tablero.TAMANIO; c++) {
                if (!this.esJugable(f, c)) continue;
                const { x, y } = this.centroDe(f, c);
                this.dibujarHueco(ctx, x, y, r);
            }
        }
    }

    /**
     * Dibuja un orificio hundido en la placa.
     * Cómo: (a) un labio claro en el borde inferior, donde la luz pega en el
     * canto; (b) el fondo del agujero con degradado radial oscuro; (c) una
     * sombra interna: se recorta al círculo y se traza un anillo exterior
     * cuya sombra cae hacia adentro, oscureciendo el borde superior.
     * @param {CanvasRenderingContext2D} ctx Contexto 2D donde se dibuja.
     * @param {number} x Centro X del casillero.
     * @param {number} y Centro Y del casillero.
     * @param {number} r Radio del orificio.
     * @returns {void}
     */
    dibujarHueco(ctx, x, y, r) {
        ctx.save();
        // Fondo del agujero
        const cuerpo = ctx.createRadialGradient(x - r * 0.25, y - r * 0.3, r * 0.1, x, y, r);
        cuerpo.addColorStop(0, "rgba(0, 0, 0, 0.95)");
        cuerpo.addColorStop(0.85, "rgba(10, 12, 18, 0.95)");
        cuerpo.addColorStop(1, "rgba(0, 255, 170, 0.12)");
        ctx.fillStyle = cuerpo;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Oculta el tablero que trae dibujado la imagen de fondo en su centro, para
     * que no asome detrás de la placa del juego.
     * Cómo: pinta un círculo grande color fondo con degradado radial (opaco
     * en el centro y transparente en el borde), así se mezcla con el resto de
     * la imagen sin dejar un corte visible. Los marcos y textos de los
     * costados quedan intactos.
     * @param {CanvasRenderingContext2D} ctx Contexto 2D donde se dibuja.
     * @returns {void}
     */
    taparTableroDelFondo(ctx) {
        const cx = this.anchoCanvas / 2;
        const cy = this.altoCanvas / 2;
        const radio = 500;
        const parche = ctx.createRadialGradient(cx, cy, 0, cx, cy, radio);
        parche.addColorStop(0, "rgba(2, 3, 10, 1)");
        parche.addColorStop(0.88, "rgba(2, 3, 10, 1)");   // zona totalmente tapada
        parche.addColorStop(1, "rgba(2, 3, 10, 0)");      // borde difuso
        ctx.fillStyle = parche;
        ctx.fillRect(cx - radio, cy - radio, radio * 2, radio * 2);
    }

    /**
     * Pinta la imagen de fondo ajustada al canvas (object-fit: cover), tapa el
     * tablero que trae dibujado y le suma una viñeta oscura. Si la imagen
     * todavía no cargó, usa un color de espera.
     * @param {CanvasRenderingContext2D} ctx Contexto 2D del canvas.
     * @returns {void}
     */
    dibujarFondo(ctx) {
        const img = this.fondo;
        if (img && img.complete && img.naturalWidth > 0) {
            const escala = Math.max(this.anchoCanvas / img.naturalWidth, this.altoCanvas / img.naturalHeight);
            const w = img.naturalWidth * escala;
            const h = img.naturalHeight * escala;
            ctx.drawImage(img, (this.anchoCanvas - w) / 2, (this.altoCanvas - h) / 2, w, h);
        } else {
            ctx.fillStyle = "#05060f";
            ctx.fillRect(0, 0, this.anchoCanvas, this.altoCanvas);
        }
        this.taparTableroDelFondo(ctx);

    }
}
