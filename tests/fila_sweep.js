// Barrido de la fila (reel 6): corre dentro de la página con el código real (EC, GAME.fila, LAB.fila, EQ, shareText,
// shareURL, readURL, cmpBig). Lo usan tests/verify.js (muestra rápida) y tests/sweep_fila.js (barrido completo).
// P = {cs, lams, Ss, cvs, sims:[[c,lam,S,cv]], seeds, simTrucks, url:"all"|"sample", nearOne:bool, fila:bool}
module.exports=function filaSweep(P){
 const D=ECAPP.dev,{LAB,EQ,SRC,BIB,readURL,resultNow,verdict,cmpBig}=D,STATE=ECAPP.STATE,shareText=ECAPP.shareText,shareURL=ECAPP.shareURL;
 const nf=(x,d)=>{d=d||0;return (+x).toLocaleString(D.lang==="en"?"en-US":"es-CL",{minimumFractionDigits:d,maximumFractionDigits:d})},sv=v=>typeof v==="object"?(D.lang==="en"?v.en:v.es):v;
 const G=LAB.fila.game,LB=LAB.fila,def=LB.def,saveLang=D.lang,saveSt=Object.assign({},STATE.fila),saveURL=location.pathname+location.search+location.hash;
 const R={n:0,a:[],b:[],c:[],d:{jsqDisp:[],jsqDispN:0,seedN:0,seedViol:[],avgN:0,avgViol:[],errAsig:[],errPool1:[],errPoolCV:[],errJsqVsSim:[],absPoolCV:[]},e:[],f:[],g:[],gN:0,h:[],hN:0,i:[]};
 const add=(k,x)=>{if(R[k].length<4000)R[k].push(x)};
 const BAD=/NaN|Infinity|undefined|\bnull\b|\[object|−-|--|(^|[^\w&=])-\d|−0 %|−0[,.]0\b|\b1 (puertas|camiones|filas|doors|trucks|lines)\b|Llegan 1 camión|\b1 truck arrive\b|1 doors serve|1 puertas atienden/;
 const strip=t=>String(t).replace(/https?:\/\/\S+/g,"");
 const kinds={};const scan=(where,t)=>{const s=strip(t);const m=s.match(BAD);if(m){const k=where.split(" ")[0]+" · "+m[0].trim();kinds[k]=(kinds[k]||0)+1;add("a",[where,s.slice(0,240)])}};
 const avgW=o=>o.length?o.reduce((s,q)=>s+(q.st-q.a),0)/o.length:0;
 const num=s=>parseFloat(String(s).replace(D.lang==="en"?/,/g:/\./g,"").replace(",","."));
 const setSt=st=>{Object.assign(STATE.fila,def,st)};
 const LG=P.langs||["es","en"];
 try{
 for(const c of P.cs)for(const lam of P.lams)for(const S of P.Ss){const over=lam*S>=60*c;
  for(const cvv of P.cvs){const cv=cvv/10;R.n++;
   const th=EC.fTheory(c,lam,S,cv),mu=60/S;
   /* b · the guard, everywhere it lives */
   if((th.rho>=1)!==over)add("b",["fTheory.rho",c,lam,S,cvv,th.rho]);
   if(over&&(isFinite(th.asig)||isFinite(th.pool)))add("b",["fTheory finite when over",c,lam,S,cvv]);
   const jd=EC.fJsq(c,lam,S,cv);
   if(over!==!isFinite(jd))add("b",["fJsq",c,lam,S,cvv,jd]);
   if(over){const f=EC.fila({c,lam,S,pol:"asig",cv});if(!f.overload)add("b",["EC.fila no overload",c,lam,S,cvv])}
   else if(P.nearOne&&th.rho>=0.95&&(cvv===10||cvv===2)){const f=EC.fila({c,lam,S,pol:"asig",cv});if(f.overload)add("b",["EC.fila overload below 1",c,lam,S,cvv,th.rho]);else{for(const p of ["asig","jsq","pool"])if(!(isFinite(f.cur[p])&&f.cur[p]>=0))add("b",["EC.fila value",c,lam,S,cvv,p,f.cur[p]])}}
   /* c · analytic */
   if(!over){if(!(th.pool<=th.asig+1e-9))add("c",["pool>asig",c,lam,S,cvv,th.pool,th.asig]);
    if(!(th.pool>=0&&th.asig>=0&&isFinite(th.pool)&&isFinite(th.asig)))add("c",["bad value",c,lam,S,cvv,th.pool,th.asig]);
    if(cvv===10){const e=EC.erlangC(lam,mu,c).Wq,mm1=th.rho/(mu-lam/c)*60;if(Math.abs(th.pool-e)>1e-9*Math.max(1,e))add("c",["pool≠ErlangC",c,lam,S,th.pool,e]);/* same value to machine precision (a printed tie like 36,75 may round either way) */if(Math.abs(th.asig-mm1)>1e-9*Math.max(1,mm1))add("c",["asig≠MM1",c,lam,S,th.asig,mm1])}
    /* h · the reto factor: every analytic wait is the CV=1 value × (1+CV²)/2 */
    R.hN++;const t1=EC.fTheory(c,lam,S,1),f=(1+cv*cv)/2;if(Math.abs(th.f-f)>1e-12||Math.abs(th.asig-t1.asig*f)>1e-9*Math.max(1,th.asig)||Math.abs(th.pool-t1.pool*f)>1e-9*Math.max(1,th.pool))add("h",["factor",c,lam,S,cvv,th.f,f]);
    /* d · the B shown on screen (ratio estimator) must sit between C and A */
    if(c>=2){R.d.jsqDispN++;const lo=th.pool,hi=th.asig;if(jd<lo-1e-9||jd>hi+1e-9){const gap=jd<lo?(jd-lo):(jd-hi);R.d.jsqDisp.push([c,lam,S,cvv,+jd.toFixed(4),+lo.toFixed(4),+hi.toFixed(4),+gap.toFixed(4)])}}
    else if(Math.abs(jd-th.pool)>1e-9*Math.max(1,th.pool))add("c",["c=1 jsq≠pool",lam,S,cvv,jd,th.pool])}
   for(const lg of LG){D.lang=lg;
    for(const pol of ["asig","jsq","pool"]){const st=Object.assign({},def,{c,lam,S,pol,cv:cvv});setSt(st);
     const ms=G.metrics(st),sh=G.share(st),sc=G.score(st),full=shareText("fila"),ck=LB.check(st);
     ms.forEach((m,i)=>{scan(`metrics ${lg} ${c},${lam},${S},${cvv},${pol}#${i}`,m.v+" "+m.u+" "+m.l+" "+(m.note||""));
      if(over){if(m.v!=="∞"||!/colapsa|collapses/.test(m.l))add("b",["metric shows a number when over",lg,c,lam,S,cvv,pol,m.v,m.l])}
      else{const x=num(m.v);if(!(isFinite(x)&&x>=0))add("a",["metric not a number",lg,c,lam,S,cvv,pol,m.v]);if(/colapsa|collapses/.test(m.l))add("b",["collapse label below 1",lg,c,lam,S,cvv])}});
     scan(`share ${lg} ${c},${lam},${S},${cvv},${pol}`,full);
     /* f · honest verdicts with CV=1 (no reto): C is the reel (100 %); A and B never beat it */
     if(sc.valid&&lg==="es"){if(pol==="pool"&&cvv===10&&Math.abs(sc.score-100)>1e-6)add("f",["C ≠ 100 %",c,lam,S,sc.score]);if(pol==="asig"&&cvv===10&&sc.score>100+1e-6)add("f",["A beats the reel",c,lam,S,cvv,sc.score]);if(pol==="jsq"&&cvv===10&&sc.score>100+1e-6)add("f",["B beats the reel",c,lam,S,sc.score])}scan(`score ${lg} ${c},${lam},${S},${cvv},${pol}`,[sc.ref,sc.you,sc.why||""].join(" | "));
     if(over){if(!/colapsa|collapses/.test(sh)||/\d\s?min/.test(sh))add("b",["share when over",lg,c,lam,S,cvv,pol,sh]);if(sc.valid||!/—/.test(full))add("b",["score valid when over",lg,c,lam,S,cvv,pol]);if(!ck)add("b",["check() silent when over",c,lam,S])}
     else{if(/colapsa|collapses/.test(sh))add("b",["share says collapse below 1",lg,c,lam,S,cvv,pol]);if(ck)add("b",["check() fires below 1",c,lam,S])}
     if(pol==="asig"){/* math steps and the books' «Con tus números» */LB.math.forEach((m,i)=>{if(m.s){const s=m.s(st);scan(`math${i} ${lg} ${c},${lam},${S},${cvv}`,s);if(over&&i>=1&&i<=2&&/min/.test(s))add("b",["math step number when over",i,c,lam,S])}});
      for(const b of ["erlang1917","winston1977","odoni"]){const s=EQ[b].live();scan(`EQ ${b} ${lg} ${c},${lam},${S},${cvv}`,s);if(over&&/\d\s?min|∞/.test(s.replace(/<[^>]+>/g,"")))add("b",["book live number when over",b,c,lam,S,s])}}}
    /* h · the reto lever's text and the factor shown in «Por qué pasa» agree with the waits on screen */
    if(!over&&cvv!==10){const st=Object.assign({},def,{c,lam,S,pol:"asig",cv:cvv});setSt(st);const fs=LB.math[3].s(st).replace(/<[^>]+>/g,"");const m=fs.match(/×\s*([\d.,]+)/);const fShown=m?num(m[1]):NaN;const ms=G.metrics(st);const A=num(ms[0].v),C=num(ms[2].v),t1=EC.fTheory(c,lam,S,1);
     if(!(Math.abs(fShown-(1+cv*cv)/2)<=0.005+1e-9))add("h",["factor shown",lg,cvv,fs]);
     const tolA=t1.asig*0.0051+0.051,tolC=t1.pool*0.0051+0.051;if(t1.asig<100&&Math.abs(A-t1.asig*fShown)>tolA||t1.pool<100&&Math.abs(C-t1.pool*fShown)>tolC)add("h",["wait vs factor",lg,c,lam,S,cvv,A,C,t1.asig,t1.pool,fShown]);
     const lv=G.reto[0].fmt(cvv);if(cvv<=3&&!/muy parejas|very even/.test(lv)||cvv>3&&/muy parejas|very even|al azar|random/.test(lv))add("h",["lever text",lg,cvv,lv])}}
   D.lang=saveLang}}
 /* d · simulation: several seeds, the three rules on the same trucks */
 for(const [c,lam,S,cvv] of (P.sims||[])){const cv=cvv/10,th=EC.fTheory(c,lam,S,cv);if(!isFinite(th.asig))continue;const H=Math.max(200,(P.simTrucks||40000)/lam);const acc={asig:0,jsq:0,pool:0};
  for(const sd of (P.seeds||[1])){const list=EC.fGen(lam,S,c,H,EC.rngFrom(1000+sd*7),cv,EC.rngFrom(5000+sd*13));const w={asig:avgW(EC.fSim(list,c,"asig")),jsq:avgW(EC.fSim(list,c,"jsq")),pool:avgW(EC.fSim(list,c,"pool"))};R.d.seedN++;
   for(const k in w)acc[k]+=w[k]/(P.seeds||[1]).length;
   if(w.jsq<w.pool-1e-9||w.jsq>w.asig+1e-9)R.d.seedViol.push([c,lam,S,cvv,sd,+w.pool.toFixed(3),+w.jsq.toFixed(3),+w.asig.toFixed(3)])}
  R.d.avgN++;if(acc.jsq<acc.pool-1e-9||acc.jsq>acc.asig+1e-9)R.d.avgViol.push([c,lam,S,cvv,+acc.pool.toFixed(3),+acc.jsq.toFixed(3),+acc.asig.toFixed(3)]);
  const rel=(x,y)=>y>0.05?(x-y)/y:null;const ea=rel(acc.asig,th.asig),ep=rel(acc.pool,th.pool),ej=rel(EC.fJsq(c,lam,S,cv),acc.jsq);
  if(ea!=null)R.d.errAsig.push([+ea.toFixed(4),th.rho]);if(ep!=null)(cvv===10?R.d.errPool1:R.d.errPoolCV).push([+ep.toFixed(4),th.rho]);if(ej!=null)R.d.errJsqVsSim.push([+ej.toFixed(4),th.rho,cvv]);if(ep!=null&&cvv!==10)R.d.absPoolCV.push([+(acc.pool-th.pool).toFixed(3),th.rho])}
 /* e · the reel's numbers wherever they appear (both languages) */
 for(const lg of ["es","en"]){D.lang=lg;const st=Object.assign({},def);setSt(st);const ms=G.metrics(st);const d1=x=>nf(x,1);const A=d1(75),C=d1(21.07);const B=num(ms[1].v);
  if(ms[0].v!==A)add("e",["metric A",lg,ms[0].v]);if(!(B>=23&&B<=27))add("e",["metric B",lg,ms[1].v]);if(ms[2].v!==C)add("e",["metric C",lg,ms[2].v]);
  const sh=G.share(st);if(!sh.includes(A+" min")||!sh.includes(C+" min"))add("e",["share A→C",lg,sh]);
  setSt(Object.assign({},st,{pol:"jsq"}));const shB=G.share(STATE.fila);if(!shB.includes(nf(EC.fJsq(3,10,15,1),1)+" min")||!shB.includes(C+" min"))add("e",["share B→C",lg,shB]);setSt(st);
  const sc=G.score(st);if(!sc.ref.includes(C+" min")||!sc.you.includes(A+" min"))add("e",["score ref/you",lg,sc.ref,sc.you]);
  const f=EC.fila({c:3,lam:10,S:15,pol:"asig",cv:1});if(!LB.refLine(f).includes(C+" min"))add("e",["refLine",lg,LB.refLine(f)]);
  const story=LB.story(f,st);if(!story.stats.some(x=>x.v===C+" min"))add("e",["story C",lg,JSON.stringify(story.stats)]);if(!(Math.abs(f.cur.asig-75)<=2.5))add("e",["story sim A ±2,5",lg,f.cur.asig]);
  if(!EQ.erlang1917.live().includes(C+" min"))add("e",["book Erlang",lg]);if(!EQ.odoni.live().includes(A+" min"))add("e",["book Odoni",lg]);const wj=num(EQ.winston1977.live().replace(/<[^>]+>/g,"").match(/([\d.,]+) min/)[1]);if(!(wj>=23&&wj<=27))add("e",["book Winston",lg,wj]);
  if(LB.math[1].s(st).replace(/<[^>]+>/g,"").indexOf(A+" min")<0)add("e",["math A",lg]);if(LB.math[2].s(st).replace(/<[^>]+>/g,"").indexOf(C+" min")<0)add("e",["math C",lg]);
  if(sv(LB.chip)!=="75 → 21 min")add("e",["home chip",lg,sv(LB.chip)])}
 D.lang=saveLang;
 /* f · very low load: λ=1, S=3 with every door count */
 for(const lg of ["es","en"]){D.lang=lg;for(let c=1;c<=8;c++){const runs={};for(const pol of ["asig","jsq","pool"]){const st=Object.assign({},def,{c,lam:1,S:3,pol});setSt(st);runs[pol]=resultNow("fila",st);const t=shareText("fila");scan(`lowload ${lg} c=${c} ${pol}`,t);if(/\(−\d+ %\)/.test(t))add("f",["share shows a percent drop when nobody waits",lg,c,pol,t]);const sc=G.score(st);if(sc.valid&&/Te falta|Not there yet|cerca|close/.test(verdict(sc).h))add("f",["verdict when nobody waits",lg,c,pol,verdict(sc).h])}
  for(const a of ["asig","jsq","pool"])for(const b of ["asig","jsq","pool"]){if(a===b)continue;const x=cmpBig(runs[a],runs[b]);if(/100 %|NaN|Infinity|×/.test(x.big))add("f",["Antes → ahora",lg,c,a,b,runs[a].v,runs[b].v,x.big])}}}
 D.lang=saveLang;
 /* g · links: shareURL → readURL gives the same case and the same text; old links keep working */
 const UI={c:G.sliders[0],lam:G.sliders[1],S:G.ajustes[0],cv:G.reto[0]};const uc=[],ul=[],uS=[],ucv=[];
 for(let v=UI.c.min;v<=UI.c.max;v++)uc.push(v);for(let v=UI.lam.min;v<=UI.lam.max;v++)ul.push(v);for(let v=UI.S.min;v<=UI.S.max;v++)uS.push(v);for(let v=UI.cv.min;v<=UI.cv.max;v++)ucv.push(v);
 const pick=(a,n)=>P.url==="all"?a:a.filter((x,i)=>i===0||i===a.length-1||i%Math.ceil(a.length/n)===0);
 for(const c of pick(uc,3).filter(x=>P.cs.includes(x)))for(const lam of pick(ul,4))for(const S of pick(uS,5))for(const cvv of pick(ucv,2))for(const pol of ["asig","jsq","pool"]){R.gN++;const st=Object.assign({},def,{c,lam,S,pol,cv:cvv});setSt(st);const u=new URL(shareURL("fila")),t0=G.share(STATE.fila);
  Object.assign(STATE.fila,{c:1,lam:1,S:3,pol:"pool",cv:2});history.replaceState(null,"",u.pathname+u.search);const id=readURL();const s2=STATE.fila;
  if(id!=="fila"||["c","lam","S","pol","cv"].some(k=>s2[k]!==st[k])||G.share(s2)!==t0||shareURL("fila")!==u.href)add("g",[u.search,JSON.stringify({c:s2.c,lam:s2.lam,S:s2.S,pol:s2.pol,cv:s2.cv})])}
 const LEG=[["regla=fija","asig"],["regla=separadas","asig"],["regla=corta","jsq"],["regla=unica","pool"],["jefe=1","jsq"],["regla=separadas&jefe=1","jsq"],["regla=fija&jefe=1","jsq"],["regla=unica&jefe=1","pool"],["regla=corta&jefe=0","jsq"],["regla=loquesea","asig"],["",def.pol]];
 for(const [q,want] of LEG){R.gN++;history.replaceState(null,"",location.pathname+"?caso=fila&"+q);readURL();if(STATE.fila.pol!==want)add("g",["legacy "+q,STATE.fila.pol,want])}
 for(const [q,want] of [["puertas=9&camiones=0&minutos=100&cv=0.5",{c:UI.c.max,lam:UI.lam.min,S:UI.S.max,cv:5}],["puertas=2&camiones=7&minutos=20",{c:2,lam:7,S:20,cv:10}],["puertas=abc&camiones=-3",{c:def.c,lam:UI.lam.min}]]){R.gN++;history.replaceState(null,"",location.pathname+"?caso=fila&"+q);readURL();for(const k in want)if(STATE.fila[k]!==want[k])add("g",["params "+q,k,STATE.fila[k],want[k]])}
 const sURL=(()=>{setSt(Object.assign({},def,{pol:"asig"}));return shareURL("fila")})();if(!/regla=fija/.test(sURL))add("g",["A writes regla=fija",sURL]);
 /* i · names of the three rules, in both languages */
 const txt=[];const walk=(o,d)=>{if(d>6||o==null)return;if(typeof o==="string")txt.push(o);else if(typeof o==="function")txt.push(o.toString());else if(Array.isArray(o))o.forEach(x=>walk(x,d+1));else if(typeof o==="object")for(const k in o){if(k==="scene"||k==="game")continue;walk(o[k],d+1)}};walk(LB,0);walk(G,0);
 for(const b of LB.sources)walk([SRC[b],EQ[b]&&EQ[b].f,EQ[b]&&EQ[b].live,BIB&&BIB[b]],0);
 const all=txt.join("\n");
 for(const re of [/Puerta asignada/,/Assigned door/,/Filas separadas/,/Separate lines/,/A · (?!Puerta fija|Fixed door)[A-ZÁÉÍÓÚ][a-záéíóú]+/,/B · (?!Fila más corta|Shortest line)[A-ZÁÉÍÓÚ][a-záéíóú]+/,/C · (?!Fila única|Single queue)[A-ZÁÉÍÓÚ][a-záéíóú]+/])
  {const m=all.match(new RegExp(re.source,"g"));if(m)add("i",[re.source,m.slice(0,3)])}
 const opt=G.rule.opts.map(o=>o[1]+"|"+o[2]).join(";"),lev=LB.levers[0].opts.map(o=>o[1]+"|"+o[2]).join(";");
 if(opt!=="A · Puerta fija|A · Fixed door;B · Fila más corta|B · Shortest line;C · Fila única|C · Single queue"||lev!==opt)add("i",["rule names",opt,lev]);
 /* every Spanish sentence of the reto cost exists in English too (one sentence per sentence) */
 const sent=s=>s.split(/(?<=[.!?])\s+/).filter(Boolean).length;if(sent(LB.reto.cost.es)!==sent(LB.reto.cost.en))add("i",["reto cost ES/EN",sent(LB.reto.cost.es),sent(LB.reto.cost.en)]);
 }finally{D.lang=saveLang;Object.assign(STATE.fila,saveSt);history.replaceState(null,"",saveURL)}
 const q=(a,p)=>{if(!a.length)return null;const s=a.map(x=>Math.abs(x[0])).sort((x,y)=>x-y);return +s[Math.min(s.length-1,Math.floor(p*s.length))].toFixed(4)};
 R.summary={configs:R.n,a:R.a.length,b:R.b.length,c:R.c.length,d:{jsqShownOutside:R.d.jsqDisp.length,jsqShownN:R.d.jsqDispN,jsqShownMaxGap:R.d.jsqDisp.reduce((m,x)=>Math.max(m,Math.abs(x[7])),0),seedRuns:R.d.seedN,seedViol:R.d.seedViol.length,seedViolMaxGap:R.d.seedViol.reduce((m,x)=>Math.max(m,x[6]<x[5]?x[5]-x[6]:x[6]-x[7]),0),avgN:R.d.avgN,avgViol:R.d.avgViol.length,
  errAsig:{n:R.d.errAsig.length,med:q(R.d.errAsig,.5),p90:q(R.d.errAsig,.9),max:q(R.d.errAsig,1)},errPoolCV1:{n:R.d.errPool1.length,med:q(R.d.errPool1,.5),p90:q(R.d.errPool1,.9),max:q(R.d.errPool1,1)},errPoolAllenCunneen:{n:R.d.errPoolCV.length,med:q(R.d.errPoolCV,.5),p90:q(R.d.errPoolCV,.9),max:q(R.d.errPoolCV,1)},errJsqShownVsSim:{n:R.d.errJsqVsSim.length,med:q(R.d.errJsqVsSim,.5),p90:q(R.d.errJsqVsSim,.9),max:q(R.d.errJsqVsSim,1)}},e:R.e.length,f:R.f.length,g:R.g.length,gN:R.gN,h:R.h.length,hN:R.hN,i:R.i.length};
 R.aKinds=kinds;return R};
