const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const sharp=require('sharp');
(async()=>{
const root=path.resolve(__dirname,'..'),repo=path.resolve(process.env.PROJECT_X||path.join(root,'../project_x'));
const expected='1391bd6670090aa2559d017a86af6d3e8c9bb300';
if(cp.execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim()!==expected)throw Error('Use pinned project_x '+expected);
for(const layout of ['square','wide']){
 const w=300,h=layout==='square'?300:150,wide=layout==='wide';
 const cx=wide?244:150,cy=wide?75:150,rx=wide?76:127,ry=wide?64:127;
 const paths=[];
 for(let i=0;i<18;i++){
  const r=rx-i*2.9,rr=ry-i*2.9;
  paths.push(`<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${rr}" fill="none" stroke="url(#copper)" stroke-width="${i===0?.85:.48}" opacity="${.68-i*.026}"/>`);
 }
 const svg=`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="copper" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#3c4946"/><stop offset=".32" stop-color="#6c6654"/><stop offset=".66" stop-color="#d2a579"/><stop offset="1" stop-color="#edc8a0"/></linearGradient><linearGradient id="quiet" x1="0" y1="0" x2="${wide?1:0}" y2="${wide?0:1}">${wide?'<stop stop-color="#101719"/><stop offset=".4" stop-color="#101719" stop-opacity=".93"/><stop offset=".86" stop-color="#101719" stop-opacity="0"/>':'<stop offset=".16" stop-color="#101719" stop-opacity="0"/><stop offset=".36" stop-color="#101719"/><stop offset=".64" stop-color="#101719"/><stop offset=".84" stop-color="#101719" stop-opacity="0"/>'}</linearGradient></defs><rect width="${w}" height="${h}" fill="#101719"/>${paths.join('')}<rect width="${w}" height="${h}" fill="url(#quiet)"/></svg>`;
 const source='<style>html,body{margin:0}svg{display:block}</style>'+svg;
 const sourcePath=path.join(root,'meridian/sources',layout+'.html'),configPath=sourcePath.replace('.html','.json'),out=path.join(root,'meridian/dist',layout+'.card.fridge');
 fs.writeFileSync(sourcePath,source);
 fs.writeFileSync(configPath,JSON.stringify({width:w,height:h,capability:{k:'clock',readingBlend:'bare',readingStyle:'surface',readingOpacity:0},capBox:wide?{x:.035,y:.18,w:.71,h:.65,rot:0,opacity:1}:{x:.055,y:.28,w:.89,h:.44,rot:0,opacity:1}},null,2));
 // Identical static SVG in preserved HTML and cache; no DOM/CSS emulation.
 const png=out.replace('.fridge','.appearance.png');
 fs.writeFileSync(sourcePath.replace('.html','.svg'),svg.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '));
 await sharp(Buffer.from(svg.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ')),{density:144}).png().toFile(png);
 cp.execFileSync(process.execPath,[path.join(repo,'scripts/fridge-html-card.cjs'),'pack',sourcePath,configPath,png,out],{stdio:'inherit'});
 const pkg=JSON.parse(fs.readFileSync(out)),c=pkg.state.cards[0];
 for(const field of ['depthOwnerId','depthPass','reliefSrc','renderContourKey'])delete c[field];
 for(const el of c.elements)delete el.depthCrop;
 c.id='meridian-'+layout;c.paper='#101719';c.ink='#F1E5D3';c.material='dark';c.x=0;c.y=0;c.rot=0;
 c.elements.push({id:'meridian-signature',kind:'text',x:wide?.08:.25,y:wide?.15:.265,w:wide?.5:.5,h:.08,rot:0,opacity:1,text:'M E R I D I A N',fs:10,color:'#A89B88',bold:false,align:wide?'left':'center',behindCapability:false});
 fs.writeFileSync(out,JSON.stringify(pkg));
 for(const dimension of (wide?['2*4']:['4*4','2*2'])){
  const name=dimension.replace('*','x'),manifest=path.join(root,'meridian/sources',name+'.json');
  fs.writeFileSync(manifest,JSON.stringify({canvasDimension:dimension,background:{mode:'solid',color:'#101719',frameStyle:'none'},cards:[{file:'../dist/'+layout+'.card.fridge',x:12,y:(wide?6:12)/344*470,w:320,h:wide?160:320,rot:0,z:1}]},null,2));
  cp.execFileSync(process.execPath,[path.join(repo,'scripts/fridge-compose.cjs'),manifest,path.join(root,'meridian/dist',name+'.fridge')],{stdio:'inherit'});
 }
}

})().catch(e=>{console.error(e);process.exitCode=1;});
