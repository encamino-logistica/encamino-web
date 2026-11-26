/* <core> — pure simulation logic (v1 verified + extra knobs). No DOM. */
const EC=(function(){
"use strict";
function rngFrom(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
/* score: % of the reel's optimum. Lower "you" is better in every lab. The epsilon is 1 % of the reference (relative), so a near-zero "you" can't blow up to thousands of %; capped at 1000. */
function score(ref,you){const e=Math.max(Math.abs(ref)*0.01,1e-6);const v=100*(ref+e)/(you+e);return isFinite(v)?Math.min(1000,v):0}
/* ---------- BAILEY (v1) + custom rule: first group g, interval I ---------- */
function citas(rule,N,c,s,g,I){const t=[];for(let i=1;i<=N;i++){if(rule==="juntos")t.push(0);else if(rule==="seis")t.push(s*Math.floor((i-1)/c));else if(rule==="bailey")t.push(s*Math.max(0,Math.ceil((i-2*c)/c)));else t.push(I*Math.max(0,Math.ceil((i-g)/c)))}return t}
function bDay(rule,N,c,s,d,rng,g,I){const H=s*Math.ceil(N/c);const t=rule==="libre"?Array.from({length:N},()=>rng()*H):citas(rule,N,c,s,g,I);const tr=t.map((x,i)=>({i,cita:x,arr:x+(d>0&&rule!=="libre"?(rng()*2-1)*d:0)}));tr.sort((a,b)=>a.arr-b.arr||a.i-b.i);const free=new Array(c).fill(0);let sumW=0,maxW=0,fin=0;for(const q of tr){let k=0;for(let j=1;j<c;j++)if(free[j]<free[k])k=j;const st=Math.max(q.arr,free[k],0);q.d=k;q.st=st;q.end=st+s;free[k]=q.end;const w=st-q.arr;sumW+=w;if(w>maxW)maxW=w;if(q.end>fin)fin=q.end}return{tr,avg:sumW/N,max:maxW,fin}}
function bStats(rule,N,c,s,d,g,I){if(d===0&&rule!=="libre"){const r=bDay(rule,N,c,s,0,null,g,I);return{avg:r.avg,max:r.max,fin:r.fin}}const rng=rngFrom(12345);let a=0,m=0,f=0;const R=3000;for(let k=0;k<R;k++){const r=bDay(rule,N,c,s,d,rng,g,I);a+=r.avg;m+=r.max;f+=r.fin}return{avg:a/R,max:m/R,fin:f/R}}
function bailey(o){const ref=bStats("bailey",o.N,o.c,o.s,o.d);const you=bStats(o.rule,o.N,o.c,o.s,o.d,o.g,o.I);const valid=you.fin<=ref.fin+1+1e-9;return{ref,you,valid,score:score(ref.avg,you.avg),juntos:o.rule==="juntos"?you:bStats("juntos",o.N,o.c,o.s,o.d)}}
/* ---------- FILA (v1) + service CV (gamma) ---------- */
function expS(r,m){return -Math.log(1-r())*m}
function normS(r){let u=0,v=0;while(u===0)u=r();v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function gammaS(r,k,theta){const d=k-1/3,c=1/Math.sqrt(9*d);for(;;){let x,v;do{x=normS(r);v=1+c*x}while(v<=0);v=v*v*v;const u=r();if(u<1-0.0331*x*x*x*x||Math.log(u)<0.5*x*x+d*(1-v+Math.log(v)))return d*v*theta}}
/* arrivals and door choice from rng; service times from their own stream so every CV sees the same arrivals */
function fGen(lam,S,c,H,rng,cv,rngS){cv=cv==null?1:cv;rngS=rngS||rng;const k=1/(cv*cv);const arr=[];let t=0;const end=H*60;while(true){t+=expS(rng,60/lam);if(t>end)break;const s=cv>=0.999?expS(rngS,S):gammaS(rngS,k,S/k);arr.push({a:t,s,u:rng()})}return arr}
const fHours=lam=>Math.min(60000,Math.max(15000,Math.round(400000/lam)));
function fSim(list,c,pol){const out=[];if(pol==="pool"){const free=new Array(c).fill(0);for(const q of list){let k=0;for(let j=1;j<c;j++)if(free[j]<free[k])k=j;const st=Math.max(q.a,free[k]);free[k]=st+q.s;out.push({a:q.a,d:k,st,e:st+q.s})}return out}
 const last=new Array(c).fill(0);const deps=[];for(let j=0;j<c;j++)deps.push([]);const head=new Array(c).fill(0);
 for(const q of list){let k;if(pol==="asig")k=Math.min(c-1,Math.floor(q.u*c));else{let best=1e9,cand=[];for(let j=0;j<c;j++){while(head[j]<deps[j].length&&deps[j][head[j]]<=q.a)head[j]++;const n=deps[j].length-head[j];if(n<best){best=n;cand=[j]}else if(n===best)cand.push(j)}k=cand[Math.min(cand.length-1,Math.floor(q.u*cand.length))]}
  const st=Math.max(q.a,last[k]);const e=st+q.s;last[k]=e;deps[k].push(e);out.push({a:q.a,d:k,st,e})}return out}
function fact(n){let r=1;for(let i=2;i<=n;i++)r*=i;return r}
function erlangC(lam,mu,c){const a=lam/mu,rho=a/c;let s=0;for(let k=0;k<c;k++)s+=Math.pow(a,k)/fact(k);const t=Math.pow(a,c)/fact(c)/(1-rho);const P=t/(s+t);return{P,Wq:P/(c*mu-lam)*60}}
function fTheory(c,lam,S,cv){const mu=60/S,rho=lam/(c*mu);const erl=rho<1?erlangC(lam,mu,c).Wq:Infinity;if(rho>=1)return{rho,asig:Infinity,pool:Infinity,erl,f:(1+cv*cv)/2};const f=(1+cv*cv)/2;return{rho,asig:rho*S*f/(1-rho),pool:erl*f,erl,f}}
const jCache={};
function fJsq(c,lam,S,cv){const mu=60/S;if(lam>=c*mu)return Infinity;const key=[c,lam,S,cv].join("|");if(jCache[key]!=null)return jCache[key];const H=Math.max(1500,Math.min(8000,80000/lam));const big=fGen(lam,S,c,H,rngFrom(901),cv,rngFrom(902));/* ratio estimator: same trucks, scaled by the exact single-queue value, so the noise cancels */const th=fTheory(c,lam,S,cv);const pa=avgW(fSim(big,c,"pool"));/* very low load: nobody waits in the single queue, so the ratio has no base */if(!(pa>1e-9))return jCache[key]=th.pool;/* theory bounds B between C and A (Winston 1977); at very low load the ratio has almost no base and can jump past A */return jCache[key]=Math.min(th.asig,Math.max(th.pool,avgW(fSim(big,c,"jsq"))*th.pool/pa))}
const avgW=o=>o.reduce((s,q)=>s+(q.st-q.a),0)/o.length;
const fCache={};
function fPolicies(c,lam,S,cv){const key=[c,lam,S,cv].join("|");if(fCache[key])return fCache[key];const big=fGen(lam,S,c,fHours(lam),rngFrom(777),cv,rngFrom(778));const r={asig:avgW(fSim(big,c,"asig")),jsq:avgW(fSim(big,c,"jsq")),pool:avgW(fSim(big,c,"pool"))};fCache[key]=r;return r}
function fila(o){const mu=60/o.S,rho=o.lam/(o.c*mu);if(rho>=1)return{rho,overload:true};const ec=erlangC(o.lam,mu,o.c);const mm1=(rho/(mu-o.lam/o.c))*60;const base=fPolicies(o.c,o.lam,o.S,1);const cur=o.cv>=0.999?base:fPolicies(o.c,o.lam,o.S,o.cv);const you=cur[o.pol];return{rho,ec,mm1,base,cur,you,ref:base.pool,valid:true,score:score(base.pool,you)}}
/* ---------- NIVEL (v1) + evaluation period + exclusion of non-imputable failures ---------- */
function okDay(f,n,meta,round){if(n<=0)return true;const pct=(n-f)/n*100;const v=round?Math.round(pct+1e-9):pct;return v>=meta-1e-9}
const LF=[0];function lf(n){for(let i=LF.length;i<=n;i++)LF[i]=LF[i-1]+Math.log(i);return LF[n]}
function logC(n,k){return lf(n)-lf(k)-lf(n-k)}
function fmaxOf(n,meta,round){let f=Math.min(n,Math.floor(n*(100-meta)/100)+2);while(f>=0&&!okDay(f,n,meta,round))f--;while(f+1<=n&&okDay(f+1,n,meta,round))f++;return f}
function binCdf(n,q,fmax){if(fmax<0)return 0;if(fmax>=n)return 1;if(q<=0)return 1;if(q>=1)return 0;const r=Math.log(q)-Math.log(1-q);let l=n*Math.log(1-q),P=Math.exp(l);for(let f=0;f<fmax;f++){l+=Math.log(n-f)-Math.log(f+1)+r;P+=Math.exp(l)}return Math.min(1,P)}
function binPmf(n,q,k){if(q<=0)return k===0?1:0;if(q>=1)return k===n?1:0;return Math.exp(logC(n,k)+k*Math.log(q)+(n-k)*Math.log(1-q))}
/* P(period passes): N stops, each fails w.p. q; a failure is non-imputable (excluded from count and base) w.p. x */
function pPass(N,q,meta,round,x){if(!(x>0))return binCdf(N,q,fmaxOf(N,meta,round));const qe=q*x,qi=q*(1-x)/(1-qe);const mu=N*qe,sd=Math.sqrt(N*qe*(1-qe));const e0=Math.max(0,Math.floor(mu-12*sd-6)),e1=Math.min(N,Math.ceil(mu+12*sd+6));let P=0;for(let e=e0;e<=e1;e++){const w=binPmf(N,qe,e);if(w<1e-15)continue;const M=N-e;P+=w*binCdf(M,qi,fmaxOf(M,meta,round))}return Math.min(1,P)}
const PER={dia:1,semana:6};
function nivel(o){const q=1-o.p;const ref=1-pPass(o.n,q,o.meta,o.round,0);const L=o.period==="mes"?o.days:PER[o.period];/* weight every block, including a short final one, exactly as the simulated month does */let bad=0;for(let s=0;s<o.days;s+=L){const len=Math.min(L,o.days-s);bad+=len*(1-pPass(o.n*len,q,o.meta,o.round,o.x))}const you=bad/o.days;return{ref,you,bad,year:bad*12*o.pen,fmax:fmaxOf(o.n,o.meta,o.round),valid:true,score:score(ref*100,you*100)}}
function nMonth(o,seed){const rng=rngFrom(seed),q=1-o.p;const L=o.period==="mes"?o.days:PER[o.period];const days=[];for(let d=0;d<o.days;d++){let f=0,e=0;for(let i=0;i<o.n;i++)if(rng()<q){if(o.x>0&&rng()<o.x)e++;else f++}days.push({f,e})}
 for(let s=0;s<o.days;s+=L){const grp=days.slice(s,s+L);const N=grp.length*o.n,E=grp.reduce((a,b)=>a+b.e,0),F=grp.reduce((a,b)=>a+b.f,0);const ok=okDay(F,N-E,o.meta,o.round);grp.forEach(g=>{g.ok=ok;g.period=s/L})}return days}
/* ---------- AMAZON (v1) + ABC zone: copies kept in the first z of the aisle ---------- */
function amazon(o){const E=o.z*o.L/(o.k+1),ref=o.L/10;return{E,ref,single:o.L/2,valid:o.k<=9,score:score(ref,E)}}
function aCurve(L){const rng=rngFrom(4242);const pts=[];for(let k=1;k<=20;k++){let s=0;const R=2000;for(let r=0;r<R;r++){let m=1;for(let j=0;j<k;j++){const u=rng();if(u<m)m=u}s+=m*L}pts.push(s/R)}return pts}
/* ---------- IKEA (v1) + scan at each handoff that detects and replaces X ---------- */
const IP=[1000,500,200,100,50,30,20,10,5];
function ikea(o){const q=1/IP[o.pi],qe=q*(1-o.X);const ref=1-Math.pow(1-q,o.n),you=1-Math.pow(1-qe,o.n);return{q,qe,ref,you,valid:true,score:score(ref*100,you*100)}}
function iBatch(o,seed){const rng=rngFrom(seed),q=1/IP[o.pi];const orders=[];for(let i=0;i<100;i++){const boxes=[];let bad=0;for(let j=0;j<o.n;j++){let st=0;if(rng()<q){if(o.X>0&&rng()<o.X)st=2;else{st=1;bad++}}boxes.push(st)}orders.push({boxes,bad})}return orders}
/* ---------- UPS (v1) + reorder stops (detour -> 0) + avoid only when it pays ---------- */
function ups(o){const v=o.v/3.6,base=200/v,det=o.X/v;const tA=base+o.W,tB=base+det;const diff=tA-tB;
 const per={dobla:o.W,evita:det,conviene:o.W>0?o.W*(1-Math.exp(-det/o.W)):0};const you=(1-o.r)*per[o.pol],ref=det;
 return{base,tA,tB,diff,det,per,you,ref,dayYou:you*o.G/60,dayRef:ref*o.G/60,year:diff*o.G/60*288/60,valid:true,score:o.G>0?score(ref,you):100}}
/* ---------- QUÉDATELO · S = V·r·(1 − d·t) − (F + P). The refund is paid in both cases, so it stays out of the balance. a = false claims per 100 that only the "keep it" rule invites ---------- */
function quedatelo(o){const f=Math.max(0,1-o.d/100*o.t),k=o.r/100*f,rec=o.V*k,cost=o.F+o.P,S=rec-cost,abuse=o.a/100*o.V,den=k+o.a/100;
 const lossT=0-S,lossD=abuse,loss=o.pol==="deja"?lossD:lossT,umbral=den>0?cost/den:Infinity;
 /* score on the seller's whole bill (refund included), so it is always positive; the reel's numbers set the reference */
 const k0=0.7*Math.max(0,1-0.04),S0=o.V*k0-11,ref=o.V+Math.min(-S0,abuse),you=o.V+loss;
 return{f,k,rec,cost,S,abuse,lossT,lossD,loss,umbral,conviene:lossT<lossD?"traer":"deja",ref,you,score:score(ref,you),valid:o.r===70&&o.d===1&&o.F===8&&o.P===3}}
/* ---------- CADENA · pedido perfecto (Richards, cap. 13): P = p^n si las fallas son independientes; si van juntas (el mismo pedido falla en todo) P = p, la cota alta. ---------- */
function cadena(o){const p=o.p/100,n=o.n,perf=o.pol==="juntas"?p:Math.pow(p,n),bad=1-perf,need=Math.pow(0.95,1/n),ref=100*(1-Math.pow(0.95,4)),you=bad*100;
 return{p,n,perf,bad,need,mes:bad*o.m,ref,you,score:score(ref,you),valid:o.pol==="indep"}}
/* ---------- BODEGAS · ley de la raíz cuadrada (Maister 1976; correlación: Eppen 1979). n bodegas iguales con b cajas de stock de seguridad cada una.
   Separadas: n·b. Juntas en una central: b·√(n + n(n−1)ρ); con ρ = 0 es b·√n (la raíz de Maister) y con ρ = 1 vuelve a n·b (sin ahorro). ---------- */
function bodegas(o){const n=o.n,b=o.b,r=Math.max(0,Math.min(1,o.rho/100)),k=Math.sqrt(n+n*(n-1)*r),sep=n*b,jun=b*k,ahorro=sep-jun,frac=n>0?jun/sep:1,
 you=o.pol==="juntas"?frac:1,ref=0.5;
 return{n,b,r,k,sep,jun,ahorro,frac,costo:ahorro*(o.c||0),you,ref,score:score(ref,you),valid:true}}
/* ---------- VECINO · ruta: vecino más cercano contra descruzar (2-opt, Johnson y McGeoch) y la mejor encontrada. Ciudad del reel: 100 paradas + bodega, OR-Tools 10 s → 100,0 km; vecino 122,1; 2-opt 103,6. Lado del mapa: KMU km. ---------- */
/* 6 capitales con calles reales: simulación propia del reel 10 (resultados_capitales.json, 2026-11-10). Medianas de 50 días por ciudad; no se inventa ninguna cifra. */
const VCAP={"meta":{"gen":"2026-11-10 14:05","dias":50,"paradas":100,"radio_km":3.0,"ortools_s":10,"dias_mes":24},"total":{"exc":0.2433,"exc2":0.1483,"arr":0.3676,"kmDia":16.7,"kmMes":400,"brecha":0.0324,"p10":0.1674,"p90":0.3343},"ciudades":[{"id":"santiago","nombre":"Santiago (Gran Santiago)","exc":0.2249,"exc2":0.1416,"arr":0.3893,"kmDia":14.2,"kmMes":341,"kmNN":79.8,"kmB":65.3,"brecha":0.0336},{"id":"cdmx","nombre":"Ciudad de México (CDMX)","exc":0.2347,"exc2":0.1602,"arr":0.2966,"kmDia":16.1,"kmMes":387,"kmNN":86.7,"kmB":70.8,"brecha":0.0351},{"id":"buenos_aires","nombre":"Buenos Aires (CABA + conurbano cercano)","exc":0.2337,"exc2":0.1299,"arr":0.4578,"kmDia":14.9,"kmMes":357,"kmNN":73.7,"kmB":60.5,"brecha":0.0326},{"id":"madrid","nombre":"Madrid (municipio)","exc":0.262,"exc2":0.1895,"arr":0.2517,"kmDia":21.1,"kmMes":506,"kmNN":102.3,"kmB":82.7,"brecha":0.0342},{"id":"bogota","nombre":"Bogotá (urbana)","exc":0.248,"exc2":0.1549,"arr":0.3994,"kmDia":18.2,"kmMes":436,"kmNN":89.3,"kmB":72.1,"brecha":0.0299},{"id":"lima","nombre":"Lima (Lima Metropolitana)","exc":0.2411,"exc2":0.1237,"arr":0.485,"kmDia":16.7,"kmMes":401,"kmNN":87.5,"kmB":71.1,"brecha":0.0303}]};
const VP=[[0.5,0.06],[0.09525,0.49754],[0.65949,0.41626],[0.07215,0.09652],[0.00902,0.3212],[0.16055,0.94945],[0.63074,0.09795],[0.66546,0.50449],[0.83044,0.18841],[0.34682,0.48882],[0.51164,0.14321],[0.83045,0.15783],[0.46282,0.56896],[0.43838,0.34055],[0.72218,0.52421],[0.68348,0.76238],[0.92395,0.49276],[0.41741,0.91958],[0.96548,0.87291],[0.20353,0.90846],[0.64668,0.52235],[0.13134,0.16232],[0.8661,0.28877],[0.47399,0.4278],[0.38534,0.42552],[0.28018,0.89963],[0.51445,0.29371],[0.21243,0.80147],[0.78917,0.8213],[0.59549,0.33034],[0.21188,0.37303],[0.08971,0.27558],[0.34754,0.11569],[0.15195,0.11974],[0.38897,0.92658],[0.95899,0.10337],[0.59528,0.00541],[0.66651,0.62601],[0.51304,0.27814],[0.46502,0.03882],[0.6552,0.77805],[0.08558,0.99904],[0.17734,0.91561],[0.97884,0.42404],[0.84085,0.56175],[0.27255,0.68699],[0.35893,0.15323],[0.77161,0.19042],[0.93427,0.19863],[0.32295,0.80142],[0.83613,0.40161],[0.60944,0.94388],[0.29091,0.26827],[0.10476,0.68879],[0.69097,0.12272],[0.71975,0.288],[0.51127,0.56173],[0.58333,0.55233],[0.39932,0.70054],[0.21036,0.86962],[0.38793,0.77293],[0.60837,0.45155],[0.47571,0.52505],[0.41854,0.56147],[0.47649,0.84351],[0.26139,0.75261],[0.41158,0.85155],[0.82797,0.07509],[0.92729,0.81234],[0.65567,0.1919],[0.83247,0.59147],[0.23179,0.63977],[0.11994,0.6992],[0.19281,0.30578],[0.02295,0.37336],[0.60648,0.65618],[0.41607,0.28004],[0.09522,0.35617],[0.78178,0.93324],[0.92071,0.08433],[0.12778,0.368],[0.55892,0.05023],[0.08953,0.82499],[0.99654,0.43816],[0.79272,0.70254],[0.76874,0.42093],[0.92913,0.12333],[0.26624,0.63572],[0.24959,0.83878],[0.82157,0.78903],[0.87821,0.63559],[0.18224,0.32892],[0.0043,0.39549],[0.63586,0.69675],[0.71446,0.25961],[0.92359,0.54455],[0.20742,0.93688],[0.67239,0.68276],[0.60754,0.00137],[0.5517,0.72178],[0.66578,0.2153]],VBEST=[0,39,10,38,26,29,23,24,13,76,46,32,52,73,91,30,80,77,31,21,33,3,4,74,92,1,53,72,82,41,5,42,96,19,59,88,27,65,45,71,87,9,63,12,62,56,57,20,7,61,2,85,14,37,97,93,75,99,58,60,49,25,34,17,66,64,51,40,15,28,78,18,68,89,84,90,70,44,95,16,83,43,50,22,48,86,35,79,67,11,8,47,55,94,100,69,54,6,98,36,81],KMU=12.191232;
function vPts(n,seed){if(seed===0&&n===100)return VP;const r=rngFrom(seed*104729+n*31+7),p=[[0.5,0.06]];for(let i=0;i<n;i++)p.push([0.02+0.96*r(),0.02+0.96*r()]);return p}
function vLen(p,o){let s=0;for(let i=0;i<o.length;i++){const a=p[o[i]],b=p[o[(i+1)%o.length]];s+=Math.hypot(a[0]-b[0],a[1]-b[1])}return s*KMU}
function vNN(p){const n=p.length,used=new Array(n).fill(false),o=[0];used[0]=true;let c=0;for(let k=1;k<n;k++){let b=-1,bd=1e9;for(let j=0;j<n;j++)if(!used[j]){const d=Math.hypot(p[c][0]-p[j][0],p[c][1]-p[j][1]);if(d<bd){bd=d;b=j}}o.push(b);used[b]=true;c=b}return o}
function v2opt(p,o0){const o=o0.slice(),n=o.length,D=(a,b)=>Math.hypot(p[a][0]-p[b][0],p[a][1]-p[b][1]);let mej=true,pasos=0;
 while(mej&&pasos<2000){mej=false;for(let i=0;i<n-1;i++)for(let k=i+2;k<n;k++){const a=o[i],b=o[i+1],c=o[k],d=o[(k+1)%n];if(a===d)continue;if(D(a,b)+D(c,d)>D(a,c)+D(b,d)+1e-12){let x=i+1,y=k;while(x<y){const t=o[x];o[x]=o[y];o[y]=t;x++;y--}mej=true;pasos++}}}return o}
function vOr(p,o0){let o=v2opt(p,o0),mej=true,v=0;const n=o.length,D=(a,b)=>Math.hypot(p[a][0]-p[b][0],p[a][1]-p[b][1]);
 while(mej&&v<80){mej=false;v++;
  for(let s=1;s<=3&&!mej;s++)for(let i=1;i+s<=n&&!mej;i++){const pr=o[i-1],f=o[i],l=o[i+s-1],nx=o[(i+s)%n];if(nx===undefined)continue;
   const quita=D(pr,f)+D(l,nx)-D(pr,nx);
   for(let j=0;j<n&&!mej;j++){const a=o[j],b=o[(j+1)%n];if(j>=i-1&&j<=i+s-1)continue;
    const g1=quita-(D(a,f)+D(l,b)-D(a,b)),g2=quita-(D(a,l)+D(f,b)-D(a,b));
    if(g1>1e-12||g2>1e-12){const seg=o.slice(i,i+s);if(g2>g1)seg.reverse();const rest=o.slice(0,i).concat(o.slice(i+s));const jj=rest.indexOf(a);o=v2opt(p,rest.slice(0,jj+1).concat(seg,rest.slice(jj+1)));mej=true}}}}
 return o}
function vBest(p,seed){if(p===VP)return VBEST;let best=vOr(p,vNN(p)),bl=vLen(p,best);const r=rngFrom(seed*7+3);for(let t=0;t<2;t++){const o=[0].concat(p.slice(1).map((_,i)=>i+1).sort(()=>r()-0.5));const c=vOr(p,o),l=vLen(p,c);if(l<bl){bl=l;best=c}}return best}
function vCruces(p,o){const n=o.length,E=[];for(let i=0;i<n;i++)E.push([o[i],o[(i+1)%n]]);const ccw=(A,B,C)=>(C[1]-A[1])*(B[0]-A[0])>(B[1]-A[1])*(C[0]-A[0]);let c=0;
 for(let i=0;i<n;i++)for(let j=i+2;j<n;j++){const[a,b]=E[i],[d,e]=E[j];if(a===e||b===d||a===d||b===e)continue;const A=p[a],B=p[b],C=p[d],F=p[e];if(ccw(A,C,F)!==ccw(B,C,F)&&ccw(A,B,C)!==ccw(A,B,F))c++}return c}
const VCACHE={};
function vecino(o){const key=o.n+"|"+o.seed;let base=VCACHE[key];if(!base){const p=vPts(o.n,o.seed),nn=vNN(p),dos=v2opt(p,nn),best=vBest(p,o.seed);const lb=vLen(p,best),l2=vLen(p,dos);const bb=l2<lb?dos:best;base=VCACHE[key]={p,nn,dos,best:bb,kNN:vLen(p,nn),k2:l2,kB:Math.min(lb,l2),cNN:vCruces(p,nn),c2:vCruces(p,dos)}}
 const o2=o.pol==="vecino"?base.nn:o.pol==="descruzar"?base.dos:base.best,k=o.pol==="vecino"?base.kNN:o.pol==="descruzar"?base.k2:base.kB;
 const exc=k/base.kB-1,arregla=base.kNN>base.kB?(base.kNN-base.k2)/(base.kNN-base.kB):1,dias=o.d||24;
 return Object.assign({},base,{orden:o2,km:k,exc,arregla,extraDia:k-base.kB,extraMes:(k-base.kB)*dias,ref:base.kB,you:k,score:score(base.kB,k),valid:true})}
/* ---------- ORDENAR · búsqueda secuencial (Knuth, TAOCP vol. 3 §6.1): buscando sin orden entre m se revisan (m+1)/2 en promedio.
   Aplicado por En Camino a cada parada sobre los m paquetes que quedan (un paquete por parada, todos igual de probables, sin recordar dónde quedó cada uno).
   Grupos de s paradas consecutivas sin orden dentro: s(s+3)/4 revisiones por grupo. Reel (98): revuelto 2.474,5 · tercios 874 · pilas de 10 314,5 · secuencia 98. ---------- */
function oGrupos(n,pol,k){if(pol==="revuelto")return[n];if(pol==="secuencia")return Array(n).fill(1);
 if(pol==="tercios"){const b=Math.floor(n/3),r=n%3;return[0,1,2].map(i=>b+(i<r?1:0)).filter(x=>x>0)}
 const g=[];let q=n;while(q>0){g.push(Math.min(k,q));q-=k}return g}
function ordenar(o){const n=o.n,k=Math.max(1,o.k||10),gr=oGrupos(n,o.pol,k),tot=gr.reduce((a,s)=>a+s*(s+3)/4,0),rev=n*(n+3)/4,sec=n,seg=o.t||0;
 const porParada=[];gr.forEach(s=>{for(let m=s;m>=1;m--)porParada.push((m+1)/2)});
 return{n,k,gr,tot,rev,sec,veces:rev/tot,ahorro:rev-tot,prom:tot/n,porParada,primera:porParada[0],min:tot*seg/60,minRev:rev*seg/60,minAhorro:(rev-tot)*seg/60,ref:sec,you:tot,score:score(sec,tot),valid:true}}
/* ---------- CO2 · la entrega fallida (reel 13). Solo el furgón, no el viaje del cliente. Valor esperado del Monte Carlo de En Camino
   (cifras_v8.py, N=200.000): ralentí 0,17–0,39 gal/h (Argonne, auto diésel 2,0 L) · 2,676 kg CO2/l (IPCC 2006: 74.100 kg/TJ × 43,0 TJ/Gg × 0,84 kg/l)
   · m min con motor encendido · furgón 247 g/km (Gutenschwager 2024) · s % vuelve el mismo día: desvío 2·d km · el resto al día siguiente: +0,29 km (GPS de nuestra operación, n=6).
   Regla "vecino": si no hay nadie, se deja con un vecino; las fallidas que vuelven bajan 37,5 % (Ofcom 2012 §4.3: 12 % → 7,5 %).
   Reel: 10.000 pedidos/día · 5 % no están · 2 min · d 0,6 km · 80 % → 346 g por fallida · 63,2 t al año · 2.870 árboles (22 kg EEA) · 27,3 % esperando. ---------- */
/* reel 15 · inventario fantasma. Réplica del modelo de Kang y Gershwin (working paper del MIT, 2004, §2.2, p. 8–10; IIE Transactions
   37(9), 2005), la misma lógica y parámetros de salidas/R015/replica_kang_gershwin.py: un producto, política (Q, R) revisada cada día con
   el REGISTRO (si registro + pedido en camino ≤ R se pide Q), Q = 50, R = 41, plazo L = 3, demanda normal truncada media 10 y desviación 2
   (se descartan las negativas; redondeada a la unidad), pérdida Poisson de media λ = pérdida % × 10 / 100, ventas perdidas, 365 días,
   inicio R + Q − μL = 61 con registro = físico. Orden del día (p. 9): 1) revisión y pedido; 2) llega lo pedido; 3) ventas y pérdida,
   repartidas en proporción si no alcanza (ec. 3, la venta redondeada al entero, mitades al par como numpy.rint). El registro suma lo
   recibido y resta lo vendido; la pérdida no entra (ec. 4 y 5). «Restar» baja el registro λ cada día (§3.1.4, p. 16); «contar cada N
   días» iguala registro = físico al final de los días N, 2N… (§3.1.2, p. 15–16). 500 corridas con semilla fija; la demanda y la pérdida
   salen de dos generadores distintos, así todas las posiciones de los controles ven la misma demanda. */
const INV={MU:10,SIG:2,L:3,Q:50,R:41,DIAS:365,CORR:500,SEED:20261117,CONTEOS:[0,182,91,30,7]};
function iRint(x){const f=Math.floor(x),d=x-f;return d>0.5?f+1:d<0.5?f:(f%2===0?f:f+1)}
function iPois(r,lam){if(!(lam>0))return 0;const e=Math.exp(-lam);let k=0,p=r();while(p>e){k++;p*=r()}return k}
function iDem(r){let w;do{w=INV.MU+INV.SIG*normS(r)}while(w<0);return iRint(w)}
function iSeed(k){return(INV.SEED+Math.imul(k+1,0x9E3779B1))>>>0}
function invAnio(lam,N,restar,k,traza){const L=INV.L,Q=INV.Q,R=INV.R,rD=rngFrom(iSeed(k)),rV=rngFrom(iSeed(k)^0x5BD1E995);
 let x=R+Q-INV.MU*L,xr=x,dem=0,pv=0,pr=0,st=0,sr=0,vac=0,cong=0;const cam=new Array(L+1).fill(0),T=traza?{xr:[],x:[],lost:[],pide:[],cuenta:[]}:null;
 for(let dia=1;dia<=INV.DIAS;dia++){let enc=0;for(let j=0;j<=L;j++)enc+=cam[j];const pide=xr+enc<=R;if(pide)cam[L]+=Q;
  const h=cam[0];for(let j=0;j<L;j++)cam[j]=cam[j+1];cam[L]=0;const disp=x+h,w=iDem(rD),v=iPois(rV,lam);
  let a=w,p=v;if(w+v>disp){a=iRint(disp*w/(w+v));p=Math.min(v,disp-a)}
  xr=xr+h-a;x=disp-a-p;dem+=w;pv+=w-a;pr+=p;st+=x;if(w>a)vac++;if(x<=0&&xr>R&&!pide&&enc===0)cong++;
  if(restar)xr-=lam;/* como en el paper: con «restar» el registro es una estimación y puede bajar de cero; la pantalla muestra máx(0, registro) */const cu=N>0&&dia%N===0;if(cu)xr=x;sr+=xr;
  if(T){T.xr.push(xr);T.x.push(x);T.lost.push(w-a);T.pide.push(pide);T.cuenta.push(cu)}}
 return{q:dem>0?pv/dem:0,dem,pv,pr,st:st/INV.DIAS,sr:sr/INV.DIAS,vac,cong,xr,x,T}}
const ICACHE={};
function inventario(o){const pp=Math.max(0,Math.min(7,Math.round((+o.p||0)*10)/10)),N=INV.CONTEOS.includes(+o.N)?+o.N:0,restar=o.pol==="restar",lam=INV.MU*pp/100,key=pp+"|"+N+"|"+restar;
 let b=ICACHE[key];if(!b){const C=INV.CORR,qs=[];let dem=0,pv=0,pr=0,st=0,sr=0,vac=0,cong=0,fx=0,fxr=0,anyLost=0;
  for(let k=0;k<C;k++){const y=invAnio(lam,N,restar,k,false);qs.push(y.q);dem+=y.dem;pv+=y.pv;pr+=y.pr;st+=y.st;sr+=y.sr;vac+=y.vac;cong+=y.cong;fx+=y.x;fxr+=y.xr;if(y.pv>0)anyLost++}
  const ord=qs.map((q,k)=>[q,k]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]),pc=f=>{const i=(C-1)*f,lo=Math.floor(i),hi=Math.ceil(i);return ord[lo][0]+(ord[hi][0]-ord[lo][0])*(i-lo)};
  const q=qs.reduce((s,v)=>s+v,0)/C,med=ord[Math.floor(C/2)][1],tipico=invAnio(lam,N,restar,med,true);
  b=ICACHE[key]={p:pp,N,restar,lam,q,p10:pc(0.1),p90:pc(0.9),perdReal:pr/dem,mult:pr>0?pv/pr:null,vacio:vac/C,cong:cong/C,stock:st/C,registro:sr/C,finX:fx/C,finXr:fxr/C,
   demAnio:dem/C,perdidasAnio:pv/C,unidadesPerdidas:pr/C,anyLost,tipico:tipico.T,tq:tipico.q,tvac:tipico.vac,corridas:C}}
 const ref=inventario0();return Object.assign({},b,{ref:ref.q,you:b.q,score:score(ref.q,b.q),valid:true})}
function inventario0(){const k="0|0|false";if(!ICACHE[k])inventario({p:0,N:0,pol:"nada"});return ICACHE[k]}
/* reel 18 · el GPS contra el conductor. Datos del estudio: Cook, Held y Helsgaun (2021), arXiv 2112.15192 v2, tablas 1 y 3:
   ruta óptima por tiempo de viaje (ATSP) 10.853,3 s, la del conductor 12.250,0 s, la que termina cada zona antes de la siguiente
   11.235,1 s; unas 20 zonas por ruta (§4.2). El empate por barrio es cálculo propio (calculo_R018): (12.250,0 − 10.853,3) ÷ 20 ÷ 60. */
const GPSD={OPT:10853.3,COND:12250.0,ZON:11235.1,ZONAS:20,LADO:8};
function gpsEstudio(){const ex=GPSD.COND-GPSD.OPT,hm=s=>{const m=Math.round(s/60);return[Math.floor(m/60),m%60]};
 return{extraS:ex,extraMin:ex/60,extraPct:100*ex/GPSD.OPT,zonPct:100*(GPSD.ZON-GPSD.OPT)/GPSD.OPT,explica:100*(GPSD.ZON-GPSD.OPT)/ex,empMin:ex/GPSD.ZONAS/60,relOpt:hm(GPSD.OPT),relCond:hm(GPSD.COND),zonas:GPSD.ZONAS}}
function gPts(B,m,seed){const r=rngFrom(seed*7919+B*131+m*17+5),cols=Math.ceil(Math.sqrt(B)),rows=Math.ceil(B/cols),cw=0.94/cols,ch=0.86/rows,p=[[0.5,0.02]],z=[-1],cen=[];
 for(let b=0;b<B;b++){const i=b%cols,j=Math.floor(b/cols),cx=0.03+cw*(i+0.5)+(r()-0.5)*cw*0.18,cy=0.11+ch*(j+0.5)+(r()-0.5)*ch*0.18;cen.push([cx,cy]);
  for(let k=0;k<m;k++){p.push([cx+(r()-0.5)*cw*0.72,cy+(r()-0.5)*ch*0.72]);z.push(b)}}return{p,z,cen}}
function gLen(p,o){let s=0;for(let i=0;i<o.length;i++){const a=p[o[i]],b=p[o[(i+1)%o.length]];s+=Math.hypot(a[0]-b[0],a[1]-b[1])}return s*GPSD.LADO}
function gRuns(z,o){const runs={};let prev=-2;for(let i=1;i<o.length;i++){const b=z[o[i]];if(b!==prev){runs[b]=(runs[b]||0)+1;prev=b}}return runs}
function gBarrios(p,z,cen){/* orden de los barrios: la mejor vuelta por sus centros; dentro de cada barrio, vecino más cercano y 2-opt sin salir del barrio */
 const q=[p[0]].concat(cen),oc=vOr(q,vNN(q)).slice(1).map(i=>i-1),o=[0];let cur=p[0];
 for(const b of oc){const rest=[];for(let i=1;i<p.length;i++)if(z[i]===b)rest.push(i);
  while(rest.length){let bi=0,bd=1e9;rest.forEach((i,k)=>{const d=Math.hypot(p[i][0]-cur[0],p[i][1]-cur[1]);if(d<bd){bd=d;bi=k}});const i=rest.splice(bi,1)[0];o.push(i);cur=p[i]}}
 const n=o.length,D=(a,b)=>Math.hypot(p[a][0]-p[b][0],p[a][1]-p[b][1]);let mej=true,pasos=0;
 while(mej&&pasos<4000){mej=false;for(let i=0;i<n-1;i++)for(let k=i+2;k<n;k++){const zb=z[o[i+1]];if(z[o[k]]!==zb)continue;let mismo=true;for(let t=i+2;t<k;t++)if(z[o[t]]!==zb){mismo=false;break}if(!mismo)continue;
  const a=o[i],b=o[i+1],c=o[k],d=o[(k+1)%n];if(a===d)continue;if(D(a,b)+D(c,d)>D(a,c)+D(b,d)+1e-12){let x=i+1,y=k;while(x<y){const t=o[x];o[x]=o[y];o[y]=t;x++;y--}mej=true;pasos++}}}
 return{o,ordenB:oc}}
const GCACHE={};
function gps(o){const B=o.B,m=o.m,key=B+"|"+m+"|"+o.seed;let base=GCACHE[key];
 if(!base){const{p,z,cen}=gPts(B,m,o.seed),bar=gBarrios(p,z,cen);let oc=vOr(p,vNN(p));const kC0=gLen(p,oc),kB=gLen(p,bar.o);
  if(kB<kC0)oc=bar.o.slice();/* la ruta por barrios también es una ruta: la más corta no puede ser más larga que ella */
  const kC=Math.min(kC0,kB),runs=gRuns(z,oc),runsB=gRuns(z,bar.o);let una=0,ent=0;for(let b=0;b<B;b++){if(runs[b]===1)una++;ent+=runs[b]||0}
  base=GCACHE[key]={p,z,cen,oc,ob:bar.o,ordenB:bar.ordenB,kC,kB,una,ent,unaB:Object.keys(runsB).filter(k=>runsB[k]===1).length}}
 const v=o.v,g=o.g,minC=base.kC/v*60,minB=base.kB/v*60,tC=minC-g*base.una,tB=minB-g*B,extra=base.kC>0?base.kB/base.kC-1:0;
 const faltan=B-base.una,gEmp=faltan>0?Math.max(0,(minB-minC)/faltan):null,bar=o.pol==="barrios";
 const km=bar?base.kB:base.kC,min=bar?minB:minC,t=bar?tB:tC,una=bar?B:base.una,ref=Math.min(tC,tB);
 /* la cuenta que se muestra: min de manejo − min ganados = total; con un decimal solo si lo ganado no es entero, para que cuadre al redondear */
 const gan=g*una,dec=Math.abs(gan-Math.round(gan))>1e-9?1:0;
 return{p:base.p,z:base.z,cen:base.cen,orden:bar?base.ob:base.oc,oc:base.oc,ob:base.ob,ordenB:base.ordenB,kC:base.kC,kB:base.kB,minC,minB,tC,tB,extra,extraMin:minB-minC,
  una,unaC:base.una,unaB:base.unaB,entradas:base.ent,faltan,gEmp,km,min,t,gan,dec,porBarrio:min/B,gana:tB<tC-1e-9?"barrios":tC<tB-1e-9?"corta":"empate",paradas:B*m,
  ref,you:t,score:score(ref,t),valid:true,E:gpsEstudio()}}
const C2={GAL:3.785411784,KGL:74100*43.0e-6*0.84,IDLE:0.28,IDLO:0.17,IDHI:0.39,VAN:247,SIG:0.29,ARB:22,DIAS:365,VEC:0.375};
function co2(o){const lh=C2.IDLE*C2.GAL,P=o.P,a=o.a/100,av=(o.av||0)/100,m=o.m,d=o.d,man=o.pol==="manana";
 const fs=man?0:o.s/100,gEsp=o.pol==="apagado"?0:lh*m/60*C2.KGL*1000,gMismo=2*d*C2.VAN,gSig=C2.SIG*C2.VAN,gV=fs*gMismo+(1-fs)*gSig,g=gEsp+gV;
 const vec=o.pol==="vecino"?C2.VEC:0,fall=P*a*(1-av)*(1-vec),tDia=fall*g/1e6,t=tDia*C2.DIAS,arb=t*1000/C2.ARB;
 const refG=lh*2/60*C2.KGL*1000+0.8*2*0.6*C2.VAN+0.2*gSig,ref=P*a*C2.DIAS*refG/1e6;
 return{g,gEsp,gV,gMismo,gSig,fs,lh,vec,fall,fallAnio:fall*C2.DIAS,t,tDia,arb,esp:g>0?gEsp/g:0,refG,ref,you:t,ahorro:ref-t,score:score(ref,t),valid:true}}
/* ---------- AIRE · pagas por el aire (reel 17). Peso volumétrico = largo × ancho × alto (cm) / divisor; se cobra el mayor entre el real y el
   volumétrico, redondeado hacia arriba al kg (guía de tarifas de la ficha, servicio Expedited: «rounded up to the next kilogram»; Express redondea al medio kg).
   Divisor 5.000 cm³/kg (grandes couriers) o 6.000: depende del courier y del servicio. «Achicar» quita 5 cm a cada lado (mínimo 5 cm).
   Aire: la parte de la caja que tu peso no paga, 1 − real·divisor / volumen (0 si el real manda).
   Reel: 50×40×30 con 2 kg → 12 kg cobrados (6 veces); achicada 45×35×25 → 7,875 → 8 kg (un tercio menos). ---------- */
const AI={DIVS:[5000,6000],REC:5,MIN:5};
function aKg(L,A,H,kg,div){const V=L*A*H,vol=V/div,cob=Math.ceil(Math.max(kg,vol)-1e-9);return{V,vol,cob}}
function aire(o){const div=AI.DIVS.includes(+o.div)?+o.div:5000,kg=Math.max(0.1,+o.kg||0.1),dim=k=>Math.max(AI.MIN,+o[k]||AI.MIN),ach=o.pol==="achicar";
 const L0=dim("L"),A0=dim("A"),H0=dim("H"),sh=x=>ach?Math.max(AI.MIN,x-AI.REC):x,L=sh(L0),A=sh(A0),H=sh(H0);
 const c=aKg(L,A,H,kg,div),c0=aKg(L0,A0,H0,kg,div),real=Math.ceil(kg-1e-9),manda=c.vol>kg?"volumen":"peso";
 const aireKg=Math.max(0,c.cob-kg),aireFr=c.V>0?Math.max(0,1-kg*div/c.V):0;
 return{L,A,H,L0,A0,H0,div,kg,ach,V:c.V,vol:c.vol,cob:c.cob,V0:c0.V,vol0:c0.vol,cob0:c0.cob,veces:c.cob/kg,veces0:c0.cob/kg,aireKg,aireFr,manda,
  menos:c0.cob>0?(c0.cob-c.cob)/c0.cob:0,ref:real,you:c.cob,score:score(real,c.cob),valid:true}}
/* ---------- LOCKER · furgón contra furgón (reel 14). Hovi y Bø (2024), Sustainable Futures 7, 100189. Turno de 8 h (Tabla 3.3):
   30 min de carga en el terminal; el resto se reparte en paquetes. Minutos por paquete = tiempo de la parada ÷ paquetes por parada + km por paquete ÷ velocidad.
   Domicilio sin firma: parada 15+10+10+60 s + 50 s por paquete, 1 por parada, 1,33 km a 17,2 km/h → 7,056 min → ⌊450/7,056⌋ = 63.
   Locker: parada 30+18+10+90 s + 30 s por paquete, 5 por locker, 0,93 km a 23,1 km/h → 3,409 min → ⌊450/3,409⌋ = 132. Sin calibrar nada.
   Otros paquetes por locker: los escenarios de la misma tabla (1, 10, 15, 20, 25, 30) con interpolación lineal entre ellos; sobre 30 el estudio
   no publica y se dejan los de 30. El furgón de 14 m³ al 80 % (Tabla 3.2) lleva ⌊11.200 / 27,3 dm³⌋ = 410 paquetes de locker (Tabla 4.1): tope.
   Costo por paquete = costo por viaje (Tabla 4.1: 355 € sin firma, 364 € locker, el mismo para cualquier escenario: el estudio no publica otro) ÷ paquetes.
   Ruta mixta (simulación de En Camino): una parte p de los paquetes va al locker (la intención declarada de la encuesta PostNord citada por el estudio
   × los que lo hacen de verdad) y el resto a domicilio, en el mismo turno: paquetes por viaje = ⌊450 / (p·t_locker + (1 − p)·t_dom)⌋ y costo promedio
   por paquete = p · costo del locker + (1 − p) · costo a domicilio (así nunca sube cuando más gente usa el locker). ---------- */
const LK={TURNO:480,CARGA:30,DH:1.33,VH:17.2,PH:15+10+10+60,EH:50,VL:23.1,PL:30+18+10+90,KS:[1,5,10,15,20,25,30],DL:[1.06,0.93,0.76,0.60,0.44,0.28,0.11],EL:[31,30,28,26,25,23,21],
 CH:355,CL:364,PUB:2.80,T42:2.51,VAN:14*0.8*1000,VOLH:27.7,VOLL:27.3,ACC:{300:47,500:33,1000:14},PROM:5};
function lkInterp(xs,ys,x){if(x<=xs[0])return ys[0];for(let i=1;i<xs.length;i++)if(x<=xs[i]){const u=(x-xs[i-1])/(xs[i]-xs[i-1]);return ys[i-1]+(ys[i]-ys[i-1])*u}return ys[ys.length-1]}
function lkMinL(k){const km=lkInterp(LK.KS,LK.DL,k),ent=lkInterp(LK.KS,LK.EL,k);return{km,ent,par:(LK.PL/k+ent)/60,viaje:km/LK.VL*60}}
function locker(o){const k=Math.max(1,Math.min(50,Math.round(+o.k||LK.PROM))),dist=LK.ACC[o.dist]!==undefined?+o.dist:300,u=Math.max(0,Math.min(100,o.u===undefined?100:+o.u)),pol=o.pol||"locker";
 const MIN=LK.TURNO-LK.CARGA,tHpar=(LK.PH+LK.EH)/60,tHv=LK.DH/LK.VH*60,tH=tHpar+tHv,L=lkMinL(k),tL=L.par+L.viaje;
 const capH=Math.floor(LK.VAN/LK.VOLH),capL=Math.floor(LK.VAN/LK.VOLL);
 const nHt=Math.floor(MIN/tH+1e-9),nLt=Math.floor(MIN/tL+1e-9),nH=Math.min(nHt,capH),nL=Math.min(nLt,capL);
 const cH=LK.CH/nH,cL=LK.CL/nL,acc=LK.ACC[dist],p=acc/100*u/100;
 const tM=p*tL+(1-p)*tH,capM=Math.floor(LK.VAN/(p*LK.VOLL+(1-p)*LK.VOLH)),nMt=Math.floor(MIN/tM+1e-9),nM=Math.min(nMt,capM),cM=p*cL+(1-p)*cH,costM=cM*nM;
 const n=pol==="domicilio"?nH:pol==="mixta"?nM:nL,c=pol==="domicilio"?cH:pol==="mixta"?cM:cL,lleno=pol==="domicilio"?nHt>capH:pol==="mixta"?nMt>capM:nLt>capL;
 const L5=lkMinL(LK.PROM),ref=LK.CL/Math.floor(MIN/(L5.par+L5.viaje)+1e-9);
 return{k,dist,u,pol,acc,p,MIN,tH,tHpar,tHv,tL,tLpar:L.par,tLv:L.viaje,kmL:L.km,entL:L.ent,nH,nL,nM,nHt,nLt,nMt,capH,capL,capM,cH,cL,cM,costM,n,c,lleno,
  veces:cH/c,usoL:nL*LK.VOLL/LK.VAN,ref,you:c,score:score(ref,c),valid:true}}
/* ---------- FEDEX · más lejos a propósito (reel 20). Cifras de la hoja de cifras del reel (reels/R020/hoja_cifras.json):
   Según FedEx, la primera noche (17-04-1973) 14 aviones llevaron 186 paquetes a 25 ciudades (historia corporativa, copia del Internet Archive 29-10-2026; Newsroom 17-04-2013);
   hoy el centro de Memphis puede procesar hasta 484.000 paquetes por hora (capacidad, no volumen; Newsroom 30-10-2024).
   Cálculo propio (Memphis cuenta como una de las 25 ciudades): ciudad con ciudad n(n−1)/2 = 300 conexiones; con un centro n−1 = 24;
   186 ÷ 25 = 7,44 paquetes por ciudad (la cifra del reel) y 186 ÷ 24 = 7,75 por conexión con el centro, en promedio;
   sumar la ciudad 26: 25 conexiones nuevas contra 1. Teoría: Hendricks, Piccione y Tan (1995), la red más chica que une n ciudades tiene n−1 conexiones.
   Supuestos ilustrativos (marcados en la página): mapa con ciudades de ejemplo (no las de 1973), distancias en línea recta, un avión por conexión cada noche,
   paquetes repartidos parejo entre conexiones y entre pares de ciudades, y cuántos paquetes caben en un avión. ---------- */
const FX={N0:25,P0:186,AV0:14,AN0:1973,HUB:484000,NMIN:5,NMAX:50,PMIN:10,PMAX:1000,CMIN:5,CMAX:50,CAP0:10,VACIO:0.25,LLENO:0.75};
/* Mapa ilustrativo: contorno de EE. UU. (Natural Earth lowres, sin fronteras estatales), lagos como en el reel R020 y ciudades REALES de
   ejemplo en su posición aproximada (proyección equirectangular a 37,5° N, normalizada). La 0 es Memphis, el centro; las demás en orden fijo por
   tamaño: con n ciudades se usan las n primeras y la n+1 es la que se suma. No son las 25 de 1973 (FedEx no publica cuáles fueron). */
const FXMAP={"asp":0.5489,"us":[[0.05,0.0274],[0.0973,0.0274],[0.1468,0.0274],[0.1631,0.0274],[0.2139,0.0274],[0.2631,0.0274],[0.313,0.0274],[0.363,0.0274],[0.4196,0.0274],[0.4766,0.0274],[0.5111,0.0274],[0.5112,0.0193],[0.5168,0.0192],[0.5198,0.0308],[0.5249,0.0343],[0.5366,0.0356],[0.5536,0.0389],[0.5697,0.0455],[0.5832,0.0427],[0.6037,0.0482],[0.6092,0.048],[0.6241,0.042],[0.6397,0.0497],[0.656,0.0578],[0.6695,0.0648],[0.6824,0.0715],[0.684,0.077],[0.6879,0.0791],[0.6869,0.0812],[0.6914,0.0818],[0.6946,0.0796],[0.6955,0.0846],[0.6988,0.0879],[0.7034,0.0879],[0.7058,0.0905],[0.7038,0.0942],[0.7211,0.1041],[0.7247,0.1231],[0.728,0.1414],[0.7231,0.1538],[0.7153,0.1653],[0.7117,0.1727],[0.7113,0.1749],[0.7132,0.1779],[0.7188,0.1812],[0.723,0.1812],[0.7423,0.17],[0.7595,0.1667],[0.7813,0.1562],[0.7816,0.1541],[0.7801,0.1477],[0.7774,0.1436],[0.7849,0.1403],[0.8013,0.1402],[0.8166,0.1402],[0.8219,0.132],[0.824,0.1304],[0.8416,0.1152],[0.8491,0.1114],[0.8744,0.1112],[0.9051,0.1112],[0.9068,0.106],[0.9121,0.105],[0.9192,0.1017],[0.9251,0.0922],[0.9302,0.0758],[0.9429,0.06],[0.9484,0.0655],[0.9596,0.0619],[0.967,0.068],[0.967,0.0966],[0.9779,0.1085],[0.9808,0.1154],[0.963,0.1256],[0.9459,0.1328],[0.9283,0.139],[0.9195,0.1515],[0.9166,0.1562],[0.9165,0.1673],[0.922,0.1785],[0.9289,0.179],[0.9271,0.1713],[0.9321,0.176],[0.9308,0.182],[0.9195,0.1854],[0.9115,0.185],[0.8992,0.1887],[0.892,0.1897],[0.8823,0.1907],[0.8684,0.1968],[0.8929,0.1929],[0.8978,0.1968],[0.8745,0.2031],[0.8639,0.2032],[0.8644,0.2006],[0.8593,0.2064],[0.8642,0.2074],[0.8606,0.2225],[0.8485,0.2386],[0.8472,0.2332],[0.8436,0.2322],[0.8381,0.2269],[0.8416,0.2382],[0.8457,0.2419],[0.846,0.2499],[0.8406,0.258],[0.8313,0.2748],[0.8297,0.274],[0.8349,0.2597],[0.8264,0.2517],[0.8244,0.2342],[0.8212,0.2433],[0.8248,0.2566],[0.8138,0.2533],[0.8252,0.2601],[0.8259,0.2801],[0.8307,0.2815],[0.8325,0.2888],[0.8348,0.3098],[0.8242,0.3254],[0.807,0.3316],[0.796,0.3439],[0.7877,0.3453],[0.7793,0.353],[0.7769,0.36],[0.7586,0.3737],[0.7492,0.3836],[0.7414,0.3961],[0.7388,0.411],[0.7417,0.4256],[0.7473,0.4436],[0.7547,0.4584],[0.7548,0.4675],[0.7627,0.4919],[0.7622,0.506],[0.7614,0.5142],[0.7573,0.527],[0.7523,0.5296],[0.7441,0.5271],[0.7415,0.5179],[0.7351,0.5131],[0.7263,0.495],[0.7186,0.4789],[0.7161,0.4707],[0.7195,0.4568],[0.7148,0.4452],[0.7018,0.4277],[0.6953,0.4245],[0.6785,0.434],[0.6755,0.4329],[0.6675,0.4231],[0.657,0.4179],[0.6382,0.4206],[0.6234,0.4183],[0.6107,0.4197],[0.6038,0.423],[0.6068,0.4286],[0.6065,0.4371],[0.6101,0.4412],[0.6069,0.444],[0.6007,0.4409],[0.5945,0.4449],[0.5824,0.4442],[0.5699,0.4331],[0.5554,0.4357],[0.5433,0.4309],[0.5329,0.4324],[0.5189,0.4373],[0.5038,0.4528],[0.4872,0.4619],[0.4781,0.4719],[0.4743,0.4814],[0.4741,0.4958],[0.4749,0.5059],[0.4781,0.5131],[0.4716,0.5137],[0.4598,0.5091],[0.4468,0.5026],[0.4421,0.4927],[0.4385,0.478],[0.4286,0.466],[0.4229,0.4537],[0.4145,0.4393],[0.4028,0.431],[0.3892,0.4314],[0.3787,0.448],[0.3648,0.4417],[0.3562,0.4353],[0.3521,0.4238],[0.3466,0.4128],[0.3367,0.4036],[0.3281,0.3969],[0.3221,0.3895],[0.2932,0.3895],[0.2932,0.3982],[0.28,0.3982],[0.2468,0.3983],[0.2088,0.3835],[0.1837,0.3733],[0.1852,0.3692],[0.1641,0.3715],[0.1452,0.3731],[0.1424,0.3624],[0.1316,0.3503],[0.1238,0.3478],[0.122,0.3418],[0.1126,0.3407],[0.1067,0.335],[0.0912,0.333],[0.0869,0.3296],[0.0849,0.3181],[0.0687,0.297],[0.0549,0.2678],[0.0555,0.2629],[0.0481,0.256],[0.0352,0.2384],[0.0329,0.2213],[0.024,0.2098],[0.0277,0.1924],[0.0271,0.1744],[0.0218,0.1583],[0.0283,0.1385],[0.0303,0.1195],[0.0324,0.1004],[0.0294,0.0722],[0.0241,0.0543],[0.0192,0.0445],[0.0212,0.0404],[0.0453,0.0476],[0.0542,0.0674],[0.0583,0.0618],[0.0557,0.0446]],"lagos":[[[0.6337,0.1828],[0.6387,0.1807],[0.6504,0.1786],[0.6587,0.166],[0.6603,0.1492],[0.6554,0.1324],[0.6603,0.1135],[0.6703,0.1072],[0.6803,0.0946],[0.672,0.0883],[0.6537,0.0925],[0.647,0.103],[0.637,0.1135],[0.632,0.1324],[0.6354,0.1471],[0.632,0.1639]],[[0.5621,0.0757],[0.5804,0.0715],[0.597,0.0778],[0.622,0.0694],[0.637,0.0799],[0.6637,0.0757],[0.687,0.0799],[0.6837,0.0631],[0.667,0.0505],[0.6554,0.0337],[0.6254,0.0295],[0.607,0.0463],[0.5837,0.0568]],[[0.687,0.0925],[0.7053,0.0904],[0.7303,0.0883],[0.747,0.0925],[0.757,0.103],[0.7636,0.1198],[0.7436,0.1135],[0.7353,0.1261],[0.7353,0.1471],[0.7236,0.1534],[0.7203,0.1387],[0.707,0.1324],[0.7087,0.1156],[0.6987,0.0988]],[[0.7053,0.1807],[0.7187,0.1849],[0.7353,0.1849],[0.7553,0.1744],[0.7803,0.1618],[0.772,0.1555],[0.7486,0.1618],[0.722,0.1744],[0.712,0.1744]],[[0.767,0.1492],[0.7886,0.145],[0.8136,0.1471],[0.8269,0.1408],[0.8236,0.1303],[0.8053,0.1324],[0.7736,0.1387]]],"ciudades":[["Memphis","Memphis",0.5962,0.3182],["Chicago","Chicago",0.6365,0.1769],["Dallas","Dallas",0.4838,0.368],["Atlanta","Atlanta",0.6905,0.3476],["Houston","Houston",0.5076,0.4314],["Kansas City","Kansas City",0.5208,0.2353],["Detroit","Detroit",0.7128,0.1674],["Nueva Orleans","New Orleans",0.5959,0.4274],["Denver","Denver",0.3473,0.2218],["Nueva York","New York",0.8636,0.2015],["Los Ángeles","Los Angeles",0.1266,0.3413],["Miami","Miami",0.7605,0.5154],["Seattle","Seattle",0.0585,0.0566],["Filadelfia","Philadelphia",0.8441,0.2174],["Phoenix","Phoenix",0.2294,0.3539],["San Francisco","San Francisco",0.057,0.2632],["Boston","Boston",0.9125,0.1668],["Washington","Washington",0.8129,0.2393],["Minneapolis","Minneapolis",0.5426,0.1118],["San Luis","St. Louis",0.5937,0.2451],["San Diego","San Diego",0.1446,0.3692],["Tampa","Tampa",0.7226,0.4694],["Baltimore","Baltimore",0.8201,0.2313],["Orlando","Orlando",0.7406,0.457],["Charlotte","Charlotte",0.7496,0.3165],["San Antonio","San Antonio",0.4556,0.4385],["Portland","Portland",0.0527,0.1005],["Pittsburgh","Pittsburgh",0.7638,0.2071],["Las Vegas","Las Vegas",0.1783,0.2968],["Cincinnati","Cincinnati",0.6885,0.2353],["Sacramento","Sacramento",0.0725,0.2462],["Cleveland","Cleveland",0.7355,0.1849],["Columbus","Columbus",0.7138,0.2172],["Indianápolis","Indianapolis",0.661,0.2212],["Nashville","Nashville",0.6507,0.297],["Salt Lake City","Salt Lake City",0.2324,0.2004],["Austin","Austin",0.4681,0.4207],["Oklahoma City","Oklahoma City",0.4718,0.3115],["Louisville","Louisville",0.6677,0.2531],["Milwaukee","Milwaukee",0.6319,0.1525],["Raleigh","Raleigh",0.7863,0.305],["Jacksonville","Jacksonville",0.736,0.4194],["Albuquerque","Albuquerque",0.3197,0.3197],["Omaha","Omaha",0.4981,0.1899],["El Paso","El Paso",0.3224,0.3894],["Tulsa","Tulsa",0.4973,0.2972],["Birmingham","Birmingham",0.6504,0.3524],["Boise","Boise",0.1606,0.1404],["Little Rock","Little Rock",0.5589,0.3266],["Buffalo","Buffalo",0.7823,0.1557],["Billings","Billings",0.2889,0.095]]};
const fxPos=()=>FXMAP.ciudades.map(c=>[c[2],c[3]]),fxNom=i=>{const c=FXMAP.ciudades[i];return c?[c[0],c[1]]:null};
const fxClamp=(v,a,b,d)=>{v=Math.round(+v);return isFinite(v)?Math.max(a,Math.min(b,v)):d};
const fxConD=n=>n*(n-1)/2,fxConH=n=>n-1;
function fxCarga(P,C,cap){/* P paquetes parejos en C conexiones: unas llevan ⌊P/C⌋ y otras uno más; un avión por conexión (más si no cabe) */
 const b=Math.floor(P/C),x=P-b*C,grupos=[[C-x,b],[x,b+1]].filter(g=>g[0]>0);let av=0,vac=0,med=0,lle=0,sin=0;
 for(const[k,q]of grupos){const a=Math.max(1,Math.ceil(q/cap)),f=q/(a*cap);av+=k*a;if(q===0)sin+=k;if(f<FX.VACIO)vac+=k*a;else if(f>=FX.LLENO)lle+=k*a;else med+=k*a}
 return{av,vac,med,lle,sin,occ:P/(av*cap),b,x}}
const FXDES={};
function fxDesvio(n){if(FXDES[n]!==undefined)return FXDES[n];const p=fxPos(),d=(a,b)=>Math.hypot(p[a][0]-p[b][0],p[a][1]-p[b][1]);let dir=0,cen=0;
 for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){dir+=d(i,j);cen+=(i===0||j===0)?d(i,j):d(i,0)+d(0,j)}return FXDES[n]=cen/dir-1}
function fedex(o){const n=fxClamp(o.n,FX.NMIN,FX.NMAX,FX.N0),P=fxClamp(o.P,FX.PMIN,FX.PMAX,FX.P0),cap=fxClamp(o.cap,FX.CMIN,FX.CMAX,FX.CAP0),cen=o.pol==="centro";
 const CD=fxConD(n),CH=fxConH(n),C=cen?CH:CD,qD=P/CD,qH=P/CH,q=cen?qH:qD,aD=fxCarga(P,CD,cap),aH=fxCarga(P,CH,cap),a=cen?aH:aD;
 const des=fxDesvio(n),pares=fxConD(n),porPar=P/pares,pos=fxPos().slice(0,n),nombres=FXMAP.ciudades.slice(0,n).map(c=>[c[0],c[1]]),sig=fxNom(n);
 return{n,P,cap,pol:cen?"centro":"directo",cen,C,CD,CH,q,qD,qH,veces:CD/CH,nuevasD:n,nuevasH:1,llegoD:n-1,llegoH:1,a,aD,aH,des:cen?des:0,desC:des,pares,porPar,porCiudad:P/n,pos,nombres,sig,
  E:{av:FX.AV0,P:FX.P0,n:FX.N0,anio:FX.AN0,hub:FX.HUB,CD:fxConD(FX.N0),CH:fxConH(FX.N0),q:FX.P0/fxConH(FX.N0),nuevas:fxConD(FX.N0+1)-fxConD(FX.N0)},
  ref:CH,you:C,score:score(CH,C),valid:true}}
/* ---------- CROSSDOCK · una sola compra, tres furgones (reel 21). Guion aprobado y tabla de cifras del encargo R021:
   El largo de una ruta por n paradas repartidas al azar en un área A crece con √(n·A) (Beardwood, Halton y Hammersley 1959:
   L ≈ k·√(n·A), k ≈ 0,7124 asintótico y ≈ 0,765 en rutas reales; Daganzo 1984, aproximación de continuo, como respaldo).
   Juntar en una ruta las paradas de k orígenes: k·√(m·A) contra √(k·m·A) → por parada baja 1 − 1/√k (con 3: 42,3 %, cálculo propio;
   el área y la constante se cancelan). Londres: McLeod et al. 2020 (Transportation Research Record 2674(8):384–393), cinco empresas
   de paquetería en 3,7 km² del centro pasarían de 33 a 13 furgones (modelación con datos reales). 100 USD por ruta: EJEMPLO.
   El laboratorio MIDE: paradas al azar con semilla en un barrio de ejemplo de 2 × 2 km y cada ruta como una vuelta cerrada por sus
   paradas, calculada con vecino más cercano + 2-opt (vNN y v2opt del reel 10). Como en la fórmula, sin la ida desde la bodega ni la vuelta.
   Barrio por defecto: la semilla 20, la que más se acerca al promedio de las 21 (0–20) con 3 × 6 paradas: 44,7 % contra 44,8 % (rango 38,2–51,6 %). ---------- */
const CD={KMIN:1,KMAX:5,K0:3,MMIN:5,MMAX:40,M0:6,SMIN:0,SMAX:20,S0:20,LADO:2,AREA:4,KA:0.7124,KP:0.765,A0:33,D0:13,USD0:100,FMIN:1,FMAX:100,UMIN:10,UMAX:500,APUESTAS:["10","25","42","60"]};
const cdClamp=(v,a,b,d)=>{v=Math.round(+v);return isFinite(v)?Math.max(a,Math.min(b,v)):d};
/* las paradas de cada origen salen de su propia serie: sumar paradas o sumar un origen no mueve las que ya estaban */
function cdPts(i,m,seed){const r=rngFrom(seed*1000003+i*7919+11),p=[];for(let j=0;j<m;j++)p.push([0.04+0.92*r(),0.06+0.9*r()]);return p}
/* una ruta cerrada por las paradas (la vuelta completa, como en la fórmula): vecino más cercano + 2-opt; devuelve el orden y los km */
function cdRuta(pts){const q=pts,o=v2opt(q,vNN(q));let s=0;for(let i=0;i<o.length;i++){const a=q[o[i]],b=q[o[(i+1)%o.length]];s+=Math.hypot(a[0]-b[0],a[1]-b[1])}return{q,o,km:s*CD.LADO}}
const CDC={};
function cdBase(k,m,seed){const key=k+"|"+m+"|"+seed;if(CDC[key])return CDC[key];
 const por=[];for(let i=0;i<k;i++)por.push(cdPts(i,m,seed));const sep=por.map(cdRuta),todas=[].concat(...por),org=[].concat(...por.map((p,i)=>p.map(()=>i))),junta=cdRuta(todas);
 return CDC[key]={por,sep,todas,org,junta}}
function crossdock(o){const k=cdClamp(o.k,CD.KMIN,CD.KMAX,CD.K0),m=cdClamp(o.m,CD.MMIN,CD.MMAX,CD.M0),seed=cdClamp(o.seed,CD.SMIN,CD.SMAX,CD.S0);
 const A=cdClamp(o.A,CD.FMIN,CD.FMAX,CD.A0),D=Math.min(A,cdClamp(o.D,CD.FMIN,CD.FMAX,CD.D0)),usd=cdClamp(o.usd,CD.UMIN,CD.UMAX,CD.USD0);
 const b=cdBase(k,m,seed),n=k*m,kmA=b.sep.reduce((s,r)=>s+r.km,0),kmC=k===1?kmA:b.junta.km;/* con 1 origen las dos son la misma ruta */
 const ppA=kmA/n,ppC=kmC/n,red=1-kmC/kmA,form=1-1/Math.sqrt(k);
 const bhA=k*CD.KP*Math.sqrt(m*CD.AREA),bhC=CD.KP*Math.sqrt(n*CD.AREA);
 const g=CD.APUESTAS.includes(String(o.pol))?String(o.pol):"",gv=g?+g:null,pm=red*100;
 const cerca=CD.APUESTAS.map(Number).reduce((a,x)=>Math.abs(x-pm)<Math.abs(a-pm)?x:a,10);
 const score=g?(gv===cerca?100:Math.max(0,Math.min(95,100-2*Math.abs(gv-pm)))):0;
 const menos=A-D;
 return{k,m,seed,n,A,D,usd,kmA,kmC,ppA,ppC,red,form,dif:Math.abs(red-form),bhA,bhC,bhRed:1-bhC/bhA,
  rutas:b.sep.map((r,i)=>({q:r.q,o:r.o,km:r.km,i})),junta:k===1?{q:b.sep[0].q,o:b.sep[0].o,km:kmC}:{q:b.junta.q,o:b.junta.o,km:kmC},org:b.org,
  menos,ahorro:menos*usd,pol:g,apuesta:gv,cerca,score,valid:!!g,
  E:{k:3,form3:1-1/Math.sqrt(3),A:CD.A0,D:CD.D0,usd:CD.USD0,ahorro:(CD.A0-CD.D0)*CD.USD0,empresas:5,km2:3.7}}}
return{crossdock,CD,cdPts,cdRuta,fedex,FX,FXMAP,fxNom,fxPos,fxCarga,fxDesvio,fxConD,fxConH,inventario,invAnio,INV,iRint,gps,gpsEstudio,GPSD,gPts,aire,aKg,AI,locker,LK,lkInterp,co2,C2,ordenar,oGrupos,VCAP,bodegas,vecino,vPts,vLen,vNN,v2opt,vCruces,cadena,quedatelo,fTheory,fJsq,fHours,rngFrom,score,citas,bDay,bStats,bailey,fGen,fSim,erlangC,fPolicies,fila,okDay,fmaxOf,pPass,nivel,nMonth,amazon,aCurve,IP,ikea,iBatch,ups};
})();
/* </core> */
if(typeof module!=="undefined")module.exports=EC;
