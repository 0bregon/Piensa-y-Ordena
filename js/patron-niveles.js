/* ==========================================================
   ¡Descubre qué sigue! - Desafíos
   Solo datos. Cada desafío describe una REGLA; las figuras se calculan con ella.
   Cada propiedad (forma, color, tam, giro) sigue su propio ciclo de la lista.
     mecanica  "completa"  falta una pieza (o más) al final
               "construye" se arma el final con piezas contadas
               "diferente" una pieza rompe el patrón y hay que cambiarla
     largo     cuántas figuras tiene la secuencia
     faltan    posiciones vacías (completa y construye)
     intruso   { indice, item } la pieza que rompe el patrón (diferente)
     extra     figuras que no son del patrón y sirven de distractores
   ========================================================== */
const ROJO = "#e8574a", AZUL = "#1a8fe3", VERDE = "#2e9e5b", NARANJA = "#e8730f";

const NIVELES_PATRON = [
  // ---- Etapa 1: patrones sencillos (AB) ----
  { mecanica: "completa", consigna: "¿Qué figura sigue?",
    regla: { forma: ["circulo", "cuadrado"], color: [ROJO, AZUL] },
    largo: 6, faltan: [5], extra: [{ forma: "circulo", color: AZUL }] },

  { mecanica: "completa", consigna: "¿Qué fruta sigue?",
    regla: { forma: ["manzana", "banana"] },
    largo: 6, faltan: [5], extra: [{ forma: "hoja" }] },

  { mecanica: "construye", consigna: "Construye el patrón con las piezas.",
    regla: { forma: ["gato", "pez"] },
    largo: 8, faltan: [4, 5, 6, 7] },

  // ---- Etapa 2: patrones combinados (AAB, ABB, ABC) ----
  { mecanica: "completa", consigna: "Dos estrellas y una luna... ¿qué sigue?",
    regla: { forma: ["estrella", "estrella", "luna"] },
    largo: 8, faltan: [7], extra: [{ forma: "sol" }] },

  { mecanica: "diferente", consigna: "Una pieza no sigue el patrón. ¡Cámbiala!",
    regla: { forma: ["circulo"], color: [ROJO, AZUL, AZUL] },
    largo: 8, intruso: { indice: 4, item: { forma: "circulo", color: VERDE } } },

  { mecanica: "diferente", consigna: "Una pieza no sigue el patrón. ¡Cámbiala!",
    regla: { forma: ["conejo", "conejo", "tortuga"] },
    largo: 8, intruso: { indice: 5, item: { forma: "gato" } } },

  { mecanica: "completa", consigna: "Sol, luna, estrella... ¿qué sigue?",
    regla: { forma: ["sol", "luna", "estrella"] },
    largo: 8, faltan: [7], extra: [{ forma: "corazon" }] },

  // ---- Etapa 3: patrones que evolucionan ----
  { mecanica: "completa", consigna: "La estrella va creciendo. ¡Sigue creciendo!",
    regla: { forma: ["estrella"], tam: [1, 2, 3, 4, 5] },
    largo: 5, faltan: [3, 4] },

  { mecanica: "completa", consigna: "La flecha va girando. ¿Hacia dónde sigue?",
    regla: { forma: ["flecha"], color: [AZUL], giro: [0, 90, 180, 270] },
    largo: 8, faltan: [7] },

  { mecanica: "completa", consigna: "Cambian la forma y el tamaño. ¿Cuál sigue?",
    regla: { forma: ["circulo", "cuadrado"], color: [NARANJA], tam: [1, 2, 3, 4, 5] },
    largo: 5, faltan: [4], extra: [{ forma: "cuadrado", color: NARANJA, tam: 5 }] }
];
