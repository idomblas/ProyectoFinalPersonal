window.memory = function (mainContainer) {
  mainContainer.innerHTML = `
    <iframe src="./memory/memory.html"
            style="width: 100%; height: 90vh; border: none; border-radius: 12px;">
    </iframe>
  `;
};

const emojis = [
  "🍎",
  "🍌",
  "🥝",
  "🍓",
  "🍇",
  "🍍",
  "🍉",
  "🍊",
  "🍋",
  "🍒",
  "🍑",
  "🥭",
];
let cartasArray = [...emojis, ...emojis];

const tablero = document.getElementById("tableroJuego");
const displayTiempo = document.getElementById("temporizador");
const displayMovimientos = document.getElementById("movimientos");

let cartasVolteadas = [];
let bloqueandoClics = false;
let paresEncontrados = 0;
let movimientos = 0;

const TIEMPO_VISTAZO = 2000;
let tiempoLimite = 120;
let temporizadorInterval;

function barajarCartas(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function crearTablero() {
  barajarCartas(cartasArray);

  cartasArray.forEach((emoji, index) => {
    const carta = document.createElement("div");
    carta.classList.add("carta");
    carta.dataset.emoji = emoji;
    carta.dataset.index = index;

    carta.addEventListener("click", manejarVolteo);

    const contenido = document.createElement("div");
    contenido.classList.add("contenido-carta");

    const anverso = document.createElement("div");
    anverso.classList.add("cara", "anverso");
    anverso.innerHTML = emoji;

    const reverso = document.createElement("div");
    reverso.classList.add("cara", "reverso");
    reverso.innerHTML = "🎯";

    contenido.appendChild(anverso);
    contenido.appendChild(reverso);
    carta.appendChild(contenido);
    tablero.appendChild(carta);
  });
}

function actualizarDisplayTiempo() {
  const minutos = Math.floor(tiempoLimite / 120)
    .toString()
    .padStart(2, "0");
  const segundos = (tiempoLimite % 120).toString().padStart(2, "0");
  displayTiempo.textContent = `Tiempo: ${minutos}:${segundos}`;
}

function iniciarTemporizador() {
  actualizarDisplayTiempo();

  temporizadorInterval = setInterval(() => {
    tiempoLimite--;
    actualizarDisplayTiempo();

    if (tiempoLimite <= 0) {
      detenerTemporizador();
      finDelJuego(false);
    }
  }, 1000);
}

function detenerTemporizador() {
  clearInterval(temporizadorInterval);
}

function verificarPar() {
  const [carta1, carta2] = cartasVolteadas;

  if (carta1.dataset.emoji === carta2.dataset.emoji) {
    carta1.classList.add("emparejada");
    carta2.classList.add("emparejada");

    carta1.removeEventListener("click", manejarVolteo);
    carta2.removeEventListener("click", manejarVolteo);

    paresEncontrados++;

    if (paresEncontrados === 12) {
      detenerTemporizador();
      finDelJuego(true);
    }
  } else {
    setTimeout(() => {
      carta1.classList.remove("volteada");
      carta2.classList.remove("volteada");
    }, 800);
  }

  cartasVolteadas = [];
  bloqueandoClics = false;
}

function manejarVolteo(event) {
  const cartaClickeada = event.currentTarget;

  if (
    bloqueandoClics ||
    cartaClickeada.classList.contains("volteada") ||
    cartaClickeada.classList.contains("emparejada")
  ) {
    return;
  }

  cartaClickeada.classList.add("volteada");
  cartasVolteadas.push(cartaClickeada);

  if (cartasVolteadas.length === 1) {
  } else if (cartasVolteadas.length === 2) {
    movimientos++;
    displayMovimientos.textContent = `Movimientos: ${movimientos}`;

    bloqueandoClics = true;

    verificarPar();
  }
}

function finDelJuego(ganado) {
  const todasLasCartas = document.querySelectorAll(".carta");
  todasLasCartas.forEach((c) => c.removeEventListener("click", manejarVolteo));

  detenerTemporizador();

  let mensaje = "";

  if (ganado) {
    const tiempoConsumido = 120 - tiempoLimite;

    mensaje = `¡Felicidades, ${nombreJugadorActual}! Ganaste en ${movimientos} movimientos y ${tiempoConsumido} segundos.`;

    registrarPuntuacion(nombreJugadorActual, movimientos, tiempoConsumido);
  } else {
    mensaje = `¡Tiempo agotado! Has perdido. Movimientos: ${movimientos}.`;
    todasLasCartas.forEach((c) => c.classList.add("volteada"));
  }

  setTimeout(() => {
    alert(mensaje);
    reiniciarJuego();
  }, 500);
}

function registrarPuntuacion(nombre, movs, tiempo) {
  let puntuaciones = cargarPuntuaciones();

  const nuevaPuntuacion = {
    nombre: nombre,
    puntuacion: {
      movimientos: movs,
      tiempo: tiempo,
    },
  };

  puntuaciones.push(nuevaPuntuacion);

  puntuaciones.sort((a, b) => {
    if (a.puntuacion.movimientos !== b.puntuacion.movimientos) {
      return a.puntuacion.movimientos - b.puntuacion.movimientos;
    }
    return a.puntuacion.tiempo - b.puntuacion.tiempo;
  });

  guardarPuntuaciones(puntuaciones.slice(0, MAX_PUNTUACIONES));

  mostrarPodio();
}

function iniciarJuego() {
  crearTablero();
  const todasLasCartas = document.querySelectorAll(".carta");

  todasLasCartas.forEach((carta) => {
    carta.classList.add("volteada");
    carta.style.pointerEvents = "none";
  });

  setTimeout(() => {
    todasLasCartas.forEach((carta) => {
      carta.classList.remove("volteada");
    });

    todasLasCartas.forEach((carta) => {
      carta.style.pointerEvents = "auto";
    });

    iniciarTemporizador();
  }, TIEMPO_VISTAZO);
}

window.onload = iniciarJuego;

let nombreJugadorActual = "";
const MAX_PUNTUACIONES = 5;

function cargarPuntuaciones() {
  const jsonPuntuaciones = localStorage.getItem("memoryScores");
  return jsonPuntuaciones ? JSON.parse(jsonPuntuaciones) : [];
}

function guardarPuntuaciones(puntuaciones) {
  localStorage.setItem("memoryScores", JSON.stringify(puntuaciones));
}

function mostrarPodio() {
  const puntuaciones = cargarPuntuaciones();
  const listaPodio = document.getElementById("listaPodio");
  listaPodio.innerHTML = "";

  if (puntuaciones.length === 0) {
    listaPodio.innerHTML =
      '<li style="list-style: none;">Nadie ha jugado aún. ¡Sé el primero!</li>';
    return;
  }

  puntuaciones.forEach((score, index) => {
    const item = document.createElement("li");
    const medalla = ["🥇", "🥈", "🥉", "🏅", "🏅"][index] || "▪️";

    item.innerHTML = `${medalla} **${score.nombre}** — Movs: ${score.puntuacion.movimientos}, Tiempo: ${score.puntuacion.tiempo}s`;
    item.style.listStyle = "none";
    item.style.padding = "5px 0";
    listaPodio.appendChild(item);
  });
}
function reiniciarJuego() {
  cartasVolteadas = [];
  bloqueandoClics = false;
  paresEncontrados = 0;
  movimientos = 0;
  tiempoLimite = 120;

  tablero.innerHTML = "";

  tablero.style.display = "none";
  document.getElementById("pantallaInicio").style.display = "block";

  displayMovimientos.textContent = "Movimientos: 0";
  actualizarDisplayTiempo();
}

function comenzarJuego() {
  const inputNombre = document.getElementById("nombreJugador");
  const nombre = inputNombre.value.trim();

  if (nombre.length < 2) {
    alert("Por favor, introduce un nombre de al menos 2 caracteres.");
    return;
  }

  nombreJugadorActual = nombre;

  document.getElementById("pantallaInicio").style.display = "none";
  tablero.style.display = "grid";

  iniciarJuego();
}

window.onload = () => {
  mostrarPodio();
  tablero.style.display = "none";
};
