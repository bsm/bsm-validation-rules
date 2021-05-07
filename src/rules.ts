type Primitive = string | number | boolean | null | undefined;

type Value = Primitive | Primitive[];

type typeName = 'string' | 'number' | 'integer' | 'boolean' | 'array';

function isDefined(v: Value): boolean {
  return v !== null && v !== undefined;
}

function isString(v: Value): v is string {
  return typeof v === 'string';
}

function isNumber(v: Value): v is number {
  return typeof v === 'number' && !isNaN(v);
}

function isInteger(v: Value): v is number {
  return isNumber(v) && (v as number) % 1 === 0;
}

function isBool(v: Value): v is boolean {
  return typeof v === 'boolean';
}

function isArray(v: Value): v is Primitive[] {
  return Array.isArray(v);
}

function isType(v: Value, t: typeName): boolean {
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
  }
}

const EMPTY_STRING_REGEXP = /^\s*$/;

function isBlank(v: Value): boolean {
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

  return true;
}

const HANDLEBARS = /\{\{(\w+)\}\}/g;

function interpolate(s: string, subs: { [key: string]: string }): string {
  return s.replace(HANDLEBARS, (_: string, m: string) => {
    return String(subs[m]);
  });
}

// --------------------------------------------------------------------

export type Rule = (v: Value) => string | true;

type RuleSet = Rule | Rule[];

export function presence(message = "can't be blank"): Rule {
  return (v: Value): string | true => {
    if (isBlank(v)) {
      return message;
    }
    return true;
  };
}

export function numericality(opts: { min?: number; max?: number }): Rule {
  return (v: Value): string | true => {
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
  return (v: Value): string | true => {
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

export function inclusion(values: Primitive[], message = 'must be one of: {{values}}'): Rule {
  values.sort();

  return (v: Value): string | true => {
    if (isDefined(v) && values.indexOf(v as Primitive) < 0) {
      return interpolate(message, { values: values.join(', ') });
    }
    return true;
  };
}

export function format(pattern: RegExp, message = 'is invalid'): Rule {
  return (v: Value): string | true => {
    if (isString(v) && !pattern.test(v as string)) {
      return message;
    }
    return true;
  };
}

export function typeOf(type: typeName, message?: string): Rule {
  return (v: Value): string | true => {
    if (!isDefined(v) || v === '' || isType(v, type)) {
      return true;
    }
    if (message != null) {
      return message;
    } else if (type === 'integer' || type === 'array') {
      return `is not an ${type}`;
    }
    return `is not a ${type}`;
  };
}

export function every(rules: Rule[], message?: string): Rule {
  return (v: Value): string | true => {
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

export function or(rules: RuleSet[], message?: string): Rule {
  return (v: Value): string | true => {
    if (rules.length == 0) {
      return true;
    }

    const summary: string[] = [];
    for (let ruleSet of rules) {
      if (!Array.isArray(ruleSet)) {
        ruleSet = [ruleSet];
      }

      let res: string | true = true;
      for (const rule of ruleSet) {
        res = rule(v);
        if (res !== true) {
          break;
        }
      }

      if (res === true) {
        return true;
      }
      summary.push(res);
    }
    return message != null ? message : 'is invalid: ' + summary.join(', ');
  };
}
