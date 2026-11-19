// Reel 17 · Pagas por el aire (peso volumétrico): cifras del reel, TODAS las posiciones de los controles sin resultados incoherentes,
// entradas inválidas, barrido de textos ES/EN, el botón «Achicar 5 cm por lado», enlaces, biblioteca y capturas de celular (390 px).
// Uso: node tests/aire.js   (primero con APUB=true, la versión publicada; al final con APUB=false, aunque la rama ya la tenga encendida)
const {chromium}=require(process.env.PW||"playwright");const serve=require("./serve.js"),env=require("./env.js");
const checks=[];const ok=(n,c,g)=>{checks.push(!!c);console.log((c?"PASS ":"FAIL ")+n+(g!==undefined?"  → "+JSON.stringify(g):""))};
const PORT=8801,U=`http://127.0.0.1:${PORT}/index.html`;
(async()=>{const srv=await serve(PORT);const b=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const mk=async pubOn=>{const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,locale:"es-CL"});
  await ctx.route("**/index.html*",async r=>{const x=await r.fetch();await r.fulfill({response:x,body:pubOn?(await x.text()).replace("const APUB=false;","const APUB=true;"):(await x.text()).replace("const APUB=true;","const APUB=false;")})});
  const p=await ctx.newPage();await env(p);return{ctx,p}};
 const {ctx,p}=await mk(true);const errs=[];p.on("pageerror",e=>errs.push(e.message));
 await p.goto(U);await p.waitForTimeout(2500);
 const R={L:50,A:40,H:30,kg:2,div:"5000",pol:"tal"};
 // ---- cifras del reel (y del cálculo de R017: kg_cobrado_grande 12, kg_cobrado_ajustada 7,875 antes de redondear)
 const r=await p.evaluate(R=>[EC.aire(R),EC.aire(Object.assign({},R,{pol:"achicar"})),EC.aire(Object.assign({},R,{div:"6000"}))],R);
 ok("Reel · 50×40×30 = 60.000 cm³ ÷ 5.000 = 12 kg de volumen",r[0].V===60000&&r[0].vol===12,[r[0].V,r[0].vol]);
 ok("Reel · con 2 kg se cobran 12 kg: 6 veces lo que pesa",r[0].cob===12&&r[0].veces===6,[r[0].cob,r[0].veces]);
 ok("Reel · achicada 5 cm por lado = 45×35×25 → 7,875 kg («casi 8 kilos»)",r[1].L===45&&r[1].A===35&&r[1].H===25&&r[1].vol===7.875,[r[1].L,r[1].A,r[1].H,r[1].vol]);
 ok("Reel · se cobran 8 kg, un tercio menos (12 → 8)",r[1].cob===8&&Math.abs(r[1].menos-1/3)<1e-12,[r[1].cob,r[1].menos]);
 ok("Divisor 6.000: la misma caja da 10 kg",r[2].vol===10&&r[2].cob===10,[r[2].vol,r[2].cob]);
 // ---- TODAS las posiciones de los controles: largo, ancho, alto 10–150 cm de 5 en 5; peso 0,5–30 kg de 0,5 en 0,5; divisor 5.000/6.000; como viene/achicar
 const ex=await p.evaluate(()=>{const bad=[];let n=0;const G=ECAPP.LAB.aire.game,c=k=>G.sliders.find(x=>x.k===k),dv=G.sliders.find(x=>x.k==="div").opts.map(o=>o[0]),pols=G.rule.opts.map(o=>o[0]);
  const rng=k=>{const a=[];for(let v=c(k).min;v<=c(k).max+1e-9;v+=c(k).step)a.push(+v.toFixed(6));return a};const Ls=rng("L"),As=rng("A"),Hs=rng("H"),Ks=rng("kg");
  const iceil=(V,d)=>Math.floor((V+d-1)/d);
  for(const pol of pols)for(const div of dv)for(const L of Ls)for(const A of As)for(const H of Hs)for(const kg of Ks){n++;const q=EC.aire({L,A,H,kg,div,pol}),D=+div;
   const sh=pol==="achicar"?5:0,V=(L-sh)*(A-sh)*(H-sh),want=Math.max(iceil(V,D),Math.ceil(kg));
   const e=[];if(![q.vol,q.cob,q.veces,q.aireKg,q.aireFr,q.menos,q.score].every(Number.isFinite))e.push("no finito");
   if(q.div!==D)e.push("divisor");if(q.V!==V||q.L!==L-sh||q.A!==A-sh||q.H!==H-sh)e.push("medidas");
   if(q.cob!==want)e.push("cobrado ≠ el mayor redondeado al kg");if(q.cob<kg||q.cob<q.vol-1e-9||!Number.isInteger(q.cob))e.push("cobrado menor que el real o el volumétrico");
   if(q.vol<=0||q.kg<=0)e.push("peso ≤ 0");if(q.veces<1-1e-12)e.push("veces < 1");if(q.aireKg<0||q.aireKg>=q.cob)e.push("aire");if(q.aireFr<0||q.aireFr>=1)e.push("aire %");
   if(q.cob>q.cob0||q.menos<0||q.menos>=1)e.push("achicar sube");if(pol==="tal"&&(q.cob!==q.cob0||q.menos!==0))e.push("como viene ≠ original");
   if(!(q.score>=0&&q.score<=1000))e.push("puntaje");if((q.manda==="volumen")!==(q.vol>kg))e.push("manda");
   if(e.length&&bad.length<5)bad.push([{L,A,H,kg,div,pol},e])}
  return{n,bad,dims:[Ls.length,Ks.length,dv,pols]}});
 ok(`Todas las combinaciones de los controles (${ex.n.toLocaleString("es-CL")}): cobrado = el mayor entre real y volumétrico, hacia arriba al kg; nunca menor que el real, sin pesos ≤ 0, achicar nunca sube`,ex.bad.length===0&&ex.n===29*29*29*60*2*2,{n:ex.n,dims:ex.dims,bad:ex.bad});
 // ---- entradas inválidas (por enlace o a mano): divisor 0, texto, pesos y medidas negativas
 const inv=await p.evaluate(()=>{const out=[];for(const o of [{div:0},{div:"0"},{div:"abc"},{div:undefined},{div:-5000},{kg:0},{kg:-3},{kg:"x"},{L:-50},{L:0,A:0,H:0},{L:1e6}]){const q=EC.aire(Object.assign({L:50,A:40,H:30,kg:2,div:"5000",pol:"tal"},o));
  out.push([JSON.stringify(o),q.div,q.kg,q.vol,q.cob,[q.vol,q.cob,q.veces].every(Number.isFinite)&&q.div>0&&q.kg>0&&q.vol>0&&q.cob>=q.kg&&q.cob>=q.vol-1e-9])}return out});
 ok("Entradas inválidas: divisor 0 o raro → 5.000; peso ≤ 0 → mínimo positivo; medidas ≤ 0 → 5 cm; nunca NaN ni cobrado menor que el real",inv.every(x=>x[5]&&(x[0].includes("div")?x[1]===5000:true)),inv.filter(x=>!x[5]));
 // ---- barrido de textos ES/EN (consola, ficha, cuenta, biblioteca)
 const sw=await p.evaluate(()=>{const bad=[];let n=0;const s=ECAPP.STATE.aire,G=ECAPP.LAB.aire.game,L=ECAPP.LAB.aire,EQ=ECAPP.dev.EQ,Dd=JSON.stringify(s);const RX=/NaN|undefined|Infinity|∞|−-|--|\[object|null|(^|[^\d,.])1 (veces|times)\b/;
  for(const lg of ["es","en"]){document.getElementById("lang-"+lg).click();
   for(const pol of ["tal","achicar"])for(const div of ["5000","6000"])for(const Lx of [10,45,50,150])for(const A of [10,35,40,150])for(const H of [10,25,30,150])for(const kg of [0.5,2,2.5,30]){const st={L:Lx,A,H,kg,div,pol};n++;const c=EC.aire(st);Object.assign(s,st);
    const txt=JSON.stringify(G.metrics(st))+G.share(st)+G.ouch(st,"tal",pol)+JSON.stringify(L.story(c,st))+L.refLine(c)+L.math.map(x=>x.f(st)+x.s(st)).join("")+G.aha(st)+JSON.stringify(G.score(st))+EQ.mckinnon2015.live()+EQ.ups_sg2024.live()+EQ.ups_sg2024.f();const tv=txt.replace(/<[^>]*>/g,"");
    if(RX.test(tv))bad.push([st,tv.match(RX)[0]]);const sc=G.score(st).score;if(!(sc>=0&&sc<=1000))bad.push(["score",st,sc])}}
  document.getElementById("lang-es").click();Object.assign(s,JSON.parse(Dd));return{n,nb:bad.length,bad:bad.slice(0,5)}});
 ok(`Barrido de ${sw.n} configuraciones en ES y EN: sin NaN ni textos rotos, puntaje entre 0 y 1.000`,sw.nb===0,sw.bad);
 // ---- en el teléfono: enlace del reel, corrida, botón «Achicar 5 cm por lado»
 await p.goto(`${U}?caso=aire&largo=50&ancho=40&alto=30&kilos=2&divisor=5000&regla=tal`);await p.waitForSelector("#play");await p.waitForTimeout(1500);
 const sit=await p.textContent(".sit");ok("Enlace con parámetros: caja de 50×40×30 cm, 2 kg, divisor 5.000",/50×40×30 cm.*2 kg de peso real.*divisor 5\.000/.test(sit),sit);
 await p.screenshot({path:"capturas/aire_inicio.png"});
 await p.tap("#play");await p.waitForTimeout(1900);await p.screenshot({path:"capturas/aire_midiendo.png"});
 await p.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:90000});await p.waitForTimeout(500);
 ok("Resultado del reel: 12 kg cobrados",(await p.textContent("#rv"))==="12",await p.textContent("#rv"));
 const rl=await p.textContent(".rl");ok("…por 2 kg de peso real, 6 veces lo que pesa; 12 kg de peso volumétrico",/por 2 kg de peso real · 6 veces lo que pesa/.test(rl)&&/12 kg de peso volumétrico \(50×40×30 cm ÷ 5\.000\)/.test(await p.textContent(".r2")),[rl,await p.textContent(".r2")]);
 await p.screenshot({path:"capturas/aire_reel_fin.png"});
 const tb=await p.textContent("#trysol");ok("Botón del resultado: «Probar «Achicar 5 cm por lado»»",/Achicar 5 cm por lado/.test(tb),tb);
 await p.tap("#trysol");await p.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:90000});await p.waitForTimeout(900);
 ok("Achicada: 8 kg cobrados",(await p.textContent("#rv"))==="8",await p.textContent("#rv"));
 const aha=await p.textContent(".raha").catch(()=>"");ok("Lección: de 12 a 8 kg cobrados, 33 % menos, lo que mandas sigue pesando 2 kg",/de 12 a 8 kg cobrados, 33 % menos.*2 kg/.test(aha),aha);
 ok("Comparación antes → ahora: −33 %",/−33 %/.test(await p.textContent(".rcmp")),await p.textContent(".rcmp"));
 await p.screenshot({path:"capturas/aire_achicada_fin.png"});
 ok("Sin desborde horizontal a 390 px",await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 // divisor 6.000 · caja justa · enlaces raros
 const run=async q=>{await p.goto(`${U}?caso=aire&${q}`);await p.waitForSelector("#play");await p.waitForTimeout(1200);await p.tap("#play");await p.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:90000});await p.waitForTimeout(400);return p.textContent("#rv")};
 ok("Divisor 6.000: 10 kg cobrados",(await run("largo=50&ancho=40&alto=30&kilos=2&divisor=6000"))==="10");await p.screenshot({path:"capturas/aire_divisor6000_fin.png"});
 ok("Caja justa 25×20×20 con 2 kg: se cobran 2, «lo mismo que pesa», 0 kg de aire, rótulo «25×20×20 cm → 2 kg cobrados»",(await run("largo=25&ancho=20&alto=20&kilos=2"))==="2"&&/lo mismo que pesa/.test(await p.textContent(".rl"))&&await p.evaluate(()=>EC.aire(ECAPP.STATE.aire).aireKg===0&&ECAPP.S.labels.some(l=>/25×20×20 cm → .*2 kg cobrados/.test(l.html))),[await p.textContent(".rl"),await p.evaluate(()=>ECAPP.S.labels.map(l=>l.html))]);await p.screenshot({path:"capturas/aire_caja_justa_fin.png"});
 ok("Enlace con divisor=0: se ignora y queda 5.000 (12 kg)",(await run("largo=50&ancho=40&alto=30&kilos=2&divisor=0"))==="12");
 ok("Enlace con medidas y peso fuera de rango: se ajustan a los controles (10 cm, 0,5 kg)",(await run("largo=-50&ancho=-1&alto=0&kilos=-2"))==="1"&&await p.evaluate(()=>{const s=ECAPP.STATE.aire;return s.L===10&&s.A===10&&s.H===10&&s.kg===0.5}),await p.evaluate(()=>ECAPP.STATE.aire));
 // hojas: los controles y «por qué pasa»
 await p.goto(`${U}?caso=aire&largo=50&ancho=40&alto=30&kilos=2&divisor=5000`);await p.waitForSelector("#play");await p.waitForTimeout(1200);
 await p.tap("[data-sheet=ajustar]");await p.waitForTimeout(900);
 const ctl=await p.evaluate(()=>[...document.querySelectorAll("#sheet-body .ctl")].map(e=>e.textContent.replace(/\s+/g," ").trim()));
 ok("Controles: largo, ancho, alto, peso real y divisor 5.000/6.000 «depende del courier y del servicio»",["Largo","Ancho","Alto","Peso real","Divisor"].every(k=>ctl.some(t=>t.includes(k)))&&ctl.some(t=>/5\.000.*6\.000.*[Dd]epende del courier y del servicio/.test(t)),ctl);
 await p.screenshot({path:"capturas/aire_controles.png"});
 await p.evaluate(()=>ECAPP.closeSheet());await p.waitForTimeout(500);await p.tap(".links [data-sheet=ciencia]");await p.waitForTimeout(900);
 const ci=await p.textContent("#sheet-body");ok("Por qué pasa: la cuenta con tus números (60.000 cm³ ÷ 5.000 = 12 kg; ⌈máx(2, 12)⌉ = 12 kg; 6 veces)",/60\.000 cm³/.test(ci)&&/⌈máx\(2, 12\)⌉ = 12 kg/.test(ci)&&/6 veces/.test(ci),ci.slice(0,200));
 await p.screenshot({path:"capturas/aire_porque.png"});
 await p.evaluate(()=>ECAPP.closeSheet());
 // inglés
 await p.goto(`${U}?caso=aire&regla=achicar`);await p.waitForSelector("#play");await p.evaluate(()=>document.getElementById("lang-en").click());await p.waitForTimeout(800);
 const sitEn=await p.textContent(".sit");await p.tap("#play");await p.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:90000});await p.waitForTimeout(400);
 ok("Inglés: «shrunk to 45×35×25» y «8 kg charged» tras la corrida",/shrunk to 45×35×25/.test(sitEn)&&(await p.textContent("#rv"))==="8"&&/kg charged/.test(await p.textContent(".result")),sitEn);
 await p.screenshot({path:"capturas/aire_en_fin.png"});await p.evaluate(()=>document.getElementById("lang-es").click());
 // reel 17 y biblioteca con APUB=true
 await p.goto(`${U}?reel=17`);await p.waitForTimeout(2000);ok("?reel=17 abre #aire",await p.evaluate(()=>location.hash)==="#aire");
 await p.evaluate(()=>ECAPP.openSheet("aire","reels"));await p.waitForTimeout(700);const lst=await p.evaluate(()=>[...document.querySelectorAll("#sheet-body .mrow")].map(e=>e.textContent.replace(/\s+/g," ").trim()));
 {const g18=/^#18/.test(lst[0]||""),i17=g18?1:0;ok(g18?"Con APUB=true aparece en la lista de reels, tras el #18 (gps publicada): «#17 ¿Por qué un paquete de 2 kilos se cobra como 12?»":"Con APUB=true aparece en la lista de reels, primero: «#17 ¿Por qué un paquete de 2 kilos se cobra como 12?»",/^#17 ?¿Por qué un paquete de 2 kilos se cobra como 12\?/.test(lst[i17]||""),lst.slice(0,3))}await p.screenshot({path:"capturas/aire_lista_reels.png"});await p.evaluate(()=>ECAPP.closeSheet());await p.waitForTimeout(400);
 await p.evaluate(()=>{location.hash="biblioteca"});await p.waitForTimeout(900);const t=await p.textContent("#libintro");
 const LKp=await p.evaluate(()=>!!ECAPP.dev.PUBLICADO.locker),GPp=await p.evaluate(()=>!!ECAPP.dev.PUBLICADO.gps);ok(GPp&&LKp?"Biblioteca con APUB=true: 45 fuentes de quince reels (con el locker y gps)":LKp?"Biblioteca con APUB=true: 43 fuentes de catorce reels (con el locker)":"Biblioteca con APUB=true: 42 fuentes de trece reels",(GPp&&LKp?/Cuarenta y cinco fuentes de quince reels/:LKp?/Cuarenta y tres fuentes de catorce reels/:/Cuarenta y dos fuentes de trece reels/).test(t),t.slice(0,50));
 ok("Biblioteca: McKinnon (pp. 15–16) y la guía de tarifas, sin empresas chilenas en la ficha",await p.evaluate(()=>{const S=ECAPP.SOURCES.filter(s=>s.labs.includes("aire"));const tx=JSON.stringify(S)+JSON.stringify(ECAPP.LAB.aire.notApply);return S.length===2&&/pp\. 15–16/.test(tx)&&/Expedited/.test(tx)&&!/Chilexpress|Starken|Correos de Chile|Blue Express|BlueExpress|Mercado Libre/i.test(tx)}));
 await p.evaluate(()=>ECAPP.openBook("mckinnon2015"));await p.waitForTimeout(900);
 const bk=await p.textContent("body");ok("Libro McKinnon: el dato (≈ ×2) con tus números y «la proporción de cargas… casi se duplicó»",/≈ ×2/.test(bk)&&/Tu caja también se llena por espacio/.test(bk)&&/la proporción de cargas de camión limitadas por volumen/.test(bk)&&/la proporción de cargas limitadas solo o en parte por volumen casi se duplicó/.test(bk));
 ok("McKinnon: siempre la PROPORCIÓN de cargas, nunca «las cargas … se duplicaron» (ficha, libro, «Por qué pasa», ES y EN)",await p.evaluate(()=>{const L=ECAPP.LAB.aire,S=ECAPP.SOURCES.find(s=>s.id==="mckinnon2015"),t=JSON.stringify([L.aha,L.lede,L.notApply,S.idea]);return !/las cargas[^.]{0,40}se duplicaron/.test(t)&&!/UK truck loads constrained/.test(t)&&/proporción de cargas de camión limitadas por volumen casi se duplicó/.test(t)&&/share of truck loads constrained by volume approximately doubled/.test(t)}));
 await p.screenshot({path:"capturas/aire_biblioteca_mckinnon.png"});
 ok("Sin errores de página",errs.length===0,errs.slice(0,3));
 await ctx.close();
 // ---- con APUB=false (como queda la rama): no se lista, no suma fuentes, ?reel=17 no abre
 const q=await mk(false);const e2=[];q.p.on("pageerror",e=>e2.push(e.message));await q.p.goto(`${U}?reel=17`);await q.p.waitForTimeout(2000);
 ok("Con APUB=false: ?reel=17 no abre el laboratorio",await q.p.evaluate(()=>location.hash!=="#aire"),await q.p.evaluate(()=>location.hash));
 await q.p.evaluate(()=>ECAPP.openSheet("co2","reels"));await q.p.waitForTimeout(700);ok("Con APUB=false: no aparece en la lista de reels",!(await q.p.evaluate(()=>[...document.querySelectorAll("#sheet-body .mrow")].some(e=>/#17|2 kilos/.test(e.textContent)))));await q.p.evaluate(()=>ECAPP.closeSheet());await q.p.waitForTimeout(400);
 await q.p.evaluate(()=>{location.hash="biblioteca"});await q.p.waitForTimeout(900);const t2=await q.p.textContent("#libintro");
 const LKq=await q.p.evaluate(()=>!!ECAPP.dev.PUBLICADO.locker),GPq=await q.p.evaluate(()=>!!ECAPP.dev.PUBLICADO.gps);ok(GPq&&LKq?"Con APUB=false: la biblioteca queda en 43 fuentes de catorce reels (con locker y gps), sin McKinnon ni la guía":LKq?"Con APUB=false: la biblioteca queda en 41 fuentes de trece reels (con el locker), sin McKinnon ni la guía":"Con APUB=false: la biblioteca sigue en 40 fuentes de doce reels, sin McKinnon ni la guía",(GPq&&LKq?/Cuarenta y tres fuentes de catorce reels/:LKq?/Cuarenta y una fuentes de trece reels/:/Cuarenta fuentes de doce reels/).test(t2)&&!(await q.p.evaluate(()=>!!document.querySelector('#v-biblioteca [data-id="mckinnon2015"],#v-biblioteca [data-id="ups_sg2024"]')))&&!/Camiones que se llenan por volumen/.test(await q.p.textContent("#v-biblioteca")),t2.slice(0,45));
 ok("Con APUB=false: sin errores de página",e2.length===0,e2.slice(0,3));
 console.log(`${checks.filter(Boolean).length}/${checks.length}`);await b.close();srv.close&&srv.close();process.exit(checks.every(Boolean)?0:1)})().catch(e=>{console.error(e);process.exit(1)});
