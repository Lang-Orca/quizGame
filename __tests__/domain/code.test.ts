import {genererCode6, isValidCode6} from '@/domain/code';

describe('genererCode6', () => {
  it('génère un code de 6 caractères valides', () => {
    const code = genererCode6();
    expect(code).toHaveLength(6);
    expect(isValidCode6(code)).toBe(true);
  });
});
