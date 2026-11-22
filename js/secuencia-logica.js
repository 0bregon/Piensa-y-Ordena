/* ==========================================================
   ¡Ordena las instrucciones! - Lógica
   No toca la pantalla. Una secuencia es una lista de ids de acciones.
   Es correcta si cada acción tiene hechos, antes que ella, todos los pasos que "pide".
   ========================================================== */
const Secuencia = {
  buscar(mision, id) {
    return mision.acciones.find(function (a) { return a.id === id; });
  },

  // Revisa una secuencia completa. Si falla, dice en qué paso y qué paso faltaba.
  validar(mision, orden) {
    const hechos = new Set();
    for (let i = 0; i < orden.length; i++) {
      const accion = this.buscar(mision, orden[i]);
      const falta = accion.pide.find(function (p) { return !hechos.has(p); });
      if (falta) return { ok: false, indice: i, falta: falta };
      hechos.add(accion.id);
    }
    return { ok: true };
  },

  // Primer problema de lo que hay puesto: un hueco vacío o un paso que no se puede hacer todavía
  revisar(mision, huecos) {
    const hechos = new Set();
    for (let i = 0; i < huecos.length; i++) {
      if (huecos[i] === null) return { tipo: "vacio", indice: i };
      const accion = this.buscar(mision, huecos[i]);
      const falta = accion.pide.find(function (p) { return !hechos.has(p); });
      if (falta) return { tipo: "falla", indice: i, falta: falta };
      hechos.add(accion.id);
    }
    return null;
  },

  // De las tarjetas disponibles, cuáles se pueden hacer ya, después de los pasos indicados
  siguientes(mision, hechosIds, disponibles) {
    const self = this, hechos = new Set(hechosIds);
    return disponibles.filter(function (id) {
      return self.buscar(mision, id).pide.every(function (p) { return hechos.has(p); });
    });
  },

  // Cuántos órdenes distintos son correctos (sirve para revisar las misiones)
  contarOrdenes(mision) {
    const self = this, ids = mision.acciones.map(function (a) { return a.id; });
    function permutar(resto, actual) {
      if (!resto.length) return self.validar(mision, actual).ok ? 1 : 0;
      let total = 0;
      resto.forEach(function (id, k) {
        total += permutar(resto.slice(0, k).concat(resto.slice(k + 1)), actual.concat(id));
      });
      return total;
    }
    return permutar(ids, []);
  }
};
