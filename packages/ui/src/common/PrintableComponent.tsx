import React from 'react';

type OnPrintCallback = () => void;
type UsePrintableReturn = {
  print: () => void;
  printableProps: { onPrint: (cb: OnPrintCallback) => () => void };
};

export const usePrintable = (): UsePrintableReturn => {
  const callbacks = React.useRef(new Set<OnPrintCallback>());
  const onPrint = React.useCallback((cb: OnPrintCallback) => {
    callbacks.current.add(cb);
    return () => {
      callbacks.current.delete(cb);
    };
  }, []);
  const print = React.useCallback(() => callbacks.current.forEach(cb => cb()), []);
  return { print, printableProps: { onPrint } };
};

export const PrintableComponent = (props: UsePrintableReturn['printableProps'] & React.PropsWithChildren) => {
  const { children, onPrint } = props;
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let release: (() => void) | undefined;
    const unregister = onPrint(() => {
      release?.();
      release = printContentsOfElementViaIFrame(ref);
    });
    return () => {
      unregister();
      release?.();
    };
  }, [onPrint, children]);

  return (
    <div
      ref={ref}
      // eslint-disable-next-line custom-rules/no-physical-css-properties -- Off-screen hide for print functionality
      style={{ position: 'fixed', left: '-9999px', top: 0, display: 'none' }}
    >
      {children}
    </div>
  );
};

const copyStyles = (iframe: HTMLIFrameElement, selector = '[data-emotion=cl-internal]') => {
  if (!iframe.contentDocument) {
    return;
  }
  // @ts-ignore - noop
  const allStyleText = [...document.head.querySelectorAll(selector)].map(a => a.innerHTML).join('\n');
  const styleEl = iframe.contentDocument.createElement('style');
  styleEl.innerHTML = allStyleText;
  iframe.contentDocument.head.prepend(styleEl);
};

const setPrintingStyles = (iframe: HTMLIFrameElement) => {
  if (!iframe.contentDocument) {
    return;
  }
  // A web-safe font that's universally supported
  iframe.contentDocument.body.style.fontFamily = 'Arial';
  // Make the printing dialog display the background colors by default
  iframe.contentDocument.body.style.cssText = `* {\n-webkit-print-color-adjust: exact !important;\ncolor-adjust: exact !important;\nprint-color-adjust: exact !important;\n}`;
};

const printContentsOfElementViaIFrame = (elementRef: React.MutableRefObject<HTMLElement | null>) => {
  const content = elementRef.current;
  if (!content) {
    return;
  }

  const frame = document.createElement('iframe');
  frame.style.position = 'fixed';
  frame.style.right = '-2000px';
  frame.style.bottom = '-2000px';
  // frame.style.width = '500px';
  // frame.style.height = '500px';
  // frame.style.border = '0px';

  let active = true;
  let printWindow: Window | null = null;
  let timer: number | undefined;
  const release = () => {
    if (!active) {
      return;
    }
    active = false;
    if (timer !== undefined) {
      window.clearTimeout(timer);
    }
    printWindow?.removeEventListener('afterprint', onAfterPrint);
    printWindow = null;
    if (frame.contentDocument?.body) {
      frame.contentDocument.body.innerHTML = '';
    }
    frame.onload = null;
    frame.onerror = null;
    frame.remove();
  };
  const onAfterPrint = () => {
    if (timer === undefined) {
      timer = window.setTimeout(release, 0);
    }
  };
  frame.onerror = release;
  frame.onload = () => {
    if (!active) {
      return;
    }
    frame.onload = null;
    try {
      copyStyles(frame);
      setPrintingStyles(frame);
      printWindow = frame.contentWindow;
      if (!frame.contentDocument || !printWindow) {
        release();
        return;
      }
      frame.contentDocument.body.innerHTML = content.innerHTML;
      printWindow.addEventListener('afterprint', onAfterPrint);
      printWindow.print();
    } catch (error) {
      release();
      throw error;
    }
  };

  try {
    window.document.body.appendChild(frame);
  } catch (error) {
    release();
    throw error;
  }
  return release;
};
