/* ==========================================================
   ¡Encuentra el camino! - Lógica
   No toca la pantalla: recibe un nivel y las flechas elegidas,
   y devuelve qué pasa paso a paso.
   ========================================================== */
const CaminoLogica = {
  MOVIMIENTOS: { arriba: [0, -1], abajo: [0, 1], izquierda: [-1, 0], derecha: [1, 0] },

  hayRoca(nivel, x, y) {
    return nivel.obstaculos.some(function (o) { return o[0] === x && o[1] === y; });
  },

  esValida(nivel, x, y) {
    return x >= 0 && y >= 0 && x < nivel.columnas && y < nivel.filas && !this.hayRoca(nivel, x, y);
  },

  // Ejecuta las flechas en el orden exacto en que están puestas.
  // Resultado: "gana", "faltan" (estrellas), "lejos" (no llegó), "borde" u "obstaculo".
  simular(nivel, flechas) {
    let x = nivel.inicio[0], y = nivel.inicio[1];
    const recogidas = [], pasos = [];
    let resultado = null;

    for (const dir of flechas) {
      const nx = x + this.MOVIMIENTOS[dir][0], ny = y + this.MOVIMIENTOS[dir][1];

      if (!this.esValida(nivel, nx, ny)) {          // choca y se detiene
        pasos.push({ x: x, y: y, choque: true });
        resultado = this.hayRoca(nivel, nx, ny) ? "obstaculo" : "borde";
        break;
      }

      x = nx; y = ny;
      const e = nivel.estrellas.findIndex(function (s) { return s[0] === x && s[1] === y; });
      const nueva = e >= 0 && !recogidas.includes(e);
      if (nueva) recogidas.push(e);
      pasos.push({ x: x, y: y, estrella: nueva ? e : -1 });
    }

    if (!resultado) {
      if (x === nivel.meta[0] && y === nivel.meta[1]) {
        resultado = recogidas.length === nivel.estrellas.length ? "gana" : "faltan";
      } else {
        resultado = "lejos";
      }
    }
    return { pasos: pasos, resultado: resultado };
  },

  // Cantidad mínima de flechas para resolver el nivel (sirve para revisar los niveles).
  mejorSolucion(nivel) {
    const todas = (1 << nivel.estrellas.length) - 1;
    const cola = [[nivel.inicio[0], nivel.inicio[1], 0, 0]];
    const visto = new Set([nivel.inicio[0] + "," + nivel.inicio[1] + ",0"]);

    while (cola.length) {
      const [x, y, mascara, largo] = cola.shift();
      if (x === nivel.meta[0] && y === nivel.meta[1] && mascara === todas) return largo;

      for (const dir in this.MOVIMIENTOS) {
        const nx = x + this.MOVIMIENTOS[dir][0], ny = y + this.MOVIMIENTOS[dir][1];
        if (!this.esValida(nivel, nx, ny)) continue;
        const e = nivel.estrellas.findIndex(function (s) { return s[0] === nx && s[1] === ny; });
        const m = e >= 0 ? (mascara | (1 << e)) : mascara;
        const clave = nx + "," + ny + "," + m;
        if (!visto.has(clave)) { visto.add(clave); cola.push([nx, ny, m, largo + 1]); }
      }
    }
    return -1;
  }
};
