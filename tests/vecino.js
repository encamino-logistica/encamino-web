// Reel 10 · Vecino (la ruta): números contra el reel, barrido ES/EN, corrida en el teléfono y publicación.
// Uso: node tests/vecino.js   (fuerza VPUB=true para probar la versión publicada)
const {chromium}=require(process.env.PW||"playwright");const serve=require("./serve.js"),env=require("./env.js");
const checks=[];const ok=(n,c,g)=>{checks.push(!!c);console.log((c?"PASS ":"FAIL ")+n+(g!==undefined?"  → "+JSON.stringify(g):""))};
(async()=>{const srv=await serve(8794);const b=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const ctx=await b.newContext({viewport:{width:360,height:740},isMobile:true,hasTouch:true,deviceScaleFactor:2,locale:"es-CL"});
 await ctx.route("**/index.html*",async r=>{const x=await r.fetch();await r.fulfill({response:x,body:(await x.text()).replace("const VPUB=false;","const VPUB=true;")})});
 const p=await ctx.newPage();await env(p);const errs=[];p.on("pageerror",e=>errs.push(e.message));
 await p.goto("http://127.0.0.1:8794/index.html");await p.waitForTimeout(2500);
 const r=await p.evaluate(()=>{const a=EC.vecino({n:100,seed:0,pol:"vecino",d:24});return{kNN:a.kNN,k2:a.k2,kB:a.kB,cNN:a.cNN,c2:a.c2,ar:a.arregla,mes:a.extraMes}});
 ok("Reel · vecino 122,14 km, descruzada 103,57 km, mejor encontrada 100,00 km",Math.abs(r.kNN-122.14)<0.01&&Math.abs(r.k2-103.57)<0.01&&Math.abs(r.kB-100)<0.01,[r.kNN,r.k2,r.kB]);
 ok("Reel · 11 cruces en el vecino y 0 al descruzar; arregla más de 80 % del exceso",r.cNN===11&&r.c2===0&&r.ar>0.8,[r.cNN,r.c2,r.ar]);
 ok("Reel · 22,14 km × 24 días = 531 km al mes de más",Math.abs(r.mes-22.14*24)<0.5,r.mes);
 const sw=await p.evaluate(()=>{const bad=[];let n=0;const s=ECAPP.STATE.vecino,G=ECAPP.LAB.vecino.game,L=ECAPP.LAB.vecino,Dd=JSON.stringify(s);const R=/NaN|undefined|Infinity|∞|−-|--|\[object/;
  for(const lg of ["es","en"]){document.getElementById("lang-"+lg).click();
   for(const pol of ["vecino","descruzar","mejor"])for(let nn=10;nn<=150;nn+=20)for(const seed of [0,1,5,20])for(const d of [1,24,31]){const st={n:nn,seed,pol,d};n++;const c=EC.vecino(st);
    if(!(c.k2<=c.kNN+1e-9&&c.kB<=c.k2+1e-9))bad.push(["orden km",st,c.kNN,c.k2,c.kB]);if(c.c2!==0)bad.push(["cruces",st,c.c2]);
    const txt=JSON.stringify(G.metrics(st))+G.share(st)+G.ouch(st,"vecino",pol)+L.story(c,st).h+L.math.map(m=>m.s(st)).join("")+G.aha(st)+JSON.stringify(G.score(st));if(R.test(txt))bad.push([st,txt.match(R)[0]]);
    const sc=G.score(st).score;if(!(sc>=0&&sc<=1000))bad.push(["score",st,sc])}}
  document.getElementById("lang-es").click();Object.assign(s,JSON.parse(Dd));return{n,nb:bad.length,bad:bad.slice(0,5)}});
 ok(`Barrido de ${sw.n} configuraciones: km en orden, 0 cruces al descruzar, sin NaN ni textos rotos`,sw.nb===0,sw.bad);
 await p.goto("http://127.0.0.1:8794/index.html?caso=vecino&paradas=100&ciudad=0&regla=vecino");await p.waitForSelector("#play");await p.waitForTimeout(1500);
 ok("Enlace con parámetros: 100 paradas, ciudad del reel",(await p.textContent(".sit")).includes("100 paradas"),await p.textContent(".sit"));
 await p.screenshot({path:"capturas/vecino_antes.png"});
 await p.tap("#play");await p.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:60000});await p.waitForTimeout(400);
 ok("Resultado: 122,1 km con el vecino",(await p.textContent("#rv"))==="122,1",await p.textContent("#rv"));
 await p.screenshot({path:"capturas/vecino_fin.png"});
 /* 6 capitales: cifras iguales a resultados_capitales.json (medianas, 2026-11-10) */
 const V=await p.evaluate(()=>EC.VCAP);const exp={santiago:[.2249,.3893,14.2,341],cdmx:[.2347,.2966,16.1,387],buenos_aires:[.2337,.4578,14.9,357],madrid:[.262,.2517,21.1,506],bogota:[.248,.3994,18.2,436],lima:[.2411,.485,16.7,401]};
 ok("6 capitales · exceso, arregla, km/día y km/mes por ciudad = json",V.ciudades.length===6&&V.ciudades.every(c=>{const e=exp[c.id];return e&&Math.abs(c.exc-e[0])<1e-4&&Math.abs(c.arr-e[1])<1e-4&&Math.abs(c.kmDia-e[2])<0.05&&c.kmMes===e[3]}),V.ciudades.map(c=>[c.id,c.exc,c.arr,c.kmDia,c.kmMes]));
 ok("6 capitales · total: +24,3 %, arregla 36,8 %, 16,7 km/día, 400 km/mes",Math.abs(V.total.exc-.2433)<1e-4&&Math.abs(V.total.arr-.3676)<1e-4&&V.total.kmDia===16.7&&V.total.kmMes===400,V.total);
 ok("6 capitales · método: 50 días, 100 paradas, 3 km, OR-Tools 10 s, 24 días al mes",V.meta.dias===50&&V.meta.paradas===100&&V.meta.radio_km===3&&V.meta.ortools_s===10&&V.meta.dias_mes===24,V.meta);
 await p.evaluate(()=>ECAPP.openSheet("vecino","ciencia"));await p.waitForTimeout(500);
 const sh=(await p.textContent("#sheet")).replace(/\u00a0/g," ");
 ok("«Por qué pasa» muestra las 6 capitales con fuente y método, y ya no dice que descruzar «arregla la mayor parte» en calles reales",["Santiago: +22,5 %","Lima: +24,1 %","Las 6: +24,3 %","arregla 37 %","16,7 km","OpenStreetMap","WorldPop 2020","OR-Tools en 10 s","no es un óptimo demostrado","cerca de un tercio"].every(x=>sh.includes(x)),sh.slice(sh.indexOf("En calles reales"),sh.indexOf("En calles reales")+220));
 await p.screenshot({path:"capturas/vecino_capitales.png"});
 const sx=await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);ok("«Por qué pasa» sin desborde a 360 px",sx);
 await p.evaluate(()=>ECAPP.closeSheet&&ECAPP.closeSheet());
 ok("Sin desborde horizontal a 360 px",await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await p.goto("http://127.0.0.1:8794/index.html?reel=10");await p.waitForTimeout(2000);ok("?reel=10 abre #vecino",await p.evaluate(()=>location.hash)==="#vecino");
 ok("Sin errores de página",errs.length===0,errs.slice(0,3));
 console.log(`${checks.filter(Boolean).length}/${checks.length}`);await b.close();srv.close&&srv.close();process.exit(checks.every(Boolean)?0:1)})().catch(e=>{console.error(e);process.exit(1)});
