import { createContextAndHook, useClerk } from '@clerk/shared/react';
import type { __internal_EnableOrganizationsPromptProps, EnableEnvironmentSettingParams } from '@clerk/shared/types';
// eslint-disable-next-line no-restricted-imports
import { css } from '@emotion/react';
import React, { forwardRef, useId, useLayoutEffect, useRef, useState } from 'react';

import { useEnvironment } from '@/ui/contexts';
import { Modal } from '@/ui/elements/Modal';
import { InternalThemeProvider } from '@/ui/styledSystem';

import { Portal } from '../../../elements/Portal';
import { buttonStyles } from '../../../mosaic/button';
import { textStyles } from '../../../mosaic/text';
import { MosaicThemeProvider, useMosaicTheme } from '../../../mosaic/theme-provider';

const organizationsDashboardUrl = 'https://dashboard.clerk.com/~/organizations-settings';

const EnableOrganizationsPromptContent = ({
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
  const theme = useMosaicTheme();

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

    void environment
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
    <div
      css={css`
        width: 30rem;
        max-width: calc(100vw - 2rem);
        overflow: hidden;
        position: relative;
        isolation: isolate;
        border-radius: 0.75rem;
        background-color: ${theme.colors.gray[1500]};
        box-shadow:
          0 32px 72px -12px ${theme.alpha(theme.colors.black, 40)},
          0 16px 32px -6px ${theme.alpha(theme.colors.black, 40)};
        border: 1px solid ${theme.alpha(theme.colors.black, 56)};
      `}
    >
      <div
        css={css`
          display: flex;
          flex-direction: column;
          overflow: clip;
          border-radius: calc(0.75rem - 1px);
          background-color: ${theme.colors.gray[1400]};
          box-shadow:
            inset 0 0 1px 1px ${theme.alpha(theme.colors.white, 4)},
            0 1px 2px ${theme.alpha(theme.colors.black, 16)},
            0 0 2px ${theme.alpha(theme.colors.black, 8)};
          border: 1px solid ${theme.alpha(theme.colors.black, 40)};
        `}
      >
        <header
          css={css`
            padding: ${theme.spacing[4]};
            display: flex;
            align-items: center;
            gap: ${theme.spacing[2]};
            border-bottom: 1px solid ${theme.alpha(theme.colors.white, 4)};
          `}
        >
          <svg
            viewBox='0 0 128 128'
            fill='none'
            css={css`
              width: 1.25rem;
              height: 1.25rem;
            `}
          >
            <circle
              cx='64'
              cy='64'
              r='20'
              fill='white'
            />
            <path
              d='M99.5716 10.788C101.571 12.1272 101.742 14.9444 100.04 16.646L85.4244 31.2618C84.1035 32.5828 82.0542 32.7914 80.3915 31.9397C75.4752 29.421 69.9035 28 64 28C44.1177 28 28 44.1177 28 64C28 69.9035 29.421 75.4752 31.9397 80.3915C32.7914 82.0542 32.5828 84.1035 31.2618 85.4244L16.646 100.04C14.9444 101.742 12.1272 101.571 10.788 99.5716C3.97411 89.3989 0 77.1635 0 64C0 28.6538 28.6538 0 64 0C77.1635 0 89.3989 3.97411 99.5716 10.788Z'
              fill='white'
              fillOpacity='0.4'
            />
            <path
              d='M100.04 111.354C101.742 113.056 101.571 115.873 99.5717 117.212C89.3989 124.026 77.1636 128 64 128C50.8364 128 38.6011 124.026 28.4283 117.212C26.4289 115.873 26.2581 113.056 27.9597 111.354L42.5755 96.7382C43.8965 95.4172 45.9457 95.2085 47.6084 96.0603C52.5248 98.579 58.0964 100 64 100C69.9036 100 75.4753 98.579 80.3916 96.0603C82.0543 95.2085 84.1036 95.4172 85.4245 96.7382L100.04 111.354Z'
              fill='white'
            />
          </svg>
          <h1 css={textStyles({ variant: 'heading-6' })}>Enable Organizations</h1>
        </header>
        <div
          css={css`
            display: flex;
            flex-direction: column;
            gap: ${theme.spacing[2]};
            padding: ${theme.spacing[4]};
          `}
        >
          <p
            css={textStyles({
              color: 'default',
            })}
          >
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi, earum?
          </p>
          <p
            css={textStyles({
              color: 'default',
            })}
          >
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi, earum?
          </p>
        </div>
      </div>
      <footer
        css={css`
          display: flex;
          gap: ${theme.spacing[3]};
          justify-content: flex-end;
          padding: ${theme.spacing[4]};
        `}
      >
        <button
          type='button'
          css={buttonStyles({ variant: 'secondary' })}
        >
          I&apos;ll remove it myself
        </button>
        <button
          type='button'
          css={buttonStyles()}
        >
          Enable Organizations
        </button>
      </footer>
    </div>
  );

  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        width: 30rem;
        max-width: calc(100vw - 2rem);
        font-family: ${theme.fontFamilies.sans};
        border-radius: ${theme.spacing[3]};
        background:
          linear-gradient(180deg, ${theme.alpha(theme.colors.white, 1)} 0%, ${theme.alpha(theme.colors.white, 0)} 100%),
          ${theme.colors.gray[1400]};
        box-shadow: ${theme.shadows.card()};
      `}
    >
      <div
        css={css`
          display: flex;
          flex-direction: column;
          padding: ${theme.spacing[4]} ${theme.spacing[5]};
          gap: ${theme.spacing[0.5]};
        `}
      >
        <header
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[2]};
          `}
        >
          <CoinFlip isEnabled={isEnabled} />

          <h1
            css={[
              textStyles({ variant: 'heading-6' }),
              css`
                outline: none;
              `,
            ]}
            tabIndex={-1}
            ref={initialFocusRef}
          >
            {isEnabled ? 'Organizations feature enabled' : 'Organizations feature required'}
          </h1>
        </header>

        <div
          css={css`
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: ${theme.spacing[0.5]};
          `}
        >
          {isEnabled ? (
            <p css={textStyles({ variant: 'body-3', color: 'muted' })}>
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
                css={textStyles({ variant: 'body-3', color: 'muted' })}
              >
                Enable Organizations to use{' '}
                <code css={textStyles({ variant: 'label-3', font: 'mono' })}>
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
        </div>

        {hasPersonalAccountsEnabled && !isEnabled && (
          <div
            css={css`
              display: flex;
              flex-direction: column;
              margin-top: ${theme.spacing[3]};
              padding-top: ${theme.spacing[3]};
              border-top: 1px solid ${theme.alpha(theme.colors.white, 4)};
            `}
          >
            <RadioGroup
              value={allowPersonalAccount ? 'optional' : 'required'}
              onChange={value => setAllowPersonalAccount(value === 'optional')}
              labelledBy={radioGroupLabelId}
            >
              <RadioGroupItem
                value='required'
                label={
                  <span
                    css={css`
                      display: flex;
                      flex-wrap: wrap;
                      column-gap: ${theme.spacing[2]};
                      row-gap: ${theme.spacing[1]};
                    `}
                  >
                    <span>Membership required</span>
                    <PromptBadge>Standard</PromptBadge>
                  </span>
                }
                description={
                  <>
                    <span
                      css={css`
                        display: block;
                      `}
                    >
                      Users need to belong to at least one organization.
                    </span>
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
          </div>
        )}
      </div>

      <div
        css={css`
          display: flex;
          justify-content: flex-end;
          padding: ${theme.spacing[4]};
          gap: ${theme.spacing[3]};
          border-top: 1px solid ${theme.alpha(theme.colors.white, 4)};
        `}
      >
        {isEnabled ? (
          <button
            type='button'
            onClick={() => {
              if (!clerk.user) {
                void clerk.redirectToSignIn();
                clerk.__internal_closeEnableOrganizationsPrompt?.();
              } else {
                onSuccess?.();
              }
            }}
            css={buttonStyles()}
          >
            {clerk.user ? 'Continue' : 'Sign in to continue'}
          </button>
        ) : (
          <>
            <button
              type='button'
              onClick={() => {
                clerk?.__internal_closeEnableOrganizationsPrompt?.();
                onClose?.();
              }}
              css={buttonStyles()}
            >
              I&apos;ll remove it myself
            </button>

            <button
              type='button'
              onClick={handleEnableOrganizations}
              disabled={isLoading}
              css={buttonStyles()}
            >
              Enable Organizations
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const EnableOrganizationsPromptInternal = (props: __internal_EnableOrganizationsPromptProps): JSX.Element => {
  const initialFocusRef = useRef<HTMLHeadingElement>(null);

  return (
    <Portal>
      <Modal
        canCloseModal={false}
        containerSx={() => ({ alignItems: 'center' })}
        initialFocusRef={initialFocusRef}
      >
        <MosaicThemeProvider>
          <EnableOrganizationsPromptContent {...props} />
        </MosaicThemeProvider>
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

type PromptBadgeProps = {
  children: React.ReactNode;
};

const PromptBadge = ({ children }: PromptBadgeProps): JSX.Element => {
  const theme = useMosaicTheme();

  return (
    <span
      css={[
        textStyles({ variant: 'label-4' }),
        css`
          display: inline-flex;
          align-items: center;
          padding: ${theme.spacing[0.5]} ${theme.spacing[1.5]};
          border-radius: ${theme.spacing[1]};
          background-color: ${theme.colors.gray[200]};
          color: ${theme.colors.gray[1200]};
          white-space: nowrap;
        `,
      ]}
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
  const theme = useMosaicTheme();
  const contextValue = React.useMemo(() => ({ value: { name, value, onChange } }), [name, value, onChange]);

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <div
        role='radiogroup'
        aria-orientation='vertical'
        aria-labelledby={labelledBy}
        css={css`
          display: flex;
          flex-direction: column;
          gap: ${theme.spacing[3]};
        `}
      >
        {children}
      </div>
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
  const theme = useMosaicTheme();
  const checked = value === selectedValue;

  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing[1]};
      `}
    >
      <label
        css={[
          textStyles(),
          css`
            display: flex;
            align-items: flex-start;
            gap: ${RADIO_GAP};
            cursor: pointer;
            user-select: none;

            &:has(input:focus-visible) > span:first-of-type {
              outline: 2px solid ${theme.colors.white};
              outline-offset: 2px;
            }

            &:hover:has(input:not(:checked)) > span:first-of-type {
              background-color: ${theme.alpha(theme.colors.white, 8)};
            }

            &:hover:has(input:checked) > span:first-of-type {
              background-color: ${theme.alpha(theme.colors.purple[700], 80)};
            }
          `,
        ]}
      >
        <input
          type='radio'
          name={name}
          value={value}
          checked={checked}
          onChange={() => onChange(value)}
          aria-describedby={description ? descriptionId : undefined}
          css={[
            textStyles(),
            css`
              position: absolute;
              width: 1px;
              height: 1px;
              padding: 0;
              margin: -1px;
              overflow: hidden;
              clip: rect(0, 0, 0, 0);
              white-space: nowrap;
              border-width: 0;
            `,
          ]}
        />

        <span
          aria-hidden='true'
          css={[
            textStyles(),
            css`
              position: relative;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: ${RADIO_INDICATOR_SIZE};
              height: ${RADIO_INDICATOR_SIZE};
              margin-top: 0.125rem;
              flex-shrink: 0;
              border-radius: 50%;
              border: 1px solid ${theme.alpha(theme.colors.white, 30)};
              background-color: transparent;
              transition: 120ms ease-in-out;
              transition-property: border-color, background-color, box-shadow;

              ${checked &&
              css`
                border-width: 2px;
                border-color: ${theme.colors.purple[700]};
                background-color: ${theme.colors.purple[700]};
                box-shadow: 0 0 0 2px ${theme.alpha(theme.colors.purple[700], 20)};
              `}

              &::after {
                content: '';
                position: absolute;
                width: 0.375rem;
                height: 0.375rem;
                border-radius: 50%;
                background-color: ${theme.colors.white};
                opacity: ${checked ? 1 : 0};
                transform: scale(${checked ? 1 : 0});
                transition: 120ms ease-in-out;
                transition-property: opacity, transform;
              }
            `,
          ]}
        />

        <span css={textStyles({ variant: 'label-2' })}>{label}</span>
      </label>

      {description && (
        <span
          id={descriptionId}
          css={[
            textStyles({ variant: 'label-3', color: 'subtle' }),
            css`
              padding-inline-start: calc(${RADIO_INDICATOR_SIZE} + ${RADIO_GAP});
              text-wrap: pretty;
            `,
          ]}
        >
          {description}
        </span>
      )}
    </div>
  );
};

const Link = forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(({ children, ...props }, ref) => {
  return (
    <a
      ref={ref}
      {...props}
      css={[
        textStyles({ variant: 'body-3', color: 'accent' }),
        css`
          min-width: 0;
        `,
      ]}
    >
      {children}
    </a>
  );
});

// Inlined icons from shared.tsx
const ClerkLogoIcon = (): JSX.Element => {
  return (
    <svg
      width='1rem'
      height='1.25rem'
      viewBox='0 0 16 20'
      fill='none'
      aria-hidden
      xmlns='http://www.w3.org/2000/svg'
    >
      <g filter='url(#filter0_i_438_501)'>
        <path
          d='M10.4766 9.99979C10.4766 11.3774 9.35978 12.4942 7.98215 12.4942C6.60452 12.4942 5.48773 11.3774 5.48773 9.99979C5.48773 8.62216 6.60452 7.50537 7.98215 7.50537C9.35978 7.50537 10.4766 8.62216 10.4766 9.99979Z'
          fill='#BBBBBB'
        />
        <path
          d='M12.4176 3.36236C12.6676 3.52972 12.6889 3.88187 12.4762 4.09457L10.6548 5.91595C10.4897 6.08107 10.2336 6.10714 10.0257 6.00071C9.41273 5.68684 8.71811 5.50976 7.98214 5.50976C5.5024 5.50976 3.49219 7.51998 3.49219 9.99972C3.49219 10.7357 3.66926 11.4303 3.98314 12.0433C4.08957 12.2511 4.06349 12.5073 3.89837 12.6724L2.07699 14.4938C1.86429 14.7065 1.51215 14.6851 1.34479 14.4352C0.495381 13.1666 0 11.641 0 9.99972C0 5.5913 3.57373 2.01758 7.98214 2.01758C9.62345 2.01758 11.1491 2.51296 12.4176 3.36236Z'
          fill='#8F8F8F'
        />
        <path
          d='M12.4762 15.905C12.6889 16.1177 12.6675 16.4698 12.4176 16.6372C11.149 17.4866 9.62342 17.982 7.9821 17.982C6.34078 17.982 4.81516 17.4866 3.54661 16.6372C3.29666 16.4698 3.27531 16.1177 3.48801 15.905L5.30938 14.0836C5.4745 13.9185 5.73066 13.8924 5.93851 13.9988C6.55149 14.3127 7.24612 14.4898 7.9821 14.4898C8.71808 14.4898 9.4127 14.3127 10.0257 13.9988C10.2335 13.8924 10.4897 13.9185 10.6548 14.0836L12.4762 15.905Z'
          fill='#BBBBBB'
        />
      </g>
      <defs>
        <filter
          id='filter0_i_438_501'
          x='0'
          y='1.86758'
          width='12.6217'
          height='16.1144'
          filterUnits='userSpaceOnUse'
          colorInterpolationFilters='sRGB'
        >
          <feFlood
            floodOpacity='0'
            result='BackgroundImageFix'
          />
          <feBlend
            mode='normal'
            in='SourceGraphic'
            in2='BackgroundImageFix'
            result='shape'
          />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='-0.15' />
          <feGaussianBlur stdDeviation='0.15' />
          <feComposite
            in2='hardAlpha'
            operator='arithmetic'
            k2='-1'
            k3='1'
          />
          <feColorMatrix
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0'
          />
          <feBlend
            mode='normal'
            in2='shape'
            result='effect1_innerShadow_438_501'
          />
        </filter>
      </defs>
    </svg>
  );
};

const PromptSuccessIcon = (props: React.ComponentProps<'svg'>): JSX.Element => {
  const theme = useMosaicTheme();
  return (
    <svg
      {...props}
      viewBox='0 0 16 17'
      fill='none'
      aria-hidden
      xmlns='http://www.w3.org/2000/svg'
      css={css`
        color: ${theme.colors.green[500]};
      `}
    >
      <g opacity='0.88'>
        <path
          d='M13.8002 8.20039C13.8002 8.96206 13.6502 9.71627 13.3587 10.42C13.0672 11.1236 12.64 11.763 12.1014 12.3016C11.5628 12.8402 10.9234 13.2674 10.2198 13.5589C9.51607 13.8504 8.76186 14.0004 8.0002 14.0004C7.23853 14.0004 6.48432 13.8504 5.78063 13.5589C5.07694 13.2674 4.43756 12.8402 3.89898 12.3016C3.3604 11.763 2.93317 11.1236 2.64169 10.42C2.35022 9.71627 2.2002 8.96206 2.2002 8.20039C2.2002 6.66214 2.81126 5.18688 3.89898 4.09917C4.98669 3.01146 6.46194 2.40039 8.0002 2.40039C9.53845 2.40039 11.0137 3.01146 12.1014 4.09917C13.1891 5.18688 13.8002 6.66214 13.8002 8.20039Z'
          fill='currentColor'
          fillOpacity='0.16'
        />
        <path
          d='M6.06686 8.68372L7.51686 10.1337L9.93353 6.75039M13.8002 8.20039C13.8002 8.96206 13.6502 9.71627 13.3587 10.42C13.0672 11.1236 12.64 11.763 12.1014 12.3016C11.5628 12.8402 10.9234 13.2674 10.2198 13.5589C9.51607 13.8504 8.76186 14.0004 8.0002 14.0004C7.23853 14.0004 6.48432 13.8504 5.78063 13.5589C5.07694 13.2674 4.43756 12.8402 3.89898 12.3016C3.3604 11.763 2.93317 11.1236 2.64169 10.42C2.35022 9.71627 2.2002 8.96206 2.2002 8.20039C2.2002 6.66214 2.81126 5.18688 3.89898 4.09917C4.98669 3.01146 6.46194 2.40039 8.0002 2.40039C9.53845 2.40039 11.0137 3.01146 12.1014 4.09917C13.1891 5.18688 13.8002 6.66214 13.8002 8.20039Z'
          stroke='currentColor'
          strokeWidth='1.2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
    </svg>
  );
};

const CoinFlip = ({ isEnabled }: { isEnabled: boolean }): JSX.Element => {
  const theme = useMosaicTheme();
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
              color: ${theme.colors.yellow[500]};
            `}
            viewBox='0 0 20 20'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              opacity='0.2'
              d='M17.25 10C17.25 14.0041 14.0041 17.25 10 17.25C5.99594 17.25 2.75 14.0041 2.75 10C2.75 5.99594 5.99594 2.75 10 2.75C14.0041 2.75 17.25 5.99594 17.25 10Z'
              fill='currentColor'
            />
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M10 3.5C6.41015 3.5 3.5 6.41015 3.5 10C3.5 13.5899 6.41015 16.5 10 16.5C13.5899 16.5 16.5 13.5899 16.5 10C16.5 6.41015 13.5899 3.5 10 3.5ZM2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10Z'
              fill='currentColor'
            />
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M10 6C10.5523 6 11 6.44772 11 7V9C11 9.55228 10.5523 10 10 10C9.44772 10 9 9.55228 9 9V7C9 6.44772 9.44772 6 10 6Z'
              fill='currentColor'
            />
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M10 12C10.5523 12 11 12.4477 11 13V13.01C11 13.5623 10.5523 14.01 10 14.01C9.44772 14.01 9 13.5623 9 13.01V13C9 12.4477 9.44772 12 10 12Z'
              fill='currentColor'
            />
          </svg>
        );
    }
  };

  return (
    <div
      css={css`
        -webkit-perspective: 1000px;
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
          -webkit-transform-style: preserve-3d;
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
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
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
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            transform: rotateY(180deg);
            display: flex;
            align-items: center;
            justify-content: center;
          `}
        >
          {renderContent(backFaceType)}
        </span>
      </div>
    </div>
  );
};
