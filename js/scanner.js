async function abrirScanner() {
    const modal = document.getElementById("scannerModal");
    const status = document.getElementById("scannerStatus");

    if (!modal) {
        console.error("No se encontro scannerModal.");
        alert("No se pudo abrir el escaner: falta el contenedor del escaner.");
        return;
    }

    // Mostrar primero el modal para que el boton siempre tenga respuesta visual.
    modal.classList.remove("hidden");

    try {
        if (typeof guardarConfiguracionNumeracion === "function") {
            guardarConfiguracionNumeracion();
        }

        const playaEl = document.getElementById("scannerPlaya");
        const bloqueEl = document.getElementById("scannerBloque");

        if (playaEl && playaSelect) playaEl.innerText = playaSelect.value;
        if (bloqueEl && bloqueSelect) bloqueEl.innerText = bloqueSelect.value;

        if (typeof actualizarPosicionScanner === "function") {
            actualizarPosicionScanner();
        }

        const scanResult = document.getElementById("scanResult");
        if (scanResult) scanResult.classList.add("hidden");

        bloqueandoLectura = false;
        ultimoCodigo = null;
        scannerActivo = true;

        if (status) {
            status.innerText = "Iniciando camara...";
        }

        if (scanner) {
            try { await scanner.stop(); } catch (e) {}
            try { scanner.clear(); } catch (e) {}
            scanner = null;
        }

        if (typeof Html5Qrcode === "undefined") {
            throw new Error("La biblioteca html5-qrcode no se cargo.");
        }

        scanner = new Html5Qrcode("reader");

        const config = {
            fps: 10,
            qrbox: function(viewfinderWidth, viewfinderHeight) {
                return {
                    width: Math.floor(viewfinderWidth * 0.92),
                    height: Math.min(140, Math.floor(viewfinderHeight * 0.45))
                };
            }
        };

        if (typeof Html5QrcodeSupportedFormats !== "undefined") {
            config.formatsToSupport = [
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.CODE_39,
                Html5QrcodeSupportedFormats.CODE_93,
                Html5QrcodeSupportedFormats.CODABAR,
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.ITF
            ];
        }

        await scanner.start(
            { facingMode: "environment" },
            config,
            codigoDetectado,
            function() {}
        );

        if (status) {
            status.innerText = "Apunte el codigo dentro del recuadro";
        }

    } catch (error) {
        console.error("Error al abrir el scanner:", error);
        if (status) {
            status.innerText = "No se pudo iniciar la camara. Verifique los permisos y que la pagina este en HTTPS.";
        }
    }
}

// Compatibilidad con botones que todavia usen onclick="abrirScanner()".
window.abrirScanner = abrirScanner;

/* ================================
   SONIDOS DEL ESCANER
   ================================ */

let audioContextScanner = null;

function obtenerAudioScanner() {
    if (!audioContextScanner) {
        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {
            return null;
        }

        audioContextScanner = new AudioContext();
    }

    if (audioContextScanner.state === "suspended") {
        audioContextScanner.resume().catch(function() {});
    }

    return audioContextScanner;
}

