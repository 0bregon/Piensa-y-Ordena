/* ==========================================================
   ¡Ordena las instrucciones! - Misiones
   Solo datos. Cada misión tiene tarjetas (acciones) y cada acción dice
   qué pasos necesita ANTES ("pide"). Cualquier orden que respete eso es correcto.
   Para agregar una misión, copia una y cambia los valores.
   ========================================================== */
const T = 'stroke="#12294a" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"';
const svg = function (contenido) { return '<svg viewBox="0 0 120 90" aria-hidden="true">' + contenido + '</svg>'; };

/* ---- Dibujos de las tarjetas (caben en 48 x 48) ---- */
const bloque = function (ancho, color) {
  return '<rect x="' + (24 - ancho / 2) + '" y="11" width="' + ancho + '" height="26" rx="4" fill="' + color + '" ' + T + '/>';
};
const TARJETAS = {
  regadera: '<path d="M10 20h18l2 18H9z" fill="#2e9e5b" ' + T + '/><path d="M10 24C2 24 2 34 10 34" fill="none" ' + T + '/><path d="M28 26l11-9" fill="none" ' + T + '/><circle cx="40" cy="16" r="3.5" fill="#12294a"/>',
  acercarse: '<path d="M5 30h17M16 23l7 7-7 7" fill="none" stroke="#1a5fb4" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 38V22" stroke="#2e9e5b" stroke-width="3.5" stroke-linecap="round"/><ellipse cx="33" cy="26" rx="5" ry="3" fill="#52bf70" ' + T + '/><ellipse cx="43" cy="20" rx="5" ry="3" fill="#52bf70" ' + T + '/><path d="M31 38h14l-2 7h-10z" fill="#c8693a" ' + T + '/>',
  echar: '<g transform="rotate(28 22 26)"><path d="M8 20h18l2 18H7z" fill="#2e9e5b" ' + T + '/><path d="M8 24C0 24 0 34 8 34" fill="none" ' + T + '/><path d="M26 26l11-9" fill="none" ' + T + '/></g><ellipse cx="40" cy="32" rx="2.5" ry="3.5" fill="#1a8fe3"/><ellipse cx="35" cy="39" rx="2.5" ry="3.5" fill="#1a8fe3"/><ellipse cx="43" cy="42" rx="2.5" ry="3.5" fill="#1a8fe3"/>',
  panAbajo: '<ellipse cx="24" cy="38" rx="20" ry="5" fill="#fff" ' + T + '/><rect x="8" y="22" width="32" height="13" rx="6" fill="#e0b070" ' + T + '/>',
  queso: '<path d="M6 34L40 18v16z" fill="#ffd23f" ' + T + '/><circle cx="30" cy="28" r="2.2" fill="#e0a800"/><circle cx="21" cy="30" r="1.8" fill="#e0a800"/>',
  jamon: '<circle cx="24" cy="24" r="16" fill="#f4a6b8" ' + T + '/><path d="M14 22q5-5 10 0t10 0" fill="none" stroke="#d9788f" stroke-width="2.5" stroke-linecap="round"/>',
  panArriba: '<path d="M24 4v9M19 9l5 5 5-5" fill="none" stroke="#1a5fb4" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 40c0-12 8-18 17-18s17 6 17 18z" fill="#e0b070" ' + T + '/>',
  tapa: '<rect x="8" y="26" width="32" height="16" rx="3" fill="#8fa3b8" ' + T + '/><path d="M8 26L14 8h26l-4 18" fill="#b9c7d6" ' + T + '/>',
  bateria: '<rect x="6" y="16" width="32" height="20" rx="4" fill="#2e9e5b" ' + T + '/><rect x="38" y="22" width="5" height="8" rx="1.5" fill="#12294a"/><path d="M24 19l-6 9h6l-2 7 8-10h-6l3-6z" fill="#ffd23f"/>',
  cable: '<rect x="14" y="12" width="20" height="14" rx="3" fill="#e8574a" ' + T + '/><path d="M19 12V6M29 12V6" fill="none" ' + T + '/><path d="M24 26v6c0 6-12 5-12 12" fill="none" ' + T + '/>',
  boton: '<rect x="6" y="6" width="36" height="36" rx="8" fill="#b9c7d6" ' + T + '/><circle cx="24" cy="24" r="12" fill="#e8574a" ' + T + '/><circle cx="20" cy="20" r="3.5" fill="#fff" opacity=".6"/>',
  pala: '<path d="M12 6l14 20" stroke="#8a5a2e" stroke-width="4.5" stroke-linecap="round"/><path d="M24 24l11 5-9 14-8-9z" fill="#9aa7b4" ' + T + '/>',
  semilla: '<ellipse cx="24" cy="36" rx="17" ry="6" fill="#5a3a1c" ' + T + '/><ellipse cx="24" cy="23" rx="6" ry="9" fill="#d9a441" ' + T + '/>',
  tierra: '<path d="M5 40c4-18 34-18 38 0z" fill="#8a5a2e" ' + T + '/><path d="M15 34l3-4M24 31v-5M33 34l-3-4" stroke="#5a3a1c" stroke-width="2.5" stroke-linecap="round"/>',
  sol: '<circle cx="24" cy="24" r="9" fill="#ffc933" ' + T + '/><path d="M24 4v6M24 38v6M4 24h6M38 24h6M10 10l4 4M34 34l4 4M38 10l-4 4M14 34l-4 4" stroke="#e8730f" stroke-width="3" stroke-linecap="round"/>'
};

