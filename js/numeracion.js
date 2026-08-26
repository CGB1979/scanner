function esPlayaJ(playa) {
    return ["I", "J"].includes(String(playa).toUpperCase());
}

function actualizarOpcionesPlaya() {

    const esJ = esPlayaJ(playaSelect.value);

    if (esJ) {

        modoPares.parentElement.classList.add("hidden");
        modoImpares.parentElement.classList.add("hidden");
        modoContinua.parentElement.classList.remove("hidden");

        let opcionFila = document.getElementById("modoPorFilaContainer");

        if (!opcionFila) {

            opcionFila = document.createElement("div");

            opcionFila.id = "modoPorFilaContainer";
            opcionFila.className = "numbering-option";

            opcionFila.innerHTML = `
                <input
                    type="radio"
                    name="modoNumeracion"
                    id="modoPorFila"
                    value="porFila"
                >

                <!-- EDITABLE: texto de la opcion creada para Playa J -->
                <label for="modoPorFila">
                    Por fila
                </label>
            `;

            document
                .querySelector(".numbering-options")
                .appendChild(opcionFila);

            document
                .getElementById("modoPorFila")
                .addEventListener("change", function() {

                    actualizarControlesPlaya();
                    guardarConfiguracionNumeracion();
                    actualizarPantalla();

                });

        } else {

            opcionFila.classList.remove("hidden");

        }

        actualizarControlesPlaya();

        return;

    }

    modoPares.parentElement.classList.remove("hidden");
    modoImpares.parentElement.classList.remove("hidden");

    const opcionFila = document.getElementById("modoPorFilaContainer");

    if (opcionFila) {
        opcionFila.classList.add("hidden");
    }

    numeroInicialContainer.classList.remove("hidden");
    filaInicialContainer.classList.add("hidden");

}

function actualizarControlesPlaya() {

    const esJ = esPlayaJ(playaSelect.value);

    if (!esJ) {

        numeroInicialContainer.classList.remove("hidden");
        filaInicialContainer.classList.add("hidden");

        numberingHelp.classList.remove("editable-j");

        return;

    }

    const modo = obtenerModoNumeracion();

    numeroInicialContainer.classList.add("hidden");

    if (modo === "porFila") {
        filaInicialContainer.classList.remove("hidden");
    } else {
        filaInicialContainer.classList.add("hidden");
    }

    numberingHelp.classList.add("editable-j");

}

function obtenerModoNumeracion() {

    const seleccionado = document.querySelector(
        'input[name="modoNumeracion"]:checked'
    );

    if (!seleccionado) {
        return "continua";
    }

    return seleccionado.value;

}

function obtenerFilaInicial() {

    let fila = parseInt(
        filaInicial.value,
        10
    );

    if (!Number.isFinite(fila) || fila < 1 || fila > 5) {
        fila = 1;
    }

    return fila;

}

function obtenerInicioNumeracion() {

    let numero = parseInt(
        numeroInicial.value,
        10
    );

    if (!Number.isFinite(numero) || numero < 1) {
        numero = 1;
    }

    return numero;

}

function obtenerInicioNumeracionJ() {

    let numero = parseInt(
        configuracionNumeracion.inicio,
        10
    );

    if (!Number.isFinite(numero) || numero < 1) {
        numero = 1;
    }

    return numero;

}

function guardarConfiguracionNumeracion() {

    const modo = obtenerModoNumeracion();
    const inicio = obtenerInicioNumeracion();
    const fila = obtenerFilaInicial();

    configuracionNumeracion = {
        modo: modo,
        inicio: inicio,
        filaInicio: fila
    };

    localStorage.setItem(
        "configNumeracionPlaya",
        JSON.stringify(configuracionNumeracion)
    );

    actualizarAyudaNumeracion();

}

function cargarConfiguracionNumeracion() {

    let modo = configuracionNumeracion.modo;

    let inicio = parseInt(
        configuracionNumeracion.inicio,
        10
    );

    let fila = parseInt(
        configuracionNumeracion.filaInicio,
        10
    );

    if (
        modo !== "continua" &&
        modo !== "pares" &&
        modo !== "impares" &&
        modo !== "porFila"
    ) {
        modo = "continua";
    }

    if (!Number.isFinite(inicio) || inicio < 1) {
        inicio = 1;
    }

    if (!Number.isFinite(fila) || fila < 1 || fila > 5) {
        fila = 1;
    }

    if (modo === "pares" && inicio % 2 !== 0) {
        inicio++;
    }

    if (modo === "impares" && inicio % 2 === 0) {
        inicio++;
    }

    configuracionNumeracion = {
        modo: modo,
        inicio: inicio,
        filaInicio: fila
    };

    let radio = document.querySelector(
        'input[name="modoNumeracion"][value="' + modo + '"]'
    );

    if (
        !radio &&
        playaSelect.value === "J" &&
        modo === "porFila"
    ) {

        actualizarOpcionesPlaya();

        radio = document.querySelector(
            'input[name="modoNumeracion"][value="porFila"]'
        );

    }

    if (radio) {
        radio.checked = true;
    }

    numeroInicial.value = inicio;
    filaInicial.value = fila;

    actualizarOpcionesPlaya();
    actualizarControlesPlaya();
    actualizarAyudaNumeracion();

}

