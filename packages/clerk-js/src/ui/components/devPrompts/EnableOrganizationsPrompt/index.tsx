import { createContextAndHook, useClerk } from '@clerk/shared/react';
import type { __internal_EnableOrganizationsPromptProps, EnableEnvironmentSettingParams } from '@clerk/shared/types';
// eslint-disable-next-line no-restricted-imports
import type { SerializedStyles } from '@emotion/react';
// eslint-disable-next-line no-restricted-imports
import { css } from '@emotion/react';
import React, { forwardRef, useId, useLayoutEffect, useRef, useState } from 'react';

import { useEnvironment } from '@/ui/contexts';
import { Modal } from '@/ui/elements/Modal';
import { InternalThemeProvider } from '@/ui/styledSystem';

import { DevTools } from '../../../../core/resources/DevTools';
import { Flex } from '../../../customizables';
import { Portal } from '../../../elements/Portal';
import { basePromptElementStyles, ClerkLogoIcon, PromptContainer, PromptSuccessIcon } from '../shared';

const organizationsDashboardUrl = 'https://dashboard.clerk.com/~/organizations-settings';

const EnableOrganizationsPromptInternal = ({
  caller,
  onSuccess,
  onClose,
}: __internal_EnableOrganizationsPromptProps): JSX.Element => {
  const clerk = useClerk();
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [defaultOrganizationName, setDefaultOrganizationName] = useState<string | null>(null);
  const [allowPersonalAccount, setAllowPersonalAccount] = useState(false);

  const initialFocusRef = useRef<HTMLHeadingElement>(null);
  const environment = useEnvironment();
  const radioGroupLabelId = useId();

  const isComponent = !caller.startsWith('use');

  // 'forceOrganizationSelection' is omitted from the environment settings object if the instance does not have it available as a feature
  const hasPersonalAccountsEnabled =
    typeof environment?.organizationSettings.forceOrganizationSelection !== 'undefined';

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
      .then(async () => {
        const memberships = await clerk.user?.getOrganizationMemberships();
        const defaultOrganizationName = memberships?.data[0]?.organization.name ?? null;
        setDefaultOrganizationName(defaultOrganizationName);

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
              <CoinFlip isEnabled={isEnabled} />

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
                  {clerk.user && defaultOrganizationName
                    ? `The Organizations feature has been enabled for your application. A default organization named "${defaultOrganizationName}" was created automatically. You can manage or rename it in your`
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
                    id={radioGroupLabelId}
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
                    Enable Organizations to use{' '}
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
                  </p>

                  <Link
                    href='https://clerk.com/docs/guides/organizations/overview'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    Learn more
                  </Link>
                </>
              )}
            </Flex>

            {hasPersonalAccountsEnabled && !isEnabled && (
              <Flex
                sx={t => ({ marginTop: t.sizes.$2 })}
                direction='col'
              >
                <RadioGroup
                  value={allowPersonalAccount ? 'optional' : 'required'}
                  onChange={value => setAllowPersonalAccount(value === 'optional')}
                  labelledBy={radioGroupLabelId}
                >
                  <RadioGroupItem
                    value='required'
                    label={
                      <Flex
                        wrap='wrap'
                        sx={t => ({ columnGap: t.sizes.$2, rowGap: t.sizes.$1 })}
                      >
                        <span>Membership required</span>
                        <PromptBadge>Standard</PromptBadge>
                      </Flex>
                    }
                    description={
                      <>
                        <span className='block'>Users need to belong to at least one organization.</span>
                        <span>Common for most B2B SaaS applications</span>
                      </>
                    }
                  />
                  <RadioGroupItem
                    value='optional'
                    label='Membership optional'
                    description='Users can work outside of an organization with a personal account'
                  />
                </RadioGroup>
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
export const EnableOrganizationsPrompt = (props: __internal_EnableOrganizationsPromptProps): JSX.Element => {
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

type PromptBadgeProps = {
  children: React.ReactNode;
};

const PromptBadge = ({ children }: PromptBadgeProps): JSX.Element => {
  return (
    <span
      css={css`
        ${basePromptElementStyles};
        display: inline-flex;
        align-items: center;
        padding: 0.125rem 0.375rem;
        border-radius: 0.25rem;
        font-size: 0.6875rem;
        font-weight: 500;
        line-height: 1.23;
        background-color: #ebebeb;
        color: #2b2b34;
        white-space: nowrap;
      `}
    >
      {children}
    </span>
  );
};

type RadioGroupContextValue = {
  name: string;
  value: string;
  onChange: (value: string) => void;
};

const [RadioGroupContext, useRadioGroup] = createContextAndHook<RadioGroupContextValue>('RadioGroupContext');

type RadioGroupProps = {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  labelledBy?: string;
};

const RadioGroup = ({ value, onChange, children, labelledBy }: RadioGroupProps): JSX.Element => {
  const name = useId();
  const contextValue = React.useMemo(() => ({ value: { name, value, onChange } }), [name, value, onChange]);

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <Flex
        role='radiogroup'
        direction='col'
        gap={3}
        aria-orientation='vertical'
        aria-labelledby={labelledBy}
      >
        {children}
      </Flex>
    </RadioGroupContext.Provider>
  );
};

type RadioGroupItemProps = {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
};

const RADIO_INDICATOR_SIZE = '1rem';
const RADIO_GAP = '0.5rem';

const RadioGroupItem = ({ value, label, description }: RadioGroupItemProps): JSX.Element => {
  const { name, value: selectedValue, onChange } = useRadioGroup();
  const descriptionId = useId();
  const checked = value === selectedValue;

  return (
    <Flex
      direction='col'
      gap={1}
    >
      <label
        css={css`
          ${basePromptElementStyles};
          display: flex;
          align-items: flex-start;
          gap: ${RADIO_GAP};
          cursor: pointer;
          user-select: none;

          &:has(input:focus-visible) > span:first-of-type {
            outline: 2px solid white;
            outline-offset: 2px;
          }

          &:hover:has(input:not(:checked)) > span:first-of-type {
            background-color: rgba(255, 255, 255, 0.08);
          }

          &:hover:has(input:checked) > span:first-of-type {
            background-color: rgba(108, 71, 255, 0.8);
            background-color: color-mix(in srgb, #6c47ff 80%, transparent);
          }
        `}
      >
        <input
          type='radio'
          name={name}
          value={value}
          checked={checked}
          onChange={() => onChange(value)}
          aria-describedby={description ? descriptionId : undefined}
          css={css`
            ${basePromptElementStyles};
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
          `}
        />

        <span
          aria-hidden='true'
          css={css`
            ${basePromptElementStyles};
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: ${RADIO_INDICATOR_SIZE};
            height: ${RADIO_INDICATOR_SIZE};
            margin-top: 0.125rem;
            flex-shrink: 0;
            border-radius: 50%;
            border: 1px solid rgba(255, 255, 255, 0.3);
            background-color: transparent;
            transition: 120ms ease-in-out;
            transition-property: border-color, background-color, box-shadow;

            ${checked &&
            css`
              border-width: 2px;
              border-color: #6c47ff;
              background-color: #6c47ff;
              background-color: color-mix(in srgb, #6c47ff 100%, transparent);
              box-shadow: 0 0 0 2px rgba(108, 71, 255, 0.2);
            `}

            &::after {
              content: '';
              position: absolute;
              width: 0.375rem;
              height: 0.375rem;
              border-radius: 50%;
              background-color: white;
              opacity: ${checked ? 1 : 0};
              transform: scale(${checked ? 1 : 0});
              transition: 120ms ease-in-out;
              transition-property: opacity, transform;
            }
          `}
        />

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
      </label>

      {description && (
        <span
          id={descriptionId}
          css={[
            basePromptElementStyles,
            css`
              padding-inline-start: calc(${RADIO_INDICATOR_SIZE} + ${RADIO_GAP});
              font-size: 0.75rem;
              line-height: 1.33;
              color: #c3c3c6;
              text-wrap: pretty;
            `,
          ]}
        >
          {description}
        </span>
      )}
    </Flex>
  );
};

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

const CoinFlip = ({ isEnabled }: { isEnabled: boolean }): JSX.Element => {
  const [rotation, setRotation] = useState(0);

  useLayoutEffect(() => {
    if (isEnabled) {
      setRotation(r => (r === 0 ? 180 : 0));
      return;
    }

    const interval = setInterval(() => {
      setRotation(r => (r === 0 ? 180 : 0));
    }, 2000);

    return () => clearInterval(interval);
  }, [isEnabled]);

  let frontFaceType: 'idle' | 'success' = 'idle';
  let backFaceType: 'warning' | 'success' = 'warning';

  if (isEnabled) {
    if (rotation === 0) {
      frontFaceType = 'success';
      backFaceType = 'warning';
    } else {
      backFaceType = 'success';
      frontFaceType = 'idle';
    }
  }

  const renderContent = (type: 'idle' | 'warning' | 'success') => {
    switch (type) {
      case 'idle':
        return <ClerkLogoIcon />;
      case 'success':
        return (
          <PromptSuccessIcon
            css={css`
              width: 1.25rem;
              height: 1.25rem;
            `}
          />
        );
      case 'warning':
        return (
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
        );
    }
  };

  return (
    <div
      css={css`
        perspective: 1000px;
        width: 1.25rem;
        height: 1.25rem;
      `}
    >
      <div
        css={css`
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.6s ease-in-out;
          transform: rotateY(${rotation}deg);

          @media (prefers-reduced-motion: reduce) {
            transition: none;
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
            -webkit-font-smoothing: antialiased;
            transform: rotateY(0deg);
          `}
        >
          {renderContent(frontFaceType)}
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
            -webkit-font-smoothing: antialiased;
          `}
        >
          {renderContent(backFaceType)}
        </span>
      </div>
    </div>
  );
};
