const screens=new Map();let hooks,active=null,restoring=false,lastRestored='';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function registerScreens(entries){for(const [key,handler] of Object.entries(entries))screens.set(key,handler);}
export function setupNavigation(value){hooks=value;window.addEventListener('popstate',restore);window.addEventListener('hashchange',restore);}
function url(context,route){if(!context.mode)return '#/';const parts=[context.mode,context.view];if(route){parts.push(route.key);if(route.id!==undefined&&route.id!=='')parts.push(String(route.id));}const query=new URLSearchParams({role:context.role});if(route?.product)query.set('product',route.product);return '#/'+parts.map(encodeURIComponent).join('/')+'?'+query;}
function write(method,route){if(restoring||!hooks)return;const context=hooks.context(),hash=url(context,route);const previous=location.hash;const same=hash===previous;const old=history.state?.zerosol;const parent=same?old?.parent:previous;
 const data={zerosol:{context,route:route||null,parent:method==='push'&&!same?previous:old?.parent||null}};
 if(method==='push'&&!same){history.replaceState({zerosol:{context,route:active?.route||null,parent:old?.parent||null}},'',location.href);history.pushState(data,'',hash);}else history.replaceState(data,'',hash);
 lastRestored=location.href;
}
function infer(body){const doc=new DOMParser().parseFromString(body,'text/html'),hint=doc.querySelector('[data-route-key]');if(hint)return {key:hint.dataset.routeKey,id:hint.dataset.routeId};const form=doc.querySelector('form');if(!form)throw Error('画面の移動先が見つかりません');const entries={
 'new-form':()=>({key:'project-new'}),
 'survey-form':()=>({key:'project-survey',id:form.dataset.id}),
 'quote-form':()=>({key:'project-estimate',id:form.dataset.id}),
 'consult-form':()=>({key:'project-consult',id:form.dataset.id}),
 'sales-quote-form':()=>({key:'quote-new',id:form.querySelector('[name=project]')?.value||''}),
 'sales-stock-form':()=>({key:'stock-movement',id:form.dataset.sku}),
 'oem-request-form':()=>({key:'oem-request',id:form.dataset.type,product:form.querySelector('[name=product]')?.value}),
 'portal-order-form':()=>({key:'customer-order-new',id:form.querySelector('[name=sku]')?.value}),
 'portal-accept-form':()=>({key:'customer-order-accept',id:form.dataset.id}),
 'portal-stock-form':()=>({key:'customer-stock-movement',id:form.dataset.sku}),
 'portal-reject-form':()=>({key:'customer-order-reject',id:form.dataset.id}),
 'quote-mail-form':()=>({key:'quote-email',id:form.dataset.id})};const fn=entries[form.id];if(!fn)throw Error('この入力画面の移動先が見つかりません');return fn();}
export function showScreen(name,body,route=infer(body)){
 if(!screens.has(route.key)||!hooks.canOpen(route.key,hooks.context()))throw Error('このモードでは開けない画面です');
 const plainName=new DOMParser().parseFromString(name,'text/html').body.textContent;write('push',route);active={name:plainName,route};const host=document.querySelector('#page-screen');host.innerHTML=`<div class="page-navigation"><button type="button" class="secondary" data-screen-back>← 前の画面へ戻る</button><span>${esc(hooks.workspace())} / ${esc(hooks.viewLabel())}</span></div><div class="page-heading"><p class="eyebrow">${esc(hooks.workspace())}</p><h1 id="page-title" tabindex="-1">${esc(plainName)}</h1></div><article class="page-body modal-body">${body}</article>`;syncScreen();window.scrollTo(0,0);document.querySelector('#page-title').focus({preventScroll:true});
}
export function isScreen(key,id){return active?.route.key===key&&String(active.route.id||'')===String(id||'');}
export function closeScreen({history:update=true}={}){active=null;const host=document.querySelector('#page-screen');if(host){host.hidden=true;host.replaceChildren();}document.querySelector('#content').hidden=false;document.body.classList.remove('has-page-screen');if(update)write('replace');}
export function backScreen(){if(history.state?.zerosol?.parent&&history.length>1)history.back();else{closeScreen();hooks.render();window.scrollTo(0,0);}}
export function navigateBase(){closeScreen({history:false});write('push');hooks.render();window.scrollTo(0,0);}
export function syncScreen(){if(!hooks)return;const host=document.querySelector('#page-screen');host.hidden=!active;document.querySelector('#content').hidden=!!active;document.body.classList.toggle('has-page-screen',!!active);if(active){document.querySelector('#crumb').textContent=active.name;document.title=active.name+' | ZeroSol';}else write('replace');}
async function restore(){if(lastRestored===location.href)return;lastRestored=location.href;const parts=location.hash.replace(/^#\/?/,'').split('?')[0].split('/').filter(Boolean).map(v=>{try{return decodeURIComponent(v)}catch{return ''}});const params=new URLSearchParams(location.hash.split('?')[1]||'');const saved=history.state?.zerosol;const parsed={mode:parts[0]||null,view:parts[1]||'dashboard',role:params.get('role')};const context=hooks.normalize({...saved?.context,...parsed});const route=parts[2]?{key:parts[2],id:parts[3],product:params.get('product')||undefined}:null;restoring=true;
 try{closeScreen({history:false});hooks.apply(context);hooks.render();if(route){const handler=screens.get(route.key);if(handler&&hooks.canOpen(route.key,context))await handler(route.id,route);if(!active){hooks.toast('対象のデータが見つからないため、一覧を表示しました。');}}}
 finally{restoring=false;if(!active)write('replace');}
}
export async function startNavigation(){if(location.hash&&location.hash!=='#/'&&location.hash!=='#'){await restore();}else{if(location.hash==='#/')hooks.apply(hooks.normalize({mode:null}));hooks.render();write('replace');}}