function ajustarNumeroInicialPorModo() {

    const modo = obtenerModoNumeracion();

    if (
        esPlayaJ(playaSelect.value) &&
        modo === "porFila"
    ) {

        actualizarControlesPlaya();
        guardarConfiguracionNumeracion();
        actualizarPantalla();

        return;

    }

    let numero = parseInt(
        numeroInicial.value,
        10
    );

    if (!Number.isFinite(numero) || numero < 1) {
        numero = 1;
    }

    if (modo === "pares" && numero % 2 !== 0) {
        numero++;
    }

    if (modo === "impares" && numero % 2 === 0) {
        numero++;
    }

    numeroInicial.value = numero;

    actualizarControlesPlaya();
    guardarConfiguracionNumeracion();
    actualizarPantalla();

}

function editarInicioPlayaJ() {

    if (!esPlayaJ(playaSelect.value)) {
        return;
    }

    const actual = obtenerInicioNumeracionJ();

    // EDITABLE: texto que aparece en la ventana para cambiar el inicio
    const respuesta = prompt(
        "Ingrese el numero de Carril desde el que desea comenzar la asignacion:",
        String(actual)
    );

    if (respuesta === null) {
        return;
    }

    const numero = parseInt(
        String(respuesta).trim(),
        10
    );

    if (!Number.isFinite(numero) || numero < 1) {

        // EDITABLE: mensaje de error
        alert("Ingrese un numero valido mayor o igual a 1.");

        return;

    }

    configuracionNumeracion.inicio = numero;

    numeroInicial.value = numero;

    localStorage.setItem(
        "configNumeracionPlaya",
        JSON.stringify(configuracionNumeracion)
    );

    actualizarAyudaNumeracion();
    actualizarPantalla();

    if (
        scannerActivo &&
        !document
            .getElementById("scannerModal")
            .classList
            .contains("hidden")
    ) {

        actualizarPosicionScanner();

    }

}

numberingHelp.addEventListener(
    "dblclick",
    editarInicioPlayaJ
);

document
    .querySelectorAll('input[name="modoNumeracion"]')
    .forEach(function(radio) {

        radio.addEventListener(
            "change",
            ajustarNumeroInicialPorModo
        );

    });

numeroInicial.addEventListener(
    "change",
    function() {
        ajustarNumeroInicialPorModo();
    }
);

filaInicial.addEventListener(
    "change",
    function() {

        guardarConfiguracionNumeracion();
        actualizarAyudaNumeracion();
        actualizarPantalla();

    }
);

function actualizarAyudaNumeracion() {

    const modo = obtenerModoNumeracion();

    if (esPlayaJ(playaSelect.value)) {

        const inicio = obtenerInicioNumeracionJ();

        if (modo === "continua") {

            // EDITABLE: texto de ayuda para Playa J en modo continuo
            numberingHelp.innerText =
                `Doble click para cambiar el inicio. Se asignara ${inicio}-1, ${inicio}-2, ${inicio}-3, ${inicio}-4, ${inicio}-5 y luego ${inicio + 1}-1, ${inicio + 1}-2...`;

            numberingHelp.classList.add("editable-j");

            return;

        }

        if (modo === "porFila") {

            const fila = obtenerFilaInicial();

            // EDITABLE: texto de ayuda para Playa J por fila
            numberingHelp.innerText =
                `Doble click para cambiar el inicio. Se escaneara la fila ${fila}: ${inicio}-${fila}, ${inicio + 1}-${fila}, ${inicio + 2}-${fila}, ${inicio + 3}-${fila}...`;

            numberingHelp.classList.add("editable-j");

            return;

        }

    }

    numberingHelp.classList.remove("editable-j");

    const inicio = obtenerInicioNumeracion();

    if (!esPlayaJ(playaSelect.value)) {

        const primero = normalizarCarrilNormal(inicio);

        // En playas normales cada carril tiene 2 vehiculos: adelante y atras.
        numberingHelp.innerText =
            `Se asignara Carril ${primero} (Adelante y Atrás), luego Carril ${primero + 2}, ${primero + 4}, ${primero + 6}...`;

        return;

    }

    if (modo === "pares") {

        let primero = inicio;

        if (primero % 2 !== 0) {
            primero++;
        }

        // EDITABLE: texto de ayuda para numeros pares
        numberingHelp.innerText =
            `Se asignara ${primero}, ${primero + 2}, ${primero + 4}, ${primero + 6}...`;

        return;

    }

    if (modo === "impares") {

        let primero = inicio;

        if (primero % 2 === 0) {
            primero++;
        }

        // EDITABLE: texto de ayuda para numeros impares
        numberingHelp.innerText =
            `Se asignara ${primero}, ${primero + 2}, ${primero + 4}, ${primero + 6}...`;

    }

}

