# Academia de Aventura

RPG educativo en navegador, diseñado para Chromebooks y dispositivos táctiles. Prototipo 3D con HTML, CSS, JavaScript y Three.js, sin sprites ni motor de juego tradicional.

**Jugar:** https://gabect.github.io/academiadeaventura/

## Controles
- **Teclado:** WASD o flechas para moverse; E para hablar con el guardián.
- **Pantalla táctil:** joystick circular izquierdo para moverse; botón **Hablar** para interactuar.
- **Correr:** pulsa **Correr** una vez para activar la carrera; pulsa **Caminar** para desactivarla. La carrera también funciona con teclado.

## Versión actual: 0.3.0 — 7 de noviembre de 2026
- Velocidad al caminar aumentada un 20 % (4 → 4.8 unidades/segundo).
- Carrera opcional a 6.2 unidades/segundo.
- Brazos y piernas oscilan más rápido al caminar o correr.
- Botón táctil de carrera con estado activado/desactivado, sin menú contextual.
- Número de versión discreto en pantalla.

## Historial de versiones
- **0.3.0 (2026-11-07):** movimiento y carrera táctil; documentación inicial.
- **0.2 (2026-11-07):** patio 3D, cámara isométrica, guardián, prueba educativa y recompensas.
- **2026-11-07-joystick-1:** joystick analógico, ocultación del panel de instrucciones y comprobación periódica de versiones.

## Procedimiento para próximos cambios
1. Modificar únicamente los componentes acordados.
2. Incrementar la versión de forma coherente: parche (0.3.1), función (0.4.0), cambio incompatible (1.0.0).
3. Actualizar **BUILD** y el texto **buildLabel** en `index.html`.
4. Actualizar la versión en `version.json` **al final**, después de publicar el HTML, para que los navegadores detecten la versión nueva.
5. Registrar fecha y cambios en este README.
6. Probar en teléfono táctil y Chromebook. GitHub Pages puede tardar en desplegar; un commit no garantiza publicación inmediata.

## Notas técnicas
La comprobación de `version.json` se hace cada 30 segundos y recarga cuando no hay una misión ni controles activos. El sistema no preserva una misión en curso si se recarga. La orientación horizontal depende de las capacidades del navegador.

No introducir datos personales de estudiantes en este repositorio público.
