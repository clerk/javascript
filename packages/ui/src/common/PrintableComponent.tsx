import React from 'react';

type OnPrintCallback = () => void;
type UsePrintableReturn = {
  print: () => void;
  printableProps: { onPrint: (cb: OnPrintCallback) => void };
};

export const usePrintable = (): UsePrintableReturn => {
  const callbacks: OnPrintCallback[] = [];
  const onPrint = (cb: OnPrintCallback) => callbacks.push(cb);
  const print = () => callbacks.forEach(cb => cb());
  return { print, printableProps: { onPrint } };
};

export const PrintableComponent = (props: UsePrintableReturn['printableProps'] & React.PropsWithChildren) => {
  const { children, onPrint } = props;
  const ref = React.useRef<HTMLDivElement>(null);

  onPrint(() => {
    printContentsOfElementViaIFrame(ref);
  });

  return (
    <div
      ref={ref}
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

  frame.onload = () => {
    copyStyles(frame);
    setPrintingStyles(frame);
    if (frame.contentDocument && frame.contentWindow) {
      frame.contentDocument.body.innerHTML = content.innerHTML;
      frame.contentWindow.print();
    }
  };

  // TODO: Cleaning this iframe is not always possible because
  // .print() will not block. Leaving this iframe inside the DOM
  // shouldn't be an issue, but is there any reliable way to remove it?
  window.document.body.appendChild(frame);
};
