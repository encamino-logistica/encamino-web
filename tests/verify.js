// Verificación con Playwright: números contra los reels, modo juego para celular (navegador de Instagram),
// links por reel, hojas inferiores, compartir, biblioteca y capturas.
// Uso: node tests/verify.js   (THREE_JS, FONTS_DIR y PW opcionales: ver tests/env.js)
const {chromium}=require(process.env.PW||"playwright");
const fs=require("fs"),path=require("path");
const serve=require("./serve.js"),env=require("./env.js"),filaSweep=require("./fila_sweep.js");
const OUT=path.resolve(__dirname,"../capturas");fs.mkdirSync(OUT,{recursive:true});
for(const f of fs.readdirSync(OUT))fs.unlinkSync(path.join(OUT,f));
const IG="Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 330.0.0.0 (iPhone14,5; iOS 17_5; es_CL; es; scale=3.00; 1170x2532)";
const checks=[];
function ok(name,cond,got){checks.push({name,pass:!!cond,got});console.log((cond?"PASS ":"FAIL ")+name+(got!==undefined?"  → "+JSON.stringify(got):""))}
const near=(a,b,t)=>Math.abs(a-b)<=t;
const BASE="http://127.0.0.1:8790/index.html";
const es1=x=>x.toLocaleString("es-CL",{minimumFractionDigits:1,maximumFractionDigits:1});

