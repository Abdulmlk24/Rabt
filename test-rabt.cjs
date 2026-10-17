const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('rabt.html','utf8'),script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const core={module:{exports:{}}};vm.runInNewContext(script,core);
const {calculate:c,faceAt,distance,parse}=core.module.exports;
const starts=JSON.parse(html.match(/const PAGE_VERSES=(.*?);\r?\n/)[1]);
const boundaries=JSON.parse(fs.readFileSync('page-boundaries.json','utf8')).pages;
assert.equal(Object.keys(starts).length,604);
for(let page=1;page<=604;page++){
 assert.equal(starts[page].verseKey,boundaries[page].first_verse_key);
 assert.ok(starts[page].text.length>0);
 assert.equal(starts[page].ayah,Number(starts[page].verseKey.split(':')[1]));
}
assert.equal(starts[534].verseKey,'55:70');
assert.equal(starts[1].verseKey,'1:1');assert.equal(starts[604].verseKey,'112:1');
for(const [t,f,to,n,d] of [[518,null,null,0,null],[519,518,518,1,null],[538,518,537,20,null],[539,519,538,20,518],[540,520,539,20,519]])assert.deepEqual(JSON.parse(JSON.stringify(c(518,t))),{from:f,to,count:n,dropped:d,wrapped:false});
assert.equal(faceAt(604,1),2);assert.equal(faceAt(595,20),12);assert.equal(c(595,12).from,595);assert.equal(c(595,12).to,11);assert.equal(c(595,12).count,20);
for(const start of [1,2,518,595,604]){let sequence=[];for(let i=0;i<1300;i++){const today=faceAt(start,i),r=c(start,today,i),expected=sequence.slice(-20);assert.equal(r.count,expected.length);assert.equal(r.from,expected[0]??null);assert.equal(r.to,expected.at(-1)??null);assert.equal(r.dropped,i>20?sequence[i-21]:null);sequence.push(today);}}
for(const pair of [[0,2],[2,605],[2,1],[1,1.5],[NaN,2]])assert.throws(()=>c(...pair));
assert.equal(parse('٥٩٥'),595);assert.ok(Number.isNaN(parse('')));assert.ok(Number.isNaN(parse('1e2')));
let storage=new Map();
function boot(){const els={};for(const [,id]of html.matchAll(/id="([^"]+)"/g)){els[id]={value:'',textContent:'',innerHTML:'',disabled:false,classList:{toggle(){},add(){},remove(){}},addEventListener(event,fn){this[event]=fn;}};}
 const context=vm.createContext({document:{getElementById:id=>{assert.ok(els[id],id);return els[id]},querySelectorAll:()=>[]},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},setTimeout:()=>0,clearTimeout(){},Intl,Date});vm.runInContext(script,context);return els;}
let e=boot();e.start.value='595';e.today.value='604';e.form.submit({preventDefault(){}});e.next.click();assert.equal(e.currentFace.textContent,2);assert.equal(e.from.textContent,595);assert.equal(e.to.textContent,604);assert.ok(e.historyRows.innerHTML.includes('595'));
e=boot();assert.equal(e.currentFace.textContent,2);e.undo.click();assert.equal(e.currentFace.textContent,604);assert.equal(e.historyRows.innerHTML,'');
e.start.value='595';e.today.value='12';e.form.submit({preventDefault(){}});assert.equal(e.countPill.textContent,'20 / 20 وجهًا');assert.equal(e.to.textContent,11);assert.ok(e.verseText.textContent.length>0);
e.next.click();e.clearHistory.click();assert.equal(e.historyRows.innerHTML,'');e.undo.click();assert.ok(e.historyRows.innerHTML.includes('595'));
const before=e.from.textContent;e.form.submit({preventDefault(){}});assert.equal(e.from.textContent,before);
console.log('Passed: examples, 6500 progression states, wrap, validation, Arabic input, history, undo, reload and embedded verses.');
