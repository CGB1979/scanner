/* =========================================================
   UBICACIONES.JS
   URGENCIAS 5 Y 6
   =========================================================

   - Playa
   - Bloque
   - Carril
   - Ubicación / Posición
   - Playas especiales I y J
   - Primer carril disponible por defecto
   - Primera ubicación disponible por defecto
   - El escáner continúa abierto después de guardar
   ========================================================= */


function obtenerPlayasDisponibles() {

    return [
        ...new Set(
            vehiculos
                .map(v => normalizar(v.playa))
                .filter(Boolean)
        )
    ].sort((a, b) =>
        a.localeCompare(b, "es")
    );

}


/* =========================================================
   BLOQUES DISPONIBLES PARA UNA PLAYA
   ========================================================= */

function obtenerBloquesDisponibles(playa) {

    return [
        ...new Set(
            vehiculos
                .filter(v =>
                    normalizar(v.playa) ===
                    normalizar(playa)
                )
                .map(v =>
                    normalizar(v.bloque)
                )
                .filter(Boolean)
        )
    ].sort((a, b) =>
        a.localeCompare(b, "es")
    );

}


/* =========================================================
   CONSTRUIR SELECT PLAYAS
   ========================================================= */

function cargarPlayasCambio(playaSeleccionada = "") {

    const select =
        document.getElementById("cambioPlaya");


    const playas =
        obtenerPlayasDisponibles();


    select.innerHTML =
        '<option value="">Seleccionar playa</option>' +
        playas
            .map(playa => `

                <option value="${escapeHTML(playa)}">
                    ${escapeHTML(playa)}
                </option>

            `)
            .join("");


    if (
        playaSeleccionada &&
        playas.includes(playaSeleccionada)
    ) {

        select.value =
            playaSeleccionada;

    } else {

        select.value =
            "";

    }

}


/* =========================================================
   CONSTRUIR SELECT BLOQUES
   ========================================================= */

function cargarBloquesCambio(
    playa,
    bloqueSeleccionado = ""
) {

    const select =
        document.getElementById("cambioBloque");


    const bloques =
        obtenerBloquesDisponibles(playa);


    select.innerHTML =
        '<option value="">Seleccionar bloque</option>' +
        bloques
            .map(bloque => `

                <option value="${escapeHTML(bloque)}">
                    ${escapeHTML(bloque)}
                </option>

            `)
            .join("");


    if (
        bloqueSeleccionado &&
        bloques.includes(bloqueSeleccionado)
    ) {

        select.value =
            bloqueSeleccionado;

    } else if (bloques.length) {

        /*
           Por defecto:
           primer bloque disponible
        */

        select.value =
            bloques[0];

    } else {

        select.value =
            "";

    }

}


/* =========================================================
   CARRILES DISPONIBLES
   =========================================================

   Para el Rebotador:

   - Se obtienen los carriles existentes
     para Playa + Bloque.

   - Se ordenan numéricamente cuando corresponde.

   - El primer carril que tenga alguna ubicación
     libre será seleccionado automáticamente.
*/

function obtenerCarrilesDisponibles(
    playa,
    bloque
) {

    return [
        ...new Set(
            vehiculos
                .filter(v =>
                    normalizar(v.playa) ===
                        normalizar(playa) &&

                    normalizar(v.bloque) ===
                        normalizar(bloque)
                )
                .map(v =>
                    normalizar(v.carril)
                )
                .filter(Boolean)
        )
    ].sort(ordenarNumericoTexto);

}


/* =========================================================
   ORDEN NATURAL
   ========================================================= */

function ordenarNumericoTexto(a, b) {

    const numeroA =
        Number(a);

    const numeroB =
        Number(b);


    if (
        !Number.isNaN(numeroA) &&
        !Number.isNaN(numeroB)
    ) {

        return numeroA - numeroB;

    }


    return String(a)
        .localeCompare(
            String(b),
            "es",
            {
                numeric: true
            }
        );

}


/* =========================================================
   UBICACIÓN OCUPADA
   ========================================================= */

function ubicacionOcupada(
    playa,
    bloque,
    carril,
    posicion,
    excluirId = null
) {

    return vehiculos.some(v => {

        if (
            excluirId &&
            v.id === excluirId
        ) {

            return false;

        }


        return (

            normalizar(v.playa) ===
                normalizar(playa) &&

            normalizar(v.bloque) ===
                normalizar(bloque) &&

            normalizar(v.carril) ===
                normalizar(carril) &&

            normalizar(v.posicion) ===
                normalizar(posicion)

        );

    });

}


/* =========================================================
   UBICACIONES POSIBLES
   =========================================================

   PLAYA NORMAL:
   - Adelante
   - Atrás

   PLAYA ESPECIAL I/J:
   - 1
   - 2
   - 3
   - 4
   - 5
*/

