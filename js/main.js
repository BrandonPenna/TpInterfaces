// Función para cargar componentes reutilizables (Header y Footer)
function cargarTemplate(idContenedor, rutaArchivo) {
    fetch(rutaArchivo)
        .then(response => {
            if (!response.ok) throw new Error(`No se pudo cargar ${rutaArchivo}`);
            return response.text();
        })
        .then(data => {
            document.getElementById(idContenedor).innerHTML = data;
        })
        .catch(error => console.error('Error cargando template:', error));
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarTemplate('header-container', 'templates/header.html');
    cargarTemplate('footer-container', 'templates/fat-footer.html');
});