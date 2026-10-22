import type { SelectItem } from '@clerk/mosaic/components/select';
import { LogsPanelView } from '@clerk/mosaic/features/logs/logs-panel.view';
import type { LogEvent, LogEventActor, LogEventLocation, LogEventSource } from '@clerk/mosaic/features/logs/logs.types';
import { useLocale } from '@clerk/mosaic/localization';
import { useMemo, useState } from 'react';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosName, chaosRows, chaosText } from '@/lib/chaos';

const APPLICATION_NAME = 'Lumen';
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const NOW = Math.floor(Date.now() / HOUR) * HOUR + 47 * MINUTE;

interface Origin {
  ipAddress: string;
  location: LogEventLocation;
  deviceLabel: string;
}

const origins = {
  laptop: {
    ipAddress: '203.0.113.42',
    location: { city: 'San Francisco', country: 'United States', countryCode: 'US' },
    deviceLabel: 'Chrome 141 on macOS',
  },
  phone: {
    ipAddress: '2001:db8:4f2a::1c',
    location: { city: 'Oakland', country: 'United States', countryCode: 'US' },
    deviceLabel: 'Safari on iPhone',
  },
  travel: {
    ipAddress: '192.0.2.117',
    location: { city: 'Toronto', country: 'Canada', countryCode: 'CA' },
    deviceLabel: 'Chrome 141 on macOS',
  },
  unknown: {
    ipAddress: '198.51.100.77',
    location: { city: 'Lagos', country: 'Nigeria', countryCode: 'NG' },
    deviceLabel: 'Firefox 132 on Windows',
  },
  london: {
    ipAddress: '198.51.100.24',
    location: { city: 'London', country: 'United Kingdom', countryCode: 'GB' },
    deviceLabel: 'Edge 141 on Windows',
  },
  berlin: {
    ipAddress: '203.0.113.188',
    location: { city: 'Berlin', country: 'Germany', countryCode: 'DE' },
    deviceLabel: 'Firefox 132 on Linux',
  },
} satisfies Record<string, Origin>;

interface EventSeed {
  ago: number;
  type: string;
  description: string;
  category: string;
  source?: LogEventSource;
  origin?: Origin;
  actor?: LogEventActor;
  payload: Record<string, unknown>;
}

const USER_ID = 'user_2xP9qLmB7cVnR4tKs8eWzJ1hYdA';
const USER_EMAIL = 'preston@clerk.dev';
const ORG_ID = 'org_2yHc81TfQe0aLkZr6NwV3sPmBq';
const ORG_NAME = 'Clerk';

let sequence = 0;
const id = (prefix: string) =>
  `${prefix}_${(0x2a7f3c + (sequence += 7919)).toString(36)}${'x9q4m'.slice(sequence % 5)}`;

const signIn = (ago: number, origin: Origin, strategy = 'password', second?: string): EventSeed[] => {
  const sessionId = id('sess');
  return [
    {
      ago,
      type: 'session.created',
      description: 'Started a new session',
      category: 'sessions',
      origin,
      payload: {
        session_id: sessionId,
        user_id: USER_ID,
        client_id: id('client'),
        active_organization_id: ORG_ID,
      },
    },
    {
      ago: ago + 0.2 * MINUTE,
      type: 'sign_in.completed',
      description: strategy === 'passkey' ? 'Signed in with a passkey' : 'Signed in with email and password',
      category: 'sessions',
      origin,
      payload: {
        session_id: sessionId,
        user_id: USER_ID,
        duration_ms: strategy === 'passkey' ? 2140 : 9870,
        identifier: USER_EMAIL,
        identifier_type: 'email_address',
        strategy,
        ...(second ? { second_factor_strategy: second } : {}),
      },
    },
  ];
};

