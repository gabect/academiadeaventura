# Academia Aventura — Valle de la Cascada (escenario principal v0.32.0)

## Principios
Este mapa es la nueva escena principal. **El antiguo Campo de pruebas v0.31.1 no se modifica ni se borra:** está archivado y jugable en [archive/campo-v0.31.1](../archive/campo-v0.31.1/index.html), junto a su `version.json` propio para impedir actualizaciones automáticas hacia el nuevo escenario. El mapa actual mantiene cámara aérea fija y controles Space=A, F=B, Caps Lock=C, WASD.

El norte es **Z negativo** y el este es **X positivo**. El relieve visible mide 166×166 unidades, con límite de navegación rectangular de ±78 unidades y una cordillera físicamente cerrada al norte de Z=-69.

## Concepto espacial

```text
                      NORTE / CORDILLERA INACCESIBLE
      cumbre alta        río que nace dentro de la cordillera
          /45°             ~ X=34 / Z=-79
   ┌───────────── VALLE SUPERIOR VERDE ──────────────────┐
   │                  casita sobre cuatro postes        │
   │  rampa a su porche    río alto caudaloso            │
   └─────────────────────────────────────────────────────┘
    ladera oeste → 60° → 50° → 30° → 35° → 90° / ⇣ / 90°
                        lajas/vereda       cascada
        vereda zigzag           campamento original     lago orgánico
            torre de piedra                        plataforma sobre agua
            escalera vertical                     escaleras de madera
    praderas, piedras, NPC y pendientes de prueba
         ← ← ← RÍO CAUDALOSO DEL SUR ← ← ←
```

## Coordenadas principales

| Elemento | Coordenadas | Notas |
|---|---|---|
| Cordillera de nacimiento | Z=-60 a -83 | Cresta abrupta y cerrada desde Z=-69 |
| Macizo principal | Toda la franja norte, frente en Z≈-16 | Un solo macizo con valle alto a 10 unidades |
| Cumbre oeste | X=-60, Z=-43 | Hasta 18 unidades de altura; pendiente radial de 45° hacia el valle |
| Bajada transitable con lajas | X≈-20 a -14, Z=-35 a -17 | Inclinación natural de 30° y vereda visible |
| Río de la cumbre | X≈30–34, Z=-79 a -18.2 | Profundo, con flujo 2.5–3.8 unidades/s |
| Cascada | X=34, frente Z=-15.72 | Cortina visible, rebosadero y espuma de impacto |
| Poza de impacto | X=34, Z=-12 | Más profunda, conectada al lago |
| Lago orgánico | X=38, Z=11 | Radio medio 20×26, hasta 5 unidades de profundidad, bordes irregulares |
| Río de salida | X≈41 a -76, Z≈34 a 68 | Meandros profundos; da forma al borde sur |
| Casita | X=-17 a -7, Z=-47 a -39 | Cuerpo cerrado, cuatro postes; porche a Y=11.4, rampa funcional |
| Torre de vigilancia | X=-58 a -48, Z=14 a 24 | Piedra, plataforma Y=9.15, escalera vertical en lado sur |
| Plataforma del lago | X=12 a 28, Z=18 a 26 | Deck de madera a Y=4.15; sobresale al agua, lado de salto abierto |
| Escaleras de la plataforma | X≈3.6 a 12, Z≈22 | 14 escalones de madera reales |
| Campamento/guardian legacy | Cerca de origen | Muro con escalera original, balcón de 4 escalones, misión de XP |
| Estación de rampas | X=-30 a -12, Z≈31 | Madera/piedra con ángulos 16°, 33°, 45° y 53° |
| NPCs decorativos | 8 repartidos entre valle, vereda, torre y lago | Estáticos y sin interacción compleja |

## Reglas físicas compartidas

- **Hasta 45°:** subida y bajada permitidas por el gradiente real de la superficie; velocidad menor cuesta arriba.
- **Sobre 45°:** bloqueada la caminata. El paredón de 89.4° representa la pared vertical de 90° pedida.
- **Excepciones:** escalones discretos de 0.30 unidades (piedra y madera), escaleras verticales interactivas y movimiento en agua tienen sus respectivos controladores.
- **Agua bajo caderas:** caminar sobre el fondo. **Por encima:** nadar. Los dos ríos tienen vectores de corriente que mueven al personaje incluso al soltar el joystick.
- **Arquitectura:** cabina cerrada sin acceso interior, postes y cubiertas sólidos; torre accesible mediante escalera vertical; plataforma sobre el lago accesible por escalones.
- **Cámara:** fija, tipo juego de diorama cenital inclinado. No gira con el jugador. Zoom y seguimiento permanecen.
- **Controles teclado:** WASD mover, Espacio=A/interactuar, F=B/salto corto o correr al mantener, Caps Lock=C/agacharse o arrastrarse al mantener. Los botones táctiles A/B/C se conservan.

## Pruebas de regresión para cambios futuros

1. Abrir el [mapa antiguo](../archive/campo-v0.31.1/index.html) y confirmar su funcionamiento sin redirecciones al mapa actual.
2. Desde el campo bajo caminar hacia la ruta de lajas, subir el tramo de 30° y recorrer la pradera del valle alto.
3. Subir y bajar la rampa de la casita hasta su porche; comprobar que la puerta y los muros no se atraviesan.
4. Intentar subir las laderas de 50°, 60° y paredones casi verticales; debe bloquearse.
5. Entrar en agua somera, nadar en la zona profunda y salir por la orilla. Probar corrientes del río sur y río alto.
6. Ver la cascada desde la orilla del lago y comprobar la poza de impacto profunda.
7. Llegar por la vereda a la torre suroeste. Espacio/A debe iniciar su escalera vertical; Caps Lock/C debe permitir la salida segura.
8. Ascender los 14 escalones de madera a la plataforma sobre el lago; el borde abierto queda destinado a una futura mecánica de salto.
9. Comprobar que los NPC estáticos están asentados sobre el terreno y sus cuerpos no son atravesables.
10. Verificar cámara fija y zoom en Android, incluido el rendimiento con vegetación instanciada y superficies de agua.
11. Verificar las rampas legacy de 16°, 33°, 45° y 53°, y el muro con escalera del campamento.

## Alcance actual / pendientes

La cascada tiene geometría y agua visible con espuma y una poza excavada, pero **no** introduce todavía la mecánica de dejarse caer y sobrevivir a una caída libre desde su borde. La plataforma del lago prepara el salto desde altura: la física de salto largo y las caídas se implementarán por separado. Los NPC no hablan ni patrullan por ahora. Tampoco se puede entrar al interior de la casita. Estas limitaciones son deliberadas y evitan fingir mecánicas aún no creadas.

Las comprobaciones internas se basan en sintaxis y simulaciones numéricas extraídas del controlador; **la inspección visual y prueba real en Android siguen siendo necesarias**.
