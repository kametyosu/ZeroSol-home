import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialSales} from '../public/sales-model.js';
import {withPortal} from '../public/portal-model.js';
import {addDemoTransactions} from '../public/demo-data.js';
import {createOemRequest,replyOemRequest} from '../public/oem-model.js';
test('説明用取引は既存データを保持し、受注・引当・出荷と整合し、再追加しない',()=>{
 const original=withPortal(initialSales());original.movements.push({owner:'dealer',sku:'ZS-SHEET-20',qty:1,reason:'既存の記録'});
 const n=addDemoTransactions(original);
 assert.equal(original.portalOrders.length,0);assert.equal(n.portalOrders.length,6);
 assert.equal(n.quotes.length,6);assert.ok(n.movements.some(m=>m.reason==='既存の記録'));
 assert.deepEqual(n.stock.manufacturer['ZS-SHEET-20'],{onHand:109,reserved:0,min:30});
 assert.deepEqual(n.stock.manufacturer['ZS-COAT-10'],{onHand:24,reserved:6,min:10});
 assert.equal(n.portalOrders.filter(o=>o.status==='shipped').length,2);
 for(const o of n.portalOrders){const q=n.quotes.find(q=>q.id===o.quoteId);assert.equal(q.portalOrderId,o.id);assert.equal(q.status,o.status==='submitted'?'pending':o.status);}
 assert.deepEqual(addDemoTransactions(n),n);
});
test('説明用取引が既存在庫で処理できない場合は元データを変更しない',()=>{
 const n=withPortal(initialSales());n.stock.manufacturer['ZS-SHEET-20'].onHand=0;const before=structuredClone(n);
 assert.throws(()=>addDemoTransactions(n),/在庫が不足/);assert.deepEqual(n,before);
});
test('OEM回答は未回答見積のみを更新し、価格・出荷予定・供給条件を検証する',()=>{
 const r=createOemRequest({type:'quote',product:'OEM-SHEET',qty:20,brand:'SOLTHERM',requestedDate:'2026-11-20'});
 const answer={price:95000,confirmedDate:'2026-11-18',reply:'標準梱包・ブランド表示は原稿確認後に確定'};
 const [answered]=replyOemRequest([r],r.id,answer);assert.equal(r.status,'recorded');assert.equal(answered.status,'responded');assert.equal(answered.price,95000);
 assert.throws(()=>replyOemRequest([answered],r.id,answer),/未回答/);
 assert.throws(()=>replyOemRequest([{...r,type:'order'}],r.id,answer),/未回答/);
 for(const patch of [{price:-1},{price:0.5},{confirmedDate:'2026-02-30'},{confirmedDate:''},{reply:' '},{reply:'a'.repeat(3001)}])assert.throws(()=>replyOemRequest([r],r.id,{...answer,...patch}));
});
