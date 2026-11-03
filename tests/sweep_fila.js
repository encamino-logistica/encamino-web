// Barrido completo de la fila (reel 6), fuera de la suite rápida: todas las combinaciones de puertas, camiones,
// minutos y CV con las tres reglas, en los dos idiomas, con el código real de la página.
// Uso: node tests/sweep_fila.js   (THREE_JS, FONTS_DIR y PW opcionales: ver tests/env.js; SWEEP_OUT = archivo JSON)
// Rango: c = 1..8 y λ = 1..40 (superset de la pantalla, que permite c 1..5 y λ 1..20), S = 3..60, CV = 0,2..1,0.
const {chromium}=require(process.env.PW||"playwright");
const fs=require("fs"),path=require("path"),os=require("os");
const serve=require("./serve.js"),env=require("./env.js"),filaSweep=require("./fila_sweep.js");
const range=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
const QUICK=process.env.QUICK==="1";
const TINY=process.env.TINY==="1";
const CS=range(1,8),LAMS=TINY?[1,2,3,10,20,40]:QUICK?[1,2,5,7,10,13,17,20,29,40]:range(1,40),SS=TINY?[3,15,59,60]:QUICK?[3,4,5,10,15,20,29,30,45,59,60]:range(3,60),CVS=TINY?[2,10]:QUICK?[2,5,10]:range(2,10);
/* simulation grid for (d): utilizations 0,2 / 0,5 / 0,75 / 0,9 with short, medium and long unloads, 3 CVs */
const SIMS=[];for(const c of [2,3,4,5,6,8])for(const S of [5,15,40])for(const r of [0.2,0.5,0.75,0.9]){const lam=Math.max(1,Math.min(40,Math.round(r*60*c/S)));if(lam*S<60*c)for(const cv of [2,5,10])SIMS.push([c,lam,S,cv])}
const SEEDS=[1,2,3,4,5];
(async()=>{
 const t0=Date.now();const srv=await serve(8791);const b=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const W=Math.max(1,Math.min(CS.length,+(process.env.WORKERS||os.cpus().length)));
 const parts=Array.from({length:W},()=>[]);CS.slice().sort((x,y)=>y-x).forEach((c,i)=>parts[i%W].push(c));
 const run=async(cs,k)=>{const ctx=await b.newContext({viewport:{width:390,height:844},locale:"es-CL"});const p=await ctx.newPage();await env(p);const errs=[];p.on("pageerror",e=>errs.push(e.message));
  await p.goto("http://127.0.0.1:8791/index.html#biblioteca");await p.waitForSelector("#shelves .book");
  const r=await p.evaluate(filaSweep,{cs,lams:LAMS,Ss:SS,cvs:CVS,sims:SIMS.filter(s=>cs.includes(s[0])),seeds:SEEDS,simTrucks:40000,url:TINY?"sample":"all",nearOne:!TINY});
  r.errs=errs;console.log(`worker ${k} (c=${cs}) listo en ${Math.round((Date.now()-t0)/1000)} s`);await ctx.close();return r};
 const rs=await Promise.all(parts.map(run));
 /* merge: the global checks (e, f, i, legacy links) run in every worker; keep them once */
 const M={aKinds:{},configs:0,a:[],b:[],c:[],h:[],g:[],gN:0,hN:0,d:{jsqDisp:[],jsqDispN:0,seedN:0,seedViol:[],avgN:0,avgViol:[],errAsig:[],errPool1:[],errPoolCV:[],errJsqVsSim:[],absPoolCV:[]},e:rs[0].e,f:[...new Set(rs.flatMap(r=>r.f.map(x=>JSON.stringify(x))))].map(x=>JSON.parse(x)),i:rs[0].i,errs:[]};
 for(const r of rs){M.configs+=r.n;for(const k of ["a","b","c","h","g"])M[k].push(...r[k]);M.gN+=r.gN;for(const k in r.aKinds)M.aKinds[k]=(M.aKinds[k]||0)+r.aKinds[k];M.hN+=r.hN;M.errs.push(...r.errs);for(const k in M.d)if(Array.isArray(M.d[k]))M.d[k].push(...r.d[k]);else M.d[k]+=r.d[k]}
 const q=(a,p)=>{if(!a.length)return null;const s=a.map(x=>Math.abs(x[0])).sort((x,y)=>x-y);return +s[Math.min(s.length-1,Math.floor(p*s.length))].toFixed(4)};
 const dist=a=>({n:a.length,med:q(a,.5),p90:q(a,.9),max:q(a,1)});
 const byRho=a=>{const o={};for(const [e,r] of a){const k=r<0.3?"ρ<0,3":r<0.6?"0,3–0,6":r<0.8?"0,6–0,8":"≥0,8";(o[k]=o[k]||[]).push([e])}const out={};for(const k in o)out[k]=dist(o[k]);return out};
 const S={seconds:Math.round((Date.now()-t0)/1000),grid:{c:[CS[0],CS[CS.length-1]],lam:[LAMS[0],LAMS[LAMS.length-1]],S:[SS[0],SS[SS.length-1]],cv:[CVS[0]/10,CVS[CVS.length-1]/10],rules:3,langs:2},configs:M.configs,
  a:M.a.length,aKinds:M.aKinds,b:M.b.length,bKinds:M.b.reduce((o,x)=>(o[x[0]]=(o[x[0]]||0)+1,o),{}),c:M.c.length,
  d:{jsqShownOutsideCA:M.d.jsqDisp.length,of:M.d.jsqDispN,maxGapMin:M.d.jsqDisp.reduce((m,x)=>Math.max(m,Math.abs(x[7])),0),
   seedRuns:M.d.seedN,seedRunsOutside:M.d.seedViol.length,seedMaxGapMin:+M.d.seedViol.reduce((m,x)=>Math.max(m,x[6]<x[5]?x[5]-x[6]:x[6]-x[7]),0).toFixed(3),avgOverSeeds:M.d.avgN,avgOutside:M.d.avgViol.length,
   relErr_A_vs_PK:Object.assign(dist(M.d.errAsig),{byRho:byRho(M.d.errAsig)}),relErr_C_vs_Erlang_CV1:Object.assign(dist(M.d.errPool1),{byRho:byRho(M.d.errPool1)}),relErr_C_vs_AllenCunneen_CVlt1:Object.assign(dist(M.d.errPoolCV),{byRho:byRho(M.d.errPoolCV)}),absErrMin_C_vs_AllenCunneen_CVlt1:Object.assign(dist(M.d.absPoolCV),{byRho:byRho(M.d.absPoolCV)}),relErr_Bshown_vs_sim_CV1:Object.assign(dist(M.d.errJsqVsSim.filter(x=>x[2]===10)),{byRho:byRho(M.d.errJsqVsSim.filter(x=>x[2]===10))}),relErr_Bshown_vs_sim_CVlt1:dist(M.d.errJsqVsSim.filter(x=>x[2]!==10))},
  e:M.e.length,f:M.f.length,g:M.g.length,linksChecked:M.gN,h:M.h.length,hChecked:M.hN,i:M.i.length,pageErrors:M.errs.length};
 const OUTF=process.env.SWEEP_OUT||path.join(os.tmpdir(),"sweep_fila.json");
 fs.writeFileSync(OUTF,JSON.stringify({summary:S,examples:{a:M.a.slice(0,40),b:M.b.slice(0,40),c:M.c.slice(0,40),d:{jsqShown:M.d.jsqDisp.slice(0,40),seed:M.d.seedViol.slice(0,40),avg:M.d.avgViol},e:M.e,f:M.f.slice(0,40),g:M.g.slice(0,40),h:M.h.slice(0,40),i:M.i,errs:M.errs.slice(0,10)}},null,1));
 console.log(JSON.stringify(S,null,1));console.log("detalle →",OUTF);
 await b.close();srv.close();
 const fail=S.a+S.b+S.c+S.e+S.f+S.g+S.h+S.i+S.pageErrors+S.d.jsqShownOutsideCA+S.d.avgOutside;process.exit(fail?1:0)})().catch(e=>{console.error(e);process.exit(2)});
