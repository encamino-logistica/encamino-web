/* =====================================================================
   LIVE SCENES · each one runs forever and reacts instantly
   S.apply(st,kind) kind: "reset" (new episode) · "live" (keep running)
   S.tick(dt,speed) advances the simulation; speed > 1 = fast-forward
   ===================================================================== */

/* ---------------- HERO (home) ---------------- */
function sceneHero(){const W=26,D=19;const{scene,g}=diorama(W,D,P.grass);
 flat(g,W-2,D-2,P.asphalt2,0,0.006,0.4);const loop=[[-9.5,6.4],[9.5,6.4],[9.5,-1.2],[-9.5,-1.2]];
 for(let i=0;i<4;i++){const a=loop[i],b=loop[(i+1)%4];if(a[1]===b[1])roadX(g,a[0]-1.4,b[0]+1.4,a[1],2.6);else roadZ(g,a[1]+1.4,b[1]-1.4,a[0],2.6)}
 rb(g,12,4.2,5.4,P.wall,0,0,-5.6,0.4);rb(g,12.4,0.38,5.8,P.roof,0,4.2,-5.6,0.2);rb(g,12.42,0.16,5.82,P.yellow,0,4.06,-5.6,0.05);rb(g,12.02,0.5,5.42,P.wallDark,0,0,-5.6);
 [-3,0,3].forEach(x=>{rb(g,2.2,2.7,0.2,P.dark,x,0.2,-2.86);rb(g,2.0,1.3,0.12,P.door,x,1.65,-2.74)});
 for(let i=0;i<3;i++)for(let j=0;j<2;j++)rb(g,0.9,0.7,0.9,P.carton,5.2+i*1.0,j*0.72,1.8,0.1);rb(g,1.0,0.7,0.9,P.carton,5.7,1.44,1.8,0.1);
 [[-11.5,-7],[-11.6,-3.2],[11.4,-7.5],[11.6,-2.8],[-11.4,8.6],[-6,8.7],[0,8.8],[6,8.6],[11.3,8.5],[-7.6,-7.8]].forEach((p,i)=>tree(g,p[0],p[1],0.85+(i%3)*0.15));
 const wk=person(g,P.yellow,-4.6,2.1,0.6);const wk2=person(g,P.sky,4.6,0.4,-0.8);const cl=[cloud(g,-6,9.5,-4,1),cloud(g,7,10.5,2,0.8)];
 const F=new Fleet(g,3,0.9);const per=2*(19+7.6);
 const at=(d)=>{d=((d%per)+per)%per;const segs=[19,7.6,19,7.6];let i=0;while(d>segs[i]){d-=segs[i];i++}const a=loop[i],b=loop[(i+1)%4];const t=d/segs[i];return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,Math.atan2(-(b[1]-a[1]),b[0]-a[0])]};
 const S=mkS(scene,new THREE.Box3(new THREE.Vector3(-W/2,0,-D/2),new THREE.Vector3(W/2,6,D/2)),{root:g,az:0.62,azP:0.62,el:0.62});let t=0;
 S.tick=(dt)=>{t+=dt;for(let i=0;i<3;i++){const p=at(t*4.2+i*per/3);F.go(i,p[0],p[1],p[2],true);F.snap(i)}F.commit();wk.position.y=Math.abs(Math.sin(t*4))*0.12;wk2.rotation.y=-0.8+Math.sin(t*1.3)*0.4;cl[0].position.x=-6+Math.sin(t*0.2)*1.5;cl[1].position.x=7+Math.sin(t*0.25+1)*1.5;return true};
 S.apply=()=>{};S.prewarm=()=>S.tick(0.016);return S}

/* ---------------- BAILEY · the day plays on a loop ---------------- */
function sceneBailey(st){const c=st.c,N=st.N;const BW=Math.max(c*3.2+3,14);const need=Math.max(0,N-Math.min(c,N));const X0=Math.max(BW/2+1.5,(Math.ceil(need/2)*1.55+3)/2,12.5);const W=2*X0+4,D=29;
 const{scene,g}=diorama(W,D,P.asphalt);const bz=-D/2+4.6,fz=bz+3.5,R1=fz+6.1,R2=fz+10.1,RZ=fz+13.9;
 flat(g,W-0.6,D/2-RZ-1.0+1.6,P.grass,0,0.008,(RZ+1.6+D/2)/2);flat(g,W-0.6,bz-3.5+D/2-0.6,P.grass,0,0.008,(-D/2+bz-3.5)/2+0.3);
 roadX(g,-W/2+0.4,W/2-0.4,RZ,3.1);
 rb(g,BW,4.6,7,P.wall,0,0,bz,0.45);rb(g,BW+0.4,0.4,7.4,P.roof,0,4.6,bz,0.2);rb(g,BW+0.42,0.16,7.42,P.yellow,0,4.42,bz,0.05);rb(g,BW+0.02,0.55,7.02,P.wallDark,0,0,bz,0.1);
 for(let i=0;i<Math.floor(BW/4);i++)rb(g,1.6,0.25,1.2,P.sky,(i-(Math.floor(BW/4)-1)/2)*3.6,5.0,bz-1,0.1,{op:0.75});
 const doors=[],lights=[],xs=[],workers=[];
 for(let k=0;k<c;k++){const x=(k-(c-1)/2)*3.2;xs.push(x);rb(g,2.5,3.1,0.2,P.dark,x,0.25,fz+0.02,0.08);doors.push(rb(g,2.3,2.9,0.14,P.door,x,0.3,fz+0.16,0.06));
  lights.push(put(g,GEO().ball,mat(P.mint,{basic:true}),x,3.75,fz+0.2,false));lights[k].scale.setScalar(0.34);
  rb(g,0.3,0.4,0.25,P.dark,x-0.9,0.5,fz+0.2,0.05);rb(g,0.3,0.4,0.25,P.dark,x+0.9,0.5,fz+0.2,0.05);
  flat(g,0.12,4.0,P.line,x-1.6,0.02,fz+2.2);if(k===c-1)flat(g,0.12,4.0,P.line,x+1.6,0.02,fz+2.2);
  workers.push(person(g,k%2?P.sky:P.yellow,x+1.55,fz+0.7,0.4))}
 const per=Math.max(1,Math.floor((2*X0-3)/1.55));{const pts=[];[R1,R2].forEach(z=>{for(let q=0;q<=per;q++)pts.push([-X0+0.8+q*1.55,z])});dashes(g,pts,0.08,3.4)}
 rb(g,1.4,1.5,1.4,P.white,-W/2+2,0,RZ-2.6,0.2);rb(g,1.7,0.2,1.7,P.yellow,-W/2+2,1.5,RZ-2.6,0.06);
 for(let x=-W/2+1.5;x<W/2-1;x+=3.4)tree(g,x,D/2-1.4,0.8+((Math.abs(x)*13|0)%3)*0.08);
 tree(g,-W/2+1.4,-D/2+1.4,1.1);tree(g,W/2-1.4,-D/2+1.6,1.0);
 const F=new Fleet(g,N,1);
 const slot=j=>{const r=Math.floor(j/per),q=j%per;if(r<2)return[-X0+1.575+q*1.55,r?R2:R1,Math.PI/2];return[-W/2+2+(j-2*per)*4.2,RZ+0.75,0]};
 const S=mkS(scene,new THREE.Box3(new THREE.Vector3(-W/2,0,-D/2),new THREE.Vector3(W/2,5.4,D/2)),{root:g,az:0.66,azP:0.3,el:0.66,anchor:{x:0,y:6.4,z:bz}});
 let cur=Object.assign({},st),day=null,Tm=0,T0=0,T1=1,hold=0,seed=1;const SPEED=9;
 function newDay(){seed++;day=EC.bDay(cur.rule,N,c,cur.s,cur.d,EC.rngFrom(seed*7919),cur.g,cur.I);T0=Math.min(0,...day.tr.map(q=>q.arr))-3;T1=day.fin+4;Tm=T0;hold=0;for(let i=0;i<N;i++)F.hide(i)}
 function at(tm,dt){S.tm=tm;const wait=[];const busy=new Array(c).fill(false);let maxW=0;
  day.tr.forEach((q,i)=>{if(tm>=q.arr&&tm<q.st){wait.push(i);maxW=Math.max(maxW,tm-q.arr)}if(tm>=q.st&&tm<q.end)busy[q.d]=true});
  wait.sort((a,b)=>day.tr[a].arr-day.tr[b].arr||a-b);const rank={};wait.forEach((i,j)=>rank[i]=j);
  day.tr.forEach((q,i)=>{if(tm<q.arr){F.hide(i);return}if(!F.on[i]&&tm<q.end)F.spawn(i,-W/2+1.2,RZ+0.75,0);F.vib[i]=0;
   if(tm<q.st){const s=slot(rank[i]);F.go(i,s[0],s[1],s[2]);const w=tm-q.arr;F.col[i]=waitCol(w);F.vib[i]=w>45?1:0}
   else if(tm<q.end){F.go(i,xs[q.d],fz+2.05,-Math.PI/2,true);F.col[i]=P.mint}
   else{F.col[i]=P.mint;if(F.on[i]){F.go(i,W/2-1.2,RZ-0.75,0);if(F.cx[i]>W/2-3.5)F.leave(i)}}});
  const a=1-Math.exp(-8*dt);doors.forEach((d,k)=>{const ty=busy[k]?0.3+1.45+2.9/2:0.3+2.9/2;d.position.y+=(ty-d.position.y)*a;lights[k].material=mat(busy[k]?P.yellow:P.mint,{basic:true});workers[k].position.y=busy[k]?Math.abs(Math.sin(F.time*7+k))*0.1:0});
  F.step(dt,9);S.clock=clock(tm);
  if(tm<0.5)S.cap=T(`7:00: abren ${B_(c+" andenes")} y llegan ${B_(N+" camiones")}.`,`7:00: ${B_(c+" docks")} open and ${B_(N+" trucks")} arrive.`);
  else if(tm>day.fin)S.cap=T(`Listo: la última carga terminó a las ${B_(clock(day.fin))}.`,`Done: the last load finished at ${B_(clock(day.fin))}.`);
  if(tm>=day.fin){const ws=day.tr.map(q=>q.st-q.arr);S.obs=()=>({v:nf(ws.reduce((a,b)=>a+b,0)/ws.length,1)+" min",l:T("este día","this day")})}
  else if(wait.length)S.cap=T(`${B_(wait.length+(wait.length===1?" camión esperando":" camiones esperando"))} · el que más lleva ${B_(nf(maxW)+" min")}`,`${B_(wait.length+(wait.length===1?" truck waiting":" trucks waiting"))} · the longest has waited ${B_(nf(maxW)+" min")}`);
  else S.cap=T("Nadie espera: cada camión entra directo a un andén.","Nobody waits: every truck goes straight to a dock.");return true}
 S.fleet=F;S.info=i=>{const q=day&&day.tr[i];if(!q)return null;const tm=S.tm;if(tm<q.st)return T(`Esperando hace <b>${nf(tm-q.arr)} min</b>`,`Waiting for <b>${nf(tm-q.arr)} min</b>`);if(tm<q.end)return T(`Cargando en el andén ${q.d+1} · esperó ${nf(q.st-q.arr)} min`,`Loading at dock ${q.d+1} · waited ${nf(q.st-q.arr)} min`);return T(`Listo · esperó ${nf(q.st-q.arr)} min`,`Done · waited ${nf(q.st-q.arr)} min`)};
 S.apply=(st2,kind)=>{cur=Object.assign({},st2);if(kind!=="live"||!day)newDay()};
 S.prewarm=()=>{if(!day)newDay();Tm=T0+3+cur.s*0.9;for(let k=0;k<5;k++)at(Tm,10);for(let i=0;i<N;i++)if(F.on[i])F.snap(i);F.commit()};
 S.startRun=()=>{newDay();Tm=T0;S.done=false;S.obs=null};S.progress=()=>day?(Tm-T0)/(T1-T0):0;
 S.tick=(dt,sp)=>{if(!day)newDay();Tm+=dt*SPEED*sp*Math.max(1,(T1-T0)/150);if(Tm>=T1){Tm=T1;S.done=true}return at(Tm,dt)};
 S.ff=st2=>{cur=Object.assign({},st2);newDay();Tm=T0};
 return S}

/* ---------------- FILA · one yard that reshapes itself ---------------- */
function sceneFila(st){const c=st.c,MAXQ=5,LW=3.5,TL=0.92,SP=3.5;const W=Math.max(c*LW+5,13),D=MAXQ*SP+12.5,zD=D/2-4.6;const zMid=zD-3.4-((MAXQ-1)*SP)/2;
 const{scene,g}=diorama(W,D,P.asphalt);g.position.z=0;const lane=k=>(k-(c-1)/2)*LW;
 flat(g,W-0.6,3.2,P.grass,0,0.008,D/2-1.8);for(let x=-W/2+1.4;x<W/2-1;x+=3.0)tree(g,x,D/2-1.6,0.75);
 /* entry arrow at the far end and lawns along the sides */const side=(W-c*LW)/2-0.6;if(side>0.8){[-1,1].forEach(sg=>{flat(g,side,D-5,P.grass,sg*(W/2-0.3-side/2),0.008,-1.5);for(let z=-D/2+2;z<D/2-6;z+=4.2)tree(g,sg*(W/2-0.3-side/2),z,0.7)})}
 rb(g,1.2,0.05,2.4,P.line,0,0,-D/2+2.2,0.1);
 /* low dock building at the front (bottom of the phone screen): doors face up the yard */
 const bz=zD+1.5;rb(g,c*LW+1.4,2.2,2.6,P.wall,0,0,bz,0.3);rb(g,c*LW+1.7,0.28,2.9,P.roof,0,2.2,bz,0.12);rb(g,c*LW+1.72,0.12,2.92,P.yellow,0,2.1,bz,0.04);
 const doors=[],lights=[],workers=[],tags=[];
 for(let k=0;k<c;k++){const x=lane(k);rb(g,2.2,1.9,0.16,P.dark,x,0.2,bz-1.32,0.06);doors.push(rb(g,2.0,1.75,0.12,P.door,x,0.25,bz-1.42,0.05));const l=put(g,GEO().ball,mat(P.mint,{basic:true}),x,2.6,bz-1.4,false);l.scale.setScalar(0.32);lights.push(l);workers.push(person(g,k%2?P.sky:P.coral,x+1.3,bz-1.9,Math.PI))}
 /* fences: posts + a yellow bar; inner ones slide away when the yard becomes a single queue */
 const fenceLen=MAXQ*SP+1.4,fz0=zD-2.6;const fences=[];
 for(let k=0;k<=c;k++){const f=new THREE.Group();for(let z=0;z<=fenceLen;z+=1.6)put(f,GEO().post,mat(P.dark),0,0.45,-z).scale.y=0.9;rb(f,0.12,0.14,fenceLen,P.yellow,0,0.62,-fenceLen/2,0.04);rb(f,0.12,0.1,fenceLen,P.dark,0,0.35,-fenceLen/2,0.03);f.position.set((k-c/2)*LW,0,fz0);g.add(f);fences.push({g:f,x:(k-c/2)*LW})}
 const NMAX=c*(MAXQ+1)+c+12;const F=new Fleet(g,NMAX,TL);
 const S=mkS(scene,new THREE.Box3(new THREE.Vector3(-W/2,0,-D/2),new THREE.Vector3(W/2,3,D/2)),{root:g,long:"z",az:0.62,azP:0.28,el:0.74,anchor:{x:0,y:3.6,z:bz+0.6}});
 let cur=Object.assign({},st),rng=EC.rngFrom(4242),t=0,nextA=0,trucks=[],q=[],pool=[],busy=new Array(c).fill(-1),free=[];for(let i=NMAX-1;i>=0;i--)free.push(i);
 for(let k=0;k<c;k++)q.push([]);
 const pol=()=>cur.pol==="pool"||cur.pol==="jsq"?cur.pol:"asig";
 const expo=m=>-Math.log(1-rng())*m;
 function svc(){const cv=cur.cv/10;if(cv>=0.999)return expo(cur.S);const k=1/(cv*cv);let s=0;for(let i=0;i<3;i++)s+=expo(1);return Math.max(0.2*cur.S,cur.S*(1+(s/3-1)*cv*1.7))}
 function assign(tr){const p=pol();if(p==="pool")pool.push(tr);else if(p==="asig"){tr.lane=Math.floor(rng()*c);q[tr.lane].push(tr)}else{let b=0,bn=1e9;for(let k=0;k<c;k++){const n=q[k].length+(busy[k]!==-1?1:0);if(n<bn){bn=n;b=k}}tr.lane=b;q[b].push(tr)}}
 function step(h){t+=h;const lam=cur.lam;while(nextA<=t){const tr={a:nextA,s:svc(),st:-1,slot:-1,lane:-1,out:false};trucks.push(tr);assign(tr);nextA+=expo(60/Math.max(0.2,lam))}
  for(let k=0;k<c;k++){const b=busy[k];if(b&&b.e<=t){b.out=true;b.leftAt=t;busy[k]=-1}if(busy[k]===-1){const nx=pol()==="pool"?pool.shift():q[k].shift();if(nx){nx.st=t;nx.e=t+nx.s;nx.door=k;busy[k]=nx;if(S.simT>0){OBS.n++;OBS.w+=t-nx.a}}}}
  if(pool.length+q.reduce((a,b)=>a+b.length,0)>500){pool.length=Math.min(pool.length,500)}}
 function relayout(){const all=pool.concat(...q).sort((a,b)=>a.a-b.a);pool=[];q=q.map(()=>[]);all.forEach(assign)}
 function draw(dt){const p=pol();const shown=new Set();let idleQ=-1,maxw=0;
  const place=(tr,x,z,r,fix,col,vib)=>{if(tr.slot<0){if(!free.length)return;tr.slot=free.pop();F.spawn(tr.slot,x,-D/2+1.5,-Math.PI/2)}BYSLOT[tr.slot]=tr;F.go(tr.slot,x,z,r,fix);F.col[tr.slot]=col;F.vib[tr.slot]=vib?1:0;shown.add(tr.slot)};
  const queueZ=j=>zD-3.4-j*SP;
  if(p==="pool"){pool.forEach((tr,j)=>{const w=t-tr.a;maxw=Math.max(maxw,w);if(j<MAXQ)place(tr,0,queueZ(j),-Math.PI/2,false,waitCol(w),w>45)})}
  else q.forEach((ar,k)=>ar.forEach((tr,j)=>{const w=t-tr.a;maxw=Math.max(maxw,w);if(j<MAXQ)place(tr,lane(k),queueZ(j),-Math.PI/2,false,waitCol(w),w>45)}));
  busy.forEach((tr,k)=>{if(tr!==-1)place(tr,lane(k),zD-0.6,Math.PI/2,true,P.mint,false)});
  /* trucks that finished: drive to the side, fade out, and only then give the slot back (go() would revive a fading truck, so never call it once it is leaving) */
  trucks.forEach(tr=>{if(tr.out&&tr.slot>=0){const i=tr.slot;if(!F.on[i]){free.push(i);tr.slot=-2;return}if(t-tr.leftAt>20){F.hide(i);free.push(i);tr.slot=-2;return}/* long gone (fast-forward): give the slot back at once */if(F.ts[i]===0)return;const side=tr.door<c/2?-1:1;F.go(i,side*(W/2-1),zD-1.6,0);F.col[i]=P.mint;shown.add(i);if(Math.abs(F.cx[i])>W/2-2.2||t-tr.leftAt>6)F.leave(i)}});
  trucks.forEach(tr=>{if(tr.slot>=0&&!shown.has(tr.slot)&&!tr.out){F.leave(tr.slot);if(!F.on[tr.slot]){free.push(tr.slot);tr.slot=-1}}});
  trucks=trucks.filter(tr=>!(tr.out&&tr.slot===-2)&&!(tr.out&&tr.slot===-1));
  const anyQ=p==="pool"?pool.length>0:q.some(a=>a.length>0);const a=1-Math.exp(-8*dt);
  doors.forEach((d,k)=>{const b=busy[k]!==-1;d.position.y+=((b?0.25+1.35+0.875:0.25+0.875)-d.position.y)*a;const empty=!b&&anyQ&&p!=="pool";if(empty)idleQ=k;lights[k].material=mat(b?P.yellow:empty?P.green:P.mint,{basic:true});lights[k].scale.setScalar(empty?0.32+Math.abs(Math.sin(F.time*6))*0.18:0.32);workers[k].position.y=b?Math.abs(Math.sin(F.time*7+k))*0.1:0});
  const fa=1-Math.exp(-6*dt);fences.forEach((f,k)=>{const inner=k>0&&k<c;const tx=p==="pool"?(inner?(k<c/2?-1.75:1.75):f.x):f.x;f.g.position.x+=(tx-f.g.position.x)*fa;const ts=p==="pool"&&inner?0.001:1;f.g.scale.y+=(ts-f.g.scale.y)*fa;f.g.visible=f.g.scale.y>0.02})
  ;F.step(dt,8);
  const nq=p==="pool"?pool.length:q.reduce((s,a)=>s+a.length,0);const over=p==="pool"?Math.max(0,pool.length-MAXQ):q.reduce((m,a)=>Math.max(m,a.length-MAXQ),0);
  S.labels=[];if(over>0)S.labels.push({x:0,y:1.6,z:queueZ(MAXQ)-0.8,html:`<span class="r">+${over} ${T("más en la calle","more in the street")}</span>`});if(idleQ>=0)S.labels.push({x:lane(idleQ),y:3.3,z:bz-1.4,html:`<span class="g">${T("VACÍA","EMPTY")}</span>`});
  const rho=cur.lam/(c*60/cur.S);S.clock=clock(t%720);
  S.cap=rho>=1?T(`${B_("¡Colapso!")} Llegan más camiones de los que las puertas pueden atender.`,`${B_("Collapse!")} More trucks arrive than the doors can serve.`):(idleQ>=0?T(`Una puerta ${B_("vacía")} mientras al lado esperan ${B_(nq+" camiones")}.`,`One door ${B_("empty")} while ${B_(nq+" trucks")} wait next to it.`):p==="pool"?T(`Una sola fila: ${B_("ninguna puerta queda libre")} si alguien espera.`,`One single queue: ${B_("no door sits free")} while someone waits.`):T(`${B_(nq+" camiones")} en fila · el que más lleva ${B_(nf(maxw)+" min")}`,`${B_(nq+" trucks")} in line · the longest has waited ${B_(nf(maxw)+" min")}`));
  return true}
 const BYSLOT={};S.fleet=F;S.dbg=()=>({trucks:trucks.length,free:free.length,pool:pool.length,q:q.map(a=>a.length),busy:busy.map(b=>b===-1?0:1),slots:trucks.map(t=>[t.slot,t.out?1:0,t.st>=0?1:0,F.on[t.slot]|0,+F.s[t.slot]?.toFixed(2)])});S.info=i=>{const tr=BYSLOT[i];if(!tr)return null;if(tr.out)return T(`Se va · esperó ${nf(tr.st-tr.a)} min`,`Leaving · waited ${nf(tr.st-tr.a)} min`);if(tr.st>=0)return T(`Descargando en la puerta ${tr.door+1} · esperó ${nf(tr.st-tr.a)} min`,`Unloading at door ${tr.door+1} · waited ${nf(tr.st-tr.a)} min`);return T(`En fila hace <b>${nf(t-tr.a)} min</b>`,`In line for <b>${nf(t-tr.a)} min</b>`)};
 S.apply=(st2,kind)=>{const prev=pol();cur=Object.assign({},st2);if(pol()!==prev)relayout()};
 S.prewarm=()=>{for(let i=0;i<480;i++)step(0.25);draw(10);for(let i=0;i<NMAX;i++)if(F.on[i])F.snap(i);F.commit()};
 const OBS={n:0,w:0};S.simT=0;S.startRun=()=>{S.simT=0;S.done=false;S.obs=null;OBS.n=0;OBS.w=0};S.progress=()=>S.simT/240;
 S.tick=(dt,sp)=>{let m=Math.min(dt*6*sp,240-S.simT);S.simT+=m;while(m>0){const h=Math.min(0.25,m);step(h);m-=h}if(S.simT>=240)S.done=true;return draw(dt)};
 S.ff=st2=>{S.apply(st2,"live")};
 return S}

