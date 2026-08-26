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

                if (esPlayaJ(v.playa)) {

                    const p =
                        parsearPosicionJ(
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

    if (esPlayaJ(v.playa)) {

        const p =
            parsearPosicionJ(
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
        alert(
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

    if (vehiculos.length === 0) {
        alert("No hay vehiculos registrados para exportar.");
        return;
    }

    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Vehiculos");

        worksheet.columns = [
            { header: "Playa", key: "playa", width: 10 },
            { header: "Bloque", key: "bloque", width: 10 },
            { header: "Carril", key: "carril", width: 12 },
            { header: "Posicion", key: "posicion", width: 12 },
            { header: "Chasis", key: "chasis", width: 25 },
            { header: "Resumen", key: "resumen", width: 22 }
        ];

        const encabezado = worksheet.getRow(1);
        encabezado.font = {
            bold: true,
            color: { argb: "FFFFFFFF" }
        };
        encabezado.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF173F6D" }
        };
        encabezado.alignment = {
            vertical: "middle",
            horizontal: "center"
        };
        encabezado.height = 25;

        vehiculos.forEach(function(v) {
            let carril = "";
            let posicion = "";

            if (esPlayaJ(v.playa)) {
                const p = parsearPosicionJ(v.posicion);
                if (p) {
                    carril = String(p.calle);
                    posicion = String(p.fila);
                } else if (Number.isFinite(Number(v.carril))) {
                    carril = String(v.carril);
                    posicion = String(v.posicion || "");
                }
            } else {
                carril = String(obtenerCarrilNormalVehiculo(v) || "");
                posicion = String(obtenerPosicionNormalVehiculo(v) || "");
            }

            const filaExcel = worksheet.addRow({
                playa: String(v.playa || ""),
                bloque: String(v.bloque || ""),
                carril: carril,
                posicion: posicion,
                chasis: String(v.chasis || ""),
                resumen: obtenerResumenVehiculo(v)
            });

            for (let c = 1; c <= 6; c++) {
                filaExcel.getCell(c).numFmt = "@";
            }

            filaExcel.height = 15;
            filaExcel.alignment = {
                vertical: "middle",
                horizontal: "center"
            };
        });

        worksheet.autoFilter = {
            from: "A1",
            to: "F" + (vehiculos.length + 1)
        };

        worksheet.views = [{
            state: "frozen",
            ySplit: 1
        }];

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement("a");
        enlace.href = url;
        enlace.download = "vehiculos_playa.xlsx";
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Error al generar Excel:", error);
        alert("No se pudo generar el archivo Excel.");
    }
}
