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

let archivoExcelTemporal = null;
let nombreArchivoExcelTemporal = "vehiculos_playa.xlsx";

async function exportarCSV() {

    if (vehiculos.length === 0) {
        mostrarAlerta("No hay vehiculos registrados para exportar.");
        return;
    }

    try {

        mostrarCargandoExcel();

        // Permitimos que el modal de carga se pinte antes del trabajo pesado.
        await new Promise(resolve => setTimeout(resolve, 50));

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Vehiculos");

        worksheet.columns = [
            { header: "Numero de chasis", key: "chasis", width: 25 },
            { header: "Playa", key: "playa", width: 15 },
            { header: "Bloque", key: "bloque", width: 15 },
            { header: "Carril", key: "calle", width: 15 },
            { header: "Posicion", key: "fila", width: 15 },
            { header: "Ubicacion", key: "ubicacion", width: 18 }
        ];

        const encabezado = worksheet.getRow(1);

        encabezado.font = {
            bold: true,
            color: { argb: "FFFFFFFF" }
        };

        for (let c = 1; c <= 6; c++) {
            encabezado.getCell(c).fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "70AD47" }
            };
        }

        encabezado.alignment = {
            vertical: "middle",
            horizontal: "center"
        };

        encabezado.height = 25;

        for (let i = 0; i < vehiculos.length; i++) {

            const v = vehiculos[i];

            let calle = "";
            let fila = "";
            let ubicacion = "";

            if (esPlayaEspecial(v.playa)) {

                const p = parsearPosicionEspecial(v.posicion);

                if (p) {
                    calle = String(p.calle);
                    fila = String(p.fila);
                    ubicacion = `${v.playa} - ${v.bloque} - ${p.calle} - ${p.fila}`;
                } else {
                    ubicacion = `${v.playa} - ${v.bloque} - ${String(v.posicion)}`;
                }

            } else {

                const p = obtenerUbicacionNormal(v.posicion);

                if (p) {
                    calle = String(p.carril);
                    fila = String(p.posicion);
                    ubicacion = `${v.playa} - ${v.bloque} - ${p.carril}`;
                } else {
                    ubicacion = `${v.playa} - ${v.bloque} - ${String(v.posicion)}`;
                }

            }

            const filaExcel = worksheet.addRow({
                chasis: String(v.chasis),
                playa: String(v.playa),
                bloque: String(v.bloque),
                calle: String(calle),
                fila: String(fila),
                ubicacion: ubicacion
            });

            for (let c = 1; c <= 6; c++) {
                filaExcel.getCell(c).numFmt = "@";
            }

            filaExcel.height = 15;

            filaExcel.alignment = {
                vertical: "middle",
                horizontal: "center"
            };
        }

        worksheet.autoFilter = {
            from: "A1",
            to: "F" + (vehiculos.length + 1)
        };

        worksheet.views = [{
            state: "frozen",
            ySplit: 1
        }];

        const buffer = await workbook.xlsx.writeBuffer();

        // Este File es el archivo temporal único.
        // Se crea UNA vez y se reutiliza tanto para guardar como para compartir.
        archivoExcelTemporal = new File(
            [buffer],
            nombreArchivoExcelTemporal,
            {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                lastModified: Date.now()
            }
        );

        cerrarCargandoExcel();
        abrirModalExportacion();

    } catch (error) {

        console.error("Error al generar Excel:", error);

        cerrarCargandoExcel();

        archivoExcelTemporal = null;

        mostrarAlerta("No se pudo generar el archivo Excel.");
    }
}

function mostrarCargandoExcel() {
    const modal = document.getElementById("excelLoadingModal");
    if (modal) modal.classList.remove("hidden");
}

function cerrarCargandoExcel() {
    const modal = document.getElementById("excelLoadingModal");
    if (modal) modal.classList.add("hidden");
}

function abrirModalExportacion() {
    const modal = document.getElementById("excelExportModal");
    if (modal) modal.classList.remove("hidden");
}

function cerrarModalExportacion() {
    const modal = document.getElementById("excelExportModal");
    if (modal) modal.classList.add("hidden");
}

function guardarExcelTemporal() {

    if (!archivoExcelTemporal) {
        mostrarAlerta("El archivo Excel ya no está disponible. Generalo nuevamente.");
        return;
    }

    const url = URL.createObjectURL(archivoExcelTemporal);
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = archivoExcelTemporal.name;

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    setTimeout(function() {
        URL.revokeObjectURL(url);
    }, 1000);

    cerrarModalExportacion();
}

async function compartirExcelTemporal() {

    if (!archivoExcelTemporal) {
        mostrarAlerta("El archivo Excel ya no está disponible. Generalo nuevamente.");
        return;
    }

    // IMPORTANTE: esta función se llama directamente desde el botón del modal,
    // conservando la activación del usuario requerida por Android/Web Share.
    const files = [archivoExcelTemporal];

    if (!navigator.share) {
        mostrarAlerta("Este navegador no admite el menú nativo de compartir.");
        return;
    }

    // canShare se prueba únicamente con 'files', como recomienda MDN.
    if (navigator.canShare && !navigator.canShare({ files: files })) {
        mostrarAlerta(
            "Este navegador admite compartir, pero no permite compartir este archivo Excel (.xlsx)."
        );
        return;
    }

    try {

        await navigator.share({
            files: files,
            title: "Vehículos Playa",
            text: "Archivo Excel de vehículos"
        });

        // En Android la promesa se resuelve después de entregar los datos
        // al destino de compartición.
        cerrarModalExportacion();

        // Ya no necesitamos conservar el archivo temporal.
        archivoExcelTemporal = null;

    } catch (error) {

        // Cancelar el selector nativo NO es un error de la aplicación.
        if (error && error.name === "AbortError") {
            return;
        }

        console.error("Error al compartir Excel:", error);

        let mensaje = "No se pudo abrir el menú de compartir.";

        if (error && error.name === "NotAllowedError") {
            mensaje =
                "Android o el navegador bloqueó la acción de compartir. " +
                "Volvé a tocar Compartir e intentá nuevamente.";
        } else if (error && error.name === "TypeError") {
            mensaje =
                "Este navegador no admite compartir este archivo Excel.";
        } else if (error && error.name === "DataError") {
            mensaje =
                "Se abrió el sistema de compartir, pero hubo un problema al enviar el archivo.";
        }

        mostrarAlerta(mensaje);
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
