/* Sabi app logic: opening animation, welcome and sign-in, provider setup and dashboard, screens and tabs,
   search, sorting and filters, the distance scale, bookings and saved providers.
   Needs data.js and questions.js loaded first. */
(function(){
'use strict';

const SORTS={
  near:(a,b)=>a.km-b.km,
  top:(a,b)=>b.rating-a.rating||b.reviews-a.reviews,
  fast:(a,b)=>a.sp[0]-b.sp[0]||a.km-b.km,
  cheap:(a,b)=>a.from-b.from
};
/* tab: which tab is open. svc: service being viewed. group: group being browsed.
   sel: provider being viewed. booked and saved are kept in memory only. */
const S={user:null,role:null,accounts:{},pro:null,ob:{step:0,edit:false},authMode:'up',af:{name:'',email:''},loc:{label:'Ikeja, Lagos',how:'sample location',short:'Ikeja'},tab:'explore',svc:null,group:null,sort:'near',open:false,express:false,top:false,sel:null,saved:{},booked:{},bk:{day:0,time:0},opener:null,dirty:false,armed:null,free:false,verified:false,nowSvc:null,quotes:[],bView:'list',rview:'list',bNotice:''};
const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=s=>document.querySelector(s);
const fmt=n=>'₦'+n.toLocaleString('en-US');
const drive=t=>Math.round(3+t.km*4.5);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SVC=id=>SERVICES.find(s=>s.id===id);
const isOwn=t=>S.role==='provider'&&!!S.pro&&S.pro.published===t;
const NEAR={};
PROVIDERS.forEach(p=>{NEAR[p.c]=(NEAR[p.c]||0)+1;});

/* Icons: path data for a 24 by 24 stroke icon */
const I={
  chev:'<path d="M9 5l7 7-7 7"/>',
  cal:'<rect x="4" y="5.5" width="16" height="15" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  bookmark:'<path d="M6 3h12v18l-6-4-6 4z"/>',
  care:'<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8 7.5L20 18M8 16.5L20 6"/>',
  home:'<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>',
  auto:'<path d="M4 17v-4l2-6h12l2 6v4z"/><path d="M4 13h16"/><circle cx="8" cy="17" r="1.7"/><circle cx="16" cy="17" r="1.7"/>',
  tech:'<rect x="5" y="5" width="14" height="10" rx="1.5"/><path d="M3 19h18"/>',
  biz:'<rect x="3.5" y="7.5" width="17" height="12" rx="2"/><path d="M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5M3.5 13h17"/>',
  food:'<path d="M7 3v8M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 11v10M17 3c-2 2-2.5 5-2.5 8H17v10"/>',
  edu:'<path d="M2.5 9L12 4.5 21.5 9 12 13.5z"/><path d="M6.5 11.2V16c0 1.2 2.5 2.5 5.5 2.5s5.5-1.3 5.5-2.5v-4.8M21.5 9v5"/>',
  health:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  fashion:'<path d="M8 4L3 7l2.5 4L8 10v10h8V10l2.5 1L21 7l-5-3c-.5 1.5-2 2.5-4 2.5S8.5 5.5 8 4z"/>',
  events:'<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
  security:'<path d="M12 3l7 3v5.5c0 4.5-3 7.8-7 9.5-4-1.7-7-5-7-9.5V6z"/><path d="M9 12l2.2 2.2L15 10.5"/>',
  agri:'<path d="M12 21v-9"/><path d="M12 12c0-4-2.5-6-7-6 0 4 2.5 6 7 6z"/><path d="M12 14c0-3.5 2-5.5 6-5.5 0 3.5-2 5.5-6 5.5z"/>',
  daily:'<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 20c1.2-3.6 4.2-5.5 8-5.5s6.8 1.9 8 5.5"/>',
  inbox:'<path d="M4 13l2.5-7h11L20 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M4 13h4.5l1 2.5h5l1-2.5H20"/>',
  grid:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  pin:'<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.5"/>',
  phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A15 15 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
  chat:'<path d="M4 5h16v11H9l-5 4z"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>'
};
const SHORT={care:'Grooming',home:'Home',auto:'Auto',tech:'Tech',biz:'Business',food:'Food',edu:'Education',health:'Health',fashion:'Fashion',events:'Events',security:'Security',agri:'Farming',daily:'Everyday'};
const svg=(path,sz,fill)=>'<svg viewBox="0 0 24 24" width="'+sz+'" height="'+sz+'" fill="'+(fill?'currentColor':'none')+'" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+path+'</svg>';
const STAR='<svg class="star" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/></svg>';

/* ---------- Home: popular services and categories ---------- */
const POPULAR=['barber','hairdresser-hairstylist','hair-braider','plumber','electrician','mechanic','tailor','makeup-artist','phone-repairer','laundry-and-dry-cleaning','photographer','private-tutor'];
$('#popular').innerHTML=POPULAR.map(SVC).filter(Boolean).map(s=>'<button class="chip" type="button" data-svc="'+s.id+'">'+esc(s.name)+'</button>').join('');
$('#cats').innerHTML=GROUPS.map((g,i)=>{
  const n=SERVICES.filter(s=>s.groups.indexOf(g.id)>-1).length;
  const wide=(i===GROUPS.length-1&&GROUPS.length%3===1)?' cat-wide':'';
  return '<button class="cat'+wide+'" type="button" data-group="'+g.id+'" aria-label="'+esc(g.name)+', '+n+' services"><span class="ic">'+svg(I[g.id],24)+'</span><span><span class="nm">'+SHORT[g.id]+'</span><span class="ct">'+n+' services</span></span></button>';
}).join('');

/* ---------- Search ---------- */
const norm=s=>s.toLowerCase().replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
SERVICES.forEach(s=>{
  s.key=norm(s.name);
  s.itemKeys=s.itemNames.map(norm);
  s.groupKeys=s.groups.map(g=>norm(GROUP(g).name));
});

/* Ranks services against what was typed: name first, then items on their price list, then group. */
function runSearch(q){
  q=norm(q);
  if(!q)return [];
  const tokens=q.split(' '),res=[];
  SERVICES.forEach(s=>{
    let score=0,hit='';
    if(s.key===q)score=100;
    else if(s.key.indexOf(q)===0)score=90;
    else if(s.key.split(' ').some(w=>w.indexOf(q)===0))score=80;
    else if(s.key.indexOf(q)>-1)score=70;
    else{
      const i=s.itemKeys.findIndex(k=>k.indexOf(q)>-1);
      if(i>-1){score=50;hit=s.itemNames[i];}
      else if(tokens.length>1){
        const pool=(s.key+' '+s.itemKeys.join(' ')).split(' ');
        if(tokens.every(t=>pool.some(w=>w.indexOf(t)===0)))score=40;
      }
      if(!score&&s.groupKeys.some(g=>g.indexOf(q)>-1))score=30;
    }
    if(score)res.push({s:s,score:score,hit:hit});
  });
  res.sort((a,b)=>b.score-a.score||a.s.name.localeCompare(b.s.name));
  return res.slice(0,8);
}

/* A search box with a list of suggestions that opens as you type. */
function makeSearch(input,list,onPick){
  let res=[],active=-1;
  function close(){
    list.hidden=true;
    input.setAttribute('aria-expanded','false');
    input.removeAttribute('aria-activedescendant');
    active=-1;
  }
  function setActive(i){
    active=i;
    const opts=list.querySelectorAll('[role="option"]');
    opts.forEach((el,k)=>el.setAttribute('aria-selected',String(k===i)));
    if(i>=0&&opts[i]){input.setAttribute('aria-activedescendant',opts[i].id);opts[i].scrollIntoView({block:'nearest'});}
    else input.removeAttribute('aria-activedescendant');
  }
  function open(){
    const q=input.value.trim();
    if(!q){close();return;}
    res=runSearch(q);
    list.innerHTML=res.length
      ?res.map((r,i)=>'<li role="option" class="opt" id="'+list.id+'-'+i+'" data-pick="'+r.s.id+'" aria-selected="false"><span class="opt-main"><b>'+esc(r.s.name)+'</b><small>'+(r.hit?'Includes '+esc(r.hit):esc(GROUP(r.s.groups[0]).name))+'</small></span><span class="opt-n">'+NEAR[r.s.id]+' nearby</span></li>').join('')
      :'<li class="opt-empty" role="presentation">No service matches “'+esc(q)+'”. Try a shorter word, or browse the categories.</li>';
    list.hidden=false;
    input.setAttribute('aria-expanded','true');
    setActive(-1);
  }
  function choose(id){close();onPick(id);}
  input.addEventListener('input',open);
  input.addEventListener('focus',()=>{input.select();});
  input.addEventListener('keydown',e=>{
    const n=list.hidden?0:res.length;
    if(e.key==='ArrowDown'){e.preventDefault();if(list.hidden){open();}else if(n){setActive((active+1)%n);}}
    else if(e.key==='ArrowUp'){e.preventDefault();if(n){setActive((active-1+n)%n);}}
    else if(e.key==='Enter'){
      e.preventDefault();
      const r=list.hidden?runSearch(input.value):res;
      const i=active>-1?active:0;
      if(r[i])choose(r[i].s.id);else open();
    }
    else if(e.key==='Escape'){close();}
  });
  list.addEventListener('mousedown',e=>e.preventDefault());
  list.addEventListener('click',e=>{const li=e.target.closest('[data-pick]');if(li)choose(li.dataset.pick);});
  return {
    close:close,
    go:function(){const r=runSearch(input.value);if(r.length)choose(r[0].s.id);else{open();input.focus();}}
  };
}

/* ---------- Navigation ----------
   Each screen is a section with id v-NAME. push() opens a screen on top of the current one,
   pop() goes back to where you were (with its scroll position), switchTab() starts a new stack. */
const VIEWS=['welcome','auth','onboard','home','group','search','results','detail','bookings','saved','pdash','preq','profile'];
const TABVIEW={explore:'home',bookings:'bookings',saved:'saved',profile:'profile',dash:'pdash',requests:'preq'};
const NOTABS={welcome:1,auth:1,onboard:1,detail:1,search:1};
const nav={cur:'welcome',stack:[]};
const scroller=v=>document.querySelector('#v-'+v+' .scroll');

function render(view){
  if(view==='group')renderGroup();
  else if(view==='results')renderResults();
  else if(view==='detail')renderDetail(S.sel);
  else if(view==='bookings')renderBookings();
  else if(view==='saved')renderSaved();
  else if(view==='auth')renderAuth();
  else if(view==='onboard')renderOnboard();
  else if(view==='pdash')renderPdash();
  else if(view==='preq')renderPreq();
  else if(view==='profile')renderProfile();
}
function show(view,dir,scrollTo){
  render(view);
  VIEWS.forEach(v=>{
    const el=$('#v-'+v);
    el.hidden=(v!==view);
    el.classList.remove('anim-push','anim-pop','anim-fade');
  });
  const el=$('#v-'+view);
  if(dir&&!reduce){void el.offsetWidth;el.classList.add('anim-'+dir);}
  nav.cur=view;
  $('#phone').classList.toggle('no-tabs',!!NOTABS[view]);
  const sc=scroller(view);
  if(sc)sc.scrollTop=scrollTo||0;
  updateTabs();
  const h=el.querySelector('[data-title]');
  if(h){try{h.focus({preventScroll:true});}catch(e){}}
}
function push(view){
  const sc=scroller(nav.cur);
  nav.stack.push({view:nav.cur,scroll:sc?sc.scrollTop:0});
  show(view,'push');
}
function pop(){
  const prev=nav.stack.pop();
  if(!prev){show(TABVIEW[S.tab],'fade');return;}
  show(prev.view,'pop',prev.scroll);
}
function switchTab(tab){
  S.tab=tab;
  nav.stack=[];
  show(TABVIEW[tab],'fade');
}
function renderAcct(){
  const u=S.user;
  document.querySelectorAll('.acct').forEach(b=>{
    b.hidden=!u;
    if(!u)return;
    b.querySelector('[data-acct-av]').textContent=initialsOf(u.name);
    b.querySelector('[data-acct-role]').textContent=S.role==='provider'?'Provider':'Customer';
    b.setAttribute('aria-label','Account: '+u.name+', '+(S.role==='provider'?'provider':'customer')+'. Switch role or sign out');
  });
}
function updateTabs(){
  renderAcct();
  document.querySelectorAll('.tab').forEach(b=>{
    if(b.dataset.tab===S.tab)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
  });
  const counts={
    bookings:Object.keys(S.booked).length,
    saved:Object.keys(S.saved).filter(k=>S.saved[k]).length,
    requests:S.pro&&S.pro.requests?S.pro.requests.filter(r=>r.status==='new').length:0
  };
  document.querySelectorAll('[data-badge]').forEach(el=>{
    const n=counts[el.dataset.badge]||0;
    el.textContent=n;
    el.hidden=!n;
  });
}

/* ---------- Screens ---------- */
function renderGroup(){
  const g=GROUP(S.group),list=SERVICES.filter(s=>s.groups.indexOf(g.id)>-1);
  $('#group-title').textContent=g.name;
  $('#group-sub').textContent=list.length+' services';
  $('#group-list').innerHTML=list.map(s=>'<button class="row" type="button" data-svc="'+s.id+'"><span class="row-main"><b>'+esc(s.name)+'</b><small>'+esc(s.itemNames.slice(0,3).join(' · '))+'</small></span><span class="row-n">'+NEAR[s.id]+' nearby</span>'+svg(I.chev,18)+'</button>').join('');
}

function filtered(){
  return PROVIDERS.filter(t=>t.c===S.svc&&(!S.open||t.open)&&(!S.express||t.perk)&&(!S.top||t.rating>=4.5)&&(!S.verified||isVerified(t))&&(!S.free||isFree(t))).sort(SORTS[S.sort]);
}

function tapeSVG(list){
  const W=340,pad=14,sc=(W-2*pad)/5,TH=26;
  const near=list.slice().sort((a,b)=>a.km-b.km);
  const lanes=Math.min(3,Math.max(1,near.length));
  const TT=36+(lanes-1)*28,H=TT+TH+6;
  let ticks='';
  for(let i=0;i<=50;i++){
    const x=(pad+i*sc/10).toFixed(1);
    const h=i%10===0?12:i%5===0?9:5;
    ticks+='<line class="tick" x1="'+x+'" y1="'+TT+'" x2="'+x+'" y2="'+(TT+h)+'"/>';
  }
  let nums='<text x="'+(pad+4)+'" y="'+(TT+23)+'">You</text>';
  for(let k=1;k<=5;k++){
    const x=pad+k*sc;
    nums+=k===5
      ?'<text x="'+(x-4).toFixed(1)+'" y="'+(TT+23)+'" text-anchor="end">5 km</text>'
      :'<text x="'+x.toFixed(1)+'" y="'+(TT+23)+'" text-anchor="middle">'+k+'</text>';
  }
  let pins='';
  near.forEach((t,i)=>{
    const lane=i%3,x=(pad+t.km*sc).toFixed(1),cy=TT-20-lane*28;
    pins+='<g class="pin '+(t.open?'pin-open':'pin-closed')+'" data-open="'+t.id+'" tabindex="0" role="button" aria-label="'+esc(t.name)+', '+t.km.toFixed(1)+' km, '+(t.open?'open now':'closed')+'">'
      +'<line class="stem" x1="'+x+'" y1="'+(cy+10)+'" x2="'+x+'" y2="'+TT+'"/>'
      +'<circle cx="'+x+'" cy="'+cy+'" r="10"/>'
      +'<text x="'+x+'" y="'+(cy+3.5)+'" text-anchor="middle">'+t.ini+'</text></g>';
  });
  return '<svg class="scale" viewBox="0 0 '+W+' '+H+'" role="group" aria-label="Results placed by distance from you on a scale from 0 to 5 kilometres">'
    +'<rect class="tape-bg" x="0" y="'+TT+'" width="'+W+'" height="'+TH+'" rx="3"/>'+ticks+'<g class="nums">'+nums+'</g>'+pins+'</svg>';
}

function statusPill(t,withHours){
  return t.open
    ?'<span class="pill pill-open"><i class="dot"></i>Open now</span>'
    :'<span class="pill"><i class="dot"></i>Closed'+(withHours?' · '+t.hours:'')+'</span>';
}
function perkPill(t){
  return t.perk?'<span class="pill pill-express">'+t.perk[0]+'</span>':'';
}

function card(t){
  const svc=SVC(t.c),bk=S.booked[t.id];
  const stat=(l,v)=>'<div class="stat"><dt>'+l+'</dt><dd>'+v+'</dd></div>';
  return '<article class="card">'
    +'<div class="card-top"><span class="avatar" aria-hidden="true">'+t.ini+'</span>'
    +'<div class="card-title"><button class="name-btn" type="button" data-open="'+t.id+'">'+esc(t.name)+'</button><span class="area">'+t.area+'</span></div>'
    +'<div class="dist"><b>'+t.km.toFixed(1)+' km</b><i>≈ '+drive(t)+' min drive</i></div></div>'
    +'<dl class="stats">'
      +stat('Rating',!t.reviews?'New':STAR+t.rating.toFixed(1)+' <small>('+t.reviews+')</small>')
      +stat('From',fmt(t.from))
      +stat(svc.label,t.sp[1])
    +'</dl>'
    +'<div class="pills">'+(t.id===S.best?'<span class="pill pill-best">'+STAR+'Best match</span>':'')+statusPill(t,true)+perkPill(t)+verifiedPill(t)+freePill(t)+(t.isNew?'<span class="pill">New on Sabi</span>':'<span class="pill">On time '+t.onTime+'%</span>')+(S.saved[t.id]?'<span class="pill">'+svg(I.bookmark,12,true)+'Saved</span>':'')+'</div>'
    +'<div class="card-foot"><p class="spec">'+esc(t.spec)+'</p>'
    +(isOwn(t)?'<span class="pill">Your listing</span>':bk?'<span class="pill pill-open booked">Booked '+esc(bk.day)+'</span>':'<button class="btn-book" type="button" data-book="'+t.id+'" aria-label="Book '+esc(t.name)+'">Book</button>')
    +'</div></article>';
}

function bestOf(list){
  const c=list.filter(t=>t.reviews>=5);
  if(list.length<3||!c.length)return null;
  const sc=t=>t.rating*20-t.km*3+(t.open?6:0)+(isVerified(t)?5:0)+(isFree(t)?4:0);
  return c.slice().sort((a,b)=>sc(b)-sc(a))[0].id;
}
function toast(msg){
  const el=$('#toast');
  if(!el)return;
  el.textContent=msg;el.hidden=false;
  clearTimeout(toast.t);toast.t=setTimeout(()=>{el.hidden=true;},2600);
}
function renderResults(){
  const svc=SVC(S.svc),list=filtered();
  $('#count').textContent=svc.name;
  $('#count-sub').textContent=list.length+(list.length===1?' provider':' providers')+' within 5 km of '+S.loc.short;
  $('#tape-panel').hidden=list.length===0;
  $('#tape').innerHTML=list.length?tapeSVG(list):'';
  S.best=bestOf(list);
  const cards=list.map(t=>card(t));
  if(cards.length)cards.splice(Math.min(3,cards.length),0,'<div class="quote-cta"><div><b>Not sure of the price?</b><span>Describe the job and get quotes from providers.</span></div><button class="btn btn-ghost btn-sm" type="button" data-act="quote-new">Get quotes</button></div>');
  $('#list').innerHTML=list.length?cards.join(''):
    '<div class="empty"><b>No providers match these filters</b><span>Turn a filter off to see more.</span><button class="btn btn-ghost" type="button" data-act="clear">Clear filters</button></div>';
  document.querySelectorAll('[data-sort]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sort===S.sort)));
  document.querySelectorAll('[data-f]').forEach(b=>b.setAttribute('aria-pressed',String(!!S[b.dataset.f])));
  applyView(list);
}

function stars(n){let s='';for(let i=1;i<=5;i++){s+=i<=n?'★':'☆';}return s;}

function renderDetail(id){
  const t=PROVIDERS.find(x=>x.id===id),svc=SVC(t.c);
  const bk=S.booked[id],sv=!!S.saved[id];
  const perk=t.perk?t.perk[1]:'No special options';
  const scoreRows=svc.scores.map((k,i)=>'<div class="score"><span>'+k+'</span><span class="track"><span class="fill" style="width:'+(t.scores[i]/5*100).toFixed(0)+'%"></span></span><span class="num">'+t.scores[i].toFixed(1)+'</span></div>').join('');
  const priceRows=t.services.map((s,i)=>isOwn(t)?'<li><span>'+esc(s[0])+'</span><span>'+fmt(s[1])+'</span></li>':'<li><button type="button" class="price-btn" data-pick="'+i+'" aria-label="Book '+esc(s[0])+', '+fmt(s[1])+'"><span>'+esc(s[0])+'</span><span>'+fmt(s[1])+' <i aria-hidden="true">›</i></span></button></li>').join('');
  const revRows=t.revs.map(r=>'<div class="rev"><div class="rev-top"><span><b>'+esc(r[0])+'</b> <span aria-label="'+r[1]+' out of 5">'+stars(r[1])+'</span></span><span>'+r[3]+'</span></div>'+(r[2]?'<p>'+esc(r[2])+'</p>':'')+'</div>').join('');
  const note=t.fabric?'Sewing fee only. Fabric: '+t.fabric.charAt(0).toLowerCase()+t.fabric.slice(1)+'.':svc.note;
  $('#detail-body').innerHTML=
    '<div class="d-head"><span class="avatar-lg" aria-hidden="true">'+t.ini+'</span><div class="d-meta"><h1 id="detail-title" data-title tabindex="-1">'+esc(t.name)+'</h1><span class="area">'+svc.name+' · '+t.area+' · '+yearsTxt(t)+'</span></div></div>'
    +'<div class="pills">'+statusPill(t,false)+'<span class="pill pill-plain">'+t.hours+'</span>'+perkPill(t)+verifiedPill(t)+freePill(t)+(bk?'<span class="pill pill-open">Booked '+esc(bk.day)+', '+bk.time+'</span>':'')+'</div>'
    +galleryHTML(t)+contactHTML(t)
    +'<div class="kv">'
      +'<div class="kv-item"><span class="k">Rating</span><span class="v">'+(!t.reviews?'New':STAR+t.rating.toFixed(1))+'</span><span class="s">'+(!t.reviews?'no reviews yet':t.reviews+(t.reviews===1?' review':' reviews'))+'</span></div>'
      +'<div class="kv-item"><span class="k">Distance</span><span class="v">'+t.km.toFixed(1)+' km</span><span class="s">≈ '+drive(t)+' min drive</span></div>'
      +'<div class="kv-item"><span class="k">'+svc.label+'</span><span class="v">'+t.sp[1]+'</span><span class="s">'+perk+'</span></div>'
      +'<div class="kv-item"><span class="k">On time</span><span class="v">'+(t.isNew?'New':t.onTime+'%')+'</span><span class="s">'+(t.isNew?'no jobs finished yet':'of jobs at the promised time')+'</span></div>'
    +'</div>'
    +'<div class="block"><h2>Price list</h2>'+(isOwn(t)?'':'<p class="hint">Tap an item to book it.</p>')+'<ul class="prices">'+priceRows+'</ul><p class="note">'+note+'</p></div>'
    +trustBlock(t)
    +dirBlock(t)
    +(t.qa&&t.qa.length?'<div class="block"><h2>About this provider</h2><dl class="qa">'+t.qa.map(r=>'<div><dt>'+esc(r[0])+'</dt><dd>'+esc(r[1])+'</dd></div>').join('')+'</dl></div>':'')
    +(t.isNew?'':'<div class="block"><h2>How they score</h2>'+scoreRows+'<div style="height:6px"></div></div>')
    +(t.revs.length?'<div class="block"><h2>Recent reviews</h2>'+revRows+'</div>':'<div class="block"><h2>Reviews</h2><p class="note" style="border-top:0">New on Sabi. Reviews appear after the first completed bookings.</p></div>');
  $('#detail-price').textContent=fmt(t.from);
  $('#book-btn').textContent=isOwn(t)?'Your listing':bk?'Change booking':'Book now';
  $('#book-btn').disabled=isOwn(t);
  $('#save-btn').hidden=isOwn(t);
  const sb=$('#save-btn');
  sb.setAttribute('aria-pressed',String(sv));
  sb.setAttribute('aria-label',sv?'Remove from saved':'Save');
  sb.innerHTML=svg(I.bookmark,24,sv);
}

function emptyState(icon,title,text,btn){
  return '<div class="empty-state"><span class="empty-ic">'+svg(icon,32)+'</span><h2>'+title+'</h2><p>'+text+'</p>'+btn+'</div>';
}

function renderBookingsList(){
  const ids=Object.keys(S.booked);
  return ids.length?ids.map(id=>{
    const t=PROVIDERS.find(x=>x.id===id),b=S.booked[id],armed=S.armed===id;
    return '<article class="bk">'
      +'<div class="bk-top"><span class="avatar" aria-hidden="true">'+t.ini+'</span><div><b>'+esc(t.name)+'</b><span class="area">'+esc(b.service)+'</span></div>'+(b.done?'<span class="pill">Completed</span>':'<span class="pill pill-open">Upcoming</span>')+'</div>'
      +'<dl class="ticket">'
        +'<div><dt>When</dt><dd>'+esc(b.day)+', '+b.time+'</dd></div>'
        +'<div><dt>Where</dt><dd>'+esc(t.area)+'</dd></div>'
        +(b.price?'<div><dt>Price</dt><dd>'+fmt(b.price)+'</dd></div>':'')
        +(b.note?'<div><dt>Your note</dt><dd>'+esc(b.note)+'</dd></div>':'')
        +'<div><dt>Reference</dt><dd class="mono">'+b.ref+'</dd></div>'
      +'</dl>'
      +trackHTML(id,b)
      +(b.done
        ?'<div class="bk-actions"><button class="btn btn-ghost btn-sm" type="button" data-open="'+id+'">View provider</button>'+(b.reviewed?'<span class="fine reviewed">You reviewed this provider.</span>':'<button class="btn btn-primary btn-sm" type="button" data-review="'+id+'">Leave a review</button>')+'</div>'
        :'<div class="bk-actions"><button class="btn btn-ghost btn-sm" type="button" data-open="'+id+'">View provider</button>'+(t.phone?'<a class="btn btn-ghost btn-sm" href="https://wa.me/'+t.phone+'" target="_blank" rel="noopener">WhatsApp</a>':'')+'<button class="btn btn-danger btn-sm" type="button" data-cancel="'+id+'">'+(armed?'Tap again to cancel':'Cancel booking')+'</button></div>'
         +'<p class="fine">In the real app the provider marks the job done. For the demo, <button class="linkbtn" type="button" data-done="'+id+'">mark it done</button>.</p>')
      +'</article>';
  }).join('')
  +'<p class="fine">Demo only. These bookings are kept on this screen and not sent anywhere.</p>'
  :emptyState(I.cal,'No bookings yet','Book a provider and it will show up here.','<button class="btn btn-primary" type="button" data-act="explore">Find a service</button>');
}

function renderBookings(){
  const nq=S.quotes.length;
  $('#bookings-body').innerHTML='<div class="seg seg-mini" role="group" aria-label="Bookings or quotes"><button type="button" data-bview="list" aria-pressed="'+(S.bView==='list')+'">Bookings</button><button type="button" data-bview="quotes" aria-pressed="'+(S.bView==='quotes')+'">Quotes'+(nq?' ('+nq+')':'')+'</button></div>'
    +(S.bNotice?'<p class="err" role="alert">'+esc(S.bNotice)+'</p>':'')
    +(S.bView==='quotes'?quotesHTML():renderBookingsList());
}
function renderSaved(){
  const list=PROVIDERS.filter(p=>S.saved[p.id]);
  $('#saved-body').innerHTML=list.length
    ?'<div class="list">'+list.map(card).join('')+'</div>'
    :emptyState(I.bookmark,'Nothing saved yet','Tap the bookmark on a provider to keep them here.','<button class="btn btn-primary" type="button" data-act="explore">Find a service</button>');
}

/* ---------- Accounts, provider setup and dashboard ----------
   Demo only. Accounts live in memory in this tab. A password is read when the form is
   submitted and is never kept or checked. Nothing is sent anywhere. */
const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const acctKey=(role,email)=>role+':'+email.toLowerCase();
const firstName=n=>String(n||'').trim().split(/\s+/)[0]||'there';
const initialsOf=n=>String(n).replace(/[^A-Za-z ]/g,'').split(' ').filter(Boolean).slice(0,2).map(w=>w.charAt(0)).join('').toUpperCase()||'S';
const nameFromEmail=e=>{const n=e.split('@')[0].replace(/[._-]+/g,' ').trim();return n.charAt(0).toUpperCase()+n.slice(1);};
const yearsTxt=t=>t.yearsText||(t.years+' years');
const HOURS=['Closes 5:00 pm','Closes 7:00 pm','Open 24 hours'];
const YEARS=[['Less than 1 year',0],['1 to 2 years',1],['3 to 5 years',3],['6 to 10 years',6],['More than 10 years',11]];
const OB_STEPS=6;
let mineN=0;

const newDraft=()=>({svc:null,biz:'',phone:'',photos:[],area:AREAS[0],years:-1,hours:1,ans:{},prices:[],sp:-1,pin:null,phoneOk:false,phoneChecked:'',codeSentFor:'',code:'',idPhoto:null,waAlerts:true});
const suggest=svc=>svc.itemNames.map((n,k)=>roundP(svc.itemPrices[k]!==null?svc.itemPrices[k]:svc.base*MULT[k]).toLocaleString('en-US'));
const qsOf=d=>d.svc?questionsFor(SVC(d.svc)):[];
const answerText=(q,a)=>q.type==='many'?(a&&a.length?a.join(', '):''):(a||'').trim();
const parsePrice=v=>{const s=String(v).replace(/[,\s₦]/g,'');return /^\d+$/.test(s)?parseInt(s,10):NaN;};
const pressed=(el,sel)=>document.querySelectorAll(sel).forEach(b=>b.setAttribute('aria-pressed',String(b===el)));

/* Tab bar. Customers and providers get different tabs. */
const TABS={
  customer:[['explore','Explore',I.search],['bookings','Bookings',I.cal,'bookings'],['saved','Saved',I.bookmark,'saved'],['profile','Profile',I.user]],
  provider:[['dash','Dashboard',I.grid],['requests','Requests',I.inbox,'requests'],['profile','Profile',I.user]]
};
function renderTabs(){
  const list=TABS[S.role]||[],bar=$('#tabbar');
  bar.style.gridTemplateColumns='repeat('+list.length+',minmax(0,1fr))';
  bar.innerHTML=list.map(t=>'<button class="tab" type="button" data-tab="'+t[0]+'"><span class="ti">'+svg(t[2],24)+'</span>'+t[1]+(t[3]?'<span class="tab-badge" data-badge="'+t[3]+'" hidden></span>':'')+'</button>').join('');
}

/* Sign in and create account */
function renderAuth(){
  const prov=S.role==='provider',up=S.authMode==='up';
  const inp=(id,label,type,ac,ph,val)=>'<div class="field"><label class="label" for="'+id+'">'+label+'</label><input class="inp" id="'+id+'" type="'+type+'" autocomplete="'+ac+'" placeholder="'+ph+'" value="'+esc(val)+'" maxlength="80"'+(type==='email'?' inputmode="email" autocapitalize="off" spellcheck="false"':'')+'></div>';
  $('#auth-title').textContent=prov?'Service provider':'Customer';
  $('#auth-sub').textContent=up?'Create your account':'Welcome back';
  document.querySelectorAll('#auth-mode button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===S.authMode)));
  $('#auth-intro').textContent=up
    ?(prov?'Create a provider account. Next you will answer a few questions about the service you offer. The questions change depending on the service you pick.':'Create an account to book providers and save the ones you like.')
    :(prov?'Sign in to manage your listing and requests.':'Sign in to see your bookings and saved providers.');
  $('#auth-fields').innerHTML=
    (up?inp('a-name',prov?'Your name':'Full name','text','name',prov?'Tope Adeyemi':'Your name',S.af.name):'')
    +inp('a-email','Email','email','email','name@example.com',S.af.email)
    +'<div class="field"><label class="label" for="a-pw">Password</label><div class="pw"><input class="inp" id="a-pw" type="password" autocomplete="'+(up?'new-password':'current-password')+'" placeholder="At least 6 characters" maxlength="64"><button class="pw-btn" type="button" data-act="pw" aria-pressed="false" aria-label="Show password">Show</button></div></div>';
  $('#auth-submit').textContent=up?'Create account':'Sign in';
  $('#auth-err').hidden=true;$('#auth-err').classList.remove('ok');
  $('#auth-note').hidden=API.enabled;
}
function authNotice(msg){const el=$('#auth-err');el.textContent=msg;el.hidden=false;el.classList.add('ok');}
function authError(msg,id){
  const el=$('#auth-err');
  el.textContent=msg;el.hidden=false;el.classList.remove('ok');
  const f=$('#'+id);
  if(f){f.setAttribute('aria-invalid','true');f.setAttribute('aria-describedby','auth-err');f.focus();}
}
$('#auth-form').addEventListener('input',e=>{
  if(e.target.id==='a-name')S.af.name=e.target.value;
  else if(e.target.id==='a-email')S.af.email=e.target.value;
  e.target.removeAttribute('aria-invalid');
  $('#auth-err').hidden=true;
});
$('#auth-form').addEventListener('submit',async e=>{
  e.preventDefault();
  const up=S.authMode==='up',name=S.af.name.trim(),email=S.af.email.trim(),pw=$('#a-pw').value;
  if(up&&name.length<2)return authError('Enter your name.','a-name');
  if(!EMAIL_RE.test(email))return authError('Enter a valid email address, like name@example.com.','a-email');
  if(pw.length<6)return authError('Use at least 6 characters for the password.','a-pw');
  if(API.failed)return authError('The sign-in service could not load. Check your connection and reload the page.','a-email');
  if(!API.enabled){$('#a-pw').value='';signIn(email,up?name:'');return;}
  const btn=$('#auth-submit');
  btn.disabled=true;btn.textContent='Please wait…';
  try{
    const r=up?await API.signUp(email,pw,name,S.role):await API.signIn(email,pw);
    if(r.confirm){
      $('#a-pw').value='';S.authMode='in';renderAuth();
      authNotice('We sent a link to '+email+'. Open it to confirm your account, then sign in here.');
    }else if(r.role!==S.role){
      await API.signOut();
      authError('This email is registered as a '+(r.role==='provider'?'service provider. Go back and choose "I offer a service"':'customer. Go back and choose "I need a service"')+'.','a-email');
    }else{
      $('#a-pw').value='';
      signIn(email,r.name);
    }
  }catch(err){
    authError(err&&err.message?err.message:'Something went wrong. Please try again.',err&&err.field||'a-email');
  }finally{
    btn.disabled=false;btn.textContent=S.authMode==='up'?'Create account':'Sign in';
  }
});

function signIn(email,name){
  const key=acctKey(S.role,email);
  let a=S.accounts[key];
  if(!a){
    a=S.accounts[key]={name:name||nameFromEmail(email),email:email,role:S.role,booked:{},saved:{},quotes:[],measure:{},
      pro:S.role==='provider'?{draft:newDraft(),published:null,requests:null,justPublished:false}:null};
  }else if(name){a.name=name;}
  S.user=a;S.booked=a.booked;S.saved=a.saved;S.pro=a.pro;S.quotes=a.quotes||(a.quotes=[]);S.bView='list';S.bNotice='';S.sel=null;S.svc=null;
  nav.stack=[];
  renderTabs();
  if(S.role==='provider'&&!a.pro.published){S.ob={step:0,edit:false};show('onboard','fade');return;}
  S.tab=S.role==='provider'?'dash':'explore';
  enterApp();
}
function enterApp(){
  nav.stack=[];
  const view=TABVIEW[S.tab];
  if(view==='home'){
    const h=$('#v-home');
    $('#q-home').value='';
    h.classList.add('first');
    setTimeout(()=>h.classList.remove('first'),reduce?0:1500);
  }
  show(view,'fade');
}
function signOut(){
  if(API.enabled)API.signOut();
  S.user=null;S.role=null;S.pro=null;S.booked={};S.saved={};S.quotes=[];S.free=false;S.verified=false;S.rview='list';S.sel=null;S.svc=null;S.tab='explore';
  $('#q-home').value='';$('#q-res').value='';
  ['pdash','preq','profile','bookings','saved','onboard','detail'].forEach(v=>{const el=$('#v-'+v+' .scroll');if(el&&v!=='onboard')el.innerHTML='';});
  $('#onboard-body').innerHTML='';$('#ob-head').innerHTML='';
  nav.stack=[];
  show('welcome','fade');
}

/* Provider setup. The questions in step 3 depend on the service chosen in step 1. */
function renderOnboard(){
  const d=S.pro.draft,step=S.ob.step,svc=d.svc?SVC(d.svc):null;
  $('#ob-sub').textContent='Step '+(step+1)+' of '+OB_STEPS;
  $('#ob-bar').style.width=((step+1)/OB_STEPS*100)+'%';
  $('#search-ob').hidden=step!==0;
  const back=$('#ob-back'),canBack=step>0||S.ob.edit;
  back.style.visibility=canBack?'visible':'hidden';
  back.disabled=!canBack;
  $('#ob-next').textContent=step===OB_STEPS-1?'Publish my listing':'Continue';
  const heads=[
    ['What service do you offer?','Search for it below. The questions that come next depend on what you pick.'],
    ['About your business','This is how customers will see you.'],
    [svc?'About your '+svc.name.toLowerCase()+' work':'About your work','These questions are for '+(svc?svc.name.toLowerCase():'your service')+'. Your answers appear on your listing.'],
    ['Your prices','Suggested prices are filled in. Change them to match yours. The lowest shows as “From”.'],
    ['Get verified','A Verified badge helps customers trust you. You can skip this and finish later.'],
    ['Check your listing','This is what customers will see.']
  ];
  $('#ob-head').innerHTML='<h2 class="ob-h" tabindex="-1">'+heads[step][0]+'</h2><p class="ob-p">'+heads[step][1]+'</p>';
  const chips=(items,sel,attr)=>'<div class="opts">'+items.map((t,i)=>'<button class="chip" type="button" '+attr+'="'+i+'" aria-pressed="'+(sel(i))+'">'+esc(t)+'</button>').join('')+'</div>';
  let h='';
  if(step===0){
    const inp=$('#q-ob');
    if(svc&&document.activeElement!==inp)inp.value=svc.name;
    h=(svc?'<div class="picked"><span class="ic">'+svg(I[svc.groups[0]],22)+'</span><span><b>'+esc(svc.name)+'</b><small>'+esc(GROUP(svc.groups[0]).name)+'</small></span><span class="pill pill-open">Selected</span></div>':'')
      +'<div><div class="sec-h"><h3 class="label" id="ob-pop">Popular</h3></div><div class="opts" role="group" aria-labelledby="ob-pop" style="margin-top:8px">'
      +POPULAR.map(SVC).filter(Boolean).map(s=>'<button class="chip" type="button" data-obsvc="'+s.id+'" aria-pressed="'+(d.svc===s.id)+'">'+esc(s.name)+'</button>').join('')+'</div></div>';
  }else if(step===1){
    h='<div class="field"><label class="label" for="ob-biz">Business name</label><input class="inp" id="ob-biz" type="text" maxlength="40" autocomplete="off" placeholder="For example, Tope’s Barbing Salon" value="'+esc(d.biz)+'"></div>'
      +phoneField(d)
      +pinField(d)
      +'<div class="field"><label class="label" for="ob-area">Where are you based?</label><select class="inp" id="ob-area">'+AREAS.map(a=>'<option'+(a===d.area?' selected':'')+'>'+esc(a)+'</option>').join('')+'</select></div>'
      +'<div class="field"><span class="label" id="ob-yl">How long have you done this?</span><div role="group" aria-labelledby="ob-yl">'+chips(YEARS.map(y=>y[0]),i=>d.years===i,'data-obyears')+'</div></div>'
      +'<div class="field"><span class="label" id="ob-hl">Working hours</span><div role="group" aria-labelledby="ob-hl">'+chips(HOURS,i=>d.hours===i,'data-obhours')+'</div></div>'+photoField(d);
  }else if(step===2){
    h=qsOf(d).map((q,n)=>{
      const lid='q-l-'+n,a=d.ans[q.id];
      if(q.type==='text')return '<div class="field"><label class="label" for="q-'+q.id+'">'+esc(q.q)+' <span class="aside">(optional)</span></label><input class="inp" id="q-'+q.id+'" type="text" maxlength="120" autocomplete="off" data-qt="'+q.id+'" placeholder="'+esc(q.ph||'')+'" value="'+esc(a||'')+'"></div>';
      return '<div class="field"><span class="label q" id="'+lid+'">'+esc(q.q)+(q.type==='many'?' <span class="aside">Pick all that apply</span>':'')+'</span><div class="opts" role="group" aria-labelledby="'+lid+'" id="g-'+q.id+'">'
        +q.opts.map((o,i)=>'<button class="chip" type="button" data-q="'+q.id+'" data-i="'+i+'" aria-pressed="'+(q.type==='many'?(a&&a.indexOf(o)>-1):a===o)+'">'+esc(o)+'</button>').join('')+'</div></div>';
    }).join('');
  }else if(step===3){
    h='<div class="field"><span class="label">Price for each item</span>'
      +svc.itemNames.map((nm,k)=>'<div class="price-row"><label for="pr-'+k+'">'+esc(nm)+'</label><div class="money"><span aria-hidden="true">₦</span><input class="inp" id="pr-'+k+'" type="text" inputmode="numeric" autocomplete="off" maxlength="9" data-price="'+k+'" value="'+esc(d.prices[k]||'')+'"></div></div>').join('')
      +'</div>'
      +'<div class="field"><span class="label" id="ob-spl">'+esc(svc.label)+'</span><div role="group" aria-labelledby="ob-spl">'+chips(SPEED[svc.kind].opts.map(o=>o[1]),i=>d.sp===i,'data-obsp')+'</div></div>';
  }else if(step===4){
    h=trustStep(d);
  }else{
    const prices=d.prices.map(parsePrice),qa=qsOf(d).map(q=>[q.q,answerText(q,d.ans[q.id])]).filter(x=>x[1]);
    h='<dl class="ticket">'
      +[['Service',svc.name],['Business',d.biz.trim()],['Area',d.area],['Experience',YEARS[d.years][0]],['Hours',HOURS[d.hours]],['Phone',localPhone(normPhone(d.phone))],['Verification',trustLine(d)],['Map pin',d.pin?'Pinned':'Not added'],['Photos',d.photos.length?d.photos.length+(d.photos.length===1?' photo':' photos'):'None'],['From',fmt(Math.min.apply(null,prices))],[svc.label,SPEED[svc.kind].opts[d.sp][1]]].map(r=>'<div><dt>'+esc(r[0])+'</dt><dd>'+esc(r[1])+'</dd></div>').join('')
      +'</dl>'
      +(qa.length?'<div class="block"><h2>Your answers</h2><dl class="qa">'+qa.map(r=>'<div><dt>'+esc(r[0])+'</dt><dd>'+esc(r[1])+'</dd></div>').join('')+'</dl></div>':'')
      +'<p class="fine">Demo only. Your listing will appear to customers in this demo with a New badge. Nothing is stored or sent.</p>';
  }
  $('#onboard-body').innerHTML=h;
}
function goStep(n){
  S.ob.step=n;
  $('#ob-err').hidden=true;
  renderOnboard();
  $('#ob-scroll').scrollTop=0;
  const h=$('#ob-head h2');
  if(h)h.focus({preventScroll:true});
}
function pickObService(id){
  const d=S.pro.draft,svc=SVC(id);
  if(!svc)return;
  if(d.svc!==id){d.svc=id;d.ans={};d.prices=suggest(svc);d.sp=-1;}
  searches.ob.close();
  $('#q-ob').value=svc.name;
  $('#ob-err').hidden=true;
  renderOnboard();
}
function obChoose(el){
  const d=S.pro.draft;
  if(el.dataset.obsvc){pickObService(el.dataset.obsvc);return;}
  if(el.dataset.obyears!==undefined){d.years=+el.dataset.obyears;pressed(el,'[data-obyears]');return;}
  if(el.dataset.obhours!==undefined){d.hours=+el.dataset.obhours;pressed(el,'[data-obhours]');return;}
  if(el.dataset.obsp!==undefined){d.sp=+el.dataset.obsp;pressed(el,'[data-obsp]');return;}
  const q=qsOf(d).find(x=>x.id===el.dataset.q);
  if(!q)return;
  const v=q.opts[+el.dataset.i];
  if(q.type==='many'){
    const a=d.ans[q.id]||(d.ans[q.id]=[]),k=a.indexOf(v);
    if(k>-1)a.splice(k,1);else a.push(v);
    el.setAttribute('aria-pressed',String(a.indexOf(v)>-1));
  }else{
    d.ans[q.id]=v;
    pressed(el,'[data-q="'+q.id+'"]');
  }
}
/* Returns [message, id of the field to focus] when the step is not finished, otherwise null. */
function obValidate(step){
  const d=S.pro.draft,svc=d.svc?SVC(d.svc):null;
  if(step===0)return svc?null:['Pick the service you offer to continue.','q-ob'];
  if(step===1){
    if(d.biz.trim().length<2)return ['Enter your business name.','ob-biz'];
    if(!normPhone(d.phone))return ['Enter a Nigerian phone number, like 0803 123 4567.','ob-phone'];
    if(d.years<0)return ['Choose how long you have done this.',null];
    return null;
  }
  if(step===2){
    const q=qsOf(d).find(x=>!x.optional&&!answerText(x,d.ans[x.id]));
    return q?['Please answer: '+q.q,'g-'+q.id]:null;
  }
  if(step===3){
    for(let k=0;k<svc.itemNames.length;k++){
      const n=parsePrice(d.prices[k]);
      if(!(n>=50&&n<=10000000))return ['Enter a price for '+svc.itemNames[k]+', using numbers only (at least ₦50).','pr-'+k];
    }
    if(d.sp<0)return ['Choose an option for “'+svc.label+'”.',null];
  }
  return null;
}
function obNext(){
  const bad=obValidate(S.ob.step);
  if(bad){
    const e=$('#ob-err');
    e.textContent=bad[0];e.hidden=false;
    $('#ob-scroll').scrollTop=0;
    const f=bad[1]&&$('#'+bad[1]);
    if(f){if(f.tagName==='INPUT')f.setAttribute('aria-invalid','true');try{f.focus({preventScroll:true});}catch(x){}}
    return;
  }
  if(S.ob.step<OB_STEPS-1)goStep(S.ob.step+1);else publishListing();
}
function obBack(){
  if(S.ob.step>0)goStep(S.ob.step-1);
  else if(S.ob.edit)switchTab('dash');
}
function publishListing(){
  const pro=S.pro,d=pro.draft,svc=SVC(d.svc),old=pro.published;
  if(old){
    const i=PROVIDERS.indexOf(old);
    if(i>-1)PROVIDERS.splice(i,1);
    NEAR[old.c]=Math.max(0,(NEAR[old.c]||1)-1);
  }
  const services=svc.itemNames.map((nm,k)=>[nm,parsePrice(d.prices[k])]);
  const p={
    id:old?old.id:'mine-'+(++mineN),c:svc.id,name:d.biz.trim(),ini:initialsOf(d.biz),area:d.area,km:0.8,
    rating:0,reviews:0,sp:SPEED[svc.kind].opts[d.sp],onTime:0,open:true,hours:HOURS[d.hours],perk:d.hours===2?['24/7','Open 24 hours, every day']:null,
    spec:svc.itemNames.slice(0,3).join(' · '),years:YEARS[d.years][1],yearsText:YEARS[d.years][0],scores:svc.scores.map(()=>0),
    services:services,revs:[],from:Math.min.apply(null,services.map(x=>x[1])),
    isNew:true,mine:true,phone:normPhone(d.phone),photos:d.photos.slice(),ownerKey:acctKey('provider',S.user.email),qa:qsOf(d).map(q=>[q.q,answerText(q,d.ans[q.id])]).filter(x=>x[1])
  };
  p.phoneVerified=!!(d.phoneOk&&d.phoneChecked===p.phone);p.idPhoto=!!d.idPhoto;p.waAlerts=d.waAlerts!==false;p.pin=d.pin||null;
  p.freeNow=old?!!old.freeNow:false;p.vouches=old?(old.vouches||0):0;
  if(old&&old.c===svc.id&&old.reviews){p.rating=old.rating;p.reviews=old.reviews;p.revs=old.revs;p.scores=old.scores;p.onTime=old.onTime;p.isNew=false;}
  PROVIDERS.push(p);
  NEAR[svc.id]=(NEAR[svc.id]||0)+1;
  pro.published=p;
  if(!pro.requests||(old&&old.c!==svc.id))pro.requests=makeRequests(p);
  pro.justPublished=true;
  S.ob.edit=false;
  S.tab='dash';
  enterApp();
}

/* Sample requests, so a new provider can see how the Requests tab works. */
function makeRequests(p){
  const r=rng('req-'+p.id),days=dayOpts();
  const who=['Bisi O.','Chinedu A.','Amaka N.'],notes=['Please call me when you are on the way.','I am flexible on the time if you are busy.','The place is close to the main road.'];
  return who.map((n,i)=>{
    const it=p.services[Math.floor(r()*p.services.length)];
    return {id:'rq'+i,who:n,item:it[0],price:it[1],when:days[i%3]+', '+TIMES[Math.floor(r()*TIMES.length)],note:notes[i],status:'new'};
  });
}
function reqCard(r){
  if(r.type==='quote')return quoteReqCard(r);
  let st=r.status==='accepted'?'<span class="pill pill-open">Accepted</span>':r.status==='declined'?'<span class="pill">Declined</span>':'<span class="pill pill-express">New</span>';
  if(r.real)st+='<span class="pill pill-open">Booked in this demo</span>';
  return '<article class="bk"><div class="bk-top"><span class="avatar" aria-hidden="true">'+initialsOf(r.who)+'</span><div><b>'+esc(r.who)+'</b><span class="area">'+esc(r.item)+' · '+fmt(r.price)+'</span></div>'+st+'</div>'
    +'<dl class="ticket"><div><dt>When</dt><dd>'+esc(r.when)+'</dd></div><div><dt>Note</dt><dd>'+esc(r.note)+'</dd></div></dl>'
    +trackExtras(r)
    +(r.status==='new'?'<div class="bk-actions"><button class="btn btn-ghost btn-sm" type="button" data-req="declined" data-id="'+r.id+'">Decline</button><button class="btn btn-primary btn-sm" type="button" data-req="accepted" data-id="'+r.id+'">Accept</button></div>':'')
    +'</article>';
}
function renderPreq(){
  const rq=S.pro.requests||[];
  $('#preq-body').innerHTML='<p class="fine">Requests marked “Booked in this demo” came from a customer account in this tab. The rest are samples. Accepting or declining does not message anyone.</p>'+rq.map(reqCard).join('');
}
function renderPdash(){
  const pro=S.pro,p=pro.published;
  if(!p){$('#pdash-body').innerHTML=emptyState(I.grid,'Set up your listing','Answer a few questions about your service to go live.','<button class="btn btn-primary" type="button" data-act="pro-edit">Start setup</button>');return;}
  const svc=SVC(p.c),rq=pro.requests||[],np=rq.filter(r=>r.status==='new').length,acc=rq.filter(r=>r.status==='accepted');
  const val=acc.reduce((s,r)=>s+r.price,0);
  const kv=(k,v,s)=>'<div class="kv-item"><span class="k">'+k+'</span><span class="v">'+v+'</span><span class="s">'+s+'</span></div>';
  $('#pdash-body').innerHTML=
    '<div><h1 class="hello" id="pdash-title" data-title tabindex="-1">Hi, '+esc(firstName(S.user.name))+'</h1><p class="hello-sub">'+esc(p.name)+' · '+esc(svc.name)+'</p></div>'
    +(pro.justPublished?'<div class="banner" role="status">Your listing is live. Customers looking for '+esc(svc.name.toLowerCase())+' near Ikeja can now find it in this demo.</div>':'')
    +'<div class="kv">'+kv('Requests',np,np===1?'waiting for you':'waiting for you')+kv('Accepted',acc.length,'this week')+kv('Booked value',fmt(val),'from accepted requests')+kv('Rating',p.reviews?STAR+p.rating.toFixed(1):'New',p.reviews?p.reviews+(p.reviews===1?' review':' reviews'):'after your first reviews')+'</div>'
    +'<div><div class="sec-h"><h2>Your listing</h2></div></div>'
    +card(p)
    +'<div class="row2"><button class="btn btn-ghost" type="button" data-open="'+p.id+'">View as customer</button><button class="btn btn-ghost" type="button" data-act="pro-edit">Edit listing</button></div>'
    +proExtras(p)
    +(p.qa.length?'<div class="block"><h2>What customers see about you</h2><dl class="qa">'+p.qa.map(r=>'<div><dt>'+esc(r[0])+'</dt><dd>'+esc(r[1])+'</dd></div>').join('')+'</dl></div>':'')
    +'<p class="fine">Demo only. The request numbers are samples.</p>';
  pro.justPublished=false;
}
function renderProfile(){
  const u=S.user,prov=S.role==='provider',p=prov&&S.pro.published;
  const nSaved=Object.keys(S.saved).filter(k=>S.saved[k]).length;
  const rows=prov
    ?[['Account','Service provider'],['Service',p?SVC(p.c).name:'Not set up yet'],['Listing',p?p.name:'Not published']]
    :[['Account','Customer'],['Bookings',String(Object.keys(S.booked).length)],['Saved providers',String(nSaved)]];
  $('#profile-body').innerHTML=
    '<div class="d-head"><span class="avatar-lg" aria-hidden="true">'+initialsOf(u.name)+'</span><div class="d-meta"><h2 class="pname">'+esc(u.name)+'</h2><span class="area">'+esc(u.email)+'</span></div></div>'
    +'<dl class="ticket">'+rows.map(r=>'<div><dt>'+r[0]+'</dt><dd>'+esc(r[1])+'</dd></div>').join('')+'</dl>'
    +(p?'<button class="btn btn-ghost" type="button" data-act="pro-edit">Edit my listing</button>':'')
    +'<button class="btn btn-ghost" type="button" data-act="acct">'+(API.enabled?'Account':'Switch between customer and provider')+'</button>'+(API.enabled?'<p class="fine">Your account is saved online. Listings and bookings are still kept in this tab only.</p>':'')
    +measureBlock()
    +'<button class="btn btn-danger" type="button" data-act="signout">Sign out</button>'
    +'<p class="fine">Demo only. Accounts are kept in memory in this tab and are gone when you close it. Passwords are not checked or stored, and nothing is sent anywhere.</p>';
}

/* Clicks for sign-in and setup. Returns true when the click was handled here. */
function authClick(t){
  if(moreClick(t))return true;
  const role=t.closest('[data-role]');
  if(role){S.role=role.dataset.role;S.authMode='up';S.af={name:'',email:''};push('auth');return true;}
  const mode=t.closest('[data-mode]');
  if(mode){S.authMode=mode.dataset.mode;renderAuth();return true;}
  const ob=t.closest('[data-obsvc],[data-q],[data-obyears],[data-obhours],[data-obsp]');
  if(ob){obChoose(ob);return true;}
  const rq=t.closest('[data-req]');
  if(rq){
    const r=S.pro.requests.find(x=>x.id===rq.dataset.id);
    if(r){r.status=rq.dataset.req;renderPreq();updateTabs();const h=$('#v-preq [data-title]');if(h)h.focus({preventScroll:true});}
    return true;
  }
  const dn=t.closest('[data-done]');
  if(dn){const b=S.booked[dn.dataset.done];if(b){b.done=true;renderBookings();}return true;}
  const rv=t.closest('[data-review]');
  if(rv){openReview(rv.dataset.review);return true;}
  const ct=t.closest('[data-contact]');
  if(ct){openContact(ct.dataset.contact);return true;}
  const cp=t.closest('[data-copy]');
  if(cp){copyNumber(cp.dataset.copy);return true;}
  const st=t.closest('[data-star]');
  if(st){setStars(+st.dataset.star);return true;}
  const lc=t.closest('[data-loc]');
  if(lc){if(lc.dataset.loc==='gps')useGps();else pickArea(+lc.dataset.i);return true;}
  const rm=t.closest('[data-photo-rm]');
  if(rm){
    S.pro.draft.photos.splice(+rm.dataset.photoRm,1);S.ob.photoMsg='';renderOnboard();
    const b=$('#ob-photo-btn')||$('#ob-next');if(b)b.focus({preventScroll:true});
    return true;
  }
  const act=t.closest('[data-act]');
  if(!act)return false;
  const a=act.dataset.act;
  if(a==='pw'){
    const f=$('#a-pw'),show=f.type==='password';
    f.type=show?'text':'password';
    act.textContent=show?'Hide':'Show';
    act.setAttribute('aria-pressed',String(show));
    act.setAttribute('aria-label',show?'Hide password':'Show password');
  }
  else if(a==='ob-back')obBack();
  else if(a==='ob-next')obNext();
  else if(a==='pro-edit'){S.ob={step:0,edit:true};nav.stack=[];show('onboard','push');}
  else if(a==='signout')signOut();
  else if(a==='loc')openLocation();
  else if(a==='photo-add')$('#ob-photo').click();
  else if(a==='review-send')sendReview();
  else return false;
  return true;
}
$('#onboard-body').addEventListener('input',e=>{
  const d=S.pro.draft,el=e.target;
  if(el.id==='ob-biz')d.biz=el.value;
  else if(el.id==='ob-phone')d.phone=el.value;
  else if(el.dataset.qt)d.ans[el.dataset.qt]=el.value;
  else if(el.dataset.price!==undefined)d.prices[+el.dataset.price]=el.value;
  el.removeAttribute('aria-invalid');
  $('#ob-err').hidden=true;
});
$('#onboard-body').addEventListener('change',e=>{
  if(e.target.id==='ob-area')S.pro.draft.area=e.target.value;
  else if(e.target.id==='ob-photo'&&e.target.files.length){addPhotos(e.target.files);e.target.value='';}
  else if(e.target.id==='ob-id'&&e.target.files.length){addIdPhoto(e.target.files);e.target.value='';}
  else if(e.target.id==='ob-wa')S.pro.draft.waAlerts=e.target.checked;
});
$('#onboard-body').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.tagName==='INPUT'){e.preventDefault();if(e.target.id==='ob-code')confirmCode();else obNext();}});

/* ---------- Location, contact, reviews and photos ---------- */
const LOC_AREAS=['Ikeja, Lagos','Yaba, Lagos','Lagos Island','Lekki, Lagos','Surulere, Lagos'];

/* Nigerian numbers: 0803 123 4567, +234 803 123 4567 or 2348031234567 all become 2348031234567. */
function normPhone(v){
  const m=/^(?:\+?234|0)([789][01]\d{8})$/.exec(String(v).replace(/[\s\-()]/g,''));
  return m?'234'+m[1]:null;
}
const localPhone=n=>n?'0'+n.slice(3,6)+' '+n.slice(6,9)+' '+n.slice(9):'';

function applyLoc(){
  $('#loc-label').textContent=S.loc.label;
  $('#loc-how').textContent=S.loc.how;
  if(nav.cur==='results')renderResults();
}
function openLocation(){
  S.opener=document.activeElement;S.dirty=false;
  $('#sheet').innerHTML=
    '<div><h2 id="sheet-title">Your location</h2></div>'
    +'<button class="btn btn-primary" type="button" data-loc="gps">'+svg(I.pin,20)+'Use my current location</button>'
    +'<p class="fine" id="loc-msg" role="status"></p>'
    +'<div class="field"><span class="label" id="loc-al">Or pick an area</span><div class="opts" role="group" aria-labelledby="loc-al">'
    +LOC_AREAS.map((a,i)=>'<button class="chip" type="button" data-loc="area" data-i="'+i+'" aria-pressed="'+(S.loc.how==='picked'&&S.loc.label===a)+'">'+esc(a)+'</button>').join('')+'</div></div>'
    +'<p class="fine">Demo only. Providers are placed around a sample point, so distances do not change yet. Your location is not stored or sent anywhere.</p>'
    +'<button class="btn btn-ghost" type="button" data-sheet="done">Close</button>';
  showSheet('[data-loc="gps"]');
}
function useGps(){
  const say=t=>{const m=$('#loc-msg');if(m)m.textContent=t;};
  if(!navigator.geolocation){say('This browser cannot share its location. Pick an area instead.');return;}
  say('Finding you…');
  navigator.geolocation.getCurrentPosition(pos=>{
    S.loc={label:'Your location',how:'from your device',short:'you',lat:pos.coords.latitude,lng:pos.coords.longitude};
    applyLoc();
    if(!$('#sheet').hidden)closeSheet();
  },err=>{
    say(err.code===1?'Location is turned off for this page. Allow it in your browser settings, or pick an area.'
      :err.code===3?'That took too long. Try again, or pick an area.'
      :'Could not get your location. Pick an area instead.');
  },{enableHighAccuracy:false,timeout:10000,maximumAge:60000});
}
function pickArea(i){
  const a=LOC_AREAS[i];
  S.loc={label:a,how:'picked',short:a.split(',')[0]};
  applyLoc();closeSheet();
}

/* Contact sheet. Links to call or message only exist for real providers who gave a number. */
function openContact(id){
  const t=PROVIDERS.find(x=>x.id===id);
  if(!t)return;
  S.opener=document.activeElement;S.dirty=false;
  $('#sheet').innerHTML=
    '<div><h2 id="sheet-title">Contact '+esc(t.name)+'</h2></div>'
    +(t.phone
      ?'<p class="phone-num" id="ph-num">'+localPhone(t.phone)+'</p>'
        +'<div class="sheet-actions"><a class="btn btn-primary" href="tel:+'+t.phone+'">'+svg(I.phone,20)+'Call</a><a class="btn btn-ghost" href="https://wa.me/'+t.phone+'" target="_blank" rel="noopener">'+svg(I.chat,20)+'WhatsApp</a></div>'
        +'<button class="btn btn-ghost" type="button" data-copy="'+t.phone+'">Copy number</button>'
        +'<p class="fine" id="cp-msg" role="status">If a link does nothing on your device, copy the number instead.</p>'
      :'<p>This is a sample provider, so it has no real phone number. Providers who join Sabi add their own number, and then Call and WhatsApp work from here.</p>')
    +'<button class="btn btn-ghost" type="button" data-sheet="done">Close</button>';
  showSheet(t.phone?'a[href]':'[data-sheet="done"]');
}
function copyNumber(n){
  const say=t=>{const m=$('#cp-msg');if(m)m.textContent=t;};
  const text=localPhone(n);
  const fallback=()=>{
    const el=$('#ph-num');
    if(el){const r=document.createRange();r.selectNodeContents(el);const s=window.getSelection();s.removeAllRanges();s.addRange(r);}
    say('Touch and hold the number to copy it.');
  };
  try{
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(()=>say('Number copied.'),fallback);
    else fallback();
  }catch(e){fallback();}
}
const galleryHTML=t=>t.photos&&t.photos.length
  ?'<div class="gallery" role="group" aria-label="Photos of their work">'+t.photos.map((src,i)=>'<img src="'+src+'" alt="Photo '+(i+1)+' of '+t.photos.length+' of work by '+esc(t.name)+'" loading="lazy">').join('')+'</div>'
  :'';
const contactHTML=t=>'<div class="row2 contact"><button class="btn btn-ghost" type="button" data-contact="'+t.id+'">'+svg(I.phone,20)+'Call</button><button class="btn btn-ghost" type="button" data-contact="'+t.id+'">'+svg(I.chat,20)+'WhatsApp</button></div>';

/* Reviews. In the demo, a customer marks a booking done, then rates the provider. */
function openReview(id){
  const t=PROVIDERS.find(x=>x.id===id);
  if(!t)return;
  S.rv={id:id,stars:0};S.opener=document.activeElement;S.dirty=false;
  $('#sheet').innerHTML=
    '<div><h2 id="sheet-title">Rate '+esc(t.name)+'</h2></div><p class="sheet-sub">How did it go?</p>'
    +'<div class="field"><span class="label" id="rv-l">Your rating</span><div class="stars" role="group" aria-labelledby="rv-l">'
    +[1,2,3,4,5].map(n=>'<button class="star-btn" type="button" data-star="'+n+'" aria-pressed="false" aria-label="'+n+(n===1?' star':' stars')+'">☆</button>').join('')+'</div></div>'
    +'<div class="field"><label class="label" for="rv-text">Your review (optional)</label><input id="rv-text" type="text" maxlength="200" autocomplete="off" placeholder="What went well, or what could be better?"></div>'
    +'<p class="err" id="rv-err" role="alert" hidden>Choose a star rating first.</p>'
    +'<div class="sheet-actions"><button class="btn btn-ghost" type="button" data-sheet="cancel">Cancel</button><button class="btn btn-primary" type="button" data-act="review-send">Send review</button></div>'
    +'<p class="fine">Demo only. Your review is added to this provider in this tab.</p>';
  showSheet('[data-star="1"]');
}
function setStars(n){
  S.rv.stars=n;
  document.querySelectorAll('[data-star]').forEach(b=>{
    const k=+b.dataset.star;
    b.textContent=k<=n?'★':'☆';
    b.setAttribute('aria-pressed',String(k===n));
  });
  $('#rv-err').hidden=true;
}
function sendReview(){
  if(!S.rv||!S.rv.stars){$('#rv-err').hidden=false;return;}
  const t=PROVIDERS.find(x=>x.id===S.rv.id),b=S.booked[S.rv.id];
  if(!t||!b)return;
  const parts=S.user.name.trim().split(/\s+/);
  const who=parts[0]+(parts.length>1?' '+parts[parts.length-1].charAt(0).toUpperCase()+'.':'');
  t.revs.unshift([who,S.rv.stars,$('#rv-text').value.trim(),'Just now']);
  t.rating=Math.round((t.rating*t.reviews+S.rv.stars)/(t.reviews+1)*10)/10;
  t.reviews+=1;
  b.reviewed=true;
  S.dirty=true;
  closeSheet();
  toast('Thanks, your review was added');
}

/* A booking made on a provider's real listing lands in that provider's Requests tab. */
function notifyOwner(t,b,idx){
  if(!t.mine)return;
  const a=S.accounts[t.ownerKey];
  if(!a||!a.pro)return;
  if(!a.pro.requests)a.pro.requests=[];
  a.pro.requests.unshift({id:'rq-'+b.ref,who:S.user.name,item:b.service,price:t.services[idx][1],when:b.day+', '+b.time,note:b.note||'No note.',status:'new',real:true,ref:b.ref,ckey:acctKey('customer',S.user.email),pid:t.id,tracked:isTracked(t.c),measure:b.measure||null});
}
function dropRequest(id,b){
  const t=PROVIDERS.find(x=>x.id===id);
  if(!t||!t.mine||!b)return;
  const a=S.accounts[t.ownerKey];
  if(a&&a.pro&&a.pro.requests)a.pro.requests=a.pro.requests.filter(r=>r.ref!==b.ref);
}

/* Photos a provider adds to their listing. They are shrunk in the browser and kept in memory. */
function shrinkPhoto(file){
  return new Promise((resolve,reject)=>{
    if(!/^image\//.test(file.type)){reject(new Error('type'));return;}
    const url=URL.createObjectURL(file),img=new Image();
    img.onload=()=>{
      const sc=Math.min(1,900/Math.max(img.width,img.height)),c=document.createElement('canvas');
      c.width=Math.max(1,Math.round(img.width*sc));c.height=Math.max(1,Math.round(img.height*sc));
      c.getContext('2d').drawImage(img,0,0,c.width,c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg',0.8));
    };
    img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('read'));};
    img.src=url;
  });
}
const MAX_PHOTOS=4;
async function addPhotos(files){
  const pro=S.pro;
  if(!pro)return;
  const d=pro.draft;
  let msg='';
  for(const f of Array.from(files)){
    if(d.photos.length>=MAX_PHOTOS){msg='You can add up to '+MAX_PHOTOS+' photos.';break;}
    try{d.photos.push(await shrinkPhoto(f));}
    catch(e){msg='One photo could not be read. Try a JPG or PNG.';}
  }
  if(S.pro!==pro||nav.cur!=='onboard')return;
  S.ob.photoMsg=msg;
  renderOnboard();
  const b=$('#ob-photo-btn');
  if(b){try{b.focus({preventScroll:true});}catch(e){}}
}
const phoneField=d=>'<div class="field"><label class="label" for="ob-phone">Phone or WhatsApp number</label><input class="inp" id="ob-phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" placeholder="0803 123 4567" value="'+esc(d.phone)+'"><span class="fine">Customers can call or message this number. It is shown on your listing.</span></div>';
const photoField=d=>'<div class="field"><span class="label" id="ob-phl">Photos of your work <span class="aside">(optional)</span></span>'
  +(d.photos.length?'<div class="thumbs" role="group" aria-labelledby="ob-phl">'+d.photos.map((src,i)=>'<div class="thumb"><img src="'+src+'" alt="Your photo '+(i+1)+'"><button class="thumb-x" type="button" data-photo-rm="'+i+'" aria-label="Remove photo '+(i+1)+'">'+svg(I.x,16)+'</button></div>').join('')+'</div>':'')
  +(d.photos.length<MAX_PHOTOS?'<button class="btn btn-ghost btn-sm" type="button" id="ob-photo-btn" data-act="photo-add">'+svg(I.plus,18)+'Add a photo</button>':'')
  +'<input id="ob-photo" type="file" accept="image/*" multiple hidden>'
  +'<span class="fine" role="status">'+esc(S.ob.photoMsg||'Up to '+MAX_PHOTOS+' photos. They are kept in this tab only.')+'</span></div>';

/* ---------- Booking sheet ---------- */
/* ---------- Trust, free now, map, quotes, order tracking, sharing and alerts ---------- */
function openAccount(){
  if(!S.user)return;
  S.opener=document.activeElement;S.dirty=false;
  const prov=S.role==='provider',other=prov?'customer':'provider';
  const has=!!S.accounts[acctKey(other,S.user.email)];
  if(API.enabled){
    $('#sheet').innerHTML='<div><h2 id="sheet-title">Your account</h2></div>'
      +'<div class="d-head"><span class="avatar-lg" aria-hidden="true">'+initialsOf(S.user.name)+'</span><div class="d-meta"><b class="pname">'+esc(S.user.name)+'</b><span class="area">'+esc(S.user.email)+'</span></div></div>'
      +'<p>Signed in as a <b>'+(prov?'service provider':'customer')+'</b>. To use Sabi in the other role, create a second account with a different email.</p>'
      +'<button class="btn btn-danger" type="button" data-act="acct-out">Sign out</button>'
      +'<button class="btn btn-ghost" type="button" data-sheet="done">Close</button>';
    showSheet('[data-act="acct-out"]');
    return;
  }
  $('#sheet').innerHTML=
    '<div><h2 id="sheet-title">Your account</h2></div>'
    +'<div class="d-head"><span class="avatar-lg" aria-hidden="true">'+initialsOf(S.user.name)+'</span><div class="d-meta"><b class="pname">'+esc(S.user.name)+'</b><span class="area">'+esc(S.user.email)+'</span></div></div>'
    +'<div class="field"><span class="label" id="ac-l">Using Sabi as</span><div class="seg seg-mini" role="group" aria-labelledby="ac-l">'
      +'<button type="button" data-act="acct-switch" data-to="customer" aria-pressed="'+!prov+'">Customer</button>'
      +'<button type="button" data-act="acct-switch" data-to="provider" aria-pressed="'+prov+'">Service provider</button></div>'
      +'<span class="fine">'+(has?'Your '+other+' account for this email is ready.':(other==='provider'?'You have no provider account yet. Switching starts the setup for one.':'You have no customer account yet. Switching creates one.'))+'</span></div>'
    +'<p class="fine">Demo only. Customer and provider accounts are separate and live in this tab. Switching uses the same email and name.</p>'
    +'<button class="btn btn-danger" type="button" data-act="acct-out">Sign out</button>'
    +'<button class="btn btn-ghost" type="button" data-sheet="done">Close</button>';
  showSheet('[data-act="acct-switch"][aria-pressed="false"]');
}
function switchAccount(to){
  if(!S.user||to===S.role){closeSheet();return;}
  const email=S.user.email,name=S.user.name;
  S.dirty=false;S.opener=null;closeSheet();
  ['pdash','preq','profile','bookings','saved','detail'].forEach(v=>{const el=$('#v-'+v+' .scroll');if(el)el.innerHTML='';});
  $('#q-home').value='';$('#q-res').value='';
  S.role=to;S.free=false;S.verified=false;S.rview='list';
  signIn(email,name);
}
I.bolt='<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>';
I.check='<path d="M5 12.5l4.5 4.5L19 7.5"/>';
I.share='<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6"/>';
I.map='<path d="M9 4L3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>';

const hash=s=>{let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h;};
const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'provider';
const shareUrl=p=>'https://sabi.example/p/'+slug(p.name);

/* Demo coordinates. Sample providers are placed around the point the customer chose,
   at their listed distance, in a direction picked from their id. A provider who pins their
   shop on the map uses that real position instead. */
const LOC_COORDS={'Ikeja, Lagos':[6.6018,3.3515],'Yaba, Lagos':[6.5095,3.3711],'Lagos Island':[6.4541,3.3947],'Lekki, Lagos':[6.4698,3.5852],'Surulere, Lagos':[6.5010,3.3580]};
const centerPt=()=>S.loc.lat!==undefined?[S.loc.lat,S.loc.lng]:(LOC_COORDS[S.loc.label]||LOC_COORDS['Ikeja, Lagos']);
function posOf(t){
  if(t.pin)return [t.pin.lat,t.pin.lng];
  const c=centerPt(),ang=(hash(t.id)%360)*Math.PI/180;
  return [c[0]+t.km*Math.cos(ang)/111,c[1]+t.km*Math.sin(ang)/(111*Math.cos(c[0]*Math.PI/180))];
}

/* ----- 1. Trust ----- */
function trustOf(t){
  if(t.mine)return {phone:!!t.phoneVerified,id:!!t.idPhoto,vouches:t.vouches||0};
  const h=hash(t.id);
  if(t.vouches===undefined)t.vouches=Math.round(t.reviews*(0.1+(h%10)/50));
  return {phone:true,id:h%5<3,vouches:t.vouches};
}
const isVerified=t=>{const x=trustOf(t);return x.phone&&x.id;};
const verifiedPill=t=>isVerified(t)?'<span class="pill pill-verified">'+svg(I.check,12)+'Verified</span>':'';
function trustBlock(t){
  const x=trustOf(t);
  const row=(ok,yes,no)=>'<li class="'+(ok?'ok':'no')+'"><span class="ti2" aria-hidden="true">'+(ok?svg(I.check,16):'–')+'</span><span>'+(ok?yes:no)+'</span></li>';
  return '<div class="block"><h2>Trust and safety</h2><ul class="trust">'
    +row(x.phone,'Phone number confirmed','Phone number not confirmed')
    +row(x.id,'ID or shop photo checked','ID not checked yet')
    +row(x.vouches>0,'Vouched for by '+x.vouches+(x.vouches===1?' customer':' customers'),'No customer vouches yet')
    +'</ul><p class="fine">Meeting at your home? Tell someone you trust the booking details first.</p></div>';
}

/* ----- 5. Free now ----- */
let FREE_SET=null;
function isFree(t){
  if(t.mine)return !!t.freeNow;
  if(!FREE_SET){
    FREE_SET={};
    const seen={};
    PROVIDERS.filter(p=>!p.mine&&p.open).sort((x,y)=>x.km-y.km).forEach(p=>{if(!seen[p.c]){seen[p.c]=1;FREE_SET[p.id]=1;}});
    PROVIDERS.forEach(p=>{if(!p.mine&&p.open&&hash(p.id)%3===0)FREE_SET[p.id]=1;});
  }
  return !!FREE_SET[t.id];
}
const etaMin=t=>drive(t)+8;
const freePill=t=>isFree(t)?'<span class="pill pill-free"><i class="dot"></i>Free now · about '+etaMin(t)+' min</span>':'';
const NOW=['plumber','electrician','mechanic','towing-services','locksmith','generator-repairer'];
(function(){
  const row=$('#nowrow');
  if(row)row.innerHTML=NOW.map(SVC).filter(Boolean).map(s=>'<button class="chip chip-now" type="button" data-now="'+s.id+'">'+svg(I.bolt,14)+esc(s.name)+'</button>').join('');
})();

/* ----- Map ----- */
const MapUI={map:null,layer:null};
const PinUI={map:null,pt:null,marker:null};
const mapOK=()=>typeof L!=='undefined';
const OSM='https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTR='© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';
function tilesFor(map,noteId){
  const tl=L.tileLayer(OSM,{maxZoom:19,attribution:OSM_ATTR}).addTo(map);
  tl.on('tileerror',()=>{const n=$('#'+noteId);if(n)n.hidden=false;});
  tl.on('tileload',()=>{const n=$('#'+noteId);if(n)n.hidden=true;});
}
function markerIcon(t){
  const cls='mk'+(t.open?'':' closed')+(isVerified(t)?' ver':'');
  return L.divIcon({className:'mk-wrap',html:'<div class="'+cls+'"><span><b>'+esc(t.ini)+'</b></span></div>',iconSize:[36,44],iconAnchor:[18,42],popupAnchor:[0,-38]});
}
function renderMap(list){
  if(!mapOK()||S.rview!=='map')return;
  if(!MapUI.map){
    MapUI.map=L.map('map',{scrollWheelZoom:false}).setView(centerPt(),13);
    tilesFor(MapUI.map,'map-note');
    MapUI.layer=L.layerGroup().addTo(MapUI.map);
  }
  const m=MapUI.map,c=centerPt();
  MapUI.layer.clearLayers();
  const pts=[c];
  L.circleMarker(c,{radius:8,color:'#fff',weight:3,fillColor:'#2563eb',fillOpacity:1}).bindTooltip('You are here (sample point)').addTo(MapUI.layer);
  list.forEach(t=>{
    const p=posOf(t);pts.push(p);
    const pop='<div class="mp"><b>'+esc(t.name)+'</b><span>'+(!t.reviews?'New':'★ '+t.rating.toFixed(1))+' · from '+fmt(t.from)+' · '+t.km.toFixed(1)+' km</span><button class="btn btn-primary btn-sm" type="button" data-open="'+t.id+'">View</button></div>';
    L.marker(p,{icon:markerIcon(t),title:t.name,alt:t.name,keyboard:true}).bindPopup(pop).addTo(MapUI.layer);
  });
  m.invalidateSize();
  m.fitBounds(L.latLngBounds(pts),{padding:[28,28],maxZoom:15});
}
function applyView(list){
  const map=S.rview==='map';
  $('#tape-panel').hidden=S.rview!=='scale'||!list.length;
  $('#mapwrap').hidden=!map||!list.length;
  document.querySelectorAll('#rview button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.rview===S.rview)));
  if(map&&list.length){
    if(!mapOK()){$('#map').innerHTML='';$('#map-note').hidden=false;$('#map-note').textContent='The map could not load. Check your connection and try again.';return;}
    renderMap(list);
    setTimeout(()=>{if(MapUI.map)MapUI.map.invalidateSize();},60);
  }
}

/* Provider pins their shop. Tap the map, or move it and drop the pin at the centre. */
const pinField=d=>'<div class="field"><span class="label" id="ob-pinl">Shop location on the map <span class="aside">(optional)</span></span>'
  +'<button class="btn btn-ghost btn-sm" type="button" data-act="pin-open" aria-describedby="ob-pinl">'+svg(I.pin,18)+(d.pin?'Change pin':'Pin my shop')+'</button>'
  +'<span class="fine" role="status">'+(d.pin?'Pinned at '+d.pin.lat.toFixed(4)+', '+d.pin.lng.toFixed(4)+'. Customers can get directions.':'Add a pin so customers can find you and get directions.')+'</span></div>';
function openPin(){
  const d=S.pro.draft;
  S.opener=document.activeElement;S.dirty=false;
  PinUI.pt=d.pin?[d.pin.lat,d.pin.lng]:null;
  $('#sheet').innerHTML=
    '<div><h2 id="sheet-title">Pin your shop</h2></div><p class="sheet-sub">Tap the map to place the pin, or move the map and use the centre button.</p>'
    +(mapOK()?'<div id="pinmap" role="application" aria-label="Map for placing your pin"></div><p class="fine" id="pin-note" hidden>Map tiles could not load. You can still use your current location.</p>'
      :'<p class="err">The map could not load. Check your connection and try again, or use your current location.</p>')
    +'<p class="fine" id="pin-msg" role="status">'+(PinUI.pt?'Pin set.':'No pin yet.')+'</p>'
    +'<div class="row2"><button class="btn btn-ghost btn-sm" type="button" data-act="pin-centre">Drop pin at centre</button><button class="btn btn-ghost btn-sm" type="button" data-act="pin-gps">Use my location</button></div>'
    +'<div class="sheet-actions"><button class="btn btn-ghost" type="button" data-sheet="cancel">Cancel</button><button class="btn btn-primary" type="button" data-act="pin-save">Save pin</button></div>';
  showSheet('[data-act="pin-save"]');
  if(!mapOK())return;
  const start=PinUI.pt||centerPt();
  PinUI.map=L.map('pinmap').setView(start,PinUI.pt?16:14);
  tilesFor(PinUI.map,'pin-note');
  PinUI.marker=null;
  if(PinUI.pt)setPin(PinUI.pt,false);
  PinUI.map.on('click',e=>setPin([e.latlng.lat,e.latlng.lng],false));
  setTimeout(()=>{if(PinUI.map)PinUI.map.invalidateSize();},80);
}
function setPin(pt,pan){
  PinUI.pt=pt;
  if(PinUI.map){
    if(PinUI.marker)PinUI.marker.setLatLng(pt);
    else PinUI.marker=L.marker(pt,{icon:L.divIcon({className:'mk-wrap',html:'<div class="mk"><span><b>★</b></span></div>',iconSize:[36,44],iconAnchor:[18,42]})}).addTo(PinUI.map);
    if(pan)PinUI.map.setView(pt,16);
  }
  const m=$('#pin-msg');
  if(m)m.textContent='Pin set at '+pt[0].toFixed(4)+', '+pt[1].toFixed(4)+'.';
}
function pinGps(){
  const m=$('#pin-msg');
  if(!navigator.geolocation){if(m)m.textContent='This browser cannot share its location.';return;}
  if(m)m.textContent='Finding you…';
  navigator.geolocation.getCurrentPosition(p=>setPin([p.coords.latitude,p.coords.longitude],true),
    ()=>{const x=$('#pin-msg');if(x)x.textContent='Could not get your location. Tap the map instead.';},{timeout:10000,maximumAge:60000});
}
function savePin(){
  if(!PinUI.pt){const m=$('#pin-msg');if(m)m.textContent='Place the pin first.';return;}
  S.pro.draft.pin={lat:PinUI.pt[0],lng:PinUI.pt[1]};
  S.dirty=false;
  closeSheet();
  renderOnboard();
  const pb=$('[data-act="pin-open"]');if(pb)pb.focus({preventScroll:true});
}

/* ----- Provider verification step (setup step 5) ----- */
function trustStep(d){
  const num=normPhone(d.phone),ok=d.phoneOk&&d.phoneChecked===num,sent=d.codeSentFor===num&&!ok;
  const msg=S.ob.codeMsg||'';S.ob.codeMsg='';
  let phone;
  if(ok)phone='<p class="okline">'+svg(I.check,18)+'Confirmed '+localPhone(num)+'</p>';
  else if(sent)phone='<div class="banner" role="status">Demo code: <b class="mono">'+esc(d.code)+'</b>. In the real app this arrives by SMS.</div>'
    +'<div class="field"><label class="label" for="ob-code">6-digit code</label><input class="inp" id="ob-code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6"></div>'
    +'<button class="btn btn-primary btn-sm" type="button" data-act="code-confirm">Confirm number</button>';
  else phone='<button class="btn btn-ghost btn-sm" type="button" data-act="code-send">Send a code to '+localPhone(num)+'</button>';
  return '<div class="field"><span class="label">1. Confirm your phone number</span>'+phone+'<span class="fine" role="status">'+esc(msg)+'</span></div>'
    +'<div class="field"><span class="label" id="ob-idl">2. Add an ID or a photo of your shop <span class="aside">(optional)</span></span>'
    +(d.idPhoto?'<div class="thumbs"><div class="thumb"><img src="'+d.idPhoto+'" alt="Your verification photo"><button class="thumb-x" type="button" data-act="id-rm" aria-label="Remove verification photo">'+svg(I.x,16)+'</button></div></div>':'')
    +'<button class="btn btn-ghost btn-sm" type="button" id="ob-id-btn" data-act="id-add" aria-describedby="ob-idl">'+svg(I.plus,18)+(d.idPhoto?'Replace photo':'Add a photo')+'</button>'
    +'<input id="ob-id" type="file" accept="image/*" hidden>'
    +'<span class="fine">Customers only see a Verified badge, never the photo. Providers with a confirmed phone and a photo get the badge.</span></div>'
    +'<div class="field"><label class="check"><input type="checkbox" id="ob-wa"'+(d.waAlerts!==false?' checked':'')+'><span>Send new booking requests to my WhatsApp</span></label>'
    +'<span class="fine">You can change this later on your dashboard.</span></div>';
}
function trustLine(d){
  const ph=d.phoneOk&&d.phoneChecked===normPhone(d.phone);
  return (ph?'Phone confirmed':'Phone not confirmed')+(d.idPhoto?', photo added':', no photo');
}
function sendCode(){
  const d=S.pro.draft,num=normPhone(d.phone);
  d.codeSentFor=num;d.code=String(100000+Math.floor(Math.random()*900000));d.phoneOk=false;
  renderOnboard();
  const f=$('#ob-code');if(f)f.focus();
}
function confirmCode(){
  const d=S.pro.draft,v=($('#ob-code').value||'').trim();
  if(v===d.code){d.phoneOk=true;d.phoneChecked=normPhone(d.phone);S.ob.codeMsg='Number confirmed.';}
  else S.ob.codeMsg='That code is not right. Check it and try again.';
  renderOnboard();
  const f=$('#ob-code');if(f)f.focus();
}

function dirBlock(t){
  if(!t.pin)return '';
  return '<div class="block"><h2>Location</h2><p class="qdesc">Pinned on the map by the provider.</p><a class="btn btn-ghost btn-sm" href="https://www.google.com/maps/dir/?api=1&destination='+t.pin.lat+','+t.pin.lng+'" target="_blank" rel="noopener">'+svg(I.map,18)+'Get directions</a></div>';
}
async function addIdPhoto(files){
  const pro=S.pro,d=pro&&pro.draft;
  if(!d||!files.length)return;
  let msg='';
  try{d.idPhoto=await shrinkPhoto(files[0]);}catch(e){msg='That photo could not be read. Try a JPG or PNG.';}
  if(S.pro!==pro||nav.cur!=='onboard')return;
  S.ob.codeMsg=msg;renderOnboard();
  const b=$('#ob-id-btn');if(b)b.focus({preventScroll:true});
}

/* ----- Provider dashboard extras: free now, trust, WhatsApp alerts, share ----- */
function proExtras(p){
  const t=trustOf(p),ok=t.phone&&t.id,rq=(S.pro.requests||[]).find(r=>r.status==='new'&&r.type!=='quote');
  const sw=(on,act,label)=>'<button class="switch" type="button" role="switch" aria-checked="'+on+'" aria-label="'+label+'" data-act="'+act+'"><i></i></button>';
  const msg=rq?'New booking on Sabi\n'+rq.who+' · '+rq.item+'\n'+rq.when+' · '+fmt(rq.price)+'\nReply 1 to accept, 2 to decline.':'New booking on Sabi\nChidi O. · Shirt\nSun 8 Nov, 10:00 am · ₦9,000\nReply 1 to accept, 2 to decline.';
  return '<div class="card-row"><div><b>I’m free now</b><small>Customers who need help urgently see you first.</small></div>'+sw(!!p.freeNow,'free-toggle','I am free now')+'</div>'
    +'<div class="block"><h2>Get verified</h2><ul class="trust">'
    +'<li class="'+(t.phone?'ok':'no')+'"><span class="ti2" aria-hidden="true">'+(t.phone?svg(I.check,16):'–')+'</span><span>'+(t.phone?'Phone number confirmed':'Confirm your phone number')+'</span></li>'
    +'<li class="'+(t.id?'ok':'no')+'"><span class="ti2" aria-hidden="true">'+(t.id?svg(I.check,16):'–')+'</span><span>'+(t.id?'ID or shop photo added':'Add an ID or a photo of your shop')+'</span></li></ul>'
    +(ok?'<p class="fine">You have the Verified badge.</p>':'<button class="btn btn-ghost btn-sm" type="button" data-act="pro-verify">Finish verification</button>')+'</div>'
    +'<div class="block"><div class="card-row flat"><div><b>WhatsApp alerts</b><small>Get new requests on WhatsApp.</small></div>'+sw(p.waAlerts!==false,'wa-toggle','WhatsApp alerts')+'</div>'
    +'<div class="bubble" aria-label="Example WhatsApp message">'+esc(msg).replace(/\n/g,'<br>')+'</div>'
    +'<p class="fine">Demo only. Automatic messages need a WhatsApp Business setup, described in supabase/SETUP.md. Until then, customers can send you their booking details on WhatsApp themselves.</p></div>'
    +'<button class="btn btn-primary" type="button" data-act="share-open">'+svg(I.share,20)+'Share your page</button>';
}

/* ----- 3. Share your page ----- */
function openShare(){
  const p=S.pro.published;
  if(!p)return;
  S.opener=document.activeElement;S.dirty=false;
  const url=shareUrl(p),qr=QR.svg(url,{label:'QR code for '+p.name});
  const text='Book '+p.name+' on Sabi: '+url;
  $('#sheet').innerHTML=
    '<div><h2 id="sheet-title">Share your page</h2></div><p class="sheet-sub">Customers who scan the code or open the link see your prices, photos and reviews.</p>'
    +'<div class="qrbox">'+(qr||'<p class="fine">The link is too long for a code.</p>')+'</div>'
    +'<p class="linkline mono" id="share-url">'+esc(url)+'</p>'
    +'<div class="sheet-actions"><button class="btn btn-ghost" type="button" data-copy-text="'+esc(url)+'">Copy link</button><a class="btn btn-primary" href="https://wa.me/?text='+encodeURIComponent(text)+'" target="_blank" rel="noopener">'+svg(I.chat,20)+'Share on WhatsApp</a></div>'
    +'<button class="btn btn-ghost" type="button" data-open="'+p.id+'" data-sheet="done">Preview your page</button>'
    +'<p class="fine" id="share-msg" role="status">Example link only. This address does not exist yet. Once Sabi is hosted, the link will open this page. To print the code, take a screenshot.</p>'
    +'<button class="btn btn-ghost" type="button" data-sheet="done">Close</button>';
  showSheet('[data-copy-text]');
}
function copyText(text){
  const say=t=>{const m=$('#share-msg');if(m)m.textContent=t;};
  const fb=()=>{const el=$('#share-url');if(el){const r=document.createRange();r.selectNodeContents(el);const s=window.getSelection();s.removeAllRanges();s.addRange(r);}say('Touch and hold the link to copy it.');};
  try{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(()=>say('Link copied.'),fb);else fb();}catch(e){fb();}
}

/* ----- 4. Get quotes ----- */
let qN=0;
const QDAYS=()=>dayOpts().concat(['Flexible']);
function openQuote(){
  const svc=SVC(S.svc);
  S.opener=document.activeElement;S.dirty=false;S.qd={photo:null,day:0};
  $('#sheet').innerHTML=
    '<div><h2 id="sheet-title">Get quotes</h2></div><p class="sheet-sub">'+esc(svc.name)+' near '+esc(S.loc.short)+'</p>'
    +'<div class="field"><label class="label" for="q-desc">Describe the job</label><textarea class="inp" id="q-desc" rows="3" maxlength="200" placeholder="What needs doing, and anything the provider should know"></textarea></div>'
    +'<div class="field"><span class="label" id="q-dl">When</span><div class="opts" role="group" aria-labelledby="q-dl">'+QDAYS().map((d,i)=>'<button class="chip" type="button" data-qday="'+i+'" aria-pressed="'+(i===0)+'">'+d+'</button>').join('')+'</div></div>'
    +'<div class="field"><label class="label" for="q-budget">Your budget <span class="aside">(optional)</span></label><input class="inp" id="q-budget" type="text" inputmode="numeric" maxlength="9" placeholder="For example 15,000"></div>'
    +'<div class="field"><span class="label" id="q-pl">Photo <span class="aside">(optional)</span></span><div id="q-photo-slot"></div><button class="btn btn-ghost btn-sm" type="button" id="q-photo-btn" data-act="qphoto-add" aria-describedby="q-pl">'+svg(I.plus,18)+'Add a photo</button><input id="q-photo" type="file" accept="image/*" hidden></div>'
    +'<p class="err" id="q-err" role="alert" hidden></p>'
    +'<div class="sheet-actions"><button class="btn btn-ghost" type="button" data-sheet="cancel">Cancel</button><button class="btn btn-primary" type="button" data-act="quote-submit">Ask for quotes</button></div>'
    +'<p class="fine">Demo only. Quotes from sample providers are made up. Providers who signed up in this tab get your request for real.</p>';
  showSheet('#q-desc');
}
function quoteErr(msg,id){
  const e=$('#q-err');e.textContent=msg;e.hidden=false;
  const f=$('#'+id);if(f){f.setAttribute('aria-invalid','true');f.focus();}
}
const QMSG=['Happy to help. The price covers labour, and materials are extra if needed.','I can do this. I would need to see it first, so this is my estimate.','Available. The price is for the job as you described it.'];
function submitQuote(){
  const desc=$('#q-desc').value.trim(),raw=$('#q-budget').value.trim(),budget=raw?parsePrice(raw):null;
  if(desc.length<10)return quoteErr('Describe the job in a sentence or two, at least 10 characters.','q-desc');
  if(raw&&!(budget>=50))return quoteErr('Enter your budget using numbers only, or leave it empty.','q-budget');
  const day=QDAYS()[S.qd.day],now=Date.now();
  const q={id:'q'+(++qN),svc:S.svc,desc:desc,photo:S.qd.photo,day:day,budget:budget,created:now,status:'open',quotes:[],real:0};
  PROVIDERS.filter(p=>p.c===q.svc&&!p.mine).sort(SORTS.near).slice(0,3).forEach((p,i)=>{
    const h=hash(p.id+q.id);
    q.quotes.push({id:q.id+'-'+i,pid:p.id,price:roundP(p.from*(1.15+(h%60)/100)),msg:QMSG[i%3]+' I can come '+(day==='Flexible'?'when it suits you':day.toLowerCase())+'.',at:reduce?now:now+(3+i*4)*1000,real:false});
  });
  Object.keys(S.accounts).forEach(k=>{
    const a=S.accounts[k];
    if(a.role!=='provider'||!a.pro||!a.pro.published||a.pro.published.c!==q.svc)return;
    if(!a.pro.requests)a.pro.requests=[];
    a.pro.requests.unshift({id:'rq-'+q.id,type:'quote',qid:q.id,ckey:acctKey('customer',S.user.email),who:S.user.name,item:SVC(q.svc).name,desc:desc,photo:q.photo,when:day,budget:budget,status:'new'});
    q.real++;
  });
  S.quotes.unshift(q);
  S.bView='quotes';S.dirty=false;
  closeSheet();
  switchTab('bookings');
  toast('Quote request sent');
  q.quotes.forEach(x=>{
    if(x.at>now)setTimeout(()=>{if(nav.cur==='bookings'&&S.bView==='quotes')renderBookings();},x.at-now+60);
  });
}
function quoteCard(q){
  const svc=SVC(q.svc),now=Date.now();
  const vis=q.quotes.filter(x=>x.at<=now).sort((a,b)=>a.price-b.price),waiting=q.quotes.length-vis.length;
  return '<article class="bk"><div class="bk-top"><span class="avatar" aria-hidden="true">'+svg(I.inbox,20)+'</span><div><b>'+esc(svc.name)+'</b><span class="area">'+esc(q.day)+(q.budget?' · budget '+fmt(q.budget):'')+'</span></div>'
    +(q.status==='booked'?'<span class="pill pill-open">Booked</span>':'<span class="pill pill-express">Open</span>')+'</div>'
    +'<p class="qdesc">'+esc(q.desc)+'</p>'+(q.photo?'<div class="thumbs"><div class="thumb"><img src="'+q.photo+'" alt="Photo you added to this request"></div></div>':'')
    +(vis.length?'<ul class="qlist">'+vis.map(x=>{
      const t=PROVIDERS.find(p=>p.id===x.pid);
      return '<li class="qitem"><div class="qhead"><b>'+esc(t.name)+'</b>'+verifiedPill(t)+'<span class="qprice">'+fmt(x.price)+'</span></div>'
        +'<span class="area">'+(!t.reviews?'New':STAR+t.rating.toFixed(1))+' · '+t.km.toFixed(1)+' km</span><p>'+esc(x.msg)+'</p>'
        +(q.status==='booked'?(q.accepted===x.id?'<span class="pill pill-open">You accepted this quote</span>':'')
          :'<div class="bk-actions"><button class="btn btn-ghost btn-sm" type="button" data-open="'+t.id+'">View provider</button><button class="btn btn-primary btn-sm" type="button" data-qaccept="'+q.id+'|'+x.id+'">Accept and book</button></div>')
        +'</li>';}).join('')+'</ul>':'')
    +((waiting>0||(q.real&&q.status!=='booked'&&!q.quotes.some(x=>x.real)))&&q.status!=='booked'
      ?'<p class="fine" role="status">'+(waiting>0?'Waiting for '+waiting+' more '+(waiting===1?'quote':'quotes')+'…':'Waiting for providers who joined Sabi to reply.')+'</p>':'')
    +'</article>';
}
function quotesHTML(){
  return S.quotes.length?S.quotes.map(quoteCard).join('')+'<p class="fine">Demo only. Quotes are not binding and nothing is sent outside this tab.</p>'
    :emptyState(I.inbox,'No quote requests yet','Not sure of the price? Open a service and tap “Get quotes”.','<button class="btn btn-primary" type="button" data-act="explore">Find a service</button>');
}
function acceptQuote(qid,xid){
  const q=S.quotes.find(a=>a.id===qid),x=q&&q.quotes.find(a=>a.id===xid);
  if(!x)return;
  const t=PROVIDERS.find(p=>p.id===x.pid);
  if(S.booked[t.id]){S.bNotice='You already have a booking with '+t.name+'. Cancel it first to book this quote.';S.bView='list';renderBookings();return;}
  const b={day:q.day==='Flexible'?'Flexible':q.day,time:'time to be agreed',service:'Quote '+fmt(x.price)+': '+q.desc.slice(0,40),price:x.price,note:q.desc,ref:'SB-'+(1000+Math.floor(Math.random()*9000))};
  if(isTracked(t.c))b.stage=0;
  S.booked[t.id]=b;q.status='booked';q.accepted=xid;
  if(t.mine){
    const a=S.accounts[t.ownerKey];
    if(a&&a.pro){
      if(!a.pro.requests)a.pro.requests=[];
      a.pro.requests.unshift({id:'rq-'+b.ref,who:S.user.name,item:'Quoted job',price:x.price,when:b.day+', '+b.time,note:q.desc,status:'new',real:true,ref:b.ref,ckey:acctKey('customer',S.user.email),pid:t.id,tracked:isTracked(t.c),measure:null});
    }
  }
  S.bView='list';
  renderBookings();updateTabs();
}
/* A provider who signed up in this tab answers a quote request. */
function quoteReqCard(r){
  const st=r.status==='quoted'?'<span class="pill pill-open">Quote sent '+fmt(r.quote)+'</span>':r.status==='declined'?'<span class="pill">Passed</span>':'<span class="pill pill-express">New quote request</span>';
  return '<article class="bk"><div class="bk-top"><span class="avatar" aria-hidden="true">'+initialsOf(r.who)+'</span><div><b>'+esc(r.who)+'</b><span class="area">'+esc(r.item)+' · '+esc(r.when)+'</span></div>'+st+'</div>'
    +'<p class="qdesc">'+esc(r.desc)+'</p>'+(r.budget?'<p class="fine">Their budget: '+fmt(r.budget)+'</p>':'')
    +(r.photo?'<div class="thumbs"><div class="thumb"><img src="'+r.photo+'" alt="Photo from the customer"></div></div>':'')
    +(r.status==='new'?'<div class="bk-actions"><button class="btn btn-ghost btn-sm" type="button" data-req="declined" data-id="'+r.id+'">Pass</button><button class="btn btn-primary btn-sm" type="button" data-qsend="'+r.id+'">Send a quote</button></div>':'')
    +'</article>';
}
function openSendQuote(rid){
  const r=S.pro.requests.find(x=>x.id===rid);
  if(!r)return;
  S.opener=document.activeElement;S.dirty=false;S.qr=rid;
  $('#sheet').innerHTML=
    '<div><h2 id="sheet-title">Send a quote</h2></div><p class="sheet-sub">'+esc(r.who)+' · '+esc(r.item)+'</p><p class="qdesc">'+esc(r.desc)+'</p>'
    +'<div class="field"><label class="label" for="sq-price">Your price (₦)</label><div class="money"><span aria-hidden="true">₦</span><input class="inp" id="sq-price" type="text" inputmode="numeric" maxlength="9" autocomplete="off"></div></div>'
    +'<div class="field"><label class="label" for="sq-msg">Message <span class="aside">(optional)</span></label><input class="inp" id="sq-msg" type="text" maxlength="120" autocomplete="off" placeholder="What is included, and when you can come"></div>'
    +'<p class="err" id="sq-err" role="alert" hidden></p>'
    +'<div class="sheet-actions"><button class="btn btn-ghost" type="button" data-sheet="cancel">Cancel</button><button class="btn btn-primary" type="button" data-act="sendquote-submit">Send quote</button></div>';
  showSheet('#sq-price');
}
function submitSendQuote(){
  const r=S.pro.requests.find(x=>x.id===S.qr),price=parsePrice($('#sq-price').value);
  if(!r)return;
  if(!(price>=50&&price<=10000000)){const e=$('#sq-err');e.textContent='Enter a price using numbers only, at least ₦50.';e.hidden=false;$('#sq-price').setAttribute('aria-invalid','true');$('#sq-price').focus();return;}
  const a=S.accounts[r.ckey],q=a&&a.quotes.find(x=>x.id===r.qid),mine=S.pro.published;
  if(q&&mine){
    q.quotes.push({id:q.id+'-r'+q.quotes.length,pid:mine.id,price:price,msg:$('#sq-msg').value.trim()||'I can do this job for the price quoted.',at:Date.now(),real:true});
  }
  r.status='quoted';r.quote=price;
  S.dirty=false;closeSheet();renderPreq();updateTabs();
}

/* ----- 8. Order tracking (tailors and clothing makers) ----- */
const TRACK_IDS=['tailor','fashion-designer','clothing-alteration-specialist'];
const isTracked=id=>TRACK_IDS.indexOf(id)>-1;
const STAGES=['Booked','Measurements taken','Fabric received','First fitting','Ready for pickup','Collected'];
const MEASURES=[['chest','Chest'],['waist','Waist'],['hips','Hips'],['shoulder','Shoulder'],['sleeve','Sleeve length'],['length','Garment length']];
function stepsHTML(stage){
  const n=STAGES.length,pct=Math.round((stage+1)/n*100);
  return '<div class="prog" role="progressbar" aria-label="Order progress" aria-valuemin="1" aria-valuemax="'+n+'" aria-valuenow="'+(stage+1)+'" aria-valuetext="Step '+(stage+1)+' of '+n+': '+STAGES[stage]+'"><i style="width:'+pct+'%"></i></div>'
    +'<p class="prog-t"><b>'+STAGES[stage]+'</b> · step '+(stage+1)+' of '+n+'</p>'
    +(stage<n-1?'<p class="fine">Next: '+STAGES[stage+1]+'</p>':'')
    +'<details class="allsteps"><summary>See all steps</summary><ol class="steps">'+STAGES.map((s,i)=>'<li class="'+(i<stage?'done':i===stage?'cur':'')+'"'+(i===stage?' aria-current="step"':'')+'><i aria-hidden="true">'+(i<stage?svg(I.check,12):i+1)+'</i><span>'+s+'</span></li>').join('')+'</ol></details>';
}
function trackHTML(id,b){
  if(b.stage===undefined)return '';
  const t=PROVIDERS.find(p=>p.id===id);
  return '<div class="otrack"><b>Order progress</b>'+stepsHTML(b.stage)
    +(!t.mine&&b.stage<STAGES.length-1?'<p class="fine">Demo only. A real tailor updates this. <button class="linkbtn" type="button" data-stage-next="'+id+'">Move to the next step</button>.</p>':'')+'</div>';
}
const hasMeasure=u=>MEASURES.some(m=>u.measure&&u.measure[m[0]]);
function measureText(m){return m?MEASURES.filter(x=>m[x[0]]).map(x=>x[1]+' '+m[x[0]]+' cm').join(', '):'';}
function bookExtras(t){
  if(!isTracked(t.c)||S.role!=='customer')return '';
  return '<div class="field">'+(hasMeasure(S.user)
    ?'<label class="check"><input type="checkbox" id="bk-measure" checked><span>Share my saved measurements with the tailor</span></label>'
    :'<span class="fine">Tip: save your measurements in Profile and share them in one tap next time.</span>')+'</div>';
}
function measureBlock(){
  if(S.role!=='customer')return '';
  return '<div class="block"><h2>My measurements</h2><p class="qdesc">'+(hasMeasure(S.user)?esc(measureText(S.user.measure)):'Not added yet. Save them once and share them with a tailor when you book.')+'</p>'
    +'<button class="btn btn-ghost btn-sm" type="button" data-act="measure-edit">'+(hasMeasure(S.user)?'Edit measurements':'Add measurements')+'</button></div>';
}
function openMeasure(){
  S.opener=document.activeElement;S.dirty=false;
  const m=S.user.measure||{};
  $('#sheet').innerHTML=
    '<div><h2 id="sheet-title">My measurements</h2></div><p class="sheet-sub">In centimetres. Leave out any you do not know.</p>'
    +'<div class="mgrid">'+MEASURES.map(x=>'<div class="field"><label class="label" for="m-'+x[0]+'">'+x[1]+'</label><input class="inp" id="m-'+x[0]+'" type="text" inputmode="decimal" maxlength="5" autocomplete="off" value="'+esc(m[x[0]]||'')+'"></div>').join('')+'</div>'
    +'<p class="err" id="m-err" role="alert" hidden></p>'
    +'<div class="sheet-actions"><button class="btn btn-ghost" type="button" data-sheet="cancel">Cancel</button><button class="btn btn-primary" type="button" data-act="measure-save">Save</button></div>'
    +'<p class="fine">Demo only. Kept in this tab, and shared only when you tick the box while booking.</p>';
  showSheet('#m-chest');
}
function saveMeasure(){
  const out={};
  for(const x of MEASURES){
    const v=$('#m-'+x[0]).value.trim().replace(',','.');
    if(!v)continue;
    const n=parseFloat(v);
    if(!/^\d+(\.\d)?$/.test(v)||!(n>=20&&n<=250)){const e=$('#m-err');e.textContent=x[1]+' should be a number between 20 and 250.';e.hidden=false;$('#m-'+x[0]).setAttribute('aria-invalid','true');$('#m-'+x[0]).focus();return;}
    out[x[0]]=v;
  }
  S.user.measure=out;S.dirty=false;closeSheet();renderProfile();toast('Measurements saved');
}
/* Tailor side: shown under accepted requests that came from a real booking. */
function trackExtras(r){
  let h='';
  if(r.measure&&measureText(r.measure))h+='<dl class="ticket"><div><dt>Measurements</dt><dd>'+esc(measureText(r.measure))+'</dd></div></dl>';
  if(r.tracked&&r.status==='accepted'&&r.ckey){
    const ca=S.accounts[r.ckey],cb=ca&&ca.booked[r.pid];
    if(cb&&cb.stage!==undefined){
      h+='<div class="otrack"><b>Order progress</b>'+stepsHTML(cb.stage)
        +(cb.stage<STAGES.length-1?'<button class="btn btn-ghost btn-sm" type="button" data-pstage="'+r.id+'">Mark as: '+STAGES[cb.stage+1]+'</button>':'<p class="fine">Order collected.</p>')+'</div>';
    }
  }
  return h;
}

/* ----- 2. WhatsApp: the customer can send booking details straight to the provider ----- */
function waLink(t,b){
  if(!t.phone)return '';
  const msg='Hi '+t.name+', I booked '+b.service+' on Sabi for '+b.day+', '+b.time+'. Ref '+b.ref+'.'+(b.note?' Note: '+b.note:'');
  return '<a class="btn btn-ghost" href="https://wa.me/'+t.phone+'?text='+encodeURIComponent(msg)+'" target="_blank" rel="noopener">'+svg(I.chat,20)+'Send details on WhatsApp</a>';
}

/* ----- Clicks for everything above ----- */
function moreClick(t){
  let el;
  if((el=t.closest('[data-pick]'))){openSheet(S.sel,+el.dataset.pick);return true;}
  if((el=t.closest('[data-now]'))){S.free=true;S.nowSvc=el.dataset.now;pickService(el.dataset.now);return true;}
  if((el=t.closest('[data-rview]'))){S.rview=el.dataset.rview;renderResults();return true;}
  if((el=t.closest('[data-bview]'))){S.bView=el.dataset.bview;S.bNotice='';renderBookings();const bb=$('[data-bview="'+S.bView+'"]');if(bb)bb.focus({preventScroll:true});return true;}
  if((el=t.closest('[data-qday]'))){S.qd.day=+el.dataset.qday;pressed(el,'[data-qday]');return true;}
  if((el=t.closest('[data-qaccept]'))){const p=el.dataset.qaccept.split('|');acceptQuote(p[0],p[1]);return true;}
  if((el=t.closest('[data-qsend]'))){openSendQuote(el.dataset.qsend);return true;}
  if((el=t.closest('[data-stage-next]'))){
    const b=S.booked[el.dataset.stageNext];
    if(b&&b.stage<STAGES.length-1){b.stage++;if(b.stage===STAGES.length-1)b.done=true;renderBookings();}
    return true;
  }
  if((el=t.closest('[data-pstage]'))){
    const r=S.pro.requests.find(x=>x.id===el.dataset.pstage),ca=r&&S.accounts[r.ckey],cb=ca&&ca.booked[r.pid];
    if(cb&&cb.stage<STAGES.length-1){cb.stage++;if(cb.stage===STAGES.length-1)cb.done=true;renderPreq();}
    return true;
  }
  if((el=t.closest('[data-copy-text]'))){copyText(el.dataset.copyText);return true;}
  if(!(el=t.closest('[data-act]')))return false;
  const a=el.dataset.act;
  if(a==='acct')openAccount();
  else if(a==='acct-switch')switchAccount(el.dataset.to);
  else if(a==='acct-out'){S.dirty=false;S.opener=null;closeSheet();signOut();}
  else if(a==='quote-new')openQuote();
  else if(a==='quote-submit')submitQuote();
  else if(a==='qphoto-add')$('#q-photo').click();
  else if(a==='sendquote-submit')submitSendQuote();
  else if(a==='free-toggle'){S.pro.published.freeNow=!S.pro.published.freeNow;renderPdash();const b=$('[data-act="free-toggle"]');if(b)b.focus({preventScroll:true});}
  else if(a==='wa-toggle'){S.pro.published.waAlerts=S.pro.published.waAlerts===false;renderPdash();const b=$('[data-act="wa-toggle"]');if(b)b.focus({preventScroll:true});}
  else if(a==='share-open')openShare();
  else if(a==='pro-verify'){S.ob={step:4,edit:true};nav.stack=[];show('onboard','push');}
  else if(a==='pin-open')openPin();
  else if(a==='pin-centre'){if(PinUI.map){const c=PinUI.map.getCenter();setPin([c.lat,c.lng],false);}}
  else if(a==='pin-gps')pinGps();
  else if(a==='pin-save')savePin();
  else if(a==='code-send')sendCode();
  else if(a==='code-confirm')confirmCode();
  else if(a==='id-add')$('#ob-id').click();
  else if(a==='id-rm'){S.pro.draft.idPhoto=null;renderOnboard();}
  else if(a==='measure-edit')openMeasure();
  else if(a==='measure-save')saveMeasure();
  else return false;
  return true;
}
/* File inputs inside the bottom sheet (the quote photo) */
$('#sheet').addEventListener('change',async e=>{
  if(e.target.id==='bk-service'){updSum();return;}
  if(e.target.id!=='q-photo'||!e.target.files.length)return;
  const f=e.target.files[0];
  e.target.value='';
  try{
    S.qd.photo=await shrinkPhoto(f);
    $('#q-photo-slot').innerHTML='<div class="thumbs"><div class="thumb"><img src="'+S.qd.photo+'" alt="Photo you added"></div></div>';
    $('#q-photo-btn').lastChild.textContent='Replace photo';
  }catch(x){quoteErr('That photo could not be read. Try a JPG or PNG.','q-desc');}
});


function dayOpts(){
  const out=[];
  for(let i=1;i<=3;i++){
    const d=new Date(Date.now()+i*864e5);
    out.push(d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}));
  }
  return out;
}
const TIMES=['10:00 am','12:30 pm','3:00 pm','5:00 pm'];

