/* ============================================================
   HEADER HOME - CyberHub | JavaScript vanilla
   Sin dependencias.

   El partial templates/header-home.html lo inyecta main.js con
   fetch + innerHTML, así que el <header class="site-header">
   puede todavía no existir cuando corre este archivo. Por eso
   se espera a que aparezca con un MutationObserver y se
   desconecta apenas queda conectado (no queda observando).
   ============================================================ */
(function () {
    "use strict";

    /* ---------- 1. CONEXIÓN DEL LOGO ---------- */
    // Devuelve true cuando el .site-logo ya está en el DOM y conectado,
    // para poder cortar la espera.
    function conectarLogo() {
        const logo = document.querySelector(".site-logo");

        if (!logo) return false;
        if (logo.dataset.logoConectado === "true") return true;

        logo.dataset.logoConectado = "true";

        /* ---------- 2. EFECTO DE PULSADO ---------- */

        logo.addEventListener("pointerdown", () => {
            logo.classList.add("is-pressed");
        });

        document.addEventListener("pointerup", () => {
            logo.classList.remove("is-pressed");
        });

        /* ---------- 3. VOLVER ARRIBA ---------- */

        logo.addEventListener("click", (event) => {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        return true;
    }

    /* ---------- 4. ESPERA A LA INYECCIÓN ---------- */

    function iniciar() {
        if (conectarLogo()) return;

        const observer = new MutationObserver(() => {
            if (!conectarLogo()) return;
            observer.disconnect();
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }

})();
