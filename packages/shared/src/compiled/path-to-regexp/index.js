/* eslint-disable no-redeclare */

function _(r) {
  for (var n = [], e = 0; e < r.length; ) {
    var t = r[e];
    if (t === '*' || t === '+' || t === '?') {
      n.push({ type: 'MODIFIER', index: e, value: r[e++] });
      continue;
    }
    if (t === '\\') {
      n.push({ type: 'ESCAPED_CHAR', index: e++, value: r[e++] });
      continue;
    }
    if (t === '{') {
      n.push({ type: 'OPEN', index: e, value: r[e++] });
      continue;
    }
    if (t === '}') {
      n.push({ type: 'CLOSE', index: e, value: r[e++] });
      continue;
    }
    if (t === ':') {
      for (var u = '', a = e + 1; a < r.length; ) {
        var f = r.charCodeAt(a);
        if ((f >= 48 && f <= 57) || (f >= 65 && f <= 90) || (f >= 97 && f <= 122) || f === 95) {
          u += r[a++];
          continue;
        }
        break;
      }
      if (!u) {
        throw new TypeError('Missing parameter name at '.concat(e));
      }
      n.push({ type: 'NAME', index: e, value: u }), (e = a);
      continue;
    }
    if (t === '(') {
      var l = 1,
        d = '',
        a = e + 1;
      if (r[a] === '?') {
        throw new TypeError('Pattern cannot start with "?" at '.concat(a));
      }
      for (; a < r.length; ) {
        if (r[a] === '\\') {
          d += r[a++] + r[a++];
          continue;
        }
        if (r[a] === ')') {
          if ((l--, l === 0)) {
            a++;
            break;
          }
        } else if (r[a] === '(' && (l++, r[a + 1] !== '?')) {
          throw new TypeError('Capturing groups are not allowed at '.concat(a));
        }
        d += r[a++];
      }
      if (l) {
        throw new TypeError('Unbalanced pattern at '.concat(e));
      }
      if (!d) {
        throw new TypeError('Missing pattern at '.concat(e));
      }
      n.push({ type: 'PATTERN', index: e, value: d }), (e = a);
      continue;
    }
    n.push({ type: 'CHAR', index: e, value: r[e++] });
  }
  return n.push({ type: 'END', index: e, value: '' }), n;
}
function D(r, n) {
  n === void 0 && (n = {});
  for (
    var e = _(r),
      t = n.prefixes,
      u = t === void 0 ? './' : t,
      a = '[^'.concat(y(n.delimiter || '/#?'), ']+?'),
      f = [],
      l = 0,
      d = 0,
      p = '',
      c = function (v) {
        if (d < e.length && e[d].type === v) {
          return e[d++].value;
        }
      },
      w = function (v) {
        var g = c(v);
        if (g !== void 0) {
          return g;
        }
        var h = e[d],
          b = h.type,
          N = h.index;
        throw new TypeError('Unexpected '.concat(b, ' at ').concat(N, ', expected ').concat(v));
      },
      A = function () {
        for (var v = '', g; (g = c('CHAR') || c('ESCAPED_CHAR')); ) {
          v += g;
        }
        return v;
      };
    d < e.length;

  ) {
    var s = c('CHAR'),
      C = c('NAME'),
      E = c('PATTERN');
    if (C || E) {
      var x = s || '';
      u.indexOf(x) === -1 && ((p += x), (x = '')),
        p && (f.push(p), (p = '')),
        f.push({ name: C || l++, prefix: x, suffix: '', pattern: E || a, modifier: c('MODIFIER') || '' });
      continue;
    }
    var o = s || c('ESCAPED_CHAR');
    if (o) {
      p += o;
      continue;
    }
    p && (f.push(p), (p = ''));
    var R = c('OPEN');
    if (R) {
      var x = A(),
        T = c('NAME') || '',
        i = c('PATTERN') || '',
        m = A();
      w('CLOSE'),
        f.push({
          name: T || (i ? l++ : ''),
          pattern: T && !i ? a : i,
          prefix: x,
          suffix: m,
          modifier: c('MODIFIER') || '',
        });
      continue;
    }
    w('END');
  }
  return f;
}
function y(r) {
  return r.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
}
function O(r) {
  return r && r.sensitive ? '' : 'i';
}
function M(r, n) {
  if (!n) {
    return r;
  }
  for (var e = /\((?:\?<(.*?)>)?(?!\?)/g, t = 0, u = e.exec(r.source); u; ) {
    n.push({ name: u[1] || t++, prefix: '', suffix: '', modifier: '', pattern: '' }), (u = e.exec(r.source));
  }
  return r;
}
function S(r, n, e) {
  var t = r.map(function (u) {
    return P(u, n, e).source;
  });
  return new RegExp('(?:'.concat(t.join('|'), ')'), O(e));
}
function F(r, n, e) {
  return H(D(r, e), n, e);
}
function H(r, n, e) {
  e === void 0 && (e = {});
  for (
    var t = e.strict,
      u = t === void 0 ? !1 : t,
      a = e.start,
      f = a === void 0 ? !0 : a,
      l = e.end,
      d = l === void 0 ? !0 : l,
      p = e.encode,
      c =
        p === void 0
          ? function (N) {
              return N;
            }
          : p,
      w = e.delimiter,
      A = w === void 0 ? '/#?' : w,
      s = e.endsWith,
      C = s === void 0 ? '' : s,
      E = '['.concat(y(C), ']|$'),
      x = '['.concat(y(A), ']'),
      o = f ? '^' : '',
      R = 0,
      T = r;
    R < T.length;
    R++
  ) {
    var i = T[R];
    if (typeof i == 'string') {
      o += y(c(i));
    } else {
      var m = y(c(i.prefix)),
        v = y(c(i.suffix));
      if (i.pattern) {
        if ((n && n.push(i), m || v)) {
          if (i.modifier === '+' || i.modifier === '*') {
            var g = i.modifier === '*' ? '?' : '';
            o += '(?:'
              .concat(m, '((?:')
              .concat(i.pattern, ')(?:')
              .concat(v)
              .concat(m, '(?:')
              .concat(i.pattern, '))*)')
              .concat(v, ')')
              .concat(g);
          } else {
            o += '(?:'.concat(m, '(').concat(i.pattern, ')').concat(v, ')').concat(i.modifier);
          }
        } else {
          i.modifier === '+' || i.modifier === '*'
            ? (o += '((?:'.concat(i.pattern, ')').concat(i.modifier, ')'))
            : (o += '('.concat(i.pattern, ')').concat(i.modifier));
        }
      } else {
        o += '(?:'.concat(m).concat(v, ')').concat(i.modifier);
      }
    }
  }
  if (d) {
    u || (o += ''.concat(x, '?')), (o += e.endsWith ? '(?='.concat(E, ')') : '$');
  } else {
    var h = r[r.length - 1],
      b = typeof h == 'string' ? x.indexOf(h[h.length - 1]) > -1 : h === void 0;
    u || (o += '(?:'.concat(x, '(?=').concat(E, '))?')), b || (o += '(?='.concat(x, '|').concat(E, ')'));
  }
  return new RegExp(o, O(e));
}
function P(r, n, e) {
  return r instanceof RegExp ? M(r, n) : Array.isArray(r) ? S(r, n, e) : F(r, n, e);
}
export { P as pathToRegexp };
