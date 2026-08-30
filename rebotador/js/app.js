document.addEventListener("DOMContentLoaded", () => {
  actualizarSelectores();
  actualizarPantalla();
  actualizarEstadoExcel();
  ajustarBotonesExcel();
});

function volverAlEscanerNormal() {
  // El Rebotador vive dentro de /scanner/rebotador/, por lo que ../
  // vuelve al escáner principal.
  window.location.href = "../";
}
