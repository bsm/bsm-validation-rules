type Primitive = string | number | boolean | null | undefined;

type typeName = 'string' | 'number' | 'integer' | 'boolean';

function isDefined(v: Primitive): boolean {
  return v !== null && v !== undefined;
}

function isString(v: Primitive): boolean {
  return typeof v === 'string';
}

function isNumber(v: Primitive): boolean {
  return typeof v === 'number' && !isNaN(v);
}

function isInteger(v: Primitive): boolean {
  return isNumber(v) && (v as number) % 1 === 0;
}

function isType(v: Primitive, t: typeName): boolean {
  switch (t) {
    case 'string':
      return isString(v);
    case 'integer':
      return isInteger(v);
    case 'number':
      return isNumber(v);
    case 'boolean':
      return typeof v == 'boolean';
  }
}

const EMPTY_STRING_REGEXP = /^\s*$/;

function isBlank(v: Primitive): boolean {
  if (!isDefined(v)) {
    return true;
  }
  if (isString(v)) {
    return EMPTY_STRING_REGEXP.test(v as string);
  }
  if (isNumber(v) || typeof v === 'boolean') {
    return false;
  }
  return true;
}

const HANDLEBARS = /\{\{(\w+)\}\}/g;

function interpolate(s: string, subs: { [key: string]: string }): string {
  return s.replace(HANDLEBARS, (_: string, m: string) => {
    return String(subs[m]);
  });
}

// --------------------------------------------------------------------

export type Rule = (v: Primitive) => string | true;

export function presence(message = "can't be blank"): Rule {
  return (v: Primitive): string | true => {
    if (isBlank(v)) {
      return message;
    }
    return true;
  };
}

export function numericality(opts: { min?: number; max?: number }): Rule {
  return (v: Primitive): string | true => {
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
  return (v: Primitive): string | true => {
    if (!isDefined(v) || !isString(v)) return true;

    const str = v as string;
    if (opts.min != null && str.length < opts.min) {
      return `is too short (minimum is ${opts.min} characters)`;
    }
    if (opts.max != null && str.length > opts.max) {
      return `is too long (maximum is ${opts.max} characters)`;
    }
    if (opts.is != null && str.length != opts.is) {
      return `is the wrong length (should be ${opts.is} characters)`;
    }
    return true;
  };
}

export function inclusion(values: string[], message = 'must be one of: {{values}}'): Rule {
  values.sort();

  return (v: Primitive): string | true => {
    if (isDefined(v) && values.indexOf(v as never) < 0) {
      return interpolate(message, { values: values.join(', ') });
    }
    return true;
  };
}

export function format(pattern: RegExp, message = 'is invalid'): Rule {
  return (v: Primitive): string | true => {
    if (isString(v) && !pattern.test(v as string)) {
      return message;
    }
    return true;
  };
}

export function typeOf(type: typeName, message?: string): Rule {
  return (v: Primitive): string | true => {
    if (!isDefined(v) || isType(v, type)) {
      return true;
    }
    if (message != null) {
      return message;
    } else if (type === 'integer') {
      return `is not an ${type}`;
    }
    return `is not a ${type}`;
  };
}
