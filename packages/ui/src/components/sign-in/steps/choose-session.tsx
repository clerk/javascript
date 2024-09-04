import { useClerk } from '@clerk/clerk-react';
import * as SignIn from '@clerk/elements/sign-in';
import { cva } from 'cva';
import { Button } from 'react-aria-components';

import { LOCALIZATION_NEEDED } from '~/constants/localizations';
import { useCard } from '~/hooks/use-card';
import { useDevModeWarning } from '~/hooks/use-dev-mode-warning';
import { useLocalizations } from '~/hooks/use-localizations';
import * as Card from '~/primitives/card';
import * as Icon from '~/primitives/icon';

function getInitials({
  firstName,
  lastName,
  identifier,
}: {
  firstName?: string | null;
  lastName?: string | null;
  identifier?: string | null;
}): string {
  let initials: string = '';
  if (firstName) {
    initials += firstName[0].toUpperCase();
  }
  if (lastName) {
    initials += lastName[0].toUpperCase();
  }
  if (!initials && identifier) {
    initials += identifier[0].toUpperCase();
  }
  return initials;
}

function getTitleAndSubtitle({
  firstName,
  lastName,
  identifier,
}: {
  firstName?: string | null;
  lastName?: string | null;
  identifier?: string | null;
}) {
  let title = '';
  let subtitle = '';
  if (firstName || lastName) {
    title = [firstName, lastName].filter(Boolean).join(' ');
    subtitle = identifier || '';
  } else {
    title = identifier || '';
  }
  return { title, subtitle };
}

const sessionAction = cva({
  base: 'text-start text-gray-11 hover:bg-gray-2 data-[focus-visible]:bg-gray-2 flex w-full items-center gap-x-3 px-10 py-4 text-base outline-none [--session-icon-opacity:0] data-[hovered]:[--session-icon-opacity:1]',
});

export function SignInChooseSession() {
  const { signOut } = useClerk();
  const { t } = useLocalizations();
  const isDev = useDevModeWarning();
  const { footerProps } = useCard();

  return (
    <SignIn.Step name='choose-session'>
      <Card.Root banner={isDev ? LOCALIZATION_NEEDED.developmentMode : null}>
        <Card.Content>
          <Card.Header>
            <Card.Title>{t('signIn.accountSwitcher.title')}</Card.Title>
            <Card.Description>{t('signIn.accountSwitcher.subtitle')}</Card.Description>
          </Card.Header>
          <Card.Body>
            <div className='-mx-[--card-body-px] -mb-[--card-body-py] overflow-hidden rounded-b-[--card-content-rounded-b]'>
              <SignIn.SessionList includeCurrentSession>
                <SignIn.SessionListItem asChild>
                  {({ session }) => {
                    const { identifier, firstName, lastName, hasImage, imageUrl } = session;
                    const { title, subtitle } = getTitleAndSubtitle({ firstName, lastName, identifier });
                    return (
                      <li className='border-gray-a4 border-t'>
                        <SignIn.Action
                          setActiveSession
                          asChild
                        >
                          <Button
                            type='button'
                            className={sessionAction()}
                          >
                            <span className='bg-gray-2 border-gray-a4 relative grid size-9 shrink-0 place-content-center overflow-hidden rounded-full border'>
                              {hasImage ? (
                                <img
                                  src={imageUrl}
                                  className='absolute inset-0 object-cover'
                                  alt={`Avatar for ${title}`}
                                />
                              ) : (
                                <span className='text-gray-11 text-base font-medium'>
                                  {getInitials({ firstName, lastName, identifier })}
                                </span>
                              )}
                            </span>
                            <span className='flex min-w-0 flex-1 flex-col'>
                              {title ? <span className='text-gray-12 font-medium'>{title}</span> : null}
                              {subtitle ? (
                                <span className='text-gray-11 w-full overflow-hidden text-ellipsis'>{subtitle}</span>
                              ) : null}
                            </span>
                            <span className='text-gray-11 w-4 shrink-0 opacity-[--session-icon-opacity] transition-opacity'>
                              <Icon.RightArrowSm />
                            </span>
                          </Button>
                        </SignIn.Action>
                      </li>
                    );
                  }}
                </SignIn.SessionListItem>
              </SignIn.SessionList>
              <div className='border-gray-a4 border-t'>
                <SignIn.Action
                  navigate='start'
                  asChild
                >
                  <Button
                    type='button'
                    className={sessionAction()}
                  >
                    <span className='grid size-9 place-content-center'>
                      <svg
                        viewBox='0 0 36 24'
                        className='w-9'
                        aria-hidden
                      >
                        <circle
                          cx='18'
                          cy='12'
                          r='11.5'
                          strokeDasharray='2 2'
                          className='fill-gray-2 stroke-gray-7'
                        />
                        <path
                          d='M18.75 7.75a.75.75 0 1 0-1.5 0v3.5h-3.5a.75.75 0 1 0 0 1.5h3.5v3.5a.75.75 0 1 0 1.5 0v-3.5h3.5a.75.75 0 1 0 0-1.5h-3.5v-3.5Z'
                          className='fill-gray-11'
                        />
                      </svg>
                    </span>
                    <span className='font-medium'>{t('signIn.accountSwitcher.action__addAccount')}</span>
                  </Button>
                </SignIn.Action>
              </div>
            </div>
          </Card.Body>
        </Card.Content>
        <Card.Footer {...footerProps}>
          <Card.FooterAction>
            <Button
              onPress={() => {
                void signOut();
              }}
              className='text-gray-11 hover:bg-gray-3 data-[focus-visible]:bg-gray-3 -my-1 flex w-full items-center gap-x-3 rounded-md px-4 py-1 text-base font-medium outline-none'
            >
              <span className='grid w-9 place-content-center'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 36 24'
                  className='w-9 rtl:rotate-180'
                >
                  <path
                    fill='currentColor'
                    fillRule='evenodd'
                    d='M12.6 6.604A2.045 2.045 0 0 1 14.052 6h3.417c.544 0 1.066.217 1.45.604.385.387.601.911.601 1.458v.69c0 .413-.334.75-.746.75a.748.748 0 0 1-.745-.75v-.69a.564.564 0 0 0-.56-.562h-3.417a.558.558 0 0 0-.56.563v7.874a.564.564 0 0 0 .56.563h3.417a.558.558 0 0 0 .56-.563v-.671c0-.415.334-.75.745-.75.412 0 .746.335.746.75v.671c0 .548-.216 1.072-.6 1.459a2.046 2.046 0 0 1-1.45.604H14.05a2.045 2.045 0 0 1-1.45-.604A2.068 2.068 0 0 1 12 15.937V8.064c0-.548.216-1.072.6-1.459Zm8.386 3.116a.743.743 0 0 1 1.055 0l1.74 1.75a.753.753 0 0 1 0 1.06l-1.74 1.75a.743.743 0 0 1-1.055 0 .753.753 0 0 1 0-1.06l.467-.47h-5.595a.748.748 0 0 1-.746-.75c0-.414.334-.75.746-.75h5.595l-.467-.47a.753.753 0 0 1 0-1.06Z'
                    clipRule='evenodd'
                  />
                </svg>
              </span>
              {t('signIn.accountSwitcher.action__signOutAll')}
            </Button>
          </Card.FooterAction>
        </Card.Footer>
      </Card.Root>
    </SignIn.Step>
  );
}
