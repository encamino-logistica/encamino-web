function gc(p,e,n){try{const g=window.goatcounter;if(g&&g.count){g.count({path:p,title:p,event:!!e});return}}catch(x){return}if((n||0)<10)setTimeout(()=>gc(p,e,(n||0)+1),600)}/* GoatCounter: anonymous counts; page works the same if blocked */
/* =====================================================================
   UI · full-bleed 3D game: choose a rule → ▶ Simulate → result card
   ===================================================================== */
const STATE={},INTRO={};LABS.forEach(l=>{STATE[l.id]=Object.assign({},l.def);INTRO[l.id]=true});
try{const sv=JSON.parse(localStorage.getItem("ec5-state")||"{}");for(const k in sv)if(STATE[k])Object.assign(STATE[k],sv[k])}catch(e){}
const saveState=()=>{try{localStorage.setItem("ec5-state",JSON.stringify(STATE))}catch(e){}};
const COARSE=!!(window.matchMedia&&window.matchMedia("(pointer: coarse)").matches);
const buzz=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};
const eff=id=>{const G=LAB[id].game;return G.eff?G.eff(STATE[id]):STATE[id]};

/* ---------- score ---------- */
function verdict(r){if(!r.valid)return{cls:"void",h:T("No cuenta","Doesn't count")};const s=r.score;if(s>=103)return{cls:"win",h:T("¡Le ganaste al modelo!","You beat the model!")};if(s>=97)return{cls:"tie",h:T("Igual que el reel","Same as the reel")};if(s>=80)return{cls:"near",h:T("Estuviste cerca","You were close")};return{cls:"lose",h:T("Te falta","Not there yet")}}
const pctTxt=r=>r.valid&&isFinite(r.score)?(r.score>200.5?"≥200":nf(r.score)):"—";
/* option labels and hints may depend on the levers (e.g. «De 6 en 6 cada 20 min» follows c and s) */
const optL=(o,st)=>typeof o[1]==="function"?L(o[1](st),o[2](st)):L(o[1],o[2]);
const optT=(o,st)=>typeof o[1]==="function"?T(o[1](st),o[2](st)):tx({es:o[1],en:o[2]});
const optH=(o,st)=>!o||!o[3]?"":tx(typeof o[3]==="function"?o[3](st):o[3]);
/* the text people copy: phrase, score against the reel, a challenge and the link */
function shareText(id){const G=LAB[id].game,e=eff(id),r=G.score(e),v=verdict(r);return `${G.share(e)} ${T("Frente al reel","Against the reel")}: ${pctTxt(r)}${pctTxt(r)!=="—"?" %":""} · ${v.h}${/[!.]$/.test(v.h)?"":"."} ${T("¿Le ganas?","Can you beat it?")} ${shareURL(id)}`}

/* ---------- renderer & loop ---------- */
let RND=null;
function renderer(){if(!HAS3)return null;if(RND)return RND;try{RND=new THREE.WebGLRenderer({antialias:!COARSE||(window.devicePixelRatio||1)<2,alpha:true,powerPreference:"high-performance"});RND.setPixelRatio(Math.min(COARSE?1.5:2,window.devicePixelRatio||1));RND.setClearColor(0x000000,0);RND.shadowMap.enabled=!COARSE;RND.shadowMap.type=THREE.PCFSoftShadowMap;
  /* the WebView may drop the GL context (background tab, memory): freeze, then rebuild the scene when it comes back */
  RND.domElement.addEventListener("webglcontextlost",e=>{e.preventDefault();V.lost=true});RND.domElement.addEventListener("webglcontextrestored",()=>{V.lost=false;if(V.id){if(V.running)finishRun(true);mountLabScene(V.id)}else if(!$("v-inicio").hidden)mountHero()})}catch(e){RND=null}return RND}
const V={id:null,S:null,host:null,last:0,res:null,cap:"",lbl:"",vis:true,el:0.62,elT:0.62,top:false,ffT:0,ffMul:1,box:null,az:0.7,renders:0,pad:{t:0,b:0}};
const RO=window.ResizeObserver?new ResizeObserver(()=>sizeStage()):null;
const VIS="IntersectionObserver" in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.target===V.host)V.vis=e.isIntersecting}),{threshold:0}):null;
/* fit the diorama into the free space between the hero number and the dock */
function fitFree(){const S=V.S,host=V.host;if(!S||!host)return;const w=host.clientWidth,h=host.clientHeight;const t=V.id?V.pad.t:0,b=V.id?V.pad.b:0;const fh=Math.max(120,h-t-b);fitCam(S.cam,V.box||S.box,w/fh,V.az,V.el,1.04);
 const cam=S.cam,sp=(cam.top-cam.bottom);const k=h/fh;const extraTop=sp*(k-1)*(t/(t+b||1)),extraBot=sp*(k-1)*(b/(t+b||1));cam.top+=extraTop;cam.bottom-=extraBot;cam.updateProjectionMatrix()}
function sizeStage(){if(!V.S||!RND||!V.host)return;const w=V.host.clientWidth,h=V.host.clientHeight;if(!w||!h)return;RND.setSize(w,h,false);measurePad();const fh=Math.max(120,h-V.pad.t-V.pad.b);const asp=w/fh,portrait=asp<1.3;const rot=asp<1.3&&V.S.long==="x";if(V.S.root)V.S.root.rotation.y=rot?Math.PI/2:0;V.box=orientBox(V.S.box,rot);V.az=portrait?V.S.azP:V.S.az;V.elT=V.top?1.5:V.S.el;fitFree()}
function measurePad(){if(!V.id){V.pad={t:0,b:0};return}const top=document.querySelector(".g-top"),pan=$("panel"),host=V.host;if(!top||!pan||!host)return;const hr=host.getBoundingClientRect(),a=top.getBoundingClientRect(),d=pan.getBoundingClientRect();const side=window.innerWidth>=960;V.pad={t:a.bottom-hr.top+(side?20:10),b:side?24:hr.bottom-d.top+10}}
function attach(host,S){if(V.S&&V.S!==S)disposeScene(V.S);V.S=S;V.host=host;V.cap=V.lbl="";const lb=host.querySelector(".labels"),cp=host.querySelector(".caption");if(lb)lb.innerHTML="";if(cp){cp.innerHTML="";cp.classList.remove("on")}/* no labels left over from the previous scene */const R=renderer();if(!R)return;host.prepend(R.domElement);if(RO){RO.disconnect();RO.observe(host)}V.vis=true;if(VIS){VIS.disconnect();VIS.observe(host)}V.el=V.top?1.5:S.el;sizeStage()}
function detach(){if(V.S)disposeScene(V.S);V.S=null;V.host=null;if(RND&&RND.domElement.parentNode)RND.domElement.remove()}
function hud(){const S=V.S,host=V.host;if(!S||!host)return;const cap=host.querySelector(".caption"),lb=host.querySelector(".labels");
 const clk=$("clk");if(clk){const c=V.running?S.clock||"":"";if(clk.textContent!==c){clk.textContent=c;clk.classList.toggle("on",!!c)}}
 if(cap&&S.cap!==V.cap&&!V.ahaOn){V.cap=S.cap;cap.innerHTML=S.cap?`<span>${S.cap}</span>`:"";cap.classList.toggle("on",!!S.cap)}
 const w=host.clientWidth,hh=host.clientHeight;
 if(lb){let h="";(S.labels||[]).forEach(l=>{_v.set(l.x,l.y,l.z);if(S.root)S.root.localToWorld(_v);_v.project(S.cam);h+=`<div class="lbl" style="left:${((_v.x+1)/2*w).toFixed(0)}px;top:${((1-_v.y)/2*hh).toFixed(0)}px">${l.html}</div>`});if(h!==V.lbl){V.lbl=h;lb.innerHTML=h}}
 const bu=$("bubble");if(bu&&V.bubble){const now=performance.now();if(now>V.bubble.until||!S.fleet.on[V.bubble.i]){bu.hidden=true;V.bubble=null}else{const F=S.fleet,i=V.bubble.i;_v.set(F.cx[i],2.4*F.sc,F.cz[i]);if(S.root)S.root.localToWorld(_v);_v.project(S.cam);const html=S.info(i);if(html&&html!==V.bubble.html){V.bubble.html=html;bu.innerHTML=html}bu.style.transform=`translate(${((_v.x+1)/2*w).toFixed(0)}px,${((1-_v.y)/2*hh).toFixed(0)}px) translate(-50%,-100%)`}}}
