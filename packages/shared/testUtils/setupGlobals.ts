const navigatorMock = {
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0',
  webdriver: false,
  connection: { downlink: 10, rtt: 100 },
};

Object.defineProperty(window, 'navigator', {
  value: navigatorMock,
  writable: true,
});
