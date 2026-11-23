/* ==========================================================
   ¡Construye al robot! - Lógica
   No toca la pantalla. Una pieza encaja en un lugar solo si tiene
   la misma forma, tamaño, color y giro que ese lugar.
   "llenas" dice qué lugares ya tienen pieza: { idDelLugar: uidDeLaPieza }.
   ========================================================== */
const Robot = {
  clave(p) { return [p.forma, p.w, p.h, p.color, p.giro || 0].join("|"); },

  acepta(parte, pieza) { return this.clave(parte) === this.clave(pieza); },

  // Distancia desde el punto (x, y) hasta la caja de la parte (0 si está dentro)
  distancia(p, x, y) {
    const dx = Math.max(p.x - x, 0, x - (p.x + p.w)), dy = Math.max(p.y - y, 0, y - (p.y + p.h));
    return Math.hypot(dx, dy);
  },

  // Las piezas que el niño debe manejar: las partes que no vienen puestas y las sobrantes
  piezasDelNivel(nivel) {
    const lista = [];
    nivel.partes.forEach(function (p) {
      if (nivel.fijas.indexOf(p.id) === -1) lista.push({ uid: "p-" + p.id, forma: p.forma, w: p.w, h: p.h, color: p.color, giro: p.giro, sobrante: false });
    });
    nivel.sobrantes.forEach(function (p, i) {
      lista.push({ uid: "s-" + i, forma: p.forma, w: p.w, h: p.h, color: p.color, giro: p.giro, sobrante: true });
    });
    return lista;
  },

  // El lugar vacío que recibe la pieza soltada en (x, y); entre varios, el más pequeño (un ojo antes que la cabeza)
  buscar(nivel, llenas, pieza, x, y, margen) {
    let mejor = null;
    const self = this;
    nivel.partes.forEach(function (p) {
      if (llenas[p.id] || !self.acepta(p, pieza) || self.distancia(p, x, y) > margen) return;
      if (!mejor || p.w * p.h < mejor.w * mejor.h) mejor = p;
    });
    return mejor;
  },

  // Cualquier lugar vacío bajo el punto, aunque la pieza no sea la que va ahí (sirve para avisar con suavidad)
  lugarBajo(nivel, llenas, x, y, margen) {
    let mejor = null;
    const self = this;
    nivel.partes.forEach(function (p) {
      if (llenas[p.id] || self.distancia(p, x, y) > margen) return;
      if (!mejor || p.w * p.h < mejor.w * mejor.h) mejor = p;
    });
    return mejor;
  },

  completo(nivel, llenas) {
    return nivel.partes.every(function (p) { return !!llenas[p.id]; });
  }
};
