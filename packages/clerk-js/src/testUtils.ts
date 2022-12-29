// eslint-disable-next-line no-restricted-imports
import { matchers } from '@emotion/jest';
import { render as _render, RenderOptions } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import React from 'react';

expect.extend(matchers);

const render = (ui: React.ReactElement, options?: RenderOptions) => {
  const userEvent = UserEvent.setup({ delay: null });
  return { ..._render(ui, { ...options }), userEvent };
};

export * from './ui/utils/test/runFakeTimers';
export * from './ui/utils/test/createFixtures';
export * from '@testing-library/react';
export { render };