function loop(now){requestAnimationFrame(loop);if(!V.S||!RND||V.lost||document.hidden||V.vis===false){V.last=now;return}const raw=Math.min(0.5,Math.max(0,(now-(V.last||now))/1000)),dt=Math.min(0.1,raw);V.last=now;
 const hero=!V.id&&V.S.tick;let draw=V.dirty>0||hero||!!V.bubble;
 if(hero)V.S.tick(dt,1);
 /* the run follows real elapsed time (capped at 0.5 s) so a slow phone still finishes in ~5 s */
 if(V.running){V.S.tick(Math.min(0.5,raw),(V.runSp||1)*(V.skip?14:1));draw=true;const pr=$("prog");if(pr)pr.style.width=Math.min(100,V.S.progress()*100).toFixed(1)+"%";if(V.S.done)finishRun()}
 if(Math.abs(V.el-V.elT)>0.002&&V.host){V.el+=(V.elT-V.el)*(1-Math.exp(-6*dt));fitFree();draw=true}
 if(V.settle>0){V.settle-=raw;if(V.S.fleet&&V.S.fleet.step(dt,9))draw=true}
 if(!draw)return;V.dirty=Math.max(0,(V.dirty||0)-1);RND.render(V.S.scene,V.S.cam);V.renders++;hud()}



if(HAS3)requestAnimationFrame(loop);

/* ---------- controls ---------- */
const cid=(id,w,k)=>`c-${id}-${w}-${k}`;
function allDefs(id){const G=LAB[id].game;return[G.rule].concat(G.sliders,G.ajustes,G.reto||[])}
function symChip(lab,c){return c.sym?`<span class="sym" data-k="${c.k}" style="--c:${lab.sym[c.k]||"#FFC726"}">${c.sym}</span>`:""}
function ctlHTML(lab,w,c,focus){const i=cid(lab.id,w,c.k),lb=`${symChip(lab,c)}<span>${L(c.es,c.en)}</span>`,f=focus?" focus":"";
 if(c.type==="range")return `<div class="ctl${f}" data-k="${c.k}"><label for="${i}">${lb}<output id="${i}-o"></output></label><input type="range" id="${i}" min="${c.min}" max="${c.max}" step="${c.step}" style="--c:${lab.sym[c.k]||"#FFC726"}"></div>`;
 if(c.type==="step")return `<div class="ctl step${f}" data-k="${c.k}"><label>${lb}</label><div class="stepper"><button type="button" data-d="-1" aria-label="−">−</button><output id="${i}-o"></output><button type="button" data-d="1" aria-label="+">+</button></div></div>`;
 if(c.type==="seg")return `<div class="ctl segc${f}" data-k="${c.k}"><div class="seglbl">${L(c.es,c.en)}</div><div class="seg" id="${i}" role="group">${c.opts.map(o=>`<button type="button" data-v="${o[0]}">${optL(o,STATE[lab.id])}</button>`).join("")}</div><p class="seghint" id="${i}-h"></p></div>`;
 if(c.type==="check")return `<div class="ctl check${f}" data-k="${c.k}"><label><input type="checkbox" id="${i}"><span class="tg"></span> ${L(c.es,c.en)}</label></div>`;
 return ""}
function syncCtls(id){const st=STATE[id],lab=LAB[id];qsa(`[id^="c-${id}-"]`).forEach(el=>{const m=el.id.match(/^c-[a-z]+-([a-z])-(.+?)(-o)?$/);if(!m||m[3])return;const c=allDefs(id).find(x=>x.k===m[2]);if(!c)return;const o=$(el.id+"-o");
  if(c.type==="range"){if(c.range){const[lo,hi]=c.range(st);el.min=lo;el.max=hi}el.value=st[c.k];el.style.setProperty("--p",((st[c.k]-el.min)/((el.max-el.min)||1)*100)+"%");if(c.zone){el.classList.add("zoned");el.style.setProperty("--z",c.zone(st)+"%");el.style.setProperty("--c",c.hot(st)?"#FF4040":(lab.sym[c.k]||"#FFC726"))}const off=c.off&&c.off(st);el.disabled=!!off;el.closest(".ctl").classList.toggle("off",!!off);if(o)o.textContent=c.fmt(+st[c.k],st)}
  else if(c.type==="seg"){qsa("button",el).forEach(b=>{b.setAttribute("aria-pressed",String(b.dataset.v===String(st[c.k])));const o=c.opts.find(x=>x[0]===b.dataset.v);if(o&&typeof o[1]==="function")b.innerHTML=optL(o,st)});const hh=$(el.id+"-h"),oo=c.opts.find(x=>x[0]===st[c.k]);if(hh)hh.textContent=optH(oo,st)}
  else if(c.type==="check")el.checked=!!st[c.k]});
 qsa(`.stepper output[id^="c-${id}-"]`).forEach(o=>{const k=o.id.replace(/^c-[a-z]+-[a-z]-/,"").replace(/-o$/,"");o.textContent=st[k]});
 qsa("#chips .chip").forEach((b,i)=>{const set=lab.game.chips[i][3];b.setAttribute("aria-pressed",String(Object.keys(set).every(k=>st[k]===set[k])))})}
function bindCtls(id,root){allDefs(id).forEach(c=>{["c","a","r","m"].forEach(w=>{const i=cid(id,w,c.k),el=$(i);
  if(c.type==="step"){const o=$(i+"-o");if(!o||(root&&!root.contains(o))||o._b)return;o._b=1;qsa(".stepper button",o.closest(".ctl")).forEach(b=>b.addEventListener("click",()=>{const v=Math.max(c.min,Math.min(c.max,STATE[id][c.k]+(+b.dataset.d)));onCtl(id,{[c.k]:v})}));return}
  if(!el||(root&&!root.contains(el))||el._b)return;el._b=1;
  if(c.type==="range")el.addEventListener("input",()=>onCtl(id,{[c.k]:+el.value}));
  else if(c.type==="seg")qsa("button",el).forEach(b=>b.addEventListener("click",()=>onCtl(id,{[c.k]:b.dataset.v})));
  else if(c.type==="check")el.addEventListener("change",()=>onCtl(id,{[c.k]:el.checked}))})})}
let sceneT=0,metT=0;
function onCtl(id,set,opts){opts=opts||{};const lab=LAB[id],st=STATE[id];if(V.running)return;let changed=false;for(const k in set)if(st[k]!==set[k]){st[k]=set[k];changed=true;if(lab.onSet)lab.onSet(st,k,set)}if(!changed&&!opts.force)return;saveState();if(opts.noScene){syncCtls(id);return}
 if(id==="fila"&&filaRho(st)>=0.85&&!V.hot){buzz(15)}V.hot=id==="fila"&&filaRho(st)>=0.85;
 syncCtls(id);if(V.mode==="done"){V.mode="ready"}renderPanel(id);clearTimeout(sceneT);sceneT=setTimeout(()=>{if(V.id===id&&!V.running)mountLabScene(id)},140);
 if(SHEET.kind&&SHEET.id===id&&SHEET.kind!=="ajustar"){clearTimeout(metT);metT=setTimeout(()=>refreshSheet(),120)}}






function mountLabScene(id){const host=$("stage");if(!host)return;if(!HAS3||!renderer()){if(!host.querySelector(".fallback"))host.insertAdjacentHTML("afterbegin",`<div class="fallback"><div><div class="fb-chip">${sv(LAB[id].chip)}</div><div class="fb-q">${tx(LAB[id].q)}</div><p>${T("La maqueta 3D no cargó (sin WebGL o sin conexión). Las cifras funcionan igual.","The 3D model didn't load (no WebGL or offline). Numbers still work.")}</p></div></div>`);return}
 const lab=LAB[id];const S=lab.scene(eff(id));S.apply(eff(id),"reset");attach(host,S);S.prewarm();S.cap="";V.cap="";V.dirty=3;V.settle=0.6}

