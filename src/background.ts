import { db } from './db';
import { classify } from './privacy';
import {isTrustedSender,requestSchema} from './messages';
import {token,disconnect} from './auth';
let pending:Promise<unknown>=Promise.resolve();
chrome.runtime.onInstalled.addListener(()=>{void chrome.storage.local.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'});});
chrome.runtime.onMessage.addListener((raw,sender,reply)=>{
  if(!isTrustedSender(sender,chrome.runtime.id,chrome.runtime.getURL(''))) return false;
  const parsed=requestSchema.safeParse(raw); if(!parsed.success) return false;
  const task=pending.then(async()=>{
    if(parsed.data.type==='gmail-status'){
      if(!chrome.runtime.getManifest().oauth2?.client_id) return {ok:true,status:'unconfigured'};
      try {await token(false);return {ok:true,status:'connected'};} catch {return {ok:true,status:'disconnected'};}
    }
    if(parsed.data.type==='gmail-connect'){
      try {await token(true);return {ok:true,status:'connected'};} catch {return {ok:false,error:'Could not connect. Check the OAuth setup and Google consent, then try again.'};}
    }
    if(parsed.data.type==='gmail-disconnect'){
      try {await disconnect();return {ok:true,status:'disconnected'};} catch {return {ok:false,error:'Could not confirm revocation. Reconnect to Chrome and try again, or revoke access in your Google Account.'};}
    }
    if(parsed.data.type==='clear'){await db.messages.clear();await chrome.storage.local.clear();return {ok:true};}
    await db.messages.clear(); let protectedCount=0; const batch=[];
    for(let i=0;i<3000;i++){
      const kind=i%6; const subjects=['Weekly newsletter','Interview invitation','Spring promotion','Project update','Security alert','Research digest'];
      const result=classify({id:`demo-${i}`,threadId:`thread-${Math.floor(i/2)}`,sender:`${['news','careers','offers','projects','security','research'][kind]}@example.com`,subject:subjects[kind],labels:['UNREAD'],date:Date.now()-i*3600000});
      if(result) batch.push(result); else protectedCount++;
    }
    await db.messages.bulkPut(batch); await chrome.storage.local.set({demo:true,protectedCount});return {ok:true};
  });
  pending=task.catch(()=>undefined);
  void task.then(reply).catch(()=>reply({ok:false})); return true;
});
