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
return{cadena,quedatelo,fTheory,fJsq,fHours,rngFrom,score,citas,bDay,bStats,bailey,fGen,fSim,erlangC,fPolicies,fila,okDay,fmaxOf,pPass,nivel,nMonth,amazon,aCurve,IP,ikea,iBatch,ups};
})();
/* </core> */
if(typeof module!=="undefined")module.exports=EC;
