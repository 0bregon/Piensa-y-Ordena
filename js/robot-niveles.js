/* ==========================================================
   ¡Construye al robot! - Niveles
   Solo datos. Cada robot se dibuja en un lienzo de 200 x 240.
   Una parte es: { id, forma, x, y, w, h, color, giro }
     forma    "cuadrado", "rectangulo", "circulo", "triangulo", "semi", "trapecio", "rombo" o "estrella"
     x, y     esquina de arriba a la izquierda; w, h = ancho y alto
   Nivel:
     fijas      partes que ya vienen puestas
     sobrantes  piezas que NO se usan (van a la caja de sobrantes)
     guia       "color" (molde del color de la pieza), "forma" (molde gris) o "contorno" (solo la silueta)
     modelo     true (siempre se ve el robot terminado), "pista" (solo con la pista) o false
   Las piezas con la misma forma, tamaño, color y giro son intercambiables.
   ========================================================== */
const ROJO = "#e8574a", AZUL = "#1a8fe3", VERDE = "#2e9e5b", AMARILLO = "#ffc933", NARANJA = "#e8730f";
const ROSA = "#d94fa0", MORADO = "#9b59d0", CELESTE = "#3cc8c0", BLANCO = "#ffffff";

const R = function (id, forma, x, y, w, h, color, giro) {
  return { id: id, forma: forma, x: x, y: y, w: w, h: h, color: color, giro: giro || 0 };
};
// Dos partes iguales, una a cada lado del robot (la derecha es el espejo de la izquierda)
const par = function (id, forma, x, y, w, h, color, giro) {
  return [R(id + "I", forma, x, y, w, h, color, giro), R(id + "D", forma, 200 - x - w, y, w, h, color, giro)];
};
const juntar = function () {
  return Array.prototype.concat.apply([], Array.prototype.slice.call(arguments).map(function (x) { return Array.isArray(x) ? x : [x]; }));
};

