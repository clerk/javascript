import type { OrganizationSwitcherProps } from '../organization-switcher/organization-switcher';

export function switcherTelemetry(props: OrganizationSwitcherProps) {
  return {
    organizationProfileMode: props.organizationProfileUrl ? 'navigation' : 'modal',
    createOrganizationMode: props.createOrganizationUrl ? 'navigation' : 'modal',
    hidePersonal: Boolean(props.hidePersonal),
    skipInvitationScreen: Boolean(props.skipInvitationScreen),
    customMenuItems: props.customMenuItems?.length ?? 0,
    organizationProfileCustomPages: props.organizationProfileProps?.customPages?.length ?? 0,
    customTriggerLabel: props.renderTriggerLabel !== undefined,
    customTriggerBadge: props.renderTriggerBadge !== undefined,
    fallback: props.fallback !== undefined,
  };
}
