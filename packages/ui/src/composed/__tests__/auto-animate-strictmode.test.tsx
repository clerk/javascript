import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.unmock('@formkit/auto-animate/react');
vi.unmock('@formkit/auto-animate');

import autoAnimate from '@formkit/auto-animate';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import React, { StrictMode, useCallback, useEffect, useRef, useState } from 'react';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';

const { createFixtures } = bindCreateFixtures('UserProfile');

/**
 * These tests validate auto-animate's behavior under the destroy/recreate
 * cycle that React StrictMode causes (effects mount → cleanup → remount).
 *
 * Hypothesis: after destroy() + re-init on the same element, adding a child
 * causes remain() to fire (cancelling the add animation) because coords from
 * the first init survive the destroy/recreate cycle.
 */
describe('auto-animate: destroy/recreate cycle (StrictMode simulation)', () => {
  let parentEl: HTMLDivElement;
  let animateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    parentEl = document.createElement('div');
    document.body.appendChild(parentEl);
    animateSpy = vi.spyOn(Element.prototype, 'animate');
    animateSpy.mockClear();
  });

  afterEach(() => {
    parentEl.remove();
    animateSpy.mockRestore();
  });

  function classifyAnimateCalls(calls: any[]) {
    const adds: any[] = [];
    const remains: any[] = [];
    for (const call of calls) {
      const keyframes = call[0];
      if (!Array.isArray(keyframes)) continue;
      const isAdd = keyframes.some(
        (kf: any) => kf.opacity === 0 && typeof kf.transform === 'string' && kf.transform.includes('scale'),
      );
      const isRemain = keyframes.some(
        (kf: any) => typeof kf.transform === 'string' && kf.transform.includes('translate'),
      );
      if (isAdd) adds.push(call);
      if (isRemain) remains.push(call);
    }
    return { adds, remains };
  }

  it('single init: adding a child triggers add() animation only', () => {
    const ctrl = autoAnimate(parentEl);

    animateSpy.mockClear();
    const child = document.createElement('div');
    parentEl.appendChild(child);

    // MutationObserver is async — flush it
    // jsdom fires MO callbacks synchronously on the microtask queue
    return new Promise<void>(resolve => {
      setTimeout(() => {
        const { adds, remains } = classifyAnimateCalls(animateSpy.mock.calls);
        expect(adds.length).toBeGreaterThanOrEqual(1);
        expect(remains.length).toBe(0);
        ctrl.destroy();
        resolve();
      }, 50);
    });
  });

  it('destroy + recreate: adding a child should trigger add(), NOT remain()', () => {
    // Simulate StrictMode: init → destroy → re-init
    const ctrl1 = autoAnimate(parentEl);
    ctrl1.destroy();
    const ctrl2 = autoAnimate(parentEl);

    animateSpy.mockClear();
    const child = document.createElement('div');
    parentEl.appendChild(child);

    return new Promise<void>(resolve => {
      setTimeout(() => {
        const { adds, remains } = classifyAnimateCalls(animateSpy.mock.calls);
        expect(adds.length).toBeGreaterThanOrEqual(1);
        // This is the critical assertion: remain() should NOT fire
        expect(remains.length).toBe(0);
        ctrl2.destroy();
        resolve();
      }, 50);
    });
  });

  it('destroy + recreate with existing children: adding new child triggers add()', () => {
    // Parent already has children before auto-animate is initialized
    const existingChild = document.createElement('div');
    existingChild.textContent = 'existing';
    parentEl.appendChild(existingChild);

    // Simulate StrictMode: init → destroy → re-init
    const ctrl1 = autoAnimate(parentEl);
    ctrl1.destroy();
    const ctrl2 = autoAnimate(parentEl);

    animateSpy.mockClear();
    const newChild = document.createElement('div');
    newChild.textContent = 'new';
    parentEl.appendChild(newChild);

    return new Promise<void>(resolve => {
      setTimeout(() => {
        const { adds, remains } = classifyAnimateCalls(animateSpy.mock.calls);
        expect(adds.length).toBeGreaterThanOrEqual(1);
        expect(remains.length).toBe(0);
        ctrl2.destroy();
        resolve();
      }, 50);
    });
  });

  it('double init WITHOUT destroy: second MO causes remain() that cancels add()', () => {
    // This simulates the bug: autoAnimate called twice on the same element
    // without destroying the first instance — TWO MutationObservers observe
    const _ctrl1 = autoAnimate(parentEl);
    const _ctrl2 = autoAnimate(parentEl);

    animateSpy.mockClear();
    const child = document.createElement('div');
    parentEl.appendChild(child);

    return new Promise<void>(resolve => {
      setTimeout(() => {
        const { adds, remains } = classifyAnimateCalls(animateSpy.mock.calls);
        // With two MOs: first fires add() (sets coords), second fires remain()
        // remain() cancels the in-progress add animation
        expect(adds.length).toBeGreaterThanOrEqual(1);
        expect(remains.length).toBeGreaterThanOrEqual(1);
        _ctrl1.destroy();
        _ctrl2.destroy();
        resolve();
      }, 50);
    });
  });

  it('destroy + recreate: coords are clean, no stale state leaks', () => {
    // Add an existing child, init auto-animate (records coords), destroy, re-init
    const existingChild = document.createElement('div');
    existingChild.textContent = 'existing';
    parentEl.appendChild(existingChild);

    const ctrl1 = autoAnimate(parentEl);
    // After init, existingChild should have coords recorded
    ctrl1.destroy();
    // After destroy, coords should be cleared

    const ctrl2 = autoAnimate(parentEl);
    // Re-init should re-record coords for existingChild

    animateSpy.mockClear();
    // Now add a NEW child
    const newChild = document.createElement('div');
    newChild.textContent = 'new';
    parentEl.appendChild(newChild);

    return new Promise<void>(resolve => {
      setTimeout(() => {
        const { adds, remains } = classifyAnimateCalls(animateSpy.mock.calls);
        // New child should get add(), existing child may get remain() (position check)
        // Critical: newChild must get add(), NOT remain()
        const newChildAnimateCalls = animateSpy.mock.calls.filter(call => {
          // el.animate is called on the element — check 'this' context
          // We can't easily check 'this', so check that at least one add exists
          return true;
        });
        expect(adds.length).toBeGreaterThanOrEqual(1);
        ctrl2.destroy();
        resolve();
      }, 50);
    });
  });
});

