let navigateInstance = null;

export function setNavigate(navigate) {
    navigateInstance = navigate;
}

export function getNavigate() {
    if (!navigateInstance) throw new Error("Navigate não inicializado");
    return navigateInstance;
}