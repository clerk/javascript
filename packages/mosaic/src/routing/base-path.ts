// '/user/' -> '/user'    'user' -> '/user'    '/' -> ''
export function normalizeBase(base: string): string {
  const parts = base.split('/').filter(Boolean);
  return parts.length ? `/${parts.join('/')}` : '';
}
