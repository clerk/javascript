import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { newTestEmail } from '../specs/support/clerk.ts';
import { SAVE_PASSWORD_PROMPT, errorScreenElseSavePasswordPrompt, onScreen, signedInAs, signedOut, until, type Home, type ScreenElement, type Sight, type WaitPace, type WaitScreen } from '../specs/support/waiting.ts';
import type { SeededUser } from '../src/core/types.ts';
import { SAMPLE_RUN } from '../testing/sample-inputs.ts';

const EMAIL = newTestEmail(SAMPLE_RUN);
const HEADING = `Signed in as ${EMAIL}`;
const SEEDED: SeededUser = { id: 'user_seeded', email: EMAIL, phone: null, password: null };
const WAITING_FOR = 'the signed-in home';
const POLL_MS = 400;
const SNAPSHOT_FAILED = 'ENGINE_FAILURE: snapshot failed';

type Texts = string | readonly string[] | null;

interface Showing {
  heading: Texts;
  userId: Texts;
  sessionId: Texts;
  signedOut: boolean;
  signIn: boolean;
  prompt: boolean;
  errorScreen: string | null;
}

const ELSEWHERE: Showing = { heading: null, userId: null, sessionId: null, signedOut: false, signIn: false, prompt: false, errorScreen: null };
const SIGNED_IN: Showing = { ...ELSEWHERE, heading: HEADING, userId: 'user_1', sessionId: 'sess_1' };
const SIGNED_OUT: Showing = { ...ELSEWHERE, signedOut: true, signIn: true };

interface Simulated {
  readonly readMs?: (read: number) => number;
  readonly dismissMs?: number;
  readonly dismissal?: 'throws';
  readonly homeReadableUnderThePrompt?: true;
  readonly unreadable?: readonly string[];
  readonly afterRead?: (read: number, show: (next: Partial<Showing>) => void) => void;
}

function device(start: Showing, simulated: Simulated = {}) {
  let showing = { ...start };
  let clock = 0;
  let dismissals = 0;
  let waits = 0;
  const reads: string[] = [];
  const readsPerPass: number[] = [0];
  const show = (next: Partial<Showing>): void => void (showing = { ...showing, ...next });
  const element = (what: string, texts: () => readonly string[]): ScreenElement => ({
    async allTextContents() {
      reads.push(what);
      readsPerPass[readsPerPass.length - 1]! += 1;
      clock += simulated.readMs?.(reads.length) ?? 100;
      const shown = simulated.unreadable?.includes(what) === true ? null : texts();
      simulated.afterRead?.(reads.length, show);
      if (shown === null) throw new Error(SNAPSHOT_FAILED);
      return shown;
    },
  });
  const behindThePrompt = (texts: () => Texts) => (): readonly string[] => {
    const now = texts();
    return (showing.prompt && simulated.homeReadableUnderThePrompt !== true) || now === null ? [] : typeof now === 'string' ? [now] : now;
  };
  const home: Home = {
    signedIn: element('heading', behindThePrompt(() => showing.heading)),
    userId: element('user ID', behindThePrompt(() => showing.userId)),
    sessionId: element('session ID', behindThePrompt(() => showing.sessionId)),
    signedOut: element('signed out', behindThePrompt(() => (showing.signedOut ? 'Signed out' : null))),
  };
  const screen: WaitScreen = {
    home,
    errorScreenElsePrompt: element('in the way', () => (showing.errorScreen !== null ? [showing.errorScreen] : showing.prompt ? [SAVE_PASSWORD_PROMPT, SAVE_PASSWORD_PROMPT] : [])),
    dismissPrompt: () => {
      dismissals += 1;
      clock += simulated.dismissMs ?? 700;
      if (simulated.dismissal === 'throws') throw new Error('LOCATOR_NOT_FOUND: Not Now');
      show({ prompt: false });
      return Promise.resolve();
    },
  };
  const pace = (timeoutMs: number): WaitPace => ({
    timeoutMs,
    now: () => clock,
    wait: async () => {
      waits += 1;
      clock += POLL_MS;
      readsPerPass.push(0);
    },
  });
  return {
    home,
    signIn: element('sign-in button', behindThePrompt(() => (showing.signIn ? 'Sign in' : null))),
    reads,
    readsPerPass,
    clock: () => clock,
    dismissals: () => dismissals,
    waits: () => waits,
    wait: (sight: Sight, timeoutMs = 30_000): Promise<void> => until(sight, WAITING_FOR, screen, pace(timeoutMs)),
  };
}