/* ---------------- NIVEL · the month plays on a loop ---------------- */
function sceneNivel(st){const days=st.days,cols=6,rows=Math.ceil(days/cols);const W=36,D=27;const{scene,g}=diorama(W,D,P.grass);
 const RZ=2.2;roadX(g,-W/2+0.4,W/2-0.4,RZ,3.4);flat(g,W-0.8,1.0,P.line,0,0.01,RZ-2.25);flat(g,W-0.8,1.0,P.line,0,0.01,RZ+2.25);
 const houses=[],WALLS=[0xF1E8D6,0xFFD9B8,0xCFE0F5,0xF7E3A1,0xD8F0D5,0xF4CFCF],ROOFS=[P.terracotta,P.roof,0xB4544A,0x6F7FA8];const rng=EC.rngFrom(5);
 for(let side=0;side<2;side++)for(let j=0;j<6;j++){const x=-13.8+j*5.5+(side?1.6:0),z=side?RZ+6.2:RZ-6.2,face=side?-1:1;const h=1.9+rng()*0.7;const hg=new THREE.Group();hg.position.set(x,0,z);g.add(hg);
  rb(hg,3.0,h,2.7,WALLS[(j*2+side)%WALLS.length],0,0,0,0.25);const r=put(hg,GEO().pyr,mat(ROOFS[(j+side)%ROOFS.length],{flat:true}),0,h+0.7,0);r.scale.set(2.3,1.4,2.05);r.rotation.y=Math.PI/4;
  rb(hg,0.6,1.0,0.08,P.dark,0,0,face*1.38,0.05);rb(hg,0.55,0.45,0.06,P.yellow,-0.95,1.05,face*1.38,0.04,{basic:true});rb(hg,0.55,0.45,0.06,P.yellow,0.95,1.05,face*1.38,0.04,{basic:true});
  if(j%2)rb(hg,0.4,0.9,0.4,P.coral,0.8,h+0.4,-0.4,0.06);rb(hg,0.25,0.75,0.25,P.wood,1.65,0,face*1.9,0.04);rb(hg,0.45,0.32,0.32,P.coral,1.65,0.75,face*1.9,0.08);
  houses.push({x,z:z+face*0.2,top:h+2.5})}
 houses.sort((a,b)=>a.x-b.x);for(let j=0;j<7;j++){tree(g,-16.3+j*5.5,RZ-8.8+((j%2)*0.4),0.8);tree(g,-14.6+j*5.5,RZ+9.0,0.75)}
 const bz=-D/2+1.4;const tw=1.25,th=1.05;const BWd=cols*1.5+1.2,BH=rows*1.3+2.0;rb(g,0.3,BH+0.6,0.3,P.wood,-BWd/2+0.3,0,bz,0.06);rb(g,0.3,BH+0.6,0.3,P.wood,BWd/2-0.3,0,bz,0.06);
 rb(g,BWd,BH,0.35,P.wall,0,0.6,bz+0.2,0.2);rb(g,BWd,0.9,0.4,P.coral,0,0.6+BH-0.9,bz+0.22,0.15);const tiles=[];
 for(let d=0;d<days;d++){const r=Math.floor(d/cols),cc=d%cols;const m=rb(g,tw,th,0.22,P.white,(cc-(cols-1)/2)*1.5,0.6+BH-1.6-r*1.3-th,bz+0.48,0.12);tiles.push({m,ang:0,col:P.white,tc:P.white})}
 const F=new Fleet(g,1,0.9,{van:true,col:P.yellow});F.spawn(0,-17,RZ+0.8,0);F.snap(0);F.commit();
 const BANG=new Icons(g,"bang",12,1.4),CHK=new Icons(g,"check",12,1.0),Q=new Icons(g,"q",12,1.2);
 const S=mkS(scene,new THREE.Box3(new THREE.Vector3(-W/2,0,-D/2),new THREE.Vector3(W/2,3,D/2)),{root:g,az:0.55,azP:0.3,el:0.62,anchor:{x:0,y:0.6+BH+1.2,z:bz}});
 let cur=Object.assign({},st),month=null,ms=0,hold=0,seed=3,L=1;const dayDur=200;
 function newMonth(){seed++;const o=nArgs(cur);month=EC.nMonth(o,seed*104729);month.n=o.n;month.meta=o.meta;month.round=o.round;L=o.period==="mes"?days:o.period==="semana"?6:1;ms=0;hold=0;tiles.forEach(t=>{t.col=P.white;t.tc=P.white;t.ang=0;t.m.material=mat(P.white)})}
 function setTile(d,col){const t=tiles[d];if(t.tc!==col){t.tc=col;t.ang=0.0001}}
 function at(dt){const d=Math.min(days-1,Math.floor(ms/dayDur)),u=Math.min(1,(ms-d*dayDur)/dayDur),fin=ms>=days*dayDur;const D0=month[d];
  const vx=fin?17:-17+34*Math.min(1,u*1.08);F.go(0,vx,RZ+0.8,0,true);F.snap(0);F.commit();
  const hr=EC.rngFrom(1000+d+seed*31);const order=houses.map((h,i)=>[hr(),i]).sort((a,b)=>a[0]-b[0]).map(a=>a[1]);const nf_=Math.min(D0.f,houses.length),ne=Math.min(D0.e,houses.length-nf_);
  houses.forEach((h,i)=>{const k=order.indexOf(i);const passed=fin||vx>=h.x;const fail=k<nf_,ex=k>=nf_&&k<nf_+ne;BANG.set(i,h.x,h.top,h.z,passed&&fail&&!fin);Q.set(i,h.x,h.top,h.z,passed&&ex&&!fin);CHK.set(i,h.x,h.top-0.3,h.z,passed&&!fail&&!ex&&!fin&&vx-h.x<6)});
  const doneDays=fin?days:(u>=0.97?d+1:d);const evalUpto=L===1?doneDays:(fin?days:Math.floor(doneDays/L)*L);
  for(let k=0;k<days;k++)setTile(k,k<evalUpto?(month[k].ok?P.mint:P.red):(k<doneDays?0xE4DCC8:P.white));
  const a=dt*7;tiles.forEach(t=>{if(t.ang>0){t.ang=Math.min(Math.PI,t.ang+a);if(t.ang>Math.PI/2)t.col=t.tc;t.m.rotation.y=t.ang;if(t.ang>=Math.PI){t.ang=0;t.m.rotation.y=0}}t.m.material=mat(t.col)});
  const qq=S.cam.quaternion;BANG.step(dt,qq,ms/1000);CHK.step(dt,qq,ms/1000);Q.step(dt,qq,ms/1000);
  const red=month.slice(0,evalUpto).filter(x=>!x.ok).length;S.clock=T(`Día ${d+1} de ${days}`,`Day ${d+1} of ${days}`);
  if(fin){S.cap=T(`Mes terminado: ${B_(red+(red===1?" día penalizado":" días penalizados"))} de ${days}.`,`Month over: ${B_(red+(red===1?" penalized day":" penalized days"))} out of ${days}.`);S.obs=()=>({v:nf(red/days*100,1)+" %",l:T(`este mes: ${red} de ${days} días`,`this month: ${red} of ${days} days`)})}
  else{const fm=EC.fmaxOf(month.n-D0.e,month.meta,month.round);const ok=EC.okDay(D0.f,month.n-D0.e,month.meta,month.round);
   S.cap=L===1?T(`Día ${d+1}: ${B_(D0.f+(D0.f===1?" falla":" fallas"))}. Puedes fallar ${fm}: ${ok?"día pagado":B_("día penalizado")}.`,`Day ${d+1}: ${B_(D0.f+(D0.f===1?" failure":" failures"))}. You may fail ${fm}: ${ok?"day paid":B_("day penalized")}.`)
    :T(`Día ${d+1}: ${B_(D0.f+(D0.f===1?" falla":" fallas"))}. Se juzga al cerrar ${L===6?"la semana":"el mes"}: los días buenos compensan.`,`Day ${d+1}: ${B_(D0.f+(D0.f===1?" failure":" failures"))}. Judged when the ${L===6?"week":"month"} closes: good days make up.`)}
  return true}
 S.fleet=F;S.info=()=>{if(!month)return null;const d=Math.min(days-1,Math.floor(ms/dayDur));return T(`Furgón · día ${d+1}: <b>${month[d].f} ${month[d].f===1?"falla":"fallas"}</b> de ${month.n} paradas`,`Van · day ${d+1}: <b>${month[d].f} ${month[d].f===1?"failure":"failures"}</b> of ${month.n} stops`)};
 S.apply=(st2,kind)=>{cur=Object.assign({},st2);newMonth()};
 S.prewarm=()=>{newMonth();ms=dayDur*Math.min(days-1,7.5);for(let k=0;k<6;k++)at(1);tiles.forEach(t=>{t.col=t.tc;t.ang=0;t.m.rotation.y=0;t.m.material=mat(t.col)})};
 S.startRun=()=>{newMonth();ms=0;S.done=false;S.obs=null};S.progress=()=>month?ms/(days*dayDur):0;
 S.tick=(dt,sp)=>{if(!month)newMonth();ms+=dt*1000*sp;if(ms>=days*dayDur){ms=days*dayDur;S.done=true}return at(dt)};
 S.ff=st2=>S.apply(st2);
 return S}

/* ---------------- AMAZON · the picker never stops ---------------- */
function sceneAmazon(st){const bays=Math.max(2,Math.round(Math.min(60,Math.max(4,st.L/5))/2)),AL=bays*2,W=AL+10,D=13;const{scene,g}=diorama(W,D,P.floor);const x0=-AL/2;
 flat(g,AL+1.6,3.0,P.asphalt2,0,0.01,0);
 const rng=EC.rngFrom(77);const up=inst(g,rboxG(0.16,3.2,0.16,0.04),mat(P.blue),(bays+1)*4),beam=inst(g,rboxG(2,0.12,0.12,0.03),mat(P.coral),bays*2*3*2),cart=inst(g,rboxG(1,1,1,0.12),new THREE.MeshLambertMaterial({color:0xffffff}),bays*2*3*3);cart.material.userData.own=true;
 let ui=0,bi=0,ci=0;const CC=[0xD9B07A,0xC99D66,0xE8CF9C,0x8FB3E8,0xF2A27E,0xB8D99A];
 for(const side of [-1,1]){const zc=side*2.35;for(let b=0;b<=bays;b++)for(const dz of [-0.6,0.6])setI(up,ui++,x0+b*2,1.6,zc+dz,1,1,1);
  for(let b=0;b<bays;b++)for(let l=0;l<3;l++){for(const dz of [-0.6,0.6])setI(beam,bi++,x0+b*2+1,0.12+l*1.0,zc+dz,1,1,1);for(let q=0;q<3;q++){const wv=0.42+rng()*0.14,h=0.38+rng()*0.38;setI(cart,ci,x0+b*2+0.36+q*0.64,0.18+l*1.0+h/2,zc,wv,h,0.86);cart.setColorAt(ci,_c.setHex(CC[Math.floor(rng()*CC.length)]));ci++}}}
 [up,beam,cart].forEach(im=>{im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true});
 const zm=new THREE.MeshBasicMaterial({color:P.mint,transparent:true,opacity:0.3,depthWrite:false});zm.userData.own=true;const zone=flat(g,1,3.0,zm,0,0.03,0);const zline=flat(g,0.16,3.0,P.mint,0,0.035,0,{basic:true});
 rb(g,0.25,3.3,0.25,P.yellow,x0-1.3,0,-1.7,0.06);rb(g,0.25,3.3,0.25,P.yellow,x0-1.3,0,1.7,0.06);rb(g,0.3,0.5,3.7,P.yellow,x0-1.3,3.3,0,0.1);flat(g,1.6,2.6,P.coral,x0-2.4,0.02,0);
 for(let i=0;i<4;i++){tree(g,-W/2+1.6+i*0.4,-D/2+1.4+i*3.3,0.75);tree(g,W/2-1.6,-D/2+1.6+i*3.2,0.75)}
 for(let m=0;m<=st.L;m+=st.L>150?50:st.L>60?25:10){const mx=x0+m/st.L*AL;rb(g,0.08,0.02,0.6,P.white,mx,0.02,1.15,0.02,{noCast:true})}sign(g,st.L+" m",x0+AL+1.6,-3.8,0.4,"#F4EBD9","#0F1729",0.7);
 const copies=inst(g,rboxG(0.95,0.8,1.12,0.14),mat(P.yellow,{basic:true}),20,false);const STAR=new Icons(g,"star",20,1.5);const rings=inst(g,new THREE.RingGeometry(0.42,0.6,24),mat(P.yellow,{basic:true}),20,false);/* a bright box, a big star and a ring on the floor: the copies must be seen at a glance */
 const dots=inst(g,new THREE.CircleGeometry(0.11,10),mat(P.mint,{basic:true}),60,false);
 const op=person(g,P.yellow,x0-0.5,0,Math.PI/2);const cartM=new THREE.Group();rb(cartM,0.9,0.5,0.6,P.sky,0,0.3,0,0.08);rb(cartM,0.08,0.7,0.6,P.dark,-0.5,0.3,0,0.03);[[-0.3,-0.25],[0.3,-0.25],[-0.3,0.25],[0.3,0.25]].forEach(p=>put(cartM,GEO().wheelS,mat(P.dark),p[0],0.12,p[1]).scale.set(0.6,0.3,0.6));g.add(cartM);
 const S=mkS(scene,new THREE.Box3(new THREE.Vector3(-W/2+1,0,-D/2),new THREE.Vector3(W/2-1,3.4,D/2)),{root:g,az:0.42,azP:0.25,el:0.7,anchor:{x:x0+AL*0.62,y:4.4,z:0}});
 let cur=Object.assign({},st),ord=null,ms=0,dur=1,seed=5,n=0,sum=0,clk=0;
 const effK=()=>cur.ord==="orden"?1:cur.k,NO=()=>Math.max(1,Math.round(cur.o||4));
 function newOrder(){seed++;const r=EC.rngFrom(seed*65537);const z=cur.z/100;const list=[];for(let j=0;j<effK();j++)list.push({x:r()*z*cur.L,side:r()<0.5?-1:1,lvl:Math.floor(r()*3)});ord={copies:list,near:Math.min(...list.map(c=>c.x))};ms=0;dur=600+1500*ord.near/cur.L;zone.scale.x=Math.max(0.01,z*AL);zone.position.x=x0+z*AL/2;zline.position.x=x0+z*AL;zone.visible=zline.visible=z<0.999}
 function at(dt){clk+=dt;const u=Math.min(1,ms/dur);for(let i=0;i<20;i++){if(i<ord.copies.length){const c=ord.copies[i];const x=x0+c.x/cur.L*AL,y=0.18+c.lvl*1.0,z=c.side*2.35;setI(copies,i,x,y+0.4+Math.sin(clk*4+i)*0.08,z,1,1,1);STAR.set(i,x,y+1.45,z,true);setI(rings,i,x,0.04,c.side*1.45,1+(c.x===ord.near?Math.sin(clk*6)*0.12:0),1+(c.x===ord.near?Math.sin(clk*6)*0.12:0),1,0,-Math.PI/2)}else{copies.setMatrixAt(i,_m4.makeScale(0,0,0));STAR.set(i,0,0,0,false);rings.setMatrixAt(i,_m4.makeScale(0,0,0))}}copies.instanceMatrix.needsUpdate=true;rings.instanceMatrix.needsUpdate=true;
  const d=ord.near/cur.L*AL;let x,walked,dir=1;if(u<0.44){x=d*ease(u/0.44);walked=ord.near*ease(u/0.44)}else if(u<0.56){x=d;walked=ord.near}else{x=d*(1-ease((u-0.56)/0.44));walked=ord.near*(1+ease((u-0.56)/0.44));dir=-1}
  op.position.x=x0-0.4+x;op.rotation.y=dir>0?Math.PI/2:-Math.PI/2;cartM.position.set(op.position.x+dir*0.9,0,0);op.position.y=Math.abs(Math.sin(clk*9))*0.06;
  const nd=Math.min(60,Math.floor(Math.min(d,AL)/Math.max(0.45,AL/60)));for(let i=0;i<60;i++){const gap=Math.max(0.45,AL/60);if(i<nd&&i*gap<=(u<0.56?x:d))setI(dots,i,x0+0.2+i*gap,0.04,(i%2?0.18:-0.18),1,1,1,0,-Math.PI/2);else dots.setMatrixAt(i,_m4.makeScale(0,0,0))}dots.instanceMatrix.needsUpdate=true;
  STAR.step(dt,S.cam.quaternion,clk);S.labels=[{x:op.position.x,y:2.6,z:0,html:dir>0?`${nf(Math.min(walked,ord.near),1)} m ${T("de ida","one way")}`:`<span class="g">${T("vuelve","back")}</span>`}];S.clock=T(`Pedido ${n+1}`,`Order ${n+1}`);
  S.cap=T(`La copia más cercana está a ${B_(nf(ord.near,1)+" m")}${effK()>1?` (hay ${effK()} copias)`:" (hay una sola)"}.`,`The nearest copy is ${B_(nf(ord.near,1)+" m")} away${effK()>1?` (${effK()} copies)`:" (only one)"}.`);return true}
 S.apply=(st2)=>{cur=Object.assign({},st2);newOrder()};
 S.prewarm=()=>{newOrder();ms=dur*0.3;at(0.016)};
 S.startRun=()=>{n=0;sum=0;newOrder();S.done=false;S.obs=null};S.progress=()=>Math.min(1,(n+Math.min(1,ms/dur))/NO());
 /* more orders run faster, so the whole run stays about as long as 6 orders */S.tick=(dt,sp)=>{if(!ord)newOrder();ms+=dt*1000*sp*Math.max(1,NO()/6);if(ms>=dur){n++;sum+=ord.near;if(n>=NO()){ms=dur;S.done=true;const N=NO();S.obs=()=>({v:nf(sum/N,1)+" m",l:N===1?T("en este pedido","in this order"):T(`promedio de estos ${N} pedidos`,`average of these ${N} orders`)});return at(dt)}newOrder()}return at(dt)};
 S.ff=st2=>S.apply(st2);
 return S}

