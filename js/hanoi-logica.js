/* ==========================================================
   ¡La torre de los discos! - Lógica
   No toca la pantalla. Una posición son 3 listas (las varillas);
   cada lista tiene los discos de abajo hacia arriba.
   Los discos se llaman por su tamaño: 1 es el más pequeño.
   ========================================================== */
const Hanoi = {
  // Torre completa en la primera varilla: el más grande abajo
  inicial(n) {
    const pila = [];
    for (let d = n; d >= 1; d--) pila.push(d);
    return [pila, [], []];
  },

  copia(t) { return t.map(function (v) { return v.slice(); }); },

  cima(t, i) { return t[i].length ? t[i][t[i].length - 1] : null; },

  // Reglas: se mueve solo el disco de arriba y nunca sobre uno más pequeño
  puede(t, de, a) {
    if (de === a || t[de].length === 0) return false;
    const destino = this.cima(t, a);
    return destino === null || destino > this.cima(t, de);
  },

  // Devuelve la nueva posición, o null si el movimiento no está permitido
  mover(t, de, a) {
    if (!this.puede(t, de, a)) return null;
    const nueva = this.copia(t);
    nueva[a].push(nueva[de].pop());
    return nueva;
  },

  // Varillas donde se puede soltar el disco de arriba de "de"
  destinos(t, de) {
    const lista = [];
    for (let a = 0; a < 3; a++) if (this.puede(t, de, a)) lista.push(a);
    return lista;
  },

  gano(t, n) { return t[2].length === n; },

  minimo(n) { return Math.pow(2, n) - 1; },

  // Mejor siguiente movimiento desde CUALQUIER posición (búsqueda del camino más corto)
  siguientePaso(t, n) {
    if (this.gano(t, n)) return null;
    const clave = function (x) { return x.map(function (v) { return v.join(""); }).join("|"); };
    const cola = [{ t: t, primero: null }], visto = new Set([clave(t)]);
    while (cola.length) {
      const actual = cola.shift();
      for (let de = 0; de < 3; de++) {
        for (let a = 0; a < 3; a++) {
          const sig = this.mover(actual.t, de, a);
          if (!sig || visto.has(clave(sig))) continue;
          visto.add(clave(sig));
          const primero = actual.primero || { de: de, a: a };
          if (this.gano(sig, n)) return primero;
          cola.push({ t: sig, primero: primero });
        }
      }
    }
    return null;
  }
};
