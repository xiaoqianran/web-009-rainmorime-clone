export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function withBase(path: string): string {
  if (!path) return BASE_PATH || '/';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const [pathname, hash] = path.split('#');
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const prefixed = `${BASE_PATH}${normalized}` || normalized;
  return hash ? `${prefixed}#${hash}` : prefixed;
}