const userSeeds: EventSeed[] = [
  {
    ago: 12 * MINUTE,
    type: 'report.exported',
    description: 'Exported the "Q3 revenue" report',
    category: 'application',
    source: 'application',
    origin: origins.laptop,
    payload: {
      report_id: 'rpt_8841',
      report_name: 'Q3 revenue',
      format: 'csv',
      row_count: 1284,
      filters: { quarter: '2026-Q3', region: ['NA', 'EMEA'] },
      workspace_id: 'ws_lumen_core',
    },
  },
  ...signIn(2 * HOUR, origins.laptop, 'passkey'),
  {
    ago: 3 * HOUR,
    type: 'user.passkey.created',
    description: 'Added a passkey',
    category: 'security',
    origin: origins.laptop,
    payload: { user_id: USER_ID, passkey_id: 'pkey_2yJk3VbNq8Lr0', passkey_name: 'MacBook Pro Touch ID' },
  },
  {
    ago: 26 * HOUR,
    type: 'sign_in.password.failed',
    description: 'Failed password attempt',
    category: 'sessions',
    origin: origins.unknown,
    payload: {
      identifier: USER_EMAIL,
      identifier_type: 'email_address',
      enumeration_target: false,
      attempts: 3,
      sign_in_id: id('sia'),
      user_id: USER_ID,
    },
  },
  {
    ago: 26 * HOUR + 2 * MINUTE,
    type: 'sign_in.password.failed',
    description: 'Failed password attempt',
    category: 'sessions',
    origin: origins.unknown,
    payload: {
      identifier: USER_EMAIL,
      identifier_type: 'email_address',
      enumeration_target: false,
      attempts: 2,
      sign_in_id: id('sia'),
      user_id: USER_ID,
    },
  },
  {
    ago: 2 * DAY,
    type: 'document.shared',
    description: 'Shared "Launch plan" with ada.lovelace@example.com',
    category: 'application',
    source: 'application',
    origin: origins.phone,
    payload: {
      document_id: 'doc_launch_plan',
      document_title: 'Launch plan',
      shared_with: 'ada.lovelace@example.com',
      permission: 'can_edit',
      notify: true,
    },
  },
  ...signIn(2 * DAY + 5 * MINUTE, origins.phone, 'password', 'totp'),
  {
    ago: 3 * DAY,
    type: 'user.password.changed',
    description: 'Changed password',
    category: 'security',
    origin: origins.laptop,
    payload: { user_id: USER_ID, session_id: id('sess'), sign_out_of_other_sessions: true },
  },
  {
    ago: 3 * DAY + 4 * MINUTE,
    type: 'user.backup_codes.created',
    description: 'Generated new backup codes',
    category: 'security',
    origin: origins.laptop,
    payload: { user_id: USER_ID, backup_code_count: 10 },
  },
  {
    ago: 3 * DAY + 6 * MINUTE,
    type: 'user.totp.created',
    description: 'Added an authenticator app',
    category: 'security',
    origin: origins.laptop,
    payload: { user_id: USER_ID, totp_id: 'totp_2yLm0Q8vN1' },
  },
  ...signIn(4 * DAY, origins.travel),
  {
    ago: 5 * DAY,
    type: 'email_address.verified',
    description: 'Verified preston.booth@gmail.com',
    category: 'account',
    origin: origins.laptop,
    payload: {
      email_address_id: 'idn_2yN8cXr4Lq0',
      email_address: 'preston.booth@gmail.com',
      user_id: USER_ID,
      strategy: 'email_code',
    },
  },
  {
    ago: 5 * DAY + 3 * MINUTE,
    type: 'email_address.created',
    description: 'Added preston.booth@gmail.com',
    category: 'account',
    origin: origins.laptop,
    payload: { email_address_id: 'idn_2yN8cXr4Lq0', email_address: 'preston.booth@gmail.com', user_id: USER_ID },
  },
  {
    ago: 6 * DAY,
    type: 'project.created',
    description: 'Created the project "Mobile onboarding"',
    category: 'application',
    source: 'application',
    origin: origins.laptop,
    payload: { project_id: 'prj_4410', name: 'Mobile onboarding', template: 'kanban', visibility: 'workspace' },
  },
  {
    ago: 7 * DAY,
    type: 'user.external_account.connected',
    description: 'Connected a GitHub account',
    category: 'account',
    origin: origins.laptop,
    payload: {
      user_id: USER_ID,
      external_account_id: 'eac_2yQwP7mKz3',
      provider: 'oauth_github',
      provider_user_id: '1288331',
      email_address: USER_EMAIL,
      approved_scopes: 'read:user user:email',
    },
  },
  {
    ago: 8 * DAY,
    type: 'user.updated',
    description: 'Updated profile name',
    category: 'account',
    origin: origins.laptop,
    payload: { user_id: USER_ID, first_name: 'Preston', last_name: 'Booth', session_id: id('sess') },
  },
  {
    ago: 8 * DAY + 2 * MINUTE,
    type: 'user.profile_image.updated',
    description: 'Changed profile picture',
    category: 'account',
    origin: origins.laptop,
    payload: { user_id: USER_ID, image_url: 'https://img.clerk.com/eyJ0eXBlIjoicHJveHkifQ' },
  },
  {
    ago: 9 * DAY,
    type: 'session.ended',
    description: 'Signed out',
    category: 'sessions',
    origin: origins.phone,
    payload: { session_id: id('sess'), user_id: USER_ID, reason: 'sign_out' },
  },
  ...signIn(10 * DAY, origins.phone),
  {
    ago: 11 * DAY,
    type: 'report.exported',
    description: 'Exported the "Churn by cohort" report',
    category: 'application',
    source: 'application',
    origin: origins.laptop,
    payload: { report_id: 'rpt_8102', report_name: 'Churn by cohort', format: 'pdf', page_count: 6 },
  },
  ...signIn(12 * DAY, origins.laptop),
  {
    ago: 13 * DAY,
    type: 'user.created',
    description: 'Created your account',
    category: 'account',
    origin: origins.laptop,
    payload: {
      user_id: USER_ID,
      email_address: USER_EMAIL,
      first_name: 'Preston',
      last_name: 'Booth',
      sign_up_strategy: 'oauth_google',
    },
  },
];

