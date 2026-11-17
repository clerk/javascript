import * as stylex from '@stylexjs/stylex';

import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { Field } from '../../components/field';
import { Select } from '../../components/select';
import { Skeleton } from '../../components/skeleton';
import { Text } from '../../components/text';
import { VisuallyHidden } from '../../components/visually-hidden';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { styles } from './consent.styles';
import type { ConsentMessages } from './consent.types';

const PLACEHOLDER_TITLE = ['Application would like to access', 'your Application account'];
const PLACEHOLDER_SUBTITLE = 'Only continue if you trust Application (example.com).';
const PLACEHOLDER_ORGANIZATIONS = [{ value: 'org', label: 'Organization' }];
const PLACEHOLDER_SCOPE_TITLE = 'This will allow Application access to:';
const PLACEHOLDER_SCOPES = [
  'Verify your identity',
  'Your basic profile information',
  'Your email address',
  'Your organization membership information',
];
const PLACEHOLDER_NOTICE = [
  'If you allow access, this app will redirect you to example.com.',
  "You'll stay signed in until you sign out or revoke access.",
];
const PLACEHOLDER_FOOTER = 'Signed in as name@example.com';

export function ConsentSkeleton({ messages: m }: { messages: ConsentMessages }) {
  return (
    <>
      <VisuallyHidden role='status'>{m.loading}</VisuallyHidden>
      <Card.Header>
        <Card.Title>
          {PLACEHOLDER_TITLE.map(line => (
            <Skeleton
              key={line}
              xstyle={styles.skeletonCentered}
            >
              {line}
            </Skeleton>
          ))}
        </Card.Title>
        <Card.Description>
          <Skeleton xstyle={styles.skeletonCentered}>{PLACEHOLDER_SUBTITLE}</Skeleton>
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <Field.Root
          disabled
          aria-hidden
        >
          <Field.Label>
            <Skeleton>{m.organizationLabel}</Skeleton>
          </Field.Label>
          <Skeleton xstyle={styles.skeletonFill}>
            <Select.Root
              items={PLACEHOLDER_ORGANIZATIONS}
              value='org'
            >
              <Select.Trigger />
            </Select.Root>
          </Skeleton>
        </Field.Root>
        <div
          aria-hidden
          {...mergeStyleProps(themeProps('consent-scopes'), stylex.props(styles.scopes))}
        >
          <Text
            size='sm'
            xstyle={styles.scopesTitle}
          >
            <Skeleton>{PLACEHOLDER_SCOPE_TITLE}</Skeleton>
          </Text>
          <ul {...stylex.props(reset.base, styles.scopeList)}>
            {PLACEHOLDER_SCOPES.map(label => (
              <li
                key={label}
                {...stylex.props(styles.scopeRow)}
              >
                <div {...stylex.props(styles.scopeText)}>
                  <div {...stylex.props(styles.scopeLabel)}>
                    <Text>
                      <Skeleton>{label}</Skeleton>
                    </Text>
                  </div>
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
          {PLACEHOLDER_NOTICE.map(line => (
            <Skeleton
              key={line}
              xstyle={styles.skeletonCentered}
            >
              {line}
            </Skeleton>
          ))}
        </Text>
      </Card.Content>
      <Card.Footer xstyle={styles.centered}>
        <Text
          size='xs'
          color='foreground-secondary'
        >
          <Skeleton xstyle={styles.skeletonCentered}>{PLACEHOLDER_FOOTER}</Skeleton>
        </Text>
      </Card.Footer>
    </>
  );
}
