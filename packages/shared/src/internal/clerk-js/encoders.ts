export function encodeB64(input: string) {
  return globalThis.btoa(input);
}

// https://stackoverflow.com/questions/30106476/
export function decodeB64(input: string) {
  return decodeURIComponent(
    globalThis
      .atob(input)
      .split('')
      .map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );
}

export function urlEncodeB64(input: string) {
  const b64Chars: { [index: string]: string } = { '+': '-', '/': '_', '=': '' };
  return encodeB64(input).replace(/[+/=]/g, (m: string) => b64Chars[m]);
}

export function urlDecodeB64(input: string) {
  return decodeB64(input.replace(/_/g, '/').replace(/-/g, '+'));
}
