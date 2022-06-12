import { keyframes } from '@emotion/react';

const spinning = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }`;

const dropdownFadeInAndScale = keyframes`
  0% {
    opacity: 0;
    transform: scaleY(1) translateY(-6px);
  }

  100% {
    opacity: 1;
    transform: scaleY(1)  translateY(0px);;
  }
`;

const textInSmall = keyframes`
  0% {opacity: 0;max-height: 0;}
  100% {opacity: 1;max-height: 3rem;}
`;

const textInBig = keyframes`
  0% {opacity: 0;max-height: 0;}
  100% {opacity: 1;max-height: 3rem;}
`;

export const animations = {
  spinning,
  dropdownFadeInAndScale,
  textInSmall,
  textInBig,
};
