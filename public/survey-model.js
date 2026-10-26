const companies=['dealer','oem'];
const text=(value,max)=>String(value||'').trim().slice(0,max);
export function createSurveyRequest(records,company,input){
 if(!companies.includes(company))throw Error('取引先を確認してください');
 const customer=text(input.customer,100),site=text(input.site,200),notes=text(input.notes,2000);
 if(!customer||!site||!['factory','dealer'].includes(input.customerType))throw Error('お客様名・取引先区分・調査先を入力してください');
 return [{id:crypto.randomUUID(),number:'SR-'+String(records.length+1).padStart(4,'0'),company,customer,customerType:input.customerType,site,notes,status:'requested',created:new Date().toISOString()},...records];
}
export function issueSurvey(records,id,input){
 const record=records.find(r=>r.id===id&&r.status==='requested'),reply=text(input.reply,2000);
 if(!record)throw Error('未発行の依頼を選択してください');
 if(!reply)throw Error('取引先への案内を入力してください');
 return records.map(r=>r.id===id?{...r,status:'issued',issueNumber:'SURV-'+r.number.slice(3),reply,issued:new Date().toISOString()}:r);
}
export function visibleSurveys(records,company){return records.filter(r=>company==='manufacturer'||r.company===company);}
