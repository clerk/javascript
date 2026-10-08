import { onceTheRunnerIsFree, type BusyWait } from './busy-runner.ts';
import { tapOnceUncovered } from './tapping.ts';
import { typeConfirmed } from './typing.ts';
import type { Platform } from './types.ts';

interface Frame {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface FieldNode {
  inputValue(): Promise<string>;
  boundingBox(): Promise<Frame | null>;
}

export interface NamedField {
  tap(options: { readonly timeout: number }): Promise<void>;
  all(): Promise<readonly FieldNode[]>;
}

export interface FocusedInput extends FieldNode {
  count(): Promise<number>;
  tap(options: { readonly timeout: number }): Promise<void>;
}

export interface FillDevice {
  readonly platform: Platform;
  readonly focused: FocusedInput;
  readonly texts: { allTextContents(): Promise<readonly string[]> };
  type(command: readonly [string, ...string[]]): Promise<void>;
}

export interface FillPace {
  readonly tapTimeoutMs: number;
  readonly reads: number;
  now(): number;
  wait(): Promise<unknown>;
}

export async function fillField(field: NamedField, text: string, device: FillDevice, pace: FillPace, busy: BusyWait): Promise<void> {
  const { focused } = device;
  const tap = (): Promise<void> => tapOnceUncovered(() => field.tap({ timeout: pace.tapTimeoutMs }), { timeoutMs: pace.tapTimeoutMs, now: pace.now, wait: pace.wait }, busy);
  await tap();
  const read = <T>(reading: () => Promise<T>, unreadable: T): Promise<T> => onceTheRunnerIsFree(reading, busy).catch(() => unreadable);
  const frame = (): Promise<Frame | null> => read(async () => ((await focused.count()) === 1 ? await focused.boundingBox() : null), null);
  const wordsShown = (): Promise<readonly string[] | null> => read(async () => (await device.texts.allTextContents()).map((text) => text.replace(/\P{L}+/gu, '')), null);
  const input = await frame();
  const wordsBeforeTyping = await wordsShown();
  let namedInput: FieldNode | null = null;
  await typeConfirmed(
    {
      type: (value) => device.type(['type', value]),
      async valueIfReadable() {
        const now = await frame();
        if (input === null || now === null || now.x !== input.x || now.y !== input.y || now.width !== input.width || now.height !== input.height) return null;
        const value = await read(() => focused.inputValue(), null);
        if (value !== '') return value;
        const words = await wordsShown();
        return wordsBeforeTyping !== null && words !== null && words.every((shown) => wordsBeforeTyping.includes(shown)) ? '' : null;
      },
      valuesOfTheNamedNodes: () =>
        read(async () => {
          const values: string[] = [];
          for (const node of await field.all()) {
            const value = await node.inputValue();
            if (value !== '') namedInput = node;
            values.push(value);
          }
          return values;
        }, []),
      refocus: () => onceTheRunnerIsFree(() => focused.tap({ timeout: pace.tapTimeoutMs }), busy),
      tapAgain: tap,
      async replace(value) {
        const box = input ?? (await namedInput?.boundingBox().catch(() => null)) ?? null;
        if (box !== null) await device.type(['fill', String(Math.round(box.x + box.width / 2)), String(Math.round(box.y + box.height / 2)), value]);
      },
      ...(device.platform === 'android' ? { nothingFocused: async () => (await focused.count()) !== 1 } : {}),
    },
    text,
    { reads: pace.reads, wait: pace.wait },
    busy,
  );
}
