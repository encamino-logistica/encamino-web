// Reel 14 · ¿Cuándo conviene el locker? (furgón contra furgón, Hovi y Bø 2024): números contra el reel y la tabla, palancas, casos tontos,
// barrido ES/EN, enlaces, 390 px y 1280 px, biblioteca y publicación.
// Uso: node tests/locker.js   (fuerza LPUB=true para probar la versión publicada; el estado real de la bandera se prueba aparte)
const {chromium}=require(process.env.PW||"playwright");const serve=require("./serve.js"),env=require("./env.js");
const checks=[];const ok=(n,c,g)=>{checks.push(!!c);console.log((c?"PASS ":"FAIL ")+n+(g!==undefined?"  → "+JSON.stringify(g):""))};
const U="http://127.0.0.1:8798/index.html";const SRCJS=require("fs").readFileSync(require("path").resolve(__dirname,"../src/content.js"),"utf8");
(async()=>{const srv=await serve(8798);const b=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const pubRoute=async ctx=>ctx.route("**/index.html*",async r=>{const x=await r.fetch();await r.fulfill({response:x,body:(await x.text()).replace("const LPUB=false;","const LPUB=true;")})});
 const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,locale:"es-CL",permissions:["clipboard-read","clipboard-write"]});await pubRoute(ctx);
 const p=await ctx.newPage();await env(p);const errs=[];p.on("pageerror",e=>errs.push(e.message));
 await p.goto(U);await p.waitForTimeout(2500);
 /* 1 · el modelo contra la tabla 3.3 y la tabla 4.1 */
 const R=await p.evaluate(()=>{const o=pol=>EC.locker({k:5,dist:"300",u:100,pol});return{d:o("domicilio"),l:o("locker"),m:o("mixta")}});
 ok("Tabla 3.3 · domicilio sin firma: 95 s + 50 s por parada y 1,33 km a 17,2 km/h = 7,056 min por paquete",Math.abs(R.d.tH-7.0562)<0.0005,R.d.tH);
 ok("Tabla 3.3 · locker con 5: 148 s / 5 + 30 s y 0,93 km a 23,1 km/h = 3,409 min por paquete",Math.abs(R.l.tL-3.4089)<0.0005,R.l.tL);
 ok("Reel · 63 paquetes por viaje a domicilio sin firma (⌊450 / 7,056⌋, sin calibrar)",R.d.n===63&&R.d.nHt===63,R.d.n);
 ok("Reel · 132 paquetes por viaje con 5 por locker (⌊450 / 3,409⌋, sin calibrar)",R.l.n===132&&R.l.nLt===132,R.l.n);
 ok("Reel · 355 ÷ 63 = 5,63–5,64 € por paquete a domicilio",R.d.c>=5.63&&R.d.c<=5.645&&Math.abs(R.d.c-355/63)<1e-12,R.d.c);
 ok("Reel · 364 ÷ 132 = 2,76 € por paquete en locker (el estudio publica 2,80; la tabla 4.2 suma 2,51)",Math.abs(R.l.c-2.7576)<0.0001&&Math.abs(R.l.ref-R.l.c)<1e-12,R.l.c);
 ok("Reel · «más de 2 veces» por paquete y por turno",R.d.c/R.l.c>2&&R.l.n/R.d.n>2,[R.d.c/R.l.c,R.l.n/R.d.n]);
 ok("Reel · uso del furgón con 132 paquetes de 27,3 dm³ ≈ 32 % (la tabla 4.1 dice 33 %)",Math.abs(R.l.usoL-0.32)<0.01,R.l.usoL);
 /* 2 · las tres distancias (encuesta PostNord citada por el estudio, intención declarada) */
 const Dd=await p.evaluate(()=>["300","500","1000"].map(d=>{const r=EC.locker({k:5,dist:d,u:100,pol:"mixta"});return{acc:r.acc,p:r.p,n:r.n,c:r.c}}));
 ok("Distancias: 300 m → 47 %, 500 m → 33 %, 1 km → 14 %",Dd[0].acc===47&&Dd[1].acc===33&&Dd[2].acc===14,Dd.map(x=>x.acc));
 ok("Ruta mixta: más distancia nunca baja el costo ni sube la aceptación; queda entre locker y domicilio",Dd[0].p>=Dd[1].p&&Dd[1].p>=Dd[2].p&&Dd[0].c<=Dd[1].c&&Dd[1].c<=Dd[2].c&&Dd.every(x=>x.c>R.l.c&&x.c<R.d.c),Dd);
 /* 3 · casos tontos */
 const T1=await p.evaluate(()=>{const G=ECAPP.LAB.locker.game,r=EC.locker({k:1,dist:"300",u:100,pol:"locker"});return{c:r.c,n:r.n,aha:G.aha({k:1,dist:"300",u:100,pol:"locker"})}});
 ok("1 por locker: sale más barato que domicilio y el texto explica por qué (1,06 contra 1,33 km; 23,1 contra 17,2 km/h; el estudio dice lo mismo)",T1.c<R.d.c&&/Aun con 1 por locker/.test(T1.aha)&&/1,06/.test(T1.aha)&&/17,2/.test(T1.aha),[T1.n,T1.c,T1.aha]);
 const T0=await p.evaluate(()=>{const G=ECAPP.LAB.locker.game,st={k:5,dist:"1000",u:0,pol:"mixta"},r=EC.locker(st);return{n:r.n,c:r.c,p:r.p,aha:G.aha(st)}});
 ok("0 % de clientes en la ruta mixta: es la ruta a domicilio (63 y 5,63) y el texto lo dice",T0.p===0&&T0.n===63&&Math.abs(T0.c-355/63)<1e-12&&/Si nadie usa el locker/.test(T0.aha),T0);
 const T50=await p.evaluate(()=>{const G=ECAPP.LAB.locker.game,st={k:50,dist:"300",u:100,pol:"locker"},r=EC.locker(st);return{n:r.n,nt:r.nLt,cap:r.capL,lleno:r.lleno,aha:G.aha(st),note:G.metrics(st)[0].note}});
 ok("50 por locker: el furgón de 14 m³ se llena (410) y avisa que hoy el promedio es 5",T50.n===410&&T50.cap===410&&T50.lleno&&/hoy el promedio es 5/.test(T50.aha)&&/se llenó/.test(T50.note),T50);
 /* 4 · monotonía y barrido de todas las combinaciones de palancas */
 const MO=await p.evaluate(()=>{const bad=[];for(const pol of ["locker","mixta","domicilio"])for(const d of ["300","500","1000"])for(let u=0;u<=100;u+=10){let pc=Infinity,pn=0;for(let k=1;k<=50;k++){const r=EC.locker({k,dist:d,u,pol});if(r.c>pc+1e-12||r.n<pn)bad.push([pol,d,u,k]);pc=r.c;pn=r.n}}
  for(let k=1;k<=50;k++)for(let u=0;u<=100;u+=10){const a=["300","500","1000"].map(d=>EC.locker({k,dist:d,u,pol:"mixta"}));if(!(a[0].p>=a[1].p&&a[1].p>=a[2].p&&a[0].c<=a[1].c+1e-12&&a[1].c<=a[2].c+1e-12))bad.push(["dist",k,u])}
  for(let k=1;k<=50;k++)for(let u=10;u<=100;u+=10){const a=EC.locker({k,dist:"300",u:u-10,pol:"mixta"}),c=EC.locker({k,dist:"300",u,pol:"mixta"});if(c.c>a.c+1e-12)bad.push(["u",k,u])}return bad.slice(0,5)});
 ok("Monotonía: más paquetes por locker nunca sube el costo ni baja los paquetes; más distancia nunca sube la aceptación; más uso real nunca sube el costo",MO.length===0,MO);
 const sw=await p.evaluate(()=>{const bad=[];let n=0;const s=ECAPP.STATE.locker,G=ECAPP.LAB.locker.game,L=ECAPP.LAB.locker,D0=JSON.stringify(s);const RX=/NaN|undefined|Infinity|∞|−-|--|\[object|null/;
  for(const lg of ["es","en"]){document.getElementById("lang-"+lg).click();
   for(const pol of ["domicilio","locker","mixta"])for(let k=1;k<=50;k++)for(const dist of ["300","500","1000"])for(let u=0;u<=100;u+=10){const st={k,dist,u,pol};n++;const r=EC.locker(st);
    const txt=JSON.stringify(G.metrics(st))+G.share(st)+G.ouch(st,"locker",pol)+JSON.stringify(L.story(r,st))+L.math.map(x=>x.s(st)).join("")+G.aha(st)+JSON.stringify(G.score(st));if(RX.test(txt))bad.push([st,txt.match(RX)[0]]);
    for(const v of [r.n,r.c,r.nH,r.nL,r.nM,r.cH,r.cL,r.cM,r.p])if(!isFinite(v)||v<0)bad.push(["num",st,v]);
    if(!(r.n>=1&&r.n<=Math.max(r.capH,r.capL)))bad.push(["n",st,r.n]);
    if(r.cL>r.cH+1e-12)bad.push(["locker peor que domicilio",st]);if(r.cM<r.cL-1e-12||r.cM>r.cH+1e-12)bad.push(["mixta fuera de rango",st]);
    if(pol==="domicilio"&&(r.n!==63||Math.abs(r.c-355/63)>1e-12))bad.push(["domicilio cambia con las palancas",st]);
    const sc=G.score(st).score;if(!(sc>=0&&sc<=1000))bad.push(["score",st,sc]);
    /* textos contradictorios: el número grande, la frase y la nota dicen lo mismo */
    const m=G.metrics(st)[0],sh=G.share(st),c2=r.c.toLocaleString(lg==="en"?"en-US":"es-CL",{minimumFractionDigits:2,maximumFractionDigits:2});if(m.v!==c2||!sh.includes(c2+" €")||!JSON.stringify(L.story(r,st)).includes(c2+" €"))bad.push(["texto",st,m.v,c2]);
    if(lg==="es"&&/más barato/.test(G.aha(st))&&r.c>=r.cH)bad.push(["dice más barato",st])}}
  document.getElementById("lang-es").click();Object.assign(s,JSON.parse(D0));return{n,nb:bad.length,bad:bad.slice(0,5)}});
 ok(`Barrido de ${sw.n} configuraciones (3 reglas × 50 por locker × 3 distancias × 11 usos, ES y EN): sin NaN, negativos ni textos contradictorios`,sw.nb===0,sw.bad);
 /* 5 · la página en el teléfono (390 px) */
 await p.goto(U+"?caso=locker&porlocker=5&regla=locker");await p.waitForSelector("#play");await p.waitForTimeout(1500);
 ok("?caso=locker con parámetros: 5 por locker",/14 m³.*turno de 8 horas.*5 paquetes por locker/.test(await p.textContent(".sit")),await p.textContent(".sit"));
 await p.screenshot({path:"capturas/locker_antes.png"});
 await p.tap("#play");await p.waitForTimeout(3200);await p.screenshot({path:"capturas/locker_simulando.png"});
 await p.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:90000});await p.waitForTimeout(500);
 ok("Resultado del reel: 2,76 € por paquete y 132 paquetes",(await p.textContent("#rv"))==="2,76"&&/132/.test(await p.textContent(".r2")),[await p.textContent("#rv"),await p.textContent(".r2")]);
 const note=await p.textContent(".rnote");
 ok("La tarjeta muestra % frente al reel, veredicto y la discrepancia 2,76–2,80 (2,80 publicado, 2,51 en otra tabla)",/Frente al reel: 100 %/.test(note)&&/Igual que el reel/.test(note)&&/2,76–2,80/.test(note)&&/2,51/.test(note)&&/5,63–5,64/.test(note),note);
 ok("Sin «Esta partida… el grande es el promedio» (el modelo no tiene azar)",!(await p.$(".robs")));
 await p.screenshot({path:"capturas/locker_reel_fin.png"});
 await p.tap("#copyres");await p.waitForTimeout(300);const clip=await p.evaluate(()=>navigator.clipboard.readText().catch(()=>""));
 ok("Copiar resultado: frase, % frente al reel, veredicto y el link ?caso=locker (como los demás labs)",/132 paquetes dejando 5 por locker: 2,76 €/.test(clip)&&/Frente al reel: 100 %/.test(clip)&&/\?caso=locker&/.test(clip),clip);
 ok("Sin desborde horizontal a 390 px",await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await p.goto(U+"?caso=locker&regla=domicilio");await p.waitForSelector("#play");await p.waitForTimeout(1200);await p.tap("#play");await p.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:90000});await p.waitForTimeout(300);
 ok("A domicilio: 5,63 € (355 ÷ 63) y 63 paquetes; la tarjeta dice que el estudio publica 5,64",(await p.textContent("#rv"))==="5,63"&&/63/.test(await p.textContent(".r2"))&&/publica 5,64/.test(await p.textContent(".rnote")),await p.textContent("#rv"));
 await p.goto(U+"?caso=locker&regla=mixta&metros=300&usan=100");await p.waitForSelector("#play");await p.waitForTimeout(1200);
 ok("Ruta mixta a 300 m: 47 de cada 100 al locker",/300 m: 47 de cada 100 al locker/.test(await p.textContent(".sit")),await p.textContent(".sit"));
 await p.tap("#play");await p.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:90000});await p.waitForTimeout(300);
 ok("Ruta mixta a 300 m: 4,28 € (0,47 · 2,76 + 0,53 · 5,63) y 84 paquetes",(await p.textContent("#rv"))==="4,28"&&/84/.test(await p.textContent(".r2")),await p.textContent("#rv"));
 await p.screenshot({path:"capturas/locker_mixta_fin.png"});
 await p.evaluate(()=>document.querySelector('[data-sheet="ciencia"]').click());await p.waitForTimeout(700);
 const sci=await p.textContent("#sheet-body");ok("Por qué pasa: la cuenta con 450 min, 7,06 y 3,41 min, 63 y 132, 355 y 364 €, y «simulación de En Camino»",/450/.test(sci)&&/7,06/.test(sci)&&/3,41/.test(sci)&&/63/.test(sci)&&/132/.test(sci)&&/simulación de En Camino/.test(sci)&&/intención declarada/.test(sci),sci.slice(0,80));
 await p.screenshot({path:"capturas/locker_porque.png"});
 await p.goto(U+"?caso=locker");await p.waitForSelector("#play");await p.waitForTimeout(1000);await p.evaluate(()=>document.querySelector('[data-sheet="ajustar"]').click());await p.waitForTimeout(700);
 await p.evaluate(()=>document.querySelectorAll("#sheet-body details").forEach(d=>d.open=true));await p.waitForTimeout(300);
 const aj=await p.textContent("#sheet-body");ok("Cambiar los números: paquetes por locker, distancia 300 m / 500 m / 1 km y la perilla extra",/Paquetes que deja en cada locker/.test(aj)&&/300 m/.test(aj)&&/1 km/.test(aj)&&/lo hacen de verdad/.test(aj),aj.slice(0,60));
 await p.screenshot({path:"capturas/locker_numeros.png",fullPage:false});
 await p.goto(U+"?reel=14");await p.waitForTimeout(2000);ok("?reel=14 abre #locker",await p.evaluate(()=>location.hash)==="#locker");
 await p.evaluate(()=>{location.hash="biblioteca"});await p.waitForTimeout(800);const t=await p.textContent("#libintro");
 const apL=await p.evaluate(()=>!!ECAPP.dev.PUBLICADO.aire);ok(apL?"Biblioteca: 43 fuentes de catorce reels (ES, aire publicada)":"Biblioteca: 41 fuentes de trece reels (ES)",apL?/Cuarenta y tres fuentes de catorce reels/.test(t):/Cuarenta y una fuentes de trece reels/.test(t),t.slice(0,48));
 ok("Biblioteca: ficha de Hovi y Bø con el DOI, y PostNord solo como nota dentro de ella",await p.evaluate(()=>{const tx=document.body.textContent;return tx.includes("Hovi y Bø")&&tx.includes("Unlocking the potential")})&&/id:"hovi2024"[^\n]*url:"https:\/\/doi\.org\/10\.1016\/j\.sftr\.2024\.100189"/.test(SRCJS)&&/id:"hovi2024"[^\n]*labs:\["locker"\]/.test(SRCJS)&&/citada por el estudio/.test(SRCJS)&&(SRCJS.match(/PostNord/g)||[]).length>=1&&!/id:"postnord/.test(SRCJS));
 await p.evaluate(()=>document.getElementById("lang-en").click());await p.waitForTimeout(400);const te=await p.textContent("#libintro");
 ok(apL?"Library: forty-three sources from fourteen reels (EN, aire published)":"Library: forty-one sources from thirteen reels (EN)",(apL?/Forty-three sources from fourteen reels/:/Forty-one sources from thirteen reels/).test(te),te.slice(0,48));
 await p.evaluate(()=>document.getElementById("lang-es").click());
 ok("Sin errores de página (390 px)",errs.length===0,errs.slice(0,3));
 /* 6 · escritorio 1280 px */
 const cd=await b.newContext({viewport:{width:1280,height:800},locale:"es-CL"});await pubRoute(cd);const d=await cd.newPage();await env(d);const errd=[];d.on("pageerror",e=>errd.push(e.message));
 await d.goto(U+"?caso=locker&regla=locker");await d.waitForSelector("#play");await d.waitForTimeout(1500);await d.click("#play");await d.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:90000});await d.waitForTimeout(500);
 ok("1280 px: resultado 2,76 y sin desborde",(await d.textContent("#rv"))==="2,76"&&await d.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),await d.textContent("#rv"));
 await d.screenshot({path:"capturas/locker_escritorio.png"});
 await d.evaluate(()=>document.getElementById("lang-en").click());await d.waitForTimeout(400);await d.goto(U+"?caso=locker&regla=mixta&metros=1000");await d.waitForSelector("#play");await d.waitForTimeout(1200);
 ok("1280 px en inglés: 1 km → 14 out of 100",/1 km away: 14 out of 100 to the locker/.test(await d.textContent(".sit")),await d.textContent(".sit"));
 await d.screenshot({path:"capturas/locker_escritorio_en.png"});
 ok("Sin errores de página (1280 px)",errd.length===0,errd.slice(0,3));
 /* 7 · la bandera tal como está en el archivo: con LPUB=false el laboratorio se abre solo con ?caso=locker */
 const cr=await b.newContext({viewport:{width:390,height:844},locale:"es-CL"});const q=await cr.newPage();await env(q);const errq=[];q.on("pageerror",e=>errq.push(e.message));
 await q.goto(U);await q.waitForTimeout(1500);const LP=await q.evaluate(()=>!!ECAPP.dev.PUBLICADO.locker);
 await q.goto(U+"?reel=14");await q.waitForTimeout(1500);const h14=await q.evaluate(()=>location.hash);
 await q.goto(U+"?caso=locker");await q.waitForTimeout(1500);const hc=await q.evaluate(()=>location.hash);
 await q.evaluate(()=>{location.hash="biblioteca"});await q.waitForTimeout(800);const tq=await q.textContent("#libintro");
 ok(LP?(apL?"LPUB=true: ?reel=14 abre, 43 fuentes de catorce reels (aire publicada)":"LPUB=true: ?reel=14 abre, 41 fuentes de trece reels"):(apL?"LPUB=false: ?reel=14 no abre, ?caso=locker sí, biblioteca en 41 de trece (aire publicada) y sin Hovi":"LPUB=false: ?reel=14 no abre, ?caso=locker sí, biblioteca sigue en 40 de doce y sin Hovi"),LP?h14==="#locker"&&(apL?/Cuarenta y tres fuentes de catorce/:/Cuarenta y una fuentes de trece/).test(tq):h14!=="#locker"&&hc==="#locker"&&(apL?/Cuarenta y una fuentes de trece/:/Cuarenta fuentes de doce/).test(tq)&&!/Hovi/.test(await q.textContent("#shelves")),[LP,h14,hc,tq.slice(0,40)]);
 ok("Sin errores de página (bandera real)",errq.length===0,errq.slice(0,3));
 console.log(`${checks.filter(Boolean).length}/${checks.length}`);await b.close();srv.close&&srv.close();process.exit(checks.every(Boolean)?0:1)})().catch(e=>{console.error(e);process.exit(1)});