/* ---------------- IKEA · 100 deliveries in a neighborhood ---------------- */
/* van of 5,6 m³: a PAX in boxes is 0,276 m³ (20 per trip), assembled 1,81 m³ (3 per trip); other products scale by box count */
const ikeaCap=(n,big)=>big?3:Math.max(1,Math.floor(5.6/(n*0.023)));
function sceneIkea(st){const n=st.pack==="armado"?1:st.n,big=st.pack==="armado",CAP=ikeaCap(st.n,big);const PX=3.4,PZ=3.7,X0=1.6;const W=10*PX+10,D=10*PZ+5;
 const{scene,g}=diorama(W,D,P.grass);const hx=c=>(c-4.5)*PX+X0,hz=r=>(r-4.5)*PZ,sz=k=>(hz(2*k)+hz(2*k+1))/2,xd=hx(0)-2.6;
 for(let k=0;k<5;k++)roadX(g,xd-1,hx(9)+1.6,sz(k),1.7);roadZ(g,hz(0)-1.4,hz(9)+1.4,xd,1.8);
 /* blue warehouse with a yellow band (generic, no logo) */
 rb(g,4.4,3.2,D-8,0x2F5DA8,xd-3.6,0,0,0.3);rb(g,4.7,0.3,D-7.7,0x24477F,xd-3.6,3.2,0,0.1);rb(g,4.42,0.5,D-7.98,P.yellow,xd-3.6,2.3,0,0.06);
 const G=GEO(),HC=[0xF1E8D6,0xFFD9B8,0xCFE0F5,0xF7E3A1,0xD8F0D5,0xF4CFCF];
 const body=inst(g,rboxG(1.8,1.25,1.5,0.18),new THREE.MeshLambertMaterial({color:0xffffff}),100),roof=inst(g,G.pyr,new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),100);body.material.userData.own=true;roof.material.userData.own=true;
 const H=[];for(let r=0;r<10;r++)for(let c=0;c<10;c++){const i=r*10+c,x=hx(c),z=hz(r),face=r%2===0?1:-1;H.push({x,z,face,r,c});setI(body,i,x,0.625,z,1,1,1);body.setColorAt(i,_c.setHex(HC[(r*3+c)%HC.length]));setI(roof,i,x,1.25+0.45,z,1.45,0.9,1.25,Math.PI/4);roof.setColorAt(i,_c.setHex(0x8C9BB8))}
 [body,roof].forEach(m=>{m.instanceMatrix.needsUpdate=true;m.instanceColor.needsUpdate=true});
 const bs=0.3,boxes=inst(g,big?rboxG(0.55,1.35,0.38,0.06):rboxG(bs,0.22,bs,0.04),new THREE.MeshLambertMaterial({color:0xffffff}),100*n);boxes.material.userData.own=true;
 const BANG=new Icons(g,"bang",100,1.0);
 const F=new Fleet(g,1,0.62,{van:true,col:P.yellow});
 function boxAt(i,j,yo,col,tilt){const h=H[i];const fx=h.x+0.55,fz=h.z+h.face*1.18;if(yo===null){boxes.setMatrixAt(i*n+j,_m4.makeScale(0,0,0))}else if(big){setI(boxes,i*n+j,fx,0.675+yo,fz,1,1,1,0,tilt?0.5:0)}else{const l=Math.floor(j/4),q=j%4;setI(boxes,i*n+j,fx+(q%2-0.5)*(bs+0.03),0.11+l*0.24+yo,fz+(Math.floor(q/2)-0.5)*(bs+0.03),1,1,1,tilt||0,tilt?0.6:0)}boxes.setColorAt(i*n+j,_c.setHex(col))}
 /* the van route: serpentine along the streets, back to the warehouse when empty */
 const order=[];for(let k=0;k<5;k++){const cols=[...Array(10).keys()];if(k%2)cols.reverse();cols.forEach(c=>{order.push((2*k)*10+c,(2*k+1)*10+c)})}
 let path=[],stops=[],trips=1;
 function buildPath(){path=[[xd,sz(0)]];stops=new Array(100).fill(0);let load=CAP,k0=0;trips=1;const P2=pt=>{const l=path[path.length-1];if(l[0]!==pt[0]||l[1]!==pt[1])path.push(pt)};
  order.forEach((i,idx)=>{const h=H[i],k=Math.floor(h.r/2);if(load===0){P2([path[path.length-1][0],sz(k0)]);P2([xd,sz(k0)]);P2([xd,sz(k)]);load=CAP;trips++}if(k!==k0){const l=path[path.length-1];P2([l[0],sz(k0)]);P2([xd,sz(k0)]);P2([xd,sz(k)]);k0=k}P2([h.x,sz(k)]);stops[i]=path.length-1;load--})
  const L=[0];for(let a=1;a<path.length;a++)L.push(L[a-1]+Math.hypot(path[a][0]-path[a-1][0],path[a][1]-path[a-1][1]));path.L=L}
 const posAt=d=>{const L=path.L;let a=1;while(a<path.length-1&&L[a]<d)a++;const t=Math.min(1,Math.max(0,(d-L[a-1])/((L[a]-L[a-1])||1)));const p0=path[a-1],p1=path[a];return[p0[0]+(p1[0]-p0[0])*t,p0[1]+(p1[1]-p0[1])*t,Math.atan2(-(p1[1]-p0[1]),p1[0]-p0[0])]};
 const S=mkS(scene,new THREE.Box3(new THREE.Vector3(-W/2,0,-D/2),new THREE.Vector3(W/2,2.4,D/2)),{root:g,az:0.7,azP:0.5,el:0.78});
 let cur=Object.assign({},st),batch=null,ms=0,dur=5200,clk=0;
 function reset(){batch=EC.iBatch({n,pi:cur.pi,X:cur.pack==="scan"?cur.X/100:0},(Date.now()&0xffff)*7907+11);buildPath();ms=0;for(let i=0;i<100;i++){for(let j=0;j<n;j++)boxAt(i,j,null,P.carton);roof.setColorAt(i,_c.setHex(0x8C9BB8));BANG.set(i,0,0,0,false)}boxes.instanceMatrix.needsUpdate=true;boxes.instanceColor.needsUpdate=true;roof.instanceColor.needsUpdate=true;F.go(0,xd,sz(0),-Math.PI/2,true);F.snap(0);F.commit()}
 function at(dt){clk+=dt;const RUN=dur*0.82,total=path.L[path.L.length-1],d=Math.min(total,ms/RUN*total);const p=posAt(d);F.go(0,p[0],p[1]+0.45,p[2],true);F.snap(0);F.commit();
  let done=0,bad=0,lastBad=-1,rep=0,trip=1,load=CAP;
  order.forEach(i=>{const t0=path.L[stops[i]]/total*RUN,age=ms-t0;const o=batch[i];if(age<0){for(let j=0;j<n;j++)boxAt(i,j,null,P.carton);roof.setColorAt(i,_c.setHex(0x8C9BB8));BANG.set(i,0,0,0,false);return}
   done++;for(let j=0;j<n;j++){const s=o.boxes[j],ab=age-j*25;if(ab<0){boxAt(i,j,null,P.carton);continue}const f=bounce(Math.min(1,ab/380)),yo=(1-f)*1.6;let col=P.carton,tilt=0;if(s===1){col=P.red;tilt=f>0.99?0.4:0}if(s===2){col=ab<900?P.yellow:P.carton;if(ab<900)rep++}boxAt(i,j,yo,col,tilt)}
   const ok=!o.bad;const shown=age>380+n*25;roof.setColorAt(i,_c.setHex(shown?(ok?P.mint:P.red):0x8C9BB8));const h=H[i];BANG.set(i,h.x,2.9,h.z,shown&&!ok);if(o.bad){bad++;if(shown)lastBad=i}});
  for(let idx=0;idx<done;idx++){if(load===0){trip++;load=CAP}load--}
  boxes.instanceMatrix.needsUpdate=true;boxes.instanceColor.needsUpdate=true;roof.instanceColor.needsUpdate=true;BANG.step(dt,S.cam.quaternion,clk);S.load=load;S.trip=trip;
  S.clock=T(`Entrega ${done} de 100 · viaje ${trip}`,`Delivery ${done} of 100 · trip ${trip}`);
  S.cap=lastBad>=0&&batch[lastBad]&&done-order.indexOf(lastBad)<4?T(`Una casa recibió ${B_("una caja dañada")}: el clóset no se puede armar.`,`A home got ${B_("a damaged box")}: the wardrobe can't be built.`):rep?T(`El escaneo atrapó una caja mala ${B_("antes de entregarla")} y la cambió.`,`Scanning caught a bad box ${B_("before delivering it")} and replaced it.`):T(`${B_(done+" entregas")} · ${B_(bad+(bad===1?" incompleta":" incompletas"))} hasta ahora.`,`${B_(done+" deliveries")} · ${B_(bad+" incomplete")} so far.`);return true}
 S.fleet=F;S.info=()=>T(`Furgón · viaje ${S.trip||1} · quedan <b>${S.load==null?CAP:S.load}</b> pedidos a bordo`,`Van · trip ${S.trip||1} · <b>${S.load==null?CAP:S.load}</b> orders on board`);
 S.apply=(st2)=>{cur=Object.assign({},st2);reset()};
 S.prewarm=()=>{reset()};
 S.startRun=()=>{reset();S.done=false;S.obs=null};S.progress=()=>ms/dur;
 S.tick=(dt,sp)=>{if(!batch)reset();ms+=dt*1000*sp;if(ms>=dur){ms=dur;S.done=true;const bad=batch.filter(o=>o.bad).length;S.obs=()=>({v:bad+" "+T("de 100","of 100"),l:T("llegaron incompletos","arrived incomplete")})}return at(dt)};
 return S}

/* ---------------- QUÉDATELO · 100 returns: the van pays the trip, or the parcel stays home ---------------- */
function sceneQuedatelo(st){const PX=3.4,PZ=3.7,X0=1.6,CAP=20;const W=10*PX+10,D=10*PZ+5;
 const{scene,g}=diorama(W,D,P.grass);const hx=c=>(c-4.5)*PX+X0,hz=r=>(r-4.5)*PZ,sz=k=>(hz(2*k)+hz(2*k+1))/2,xd=hx(0)-2.6;
 for(let k=0;k<5;k++)roadX(g,xd-1,hx(9)+1.6,sz(k),1.7);roadZ(g,hz(0)-1.4,hz(9)+1.4,xd,1.8);
 rb(g,4.4,3.2,D-8,0x2F5DA8,xd-3.6,0,0,0.3);rb(g,4.7,0.3,D-7.7,0x24477F,xd-3.6,3.2,0,0.1);
 const G=GEO(),HC=[0xF1E8D6,0xFFD9B8,0xCFE0F5,0xF7E3A1,0xD8F0D5,0xF4CFCF],GREY=0x8C9BB8;
 const body=inst(g,rboxG(1.8,1.25,1.5,0.18),new THREE.MeshLambertMaterial({color:0xffffff}),100),roof=inst(g,G.pyr,new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),100);body.material.userData.own=true;roof.material.userData.own=true;
 const H=[];for(let r=0;r<10;r++)for(let c=0;c<10;c++){const i=r*10+c,x=hx(c),z=hz(r),face=r%2===0?1:-1;H.push({x,z,face,r,c});setI(body,i,x,0.625,z,1,1,1);body.setColorAt(i,_c.setHex(HC[(r*3+c)%HC.length]));setI(roof,i,x,1.7,z,1.45,0.9,1.25,Math.PI/4);roof.setColorAt(i,_c.setHex(GREY))}
 [body,roof].forEach(m=>{m.instanceMatrix.needsUpdate=true;m.instanceColor.needsUpdate=true});
 const box=inst(g,rboxG(0.5,0.4,0.5,0.05),new THREE.MeshLambertMaterial({color:0xffffff}),100);box.material.userData.own=true;
 const BANG=new Icons(g,"bang",100,1.0),F=new Fleet(g,1,0.62,{van:true,col:P.yellow});
 const order=[];for(let k=0;k<5;k++){const cols=[...Array(10).keys()];if(k%2)cols.reverse();cols.forEach(c=>order.push((2*k)*10+c,(2*k+1)*10+c))}
 /* the route: along each street and back to the warehouse every CAP parcels */
 const path=[[xd,sz(0)]],stops=new Array(100).fill(0);{let load=CAP,k0=0;const add=p=>{const l=path[path.length-1];if(l[0]!==p[0]||l[1]!==p[1])path.push(p)};order.forEach(i=>{const h=H[i],k=Math.floor(h.r/2);if(k!==k0||load===0){const l=path[path.length-1];add([l[0],sz(k0)]);add([xd,sz(k0)]);add([xd,sz(k)]);k0=k;load=CAP}add([h.x,sz(k)]);stops[i]=path.length-1;load--});add([path[path.length-1][0],sz(k0)]);add([xd,sz(k0)])
  const L=[0];for(let a=1;a<path.length;a++)L.push(L[a-1]+Math.hypot(path[a][0]-path[a-1][0],path[a][1]-path[a-1][1]));path.L=L}
 const posAt=d=>{const L=path.L;let a=1;while(a<path.length-1&&L[a]<d)a++;const t=Math.min(1,Math.max(0,(d-L[a-1])/((L[a]-L[a-1])||1)));const p0=path[a-1],p1=path[a];return[p0[0]+(p1[0]-p0[0])*t,p0[1]+(p1[1]-p0[1])*t,Math.atan2(-(p1[1]-p0[1]),p1[0]-p0[0])]};
 const S=mkS(scene,new THREE.Box3(new THREE.Vector3(-W/2,0,-D/2),new THREE.Vector3(W/2,2.4,D/2)),{root:g,az:0.7,azP:0.5,el:0.78});
 let cur=Object.assign({},st),r=EC.quedatelo(cur),ms=0,clk=0,fake=[];const dur=5200;
 const door=(i,yo)=>{const h=H[i];setI(box,i,h.x+0.55,0.2+yo,h.z+h.face*1.18,1,1,1);box.setColorAt(i,_c.setHex(P.carton))},hide=i=>box.setMatrixAt(i,_m4.makeScale(0,0,0));
 const stack=j=>{const q=j%25,l=Math.floor(j/25);return[xd-1.0+(q%5)*0.56-1.1,0.2+l*0.42,sz(2)-1.2+Math.floor(q/5)*0.56]};
 function reset(){r=EC.quedatelo(cur);ms=0;const rng=EC.rngFrom((Date.now()&0xffff)*7907+11);fake=order.map(()=>rng()<cur.a/100);order.forEach(i=>{door(i,0);roof.setColorAt(i,_c.setHex(GREY));BANG.set(i,0,0,0,false)});box.instanceMatrix.needsUpdate=true;box.instanceColor.needsUpdate=true;roof.instanceColor.needsUpdate=true;F.go(0,xd,sz(0),-Math.PI/2,true);F.snap(0);F.commit()}
 const good=()=>r.conviene===cur.pol||r.lossT===r.lossD;
 function at(dt){clk+=dt;const bring=cur.pol==="traer",RUN=dur*0.9,total=path.L[path.L.length-1];let done=0,bad=0;
  if(bring){const d=Math.min(total,ms/RUN*total),p=posAt(d);F.go(0,p[0],p[1]+0.45,p[2],true);F.snap(0);F.commit()}
  order.forEach((i,n)=>{const t0=bring?path.L[stops[i]]/total*RUN:n/100*RUN,age=ms-t0;if(age<0)return;done++;
   if(bring){const q=stack(n);setI(box,i,q[0],q[1],q[2],1,1,1);box.setColorAt(i,_c.setHex(r.S<0?P.red:P.mint))}else door(i,Math.sin(Math.min(1,age/300)*Math.PI)*0.7);
   roof.setColorAt(i,_c.setHex(good()?P.mint:P.red));const h=H[i],f=!bring&&fake[n];if(f)bad++;BANG.set(i,h.x,2.9,h.z,f)});
  box.instanceMatrix.needsUpdate=true;box.instanceColor.needsUpdate=true;roof.instanceColor.needsUpdate=true;BANG.step(dt,S.cam.quaternion,clk);S.bad=bad;
  S.clock=T(`Devolución ${done} de 100`,`Return ${done} of 100`);
  S.cap=bring?T(`Recuperas ${B_("US$ "+nf(r.rec*done,2))} · gastas ${B_("US$ "+nf(r.cost*done,2))}`,`Recovered ${B_("$"+nf(r.rec*done,2))} · spent ${B_("$"+nf(r.cost*done,2))}`):cur.a?T(`Sin viaje · ${B_(bad+(bad===1?" reclamo falso":" reclamos falsos"))} hasta ahora`,`No trip · ${B_(bad+" false claims")} so far`):T(`Sin viaje: ${B_(done+(done===1?" producto se queda":" productos se quedan"))} en casa.`,`No trip: ${B_(done+" products stay")} home.`);return true}
 S.fleet=F;S.info=()=>cur.pol==="traer"?T(`Furgón · cada vuelta cuesta <b>US$ ${nf(r.cost,2)}</b> por paquete`,`Van · each return costs <b>$${nf(r.cost,2)}</b> per parcel`):T("Furgón en la bodega: no hay viaje que pagar","Van at the warehouse: no trip to pay for");
 S.apply=st2=>{cur=Object.assign({},st2);reset()};S.prewarm=()=>reset();S.startRun=()=>{reset();S.done=false;S.obs=null};S.progress=()=>ms/dur;
 S.tick=(dt,sp)=>{ms+=dt*1000*sp;if(ms>=dur){ms=dur;S.done=true;if(cur.pol==="deja"&&cur.a>0){const b=fake.filter(Boolean).length;S.obs=()=>({v:b+" "+T("de 100","of 100"),l:T("reclamos falsos","false claims")})}}return at(dt)};
 reset();return S}

