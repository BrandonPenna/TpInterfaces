/* ============================================================
   BLOQUE 1: CONSTANTES, DOM Y ESTADO DEL JUEGO
   ============================================================ */

// Dimensiones lógicas del escenario y límites verticales
const ANCHO_ESCENARIO = 960;
const ALTO_ESCENARIO  = 540;
const TECHO           = 60;
const PISO            = 504; // Altura exacta de la baranda inferior de 9.png (sobresale ~36px desde 540)

// Física del jugador y velocidad del mundo (en píxeles por segundo)
const GRAVEDAD        = 1350;
const IMPULSO         = 460;
const VELOCIDAD_BASE  = 210;
const FACTOR_TURBO    = 1.65;

// Configuración de las tuberías (obstáculos)
const ANCHO_TUBO      = 68;
const HUECO_INICIAL   = 185; // Hueco vertical amplio al empezar
const HUECO_MIN       = 140; // Hueco vertical mínimo cuando avanza el tiempo

// Factores de velocidad para las 6 capas de Parallax (la última va a 1.0 como los tubos)
const FACTORES_PARALLAX = [0.05, 0.02, 0.15, 0.35, 0.65, 1.0];

// Referencias a los elementos del DOM
const escenarioEl     = document.getElementById('flappy-escenario');
const tubosEl         = document.getElementById('flappy-tubos');
const itemsEl         = document.getElementById('flappy-items');
const jugadorEl       = document.getElementById('flappy-jugador');
const avisoEl         = document.getElementById('flappy-aviso');
const overlayEl       = document.getElementById('flappy-overlay');
const overlayTituloEl = document.getElementById('flappy-overlay-titulo');
const overlaySubEl    = document.getElementById('flappy-overlay-sub');
const btnJugar        = document.getElementById('flappy-jugar');
const btnReiniciar    = document.getElementById('flappy-reiniciar');

// Referencias al HUD (Vidas, Puntaje, Mejor Puntaje, Estado)
const hudVidasEl      = document.getElementById('flappy-vidas');
const hudPuntosEl     = document.getElementById('flappy-puntos');
const hudRecordEl     = document.getElementById('flappy-record');
const hudEstadoEl     = document.getElementById('flappy-estado-texto');
const hudEstadoCaja   = hudEstadoEl.parentElement;

// Arreglo con las 6 capas de parallax y su posición X acumulada
const capas = Array.from(document.querySelectorAll('.flappy__capa')).map(el => ({
  el,
  x: 0
}));

// Entrada del usuario (el evento solo anota, el loop decide)
const entrada = { impulso: false };

// Estado general de la partida
const juego = {
  estado: 'menu',       // 'menu' | 'jugando' | 'fin'
  vidas: 3,
  puntos: 0,
  record: 0,
  tiempo: 0,            // Segundos jugados (achica el hueco de los tubos)
  turbo: 0,             // Segundos restantes de modo turbo
  distanciaTubo: 0      // Píxeles que faltan para generar el próximo tubo
};

// Estado del jugador (Dron Cyberpunk de 64x64px)
const pajaro = {
  x: 140,
  y: 220,
  vy: 0,
  w: 64,
  h: 64,
  invulnerable: 0,      // Segundos restantes de invulnerabilidad tras un golpe
  // Hitbox ajustada al cuerpo central del dron (32x24px) para evitar choques injustos
  hitbox() {
    return {
      x: this.x + 16,
      y: this.y + 20,
      w: 32,
      h: 24
    };
  }
};

// Arreglos dinámicos de tuberías e ítems activos en pantalla
let tubos = [];
let items = [];

/* ============================================================
   BLOQUE 2: UTILIDADES, COLISIONES Y HUD
   ============================================================ */

/**
 * Devuelve un número aleatorio entre min y max.
 */
