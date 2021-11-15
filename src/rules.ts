type typeName = 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';

function isDefined(v: unknown): boolean {
  return v !== null && v !== undefined;
}

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function isNumber(v: unknown): v is number {
  return typeof v === 'number' && !isNaN(v);
}

function isInteger(v: unknown): v is number {
  return isNumber(v) && (v as number) % 1 === 0;
}

function isBool(v: unknown): v is boolean {
  return typeof v === 'boolean';
}

function isArray(v: unknown): v is unknown[] {
  return Array.isArray(v);
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && !isArray(v);
}

function isType(v: unknown, t: typeName): boolean {
  switch (t) {
    case 'string':
      return isString(v);
    case 'integer':
      return isInteger(v);
    case 'number':
      return isNumber(v);
    case 'boolean':
      return isBool(v);
    case 'array':
      return isArray(v);
    case 'object':
      return isObject(v);
  }
}

const EMPTY_STRING_REGEXP = /^\s*$/;

function isBlank(v: unknown): boolean {
  if (!isDefined(v)) {
    return true;
  }
  if (isString(v)) {
    return EMPTY_STRING_REGEXP.test(v as string);
  }
  if (isNumber(v) || isBool(v)) {
    return false;
  }
  if (isArray(v)) {
    return v.length === 0;
  }
  if (isObject(v)) {
    return Object.keys(v).length === 0;
  }

  return true;
}

const HANDLEBARS = /\{\{(\w+)\}\}/g;

function interpolate(s: string, subs: { [key: string]: string }): string {
  return s.replace(HANDLEBARS, (_: string, m: string) => {
    return String(subs[m]);
  });
}

function conjunctionOf(rule: Rule | Rule[]): Rule {
  if (!isArray(rule)) {
    return rule;
  }

  return (v: unknown): string | true => {
    for (const r of rule) {
      const res = r(v);
      if (res !== true) {
        return res;
      }
    }
    return true;
  };
}

// --------------------------------------------------------------------

export type Rule = (v: unknown) => string | true;

export function presence(message = "can't be blank"): Rule {
  return (v: unknown): string | true => {
    if (isBlank(v)) {
      return message;
    }
    return true;
  };
}

export function numericality(opts: { min?: number; max?: number }): Rule {
  return (v: unknown): string | true => {
    if (!isDefined(v) || !isNumber(v)) return true;

    const num = v as number;
    if (opts.min != null && num < opts.min) {
      return `must be greater or equal ${opts.min}`;
    }
    if (opts.max != null && num > opts.max) {
      return `must be less or equal ${opts.max}`;
    }
    return true;
  };
}

export function length(opts: { min?: number; max?: number; is?: number }): Rule {
  return (v: unknown): string | true => {
    if (!isDefined(v)) return true;

    let length: number | undefined;
    if (isString(v)) {
      length = v.length;
    } else if (isArray(v)) {
      length = v.length;
    }

    if (length !== undefined) {
      if (opts.min != null && length < opts.min) {
        return `is too short (minimum is ${opts.min} characters)`;
      }
      if (opts.max != null && length > opts.max) {
        return `is too long (maximum is ${opts.max} characters)`;
      }
      if (opts.is != null && length != opts.is) {
        return `is the wrong length (should be ${opts.is} characters)`;
      }
    }
    return true;
  };
}

export function inclusion(values: unknown[], message = 'must be one of: {{values}}'): Rule {
  values.sort();

  return (v: unknown): string | true => {
    if (isDefined(v) && values.indexOf(v) < 0) {
      return interpolate(message, { values: values.join(', ') });
    }
    return true;
  };
}

export function format(pattern: RegExp, message = 'is invalid'): Rule {
  return (v: unknown): string | true => {
    if (isBlank(v)) {
      return true;
    }
    if (isString(v) && !pattern.test(v as string)) {
      return message;
    }
    return true;
  };
}

export function typeOf(type: typeName, message?: string): Rule {
  return (v: unknown): string | true => {
    if (!isDefined(v) || v === '' || isType(v, type)) {
      return true;
    }
    if (message != null) {
      return message;
    } else if (type === 'integer' || type === 'array' || type === 'object') {
      return `is not an ${type}`;
    }
    return `is not a ${type}`;
  };
}

export function every(rules: Rule[], message?: string): Rule {
  return (v: unknown): string | true => {
    if (!isDefined(v) || !isArray(v)) {
      return true;
    }

    for (const entry of v) {
      for (const rule of rules) {
        const res = rule(entry);
        if (res !== true) {
          return message != null ? message : res;
        }
      }
    }
    return true;
  };
}

export function or(rules: (Rule | Rule[])[], message?: string): Rule {
  return (v: unknown): string | true => {
    if (rules.length == 0) {
      return true;
    }

    const summary: string[] = [];
    for (const rs of rules) {
      const res = conjunctionOf(rs)(v);
      if (res === true) {
        return true;
      }
      summary.push(res);
    }
    return message != null ? message : 'is invalid: ' + summary.join(', ');
  };
}

export function dig(field: string | string[], rule: Rule | Rule[]): Rule {
  const fields = isArray(field) ? field : [field];
  const rules = conjunctionOf(rule);

  return (v: unknown): string | true => {
    if (!isDefined(v) || !isObject(v)) {
      return true;
    }

    let fv: unknown | undefined = v;
    for (const field of fields) {
      if (fv != null && isObject(fv) && field in fv) {
        fv = fv[field];
      } else {
        fv = undefined;
        break;
      }
    }
    return rules(fv);
  };
}