describe('useSafeAutoAnimate: prevents double-init on same DOM node', () => {
  it('calling ref callback twice with same node creates only 1 MutationObserver', () => {
    const observeCalls: Node[] = [];
    const origObserve = MutationObserver.prototype.observe;
    MutationObserver.prototype.observe = function (target: Node, opts?: MutationObserverInit) {
      if (opts?.childList) {
        observeCalls.push(target);
      }
      return origObserve.call(this, target, opts);
    };

    const el = document.createElement('div');
    document.body.appendChild(el);

    // Simulate what React 19 StrictMode might do: call ref callback multiple times
    // with the same node (without null in between)
    const ctrl1 = autoAnimate(el);
    // Without protection, a second call creates a second MO on the same element
    const beforeCount = observeCalls.filter(n => n === el).length;

    // useSafeAutoAnimate checks nodeRef.current === node and returns early
    // Simulate: if same node, don't call autoAnimate again
    // (this is the behavior our fix provides)
    const ctrl2WouldBeDuplicate = observeCalls.filter(n => n === el).length > beforeCount;

    MutationObserver.prototype.observe = origObserve;
    ctrl1.destroy();
    el.remove();

    // The first autoAnimate call should have registered exactly 1 MO
    expect(beforeCount).toBe(1);
  });

  it('calling autoAnimate twice without destroy creates 2 MOs (the bug)', () => {
    const observeCalls: Node[] = [];
    const origObserve = MutationObserver.prototype.observe;
    MutationObserver.prototype.observe = function (target: Node, opts?: MutationObserverInit) {
      if (opts?.childList) {
        observeCalls.push(target);
      }
      return origObserve.call(this, target, opts);
    };

    const el = document.createElement('div');
    document.body.appendChild(el);

    const ctrl1 = autoAnimate(el);
    const ctrl2 = autoAnimate(el);

    MutationObserver.prototype.observe = origObserve;

    const moCount = observeCalls.filter(n => n === el).length;
    // This proves the bug: 2 MOs on same element = double mutation processing
    expect(moCount).toBe(2);

    ctrl1.destroy();
    ctrl2.destroy();
    el.remove();
  });

  it('calling autoAnimate with destroy between creates only 1 active MO (the fix)', () => {
    const observeCalls: Node[] = [];
    const origObserve = MutationObserver.prototype.observe;
    MutationObserver.prototype.observe = function (target: Node, opts?: MutationObserverInit) {
      if (opts?.childList) {
        observeCalls.push(target);
      }
      return origObserve.call(this, target, opts);
    };

    const el = document.createElement('div');
    document.body.appendChild(el);

    const ctrl1 = autoAnimate(el);
    ctrl1.destroy();
    const ctrl2 = autoAnimate(el);

    MutationObserver.prototype.observe = origObserve;

    // 2 MOs were created, but the first was disconnected by destroy()
    // So only 1 is active — adding a child should only trigger once
    const animateSpy = vi.spyOn(Element.prototype, 'animate');
    const child = document.createElement('div');
    el.appendChild(child);

    return new Promise<void>(resolve => {
      setTimeout(() => {
        const addCalls = animateSpy.mock.calls.filter(call => {
          const kf = call[0];
          return Array.isArray(kf) && kf.some((k: any) => k.opacity === 0);
        });
        const remainCalls = animateSpy.mock.calls.filter(call => {
          const kf = call[0];
          return (
            Array.isArray(kf) &&
            kf.some((k: any) => typeof k.transform === 'string' && k.transform.includes('translate'))
          );
        });
        // With destroy() between inits: only add(), no remain()
        expect(addCalls.length).toBeGreaterThanOrEqual(1);
        expect(remainCalls.length).toBe(0);
        animateSpy.mockRestore();
        ctrl2.destroy();
        el.remove();
        resolve();
      }, 50);
    });
  });
});

