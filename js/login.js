/* ============================================================
   LOGIN | Validación de pages/login.html + diálogo de recuperación
   Usa los helpers de js/form-utils.js.
   ============================================================ */
(function () {
    "use strict";

    const form = document.querySelector(".login-form");
    const message = form.querySelector(".form-message");
    const recoveryDialog = document.querySelector(".recovery-dialog");

    Formulario.limpiarAlEscribir(form);

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const { email, password } = form.elements;
        let isValid = true;

        Formulario.setFieldError(email, "");
        Formulario.setFieldError(password, "");
        message.textContent = "";

        if (!email.value.trim() || !email.checkValidity()) {
            Formulario.setFieldError(email, "Ingrese un correo válido");
            isValid = false;
        }

        if (!password.value) {
            Formulario.setFieldError(password, "Ingrese su contraseña");
            isValid = false;
        }

        if (!Formulario.validarCaptcha(form, message)) isValid = false;

        if (!isValid) {
            Formulario.enfocarPrimerError(form);
            return;
        }

        Formulario.exito(message, "Inicio de sesión correcto. Redirigiendo...", "../index.html");
    });

    /* ---------- RECUPERAR CONTRASEÑA ---------- */

    document.querySelector(".forgot-password").addEventListener("click", () => {
        recoveryDialog.showModal();
    });

    // Clic en el fondo oscuro (fuera del cuadro) cierra el diálogo.
    recoveryDialog.addEventListener("click", (event) => {
        if (event.target === recoveryDialog) recoveryDialog.close();
    });
})();
