import { useReverification, useUser } from '@clerk/shared/react';
import type { EmailAddressResource } from '@clerk/shared/types';
import { type AnimationEvent, Fragment, useState } from 'react';

import { Card } from '@/ui/elements/Card';
import { useCardState } from '@/ui/elements/contexts';
import { Modal } from '@/ui/elements/Modal';
import { useUnsafeNavbarContext } from '@/ui/elements/Navbar';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { handleError } from '@/ui/utils/errorHandler';

import { sortIdentificationBasedOnVerification } from '../../components/UserProfile/utils';
import { Badge, Box, Col, Flex, localizationKeys, Text, useAppearance } from '../../customizables';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { usePrefersReducedMotion } from '../../hooks';
import type { PropsOfComponent } from '../../styledSystem';
import { EmailForm } from './EmailForm';
import { RemoveEmailForm } from './RemoveResourceForm';

/**
 * Remove-email confirmation, presented as a modal scoped to the UserProfile card (rather
 * than the previous inline destructive card). Mirrors the RevokeAPIKeyConfirmationModal
 * pattern: the modal is portaled into the profile content container (`contentRef`) and the
 * overlay is positioned `absolute` with a blurred backdrop so it dims only the card — not
 * the whole viewport (UserProfile is itself a modal).
 *
 * Open state is still driven by the section's Action context: the "Remove" menu item calls
 * `open('remove-<id>')`, and dismissing the modal calls `close()`.
 */
const RemoveEmailModal = ({ emailId }: { emailId: string }) => {
  const { active, close } = useActionContext();
  const { contentRef } = useUnsafeNavbarContext();

  if (active !== `remove-${emailId}`) {
    return null;
  }

  return (
    <Modal
      handleClose={close}
      portalRoot={contentRef}
      containerSx={[
        { alignItems: 'center' },
        contentRef
          ? t => ({
              position: 'absolute',
              insetInlineEnd: 0,
              bottom: 0,
              backgroundColor: 'inherit',
              backdropFilter: `blur(${t.sizes.$2})`,
              display: 'flex',
              justifyContent: 'center',
              minHeight: '100%',
              height: '100%',
              width: '100%',
              borderRadius: t.radii.$lg,
            })
          : {},
      ]}
    >
      <Card.Root role='alertdialog'>
        <Card.Content
          sx={t => ({
            textAlign: 'start',
            padding: `${t.sizes.$4} ${t.sizes.$5} ${t.sizes.$4} ${t.sizes.$6}`,
          })}
        >
          <RemoveEmailForm
            emailId={emailId}
            onSuccess={close}
            onReset={close}
          />
        </Card.Content>
      </Card.Root>
    </Modal>
  );
};

type EmailScreenProps = { emailId?: string };
const EmailScreen = (props: EmailScreenProps) => {
  const { close } = useActionContext();
  return (
    <EmailForm
      onSuccess={close}
      onReset={close}
      {...props}
    />
  );
};

/**
 * The "add email" affordance. The trigger button and the inline form are stacked in a
 * single grid cell (so they overlap and can crossfade) inside a container whose height is
 * reserved to the inline row — this keeps the surrounding list from shifting on open/close.
 *
 * Open/close is a small state machine so both directions crossfade symmetrically:
 *  - opening: button fades out (CSS transition) while the form fades in (keyframe)
 *  - closing: button fades back in while the form plays the reverse keyframe, and we defer
 *    the actual unmount (`close()`) until the exit animation reports `onAnimationEnd`.
 */
const ADD_EMAIL_TRANSITION_DURATION = '300ms';
const ADD_EMAIL_INITIAL_STYLE = {
  opacity: 0,
  filter: 'blur(0px)',
  transform: 'scale(1)',
} as const;
const ADD_EMAIL_ANIMATE_STYLE = {
  opacity: 1,
  filter: 'blur(0rem)',
  transform: 'scale(1)',
} as const;

const ADD_EMAIL_KEYFRAMES = {
  '@keyframes clerkEmailInlineCrossFadeIn': {
    '0%': ADD_EMAIL_INITIAL_STYLE,
    '100%': ADD_EMAIL_ANIMATE_STYLE,
  },
  '@keyframes clerkEmailInlineCrossFadeOut': {
    '0%': ADD_EMAIL_ANIMATE_STYLE,
    '100%': ADD_EMAIL_INITIAL_STYLE,
  },
} as const;