/* ---------- the run: prepare → ▶ Simular → result ---------- */
const RUNSP={fila:8,bailey:2.6,ups:1.1};
const rw=id=>{const w=RUNWORD[id];return typeof w==="function"?w(STATE[id]):tx(w)};const RUNWORD={bailey:{es:"el día",en:"the day"},fila:{es:"la hora punta",en:"rush hour"},nivel:{es:"el mes",en:"the month"},amazon:st=>st.o===1?T("1 pedido","1 order"):T(`${st.o} pedidos`,`${st.o} orders`),ikea:{es:"100 entregas",en:"100 deliveries"},ups:{es:"la carrera",en:"the race"}};
const SIT={bailey:st=>T(`${st.N} camiones · ${st.c} andenes · ${st.s} min de carga${st.d?` · llegan ±${st.d} min`:" · llegan puntuales"}`,`${st.N} trucks · ${st.c} docks · ${st.s} min loads${st.d?` · arrive ±${st.d} min`:" · arrive on time"}`),
 fila:st=>T(`${pl(st.c,"puerta","puertas")} · ${pl(st.lam,"camión","camiones")} por hora · ${st.S} min de descarga en promedio`,`${pl(st.c,"","","door","doors")} · ${pl(st.lam,"","","truck","trucks")} per hour · ${st.S} min unloads on average`),
 nivel:st=>T(`${nf(st.p/10,1)} % de éxito por parada · ${st.n} paradas al día${st.n!==85?` (el reel usa 85)`:""} · meta ${st.meta} %${st.round?" (redondea)":""}`,`${nf(st.p/10,1)} % success per stop · ${st.n} stops a day${st.n!==85?` (the reel uses 85)`:""} · ${st.meta} % target${st.round?" (rounded)":""}`),
 amazon:st=>T(`Pasillo de ${st.L} m · ${st.ord==="orden"?"1 lugar":st.k+" copias"} del producto`,`${st.L} m aisle · ${st.ord==="orden"?"1 spot":st.k+" copies"} of the product`),
 ikea:st=>st.pack==="armado"?T(`Armado: 1 bulto de 1,81 m³ · 3 por viaje en un furgón de 5,6 m³ (ejemplo) · cada pieza falla 1 de cada ${nf(EC.IP[st.pi])} (ejemplo)`,`Assembled: 1 piece of 1.81 m³ · 3 per trip in a 5.6 m³ van (example) · each piece fails 1 in ${nf(EC.IP[st.pi])} (example)`):T(`${st.n} cajas (${nf(st.n*0.023,2)} m³) · ${ikeaCap(st.n,false)} por viaje en un furgón de 5,6 m³ (ejemplo) · cada caja falla 1 de cada ${nf(EC.IP[st.pi])} (ejemplo)`,`${st.n} boxes (${nf(st.n*0.023,2)} m³) · ${ikeaCap(st.n,false)} per trip in a 5.6 m³ van (example) · each box fails 1 in ${nf(EC.IP[st.pi])} (example)`),
 ups:st=>T(`${st.W} s de espera para doblar · ${st.X} m de desvío para evitarlo${st.pol==="conviene"?" · la carrera muestra una espera fija; la regla mira el tráfico cruce a cruce":""}`,`${st.W} s wait to turn left · ${st.X} m detour to avoid it${st.pol==="conviene"?" · the race shows a fixed wait; the rule checks traffic at each crossing":""}`)};
const RUNS={};
function ruleLabel(id,v){const r=LAB[id].game.rule,vv=v==null?STATE[id][r.k]:v,o=r.opts.find(x=>x[0]===vv);return o?optT(o,STATE[id]):vv==="custom"?T("Regla propia","Own rule"):vv==="libre"?T("Sin cita","No booking"):""}
/* "75,0" in es-CL, "75.0" in en-US: strip the locale before parsing */
const deloc=s=>lang==="en"?String(s).replace(/,/g,""):String(s).replace(/\./g,"").replace(",",".");
function resultNow(id,stIn){const st=stIn||STATE[id],G=LAB[id].game;const ms=G.metrics(G.eff?G.eff(st):st);let i=ms.findIndex(m=>m.cur&&!m.aux);const aux=ms.find(m=>m.aux);const two=i<0&&id==="ikea";if(i<0)i=0;const rk=G.rule.k,cfg=Object.assign({},st);delete cfg[rk];return Object.assign({},ms[i],{second:aux||(two?ms[1]:null),obs:!stIn&&V.S&&V.S.obs?V.S.obs():null,/* built at render time so it follows the language */cfg:JSON.stringify(cfg),stJ:JSON.stringify(st),rule:st[rk],ruleL:ruleLabel(id,st[rk]),num:parseFloat(deloc(String(ms[i].v).replace(/[^\d,.\-−]/g,"").replace("−","-")))})}
/* «Antes → ahora»: the change between two runs, as a percent (or ×N when it grows a lot) */
function cmpBig(prev,r){/* both under 1 (0,1 → 0,0 min): a percent would say −100 %; show the difference */if(prev.num&&Math.max(Math.abs(prev.num),Math.abs(r.num))<1){const dd=r.num-prev.num;return{d:Math.sign(dd),big:`${dd>0?"+":dd<0?"−":""}${nf(Math.abs(dd),1)} ${r.u}`}}const d=prev.num?Math.max(r.num>0?-99:-100,Math.round((r.num-prev.num)/Math.abs(prev.num)*100)):(r.num>prev.num?1:r.num<prev.num?-1:0);const big=!prev.num?`${r.num>0?"+":""}${nf(r.num-prev.num,1)} ${r.u}`:d>=200?`×${nf(r.num/prev.num,r.num/prev.num<10?1:0)}`:`${d>0?"+":d<0?"−":""}${nf(Math.abs(d))} %`;return{d,big}}
function parseNum(s){const m=deloc(s).match(/-?\d+(\.\d+)?/);return m?{n:+m[0],pre:String(s).slice(0,String(s).search(/[-\d]/)),dec:(m[1]||"").length-(m[1]?1:0)}:null}
function tween(el,from,to){cancelAnimationFrame(el._r);const a=parseNum(from),b=parseNum(to);if(!a||!b||reduce||a.pre!==b.pre){el.textContent=to;return}const t0=performance.now(),D=700;const step=now=>{const p=Math.min(1,(now-t0)/D),e=1-Math.pow(1-p,3);el.textContent=b.pre+nf(a.n+(b.n-a.n)*e,b.dec);if(p<1)el._r=requestAnimationFrame(step);else el.textContent=to};el._r=requestAnimationFrame(step)}
function renderPanel(id){requestAnimationFrame(()=>{sizeStage();V.dirty=3});setTimeout(()=>{sizeStage();V.dirty=3},380);const pan=$("panel");if(!pan)return;const lab=LAB[id],G=lab.game,st=STATE[id];$("app").dataset.mode=V.mode;
 if(V.mode==="run"){pan.innerHTML=`<div class="running"><div class="rtop"><span class="rlbl">${T("Simulando","Simulating")} ${rw(id)}…</span><button class="skip" id="skip" type="button">${T("Saltar al final","Skip to the end")} ⏭</button></div><div class="pbar"><i id="prog"></i></div></div>`;$("skip").addEventListener("click",()=>{V.skip=true;hideCoach()});return}
 if(V.mode==="done"){const r=V.res,prev=V.prev;let cmp="";
  const sameCfg=prev&&prev.cfg===r.cfg;
  if(prev&&(prev.rule!==r.rule||prev.v!==r.v)&&isFinite(prev.num)&&isFinite(r.num)&&prev.u===r.u){const{d,big}=cmpBig(prev,r);cmp=`<div class="rcmp"><span>${T("Antes","Before")} · ${prev.ruleL}${sameCfg?"":T(" (otros números)"," (other numbers)")}</span><b>${prev.v} ${prev.u}</b><i class="${d<0?"down":d>0?"up":""}">${big}</i></div>`}
  const sol=G.cta.set,solOn=Object.keys(sol).every(k=>st[k]===sol[k]);const nextV=G.next?G.next[st[G.rule.k]]||null:(!solOn&&G.rule.k in sol?sol[G.rule.k]:null);const solL=ruleLabel(id,nextV);
  const nextBtn=nextV?`<button class="play" id="trysol" type="button">▶ ${T("Probar","Try")} «${solL}»</button>`:`<button class="play" id="again" type="button">▶ ${T("Probar otra regla","Try another rule")}</button>`;
  /* the lesson only when the result really improved; when it got worse, say why (lower is better in every lab) */
  /* a lesson only between runs with the same numbers and a different rule (so "same docks, same trucks" is always true) */
  const moved=prev&&sameCfg&&prev.rule!==r.rule&&isFinite(prev.num)&&isFinite(r.num)&&prev.u===r.u;const better=moved&&r.num<prev.num-1e-9,worse=moved&&r.num>prev.num+1e-9;
  const lesson=better&&solOn?`<p class="raha">${typeof G.aha==="function"?G.aha(eff(id)):tx(G.aha)}</p>`:worse?`<p class="rouch">${(G.ouch&&G.ouch(eff(id),prev.rule,r.rule))||T("Con tus números esta regla sale peor. Prueba otra o cambia los números.","With your numbers this rule comes out worse. Try another or change the numbers.")}</p>`:"";
  pan.innerHTML=`<div class="result"><div class="rbig ${r.t}"><b id="rv">${r.v}</b><span>${r.u}</span></div><div class="rl">${r.l}</div>${r.second?`<div class="r2"><b>${r.second.v} ${r.second.u}</b> ${r.second.l}</div>`:""}${r.obs?`<div class="robs">${T("Esta partida","This round")}: <b>${r.obs.v}</b> ${r.obs.l} · ${T("el grande es el promedio","the big one is the average")}</div>`:""}${r.note?`<div class="rnote">${r.note}</div>`:""}${cmp}${lesson}${nextBtn}<button class="play copy" id="copyres" type="button">${T("Copiar resultado","Copy result")}</button><div class="links"><button type="button" id="edit">${T("Cambiar los números","Change the numbers")}</button><button type="button" data-sheet="ciencia">${T("Por qué pasa","Why it happens")}</button><button type="button" data-sheet="share">${T("Compartir","Share")}</button></div></div>`;
  if(prev&&isFinite(prev.num)&&prev.u===r.u)tween($("rv"),prev.v,r.v);
  const t=$("trysol");if(t)t.addEventListener("click",()=>{V.mode="ready";onCtl(id,{[G.rule.k]:nextV},{force:true,noScene:true});play(id)});
  const a=$("again");if(a)a.addEventListener("click",()=>{V.mode="ready";renderPanel(id);mountLabScene(id)});
  $("copyres").addEventListener("click",()=>copyText(shareText(id)));$("edit").addEventListener("click",()=>openSheet(id,"ajustar"));qsa("[data-sheet]",pan).forEach(b=>b.addEventListener("click",()=>openSheet(id,b.dataset.sheet)));return}
 pan.innerHTML=`<p class="sit">${SIT[id](eff(id))}</p><div class="seg big rp-${id}" id="rulepick" role="group" aria-label="${tx({es:G.rule.es,en:G.rule.en})}">${G.rule.opts.filter(o=>o[4]!=="adv"||st[G.rule.k]===o[0]).map(o=>`<button type="button" data-v="${o[0]}" aria-pressed="${String(st[G.rule.k]===o[0])}">${optL(o,st)}</button>`).join("")}</div>${(()=>{const o=G.rule.opts.find(x=>x[0]===st[G.rule.k]);return o&&o[3]?`<p class="seghint" id="rulehint">${optH(o,st)}</p>`:""})()}<button class="play" id="play" type="button">▶ ${T("Simular","Simulate")} ${rw(id)}</button><div class="links"><button type="button" data-sheet="ajustar">${T("Cambiar los números","Change the numbers")}</button><button type="button" data-sheet="ciencia">${T("Por qué pasa","Why it happens")}</button></div>`;
 qsa("#rulepick button",pan).forEach(b=>b.addEventListener("click",()=>onCtl(id,{[G.rule.k]:b.dataset.v})));
 $("play").addEventListener("click",()=>play(id));qsa("[data-sheet]",pan).forEach(b=>b.addEventListener("click",()=>openSheet(id,b.dataset.sheet)))}
