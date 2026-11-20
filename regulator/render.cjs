const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const repo=path.resolve(process.env.PROJECT_X||path.join(__dirname,'../../project_x-regulator'));
// Fontconfig gives librsvg the same licensed digits used by the native renderer.
const cache=path.join(__dirname,'.fontcache');fs.mkdirSync(cache,{recursive:true});
const conf=path.join(cache,'fonts.conf');fs.writeFileSync(conf,`<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><dir>/usr/share/fonts</dir><dir>${repo}/entry/src/main/resources/rawfile</dir><cachedir>${cache}</cachedir><alias><family>sans-serif</family><prefer><family>DejaVu Sans</family></prefer></alias><alias><family>TemplateDigits</family><prefer><family>Barlow Condensed</family></prefer></alias></fontconfig>`);process.env.FONTCONFIG_FILE=conf;
const sharp=require('sharp'),{createCanvas,GlobalFonts}=require('@napi-rs/canvas');
GlobalFonts.registerFromPath(path.join(repo,'entry/src/main/resources/rawfile/template-digits.ttf'),'TemplateDigits');
const ctx=vm.createContext({console,document:{createElement:()=>createCanvas(1,1)}});ctx.window=ctx;
for(const f of ['shared-models.js','shared-materials.js','capabilities.js','renderer.js'])vm.runInContext(fs.readFileSync(path.join(repo,'previewer',f),'utf8'),ctx);
process.env.TZ='UTC';const load=n=>ctx.FridgeCore.load(n),schema=load('CardSchema'),factory=load('TemplateFactory'),reader=load('TemplatePackage');
// librsvg does not implement Chromium's text-before-edge baseline consistently.
// Convert only the output baseline for PNG rasterization; scene geometry is unchanged.
function rasterSvg(svg){
 const measure=createCanvas(1,1).getContext('2d');
 return svg.replace(/<text dominant-baseline="text-before-edge"([^>]*)>([\s\S]*?)<\/text>/g,(whole,attrs,body)=>{
  const size=Number(attrs.match(/font-size="([^"]+)"/)[1]),family=attrs.match(/font-family="([^"]+)"/)[1];
  const weight=attrs.match(/font-weight="([^"]+)"/)[1];measure.font=weight+' '+size+'px '+family;
  const ascent=measure.measureText('H0').fontBoundingBoxAscent;
  return '<text dominant-baseline="alphabetic"'+attrs+'>'+body.replace(/y="([0-9.]+)"/g,(_,y)=>'y="'+(Number(y)+ascent)+'"')+'</text>';
 });
}
(async()=>{
 const receipts=[];
 for(const dimension of ['4*4','2*2','2*4'])for(const palette of ['', 'cobalt','ink','cream']){
  const aspect=dimension==='2*4'?2:1,key=dimension.replace('*','x')+'-'+(palette||'porcelain');
  const card=factory.makeTemplateCards('regulator',aspect,()=> 'regulator-face')[0];card.template.palette=palette;card.template.fill=true;card.w=344;card.h=344/aspect;card.x=0;card.y=0;
  const state=schema.defaultState();state.cards=[card];state.canvasAspect=aspect;state.canvasDimension=dimension;state.background.mode='solid';state.background.color=load('TemplateScene').templateColors(card)[0];
  const pkg=reader.packageScene(JSON.stringify(state),'');const json=JSON.stringify(pkg);reader.readPackage(json);
  fs.writeFileSync(path.join(__dirname,'dist',key+'.fridge'),json);
  for(const width of dimension==='2*2'?[180]:[300,420]){
   const result=ctx.FridgeWeb.renderPackage(pkg,width,Date.parse('2026-11-20T10:08:00Z'));assert.equal(result.issues.length,0);
   await sharp(Buffer.from(rasterSvg(result.svg))).png().toFile(path.join(__dirname,'previews',key+'-'+width+'.png'));
  }
  receipts.push({file:key+'.fridge',sha256:crypto.createHash('sha256').update(json).digest('hex'),dimension,palette:palette||'porcelain'});
 }
 fs.writeFileSync(path.join(__dirname,'qa/packages.json'),JSON.stringify({modelFingerprint:ctx.FridgeCore.sourceFingerprint,method:'unmodified shared production SVG adapter, native licensed digits font, Sharp/librsvg',nativeVerified:false,formVerified:false,browserVerified:false,packages:receipts},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
