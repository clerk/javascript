import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { WizardStepConfig } from '../types';
import { Wizard } from '../Wizard';
import { useWizard } from '../WizardContext';

const NavButtons = (): JSX.Element => {
  const { goNext, goPrev, current } = useWizard();
  return (
    <div>
      <span data-testid='current'>{current}</span>
      <button
        type='button'
        onClick={() => goPrev()}
      >
        prev
      </button>
      <button
        type='button'
        onClick={() => goNext()}
      >
        next
      </button>
    </div>
  );
};

describe('<Wizard> + <Wizard.Match>', () => {
  it('renders only the active step body and advances on goNext', () => {
    const steps: WizardStepConfig[] = [{ id: 'a' }, { id: 'b', isReachable: () => true }];

    render(
      <Wizard
        steps={steps}
        initialStepId='a'
      >
        <NavButtons />
        <Wizard.Match id='a'>
          <div>body-a</div>
        </Wizard.Match>
        <Wizard.Match id='b'>
          <div>body-b</div>
        </Wizard.Match>
      </Wizard>,
    );

    expect(screen.getByText('body-a')).toBeInTheDocument();
    expect(screen.queryByText('body-b')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('next'));

    expect(screen.getByText('body-b')).toBeInTheDocument();
    expect(screen.queryByText('body-a')).not.toBeInTheDocument();
    expect(screen.getByTestId('current')).toHaveTextContent('b');
  });

  it('a nested sub-flow terminal goNext advances the PARENT wizard', () => {
    const outer: WizardStepConfig[] = [{ id: 'outer-1' }, { id: 'outer-2', isReachable: () => true }];
    // Single inner step => inner is immediately terminal; its goNext bubbles.
    const inner: WizardStepConfig[] = [{ id: 'inner-only' }];

    const InnerNext = (): JSX.Element => {
      const { goNext } = useWizard();
      return (
        <button
          type='button'
          onClick={() => goNext()}
        >
          inner-next
        </button>
      );
    };

    render(
      <Wizard
        steps={outer}
        initialStepId='outer-1'
      >
        <Wizard.Match id='outer-1'>
          <div>outer-1-body</div>
          <Wizard steps={inner}>
            <InnerNext />
          </Wizard>
        </Wizard.Match>
        <Wizard.Match id='outer-2'>
          <div>outer-2-body</div>
        </Wizard.Match>
      </Wizard>,
    );

    expect(screen.getByText('outer-1-body')).toBeInTheDocument();

    // Inner terminal goNext bubbles to the outer wizard, which advances to outer-2.
    fireEvent.click(screen.getByText('inner-next'));

    expect(screen.getByText('outer-2-body')).toBeInTheDocument();
    expect(screen.queryByText('outer-1-body')).not.toBeInTheDocument();
  });

  it('a guard-blocked top-level goNext is a hard stop (no advance)', () => {
    const steps: WizardStepConfig[] = [{ id: 'a' }, { id: 'b', isReachable: () => false }];

    render(
      <Wizard
        steps={steps}
        initialStepId='a'
      >
        <NavButtons />
        <Wizard.Match id='a'>
          <div>body-a</div>
        </Wizard.Match>
        <Wizard.Match id='b'>
          <div>body-b</div>
        </Wizard.Match>
      </Wizard>,
    );

    fireEvent.click(screen.getByText('next'));

    expect(screen.getByText('body-a')).toBeInTheDocument();
    expect(screen.queryByText('body-b')).not.toBeInTheDocument();
    expect(screen.getByTestId('current')).toHaveTextContent('a');
  });
});
