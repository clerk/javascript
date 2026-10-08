export interface FocusedField {
  type(text: string): Promise<void>;
  valueIfReadable(): Promise<string | null>;
  refocus(): Promise<void>;
  tapAgain(): Promise<void>;
  replace(text: string): Promise<void>;
  nothingFocused?(): Promise<boolean>;
}

export const NOTHING_FOCUSED = 'TEXT_INPUT_NOT_FOCUSED';

export interface Settle {
  readonly reads: number;
  wait(): Promise<unknown>;
}

type Reading = { readonly state: 'holds' | 'unreadable' } | { readonly state: 'empty' | 'differs'; readonly held: number };

const lettersAndDigits = (text: string): string => text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

function compare(value: string | null, text: string): Reading {
  if (value === null) return { state: 'unreadable' };
  if (value === '') return { state: 'empty', held: 0 };
  const typed = lettersAndDigits(text);
  const shown = lettersAndDigits(value);
  if (typed === '' || shown === '') return { state: 'unreadable' };
  return shown.includes(typed) ? { state: 'holds' } : { state: 'differs', held: shown.length };
}

async function settled(field: FocusedField, text: string, settle: Settle): Promise<Reading> {
  let reading = compare(await field.valueIfReadable(), text);
  for (let read = 1; read < settle.reads && (reading.state === 'empty' || reading.state === 'differs'); read += 1) {
    await settle.wait();
    reading = compare(await field.valueIfReadable(), text);
  }
  return reading;
}

async function typeIntoAFocusedField(field: FocusedField, text: string): Promise<void> {
  if (text !== '' && (await field.nothingFocused?.()) === true) throw new Error(`${NOTHING_FOCUSED}: no text field has focus, so nothing would be typed`);
  await field.type(text);
}

async function typeOnceTheTapLanded(field: FocusedField, text: string): Promise<void> {
  try {
    await typeIntoAFocusedField(field, text);
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes(NOTHING_FOCUSED)) throw error;
    await field.tapAgain();
    await typeIntoAFocusedField(field, text);
  }
}

export async function typeConfirmed(field: FocusedField, text: string, settle: Settle): Promise<void> {
  await typeOnceTheTapLanded(field, text);
  if (text === '') return;
  let reading = await settled(field, text, settle);
  if (reading.state === 'empty') {
    await field.refocus();
    await field.type(text);
    reading = await settled(field, text, settle);
    if (reading.state === 'empty') throw new Error('the text never reached the field: it was typed twice, and the focused field still reads empty');
  }
  if (reading.state !== 'differs') return;
  await field.replace(text).catch(() => undefined);
  reading = await settled(field, text, settle);
  if (reading.state === 'empty' || reading.state === 'differs') {
    throw new Error(`the field does not hold the typed text: ${lettersAndDigits(text).length} letters and digits were typed, and after one attempt to replace its contents the field holds ${reading.held}`);
  }
}
