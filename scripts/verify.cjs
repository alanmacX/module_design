const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),cp=require('node:child_process'),assert=require('node:assert/strict'),sharp=require('sharp'),{createCanvas}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),repo=path.resolve(process.env.PROJECT_X||path.join(root,'../project_x'));
process.env.TZ='UTC';
const ctx=vm.createContext({console,document:{createElement:()=>createCanvas(1,1)}});ctx.window=ctx;
for(const f of ['shared-models.js','shared-materials.js','capabilities.js','renderer.js'])vm.runInContext(fs.readFileSync(path.join(repo,'previewer',f),'utf8'),ctx);
(async()=>{
const records=[];
for(const file of ['square.card.fridge','wide.card.fridge'])cp.execFileSync(process.execPath,[path.join(repo,'scripts/fridge-package-check.cjs'),path.join(root,'meridian/dist',file)],{stdio:'inherit'});
for(const name of ['4x4','2x2','2x4']){
 const file=path.join(root,'meridian/dist',name+'.fridge'),json=fs.readFileSync(file,'utf8');
 cp.execFileSync(process.execPath,[path.join(repo,'scripts/fridge-package-check.cjs'),file],{stdio:'inherit'});
 const pkg=ctx.FridgeCore.load('TemplatePackage').readPackage(json);
 assert.equal(pkg.state.cards.length,1);assert.equal(pkg.state.cards[0].capability.k,'clock');
 assert.ok(!/\d\d:\d\d/.test(pkg.state.cards[0].html.source));
 for(const width of name==='2x2'?[180]:[300,420]){
  const tick=Date.parse('2026-11-20T10:08:00Z'),res=ctx.FridgeWeb.renderPackage(pkg,width,tick);
  assert.deepEqual(Array.from(res.issues),[]);
  const metrics=ctx.FridgeReadouts.inspectCard(pkg.state.cards[0]);assert.equal(metrics.fits,true);
  const base=path.join(root,'meridian/previews',name+'-'+width);
  await sharp(Buffer.from(res.svg)).png().toFile(base+'.png');
  const before=json;
  for(const time of ['00:00','11:11','23:59']){
   const alternate=ctx.FridgeWeb.renderPackage(pkg,width,Date.parse('2026-11-20T'+time+':00Z'));
   assert.ok(alternate.svg.includes('>'+time+'</text>'));assert.notEqual(alternate.svg,res.svg);assert.deepEqual(Array.from(alternate.issues),[]);
  }
  assert.equal(fs.readFileSync(file,'utf8'),before);
  records.push({file:name+'.fridge',width,height:res.height,tick:'2026-11-20T10:08:00Z',issues:[],metrics,checksum:crypto.createHash('sha256').update(json).digest('hex')});
 }
}
fs.writeFileSync(path.join(root,'meridian/qa.json'),JSON.stringify({compilerCommit:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),contract:JSON.parse(fs.readFileSync(path.join(repo,'skills/fridge-create/references/design-contract.json'))),renderMethod:'Unmodified production previewer SVG adapter in Node VM; napi canvas text metrics; Sharp/librsvg rasterization',cacheMethod:'Exact SVG embedded in retained HTML rasterized by Sharp at 2x; packed with project_x fridge-html-card.cjs',visualReview:{reviewed:true,method:'Human inspection of shared-renderer PNGs',findings:'Clear primary time at 180px; no observed time clipping; wide orbital motif revised after inspection; signature decorative only'},browserVerified:false,nativeVerified:false,formVerified:false,templatesCheck:'Passed using scripts/linux-typescript.cjs to resolve upstream macOS-only require',records},null,2));
for(const file of fs.readdirSync(path.join(root,'meridian/dist')).filter(f=>f.endsWith('.fridge'))){
 const bytes=fs.readFileSync(path.join(root,'meridian/dist',file));
 fs.writeFileSync(path.join(root,'meridian/dist',file.replace('.fridge','.qa.json')),JSON.stringify({package:file,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),readerCheck:'pass',fullReceipt:'../qa.json',nativeVerified:false,formVerified:false},null,2));
}
})().catch(e=>{console.error(e);process.exitCode=1});
