let scanner = null;
let scannerActivo = false;
let bloqueandoLectura = false;
let vehiculoActual = null;
let modoCambio = "existente";


async function abrirScanner() {

    if (!datosExcel.workbook) {
        alert("Primero cargue un archivo Excel.");
        return;
    }


    document
        .getElementById("scannerModal")
        .classList
        .remove("hidden");


    document
        .getElementById("scanResult")
        .classList
        .add("hidden");


    document
        .getElementById("btnIngresarManual")
        .classList
        .remove("hidden");


    document
        .getElementById("btnSalirScanner")
        .classList
        .remove("hidden");


    bloqueandoLectura = false;


    /*
       Si el escáner ya está funcionando,
       no reiniciar la cámara.
    */

    if (scannerActivo && scanner) {

        document
            .getElementById("scannerStatus")
            .textContent =
            "Apunte la cámara al código de barras";

        return;
    }


    scannerActivo = true;


    try {

        if (scanner) {

            try {
                await scanner.stop();
            } catch (e) {}


            try {
                await scanner.clear();
            } catch (e) {}


            scanner = null;
        }


        scanner =
            new Html5Qrcode("reader");


        await scanner.start(

            {
                facingMode: "environment"
            },

            {
                fps: 10,

                qrbox: {
                    width: 280,
                    height: 130
                },

                formatsToSupport: [
                    Html5QrcodeSupportedFormats.CODE_128,
                    Html5QrcodeSupportedFormats.CODE_39,
                    Html5QrcodeSupportedFormats.CODE_93,
                    Html5QrcodeSupportedFormats.CODABAR,
                    Html5QrcodeSupportedFormats.EAN_13,
                    Html5QrcodeSupportedFormats.EAN_8,
                    Html5QrcodeSupportedFormats.UPC_A,
                    Html5QrcodeSupportedFormats.UPC_E,
                    Html5QrcodeSupportedFormats.ITF
                ]
            },


            function (textoDetectado) {

                if (!scannerActivo) {
                    return;
                }


                if (bloqueandoLectura) {
                    return;
                }


                procesarCodigo(textoDetectado);
            }

        );


        document
            .getElementById("scannerStatus")
            .textContent =
            "Apunte la cámara al código de barras";


    } catch (e) {

        console.error(e);


        scannerActivo = false;


        document
            .getElementById("scannerStatus")
            .textContent =
            "No se pudo acceder a la cámara. Use el ingreso manual.";

    }

}


function detenerCamara() {

    if (scanner && scannerActivo) {

        scanner
            .stop()
            .catch(() => {});

    }


    scannerActivo = false;

}


function procesarCodigo(codigo) {

    if (bloqueandoLectura) {
        return;
    }


    /*
       Bloqueamos temporalmente nuevas lecturas,
       pero NO detenemos la cámara.
    */

    bloqueandoLectura = true;


    const codigoNormalizado =
        normalizar(codigo);


    const exactos =
        vehiculos.filter(
            v =>
                key(v.chasis) ===
                key(codigoNormalizado)
        );


    if (exactos.length) {

        mostrarVehiculo(
            exactos[0]
        );

    } else {

        mostrarNoEncontrado(
            codigoNormalizado
        );

    }

}


function mostrarVehiculo(v) {

    vehiculoActual = v;

    modoCambio = "existente";


    document
        .getElementById("scanTitulo")
        .textContent =
        "Vehículo encontrado";


    document
        .getElementById("scanInfo")
        .innerHTML = `

        <div class="scan-info">

            <strong>Chasis:</strong>
            ${escapeHTML(v.chasis)}

            <br>

            ${escapeHTML(
                ubicacionTexto(v)
            )}

            ${
                v.movidoDesde
                    ? `
                        <div class="vehicle-moved">
                            Movido desde:
                            ${escapeHTML(v.movidoDesde)}
                        </div>
                    `
                    : ""
            }

        </div>

    `;


    document
        .getElementById("scanButtons")
        .innerHTML = `

        <button
            class="btn-secondary"
            onclick="cancelarResultadoScan()"
        >
            Cancelar
        </button>

        <button
            class="btn-danger"
            onclick="borrarDesdeScan()"
        >
            Borrar
        </button>

        <button
            class="btn-warning"
            onclick="cambiarDesdeScan()"
        >
            Cambiar ubicación
        </button>

    `;


    document
        .getElementById("scanResult")
        .classList
        .remove("hidden");


    document
        .getElementById("btnIngresarManual")
        .classList
        .add("hidden");


    document
        .getElementById("btnSalirScanner")
        .classList
        .add("hidden");


    document
        .getElementById("scannerStatus")
        .textContent =
        "Resultado encontrado";

}


function mostrarNoEncontrado(codigo) {

    vehiculoActual = {

        id:
            "nuevo-" +
            Date.now(),

        chasis:
            codigo,

        playa:
            "",

        bloque:
            "",

        carril:
            "",

        posicion:
            "",

        observaciones:
            ""

    };


    modoCambio = "nuevo";


    document
        .getElementById("scanTitulo")
        .textContent =
        "El vehículo no está en el listado";


    document
        .getElementById("scanInfo")
        .innerHTML = `

        <div class="scan-info">

            <strong>
                Chasis escaneado:
            </strong>

            ${escapeHTML(codigo)}

            <br>

            Puede salir o indicar una nueva ubicación
            para agregarlo al Excel cargado.

        </div>

    `;


    document
        .getElementById("scanButtons")
        .innerHTML = `

        <button
            class="btn-secondary"
            onclick="cancelarResultadoScan()"
        >
            Continuar escaneando
        </button>

        <button
            class="btn-warning"
            onclick="cambiarDesdeScan()"
        >
            Cambiar ubicación
        </button>

    `;


    document
        .getElementById("scanResult")
        .classList
        .remove("hidden");


    document
        .getElementById("btnIngresarManual")
        .classList
        .add("hidden");


    document
        .getElementById("btnSalirScanner")
        .classList
        .add("hidden");


    document
        .getElementById("scannerStatus")
        .textContent =
        "Vehículo no encontrado";

}