const members = {
  ada: { name: 'Ada Lovelace', identifier: 'ada.lovelace@example.com', isCurrentUser: true },
  grace: { name: 'Grace Hopper', identifier: 'grace.hopper@example.com' },
  margaret: { name: 'Margaret Hamilton', identifier: 'margaret.hamilton@example.com' },
  katherine: { name: 'Katherine Johnson', identifier: 'katherine.johnson@example.com' },
} satisfies Record<string, LogEventActor>;

const orgSeeds: EventSeed[] = [
  {
    ago: 25 * MINUTE,
    type: 'project.deleted',
    description: 'Deleted the project "Q2 roadmap"',
    category: 'application',
    source: 'application',
    origin: origins.london,
    actor: members.grace,
    payload: {
      project_id: 'prj_3017',
      name: 'Q2 roadmap',
      document_count: 42,
      archived_at: null,
      organization_id: ORG_ID,
    },
  },
  {
    ago: 3 * HOUR,
    type: 'organization_membership.role_updated',
    description: "Changed Alan Turing's role to Admin",
    category: 'members',
    origin: origins.laptop,
    actor: members.ada,
    payload: {
      organization_membership_id: 'orgmem_2yT4kP0vX8',
      organization_id: ORG_ID,
      organization_name: ORG_NAME,
      user_id: 'user_2yR8nC1mLq4',
      previous_role: 'org:member',
      role: 'org:admin',
    },
  },
  {
    ago: 5 * HOUR,
    type: 'organization_invitation.created',
    description: 'Invited radia.perlman@example.com as Member',
    category: 'invitations',
    origin: origins.berlin,
    actor: members.margaret,
    payload: {
      organization_invitation_id: 'orginv_2yU1bW6pZ3',
      organization_id: ORG_ID,
      organization_name: ORG_NAME,
      email_address: 'radia.perlman@example.com',
      role: 'org:member',
      inviter_user_id: 'user_2yM3hS9qJx7',
      expires_in_days: 30,
      notify: true,
    },
  },
  {
    ago: 26 * HOUR,
    type: 'integration.connected',
    description: 'Connected the Slack integration',
    category: 'application',
    source: 'application',
    origin: origins.laptop,
    actor: members.ada,
    payload: {
      integration: 'slack',
      slack_team: 'clerk-eng',
      channels: ['#launches', '#incidents'],
      scopes: ['chat:write', 'channels:read'],
    },
  },
  {
    ago: 2 * DAY,
    type: 'organization_membership.created',
    description: 'Added Frances Allen as Member',
    category: 'members',
    origin: origins.london,
    actor: members.grace,
    payload: {
      organization_membership_id: 'orgmem_2yV9aD2rT5',
      organization_id: ORG_ID,
      organization_name: ORG_NAME,
      user_id: 'user_2yV9aD2rT0',
      role: 'org:member',
      public_metadata: { team: 'Platform' },
    },
  },
  {
    ago: 2 * DAY + 20 * MINUTE,
    type: 'organization_invitation.accepted',
    description: 'Frances Allen accepted an invitation',
    category: 'invitations',
    origin: origins.travel,
    actor: { name: 'Frances Allen', identifier: 'frances.allen@example.com' },
    payload: {
      organization_invitation_id: 'orginv_2yP3mL6vQ2',
      organization_id: ORG_ID,
      email_address: 'frances.allen@example.com',
      role: 'org:member',
    },
  },
  {
    ago: 3 * DAY,
    type: 'organization.updated',
    description: 'Renamed the organization to Clerk',
    category: 'settings',
    origin: origins.laptop,
    actor: members.ada,
    payload: {
      organization_id: ORG_ID,
      organization_name: ORG_NAME,
      organization_slug: 'clerk',
      previous_organization_name: 'Clerk Inc',
      max_allowed_memberships: 50,
      admin_delete_enabled: true,
    },
  },
  {
    ago: 4 * DAY,
    type: 'organization_domain.created',
    description: 'Added the domain clerk.dev',
    category: 'settings',
    origin: origins.laptop,
    actor: members.ada,
    payload: {
      organization_domain_id: 'orgdmn_2yX0cB7nR1',
      organization_id: ORG_ID,
      organization_name: ORG_NAME,
      domain_name: 'clerk.dev',
      enrollment_mode: 'automatic_suggestion',
    },
  },
  {
    ago: 5 * DAY,
    type: 'organization_invitation.revoked',
    description: 'Revoked the invitation for john.mccarthy@example.com',
    category: 'invitations',
    origin: origins.berlin,
    actor: members.margaret,
    payload: {
      organization_invitation_id: 'orginv_2yN7kJ1wE6',
      organization_id: ORG_ID,
      organization_name: ORG_NAME,
      email_address: 'john.mccarthy@example.com',
      role: 'org:member',
      requesting_user_id: 'user_2yM3hS9qJx7',
    },
  },
  {
    ago: 6 * DAY,
    type: 'organization_membership.deleted',
    description: 'Removed Ken Thompson from the organization',
    category: 'members',
    origin: origins.laptop,
    actor: members.ada,
    payload: {
      organization_membership_id: 'orgmem_2yK2sF8hY4',
      organization_id: ORG_ID,
      organization_name: ORG_NAME,
      user_id: 'user_2yK2sF8hY0',
      role: 'org:member',
    },
  },
  {
    ago: 6 * DAY + 3 * HOUR,
    type: 'data_export.requested',
    description: 'Requested a full workspace export',
    category: 'application',
    source: 'application',
    origin: origins.phone,
    actor: members.katherine,
    payload: { export_id: 'exp_1180', scope: 'workspace', include_attachments: true, estimated_size_mb: 812 },
  },
  {
    ago: 8 * DAY,
    type: 'organization.logo.updated',
    description: 'Changed the organization logo',
    category: 'settings',
    origin: origins.laptop,
    actor: members.ada,
    payload: {
      organization_id: ORG_ID,
      organization_name: ORG_NAME,
      image_url: 'https://img.clerk.com/eyJsb2dvIjp0cnVlfQ',
    },
  },
  {
    ago: 9 * DAY,
    type: 'organization_membership.role_updated',
    description: "Changed Katherine Johnson's role to Member",
    category: 'members',
    origin: origins.london,
    actor: members.grace,
    payload: {
      organization_membership_id: 'orgmem_2yJ5tG3cU9',
      organization_id: ORG_ID,
      organization_name: ORG_NAME,
      user_id: 'user_2yJ5tG3cU0',
      previous_role: 'org:admin',
      role: 'org:member',
    },
  },
  {
    ago: 11 * DAY,
    type: 'organization_invitation.created',
    description: 'Invited frances.allen@example.com as Member',
    category: 'invitations',
    origin: origins.london,
    actor: members.grace,
    payload: {
      organization_invitation_id: 'orginv_2yP3mL6vQ2',
      organization_id: ORG_ID,
      organization_name: ORG_NAME,
      email_address: 'frances.allen@example.com',
      role: 'org:member',
      expires_in_days: 30,
      notify: true,
    },
  },
];

