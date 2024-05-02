import { experimental_createTheme } from '../createTheme';

const buttonStyle = {
  boxShadow: '3px 3px 0px #000',
  border: '2px solid #000',
  '&:focus': {
    boxShadow: '4px 4px 0px #000',
    border: '2px solid #000',
    transform: 'scale(1.01)',
  },
  '&:active': {
    boxShadow: '2px 2px 0px #000',
    transform: 'translate(1px)',
  },
};

export const neobrutalism = experimental_createTheme({
  //@ts-expect-error not public api
  simpleStyles: true,
  variables: {
    colorPrimary: '#DF1B1B',
    colorShimmer: 'rgba(255,255,255,0.64)',
    fontWeight: {
      normal: 500,
      medium: 600,
      bold: 700,
    },
  },
  elements: {
    cardBox: {
      boxShadow: '7px 7px 0px #000',
      border: '3px solid #000',
    },
    card: {
      borderRadius: '0',
    },
    headerSubtitle: { color: '#212126' },
    alternativeMethodsBlockButton: buttonStyle,
    socialButtonsIconButton: {
      ...buttonStyle,
    },
    socialButtonsBlockButton: { ...buttonStyle, color: '#212126' },
    profileSectionPrimaryButton: buttonStyle,
    formButtonPrimary: buttonStyle,
    navbarButton: buttonStyle,
    formFieldInput: {
      boxShadow: '3px 3px 0px #000',
      border: '2px solid #000',
      transition: 'all 0.2s ease-in-out',
      '&:focus': {
        boxShadow: '4px 4px 0px #000',
        border: '2px solid #000',
        transform: 'scale(1.01)',
      },
    },
    dividerLine: {
      background: '#000',
    },
    dividerText: {
      fontWeight: '700',
      color: '#212126',
    },
    footer: {
      background: '#fff',
      '& div': {
        color: '#212126',
      },
    },
    footerActionText: {
      color: '#212126',
    },
    footerActionLink: {
      fontWeight: '700',
      borderBottom: '3px solid',
      '&:focus': {
        boxShadow: 'none',
      },
    },
  },
});
