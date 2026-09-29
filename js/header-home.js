/* ============================================================
   HEADER DE LOGIN / REGISTRO | JavaScript vanilla
   Efecto de pulsado del logo y "volver arriba" al hacer clic.
   El header lo inyecta main.js, por eso se conecta recién cuando
   `templatesListos` se resuelve.
   ============================================================ */
(function () {
    "use strict";

    function conectarLogo() {
        const logo = document.querySelector(".site-logo");
        if (!logo) return;

        /* ---------- 1. EFECTO DE PULSADO ---------- */
        logo.addEventListener("pointerdown", () => logo.classList.add("is-pressed"));
        document.addEventListener("pointerup", () => logo.classList.remove("is-pressed"));

        /* ---------- 2. VOLVER ARRIBA ---------- */
        logo.addEventListener("click", (event) => {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    templatesListos.then(conectarLogo);
})();
