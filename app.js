const $=s=>document.querySelector(s), LS="nownext.pwa.v1";
const names=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
let data=JSON.parse(localStorage.getItem(LS)||"null")||{tasks:[],occ:{},settings:{cutoff:"10:00",defaultMorning:[],overrides:{},notify:{enabled:false,time:"08:30",text:"Morning 👋 Open NowNext and see what's waiting."}},weeks:{}};
const save=()=>{localStorage.setItem(LS,JSON.stringify(data));render()};
const key=d=>{let x=new Date(d);return [x.getFullYear(),String(x.getMonth()+1).padStart(2,"0"),String(x.getDate()).padStart(2,"0")].join("-")};
const due=(t,d)=>t.enabled!==false&&(t.days.length===0||t.days.includes(d.getDay()));
const state=(t,d)=>data.occ[key(d)]?.[t.id]||null;
function setState(t,d,s){data.occ[key(d)]??={}; if(s)data.occ[key(d)][t.id]=s;else delete data.occ[key(d)][t.id];save()}
function morningIDs(d){let ov=data.settings.overrides[d.getDay()];return ov??data.settings.defaultMorning}
function morningTasks(d){let ids=morningIDs(d);let explicit=data.tasks.filter(t=>t.period==="morning"&&due(t,d)).map(t=>t.id);if(!ids.length)ids=explicit;return data.tasks.filter(t=>due(t,d)&&ids.includes(t.id))}
function morningActive(d){let [h,m]=data.settings.cutoff.split(":").map(Number), cutoff=new Date(d);cutoff.setHours(h,m,0,0);return d<cutoff&&morningTasks(d).some(t=>t.kind==="task"&&!state(t,d))}
function startOfWeek(d){let x=new Date(d);x.setHours(0,0,0,0);let diff=(x.getDay()+6)%7;x.setDate(x.getDate()-diff);return x}
function progress(now=new Date()){let s=startOfWeek(now),done=0,total=0;for(let d=new Date(s);d<=new Date(now.getFullYear(),now.getMonth(),now.getDate());d.setDate(d.getDate()+1))for(let t of data.tasks)if(t.kind==="task"&&due(t,d)){let st=state(t,d);if(st==="skip")continue;total++;if(st==="done")done++}return[done,total]}
function row(t,d,interactive=true){let div=document.createElement("div");div.className="row";let st=state(t,d);let b=document.createElement("button");b.className="check";b.textContent=t.kind==="info"?"ⓘ":st==="done"?"●":"○";if(t.kind==="task"&&interactive)b.onclick=()=>setState(t,d,st==="done"?null:"done");else b.disabled=true;let span=document.createElement("span");span.textContent=t.title;span.className=(st==="done"?"done ":"")+(t.kind==="info"?"info":"");div.append(b,span);if(interactive&&t.notes){div.title=t.notes;span.onclick=()=>alert(t.title+"\n\n"+t.notes)}return div}
function render(){let now=new Date(),tom=new Date();tom.setDate(now.getDate()+1);let ma=morningActive(now),today=ma?morningTasks(now):data.tasks.filter(t=>due(t,now));today=today.filter(t=>state(t,now)!=="skip");$("#todayTitle").textContent=ma?"MORNING":"TODAY";$("#mode").textContent=ma?"MORNING MODE":"TODAY";$("#today").replaceChildren(...today.map(t=>row(t,now,true)));$("#nextTitle").textContent="NEXT · "+names[tom.getDay()].toUpperCase();$("#next").replaceChildren(...data.tasks.filter(t=>due(t,tom)).map(t=>row(t,tom,false)));let p=progress();$("#week").textContent=p[0]+" / "+p[1];renderHistory(now)}
function renderHistory(now){let box=$("#history"),items=[];for(let w=0;w<4;w++){let end=new Date(now);end.setDate(end.getDate()-7*w);let s=startOfWeek(end),e=new Date(s);e.setDate(e.getDate()+6);let d=0,t=0;for(let x=new Date(s);x<=e&&x<=now;x.setDate(x.getDate()+1))for(let task of data.tasks)if(task.kind==="task"&&due(task,x)){let st=state(task,x);if(st==="skip")continue;t++;if(st==="done")d++}let r=document.createElement("div");r.className="historyRow";r.innerHTML=`<span>${w?"Week of ":"This week · "}${s.toLocaleDateString([], {day:"numeric",month:"short"})}</span><b>${d} / ${t}</b>`;items.push(r)}box.replaceChildren(...items)}
$("#skipDayBtn").onclick=()=>{let d=new Date();for(let t of data.tasks)if(t.kind==="task"&&due(t,d)&&!state(t,d)){data.occ[key(d)]??={};data.occ[key(d)][t.id]="skip"}save()};
const td=$("#taskDialog");$("#addBtn").onclick=()=>td.showModal();
$("#days").innerHTML="<div class=daygrid>"+[1,2,3,4,5,6,0].map(d=>`<label><input type=checkbox value=${d}>${names[d]}</label>`).join("")+"</div>";
function clearTaskForm(){
  $("#taskForm").reset();
}
$("#taskForm").addEventListener("submit",e=>{
  e.preventDefault();
  const title=$("#taskTitle").value.trim();
  if(!title){ $("#taskTitle").focus(); return; }
  const ds=[...$("#days input:checked")].map(x=>Number(x.value));
  const task={
    id:(crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random()),
    title,
    notes:$("#taskNotes").value.trim(),
    kind:$("#taskKind").value,
    period:$("#taskPeriod").value,
    days:ds,
    enabled:true
  };
  data.tasks.push(task);
  localStorage.setItem(LS,JSON.stringify(data));
  clearTaskForm();
  td.close();
  render();
});
$("#cancelTask").onclick=()=>{clearTaskForm();td.close()};
td.addEventListener("close",clearTaskForm);
const sd=$("#settingsDialog");$("#settingsBtn").onclick=()=>{loadSettings();sd.showModal()};
function taskChecks(ids){return data.tasks.filter(t=>t.kind==="task").map(t=>`<label><input type=checkbox value="${t.id}" ${ids.includes(t.id)?"checked":""}> ${t.title}</label>`).join("")||"<p class=hint>Add tasks first.</p>"}
function loadSettings(){$("#cutoff").value=data.settings.cutoff;$("#notifyEnabled").checked=data.settings.notify.enabled;$("#notifyTime").value=data.settings.notify.time;$("#notifyText").value=data.settings.notify.text;$("#morningDefault").innerHTML=taskChecks(data.settings.defaultMorning);$("#overrideDay").innerHTML='<option value="">Uses default</option>'+names.map((n,i)=>`<option value=${i}>${n}</option>`).join("");$("#morningOverride").innerHTML=""}
$("#overrideDay").onchange=()=>{let v=$("#overrideDay").value;if(v==="")return $("#morningOverride").innerHTML="";let ids=data.settings.overrides[v]??data.settings.defaultMorning;$("#morningOverride").innerHTML="<p class=hint>This replaces the default on "+names[v]+".</p>"+taskChecks(ids)}
$("#saveSettings").onclick=()=>{data.settings.cutoff=$("#cutoff").value;data.settings.defaultMorning=[...$("#morningDefault input:checked")].map(x=>x.value);let v=$("#overrideDay").value;if(v!=="")data.settings.overrides[v]=[...$("#morningOverride input:checked")].map(x=>x.value);data.settings.notify={enabled:$("#notifyEnabled").checked,time:$("#notifyTime").value,text:$("#notifyText").value};save()};
$("#notifyPermission").onclick=async()=>{if(!("Notification"in window))return alert("Notifications are not supported here.");let p=await Notification.requestPermission();alert("Notification permission: "+p)};
if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js");
render();