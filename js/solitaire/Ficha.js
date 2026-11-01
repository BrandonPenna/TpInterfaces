/* ============================================================
   FICHA | Clavija del Peg Solitaire
   Se dibuja siempre con una imagen (SVG/PNG con transparencia) y
   nunca con colores planos. Tiene tres estados: apoyada en su
   casillero, arrastrada por el mouse o volviendo animada a su lugar.
   ============================================================ */

/**
 * Ficha del tablero (posición en píxeles + casillero lógico).
 */
class Ficha {
    /** Estados posibles de una ficha. */
    static ESTADOS = Object.freeze({
        EN_TABLERO: "en-tablero",
        ARRASTRADA: "arrastrada",
        RETORNANDO: "retornando"
    });

    /**
     * Crea una ficha apoyada en el centro de su casillero.
     * @param {number} fila Fila lógica del casillero (0-6).
     * @param {number} col Columna lógica del casillero (0-6).
     * @param {number} x Coordenada X del centro, en píxeles del canvas.
     * @param {number} y Coordenada Y del centro, en píxeles del canvas.
     * @param {HTMLImageElement} imagen Imagen ya precargada de la ficha.
     * @param {number} radio Radio de la ficha en píxeles (define tamaño y zona de click).
     */
    constructor(fila, col, x, y, imagen, radio) {
        /** @type {number} */
        this.fila = fila;
        /** @type {number} */
        this.col = col;
        /** @type {number} Centro actual (cambia al arrastrar o animar). */
        this.x = x;
        /** @type {number} */
        this.y = y;
        /** @type {HTMLImageElement} */
        this.imagen = imagen;
        /** @type {number} */
        this.radio = radio;
        /** @type {string} Uno de Ficha.ESTADOS. */
        this.estado = Ficha.ESTADOS.EN_TABLERO;
        /** @type {number} Distancia entre el click y el centro, para no "saltar" al agarrar. */
        this.offsetX = 0;
        /** @type {number} */
        this.offsetY = 0;
        /** @type {{x0:number,y0:number,x1:number,y1:number,inicio:number,duracion:number}|null} */
        this.animacion = null;
    }

    /**
     * Cambia el aspecto de la ficha (selector de skins).
     * @param {HTMLImageElement} imagen Nueva imagen precargada.
     * @returns {void}
     */
    setImagen(imagen) {
        this.imagen = imagen;
    }

    /**
     * Indica si un punto cae dentro de la ficha.
     * Cómo: compara la distancia al centro con el radio usando distancias al
     * cuadrado (evita calcular la raíz).
     * @param {number} px Coordenada X del punto (espacio del canvas).
     * @param {number} py Coordenada Y del punto (espacio del canvas).
     * @returns {boolean} true si el punto está sobre la ficha.
     */
    contiene(px, py) {
        const dx = px - this.x;
        const dy = py - this.y;
        return dx * dx + dy * dy <= this.radio * this.radio;
    }

    /**
     * Empieza a arrastrar la ficha.
     * Cómo: guarda la diferencia entre el punto de click y el centro para que
     * al mover el mouse la ficha mantenga el mismo "agarre".
     * @param {number} px X del mouse al hacer click.
     * @param {number} py Y del mouse al hacer click.
     * @returns {void}
     */
    comenzarArrastre(px, py) {
        this.animacion = null;
        this.estado = Ficha.ESTADOS.ARRASTRADA;
        this.offsetX = this.x - px;
        this.offsetY = this.y - py;
    }

    /**
     * Mueve la ficha siguiendo al mouse (solo si está siendo arrastrada).
     * @param {number} px X actual del mouse.
     * @param {number} py Y actual del mouse.
     * @returns {void}
     */
    arrastrarA(px, py) {
        if (this.estado !== Ficha.ESTADOS.ARRASTRADA) return;
        this.x = px + this.offsetX;
        this.y = py + this.offsetY;
    }

    /**
     * Termina el arrastre y devuelve la ficha a "en tablero".
     * La posición final la decide quien la llama (soltar válido o animarRetorno).
     * @returns {void}
     */
    soltar() {
        this.estado = Ficha.ESTADOS.EN_TABLERO;
    }

    /**
     * Anima la ficha desde donde esté hasta un punto destino.
     * Cómo: guarda origen, destino y hora de inicio; cada frame actualizar()
     * calcula el progreso 0-1 y lo suaviza con easeOutCubic.
     * @param {number} destX X del centro destino.
     * @param {number} destY Y del centro destino.
     * @param {number} [duracionMs=250] Duración de la animación en milisegundos.
     * @returns {void}
     */
    animarRetorno(destX, destY, duracionMs = 250) {
        this.estado = Ficha.ESTADOS.RETORNANDO;
        this.animacion = {
            x0: this.x,
            y0: this.y,
            x1: destX,
            y1: destY,
            inicio: performance.now(),
            duracion: duracionMs
        };
    }

    /**
     * Avanza la animación de retorno (se llama una vez por frame).
     * Cómo: interpola linealmente entre origen y destino con el progreso
     * suavizado; al llegar fija el destino exacto y vuelve a "en tablero".
     * @param {number} ahora Marca de tiempo actual (performance.now / rAF).
     * @returns {void}
     */
    actualizar(ahora) {
        const a = this.animacion;
        if (!a) return;

        const t = Math.min(1, (ahora - a.inicio) / a.duracion);
        const suave = 1 - Math.pow(1 - t, 3); // easeOutCubic
        this.x = a.x0 + (a.x1 - a.x0) * suave;
        this.y = a.y0 + (a.y1 - a.y0) * suave;

        if (t >= 1) {
            this.animacion = null;
            this.estado = Ficha.ESTADOS.EN_TABLERO;
        }
    }

    /**
     * Dibuja la ficha con su imagen centrada en (x, y).
     * Siempre lleva una sombra proyectada hacia abajo; mientras se arrastra se
     * agranda un 10 % y la sombra se alarga para dar sensación de "levantada".
     * Se dibuja solo con drawImage. Si la imagen aún no cargó no dibuja nada.
     * @param {CanvasRenderingContext2D} ctx Contexto 2D del canvas.
     * @returns {void}
     */
    draw(ctx) {
        if (!this.imagen || !this.imagen.complete) return;

        const levantada = this.estado === Ficha.ESTADOS.ARRASTRADA;
        const lado = this.radio * 2 * (levantada ? 1.1 : 1);

        ctx.save();
        // Sombra proyectada hacia abajo (efecto 3D): corta y marcada en reposo,
        // más larga y difusa cuando la ficha está levantada
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = levantada ? 26 : 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = levantada ? 18 : 8;
        ctx.drawImage(this.imagen, this.x - lado / 2, this.y - lado / 2, lado, lado);
        ctx.restore();
    }
}
