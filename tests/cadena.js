// Reel 8 · Cadena (pedido perfecto): números contra el reel, barrido ES/EN, corrida en el teléfono y publicación.
// Uso: node tests/cadena.js   (fuerza CPUB=true para probar la versión publicada)
const {chromium}=require(process.env.PW||"playwright");const serve=require("./serve.js"),env=require("./env.js");
const checks=[];const ok=(n,c,g)=>{checks.push(!!c);console.log((c?"PASS ":"FAIL ")+n+(g!==undefined?"  → "+JSON.stringify(g):""))};
(async()=>{const srv=await serve(8793);const b=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const ctx=await b.newContext({viewport:{width:360,height:740},isMobile:true,hasTouch:true,deviceScaleFactor:2,locale:"es-CL"});
 await ctx.route("**/index.html*",async r=>{const x=await r.fetch();await r.fulfill({response:x,body:(await x.text()).replace("const CPUB=false;","const CPUB=true;")})});
 const p=await ctx.newPage();await env(p);const errs=[];p.on("pageerror",e=>errs.push(e.message));
 await p.goto("http://127.0.0.1:8793/index.html");await p.waitForTimeout(2500);
 const r=await p.evaluate(()=>[EC.cadena({p:95,n:4,m:1000,pol:"indep"}),EC.cadena({p:95,n:4,m:1000,pol:"juntas"}),EC.cadena({p:99,n:4,m:1000,pol:"indep"})]);
 ok("Reel · 0,95⁴ = 81,45 %, 18,55 con problema, cada etapa necesita 98,73 %",Math.abs(r[0].perf-0.81450625)<1e-9&&Math.abs(r[0].you-18.549375)<1e-6&&Math.abs(r[0].need-0.98726)<1e-5,[r[0].perf,r[0].you,r[0].need]);
 ok("Reel · puntaje 100 y válido; fallas juntas = 95 % y no cuenta; 99 % gana",Math.round(r[0].score)===100&&r[0].valid&&Math.abs(r[1].perf-0.95)<1e-12&&!r[1].valid&&r[2].score>100,[r[0].score,r[1].perf,r[1].valid,r[2].score]);
 const sw=await p.evaluate(()=>{const bad=[];let n=0;const s=ECAPP.STATE.cadena,G=ECAPP.LAB.cadena.game,L=ECAPP.LAB.cadena,Dd=JSON.stringify(s);const R=/NaN|undefined|Infinity|∞|−-|--|\[object/;
  for(const lg of ["es","en"]){document.getElementById("lang-"+lg).click();
   for(const pol of ["indep","juntas"])for(let p=80;p<=100;p+=0.5)for(let nn=1;nn<=10;nn++)for(const m of [100,1000,20000]){const st={p,n:nn,m,pol};n++;const c=EC.cadena(st);
    const exp=pol==="juntas"?p/100:Math.pow(p/100,nn);if(Math.abs(c.perf-exp)>1e-12)bad.push(["perf",st]);
    const txt=JSON.stringify(G.metrics(st))+G.share(st)+G.ouch(st,pol==="indep"?"juntas":"indep",pol)+L.story(c,st).h+L.math.map(m=>m.s(st)).join("")+G.aha(st)+JSON.stringify(G.score(st));if(R.test(txt))bad.push([st,txt.match(R)[0]]);
    const sc=G.score(st).score;if(!(sc>=0&&sc<=1000))bad.push(["score",st,sc])}}
  document.getElementById("lang-es").click();Object.assign(s,JSON.parse(Dd));return{n,nb:bad.length,bad:bad.slice(0,5)}});
 ok(`Barrido de ${sw.n} configuraciones: sin NaN ni textos rotos`,sw.nb===0,sw.bad);
 await p.goto("http://127.0.0.1:8793/index.html?caso=cadena&etapa=95&etapas=4");await p.waitForSelector("#play");await p.waitForTimeout(1500);
 ok("Enlace con parámetros: 4 etapas al 95 %",(await p.textContent(".sit")).includes("4 etapas al 95"),await p.textContent(".sit"));
 await p.screenshot({path:"capturas/cadena_antes.png"});
 await p.tap("#play");await p.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:60000});await p.waitForTimeout(400);
 ok("Resultado: 81,5 % perfectos y la corrida muestra 81 de 100",(await p.textContent("#rv"))==="81,5"&&/81 de 100/.test(await p.textContent("body")),await p.textContent("#rv"));
 await p.screenshot({path:"capturas/cadena_fin.png"});
 ok("Sin desborde horizontal a 360 px",await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await p.goto("http://127.0.0.1:8793/index.html?reel=8");await p.waitForTimeout(2000);ok("?reel=8 abre #cadena",await p.evaluate(()=>location.hash)==="#cadena");
 await p.evaluate(()=>{location.hash="biblioteca"});await p.waitForTimeout(800);const t=await p.textContent("#libintro");const bp=await p.evaluate(()=>!!ECAPP.dev.PUBLICADO.bodegas),vp=await p.evaluate(()=>!!ECAPP.dev.PUBLICADO.vecino);ok(vp?"Biblioteca: 28 fuentes de diez reels (vecino publicada)":bp?"Biblioteca: 27 fuentes de nueve reels (bodegas publicada)":"Biblioteca: 25 fuentes de ocho reels",vp?/(Veintiocho|28) fuentes de diez reels/.test(t):bp?/Veintisiete fuentes de nueve reels/.test(t):/Veinticinco fuentes de ocho reels/.test(t),t.slice(0,45));
 ok("Sin errores de página",errs.length===0,errs.slice(0,3));
 console.log(`${checks.filter(Boolean).length}/${checks.length}`);await b.close();srv.close&&srv.close();process.exit(checks.every(Boolean)?0:1)})().catch(e=>{console.error(e);process.exit(1)});