function showSheet(focusSel){
  $('#scrim').hidden=false;
  $('#sheet').hidden=false;
  const f=$('#sheet').querySelector(focusSel);
  if(f)f.focus();
}

function priceNote(t){const svc=SVC(t.c);return t.fabric?'Sewing fee only. Fabric: '+t.fabric.charAt(0).toLowerCase()+t.fabric.slice(1)+'.':svc.note;}
function openSheet(id,idx){
  const t=PROVIDERS.find(x=>x.id===id);
  S.sel=id;S.bk={day:0,time:0};S.dirty=false;
  S.opener=document.activeElement;
  const days=dayOpts();
  $('#sheet').innerHTML=
    '<div><h2 id="sheet-title">Book a visit</h2></div><p class="sheet-sub">'+esc(t.name)+'</p>'
    +'<div class="field"><label class="label" for="bk-service">Service</label><select id="bk-service">'+t.services.map((s,i)=>'<option'+(i===(idx||0)?' selected':'')+'>'+esc(s[0])+' · '+fmt(s[1])+'</option>').join('')+'</select></div>'
    +'<div class="field"><span class="label" id="bk-day-l">Day</span><div class="opts" role="group" aria-labelledby="bk-day-l">'+days.map((d,i)=>'<button class="chip" type="button" data-bk="day" data-i="'+i+'" aria-pressed="'+(i===0)+'">'+d+'</button>').join('')+'</div></div>'
    +'<div class="field"><span class="label" id="bk-time-l">Time</span><div class="opts" role="group" aria-labelledby="bk-time-l">'+TIMES.map((d,i)=>'<button class="chip" type="button" data-bk="time" data-i="'+i+'" aria-pressed="'+(i===0)+'">'+d+'</button>').join('')+'</div></div>'
    +bookExtras(t)
    +'<div class="field"><label class="label" for="bk-note">Note for the provider (optional)</label><input id="bk-note" type="text" maxlength="120" autocomplete="off" placeholder="Where you are, or what you need done"></div>'
    +'<div class="summary" id="bk-sum" aria-live="polite"></div>'
    +'<div class="sheet-actions"><button class="btn btn-ghost" type="button" data-sheet="cancel">Cancel</button><button class="btn btn-primary" type="button" data-sheet="confirm" id="bk-confirm">Confirm booking</button></div>'
    +'<p class="fine">Demo only. Nothing is sent to the provider.</p>';
  updSum();
  showSheet('#bk-service');
}
function updSum(){
  const el=$('#bk-sum');
  if(!el||!S.sel)return;
  const t=PROVIDERS.find(x=>x.id===S.sel),sel=$('#bk-service');
  if(!t||!sel)return;
  const s=t.services[sel.selectedIndex];
  el.innerHTML='<div class="sum-row"><span>'+esc(s[0])+'</span><b>'+fmt(s[1])+'</b></div>'
    +'<div class="sum-row sum-when"><span>'+esc(dayOpts()[S.bk.day])+', '+TIMES[S.bk.time]+'</span><span>'+esc(t.area)+'</span></div>'
    +'<p class="fine">'+esc(priceNote(t))+' You pay the provider directly. Sabi takes no payment in the app.</p>';
  const c=$('#bk-confirm');if(c)c.textContent='Confirm · '+fmt(s[1]);
}

