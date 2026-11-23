/* ==========================================================
   ¡La torre de los discos! - Niveles
   Solo datos. Para cambiar un nivel, edita sus valores.
     discos   cuántos discos tiene la torre
     paleta   colores de los discos (un número de PALETAS_HANOI)
     ayuda    "total"  la pista muestra el disco Y la varilla a donde va
              "disco"  la pista solo muestra qué disco mover
   ========================================================== */
const PALETAS_HANOI = [
  ["#e8574a", "#e8730f", "#ffc933", "#2e9e5b", "#1a8fe3"],   // arcoíris
  ["#1a8fe3", "#3cc8c0", "#2e9e5b", "#8fd16a", "#ffd23f"],   // mar y pasto
  ["#d94fa0", "#9b59d0", "#1a8fe3", "#3cc8c0", "#52bf70"],   // dulces
  ["#e8574a", "#f08a45", "#ffc933", "#f4a6b8", "#d94fa0"],   // atardecer
  ["#2e9e5b", "#1a8fe3", "#9b59d0", "#e8574a", "#ffc933"]    // fiesta
];

const HANOI_NIVELES = [
  { discos: 2, paleta: 0, ayuda: "total" },
  { discos: 2, paleta: 1, ayuda: "total" },
  { discos: 3, paleta: 2, ayuda: "total" },
  { discos: 3, paleta: 3, ayuda: "total" },
  { discos: 3, paleta: 4, ayuda: "disco" },     // menos pistas
  { discos: 4, paleta: 0, ayuda: "total" },
  { discos: 4, paleta: 1, ayuda: "total" },
  { discos: 4, paleta: 2, ayuda: "disco" },     // más autonomía
  { discos: 5, paleta: 3, ayuda: "total" },
  { discos: 5, paleta: 4, ayuda: "disco" }      // desafío final
];
