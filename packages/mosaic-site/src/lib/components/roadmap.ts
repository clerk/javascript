import { COMPONENT_META } from '@/lib/components/meta';
import { STORY_BLOCKS } from '@/lib/components/stories';

export type RoadmapStatus = 'done' | 'soon';
export type RoadmapItem = {
  slug: string;
  title: string;
  status: RoadmapStatus;
};

const PLANNED: Pick<RoadmapItem, 'slug' | 'title'>[] = [
  { slug: 'sign-in', title: 'Sign in' },
  { slug: 'sign-up', title: 'Sign up' },
  { slug: 'google-one-tap', title: 'Google One Tap' },
  { slug: 'pricing-table', title: 'Pricing table' },
  { slug: 'checkout', title: 'Checkout' },
  { slug: 'plan-details', title: 'Plan details' },
  { slug: 'subscription-details', title: 'Subscription details' },
  { slug: 'api-keys', title: 'API keys' },
  { slug: 'oauth-consent', title: 'OAuth consent' },
  { slug: 'agent-approval', title: 'Agent approval' },
  { slug: 'task-choose-organization', title: 'Choose organization' },
  { slug: 'task-reset-password', title: 'Reset password' },
  { slug: 'task-setup-mfa', title: 'Set up MFA' },
];

export const ROADMAP: RoadmapItem[] = [
  ...COMPONENT_META.map(item => ({
    slug: item.slug,
    title: item.title,
    status: item.comingSoon && !STORY_BLOCKS[item.slug] ? ('soon' as const) : ('done' as const),
  })),
  ...PLANNED.map(item => ({ ...item, status: STORY_BLOCKS[item.slug] ? ('done' as const) : ('soon' as const) })),
].sort((a, b) => Number(b.status === 'done') - Number(a.status === 'done'));