/* ---------------- CADENA · 100 orders cross the stages; each stage pulls out the ones it gets wrong ---------------- */
function sceneCadena(st){const NMAX=10,W=30,D=16;const{scene,g}=diorama(W,D,P.floor);
 /* v2 (09-11): no conveyor belt. Each stage is a small world the eye recognizes without reading
    (planning desk + calendar, warehouse rack + forklift, truck on a street, invoice printer), like reel 8 v13. */
 const BZ=0,X0=-W/2+3,X1=W/2-3;flat(g,X1-X0+3,3.2,0xE4E6EC,(X0+X1)/2,0.015,BZ);
 let NG=Math.max(1,Math.min(NMAX,st.n));const sp=()=>(X1-X0-8)/NG,gx=k=>X0+5+(k+0.5)*sp(),gates=[];
 const ZC=[0xB6CCEB,0xC9CBD1,0x4A5068,0xBDE3C6];
 for(let k=0;k<NMAX;k++){const gg=new THREE.Group();gg.position.set(gx(k),0,BZ);g.add(gg);const kind=k%4;
  const zone=flat(gg,1,D-1.2,ZC[kind],0,0.01,0);
  rb(gg,0.5,0.06,0.5,P.dark,0,0,2.9,0.03);rb(gg,0.16,2.0,0.16,P.dark,0,0,2.9,0.04);const light=rb(gg,0.5,0.5,0.5,P.mint,0,2.0,2.9,0.1);
  const bin=new THREE.Group();bin.position.set(0,0,4.6);gg.add(bin);rb(bin,1.9,0.12,1.5,0x7A2A2A,0,0,0,0.04);rb(bin,1.9,0.7,0.12,P.red,0,0,0.7,0.04);rb(bin,1.9,0.7,0.12,P.red,0,0,-0.7,0.04);rb(bin,0.12,0.7,1.5,P.red,0.9,0,0,0.04);rb(bin,0.12,0.7,1.5,P.red,-0.9,0,0,0.04);
  const w=new THREE.Group();w.position.set(0,0,-3.6);w.rotation.y=Math.PI;gg.add(w);const an={};
  if(kind===0){/* planning: desk, laptop, wall calendar with a day marker that walks */
   rb(w,2.4,0.1,1.1,P.wood,0,0.9,0.3,0.04);[-1.05,1.05].forEach(x=>[-0.15,0.75].forEach(z=>rb(w,0.1,0.9,0.1,P.dark,x,0,z,0.02)));
   rb(w,0.8,0.05,0.55,0x8C93A3,-0.5,1.0,0.3,0.02);rb(w,0.8,0.5,0.05,P.dark,-0.5,1.05,0.58,0.02);an.bar=rb(w,0.6,0.08,0.06,P.mint,-0.5,1.2,0.55,0.01);
   rb(w,2.6,1.9,0.12,P.white,0,1.3,1.1,0.05);rb(w,2.6,0.4,0.14,P.blue,0,2.85,1.1,0.05);
   for(let r=0;r<3;r++)for(let c=0;c<5;c++)rb(w,0.38,0.32,0.06,(r===1&&c===3)?P.red:0xCCD5E6,(c-2)*0.48,2.35-r*0.45,1.02,0.03);
   an.mark=rb(w,0.4,0.34,0.08,P.yellow,0,2.35,0.99,0.03)}
  else if(kind===1){/* warehouse: rack with containers + forklift going back and forth */
   [-1.3,1.3].forEach(x=>rb(w,0.16,2.8,0.9,P.blue,x,0,1.1,0.03));[0.25,1.2,2.15].forEach((y,l)=>{rb(w,2.7,0.1,0.92,P.coral,0,y,1.1,0.02);for(let c=0;c<3;c++)if(!(l===2&&c===2))rb(w,0.62,0.55,0.62,(l+c)%2?0xC79A63:P.carton,(c-1)*0.82,y+0.1,1.1,0.05)});
   const f=new THREE.Group();w.add(f);rb(f,0.9,0.5,0.65,P.yellow,0,0.12,0,0.08);rb(f,0.45,0.45,0.6,P.dark,-0.15,0.62,0,0.06);rb(f,0.08,1.4,0.55,P.dark,0.5,0,0,0.02);
   const fork=new THREE.Group();f.add(fork);rb(fork,0.6,0.05,0.12,P.dark,0.8,0,-0.17,0.01);rb(fork,0.6,0.05,0.12,P.dark,0.8,0,0.17,0.01);rb(fork,0.5,0.45,0.5,P.carton,0.8,0.05,0,0.05);an.lift=f;an.fork=fork}
  else if(kind===2){/* transport: street + truck that drives in, stops and leaves */
   const tr=new THREE.Group();w.add(tr);rb(tr,2.2,0.18,1.0,P.dark,-0.3,0.35,0,0.05);rb(tr,1.9,0.9,0.95,P.carton,-0.45,0.53,0,0.08);rb(tr,0.8,0.95,0.98,P.blue,1.15,0.35,0,0.12);rb(tr,0.06,0.45,0.75,P.glass,1.56,0.75,0,0.02);
   an.wh=[];[[-1.0,-0.5],[-1.0,0.5],[0.9,-0.5],[0.9,0.5]].forEach(([x,z])=>{const c=put(tr,new THREE.CylinderGeometry(0.28,0.28,0.2,16),mat(0x1E2230),x,0.28,z);c.rotation.x=Math.PI/2;an.wh.push(c)});an.truck=tr}
  else{/* invoicing: desk, monitor with a check, printer pushing out invoices */
   rb(w,2.4,0.1,1.1,P.wood,0,0.9,0.3,0.04);[-1.05,1.05].forEach(x=>[-0.15,0.75].forEach(z=>rb(w,0.1,0.9,0.1,P.dark,x,0,z,0.02)));
   rb(w,1.0,0.7,0.08,P.dark,-0.55,1.25,0.7,0.03);[0,1,2].forEach(r=>rb(w,0.6,0.07,0.05,P.white,-0.65,1.75-r*0.15,0.64,0.01));rb(w,0.18,0.18,0.05,P.mint,-0.25,1.35,0.64,0.02);
   rb(w,0.9,0.4,0.7,0xDCDDE2,0.55,1.0,0.5,0.06);an.sheet=rb(w,0.55,0.02,0.7,P.white,0.55,1.25,0.5,0.005);an.pile=[0,1,2,3].map(q=>rb(w,0.55,0.03,0.7,P.white,0.55,1.0+0.04*q,-0.35,0.005))}
  gates.push({gg,light,zone,an,kind})}
 const tray=rb(g,4.2,0.1,4.2,0xE6E8EE,0,0.12,BZ,0.05);
 const box=inst(g,rboxG(0.32,0.28,0.32,0.05),new THREE.MeshLambertMaterial({color:0xffffff}),100);box.material.userData.own=true;
 const S=mkS(scene,new THREE.Box3(new THREE.Vector3(-W/2,0,-D/2),new THREE.Vector3(W/2,4.5,D/2)),{root:g,az:0.62,azP:0.34,el:0.72});
 let cur=Object.assign({},st),r=EC.cadena(cur),ms=0,fail=[],seed=1,tt=0;const dur=5600;
 const nG=()=>Math.max(1,Math.min(NMAX,cur.n)),xs=()=>X0-1.2,xe=()=>X1-0.5;
 const cell=i=>{const rr=Math.floor(i/10),cc=i%10;return[(cc-4.5)*0.38,(rr-4.5)*0.38]};
 function reset(){r=EC.cadena(cur);ms=0;seed++;const rng=EC.rngFrom(seed*7919+13),n=nG(),p=cur.p/100;
  /* exact counts (like the reel: 5, 5, 4, 5 with 4 stages at 95 %), random boxes: the run never contradicts the big number */
  const cnt=new Array(n).fill(0);if(cur.pol==="juntas")cnt[0]=Math.round(100*(1-p));else for(let k=0;k<n;k++)cnt[k]=Math.round(100*Math.pow(p,k))-Math.round(100*Math.pow(p,k+1));
  const ids=[...Array(100).keys()];for(let i=99;i>0;i--){const j=Math.floor(rng()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]]}
  fail=new Array(100).fill(-1);let q=0;cnt.forEach((c,k)=>{for(let m=0;m<c;m++)fail[ids[q++]]=k})
  NG=n;gates.forEach((G,k)=>{G.gg.visible=k<n;G.gg.position.x=gx(k);G.zone.scale.x=sp()*0.97;G.gg.children.forEach(c=>{if(c.isGroup&&c.position.z<-3)c.scale.setScalar(Math.min(1.4,sp()/2.9))});G.light.material=mat(P.mint)});at(0)}
 function anim(){gates.forEach(G=>{const a=G.an;
  if(a.mark){const n=Math.floor(tt/0.45)%15,rr=Math.floor(n/5),cc=n%5;a.mark.position.set((cc-2)*0.48,2.35-rr*0.45+0.17,0.99);const f=(tt%1.6)/1.6;a.bar.scale.x=Math.max(0.05,f);a.bar.position.x=-0.8+0.3*f}
  if(a.lift){const ph=(tt%4)/4,e=x=>x<0.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2,cl=x=>Math.max(0,Math.min(1,x));const x=ph<0.5?-0.8+1.6*e(cl(ph/0.45)):0.8-1.6*e(cl((ph-0.5)/0.45));a.lift.position.set(x,0,-0.2);a.lift.rotation.y=ph<0.5?0:Math.PI;a.fork.position.y=0.1+0.7*Math.sin(Math.PI*cl((ph%0.5)/0.5))}
  if(a.truck){const ph=(tt%5)/5,e=x=>x<0.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2,cl=x=>Math.max(0,Math.min(1,x));const x=ph<0.6?-4+3.4*e(cl(ph/0.38)):-0.6-3.4*e(cl((ph-0.6)/0.4));a.truck.position.set(x,0,0);a.truck.visible=x>-3.4;a.wh.forEach(c=>c.rotation.y=-x*3)}
  if(a.sheet){const ph=(tt%2)/2;a.sheet.position.z=0.5-0.6*Math.min(1,ph*1.4);a.sheet.position.y=1.25-0.25*Math.max(0,(ph-0.7)/0.3);const np=1+Math.floor(tt/2)%4;a.pile.forEach((m,q)=>m.visible=q<np)}})}
 function at(dt){tt+=dt||0;anim();const n=nG(),RUN=dur*0.82,u=Math.min(1,ms/RUN),tx=xs()+(xe()-xs())*u;
  tray.position.x=tx;let out=0,stage=0;const binCount=new Array(NMAX).fill(0);
  for(let k=0;k<n;k++)if(tx>=gx(k))stage=k+1;
  for(let i=0;i<100;i++){const[cx,cz]=cell(i),f=fail[i];
   if(f>=0&&tx>=gx(f)){out++;const j=binCount[f]++,age=Math.min(1,(tx-gx(f))/1.6),bx=gx(f)+((j%4)-1.5)*0.4,bz=BZ+4.6+(Math.floor(j/4)%3-1)*0.4,by=0.2+Math.floor(j/12)*0.3;
    const sx=tx+cx,sz=BZ+cz,x=sx+(bx-sx)*age,z=sz+(bz-sz)*age,y=0.36+(by-0.36)*age+2.2*age*(1-age);setI(box,i,x,y,z,1,1,1,age*3);box.setColorAt(i,_c.setHex(P.red))}
   else{setI(box,i,tx+cx,0.36,BZ+cz,1,1,1);box.setColorAt(i,_c.setHex(u>=1?P.mint:P.carton))}}
  box.instanceMatrix.needsUpdate=true;box.instanceColor.needsUpdate=true;
  gates.forEach((G,k)=>{const hot=k<n&&fail.some((f,i)=>f===k&&tx>=gx(k)&&tx-gx(k)<0.9);G.light.material=mat(hot?P.red:P.mint)});
  const left=100-out,NM=[T("Planificación","Planning"),T("Bodega","Warehouse"),T("Transporte","Transport"),T("Facturación","Invoicing")];S.labels=u<1?(n===4?NM.map((nm,k)=>({x:gx(k),y:0.3,z:BZ+6.4,html:nm})):[]):[{x:tx,y:1.4,z:BZ,html:`<span class="g">${left} ${T("perfectos","perfect")}</span>`}];
  S.clock=stage===0?T("Entrando a la cadena","Entering the chain"):T(`Etapa ${stage} de ${n}`,`Stage ${stage} of ${n}`);
  S.cap=T(`Quedan ${B_(left+" de 100")} · ${out} ${out===1?"con problema":"con problemas"}`,`${B_(left+" of 100")} left · ${out} with ${out===1?"a problem":"problems"}`);return true}
 S.info=()=>null;
 S.apply=st2=>{cur=Object.assign({},st2);reset()};S.prewarm=()=>{reset();ms=dur*0.45;at(0)};S.startRun=()=>{reset();S.done=false;S.obs=null};S.progress=()=>ms/dur;
 S.tick=(dt,sp_)=>{ms+=dt*1000*sp_;if(ms>=dur){ms=dur;S.done=true;const ok=fail.filter(f=>f<0).length;S.obs=()=>({v:ok+" "+T("de 100","of 100"),l:T("perfectos en esta corrida","perfect in this run")})}return at(dt)};
 S.ff=st2=>S.apply(st2);
 reset();return S}

/* ---------------- BODEGAS · four cities pool into one central warehouse (reel 9) ----------------
   Each city: three houses, its warehouse and its stack of safety stock (1 box = 10 cajas).
   Run with "juntas": boxes travel to the central pad; the ones the root says are not needed turn mint and are freed.
   Run with "separadas": a week of sales; each city's cushion is used at a different moment (peaks don't coincide). */
function sceneBodegas(st){const NMAX=9,W=24,D=20;const{scene,g}=diorama(W,D,P.grass);
 const RX=7.8,RZ=6.0,CX=0,CZ=0,PAD=[CX+0.2,CZ+2.7],BX=0.44,GAP=0.5,LAY=0.4,PER=10,MAXB=50;
 /* central warehouse */
 rb(g,6.2,0.12,6.2,0xE4E6EC,CX,0.01,CZ+0.3,0.08);rb(g,5.0,2.3,3.0,P.white,CX,0,CZ-0.9,0.1);rb(g,5.3,0.28,3.3,P.blue,CX,2.3,CZ-0.9,0.08);
 rb(g,1.8,1.5,0.08,P.dark,CX,0,CZ+0.62,0.04);rb(g,5.02,0.22,3.02,P.yellow,CX,1.55,CZ-0.9,0.03);
 const cities=[];
 for(let k=0;k<NMAX;k++){const cg=new THREE.Group();g.add(cg);const HC=[0xF1E8D6,0xCFE0F5,0xFFD9B8,0xD8F0D5,0xF7E3A1];
  [[-1.7,-1.3],[-1.7,1.3],[-2.9,0]].forEach(([x,z],q)=>{rb(cg,1.1,0.9,1.1,HC[(k+q)%5],x,0,z,0.12);const r=put(cg,GEO().pyr,mat([P.terracotta,P.roof,0xB4544A][(k+q)%3],{flat:true}),x,1.2,z);r.scale.set(0.9,0.6,0.9);r.rotation.y=Math.PI/4});
  rb(cg,1.8,1.2,1.4,0xDDE2EA,0,0,0,0.08);rb(cg,1.95,0.18,1.55,P.roof,0,1.2,0,0.05);rb(cg,0.06,0.7,0.7,P.dark,0.92,0,0,0.02);
  const pad=flat(cg,1.7,1.7,0xC9CCD6,1.95,0.02,0);
  const road=flat(g,1,0.7,P.road,0,0.018,0);const van=new THREE.Group();g.add(van);rb(van,0.95,0.55,0.55,P.white,-0.1,0.18,0,0.08);rb(van,0.4,0.48,0.55,P.coral,0.5,0.18,0,0.08);
  cities.push({cg,road,van,x:0,z:0,ang:0})}
 const box=inst(g,rboxG(BX,BX*0.85,BX,0.04),new THREE.MeshLambertMaterial({color:0xffffff}),NMAX*MAXB);box.material.userData.own=true;
 const S=mkS(scene,new THREE.Box3(new THREE.Vector3(-W/2,0,-D/2),new THREE.Vector3(W/2,4,D/2)),{root:g,az:0.62,azP:0.34,el:0.74});
 let cur=Object.assign({},st),r=EC.bodegas(cur),ms=0,tt=0,n=1,m=1,J=1,dest=[],phase=[];const dur=5600;
 const L=k=>String.fromCharCode(65+k);
 const stackPos=(k,j)=>{const c=cities[k],lay=Math.floor(j/9),q=j%9,lx=(1.95+((q%3)-1)*GAP/c.sc)*c.sc,lz=(Math.floor(q/3)-1)*GAP,ca=Math.cos(c.ang),sa=Math.sin(c.ang);return[c.x+lx*ca-lz*sa,0.2+lay*LAY,c.z+lx*sa+lz*ca]};
 const centralPos=j=>{const lay=Math.floor(j/16),q=j%16;return[PAD[0]+((q%4)-1.5)*GAP,0.2+lay*LAY,PAD[1]+(Math.floor(q/4)-1.5)*GAP]};
 function layout(){n=Math.max(1,Math.min(NMAX,cur.n));const sc=n<=4?1.25:n<=6?1.0:0.8;
  cities.forEach((c,k)=>{const on=k<n;c.cg.visible=on;c.road.visible=on;c.van.visible=on;if(!on)return;
   const a=n===1?Math.PI*0.25:Math.PI*0.25+2*Math.PI*k/n;c.x=CX+RX*Math.cos(a);c.z=CZ+RZ*Math.sin(a);
   c.ang=Math.atan2(CZ-c.z,CX-c.x);c.sc=sc;c.cg.position.set(c.x,0,c.z);c.cg.rotation.y=-c.ang;c.cg.scale.setScalar(sc);
   const sx=c.x+2.9*sc*Math.cos(c.ang),sz=c.z+2.9*sc*Math.sin(c.ang),ex=CX+3.4*Math.cos(c.ang+Math.PI),ez=CZ+3.0*Math.sin(c.ang+Math.PI),len=Math.hypot(ex-sx,ez-sz);
   c.road.position.set((sx+ex)/2,0.018,(sz+ez)/2);c.road.rotation.y=-Math.atan2(ez-sz,ex-sx);c.road.scale.x=len;c.r0=[sx,sz];c.r1=[ex,ez]})}
 function reset(){r=EC.bodegas(cur);ms=0;layout();m=Math.max(1,Math.min(MAXB,Math.round(cur.b/PER)));J=Math.max(1,Math.round(r.jun/PER));
  /* round-robin so every city sends its share to the central pad; the rest are freed */
  dest=[];const order=[];for(let j=0;j<m;j++)for(let k=0;k<n;k++)order.push([k,j]);order.forEach(([k,j],q)=>{dest[k*MAXB+j]=q<J?q:-1});
  phase=cities.map((_,k)=>(k*0.618)%1);at(0)}
 function anim(dt){tt+=dt||0;cities.forEach((c,k)=>{if(k>=n)return;const ph=((tt/5)+k*0.37)%1,u=ph<0.5?ph*2:2-ph*2,e=u*u*(3-2*u);
  const x=c.r0[0]+(c.r1[0]-c.r0[0])*e,z=c.r0[1]+(c.r1[1]-c.r0[1])*e;c.van.position.set(x,0.05,z);c.van.rotation.y=-Math.atan2(c.r1[1]-c.r0[1],c.r1[0]-c.r0[0])+(ph<0.5?0:Math.PI)})}
 function at(dt){anim(dt);const RUN=dur*0.85,u=Math.min(1,ms/RUN),jun=cur.pol==="juntas";let freed=0,moved=0;
  for(let k=0;k<NMAX;k++)for(let j=0;j<MAXB;j++){const i=k*MAXB+j;if(k>=n||j>=m){setI(box,i,0,-5,0,0,0,0);continue}
   const[sx,sy,sz]=stackPos(k,j);
   if(jun){const d=dest[i],st0=((k*m+j)%(n*m))/(n*m)*0.55,v=Math.max(0,Math.min(1,(u-st0)/0.4)),e=v*v*(3-2*v);
    if(d>=0){const[cx,cy,cz]=centralPos(d);setI(box,i,sx+(cx-sx)*e,sy+(cy-sy)*e+3*e*(1-e),sz+(cz-sz)*e,1,1,1,e*2);box.setColorAt(i,_c.setHex(v>=1?P.mint:P.carton));if(v>0)moved++}
    else{const s=1-Math.max(0,(e-0.6)/0.4);setI(box,i,sx,sy+2.4*e,sz,s,s,s,e*4);box.setColorAt(i,_c.setHex(v>0?P.green:P.carton));if(v>0)freed++}}
   else{/* a week of sales: each city's peak comes at its own moment and eats the top of its own cushion */
    const pk=Math.max(0,Math.sin(Math.PI*Math.max(0,Math.min(1,(u-phase[k]*0.7)/0.3)))),use=Math.round(pk*m*0.6),hot=j>=m-use;
    setI(box,i,sx,sy,sz,1,1,1);box.setColorAt(i,_c.setHex(hot?P.red:P.carton))}}
  box.instanceMatrix.needsUpdate=true;if(box.instanceColor)box.instanceColor.needsUpdate=true;
  const lab=[];for(let k=0;k<n;k++){const c=cities[k];lab.push({x:c.x-1.4*c.sc*Math.cos(c.ang),y:2.4,z:c.z-1.4*c.sc*Math.sin(c.ang),html:T(`Ciudad ${L(k)}`,`City ${L(k)}`)})}
  lab.push({x:CX,y:3.4,z:CZ-0.9,html:u>=1&&jun?`<span class="g">${T("Central","Central")} · ${nf(J*PER)} ${T("cajas","boxes")}</span>`:T("Central","Central")});S.labels=lab;
  S.clock=jun?(u<1?T("Mudando el stock a la central","Moving stock to the central warehouse"):T("Todo en la central","All in the central warehouse")):T(`Día ${Math.min(7,1+Math.floor(u*7))} de 7`,`Day ${Math.min(7,1+Math.floor(u*7))} of 7`);
  S.cap=jun?T(`${B_(nf(r.sep)+" cajas")} separadas · la central necesita ${B_(nf(r.jun))}`,`${B_(nf(r.sep)+" boxes")} apart · the central needs ${B_(nf(r.jun))}`):T(`Cada bodega guarda ${B_(nf(cur.b)+" cajas")} para su mala semana · ${B_(nf(r.sep))} en total`,`Each warehouse keeps ${B_(nf(cur.b)+" boxes")} for its bad week · ${B_(nf(r.sep))} in total`);return true}
 S.info=()=>null;
 S.apply=st2=>{cur=Object.assign({},st2);reset()};S.prewarm=()=>{reset();ms=dur*0.45;at(0)};S.startRun=()=>{reset();S.done=false;S.obs=null};S.progress=()=>ms/dur;
 S.tick=(dt,sp_)=>{ms+=dt*1000*sp_;if(ms>=dur){ms=dur;S.done=true;S.obs=()=>cur.pol==="juntas"?({v:nf(r.jun)+" "+T("cajas","boxes"),l:T(`en la central, en vez de ${nf(r.sep)}`,`in the central warehouse, instead of ${nf(r.sep)}`)}):({v:nf(r.sep)+" "+T("cajas","boxes"),l:T(`en ${n} ${n===1?"bodega":"bodegas"}`,`in ${n} ${n===1?"warehouse":"warehouses"}`)})}return at(dt)};
 S.ff=st2=>S.apply(st2);
 reset();return S}
