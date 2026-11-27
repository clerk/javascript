'use client';

import { Button } from '@clerk/mosaic/components/button';
import { Card } from '@clerk/mosaic/components/card';
import { Popover } from '@clerk/mosaic/components/popover';
import { Text } from '@clerk/mosaic/components/text';

export default function PopoverExample() {
  return (
    <Popover.Root placement='bottom'>
      <Popover.Trigger
        render={props => (
          <Button
            {...props}
            variant='outline'
            color='neutral'
          />
        )}
      >
        What’s a passkey?
      </Popover.Trigger>
      <Popover.Popup
        size='sm'
        aria-label='Passkeys'
      >
        <Card.Root renderBranding={false}>
          <Card.Header>
            <Card.Title>Passkeys</Card.Title>
            <Card.Description>Sign in with your fingerprint, face or screen lock.</Card.Description>
          </Card.Header>
          <Card.Content>
            <Text color='foreground-secondary'>They’re stored on your device and can’t be phished.</Text>
          </Card.Content>
          <Card.Footer>
            <Popover.Close render={props => <Button {...props} />}>Got it</Popover.Close>
          </Card.Footer>
        </Card.Root>
      </Popover.Popup>
    </Popover.Root>
  );
}
