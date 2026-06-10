/**
 * Folder-glob matcher for the require-auth-protection rule.
 */

export interface ClassifyOptions {
  protected?: string[];
  public?: string[];
}

export type FolderClass = 'public' | 'protected' | 'unmatched';

const REGEX_SPECIAL = /[.+^${}()|[\]\\]/g;

function segmentToRegex(seg: string): string {
  let out = '';
  for (let i = 0; i < seg.length; i++) {
    const ch = seg[i];
    if (ch === '*') {
      out += '[^/]*';
    } else if (REGEX_SPECIAL.test(ch)) {
      out += '\\' + ch;
    } else {
      out += ch;
    }
    REGEX_SPECIAL.lastIndex = 0;
  }
  return out;
}

function segmentMatches(patternSeg: string, pathSeg: string): boolean {
  if (patternSeg === pathSeg) {
    return true;
  }
  if (!patternSeg.includes('*')) {
    return false;
  }
  return new RegExp('^' + segmentToRegex(patternSeg) + '$').test(pathSeg);
}

function matchSegments(patternSegs: string[], pi: number, pathSegs: string[], si: number): boolean {
  while (pi < patternSegs.length) {
    const seg = patternSegs[pi];
    if (seg === '**') {
      if (pi === patternSegs.length - 1) {
        return true;
      }
      for (let k = si; k <= pathSegs.length; k++) {
        if (matchSegments(patternSegs, pi + 1, pathSegs, k)) {
          return true;
        }
      }
      return false;
    }
    if (si >= pathSegs.length) {
      return false;
    }
    if (!segmentMatches(seg, pathSegs[si])) {
      return false;
    }
    pi++;
    si++;
  }
  return si === pathSegs.length;
}

export function matchPath(pattern: string, path: string): boolean {
  return matchSegments(pattern.split('/'), 0, path.split('/'), 0);
}

export function specificity(pattern: string): number {
  return pattern.split('/').filter(seg => seg.length > 0 && seg !== '**' && !seg.includes('*')).length;
}

export function literalPrefix(pattern: string): string {
  const segs = pattern.split('/');
  const result: string[] = [];
  for (const seg of segs) {
    if (seg === '**' || seg.includes('*')) {
      break;
    }
    result.push(seg);
  }
  return result.join('/');
}

export function hasDescendantsMatching(folder: string, patterns: string[] | undefined): boolean {
  if (!patterns || patterns.length === 0) {
    return false;
  }
  for (const pattern of patterns) {
    const prefix = literalPrefix(pattern);
    if (!prefix) {
      continue;
    }
    if (prefix === folder) {
      return true;
    }
    if (prefix.startsWith(folder + '/')) {
      return true;
    }
  }
  return false;
}

export function classifyFolder(folderPath: string, options: ClassifyOptions): FolderClass {
  const protectPatterns = options.protected ?? [];
  const publicPatterns = options.public ?? [];

  const protectMatches = protectPatterns.filter(p => matchPath(p, folderPath));
  const publicMatches = publicPatterns.filter(p => matchPath(p, folderPath));

  if (protectMatches.length === 0 && publicMatches.length === 0) {
    return 'unmatched';
  }
  if (publicMatches.length === 0) {
    return 'protected';
  }
  if (protectMatches.length === 0) {
    return 'public';
  }

  const maxProtect = Math.max(...protectMatches.map(specificity));
  const maxPublic = Math.max(...publicMatches.map(specificity));

  return maxProtect >= maxPublic ? 'protected' : 'public';
}
