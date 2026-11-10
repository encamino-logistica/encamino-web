// Reel 9 · Bodegas (raíz cuadrada de Maister, correlación de Eppen): números contra el reel, barrido ES/EN, corrida en el teléfono y publicación.
// Uso: node tests/bodegas.js   (fuerza BPUB=true para probar la versión publicada)
const {chromium}=require(process.env.PW||"playwright");const serve=require("./serve.js"),env=require("./env.js");
const checks=[];const ok=(n,c,g)=>{checks.push(!!c);console.log((c?"PASS ":"FAIL ")+n+(g!==undefined?"  → "+JSON.stringify(g):""))};
(async()=>{const srv=await serve(8794);const b=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const ctx=await b.newContext({viewport:{width:360,height:740},isMobile:true,hasTouch:true,deviceScaleFactor:2,locale:"es-CL"});
 await ctx.route("**/index.html*",async r=>{const x=await r.fetch();await r.fulfill({response:x,body:(await x.text()).replace("const BPUB=false;","const BPUB=true;")})});
 const p=await ctx.newPage();await env(p);const errs=[];p.on("pageerror",e=>errs.push(e.message));
 await p.goto("http://127.0.0.1:8794/index.html");await p.waitForTimeout(2500);
 const r=await p.evaluate(()=>[EC.bodegas({n:4,b:100,rho:0,pol:"juntas",c:20}),EC.bodegas({n:4,b:100,rho:100,pol:"juntas"}),EC.bodegas({n:9,b:100,rho:0,pol:"juntas"}),EC.bodegas({n:4,b:100,rho:0,pol:"separadas"}),EC.bodegas({n:4,b:100,rho:50,pol:"juntas"})]);
 ok("Reel · 4 bodegas de 100: separadas 400, juntas 200, ahorro 200",r[0].sep===400&&Math.abs(r[0].jun-200)<1e-9&&Math.abs(r[0].ahorro-200)<1e-9,[r[0].sep,r[0].jun]);
 ok("Reel · puntaje 100; separadas 50; 9 ciudades (√9 = 3) gana con 300 de 900",Math.round(r[0].score)===100&&Math.round(r[3].score)===50&&Math.abs(r[2].jun-300)<1e-9&&r[2].score>100,[r[0].score,r[3].score,r[2].jun,r[2].score]);
 ok("Eppen · ρ = 100 % no ahorra (400); ρ = 50 % da 100·√10 = 316,2",Math.abs(r[1].jun-400)<1e-9&&Math.abs(r[4].jun-100*Math.sqrt(10))<1e-9,[r[1].jun,r[4].jun]);
 const sw=await p.evaluate(()=>{const bad=[];let n=0;const s=ECAPP.STATE.bodegas,G=ECAPP.LAB.bodegas.game,L=ECAPP.LAB.bodegas,Dd=JSON.stringify(s);const R=/NaN|undefined|Infinity|∞|−-|--|\[object/;
  for(const lg of ["es","en"]){document.getElementById("lang-"+lg).click();
   for(const pol of ["separadas","juntas"])for(let nn=1;nn<=9;nn++)for(let bb=20;bb<=500;bb+=40)for(let rho=0;rho<=100;rho+=25){const st={n:nn,b:bb,rho,c:20,pol};n++;const c=EC.bodegas(st);
    const exp=bb*Math.sqrt(nn+nn*(nn-1)*rho/100);if(Math.abs(c.jun-exp)>1e-9||c.jun>c.sep+1e-9)bad.push(["jun",st]);
    const txt=JSON.stringify(G.metrics(st))+G.share(st)+G.ouch(st,pol==="juntas"?"separadas":"juntas",pol)+JSON.stringify(L.story(c,st))+L.math.map(m=>m.s(st)).join("")+G.aha(st)+JSON.stringify(G.score(st));if(R.test(txt))bad.push([st,txt.match(R)[0]]);
    const sc=G.score(st).score;if(!(sc>=0&&sc<=1000))bad.push(["score",st,sc])}}
  document.getElementById("lang-es").click();Object.assign(s,JSON.parse(Dd));return{n,nb:bad.length,bad:bad.slice(0,5)}});
 ok(`Barrido de ${sw.n} configuraciones: sin NaN ni textos rotos`,sw.nb===0,sw.bad);
 await p.goto("http://127.0.0.1:8794/index.html?caso=bodegas&ciudades=4&stock=100&regla=juntas");await p.waitForSelector("#play");await p.waitForTimeout(1500);
 ok("Enlace con parámetros: 4 ciudades, 100 cajas, central",/4 ciudades · 100 cajas.*central/.test(await p.textContent(".sit")),await p.textContent(".sit"));
 await p.screenshot({path:"capturas/bodegas_antes.png"});
 await p.tap("#play");await p.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:60000});await p.waitForTimeout(400);
 ok("Resultado: 200 cajas en la central",(await p.textContent("#rv"))==="200"&&/200 cajas/.test(await p.textContent("body")),await p.textContent("#rv"));
 await p.screenshot({path:"capturas/bodegas_fin.png"});
 ok("Sin desborde horizontal a 360 px",await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await p.goto("http://127.0.0.1:8794/index.html?caso=bodegas&ciudades=4&parecido=80&regla=separadas");await p.waitForSelector("#play");await p.waitForTimeout(1200);
 await p.tap("#play");await p.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:60000});await p.waitForTimeout(300);
 ok("Separadas: 400 cajas en 4 bodegas",(await p.textContent("#rv"))==="400",await p.textContent("#rv"));
 await p.screenshot({path:"capturas/bodegas_separadas.png"});
 await p.goto("http://127.0.0.1:8794/index.html?reel=9");await p.waitForTimeout(2000);ok("?reel=9 abre #bodegas",await p.evaluate(()=>location.hash)==="#bodegas");
 await p.evaluate(()=>{location.hash="biblioteca"});await p.waitForTimeout(800);const t=await p.textContent("#libintro");ok("Biblioteca: 27 fuentes de nueve reels",/Veintisiete fuentes de nueve reels/.test(t),t.slice(0,45));
 ok("Biblioteca: Maister y Eppen en el estante Bodega",await p.evaluate(()=>{const tx=document.body.textContent;return /Maister/.test(tx)&&/Eppen/.test(tx)}));
 ok("Sin errores de página",errs.length===0,errs.slice(0,3));
 console.log(`${checks.filter(Boolean).length}/${checks.length}`);await b.close();srv.close&&srv.close();process.exit(checks.every(Boolean)?0:1)})().catch(e=>{console.error(e);process.exit(1)});
