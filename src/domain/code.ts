import {CODE_LENGTH} from '@/constants';

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function genererCode6(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    const index = Math.floor(Math.random() * CHARSET.length);
    code += CHARSET[index];
  }
  return code;
}

export function isValidCode6(code: string): boolean {
  if (code.length !== CODE_LENGTH) {
    return false;
  }
  return [...code].every(char => CHARSET.includes(char));
}
