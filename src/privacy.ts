export type Input = { id:string; threadId:string; sender:string; subject:string; labels:string[]; date:number };
export type Result = { id:string; threadId:string; sender:string; subject:string; date:number; category:string; priority:string; explanation:string; suggestion:string };
const sensitive = /\b(bank(?:ing)?|credit card|statement|invest(?:ment)?|password|passcode|verification|security alert|medical|health|insurance|tax|legal|passport|social security|payroll|salary|confidential|private|authentication|otp|account number|routing number)\b/i;
const identifiers = /\b(?:\d{3}[- ]\d{2}[- ]\d{4}|(?:\d[ -]*?){13,19}|\d{3}[-. ]\d{3}[-. ]\d{4})\b|(?:api[_ -]?key|token|secret)\s*[:=]/i;
export function classify(m:Input):Result|null {
  // Unrecognized or missing sender/subject is treated as protected.
  if (!m.sender || !m.subject || sensitive.test([m.sender,m.subject,...m.labels].join(' ')) || identifiers.test(m.subject)) return null;
  const s = (m.sender+' '+m.subject+' '+m.labels.join(' ')).toLowerCase();
  let category='Unclassified', priority='Normal', suggestion='Review manually', explanation='Metadata is insufficient for a reliable classification.';
  if (/newsletter|digest|unsubscribe/.test(s)) {category='Newsletters'; suggestion='Consider archiving'; explanation='Newsletter-related metadata.';}
  else if (/sale|promotion|discount/.test(s)) {category='Promotions'; suggestion='Consider archiving'; explanation='Promotional language in metadata.';}
  else if (/recruit|interview|job application/.test(s)) {category='Career and Recruiting'; priority='High'; explanation='Career-related metadata.';}
  else if (/urgent|deadline/.test(s)) {category='Urgent'; priority='High'; explanation='Urgency indicated in metadata.';}
  return {id:m.id,threadId:m.threadId,sender:m.sender,subject:m.subject,date:m.date,category,priority,explanation,suggestion};
}
