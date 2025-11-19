import { useClerk } from '@clerk/shared/react';
import type { __internal_EnableOrganizationsPromptProps, EnableEnvironmentSettingParams } from '@clerk/shared/types';
// eslint-disable-next-line no-restricted-imports
import type { SerializedStyles } from '@emotion/react';
import { css, type Theme } from '@emotion/react';
import { forwardRef, useId, useMemo, useRef, useState } from 'react';

import { useEnvironment } from '@/ui/contexts';
import { Modal } from '@/ui/elements/Modal';
import { common, InternalThemeProvider } from '@/ui/styledSystem';

import { DevTools } from '../../../../core/resources/DevTools';
import { Flex, Span } from '../../../customizables';
import { Portal } from '../../../elements/Portal';
import { basePromptElementStyles, handleDashboardUrlParsing, PromptContainer, PromptSuccessIcon } from '../shared';

/**
 * If we cannot reconstruct the url properly, then simply fallback to Clerk Dashboard
 */
function withLastActiveFallback(cb: () => string): string {
  try {
    return cb();
  } catch {
    return 'https://dashboard.clerk.com/last-active?path=organization-settings';
  }
}

const EnableOrganizationsPromptInternal = ({
  caller,
  onSuccess,
  onClose,
}: __internal_EnableOrganizationsPromptProps) => {
  const clerk = useClerk();
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [allowPersonalAccount, setAllowPersonalAccount] = useState(false);

  const initialFocusRef = useRef<HTMLHeadingElement>(null);
  const environment = useEnvironment();

  const isComponent = !caller.startsWith('use');

  // 'forceOrganizationSelection' is omitted from the environment settings object if the instance does not have it available as a feature
  const hasPersonalAccountsEnabled =
    typeof environment?.organizationSettings.forceOrganizationSelection !== 'undefined';

  const organizationsDashboardUrl = useMemo(() => {
    return withLastActiveFallback(() => {
      const currentUrl = window.location.href;
      try {
        const redirectUrlParts = handleDashboardUrlParsing(currentUrl);
        const url = new URL(
          `${redirectUrlParts.baseDomain}/apps/${redirectUrlParts.appId}/instances/${redirectUrlParts.instanceId}/organizations`,
        );
        return url.href;
      } catch {
        if (!environment?.id) {
          throw new Error('Cannot construct dashboard URL');
        }

        return 'https://dashboard.clerk.com/last-active?path=organization-settings';
      }
    });
  }, [environment?.id]);

  const handleEnableOrganizations = () => {
    setIsLoading(true);

    const params: EnableEnvironmentSettingParams = {
      enable_organizations: true,
    };

    if (hasPersonalAccountsEnabled) {
      params.organization_allow_personal_accounts = allowPersonalAccount;
    }

    void new DevTools()
      .__internal_enableEnvironmentSetting(params)
      .then(() => {
        setIsEnabled(true);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  return (
    <Portal>
      <Modal
        canCloseModal={false}
        containerSx={() => ({ alignItems: 'center' })}
        initialFocusRef={initialFocusRef}
      >
        <PromptContainer
          sx={() => ({
            display: 'flex',
            flexDirection: 'column',
            width: '30rem',
            maxWidth: 'calc(100vw - 2rem)',
          })}
        >
          <Flex
            direction='col'
            sx={t => ({
              padding: `${t.sizes.$4} ${t.sizes.$6}`,
              paddingBottom: t.sizes.$4,
              gap: t.sizes.$2,
            })}
          >
            <Flex
              as='header'
              align='center'
              sx={t => ({
                gap: t.sizes.$2,
              })}
            >
              <div
                css={css`
                  perspective: 1000px;
                  position: relative;
                  width: 1.25rem;
                  height: 1.25rem;
                  transform-style: preserve-3d;
                  transition: transform 0.6s ease-in-out;
                  transform: ${isEnabled ? 'rotateY(180deg)' : 'rotateY(0)'};

                  @media (prefers-reduced-motion: reduce) {
                    transition: none;
                    transform: ${isEnabled ? 'rotateY(180deg)' : 'rotateY(0)'};
                  }
                `}
              >
                <span
                  aria-hidden
                  css={css`
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    backface-visibility: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  `}
                >
                  <svg
                    css={css`
                      width: 1.25rem;
                      height: 1.25rem;
                    `}
                    viewBox='0 0 20 20'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      opacity='0.2'
                      d='M17.25 10C17.25 14.0041 14.0041 17.25 10 17.25C5.99594 17.25 2.75 14.0041 2.75 10C2.75 5.99594 5.99594 2.75 10 2.75C14.0041 2.75 17.25 5.99594 17.25 10Z'
                      fill='#EAB308'
                    />
                    <path
                      fillRule='evenodd'
                      clipRule='evenodd'
                      d='M10 3.5C6.41015 3.5 3.5 6.41015 3.5 10C3.5 13.5899 6.41015 16.5 10 16.5C13.5899 16.5 16.5 13.5899 16.5 10C16.5 6.41015 13.5899 3.5 10 3.5ZM2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10Z'
                      fill='#EAB308'
                    />
                    <path
                      fillRule='evenodd'
                      clipRule='evenodd'
                      d='M10 6C10.5523 6 11 6.44772 11 7V9C11 9.55228 10.5523 10 10 10C9.44772 10 9 9.55228 9 9V7C9 6.44772 9.44772 6 10 6Z'
                      fill='#EAB308'
                    />
                    <path
                      fillRule='evenodd'
                      clipRule='evenodd'
                      d='M10 12C10.5523 12 11 12.4477 11 13V13.01C11 13.5623 10.5523 14.01 10 14.01C9.44772 14.01 9 13.5623 9 13.01V13C9 12.4477 9.44772 12 10 12Z'
                      fill='#EAB308'
                    />
                  </svg>
                </span>

                <span
                  aria-hidden
                  css={css`
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    backface-visibility: hidden;
                    transform: rotateY(180deg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  `}
                >
                  <PromptSuccessIcon
                    css={css`
                      width: 1.25rem;
                      height: 1.25rem;
                    `}
                  />
                </span>
              </div>

              <h1
                css={[
                  basePromptElementStyles,
                  css`
                    color: white;
                    font-size: 0.875rem;
                    font-weight: 500;
                    outline: none;
                  `,
                ]}
                tabIndex={-1}
                ref={initialFocusRef}
              >
                {isEnabled ? 'Organizations feature enabled' : 'Organizations feature required'}
              </h1>
            </Flex>

            <Flex
              direction='col'
              align='start'
              sx={t => ({
                gap: t.sizes.$0x5,
              })}
            >
              {isEnabled ? (
                <p
                  css={[
                    basePromptElementStyles,
                    css`
                      color: #b4b4b4;
                      font-size: 0.8125rem;
                      font-weight: 400;
                      line-height: 1.3;
                    `,
                  ]}
                >
                  {clerk.user
                    ? `The Organizations feature has been enabled for your application. A default organization named "My Organization" was created automatically. You can manage or rename it in your`
                    : `The Organizations feature has been enabled for your application. You can manage it in your`}{' '}
                  <Link
                    href={organizationsDashboardUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    dashboard
                  </Link>
                  .
                </p>
              ) : (
                <>
                  <p
                    css={[
                      basePromptElementStyles,
                      css`
                        color: #b4b4b4;
                        font-size: 0.8125rem;
                        font-weight: 400;
                        line-height: 1.23;
                      `,
                    ]}
                  >
                    To use the{' '}
                    <code
                      css={[
                        basePromptElementStyles,
                        css`
                          font-size: 0.75rem;
                          color: white;
                          font-family: monospace;
                          line-height: 1.23;
                        `,
                      ]}
                    >
                      {isComponent ? `<${caller} />` : caller}
                    </code>{' '}
                    {isComponent ? 'component' : 'hook'}, you&apos;ll need to enable the Organizations feature for your
                    app first.
                  </p>

                  <Link
                    href='https://clerk.com/docs/guides/organizations/overview'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    Learn more about Organizations.
                  </Link>
                </>
              )}
            </Flex>

            {!isEnabled && hasPersonalAccountsEnabled && (
              <Flex sx={t => ({ marginTop: t.sizes.$3 })}>
                <Switch
                  label='Allow personal account'
                  description='This is an uncommon setting, meant for applications that sell to both organizations and individual users. Most B2B applications require users to be part of an organization, and should keep this setting disabled.'
                  checked={allowPersonalAccount}
                  onChange={() => setAllowPersonalAccount(prev => !prev)}
                />
              </Flex>
            )}
          </Flex>

          <span
            css={css`
              height: 1px;
              display: block;
              width: calc(100% - 2px);
              margin-inline: auto;
              background-color: #151515;
              box-shadow: 0px 1px 0px 0px #424242;
            `}
          />

          <Flex
            justify='center'
            sx={t => ({
              padding: `${t.sizes.$4} ${t.sizes.$6}`,
              gap: t.sizes.$3,
              justifyContent: 'flex-end',
            })}
          >
            {isEnabled ? (
              <PromptButton
                variant='solid'
                onClick={() => {
                  if (!clerk.user) {
                    void clerk.redirectToSignIn();
                    clerk.__internal_closeEnableOrganizationsPrompt?.();
                  } else {
                    onSuccess?.();
                  }
                }}
              >
                {clerk.user ? 'Continue' : 'Sign in to continue'}
              </PromptButton>
            ) : (
              <>
                <PromptButton
                  variant='outline'
                  onClick={() => {
                    clerk?.__internal_closeEnableOrganizationsPrompt?.();
                    onClose?.();
                  }}
                >
                  I&apos;ll remove it myself
                </PromptButton>

                <PromptButton
                  variant='solid'
                  onClick={handleEnableOrganizations}
                  disabled={isLoading}
                >
                  Enable Organizations
                </PromptButton>
              </>
            )}
          </Flex>
        </PromptContainer>
      </Modal>
    </Portal>
  );
};

/**
 * A prompt that allows the user to enable the Organizations feature for their development instance
 * @internal
 */
export const EnableOrganizationsPrompt = (props: __internal_EnableOrganizationsPromptProps) => {
  return (
    <InternalThemeProvider>
      <EnableOrganizationsPromptInternal {...props} />
    </InternalThemeProvider>
  );
};

const baseButtonStyles = css`
  ${basePromptElementStyles};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 1.75rem;
  padding: 0.375rem 0.625rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.12px;
  color: white;
  text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.32);
  white-space: nowrap;
  user-select: none;
  color: white;
  outline: none;

  &:not(:disabled) {
    transition: 120ms ease-in-out;
    transition-property: background-color, border-color, box-shadow, color;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus-visible:not(:disabled) {
    outline: 2px solid white;
    outline-offset: 2px;
  }
`;

const buttonSolidStyles = css`
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 30.5%, rgba(0, 0, 0, 0.05) 100%), #454545;
  box-shadow:
    0 0 3px 0 rgba(253, 224, 71, 0) inset,
    0 0 0 1px rgba(255, 255, 255, 0.04) inset,
    0 1px 0 0 rgba(255, 255, 255, 0.04) inset,
    0 0 0 1px rgba(0, 0, 0, 0.12),
    0 1.5px 2px 0 rgba(0, 0, 0, 0.48);

  &:hover:not(:disabled) {
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 30.5%, rgba(0, 0, 0, 0.15) 100%), #5f5f5f;
    box-shadow:
      0 0 3px 0 rgba(253, 224, 71, 0) inset,
      0 0 0 1px rgba(255, 255, 255, 0.04) inset,
      0 1px 0 0 rgba(255, 255, 255, 0.04) inset,
      0 0 0 1px rgba(0, 0, 0, 0.12),
      0 1.5px 2px 0 rgba(0, 0, 0, 0.48);
  }
`;

const buttonOutlineStyles = css`
  border: 1px solid rgba(118, 118, 132, 0.25);
  background: rgba(69, 69, 69, 0.1);

  &:hover:not(:disabled) {
    border-color: rgba(118, 118, 132, 0.5);
  }
`;

const buttonVariantStyles = {
  solid: buttonSolidStyles,
  outline: buttonOutlineStyles,
} as const;

type PromptButtonVariant = keyof typeof buttonVariantStyles;

type PromptButtonProps = Pick<React.ComponentProps<'button'>, 'onClick' | 'children' | 'disabled'> & {
  variant?: PromptButtonVariant;
};

const PromptButton = forwardRef<HTMLButtonElement, PromptButtonProps>(({ variant = 'solid', ...props }, ref) => {
  return (
    <button
      ref={ref}
      type='button'
      css={[baseButtonStyles, buttonVariantStyles[variant]]}
      {...props}
    />
  );
});

type SwitchProps = React.ComponentProps<'input'> & {
  label: string;
  description?: string;
};

const TRACK_PADDING = '2px';
const TRACK_INNER_WIDTH = (t: Theme) => t.sizes.$6;
const TRACK_HEIGHT = (t: Theme) => t.sizes.$4;
const THUMB_WIDTH = (t: Theme) => t.sizes.$3;

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, description, checked: controlledChecked, defaultChecked, onChange, ...props }, ref) => {
    const descriptionId = useId();

    const isControlled = controlledChecked !== undefined;
    const [internalChecked, setInternalChecked] = useState(!!defaultChecked);
    const checked = isControlled ? controlledChecked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalChecked(e.target.checked);
      }
      onChange?.(e);
    };

    return (
      <Flex
        direction='col'
        gap={1}
      >
        <Flex
          as='label'
          gap={2}
          align='center'
          sx={{
            isolation: 'isolate',
            userSelect: 'none',
            '&:has(input:focus-visible) > input + span': {
              outline: '2px solid white',
              outlineOffset: '2px',
            },
            '&:has(input:disabled) > input + span': {
              opacity: 0.6,
              cursor: 'not-allowed',
              pointerEvents: 'none',
            },
          }}
        >
          <input
            type='checkbox'
            {...props}
            ref={ref}
            role='switch'
            {...(isControlled ? { checked } : { defaultChecked })}
            onChange={handleChange}
            css={{ ...common.visuallyHidden() }}
            aria-describedby={description ? descriptionId : undefined}
          />
          <Span
            sx={t => {
              const trackWidth = `calc(${TRACK_INNER_WIDTH(t)} + ${TRACK_PADDING} + ${TRACK_PADDING})`;
              const trackHeight = `calc(${TRACK_HEIGHT(t)} + ${TRACK_PADDING})`;
              return {
                display: 'flex',
                alignItems: 'center',
                paddingInline: TRACK_PADDING,
                width: trackWidth,
                height: trackHeight,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backgroundColor: checked ? '#6C47FF' : 'rgba(0, 0, 0, 0.2)',
                borderRadius: 999,
                transition: 'background-color 0.2s ease-in-out',
              };
            }}
          >
            <Span
              sx={t => {
                const size = THUMB_WIDTH(t);
                const maxTranslateX = `calc(${TRACK_INNER_WIDTH(t)} - ${size} - ${TRACK_PADDING})`;
                return {
                  width: size,
                  height: size,
                  borderRadius: 9999,
                  backgroundColor: 'white',
                  boxShadow: '0px 0px 0px 1px rgba(0, 0, 0, 0.1)',
                  transform: `translateX(${checked ? maxTranslateX : '0'})`,
                  transition: 'transform 0.2s ease-in-out',
                  '@media (prefers-reduced-motion: reduce)': {
                    transition: 'none',
                  },
                };
              }}
            />
          </Span>
          <span
            css={[
              basePromptElementStyles,
              css`
                font-size: 0.875rem;
                font-weight: 500;
                line-height: 1.25;
                color: white;
              `,
            ]}
          >
            {label}
          </span>
        </Flex>
        {description ? (
          <Span
            id={descriptionId}
            sx={t => [
              basePromptElementStyles,
              {
                display: 'block',
                paddingInlineStart: `calc(${TRACK_INNER_WIDTH(t)} + ${TRACK_PADDING} + ${TRACK_PADDING} + ${t.sizes.$2})`,
                fontSize: '0.75rem',
                lineHeight: '1.3333333333',
                color: '#c3c3c6',
                textWrap: 'pretty',
              },
            ]}
          >
            {description}
          </Span>
        ) : null}
      </Flex>
    );
  },
);

const Link = forwardRef<HTMLAnchorElement, React.ComponentProps<'a'> & { css?: SerializedStyles }>(
  ({ children, css: cssProp, ...props }, ref) => {
    return (
      <a
        ref={ref}
        {...props}
        css={[
          basePromptElementStyles,
          css`
            color: #a8a8ff;
            font-size: inherit;
            font-weight: 500;
            line-height: 1.3;
            font-size: 0.8125rem;
            min-width: 0;
          `,
          cssProp,
        ]}
      >
        {children}
      </a>
    );
  },
);
