import * as stylex from '@stylexjs/stylex';

import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { Field } from '../../components/field';
import { Select } from '../../components/select';
import { Skeleton } from '../../components/skeleton';
import { Text } from '../../components/text';
import { VisuallyHidden } from '../../components/visually-hidden';
import { fill } from '../../localization';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { styles } from './oauth-consent.styles';
import type { OAuthConsentKnownData, OAuthConsentMessages } from './oauth-consent.types';

const PLACEHOLDER_OAUTH_APPLICATION_NAME = 'App';
const PLACEHOLDER_SCOPES = ['View your email address', 'View your profile', 'Verify your identity'];
const PLACEHOLDER_KNOWN: OAuthConsentKnownData = {
  applicationName: 'Application',
  identifier: 'name@example.com',
  redirectUrl: 'https://example.com/oauth/callback',
  redirectDomain: 'example.com',
  actionUrl: '',
  forwardedParams: [],
  renderBranding: false,
  organizations: [],
  defaultOrganizationId: null,
};

export function OAuthConsentSkeleton({
  known,
  messages: m,
}: {
  known: OAuthConsentKnownData | undefined;
  messages: OAuthConsentMessages;
}) {
  const { applicationName, identifier, redirectDomain, organizations, defaultOrganizationId } =
    known ?? PLACEHOLDER_KNOWN;
  const awaitingClerk = known === undefined;

  return (
    <>
      <VisuallyHidden role='status'>{m.loading}</VisuallyHidden>
      <Card.Header xstyle={styles.centered}>
        <Card.Title>
          <Skeleton xstyle={styles.skeletonCentered}>
            {fill(m.title, { oauthApplicationName: PLACEHOLDER_OAUTH_APPLICATION_NAME, applicationName })}
          </Skeleton>
        </Card.Title>
        <Card.Description>
          <Skeleton xstyle={styles.skeletonCentered}>
            {fill(m.subtitle, { oauthApplicationName: PLACEHOLDER_OAUTH_APPLICATION_NAME, domain: redirectDomain })}
          </Skeleton>
        </Card.Description>
      </Card.Header>
      <Card.Content>
        {organizations.length > 0 ? (
          <Field.Root disabled>
            <Field.Label>{m.organizationLabel}</Field.Label>
            <Select.Root
              items={organizations}
              value={defaultOrganizationId ?? undefined}
            >
              <Skeleton xstyle={styles.skeletonFill}>
                <Select.Trigger />
              </Skeleton>
            </Select.Root>
          </Field.Root>
        ) : null}
        <div
          aria-hidden
          {...mergeStyleProps(themeProps('oauth-consent-scopes'), stylex.props(styles.scopes))}
        >
          <Text
            size='sm'
            xstyle={styles.scopesTitle}
          >
            <Skeleton visible={false}>
              {fill(m.scopeListTitle, { applicationName: PLACEHOLDER_OAUTH_APPLICATION_NAME })}
            </Skeleton>
          </Text>
          <ul {...stylex.props(reset.base, styles.scopeList)}>
            {PLACEHOLDER_SCOPES.map(label => (
              <li
                key={label}
                {...stylex.props(styles.scopeRow)}
              >
                <div {...stylex.props(styles.scopeText)}>
                  <Text>
                    <Skeleton>{label}</Skeleton>
                  </Text>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div {...stylex.props(styles.actions)}>
          <Button
            variant='outline'
            fullWidth
            disabled
          >
            {m.deny}
          </Button>
          <Button
            fullWidth
            disabled
          >
            {m.allow}
          </Button>
        </div>
        <Text
          size='xs'
          color='foreground-secondary'
          xstyle={styles.centered}
        >
          <Skeleton xstyle={styles.skeletonCentered}>{fill(m.redirectNotice, { domain: redirectDomain })}</Skeleton>
        </Text>
      </Card.Content>
      <Card.Footer xstyle={styles.centered}>
        <Text
          size='sm'
          color='foreground-secondary'
        >
          <Skeleton
            show={awaitingClerk}
            xstyle={styles.skeletonCentered}
          >
            {fill(m.signedInAs, { identifier })}
          </Skeleton>
        </Text>
      </Card.Footer>
    </>
  );
}
