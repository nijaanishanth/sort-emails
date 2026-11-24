import Dexie, {type Table} from 'dexie';
import type {Result} from './privacy';
class InboxDB extends Dexie { messages!:Table<Result,string>; constructor(){super('quiet-inbox');this.version(1).stores({messages:'id, threadId, sender, category, date'});} }
export const db=new InboxDB();
