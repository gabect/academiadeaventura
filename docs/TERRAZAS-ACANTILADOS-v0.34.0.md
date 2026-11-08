# Valle de la Cascada — acantilados y niveles de altura v0.34.0

## Propósito

Rediseño **implementado en el mapa principal** para hacer inequívoca la diferencia visual entre campo bajo, montaña, valle alto y cumbre occidental. Inspiración en la lectura del terreno de *Link's Awakening* (Switch), *A Link to the Past* y *Animal Crossing*: los grandes cambios de nivel tienen paredes rocosas reconocibles y **solo hay pasos de subida señalizados**.

La cámara de horizonte curvo v0.33.0 y los controles (WASD, Espacio=A, F=B, CapsLock=C) permanecen iguales.

## Tres pisos físicos reales

| Piso | Y aprox. del terreno (sin contar cumbres menores) | Acceso |
|---|---:|---|
| Nivel 0 — campo bajo | -0.05 | Zona de entrada, torre, lago, río sur, rampas de entrenamiento |
| Nivel 1 — valle verde elevado | 9.95 | Laderas señalizadas 30° y 35° |
| Nivel 2 — cumbre occidental | 17.95 | Sendero delimitado de 45° desde el valle alto |

Las alturas están calculadas por **una única función de terreno** `mountainBaseHeightAt(x,z)`. La geometría, el suelo para IK/colisiones y las rutas usan los mismos datos. No hay teletransportes ni falsos niveles sobre una superficie física diferente.

### Primera pared

A lo largo del frente norte alrededor de Z≈-16, una subida de 10 unidades se concentra en solo 0.46 unidades horizontales. Fuera de los pasos abiertos, la pendiente real se acerca a 88° y supera ampliamente la capacidad de caminar de 45°.

Un revestimiento de piedra con seis estratos de color, caras nítidas y una línea calcárea superior distingue la pared del verde de la meseta. Se renderiza en geometría optimizada en un solo mesh, con aberturas físicas/visuales en las dos rutas y la cascada.

### Pasos definidos hacia el valle

- **30° — Vereda de lajas:** abertura amplia alrededor de X=-17.5, subida hasta el valle cerca de Z=-34; conserva y acentúa el sendero original a la torre.
- **35° — Cuesta oriental:** abertura alrededor de X=12.6, sendero de piedra/tierra desde Z≈-12 hasta Z≈-32.
- **Resto del frente:** pared rocosa físicamente intransitable por caminata; no existen atajos diagonales por la ladera.

Ambas entradas están señalizadas con un poste y un rótulo 3D integrado en el mundo.

### Segunda pared y cumbre occidental

La antigua elevación difusa ahora es una **meseta verde distinta**, centrada en X=-61, Z=-43, radio aproximado 12×10 unidades, 8 unidades por encima del valle. La circunda una segunda fachada rocosa, con una **única abertura en el este**. La ruta desde X=-41 hasta X=-49, cerca de Z=-43, asciende a **45° exactos** hasta el nivel 2. La corona de rocas de la cumbre sigue visible a distancia.

## Conservación de contenido

Se mantienen el río superior, la cascada y poza de impacto, lago orgánico, río sur/corrientes y natación; casita sobre cuatro postes y rampa; torre suroeste con escalera vertical, pasarela de madera del lago, NPC decorativos, árboles, guardian/XP y estaciones de rampas de prueba. Los modos de cámara AC (curvado) y 3D (anterior) continúan disponibles; no se tocaron sus parámetros.

El escenario original antes de este rediseño está archivado en [Valle v0.33.0 — antes de paredes y terrazas](../archive/valle-cascada-v0.33.0/index.html), con su propio `version.json` inmóvil. También se mantienen las copias históricas v0.32.0 y v0.31.1.

## Pruebas de regresión verificadas

El controlador de movimiento se extrajo del código y se ejecutaron 14 pruebas funcionales:

- Entrar por los pasos de 30° y 35° desde el campo y alcanzar altura 10.
- Subir y bajar por la ruta de 45° hasta la meseta occidental a altura 18.
- Bloquear frente rocoso por el oeste, el centro y el este, y bloquear la segunda pared por un lado sin paso.
- Descender de regreso por los pasos disponibles.
- Llegar al porche de la casita sin perder su colisión.
- Comprobar agua profunda en río superior y lago, corriente sur y escalera vertical en la torre.

También pasó la revisión de sintaxis del módulo JavaScript. **Falta una revisión de renderizado y rendimiento WebGL en el teléfono**. Los tests numéricos no certifican que las sombras, líneas de roca o etiquetas se vean perfectas en Android.

## Ajustes visuales

- `MOUNTAIN_LEVELS` — altitudes de los tres niveles.
- `PRIMARY_PASS`, `EASTERN_PASS` — ubicación y anchura de los accesos.
- `SUMMIT_PASS`, `SUMMIT_MESA` — escalada a la segunda terraza.
- `buildLayeredCliffFaces()` — piedra estratificada, huecos para caminos y cascada.
- `buildLayeredCliffRims()` — líneas claras de delimitación de la pared.
- `MOUNTAIN_PATH`, `EASTERN_MOUNTAIN_TRAIL`, `SUMMIT_ASCENT_TRAIL` — veredas reales.
- `placeMountainSign()` — rótulos de subida.

El diseño anterior de laderas extendidas de 60°/50° sigue disponible en la versión archivada v0.33.0; el mapa principal actual favorece paredes abruptas y rutas explícitas para facilitar la navegación.
