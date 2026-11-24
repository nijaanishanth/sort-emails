export const METADATA_SCOPE='https://www.googleapis.com/auth/gmail.metadata';

export async function token(interactive:boolean):Promise<string> {
 if(!chrome.runtime.getManifest().oauth2?.client_id) throw new Error('OAuth client ID is not configured.');
 const result=await chrome.identity.getAuthToken({interactive,scopes:[METADATA_SCOPE]});
 if(!result.token || !result.grantedScopes?.includes(METADATA_SCOPE)) {
  if(result.token) await chrome.identity.removeCachedAuthToken({token:result.token});
  throw new Error('Google did not confirm the metadata permission.');
 }
 return result.token;
}

export async function disconnect():Promise<void> {
 const accessToken=await token(false);
 const response=await fetch('https://oauth2.googleapis.com/revoke',{
  method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
  body:new URLSearchParams({token:accessToken}),cache:'no-store',credentials:'omit',redirect:'error'
 });
 if(!response.ok) throw new Error('Google did not confirm revocation.');
 await chrome.identity.removeCachedAuthToken({token:accessToken});
}
