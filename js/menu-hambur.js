/* ============================================================
   MENÚ HAMBURGUESA | JavaScript vanilla
   Abre y cierra el menú desplegable de categorías del header.
   El header lo inyecta main.js, por eso se conecta recién cuando
   `templatesListos` se resuelve.
   ============================================================ */
(function () {
    "use strict";

    const MENU_ABIERTO = "menu-open";

    function conectarMenu() {
        const trigger = document.querySelector(".menu-trigger");
        const menu = document.querySelector("#category-menu");
        if (!trigger || !menu) return;

        const estaAbierto = () => document.body.classList.contains(MENU_ABIERTO);

        function setMenuOpen(isOpen) {
            document.body.classList.toggle(MENU_ABIERTO, isOpen);
            trigger.setAttribute("aria-expanded", String(isOpen));
            if (!isOpen) trigger.focus();
        }

        /* ---------- 1. En la home los links a secciones saltan ----------
           Los anclajes (../index.html#seccion-N) los escribe el template;
           si la sección ya existe en esta página, se convierte en un
           scroll suave para no recargar la home completa. */
        menu.querySelectorAll("a[href*='#seccion-']").forEach((link) => {
            const seccion = document.getElementById(link.hash.slice(1));
            if (!seccion) return;

            link.addEventListener("click", (event) => {
                event.preventDefault();
                setMenuOpen(false);
                seccion.scrollIntoView({ behavior: "smooth" });
            });
        });

        /* ---------- 2. APERTURA / CIERRE ---------- */

        // La hamburguesa hace toggle: si el menú está abierto (cruz),
        // el mismo clic lo cierra.
        trigger.addEventListener("click", () => setMenuOpen(!estaAbierto()));

        // Al tocar afuera del menú (y del trigger) se cierra.
        document.addEventListener("click", (event) => {
            if (!estaAbierto()) return;
            if (event.target.closest("#category-menu, .menu-trigger")) return;
            setMenuOpen(false);
        });

        // Al tocar cualquier enlace del menú, se cierra.
        menu.addEventListener("click", (event) => {
            if (event.target.closest("a")) setMenuOpen(false);
        });

        // Escape cierra el menú.
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && estaAbierto()) setMenuOpen(false);
        });
    }

    templatesListos.then(conectarMenu);
})();
