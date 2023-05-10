import { keyframes } from '@emotion/react';

const spinning = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }`;

const dropdownSlideInScaleAndFade = keyframes`
  0% {
    opacity: 0;
    transform: scaleY(1) translateY(-6px);
  }

  100% {
    opacity: 1;
    transform: scaleY(1)  translateY(0px);
  }
`;

const modalSlideAndFade = keyframes`
  0% {
    opacity: 0;
    transform: translateY(0.5rem);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

const inAnimation = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-5px);
    max-height: 0;
  }
  100% {
    opacity: 1;
    transform: translateY(0px);
    max-height: 6rem;
  }
`;

const outAnimation = keyframes`
  20% {
    opacity: 1;
    transform: translateY(0px);
    max-height: 6rem;
  }
  80% {
    opacity: 0;
    transform: translateY(5px);
    max-height: 0;
  }
  100% {
    opacity: 0;
    transform: translateY(5px);
    max-height: 0;
  }
`;

const textInSmall = keyframes`
  0% {opacity: 0;max-height: 0;}
  100% {opacity: 1;max-height: 3rem;}
`;

const textInBig = keyframes`
  0% {opacity: 0;max-height: 0;}
  100% {opacity: 1;max-height: 8rem;}
`;

const blockBigIn = keyframes`
  0% {opacity: 0;max-height: 0;}
  99% {opacity: 1;max-height: 10rem;}
  100% {opacity: 1;max-height: unset;}
`;

const expandIn = (max: string) => keyframes`
  0% {opacity: 0;max-height: 0;}
  99% {opacity: 1;max-height: ${max};}
  100% {opacity: 1;max-height: unset;}
`;

const navbarSlideIn = keyframes`
  0% {opacity: 0; transform: translateX(-100%);}
  100% {opacity: 1; transform: translateX(0);}
`;

export const animations = {
  spinning,
  dropdownSlideInScaleAndFade,
  modalSlideAndFade,
  fadeIn,
  textInSmall,
  textInBig,
  blockBigIn,
  expandIn,
  navbarSlideIn,
  inAnimation,
  outAnimation,
};