const AddEmailControl = () => {
  const { active, open, close } = useActionContext();
  const prefersReducedMotion = usePrefersReducedMotion();
  const { animations: layoutAnimations } = useAppearance().parsedOptions;
  const isMotionSafe = !prefersReducedMotion && layoutAnimations !== false;

  const isOpen = active === 'add';
  const [isClosing, setIsClosing] = useState(false);

  const buttonHidden = isOpen && !isClosing;
  const showForm = isOpen || isClosing;

  const beginClose = () => {
    if (!isMotionSafe) {
      close();
      return;
    }
    setIsClosing(true);
  };
  const finishClose = () => {
    setIsClosing(false);
    close();
  };

  return (
    <Box
      sx={t => ({
        display: 'grid',
        gridTemplateColumns: '100%',
        // Reserve the inline row's height so opening/closing never reflows the list.
        minHeight: t.sizes.$10,
        alignItems: 'center',
        '& > *': { gridArea: '1 / 1' },
      })}
    >
      <ProfileSection.ArrowButton
        id='emailAddresses'
        localizationKey={localizationKeys('userProfile.start.emailAddressesSection.primaryButton')}
        onClick={() => open('add')}
        sx={t => ({
          transitionProperty: 'opacity, filter, transform',
          transitionDuration: ADD_EMAIL_TRANSITION_DURATION,
          transitionTimingFunction: t.transitionTiming.$bezier,
          ...(buttonHidden ? ADD_EMAIL_INITIAL_STYLE : ADD_EMAIL_ANIMATE_STYLE),
          pointerEvents: buttonHidden ? 'none' : 'auto',
          ...(!isMotionSafe && { transition: 'none' }),
        })}
      />
      {showForm && (
        <Col
          onAnimationEnd={(e: AnimationEvent) => {
            if (isClosing && e.animationName === 'clerkEmailInlineCrossFadeOut') {
              finishClose();
            }
          }}
          sx={t => ({
            justifyContent: 'center',
            animationName: isClosing ? 'clerkEmailInlineCrossFadeOut' : 'clerkEmailInlineCrossFadeIn',
            animationDuration: ADD_EMAIL_TRANSITION_DURATION,
            animationTimingFunction: t.transitionTiming.$bezier,
            animationFillMode: 'both',
            ...ADD_EMAIL_KEYFRAMES,
            ...(!isMotionSafe && { animation: 'none' }),
          })}
        >
          <EmailForm
            variant='inline'
            onSuccess={close}
            onReset={beginClose}
          />
        </Col>
      )}
    </Box>
  );
};

export const EmailsSection = ({
  shouldAllowCreation = true,
  shouldAllowDeletion = true,
}: {
  shouldAllowCreation?: boolean;
  shouldAllowDeletion?: boolean;
}) => {
  const { user } = useUser();

  return (
    <ProfileSection.Root
      title={localizationKeys('userProfile.start.emailAddressesSection.title')}
      centered={false}
      id='emailAddresses'
    >
      <Action.Root>
        <ProfileSection.ItemList id='emailAddresses'>
          {sortIdentificationBasedOnVerification(user?.emailAddresses, user?.primaryEmailAddressId).map(email => {
            const emailId = email.id;
            return (
              <Fragment key={email.emailAddress}>
                <ProfileSection.Item
                  id='emailAddresses'
                  sx={{ paddingInlineStart: 8 }}
                >
                  <Flex sx={t => ({ overflow: 'hidden', gap: t.space.$1 })}>
                    <Text
                      sx={t => ({ color: t.colors.$colorForeground })}
                      truncate
                    >
                      {email.emailAddress}
                    </Text>
                    {user?.primaryEmailAddressId === emailId && (
                      <Badge localizationKey={localizationKeys('badge__primary')} />
                    )}
                    {email.verification.status !== 'verified' && (
                      <Badge localizationKey={localizationKeys('badge__unverified')} />
                    )}
                  </Flex>
                  <EmailMenu
                    email={email}
                    shouldAllowDeletion={shouldAllowDeletion}
                  />
                </ProfileSection.Item>

                <RemoveEmailModal emailId={emailId} />

                <Action.Open value={`verify-${emailId}`}>
                  <Action.Card>
                    <EmailScreen emailId={emailId} />
                  </Action.Card>
                </Action.Open>
              </Fragment>
            );
          })}
          {shouldAllowCreation && <AddEmailControl />}
        </ProfileSection.ItemList>
      </Action.Root>
    </ProfileSection.Root>
  );
};

const EmailMenu = ({
  email,
  shouldAllowDeletion = true,
}: {
  email: EmailAddressResource;
  shouldAllowDeletion?: boolean;
}) => {
  const card = useCardState();
  const { user } = useUser();
  const { open } = useActionContext();
  const emailId = email.id;
  const isPrimary = user?.primaryEmailAddressId === emailId;
  const isVerified = email.verification.status === 'verified';
  const setPrimary = useReverification(() => {
    return user?.update({ primaryEmailAddressId: emailId });
  });

  const actions = (
    [
      isPrimary && !isVerified
        ? {
            label: localizationKeys('userProfile.start.emailAddressesSection.detailsAction__primary'),
            onClick: () => open(`verify-${emailId}`),
          }
        : null,
      !isPrimary && isVerified
        ? {
            label: localizationKeys('userProfile.start.emailAddressesSection.detailsAction__nonPrimary'),
            onClick: () => {
              setPrimary().catch(e => handleError(e, [], card.setError));
            },
          }
        : null,
      !isPrimary && !isVerified
        ? {
            label: localizationKeys('userProfile.start.emailAddressesSection.detailsAction__unverified'),
            onClick: () => open(`verify-${emailId}`),
          }
        : null,
      shouldAllowDeletion
        ? {
            label: localizationKeys('userProfile.start.emailAddressesSection.destructiveAction'),
            isDestructive: true,
            onClick: () => open(`remove-${emailId}`),
          }
        : null,
    ] satisfies (PropsOfComponent<typeof ThreeDotsMenu>['actions'][0] | null)[]
  ).filter(a => a !== null) as PropsOfComponent<typeof ThreeDotsMenu>['actions'];

  if (actions.length === 0) {
    return null;
  }

  return <ThreeDotsMenu actions={actions} />;
};
