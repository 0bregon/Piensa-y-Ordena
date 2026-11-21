/* ==========================================================
   ¡Completa el tablero! - Niveles
   Solo datos. Cada figura aparece una vez en cada fila y en cada columna.
     figuras  las figuras del nivel (hay tantas como filas)
     dado     el tablero inicial: número = figura ya colocada, null = casilla vacía
   Cada tablero tiene UNA sola solución (se comprueba en las pruebas).
   Para agregar un nivel, copia uno y cambia los valores.
   ========================================================== */
const NIVELES_TABLERO = [
  { consigna: "Pon la figura que falta. ¡No se repiten en la fila ni en la columna!",
    figuras: ["estrella", "circulo", "cuadrado"],
    dado: [
      [1, 2, 0],
      [null, 0, 1],
      [0, null, null]
    ] },
  { consigna: "Ahora faltan más figuras. ¡Observa cada fila y cada columna!",
    figuras: ["circulo", "triangulo", "corazon"],
    dado: [
      [2, 0, null],
      [null, null, 2],
      [null, 2, null]
    ] },
  { consigna: "Menos pistas: ¡piensa qué figura cabe en cada lugar!",
    figuras: ["estrella", "triangulo", "corazon"],
    dado: [
      [null, 2, 0],
      [null, null, 1],
      [null, null, null]
    ] },
  { consigna: "Un tablero más grande, con cuatro figuras.",
    figuras: ["estrella", "circulo", "cuadrado", "triangulo"],
    dado: [
      [1, null, 0, 2],
      [null, null, 1, null],
      [2, null, null, 0],
      [3, null, 2, 1]
    ] },
  { consigna: "El gran desafío: ¡cuatro figuras y muchos espacios!",
    figuras: ["estrella", "circulo", "triangulo", "corazon"],
    dado: [
      [2, null, 3, null],
      [null, 2, null, null],
      [null, null, 2, 0],
      [3, null, 0, null]
    ] }
];
