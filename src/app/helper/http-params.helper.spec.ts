import { buildHttpParams } from './http-params.helper';

describe('buildHttpParams', () => {
  it('should build params from object', () => {
    const params = buildHttpParams({ pageNumber: 1, pageSize: 10 });
    expect(params.get('pageNumber')).toBe('1');
    expect(params.get('pageSize')).toBe('10');
  });

  it('should omit null and undefined', () => {
    const params = buildHttpParams({ a: 1, b: undefined, c: null } as Record<string, unknown>);
    expect(params.has('a')).toBe(true);
    expect(params.has('b')).toBe(false);
    expect(params.has('c')).toBe(false);
  });
});
