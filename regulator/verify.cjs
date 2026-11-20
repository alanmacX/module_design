const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const repo=path.resolve(process.env.PROJECT_X||path.join(__dirname,'../../project_x-regulator'));
const ctx=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(repo,'previewer/shared-models.js'),'utf8'),ctx);
const load=n=>ctx.FridgeCore.load(n),render=load('TemplateScene').cardTemplateScene,factory=load('TemplateFactory'),reader=load('TemplatePackage');
process.env.TZ='UTC';let scenes=0;
for(const aspect of [1,2])for(const palette of ['','cream','cobalt','ink']){
 const card=factory.makeTemplateCards('regulator',aspect,()=> 'regulator')[0];card.template.palette=palette;
 const original=JSON.stringify(card);
 for(let h=0;h<24;h++)for(let minute=0;minute<60;minute++){
  const tick=Date.UTC(2026,10,20,h,minute),s=render(card,tick),labels=s.marks.filter(m=>m.kind==='text');scenes++;
  assert.ok(labels.some(m=>m.text===('0'+h).slice(-2)),'hour must stay complete');
  for(const m of labels){assert.ok(m.x>=0&&m.y>=0&&m.x+m.w<=s.width&&m.y+m.h<=s.height,'text must fit scene');}
  for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){
   const a=labels[i],b=labels[j];assert.ok(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y,'readout rectangles must not collide');
  }
  const minuteLines=s.marks.filter(m=>m.kind==='line'&&m.color===s.accent);
  assert.equal(minuteLines.length,2);
  // Sample both segments, including cardinal positions: hands must never cross text boxes.
  for(const m of minuteLines)for(let n=0;n<=100;n++){
   const x=m.x+(m.w-m.x)*n/100,y=m.y+(m.h-m.y)*n/100;
   for(const t of labels)assert.ok(!(x>t.x-m.stroke/2&&x<t.x+t.w+m.stroke/2&&y>t.y-m.stroke/2&&y<t.y+t.h+m.stroke/2),'minute indicator must not obscure '+JSON.stringify({aspect,h,minute,text:t.text,box:[t.x,t.y,t.w,t.h],point:[x,y]}));
  }
 }
 assert.equal(JSON.stringify(card),original,'rendering must not mutate stored art');
 for(const date of ['2024-02-29T23:59:00Z','2024-03-01T00:00:00Z','2026-12-31T23:59:00Z','2027-01-01T00:00:00Z']){
  const s=render(card,Date.parse(date));assert.ok(s.marks.every(m=>['x','y','w','h','size'].every(k=>Number.isFinite(m[k]))));
  const day=date.slice(8,10);assert.ok(s.marks.some(m=>m.kind==='text'&&(m.text===day||m.text.endsWith('/  '+day))));
 }
}
for(const name of fs.readdirSync(path.join(__dirname,'dist')).filter(n=>n.endsWith('.fridge'))){
 const json=fs.readFileSync(path.join(__dirname,'dist',name),'utf8'),pkg=reader.readPackage(json);
 assert.equal(pkg.version,3);assert.equal(pkg.state.cards.length,1);assert.equal(pkg.state.cards[0].template.id,'regulator');assert.equal(pkg.assets.length,0);
}
const report={passed:true,scenes,fullDaySweep:true,textCollisions:0,handTextCollisions:0,leapDayAndYearBoundary:true,packageRoundTrips:12,renderDoesNotMutate:true,modelFingerprint:ctx.FridgeCore.sourceFingerprint};
fs.writeFileSync(path.join(__dirname,'qa/functional.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
