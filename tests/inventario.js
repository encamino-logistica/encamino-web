// Reel 15 · Inventario fantasma (Kang y Gershwin): el número del reel contra el paper y contra la réplica de Python
// (salidas/R015/replica_kang_gershwin.py y resultados.json), TODAS las combinaciones de los controles (pérdida 0–7 % de a 0,1 ×
// conteo nunca/6 meses/3 meses/1 mes/1 semana × restar sí/no) sin stock negativo, sin % sobre 100, sin NaN y sin quiebre con
// ventas perdidas 0; textos ES/EN, entradas inválidas, corrida y capturas a 390 px, biblioteca, bandera sin publicar y publicada.
// Uso: node tests/inventario.js   (prueba IPUB tal como está en la rama, fuerza IPUB=false y luego IPUB=true)
const {chromium}=require(process.env.PW||"playwright");const serve=require("./serve.js"),env=require("./env.js");
const checks=[];const ok=(n,c,g)=>{checks.push(!!c);console.log((c?"PASS ":"FAIL ")+n+(g!==undefined?"  → "+JSON.stringify(g):""))};
const fs=require("fs"),path=require("path");const CAP=path.join(__dirname,"..","capturas");if(!fs.existsSync(CAP))fs.mkdirSync(CAP);const shot=f=>path.join(CAP,"inventario_"+f+".png");
const PORT=8806,U=`http://127.0.0.1:${PORT}/index.html`;
/* réplica de Python (resultados.json del 17-11-2026, regla proporcional, 500 corridas, semilla 20261117) */
const PY={nada1:0.16546040213166127,nada0:0.0042458910127197835,nada2:0.4157990025067913,nada24:0.5147279787249304,restar1:0.01197,c182:0.07685,nada3:0.60703};
(async()=>{const srv=await serve(PORT);const b=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const VIEW={viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,locale:"es-CL"};
 const IPUB_RAMA=/const IPUB=true;/.test(fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8"));ok("Bandera en el index.html de la rama: IPUB="+IPUB_RAMA,true);
 const mk=async on=>{const ctx=await b.newContext(VIEW);await ctx.route("**/index.html*",async r=>{const x=await r.fetch(),t=await x.text();await r.fulfill({response:x,body:on?t.replace("const IPUB=false;","const IPUB=true;"):t.replace("const IPUB=true;","const IPUB=false;")})});const p=await ctx.newPage();await env(p);const errs=[];p.on("pageerror",e=>errs.push(e.message));return{ctx,p,errs}};
 /* 1 · sin publicar */
 {const{ctx,p,errs}=await mk(false);await p.goto(U);await p.waitForTimeout(2500);const home=await p.evaluate(()=>document.body.innerText);
  await p.goto(U+"?reel=15");await p.waitForTimeout(2000);const h15=await p.evaluate(()=>location.hash);
  await p.evaluate(()=>{location.hash="biblioteca"});await p.waitForTimeout(800);
  const bib=await p.evaluate(()=>["kang2005","ecr2001","dehoratius2008"].some(k=>!!document.querySelector(`#v-biblioteca [data-book="${k}"]`)));const ti=await p.textContent("#libintro");
  ok("IPUB=false: no sale en la portada, ?reel=15 no lo abre y sus fuentes no salen en la biblioteca",!/Inventario fantasma|el sistema dice que hay stock/.test(home)&&h15!=="#inventario"&&!bib,{h15,bib});
  {const FX=await p.evaluate(()=>!!ECAPP.dev.PUBLICADO.fedex);ok(FX?"IPUB=false: la biblioteca queda en 49 fuentes de dieciséis reels (fedex publicada)":"IPUB=false: la biblioteca sigue en 45 fuentes de quince reels",(FX?/Cuarenta y nueve fuentes de dieciséis reels/:/Cuarenta y cinco fuentes de quince reels/).test(ti),ti.slice(0,48))}
  await p.goto(U+"?caso=inventario");await p.waitForSelector("#play");await p.waitForTimeout(1200);
  ok("Sin publicar, el enlace directo ?caso=inventario abre el laboratorio",await p.evaluate(()=>location.hash)==="#inventario");
  ok("Sin errores de página (IPUB=false)",errs.length===0,errs.slice(0,3));await ctx.close()}
 /* 2 · publicado */
 const{ctx,p,errs}=await mk(true);await p.goto(U);await p.waitForTimeout(2500);
 /* el número del reel y la tolerancia medida */
 const N=await p.evaluate(()=>{const f=(p,N,pol)=>{const r=EC.inventario({p,N,pol});return{q:r.q,p10:r.p10,p90:r.p90,mult:r.mult,real:r.perdReal,vac:r.vacio}};
  return{nada1:f(1,"0","nada"),nada0:f(0,"0","nada"),nada2:f(2,"0","nada"),nada24:f(2.4,"0","nada"),restar1:f(1,"0","restar"),c182:f(1,"182","nada"),nada3:f(3,"0","nada"),INV:EC.INV}});
 const d1=N.nada1.q-0.17,dPy=N.nada1.q-PY.nada1;
 console.log(`   medido: pérdida 1 % → ${(N.nada1.q*100).toFixed(3)} % (p10–p90 ${(N.nada1.p10*100).toFixed(1)}–${(N.nada1.p90*100).toFixed(1)} %) · paper 17 %: diferencia ${(d1*100).toFixed(3)} puntos · Python ${(PY.nada1*100).toFixed(3)} %: diferencia ${(dPy*100).toFixed(3)} puntos`);
 ok("Parámetros del paper (pp. 8–9): Q 50, R 41, L 3, demanda media 10 y desviación 2, 365 días, 500 corridas, semilla 20261117",JSON.stringify(N.INV)===JSON.stringify({MU:10,SIG:2,L:3,Q:50,R:41,DIAS:365,CORR:500,SEED:20261117,CONTEOS:[0,182,91,30,7]}),N.INV);
 ok("Número del reel: se pierde 1 de cada 100 → se dejan de vender 17 de cada 100 (redondeado), a menos de 1 punto del 17 % del paper (p. 10)",Math.round(N.nada1.q*100)===17&&Math.abs(d1)<0.01,N.nada1.q);
 ok("Misma réplica que Python (16,546 %): a menos de 0,1 punto",Math.abs(dPy)<0.001,dPy);
 ok("Sin pérdida: el sistema pierde ~0,5 % de la demanda (la meta del paper con R = 41, p. 9); Python 0,42 %",N.nada0.q>0.002&&N.nada0.q<0.008&&Math.abs(N.nada0.q-PY.nada0)<0.002&&N.nada0.mult===null,N.nada0);
 ok("Ventas perdidas de diez a veinte veces lo perdido (p. 10): con 1 % el multiplicador está entre 10 y 20",N.nada1.mult>=10&&N.nada1.mult<=20.5,N.nada1.mult);
 const tab=[["2 %",N.nada2.q,PY.nada2],["2,4 % (paper: más de la mitad, p. 10)",N.nada24.q,PY.nada24],["3 %",N.nada3.q,PY.nada3],["1 % restando la pérdida",N.restar1.q,PY.restar1],["1 %, contar cada 182 días (Python: días 182 y 365)",N.c182.q,PY.c182]];
 tab.forEach(t=>console.log(`   ${t[0]}: JS ${(t[1]*100).toFixed(2)} % · Python ${(t[2]*100).toFixed(2)} % · diferencia ${((t[1]-t[2])*100).toFixed(2)} puntos`));
 ok("Los otros casos de la réplica de Python, a menos de 1 punto (2 %, 2,4 %, 3 %, restar, contar)",tab.every(t=>Math.abs(t[1]-t[2])<0.01),tab.map(t=>[t[0],+(100*(t[1]-t[2])).toFixed(2)]));
 ok("Con 2,4 % se pierde más de la mitad de la demanda (p. 10)",N.nada24.q>0.5,N.nada24.q);
 ok("Restar la pérdida estimada con 1 %: mejora mucho, pero no llega a cero (p. 18)",N.restar1.q<0.03&&N.restar1.q>0,N.restar1.q);
 /* TODAS las combinaciones de los controles, con los 500 años de cada una */
 const sw=await p.evaluate(()=>{const G=ECAPP.LAB.inventario.game,pols=G.rule.opts.map(o=>o[0]),Ns=G.sliders.find(x=>x.k==="N").opts.map(o=>o[0]),sl=G.sliders.find(x=>x.k==="p");
  const ps=[];for(let i=Math.round(sl.min*10);i<=Math.round(sl.max*10);i+=Math.round(sl.step*10))ps.push(i/10);const bad=[];let n=0,anios=0,dias=0;
  for(const p of ps)for(const N of Ns)for(const pol of pols){n++;const st={p,N,pol},r=EC.inventario(st),e=[];
   const fin=[r.q,r.p10,r.p90,r.perdReal,r.vacio,r.cong,r.stock,r.registro,r.finX,r.finXr,r.demAnio,r.perdidasAnio,r.unidadesPerdidas,r.score,r.ref].every(Number.isFinite);if(!fin)e.push("NaN o infinito");
   if(r.q<0||r.q>1||r.p10<0||r.p90>1||r.perdReal<0||r.perdReal>1)e.push("% fuera de 0–100");if(!(r.p10<=r.q+1e-12&&r.q<=r.p90+1e-12))e.push("p10 ≤ promedio ≤ p90");
   if(r.vacio<0||r.vacio>365||r.cong<0||r.cong>365)e.push("días fuera de 0–365");if(r.finX<0||r.stock<0)e.push("stock negativo");
   if((r.vacio===0)!==(r.perdidasAnio===0)||(r.q===0)!==(r.perdidasAnio===0))e.push("quiebre sin ventas perdidas o al revés");
   if(r.p===0&&(r.perdReal!==0||r.mult!==null))e.push("pérdida 0");if(r.p>0&&r.mult!==null&&!(r.mult>=0))e.push("multiplicador");
   if(!(r.score>=0&&r.score<=1000))e.push("puntaje");
   /* los 500 años, uno por uno */
   for(let k=0;k<EC.INV.CORR;k++){const y=EC.invAnio(r.lam,r.N,r.restar,k,false);anios++;if(y.x<0||y.st<0)e.push("año "+k+": stock negativo");if(y.q<0||y.q>1)e.push("año "+k+": %");if((y.vac===0)!==(y.pv===0))e.push("año "+k+": quiebre sin ventas perdidas");if(![y.q,y.x,y.xr,y.st].every(Number.isFinite))e.push("año "+k+": NaN")}
   /* el año típico que se dibuja, día por día: lo que muestra la pantalla y el estante nunca es negativo */
   const T=r.tipico;for(let i=0;i<365;i++){dias++;const sx=Math.max(0,Math.round(T.xr[i]));if(T.x[i]<0||sx<0||T.lost[i]<0||!Number.isFinite(T.xr[i]))e.push("día "+(i+1)+" negativo o NaN");if(T.cuenta[i]&&Math.abs(T.xr[i]-T.x[i])>1e-9)e.push("día "+(i+1)+": contar no iguala")}
   if(T.lost.filter(v=>v>0).length!==r.tvac)e.push("días vacíos del año típico");
   if(e.length&&bad.length<6)bad.push([st,[...new Set(e)].slice(0,3)])}
  return{n,anios,dias,ps:ps.length,Ns,pols,bad}});
 ok(`Todas las combinaciones de los controles: ${sw.n} (${sw.ps} pérdidas × ${sw.Ns.length} conteos × ${sw.pols.length} reglas), ${sw.anios.toLocaleString("es-CL")} años simulados uno por uno — sin stock negativo, sin % sobre 100, sin NaN, sin quiebre con ventas perdidas 0`,sw.bad.length===0&&sw.n===71*5*2&&sw.anios===sw.n*500,{n:sw.n,bad:sw.bad});
 /* remedios: a igual pérdida, restar o contar nunca empeora frente a no hacer nada (desde 0,5 %) */
 const rem=await p.evaluate(()=>{const bad=[];for(let i=5;i<=70;i++){const p=i/10,n=EC.inventario({p,N:"0",pol:"nada"}).q;for(const N of ["0","182","91","30","7"])for(const pol of ["nada","restar"]){if(N==="0"&&pol==="nada")continue;const q=EC.inventario({p,N,pol}).q;if(q>n+1e-9)bad.push([p,N,pol,q,n])}}return bad});
 ok("Con pérdida desde 0,5 %, restar o contar nunca dejan más ventas perdidas que no hacer nada",rem.length===0,rem.slice(0,4));
 /* entradas inválidas */
 const inv=await p.evaluate(()=>[{p:-3},{p:50},{p:"x"},{p:undefined},{N:"abc"},{N:-7},{N:"8"},{pol:"otra"}].map(o=>{const r=EC.inventario(Object.assign({p:1,N:"0",pol:"nada"},o));return[JSON.stringify(o),r.p,r.N,r.restar,Number.isFinite(r.q)&&r.q>=0&&r.q<=1]}));
 ok("Entradas inválidas: pérdida bajo 0 → 0, sobre 7 → 7, texto → 0; conteo raro → nunca; regla rara → no hacer nada; nunca NaN",inv.every(x=>x[4])&&inv[0][1]===0&&inv[1][1]===7&&inv[2][1]===0&&inv[4][2]===0&&inv[5][2]===0&&inv[6][2]===0&&inv[7][3]===false,inv);
 /* barrido de textos ES/EN */
 const tx=await p.evaluate(()=>{const s=ECAPP.STATE.inventario,G=ECAPP.LAB.inventario.game,L=ECAPP.LAB.inventario,EQ=ECAPP.dev.EQ,Dd=JSON.stringify(s),RX=/NaN|undefined|Infinity|∞|−-|--|\[object|null/,bad=[];let n=0;
  for(const lg of ["es","en"]){document.getElementById("lang-"+lg).click();
   for(let i=0;i<=70;i++)for(const N of ["0","182","91","30","7"])for(const pol of ["nada","restar"]){const st={p:i/10,N,pol};Object.assign(s,st);n++;const r=EC.inventario(st);
    const t=(JSON.stringify(G.metrics(st))+G.share(st)+G.ouch(st,"nada",pol)+JSON.stringify(L.story(r,st))+L.refLine(r)+L.math.map(x=>x.f(st)+x.s(st)).join("")+G.aha(st)+JSON.stringify(G.score(st))+["kang2005","ecr2001","dehoratius2008"].map(k=>EQ[k].live()+EQ[k].f()+EQ[k].stat()).join("")).replace(/<[^>]*>/g,"");
    if(RX.test(t))bad.push([lg,st,t.match(RX)[0]]);const pcts=[...t.matchAll(/(\d+(?:[.,]\d+)?) ?%/g)].map(m=>+(lg==="es"?m[1].replace(",","."):m[1]));if(pcts.some(v=>v>100))bad.push([lg,st,"% > 100"]);
    if(lg==="es"&&/\bcajas?\b/i.test(t))bad.push([st,"caja"])}}
  document.getElementById("lang-es").click();Object.assign(s,JSON.parse(Dd));return{n,bad:bad.slice(0,5),nb:bad.length}});
 ok(`Barrido de textos: ${tx.n} configuraciones en ES y EN, sin NaN ni textos rotos, ningún % sobre 100, «contenedor» y nunca «caja»`,tx.nb===0,tx.bad);
 /* textos fijos del laboratorio: «caja», empresas, cifras coherentes con el paquete fijado */
 const fijo=await p.evaluate(()=>{const L=ECAPP.LAB.inventario,G=L.game,SRC=ECAPP.SOURCES.filter(x=>x.labs.includes("inventario")),B=ECAPP.dev.BIB||{};
  return JSON.stringify([L.lede,L.aha,L.notApply,L.q,L.short,L.kicker,G.rule,G.sliders,G.chips,G.cta,SRC.map(x=>[x.idea,x.ti,x.ve,x.sp,x.spEn,x.au]),["kang2005","ecr2001","dehoratius2008"].map(k=>B[k]||"")])});
 ok("Ningún texto del laboratorio, de sus fuentes ni de sus fichas dice «caja»",!/\bcajas?\b/i.test(fijo),(fijo.match(/.{30}\bcajas?\b.{30}/i)||[])[0]);
 const EMP=/falabella|ripley|paris\b|l[ií]der\b|walmart|jumbo|cencosud|tottus|unimarc|sodimac|easy\b|mercado ?libre|amazon|santa isabel|hites|abcdin|la polar|corona\b|copec|chilexpress|starken|correos de chile|blue ?express/i;
 ok("Sin empresas chilenas (ni otras) nombradas en el laboratorio, sus fuentes y sus fichas",!EMP.test(fijo),(fijo.match(EMP)||[])[0]);
 ok("Fuentes coherentes con el fijado de R015: 1 de cada 100 → 17 % (Kang y Gershwin), ~1 % de las ventas sin explicación (ECR, citado por Kang y Gershwin), 370.000 registros, 37 tiendas, 65 % (DeHoratius y Raman)",
  ["1 de cada 100","17 %","1 % de las ventas","citado por Kang y Gershwin","370.000","37 tiendas","65 %","IIE Transactions","Management Science 54(4)"].every(x=>fijo.includes(x)));
 ok("Cada cifra con su página: p. 5 (ECR), p. 9 y p. 10 (modelo y 17 %), p. 18 (restar), pp. 19–21 (estimación), p. 627 (DeHoratius y Raman)",["p. 5","p. 9","p. 10","p. 18","pp. 19–21","p. 627"].every(x=>fijo.includes(x)));
 ok("Supuestos visibles: «modelo de un producto», «demanda aleatoria», «revisión periódica», 500 años, réplica 16,6 % contra 17 % del paper",["modelo de un producto","demanda aleatoria","revisión periódica","500 años","16,6 %","17 %"].every(x=>fijo.includes(x))&&Math.abs(N.nada1.q*100-16.6)<0.05);
 /* en el teléfono */
 let SIT="";const run=async(q,f,mid)=>{await p.goto(`${U}?caso=inventario&${q}`);await p.waitForSelector("#play");await p.waitForTimeout(1500);SIT=await p.textContent(".sit");if(f)await p.screenshot({path:shot(f+"_antes")});
  await p.tap("#play");if(mid){await p.waitForTimeout(mid);await p.screenshot({path:shot(f+"_corriendo")})}await p.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:90000});await p.waitForTimeout(600);if(f)await p.screenshot({path:shot(f+"_fin")});return p.textContent("#rv")};
 const rv1=await run("perdida=1&conteo=0&regla=nada","reel",3800);const sit=SIT;
 ok("Enlace del reel: un producto, se pierde 1 %, no se cuenta, no hacer nada",/Un producto · vende 10 al día · se pierde 1 % sin registro · no se cuenta en el año · No hacer nada/.test(sit),sit);
 const m1=await p.evaluate(()=>ECAPP.metrics("inventario"));ok("En el teléfono, el número grande = el modelo = 16,6 % de ventas perdidas",rv1===m1[0].v&&rv1==="16,6",[rv1,m1[0].v]);
 const rl=await p.textContent(".rl"),r2=await p.textContent(".r2");ok("Bajo el número: pantalla contra estante al cierre y días con el estante vacío",/la pantalla dice \d+ y el estante tiene \d+/.test(rl)&&/\d+ días al año con el estante vacío/.test(r2),[rl,r2]);
 const sc=await p.evaluate(()=>({labs:ECAPP.S.labels.map(l=>l.html.replace(/<svg[\s\S]*<\/svg>/,"[gráfico]").replace(/<[^>]*>/g,"")),svg:ECAPP.S.labels.some(l=>/<svg/.test(l.html))}));
 ok("La escena muestra la pantalla, el estante y el gráfico del año (sistema contra real)",sc.svg&&sc.labs.some(t=>/^Pantalla: \d+$/.test(t))&&sc.labs.some(t=>/^Estante: \d+$/.test(t)),sc.labs);
 const tb=await p.textContent("#trysol");ok("Botón del resultado: «Probar «Restar la pérdida estimada»»",/Restar la pérdida estimada/.test(tb),tb);
 await p.tap("#trysol");await p.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:90000});await p.waitForTimeout(900);
 const rv2=await p.textContent("#rv"),aha=await p.textContent(".raha").catch(()=>"");
 ok("Restando la pérdida estimada: 1,2 % y la lección «bajan de 16,6 % a 1,2 %… no llegan a cero»",rv2==="1,2"&&/bajan de 16,6 % a 1,2 %/.test(aha)&&/no llegan a cero/.test(aha),[rv2,aha]);await p.screenshot({path:shot("restar_fin")});
 const rv3=await run("perdida=1&conteo=30&regla=nada","contar_mes");ok("Contar cada mes con 1 %: 1,1 % de ventas perdidas",rv3==="1,1",rv3);
 const rv4=await run("perdida=0&conteo=0&regla=nada","sin_perdida");ok("Sin pérdida: 0,4 % (el sistema está armado para ~0,5 %)",rv4==="0,4",rv4);
 const rv5=await run("perdida=2.4&conteo=0&regla=nada","perdida_24",5500);ok("Con 2,4 %: más de la mitad de las ventas perdidas",+rv5.replace(",",".")>50,rv5);
 const rv6=await run("perdida=-3&conteo=abc&regla=xyz");ok("Enlace con valores raros: se ajusta a los controles (0 %, nunca, no hacer nada) sin romperse",await p.evaluate(()=>{const s=ECAPP.STATE.inventario;return s.p===0&&EC.inventario(s).N===0})&&/^\d+,\d$/.test(rv6),[rv6,await p.evaluate(()=>ECAPP.STATE.inventario)]);
 ok("Sin desborde horizontal a 390 px",await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 /* hojas: controles y «por qué pasa» */
 await p.goto(`${U}?caso=inventario&perdida=1&conteo=0&regla=nada`);await p.waitForSelector("#play");await p.waitForTimeout(1200);
 await p.tap("[data-sheet=ajustar]");await p.waitForTimeout(900);const ctl=await p.evaluate(()=>[...document.querySelectorAll("#sheet-body .ctl")].map(e=>e.textContent.replace(/\s+/g," ").trim()));
 ok("Controles: pérdida (% de la demanda), cada cuánto se cuenta (nunca a 1 semana) y qué hace el sistema (restar sí/no)",ctl.some(t=>/Pérdida que nadie registra.*% de la demanda/.test(t))&&ctl.some(t=>/Cada cuánto se cuenta el estante.*Nunca.*6 meses.*3 meses.*1 mes.*1 semana/.test(t)),ctl);
 await p.screenshot({path:shot("controles")});await p.evaluate(()=>ECAPP.closeSheet());await p.waitForTimeout(500);
 await p.evaluate(()=>ECAPP.openSheet("inventario","ciencia"));await p.waitForTimeout(800);const ci=(await p.textContent("#sheet")).replace(/ /g," ");
 ok("«Por qué pasa»: la cuenta con tus números (16,6 %, 41 → 50) y los supuestos a la vista",/16,6 %/.test(ci)&&/41 → Q = 50|≤ R = 41/.test(ci)&&["modelo de un producto","demanda aleatoria","revisión periódica"].every(x=>ci.includes(x)),ci.slice(0,160));
 await p.screenshot({path:shot("porque")});ok("«Por qué pasa» sin desborde a 390 px",await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.evaluate(()=>ECAPP.closeSheet());
 /* inglés */
 await p.evaluate(()=>document.getElementById("lang-en").click());await p.waitForTimeout(500);const rvEn=await run("perdida=1&conteo=0&regla=nada","en");
 ok("En inglés: 16.6 y «One product · sells 10 a day · 1 % lost unrecorded»",rvEn==="16.6"&&/One product · sells 10 a day · 1 % lost unrecorded/.test(SIT),[rvEn,SIT]);
 await p.evaluate(()=>document.getElementById("lang-es").click());await p.waitForTimeout(400);
 /* publicado: ?reel=15, lista de reels y biblioteca */
 await p.goto(U+"?reel=15");await p.waitForTimeout(2000);ok("Publicado: ?reel=15 abre #inventario",await p.evaluate(()=>location.hash)==="#inventario");
 await p.evaluate(()=>ECAPP.openSheet("inventario","reels"));await p.waitForTimeout(700);{const lst=await p.evaluate(()=>[...document.querySelectorAll("#sheet-body .mrow")].map(e=>e.textContent.replace(/\s+/g," ").trim()));
  const DST=await p.evaluate(()=>ECAPP.dev.DESTACADO);if(DST==="inventario")ok("Publicado y destacado: PRIMERO en la lista de reels «#15 ¿Por qué el sistema dice que hay stock y el estante está vacío?», y después el #18 y el #17",/^#15 ?¿Por qué el sistema dice que hay stock y el estante está vacío\?/.test(lst[0]||"")&&/^#18/.test(lst[1]||"")&&/^#17/.test(lst[2]||""),lst.slice(0,5));else ok("Publicado: en la lista de reels como «#15 ¿Por qué el sistema dice que hay stock y el estante está vacío?», después del 17 y antes del 14",lst.some(t=>/^#15 ?¿Por qué el sistema dice que hay stock y el estante está vacío\?/.test(t))&&lst.findIndex(t=>/^#15/.test(t))>lst.findIndex(t=>/^#17/.test(t))&&lst.findIndex(t=>/^#15/.test(t))<lst.findIndex(t=>/^#14/.test(t)),lst.slice(0,5));await p.evaluate(()=>ECAPP.closeSheet())}
 await p.evaluate(()=>{location.hash="biblioteca"});await p.waitForTimeout(900);
 {const ti=await p.textContent("#libintro"),FX=await p.evaluate(()=>!!ECAPP.dev.PUBLICADO.fedex);ok(FX?"Publicado: la biblioteca pasa a 52 fuentes, de diecisiete reels (con fedex)":"Publicado: la biblioteca pasa de 45 a 48 fuentes, de dieciséis reels",(FX?/Cincuenta y dos fuentes de diecisiete reels/:/Cuarenta y ocho fuentes de dieciséis reels/).test(ti),ti.slice(0,48))}
 ok("Publicado: la biblioteca trae Kang y Gershwin, ECR Europa y DeHoratius y Raman",await p.evaluate(()=>["kang2005","ecr2001","dehoratius2008"].every(k=>!!document.querySelector(`#v-biblioteca [data-book="${k}"]`))));
 for(const k of ["kang2005","ecr2001","dehoratius2008"]){await p.evaluate(k=>ECAPP.openBook(k),k);await p.waitForTimeout(600);await p.screenshot({path:shot("libro_"+k)});
  const bk=await p.evaluate(()=>{const pg=document.querySelector(".bk-page");return{story:!!pg.querySelector(".pstory"),dato:!!pg.querySelector(".pdato"),lim:!!pg.querySelector(".plim"),live:!!pg.querySelector(".blive"),stat:!!pg.querySelector(".bigstat"),t:pg.textContent}});
  ok(`Libro ${k}: historia, dato con página, cuándo no aplica y cuenta en vivo`,bk.story&&bk.dato&&bk.lim&&bk.live&&bk.stat&&/p\. \d/.test(bk.t),{story:bk.story,dato:bk.dato,lim:bk.lim,live:bk.live,stat:bk.stat});
  await p.evaluate(()=>{const x=document.querySelector(".bk-x");if(x)x.click()});await p.waitForTimeout(300)}
 ok("Sin errores de página (IPUB=true)",errs.length===0,errs.slice(0,3));
 console.log(`${checks.filter(Boolean).length}/${checks.length}`);await b.close();srv.close&&srv.close();process.exit(checks.every(Boolean)?0:1)})().catch(e=>{console.error(e);process.exit(1)});
