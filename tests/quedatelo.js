// Reel 7 · Quédatelo: números contra el reel, barrido completo ES/EN y enlaces. Con el laboratorio publicado u oculto.
// Uso: node tests/quedatelo.js   (THREE_JS y PW opcionales: ver tests/env.js)
const {chromium}=require(process.env.PW||"playwright");const serve=require("./serve.js"),env=require("./env.js");
const checks=[];const ok=(n,c,g)=>{checks.push(!!c);console.log((c?"PASS ":"FAIL ")+n+(g!==undefined?"  → "+JSON.stringify(g):""))};
(async()=>{const srv=await serve(8792);const b=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const ctx=await b.newContext({viewport:{width:360,height:740},isMobile:true,hasTouch:true,deviceScaleFactor:1,locale:"es-CL"});const p=await ctx.newPage();await env(p);const errs=[];p.on("pageerror",e=>errs.push(e.message));
 await p.goto("http://127.0.0.1:8792/index.html");await p.waitForTimeout(2500);
 const pub=await p.evaluate(()=>ECAPP.dev.PUBLICADO.quedatelo);console.log("publicado:",pub);
 const r=await p.evaluate(()=>EC.quedatelo({V:5,r:70,d:1,t:4,F:8,P:3,a:0,pol:"traer"}));
 ok("Reel · recuperas 3,36, gastas 11, pierdes 7,64",Math.abs(r.rec-3.36)<1e-9&&r.cost===11&&Math.abs(r.loss-7.64)<1e-9,[r.rec,r.cost,r.loss]);
 ok("Reel · límite ~US$16 (16,37)",Math.floor(r.umbral)===16,r.umbral);
 const v=await p.evaluate(()=>{const u=EC.quedatelo({V:16,r:70,d:1,t:4,F:8,P:3,a:0,pol:"traer"}),w=EC.quedatelo({V:17,r:70,d:1,t:4,F:8,P:3,a:0,pol:"traer"}),ab=EC.quedatelo({V:5,r:70,d:1,t:4,F:8,P:3,a:5,pol:"deja"});return[u.S<0,w.S>0,u.conviene,w.conviene,ab.loss,ab.umbral]});
 ok("Bajo el límite no conviene y sobre él sí",v[0]&&v[1]&&v[2]==="deja"&&v[3]==="traer",v);
 ok("Con 5 % de abuso: pierde 0,25 y el límite baja a 15,24",Math.abs(v[4]-.25)<1e-9&&Math.abs(v[5]-15.235)<.01,v);
 /* full sweep, texts in both languages */
 const sw=await p.evaluate(()=>{const bad=[];let n=0;const s=ECAPP.STATE.quedatelo,G=ECAPP.LAB.quedatelo.game,L=ECAPP.LAB.quedatelo,D=JSON.stringify(s);const R=/NaN|undefined|Infinity|∞|−-|--|-0[,.]00|−0[,.]00|\[object/;
  for(const lg of ["es","en"]){document.getElementById("lang-"+lg).click();
   for(const pol of ["traer","deja"])for(const V of [1,5,16,17,40,75])for(const t of [0,1,4,26])for(const r of [0,5,70,100])for(const d of [0,1,2.5,5])for(const F of [0,8,30])for(const P of [0,3,20])for(const a of [0,5,30]){
    const st={V,t,r,d,F,P,a,pol};n++;const c=EC.quedatelo(st),exp=(V*r/100*Math.max(0,1-d/100*t))-(F+P);if(Math.abs(c.S-exp)>1e-9)bad.push(["S",st]);
    if(c.umbral!==Infinity&&c.umbral<0)bad.push(["umb",st]);
    const txt=JSON.stringify(G.metrics(st))+G.share(st)+G.ouch(st,pol==="traer"?"deja":"traer",pol)+L.story(c,st).h+L.math.map(m=>m.s(st)).join("")+G.aha(st)+JSON.stringify(G.score(st));if(R.test(txt))bad.push([st,txt.match(R)[0]]);
    const sc=G.score(st).score;if(!(sc>=0&&sc<=1000))bad.push(["score",st,sc])}}
  document.getElementById("lang-es").click();Object.assign(s,JSON.parse(D));return{n,bad:bad.slice(0,6),nb:bad.length}});
 ok(`Barrido de ${sw.n} configuraciones: sin NaN ni textos rotos`,sw.nb===0,sw.bad);
 const lim=await p.evaluate(()=>{const G=ECAPP.LAB.quedatelo.game,s={V:5,r:0,d:1,t:4,F:0,P:0,a:0,pol:"traer"};return[G.metrics(s)[0].v,G.share(s)]});ok("Sin costos ni recuperación: empate y texto sensato",lim[0]==="0,00",lim);
 /* verdicts */
 const vd=(set)=>p.evaluate(s=>{const G=ECAPP.LAB.quedatelo.game,st=Object.assign({},ECAPP.LAB.quedatelo.def,s),r=G.score(st);return{s:Math.round(r.score),v:r.valid}},set);
 const a1=await vd({pol:"deja"}),a2=await vd({pol:"traer"}),a3=await vd({V:40,t:1,pol:"traer"}),a4=await vd({F:0,pol:"traer"});
 ok("Veredicto: quédatelo 100 %, traerlo con US$ 5 pierde, traer más rápido gana, cambiar costos no cuenta",a1.s===100&&a2.s<80&&a3.s>100&&!a4.v,[a1,a2,a3,a4]);
 /* run in the phone */
 await p.goto("http://127.0.0.1:8792/index.html?caso=quedatelo&precio=40&regla=deja");await p.waitForSelector("#play");await p.waitForTimeout(1500);ok("Enlace con parámetros: US$ 40 y Quédatelo",(await p.textContent(".sit")).includes("US$ 40")&&await p.evaluate(()=>ECAPP.STATE.quedatelo.pol==="deja"));
 await p.tap("#play");await p.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:60000});ok("Con US$ 40, quédatelo muestra pérdida 0,00 y límite",(await p.textContent("#rv"))==="0,00"&&/16,37/.test(await p.textContent(".r2")));
 await p.tap("#trysol");await p.waitForTimeout(600);await p.waitForFunction(()=>ECAPP.mode==="done",null,{timeout:60000});await p.waitForTimeout(300);ok("Traerlo gana: −15,88 y explica",(await p.textContent("#rv"))==="−15,88"&&/signo menos/.test(await p.textContent(".rl")),await p.textContent("#rv"));
 ok("Sin desborde horizontal a 360 px",await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 /* publicación */
 await p.goto("http://127.0.0.1:8792/index.html?reel=7");await p.waitForTimeout(2000);const h=await p.evaluate(()=>location.hash);ok(pub?"?reel=7 abre #quedatelo":"?reel=7 no abre nada mientras esté oculto",pub?h==="#quedatelo":h!=="#quedatelo",h);
 const lab=await p.evaluate(()=>{location.hash="biblioteca";return 1});await p.waitForTimeout(800);const t=await p.textContent("#libintro");ok(pub?"Biblioteca: 23 fuentes de siete reels":"Biblioteca oculta: 20 fuentes de seis reels",pub?/Veintitrés|23/.test(t):/Veinte/.test(t),t.slice(0,40));
 ok("Sin errores de página",errs.length===0,errs.slice(0,3));
 console.log(`${checks.filter(Boolean).length}/${checks.length}`);await b.close();srv.close&&srv.close();process.exit(checks.every(Boolean)?0:1)})().catch(e=>{console.error(e);process.exit(1)});
