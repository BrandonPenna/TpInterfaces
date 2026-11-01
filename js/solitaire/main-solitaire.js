/* ============================================================
   MAIN-SOLITAIRE | Arranque del Peg Solitaire
   Espera a que el DOM esté listo, toma los elementos de la página
   (pages/game_solitare.html) y crea el Juego.
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const canvas = document.getElementById("solitaire-canvas");
    if (!canvas) return; // esta página no tiene el juego

    const juego = new Juego({
        canvas,
        elFichas: document.getElementById("solitaire-fichas"),
        elTiempo: document.getElementById("solitaire-tiempo"),
        selSkin: document.getElementById("solitaire-skin"),
        selLimite: document.getElementById("solitaire-limite"),
        btnReiniciar: document.getElementById("solitaire-reiniciar")
    });

    juego.iniciar();
});
