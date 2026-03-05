/**
 * Demo appearance configs that style Clerk's SignIn on top of the raw theme.
 * These simulate what an LLM would generate for a user who says
 * "make my sign-in match my brand" with raw mode as the base.
 *
 * FRICTION LOG: See comments inline and summary at bottom.
 */

// Previous light theme (kept for comparison)
export const modernSaas = {
  elements: {
    rootBox: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    card: {
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '16px',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
      padding: '40px 32px',
    },
    headerTitle: {
      fontSize: '24px',
      fontWeight: 700,
      color: '#111827',
      letterSpacing: '-0.025em',
    },
    headerSubtitle: {
      fontSize: '14px',
      color: '#6b7280',
      lineHeight: 1.5,
    },
    socialButtonsIconButton: {
      backgroundColor: '#ffffff',
      border: '1px solid #d1d5db',
      borderRadius: '10px',
      transition: 'all 0.15s ease',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: '#f9fafb',
        borderColor: '#9ca3af',
      },
    },
    lastAuthenticationStrategyBadge: {
      backgroundColor: '#eef2ff',
      color: '#4f46e5',
      fontSize: '11px',
      fontWeight: 600,
      borderRadius: '4px',
    },
    dividerLine: {
      backgroundColor: '#e5e7eb',
    },
    dividerText: {
      color: '#9ca3af',
      fontSize: '13px',
      fontWeight: 500,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    },
    formFieldLabel: {
      fontSize: '14px',
      fontWeight: 500,
      color: '#374151',
    },
    formFieldInput: {
      backgroundColor: '#ffffff',
      border: '1px solid #d1d5db',
      borderRadius: '10px',
      fontSize: '14px',
      color: '#111827',
      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      '&:focus': {
        borderColor: '#6366f1',
        boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.12)',
        outline: 'none',
      },
      '&::placeholder': {
        color: '#9ca3af',
      },
    },
    formFieldAction: {
      color: '#6366f1',
      fontSize: '13px',
      fontWeight: 500,
      '&:hover': { color: '#4f46e5' },
    },
    formFieldErrorText: {
      color: '#ef4444',
      fontSize: '13px',
    },
    formButtonPrimary: {
      backgroundColor: '#6366f1',
      color: '#ffffff',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: 600,
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.15s ease',
      '&:hover': { backgroundColor: '#4f46e5' },
      '&:active': { backgroundColor: '#4338ca' },
    },
    spinner: { color: '#ffffff' },
    footerActionText: { color: '#6b7280', fontSize: '14px' },
    footerActionLink: {
      color: '#6366f1',
      fontWeight: 500,
      fontSize: '14px',
      '&:hover': { color: '#4f46e5' },
    },
    alternativeMethodsBlockButton: {
      color: '#6366f1',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      '&:hover': { color: '#4f46e5' },
    },
  },
};

