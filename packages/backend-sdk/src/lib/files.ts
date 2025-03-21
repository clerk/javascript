/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

/**
 * Consumes a stream and returns a concatenated array buffer. Useful in
 * situations where we need to read the whole file because it forms part of a
 * larger payload containing other fields, and we can't modify the underlying
 * request structure.
 */
export async function readableStreamToArrayBuffer(readable: ReadableStream<Uint8Array>): Promise<ArrayBuffer> {
  const reader = readable.getReader();
  const chunks: Uint8Array[] = [];

  let totalLength = 0;
  let done = false;

  while (!done) {
    const { value, done: doneReading } = await reader.read();

    if (doneReading) {
      done = true;
    } else {
      chunks.push(value);
      totalLength += value.length;
    }
  }

  const concatenatedChunks = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    concatenatedChunks.set(chunk, offset);
    offset += chunk.length;
  }

  return concatenatedChunks.buffer as ArrayBuffer;
}
