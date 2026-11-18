# En Camino Logística · Laboratorio

Página de una sola pieza (`index.html`) con laboratorios de logística en 3D, uno por reel,
bilingüe (ES/EN), pensada para abrirse desde reels de Instagram en el celular.

- `index.html` — la página completa, lista para GitHub Pages.
- `src/` — el código fuente por partes; `node src/build.js` vuelve a armar `index.html`.
- `tests/` — pruebas automáticas con Playwright (`node tests/verify.js`). El barrido completo de la fila (reel 6) va aparte: `node tests/sweep_fila.js` (unos minutos).
- `tests/quedatelo.js` — reel 7: números, barrido y enlaces (`QPUB` en `src/game.js` publica u oculta el laboratorio).
- `tests/ordenar.js` — reel 12: ordenar antes de cargar (Knuth por parada), números contra el reel, Monte Carlo, barrido y enlaces (`OPUB` en `src/game.js` publica u oculta el laboratorio).
- `tests/co2.js` — reel 13: el CO2 de la entrega fallida (solo el furgón), números contra el reel y contra el Monte Carlo, barrido y enlaces (`XPUB` en `src/game.js` publica u oculta el laboratorio).
- `tests/locker.js` — reel 14: ¿cuándo conviene el locker? (Hovi y Bø 2024): 63 y 132 paquetes por turno con la tabla 3.3, 5,63–5,64 y 2,76 € por paquete, distancias, ruta mixta, casos tontos, barrido, enlaces y 390/1280 px (`LPUB` en `src/game.js` publica u oculta el laboratorio).
- `tests/aire.js` — reel 17: pagas por el aire (peso volumétrico), cifras del reel, todas las posiciones de los controles, entradas inválidas, barrido, enlaces y biblioteca (`APUB` en `src/game.js` publica u oculta el laboratorio).
- `capturas/` — capturas de pantalla que dejan las pruebas.

Enlaces profundos por número de reel: `?reel=1` giros UPS, `?reel=2` pasillo de Amazon, `?reel=3` entregas IKEA, `?reel=4` andenes, `?reel=5` nivel de servicio, `?reel=6` fila, `?reel=7` quédatelo;
`?caso=<id>` también funciona.
