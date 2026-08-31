(() => {
    const VERSION_ACTUAL = APP_VERSION;
    const VERSION_GUARDADA = "app_version_vista";

    function crearToastActualizacion() {
        if (document.getElementById("updateToast")) {
            return;
        }

        const toast = document.createElement("div");
        toast.id = "updateToast";

        toast.innerHTML = `
            <div class="update-toast-content">
                <div class="update-toast-icon">✓</div>

                <div class="update-toast-text">
                    <strong>Nueva versión disponible</strong>
                    <span>Versión ${VERSION_ACTUAL}</span>
                </div>

                <button id="updateNowButton">
                    Actualizar
                </button>
            </div>
        `;

        document.body.appendChild(toast);

        document.getElementById("updateNowButton").addEventListener("click", actualizarAhora);
    }

    function agregarEstilos() {
        if (document.getElementById("updateToastStyles")) {
            return;
        }

        const style = document.createElement("style");
        style.id = "updateToastStyles";

        style.textContent = `
            #updateToast {
                position: fixed;
                left: 50%;
                bottom: 24px;
                transform: translateX(-50%);
                width: min(500px, calc(100% - 30px));
                z-index: 99999;
                animation: updateToastEntrada 0.35s ease;
            }

            .update-toast-content {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 14px 16px;
                background: #ffffff;
                border: 2px solid #4f8f5b;
                border-radius: 16px;
                box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18);
            }

            .update-toast-icon {
                width: 34px;
                height: 34px;
                flex: 0 0 34px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: #4f8f5b;
                color: #ffffff;
                font-weight: bold;
                font-size: 18px;
            }

            .update-toast-text {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 3px;
            }

            .update-toast-text strong {
                color: #26322a;
                font-size: 14px;
            }

            .update-toast-text span {
                color: #68736c;
                font-size: 12px;
            }

            #updateNowButton {
                border: 0;
                border-radius: 10px;
                padding: 10px 14px;
                background: #4aaed6;
                color: #ffffff;
                font-weight: 700;
                cursor: pointer;
                white-space: nowrap;
            }

            #updateNowButton:hover {
                opacity: 0.9;
            }

            @keyframes updateToastEntrada {
                from {
                    opacity: 0;
                    transform: translate(-50%, 20px);
                }

                to {
                    opacity: 1;
                    transform: translate(-50%, 0);
                }
            }

            @media (max-width: 600px) {
                #updateToast {
                    bottom: 15px;
                }

                .update-toast-content {
                    padding: 12px;
                }

                .update-toast-text strong {
                    font-size: 13px;
                }

                #updateNowButton {
                    padding: 9px 11px;
                    font-size: 12px;
                }
            }
        `;

        document.head.appendChild(style);
    }

    async function actualizarAhora() {
        try {
            localStorage.setItem(VERSION_GUARDADA, VERSION_ACTUAL);

            if ("serviceWorker" in navigator) {
                const registro = await navigator.serviceWorker.getRegistration();

                if (registro) {
                    await registro.update();

                    if (registro.waiting) {
                        registro.waiting.postMessage({
                            type: "SKIP_WAITING"
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Error actualizando la aplicación:", error);
        }

        window.location.reload(true);
    }

    function comprobarVersion() {
        const versionAnterior = localStorage.getItem(VERSION_GUARDADA);

        if (!versionAnterior) {
            localStorage.setItem(VERSION_GUARDADA, VERSION_ACTUAL);
            return;
        }

        if (versionAnterior !== VERSION_ACTUAL) {
            agregarEstilos();
            crearToastActualizacion();
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", comprobarVersion);
    } else {
        comprobarVersion();
    }
})();
