import { inertProps } from '@clerk/shared/inert';
import * as stylex from '@stylexjs/stylex';
import { type ReactNode, useId, useRef } from 'react';

import { Badge } from '../../components/badge';
import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { Checkbox } from '../../components/checkbox';
import { Dialog } from '../../components/dialog';
import { EmptyState } from '../../components/empty-state';
import { Field } from '../../components/field';
import { Input } from '../../components/input';
import { Radio } from '../../components/radio';
import { scrollAreaViewport } from '../../components/scroll-area';
import { Select, type SelectItem } from '../../components/select';
import { Text } from '../../components/text';
import { Tooltip } from '../../components/tooltip';
import { VisuallyHidden } from '../../components/visually-hidden';
import { ExclamationCircle } from '../../icons/glyphs/exclamation-circle';
import { fill, plural, rich, useLocale } from '../../localization';
import { Form } from '../../primitives/form';
import { useTransition } from '../../primitives/hooks';
import { Freeze } from '../../primitives/utils';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { RowAvatar } from '../switcher/switcher-avatar.view';
import { styles } from './oauth-consent.styles';
import type {
  OAuthConsentOrganizationSelection,
  OAuthConsentScopeItem,
  OAuthConsentScopeSelection,
  OAuthConsentViewProps,
} from './oauth-consent.types';