function showTicket(t,b){
  $('#sheet').innerHTML=
    '<div><h2 id="sheet-title" tabindex="-1">Booking confirmed</h2></div><p class="sheet-sub">'+esc(t.name)+'</p>'
    +'<dl class="ticket">'
      +'<div><dt>Service</dt><dd>'+esc(b.service)+'</dd></div>'
      +'<div><dt>When</dt><dd>'+esc(b.day)+', '+b.time+'</dd></div>'
      +'<div><dt>Where</dt><dd>'+esc(t.area)+'</dd></div>'
      +(b.note?'<div><dt>Your note</dt><dd>'+esc(b.note)+'</dd></div>':'')
      +'<div><dt>Reference</dt><dd class="mono">'+b.ref+'</dd></div>'
    +'</dl>'
    +waLink(t,b)
    +'<p class="fine">Demo only. Nothing was sent to the provider automatically, so this is not a real booking.'+(t.phone?' You can send the details yourself on WhatsApp.':'')+'</p>'
    +'<button class="btn btn-primary" type="button" data-sheet="done">Done</button>';
  $('#sheet').querySelector('[data-sheet="done"]').focus();
}

function openInfo(){
  S.opener=document.activeElement;S.dirty=false;
  $('#sheet').innerHTML=
    '<div><h2 id="sheet-title">Reading a listing</h2></div>'
    +'<dl class="guide">'
      +'<dt>Rating</dt><dd>Out of 5. The detailed scores depend on the service, such as fit and finishing for tailors or workmanship and safety for electricians.</dd>'
      +'<dt>From</dt><dd>The lowest price on their list. Parts, fabric or materials are quoted separately unless the listing says otherwise.</dd>'
      +'<dt>Speed</dt><dd>How soon the work is ready or the provider can help. It reads Ready in, Arrives in, Next slot or similar, depending on the service.</dd>'
      +'<dt>On time</dt><dd>Share of jobs started or finished at the time promised.</dd>'
      +'<dt>Best match</dt><dd>Shown on one provider when there are three or more. It weighs rating, distance, whether they are open, and verification. It is a suggestion, not a ranking.</dd>'
      +'<dt>Verified</dt><dd>The provider confirmed their phone number and added an ID or a photo of their shop.</dd>'
    +'</dl>'
    +'<p class="fine">Demo only. Providers are placed around a sample point, so distances do not change when you change location, and map pins are sample positions, not real shops. The providers, prices and reviews are made up.</p>'
    +'<button class="btn btn-primary" type="button" data-sheet="done">Got it</button>';
  showSheet('[data-sheet="done"]');
}

