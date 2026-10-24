export const stages=['ヒアリング','現場調査','概算見積','技術確認','受注・施工'];
export function estimate(area,product,scaffold){const a=Number(area);if(!Number.isFinite(a)||a<=0)throw new Error('面積は0より大きい数値を入力してください');const rate=product==='窓コーティング'?6500:product==='HVLS'?12000:4800;return {materials:Math.round(a*rate),labor:Math.round(a*2200),scaffold:scaffold?180000:0,total:Math.round((a*(rate+2200)+(scaffold?180000:0))*1.1)};}
export function visibleProjects(projects,role){return role==='manufacturer'?projects:projects.filter(p=>p.dealer==='東海エコソリューション');}
export function customerLabel(project,role){return role==='manufacturer'&&!project.shared?'顧客情報は非公開':project.customer;}
