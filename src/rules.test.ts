import { presence, numericality, length, inclusion, format, typeOf, Rule } from './rules';

describe('presence', () => {
  let subject: Rule;

  beforeEach(() => {
    subject = presence();
  });

  it('should validate', () => {
    expect(subject(undefined)).toEqual("can't be blank");
    expect(subject(null)).toEqual("can't be blank");
    expect(subject('')).toEqual("can't be blank");
    expect(subject(' ')).toEqual("can't be blank");
    expect(subject('\t')).toEqual("can't be blank");

    expect(subject('foo')).toBe(true);
    expect(subject(123)).toBe(true);
    expect(subject(0)).toBe(true);
    expect(subject(true)).toBe(true);
    expect(subject(false)).toBe(true);
  });
});

describe('numericality', () => {
  let subject: Rule;

  beforeEach(() => {
    subject = numericality({});
  });

  it('should validate', () => {
    expect(subject(undefined)).toBe(true);
    expect(subject(null)).toBe(true);
    expect(subject(0)).toBe(true);
    expect(subject(123)).toBe(true);
    expect(subject(-123)).toBe(true);
    expect(subject(1.23)).toBe(true);
    expect(subject(-1.23)).toBe(true);
    expect(subject('')).toBe(true);
    expect(subject('foo')).toBe(true);
    expect(subject(true)).toBe(true);
    expect(subject(false)).toBe(true);
  });

  it('should validate minimum', () => {
    subject = numericality({ min: 1 });
    expect(subject(-1)).toEqual('must be greater or equal 1');
    expect(subject(0)).toEqual('must be greater or equal 1');
    expect(subject(0.999)).toEqual('must be greater or equal 1');
    expect(subject(1)).toBe(true);
    expect(subject(2)).toBe(true);
  });

  it('should validate maximum', () => {
    subject = numericality({ max: 1 });
    expect(subject(-1)).toBe(true);
    expect(subject(0)).toBe(true);
    expect(subject(1)).toBe(true);
    expect(subject(1.001)).toEqual('must be less or equal 1');
    expect(subject(2)).toEqual('must be less or equal 1');
  });
});

describe('length', () => {
  let subject: Rule;

  beforeEach(() => {
    subject = length({ min: 3, max: 5 });
  });

  it('should validate', () => {
    expect(subject(undefined)).toBe(true);
    expect(subject(null)).toBe(true);
    expect(subject(0)).toBe(true);
    expect(subject('foo')).toBe(true);
    expect(subject('barz')).toBe(true);
    expect(subject('')).toEqual('is too short (minimum is 3 characters)');
    expect(subject('no')).toEqual('is too short (minimum is 3 characters)');
    expect(subject('foobar')).toEqual('is too long (maximum is 5 characters)');
  });

  it('should validate is', () => {
    subject = length({ is: 3 });
    expect(subject('foo')).toBe(true);
    expect(subject('foobar')).toEqual('is the wrong length (should be 3 characters)');
  });
});

describe('format', () => {
  let subject: Rule;

  beforeEach(() => {
    subject = format(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should validate', () => {
    // ignore nulls
    expect(subject(undefined)).toBe(true);
    expect(subject(null)).toBe(true);

    // ignore non-strings - use typeOf for those
    expect(subject(123)).toBe(true);
    expect(subject(true)).toBe(true);
    expect(subject(false)).toBe(true);

    // validate strings
    expect(subject('2020-02-20')).toBe(true);
    expect(subject('2020-02-20\n')).toEqual('is invalid');
    expect(subject('20-02-20')).toEqual('is invalid');
    expect(subject('')).toEqual('is invalid');
    expect(subject('foo')).toEqual('is invalid');
  });
});

describe('inclusion', () => {
  let subject: Rule;

  beforeEach(() => {
    subject = inclusion(['foo', 'bar']);
  });

  it('should validate', () => {
    expect(subject(undefined)).toBe(true);
    expect(subject(null)).toBe(true);
    expect(subject('foo')).toBe(true);
    expect(subject('bar')).toBe(true);
    expect(subject('baz')).toEqual(`must be one of: bar, foo`);
    expect(subject('')).toEqual(`must be one of: bar, foo`);
    expect(subject(123)).toEqual(`must be one of: bar, foo`);
    expect(subject(0)).toEqual(`must be one of: bar, foo`);
    expect(subject(true)).toEqual(`must be one of: bar, foo`);
    expect(subject(false)).toEqual(`must be one of: bar, foo`);
  });
});

describe('typeOf', () => {
  let subject: Rule;

  beforeEach(() => {
    subject = typeOf('string');
  });

  it('should validate (string)', () => {
    expect(subject(undefined)).toBe(true);
    expect(subject(null)).toBe(true);
    expect(subject('')).toBe(true);
    expect(subject('foo')).toBe(true);
    expect(subject(123)).toEqual(`is not a string`);
    expect(subject(true)).toEqual(`is not a string`);
    expect(subject(false)).toEqual(`is not a string`);
  });

  it('should validate (integer)', () => {
    subject = typeOf('integer');

    expect(subject(undefined)).toBe(true);
    expect(subject(null)).toBe(true);
    expect(subject('')).toBe(true);
    expect(subject(0)).toBe(true);
    expect(subject(1)).toBe(true);
    expect(subject(-1)).toBe(true);
    expect(subject(1.2)).toEqual(`is not an integer`);
    expect(subject('foo')).toEqual(`is not an integer`);
    expect(subject(true)).toEqual(`is not an integer`);
    expect(subject(false)).toEqual(`is not an integer`);
  });
});
