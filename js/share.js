/* ============================================================
   COMPARTIR | Página del juego (pages/game_solitare.html)
   El botón de compartir despliega o esconde las redes. Se cierra
   al tocar el botón de nuevo, al tocar afuera o con Esc.
   ============================================================ */

(function () {
    "use strict";

    const boton = document.querySelector(".share-toggle");
    const opciones = document.getElementById("share-options");
    if (!boton || !opciones) return;

    function abrir(abierto) {
        boton.setAttribute("aria-expanded", String(abierto));
    }

    boton.addEventListener("click", () => {
        abrir(boton.getAttribute("aria-expanded") !== "true");
    });

    document.addEventListener("click", (e) => {
        if (!boton.contains(e.target) && !opciones.contains(e.target)) abrir(false);
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") abrir(false);
    });
})();