// Dark premium theme - designed by Codex (GPT-5.2) + Claude coordination
// Inspired by: dark SaaS sign-in with purple/violet accent
export const darkPremium = {
  options: {
    socialButtonsVariant: 'blockButton' as const,
  },
  elements: {
    rootBox: {
      fontFamily: '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
      color: '#f8fafc',
      backgroundColor: 'transparent',
      lineHeight: 1.4,
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    },
    card: {
      backgroundColor: '#1a1a2e',
      borderRadius: '12px',
      border: '1px solid #2a2a44',
      boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
      padding: '32px',
      color: '#f8fafc',
    },
    headerTitle: {
      fontSize: '24px',
      fontWeight: 700,
      letterSpacing: '-0.01em',
      color: '#f8fafc',
    },
    headerSubtitle: {
      fontSize: '14px',
      color: '#cbd5f5',
    },

    // Social buttons layout - re-add grid since raw mode strips grid-template
    socialButtons: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '8px',
    },

    // Social buttons - style both icon and block variants
    socialButtonsIconButton: {
      backgroundColor: '#151528',
      border: '1px solid #2a2a44',
      color: '#e2e8f0',
      borderRadius: '8px',
      transition: 'background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: '#1b1b32',
        borderColor: '#3a3a5c',
        boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
      },
      '&:active': {
        transform: 'translateY(1px)',
      },
      '&:focus-visible': {
        outline: 'none',
        borderColor: '#8b5cf6',
        boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.35)',
      },
    },
    socialButtonsBlockButton: {
      backgroundColor: '#151528',
      border: '1px solid #2a2a44',
      color: '#e2e8f0',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 600,
      transition: 'background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: '#1b1b32',
        borderColor: '#3a3a5c',
        boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
      },
      '&:active': {
        transform: 'translateY(1px)',
      },
      '&:focus-visible': {
        outline: 'none',
        borderColor: '#8b5cf6',
        boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.35)',
      },
    },
    socialButtonsProviderIcon: {
      opacity: 0.95,
      filter: 'brightness(1.05)',
    },

    // Divider
    dividerLine: {
      backgroundColor: '#2a2a44',
    },
    dividerText: {
      fontSize: '12px',
      color: '#94a3b8',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
    },

    // Form fields
    formFieldLabel: {
      color: '#e2e8f0',
      fontSize: '12px',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    formFieldInput: {
      backgroundColor: '#202038',
      border: '1px solid #2e2e4d',
      borderRadius: '8px',
      color: '#f8fafc',
      fontSize: '14px',
      outline: 'none',
      transition: 'background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease',
      caretColor: '#a78bfa',
      '&::placeholder': {
        color: '#94a3b8',
      },
      '&:hover': {
        borderColor: '#3a3a5c',
      },
      '&:focus': {
        borderColor: '#8b5cf6',
        boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.35)',
      },
      '&:-webkit-autofill': {
        WebkitTextFillColor: '#f8fafc',
        boxShadow: '0 0 0 1000px #202038 inset',
        caretColor: '#a78bfa',
      },
    },
    formFieldAction: {
      color: '#8b5cf6',
      fontSize: '12px',
      fontWeight: 600,
      transition: 'color 150ms ease',
      cursor: 'pointer',
      '&:hover': {
        color: '#a78bfa',
        textDecoration: 'underline',
      },
    },
    formFieldErrorText: {
      color: '#fca5a5',
      fontSize: '12px',
    },

    // Primary button
    formButtonPrimary: {
      backgroundColor: '#7c3aed',
      color: '#ffffff',
      border: '1px solid #7c3aed',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 700,
      letterSpacing: '0.02em',
      cursor: 'pointer',
      boxShadow: '0 10px 20px rgba(124, 58, 237, 0.25)',
      transition: 'background-color 150ms ease, box-shadow 150ms ease, transform 150ms ease, border-color 150ms ease',
      '&:hover': {
        backgroundColor: '#8b5cf6',
        borderColor: '#8b5cf6',
        boxShadow: '0 12px 24px rgba(139, 92, 246, 0.35)',
        transform: 'translateY(-1px)',
      },
      '&:active': {
        transform: 'translateY(0)',
      },
      '&:focus-visible': {
        outline: 'none',
        boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.45)',
      },
    },

    // Footer
    footerActionText: {
      color: '#cbd5f5',
      fontSize: '13px',
    },
    footerActionLink: {
      color: '#8b5cf6',
      fontWeight: 700,
      transition: 'color 150ms ease',
      '&:hover': {
        color: '#a78bfa',
        textDecoration: 'underline',
      },
    },

    // Badge
    lastAuthenticationStrategyBadge: {
      backgroundColor: '#23233d',
      color: '#c7d2fe',
      border: '1px solid #2f2f52',
      borderRadius: '999px',
      fontSize: '11px',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.06em',
    },

    // Identity preview (second step)
    identityPreview: {
      backgroundColor: '#202038',
      border: '1px solid #2e2e4d',
      borderRadius: '8px',
    },
    identityPreviewText: {
      color: '#e2e8f0',
      fontSize: '13px',
      fontWeight: 600,
    },
    identityPreviewEditButton: {
      color: '#8b5cf6',
      cursor: 'pointer',
      transition: 'color 150ms ease, background-color 150ms ease',
      '&:hover': {
        color: '#a78bfa',
        backgroundColor: 'rgba(139, 92, 246, 0.12)',
      },
    },

    // OTP code input
    otpCodeFieldInput: {
      backgroundColor: '#202038',
      border: '1px solid #2e2e4d',
      borderRadius: '8px',
      color: '#f8fafc',
      fontSize: '18px',
      fontWeight: 700,
      outline: 'none',
      transition: 'border-color 150ms ease, box-shadow 150ms ease',
      '&:focus': {
        borderColor: '#8b5cf6',
        boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.35)',
      },
    },

    // Alerts
    alert: {
      backgroundColor: '#1b1b32',
      border: '1px solid #2a2a44',
      borderRadius: '8px',
    },
    alertText: {
      color: '#fecaca',
      fontSize: '13px',
    },

    // Passkey / alternative methods
    alternativeMethodsBlockButton: {
      color: '#8b5cf6',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'color 150ms ease',
      '&:hover': {
        color: '#a78bfa',
      },
    },

    // Spinner (global)
    spinner: {
      color: '#8b5cf6',
    },

    // Back link
    headerBackLink: {
      color: '#8b5cf6',
      fontSize: '14px',
      '&:hover': { color: '#a78bfa' },
    },

    // Footer pages
    footerPagesLink: {
      color: '#94a3b8',
      fontSize: '13px',
      '&:hover': { color: '#cbd5e1' },
    },
  },
};

