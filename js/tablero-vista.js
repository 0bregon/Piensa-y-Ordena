/* ==========================================================
   ¡Completa el tablero! - Vista
   Dibuja el juego y responde a lo que hace el niño.
   Usa NIVELES_TABLERO (datos) y LogicaTablero (reglas).
   ========================================================== */
(function () {
  const $ = function (id) { return document.getElementById(id); };
  const ULTIMO = NIVELES_TABLERO.length - 1;
  const trazo = 'stroke="#12294a" stroke-width="3" stroke-linejoin="round"';

  const FIGURAS = {
    estrella:  { nombre: "Estrella",  svg: '<polygon points="20,3 25,15 38,16 28,24 31,37 20,30 9,37 12,24 2,16 15,15" fill="#ffc933" ' + trazo + '/>' },
    circulo:   { nombre: "Círculo",   svg: '<circle cx="20" cy="20" r="15.5" fill="#1a8fe3" ' + trazo + '/>' },
    cuadrado:  { nombre: "Cuadrado",  svg: '<rect x="5.5" y="5.5" width="29" height="29" rx="5" fill="#2e9e5b" ' + trazo + '/>' },
    triangulo: { nombre: "Triángulo", svg: '<polygon points="20,4.5 36,34 4,34" fill="#e8574a" ' + trazo + '/>' },
    corazon:   { nombre: "Corazón",   svg: '<path d="M20 35C5 25 3 14 10 10c4-2 8 0 10 4 2-4 6-6 10-4 7 4 5 15-10 25z" fill="#d94fa0" ' + trazo + '/>' }
  };

  const MENSAJES = {
    inicio: "¡Vamos, tú puedes!",
    bien: "¡Muy bien, encaja!",
    repite: "Esa figura se repite. ¡Mira su fila y su columna!",
    atascado: "Algo no encaja. Toca una figura para cambiarla.",
    elige: "Toca una figura y luego una casilla.",
    sinPiezas: "Ya usaste todas esas figuras.",
    pistaConflicto: "Estas figuras se repiten. ¡Cámbialas!",
    pistaObserva: "Mira esta fila y esta columna.",
    gana: "¡Lo lograste! Completaste el tablero.",
    final: "¡Completaste todos los desafíos!"
  };

  let indice = 0;                               // nivel que se juega
  let tablero = [], dados = [];                 // figuras puestas y casillas fijas
  let seleccion = null;                         // figura elegida con un toque
  let terminado = false;
  let arrastre = null;                          // figura que se está arrastrando
  let avance = leer("tableroAvance", 0);        // niveles superados (se recuerda en la sesión)

  const nivel = function () { return NIVELES_TABLERO[indice]; };
  const figura = function (i) { return FIGURAS[nivel().figuras[i]]; };
  const dibujo = function (i) { return '<svg viewBox="0 0 40 40" aria-hidden="true">' + figura(i).svg + '</svg>'; };
  const mensaje = function (texto) { $("mensaje").textContent = texto; };

  /* ---- Dibujar ---- */
  function dibujar() {
    const n = tablero.length, malas = LogicaTablero.conflictos(tablero);
    const rejilla = $("rejilla");
    rejilla.style.setProperty("--n", n);
    rejilla.classList.toggle("n4", n === 4);
    rejilla.classList.toggle("eligiendo", seleccion !== null);

    let html = "";
    for (let f = 0; f < n; f++) {
      for (let c = 0; c < n; c++) {
        const v = tablero[f][c];
        const clases = "casilla" + (dados[f][c] ? " dada" : v === null ? " vacia" : "") + (malas.has(f + "," + c) ? " choca" : "");
        const texto = "Fila " + (f + 1) + ", columna " + (c + 1) + ": " + (v === null ? "vacía" : figura(v).nombre);
        html += '<button type="button" class="' + clases + '" data-f="' + f + '" data-c="' + c + '" aria-label="' + texto + '"' +
                (dados[f][c] ? " tabindex=\"-1\"" : "") + '>' + (v === null ? "" : dibujo(v)) + '</button>';
      }
    }
    rejilla.innerHTML = html;

    const quedan = LogicaTablero.restantes(tablero);
    html = "";
    nivel().figuras.forEach(function (nombre, i) {
      html += '<button type="button" class="pieza-bandeja' + (seleccion === i ? " elegida" : "") + '" data-fig="' + i + '"' +
              (quedan[i] === 0 || terminado ? " disabled" : "") + ' aria-label="' + figura(i).nombre + ', quedan ' + quedan[i] + '">' +
              dibujo(i) + '<span class="cuenta">' + quedan[i] + '</span></button>';
    });
    $("bandeja").innerHTML = html;

    html = "";
    NIVELES_TABLERO.forEach(function (x, i) {
      html += '<li><button type="button" class="nivel-btn' + (i === indice ? " actual" : "") + (i < avance ? " hecho" : "") +
              '" data-nivel="' + i + '"' + (i > avance ? " disabled" : "") + ' aria-label="Desafío ' + (i + 1) + '">' + (i + 1) + '</button></li>';
    });
    $("niveles").innerHTML = html;

    $("btn-pista").hidden = terminado;
    $("btn-siguiente").hidden = !(terminado && indice < ULTIMO);
  }

  const casilla = function (f, c) { return $("rejilla").querySelector('[data-f="' + f + '"][data-c="' + c + '"]'); };

  function cargarNivel(i) {
    indice = i;
    tablero = nivel().dado.map(function (fila) { return fila.slice(); });
    dados = tablero.map(function (fila) { return fila.map(function (v) { return v !== null; }); });
    seleccion = null;
    terminado = false;
    $("consigna").textContent = nivel().consigna;
    $("pixel").classList.remove("salta");
    mensaje(MENSAJES.inicio);
    dibujar();
  }

  /* ---- Jugar ---- */
  function colocar(fig, f, c) {
    if (terminado || dados[f][c] || tablero[f][c] === fig) return;
    if (LogicaTablero.restantes(tablero)[fig] === 0) { mensaje(MENSAJES.sinPiezas); return; }

    tablero[f][c] = fig;                              // si había otra figura, se cambia (corregir)
    const repetida = LogicaTablero.conflictos(tablero).has(f + "," + c);
    dibujar();

    const celda = casilla(f, c);
    celda.classList.add(repetida ? "sacude" : "encaja");
    mensaje(repetida ? MENSAJES.repite : MENSAJES.bien);
    tono(repetida ? [330] : [660, 880]);

    if (LogicaTablero.completo(tablero)) ganar();
    else if (!repetida && LogicaTablero.atascado(tablero)) mensaje(MENSAJES.atascado);
  }

  function quitar(f, c) {
    tablero[f][c] = null;
    mensaje(MENSAJES.inicio);
    dibujar();
  }

  function ganar() {
    terminado = true;
    avance = Math.max(avance, indice + 1);
    guardar("tableroAvance", avance);
    mensaje(indice < ULTIMO ? MENSAJES.gana : MENSAJES.final);
    dibujar();
    tono([523, 659, 784, 1047]);
    $("pixel").classList.add("salta");

    const colores = ["#ffc933", "#e8574a", "#2e9e5b", "#1a5fb4", "#e8730f"];
    let html = "";
    for (let i = 0; i < 20; i++) {
      html += '<span class="pieza" style="left:' + Math.random() * 100 + '%;background:' + colores[i % 5] + ';animation-delay:' + (Math.random() * 0.7).toFixed(2) + 's"></span>';
    }
    $("confeti").innerHTML = html;
    setTimeout(function () { $("confeti").innerHTML = ""; }, 3200);
  }

  function pedirPista() {
    const p = LogicaTablero.pista(tablero);
    if (!p) return;
    dibujar();
    if (p.tipo === "conflicto") {
      p.celdas.forEach(function (k) { const [f, c] = k.split(","); casilla(f, c).classList.add("pista"); });
      mensaje(MENSAJES.pistaConflicto);
    } else if (p.tipo === "atascado") {
      mensaje(MENSAJES.atascado);
    } else {
      const [f, c] = p.celda;
      for (let k = 0; k < tablero.length; k++) {
        casilla(f, k).classList.add("linea");
        casilla(k, c).classList.add("linea");
      }
      casilla(f, c).classList.add("pista");
      mensaje(MENSAJES.pistaObserva);
    }
    setTimeout(function () { if (!terminado) dibujar(); }, 3000);
  }

  /* ---- Tocar o arrastrar una figura (funciona con mouse y con el dedo) ---- */
  $("bandeja").addEventListener("pointerdown", function (e) {
    const boton = e.target.closest("[data-fig]");
    if (!boton || boton.disabled || terminado) return;
    arrastre = { fig: +boton.dataset.fig, x: e.clientX, y: e.clientY, clon: null };
    document.addEventListener("pointermove", mover);
    document.addEventListener("pointerup", soltar);
    document.addEventListener("pointercancel", soltar);
  });

  function mover(e) {
    if (!arrastre) return;
    if (!arrastre.clon && Math.hypot(e.clientX - arrastre.x, e.clientY - arrastre.y) > 8) {
      arrastre.clon = document.createElement("div");
      arrastre.clon.className = "arrastrando";
      arrastre.clon.innerHTML = dibujo(arrastre.fig);
      document.body.appendChild(arrastre.clon);
      seleccion = null;
      $("rejilla").classList.add("eligiendo");
    }
    if (arrastre.clon) {
      arrastre.clon.style.left = e.clientX + "px";
      arrastre.clon.style.top = e.clientY + "px";
    }
  }

  function soltar(e) {
    document.removeEventListener("pointermove", mover);
    document.removeEventListener("pointerup", soltar);
    document.removeEventListener("pointercancel", soltar);
    if (!arrastre) return;
    const a = arrastre;
    arrastre = null;

    if (!a.clon) {                                    // fue un toque: elegir o soltar la figura
      seleccion = (seleccion === a.fig) ? null : a.fig;
      dibujar();
      return;
    }
    a.clon.remove();
    const destino = e.type === "pointerup" ? document.elementFromPoint(e.clientX, e.clientY) : null;
    const celda = destino && destino.closest(".casilla");
    if (celda) colocar(a.fig, +celda.dataset.f, +celda.dataset.c);
    else dibujar();
  }

  $("rejilla").addEventListener("click", function (e) {
    const celda = e.target.closest(".casilla");
    if (!celda || terminado) return;
    const f = +celda.dataset.f, c = +celda.dataset.c;
    if (dados[f][c]) return;
    if (seleccion !== null) { const fig = seleccion; seleccion = null; colocar(fig, f, c); }
    else if (tablero[f][c] !== null) quitar(f, c);
    else mensaje(MENSAJES.elige);
  });

  $("btn-pista").addEventListener("click", pedirPista);
  $("btn-reiniciar").addEventListener("click", function () { cargarNivel(indice); });
  $("btn-siguiente").addEventListener("click", function () { cargarNivel(indice + 1); });
  $("niveles").addEventListener("click", function (e) {
    const boton = e.target.closest("[data-nivel]");
    if (boton) cargarNivel(+boton.dataset.nivel);
  });

  cargarNivel(Math.min(avance, ULTIMO));
})();
