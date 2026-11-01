/* ============================================================
   TABLERO | Lógica y dibujo del tablero de Peg Solitaire
   Grilla 7x7 en forma de cruz (33 casilleros jugables). Las cuatro
   esquinas de 2x2 están deshabilitadas (NULO). Al empezar, todos
   los casilleros tienen ficha menos el central.
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
        /** @type {?HTMLImageElement} Fondo con el que se armó la capa (para detectar cambios). */
        this.fondoCacheado = null;
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
     * Arma la matriz inicial: cruz de 33 casilleros llenos y el centro vacío.
     * Cómo: un casillero queda NULO si cae en una esquina de 2x2 (fila y columna
     * ambas en {0,1} o {5,6}); el resto se llena con FICHA y el (3,3) con VACIO.
     * @returns {void}
     */
    inicializar() {
        const n = Tablero.TAMANIO;
        const { NULO, VACIO, FICHA } = Tablero.ESTADOS;
        const fueraDeCruz = (i) => i < 2 || i > 4;

        this.matriz = [];
        for (let f = 0; f < n; f++) {
            const fila = [];
            for (let c = 0; c < n; c++) {
                fila.push(fueraDeCruz(f) && fueraDeCruz(c) ? NULO : FICHA);
            }
            this.matriz.push(fila);
        }
        this.matriz[3][3] = VACIO;
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
     * La capa se vuelve a armar si cambia la imagen de fondo.
     * @param {CanvasRenderingContext2D} ctx Contexto 2D del canvas.
     * @returns {void}
     */
    draw(ctx) {
        if (!this.capaEstatica || this.fondoCacheado !== this.fondo) this.construirCapaEstatica();
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
        this.fondoCacheado = this.fondo;
    }

    /**
     * Traza (sin rellenar) el contorno en cruz del tablero como un único path
     * con las esquinas redondeadas.
     * Cómo: recorre los 12 vértices de la cruz (brazos de 3 casilleros de
     * ancho; las líneas de la grilla que la delimitan son 0, 2, 5 y 7). Empieza
     * en el punto medio de la última arista y, en cada vértice, usa arcTo()
     * para curvar la esquina con el radio pedido (tanto las salientes como las
     * entrantes).
     * @param {CanvasRenderingContext2D} ctx Contexto sobre el que se traza el path.
     * @param {number} margen Píxeles que se agranda el contorno hacia afuera.
     * @param {number} [radio=30] Radio de las esquinas redondeadas, en píxeles.
     * @returns {{x0: number, y0: number, x1: number, y1: number}} Caja que contiene la cruz.
     */
    trazarCruz(ctx, margen, radio = 30) {
        const gx = (i) => this.origenX + i * this.celda;
        const gy = (i) => this.origenY + i * this.celda;
        const x = [gx(0) - margen, gx(2) - margen, gx(5) + margen, gx(7) + margen];
        const y = [gy(0) - margen, gy(2) - margen, gy(5) + margen, gy(7) + margen];
        const puntos = [
            [x[1], y[0]], [x[2], y[0]], [x[2], y[1]], [x[3], y[1]], [x[3], y[2]], [x[2], y[2]],
            [x[2], y[3]], [x[1], y[3]], [x[1], y[2]], [x[0], y[2]], [x[0], y[1]], [x[1], y[1]]
        ];

        const ultimo = puntos[puntos.length - 1];
        ctx.beginPath();
        ctx.moveTo((ultimo[0] + puntos[0][0]) / 2, (ultimo[1] + puntos[0][1]) / 2);
        puntos.forEach(([px, py], i) => {
            const [sx, sy] = puntos[(i + 1) % puntos.length];
            ctx.arcTo(px, py, sx, sy, radio);
        });
        ctx.closePath();
        return { x0: x[0], y0: y[0], x1: x[3], y1: y[3] };
    }

    /**
     * Dibuja la placa en cruz con volumen: sombra proyectada, metal oscuro
     * cepillado, reflejo superior y un bisel de luz/sombra.
     * Cómo: traza la cruz una vez y la reutiliza. Primero la rellena con una
     * sombra grande hacia abajo (la placa "flota" sobre el fondo), luego la
     * pinta con un degradado gunmetal y, recortando al contorno (clip), le
     * suma líneas finas horizontales y un brillo. Por último traza el borde
     * con un degradado claro arriba-izquierda y oscuro abajo-derecha. El color
     * es neutro (no cian) para que las fichas destaquen sobre ella.
     * @param {CanvasRenderingContext2D} ctx Contexto 2D donde se dibuja.
     * @returns {void}
     */
    dibujarPlaca(ctx) {
        const b = this.trazarCruz(ctx, 10);

        // 1) Sombra proyectada externa
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 18;
        ctx.fillStyle = "#151922";
        ctx.fill();
        ctx.restore();

        // 2) Metal oscuro: degradado diagonal gunmetal
        const metal = ctx.createLinearGradient(b.x0, b.y0, b.x1, b.y1);
        metal.addColorStop(0, "#2b303b");
        metal.addColorStop(0.35, "#151922");
        metal.addColorStop(0.7, "#0c0f16");
        metal.addColorStop(1, "#1d222d");
        ctx.fillStyle = metal;
        ctx.fill();

        // 3) Textura de metal cepillado + reflejo, recortados a la cruz
        ctx.save();
        ctx.clip();
        ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
        for (let yy = b.y0; yy < b.y1; yy += 4) ctx.fillRect(b.x0, yy, b.x1 - b.x0, 1);
        const mitad = (b.y1 - b.y0) / 2;
        const reflejo = ctx.createLinearGradient(0, b.y0, 0, b.y0 + mitad);
        reflejo.addColorStop(0, "rgba(255, 255, 255, 0.07)");
        reflejo.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = reflejo;
        ctx.fillRect(b.x0, b.y0, b.x1 - b.x0, mitad);
        ctx.restore();

        // 4) Bisel: luz arriba-izquierda, sombra abajo-derecha
        const bisel = ctx.createLinearGradient(b.x0, b.y0, b.x1, b.y1);
        bisel.addColorStop(0, "rgba(200, 215, 240, 0.55)");
        bisel.addColorStop(0.5, "rgba(90, 100, 120, 0.25)");
        bisel.addColorStop(1, "rgba(0, 0, 0, 0.7)");
        ctx.lineJoin = "round";
        ctx.lineWidth = 8;
        ctx.strokeStyle = bisel;
        ctx.stroke();

        // 5) Filete interior fino con el color del estilo (mismo path achicado un poco)
        ctx.save();
        ctx.translate(this.anchoCanvas / 2, this.altoCanvas / 2);
        ctx.scale(0.985, 0.985);
        ctx.translate(-this.anchoCanvas / 2, -this.altoCanvas / 2);
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = this.colorBorde;
        ctx.shadowColor = this.colorBorde;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.restore();
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

        // a) Labio inferior iluminado
        const labio = ctx.createLinearGradient(0, y - r, 0, y + r);
        labio.addColorStop(0.5, "rgba(255, 255, 255, 0)");
        labio.addColorStop(1, "rgba(255, 255, 255, 0.2)");
        ctx.lineWidth = 4;
        ctx.strokeStyle = labio;
        ctx.beginPath();
        ctx.arc(x, y, r + 1, 0, Math.PI * 2);
        ctx.stroke();

        // b) Fondo del agujero (luz desplazada arriba-izquierda)
        const cuerpo = ctx.createRadialGradient(x - r * 0.25, y - r * 0.3, r * 0.1, x, y, r);
        cuerpo.addColorStop(0, "rgba(0, 0, 0, 0.95)");
        cuerpo.addColorStop(0.85, "rgba(10, 12, 18, 0.95)");
        cuerpo.addColorStop(1, "rgba(0, 255, 170, 0.12)");
        ctx.fillStyle = cuerpo;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        // c) Sombra interna: el anillo queda fuera del clip, solo se ve su sombra
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 5;
        ctx.lineWidth = 14;
        ctx.strokeStyle = "#000";
        ctx.beginPath();
        ctx.arc(x, y, r + 7, 0, Math.PI * 2);
        ctx.stroke();

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

        // Viñeta: centro casi limpio y bordes oscuros para dirigir la mirada al tablero
        const viñeta = ctx.createRadialGradient(
            this.anchoCanvas / 2, this.altoCanvas / 2, this.altoCanvas * 0.35,
            this.anchoCanvas / 2, this.altoCanvas / 2, this.anchoCanvas * 0.62
        );
        viñeta.addColorStop(0, "rgba(0, 0, 10, 0.15)");
        viñeta.addColorStop(1, "rgba(0, 0, 10, 0.6)");
        ctx.fillStyle = viñeta;
        ctx.fillRect(0, 0, this.anchoCanvas, this.altoCanvas);
    }
}
