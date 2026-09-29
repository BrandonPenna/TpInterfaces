/* ============================================================
   PÁGINA DEL JUEGO | Botones de compartir (pages/game_solitare.html)
   ============================================================ */
(function () {
    "use strict";

    // WhatsApp, X y correo: cada botón trae su URL en data-share.
    document.querySelectorAll("[data-share]").forEach(function (button) {
        button.addEventListener("click", function () {
            window.open(button.dataset.share, "_blank", "noopener,noreferrer");
        });
    });

    // Copiar el enlace de la página al portapapeles.
    const copyLink = document.getElementById("copy-link");
    if (copyLink) {
        copyLink.addEventListener("click", function () {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
            }
        });
    }
})();
