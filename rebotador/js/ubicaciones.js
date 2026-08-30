function opcionesPlayasCambio() {
  return PLAYAS_DISPONIBLES.slice();
}

function opcionesBloquesCambio() {
  return BLOQUES_DISPONIBLES.slice();
}

function esIdNuevo(id) {
  return String(id || "").startsWith("nuevo-");
}

function obtenerCarrilesExistentes(playa, bloque) {
  return [...new Set(
    vehiculos
      .filter(v =>
        v.playa === playa &&
        v.bloque === bloque &&
        normalizar(v.carril)
      )
      .map(v => normalizar(v.carril))
  )].sort((a, b) => {
    const na = Number(a);
    const nb = Number(b);

    if (Number.isFinite(na) && Number.isFinite(nb)) {
      return na - nb;
    }

    return a.localeCompare(b, "es", { numeric: true });
  });
}

function obtenerOpcionesPosicion(playa) {
  return esPlayaEspecial(playa)
    ? ["1", "2", "3", "4", "5"]
    : ["Adelante", "Atrás"];
}

function ubicacionOcupada(playa, bloque, carril, posicion, excluirId = "") {
  return vehiculos.some(v =>
    v.id !== excluirId &&
    v.playa === playa &&
    v.bloque === bloque &&
    normalizar(v.carril) === normalizar(carril) &&
    key(v.posicion) === key(posicion)
  );
}

function posicionesLibres(playa, bloque, carril, excluirId = "") {
  return obtenerOpcionesPosicion(playa).filter(posicion =>
    !ubicacionOcupada(playa, bloque, carril, posicion, excluirId)
  );
}

function siguienteCarril(playa, bloque) {
  const existentes = obtenerCarrilesExistentes(playa, bloque)
    .map(Number)
    .filter(Number.isFinite);

  if (!existentes.length) {
    return esPlayaEspecial(playa) ? "1" : "1";
  }

  const mayor = Math.max(...existentes);

  return String(
    esPlayaEspecial(playa)
      ? mayor + 1
      : (mayor % 2 === 0 ? mayor + 1 : mayor + 2)
  );
}

function obtenerCarrilesCambio(playa, bloque, excluirId = "") {
  const existentes = obtenerCarrilesExistentes(playa, bloque);
  const conEspacio = existentes.filter(carril =>
    posicionesLibres(playa, bloque, carril, excluirId).length > 0
  );

  const siguiente = siguienteCarril(playa, bloque);

  const resultado = [...new Set([...conEspacio, siguiente])];

  return resultado.sort((a, b) => Number(a) - Number(b));
}

function llenarSelect(id, valores, valorSeleccionado = "", textoInicial = "Seleccionar") {
  const select = document.getElementById(id);

  select.innerHTML =
    `<option value="">${textoInicial}</option>` +
    valores.map(valor =>
      `<option value="${escapeHTML(valor)}">${escapeHTML(valor)}</option>`
    ).join("");

  if (valores.includes(valorSeleccionado)) {
    select.value = valorSeleccionado;
  } else if (valores.length) {
    select.value = valores[0];
  } else {
    select.value = "";
  }
}

function cargarPlayasCambio(valor = "") {
  llenarSelect("cambioPlaya", opcionesPlayasCambio(), valor, "Seleccionar playa");
}

function cargarBloquesCambio(valor = "") {
  llenarSelect("cambioBloque", opcionesBloquesCambio(), valor, "Seleccionar bloque");
}

function cargarCarrilesCambio(playa, bloque, valor = "", excluirId = "") {
  llenarSelect(
    "cambioCarril",
    obtenerCarrilesCambio(playa, bloque, excluirId),
    valor,
    "Seleccionar carril"
  );
}

function cargarPosicionesCambio(playa, bloque, carril, valor = "", excluirId = "") {
  const label = document.getElementById("labelCambioPosicion");
  const select = document.getElementById("cambioPosicion");

  label.textContent = esPlayaEspecial(playa) ? "Posición" : "Ubicación";

  let libres = posicionesLibres(playa, bloque, carril, excluirId);

  if (
    valor &&
    !libres.includes(valor) &&
    vehiculoActual &&
    vehiculoActual.id === excluirId
  ) {
    libres = [...libres, valor];
  }

  if (esPlayaEspecial(playa)) {
    libres.sort((a, b) => Number(a) - Number(b));
  }

  select.innerHTML =
    `<option value="">Seleccionar ${esPlayaEspecial(playa) ? "posición" : "ubicación"}</option>` +
    libres.map(posicion =>
      `<option value="${escapeHTML(posicion)}">${escapeHTML(posicion)}</option>`
    ).join("");

  if (valor && libres.includes(valor)) {
    select.value = valor;
  } else if (libres.length) {
    select.value = libres[0];
  } else {
    select.value = "";
  }
}