function obtenerUbicacionSeleccionada() {

    return {
        playa: playaSelect.value,
        bloque: bloqueSelect.value
    };

}

function normalizarPrimerNumero(numero) {

    const modo = obtenerModoNumeracion();

    numero = Number(numero);

    if (!Number.isFinite(numero) || numero < 1) {
        numero = 1;
    }

    if (modo === "pares" && numero % 2 !== 0) {
        numero++;
    }

    if (modo === "impares" && numero % 2 === 0) {
        numero++;
    }

    return numero;

}

function convertirPosicionJ(calle, fila) {

    return (
        Number(calle) +
        "-" +
        Number(fila)
    );

}

function parsearPosicionJ(posicion) {

    const texto = String(posicion || "").trim();

    const partes = texto.split("-");

    if (partes.length !== 2) {
        return null;
    }

    const calle = parseInt(
        partes[0],
        10
    );

    const fila = parseInt(
        partes[1],
        10
    );

    if (
        !Number.isFinite(calle) ||
        !Number.isFinite(fila) ||
        calle < 1 ||
        fila < 1 ||
        fila > 5
    ) {
        return null;
    }

    return {
        calle: calle,
        fila: fila
    };

}

function obtenerPosicionesJOcupadas(
    playa,
    bloque,
    excluirVehiculo
) {

    return vehiculos
        .filter(function(v) {

            if (
                excluirVehiculo &&
                v.id === excluirVehiculo.id
            ) {
                return false;
            }

            return (
                v.playa === playa &&
                v.bloque === bloque
            );

        })
        .map(function(v) {

            return parsearPosicionJ(
                v.posicion
            );

        })
        .filter(function(p) {
            return p !== null;
        });

}

function posicionJOcupada(
    playa,
    bloque,
    calle,
    fila,
    excluirVehiculo
) {

    return vehiculos.some(function(v) {

        if (
            excluirVehiculo &&
            v.id === excluirVehiculo.id
        ) {
            return false;
        }

        if (
            v.playa !== playa ||
            v.bloque !== bloque
        ) {
            return false;
        }

        const p = parsearPosicionJ(
            v.posicion
        );

        if (!p) {
            return false;
        }

        return (
            p.calle === Number(calle) &&
            p.fila === Number(fila)
        );

    });

}

function obtenerProximaPosicionJ(
    playa,
    bloque
) {

    const registros = vehiculos.filter(function(v) {

        return (
            v.playa === playa &&
            v.bloque === bloque
        );

    });

    const inicio = obtenerInicioNumeracionJ();
    const modo = obtenerModoNumeracion();

    if (registros.length === 0) {

        if (modo === "porFila") {

            return convertirPosicionJ(
                inicio,
                obtenerFilaInicial()
            );

        }

        return convertirPosicionJ(
            inicio,
            1
        );

    }

    const posiciones = registros
        .map(function(v) {

            return parsearPosicionJ(
                v.posicion
            );

        })
        .filter(function(p) {
            return p !== null;
        });

    if (posiciones.length === 0) {

        if (modo === "porFila") {

            return convertirPosicionJ(
                inicio,
                obtenerFilaInicial()
            );

        }

        return convertirPosicionJ(
            inicio,
            1
        );

    }

    if (modo === "continua") {

        let ultimaCalle = inicio;
        let ultimaFila = 0;

        posiciones.forEach(function(p) {

            if (
                p.calle > ultimaCalle ||
                (
                    p.calle === ultimaCalle &&
                    p.fila > ultimaFila
                )
            ) {

                ultimaCalle = p.calle;
                ultimaFila = p.fila;

            }

        });

        if (ultimaFila < 5) {

            return convertirPosicionJ(
                ultimaCalle,
                ultimaFila + 1
            );

        }

        return convertirPosicionJ(
            Math.max(
                inicio,
                ultimaCalle + 1
            ),
            1
        );

    }

    if (modo === "porFila") {

        const fila = obtenerFilaInicial();

        let mayorCalle = inicio - 1;

        posiciones.forEach(function(p) {

            if (
                p.fila === fila &&
                p.calle >= inicio &&
                p.calle > mayorCalle
            ) {

                mayorCalle = p.calle;

            }

        });

        return convertirPosicionJ(
            Math.max(
                inicio,
                mayorCalle + 1
            ),
            fila
        );

    }

    return convertirPosicionJ(
        inicio,
        1
    );

}

