/* ==========================================================
   ¡Ordena las instrucciones! - Vista
   Dibuja el juego y responde a lo que hace el niño.
   Usa MISIONES (datos) y Secuencia (reglas).
   ========================================================== */
(function () {
  const $ = function (id) { return document.getElementById(id); };
  const ULTIMO = MISIONES.length - 1;

  const MENSAJES = {
    inicio: "Pon las tarjetas en orden y toca el botón verde.",
    faltan: "Faltan tarjetas por poner.",
    elige: "Toca una tarjeta y luego un lugar.",
    fallo: "¡Uy! A este paso le faltaba algo antes. ¡Prueba otro orden!",
    pistaFalla: "Mira: este paso va antes.",
    pistaSigue: "Prueba con esta tarjeta aquí.",
    listo: "¡Ya puedes tocar el botón verde!",
    gana: "¡Misión cumplida!",
    final: "¡Completaste todas las misiones!"
  };

  let indice = 0, mision = null;
  let huecos = [], bandeja = [];                // tarjetas en los pasos y tarjetas sueltas
  let seleccion = null;                         // tarjeta elegida con un toque
  let ejecutando = false, terminado = false;
  let arrastre = null;
  let avance = leer("secuenciaAvance", 0);      // misiones superadas (se recuerda en la sesión)

  const mensaje = function (texto) { $("mensaje").textContent = texto; };
  const esperar = function (ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); };
  const dibujo = function (id) { return '<svg viewBox="0 0 48 48" aria-hidden="true">' + Secuencia.buscar(mision, id).icono + '</svg>'; };
  const paso = function (i) { return $("secuencia").querySelector('[data-i="' + i + '"]'); };

  function mezclar() {
    const ids = mision.acciones.map(function (a) { return a.id; });
    let lista;
    do {                                        // se revuelven hasta que NO queden ya en orden
      lista = ids.slice();
      for (let i = lista.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const x = lista[i]; lista[i] = lista[j]; lista[j] = x;
      }
    } while (Secuencia.validar(mision, lista).ok);
    return lista;
  }

  /* ---- Dibujar ---- */
  function dibujar() {
    let html = "";
    huecos.forEach(function (id, i) {
      html += '<li class="paso"><button type="button" class="casilla hueco ' + (id ? "lleno" : "vacia") + '" data-i="' + i + '"' +
              (id ? ' data-id="' + id + '"' : "") + ' aria-label="Paso ' + (i + 1) + ': ' + (id ? Secuencia.buscar(mision, id).nombre : "vacío") + '">' +
              (id ? dibujo(id) : "") + '<span class="num">' + (i + 1) + '</span></button></li>';
    });
    $("secuencia").innerHTML = html;

    html = "";
    bandeja.forEach(function (id) {
      html += '<button type="button" class="pieza-bandeja carta' + (seleccion === id ? " elegida" : "") + '" data-id="' + id +
              '" aria-label="' + Secuencia.buscar(mision, id).nombre + '">' + dibujo(id) + '</button>';
    });
    $("cartas").innerHTML = html;

    html = "";
    MISIONES.forEach(function (m, i) {
      html += '<li><button type="button" class="nivel-btn' + (i === indice ? " actual" : "") + (i < avance ? " hecho" : "") +
              '" data-nivel="' + i + '"' + (i > avance ? " disabled" : "") + ' aria-label="Misión ' + (i + 1) + '">' + (i + 1) + '</button></li>';
    });
    $("niveles").innerHTML = html;

    $("btn-ejecutar").hidden = terminado;
    $("btn-pista").hidden = terminado;
    $("btn-siguiente").hidden = !(terminado && indice < ULTIMO);
  }

  function reiniciarEscena() {
    $("objeto").innerHTML = mision.escena.inicio;
    $("objeto").classList.remove("pop");
    $("burbuja").hidden = true;
    $("pixel").classList.remove("salta", "sacude");
  }

  function cargarMision(i) {
    indice = i;
    mision = MISIONES[i];
    huecos = mision.acciones.map(function () { return null; });
    bandeja = mezclar();
    seleccion = null;
    terminado = false;
    $("consigna").textContent = mision.consigna;
    $("meta").innerHTML = mision.escena.final;
    $("confeti").innerHTML = "";
    reiniciarEscena();
    mensaje(MENSAJES.inicio);
    dibujar();
  }

  /* ---- Cambiar el orden ---- */
  function editar(cambio) {
    if (ejecutando) return;
    cambio();
    seleccion = null;
    reiniciarEscena();
    mensaje(MENSAJES.inicio);
    dibujar();
  }

  function poner(id, i) {                       // una tarjeta suelta va al paso i
    const previa = huecos[i];
    bandeja = bandeja.filter(function (x) { return x !== id; });
    if (previa) bandeja.push(previa);           // la que estaba vuelve a las tarjetas
    huecos[i] = id;
  }

  function quitar(i) {
    bandeja.push(huecos[i]);
    huecos[i] = null;
  }

  function tocar(el) {                          // un toque (o la tecla Enter)
    if (el.classList.contains("carta")) {
      seleccion = (seleccion === el.dataset.id) ? null : el.dataset.id;
      dibujar();
      return;
    }
    const i = +el.dataset.i;
    if (seleccion) { const id = seleccion; editar(function () { poner(id, i); }); }
    else if (huecos[i]) editar(function () { quitar(i); });
    else mensaje(MENSAJES.elige);
  }

  /* ---- Ejecutar ---- */
  function marcar(i) {
    $("secuencia").querySelectorAll(".hueco").forEach(function (h, k) { h.classList.toggle("activo", k === i); });
  }

  async function hacer(accion) {
    const burbuja = $("burbuja"), pixel = $("pixel");
    burbuja.className = "burbuja";
    burbuja.innerHTML = dibujo(accion.id);
    burbuja.hidden = false;
    pixel.classList.remove("salta"); void pixel.offsetWidth; pixel.classList.add("salta");
    tono([660]);
    await esperar(1100);
    burbuja.hidden = true;
  }

  async function fallar(i, faltaId) {            // el paso no se pudo hacer: se muestra qué faltaba
    paso(i).classList.add("choca");
    const burbuja = $("burbuja");
    burbuja.className = "burbuja duda";
    burbuja.innerHTML = dibujo(faltaId);
    burbuja.hidden = false;
    $("pixel").classList.add("sacude");
    document.querySelectorAll('[data-id="' + faltaId + '"]').forEach(function (x) { x.classList.add("pista"); });
    mensaje(MENSAJES.fallo);
    tono([330]);
  }

  async function ejecutar() {
    if (ejecutando || terminado) return;
    if (huecos.indexOf(null) !== -1) {
      huecos.forEach(function (id, i) { if (!id) paso(i).classList.add("pista"); });
      mensaje(MENSAJES.faltan);
      return;
    }
    dibujar();
    reiniciarEscena();
    ejecutando = true;
    $("panel").inert = true;

    const hechos = new Set();
    for (let i = 0; i < huecos.length; i++) {
      marcar(i);
      const accion = Secuencia.buscar(mision, huecos[i]);
      const falta = accion.pide.find(function (p) { return !hechos.has(p); });
      if (falta) {
        marcar(-1);
        await fallar(i, falta);
        ejecutando = false;
        $("panel").inert = false;
        return;
      }
      await hacer(accion);
      hechos.add(accion.id);
    }
    marcar(-1);
    ganar();
    ejecutando = false;
    $("panel").inert = false;
  }

  function ganar() {
    terminado = true;
    avance = Math.max(avance, indice + 1);
    guardar("secuenciaAvance", avance);
    $("objeto").innerHTML = mision.escena.final;
    $("objeto").classList.add("pop");
    $("pixel").classList.add("salta");
    mensaje(indice < ULTIMO ? MENSAJES.gana : MENSAJES.final);
    tono([523, 659, 784, 1047]);
    dibujar();

    const colores = ["#ffc933", "#e8574a", "#2e9e5b", "#1a5fb4", "#e8730f"];
    let html = "";
    for (let i = 0; i < 20; i++) {
      html += '<span class="pieza" style="left:' + Math.random() * 100 + '%;background:' + colores[i % 5] + ';animation-delay:' + (Math.random() * 0.7).toFixed(2) + 's"></span>';
    }
    $("confeti").innerHTML = html;
    setTimeout(function () { $("confeti").innerHTML = ""; }, 3200);
  }

  /* ---- Pista: orienta sin resolver todo ---- */
  function pedirPista() {
    if (ejecutando || terminado) return;
    const r = Secuencia.revisar(mision, huecos);
    dibujar();
    if (!r) { mensaje(MENSAJES.listo); return; }

    paso(r.indice).classList.add("pista");
    if (r.tipo === "falla") {                    // este paso necesita otro antes
      document.querySelectorAll('[data-id="' + r.falta + '"]').forEach(function (x) { x.classList.add("pista"); });
      mensaje(MENSAJES.pistaFalla);
    } else {                                     // este lugar está vacío: una tarjeta que sí puede ir aquí
      const sig = Secuencia.siguientes(mision, huecos.slice(0, r.indice), bandeja)[0];
      const carta = $("cartas").querySelector('[data-id="' + sig + '"]');
      if (carta) carta.classList.add("pista");
      mensaje(MENSAJES.pistaSigue);
    }
    $("meta").classList.add("pulsa");
    setTimeout(function () {
      $("meta").classList.remove("pulsa");
      document.querySelectorAll(".pista").forEach(function (x) { x.classList.remove("pista"); });
    }, 3000);
  }

  /* ---- Tocar o arrastrar (funciona con mouse y con el dedo) ---- */
  $("panel").addEventListener("pointerdown", function (e) {
    const el = e.target.closest(".carta, .hueco");
    if (!el || ejecutando || terminado) return;
    arrastre = { el: el, desde: el.classList.contains("carta") ? "carta" : "hueco", id: el.dataset.id || null,
                 i: el.dataset.i === undefined ? null : +el.dataset.i, x: e.clientX, y: e.clientY, clon: null };
    document.addEventListener("pointermove", mover);
    document.addEventListener("pointerup", soltar);
    document.addEventListener("pointercancel", soltar);
  });

  function mover(e) {
    if (!arrastre || !arrastre.id) return;       // un hueco vacío no se arrastra
    if (!arrastre.clon && Math.hypot(e.clientX - arrastre.x, e.clientY - arrastre.y) > 8) {
      arrastre.clon = document.createElement("div");
      arrastre.clon.className = "arrastrando";
      arrastre.clon.innerHTML = dibujo(arrastre.id);
      document.body.appendChild(arrastre.clon);
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

    if (!a.clon) { tocar(a.el); return; }        // fue un toque
    a.clon.remove();
    const bajo = e.type === "pointerup" ? document.elementFromPoint(e.clientX, e.clientY) : null;
    const destino = bajo && bajo.closest(".hueco");

    if (destino) {
      const i = +destino.dataset.i;
      editar(function () {
        if (a.desde === "carta") poner(a.id, i);
        else if (a.i !== i) { const t = huecos[i]; huecos[i] = huecos[a.i]; huecos[a.i] = t; }   // cambiar de lugar
      });
    } else if (a.desde === "hueco" && bajo && bajo.closest("#cartas")) {
      editar(function () { quitar(a.i); });
    } else {
      dibujar();
    }
  }

  // Teclado: Enter o espacio sobre una tarjeta o un paso
  $("panel").addEventListener("click", function (e) {
    if (e.detail !== 0) return;                  // los clics con mouse o dedo ya se manejan arriba
    const el = e.target.closest(".carta, .hueco");
    if (el && !ejecutando && !terminado) tocar(el);
  });

  $("btn-ejecutar").addEventListener("click", ejecutar);
  $("btn-pista").addEventListener("click", pedirPista);
  $("btn-reiniciar").addEventListener("click", function () { if (!ejecutando) cargarMision(indice); });
  $("btn-siguiente").addEventListener("click", function () { cargarMision(indice + 1); });
  $("niveles").addEventListener("click", function (e) {
    const boton = e.target.closest("[data-nivel]");
    if (boton && !ejecutando) cargarMision(+boton.dataset.nivel);
  });

  cargarMision(Math.min(avance, ULTIMO));
})();
