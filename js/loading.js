/* ============================================================
   LOADING SIMULADO | JavaScript vanilla
   Overlay que se muestra al cargar index.html:
     - barra recta que se va llenando durante 5 segundos
     - porcentaje de avance de 0 a 100
     - animación de carga (3 puntitos saltando)
   Los estilos viven en css/loading.css.
   ============================================================ */
(function () {
    "use strict";

    const DURACION = 5000;      // 5 segundos de carga simulada
    const ESPERA_FINAL = 450;   // pausa mostrando el 100% antes de salir

    /* ---------- 1. MARKUP ---------- */

    const overlay = document.createElement("div");
    overlay.className = "loader";
    overlay.id = "loader";
    overlay.setAttribute("role", "progressbar");
    overlay.setAttribute("aria-label", "Cargando el catálogo de juegos");
    overlay.setAttribute("aria-valuemin", "0");
    overlay.setAttribute("aria-valuemax", "100");
    overlay.setAttribute("aria-valuenow", "0");
    overlay.innerHTML = [
        '<div class="loader__percent"><b data-loader-numero>0</b><span>%</span></div>',
        '<div class="loader__spinner" aria-hidden="true"><i></i><i></i><i></i></div>',
        '<div class="loader__barra" aria-hidden="true"><div class="loader__barra-relleno" data-loader-barra></div></div>',
        '<p class="loader__texto" data-loader-estado>Cargando juegos...</p>'
    ].join("");

    // El script va en el <head>, así que body puede todavía no existir.
    (document.body || document.documentElement).appendChild(overlay);

    const numero = overlay.querySelector("[data-loader-numero]");
    const barra = overlay.querySelector("[data-loader-barra]");
    const estado = overlay.querySelector("[data-loader-estado]");

    // Bloquea el scroll de la página mientras dura la carga.
    document.documentElement.classList.add("is-cargando");

    /* ---------- 2. PROGRESO ---------- */

    // Curva de avance: acelera al principio y frena cerca del final, así el
    // 100% aparece sólo al final (si fuera lineal se vería "apurado").
    function suavizar(t) {
        return t * t * (3 - 2 * t);
    }

    function pintar(porcentaje) {
        const valor = Math.max(0, Math.min(100, porcentaje));
        numero.textContent = Math.floor(valor);
        barra.style.width = valor + "%";
        overlay.setAttribute("aria-valuenow", Math.floor(valor));
    }

    function ocultar() {
        overlay.classList.add("is-hidden");
        document.documentElement.classList.remove("is-cargando");
        setTimeout(function () {
            overlay.remove();
        }, 500);
    }

    function animar(ahora) {
        const transcurrido = ahora - inicio;
        const avance = transcurrido / DURACION;

        if (avance >= 1) {
            pintar(100);
            estado.textContent = "¡Listo!";
            setTimeout(ocultar, ESPERA_FINAL);
            return;
        }

        pintar(suavizar(avance) * 100);
        requestAnimationFrame(animar);
    }

    const inicio = performance.now();
    requestAnimationFrame(animar);

})();
