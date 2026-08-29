/* =========================================================
   CONFIGURACIÓN Y CARGA DEL ARCHIVO EXCEL
   ========================================================= */

let vehiculos = [];

let datosExcel = {
    nombre: "",
    archivoSeleccionado: null,
    hoja: "",
    encabezados: [],
    columnas: {},
    workbook: null,
    worksheet: null,
    filas: [],
    filaEncabezados: 1,
    filaDatosInicio: 2,
    totalVehiculosCargados: 0
};


/* =========================================================
   REFERENCIAS DE LA INTERFAZ
   ========================================================= */

const playaSelect = document.getElementById("playa");
const bloqueSelect = document.getElementById("bloque");
const listaVehiculos = document.getElementById("listaVehiculos");

const excelFileInput = document.getElementById("excelFile");
const btnBuscarExcel = document.getElementById("btnBuscarExcel");
const btnCargarExcel = document.getElementById("btnCargarExcel");
const excelStatus = document.getElementById("excelStatus");


/* =========================================================
   UTILIDADES
   ========================================================= */

function normalizar(valor) {
    return String(valor ?? "").trim();
}


function key(valor) {
    return normalizar(valor)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}


function columnaPorLetra(letra) {
    if (!letra) {
        return null;
    }

    let numero = 0;

    for (const caracter of String(letra).toUpperCase()) {

        if (caracter < "A" || caracter > "Z") {
            return null;
        }

        numero =
            numero * 26 +
            caracter.charCodeAt(0) -
            64;
    }

    return numero - 1;
}


function detectarColumnas(encabezados) {

    const resultado = {};

    for (const [campo, configuracion] of Object.entries(CONFIG_EXCEL.campos)) {

        let indice = columnaPorLetra(configuracion.columna);

        if (indice === null) {

            indice = encabezados.findIndex(encabezado =>
                configuracion.encabezados
                    .map(key)
                    .includes(key(encabezado))
            );
        }

        resultado[campo] = indice;
    }

    return resultado;
}


function valorFila(fila, indice) {

    if (indice < 0 || indice >= fila.length) {
        return "";
    }

    return normalizar(fila[indice]);
}


/* =========================================================
   BOTÓN BUSCAR EXCEL
   ========================================================= */

function abrirSelectorExcel() {

    excelFileInput.click();
}


/* =========================================================
   CUANDO EL USUARIO SELECCIONA UN ARCHIVO
   ========================================================= */

excelFileInput.addEventListener("change", () => {

    const archivo = excelFileInput.files[0];

    if (!archivo) {
        return;
    }

    datosExcel.archivoSeleccionado = archivo;

    /*
       El botón Buscar Excel pasa a mostrar
       el nombre del archivo seleccionado.
    */
    btnBuscarExcel.textContent = archivo.name;

    /*
       Al seleccionar un archivo nuevo,
       Cargar vuelve a quedar habilitado.
    */
    btnCargarExcel.disabled = false;
    btnCargarExcel.textContent = "Cargar";

    btnCargarExcel.classList.remove("disabled");
    btnCargarExcel.removeAttribute("aria-disabled");

    actualizarResumenExcel();

    /*
       Esta función se usa también para que,
       cuando exista CSS de autoajuste,
       pueda recalcular el tamaño común.
    */
    if (typeof ajustarTextoBotonesExcel === "function") {
        setTimeout(ajustarTextoBotonesExcel, 0);
    }
});


/* =========================================================
   CARGAR EXCEL
   ========================================================= */

