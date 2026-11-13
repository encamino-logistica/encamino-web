// Reel 13 · El CO2 de la entrega fallida (solo el furgón): números contra el reel y contra el Monte Carlo, barrido ES/EN, corrida en el teléfono y publicación.
// Uso: node tests/co2.js   (fuerza XPUB=true para probar la versión publicada)
const {chromium}=require(process.env.PW||"playwright");const serve=require("./serve.js"),env=require("./env.js");
const checks=[];const ok=(n,c,g)=>{checks.push(!!c);console.log((c?"PASS ":"FAIL ")+n+(g!==undefined?"  → "+JSON.stringify(g):""))};
(async()=>{const srv=await serve(8797);const b=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const ctx=await b.newContext({viewport:{width:360,height:740},isMobile:true,hasTouch:true,deviceScaleFactor:2,locale:"es-CL"});
 await ctx.route("**/index.html*",async r=>{const x=await r.fetch();await r.fulfill({response:x,body:(await x.text()).replace("const XPUB=false;","const XPUB=true;")})});
 const p=await ctx.newPage();await env(p);const errs=[];p.on("pageerror",e=>errs.push(e.message));
 await p.goto("http://127.0.0.1:8797/index.html");await p.waitForTimeout(2500);
 const R={P:10000,a:5,m:2,d:0.6,s:80,av:0,pol:"encendido"};
 const r=await p.evaluate(R=>EC.co2(R),R);
 ok("Reel · espera: 0,28 gal/h · 2 min · 2,676 kg/l ≈ 94,6 g",Math.abs(r.gEsp-94.56)<0.05,r.gEsp);
 ok("Reel · vuelta: 0,8·2·0,6·247 + 0,2·0,29·247 ≈ 251,4 g",Math.abs(r.gV-251.45)<0.05,r.gV);
 ok("Reel · por fallida ≈ 346 g («unos trescientos cincuenta»)",Math.abs(r.g-346.0)<0.1&&Math.round(r.g/10)*10===350,r.g);
 ok("Reel · 500 fallidas al día · 63,1 t al año («más de sesenta»)",r.fall===500&&r.t>60&&Math.abs(r.t-63.15)<0.01,[r.fall,r.t]);
 ok("Reel · 2.870 árboles con 22 kg («casi tres mil»)",Math.round(r.arb)===2870&&r.arb<3000&&r.arb>2500,r.arb);
 ok("Reel · 27,3 % se quema esperando («cerca de un cuarto»)",Math.abs(r.esp-0.2733)<0.001,r.esp);
 const mc=await p.evaluate(()=>{/* Monte Carlo independiente con las distribuciones del reel (cifras_v8.py): ralentí U(0,17;0,39) gal/h, motor U(1;3) min, d U(0,2;1,0) km, 80 % mismo día */
  const rng=EC.rngFrom(20261111),N=60000,C=EC.C2;let sg=0,se=0;for(let i=0;i<N;i++){const idle=(C.IDLO+(C.IDHI-C.IDLO)*rng())*C.GAL,mn=1+2*rng(),d=0.2+0.8*rng();
   const e=idle*mn/60*C.KGL*1000,g=rng()<0.8?e+2*d*C.VAN:e+C.SIG*C.VAN;sg+=g;se+=e}return{g:sg/N,esp:se/sg}});
 const vc=await p.evaluate(R=>{const e=EC.co2(R),v=EC.co2(Object.assign({},R,{pol:"vecino"}));return{t:v.t,ah:e.t-v.t,arb:(e.t-v.t)*1000/22}},R);
 ok("Solución del reel · vecino (Ofcom −37,5 %): 39,5 t; ahorro 23,7 t ≈ 1.076 árboles («más de mil»)",Math.abs(vc.t-63.15*0.625)<0.01&&vc.arb>1000&&vc.arb<1100,vc);
 ok("Monte Carlo (60.000 casos) cerca del valor esperado: ±1 % (el reel: 346,4 g con 200.000)",Math.abs(mc.g/r.g-1)<0.01&&Math.abs(mc.esp-r.esp)<0.01,mc);
 const ed=await p.evaluate(()=>{const bad=[];const base={P:10000,a:5,m:2,d:0.6,s:80,av:0};
  for(const pol of ["encendido","apagado","manana"])for(let m=0;m<=10;m+=0.5)for(let d=0.2;d<=3.001;d+=0.4)for(let s=0;s<=100;s+=20){const st=Object.assign({},base,{pol,m,d,s}),c=EC.co2(st),e=EC.co2(Object.assign({},st,{pol:"encendido"}));
   if(c.g<0||!isFinite(c.g))bad.push(["neg",st]);if(pol==="apagado"&&(c.gEsp!==0||c.g>e.g+1e-9))bad.push(["apagado",st]);if(pol==="manana"&&Math.abs(c.gV-EC.C2.SIG*EC.C2.VAN)>1e-9)bad.push(["manana",st]);
   const c2=EC.co2(Object.assign({},st,{av:50}));if(Math.abs(c2.t-c.t/2)>1e-9)bad.push(["avisan",st])}
  const a1=EC.co2(Object.assign({},base,{pol:"encendido",P:20000}));if(Math.abs(a1.t-2*EC.co2(Object.assign({},base,{pol:"encendido"})).t)>1e-9)bad.push(["lineal P"]);return bad.slice(0,5)});
 ok("Sin resultados tontos: apagar el motor nunca sube, mañana = 0,29 km, la mitad que avisa = la mitad del CO2, el doble de pedidos = el doble",ed.length===0,ed);
 const sw=await p.evaluate(()=>{const bad=[];let n=0;const s=ECAPP.STATE.co2,G=ECAPP.LAB.co2.game,L=ECAPP.LAB.co2,Dd=JSON.stringify(s);const RX=/NaN|undefined|Infinity|∞|−-|--|\[object/;
  for(const lg of ["es","en"]){document.getElementById("lang-"+lg).click();
   for(const pol of ["encendido","apagado","manana","vecino"])for(const P of [1000,10000,50000])for(const a of [1,5,25])for(const m of [0,2,10])for(const d of [0.2,0.6,3])for(const sm of [0,80,100])for(const av of [0,50,100]){const st={P,a,m,d,s:sm,av,pol};n++;const c=EC.co2(st);
    const txt=JSON.stringify(G.metrics(st))+G.share(st)+G.ouch(st,"encendido",pol)+JSON.stringify(L.story(c,st))+L.math.map(x=>x.s(st)).join("")+G.aha(st)+JSON.stringify(G.score(st));if(RX.test(txt))bad.push([st,txt.match(RX)[0]]);
    const sc=G.score(st).score;if(!(sc>=0&&sc<=1000))bad.push(["score",st,sc])}}
  document.getElementById("lang-es").click();Object.assign(s,JSON.parse(Dd));return{n,nb:bad.length,bad:bad.slice(0,5)}});
 ok(`Barrido de ${sw.n} configuraciones en ES y EN: sin NaN ni textos rotos, puntaje entre 0 y 1.000`,sw.nb===0,sw.bad);
 await p.goto("http://127.0.0.1:8797/index.html?caso=co2&pedidos=10000&ausentes=5&regla=encendido");await p.waitForSelector("#play");await p.waitForTimeout(1500);
 ok("Enlace con parámetros: 10.000 pedidos, 5 de cada 100, motor encendido",/10\.000 pedidos.*5 de cada 100.*motor encendido/.test(await p.textContent(".sit")),await p.textContent(".sit"));
 await p.screenshot({path:"capturas/co2_antes.png"});
 await p.tap("#play");await p.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:90000});await p.waitForTimeout(400);
 ok("Resultado del reel: 63,1 t al año",(await p.textContent("#rv"))==="63,1",await p.textContent("#rv"));
 await p.screenshot({path:"capturas/co2_reel_fin.png"});
 ok("Sin desborde horizontal a 360 px",await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await p.goto("http://127.0.0.1:8797/index.html?caso=co2&pedidos=10000&ausentes=5&regla=apagado");await p.waitForSelector("#play");await p.waitForTimeout(1200);
 await p.tap("#play");await p.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:90000});await p.waitForTimeout(300);
 ok("Motor apagado: 45,9 t al año (la espera se va)",(await p.textContent("#rv"))==="45,9",await p.textContent("#rv"));
 await p.screenshot({path:"capturas/co2_apagado_fin.png"});
  await p.goto("http://127.0.0.1:8797/index.html?caso=co2&pedidos=10000&ausentes=5&regla=vecino");await p.waitForSelector("#play");await p.waitForTimeout(1200);
 await p.tap("#play");await p.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:90000});await p.waitForTimeout(300);
 ok("Con vecino: 39,5 t al año",(await p.textContent("#rv"))==="39,5",await p.textContent("#rv"));
 await p.screenshot({path:"capturas/co2_vecino_fin.png"});
 await p.goto("http://127.0.0.1:8797/index.html?reel=13");await p.waitForTimeout(2000);ok("?reel=13 abre #co2",await p.evaluate(()=>location.hash)==="#co2");
 await p.evaluate(()=>{location.hash="biblioteca"});await p.waitForTimeout(800);const t=await p.textContent("#libintro");
 ok("Biblioteca: 40 fuentes de doce reels",/(Cuarenta|40) fuentes de doce reels/.test(t),t.slice(0,45));
 ok("Biblioteca: Gutenschwager, Argonne, IPCC, EEA, Ofcom, Australia Post, Sagawa, Kübler, Edwards y van Duin",await p.evaluate(()=>{const tx=document.body.textContent;return ["Gutenschwager","Argonne","IPCC","Agencia Europea","Ofcom","Australia Post","Sagawa","Kübler","Edwards","van Duin"].every(k=>tx.includes(k))}));
 ok("Sin errores de página",errs.length===0,errs.slice(0,3));
 console.log(`${checks.filter(Boolean).length}/${checks.length}`);await b.close();srv.close&&srv.close();process.exit(checks.every(Boolean)?0:1)})().catch(e=>{console.error(e);process.exit(1)});
