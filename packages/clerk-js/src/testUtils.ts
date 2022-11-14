import { render as _render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

const render = (ui: React.ReactElement, options?: RenderOptions) => {
  const user = userEvent.setup();
  return { ..._render(ui, options), user };
};

export * from './ui/utils/test/createFixture';
export * from '@testing-library/react';
export { render };
