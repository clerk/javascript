import { useClerk } from '@clerk/clerk-react';
import { Button } from 'react-aria-components';

import { useAppearance } from '~/hooks/use-appearance';
import { useDevModeWarning } from '~/hooks/use-dev-mode-warning';
import { useDisplayConfig } from '~/hooks/use-display-config';
import { useLocalizations } from '~/hooks/use-localizations';
import * as Card from '~/primitives/card';
import * as Icon from '~/primitives/icon';

function getInitials(firstName?: string | null, lastName?: string | null): string {
  let initials: string = '';
  if (firstName) {
    initials += firstName[0].toUpperCase();
  }
  if (lastName) {
    initials += lastName[0].toUpperCase();
  }
  return initials;
}

export function SignInAccountSwitcher() {
  const clerk = useClerk();
  const { t } = useLocalizations();
  const { layout } = useAppearance();
  const renderDevModeWarning = useDevModeWarning();
  const { branded } = useDisplayConfig();

  const cardFooterProps = {
    branded,
    helpPageUrl: layout?.helpPageUrl,
    privacyPageUrl: layout?.privacyPageUrl,
    termsPageUrl: layout?.termsPageUrl,
  };

  const activeSessions = clerk.client.activeSessions;

  return (
    <Card.Root>
      <Card.Content>
        <Card.Header>
          <Card.Title>{t('signIn.accountSwitcher.title')}</Card.Title>
          <Card.Description>{t('signIn.accountSwitcher.subtitle')}</Card.Description>
        </Card.Header>
        <Card.Body>
          <div className='-mx-[--card-body-padding] -mb-[--card-body-padding] overflow-hidden rounded-b-[--card-content-rounded-b]'>
            {activeSessions?.map(session => {
              const { userId, identifier, firstName, lastName } = session.publicUserData;
              let title = '';
              let subtitle = '';
              if (firstName || lastName) {
                title = `${firstName} ${lastName}`;
                subtitle = identifier;
              } else {
                title = identifier;
              }
              return (
                <Button
                  key={userId}
                  type='button'
                  className='text-gray-11 hover:bg-gray-2 flex w-full items-center gap-x-3 border-t px-10 py-4 text-left text-base'
                >
                  <span className='bg-gray-2 grid size-9 shrink-0 place-content-center rounded-full border'>
                    <span className='text-gray-11 text-base font-medium'>{getInitials(firstName, lastName)}</span>
                  </span>
                  <span className='flex min-w-0 flex-1 flex-col'>
                    {title ? <span className='text-gray-12 font-medium'>{title}</span> : null}
                    {subtitle ? (
                      <span className='text-gray-11 w-full overflow-hidden text-ellipsis'>{subtitle}</span>
                    ) : null}
                  </span>
                  <Icon.RightArrowSm className='text-gray-11 w-4 shrink-0' />
                </Button>
              );
            })}
            <Button
              type='button'
              className='text-gray-11 hover:bg-gray-2 flex w-full items-center gap-x-3 border-t px-10 py-4 text-base font-medium'
            >
              <span className='grid size-9 place-content-center'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 25'
                  className='w-6'
                  aria-hidden
                >
                  <circle
                    cx='12'
                    cy='12.473'
                    r='11.5'
                    fill='#F7F7F8'
                    stroke='#D9D9DE'
                    strokeDasharray='2 2'
                  />
                  <path
                    fill='#9394A1'
                    d='M12.75 8.223a.75.75 0 1 0-1.5 0v3.5h-3.5a.75.75 0 1 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z'
                  />
                </svg>
              </span>
              {t('signIn.accountSwitcher.action__addAccount')}
            </Button>
          </div>
        </Card.Body>
        {/* {renderDevModeWarning ? <Card.Banner>Development mode</Card.Banner> : null} */}
      </Card.Content>
      <Card.Footer {...cardFooterProps}>
        <Card.FooterAction>
          <Card.FooterActionText>
            <Card.FooterActionButton>{t('signIn.accountSwitcher.action__signOutAll')}</Card.FooterActionButton>
          </Card.FooterActionText>
        </Card.FooterAction>
      </Card.Footer>
    </Card.Root>
  );
}
