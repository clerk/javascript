import * as stylex from '@stylexjs/stylex';
import { type ReactNode, useId } from 'react';

import { Avatar } from '../../components/avatar';
import { Badge } from '../../components/badge';
import { Banner } from '../../components/banner';
import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { Checkbox } from '../../components/checkbox';
import { Dialog } from '../../components/dialog';
import { EmptyState } from '../../components/empty-state';
import { Field } from '../../components/field';
import { Icon } from '../../components/icon';
import { Input } from '../../components/input';
import { Radio } from '../../components/radio';
import { Reveal } from '../../components/reveal';
import { scrollAreaViewport } from '../../components/scroll-area';
import { Select } from '../../components/select';
import { RowAvatar } from '../../components/switcher/switcher-avatar';
import { Text } from '../../components/text';
import { Tooltip } from '../../components/tooltip';
import { VisuallyHidden } from '../../components/visually-hidden';
import { ArrowLeftRight } from '../../icons/glyphs/arrow-left-right';
import { ExclamationCircle } from '../../icons/glyphs/exclamation-circle';
import { fill, plural, rich, useLocale } from '../../localization';
import { Logomark, useLogomark } from '../../logomark/logomark';
import { Form } from '../../primitives/form';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { initials } from '../../utils/initials';
import { knownOAuthClientLogo } from './known-clients';
import { styles } from './oauth-consent.styles';
import type {
  OAuthConsentClientIdentity,
  OAuthConsentOrganization,
  OAuthConsentOrganizationAccess,
  OAuthConsentOrganizationSelection,
  OAuthConsentScopeItem,
  OAuthConsentScopeSelection,
  OAuthConsentViewProps,
} from './oauth-consent.types';

function getClientLogo({ oauthApplicationLogoUrl, knownClient }: OAuthConsentViewProps) {
  if (oauthApplicationLogoUrl) {
    return { src: oauthApplicationLogoUrl };
  }
  return knownClient ? { render: knownOAuthClientLogo(knownClient) } : undefined;
}

function ConsentLogos(props: OAuthConsentViewProps) {
  const logomark = useLogomark({ logomarkUrl: props.applicationLogomarkUrl, logoUrl: props.applicationLogoUrl });
  const clientLogo = getClientLogo(props);
  return (
    <Card.Media xstyle={styles.logos}>
      <Avatar.Root size='lg'>
        {clientLogo ? (
          <Avatar.Image
            alt={props.oauthApplicationName}
            {...clientLogo}
          />
        ) : null}
        {/* The title already names the OAuth application, so its initials stay out of the accessibility tree. */}
        <Avatar.Fallback
          variant={clientLogo ? 'skeleton' : 'initials'}
          aria-hidden
        >
          {initials(props.oauthApplicationName)}
        </Avatar.Fallback>
      </Avatar.Root>
      {logomark ? (
        <Icon
          glyph={ArrowLeftRight}
          aria-hidden
        />
      ) : null}
      {logomark ? (
        <Logomark
          size='lg'
          logomark={logomark}
          alt={props.applicationName}
        />
      ) : null}
    </Card.Media>
  );
}

