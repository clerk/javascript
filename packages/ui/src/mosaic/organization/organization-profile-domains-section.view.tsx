import type { OrganizationDomainResource, OrganizationEnrollmentMode } from '@clerk/shared/types';

import { Box } from '../components/box';
import { Button } from '../components/button';
import { Skeleton } from '../components/skeleton';
import { Text } from '../components/text';
import type { Snapshot } from '../machine/types';
import { alpha } from '../utils';
import type {
  OrganizationProfileDomainsList,
  OrganizationProfileEnrollmentOption,
} from './organization-profile-domains-section.controller';
import type {
  OrganizationProfileDomainsSectionAddVerifyContext,
  OrganizationProfileDomainsSectionAddVerifyEvent,
} from './organization-profile-domains-section-add-verify.machine';
import { OrganizationProfileDomainsSectionAddVerifyView } from './organization-profile-domains-section-add-verify.view';
import type {
  OrganizationProfileDomainsSectionEnrollmentContext,
  OrganizationProfileDomainsSectionEnrollmentEvent,
} from './organization-profile-domains-section-enrollment.machine';
import { OrganizationProfileDomainsSectionEnrollmentView } from './organization-profile-domains-section-enrollment.view';
import type {
  OrganizationProfileDomainsSectionRemoveContext,
  OrganizationProfileDomainsSectionRemoveEvent,
} from './organization-profile-domains-section-remove.machine';
import { OrganizationProfileDomainsSectionRemoveView } from './organization-profile-domains-section-remove.view';

interface OrganizationProfileDomainsSectionViewProps {
  canManage: boolean;
  list: OrganizationProfileDomainsList;
  enrollmentOptions: OrganizationProfileEnrollmentOption[];
  addVerify: {
    snapshot: Snapshot<OrganizationProfileDomainsSectionAddVerifyContext>;
    send: (event: OrganizationProfileDomainsSectionAddVerifyEvent) => void;
  };
  enrollment: {
    snapshot: Snapshot<OrganizationProfileDomainsSectionEnrollmentContext>;
    send: (event: OrganizationProfileDomainsSectionEnrollmentEvent) => void;
    canSubmit: boolean;
  };
  remove: {
    snapshot: Snapshot<OrganizationProfileDomainsSectionRemoveContext>;
    send: (event: OrganizationProfileDomainsSectionRemoveEvent) => void;
  };
}

/** A verified domain exposes an affiliation (email) verification with a `verified` status. */
export function isDomainVerified(domain: OrganizationDomainResource): boolean {
  return domain.verification?.status === 'verified';
}

const enrollmentModeLabels: Record<OrganizationEnrollmentMode, string> = {
  manual_invitation: 'Manual invitation',
  automatic_invitation: 'Automatic invitation',
  automatic_suggestion: 'Automatic suggestion',
  enterprise_sso: 'Enterprise SSO',
};

function DomainBadge({ domain }: { domain: OrganizationDomainResource }) {
  const label = isDomainVerified(domain) ? enrollmentModeLabels[domain.enrollmentMode] : 'Unverified';
  return (
    <Box
      render={p => <span {...p} />}
      sx={t => ({
        ...t.text('xs'),
        flexShrink: 0,
        paddingInline: t.spacing(2),
        paddingBlock: t.spacing(0.5),
        borderRadius: t.rounded.full,
        backgroundColor: t.alpha('primary', 8),
        color: t.color.mutedForeground,
      })}
    >
      {label}
    </Box>
  );
}

interface DomainRowProps {
  domain: OrganizationDomainResource;
  canManage: boolean;
  onManage: (domain: OrganizationDomainResource) => void;
  onVerify: (domain: OrganizationDomainResource) => void;
  onRemove: (domain: OrganizationDomainResource) => void;
}

