/*
 * SHEIKH SCIENTIFIC — math engine
 * Safe expression evaluator (tokenizer + recursive-descent parser).
 * No eval(), no Function(), no dynamic code of any kind.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SheikhMath = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const MAX_EXPRESSION_LENGTH = 240;
  const MAX_FACTORIAL = 170;
  const FUNCTION_NAMES = new Set([
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln',
    'sqrt', 'cbrt', 'abs', 'floor', 'ceil', 'round', 'exp'
  ]);

  // Sticky regex: number | name/constant | scientific-notation key | operator
  const TOKEN_RE = /\s*(?:(\d+(?:\.\d*)?|\.\d+)|(asin|acos|atan|sin|cos|tan|log|ln|sqrt|cbrt|abs|floor|ceil|round|exp|Ans|π|e)|(×10\^)|([()+\-−*×/÷%^!]))/y;

  class CalcError extends Error {}
  const fail = message => { throw new CalcError(message); };

  function tokenize(input) {
    if (typeof input !== 'string' || input.length > MAX_EXPRESSION_LENGTH) fail('Check expression');
    const tokens = [];
    TOKEN_RE.lastIndex = 0;
    let position = 0;
    while (position < input.length) {
      if (/^\s*$/.test(input.slice(position))) break;
      TOKEN_RE.lastIndex = position;
      const m = TOKEN_RE.exec(input);
      if (!m) fail('Invalid expression');
      position = TOKEN_RE.lastIndex;
      if (m[1] !== undefined) tokens.push({ type: 'num', value: Number(m[1]) });
      else if (m[2] !== undefined) {
        if (FUNCTION_NAMES.has(m[2])) tokens.push({ type: 'func', name: m[2] });
        else tokens.push({ type: 'const', name: m[2] });
      } else if (m[3] !== undefined) {
        // "×10^" means "times ten to the power of"
        tokens.push({ type: 'op', value: '*' }, { type: 'num', value: 10 }, { type: 'op', value: '^' });
      } else {
        const op = m[4] === '×' ? '*' : m[4] === '÷' ? '/' : m[4] === '−' ? '-' : m[4];
        tokens.push({ type: 'op', value: op });
      }
    }
    return insertImplicitMultiplication(tokens);
  }

  // 2π, (2+3)4, 3(4), 5!4, sin(30)cos(60), eπ ...
  function insertImplicitMultiplication(tokens) {
    const out = [];
    for (const token of tokens) {
      const prev = out[out.length - 1];
      if (prev) {
        const prevEnds = prev.type === 'num' || prev.type === 'const' ||
          (prev.type === 'op' && (prev.value === ')' || prev.value === '!'));
        const nextStarts = token.type === 'num' || token.type === 'const' || token.type === 'func' ||
          (token.type === 'op' && token.value === '(');
        if (prevEnds && nextStarts) {
          if (prev.type === 'num' && token.type === 'num') fail('Invalid expression');
          out.push({ type: 'op', value: '*' });
        }
      }
      out.push(token);
    }
    return out;
  }

  function factorial(n) {
    if (!Number.isInteger(n) || n < 0 || n > MAX_FACTORIAL) fail('Invalid factorial');
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  }

  // Remove floating-point noise such as sin(180°) = 1.2e-16
  const snapTrig = r => (Math.abs(r) < 1e-15 ? 0 : r);

  function evaluate(input, options) {
    const angleMode = (options && options.angleMode) || 'DEG';
    const answer = (options && Number.isFinite(options.answer)) ? options.answer : 0;
    const tokens = tokenize(input);
    if (!tokens.length) fail('Incomplete');
    let i = 0;
    const peek = () => tokens[i];
    const isOp = (t, v) => t && t.type === 'op' && t.value === v;
    const expectOp = v => { if (!isOp(tokens[i++], v)) fail(v === ')' ? 'Missing )' : 'Expected ' + v); };
    const toRad = x => (angleMode === 'DEG' ? (x % 360) * Math.PI / 180 : x);
    const fromRad = x => (angleMode === 'DEG' ? x * 180 / Math.PI : x);

    function applyFunction(name, v) {
      switch (name) {
        case 'sin': return snapTrig(Math.sin(toRad(v)));
        case 'cos': return snapTrig(Math.cos(toRad(v)));
        case 'tan': {
          const r = toRad(v);
          if (Math.abs(Math.cos(r)) < 1e-12) fail('Domain error');
          return snapTrig(Math.tan(r));
        }
        case 'asin': if (v < -1 || v > 1) fail('Domain error'); return fromRad(Math.asin(v));
        case 'acos': if (v < -1 || v > 1) fail('Domain error'); return fromRad(Math.acos(v));
        case 'atan': return fromRad(Math.atan(v));
        case 'log': if (v <= 0) fail('Domain error'); return Math.log10(v);
        case 'ln': if (v <= 0) fail('Domain error'); return Math.log(v);
        case 'sqrt': if (v < 0) fail('Domain error'); return Math.sqrt(v);
        case 'cbrt': return Math.cbrt(v);
        case 'abs': return Math.abs(v);
        case 'floor': return Math.floor(v);
        case 'ceil': return Math.ceil(v);
        case 'round': return Math.sign(v) * Math.round(Math.abs(v)); // half away from zero
        case 'exp': return Math.exp(v);
        default: return fail('Unexpected token');
      }
    }

    function primary() {
      const t = tokens[i++];
      if (!t) return fail('Incomplete');
      if (t.type === 'num') return t.value;
      if (t.type === 'const') return t.name === 'e' ? Math.E : t.name === 'π' ? Math.PI : answer;
      if (t.type === 'func') {
        expectOp('(');
        const v = add();
        expectOp(')');
        return applyFunction(t.name, v);
      }
      if (isOp(t, '(')) {
        const v = add();
        expectOp(')');
        return v;
      }
      return fail('Unexpected token');
    }
    function postfix() {
      let x = primary();
      while (isOp(peek(), '!')) { i++; x = factorial(x); }
      return x;
    }
    function power() {
      const x = postfix();
      if (isOp(peek(), '^')) { i++; return Math.pow(x, unary()); } // right-associative
      return x;
    }
    function unary() {
      if (isOp(peek(), '+')) { i++; return unary(); }
      if (isOp(peek(), '-')) { i++; return -unary(); }
      return power();
    }
    function mul() {
      let x = unary();
      while (isOp(peek(), '*') || isOp(peek(), '/') || isOp(peek(), '%')) {
        const op = tokens[i++].value;
        const y = unary();
        if ((op === '/' || op === '%') && y === 0) fail('Division by zero');
        x = op === '*' ? x * y : op === '/' ? x / y : x % y;
      }
      return x;
    }
    function add() {
      let x = mul();
      while (isOp(peek(), '+') || isOp(peek(), '-')) {
        const op = tokens[i++].value;
        const y = mul();
        const r = op === '+' ? x + y : x - y;
        // cancellation noise: 0.1 + 0.2 - 0.3 should be 0
        x = (r !== 0 && Math.abs(r) <= 1e-15 * Math.max(Math.abs(x), Math.abs(y))) ? 0 : r;
      }
      return x;
    }

    const out = add();
    if (i !== tokens.length) fail('Invalid expression');
    if (!Number.isFinite(out)) fail('Math error');
    return out;
  }

  function format(n) {
    if (!Number.isFinite(n)) fail('Math error');
    if (n === 0) return '0';
    const magnitude = Math.abs(n);
    let text;
    if (magnitude >= 1e12 || magnitude < 1e-9) {
      text = n.toExponential(11).replace(/\.?0+e/, 'e');
    } else {
      text = Number(n.toPrecision(12)).toString();
    }
    const sci = text.match(/^(.+)e([+-]?\d+)$/);
    return sci ? sci[1] + '×10^' + Number(sci[2]) : text;
  }

  return { evaluate, format, CalcError, MAX_EXPRESSION_LENGTH };
});
