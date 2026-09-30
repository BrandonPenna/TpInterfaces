/* ============================================================
   MAIN | Común a todas las páginas
   Inyecta los componentes reutilizables (header y footer) desde
   templates/ con fetch. Cada página lo carga primero.

   Expone `templatesListos` (lo único global de este archivo): una
   promesa que se resuelve cuando los partials ya están en el DOM.
   Los scripts que necesitan elementos del header (menú hamburguesa)
   esperan a esa promesa.
   ============================================================ */
const templatesListos = (function () {
    "use strict";

    // Ruta base de templates resuelta desde este propio archivo (js/main.js),
    // para que funcione desde la raíz (index.html) y desde subcarpetas (pages/).
    const BASE_TEMPLATES = new URL("../templates/", document.currentScript.src).href;

    // Los partials usan rutas relativas a templates/ (ej: ../assets/icons/logo.png).
    // Como se inyectan en páginas que están a distinta profundidad, las convertimos
    // a URLs absolutas resolviéndolas contra la ruta del propio template.
    function resolverRutas(html) {
        return html.replace(
            /(\s(?:src|href)\s*=\s*)(["'])(\.\.\/[^"']+)\2/g,
            (match, prefijo, comilla, ruta) => prefijo + comilla + new URL(ruta, BASE_TEMPLATES).href + comilla
        );
    }

    // Carga un partial dentro de su contenedor. El contenedor puede pedir su
    // propio partial con data-template="archivo.html"; si no, usa el de por defecto.
    // Nunca rechaza: si falla, lo informa en consola y la página sigue.
    function cargarTemplate(idContenedor, partialPorDefecto) {
        const contenedor = document.getElementById(idContenedor);
        if (!contenedor) return Promise.resolve();

        const rutaArchivo = BASE_TEMPLATES + (contenedor.dataset.template || partialPorDefecto);

        return fetch(rutaArchivo)
            .then((response) => {
                if (!response.ok) throw new Error(`No se pudo cargar ${rutaArchivo}`);
                return response.text();
            })
            .then((data) => {
                contenedor.innerHTML = resolverRutas(data);
            })
            .catch((error) => console.error("Error cargando template:", error));
    }

    return new Promise((resolve) => {
        document.addEventListener("DOMContentLoaded", () => {
            resolve(Promise.all([
                cargarTemplate("header-container", "header.html"),
                cargarTemplate("footer-container", "fat-footer.html")
            ]));
        });
    });
})();
