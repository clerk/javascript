/* eslint-disable @typescript-eslint/no-var-requires */
const { fetch, Blob, FormData, Headers, Request, Response, AbortController } = require('node-fetch-native');

module.exports = fetch;
module.exports.RuntimeBlob = Blob;
module.exports.RuntimeFormData = FormData;
module.exports.RuntimeHeaders = Headers;
module.exports.RuntimeRequest = Request;
module.exports.RuntimeResponse = Response;
module.exports.RuntimeAbortController = AbortController;
module.exports.RuntimeFetch = fetch;
