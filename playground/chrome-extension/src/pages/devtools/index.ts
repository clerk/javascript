import browser from 'webextension-polyfill';

browser
  .devtools
  .panels
  .create('Clerk Starter', 'icon-32.png', 'src/pages/panel/index.html');