function azar(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Limita un valor numérico dentro del rango [min, max].
 */
function limitar(valor, min, max) {
  return Math.max(min, Math.min(max, valor));
}

/**
 * Comprueba si dos rectángulos (hitboxes) se superponen (AABB collision).
 */
function choca(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}

/**
 * Muestra un mensaje flotante en la parte superior del escenario (-1 VIDA, +1 VIDA, TURBO).
 */
let timerAviso = null;
function mostrarAviso(texto, color = '#00f0ff') {
  avisoEl.textContent = texto;
  avisoEl.style.color = color;
  avisoEl.style.border = `1px solid ${color}`;
  avisoEl.style.backgroundColor = 'rgba(12, 8, 28, 0.88)';
  avisoEl.style.boxShadow = `0 0 14px ${color}`;

  avisoEl.classList.remove('is-visible');
  void avisoEl.offsetWidth;
  avisoEl.classList.add('is-visible');

  if (timerAviso) clearTimeout(timerAviso);
  timerAviso = setTimeout(() => {
    avisoEl.classList.remove('is-visible');
  }, 850);
}

/**
 * Actualiza los textos de la barra superior (Vidas, Puntaje, Mejor y Estado).
 */
function actualizarHUD() {
  const llenos = '❤️'.repeat(Math.max(0, juego.vidas));
  const vacios = '🖤'.repeat(Math.max(0, 3 - juego.vidas));
  hudVidasEl.textContent = llenos + vacios;

  hudPuntosEl.textContent = juego.puntos;
  hudRecordEl.textContent = juego.record;

  if (juego.turbo > 0) {
    hudEstadoEl.textContent = `⚡ TURBO (${juego.turbo.toFixed(1)}s)`;
    hudEstadoCaja.classList.add('is-turbo');
  } else {
    hudEstadoEl.textContent = 'Normal';
    hudEstadoCaja.classList.remove('is-turbo');
  }
}

/* ============================================================
   BLOQUE 3: GENERACIÓN DE TUBERÍAS E ÍTEMS (SPRITESHEETS)
   ============================================================ */

/**
 * Efectos de los 2 elementos animados con spritesheet (Puntos 4 y 6).
 * Ninguno termina el juego y cada uno produce un efecto distinto.
 */
const EFECTOS = {
  vida() {
    if (juego.vidas < 3) {
      juego.vidas++;
      mostrarAviso('+1 VIDA ❤️', '#ff2bd6');
    } else {
      juego.puntos += 5;
      mostrarAviso('+5 PUNTOS ✨', '#00f0ff');
    }
    actualizarHUD();
  },
  enemigo() {
    juego.turbo = 3; // 3 segundos de velocidad turbo
    jugadorEl.classList.add('en-turbo');
    mostrarAviso('¡TURBO 3s! ⚡', '#ff9900');
    actualizarHUD();
  }
};

/**
 * Crea un elemento animado (Corazón de vida o Dron enemigo) ubicado en el espacio libre
 * ENTRE el tubo recién creado y el siguiente, para que NUNCA quede adentro de una tubería.
 */
function crearItemEnPasillo(xItem, yCentroSugerido) {
  const tipo = Math.random() < 0.5 ? 'vida' : 'enemigo';
  const tam  = tipo === 'vida' ? 48 : 56;
  const y    = limitar(yCentroSugerido - tam / 2 + azar(-45, 45), TECHO + 20, PISO - tam - 20);

  const el = document.createElement('div');
  el.className = `flappy__item flappy__item--${tipo}`;
  el.style.transform = `translate(${xItem}px, ${y}px)`;
  itemsEl.appendChild(el);

  items.push({
    tipo,
    x: xItem,
    y,
    w: tam,
    h: tam,
    vy: tipo === 'enemigo' ? azar(-50, 50) : 0,
    tomado: false,
    el,
    caja() {
      return { x: this.x + 8, y: this.y + 8, w: this.w - 16, h: this.h - 16 };
    }
  });
}

/**
 * Crea un nuevo par de tuberías (arriba y abajo) en el borde derecho (x = 960).
 * Cumple Punto 5a (distancia horizontal variable), 5b (hueco se achica) y 5c (altura variable).
 */
function crearTubo() {
  // 5b: El hueco vertical se achica a medida que avanza el tiempo
  const reduccion = juego.tiempo * 2.0;
  const hueco = limitar(HUECO_INICIAL - reduccion, HUECO_MIN, HUECO_INICIAL);

  // 5c: El centro del hueco varía en altura entre TECHO y PISO
  const centro = azar(TECHO + hueco / 2, PISO - hueco / 2);

  const altoArriba = Math.round(Math.max(24, centro - hueco / 2));
  const topAbajo   = Math.round(centro + hueco / 2);
  const altoAbajo  = Math.round(Math.max(24, ALTO_ESCENARIO - topAbajo));

  // Creamos los divs en el DOM y los posicionamos en x = 960 de inmediato (evita parpadeo en x = 0)
  const parEl = document.createElement('div');
  parEl.className = 'flappy__par-tubos';
  parEl.style.transform = `translateX(${ANCHO_ESCENARIO}px)`;

  const arribaEl = document.createElement('div');
  arribaEl.className = 'flappy__tubo flappy__tubo--arriba';
  arribaEl.style.height = `${altoArriba}px`;

  const abajoEl = document.createElement('div');
  abajoEl.className = 'flappy__tubo flappy__tubo--abajo';
  abajoEl.style.top = `${topAbajo}px`;
  abajoEl.style.height = `${altoAbajo}px`;

  parEl.appendChild(arribaEl);
  parEl.appendChild(abajoEl);
  tubosEl.appendChild(parEl);

  tubos.push({
    x: ANCHO_ESCENARIO,
    w: ANCHO_TUBO,
    centro,
    hueco,
    altoArriba,
    topAbajo,
    contado: false,
    el: parEl,
    // Hitbox del tubo superior (con 4px de margen interno para que sea justa)
    arriba() {
      return { x: this.x + 4, y: 0, w: this.w - 8, h: this.altoArriba };
    },
    // Hitbox del tubo inferior
    abajo() {
      return { x: this.x + 4, y: this.topAbajo, w: this.w - 8, h: ALTO_ESCENARIO - this.topAbajo };
    }
  });

  // 5a: Distancia horizontal al azar hasta la próxima tubería (entre 260px y 390px)
  const distanciaSiguiente = azar(260, 390);
  juego.distanciaTubo = distanciaSiguiente;

  // Con 28% de probabilidad generamos un ítem (Corazón o Dron) justo en el medio del pasillo
  // entre este tubo y el próximo, así jamás se superpone con un tubo.
  if (Math.random() < 0.28) {
    const xMedioPasillo = ANCHO_ESCENARIO + ANCHO_TUBO + (distanciaSiguiente - ANCHO_TUBO) / 2;
    crearItemEnPasillo(xMedioPasillo, centro);
  }
}

/* ============================================================
   BLOQUE 4: ACCIONES DEL JUGADOR, ACTUALIZAR(dt) Y DIBUJAR()
   ============================================================ */

/**
 * Aplica el impulso vertical hacia arriba y dispara la animación CSS .impulsando
 */
let timerImpulso = null;
function impulsarJugador() {
  pajaro.vy = -IMPULSO;

  jugadorEl.classList.remove('impulsando');
  void jugadorEl.offsetWidth;
  jugadorEl.classList.add('impulsando');

  if (timerImpulso) clearTimeout(timerImpulso);
  timerImpulso = setTimeout(() => {
    jugadorEl.classList.remove('impulsando');
  }, 250);
}

/**
 * Resta 1 vida al chocar con una tubería o el piso.
 * Si quedan vidas, activa invulnerabilidad y animación .golpeado.
 * Si llega a 0 vidas, dispara la animación .explotando y termina la partida.
 */
function recibirGolpe(motivo = 'tubo') {
  if (pajaro.invulnerable > 0 || juego.estado !== 'jugando') return;

  juego.vidas--;
  actualizarHUD();

  if (juego.vidas > 0) {
    pajaro.invulnerable = 1.4; // 1.4s de invulnerabilidad para salir cómodo del obstáculo
    if (motivo === 'piso') {
      pajaro.vy = -IMPULSO * 0.75; // Si tocó el piso, lo impulsa hacia arriba
    } else {
      pajaro.vy = 0; // Si chocó contra un tubo, frena la caída sin empujarlo contra el tubo de arriba
    }
    jugadorEl.classList.add('golpeado');
    mostrarAviso(`-1 VIDA (Quedan ${juego.vidas})`, '#ff0055');
  } else {
    jugadorEl.classList.remove('golpeado', 'impulsando', 'en-turbo');
    jugadorEl.classList.add('explotando');
    mostrarAviso('¡NAVE DESTRUIDA!', '#ff0055');
    terminarJuego();
  }
}

/**
 * Actualiza toda la física, timers, generación, colisiones y limpieza en cada frame.
 */
function actualizar(dt) {
  juego.tiempo += dt;

  // 1. Control del tiempo de Turbo
  if (juego.turbo > 0) {
    juego.turbo = Math.max(0, juego.turbo - dt);
    if (juego.turbo === 0) {
      jugadorEl.classList.remove('en-turbo');
    }
    actualizarHUD();
  }

  // 2. Control del tiempo de Invulnerabilidad tras golpe
  if (pajaro.invulnerable > 0) {
    pajaro.invulnerable = Math.max(0, pajaro.invulnerable - dt);
    if (pajaro.invulnerable === 0) {
      jugadorEl.classList.remove('golpeado');
    }
  }

  // Velocidad horizontal actual del mundo (aumenta si está activo el Turbo)
  const velocidad = VELOCIDAD_BASE * (juego.turbo > 0 ? FACTOR_TURBO : 1);
  const avance    = velocidad * dt;

  // 3. Mover las 6 capas de Parallax de acuerdo a la velocidad del jugador
  capas.forEach((c, i) => {
    if (i !== 1) {
      c.x = (c.x + avance * FACTORES_PARALLAX[i]) % ANCHO_ESCENARIO;
    }
  });

  // 4. Procesar entrada y física del jugador (Gravedad e Impulso)
  if (entrada.impulso) {
    impulsarJugador();
    entrada.impulso = false;
  }

  pajaro.vy += GRAVEDAD * dt;
  pajaro.y  += pajaro.vy * dt;

  // Evitar que se escape por arriba del escenario
  if (pajaro.y < 0) {
    pajaro.y  = 0;
    pajaro.vy = 0;
  }

  const cajaJugador = pajaro.hitbox();

  // Si la hitbox del jugador toca el piso inferior, recibe golpe y rebota
  if (cajaJugador.y + cajaJugador.h >= PISO) {
    pajaro.y = PISO - 44;
    recibirGolpe('piso');
  }

  // 5. Generar y mover Tuberías
  juego.distanciaTubo -= avance;
  if (juego.distanciaTubo <= 0) {
    crearTubo();
  }

  for (let i = tubos.length - 1; i >= 0; i--) {
    const t = tubos[i];
    t.x -= avance;

    // Sumar +1 punto cuando el jugador supera la tubería
    if (!t.contado && t.x + t.w < pajaro.x) {
      t.contado = true;
      juego.puntos += 1;
      actualizarHUD();
    }

    // Chequear colisión con el tubo de arriba o el de abajo
    if (choca(cajaJugador, t.arriba()) || choca(cajaJugador, t.abajo())) {
      recibirGolpe('tubo');
    }

    // Limpieza: si salió de la pantalla por la izquierda, borrar del DOM y del arreglo
    if (t.x + t.w < -20) {
      t.el.remove();
      tubos.splice(i, 1);
    }
  }

  // 6. Mover Ítems (Corazón de vida y Dron enemigo)
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    item.x -= avance;

    if (item.vy !== 0) {
      item.y += item.vy * dt;
      if (item.y < TECHO || item.y + item.h > PISO - 15) {
        item.vy *= -1;
      }
    }

    // Colisión con el jugador
    if (!item.tomado && choca(cajaJugador, item.caja())) {
      item.tomado = true;
      EFECTOS[item.tipo]();
      item.el.classList.add('tomado');
    }

    // Limpieza: si salió por la izquierda, borrar del DOM y del arreglo
    if (item.x + item.w < -20) {
      item.el.remove();
      items.splice(i, 1);
    }
  }
}

