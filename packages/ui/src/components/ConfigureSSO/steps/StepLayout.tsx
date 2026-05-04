import React from 'react';

import { Col, Flex, Heading, Text } from '@/customizables';
import { Wizard } from '@/elements/Wizard';

interface StepLayoutProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Renders the title row (with the Wizard's Step X/Y badge) on top, a divider, and the step body
 * underneath. Each individual step file owns the body content.
 *
 * The Step X/Y badge is rendered via `Wizard.StepIndicator`, which
 * self-hides on steps that have no inner sub-steps — so consumers
 * never have to opt in/out manually.
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
            >
              {title}
            </Heading>
            {subtitle ? (
              <Text
                as='p'
                variant='body'
                sx={theme => ({ color: theme.colors.$colorMutedForeground })}
              >
                {subtitle}
              </Text>
            ) : null}
          </Col>
        ) : null}
        <Wizard.StepIndicator />
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