/* ---- Dibujos del escenario (caben en 120 x 90) ---- */
const SUELO = '<rect x="6" y="78" width="108" height="8" rx="4" fill="#6b7a8c" ' + T + '/>';
const torre = function (anchos, colores, cuantos) {
  let s = SUELO;
  for (let k = 0; k < cuantos; k++) {
    s += '<rect x="' + (60 - anchos[k] * 0.7) + '" y="' + (78 - (k + 1) * 15) + '" width="' + (anchos[k] * 1.4) + '" height="15" rx="3" fill="' + colores[k] + '" ' + T + '/>';
  }
  return svg(s);
};
const planta = function (estado, conMaceta) {
  const base = conMaceta ? '<path d="M42 62h36l-6 22H48z" fill="#c8693a" ' + T + '/><rect x="38" y="57" width="44" height="9" rx="3" fill="#d9794a" ' + T + '/>'
                         : '<ellipse cx="60" cy="74" rx="44" ry="11" fill="#8a5a2e" ' + T + '/>';
  const y = conMaceta ? 58 : 70;
  if (estado === "tierra") return svg(base);
  if (estado === "mustia") return svg(base + '<path d="M60 ' + y + 'C58 44 66 36 76 38" fill="none" stroke="#7a8a3a" stroke-width="4" stroke-linecap="round"/><ellipse cx="78" cy="42" rx="9" ry="5" fill="#a9a64a" ' + T + ' transform="rotate(30 78 42)"/>');
  return svg(base + '<path d="M60 ' + y + 'V30" stroke="#2e9e5b" stroke-width="4.5" stroke-linecap="round"/><ellipse cx="48" cy="46" rx="11" ry="5.5" fill="#52bf70" ' + T + ' transform="rotate(-25 48 46)"/><ellipse cx="72" cy="40" rx="11" ry="5.5" fill="#52bf70" ' + T + ' transform="rotate(25 72 40)"/><circle cx="60" cy="24" r="10" fill="#ff7eb6" ' + T + '/><circle cx="60" cy="24" r="4.5" fill="#ffd23f"/>');
};
const plato = function (completo) {
  let s = '<ellipse cx="60" cy="76" rx="46" ry="10" fill="#fff" ' + T + '/>';
  if (completo) s += '<rect x="30" y="58" width="60" height="14" rx="7" fill="#e0b070" ' + T + '/><rect x="28" y="52" width="64" height="7" rx="2" fill="#ffd23f" ' + T + '/><rect x="30" y="45" width="60" height="8" rx="4" fill="#f4a6b8" ' + T + '/><path d="M28 46c0-18 14-26 32-26s32 8 32 26z" fill="#e0b070" ' + T + '/>';
  return svg(s);
};
const maquina = function (encendida) {
  return svg('<rect x="32" y="26" width="56" height="52" rx="8" fill="#8fa3b8" ' + T + '/><rect x="39" y="33" width="42" height="22" rx="4" fill="' + (encendida ? "#7cf0a0" : "#2a3a4f") + '" ' + T + '/>' +
    '<circle cx="46" cy="66" r="4" fill="' + (encendida ? "#e8574a" : "#c5ccd4") + '"/><circle cx="60" cy="66" r="4" fill="' + (encendida ? "#ffc933" : "#c5ccd4") + '"/><circle cx="74" cy="66" r="4" fill="' + (encendida ? "#2e9e5b" : "#c5ccd4") + '"/>' +
    '<path d="M60 26v-8" ' + T + ' fill="none"/><circle cx="60" cy="13" r="6" fill="' + (encendida ? "#ffd23f" : "#c5ccd4") + '" ' + T + '/>' +
    (encendida ? '<path d="M46 8l-5-4M74 8l5-4M60 2V0" stroke="#e8730f" stroke-width="3" stroke-linecap="round"/>' : "") + '<rect x="40" y="78" width="10" height="6" rx="2" fill="#12294a"/><rect x="70" y="78" width="10" height="6" rx="2" fill="#12294a"/>');
};

