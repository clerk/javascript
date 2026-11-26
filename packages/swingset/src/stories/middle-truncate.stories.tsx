import { Avatar } from '@clerk/mosaic/components/avatar';
import { Entity } from '@clerk/mosaic/components/entity';
import { MiddleTruncate } from '@clerk/mosaic/components/middle-truncate';
import * as React from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './middle-truncate.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'wip',
  title: 'MiddleTruncate',
  source: 'packages/mosaic/src/components/middle-truncate/middle-truncate.tsx',
};

const resizable: React.CSSProperties = {
  border: '1px dashed currentColor',
  borderRadius: 6,
  display: 'grid',
  gap: 8,
  maxWidth: '100%',
  minWidth: 40,
  overflow: 'hidden',
  padding: 12,
  resize: 'horizontal',
  width: 280,
};

const email = 'alexander.carpenter.the.third@clerk.dev';

export function Default() {
  return (
    <div style={resizable}>
      <MiddleTruncate tail={6}>user_2abcDEF9f8e7d6c5b4a3f9Qx1z</MiddleTruncate>
      <MiddleTruncate tail={email.length - email.lastIndexOf('@')}>{email}</MiddleTruncate>
      <MiddleTruncate tail={8}>Bartholomew Montgomery-Fitzgerald Jr.</MiddleTruncate>
      <MiddleTruncate tail={6}>short</MiddleTruncate>
      <MiddleTruncate tail={4}>Team 👩‍👩‍👧‍👦 offsite planning doc 🇺🇸🇺🇸</MiddleTruncate>
    </div>
  );
}

export function InsideEntity() {
  return (
    <div style={resizable}>
      <Entity.Root>
        <Entity.Media>
          <Avatar.Root size='fit'>
            <Avatar.Fallback />
          </Avatar.Root>
        </Entity.Media>
        <Entity.Content>
          <Entity.Label>
            <MiddleTruncate tail={8}>Bartholomew Montgomery-Fitzgerald Jr.</MiddleTruncate>
          </Entity.Label>
          <Entity.Description>
            <MiddleTruncate tail={email.length - email.lastIndexOf('@')}>{email}</MiddleTruncate>
          </Entity.Description>
        </Entity.Content>
      </Entity.Root>
    </div>
  );
}

export function InsideButton() {
  return (
    <div style={resizable}>
      <button
        type='button'
        style={{ display: 'flex', minWidth: 0, padding: '6px 10px' }}
      >
        <MiddleTruncate tail={6}>user_2abcDEF9f8e7d6c5b4a3f9Qx1z</MiddleTruncate>
      </button>
    </div>
  );
}

export function RightToLeft() {
  return (
    <div
      dir='rtl'
      style={resizable}
    >
      <MiddleTruncate tail={6}>אלכסנדר נגר השלישי מצוות התשתיות</MiddleTruncate>
      <MiddleTruncate tail={email.length - email.lastIndexOf('@')}>{email}</MiddleTruncate>
    </div>
  );
}

export function InlineInText() {
  return (
    <p style={{ ...resizable, display: 'block' }}>
      Invitation sent to <MiddleTruncate tail={10}>{email}</MiddleTruncate> a moment ago.
    </p>
  );
}
