(function(root){
'use strict';
const ids=[1,7,8,9,10,11,34,35,36,37,38,39,40,41,42,43,44,46,47,48,50,51,52,53,57];
const names=['Функциональные возможности','Пригодность','Правильность','Способность к взаимодействию','Защищённость','Согласованность системы','Невыполнение функций спецификации','Несоответствие программной документации','Недостатки документации','Отсутствие файлов поставки','Отсутствие запланированной функции','Отсутствие элементов интерфейса','Противоречия функций и ТЗ','Противоречия функций и нормативов','Противоречия алгоритмов','Ошибки вычислений','Противоречия при инсталляции','Ошибки сетевого обмена','Ошибки использования внешних данных','Несовместимость форматов','Недостатки учёта информации','Недостатки защиты от искажений','Несоответствие средств криптографии','Недостатки антивирусной защиты','Ошибки надёжности'];
// Six entries and their numbering follow the factor list in the source document.
const factorIds=[1,2,3,4,6,7];
const factorNames=['Опыт разработчиков','Опыт эксплуатационного персонала','Трудоёмкость разработки','Курс рубля к доллару (нормированный)','Репутация разработчиков','Репутация эксплуатирующей организации'];
const defaultFactor=()=>({type:'constant',base:.5,amplitude:0,period:10,phase:0});
// [target, positive [function,argument], negative [function,argument]]
const equations=[
[1,[[1,7],[2,8],[3,9]],[[4,34],[5,35]]],
[7,[[6,8],[7,10]],[[8,36],[9,37]]],
[8,[[10,1],[11,7]],[[12,38],[13,39]]],
[9,[[14,10],[15,11]],[[16,40],[17,41]]],
[10,[[18,9],[19,11]],[[20,42],[21,43]]],
[11,[[22,10],[23,7]],[[24,44],[25,46]]],
[34,[[26,35],[27,36]],[[28,47],[29,48]]],
[35,[[30,34],[31,37]],[[32,50],[33,51]]],
[36,[[34,34],[35,35]],[[36,52],[37,53]]],
[37,[[38,36],[39,38]],[[40,54],[41,57]]],
[38,[[42,37],[43,39]],[[44,7],[45,8]]],
[39,[[46,38],[47,40]],[[48,9],[49,10]]],
[40,[[50,39],[51,41]],[[52,11],[53,34]]],
[41,[[54,40],[55,42]],[[56,35],[57,36]]],
[42,[[58,41],[59,43]],[[60,37],[61,38]]],
[43,[[62,42],[63,44]],[[64,39],[65,40]]],
[44,[[66,43],[67,46]],[[68,41],[69,42]]],
[46,[[70,44],[71,47]],[[72,43],[73,44]]],
[47,[[74,46],[75,48]],[[76,34],[77,35]]],
[48,[[78,47],[79,50]],[[80,36],[81,37]]],
[50,[[82,48],[83,51]],[[84,38],[85,39]]],
[51,[[86,50],[87,52]],[[88,40],[89,41]]],
[52,[[90,51],[91,53]],[[92,42],[93,43]]],
[53,[[94,52],[95,57]],[[96,44],[97,46]]],
[57,[[98,53],[99,7]],[[100,47],[101,48]]]
];
const presets=[
{name:'Базовый план',description:'Умеренные ресурсы и нагрузка',f:[.55,.30,.35],quality:.4,defect:.65,target:.65,limit:.4,scale:1,kind:'linear'},
{name:'Усиление команды',description:'Выше опыт разработчиков и персонала',f:[.85,.65,.25],quality:.4,defect:.65,target:.65,limit:.4,scale:1,kind:'linear'},
{name:'Высокая трудоёмкость',description:'Рост нагрузки при прежних ресурсах',f:[.55,.30,.85],quality:.4,defect:.65,target:.65,limit:.4,scale:1,kind:'linear'},
{name:'Периодические факторы',description:'Переменная нагрузка, квадратичные связи',f:[.70,.50,.40],quality:.4,defect:.65,target:.65,limit:.4,scale:1,kind:'quadratic'},
{name:'Подготовленная система',description:'Лучшие стартовые показатели, кубические связи',f:[.75,.55,.30],quality:.7,defect:.3,target:.65,limit:.4,scale:1,kind:'cubic'}
];
function clone(x){return JSON.parse(JSON.stringify(x));}
function makeConfig(preset=0){
 const p=presets[preset];
 const c={version:1,preset,title:p.name,T:3,h:.02,external54:.5,initial:ids.map((_,i)=>i<6?p.quality:p.defect),stars:ids.map((_,i)=>i<6?3:1),targets:ids.map((_,i)=>i<6?.55:p.limit),factors:p.f.map(v=>({type:'constant',base:v,amplitude:0,period:10,phase:0})),functions:Array.from({length:101},()=>({a:0,b:0,c:0,d:0}))};
 // Demonstration coefficients, not measurements: every f has its own editable record.
 equations.forEach((e,i)=>{
  e[1].forEach(([n])=>{c.functions[n-1]={a:0,b:0,c:i<6?.12:.025,d:i<6?(i===0?.45:.29):.045};});
  e[2].forEach(([n])=>{c.functions[n-1]={a:0,b:0,c:i<6?.06:.1,d:i<6?.10:.35};});
 });
 if(p.kind==='quadratic')c.functions.forEach(f=>{f.b=.03;});
 if(p.kind==='cubic')c.functions.forEach(f=>{f.b=.015;f.a=.02;});
 if(preset===3){c.factors[0]={type:'sin',base:.7,amplitude:.12,period:10,phase:0};c.factors[2]={type:'sin',base:.4,amplitude:.18,period:5,phase:Math.PI/2};}
 c.factors.push(defaultFactor(),defaultFactor(),defaultFactor());
 return c;
}
function upgradeConfig(project){const c=clone(project);validate(c);if(c.factors.length===3)c.factors.push(defaultFactor(),defaultFactor(),defaultFactor());return c;}
function factor(f,t){return f.type==='sin'?f.base+f.amplitude*Math.sin(2*Math.PI*t/f.period+f.phase):f.type==='linear'?f.base+f.amplitude*t:f.base;}
function poly(p,x){return ((p.a*x+p.b)*x+p.c)*x+p.d;}
function validate(c){
 const finite=(x)=>typeof x==='number'&&Number.isFinite(x);
 if(!c||c.version!==1)throw Error('Неподдерживаемый формат проекта.');
 if(!finite(c.T)||c.T<=0||c.T>10000||!finite(c.h)||c.h<=0||c.h>c.T||Math.ceil(c.T/c.h)>30000)throw Error('Интервал должен быть положительным; число шагов — не более 30 000.');
 for(const key of ['initial','stars','targets'])if(!Array.isArray(c[key])||c[key].length!==25||!c[key].every(finite))throw Error('Проверьте 25 значений '+key+'.');
 if(c.stars.some(v=>v<=0))throw Error('Все нормирующие значения u* должны быть больше нуля.');
 if(c.initial.some(v=>v<0||v>1)||c.targets.some(v=>v<0||v>1)||!finite(c.external54)||c.external54<0||c.external54>1)throw Error('Начальные значения, пороги и u54 должны принадлежать [0; 1].');
 if(!Array.isArray(c.functions)||c.functions.length!==101||c.functions.some(f=>!f||!['a','b','c','d'].every(k=>finite(f[k]))))throw Error('Нужны коэффициенты всех 101 функций.');
 if(!Array.isArray(c.factors)||![3,6].includes(c.factors.length))throw Error('Нужны шесть факторов (или три в проекте прежней версии).');
 c.factors.forEach(f=>{
  if(!f||!['constant','sin','linear'].includes(f.type)||!['base','amplitude','period','phase'].every(k=>finite(f[k]))||f.period<=0)throw Error('Некорректные параметры фактора.');
  const lo=f.type==='sin'?f.base-Math.abs(f.amplitude):Math.min(f.base,factor(f,c.T));
  const hi=f.type==='sin'?f.base+Math.abs(f.amplitude):Math.max(f.base,factor(f,c.T));
  if(lo<0||hi>1)throw Error('Возмущения должны оставаться в [0; 1] на всём интервале.');
 });
 return c;
}
function rhs(t,y,c){
 const F=c.factors.map(f=>factor(f,t));const val={54:c.external54};ids.forEach((id,i)=>val[id]=y[i]);
 const product=(arr)=>arr.reduce((z,[n,id])=>z*poly(c.functions[n-1],val[id]),1);
 return equations.map((e,i)=>(product(e[1])*(F[0]+F[1])-product(e[2])*F[2])/c.stars[i]);
}
function integrate(c,h=c.h){
 validate(c);if(!Number.isFinite(h)||h<=0)throw Error('Некорректный шаг.');
 let y=c.initial.slice(),t=0;const times=[0],values=[y.slice()];let domainExit=null;
 const add=(a,b,k)=>a.map((v,i)=>v+k*b[i]);
 const steps=Math.ceil(c.T/h-1e-12);
 for(let n=0;n<steps;n++){
  const dt=Math.min(h,c.T-t);if(dt<=1e-14)break;
  const k1=rhs(t,y,c),k2=rhs(t+dt/2,add(y,k1,dt/2),c),k3=rhs(t+dt/2,add(y,k2,dt/2),c),k4=rhs(t+dt,add(y,k3,dt),c);
  y=y.map((v,i)=>v+dt*(k1[i]+2*k2[i]+2*k3[i]+k4[i])/6);t=n===steps-1?c.T:t+dt;
  if(y.some(v=>!Number.isFinite(v)||Math.abs(v)>1e6))throw Error('Решение расходится. Уменьшите интервал, шаг или коэффициенты.');
  if(domainExit===null&&y.some(v=>v < -1e-9 || v > 1+1e-9))domainExit=t;
  times.push(t);values.push(y.slice());
 }
 const meets=(row)=>row.every((v,i)=>i<6?v>=c.targets[i]-1e-10:v<=c.targets[i]+1e-10);
 const final=values.at(-1),count=final.filter((v,i)=>i<6?v>=c.targets[i]-1e-10:v<=c.targets[i]+1e-10).length;
 const hit=values.findIndex(meets);
 return {times,values,final,count,met:meets(final),feasible:meets(final)&&domainExit===null,firstHit:hit<0?null:times[hit],domainExit};
}
function simulate(c){
 const result=integrate(c);const fine=integrate(c,c.h/2);
 const maxDifference=Math.max(...result.final.map((v,i)=>Math.abs(v-fine.final[i])));
 return {...result,maxDifference,rungeEstimate:maxDifference/15,config:clone(c)};
}
function sample(r,t){let k=r.times.findIndex(x=>x>=t-1e-10);if(k<0)k=r.times.length-1;if(k===0||Math.abs(r.times[k]-t)<1e-10)return r.values[k].slice();const a=(t-r.times[k-1])/(r.times[k]-r.times[k-1]);return r.values[k].map((v,i)=>r.values[k-1][i]+a*(v-r.values[k-1][i]));}
function csv(r){return '\uFEFF'+['t;'+ids.map(id=>'u'+id).join(';'),...r.times.map((t,i)=>[t,...r.values[i]].map(v=>v.toFixed(8)).join(';'))].join('\r\n');}
const api={ids,names,factorIds,factorNames,equations,presets,makeConfig,upgradeConfig,validate,factor,poly,rhs,integrate,simulate,sample,csv,clone};
if(typeof module!=='undefined')module.exports=api;root.ISO=api;
})(typeof globalThis!=='undefined'?globalThis:this);
