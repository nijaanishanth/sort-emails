import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {randomBytes,timingSafeEqual} from 'node:crypto';

const clients=new Set();
const reloadSecret=randomBytes(32).toString('hex');
const server=createServer((req,res)=>{
 if(req.method==='GET' && req.url==='/events'){
  const origin=req.headers.origin||'';
  if(!/^chrome-extension:\/\/[a-p]{32}$/.test(origin)){res.writeHead(403).end();return;}
  res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Access-Control-Allow-Origin':origin});
  res.write(': connected\n\n'); clients.add(res); req.on('close',()=>clients.delete(res)); return;
 }
 if(req.method==='POST' && req.url==='/reload'){
  const supplied=req.headers['x-quiet-inbox-reload'];
  if(req.headers.origin || typeof supplied!=='string' || !/^[a-f0-9]{64}$/.test(supplied) || !timingSafeEqual(Buffer.from(supplied),Buffer.from(reloadSecret))){res.writeHead(403).end();return;}
  for(const client of clients) client.write('event: reload\ndata: built\n\n');
  res.writeHead(204).end();return;
 }
 res.writeHead(404).end();
});
server.on('error',error=>{console.error('Unable to start the development reload server:',error.message);process.exit(1);});
server.listen(43173,'127.0.0.1',()=>{
 console.log('Development reload server listening on 127.0.0.1:43173. Keep a dashboard or side panel open.');
 const vite=spawn(process.execPath,[resolve('node_modules/vite/bin/vite.js'),'build','--watch','--mode','development'],{stdio:'inherit',env:{...process.env,QUIET_INBOX_RELOAD_SECRET:reloadSecret}});
 vite.on('exit',code=>{server.close();process.exit(code??1);});
 const stop=()=>{vite.kill();for(const client of clients) client.end();server.close();};
 process.on('SIGINT',stop);process.on('SIGTERM',stop);
});
