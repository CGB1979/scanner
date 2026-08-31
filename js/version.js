const APP_VERSION = "1.0.13";

document.addEventListener("DOMContentLoaded", () => {
    const versionElement = document.getElementById("versionBadge");

    if (versionElement) {
        versionElement.textContent = `v${APP_VERSION}`;
    }
});