/* ---------------- ORDENAR · la carga del furgón, parada por parada (reel 12) ----------------
   El piso de carga con un paquete por parada. La puerta está a la derecha. En cada parada se iluminan en amarillo
   los paquetes que en promedio revisas ((m+1)/2 de los m que quedan en el grupo) y en verde el que entregas.
   Revuelto: un solo grupo. Pilas y tercios: grupos de color, el más cercano a la puerta primero. Secuencia: el primero junto a la puerta. */
function sceneOrdenar(st){const NMAX=150,W=14,D=9;const{scene,g}=diorama(W,D,P.asphalt);
 const BX=0.36,GAP=0.42,LAY=0.36,ROWS=5,LAYS=2,PER=ROWS*LAYS,X0=4.2,Z0=-(ROWS-1)*GAP/2;
 /* furgón: piso, paredes, cabina y puerta abierta */
 rb(g,8.6,0.16,2.6,P.white,-0.1,0.25,0,0.05);rb(g,8.6,1.4,0.08,P.white,-0.1,0.41,-1.3,0.03,{noCast:true});rb(g,0.08,1.4,2.6,P.white,-4.4,0.41,0,0.03);
 rb(g,1.6,1.5,2.5,P.coral,-5.3,0.25,0,0.12);rb(g,0.08,0.6,1.8,P.glass,-6.12,1.0,0,0.03);
 [-3.2,2.6].forEach(x=>{[-1.32,1.32].forEach(z=>{const w=put(g,GEO().wheelS,mat(P.dark),x,0.22,z);w.rotation.x=Math.PI/2;w.scale.set(1.1,0.5,1.1)})});
 rb(g,0.08,1.4,1.2,P.white,4.45,0.41,1.9,0.03);
 const box=inst(g,rboxG(BX,BX*0.85,BX,0.04),new THREE.MeshLambertMaterial({color:0xffffff}),NMAX);box.material.userData.own=true;
 const S=mkS(scene,new THREE.Box3(new THREE.Vector3(-6.3,0,-1.6),new THREE.Vector3(4.8,2.2,2.6)),{root:g,az:0.62,azP:0.34,el:0.74});
 const GC=[0x6EC1FF,0xFFC726,0xB79CFF,0xFF9F7A,0x86C97F];
 let cur=Object.assign({},st),r=EC.ordenar(cur),ms=0,n=1,slot=[],grp=[],gIni=[];const dur=7000;
 const pos=p=>{const c=Math.floor(p/PER),q=p%PER;return[X0-c*GAP,0.42+Math.floor(q/ROWS)*LAY,Z0+(q%ROWS)*GAP]};
 function reset(){r=EC.ordenar(cur);ms=0;n=Math.max(1,Math.min(NMAX,cur.n));const gr=r.gr,rng=EC.rngFrom(12);slot=[];grp=[];gIni=[];let off=0;
  gr.forEach((s,gi)=>{const ids=[];for(let j=0;j<s;j++)ids.push(off+j);
   if(s>1)for(let j=ids.length-1;j>0;j--){const q=Math.floor(rng()*(j+1));[ids[j],ids[q]]=[ids[q],ids[j]]}
   for(let j=0;j<s;j++){slot[off+j]=ids[j];grp[off+j]=gi;gIni[off+j]=off}off+=s});at(0)}
 function at(){const RUN=dur*0.88,u=Math.min(1,ms/RUN),i=Math.min(n-1,Math.floor(u*n)),fin=u>=1,gi=grp[i],ini=gIni[i];
  /* lo que queda del grupo de la parada i, en el orden en que lo miras desde la puerta */
  const rest=[];for(let j=i;j<n&&grp[j]===gi;j++)rest.push(j);rest.sort((a,b)=>slot[a]-slot[b]);
  const m=rest.length,look=Math.max(1,Math.round((m+1)/2)),seen=new Set();
  if(!fin){const tpos=rest.indexOf(i),others=rest.filter(j=>j!==i);for(let q=0;q<Math.min(look-1,others.length);q++)seen.add(others[q]);void tpos}
  let acc=0;for(let j=0;j<Math.min(i,n);j++)acc+=r.porParada[j];
  for(let j=0;j<NMAX;j++){if(j>=n||(j<i)||(fin)){setI(box,j,0,-5,0,0,0,0);continue}const[x,y,z]=pos(slot[j]);
   const tgt=j===i,pk=tgt?0.18:seen.has(j)?0.08:0;setI(box,j,x+(tgt?0.25:0),y+pk,z,1,1,1);
   box.setColorAt(j,_c.setHex(tgt?P.mint:seen.has(j)?P.yellow:cur.pol==="revuelto"||cur.pol==="secuencia"?P.carton:GC[grp[j]%GC.length]))}
  box.instanceMatrix.needsUpdate=true;if(box.instanceColor)box.instanceColor.needsUpdate=true;
  S.labels=fin?[{x:0,y:2.2,z:0,html:`<span class="g">${nf(r.tot)} ${T("revisiones","checks")}</span>`}]:[{x:X0+0.6,y:1.9,z:0,html:T("Puerta","Door")}];
  S.clock=fin?T("Ruta terminada","Route done"):T(`Parada ${i+1} de ${n}`,`Stop ${i+1} of ${n}`);
  S.cap=fin?T(`${B_(nf(r.tot)+" revisiones")} en la ruta · revuelto serían ${B_(nf(r.rev))}`,`${B_(nf(r.tot)+" checks")} on the route · mixed would be ${B_(nf(r.rev))}`):T(`Quedan ${m} en ${cur.pol==="revuelto"?"la carga":"este grupo"} · miras ${B_(nf(r.porParada[i],1))} en promedio · llevas ${B_(nf(acc))}`,`${m} left in ${cur.pol==="revuelto"?"the load":"this group"} · you look at ${B_(nf(r.porParada[i],1))} on average · ${B_(nf(acc))} so far`);return true}
 S.info=()=>null;
 S.apply=st2=>{cur=Object.assign({},st2);reset()};S.prewarm=()=>{reset();ms=dur*0.2;at()};S.startRun=()=>{reset();S.done=false;S.obs=null};S.progress=()=>ms/dur;
 S.tick=(dt,sp_)=>{ms+=dt*1000*sp_;if(ms>=dur){ms=dur;S.done=true;S.obs=()=>({v:nf(r.tot)+" "+T("revisiones","checks"),l:cur.pol==="revuelto"?T(`en ${n} paradas, revuelto`,`over ${n} stops, mixed`):T(`en vez de ${nf(r.rev)} revuelto`,`instead of ${nf(r.rev)} mixed`)})}return at()};
 S.ff=st2=>S.apply(st2);
 reset();return S}
/* ---------------- CO2 · la entrega fallida (reel 13) ----------------
   La calle con la tienda a la izquierda y la casa a la derecha. El furgón llega, la peoneta toca y no hay nadie;
   con el motor encendido sale humo gris. Sigue la ruta y, si vuelve el mismo día, deshace el tramo y vuelve a la casa.
   El contador suma los gramos: primero los de la espera, después los de la vuelta. */
function sceneCo2(st){const W=26,D=14;const{scene,g}=diorama(W,D,P.grass);const RZ=1.6,XH=4.2,X0=-8.2,XF=11.0;
 roadX(g,-W/2+0.4,W/2-0.4,RZ,2.6);flat(g,W-0.8,1.1,0xDCD6C8,0,0.01,RZ-1.9);
 /* tienda */
 rb(g,4.6,2.6,3.2,P.wall,-9.6,0,-2.6,0.25);rb(g,4.9,0.3,3.5,P.blue,-9.6,2.6,-2.6,0.1);rb(g,4.62,0.5,0.06,P.yellow,-9.6,1.9,-0.98,0.02);rb(g,1.4,1.5,0.1,P.door,-9.6,0,-0.97,0.03);
 for(let i=0;i<3;i++)rb(g,0.9,0.7,0.9,P.carton,-6.6+i*0.0,i*0.72,-1.2,0.1);
 /* casa */
 rb(g,2.6,1.7,2.4,0xFFD9B8,XH,0,-2.4,0.2);const rf=put(g,GEO().pyr,mat(P.terracotta,{flat:true}),XH,2.3,-2.4);rf.scale.set(2.05,1.0,1.95);rf.rotation.y=Math.PI/4;
 rb(g,0.7,1.15,0.08,P.dark,XH,0,-1.17,0.03);rb(g,0.5,0.4,0.06,P.sky,XH-0.85,0.8,-1.17,0.02);rb(g,0.5,0.4,0.06,P.sky,XH+0.85,0.8,-1.17,0.02);
 [[7.6,-2.6,1],[9.6,-3.4,0.9],[-3.6,-3.0,1.05],[-1.4,-4.2,0.9],[0.6,-2.8,0.8],[12,-4.6,0.9],[-12,4.8,0.9],[-6,5.2,1],[1,5.4,0.95],[7,5.0,1.05],[11.6,4.6,0.85]].forEach(t=>tree(g,t[0],t[1],t[2]));
 const pe=person(g,P.yellow,XH-0.4,RZ-0.6,Math.PI);pe.visible=false;
 const F=new Fleet(g,1,0.62,{van:true});F.col[0]=P.white;
 const NP=14,puff=inst(g,GEO().ball,mat(0x9AA3B5,{op:0.62}),NP,false);puff.material.userData.own=true;
 const IQ=new Icons(g,"q",1,1.3),IC=new Icons(g,"clock",1,1.2),IK=new Icons(g,"check",1,1.2);
 const S=mkS(scene,new THREE.Box3(new THREE.Vector3(-W/2,0,-D/2),new THREE.Vector3(W/2,3,D/2)),{root:g,az:0.62,azP:0.34,el:0.72});
 let cur=Object.assign({},st),r=EC.co2(cur),ms=0,tt=0;const dur=8000;
 const lerp=(a,b,u)=>a+(b-a)*Math.max(0,Math.min(1,u));
 function at(dt){tt+=dt||0;const u=Math.min(1,ms/dur),on=cur.pol!=="apagado",vec=cur.pol==="vecino",back=cur.pol!=="manana"&&!vec&&r.fs>0;
  /* fases: llegar 0–0,2 · esperar 0,2–0,5 · seguir 0,5–0,66 · volver 0,66–0,84 · irse 0,84–1 */
  let x,ang=0,ph;if(u<0.2){x=lerp(X0,XH,ease(u/0.2));ph=0}else if(u<0.5){x=XH;ph=1}else if(u<0.66){x=lerp(XH,XF,ease((u-0.5)/0.16));ph=2}
  else if(back&&u<0.84){x=lerp(XF,XH,ease((u-0.66)/0.18));ang=Math.PI;ph=3}else if(back){x=lerp(XH,XF,ease((u-0.84)/0.16));ph=4}else{x=XF;ph=5}
  F.go(0,x,RZ-0.5,ang,true);F.snap(0);F.commit();
  const w=ph===1?(u-0.2)/0.3:0;pe.visible=ph===1;if(ph===1){const k=w<0.35?w/0.35:w<0.7?1:1-(w-0.7)/0.3;if(vec&&w>=0.55){const q=Math.min(1,(w-0.55)/0.35);pe.position.set(lerp(XH-0.4,XH+3.2,q),0,-0.95);pe.rotation.y=-Math.PI/2}else{pe.position.set(XH-0.4,0,lerp(RZ-1.2,-0.95,k));pe.rotation.y=k<1&&w>=0.7?0:Math.PI}}
  const smoke=on&&ph===1;for(let i=0;i<NP;i++){if(!smoke){setI(puff,i,0,-9,0,0.01,0.01,0.01);continue}const q=((tt*0.6+i/NP)%1);setI(puff,i,x-1.55-q*0.5,0.25+q*1.8,RZ-0.5+Math.sin(i*2.3)*0.25,0.18+q*0.45,0.18+q*0.45,0.18+q*0.45)}
  puff.instanceMatrix.needsUpdate=true;
  IQ.set(0,XH,2.0,-0.9,ph===1&&w>0.3);IC.set(0,x,2.1,RZ-0.5,ph===1&&on);IK.set(0,vec?XH+3.2:XH,2.0,-0.9,ph===4||(vec&&ph>=1&&w>0.85)||(vec&&ph>=2));
  IQ.step(dt||0.016,S.cam.quaternion,tt);IC.step(dt||0.016,S.cam.quaternion,tt);IK.step(dt||0.016,S.cam.quaternion,tt);
  const gE=r.gEsp*(ph===0?0:ph===1?w:1),gB=vec?0:back?(ph>=3?r.gV*Math.min(1,(u-0.66)/0.18):0):(ph===5?r.gV:0),gs=Math.min(r.g,gE+gB);
  S.clock=`${nf(gs)} g CO2`;
  S.labels=u>=1?[{x:0,y:3.2,z:-D/2+1,html:`<span class="y">${nf(r.t,1)} t ${T("al año","a year")}</span>`}]:[{x:-9.6,y:3.4,z:-2.6,html:T("Tienda","Store")}];
  S.cap=u>=1?T(`${B_(nf(r.g)+" g")} por fallida · ${B_(nf(r.fall))} fallidas al día · ${B_(nf(r.t,1)+" t")} al año`,`${B_(nf(r.g)+" g")} per failed delivery · ${B_(nf(r.fall))} failed a day · ${B_(nf(r.t,1)+" t")} a year`)
   :ph<=1?(ph===0?T("El furgón llega con tu pedido.","The van arrives with your order."):on?T(`La peoneta toca y llama; el conductor espera ${B_("con el motor encendido")} · ${B_(nf(gE)+" g")}`,`The helper knocks and calls; the driver waits ${B_("with the engine running")} · ${B_(nf(gE)+" g")}`):T(`La peoneta toca y llama; el conductor ${B_("apagó el motor")} · 0 g`,`The helper knocks and calls; the driver ${B_("turned the engine off")} · 0 g`))
   :ph===2?(vec?T(`No hay nadie: ${B_("se lo deja al vecino")}. Esta no vuelve.`,`Nobody's home: ${B_("left with the neighbour")}. This one doesn't come back.`):T("No hay nadie. El furgón sigue la ruta…","Nobody's home. The van carries on…")):ph===5&&vec?T(`Con vecino, ${B_("37,5 % menos vueltas")} (Ofcom) · ${B_(nf(r.g)+" g")} en promedio por fallida`,`With a neighbour, ${B_("37.5 % fewer trips back")} (Ofcom) · ${B_(nf(r.g)+" g")} on average per failure`):ph===5?T(`Queda para mañana: ${B_("+"+nf(EC.C2.SIG,2)+" km")} en la ruta del día siguiente`,`Left for tomorrow: ${B_("+"+nf(EC.C2.SIG,2)+" km")} on the next day's route`)
   :T(`…y vuelve el mismo día: ${B_(nf(2*cur.d,1)+" km")} de más · ${B_(nf(gs)+" g")} en total`,`…and comes back the same day: ${B_(nf(2*cur.d,1)+" km")} extra · ${B_(nf(gs)+" g")} in total`);return true}
 S.info=()=>null;
 S.apply=st2=>{cur=Object.assign({},st2);r=EC.co2(cur);ms=0;at(0)};S.prewarm=()=>{r=EC.co2(cur);ms=dur*0.32;at(0.016)};S.startRun=()=>{r=EC.co2(cur);ms=0;S.done=false;S.obs=null};S.progress=()=>ms/dur;
 S.tick=(dt,sp_)=>{ms+=dt*1000*sp_;if(ms>=dur){ms=dur;S.done=true;S.obs=()=>cur.pol==="vecino"?({v:nf(r.gEsp)+" g",l:T("en esta: quedó con el vecino, no vuelve","on this one: left with the neighbour, no trip back")}):({v:nf(r.g)+" g",l:T("en esta entrega fallida","on this failed delivery")})}return at(dt)};
 S.ff=st2=>S.apply(st2);
 r=EC.co2(cur);at(0);return S}
/* ---------------- AIRE · pagas por el aire (reel 17) ----------------
   La caja (1 unidad = 10 cm) baja a la balanza, se mide largo, ancho y alto y, con «achicar», pierde 5 cm por lado (queda la silueta
   de la original). Al final aparece el bloque naranjo: el volumen que tu peso real alcanza a pagar (kg × divisor); lo demás es aire. */