export function OAuthConsentView(props: OAuthConsentViewProps) {
  const { messages: m, oauthApplicationName } = props;
  const scopeListTitleId = useId();
  const postedOrganizationIds =
    props.organizations.length === 0 ? [] : organizationIdsToPost(props.organizations, props.organizationSelection);
  const organizationLimit = props.organizationSelection.multiple ? props.organizationSelection.limit : undefined;
  const exceedsOrganizationLimit = organizationLimit !== undefined && postedOrganizationIds.length > organizationLimit;
  const missingOrganization =
    props.organizationSelection.multiple === true &&
    props.organizations.length > 0 &&
    postedOrganizationIds.length === 0;
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
      <Card.Header>
        <ConsentLogos {...props} />
        <Card.Title>{fill(m.title, { oauthApplicationName, applicationName: props.applicationName })}</Card.Title>
        <Card.Description>
          {rich(m.subtitle, {
            values: { oauthApplicationName, domain },
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
        {props.clientIdentity ? (
          <ClientIdentityBanner
            messages={m}
            identity={props.clientIdentity}
            name={oauthApplicationName || props.applicationName}
          />
        ) : null}
        {props.organizations.length > 0 ? (
          <OrganizationField
            messages={m}
            organizations={props.organizations}
            selection={props.organizationSelection}
            disabled={props.pendingAction !== undefined}
          />
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
                  <ScopeOption
                    item={item}
                    selection={props.scopeSelection}
                    disabled={props.pendingAction !== undefined}
                    requiredLabel={m.required}
                  />
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
        <input
          type='hidden'
          name='scope'
          value={props.scope}
        />
        {postedOrganizationIds.length > 0 ? (
          <input
            type='hidden'
            name='organization_id'
            value={postedOrganizationIds.join(' ')}
          />
        ) : null}
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
            disabled={props.pendingAction === 'deny' || exceedsOrganizationLimit || missingOrganization}
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
          size='xs'
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
        <Card.Root renderBranding={false}>
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

function organizationIdsToPost(
  organizations: OAuthConsentOrganization[],
  selection: OAuthConsentOrganizationSelection,
): readonly string[] {
  if (!selection.multiple) {
    return selection.organizationId === null ? [] : [selection.organizationId];
  }
  if (selection.access === 'all') {
    return organizations.map(organization => organization.value);
  }
  return selection.organizationIds;
}

interface OrganizationFieldProps {
  messages: OAuthConsentViewProps['messages'];
  organizations: OAuthConsentOrganization[];
  selection: OAuthConsentOrganizationSelection;
  disabled: boolean;
}

function OrganizationField({ messages: m, organizations, selection, disabled }: OrganizationFieldProps) {
  if (!selection.multiple) {
    return (
      <Field.Root disabled={disabled}>
        <Field.Label>{m.organizationLabel}</Field.Label>
        <Select.Root
          items={organizations}
          value={selection.organizationId}
          alignItemWithTrigger={false}
          onValueChange={selection.onOrganizationIdChange}
        >
          <Select.Trigger />
          <OrganizationPopup organizations={organizations} />
        </Select.Root>
      </Field.Root>
    );
  }
  if (selection.access === undefined) {
    return (
      <OrganizationMultiSelect
        messages={m}
        organizations={organizations}
        organizationIds={selection.organizationIds}
        onChange={selection.onOrganizationIdsChange}
        limit={selection.limit}
        disabled={disabled}
        label={<Field.Label>{m.organizationLabel}</Field.Label>}
      />
    );
  }
  return (
    <OrganizationAccess
      messages={m}
      organizations={organizations}
      access={selection.access}
      onAccessChange={selection.onAccessChange}
      organizationIds={selection.organizationIds}
      onOrganizationIdsChange={selection.onOrganizationIdsChange}
      disabled={disabled}
    />
  );
}

function OrganizationAccess({
  messages: m,
  organizations,
  access,
  onAccessChange,
  organizationIds,
  onOrganizationIdsChange,
  disabled,
}: Omit<OrganizationFieldProps, 'selection'> & {
  access: OAuthConsentOrganizationAccess;
  onAccessChange: (access: OAuthConsentOrganizationAccess) => void;
  organizationIds: readonly string[];
  onOrganizationIdsChange: (organizationIds: string[]) => void;
}) {
  const labelId = useId();

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
        value={access}
        disabled={disabled}
        onValueChange={next => {
          onAccessChange(next);
          if (next === 'all') {
            onOrganizationIdsChange([]);
          }
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
      <Reveal
        open={access === 'selected'}
        xstyle={styles.organizationPicker}
      >
        <OrganizationMultiSelect
          messages={m}
          organizations={organizations}
          organizationIds={organizationIds}
          onChange={onOrganizationIdsChange}
          disabled={disabled}
          triggerLabel={m.selectOrganizations}
          selectAllLabel={m.selectAllOrganizations}
        />
      </Reveal>
    </div>
  );
}

function OrganizationMultiSelect({
  messages: m,
  organizations,
  organizationIds,
  onChange,
  limit,
  disabled,
  label,
  triggerLabel,
  selectAllLabel,
}: {
  messages: OAuthConsentViewProps['messages'];
  organizations: OAuthConsentOrganization[];
  organizationIds: readonly string[];
  onChange: (organizationIds: string[]) => void;
  limit?: number;
  disabled: boolean;
  label?: ReactNode;
  triggerLabel?: string;
  selectAllLabel?: string;
}) {
  const locale = useLocale();
  const atLimit = limit !== undefined && organizationIds.length >= limit;
  const overLimit = limit !== undefined && organizationIds.length > limit;
  const summarize = (value: unknown[]) =>
    value.length === 1
      ? organizations.find(organization => organization.value === value[0])?.label
      : plural(m.organizationCount, value.length, locale);

  return (
    <Field.Root
      disabled={disabled}
      invalid={overLimit}
    >
      {label}
      <Select.Root
        multiple
        items={organizations}
        value={[...organizationIds]}
        alignItemWithTrigger={false}
        onValueChange={onChange}
      >
        <Select.Trigger
          aria-label={triggerLabel}
          placeholder={m.selectOrganizations}
          xstyle={triggerLabel ? styles.organizationPickerTrigger : undefined}
        >
          {summarize}
        </Select.Trigger>
        <OrganizationPopup
          organizations={organizations}
          isDisabled={value => atLimit && !organizationIds.includes(value)}
          selectAllLabel={selectAllLabel}
        />
      </Select.Root>
      {limit !== undefined && organizations.length > limit ? (
        <Field.Description>{fill(m.organizationLimit, { limit })}</Field.Description>
      ) : null}
      <Field.Message>
        <Field.Error>{overLimit ? fill(m.organizationLimitExceeded, { limit }) : null}</Field.Error>
      </Field.Message>
    </Field.Root>
  );
}

function OrganizationPopup({
  organizations,
  isDisabled,
  selectAllLabel,
}: {
  organizations: OAuthConsentOrganization[];
  isDisabled?: (value: string) => boolean;
  selectAllLabel?: string;
}) {
  return (
    <Select.Popup>
      {selectAllLabel ? (
        <>
          <Select.SelectAll label={selectAllLabel} />
          <Select.Separator />
        </>
      ) : null}
      {organizations.map(organization => (
        <Select.Item
          key={organization.value}
          value={organization.value}
          label={organization.label}
          disabled={isDisabled?.(organization.value)}
        >
          <Select.Media>
            <RowAvatar
              name={organization.label}
              imageUrl={organization.imageUrl}
              shape='square'
              size='fit'
            />
          </Select.Media>
          <Select.Content>
            <Select.Label>{organization.label}</Select.Label>
          </Select.Content>
          <Select.ItemIndicator />
        </Select.Item>
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

function ClientIdentityBanner({
  messages: m,
  identity,
  name,
}: {
  messages: OAuthConsentViewProps['messages'];
  identity: OAuthConsentClientIdentity;
  name: string;
}) {
  return identity.registration === 'dynamic' ? (
    <Banner.Root color='warning'>
      <Banner.Description>{fill(m.clientIdentity.dynamic, { oauthApplicationName: name })}</Banner.Description>
    </Banner.Root>
  ) : (
    <Banner.Root color='neutral'>
      <Banner.Description>
        {fill(m.clientIdentity.metadataDocument, { metadataHost: identity.metadataHost })}
      </Banner.Description>
    </Banner.Root>
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
