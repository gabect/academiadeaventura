# Acantilados naturales — v0.35.0

## Objetivo visual
Transformar las paredes escalonadas de la montaña en un entorno más orgánico sin volver ambiguos los tres pisos (campo, valle y cumbre). **La roca sigue predominando** en las paredes; vegetación más abundante en pie y crestas, y reducida sobre repisas reales. Los pasos de 30°, 35° y 45° permanecen libres.

## Elementos añadidos
- 390 matas de hierba alta (mallas de cinco hojas por mata) distribuida en pie, repisas y crestas.
- 47 salientes rocosos con hierba arraigada y 5 pequeños pinos apoyados en ellos.
- 20 piedras mayores en la base, añadidas a las colisiones.
- 18 árboles nuevos en terrenos con poca pendiente del pie y la meseta, añadidos a colisiones.
- Variaciones sutiles de musgo en los seis estratos de piedra, conservando contraste entre roca y césped.

Todos los elementos usan una semilla determinista, por lo que el mapa conserva exactamente la misma decoración entre sesiones.

Las hierbas y piedras repetidas utilizan `THREE.InstancedMesh` para limitar las llamadas de dibujo en Android y Chromebooks. Se construyen **antes** de la inyección de curvatura del mundo, así que quedan integradas en la cámara AC/3D.

## Reglas
- `cliffRouteClear(x,margin)` excluye los corredores físicos de 30°/35°, la cascada y una banda de seguridad adicional.
- Los pinos en las paredes solo se generan si existe un saliente rocoso bajo la raíz.
- Las matas y rocas de la base se descartan donde `waterAt(x,z)` indica agua.
- Los árboles nuevos se colocan solo en suelo de inclinación inferior a `0.4` y fuera del agua.
- Los árboles altos y las piedras grandes se integran en las listas `obstacles` y `fallObstacleList`; las hierbas, hojas y pequeñas repisas son detalle visual y no modifican el suelo físico.
- `mountainBaseHeightAt`, `canTraverseStep`, la cámara, la natación y los controles no se modifican.

## Pruebas de código
- Verificada sintaxis del módulo y presencia de los tres pasos.
- Simulada distribución: 390 hierbas, 47 repisas, 20 boulders, 5 pinos menores y 18 árboles de borde.
- Cero matas por debajo del nivel del agua; cero piedras grandes sumergidas; cero repisas en el margen de las rutas.
- La versión previa se conserva **jugable** en [v0.34.0](../archive/valle-cascada-v0.34.0/index.html) con su manifiesto independiente.

## Inspección pendiente en Android
Comprobar que la vegetación se lee como agrupaciones naturales, no filas repetidas; que los pies y las copas no flotan respecto a sus repisas; y que el rendimiento sigue estable con la curvatura activada. Si resulta muy denso, reducir el paso de muestreo o la tasa de salientes sin cambiar el relieve.
