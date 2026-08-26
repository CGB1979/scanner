function reasignarDesdeLista(chasis) {
    const v = vehiculos.find(function(x) {
        return x.chasis === chasis;
    });

    if (v) abrirCambioUbicacionVehiculo(v, false);
}

function obtenerOcupacionCarrilNormal(playa, bloque, carril, excluirVehiculo) {
    const ocupadas = [];

    vehiculos.forEach(function(v) {
        if (esPlayaJ(v.playa)) return;
        if (excluirVehiculo && v.id === excluirVehiculo.id) return;
        if (v.playa !== playa || v.bloque !== bloque) return;
        if (obtenerCarrilNormalVehiculo(v) !== carril) return;

        const posicion = obtenerPosicionNormalVehiculo(v);
        if (posicion) ocupadas.push(posicion);
    });

    return ocupadas;
}

function obtenerPosicionLibreCarrilNormal(playa, bloque, carril, excluirVehiculo) {
    const ocupadas = obtenerOcupacionCarrilNormal(
        playa, bloque, carril, excluirVehiculo
    );

    if (!ocupadas.includes("Adelante")) return "Adelante";
    if (!ocupadas.includes("Atrás")) return "Atrás";
    return null;
}

function obtenerPosicionDestinoNormal(playa, bloque, carril, excluirVehiculo) {
    const carrilActual = excluirVehiculo
        ? obtenerCarrilNormalVehiculo(excluirVehiculo)
        : null;

    const mismaUbicacion = excluirVehiculo &&
        excluirVehiculo.playa === playa &&
        excluirVehiculo.bloque === bloque &&
        carrilActual === carril;

    if (mismaUbicacion) {
        const actual = obtenerPosicionNormalVehiculo(excluirVehiculo);
        if (actual) return actual;
    }

    return obtenerPosicionLibreCarrilNormal(
        playa, bloque, carril, excluirVehiculo
    );
}

function abrirCambioUbicacionGeneral() {
    vehiculoCambioUbicacion = null;
    cambioDesdeScanner = false;

    document.getElementById("cambioPlaya").value = playaSelect.value;
    document.getElementById("cambioBloque").value = bloqueSelect.value;

    actualizarControlesCambioUbicacion();
    sugerirNumeroCambio();

    document.getElementById("locationModal").classList.remove("hidden");
}

function abrirCambioUbicacionVehiculo(v, desdeScanner) {
    vehiculoCambioUbicacion = v;
    cambioDesdeScanner = desdeScanner === true;

    document.getElementById("cambioPlaya").value = v.playa;
    document.getElementById("cambioBloque").value = v.bloque;

    actualizarControlesCambioUbicacion();

    if (esPlayaJ(v.playa)) {
        const p = parsearPosicionJ(v.posicion);
        if (p) {
            document.getElementById("cambioJCalle").value = p.calle;
            document.getElementById("cambioJFila").value = p.fila;
        }
    } else {
        document.getElementById("cambioNumero").value =
            obtenerCarrilNormalVehiculo(v) ||
            normalizarCarrilNormal(obtenerInicioNumeracion());
    }

    document.getElementById("locationModal").classList.remove("hidden");
    document.getElementById("scanResult").classList.add("hidden");
    actualizarPreviewCambioUbicacion();
}

function actualizarControlesCambioUbicacion() {
    const esJ = esPlayaJ(document.getElementById("cambioPlaya").value);
    document.getElementById("cambioNumeroContainer").classList.toggle("hidden", esJ);
    document.getElementById("cambioJCalleFilaContainer").classList.toggle("hidden", !esJ);
}

function obtenerProximaPosicionCambio(playa, bloque, vehiculoActual) {
    if (esPlayaJ(playa)) {
        return obtenerProximaPosicionJ(playa, bloque);
    }

    return obtenerProximaUbicacionNormal(
        playa, bloque, vehiculoActual
    );
}