const failure = async (wait: Promise<void>): Promise<string> => {
  const error = await wait.then(
    () => null,
    (thrown: unknown) => thrown,
  );
  assert.ok(error instanceof Error, 'the wait passed');
  return error.message;
};

describe('a wait for the home to show the user signed in', () => {
  it('passes when the home is signed in only once the save-password prompt is dismissed, and the tap that dismisses it ends after the deadline', async () => {
    const phone = device({ ...SIGNED_IN, prompt: true }, { readMs: (read) => (read === 2 ? 27_000 : 800), dismissMs: 2_800 });
    await phone.wait(signedInAs(phone.home, EMAIL));
    assert.equal(phone.dismissals(), 1);
    assert.ok(phone.clock() > 30_000, `the home was read at ${phone.clock()}ms, which is not after the deadline`);
  });

  it('reads the home once more after the deadline before it fails, so a home that signed in during the last slow read passes, and it does not sleep before that reading', async () => {
    const phone = device(ELSEWHERE, {
      readMs: (read) => (read === 2 ? 31_000 : 100),
      afterRead: (read, show) => {
        if (read === 2) show(SIGNED_IN);
      },
    });
    await phone.wait(signedInAs(phone.home, EMAIL));
    assert.deepEqual(phone.reads, ['heading', 'in the way', 'heading', 'user ID', 'session ID', 'signed out']);
    assert.equal(phone.waits(), 0);
  });

  it('dismisses a prompt it first meets in its last pass, and lets the reading after that decide', async () => {
    const phone = device(ELSEWHERE, {
      readMs: (read) => (read === 1 ? 30_000 : 100),
      afterRead: (read, show) => {
        if (read === 2) show({ ...SIGNED_IN, prompt: true });
      },
    });
    await phone.wait(signedInAs(phone.home, EMAIL));
    assert.equal(phone.dismissals(), 1);
  });

  it('fails with what the deciding reading saw, and reads nothing for the message after it has looked for the error screen and the prompt', async () => {
    const LAST_READ_OF_THE_HOME = 8;
    const phone = device(SIGNED_OUT, {
      afterRead: (read, show) => {
        if (read === LAST_READ_OF_THE_HOME) show(SIGNED_IN);
      },
    });
    const message = await failure(phone.wait(signedInAs(phone.home, EMAIL), 1_000));
    assert.ok(message.startsWith('the app did not show the signed-in home within 1000ms; the home shows "Signed out"; passes: 3; '), message);
    assert.doesNotMatch(message, /Signed in as/);
    assert.deepEqual(phone.reads.slice(4), ['heading', 'user ID', 'session ID', 'signed out', 'in the way']);
  });

  it('makes two captures in a pass that waits, one for the heading and one for the error screen and the prompt together, and three in the pass that finds the user signed in', async () => {
    const phone = device(ELSEWHERE, {
      afterRead: (read, show) => {
        if (read === 4) show(SIGNED_IN);
      },
    });
    await phone.wait(signedInAs(phone.home, EMAIL));
    assert.deepEqual(phone.readsPerPass, [2, 2, 3]);
    assert.deepEqual(phone.reads, ['heading', 'in the way', 'heading', 'in the way', 'heading', 'user ID', 'session ID']);
  });

  it('makes five captures in a pass that dismisses the prompt over the home: two that find it and three that find the user signed in behind it', async () => {
    const phone = device({ ...SIGNED_IN, prompt: true });
    await phone.wait(signedInAs(phone.home, EMAIL));
    assert.deepEqual(phone.readsPerPass, [5]);
  });

  it('makes no more than seven captures in a pass before the deadline: three for the home, one for what is in the way, and three for the home again after a prompt', async () => {
    const phone = device(
      { ...SIGNED_IN, sessionId: null, prompt: true },
      {
        homeReadableUnderThePrompt: true,
        afterRead: (read, show) => {
          if (read === 7) show({ sessionId: 'sess_1' });
        },
      },
    );
    await phone.wait(signedInAs(phone.home, EMAIL));
    assert.deepEqual(phone.readsPerPass, [7, 3]);
    assert.deepEqual(phone.reads.slice(0, 7), ['heading', 'user ID', 'session ID', 'in the way', 'heading', 'user ID', 'session ID']);
  });

  it('reads each of the four elements of the home once in its last pass, and judges and describes from those four', async () => {
    const phone = device(SIGNED_OUT);
    await failure(phone.wait(signedInAs(phone.home, EMAIL), 0));
    assert.deepEqual(phone.reads, ['heading', 'user ID', 'session ID', 'signed out', 'in the way']);
  });

  it('reports a read that threw with its error, and does not call the heading missing', async () => {
    const phone = device(SIGNED_IN, { unreadable: ['heading'] });
    const message = await failure(phone.wait(signedInAs(phone.home, EMAIL), 1_000));
    assert.ok(message.includes(`; the home shows user ID user_1, session ID sess_1; unread: the heading (${SNAPSHOT_FAILED}); passes: 3; `), message);
    assert.ok(message.endsWith(`; failed reads: 3, the last: the heading: ${SNAPSHOT_FAILED}`), message);
  });

  it('says that the home could not be read when no read of it succeeded, and does not call it missing', async () => {
    const phone = device(SIGNED_IN, { unreadable: ['heading', 'user ID', 'session ID', 'signed out'] });
    const message = await failure(phone.wait(signedInAs(phone.home, EMAIL), 0));
    assert.ok(message.includes(`within 0ms; the home could not be read; unread: the heading (${SNAPSHOT_FAILED}), the user ID (${SNAPSHOT_FAILED}), the session ID (${SNAPSHOT_FAILED}), "Signed out" (${SNAPSHOT_FAILED}); passes: 1; `), message);
    assert.doesNotMatch(message, /not on screen/);
  });

  it('goes on when it cannot read what is in the way, and reports that read too', async () => {
    const phone = device(ELSEWHERE, { unreadable: ['in the way'] });
    const message = await failure(phone.wait(signedInAs(phone.home, EMAIL), 1_000));
    assert.ok(message.endsWith(`; failed reads: 3, the last: the error screen or the save-password prompt: ${SNAPSHOT_FAILED}`), message);
    assert.equal(phone.dismissals(), 0);
  });

  it('goes on to its deadline when the tap that should dismiss the prompt fails', async () => {
    const phone = device({ ...SIGNED_IN, prompt: true }, { dismissal: 'throws' });
    const message = await failure(phone.wait(signedInAs(phone.home, EMAIL), 1_000));
    assert.ok(message.startsWith('the app did not show the signed-in home within 1000ms; the home is not on screen; passes: '), message);
    assert.ok(phone.dismissals() > 1);
  });

  it('says how many passes ran, how many reads they made, and how long the slowest read took', async () => {
    const phone = device(ELSEWHERE, { readMs: (read) => (read === 4 ? 1_500 : 100) });
    const message = await failure(phone.wait(signedInAs(phone.home, EMAIL), 1_000));
    assert.ok(message.endsWith('; the home is not on screen; passes: 3; reads: 9, the slowest 1500ms (the error screen or the save-password prompt)'), message);
  });

  it('fails at once with the reason when the app shows its error screen, taps nothing, and still says what the reads did', async () => {
    const phone = device({ ...ELSEWHERE, errorScreen: 'Something went wrong The publishable key is missing' });
    const message = await failure(phone.wait(signedInAs(phone.home, EMAIL)));
    assert.equal(message, 'the app did not show the signed-in home; it shows its error screen: Something went wrong The publishable key is missing; passes: 1; reads: 2, the slowest 100ms (the heading)');
    assert.equal(phone.dismissals(), 0);
  });

  const passes = async (showing: Showing, who: SeededUser | typeof EMAIL): Promise<boolean> => {
    const phone = device(showing);
    return phone.wait(signedInAs(phone.home, who), 1_000).then(
      () => true,
      () => false,
    );
  };
  it('passes on the heading, a user ID and a session ID after a sign-up', async () => assert.equal(await passes(SIGNED_IN, EMAIL), true));
  it('does not pass on the heading of another address', async () => assert.equal(await passes({ ...SIGNED_IN, heading: 'Signed in as someone-else@example.com' }, EMAIL), false));
  it('does not pass on the heading on two nodes', async () => assert.equal(await passes({ ...SIGNED_IN, heading: [HEADING, HEADING] }, EMAIL), false));
  it('does not pass on the heading and a session ID with no user ID', async () => assert.equal(await passes({ ...SIGNED_IN, userId: null }, EMAIL), false));
  it('does not pass on the heading and a user ID with no session ID', async () => assert.equal(await passes({ ...SIGNED_IN, sessionId: null }, EMAIL), false));
  it('does not pass on an empty session ID', async () => assert.equal(await passes({ ...SIGNED_IN, sessionId: '' }, EMAIL), false));
  it('does not pass on two session IDs', async () => assert.equal(await passes({ ...SIGNED_IN, sessionId: ['sess_1', 'sess_2'] }, EMAIL), false));
  it('passes on the ID of the seeded user', async () => assert.equal(await passes({ ...SIGNED_IN, userId: SEEDED.id }, SEEDED), true));
  it('does not pass on the ID of another user than the seeded one', async () => assert.equal(await passes(SIGNED_IN, SEEDED), false));

  it('names every value the home shows when it fails on one of them', async () => {
    const phone = device(SIGNED_IN);
    const message = await failure(phone.wait(signedInAs(phone.home, SEEDED), 1_000));
    assert.ok(message.includes(`; the home shows "${HEADING}", user ID user_1, session ID sess_1; passes: `), message);
  });
});

