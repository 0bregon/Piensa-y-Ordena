/* ==========================================================
   ¡Completa el tablero! - Lógica
   No toca la pantalla. El tablero es una lista de filas;
   cada casilla es un número (la figura) o null (vacía).
   ========================================================== */
const LogicaTablero = {

  // Casillas cuya figura se repite en su fila o en su columna: ["fila,columna", ...]
  conflictos(t) {
    const n = t.length, malas = new Set();
    for (let f = 0; f < n; f++) {
      for (let c = 0; c < n; c++) {
        if (t[f][c] === null) continue;
        for (let k = 0; k < n; k++) {
          if ((k !== c && t[f][k] === t[f][c]) || (k !== f && t[k][c] === t[f][c])) malas.add(f + "," + c);
        }
      }
    }
    return malas;
  },

  // Figuras que se pueden poner en una casilla sin repetir en su fila ni columna
  candidatos(t, f, c) {
    const n = t.length, usadas = new Set();
    for (let k = 0; k < n; k++) { usadas.add(t[f][k]); usadas.add(t[k][c]); }
    const lista = [];
    for (let v = 0; v < n; v++) if (!usadas.has(v)) lista.push(v);
    return lista;
  },

  // Cuántas piezas de cada figura quedan por colocar
  restantes(t) {
    const n = t.length, cuenta = new Array(n).fill(n);
    t.forEach(function (fila) { fila.forEach(function (v) { if (v !== null) cuenta[v]--; }); });
    return cuenta;
  },

  // Completo = sin casillas vacías Y sin figuras repetidas
  completo(t) {
    return t.every(function (fila) { return fila.every(function (v) { return v !== null; }); }) &&
           this.conflictos(t).size === 0;
  },

  // Hay una casilla vacía donde no cabe ninguna figura: algo colocado antes no encaja
  atascado(t) {
    for (let f = 0; f < t.length; f++) {
      for (let c = 0; c < t.length; c++) {
        if (t[f][c] === null && this.candidatos(t, f, c).length === 0) return true;
      }
    }
    return false;
  },

  // Una pista que orienta sin dar la respuesta
  pista(t) {
    const malas = this.conflictos(t);
    if (malas.size) return { tipo: "conflicto", celdas: Array.from(malas) };
    if (this.atascado(t)) return { tipo: "atascado" };

    let mejor = null, minimo = Infinity;       // la casilla con menos opciones es la más fácil de deducir
    for (let f = 0; f < t.length; f++) {
      for (let c = 0; c < t.length; c++) {
        if (t[f][c] !== null) continue;
        const k = this.candidatos(t, f, c).length;
        if (k < minimo) { minimo = k; mejor = [f, c]; }
      }
    }
    return mejor ? { tipo: "observa", celda: mejor } : null;
  },

  // Cuenta las soluciones (se detiene en "limite"); sirve para comprobar los niveles
  contarSoluciones(dado, limite) {
    const t = dado.map(function (fila) { return fila.slice(); });
    const self = this;
    function buscar() {
      for (let f = 0; f < t.length; f++) {
        for (let c = 0; c < t.length; c++) {
          if (t[f][c] !== null) continue;
          let total = 0;
          for (const v of self.candidatos(t, f, c)) {
            t[f][c] = v; total += buscar(); t[f][c] = null;
            if (total >= limite) return total;
          }
          return total;
        }
      }
      return self.conflictos(t).size === 0 ? 1 : 0;
    }
    return buscar();
  }
};
