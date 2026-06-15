/** @jsxImportSource @emotion/react */
import type { OrganizationProfileProps } from '@clerk/ui/mosaic/aio/organization-profile';
import { OrganizationProfile, organizationProfileRecipe } from '@clerk/ui/mosaic/aio/organization-profile';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'AIO',
  title: 'OrganizationProfile',
  label: 'Org Profile',
  source: 'packages/ui/src/mosaic/aio/organization-profile.tsx',
  styles: organizationProfileRecipe,
};

// Story functions accept Record<string,unknown> (knob values) and cast to the real
// prop type. The cast is unavoidable: knobs are dynamically typed; OrganizationProfile
// has a strict prop interface.
function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as OrganizationProfileProps;
}

export function Default(props: Record<string, unknown>) {
  return <OrganizationProfile {...knobsAsProps(props)} />;
}

export function Tabs(props: Record<string, unknown>) {
  return (
    <OrganizationProfile
      {...knobsAsProps(props)}
      layout='tabs'
    />
  );
}

export function Sidebar(props: Record<string, unknown>) {
  return (
    <OrganizationProfile
      {...knobsAsProps(props)}
      layout='sidebar'
    />
  );
}

export function NoNav(props: Record<string, unknown>) {
  return (
    <OrganizationProfile
      {...knobsAsProps(props)}
      layout='no-nav'
    />
  );
}