/**
 * Refleja el estado de JS en el DOM utilizando únicamente transform y backgroundPositionX.
 */
function dibujar() {
  // 1. Parallax del escenario
  for (let i = 0; i < capas.length; i++) {
    if (i !== 1) {
      capas[i].el.style.backgroundPositionX = `${-capas[i].x}px`;
    }
  }

  // 2. Jugador (traslación + rotación según velocidad vertical)
  const ang = limitar(pajaro.vy / 12, -25, 65);
  jugadorEl.style.transform = `translate(${pajaro.x}px, ${pajaro.y}px) rotate(${ang}deg)`;

  // 3. Tuberías
  for (const t of tubos) {
    t.el.style.transform = `translateX(${t.x}px)`;
  }

  // 4. Ítems
  for (const item of items) {
    item.el.style.transform = `translate(${item.x}px, ${item.y}px)`;
  }
}

/* ============================================================
   BLOQUE 5: ESTADOS, GAME LOOP, EVENTOS Y PRECARGA
   ============================================================ */

/**
 * Elimina todos los tubos e ítems del DOM y vacía sus arreglos.
 */
function limpiarEscenario() {
  for (const t of tubos) t.el.remove();
  for (const item of items) item.el.remove();
  tubos = [];
  items = [];
}

/**
 * Inicia o reinicia una nueva partida limpia.
 */