function closeSheet(){
  if(PinUI.map){PinUI.map.remove();PinUI.map=null;PinUI.marker=null;}
  $('#scrim').hidden=true;
  $('#sheet').hidden=true;
  if(S.dirty){
    S.dirty=false;
    render(nav.cur);
    updateTabs();
    const el=nav.cur==='detail'?$('#book-btn'):$('#v-'+nav.cur+' [data-title]');
    if(el){try{el.focus({preventScroll:true});}catch(e){}}
  }else if(S.opener&&S.opener.focus){
    try{S.opener.focus();}catch(e){}
  }
}

/* ---------- Flow ---------- */
const searches={};
function pickService(id){
  const svc=SVC(id);
  if(!svc)return;
  S.svc=id;
  if(S.nowSvc===id)S.nowSvc=null;else S.free=false;
  searches.home.close();searches.res.close();
  $('#q-home').value='';
  $('#q-res').value=svc.name;
  $('#q-res').blur();
  if(nav.cur==='results'){show('results','fade');return;}
  $('#scan-title').textContent='Searching for '+svc.name;
  $('#scan-sub').textContent='Checking your location.';
  push('search');
  const t1=reduce?0:900,t2=reduce?300:1700;
  setTimeout(()=>{$('#scan-sub').textContent='Looking within 5 km of '+S.loc.short+'.';},t1);
  setTimeout(()=>{if(nav.cur==='search')show('results','push');},t2);
}
searches.home=makeSearch($('#q-home'),$('#sug-home'),pickService);
searches.res=makeSearch($('#q-res'),$('#sug-res'),pickService);
searches.ob=makeSearch($('#q-ob'),$('#sug-ob'),pickObService);

