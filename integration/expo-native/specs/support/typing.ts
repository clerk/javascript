import { NO_BUSY_WAIT, isRunnerBusy, type BusyWait } from './busy-runner.ts';

export interface FocusedField {
  type(text: string): Promise<void>;
  valueIfReadable(): Promise<string | null>;
  valuesOfTheNamedNodes(): Promise<readonly string[]>;
  refocus(): Promise<void>;
  tapAgain(): Promise<void>;
  replace(text: string): Promise<void>;
  nothingFocused?(): Promise<boolean>;
}

export const NOTHING_FOCUSED = 'TEXT_INPUT_NOT_FOCUSED';

const TYPED_PER_COMMAND = 16;

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

async function read(field: FocusedField, text: string): Promise<Reading> {
  const focused = await field.valueIfReadable();
  if (focused !== null) return compare(focused, text);
  const shown = new Set((await field.valuesOfTheNamedNodes()).filter((value) => value !== ''));
  return compare(shown.size === 1 ? [...shown][0]! : null, text);
}

async function settled(field: FocusedField, text: string, settle: Settle): Promise<Reading> {
  let reading = await read(field, text);
  for (let reads = 1; reads < settle.reads && (reading.state === 'empty' || reading.state === 'differs'); reads += 1) {
    await settle.wait();
    reading = await read(field, text);
  }
  return reading;
}

export function commandsFor(text: string): readonly [string, ...string[]] {
  const characters = [...text];
  const rest: string[] = [];
  for (let at = TYPED_PER_COMMAND; at < characters.length; at += TYPED_PER_COMMAND) rest.push(characters.slice(at, at + TYPED_PER_COMMAND).join(''));
  return [characters.slice(0, TYPED_PER_COMMAND).join(''), ...rest];
}

async function typeIntoAFocusedField(field: FocusedField, text: string): Promise<void> {
  if (text !== '' && (await field.nothingFocused?.()) === true) throw new Error(`${NOTHING_FOCUSED}: no text field has focus, so nothing would be typed`);
  await field.type(text);
}

async function typeOnceTheTapLanded(field: FocusedField, text: string): Promise<void> {
  const [first, ...rest] = commandsFor(text);
  try {
    await typeIntoAFocusedField(field, first);
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes(NOTHING_FOCUSED)) throw error;
    await field.tapAgain();
    await typeIntoAFocusedField(field, first);
  }
  for (const next of rest) await field.type(next);
}

const unlessTheRunnerWasBusy = (error: unknown): void => {
  if (isRunnerBusy(error)) throw error;
};

async function replaceContents(field: FocusedField, text: string, busy: BusyWait): Promise<void> {
  const [first, ...rest] = commandsFor(text);
  for (;;) {
    try {
      await field.replace(first).catch(unlessTheRunnerWasBusy);
      for (const next of rest) await field.type(next).catch(unlessTheRunnerWasBusy);
      return;
    } catch (refusal) {
      if (!(await busy.waited())) throw refusal;
    }
  }
}

async function typedOrReplaced(field: FocusedField, text: string, busy: BusyWait, typing: () => Promise<void>): Promise<void> {
  try {
    await typing();
  } catch (refusal) {
    if (!isRunnerBusy(refusal) || !(await busy.waited())) throw refusal;
    await replaceContents(field, text, busy).catch((error: unknown) => {
      throw isRunnerBusy(error) ? refusal : error;
    });
  }
}

export async function typeConfirmed(field: FocusedField, text: string, settle: Settle, busy: BusyWait = NO_BUSY_WAIT): Promise<void> {
  await typedOrReplaced(field, text, busy, () => typeOnceTheTapLanded(field, text));
  if (text === '') return;
  let reading = await settled(field, text, settle);
  if (reading.state === 'empty') {
    await field.refocus();
    await typedOrReplaced(field, text, busy, async () => {
      for (const command of commandsFor(text)) await field.type(command);
    });
    reading = await settled(field, text, settle);
    if (reading.state === 'empty') throw new Error('the text never reached the field: it was typed twice, and the focused field still reads empty');
  }
  if (reading.state !== 'differs') return;
  await replaceContents(field, text, busy);
  reading = await settled(field, text, settle);
  if (reading.state === 'empty' || reading.state === 'differs') {
    throw new Error(`the field does not hold the typed text: ${lettersAndDigits(text).length} letters and digits were typed, and after one attempt to replace its contents the field holds ${reading.held}`);
  }
}
