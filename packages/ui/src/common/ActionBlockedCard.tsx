import { Col, descriptors, Flex, Flow, Icon, localizationKeys, Text } from '../customizables';
import { Card } from '../elements/Card';
import { Header } from '../elements/Header';
import { ExclamationTriangle } from '../icons';
import type { ActionBlockedDetails } from '../utils/actionBlocked';
import { safeHref } from '../utils/actionBlocked';

export type { ActionBlockedDetails };

type ActionBlockedCardProps = {
  details: ActionBlockedDetails;
};

/**
 * Replaces a card's body when its request was blocked: there is no field to correct and no retry
 * that helps, so it is shown instead of the form rather than as an inline error beside it.
 */
export const ActionBlockedCard = (props: ActionBlockedCardProps) => {
  const { traceId, title, description, linkUrl, linkText } = props.details;
  const href = safeHref(linkUrl);

  return (
    <Flow.Part part='actionBlocked'>
      <Card.Root>
        <Card.Content>
          <Header.Root>
            {title ? (
              <Header.Title>{title}</Header.Title>
            ) : (
              <Header.Title localizationKey={localizationKeys('actionBlocked.title')} />
            )}
            {description ? (
              <Header.Subtitle>{description}</Header.Subtitle>
            ) : (
              <Header.Subtitle localizationKey={localizationKeys('actionBlocked.subtitle')} />
            )}
          </Header.Root>

          <Col
            elementDescriptor={descriptors.main}
            gap={6}
          >
            <Flex
              elementDescriptor={descriptors.actionBlockedIconBox}
              center
              sx={theme => ({
                alignSelf: 'center',
                width: theme.sizes.$16,
                height: theme.sizes.$16,
                borderRadius: theme.radii.$circle,
                backgroundColor: theme.colors.$neutralAlpha100,
                color: theme.colors.$danger500,
              })}
            >
              <Icon
                elementDescriptor={descriptors.actionBlockedIcon}
                icon={ExclamationTriangle}
                sx={theme => ({ height: theme.sizes.$5, width: theme.sizes.$5 })}
              />
            </Flex>

            {href ? (
              <Text
                elementDescriptor={descriptors.actionBlockedLink}
                as='a'
                variant='buttonLarge'
                colorScheme='inherit'
                sx={{ textAlign: 'center', textDecoration: 'underline' }}
                // The destination is the application's choice, not necessarily under its control.
                {...{ href, target: '_blank', rel: 'noopener noreferrer' }}
              >
                {linkText || href}
              </Text>
            ) : null}

            {traceId ? (
              <Col
                elementDescriptor={descriptors.actionBlockedTraceIdBox}
                gap={1}
                sx={{ alignItems: 'center' }}
              >
                <Text
                  elementDescriptor={descriptors.actionBlockedTraceIdLabel}
                  variant='caption'
                  colorScheme='secondary'
                  localizationKey={localizationKeys('actionBlocked.traceIdLabel')}
                />
                <Text
                  elementDescriptor={descriptors.actionBlockedTraceId}
                  variant='body'
                  colorScheme='secondary'
                  sx={theme => ({
                    fontFamily: theme.fonts.$buttons,
                    userSelect: 'all',
                    letterSpacing: theme.space.$xxs,
                  })}
                >
                  {traceId}
                </Text>
              </Col>
            ) : null}
          </Col>
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    </Flow.Part>
  );
};
