import type { ReactNode } from 'react';

import { Col, Flex, localizationKeys, Text } from '@/customizables';
import { mqu } from '@/styledSystem';
import { Header } from '@/ui/elements/Header';
import { ProfileSection } from '@/ui/elements/Section';

export type MembersTabKind = 'invitations' | 'requests';

export const OrganizationMembersTabView = ({
  kind,
  showDomainPanel,
  domainList,
  actions,
  list,
}: {
  kind: MembersTabKind;
  showDomainPanel: boolean;
  domainList: ReactNode;
  actions: ReactNode;
  list: ReactNode;
}) => (
  <Col
    gap={4}
    sx={{ width: '100%' }}
  >
    {showDomainPanel && (
      <Flex
        sx={theme => ({
          width: '100%',
          gap: theme.space.$8,
          paddingBottom: theme.space.$4,
          paddingInlineStart: theme.space.$1,
          paddingInlineEnd: theme.space.$1,
          borderBottomWidth: theme.borderWidths.$normal,
          borderBottomStyle: theme.borderStyles.$solid,
          borderBottomColor: theme.colors.$borderAlpha100,
          [mqu.md]: {
            flexDirection: 'column',
            gap: theme.space.$2,
          },
        })}
      >
        <Col sx={theme => ({ width: theme.space.$66, marginTop: theme.space.$2 })}>
          <Header.Root>
            <Header.Title
              localizationKey={localizationKeys(
                kind === 'invitations'
                  ? 'organizationProfile.membersPage.invitationsTab.autoInvitations.headerTitle'
                  : 'organizationProfile.membersPage.requestsTab.autoSuggestions.headerTitle',
              )}
              textVariant='h3'
            />
          </Header.Root>
        </Col>
        <Col sx={{ width: '100%' }}>{domainList}</Col>
      </Flex>
    )}

    <Flex
      direction='col'
      gap={2}
      sx={{ width: '100%' }}
    >
      {actions}
      {list}
    </Flex>
  </Col>
);

export const OrganizationMembersTabFallbackView = ({
  kind,
  onNavigate,
}: {
  kind: MembersTabKind;
  onNavigate: () => void;
}) => (
  <>
    <ProfileSection.ArrowButton
      localizationKey={localizationKeys(
        kind === 'invitations'
          ? 'organizationProfile.membersPage.invitationsTab.autoInvitations.primaryButton'
          : 'organizationProfile.membersPage.requestsTab.autoSuggestions.primaryButton',
      )}
      id='manageVerifiedDomains'
      sx={theme => ({ gap: theme.space.$2 })}
      onClick={onNavigate}
    />
    <Text
      localizationKey={localizationKeys(
        kind === 'invitations'
          ? 'organizationProfile.membersPage.invitationsTab.autoInvitations.headerSubtitle'
          : 'organizationProfile.membersPage.requestsTab.autoSuggestions.headerSubtitle',
      )}
      sx={theme => ({
        paddingInlineStart: theme.space.$8x5,
        color: theme.colors.$colorMutedForeground,
        [mqu.md]: {
          paddingInlineStart: 0,
        },
      })}
    />
  </>
);
