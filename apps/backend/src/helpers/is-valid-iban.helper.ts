export function isValidIban(iban: string): boolean {
  iban = iban.replace(/\s+/g, '').toUpperCase();

  const regex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;
  if (!regex.test(iban)) {
    return false;
  }

  const rearrangedIban = iban.slice(4) + iban.slice(0, 4);

  const numericIban = rearrangedIban
    .split('')
    .map((char) => {
      return char.match(/[A-Z]/) ? (char.charCodeAt(0) - 55).toString() : char;
    })
    .join('');

  const mod97 = BigInt(numericIban) % 97n;
  return mod97 === 1n;
}
