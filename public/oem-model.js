export const oemProducts=[
 {id:'OEM-SHEET',name:'遮熱シート OEM供給',unit:'巻',description:'自社ブランドでの供給を想定。シート規格・包装・表示内容を相談。',conditions:'参考ロット：10巻〜（デモ条件）／単価・納期は個別確認'},
 {id:'OEM-COAT',name:'窓コーティング OEM供給',unit:'缶',description:'製品仕様、容器、ラベル表示、荷姿の希望を相談。',conditions:'参考ロット：20缶〜（デモ条件）／適合性・表示条件は要確認'},
 {id:'OEM-HVLS',name:'HVLS 供給相談',unit:'台',description:'対象機種・供給形態・ブランド表示の可否を確認。',conditions:'ロット・OEM対応の可否・価格・納期はすべて個別確認'}
];
export function createOemRequest(input,{id=globalThis.crypto.randomUUID(),now=new Date().toISOString()}={}){
 const product=oemProducts.find(p=>p.id===input.product);
 if(!['quote','order'].includes(input.type)||!product)throw Error('依頼種別・商品を選択してください');
 const qty=Number(input.qty);
 if(!Number.isSafeInteger(qty)||qty<1||qty>1000000)throw Error('数量は1〜100万の整数で入力してください');
 const brand=String(input.brand||'').trim(),notes=String(input.notes||'').trim();
 if(!brand||brand.length>100||notes.length>3000)throw Error('ブランド名は100文字以内、相談内容は3000文字以内で入力してください');
 const date=String(input.requestedDate||'');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+'T00:00:00Z'))||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date)throw Error('希望納期を正しい日付で入力してください');
 return {id,type:input.type,product:product.id,qty,brand,notes,requestedDate:date,status:'recorded',created:now};
}
export function cancelOemRequest(requests,id){const request=requests.find(r=>r.id===id);if(!request||request.status!=='recorded')throw Error('この依頼は取り消せません');return requests.map(r=>r.id===id?{...r,status:'cancelled'}:{...r});}

export function replyOemRequest(requests,id,input){
 const request=requests.find(r=>r.id===id&&r.type==='quote');
 if(!request||request.status!=='recorded')throw Error('未回答の見積依頼を選択してください');
 const price=Number(input.price),confirmedDate=String(input.confirmedDate||''),reply=String(input.reply||'').trim();
 if(!Number.isSafeInteger(price)||price<0||price>1e9)throw Error('単価は0〜10億円の整数で入力してください');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(confirmedDate)||!Number.isFinite(Date.parse(confirmedDate+'T00:00:00Z'))||new Date(confirmedDate+'T00:00:00Z').toISOString().slice(0,10)!==confirmedDate)throw Error('出荷予定日を正しく入力してください');
 if(!reply||reply.length>3000)throw Error('供給条件は1〜3000文字で入力してください');
 return requests.map(r=>r.id===id?{...r,status:'responded',price,confirmedDate,reply}:r);
}
