import React from 'react';

export function Interstitial({ html }: { html: string }) {
  return <html dangerouslySetInnerHTML={{ __html: html }} />;
}
