import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { AuthPasswordChecklist } from '../auth-password-checklist';

afterEach(() => cleanup());

const rules = [
  { id: 'length', label: 'At least 8 characters', met: true },
  { id: 'number', label: 'A number', met: false },
];

describe('AuthPasswordChecklist', () => {
  it('lists every rule and says which ones are met', () => {
    render(
      <AuthPasswordChecklist
        rules={rules}
        showMissed={false}
        metLabel='Done'
      />,
    );

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('At least 8 characters');
    expect(items[0]).toHaveTextContent('Done');
    expect(items[1]).toHaveTextContent('A number');
    expect(items[1]).not.toHaveTextContent('Done');
  });
});
