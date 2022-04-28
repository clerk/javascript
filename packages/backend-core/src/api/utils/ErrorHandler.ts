import { ClerkServerError, ClerkServerErrorJSON, HttpError } from './Errors';

export default function handleError(error: any): never {
  const statusCode = error?.response?.statusCode || 500;
  const message = error.message || '';
  const body = error?.response?.body;
  let data;

  if (body) {
    data = JSON.parse(body).errors.map((errorJSON: ClerkServerErrorJSON) => {
      return ClerkServerError.fromJSON(errorJSON);
    });
  } else {
    data = body;
  }

  throw new HttpError(statusCode, message, data);
}
