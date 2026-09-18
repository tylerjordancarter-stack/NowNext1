// Reference only: npm i express web-push
const express=require("express"), webpush=require("web-push");
const app=express(); app.use(express.json());
const subs=new Map();
webpush.setVapidDetails(process.env.VAPID_SUBJECT,process.env.VAPID_PUBLIC_KEY,process.env.VAPID_PRIVATE_KEY);
app.post("/subscribe",(req,res)=>{let {id,subscription,time="08:30",timezone="Europe/London",text}=req.body;subs.set(id,{subscription,time,timezone,text});res.sendStatus(204)});
app.post("/unsubscribe",(req,res)=>{subs.delete(req.body.id);res.sendStatus(204)});
// A production scheduler should evaluate each subscriber's IANA timezone each minute.
// This endpoint demonstrates sending; call it from your scheduler for subscriptions that are due.
app.post("/send/:id",async(req,res)=>{let x=subs.get(req.params.id);if(!x)return res.sendStatus(404);try{await webpush.sendNotification(x.subscription,JSON.stringify({title:"NowNext",body:x.text||"Morning 👋 Open NowNext and see what's waiting."}));res.sendStatus(204)}catch(e){res.status(500).send(String(e))}});
app.listen(process.env.PORT||3000);