
/* ==========================================================
   Piensa y Ordena - Lógica general
   Este archivo lo usan TODAS las páginas HTML.
   Cada página dice cuál es con: <body data-pagina="nombre">
   ========================================================== */

// Orden del recorrido
const ORDEN = ["inicio", "mapa", "actividad1", "actividad2", "actividad3", "actividad4", "actividad5", "actividad6", "creditos"];

const pagina = document.body.dataset.pagina;

// "inicio" es index.html; las demás se llaman igual que su nombre
function archivo(id) {
  return id === "inicio" ? "index.html" : id + ".html";
}

/* ---- Memoria de la sesión ---- */
function leer(clave, porDefecto) {
  try {
    const valor = sessionStorage.getItem(clave);
    return valor === null ? porDefecto : JSON.parse(valor);
  } catch (error) {
    return porDefecto;
  }
}

function guardar(clave, valor) {
  try {
    sessionStorage.setItem(clave, JSON.stringify(valor));
  } catch (error) { /*sin memoria*/ }
}

const visitadas = leer("visitadas", []);
if (!visitadas.includes(pagina)) {
  visitadas.push(pagina);
  guardar("visitadas", visitadas);
}

let sonido = leer("sonido", true);

/* ---- Sonido activado o silenciado ---- */
function fijarSonido(valor) {
  sonido = valor;
  guardar("sonido", sonido);
  if (!sonido && "speechSynthesis" in window) speechSynthesis.cancel();

  const boton = document.getElementById("btn-sonido");
  if (boton) {
    boton.setAttribute("aria-pressed", String(sonido));
    boton.setAttribute("aria-label", sonido ? "Sonido activado" : "Sonido silenciado");
  }
}

/* ---- Sonido agradable para las actividades ---- */
let contextoAudio = null;

function tono(notas) {
  if (!sonido) return;
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    contextoAudio = contextoAudio || new Audio();
    let t = contextoAudio.currentTime;
    notas.forEach(function (hz) {
      const osc = contextoAudio.createOscillator(), vol = contextoAudio.createGain();
      osc.frequency.value = hz;
      vol.gain.setValueAtTime(0.12, t);
      vol.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(vol);
      vol.connect(contextoAudio.destination);
      osc.start(t);
      osc.stop(t + 0.22);
      t += 0.13;
    });
  } catch (error) { /*sin sonido*/ }
}

/* ---- Íconos de la barra ---- */
const ICONOS = {
  inicio: '<path d="M12 3 2.5 11.5H5V20h5v-6h4v6h5v-8.5h2.5z"/>',
  mapa: '<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>',
  ayuda: '<circle cx="12" cy="12" r="10"/><text x="12" y="17.5" text-anchor="middle" font-size="15" font-weight="bold" font-family="Trebuchet MS, Verdana, sans-serif" fill="#1a5fb4">?</text>',
  sonidoOn: '<path d="M3 9v6h4l5 4V5L7 9z"/><path class="trazo" d="M15.5 8.5a5 5 0 0 1 0 7M18.5 6a9 9 0 0 1 0 12"/>',
  sonidoOff: '<path d="M3 9v6h4l5 4V5L7 9z"/><path class="trazo" d="M16 9.5l5 5M21 9.5l-5 5"/>'
};

function icono(nombre, clase) {
  return '<svg class="icono ' + (clase || "") + '" viewBox="0 0 24 24" aria-hidden="true">' + ICONOS[nombre] + '</svg>';
}

/* ---- Barra de navegación y ayuda ---- */
function crearBarra() {
  document.body.insertAdjacentHTML("beforeend",
    '<nav id="barra" class="barra" aria-label="Navegación principal">' +
      '<div class="barra-grupo">' +
        '<a class="nav-btn" href="' + archivo("inicio") + '">' + icono("inicio") + 'Inicio</a>' +
        '<a class="nav-btn" href="' + archivo("mapa") + '">' + icono("mapa") + 'Mapa</a>' +
      '</div>' +
      '<div class="barra-grupo">' +
        '<button type="button" id="btn-ayuda" class="nav-btn">' + icono("ayuda") + 'Ayuda</button>' +
        '<button type="button" id="btn-sonido" class="nav-btn" aria-pressed="' + sonido + '" aria-label="' +
          (sonido ? "Sonido activado" : "Sonido silenciado") + '">' +
          icono("sonidoOn", "ico-on") + icono("sonidoOff", "ico-off") + 'Sonido</button>' +
      '</div>' +
    '</nav>' +

    '<dialog id="ayuda" aria-labelledby="ayuda-titulo">' +
      '<div class="guia-contenido">' +
        '<h2 id="ayuda-titulo">Ayuda</h2>' +
        '<p>Estos son los botones de abajo:</p>' +
        '<ul>' +
          '<li><strong>Inicio</strong> te lleva a la primera pantalla.</li>' +
          '<li><strong>Mapa</strong> te deja elegir a dónde ir.</li>' +
          '<li><strong>Sonido</strong> enciende o apaga el sonido.</li>' +
          '<li><strong>Ayuda</strong> abre esta ventana.</li>' +
        '</ul>' +
        '<button type="button" class="boton-secundario cerrar">Cerrar</button>' +
      '</div>' +
    '</dialog>');

  document.getElementById("btn-ayuda").addEventListener("click", function () {
    document.getElementById("ayuda").showModal();
  });

  document.getElementById("btn-sonido").addEventListener("click", function () {
    fijarSonido(!sonido);
  });
}

/* ---- Mapa: marcar las secciones ya visitadas ---- */
function marcarVisitadas() {
  document.querySelectorAll(".tarjeta-mapa").forEach(function (tarjeta) {
    tarjeta.classList.toggle("visto", visitadas.includes(tarjeta.dataset.id));
  });
}

/* ---- Ventanas (Guía y Ayuda) ---- */
function activarVentanas() {
  const btnGuia = document.getElementById("btn-guia");
  if (btnGuia) {
    btnGuia.addEventListener("click", function () {
      document.getElementById("guia").showModal();
    });
  }

  document.querySelectorAll("dialog").forEach(function (ventana) {
    ventana.querySelector(".cerrar").addEventListener("click", function () {
      ventana.close();
    });

    // Cerrar también al tocar fuera de la tarjeta
    ventana.addEventListener("click", function (evento) {
      if (evento.target === ventana) ventana.close();
    });
  });
}

/* ---- Narración: botón "Escuchar" ---- */
function activarEscuchar() {
  if (!("speechSynthesis" in window)) return;

  document.querySelectorAll("[data-leer]").forEach(function (boton) {
    boton.insertAdjacentHTML("afterbegin", icono("sonidoOn"));
    boton.hidden = false;

    boton.addEventListener("click", function () {
      fijarSonido(true);
      speechSynthesis.cancel();

      const texto = document.getElementById(boton.dataset.leer).innerText;
      const voz = new SpeechSynthesisUtterance(texto);
      voz.lang = "es";
      voz.rate = 0.9;
      const española = speechSynthesis.getVoices().find(function (v) {
        return v.lang.startsWith("es");
      });
      if (española) voz.voice = española;
      speechSynthesis.speak(voz);
    });
  });
}

/* ---- Arranque ---- */
if (pagina !== "inicio") crearBarra();
if (pagina === "mapa") marcarVisitadas();
activarVentanas();
activarEscuchar();
