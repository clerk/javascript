import React from 'react';
import renderer from 'react-test-renderer';
import { render, RenderOptions } from '@testing-library/react';
import { noop } from '../utils';
import '@testing-library/jest-dom/extend-expect';

// Wrap components with test providers
const customRender = (ui: React.ReactElement, options?: RenderOptions) => {
  return render(ui, options);
};

// To be used for structural snapshot testing
const renderJSON = (c: React.ReactElement) => renderer.create(c).toJSON();

// To be used for structural snapshot testing after the first rerender on mount
const renderJSONAfterFirstAct = (c: React.ReactElement) => {
  let root;

  renderer.act(() => {
    root = renderer.create(c);
  });

  // @ts-ignore
  return root.toJSON();
};

// Re-export everything
export * from '@testing-library/react';
export { act as actHook, renderHook } from '@testing-library/react-hooks';
export { default as userEvent } from '@testing-library/user-event';
export { mocked } from 'ts-jest/utils';

// Override render method
export { customRender as render, renderJSON, renderJSONAfterFirstAct, noop };
