import {afterEach,describe,expect,it,vi} from 'vitest';
import {disconnect,METADATA_SCOPE,token} from './auth';
afterEach(()=>vi.unstubAllGlobals());
function setup(result:{token?:string;grantedScopes?:string[]}){
 const removeCachedAuthToken=vi.fn().mockResolvedValue(undefined);
 const getAuthToken=vi.fn().mockResolvedValue(result);
 vi.stubGlobal('chrome',{runtime:{getManifest:()=>({oauth2:{client_id:'test'}})},identity:{getAuthToken,removeCachedAuthToken}});
 return {getAuthToken,removeCachedAuthToken};
}
describe('Gmail metadata authorization',()=>{
 it('requests only metadata and verifies the granted scope',async()=>{
  const api=setup({token:'fake',grantedScopes:[METADATA_SCOPE]});
  await expect(token(true)).resolves.toBe('fake');
  expect(api.getAuthToken).toHaveBeenCalledWith({interactive:true,scopes:[METADATA_SCOPE]});
 });
 it('rejects and removes tokens without a confirmed scope',async()=>{
  const api=setup({token:'fake',grantedScopes:[]});
  await expect(token(false)).rejects.toThrow();
  expect(api.removeCachedAuthToken).toHaveBeenCalledWith({token:'fake'});
 });
 it('does not claim disconnect when revocation fails',async()=>{
  const api=setup({token:'fake',grantedScopes:[METADATA_SCOPE]});
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false}));
  await expect(disconnect()).rejects.toThrow();
  expect(api.removeCachedAuthToken).not.toHaveBeenCalled();
 });
 it('revokes and clears the token after confirmation',async()=>{
  const api=setup({token:'fake',grantedScopes:[METADATA_SCOPE]});
  const fetchMock=vi.fn().mockResolvedValue({ok:true});vi.stubGlobal('fetch',fetchMock);
  await disconnect();
  expect(fetchMock.mock.calls[0][0]).toBe('https://oauth2.googleapis.com/revoke');
  expect(api.removeCachedAuthToken).toHaveBeenCalledWith({token:'fake'});
 });
});