function sceneAire(st){const U=0.1,r0=EC.aire(st);const W=Math.max(12,r0.L0*U+8),D=Math.max(10,r0.A0*U+5);const{scene,g}=diorama(W,D,P.slabTop);const PY=0.35;
 rb(g,r0.L0*U+0.9,PY,r0.A0*U+0.9,P.dark,0,0,0,0.12);const XD=-(r0.L0*U/2+1.35),ZD=r0.A0*U/2-0.2;rb(g,1.9,0.8,0.22,0x10151F,XD,0,ZD,0.06);rb(g,1.5,0.4,0.04,P.mint,XD,0.24,ZD+0.12,0.02,{basic:true});
 for(let i=-3;i<=3;i++){flat(g,0.04,D-1.2,0x3A4766,i*2,0.005,0);}
 const U1=rboxG(1,1,1,0.04);const box=put(g,U1,mat(P.carton,{op:0.55}),0,0,0),tape=put(g,U1,mat(0xC79A5B),0,0,0,false),ghost=put(g,U1,mat(P.white,{op:0.13}),0,0,0,false),inner=put(g,U1,mat(P.coral),0,0,0);
 const bm=[P.sky,P.yellow,P.mint].map(c=>put(g,U1,mat(c,{basic:true}),0,-5,0,false));
 const S=mkS(scene,new THREE.Box3(new THREE.Vector3(-W/2,0,-D/2),new THREE.Vector3(W/2,Math.max(3.5,r0.H0*U+2),D/2)),{root:g,az:0.62,azP:0.34,el:0.66});
 let cur=Object.assign({},st),r=r0,ms=0;const dur=6000;const lerp=(a,b,u)=>a+(b-a)*Math.max(0,Math.min(1,u));
 function at(){const u=Math.min(1,ms/dur),ach=r.ach,kq=Math.cbrt(Math.min(1,r.kg*r.div/Math.max(1,r.V)));
  const drop=u<0.18?(1-ease(u/0.18))*4:0,sh=ach?ease(Math.max(0,Math.min(1,(u-0.45)/0.2))):0;
  const l=lerp(r.L0,r.L,sh)*U,a=lerp(r.A0,r.A,sh)*U,h=lerp(r.H0,r.H,sh)*U,y0=PY+drop;
  box.scale.set(l,h,a);box.position.set(0,y0+h/2,0);tape.scale.set(l*1.01,0.03,Math.min(0.5,a*0.3));tape.position.set(0,y0+h+0.005,0);
  ghost.visible=ach&&u>=0.45;ghost.scale.set(r.L0*U,r.H0*U,r.A0*U);ghost.position.set(0,PY+r.H0*U/2,0);
  const gi=u<0.65?0:ease(Math.min(1,(u-0.65)/0.2));inner.visible=gi>0;inner.scale.set(Math.max(0.001,l*kq*gi),Math.max(0.001,h*kq*gi),Math.max(0.001,a*kq*gi));inner.position.set(0,PY+h*kq*gi/2+0.002,0);
  const mp=u<0.22?0:ease(Math.min(1,(u-0.22)/0.23)),t=0.07;
  bm[0].scale.set(Math.max(0.001,l*mp),t,t);bm[0].position.set(0,PY+0.04,a/2+0.22);bm[1].scale.set(t,t,Math.max(0.001,a*mp));bm[1].position.set(l/2+0.22,PY+0.04,0);
  bm[2].scale.set(t,Math.max(0.001,h*mp),t);bm[2].position.set(l/2+0.22,PY+h*mp/2,a/2+0.22);bm.forEach(m=>m.visible=mp>0);
  const kgS=u<0.14?0:r.kg*Math.min(1,(u-0.14)/0.08),cm=x=>Math.round(x/U);
  S.clock=u<0.45?`${kgf(kgS)} kg ${T("en la balanza","on the scale")}`:`${nf(r.cob)} kg ${T("cobrados","charged")}`;
  const lab=[{x:XD,y:1.2,z:ZD+0.3,html:`${kgf(kgS)} kg`}];
  if(u<1&&mp>0)lab.push({x:0,y:PY+0.1,z:a/2+0.7,html:`<span style="color:#6EC1FF">${cm(l)} cm</span>`},{x:l/2+0.9,y:PY+0.1,z:-a/4,html:`<span style="color:#FFC726">${cm(a)} cm</span>`},{x:l/2+0.5,y:PY+h/2,z:a/2+0.5,html:`<span style="color:#4BE38A">${cm(h)} cm</span>`});
  if(u>=1)lab.push({x:0,y:PY+r.H0*U+1.9,z:0,html:`${r.L}×${r.A}×${r.H} cm → <span class="y">${nf(r.cob)} kg ${T("cobrados","charged")}</span>`});S.labels=lab;
  S.cap=u>=1?T(`${B_(nf(r.cob)+" kg")} cobrados · ${B_(vecesT(r.veces))} · ${B_(kgf(r.aireKg)+" kg")} de aire`,`${B_(nf(r.cob)+" kg")} charged · ${B_(vecesT(r.veces))} · ${B_(kgf(r.aireKg)+" kg")} of air`)
   :u<0.22?T(`La caja sube a la balanza: ${B_(kgf(r.kg)+" kg")} reales.`,`The box goes on the scale: ${B_(kgf(r.kg)+" kg")} actual.`)
   :u<0.45?T(`Se mide: ${r.L0}×${r.A0}×${r.H0} cm = ${B_(nf(r.V0)+" cm³")} ÷ ${nf(r.div)} = ${B_(kgf(r.vol0)+" kg")} de volumen`,`Measured: ${r.L0}×${r.A0}×${r.H0} cm = ${B_(nf(r.V0)+" cm³")} ÷ ${nf(r.div)} = ${B_(kgf(r.vol0)+" kg")} of volume`)
   :u<0.65?(ach?T(`5 cm menos por lado: ${r.L}×${r.A}×${r.H} cm = ${B_(kgf(r.vol)+" kg")} de volumen`,`5 cm less per side: ${r.L}×${r.A}×${r.H} cm = ${B_(kgf(r.vol)+" kg")} of volume`):T(`Se cobra el mayor, hacia arriba al kilo: ${B_(nf(r.cob)+" kg")}`,`The greater is charged, rounded up to the kilo: ${B_(nf(r.cob)+" kg")}`))
   :r.aireFr>0?T(`El bloque naranjo es lo que paga tu peso; el resto, ${B_(nf(r.aireFr*100)+" %")} de la caja, es aire`,`The orange block is what your weight pays for; the rest, ${B_(nf(r.aireFr*100)+" %")} of the box, is air`):T(`Aquí manda el peso: la caja va llena, ${B_("sin aire que pagar")}`,`Here weight rules: the box is full, ${B_("no air to pay for")}`);return true}
 S.info=()=>null;
 S.apply=st2=>{cur=Object.assign({},st2);r=EC.aire(cur);ms=0;at()};S.prewarm=()=>{r=EC.aire(cur);ms=dur*0.5;at()};S.startRun=()=>{r=EC.aire(cur);ms=0;S.done=false;S.obs=null};S.progress=()=>ms/dur;
 S.tick=(dt,sp_)=>{ms+=dt*1000*sp_;if(ms>=dur){ms=dur;S.done=true;S.obs=null}return at()};
 S.ff=st2=>S.apply(st2);
 at();return S}
/* ---------------- LOCKER · furgón contra furgón (reel 14) ----------------
   Dos calles con las mismas casas, como en el reel. Abajo, el furgón de domicilio sin firma para en cada puerta (la referencia).
   Arriba, tu ruta: con lockers para solo en los dos lockers y llena k celdas en cada uno; con ruta mixta para también en las casas
   que no usan el locker. El reloj corre el turno de 8 horas (primero 30 min de carga) y los contadores suben hasta los paquetes del modelo. */
function sceneLocker(st){const W=26,D=13;const{scene,g}=diorama(W,D,P.grass);const ZA=3.6,ZB=-1.6,X0=-12.2,XF=12.2,NH=7,XS=[-9,-6,-3,0,3,6,9],XL=[-4.5,4.5];
 roadX(g,-W/2+0.4,W/2-0.4,ZA,2.2);roadX(g,-W/2+0.4,W/2-0.4,ZB,2.2);flat(g,W-0.8,0.7,0xDCD6C8,0,0.01,ZA-1.45);flat(g,W-0.8,0.7,0xDCD6C8,0,0.01,ZB-1.45);
 const COLS=[0xFFD9B8,0xF1E8D6,0xCFE3F2,0xFFE7A8,0xE4D6F2,0xD8EED8,0xFFD0C2];
 const casa=(x,z,c)=>{rb(g,1.7,1.15,1.4,c,x,0,z,0.14);const rf=put(g,GEO().pyr,mat(P.terracotta,{flat:true}),x,1.6,z);rf.scale.set(1.35,0.8,1.2);rf.rotation.y=Math.PI/4;rb(g,0.45,0.75,0.06,P.dark,x,0,z+0.71,0.03)};
 XS.forEach((x,i)=>{casa(x,ZA-2.35,COLS[i]);casa(x,ZB-2.6,COLS[(i+3)%NH])});
 /* lockers: mueble azul oscuro de 4 × 3 celdas que se ponen naranjas al llenarse */
 const CEL=[];XL.forEach(x=>{const z=ZB-1.95;rb(g,1.6,1.45,0.6,0x1F335C,x,0,z,0.06);rb(g,1.7,0.12,0.7,0x14213D,x,1.45,z,0.03);const cs=[];
  for(let r_=0;r_<3;r_++)for(let c=0;c<4;c++){const m=new THREE.MeshLambertMaterial({color:0xB3BDCC});m.userData.own=true;cs.push(rb(g,0.32,0.36,0.04,m,x-0.54+c*0.36,0.14+r_*0.42,z+0.31,0.02,{noCast:true}))}CEL.push(cs)});
 [[-11.5,-5.6,0.9],[-7.5,-5.9,1],[-1.5,-5.7,0.85],[1.5,-5.9,0.95],[7.5,-5.6,0.9],[11.5,-5.8,1]].forEach(t=>tree(g,t[0],t[1],t[2]));
 const pe=person(g,P.sky,XS[2],ZB-2.0,0);pe.visible=false;
 const F=new Fleet(g,2,0.6,{van:true});F.col[0]=P.white;F.col[1]=P.white;
 const IK=new Icons(g,"check",2*NH,1.0);
 const S=mkS(scene,new THREE.Box3(new THREE.Vector3(-W/2,0,-D/2),new THREE.Vector3(W/2,3,D/2)),{root:g,az:0.5,azP:0.3,el:0.78});
 let cur=Object.assign({},st),r=EC.locker(cur),ms=0,tt=0,TA=null,TB=null,homeB=[],usaB=[];const dur=8000,LOAD=30/480;
 /* un recorrido: tramos de viaje y paradas; cada parada pesa como 2,2 unidades de calle (en el locker, más con más paquetes) */
 function track(stops){const sg=[];let x=X0;stops.forEach((s,j)=>{sg.push({m:1,a:x,b:s.x,len:Math.abs(s.x-x)});sg.push({m:0,s:s,j,len:s.w});x=s.x});sg.push({m:1,a:x,b:XF,len:XF-x});return{sg,tot:sg.reduce((a,q)=>a+q.len,0)}}
 function where(tr,v){let t=Math.max(0,Math.min(1,v))*tr.tot;for(let i=0;i<tr.sg.length;i++){const q=tr.sg[i];if(t<=q.len||i===tr.sg.length-1){if(q.m)return{x:q.a+(q.b-q.a)*Math.min(1,q.len?t/q.len:1),j:-1,done:i};return{x:q.s.x,j:q.j,w:q.len?t/q.len:1,done:i}}t-=q.len}return{x:XF,j:-1,done:tr.sg.length}}
 function build(){r=EC.locker(cur);const pol=cur.pol;TA=track(XS.map(x=>({x,w:2.2,home:true})));
  const m=pol==="locker"?NH:pol==="mixta"?Math.round(r.p*NH):0;usaB=XS.map((x,i)=>m>0&&Math.floor((i+1)*m/NH)>Math.floor(i*m/NH));homeB=XS.map((x,i)=>pol==="domicilio"||(pol==="mixta"&&!usaB[i]));
  const st_=[];XS.forEach((x,i)=>{if(homeB[i])st_.push({x,w:2.2,home:true,i})});if(pol!=="domicilio"&&(pol==="locker"||r.p>0))XL.forEach((x,i)=>st_.push({x,w:2.2+Math.min(12,r.k)*0.25,locker:i}));st_.sort((a,b)=>a.x-b.x);TB=track(st_)}
 function at(dt){tt+=dt||0;const u=Math.min(1,ms/dur),v=u<LOAD?0:(u-LOAD)/(1-LOAD);
  const a=where(TA,v),b=where(TB,v);F.go(0,a.x,ZA-0.5,0,true);F.go(1,b.x,ZB-0.5,0,true);F.snap(0);F.snap(1);F.commit();
  /* entregas hechas: casa con ✓ cuando la parada pasa la mitad */
  const doneA=i=>{const k=TA.sg.findIndex(q=>!q.m&&q.s.x===XS[i]);return v>=1||a.done>k||(a.done===k&&a.w>0.5)};
  const doneB=s=>{const k=TB.sg.findIndex(q=>!q.m&&q.s===s);return k>=0&&(v>=1||b.done>k||(b.done===k&&b.w>0.5))};
  XS.forEach((x,i)=>{IK.set(i,x,2.3,ZA-2.35,u>LOAD&&doneA(i));const s=TB.sg.find(q=>!q.m&&q.s.home&&q.s.i===i);IK.set(NH+i,x,2.3,ZB-2.6,!!s&&u>LOAD&&doneB(s.s))});
  IK.step(dt||0.016,S.cam.quaternion,tt);
  /* celdas del locker: se llenan mientras el furgón está detenido; quedan llenas */
  XL.forEach((x,li)=>{const k=TB.sg.findIndex(q=>!q.m&&q.s.locker===li),q=k>=0?TB.sg[k]:null;let f=0;if(q){f=b.done>k||v>=1?1:b.done===k?b.w:0}const n=Math.min(12,r.k),on=Math.round(f*n);CEL[li].forEach((c,j)=>c.material.color.setHex(j<on?0xFF9E1F:0xB3BDCC))});
  /* alguien camina de su casa al locker (depende de que el cliente camine) */
  const walk=cur.pol!=="domicilio"&&(cur.pol==="locker"||r.p>0)&&v>0.55;pe.visible=walk;if(walk){const w=Math.min(1,(v-0.55)/0.35),hx=XS[1],lx=XL[0]-0.2;pe.position.set(hx+(lx-hx)*w,0,ZB-1.6);pe.rotation.y=Math.PI/2}
  const cA=Math.round(r.nH*v),cB=Math.round(r.n*v),min=Math.round(480*u),hh=8+Math.floor(min/60),mm=min%60;
  S.clock=`${hh}:${String(mm).padStart(2,"0")} · ${nf(cB)} ${T("paquetes","parcels")}`;
  const lblB=cur.pol==="domicilio"?T("Tu ruta","Your route"):cur.pol==="mixta"?T("Ruta mixta","Mixed route"):T(`${r.k} por locker`,`${r.k} per locker`);
  /* rótulos: arriba en el teléfono (la escena gira); a la izquierda en pantalla ancha, lejos de la tarjeta de la derecha */const lx=S.root&&S.root.rotation.y?W/2-3.4:-W/2+3.4;
  S.labels=[{x:lx,y:1.2,z:ZB,html:`${lblB} · <span class="y">${nf(cB)}</span>`},{x:lx,y:1.2,z:ZA,html:`${T("Domicilio","Home")} · <span class="y">${nf(cA)}</span>`}];
  S.cap=u>=1?T(`Turno de 8 horas: ${B_(nf(r.nH))} paquetes a domicilio, ${B_(nf(r.n))} en tu ruta · ${B_(nf(r.c,2)+" €")} por paquete`,`8-hour shift: ${B_(nf(r.nH))} parcels at home, ${B_(nf(r.n))} on your route · ${B_(nf(r.c,2)+" €")} per parcel`)
   :u<LOAD?T(`${B_("Carga en el terminal")}: 30 minutos antes de salir`,`${B_("Loading at the terminal")}: 30 minutes before leaving`)
   :cur.pol==="domicilio"?T("Los dos furgones paran en cada puerta: un paquete por parada.","Both vans stop at every door: one parcel per stop.")
   :cur.pol==="mixta"?T(`El de domicilio para en cada puerta. En tu ruta, ${B_(nf(r.p*100)+" de cada 100")} van al locker y el resto a su puerta.`,`The home van stops at every door. On your route, ${B_(nf(r.p*100)+" out of 100")} go to the locker and the rest to their door.`)
   :T(`El de domicilio para en cada puerta. El tuyo deja ${B_(r.k+" por locker")}: para menos y entrega más.`,`The home van stops at every door. Yours leaves ${B_(r.k+" per locker")}: it stops less and delivers more.`);return true}
 S.info=()=>null;
 S.apply=st2=>{cur=Object.assign({},st2);build();ms=0;at(0)};S.prewarm=()=>{build();ms=dur*0.4;at(0.016)};S.startRun=()=>{build();ms=0;S.done=false;S.obs=null};S.progress=()=>ms/dur;
 /* sin «Esta partida»: el modelo no tiene azar, el número grande no es un promedio */
 S.tick=(dt,sp_)=>{ms+=dt*1000*sp_;if(ms>=dur){ms=dur;S.done=true;S.obs=null}return at(dt)};
 S.ff=st2=>S.apply(st2);
 build();at(0);return S}
/* ---------------- VECINO · la ruta: el furgón recorre la ruta de la regla elegida ---------------- */
function sceneVecino(st){const M=24,W=M+5,D=M+5;const{scene,g}=diorama(W,D,P.asphalt);
 const XZ=q=>[(q[0]-0.5)*M,(0.5-q[1])*M];
 const nb=6,pb=M/nb;for(let i=0;i<nb;i++)for(let j=0;j<nb;j++)rb(g,pb*0.82,0.06,pb*0.82,0xDCD6C8,-M/2+pb*(i+0.5),0,-M/2+pb*(j+0.5),0.05,{noCast:true});
 const rng=EC.rngFrom(21),BC=[0xF1E8D6,0xCFE0F5,0xFFD9B8,0xD8F0D5,0xE3DAF5];
 const casa=inst(g,rboxG(0.55,0.42,0.55,0.08),new THREE.MeshLambertMaterial({color:0xffffff}),160);casa.material.userData.own=true;
 const techo=inst(g,GEO().pyr,new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),160);techo.material.userData.own=true;
 const tr=inst(g,rboxG(1,0.07,0.16,0.02),new THREE.MeshBasicMaterial({color:0xffffff}),160,false);tr.material.userData.own=true;
 const dep=new THREE.Group();rb(dep,2.0,1.0,1.4,P.wall,0,0,0,0.1);rb(dep,2.1,0.16,1.5,P.blue,0,1.0,0,0.05);rb(dep,0.06,0.6,0.8,P.door,1.02,0,0,0.02);g.add(dep);
 const F=new Fleet(g,1,0.5,{van:true});F.col[0]=P.white;
 const S=mkS(scene,new THREE.Box3(new THREE.Vector3(-M/2,0,-M/2),new THREE.Vector3(M/2,2.5,M/2)),{root:g,az:0.62,azP:0.4,el:0.95});
 let cur=Object.assign({},st),r=EC.vecino(cur),ms=0,tt=0;const dur=7000;let segs=[],acc=[],tot=0;
 const COL={vecino:P.red,descruzar:P.yellow,mejor:P.mint};
 function build(){r=EC.vecino(cur);const p=r.p,o=r.orden;segs=[];acc=[];tot=0;
  for(let i=0;i<o.length;i++){const a=XZ(p[o[i]]),b=XZ(p[o[(i+1)%o.length]]),l=Math.hypot(b[0]-a[0],b[1]-a[1]);segs.push([a,b,l]);acc.push(tot);tot+=l}
  const[dx,dz]=XZ(p[0]);dep.position.set(dx,0,dz-0.9);
  for(let k=0;k<160;k++){if(k<p.length-1){const[x,z]=XZ(p[k+1]),h=0.42;setI(casa,k,x,0.06,z,1,1,1,Math.PI/4);setI(techo,k,x,0.06+h+0.17,z,0.62,0.4,0.62,Math.PI/4)}else{setI(casa,k,0,-9,0,0.01,0.01,0.01);setI(techo,k,0,-9,0,0.01,0.01,0.01)}}
  casa.instanceMatrix.needsUpdate=true;techo.instanceMatrix.needsUpdate=true}
 function at(dt){tt+=dt||0;const u=Math.min(1,ms/(dur*0.92)),d=u*tot,o=r.orden,n=o.length;let vx=0,vz=0,va=0,vis=0;
  for(let i=0;i<160;i++){if(i<n){const[a,b,l]=segs[i],f=Math.max(0,Math.min(1,(d-acc[i])/(l||1)));if(f>0){const mx=a[0]+(b[0]-a[0])*f/2,mz=a[1]+(b[1]-a[1])*f/2,ang=Math.atan2(-(b[1]-a[1]),b[0]-a[0]);setI(tr,i,mx,0.14,mz,Math.max(0.01,l*f),1,1,ang);
     tr.setColorAt(i,_c.setHex(COL[cur.pol]||P.red));if(f<1||i===n-1){vx=a[0]+(b[0]-a[0])*f;vz=a[1]+(b[1]-a[1])*f;va=ang}vis=i+1}else setI(tr,i,0,-9,0,0.01,1,1)}else setI(tr,i,0,-9,0,0.01,1,1)}
  tr.instanceMatrix.needsUpdate=true;if(tr.instanceColor)tr.instanceColor.needsUpdate=true;
  const hecho=new Set(o.slice(0,Math.min(n,vis+1)));for(let k=1;k<r.p.length&&k<=160;k++){const on=u>0&&hecho.has(k);techo.setColorAt(k-1,_c.setHex(on?P.mint:P.terracotta));casa.setColorAt(k-1,_c.setHex(BC[k%5]))}
  if(techo.instanceColor)techo.instanceColor.needsUpdate=true;if(casa.instanceColor)casa.instanceColor.needsUpdate=true;
  if(u<=0){const[dx,dz]=XZ(r.p[0]);vx=dx;vz=dz}F.go(0,vx,vz,va,true);F.snap(0);F.commit();
  const km=u*r.km;S.clock=`${nf(km,1)} km`;
  S.labels=u>=1?[{x:0,y:2.4,z:-M/2-0.6,html:`<span class="${cur.pol==="vecino"?"y":"g"}">${nf(r.km,1)} km</span>`}]:[];
  S.cap=u>=1?T(`Vuelta completa: ${B_(nf(r.km,1)+" km")} · la mejor encontrada hace ${nf(r.kB,1)} km`,`Full loop: ${B_(nf(r.km,1)+" km")} · the best found does ${nf(r.kB,1)} km`):cur.pol==="vecino"?T(`El furgón va siempre a la parada más cercana · ${r.cNN} ${r.cNN===1?"cruce":"cruces"} en la ruta`,`The van always goes to the nearest stop · ${r.cNN} ${r.cNN===1?"crossing":"crossings"} in the route`):cur.pol==="descruzar"?T(`La ruta del vecino, con cada cruce deshecho · ${r.c2} cruces`,`The neighbor route, with every crossing undone · ${r.c2} crossings`):T("La mejor ruta que encontramos para esta ciudad","The best route we found for this city");return true}
 S.info=()=>null;
 S.apply=st2=>{cur=Object.assign({},st2);build();ms=0;at(0)};S.prewarm=()=>{build();ms=dur*0.4;at(0)};S.startRun=()=>{build();ms=0;S.done=false;S.obs=null};S.progress=()=>ms/dur;
 S.tick=(dt,sp_)=>{ms+=dt*1000*sp_;if(ms>=dur){ms=dur;S.done=true;S.obs=()=>({v:nf(r.km,1)+" km",l:T("en esta vuelta","on this loop")})}return at(dt)};
 S.ff=st2=>S.apply(st2);
 build();at(0);return S}

