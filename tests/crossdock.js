// Reel 21 · Una sola compra, tres furgones (crossdock): el recorrido crece con la raíz de las paradas, no con las paradas.
// Cifras del encargo R021: 1 − 1/√3 = 42,3 % (cálculo propio), Londres 33 → 13 furgones (McLeod y otros 2020), 100 USD por ruta (EJEMPLO) → 2.000 USD al día.
// Prueba: bandera sin publicar (DPUB=false: no sale en la portada, ni en «Cambiar de reel», ni en la biblioteca; el enlace directo funciona),
// el modelo (rutas de verdad con vecino más cercano + 2-opt), barrido de TODAS las combinaciones de controles, entradas inválidas, la apuesta
// antes de revelar, corrida en el teléfono (390 px) y en escritorio con capturas, «Por qué pasa» y la versión publicada (forzando DPUB=true).
// Uso: node tests/crossdock.js   (PW=<ruta al paquete playwright> si no está instalado como módulo)
const {chromium}=require(process.env.PW||"playwright");const serve=require("./serve.js"),env=require("./env.js");
const checks=[];const ok=(n,c,g)=>{checks.push(!!c);console.log((c?"PASS ":"FAIL ")+n+(g!==undefined?"  → "+JSON.stringify(g):""))};
const fs=require("fs"),path=require("path");const CAP=path.join(__dirname,"..","capturas");if(!fs.existsSync(CAP))fs.mkdirSync(CAP);
/* errores de consola: se cuentan todos, menos las fuentes de Google, que env.js corta a propósito cuando no hay copia local (FONTS_DIR) */
const vigila=p=>{const e=[];const fuente=u=>/fonts\.(googleapis|gstatic)\.com/.test(u);p.on("pageerror",x=>e.push("página: "+x.message));
 p.on("requestfailed",q=>{if(!fuente(q.url()))e.push("recurso: "+q.url())});p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource/.test(m.text()))e.push("consola: "+m.text())});return e};
