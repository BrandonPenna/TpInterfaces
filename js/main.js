// Ruta base de templates resuelta desde este propio archivo (js/main.js),
// para que funcione desde la raíz (index.html) y desde subcarpetas (pages/).
const BASE_TEMPLATES = new URL('../templates/', document.currentScript.src).href;

// Función para cargar componentes reutilizables (Header y Footer)
function cargarTemplate(idContenedor, rutaArchivo) {
    fetch(rutaArchivo)
        .then(response => {
            if (!response.ok) throw new Error(`No se pudo cargar ${rutaArchivo}`);
            return response.text();
        })
        .then(data => {
            document.getElementById(idContenedor).innerHTML = data;
        })
        .catch(error => console.error('Error cargando template:', error));
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarTemplate('header-container', BASE_TEMPLATES + 'header.html');
    cargarTemplate('footer-container', BASE_TEMPLATES + 'fat-footer.html');
});

/* ============================================================
   PEG SOLITAIRE - CyberPunk | JavaScript vanilla
   Sin dependencias. Cada bloque es independiente:
   podés copiar/pegar sólo las funciones que necesites.
   ============================================================ */
(function () {
    "use strict";

    var AVATAR = "assets/6109e.png";
    var STAR_SMALL = "assets/6d78f.svg";

    /* ---------- 1. GALERÍA -> imagen principal ---------- */
    var heroImage = document.getElementById("hero-image");
    var galleryItems = document.querySelectorAll(".gallery-item");

    galleryItems.forEach(function (item) {
        item.addEventListener("click", function () {
            if (!heroImage) return;
            heroImage.src = item.dataset.hero;
            heroImage.alt = item.dataset.heroAlt || "";
        });
    });

    /* ---------- 2. BOTONES DE COMPARTIR ---------- */
    function share(url) {
        window.open(url, "_blank", "noopener,noreferrer");
    }

    document.querySelectorAll("[data-share]").forEach(function (button) {
        button.addEventListener("click", function () {
            share(button.dataset.share);
        });
    });

    var copyLink = document.getElementById("copy-link");
    if (copyLink) {
        copyLink.addEventListener("click", function () {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
            }
        });
    }

})();
