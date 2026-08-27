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
 * The screen shown when a request was blocked and there is nothing the end user
 * can do to retry it.
 *
 * A block is terminal — there is no field to correct and no second attempt that
 * helps — so it replaces the form rather than appearing as an inline error
 * beside it. The one thing the user can act on is the reference, which is why it
 * is always rendered and is selectable.
 */
export const ActionBlockedCard = (props: ActionBlockedCardProps) => {
  const { traceId, title, description, linkUrl, linkText } = props.details;
  const href = safeHref(linkUrl);

  return (
    <Flow.Part part='actionBlocked'>
      <Card.Root>
        <Card.Content>
          <Header.Root>
            {/* An application-supplied title is plain text, so it is passed as a
                child rather than through localizationKey. Without one we fall
                back to our own wording. */}
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
                // rel is set because the destination is chosen by the
                // application's owner and is not necessarily under their
                // control once followed.
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
                {/* Selectable and monospaced: this is the one thing on the
                    screen the user is expected to copy or retype. */}
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
