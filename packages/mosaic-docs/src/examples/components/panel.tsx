'use client';

import { Button } from '@clerk/mosaic/components/button';
import { Panel } from '@clerk/mosaic/components/panel';
import { Section } from '@clerk/mosaic/components/section';

export default function PanelExample() {
  return (
    <Panel.Root>
      <Panel.Title>Account</Panel.Title>
      <Panel.Sections>
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
            </Section.Body>
          </Section.Group>
        </Section.Root>
      </Panel.Sections>
    </Panel.Root>
  );
}
