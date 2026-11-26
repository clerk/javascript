import { Button } from '@clerk/mosaic/components/button';
import type { CardActions } from '@clerk/mosaic/components/card';
import { Card } from '@clerk/mosaic/components/card';
import { Dialog } from '@clerk/mosaic/components/dialog';
import { Field } from '@clerk/mosaic/components/field';
import { Input } from '@clerk/mosaic/components/input';
import React, { useState } from 'react';

import { StoryMosaicProvider } from '@/components/ChaosProvider';
import type { StoryMeta } from '@/lib/types';

import type { Surface } from './card-gallery.flows';
import { FlowGallery, isDialogSurface, RESOLVED, resolvedActions, SurfacePreview } from './card-gallery.flows';

export const meta: StoryMeta = {
  group: 'Blocks',
  title: 'CardGallery',
  label: 'Card gallery',
  status: 'wip',
  substatus: 'needs design',
  layout: 'wide',
  source: 'packages/mosaic/src/components/card/card.tsx',
};

type PlaygroundSurface = Surface;
type PlaygroundActions = 'auto' | CardActions;

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <label className='grid gap-1 text-[12px]'>
      <span className='text-muted-foreground font-medium'>{label}</span>
      <select
        value={value}
        onChange={event => onChange(event.target.value as T)}
        className='bg-background rounded border px-2 py-1 text-[13px]'
      >
        {options.map(option => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className='flex items-center gap-2 text-[13px]'>
      <input
        type='checkbox'
        checked={checked}
        onChange={event => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}

function BaselineCard({
  actions,
  size,
  align,
  prominent,
  withDescription,
  withBanner,
  withField,
}: {
  actions?: CardActions;
  size: 'md' | 'lg';
  align: 'start' | 'center';
  prominent: boolean;
  withDescription: boolean;
  withBanner: boolean;
  withField: boolean;
}) {
  return (
    <Card.Root
      variant={prominent ? 'prominent' : 'default'}
      size={size}
      align={align}
      actions={actions}
    >
      <Card.Header>
        <Card.Title>Rename project</Card.Title>
        {withDescription ? <Card.Description>This is the name your team sees across the app.</Card.Description> : null}
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {withBanner ? 'Unable to rename the project. Check your connection and try again.' : null}
      </Card.Banner>
      {withField ? (
        <Card.Content>
          <Field.Root>
            <Field.Label>Name</Field.Label>
            <Input defaultValue='Acme web' />
          </Field.Root>
        </Card.Content>
      ) : null}
      <Card.Footer>
        <Button
          variant='outline'
          color='neutral'
        >
          Cancel
        </Button>
        <Button>Save</Button>
      </Card.Footer>
    </Card.Root>
  );
}

function Playground() {
  const [surface, setSurface] = useState<PlaygroundSurface>('dialog');
  const [actionsChoice, setActionsChoice] = useState<PlaygroundActions>('auto');
  const [size, setSize] = useState<'md' | 'lg'>('md');
  const [align, setAlign] = useState<'start' | 'center'>('start');
  const [withDescription, setWithDescription] = useState(true);
  const [withBanner, setWithBanner] = useState(false);
  const [withField, setWithField] = useState(true);
  const resolved = actionsChoice === 'auto' ? resolvedActions(surface, size) : actionsChoice;
  const card = (actions?: CardActions) => (
    <BaselineCard
      actions={actions}
      size={size}
      align={align}
      prominent={surface === 'page'}
      withDescription={withDescription}
      withBanner={withBanner}
      withField={withField}
    />
  );
  const preview = card(isDialogSurface(surface) || actionsChoice !== 'auto' ? resolved : undefined);

  return (
    <section className='bg-background overflow-hidden rounded-xl border'>
      <div className='grid gap-4 border-b px-4 py-4 sm:grid-cols-[repeat(4,minmax(0,1fr))]'>
        <Select
          label='Surface'
          value={surface}
          options={['page', 'inline', 'dialog', 'alert'] as const}
          onChange={setSurface}
        />
        <Select
          label='actions'
          value={actionsChoice}
          options={['auto', 'stacked', 'end', 'fill'] as const}
          onChange={setActionsChoice}
        />
        <Select
          label='size'
          value={size}
          options={['md', 'lg'] as const}
          onChange={setSize}
        />
        <Select
          label='align'
          value={align}
          options={['start', 'center'] as const}
          onChange={setAlign}
        />
        <Toggle
          label='Description'
          checked={withDescription}
          onChange={setWithDescription}
        />
        <Toggle
          label='Field (Card.Content)'
          checked={withField}
          onChange={setWithField}
        />
        <Toggle
          label='Banner message'
          checked={withBanner}
          onChange={setWithBanner}
        />
      </div>
      <div
        className={`flex justify-center px-4 py-10 ${isDialogSurface(surface) ? 'bg-neutral-500/30 dark:bg-black/50' : 'bg-muted/50'}`}
      >
        <StoryMosaicProvider>
          <SurfacePreview surface={surface}>{preview}</SurfacePreview>
        </StoryMosaicProvider>
      </div>
      <div className='flex flex-wrap items-center gap-x-6 gap-y-2 border-t px-4 py-3 font-mono text-[12px]'>
        <span>variant={surface === 'page' ? 'prominent' : 'default'}</span>
        <span>actions={resolved}</span>
        <span>elevation={RESOLVED[surface].elevation}</span>
        <span>divider={isDialogSurface(surface) && withField && size === 'lg' ? 'yes' : 'no'}</span>
        <span>close={RESOLVED[surface].close}</span>
        {isDialogSurface(surface) ? (
          <span className='ms-auto font-sans'>
            <StoryMosaicProvider>
              <Dialog.Root role={surface === 'alert' ? 'alertdialog' : 'dialog'}>
                <Dialog.Trigger
                  render={
                    <Button
                      size='sm'
                      variant='outline'
                      color='neutral'
                    />
                  }
                >
                  Open in dialog
                </Dialog.Trigger>
                <Dialog.Popup>{card(actionsChoice === 'auto' ? undefined : actionsChoice)}</Dialog.Popup>
              </Dialog.Root>
            </StoryMosaicProvider>
          </span>
        ) : null}
      </div>
    </section>
  );
}

export function Gallery() {
  return (
    <div className='not-prose grid gap-12'>
      <div className='grid gap-3'>
        <h2 className='text-lg font-semibold'>The baseline card</h2>
        <p className='text-muted-foreground max-w-3xl text-sm'>
          One Card, four surfaces. Change the surface and watch the card answer: its variant, elevation, divider, close
          button and action layout all follow. Override actions to see what the card would do otherwise.
        </p>
        <Playground />
      </div>
      <FlowGallery />
    </div>
  );
}
