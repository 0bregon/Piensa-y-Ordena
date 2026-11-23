/* ==========================================================
   ¡Construye al robot! - Vista
   Dibuja el taller, mueve las piezas y muestra la demostración.
   Usa ROBOTS (datos), Robot (reglas) y formaSVG (dibujos).
   ========================================================== */
(function () {
  const $ = function (id) { return document.getElementById(id); };
  const ULTIMO = ROBOTS.length - 1;
  const MARGEN = 6;                                       // tolerancia al soltar, en unidades del lienzo
  const CERCA = 22;                                       // a esta distancia se ilumina el lugar correcto

  const MENSAJES = {
    inicio: "Arma el robot con las piezas.",
    bien: "¡Encaja!",
    otroLugar: "Esa pieza va en otro lugar.",
    sobra: "¡Bien! Esa pieza sobra.",
    seUsa: "Esa pieza sí se usa. ¡Búscale su lugar!",
    elige: "Toca una pieza y luego un lugar.",
    pista: "Mira dónde va esta pieza.",
    gana: "¡El robot cobró vida!",
    final: "¡Construiste los 10 robots!"
  };

  let indice = 0, nivel = null;
  let piezas = {}, bandeja = [], caja = [], llenas = {};   // piezas por uid, piezas sueltas, sobrantes guardados, lugares ocupados
  let seleccion = null, terminado = false, arrastre = null, temporizador = null;
  let avance = leer("robotAvance", 0);                     // niveles superados (se recuerda en la sesión)

  const mensaje = function (texto) { $("mensaje").textContent = texto; };
  const ranura = function (id) { return $("lienzo").querySelector('[data-id="' + id + '"]'); };
  const colorMolde = function (p) { return p.color === BLANCO ? "#8a9bb0" : p.color; };

  /* ---- Dibujar ---- */
  function moldeAtributos(guia, p) {
    if (guia === "color") return 'fill="' + colorMolde(p) + '" fill-opacity="0.25" stroke="' + colorMolde(p) + '" stroke-width="2.5" stroke-dasharray="5 4"';
    if (guia === "forma") return 'fill="#cfd8e3" fill-opacity="0.6" stroke="#7b8ea3" stroke-width="2" stroke-dasharray="5 4"';
    return 'fill="#12294a" fill-opacity="0.16" stroke="none"';       // contorno: solo la silueta, sin separar las partes
  }

  function lienzoHTML(nv, ocupadas) {
    let html = '<svg id="lienzo" class="lienzo" viewBox="0 0 200 240" role="group" aria-label="Robot en construcción">';
    nv.partes.forEach(function (p) {
      const lleno = ocupadas[p.id];
      html += '<g class="ranura' + (lleno ? " llena" : "") + (lleno === "fija" ? " fija" : "") + '" data-id="' + p.id + '" tabindex="' + (lleno === "fija" ? -1 : 0) +
              '" role="button" aria-label="' + (lleno ? "Pieza puesta" : "Lugar vacío") + '">' +
              formaSVG(p, lleno ? 'class="pieza-puesta" fill="' + p.color + '" ' + TRAZO_ROBOT : 'class="molde" ' + moldeAtributos(nv.guia, p)) + "</g>";
    });
    return html + "</svg>";
  }

  function ladoFicha(nv) {                                  // cuadro común: así se ve el tamaño real de cada pieza
    let m = 0;
    nv.partes.concat(nv.sobrantes).forEach(function (p) { m = Math.max(m, p.w, p.h); });
    return m + 8;
  }

  function fichaHTML(uid, lado) {
    const p = piezas[uid];
    return '<button type="button" class="pieza-bandeja ficha' + (seleccion === uid ? " elegida" : "") + '" data-uid="' + uid + '" data-clave="' + Robot.clave(p) +
           '" aria-label="Pieza: ' + p.forma + '">' + fichaSVG(p, lado) + "</button>";
  }

  function dibujar() {
    $("taller").querySelector("svg") && $("taller").querySelector("svg").remove();
    $("taller").insertAdjacentHTML("afterbegin", lienzoHTML(nivel, llenas));
    $("taller").classList.toggle("vivo", terminado);
    $("modelo").hidden = nivel.modelo !== true;
    $("modelo").innerHTML = modeloSVG(nivel);

    const lado = ladoFicha(nivel);
    $("bandeja").innerHTML = bandeja.map(function (u) { return fichaHTML(u, lado); }).join("");
    $("caja").hidden = nivel.sobrantes.length === 0;
    $("caja-piezas").innerHTML = caja.map(function (u) { return fichaHTML(u, lado); }).join("");

    const total = nivel.partes.length - nivel.fijas.length;
    const puestas = nivel.partes.filter(function (p) { return llenas[p.id] && llenas[p.id] !== "fija"; }).length;
    let barra = "";
    for (let i = 0; i < total; i++) barra += '<span class="' + (i < puestas ? "lleno" : "") + '"></span>';
    $("progreso").innerHTML = barra;
    $("progreso").setAttribute("aria-label", "Piezas puestas: " + puestas + " de " + total);

    let html = "";
    ROBOTS.forEach(function (x, i) {
      html += '<li><button type="button" class="nivel-btn' + (i === indice ? " actual" : "") + (i < avance ? " hecho" : "") + '" data-nivel="' + i + '"' +
              (i > avance ? " disabled" : "") + ' aria-label="Robot ' + (i + 1) + '">' + (i + 1) + "</button></li>";
    });
    $("niveles").innerHTML = html;

    $("btn-pista").hidden = terminado;
    $("btn-siguiente").hidden = !(terminado && indice < ULTIMO);
  }

  function cargarNivel(i) {
    indice = i;
    nivel = ROBOTS[i];
    piezas = {};
    Robot.piezasDelNivel(nivel).forEach(function (p) { piezas[p.uid] = p; });
    llenas = {};
    nivel.fijas.forEach(function (id) { llenas[id] = "fija"; });
    bandeja = Object.keys(piezas);
    for (let j = bandeja.length - 1; j > 0; j--) {                       // las piezas se revuelven
      const r = Math.floor(Math.random() * (j + 1)), x = bandeja[j]; bandeja[j] = bandeja[r]; bandeja[r] = x;
    }
    caja = [];
    seleccion = null;
    terminado = false;
    clearTimeout(temporizador);
    $("pixel").classList.remove("salta");
    $("confeti").innerHTML = "";
    mensaje(MENSAJES.inicio);
    dibujar();
  }

  /* ---- Colocar piezas ---- */
  function avisarOtroLugar(id) {                                         // suave: el lugar se sacude, nada más
    const g = ranura(id);
    if (g) { g.classList.add("sacude"); setTimeout(function () { g.classList.remove("sacude"); }, 600); }
    mensaje(MENSAJES.otroLugar);
  }

  function colocar(uid, id) {
    const parte = nivel.partes.find(function (p) { return p.id === id; });
    if (!parte || llenas[id] || terminado) return false;
    if (!Robot.acepta(parte, piezas[uid])) { seleccion = null; dibujar(); avisarOtroLugar(id); return false; }

    bandeja = bandeja.filter(function (x) { return x !== uid; });
    llenas[id] = uid;
    seleccion = null;
    dibujar();
    ranura(id).querySelector(".pieza-puesta").classList.add("encaja");
    tono([660, 880]);
    if (Robot.completo(nivel, llenas)) ganar(); else mensaje(MENSAJES.bien);
    return true;
  }

  function quitar(id) {                                                  // la pieza vuelve a la bandeja
    bandeja.push(llenas[id]);
    delete llenas[id];
    mensaje(MENSAJES.inicio);
    dibujar();
  }

  function guardarEnCaja(uid) {                                          // solo las piezas sobrantes van a la caja
    seleccion = null;
    if (!piezas[uid].sobrante) { mensaje(MENSAJES.seUsa); dibujar(); return; }
    bandeja = bandeja.filter(function (x) { return x !== uid; });
    caja.push(uid);
    mensaje(MENSAJES.sobra);
    tono([523]);
    dibujar();
  }

  function ganar() {
    terminado = true;
    clearTimeout(temporizador);
    avance = Math.max(avance, indice + 1);
    guardar("robotAvance", avance);
    dibujar();
    mensaje(indice < ULTIMO ? MENSAJES.gana : MENSAJES.final);
    $("pixel").classList.add("salta");
    tono([523, 659, 784, 1047]);
    confeti($("confeti"));
    if (indice === ULTIMO) setTimeout(function () { $("final").showModal(); confeti($("final-confeti")); }, 1800);
  }

  function confeti(cont) {
    const colores = ["#ffc933", "#e8574a", "#2e9e5b", "#1a5fb4", "#e8730f"];
    let html = "";
    for (let i = 0; i < 20; i++) {
      html += '<span class="pieza" style="left:' + Math.random() * 100 + '%;background:' + colores[i % 5] + ';animation-delay:' + (Math.random() * 0.7).toFixed(2) + 's"></span>';
    }
    cont.innerHTML = html;
    setTimeout(function () { cont.innerHTML = ""; }, 3200);
  }

  // Pista: muestra UN lugar y la pieza que le corresponde, sin colocarla
  function pedirPista() {
    if (terminado) return;
    const hueco = nivel.partes.find(function (p) {
      return !llenas[p.id] && bandeja.some(function (u) { return Robot.acepta(p, piezas[u]); });
    });
    if (!hueco) return;
    const uid = bandeja.find(function (u) { return Robot.acepta(hueco, piezas[u]); });
    seleccion = null;
    dibujar();
    ranura(hueco.id).classList.add("pista");
    $("bandeja").querySelector('[data-uid="' + uid + '"]').classList.add("pista");
    mensaje(MENSAJES.pista);
    if (nivel.modelo === "pista") $("modelo").hidden = false;           // en el nivel 9 el modelo solo aparece con la pista
    clearTimeout(temporizador);
    temporizador = setTimeout(function () { if (!terminado) dibujar(); }, 3500);
  }

  /* ---- Tocar o arrastrar una pieza (funciona con mouse y con el dedo) ---- */
  function aLienzo(cx, cy) {
    const svg = $("lienzo"), m = svg.getScreenCTM();
    if (!m) return { x: -999, y: -999 };
    const pt = svg.createSVGPoint(); pt.x = cx; pt.y = cy;
    return pt.matrixTransform(m.inverse());
  }

  function quitarCerca() { $("lienzo").querySelectorAll(".cerca").forEach(function (g) { g.classList.remove("cerca"); }); }

  $("bandeja").addEventListener("pointerdown", empezar);
  $("caja-piezas").addEventListener("pointerdown", empezar);

  function empezar(e) {
    const ficha = e.target.closest(".ficha");
    if (!ficha || terminado) return;
    arrastre = { uid: ficha.dataset.uid, x: e.clientX, y: e.clientY, clon: null, desdeCaja: !!ficha.closest("#caja-piezas") };
    document.addEventListener("pointermove", mover);
    document.addEventListener("pointerup", soltar);
    document.addEventListener("pointercancel", soltar);
  }

  function mover(e) {
    if (!arrastre) return;
    if (!arrastre.clon && Math.hypot(e.clientX - arrastre.x, e.clientY - arrastre.y) > 8) {
      arrastre.clon = document.createElement("div");
      arrastre.clon.className = "arrastrando";
      arrastre.clon.innerHTML = fichaSVG(piezas[arrastre.uid], ladoFicha(nivel));
      document.body.appendChild(arrastre.clon);
    }
    if (!arrastre.clon) return;
    arrastre.clon.style.left = e.clientX + "px";
    arrastre.clon.style.top = e.clientY + "px";

    quitarCerca();                                                      // se ilumina suavemente el lugar correcto cuando la pieza se acerca
    const p = aLienzo(e.clientX, e.clientY);
    const cerca = Robot.buscar(nivel, llenas, piezas[arrastre.uid], p.x, p.y, CERCA);
    if (cerca) ranura(cerca.id).classList.add("cerca");
    const bajoPuntero = document.elementFromPoint(e.clientX, e.clientY);
    $("caja").classList.toggle("cerca", !!bajoPuntero && !!bajoPuntero.closest("#caja"));
  }

  function soltar(e) {
    document.removeEventListener("pointermove", mover);
    document.removeEventListener("pointerup", soltar);
    document.removeEventListener("pointercancel", soltar);
    if (!arrastre) return;
    const a = arrastre;
    arrastre = null;
    quitarCerca();
    $("caja").classList.remove("cerca");

    if (!a.clon) {                                                      // fue un toque
      if (a.desdeCaja) { caja = caja.filter(function (x) { return x !== a.uid; }); bandeja.push(a.uid); mensaje(MENSAJES.inicio); dibujar(); }
      else { seleccion = (seleccion === a.uid) ? null : a.uid; dibujar(); }
      return;
    }

    const clon = a.clon;
    const bajo = e.type === "pointerup" ? document.elementFromPoint(e.clientX, e.clientY) : null;
    const p = aLienzo(e.clientX, e.clientY);
    const destino = Robot.buscar(nivel, llenas, piezas[a.uid], p.x, p.y, MARGEN);

    if (bajo && bajo.closest("#caja") && nivel.sobrantes.length > 0) {
      clon.remove();
      if (a.desdeCaja) dibujar(); else guardarEnCaja(a.uid);
    } else if (destino) {
      clon.remove();
      if (a.desdeCaja) { caja = caja.filter(function (x) { return x !== a.uid; }); bandeja.push(a.uid); }
      colocar(a.uid, destino.id);
    } else {                                                            // regresa suavemente a la bandeja
      const otro = Robot.lugarBajo(nivel, llenas, p.x, p.y, MARGEN);
      const ficha = document.querySelector('.ficha[data-uid="' + a.uid + '"]');
      if (ficha) {
        const r = ficha.getBoundingClientRect();
        clon.style.transition = "left 0.3s ease, top 0.3s ease";
        clon.style.left = (r.left + r.width / 2) + "px";
        clon.style.top = (r.top + r.height / 2) + "px";
      }
      setTimeout(function () { clon.remove(); }, 320);
      if (otro) avisarOtroLugar(otro.id);
    }
  }

  /* ---- Tocar un lugar del robot ---- */
  function tocarLugar(g) {
    const id = g.dataset.id;
    if (terminado || g.classList.contains("fija")) return;
    if (seleccion !== null) colocar(seleccion, id);
    else if (llenas[id]) quitar(id);
    else mensaje(MENSAJES.elige);
  }

  $("taller").addEventListener("click", function (e) {
    const g = e.target.closest(".ranura");
    if (!g || terminado) return;
    if (seleccion !== null && e.detail !== 0) {            // con un toque se busca el lugar por su forma, aunque otra parte pequeña quede encima
      const p = aLienzo(e.clientX, e.clientY);
      const destino = Robot.buscar(nivel, llenas, piezas[seleccion], p.x, p.y, 0);
      if (destino) { colocar(seleccion, destino.id); return; }
    }
    tocarLugar(g);
  });
  $("taller").addEventListener("keydown", function (e) {
    const g = e.target.closest && e.target.closest(".ranura");
    if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); tocarLugar(g); }
  });

  $("caja").addEventListener("click", function (e) {                    // tocar la caja con una pieza elegida
    if (e.target.closest(".ficha") || seleccion === null || terminado) return;
    guardarEnCaja(seleccion);
  });

  [$("bandeja"), $("caja-piezas")].forEach(function (c) {               // solo teclado: los toques ya se manejan arriba
    c.addEventListener("click", function (e) {
      if (e.detail !== 0) return;
      const ficha = e.target.closest(".ficha");
      if (ficha && !terminado) { seleccion = (seleccion === ficha.dataset.uid) ? null : ficha.dataset.uid; dibujar(); }
    });
  });

  /* ---- Botones ---- */
  $("btn-pista").addEventListener("click", pedirPista);
  $("btn-reiniciar").addEventListener("click", function () { cargarNivel(indice); });
  $("btn-siguiente").addEventListener("click", function () { cargarNivel(indice + 1); });
  $("niveles").addEventListener("click", function (e) {
    const boton = e.target.closest("[data-nivel]");
    if (boton) cargarNivel(+boton.dataset.nivel);
  });
  $("btn-otra-vez").addEventListener("click", function () { $("final").close(); cargarNivel(0); });

  /* ================= Cómo se juega: demostración animada ================= */
  const PASOS = [
    "1. Toca una pieza.",
    "2. Arrástrala hasta el robot.",
    "3. Encaja en su lugar.",
    "4. ¡Completa el robot y cobra vida!"
  ];
  const demoNivel = Object.assign({}, ROBOTS[0], { fijas: ["cuerpo", "piernaI", "piernaD"] });
  const demoPieza = { forma: "cuadrado", w: 60, h: 60, color: AZUL, giro: 0 };
  let pasoDemo = 0, tokenDemo = 0, relojDemo = null;
  const demoPausa = function (ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); };
  const demoFicha = function (elegida) {
    return '<button type="button" class="pieza-bandeja ficha' + (elegida ? " elegida" : "") + '" tabindex="-1">' + fichaSVG(demoPieza, 68) + "</button>";
  };
  const centro = function (el) { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };

  function pintarDemo(llenasDemo, mostrarFicha, elegida) {
    $("demo-taller").innerHTML = lienzoHTML(demoNivel, llenasDemo).replace('id="lienzo"', 'id="demo-lienzo"');
    $("demo-bandeja").innerHTML = mostrarFicha ? demoFicha(elegida) : "";
  }

  function ponerAro(el) {
    const caja = $("demo").getBoundingClientRect(), c = centro(el);
    $("toque").style.left = (c.x - caja.left) + "px";
    $("toque").style.top = (c.y - caja.top) + "px";
    $("toque").hidden = false;
  }

  async function reproducir(paso) {
    const token = ++tokenDemo;
    const vivo = function () { return token === tokenDemo; };
    pasoDemo = paso;
    $("demo-texto").textContent = PASOS[paso];
    $("demo-puntos").innerHTML = PASOS.map(function (x, i) { return '<li class="demo-punto' + (i === paso ? " activo" : "") + '"></li>'; }).join("");
    $("toque").hidden = true;
    $("demo-confeti").innerHTML = "";
    $("demo-taller").classList.remove("vivo");
    document.querySelectorAll("#tutorial .arrastrando").forEach(function (x) { x.remove(); });
    const parcial = { cuerpo: "fija", piernaI: "fija", piernaD: "fija" };

    if (paso === 0) {
      pintarDemo(parcial, true, false);
      await demoPausa(700); if (!vivo()) return;
      ponerAro($("demo-bandeja").firstChild);
      await demoPausa(900); if (!vivo()) return;
      pintarDemo(parcial, true, true);
    } else if (paso === 1) {
      pintarDemo(parcial, true, true);
      await demoPausa(500); if (!vivo()) return;
      const clon = document.createElement("div");
      clon.className = "arrastrando";
      clon.innerHTML = fichaSVG(demoPieza, 68);
      const origen = centro($("demo-bandeja").firstChild), meta = centro($("demo-lienzo").querySelector('[data-id="cabeza"]'));
      clon.style.left = origen.x + "px"; clon.style.top = origen.y + "px";
      $("tutorial").appendChild(clon);
      void clon.offsetWidth;
      clon.style.transition = "left 1.2s ease, top 1.2s ease";
      clon.style.left = meta.x + "px"; clon.style.top = meta.y + "px";
      await demoPausa(1500); if (!vivo()) return;
      clon.remove();
    } else if (paso === 2) {
      pintarDemo(parcial, true, false);
      await demoPausa(500); if (!vivo()) return;
      pintarDemo(Object.assign({ cabeza: "x" }, parcial), false, false);
      $("demo-lienzo").querySelector('[data-id="cabeza"] .pieza-puesta').classList.add("encaja");
      tono([660, 880]);
    } else {
      pintarDemo(Object.assign({ cabeza: "x" }, parcial), false, false);
      $("demo-taller").classList.add("vivo");
      confeti($("demo-confeti"));
    }
    clearTimeout(relojDemo);                                            // avanza sola y vuelve a empezar
    relojDemo = setTimeout(function () { if (vivo()) reproducir((paso + 1) % PASOS.length); }, 4300);
  }

  function abrirTutorial() { $("tutorial").showModal(); reproducir(0); }

  $("tutorial").addEventListener("close", function () {
    tokenDemo++;
    clearTimeout(relojDemo);
    document.querySelectorAll("#tutorial .arrastrando").forEach(function (x) { x.remove(); });
    guardar("robotIntro", true);
  });
  $("btn-como").addEventListener("click", abrirTutorial);
  $("demo-atras").addEventListener("click", function () { reproducir((pasoDemo + PASOS.length - 1) % PASOS.length); });
  $("demo-sig").addEventListener("click", function () { reproducir((pasoDemo + 1) % PASOS.length); });

  /* ---- Arranque ---- */
  cargarNivel(Math.min(avance, ULTIMO));
  if (!leer("robotIntro", false)) abrirTutorial();                      // la primera vez se muestra sola
})();
