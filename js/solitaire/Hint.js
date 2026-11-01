/* ============================================================
   HINT | Indicador animado de casillero destino válido
   Se dibuja en cada frame del requestAnimationFrame. Combina:
   - un halo que pulsa (escala + alpha calculados con Math.sin(t)), y
   - una flecha que flota arriba y abajo señalando el casillero.
   Todo con degradados y trazos, sin sprites ni spritesheets.
   ============================================================ */

/**
 * Hint animado sobre un casillero donde se puede soltar la ficha.
 */
class Hint {
    /**
     * Crea un hint para un casillero destino.
     * @param {number} x Coordenada X del centro del casillero (píxeles del canvas).
     * @param {number} y Coordenada Y del centro del casillero (píxeles del canvas).
     * @param {number} radio Radio base del halo, en píxeles.
     * @param {number} [fase=0] Desfase en radianes; permite que varios hints no
     *        pulsen todos sincronizados.
     */
    constructor(x, y, radio, fase = 0) {
        /** @type {number} */
        this.x = x;
        /** @type {number} */
        this.y = y;
        /** @type {number} */
        this.radio = radio;
        /** @type {number} */
        this.fase = fase;
        /** @type {number} Escala actual del halo (1 = tamaño base). */
        this.escala = 1;
        /** @type {number} Opacidad actual del halo (0-1). */
        this.alpha = 1;
        /** @type {number} Desplazamiento vertical actual de la flecha, en píxeles. */
        this.flotacion = 0;
        /** @type {number} Instante (ms) en que nació, para hacer un fade-in al aparecer. */
        this.nacimiento = performance.now();
    }

    /**
     * Recalcula escala, alpha y flotación de la flecha para un instante dado.
     * Cómo: usa Math.sin(t) con t en radianes (tiempo / periodo + fase). El seno
     * oscila entre -1 y 1, y se remapea a rangos útiles:
     * escala 1 ± 0.18, alpha 0.65 ± 0.3 y flotación ± 9 px.
     * @param {number} tiempoMs Tiempo actual en milisegundos (requestAnimationFrame).
     * @returns {void}
     */
    actualizar(tiempoMs) {
        const t = tiempoMs / 260 + this.fase;
        const onda = Math.sin(t);

        this.escala = 1 + 0.18 * onda;
        this.alpha = 0.65 + 0.3 * onda;
        this.flotacion = 9 * Math.sin(t * 0.9);
    }

    /**
     * Dibuja el hint completo (halo pulsante + flecha flotante).
     * Cómo: primero actualiza el estado animado; luego pinta el halo como un
     * degradado radial escalado (el brillo viene de shadowBlur) y por último la
     * flecha, un chevron trazado con path que sube y baja con la flotación.
     * Aplica un fade-in de 200 ms desde que se creó.
     * @param {CanvasRenderingContext2D} ctx Contexto 2D del canvas.
     * @param {number} tiempoMs Tiempo actual en milisegundos.
     * @returns {void}
     */
    draw(ctx, tiempoMs) {
        this.actualizar(tiempoMs);

        const aparicion = Math.max(0, Math.min(1, (tiempoMs - this.nacimiento) / 200));
        const r = this.radio * this.escala;

        ctx.save();
        ctx.globalAlpha = this.alpha * aparicion;

        // --- Halo: degradado radial con brillo neón ---
        const halo = ctx.createRadialGradient(this.x, this.y, r * 0.15, this.x, this.y, r);
        halo.addColorStop(0, "rgba(120, 255, 235, 0.55)");
        halo.addColorStop(0.7, "rgba(0, 229, 255, 0.25)");
        halo.addColorStop(1, "rgba(0, 229, 255, 0)");
        ctx.shadowColor = "#00e5ff";
        ctx.shadowBlur = 22;
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
        ctx.fill();

        // --- Anillo fino que acompaña el pulso ---
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(160, 255, 245, 0.9)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, r * 0.82, 0, Math.PI * 2);
        ctx.stroke();

        // --- Flecha flotante sobre el casillero, apuntando hacia abajo ---
        ctx.globalAlpha = aparicion;
        this.dibujarFlecha(ctx, this.x, this.y - this.radio * 1.15 + this.flotacion);

        ctx.restore();
    }

    /**
     * Traza una flecha (chevron doble) apuntando hacia abajo.
     * Cómo: arma un path con la punta en (cx, cy) y dos alas hacia arriba;
     * se rellena con degradado vertical y se le da un contorno oscuro para que
     * se lea sobre cualquier fondo.
     * @param {CanvasRenderingContext2D} ctx Contexto 2D del canvas.
     * @param {number} cx X de la punta de la flecha.
     * @param {number} cy Y de la punta de la flecha.
     * @returns {void}
     */
    dibujarFlecha(ctx, cx, cy) {
        const ancho = this.radio * 0.5;
        const alto = this.radio * 0.55;

        const grad = ctx.createLinearGradient(0, cy - alto, 0, cy);
        grad.addColorStop(0, "#d6fffa");
        grad.addColorStop(1, "#00e5ff");

        ctx.shadowColor = "#00e5ff";
        ctx.shadowBlur = 14;
        ctx.fillStyle = grad;
        ctx.strokeStyle = "rgba(0, 20, 30, 0.85)";
        ctx.lineWidth = 2.5;
        ctx.lineJoin = "round";

        ctx.beginPath();
        ctx.moveTo(cx, cy);                       // punta
        ctx.lineTo(cx - ancho, cy - alto * 0.8);  // ala izquierda
        ctx.lineTo(cx - ancho * 0.35, cy - alto * 0.8);
        ctx.lineTo(cx - ancho * 0.35, cy - alto * 1.5); // mango
        ctx.lineTo(cx + ancho * 0.35, cy - alto * 1.5);
        ctx.lineTo(cx + ancho * 0.35, cy - alto * 0.8);
        ctx.lineTo(cx + ancho, cy - alto * 0.8);  // ala derecha
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}
