import BigText from 'ink-big-text';
import Gradient from 'ink-gradient';
import React from 'react';

export function Header() {
  return (
    <Gradient name='vice'>
      <BigText
        text='Clerk Upgrade'
        font='tiny'
      />
    </Gradient>
  );
}
