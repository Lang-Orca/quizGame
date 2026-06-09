import {isValidIPv4, parseHostAddress, pickLanAddress} from '@/utils/network';

describe('network utils', () => {
  it('valide les adresses IPv4', () => {
    expect(isValidIPv4('192.168.1.42')).toBe(true);
    expect(isValidIPv4('10.0.0.1')).toBe(true);
    expect(isValidIPv4('256.1.1.1')).toBe(false);
    expect(isValidIPv4('abc')).toBe(false);
  });

  it('parse host et host:port', () => {
    expect(parseHostAddress('192.168.1.42', 41234)).toEqual({
      host: '192.168.1.42',
      port: 41234,
    });
    expect(parseHostAddress('192.168.1.42:8080', 41234)).toEqual({
      host: '192.168.1.42',
      port: 8080,
    });
    expect(parseHostAddress('pasuneip', 41234)).toBeNull();
    expect(parseHostAddress('192.168.1.42:99999', 41234)).toBeNull();
  });

  it('sélectionne une adresse LAN routable', () => {
    expect(pickLanAddress(['127.0.0.1', '192.168.1.10'])).toBe('192.168.1.10');
    expect(pickLanAddress(['127.0.0.1'])).toBeNull();
  });
});
