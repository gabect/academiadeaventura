# Academia Aventura — Roca de montaña y cámara trasera v0.39.0

## Objetivo
Mejorar la lectura de las paredes rocosas que aún parecían una superficie lisa de color oliva y estabilizar la perspectiva de tercera persona detrás del avatar, sin sustituir los controles clásicos de PC. Se mantiene la vista principal centrada; el modo cercano **sobre el hombro** se reserva como posible experimento independiente.

## Material de roca integrado en la propia montaña
Las paredes del mapa son la geometría auténtica `terrainGeometry`, esculpida por `mountainBaseHeightAt(x,z)`. No se crea ninguna pared o textura plana en una segunda malla delante del acantilado.

- **Textura de roca generada localmente:** `createRockSurfaceTexture()` produce al inicio una textura de 256×256 píxeles con ruido periódico de varias escalas, fracturas, manchas minerales y estratos suaves. No depende de archivos externos.
- **Mapeo triplanar en espacio mundial:** el material `terrainMaterial` utiliza `onBeforeCompile` para proyectar ese patrón sobre las caras reales según su orientación, independientemente de las coordenadas UV del gran plano del terreno.
- **Transición piedra/pradera:** el detalle más marcado aparece en las superficies pronunciadas; las superficies horizontales conservan su verde. Las grietas reales y la vegetación sobre repisas siguen visibles.
- **Relieve físico visual:** la malla original recibe una variación pequeña en la propia cara rocosa (aprox. 0.1 unidades), con amplitud que desaparece en el pie y en la coronación. No afecta el cálculo analítico de colisiones ni modifica las rutas.
- **Rendimiento:** una sola textura compartida con mipmaps, dos muestras principales para orientación de cara y una muestra de detalle secundario por fragmento; no se duplican paredes. Se preserva el shader de curvatura AC y se distinguen las variantes de programas WebGL para evitar mezclas de materiales.

## Cámara trasera de tercera persona
- Distancia base de seguimiento: **6.3 unidades** (antes 7.8).
- Ángulo inicial de elevación: **0.36 radianes** (~20.6°), con el mismo control libre mediante mouse y flechas. El punto de mirada queda más alto, cerca del pecho/cabeza.
- Al mover el mouse, la orientación del avatar sigue suavemente la dirección horizontal de cámara: la cámara no queda permanentemente mirando al costado de un personaje que sigue caminando.
- **A/D son desplazamientos laterales reales**; W avanza y S retrocede respecto a la vista. Al girar estando quieto, el avatar acompaña gradualmente la orientación de cámara.
- La escalera vertical sigue la coreografía dedicada del avatar; mientras se escala, la cámara acompaña desde atrás cuando no se está manipulando manualmente.
- La colocación IK de los pies ahora considera movimiento lateral y marcha atrás, en lugar de animar exclusivamente pasos hacia delante.
- Clic para capturar mouse, Esc para liberar, botón derecho para arrastrar, flechas y gestos táctiles siguen disponibles. Espacio=B, Caps Lock=A, Alt izquierdo=C sin cambios.

## Pruebas ejecutadas
- Sintaxis JavaScript del módulo: válida.
- Textura creada: 65,536 texeles y 203 tonalidades distintas observadas, no un color sólido.
- Prueba de inyección del shader: materiales de roca y horizonte curvo se componen correctamente en la fuente; programas WebGL de roca y materiales genéricos poseen claves de caché distintas.
- Verificación geométrica: vereda principal 30°, alternativa 35°, pared no transitable de aproximadamente 83.6°, cumbre a altura 18 y río alto preservados.
- Comprobación de controles de movimiento para cuatro orientaciones: W/S avanzan-retroceden y A/D se desplazan lateralmente correctamente.

**Pendiente:** no se ha realizado una inspección WebGL gráfica automatizada en Chrome/Android desde la sesión. La prueba visual real debe evaluar la fuerza del patrón rocoso, posibles artefactos de shader, suavidad de cámara y la animación lateral de los pies.

## Comparación histórica
[Escenario v0.38.0 antes de estos cambios](../archive/valle-cascada-v0.38.0/index.html) preservado intacto junto a su manifiesto original. Se conservan también las versiones previas de montaña y cámara fija.
