import { Box, Button, Grid, localizationKeys, Text } from '@/ui/customizables';
import { ApplicationLogo } from '@/ui/elements/ApplicationLogo';
import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';
import { LoadingCardContainer } from '@/ui/elements/LoadingCard';
import { Modal } from '@/ui/elements/Modal';
import { Alert, Textarea } from '@/ui/primitives';

import { InlineAction } from './InlineAction';
import { getKnownOAuthClient } from './knownClients';
import {
  ListGroup,
  ListGroupContent,
  ListGroupHeader,
  ListGroupHeaderTitle,
  ListGroupItem,
  ListGroupItemLabel,
} from './ListGroup';
import { LogoGroup, LogoGroupIcon, LogoGroupItem, LogoGroupItemContainer, LogoGroupSeparator } from './LogoGroup';
import type { useOAuthConsentController } from './oauth-consent.controller';
import { OrgSelect } from './OrgSelect';

export const OAuthConsentView = ({ controller }: { controller: ReturnType<typeof useOAuthConsentController> }) => {
  const {
    status,
    errorMessage,
    actionUrl,
    hasContextCallbacks,
    forwardedParams,
    oauthApplicationName,
    oauthApplicationLogoUrl,
    oauthApplicationUrl,
    applicationName,
    hasApplicationLogo,
    redirectUrl,
    domainAction,
    viewFullUrlText,
    warningText,
    redirectNoticeText,
    offlineAccessNotice,
    primaryIdentifier,
    orgOptions,
    orgSelectionEnabled,
    effectiveOrg,
    displayedScopes,
    hasOfflineAccess,
    isUriModalOpen,
    onSubmit,
    onSelectOrg,
    onOpenUriModal,
    onCloseUriModal,
  } = controller;
  const knownClient = oauthApplicationLogoUrl ? undefined : getKnownOAuthClient(domainAction);

  if (status === 'error') {
    return (
      <Card.Root>
        <Card.Content>
          <Card.Alert>{errorMessage}</Card.Alert>
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    );
  }

  if (status === 'loading') {
    return (
      <Card.Root>
        <Card.Content>
          <LoadingCardContainer />
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    );
  }

  return (
    <>
      <form
        method='POST'
        action={actionUrl}
        onSubmit={onSubmit}
      >
        <Card.Root>
          <Card.Content>
            <Header.Root>
              {/* both have avatars */}
              {oauthApplicationLogoUrl && hasApplicationLogo && (
                <LogoGroup>
                  <LogoGroupItem justify='end'>
                    <LogoGroupItemContainer>
                      <ApplicationLogo
                        src={oauthApplicationLogoUrl}
                        alt={oauthApplicationName}
                        href={oauthApplicationUrl}
                        isExternal
                      />
                    </LogoGroupItemContainer>
                  </LogoGroupItem>
                  <LogoGroupSeparator />
                  <LogoGroupItem justify='start'>
                    <LogoGroupItemContainer>
                      <ApplicationLogo />
                    </LogoGroupItemContainer>
                  </LogoGroupItem>
                </LogoGroup>
              )}
              {/* only OAuth app has an avatar */}
              {oauthApplicationLogoUrl && !hasApplicationLogo && (
                <LogoGroup>
                  <Box sx={{ position: 'relative' }}>
                    <LogoGroupItemContainer>
                      <ApplicationLogo
                        src={oauthApplicationLogoUrl}
                        alt={oauthApplicationName}
                        href={oauthApplicationUrl}
                        isExternal
                      />
                    </LogoGroupItemContainer>
                    <LogoGroupItemContainer
                      size='sm'
                      sx={t => ({
                        position: 'absolute',
                        bottom: `calc(${t.space.$2x5} * -1)`,
                        insetInlineEnd: `calc(${t.space.$2x5} * -1)`,
                      })}
                    >
                      <LogoGroupIcon />
                    </LogoGroupItemContainer>
                  </Box>
                </LogoGroup>
              )}
              {/* only Clerk application has an avatar */}
              {!oauthApplicationLogoUrl && hasApplicationLogo && (
                <LogoGroup>
                  <LogoGroupItem justify='end'>
                    <LogoGroupItemContainer>
                      <LogoGroupIcon
                        icon={knownClient?.icon}
                        iconSx={knownClient?.iconSx}
                        label={knownClient?.name}
                      />
                    </LogoGroupItemContainer>
                  </LogoGroupItem>
                  <LogoGroupSeparator />
                  <LogoGroupItem justify='start'>
                    <LogoGroupItemContainer>
                      <ApplicationLogo />
                    </LogoGroupItemContainer>
                  </LogoGroupItem>
                </LogoGroup>
              )}
              {/* no avatars */}
              {!oauthApplicationLogoUrl && !hasApplicationLogo && (
                <LogoGroup>
                  <LogoGroupItemContainer>
                    <LogoGroupIcon
                      icon={knownClient?.icon}
                      iconSx={knownClient?.iconSx}
                      label={knownClient?.name}
                    />
                  </LogoGroupItemContainer>
                </LogoGroup>
              )}
              <Header.Title localizationKey={oauthApplicationName} />
              <Header.Subtitle
                localizationKey={localizationKeys('oauthConsent.subtitle', {
                  applicationName,
                  identifier: primaryIdentifier || '',
                })}
              />
            </Header.Root>
            {orgSelectionEnabled && orgOptions.length > 0 && effectiveOrg && (
              <OrgSelect
                options={orgOptions}
                value={effectiveOrg}
                onChange={onSelectOrg}
              />
            )}
            {displayedScopes.length > 0 && (
              <ListGroup>
                <ListGroupHeader>
                  <ListGroupHeaderTitle
                    localizationKey={localizationKeys('oauthConsent.scopeList.title', {
                      applicationName: oauthApplicationName,
                    })}
                  />
                </ListGroupHeader>
                <ListGroupContent>
                  {displayedScopes.map(item => (
                    <ListGroupItem key={item.scope}>
                      <ListGroupItemLabel>{item.description || item.scope || ''}</ListGroupItemLabel>
                    </ListGroupItem>
                  ))}
                </ListGroupContent>
              </ListGroup>
            )}
            <Alert colorScheme='warning'>
              <Text
                colorScheme='warning'
                variant='caption'
              >
                <InlineAction
                  text={warningText}
                  actionText={domainAction}
                  onClick={onOpenUriModal}
                  tooltipText={viewFullUrlText}
                />
              </Text>
            </Alert>
            <Grid
              columns={2}
              gap={3}
            >
              <Button
                type='submit'
                name='consented'
                value='false'
                colorScheme='secondary'
                variant='outline'
                localizationKey={localizationKeys('oauthConsent.action__deny')}
              />
              <Button
                type='submit'
                name='consented'
                value='true'
                localizationKey={localizationKeys('oauthConsent.action__allow')}
              />
              <Text
                sx={{ gridColumn: 'span 2' }}
                colorScheme='secondary'
                variant='caption'
              >
                <InlineAction
                  text={redirectNoticeText}
                  actionText={domainAction}
                  onClick={onOpenUriModal}
                  tooltipText={viewFullUrlText}
                />
                {hasOfflineAccess && offlineAccessNotice}
              </Text>
            </Grid>
          </Card.Content>
          <Card.Footer />
        </Card.Root>
        {!hasContextCallbacks &&
          forwardedParams.map(([key, value]) => (
            <input
              key={key}
              type='hidden'
              name={key}
              value={value}
            />
          ))}
        {!hasContextCallbacks && orgSelectionEnabled && effectiveOrg && (
          <input
            type='hidden'
            name='organization_id'
            value={effectiveOrg}
          />
        )}
      </form>
      <RedirectUriModal
        isOpen={isUriModalOpen}
        onOpen={onOpenUriModal}
        onClose={onCloseUriModal}
        redirectUri={redirectUrl}
        oauthApplicationName={oauthApplicationName}
      />
    </>
  );
};

type RedirectUriModalProps = {
  onOpen: () => void;
  onClose: () => void;
  isOpen: boolean;
  redirectUri: string;
  oauthApplicationName: string;
};

function RedirectUriModal({ onOpen, onClose, isOpen, redirectUri, oauthApplicationName }: RedirectUriModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      handleOpen={onOpen}
      handleClose={onClose}
    >
      <Card.Root>
        <Card.Content>
          <Header.Root>
            <Header.Title localizationKey={localizationKeys('oauthConsent.redirectUriModal.title')} />
            <Header.Subtitle
              localizationKey={localizationKeys('oauthConsent.redirectUriModal.subtitle', {
                applicationName: oauthApplicationName,
              })}
            />
          </Header.Root>
          <Textarea
            style={{ maxHeight: 'none' }}
            cols={50}
            rows={6}
            defaultValue={redirectUri}
            readOnly
          />
        </Card.Content>
      </Card.Root>
    </Modal>
  );
}