// Same dark premium look, but using the DEFAULT theme as base.
// Variables cascade automatically - dramatically less code needed.
export const darkPremiumDefault = {
  variables: {
    colorBackground: '#1a1a2e',
    colorForeground: '#ffffff',
    colorMutedForeground: '#b8b6d3',
    colorPrimary: '#7c3aed',
    colorPrimaryForeground: '#ffffff',
    colorInput: '#141427',
    colorInputForeground: '#ffffff',
    colorNeutral: '#2d2d4a',
    colorShimmer: '#22223b',
    borderRadius: '0.75rem',
  },
  options: {
    socialButtonsVariant: 'blockButton' as const,
  },
  elements: {
    // Variables can't control layout - needed for 2-column social buttons grid
    socialButtons: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '0.75rem',
    },
    socialButtonsBlockButton: {
      width: '100%',
    },
  },
};

// CRT Terminal theme - raw mode version
// Green phosphor, monospace, scanlines, hard edges, no polish
export const terminalRaw = {
  options: {
    socialButtonsVariant: 'blockButton' as const,
  },
  elements: {
    rootBox: {
      fontFamily: '"IBM Plex Mono", Menlo, Consolas, "Courier New", monospace',
      backgroundColor: '#020b06',
      color: '#19ff7d',
      letterSpacing: '0.04em',
      backgroundImage:
        'repeating-linear-gradient(0deg, rgba(25,255,125,0.08) 0px, rgba(25,255,125,0.08) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 4px)',
    },
    card: {
      backgroundColor: '#04150b',
      border: '2px solid #19ff7d',
      borderRadius: '0',
      boxShadow: 'none',
    },
    headerTitle: {
      fontSize: '18px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.12em',
      textShadow: '0 0 6px #19ff7d',
      color: '#19ff7d',
    },
    headerSubtitle: {
      fontSize: '12px',
      color: '#9be7c1',
    },
    socialButtons: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '8px',
    },
    socialButtonsBlockButton: {
      border: '2px solid #19ff7d',
      borderRadius: '0',
      backgroundColor: 'transparent',
      color: '#19ff7d',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      transition: 'none',
      '&:hover': {
        backgroundColor: '#19ff7d',
        color: '#021008',
      },
    },
    socialButtonsBlockButtonText: {
      fontSize: '12px',
      letterSpacing: '0.08em',
    },
    socialButtonsIconButton: {
      border: '2px solid #19ff7d',
      borderRadius: '0',
      backgroundColor: 'transparent',
      transition: 'none',
      '&:hover': {
        backgroundColor: '#19ff7d',
        color: '#021008',
      },
    },
    socialButtonsProviderIcon: {
      opacity: 0.9,
      filter: 'grayscale(1) contrast(1.2)',
    },
    dividerLine: {
      backgroundColor: '#19ff7d',
      height: '1px',
    },
    dividerText: {
      fontSize: '11px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.12em',
      color: '#9be7c1',
    },
    formFieldLabel: {
      fontSize: '12px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.1em',
      color: '#9be7c1',
    },
    formFieldInput: {
      backgroundColor: '#03160c',
      border: '2px solid #19ff7d',
      borderRadius: '0',
      color: '#19ff7d',
      fontFamily: '"IBM Plex Mono", Menlo, Consolas, "Courier New", monospace',
      '&::placeholder': {
        color: '#4ea87b',
      },
      '&:focus': {
        outline: '2px dashed #19ff7d',
        outlineOffset: '2px',
      },
    },
    formFieldAction: {
      fontSize: '11px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      color: '#19ff7d',
      textDecoration: 'underline',
    },
    formFieldErrorText: {
      fontSize: '11px',
      textTransform: 'uppercase' as const,
      color: '#ff5c5c',
    },
    formButtonPrimary: {
      backgroundColor: '#19ff7d',
      color: '#021008',
      border: '2px solid #19ff7d',
      borderRadius: '0',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.12em',
      fontWeight: 700,
      transition: 'none',
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: '#8fffc0',
        color: '#021008',
      },
    },
    footerActionText: {
      fontSize: '11px',
      color: '#9be7c1',
    },
    footerActionLink: {
      fontSize: '11px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      color: '#19ff7d',
      textDecoration: 'underline',
    },
    lastAuthenticationStrategyBadge: {
      border: '1px solid #19ff7d',
      borderRadius: '0',
      backgroundColor: 'transparent',
      color: '#19ff7d',
      fontSize: '10px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
    },
    alternativeMethodsBlockButton: {
      color: '#19ff7d',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      textDecoration: 'underline',
      transition: 'none',
      '&:hover': {
        color: '#8fffc0',
      },
    },
    spinner: {
      color: '#19ff7d',
      filter: 'drop-shadow(0 0 6px #19ff7d)',
    },
    alert: {
      backgroundColor: '#220808',
      border: '2px solid #ff5c5c',
      borderRadius: '0',
    },
    alertText: {
      color: '#ffb3b3',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.06em',
    },
    otpCodeFieldInput: {
      backgroundColor: '#03160c',
      border: '2px solid #19ff7d',
      borderRadius: '0',
      color: '#19ff7d',
      fontFamily: '"IBM Plex Mono", Menlo, Consolas, "Courier New", monospace',
      fontWeight: 700,
      '&:focus': {
        outline: '2px dashed #19ff7d',
        outlineOffset: '2px',
      },
    },
    identityPreview: {
      border: '1px dashed #19ff7d',
      borderRadius: '0',
      backgroundColor: '#03160c',
    },
    identityPreviewText: {
      fontSize: '12px',
      color: '#9be7c1',
    },
    identityPreviewEditButton: {
      color: '#19ff7d',
      textDecoration: 'underline',
      '&:hover': {
        color: '#8fffc0',
      },
    },
    headerBackLink: {
      color: '#19ff7d',
      textDecoration: 'underline',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      fontSize: '11px',
    },
    footerPagesLink: {
      color: '#9be7c1',
      textDecoration: 'underline',
      fontSize: '11px',
    },
  },
};

