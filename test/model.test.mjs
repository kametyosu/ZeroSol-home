import {test} from 'node:test';
import assert from 'node:assert/strict';
import {estimate,visibleProjects,customerLabel} from '../public/model.js';
test('概算は面積、材料単価、施工費、足場費、消費税を反映する',()=>{assert.deepEqual(estimate(100,'遮熱シート',true),{materials:480000,labor:220000,scaffold:180000,total:968000});assert.equal(estimate(10,'窓コーティング',false).total,95700)});
test('面積が無効な場合は見積を拒否する',()=>{for(const a of [0,-1,'abc',Infinity])assert.throws(()=>estimate(a,'遮熱シート',false))});
test('販売店一覧は自社案件のみ、メーカー一覧は全体',()=>{const ps=[{dealer:'東海エコソリューション'},{dealer:'他社'}];assert.equal(visibleProjects(ps,'dealer').length,1);assert.equal(visibleProjects(ps,'manufacturer').length,2)});
test('共有同意のない顧客名をメーカー表示で伏せる',()=>{const p={customer:'秘密の顧客',shared:false};assert.equal(customerLabel(p,'manufacturer'),'顧客情報は非公開');assert.equal(customerLabel(p,'dealer'),'秘密の顧客');assert.equal(customerLabel({...p,shared:true},'manufacturer'),'秘密の顧客')});
