import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,applyAction,progressOf,validateSave,tick,readStatus,energyDelta,accrueEnergy,deliveryPlan,ORDERS,LEVELS} from '../dist/engine.mjs';

const now=1800000000000;
test('plant, water and harvest conserve resources and cannot harvest twice',()=>{
 const s=freshState(now),before=s.coins;
 assert.equal(applyAction(s,{type:'plant',index:2,seed:'carrot'},now).ok,true);
 assert.equal(s.coins,before-6);
 assert.equal(applyAction(s,{type:'harvest',index:2},now).ok,false);
 assert.equal(applyAction(s,{type:'water',index:2},now).ok,true);
 assert.equal(s.water,3);
 assert.equal(progressOf(s.plots[2].plant,now),.25);
 assert.equal(applyAction(s,{type:'water',index:2},now).ok,false);
 assert.equal(applyAction(s,{type:'harvest',index:2},now+34000).ok,true);
 assert.equal(s.coins,before-6);assert.equal(s.inventory.carrot.normal,1);
 assert.equal(applyAction(s,{type:"sell",seed:"carrot",quality:"normal",quantity:1},now+34000).reward,14);assert.equal(s.coins,before-6+14);assert.equal(s.inventory.carrot.normal,0);assert.equal(applyAction(s,{type:"sell",seed:"carrot",quality:"normal",quantity:1},now+34000).ok,false);
 assert.equal(s.xp,12);
 assert.equal(applyAction(s,{type:'harvest',index:2},now+34000).ok,false);
});
test('locked plants, locked plots and insufficient funds reject without spending',()=>{
 const s=freshState(now);const snapshot=JSON.stringify(s);
 assert.equal(applyAction(s,{type:'plant',index:2,seed:'berry'},now).reason,'level');
 assert.equal(applyAction(s,{type:'plant',index:3,seed:'carrot'},now).ok,false);
 assert.equal(JSON.stringify(s),snapshot);
 s.coins=0;assert.equal(applyAction(s,{type:'plant',index:2,seed:'carrot'},now).reason,'coins');
 assert.equal(applyAction(s,{type:'unlock',index:3},now).reason,'coins');
});
test('water refills during absence but is capped; no banked refills at full',()=>{
 const s=freshState(now);s.water=0;tick(s,now+45000);assert.equal(s.water,1);
 tick(s,now+3600000);assert.equal(s.water,6);
 tick(s,now+3600001);s.water--;tick(s,now+3600002);assert.equal(s.water,5);
});
test('quests award once and garden unlock prices increase',()=>{
 const s=freshState(now);s.stats.harvested=1;
 assert.equal(applyAction(s,{type:'claim',id:'first'},now).ok,true);
 assert.equal(s.coins,60);assert.equal(applyAction(s,{type:'claim',id:'first'},now).ok,false);
 assert.equal(applyAction(s,{type:'unlock',index:3},now).ok,true);assert.equal(s.coins,30);
 assert.equal(applyAction(s,{type:'unlock',index:4},now).reason,'coins');
});
test('save round-trips; corrupted saves cannot insert unknown crops or negative resources',()=>{
 const s=freshState(now);assert.deepEqual(validateSave(JSON.parse(JSON.stringify(s)),now),s);
 for(const corrupt of [s=>s.coins=-1,s=>s.plots[0].plant.seed='fake',s=>s.claimed=['first','first'],s=>s.water=7,s=>s.energy=101,s=>s.version=8,s=>s.plots.pop()]){
  const bad=structuredClone(s);corrupt(bad);assert.throws(()=>validateSave(bad,now));
 }
});
const payload=(work='100',override={})=>({schemaVersion:1,installationId:'test',generatedAt:new Date(now).toISOString(),measurement:{freshness:'online',receivedAt:new Date(now-1000).toISOString(),staleAfterSeconds:120,coreStatus:'ACTIVE',rpmMilli:30000,counterEpoch:'a',cumulativeWorkUnits:work,provenance:'hardware',...override},builder:{status:'available',anchor:{blockHeight:'12'}}});
test('live energy uses new hardware work only; no initial, duplicate, stale, simulated or epoch-reset rewards',()=>{
 const a=readStatus(payload(),now),b=readStatus(payload('110'),now+15000);
 assert.equal(energyDelta(null,a),0);assert.equal(energyDelta(a,b),10);assert.equal(energyDelta(a,a),0);
 for(const override of [{freshness:'stale'},{provenance:'simulated'},{counterEpoch:'b'},{coreStatus:'COUNTER_FAULT'},{cumulativeWorkUnits:'90'},{receivedAt:new Date(now-180000).toISOString()}])assert.equal(energyDelta(a,readStatus(payload('120',override),now+15000)),0);
 assert.equal(energyDelta(a,{...b,fetchedAt:now+100000}),0);
 assert.equal(energyDelta(a,readStatus(payload('1000000'),now+15000)),500);
});
test('unsupported or unavailable API payloads are errors, not zero activity',()=>{
 assert.throws(()=>readStatus({status:'unavailable'}));
 assert.throws(()=>readStatus({...payload(),schemaVersion:2}));
 assert.throws(()=>readStatus(payload('NaN')));
 const p=readStatus(payload('100',{coreStatus:'IDLE',rpmMilli:0}),now);
 assert.equal(p.rpm,0);assert.equal(p.fresh,true);
});