function DomainRow({ domain, canManage, onManage, onVerify, onRemove }: DomainRowProps) {
  const verified = isDomainVerified(domain);
  return (
    <Box
      sx={t => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: t.spacing(3),
        paddingBlock: t.spacing(3),
        borderBlockEnd: `1px solid light-dark(${alpha('#000', 6)},${alpha('#fff', 6)})`,
      })}
    >
      <Box
        sx={t => ({
          display: 'flex',
          alignItems: 'center',
          gap: t.spacing(2),
          minWidth: 0,
        })}
      >
        <Text
          render={p => <span {...p} />}
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {domain.name}
        </Text>
        <DomainBadge domain={domain} />
      </Box>
      {canManage && (
        <Box sx={t => ({ display: 'flex', alignItems: 'center', gap: t.spacing(1), flexShrink: 0 })}>
          {verified ? (
            <Button
              variant='ghost'
              size='sm'
              type='button'
              onClick={() => onManage(domain)}
            >
              Manage
            </Button>
          ) : (
            <Button
              variant='ghost'
              size='sm'
              type='button'
              onClick={() => onVerify(domain)}
            >
              Verify
            </Button>
          )}
          <Button
            variant='ghost'
            size='sm'
            intent='destructive'
            type='button'
            onClick={() => onRemove(domain)}
          >
            Remove
          </Button>
        </Box>
      )}
    </Box>
  );
}

export function OrganizationProfileDomainsSectionView({
  canManage,
  list,
  enrollmentOptions,
  addVerify,
  enrollment,
  remove,
}: OrganizationProfileDomainsSectionViewProps) {
  const isInitialLoading = list.isLoading && list.data.length === 0;

  return (
    <Box
      sx={{
        width: '100%',
        containerType: 'inline-size',
      }}
    >
      <Box>
        <Box
          render={p => <h2 {...p} />}
          sx={t => ({
            ...t.text('base'),
            fontWeight: t.font.semibold,
          })}
        >
          Domains
        </Box>
        <Box
          render={p => <p {...p} />}
          sx={t => ({
            ...t.text('sm'),
            textWrap: 'balance',
            marginBlockStart: t.spacing(1),
            color: t.color.mutedForeground,
          })}
        >
          Members with an email address at a verified domain can join or be invited to this organization automatically.
        </Box>
      </Box>

      <Box sx={t => ({ marginBlockStart: t.spacing(4) })}>
        {isInitialLoading ? (
          <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(2) })}>
            <Skeleton
              width='100%'
              height='2.5rem'
            />
            <Skeleton
              width='100%'
              height='2.5rem'
            />
          </Box>
        ) : (
          list.data.map(domain => (
            <DomainRow
              key={domain.id}
              domain={domain}
              canManage={canManage}
              onManage={d =>
                enrollment.send({
                  type: 'OPEN',
                  domain: {
                    id: d.id,
                    name: d.name,
                    enrollmentMode: d.enrollmentMode,
                    totalPendingInvitations: d.totalPendingInvitations,
                    totalPendingSuggestions: d.totalPendingSuggestions,
                  },
                })
              }
              onVerify={d => addVerify.send({ type: 'OPEN_VERIFY', domain: { id: d.id, name: d.name } })}
              onRemove={d => remove.send({ type: 'OPEN', domain: { id: d.id, name: d.name } })}
            />
          ))
        )}

        {list.hasNextPage && (
          <Button
            variant='outline'
            type='button'
            disabled={list.isLoading}
            onClick={list.fetchNext}
            style={{ marginBlockStart: 'calc(0.25rem * 3)' }}
          >
            Load more
          </Button>
        )}

        {canManage && (
          <Button
            type='button'
            onClick={() => addVerify.send({ type: 'OPEN_ADD' })}
            style={{ marginBlockStart: 'calc(0.25rem * 4)' }}
          >
            Add domain
          </Button>
        )}
      </Box>

      <OrganizationProfileDomainsSectionAddVerifyView
        snapshot={addVerify.snapshot}
        send={addVerify.send}
        enrollmentOptions={enrollmentOptions}
      />

      <OrganizationProfileDomainsSectionEnrollmentView
        snapshot={enrollment.snapshot}
        send={enrollment.send}
        canSubmit={enrollment.canSubmit}
        enrollmentOptions={enrollmentOptions}
      />

      <OrganizationProfileDomainsSectionRemoveView
        snapshot={remove.snapshot}
        send={remove.send}
      />
    </Box>
  );
}
