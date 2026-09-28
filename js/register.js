/* ============================================================
   REGISTRO | JavaScript vanilla
   Validación del formulario de pages/register.html.
   Mismo criterio que js/login.js: los errores de cada campo van
   en su <small> con la clase .has-error, y el resultado general en
   el .form-message.
   ============================================================ */

const form = document.querySelector(".register-form");
const message = document.querySelector(".form-message");

if (form) {
  function setFieldError(input, text) {
    const field = input.closest(".form-field");
    field.classList.toggle("has-error", Boolean(text));
    field.querySelector("small").textContent = text;
  }

  const campos = form.querySelectorAll(".form-field input");

  campos.forEach((input) => {
    // Al escribir se limpia el error del campo.
    input.addEventListener("input", () => setFieldError(input, ""));
  });

  // Valida un campo y devuelve true si está bien.
  function validarCampo(input) {
    const valor = input.value.trim();

    if (input.name === "captcha") return input.checked;

    if (!valor) {
      setFieldError(input, "Este campo es obligatorio");
      return false;
    }

    if (input.name === "nombre" || input.name === "apellido") {
      if (valor.length < 2 || !/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/.test(valor)) {
        setFieldError(input, "Ingrese un nombre válido");
        return false;
      }
    }

    if (input.name === "nickname") {
      if (/\s/.test(valor) || valor.length < 3) {
        setFieldError(input, "Ingrese un nickname sin espacios");
        return false;
      }
    }

    if (input.name === "edad") {
      const edad = Number(valor);
      if (!Number.isInteger(edad) || edad < 13 || edad > 99) {
        setFieldError(input, "Ingrese una edad entre 13 y 99");
        return false;
      }
    }

    if (input.name === "email" && !input.checkValidity()) {
      setFieldError(input, "Ingrese un correo válido");
      return false;
    }

    if ((input.name === "password" || input.name === "password2") && valor.length < 6) {
      setFieldError(input, "La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    setFieldError(input, "");
    return true;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    message.textContent = "";

    const email = form.elements.email;
    const password = form.elements.password;
    const password2 = form.elements.password2;
    const captcha = form.querySelector("input[name='captcha']");

    const textos = {
      nombre: "Ingrese su nombre",
      apellido: "Ingrese su apellido",
      nickname: "Ingrese su nickname",
      edad: "Ingrese su edad",
      email: "Ingrese un correo válido",
      password: "Ingrese su contraseña",
      password2: "Repita su contraseña",
    };

    // Sólo se valida lo que el usuario ya escribió: si está vacío
    // (y no es obligatorio completar) el mensaje es el del placeholder.
    const esNuevo = (input) => input.value.trim() !== "";

    let isValid = true;
    let primerError = null;

    campos.forEach((input) => {
      if (input.type === "checkbox") return;

      if (!input.value.trim()) {
        setFieldError(input, textos[input.name] || "Este campo es obligatorio");
        isValid = false;
        if (!primerError) primerError = input;
        return;
      }

      if (!validarCampo(input)) {
        isValid = false;
        if (!primerError) primerError = input;
      }
    });

    if (esNuevo(password) && esNuevo(password2) && password.value !== password2.value) {
      setFieldError(password2, "Las contraseñas no coinciden");
      isValid = false;
      if (!primerError) primerError = password2;
    }

    if (!captcha.checked) {
      message.textContent = "Confirma que no eres un robot.";
      message.style.color = "#cf2020";
      isValid = false;
    }

    if (!isValid) {
      form.querySelector(".has-error input")?.focus() || primerError?.focus();
      return;
    }

    message.textContent = "¡Cuenta creada con éxito! Redirigiendo...";
    message.style.color = "#15751e";

    setTimeout(() => {
      window.location.href = "login.html";
    }, 900);
  });

  // Si el usuario tacha la contraseña repetida, el error se va solo.
  password2.addEventListener("input", () => {
    if (password.value && password2.value === password.value) {
      setFieldError(password2, "");
    }
  });
}
