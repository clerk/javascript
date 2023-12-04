import React from 'react';
import { createRoot } from 'react-dom/client';
import NewTab from './new-tab';
import '@assets/styles/index.css';

function init() {
  const rootContainer = document.querySelector("#__root");
  if (!rootContainer) throw new Error("Can't find NewTab root element");
  const root = createRoot(rootContainer);
  root.render(<NewTab />);
}

init();
