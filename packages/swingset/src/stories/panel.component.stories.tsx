import { Button } from '@clerk/mosaic/components/button';
import { Panel } from '@clerk/mosaic/components/panel';
import { Section } from '@clerk/mosaic/components/section';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './panel.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'wip',
  title: 'Panel',
  source: 'packages/mosaic/src/components/panel/panel.tsx',
};

const sections = [
  { title: 'Email addresses', label: 'preston@clerk.dev', description: 'Primary' },
  { title: 'Phone numbers', label: '+1 (555) 010-0199', description: 'Used for sign-in' },
];

export function Default() {
  return (
    <Panel.Root>
      <Panel.Title>Account</Panel.Title>
      <Panel.Sections>
        {sections.map(section => (
          <Section.Root key={section.title}>
            <Section.Title>{section.title}</Section.Title>
            <Section.Group>
              <Section.Row>
                <Section.Item>
                  <Section.Content>
                    <Section.Label>{section.label}</Section.Label>
                    <Section.Description>{section.description}</Section.Description>
                  </Section.Content>
                  <Section.Actions>
                    <Button
                      color='neutral'
                      size='sm'
                      variant='outline'
                    >
                      Edit
                    </Button>
                  </Section.Actions>
                </Section.Item>
              </Section.Row>
            </Section.Group>
          </Section.Root>
        ))}
      </Panel.Sections>
    </Panel.Root>
  );
}
