/* ============================================================
   MENÚ HAMBURGUESA | JavaScript vanilla
   Abre y cierra el menú desplegable de categorías del header.

   El partial templates/header.html lo inyecta main.js con
   fetch + innerHTML, así que .menu-trigger todavía puede no
   existir cuando corre este archivo. Por eso se espera con un
   MutationObserver (mismo patrón que js/header-home.js).
   ============================================================ */
(function () {
    "use strict";

    const MENU_ABIERTO = "menu-open";

    function conectarMenu() {
        const trigger = document.querySelector(".menu-trigger");
        const menu = document.querySelector("#category-menu");

        if (!trigger || !menu) return false;
        if (menu.dataset.menuConectado === "true") return true;

        menu.dataset.menuConectado = "true";

        /* ---------- 1. En la home los links a secciones saltan ----------
           Los anclajes (../index.html#seccion-N) los escribe el template;
           si la sección ya existe en esta página, se convierte en un
           scroll suave para no recargar la home completa. */
        const linksLocales = menu.querySelectorAll("a[href*='#seccion-']");
        linksLocales.forEach((link) => {
            const id = link.hash.replace("#", "");
            if (document.getElementById(id)) {
                link.addEventListener("click", (event) => {
                    event.preventDefault();
                    setMenuOpen(false);
                    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
                });
            }
        });

        /* ---------- 2. APERTURA / CIERRE ---------- */

        function setMenuOpen(isOpen) {
            document.body.classList.toggle(MENU_ABIERTO, isOpen);
            trigger.setAttribute("aria-expanded", String(isOpen));
            if (!isOpen) trigger.focus();
        }

        // La hamburguesa hace toggle: si el menú está abierto (cruz),
        // el mismo clic lo cierra.
        trigger.addEventListener("click", () =>
            setMenuOpen(!document.body.classList.contains(MENU_ABIERTO)));

        // Al tocar afuera del menú (y del trigger) se cierra.
        document.addEventListener("click", (event) => {
            if (!document.body.classList.contains(MENU_ABIERTO)) return;
            if (event.target.closest("#category-menu")) return;
            if (event.target.closest(".menu-trigger")) return;
            setMenuOpen(false);
        });

        // Al tocar cualquier enlace del menú, se cierra.
        menu.addEventListener("click", (event) => {
            if (event.target.closest("a")) setMenuOpen(false);
        });

        // Escape cierra el menú.
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && document.body.classList.contains(MENU_ABIERTO)) {
                setMenuOpen(false);
            }
        });

        return true;
    }

    /* ---------- 3. ESPERA A LA INYECCIÓN ---------- */

    function iniciar() {
        if (conectarMenu()) return;

        const observer = new MutationObserver(() => {
            if (!conectarMenu()) return;
            observer.disconnect();
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }

})();