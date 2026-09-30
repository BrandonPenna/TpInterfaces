/* ============================================================
   LOGIN | Validación de pages/login.html + diálogo de recuperación
   Usa los helpers de js/form-utils.js.
   ============================================================ */
(function () {
    "use strict";

    const form = document.querySelector(".login-form");
    const mensaje = form.querySelector(".form-message");
    const dialogoRecuperar = document.querySelector(".recovery-dialog");

    /* ---------- 1. REGLAS ---------- */

    const TEXTO_VACIO = {
        email: "Ingrese un correo válido",
        password: "Ingrese su contraseña"
    };

    // La contraseña sólo tiene que estar completa (lo cubre TEXTO_VACIO).
    const REGLAS = {
        email: Formulario.emailValido
    };

    /* ---------- 2. EVENTOS ---------- */

    Formulario.limpiarAlEscribir(form);

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        Formulario.mostrarMensaje(mensaje, "");

        // Se evalúan las dos validaciones para mostrar todos los errores juntos.
        const camposOk = Formulario.validarCampos(form, REGLAS, TEXTO_VACIO);
        const captchaOk = Formulario.validarCaptcha(form, mensaje);

        if (!camposOk || !captchaOk) {
            Formulario.enfocarPrimerError(form);
            return;
        }

        Formulario.exito(mensaje, "Inicio de sesión correcto. Redirigiendo...", "../index.html");
    });

    /* ---------- 3. RECUPERAR CONTRASEÑA ---------- */

    document.querySelector(".forgot-password").addEventListener("click", () => {
        dialogoRecuperar.showModal();
    });

    // Clic en el fondo oscuro (fuera del cuadro) cierra el diálogo.
    dialogoRecuperar.addEventListener("click", (event) => {
        if (event.target === dialogoRecuperar) dialogoRecuperar.close();
    });
})();
