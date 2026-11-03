# En Camino Logística · Laboratorio

Página de una sola pieza (`index.html`) con laboratorios de logística en 3D, uno por reel,
bilingüe (ES/EN), pensada para abrirse desde reels de Instagram en el celular.

- `index.html` — la página completa, lista para GitHub Pages.
- `src/` — el código fuente por partes; `node src/build.js` vuelve a armar `index.html`.
- `tests/` — pruebas automáticas con Playwright (`node tests/verify.js`). El barrido completo de la fila (reel 6) va aparte: `node tests/sweep_fila.js` (unos minutos).
- `capturas/` — capturas de pantalla que dejan las pruebas.

Enlaces profundos por número de reel: `?reel=1` giros UPS, `?reel=2` pasillo de Amazon, `?reel=3` entregas IKEA, `?reel=4` andenes, `?reel=5` nivel de servicio;
`?caso=<id>` también funciona.