function actualizarPreviewCambioUbicacion() {
    const playa = document.getElementById("cambioPlaya").value;
    const bloque = document.getElementById("cambioBloque").value;
    const hint = document.getElementById("positionHint");
    const preview = document.getElementById("locationPreview");

    if (esPlayaJ(playa)) {
        const calle = parseInt(document.getElementById("cambioJCalle").value, 10);
        const fila = parseInt(document.getElementById("cambioJFila").value, 10);

        if (!Number.isFinite(calle) || calle < 1 ||
            !Number.isFinite(fila) || fila < 1 || fila > 5) {
            preview.innerText = `Nueva ubicacion: Playa ${playa} - Bloque ${bloque}`;
            hint.innerText = "Ingrese un carril y una posicion validos.";
            hint.style.color = "#dc3545";
            return;
        }

        preview.innerText =
            `Nueva ubicacion:\nPlaya ${playa} - Bloque ${bloque}\nCarril ${calle} - Posicion ${fila}`;

        const ocupado = posicionJOcupada(
            playa, bloque, calle, fila, vehiculoCambioUbicacion
        );

        hint.innerText = ocupado
            ? "Esta ubicacion ya esta ocupada. Elija otra."
            : "La ubicacion esta disponible.";
        hint.style.color = ocupado ? "#dc3545" : "#198754";
        return;
    }

    let carril = parseInt(document.getElementById("cambioNumero").value, 10);
    carril = normalizarCarrilNormal(carril);

    const posicion = obtenerPosicionDestinoNormal(
        playa, bloque, carril, vehiculoCambioUbicacion
    );

    preview.innerText = posicion
        ? `Nueva ubicacion:\nPlaya ${playa} - Bloque ${bloque}\nCarril ${carril} - Posición ${posicion}`
        : `Nueva ubicacion:\nPlaya ${playa} - Bloque ${bloque}\nCarril ${carril}`;

    hint.innerText = posicion
        ? `La posición ${posicion} está disponible en este carril.`
        : "Este carril ya tiene las dos posiciones ocupadas.";
    hint.style.color = posicion ? "#198754" : "#dc3545";
}

document.getElementById("cambioPlaya").addEventListener("change", function() {
    actualizarControlesCambioUbicacion();
    sugerirNumeroCambio();
});

document.getElementById("cambioBloque").addEventListener("change", sugerirNumeroCambio);
document.getElementById("cambioNumero").addEventListener("input", actualizarPreviewCambioUbicacion);
document.getElementById("cambioJCalle").addEventListener("input", actualizarPreviewCambioUbicacion);
document.getElementById("cambioJFila").addEventListener("change", actualizarPreviewCambioUbicacion);

function sugerirNumeroCambio() {
    const playa = document.getElementById("cambioPlaya").value;
    const bloque = document.getElementById("cambioBloque").value;

    if (esPlayaJ(playa)) {
        const sugerido = obtenerProximaPosicionJ(playa, bloque);
        const p = parsearPosicionJ(sugerido);
        if (p) {
            document.getElementById("cambioJCalle").value = p.calle;
            document.getElementById("cambioJFila").value = p.fila;
        }
    } else {
        const sugerido = obtenerProximaPosicionCambio(
            playa, bloque, vehiculoCambioUbicacion
        );
        document.getElementById("cambioNumero").value = sugerido.carril;
    }

    actualizarPreviewCambioUbicacion();
}

function confirmarCambioUbicacion() {
    const playa = document.getElementById("cambioPlaya").value;
    const bloque = document.getElementById("cambioBloque").value;

    if (esPlayaJ(playa)) {
        const calle = parseInt(document.getElementById("cambioJCalle").value, 10);
        const fila = parseInt(document.getElementById("cambioJFila").value, 10);

        if (!Number.isFinite(calle) || calle < 1 ||
            !Number.isFinite(fila) || fila < 1 || fila > 5) {
            alert("Ingrese una ubicacion valida.");
            return;
        }

        if (posicionJOcupada(playa, bloque, calle, fila, vehiculoCambioUbicacion)) {
            reproducirSonidoError();
            alert(`La ubicacion ${calle}-${fila} ya esta ocupada en Playa ${playa} - Bloque ${bloque}.`);
            return;
        }

        if (!vehiculoCambioUbicacion) {
            playaSelect.value = playa;
            bloqueSelect.value = bloque;
            filaInicial.value = fila;
            configuracionNumeracion.inicio = calle;
            numeroInicial.value = calle;
            guardarConfiguracionNumeracion();
            actualizarPantalla();
            cerrarCambioUbicacion();
            return;
        }

        actualizarVehiculoUbicacion(
            playa, bloque,
            convertirPosicionJ(calle, fila),
            null,
            `Carril ${calle} - Posicion ${fila}`
        );
        return;
    }

    let carril = parseInt(document.getElementById("cambioNumero").value, 10);
    carril = normalizarCarrilNormal(carril);

    const posicion = obtenerPosicionDestinoNormal(
        playa, bloque, carril, vehiculoCambioUbicacion
    );

    if (!posicion) {
        reproducirSonidoError();
        alert(`El carril ${carril} ya tiene las posiciones Adelante y Atrás ocupadas.`);
        return;
    }

    if (!vehiculoCambioUbicacion) {
        playaSelect.value = playa;
        bloqueSelect.value = bloque;
        numeroInicial.value = carril;
        guardarConfiguracionNumeracion();
        actualizarPantalla();
        cerrarCambioUbicacion();
        return;
    }

    actualizarVehiculoUbicacion(
        playa, bloque,
        posicion,
        carril,
        `Carril ${carril} - ${posicion}`
    );
}

