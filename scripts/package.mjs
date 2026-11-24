import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
if(process.platform==='win32') execFileSync('tar.exe',['-a','-c','-f',resolve('quiet-inbox.zip'),'-C',resolve('dist'),'.'],{stdio:'inherit'});
else execFileSync('zip',['-qr',resolve('quiet-inbox.zip'),'.'],{cwd:resolve('dist'),stdio:'inherit'});
