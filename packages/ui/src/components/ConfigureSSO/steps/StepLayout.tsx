import React from 'react';

import { Col, Flex, Heading, type LocalizationKey, Text } from '@/customizables';

import { ConfigureSSOWizard } from '../wizard';

interface StepLayoutProps {
  title?: LocalizationKey | string;
  subtitle?: LocalizationKey | string;
  children: React.ReactNode;
}

/**
 * Renders the title row (with the Wizard's Step X/Y badge) on top, a divider, and the step body
 * underneath. Each individual step file owns the body content
 *
 * The Step X/Y badge is rendered via `ConfigureSSOWizard.StepIndicator`,
 * which self-hides on steps that have no inner sub-steps
 */
export const StepLayout = ({ title, subtitle, children }: StepLayoutProps): JSX.Element => {
  return (
    <Col
      sx={{
        flex: 1,
        minHeight: 0,
      }}
    >
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
        <ConfigureSSOWizard.StepIndicator />
      </Flex>
      <Col
        sx={theme => ({
          flex: 1,
          paddingInline: theme.space.$5,
          overflowY: 'auto',
        })}
      >
        {children}
      </Col>
    </Col>
  );
};
