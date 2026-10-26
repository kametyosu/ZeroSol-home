import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSurveyRequest,issueSurvey,visibleSurveys} from '../public/survey-model.js';
const input={customer:'中部精密工業',customerType:'factory',site:'名古屋工場',notes:'屋根遮熱の調査'};
test('取引先の調査依頼を本部が発行し、依頼元だけが自社分を確認できる',()=>{
 const dealer=createSurveyRequest([],'dealer',input),both=createSurveyRequest(dealer,'oem',{...input,customerType:'dealer'});
 const issued=issueSurvey(both,dealer[0].id,{reply:'対象商材を確認し調査してください'});
 assert.equal(both.find(r=>r.company==='dealer').status,'requested');
 assert.equal(visibleSurveys(issued,'dealer').length,1);assert.equal(visibleSurveys(issued,'oem').length,1);assert.equal(visibleSurveys(issued,'manufacturer').length,2);
 assert.equal(visibleSurveys(issued,'dealer')[0].status,'issued');assert.match(visibleSurveys(issued,'dealer')[0].issueNumber,/^SURV-/);
 assert.throws(()=>issueSurvey(issued,dealer[0].id,{reply:'再発行'}),/未発行/);
});
test('調査依頼に必要な情報と発行時の案内を検証する',()=>{
 assert.throws(()=>createSurveyRequest([],'manufacturer',input),/取引先/);
 for(const patch of [{customer:''},{site:' '},{customerType:'invalid'}])assert.throws(()=>createSurveyRequest([],'dealer',{...input,...patch}),/入力/);
 const rows=createSurveyRequest([],'dealer',input);assert.throws(()=>issueSurvey(rows,rows[0].id,{reply:' '}),/案内/);
 assert.equal(rows[0].status,'requested');
});