function normalizarCarrilNormal(numero) {

    numero = Number(numero);

    if (!Number.isFinite(numero) || numero < 1) {
        numero = 1;
    }

    numero = Math.floor(numero);

    if (numero % 2 === 0) {
        numero++;
    }

    return numero;

}

function obtenerCarrilNormalVehiculo(v) {

    if (!v) {
        return null;
    }

    if (Number.isFinite(Number(v.carril))) {
        return normalizarCarrilNormal(v.carril);
    }

    // Compatibilidad con registros antiguos: 163 = adelante, 164 = atras del carril 163.
    const legacy = Number(v.posicion);

    if (!Number.isFinite(legacy) || legacy < 1) {
        return null;
    }

    return legacy % 2 === 0
        ? legacy - 1
        : legacy;

}

function obtenerPosicionNormalVehiculo(v) {

    if (!v) {
        return null;
    }

    const texto = String(v.posicion || "")
        .trim()
        .toLowerCase();

    if (texto === "adelante") {
        return "Adelante";
    }

    if (texto === "atras" || texto === "atrás") {
        return "Atrás";
    }

    // Compatibilidad con registros antiguos.
    const legacy = Number(v.posicion);

    if (!Number.isFinite(legacy)) {
        return null;
    }

    return legacy % 2 === 0
        ? "Atrás"
        : "Adelante";

}

function obtenerResumenVehiculo(v) {

    if (!v) {
        return "";
    }

    if (esPlayaJ(v.playa)) {

        const p = parsearPosicionJ(v.posicion);

        if (p) {
            return `${v.playa} - ${v.bloque} - ${p.calle} - ${p.fila}`;
        }

        if (Number.isFinite(Number(v.carril)) && v.posicion !== undefined) {
            return `${v.playa} - ${v.bloque} - ${v.carril} - ${v.posicion}`;
        }

        return `${v.playa} - ${v.bloque}`;

    }

    const carril = obtenerCarrilNormalVehiculo(v);

    return carril === null
        ? `${v.playa} - ${v.bloque}`
        : `${v.playa} - ${v.bloque} - ${carril}`;

}

function obtenerProximaUbicacionNormal(
    playa,
    bloque,
    excluirVehiculo
) {

    const inicio = normalizarCarrilNormal(
        obtenerInicioNumeracion()
    );

    const registros = vehiculos.filter(function(v) {

        if (esPlayaJ(v.playa)) {
            return false;
        }

        if (
            excluirVehiculo &&
            v.id === excluirVehiculo.id
        ) {
            return false;
        }

        return (
            v.playa === playa &&
            v.bloque === bloque
        );

    });

    if (registros.length === 0) {
        return {
            carril: inicio,
            posicion: "Adelante"
        };
    }

    const carriles = registros
        .map(obtenerCarrilNormalVehiculo)
        .filter(function(carril) {
            return carril !== null && carril >= inicio;
        });

    if (carriles.length === 0) {
        return {
            carril: inicio,
            posicion: "Adelante"
        };
    }

    const ultimoCarril = Math.max(...carriles);

    const posicionesOcupadas = registros
        .filter(function(v) {
            return obtenerCarrilNormalVehiculo(v) === ultimoCarril;
        })
        .map(obtenerPosicionNormalVehiculo);

    if (!posicionesOcupadas.includes("Adelante")) {
        return {
            carril: ultimoCarril,
            posicion: "Adelante"
        };
    }

    if (!posicionesOcupadas.includes("Atrás")) {
        return {
            carril: ultimoCarril,
            posicion: "Atrás"
        };
    }

    return {
        carril: ultimoCarril + 2,
        posicion: "Adelante"
    };

}

function obtenerProximaPosicion(
    playa,
    bloque
) {

    if (esPlayaJ(playa)) {
        return obtenerProximaPosicionJ(
            playa,
            bloque
        );
    }

    return obtenerProximaUbicacionNormal(
        playa,
        bloque
    );

}
