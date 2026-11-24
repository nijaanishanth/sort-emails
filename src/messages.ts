import {z} from 'zod';

export const requestSchema=z.discriminatedUnion('type',[
 z.strictObject({type:z.literal('demo')}),
 z.strictObject({type:z.literal('clear')}),
 z.strictObject({type:z.literal('gmail-status')}),
 z.strictObject({type:z.literal('gmail-connect')}),
 z.strictObject({type:z.literal('gmail-disconnect')})
]);

/** Accept only top-level, packaged UI pages belonging to this extension. */
export function isTrustedSender(sender:{id?:string;url?:string;frameId?:number},extensionId:string,baseUrl:string):boolean {
 if(sender.id!==extensionId || sender.frameId!==0 || !sender.url) return false;
 try {
  const url=new URL(sender.url),base=new URL(baseUrl);
  return url.protocol===base.protocol && url.host===base.host &&
   ['/index.html','/popup.html','/sidepanel.html'].includes(url.pathname) && !url.search && !url.hash;
 } catch {return false;}
}
