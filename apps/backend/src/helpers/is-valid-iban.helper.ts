export function isValidIban(iban: string): boolean {
  const regex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;
  return regex.test(iban);
}
