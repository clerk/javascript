import { cva } from '../cva';
import { Dialog as Primitive } from '../primitives/dialog';
import { styled } from '../styled';

const backdropStyles = cva({
  base: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'color-mix(in oklab, #000, transparent 50%)',
    transition: 'opacity 150ms',
    '&[data-cl-starting-style], &[data-cl-ending-style]': {
      opacity: 0,
    },
  },
  variants: {},
});

const viewportStyles = cva(theme => ({
  base: {
    display: 'grid',
    placeItems: 'center',
    width: '100%',
    minHeight: '100%',
    padding: theme.spacing(4),
  },
  variants: {},
}));

const popupStyles = cva(theme => ({
  base: {
    backgroundColor: theme.color.primaryForeground,
    color: theme.color.primary,
    borderRadius: theme.rounded.lg,
    padding: theme.spacing(6),
    minWidth: '20rem',
    maxWidth: '32rem',
    width: '100%',
    boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    transition: 'transform 150ms ease-out, opacity 150ms ease-out',
    '&[data-cl-starting-style], &[data-cl-ending-style]': {
      opacity: 0,
      transform: 'scale(0.98)',
    },
  },
  variants: {},
}));

const titleStyles = cva(theme => ({
  base: {
    ...theme.text('lg'),
    fontWeight: 600,
    margin: 0,
  },
  variants: {},
}));

const descriptionStyles = cva(theme => ({
  base: {
    ...theme.text('sm'),
    margin: 0,
    opacity: 0.8,
  },
  variants: {},
}));

const closeStyles = cva(theme => ({
  base: {
    alignSelf: 'flex-end',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingInline: theme.spacing(3),
    paddingBlock: theme.spacing(1),
    borderRadius: theme.rounded.md,
    backgroundColor: 'transparent',
    color: theme.color.primary,
    border: `1px solid ${theme.alpha('primary', 20)}`,
    ...theme.text('sm'),
    cursor: 'pointer',
  },
  variants: {},
}));

const Backdrop = styled(Primitive.Backdrop, backdropStyles);
const Viewport = styled(Primitive.Viewport, viewportStyles);
const Popup = styled(Primitive.Popup, popupStyles);
const Title = styled(Primitive.Title, titleStyles);
const Description = styled(Primitive.Description, descriptionStyles);
const Close = styled(Primitive.Close, closeStyles);

/** Styled mosaic Dialog components built on headless Dialog primitives. */
export const Dialog: {
  Root: typeof Primitive.Root;
  Trigger: typeof Primitive.Trigger;
  Portal: typeof Primitive.Portal;
  Backdrop: typeof Backdrop;
  Viewport: typeof Viewport;
  Popup: typeof Popup;
  Title: typeof Title;
  Description: typeof Description;
  Close: typeof Close;
} = {
  Root: Primitive.Root,
  Trigger: Primitive.Trigger,
  Portal: Primitive.Portal,
  Backdrop,
  Viewport,
  Popup,
  Title,
  Description,
  Close,
};
