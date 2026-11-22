/* ==========================================================
   ¡Descubre qué sigue! - Lógica
   No toca la pantalla. La figura que corresponde en cada posición
   se CALCULA con la regla del desafío; no hay respuestas guardadas.
   ========================================================== */
const Patron = {
  valor(lista, k) { return lista[k % lista.length]; },

  // Figura que debe haber en la posición k según la regla
  esperado(nivel, k) {
    const r = nivel.regla;
    return {
      forma: this.valor(r.forma, k),
      color: r.color ? this.valor(r.color, k) : null,
      tam: r.tam ? this.valor(r.tam, k) : 5,
      giro: r.giro ? this.valor(r.giro, k) : 0
    };
  },

  normal(e) { return { forma: e.forma, color: e.color || null, tam: e.tam || 5, giro: e.giro || 0 }; },
  clave(e) { const n = this.normal(e); return [n.forma, n.color || "", n.tam, n.giro].join("|"); },
  igual(a, b) { return this.clave(a) === this.clave(b); },

  // Secuencia con la que empieza el desafío (null = lugar vacío)
  inicial(nivel) {
    const lista = [];
    for (let k = 0; k < nivel.largo; k++) {
      if (nivel.faltan && nivel.faltan.includes(k)) lista.push(null);
      else if (nivel.intruso && nivel.intruso.indice === k) lista.push(this.normal(nivel.intruso.item));
      else lista.push(this.esperado(nivel, k));
    }
    return lista;
  },

  // Piezas que se ofrecen: las figuras del patrón (sin repetir) y los distractores
  opciones(nivel) {
    const vistas = new Set(), lista = [], self = this;
    function agregar(e) { const c = self.clave(e); if (!vistas.has(c)) { vistas.add(c); lista.push(self.normal(e)); } }
    if (nivel.mecanica === "construye") nivel.faltan.forEach(function (k) { agregar(self.esperado(nivel, k)); });
    else for (let k = 0; k < nivel.largo; k++) agregar(this.esperado(nivel, k));
    (nivel.extra || []).forEach(agregar);
    if (nivel.intruso) agregar(nivel.intruso.item);
    return lista;
  },

  // Cuántas piezas de cada figura se necesitan (construye): { clave: cantidad }
  necesarias(nivel) {
    const cuenta = {};
    nivel.faltan.forEach(function (k) {
      const c = Patron.clave(Patron.esperado(nivel, k));
      cuenta[c] = (cuenta[c] || 0) + 1;
    });
    return cuenta;
  },

  // Posiciones cuya figura NO sigue la regla
  errores(nivel, secuencia) {
    const malas = [];
    for (let k = 0; k < secuencia.length; k++) {
      if (secuencia[k] && !this.igual(secuencia[k], this.esperado(nivel, k))) malas.push(k);
    }
    return malas;
  },

  // Completo = sin lugares vacíos Y toda la secuencia sigue la regla
  completo(nivel, secuencia) {
    return secuencia.every(function (e) { return e !== null; }) && this.errores(nivel, secuencia).length === 0;
  },

  // Cuántas figuras forman un ciclo que se repite (0 si el patrón no se repite, solo cambia)
  periodo(nivel) {
    const mcd = function (a, b) { return b ? mcd(b, a % b) : a; };
    let p = 1;
    ["forma", "color", "tam", "giro"].forEach(function (nombre) {
      const lista = nivel.regla[nombre];
      if (lista) p = p * lista.length / mcd(p, lista.length);
    });
    return p >= nivel.largo ? 0 : p;
  }
};
