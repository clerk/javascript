import { usePortalRoot } from '@clerk/shared/react';
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingNode,
  FloatingPortal,
  offset,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFocus,
  useHover,
  useInteractions,
  useMergeRefs,
  useRole,
  useTransitionStyles,
} from '@floating-ui/react';
import * as React from 'react';

import { Box, Button, Col, Icon, type LocalizationKey, Text, useAppearance } from '../customizables';
import { usePrefersReducedMotion } from '../hooks';
import { useDevMode } from '../hooks/useDevMode';
import { InformationCircle } from '../icons';
import { useFormField } from '../primitives/hooks/useFormField';
import { withFloatingTree } from './contexts';

type DevHintAction = {
  label: string | LocalizationKey;
  /** Populates the field with a suggested test identifier. */
  onInsert: () => void;
};

export type FieldDevHintValue = {
  text: string | LocalizationKey;
  action?: DevHintAction;
};

type FieldDevHintProps = {
  hint: FieldDevHintValue;
};

/**
 * Dev-only info affordance rendered next to a field label. On hover/focus of the ⓘ
 * icon it opens a popover that nudges developers toward test credentials and can
 * insert a suggested test identifier into the field. Renders nothing outside dev mode.
 */
const FieldDevHintBase = (props: FieldDevHintProps) => {
  const { showDevModeNotice } = useDevMode();
  const { value } = useFormField();
  const { text, action } = props.hint;

  const [open, setOpen] = React.useState(false);

  const prefersReducedMotion = usePrefersReducedMotion();
  const { animations } = useAppearance().parsedOptions;
  const isMotionSafe = !prefersReducedMotion && animations === true;

  const nodeId = useFloatingNodeId();
  const { refs, floatingStyles, context } = useFloating({
    nodeId,
    open,
    onOpenChange: setOpen,
    placement: 'top',
    whileElementsMounted: autoUpdate,
    middleware: [offset(6), flip({ padding: 6 }), shift({ padding: 6 })],
  });

  // safePolygon keeps the popover open while the cursor travels from the icon into
  // the content, so the insert button stays clickable on hover.
  const hover = useHover(context, { handleClose: safePolygon() });
  const focus = useFocus(context);
  // Tap-to-toggle for touch, where there is no hover and iOS does not reliably
  // focus a button on tap (so useHover/useFocus alone would never open it).
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'dialog' });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, click, dismiss, role]);

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: isMotionSafe ? 180 : 0,
    initial: { opacity: 0, transform: 'translateY(4px)' },
    open: { opacity: 1, transform: 'translateY(0)' },
    close: { opacity: 0, transform: 'translateY(4px)' },
  });

  const triggerRef = useMergeRefs([refs.setReference]);
  const floatingRef = useMergeRefs([refs.setFloating]);
  const portalRoot = usePortalRoot();
  const effectiveRoot = portalRoot?.() ?? undefined;

  // Only nudge on an empty field; once the developer has typed (or inserted) a value, hide it.
  if (!showDevModeNotice || value) {
    return null;
  }

  return (
    <>
      <Button
        ref={triggerRef}
        variant='unstyled'
        aria-label='Development testing tip'
        data-dev-hint-trigger=''
        data-open={open}
        {...getReferenceProps()}
        sx={t => ({
          // Absolutely positioned at its static location (trailing the label text) so
          // it doesn't force the label to wrap; the label reserves room via its
          // padding-inline-end (see Form.tsx). height: 1lh centers it on the text line.
          position: 'absolute',
          marginInlineStart: '0.25em',
          height: '1lh',
          lineHeight: '1lh',
          display: 'inline-flex',
          alignItems: 'center',
          padding: 0,
          borderRadius: t.radii.$sm,
          color: t.colors.$warning500,
          // Hidden until the field is hovered/focused (revealed by the formField
          // container in Form.tsx) or the popover is open.
          opacity: 0,
          transitionProperty: 'opacity',
          transitionDuration: t.transitionDuration.$fast,
          '&[data-open="true"]': { opacity: 1 },
        })}
      >
        <Icon
          icon={InformationCircle}
          aria-hidden
          sx={t => ({ width: t.sizes.$4, height: t.sizes.$4 })}
        />
      </Button>

      {isMounted && (
        <FloatingNode id={nodeId}>
          <FloatingPortal root={effectiveRoot}>
            {/* modal=false + initialFocus=-1: hovering with a mouse does not steal
                focus, but keyboard users can Tab from the trigger into the content. */}
            <FloatingFocusManager
              context={context}
              modal={false}
              initialFocus={-1}
            >
              <Box
                ref={floatingRef}
                style={floatingStyles}
                {...getFloatingProps()}
                sx={t => ({ zIndex: t.zIndices.$tooltip })}
              >
                <Col
                  style={transitionStyles}
                  gap={2}
                  sx={t => ({
                    maxWidth: t.sizes.$60,
                    padding: t.space.$3,
                    borderRadius: t.radii.$lg,
                    backgroundColor: t.colors.$colorBackground,
                    borderWidth: t.borderWidths.$normal,
                    borderStyle: t.borderStyles.$solid,
                    borderColor: t.colors.$borderAlpha100,
                    boxShadow: t.shadows.$menuShadow,
                  })}
                >
                  <Text
                    localizationKey={text}
                    variant='body'
                    colorScheme='secondary'
                  />
                  {action && (
                    <Button
                      variant='outline'
                      localizationKey={action.label}
                      onClick={() => {
                        action.onInsert();
                        setOpen(false);
                      }}
                    />
                  )}
                </Col>
              </Box>
            </FloatingFocusManager>
          </FloatingPortal>
        </FloatingNode>
      )}
    </>
  );
};

export const FieldDevHint = withFloatingTree(FieldDevHintBase);
