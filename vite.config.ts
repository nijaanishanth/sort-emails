import { defineConfig,loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import {readFile,writeFile} from 'node:fs/promises';
export default defineConfig(({mode})=>({plugins:[react(), {name:'extension-manifest',async writeBundle(){
 const manifest=JSON.parse(await readFile(resolve('public/manifest.json'),'utf8'));
 const clientId=loadEnv(mode,process.cwd(),'').QUIET_INBOX_GOOGLE_CLIENT_ID;
 if(clientId){
  if(!/^[0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com$/.test(clientId)) throw new Error('Invalid Google OAuth client ID.');
  manifest.permissions.push('identity');
  manifest.oauth2={client_id:clientId,scopes:['https://www.googleapis.com/auth/gmail.metadata']};
  manifest.host_permissions=['https://oauth2.googleapis.com/*'];
  manifest.content_security_policy.extension_pages="script-src 'self'; object-src 'self'; connect-src 'self' https://oauth2.googleapis.com";
 }
 if(mode==='development'){
  manifest.host_permissions=[...(manifest.host_permissions??[]),'http://127.0.0.1:43173/*'];
  manifest.content_security_policy.extension_pages+=" http://127.0.0.1:43173";
 }
 await writeFile(resolve('dist/manifest.json'),JSON.stringify(manifest));
 if(mode==='development') try { await fetch('http://127.0.0.1:43173/reload',{method:'POST',headers:{'x-quiet-inbox-reload':process.env.QUIET_INBOX_RELOAD_SECRET ?? ''}}); } catch { /* The development server may have stopped. */ }
 }}],build:{rollupOptions:{input:{dashboard:resolve(__dirname,'index.html'),popup:resolve(__dirname,'popup.html'),sidepanel:resolve(__dirname,'sidepanel.html'),background:resolve(__dirname,'src/background.ts')},output:{entryFileNames:chunk=>chunk.name==='background'?'background.js':'assets/[name]-[hash].js'}}}}));
