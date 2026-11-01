# Especificaciones Técnicas y Consignas: Juego "Peg Solitaire" (Entregable N°4)

Este documento sirve como la guía de requisitos y arquitectura para el desarrollo del **Ejercicio Entregable N°4: Peg Solitaire**. Todo el código generado debe cumplir estrictamente con los puntos detallados a continuación.

---

## 🎯 1. Visión General del Proyecto
Desarrollar una aplicación web interactiva en **HTML5 Canvas** y **JavaScript Vanilla (OOP)** que implemente el juego clásico **Peg Solitaire** (Solitario de Clavijas / Senku), integrado dentro del sitio web desarrollado previamente en el TPE2.

---

## 🎨 2. Requerimientos Visuales y Renderizado

### 2.1 Tablero de Juego
- **Fondo:** El tablero debe dibujarse sobre una **imagen de fondo** acorde a la temática elegida (no gráficos planos).
- **Dimensiones y Viewport:**
  - El Canvas debe ser **completamente visible en una resolución Full HD (1920x1080)**.
  - **RESTRICCIÓN CRÍTICA:** El Canvas **NO debe generar scrollbar** (desplazamiento vertical u horizontal) en pantalla.

### 2.2 Fichas / Clavijas
- **REGLA OBLIGATORIA:** Las fichas **NO** pueden ser dibujadas utilizando colores sólidos ni primitivas simples (`arc` con `fillColor` plano). **Deben ser imágenes recortadas/transparentes (PNG/SVG)** adaptadas a la temática del juego.
- **Variabilidad de Temática:** Permitir la selección de **diferentes tipos de fichas** (por color, textura o formato) dentro de la interfaz.

---

## 🖱️ 3. Mecánica de Juego e Interacción (Drag & Drop)

### 3.1 Selección y Arrastre
- La selección de fichas se realiza mediante el `click` del mouse.
- El usuario puede realizar **drag and drop** (arrastrar y soltar) libremente por la pantalla.
- **Validación de Caída:** 
  - Si la posición elegida es un movimiento válido según las reglas de Peg Solitaire, la ficha se ubica en el casillero destino y se elimina la ficha saltada.
  - Si el movimiento **no es válido**, la ficha debe retornar a su posición original (con animación suave o reposicionamiento inmediato).

### 3.2 Hints ANIMADOS (Requisito Obligatorio)
- Al momento de seleccionar o arrastrar una ficha, el sistema debe calcular e **indicar visualmente con animaciones** cuáles son los casilleros válidos donde se puede soltar la ficha.
- **Ejemplos de Hints:**
  - Flechas animadas flotando sobre los casilleros destino.
  - Indicadores de pulso, resplandor o escalado animado sobre las casillas válidas.
  - Animación cíclica dibujada en cada frame del `requestAnimationFrame`.

---

## ⚙️ 4. Lógica de Juego y Estado de Finalización

1. **Evaluación de Movimientos:** Después de **cada movimiento exitoso**, el sistema debe evaluar si restan movimientos válidos en todo el tablero.
2. **Condiciones de Fin de Juego:**
   - **Victoria / Sin movimientos:** El juego finaliza automáticamente cuando no existen más movimientos válidos posibles.
   - **Tiempo agotado:** El juego finaliza si el temporizador llega a cero.
3. **Timer y Reset:**
   - Debe implementarse un **temporizador (Timer)** visible con un límite de tiempo de juego configurable.
   - Botón de **Reiniciar** que reestablezca el tablero, el contador de fichas y el timer.

---

## 🌐 5. Integración Web y Documentación

- **Integración:** El juego debe estar incorporado dentro de la página web del TPE2 de manera armónica.
- **Sección de Ayuda / Tutorial:** Debe incluir:
  - Instrucciones claras de cómo jugar.
  - Descripción completa de las reglas y la temática.
  - Imágenes/capturas explicativas del juego.

---

## 💻 6. Estándares de Código y Documentación

### 6.1 Estructura del Código
- Desarrollado en **JavaScript Vanilla** (sin librerías externas de canvas como Phaser o PixiJS).
- Programación Orientada a Objetos (POO): Clases claras como `Juego`, `Tablero`, `Ficha`, `Hint`, `Timer`.

### 6.2 Comentarios Obligatorios
- **TODOS LOS MÉTODOS Y FUNCIONES** deben estar comentados exhaustivamente:
  - Explicar **qué** funcionalidad implementa el método.
  - Explicar **cómo** se realiza el procedimiento lógico interno.
  - Detallar parámetros de entrada (`@param`) y valores de retorno (`@returns`).

---

## 📅 7. Condiciones de Entrega
- **Fecha Límite:** Hasta el día **04/11/2026 a las 23:59:59 hs**.
- **Plataforma:** Despliegue en GitHub Pages mediante la rama `gh-pages`.
- **Compatibilidad:** **No es necesario** que sea responsive o compatible con dispositivos Mobile (diseñado para Desktop Full HD).

---

## 📝 Instrucción Directa para la IA (Claude)
> "Por favor, utiliza este documento `.md` como la especificación técnica completa para construir el código HTML, CSS y JS del juego Peg Solitaire. Asegúrate de incluir la estructura de clases POO, los algoritmos de validación de saltos, el ciclo de renderizado para los hints animados y la documentación exhaustiva en comentarios en cada método."