function obtenerOpcionesPosicion(
    playa
) {

    if (
        typeof esPlayaEspecial === "function" &&
        esPlayaEspecial(playa)
    ) {

        return [
            "1",
            "2",
            "3",
            "4",
            "5"
        ];

    }


    return [
        "Adelante",
        "Atrás"
    ];

}


/* =========================================================
   UBICACIONES LIBRES DE UN CARRIL
   ========================================================= */

function obtenerPosicionesLibres(
    playa,
    bloque,
    carril,
    excluirId = null
) {

    const opciones =
        obtenerOpcionesPosicion(playa);


    return opciones.filter(posicion =>

        !ubicacionOcupada(
            playa,
            bloque,
            carril,
            posicion,
            excluirId
        )

    );

}


/* =========================================================
   CARRILES CON ESPACIO DISPONIBLE
   ========================================================= */

function obtenerCarrilesConEspacio(
    playa,
    bloque,
    excluirId = null
) {

    return obtenerCarrilesDisponibles(
        playa,
        bloque
    ).filter(carril =>

        obtenerPosicionesLibres(
            playa,
            bloque,
            carril,
            excluirId
        ).length > 0

    );

}


/* =========================================================
   SELECCIONAR PRIMER CARRIL DISPONIBLE
   ========================================================= */

function seleccionarPrimerCarrilDisponible(
    playa,
    bloque,
    excluirId = null
) {

    const carrilesConEspacio =
        obtenerCarrilesConEspacio(
            playa,
            bloque,
            excluirId
        );


    if (carrilesConEspacio.length) {

        return carrilesConEspacio[0];

    }


    /*
       Si todos los carriles están llenos,
       utilizamos el siguiente carril numérico.
    */

    const todos =
        obtenerCarrilesDisponibles(
            playa,
            bloque
        );


    if (!todos.length) {

        return "1";

    }


    const ultimo =
        todos
            .map(c => Number(c))
            .filter(n =>
                !Number.isNaN(n)
            )
            .sort((a, b) =>
                a - b
            )
            .pop();


    if (
        ultimo !== undefined
    ) {

        return String(
            ultimo + 1
        );

    }


    return todos[0];

}


/* =========================================================
   CARGAR CARRILES EN SELECT
   ========================================================= */

function cargarCarrilesCambio(
    playa,
    bloque,
    carrilSeleccionado = "",
    excluirId = null
) {

    const select =
        document.getElementById("cambioCarril");


    let carriles =
        obtenerCarrilesDisponibles(
            playa,
            bloque
        );


    const sugerido =
        seleccionarPrimerCarrilDisponible(
            playa,
            bloque,
            excluirId
        );


    /*
       Si el carril sugerido es nuevo,
       también se agrega al listado.
    */

    if (
        sugerido &&
        !carriles.includes(sugerido)
    ) {

        carriles.push(sugerido);

        carriles.sort(
            ordenarNumericoTexto
        );

    }


    select.innerHTML =
        '<option value="">Seleccionar carril</option>' +
        carriles
            .map(carril => `

                <option value="${escapeHTML(carril)}">
                    ${escapeHTML(carril)}
                </option>

            `)
            .join("");


    /*
       Si el vehículo ya estaba en un carril,
       se respeta.

       En caso contrario se asigna el primero libre.
    */

    if (
        carrilSeleccionado &&
        carriles.includes(
            carrilSeleccionado
        )
    ) {

        select.value =
            carrilSeleccionado;

    } else {

        select.value =
            sugerido;

    }

}


/* =========================================================
   CARGAR UBICACIONES / POSICIONES
   ========================================================= */

function cargarPosicionesCambio(
    playa,
    bloque,
    carril,
    posicionSeleccionada = "",
    excluirId = null
) {

    const select =
        document.getElementById(
            "cambioPosicion"
        );


    const label =
        document.getElementById(
            "labelCambioPosicion"
        );


    const esEspecial =
        typeof esPlayaEspecial === "function" &&
        esPlayaEspecial(playa);


    /*
       Cambiar el texto dinámicamente
    */

    label.textContent =
        esEspecial
            ? "Posición"
            : "Ubicación";


    /*
       Obtener posiciones libres
    */

    let posiciones =
        obtenerPosicionesLibres(
            playa,
            bloque,
            carril,
            excluirId
        );


    /*
       Si estamos editando un vehículo existente,
       permitimos conservar su posición actual.
    */

    if (
        posicionSeleccionada &&
        !posiciones.includes(
            posicionSeleccionada
        )
    ) {

        posiciones.push(
            posicionSeleccionada
        );

    }


    /*
       Orden correcto
    */

    if (esEspecial) {

        posiciones.sort(
            (a, b) =>
                Number(a) -
                Number(b)
        );

    } else {

        posiciones.sort(
            ordenarNumericoTexto
        );

    }


    select.innerHTML =
        '<option value="">Seleccionar ubicación</option>' +
        posiciones
            .map(posicion => `

                <option value="${escapeHTML(posicion)}">
                    ${escapeHTML(posicion)}
                </option>

            `)
            .join("");


    /*
       Por defecto:
       primera ubicación libre.

       Si estamos editando el vehículo y
       tenía una posición válida, se conserva.
    */

    if (
        posicionSeleccionada &&
        posiciones.includes(
            posicionSeleccionada
        )
    ) {

        select.value =
            posicionSeleccionada;

    } else if (posiciones.length) {

        select.value =
            posiciones[0];

    } else {

        select.value =
            "";

    }

}


