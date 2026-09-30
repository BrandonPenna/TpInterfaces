/* ============================================================
   FORMULARIOS | Helpers compartidos por login.js y register.js
   Criterio común: el error de cada campo va en su <small> con la
   clase .has-error, y el resultado general en .form-message
   (en rojo con .form-message--error, en verde por defecto).
   ============================================================ */
const Formulario = {
    // Muestra (o limpia, con texto vacío) el error de un campo.
    marcarError(input, texto) {
        const campo = input.closest(".form-field");
        campo.classList.toggle("has-error", Boolean(texto));
        campo.querySelector("small").textContent = texto;
    },

    // Al escribir en un campo se le borra el error.
    limpiarAlEscribir(form) {
        form.querySelectorAll(".form-field input").forEach((input) => {
            input.addEventListener("input", () => Formulario.marcarError(input, ""));
        });
    },

    // Mensaje general del formulario. Sin texto, lo limpia.
    mostrarMensaje(mensaje, texto, esError = false) {
        mensaje.textContent = texto;
        mensaje.classList.toggle("form-message--error", esError);
    },

    // Regla de email común a login y registro (usa la validación nativa
    // del input type="email").
    emailValido(valor, input) {
        return input.checkValidity() ? "" : "Ingrese un correo válido";
    },

    // Valida todos los campos del formulario y marca sus errores.
    //   reglas:     { nombreDelCampo: (valor, input) => "error" o "" }
    //   textoVacio: { nombreDelCampo: "mensaje si está vacío" }
    // Devuelve true si no hubo errores.
    validarCampos(form, reglas, textoVacio) {
        let todoOk = true;
        form.querySelectorAll(".form-field input").forEach((input) => {
            const valor = input.value.trim();
            const regla = reglas[input.name];
            const error = !valor
                ? textoVacio[input.name] || "Este campo es obligatorio"
                : regla ? regla(valor, input) : "";
            Formulario.marcarError(input, error);
            if (error) todoOk = false;
        });
        return todoOk;
    },

    // Devuelve true si el captcha está marcado; si no, avisa en el mensaje.
    validarCaptcha(form, mensaje) {
        if (form.elements.captcha.checked) return true;
        Formulario.mostrarMensaje(mensaje, "Confirma que no eres un robot.", true);
        return false;
    },

    // Lleva el foco al primer campo con error.
    enfocarPrimerError(form) {
        form.querySelector(".has-error input")?.focus();
    },

    // Mensaje de éxito y redirección con una pausa para leerlo
    // (o para que termine una animación).
    exito(mensaje, texto, destino, espera = 900) {
        Formulario.mostrarMensaje(mensaje, texto);
        setTimeout(() => {
            window.location.href = destino;
        }, espera);
    }
};