/*
   Cierra únicamente el resultado y vuelve
   inmediatamente al modo de escaneo.

   La cámara nunca se detuvo.
*/

function cancelarResultadoScan() {

    continuarEscaneo();

}


/*
   Borra el vehículo del listado
   y continúa escaneando.
*/

function borrarDesdeScan() {

    if (!vehiculoActual) {
        return;
    }


    eliminarVehiculo(
        vehiculoActual.id
    );


    vehiculoActual = null;


    continuarEscaneo(
        "Vehículo eliminado. Continúe escaneando."
    );

}


function cambiarDesdeScan() {

    if (!vehiculoActual) {
        return;
    }


    abrirCambioUbicacionVehiculo(
        vehiculoActual.id,
        vehiculoActual
    );

}


/*
   Esta función se utiliza desde otros
   archivos después de cerrar el modal
   de ubicación.

   No reinicia la cámara.
   Solo vuelve a habilitar la lectura.
*/

function continuarEscaneo(
    mensaje = "Apunte la cámara al código de barras"
) {

    if (!scannerActivo) {
        return;
    }


    document
        .getElementById("scanResult")
        .classList
        .add("hidden");


    document
        .getElementById("btnIngresarManual")
        .classList
        .remove("hidden");


    document
        .getElementById("btnSalirScanner")
        .classList
        .remove("hidden");


    /*
       IMPORTANTE:

       La cámara sigue funcionando.

       Solamente liberamos el bloqueo
       para que pueda procesar el
       próximo código.
    */

    bloqueandoLectura = false;


    vehiculoActual = null;


    document
        .getElementById("scannerStatus")
        .textContent =
        mensaje;

}


async function cerrarScanner() {

    /*
       ESTA ES LA ÚNICA FUNCIÓN QUE
       DETIENE REALMENTE EL ESCÁNER.
    */

    bloqueandoLectura = true;


    scannerActivo = false;


    if (scanner) {

        try {

            await scanner.stop();

        } catch (e) {}


        try {

            await scanner.clear();

        } catch (e) {}

    }


    scanner = null;


    document
        .getElementById("scannerModal")
        .classList
        .add("hidden");


    document
        .getElementById("scanResult")
        .classList
        .add("hidden");


    document
        .getElementById("btnIngresarManual")
        .classList
        .remove("hidden");


    document
        .getElementById("btnSalirScanner")
        .classList
        .remove("hidden");


    vehiculoActual = null;


    bloqueandoLectura = false;

}


function abrirIngresoManual() {

    document
        .getElementById("manualCodeModal")
        .classList
        .remove("hidden");


    document
        .getElementById("manualCodeInput")
        .value = "";


    setTimeout(() => {

        document
            .getElementById("manualCodeInput")
            .focus();

    }, 50);

}


function cerrarIngresoManual() {

    document
        .getElementById("manualCodeModal")
        .classList
        .add("hidden");

}


function confirmarIngresoManual() {

    const codigo =
        normalizar(
            document
                .getElementById(
                    "manualCodeInput"
                )
                .value
        );


    if (codigo.length < 4) {

        alert(
            "Ingrese al menos 4 caracteres."
        );

        return;

    }


    cerrarIngresoManual();


    const resultados =
        vehiculos.filter(
            v =>
                key(v.chasis)
                    .includes(
                        key(codigo)
                    )
        );


    if (resultados.length === 1) {

        bloqueandoLectura = true;


        mostrarVehiculo(
            resultados[0]
        );

        return;

    }


    if (resultados.length > 1) {

        bloqueandoLectura = true;


        mostrarCoincidencias(
            resultados
        );

        return;

    }


    bloqueandoLectura = true;


    mostrarNoEncontrado(
        codigo
    );

}


function mostrarCoincidencias(resultados) {

    document
        .getElementById("listaCoincidencias")
        .innerHTML =

        resultados
            .map(v => `

                <button
                    class="coincidencia-item"
                    onclick="seleccionarCoincidencia('${v.id}')"
                >

                    <strong>
                        ${escapeHTML(v.chasis)}
                    </strong>

                    <br>

                    <span>
                        ${escapeHTML(
                            ubicacionTexto(v)
                        )}
                    </span>

                </button>

            `)
            .join("");


    document
        .getElementById("coincidenciasModal")
        .classList
        .remove("hidden");

}


function cerrarCoincidencias() {

    document
        .getElementById("coincidenciasModal")
        .classList
        .add("hidden");


    /*
       Si se cancela la selección manual,
       vuelve al escaneo continuo.
    */

    continuarEscaneo();

}


function seleccionarCoincidencia(id) {

    document
        .getElementById("coincidenciasModal")
        .classList
        .add("hidden");


    const vehiculo =
        vehiculos.find(
            v =>
                v.id === id
        );


    if (!vehiculo) {

        continuarEscaneo();

        return;

    }


    bloqueandoLectura = true;


    mostrarVehiculo(
        vehiculo
    );

}
