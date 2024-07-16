import { useClerk } from '@clerk/clerk-react';
import * as Common from '@clerk/elements/common';
import * as SignUp from '@clerk/elements/sign-up';

import { Connections } from '~/common/connections';
import { EmailField } from '~/common/email-field';
import { FirstNameField } from '~/common/first-name-field';
import { LastNameField } from '~/common/last-name-field';
import { OTPField } from '~/common/otp-field';
import { PasswordField } from '~/common/password-field';
import { PhoneNumberField } from '~/common/phone-number-field';
import { UsernameField } from '~/common/username-field';
import { useAttributes } from '~/hooks/use-attributes';
import { useDisplayConfig } from '~/hooks/use-display-config';
import { useEnabledConnections } from '~/hooks/use-enabled-connections';
import { useLocalizations } from '~/hooks/use-localizations';
import { Alert } from '~/primitives/alert';
import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import * as Icon from '~/primitives/icon';
import { LinkButton } from '~/primitives/link-button';
import { Seperator } from '~/primitives/seperator';

import { SignUpIdentifier } from './indentifiers';

export function SignUpComponent() {
  return (
    <SignUp.Root>
      <SignUpComponentLoaded />
    </SignUp.Root>
  );
}

function SignUpComponentLoaded() {
  const clerk = useClerk();
  const enabledConnections = useEnabledConnections();
  const locationBasedCountryIso = (clerk as any)?.__internal_country;
  const { t } = useLocalizations();
  const { enabled: firstNameEnabled, required: firstNameRequired } = useAttributes('first_name');
  const { enabled: lastNameEnabled, required: lastNameRequired } = useAttributes('last_name');
  const { enabled: usernameEnabled, required: usernameRequired } = useAttributes('username');
  const { enabled: phoneNumberEnabled, required: phoneNumberRequired } = useAttributes('phone_number');
  const { enabled: emailAddressEnabled } = useAttributes('email_address');
  const { enabled: passwordEnabled, required: passwordRequired } = useAttributes('password');
  const { applicationName, branded, homeUrl, logoImageUrl } = useDisplayConfig();

  const hasConnection = enabledConnections.length > 0;
  const hasIdentifier = emailAddressEnabled || usernameEnabled || phoneNumberEnabled;

  return (
    <Common.Loading>
      {isGlobalLoading => {
        return (
          <>
            <SignUp.Step name='start'>
              <Card.Root>
                <Card.Content>
                  <Card.Header>
                    {logoImageUrl ? (
                      <Card.Logo
                        href={homeUrl}
                        src={logoImageUrl}
                        alt={applicationName}
                      />
                    ) : null}
                    <Card.Title>{t('signUp.start.title')}</Card.Title>
                    <Card.Description>
                      {t('signUp.start.subtitle', {
                        applicationName,
                      })}
                    </Card.Description>
                  </Card.Header>
                  <Card.Body>
                    <Common.GlobalError>
                      {({ message }) => {
                        return <Alert>{message}</Alert>;
                      }}
                    </Common.GlobalError>

                    <Connections disabled={isGlobalLoading} />

                    {hasConnection && hasIdentifier ? <Seperator>{t('dividerText')}</Seperator> : null}

                    {hasIdentifier ? (
                      <div className='flex flex-col gap-4'>
                        {firstNameEnabled && lastNameEnabled ? (
                          <div className='flex gap-4'>
                            <FirstNameField
                              label={t('formFieldLabel__firstName')}
                              hintText={t('formFieldHintText__optional')}
                              required={firstNameRequired}
                              disabled={isGlobalLoading}
                            />
                            <LastNameField
                              label={t('formFieldLabel__lastName')}
                              hintText={t('formFieldHintText__optional')}
                              required={lastNameRequired}
                              disabled={isGlobalLoading}
                            />
                          </div>
                        ) : null}

                        {usernameEnabled ? (
                          <UsernameField
                            label={t('formFieldLabel__username')}
                            hintText={t('formFieldHintText__optional')}
                            required={usernameRequired}
                            disabled={isGlobalLoading}
                          />
                        ) : null}

                        <EmailField disabled={isGlobalLoading} />

                        {phoneNumberEnabled ? (
                          <PhoneNumberField
                            label={t('formFieldLabel__phoneNumber')}
                            hintText={t('formFieldHintText__optional')}
                            required={phoneNumberRequired}
                            disabled={isGlobalLoading}
                            initPhoneWithCode={clerk.client.signUp.phoneNumber || ''}
                            locationBasedCountryIso={locationBasedCountryIso}
                          />
                        ) : null}

                        {passwordEnabled && passwordRequired ? (
                          <PasswordField
                            label={t('formFieldLabel__password')}
                            required={passwordRequired}
                            disabled={isGlobalLoading}
                          />
                        ) : null}
                      </div>
                    ) : null}

                    {hasConnection || hasIdentifier ? (
                      <Common.Loading scope='step:start'>
                        {isSubmitting => {
                          return (
                            <SignUp.Action
                              submit
                              asChild
                            >
                              <Button
                                icon={<Icon.CaretRight />}
                                busy={isSubmitting}
                                disabled={isGlobalLoading || isSubmitting}
                              >
                                {t('formButtonPrimary')}
                              </Button>
                            </SignUp.Action>
                          );
                        }}
                      </Common.Loading>
                    ) : null}
                  </Card.Body>
                </Card.Content>
                <Card.Footer branded={branded}>
                  <Card.FooterAction>
                    <Card.FooterActionText>
                      {t('signUp.start.actionText')}{' '}
                      <Card.FooterActionLink href='/sign-in'>{t('signUp.start.actionLink')}</Card.FooterActionLink>
                    </Card.FooterActionText>
                  </Card.FooterAction>
                </Card.Footer>
              </Card.Root>
            </SignUp.Step>

            <SignUp.Step name='verifications'>
              <Card.Root>
                <Card.Content>
                  <SignUp.Strategy name='phone_code'>
                    <Card.Header>
                      <Card.Title>{t('signUp.phoneCode.title')}</Card.Title>
                      <Card.Description>{t('signUp.phoneCode.subtitle')}</Card.Description>
                      <Card.Description>
                        <span className='flex items-center justify-center gap-2'>
                          <SignUpIdentifier phoneNumber />
                          <SignUp.Action
                            navigate='start'
                            asChild
                          >
                            <button
                              type='button'
                              className='focus-visible:ring-default size-4 rounded-sm outline-none focus-visible:ring-2'
                              aria-label='Start again'
                            >
                              <Icon.PencilUnderlined />
                            </button>
                          </SignUp.Action>
                        </span>
                      </Card.Description>
                    </Card.Header>
                    <Card.Body>
                      <Common.GlobalError>
                        {({ message }) => {
                          return <Alert>{message}</Alert>;
                        }}
                      </Common.GlobalError>
                      <OTPField
                        disabled={isGlobalLoading}
                        // TODO:
                        // 1. Replace `button` with consolidated styles (tackled later)
                        resend={
                          <SignUp.Action
                            asChild
                            resend
                            // eslint-disable-next-line react/no-unstable-nested-components
                            fallback={({ resendableAfter }) => (
                              <p className='text-gray-11 border border-transparent px-2.5 py-1.5 text-center text-base font-medium'>
                                {t('signUp.phoneCode.resendButton')} (
                                <span className='tabular-nums'>{resendableAfter}</span>)
                              </p>
                            )}
                          >
                            <LinkButton type='button'>{t('signUp.phoneCode.resendButton')}</LinkButton>
                          </SignUp.Action>
                        }
                      />
                      <Common.Loading scope='step:verifications'>
                        {isSubmitting => {
                          return (
                            <SignUp.Action
                              submit
                              asChild
                            >
                              <Button
                                busy={isSubmitting}
                                disabled={isGlobalLoading}
                                icon={<Icon.CaretRight />}
                              >
                                {t('formButtonPrimary')}
                              </Button>
                            </SignUp.Action>
                          );
                        }}
                      </Common.Loading>
                    </Card.Body>
                  </SignUp.Strategy>

                  <SignUp.Strategy name='email_code'>
                    <Card.Header>
                      <Card.Title>{t('signUp.emailCode.title')}</Card.Title>
                      <Card.Description>{t('signUp.emailCode.subtitle')}</Card.Description>
                      <Card.Description>
                        <span className='flex items-center justify-center gap-2'>
                          <SignUpIdentifier emailAddress />
                          <SignUp.Action
                            navigate='start'
                            asChild
                          >
                            <button
                              type='button'
                              className='focus-visible:ring-default size-4 rounded-sm outline-none focus-visible:ring-2'
                              aria-label='Start again'
                            >
                              <Icon.PencilUnderlined />
                            </button>
                          </SignUp.Action>
                        </span>
                      </Card.Description>
                    </Card.Header>
                    <Card.Body>
                      <Common.GlobalError>
                        {({ message }) => {
                          return <Alert>{message}</Alert>;
                        }}
                      </Common.GlobalError>
                      <OTPField
                        disabled={isGlobalLoading}
                        resend={
                          <SignUp.Action
                            asChild
                            resend
                            // eslint-disable-next-line react/no-unstable-nested-components
                            fallback={({ resendableAfter }) => (
                              <p className='text-gray-11 border border-transparent px-2.5 py-1.5 text-center text-base font-medium'>
                                {t('signUp.emailCode.resendButton')} (
                                <span className='tabular-nums'>{resendableAfter}</span>)
                              </p>
                            )}
                          >
                            <LinkButton type='button'>{t('signUp.emailCode.resendButton')}</LinkButton>
                          </SignUp.Action>
                        }
                      />
                      <Common.Loading scope='step:verifications'>
                        {isSubmitting => {
                          return (
                            <SignUp.Action
                              submit
                              asChild
                            >
                              <Button
                                busy={isSubmitting}
                                disabled={isGlobalLoading}
                                icon={<Icon.CaretRight />}
                              >
                                {t('formButtonPrimary')}
                              </Button>
                            </SignUp.Action>
                          );
                        }}
                      </Common.Loading>
                    </Card.Body>
                  </SignUp.Strategy>

                  <SignUp.Strategy name='email_link'>
                    <Card.Header>
                      <Card.Title>{t('signUp.emailLink.title')}</Card.Title>
                      <Card.Description>
                        {t('signUp.emailLink.subtitle', {
                          applicationName,
                        })}
                      </Card.Description>
                      <Card.Description>
                        <span className='flex items-center justify-center gap-2'>
                          <SignUpIdentifier emailAddress />
                          <SignUp.Action
                            navigate='start'
                            asChild
                          >
                            <button
                              type='button'
                              className='focus-visible:ring-default size-4 rounded-sm outline-none focus-visible:ring-2'
                              aria-label='Start again'
                            >
                              <Icon.PencilUnderlined />
                            </button>
                          </SignUp.Action>
                        </span>
                      </Card.Description>
                    </Card.Header>
                    <Card.Body>
                      <Common.GlobalError>
                        {({ message }) => {
                          return <Alert>{message}</Alert>;
                        }}
                      </Common.GlobalError>
                      <SignUp.Action
                        resend
                        asChild
                        // eslint-disable-next-line react/no-unstable-nested-components
                        fallback={({ resendableAfter }) => {
                          return (
                            <p className='text-gray-11 border border-transparent px-2.5 py-1.5 text-center text-base font-medium'>
                              {t('signUp.emailLink.resendButton')} (
                              <span className='tabular-nums'>{resendableAfter}</span>)
                            </p>
                          );
                        }}
                      >
                        <LinkButton type='button'>{t('signUp.emailLink.resendButton')}</LinkButton>
                      </SignUp.Action>
                    </Card.Body>
                  </SignUp.Strategy>
                </Card.Content>
                <Card.Footer branded={branded} />
              </Card.Root>
            </SignUp.Step>

            <SignUp.Step name='continue'>
              <Card.Root>
                <Card.Content>
                  <Card.Header>
                    <Card.Title>{t('signUp.continue.title')}</Card.Title>
                    <Card.Description>{t('signUp.continue.subtitle')}</Card.Description>
                  </Card.Header>
                  <Card.Body>
                    <Common.GlobalError>
                      {({ message }) => {
                        return <Alert>{message}</Alert>;
                      }}
                    </Common.GlobalError>
                    <div className='space-y-4'>
                      {firstNameEnabled && lastNameEnabled ? (
                        <div className='flex gap-4'>
                          <FirstNameField
                            label={t('formFieldLabel__firstName')}
                            hintText={t('formFieldHintText__optional')}
                            required={firstNameRequired}
                            disabled={isGlobalLoading}
                          />
                          <LastNameField
                            label={t('formFieldLabel__lastName')}
                            hintText={t('formFieldHintText__optional')}
                            required={lastNameRequired}
                            disabled={isGlobalLoading}
                          />
                        </div>
                      ) : null}

                      {usernameEnabled ? (
                        <UsernameField
                          label={t('formFieldLabel__username')}
                          hintText={t('formFieldHintText__optional')}
                          required={usernameRequired}
                          disabled={isGlobalLoading}
                        />
                      ) : null}

                      {phoneNumberEnabled ? (
                        <PhoneNumberField
                          label={t('formFieldLabel__phoneNumber')}
                          hintText={t('formFieldHintText__optional')}
                          required={phoneNumberRequired}
                          disabled={isGlobalLoading}
                          locationBasedCountryIso={locationBasedCountryIso}
                        />
                      ) : null}

                      <EmailField disabled={isGlobalLoading} />

                      {passwordEnabled && passwordRequired ? (
                        <PasswordField
                          label={t('formFieldLabel__password')}
                          required={passwordRequired}
                          disabled={isGlobalLoading}
                        />
                      ) : null}
                    </div>

                    <Common.Loading scope='step:continue'>
                      {isSubmitting => {
                        return (
                          <SignUp.Action
                            submit
                            asChild
                          >
                            <Button
                              icon={<Icon.CaretRight />}
                              busy={isSubmitting}
                              disabled={isGlobalLoading || isSubmitting}
                            >
                              {t('formButtonPrimary')}
                            </Button>
                          </SignUp.Action>
                        );
                      }}
                    </Common.Loading>
                  </Card.Body>
                </Card.Content>
                <Card.Footer branded={branded}>
                  <Card.FooterAction>
                    <Card.FooterActionText>
                      {t('signUp.continue.actionText')}{' '}
                      <Card.FooterActionLink href='/sign-in'>{t('signUp.continue.actionLink')}</Card.FooterActionLink>
                    </Card.FooterActionText>
                  </Card.FooterAction>
                </Card.Footer>
              </Card.Root>
            </SignUp.Step>
          </>
        );
      }}
    </Common.Loading>
  );
}
