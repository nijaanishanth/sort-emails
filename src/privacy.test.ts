import {describe,it,expect} from 'vitest';
import {classify} from './privacy';
const base={id:'1',threadId:'1',sender:'news@example.com',subject:'Weekly newsletter',labels:['UNREAD'],date:0};
describe('privacy-first demo classifier',()=>{
 it('classifies eligible metadata',()=>expect(classify(base)?.category).toBe('Newsletters'));
 it.each(['Password reset','Bank statement','Your SSN 123-45-6789','Medical appointment','Your card 4111 1111 1111 1111'])('suppresses %s',subject=>expect(classify({...base,subject})).toBeNull());
 it('fails closed for missing sender',()=>expect(classify({...base,sender:''})).toBeNull());
 it('treats uncertainty as manual review',()=>expect(classify({...base,subject:'Hello'} )?.suggestion).toBe('Review manually'));
});
