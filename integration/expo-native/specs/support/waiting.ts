import { signedInText, type SeededUser, type TestEmail } from './types.ts';

export const SAVE_PASSWORD_PROMPT = 'Save Password?';

export const errorScreenElseSavePasswordPrompt = (errorScreenId: string): string => `id="${errorScreenId}" || label="${SAVE_PASSWORD_PROMPT}"`;

export interface ScreenElement {
  allTextContents(): Promise<readonly string[]>;
}

export type Read = { readonly texts: readonly string[] } | { readonly unread: string };

export interface Reads {
  of(what: string, element: ScreenElement): Promise<Read>;
  summary(): string;
}

export function timedReads(now: () => number): Reads {
  let count = 0;
  let slowest = { what: 'none', ms: 0 };
  let failed = 0;
  let lastFailure = '';
  return {
    async of(what, element) {
      const startedAt = now();
      count += 1;
      let read: Read;
      try {
        read = { texts: await element.allTextContents() };
      } catch (error) {
        read = { unread: (error instanceof Error ? error.message : String(error)).replace(/\s+/g, ' ') };
        failed += 1;
        lastFailure = `${what}: ${read.unread}`;
      }
      const ms = now() - startedAt;
      if (ms > slowest.ms) slowest = { what, ms };
      return read;
    },
    summary: () => `reads: ${count}, the slowest ${slowest.ms}ms (${slowest.what})${failed === 0 ? '' : `; failed reads: ${failed}, the last: ${lastFailure}`}`,
  };
}

const only = (read: Read): string | null => ('texts' in read && read.texts.length === 1 ? read.texts[0]! : null);
const shown = (read: Read): boolean => 'texts' in read && read.texts.length > 0;
const absent = (read: Read): boolean => 'texts' in read && read.texts.length === 0;
const textsOf = (read: Read): readonly string[] => ('texts' in read ? read.texts : []);

export interface Home {
  readonly signedIn: ScreenElement;
  readonly userId: ScreenElement;
  readonly sessionId: ScreenElement;
  readonly signedOut: ScreenElement;
}

const HOME_ELEMENTS: { readonly [K in keyof Home]: string } = { signedIn: 'the heading', userId: 'the user ID', sessionId: 'the session ID', signedOut: '"Signed out"' };

export type See = (what: string, element: ScreenElement) => Promise<Read>;

export type Sight = (see: See) => Promise<boolean>;

type ReadHome = (element: keyof Home) => Promise<Read>;

const onTheHome =
  (see: See, home: Home): ReadHome =>
  (element) =>
    see(HOME_ELEMENTS[element], home[element]);

export const signedInAs =
  (home: Home, who: SeededUser | TestEmail): Sight =>
  async (see) => {
    const read = onTheHome(see, home);
    const email = typeof who === 'string' ? who : who.email;
    const isTheUser = (id: string | null): boolean => (typeof who === 'string' ? (id ?? '') !== '' : id === who.id);
    return only(await read('signedIn')) === signedInText(email) && isTheUser(only(await read('userId'))) && (only(await read('sessionId')) ?? '') !== '';
  };

export const signedOut =
  (home: Home): Sight =>
  async (see) => {
    const read = onTheHome(see, home);
    return shown(await read('signedOut')) && absent(await read('signedIn')) && absent(await read('userId')) && absent(await read('sessionId'));
  };

export const onScreen =
  (element: ScreenElement, what: string): Sight =>
  async (see) =>
    shown(await see(what, element));

async function homeShows(read: ReadHome): Promise<string> {
  const heading = await read('signedIn');
  const userId = await read('userId');
  const sessionId = await read('sessionId');
  const signedOutText = await read('signedOut');
  const ids = [userId, sessionId].map((id) => textsOf(id).join(' and ') || 'none');
  const parts = [
    ...textsOf(heading).map((text) => `"${text}"`),
    ...(shown(signedOutText) ? ['"Signed out"'] : []),
    ...(shown(heading) || shown(userId) || shown(sessionId) ? [`user ID ${ids[0]}`, `session ID ${ids[1]}`] : []),
  ];
  if (parts.length > 0) return `the home shows ${parts.join(', ')}`;
  return [heading, userId, sessionId, signedOutText].some((one) => 'unread' in one) ? 'the home could not be read' : 'the home is not on screen';
}

interface Look {
  readonly reached: boolean;
  readonly shows: string;
}

async function lookAt(reads: Reads, sight: Sight, homeToDescribe: Home | null): Promise<Look> {
  const taken = new Map<ScreenElement, Read>();
  const unread: string[] = [];
  const see: See = async (what, element) => {
    const known = taken.get(element);
    if (known !== undefined) return known;
    const read = await reads.of(what, element);
    taken.set(element, read);
    if ('unread' in read) unread.push(`${what} (${read.unread})`);
    return read;
  };
  const home = homeToDescribe === null ? 'the home was not read in full' : await homeShows(onTheHome(see, homeToDescribe));
  const reached = await sight(see);
  return { reached, shows: unread.length === 0 ? home : `${home}; unread: ${unread.join(', ')}` };
}

export interface WaitScreen {
  readonly home: Home;
  readonly errorScreenElsePrompt: ScreenElement;
  dismissPrompt(): Promise<unknown>;
}

export interface WaitPace {
  readonly timeoutMs: number;
  now(): number;
  wait(): Promise<unknown>;
}

export async function until(sight: Sight, waitingFor: string, screen: WaitScreen, pace: WaitPace): Promise<void> {
  const reads = timedReads(pace.now);
  const deadline = pace.now() + pace.timeoutMs;
  for (let pass = 1; ; pass += 1) {
    const lastPass = pace.now() >= deadline;
    const failure = (why: string): Error => new Error(`the app did not show ${waitingFor}${why}; passes: ${pass}; ${reads.summary()}`);
    let look = await lookAt(reads, sight, lastPass ? screen.home : null);
    if (look.reached) return;
    const covering = await reads.of('the error screen or the save-password prompt', screen.errorScreenElsePrompt);
    const inFront = textsOf(covering);
    if (inFront.some((text) => text !== SAVE_PASSWORD_PROMPT)) throw failure(`; it shows its error screen: ${inFront.join(' ')}`);
    if (inFront.length > 0) {
      await Promise.resolve()
        .then(() => screen.dismissPrompt())
        .catch(() => undefined);
      look = await lookAt(reads, sight, lastPass ? screen.home : null);
      if (look.reached) return;
    }
    if (lastPass) throw failure(` within ${pace.timeoutMs}ms; ${look.shows}`);
    if (pace.now() < deadline) await pace.wait();
  }
}
