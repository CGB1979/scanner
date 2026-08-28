function buscarVehiculo() {

    const texto =
        document
            .getElementById("buscarChasis")
            .value
            .trim()
            .toLowerCase();

    const resultado =
        document
            .getElementById("resultadoBusqueda");

    if (!texto) {

        resultado.innerHTML = "";

        return;

    }

    const encontrados =
        vehiculos.filter(
            function(v) {

                return String(v.chasis)
                    .toLowerCase()
                    .includes(texto);

            }
        );

    if (encontrados.length === 0) {

        // EDITABLE: mensaje cuando no se encuentra el vehiculo
        resultado.innerHTML = `

            <div class="danger-message">
                No se encontro ningun vehiculo.
            </div>

        `;

        return;

    }

    resultado.innerHTML =
        encontrados
            .map(function(v) {

                let ubicacion = "";

                if (esPlayaEspecial(v.playa)) {

                    const p =
                        parsearPosicionEspecial(
                            v.posicion
                        );

                    if (p) {

                        // EDITABLE: informacion de ubicacion en resultados de busqueda
                        ubicacion = `

                            Playa ${escapeHTML(v.playa)}
                            -
                            Bloque ${escapeHTML(v.bloque)}

                            <br>

                            Carril ${escapeHTML(p.calle)}
                            -
                            Posicion ${escapeHTML(p.fila)}

                            <br>

                            Ubicacion ${escapeHTML(v.posicion)}

                        `;

                    } else {

                        // EDITABLE: informacion de ubicacion en resultados de busqueda
                        ubicacion = `

                            Playa ${escapeHTML(v.playa)}
                            -
                            Bloque ${escapeHTML(v.bloque)}
                            -
                            Ubicacion ${escapeHTML(v.posicion)}

                        `;

                    }

                } else {

                    // EDITABLE: informacion de ubicacion en resultados de busqueda
                    ubicacion = `

                        Playa ${escapeHTML(v.playa)}
                        -
                        Bloque ${escapeHTML(v.bloque)}
                        -
                        Ubicacion ${escapeHTML(v.posicion)}

                    `;

                }

                return `

                    <div class="success-message">

                        <strong>
                            ${escapeHTML(v.chasis)}
                        </strong>

                        <br><br>

                        ${ubicacion}

                        <br><br>

                        <!-- EDITABLE: texto del boton -->
                        <button
                            class="btn-warning"
                            onclick="reasignarDesdeLista('${escapeJS(v.chasis)}')">
                            Cambiar ubicacion
                        </button>

                    </div>

                `;

            })
            .join("");

}

function eliminarVehiculo(chasis) {

    const v =
        vehiculos.find(
            function(x) {
                return x.chasis === chasis;
            }
        );

    if (!v) {
        return;
    }

    // EDITABLE: titulo del mensaje de eliminacion
    document
        .getElementById("confirmTitulo")
        .innerText =
        "Eliminar vehiculo";

    let ubicacion = `

        Playa ${escapeHTML(v.playa)}
        -
        Bloque ${escapeHTML(v.bloque)}
        -
        Ubicacion ${escapeHTML(v.posicion)}

    `;

    if (esPlayaEspecial(v.playa)) {

        const p =
            parsearPosicionEspecial(
                v.posicion
            );

        if (p) {

            ubicacion = `

                Playa ${escapeHTML(v.playa)}
                -
                Bloque ${escapeHTML(v.bloque)}

                <br>

                Carril ${escapeHTML(p.calle)}
                -
                Posicion ${escapeHTML(p.fila)}

                <br>

                Ubicacion ${escapeHTML(v.posicion)}

            `;

        }

    }

    document
        .getElementById("confirmMensaje")
        .innerHTML = `

        <div class="danger-message">

            <!-- EDITABLE: etiqueta -->
            <strong>Chasis:</strong><br>

            ${escapeHTML(v.chasis)}

            <br><br>

            ${ubicacion}

        </div>

        <!-- EDITABLE: pregunta de confirmacion -->
        &iquest;Esta seguro de eliminar este registro?

    `;

    document
        .getElementById("confirmAceptar")
        .onclick =
        function() {

            vehiculos =
                vehiculos.filter(
                    function(x) {
                        return x.id !== v.id;
                    }
                );

            guardarDatos();
            cerrarConfirmacion();
            actualizarPantalla();

        };

    document
        .getElementById("confirmModal")
        .classList
        .remove("hidden");

}

function confirmarBorrarTodo() {

    if (vehiculos.length === 0) {

        // EDITABLE: mensaje cuando no hay registros
        mostrarAlerta(
            "No hay registros para borrar."
        );

        return;

    }

    // EDITABLE: titulo de confirmacion
    document
        .getElementById("confirmTitulo")
        .innerText =
        "Borrar todos los datos";

    document
        .getElementById("confirmMensaje")
        .innerHTML = `

        <div class="danger-message">

            <!-- EDITABLE: mensaje de advertencia -->
            Esta accion eliminara

            <strong>
                ${vehiculos.length}
            </strong>

            <!-- EDITABLE: texto -->
            vehiculos registrados.

            <br><br>

            <!-- EDITABLE: advertencia -->
            Esta accion no se puede deshacer.

        </div>

        <!-- EDITABLE: pregunta de confirmacion -->
        &iquest;Esta seguro?

    `;

    document
        .getElementById("confirmAceptar")
        .onclick =
        function() {

            vehiculos = [];

            guardarDatos();
            cerrarConfirmacion();
            actualizarPantalla();

        };

    document
        .getElementById("confirmModal")
        .classList
        .remove("hidden");

}

function cerrarConfirmacion() {

    document
        .getElementById("confirmModal")
        .classList
        .add("hidden");

}

function guardarDatos() {

    localStorage.setItem(
        "vehiculosPlaya",
        JSON.stringify(vehiculos)
    );

}

async function exportarCSV() {
async function exportarCSV() {

    const contenido = `<?xml version="1.0" encoding="UTF-8"?>
<prueba>
    <mensaje>Prueba de compartir archivo XML</mensaje>
</prueba>`;

    const archivo = new File(
        [contenido],
        "prueba_compartir.xml",
        {
            type: "application/xml"
        }
    );

    if (!navigator.share) {

        mostrarAlerta(
            "Este navegador no admite compartir."
        );

        return;

    }

    try {

        await navigator.share({
            files: [archivo]
        });

    } catch (error) {

        console.error("Error real:", error);

        if (
            error.name !== "AbortError"
        ) {

            mostrarAlerta(
                "Error al compartir: " +
                error.name
            );

        }

    }

}
function escapeHTML(text) {

    return String(text)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}

function escapeJS(text) {

    return String(text)

        .replace(
            /\\/g,
            "\\\\"
        )

        .replace(
            /'/g,
            "\\'"
        );

}