function play(id){if(V.running)return;hideCoach();if(SHEET.kind)closeSheet();clearTimeout(sceneT);mountLabScene(id);if(!V.S||!V.S.startRun){V.mode="done";finishRun(true);return}gc("simular-"+id,1);V.S.startRun();V.running=true;V.skip=reduce;V.runSp=RUNSP[id]||1;V.mode="run";renderPanel(id);buzz(8)}
function finishRun(noScene){V.running=false;const id=V.id;if(!id)return;gc("resultado-"+id,1);const r=resultNow(id);V.prev=RUNS[id]||null;V.res=r;RUNS[id]=r;V.mode="done";if(V.S)V.S.cap="";V.cap=null;/* null ≠ "" so hud() clears the old subtitle from the DOM */V.dirty=2;V.settle=1.0;/* let the trucks finish their last move after a skip */renderPanel(id);buzz([10,40,10])}
function toast(h,t,ms){const el=$("toast");el.innerHTML=`<b>${h}</b>${t?`<span>${t}</span>`:""}`;el.hidden=false;el.classList.remove("in");void el.offsetWidth;el.classList.add("in");clearTimeout(el._t);el._t=setTimeout(()=>el.hidden=true,ms||2600)}

/* ---------- lab (full-bleed game) ---------- */
const ICON={sum:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5C4 5 5 4 6.5 4H11v16H6.5C5 20 4 19 4 17.5zM13 4h4.5C19 4 20 5 20 6.5v11c0 1.5-1 2.5-2.5 2.5H13z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`,gear:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h2M10 17h10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="16" cy="7" r="2.4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="8" cy="17" r="2.4" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,share:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4M7 9l5-5 5 5M5 14v5h14v-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,eye:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 3 8l9 5 9-5-9-5zM3 13l9 5 9-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,back:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`};
function renderLab(id){V.mode="ready";V.prev=null;V.res=null;delete RUNS[id];
 $("v-lab").innerHTML=`<div class="game" id="app" data-mode="ready">
  <div class="stage" id="stage"><div class="labels"></div><div class="clockpill" id="clk"></div><div class="caption"></div></div>
  <header class="g-top"><a class="g-btn" href="#inicio" aria-label="${T("Inicio","Home")}">${ICON.back}</a><button class="g-title" id="reels" type="button" title="${T("Cambiar de reel","Switch reel")}">${titleHTML(id)}</button></header>
  <div class="panel" id="panel"></div><div class="bubble" id="bubble" hidden></div><div class="coach" id="coach" hidden aria-hidden="true">${HAND}</div></div>`;/* no floating control on the stage: one thing at a time */
 renderPanel(id);$("reels").addEventListener("click",()=>openSheet(id,"reels"));bindTaps(id);if(!SEEN[id]){SEEN[id]=1;coachLater("#play",1300,4200)}}
