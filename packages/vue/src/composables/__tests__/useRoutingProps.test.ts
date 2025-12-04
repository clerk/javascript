import { render } from '@testing-library/vue';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { defineComponent, h } from 'vue';

import { useRoutingProps } from '../useRoutingProps';

const originalError = console.error;

describe('useRoutingProps()', () => {
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  test('defaults to path routing and a path prop is required', () => {
    const TestingComponent = defineComponent(props => {
      const options = useRoutingProps('TestingComponent', props);
      return () => h('div', JSON.stringify(options.value));
    });

    expect(() => {
      render(TestingComponent);
    }).toThrowError(/@clerk\/vue: The <TestingComponent\/> component uses path-based routing by default/);
  });

  test('the path option is ignored when "hash" routing prop', () => {
    const TestingComponent = defineComponent(props => {
      const options = useRoutingProps('TestingComponent', props, () => ({ path: '/path-option' }));
      return () => h('div', JSON.stringify(options.value));
    });

    const { baseElement } = render(TestingComponent, {
      props: {
        routing: 'hash',
        prop1: '1',
        prop2: '2',
      },
    });
    expect(baseElement).toMatchSnapshot();
  });

  test('the path option is ignored when "virtual" routing prop', () => {
    const TestingComponent = defineComponent(props => {
      const options = useRoutingProps('TestingComponent', props, () => ({ path: '/path-option' }));
      return () => h('div', JSON.stringify(options.value));
    });

    const { baseElement } = render(TestingComponent, {
      props: {
        routing: 'virtual',
        prop1: '1',
        prop2: '2',
      },
    });
    expect(baseElement).toMatchSnapshot();
  });

  test('throws error when "hash" routing and path prop are set', () => {
    const TestingComponent = defineComponent({
      props: ['routing', 'path'],
      setup(props) {
        const options = useRoutingProps('TestingComponent', props);
        return () => h('div', JSON.stringify(options.value));
      },
    });

    expect(() => {
      render(TestingComponent, {
        props: {
          routing: 'hash',
          path: '/path-prop',
        },
      });
    }).toThrowError(
      /@clerk\/vue: The `path` prop will only be respected when the Clerk component uses path-based routing/,
    );
  });

  test('throws error when "virtual" routing and path prop are set', () => {
    const TestingComponent = defineComponent({
      props: ['routing', 'path'],
      setup(props) {
        const options = useRoutingProps('TestingComponent', props);
        return () => h('div', JSON.stringify(options.value));
      },
    });

    expect(() => {
      render(TestingComponent, {
        props: {
          routing: 'virtual',
          path: '/path',
        },
      });
    }).toThrowError(
      /@clerk\/vue: The `path` prop will only be respected when the Clerk component uses path-based routing/,
    );
  });

  test('path prop has priority over path option', () => {
    const TestingComponent = defineComponent(props => {
      const options = useRoutingProps('TestingComponent', props, () => ({ path: '/path-option' }));
      return () => h('div', JSON.stringify(options.value));
    });

    const { baseElement } = render(TestingComponent, {
      props: {
        path: '/path-prop',
        prop1: '1',
        prop2: '2',
      },
    });
    expect(baseElement).toMatchSnapshot();
  });
});