// ACA la funcion reproducir sonido scanner
function reproducirSonidoNuevo() {

    const ctx = obtenerAudioScanner();

    if (!ctx) {
        return;
    }

    const ahora = ctx.currentTime;

    function bip(frecuencia, inicio, duracion, volumen) {

        const oscilador = ctx.createOscillator();
        const ganancia = ctx.createGain();

        const tiempo = ahora + inicio;

        oscilador.type = "sine";

        oscilador.frequency.setValueAtTime(
            frecuencia,
            tiempo
        );

        ganancia.gain.setValueAtTime(
            0.0001,
            tiempo
        );

        ganancia.gain.exponentialRampToValueAtTime(
            volumen,
            tiempo + 0.008
        );

        ganancia.gain.exponentialRampToValueAtTime(
            0.0001,
            tiempo + duracion
        );

        oscilador.connect(ganancia);
        ganancia.connect(ctx.destination);

        oscilador.start(tiempo);

        oscilador.stop(
            tiempo + duracion + 0.02
        );
    }

    bip(2100, 0, 0.150, 0.16);

    bip(2800, 0.100, 0.100, 0.19);
}
// ACA la funcion sonido error
function reproducirSonidoError() {

    const ctx = obtenerAudioScanner();

    if (!ctx) {
        return;
    }

    const ahora = ctx.currentTime;

    function bip(frecuencia, inicio, duracion) {

        const oscilador = ctx.createOscillator();
        const ganancia = ctx.createGain();

        oscilador.type = "square";

        oscilador.frequency.setValueAtTime(
            frecuencia,
            ahora + inicio
        );

        ganancia.gain.setValueAtTime(
            0.0001,
            ahora + inicio
        );

        ganancia.gain.exponentialRampToValueAtTime(
            0.16,
            ahora + inicio + 0.01
        );

        ganancia.gain.exponentialRampToValueAtTime(
            0.0001,
            ahora + inicio + duracion
        );

        oscilador.connect(ganancia);
        ganancia.connect(ctx.destination);

        oscilador.start(
            ahora + inicio
        );

        oscilador.stop(
            ahora + inicio + duracion + 0.01
        );
    }

    bip(320, 0, 0.13);
    bip(220, 0.16, 0.18);
}


function codigoDetectado(decodedText) {

    if (bloqueandoLectura) {
        return;
    }

    decodedText = String(decodedText).trim();

    if (!decodedText) {
        return;
    }

    if (decodedText === ultimoCodigo) {
        return;
    }

    ultimoCodigo = decodedText;
    bloqueandoLectura = true;

    procesarCodigo(decodedText);

}

function procesarCodigo(chasis) {

    const encontrado = vehiculos.find(function(v) {
        return String(v.chasis).toLowerCase() === String(chasis).toLowerCase();
    });

    if (encontrado) {
        reproducirSonidoError();
        mostrarVehiculoExistente(encontrado);
        return;
    }

    reproducirSonidoNuevo();

    const ubicacion = obtenerUbicacionSeleccionada();
    const proxima = obtenerProximaPosicion(
        ubicacion.playa,
        ubicacion.bloque
    );

    resultadoPendiente = {
        tipo: "nuevo",
        chasis: chasis,
        playa: ubicacion.playa,
        bloque: ubicacion.bloque
    };

    let infoUbicacion = "";

    if (esPlayaJ(ubicacion.playa)) {

        resultadoPendiente.posicion = String(proxima);

        const p = parsearPosicionJ(proxima);

        if (p) {
            infoUbicacion = `
                <strong>Bloque:</strong> ${escapeHTML(ubicacion.bloque)}<br>
                <strong>Carril:</strong> ${escapeHTML(p.calle)}<br>
                <strong>Posicion:</strong> ${escapeHTML(p.fila)}<br>
                <strong>Ubicacion:</strong>
                <span style="font-size:22px;font-weight:bold;margin-left:5px;">
                    ${escapeHTML(proxima)}
                </span>
            `;
        }

    } else {

        resultadoPendiente.carril = proxima.carril;
        resultadoPendiente.posicion = proxima.posicion;

        infoUbicacion = `
            <strong>Bloque:</strong> ${escapeHTML(ubicacion.bloque)}<br>
            <strong>Carril:</strong> ${escapeHTML(proxima.carril)}<br>
            <strong>Posición:</strong> ${escapeHTML(proxima.posicion)}
        `;
    }

    document.getElementById("scanTitulo").innerText = "Vehiculo detectado";

    document.getElementById("scanInfo").innerHTML = `
        <strong>Chasis:</strong><br>
        ${escapeHTML(chasis)}
        <br><br>
        <strong>Playa:</strong> ${escapeHTML(ubicacion.playa)}
        <br>
        ${infoUbicacion}
    `;

    document.getElementById("btnAceptarScan").innerText = "Aceptar y guardar";
    document.getElementById("btnAceptarScan").className = "btn-success";
    document.getElementById("scanResult").classList.remove("hidden");
    document.getElementById("scannerStatus").innerText =
        "Verifique los datos y presione Aceptar.";
}

