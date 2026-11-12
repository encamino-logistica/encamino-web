// Reel 12 · Ordenar antes de cargar (búsqueda secuencial de Knuth aplicada a cada parada): números contra el reel, barrido ES/EN, corrida en el teléfono y publicación.
// Uso: node tests/ordenar.js   (fuerza OPUB=true para probar la versión publicada)
const {chromium}=require(process.env.PW||"playwright");const serve=require("./serve.js"),env=require("./env.js");
const checks=[];const ok=(n,c,g)=>{checks.push(!!c);console.log((c?"PASS ":"FAIL ")+n+(g!==undefined?"  → "+JSON.stringify(g):""))};
(async()=>{const srv=await serve(8796);const b=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const ctx=await b.newContext({viewport:{width:360,height:740},isMobile:true,hasTouch:true,deviceScaleFactor:2,locale:"es-CL"});
 await ctx.route("**/index.html*",async r=>{const x=await r.fetch();await r.fulfill({response:x,body:(await x.text()).replace("const OPUB=false;","const OPUB=true;")})});
 const p=await ctx.newPage();await env(p);const errs=[];p.on("pageerror",e=>errs.push(e.message));
 await p.goto("http://127.0.0.1:8796/index.html");await p.waitForTimeout(2500);
 const r=await p.evaluate(()=>["revuelto","tercios","pilas","secuencia"].map(pol=>EC.ordenar({n:98,k:10,t:3,pol})));
 ok("Reel · 98 revueltos: 98·101/4 = 2.474,5",Math.abs(r[0].tot-2474.5)<1e-9,r[0].tot);
 ok("Reel · por tercios (33/33/32): 297 + 297 + 280 = 874",Math.abs(r[1].tot-874)<1e-9&&JSON.stringify(r[1].gr)==="[33,33,32]",[r[1].tot,r[1].gr]);
 ok("Reel · pilas de 10 (9×10 + 8): 9·32,5 + 22 = 314,5; casi 8 veces menos",Math.abs(r[2].tot-314.5)<1e-9&&r[2].veces>7.8&&r[2].veces<7.9,[r[2].tot,r[2].veces]);
 ok("Reel · secuencia exacta: 98; puntaje 100",r[3].tot===98&&Math.round(r[3].score)===100,[r[3].tot,r[3].score]);
 const mc=await p.evaluate(()=>{/* Monte Carlo independiente: posición al azar del paquete entre los m que quedan del grupo */
  const rng=EC.rngFrom(20261113),R=4000,res={};for(const [pol,k] of [["revuelto",10],["pilas",10]]){const gr=EC.oGrupos(98,pol,k);let s=0;
   for(let t=0;t<R;t++)for(const g of gr)for(let m=g;m>=1;m--)s+=1+Math.floor(rng()*m);res[pol]=s/R}return res});
 ok("Monte Carlo (4.000 rutas) cerca del exacto: revuelto ±1 %, pilas ±1 %",Math.abs(mc.revuelto/2474.5-1)<0.01&&Math.abs(mc.pilas/314.5-1)<0.01,mc);
 const ed=await p.evaluate(()=>{const G=ECAPP.LAB.ordenar.game,L=ECAPP.LAB.ordenar,bad=[];
  for(let n=10;n<=150;n++){const rv=EC.ordenar({n,pol:"revuelto"}),te=EC.ordenar({n,pol:"tercios"}),se=EC.ordenar({n,pol:"secuencia"});if(!(rv.tot>=te.tot&&te.tot>=se.tot))bad.push(["orden",n]);
   for(let k=2;k<=30;k++){const st={n,k,t:3,pol:"pilas"},pi=EC.ordenar(st);if(pi.tot>rv.tot+1e-9||pi.tot<se.tot-1e-9)bad.push(["pilas",n,k]);
    if(pi.gr.length===1){const tx=G.aha(st)+G.ouch(st,"revuelto","pilas")+JSON.stringify(L.story(pi,st));if(/1[,.]0 ?(veces|times|×)|en vez de|instead of/.test(tx))bad.push(["tonto",n,k,tx.slice(0,80)])}}}return bad.slice(0,5)});
 ok("Sin resultados tontos: revuelto ≥ tercios ≥ secuencia, pilas entre ambos, y una pila que lo junta todo se avisa como revuelto",ed.length===0,ed);
 const sw=await p.evaluate(()=>{const bad=[];let n=0;const s=ECAPP.STATE.ordenar,G=ECAPP.LAB.ordenar.game,L=ECAPP.LAB.ordenar,Dd=JSON.stringify(s);const R=/NaN|undefined|Infinity|∞|−-|--|\[object/;
  for(const lg of ["es","en"]){document.getElementById("lang-"+lg).click();
   for(const pol of ["revuelto","tercios","pilas","secuencia"])for(let nn=10;nn<=150;nn+=7)for(let kk=2;kk<=30;kk+=4)for(const tt of [1,3,20]){const st={n:nn,k:kk,t:tt,pol};n++;const c=EC.ordenar(st);
    const sum=c.gr.reduce((a,x)=>a+x,0);if(sum!==nn)bad.push(["grupos",st]);if(c.tot>c.rev+1e-9||c.tot<nn-1e-9)bad.push(["rango",st,c.tot]);
    if(Math.abs(c.porParada.reduce((a,x)=>a+x,0)-c.tot)>1e-6)bad.push(["porParada",st]);
    const txt=JSON.stringify(G.metrics(st))+G.share(st)+G.ouch(st,"revuelto",pol)+JSON.stringify(L.story(c,st))+L.math.map(m=>m.s(st)).join("")+G.aha(st)+JSON.stringify(G.score(st));if(R.test(txt))bad.push([st,txt.match(R)[0]]);
    const sc=G.score(st).score;if(!(sc>=0&&sc<=1000))bad.push(["score",st,sc])}}
  document.getElementById("lang-es").click();Object.assign(s,JSON.parse(Dd));return{n,nb:bad.length,bad:bad.slice(0,5)}});
 ok(`Barrido de ${sw.n} configuraciones: grupos completos, entre n y n(n+3)/4, sin NaN ni textos rotos`,sw.nb===0,sw.bad);
 await p.goto("http://127.0.0.1:8796/index.html?caso=ordenar&paquetes=98&regla=revuelto");await p.waitForSelector("#play");await p.waitForTimeout(1500);
 ok("Enlace con parámetros: 98 paquetes, carga revuelta",/98 paquetes.*revuelta/.test(await p.textContent(".sit")),await p.textContent(".sit"));
 await p.screenshot({path:"capturas/ordenar_antes.png"});
 await p.tap("#play");await p.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:90000});await p.waitForTimeout(400);
 ok("Resultado revuelto: 2.475 revisiones",(await p.textContent("#rv"))==="2.475",await p.textContent("#rv"));
 await p.screenshot({path:"capturas/ordenar_revuelto_fin.png"});
 ok("Sin desborde horizontal a 360 px",await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await p.goto("http://127.0.0.1:8796/index.html?caso=ordenar&paquetes=98&pila=10&regla=pilas");await p.waitForSelector("#play");await p.waitForTimeout(1200);
 await p.tap("#play");await p.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:90000});await p.waitForTimeout(300);
 ok("Pilas de 10: 315 revisiones (314,5)",(await p.textContent("#rv"))==="315",await p.textContent("#rv"));
 await p.screenshot({path:"capturas/ordenar_pilas_fin.png"});
 await p.goto("http://127.0.0.1:8796/index.html?reel=12");await p.waitForTimeout(2000);ok("?reel=12 abre #ordenar",await p.evaluate(()=>location.hash)==="#ordenar");
 await p.evaluate(()=>{location.hash="biblioteca"});await p.waitForTimeout(800);
 ok("Biblioteca: Knuth y Bortfeldt en el estante Última milla",await p.evaluate(()=>{const tx=document.body.textContent;return /Knuth/.test(tx)&&/Bortfeldt/.test(tx)}));
 ok("Sin errores de página",errs.length===0,errs.slice(0,3));
 console.log(`${checks.filter(Boolean).length}/${checks.length}`);await b.close();srv.close&&srv.close();process.exit(checks.every(Boolean)?0:1)})().catch(e=>{console.error(e);process.exit(1)});