const ROBOTS = [
  // 1. Cabeza, cuerpo y piernas
  { guia: "color", modelo: true, fijas: [], sobrantes: [],
    partes: juntar(
      R("cabeza", "cuadrado", 70, 26, 60, 60, AZUL),
      R("cuerpo", "rectangulo", 64, 92, 72, 78, VERDE),
      par("pierna", "rectangulo", 74, 174, 22, 48, ROJO)) },

  // 2. Solo faltan los brazos y los pies
  { guia: "color", modelo: true, sobrantes: [],
    fijas: ["cabeza", "cuerpo", "piernaI", "piernaD"],
    partes: juntar(
      R("cabeza", "circulo", 72, 24, 56, 56, MORADO),
      R("cuerpo", "rectangulo", 62, 90, 76, 80, ROSA),
      par("brazo", "rectangulo", 34, 98, 24, 58, VERDE),
      par("pierna", "rectangulo", 76, 174, 20, 40, AZUL),
      par("pie", "rectangulo", 66, 216, 32, 14, AMARILLO)) },

  // 3. Círculos, cuadrados y rectángulos
  { guia: "color", modelo: true, fijas: [], sobrantes: [],
    partes: juntar(
      R("cabeza", "cuadrado", 68, 26, 64, 64, CELESTE),
      par("ojo", "circulo", 80, 46, 16, 16, AMARILLO),
      R("cuerpo", "cuadrado", 62, 96, 76, 76, MORADO),
      par("brazo", "rectangulo", 32, 100, 26, 58, ROJO),
      par("pierna", "rectangulo", 74, 176, 22, 46, VERDE)) },

  // 4. Más piezas: antena, boca y pies
  { guia: "color", modelo: true, fijas: [], sobrantes: [],
    partes: juntar(
      R("cabeza", "rectangulo", 64, 34, 72, 52, AZUL),
      R("antena", "triangulo", 90, 8, 20, 26, AMARILLO),
      par("ojo", "circulo", 78, 48, 16, 16, BLANCO),
      R("boca", "rectangulo", 86, 68, 28, 8, ROJO),
      R("cuerpo", "rectangulo", 60, 92, 80, 78, VERDE),
      par("brazo", "rectangulo", 30, 98, 26, 60, NARANJA),
      par("pierna", "rectangulo", 74, 174, 22, 40, MORADO),
      par("pie", "semi", 66, 214, 32, 16, ROSA)) },

  // 5. Con piezas que sobran
  { guia: "forma", modelo: true, fijas: [],
    sobrantes: [R("s1", "estrella", 0, 0, 34, 34, AMARILLO), R("s2", "rombo", 0, 0, 30, 40, ROJO), R("s3", "triangulo", 0, 0, 32, 30, AZUL)],
    partes: juntar(
      R("cabeza", "circulo", 68, 26, 64, 64, ROSA),
      par("ojo", "circulo", 80, 48, 14, 14, AZUL),
      R("cuerpo", "rectangulo", 62, 96, 76, 76, CELESTE),
      R("panel", "cuadrado", 90, 118, 20, 20, AMARILLO),
      par("brazo", "rectangulo", 32, 100, 26, 58, VERDE),
      par("pierna", "rectangulo", 74, 176, 22, 46, NARANJA)) },

  // 6. Piezas de diferentes tamaños
  { guia: "forma", modelo: true, fijas: [], sobrantes: [],
    partes: juntar(
      R("cuerpo", "circulo", 52, 98, 96, 96, VERDE),
      R("cabeza", "circulo", 76, 54, 48, 48, AZUL),
      R("antena", "triangulo", 92, 28, 16, 26, ROSA),
      par("ojo", "circulo", 86, 70, 10, 10, BLANCO),
      R("boton1", "circulo", 95, 122, 10, 10, AMARILLO),
      R("boton2", "circulo", 95, 142, 10, 10, AMARILLO),
      par("brazo", "rectangulo", 26, 112, 22, 64, ROJO),
      par("pie", "circulo", 62, 194, 30, 28, NARANJA)) },

  // 7. Más partes y accesorios
  { guia: "forma", modelo: true, fijas: [], sobrantes: [],
    partes: juntar(
      R("cabeza", "cuadrado", 66, 38, 68, 60, NARANJA),
      R("antena", "circulo", 92, 16, 16, 16, ROJO),
      par("ojo", "circulo", 80, 56, 14, 14, BLANCO),
      R("boca", "semi", 86, 78, 28, 12, ROSA, 180),
      R("cuerpo", "rectangulo", 60, 104, 80, 72, AZUL),
      R("botonR", "circulo", 84, 132, 14, 14, ROJO),
      R("botonV", "circulo", 102, 132, 14, 14, VERDE),
      par("brazo", "rectangulo", 30, 108, 24, 58, MORADO),
      par("pierna", "rectangulo", 74, 180, 22, 40, ROSA)) },

  // 8. Piezas mezcladas y más formas
  { guia: "forma", modelo: true, fijas: [],
    sobrantes: [R("s1", "estrella", 0, 0, 34, 34, BLANCO), R("s2", "circulo", 0, 0, 24, 24, ROSA)],
    partes: juntar(
      R("cabeza", "trapecio", 64, 30, 72, 56, CELESTE),
      R("antena", "rombo", 90, 4, 20, 26, ROJO),
      par("ojo", "triangulo", 78, 46, 18, 16, AMARILLO, 180),
      R("boca", "semi", 88, 66, 24, 12, ROSA, 180),
      R("cuerpo", "rectangulo", 60, 92, 80, 76, VERDE),
      R("pecho", "triangulo", 88, 106, 24, 24, AMARILLO),
      par("brazo", "trapecio", 28, 98, 24, 56, MORADO),
      par("pierna", "rectangulo", 74, 172, 22, 40, AZUL),
      par("pie", "triangulo", 66, 212, 34, 16, NARANJA)) },

  // 9. Solo la silueta, sin modelo a la vista
  { guia: "contorno", modelo: "pista", fijas: [],
    sobrantes: [R("s1", "estrella", 0, 0, 34, 34, ROJO)],
    partes: juntar(
      R("cabeza", "cuadrado", 64, 28, 72, 64, NARANJA),
      par("antena", "triangulo", 72, 6, 16, 22, AMARILLO),
      par("ojo", "circulo", 78, 50, 18, 18, BLANCO),
      R("boca", "rectangulo", 84, 76, 32, 8, ROJO),
      R("cuerpo", "rectangulo", 58, 98, 84, 78, AZUL),
      R("pecho", "circulo", 86, 118, 28, 28, ROSA),
      par("brazo", "rectangulo", 28, 102, 26, 62, VERDE),
      par("pierna", "rectangulo", 72, 180, 26, 40, MORADO),
      par("pie", "semi", 64, 218, 34, 18, AMARILLO)) },

  // 10. El robot completo
  { guia: "contorno", modelo: false, fijas: [],
    sobrantes: [R("s1", "estrella", 0, 0, 34, 34, AMARILLO), R("s2", "trapecio", 0, 0, 30, 28, AZUL)],
    partes: juntar(
      R("antena", "circulo", 92, 4, 16, 16, ROJO),
      R("cabeza", "rectangulo", 62, 24, 76, 66, CELESTE),
      par("ojo", "circulo", 76, 44, 18, 18, BLANCO),
      R("boca", "semi", 84, 70, 32, 14, ROSA, 180),
      R("cuerpo", "rectangulo", 56, 96, 88, 80, MORADO),
      R("panel", "rectangulo", 78, 108, 44, 28, AMARILLO),
      R("boton1", "circulo", 84, 146, 12, 12, ROJO),
      R("boton2", "circulo", 104, 146, 12, 12, VERDE),
      par("brazo", "rectangulo", 26, 100, 24, 64, AZUL),
      par("mano", "circulo", 24, 166, 28, 28, ROSA),
      par("pierna", "rectangulo", 70, 180, 26, 36, VERDE),
      par("pie", "rectangulo", 62, 218, 36, 16, NARANJA)) }
];
