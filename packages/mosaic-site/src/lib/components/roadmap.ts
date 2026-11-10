import { COMPONENT_META } from '@/lib/components/meta';

export type RoadmapStatus = 'done' | 'soon';
export type RoadmapItem = {
  slug: string;
  title: string;
  status: RoadmapStatus;
};

const PLANNED: Pick<RoadmapItem, 'slug' | 'title'>[] = [
  { slug: 'sign-in', title: '<SignIn />' },
  { slug: 'sign-up', title: '<SignUp />' },
  { slug: 'google-one-tap', title: '<GoogleOneTap />' },
  { slug: 'user-avatar', title: '<UserAvatar />' },
  { slug: 'pricing-table', title: '<PricingTable />' },
  { slug: 'checkout', title: '<Checkout />' },
  { slug: 'plan-details', title: '<PlanDetails />' },
  { slug: 'subscription-details', title: '<SubscriptionDetails />' },
  { slug: 'api-keys', title: '<APIKeys />' },
  { slug: 'oauth-consent', title: '<OAuthConsent />' },
  { slug: 'agent-approval', title: '<AgentApproval />' },
  { slug: 'task-choose-organization', title: '<TaskChooseOrganization />' },
  { slug: 'task-reset-password', title: '<TaskResetPassword />' },
  { slug: 'task-setup-mfa', title: '<TaskSetupMFA />' },
];

export const ROADMAP: RoadmapItem[] = [
  ...COMPONENT_META.map(item => ({
    slug: item.slug,
    title: item.title,
    status: item.comingSoon ? ('soon' as const) : ('done' as const),
  })),
  ...PLANNED.map(item => ({ ...item, status: 'soon' as const })),
].sort((a, b) => Number(b.status === 'done') - Number(a.status === 'done'));