// CRT Terminal theme - default theme version (same look, more overrides needed)
// Must UNDO shadows, transitions, border-radius, background-images
export const terminalDefault = {
  variables: {
    colorPrimary: '#19ff7d',
    colorPrimaryForeground: '#021008',
    colorForeground: '#19ff7d',
    colorMutedForeground: '#9be7c1',
    colorBackground: '#04150b',
    colorInput: '#03160c',
    colorInputForeground: '#19ff7d',
    colorNeutral: '#0a3b24',
    colorDanger: '#ff5c5c',
    colorShimmer: '#022b15',
    borderRadius: '0px',
  },
  options: {
    socialButtonsVariant: 'blockButton' as const,
  },
  elements: {
    rootBox: {
      fontFamily: '"IBM Plex Mono", Menlo, Consolas, "Courier New", monospace',
      backgroundColor: '#020b06',
      color: '#19ff7d',
      letterSpacing: '0.04em',
      backgroundImage:
        'repeating-linear-gradient(0deg, rgba(25,255,125,0.08) 0px, rgba(25,255,125,0.08) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 4px)',
    },
    card: {
      backgroundColor: '#04150b',
      border: '2px solid #19ff7d',
      boxShadow: 'none', // UNDO: default theme adds card shadow
      backgroundImage: 'none', // UNDO: default theme adds gradient
      transition: 'none', // UNDO: default theme adds transitions
    },
    headerTitle: {
      fontSize: '18px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.12em',
      textShadow: '0 0 6px #19ff7d',
    },
    headerSubtitle: {
      fontSize: '12px',
      color: '#9be7c1',
    },
    socialButtons: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '8px',
    },
    socialButtonsBlockButton: {
      border: '2px solid #19ff7d',
      backgroundColor: 'transparent',
      color: '#19ff7d',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      boxShadow: 'none', // UNDO
      backgroundImage: 'none', // UNDO
      transition: 'none', // UNDO
      '&:hover': {
        backgroundColor: '#19ff7d',
        color: '#021008',
        boxShadow: 'none', // UNDO: hover shadow
        transform: 'none', // UNDO: hover transform
      },
    },
    socialButtonsBlockButtonText: {
      fontSize: '12px',
      letterSpacing: '0.08em',
    },
    socialButtonsIconButton: {
      border: '2px solid #19ff7d',
      backgroundColor: 'transparent',
      boxShadow: 'none', // UNDO
      backgroundImage: 'none', // UNDO
      transition: 'none', // UNDO
      '&:hover': {
        backgroundColor: '#19ff7d',
        color: '#021008',
        boxShadow: 'none', // UNDO
        transform: 'none', // UNDO
      },
    },
    socialButtonsProviderIcon: {
      opacity: 0.9,
      filter: 'grayscale(1) contrast(1.2)',
    },
    dividerLine: {
      backgroundColor: '#19ff7d',
      height: '1px',
    },
    dividerText: {
      fontSize: '11px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.12em',
      color: '#9be7c1',
    },
    formFieldLabel: {
      fontSize: '12px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.1em',
      color: '#9be7c1',
    },
    formFieldInput: {
      backgroundColor: '#03160c',
      border: '2px solid #19ff7d',
      color: '#19ff7d',
      fontFamily: '"IBM Plex Mono", Menlo, Consolas, "Courier New", monospace',
      boxShadow: 'none', // UNDO
      backgroundImage: 'none', // UNDO
      transition: 'none', // UNDO
      '&::placeholder': {
        color: '#4ea87b',
      },
      '&:focus': {
        outline: '2px dashed #19ff7d',
        outlineOffset: '2px',
        boxShadow: 'none', // UNDO: focus ring shadow
      },
    },
    formFieldAction: {
      fontSize: '11px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      color: '#19ff7d',
      textDecoration: 'underline',
    },
    formFieldErrorText: {
      fontSize: '11px',
      textTransform: 'uppercase' as const,
      color: '#ff5c5c',
    },
    formButtonPrimary: {
      backgroundColor: '#19ff7d',
      color: '#021008',
      border: '2px solid #19ff7d',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.12em',
      fontWeight: 700,
      boxShadow: 'none', // UNDO
      backgroundImage: 'none', // UNDO
      transition: 'none', // UNDO
      '&:hover': {
        backgroundColor: '#8fffc0',
        color: '#021008',
        boxShadow: 'none', // UNDO
        transform: 'none', // UNDO
      },
    },
    footerActionText: {
      fontSize: '11px',
      color: '#9be7c1',
    },
    footerActionLink: {
      fontSize: '11px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      color: '#19ff7d',
      textDecoration: 'underline',
    },
    lastAuthenticationStrategyBadge: {
      border: '1px solid #19ff7d',
      backgroundColor: 'transparent',
      color: '#19ff7d',
      fontSize: '10px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      boxShadow: 'none', // UNDO
    },
    alternativeMethodsBlockButton: {
      color: '#19ff7d',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      textDecoration: 'underline',
      boxShadow: 'none', // UNDO
      backgroundImage: 'none', // UNDO
      transition: 'none', // UNDO
      '&:hover': {
        color: '#8fffc0',
        boxShadow: 'none', // UNDO
        transform: 'none', // UNDO
      },
    },
    spinner: {
      color: '#19ff7d',
      filter: 'drop-shadow(0 0 6px #19ff7d)',
    },
    alert: {
      backgroundColor: '#220808',
      border: '2px solid #ff5c5c',
      boxShadow: 'none', // UNDO
      backgroundImage: 'none', // UNDO
    },
    alertText: {
      color: '#ffb3b3',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.06em',
    },
    otpCodeFieldInput: {
      backgroundColor: '#03160c',
      border: '2px solid #19ff7d',
      color: '#19ff7d',
      fontFamily: '"IBM Plex Mono", Menlo, Consolas, "Courier New", monospace',
      fontWeight: 700,
      boxShadow: 'none', // UNDO
      backgroundImage: 'none', // UNDO
      transition: 'none', // UNDO
      '&:focus': {
        outline: '2px dashed #19ff7d',
        outlineOffset: '2px',
        boxShadow: 'none', // UNDO
      },
    },
    identityPreview: {
      border: '1px dashed #19ff7d',
      backgroundColor: '#03160c',
      boxShadow: 'none', // UNDO
      backgroundImage: 'none', // UNDO
    },
    identityPreviewText: {
      fontSize: '12px',
      color: '#9be7c1',
    },
    identityPreviewEditButton: {
      color: '#19ff7d',
      textDecoration: 'underline',
      boxShadow: 'none', // UNDO
      transition: 'none', // UNDO
      '&:hover': {
        color: '#8fffc0',
        boxShadow: 'none', // UNDO
        transform: 'none', // UNDO
      },
    },
    headerBackLink: {
      color: '#19ff7d',
      textDecoration: 'underline',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      fontSize: '11px',
    },
    footerPagesLink: {
      color: '#9be7c1',
      textDecoration: 'underline',
      fontSize: '11px',
    },
  },
};