const userCategories: SelectItem[] = [
  { value: 'all', label: 'All events' },
  { value: 'sessions', label: 'Sign-ins and sessions' },
  { value: 'security', label: 'Security' },
  { value: 'account', label: 'Account' },
  { value: 'application', label: `${APPLICATION_NAME} activity` },
];

const orgCategories: SelectItem[] = [
  { value: 'all', label: 'All events' },
  { value: 'members', label: 'Members' },
  { value: 'invitations', label: 'Invitations' },
  { value: 'settings', label: 'Settings' },
  { value: 'application', label: `${APPLICATION_NAME} activity` },
];

function toEvents(seeds: EventSeed[], locale: string, prefix: string): LogEvent[] {
  const date = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' });
  const time = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', second: '2-digit' });
  const full = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'long' });
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  return [...seeds]
    .sort((a, b) => a.ago - b.ago)
    .map((seed, index) => {
      const at = new Date(NOW - seed.ago);
      const minutes = Math.round(seed.ago / MINUTE);
      return {
        id: `${prefix}_${String(index).padStart(3, '0')}`,
        type: seed.type,
        description: seed.description,
        category: seed.category,
        source: seed.source ?? 'clerk',
        dateLabel: date.format(at),
        timeLabel: time.format(at),
        timestampLabel: full.format(at),
        relativeLabel:
          minutes < 60
            ? relative.format(-minutes, 'minute')
            : minutes < 60 * 24
              ? relative.format(-Math.round(minutes / 60), 'hour')
              : relative.format(-Math.round(minutes / (60 * 24)), 'day'),
        ipAddress: seed.origin?.ipAddress,
        location: seed.origin?.location,
        deviceLabel: seed.origin?.deviceLabel,
        actor: seed.actor,
        payload: seed.payload,
      };
    });
}

