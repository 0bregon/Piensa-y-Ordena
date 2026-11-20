/* ==========================================================
   ¡Encuentra el camino! - Vista
   Dibuja el juego y responde a lo que hace el niño.
   Usa NIVELES (datos) y CaminoLogica (reglas).
   ========================================================== */
(function () {
  const $ = function (id) { return document.getElementById(id); };
  const NOMBRES = { arriba: "arriba", abajo: "abajo", izquierda: "a la izquierda", derecha: "a la derecha" };
  const ULTIMO = NIVELES.length - 1;

  const MENSAJES = {
    gana: "¡Lo lograste! Pixel llegó a la batería.",
    faltan: "Pixel llegó, pero faltan estrellas. ¡Inténtalo otra vez!",
    lejos: "Pixel todavía no llega a la batería. ¡Prueba con más flechas!",
    borde: "¡Ups! Pixel no puede salir del tablero. ¡Prueba otro camino!",
    obstaculo: "¡Ups! Hay una roca en el camino. ¡Prueba otro camino!"
  };

  const DIBUJOS = {
    roca: '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="4" y="8" width="32" height="28" rx="9" fill="#6b7a8c" stroke="#12294a" stroke-width="3"/><path d="M13 18l6 5M26 14l-4 6" stroke="#12294a" stroke-width="3" stroke-linecap="round"/></svg>',
    estrella: '<svg viewBox="0 0 40 40" aria-hidden="true"><polygon points="20,3 25,15 38,16 28,24 31,37 20,30 9,37 12,24 2,16 15,15" fill="#ffc933" stroke="#12294a" stroke-width="3" stroke-linejoin="round"/></svg>',
    meta: '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="4" y="10" width="28" height="22" rx="5" fill="#2e9e5b" stroke="#12294a" stroke-width="3"/><rect x="32" y="17" width="5" height="8" rx="2" fill="#12294a"/><path d="M19 13l-6 10h6l-2 7 9-11h-6l3-6z" fill="#ffd84d"/></svg>'
  };

  let indice = 0;                          // nivel que se está jugando
  let programa = [];                       // flechas elegidas, en orden
  let ejecutando = false;
  let avance = leer("caminoAvance", 0);    // niveles superados (se recuerda en la sesión)

  const nivel = function () { return NIVELES[indice]; };
  const esperar = function (ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); };
  const mensaje = function (texto) { $("mensaje").textContent = texto; };
  // "Siguiente nivel" ocupa el lugar del botón Jugar
  const mostrarSiguiente = function (si) { $("btn-siguiente").hidden = !si; $("btn-jugar").hidden = si; };

  function flecha(dir) {
    return '<svg class="flecha-svg f-' + dir + '" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V6M5.5 12.5 12 6l6.5 6.5"/></svg>';
  }

  /* ---- Dibujar ---- */
  function casilla(x, y) {
    const n = nivel();
    return "left:" + (x * 100 / n.columnas) + "%;top:" + (y * 100 / n.filas) + "%;width:" + (100 / n.columnas) + "%;height:" + (100 / n.filas) + "%";
  }

  function objeto(tipo, c, extra) {
    return '<div class="obj ' + tipo + '" ' + (extra || "") + ' style="' + casilla(c[0], c[1]) + '">' + DIBUJOS[tipo] + '</div>';
  }

  function dibujarTablero() {
    const n = nivel(), tablero = $("tablero");
    tablero.style.setProperty("--cols", n.columnas);
    tablero.style.setProperty("--filas", n.filas);

    let html = "";
    for (let y = 0; y < n.filas; y++) {
      for (let x = 0; x < n.columnas; x++) html += '<div class="celda c' + ((x + y) % 2) + '"></div>';
    }
    n.obstaculos.forEach(function (o) { html += objeto("roca", o); });
    n.estrellas.forEach(function (e, i) { html += objeto("estrella", e, 'data-i="' + i + '"'); });
    html += objeto("meta", n.meta);
    html += '<div class="robot" id="robot" style="' + casilla(n.inicio[0], n.inicio[1]) + '"><img src="img/pixel.png" alt="Pixel"></div>';
    tablero.innerHTML = html;
  }

  function dibujarPrograma() {
    let html = "";
    for (let i = 0; i < nivel().limite; i++) {
      html += programa[i]
        ? '<li><button type="button" class="ranura llena" draggable="true" data-i="' + i + '" aria-label="Quitar flecha ' + NOMBRES[programa[i]] + '">' + flecha(programa[i]) + '</button></li>'
        : '<li><span class="ranura" data-i="' + i + '"></span></li>';
    }
    $("programa").innerHTML = html;
  }

  function dibujarNiveles() {
    let html = "";
    NIVELES.forEach(function (n, i) {
      html += '<li><button type="button" class="nivel-btn' + (i === indice ? " actual" : "") + (i < avance ? " hecho" : "") +
              '" data-nivel="' + i + '"' + (i > avance ? " disabled" : "") + ' aria-label="Nivel ' + (i + 1) + '">' + (i + 1) + '</button></li>';
    });
    $("niveles").innerHTML = html;
  }

  function cargarNivel(i) {
    indice = i;
    programa = [];
    $("consigna").textContent = nivel().consigna;
    mostrarSiguiente(false);
    mensaje("");
    dibujarNiveles();
    dibujarTablero();
    dibujarPrograma();
  }

  /* ---- Editar el camino ---- */
  function editar(cambio) {
    if (ejecutando) return;
    mensaje("");
    mostrarSiguiente(false);
    cambio();
    dibujarPrograma();
    dibujarTablero();     // Pixel vuelve al inicio y las estrellas reaparecen
  }

  function agregar(dir, pos) {
    if (programa.length >= nivel().limite) { mensaje("¡Ya no caben más flechas! Quita alguna."); return; }
    programa.splice(pos === undefined ? programa.length : pos, 0, dir);
  }

  /* ---- Ejecutar ---- */
  function marcar(paso) {
    $("programa").querySelectorAll(".ranura").forEach(function (r, k) { r.classList.toggle("activa", k === paso); });
  }

  async function jugar() {
    if (ejecutando) return;
    if (!programa.length) { mensaje("Pon flechas para armar el camino de Pixel."); return; }

    dibujarTablero();
    mensaje("");
    mostrarSiguiente(false);
    ejecutando = true;
    $("panel").inert = true;

    const n = nivel(), robot = $("robot");
    const sim = CaminoLogica.simular(n, programa);

    for (let i = 0; i < sim.pasos.length; i++) {
      const p = sim.pasos[i];
      marcar(i);
      if (p.choque) {
        robot.classList.add("sacudir");
        await esperar(700);
      } else {
        robot.style.left = (p.x * 100 / n.columnas) + "%";
        robot.style.top = (p.y * 100 / n.filas) + "%";
        await esperar(600);
        if (p.estrella >= 0) $("tablero").querySelector('.estrella[data-i="' + p.estrella + '"]').classList.add("recogida");
      }
    }

    marcar(-1);
    terminar(sim.resultado);
    ejecutando = false;
    $("panel").inert = false;
  }

  function terminar(resultado) {
    mensaje(MENSAJES[resultado]);
    if (resultado !== "gana") return;

    avance = Math.max(avance, indice + 1);
    guardar("caminoAvance", avance);
    dibujarNiveles();
    celebrar();

    if (indice < ULTIMO) mostrarSiguiente(true);
    else mensaje("¡Completaste todos los niveles! Eres un gran programador.");
  }

  function celebrar() {
    $("robot").classList.add("salta");
    const colores = ["#ffc933", "#e8574a", "#2e9e5b", "#1a5fb4", "#e8730f"];
    let html = "";
    for (let i = 0; i < 20; i++) {
      html += '<span class="pieza" style="left:' + Math.random() * 100 + '%;background:' + colores[i % 5] + ';animation-delay:' + (Math.random() * 0.7).toFixed(2) + 's"></span>';
    }
    $("confeti").innerHTML = html;
    setTimeout(function () { $("confeti").innerHTML = ""; }, 3200);
  }

  /* ---- Eventos ---- */
  $("flechas").addEventListener("click", function (e) {
    const boton = e.target.closest("[data-dir]");
    if (boton) editar(function () { agregar(boton.dataset.dir); });
  });
  $("flechas").addEventListener("dragstart", function (e) {
    const boton = e.target.closest("[data-dir]");
    if (boton) e.dataTransfer.setData("text/plain", "nueva:" + boton.dataset.dir);
  });

  $("programa").addEventListener("click", function (e) {
    const boton = e.target.closest("button.llena");
    if (boton) editar(function () { programa.splice(+boton.dataset.i, 1); });
  });
  $("programa").addEventListener("dragstart", function (e) {
    const boton = e.target.closest("button.llena");
    if (boton) e.dataTransfer.setData("text/plain", "mover:" + boton.dataset.i);
  });
  $("programa").addEventListener("dragover", function (e) { e.preventDefault(); });
  $("programa").addEventListener("drop", function (e) {
    e.preventDefault();
    const partes = e.dataTransfer.getData("text/plain").split(":");
    const destino = e.target.closest("[data-i]");
    const pos = destino ? Math.min(+destino.dataset.i, programa.length) : programa.length;
    editar(function () {
      if (partes[0] === "nueva") agregar(partes[1], pos);
      if (partes[0] === "mover") {
        const movida = programa.splice(+partes[1], 1)[0];
        programa.splice(Math.min(pos, programa.length), 0, movida);
      }
    });
  });

  $("btn-jugar").addEventListener("click", jugar);
  $("btn-borrar").addEventListener("click", function () { editar(function () { programa.pop(); }); });
  $("btn-reiniciar").addEventListener("click", function () { editar(function () { programa = []; }); });
  $("btn-siguiente").addEventListener("click", function () { cargarNivel(indice + 1); });
  $("niveles").addEventListener("click", function (e) {
    const boton = e.target.closest("[data-nivel]");
    if (boton && !ejecutando) cargarNivel(+boton.dataset.nivel);
  });

  cargarNivel(Math.min(avance, ULTIMO));
})();