const SEEN={};
function titleHTML(id){const lab=LAB[id];return `<small>${REELNUM[id]&&pub(id)?`Reel #${REELNUM[id]} · `:""}${tx(lab.kicker)}</small><b>${tx(lab.q)}</b><i class="chev" aria-hidden="true">▾</i>`}
/* ---------- tapping the scene: trucks tell their story; empty ground points to the control ---------- */
const RAY=HAS3?new THREE.Raycaster():null,_p2=HAS3?new THREE.Vector2():null;
function bindTaps(id){const st=$("stage");let d0=null;st.addEventListener("pointerdown",e=>{d0={x:e.clientX,y:e.clientY,t:performance.now()};hideCoach()});
 st.addEventListener("pointerup",e=>{if(!d0)return;const mv=Math.hypot(e.clientX-d0.x,e.clientY-d0.y),dt=performance.now()-d0.t;d0=null;if(mv>12||dt>600||e.target.closest(".bubble"))return;if(SHEET.kind==="ajustar"){closeSheet();return}tapScene(id,e.clientX,e.clientY)})}
function tapScene(id,cx,cy){const S=V.S,host=V.host;if(!S||!RAY)return;const r=host.getBoundingClientRect();_p2.set((cx-r.left)/r.width*2-1,-(cy-r.top)/r.height*2+1);RAY.setFromCamera(_p2,S.cam);
 if(S.fleet&&S.info){const ims=S.fleet.parts.slice(1,4).map(p=>p.im);let hit=RAY.intersectObjects(ims,false).find(h=>h.instanceId!=null&&S.fleet.on[h.instanceId]);
  if(!hit){const F=S.fleet;let best=-1,bd=44;for(let i=0;i<F.n;i++){if(!F.on[i]||F.s[i]<0.5)continue;_v.set(F.cx[i],1.1*F.sc,F.cz[i]);if(S.root)S.root.localToWorld(_v);_v.project(S.cam);const dx=(_v.x+1)/2*r.width+r.left-cx,dy=(1-_v.y)/2*r.height+r.top-cy;const dd=Math.hypot(dx,dy);if(dd<bd){bd=dd;best=i}}if(best>=0)hit={instanceId:best}}
  if(hit){const html=S.info(hit.instanceId);if(html){V.bubble={i:hit.instanceId,until:performance.now()+2600,html};const b=$("bubble");b.innerHTML=html;b.hidden=false;b.classList.remove("in");void b.offsetWidth;b.classList.add("in");buzz(5);return}}}
 if(V.mode==="ready")coachLater("#play",0,2400)}
/* ---------- the hand that shows where to tap (no words) ---------- */
const HAND=`<svg viewBox="0 0 64 64" width="56" height="56"><path d="M24 30V12a4 4 0 0 1 8 0v14l2-.5a4 4 0 0 1 4 1.5l1 1.2a4 4 0 0 1 4 .3l1 1a4 4 0 0 1 4 1.5c3 4 3 9 1 14l-3 7a8 8 0 0 1-7.4 5H31a8 8 0 0 1-6.4-3.2L15 41a4 4 0 0 1 5.6-5.6z" fill="#F7F3EA" stroke="#0F1729" stroke-width="3" stroke-linejoin="round"/></svg>`;
let coachT=0,coachH=0;
function coachLater(sel,delay,dur){clearTimeout(coachT);coachT=setTimeout(()=>{const t=document.querySelector(sel),c=$("coach");if(!t||!c||!t.offsetParent)return;const r=t.getBoundingClientRect();c.style.left=(r.left+r.width*0.84)+"px";c.style.top=(r.top+r.height*0.55)+"px";c.hidden=false;c.classList.remove("go");void c.offsetWidth;c.classList.add("go");clearTimeout(coachH);coachH=setTimeout(hideCoach,dur||4000)},delay||0)}
function hideCoach(){clearTimeout(coachT);const c=$("coach");if(c)c.hidden=true}

/* ---------- sheets ---------- */
const SHEET={id:null,kind:null};
function openSheet(id,kind){SHEET.id=id;SHEET.kind=kind;const sh=$("sheet");sh.hidden=false;sh.classList.toggle("light",kind==="ajustar");document.body.classList.add("sheet-open");refreshSheet(true);requestAnimationFrame(()=>sh.classList.add("up"));}
function closeSheet(){const sh=$("sheet");sh.classList.remove("up");document.body.classList.remove("sheet-open");SHEET.kind=null;setTimeout(()=>{if(!SHEET.kind){sh.hidden=true;$("sheet-body").innerHTML=""}},280)}
function refreshSheet(first){const id=SHEET.id,kind=SHEET.kind;if(!kind)return;const lab=LAB[id],G=lab.game,st=STATE[id],e=eff(id),body=$("sheet-body");let h="";
 if(kind==="ajustar"){const foc=[];h=`<h2>${L("Más palancas","More levers")}</h2><p class="lead">${L("Mueve y mira la maqueta: cambia al instante.","Move them and watch the model: it changes instantly.")}</p>${ctlHTML(lab,"a",G.rule,foc.includes(G.rule.k))}<div class="sliders">${G.sliders.map(s=>ctlHTML(lab,"a",s,foc.includes(s.k))).join("")}</div>
  <div class="chips" id="chips">${G.chips.map((ch,i)=>`<button type="button" class="chip" data-i="${i}"><i class="dot ${ch[0]}"></i>${L(ch[1],ch[2])}</button>`).join("")}</div>
  ${(G.reto||[]).length?`<details class="xtra"><summary>${L("Perilla extra · ¿le ganas al modelo?","Extra knob · can you beat the model?")}</summary>${G.reto.map(c=>ctlHTML(lab,"r",c,foc.includes(c.k))).join("")}<p class="cost">${L(lab.reto.cost)}</p></details>`:""}
  ${G.ajustes.length?`<details class="xtra"><summary>${L("Tus propios números","Your own numbers")}</summary>${G.ajustes.map(c=>ctlHTML(lab,"m",c,foc.includes(c.k))).join("")}</details>`:""}<div class="vrow"><span>${T("Vista de la maqueta","Model view")}</span><div class="seg"><button type="button" data-view="3d" aria-pressed="${!V.top}">3D</button><button type="button" data-view="top" aria-pressed="${V.top}">${T("Desde arriba","From above")}</button></div></div><div class="vrow"><span>${T("Idioma","Language")}</span><div class="seg"><button type="button" class="lg" data-l="es" aria-pressed="${lang==="es"}">Español</button><button type="button" class="lg" data-l="en" aria-pressed="${lang==="en"}">English</button></div></div><button class="ghost" type="button" id="reset">${L("Volver al ejemplo del reel","Back to the reel example")}</button>`}
 else if(kind==="reels"){h=`<h2>${L("Cambiar de reel","Switch reel")}</h2><div class="mlist">${listedLabs().map(l=>`<a class="mrow${l.id===id?" cur":""}" href="#${l.id}" data-close><i>${REELNUM[l.id]?"#"+REELNUM[l.id]:"·"}</i><span><b>${tx(l.q)}</b><small>${tx(l.kicker)}</small></span></a>`).join("")}</div><a class="ghost" href="#biblioteca" data-close>${L("Ir a la biblioteca →","Go to the library →")}</a>`}
 else if(kind==="ciencia"){h=`<h2>${L("Por qué pasa","Why it happens")}</h2><div class="aha"><p><b>${tx(lab.aha.h)}</b> ${tx(typeof lab.aha.t==="function"?lab.aha.t(st):lab.aha.t)}</p></div><p class="lead">${L("Abre un libro: trae su ecuación o su dato clave y, cuando se puede, lo calcula con tus números.","Open a book: it brings its equation or key figure and, where possible, computes it with your numbers.")}</p><div class="shelfwall" style="--wall:${SHELFC[lab.cat]}"><div class="shelfrow">${spines(lab.sources)}</div><div class="plank"></div></div><div class="note"><h3>${L("Cuándo NO aplica","When it does NOT apply")}</h3><p>${L(lab.notApply)}</p></div>`}
 else if(kind==="share"){const ph=G.share(e),url=shareURL(id),full=shareText(id);const r=G.score(e),v=verdict(r);h=`<h2>${L("Comparte este caso","Share this case")}</h2><p class="lead">${L("Copia tu resultado y pégalo en los comentarios del reel en Instagram, o donde quieras.","Copy your result and paste it in the reel's comments on Instagram, or anywhere.")}</p><div class="quote" id="share-text">${ph}<span class="url">${url.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</span></div><p class="lead">${T("Frente al reel","Against the reel")}: <b id="pct">${pctTxt(r)}${pctTxt(r)!=="—"?" %":""}</b> <span class="verdict ${v.cls}" id="verdict">${v.h}</span></p>${r.why?`<p class="lead why">${r.why}</p>`:""}
  <div class="sharebtns"><button class="cta" type="button" id="copy">${L("Copiar mi resultado","Copy my result")}</button></div>`}
 body.innerHTML=h;
 if(kind==="ajustar"){bindCtls(id,body);syncCtls(id);qsa("[data-view]",body).forEach(b=>b.addEventListener("click",()=>{V.top=b.dataset.view==="top";V.elT=V.top?1.5:(V.S?V.S.el:0.62);V.dirty=2;qsa("[data-view]",body).forEach(x=>x.setAttribute("aria-pressed",String(x===b)))}));qsa(".lg",body).forEach(b=>b.addEventListener("click",()=>setLang(b.dataset.l)));qsa("#chips .chip",body).forEach(b=>b.addEventListener("click",()=>onCtl(id,G.chips[+b.dataset.i][3],{force:true})));$("reset").addEventListener("click",()=>{onCtl(id,Object.assign({},LAB[id].def),{force:true});refreshSheet()});const f=body.querySelector(".ctl.focus");if(f&&first)setTimeout(()=>f.scrollIntoView({block:"nearest"}),300)}
  if(kind==="ciencia")bindBooks(body);
 qsa("[data-close]",body).forEach(a=>a.addEventListener("click",closeSheet));
 if(kind==="share"){const full=()=>shareText(id);$("copy").addEventListener("click",()=>copyText(full()))}}
(function(){const sh=$("sheet");sh.querySelector(".sh-back").addEventListener("click",closeSheet);sh.querySelector(".sh-x").addEventListener("click",closeSheet);
 const hd=sh.querySelector(".sh-grab");let y0=null,dy=0;const panel=sh.querySelector(".sh-panel");
 hd.addEventListener("pointerdown",e=>{if(e.target.closest(".sh-x"))return;y0=e.clientY;dy=0;hd.setPointerCapture&&hd.setPointerCapture(e.pointerId);panel.style.transition="none"});
 hd.addEventListener("pointermove",e=>{if(y0===null)return;dy=Math.max(0,e.clientY-y0);panel.style.transform=`translateY(${dy}px)`});
 const end=()=>{if(y0===null)return;y0=null;panel.style.transition="";panel.style.transform="";if(dy>70)closeSheet()};hd.addEventListener("pointerup",end);hd.addEventListener("pointercancel",end)})();

/* ---------- share links ---------- */
function shareURL(id){const G=LAB[id].game,st=STATE[id];const q=new URLSearchParams();q.set("caso",id);G.url.forEach(([key,k,,out])=>{if(st[k]!==LAB[id].def[k]||["regla","eval","orden","empaque"].includes(key)){const o=out(st[k]);/* read-only legacy keys write nothing */if(o!=null)q.set(key,o)}});return location.origin+location.pathname+"?"+q.toString()}
function readURL(){const qp=new URLSearchParams(location.search);let id=qp.get("caso");const rn=qp.get("reel");if(rn&&REEL2LAB[rn])id=REEL2LAB[rn];if(!id||!LAB[id])return null;const G=LAB[id].game;let any=false;
 Object.assign(STATE[id],LAB[id].def);/* a shared link must open the same case on every phone: reset first, then apply */
 const defs=allDefs(id),st=STATE[id];
 G.url.forEach(([key,k,inn])=>{if(!qp.has(key))return;let v=inn(qp.get(key));if(v===undefined||v===null||(typeof v==="number"&&!isFinite(v)))return;const c=defs.find(x=>x.k===k);
  if(c){if(c.type==="seg"){if(!c.opts.some(o=>o[0]===v)&&!(k==="rule"&&(v==="custom"||v==="seis")))return}else if(c.type==="check")v=!!v;else{if(typeof v!=="number")return;const lo=c.range?c.range(st)[0]:c.min,hi=c.range?c.range(st)[1]:c.max;v=Math.max(lo,Math.min(hi,v));if(c.step){v=Math.min(hi,+(lo+Math.round((v-lo)/c.step)*c.step).toFixed(6))}else v=Math.round(v)}}
  else if(typeof v==="number"&&!(v>=0&&v<=1e6))return;/* unknown keys: numbers in a sane range only */
  st[k]=v;any=true});/* apply onSet after all keys so a link with regla=propia keeps its rule */if(any){const ks=G.url.map(u=>u[1]);const hasRule=qp.has("regla");ks.forEach(k=>{if(qp.has(G.url.find(u=>u[1]===k)[0])&&LAB[id].onSet)LAB[id].onSet(st,k,hasRule?{[k]:st[k],rule:st.rule}:{[k]:st[k]})});INTRO[id]=false}return id}
function copyText(txt){gc("copiar-"+(V.id||"inicio"),1);window.__lastShare=txt;const ok=()=>toast(T("¡Copiado!","Copied!"),T("Pégalo en los comentarios del reel.","Paste it in the reel's comments."));
 const fb=()=>{const ta=document.createElement("textarea");ta.value=txt;ta.setAttribute("readonly","");ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();let d=false;try{d=document.execCommand("copy")}catch(e){}ta.remove();if(d)ok();else toast(T("Copia este texto:","Copy this text:"),txt,8000)};
 try{navigator.clipboard.writeText(txt).then(ok,fb)}catch(e){fb()}}

/* ---------- books: colorful, with their equation inside ---------- */
function bookCol(sid){const i=SOURCES.findIndex(s=>s.id===sid);return BPAL[i%BPAL.length]}
function spines(ids,small){return ids.map((sid,i)=>{const s=SRC[sid],c=bookCol(sid),pat=["dots","stripes","waves","plain"][i%4];const h=small?132+((i*37)%30):170+((i*53)%42),w=small?32+((i*13)%10):40+((i*17)%14);const [nm,tp]=(lang==="en"&&s.spEn?s.spEn:s.sp).split(" · ");return `<button class="book ${pat}" type="button" data-book="${sid}" style="--bc:${c};height:${h}px;width:${w}px" aria-label="${s.au}, ${sv(s.yr)}"><span class="bt"><b>${nm}</b>${tp?`<i>${tp}</i>`:""}</span><span class="by">${sv(s.yr)}</span></button>`}).join("")}
/* the library wall: one bookcase, books flow shelf after shelf, a small label marks where each section starts */
/* the bookcase: one grid per section, so a section always starts its own shelf; the last shelf of each section is padded with quiet filler spines */
function caseHTML(secs){const mob=window.innerWidth<=700,sw=mob?50:58,gap=mob?6:8,pad=mob?24:48;const host=$("shelves");const avail=(host&&host.clientWidth?Math.min(host.clientWidth,1000):Math.min(window.innerWidth-44,1000))-pad;const cols=Math.max(4,Math.floor((avail+gap)/(sw+gap)));const FILL=["#2A3A66","#33446F","#3B4C78","#26365E"];
 return `<div class="case">${secs.map(sec=>{let col=0;const cells=[];if(sec.label){cells.push(`<div class="bookend" aria-hidden="true">${sec.label}</div>`);col++}
  sec.ids.forEach((sid,i)=>{const s=SRC[sid],c=bookCol(sid),pat=["dots","stripes","waves","plain"][i%4];const h=188+((i*53)%26);const [nm,tp]=(lang==="en"&&s.spEn?s.spEn:s.sp).split(" · ");cells.push(`<button class="book ${pat}" type="button" data-book="${sid}" style="--bc:${c};height:${h}px" aria-label="${s.au}, ${sv(s.yr)}"><span class="bt"><b>${nm}</b>${tp?`<i>${tp}</i>`:""}</span><span class="by">${sv(s.yr)}</span></button>`);col++});
  while(col%cols!==0){cells.push(`<div class="book filler" style="--bc:${FILL[col%FILL.length]};height:${166+((col*37)%30)}px" aria-hidden="true"></div>`);col++}
  return `<div class="case-grid" data-sec="${sec.key}" role="group" aria-label="${T(sec.title.es,sec.title.en)}">${cells.join("")}</div>`}).join("")}</div>`}
let SHF="todos";
/* the library by reel: one section per published reel, newest first (the order of the home page). A book used by
   several published reels goes once, in a joint section right after the newest of them: «Andenes · compartidos
   (Reel #4 y Reel #6)» when they share a topic, «Compartidos · Reel #3 y Reel #5» when not. Publishing a reel
   (PUBLICADO) moves its books by itself. */
const reelName=l=>l.name||{es:l.kicker.es.split(" · ").pop(),en:l.kicker.en.split(" · ").pop()};
const andList=(xs,l)=>xs.length<2?xs.join(""):xs.slice(0,-1).join(", ")+(l==="en"?" and ":" y ")+xs[xs.length-1];
function libSections(){const labs=listedLabs(),pos={};labs.forEach((l,i)=>pos[l.id]=i);const own={},joint={};
 labs.forEach(l=>{const n="Reel #"+REELNUM[l.id],nm=reelName(l);own[l.id]={key:l.id,labs:[l.id],ids:[],t1:{es:n,en:n},t2:nm,title:{es:`${n} · ${nm.es}`,en:`${n} · ${nm.en}`}}});
 visSources().forEach(s=>{const ls=s.labs.filter(id=>id in pos).sort((a,b)=>pos[a]-pos[b]);if(!ls.length)return;if(ls.length===1){own[ls[0]].ids.push(s.id);return}
  const key=ls.join("+");if(!joint[key]){const rs={};["es","en"].forEach(l=>rs[l]=andList(ls.slice().reverse().map(id=>"Reel #"+REELNUM[id]),l));const cats=[...new Set(ls.map(id=>LAB[id].cat))];const top=cats.length===1&&CATS.find(c=>c[0]===cats[0]);
   joint[key]=top?{key,labs:ls,ids:[],t1:{es:`${top[1]} · compartidos`,en:`${top[2]} · shared`},t2:rs,title:{es:`${top[1]} · compartidos (${rs.es})`,en:`${top[2]} · shared (${rs.en})`}}
    :{key,labs:ls,ids:[],t1:{es:"Compartidos",en:"Shared"},t2:rs,title:{es:`Compartidos · ${rs.es}`,en:`Shared · ${rs.en}`}}}
  joint[key].ids.push(s.id)});
 const out=[];labs.forEach(l=>{out.push(own[l.id]);Object.values(joint).filter(j=>j.labs[0]===l.id).sort((a,b)=>pos[a.labs[1]]-pos[b.labs[1]]).forEach(j=>out.push(j))});return out.filter(s=>s.ids.length)}
/* "Catorce fuentes de cinco reels": counted from what is visible, so publishing a reel updates it */
const NUMW={es:["cero","una","dos","tres","cuatro","cinco","seis","siete","ocho","nueve","diez","once","doce","trece","catorce","quince","dieciséis","diecisiete","dieciocho","diecinueve","veinte"],en:["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty"]};
const numW=(n,l,m)=>{const w=NUMW[l][n];if(!w)return String(n);const x=l==="es"&&m&&n===1?"un":w;return x[0].toUpperCase()+x.slice(1)};
const visShelves=()=>SHELVES.filter(sh=>visSources().some(x=>x.shelf===sh[0]));
function libIntro(){const n=visSources().length,k=listedLabs().length,lo=w=>w.toLowerCase();const el=$("libintro");if(!el)return;el.innerHTML=`<span class="es">${numW(n,"es")} ${n===1?"fuente":"fuentes"} de ${lo(numW(k,"es",true))} ${k===1?"reel":"reels"}, del más nuevo al primero. Cada libro cuenta su idea, trae su ecuación o su dato clave y, cuando se puede, lo calcula con tus números.</span><span class="en">${numW(n,"en")} ${n===1?"source":"sources"} from ${lo(numW(k,"en"))} ${k===1?"reel":"reels"}, newest first. Each book tells its idea, brings its equation or key figure and, where possible, computes it with your numbers.</span>`}
function renderLib(){libIntro();if(!visShelves().some(s=>s[0]===SHF))SHF="todos";$("libfilters").innerHTML=[["todos",{es:"Todos",en:"All"}]].concat(visShelves()).map(s=>`<button class="fchip" type="button" data-f="${s[0]}" aria-pressed="${SHF===s[0]}">${L(s[1])}</button>`).join("");
 qsa("#libfilters .fchip").forEach(b=>b.addEventListener("click",()=>{SHF=b.dataset.f;renderLib()}));
 /* each section opens with its brass bookend; inside, books go alphabetically by author; the topic chips keep the sections of that topic */
 const spOf=s=>lang==="en"&&s.spEn?s.spEn:s.sp;const byAu=(a,b)=>spOf(SRC[a]).localeCompare(spOf(SRC[b]),lang==="en"?"en":"es",{sensitivity:"base"});
 const lbl=(a,b)=>["es","en"].map(l=>`<span class="bl ${l}"><b>${a[l]}</b><i>${b[l]}</i></span>`).join("");
 $("shelves").innerHTML=caseHTML(libSections().filter(s=>SHF==="todos"||s.labs.some(id=>LAB[id].cat===SHF)).map(s=>({key:s.key,title:s.title,label:lbl(s.t1,s.t2),ids:s.ids.slice().sort(byAu)})));
 bindBooks($("v-biblioteca"))}
function bindBooks(root){qsa("[data-book]",root).forEach(b=>{if(b._bb)return;b._bb=1;b.addEventListener("click",()=>openBook(b.dataset.book))})}
let BOOKLIST=[],BOOKI=0;
function openBook(sid,list){const vis=visSources().map(s=>s.id),num=vis.includes(sid)?vis:SOURCES.map(s=>s.id);/* a book of an unpublished reel (private link) is numbered among all */BOOKLIST=list||num;BOOKI=BOOKLIST.indexOf(sid);const s=SRC[sid],c=bookCol(sid),E=EQ[sid];const m=$("bookm");
 const left=`<div class="pg-in"><span class="stamp">${tx(TYPES[s.ty])}</span><div class="pyr">${sv(s.yr)}</div><div class="pau">${s.au}</div><h3 class="pti">${sv(s.ti)}</h3>${s.ti&&s.ti.orig&&s.ti.orig!==sv(s.ti)?`<p class="porig">${s.ti.orig}</p>`:""}<p class="pve">${sv(s.ve)}</p><div class="pno">${T("Ficha","Card")} ${String(num.indexOf(sid)+1).padStart(2,"0")} / ${num.length}</div></div>`;
 const eqh=E?(E.stat?`<div class="bigstat">${typeof E.stat==="function"?E.stat():E.stat}</div><p class="statl">${E.f()}</p>`:`<div class="beq">${E.f()}</div>`):"";
 const B=typeof BIB!=="undefined"&&BIB[sid];const esc=t=>String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;");
 const story=B?`<p class="phook">${esc(tx(B.gancho))}</p><div class="pstory">${tx(B.historia).split(/\n\s*\n/).map(p=>`<p>${esc(p.trim())}</p>`).join("")}</div>`:"";
 const symh=t=>esc(t).replace(/_\(([^)]+)\)/g,"<sub>$1</sub>").replace(/_([A-Za-z0-9*]+)/g,"<sub>$1</sub>").replace(/\^\(([^)]+)\)/g,"<sup>$1</sup>").replace(/\^([A-Za-z0-9*]+)/g,"<sup>$1</sup>");/* t_i → t<sub>i</sub>, a^c → a<sup>c</sup> */
 const syms=B&&B.simbolos&&B.simbolos.length?`<dl class="syms">${B.simbolos.map(x=>`<dt>${symh(x.s)}</dt><dd>${esc(tx(x))}</dd>`).join("")}</dl>`:"";
 const extra=B?`<h4>${T("El dato","The figure")}</h4><p class="pdato">${symh(tx(B.dato))}</p><h4>${T("En terreno","On the ground")}</h4><p class="pterr">${esc(tx(B.terreno))}</p><div class="plim"><h4>${T("Cuándo no aplica","When it does not apply")}</h4><p>${esc(tx(B.limite))}</p></div><blockquote class="pfrase">${esc(tx(B.frase))}</blockquote>`:"";
 const right=`<div class="pg-in"><div class="m-only">${left}</div>${story}<h4>${T("La idea","The idea")}</h4><p class="pidea">${B?esc(tx(B.idea)):tx(s.idea)}</p>${E?`<h4>${E.stat?T("El dato de la fuente","The source's figure"):T("La ecuación","The equation")}</h4>${eqh}${syms}<div class="blive"><span>${T("Con tus números","With your numbers")}</span>${E.live()}</div>`:""}${extra}${(()=>{const u=s.labs.filter(pub);return u.length?`<h4>${T("La usamos en","We use it in")}</h4><div class="puses">${u.map(l=>`<a href="#${l}" data-close>${tx(LAB[l].q)}</a>`).join("")}</div>`:""})()}<a class="plink" href="${s.url}" target="_blank" rel="noopener">${s.search?T("Buscar la fuente ↗","Search the source ↗"):T("Abrir la fuente ↗","Open the source ↗")}</a><div class="pnav"><button type="button" data-nav="-1">← ${T("Anterior","Previous")}</button><button type="button" data-nav="1">${T("Siguiente","Next")} →</button></div></div>`;
 m.innerHTML=`<div class="bk-back" data-close></div><div class="bk" role="dialog" aria-modal="true" aria-label="${s.au} ${sv(s.yr)}" style="--bc:${c}"><button class="bk-x" type="button" data-close aria-label="${T("Cerrar","Close")}">×</button><div class="bk-page">${right}</div><div class="bk-cover"><div class="front"><div class="cv-pat"></div><div class="cv-yr">${sv(s.yr)}</div><div class="cv-ti">${lang==="en"&&s.spEn?s.spEn:s.sp}</div>${B?`<div class="cv-hook">${esc(tx(B.gancho))}</div>`:""}<div class="cv-eq">${E&&!E.stat?E.f():E&&E.stat?(typeof E.stat==="function"?E.stat():E.stat):""}</div><div class="cv-au">${s.au}</div><img src="${LOGO}" alt=""></div><div class="back">${left}</div></div></div>`;
 m.hidden=false;document.body.classList.add("modal");qsa("[data-close]",m).forEach(e=>e.addEventListener("click",()=>{closeBook();if(SHEET.kind)closeSheet()}));qsa("[data-nav]",m).forEach(b=>b.addEventListener("click",()=>{const n=BOOKLIST[(BOOKI+(+b.dataset.nav)+BOOKLIST.length)%BOOKLIST.length];openBook(n,BOOKLIST)}));
 requestAnimationFrame(()=>requestAnimationFrame(()=>{const bk=m.querySelector(".bk");if(bk)bk.classList.add("open")}));setTimeout(()=>{const x=m.querySelector(".bk-x");if(x)x.focus()},60)}
