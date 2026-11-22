/* ==========================================================
   ¡Descubre qué sigue! - Vista
   Dibuja el juego y responde a lo que hace el niño.
   Usa NIVELES_PATRON (datos), Patron (reglas) y figuraSVG (dibujos).
   ========================================================== */
(function () {
  const $ = function (id) { return document.getElementById(id); };
  const ULTIMO = NIVELES_PATRON.length - 1;

  const MENSAJES = {
    inicio: "¡Mira bien y descubre qué sigue!",
    bien: "¡Muy bien, encaja!",
    mal: "Mira cómo se repite el patrón.",
    malCambio: "Mira cómo va cambiando.",
    elige: "Toca una pieza y luego un lugar.",
    sinPiezas: "Ya usaste todas esas piezas.",
    pistaCiclo: "Fíjate en los grupos que se repiten.",
    pistaCambio: "Fíjate en cómo cambia cada figura.",
    gana: "¡Descubriste el patrón!",
    final: "¡Descubriste todos los patrones!"
  };

  let indice = 0, nivel = null;
  let secuencia = [], fijas = [], tocadas = new Set();   // figuras, lugares fijos y lugares que puso el niño
  let opciones = [], necesarias = {};
  let seleccion = null;                                  // pieza elegida con un toque (posición en "opciones")
  let terminado = false, arrastre = null, temporizador = null;
  let avance = leer("patronAvance", 0);                  // desafíos superados (se recuerda en la sesión)

  const mensaje = function (texto) { $("mensaje").textContent = texto; };
  const casilla = function (k) { return $("patron").querySelector('[data-k="' + k + '"]'); };
  const periodo = function () { return Patron.periodo(nivel); };

  /* ---- Dibujar ---- */
  function usadas(clave) {                               // piezas ya puestas por el niño (construye)
    let n = 0;
    tocadas.forEach(function (k) { if (secuencia[k] && Patron.clave(secuencia[k]) === clave) n++; });
    return n;
  }

  function dibujar() {
    const malas = Patron.errores(nivel, secuencia), p = periodo();
    let html = "";
    secuencia.forEach(function (e, k) {
      const clases = "casilla celda" + (fijas[k] ? " dada" : e ? "" : " vacia") + (e ? "" : "") +
                     (tocadas.has(k) && malas.includes(k) ? " choca" : "") + (p ? " g" + (Math.floor(k / p) % 2) : "");
      html += '<button type="button" class="' + clases + '" data-k="' + k + '" style="--d:' + (k * 0.16).toFixed(2) + 's" aria-label="Lugar ' + (k + 1) +
              (e ? "" : ", vacío") + '">' + (e ? figuraSVG(e) : "") + '</button>';
    });
    $("patron").innerHTML = html;

    html = "";
    opciones.forEach(function (o, i) {
      const quedan = nivel.mecanica === "construye" ? necesarias[Patron.clave(o)] - usadas(Patron.clave(o)) : null;
      html += '<button type="button" class="pieza-bandeja' + (seleccion === i ? " elegida" : "") + '" data-op="' + i + '"' +
              (terminado || quedan === 0 ? " disabled" : "") + ' aria-label="Pieza ' + (i + 1) + '">' + figuraSVG(o) +
              (quedan === null ? "" : '<span class="cuenta">' + quedan + '</span>') + '</button>';
    });
    $("bandeja").innerHTML = html;

    html = "";
    NIVELES_PATRON.forEach(function (n, i) {
      html += '<li><button type="button" class="nivel-btn' + (i === indice ? " actual" : "") + (i < avance ? " hecho" : "") +
              '" data-nivel="' + i + '"' + (i > avance ? " disabled" : "") + ' aria-label="Desafío ' + (i + 1) + '">' + (i + 1) + '</button></li>';
    });
    $("niveles").innerHTML = html;

    $("patron").classList.toggle("construye", nivel.mecanica === "construye");
    $("btn-pista").hidden = terminado;
    $("btn-siguiente").hidden = !(terminado && indice < ULTIMO);
  }

  function cargarNivel(i) {
    indice = i;
    nivel = NIVELES_PATRON[i];
    secuencia = Patron.inicial(nivel);
    fijas = secuencia.map(function (e, k) {
      return nivel.mecanica === "diferente" ? false : e !== null;     // en "diferente" se puede cambiar cualquier pieza
    });
    tocadas = new Set();
    necesarias = nivel.mecanica === "construye" ? Patron.necesarias(nivel) : {};
    opciones = Patron.opciones(nivel);
    for (let j = opciones.length - 1; j > 0; j--) {                    // se revuelven las piezas
      const r = Math.floor(Math.random() * (j + 1));
      const x = opciones[j]; opciones[j] = opciones[r]; opciones[r] = x;
    }
    seleccion = null;
    terminado = false;
    clearTimeout(temporizador);
    $("pixel").classList.remove("salta");
    $("confeti").innerHTML = "";
    $("consigna").textContent = nivel.consigna;
    mensaje(MENSAJES.inicio);
    dibujar();
  }

  /* ---- Observar el patrón: ola de luz y grupos ---- */
  function mostrarPatron(ms) {
    const p = periodo();
    $("patron").classList.add(p ? "agrupado" : "cambios");
    $("patron").querySelectorAll(".celda").forEach(function (c) { c.classList.remove("ola"); void c.offsetWidth; c.classList.add("ola"); });
    clearTimeout(temporizador);
    temporizador = setTimeout(function () {
      if (terminado) return;
      $("patron").classList.remove("agrupado", "cambios");
      $("patron").querySelectorAll(".ola, .pista").forEach(function (c) { c.classList.remove("ola", "pista"); });
    }, ms);
  }

  /* ---- Jugar ---- */
  function colocar(op, k) {
    if (terminado || fijas[k]) return;
    const pieza = opciones[op], clave = Patron.clave(pieza);
    if (secuencia[k] && Patron.clave(secuencia[k]) === clave) return;
    if (nivel.mecanica === "construye" && necesarias[clave] - usadas(clave) <= 0) { mensaje(MENSAJES.sinPiezas); return; }

    secuencia[k] = Object.assign({}, pieza);                           // si había otra pieza, se cambia
    tocadas.add(k);
    const bien = Patron.igual(secuencia[k], Patron.esperado(nivel, k));
    dibujar();
    casilla(k).classList.add(bien ? "encaja" : "sacude");
    tono(bien ? [660, 880] : [330]);

    if (Patron.completo(nivel, secuencia)) { ganar(); return; }
    if (bien) mensaje(MENSAJES.bien);
    else { mensaje(periodo() ? MENSAJES.mal : MENSAJES.malCambio); mostrarPatron(2800); }   // pista visual, sin castigo
  }

  function quitar(k) {
    secuencia[k] = null;
    tocadas.delete(k);
    mensaje(MENSAJES.inicio);
    dibujar();
  }

  function ganar() {
    terminado = true;
    clearTimeout(temporizador);
    avance = Math.max(avance, indice + 1);
    guardar("patronAvance", avance);
    dibujar();
    $("patron").classList.add(periodo() ? "agrupado" : "cambios");     // se deja a la vista la regularidad
    $("patron").querySelectorAll(".celda").forEach(function (c) { c.classList.add("celebra"); });
    $("pixel").classList.add("salta");
    mensaje(indice < ULTIMO ? MENSAJES.gana : MENSAJES.final);
    tono([523, 659, 784, 1047]);

    const colores = ["#ffc933", "#e8574a", "#2e9e5b", "#1a5fb4", "#e8730f"];
    let html = "";
    for (let i = 0; i < 20; i++) {
      html += '<span class="pieza" style="left:' + Math.random() * 100 + '%;background:' + colores[i % 5] + ';animation-delay:' + (Math.random() * 0.7).toFixed(2) + 's"></span>';
    }
    $("confeti").innerHTML = html;
    setTimeout(function () { $("confeti").innerHTML = ""; }, 3200);
  }

  function pedirPista() {
    if (terminado) return;
    dibujar();
    const vacio = secuencia.indexOf(null);
    if (vacio !== -1) casilla(vacio).classList.add("pista");
    mensaje(periodo() ? MENSAJES.pistaCiclo : MENSAJES.pistaCambio);
    mostrarPatron(3500);
  }

  function tocar(el) {                                                 // un toque (o la tecla Enter)
    if (el.dataset.op !== undefined) {
      seleccion = (seleccion === +el.dataset.op) ? null : +el.dataset.op;
      dibujar();
      return;
    }
    const k = +el.dataset.k;
    if (fijas[k]) return;
    if (seleccion !== null) { const op = seleccion; seleccion = null; colocar(op, k); }
    else if (tocadas.has(k) && nivel.mecanica !== "diferente") quitar(k);
    else mensaje(MENSAJES.elige);
  }

  /* ---- Tocar o arrastrar una pieza (funciona con mouse y con el dedo) ---- */
  $("bandeja").addEventListener("pointerdown", function (e) {
    const boton = e.target.closest("[data-op]");
    if (!boton || boton.disabled || terminado) return;
    arrastre = { el: boton, op: +boton.dataset.op, x: e.clientX, y: e.clientY, clon: null };
    document.addEventListener("pointermove", mover);
    document.addEventListener("pointerup", soltar);
    document.addEventListener("pointercancel", soltar);
  });

  function mover(e) {
    if (!arrastre) return;
    if (!arrastre.clon && Math.hypot(e.clientX - arrastre.x, e.clientY - arrastre.y) > 8) {
      arrastre.clon = document.createElement("div");
      arrastre.clon.className = "arrastrando";
      arrastre.clon.innerHTML = figuraSVG(opciones[arrastre.op]);
      document.body.appendChild(arrastre.clon);
    }
    if (arrastre.clon) { arrastre.clon.style.left = e.clientX + "px"; arrastre.clon.style.top = e.clientY + "px"; }
  }

  function soltar(e) {
    document.removeEventListener("pointermove", mover);
    document.removeEventListener("pointerup", soltar);
    document.removeEventListener("pointercancel", soltar);
    if (!arrastre) return;
    const a = arrastre;
    arrastre = null;
    if (!a.clon) { tocar(a.el); return; }                              // fue un toque
    a.clon.remove();
    const bajo = e.type === "pointerup" ? document.elementFromPoint(e.clientX, e.clientY) : null;
    const celda = bajo && bajo.closest(".celda");
    if (celda) colocar(a.op, +celda.dataset.k);
  }

  $("patron").addEventListener("click", function (e) {                 // un toque en un lugar de la secuencia
    const celda = e.target.closest(".celda");
    if (celda) tocar(celda);
  });
  $("bandeja").addEventListener("click", function (e) {                // solo teclado: los toques ya se manejan arriba
    if (e.detail !== 0) return;
    const boton = e.target.closest("[data-op]");
    if (boton && !boton.disabled && !terminado) tocar(boton);
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
