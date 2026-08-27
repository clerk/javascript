import { ERROR_CODES } from '@clerk/shared/internal/clerk-js/constants';
import type { ClerkAPIError } from '@clerk/shared/types';
import React from 'react';

import { Col, descriptors, Flex, Flow, Icon, localizationKeys, Text } from '../customizables';
import { Card } from '../elements/Card';
import { Header } from '../elements/Header';
import { ExclamationTriangle } from '../icons';

/**
 * The details an application can attach to a blocked request. Every field is
 * optional; when none are present the card falls back to its own wording and
 * shows only the reference.
 *
 * The text fields are plain text and are rendered as text nodes. They are
 * written by the application's owner, so they are treated as content, never as
 * markup.
 */
export type ActionBlockedDetails = {
  traceId?: string;
  title?: string;
  description?: string;
  linkUrl?: string;
  linkText?: string;
};

/**
 * Reads the details off an API error, or returns null when the error carries
 * none — which is also what happens against an older backend that does not send
 * them. Callers use the null to fall back to the previous inline error, so a
 * missing field degrades rather than rendering a blank screen.
 */
export const getActionBlockedDetails = (error: ClerkAPIError | undefined): ActionBlockedDetails | null => {
  const meta = error?.meta as ActionBlockedDetails | undefined;
  if (!meta) {
    return null;
  }
  const { traceId, title, description, linkUrl, linkText } = meta;
  if (!traceId && !title && !description && !linkUrl) {
    return null;
  }
  return { traceId, title, description, linkUrl, linkText };
};

/**
 * Only `https` links are rendered.
 *
 * The URL is already checked before it is sent, so this is a second, local
 * check rather than the only one: it is what stands between a value that
 * reached the browser anyway and a `javascript:` or `data:` URI becoming an
 * `href`. A link that fails is dropped and the rest of the card still renders.
 */
export const safeHref = (url: string | undefined): string | null => {
  if (!url) {
    return null;
  }
  try {
    return new URL(url).protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
};

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

/**
 * Intercepts a blocked-request error on its way to the card's inline error slot
 * and turns it into the terminal screen instead.
 *
 * Every error in these flows funnels through `card.setError`, so wrapping that
 * one function catches both the form-submit path and the OAuth-callback path
 * without either having to know about this.
 *
 * Anything that is not a blocked request — or that is, but carries no details,
 * which is what an older backend sends — passes straight through and still
 * renders as the inline error it always did.
 */
export const useActionBlocked = (setError: (e: any) => void) => {
  const [blockedDetails, setBlockedDetails] = React.useState<ActionBlockedDetails | null>(null);

  const setErrorOrBlock = React.useCallback(
    (e: any) => {
      if (e && typeof e === 'object' && e.code === ERROR_CODES.FRAUD_ACTION_BLOCKED) {
        const details = getActionBlockedDetails(e as ClerkAPIError);
        if (details) {
          setBlockedDetails(details);
          return;
        }
      }
      setError(e);
    },
    [setError],
  );

  return { blockedDetails, setErrorOrBlock };
};