const A3 = [38, 28, 18], C3 = ["#e8574a", "#1a8fe3", "#ffc933"];

const MISIONES = [
  { consigna: "Construye la torre. ¡Lo grande va abajo!",
    escena: { inicio: torre(A3, C3, 0), final: torre(A3, C3, 3) },
    acciones: [
      { id: "grande",  nombre: "Bloque grande",   icono: bloque(38, "#e8574a"), pide: [] },
      { id: "mediano", nombre: "Bloque mediano",  icono: bloque(28, "#1a8fe3"), pide: ["grande"] },
      { id: "pequeno", nombre: "Bloque pequeño",  icono: bloque(18, "#ffc933"), pide: ["mediano"] }
    ] },

  { consigna: "Riega la planta.",
    escena: { inicio: planta("mustia", true), final: planta("sana", true) },
    acciones: [
      { id: "tomar",   nombre: "Tomar la regadera",       icono: TARJETAS.regadera,  pide: [] },
      { id: "acercar", nombre: "Acercarse a la planta",   icono: TARJETAS.acercarse, pide: [] },
      { id: "echar",   nombre: "Echar agua",              icono: TARJETAS.echar,     pide: ["tomar", "acercar"] }
    ] },

  { consigna: "Prepara un sándwich.",
    escena: { inicio: plato(false), final: plato(true) },
    acciones: [
      { id: "base",   nombre: "Pan de abajo",   icono: TARJETAS.panAbajo,  pide: [] },
      { id: "queso",  nombre: "Queso",          icono: TARJETAS.queso,     pide: ["base"] },
      { id: "jamon",  nombre: "Jamón",          icono: TARJETAS.jamon,     pide: ["base"] },
      { id: "tapa",   nombre: "Pan de arriba",  icono: TARJETAS.panArriba, pide: ["queso", "jamon"] }
    ] },

  { consigna: "Enciende la máquina.",
    escena: { inicio: maquina(false), final: maquina(true) },
    acciones: [
      { id: "abrir",    nombre: "Abrir la tapa",       icono: TARJETAS.tapa,    pide: [] },
      { id: "bateria",  nombre: "Poner la batería",    icono: TARJETAS.bateria, pide: ["abrir"] },
      { id: "cable",    nombre: "Conectar el cable",   icono: TARJETAS.cable,   pide: ["abrir"] },
      { id: "boton",    nombre: "Presionar el botón",  icono: TARJETAS.boton,   pide: ["bateria", "cable"] }
    ] },

  { consigna: "Siembra una flor. ¡Necesita agua y sol!",
    escena: { inicio: planta("tierra", false), final: planta("sana", false) },
    acciones: [
      { id: "cavar",   nombre: "Cavar con la pala",    icono: TARJETAS.pala,    pide: [] },
      { id: "semilla", nombre: "Poner la semilla",     icono: TARJETAS.semilla, pide: ["cavar"] },
      { id: "tapar",   nombre: "Tapar con tierra",     icono: TARJETAS.tierra,  pide: ["semilla"] },
      { id: "regar",   nombre: "Regar",                icono: TARJETAS.echar,   pide: ["tapar"] },
      { id: "sol",     nombre: "Dar sol",              icono: TARJETAS.sol,     pide: ["tapar"] }
    ] }
];
