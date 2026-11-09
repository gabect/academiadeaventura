# Valle de la Cascada — Montaña orgánica y ecosistema v0.37.0

## Problema y solución
En v0.36.0 desapareció la falsa «cortina» rocosa, pero la montaña conservaba un frente prácticamente recto de oeste a este. Las líneas del pie y de la coronación eran paralelas, el perfil rocoso demasiado uniforme y la vegetación escasa en relación con la extensión del macizo.

**v0.37.0 modifica el heightfield real** mediante `mountainCliffLipZ(x)`, `mountainCliffUpperZ(x)`, `cliffWallElevationAt(x,z)` y `cliffCrackHeightAt(x,t)`. No crea otra pared superpuesta, no usa un tapiz o una cortina frente a las colisiones, ni toca la cámara de horizonte curvo.

### Geometría
- **Pie de monte independiente:** entrantes tipo bahía seca y salientes tipo promontorio, mediante siete lóbulos amplios y variaciones de baja frecuencia. El frente aparece entre aproximadamente Z=-20.8 y Z=-10.8, en vez de una línea Z=-16.
- **Coronación no paralela:** `mountainCliffUpperZ` tiene variación propia del grosor del paredón, entre 0.46 y 3.7 unidades de recorrido horizontal. Su contorno varía entre aproximadamente Z=-23.4 y Z=-13.3.
- **Ángulos por tramos:** cada sección de la pared tiene un quiebre de pendiente entre parte inferior y superior, con proporciones variables. Aparecen contrastes entre pared casi vertical y pared inclinada de roca sin ofrecer escaladas improvisadas.
- **Grietas excavadas:** siete fisuras sinuosas de poca profundidad (aproximadamente en X=-73, -58, -39, -6, 23, 46 y 68) afectan **el terreno verdadero** y reciben sombreado oscuro local.
- **Mayor precisión de malla:** 156 de las 320 franjas de resolución del eje Z cubren el sector amplio Z=-24 a -5 para evitar polígonos extensos cuando el frente se introduce o retrocede.
- **Exclusiones:** las entradas de 30° y 35°, la cascada cerca de X=34 y el campo de entrenamiento central mantienen el contorno y altura que requieren sus mecánicas anteriores. La ruta de la cumbre a 45° no se altera.

### Paleta
Los colores del terreno distinguen pradera verde fresca, pasto más oscuro, piedra gris cálida, roca sombreada, musgo y grietas. La textura visual no depende de filas/columnas de malla; no hay «cuadrícula» pintada.

## Vegetación y materiales
Se añadió una distribución determinista, agrupada por **pie, coronación y cumbre**, que se integra con la vegetación sobre las repisas de la pared:

| Elemento | Cantidad aproximada verificada |
|---|---:|
| Grupos de hierba alta/grama de diferentes alturas | 2,322 |
| Volúmenes de matorral (con agrupaciones de dos lóbulos) | 677 |
| Piedras de tamaños variados | 237 |
| Árboles añadidos de varios tamaños y especies de copa | 48 |
| Pinos antiguos en repisas | Conservados |

Los árboles nuevos presentan variantes de coníferas y frondosos de copa redondeada, desde ejemplares pequeños hasta más altos. Se utilizan `THREE.InstancedMesh` y geometrías reutilizadas para reducir el coste de dibujado móvil. Los troncos conservan un tono madera y las copas tienen verdes diversos.

### Colocación y colisiones
- `candidateMountainPlant()` selecciona únicamente puntos secos y con pendiente suave, reservando caminos, torre/casita, señales y zona del río.
- `mountainRouteBuffer()` mide la distancia real a las polilíneas de los senderos de 30°, 35° y 45°, no solo a una franja en X.
- Los nuevos árboles se agregan a `CLIFF_EDGE_TREE_SITES`, de modo que sus troncos tengan colisiones reales.
- La hierba, los arbustos decorativos y las piedras pequeñas no crean obstáculos invisibles; su malla está arraigada directamente al relieve.
- Las repisas se anclan al frente mediante `rockFaceZAtHeight()` y a la segunda cumbre mediante `summitFacePointAtHeight()`.

## Pruebas realizadas en código

- Controlador de movimiento: rutas de 30°, 35° y 45°, descenso por 30°, casita accesible; frente occidental, oriental y central bloqueados; subida lateral a cumbre bloqueada; río de la cumbre sin alteraciones.
- 549 muestras secas del frente natural fuera de las rutas: **ningún punto comprobado permite caminar cuesta arriba** (todas las pendientes superan 45°).
- Las rutas de entrada siguen cerca de 30° y 35°; la cumbre mantiene altura 18 y el origen de la cascada sigue en el río superior.
- Validación de distribución: cero arbustos, piedras o árboles nuevos dentro del agua, cero ejemplares nuevos sobre los senderos y cero árboles en pendientes inestables.
- Las muestras numéricas de repisas corresponden al terreno real; la sintaxis del JavaScript también fue verificada.

**Pendiente:** inspección de presentación y rendimiento real en Android/WebGL. Estas verificaciones de funciones no demuestran todavía cómo quedarán los perfiles, la densidad ni las sombras desde la cámara del jugador.

## Versiones históricas
- [v0.36.0 — acantilado integrado, pero demasiado recto](../archive/valle-cascada-v0.36.0/index.html)
- [v0.35.0 — antigua cuadrícula/cortina](../archive/valle-cascada-v0.35.0/index.html)
- [v0.31.1 — campo de pruebas original](../archive/campo-v0.31.1/index.html)

## Próxima observación visual
Recorrer el frente de oeste a este mirando cómo el pie del macizo se aproxima o se retira; distinguir el borde superior no paralelo, observar las grietas, los árboles grandes y pequeños y comprobar que las rutas permanecen perfectamente identificables sin volver a parecer una pared superpuesta.
