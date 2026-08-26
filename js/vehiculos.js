function textoProximaUbicacion(playa, ubicacion) {

    if (esPlayaJ(playa)) {
        return String(ubicacion || "");
    }

    if (!ubicacion) {
        return "";
    }

    return `${ubicacion.carril} - ${ubicacion.posicion}`;

}

function actualizarPantalla() {

    const playa = playaSelect.value;
    const bloque = bloqueSelect.value;

    tituloUbicacion.innerText =
        `Playa ${playa} - Bloque ${bloque}`;

    const registros = vehiculos.filter(function(v) {
        return v.playa === playa && v.bloque === bloque;
    });

    cantidadVehiculos.innerText = registros.length;

    proximaPosicion.innerText = textoProximaUbicacion(
        playa,
        obtenerProximaPosicion(playa, bloque)
    );

    mostrarVehiculos();
    actualizarAyudaNumeracion();

}

function mostrarVehiculos() {

    const playa = playaSelect.value;
    const bloque = bloqueSelect.value;

    const registros = vehiculos
        .filter(function(v) {
            return v.playa === playa && v.bloque === bloque;
        })
        .sort(function(a, b) {

            if (esPlayaJ(playa)) {

                const pa = parsearPosicionJ(a.posicion);
                const pb = parsearPosicionJ(b.posicion);

                if (!pa && !pb) return 0;
                if (!pa) return 1;
                if (!pb) return -1;

                if (pa.calle !== pb.calle) {
                    return pa.calle - pb.calle;
                }

                return pa.fila - pb.fila;
            }

            const carrilA = obtenerCarrilNormalVehiculo(a) || 0;
            const carrilB = obtenerCarrilNormalVehiculo(b) || 0;

            if (carrilA !== carrilB) {
                return carrilA - carrilB;
            }

            const ordenA = obtenerPosicionNormalVehiculo(a) === "Adelante" ? 1 : 2;
            const ordenB = obtenerPosicionNormalVehiculo(b) === "Adelante" ? 1 : 2;

            return ordenA - ordenB;
        });

    if (registros.length === 0) {
        listaVehiculos.innerHTML = `
            <div class="empty">
                No hay vehiculos asignados en esta calle.
            </div>
        `;
        return;
    }

    listaVehiculos.innerHTML = "";

    registros.forEach(function(v) {

        const div = document.createElement("div");
        div.className = "vehicle";

        let ubicacionTexto = "";
        let posicionTexto = "";

        if (esPlayaJ(v.playa)) {

            const p = parsearPosicionJ(v.posicion);

            if (p) {
                ubicacionTexto = `Playa ${v.playa} - Bloque ${v.bloque} - Carril ${p.calle} - Posicion ${p.fila}`;
                posicionTexto = `${p.calle}-${p.fila}`;
            }

        } else {

            const carril = obtenerCarrilNormalVehiculo(v);
            const posicion = obtenerPosicionNormalVehiculo(v);

            ubicacionTexto = `Playa ${v.playa} - Bloque ${v.bloque} - Carril ${carril} - Posición ${posicion}`;
            posicionTexto = `Carril ${carril} - ${posicion}`;
        }

        div.innerHTML = `
            <div class="vehicle-position">
                ${escapeHTML(posicionTexto)}
            </div>

            <div class="vehicle-chassis">
                ${escapeHTML(v.chasis)}
            </div>

            <div class="vehicle-info">
                ${escapeHTML(ubicacionTexto)}
            </div>

            <div class="vehicle-actions">
                <button
                    class="btn-warning"
                    onclick="reasignarDesdeLista('${escapeJS(v.chasis)}')">
                    Cambiar ubicacion
                </button>

                <button
                    class="btn-danger"
                    onclick="eliminarVehiculo('${escapeJS(v.chasis)}')">
                    Eliminar
                </button>
            </div>
        `;

        listaVehiculos.appendChild(div);
    });
}
