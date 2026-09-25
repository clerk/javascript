import { UserButtonView } from '@clerk/mosaic/features/user-button/user-button.view';
import type { MosaicCatalog } from '@clerk/mosaic/localization';
import { fill, plural, rich, useLocale, useMessages } from '@clerk/mosaic/localization';
import { MosaicProvider } from '@clerk/mosaic/MosaicProvider';
import type { ReactNode } from 'react';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './localization.stories?raw';

export const meta: StoryMeta = {
  group: 'Localization',
  title: 'Localization',
  status: 'wip',
  source: 'packages/mosaic/src/localization/context.tsx',
};

// A catalog for one namespace, the shape an `es-ES.json` would have. Every other namespace is
// left out on purpose: whatever a catalog omits stays English.
const esES: MosaicCatalog = {
  userButton: {
    trigger: { open: 'Abrir el menú de la cuenta de {name}' },
    popup: { label: 'Cuenta' },
    workspaces: {
      personal: 'Cuenta personal',
      notSelected: 'Ninguna organización seleccionada',
      loading: 'Cargando organizaciones…',
      members: { one: '{count} miembro', other: '{count} miembros' },
      accept: 'Aceptar',
      join: 'Unirse',
      requested: 'Solicitado',
      pending: 'pendiente',
    },
    accounts: {
      actionsFor: 'Acciones para {identifier}',
      switch: 'Cambiar de cuenta',
      add: 'Añadir cuenta',
      signOut: 'Cerrar sesión',
      signOutAll: 'Cerrar sesión en todas las cuentas',
    },
    manage: {
      invite: 'Invitar',
      account: 'Gestionar cuenta',
      organization: 'Gestionar organización',
      createOrganization: 'Crear organización',
    },
  },
};

const colin = {
  sessionId: 'sess_colin',
  name: 'Colin',
  identifier: 'colin@clerk.dev',
  imageUrl: 'https://avatars.githubusercontent.com/u/51144033?v=4',
};

const braden = {
  sessionId: 'sess_braden',
  name: 'Braden',
  identifier: 'braden@clerk.dev',
  imageUrl: 'https://avatars.githubusercontent.com/u/64913815?v=4',
};

const clerkApp = {
  kind: 'membership',
  organizationId: 'org_clerk_app',
  name: 'Clerk app',
  membersCount: 24,
  planLabel: 'Pro plan',
  imageUrl: 'https://avatars.githubusercontent.com/u/49538330?v=4',
} as const;

const clerkCloud = {
  kind: 'membership',
  organizationId: 'org_clerk_cloud',
  name: 'Clerk Cloud',
  membersCount: 1,
} as const;

// A static user button: every string it renders comes from the `userButton` namespace, so it
// shows a catalog or an override the moment the popup opens.
function Workspace() {
  const [open, setOpen] = useState(false);
  return (
    <UserButtonView
      open={open}
      onOpenChange={setOpen}
      activeSession={colin}
      activeOrganization={clerkApp}
      hasOrganizations
      memberships={[clerkApp, clerkCloud]}
      suggestions={[]}
      invitations={[]}
      additionalSessions={[braden]}
      onSelectOrganization={() => setOpen(false)}
      onSwitchSession={() => setOpen(false)}
      onSignOutAll={() => setOpen(false)}
      onManageOrganization={() => setOpen(false)}
      onInviteMembers={() => setOpen(false)}
      onManageAccount={() => setOpen(false)}
      onCreateOrganization={() => setOpen(false)}
      onAddAccount={() => setOpen(false)}
    />
  );
}

function Rows({ rows }: { rows: Array<[string, ReactNode]> }) {
  return (
    <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '4px 16px', margin: 0 }}>
      {rows.map(([label, value]) => (
        <div
          key={label}
          style={{ display: 'contents' }}
        >
          <dt style={{ fontFamily: 'monospace', fontSize: 12, opacity: 0.7 }}>{label}</dt>
          <dd style={{ margin: 0 }}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

// What a view does with its messages: read the namespace, then resolve each string with the
// helper its placeholders call for.
function Strings() {
  const m = useMessages('userButton');
  const link = useMessages('userProfileVerifyEmailLink');
  const locale = useLocale();
  return (
    <Rows
      rows={[
        ['fill', fill(m.trigger.open, { name: 'Colin' })],
        ['plural · 1', plural(m.workspaces.members, 1, locale)],
        ['plural · 5', plural(m.workspaces.members, 5, locale)],
        ['rich', rich(link.resendCountdown, { values: { seconds: <strong>30</strong> } })],
      ]}
    />
  );
}

function Counts({ counts }: { counts: number[] }) {
  const m = useMessages('userButton');
  const locale = useLocale();
  return <Rows rows={counts.map(count => [String(count), plural(m.workspaces.members, count, locale)])} />;
}

export function Overrides() {
  return (
    <MosaicProvider
      localization={{
        overrides: {
          'userButton.manage.invite': 'Invite teammates',
          'userButton.accounts.signOutAll': 'Sign out everywhere',
        },
      }}
    >
      <Workspace />
    </MosaicProvider>
  );
}

export function Catalog() {
  return (
    <MosaicProvider localization={{ locale: 'es-ES', messages: esES }}>
      <Workspace />
    </MosaicProvider>
  );
}

export function CatalogWithOverrides() {
  return (
    <MosaicProvider
      localization={{
        locale: 'es-ES',
        messages: esES,
        overrides: { userButton: { manage: { invite: 'Invitar al equipo' } } },
      }}
    >
      <Workspace />
    </MosaicProvider>
  );
}

export function Helpers() {
  return <Strings />;
}

export function Fallback() {
  return (
    <MosaicProvider localization={{ locale: 'es-ES', messages: esES }}>
      <Strings />
    </MosaicProvider>
  );
}

export function PluralRules() {
  return (
    <MosaicProvider
      localization={{
        locale: 'ru',
        overrides: {
          'userButton.workspaces.members': {
            one: '{count} участник',
            few: '{count} участника',
            many: '{count} участников',
            other: '{count} участника',
          },
        },
      }}
    >
      <Counts counts={[1, 2, 5, 21]} />
    </MosaicProvider>
  );
}