test('stored energy irrigates one selected crop without a live connection',()=>{
 const s=freshState(now);s.energy=8;const other=structuredClone(s.plots[1]);
 assert.equal(applyAction(s,{type:'irrigate',index:0},now).ok,true);assert.equal(s.energy,4);assert.equal(s.stats.energySpent,4);assert.deepEqual(s.plots[1],other);assert.equal(progressOf(s.plots[0].plant,now),.75);
 assert.equal(applyAction(s,{type:'irrigate',index:0},now).reason,'irrigated');
 assert.equal(applyAction(s,{type:'harvest',index:0},now+12000).quality,'charged');assert.equal(s.inventory.carrot.charged,1);
});
test('irrigation rejects empty, mature and energy-starved crops without spending',()=>{
 const s=freshState(now);assert.equal(applyAction(s,{type:'irrigate',index:0},now).reason,'energy');s.energy=8;
 assert.equal(applyAction(s,{type:'irrigate',index:2},now).reason,'growing');assert.equal(applyAction(s,{type:'irrigate',index:0},now+50000).reason,'growing');assert.equal(s.energy,8);
});
test('dew and wheel irrigation stack once each before maturity',()=>{
 const s=freshState(now);s.energy=8;applyAction(s,{type:'plant',index:2,seed:'carrot'},now);applyAction(s,{type:'water',index:2},now);applyAction(s,{type:'irrigate',index:2},now);
 assert.equal(progressOf(s.plots[2].plant,now),.6);assert.equal(applyAction(s,{type:'water',index:2},now).ok,false);assert.equal(applyAction(s,{type:'irrigate',index:2},now).ok,false);
});
test('accepting starts a deadline, enforces level and allows only one order',()=>{
 const s=freshState(now);assert.equal(applyAction(s,{type:'accept-order',id:'dusk'},now).reason,'level');assert.equal(applyAction(s,{type:'accept-order',id:'picnic'},now).ok,true);assert.equal(s.activeOrder.expiresAt,now+180000);assert.equal(applyAction(s,{type:'accept-order',id:'bouquet'},now).reason,'active_order');
});
const stocked=()=>{const s=freshState(now);s.inventory.carrot.normal=2;s.inventory.daisy.normal=1;applyAction(s,{type:'accept-order',id:'picnic'},now);return s;};
test('delivery atomically spends exact crops, awards once and leaves history',()=>{
 const s=stocked();assert.equal(applyAction(s,{type:'deliver',sequence:1},now+1).ok,true);assert.equal(s.coins,116);assert.equal(s.xp,20);assert.equal(s.inventory.carrot.normal,0);assert.equal(s.inventory.daisy.normal,0);assert.equal(s.stats.delivered,1);assert.equal(s.orderHistory.length,1);assert.equal(applyAction(s,{type:'deliver',sequence:1},now+1).ok,false);assert.equal(s.coins,116);
});
test('insufficient stock cannot partially deduct or award an order',()=>{
 const s=stocked();s.inventory.daisy.normal=0;const before=structuredClone(s.inventory);assert.equal(applyAction(s,{type:'deliver',sequence:1},now).reason,'stock');assert.deepEqual(s.inventory,before);assert.equal(s.coins,40);assert.equal(s.stats.delivered,0);
});
test('regular orders prefer normal crops then disclose charged fallback',()=>{
 const s=stocked();s.inventory.carrot.normal=1;s.inventory.carrot.charged=3;
 assert.deepEqual(deliveryPlan(s).items[0],{id:'carrot',count:2,normal:1,charged:1,missing:0});applyAction(s,{type:'deliver',sequence:1},now);assert.equal(s.inventory.carrot.charged,2);assert.equal(s.orderHistory[0].chargedUsed,1);
});
test('wheel orders require wheel-grown inventory',()=>{
 const s=stocked();applyAction(s,{type:'cancel-order',sequence:1},now);applyAction(s,{type:'accept-order',id:'wheel-picnic'},now);assert.equal(deliveryPlan(s).ready,false);s.inventory.carrot.charged=2;s.inventory.daisy.charged=1;assert.equal(applyAction(s,{type:'deliver',sequence:2},now).ok,true);assert.equal(s.inventory.carrot.normal,2);assert.equal(s.coins,170);
});
test('expiry and cancellation keep stock, crops, coins and energy',()=>{
 for(const expire of [true,false]){const s=stocked();s.energy=15;const plants=structuredClone(s.plots),stock=structuredClone(s.inventory);if(expire)tick(s,now+180000);else applyAction(s,{type:'cancel-order',sequence:1},now+1);assert.equal(s.activeOrder,null);assert.deepEqual(s.plots,plants);assert.deepEqual(s.inventory,stock);assert.equal(s.energy,15);assert.equal(s.coins,40);assert.equal(s.lastOrderResult.outcome,expire?'expired':'cancelled');}
});
test('stale confirmation cannot settle a new order or one at its deadline',()=>{
 const s=stocked();applyAction(s,{type:'cancel-order',sequence:1},now);applyAction(s,{type:'accept-order',id:'picnic'},now);assert.equal(applyAction(s,{type:'deliver',sequence:1},now).reason,'order_changed');assert.equal(applyAction(s,{type:'deliver',sequence:2},now+180000).reason,'order_changed');assert.equal(s.coins,40);
});
test('v1 migration retains progress without regranting inventory from old paid harvests',()=>{
 const v1=freshState(now);v1.version=1;v1.coins=158;v1.xp=64;v1.energy=9;v1.stats.harvested=5;v1.collection.carrot=5;v1.decor='mushroom';v1.claimed=['first'];v1.plots[3].unlocked=true;v1.plots[0].plant.boostMs=9000;
 for(const key of ['inventory','activeOrder','orderSequence','orderHistory','lastOrderResult','energyLog'])delete v1[key];for(const p of v1.plots)if(p.plant)delete p.plant.wheelTended;for(const key of ['delivered','energyEarned','energySpent'])delete v1.stats[key];
 const s=validateSave(v1,now);assert.equal(s.version,2);for(const key of ['coins','xp','energy','water','collection','claimed','decor'])assert.deepEqual(s[key],v1[key]);assert.equal(s.plots[0].plant.boostMs,9000);assert.equal(s.plots[0].plant.wheelTended,false);assert.equal(s.inventory.carrot.normal,0);assert.equal(v1.version,1);
});
test('v2 validation rejects corrupted quality, inventory, order and energy history',()=>{
 const s=stocked();assert.deepEqual(validateSave(s,now),s);for(const corrupt of [x=>x.inventory.carrot.normal=-1,x=>x.inventory.carrot.charged=.5,x=>x.plots[0].plant=false,x=>x.plots[0].plant.wheelTended='yes',x=>x.activeOrder.expiresAt++,x=>x.orderHistory=[{id:'bogus'}],x=>x.energyLog=[{at:now}],x=>delete x.activeOrder]){const bad=structuredClone(s);corrupt(bad);assert.throws(()=>validateSave(bad,now));}
});
test('energy carry, caps and saved audit records preserve valid provenance',()=>{
 const s=freshState(now),a=readStatus(payload('100'),now),b=readStatus(payload('103'),now+15000),c=readStatus(payload('107'),now+30000);
 assert.deepEqual(accrueEnergy(s,null,a),{carry:0,added:0});let r=accrueEnergy(s,a,b);assert.equal(r.carry,3);r=accrueEnergy(s,b,c,r.carry);assert.equal(r.added,1);assert.equal(r.carry,2);assert.equal(s.energyLog[0].fromWork,'103');assert.equal(s.energyLog[0].toWork,'107');assert.deepEqual(validateSave(s,now+30000),s);
 s.energy=99;r=accrueEnergy(s,c,readStatus(payload('100000'),now+45000),r.carry);assert.equal(s.energy,100);assert.equal(r.added,1);assert.equal(r.carry,0);assert.equal(s.energyLog[0].units,500);
});
test('changed epoch, faults, resets and long gaps discard fractional energy',()=>{
 const a=readStatus(payload('100'),now);for(const b of [readStatus(payload('101',{counterEpoch:'new'}),now+15000),readStatus(payload('101',{coreStatus:'COUNTER_FAULT'}),now+15000),readStatus(payload('90'),now+15000),readStatus(payload('101'),now+100000)]){const s=freshState(now);assert.deepEqual(accrueEnergy(s,a,b,4),{carry:0,added:0});assert.equal(s.energy,0);}
});
test('all standard orders fit three plots and their time budget without live energy',()=>{
 for(const order of ORDERS.filter(o=>o.quality==='any')){const s=freshState(now);s.coins=300;s.xp=LEVELS[order.level-1];s.plots.forEach(p=>p.plant=null);applyAction(s,{type:'accept-order',id:order.id},now);let i=0;for(const [seed,count] of Object.entries(order.needs))for(let n=0;n<count;n++)assert.equal(applyAction(s,{type:'plant',seed,index:i++},now).ok,true);for(let p=0;p<i;p++)assert.equal(applyAction(s,{type:'harvest',index:p},now+order.duration*1000-1).ok,true);assert.equal(applyAction(s,{type:'deliver',sequence:1},now+order.duration*1000-1).ok,true);}
});
test('missing or malformed settled height never corrupts the energy save',()=>{
 const p=payload('110');p.builder.anchor={};const next=readStatus(p,now+15000),s=freshState(now);assert.equal(next.height,null);accrueEnergy(s,readStatus(payload(),now),next);assert.deepEqual(validateSave(s,now+15000),s);
});
