# Open World Lab — Academia de Aventura

Prototipo autónomo de exploración web en **3D real y tercera persona**. No es un mapa isométrico, no es un mundo de voxels y no sustituye los proyectos anteriores.

## Probar

Se abre desde `https://gabect.github.io/academiadeaventura/openworld/` después de la publicación en la rama servida por GitHub Pages. Para probarlo en local, inicia un servidor HTTP desde la raíz del proyecto (`python -m http.server 8000`) y visita `http://localhost:8000/openworld/`.

Requiere WebGL y conexión a internet para descargar Three.js `0.170.0` desde jsDelivr (la versión se fija para reproducibilidad). No requiere instalar dependencias ni iniciar sesión. Si el entorno escolar bloquea el CDN, habrá que alojar la biblioteca de forma local.

## Contenido incluido en la versión 0.1

- Terreno de ~320 × 320 metros; relieve continuo en malla, con pintura de suelo y senderos integrados.
- Perspectiva en tercera persona detrás del avatar humanoide, con cámara orbital libre, zoom y evitación básica de obstáculos.
- Avatar volumétrico articulado con movimiento y salto; teclas WASD / flechas, Shift, Espacio, E.
- Joystick táctil y controles de cámara por arrastre.
- Villa con siete edificios a escala real del personaje, puertas, ventanas, tejados y límites de colisión.
- Río sinuoso y puente con tablero caminable, rampas de entrada y barandales físicos.
- Bosques de árboles 3D y afloramientos rocosos; vegetación instanciada para reducir draw calls.
- Guardado de posición local y botón de reinicio.
- Etiquetas contextuales de interacción, sin marcadores de vista aérea que sustituyan lugares.
- Sin cuentas, misiones, XP ni integraciones de estudiantes en esta fase.

## Próximas prioridades

1. QA real en navegadores de escritorio y Chromebooks, especialmente WebGL, rendimiento y bloqueo de jsDelivr.
2. Sustituir el avatar y los edificios de malla procedural por modelos GLB originales y optimizados (LODs, materiales y animaciones de mayor calidad).
3. Mejorar terreno/cámara en pendientes pronunciadas y gestionar colisiones físicas con Rapier.
4. Incorporar carga sectorizada del mundo y pruebas automatizadas de regresión visual.
5. Conectar entidades interactivas de forma desacoplada con el futuro sistema de contenido educativo.

**Nota técnica:** Esta entrega usa colisiones geométricas ligeras y detección de suelo. Rapier queda para la siguiente iteración: no se afirma que ya esté instalado.

## Controles

| Acción | Teclado / mouse | Táctil |
|---|---|---|
| Caminar | WASD / flechas | Joystick izquierdo |
| Cámara | Arrastrar mouse | Arrastrar el escenario |
| Correr | Shift | Botón CORRER |
| Saltar | Espacio | Botón SALTAR |
| Interactuar | E | Botón E |
| Zoom | Rueda | — |

## Aislamiento

Los archivos viven en `openworld/` y no reemplazan `index.html`, `diorama/` ni `assets/` existentes.