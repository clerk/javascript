import { render } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';

import { UNSAFE_PortalProvider } from '../../components/PortalProvider';
import { usePortalRoot } from '../usePortalRoot';

describe('usePortalRoot', () => {
  it('returns getContainer from context when inside PortalProvider', () => {
    const container = document.createElement('div');
    const getContainer = () => container;

    const TestComponent = defineComponent({
      setup() {
        const portalRoot = usePortalRoot();
        return () => h('div', { 'data-testid': 'test' }, portalRoot() === container ? 'found' : 'not-found');
      },
    });

    const { getByTestId } = render(h(UNSAFE_PortalProvider, { getContainer }, () => h(TestComponent)));

    expect(getByTestId('test').textContent).toBe('found');
  });

  it('returns a function that returns null when outside PortalProvider', () => {
    const TestComponent = defineComponent({
      setup() {
        const portalRoot = usePortalRoot();
        return () => h('div', { 'data-testid': 'test' }, portalRoot() === null ? 'null' : 'not-null');
      },
    });

    const { getByTestId } = render(TestComponent);

    expect(getByTestId('test').textContent).toBe('null');
  });

  it('only affects components within the provider', () => {
    const container = document.createElement('div');
    const getContainer = () => container;

    const InsideComponent = defineComponent({
      setup() {
        const portalRoot = usePortalRoot();
        return () => h('div', { 'data-testid': 'inside' }, portalRoot() === container ? 'container' : 'null');
      },
    });

    const OutsideComponent = defineComponent({
      setup() {
        const portalRoot = usePortalRoot();
        return () => h('div', { 'data-testid': 'outside' }, portalRoot() === null ? 'null' : 'container');
      },
    });

    const { getByTestId } = render({
      components: { InsideComponent, OutsideComponent, UNSAFE_PortalProvider },
      template: `
        <OutsideComponent />
        <UNSAFE_PortalProvider :getContainer="getContainer">
          <InsideComponent />
        </UNSAFE_PortalProvider>
      `,
      setup() {
        return { getContainer };
      },
    });

    expect(getByTestId('inside').textContent).toBe('container');
    expect(getByTestId('outside').textContent).toBe('null');
  });

  it('supports nested providers with innermost taking precedence', () => {
    const outerContainer = document.createElement('div');
    const innerContainer = document.createElement('div');

    const TestComponent = defineComponent({
      setup() {
        const portalRoot = usePortalRoot();
        return () => h('div', { 'data-testid': 'test' }, portalRoot() === innerContainer ? 'inner' : 'outer');
      },
    });

    const { getByTestId } = render({
      components: { TestComponent, UNSAFE_PortalProvider },
      template: `
        <UNSAFE_PortalProvider :getContainer="() => outerContainer">
          <UNSAFE_PortalProvider :getContainer="() => innerContainer">
            <TestComponent />
          </UNSAFE_PortalProvider>
        </UNSAFE_PortalProvider>
      `,
      setup() {
        return { outerContainer, innerContainer };
      },
    });

    expect(getByTestId('test').textContent).toBe('inner');
  });
});