/* =========================================================
   AL CAMBIAR PLAYA
   ========================================================= */

function actualizarCambioPlaya() {

    const playa =
        normalizar(
            document
                .getElementById(
                    "cambioPlaya"
                )
                .value
        );


    const bloque =
        normalizar(
            document
                .getElementById(
                    "cambioBloque"
                )
                .value
        );


    cargarBloquesCambio(
        playa,
        bloque
    );


    const nuevoBloque =
        document
            .getElementById(
                "cambioBloque"
            )
            .value;


    cargarCarrilesCambio(
        playa,
        nuevoBloque,
        "",
        vehiculoActual?.id || null
    );


    const carril =
        document
            .getElementById(
                "cambioCarril"
            )
            .value;


    cargarPosicionesCambio(
        playa,
        nuevoBloque,
        carril,
        "",
        vehiculoActual?.id || null
    );

}


/* =========================================================
   AL CAMBIAR BLOQUE
   ========================================================= */

function actualizarCambioBloque() {

    const playa =
        normalizar(
            document
                .getElementById(
                    "cambioPlaya"
                )
                .value
        );


    const bloque =
        normalizar(
            document
                .getElementById(
                    "cambioBloque"
                )
                .value
        );


    cargarCarrilesCambio(
        playa,
        bloque,
        "",
        vehiculoActual?.id || null
    );


    const carril =
        document
            .getElementById(
                "cambioCarril"
            )
            .value;


    cargarPosicionesCambio(
        playa,
        bloque,
        carril,
        "",
        vehiculoActual?.id || null
    );

}


/* =========================================================
   AL CAMBIAR CARRIL
   ========================================================= */

function actualizarCambioCarril() {

    const playa =
        normalizar(
            document
                .getElementById(
                    "cambioPlaya"
                )
                .value
        );


    const bloque =
        normalizar(
            document
                .getElementById(
                    "cambioBloque"
                )
                .value
        );


    const carril =
        normalizar(
            document
                .getElementById(
                    "cambioCarril"
                )
                .value
        );


    cargarPosicionesCambio(
        playa,
        bloque,
        carril,
        "",
        vehiculoActual?.id || null
    );

}


/* =========================================================
   ABRIR CAMBIO DE UBICACIÓN
   ========================================================= */

function abrirCambioUbicacionVehiculo(
    id,
    obj
) {

    const v =
        obj ||
        vehiculos.find(
            x => x.id === id
        );


    if (!v) {
        return;
    }


    vehiculoActual =
        v;


    /*
       Información del vehículo
    */

    const desde =
        ubicacionTexto(v);


    const chasisElemento =
        document.getElementById(
            "cambioChasis"
        );


    const ubicacionActualElemento =
        document.getElementById(
            "cambioUbicacionActual"
        );


    if (chasisElemento) {

        chasisElemento.textContent =
            v.chasis;

    }


    if (ubicacionActualElemento) {

        if (v.playa) {

            ubicacionActualElemento.innerHTML =
                escapeHTML(
                    `Playa ${v.playa} - Bloque ${v.bloque}`
                ) +
                "<br>" +
                escapeHTML(
                    `Carril ${v.carril} - ${
                        esPlayaEspecial(v.playa)
                            ? "Posición"
                            : "Ubicación"
                    } ${v.posicion}`
                );

        } else {

            ubicacionActualElemento.textContent =
                "Vehículo no registrado en el listado";

        }

    }


    /*
       Compatibilidad con la descripción
       del HTML anterior.
    */

    const descripcion =
        document.getElementById(
            "cambioDescripcion"
        );


    if (descripcion) {

        descripcion.textContent =
            `Vehículo ${v.chasis}. Desde: ${desde}`;

    }


    /*
       CARGAR PLAYAS
    */

    const playaInicial =
        normalizar(
            v.playa ||
            playaSelect.value ||
            ""
        );


    cargarPlayasCambio(
        playaInicial
    );


    /*
       Si no hay playa previa,
       seleccionamos la primera disponible.
    */

    const selectPlaya =
        document.getElementById(
            "cambioPlaya"
        );


    if (
        !selectPlaya.value &&
        selectPlaya.options.length > 1
    ) {

        selectPlaya.selectedIndex =
            1;

    }


    const playa =
        normalizar(
            selectPlaya.value
        );


    /*
       BLOQUES
    */

    cargarBloquesCambio(
        playa,
        normalizar(
            v.bloque ||
            bloqueSelect.value ||
            ""
        )
    );


    const bloque =
        normalizar(
            document
                .getElementById(
                    "cambioBloque"
                )
                .value
        );


    /*
       CARRIL

       Si el vehículo ya existe:
       conserva su carril.

       Si es nuevo:
       primer carril disponible.
    */

    cargarCarrilesCambio(
        playa,
        bloque,
        normalizar(v.carril),
        v.id
    );


    const carril =
        normalizar(
            document
                .getElementById(
                    "cambioCarril"
                )
                .value
        );


    /*
       UBICACIÓN / POSICIÓN
    */

    cargarPosicionesCambio(
        playa,
        bloque,
        carril,
        normalizar(v.posicion),
        v.id
    );


    /*
       Mostrar modal
    */

    document
        .getElementById(
            "locationModal"
        )
        .classList
        .remove("hidden");


    /*
       Ocultar resultado del escáner,
       pero NO cerrar el scanner.
    */

    const scanResult =
        document.getElementById(
            "scanResult"
        );


    if (scanResult) {

        scanResult
            .classList
            .add("hidden");

    }

}


