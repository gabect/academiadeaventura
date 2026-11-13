# Academia de Aventura — dirección visual definitiva

## Referencias funcionales
- **The Legend of Zelda: A Link to the Past:** la orientación y lectura del mapa desde una cámara elevada y fija, con movimiento claro en ocho direcciones. Esto es una referencia de diseño, no una solicitud de copiar arte, personajes o mapas.
- **The Legend of Zelda: Link's Awakening (Nintendo Switch, 2019):** calidad y suavidad contemporáneas de la imagen, escala de maqueta, contornos limpios y materiales legibles.
- **Identidad propia de Academia de Aventura:** un mundo construido visualmente con cartón y pintura. Evitar gráficos de píxeles grandes, geometrías toscas y superficies plastificadas.

## Implementación — fase 1 (cámara)
- La ruta `/diorama/` utiliza **cámara ortográfica** elevada, ángulo fijo (61.3° desde el suelo), norte constante y tamaño de vista de 20.5 unidades verticales a zoom 1.
- `WASD`, teclado y joystick se mantienen como movimiento en ocho direcciones, sin rotación de cámara al caminar.
- Zoom con botones, rueda y gesto de pellizcar; no cambiar la inclinación con ratón o flechas en modo clásico.
- La cámara sigue las alturas físicas de terreno, rampas, montaña y agua de forma amortiguada; el mapa y las colisiones no cambian.
- El modo anterior permanece disponible con `?camera=third-person` y con el botón `3P`; desde allí `CL` vuelve al clásico.
- Los personajes conservan el **esqueleto original**, porque los prototipos de malla procedural y piezas vectoriales no alcanzaron la calidad requerida.

## Fase 2 — arte HD y personajes
- Diseñar sprites originales HD o modelos 3D artísticamente esculpidos en acabado suave, no generados a base de esferas y tubos.
- Resolución de origen suficiente para que el personaje se vea suave al zoom máximo, con antialiasing, transparencia real y sin halos de fondo.
- Conservar personaje, vestuario, orientación visual y escala en cuatro/ocho direcciones con animación natural, sin fingir articulación usando deformación de una única lámina.
- Priorizar el terreno visible desde arriba: caminos, claros, escalones, árboles y cuerpos de agua deben mantener jerarquía y contraste; sombras de contacto suaves.
- No sustituir el escenario de cartón por un entorno realista. No copiar arte de Nintendo ni contenido protegido.

## Criterios de aprobación
1. Comparación de capturas de `/diorama/` en escritorio y móvil.
2. Movimiento W/A/S/D siempre correlacionado con norte/sur/este/oeste en pantalla.
3. La cámara no orbita ni cambia de orientación; sigue la altura del jugador en las pendientes.
4. Zoom sin pixelación deliberada, distorsión perspectiva ni caídas fuertes de rendimiento.
5. El mapa conserva geometría, árboles, rutas, NPC y colisiones existentes.
6. El modo 3P anterior puede recuperarse desde la interfaz.
