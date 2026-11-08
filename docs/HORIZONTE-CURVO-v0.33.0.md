# Horizonte Curvo — v0.33.0

Esta versión añade una **cámara fija con efecto rolling-log / drum horizon** al mapa `Valle de la Cascada`.

## Referencia e intención

Se utiliza la técnica de curvatura visual por **desplazamiento de vértices en el shader** (parábola en el eje Z del mundo) característica de una interpretación del efecto de Animal Crossing. Los objetos y la geometría sólo se curvan para su presentación; las coordenadas de navegación, la topografía física y las colisiones conservan el mapa original.

Bibliografía técnica:
- https://github.com/skylarbeaty/curved-world
- https://wuffs.org/projects/acnh
- https://notslot.com/tutorials/2020/04/world-bending-effect

## Comportamiento de cámara

- Norte arriba de la pantalla: `cameraHeading = Math.PI` sin giro manual.
- Cámara rolling predeterminada: `CAMERA_PITCH_ROLLING = .64` radianes, unos 36.7° sobre el plano horizontal.
- Cámara clásica alternativa: `CAMERA_PITCH_DIORAMA = 1.16` radianes, unos 66.5° de elevación.
- La cámara sigue al personaje con `18.0 / cameraZoom` unidades de distancia base.
- El objetivo visual se desplaza `-3.2` unidades al norte en modo rolling, revelando el paisaje que se aproxima.
- Un botón **AC / 3D** junto a los controles de zoom cambia entre ambos modos, con transición suave. Los botones `+`, `−` y deshacer zoom permanecen.
- Cielo celeste en gradiente y nubes estilizadas de bajo coste que se muestran sobre el horizonte.

## Curvatura de shader

En `index.html`, buscar `CURVED_HORIZON`:

```js
const CURVED_HORIZON = {
  focus: { value: new THREE.Vector2(0, 5) },
  amount: { value: 0.0135 },
  near: { value: 4.5 }
};
```

En espacio del mundo:
```
forwardDistance = max(0, avatarZ - vertexWorldZ - 4.5)
vertexWorldY   = originalY - 0.0135 * forwardDistance²
```

La curvatura solo afecta a la zona alejada **delante del jugador hacia el norte**, no a los pies, las manos, el suelo inmediato ni a las plataformas que pisa. Este campo se interpola a cero al seleccionar la vista `3D`.

Se hace una única inyección `onBeforeCompile` en los materiales Three.js del escenario y se actualizan los mismos tres uniformes para todo el mundo. Se incluyen las geometrías de terreno, la superficie acuática, árboles, rampas, casas, torre, piedras y objetos instanciados. El material de profundidad para sombras utiliza la misma fórmula; el cielo tiene un material separado que **no se curva**.

## Legibilidad del paisaje

- El pie de la montaña se distingue con una franja rocosa clara, sin añadir obstáculos de colisión.
- El comienzo del valle elevado se marca con otro borde tonal.
- La **cumbre occidental** tiene cuatro piedras altas características que se perfilan conforme el jugador se aproxima desde el oeste.
- El indicador de región de la interfaz muestra `Cumbre occidental` cuando corresponde.

## Preservación y regresiones

- [Mapa histórico anterior v0.31.1](../archive/campo-v0.31.1/index.html) sigue jugable.
- [Valle de la Cascada sin curvatura v0.32.0](../archive/valle-cascada-v0.32.0/index.html) queda congelado como comparación directa.
- El modo `3D` del nuevo mapa vuelve a la misma inclinación anterior y desactiva la deformación sin cambiar escena ni controles.
- Las reglas de pendiente de 45°, física del río y nado, accesos a rampas/torre, NPCs, guardado y controles Space/F/Caps Lock permanecen intactas.

## Pruebas recomendadas

1. En vista AC, caminar al norte desde el campamento y comprobar que montaña y valle aparecen gradualmente en el horizonte, con cielo visible sobre el paisaje.
2. Avanzar hacia la ladera de 30° y observar que se reconoce el comienzo de la subida antes de pisarla.
3. Ir al oeste hacia la cumbre y comprobar que emergen los cuatro pináculos de piedra.
4. Alternar AC/3D sin cambiar la posición del personaje, comprobar que los árboles no levitan y el suelo inmediato permanece bajo los pies.
5. Caminar por las rampas de 16°, 33°, 45° y comprobar bloqueo de 53°.
6. Subir y bajar la torre y la rampa de la casita. En ambos modos el avatar no debe atravesar postes, paredes ni escaleras.
7. Nadar en el lago y comprobar espuma/cascada, corrientes y orillas.
8. Verificar rendimiento real en teléfono Android, tablet y Chromebook. Los cambios de shader se verifican con comprobaciones de fuente e inyección, pero **no equivalen a una inspección visual de GPU**.

## Ajustes futuros

Si el paisaje desaparece demasiado pronto, reducir `CURVED_HORIZON.amount` desde `0.0135` a `0.010`. Si se ve plano, aumentar con moderación hasta `0.016`. No modificar los datos físicos del terreno para conseguir un efecto visual.
