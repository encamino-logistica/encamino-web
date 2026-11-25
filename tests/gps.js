// Reel 18 · El GPS contra el conductor: números del estudio (Cook, Held y Helsgaun) y del cálculo propio (calculo_R018),
// barrido de todas las combinaciones sin incoherencias, corrida en el teléfono (390 px), bandera sin publicar y publicada.
// Uso: node tests/gps.js   (prueba GPUB=false tal como está y además fuerza GPUB=true para probar la versión publicada)
const {chromium}=require(process.env.PW||"playwright");const serve=require("./serve.js"),env=require("./env.js");
const checks=[];const ok=(n,c,g)=>{checks.push(!!c);console.log((c?"PASS ":"FAIL ")+n+(g!==undefined?"  → "+JSON.stringify(g):""))};
const fs=require("fs"),path=require("path");const CAP=path.join(__dirname,"..","capturas");if(!fs.existsSync(CAP))fs.mkdirSync(CAP);
(async()=>{const srv=await serve(8799);const b=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const VIEW={viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,locale:"es-CL"};
 /* 1 · sin publicar (GPUB=false, forzado si la rama ya la encendió): no se lista, pero el enlace directo funciona */
 {const ctx=await b.newContext(VIEW);await ctx.route("**/index.html*",async r=>{const x=await r.fetch();await r.fulfill({response:x,body:(await x.text()).replace("const GPUB=true;","const GPUB=false;")})});const p=await ctx.newPage();await env(p);const errs=[];p.on("pageerror",e=>errs.push(e.message));
  await p.goto("http://127.0.0.1:8799/index.html");await p.waitForTimeout(2500);
  const home=await p.evaluate(()=>document.body.innerText);
  await p.goto("http://127.0.0.1:8799/index.html?reel=18");await p.waitForTimeout(2000);const h18=await p.evaluate(()=>location.hash);
  await p.evaluate(()=>{location.hash="biblioteca"});await p.waitForTimeout(800);const bib=await p.evaluate(()=>!!document.querySelector(`#v-biblioteca [data-book="cook2021"]`)||!!document.querySelector(`#v-biblioteca [data-book="encamino_r018"]`));
  const pub={enPortada:/El GPS contra el conductor/.test(home),reel18:h18,enBiblioteca:bib};
  {const ti=await p.textContent("#libintro"),IP=await p.evaluate(()=>!!ECAPP.dev.PUBLICADO.inventario);const FX=await p.evaluate(()=>!!ECAPP.dev.PUBLICADO.fedex);ok(FX&&IP?"Con GPUB=false la biblioteca queda en 50 fuentes de dieciséis reels (con inventario y fedex)":IP?"Con GPUB=false la biblioteca queda en 46 fuentes de quince reels (con inventario)":"Con GPUB=false la biblioteca sigue en 43 fuentes de catorce reels",(FX&&IP?/Cincuenta fuentes de dieciséis reels/:IP?/Cuarenta y seis fuentes de quince reels/:/Cuarenta y tres fuentes de catorce reels/).test(ti),ti.slice(0,48))}
  ok("Bandera GPUB=false: el laboratorio no sale en la portada, ?reel=18 no lo abre y sus fuentes no salen en la biblioteca",!pub.enPortada&&pub.reel18!=="#gps"&&!pub.enBiblioteca,pub);
  await p.goto("http://127.0.0.1:8799/index.html?caso=gps");await p.waitForSelector("#play");await p.waitForTimeout(1200);
  ok("Sin publicar, el enlace directo ?caso=gps abre el laboratorio",await p.evaluate(()=>location.hash)==="#gps",await p.evaluate(()=>location.hash));
  ok("Sin errores de página (GPUB=false)",errs.length===0,errs.slice(0,3));await ctx.close()}
 /* 2 · publicado (GPUB=true, forzado si la rama la tiene apagada) */
 const GPUB_RAMA=/const GPUB=true;/.test(require("fs").readFileSync(require("path").join(__dirname,"..","index.html"),"utf8"));ok("Bandera en el index.html de la rama: GPUB="+GPUB_RAMA,true);
 const ctx=await b.newContext(VIEW);
 await ctx.route("**/index.html*",async r=>{const x=await r.fetch();await r.fulfill({response:x,body:(await x.text()).replace("const GPUB=false;","const GPUB=true;")})});
 const p=await ctx.newPage();await env(p);const errs=[];p.on("pageerror",e=>errs.push(e.message));
 await p.goto("http://127.0.0.1:8799/index.html");await p.waitForTimeout(2500);
 const E=await p.evaluate(()=>EC.gpsEstudio());
 ok("Estudio · conductor 12.250,0 s contra óptima 10.853,3 s: +12,9 % (12,87 %)",Math.abs(E.extraPct-12.87)<0.005&&Math.round(E.extraPct*10)/10===12.9,E.extraPct);
 ok("Estudio · terminar cada zona: +3,5 % (3,52 %) sobre la óptima",Math.abs(E.zonPct-3.52)<0.005&&Math.round(E.zonPct*10)/10===3.5,E.zonPct);
 ok("Estudio · relojes 3 h 01 y 3 h 24; 23,3 min de diferencia; el orden por zonas explica 27 %",E.relOpt.join()==="3,1"&&E.relCond.join()==="3,24"&&Math.abs(E.extraMin-23.3)<0.05&&Math.round(E.explica)===27,[E.relOpt,E.relCond,E.extraMin,E.explica]);
 ok("Cálculo propio · empate 1.396,7 s ÷ 20 barrios = 1,164 min («más de un minuto por barrio»)",Math.abs(E.extraS-1396.7)<1e-6&&Math.round(E.empMin*1000)/1000===1.164&&E.empMin>1&&E.zonas===20,[E.extraS,E.empMin]);
 const R=await p.evaluate(()=>{const a=EC.gps({B:20,m:7,g:0,v:20,seed:0,pol:"corta"}),c=EC.gps({B:20,m:7,g:1.2,v:20,seed:0,pol:"barrios"});return{kC:a.kC,kB:a.kB,extra:a.extra,gEmp:a.gEmp,faltan:a.faltan,ent:a.entradas,una:a.unaC,tC:c.tC,tB:c.tB,gana:c.gana,par:a.paradas}});
 ok("Ciudad del ejemplo (20 barrios × 7 paradas): la más corta ≤ barrio por barrio, que cuesta unos pocos % (como el 3,5 % del estudio)",R.par===140&&R.kC<=R.kB&&R.extra>0&&R.extra<0.08,R);
 ok("Ciudad del ejemplo: empate positivo y finito; con 1,2 min por barrio gana barrio por barrio",R.gEmp>0&&isFinite(R.gEmp)&&R.gana==="barrios"&&R.tB<R.tC,R);
 /* barrido de TODAS las combinaciones de barrios y paradas, con ciudades, minutos, velocidades y las dos reglas, en ES y EN */
 const sw=await p.evaluate(()=>{const bad=[];let n=0,nMap=0;const s=ECAPP.STATE.gps,G=ECAPP.LAB.gps.game,L=ECAPP.LAB.gps,Dd=JSON.stringify(s);const RX=/NaN|undefined|Infinity|∞|−-|--|\[object|null/;
  for(const lg of ["es","en"]){document.getElementById("lang-"+lg).click();
   for(let B=4;B<=20;B++)for(let m=3;m<=8;m++)for(const seed of [0,1,7,20]){
    const a=EC.gps({B,m,seed,v:20,g:0,pol:"corta"});if(lg==="es"){nMap++;const N=a.p.length;
     /* rutas que se saltan paradas o repiten */
     for(const [nom,o] of [["corta",a.oc],["barrios",a.ob]]){if(o.length!==N||new Set(o).size!==N||o[0]!==0||o.some(i=>i<0||i>=N))bad.push(["salta paradas",nom,{B,m,seed}])}
     if(N!==B*m+1)bad.push(["paradas",{B,m,seed},N]);
     /* barrio por barrio de verdad: cada barrio aparece en un solo tramo seguido */
     if(a.unaB!==B)bad.push(["barrio partido",{B,m,seed},a.unaB]);
     if(!(a.kC>0&&a.kB>0&&a.kC<=a.kB+1e-9))bad.push(["km",{B,m,seed},a.kC,a.kB]);
     if(!(a.entradas>=B&&a.unaC<=B&&a.faltan===B-a.unaC))bad.push(["entradas",{B,m,seed},a.entradas,a.unaC]);
     if((a.gEmp===null)!==(a.faltan===0)||(a.gEmp!==null&&!(a.gEmp>=0&&isFinite(a.gEmp))))bad.push(["empate",{B,m,seed},a.gEmp,a.faltan]);
     /* el empate tiene sentido: con g = g* las dos rutas suman lo mismo; por encima gana barrio por barrio; por debajo, la más corta */
     if(a.gEmp!==null&&a.extraMin>1e-9){const e=EC.gps({B,m,seed,v:20,g:a.gEmp,pol:"barrios"}),up=EC.gps({B,m,seed,v:20,g:a.gEmp+0.05,pol:"barrios"}),dn=EC.gps({B,m,seed,v:20,g:Math.max(0,a.gEmp-0.05),pol:"barrios"});
      if(Math.abs(e.tC-e.tB)>1e-6)bad.push(["empate no empata",{B,m,seed},e.tC,e.tB]);if(up.gana!=="barrios")bad.push(["sobre el empate no gana el conductor",{B,m,seed}]);if(a.gEmp>0.05&&dn.gana!=="corta")bad.push(["bajo el empate no gana el GPS",{B,m,seed}])}}
    for(const pol of ["corta","barrios"])for(const g of [0,1.2,3])for(const v of [10,20,40]){const st={B,m,g,v,seed,pol};n++;const c=EC.gps(st);
     if(!(c.km>0&&c.min>0&&c.t>0&&c.porBarrio>0))bad.push(["negativo",st,c.km,c.min,c.t]);
     if(Math.abs(c.minB-c.minC-(c.kB-c.kC)/v*60)>1e-9)bad.push(["minutos",st]);
     const txt=JSON.stringify(G.metrics(st))+G.share(st)+G.ouch(st,"corta",pol)+JSON.stringify(L.story(c,st))+L.math.map(x=>x.s(st)).join("")+G.aha(st)+JSON.stringify(G.score(st))+L.refLine(c);if(RX.test(txt))bad.push([st,txt.match(RX)[0]]);
     /* la cuenta bajo el número grande: manejo − ganado = total, y el total es el número grande */
     {const M=G.metrics(st)[0],num=x=>lg==="es"?+x.replace(/\./g,"").replace(",","."):+x.replace(/,/g,""),mm=M.l.match(/^([\d.,]+) min (?:de manejo|of driving) − ([\d.,]+) min (?:ganados|gained) .+ = ([\d.,]+) min$/);
      if(!mm||Math.abs(num(mm[1])-num(mm[2])-num(mm[3]))>1e-6||mm[3]!==M.v||Math.abs(num(mm[1])-c.min)>0.5+1e-9||Math.abs(num(mm[3])-c.t)>0.5+1e-9)bad.push(["cuenta",st,M.l,M.v])}
     const sc=G.score(st).score;if(!(sc>=0&&sc<=1000))bad.push(["score",st,sc])}}}
  document.getElementById("lang-es").click();Object.assign(s,JSON.parse(Dd));return{n,nMap,nb:bad.length,bad:bad.slice(0,6)}});
 ok(`Barrido: ${sw.nMap} mapas (barrios 4–20 × paradas 3–8 × 4 ciudades) y ${sw.n} configuraciones en ES y EN — sin km ni minutos negativos, sin rutas que se salten paradas, barrios sin partir, empate con sentido, sin NaN ni textos rotos`,sw.nb===0,sw.bad);
 /* corrida en el teléfono y capturas a 390 px */
 let SIT="";const run=async(q,f)=>{await p.goto("http://127.0.0.1:8799/index.html?"+q);await p.waitForSelector("#play");await p.waitForTimeout(1500);SIT=await p.textContent(".sit");if(f)await p.screenshot({path:path.join(CAP,f+"_antes.png")});
  await p.tap("#play");await p.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:90000});await p.waitForTimeout(500);if(f)await p.screenshot({path:path.join(CAP,f+"_fin.png")});return(await p.textContent("#rv"))};
 const rv1=await run("caso=gps&barrios=20&paradas=7&minutos=0&velocidad=20&ciudad=0&regla=corta","gps_corta");
 ok("Enlace con parámetros: 20 barrios, 7 paradas por barrio, la más corta",/20 barrios.*7 paradas por barrio.*La más corta/.test(SIT),SIT);
 const exp1=await p.evaluate(()=>ECAPP.metrics("gps")[0].v);ok("Resultado de la más corta en el teléfono = el modelo",rv1===exp1,[rv1,exp1]);
 const rv2=await run("caso=gps&barrios=20&paradas=7&minutos=0&velocidad=20&ciudad=0&regla=barrios","gps_barrios");
 const exp2=await p.evaluate(()=>ECAPP.metrics("gps")[0].v);ok("Barrio por barrio sin ganancia: más minutos que la más corta",rv2===exp2&&+rv2.replace(/\./g,"")>=+rv1.replace(/\./g,""),[rv1,rv2]);
 const rv3=await run("caso=gps&barrios=20&paradas=7&minutos=1.2&velocidad=20&ciudad=0&regla=barrios","gps_barrios_12");
 const exp3=await p.evaluate(()=>ECAPP.metrics("gps")[0].v);ok("Barrio por barrio con 1,2 min por barrio: gana a la más corta",rv3===exp3&&+rv3.replace(/\./g,"")<+rv1.replace(/\./g,""),[rv1,rv3]);
 const cuenta=await p.evaluate(()=>{const t=document.body.innerText.replace(/\u00a0/g," "),m=ECAPP.metrics("gps")[0];return{vis:t.includes(m.l),l:m.l,map:t.includes("km · "+m.v+" min"),v:m.v}});
 ok("Barrio por barrio con 1,2 min: bajo el número grande se ve «193 min de manejo − 24 min ganados por terminar cada barrio = 169 min» y el mapa dice el mismo total",cuenta.vis&&cuenta.l==="193 min de manejo − 24 min ganados por terminar cada barrio = 169 min"&&cuenta.map&&cuenta.v==="169",cuenta);
 await p.evaluate(()=>document.getElementById("lang-en").click());await p.waitForTimeout(600);
 await run("caso=gps&barrios=20&paradas=7&minutos=1.2&velocidad=20&ciudad=0&regla=barrios","gps_en_barrios_12");
 const cuentaEn=await p.evaluate(()=>{const t=document.body.innerText.replace(/\u00a0/g," "),m=ECAPP.metrics("gps")[0];return{vis:t.includes(m.l),l:m.l,map:t.includes("km · "+m.v+" min"),v:m.v}});
 ok("Lo mismo en inglés: «193 min of driving − 24 min gained for finishing each neighbourhood = 169 min» y el mapa con 169 min",cuentaEn.vis&&cuentaEn.l==="193 min of driving − 24 min gained for finishing each neighbourhood = 169 min"&&cuentaEn.map&&cuentaEn.v==="169",cuentaEn);
 await p.evaluate(()=>document.getElementById("lang-es").click());await p.waitForTimeout(400);
 ok("Sin desborde horizontal a 390 px",await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await p.evaluate(()=>ECAPP.openSheet("gps","ciencia"));await p.waitForTimeout(600);
 const sh=(await p.textContent("#sheet")).replace(/ /g," ");
 ok("«Por qué pasa» muestra el estudio (+12,9 %, +3,5 %) y el empate como cálculo propio (1,164 min por barrio)",["+12,9 %","+3,5 %","1,164 min","cálculo propio"].every(x=>sh.includes(x)),sh.slice(0,200));
 ok("«Por qué pasa» deja los supuestos a la vista (mapa inventado, línea recta, minutos por barrio son un supuesto)",["El mapa es inventado","línea recta","supuesto tuyo"].every(x=>sh.includes(x)));
 await p.screenshot({path:path.join(CAP,"gps_porque.png")});
 ok("«Por qué pasa» sin desborde a 390 px",await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await p.evaluate(()=>ECAPP.closeSheet&&ECAPP.closeSheet());
 const marcas=await p.evaluate(()=>{const L=ECAPP.LAB.gps,G=L.game,st=ECAPP.STATE.gps;const SRC=ECAPP.SOURCES.filter(x=>x.labs.includes("gps"));return JSON.stringify([L.lede,L.aha,L.notApply,L.q,L.short,L.kicker,L.reto.intro,L.reto.cost,G.rule,G.chips,G.cta,SRC.map(x=>[x.idea,x.ti,x.ve,x.sp,x.spEn])])+L.math.map(m=>m.p()+m.s(st)).join("")+G.aha(st)+G.share(st)});
 ok("Sin empresas ni apps nombradas en el laboratorio ni en sus fuentes",!/amazon|google|waze|\bups\b|fedex|dhl|uber|rappi|mercado ?libre/i.test(marcas),(marcas.match(/amazon|google|waze|\bups\b|fedex|dhl|uber|rappi|mercado ?libre/i)||[])[0]);
 await p.goto("http://127.0.0.1:8799/index.html?reel=18");await p.waitForTimeout(2000);ok("Publicado: ?reel=18 abre #gps",await p.evaluate(()=>location.hash)==="#gps");
 await p.evaluate(()=>{location.hash="biblioteca"});await p.waitForTimeout(800);
 await p.evaluate(()=>ECAPP.openSheet("gps","reels"));await p.waitForTimeout(700);{const lst=await p.evaluate(()=>[...document.querySelectorAll("#sheet-body .mrow")].map(e=>e.textContent.replace(/\s+/g," ").trim())),DST=await p.evaluate(()=>{const d=ECAPP.dev.DESTACADO;return d&&d!=="gps"&&ECAPP.dev.PUBLICADO[d]!==false?d:null});ok(DST?"Publicado: en la lista de reels justo después del destacado ("+DST+"): «#18 ¿Quién arma mejor la ruta: el GPS o el conductor?»":"Publicado: aparece primero en la lista de reels: «#18 ¿Quién arma mejor la ruta: el GPS o el conductor?»",/^#18 ?¿Quién arma mejor la ruta: el GPS o el conductor\?/.test(lst[DST?1:0]||""),lst.slice(0,3));await p.screenshot({path:path.join(CAP,"gps_lista_reels.png")});await p.evaluate(()=>ECAPP.closeSheet());await p.waitForTimeout(400);await p.evaluate(()=>{location.hash="biblioteca"});await p.waitForTimeout(800)}
 {const ti=await p.textContent("#libintro"),pp=await p.evaluate(()=>!!ECAPP.dev.PUBLICADO.aire&&!!ECAPP.dev.PUBLICADO.locker),IP=await p.evaluate(()=>!!ECAPP.dev.PUBLICADO.inventario),FX=await p.evaluate(()=>!!ECAPP.dev.PUBLICADO.fedex);ok(pp&&IP&&FX?"Publicado: la biblioteca pasa a 52 fuentes, de diecisiete reels (con inventario y fedex)":pp&&IP?"Publicado: la biblioteca pasa de 46 a 48 fuentes, de dieciséis reels (con inventario)":pp&&FX?"Publicado: 49 fuentes de dieciséis reels (con fedex)":pp?"Publicado: la biblioteca pasa de 43 a 45 fuentes, de quince reels":"Publicado: la biblioteca suma 2 fuentes",pp&&IP&&FX?/Cincuenta y dos fuentes de diecisiete reels/.test(ti):pp&&IP?/Cuarenta y ocho fuentes de dieciséis reels/.test(ti):pp&&FX?/Cuarenta y nueve fuentes de dieciséis reels/.test(ti):pp?/Cuarenta y cinco fuentes de quince reels/.test(ti):true,ti.slice(0,48))}
 ok("Publicado: la biblioteca trae Cook, Held y Helsgaun y el cálculo propio de En Camino",await p.evaluate(()=>!!document.querySelector(`#v-biblioteca [data-book="cook2021"]`)&&!!document.querySelector(`#v-biblioteca [data-book="encamino_r018"]`)));
 await p.evaluate(()=>ECAPP.openBook("cook2021"));await p.waitForTimeout(600);await p.screenshot({path:path.join(CAP,"gps_libro.png")});
 const bk=await p.evaluate(()=>{const pg=document.querySelector(".bk-page");return{eq:!!(pg.querySelector(".beq")||pg.querySelector(".bigstat")),live:!!pg.querySelector(".blive"),t:pg.textContent}});
 ok("Libro de Cook, Held y Helsgaun: fórmula y cuenta en vivo con la ciudad del visitante",bk.eq&&bk.live&&/2112\.15192/.test(bk.t),bk.t.slice(0,120));
 ok("Sin errores de página (GPUB=true)",errs.length===0,errs.slice(0,3));
 console.log(`${checks.filter(Boolean).length}/${checks.length}`);await b.close();srv.close&&srv.close();process.exit(checks.every(Boolean)?0:1)})().catch(e=>{console.error(e);process.exit(1)});
