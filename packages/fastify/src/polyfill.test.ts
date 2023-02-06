import { polyfillServerResponseMethods } from './polyfill';
import { createFastifyInstanceMock } from './test/utils';

describe('polyfill', () => {
  describe('polyfillServerResponseMethods(fastify)', () => {
    test('decorates reply with server response methods', () => {
      const fastify = createFastifyInstanceMock();

      polyfillServerResponseMethods(fastify);

      expect(fastify.decorateReply).toMatchSnapshot();
    });

    test('proxies reply.setHeader to reply.raw.setHeader', () => {
      const rawSetHeaderMock = jest.fn();
      const replyMock = {
        raw: { setHeader: rawSetHeaderMock },
      };
      const fastify = createFastifyInstanceMock();

      polyfillServerResponseMethods(fastify);
      // @ts-ignore
      fastify['setHeader'](replyMock, 'name', 'value');

      expect(rawSetHeaderMock).toBeCalledWith('name', 'value');
    });

    test('proxies reply.writeHead to reply.raw.writeHead', () => {
      const rawWriteHeadMock = jest.fn();
      const replyMock = {
        raw: { writeHead: rawWriteHeadMock },
      };
      const fastify = createFastifyInstanceMock();

      polyfillServerResponseMethods(fastify);
      // @ts-ignore
      fastify['writeHead'](replyMock, 200, { 'Content-Type': 'text/html' });

      expect(rawWriteHeadMock).toBeCalledWith(200, { 'Content-Type': 'text/html' });
    });

    test('proxies reply.end to reply.raw.end', () => {
      const rawEndMock = jest.fn();
      const replyMock = {
        raw: { end: rawEndMock },
      };
      const fastify = createFastifyInstanceMock();

      polyfillServerResponseMethods(fastify);
      // @ts-ignore
      fastify['end'](replyMock, '<html>page</html>');

      expect(rawEndMock).toBeCalledWith('<html>page</html>');
    });
  });
});
