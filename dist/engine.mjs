export const VERSION = 2;
export const IRRIGATION_COST = 4;
export const ENERGY_MAX = 100;
export const WATER_INTERVAL = 45000;
export const WATER_MAX = 6;
export const SEEDS = [
  { id:'carrot', zh:'甜心胡萝卜', en:'Sweet carrot', subtitle:'第一份小小的收获', cost:6, reward:14, xp:12, duration:45, level:1, color:'#e88d50' },
  { id:'daisy', zh:'奶油小雏菊', en:'Butter daisy', subtitle:'把一点阳光种进土里', cost:12, reward:27, xp:20, duration:90, level:1, color:'#d4b35c' },
  { id:'berry', zh:'暮色蓝莓', en:'Dusk berry', subtitle:'等待，会有甜甜的回报', cost:22, reward:48, xp:32, duration:150, level:2, color:'#8b83b9' },
  { id:'sunflower', zh:'朝阳向日葵', en:'Sunrise sunflower', subtitle:'朝着 Squeektoshi 的阳光', cost:38, reward:82, xp:50, duration:240, level:3, color:'#d89d37' }
];
export const LEVELS = [0, 35, 100, 220, 420, 750];
export const QUESTS = [
 {id:'first',zh:'第一份收获',en:'Your first harvest',hint:'收获任意 1 株植物',enHint:'Harvest any plant',field:'harvested',goal:1,reward:20},
 {id:'water',zh:'认真照料',en:'A little care',hint:'累计浇水 3 次',enHint:'Water plants 3 times',field:'watered',goal:3,reward:25},
 {id:'grow',zh:'把花园种满',en:'Room to grow',hint:'累计播种 6 次',enHint:'Plant 6 seeds',field:'planted',goal:6,reward:35},
 {id:'gather',zh:'小小丰收节',en:'Harvest festival',hint:'累计收获 12 株植物',enHint:'Harvest 12 plants',field:'harvested',goal:12,reward:60},
 {id:'delivery',zh:'花园第一单',en:'Your first delivery',hint:'完成 1 笔收成订单',enHint:'Complete a harvest order',field:'delivered',goal:1,reward:25}
];
export const ORDERS = [
 {id:'picnic',zh:'树下的野餐篮',en:'A picnic under the tree',hint:'两份清甜，一朵小花。',enHint:'Two sweet carrots and a little flower.',level:1,duration:180,reward:76,xp:20,quality:'any',needs:{carrot:2,daisy:1}},
 {id:'bouquet',zh:'清晨小花束',en:'A morning bouquet',hint:'留住两朵花，别急着卖掉。',enHint:'Save two flowers for a morning delivery.',level:1,duration:210,reward:96,xp:24,quality:'any',needs:{carrot:1,daisy:2}},
 {id:'dusk',zh:'暮色补给箱',en:'Dusk provisions',hint:'慢熟的蓝莓，要提前安排。',enHint:'Plan ahead for slow-growing berries.',level:2,duration:300,reward:152,xp:35,quality:'any',needs:{carrot:1,berry:2}},
 {id:'sunrise',zh:'朝阳花束',en:'Sunrise bouquet',hint:'把最长的一次等待留给向日葵。',enHint:'Leave room for your longest-growing flower.',level:3,duration:360,reward:190,xp:45,quality:'any',needs:{daisy:2,sunflower:1}},
 {id:'wheel-picnic',zh:'跑轮专送 · 野餐篮',en:'Wheel delivery · Picnic',hint:'每份都需要跑轮能量灌溉。建议先备好 12 点能量。',enHint:'Every crop needs wheel irrigation. Bank 12 energy first.',level:1,duration:360,reward:130,xp:36,quality:'charged',needs:{carrot:2,daisy:1}},
 {id:'wheel-dusk',zh:'跑轮专送 · 暮色篮',en:'Wheel delivery · Dusk',hint:'三份跑轮作物，自己安排灌溉顺序。',enHint:'Three wheel-grown crops. Choose your irrigation order.',level:2,duration:420,reward:200,xp:45,quality:'charged',needs:{daisy:1,berry:2}}
];
export const orderById = id => ORDERS.find(o => o.id === id);
export const salePrice = (id,quality='normal') => Math.floor(seedById(id).reward*(quality==='charged'?1.5:1));
export const stockCount = (state,id,quality='any') => quality==='charged'?state.inventory[id].charged:state.inventory[id].normal+state.inventory[id].charged;
const emptyInventory = () => Object.fromEntries(SEEDS.map(s=>[s.id,{normal:0,charged:0}]));
const newPlant = (seed,now) => ({seed,startedAt:now,boostMs:0,watered:false,wheelTended:false});
export function deliveryPlan(state,order=orderById(state.activeOrder?.id)) {
 if(!order)return {ready:false,items:[]};
 const items=Object.entries(order.needs).map(([id,count])=>{
  const stock=state.inventory[id],normal=order.quality==='charged'?0:Math.min(count,stock.normal),charged=Math.min(count-normal,stock.charged);
  return {id,count,normal,charged,missing:count-normal-charged};
 });
 return {ready:items.every(i=>i.missing===0),items};
}
export const seedById = id => SEEDS.find(s => s.id === id);
export const levelOf = xp => Math.min(6, 1 + LEVELS.slice(1).filter(x => xp >= x).length);
export const progressOf = (plant, now) => plant ? Math.min(1,Math.max(0,(now-plant.startedAt+plant.boostMs)/(seedById(plant.seed).duration*1000))) : 0;
export function freshState(now=Date.now()) {
 return {version:VERSION,coins:40,xp:0,water:4,waterAt:now,energy:0,plots:Array.from({length:9},(_,i)=>({unlocked:i<3,plant:i===0?newPlant('carrot',now-18000):i===1?newPlant('daisy',now-24000):null})),stats:{planted:2,harvested:0,watered:0,boosted:0,delivered:0,energyEarned:0,energySpent:0},collection:{carrot:0,daisy:0,berry:0,sunflower:0},inventory:emptyInventory(),activeOrder:null,orderSequence:0,orderHistory:[],lastOrderResult:null,energyLog:[],claimed:[],decor:'natural',createdAt:now,updatedAt:now};
}
export function tick(state,now=Date.now()) {
 const count=Math.max(0,Math.floor((now-state.waterAt)/WATER_INTERVAL));
 if(state.water>=WATER_MAX)state.waterAt=now;
 else if(count){state.water=Math.min(WATER_MAX,state.water+count);state.waterAt+=count*WATER_INTERVAL;}
 if(state.activeOrder&&now>=state.activeOrder.expiresAt){state.lastOrderResult={id:state.activeOrder.id,outcome:'expired',at:state.activeOrder.expiresAt};state.activeOrder=null;}
 state.updatedAt=now; return state;
}
export function applyAction(state,action,now=Date.now()) {
 tick(state,now);
 const plot=Number.isInteger(action.index)?state.plots[action.index]:null;
 if(action.type==='plant'){
  const seed=seedById(action.seed);
  if(!plot?.unlocked||plot.plant||!seed)return {ok:false,reason:'invalid'};
  if(levelOf(state.xp)<seed.level)return {ok:false,reason:'level'};
  if(state.coins<seed.cost)return {ok:false,reason:'coins'};
  state.coins-=seed.cost;plot.plant=newPlant(seed.id,now);state.stats.planted++;
 } else if(action.type==='water'){
  if(!plot?.plant||progressOf(plot.plant,now)>=1)return {ok:false,reason:'invalid'};
  if(plot.plant.watered)return {ok:false,reason:'watered'};
  if(state.water<1)return {ok:false,reason:'water'};
  state.water--;plot.plant.watered=true;plot.plant.boostMs+=seedById(plot.plant.seed).duration*250;state.stats.watered++;
 } else if(action.type==='harvest'){
  if(!plot?.plant||progressOf(plot.plant,now)<1)return {ok:false,reason:'unready'};
  const seed=seedById(plot.plant.seed),quality=plot.plant.wheelTended?'charged':'normal';state.xp+=seed.xp;state.stats.harvested++;state.collection[seed.id]++;state.inventory[seed.id][quality]++;plot.plant=null;
  return {ok:true,xp:seed.xp,seed:seed.id,quality};
 } else if(action.type==='unlock'){
  if(!plot||plot.unlocked)return {ok:false,reason:'invalid'};
  const count=state.plots.filter(p=>p.unlocked).length,cost=30+(count-3)*15;
  if(state.coins<cost)return {ok:false,reason:'coins'};
  state.coins-=cost;plot.unlocked=true;
 } else if(action.type==='irrigate'){
  if(!plot?.plant||progressOf(plot.plant,now)>=1)return {ok:false,reason:'growing'};
  if(plot.plant.wheelTended)return {ok:false,reason:'irrigated'};
  if(state.energy<IRRIGATION_COST)return {ok:false,reason:'energy'};
  state.energy-=IRRIGATION_COST;state.stats.energySpent+=IRRIGATION_COST;
  plot.plant.boostMs+=seedById(plot.plant.seed).duration*350;plot.plant.wheelTended=true;state.stats.boosted++;
 } else if(action.type==='sell'){
  if(!seedById(action.seed)||!['normal','charged'].includes(action.quality)||!int(action.quantity,1,9999))return {ok:false,reason:'invalid'};
  if(state.inventory[action.seed][action.quality]<action.quantity)return {ok:false,reason:'stock'};
  const reward=salePrice(action.seed,action.quality)*action.quantity;
  state.inventory[action.seed][action.quality]-=action.quantity;state.coins+=reward;return {ok:true,reward};
 } else if(action.type==='accept-order'){
  const order=orderById(action.id);
  if(!order)return {ok:false,reason:'invalid'};
  if(state.activeOrder)return {ok:false,reason:'active_order'};
  if(levelOf(state.xp)<order.level)return {ok:false,reason:'level'};
  state.orderSequence++;state.activeOrder={id:order.id,sequence:state.orderSequence,startedAt:now,expiresAt:now+order.duration*1000};state.lastOrderResult=null;
 } else if(action.type==='deliver'){
  if(!state.activeOrder||action.sequence!==state.activeOrder.sequence)return {ok:false,reason:'order_changed'};
  const order=orderById(state.activeOrder.id),plan=deliveryPlan(state,order);
  if(!plan.ready)return {ok:false,reason:'stock'};
  for(const item of plan.items){state.inventory[item.id].normal-=item.normal;state.inventory[item.id].charged-=item.charged;}
  state.coins+=order.reward;state.xp+=order.xp;state.stats.delivered++;
  state.orderHistory.unshift({id:order.id,at:now,chargedUsed:plan.items.reduce((sum,i)=>sum+i.charged,0)});state.orderHistory=state.orderHistory.slice(0,12);
  state.lastOrderResult={id:order.id,outcome:'delivered',at:now};state.activeOrder=null;return {ok:true,reward:order.reward,xp:order.xp};
 } else if(action.type==='cancel-order'){
  if(!state.activeOrder||action.sequence!==state.activeOrder.sequence)return {ok:false,reason:'order_changed'};
  state.lastOrderResult={id:state.activeOrder.id,outcome:'cancelled',at:now};state.activeOrder=null;
 } else if(action.type==='claim'){
  const quest=QUESTS.find(q=>q.id===action.id);
  if(!quest||state.claimed.includes(quest.id)||state.stats[quest.field]<quest.goal)return {ok:false,reason:'invalid'};
  state.claimed.push(quest.id);state.coins+=quest.reward;
 } else if(action.type==='decor'){
  if(!['natural','mushroom','lantern'].includes(action.id))return {ok:false,reason:'invalid'};
  if(action.id==='mushroom'&&state.stats.harvested<3||action.id==='lantern'&&levelOf(state.xp)<3)return {ok:false,reason:'level'};
  state.decor=action.id;
 } else return {ok:false,reason:'invalid'};
 return {ok:true};
}
function int(n,min=0,max=100000000){return Number.isSafeInteger(n)&&n>=min&&n<=max;}
export function validateSave(raw,now=Date.now()) {
 if(!raw||![1,VERSION].includes(raw.version)||!int(raw.coins)||!int(raw.xp)||!int(raw.water,0,WATER_MAX)||!int(raw.energy,0,100)||!int(raw.waterAt,0,now+300000)||!int(raw.createdAt,0,now+300000)||!int(raw.updatedAt,0,now+300000))throw Error('invalid_save');
 if(!Array.isArray(raw.plots)||raw.plots.length!==9||!raw.plots.slice(0,3).every(p=>p?.unlocked))throw Error('invalid_save');
 for(const p of raw.plots){
  if(!p||typeof p.unlocked!=='boolean'||(p.plant!==null&&(!p.plant||typeof p.plant!=='object'))||!p.unlocked&&p.plant!==null)throw Error('invalid_save');
  if(p.plant&&(!seedById(p.plant.seed)||!int(p.plant.startedAt,0,now+300000)||!int(p.plant.boostMs,0,100000000)||typeof p.plant.watered!=='boolean'))throw Error('invalid_save');
 }
 if(!raw.stats||!['planted','watered','harvested','boosted'].every(k=>int(raw.stats[k]))||!raw.collection||!SEEDS.every(s=>int(raw.collection[s.id])))throw Error('invalid_save');
 if(!Array.isArray(raw.claimed)||new Set(raw.claimed).size!==raw.claimed.length||!raw.claimed.every(id=>QUESTS.some(q=>q.id===id))||!['natural','mushroom','lantern'].includes(raw.decor))throw Error('invalid_save');
 const copy=structuredClone(raw);
 if(copy.version===1){
  copy.version=VERSION;copy.inventory=emptyInventory();copy.activeOrder=null;copy.orderSequence=0;copy.orderHistory=[];copy.lastOrderResult=null;copy.energyLog=[];
  Object.assign(copy.stats,{delivered:0,energyEarned:0,energySpent:0});copy.plots.forEach(p=>{if(p.plant)p.plant.wheelTended=false;});return copy;
 }
 if(!copy.inventory||!SEEDS.every(s=>copy.inventory[s.id]&&int(copy.inventory[s.id].normal)&&int(copy.inventory[s.id].charged))||!['delivered','energyEarned','energySpent'].every(k=>int(copy.stats[k]))||!int(copy.orderSequence))throw Error('invalid_save');
 if(!copy.plots.every(p=>!p.plant||typeof p.plant.wheelTended==='boolean'))throw Error('invalid_save');
 if(copy.activeOrder!==null){const a=copy.activeOrder,o=orderById(a?.id);if(!o||!int(a.sequence,1,copy.orderSequence)||!int(a.startedAt,0,now+300000)||a.expiresAt!==a.startedAt+o.duration*1000)throw Error('invalid_save');}
 if(!Array.isArray(copy.orderHistory)||copy.orderHistory.length>12||!copy.orderHistory.every(h=>orderById(h?.id)&&int(h.at,0,now+300000)&&int(h.chargedUsed,0,9)))throw Error('invalid_save');
 if(copy.lastOrderResult!==null&&(!orderById(copy.lastOrderResult?.id)||!['delivered','expired','cancelled'].includes(copy.lastOrderResult.outcome)||!int(copy.lastOrderResult.at,0,now+300000)))throw Error('invalid_save');
 if(!Array.isArray(copy.energyLog)||copy.energyLog.length>8||!copy.energyLog.every(e=>int(e.at,0,now+300000)&&typeof e.epoch==='string'&&e.epoch.length<240&&/^\d{1,80}$/.test(e.fromWork)&&/^\d{1,80}$/.test(e.toWork)&&int(e.units,1,500)&&int(e.added,0,100)&&(e.height===null||/^\d{1,80}$/.test(e.height))))throw Error('invalid_save');
 return copy;
}
export function readStatus(data, fetchedAt=Date.now()) {
 if(data?.schemaVersion!==1||data.status==='unavailable')throw Error('unavailable');
 const m=data.measurement;
 if(!m||!['online','stale'].includes(m.freshness)||!['IDLE','ACTIVE','COUNTER_FAULT'].includes(m.coreStatus)||!Number.isFinite(m.rpmMilli)||m.rpmMilli<0||typeof m.counterEpoch!=='string'||!/^\d{1,80}$/.test(m.cumulativeWorkUnits)||typeof data.installationId!=='string'||data.installationId.length+m.counterEpoch.length>=239)throw Error('schema');
 const serverAge=Date.parse(data.generatedAt)-Date.parse(m.receivedAt);
 const fresh=m.freshness==='online'&&Number.isFinite(serverAge)&&serverAge>=-5000&&serverAge<=Math.min(120,Number(m.staleAfterSeconds)||120)*1000;
 const height=data.builder?.status==='available'&&/^\d{1,80}$/.test(String(data.builder.anchor?.blockHeight))?String(data.builder.anchor.blockHeight):null;
 return {fetchedAt,fresh,hardware:m.provenance==='hardware',epoch:data.installationId+':'+m.counterEpoch,work:m.cumulativeWorkUnits,rpm:m.rpmMilli/1000,core:m.coreStatus,receivedAt:m.receivedAt,provenance:m.provenance,height};
}
// Only consecutive fresh hardware readings can produce game energy. Initial
// connections, epoch changes and long disconnects establish a new baseline.
export function energyDelta(previous,next) {
 if(!previous||!next.fresh||!previous.fresh||!next.hardware||!previous.hardware||next.core==='COUNTER_FAULT'||previous.core==='COUNTER_FAULT'||previous.epoch!==next.epoch||next.fetchedAt-previous.fetchedAt>90000||next.fetchedAt<previous.fetchedAt)return 0;
 const delta=BigInt(next.work)-BigInt(previous.work);
 return delta>0n?Number(delta>500n?500n:delta):0;
}

export function accrueEnergy(state,previous,next,carry=0){
 const units=energyDelta(previous,next);
 const continuity=previous&&next.fresh&&previous.fresh&&next.hardware&&previous.hardware&&next.core!=='COUNTER_FAULT'&&previous.core!=='COUNTER_FAULT'&&previous.epoch===next.epoch&&next.fetchedAt-previous.fetchedAt<=90000&&next.fetchedAt>=previous.fetchedAt&&BigInt(next.work)>=BigInt(previous.work);
 if(!continuity)return {carry:0,added:0};
 const total=carry+units,gain=Math.floor(total/5),added=Math.min(ENERGY_MAX-state.energy,gain);
 state.energy+=added;state.stats.energyEarned+=added;
 if(units>0){state.energyLog.unshift({at:next.fetchedAt,epoch:next.epoch,fromWork:previous.work,toWork:next.work,units,added,height:next.height??null});state.energyLog=state.energyLog.slice(0,8);}
 return {carry:state.energy>=ENERGY_MAX?0:total%5,added};
}
