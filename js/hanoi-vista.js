/* ==========================================================
   ¡La torre de los discos! - Vista
   Dibuja el juego, mueve los discos y muestra la demostración.
   Usa HANOI_NIVELES (datos) y Hanoi (reglas).
   ========================================================== */
(function () {
  const $ = function (id) { return document.getElementById(id); };
  const ULTIMO = HANOI_NIVELES.length - 1;

  const MENSAJES = {
    inicio: "Toca un disco y llévalo a otra varilla.",
    elige: "Toca la varilla que tiene el disco.",
    bien: "¡Muy bien!",
    noCabe: "Ahí no cabe: ¡hay un disco más pequeño!",
    soloArriba: "Solo se mueve el disco de arriba.",
    pistaTotal: "Mueve este disco a esa varilla.",
    pistaDisco: "Prueba con este disco.",
    gana: "¡Lo lograste! Toda la torre llegó.",
    deshecho: "Vuelve a intentarlo."
  };

  let indice = 0, nivel = null, n = 0;
  let torres = [], historial = [];
  let seleccion = null;                                   // varilla de donde se eligió el disco
  let terminado = false, arrastre = null, temporizador = null;
  let avance = leer("hanoiAvance", 0);                    // niveles superados (se recuerda en la sesión)

  const mensaje = function (texto) { $("mensaje").textContent = texto; };
  const ancho = function (id, total) { return total === 1 ? 90 : 40 + 50 * (id - 1) / (total - 1); };
  const disco = function (id) { return $("tablero").querySelector('.disco[data-id="' + id + '"]'); };
  const varilla = function (i) { return $("tablero").querySelector('[data-v="' + i + '"]'); };

  /* ---- Dibujar las tres varillas (lo usan el juego y la demostración) ---- */
  function pintar(cont, estado, total, paleta, sel, legales) {
    const colores = PALETAS_HANOI[paleta];
    cont.style.setProperty("--n", total);
    let html = "";
    estado.forEach(function (pila, i) {
      html += '<div class="varilla' + (legales && legales.indexOf(i) !== -1 ? " legal" : "") + '" data-v="' + i + '" role="button" tabindex="0" aria-label="Varilla ' +
              (i + 1) + (i === 2 ? ", la meta" : "") + ", " + pila.length + ' discos">' + (i === 2 ? '<span class="marca-meta"></span>' : "");
      pila.forEach(function (id, k) {
        html += '<div class="disco' + (sel === i && k === pila.length - 1 ? " elegido" : "") + '" data-id="' + id + '" style="--w:' + ancho(id, total) + ';--c:' + colores[id - 1] + '"></div>';
      });
      html += "</div>";
    });
    cont.innerHTML = html;
  }

  function dibujarNiveles() {
    let html = "";
    HANOI_NIVELES.forEach(function (x, i) {
      html += '<li><button type="button" class="nivel-btn' + (i === indice ? " actual" : "") + (i < avance ? " hecho" : "") + '" data-nivel="' + i + '"' +
              (i > avance ? " disabled" : "") + ' aria-label="Nivel ' + (i + 1) + '">' + (i + 1) + '</button></li>';
    });
    $("niveles").innerHTML = html;
  }

  function dibujar() {
    pintar($("tablero"), torres, n, nivel.paleta, seleccion, seleccion === null ? [] : Hanoi.destinos(torres, seleccion));

    dibujarNiveles();

    $("btn-deshacer").disabled = terminado || historial.length === 0;
    $("btn-pista").hidden = terminado;
    $("btn-siguiente").hidden = !(terminado && indice < ULTIMO);
  }

  function cargarNivel(i) {
    indice = i;
    nivel = HANOI_NIVELES[i];
    n = nivel.discos;
    torres = Hanoi.inicial(n);
    historial = [];
    seleccion = null;
    terminado = false;
    clearTimeout(temporizador);
    $("pixel").classList.remove("salta");
    $("confeti").innerHTML = "";
    mensaje(MENSAJES.inicio);
    dibujar();
  }

  /* ---- Mover un disco (con animación suave) ---- */
  function mover(de, a, desdeRect) {
    const nueva = Hanoi.mover(torres, de, a);
    if (!nueva) return false;
    const id = Hanoi.cima(torres, de);
    const antes = desdeRect || disco(id).getBoundingClientRect();

    historial.push(torres);
    torres = nueva;
    seleccion = null;
    dibujar();

    const el = disco(id), despues = el.getBoundingClientRect();
    el.style.transition = "none";
    el.style.transform = "translate(" + (antes.left - despues.left) + "px," + (antes.top - despues.top) + "px)";
    void el.offsetWidth;
    el.style.transition = "transform 0.4s ease";
    el.style.transform = "";
    el.classList.add("encaja");
    tono([660]);

    if (Hanoi.gano(torres, n)) ganar();
    else mensaje(MENSAJES.bien);
    return true;
  }

  // Movimiento no permitido: el disco se sacude y se ve qué lo detiene (sin castigo)
  function noCabe(de, a) {
    const quieto = disco(Hanoi.cima(torres, de));
    if (quieto) { quieto.classList.remove("sacude"); void quieto.offsetWidth; quieto.classList.add("sacude"); }
    const bloquea = Hanoi.cima(torres, a);
    if (bloquea !== null) disco(bloquea).classList.add("pista");
    mensaje(MENSAJES.noCabe);
    seleccion = null;
    clearTimeout(temporizador);
    temporizador = setTimeout(dibujar, 900);
  }

  function ganar() {
    terminado = true;
    avance = Math.max(avance, indice + 1);
    guardar("hanoiAvance", avance);
    mensaje(MENSAJES.gana);
    tono([523, 659, 784, 1047]);
    $("pixel").classList.add("salta");
    $("btn-pista").hidden = true;
    $("btn-deshacer").disabled = true;
    if (indice < ULTIMO) $("btn-siguiente").hidden = false;
    dibujarNiveles();                                     // se desbloquea el siguiente nivel
    confeti($("confeti"));
    if (indice === ULTIMO) setTimeout(function () { $("final").showModal(); confeti($("final-confeti")); }, 1200);
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

  /* ---- Tocar una varilla ---- */
  function tocarVarilla(i) {
    if (terminado) return;
    if (seleccion === null) {
      if (!torres[i].length) { mensaje(MENSAJES.elige); return; }
      seleccion = i;
      mensaje(MENSAJES.inicio);
      dibujar();
    } else if (seleccion === i) {                         // volver a tocar: se suelta el disco
      seleccion = null;
      dibujar();
    } else if (Hanoi.puede(torres, seleccion, i)) {
      mover(seleccion, i);
    } else {
      noCabe(seleccion, i);
    }
  }

  /* ---- Tocar o arrastrar (funciona con mouse y con el dedo) ---- */
  $("tablero").addEventListener("pointerdown", function (e) {
    const rod = e.target.closest(".varilla");
    if (!rod || terminado) return;
    const de = +rod.dataset.v, el = e.target.closest(".disco");
    const esCima = !!el && +el.dataset.id === Hanoi.cima(torres, de);
    arrastre = { de: de, el: esCima ? el : null, x: e.clientX, y: e.clientY, clon: null };
    document.addEventListener("pointermove", moverPuntero);
    document.addEventListener("pointerup", soltar);
    document.addEventListener("pointercancel", soltar);
  });

  function moverPuntero(e) {
    if (!arrastre || !arrastre.el) return;                // solo se arrastra el disco de arriba
    if (!arrastre.clon && Math.hypot(e.clientX - arrastre.x, e.clientY - arrastre.y) > 8) {
      const r = arrastre.el.getBoundingClientRect();
      arrastre.rect = r;
      arrastre.clon = arrastre.el.cloneNode(false);
      arrastre.clon.className = "disco disco-clon";
      arrastre.clon.style.width = r.width + "px";
      arrastre.clon.style.height = r.height + "px";
      document.body.appendChild(arrastre.clon);
      arrastre.el.classList.add("arrastrado");
      seleccion = arrastre.de;
      dibujarLegales();
    }
    if (arrastre.clon) { arrastre.clon.style.left = e.clientX + "px"; arrastre.clon.style.top = e.clientY + "px"; }
  }

  function dibujarLegales() {                             // se resaltan las varillas donde sí cabe, sin redibujar el disco
    Hanoi.destinos(torres, seleccion).forEach(function (i) { varilla(i).classList.add("legal"); });
  }

  function soltar(e) {
    document.removeEventListener("pointermove", moverPuntero);
    document.removeEventListener("pointerup", soltar);
    document.removeEventListener("pointercancel", soltar);
    if (!arrastre) return;
    const a = arrastre;
    arrastre = null;

    if (!a.clon) {                                        // fue un toque
      const habia = seleccion;
      tocarVarilla(a.de);
      if (!a.el && habia === null && torres[a.de].length) mensaje(MENSAJES.soloArriba);
      return;
    }
    const bajo = e.type === "pointerup" ? document.elementFromPoint(e.clientX, e.clientY) : null;
    const rod = bajo && bajo.closest(".varilla");
    const destino = rod ? +rod.dataset.v : null;

    if (destino !== null && Hanoi.puede(torres, a.de, destino)) {
      a.clon.remove();
      mover(a.de, destino, a.clon.getBoundingClientRect());
    } else {                                              // regresa suavemente a su lugar
      a.clon.style.transition = "left 0.3s ease, top 0.3s ease";
      a.clon.style.left = (a.rect.left + a.rect.width / 2) + "px";
      a.clon.style.top = (a.rect.top + a.rect.height / 2) + "px";
      setTimeout(function () { a.clon.remove(); }, 320);
      seleccion = null;
      if (destino !== null && destino !== a.de) noCabe(a.de, destino); else dibujar();
    }
  }

  $("tablero").addEventListener("click", function (e) {   // solo teclado: los toques ya se manejan arriba
    if (e.detail !== 0) return;
    const rod = e.target.closest(".varilla");
    if (rod) tocarVarilla(+rod.dataset.v);
  });

  /* ---- Botones ---- */
  $("btn-deshacer").addEventListener("click", function () {
    if (!historial.length || terminado) return;
    torres = historial.pop();
    seleccion = null;
    mensaje(MENSAJES.deshecho);
    dibujar();
  });

  $("btn-reiniciar").addEventListener("click", function () { cargarNivel(indice); });
  $("btn-siguiente").addEventListener("click", function () { cargarNivel(indice + 1); });
  $("niveles").addEventListener("click", function (e) {
    const boton = e.target.closest("[data-nivel]");
    if (boton) cargarNivel(+boton.dataset.nivel);
  });

  // Pista: orienta con el mejor siguiente movimiento desde donde está el niño, sin moverlo por él
  $("btn-pista").addEventListener("click", function () {
    if (terminado) return;
    const paso = Hanoi.siguientePaso(torres, n);
    if (!paso) return;
    seleccion = null;
    dibujar();
    disco(Hanoi.cima(torres, paso.de)).classList.add("pista");
    if (nivel.ayuda === "total") { varilla(paso.a).classList.add("pista-destino"); mensaje(MENSAJES.pistaTotal); }
    else mensaje(MENSAJES.pistaDisco);
    clearTimeout(temporizador);
    temporizador = setTimeout(function () { if (!terminado) dibujar(); }, 3500);
  });

  $("btn-otra-vez").addEventListener("click", function () {
    $("final").close();
    cargarNivel(0);
  });

  /* ================= Cómo se juega: demostración animada ================= */
  const PASOS = [
    "1. Toca el disco de arriba.",
    "2. Toca otra varilla para llevarlo.",
    "3. El disco grande no va sobre el pequeño.",
    "4. Lleva toda la torre a la varilla de la estrella."
  ];
  let pasoDemo = 0, tokenDemo = 0, relojDemo = null;
  const demoPausa = function (ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); };

  function ponerSobre(elemento, i, alto) {                // coloca el aro de "toque" sobre una varilla
    const caja = $("demo").parentElement.getBoundingClientRect(), r = varillaDemo(i).getBoundingClientRect();
    elemento.style.left = (r.left - caja.left + r.width / 2) + "px";
    elemento.style.top = (r.top - caja.top + r.height * alto) + "px";
    elemento.hidden = false;
  }
  const varillaDemo = function (i) { return $("demo").querySelector('[data-v="' + i + '"]'); };
  const pintarDemo = function (estado, sel, legales) { pintar($("demo"), estado, 2, 0, sel, legales); };

  async function reproducir(paso) {
    const token = ++tokenDemo;
    const vivo = function () { return token === tokenDemo; };
    pasoDemo = paso;
    $("demo-texto").textContent = PASOS[paso];
    $("demo-puntos").innerHTML = PASOS.map(function (x, i) { return '<li class="demo-punto' + (i === paso ? " activo" : "") + '"></li>'; }).join("");
    $("toque").hidden = true; $("signo").hidden = true; $("demo-confeti").innerHTML = "";

    if (paso === 0) {
      pintarDemo([[2, 1], [], []], null, []);
      await demoPausa(700); if (!vivo()) return;
      ponerSobre($("toque"), 0, 0.45);
      await demoPausa(900); if (!vivo()) return;
      pintarDemo([[2, 1], [], []], 0, []);
    } else if (paso === 1) {
      pintarDemo([[2, 1], [], []], 0, [1, 2]);
      await demoPausa(700); if (!vivo()) return;
      ponerSobre($("toque"), 1, 0.7);
      await demoPausa(1100); if (!vivo()) return;
      $("toque").hidden = true;
      pintarDemo([[2], [1], []], null, []);
    } else if (paso === 2) {
      pintarDemo([[2], [1], []], null, []);
      await demoPausa(600); if (!vivo()) return;
      ponerSobre($("toque"), 0, 0.7);
      await demoPausa(800); if (!vivo()) return;
      pintarDemo([[2], [1], []], 0, []);
      ponerSobre($("toque"), 1, 0.7);
      await demoPausa(900); if (!vivo()) return;
      $("toque").hidden = true;
      ponerSobre($("signo"), 1, 0.5);
      const grande = $("demo").querySelector('.disco[data-id="2"]'), chico = $("demo").querySelector('.disco[data-id="1"]');
      grande.classList.add("sacude"); chico.classList.add("pista");
    } else {
      pintarDemo([[], [], [2, 1]], null, []);
      confeti($("demo-confeti"));
    }
    clearTimeout(relojDemo);                              // avanza sola y vuelve a empezar
    relojDemo = setTimeout(function () { if (vivo()) reproducir((paso + 1) % PASOS.length); }, 4300);
  }

  function abrirTutorial() {
    $("tutorial").showModal();
    reproducir(0);
  }

  $("tutorial").addEventListener("close", function () { tokenDemo++; clearTimeout(relojDemo); guardar("hanoiIntro", true); });
  $("btn-como").addEventListener("click", abrirTutorial);
  $("demo-atras").addEventListener("click", function () { reproducir((pasoDemo + PASOS.length - 1) % PASOS.length); });
  $("demo-sig").addEventListener("click", function () { reproducir((pasoDemo + 1) % PASOS.length); });

  /* ---- Arranque ---- */
  cargarNivel(Math.min(avance, ULTIMO));
  if (!leer("hanoiIntro", false)) abrirTutorial();         // la primera vez se muestra sola
})();