export function OAuthConsentView(props: OAuthConsentViewProps) {
  const { messages: m, oauthApplicationName, organizationId } = props;
  const scopeListTitleId = useId();
  const postedOrganizationIds = props.organizations.length === 0 ? [] : organizationIdsToPost(props);
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
      <VisuallyHidden role='status'>{m.loaded}</VisuallyHidden>
      <Card.Header xstyle={styles.centered}>
        <Card.Title>{fill(m.title, { oauthApplicationName, applicationName: props.applicationName })}</Card.Title>
        <Card.Description>
          {rich(m.subtitle, {
            values: { oauthApplicationName, domain: props.redirectDomain },
            components: { nowrap: renderNowrap },
          })}
        </Card.Description>
      </Card.Header>
      <Card.Content
        render={
          <Form
            method='post'
            action={props.actionUrl}
          />
        }
      >
        {props.organizations.length > 0 && props.organizationSelection ? (
          <OrganizationAccess
            messages={m}
            organizations={props.organizations}
            selection={props.organizationSelection}
            disabled={props.pendingAction !== undefined}
          />
        ) : null}
        {props.organizations.length > 0 && !props.organizationSelection ? (
          <Field.Root disabled={props.pendingAction !== undefined}>
            <Field.Label>{m.organizationLabel}</Field.Label>
            <Select.Root
              items={props.organizations}
              value={organizationId ?? undefined}
              alignItemWithTrigger={false}
              onValueChange={value => {
                if (typeof value === 'string') {
                  props.onOrganizationChange(value);
                }
              }}
            >
              <Select.Trigger />
              <OrganizationPopup organizations={props.organizations} />
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
              {...stylex.props(reset.base, scrollAreaViewport(), styles.scopeList)}
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
                      disabled={props.pendingAction !== undefined}
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
        {postedOrganizationIds.map(id => (
          <input
            key={id}
            type='hidden'
            name='organization_id'
            value={id}
          />
        ))}
        <div {...stylex.props(styles.actions)}>
          <SubmitButton
            name='consented'
            value='false'
            disabled={props.pendingAction === 'allow'}
            isPending={props.pendingAction === 'deny'}
            pendingLabel={m.denying}
            onClick={props.onDeny}
            variant='outline'
            fullWidth
          >
            {m.deny}
          </SubmitButton>
          <SubmitButton
            name='consented'
            value='true'
            disabled={props.pendingAction === 'deny'}
            isPending={props.pendingAction === 'allow'}
            pendingLabel={m.allowing}
            onClick={props.onAllow}
            fullWidth
          >
            {m.allow}
          </SubmitButton>
        </div>
        <Text
          size='xs'
          color='foreground-secondary'
          xstyle={styles.centered}
        >
          {rich(m.redirectNotice, {
            values: { domain },
          })}
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
      <RedirectUrlDialog
        messages={m}
        oauthApplicationName={oauthApplicationName}
        redirectUrl={props.redirectUrl}
        open={props.isRedirectUrlOpen}
        onOpenChange={props.onRedirectUrlOpenChange}
      />
    </>
  );
}

function RedirectUrlDialog({
  messages: m,
  oauthApplicationName,
  redirectUrl,
  open,
  onOpenChange,
}: {
  messages: OAuthConsentViewProps['messages'];
  oauthApplicationName: string;
  redirectUrl: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
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
              value={redirectUrl}
              aria-label={m.redirectUrlTitle}
              {...themeProps('oauth-consent-redirect-url')}
            />
          </Card.Content>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

function organizationIdsToPost({ organizations, organizationId, organizationSelection }: OAuthConsentViewProps) {
  if (!organizationSelection) {
    return organizationId === null ? [] : [organizationId];
  }
  return organizationSelection.access === 'all'
    ? organizations.map(organization => organization.value)
    : organizationSelection.selected;
}

function OrganizationAccess({
  messages: m,
  organizations,
  selection,
  disabled,
}: {
  messages: OAuthConsentViewProps['messages'];
  organizations: SelectItem[];
  selection: OAuthConsentOrganizationSelection;
  disabled: boolean;
}) {
  const labelId = useId();
  const locale = useLocale();
  const summarize = (value: string[]) =>
    value.length === 1
      ? organizations.find(organization => organization.value === value[0])?.label
      : plural(m.organizationCount, value.length, locale);

  return (
    <div {...stylex.props(styles.organizationAccess)}>
      <Text
        id={labelId}
        size='sm'
        xstyle={styles.organizationAccessLabel}
      >
        {m.organizationLabel}
      </Text>
      <Radio.Group
        aria-labelledby={labelId}
        value={selection.access}
        disabled={disabled}
        onValueChange={value => {
          if (value === 'selected') {
            selection.onAccessChange('selected');
            return;
          }
          selection.onAccessChange('all');
          selection.onSelectedChange([]);
        }}
      >
        <Field.Root orientation='horizontal'>
          <Radio.Item value='all' />
          <Field.Content>
            <Field.Label>{m.allOrganizations}</Field.Label>
            <Field.Description>{m.allOrganizationsDescription}</Field.Description>
          </Field.Content>
        </Field.Root>
        <Field.Root orientation='horizontal'>
          <Radio.Item value='selected' />
          <Field.Content>
            <Field.Label>{m.selectedOrganizations}</Field.Label>
            <Field.Description>{m.selectedOrganizationsDescription}</Field.Description>
          </Field.Content>
        </Field.Root>
      </Radio.Group>
      <OrganizationPicker open={selection.access === 'selected'}>
        <Select.Root
          multiple
          items={organizations}
          value={[...selection.selected]}
          onValueChange={selection.onSelectedChange}
        >
          <Select.Trigger
            aria-label={m.selectOrganizations}
            placeholder={m.selectOrganizations}
            disabled={disabled}
            xstyle={styles.organizationPickerTrigger}
          >
            {summarize}
          </Select.Trigger>
          <OrganizationPopup organizations={organizations} />
        </Select.Root>
      </OrganizationPicker>
    </div>
  );
}

function OrganizationPicker({ open, children }: { open: boolean; children: ReactNode }) {
  const element = useRef<HTMLDivElement | null>(null);
  const { mounted, transitionProps } = useTransition({ open, ref: element });
  const hasBeenClosed = useRef(!open);
  if (!open) {
    hasBeenClosed.current = true;
  }
  const effectiveTransitionProps = hasBeenClosed.current
    ? transitionProps
    : { ...transitionProps, 'data-starting-style': undefined, style: undefined };

  return (
    <div
      ref={element}
      {...effectiveTransitionProps}
      {...stylex.props(styles.organizationPicker)}
    >
      <div
        {...inertProps(!open)}
        {...stylex.props(styles.organizationPickerClip)}
      >
        {mounted ? <Freeze frozen={!open}>{children}</Freeze> : null}
      </div>
    </div>
  );
}

function OrganizationPopup({ organizations }: { organizations: SelectItem[] }) {
  return (
    <Select.Popup>
      {organizations.map(organization => (
        <Select.Option
          key={organization.value}
          value={organization.value}
          label={organization.label}
        >
          <Select.Media>
            <RowAvatar
              name={organization.label}
              shape='square'
              size='fit'
            />
          </Select.Media>
          <Select.Content>
            <Select.Label>{organization.label}</Select.Label>
          </Select.Content>
        </Select.Option>
      ))}
    </Select.Popup>
  );
}

function ScopeOption({
  item,
  selection,
  requiredLabel,
  disabled,
}: {
  item: OAuthConsentScopeItem;
  selection: OAuthConsentScopeSelection;
  requiredLabel: string;
  disabled: boolean;
}) {
  return (
    <Field.Root
      orientation='horizontal'
      disabled={item.required === true || disabled}
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

export function OAuthConsentError({ message }: { message: string }) {
  return (
    <Card.Content>
      <EmptyState.Root role='alert'>
        <EmptyState.Icon glyph={ExclamationCircle} />
        <EmptyState.Label>{message}</EmptyState.Label>
      </EmptyState.Root>
    </Card.Content>
  );
}
