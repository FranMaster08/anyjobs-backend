const SENSITIVE_KEYS = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'token',
  'password',
  'secret',
  'apikey',
  'apiKey',
  'client_secret',
  'refresh_token',
  'otp',
  'pin',
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)
  );
}

export function sanitizeForLogging<T>(value: T, maxDepth = 6): T {
  const seen = new WeakSet<object>();

  const visit = (v: unknown, depth: number): unknown => {
    if (depth > maxDepth) return '[MaxDepth]';
    if (v === null) return null;
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return v;
    if (typeof v === 'bigint') return v.toString();
    if (typeof v === 'undefined') return undefined;
    if (typeof v === 'function') return '[Function]';
    if (v instanceof Date) return v.toISOString();
    if (v instanceof Error) {
      return { name: v.name, message: v.message };
    }
    if (Array.isArray(v)) return v.map((x) => visit(x, depth + 1));
    if (!isPlainObject(v)) return '[NonPlainObject]';

    if (seen.has(v)) return '[Circular]';
    seen.add(v);

    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v)) {
      if (SENSITIVE_KEYS.has(k.toLowerCase())) {
        out[k] = '[REDACTED]';
      } else {
        out[k] = visit(val, depth + 1);
      }
    }
    return out;
  };

  return visit(value, 0) as T;
}

