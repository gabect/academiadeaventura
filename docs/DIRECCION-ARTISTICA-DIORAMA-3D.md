# Academia de Aventura — Biblia visual del diorama

**Canon aprobado el 11 de noviembre de 2026.**

## Dos lenguajes artísticos deliberadamente diferentes

**Mundo:** un escenario de cartón construido a mano. Todo el terreno, montañas, árboles, plantas, caminos, orillas, agua y edificios se representan mediante papel, cartón pintado, cera, tinta, cortes imperfectos y materiales escolares. Esta apariencia no debe convertirse en un paisaje 3D fotorrealista. Mantener ubicaciones, medidas y jugabilidad del mapa original.

**Personajes:** el protagonista, el guardián y los NPC son habitantes tridimensionales **volumétricos** de ese mundo. Tienen materiales de piel, cabello, tejidos, cuero y calzado, modelados en 3D y sujetos al esqueleto de animación. **Nunca** convertirlos en figuras de cartón, recortes orientados a cámara o sprites.

## Referencia del protagonista

Las seis imágenes de referencia proporcionadas por el propietario del proyecto el 11 de noviembre de 2026 muestran al mismo niño aventurero desde frente, espalda, laterales, arriba y abajo. Características que deben mantenerse:

- Rostro redondeado y expresivo, ojos marrones grandes, cejas pobladas, pecas, cabello castaño en mechones.
- Gorro marrón holgado de tela con pliegues.
- Túnica oliva de tejido rugoso, dobladillos irregulares, costuras y parche en manga.
- Cordón a la cintura, bolso de cuero cruzado, pantalones bombachos oscuros.
- Vendas claras en las piernas y botas marrones con cordones.
- Proporciones infantiles estilizadas y materiales con volumen, no figuras planas.

El acabado final deseado es de **película animada 3D** y debe contrastar intencionalmente con la escenografía de cartón. Las imágenes originales son referencias, no modelos, topologías, esqueleto, mapas PBR ni archivos GLB.

## Integración técnica actual

- Motor: Three.js v0.170.0, diorama del mapa original.
- El código del protagonista y de los ocho NPC se integra con el esqueleto de locomoción, IK, cámara, colisiones, interacciones y natación existentes.
- Módulo visual: `diorama/stylized-characters.mjs`.
- Revisión interactiva desde todos los ángulos: `diorama/personaje-3d.html`.
- Pruebas: `tests/diorama-stylized-characters.mjs`, `tests/diorama-stylized-browser.mjs`, workflow `diorama-3d-cast.yml`.

**Límite de calidad:** los personajes generados proceduralmente son prototipos 3D jugables, no una reconstrucción idéntica y esculpida de las referencias. Para una equivalencia cinematográfica, se requiere una malla 3D de autor (GLB/glTF), UVs, texturas PBR, rigging, weighting y animaciones probadas. Sustituir la malla debe conservar el contrato de articulaciones y la física del juego.

## Regla de revisión

Validar en navegador de escritorio y móvil, comprobar los seis ángulos y las ocho direcciones de movimiento, revisar que gorro, mangas, pies y bolso sigan a las articulaciones y descartar intersecciones visibles con escenario y accesorios. No declarar despliegue verificado sin resultados de CI y GitHub Pages.
