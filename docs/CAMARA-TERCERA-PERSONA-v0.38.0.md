# Cámara libre en tercera persona y controles clásicos PC — v0.38.0

## Objetivo

Reemplazar la cámara aérea fija (v0.37.0) por una **cámara de seguimiento en tercera persona** que se pueda girar libremente alrededor del personaje, manteniendo la dirección de movimiento relativa a la vista. Los usuarios de computadora cuentan con WASD, mouse y flechas; la interfaz táctil mantiene el joystick y los botones A/B/C.

## Cámara

- Perspectiva FOV **55°** (antes 34°).
- Distancia base de seguimiento **7.8 unidades**, ajustable con rueda, controles +/− y pellizco táctil.
- Ángulo inicial aproximadamente **24.6°** sobre el plano del terreno, ajustable de 5.7° a 64.2° mediante mouse o flechas arriba/abajo.
- Orbita **360°** alrededor del personaje con mouse horizontal o flechas izquierda/derecha; la dirección del movimiento se calcula desde la orientación actual de la cámara.
- El seguimiento suaviza la posición y el punto de mirada para reducir sacudidas.
- Una comprobación de colisiones de cámara contra el terreno real, la torre y la casita reduce temporalmente la distancia si hay objetos sólidos entre el personaje y la cámara.
- El botón **AC / 3P** activa o desactiva solo la **curvatura del horizonte**. En ambos casos continúa siendo una cámara libre de tercera persona. El efecto curvo ahora sigue la orientación horizontal de la cámara, no exclusivamente el norte fijo.
- El cielo, las sombras y los objetos del mapa se conservan.

## Controles nuevos de PC

| Tecla / entrada | Acción |
|---|---|
| W / A / S / D | Avanzar / izquierda / retroceder / derecha, respecto a la orientación de la cámara |
| Mouse | Después de un clic dentro del área 3D, mueve la cámara libremente (captura del cursor) |
| Escape | Libera el mouse capturado; si hay un diálogo abierto, lo cierra |
| Botón derecho sostenido + arrastrar | Alternativa de giro sin capturar el cursor |
| Flechas izquierda / derecha | Girar la cámara horizontalmente |
| Flechas arriba / abajo | Inclinar la cámara verticalmente |
| Espacio = B | Toque breve salta; mantener corre o nada más rápido |
| Caps Lock = A | Interactuar, hablar, empezar subida/bajada de la escalera |
| Alt izquierdo = C | Toque breve: agacharse / levantarse / salir de escalera; mantener ~520 ms: arrastrarse |
| Rueda / + / − | Zoom |
| Ctrl+Z / Cmd+Z | Deshacer cambio de zoom |

Las teclas de acción **F, E y C** no se usan como equivalentes. Caps Lock se interpreta como botón físico sin depender del estado de mayúsculas. **Alt derecho no activa C**, evitando conflictos con AltGr.

## Pantallas táctiles

- Joystick izquierdo y botones A/B/C mantienen sus funciones.
- Arrastrar **un dedo** sobre el área del juego gira la cámara.
- Pellizcar con **dos dedos** sigue cambiando el zoom.
- Girar la cámara no modifica las colisiones ni el terreno.

## Compatibilidad y verificación

- La cámara no altera la física del avatar, la pendiente de 45°, las escaleras verticales, la casita, la cascada, el agua ni los NPC.
- La lógica de entrada B distingue entre toque corto y pulsación mantenida; C también distingue toque y mantenimiento.
- Comprobado por simulación que el mouse y WASD siguen direcciones coherentes, la cámara se limita a su ángulo permitido y las combinaciones de teclado disparan A, B y C correctamente.
- El módulo JavaScript fue revisado por sintaxis.
- **Queda pendiente la inspección WebGL interactiva real en PC y Android**, especialmente captura del mouse en diferentes navegadores, colisión de cámara cerca de edificios y percepción del zoom.

## Archivo histórico

El mapa anterior v0.37.0 con cámara aérea fija permanece [jugable en el archivo](../archive/valle-cascada-v0.37.0/index.html), con su propio manifiesto de versión congelado. Ninguno de los mapas antiguos se ha borrado.
