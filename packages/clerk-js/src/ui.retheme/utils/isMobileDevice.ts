const mobileNavigatorsRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined' || typeof window.document === 'undefined') {
    return false;
  }

  return !!(
    window.matchMedia('only screen and (max-width: 760px)').matches ||
    mobileNavigatorsRegex.test(navigator.userAgent) ||
    ('ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/))
  );
};
