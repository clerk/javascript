'use client';

import { ProviderButton, ProviderButtonGroup } from '@clerk/mosaic/components/provider-button';

function ProviderIcon({ provider }: { provider: string }) {
  return (
    <img
      src={`https://img.clerk.com/static/${provider}.svg`}
      alt=''
    />
  );
}

export default function ProviderButtonExample() {
  return (
    <>
      <ProviderButtonGroup>
        <ProviderButton
          icon={<ProviderIcon provider='google' />}
          longLabel='Continue with Google'
          shortLabel='Google'
        />
        <ProviderButton
          icon={<ProviderIcon provider='microsoft' />}
          longLabel='Continue with Microsoft'
          shortLabel='Microsoft'
        />
      </ProviderButtonGroup>
      <ProviderButtonGroup
        layout='stacked'
        disabled
        lastUsed={
          <ProviderButton
            icon={<ProviderIcon provider='google' />}
            longLabel='Continue with Google'
            shortLabel='Google'
            badge='Last used'
          />
        }
      >
        <ProviderButton
          icon={<ProviderIcon provider='microsoft' />}
          longLabel='Continue with Microsoft'
          shortLabel='Microsoft'
          isPending
        />
      </ProviderButtonGroup>
    </>
  );
}