function actualizarCambioDesdePlaya() {
  if (!vehiculoActual) return;

  const playa = document.getElementById("cambioPlaya").value;
  const bloque = document.getElementById("cambioBloque").value;

  cargarCarrilesCambio(playa, bloque, "", vehiculoActual.id);

  const carril = document.getElementById("cambioCarril").value;

  cargarPosicionesCambio(
    playa,
    bloque,
    carril,
    "",
    vehiculoActual.id
  );
}

function actualizarCambioDesdeBloque() {
  actualizarCambioDesdePlaya();
}

function actualizarCambioDesdeCarril() {
  if (!vehiculoActual) return;

  const playa = document.getElementById("cambioPlaya").value;
  const bloque = document.getElementById("cambioBloque").value;
  const carril = document.getElementById("cambioCarril").value;

  cargarPosicionesCambio(
    playa,
    bloque,
    carril,
    "",
    vehiculoActual.id
  );
}

function abrirCambioUbicacionVehiculo(id, obj) {
  const v = obj || vehiculos.find(x => x.id === id);

  if (!v) return;

  vehiculoActual = v;

  document.getElementById("cambioChasis").textContent = v.chasis;

  if (v.playa || v.bloque || v.carril || v.posicion) {
    document.getElementById("cambioUbicacionActual").innerHTML =
      `Playa ${escapeHTML(v.playa || "—")} - Bloque ${escapeHTML(v.bloque || "—")}<br>` +
      `Carril ${escapeHTML(v.carril || "—")} - ${esPlayaEspecial(v.playa) ? "Posición" : "Ubicación"} ${escapeHTML(v.posicion || "—")}`;
  } else {
    document.getElementById("cambioUbicacionActual").textContent =
      "Vehículo no registrado en el listado.";
  }

  const playaInicial = v.playa || playaSelect.value || PLAYAS_DISPONIBLES[0];
  const bloqueInicial = v.bloque || bloqueSelect.value || BLOQUES_DISPONIBLES[0];

  cargarPlayasCambio(playaInicial);
  cargarBloquesCambio(bloqueInicial);

  cargarCarrilesCambio(
    playaInicial,
    bloqueInicial,
    v.carril || "",
    v.id
  );

  const carrilInicial = document.getElementById("cambioCarril").value;

  cargarPosicionesCambio(
    playaInicial,
    bloqueInicial,
    carrilInicial,
    v.posicion || "",
    v.id
  );

  document.getElementById("scanResult").classList.add("hidden");
  document.getElementById("locationModal").classList.remove("hidden");
}

function cerrarCambioUbicacion() {
  document.getElementById("locationModal").classList.add("hidden");

  if (scannerActivo) {
    continuarEscaneo();
  }
}

function confirmarCambioUbicacion() {
  if (!vehiculoActual) return;

  const playa = normalizar(document.getElementById("cambioPlaya").value);
  const bloque = normalizar(document.getElementById("cambioBloque").value);
  const carril = normalizar(document.getElementById("cambioCarril").value);
  const posicion = normalizar(document.getElementById("cambioPosicion").value);

  if (!playa || !bloque || !carril || !posicion) {
    alert("Complete Playa, Bloque, Carril y Ubicación/Posición.");
    return;
  }

  if (ubicacionOcupada(playa, bloque, carril, posicion, vehiculoActual.id)) {
    alert("La ubicación seleccionada ya está ocupada.");
    return;
  }

  const anterior = (vehiculoActual.playa || vehiculoActual.bloque || vehiculoActual.carril || vehiculoActual.posicion)
    ? ubicacionTexto(vehiculoActual)
    : `Playa ${playaSelect.value || "no informada"} - Bloque ${bloqueSelect.value || "no informado"}`;

  const esNuevo = !vehiculos.some(v => v.id === vehiculoActual.id);

  vehiculoActual.playa = playa;
  vehiculoActual.bloque = bloque;
  vehiculoActual.carril = carril;
  vehiculoActual.posicion = posicion;
  vehiculoActual.movidoDesde = anterior;

  const movimiento = `Movido desde ${anterior}`;

  vehiculoActual.observaciones = vehiculoActual.observaciones
    ? `${vehiculoActual.observaciones} | ${movimiento}`
    : movimiento;

  if (esNuevo) {
    vehiculos.push(vehiculoActual);
  }

  actualizarPantalla();
  actualizarEstadoExcel();

  document.getElementById("locationModal").classList.add("hidden");

  if (scannerActivo) {
    continuarEscaneo("Ubicación guardada. Continúe escaneando.");
  }
}

document.getElementById("cambioPlaya").addEventListener("change", actualizarCambioDesdePlaya);
document.getElementById("cambioBloque").addEventListener("change", actualizarCambioDesdeBloque);
document.getElementById("cambioCarril").addEventListener("change", actualizarCambioDesdeCarril);
