/* ==========================================================
   ¡Encuentra el camino! - Niveles
   Solo datos. Para agregar un nivel, copia uno y cambia los valores.
   Las casillas son [columna, fila] y empiezan en [0, 0] (arriba a la izquierda).
     inicio     casilla donde empieza Pixel
     meta       la batería
     obstaculos rocas por donde Pixel no puede pasar
     estrellas  piezas que hay que recoger antes de llegar a la meta
     limite     cuántas flechas caben en el camino
   ========================================================== */
const NIVELES = [
  { consigna: "Lleva a Pixel hasta la batería.",
    columnas: 3, filas: 3, inicio: [0, 1], meta: [2, 1],
    obstaculos: [], estrellas: [], limite: 6 },

  { consigna: "Ahora el camino es más largo. ¡Cambia de dirección!",
    columnas: 5, filas: 4, inicio: [0, 3], meta: [4, 0],
    obstaculos: [], estrellas: [], limite: 10 },

  { consigna: "Cuidado con las rocas: Pixel no puede pasar por ellas.",
    columnas: 5, filas: 5, inicio: [0, 4], meta: [4, 0],
    obstaculos: [[1, 1], [2, 1], [3, 2], [1, 3]], estrellas: [], limite: 12 },

  { consigna: "Recoge las dos estrellas y después llega a la batería.",
    columnas: 5, filas: 5, inicio: [0, 4], meta: [4, 0],
    obstaculos: [[1, 1], [2, 3], [3, 0]], estrellas: [[0, 2], [3, 2]], limite: 12 },

  { consigna: "Llega con solo 9 flechas. ¡Busca el camino más corto!",
    columnas: 6, filas: 5, inicio: [0, 4], meta: [5, 0],
    obstaculos: [[2, 4], [1, 2], [3, 3], [4, 2], [2, 1], [0, 1]], estrellas: [], limite: 9 }
];