// COMPARISON:
// darkPremium (raw mode base):    ~40 element overrides, 0 variables
// darkPremiumDefault (default base): 10 variables, 3 element overrides
//
// terminalRaw (raw mode):      ~160 lines, 0 "UNDO" overrides
// terminalDefault (default):   ~220 lines, ~30 "UNDO" overrides (boxShadow: none, transition: none, etc.)
//
// For radical design changes, raw mode is cleaner - you only write what you WANT.
// For color-swap themes, the default theme wins via variable cascade.

// Friction log from building both presets:
//
// DISCOVERY:
// 1. Element key names aren't guessable ("formButtonPrimary", "socialButtonsIconButton")
// 2. cardBox vs card vs rootBox - three nesting levels
// 3. socialButtonsIconButton vs socialButtonsBlockButton depends on variant config
// 4. "lastAuthenticationStrategyBadge" is very internal-sounding
//
// STYLING:
// 5. backgroundColor leaks in raw mode (preserved for icon masks)
// 6. Provider icon colors driven by CSS custom properties, not elements API
// 7. spinner element is global (no scoped per-button override)
// 8. Social button text color doesn't inherit - need socialButtonsBlockButtonText
// 9. Dark theme: icon fills are #000 by default, need to adjust theme variables
//    (colorForeground) to make icons visible on dark backgrounds
//
// COMPLETENESS:
// 10. Multi-step flows (OTP, password reset) have separate element keys
// 11. Error/loading states easy to forget
// 12. Autofill styling needs vendor-prefixed hacks (-webkit-autofill)
