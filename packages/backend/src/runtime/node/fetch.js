const { fetch, Blob, FormData, Headers, Request, Response, AbortController } = require('node-fetch-native');

module.exports = fetch;
module.exports.Blob = Blob;
module.exports.FormData = FormData;
module.exports.Headers = Headers;
module.exports.Request = Request;
module.exports.Response = Response;
module.exports.AbortController = AbortController;
