import type { ReactNode } from 'react';

import { dismissKeylessPrompt } from './keyless-prompt.model';

export type STATES = 'idle' | 'userCreated' | 'claimed' | 'completed';

type DescriptionContent = ReactNode | ((context: { appName: string; instanceUrl: string }) => ReactNode);

type CtaLink = {
  kind: 'link';
  text: string;
  href: string | ((urls: { claimUrl: string; instanceUrl: string }) => string);
};

type CtaAction = {
  kind: 'action';
  text: string;
  onClick: (onDismiss: (() => Promise<unknown>) | undefined | null) => void;
};

type ContentItem = {
  triggerWidth: string;
  title: string;
  description: DescriptionContent;
  cta: CtaLink | CtaAction;
};

const CONTENT: Record<STATES, ContentItem> = {
  idle: {
    triggerWidth: '14.25rem',
    title: 'Configure your application',
    description: (
      <>
        <p>Temporary API keys are enabled so you can get started immediately.</p>
        <ul>
          {['Add SSO connections (eg. GitHub)', 'Set up B2B authentication', 'Enable MFA'].map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>Access the dashboard to customize auth settings and explore Clerk features.</p>
      </>
    ),
    cta: {
      kind: 'link',
      text: 'Configure your application',
      href: ({ claimUrl }) => claimUrl,
    },
  },
  userCreated: {
    triggerWidth: '15.75rem',
    title: "You've created your first user!",
    description: (
      <p>Head to the dashboard to customize authentication settings, view user info, and explore more features.</p>
    ),
    cta: {
      kind: 'link',
      text: 'Configure your application',
      href: ({ claimUrl }) => claimUrl,
    },
  },
  claimed: {
    triggerWidth: '14.25rem',
    title: 'Missing environment keys',
    description: (
      <p>
        You claimed this application but haven&apos;t set keys in your environment. Get them from the Clerk Dashboard.
      </p>
    ),
    cta: {
      kind: 'link',
      text: 'Get API keys',
      href: ({ claimUrl }) => claimUrl,
    },
  },
  completed: {
    triggerWidth: '10.5rem',
    title: 'Your app is ready',
    description: ({ appName, instanceUrl }) => (
      <p>
        Your application{' '}
        <a
          href={instanceUrl}
          target='_blank'
          rel='noopener noreferrer'
        >
          {appName}
        </a>{' '}
        has been configured. You may now customize your settings in the Clerk dashboard.
      </p>
    ),
    cta: {
      kind: 'action',
      text: 'Dismiss',
      onClick: dismissKeylessPrompt,
    },
  },
};

/**
 * Determines the current state based on application lifecycle flags.
 * State precedence: completed -> claimed -> userCreated -> idle
 *
 * Note: This is a structural refactor - the actual runtime behavior for
 * `claimed` and `success` is determined by environment state and props.
 * Currently, `claimed` comes from `environment.authConfig.claimedAt` and
 * `success` is derived from `onDismiss` prop presence + claimed state.
 */
export function getCurrentState(claimed: boolean, success: boolean, isSignedIn: boolean): STATES {
  if (success) {
    return 'completed';
  }
  if (claimed) {
    return 'claimed';
  }
  if (isSignedIn) {
    return 'userCreated';
  }
  return 'idle';
}

type ResolvedContentContext = {
  appName: string;
  instanceUrl: string;
  claimUrl: string;
  onDismiss: (() => Promise<unknown>) | undefined | null;
};

type ResolvedContent = {
  state: STATES;
  triggerWidth: string;
  title: string;
  description: ReactNode;
  cta:
    | {
        kind: 'link';
        text: string;
        href: string;
      }
    | {
        kind: 'action';
        text: string;
        onClick: () => void;
      };
};

/**
 * Gets resolved content from state and context.
 * This is a pure function that can be easily unit tested.
 */
export function getResolvedContent(state: STATES, context: ResolvedContentContext): ResolvedContent {
  const content = CONTENT[state];

  const description =
    typeof content.description === 'function'
      ? content.description({ appName: context.appName, instanceUrl: context.instanceUrl })
      : content.description;

  const ctaItem = content.cta;
  const cta: ResolvedContent['cta'] =
    ctaItem.kind === 'link'
      ? {
          kind: 'link',
          text: ctaItem.text,
          href:
            typeof ctaItem.href === 'function'
              ? ctaItem.href({ claimUrl: context.claimUrl, instanceUrl: context.instanceUrl })
              : ctaItem.href,
        }
      : {
          kind: 'action',
          text: ctaItem.text,
          onClick: () => ctaItem.onClick(context.onDismiss),
        };

  return {
    state,
    triggerWidth: content.triggerWidth,
    title: content.title,
    description,
    cta,
  };
}
