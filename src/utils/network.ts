const IPV4_REGEX =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

export function isValidIPv4(value: string): boolean {
  return IPV4_REGEX.test(value.trim());
}

/**
 * Parse une saisie "host" ou "host:port" en composantes.
 * Retourne null si l'adresse IP est invalide.
 */
export function parseHostAddress(
  input: string,
  defaultPort: number,
): {host: string; port: number} | null {
  const trimmed = input.trim();
  const [host, portPart] = trimmed.split(':');

  if (!isValidIPv4(host)) {
    return null;
  }

  let port = defaultPort;
  if (portPart !== undefined) {
    const parsed = Number(portPart);
    if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
      return null;
    }
    port = parsed;
  }

  return {host, port};
}

/**
 * Sélectionne une adresse IPv4 routable parmi les adresses publiées par
 * Zeroconf (ignore loopback et IPv6).
 */
export function pickLanAddress(addresses: string[]): string | null {
  const ipv4 = addresses.find(
    addr => isValidIPv4(addr) && addr !== '127.0.0.1',
  );
  return ipv4 ?? null;
}
