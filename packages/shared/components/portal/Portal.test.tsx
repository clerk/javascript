import * as React from 'react';
import { Portal } from './Portal';
import { render, screen } from '@clerk/shared/testUtils';

describe('<Portal/>', () => {
  it('injects the portal to DOM and renders its children', () => {
    const { baseElement } = render(
      <Portal className="bar">
        <div>Foo</div>
      </Portal>
    );
    expect(screen.getByText('Foo')).toBeInTheDocument();
    expect(baseElement.querySelector('div.bar')).toBeTruthy();
  });
});
