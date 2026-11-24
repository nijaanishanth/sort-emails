import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {db} from './db';
import type {Result} from './privacy';
import './style.css';
if(import.meta.env.MODE==='development'){
 const events=new EventSource('http://127.0.0.1:43173/events');
 events.addEventListener('reload',()=>chrome.runtime.reload());
}
function App(){
 const [rows,setRows]=useState<Result[]>([]),[count,setCount]=useState(0),[protectedCount,setProtected]=useState(0),[filter,setFilter]=useState(''),[busy,setBusy]=useState(false),[page,setPage]=useState(0);
 const [gmail,setGmail]=useState('checking'),[gmailError,setGmailError]=useState('');
 async function gmailAction(type:'gmail-status'|'gmail-connect'|'gmail-disconnect'){
  setGmailError('');
  try {const response=await chrome.runtime.sendMessage({type}); if(response?.ok) setGmail(response.status); else setGmailError(response?.error||'Connection status is unavailable.');}
  catch {setGmailError('Connection status is unavailable. Reload the extension and try again.');}
 }
 async function refresh(){const all=await db.messages.toArray();setRows(all);setCount(all.length);const s=await chrome.storage.local.get('protectedCount');setProtected(s.protectedCount||0);}
 useEffect(()=>{void refresh();void gmailAction('gmail-status');},[]);
 async function run(type:'demo'|'clear'){setBusy(true);await chrome.runtime.sendMessage({type});await refresh();setPage(0);setBusy(false);}
 const filtered=rows.filter(r=>`${r.subject} ${r.sender} ${r.category}`.toLowerCase().includes(filter.toLowerCase()));
 const compact=location.pathname.includes('popup')||location.pathname.includes('sidepanel');
 return <div className={compact?'shell compact':'shell'}><header><div><span className="eyebrow">PRIVATE BY DESIGN · RULES ONLY</span><h1>Quiet Inbox<span>.</span></h1><p>A calmer way to review your unread mail.</p></div><div className="badge">Demo mode</div></header>
 <div className="notice"><strong>Preview only.</strong> Gmail connection requests metadata access only. Real scanning, AI, and Gmail actions are not implemented. The displayed messages are synthetic.</div>
 <section className="review"><div className="sectionhead"><div><span className="eyebrow">GMAIL CONNECTION</span><h2>{gmail==='connected'?'Connected':gmail==='unconfigured'?'Setup required':gmail==='checking'?'Checking connection…':'Not connected'}</h2><p>Google grants mailbox-wide metadata access; this preview does not retrieve messages or change your inbox.</p></div><div className="actions">{gmail==='connected'?<button className="secondary" onClick={()=>void gmailAction('gmail-disconnect')}>Disconnect Gmail</button>:gmail==='unconfigured'?<span>Configure your OAuth client ID to connect.</span>:<button disabled={gmail==='checking'} onClick={()=>void gmailAction('gmail-connect')}>Connect Gmail</button>}</div></div>{gmailError&&<p role="alert">{gmailError}</p>}</section>
 <section className="hero"><div><span className="eyebrow">YOUR INBOX AT A GLANCE</span><h2>Make room for what matters.</h2><p>Explore a sample inbox and see how metadata rules group messages. Potentially sensitive examples are counted, never displayed.</p><div className="actions"><button disabled={busy} onClick={()=>void run('demo')}>{busy?'Preparing…':'Generate 3,000 sample emails'}</button><button className="secondary" disabled={busy} onClick={()=>void run('clear')}>Clear local data</button>{compact&&<button className="secondary" onClick={()=>void chrome.tabs.create({url:chrome.runtime.getURL('index.html')})}>Open dashboard</button>}</div></div><div className="heroArt">✳<small>Less noise.<br/>More clarity.</small></div></section>
 <div className="stats"><div><label>Eligible messages</label><strong>{count.toLocaleString()}</strong><small>Sample metadata</small></div><div><label>Protected skipped</label><strong>{protectedCount.toLocaleString()}</strong><small>Aggregate only</small></div><div><label>Needs review</label><strong>{rows.filter(r=>r.category==='Unclassified').length.toLocaleString()}</strong><small>No automatic actions</small></div><div><label>Connection</label><strong className="smallstat">{gmail==='connected'?'Connected':'Not connected'}</strong><small>Metadata permission only</small></div></div>
 <section className="review"><div className="sectionhead"><div><span className="eyebrow">REVIEW QUEUE</span><h2>Messages to consider</h2><p>Classifications are estimates based on sample subject and sender metadata.</p></div><input aria-label="Search messages" placeholder="Search sender, subject, category" value={filter} onChange={e=>{setFilter(e.target.value);setPage(0);}}/></div>
 {filtered.length===0?<div className="empty">No messages to show. Generate the sample inbox to get started.</div>:<><div className="list">{filtered.slice(page*30,page*30+30).map(r=><article key={r.id}><div className="avatar">{r.sender[0].toUpperCase()}</div><div className="message"><div className="line"><strong>{r.sender}</strong><span className="tag">{r.category}</span></div><div>{r.subject}</div><small>{r.explanation} · {r.suggestion}</small></div><time>{new Date(r.date).toLocaleDateString()}</time></article>)}</div><div className="pagination"><button className="secondary" disabled={!page} onClick={()=>setPage(page-1)}>Previous</button><span>Page {page+1} of {Math.ceil(filtered.length/30)}</span><button className="secondary" disabled={(page+1)*30>=filtered.length} onClick={()=>setPage(page+1)}>Next</button></div></>}</section>
 <footer>Local browser storage is not necessarily encrypted. Sensitive detection is incomplete; this preview is not a security guarantee.</footer></div>
}
createRoot(document.getElementById('root')!).render(<App/>);
