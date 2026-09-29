/* ============================================================
   FORMULARIOS | Helpers compartidos por login.js y register.js
   Criterio común: el error de cada campo va en su <small> con la
   clase .has-error, y el resultado general en .form-message.
   ============================================================ */
const Formulario = {
    COLOR_ERROR: "#cf2020",
    COLOR_EXITO: "#15751e",

    // Muestra (o limpia, con texto vacío) el error de un campo.
    setFieldError(input, text) {
        const field = input.closest(".form-field");
        field.classList.toggle("has-error", Boolean(text));
        field.querySelector("small").textContent = text;
    },

    // Al escribir en un campo se le borra el error.
    limpiarAlEscribir(form) {
        form.querySelectorAll(".form-field input").forEach((input) => {
            input.addEventListener("input", () => Formulario.setFieldError(input, ""));
        });
    },

    mostrarMensaje(message, texto, color) {
        message.textContent = texto;
        message.style.color = color;
    },

    // Devuelve true si el captcha está marcado; si no, avisa en el mensaje.
    validarCaptcha(form, message) {
        if (form.elements.captcha.checked) return true;
        Formulario.mostrarMensaje(message, "Confirma que no eres un robot.", Formulario.COLOR_ERROR);
        return false;
    },

    // Lleva el foco al primer campo con error.
    enfocarPrimerError(form) {
        form.querySelector(".has-error input")?.focus();
    },

    // Mensaje de éxito y redirección con una pequeña pausa para leerlo.
    exito(message, texto, destino) {
        Formulario.mostrarMensaje(message, texto, Formulario.COLOR_EXITO);
        setTimeout(() => {
            window.location.href = destino;
        }, 900);
    }
};
