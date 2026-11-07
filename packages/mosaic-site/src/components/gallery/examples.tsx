'use client';
import { Avatar } from '@clerk/mosaic/components/avatar';
import { Badge } from '@clerk/mosaic/components/badge';
import { Banner } from '@clerk/mosaic/components/banner';
import { Button, SubmitButton } from '@clerk/mosaic/components/button';
import { Dialog } from '@clerk/mosaic/components/dialog';
import { Field } from '@clerk/mosaic/components/field';
import { Icon } from '@clerk/mosaic/components/icon';
import { Switch } from '@clerk/mosaic/components/switch';
import { APIKeysTableSkeleton } from '@clerk/mosaic/features/api-keys/api-keys-table.skeleton';
import { APIKeysTableView } from '@clerk/mosaic/features/api-keys/api-keys-table.view';
import { SwitcherView } from '@clerk/mosaic/features/switcher/switcher.view';
import { Checkmark } from '@clerk/mosaic/icons/glyphs/checkmark';
import { ChevronDown } from '@clerk/mosaic/icons/glyphs/chevron-down';
import { Plus } from '@clerk/mosaic/icons/glyphs/plus';
import { useAPIKeysTableFixture } from '@swingset/stories/fixtures/api-keys-table';
import { usePrototype } from '@swingset/stories/fixtures/switcher';
import * as React from 'react';

