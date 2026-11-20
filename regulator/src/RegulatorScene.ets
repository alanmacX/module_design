import { FridgeCard } from './CardSchema';
import { TemplateScene, TemplateMark } from './TemplateSceneTypes';

/** One continuous regulator face. Clock/date derive only from the host tick. */
export function regulatorScene(card: FridgeCard, tick: number): TemplateScene {
  const s=new TemplateScene();
  const wide=card.w/card.h>=1.5;
  s.height=wide?150:300;
  const palette=card.template?.palette??'';
  const colors=palette==='cobalt'?['#182B50','#F3EEE1','#F06C45','#21395E','#91A1BB']:palette==='ink'?['#191D20','#E8E7DE','#D4E58B','#242B2E','#A0AAA8']:palette==='cream'?['#E8DDC8','#34302B','#A83F2B','#E3D6BD','#776F62']:['#F0EEE6','#262D32','#CC4F32','#E8E7DF','#747C7D'];
  s.background=colors[0];s.ink=colors[1];s.accent=colors[2];
  const now=new Date(tick),hh=('0'+now.getHours()).slice(-2),mm=now.getMinutes(),day=('0'+now.getDate()).slice(-2);
  const weekday=['SUN','MON','TUE','WED','THU','FRI','SAT'][now.getDay()];
  const add=(kind:string,x:number,y:number,w:number,h:number,color:string):TemplateMark=>{const m=new TemplateMark();m.kind=kind;m.x=x;m.y=y;m.w=w;m.h=h;m.color=color;s.marks.push(m);return m;};
  const text=(v:string,x:number,y:number,w:number,h:number,size:number,color:string=s.ink,font:string='sans-serif',align:string='left'):void=>{const m=add('text',x,y,w,h,color);m.text=v;m.size=size;m.font=font;m.align=align;m.weight=500;};
  const circle=(x:number,y:number,r:number,color:string):TemplateMark=>add('circle',x-r,y-r,r*2,r*2,color);
  const line=(x:number,y:number,x2:number,y2:number,stroke:number,color:string):void=>{const m=add('line',x,y,x2,y2,color);m.stroke=stroke;};
  const cx=wide?218:150,cy=wide?75:183,r=wide?65:105;
  // A subtly recessed ceramic dial; the hand and every index carry real minutes.
  circle(cx,cy+.6,r,colors[4]).opacity=.18;
  circle(cx,cy,r-.7,colors[3]);
  circle(cx,cy,r-13,colors[0]);
  for(let i=0;i<60;i++){
    const a=i*Math.PI/30,major=i%5===0,outer=r-5,inner=r-(major?14:9);
    line(cx+Math.sin(a)*inner,cy-Math.cos(a)*inner,cx+Math.sin(a)*outer,cy-Math.cos(a)*outer,major?1.7:.65,major?s.ink:colors[4]);
  }
  for(let i=0;i<4;i++){
    const a=i*Math.PI/2,rr=r-(wide?24:30),x=cx+Math.sin(a)*rr,y=cy-Math.cos(a)*rr;
    text(['00','15','30','45'][i],x-(wide?9:13),y-(wide?7:9),wide?18:26,wide?17:21,wide?13:17,s.ink,'sans-serif','center');
  }
  // Offset hour and civil-date readings leave the minute sweep completely clear.
  if(wide){
    text('H O U R',22,16,110,12,8.5,colors[4]);
    text(hh,20,28,114,71,66,s.ink,'digits');
    text(weekday+'  /  '+day,23,118,110,17,12,s.ink);
  }else{
    text('H O U R',25,20,105,12,8.5,colors[4]);
    text(hh,22,34,84,51,50,s.ink,'digits');
    text(weekday,217,25,57,15,10,colors[4],'sans-serif','right');
    text(day,217,41,57,34,28,s.ink,'digits','right');
  }
  // Precision hand: colored tip, darker counterweight and a tiny ceramic hub.
  const a=mm*Math.PI/30,dx=Math.sin(a),dy=-Math.cos(a),tip=r-5,innerTip=r*(wide?.42:.46);
  line(cx-dx*12,cy-dy*12,cx+dx*innerTip,cy+dy*innerTip,wide?2.7:3.2,s.accent);
  line(cx+dx*(tip-6),cy+dy*(tip-6),cx+dx*tip,cy+dy*tip,wide?2.7:3.2,s.accent);
  circle(cx,cy,wide?4.5:5.5,s.accent);
  circle(cx,cy,wide?1.4:1.8,colors[0]);
  return s;
}
