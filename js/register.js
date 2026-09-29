/* ============================================================
   REGISTRO | Validación de pages/register.html
   Usa los helpers de js/form-utils.js (mismo criterio que login).
   ============================================================ */
(function () {
    "use strict";

    const form = document.querySelector(".register-form");
    if (!form) return;
    const message = form.querySelector(".form-message");

    /* ---------- 1. REGLAS ---------- */

    // Mensaje cuando el campo está vacío.
    const TEXTO_VACIO = {
        nombre: "Ingrese su nombre",
        apellido: "Ingrese su apellido",
        nickname: "Ingrese su nickname",
        edad: "Ingrese su edad",
        email: "Ingrese un correo válido",
        password: "Ingrese su contraseña",
        password2: "Repita su contraseña"
    };

    const SOLO_LETRAS = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/;

    function nombreValido(valor) {
        return valor.length >= 2 && SOLO_LETRAS.test(valor) ? "" : "Ingrese un nombre válido";
    }

    function passwordValida(valor) {
        return valor.length >= 6 ? "" : "La contraseña debe tener al menos 6 caracteres";
    }

    // Cada regla recibe el valor (sin espacios en los bordes) y devuelve
    // el texto del error, o "" si el campo está bien.
    const REGLAS = {
        nombre: nombreValido,
        apellido: nombreValido,
        nickname: (valor) =>
            valor.length >= 3 && !/\s/.test(valor) ? "" : "Ingrese un nickname sin espacios",
        edad: (valor) => {
            const edad = Number(valor);
            return Number.isInteger(edad) && edad >= 13 && edad <= 99 ? "" : "Ingrese una edad entre 13 y 99";
        },
        email: (valor, input) => (input.checkValidity() ? "" : "Ingrese un correo válido"),
        password: passwordValida,
        password2: passwordValida
    };

    function errorDeCampo(input) {
        const valor = input.value.trim();
        if (!valor) return TEXTO_VACIO[input.name] || "Este campo es obligatorio";
        return REGLAS[input.name] ? REGLAS[input.name](valor, input) : "";
    }

    /* ---------- 2. EVENTOS ---------- */

    Formulario.limpiarAlEscribir(form);

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        message.textContent = "";
        let isValid = true;

        form.querySelectorAll(".form-field input").forEach((input) => {
            const error = errorDeCampo(input);
            Formulario.setFieldError(input, error);
            if (error) isValid = false;
        });

        // Las contraseñas se comparan sólo si las dos están completas.
        const { password, password2 } = form.elements;
        if (password.value.trim() && password2.value.trim() && password.value !== password2.value) {
            Formulario.setFieldError(password2, "Las contraseñas no coinciden");
            isValid = false;
        }

        if (!Formulario.validarCaptcha(form, message)) isValid = false;

        if (!isValid) {
            Formulario.enfocarPrimerError(form);
            return;
        }

        mostrarAnimacionExito();
        Formulario.exito(message, "¡Cuenta creada con éxito! Redirigiendo...", "login.html", DURACION_EXITO);
    });

    /* ---------- 3. ANIMACIÓN DE ÉXITO ---------- */

    // Tiempo total de la animación de register.css + un momento para leerla.
    const DURACION_EXITO = 2600;

    // Brillo del formulario + tarjeta con círculo y tilde que se dibujan.
    function mostrarAnimacionExito() {
        form.classList.add("is-success");
        form.querySelectorAll("button, input").forEach((el) => { el.disabled = true; });
        form.insertAdjacentHTML("beforeend",
            '<div class="register-success" aria-hidden="true">' +
                '<svg class="register-success__check" viewBox="0 0 52 52">' +
                    '<circle cx="26" cy="26" r="24" />' +
                    '<path d="M14 27l8 8 16-17" />' +
                '</svg>' +
                '<p>¡Cuenta creada!</p>' +
                '<small>Te llevamos al inicio de sesión...</small>' +
            '</div>'
        );
    }
})();