function cargarExcel() {

    const archivo = excelFileInput.files[0];

    if (!archivo) {
        alert("Primero seleccione un archivo Excel.");
        return;
    }

    /*
       Si el mismo archivo ya fue cargado,
       no se vuelve a cargar.
    */
    if (
        datosExcel.workbook &&
        datosExcel.nombre === archivo.name &&
        btnCargarExcel.disabled
    ) {
        return;
    }

    const reader = new FileReader();

    reader.onload = evento => {

        try {

            const workbook = XLSX.read(
                evento.target.result,
                {
                    type: "array"
                }
            );


            const nombreHoja =
                workbook.SheetNames[CONFIG_EXCEL.hoja] ||
                workbook.SheetNames[0];


            const worksheet =
                workbook.Sheets[nombreHoja];


            const filas =
                XLSX.utils.sheet_to_json(
                    worksheet,
                    {
                        header: 1,
                        defval: ""
                    }
                );


            /*
               CONFIG_EXCEL.filaInicial
               es la primera fila de datos.

               Los encabezados se toman
               de la fila anterior.
            */
            const filaDatosInicio = Math.max(
                1,
                Number(CONFIG_EXCEL.filaInicial) || 2
            );


            const filaEncabezados =
                filaDatosInicio - 1;


            const encabezados =
                filas[filaEncabezados - 1] || [];


            const columnas =
                detectarColumnas(encabezados);


            /*
               Validamos que exista Chasis.
            */
            if (
                columnas.chasis < 0 ||
                columnas.chasis === undefined
            ) {

                alert(
                    "No se encontró la columna Chasis.\n\n" +
                    "Revise js/configuracionExcel.js"
                );

                return;
            }


            /*
               CARGAR VEHÍCULOS
            */
            vehiculos = filas
                .slice(filaDatosInicio - 1)
                .map((fila, indice) => ({

                    id: "excel-" + (indice + 1),

                    chasis:
                        valorFila(
                            fila,
                            columnas.chasis
                        ),

                    playa:
                        valorFila(
                            fila,
                            columnas.playa
                        ),

                    bloque:
                        valorFila(
                            fila,
                            columnas.bloque
                        ),

                    carril:
                        valorFila(
                            fila,
                            columnas.carril
                        ),

                    posicion:
                        valorFila(
                            fila,
                            columnas.posicion
                        ),

                    observaciones:
                        valorFila(
                            fila,
                            columnas.observaciones
                        ),

                    movidoDesde: "",

                    _filaExcel:
                        filaDatosInicio + indice

                }))
                .filter(vehiculo =>
                    vehiculo.chasis
                );


            /*
               GUARDAR INFORMACIÓN DEL EXCEL
            */
            datosExcel = {

                nombre:
                    archivo.name,

                archivoSeleccionado:
                    archivo,

                hoja:
                    nombreHoja,

                encabezados:
                    encabezados,

                columnas:
                    columnas,

                workbook:
                    workbook,

                worksheet:
                    worksheet,

                filas:
                    filas,

                filaEncabezados:
                    filaEncabezados,

                filaDatosInicio:
                    filaDatosInicio,

                totalVehiculosCargados:
                    vehiculos.length

            };


            /*
               ACTUALIZAR FILTROS
            */
            actualizarSelectores();


            /*
               ACTUALIZAR LISTADO
            */
            actualizarPantalla();


            /*
               EL ARCHIVO QUEDA CARGADO
            */
            btnBuscarExcel.textContent =
                archivo.name;


            btnCargarExcel.textContent =
                "Cargado";


            btnCargarExcel.disabled =
                true;


            btnCargarExcel.classList.add(
                "disabled"
            );


            btnCargarExcel.setAttribute(
                "aria-disabled",
                "true"
            );


            /*
               MOSTRAR INFORMACIÓN
            */
            actualizarResumenExcel();


            /*
               Ajustar nuevamente el tamaño
               de texto de ambos botones.
            */
            if (
                typeof ajustarTextoBotonesExcel ===
                "function"
            ) {

                setTimeout(
                    ajustarTextoBotonesExcel,
                    0
                );
            }

        } catch (error) {

            console.error(
                "Error al cargar Excel:",
                error
            );


            alert(
                "No se pudo leer el archivo Excel."
            );
        }
    };


    reader.readAsArrayBuffer(
        archivo
    );
}


/* =========================================================
   RESUMEN DEL ARCHIVO CARGADO
   ========================================================= */

