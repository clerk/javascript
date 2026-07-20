import { defineSlotRecipe } from '../slot-recipe';

// Prototype accent (Clerk brand purple) for the plan badge and the Upgrade link. The neutral
// Mosaic palette has no accent token yet; swap these for a token once one lands.
const ACCENT = '#6c47ff';
const ACCENT_SOFT = 'color-mix(in oklab, #6c47ff 14%, transparent)';

export const accountButtonRecipe = defineSlotRecipe(theme => ({
  slots: {
    trigger: { slot: 'account-button-trigger' },
    triggerName: { slot: 'account-button-trigger-name' },
    triggerBadge: { slot: 'account-button-trigger-badge' },
    popup: { slot: 'account-button-popup' },
    header: { slot: 'account-button-header' },
    headerName: { slot: 'account-button-header-name' },
    headerActions: { slot: 'account-button-header-actions' },
    action: { slot: 'account-button-action' },
    group: { slot: 'account-button-group' },
    groupLabel: { slot: 'account-button-group-label' },
    item: { slot: 'account-button-item' },
    select: { slot: 'account-button-select' },
    name: { slot: 'account-button-name' },
    secondary: { slot: 'account-button-secondary' },
    upgrade: { slot: 'account-button-upgrade' },
    suggestedBadge: { slot: 'account-button-suggested-badge' },
    inlineButton: { slot: 'account-button-inline-button' },
    hoverAction: { slot: 'account-button-hover-action' },
    add: { slot: 'account-button-add' },
    addIcon: { slot: 'account-button-add-icon' },
    footer: { slot: 'account-button-footer' },
    signOutAll: { slot: 'account-button-sign-out-all' },
    branding: { slot: 'account-button-branding' },
    avatar: { slot: 'account-button-avatar' },
  },
  base: {
    trigger: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(2),
      width: '100%',
      minWidth: 0,
      padding: `${theme.spacing(1.5)} ${theme.spacing(2)}`,
      borderRadius: theme.rounded.md,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'start',
      color: theme.color.cardForeground,
      ...theme.text('sm'),
      _hover: { backgroundColor: theme.color.muted },
    },
    triggerName: {
      fontWeight: theme.font.medium,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    triggerBadge: {
      flexShrink: 0,
      ...theme.text('xs'),
      fontWeight: theme.font.medium,
      padding: `${theme.spacing(0.5)} ${theme.spacing(1.5)}`,
      borderRadius: theme.rounded.full,
      backgroundColor: ACCENT_SOFT,
      color: ACCENT,
      whiteSpace: 'nowrap',
    },
    popup: {
      width: '20rem',
      maxWidth: 'calc(100vw - 2rem)',
      backgroundColor: theme.color.card,
      color: theme.color.cardForeground,
      border: `1px solid ${theme.color.border}`,
      borderRadius: theme.rounded.lg,
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
      overflow: 'hidden',
      ...theme.text('sm'),
    },
    header: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(3),
      padding: theme.spacing(4),
    },
    headerName: {
      ...theme.text('sm'),
      fontWeight: theme.font.semibold,
      color: theme.color.cardForeground,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    headerActions: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: theme.spacing(2),
    },
    action: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing(2),
      padding: theme.spacing(2),
      borderRadius: theme.rounded.md,
      border: `1px solid ${theme.color.border}`,
      background: theme.color.card,
      color: theme.color.cardForeground,
      ...theme.text('sm'),
      fontWeight: theme.font.medium,
      cursor: 'pointer',
      _hover: { backgroundColor: theme.color.muted },
    },
    group: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(0.5),
      padding: theme.spacing(1.5),
      borderTop: `1px solid ${theme.color.border}`,
    },
    groupLabel: {
      padding: `${theme.spacing(1.5)} ${theme.spacing(2)} ${theme.spacing(1)}`,
      ...theme.text('xs'),
      fontWeight: theme.font.medium,
      color: theme.color.mutedForeground,
    },
    item: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(2),
      padding: theme.spacing(2),
      borderRadius: theme.rounded.md,
      position: 'relative',
      _hover: { backgroundColor: theme.color.muted },
      // Hover-reveal sign out: hidden but focusable (kept in tab order); revealed on row hover
      // or keyboard focus-within — never a bare `opacity: 0` that would strand the focused button.
      '& [data-cl-slot="account-button-hover-action"]': { opacity: 0, pointerEvents: 'none' },
      '&:hover [data-cl-slot="account-button-hover-action"], &:focus-within [data-cl-slot="account-button-hover-action"]':
        { opacity: 1, pointerEvents: 'auto' },
    },
    select: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(3),
      flex: 1,
      minWidth: 0,
      background: 'none',
      border: 'none',
      padding: 0,
      margin: 0,
      font: 'inherit',
      color: 'inherit',
      textAlign: 'start',
      cursor: 'pointer',
    },
    name: {
      ...theme.text('sm'),
      fontWeight: theme.font.medium,
      color: theme.color.cardForeground,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    secondary: {
      ...theme.text('xs'),
      color: theme.color.mutedForeground,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    upgrade: {
      background: 'none',
      border: 'none',
      padding: 0,
      font: 'inherit',
      cursor: 'pointer',
      color: ACCENT,
      fontWeight: theme.font.medium,
    },
    suggestedBadge: {
      flexShrink: 0,
      ...theme.text('xs'),
      color: theme.color.mutedForeground,
      padding: `${theme.spacing(0.5)} ${theme.spacing(1.5)}`,
      borderRadius: theme.rounded.sm,
      backgroundColor: theme.color.muted,
      whiteSpace: 'nowrap',
    },
    inlineButton: {
      flexShrink: 0,
      ...theme.text('xs'),
      fontWeight: theme.font.medium,
      padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
      borderRadius: theme.rounded.md,
      border: `1px solid ${theme.color.border}`,
      background: theme.color.card,
      color: theme.color.cardForeground,
      cursor: 'pointer',
      _hover: { backgroundColor: theme.color.muted },
    },
    hoverAction: {
      flexShrink: 0,
      ...theme.text('xs'),
      fontWeight: theme.font.medium,
      padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
      borderRadius: theme.rounded.md,
      border: `1px solid ${theme.color.border}`,
      background: theme.color.card,
      color: theme.color.cardForeground,
      cursor: 'pointer',
      transition: 'opacity 120ms ease',
      _hover: { backgroundColor: theme.color.muted },
    },
    add: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(3),
      width: '100%',
      padding: theme.spacing(2),
      borderRadius: theme.rounded.md,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'start',
      ...theme.text('sm'),
      color: theme.color.mutedForeground,
      _hover: { backgroundColor: theme.color.muted },
    },
    addIcon: {
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0,
      width: theme.spacing(9),
      height: theme.spacing(9),
      borderRadius: theme.rounded.full,
      backgroundColor: theme.color.muted,
      color: theme.color.mutedForeground,
    },
    footer: {
      display: 'flex',
      flexDirection: 'column',
      borderTop: `1px solid ${theme.color.border}`,
      padding: theme.spacing(1.5),
    },
    signOutAll: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(3),
      width: '100%',
      padding: theme.spacing(2),
      borderRadius: theme.rounded.md,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'start',
      ...theme.text('sm'),
      color: theme.color.mutedForeground,
      _hover: { backgroundColor: theme.color.muted },
    },
    branding: {
      marginTop: theme.spacing(1),
      padding: theme.spacing(2),
      borderTop: `1px solid ${theme.color.border}`,
      textAlign: 'center',
      ...theme.text('xs'),
      color: theme.color.mutedForeground,
    },
    avatar: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      overflow: 'hidden',
      fontWeight: theme.font.medium,
      textTransform: 'uppercase',
      lineHeight: 1,
      '& > img': { width: '100%', height: '100%', objectFit: 'cover' },
    },
  },
  variants: {
    shape: {
      square: {
        avatar: {
          borderRadius: theme.rounded.md,
          backgroundColor: theme.color.primary,
          color: theme.color.primaryForeground,
        },
      },
      circle: {
        avatar: {
          borderRadius: theme.rounded.full,
          backgroundColor: theme.color.muted,
          color: theme.color.mutedForeground,
        },
      },
    },
    size: {
      sm: { avatar: { width: theme.spacing(5), height: theme.spacing(5), ...theme.text('xs') } },
      md: { avatar: { width: theme.spacing(9), height: theme.spacing(9), ...theme.text('sm') } },
    },
  },
  defaultVariants: { shape: 'circle', size: 'md' },
}));

declare module '../registry' {
  interface MosaicSlotRegistry {
    'account-button-trigger': true;
    'account-button-trigger-name': true;
    'account-button-trigger-badge': true;
    'account-button-popup': true;
    'account-button-header': true;
    'account-button-header-name': true;
    'account-button-header-actions': true;
    'account-button-action': true;
    'account-button-group': true;
    'account-button-group-label': true;
    'account-button-item': true;
    'account-button-select': true;
    'account-button-name': true;
    'account-button-secondary': true;
    'account-button-upgrade': true;
    'account-button-suggested-badge': true;
    'account-button-inline-button': true;
    'account-button-hover-action': true;
    'account-button-add': true;
    'account-button-add-icon': true;
    'account-button-footer': true;
    'account-button-sign-out-all': true;
    'account-button-branding': true;
    'account-button-avatar': true;
  }
}
