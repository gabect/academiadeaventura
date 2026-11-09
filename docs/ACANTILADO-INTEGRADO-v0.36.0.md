# Valle de la Cascada — Acantilado integrado, sin fachada ni cuadrícula (v0.36.0)

## Problema observado
La captura de v0.35.0 mostraba columnas y franjas coloreadas, semejantes a una cuadrícula o cortina suspendida debajo del borde del terreno. El problema no era una textura: `buildLayeredCliffFaces()` creaba **un segundo objeto vertical**, independiente del relieve jugable. Su índice de segmento alternaba colores de piedra, creando un patrón repetitivo de tablero. `buildLayeredCliffRims()` añadía otra franja geométrica suspendida sobre el borde.

## Corrección implementada

- Se retiraron **ambos objetos**: la fachada vertical independiente y la banda superior artificial. El mapa y su geometría jugable siguen siendo únicos.
- El propio `terrainGeometry` representa el acantilado mediante `mountainBaseHeightAt(x,z)`, la misma altura calculada para colisiones, pies y pendientes.
- Sin aumentar el conteo de columnas del terreno, los 321 renglones Z tienen una distribución **adaptativa**: 18 filas muestrean aproximadamente los dos metros alrededor del frente de roca. Esto impide que el desnivel quede representado por un único polígono plano.
- Los vértices auténticos de la pared reciben colores de roca gris cálido, vetas de frecuencia baja, musgo muy discreto y un relieve visual máximo de aproximadamente **0.055 unidades**. Las variaciones dependen de coordenadas físicas continuas, nunca de números de columna ni índice de estrato.
- Las repisas de roca con hierbas y pinos ahora calculan su anclaje exacto mediante `rockFaceZAtHeight()` y `summitFacePointAtHeight()`. No dependen de la antigua fachada desaparecida.
- Se reutilizan objetos `THREE.Color` durante el coloreado del terreno para reducir presión de memoria en móviles.

## Características conservadas

Pisos del mapa a altura 0, 10 y 18; accesos transitables 30°, 35° y 45°; casita, torre, lago, ríos, cascada y corriente; vegetación y árboles, NPC decorativos, colisiones, controles y la cámara AC / 3D con horizonte curvo. La nueva textura tridimensional es **únicamente visual** sobre superficies no transitables; las alturas físicas se conservan.

## Pruebas

Diez pruebas numéricas pasaron: orientación norte/sur de la malla adaptativa, orden de los renglones, densidad de muestras en la pared, anclaje de repisas en el frente principal y cumbre, funcionamiento de las pendientes de 30° y 35°, altura de la cumbre y bloqueo del frente rocoso. Además pasó el análisis de sintaxis JavaScript y se verificó que las antiguas funciones que construían la cortina y el borde ya no están presentes.

Aun así, **queda pendiente la inspección visual real en Android**. La desaparición de la malla superpuesta está comprobada en el código, pero el aspecto artístico y las sombras deben revisarse en el dispositivo.

## Copias históricas
- [v0.35.0 — paredes con cuadrícula/cortina](../archive/valle-cascada-v0.35.0/index.html)
- [v0.34.0 — paredes estratificadas originales](../archive/valle-cascada-v0.34.0/index.html)
