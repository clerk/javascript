'use client';

import { Button } from '@clerk/mosaic/components/button';
import { Card } from '@clerk/mosaic/components/card';

export default function CardExample() {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>Delete organization</Card.Title>
        <Card.Description>This removes every member and can’t be undone.</Card.Description>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        We couldn’t delete the organization. Try again.
      </Card.Banner>
      <Card.Footer>
        <Button color='negative'>Delete organization</Button>
      </Card.Footer>
    </Card.Root>
  );
}
