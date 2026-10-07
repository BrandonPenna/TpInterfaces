/* ============================================================
   COMENTARIOS | Página del juego (pages/game_solitare.html)
   Formulario estilo red social: el botón "Comentar" se habilita
   recién cuando hay texto, hay contador de caracteres, se puede
   cancelar, y al publicar el comentario aparece arriba de la lista
   con un aviso de confirmación. Todo es local (no hay servidor).
   ============================================================ */

(function () {
    "use strict";

    const MAX_CARACTERES = 300;
    const AVISAR_DESDE = 270; // el contador se pone amarillo cerca del límite
    const AUTOR = "Agustin";
    const ICONO_ESTRELLA = "../assets/games/6d78f.svg";
    const AVATAR = "../assets/games/6109e.png";

    const form = document.getElementById("comment-form");
    const lista = document.getElementById("comments-list");
    if (!form || !lista) return;

    const texto = document.getElementById("comment-text");
    const contador = document.getElementById("comment-counter");
    const btnEnviar = document.getElementById("comment-submit");
    const btnCancelar = document.getElementById("comment-cancel");
    const estado = document.getElementById("comment-status");
    const pista = document.getElementById("star-hint");
    const estrellas = Array.from(form.querySelectorAll(".star-picker button"));

    let calificacion = 0;
    let timerEstado = null;

    /* ---------- ESTRELLAS ---------- */

    // Pinta las primeras `n` estrellas; sirve para el valor elegido y para la vista previa al pasar el mouse.
    function pintarEstrellas(n) {
        estrellas.forEach((e, i) => e.classList.toggle("is-on", i < n));
    }

    function elegirCalificacion(valor) {
        // Tocar la misma estrella otra vez quita la calificación (control del usuario).
        calificacion = valor === calificacion ? 0 : valor;
        estrellas.forEach((e) => e.setAttribute("aria-checked", String(Number(e.dataset.value) === calificacion)));
        pintarEstrellas(calificacion);
        pista.textContent = calificacion ? `${calificacion} de 5` : "Opcional";
    }

    estrellas.forEach((e) => {
        const valor = Number(e.dataset.value);
        e.addEventListener("click", () => elegirCalificacion(valor));
        e.addEventListener("mouseenter", () => pintarEstrellas(valor));
        e.addEventListener("mouseleave", () => pintarEstrellas(calificacion));
    });

    /* ---------- TEXTO Y ESTADO DEL FORMULARIO ---------- */

    function actualizar() {
        const largo = texto.value.length;
        const hayTexto = texto.value.trim().length > 0;

        contador.textContent = `${largo}/${MAX_CARACTERES}`;
        contador.classList.toggle("is-near-limit", largo >= AVISAR_DESDE);
        btnEnviar.disabled = !hayTexto;
        // Mientras haya texto el formulario queda desplegado aunque se pierda el foco.
        form.classList.toggle("is-open", largo > 0);

        // El cuadro crece con lo escrito, como en YouTube/Instagram.
        texto.style.height = "auto";
        texto.style.height = texto.scrollHeight + "px";
    }

    function mostrarEstado(mensaje, esError) {
        estado.textContent = mensaje;
        estado.classList.toggle("is-error", Boolean(esError));
        clearTimeout(timerEstado);
        timerEstado = setTimeout(() => (estado.textContent = ""), 4000);
    }

    function limpiar() {
        form.reset();
        elegirCalificacion(0);
        actualizar();
    }

    texto.addEventListener("input", actualizar);

    btnCancelar.addEventListener("click", () => {
        limpiar();
        texto.blur();
        estado.textContent = "";
    });

    // Esc cancela, igual que en las redes sociales.
    form.addEventListener("keydown", (e) => {
        if (e.key === "Escape") btnCancelar.click();
    });

    /* ---------- PUBLICAR ---------- */

    function crearComentario(mensaje, puntos) {
        const card = document.createElement("article");
        card.className = "comment-card comment-card--new";

        const avatar = document.createElement("img");
        avatar.className = "avatar";
        avatar.src = AVATAR;
        avatar.alt = "";

        const copia = document.createElement("div");
        copia.className = "comment-copy";

        const meta = document.createElement("div");
        meta.className = "comment-meta";
        const autor = document.createElement("strong");
        autor.textContent = AUTOR;
        const cuando = document.createElement("span");
        cuando.textContent = "Ahora";
        meta.append(autor, cuando);

        // textContent evita que lo escrito se interprete como HTML.
        const parrafo = document.createElement("p");
        parrafo.textContent = mensaje;
        copia.append(meta, parrafo);

        card.append(avatar, copia);

        if (puntos) {
            const valor = document.createElement("div");
            valor.className = "comment-rating";
            const numero = document.createElement("strong");
            numero.textContent = puntos.toFixed(1);
            const icono = document.createElement("img");
            icono.src = ICONO_ESTRELLA;
            icono.alt = "estrella";
            valor.append(numero, icono);
            card.append(valor);
        }

        return card;
    }

    // Duración de la animación de la carta (coincide con mail-fly en game.css).
    const DURACION_ENVIO = 900;
    const sinAnimacion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let enviando = false;

    function publicar(mensaje, puntos) {
        lista.prepend(crearComentario(mensaje, puntos));
        limpiar();
        texto.blur();
        btnEnviar.classList.remove("is-sending");
        enviando = false;
        mostrarEstado("¡Comentario publicado!");
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (enviando) return;

        const mensaje = texto.value.trim();
        if (!mensaje) {
            mostrarEstado("Escribí algo antes de comentar.", true);
            return;
        }

        // Feedback: la carta sale volando y recién ahí aparece el comentario.
        enviando = true;
        const puntos = calificacion;
        if (sinAnimacion) {
            publicar(mensaje, puntos);
            return;
        }
        btnEnviar.classList.add("is-sending");
        setTimeout(() => publicar(mensaje, puntos), DURACION_ENVIO);
    });

    actualizar();
})();