(async()=>{const srv=await serve(8821);const b=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const VIEW={viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,locale:"es-CL"};const DESK={viewport:{width:1280,height:800},locale:"es-CL"};const U="http://127.0.0.1:8821/index.html";
 const HTML=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
 const DPUB_RAMA=/const DPUB=true;/.test(HTML),DEST=(HTML.match(/const DESTACADO="([a-z]+)";/)||[])[1];
 ok(`Bandera en el index.html de la rama: DPUB=${DPUB_RAMA}, REELNUM crossdock:21, PUBLICADO crossdock:DPUB, DESTACADO="${DEST}"`,/const DPUB=(true|false);/.test(HTML)&&/fedex:20,crossdock:21\}/.test(HTML)&&/fedex:FPUB,crossdock:DPUB\}/.test(HTML));
 if(!DPUB_RAMA)ok("Sin publicar en la rama: DPUB=false y no destacado (DESTACADO sigue en \"fedex\")",DEST==="fedex",DEST);

 /* 1 · sin publicar (DPUB=false, forzado si la rama ya la encendió) */
 {const ctx=await b.newContext(VIEW);await ctx.route("**/index.html*",async r=>{const x=await r.fetch();await r.fulfill({response:x,body:(await x.text()).replace("const DPUB=true;","const DPUB=false;").replace('const DESTACADO="crossdock";','const DESTACADO="fedex";')})});const p=await ctx.newPage();await env(p);const errs=vigila(p);
  await p.goto(U);await p.waitForTimeout(2500);const home=await p.evaluate(()=>document.body.innerText);
  await p.goto(U+"?reel=21");await p.waitForTimeout(2000);const h21=await p.evaluate(()=>location.hash);
  await p.evaluate(()=>{location.hash="biblioteca"});await p.waitForTimeout(900);
  const bib=await p.evaluate(()=>["bhh1959","daganzo1984","mcleod2020","encamino_r021"].some(id=>!!document.querySelector(`#v-biblioteca [data-book="${id}"]`)));
  const ti=await p.textContent("#libintro");
  ok("Sin publicar: la biblioteca sigue en 52 fuentes de diecisiete reels (como en main)",/Cincuenta y dos fuentes de diecisiete reels/.test(ti),ti.slice(0,48));
  ok("Sin publicar: no sale en la portada, ?reel=21 no lo abre y sus 4 fuentes no salen en la biblioteca",!/Una sola compra|crossdock/i.test(home)&&h21!=="#crossdock"&&!bib,{h21,bib});
  const lista=await p.evaluate(()=>ECAPP.dev.libSections().some(s=>s.labs.includes("crossdock")));ok("Sin publicar: ninguna sección de la biblioteca es del crossdock",!lista);
  await p.goto(U+"?caso=crossdock");await p.waitForSelector("#play");await p.waitForTimeout(1200);
  ok("Sin publicar, el enlace directo ?caso=crossdock abre el laboratorio",await p.evaluate(()=>location.hash)==="#crossdock");
  await p.evaluate(()=>ECAPP.openSheet("crossdock","reels"));await p.waitForTimeout(600);
  ok("Sin publicar: no aparece en «Cambiar de reel»",!(await p.evaluate(()=>[...document.querySelectorAll("#sheet-body .mrow")].some(e=>/Una sola compra/.test(e.textContent)))));
  ok("Sin publicar: el título no muestra «Reel #21»",!/Reel #21/.test(await p.textContent("#reels")));
  ok("Sin errores de página ni de consola (sin publicar)",errs.length===0,errs.slice(0,3));await ctx.close()}

 /* 2 · el modelo y las cifras */
 const ctx=await b.newContext(VIEW);const p=await ctx.newPage();await env(p);const errs=vigila(p);
 await p.goto(U+"?caso=crossdock");await p.waitForSelector("#play");await p.waitForTimeout(1500);
 const R=await p.evaluate(()=>{const d=ECAPP.LAB.crossdock.def,r=EC.crossdock(d);return{def:d,red:r.red,form:r.form,kmA:r.kmA,kmC:r.kmC,n:r.n,ahorro:r.ahorro,menos:r.menos,E:r.E,
  form3:EC.crossdock({k:3,m:6}).form,lon:EC.crossdock({k:3,m:6,A:33,D:13,usd:100}).ahorro,ppA:r.ppA,ppC:r.ppC}});
 ok("Valores por defecto: 3 orígenes, 6 paradas por origen, barrio (semilla) 20, 33 → 13 furgones, 100 USD por ruta y sin apuesta",R.def.k===3&&R.def.m===6&&R.def.seed===20&&R.def.A===33&&R.def.D===13&&R.def.usd===100&&R.def.pol==="",R.def);
 ok(`Con la semilla fija y 3 × 6 paradas, la reducción medida queda entre 30 % y 50 %: ${(R.red*100).toFixed(1)} %`,R.red>0.30&&R.red<0.50,R.red);
 ok("Con 3 orígenes la fórmula 1 − 1/√3 marca 42,3 %",Math.abs(R.form3-(1-1/Math.sqrt(3)))<1e-12&&(R.form3*100).toFixed(1)==="42.3",R.form3);
 ok("Londres: (33 − 13) × 100 USD = 2.000 USD al día",R.lon===2000&&R.ahorro===2000&&R.menos===20&&R.E.ahorro===2000,R.lon);
 ok("Km por parada = km ÷ 18 paradas, y la reducción por parada = 1 − km juntos ÷ km por separado",R.n===18&&Math.abs(R.ppA-R.kmA/18)<1e-12&&Math.abs(R.ppC-R.kmC/18)<1e-12&&Math.abs(R.red-(1-R.kmC/R.kmA))<1e-12);
 /* rutas de verdad: cada ruta pasa una vez por cada parada, el largo es el de sus tramos y 2-opt no deja tramos que mejoren al descruzarse */
 const RT=await p.evaluate(()=>{const bad=[];const D=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
  const revisa=(q,o,km,et)=>{if(o.length!==q.length||new Set(o).size!==q.length||o.some(i=>!(i>=0&&i<q.length)))bad.push(["no es una vuelta por todas",et]);let s=0;for(let i=0;i<o.length;i++)s+=D(q[o[i]],q[o[(i+1)%o.length]]);if(Math.abs(s*EC.CD.LADO-km)>1e-9)bad.push(["largo",et,s*2,km]);
   const n=o.length;for(let i=0;i<n-1;i++)for(let k=i+2;k<n;k++){const a=o[i],b=o[i+1],c=o[k],d=o[(k+1)%n];if(a===d)continue;if(D(q[a],q[b])+D(q[c],q[d])>D(q[a],q[c])+D(q[b],q[d])+1e-9)bad.push(["2-opt pendiente",et,i,k])}};
  for(const k of [1,2,3,4,5])for(const m of [5,6,17,40])for(const seed of [0,7,20]){const r=EC.crossdock({k,m,seed});r.rutas.forEach((x,i)=>revisa(x.q,x.o,x.km,{k,m,seed,i}));revisa(r.junta.q,r.junta.o,r.junta.km,{k,m,seed,j:1});
   if(r.junta.q.length!==k*m||r.rutas.length!==k||r.rutas.some(x=>x.q.length!==m))bad.push(["paradas",{k,m,seed}])}
  /* la misma semilla da las mismas paradas; sumar un origen o paradas no mueve las que ya estaban */
  const a=EC.crossdock({k:3,m:6,seed:20}),b=EC.crossdock({k:3,m:6,seed:20}),c=EC.crossdock({k:4,m:6,seed:20}),d=EC.cdPts(0,10,20).slice(0,6);
  if(JSON.stringify(a.junta.q)!==JSON.stringify(b.junta.q)||JSON.stringify(a.rutas[0].q)!==JSON.stringify(c.rutas[0].q)||JSON.stringify(d)!==JSON.stringify(EC.cdPts(0,6,20)))bad.push(["semilla no repetible"]);
  if(JSON.stringify(EC.crossdock({k:3,m:6,seed:5}).junta.q)===JSON.stringify(a.junta.q))bad.push(["otra semilla, mismas paradas"]);return bad});
 ok("Rutas de verdad (60 configuraciones): cada ruta pasa una vez por cada parada, el largo es la suma de sus tramos, 2-opt no deja tramos por descruzar; la semilla repite las mismas paradas",RT.length===0,RT.slice(0,4));
 /* las 21 semillas con 3 × 6: el rango que se informa en «Cuándo NO aplica» y por qué la 20 es la del ejemplo */
 const SE=await p.evaluate(()=>{const v=[];for(let s=0;s<=20;s++)v.push(EC.crossdock({k:3,m:6,seed:s}).red*100);const prom=v.reduce((a,b)=>a+b)/v.length;let mej=0;v.forEach((x,i)=>{if(Math.abs(x-prom)<Math.abs(v[mej]-prom))mej=i});return{min:Math.min(...v),max:Math.max(...v),prom,mej,v20:v[20]}});
 ok(`Las 21 semillas con 3 × 6: de ${SE.min.toFixed(1)} % a ${SE.max.toFixed(1)} %, promedio ${SE.prom.toFixed(1)} %; la 20 (${SE.v20.toFixed(1)} %) es la más cercana al promedio, como dice «Cuándo NO aplica»`,SE.mej===20&&SE.min.toFixed(1)==="38.2"&&SE.max.toFixed(1)==="51.6"&&SE.prom.toFixed(1)==="44.8"&&SE.v20.toFixed(1)==="44.7",SE);

 /* 3 · barrido de TODAS las combinaciones de orígenes (1–5), paradas (5–40), barrios (0–20) y apuestas, en ES y EN */
 const sw=await p.evaluate(()=>{const bad=[];let n=0,nt=0,mayor=0;const G=ECAPP.LAB.crossdock.game,L=ECAPP.LAB.crossdock;const RX=/NaN|undefined|Infinity|∞|−-|--|\[object|null/;
  for(const lg of ["es","en"]){document.getElementById("lang-"+lg).click();
   for(let k=1;k<=5;k++)for(let m=5;m<=40;m++)for(let seed=0;seed<=20;seed++){const st={k,m,seed,A:33,D:13,usd:100,pol:["","10","25","42","60"][(k+m+seed)%5]};const r=EC.crossdock(st);n++;
    if(!(r.kmA>0&&r.kmC>0&&isFinite(r.red)&&isFinite(r.ppA)&&isFinite(r.ppC)))bad.push(["números",st]);
    if(k===1&&(r.red!==0||r.form!==0||r.kmA!==r.kmC))bad.push(["1 origen",st]);
    if(k>1&&r.kmC>r.kmA+1e-9)mayor++;
    if(!(r.score>=0&&r.score<=100))bad.push(["puntaje",st,r.score]);
    if(st.pol&&+st.pol===r.cerca&&r.score!==100)bad.push(["la más cercana no vale 100",st]);
    if(lg==="es"||seed%5===0){nt++;const txt=JSON.stringify(G.metrics(st))+G.share(st)+G.aha(st)+G.ouch(st)+JSON.stringify(G.score(st))+JSON.stringify(L.story(r,st))+L.math.map(x=>x.s(st)).join("")+JSON.stringify(L.aha.t(st))+L.refLine(r);if(RX.test(txt))bad.push([st,txt.match(RX)[0]])}}}
  document.getElementById("lang-es").click();return{n,nt,mayor,nb:bad.length,bad:bad.slice(0,6)}});
 ok(`Barrido: ${sw.n} configuraciones (orígenes 1–5 × paradas 5–40 × barrios 0–20, en ES y EN) — números finitos, 1 origen = 0 %, puntaje 0–100; ${sw.nt} juegos de textos sin NaN ni textos rotos`,sw.nb===0,sw.bad);
 ok(`Barrido: juntar en un furgón nunca recorre más que por separado (${sw.mayor} casos con más km de ${sw.n})`,sw.mayor===0,sw.mayor);
 /* la plata: todas las combinaciones de furgones y USD */
 const pl=await p.evaluate(()=>{const bad=[];for(let A=1;A<=100;A++)for(let D=1;D<=100;D++)for(const usd of [10,100,500]){const r=EC.crossdock({k:3,m:6,A,D,usd});const e=Math.max(0,A-D)*usd;if(r.ahorro!==e||r.D>r.A||r.menos<0)bad.push([A,D,usd,r.ahorro])}return bad});
 ok("La plata en las 30.000 combinaciones de furgones antes/después (1–100) × 3 precios: rutas menos × USD por ruta, nunca negativo (después ≤ antes)",pl.length===0,pl.slice(0,3));

 /* 4 · entradas inválidas por la URL */
 await p.goto(U+"?caso=crossdock&origenes=99&paradas=-3&barrio=abc&antes=500&despues=999&usd=0&regla=77");await p.waitForSelector("#play");await p.waitForTimeout(1200);
 {const st=await p.evaluate(()=>{const r=EC.crossdock(ECAPP.STATE.crossdock);return{k:r.k,m:r.m,seed:r.seed,A:r.A,D:r.D,usd:r.usd,pol:r.pol,t:document.body.innerText}});
  ok("Entradas inválidas por la URL (99 orígenes, −3 paradas, «abc», 500 y 999 furgones, 0 USD, apuesta 77): se acotan a 5, 5, el barrio 20, 100 → 100 y 10 USD, sin apuesta y sin NaN",st.k===5&&st.m===5&&st.seed===20&&st.A===100&&st.D===100&&st.usd===10&&st.pol===""&&!/NaN|undefined|Infinity/.test(st.t),{k:st.k,m:st.m,seed:st.seed,A:st.A,D:st.D,usd:st.usd,pol:st.pol})}

 /* 5 · el teléfono: adivinar primero, después revelar */
 await p.goto(U+"?caso=crossdock&origenes=3&paradas=6&barrio=20");await p.waitForSelector("#play");await p.waitForTimeout(1800);
 await p.evaluate(()=>ECAPP.set("crossdock",{pol:""}));await p.waitForTimeout(500);
 {const t=await p.evaluate(()=>document.getElementById("panel").innerText+" "+[...document.querySelectorAll(".labels .lbl")].map(e=>e.textContent).join(" "));const r=await p.evaluate(()=>EC.crossdock(ECAPP.STATE.crossdock));
  const opts=await p.evaluate(()=>[...document.querySelectorAll("#rulepick button")].map(b=>b.innerText.trim()));
  ok("Adivina primero: la pregunta tiene las cuatro opciones 10 %, 25 %, 42 % y 60 %",opts.join("|")==="10 %|25 %|42 %|60 %",opts);
  ok("Antes de ▶ no se revela nada: ni la reducción medida, ni los km, ni la fórmula en el panel ni en el mapa",!t.includes(nf1(r.red*100))&&!/\d,\d+ km|km por parada|\d km(?! ·|,)/.test(t.replace("2 × 2 km",""))&&!t.includes("42,3"),t.slice(0,200));
  ok("Antes de ▶ el mapa muestra ANTES (3 furgones) y CON CROSSDOCK (1 furgón)",/ANTES\s*3 furgones/.test(t)&&/CON CROSSDOCK\s*1 furgón/.test(t))}
 /* en el teléfono los barrios van uno sobre otro: ANTES arriba */
 {const pos=await p.evaluate(()=>{const L=[...document.querySelectorAll(".labels .lbl")].map(e=>({t:e.textContent,r:e.getBoundingClientRect()}));const a=L.find(x=>/^ANTES/.test(x.t)),c=L.find(x=>/^CON CROSSDOCK/.test(x.t));return a&&c?{a:a.r.top,c:c.r.top,ax:a.r.left,cx:c.r.left,w:innerWidth,fs:[...document.querySelectorAll(".labels .lbl span")].map(s=>parseFloat(getComputedStyle(s).fontSize))}:null});
  ok("Teléfono, antes de ▶: el barrio ANTES queda arriba y CON CROSSDOCK abajo, con letra ≥ 12 px",pos&&pos.a<pos.c-100&&Math.min(...pos.fs)>=12,pos)}
 await p.screenshot({path:path.join(CAP,"crossdock_movil_1_gancho.png")});
 await p.tap('#rulepick button[data-v="25"]');await p.waitForTimeout(500);
 ok("Al elegir 25 % la pista dice tu apuesta y todavía no hay cifras",/Tu apuesta: un 25 % menos por parada/.test(await p.textContent("#panel"))&&!/\d,\d+ km|km por parada/.test(await p.textContent("#panel")));
 await p.screenshot({path:path.join(CAP,"crossdock_movil_2_apuesta.png")});
 await p.tap("#play");await p.waitForTimeout(2600);await p.screenshot({path:path.join(CAP,"crossdock_movil_3_rutas_en_camino.png")});
 await p.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:90000});await p.waitForTimeout(1200);
 await p.screenshot({path:path.join(CAP,"crossdock_movil_4_mapa_antes_despues.png")});
 {const r=await p.evaluate(()=>EC.crossdock(ECAPP.STATE.crossdock)),m=await p.evaluate(()=>ECAPP.metrics("crossdock")),rv=await p.textContent("#rv"),pan=(await p.textContent("#panel")).replace(/\s+/g," ");
  const lb=await p.evaluate(()=>[...document.querySelectorAll(".labels .lbl")].map(e=>e.textContent));
  ok(`Después de ▶: el número grande es la reducción medida, con signo como en el reel (${rv} % por parada) = el modelo`,rv==="−"+nf1(r.red*100)&&/−\d+,\d% por parada/.test(pan),[rv,nf1(r.red*100)]);
  ok("Después de ▶: km totales y km por parada de las dos situaciones, en la tarjeta y en el mapa (en amarillo)",m[0].l===`Antes: 3 rutas, ${nf1(r.kmA)} km, ${nf2(r.ppA)} km por parada · con crossdock: 1 ruta, ${nf1(r.kmC)} km, ${nf2(r.ppC)} km por parada`&&lb.some(x=>x===`ANTES${nf1(r.kmA)} km${nf2(r.ppA)} km por parada`)&&lb.some(x=>x===`CON CROSSDOCK${nf1(r.kmC)} km${nf2(r.ppC)} km por parada`)&&await p.evaluate(()=>[...document.querySelectorAll(".labels .lbl .y")].length===4),[m[0].l,lb]);
  ok("Después de ▶: medido contra la fórmula (42,3 %) con la nota de pocas paradas, y tu apuesta contra la opción más cercana (42 %)",/Tu apuesta: 25 % · la opción más cercana: 42 % · medido: \d+,\d % · la fórmula 1 − 1\/√3: 42,3 %\. Difieren porque con pocas paradas la fórmula es aproximada/.test(m[0].note),m[0].note);
  ok("La plata: 2.000 USD menos al día, rotulado EJEMPLO, con 33 → 13 furgones y 100 USD por ruta",m[1].v==="2.000"&&/EJEMPLO/.test(m[1].u)&&m[1].l==="33 → 13 furgones: 20 rutas menos × 100 USD por ruta"&&pan.includes("2.000 USD menos al día · EJEMPLO"),m[1]);
  ok("Las cifras del mapa se leen sin zoom: ≥ 12,5 px y la de km a 18 px",await p.evaluate(()=>{const s=[...document.querySelectorAll(".labels .lbl span")].map(x=>parseFloat(getComputedStyle(x).fontSize));return Math.min(...s)>=12.5&&Math.max(...s)>=18}));
  ok("Las cifras del mapa no se tapan entre sí ni quedan bajo el panel, el encabezado o fuera de la pantalla",await p.evaluate(()=>{const L=[...document.querySelectorAll(".labels .lbl")].map(e=>e.getBoundingClientRect()),P=document.getElementById("panel").getBoundingClientRect(),H=document.querySelector(".g-top").getBoundingClientRect(),ov=(a,b)=>a.left<b.right&&b.left<a.right&&a.top<b.bottom&&b.top<a.bottom;return L.every(a=>a.left>=0&&a.right<=innerWidth&&!ov(a,P)&&a.top>=H.bottom-2)&&!ov(L[0],L[1])}))}
 /* otra corrida con 5 orígenes: la comparación de la interfaz («Antes → ahora») marca la reducción mayor en verde (baja), no en rojo */
 await p.evaluate(()=>ECAPP.set("crossdock",{k:5}));await p.waitForTimeout(400);await p.tap("#play");await p.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:90000});await p.waitForTimeout(900);
 {const c=await p.evaluate(()=>{const e=document.querySelector(".rcmp i");return e?{cls:e.className,t:e.textContent}:null});ok("Segunda corrida con 5 orígenes: la comparación con la anterior baja y sale en verde (clase «down»)",c&&c.cls==="down",c)}
 await p.evaluate(()=>ECAPP.set("crossdock",{k:3}));await p.waitForTimeout(300);
 /* la plata: cambiar los furgones y el precio */
 await p.evaluate(()=>ECAPP.set("crossdock",{A:40,D:12,usd:150}));await p.waitForTimeout(300);
 {const m=await p.evaluate(()=>ECAPP.metrics("crossdock"));ok("La plata se puede editar: 40 → 12 furgones a 150 USD = 4.200 USD al día",m[1].v==="4.200"&&m[1].l==="40 → 12 furgones: 28 rutas menos × 150 USD por ruta",m[1])}
 await p.evaluate(()=>ECAPP.set("crossdock",{A:10,D:30}));await p.waitForTimeout(200);
 ok("Si se piden más furgones después que antes, después se iguala a antes (nunca un ahorro negativo)",await p.evaluate(()=>{const s=ECAPP.STATE.crossdock,r=EC.crossdock(s);return s.D===s.A&&r.ahorro===0}));
 await p.evaluate(()=>ECAPP.set("crossdock",{A:33,D:13,usd:100}));await p.waitForTimeout(300);
 await p.evaluate(()=>ECAPP.openSheet("crossdock","ajustar"));await p.waitForTimeout(700);await p.screenshot({path:path.join(CAP,"crossdock_movil_5_plata.png")});
 {const t=(await p.textContent("#sheet")).replace(/\s+/g," ");ok("«Cambiar los números» trae orígenes 1–5, paradas 5–40, furgones antes y con crossdock, USD por ruta rotulado EJEMPLO y el barrio (semilla)",["Orígenes (bodegas o tiendas)","Paradas por origen","Furgones antes","Furgones con crossdock","USD por ruta (EJEMPLO)","Barrio (semilla de las paradas al azar)"].every(x=>t.includes(x))&&await p.evaluate(()=>{const q=k=>document.getElementById("c-crossdock-a-"+k);return q("k").min==="1"&&q("k").max==="5"&&q("m").min==="5"&&q("m").max==="40"}),t.slice(0,200))}
 await p.evaluate(()=>ECAPP.closeSheet());await p.waitForTimeout(400);
 /* «Por qué pasa»: el modelo y las fuentes */
 await p.evaluate(()=>ECAPP.openSheet("crossdock","ciencia"));await p.waitForTimeout(700);
 {const sh=(await p.textContent("#sheet")).replace(/ /g," ");
  ok("«Por qué pasa» abre con ∑ El modelo: Beardwood, Halton y Hammersley, L ≈ k·√(n·A) con 0,7124 y 0,765, y Daganzo como respaldo",["∑ El modelo","Beardwood, Halton y Hammersley","k · √(n · A)","0,7124","0,765","Daganzo"].every(x=>sh.includes(x)),sh.slice(0,140));
  ok("«Por qué pasa»: 42,3 % = 1 − 1/√3 marcado como cálculo propio; Londres 33 → 13 de McLeod y otros (2020); 100 USD por ruta como ejemplo",sh.includes("1 − 1/√3 = 42,3 % (cálculo propio)")&&sh.includes("33 a 13 furgones (McLeod y otros, 2020)")&&sh.includes("100 USD la ruta, un ejemplo nuestro")&&sh.includes("2.000 USD"),sh.match(/Por parada[^.]*\./)?.[0]);
  ok("«Por qué pasa» deja los supuestos a la vista (barrio de ejemplo, sin el viaje al crossdock, 2-opt no es el óptimo, pocas paradas, semilla 20, Londres es modelación, 100 USD ejemplo)",["El barrio es de ejemplo","viaje de cada origen hasta el crossdock","no las óptimas","con pocas es aproximada","semilla 20","modelación con datos reales","ejemplo nuestro, no una tarifa"].every(x=>sh.includes(x)));
  ok("«Por qué pasa» trae los cuatro libros",await p.evaluate(()=>["bhh1959","daganzo1984","mcleod2020","encamino_r021"].every(id=>!!document.querySelector(`#sheet [data-book="${id}"]`))))}
 await p.screenshot({path:path.join(CAP,"crossdock_movil_6_porque.png")});
 ok("Sin desborde horizontal a 390 px",await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await p.evaluate(()=>ECAPP.closeSheet());await p.waitForTimeout(300);
 /* inglés */
 await p.evaluate(()=>document.getElementById("lang-en").click());await p.waitForTimeout(500);
 {const m=await p.evaluate(()=>ECAPP.metrics("crossdock"));ok("En inglés: «% per stop», «USD less a day · EXAMPLE» y la fórmula 42.3 %",m[0].u==="% per stop"&&m[1].u==="USD less a day · EXAMPLE"&&/the formula 1 − 1\/√3: 42\.3 %/.test(m[0].note),[m[0].u,m[1].u])}
 await p.evaluate(()=>document.getElementById("lang-es").click());await p.waitForTimeout(300);
 /* textos: sin empresas chilenas, español neutro */
 const marcas=await p.evaluate(()=>{const L=ECAPP.LAB.crossdock,G=L.game,st=ECAPP.STATE.crossdock,B=ECAPP.dev.BIB;const SRC=ECAPP.SOURCES.filter(x=>x.labs.includes("crossdock"));return JSON.stringify([L.lede,L.aha.h,L.notApply,L.q,L.short,L.kicker,G.rule,G.chips,G.cta,G.sliders.map(x=>[x.es,x.en]),G.ajustes.map(x=>[x.es,x.en]),SRC.map(x=>[x.idea,x.ti,x.ve,x.sp,x.spEn,x.au]),SRC.map(x=>B[x.id])])+JSON.stringify(L.aha.t(st))+L.math.map(m=>m.p()+m.s(st)).join("")+G.aha(st)+G.share(st)+JSON.stringify(G.metrics(st))});
 const CL=/chilexpress|correos de chile|starken|blue ?express|falabella|ripley|cencosud|sodimac|\blider\b|paris\.cl|mercado ?libre|copec|\bruck\b|\bchile\b|chilen/i;
 ok("Sin empresas chilenas en el laboratorio, sus fuentes ni sus fichas",!CL.test(marcas),(marcas.match(CL)||[])[0]);
 const VOS=/(?<![a-záéíóúñ])(probá|mirá|tenés|podés|querés|sabés|cambiá|elegí|sumá|pasá|apostá|adiviná|compará|fijate|vos)(?![a-záéíóúñ])/i;
 ok("Español neutro: sin voseo",!VOS.test(marcas.replace(/"en":"[^"]*"|en:"[^"]*"/g,"")),(marcas.match(VOS)||[])[0]);
 ok("Sin errores de página ni de consola en el teléfono",errs.length===0,errs.slice(0,3));await ctx.close();

 /* 6 · escritorio: los dos barrios a la vista, el panel no tapa CON CROSSDOCK */
 {const cx=await b.newContext(DESK);const q=await cx.newPage();await env(q);const er=vigila(q);
  await q.goto(U+"?caso=crossdock&origenes=3&paradas=6&barrio=20&regla=42");await q.waitForSelector("#play");await q.waitForTimeout(1800);
  await q.screenshot({path:path.join(CAP,"crossdock_escritorio_1_listo.png")});
  await q.click("#play");await q.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:90000});await q.waitForTimeout(1200);
  await q.screenshot({path:path.join(CAP,"crossdock_escritorio_2_fin.png")});
  const d=await q.evaluate(()=>{const L=[...document.querySelectorAll(".labels .lbl")].map(e=>({t:e.textContent,r:e.getBoundingClientRect()})),P=document.getElementById("panel").getBoundingClientRect();const a=L.find(x=>/^ANTES/.test(x.t)),c=L.find(x=>/^CON CROSSDOCK/.test(x.t));return{ok:!!(a&&c),lado:a&&c&&a.r.left<c.r.left-200&&Math.abs(a.r.top-c.r.top)<5,libre:c&&c.r.right<P.left,nota:ECAPP.metrics("crossdock")[0].note}});
  ok("Escritorio 1280 × 800: ANTES y CON CROSSDOCK lado a lado, y el panel de resultado no tapa al de la derecha",d.ok&&d.lado&&d.libre,d);
  ok("Escritorio: apostar 42 % es la opción más cercana («¡acertaste!»)",/Tu apuesta: 42 % · la opción más cercana: 42 % \(¡acertaste!\)/.test(d.nota),d.nota);
  ok("Escritorio: sin errores de página ni de consola y sin desborde horizontal",er.length===0&&await q.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),er.slice(0,3));await cx.close()}

 /* 7 · publicado (forzando DPUB=true, como hará Christian el día del reel) */
 {const cx=await b.newContext(VIEW);await cx.route("**/index.html*",async r=>{const x=await r.fetch();await r.fulfill({response:x,body:(await x.text()).replace("const DPUB=false;","const DPUB=true;")})});
  const q=await cx.newPage();await env(q);const er=vigila(q);
  await q.goto(U+"?reel=21");await q.waitForTimeout(2000);ok("Publicado: ?reel=21 abre #crossdock y el título dice «Reel #21»",await q.evaluate(()=>location.hash)==="#crossdock"&&/Reel #21/.test(await q.textContent("#reels")));
  await q.evaluate(()=>ECAPP.openSheet("crossdock","reels"));await q.waitForTimeout(600);
  {const lst=await q.evaluate(()=>[...document.querySelectorAll("#sheet-body .mrow")].map(e=>e.textContent.replace(/\s+/g," ").trim()));const R21=/^#21 ?Una sola compra, tres furgones/;
  if(DEST==="crossdock")ok("Publicado y destacado (DESTACADO=\"crossdock\"): el reel 21 sale primero en «Cambiar de reel»",R21.test(lst[0]||""),lst.slice(0,2));
  else ok("Publicado sin destacar: el destacado sigue primero y el reel 21 sale segundo en «Cambiar de reel»",/^#20/.test(lst[0]||"")&&R21.test(lst[1]||""),lst.slice(0,2))}
  await q.evaluate(()=>ECAPP.closeSheet());await q.waitForTimeout(300);
  await q.evaluate(()=>{location.hash="biblioteca"});await q.waitForTimeout(900);
  {const ti=await q.textContent("#libintro");ok("Publicado: la biblioteca pasa de 52 a 56 fuentes, de dieciocho reels",/Cincuenta y seis fuentes de dieciocho reels/.test(ti),ti.slice(0,48))}
  ok("Publicado: la biblioteca trae Beardwood, Halton y Hammersley, Daganzo, McLeod y otros y el cálculo propio",await q.evaluate(()=>["bhh1959","daganzo1984","mcleod2020","encamino_r021"].every(id=>!!document.querySelector(`#v-biblioteca [data-book="${id}"]`))));
  await q.evaluate(()=>ECAPP.openBook("mcleod2020"));await q.waitForTimeout(600);
  {const bk=await q.evaluate(()=>{const pg=document.querySelector(".bk-page");return{stat:!!pg.querySelector(".bigstat"),story:!!pg.querySelector(".pstory"),link:pg.querySelector(".plink")&&pg.querySelector(".plink").href,t:pg.textContent}});
   ok("Libro de McLeod y otros: 33 → 13 furgones, 3,7 km², Transportation Research Record 2674(8), 384–393, enlace al DOI",bk.stat&&bk.story&&/33 → 13/.test(bk.t)&&/3,7 km²/.test(bk.t)&&/2674\(8\), 384–393/.test(bk.t)&&bk.link==="https://doi.org/10.1177/0361198120920636",[bk.link,bk.t.slice(0,120)])}
  await q.screenshot({path:path.join(CAP,"crossdock_libro_mcleod.png")});
  await q.evaluate(()=>{const x=document.querySelector(".bk-x");x&&x.click()});await q.waitForTimeout(300);
  await q.evaluate(()=>ECAPP.openBook("bhh1959"));await q.waitForTimeout(600);
  {const bk=await q.evaluate(()=>{const pg=document.querySelector(".bk-page");return{eq:!!pg.querySelector(".beq"),live:!!pg.querySelector(".blive"),t:pg.textContent}});ok("Libro de Beardwood, Halton y Hammersley: fórmula, cuenta en vivo con tus paradas, 0,7124 y 0,765",bk.eq&&bk.live&&/0,7124/.test(bk.t)&&/0,765/.test(bk.t),bk.t.slice(0,100))}
  await q.screenshot({path:path.join(CAP,"crossdock_libro_bhh.png")});
  ok("Publicado: sin errores de página ni de consola",er.length===0,er.slice(0,3));await cx.close()}
 console.log(`${checks.filter(Boolean).length}/${checks.length}`);await b.close();srv.close&&srv.close();process.exit(checks.every(Boolean)?0:1)})().catch(e=>{console.error(e);process.exit(1)});
function nf1(x){return (Math.round(x*10)/10).toFixed(1).replace(".",",")}
function nf2(x){return (Math.round(x*100)/100).toFixed(2).replace(".",",")}
