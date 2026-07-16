import { expect, test } from '@playwright/test';

const PORT = process.env.PORT || 4011;
const HOST = `http://localhost:${PORT}`;

type ProbeEvent = { type: string; visibility: string; hasFocus: boolean; t: number };

/**
 * Real-browser proof of the browser facts behind the embedded-app (e.g. Replit preview) session-refresh
 * bug. clerk-js historically refreshed the session cookie only on the window `focus` event and gated the
 * cookie write on `document.hasFocus()`. Both assume a top-level browsing context. This test demonstrates,
 * in real Chromium, why that fails for a Clerk app running inside a cross-origin iframe:
 *
 *   - a VISIBLE cross-origin iframe reports `document.hasFocus() === false`
 *   - focusing the parent document never delivers a `focus` event to the iframe (it stays unfocused)
 *   - the iframe only receives `focus` when it is explicitly focused (clicked into)
 *
 * So an embedded app is "visible but unfocused" essentially all the time, which is exactly why the
 * focus-only refresh never runs and the `!document.hasFocus()` write-gate blocks it. The fix adds a
 * `visibilitychange` trigger (which does propagate into the iframe) and lets a visible cross-origin
 * iframe write the cookie. clerk-js's response to `visibilitychange` is covered by the AuthCookieService
 * unit test; here we verify the browser semantics the fix relies on.
 */
test.describe('cross-origin iframe focus semantics @iframe', () => {
  test('a visible cross-origin iframe is unfocused and only receives focus when explicitly focused', async ({
    page,
  }) => {
    await page.goto(`${HOST}/iframe-host.html?framePath=/iframe-probe.html`);

    const handle = await page.waitForSelector('#f');
    const frame = await handle.contentFrame();
    if (!frame) {
      throw new Error('iframe contentFrame() was null');
    }

    await frame.waitForFunction(() => Array.isArray((window as any).__events));

    // We are genuinely cross-origin: parent on localhost, iframe on 127.0.0.1.
    expect(page.url()).toContain('localhost');
    expect(frame.url()).toContain('127.0.0.1');

    const liveState = () => frame.evaluate(() => ({ vis: document.visibilityState, hasFocus: document.hasFocus() }));
    const events = () => frame.evaluate(() => (window as any).__events as ProbeEvent[]);

    // 1) The iframe is visible but does NOT have focus.
    const initial = await liveState();
    expect(initial.vis).toBe('visible');
    expect(initial.hasFocus).toBe(false);

    // 2) Focusing an element in the PARENT document does not focus the iframe.
    await page.evaluate(() => {
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();
    });
    const afterParentFocus = await liveState();
    expect(afterParentFocus.vis).toBe('visible');
    expect(afterParentFocus.hasFocus).toBe(false);
    expect((await events()).some(e => e.type === 'window.focus')).toBe(false);

    // 3) Explicitly focusing into the iframe (a real click) delivers `focus` and flips hasFocus.
    await handle.click();
    await frame.waitForFunction(() => (window as any).__events.some((e: ProbeEvent) => e.type === 'window.focus'));
    const afterIframeFocus = await liveState();
    expect(afterIframeFocus.hasFocus).toBe(true);
  });
});
