/** @jsxImportSource @emotion/react */
import { Box } from '@clerk/ui/mosaic/components/box';
import { Button } from '@clerk/ui/mosaic/components/button';
import type { DialogProps } from '@clerk/ui/mosaic/components/dialog';
import { Dialog, dialogRecipe } from '@clerk/ui/mosaic/components/dialog';
import { Input } from '@clerk/ui/mosaic/components/input';
import { useEffect, useState } from 'react';

import type { StoryMeta } from '@/lib/types';

// The file's own raw source, exposed so `<Story>` can show each example's code in its
// "Code" footer (extracted per-function by `lib/extractStorySource`).
export { default as __source } from './dialog.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Dialog',
  source: 'packages/ui/src/mosaic/components/dialog.tsx',
  styles: dialogRecipe,
  // `header`/`description` are free-text content, not CVA variants — declare them as text
  // knobs so the prop table renders editable inputs alongside the `alignment`/`close` knobs.
  knobs: {
    header: { type: 'text', label: 'header', defaultValue: 'Confirm action' },
    description: {
      type: 'text',
      label: 'description',
      defaultValue: 'Are you sure you want to proceed? This action cannot be undone.',
    },
  },
};

// Knob values are dynamically typed; Dialog has a strict prop interface. The cast is the
// same one every Mosaic story uses to feed `<PropTable>` selections back into the component.
function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as DialogProps;
}

export function Default(props: Record<string, unknown>) {
  // `alignment`, `close`, `header`, and `description` all flow in from the knob values.
  return (
    <Dialog
      {...knobsAsProps(props)}
      trigger={p => <Button {...p}>Open dialog</Button>}
      actions={{
        primary: { label: 'Confirm' },
        secondary: { label: 'Cancel' },
      }}
    />
  );
}

export function Progress() {
  return (
    <Dialog
      progress={{ current: 2, total: 4 }}
      trigger={p => <Button {...p}>Open step 2 of 4</Button>}
      header='Verify your identity'
      description='Enter the code we sent to your device to continue.'
      actions={{
        primary: { label: 'Continue' },
        secondary: { label: 'Back' },
      }}
    />
  );
}

export function CustomActions() {
  return (
    <Dialog
      trigger={p => <Button {...p}>Open dialog</Button>}
      header='Custom action row'
      description='Pass nodes instead of the structured object for full control over the actions.'
      actions={
        <>
          <Button color='secondary'>Back</Button>
          <Button>Next</Button>
        </>
      }
    />
  );
}

// Controlled open state with a type-to-confirm Input (the `Destructive` block's pattern):
// the parent owns `open`, the Input lives in the dialog's `children`, and the destructive
// primary action stays disabled until the typed value matches the resource name.
export function Controlled() {
  const resourceName = 'acme-app';
  const [open, setOpen] = useState(false);
  const [confirmValue, setConfirmValue] = useState('');
  const canDelete = confirmValue === resourceName;

  // Reset the field whenever the dialog closes.
  useEffect(() => {
    if (!open) {
      setConfirmValue('');
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      trigger={p => (
        <Button
          {...p}
          color='destructive'
        >
          Delete project
        </Button>
      )}
      header='Delete project'
      description={`This permanently deletes ${resourceName} and all of its data.`}
      actions={{
        primary: {
          label: 'Delete project',
          color: 'destructive',
          disabled: !canDelete,
          onClick: () => setOpen(false),
        },
        secondary: { label: 'Cancel' },
      }}
    >
      <Box
        render={p => (
          <label
            {...p}
            htmlFor='confirm-resource'
          />
        )}
        sx={t => ({ ...t.text('sm'), fontWeight: t.font.medium })}
      >
        Type {resourceName} to confirm.
        <Input
          id='confirm-resource'
          value={confirmValue}
          onChange={e => setConfirmValue(e.target.value)}
          sx={t => ({ marginBlockStart: t.spacing(1) })}
        />
      </Box>
    </Dialog>
  );
}