(async()=>{
 const srv=await serve(8790);const b=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const mk=async(vp,mobile,ua)=>{const ctx=await b.newContext({viewport:vp,locale:"es-CL",isMobile:!!mobile,hasTouch:!!mobile,deviceScaleFactor:mobile?2:1,userAgent:ua,permissions:["clipboard-read","clipboard-write"]});const p=await ctx.newPage();p.errs=[];p.on("pageerror",e=>p.errs.push(e.message));await env(p);return p};
 const shot=(p,name,full)=>p.screenshot({path:`${OUT}/${name}.png`,fullPage:!!full,timeout:120000});
 const metrics=p=>p.$$eval(".m",a=>a.map(e=>({v:e.querySelector(".mv").textContent,l:e.querySelector(".ml").textContent,cur:e.classList.contains("cur")})));
 const setR=(p,id,w,k,v)=>p.$eval(`#c-${id}-${w}-${k}`,(el,v)=>{el.value=v;el.dispatchEvent(new Event("input",{bubbles:true}))},v);

 /* ---------- 1. Núcleo contra los reels ---------- */
 const d=await mk({width:1280,height:800});
 await d.goto(BASE);await d.waitForTimeout(3500);
 ok("three.js r149 cargado",await d.evaluate(()=>window.THREE&&THREE.REVISION==="149"));
 const n=await d.evaluate(()=>{const j=EC.bStats("juntos",30,6,20,0),bl=EC.bStats("bailey",30,6,20,0),s=EC.bStats("seis",30,6,20,0);const th=EC.fTheory(3,10,15,1);const f=EC.fila({c:3,lam:10,S:15,pol:"pool",cv:1});
  const nv=EC.nivel({p:.98,n:85,meta:98,round:true,days:24,pen:5,period:"dia",x:0});return{j,bl,s,th,jsq:EC.fJsq(3,10,15,1),sim:f.base,nv,am:EC.amazon({k:9,L:100,z:1}).E,am1:EC.amazon({k:1,L:100,z:1}).E,ik:EC.ikea({n:12,pi:3,X:0}).ref,up:EC.ups({W:60,X:150,v:25,G:20,pol:"evita",r:0})}});
 ok("Bailey · todos juntos: el último espera 80 y el promedio 40",n.j.max===80&&n.j.avg===40);
 ok("Bailey · regla de Bailey 16 min; un turno 0; todas terminan 8:40",n.bl.avg===16&&n.s.avg===0&&n.j.fin===100&&n.bl.fin===100);
 ok("Fila · fórmula: separadas 75 min, fila única 21,1 min, ocupación 83 %",near(n.th.asig,75,1e-9)&&near(n.th.pool,21.07,0.01)&&near(n.th.rho,0.8333,1e-3),[n.th.asig,n.th.pool]);
 ok("Fila · jefe de patio ≈ 25 min (estimador rápido)",near(n.jsq,24.6,1.2),n.jsq);
 ok("Fila · simulación larga coincide con la fórmula (±3 %)",near(n.sim.asig,75,2.25)&&near(n.sim.pool,21.07,0.65),n.sim);
 ok("Nivel · 24,2 %, máximo 2 fallas, 5,8 días, US$ 348",(n.nv.ref*100).toFixed(1)==="24.2"&&n.nv.fmax===2&&n.nv.bad.toFixed(1)==="5.8"&&Math.round(n.nv.year)===348);
 ok("Amazon · 50 → 10 m",n.am1===50&&n.am===10);
 ok("IKEA · 11,4 de cada 100",(n.ik*100).toFixed(1)==="11.4");
 ok("UPS · 38,4 s por maniobra y 61 h al año",Math.round(n.up.diff*10)===384&&Math.round(n.up.year)===61);
 const mc=await d.evaluate(()=>{const r=EC.rngFrom(2024);let pw=0;const N=120000;for(let k=0;k<N;k++){let f=0;for(let i=0;i<510;i++)if(r()<.02)f++;if(!EC.okDay(f,510,98,true))pw++}return[pw/N,EC.nivel({p:.98,n:85,meta:98,round:true,days:24,pen:5,period:"semana",x:0}).you]});
 ok("Nivel · semanal: fórmula = Monte Carlo (±0,5 pp)",near(mc[0],mc[1],0.005),mc);

 /* ---------- 2. Inicio y biblioteca ---------- */
 await shot(d,"escritorio_inicio",true);
 ok("Inicio · 5 portadas (reels publicados) con miniatura 3D y número de reel, sin estrellas",(await d.$$("#cards .card img")).length===5&&(await d.$$("#cards .reeln")).length===5&&!(await d.textContent("#cards")).includes("★"));
 await d.evaluate(()=>location.hash="biblioteca");await d.waitForSelector("#shelves .book");
 ok("Biblioteca · 14 libros visibles (sin los 6 que solo usa el reel 6), con 5 separadores de sección",(await d.$$("#shelves .book[data-book]")).length===14&&(await d.$$("#shelves .bookend")).length===5);
 const libS=async pg=>pg.evaluate(()=>[...document.querySelectorAll("#shelves .case-grid")].map(g=>({k:g.dataset.sec,t:g.getAttribute("aria-label"),b:[...g.querySelectorAll(".book[data-book]")].map(x=>x.dataset.book).sort().join(),e:g.querySelector(".bookend").innerText.replace(/\s+/g," ").trim()})));
 const ls0=await libS(d);
 ok("Biblioteca por reel, del más nuevo al primero: Compartidos · Reel #3 y Reel #5 (Bernoulli, tras el reel 5) / Reel #4 · Bailey / Reel #3 · IKEA / Reel #2 · Amazon / Reel #1 · UPS",ls0.map(s=>s.k).join()==="nivel+ikea,bailey,ikea,amazon,ups"&&ls0.map(s=>s.t).join("|")==="Compartidos · Reel #3 y Reel #5|Reel #4 · Bailey|Reel #3 · IKEA|Reel #2 · Amazon|Reel #1 · UPS"&&ls0[0].b==="bernoulli1713"&&/REEL #4.*BAILEY/i.test(ls0[1].e),ls0);
 ok("Biblioteca · con la fila oculta, Lindley (reel 4 y 6) va solo en «Reel #4 · Bailey» y no hay sección compartida de Andenes",ls0[1].b==="bailey1952,kaandorp2007,lindley1952,welch1952"&&!ls0.some(s=>/Andenes · compartidos/.test(s.t)),ls0[1]);
 ok("Biblioteca · ningún libro repetido entre secciones",(()=>{const a=ls0.flatMap(s=>s.b.split(","));return new Set(a).size===a.length})());
 await d.click('#libfilters [data-f="anden"]');await d.waitForTimeout(300);const lsA=await libS(d);await d.click('#libfilters [data-f="todos"]');await d.waitForTimeout(300);
 ok("Biblioteca · el filtro «Andenes» deja solo las secciones de reels de andenes",lsA.map(s=>s.k).join()==="bailey",lsA.map(s=>s.k));
 const FILAONLY=["erlang1917","winston1977","weber1978","odoni","atri2024","lu2013"];
 ok("Biblioteca · ningún libro exclusivo de la fila (reel 6 sin publicar), ni en la portada",await d.evaluate(F=>F.every(id=>!document.querySelector(`#v-biblioteca [data-book="${id}"]`))&&ECAPP.SOURCES.filter(s=>s.labs.every(l=>l==="fila")).map(s=>s.id).sort().join()===F.slice().sort().join(),FILAONLY));
 ok("Biblioteca · el texto cuenta lo visible: «Catorce fuentes de cinco reels» y no promete calcular todo",/Catorce fuentes de cinco reels, del más nuevo al primero/.test(await d.textContent("#libintro"))&&/cuando se puede/.test(await d.textContent("#libintro")));
 await shot(d,"escritorio_biblioteca",true);
 await d.click('#shelves [data-book="bailey1952"]');await d.waitForTimeout(1500);
 ok("Libro abierto · gancho, historia, ecuación con símbolos, frase y «Con tus números» (16,0 min)",(await d.textContent(".pstory")).includes("Bailey")&&(await d.$$(".phook")).length===1&&(await d.$$(".syms dt")).length>=3&&(await d.$$(".pfrase")).length===1&&(await d.$$(".bk-page .beq")).length===1&&(await d.textContent(".blive")).includes("16,0 min"));
 ok("Libro · numeración sobre los visibles (Ficha 01 / 14)",/Ficha 01 \/ 14/.test(await d.textContent(".bk-page .pno")));
 await shot(d,"escritorio_libro_bailey");await d.keyboard.press("Escape");
 await d.evaluate(()=>ECAPP.openBook("lindley1952"));await d.waitForTimeout(400);
 const lin=await d.evaluate(()=>({uses:[...document.querySelectorAll(".bk-page .puses a")].map(a=>a.getAttribute("href")).join(),live:document.querySelector(".blive").textContent}));
 ok("Lindley · «La usamos en» solo muestra el reel publicado y el cálculo usa tu carga del andén (20 min)",lin.uses==="#bailey"&&/tu carga dura 20 min/.test(lin.live),lin);
 await d.evaluate(()=>ECAPP.openBook("kaandorp2007"));await d.waitForTimeout(300);
 ok("Kaandorp · α_W se ve con subíndice y sin «la base»",await d.evaluate(()=>{const t=document.querySelector(".pdato");return t.querySelectorAll("sub").length>=3&&!/_W/.test(t.textContent)&&!/la base/.test(document.querySelector(".bk-page").textContent)}));
 await d.evaluate(()=>document.querySelector(".bk-x").click());
 const allb=await d.evaluate(async()=>{const out=[];for(const s of ECAPP.SOURCES){ECAPP.openBook(s.id);const pg=document.querySelector(".bk-page");out.push(!!(pg.querySelector(".beq")||pg.querySelector(".bigstat"))&&!!pg.querySelector(".blive")&&pg.querySelector(".blive").textContent.length>20)}document.querySelector(".bk-x").click();return out});
 ok("Los 20 libros traen su ecuación o dato y un cálculo con tus números",allb.every(Boolean),allb);
 ok("Cada fuente: autor, año, título, revista, tipo, laboratorio, idea ES/EN y link",await d.evaluate(()=>ECAPP.SOURCES.every(s=>s.au&&s.yr&&s.ti&&s.ve&&s.ty&&s.labs.length&&s.idea.es&&s.idea.en&&/^https:/.test(s.url))));

 /* ---------- 3. Escritorio ---------- */
 await d.evaluate(()=>location.hash="fila");await d.waitForSelector("#play");await d.waitForTimeout(1500);
 const lay=await d.evaluate(()=>{const k=document.getElementById("panel").getBoundingClientRect(),c=document.querySelector(".game canvas").getBoundingClientRect();return{full:c.width===innerWidth&&c.height===innerHeight,panelRight:k.left>innerWidth/2}});
 ok("Escritorio · escena a pantalla completa y panel a la derecha",lay.full&&lay.panelRight,lay);
 await d.click("#play");await d.waitForTimeout(2500);await shot(d,"escritorio_fila_simulando");await d.click("#skip").catch(()=>{});await d.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:40000});await d.waitForTimeout(900);await shot(d,"escritorio_fila_resultado");
 ok("Escritorio · sin errores de JavaScript",d.errs.length===0,d.errs);

 /* ---------- 4. Celular dentro de Instagram: preparar → ▶ Simular → resultado ---------- */
 const p=await mk({width:390,height:740},true,IG);
 await p.goto(BASE+"?caso=fila");await p.waitForSelector("#play");await p.waitForTimeout(2500);
 ok("Link ?caso=fila abre directo el laboratorio, sin pasar por el inicio",await p.evaluate(()=>location.hash==="#fila"&&!document.getElementById("v-lab").hidden&&document.getElementById("v-inicio").hidden));
 const ui=await p.evaluate(()=>({canvas:(c=>c.width===innerWidth&&c.height===innerHeight)(document.querySelector(".game canvas").getBoundingClientRect()),scroll:document.documentElement.scrollHeight-innerHeight,ta:getComputedStyle(document.getElementById("stage")).touchAction,os:getComputedStyle(document.documentElement).overscrollBehaviorY,sw:document.documentElement.scrollWidth,inputs:document.querySelectorAll("#app input").length,buttons:[...document.querySelectorAll("#app button")].filter(b=>b.offsetParent).length,mode:ECAPP.mode}));
 ok("Escena 3D a pantalla completa, sin scroll ni desborde",ui.canvas&&ui.scroll<=1&&ui.sw<=390,ui);
 ok("Lienzo con touch-action:none y sin «tirar para recargar»",ui.ta==="none"&&ui.os==="none",ui);
 ok("Pantalla tranquila al llegar: título, situación, 3 reglas (A, B, C), ▶ Simular y 2 enlaces",ui.mode==="ready"&&ui.inputs===0&&ui.buttons<=8,ui);
 ok("La situación en una línea: «3 puertas · 10 camiones por hora · 15 min de descarga»",(await p.textContent(".sit")).includes("3 puertas · 10 camiones por hora"));
 const rp=await p.$$eval("#rulepick button",a=>a.map(b=>b.dataset.v+":"+b.innerText.replace(/\s+/g," ").trim()).join("|"));ok("Elegir la regla como en el reel: «A · Puerta fija», «B · Fila más corta», «C · Fila única» (A marcada)",rp==="asig:A · Puerta fija|jsq:B · Fila más corta|pool:C · Fila única"&&(await p.getAttribute('#rulepick button[data-v="asig"]',"aria-pressed"))==="true",rp);
 ok("Ayuda de A: «Cada camión llega con su puerta asignada…»",/^Cada camión llega con su puerta asignada: si la suya está ocupada, espera aunque la de al lado esté libre\.$/.test(await p.textContent("#rulehint")));
 ok("Un solo botón protagonista: «▶ Simular la hora punta»",(await p.textContent("#play")).includes("Simular la hora punta"));
 ok("Una manito muestra dónde tocar, sin texto",await p.evaluate(()=>ECAPP.coach));
 await shot(p,"celular_ig_fila_preparar");
 const f0=await p.evaluate(()=>[ECAPP.renders,JSON.stringify(Array.from(ECAPP.S.fleet.cx).slice(0,12))]);await p.waitForTimeout(1500);const f1=await p.evaluate(()=>[ECAPP.renders,JSON.stringify(Array.from(ECAPP.S.fleet.cx).slice(0,12))]);
 ok("Nada avanza si no se pide simular (la maqueta está quieta)",f0[1]===f1[1]&&f1[0]-f0[0]<=1,{r0:f0[0],r1:f1[0]});
 const txy=await p.evaluate(()=>{const S=ECAPP.S,F=S.fleet,k=document.getElementById("panel").getBoundingClientRect();for(let i=0;i<F.n;i++){if(!F.on[i]||F.s[i]<0.5)continue;const v=new THREE.Vector3(F.cx[i],1.1*F.sc,F.cz[i]);S.root.localToWorld(v);v.project(S.cam);const x=(v.x+1)/2*innerWidth,y=(1-v.y)/2*innerHeight;if(y>90&&y<k.top-8)return[x,y]}return null});
 if(txy){await p.touchscreen.tap(txy[0],txy[1]);await p.waitForTimeout(250)}const bub=await p.evaluate(()=>{const b=document.getElementById("bubble");return b.hidden?"":b.textContent});
 ok("Tocar un camión (sin simular) cuenta su historia",/min|Descargando|Se va/.test(bub),{txy,bub});await shot(p,"celular_ig_toque_camion");await p.waitForTimeout(2700);
 const cam0=await p.evaluate(()=>ECAPP.cam);const bb=await (await p.$("#stage")).boundingBox();
 await p.mouse.move(bb.x+bb.width/2,bb.y+200);await p.mouse.down();await p.mouse.move(bb.x+20,bb.y+200,{steps:6});await p.mouse.up();await p.waitForTimeout(300);
 ok("Cámara fija: arrastrar el dedo no gira el mundo",JSON.stringify(cam0)===JSON.stringify(await p.evaluate(()=>ECAPP.cam)));
 await p.tap('#rulepick button[data-v="pool"]');await p.waitForTimeout(500);ok("Cambiar la regla no simula: solo prepara",(await p.evaluate(()=>ECAPP.mode))==="ready"&&(await p.getAttribute('#rulepick button[data-v="pool"]',"aria-pressed"))==="true");
 await p.tap('#rulepick button[data-v="asig"]');await p.waitForTimeout(400);
 await p.evaluate(()=>{window.__v=[];navigator.vibrate=x=>{window.__v.push(x);return true}});
 await p.tap("#play");await p.waitForTimeout(2600);
 const run=await p.evaluate(()=>({mode:ECAPP.mode,prog:parseFloat(document.getElementById("prog").style.width),clock:document.getElementById("clk").textContent,skip:!!document.getElementById("skip")}));
 ok("▶ Simular corre la hora punta con reloj, barra de avance y «Saltar al final»",run.mode==="run"&&run.prog>3&&/\d:\d\d/.test(run.clock)&&run.skip,run);
 await shot(p,"celular_ig_fila_simulando");
 await p.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:40000});await p.waitForTimeout(1000);
 ok("Al terminar aparece el resultado: 75,0 min de espera con puerta fija (3 filas separadas)",(await p.textContent("#rv"))==="75,0"&&(await p.textContent(".rl")).includes("puerta fija (3 filas separadas)"),await p.textContent(".rl"));
 ok("El resultado propone probar la solución del reel: «C · Fila única»",(await p.textContent("#trysol")).includes("C · Fila única"),await p.textContent("#trysol"));
 await shot(p,"celular_ig_fila_resultado");
 await p.tap("#trysol");await p.waitForTimeout(1200);ok("«Probar C · Fila única» vuelve a simular",(await p.evaluate(()=>ECAPP.mode))==="run");
 await p.tap("#skip");await p.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:40000});await p.waitForTimeout(1200);
 const res2=await p.evaluate(()=>({v:document.getElementById("rv").textContent,cmp:(document.querySelector(".rcmp")||{}).textContent||"",aha:(document.querySelector(".raha")||{}).textContent||""}));
 ok("Comparación con la corrida anterior: 75,0 → 21,1 min (−72 %) y el ajá",res2.v==="21,1"&&res2.cmp.includes("75,0")&&res2.cmp.includes("−72 %")&&res2.aha.includes("Mismas puertas"),res2);
 ok("Vibración al terminar",(await p.evaluate(()=>window.__v.length))>0);
 await shot(p,"celular_ig_fila_comparacion");
 await p.tap('#panel [data-sheet="ciencia"]');await p.waitForTimeout(800);ok("«Por qué pasa»: los 7 libros de este laboratorio, de colores",(await p.$$("#sheet .book")).length===7);
 await p.tap('#sheet [data-book="erlang1917"]');await p.waitForTimeout(1600);ok("Libro de Erlang con la ecuación y tus números (21,1 min)",(await p.textContent(".blive")).includes("21,1"));await shot(p,"celular_ig_libro");await p.tap(".bk-x");await p.waitForTimeout(500);
 await p.tap('#panel [data-sheet="share"]');await p.waitForTimeout(700);ok("Compartir: un solo botón «Copiar mi resultado», sin WhatsApp ni Instagram",(await p.$$("#sheet-body .cta")).length===1&&!(await p.$("#wa"))&&!(await p.$("#igc")));
 await p.tap("#copy");await p.waitForTimeout(300);const clip=await p.evaluate(()=>navigator.clipboard.readText().catch(()=>window.__lastShare));ok("Copiar mi resultado: frase con la mejora (75,0 → 21,1 min, −72 %) y link con la configuración",clip.includes("75,0 min")&&clip.includes("21,1 min")&&clip.includes("−72 %")&&/Frente al reel: \d+ %/.test(clip)&&clip.includes("¿Le ganas?")&&clip.includes("caso=fila")&&clip.includes("regla=unica"),clip);await p.tap(".sh-x");await p.waitForTimeout(400);
 /* B · fila más corta (jefe de patio): the reel's ≈25 min, between A and C */
 if(await p.$("#again")){await p.tap("#again");await p.waitForTimeout(400)}
 await p.tap('#rulepick button[data-v="jsq"]');await p.waitForTimeout(500);
 ok("Ayuda de B: el jefe de patio manda a la puerta con menos cola",/^El jefe de patio manda cada camión a la puerta con menos cola al llegar\.$/.test(await p.textContent("#rulehint")));await shot(p,"celular_ig_fila_regla_b");
 await p.tap("#play");await p.waitForTimeout(400);await p.tap("#skip").catch(()=>{});await p.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:40000});await p.waitForTimeout(900);
 const rB=await p.evaluate(()=>({v:document.getElementById("rv").textContent,l:document.querySelector(".rl").textContent,sol:(document.getElementById("trysol")||{}).textContent||"",ouch:(document.querySelector(".rouch")||{}).textContent||"",url:ECAPP.shareURL("fila"),txt:ECAPP.shareText("fila")}));const nB=parseFloat(rB.v.replace(",","."));
 ok("B · Fila más corta con los números del reel: entre 23 y 27 min (el reel dice ≈25)",nB>=23&&nB<=27&&/fila más corta \(jefe de patio\)/.test(rB.l),rB);
 ok("B · propone probar «C · Fila única», explica la puerta ociosa y comparte regla=corta",rB.sol.includes("C · Fila única")&&/otra puerta se libera/.test(rB.ouch)&&/regla=corta/.test(rB.url)&&/con la fila más corta \(jefe de patio\) a 21,1 min con 1 fila única/.test(rB.txt),rB);await shot(p,"celular_ig_fila_resultado_b");
 await p.tap("#edit");await p.waitForTimeout(700);
 ok("«Cambiar los números»: sliders, escenarios, vista e idioma, sin teclado",(await p.$$("#sheet input[type=range]")).length>=2&&(await p.$$("#chips .chip")).length===3&&(await p.$$("#sheet [data-view]")).length===2&&(await p.$$("#sheet input[type=number]")).length===0);
 await shot(p,"celular_ig_cambiar_numeros");
 await setR(p,"fila","a","lam",11);const zone=await p.$eval("#c-fila-a-lam",e=>({cls:e.classList.contains("zoned"),c:e.style.getPropertyValue("--c")}));
 ok("Zona roja desde 85 % de ocupación",zone.cls&&zone.c==="#FF4040",zone);
 ok("Cambiar un número vuelve a «preparar» (no simula solo)",(await p.evaluate(()=>ECAPP.mode))==="ready"&&(await p.textContent(".sit")).includes("11 camiones"));
 await setR(p,"fila","a","lam",10);await p.tap('#sheet [data-view="top"]');await p.waitForTimeout(900);ok("Vista desde arriba",await p.evaluate(()=>ECAPP.top));await p.tap('#sheet [data-view="3d"]');
 await p.tap('#sheet .lg[data-l="en"]');await p.waitForTimeout(400);ok("Inglés desde el mismo panel",(await p.textContent("#play")).includes("Simulate"));await p.tap('#sheet .lg[data-l="es"]');await p.tap(".sh-x");
 ok("Celular IG · sin errores de JavaScript",p.errs.length===0,p.errs);

 /* ---------- 5. Los otros reels, links con configuración y maquetas que crecen ---------- */
 const q=await mk({width:390,height:740},true,IG);
 const runOnce=async()=>{await q.tap("#play");await q.waitForTimeout(500);await q.tap("#skip").catch(()=>{});await q.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:40000});await q.waitForTimeout(900);return q.textContent("#rv")};
 await q.goto(BASE+"?caso=fila&puertas=2&camiones=7&regla=separadas");await q.waitForSelector("#play");await q.waitForTimeout(1200);
 ok("Link compartido abre la misma configuración (2 puertas, 7/h)",(await q.textContent(".sit")).includes("2 puertas · 7 camiones"));ok("…y su resultado es 105 min",(await runOnce())==="105");
 const cases=[["?reel=4","bailey","40,0","16,0"],["?reel=5","nivel","24,2","4,9"],["?reel=2","amazon","50,0","10,0"],["?reel=3","ikea","11,4","1,0"],["?reel=1","ups","20,0","7,2"]];
 for(const [u,id,a0,a1] of cases){await q.goto(BASE+u);await q.waitForSelector("#play");await q.waitForTimeout(1500);await shot(q,`celular_ig_${id}_preparar`);
  const v0=await runOnce();ok(`${id} · el problema del reel da ${a0}`,v0===a0,v0);await shot(q,`celular_ig_${id}_resultado`);
  await q.tap("#trysol");await q.waitForTimeout(500);await q.tap("#skip").catch(()=>{});await q.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:40000});await q.waitForTimeout(1000);
  const v1=await q.textContent("#rv"),c1=await q.evaluate(()=>(document.querySelector(".rcmp")||{}).textContent||"");ok(`${id} · la solución del reel da ${a1} y se compara con ${a0}`,v1===a1&&c1.includes(a0),{v1,c1});await shot(q,`celular_ig_${id}_comparacion`);
  const sw=await q.evaluate(()=>[document.documentElement.scrollWidth,document.documentElement.scrollHeight-innerHeight]);ok(`${id} · sin desborde ni scroll`,sw[0]<=390&&sw[1]<=1,sw)}
 await q.goto(BASE+"?caso=ikea");await q.waitForSelector("#play");await q.waitForTimeout(1200);
 ok("IKEA · la situación habla de entregas (20 cajas por viaje)",(await q.textContent(".sit")).includes("20 por viaje"));
 const ikR2=await runOnce(),ikV=await q.textContent(".r2");ok("IKEA · en cajas: 11,4 de 100 y 5 viajes del furgón",ikR2==="11,4"&&/5 viajes/.test(ikV),{ikR2,ikV});
 await q.goto(BASE+"?caso=ikea&empaque=armado");await q.waitForSelector("#play");await q.waitForTimeout(1200);
 const ikA=await runOnce(),ikAV=await q.textContent(".r2");ok("IKEA · armado: 1,0 de 100 pero 34 viajes del furgón",ikA==="1,0"&&/34 viajes/.test(ikAV),{ikA,ikAV});await shot(q,"celular_ig_ikea_armado");
 const ikNext=await q.textContent("#trysol");ok("IKEA · después de armado propone «En cajas» (el caso del reel), no el escaneo",/En cajas/.test(ikNext),ikNext);
 const ikObs=await q.evaluate(()=>(document.querySelector(".robs")||{}).textContent||"");ok("IKEA · distingue esta partida del promedio",/Esta partida/.test(ikObs)&&/promedio/.test(ikObs),ikObs);
 await q.tap("#trysol");await q.waitForTimeout(500);await q.tap("#skip").catch(()=>{});await q.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:40000});await q.waitForTimeout(1000);
 const ikO=await q.evaluate(()=>({ouch:(document.querySelector(".rouch")||{}).textContent||"",aha:!!document.querySelector(".raha")}));ok("IKEA · armado → cajas: explica el trade-off (5 viajes en vez de 34) y no celebra",/5 viajes en vez de 34/.test(ikO.ouch)&&!ikO.aha,ikO);
 /* the lesson must follow the numbers: with a 10 s wait, avoiding the turn is worse */
 await q.goto(BASE+"?caso=ups&espera=10&regla=dobla");await q.waitForSelector("#play");await q.waitForTimeout(1200);await runOnce();
 await q.tap("#trysol");await q.waitForTimeout(500);await q.tap("#skip").catch(()=>{});await q.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:40000});await q.waitForTimeout(1000);
 const upO=await q.evaluate(()=>({v:document.querySelector("#rv").textContent,ouch:(document.querySelector(".rouch")||{}).textContent||"",aha:!!document.querySelector(".raha")}));ok("UPS · con 10 s de espera evitar el giro sale peor (7,2 min) y la página lo dice en vez de celebrar",upO.v==="7,2"&&/21,6 s/.test(upO.ouch)&&!upO.aha,upO);await shot(q,"celular_ig_ups_no_conviene");
 await q.goto(BASE+"?caso=nivel");await q.waitForSelector("#play");await q.waitForTimeout(1200);await runOnce();
 const nvN=await q.evaluate(()=>(document.querySelector(".rnote")||{}).textContent||"");ok("Nivel · el redondeo del contrato se ve junto al resultado (97,6 % cuenta como 98 %)",/97,6/.test(nvN)&&/redondea/.test(nvN),nvN);
 await q.evaluate(()=>ECAPP.openSheet("fila","ciencia"));await q.waitForTimeout(400);await q.evaluate(()=>ECAPP.openBook("odoni"));await q.waitForTimeout(600);
 const od=await q.evaluate(()=>document.querySelector(".bk-page .beq").textContent.replace(/\s+/g,""));ok("Libro de Odoni · la fórmula divide λ entre las c puertas",/λ−?\/c|λ\/c/.test(od)&&!/μ−λ$/.test(od),od);await q.evaluate(()=>ECAPP.closeSheet());
 const html=require("fs").readFileSync(__dirname+"/../index.html","utf8");
 /* round 2: lessons follow direction and numbers; links reproduce the case */
 await q.goto(BASE+"?caso=fila");await q.waitForSelector("#play");await q.waitForTimeout(1200);await runOnce();
 await q.tap("#trysol");await q.waitForTimeout(500);await q.tap("#skip").catch(()=>{});await q.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:40000});await q.waitForTimeout(900);
 await q.evaluate(()=>ECAPP.set("fila",{pol:"asig"}));await q.waitForTimeout(600);await runOnce();
 const fiO=await q.evaluate(()=>({ouch:(document.querySelector(".rouch")||{}).textContent||"",aha:!!document.querySelector(".raha")}));ok("Fila · volver a filas separadas explica la puerta vacía (no el texto de la fila única)",/puerta puede quedar vacía/.test(fiO.ouch)&&!fiO.aha,fiO);
 await q.evaluate(()=>ECAPP.set("fila",{pol:"pool",c:4}));await q.waitForTimeout(600);await runOnce();
 const fiC=await q.evaluate(()=>({cmp:(document.querySelector(".rcmp")||{}).textContent||"",aha:!!document.querySelector(".raha"),ouch:!!document.querySelector(".rouch")}));ok("Fila · si cambian los números junto con la regla, no dice «mismas puertas»",/otros números/.test(fiC.cmp)&&!fiC.aha&&!fiC.ouch,fiC);
 await q.evaluate(()=>{try{localStorage.setItem("ec5-state",JSON.stringify({fila:{c:5,lam:10,S:15,pol:"asig",cv:10}}))}catch(e){}});
 await q.goto(BASE+"?caso=fila&regla=unica");await q.waitForSelector("#play");await q.waitForTimeout(1200);
 const lk=await q.textContent(".sit");ok("Link compartido · abre con 3 puertas aunque el teléfono tenía 5 guardadas",/^3 puertas/.test(lk),lk);
 await q.goto(BASE+"?caso=nivel&eval=mes");await q.waitForSelector("#play");await q.waitForTimeout(1200);await runOnce();
 const nvM=await q.evaluate(()=>(document.querySelector(".rnote")||{}).textContent||"");ok("Nivel · medido por mes, la nota habla del mes (2.040 paradas, 24 días), no del día",/2\.040 paradas del mes/.test(nvM)&&/24 días/.test(nvM),nvM);
 await q.goto(BASE+"?reel=2&copias=4");await q.waitForSelector("#play");await q.waitForTimeout(1200);await runOnce();
 await q.tap("#trysol");await q.waitForTimeout(500);await q.tap("#skip").catch(()=>{});await q.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:40000});await q.waitForTimeout(900);
 const amA=await q.evaluate(()=>(document.querySelector(".raha")||{}).textContent||"");ok("Amazon · el ¡Ajá! usa tus copias (4 lugares, 20,0 m), no «9 lugares» fijo",/4 lugares/.test(amA)&&/20,0 m/.test(amA),amA);
 /* the yard must stay full of trucks for the whole run (slots are given back when a truck leaves) */
 await q.goto(BASE+"?caso=fila&puertas=4&camiones=17&regla=separadas");await q.waitForSelector("#play");await q.waitForTimeout(1200);
 await q.tap("#play");await q.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:60000});await q.waitForTimeout(800);
 const yard=await q.evaluate(()=>{const F=ECAPP.S.fleet;let vis=0;for(let i=0;i<F.n;i++)if(F.on[i]&&F.s[i]>0.5)vis++;return{vis,rv:document.querySelector("#rv").textContent,note:(document.querySelector(".rnote")||{}).textContent||""}});
 ok("Fila · con 4 puertas y 17/h el patio se ve lleno al final (≥ 15 camiones) y el ∞ viene explicado",yard.vis>=15&&yard.rv==="∞"&&/crece sin fin/.test(yard.note),yard);await shot(q,"celular_ig_fila_colapso");
 /* review round 3: run state, English numbers, invalid links, reset */
 await q.goto(BASE+"?caso=fila");await q.waitForSelector("#play");await q.waitForTimeout(1000);await q.tap("#play");await q.waitForTimeout(600);
 await q.evaluate(()=>{location.hash="#bailey"});await q.waitForSelector("#play");await q.waitForTimeout(900);
 const rs=await q.evaluate(()=>({running:ECAPP.running,mode:ECAPP.mode}));ok("Cambiar de página a mitad de corrida no deja la simulación corriendo",rs.running===false&&rs.mode==="ready",rs);
 await q.evaluate(()=>document.getElementById("lang-en").click());await q.goto(BASE+"?caso=fila&puertas=2&camiones=7&regla=separadas");await q.waitForSelector("#play");await q.waitForTimeout(1000);
 const v0=await runOnce();await q.tap("#trysol");await q.waitForTimeout(400);await q.tap("#skip").catch(()=>{});await q.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:40000});await q.waitForTimeout(900);
 const en=await q.evaluate(()=>({v:document.querySelector("#rv").textContent,cmp:(document.querySelector(".rcmp")||{}).textContent||"",aha:!!document.querySelector(".raha"),ouch:!!document.querySelector(".rouch")}));
 ok("En inglés (105.0 → 49.0) la comparación y la lección siguen siendo correctas",v0==="105"&&en.v==="49.0"&&/−53 %/.test(en.cmp)&&en.aha&&!en.ouch,{v0,en});await q.evaluate(()=>document.getElementById("lang-es").click());
 const lnk=await (async()=>{const o={};for(const [u,k] of [["regla=corta","corta"],["regla=separadas","sep"],["regla=unica","uni"],["regla=separadas&jefe=1","jefe"],["regla=unica&jefe=1","unijefe"]]){await q.goto(BASE+"?caso=fila&"+u);await q.waitForSelector("#play");o[k]=await q.evaluate(()=>ECAPP.STATE.fila.pol)}return o})();
 ok("Links de la fila: regla=corta abre B; separadas y unica siguen funcionando; jefe=1 antiguo abre B salvo con fila única",lnk.corta==="jsq"&&lnk.sep==="asig"&&lnk.uni==="pool"&&lnk.jefe==="jsq"&&lnk.unijefe==="pool"&&!/jefe=/.test(await q.evaluate(()=>ECAPP.shareURL("fila"))),lnk);
 await q.goto(BASE+"?caso=fila&puertas=0&camiones=abc&regla=loquesea");await q.waitForSelector("#play");await q.waitForTimeout(900);
 const inv=await q.evaluate(()=>({st:ECAPP.STATE.fila,rv:document.querySelector(".sit").textContent}));ok("Link con valores inválidos (0 puertas, texto, regla inexistente) se acota al rango y no rompe nada",inv.st.c===1&&inv.st.lam===10&&inv.st.pol==="asig"&&/1 puerta/.test(inv.rv),inv);
 await q.goto(BASE+"?caso=nivel&eval=foo&dias=0");await q.waitForSelector("#play");await q.waitForTimeout(900);const nvI=await runOnce(),nvD=await q.evaluate(()=>[ECAPP.STATE.nivel.period,ECAPP.STATE.nivel.days]);ok("Nivel · link con período inexistente y 0 días: cae en «cada día», 10 días, y da 24,2",nvI==="24,2"&&nvD[0]==="dia"&&nvD[1]===10,{nvI,nvD});
 await q.goto(BASE+"?reel=4&g=15");await q.waitForSelector("#play");await q.waitForTimeout(900);await q.evaluate(()=>ECAPP.set("bailey",Object.assign({},ECAPP.LAB.bailey.def),{force:true}));await q.waitForTimeout(400);
 const rst=await q.evaluate(()=>ECAPP.STATE.bailey.rule);ok("Bailey · «Volver al ejemplo del reel» tras mover la perilla extra deja la regla del reel, no «propia»",rst==="juntos",rst);
 /* final audit: reel numbers, shared text, primary copy button, Bailey quick rule */
 await q.goto(BASE);await q.waitForTimeout(1200);const ord=await q.evaluate(()=>[...document.querySelectorAll("#cards .card")].map(a=>a.getAttribute("href")).join(","));
 ok("Reels · portada en orden 5→1 sin la fila (no publicada): nivel, bailey, ikea, amazon, ups",ord==="#nivel,#bailey,#ikea,#amazon,#ups",ord);
 for(const [n,id] of [[1,"ups"],[2,"amazon"],[3,"ikea"],[4,"bailey"],[5,"nivel"]]){await q.goto(BASE+"?reel="+n);await q.waitForSelector("#play");const h=await q.evaluate(()=>location.hash);ok(`Reels · ?reel=${n} abre #${id}`,h==="#"+id,h)}
 await q.goto(BASE+"?reel=6");await q.waitForSelector("#cards .card");await q.waitForTimeout(600);ok("Reels · ?reel=6 (sin publicar) cae en el inicio, no abre la fila",await q.evaluate(()=>!document.getElementById("v-inicio").hidden&&document.getElementById("v-lab").hidden&&location.hash!=="#fila"));
 await q.goto(BASE+"?caso=fila");await q.waitForSelector("#play");ok("Reels · ?caso=fila sigue funcionando aunque no esté en portada, y el título no dice «Reel #6»",(await q.evaluate(()=>location.hash))==="#fila"&&!/Reel #6/.test(await q.textContent("#reels")),await q.textContent("#reels"));
 await q.goto(BASE+"?caso=fila");await q.waitForSelector("#play");await q.waitForTimeout(1000);await runOnce();
 const cb=await q.evaluate(()=>{const b=document.getElementById("copyres");return b?{cls:b.className,h:Math.round(b.getBoundingClientRect().height),vis:!!b.offsetParent}:null});
 ok("Resultado · «Copiar resultado» es un botón primario grande y visible",!!cb&&/play/.test(cb.cls)&&cb.h>=44&&cb.vis,cb);
 await q.tap("#copyres");await q.waitForTimeout(300);const stES=await q.evaluate(()=>window.__lastShare);
 ok("Compartir ES · frase + «Frente al reel: X % · veredicto» + «¿Le ganas?» + link",/Frente al reel: \d+ % · .+\. ¿Le ganas\? http/.test(stES)&&/caso=fila/.test(stES),stES);
 await q.evaluate(()=>document.getElementById("lang-en").click());await q.waitForTimeout(300);await q.tap("#copyres");await q.waitForTimeout(300);const stEN=await q.evaluate(()=>window.__lastShare);
 ok("Compartir EN · phrase + «Against the reel: X % · verdict» + «Can you beat it?» + link",/Against the reel: \d+ % · .+\. Can you beat it\? http/.test(stEN)&&!/Frente al reel/.test(stEN),stEN);await q.evaluate(()=>document.getElementById("lang-es").click());
 await q.goto(BASE+"?reel=4");await q.waitForSelector("#play");await q.waitForTimeout(1000);const opts=await q.evaluate(()=>[...document.querySelectorAll("#rulepick button")].map(b=>b.dataset.v).join(","));
 ok("Bailey · pantalla rápida: Todos a las 7:00 / De 6 en 6 cada 20 min / Regla de Bailey (sin «Sin cita»)",opts==="juntos,seis,bailey",opts);
 await q.evaluate(()=>ECAPP.set("bailey",{rule:"seis"}));await q.waitForTimeout(400);const v6=await runOnce();ok("Bailey · «De 6 en 6 cada 20 min» con todos puntuales: 0,0 min de espera",v6==="0,0",v6);
 await q.evaluate(()=>ECAPP.openSheet("bailey","ajustar"));await q.waitForTimeout(500);ok("Bailey · «Sin cita» sigue disponible en las palancas avanzadas",await q.evaluate(()=>/Sin cita/.test(document.getElementById("sheet-body").innerText)));await q.evaluate(()=>ECAPP.closeSheet());await q.waitForTimeout(300);
 ok("Portada · Bailey compara promedio con promedio (40 → 16 min)",/40 → 16 min/.test(html)&&!/80 → 16 min/.test(html));
ok("Sin preserveDrawingBuffer (ahorra GPU en el WebView) y con recuperación del contexto WebGL",!/preserveDrawingBuffer:true/.test(html)&&/webglcontextrestored/.test(html));
 ok("Sin control flotante sobre la maqueta (una cosa a la vez)",!/id="anchor"/.test(html)&&!/renderAnchor/.test(html));
 const box=async(id,set)=>{await q.evaluate(([i,s])=>ECAPP.set(i,s),[id,set]);await q.waitForTimeout(800);return q.evaluate(()=>{const b=ECAPP.S.box;return Math.round(Math.max(b.max.x-b.min.x,b.max.z-b.min.z))})};
 await q.goto(BASE+"?caso=amazon&orden=desordenada");await q.waitForSelector("#play");await q.waitForTimeout(1200);
 const a40=await box("amazon",{L:40}),a300=await box("amazon",{L:300});ok("Amazon · el pasillo crece con los metros (40 m → 300 m)",a300>a40*3,{a40,a300});await shot(q,"celular_ig_amazon_300m");
 await q.goto(BASE+"?reel=4");await q.waitForSelector("#play");await q.waitForTimeout(1200);
 const b4=await box("bailey",{c:4}),b10=await box("bailey",{c:10});const doors=await q.evaluate(()=>ECAPP.S.scene.getObjectByProperty("type","Group").children.filter(o=>o.isMesh&&o.geometry&&o.geometry.type==="SphereGeometry").length);
 ok("Bailey · al subir a 10 andenes aparecen 10 andenes",b10>b4&&doors===10,{b4,b10,doors});await shot(q,"celular_ig_bailey_10_andenes");
 ok("Otros reels · sin errores de JavaScript",q.errs.length===0,q.errs);

 /* ---------- 6. Pantalla chica y horizontal ---------- */
 const s=await mk({width:360,height:640},true,IG);await s.goto(BASE+"?caso=fila");await s.waitForSelector("#play");await s.waitForTimeout(2000);
 const sm=await s.evaluate(()=>{const pl=document.getElementById("play").getBoundingClientRect(),pa=document.getElementById("panel").getBoundingClientRect();return{play:pl.bottom<=innerHeight&&pl.top>0,panelH:Math.round(pa.height/innerHeight*100),scroll:document.documentElement.scrollHeight-innerHeight,sw:document.documentElement.scrollWidth}});
 ok("Celular chico 360×640 · ▶ Simular a la vista, panel bajo la mitad de la pantalla, sin scroll",sm.play&&sm.panelH<50&&sm.scroll<=1&&sm.sw<=360,sm);await shot(s,"celular_chico_fila");
 const small=await s.$$eval("#app button",bs=>bs.filter(b=>b.offsetParent).map(b=>{const r=b.getBoundingClientRect();return[b.textContent.trim().slice(0,14),Math.round(r.height)]}).filter(x=>x[1]<38));ok("Celular chico · botones de 38 px o más",small.length===0,small);
 const l=await mk({width:844,height:390},true,IG);await l.goto(BASE+"?reel=4");await l.waitForSelector("#play");await l.waitForTimeout(2000);
 const ll=await l.evaluate(()=>{const k=document.getElementById("panel").getBoundingClientRect();return{right:k.left>innerWidth/2-20,inView:k.bottom<=innerHeight&&k.top>=0,sw:document.documentElement.scrollWidth}});
 ok("Celular horizontal · panel a la derecha y a la vista, sin desborde",ll.right&&ll.inView&&ll.sw<=844,ll);await shot(l,"celular_horizontal_bailey");
 ok("Pantallas chicas · sin errores de JavaScript",s.errs.length===0&&l.errs.length===0,[s.errs,l.errs]);
 ok("Sin menciones a Christian ni Ruck",!/\bchristian\b|\bruck\b/i.test(await d.content()));

 /* ---------- 6b. Veredictos legítimos, textos sin NaN, enlace con & ---------- */
 const v=await mk({width:390,height:844},true,IG);await v.goto(BASE+"?reel=4");await v.waitForSelector("#play");await v.waitForTimeout(800);
 const verd=async(id,set)=>v.evaluate(([id,set])=>{Object.assign(ECAPP.STATE[id],ECAPP.LAB[id].def,set);ECAPP.openSheet(id,"share");const r={pct:document.getElementById("pct").textContent,v:document.getElementById("verdict").textContent,why:(document.querySelector("#sheet-body .why")||{}).textContent||"",txt:ECAPP.shareText(id)};ECAPP.closeSheet();return r},[id,set]);
 const bz=await verd("bailey",{rule:"seis",d:0});ok("Bailey · «De 6 en 6» con todos puntuales no cuenta como ganarle al modelo",bz.v==="No cuenta"&&/exige atrasos/.test(bz.why)&&bz.pct==="—",bz);
 const bw=await verd("bailey",{rule:"custom",g:12,I:24,d:10});ok("Bailey · con ±10 min una agenda propia (g=12, I=24) sí le gana al modelo (~141 %)",bw.v==="¡Le ganaste al modelo!"&&/^14\d %$/.test(bw.pct),bw);
 const bl=await v.evaluate(()=>[...document.querySelectorAll("#rulepick button")].map(b=>b.textContent).join("|"));ok("Bailey · la opción rápida sigue a las palancas: «De 6 en 6 cada 20 min»",/De 6 en 6 cada 20 min/.test(bl),bl);
 await v.evaluate(()=>ECAPP.set("bailey",{c:4,s:15}));await v.waitForTimeout(300);const bl4=await v.evaluate(()=>[...document.querySelectorAll("#rulepick button")].map(b=>b.textContent).join("|"));ok("Bailey · con 4 andenes y 15 min la opción dice «De 4 en 4 cada 15 min»",/De 4 en 4 cada 15 min/.test(bl4),bl4);
 const ik=await verd("ikea",{n:11});ok("IKEA · con 11 cajas no cuenta (cambiaste de producto)",ik.v==="No cuenta"&&/Cambiaste de producto/.test(ik.why),ik);
 const up=await verd("ups",{W:0,pol:"dobla"});ok("UPS · espera 0 y siempre doblar: porcentaje acotado (≥200 %), nada absurdo",up.pct==="≥200 %"&&!/\d{4}/.test(up.pct),up);
 const upr=await verd("ups",{pol:"conviene",r:90});const rmax=await v.evaluate(()=>ECAPP.LAB.ups.reto.ctl[1].max);ok("UPS · reordenar paradas llega como máximo a 50 % y advierte que no es gratis",rmax===50&&/no es gratis/.test(upr.why),{rmax,upr});
 const nv=await verd("nivel",{period:"mes"});ok("Nivel · medir el mes completo (la solución del reel) da «Igual que el reel»",nv.v==="Igual que el reel"&&nv.pct==="100 %",nv);
 const nvx=await verd("nivel",{period:"mes",x:30});ok("Nivel · solo la perilla extra (excluir fallas ajenas) le gana al reel",nvx.v==="¡Le ganaste al modelo!",nvx);
 const nvs=await verd("nivel",{period:"semana"});ok("Nivel · texto por semana sin repetir: «medido día a día … medido por semana»",/medido día a día me penalizan [\d,]+ % de los días; medido por semana, [\d,]+ %/.test(nvs.txt),nvs.txt);
 const sweep=await v.evaluate(()=>{const bad=[];const chk=(id,t)=>{if(/NaN|Infinity|undefined|−-|-0 %|−0 %|-0,0|\b1 (puertas|camiones|filas)\b/.test(t))bad.push([id,t])};for(const id of ["bailey","fila","nivel","amazon","ikea","ups"]){const G=ECAPP.LAB[id].game;const defs=[G.rule].concat(G.sliders,G.ajustes,G.reto||[]);for(const c of defs){const vals=c.type==="seg"?c.opts.map(o=>o[0]):c.type==="check"?[true,false]:[c.min,c.max];for(const x of vals){for(const lg of ["es","en"]){document.getElementById("lang-"+lg).click();Object.assign(ECAPP.STATE[id],ECAPP.LAB[id].def,{[c.k]:x});chk(id+"."+c.k+"="+x,ECAPP.shareText(id))}}}}
   for(const set of [{c:4,lam:1,S:15,pol:"jsq"},{c:1,lam:1,S:15},{c:1,lam:5,S:15,pol:"jsq"},{c:5,lam:1,S:3,pol:"pool"}])for(const lg of ["es","en"]){document.getElementById("lang-"+lg).click();Object.assign(ECAPP.STATE.fila,ECAPP.LAB.fila.def,set);chk("fila "+JSON.stringify(set),ECAPP.shareText("fila"))}
   for(const set of [{W:21,X:150},{W:22,X:150},{ord:"orden",z:20}])for(const id of ["ups","amazon"]){Object.assign(ECAPP.STATE[id],ECAPP.LAB[id].def,set);chk(id,ECAPP.shareText(id));chk(id+" m",JSON.stringify(ECAPP.metrics(id)))}
   document.getElementById("lang-es").click();return bad});
 ok("Barrido de palancas (mín/máx, ES/EN): ningún texto para copiar con NaN, ∞, «−-0 %» ni «1 puertas»",sweep.length===0,sweep.slice(0,4));
 /* fila (reel 6): sampled sweep with the real code paths; the full one is tests/sweep_fila.js */
 const fs1=await v.evaluate(filaSweep,{cs:[1,2,3,5,8],lams:[1,7,10,20,40],Ss:[3,15,18,59,60],cvs:[2,10],sims:[[3,10,15,10],[2,7,15,5],[5,20,12,2]],seeds:[1,2],simTrucks:20000,url:"sample",nearOne:false});const fsS=fs1.summary;
 ok("Fila · barrido (a): ningún número o texto con NaN, «undefined», negativos ni «1 camiones»",fsS.a===0,fs1.a.slice(0,3));
 ok("Fila · barrido (b): el aviso de colapso salta justo cuando λ ≥ c·60/S y entonces no se muestra ninguna espera numérica",fsS.b===0,fs1.b.slice(0,3));
 ok("Fila · barrido (c): C ≤ A siempre; con CV = 1, C = Erlang C y A = M/M/1",fsS.c===0,fs1.c.slice(0,3));
 ok("Fila · barrido (d): B en pantalla queda entre C y A, y en simulación B cae entre C y A",fsS.d.jsqShownOutside===0&&fsS.d.avgViol===0,fsS.d);
 ok("Fila · barrido (e): 75,0 · ≈24,5 · 21,1 en resultado, texto, libros, pasos y portada (ES/EN)",fsS.e===0,fs1.e);
 ok("Fila · barrido (f): con 1 camión/h y 3 min nada de «−100 %», veredicto «No cuenta» con su porqué, y C con CV = 1 = 100 %",fsS.f===0,fs1.f.slice(0,3));
 ok("Fila · barrido (g): el link generado reabre la misma configuración y el mismo texto; fija/separadas/corta/unica/jefe=1 siguen funcionando",fsS.g===0&&fsS.gN>50,fs1.g.slice(0,3));
 ok("Fila · barrido (h): con el reto (CV) las esperas siguen el factor de Allen–Cunneen que se muestra",fsS.h===0&&fsS.hN>0,fs1.h.slice(0,3));
 ok("Fila · barrido (i): A · Puerta fija / B · Fila más corta / C · Fila única en todas partes, ES y EN con las mismas frases",fsS.i===0,fs1.i);
 const fl=await v.evaluate(()=>{Object.assign(ECAPP.STATE.fila,ECAPP.LAB.fila.def,{c:4,lam:1,S:15,pol:"jsq"});return{t:ECAPP.shareText("fila"),m:JSON.stringify(ECAPP.metrics("fila"))}});ok("Fila · carga muy baja con jefe de patio (4 puertas, 1/h): sin NaN y sin «colapsa»",!/NaN|colapsa/.test(fl.t+fl.m),fl.t);
 await v.goto(BASE+"?caso=fila&regla=unica&puertas=2");await v.waitForSelector("#play");await v.evaluate(()=>ECAPP.openSheet("fila","share"));await v.waitForTimeout(400);
 const su=await v.textContent("#share-text .url");ok("Compartir · el enlace mostrado conserva «&regla» (sin ® ni ¶)",/&regla=unica/.test(su)&&!/[®¶]/.test(su),su);
 ok("Compartir · la hoja invita a dejarlo en los comentarios del reel",/comentarios del reel/.test(await v.textContent("#sheet-body .lead")));await v.evaluate(()=>ECAPP.closeSheet());
 await v.evaluate(()=>document.getElementById("lang-en").click());await v.goto(BASE);await v.waitForSelector("#cards .card");
 const chipsEN=await v.evaluate(()=>[...document.querySelectorAll("#cards .chipn")].map(c=>c.textContent).join("|"));ok("Inglés · las fichas de portada están en inglés (38 s / turn, 24.2%)",/38 s \/ turn/.test(chipsEN)&&/24\.2%/.test(chipsEN),chipsEN);
 ok("Inglés · el título de la pestaña cambia con el idioma",/Lab$/.test(await v.title()));await v.evaluate(()=>document.getElementById("lang-es").click());ok("Español · título de la pestaña en español",/Laboratorio$/.test(await v.title()));
 ok("Veredictos y barrido · sin errores de JavaScript",v.errs.length===0,v.errs);
 /* publishing reel 6 is one flag: a copy of the page with fila:true brings everything back */
 const PUBF=path.resolve(__dirname,"../_pub_test.html");fs.writeFileSync(PUBF,html.replace("fila:false}","fila:true}"));
 try{const w=await mk({width:390,height:844},true,IG);await w.goto("http://127.0.0.1:8790/_pub_test.html#biblioteca");await w.waitForSelector("#shelves .book");
  const pb=await w.evaluate(()=>({books:document.querySelectorAll("#shelves .book[data-book]").length,intro:document.getElementById("libintro").textContent}));
  const ls1=await libS(w);
  ok("Publicar el reel 6 · la biblioteca suma «Reel #6 · Fila única» arriba y Lindley pasa sola a «Andenes · compartidos (Reel #4 y Reel #6)», justo después",ls1.map(s=>s.k).join()==="fila,fila+bailey,nivel+ikea,bailey,ikea,amazon,ups"&&ls1[0].t==="Reel #6 · Fila única"&&ls1[0].b==="atri2024,erlang1917,lu2013,odoni,weber1978,winston1977"&&ls1[1].t==="Andenes · compartidos (Reel #4 y Reel #6)"&&ls1[1].b==="lindley1952"&&ls1[3].b==="bailey1952,kaandorp2007,welch1952"&&/seis reels/.test(pb.intro),ls1);
  await w.evaluate(()=>document.getElementById("lang-en").click());await w.waitForTimeout(300);const ls1e=await libS(w);await w.evaluate(()=>document.getElementById("lang-es").click());
  ok("Publicar el reel 6 · en inglés: «Docks · shared (Reel #4 and Reel #6)» y «Shared · Reel #3 and Reel #5»",ls1e[1].t==="Docks · shared (Reel #4 and Reel #6)"&&ls1e[2].t==="Shared · Reel #3 and Reel #5"&&ls1e[0].t==="Reel #6 · Single queue",ls1e.map(s=>s.t));
  await w.goto("http://127.0.0.1:8790/_pub_test.html?reel=6");await w.waitForSelector("#play");const pr=await w.evaluate(()=>({h:location.hash,t:document.getElementById("reels").textContent}));
  await w.goto("http://127.0.0.1:8790/_pub_test.html");await w.waitForSelector("#cards .card");const pc=(await w.$$("#cards .card")).length;
  ok("Publicar el reel 6 = cambiar una bandera: 20 libros, «Veinte fuentes», ?reel=6 abre la fila con «Reel #6» y 6 portadas",pb.books===20&&/Veinte fuentes/.test(pb.intro)&&pr.h==="#fila"&&/Reel #6/.test(pr.t)&&pc===6,{pb,pr,pc})}
 finally{fs.unlinkSync(PUBF)}

 /* ---------- 7. GoatCounter: anónimo y prescindible ---------- */
 const g0=await mk({width:390,height:760},true,IG);await g0.route(/gc\.zgo\.at|goatcounter\.com/,r=>r.abort());
 await g0.goto(BASE+"?reel=4");await g0.waitForSelector("#play");await g0.click("#play");await g0.waitForSelector("#copyres",{timeout:90000});
 ok("GoatCounter bloqueado · la página simula y muestra el resultado igual, sin errores",g0.errs.length===0,g0.errs);
 const g1=await mk({width:390,height:760},true,IG);await g1.route(/gc\.zgo\.at|goatcounter\.com/,r=>r.abort());
 await g1.addInitScript(()=>{window.__gc=[];window.goatcounter={count:o=>window.__gc.push(o.path+(o.event?"!":""))}});
 await g1.goto(BASE+"?reel=4");await g1.waitForSelector("#play");await g1.click("#play");await g1.waitForSelector("#copyres",{timeout:90000});await g1.click("#copyres");await g1.waitForTimeout(400);
 const gl=await g1.evaluate(()=>window.__gc);
 ok("GoatCounter · cuenta la vista y los eventos simular/resultado/copiar",gl.some(x=>/#bailey$/.test(x))&&["simular-bailey!","resultado-bailey!","copiar-bailey!"].every(e=>gl.includes(e)),gl);
 ok("Andenes · sin 'El Andén' en la página",!/El Andén|The Dock\b/.test(await d.content()));
 const fail=checks.filter(c=>!c.pass);fs.writeFileSync(`${OUT}/verificacion.json`,JSON.stringify({fecha:new Date().toISOString(),total:checks.length,fallas:fail.length,checks},null,1));
 console.log(`\n${checks.length-fail.length}/${checks.length} verificaciones OK`);await b.close();srv.close();process.exit(fail.length?1:0)})().catch(e=>{console.error(e);process.exit(2)});