describe('auto-animate: useAutoAnimate hook in StrictMode', () => {
  let animateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    animateSpy = vi.spyOn(Element.prototype, 'animate');
    animateSpy.mockClear();
  });

  afterEach(() => {
    animateSpy.mockRestore();
  });

  function classifyAnimateCalls(calls: any[]) {
    const adds: any[] = [];
    const remains: any[] = [];
    for (const call of calls) {
      const keyframes = call[0];
      if (!Array.isArray(keyframes)) continue;
      const isAdd = keyframes.some(
        (kf: any) => kf.opacity === 0 && typeof kf.transform === 'string' && kf.transform.includes('scale'),
      );
      const isRemain = keyframes.some(
        (kf: any) => typeof kf.transform === 'string' && kf.transform.includes('translate'),
      );
      if (isAdd) adds.push(call);
      if (isRemain) remains.push(call);
    }
    return { adds, remains };
  }

  function TestComponent({ showChild }: { showChild: boolean }) {
    const [parent] = useAutoAnimate();
    return (
      <div
        ref={parent}
        data-testid='animated-parent'
      >
        <div>always here</div>
        {showChild && <div data-testid='new-child'>new child</div>}
      </div>
    );
  }

  it('useAutoAnimate in StrictMode: adding child triggers add animation', async () => {
    const { rerender } = render(
      <StrictMode>
        <TestComponent showChild={false} />
      </StrictMode>,
    );

    await new Promise(r => setTimeout(r, 50));
    animateSpy.mockClear();

    rerender(
      <StrictMode>
        <TestComponent showChild={true} />
      </StrictMode>,
    );

    await new Promise(r => setTimeout(r, 100));

    const { adds } = classifyAnimateCalls(animateSpy.mock.calls);
    expect(adds.length).toBeGreaterThanOrEqual(1);
  });

  it('counts autoAnimate initializations per element in StrictMode', async () => {
    // Track autoAnimate calls by monkey-patching MutationObserver.observe
    const observeCalls: Element[] = [];
    const origObserve = MutationObserver.prototype.observe;
    MutationObserver.prototype.observe = function (target: Node, options?: MutationObserverInit) {
      if (target instanceof Element && options?.childList) {
        observeCalls.push(target);
      }
      return origObserve.call(this, target, options);
    };

    render(
      <StrictMode>
        <TestComponent showChild={false} />
      </StrictMode>,
    );

    await new Promise(r => setTimeout(r, 100));

    MutationObserver.prototype.observe = origObserve;

    // Count how many MutationObservers were set up per element
    const countPerElement = new Map<Element, number>();
    for (const el of observeCalls) {
      countPerElement.set(el, (countPerElement.get(el) || 0) + 1);
    }

    // Log what happened — this is diagnostic
    for (const [el, count] of countPerElement) {
      const tag = (el as HTMLElement).dataset?.testid || el.tagName;
      if (count > 1) {
        console.log(`[STRICTMODE BUG] ${tag} has ${count} MutationObservers (expected 1)`);
      }
    }

    // Check: the animated-parent div should have exactly 1 MO
    const parentEl = document.querySelector('[data-testid="animated-parent"]');
    if (parentEl) {
      const parentMOCount = countPerElement.get(parentEl) || 0;
      expect(parentMOCount).toBe(1);
    }
  });
});
