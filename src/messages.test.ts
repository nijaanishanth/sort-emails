import {describe,it,expect} from 'vitest';
import {isTrustedSender,requestSchema} from './messages';
const id='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',base=`chrome-extension://${id}/`;
describe('extension message authorization',()=>{
 it('accepts packaged top-level UI pages',()=>{
  for(const page of ['index.html','popup.html','sidepanel.html']) expect(isTrustedSender({id,url:base+page,frameId:0},id,base)).toBe(true);
 });
 it('rejects other extensions, pages, frames and ambiguous URLs',()=>{
  for(const sender of [
   {id:'other',url:base+'index.html',frameId:0},
   {id,url:base+'other.html',frameId:0},
   {id,url:base+'index.html',frameId:1},
   {id,url:base+'index.html?x=1',frameId:0},
   {id,url:'https://example.com/index.html',frameId:0},
   {id,url:'not a URL',frameId:0}
  ]) expect(isTrustedSender(sender,id,base)).toBe(false);
 });
 it('accepts only exact supported messages',()=>{
  expect(requestSchema.safeParse({type:'demo'}).success).toBe(true);
  expect(requestSchema.safeParse({type:'clear'}).success).toBe(true);
  expect(requestSchema.safeParse({type:'clear',extra:true}).success).toBe(false);
  expect(requestSchema.safeParse({type:'modify'}).success).toBe(false);
 });
});
