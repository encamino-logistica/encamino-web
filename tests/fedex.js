// Reel 20 · FedEx, más lejos a propósito: cifras de la hoja de cifras del reel (reels/R020/hoja_cifras.json) y cálculo propio
// (300 / 24 / 7,75), barrido de TODAS las combinaciones de controles, entradas inválidas, corrida en el teléfono (390 px) con capturas,
// bandera sin publicar y publicada, biblioteca.
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
  {const ti=await p.textContent("#libintro");ok("Con FPUB=false la biblioteca sigue en 45 fuentes de quince reels",/Cuarenta y cinco fuentes de quince reels/.test(ti),ti.slice(0,48))}
  ok("Bandera FPUB=false: no sale en la portada, ?reel=20 no lo abre y sus fuentes no salen en la biblioteca",!/Más lejos a propósito|FedEx/.test(home)&&h20!=="#fedex"&&!bib,{h20,bib});
  await p.goto(U+"?caso=fedex");await p.waitForSelector("#play");await p.waitForTimeout(1200);
  ok("Sin publicar, el enlace directo ?caso=fedex abre el laboratorio",await p.evaluate(()=>location.hash)==="#fedex",await p.evaluate(()=>location.hash));
  ok("Sin errores de página (FPUB=false)",errs.length===0,errs.slice(0,3));await ctx.close()}
 /* 2 · publicado (FPUB=true, forzado si la rama la tiene apagada) */
 const FPUB_RAMA=/const FPUB=true;/.test(fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8"));ok("Bandera en el index.html de la rama: FPUB="+FPUB_RAMA+" y REELNUM fedex:20",/fedex:20\}/.test(fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8")));
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
 const m1=await p.evaluate(()=>ECAPP.metrics("fedex"));ok("Ciudad con ciudad en el teléfono: 300 conexiones y 0,62 por conexión (= el modelo)",rv1==="300"&&m1[0].v==="300"&&/^0,62 paquetes por conexión/.test(m1[0].l),[rv1,m1[0].l]);
 ok("Ciudad con ciudad: 300 de 300 aviones casi vacíos (supuesto de 10 por avión, marcado)",m1[1].v==="300"&&/de 300 · 0 llenos · caben 10 paquetes \(supuesto\)/.test(m1[1].l),m1[1]);
 const lbl=await p.evaluate(()=>document.body.innerText);ok("El mapa se rotula «mapa ilustrativo»",/mapa ilustrativo/.test(lbl));
 const rv2=await run("caso=fedex&ciudades=25&paquetes=186&caben=10&regla=centro","fedex_centro");
 const m2=await p.evaluate(()=>ECAPP.metrics("fedex"));ok("Con un centro en el teléfono: 24 conexiones y 7,75 por conexión, sumar una ciudad: 1 nueva",rv2==="24"&&/^7,75 paquetes por conexión, en promedio · sumar una ciudad: 1 nueva/.test(m2[0].l),[rv2,m2[0].l]);
 ok("Con un centro: el desvío se ve como distancia extra (+ %), 0 aviones casi vacíos",/\+\d+ % de distancia por el desvío/.test(m2[1].l)&&m2[1].v==="0",m2[1]);
 const rv3=await run("caso=fedex&ciudades=50&paquetes=186&caben=10&regla=directo","fedex_50_directo");ok("50 ciudades ciudad con ciudad: 1.225 conexiones",rv3==="1.225",rv3);
 const rv4=await run("caso=fedex&ciudades=50&paquetes=186&caben=10&regla=centro","fedex_50_centro");ok("50 ciudades con un centro: 49 conexiones",rv4==="49",rv4);
 await p.evaluate(()=>document.getElementById("lang-en").click());await p.waitForTimeout(600);
 const rv5=await run("caso=fedex&ciudades=25&paquetes=186&caben=10&regla=centro","fedex_en_centro");const m5=await p.evaluate(()=>ECAPP.metrics("fedex"));
 ok("En inglés: 24 connections, 7.75 packages per connection",rv5==="24"&&/^7\.75 packages per connection/.test(m5[0].l),[rv5,m5[0].l]);
 await p.evaluate(()=>document.getElementById("lang-es").click());await p.waitForTimeout(400);
 ok("Sin desborde horizontal a 390 px",await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await run("caso=fedex&ciudades=25&paquetes=186&caben=10&regla=directo");
 await p.evaluate(()=>ECAPP.openSheet("fedex","ciencia"));await p.waitForTimeout(600);
 const sh=(await p.textContent("#sheet")).replace(/ /g," ");
 ok("«Por qué pasa» trae 300, 24, 7,75 (cálculo propio), 25 contra 1 y a Hendricks, Piccione y Tan",["300 conexiones","24 conexiones","7,75","Nuestra cuenta","la ciudad 26 agrega 25","Hendricks, Piccione y Tan"].every(x=>sh.includes(x)),sh.slice(0,160));
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
 await p.evaluate(()=>ECAPP.openSheet("fedex","reels"));await p.waitForTimeout(700);{const lst=await p.evaluate(()=>[...document.querySelectorAll("#sheet-body .mrow")].map(e=>e.textContent.replace(/\s+/g," ").trim()));ok("Publicado: aparece primero en la lista de reels: «#20 ¿Por qué FedEx manda los paquetes más lejos a propósito?»",/^#20 ?¿Por qué FedEx manda los paquetes más lejos a propósito\?/.test(lst[0]||""),lst.slice(0,2));await p.screenshot({path:path.join(CAP,"fedex_lista_reels.png")});await p.evaluate(()=>ECAPP.closeSheet());await p.waitForTimeout(400)}
 await p.evaluate(()=>{location.hash="biblioteca"});await p.waitForTimeout(800);
 {const ti=await p.textContent("#libintro");ok("Publicado: la biblioteca pasa de 45 a 49 fuentes, de dieciséis reels",/Cuarenta y nueve fuentes de dieciséis reels/.test(ti),ti.slice(0,48))}
 ok("Publicado: la biblioteca trae FedEx 1973, FedEx 2024, Hendricks, Piccione y Tan y el cálculo propio",await p.evaluate(()=>["fedex1973","fedex2024","hendricks1995","encamino_r020"].every(id=>!!document.querySelector(`#v-biblioteca [data-book="${id}"]`))));
 await p.evaluate(()=>ECAPP.openBook("hendricks1995"));await p.waitForTimeout(600);await p.screenshot({path:path.join(CAP,"fedex_libro_hendricks.png")});
 {const bk=await p.evaluate(()=>{const pg=document.querySelector(".bk-page");return{eq:!!pg.querySelector(".beq"),live:!!pg.querySelector(".blive"),story:!!pg.querySelector(".pstory"),t:pg.textContent}});
  ok("Libro de Hendricks, Piccione y Tan: historia, fórmula n − 1 ≤ C ≤ n(n − 1)/2, cuenta en vivo y páginas citadas",bk.eq&&bk.live&&bk.story&&/pp\. 84, 89 y 91/.test(bk.t)&&/Review of Economic Studies/.test(bk.t),bk.t.slice(0,120))}
 await p.evaluate(()=>{const x=document.querySelector(".bk-x");x&&x.click()});await p.waitForTimeout(300);
 await p.evaluate(()=>ECAPP.openBook("fedex1973"));await p.waitForTimeout(600);await p.screenshot({path:path.join(CAP,"fedex_libro_fedex1973.png")});
 {const bk=await p.evaluate(()=>{const pg=document.querySelector(".bk-page");return{stat:!!pg.querySelector(".bigstat"),story:!!pg.querySelector(".pstory"),link:pg.querySelector(".plink").href,t:pg.textContent}});
  ok("Libro de FedEx 1973: 186 paquetes, 25 ciudades, 14 aviones, enlace al comunicado de 2013",bk.stat&&bk.story&&/186 paquetes/.test(bk.t)&&/14 aviones/.test(bk.t)&&bk.link==="https://newsroom.fedex.com/newsroom/fedex-marks-40th-anniversary",bk.link)}
 ok("La capacidad de Memphis se dice con «puede procesar hasta» (condición de la hoja)",await p.evaluate(()=>{const s=ECAPP.SOURCES.find(x=>x.id==="fedex2024");return /puede procesar hasta 484\.000/.test(s.idea.es)&&/puede procesar hasta 484\.000/.test(ECAPP.LAB.fedex.refLine(EC.fedex(ECAPP.LAB.fedex.def)))}));
 ok("Sin errores de página (FPUB=true)",errs.length===0,errs.slice(0,3));
 console.log(`${checks.filter(Boolean).length}/${checks.length}`);await b.close();srv.close&&srv.close();process.exit(checks.every(Boolean)?0:1)})().catch(e=>{console.error(e);process.exit(1)});
