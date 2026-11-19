/* ==========================================================
   Piensa y Ordena - Lógica general
   Etapa 3: pantalla de inicio
   ========================================================== */

const btnComenzar = document.getElementById("btn-comenzar");
const btnGuia = document.getElementById("btn-guia");
const btnCerrarGuia = document.getElementById("btn-cerrar-guia");
const guia = document.getElementById("guia");
const aviso = document.getElementById("aviso");

// Abrir y cerrar la guía didáctica
btnGuia.addEventListener("click", function () {
  guia.showModal();
});

btnCerrarGuia.addEventListener("click", function () {
  guia.close();
});

// Cerrar también al tocar fuera de la tarjeta
guia.addEventListener("click", function (evento) {
  if (evento.target === guia) {
    guia.close();
  }
});

// TEMPORAL: en la etapa 4 este botón llevará al mapa de contenidos.
// Por ahora solo muestra un mensaje para comprobar que responde al clic.
btnComenzar.addEventListener("click", function () {
  aviso.textContent = "Muy pronto podrás empezar. Falta construir la navegación.";
});
