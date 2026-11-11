'use client';
import { Button } from '@clerk/mosaic/components/button';
import { Card } from '@clerk/mosaic/components/card';
import { Dialog } from '@clerk/mosaic/components/dialog';
import { Field } from '@clerk/mosaic/components/field';
import { Input } from '@clerk/mosaic/components/input';
import { Section } from '@clerk/mosaic/components/section';
import { UserProfileEmailSectionView } from '@clerk/mosaic/features/user-profile/user-profile-email-section/user-profile-email-section.view';
import { UserProfileMfaSectionView } from '@clerk/mosaic/features/user-profile/user-profile-mfa-section/user-profile-mfa-section.view';
import { UserProfilePasskeysSectionView } from '@clerk/mosaic/features/user-profile/user-profile-passkeys-section/user-profile-passkeys-section.view';
import { Envelope } from '@clerk/mosaic/icons/glyphs/envelope';
import { Lock } from '@clerk/mosaic/icons/glyphs/lock';
import { SecurityPasskey } from '@clerk/mosaic/icons/glyphs/security-passkey';
import { ShieldCheck } from '@clerk/mosaic/icons/glyphs/shield-check';
import { useUserProfileEditPasswordFixture } from '@swingset/stories/fixtures/user-profile-edit-password';
import { useUserProfileEmailsFixture } from '@swingset/stories/fixtures/user-profile-emails';
import { useUserProfileMfaExample } from '@swingset/stories/fixtures/user-profile-mfa-example';
import { usePasskeysFixture } from '@swingset/stories/fixtures/user-profile-passkeys';
import * as React from 'react';

import { CANVAS_ROWS, type CanvasRow, type CanvasTarget } from '@/components/gallery/canvas-store';

const AVATAR = 'https://avatars.githubusercontent.com/u/51144033?v=4';
const ROW_ICONS = { email: Envelope, passkeys: SecurityPasskey, mfa: ShieldCheck, password: Lock };
function ManageDialog({ row, children }: { row: CanvasRow; children: React.ReactNode }) {
  const RowIcon = ROW_ICONS[row.target];
  return (
    <Dialog.Root>
      <Dialog.Trigger
        render={
          <Button
            color='neutral'
            size='sm'
            variant='outline'
          >
            {row.label}
          </Button>
        }
      />
      <Dialog.Popup variant='card'>
        <Card.Root
          elevation='overlay'
          renderBranding={false}
          align='center'
        >
          <Card.Header>
            <Card.Media>
              <RowIcon className='size-8' />
            </Card.Media>
            <Card.Title>{row.title}</Card.Title>
            <Card.Description>{row.subtitle}</Card.Description>
          </Card.Header>
          <Card.Content>{children}</Card.Content>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
export function CanvasSettings() {
  const [name, setName] = React.useState('Preston Booth');
  const emails = useUserProfileEmailsFixture();
  const passkeys = usePasskeysFixture();
  const mfa = useUserProfileMfaExample();
  const password = useUserProfileEditPasswordFixture();
  const content: Record<Exclude<CanvasTarget, 'password'>, React.ReactNode> = {
    email: <UserProfileEmailSectionView {...emails} />,
    passkeys: <UserProfilePasskeysSectionView {...passkeys} />,
    mfa: <UserProfileMfaSectionView {...mfa.section} />,
  };
  return (
    <div className='flex w-full flex-col gap-10 px-10 pb-10 pt-6'>
      <div className='flex flex-col gap-2'>
        <h3 className='text-[2rem] font-bold leading-10 tracking-[-0.02em]'>Account</h3>
        <p className='text-base text-neutral-600 dark:text-neutral-400'>
          Manage your profile, login information, and devices
        </p>
      </div>
      <Section.Root>
        <Section.Group>
          <Section.Header>
            <Section.Content>
              <Section.Title>Profile</Section.Title>
            </Section.Content>
          </Section.Header>
          <Section.Body>
            <div className='flex items-start gap-6 py-4'>
              <img
                src={AVATAR}
                alt=''
                className='size-16 shrink-0 rounded-full object-cover'
              />
              <div className='w-full max-w-[320px]'>
                <Field.Root>
                  <Field.Label>Preferred name</Field.Label>
                  <Input
                    value={name}
                    onChange={event => setName(event.target.value)}
                  />
                </Field.Root>
              </div>
            </div>
          </Section.Body>
        </Section.Group>
      </Section.Root>
      <Section.Root>
        <Section.Group>
          <Section.Header>
            <Section.Content>
              <Section.Title>Account security</Section.Title>
            </Section.Content>
          </Section.Header>
          <Section.Body>
            {CANVAS_ROWS.map(row => (
              <Section.Row key={row.id}>
                <Section.Item>
                  <Section.Content>
                    <Section.Label>{row.title}</Section.Label>
                    <Section.Description>{row.description}</Section.Description>
                  </Section.Content>
                  <Section.Actions>
                    {row.target === 'password' ? (
                      password.action
                    ) : (
                      <ManageDialog row={row}>{content[row.target]}</ManageDialog>
                    )}
                  </Section.Actions>
                </Section.Item>
              </Section.Row>
            ))}
          </Section.Body>
        </Section.Group>
      </Section.Root>
    </div>
  );
}
