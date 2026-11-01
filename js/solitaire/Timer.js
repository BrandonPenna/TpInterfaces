/* ============================================================
   TIMER | Cuenta regresiva del Peg Solitaire
   Usa performance.now() (reloj monotónico) en lugar de contar
   "ticks" de setInterval, por lo que no acumula desfasaje aunque
   la pestaña se ralentice. Se actualiza con requestAnimationFrame.
   ============================================================ */

/**
 * Temporizador de cuenta regresiva con pausa, reinicio y callbacks.
 */
class Timer {
    /**
     * Crea el temporizador (queda detenido hasta llamar a iniciar()).
     * @param {number} segundos Duración total de la cuenta regresiva, en segundos.
     * @param {function(number): void} [onTick] Se llama en cada frame con los
     *        segundos restantes (puede ser decimal).
     * @param {function(): void} [onFin] Se llama una única vez cuando llega a cero.
     */
    constructor(segundos, onTick = () => {}, onFin = () => {}) {
        /** @type {number} Duración configurada en milisegundos. */
        this.duracionMs = segundos * 1000;
        /** @type {number} Milisegundos que quedan (se actualiza en cada tick). */
        this.restanteMs = this.duracionMs;
        /** @type {function(number): void} */
        this.onTick = onTick;
        /** @type {function(): void} */
        this.onFin = onFin;
        /** @type {boolean} true mientras la cuenta está corriendo. */
        this.corriendo = false;
        /** @type {number} Instante (performance.now) en que terminará la cuenta. */
        this.finMs = 0;
        /** @type {number|null} Id del requestAnimationFrame pendiente. */
        this.rafId = null;
        // Enlazamos el bucle una sola vez para pasarlo a requestAnimationFrame
        this.tick = this.tick.bind(this);
    }

    /**
     * Inicia la cuenta, o la reanuda si estaba pausada.
     * Cómo: calcula el instante absoluto de finalización (ahora + lo que
     * resta) y agenda el primer frame. No hace nada si ya corre o si ya
     * llegó a cero.
     * @returns {void}
     */
    iniciar() {
        if (this.corriendo || this.restanteMs <= 0) return;
        this.corriendo = true;
        this.finMs = performance.now() + this.restanteMs;
        this.rafId = requestAnimationFrame(this.tick);
    }

    /**
     * Pausa la cuenta conservando el tiempo restante.
     * Cómo: cancela el frame pendiente y fija restanteMs con la diferencia
     * entre el instante final y el actual, para poder reanudar con iniciar().
     * @returns {void}
     */
    pausar() {
        if (!this.corriendo) return;
        this.restanteMs = Math.max(0, this.finMs - performance.now());
        this.detenerLoop();
    }

    /**
     * Reinicia la cuenta, deja el timer detenido y avisa el valor inicial.
     * @param {number} [segundos] Nueva duración; si se omite se conserva la actual.
     * @returns {void}
     */
    reiniciar(segundos) {
        this.detenerLoop();
        if (segundos !== undefined) this.duracionMs = segundos * 1000;
        this.restanteMs = this.duracionMs;
        this.onTick(this.getRestante());
    }

    /**
     * Cuerpo del bucle: recalcula lo que falta y notifica.
     * Cómo: resta el reloj actual al instante final. Si llega a cero fija el
     * restante en 0, detiene el bucle y dispara onFin; si no, reagenda el frame.
     * @param {number} ahora Marca de tiempo que entrega requestAnimationFrame.
     * @returns {void}
     */
    tick(ahora) {
        if (!this.corriendo) return;
        this.restanteMs = Math.max(0, this.finMs - ahora);
        this.onTick(this.getRestante());

        if (this.restanteMs <= 0) {
            this.detenerLoop();
            this.onFin();
            return;
        }
        this.rafId = requestAnimationFrame(this.tick);
    }

    /**
     * Cancela el frame pendiente y marca el timer como no corriendo.
     * @returns {void}
     */
    detenerLoop() {
        this.corriendo = false;
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    /**
     * Devuelve los segundos restantes.
     * Si está corriendo recalcula contra el reloj para ser exacto.
     * @returns {number} Segundos restantes (decimal, nunca negativo).
     */
    getRestante() {
        const ms = this.corriendo ? Math.max(0, this.finMs - performance.now()) : this.restanteMs;
        return ms / 1000;
    }

    /**
     * Da formato mm:ss al tiempo restante, redondeando hacia arriba para que
     * "00:00" aparezca recién cuando el tiempo se agotó de verdad.
     * @returns {string} Texto "mm:ss".
     */
    formato() {
        const total = Math.ceil(this.getRestante());
        const mm = String(Math.floor(total / 60)).padStart(2, "0");
        const ss = String(total % 60).padStart(2, "0");
        return `${mm}:${ss}`;
    }
}