/* ---------------- INVENTARIO FANTASMA · la pantalla contra el estante (reel 15) ----------------
   Un año típico de los 500 (la corrida mediana): cada contenedor del estante es una unidad. Los sólidos están de verdad; los
   translúcidos solo existen en la pantalla (registro − físico). Arriba, el año en dos líneas: lo que dice el sistema y lo que hay. */
function sceneInventario(st){const W=11,D=5;const{scene,g}=diorama(W,D,P.slabTop);
 const COLS=10,ROWS=2,LV=5,CAP=COLS*ROWS*LV,SW=0.56,XC=1.1,X0=XC-((COLS-1)*SW)/2,LY=[0.12,0.9,1.68,2.46,3.24];
 for(const y of LY)rb(g,COLS*SW+0.3,0.07,ROWS*0.55+0.25,P.wood,XC,y-0.07,0,0.02);
 for(const x of [X0-0.42,X0+(COLS-1)*SW+0.42])for(const z of [-0.62,0.62])rb(g,0.1,3.75,0.1,0x8A6440,x,0,z,0.02);
 const U1=rboxG(0.46,0.4,0.46,0.06),real=inst(g,U1,mat(P.sky),CAP),ghost=inst(g,U1,mat(P.white,{op:0.4}),CAP,false);
 const XM=-4.4;rb(g,0.12,1.6,0.12,P.dark,XM,0,0,0.03);rb(g,2.0,1.3,0.16,0x10151F,XM,1.6,0,0.06);const face=put(g,rboxG(1.7,1.0,0.02,0.01),mat(P.mint,{basic:true}),XM,2.25,0.1,false);
 const S=mkS(scene,new THREE.Box3(new THREE.Vector3(-W/2,0,-D/2),new THREE.Vector3(W/2,6.2,D/2)),{root:g,long:"z",az:0.32,azP:0.3,el:0.4});
 let cur=Object.assign({},st),r=EC.inventario(cur),ms=0;const dur=9000,R=EC.INV.R;
 const slot=i=>{const lv=Math.floor(i/(COLS*ROWS)),k=i%(COLS*ROWS),row=Math.floor(k/COLS),col=k%COLS;return[X0+col*SW,LY[lv]+0.2,row===0?0.28:-0.28]};
 function chart(d){const T_=r.tipico,w=240,h=74,mx=Math.max(100,...T_.xr.map(v=>Math.max(0,v)),...T_.x),X=i=>(i/364*w).toFixed(1),Y=v=>(h-Math.max(0,v)/mx*h).toFixed(1);
  const pts=a=>a.slice(0,d).map((v,i)=>X(i)+","+Y(v)).join(" "),pl=(a,c)=>`<polyline fill="none" stroke="${c}" stroke-width="1.3" points="${pts(a)}"/>`,area=a=>`<polygon fill="rgba(75,227,138,.55)" points="0,${h} ${pts(a)} ${X(d-1)},${h}"/>`;
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="display:block;background:rgba(16,21,31,.72);border-radius:6px"><line x1="0" x2="${w}" y1="${Y(R)}" y2="${Y(R)}" stroke="#FFC726" stroke-dasharray="3 3" stroke-width="1"/>${area(T_.x)}${pl(T_.xr,"#FAFAF5")}</svg><div style="font-size:11px;line-height:1.3"><span style="color:#FAFAF5">— ${T("pantalla","screen")}</span> · <span style="color:#4BE38A">■ ${T("estante","shelf")}</span> · <span style="color:#FFC726">- - ${T("punto de pedido","reorder point")} 41</span></div>`}
 function at(){const u=Math.min(1,ms/dur),T_=r.tipico,d=Math.max(1,Math.min(365,Math.ceil(u*365))),i=d-1,x=Math.round(T_.x[i]),xs=Math.max(0,Math.round(T_.xr[i]));
  let lost=0,vac=0;for(let k=0;k<d;k++){lost+=T_.lost[k];if(T_.lost[k]>0)vac++}
  const nr=Math.min(CAP,x),ng=Math.max(0,Math.min(CAP,xs)-nr);
  for(let k=0;k<CAP;k++){const[px,py,pz]=slot(k);if(k<nr)setI(real,k,px,py,pz,1,1,1);else setI(real,k,0,-9,0,0.01,0.01,0.01);
   if(k>=nr&&k<nr+ng)setI(ghost,k,px,py,pz,1,1,1);else setI(ghost,k,0,-9,0,0.01,0.01,0.01)}
  real.instanceMatrix.needsUpdate=true;ghost.instanceMatrix.needsUpdate=true;
  const cong=x<=0&&xs>R;face.material=mat(cong?P.red:P.mint,{basic:true});
  S.clock=T(`día ${d} de 365`,`day ${d} of 365`);
  S.labels=[{x:XM,y:3.2,z:0,html:`${T("Pantalla","Screen")}: <span class="${cong?"y":"g"}">${nf(xs)}</span>`},{x:XC,y:4.05,z:0,html:`${T("Estante","Shelf")}: <span class="${x>0?"g":"y"}">${nf(x)}</span>`},{x:0,y:6.0,z:0,html:chart(d)}];
  S.cap=u>=1?T(`Un año típico: ${B_(nf(r.tq*100,1)+" %")} de ventas perdidas y ${B_(nf(r.tvac)+" días")} con el estante vacío · promedio de 500 años: ${B_(nf(r.q*100,1)+" %")}`,`A typical year: ${B_(nf(r.tq*100,1)+" %")} of sales lost and ${B_(nf(r.tvac)+" days")} with an empty shelf · average of 500 years: ${B_(nf(r.q*100,1)+" %")}`)
   :T_.cuenta[i]?T(`Día ${d}: se cuenta el estante y la pantalla vuelve a decir la verdad: ${B_(nf(x))}`,`Day ${d}: the shelf is counted and the screen tells the truth again: ${B_(nf(x))}`)
   :cong?T(`La pantalla dice ${B_(nf(xs))} y el estante está vacío: como 41 o más «hay», ${B_("el sistema no pide")}`,`The screen says ${B_(nf(xs))} and the shelf is empty: since 41 or more “are there”, ${B_("the system doesn't order")}`)
   :ng>0?T(`Los contenedores translúcidos solo existen en la pantalla: ${B_(nf(xs-x))} · ${nf(lost)} ventas perdidas hasta hoy`,`The see-through containers only exist on the screen: ${B_(nf(xs-x))} · ${nf(lost)} sales lost so far`)
   :T(`Pantalla y estante coinciden · ${nf(lost)} ventas perdidas hasta hoy`,`Screen and shelf match · ${nf(lost)} sales lost so far`);return true}
 S.info=()=>null;
 S.apply=st2=>{cur=Object.assign({},st2);r=EC.inventario(cur);ms=0;at()};S.prewarm=()=>{r=EC.inventario(cur);ms=dur*0.5;at()};S.startRun=()=>{r=EC.inventario(cur);ms=0;S.done=false;S.obs=null};S.progress=()=>ms/dur;
 S.tick=(dt,sp_)=>{ms+=dt*1000*sp_;if(ms>=dur){ms=dur;S.done=true;S.obs=()=>({v:nf(r.tq*100,1)+" %",l:T("en este año típico","in this typical year")})}return at()};
 S.ff=st2=>S.apply(st2);
 at();return S}

/* ---------------- GPS · la más corta contra barrio por barrio (reel 18) ---------------- */
function sceneGps(st){const M=24,W=M+5,D=M+5;const{scene,g}=diorama(W,D,P.asphalt);
 const XZ=q=>[(q[0]-0.5)*M,(0.5-q[1])*M],BCOL=[0xF1E8D6,0xCFE0F5,0xFFD9B8,0xD8F0D5,0xE3DAF5,0xF5D6DE,0xD6EEF0,0xEFE7C4];
 const lote=inst(g,rboxG(1,0.05,1,0.04),new THREE.MeshLambertMaterial({color:0xffffff}),24,false);lote.material.userData.own=true;
 const casa=inst(g,rboxG(0.55,0.42,0.55,0.08),new THREE.MeshLambertMaterial({color:0xffffff}),170);casa.material.userData.own=true;
 const techo=inst(g,GEO().pyr,new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),170);techo.material.userData.own=true;
 const tr=inst(g,rboxG(1,0.07,0.16,0.02),new THREE.MeshBasicMaterial({color:0xffffff}),175,false);tr.material.userData.own=true;
 const dep=new THREE.Group();rb(dep,2.0,1.0,1.4,P.wall,0,0,0,0.1);rb(dep,2.1,0.16,1.5,P.blue,0,1.0,0,0.05);rb(dep,0.06,0.6,0.8,P.door,1.02,0,0,0.02);g.add(dep);
 const F=new Fleet(g,1,0.5,{van:true});F.col[0]=P.white;
 const S=mkS(scene,new THREE.Box3(new THREE.Vector3(-M/2,0,-M/2),new THREE.Vector3(M/2,2.5,M/2)),{root:g,az:0.62,azP:0.4,el:0.95});
 let cur=Object.assign({},st),r=EC.gps(cur),ms=0,tt=0;const dur=7500;let segs=[],acc=[],tot=0;
 const COL={corta:P.red,barrios:P.mint};
 function build(){r=EC.gps(cur);const p=r.p,o=r.orden,B=cur.B,cols=Math.ceil(Math.sqrt(B)),rows=Math.ceil(B/cols);segs=[];acc=[];tot=0;
  for(let i=0;i<o.length;i++){const a=XZ(p[o[i]]),b=XZ(p[o[(i+1)%o.length]]),l=Math.hypot(b[0]-a[0],b[1]-a[1]);segs.push([a,b,l]);acc.push(tot);tot+=l}
  const[dx,dz]=XZ(p[0]);dep.position.set(dx,0,dz-0.9);
  const cw=0.94/cols*M,ch=0.86/rows*M;for(let b=0;b<24;b++){if(b<B){const[x,z]=XZ(r.cen[b]);setI(lote,b,x,0.02,z,cw*0.86,1,ch*0.86);lote.setColorAt(b,_c.setHex(BCOL[b%8]))}else setI(lote,b,0,-9,0,0.01,1,0.01)}
  lote.instanceMatrix.needsUpdate=true;if(lote.instanceColor)lote.instanceColor.needsUpdate=true;
  for(let k=0;k<170;k++){if(k<p.length-1){const[x,z]=XZ(p[k+1]),h=0.42;setI(casa,k,x,0.06,z,1,1,1,Math.PI/4);setI(techo,k,x,0.06+h+0.17,z,0.62,0.4,0.62,Math.PI/4)}else{setI(casa,k,0,-9,0,0.01,0.01,0.01);setI(techo,k,0,-9,0,0.01,0.01,0.01)}}
  casa.instanceMatrix.needsUpdate=true;techo.instanceMatrix.needsUpdate=true}
 function at(dt){tt+=dt||0;const u=Math.min(1,ms/(dur*0.92)),d=u*tot,o=r.orden,n=o.length;let vx=0,vz=0,va=0,vis=0;
  for(let i=0;i<175;i++){if(i<n){const[a,b,l]=segs[i],f=Math.max(0,Math.min(1,(d-acc[i])/(l||1)));if(f>0){const mx=a[0]+(b[0]-a[0])*f/2,mz=a[1]+(b[1]-a[1])*f/2,ang=Math.atan2(-(b[1]-a[1]),b[0]-a[0]);setI(tr,i,mx,0.14,mz,Math.max(0.01,l*f),1,1,ang);
     tr.setColorAt(i,_c.setHex(COL[cur.pol]||P.red));if(f<1||i===n-1){vx=a[0]+(b[0]-a[0])*f;vz=a[1]+(b[1]-a[1])*f;va=ang}vis=i+1}else setI(tr,i,0,-9,0,0.01,1,1)}else setI(tr,i,0,-9,0,0.01,1,1)}
  tr.instanceMatrix.needsUpdate=true;if(tr.instanceColor)tr.instanceColor.needsUpdate=true;
  /* barrios: cuántas veces entró la ruta hasta ahora a cada uno (techo verde = terminado de una vez; rojo = vuelve a entrar) */
  const hecho=new Set(o.slice(0,Math.min(n,vis+1))),ent={};let prev=-2;for(let i=1;i<Math.min(n,vis+1);i++){const b=r.z[o[i]];if(b!==prev){ent[b]=(ent[b]||0)+1;prev=b}}
  for(let k=1;k<r.p.length&&k<=170;k++){const on=u>0&&hecho.has(k),bz=r.z[k];techo.setColorAt(k-1,_c.setHex(!on?P.terracotta:(ent[bz]||0)>1?P.red:P.mint));casa.setColorAt(k-1,_c.setHex(BCOL[bz%8]))}
  if(techo.instanceColor)techo.instanceColor.needsUpdate=true;if(casa.instanceColor)casa.instanceColor.needsUpdate=true;
  if(u<=0){const[dx,dz]=XZ(r.p[0]);vx=dx;vz=dz}F.go(0,vx,vz,va,true);F.snap(0);F.commit();
  const km=u*r.km,vuelve=Object.values(ent).filter(x=>x>1).length;S.clock=`${nf(km,1)} km`;
  S.labels=u>=1?[{x:0,y:2.4,z:-M/2-0.6,html:`<span class="${cur.pol==="barrios"?"g":"y"}">${nf(r.km,1)} km · ${nf(r.t,r.dec)} min</span>`}]:[];
  S.cap=u>=1?(cur.pol==="barrios"?T(`Barrio por barrio: ${B_(nf(r.km,1)+" km")}, ${cur.B} barrios terminados de una vez · la más corta hace ${nf(r.kC,1)} km`,`Neighbourhood by neighbourhood: ${B_(nf(r.km,1)+" km")}, ${cur.B} neighbourhoods finished in one go · the shortest does ${nf(r.kC,1)} km`):T(`La más corta: ${B_(nf(r.km,1)+" km")}, entra ${r.entradas} veces a ${cur.B} barrios · ${pl(r.faltan,"barrio queda","barrios quedan","neighbourhood is","neighbourhoods are")} a medias`,`The shortest: ${B_(nf(r.km,1)+" km")}, it enters ${cur.B} neighbourhoods ${r.entradas} times · ${r.faltan} left half done`))
   :cur.pol==="barrios"?T("El furgón termina cada barrio antes de pasar al siguiente","The van finishes each neighbourhood before moving to the next"):T(`El furgón sigue la ruta más corta · ${vuelve} ${vuelve===1?"barrio":"barrios"} con techo rojo: entró más de una vez`,`The van follows the shortest route · ${vuelve} ${vuelve===1?"neighbourhood":"neighbourhoods"} with a red roof: it went in more than once`);return true}
 S.info=()=>null;
 S.apply=st2=>{cur=Object.assign({},st2);build();ms=0;at(0)};S.prewarm=()=>{build();ms=dur*0.4;at(0)};S.startRun=()=>{build();ms=0;S.done=false;S.obs=null};S.progress=()=>ms/dur;
 S.tick=(dt,sp_)=>{ms+=dt*1000*sp_;if(ms>=dur){ms=dur;S.done=true;S.obs=()=>({v:nf(r.t,r.dec)+" min",l:T("con esta ruta","with this route")})}return at(dt)};
 S.ff=st2=>S.apply(st2);
 build();at(0);return S}

/* ---------------- FEDEX · más lejos a propósito (reel 20) ----------------
   Mapa ilustrativo (sin fronteras ni geografía real): las ciudades como edificios, la del medio es el centro (amarillo).
   Se trazan las conexiones de la red elegida; el color dice qué tan cargado va el avión de cada una (coral casi vacío, amarillo a medias,
   verde lleno, gris sin paquetes) y al final un paquete recorre cada conexión con carga. */
/* la escena se vuelve a montar con cada cambio de los controles: el número de ciudades anterior vive afuera, para que la recién sumada lata */
let FXN_ANT=null;
function sceneFedex(st){const MAP=EC.FXMAP,ASP=MAP.asp,MW=30,MD=MW*ASP,W=MW+1.6,D=MD+3.4;const{scene,g}=diorama(W,D,0x24314F);
 /* mapa ilustrativo: contorno de EE. UU. sin fronteras estatales (Natural Earth lowres) y lagos como en el reel R020 */
 const XZ=q=>[(q[0]-0.5)*MW,(q[1]-ASP/2)*MW],NX=EC.FX.NMAX,EMAX=NX*(NX-1)/2,Y0=0.14;
 const shp=pts=>new THREE.Shape(pts.map(q=>{const[x,z]=XZ(q);return new THREE.Vector2(x,-z)}));
 const land=new THREE.Mesh(new THREE.ExtrudeGeometry(shp(MAP.us),{depth:Y0,bevelEnabled:false}),new THREE.MeshLambertMaterial({color:0x4A5C8C}));land.rotation.x=-Math.PI/2;land.position.y=0;land.receiveShadow=true;land.material.userData.own=true;g.add(land);
 const lagoM=new THREE.MeshLambertMaterial({color:0x24314F});lagoM.userData.own=true;MAP.lagos.forEach(l=>{const m=new THREE.Mesh(new THREE.ExtrudeGeometry(shp(l),{depth:0.02,bevelEnabled:false}),lagoM);m.rotation.x=-Math.PI/2;m.position.y=Y0;g.add(m)});
 const city=inst(g,rboxG(0.42,0.5,0.42,0.08),new THREE.MeshLambertMaterial({color:0xffffff}),NX);city.material.userData.own=true;
 const hub=new THREE.Group(),hubM=new THREE.MeshLambertMaterial({color:P.yellow});hubM.userData.own=true;rb(hub,0.95,0.8,0.95,hubM,0,0,0,0.12);g.add(hub);
 const nueM=new THREE.MeshLambertMaterial({color:P.coral,transparent:true,opacity:0.95});nueM.userData.own=true;const nue=new THREE.Group();rb(nue,0.5,0.55,0.5,nueM,0,0,0,0.1);g.add(nue);
 const ln=inst(g,rboxG(1,0.05,0.07,0.02),new THREE.MeshBasicMaterial({color:0xffffff}),EMAX,false);ln.material.userData.own=true;
 const gl=inst(g,rboxG(1,0.03,0.05,0.01),new THREE.MeshBasicMaterial({color:P.coral,transparent:true,opacity:0.8}),NX,false);gl.material.userData.own=true;
 const pk=inst(g,rboxG(0.22,0.17,0.22,0.04),new THREE.MeshLambertMaterial({color:P.carton||0xC79A5B}),EMAX,false);pk.material.userData.own=true;
 const S=mkS(scene,new THREE.Box3(new THREE.Vector3(-W/2,0,-D/2),new THREE.Vector3(W/2,1.2,D/2)),{root:g,az:0.0,azP:0.0,el:1.12,long:"z"});
 let cur=Object.assign({},st),r=EC.fedex(cur),ms=0,E=[],tp=0,late=0,lateI=-1;const dur=6500;const COL={vac:P.coral,med:P.yellow,lle:P.mint,sin:0x5A6788};
 const nom=x=>x?T(x[0],x[1]):"";
 function build(){r=EC.fedex(cur);const p=r.pos,n=r.n,cap=r.cap;E=[];
  if(r.cen){for(let i=1;i<n;i++)E.push([0,i])}else{for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)E.push([i,j])}
  /* las conexiones que llevan un paquete más (reparto parejo), repartidas por el mapa */
  const C=E.length,b=Math.floor(r.P/C),x=r.P-b*C,rr=EC.rngFrom(97+n*13+r.P),ord=E.map((e,k)=>[rr(),k]).sort((a,c)=>a[0]-c[0]).map(a=>a[1]),q=new Array(C).fill(b);for(let k=0;k<x;k++)q[ord[k]]++;
  E=E.map((e,k)=>{const a=XZ(p[e[0]]),c=XZ(p[e[1]]),l=Math.hypot(c[0]-a[0],c[1]-a[1]),av=Math.max(1,Math.ceil(q[k]/cap)),f=q[k]/(av*cap);return{a,c,l,q:q[k],k:q[k]===0?"sin":f<EC.FX.VACIO?"vac":f>=EC.FX.LLENO?"lle":"med",ord:rr()}});
  for(let i=0;i<NX;i++){if(i>0&&i<n){const[cx,cz]=XZ(p[i]);setI(city,i,cx,Y0,cz,1,1,1);city.setColorAt(i,_c.setHex(0xF1E8D6))}else setI(city,i,0,-9,0,0.01,0.01,0.01)}
  city.instanceMatrix.needsUpdate=true;if(city.instanceColor)city.instanceColor.needsUpdate=true;const[hx,hz]=XZ(p[0]);hub.position.set(hx,Y0,hz);/* en ciudad con ciudad es una ciudad más; con centro, el centro */hubM.color.setHex(r.cen?P.yellow:0xF1E8D6);hub.scale.setScalar(r.cen?1:0.5);
  /* la ciudad que se suma (la siguiente de la lista): late, y al final muestra lo que costaría unirla */
  const sp=EC.fxPos()[n];nue.visible=!!sp;if(nue.visible){const[sx,sz]=XZ(sp);nue.position.set(sx,Y0,sz)}
  for(let i=0;i<NX;i++)setI(gl,i,0,-9,0,0.01,1,1);gl.instanceMatrix.needsUpdate=true;
  /* los nombres no tapan el centro ni la ciudad que se suma */S.dots=[[hx,Y0+0.5,hz,0]];if(nue.visible)S.dots.push([nue.position.x,Y0+0.3,nue.position.z,n])}
 function nueLines(on){const n=r.n;if(!nue.visible)return;const sx=nue.position.x,sz=nue.position.z,tg=r.cen?[0]:Array.from({length:n},(_,i)=>i);
  for(let i=0;i<NX;i++){if(on&&i<tg.length){const[cx,cz]=XZ(r.pos[tg[i]]),l=Math.hypot(cx-sx,cz-sz),ang=Math.atan2(-(cz-sz),cx-sx);setI(gl,i,(sx+cx)/2,Y0+0.06,(sz+cz)/2,Math.max(0.01,l),1,1,ang)}else setI(gl,i,0,-9,0,0.01,1,1)}gl.instanceMatrix.needsUpdate=true}
 function labels(){const L=[{x:0,y:0.2,z:-MD/2-0.7,html:`<span style="opacity:.85">${T("mapa ilustrativo","illustrative map")}</span>`},{x:0,y:0.2,z:MD/2+1.0,html:`<span style="opacity:.85">${T("ciudades de ejemplo: no son las 25 de 1973","example cities: not the 25 of 1973")}</span>`}];
  const[hx,hz]=XZ(r.pos[0]);L.push({x:hx,y:Y0+1.1,z:hz,html:r.cen?`<span class="y">Memphis</span>`:"Memphis"});
  if(nue.visible)L.push({x:nue.position.x,y:Y0+0.75,z:nue.position.z,cls:"c",p:99,i:r.n,html:`<span class="r">+ ${nom(r.sig)}</span>`});
  r.pos.forEach((q,i)=>{if(i===0)return;const[cx,cz]=XZ(q);L.push({x:cx,y:Y0+0.62,z:cz,cls:"c",p:i===lateI&&late>0?0:i,i,html:i===lateI&&late>0?`<span class="r">${nom(r.nombres[i])}</span>`:nom(r.nombres[i])})});return L}
 function at(){const u=Math.min(1,ms/dur),dr=Math.min(1,u/0.55),C=E.length;let vis=0;
  for(let i=0;i<EMAX;i++){if(i<C){const e=E[i];
    if(dr>=1||i<dr*C){const f=dr>=1?1:Math.min(1,dr*C-i),mx=e.a[0]+(e.c[0]-e.a[0])*f/2,mz=e.a[1]+(e.c[1]-e.a[1])*f/2,ang=Math.atan2(-(e.c[1]-e.a[1]),e.c[0]-e.a[0]);
     setI(ln,i,mx,Y0+0.08+(i%7)*0.004,mz,Math.max(0.01,e.l*f),1,1,ang);ln.setColorAt(i,_c.setHex(COL[e.k]));vis++}else setI(ln,i,0,-9,0,0.01,1,1)}
   else setI(ln,i,0,-9,0,0.01,1,1)}
  ln.instanceMatrix.needsUpdate=true;if(ln.instanceColor)ln.instanceColor.needsUpdate=true;
  const pu=u<0.6?-1:Math.min(1,(u-0.6)/0.36);
  for(let i=0;i<EMAX;i++){if(i<C&&pu>=0&&E[i].q>0){const e=E[i],f=ease(pu);setI(pk,i,e.a[0]+(e.c[0]-e.a[0])*f,Y0+0.18,e.a[1]+(e.c[1]-e.a[1])*f,1,1,1)}else setI(pk,i,0,-9,0,0.01,0.01,0.01)}
  pk.instanceMatrix.needsUpdate=true;nueLines(u>=1);
  const a=r.a,sg=nom(r.sig);S.clock=`${nf(vis)} ${vis===1?T("conexión","connection"):T("conexiones","connections")}`;
  S.labels=labels();
  S.cap=u>=1?(r.cen?T(`Con un centro: ${B_(pl(r.C,"conexión","conexiones"))}, ${B_(nf(r.q,2))} paquetes por conexión con el centro, en promedio · ${nf(a.lle)} aviones llenos · ${B_("+"+nf(r.des*100)+" %")} de distancia por el desvío${sg?` · sumar ${sg}: ${B_("1 conexión nueva")}`:""}`,`With a hub: ${B_(r.C+(r.C===1?" connection":" connections"))}, ${B_(nf(r.q,2))} packages per connection with the hub, on average · ${nf(a.lle)} full aircraft · ${B_("+"+nf(r.des*100)+" %")} distance from the detour${sg?` · adding ${sg}: ${B_("1 new connection")}`:""}`)
    :T(`Ciudad con ciudad: ${B_(nf(r.C)+" conexiones")}, ${B_(nf(r.q,2))} paquetes por conexión en promedio · ${B_(nf(a.vac))} de ${nf(a.av)} aviones casi vacíos${sg?` · sumar ${sg}: ${B_(nf(r.nuevasD)+" conexiones nuevas")}`:""}`,`City to city: ${B_(nf(r.C)+" connections")}, ${B_(nf(r.q,2))} packages per connection on average · ${B_(nf(a.vac))} of ${nf(a.av)} aircraft almost empty${sg?` · adding ${sg}: ${B_(nf(r.nuevasD)+" new connections")}`:""}`))
   :u<0.55?(r.cen?T(`Cada ciudad se une solo con el centro, Memphis (amarillo): ${B_(nf(r.n-1))} conexiones`,`Each city joins only the hub, Memphis (yellow): ${B_(nf(r.n-1))} connections`):T(`Cada ciudad se une con todas las demás: ${r.n} × ${r.n-1} ÷ 2 = ${B_(nf(r.CD))} conexiones`,`Each city joins all the others: ${r.n} × ${r.n-1} ÷ 2 = ${B_(nf(r.CD))} connections`))
   :T(`${nf(r.P)} paquetes repartidos parejo: coral casi vacío, amarillo a medias, verde lleno, gris sin paquetes`,`${nf(r.P)} packages spread evenly: coral almost empty, yellow half full, green full, grey no packages`);return true}
 S.info=()=>null;S.declutter=true;
 /* late la ciudad que se suma; si se acaba de agregar una con el control, también late un rato */
 S.pulse=dt=>{tp+=dt;const k=1+0.28*Math.sin(tp*5.2);nue.scale.set(k,1+0.5*(k-1),k);nueM.opacity=0.65+0.3*(0.5+0.5*Math.sin(tp*5.2));
  if(late>0){late=Math.max(0,late-dt);if(lateI>0&&lateI<r.n){const[cx,cz]=XZ(r.pos[lateI]),s=1+0.45*Math.abs(Math.sin(tp*6));setI(city,lateI,cx,Y0,cz,s,s,s);city.setColorAt(lateI,_c.setHex(late>0?P.coral:0xF1E8D6));city.instanceMatrix.needsUpdate=true;if(city.instanceColor)city.instanceColor.needsUpdate=true}if(late===0){lateI=-1;S.labels=labels()}}return true};
 S.apply=st2=>{cur=Object.assign({},st2);build();if(FXN_ANT!==null&&r.n>FXN_ANT){lateI=r.n-1;late=2.6}FXN_ANT=r.n;ms=0;at()};S.prewarm=()=>{build();ms=dur*0.5;at()};S.startRun=()=>{build();ms=0;S.done=false;S.obs=null};S.progress=()=>ms/dur;
 S.tick=(dt,sp_)=>{ms+=dt*1000*sp_;if(ms>=dur){ms=dur;S.done=true;S.obs=null}return at()};
 S.ff=st2=>S.apply(st2);
 build();at();return S}

/* ---------------- UPS · the race repeats ---------------- */
function sceneUps(st){const a=st.X/40,b=st.X/40;const W=Math.max(32,2*(a+6)),D=Math.max(32,2*(b+6));const{scene,g}=diorama(W,D,P.grass);
 roadZ(g,D/2-0.4,-D/2+0.4,0,3.0);roadX(g,-W/2+0.4,W/2-0.4,0,3.0);for(let i=-3;i<=3;i++){flat(g,0.32,1.6,P.line,i*0.42,0.022,2.4);flat(g,1.6,0.32,P.line,-2.4,0.022,i*0.42)}
 if(a>0.05){roadX(g,0,a,-b,2.0);roadZ(g,-b,0,a,2.0)}
 const segs=[[0,D/2,0,-D/2],[-W/2,0,W/2,0]];if(a>0.05)segs.push([0,-b,a,-b],[a,-b,a,0]);
 const dseg=(px,pz,s)=>{const[x0,z0,x1,z1]=s;const vx=x1-x0,vz=z1-z0;const l2=vx*vx+vz*vz||1;let t=((px-x0)*vx+(pz-z0)*vz)/l2;t=Math.max(0,Math.min(1,t));return Math.hypot(px-(x0+t*vx),pz-(z0+t*vz))};
 const rng=EC.rngFrom(9),BC=[0xF1E8D6,0xCFE0F5,0xFFD9B8,0xD8F0D5,0xF7E3A1],RC=[P.terracotta,P.roof,0xB4544A];
 for(let x=-W/2+2;x<=W/2-3;x+=3.4)for(let z=-D/2+2;z<=D/2-3;z+=3.4){const cx=x+1.2,cz=z+1.2;if(segs.some(s=>dseg(cx,cz,s)<2.9))continue;if(Math.hypot(cx+12,cz+3)<3.2||Math.hypot(cx,cz-12.5)<2.5)continue;
  if(rng()<0.3){tree(g,cx,cz,0.9);continue}const h=1.2+rng()*1.6;rb(g,2.4,h,2.4,BC[Math.floor(rng()*5)],cx,0,cz,0.2);if(rng()<0.6){const r=put(g,GEO().pyr,mat(RC[Math.floor(rng()*3)],{flat:true}),cx,h+0.55,cz);r.scale.set(1.85,1.1,1.85);r.rotation.y=Math.PI/4}else rb(g,2.5,0.2,2.5,P.roof,cx,h,cz,0.06)}
 if(a>3.2)rb(g,a-2.4,1.6,b-2.4,0xFFD9B8,a/2,0,-b/2,0.2);
 const hx=-12.2,hz=-3.2;rb(g,2.6,2,2.4,0xF7E3A1,hx,0,hz,0.2);const rf=put(g,GEO().pyr,mat(P.terracotta,{flat:true}),hx,2.6,hz);rf.scale.set(2,1.2,1.9);rf.rotation.y=Math.PI/4;const cust=person(g,P.lilac,hx+1.6,hz+1.6,0.6);rb(g,0.6,0.45,0.5,P.carton,hx+0.6,0,hz+1.9,0.08);
 put(g,GEO().post,mat(P.dark),2.0,1.5,2.0).scale.y=3;rb(g,0.5,1.1,0.45,P.dark,2.0,2.8,2.0,0.1);const red=put(g,GEO().ball,mat(P.red,{basic:true}),2.0,3.6,1.76,false),grn=put(g,GEO().ball,mat(0x2B3654),2.0,3.08,1.76,false);red.scale.setScalar(0.32);grn.scale.setScalar(0.32);
 const cars=[0x6EC1FF,0xB79CFF,0xFF7A59].map(col=>{const c=new THREE.Group();rb(c,0.9,0.5,1.7,col,0,0.18,0,0.2);rb(c,0.8,0.42,0.9,P.glass,0,0.68,0.05,0.15);c.visible=false;g.add(c);return c});
 const F=new Fleet(g,2,0.85);F.col[0]=P.yellow;F.col[1]=P.mint;const IC=new Icons(g,"clock",1,1.5);
 const off=(pts,o)=>pts.map((p,i)=>{const nx=[];if(i>0){const dx=p[0]-pts[i-1][0],dz=p[1]-pts[i-1][1],l=Math.hypot(dx,dz)||1;nx.push([-dz/l,dx/l])}if(i<pts.length-1){const dx=pts[i+1][0]-p[0],dz=pts[i+1][1]-p[1],l=Math.hypot(dx,dz)||1;nx.push([-dz/l,dx/l])}const m=[0,0];nx.forEach(v=>{m[0]+=v[0];m[1]+=v[1]});const l=Math.hypot(m[0],m[1])||1;return[p[0]+o*m[0]/l,p[1]+o*m[1]/l]});
 const pathA=off([[0,10],[0,0],[-10,0]],0.75),pathB=a>0.05?off([[0,10],[0,-b],[a,-b],[a,0],[-10,0]],0.75):pathA;
 const len=Pp=>{let s=0;for(let i=1;i<Pp.length;i++)s+=Math.hypot(Pp[i][0]-Pp[i-1][0],Pp[i][1]-Pp[i-1][1]);return s};
 const along=(Pp,d)=>{for(let i=1;i<Pp.length;i++){const l=Math.hypot(Pp[i][0]-Pp[i-1][0],Pp[i][1]-Pp[i-1][1]);if(d<=l||i===Pp.length-1){const t=Math.min(1,d/(l||1));return[Pp[i-1][0]+(Pp[i][0]-Pp[i-1][0])*t,Pp[i-1][1]+(Pp[i][1]-Pp[i-1][1])*t,Math.atan2(-(Pp[i][1]-Pp[i-1][1]),Pp[i][0]-Pp[i-1][0])]}d-=l}return[Pp[0][0],Pp[0][1],0]};
 const LA=len(pathA),LB=len(pathB),stopD=8.0;
 const S=mkS(scene,new THREE.Box3(new THREE.Vector3(-W/2,0,-D/2),new THREE.Vector3(W/2,3.5,D/2)),{root:g,az:0.62,azP:0.45,el:0.72,anchor:{x:2.0,y:5.2,z:2.0}});
 let cur=Object.assign({},st),t=0,hold=0,tt=0,Wr=st.W;
 function newRace(){t=0;hold=0;const r=EC.rngFrom((Date.now()/1000|0)+Math.floor(tt*10));Wr=cur.W}
 function at(dt){tt+=dt;const v=cur.v/3.6,base=200/(v||1),W_=Wr;const tA=base+W_,tB=base+cur.X/v;
  let dA;const tStop=base*stopD/LA;if(t<tStop)dA=t/base*LA;else if(t<tStop+W_)dA=stopD;else dA=Math.min(LA,(t-W_)/base*LA);
  const dB=Math.min(LB,t/tB*LB);const pa=along(pathA,dA),pb=along(pathB,dB);F.go(0,pa[0],pa[1],pa[2],true);F.snap(0);F.go(1,pb[0],pb[1],pb[2],true);F.snap(1);F.commit();
  const waiting=t>=tStop&&t<tStop+W_;red.material=mat(waiting?P.red:0x2B3654,{basic:waiting});grn.material=mat(waiting?0x2B3654:P.green,{basic:!waiting});IC.set(0,pa[0],3.0,pa[1],waiting);IC.step(dt,S.cam.quaternion,tt);
  cars.forEach((c,i)=>{c.visible=waiting;if(waiting){const z=-D/2+2+((t-tStop)*7+i*9)%(D-4);c.position.set(-0.75,0,z)}});cust.position.y=Math.abs(Math.sin(tt*5))*0.12;
  S.labels=[{x:pa[0],y:2.2,z:pa[1],html:`<span class="y">${T("Dobla","Turns")}</span>`},{x:pb[0],y:2.2,z:pb[1],html:`<span class="g">${T("Evita","Avoids")}</span>`}];
  S.clock=`${nf(Math.min(t,Math.max(tA,tB)),0)} s`;
  if(t>=Math.max(tA,tB))S.cap=tA>tB?T(`Ganó el que ${B_("evita el giro")} por ${B_(nf(tA-tB,1)+" s")}.`,`The truck that ${B_("avoids the turn")} wins by ${B_(nf(tA-tB,1)+" s")}.`):tA<tB?T(`Ganó el que ${B_("dobla")} por ${B_(nf(tB-tA,1)+" s")}: el desvío salió más caro.`,`The truck that ${B_("turns")} wins by ${B_(nf(tB-tA,1)+" s")}: the detour cost more.`):T("Empate.","A tie.");
  else if(waiting)S.cap=T(`El amarillo espera para doblar: ${B_(nf(t-tStop)+" s")} con el motor encendido.`,`The yellow truck waits to turn: ${B_(nf(t-tStop)+" s")} with the engine running.`);
  else S.cap=T(`El verde da la vuelta a la manzana: ${B_("+"+cur.X+" m")} pero sin esperar.`,`The green one goes around the block: ${B_("+"+cur.X+" m")} but no waiting.`);return true}
 S.fleet=F;S.info=i=>i===0?T(`Dobla a la izquierda · espera <b>${Wr} s</b> en el cruce`,`Turns left · waits <b>${Wr} s</b> at the crossing`):T(`Evita el giro · <b>+${cur.X} m</b> sin esperar`,`Avoids the turn · <b>+${cur.X} m</b> without waiting`);
 S.apply=(st2)=>{cur=Object.assign({},st2);newRace()};
 S.prewarm=()=>{newRace();t=200/(cur.v/3.6)*0.4+cur.W*0.4;at(0.016)};
 const TT_=()=>{const v=cur.v/3.6;return Math.max(200/v+Wr,200/v+cur.X/v)+2};S.startRun=()=>{newRace();S.done=false};S.progress=()=>t/TT_();
 S.tick=(dt,sp)=>{t+=dt*13*sp;if(t>=TT_()){t=TT_();S.done=true}return at(dt)};
 S.ff=st2=>S.apply(st2);
 return S}
