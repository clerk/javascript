import React from 'react';

import { Col, Flex, Heading, type LocalizationKey, Text } from '@/customizables';

import { ConfigureSSOWizard } from '../wizard';

interface StepLayoutProps {
  title?: LocalizationKey | string;
  subtitle?: LocalizationKey | string;
  /**
   * Suppresses the wizard's "Step X/Y" badge in the header even when
   * the active wizard would otherwise render one. Useful for terminal
   * steps (e.g. confirmation) where the count adds noise
   */
  hideStepIndicator?: boolean;
  children: React.ReactNode;
}

/**
 * Renders the title row (with the Wizard's Step X/Y badge) on top, a divider, and the step body
 * underneath. Each individual step file owns the body content
 *
 * The Step X/Y badge is rendered via `ConfigureSSOWizard.StepIndicator`,
 * which self-hides on steps that have no inner sub-steps. Pass
 * `hideStepIndicator` to suppress it explicitly
 */
export const StepLayout = ({ title, subtitle, hideStepIndicator, children }: StepLayoutProps): JSX.Element => {
  // When there's nothing to render in the header row (no title and no
  // step indicator), drop the row entirely so we don't leave a tall
  // empty band at the top of the step
  const showHeaderRow = Boolean(title) || !hideStepIndicator;

  return (
    <Col
      sx={{
        flex: 1,
        minHeight: 0,
      }}
    >
      {showHeaderRow ? (
        <Flex
          align='center'
          justify='between'
          sx={theme => ({
            gap: theme.space.$4,
            padding: theme.space.$5,
          })}
        >
          {title ? (
            <Col sx={theme => ({ gap: theme.space.$1, minWidth: 0 })}>
              <Heading
                textVariant='h3'
                sx={theme => ({ color: theme.colors.$colorForeground, fontSize: theme.fontSizes.$lg })}
                localizationKey={title}
              />

              {subtitle ? (
                <Text
                  as='p'
                  variant='body'
                  sx={theme => ({ color: theme.colors.$colorMutedForeground })}
                  localizationKey={subtitle}
                />
              ) : null}
            </Col>
          ) : null}
          {hideStepIndicator ? null : <ConfigureSSOWizard.StepIndicator />}
        </Flex>
      ) : null}
      <Col
        sx={theme => ({
          flex: 1,
          paddingInline: theme.space.$5,
          paddingBlockStart: showHeaderRow ? theme.space.$none : theme.space.$5,
          overflowY: 'auto',
        })}
      >
        {children}
      </Col>
    </Col>
  );
};
