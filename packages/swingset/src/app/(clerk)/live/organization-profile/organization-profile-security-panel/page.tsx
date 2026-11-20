'use client';

import { OrganizationProfileSecurityPanel } from '@clerk/mosaic/features/organization-profile/organization-profile-security-panel/organization-profile-security-panel';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useOrganization, useUser } from '@clerk/nextjs';
import Link from 'next/link';

import { LivePageHeader } from '../../../live-page-header';

export default function OrganizationSecurityLivePage() {
  const { isLoaded, isSignedIn } = useUser();
  const { organization } = useOrganization();

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <LivePageHeader title='Organization security'>
          The organization profile Security panel, reading and changing the real SSO connections and SSO bypass allow
          list of the active organization. The SSO connections show to a member with{' '}
          <code>org:sys_entconns:manage</code> when self-serve SSO is on. The panel shows for a member with{' '}
          <code>org:sys_entconns_sso_bypass:manage</code> once the organization has an enterprise connection, or with{' '}
          <code>org:sys_entconns:manage</code> when self-serve SSO is on for the instance and the organization. It
          renders nothing otherwise.
        </LivePageHeader>
        {!isLoaded ? <p className='text-muted-foreground text-sm'>Loading…</p> : null}
        {isLoaded && !isSignedIn ? (
          <p className='text-muted-foreground text-sm'>
            <Link
              href='/sign-in'
              className='text-foreground underline underline-offset-4'
            >
              Sign in
            </Link>{' '}
            and pick an active organization.
          </p>
        ) : null}
        {isLoaded && isSignedIn && !organization ? (
          <p className='text-muted-foreground text-sm'>Pick an active organization to see its Security panel.</p>
        ) : null}
        {isLoaded && isSignedIn ? <OrganizationProfileSecurityPanel /> : null}
      </div>
    </MosaicProvider>
  );
}