/* =========================================================
   CERRAR CAMBIO DE UBICACIÓN
   ========================================================= */

function cerrarCambioUbicacion() {

    document
        .getElementById(
            "locationModal"
        )
        .classList
        .add("hidden");


    /*
       Si el escáner sigue abierto,
       continuar escaneando.
    */

    if (
        typeof continuarEscaneo === "function" &&
        scannerActivo
    ) {

        continuarEscaneo();

    }

}


/* =========================================================
   CONFIRMAR CAMBIO DE UBICACIÓN
   ========================================================= */

function confirmarCambioUbicacion() {

    if (!vehiculoActual) {
        return;
    }


    const p =
        normalizar(
            document
                .getElementById(
                    "cambioPlaya"
                )
                .value
        );


    const b =
        normalizar(
            document
                .getElementById(
                    "cambioBloque"
                )
                .value
        );


    const c =
        normalizar(
            document
                .getElementById(
                    "cambioCarril"
                )
                .value
        );


    const pos =
        normalizar(
            document
                .getElementById(
                    "cambioPosicion"
                )
                .value
        );


    if (
        !p ||
        !b ||
        !c ||
        !pos
    ) {

        alert(
            "Complete Playa, Bloque, Carril y Ubicación."
        );

        return;

    }


    /*
       Comprobar si la ubicación está ocupada.
    */

    const existe =
        ubicacionOcupada(
            p,
            b,
            c,
            pos,
            vehiculoActual.id
        );


    if (
        existe &&
        !confirm(
            "La ubicación seleccionada ya está ocupada. " +
            "¿Desea continuar de todos modos?"
        )
    ) {

        return;

    }


    /*
       Guardar ubicación anterior
    */

    const anterior =
        vehiculoActual.playa

            ? ubicacionTexto(
                vehiculoActual
            )

            : `Escaneado desde Playa ${
                playaSelect.value ||
                "no informada"
            } - Bloque ${
                bloqueSelect.value ||
                "no informado"
            }`;


    /*
       Determinar si el vehículo es nuevo
    */

    const esNuevo =
        !vehiculos.some(
            v =>
                v.id ===
                vehiculoActual.id
        );


    /*
       Aplicar nueva ubicación
    */

    vehiculoActual.playa =
        p;


    vehiculoActual.bloque =
        b;


    vehiculoActual.carril =
        c;


    vehiculoActual.posicion =
        pos;


    vehiculoActual.movidoDesde =
        anterior;


    const textoMovimiento =
        "Movido desde " +
        anterior;


    vehiculoActual.observaciones =
        vehiculoActual.observaciones

            ? vehiculoActual.observaciones +
                " | " +
                textoMovimiento

            : textoMovimiento;


    /*
       Si era un vehículo no encontrado,
       ahora se agrega al listado.
    */

    if (esNuevo) {

        vehiculos.push(
            vehiculoActual
        );

    }


    /*
       Cerrar modal
    */

    document
        .getElementById(
            "locationModal"
        )
        .classList
        .add("hidden");


    /*
       Actualizar interfaz
    */

    actualizarSelectores();

    actualizarPantalla();


    /*
       IMPORTANTE:

       NO cerrar el scanner.

       Volver al escaneo continuo.
    */

    if (
        typeof continuarEscaneo === "function" &&
        scannerActivo
    ) {

        continuarEscaneo();

    }

}
