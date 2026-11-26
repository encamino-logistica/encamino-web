// Reel 20 · FedEx, más lejos a propósito: cifras de la hoja de cifras del reel (reels/R020/hoja_cifras.json) y cálculo propio
// (300 / 24; 7,44 por ciudad como en el reel y 7,75 por conexión con el centro; Memphis cuenta como una de las 25 ciudades), barrido de TODAS las combinaciones de controles, entradas inválidas, corrida en el teléfono (390 px) con capturas,
// bandera sin publicar y publicada, biblioteca. Mapa: contorno de EE. UU. y ciudades reales de ejemplo (Memphis, el centro); nombres sin
// taparse a 390 px y en escritorio con 5 a 50 ciudades; la ciudad que se suma se nombra y late.
// Uso: node tests/fedex.js   (prueba FPUB=false tal como está y además fuerza FPUB=true para probar la versión publicada)
// HOJA=<ruta a hoja_cifras.json> para cambiar la hoja (por omisión, la de la oficina).
const {chromium}=require(process.env.PW||"playwright");const serve=require("./serve.js"),env=require("./env.js");
const checks=[];const ok=(n,c,g)=>{checks.push(!!c);console.log((c?"PASS ":"FAIL ")+n+(g!==undefined?"  → "+JSON.stringify(g):""))};
const fs=require("fs"),path=require("path"),os=require("os");const CAP=path.join(__dirname,"..","capturas");if(!fs.existsSync(CAP))fs.mkdirSync(CAP);
const HOJA=process.env.HOJA||path.join(os.homedir(),"encamino/oficina/repo/oficina/reels/R020/hoja_cifras.json");
(async()=>{const srv=await serve(8820);const b=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const VIEW={viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,locale:"es-CL"};const U="http://127.0.0.1:8820/index.html";
 /* 1 · sin publicar (FPUB=false, forzado si la rama ya la encendió): no se lista, pero el enlace directo funciona */
 {const ctx=await b.newContext(VIEW);await ctx.route("**/index.html*",async r=>{const x=await r.fetch();await r.fulfill({response:x,body:(await x.text()).replace("const FPUB=true;","const FPUB=false;")})});const p=await ctx.newPage();await env(p);const errs=[];p.on("pageerror",e=>errs.push(e.message));
  await p.goto(U);await p.waitForTimeout(2500);const home=await p.evaluate(()=>document.body.innerText);
  await p.goto(U+"?reel=20");await p.waitForTimeout(2000);const h20=await p.evaluate(()=>location.hash);
  await p.evaluate(()=>{location.hash="biblioteca"});await p.waitForTimeout(800);
  const bib=await p.evaluate(()=>["fedex1973","fedex2024","hendricks1995","encamino_r020"].some(id=>!!document.querySelector(`#v-biblioteca [data-book="${id}"]`)));
  {const ti=await p.textContent("#libintro");const IP=await p.evaluate(()=>!!ECAPP.dev.PUBLICADO.inventario);ok(IP?"Con FPUB=false la biblioteca queda en 48 fuentes de dieciséis reels (inventario publicada)":"Con FPUB=false la biblioteca sigue en 45 fuentes de quince reels",(IP?/Cuarenta y ocho fuentes de dieciséis reels/:/Cuarenta y cinco fuentes de quince reels/).test(ti),ti.slice(0,48))}
  ok("Bandera FPUB=false: no sale en la portada, ?reel=20 no lo abre y sus fuentes no salen en la biblioteca",!/Más lejos a propósito|FedEx/.test(home)&&h20!=="#fedex"&&!bib,{h20,bib});
  await p.goto(U+"?caso=fedex");await p.waitForSelector("#play");await p.waitForTimeout(1200);
  ok("Sin publicar, el enlace directo ?caso=fedex abre el laboratorio",await p.evaluate(()=>location.hash)==="#fedex",await p.evaluate(()=>location.hash));
  ok("Sin errores de página (FPUB=false)",errs.length===0,errs.slice(0,3));await ctx.close()}
 /* 2 · publicado (FPUB=true, forzado si la rama la tiene apagada) */
 const FPUB_RAMA=/const FPUB=true;/.test(fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8"));ok("Bandera en el index.html de la rama: FPUB="+FPUB_RAMA+" y REELNUM fedex:20",/fedex:20[,}]/.test(fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8")));
 const ctx=await b.newContext(VIEW);
 await ctx.route("**/index.html*",async r=>{const x=await r.fetch();await r.fulfill({response:x,body:(await x.text()).replace("const FPUB=false;","const FPUB=true;")})});
 const p=await ctx.newPage();await env(p);const errs=[];p.on("pageerror",e=>errs.push(e.message));
 await p.goto(U);await p.waitForTimeout(2500);
 /* cifras: la hoja de cifras del reel contra el modelo */
 const H=JSON.parse(fs.readFileSync(HOJA,"utf8")),hv=id=>(H.cifras.find(c=>c.id===id)||{}).valor;
 const R=await p.evaluate(()=>{const d=ECAPP.LAB.fedex.def,a=EC.fedex(Object.assign({},d,{pol:"directo"})),c=EC.fedex(Object.assign({},d,{pol:"centro"}));return{def:d,CD:a.CD,CH:a.CH,Cd:a.C,Cc:c.C,qD:a.qD,qH:c.qH,nuevasD:a.nuevasD,nuevasH:c.nuevasH,E:a.E,porCiudad:a.porCiudad}});
 ok("Hoja de cifras: 14 aviones, 186 paquetes, 25 ciudades, 1973 y 484.000 por hora son los del laboratorio",R.E.av===hv("aviones14")&&R.E.P===hv("paquetes186")&&R.E.n===hv("ciudades25")&&R.E.anio===hv("anio1973")&&R.E.hub===hv("memphis484000"),R.E);
 ok("Valores por defecto = la primera noche: 25 ciudades y 186 paquetes",R.def.n===25&&R.def.P===186,R.def);
 ok("Con 25 ciudades y 186 paquetes: exactos 300 conexiones ciudad con ciudad (hoja conexiones300)",R.CD===300&&R.Cd===300&&R.CD===hv("conexiones300"),R.CD);
 ok("Con 25 ciudades: exactas 24 conexiones con un centro (hoja rayos24)",R.CH===24&&R.Cc===24&&R.CH===hv("rayos24"),R.CH);
 ok("Con 186 paquetes y 24 conexiones: exactos 7,75 paquetes por conexión (186 ÷ 24, cálculo propio); ciudad con ciudad 0,62",R.qH===7.75&&R.qD===0.62,[R.qH,R.qD]);
 ok("Sumar la ciudad 26: 25 conexiones nuevas contra 1 (hoja nuevas25 y nueva1)",R.nuevasD===hv("nuevas25")&&R.nuevasH===hv("nueva1"),[R.nuevasD,R.nuevasH]);
 ok("Promedio por ciudad 186 ÷ 25 = 7,44 (hoja por_ciudad, «en promedio»)",Math.abs(R.porCiudad-hv("por_ciudad"))<0.001,R.porCiudad);
 /* barrido de TODAS las combinaciones de ciudades (5–50), paquetes por noche (10–1000) y las dos reglas, con el avión por defecto, en ES y EN */
 const sw=await p.evaluate(()=>{const bad=[];let n=0,nt=0;const s=ECAPP.STATE.fedex,G=ECAPP.LAB.fedex.game,L=ECAPP.LAB.fedex,Dd=JSON.stringify(s);const RX=/NaN|undefined|Infinity|∞|−-|--|\[object|null/;
  const isInt=x=>Number.isInteger(x)&&x>=0;
  const model=(st)=>{const c=EC.fedex(st),a=c.a;n++;
   if(!(isInt(c.C)&&isInt(c.CD)&&isInt(c.CH)&&c.C>0))bad.push(["conexiones no enteras",st,c.C,c.CD,c.CH]);
   if(c.CD!==c.n*(c.n-1)/2||c.CH!==c.n-1)bad.push(["fórmula",st,c.CD,c.CH]);
   if(c.n>=4&&!(c.CH<c.CD))bad.push(["n−1 no es menor que n(n−1)/2",st]);
   if(!(c.q>0&&isFinite(c.q))||Math.abs(c.q-c.P/c.C)>1e-12)bad.push(["paquetes por conexión",st,c.q]);
   if(!(isInt(a.av)&&isInt(a.vac)&&isInt(a.med)&&isInt(a.lle)&&isInt(a.sin)&&a.vac+a.med+a.lle===a.av&&a.av>=c.C&&a.sin<=c.C))bad.push(["aviones",st,a]);
   if(!(a.occ>0&&a.occ<=1+1e-12))bad.push(["ocupación",st,a.occ]);
   if(!(c.desC>0&&isFinite(c.desC))||(c.cen?c.des!==c.desC:c.des!==0))bad.push(["desvío",st,c.des,c.desC]);
   if(c.nuevasD!==c.n||c.nuevasH!==1||c.llegoD!==c.n-1)bad.push(["sumar ciudad",st]);
   if(!(c.score>=0&&c.score<=1000))bad.push(["score",st,c.score]);
   if(c.pos.length!==c.n||c.pos.some(q=>!(q[0]>0&&q[0]<1&&q[1]>0&&q[1]<1)))bad.push(["mapa",st]);return c};
  for(const lg of ["es","en"]){document.getElementById("lang-"+lg).click();
   for(let N=5;N<=50;N++)for(let P=10;P<=1000;P++)for(const pol of ["directo","centro"]){const st={n:N,P,cap:10,pol};const c=model(st);
    if(lg==="es"&&pol==="centro"){/* lo que se suma con un centro es menos que ciudad con ciudad */const d=EC.fedex({n:N,P,cap:10,pol:"directo"});if(!(c.C<d.C&&c.q>d.q))bad.push(["centro no mejora",st])}
    if(P%7===0||P===186||P===10||P===1000){nt++;const txt=JSON.stringify(G.metrics(st))+G.share(st)+G.ouch(st,"directo",pol)+JSON.stringify(L.story(c,st))+L.math.map(x=>x.s(st)).join("")+G.aha(st)+JSON.stringify(G.score(st))+L.refLine(c);if(RX.test(txt))bad.push([st,txt.match(RX)[0]])}}}
  /* el avión (supuesto): todas sus posiciones, con todas las ciudades y tres cargas */
  for(let N=5;N<=50;N++)for(let cap=5;cap<=50;cap++)for(const P of [10,186,1000])for(const pol of ["directo","centro"])model({n:N,P,cap,pol});
  document.getElementById("lang-es").click();Object.assign(s,JSON.parse(Dd));return{n,nt,nb:bad.length,bad:bad.slice(0,6)}});
 ok(`Barrido: ${sw.n} configuraciones (ciudades 5–50 × paquetes 10–1000 × 2 reglas en ES y EN, más ciudades × avión 5–50 × 3 cargas × 2 reglas) — conexiones enteras, n−1 < n(n−1)/2, sin negativos ni NaN, aviones que cuadran; ${sw.nt} juegos de textos sin NaN ni textos rotos`,sw.nb===0,sw.bad);
 /* entradas inválidas por la URL: se acotan, nada se rompe */
 await p.goto(U+"?caso=fedex&ciudades=999&paquetes=-5&caben=abc&regla=centro");await p.waitForSelector("#play");await p.waitForTimeout(1200);
 {const st=await p.evaluate(()=>{const r=EC.fedex(ECAPP.STATE.fedex);return{C:r.C,n:r.n,P:r.P,cap:r.cap,t:document.body.innerText}});ok("Entradas inválidas por la URL (999 ciudades, −5 paquetes, «abc»): se acotan a 50 ciudades, 10 paquetes y 10 por avión, sin NaN en la página",st.n===50&&st.P===10&&st.cap===10&&st.C===49&&!/NaN|undefined|Infinity/.test(st.t),{n:st.n,P:st.P,cap:st.cap,C:st.C})}
 /* corrida en el teléfono y capturas a 390 px */
 let SIT="";const run=async(q,f)=>{await p.goto(U+"?"+q);await p.waitForSelector("#play");await p.waitForTimeout(1500);SIT=await p.textContent(".sit");if(f)await p.screenshot({path:path.join(CAP,f+"_antes.png")});
  await p.tap("#play");await p.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:90000});await p.waitForTimeout(500);if(f)await p.screenshot({path:path.join(CAP,f+"_fin.png")});return(await p.textContent("#rv"))};
 const rv1=await run("caso=fedex&ciudades=25&paquetes=186&caben=10&regla=directo","fedex_directo");
 ok("Enlace con parámetros: 25 ciudades, 186 paquetes, ciudad con ciudad",/25 ciudades.*186 paquetes.*Ciudad con ciudad/.test(SIT),SIT);
 const m1=await p.evaluate(()=>ECAPP.metrics("fedex"));ok("Ciudad con ciudad en el teléfono: 300 conexiones, 0,62 por conexión y 7,44 por ciudad (= el modelo)",rv1==="300"&&m1[0].v==="300"&&/^0,62 paquetes por conexión, en promedio · 7,44 por ciudad/.test(m1[0].l),[rv1,m1[0].l]);
 ok("Ciudad con ciudad: 300 de 300 aviones casi vacíos (supuesto de 10 por avión, marcado)",m1[1].v==="300"&&/de 300 · 0 llenos · caben 10 paquetes \(supuesto\)/.test(m1[1].l),m1[1]);
 const lbl=await p.evaluate(()=>document.body.innerText);ok("El mapa se rotula «mapa ilustrativo»",/mapa ilustrativo/.test(lbl));
 const rv2=await run("caso=fedex&ciudades=25&paquetes=186&caben=10&regla=centro","fedex_centro");
 const m2=await p.evaluate(()=>ECAPP.metrics("fedex"));ok("Con un centro en el teléfono: 24 conexiones, 7,75 por conexión CON EL CENTRO y 7,44 por ciudad (como el reel), sumar una ciudad: 1 nueva",rv2==="24"&&/^7,75 paquetes por conexión con el centro, en promedio · 7,44 por ciudad · sumar una ciudad \(San Antonio\): 1 nueva/.test(m2[0].l),[rv2,m2[0].l]);
 ok("Con un centro: el desvío se ve como distancia extra (+ %), 0 aviones casi vacíos",/\+\d+ % de distancia por el desvío/.test(m2[1].l)&&m2[1].v==="0",m2[1]);
 const rv3=await run("caso=fedex&ciudades=50&paquetes=186&caben=10&regla=directo","fedex_50_directo");ok("50 ciudades ciudad con ciudad: 1.225 conexiones",rv3==="1.225",rv3);
 const rv4=await run("caso=fedex&ciudades=50&paquetes=186&caben=10&regla=centro","fedex_50_centro");ok("50 ciudades con un centro: 49 conexiones",rv4==="49",rv4);
 await p.evaluate(()=>document.getElementById("lang-en").click());await p.waitForTimeout(600);
 const rv5=await run("caso=fedex&ciudades=25&paquetes=186&caben=10&regla=centro","fedex_en_centro");const m5=await p.evaluate(()=>ECAPP.metrics("fedex"));
 ok("En inglés: 24 connections, 7.75 packages per connection with the hub, 7.44 per city",rv5==="24"&&/^7\.75 packages per connection with the hub, on average · 7\.44 per city/.test(m5[0].l),[rv5,m5[0].l]);
 await p.evaluate(()=>document.getElementById("lang-es").click());await p.waitForTimeout(400);
 ok("Sin desborde horizontal a 390 px",await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await run("caso=fedex&ciudades=25&paquetes=186&caben=10&regla=directo");
 await p.evaluate(()=>ECAPP.openSheet("fedex","ciencia"));await p.waitForTimeout(600);
 const sh=(await p.textContent("#sheet")).replace(/ /g," ");
 ok("«Por qué pasa» trae 300, 24, 7,75 (cálculo propio), 25 contra 1 y a Hendricks, Piccione y Tan",["300 conexiones","24 conexiones","7,75","Nuestra cuenta","la ciudad 26 agrega 25","Hendricks, Piccione y Tan"].every(x=>sh.includes(x)),sh.slice(0,160));
 ok("Hoja de cifras: 276 de 300 pares (92 %) pasan por el centro (pares_centro276, pct_centro92) y «Por qué pasa» lo dice con «casi todos»",(24*23/2)===hv("pares_centro276")&&Math.round(hv("pares_centro276")*100/hv("conexiones300"))===hv("pct_centro92")&&sh.includes("276 (92 %)")&&sh.includes("Casi todos los paquetes viajan más lejos"),sh.match(/Casi todos[^.]*\./)?.[0]);
 ok("Ningún texto del laboratorio dice que «cada paquete» vuela más lejos (terreno: es «casi todos»)",await p.evaluate(()=>{const L=ECAPP.LAB.fedex;const t=JSON.stringify([L.lede,L.aha,L.notApply,L.game.rule])+L.math.map(m=>m.p()).join("");return !/cada paquete (viaja|vuela)|each package (travels|flies)|El paquete (viaja|vuela) más lejos|The package (travels|flies) further/.test(t)}));
 ok("«Por qué pasa» trae 7,44 por ciudad (la cifra del reel, 186 ÷ 25) y el supuesto «Memphis cuenta como una de las 25 ciudades»",["poco más de 7 paquetes por ciudad","7,44","Memphis cuenta como una de las 25 ciudades"].every(x=>sh.includes(x)),sh.slice(0,160));
 {const todo=sh+" "+await p.evaluate(()=>{const L=ECAPP.LAB.fedex,r=EC.fedex(L.def);return [L.refLine(r),...ECAPP.SOURCES.filter(x=>x.labs&&x.labs.includes("fedex")).map(x=>x.idea.es+" "+x.idea.en),ECAPP.metrics("fedex").map(m=>m.l).join(" ")].join(" ")}),mal=[];
  for(const m of todo.matchAll(/7[,.]75/g)){const v=todo.slice(Math.max(0,m.index-60),m.index+60);if(!/con el centro|with the hub/.test(v))mal.push(v)}
  ok("Cada 7,75 se rotula «por conexión con el centro» (nunca «por ciudad»), en la hoja, el reporte, las fichas y las métricas",mal.length===0,mal.slice(0,2))}
 ok("«Por qué pasa» deja los supuestos a la vista (mapa ilustrativo, desvío supuesto, avión supuesto, sin plata, 484.000 es capacidad)",["El mapa es ilustrativo","es un supuesto","son supuestos","no dinero","son capacidad"].every(x=>sh.includes(x)));
 await p.screenshot({path:path.join(CAP,"fedex_porque.png")});
 ok("«Por qué pasa» sin desborde a 390 px",await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await p.evaluate(()=>ECAPP.closeSheet&&ECAPP.closeSheet());
 /* marcas: sin empresas chilenas, español neutro (sin voseo) */
 const marcas=await p.evaluate(()=>{const L=ECAPP.LAB.fedex,G=L.game,st=ECAPP.STATE.fedex;const SRC=ECAPP.SOURCES.filter(x=>x.labs.includes("fedex"));return JSON.stringify([L.lede,L.aha,L.notApply,L.q,L.short,L.kicker,G.rule,G.chips,G.cta,G.sliders.map(x=>[x.es,x.en]),G.ajustes.map(x=>[x.es,x.en]),SRC.map(x=>[x.idea,x.ti,x.ve,x.sp,x.spEn,x.au])])+L.math.map(m=>m.p()+m.s(st)).join("")+G.aha(st)+G.share(st)});
 const CL=/chilexpress|correos de chile|starken|blue ?express|falabella|ripley|cencosud|sodimac|\blider\b|copec|latam|sky airline|ruck|\bchile\b/i;
 ok("Sin empresas chilenas en el laboratorio ni en sus fuentes",!CL.test(marcas),(marcas.match(CL)||[])[0]);
 const VOS=/(?<![a-záéíóúñ])(probá|mirá|tenés|podés|querés|sabés|cambiá|elegí|sumá|pasá|comparás?|compará|fijate|vos)(?![a-záéíóúñ])/i;
 ok("Español neutro: sin voseo en los textos del laboratorio",!VOS.test(marcas.replace(/"en":"[^"]*"|en:"[^"]*"/g,"")),(marcas.match(VOS)||[])[0]);
 /* publicado */
 await p.goto(U+"?reel=20");await p.waitForTimeout(2000);ok("Publicado: ?reel=20 abre #fedex",await p.evaluate(()=>location.hash)==="#fedex");
 await p.evaluate(()=>ECAPP.openSheet("fedex","reels"));await p.waitForTimeout(700);{const lst=await p.evaluate(()=>[...document.querySelectorAll("#sheet-body .mrow")].map(e=>e.textContent.replace(/\s+/g," ").trim()));ok("Publicado y destacado: DESTACADO=\"fedex\" (sale primero en portada, «Cambiar de reel» y biblioteca)",await p.evaluate(()=>ECAPP.dev.DESTACADO==="fedex"));ok("Publicado: aparece primero en la lista de reels: «#20 ¿Por qué FedEx manda los paquetes más lejos a propósito?»",/^#20 ?¿Por qué FedEx manda los paquetes más lejos a propósito\?/.test(lst[0]||""),lst.slice(0,2));await p.screenshot({path:path.join(CAP,"fedex_lista_reels.png")});await p.evaluate(()=>ECAPP.closeSheet());await p.waitForTimeout(400)}
 await p.evaluate(()=>{location.hash="biblioteca"});await p.waitForTimeout(800);
 {const ti=await p.textContent("#libintro");const IP=await p.evaluate(()=>!!ECAPP.dev.PUBLICADO.inventario);ok(IP?"Publicado: la biblioteca pasa de 48 a 52 fuentes, de diecisiete reels (con inventario)":"Publicado: la biblioteca pasa de 45 a 49 fuentes, de dieciséis reels",(IP?/Cincuenta y dos fuentes de diecisiete reels/:/Cuarenta y nueve fuentes de dieciséis reels/).test(ti),ti.slice(0,48))}
 ok("Publicado: la biblioteca trae FedEx 1973, FedEx 2024, Hendricks, Piccione y Tan y el cálculo propio",await p.evaluate(()=>["fedex1973","fedex2024","hendricks1995","encamino_r020"].every(id=>!!document.querySelector(`#v-biblioteca [data-book="${id}"]`))));
 await p.evaluate(()=>ECAPP.openBook("hendricks1995"));await p.waitForTimeout(600);await p.screenshot({path:path.join(CAP,"fedex_libro_hendricks.png")});
 {const bk=await p.evaluate(()=>{const pg=document.querySelector(".bk-page");return{eq:!!pg.querySelector(".beq"),live:!!pg.querySelector(".blive"),story:!!pg.querySelector(".pstory"),t:pg.textContent}});
  ok("Libro de Hendricks, Piccione y Tan: historia, fórmula n − 1 ≤ C ≤ n(n − 1)/2, cuenta en vivo y páginas citadas",bk.eq&&bk.live&&bk.story&&/pp\. 84, 89 y 91/.test(bk.t)&&/Review of Economic Studies/.test(bk.t),bk.t.slice(0,120))}
 await p.evaluate(()=>{const x=document.querySelector(".bk-x");x&&x.click()});await p.waitForTimeout(300);
 await p.evaluate(()=>ECAPP.openBook("fedex1973"));await p.waitForTimeout(600);await p.screenshot({path:path.join(CAP,"fedex_libro_fedex1973.png")});
 {const bk=await p.evaluate(()=>{const pg=document.querySelector(".bk-page");return{stat:!!pg.querySelector(".bigstat"),story:!!pg.querySelector(".pstory"),link:pg.querySelector(".plink").href,t:pg.textContent}});
  ok("Libro de FedEx 1973: 186 paquetes, 25 ciudades, 14 aviones (con la copia del Internet Archive como respaldo), 7,44 por ciudad, enlace al comunicado de 2013",bk.stat&&bk.story&&/186 paquetes/.test(bk.t)&&/14 aviones/.test(bk.t)&&/Internet Archive del 29-10-2026/.test(bk.t)&&/Internet Archive del 29-10-2026 \(web\.archive\.org\)/.test(bk.t)&&await p.evaluate(()=>{const g=document.querySelector(".bk-page");return g.scrollWidth<=g.clientWidth+1&&document.documentElement.scrollWidth<=innerWidth})&&/7,44/.test(bk.t)&&bk.link==="https://newsroom.fedex.com/newsroom/fedex-marks-40th-anniversary",[bk.link,bk.t.slice(-300)])}
 ok("La capacidad de Memphis se dice con «puede procesar hasta» (condición de la hoja)",await p.evaluate(()=>{const s=ECAPP.SOURCES.find(x=>x.id==="fedex2024");return /puede procesar hasta 484\.000/.test(s.idea.es)&&/puede procesar hasta 484\.000/.test(ECAPP.LAB.fedex.refLine(EC.fedex(ECAPP.LAB.fedex.def)))}));

 /* mapa con ciudades reales: nombres sin taparse a 390 px y en escritorio, con 5 a 50 ciudades y las dos reglas */
 {const NOM=await p.evaluate(()=>EC.FXMAP.ciudades.map(c=>c[0]));
  ok("Ciudades reales en orden fijo por tamaño: Memphis (el centro) y luego Chicago, Dallas, Atlanta, Houston, Kansas City, Detroit, Nueva Orleans, Denver, Nueva York, Los Ángeles, Miami, Seattle…",NOM.slice(0,13).join()==="Memphis,Chicago,Dallas,Atlanta,Houston,Kansas City,Detroit,Nueva Orleans,Denver,Nueva York,Los Ángeles,Miami,Seattle",NOM.slice(0,13));
  ok("51 ciudades distintas: las 50 del control y la que se suma con 50",NOM.length===51&&new Set(NOM).size===51,NOM.length);
  ok("Las posiciones son las del mapa (Memphis en EC.fedex().pos[0]) y el contorno de EE. UU. está en el modelo",await p.evaluate(()=>{const r=EC.fedex({n:25,P:186,cap:10,pol:"centro"}),M=EC.FXMAP;return r.pos[0][0]===M.ciudades[0][2]&&r.pos[0][1]===M.ciudades[0][3]&&M.us.length>150&&M.lagos.length===5&&r.nombres[24][0]==="Charlotte"&&r.sig[0]==="San Antonio"}));
  const VWS=[["390 px",VIEW,"fedex_mapa_390"],["escritorio 1280 × 800",{viewport:{width:1280,height:800},locale:"es-CL"},"fedex_mapa_escritorio"]];
  for(const[vn,vw,cap]of VWS){const cx=await b.newContext(vw);const q=await cx.newPage();await env(q);const er=[];q.on("pageerror",e=>er.push(e.message));
   await q.goto(U+"?caso=fedex&ciudades=25&paquetes=186&caben=10&regla=centro");await q.waitForSelector("#play");await q.waitForTimeout(1800);
   const bad=[],cnt=[];let nconf=0;
   for(const pol of["directo","centro"])for(let n=5;n<=50;n++){nconf++;
    await q.evaluate(([n,pol])=>ECAPP.set("fedex",{n,pol}),[n,pol]);
    await q.waitForFunction(([n,g,m])=>{const lb=[...document.querySelectorAll(".labels")].find(x=>x.offsetParent&&x.children.length);if(!lb)return false;const L=[...lb.querySelectorAll(".lbl.c")];return L.length===n&&L.some(e=>e.textContent===g)&&[...lb.querySelectorAll(".lbl")].some(e=>e.textContent===m)},[n,"+ "+NOM[n],"Memphis"],{timeout:8000}).catch(()=>{});await q.waitForTimeout(60);
    const R=await q.evaluate(()=>{const lb=[...document.querySelectorAll(".labels")].find(x=>x.offsetParent&&x.children.length);if(!lb)return null;const hr=lb.getBoundingClientRect(),pn=document.getElementById("panel"),P=pn&&pn.offsetParent?pn.getBoundingClientRect():null,rr=r=>({l:r.left,t:r.top,R:r.right,b:r.bottom});
     return{L:[...lb.querySelectorAll(".lbl")].map(e=>({t:e.textContent,c:e.classList.contains("c"),p:e.dataset.p,hid:getComputedStyle(e).visibility==="hidden",fs:parseFloat(getComputedStyle(e).fontSize),r:rr(e.getBoundingClientRect())})),
      B:{l:Math.max(0,hr.left),t:Math.max(0,hr.top),R:Math.min(innerWidth,hr.right),b:Math.min(innerHeight,hr.bottom)},P:P&&rr(P),D:(lb._dots||[]).map(d=>({l:d.left,t:d.top,R:d.right,b:d.bottom})),r:(()=>{const x=EC.fedex(ECAPP.STATE.fedex);return{n:x.n,pol:x.pol}})()}});
    const st={n,pol};if(!R){bad.push(["sin rótulos",st]);continue}if(R.r.n!==n||R.r.pol!==pol){bad.push(["estado",st,R.r]);continue}
    const ov=(a,c,m)=>a.l<c.R+m&&c.l<a.R+m&&a.t<c.b+m&&c.t<a.b+m,V_=R.L.filter(l=>!l.hid),out=x=>x.l<R.B.l-1||x.R>R.B.R+1||x.t<R.B.t-1||x.b>R.B.b+1;
    for(let i=0;i<V_.length;i++)for(let j=i+1;j<V_.length;j++)if(ov(V_[i].r,V_[j].r,-0.5))bad.push(["se tapan",st,V_[i].t,V_[j].t]);
    V_.forEach(l=>{if(out(l.r))bad.push(["fuera del escenario",st,l.t]);if(l.c&&R.P&&ov(l.r,R.P,-0.5))bad.push(["bajo el panel",st,l.t]);if(l.c&&l.fs<11)bad.push(["letra chica",st,l.t,l.fs])});
    const cs=R.L.filter(l=>l.c&&l.p!=="99");if(cs.map(l=>l.t).join()!==NOM.slice(1,n).join())bad.push(["nombres",st,cs.length]);
    const gh=R.L.find(l=>l.p==="99");if(!gh||gh.t!=="+ "+NOM[n])bad.push(["ciudad que se suma",st,gh&&gh.t]);
    if(!V_.some(l=>/^Memphis/.test(l.t))||!V_.some(l=>l.t==="mapa ilustrativo")||!V_.some(l=>l.t==="ciudades de ejemplo: no son las 25 de 1973"))bad.push(["rótulos fijos",st]);
    /* si un nombre se oculta es porque taparía otro rótulo que se muestra, el centro, el panel o el borde: se muestran primero los de las ciudades más grandes */
    R.L.filter(l=>l.hid&&l.c).forEach(l=>{if(!(out(l.r)||V_.some(v=>ov(l.r,v.r,2))||(R.P&&ov(l.r,R.P,2))||R.D.some(d=>ov(l.r,d,2))))bad.push(["oculto sin motivo",st,l.t])});
    cnt.push(V_.filter(l=>l.c&&l.p!=="99").length)}
   ok(`Mapa en ${vn}: nombres sin taparse entre sí, dentro del escenario, fuera del panel y con letra ≥ 11 px; las ${nconf} configuraciones (5–50 ciudades × 2 reglas) con los nombres reales en orden, la que se suma rotulada, Memphis y «ciudades de ejemplo: no son las 25 de 1973» a la vista`,bad.length===0,bad.slice(0,4));
   console.log(`   nombres a la vista en ${vn}: entre ${Math.min(...cnt)} y ${Math.max(...cnt)} (de 4 a 49 ciudades sin contar el centro)`);
   for(const[nn,pp]of[[5,"centro"],[25,"centro"],[50,"directo"]]){await q.goto(U+`?caso=fedex&ciudades=${nn}&paquetes=186&caben=10&regla=${pp}`);await q.waitForSelector("#play");await q.waitForTimeout(1500);await q.click("#play");await q.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:90000});await q.waitForTimeout(700);await q.screenshot({path:path.join(CAP,`${cap}_${nn}_${pp}.png`)})}
   ok(`Mapa en ${vn}: sin errores de página y sin desborde horizontal`,er.length===0&&await q.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),er.slice(0,2));
   if(vn==="390 px"){await q.goto(U+"?caso=fedex&ciudades=25&paquetes=186&caben=10&regla=centro");await q.waitForSelector("#play");await q.waitForTimeout(1500);
    await q.evaluate(()=>ECAPP.set("fedex",{n:26}));await q.waitForTimeout(400);
    const a=await q.evaluate(()=>{const lb=[...document.querySelectorAll(".labels")].find(x=>x.offsetParent&&x.children.length);return[...lb.querySelectorAll(".lbl")].map(e=>[e.textContent,!!e.querySelector(".r"),e.dataset.p,getComputedStyle(e).visibility!=="hidden"])});await q.screenshot({path:path.join(CAP,"fedex_suma_ciudad.png")});
    await q.waitForTimeout(3600);const z=await q.evaluate(()=>{const lb=[...document.querySelectorAll(".labels")].find(x=>x.offsetParent&&x.children.length);return[...lb.querySelectorAll(".lbl")].filter(e=>e.textContent==="San Antonio").map(e=>!!e.querySelector(".r"))[0]});
    const m=await q.evaluate(()=>ECAPP.metrics("fedex")[0].l);
    ok("Sumar una ciudad: con 26, la nueva es San Antonio (la siguiente de la lista), se nombra a la vista y late en coral, y después vuelve a su color; la próxima que se sumaría es Portland",a.some(x=>x[0]==="San Antonio"&&x[1])&&a.some(x=>x[2]==="99"&&x[0]==="+ Portland")&&a.some(x=>x[0]==="San Antonio"&&x[2]==="0"&&x[3])&&z===false&&/sumar una ciudad \(Portland\): 1 nueva/.test(m),[a.filter(x=>/San Antonio|Portland/.test(x[0])),z,m])}
   await cx.close()}}
 ok("Sin errores de página (FPUB=true)",errs.length===0,errs.slice(0,3));
 console.log(`${checks.filter(Boolean).length}/${checks.length}`);await b.close();srv.close&&srv.close();process.exit(checks.every(Boolean)?0:1)})().catch(e=>{console.error(e);process.exit(1)});