function actualizarVehiculoUbicacion(playa, bloque, posicion, carril, descripcion) {
    const indice = vehiculos.findIndex(function(x) {
        return x.id === vehiculoCambioUbicacion.id;
    });

    if (indice === -1) {
        cerrarCambioUbicacion();
        return;
    }

    const anterior = vehiculos[indice];
    const desdeScanner = cambioDesdeScanner;
    const destino = vehiculos[indice];

    destino.playa = playa;
    destino.bloque = bloque;
    destino.posicion = posicion;

    if (esPlayaJ(playa)) {
        delete destino.carril;
    } else {
        destino.carril = carril;
    }

    destino.fechaModificacion = new Date().toISOString();

    guardarDatos();
    reproducirSonidoNuevo();

    playaSelect.value = playa;
    bloqueSelect.value = bloque;
    actualizarPantalla();
    cerrarCambioUbicacion();

    resultadoPendiente = null;
    ultimoCodigo = null;
    bloqueandoLectura = false;

    if (desdeScanner) {
        actualizarPosicionScanner();
        document.getElementById("scannerStatus").innerText =
            `Ubicacion modificada a Playa ${playa} - Bloque ${bloque} - ${descripcion}.`;
        document.getElementById("scanResult").classList.add("hidden");
    } else {
        alert(`Vehiculo ${anterior.chasis} cambiado a\nPlaya ${playa} - Bloque ${bloque} - ${descripcion}.`);
    }

    vehiculoCambioUbicacion = null;
    cambioDesdeScanner = false;
}

function cerrarCambioUbicacion() {
    document.getElementById("locationModal").classList.add("hidden");
    vehiculoCambioUbicacion = null;
    cambioDesdeScanner = false;

    if (scannerActivo &&
        !document.getElementById("scannerModal").classList.contains("hidden")) {
        document.getElementById("scanResult").classList.add("hidden");
        resultadoPendiente = null;
        ultimoCodigo = null;
        bloqueandoLectura = false;
    }
}

async function cerrarScanner() {
    bloqueandoLectura = true;

    if (scanner) {
        try { await scanner.stop(); } catch (error) { console.log("Error al detener scanner:", error); }
        try { scanner.clear(); } catch (error) { console.log("Error al limpiar scanner:", error); }
    }

    scanner = null;
    scannerActivo = false;
    resultadoPendiente = null;
    ultimoCodigo = null;
    bloqueandoLectura = false;

    const manualModal = document.getElementById("manualCodeModal");
    if (manualModal) manualModal.classList.add("hidden");

    const scannerModal = document.getElementById("scannerModal");
    if (scannerModal) scannerModal.classList.add("hidden");
}

function abrirIngresoManual() {
    const modal = document.getElementById("manualCodeModal");
    const input = document.getElementById("manualCodeInput");

    if (!modal || !input) {
        console.error("No se encontro el modal de ingreso manual.");
        return;
    }

    bloqueandoLectura = true;
    input.value = "";
    modal.classList.remove("hidden");
    setTimeout(function() { input.focus(); }, 100);
}

function cerrarIngresoManual() {
    const modal = document.getElementById("manualCodeModal");
    if (modal) modal.classList.add("hidden");
    ultimoCodigo = null;
    bloqueandoLectura = false;
}

function confirmarIngresoManual() {
    const input = document.getElementById("manualCodeInput");
    if (!input) {
        console.error("No se encontro el campo de ingreso manual.");
        return;
    }

    const chasis = input.value.trim();
    if (!chasis) {
        alert("Ingrese un numero de chasis.");
        input.focus();
        return;
    }

    const modal = document.getElementById("manualCodeModal");
    if (modal) modal.classList.add("hidden");

    ultimoCodigo = chasis;
    procesarCodigo(chasis);
}

function actualizarPosicionScanner() {
    const playa = playaSelect.value;
    const bloque = bloqueSelect.value;
    const proxima = obtenerProximaPosicion(playa, bloque);

    document.getElementById("scannerPlaya").innerText = playa;
    document.getElementById("scannerBloque").innerText = bloque;
    document.getElementById("scannerPosicion").innerText =
        textoProximaUbicacion(playa, proxima);
}
