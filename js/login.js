const form = document.querySelector(".login-form");
const message = document.querySelector(".form-message");
const recoveryDialog = document.querySelector(".recovery-dialog");

function setFieldError(input, text) {
  const field = input.closest(".form-field");
  field.classList.toggle("has-error", Boolean(text));
  field.querySelector("small").textContent = text;
}

form.querySelectorAll(".form-field input").forEach((input) => {
  input.addEventListener("input", () => setFieldError(input, ""));
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = form.elements.email;
  const password = form.elements.password;
  let isValid = true;

  setFieldError(email, "");
  setFieldError(password, "");
  message.textContent = "";

  if (!email.value.trim() || !email.checkValidity()) {
    setFieldError(email, "Ingrese un correo válido");
    isValid = false;
  }

  if (!password.value) {
    setFieldError(password, "Ingrese su contraseña");
    isValid = false;
  }

  if (!form.elements.captcha.checked) {
    message.textContent = "Confirma que no eres un robot.";
    message.style.color = "#cf2020";
    isValid = false;
  }

  if (!isValid) {
    form.querySelector(".has-error input")?.focus();
    return;
  }

  message.textContent = "Inicio de sesión correcto. Redirigiendo...";
  message.style.color = "#15751e";

  setTimeout(() => {
    window.location.href = "../index.html";
  }, 900);
});

document.querySelector(".forgot-password").addEventListener("click", () => {
  recoveryDialog.showModal();
});

recoveryDialog.addEventListener("click", (event) => {
  if (event.target === recoveryDialog) recoveryDialog.close();
});