describe('a wait for the home to show the user signed out', () => {
  it('passes on "Signed out" with no heading, user ID or session ID, in four captures', async () => {
    const phone = device(SIGNED_OUT);
    await phone.wait(signedOut(phone.home));
    assert.deepEqual(phone.reads, ['signed out', 'heading', 'user ID', 'session ID']);
  });

  const stillShows = async (left: Partial<Showing>): Promise<string> => {
    const phone = device({ ...SIGNED_OUT, ...left });
    return failure(phone.wait(signedOut(phone.home), 1_000));
  };
  it('does not pass while the heading of a signed-in user is still on the home', async () => assert.match(await stillShows({ heading: 'left over' }), /within 1000ms/));
  it('does not pass while the userId of a signed-in user is still on the home', async () => assert.match(await stillShows({ userId: 'left over' }), /within 1000ms/));
  it('does not pass while the sessionId of a signed-in user is still on the home', async () => assert.match(await stillShows({ sessionId: 'left over' }), /within 1000ms/));

  it('names the user ID that is still on the home beside "Signed out"', async () => {
    const phone = device({ ...SIGNED_OUT, userId: 'user_1' });
    const message = await failure(phone.wait(signedOut(phone.home), 1_000));
    assert.ok(message.includes('; the home shows "Signed out", user ID user_1, session ID none; passes: '), message);
  });

  const unread = async (element: string): Promise<string> => {
    const phone = device(SIGNED_OUT, { unreadable: [element] });
    return failure(phone.wait(signedOut(phone.home), 1_000));
  };
  const saysUnread = (named: string): string => `; the home shows "Signed out"; unread: ${named} (${SNAPSHOT_FAILED}); passes: `;
  it('does not take a heading it could not read for one that is gone', async () => assert.ok((await unread('heading')).includes(saysUnread('the heading'))));
  it('does not take a user ID it could not read for one that is gone', async () => assert.ok((await unread('user ID')).includes(saysUnread('the user ID'))));
  it('does not take a session ID it could not read for one that is gone', async () => assert.ok((await unread('session ID')).includes(saysUnread('the session ID'))));
});

