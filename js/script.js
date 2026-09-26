// Las tarjetas de los carruseles ya vienen en el HTML (index.html),
// asi que las imagenes se ven aunque este script no cargue.
// Acá solo agregamos la interactividad: flechas del carrusel y aviso del carrito.

document.querySelectorAll(".carousel").forEach((carousel) => {
  const track = carousel.querySelector("[data-track]");
  if (!track) return;

  const isFeatured = carousel.classList.contains("carousel--featured");
  let offset = window.innerWidth <= 900 ? 0 : isFeatured ? -26 : -164;

  const update = () => {
    track.style.setProperty("--track-offset", `${offset}px`);
  };

  carousel.querySelectorAll("[data-direction]").forEach((button) => {
    button.addEventListener("click", () => {
      const direction = Number(button.dataset.direction);
      const step = isFeatured ? 681 : 323;
      const minimum = Math.min(0, carousel.clientWidth - track.scrollWidth);
      offset = Math.max(minimum, Math.min(0, offset - direction * step));
      update();
    });
  });

  update();
});

const notice = document.querySelector(".cart-notice");
let noticeTimer;

document.addEventListener("click", (event) => {
  const button = event.target.closest(".game-card__add");
  if (!button || !notice) return;

  notice.textContent = `${button.dataset.game} añadido al carrito`;
  notice.classList.add("is-visible");
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => notice.classList.remove("is-visible"), 2200);
});
