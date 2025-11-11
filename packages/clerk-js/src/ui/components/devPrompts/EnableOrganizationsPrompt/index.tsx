import { useClerk } from '@clerk/shared/react';
import type { __internal_EnableOrganizationsPromptProps } from '@clerk/shared/types';
// eslint-disable-next-line no-restricted-imports
import { css } from '@emotion/react';
import { useState } from 'react';

import { Modal } from '@/ui/elements/Modal';
import { InternalThemeProvider } from '@/ui/styledSystem';

import { DevTools } from '../../../../core/resources/DevTools';
import { Flex } from '../../../customizables';
import { Portal } from '../../../elements/Portal';
import { basePromptElementStyles, PromptContainer } from '../shared';

const EnableOrganizationsPromptInternal = (props: __internal_EnableOrganizationsPromptProps) => {
  const ctaText = 'componentName' in props ? `<${props.componentName} />` : props.utilityName;
  const clerk = useClerk();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnableOrganizations = () => {
    setIsLoading(true);

    void new DevTools()
      .__internal_enableEnvironmentSetting({
        enable_organizations: true,
      })
      .then(() => {
        // Re-fetch environment to get updated settings
        // @ts-expect-error - __unstable__environment is not typed
        const environment = clerk?.__unstable__environment;
        environment.fetch?.();
        clerk?.__internal_closeEnableOrganizationsPrompt?.();
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

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
                Organizations feature required
              </h1>
            </Flex>

            <Flex
              direction='col'
              sx={t => ({
                gap: t.sizes.$0x5,
                maxWidth: '18.75rem',
              })}
            >
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
                      color: white;
                      font-family: monospace;
                      line-height: 1.23;
                    `,
                  ]}
                >
                  {ctaText}
                </code>{' '}
                {'componentName' in props ? 'component' : 'hook'}, you&apos;ll need to enable the Organizations feature
                for your app first.
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
                href='https://clerk.com/docs/guides/organizations'
                target='_blank'
                rel='noopener noreferrer'
                tabIndex={-1}
              >
                Learn more about this add-on.
              </a>
            </Flex>
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
            direction='col'
            justify='center'
            sx={t => ({
              padding: `${t.sizes.$4} ${t.sizes.$6}`,
              gap: t.sizes.$3,
            })}
          >
            <button
              type='button'
              onClick={handleEnableOrganizations}
              disabled={isLoading}
              css={css`
                ${mainCTAStyles};
                min-width: 100%;
                color: white;
                background: linear-gradient(180deg, rgba(0, 0, 0, 0) 30.5%, rgba(0, 0, 0, 0.05) 100%), #454545;
                box-shadow:
                  0px 0px 0px 1px rgba(255, 255, 255, 0.04) inset,
                  0px 1px 0px 0px rgba(255, 255, 255, 0.04) inset,
                  0px 0px 0px 1px rgba(0, 0, 0, 0.12),
                  0px 1.5px 2px 0px rgba(0, 0, 0, 0.48),
                  0px 0px 4px 0px rgba(243, 107, 22, 0) inset;

                &:hover:not(:disabled) {
                  box-shadow:
                    0px 0px 6px 0px rgba(255, 255, 255, 0.04) inset,
                    0px 0px 0px 1px rgba(255, 255, 255, 0.04) inset,
                    0px 1px 0px 0px rgba(255, 255, 255, 0.04) inset,
                    0px 0px 0px 1px rgba(0, 0, 0, 0.1),
                    0px 1.5px 2px 0px rgba(0, 0, 0, 0.48);
                }

                &:disabled {
                  opacity: 0.6;
                  cursor: not-allowed;
                }
              `}
            >
              Enable Organizations
            </button>

            <button
              type='button'
              css={css`
                ${mainCTAStyles};
                min-width: 100%;
                color: white;
                background: rgba(69, 69, 69, 0.1);
                border: 1px solid rgba(118, 118, 132, 0.25);

                &:hover {
                  box-shadow:
                    0px 0px 6px 0px rgba(255, 255, 255, 0.04) inset,
                    0px 0px 0px 1px rgba(255, 255, 255, 0.04) inset,
                    0px 1px 0px 0px rgba(255, 255, 255, 0.04) inset,
                    0px 0px 0px 1px rgba(0, 0, 0, 0.1),
                    0px 1.5px 2px 0px rgba(0, 0, 0, 0.48);
                }
              `}
            >
              I&apos;ll remove it myself
            </button>
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
  width: 100%;
  height: 1.75rem;
  max-width: 14.625rem;
  padding: 0.25rem 0.625rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.12px;
  color: white;
  text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.32);
  white-space: nowrap;
  user-select: none;
`;
