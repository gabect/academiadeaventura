# Tiny Swords — integración en Academia de Aventura

Referencia: [Tiny Swords de Pixel Frog](https://pixelfrog-assets.itch.io/tiny-swords).

## Qué utiliza el juego
El usuario proporcionó `Tiny Swords.zip` y `Tiny Swords (Free Pack).zip`. El modo de cámara clásico usa **recortes específicos** del *Free Pack* dentro del juego:

- cuatro variantes de árboles;
- cuatro arbustos, cuatro rocas y fragmentos de troncos;
- paleta de césped derivada del mosaico y agua derivada de su muestra de color.

La integración incluye únicamente un atlas de recursos para **renderizado del juego** y dos texturas de terreno; no es una distribución del paquete original. No subimos archivos `.aseprite`, los ZIP originales ni la colección completa. No ofrece herramientas de exportación de los recursos.

## Licencia externa
Pixel Frog permite utilizar y modificar Tiny Swords en proyectos personales y comerciales; la atribución es opcional. El autor **prohíbe redistribuir, revender o empaquetar nuevamente los recursos como archivos independientes**, incluso modificados. Por tanto, **estos archivos no quedan bajo la licencia del código de este repositorio** y no deben copiarse ni redistribuirse como paquete.

Revisar las condiciones actuales directamente en el sitio del autor antes de distribuir el proyecto fuera de su juego.

## Decisiones técnicas
- La cámara clásica `/diorama/` utiliza las nuevas decoraciones; la vista anterior `?camera=third-person` conserva la decoración artesanal original como respaldo y comparación.
- No cambian posición de árboles, obstáculos, montañas, NPC, agua física, caminos ni colisiones.
- Si falla la carga de un recurso del atlas, no ocultamos las decoraciones anteriores.
- Un atlas WebP reduce cambios de textura y llamados de dibujo; las instancias siguen ubicaciones ya definidas.
- Se mantiene transparencia real y filtrado lineal para evitar escalones visuales innecesarios.

## Limitación actual
El arte del paquete de origen es **pixel art**. El reescalado de filtrado suave reduce píxeles evidentes, pero no inventa detalles HD. La vista moderna requiere evaluar la escala, armonía del mapa y potenciales recursos HD propios.
