/* ==========================================================
   ¡Descubre qué sigue! - Dibujos
   Cada figura se dibuja en un cuadro de 40 x 40.
   Una figura tiene: forma, color (opcional), tam (1 a 5) y giro (0, 90, 180, 270).
   ========================================================== */
const TRAZO = 'stroke="#12294a" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"';

const FORMAS = {
  // ---- figuras geométricas (aceptan color) ----
  circulo:   function (c) { return '<circle cx="20" cy="20" r="15.5" fill="' + (c || "#1a8fe3") + '" ' + TRAZO + '/>'; },
  cuadrado:  function (c) { return '<rect x="5.5" y="5.5" width="29" height="29" rx="5" fill="' + (c || "#2e9e5b") + '" ' + TRAZO + '/>'; },
  triangulo: function (c) { return '<polygon points="20,4.5 36,34 4,34" fill="' + (c || "#e8574a") + '" ' + TRAZO + '/>'; },
  flecha:    function (c) { return '<path d="M20 4L34 19H25v17H15V19H6z" fill="' + (c || "#1a8fe3") + '" ' + TRAZO + '/>'; },
  estrella:  function (c) { return '<polygon points="20,3 25,15 38,16 28,24 31,37 20,30 9,37 12,24 2,16 15,15" fill="' + (c || "#ffc933") + '" ' + TRAZO + '/>'; },
  corazon:   function (c) { return '<path d="M20 35C5 25 3 14 10 10c4-2 8 0 10 4 2-4 6-6 10-4 7 4 5 15-10 25z" fill="' + (c || "#d94fa0") + '" ' + TRAZO + '/>'; },

  // ---- espacio y naturaleza ----
  luna: function () { return '<path d="M27 5C15 6 8 15 10 25c2 9 12 13 22 8-9 0-14-8-12-16 1-5 4-9 7-12z" fill="#ffd86b" ' + TRAZO + '/>'; },
  sol:  function () { return '<circle cx="20" cy="20" r="8.5" fill="#ffc933" ' + TRAZO + '/><path d="M20 3v5M20 32v5M3 20h5M32 20h5M8 8l3.5 3.5M28.5 28.5L32 32M32 8l-3.5 3.5M11.5 28.5L8 32" stroke="#e8730f" stroke-width="3" stroke-linecap="round"/>'; },
  hoja: function () { return '<path d="M7 33C5 17 17 6 34 6c0 17-8 28-27 27z" fill="#52bf70" ' + TRAZO + '/><path d="M8 32L26 14" stroke="#12294a" stroke-width="2.2" stroke-linecap="round"/>'; },

  // ---- frutas ----
  manzana: function () { return '<path d="M20 12c-6-4-14 0-14 9 0 8 6 15 10 15 2 0 2-1 4-1s2 1 4 1c4 0 10-7 10-15 0-9-8-13-14-9z" fill="#e8574a" ' + TRAZO + '/><path d="M20 12c0-4 1-6 3-8" fill="none" ' + TRAZO + '/><ellipse cx="27" cy="7" rx="5" ry="2.8" fill="#52bf70" ' + TRAZO + ' transform="rotate(-20 27 7)"/>'; },
  banana:  function () { return '<path d="M6 11c1 15 13 24 29 19-3 5-9 8-16 7C8 36 2 24 6 11z" fill="#ffd23f" ' + TRAZO + '/><path d="M6 11l-2-4" ' + TRAZO + ' fill="none"/>'; },

  // ---- animales ----
  gato:    function () { return '<polygon points="7,18 8,4 17,11" fill="#f0a95a" ' + TRAZO + '/><polygon points="33,18 32,4 23,11" fill="#f0a95a" ' + TRAZO + '/><circle cx="20" cy="22" r="14" fill="#f0a95a" ' + TRAZO + '/><circle cx="15" cy="20" r="2" fill="#12294a"/><circle cx="25" cy="20" r="2" fill="#12294a"/><path d="M18 26h4l-2 2.5z" fill="#d94fa0"/><path d="M5 25h8M27 25h8" stroke="#12294a" stroke-width="1.6" stroke-linecap="round"/>'; },
  pez:     function () { return '<polygon points="30,20 38,10 38,30" fill="#ff9f43" ' + TRAZO + '/><ellipse cx="18" cy="20" rx="14" ry="10" fill="#1a8fe3" ' + TRAZO + '/><circle cx="11" cy="18" r="2" fill="#fff"/><circle cx="11" cy="18" r="0.9" fill="#12294a"/><path d="M20 12c3 4 3 12 0 16" fill="none" stroke="#7cc8f2" stroke-width="2"/>'; },
  conejo:  function () { return '<ellipse cx="14" cy="9" rx="4" ry="9" fill="#f4f4f4" ' + TRAZO + '/><ellipse cx="26" cy="9" rx="4" ry="9" fill="#f4f4f4" ' + TRAZO + '/><ellipse cx="14" cy="10" rx="1.6" ry="5.5" fill="#f4a6b8"/><ellipse cx="26" cy="10" rx="1.6" ry="5.5" fill="#f4a6b8"/><circle cx="20" cy="25" r="12.5" fill="#f4f4f4" ' + TRAZO + '/><circle cx="15.5" cy="23" r="1.9" fill="#12294a"/><circle cx="24.5" cy="23" r="1.9" fill="#12294a"/><circle cx="20" cy="28" r="1.8" fill="#f4a6b8"/>'; },
  tortuga: function () { return '<ellipse cx="33" cy="22" rx="5" ry="4.5" fill="#8fd16a" ' + TRAZO + '/><rect x="8" y="27" width="5" height="7" rx="2" fill="#8fd16a" ' + TRAZO + '/><rect x="21" y="27" width="5" height="7" rx="2" fill="#8fd16a" ' + TRAZO + '/><path d="M5 29c0-12 7-19 15-19s15 7 15 19z" fill="#2e9e5b" ' + TRAZO + '/><path d="M13 29c0-6 2-10 7-12M27 29c0-6-2-10-7-12" fill="none" stroke="#12294a" stroke-width="2"/>'; }
};

// El tamaño (1 a 5) cambia la escala; el giro rota la figura
function figuraSVG(e) {
  const escala = 0.3 + 0.14 * (e.tam || 5);
  return '<svg viewBox="0 0 40 40" aria-hidden="true"><g transform="translate(20 20) rotate(' + (e.giro || 0) +
         ') scale(' + escala + ') translate(-20 -20)">' + FORMAS[e.forma](e.color) + '</g></svg>';
}
