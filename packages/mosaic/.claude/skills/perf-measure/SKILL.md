---
name: perf-measure
description: Measure Mosaic UI performance in a real browser. Counts renders per component with react-scan in Swingset dev, and times interactions to the next frame in a production Swingset build at 4x CPU. Use when asked to measure, profile or check the performance of a component or interaction, or before and after a performance fix.
---

# Perf measure

One script, run against two Swingset servers:

- **Swingset dev** loads react-scan, so the script reports how many times each component renders per action. Trust these counts, not the times.
- **A production Swingset build** has no react-scan and runs React at full speed, so the script reports the time from each action to the next frame. Trust these times, not the counts.

No code changes are needed, so there is nothing to clean up.

## 1. Start the servers

```bash
pnpm run dev:swingset                              # dev on port 6006
```

For timing, build and serve production. Both write `packages/swingset/.next`, so stop the dev server first:

```bash
cd packages/swingset
pnpm build
pnpm exec next start -p 6021                       # run in the background
```

Swingset compiles Mosaic from source. Rebuild production after every code change, including when you switch between the before and after code.

## 2. Drive it

Write this script to the scratchpad, fill in the page and the actions, and run it from the repo root with `node <scratchpad>/perf.mjs <url>`.

```js
import { createRequire } from 'node:module';

const { chromium } = createRequire(`${process.cwd()}/package.json`)('@playwright/test');

const browser = await chromium.launch();
const page = await browser.newPage();
const cdp = await page.context().newCDPSession(page);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

await page.goto(process.argv[2], { waitUntil: 'networkidle' });
const scanning = await page.evaluate(() => {
  window.__perfRenders = {};
  window.__perfTime = action =>
    new Promise(resolve => {
      const start = performance.now();
      action();
      requestAnimationFrame(() => setTimeout(() => resolve(performance.now() - start)));
    });
  window.reactScan?.({
    showToolbar: false,
    animationSpeed: 'off',
    onRender: (_fiber, renders) => {
      for (const render of renders) {
        const name = render.componentName ?? 'Anonymous';
        window.__perfRenders[name] = (window.__perfRenders[name] ?? 0) + 1;
      }
    },
  });
  return Boolean(window.reactScan);
});
console.log(scanning ? 'dev: read the render counts' : 'production: read the times');

async function measure(label, action, { repeat = 5, arg } = {}) {
  const times = [];
  let renders = {};
  for (let i = 0; i < repeat; i++) {
    await page.evaluate(() => (window.__perfRenders = {}));
    times.push(await page.evaluate(action, arg));
    await page.waitForTimeout(300);
    renders = await page.evaluate(() => window.__perfRenders);
  }
  const sorted = [...times].sort((a, b) => a - b);
  console.log(label, `p50 ${Math.round(sorted[Math.floor(repeat / 2)])}ms`, `worst ${Math.round(sorted.at(-1))}ms`);
  if (scanning) {
    const top = Object.entries(renders)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    console.log('  renders per action:', Object.fromEntries(top));
  }
}

await measure('open', () => window.__perfTime(() => document.querySelector('button[aria-label^="Country"]').click()), {
  repeat: 1,
});
for (const key of ['ArrowDown', 'ArrowUp']) {
  await measure(
    key,
    key =>
      window.__perfTime(() =>
        document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true })),
      ),
    { arg: key },
  );
}

await browser.close();
```

- Each action runs inside the page and is timed from the event to the next frame, so Playwright's own round trips are not counted. Dispatch events in the page rather than using `page.click` or `page.hover`.
- An action that opens something runs once per page load (`repeat: 1`), or close it between runs.
- An action is sent to the page as source code, so it can't use variables from the script. Pass a value in with `arg`, as the key loop does.
- To check how cost scales with size, measure the same action on a story with more items.

## 3. Read it

| What you see                                                    | Meaning                                             | Act                                                        |
| --------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------- |
| p50 under 16ms                                                  | Fine                                                | Stop. Do not optimize.                                     |
| Over 16ms, and one action renders every item, or more with size | Every item reads state that changes on each action  | Have items subscribe to only their own slice of the state. |
| Over 16ms on open, and each item renders at least once          | Too much is mounted up front                        | Render less up front (virtualize, defer); memo won't help. |
| Over 16ms with few renders                                      | The cost is elsewhere (layout, a heavy calculation) | Record a trace in Chrome DevTools > Performance.           |

To see renders while you click around yourself, open Swingset dev: react-scan outlines each component as it renders, and its toolbar shows the FPS.

## 4. Compare before and after fairly

Run the base code first, then the change, with the same server, CPU rate, page, actions and repeat count. After starting a server, run the script once and discard it, because the first page load is cold. Then run it at least 3 times on each side. Never compare numbers from different scripts or different runs of a larger sweep.

## 5. Report it

Give the result as a before and after table, one row per action for the time and one for the render count of the component that changed, with every run's p50:

| Action                             | Base           | Change        |
| ---------------------------------- | -------------- | ------------- |
| ArrowDown p50 (4x CPU)             | 20 / 23 / 21ms | 10 / 10 / 9ms |
| ArrowDown `ComboboxOption` renders | 476            | 2             |

Head the columns with the base and the change branch names. Under the table, add one line in this form and nothing more:

```text
Swingset `/components/phone-input`, open then ArrowDown and ArrowUp ×5, 4x CPU, 3 runs each, measured with the `perf-measure` skill.
```

When the change is in a pull request, put the table and that line in the description section of the PR, and give the same in chat.