function openDetail(id){
  if(!$('#sheet').hidden){S.dirty=false;S.opener=null;closeSheet();}
  S.sel=id;
  push('detail');
}

document.addEventListener('click',e=>{
  const t=e.target;
  if(!t.closest('.search')){searches.home.close();searches.res.close();searches.ob.close();}
  if(authClick(t))return;
  const tabEl=t.closest('[data-tab]');
  if(tabEl){
    if(tabEl.dataset.tab===S.tab&&nav.stack.length===0&&nav.cur===TABVIEW[S.tab]){const sc=scroller(nav.cur);if(sc)sc.scrollTo({top:0,behavior:reduce?'auto':'smooth'});}
    else switchTab(tabEl.dataset.tab);
    return;
  }
  const goEl=t.closest('[data-go]');
  if(goEl){searches[goEl.dataset.go].go();return;}
  const grpEl=t.closest('[data-group]');
  if(grpEl){S.group=grpEl.dataset.group;push('group');return;}
  const svcEl=t.closest('[data-svc]');
  if(svcEl){pickService(svcEl.dataset.svc);return;}
  const bookEl=t.closest('[data-book]');
  if(bookEl){openSheet(bookEl.dataset.book);return;}
  const cancelEl=t.closest('[data-cancel]');
  if(cancelEl){
    const id=cancelEl.dataset.cancel;
    if(S.armed===id){dropRequest(id,S.booked[id]);delete S.booked[id];S.armed=null;renderBookings();updateTabs();toast('Booking cancelled');}
    else{
      S.armed=id;renderBookings();
      setTimeout(()=>{if(S.armed===id){S.armed=null;if(nav.cur==='bookings')renderBookings();}},4000);
    }
    return;
  }
  const openEl=t.closest('[data-open]');
  if(openEl){openDetail(openEl.dataset.open);return;}
  const sortEl=t.closest('[data-sort]');
  if(sortEl){S.sort=sortEl.dataset.sort;renderResults();return;}
  const fEl=t.closest('[data-f]');
  if(fEl){S[fEl.dataset.f]=!S[fEl.dataset.f];renderResults();return;}
  const bkEl=t.closest('[data-bk]');
  if(bkEl){
    const kind=bkEl.dataset.bk;
    S.bk[kind]=+bkEl.dataset.i;
    document.querySelectorAll('[data-bk="'+kind+'"]').forEach(b=>b.setAttribute('aria-pressed',String(b===bkEl)));
    updSum();
    return;
  }
  const shEl=t.closest('[data-sheet]');
  if(shEl){
    const a=shEl.dataset.sheet;
    if(a==='cancel'||a==='done'){closeSheet();return;}
    if(a==='confirm'){
      const tl=PROVIDERS.find(x=>x.id===S.sel);
      const idx=$('#bk-service').selectedIndex;
      const b={day:dayOpts()[S.bk.day],time:TIMES[S.bk.time],service:tl.services[idx][0],price:tl.services[idx][1],note:$('#bk-note').value.trim(),ref:'SB-'+(1000+Math.floor(Math.random()*9000))};
      if(isTracked(tl.c)){b.stage=0;const mc=$('#bk-measure');b.measure=(mc&&mc.checked)?Object.assign({},S.user.measure):null;}
      S.booked[S.sel]=b;notifyOwner(tl,b,idx);
      S.dirty=true;
      showTicket(tl,b);
      return;
    }
  }
  const act=t.closest('[data-act]');
  if(act){
    const a=act.dataset.act;
    if(a==='back'){pop();}
    else if(a==='explore'){switchTab('explore');}
    else if(a==='info'){openInfo();}
    else if(a==='book'){openSheet(S.sel);}
    else if(a==='save'){S.saved[S.sel]=!S.saved[S.sel];renderDetail(S.sel);updateTabs();toast(S.saved[S.sel]?'Saved':'Removed from saved');}
    else if(a==='clear'){S.open=false;S.express=false;S.top=false;S.verified=false;S.free=false;renderResults();}
    return;
  }
  if(t.id==='scrim'){closeSheet();}
});

document.addEventListener('keydown',e=>{
  const pin=e.target.closest&&e.target.closest('.pin');
  if(pin&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openDetail(pin.dataset.open);return;}
  if(!$('#sheet').hidden){
    if(e.key==='Escape'){closeSheet();return;}
    if(e.key==='Tab'){
      const f=$('#sheet').querySelectorAll('button,select,input,textarea,a[href]');
      if(!f.length)return;
      const first=f[0],last=f[f.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  }
});

/* ---------- Opening animation ---------- */
const splash=$('#splash');
let splashDone=false;
function endSplash(){
  if(splashDone)return;
  splashDone=true;
  splash.classList.add('out');
  $('#shell').removeAttribute('inert');
  $('#phone').classList.add('revealed');
  setTimeout(()=>{splash.remove();},reduce?0:500);
  $('#welcome-note').hidden=API.enabled;
  if(API.enabled){
    API.restore().then(p=>{
      if(p&&!S.user){S.role=p.role;signIn(p.email,p.name);}
      else if(!S.user)show('welcome');
    }).catch(()=>{if(!S.user)show('welcome');});
  }else show('welcome');
}
splash.addEventListener('click',endSplash);
setTimeout(endSplash,reduce?700:2800);
updateTabs();
})();