function closeBook(){const m=$("bookm");m.hidden=true;m.innerHTML="";document.body.classList.remove("modal")}
document.addEventListener("keydown",e=>{if(e.key!=="Escape")return;if(!$("bookm").hidden)closeBook();else if(SHEET.kind)closeSheet()});

/* ---------- home ---------- */
let FILTER="todos";const THUMB={};let thumbing=false;
function renderHome(){$("filters").innerHTML=CATS.map(c=>`<button class="fchip" type="button" data-f="${c[0]}" aria-pressed="${FILTER===c[0]}">${L(c[1],c[2])}</button>`).join("");
 qsa("#filters .fchip").forEach(b=>b.addEventListener("click",()=>{FILTER=b.dataset.f;renderHome()}));
 $("cards").innerHTML=listedLabs().filter(l=>FILTER==="todos"||l.cat===FILTER).map(l=>`<a class="card" href="#${l.id}"><div class="thumb">${THUMB[l.id]?`<img src="${THUMB[l.id]}" alt="">`:`<div class="ph"></div>`}${REELNUM[l.id]?`<span class="reeln">Reel #${REELNUM[l.id]}</span>`:""}<span class="chipn">${sv(l.chip)}</span></div><div class="cmeta"><span class="k">${L(l.kicker)}</span><h3>${L(l.q)}</h3><span class="go"><span></span>${L("Simular","Simulate")} →</span></div></a>`).join("");
 $("homeshelf").innerHTML=spines(["bailey1952","welch1952","bernoulli1713","dekoster2007","rausand2004","dantzig1959","lindley1952","holland2017","boysen2019","nhtsa2010","kaandorp2007","fleming1975"].filter(sid=>visSources().some(x=>x.id===sid)));bindBooks($("v-inicio"))}
/* card thumbnails: their own small renderer, so the hero diorama shows first and never flashes a thumbnail */
function thumbs(done){if(!HAS3||!renderer()){done&&done();return}const todo=LABS.filter(l=>!THUMB[l.id]);if(!todo.length||thumbing){done&&done();return}let R;try{R=new THREE.WebGLRenderer({antialias:false,alpha:false,powerPreference:"low-power"});R.setPixelRatio(1);R.shadowMap.enabled=false}catch(e){done&&done();return}thumbing=true;let i=0;
 const next=()=>{if(i>=todo.length||V.id){thumbing=false;try{R.dispose();R.forceContextLoss()}catch(e){}done&&done();return}const l=todo[i++];try{const st=Object.assign({},l.def);const S=l.scene(st);S.apply(st,"reset");S.prewarm();R.setClearColor(0x1A2747,1);R.setSize(600,760,false);const rot=S.long==="x";if(S.root)S.root.rotation.y=rot?Math.PI/2:0;fitCam(S.cam,orientBox(S.box,rot),600/760,S.azP,S.el,1.06);R.render(S.scene,S.cam);THUMB[l.id]=R.domElement.toDataURL("image/jpeg",0.85);R.setClearColor(0,0);disposeScene(S)}catch(e){console.warn(e)}
  const a=document.querySelector(`#cards a[href="#${l.id}"] .thumb`);if(a&&THUMB[l.id]){const ph=a.querySelector(".ph");if(ph)ph.outerHTML=`<img src="${THUMB[l.id]}" alt="">`}(window.requestIdleCallback?requestIdleCallback(next,{timeout:400}):setTimeout(next,60))};setTimeout(next,120)}
function mountHero(){const host=$("hero-stage");if(!host||!HAS3||!renderer()||V.id)return;const S=sceneHero();attach(host,S);S.prewarm()}

/* ---------- router & language ---------- */
/* which platform the visit came from: each bio carries ?src=ig|tt|yt (in-app browsers hide the referrer); counted once per visit as an event */(function(){try{const s=new URLSearchParams(location.search).get("src");if(s&&/^(ig|tt|yt)$/.test(s))gc("origen-"+s,1)}catch(e){}})();
function route(){V.running=false;V.skip=false;V.settle=0;clearTimeout(sceneT);/* a run never survives a change of page */const h=(location.hash||"#inicio").slice(1);const id=LAB[h]?h:null;const view=id?"lab":(h==="biblioteca"?"biblioteca":"inicio");gc(location.pathname+"#"+(id||view));
 closeBook();if(SHEET.kind)closeSheet();$("v-inicio").hidden=view!=="inicio";$("v-lab").hidden=view!=="lab";$("v-biblioteca").hidden=view!=="biblioteca";body.classList.toggle("in-app",view==="lab");
 qsa(".top [data-nav]").forEach(a=>a.setAttribute("aria-current",(a.dataset.nav===view)?"page":"false"));
 if(id){V.id=id;detach();renderLab(id);mountLabScene(id);docTitle();setTimeout(()=>{sizeStage()},60)}
 else{V.id=null;detach();$("v-lab").innerHTML="";docTitle();if(view==="inicio"){renderHome();mountHero();setTimeout(thumbs,250)}else{renderLib()}window.scrollTo(0,0)}}
function docTitle(){document.title=V.id?tx(LAB[V.id].q)+" · En Camino Logística":!$("v-biblioteca").hidden?T("Biblioteca","Library")+" · En Camino Logística":"En Camino Logística · "+T("Laboratorio","Lab")}
function setLang(l){if(l==="en")gc("idioma-en",1);lang=l;body.dataset.lang=l;document.documentElement.lang=l;qsa("[data-al-es]").forEach(e=>e.setAttribute("aria-label",e.dataset["al"+(l==="en"?"En":"Es")]));$("lang-es").setAttribute("aria-pressed",l==="es");$("lang-en").setAttribute("aria-pressed",l==="en");try{localStorage.setItem("ec-lang",l)}catch(e){}if($("v-biblioteca"))docTitle();
 if(V.id){const id=V.id;const t=$("reels");if(t)t.innerHTML=titleHTML(id);if(V.mode==="done"&&V.res){const o=V.res.obs;V.res=Object.assign(resultNow(id),{obs:o});if(V.prev&&V.prev.stJ)V.prev=Object.assign(resultNow(id,JSON.parse(V.prev.stJ)),{obs:V.prev.obs})}renderPanel(id);if(SHEET.kind)refreshSheet();
  /* labels and subtitle were built in the old language: rebuild them (ready) or drop them (done) */
  if(V.S){if(V.mode==="ready"&&V.S.tick&&!V.S.done)V.S.tick(0,0);else V.S.labels=[];const lb=V.host&&V.host.querySelector(".labels");if(lb)lb.innerHTML="";V.lbl="";V.cap=null;V.dirty=2}}else if(!$("v-biblioteca").hidden)renderLib();else renderHome()}
$("lang-es").addEventListener("click",()=>setLang("es"));$("lang-en").addEventListener("click",()=>setLang("en"));
$("cta-play").addEventListener("click",()=>{const el=$("labs");if(el)el.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"})});
window.addEventListener("hashchange",route);let rsT=0;window.addEventListener("resize",()=>{setTimeout(sizeStage,80);clearTimeout(rsT);rsT=setTimeout(()=>{if(!$("v-biblioteca").hidden)renderLib()},200)});
const deep=readURL();if(deep){history.replaceState(null,"",location.pathname+"#"+deep)}
setLang(lang);route();
window.ECAPP={get mode(){return V.mode},get running(){return V.running},play:()=>play(V.id),skip:()=>{V.skip=true},tap:(x,y)=>tapScene(V.id,x,y),get coach(){const c=$("coach");return !!c&&!c.hidden},get S(){return V.S},get cam(){return V.S?V.S.cam.position.toArray().map(x=>+x.toFixed(3)):null},get top(){return V.top},get elT(){return V.elT},LAB,STATE,SOURCES,INTRO,set:(id,o)=>onCtl(id,o,{force:true}),has3:HAS3,get renders(){return V.renders},get obs(){return V.res&&V.res.obs},shareURL,shareText,openBook,openSheet,closeSheet,metrics:id=>LAB[id].game.metrics(eff(id)),/* for the tests: the code paths behind the texts, and the language without re-rendering */dev:{get lang(){return lang},set lang(v){lang=v},LAB,EQ,SRC,BIB,readURL,resultNow,verdict,cmpBig,PUBLICADO,libSections:()=>libSections()}};
