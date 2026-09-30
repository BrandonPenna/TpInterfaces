/* ============================================================
   REGISTRO | Validación de pages/register.html
   Usa los helpers de js/form-utils.js (mismo criterio que login).
   ============================================================ */
(function () {
    "use strict";

    const form = document.querySelector(".register-form");
    const mensaje = form.querySelector(".form-message");

    // Tiempo total de la animación de register.css + un momento para leerla.
    const DURACION_EXITO = 2600;

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
        email: Formulario.emailValido,
        password: passwordValida,
        password2: passwordValida
    };

    // Las contraseñas se comparan sólo si las dos están completas.
    function passwordsCoinciden() {
        const { password, password2 } = form.elements;
        if (!password.value.trim() || !password2.value.trim()) return true;
        if (password.value === password2.value) return true;
        Formulario.marcarError(password2, "Las contraseñas no coinciden");
        return false;
    }

    /* ---------- 2. EVENTOS ---------- */

    Formulario.limpiarAlEscribir(form);

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        Formulario.mostrarMensaje(mensaje, "");

        // Se evalúan todas las validaciones para mostrar todos los errores juntos.
        const camposOk = Formulario.validarCampos(form, REGLAS, TEXTO_VACIO);
        const coinciden = passwordsCoinciden();
        const captchaOk = Formulario.validarCaptcha(form, mensaje);

        if (!camposOk || !coinciden || !captchaOk) {
            Formulario.enfocarPrimerError(form);
            return;
        }

        mostrarAnimacionExito();
        Formulario.exito(mensaje, "¡Cuenta creada con éxito! Redirigiendo...", "login.html", DURACION_EXITO);
    });

    /* ---------- 3. ANIMACIÓN DE ÉXITO ---------- */

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
