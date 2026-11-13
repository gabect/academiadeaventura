# Academia de Aventura — Nuevo Mundo 2D (independiente)

**Versión experimental, jugable:** `/diorama/nuevo-mundo.html`.

El escenario anterior se conserva en `/diorama/` sin reemplazar sus sistemas ni su mapa. Esta etapa es una **implementación de mundo nuevo**, no una imagen de fondo ni una modificación de las ubicaciones antiguas.

## Dirección artística
Aventura 2D vista desde arriba, con cámara estable y desplazamiento de ocho direcciones, inspirada en la legibilidad clásica de *A Link to the Past* y el acabado suave de *Link's Awakening* (Switch). El mundo, el diseño de niveles, la ambientación y los símbolos son originales. No hay emblemas de la Trifuerza.

La vegetación utiliza una selección del pack **Tiny Swords / Pixel Frog**, incluido dentro del juego con transparencia y filtrado lineal. El resto del mundo se dibuja proceduralmente con Canvas 2D de formas suaves (costas, montañas, ríos, pantanos, caminos, ruinas y poblados).

## Mapa físico
Mundo 2400 × 1680 unidades (píxeles lógicos). Los cuatro biomas se conectan mediante senderos y puentes.

| Región | Recursos y posibilidades | Restricción física |
| --- | --- | --- |
| Norte | Bosque denso, ruinas, cueva, senderos estrechos | Cordillera continua, infranqueable |
| Este | Valles húmedos, charcas, cañaverales, pasarelas y refugio | Mar peligroso: playa sin acceso a la natación |
| Sur | Bosque seco, villa pesquera, faro, muelle, playas transitables | Solo 8 px lógicos hacia el agua al sur |
| Oeste | Bosque liviano, campos abiertos, molino, costa rocosa | Océano y franja de acantilados impenetrables |

El río central es un obstáculo físico: se atraviesa únicamente por puentes. Las pozas del pantano impiden caminar por agua profunda, salvo en pasarelas.

Las casas principales, el molino, el faro, la caverna y los troncos de los árboles generan colisiones. Los puntos de aparición y los caminos han sido despejados para permitir desplazamiento. Las costas y barreras están definidas matemáticamente, no por los píxeles visibles de la ilustración.

## Controles
- Teclado: WASD/flechas para desplazarse, Shift correr, E interactuar, M mapa.
- Móvil: joystick, botón de interacción, botón de correr.
- Zoom: rueda del ratón o botones +/-.
- Cámara: 2D clásica fija siguiendo al personaje, con vista general del mapa.
- El minimapa marca al jugador y usa el mismo terreno que el mundo jugable.

## Estructura de archivos
- `diorama/nuevo-mundo-model.mjs`: geometría regional, fronteras, colisiones, movimiento, obstáculos y POI.
- `diorama/nuevo-mundo-render.mjs`: paisaje dibujado y renderizado del avatar.
- `diorama/nuevo-mundo.html`: interfaz e interacción.
- `tests/nuevo-mundo.test.mjs`: límites norte/este/sur/oeste, vadeo máximo, puentes y biomas.
- `tests/nuevo-mundo-browser.mjs`: prueba de pantalla real en escritorio y móvil.
- `.github/workflows/nuevo-mundo.yml`: CI y capturas.

## Estado de esta etapa
Esta construcción incluye una **figura ilustrada temporal** para el protagonista. No es aún la animación del caballero del ZIP anterior; sus sprites no se han agregado al repositorio de este nuevo mundo. El mapa sí es jugable y no depende del personaje experimental 3D.

No tratar la imagen conceptual como mapa de colisión: la ilustración es la referencia visual y estas superficies constituyen la representación jugable.
