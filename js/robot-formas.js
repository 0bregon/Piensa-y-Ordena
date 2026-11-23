/* ==========================================================
   ¡Construye al robot! - Dibujos
   Dibuja cada forma geométrica dentro de su caja (x, y, w, h).
   ========================================================== */
const TRAZO_ROBOT = 'stroke="#12294a" stroke-width="2.5" stroke-linejoin="round"';
const ESTRELLA_PUNTOS = [[0.5, 0], [0.62, 0.35], [0.98, 0.38], [0.69, 0.6], [0.79, 0.95], [0.5, 0.74], [0.21, 0.95], [0.31, 0.6], [0.02, 0.38], [0.38, 0.35]];

function formaSVG(p, atributos) {
  const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
  const giro = p.giro ? ' transform="rotate(' + p.giro + ' ' + cx + ' ' + cy + ')"' : "";
  const fin = ' ' + atributos + giro + '/>';
  const puntos = function (lista) {
    return lista.map(function (q) { return (p.x + q[0] * p.w).toFixed(1) + "," + (p.y + q[1] * p.h).toFixed(1); }).join(" ");
  };
  switch (p.forma) {
    case "circulo":   return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + p.w / 2 + '" ry="' + p.h / 2 + '"' + fin;
    case "triangulo": return '<polygon points="' + puntos([[0.5, 0], [1, 1], [0, 1]]) + '"' + fin;
    case "trapecio":  return '<polygon points="' + puntos([[0.2, 0], [0.8, 0], [1, 1], [0, 1]]) + '"' + fin;
    case "rombo":     return '<polygon points="' + puntos([[0.5, 0], [1, 0.5], [0.5, 1], [0, 0.5]]) + '"' + fin;
    case "estrella":  return '<polygon points="' + puntos(ESTRELLA_PUNTOS) + '"' + fin;
    case "semi":      return '<path d="M' + p.x + ' ' + (p.y + p.h) + 'A' + p.w / 2 + ' ' + p.h + ' 0 0 1 ' + (p.x + p.w) + ' ' + (p.y + p.h) + 'Z"' + fin;
    default:          return '<rect x="' + p.x + '" y="' + p.y + '" width="' + p.w + '" height="' + p.h + '" rx="3"' + fin;
  }
}

// El robot terminado, en pequeño (el "modelo")
function modeloSVG(nivel) {
  let s = '<svg viewBox="0 0 200 240" aria-hidden="true">';
  nivel.partes.forEach(function (p) { s += formaSVG(p, 'fill="' + p.color + '" stroke="#12294a" stroke-width="3" stroke-linejoin="round"'); });
  return s + "</svg>";
}

// Una pieza suelta para la bandeja. "lado" es el cuadro común del nivel.
// Se conserva el orden de tamaños (la grande se ve más grande que la pequeña), pero ninguna se ve tan chica que no se reconozca.
function fichaSVG(p, lado) {
  const tope = lado - 8, mayor = Math.max(p.w, p.h);
  const k = tope * (0.4 + 0.6 * Math.min(1, mayor / tope)) / mayor;
  const w = p.w * k, h = p.h * k;
  const caja = { forma: p.forma, w: w, h: h, giro: p.giro, x: (lado - w) / 2, y: (lado - h) / 2 };
  return '<svg viewBox="0 0 ' + lado + ' ' + lado + '" aria-hidden="true">' + formaSVG(caja, 'fill="' + p.color + '" ' + TRAZO_ROBOT) + "</svg>";
}
