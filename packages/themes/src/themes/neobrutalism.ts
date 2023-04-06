import { unstable_createTheme } from '../createTheme';

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

export const neobrutalism = unstable_createTheme({
  variables: {
    colorPrimary: '#DF1B1B',
    colorTextSecondary: '#000',
    fontWeight: {
      normal: 500,
      medium: 600,
      bold: 700,
    },
    colorShimmer: 'rgba(255,255,255,0.64)',
    shadowShimmer: '2px 2px 0px #000',
  },
  elements: {
    card: {
      boxShadow: '7px 7px 0px #000',
      border: '3px solid #000',
    },
    alternativeMethodsBlockButton: buttonStyle,
    socialButtonsIconButton: {
      ...buttonStyle,
    },
    socialButtonsBlockButton: buttonStyle,
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
    footerActionLink: {
      fontWeight: '600',
      borderBottom: '2px solid',
      '&:focus': {
        boxShadow: 'none',
      },
    },
  },
});