function empezar() {
  limpiarEscenario();

  juego.estado        = 'jugando';
  juego.vidas         = 3;
  juego.puntos        = 0;
  juego.tiempo        = 0;
  juego.turbo         = 0;
  juego.distanciaTubo = 220; // Primer tubo da margen cómodo al empezar

  pajaro.y            = 220;
  pajaro.vy           = 0;
  pajaro.invulnerable = 0;

  jugadorEl.classList.remove('golpeado', 'explotando', 'en-turbo', 'impulsando');
  overlayEl.classList.add('is-hidden');

  actualizarHUD();
  impulsarJugador();
}

/**
 * Vuelve a empezar desde el botón Reiniciar o tras perder.
 */
function reiniciar() {
  empezar();
}

/**
 * Pasa al estado 'fin' cuando el jugador pierde sus 3 vidas.
 */
function terminarJuego() {
  juego.estado = 'fin';
  if (juego.puntos > juego.record) {
    juego.record = juego.puntos;
  }
  actualizarHUD();

  setTimeout(() => {
    overlayTituloEl.textContent = '¡Misión Fallida!';
    overlaySubEl.textContent    = `Puntaje obtenido: ${juego.puntos} pts | Mejor récord: ${juego.record} pts`;
    btnJugar.textContent        = 'Reintentar (Espacio o Click)';
    overlayEl.classList.remove('is-hidden');
  }, 500);
}

