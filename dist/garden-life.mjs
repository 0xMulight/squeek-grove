import {hamster,plantArt,icon} from './art.mjs?v=20261107-garden';
import {progressOf,seedById,deliveryPlan,orderById} from './engine.mjs';

const STORAGE='squeek-grove-atmosphere-v1';
const MODES=['auto','day','dusk','night'];
export const sceneForHour=hour=>hour>=6&&hour<17?'day':hour>=17&&hour<19?'dusk':'night';
const text=(lang,zh,en)=>lang==='zh'?zh:en;
const basketArt='<svg viewBox="0 0 100 80" fill="none" aria-hidden="true"><ellipse cx="50" cy="72" rx="36" ry="5" fill="#263d30" opacity=".18"/><path d="M29 34C27 3 73 3 71 34" stroke="#9f754a" stroke-width="7"/><path d="M15 33h70L76 69H24Z" fill="#c99558" stroke="#8c633d" stroke-width="2"/><path d="m29 35 5 32m12-32 1 33m13-33-1 33m13-33-5 32M20 46h60M23 58h54" stroke="#e8bd7e" stroke-width="3"/><rect x="12" y="28" width="76" height="10" rx="5" fill="#e4b571" stroke="#9f754a" stroke-width="2"/><path d="M32 29c-6-13-2-18 7-20-2 11 7 10 2 20" fill="#8ca464"/><path d="M54 28c-3-11 4-15 13-14-1 8-4 12-13 14" fill="#617e4d"/></svg>';

export function companionHint(state,lang='zh',scene='day',now=Date.now()) {
 const say=(zh,en)=>text(lang,zh,en);
 const name=id=>lang==='zh'?seedById(id).zh:seedById(id).en;
 if(state.activeOrder&&deliveryPlan(state).ready)return say('这一篮已经凑齐啦，去交单吧！','Your basket is ready. Time to deliver!');
 const ready=state.plots.findIndex(p=>p.plant&&progressOf(p.plant,now)>=1);
 if(ready>=0)return say(`第 ${ready+1} 块地熟啦，我帮你看着呢。`,`Plot ${ready+1} is ready. I kept an eye on it!`);
 if(state.activeOrder){const missing=deliveryPlan(state).items.find(i=>i.missing>0);if(missing){const wheel=orderById(state.activeOrder.id)?.quality==='charged';return wheel?say(`还差 ${missing.missing} 株跑轮${name(missing.id)}，记得分配能量哦。`,`Grow ${missing.missing} more wheel-grown ${name(missing.id)} for your order.`):say(`订单还差 ${missing.missing} 株${name(missing.id)}，留着别卖哦。`,`Save ${missing.missing} more ${name(missing.id)} for your order.`);}}
 const thirsty=state.plots.findIndex(p=>p.plant&&!p.plant.watered&&progressOf(p.plant,now)<1);
 if(thirsty>=0&&state.water>0)return say(`第 ${thirsty+1} 块地还能浇点露水，快长大呀。`,`Plot ${thirsty+1} could use a little dew.`);
 if(thirsty>=0&&!state.water)return say('露水还在慢慢攒，我们等一小会儿。','The dew is refilling. Let’s take a little break.');
 if(state.plots.some(p=>p.unlocked&&!p.plant)&&state.coins>=6)return say('还有空地呢，挑一颗喜欢的种子吧。','There’s room for one more little seed.');
 return scene==='night'?say('灯给你留着，今晚也慢慢种。','I’ll leave the light on. Take your time.'):say('你照顾花园，我负责陪着你。','You tend the garden. I’ll keep you company.');
}

