import React from 'react';
import { createRoot } from 'react-dom/client';
import Panel from '@pages/panel/panel';
import '@assets/styles/index.css';

function init() {
  const rootContainer = document.querySelector("#__root");
  if (!rootContainer) throw new Error("Can't find Panel root element");
  const root = createRoot(rootContainer);
  root.render(<Panel />);
}

init();
