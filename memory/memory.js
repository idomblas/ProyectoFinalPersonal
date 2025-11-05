window.memory = function (mainContainer) {
  mainContainer.innerHTML = `
    <iframe src="./memory/memory.html"
            style="width: 100%; height: 90vh; border: none; border-radius: 12px;">
    </iframe>
  `;
};

const rutasImagenes = [
  "resources/flauta.jpg",
  "resources/campanilla.jpg",
  "resources/caracola.jpg",
  "resources/cristal.jpg",
  "resources/flores.jpg",
  "resources/fruto.jpg",
  "resources/guantes.jpg",
  "resources/lupa.jpg",
  "resources/mapa.jpg",
  "resources/medallon.jpg",
  "resources/pocion.jpg",
  "resources/polvos.jpg",
];

const rutaImagenReverso = "resources/reverso.jpg";

let cartasArray = [...rutasImagenes, ...rutasImagenes];

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

  cartasArray.forEach((rutaImagen, index) => {
    const carta = document.createElement("div");
    carta.classList.add("carta");
    carta.dataset.imagen = rutaImagen;
    carta.dataset.index = index;

    carta.addEventListener("click", manejarVolteo);

    const contenido = document.createElement("div");
    contenido.classList.add("contenido-carta");

    const anverso = document.createElement("div");
    anverso.classList.add("cara", "anverso");

    const img = document.createElement("img");
    img.src = rutaImagen;
    img.alt = "Ilustracion de carta";
    anverso.appendChild(img);

    const reverso = document.createElement("div");
    reverso.classList.add("cara", "reverso");

    const imgReverso = document.createElement("img");
    imgReverso.src = rutaImagenReverso;
    imgReverso.alt = "Reverso de carta";
    reverso.appendChild(imgReverso);

    contenido.appendChild(anverso);
    contenido.appendChild(reverso);
    carta.appendChild(contenido);
    tablero.appendChild(carta);
  });
}

function actualizarDisplayTiempo() {
  const minutos = Math.floor(tiempoLimite / 60)
    .toString()
    .padStart(2, "0");
  const segundos = (tiempoLimite % 60).toString().padStart(2, "0");
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

  if (carta1.dataset.imagen === carta2.dataset.imagen) {
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

  const botinAsegurado = paresEncontrados;
  const tiempoConsumido = 120 - tiempoLimite;

  if (ganado || paresEncontrados === 12) {
    const tiempoConsumido = 120 - tiempoLimite;

    mensaje = `✨ ¡Botín Máximo Asegurado! ¡Conseguiste ${botinAsegurado} objetos mágicos en ${tiempoConsumido} segundos! El héroe está listo para la Mazmorra.`;

    registrarPuntuacion(nombreJugadorActual, movimientos, tiempoConsumido);
  } else {
    mensaje = `⏱️ ¡Tiempo agotado! Solo conseguiste ${botinAsegurado} objetos de 12. La mazmorra será difícil. Movimientos: ${movimientos}.`;
    todasLasCartas.forEach((c) => c.classList.add("volteada"));
  }

  setTimeout(() => {
    alert(mensaje);
    reiniciarJuego();
  }, 500);
}

function registrarPuntuacion(nombre, movs, tiempo, botinAsegurado) {
  let puntuaciones = cargarPuntuaciones();

  const nuevaPuntuacion = {
    nombre: nombre,
    puntuacion: {
      botin: botinAsegurado,
      movimientos: movs,
      tiempo: tiempo,
    },
  };

  puntuaciones.push(nuevaPuntuacion);

  puntuaciones.sort((a, b) => {
    if (b.puntuacion.botin !== a.puntuacion.botin) {
      return b.puntuacion.botin - a.puntuacion.botin;
    }
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
    const botin = score.puntuacion.botin || 0;
    const item = document.createElement("li");
    const medalla = ["🥇", "🥈", "🥉", "🏅", "🏅"][index] || "▪️";

    item.innerHTML = `${medalla} **${score.nombre}** — Botín: **${score.puntuacion.botin}** objetos, Movs: ${score.puntuacion.movimientos}, Tiempo: ${score.puntuacion.tiempo}s`;
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
