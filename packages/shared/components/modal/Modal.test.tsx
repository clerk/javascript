import { fireEvent, render, screen } from '@clerk/shared/testUtils';
import * as React from 'react';

import { Modal } from './Modal';

describe('<Modal/>', () => {
  it('can open and close as an uncontrolled component', () => {
    const handleClose = jest.fn();

    render(
      <Modal
        trigger={<span>Open</span>}
        handleClose={handleClose}
      >
        <div>Foo</div>
        <Modal.CloseButton>
          <button>Close</button>
        </Modal.CloseButton>
      </Modal>,
    );

    expect(screen.queryByText('Foo')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByText('Foo')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByText('Foo')).not.toBeInTheDocument();
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('can open and close as a fully controlled component', () => {
    const handleClose = jest.fn();

    const { rerender } = render(
      <Modal
        active
        handleClose={handleClose}
      >
        <div>Foo</div>
      </Modal>,
    );
    expect(screen.queryByText('Foo')).toBeInTheDocument();

    rerender(
      <Modal handleClose={handleClose}>
        <div>Foo</div>
      </Modal>,
    );
    expect(screen.queryByText('Foo')).not.toBeInTheDocument();
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it.todo('can open and close via its instance methods');
});