function actualizarResumenExcel() {

    /*
       Todavía no se seleccionó ningún archivo.
    */
    if (
        !datosExcel.archivoSeleccionado &&
        !datosExcel.nombre
    ) {

        excelStatus.innerHTML =
            "No hay ningún archivo cargado.";

        return;
    }


    const nombreArchivo =
        datosExcel.nombre ||
        datosExcel.archivoSeleccionado?.name ||
        "Sin archivo";


    const totalCargados =
        Number(
            datosExcel.totalVehiculosCargados
        ) || 0;


    /*
       Los vehículos encontrados/eliminados
       son los que originalmente estaban
       cargados y ya no están en el listado.
    */
    const totalEncontrados =
        Math.max(
            0,
            totalCargados -
            vehiculos.length
        );


    excelStatus.innerHTML = `

        <div class="excel-status-line">

            <strong>Archivo:</strong>

            <span class="excel-file-name">
                ${escapeHTML(nombreArchivo)}
            </span>

        </div>

        <div class="excel-status-line">

            <strong>Vehículos cargados:</strong>

            <span>
                ${totalCargados}
            </span>

        </div>

        <div class="excel-status-line">

            <strong>Vehículos encontrados:</strong>

            <span>
                ${totalEncontrados}
            </span>

        </div>

    `;
}


/* =========================================================
   SELECTORES DE PLAYA Y BLOQUE
   ========================================================= */

function actualizarSelectores() {

    const playaSeleccionada =
        playaSelect.value;


    const bloqueSeleccionado =
        bloqueSelect.value;


    /*
       PLAYAS
    */
    const playas =
        [
            ...new Set(
                vehiculos
                    .map(vehiculo =>
                        vehiculo.playa
                    )
                    .filter(Boolean)
            )
        ]
        .sort((a, b) =>
            a.localeCompare(
                b,
                "es"
            )
        );


    /*
       BLOQUES

       Si hay una playa seleccionada,
       solamente muestra los bloques
       correspondientes a esa playa.
    */
    const bloquesBase =
        vehiculos
            .filter(vehiculo =>
                !playaSeleccionada ||
                vehiculo.playa ===
                playaSeleccionada
            )
            .map(vehiculo =>
                vehiculo.bloque
            )
            .filter(Boolean);


    const bloques =
        [
            ...new Set(
                bloquesBase
            )
        ]
        .sort((a, b) =>
            a.localeCompare(
                b,
                "es"
            )
        );


    /*
       ACTUALIZAR PLAYAS
    */
    playaSelect.innerHTML =
        '<option value="">Todas</option>' +
        playas
            .map(playa => `
                <option
                    value="${escapeHTML(playa)}"
                >
                    ${escapeHTML(playa)}
                </option>
            `)
            .join("");


    /*
       Mantener selección anterior
       si sigue existiendo.
    */
    playaSelect.value =
        playas.includes(
            playaSeleccionada
        )
            ? playaSeleccionada
            : "";


    /*
       ACTUALIZAR BLOQUES
    */
    bloqueSelect.innerHTML =
        '<option value="">Todos</option>' +
        bloques
            .map(bloque => `
                <option
                    value="${escapeHTML(bloque)}"
                >
                    ${escapeHTML(bloque)}
                </option>
            `)
            .join("");


    /*
       Mantener bloque anterior
       si sigue existiendo.
    */
    bloqueSelect.value =
        bloques.includes(
            bloqueSeleccionado
        )
            ? bloqueSeleccionado
            : "";
}


/* =========================================================
   CAMBIO DE PLAYA
   ========================================================= */

playaSelect.addEventListener(
    "change",
    () => {

        actualizarSelectores();

        actualizarPantalla();
    }
);


/* =========================================================
   CAMBIO DE BLOQUE
   ========================================================= */

bloqueSelect.addEventListener(
    "change",
    () => {

        actualizarPantalla();
    }
);


/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

actualizarResumenExcel();