describe('a wait for a launch to land on a control', () => {
  it('passes once the control is on screen, in one capture', async () => {
    const phone = device(SIGNED_OUT);
    await phone.wait(onScreen(phone.signIn, 'the "Sign in" button'));
    assert.deepEqual(phone.reads, ['sign-in button']);
  });

  it('fails with what the home shows in its place', async () => {
    const phone = device(SIGNED_IN);
    const message = await failure(phone.wait(onScreen(phone.signIn, 'the "Sign in" button'), 1_000));
    assert.ok(message.includes(`within 1000ms; the home shows "${HEADING}", user ID user_1, session ID sess_1; passes: `), message);
  });

  it('reports the error of a control it could not read', async () => {
    const phone = device(SIGNED_OUT, { unreadable: ['sign-in button'] });
    const message = await failure(phone.wait(onScreen(phone.signIn, 'the "Sign in" button'), 1_000));
    assert.ok(message.includes(`; the home shows "Signed out"; unread: the "Sign in" button (${SNAPSHOT_FAILED}); passes: `), message);
  });

  it('reads a control that is part of the home once in its last pass, so the message cannot show a heading the verdict did not see', async () => {
    const phone = device(ELSEWHERE, {
      afterRead: (read, show) => {
        if (read === 1) show(SIGNED_IN);
      },
    });
    const message = await failure(phone.wait(onScreen(phone.home.signedIn, 'the heading'), 0));
    assert.ok(message.includes('within 0ms; the home shows user ID user_1, session ID sess_1; passes: 1; '), message);
    assert.deepEqual(phone.reads, ['heading', 'user ID', 'session ID', 'signed out', 'in the way']);
  });
});

describe('the selector that reads the error screen and the save-password prompt in one capture', () => {
  it('names the error screen first, so the prompt is read only when the app shows no error screen', () => {
    assert.equal(errorScreenElseSavePasswordPrompt('e2e.launch.error'), 'id="e2e.launch.error" || label="Save Password?"');
  });
});
