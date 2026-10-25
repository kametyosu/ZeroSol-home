import {PDFDocument,rgb} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {catalog,quoteTotals} from '../public/sales-model.js';
let fontBytes;
export async function createQuotePdf(quote){
 if(quote.pricePending||['pending','cancelled','rejected'].includes(quote.status))throw Error('価格未確定・取消済みの見積は発行できません');
 if(!fontBytes){const r=await fetch('/fonts/ZeroSolJP.ttf');if(!r.ok)throw Error('PDF用フォントを取得できません。再試行してください。');fontBytes=new Uint8Array(await r.arrayBuffer());}
 const pdf=await PDFDocument.create();pdf.registerFontkit(fontkit);const font=await pdf.embedFont(fontBytes,{subset:false});
 pdf.setTitle('御見積書 '+quote.number);pdf.setAuthor(quote.issuerName||'ZeroSol');pdf.setSubject(quote.title);
 const green=rgb(.16,.34,.25),gray=rgb(.43,.49,.45),line=rgb(.84,.88,.85);let page,y;
 const wrap=(text,size,width)=>{const result=[];for(const block of String(text??'').split('\n')){let s='';for(const c of block){if(s&&font.widthOfTextAtSize(s+c,size)>width){result.push(s);s=c}else s+=c;}result.push(s)}return result};
 const draw=(s,x,yy,size=10,color=green)=>page.drawText(String(s??''),{x,y:yy,size,font,color});
 const text=(s,x,yy,size,width,color=green)=>{const lines=wrap(s,size,width);lines.forEach((v,i)=>draw(v,x,yy-i*(size+5),size,color));return lines.length*(size+5)};
 const rule=yy=>page.drawLine({start:{x:42,y:yy},end:{x:553,y:yy},thickness:.7,color:line});
 function newPage(){page=pdf.addPage([595.28,841.89]);let headerName=quote.issuerName||'ZeroSol';while(font.widthOfTextAtSize(headerName,14)>315)headerName=headerName.slice(0,-2)+'…';draw(headerName,42,795,14);draw('御見積書',425,791,24);rule(775);y=749;}
 function tableHead(){page.drawRectangle({x:42,y:y-25,width:511,height:27,color:rgb(.93,.96,.94)});draw('品名・仕様',50,y-16,9);draw('数量',322,y-16,9);draw('単価（税抜）',375,y-16,9);draw('金額（税抜）',471,y-16,9);y-=42;}
 newPage();const date=new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(quote.issuedAt||quote.created||Date.now()));
 y-=text(quote.customer+' 御中',42,y,15,305)+5;const metaY=749;draw('見積番号：'+quote.number,365,metaY,9);draw('発行日：'+date,365,metaY-19,9);draw('有効期限：'+(quote.expiry||'別途確認'),365,metaY-38,9);
 y=Math.min(y,680);y-=text('件名：'+quote.title,42,y,12,511)+8;
 const totals=quoteTotals(quote.lines);page.drawRectangle({x:42,y:y-43,width:511,height:48,color:rgb(.94,.97,.94)});draw('御見積金額（税込）',55,y-24,11);draw('¥ '+totals.total.toLocaleString('ja-JP'),326,y-28,21);y-=73;
 y-=text('発行元：'+(quote.issuerName||'ZeroSol'),42,y,10,511);if(quote.issuerAddress)y-=text(quote.issuerAddress,42,y,9,511,gray);if(quote.issuerEmail)y-=text('連絡先：'+quote.issuerEmail,42,y,9,511,gray);y-=15;if(y<180)newPage();tableHead();
 for(const item of quote.lines){const product=catalog.find(p=>p.sku===item.sku);const label=product?.name||item.sku;const h=Math.max(36,wrap(label,9,255).length*14+14);if(y-h<120){newPage();draw('明細（続き） / '+quote.number,42,y,10);y-=25;tableHead();}text(label,50,y,9,255);draw(item.qty+' '+(product?.unit||''),320,y,9);draw(item.price.toLocaleString('ja-JP'),375,y,9);draw((item.qty*item.price).toLocaleString('ja-JP'),470,y,9);y-=h;rule(y+12);}
 if(y<210)newPage();y-=15;draw('小計（税抜）',340,y,10);draw('¥ '+totals.subtotal.toLocaleString('ja-JP'),465,y,10);y-=23;draw('消費税（10%）',340,y,10);draw('¥ '+totals.tax.toLocaleString('ja-JP'),465,y,10);y-=25;draw('合計（税込）',340,y,11);draw('¥ '+totals.total.toLocaleString('ja-JP'),450,y,12);y-=39;
 if(quote.note){draw('備考・お取引条件',42,y,10);y-=20;for(const row of wrap(quote.note,9,500)){if(y<75)newPage();draw(row,42,y,9,gray);y-=15;}}
 const pages=pdf.getPages();pages.forEach((p,i)=>{p.drawLine({start:{x:42,y:45},end:{x:553,y:45},thickness:.5,color:line});p.drawText('操作検証用の見積書です。正式な承認・契約条件は別途確認してください。',{x:42,y:29,size:8,font,color:gray});p.drawText(`${i+1} / ${pages.length}`,{x:510,y:29,size:8,font,color:gray})});return pdf.save();
}
