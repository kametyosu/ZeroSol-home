import {submitPortalOrder,acceptPortalOrder} from './portal-model.js';
import {updateOrder} from './sales-model.js';
// Opt-in fixtures use the normal stock/transaction operations; existing records are retained.
export function addDemoTransactions(state){
 if(state.presentationDemoVersion===1)return state;
 let next=structuredClone(state);
 const examples=[
  ['dealer','ZS-SHEET-20',8,'submitted','名古屋工場の屋根遮熱工事向け。納期のご回答をお願いします。'],
  ['dealer','ZS-COAT-10',2,'confirmed','みどり製作所の窓遮熱工事向け。在庫補充分。'],
  ['dealer','ZS-SHEET-20',5,'shipped','物流センター向けの施工用材料。到着後に入荷確認を行います。'],
  ['oem','ZS-SHEET-20',10,'submitted','自社ブランド「SOLTHERM」の初回供給。標準梱包・ブランドラベル仕様。'],
  ['oem','ZS-COAT-10',4,'confirmed','自社ブランド「SOLTHERM COAT」の定期補充。'],
  ['oem','ZS-SHEET-20',6,'shipped','自社ブランド商品の追加供給。検品後に入荷を計上します。']
 ];
 for(const [customer,sku,qty,status,notes] of examples){
  next=submitPortalOrder(next,customer,{sku,qty,notes,brand:customer==='oem'?'SOLTHERM':'',requestedDate:'2026-11-06'});
  const order=next.portalOrders[0];
  if(status!=='submitted'){
   next=acceptPortalOrder(next,order.id,{price:sku==='ZS-SHEET-20'?96000:65000,confirmedDate:'2026-11-04'});
   if(status==='shipped')next=updateOrder(next,order.quoteId,'manufacturer','ship');
  }
 }
 next.presentationDemoVersion=1;return next;
}
