const asset = (file) => `assets/${file}`;

const featuredGames = [
  { image: "13ec0.png", name: "Juego recomendado" },
  { image: "6c5c2.png", name: "Juego recomendado" },
  { image: "5b637.png", name: "Juego recomendado" },
];

const sections = [
  {
    title: "Juegos premium:",
    games: [
      ["5aafc.png", "Battle Arena"],
      ["83881.png", "Cubes 2048"],
      ["3714a.png", "War Knights"],
      ["b6e01.png", "Patrol Racers"],
      ["343e4.png", "StickMan Clash"],
      ["d0458.png", "One Shot Duel"],
      ["89d6b.png", "SoulsStone"],
    ],
  },
  {
    title: "Juegos Estrategia:",
    games: [
      ["de84c.png", "Table Tennis"],
      ["5b998.png", "8 Ball Pool"],
      ["d261e.png", "Warfare"],
      ["4e216.png", "Geometry Dash"],
      ["5938f.png", "Chess"],
      ["e6db5.png", "WorldGuessr"],
      ["d3ca5.png", "SkillWarz"],
    ],
  },
  {
    title: "Juegos deportes:",
    games: [
      ["faa25.png", "Unmatched Ego 2"],
      ["de84c.png", "Table Tennis"],
      ["4ce92.png", "Smash Karts"],
      ["5b998.png", "8 Ball Pool"],
      ["3edc2.png", "Stickman Kombat 2D"],
      ["57533.png", "GO-Kart"],
      ["dea9b.png", "Island Madness"],
    ],
  },
  {
    title: "Juegos de Accion:",
    games: [
      ["258f3.png", "Hazmob"],
      ["9c7a9.png", "League of Legends"],
      ["5deac.png", "PlayGround"],
      ["f0f77.png", "FiresOne"],
      ["9771a.png", "Dead Land"],
      ["63c66.png", "300 Heroes"],
      ["c9db6.png", "BodyCamera"],
    ],
  },
  {
    title: "Juegos de carrera:",
    games: [
      ["793ab.png", "Xtreme Ciry"],
      ["70e1f.png", "Bici Run"],
      ["687af.png", "Traffic Rider"],
      ["ac0af.png", "Real Car"],
      ["32473.png", "Cars"],
      ["337b3.png", "Rocket Goal"],
      ["57533.png", "GO-Kart"],
    ],
  },
  {
    title: "Juegos de Aventura:",
    games: [
      ["e78d0.png", "FortZone"],
      ["814ed.png", "Bloxd.io"],
      ["1168b.png", "Final Drop"],
      ["5b998.png", "8 Ball Pool"],
      ["9771a.png", "Dead Land"],
      ["f6606.png", "Dig Out Of Prision"],
      ["337b3.png", "Rocket Goal"],
    ],
  },
  {
    title: "Juegos simulacion:",
    games: [
      ["4b150.png", "Heave Truck Driver"],
      ["88268.png", "Veck.io"],
      ["faa25.png", "Unmatched Ego 2"],
      ["f6606.png", "Dig Out Of Prision"],
      ["5deac.png", "Hazmob"],
      ["e0193.png", "City Wars"],
      ["63c66.png", "300 Heroes"],
    ],
  },
];

const featuredTrack = document.querySelector('[data-carousel="featured"] [data-track]');

featuredGames.forEach((game) => {
  const card = document.createElement("article");
  card.className = "featured-card";
  card.innerHTML = `
    <img src="${asset(game.image)}" alt="" />
    <div class="featured-card__label">${game.name}</div>
  `;
  featuredTrack.append(card);
});

const sectionsRoot = document.querySelector("#game-sections");

sections.forEach((section, sectionIndex) => {
  const sectionElement = document.createElement("section");
  const headingId = `section-${sectionIndex}`;
  sectionElement.className = "game-section";
  sectionElement.setAttribute("aria-labelledby", headingId);
  sectionElement.innerHTML = `
    <h2 id="${headingId}">${section.title}</h2>
    <div class="carousel" data-carousel="${sectionIndex}">
      <div class="carousel__track" data-track></div>
      <button class="carousel__arrow carousel__arrow--previous" type="button" data-direction="-1" aria-label="Ver juegos anteriores">
        <img src="${asset("26419.svg")}" alt="" />
      </button>
      <button class="carousel__arrow carousel__arrow--next" type="button" data-direction="1" aria-label="Ver más juegos">
        <img src="${asset("26419.svg")}" alt="" />
      </button>
    </div>
  `;

  const track = sectionElement.querySelector("[data-track]");
  section.games.forEach(([image, name]) => {
    const card = document.createElement("article");
    card.className = "game-card";
    card.innerHTML = `
      <img class="game-card__cover" src="${asset(image)}" alt="" />
      <div class="game-card__title">${name}</div>
      ${
        sectionIndex === 0
          ? `<div class="game-card__actions">
              <div class="game-card__price">
                <img src="${asset("cba01.svg")}" alt="" />
                <span>3.99$</span>
              </div>
              <button class="game-card__add" type="button" data-game="${name}">Add to car</button>
            </div>`
          : ""
      }
    `;
    track.append(card);
  });

  sectionsRoot.append(sectionElement);
});

document.querySelectorAll(".carousel").forEach((carousel) => {
  const track = carousel.querySelector("[data-track]");
  let offset = window.innerWidth <= 900 ? 0 : carousel.classList.contains("carousel--featured") ? -26 : -164;

  const update = () => {
    track.style.setProperty("--track-offset", `${offset}px`);
  };

  carousel.querySelectorAll("[data-direction]").forEach((button) => {
    button.addEventListener("click", () => {
      const direction = Number(button.dataset.direction);
      const step = carousel.classList.contains("carousel--featured") ? 681 : 323;
      const minimum = Math.min(0, carousel.clientWidth - track.scrollWidth);
      offset = Math.max(minimum, Math.min(0, offset - direction * step));
      update();
    });
  });

  update();
});

let noticeTimer;
const notice = document.querySelector(".cart-notice");

document.addEventListener("click", (event) => {
  const button = event.target.closest(".game-card__add");
  if (!button) return;

  notice.textContent = `${button.dataset.game} añadido al carrito`;
  notice.classList.add("is-visible");
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => notice.classList.remove("is-visible"), 2200);
});