export function createGardenLife({getState,getLanguage}) {
 let mode='auto',motion=true,taps=0,reaction=null,lastInteraction=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const effects=new Set();
 try{const saved=JSON.parse(localStorage.getItem(STORAGE));if(MODES.includes(saved?.mode))mode=saved.mode;if(typeof saved?.motion==='boolean')motion=saved.motion;}catch{}
 const lang=()=>getLanguage();
 const t=(zh,en)=>text(lang(),zh,en);
 const scene=()=>mode==='auto'?sceneForHour(new Date().getHours()):mode;
 const animated=()=>motion&&!reduced.matches;
 const persist=()=>{try{localStorage.setItem(STORAGE,JSON.stringify({mode,motion}));}catch{}};
 const modeName=key=>({auto:t('随时间','Auto'),day:t('日光','Day'),dusk:t('落日','Dusk'),night:t('星夜','Night')})[key];
 const sceneName=()=>({day:t('日光慢慢','A little sunshine'),dusk:t('落日余温','Golden hour'),night:t('星光作伴','Under the stars')})[scene()];
 function controls(){return `<div class="garden-scene-bar"><span class="scene-bar-title">${icon('sun',14)} ${t('花园时光','GARDEN HOURS')}</span><div class="scene-switch" role="group" aria-label="${t('花园光影','Garden lighting')}">${MODES.map(key=>`<button data-action="scene-mode" data-mode="${key}" aria-pressed="${mode===key}" title="${key==='auto'?t('跟随设备当地时间','Follows your local time'):modeName(key)}">${modeName(key)}</button>`).join('')}</div><button class="motion-switch" data-action="scene-motion" aria-pressed="${animated()}" ${reduced.matches?'disabled':''}>${t('动效','Motion')} <span data-motion-label>${animated()?t('开','on'):t('关','off')}</span></button></div>`;}
 function companion(){return `<div class="companion-corner"><div class="companion-bubble"><span class="companion-caption">${t('花园小伙伴','YOUR GARDEN PAL')}</span><p id="companion-speech" role="status" aria-live="polite">${companionHint(getState(),lang(),scene())}</p></div><button class="companion-button" data-action="pet-hamster" aria-label="${t('摸摸仓鼠，听听花园提醒','Pet the hamster for a garden tip')}" aria-describedby="companion-speech">${hamster('companion-art')}<span class="companion-touch">${t('摸摸我','Say hello')}</span><span class="sleep-symbol" aria-hidden="true">z<span>z</span></span></button></div>`;}
 function basket(){return `<button class="harvest-basket" id="harvest-basket" data-action="nav" data-view="orders" aria-label="${t('收成篮，打开仓库','Harvest basket, open warehouse')}">${basketArt}<span class="basket-count" id="basket-count">0</span><span class="basket-caption">${t('收成篮','HARVEST')}</span></button>`;}
 function ambient(){return `<div class="garden-ambience" aria-hidden="true"><div class="sunbeam"></div>${Array.from({length:7},(_,i)=>`<i class="firefly" style="--i:${i};left:${12+i*12}%;top:${23+(i*19)%52}%"></i>`).join('')}<i class="drifting-leaf leaf-one"></i><i class="drifting-leaf leaf-two"></i></div>`;}
 function update(){
  const card=document.querySelector('.garden-card');if(!card)return;
  card.dataset.scene=scene();card.dataset.motion=animated()?'on':'off';
  const label=document.querySelector('#scene-label');if(label)label.textContent=sceneName();
  const clock=document.querySelector('#scene-clock');if(clock)clock.textContent=mode==='auto'?t('随当地时间','LOCAL TIME'):t('自由光影','YOUR CHOICE');
  card.querySelectorAll('[data-action="scene-mode"]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mode===mode)));
  const motionButton=card.querySelector('[data-action="scene-motion"]');if(motionButton){motionButton.setAttribute('aria-pressed',String(animated()));motionButton.disabled=reduced.matches;motionButton.querySelector('[data-motion-label]').textContent=animated()?t('开','on'):t('关','off');}
  const now=Date.now(),active=reaction&&reaction.until>now?reaction:null;
  if(!active)reaction=null;
  const mood=active?.mood||(scene()==='night'&&now-lastInteraction>25000?'sleepy':'idle');
  const buddy=card.querySelector('.companion-button');if(buddy)buddy.dataset.mood=mood;
  const speech=card.querySelector('#companion-speech');
  const message=active?text(lang(),active.zh,active.en):companionHint(getState(),lang(),scene());
  if(speech&&speech.textContent!==message)speech.textContent=message;
  const total=Object.values(getState().inventory).reduce((sum,x)=>sum+x.normal+x.charged,0);
  const count=card.querySelector('#basket-count');if(count)count.textContent=total;
  const bag=card.querySelector('#harvest-basket');if(bag)bag.setAttribute('aria-label',t(`收成篮，${total} 份作物，打开仓库`,`Harvest basket, ${total} crops, open warehouse`));
 }
 function react(kind){
  const messages={
   plant:['种下啦，我陪它一起长大。','A new seed! I’ll keep it company.','nibble'],
   water:['咕嘟咕嘟，小苗喝饱啦。','A little drink for a little sprout.','happy'],
   irrigate:['跑轮的能量，送到这株啦！','Wheel energy, delivered to your crop!','happy'],
   harvest:['装进小篮子里，一株也没落下。','Into the basket. Every little harvest counts.','happy'],
   deliver:['送到啦！今天也是勤劳的小园丁。','Delivery complete! A good day in the garden.','happy'],
   unlock:['又多一块地，我先替你踩踩土。','More room to grow. Let me inspect the soil!','happy'],
   claim:['奖励收好，下一颗种子等着你呢。','A little reward for your next seed.','happy']
  };
  const msg=messages[kind];if(!msg)return;
  reaction={zh:msg[0],en:msg[1],mood:msg[2],until:Date.now()+4500};lastInteraction=Date.now();update();
 }
 function pet(){
  taps++;lastInteraction=Date.now();
  if(taps%3===0){reaction=null;update();return;}
  const msg=taps%3===1?['嘿嘿，今天也有好好照顾花园呀。','Hello, you. Thanks for looking after our garden.','happy']:['瓜子分你一颗，只给你哦。','One little seed for you. Our little secret.','nibble'];
  reaction={zh:msg[0],en:msg[1],mood:msg[2],until:Date.now()+5000};update();
 }
 function clearEffects(){effects.forEach(el=>el.remove());effects.clear();}
 function transient(className,html,style,duration=1100){
  if(!animated()||document.hidden||effects.size>=20)return;
  const el=document.createElement('div');el.className='garden-effect '+className;el.setAttribute('aria-hidden','true');el.innerHTML=html;Object.assign(el.style,style);document.body.append(el);effects.add(el);
  setTimeout(()=>{el.remove();effects.delete(el);},duration);
  return el;
 }
 function capture(index){const el=document.getElementById('plot-'+index);if(!el)return null;const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,width:r.width,height:r.height};}
 function effect(kind,index,origin,seed,delay=0){
  if(!animated()||document.hidden)return;
  const pos=capture(index)||origin;if(!pos)return;
  const target=document.getElementById('plot-'+index);
  if(kind==='plant'){
   if(target){target.dataset.effect='plant';setTimeout(()=>{delete target.dataset.effect;},750);}
   transient('seed-drop','<i></i><span></span>',{left:pos.x+'px',top:(pos.y-10)+'px'},850);
  }else if(kind==='water'||kind==='irrigate'){
   const markup=`<span class="watering-can">${icon('water',28)}</span>${Array.from({length:7},(_,i)=>`<i style="--i:${i};--drop-x:${(i-3)*10}px"></i>`).join('')}<span class="water-ring"></span>`;
   transient('water-splash '+(kind==='irrigate'?'charged-splash':''),markup,{left:pos.x+'px',top:pos.y+'px'},1100);
   if(target){target.dataset.effect='water';setTimeout(()=>{delete target.dataset.effect;},1000);}
  }else if(kind==='harvest'&&seed){
   const bag=document.querySelector('#harvest-basket'),end=bag?.getBoundingClientRect();if(!origin||!end)return;
   const el=transient('harvest-flight',plantArt(seed,1,64),{left:(origin.x-32)+'px',top:(origin.y-60)+'px'},1100+delay);
   if(el){el.style.setProperty('--dx',(end.x+end.width/2-origin.x)+'px');el.style.setProperty('--dy',(end.y+end.height/2-origin.y+25)+'px');el.style.setProperty('--flight-delay',delay+'ms');}
   bag.classList.remove('basket-bounce');requestAnimationFrame(()=>bag.classList.add('basket-bounce'));setTimeout(()=>bag.classList.remove('basket-bounce'),1000);
  }
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clearEffects();else update();});
 window.addEventListener('pagehide',clearEffects);
 reduced.addEventListener('change',()=>{clearEffects();update();});
 return {controls,companion,basket,ambient,update,react,pet,effect,capture,clearEffects,
  setMode(value){if(!MODES.includes(value))return;mode=value;persist();update();},
  toggleMotion(){motion=!motion;persist();clearEffects();update();}
 };
}