function mostrarVehiculoExistente(v) {

    resultadoPendiente = {
        tipo: "existente",
        vehiculo: v
    };

    document.getElementById("scanTitulo").innerText = "Vehiculo ya registrado";

    let ubicacionActual = "";

    if (esPlayaJ(v.playa)) {
        const p = parsearPosicionJ(v.posicion);
        if (p) {
            ubicacionActual = `Playa ${escapeHTML(v.playa)} - Bloque ${escapeHTML(v.bloque)}<br>Carril ${escapeHTML(p.calle)} - Posicion ${escapeHTML(p.fila)}`;
        }
    } else {
        const carril = obtenerCarrilNormalVehiculo(v);
        const posicion = obtenerPosicionNormalVehiculo(v);
        ubicacionActual = `Playa ${escapeHTML(v.playa)} - Bloque ${escapeHTML(v.bloque)}<br>Carril ${escapeHTML(carril)} - Posición ${escapeHTML(posicion)}`;
    }

    document.getElementById("scanInfo").innerHTML = `
        <div class="warning">
            <strong>Chasis:</strong><br>
            ${escapeHTML(v.chasis)}
            <br><br>
            <strong>Ubicacion actual:</strong><br>
            ${ubicacionActual}
        </div>
        <strong>¿Desea cambiar la ubicacion?</strong>
    `;

    document.getElementById("btnAceptarScan").innerText = "Cambiar ubicacion";
    document.getElementById("btnAceptarScan").className = "btn-warning";
    document.getElementById("scanResult").classList.remove("hidden");
    document.getElementById("scannerStatus").innerText =
        "Puede modificar playa, bloque y ubicacion.";
}

function aceptarScan() {

    if (!resultadoPendiente) {
        return;
    }

    if (resultadoPendiente.tipo === "nuevo") {

        guardarNuevoVehiculo();

        return;

    }

    if (resultadoPendiente.tipo === "existente") {

        abrirCambioUbicacionVehiculo(
            resultadoPendiente.vehiculo,
            true
        );

    }

}

function guardarNuevoVehiculo() {

    const r = resultadoPendiente;

    const nuevo = {
        id: Date.now(),
        chasis: r.chasis,
        playa: r.playa,
        bloque: r.bloque,
        fecha: new Date().toISOString()
    };

    if (esPlayaJ(nuevo.playa)) {

        nuevo.posicion = String(r.posicion);

        const p = parsearPosicionJ(nuevo.posicion);

        if (p && posicionJOcupada(nuevo.playa, nuevo.bloque, p.calle, p.fila)) {
            reproducirSonidoError();
            alert(`La ubicacion ${nuevo.posicion} ya esta ocupada.`);
            ultimoCodigo = null;
            bloqueandoLectura = false;
            return;
        }

    } else {

        nuevo.carril = normalizarCarrilNormal(r.carril);
        nuevo.posicion = r.posicion === "Atrás" ? "Atrás" : "Adelante";
    }

    vehiculos.push(nuevo);
    guardarDatos();
    actualizarPantalla();

    document.getElementById("scanResult").classList.add("hidden");

    resultadoPendiente = null;
    ultimoCodigo = null;
    bloqueandoLectura = false;

    actualizarPosicionScanner();

    const ubicacionGuardada = esPlayaJ(nuevo.playa)
        ? nuevo.posicion
        : `Carril ${nuevo.carril} - ${nuevo.posicion}`;

    document.getElementById("scannerStatus").innerText =
        `Guardado en ${ubicacionGuardada}. Escanee el siguiente vehiculo.`;
}

function cancelarResultadoScan() {

    resultadoPendiente = null;

    document
        .getElementById("scanResult")
        .classList
        .add("hidden");

    ultimoCodigo = null;
    bloqueandoLectura = false;

    // EDITABLE: mensaje despues de cancelar
    document
        .getElementById("scannerStatus")
        .innerText =
        "Apunte la camara al siguiente codigo.";

}
