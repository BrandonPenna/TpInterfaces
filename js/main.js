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

    /* ---------- 3. SELECTOR DE CALIFICACIÓN (1 a 5) ---------- */
    var ratingPicker = document.getElementById("rating-picker");
    var rating = 5;

    function renderRating() {
        var mask = ratingPicker.querySelector("i");
        mask.style.width = rating * 20 + "%";
        ratingPicker.setAttribute(
            "aria-label",
            "Calificación actual: " + rating + " de 5. Cambiar calificación",
        );
    }

    if (ratingPicker) {
        ratingPicker.addEventListener("click", function () {
            rating = rating === 5 ? 1 : rating + 1;
            renderRating();
        });
    }

    /* ---------- 4. ENVÍO DE COMENTARIOS ---------- */
    function createCommentCard(comment) {
        var card = document.createElement("article");
        card.className = "comment-card";

        var avatar = document.createElement("img");
        avatar.className = "avatar";
        avatar.src = AVATAR;
        avatar.alt = "";
        card.appendChild(avatar);

        var copy = document.createElement("div");
        copy.className = "comment-copy";

        var meta = document.createElement("div");
        meta.className = "comment-meta";

        var name = document.createElement("strong");
        name.textContent = comment.name;

        var time = document.createElement("span");
        time.textContent = comment.time;

        meta.appendChild(name);
        meta.appendChild(time);

        var text = document.createElement("p");
        text.textContent = comment.text;

        copy.appendChild(meta);
        copy.appendChild(text);
        card.appendChild(copy);

        var score = document.createElement("div");
        score.className = "comment-rating";

        var scoreValue = document.createElement("strong");
        scoreValue.textContent = comment.rating;

        var star = document.createElement("img");
        star.src = STAR_SMALL;
        star.alt = "estrella";

        score.appendChild(scoreValue);
        score.appendChild(star);
        card.appendChild(score);

        return card;
    }

    var form = document.getElementById("comment-form");
    var textarea = document.getElementById("comment-text");
    var commentsList = document.getElementById("comments-list");

    if (form && textarea && commentsList) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();

            var text = textarea.value.trim();
            if (!text) return;

            var card = createCommentCard({
                name: "Agustin",
                time: "ahora",
                text: text,
                rating: rating + ".0",
            });

            var moreButton = commentsList.querySelector(".more-button");
            commentsList.insertBefore(card, moreButton);

            textarea.value = "";
        });
    }
})();
