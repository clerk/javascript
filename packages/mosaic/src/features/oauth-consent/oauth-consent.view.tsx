import * as stylex from '@stylexjs/stylex';
import { type ReactNode, useId } from 'react';

import { Badge } from '../../components/badge';
import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { Checkbox } from '../../components/checkbox';
import { Dialog } from '../../components/dialog';
import { EmptyState } from '../../components/empty-state';
import { Field } from '../../components/field';
import { Input } from '../../components/input';
import { Select } from '../../components/select';
import { Text } from '../../components/text';
import { Tooltip } from '../../components/tooltip';
import { fill, rich } from '../../localization';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { styles } from './oauth-consent.styles';
import type { OAuthConsentScopeItem, OAuthConsentScopeSelection, OAuthConsentViewProps } from './oauth-consent.types';

export function OAuthConsentView(props: OAuthConsentViewProps) {
  const { messages: m, oauthApplicationName, organizationId } = props;
  const scopeListTitleId = useId();
  const openRedirectUrl = () => props.onRedirectUrlOpenChange(true);
  const domain = (
    <RedirectDomainButton
      domain={props.redirectDomain}
      label={m.viewFullUrl}
      onClick={openRedirectUrl}
    />
  );

  return (
    <>
      <Card.Root
        renderBranding={props.renderBranding}
        render={
          <form
            method='post'
            action={props.actionUrl}
          />
        }
      >
        <Card.Header xstyle={styles.centered}>
          <Card.Title>{fill(m.title, { oauthApplicationName, applicationName: props.applicationName })}</Card.Title>
          <Card.Description>
            {rich(m.subtitle, {
              values: { oauthApplicationName, domain: props.redirectDomain },
              components: { nowrap: renderNowrap },
            })}
          </Card.Description>
        </Card.Header>
        <Card.Content>
          {props.organizations.length > 0 ? (
            <Field.Root>
              <Field.Label>{m.organizationLabel}</Field.Label>
              <Select.Root
                items={props.organizations}
                value={organizationId ?? undefined}
                onValueChange={value => {
                  if (typeof value === 'string') {
                    props.onOrganizationChange(value);
                  }
                }}
              >
                <Select.Trigger />
                <Select.Popup />
              </Select.Root>
            </Field.Root>
          ) : null}
          {props.scopes.length > 0 ? (
            <div {...mergeStyleProps(themeProps('oauth-consent-scopes'), stylex.props(styles.scopes))}>
              <Text
                id={scopeListTitleId}
                size='sm'
                xstyle={styles.scopesTitle}
              >
                {fill(m.scopeListTitle, { applicationName: oauthApplicationName })}
              </Text>
              <ul
                aria-labelledby={scopeListTitleId}
                {...stylex.props(reset.base, styles.scopeList)}
              >
                {props.scopes.map(item => (
                  <li
                    key={item.scope}
                    {...stylex.props(styles.scopeRow)}
                  >
                    {props.scopeSelection ? (
                      <ScopeOption
                        item={item}
                        selection={props.scopeSelection}
                        requiredLabel={m.required}
                      />
                    ) : (
                      <ScopeText
                        item={item}
                        requiredLabel={m.required}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {props.forwardedParams.map(([name, value]) => (
            <input
              key={name}
              type='hidden'
              name={name}
              value={value}
            />
          ))}
          {organizationId !== null && props.organizations.length > 0 ? (
            <input
              type='hidden'
              name='organization_id'
              value={organizationId}
            />
          ) : null}
          <div {...stylex.props(styles.actions)}>
            <Button
              type='submit'
              name='consented'
              value='false'
              variant='outline'
              fullWidth
            >
              {m.deny}
            </Button>
            <Button
              type='submit'
              name='consented'
              value='true'
              fullWidth
            >
              {m.allow}
            </Button>
          </div>
          <Text
            size='xs'
            color='foreground-secondary'
            xstyle={styles.centered}
          >
            {rich(m.redirectNotice, { values: { domain } })}
            {props.hasOfflineAccess ? ` ${m.offlineAccessNotice}` : null}
          </Text>
        </Card.Content>
        <Card.Footer xstyle={styles.centered}>
          <Text
            size='sm'
            color='foreground-secondary'
          >
            {fill(m.signedInAs, { identifier: props.identifier })}
          </Text>
        </Card.Footer>
      </Card.Root>
      <Dialog.Root
        open={props.isRedirectUrlOpen}
        onOpenChange={props.onRedirectUrlOpenChange}
      >
        <Dialog.Popup>
          <Card.Root
            elevation='overlay'
            renderBranding={false}
          >
            <Card.Header>
              <Card.Title>{m.redirectUrlTitle}</Card.Title>
              <Card.Description>
                {fill(m.redirectUrlDescription, { applicationName: oauthApplicationName })}
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <Input
                readOnly
                value={props.redirectUrl}
                aria-label={m.redirectUrlTitle}
                {...themeProps('oauth-consent-redirect-url')}
              />
            </Card.Content>
          </Card.Root>
        </Dialog.Popup>
      </Dialog.Root>
    </>
  );
}

function ScopeOption({
  item,
  selection,
  requiredLabel,
}: {
  item: OAuthConsentScopeItem;
  selection: OAuthConsentScopeSelection;
  requiredLabel: string;
}) {
  return (
    <Field.Root
      orientation='horizontal'
      disabled={item.required}
    >
      <Checkbox
        checked={item.required === true || selection.checked.includes(item.scope)}
        onChange={event => selection.onCheckedChange(item.scope, event.currentTarget.checked)}
      />
      <Field.Content>
        <div {...stylex.props(styles.scopeLabel)}>
          <Field.Label>{item.label}</Field.Label>
          {item.required ? <Badge color='neutral'>{requiredLabel}</Badge> : null}
        </div>
        {item.description ? <Field.Description>{item.description}</Field.Description> : null}
      </Field.Content>
    </Field.Root>
  );
}

function ScopeText({ item, requiredLabel }: { item: OAuthConsentScopeItem; requiredLabel: string }) {
  return (
    <div {...stylex.props(styles.scopeText)}>
      <div {...stylex.props(styles.scopeLabel)}>
        <Text>{item.label}</Text>
        {item.required ? <Badge color='neutral'>{requiredLabel}</Badge> : null}
      </div>
      {item.description ? (
        <Text
          size='xs'
          color='foreground-secondary'
        >
          {item.description}
        </Text>
      ) : null}
    </div>
  );
}

function renderNowrap(children: ReactNode) {
  return <span {...stylex.props(styles.nowrap)}>{children}</span>;
}

function RedirectDomainButton({ domain, label, onClick }: { domain: string; label: string; onClick: () => void }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          <Button
            type='button'
            variant='link'
            onClick={onClick}
            xstyle={styles.inlineLink}
          />
        }
      >
        {domain}
      </Tooltip.Trigger>
      <Tooltip.Popup>{label}</Tooltip.Popup>
    </Tooltip.Root>
  );
}

export interface OAuthConsentErrorViewProps {
  message: string;
}

export function OAuthConsentErrorView({ message }: OAuthConsentErrorViewProps) {
  return (
    <Card.Root>
      <Card.Content>
        <EmptyState.Root role='alert'>
          <EmptyState.Icon name='exclamation-circle' />
          <EmptyState.Label>{message}</EmptyState.Label>
        </EmptyState.Root>
      </Card.Content>
    </Card.Root>
  );
}