function useLogsFixture({
  seeds,
  prefix,
  categories,
}: {
  seeds: EventSeed[];
  prefix: string;
  categories: SelectItem[];
}) {
  const locale = useLocale();
  const base = useMemo(() => toEvents(seeds, locale, prefix), [seeds, locale, prefix]);
  const all = useChaosFixture(base, items =>
    chaosRows(items, 60).map((event, index) => ({
      ...event,
      id: `${event.id}_${index}`,
      description: chaosText(event.description),
      actor: event.actor ? { ...event.actor, name: chaosName(index) } : undefined,
    })),
  );
  const [searchValue, setSearchValue] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const query = searchValue.trim().toLowerCase();
  const filtered = all.filter(
    event =>
      (category === 'all' || event.category === category) &&
      (!query ||
        [event.description, event.type, event.ipAddress, event.actor?.name, event.location?.city]
          .filter(Boolean)
          .some(value => String(value).toLowerCase().includes(query))),
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const events = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const selectedIndex = filtered.findIndex(event => event.id === selectedId);
  const selected = selectedIndex === -1 ? null : filtered[selectedIndex];
  const goTo = (index: number) => {
    const next = filtered[index];
    if (next) {
      setSelectedId(next.id);
      setPage(Math.floor(index / pageSize) + 1);
    }
  };

  return {
    table: {
      events,
      totalCount: filtered.length,
      applicationName: APPLICATION_NAME,
      searchValue,
      onSearchChange: (value: string) => {
        setSearchValue(value);
        setPage(1);
      },
      categories,
      category,
      onCategoryChange: (value: string) => {
        setCategory(value);
        setPage(1);
      },
      page: currentPage,
      pageSize,
      onPageChange: setPage,
      onPageSizeChange: (value: number) => {
        setPageSize(value);
        setPage(1);
      },
      selectedId: open ? selectedId : null,
      onSelect: (eventId: string) => {
        setSelectedId(eventId);
        setOpen(true);
      },
    },
    detail: {
      event: selected,
      open,
      onOpenChange: setOpen,
      applicationName: APPLICATION_NAME,
      onPrevious: selectedIndex > 0 ? () => goTo(selectedIndex - 1) : undefined,
      onNext: selectedIndex !== -1 && selectedIndex < filtered.length - 1 ? () => goTo(selectedIndex + 1) : undefined,
    },
  };
}

export function UserProfileLogsPanelExample() {
  const { table, detail } = useLogsFixture({ seeds: userSeeds, prefix: 'evt_user', categories: userCategories });
  return (
    <LogsPanelView
      slot='user-profile-logs-panel'
      title='Logs'
      description='Recent activity on your account. If you see something you don’t recognize, change your password and sign out of other devices.'
      table={table}
      detail={detail}
    />
  );
}

export function OrganizationProfileAdminLogsPanelExample() {
  const { table, detail } = useLogsFixture({ seeds: orgSeeds, prefix: 'evt_org', categories: orgCategories });
  return (
    <LogsPanelView
      slot='organization-profile-admin-logs-panel'
      title='Admin Logs'
      description='Changes to members, invitations, and settings in this organization. Only admins can see this page.'
      table={{ ...table, showActor: true }}
      detail={{ ...detail, showActor: true }}
    />
  );
}
