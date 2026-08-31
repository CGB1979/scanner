const APP_VERSION = "1.0.1.k";

document.addEventListener("DOMContentLoaded", () => {
    const versionElement = document.getElementById("versionBadge");

    if (versionElement) {
        versionElement.textContent = `v${APP_VERSION}`;
    }
});
