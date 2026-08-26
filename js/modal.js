/* ============================================================
   MODAL GLOBAL REUTILIZABLE
   Reemplaza alert() y prompt() nativos con modales propios.
   ============================================================ */

function abrirModalGlobal(opciones) {
    return new Promise(function(resolve) {
        const modal = document.getElementById("globalModal");
        const titulo = document.getElementById("globalModalTitulo");
        const mensaje = document.getElementById("globalModalMensaje");
        const campo = document.getElementById("globalModalInput");
        const cancelar = document.getElementById("globalModalCancelar");
        const aceptar = document.getElementById("globalModalAceptar");

        if (!modal || !titulo || !mensaje || !campo || !cancelar || !aceptar) {
            console.error("No se encontro el modal global.");
            resolve(opciones.tipo === "prompt" ? null : true);
            return;
        }

        let resuelto = false;

        function cerrar(resultado) {
            if (resuelto) return;
            resuelto = true;
            modal.classList.add("hidden");
            document.removeEventListener("keydown", alPresionarTecla);
            aceptar.onclick = null;
            cancelar.onclick = null;
            modal.onclick = null;
            resolve(resultado);
        }

        function alPresionarTecla(event) {
            if (event.key === "Escape") {
                if (opciones.tipo === "prompt") cerrar(null);
                else cerrar(true);
            }
            if (event.key === "Enter") {
                event.preventDefault();
                cerrar(opciones.tipo === "prompt" ? campo.value : true);
            }
        }

        titulo.textContent = opciones.titulo || "Atencion";
        mensaje.textContent = opciones.mensaje || "";
        aceptar.textContent = opciones.aceptar || "Aceptar";
        aceptar.className = "btn-success";

        if (opciones.tipo === "prompt") {
            campo.value = opciones.valor || "";
            campo.placeholder = opciones.placeholder || "";
            campo.classList.remove("hidden");
            cancelar.textContent = opciones.cancelar || "Cancelar";
            cancelar.classList.remove("hidden");
        } else {
            campo.classList.add("hidden");
            cancelar.classList.add("hidden");
        }

        aceptar.onclick = function() {
            cerrar(opciones.tipo === "prompt" ? campo.value : true);
        };

        cancelar.onclick = function() {
            cerrar(null);
        };

        modal.onclick = function(event) {
            if (event.target === modal) {
                if (opciones.tipo === "prompt") cerrar(null);
                else cerrar(true);
            }
        };

        document.addEventListener("keydown", alPresionarTecla);
        modal.classList.remove("hidden");

        setTimeout(function() {
            (opciones.tipo === "prompt" ? campo : aceptar).focus();
            if (opciones.tipo === "prompt") campo.select();
        }, 0);
    });
}

function mostrarAlerta(mensaje, titulo) {
    return abrirModalGlobal({
        tipo: "alert",
        titulo: titulo || "Atencion",
        mensaje: mensaje,
        aceptar: "Aceptar"
    });
}

function mostrarPrompt(mensaje, valorInicial, opciones) {
    opciones = opciones || {};
    return abrirModalGlobal({
        tipo: "prompt",
        titulo: opciones.titulo || "Ingresar dato",
        mensaje: mensaje,
        valor: valorInicial || "",
        placeholder: opciones.placeholder || "",
        aceptar: opciones.aceptar || "Continuar",
        cancelar: opciones.cancelar || "Cancelar"
    });
}
