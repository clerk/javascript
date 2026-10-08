import {
  OrganizationPreviewListItems,
  OrganizationPreviewSpinner,
} from '@/ui/common/organizations/OrganizationPreview';
import { Col, descriptors, localizationKeys } from '@/ui/customizables';
import { Action, Actions } from '@/ui/elements/Actions';
import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';
import { Add } from '@/ui/icons';

import { InvitationPreview, MembershipPreview, SuggestionPreview } from './choose-organization-screen.rows';
import type { ChooseOrganizationScreenViewProps } from './choose-organization-screen.types';

export const ChooseOrganizationScreenView = (props: ChooseOrganizationScreenViewProps) => (
  <>
    <Header.Root
      showLogo
      sx={t => ({ padding: `${t.space.$none} ${t.space.$8}` })}
    >
      <Header.Title localizationKey={localizationKeys('taskChooseOrganization.chooseOrganization.title')} />
      <Header.Subtitle
        localizationKey={
          props.createOrganizationEnabled
            ? localizationKeys('taskChooseOrganization.chooseOrganization.subtitle')
            : localizationKeys('taskChooseOrganization.chooseOrganization.subtitle__createOrganizationDisabled')
        }
      />
    </Header.Root>
    <Card.Alert sx={t => ({ margin: `${t.space.$none} ${t.space.$8}` })}>{props.error}</Card.Alert>
    <Col elementDescriptor={descriptors.main}>
      <OrganizationPreviewListItems elementDescriptor={descriptors.taskChooseOrganizationPreviewItems}>
        <Actions>
          {props.memberships.map(row => (
            <MembershipPreview
              key={row.id}
              row={row}
              isOrganizationListLoaded={props.isOrganizationListLoaded}
              createOrganizationEnabled={props.createOrganizationEnabled}
            />
          ))}
          {props.invitations.map(row => (
            <InvitationPreview
              key={row.id}
              row={row}
              isOrganizationListLoaded={props.isOrganizationListLoaded}
              createOrganizationEnabled={props.createOrganizationEnabled}
            />
          ))}
          {props.suggestions.map(row => (
            <SuggestionPreview
              key={row.id}
              row={row}
            />
          ))}
          {(props.hasNextPage || props.isLoading) && <OrganizationPreviewSpinner ref={props.paginationRef} />}
          {props.createOrganizationEnabled && (
            <Action
              icon={Add}
              elementDescriptor={descriptors.taskChooseOrganizationCreateOrganizationActionButton}
              label={localizationKeys('taskChooseOrganization.chooseOrganization.action__createOrganization')}
              onClick={props.onCreateOrganizationClick}
              sx={t => ({
                borderTopWidth: t.borderWidths.$normal,
                borderTopStyle: t.borderStyles.$solid,
                borderTopColor: t.colors.$borderAlpha100,
                padding: `${t.space.$5} ${t.space.$5}`,
              })}
              iconSx={t => ({
                width: t.sizes.$9,
                height: t.sizes.$6,
              })}
            />
          )}
        </Actions>
      </OrganizationPreviewListItems>
    </Col>
  </>
);
