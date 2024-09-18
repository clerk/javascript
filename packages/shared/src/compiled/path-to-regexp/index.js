/* eslint-disable no-redeclare, curly */

function _(r) {
  for (var n = [], e = 0; e < r.length; ) {
    var a = r[e];
    if (a === '*' || a === '+' || a === '?') {
      n.push({
        type: 'MODIFIER',
        index: e,
        value: r[e++],
      });
      continue;
    }
    if (a === '\\') {
      n.push({
        type: 'ESCAPED_CHAR',
        index: e++,
        value: r[e++],
      });
      continue;
    }
    if (a === '{') {
      n.push({
        type: 'OPEN',
        index: e,
        value: r[e++],
      });
      continue;
    }
    if (a === '}') {
      n.push({
        type: 'CLOSE',
        index: e,
        value: r[e++],
      });
      continue;
    }
    if (a === ':') {
      for (var u = '', t = e + 1; t < r.length; ) {
        var c = r.charCodeAt(t);
        if ((c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || c === 95) {
          u += r[t++];
          continue;
        }
        break;
      }
      if (!u) throw new TypeError('Missing parameter name at '.concat(e));
      n.push({
        type: 'NAME',
        index: e,
        value: u,
      }),
        (e = t);
      continue;
    }
    if (a === '(') {
      var o = 1,
        h = '',
        t = e + 1;
      if (r[t] === '?') throw new TypeError('Pattern cannot start with "?" at '.concat(t));
      for (; t < r.length; ) {
        if (r[t] === '\\') {
          h += r[t++] + r[t++];
          continue;
        }
        if (r[t] === ')') {
          if ((o--, o === 0)) {
            t++;
            break;
          }
        } else if (r[t] === '(' && (o++, r[t + 1] !== '?'))
          throw new TypeError('Capturing groups are not allowed at '.concat(t));
        h += r[t++];
      }
      if (o) throw new TypeError('Unbalanced pattern at '.concat(e));
      if (!h) throw new TypeError('Missing pattern at '.concat(e));
      n.push({
        type: 'PATTERN',
        index: e,
        value: h,
      }),
        (e = t);
      continue;
    }
    n.push({
      type: 'CHAR',
      index: e,
      value: r[e++],
    });
  }
  return (
    n.push({
      type: 'END',
      index: e,
      value: '',
    }),
    n
  );
}

function F(r, n) {
  n === void 0 && (n = {});
  for (
    var e = _(r),
      a = n.prefixes,
      u = a === void 0 ? './' : a,
      t = n.delimiter,
      c = t === void 0 ? '/#?' : t,
      o = [],
      h = 0,
      m = 0,
      d = '',
      f = function (l) {
        if (m < e.length && e[m].type === l) return e[m++].value;
      },
      w = function (l) {
        var v = f(l);
        if (v !== void 0) return v;
        var E = e[m],
          P = E.type,
          S = E.index;
        throw new TypeError('Unexpected '.concat(P, ' at ').concat(S, ', expected ').concat(l));
      },
      p = function () {
        for (var l = '', v; (v = f('CHAR') || f('ESCAPED_CHAR')); ) l += v;
        return l;
      },
      O = function (l) {
        for (var v = 0, E = c; v < E.length; v++) {
          var P = E[v];
          if (l.indexOf(P) > -1) return !0;
        }
        return !1;
      },
      A = function (l) {
        var v = o[o.length - 1],
          E = l || (v && typeof v == 'string' ? v : '');
        if (v && !E)
          throw new TypeError('Must have text between two parameters, missing text after "'.concat(v.name, '"'));
        return !E || O(E) ? '[^'.concat(s(c), ']+?') : '(?:(?!'.concat(s(E), ')[^').concat(s(c), '])+?');
      };
    m < e.length;

  ) {
    var T = f('CHAR'),
      x = f('NAME'),
      C = f('PATTERN');
    if (x || C) {
      var g = T || '';
      u.indexOf(g) === -1 && ((d += g), (g = '')),
        d && (o.push(d), (d = '')),
        o.push({
          name: x || h++,
          prefix: g,
          suffix: '',
          pattern: C || A(g),
          modifier: f('MODIFIER') || '',
        });
      continue;
    }
    var i = T || f('ESCAPED_CHAR');
    if (i) {
      d += i;
      continue;
    }
    d && (o.push(d), (d = ''));
    var R = f('OPEN');
    if (R) {
      var g = p(),
        y = f('NAME') || '',
        N = f('PATTERN') || '',
        b = p();
      w('CLOSE'),
        o.push({
          name: y || (N ? h++ : ''),
          pattern: y && !N ? A(g) : N,
          prefix: g,
          suffix: b,
          modifier: f('MODIFIER') || '',
        });
      continue;
    }
    w('END');
  }
  return o;
}

function H(r, n) {
  var e = [],
    a = M(r, e, n);
  return I(a, e, n);
}

function I(r, n, e) {
  e === void 0 && (e = {});
  var a = e.decode,
    u =
      a === void 0
        ? function (t) {
            return t;
          }
        : a;
  return function (t) {
    var c = r.exec(t);
    if (!c) return !1;
    for (
      var o = c[0],
        h = c.index,
        m = Object.create(null),
        d = function (w) {
          if (c[w] === void 0) return 'continue';
          var p = n[w - 1];
          p.modifier === '*' || p.modifier === '+'
            ? (m[p.name] = c[w].split(p.prefix + p.suffix).map(function (O) {
                return u(O, p);
              }))
            : (m[p.name] = u(c[w], p));
        },
        f = 1;
      f < c.length;
      f++
    )
      d(f);
    return {
      path: o,
      index: h,
      params: m,
    };
  };
}

function s(r) {
  return r.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
}

function D(r) {
  return r && r.sensitive ? '' : 'i';
}

function $(r, n) {
  if (!n) return r;
  for (var e = /\((?:\?<(.*?)>)?(?!\?)/g, a = 0, u = e.exec(r.source); u; )
    n.push({
      name: u[1] || a++,
      prefix: '',
      suffix: '',
      modifier: '',
      pattern: '',
    }),
      (u = e.exec(r.source));
  return r;
}

function W(r, n, e) {
  var a = r.map(function (u) {
    return M(u, n, e).source;
  });
  return new RegExp('(?:'.concat(a.join('|'), ')'), D(e));
}

function L(r, n, e) {
  return U(F(r, e), n, e);
}

function U(r, n, e) {
  e === void 0 && (e = {});
  for (
    var a = e.strict,
      u = a === void 0 ? !1 : a,
      t = e.start,
      c = t === void 0 ? !0 : t,
      o = e.end,
      h = o === void 0 ? !0 : o,
      m = e.encode,
      d =
        m === void 0
          ? function (v) {
              return v;
            }
          : m,
      f = e.delimiter,
      w = f === void 0 ? '/#?' : f,
      p = e.endsWith,
      O = p === void 0 ? '' : p,
      A = '['.concat(s(O), ']|$'),
      T = '['.concat(s(w), ']'),
      x = c ? '^' : '',
      C = 0,
      g = r;
    C < g.length;
    C++
  ) {
    var i = g[C];
    if (typeof i == 'string') x += s(d(i));
    else {
      var R = s(d(i.prefix)),
        y = s(d(i.suffix));
      if (i.pattern)
        if ((n && n.push(i), R || y))
          if (i.modifier === '+' || i.modifier === '*') {
            var N = i.modifier === '*' ? '?' : '';
            x += '(?:'
              .concat(R, '((?:')
              .concat(i.pattern, ')(?:')
              .concat(y)
              .concat(R, '(?:')
              .concat(i.pattern, '))*)')
              .concat(y, ')')
              .concat(N);
          } else x += '(?:'.concat(R, '(').concat(i.pattern, ')').concat(y, ')').concat(i.modifier);
        else {
          if (i.modifier === '+' || i.modifier === '*')
            throw new TypeError('Can not repeat "'.concat(i.name, '" without a prefix and suffix'));
          x += '('.concat(i.pattern, ')').concat(i.modifier);
        }
      else x += '(?:'.concat(R).concat(y, ')').concat(i.modifier);
    }
  }
  if (h) u || (x += ''.concat(T, '?')), (x += e.endsWith ? '(?='.concat(A, ')') : '$');
  else {
    var b = r[r.length - 1],
      l = typeof b == 'string' ? T.indexOf(b[b.length - 1]) > -1 : b === void 0;
    u || (x += '(?:'.concat(T, '(?=').concat(A, '))?')), l || (x += '(?='.concat(T, '|').concat(A, ')'));
  }
  return new RegExp(x, D(e));
}

function M(r, n, e) {
  return r instanceof RegExp ? $(r, n) : Array.isArray(r) ? W(r, n, e) : L(r, n, e);
}
export { H as match, M as pathToRegexp };