/* ---------- GAME LOOP ÚNICO CON dt ---------- */
let anterior = performance.now();

function frame(ahora) {
  let dt = (ahora - anterior) / 1000;
  anterior = ahora;
  dt = Math.min(dt, 0.05);

  switch (juego.estado) {
    case 'menu':
      if (entrada.impulso) empezar();
      break;

    case 'jugando':
      actualizar(dt);
      break;

    case 'fin':
      if (entrada.impulso && !overlayEl.classList.contains('is-hidden')) {
        reiniciar();
      }
      break;
  }

  entrada.impulso = false;
  dibujar();
  requestAnimationFrame(frame);
}

/* ---------- ENTRADA (TECLADO Y CLICK) ---------- */
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

  if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') && !e.repeat) {
    e.preventDefault();
    entrada.impulso = true;
  }
});

escenarioEl.addEventListener('pointerdown', e => {
  if (e.target.closest('button')) return;
  entrada.impulso = true;
});

btnJugar.addEventListener('click', () => {
  entrada.impulso = true;
});

btnReiniciar.addEventListener('click', () => {
  reiniciar();
});

/* ---------- PRECARGA DE SPRITESHEETS Y CAPAS ---------- */
const ASSETS_JUEGO = [
  '../assets/flappy/fondo/1.png',
  '../assets/flappy/fondo/2.png',
  '../assets/flappy/fondo/3.png',
  '../assets/flappy/fondo/5.png',
  '../assets/flappy/fondo/8.png',
  '../assets/flappy/fondo/9.png',
  '../assets/flappy/jugador-sheet.svg',
  '../assets/flappy/vida-sheet.svg',
  '../assets/flappy/enemigo-sheet.svg'
];

function precargarAssets(rutas) {
  return Promise.all(
    rutas.map(ruta => new Promise(resolve => {
      const img = new Image();
      img.onload  = resolve;
      img.onerror = resolve;
      img.src     = ruta;
    }))
  );
}

// Precargamos antes de iniciar el Game Loop
precargarAssets(ASSETS_JUEGO).then(() => {
  actualizarHUD();
  dibujar();
  requestAnimationFrame(frame);
});
