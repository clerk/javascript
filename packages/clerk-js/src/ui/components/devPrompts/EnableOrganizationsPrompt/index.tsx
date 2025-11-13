import { useClerk } from '@clerk/shared/react';
import type { __internal_EnableOrganizationsPromptProps } from '@clerk/shared/types';
// eslint-disable-next-line no-restricted-imports
import { css } from '@emotion/react';
import { forwardRef, useMemo, useState } from 'react';

import { Modal } from '@/ui/elements/Modal';
import { common, InternalThemeProvider } from '@/ui/styledSystem';

import { DevTools } from '../../../../core/resources/DevTools';
import type { Environment } from '../../../../core/resources/Environment';
import { Flex } from '../../../customizables';
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

  // @ts-expect-error - __unstable__environment is not typed
  const environment = clerk?.__unstable__environment as Environment | undefined;

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

    void new DevTools()
      .__internal_enableEnvironmentSetting({
        enable_organizations: true,
      })
      .then(() => {
        setIsEnabled(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const isComponent = !caller.startsWith('use');

  return (
    <Portal>
      <Modal
        canCloseModal={false}
        containerSx={() => ({ alignItems: 'center' })}
      >
        <PromptContainer
          sx={() => ({
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '30rem',
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
                  `,
                ]}
              >
                {isEnabled ? 'Organizations feature enabled' : 'Organizations feature required'}
              </h1>
            </Flex>

            <Flex
              direction='col'
              sx={t => ({
                gap: t.sizes.$0x5,
              })}
            >
              {isEnabled ? (
                <span
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
                  The Organizations feature has been enabled for your application. A default organization named &quot;My
                  Organization&quot; was created automatically. You can manage or rename it in your{' '}
                  <a
                    css={[
                      basePromptElementStyles,
                      css`
                        color: #a8a8ff;
                        font-size: inherit;
                        font-weight: 500;
                        line-height: 1.3;
                        font-size: 0.8125rem;
                      `,
                    ]}
                    href={organizationsDashboardUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    tabIndex={-1}
                  >
                    dashboard
                  </a>
                  .
                </span>
              ) : (
                <>
                  <span
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
                  </span>

                  <a
                    css={[
                      basePromptElementStyles,
                      css`
                        color: #a8a8ff;
                        font-size: inherit;
                        font-weight: 500;
                        line-height: 1.5;
                        font-size: 0.8125rem;
                      `,
                    ]}
                    href='https://clerk.com/docs/guides/organizations/overview'
                    target='_blank'
                    rel='noopener noreferrer'
                    tabIndex={-1}
                  >
                    Learn more about Organizations.
                  </a>
                </>
              )}
            </Flex>

            {!isEnabled && (
              <Flex sx={t => ({ marginTop: t.sizes.$3 })}>
                <AllowPersonalAccountSwitch
                  checked={allowPersonalAccount}
                  onChange={() => setAllowPersonalAccount(!allowPersonalAccount)}
                  isDisabled={false}
                />
              </Flex>
            )}
          </Flex>

          <span
            css={css`
              height: 1px;
              background-color: #151515;
              width: 100%;
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
                onClick={() => onSuccess?.()}
              >
                Continue
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

const mainCTAStyles = css`
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
  transition: all 120ms ease-in-out;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: none;
  }
`;

type PromptButtonVariant = 'solid' | 'outline';

type PromptButtonProps = Pick<React.ComponentProps<'button'>, 'onClick' | 'children' | 'disabled'> & {
  variant?: PromptButtonVariant;
};

const PromptButton = ({ variant = 'solid', ...props }: PromptButtonProps) => {
  const solidStyles = css`
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 30.5%, rgba(0, 0, 0, 0.05) 100%), #454545;
    box-shadow:
      0px 0px 0px 1px rgba(255, 255, 255, 0.04) inset,
      0px 1px 0px 0px rgba(255, 255, 255, 0.04) inset,
      0px 0px 0px 1px rgba(0, 0, 0, 0.12),
      0px 1.5px 2px 0px rgba(0, 0, 0, 0.48),
      0px 0px 4px 0px rgba(243, 107, 22, 0) inset;

    &:hover:not(:disabled) {
      background: linear-gradient(180deg, rgba(0, 0, 0, 0) 30.5%, rgba(0, 0, 0, 0.15) 100%), #5f5f5f;
      box-shadow:
        0 0 3px 0 rgba(253, 224, 71, 0) inset,
        0 0 0 1px rgba(255, 255, 255, 0.04) inset,
        0 1px 0 0 rgba(255, 255, 255, 0.04) inset,
        0 0 0 1px rgba(0, 0, 0, 0.12),
        0 1.5px 2px 0 rgba(0, 0, 0, 0.48);
    }

    &:focus:not(:disabled) {
      border: 1px solid rgba(115, 115, 115);
      background: linear-gradient(180deg, rgba(0, 0, 0, 0) 30.5%, rgba(0, 0, 0, 0.05) 100%), #454545;
      box-shadow:
        0 0 0 4px rgba(255, 255, 255, 0.05),
        0 0 3px 0 rgba(255, 255, 255, 0) inset,
        0 0 0 1px rgba(255, 255, 255, 0.25) inset,
        0 1px 0 0 rgba(255, 255, 255, 0.04) inset,
        0 0 0 1px rgba(0, 0, 0, 0.12),
        0 1.5px 2px 0 rgba(0, 0, 0, 0.48);
    }
  `;

  const outlineStyles = css`
    background: rgba(69, 69, 69, 0.1);
    border: 1px solid rgba(118, 118, 132, 0.25);

    &:hover:not(:disabled) {
      box-shadow:
        0px 0px 6px 0px rgba(255, 255, 255, 0.04) inset,
        0px 0px 0px 1px rgba(255, 255, 255, 0.04) inset,
        0px 1px 0px 0px rgba(255, 255, 255, 0.04) inset,
        0px 0px 0px 1px rgba(0, 0, 0, 0.1),
        0px 1.5px 2px 0px rgba(0, 0, 0, 0.48);
    }

    &:hover:not(:disabled) {
      border: 1px solid rgba(115, 115, 115);
    }

    &:focus:not(:disabled) {
      border: 1px solid rgba(115, 115, 115);

      box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.05);
    }
  `;

  return (
    <button
      type='button'
      css={[mainCTAStyles, variant === 'solid' ? solidStyles : outlineStyles]}
      {...props}
    />
  );
};

type AllowPersonalAccountSwitchProps = {
  checked: boolean;
  isDisabled: boolean;
  onChange: (checked: boolean) => void;
};

const AllowPersonalAccountSwitch = forwardRef<HTMLDivElement, AllowPersonalAccountSwitchProps>(
  ({ checked, onChange, isDisabled = false }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isDisabled) {
        return;
      }

      onChange?.(e.target.checked);
    };

    return (
      <Flex
        ref={ref}
        direction='row'
        align='center'
        as='label'
        gap={2}
        sx={t => ({
          isolation: 'isolate',
          width: 'fit-content',
          '&:has(input:focus-visible) > input + span': {
            ...common.focusRingStyles(t),
          },
        })}
      >
        {/* The order of the elements is important here for the focus ring to work. The input is visually hidden, so the focus ring is applied to the span. */}
        <input
          type='checkbox'
          role='switch'
          disabled={isDisabled}
          checked={checked}
          onChange={handleChange}
          tabIndex={-1}
          style={{
            ...common.visuallyHidden(),
          }}
        />
        <Flex
          as='span'
          data-checked={checked}
          sx={t => ({
            minWidth: t.sizes.$7,
            alignSelf: 'flex-start',
            height: t.sizes.$4,
            alignItems: 'center',
            position: 'relative',
            borderColor: '#DBDBE0',
            backgroundColor: checked ? '#DBDBE0' : t.colors.$primary500,
            borderRadius: 999,
            transition: 'background-color 0.2s',
            opacity: isDisabled ? 0.6 : 1,
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            outline: 'none',
            boxSizing: 'border-box',
            boxShadow:
              '0px 0px 6px 0px rgba(255, 255, 255, 0.04) inset, 0px 0px 0px 1px rgba(255, 255, 255, 0.04) inset, 0px 1px 0px 0px rgba(255, 255, 255, 0.04) inset, 0px 0px 0px 1px rgba(0, 0, 0, 0.1)',
          })}
        >
          <Flex
            sx={t => ({
              position: 'absolute',
              left: t.sizes.$0x5,
              width: t.sizes.$3,
              height: t.sizes.$3,
              borderRadius: '50%',
              backgroundColor: 'white',
              boxShadow: t.shadows.$switchControl,
              transform: `translateX(${checked ? t.sizes.$3 : 0})`,
              transition: 'transform 0.2s',
              zIndex: 1,
            })}
          />
        </Flex>

        <Flex
          direction='col'
          gap={1}
        >
          <p
            css={[
              basePromptElementStyles,
              css`
                font-size: 0.875rem;
                font-weight: 400;
                line-height: 1.23;
                color: white;
              `,
            ]}
          >
            Allow personal account
          </p>

          <span
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
            This is an uncommon setting, meant for applications that sell to both organizations and individual users.
            Most B2B applications require users to be part of an organization, and should keep this setting disabled.
          </span>
        </Flex>
      </Flex>
    );
  },
);
