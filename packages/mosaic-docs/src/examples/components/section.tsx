'use client';

import { Button } from '@clerk/mosaic/components/button';
import { Icon } from '@clerk/mosaic/components/icon';
import { Section } from '@clerk/mosaic/components/section';
import { SecurityLockSquare } from '@clerk/mosaic/icons/glyphs/security-lock-square';

export default function SectionExample() {
  return (
    <Section.Root>
      <Section.Group>
        <Section.Header>
          <Section.Title>Profile</Section.Title>
        </Section.Header>
        <Section.Body>
          <Section.Row>
            <Section.Item>
              <Section.Content>
                <Section.Label>Name</Section.Label>
                <Section.Description>Ada Lovelace</Section.Description>
              </Section.Content>
              <Section.Actions>
                <Button
                  variant='outline'
                  color='neutral'
                >
                  Edit
                </Button>
              </Section.Actions>
            </Section.Item>
          </Section.Row>
          <Section.Row>
            <Section.Item>
              <Section.Content>
                <Section.Label>Email address</Section.Label>
                <Section.Description>ada@example.com</Section.Description>
              </Section.Content>
              <Section.Note icon={<Icon glyph={SecurityLockSquare} />}>Managed by your organization</Section.Note>
            </Section.Item>
          </Section.Row>
        </Section.Body>
      </Section.Group>
    </Section.Root>
  );
}