import { OrganizationProfileModal, UserProfileModal } from '@/components/gallery/embed-modal';
type Example = () => React.ReactElement;
const row = 'flex flex-wrap items-center justify-center gap-3';
function ButtonVariants() {
  return (
    <div className={row}>
      <Button variant='filled'>Filled</Button>
      <Button variant='outline'>Outline</Button>
      <Button variant='ghost'>Ghost</Button>
      <Button variant='link'>Link</Button>
    </div>
  );
}
function ButtonSizes() {
  return (
    <div className={row}>
      {(['xs', 'sm', 'md', 'lg'] as const).map(size => (
        <Button
          key={size}
          size={size}
        >
          {size}
        </Button>
      ))}
    </div>
  );
}
function ButtonColors() {
  return (
    <div className='grid grid-cols-[max-content_repeat(3,max-content)] items-center gap-x-6 gap-y-3'>
      <span />
      {(['primary', 'neutral', 'negative'] as const).map(color => (
        <span
          key={color}
          className='text-xs text-neutral-500'
        >
          {color}
        </span>
      ))}
      {(['filled', 'outline', 'ghost', 'link'] as const).map(variant => (
        <React.Fragment key={variant}>
          <span className='text-xs text-neutral-500'>{variant}</span>
          {(['primary', 'neutral', 'negative'] as const).map(color => (
            <Button
              key={`${variant}-${color}`}
              color={color}
              variant={variant}
            >
              Button
            </Button>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}
function ButtonShapes() {
  return (
    <div className={row}>
      <Button>Default</Button>
      <Button
        shape='square'
        aria-label='Add'
      >
        <Icon glyph={Plus} />
      </Button>
      <Button
        shape='circle'
        aria-label='Add'
      >
        <Icon glyph={Plus} />
      </Button>
    </div>
  );
}
function ButtonIcons() {
  return (
    <div className={row}>
      <Button>
        <Icon
          glyph={Checkmark}
          placement='inline-start'
        />
        Approve
      </Button>
      <Button>
        Options
        <Icon
          glyph={ChevronDown}
          placement='inline-end'
        />
      </Button>
      <Button>
        <Icon
          glyph={Checkmark}
          placement='inline-start'
        />
        Both sides
        <Icon
          glyph={ChevronDown}
          placement='inline-end'
        />
      </Button>
    </div>
  );
}
function ButtonDisabled() {
  return (
    <div className='flex flex-col items-center gap-4'>
      <div className={row}>
        <Button disabled>Disabled</Button>
        <Button
          disabled
          variant='outline'
        >
          Disabled
        </Button>
        <Button
          disabled
          color='negative'
        >
          Disabled
        </Button>
      </div>
      <div className={row}>
        <Button disabled>Skipped by Tab</Button>
        <Button
          disabled
          focusableWhenDisabled
        >
          Focusable when disabled
        </Button>
      </div>
    </div>
  );
}
function ButtonSubmit() {
  const [pending, setPending] = React.useState(false);
  React.useEffect(() => {
    if (!pending) {
      return;
    }
    const timer = window.setTimeout(() => setPending(false), 2000);
    return () => window.clearTimeout(timer);
  }, [pending]);
  return (
    <SubmitButton
      type='button'
      isPending={pending}
      onClick={() => setPending(true)}
    >
      Save changes
    </SubmitButton>
  );
}
function BadgeColors() {
  return (
    <div className={row}>
      {(['primary', 'neutral', 'warning', 'negative', 'positive'] as const).map(color => (
        <Badge
          key={color}
          color={color}
        >
          {color}
        </Badge>
      ))}
    </div>
  );
}
function BadgeIcon() {
  return (
    <Badge color='positive'>
      <svg
        width='10'
        height='10'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='3'
        strokeLinecap='round'
        strokeLinejoin='round'
        style={{ flexShrink: 0 }}
      >
        <path d='M20 6 9 17l-5-5' />
      </svg>
      Verified
    </Badge>
  );
}
function BannerColors() {
  return (
    <div className='flex w-full max-w-[520px] flex-col gap-3'>
      <Banner.Root color='neutral'>
        <Banner.Label>Neutral banner</Banner.Label>
        <Banner.Description>Here is a tip for how this should work.</Banner.Description>
      </Banner.Root>
      <Banner.Root color='positive'>
        <Banner.Label>Positive banner</Banner.Label>
        <Banner.Description>This is the description for a positive banner.</Banner.Description>
      </Banner.Root>
      <Banner.Root color='warning'>
        <Banner.Label>Warning banner</Banner.Label>
        <Banner.Description>Your payment could not be processed. Please check your payment method.</Banner.Description>
      </Banner.Root>
      <Banner.Root color='negative'>
        <Banner.Label>Error banner</Banner.Label>
        <Banner.Description>Renew now to avoid service interruption.</Banner.Description>
      </Banner.Root>
    </div>
  );
}
function BannerLabelOnly() {
  return (
    <div className='w-full max-w-[520px]'>
      <Banner.Root color='warning'>
        <Banner.Label>Your trial ends in 3 days</Banner.Label>
      </Banner.Root>
    </div>
  );
}
function AvatarSizes() {
  return (
    <div className={row}>
      {(['xs', 'sm', 'md', 'lg'] as const).map(size => (
        <Avatar.Root
          key={size}
          size={size}
        >
          <Avatar.Fallback>CL</Avatar.Fallback>
        </Avatar.Root>
      ))}
    </div>
  );
}
function AvatarShapes() {
  return (
    <div className={row}>
      <Avatar.Root shape='circle'>
        <Avatar.Fallback>CL</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root shape='square'>
        <Avatar.Fallback>CL</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root bordered={false}>
        <Avatar.Fallback>CL</Avatar.Fallback>
      </Avatar.Root>
    </div>
  );
}
function SwitchStates() {
  return (
    <div className={row}>
      <Switch aria-label='Off' />
      <Switch
        aria-label='On'
        defaultChecked
      />
      <Switch
        aria-label='Disabled'
        disabled
      />
      <Switch
        aria-label='Disabled on'
        disabled
        defaultChecked
      />
    </div>
  );
}
function SwitchSizes() {
  return (
    <div className={row}>
      <Switch
        aria-label='Small'
        size='sm'
        defaultChecked
      />
      <Switch
        aria-label='Medium'
        size='md'
        defaultChecked
      />
    </div>
  );
}
function SwitchWithField() {
  return (
    <div className='flex w-full max-w-[360px] flex-col gap-4'>
      <Field.Root orientation='horizontal'>
        <Switch
          name='emailNotifications'
          defaultChecked
        />
        <Field.Content>
          <Field.Label>Email notifications</Field.Label>
          <Field.Description>Get an email when someone signs in from a new device.</Field.Description>
        </Field.Content>
      </Field.Root>
      <Field.Root
        orientation='horizontal'
        disabled
      >
        <Switch name='betaFeatures' />
        <Field.Content>
          <Field.Label>Beta features</Field.Label>
        </Field.Content>
      </Field.Root>
    </div>
  );
}
function UserButtonCondensed() {
  const prototype = usePrototype({ hidePersonal: true });
  return (
    <SwitcherView
      {...prototype}
      mode='combined'
      triggerVariant='condensed'
    />
  );
}
function UserButtonIconOnly() {
  const prototype = usePrototype({ hidePersonal: true });
  return (
    <SwitcherView
      {...prototype}
      mode='combined'
      showTriggerLabel={false}
    />
  );
}
function UserButtonUserOnly() {
  const prototype = usePrototype();
  return (
    <SwitcherView
      {...prototype}
      mode='user'
    />
  );
}
function UserButtonSingleSession() {
  const prototype = usePrototype({ singleSession: true, hidePersonal: true });
  return (
    <SwitcherView
      {...prototype}
      mode='combined'
    />
  );
}
function ProfileDialog({
  label,
  variant,
  children,
}: {
  label: string;
  variant: 'profile' | 'fullscreen';
  children: React.ReactElement;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{label}</Button>
      <Dialog.Root
        open={open}
        onOpenChange={setOpen}
      >
        <Dialog.Popup
          variant={variant}
          initialFocus={false}
        >
          {children}
        </Dialog.Popup>
      </Dialog.Root>
    </>
  );
}
function UserProfileOverlay() {
  return (
    <ProfileDialog
      label='Manage account'
      variant='profile'
    >
      <UserProfileModal />
    </ProfileDialog>
  );
}
function UserProfileFullscreen() {
  return (
    <ProfileDialog
      label='Open full screen'
      variant='fullscreen'
    >
      <UserProfileModal />
    </ProfileDialog>
  );
}
function OrganizationProfileOverlay() {
  return (
    <ProfileDialog
      label='Manage organization'
      variant='profile'
    >
      <OrganizationProfileModal />
    </ProfileDialog>
  );
}
function OrganizationProfileFullscreen() {
  return (
    <ProfileDialog
      label='Open full screen'
      variant='fullscreen'
    >
      <OrganizationProfileModal />
    </ProfileDialog>
  );
}
function APIKeysOrganization() {
  const props = useAPIKeysTableFixture({ subjectKind: 'organization', initialKeys: [] });
  return <APIKeysTableView {...props} />;
}
function APIKeysDescription() {
  const props = useAPIKeysTableFixture({ showDescription: true });
  return <APIKeysTableView {...props} />;
}
function APIKeysLoading() {
  const props = useAPIKeysTableFixture();
  return (
    <APIKeysTableSkeleton
      messages={props.messages}
      canManage
    />
  );
}
export const EXAMPLES: Record<string, Record<string, Example>> = {
  button: {
    variants: ButtonVariants,
    sizes: ButtonSizes,
    colors: ButtonColors,
    shapes: ButtonShapes,
    icons: ButtonIcons,
    disabled: ButtonDisabled,
    submit: ButtonSubmit,
  },
  badge: { colors: BadgeColors, icon: BadgeIcon },
  banner: { colors: BannerColors, labelOnly: BannerLabelOnly },
  avatar: { sizes: AvatarSizes, shapes: AvatarShapes },
  switch: { states: SwitchStates, sizes: SwitchSizes, withField: SwitchWithField },
  'user-button': {
    condensed: UserButtonCondensed,
    iconOnly: UserButtonIconOnly,
    userOnly: UserButtonUserOnly,
    singleSession: UserButtonSingleSession,
  },
  'user-profile': { overlay: UserProfileOverlay, fullscreen: UserProfileFullscreen },
  'organization-profile': { overlay: OrganizationProfileOverlay, fullscreen: OrganizationProfileFullscreen },
  'api-keys-table': { organization: APIKeysOrganization, description: APIKeysDescription, loading: APIKeysLoading },
};
