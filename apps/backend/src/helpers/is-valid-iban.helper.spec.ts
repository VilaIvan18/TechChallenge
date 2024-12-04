import { isValidIban } from './is-valid-iban.helper';

describe('IBAN Validation', () => {
  it('should return true for valid IBANs', () => {
    expect(isValidIban('DE89370400440532013000')).toBe(true); // Germany (valid IBAN)
    expect(isValidIban('GB29NWBK60161331926819')).toBe(true); // UK (valid IBAN)
    expect(isValidIban('FR1420041010050500013M02606')).toBe(true); // France (valid IBAN)
  });

  it('should return false for invalid IBANs', () => {
    expect(isValidIban('DE89370400440532013001')).toBe(false); // Invalid checksum
    expect(isValidIban('GB29NWBK6016133192681X')).toBe(false); // Invalid IBAN structure
    expect(isValidIban('FR1420041010050500013M0260Z')).toBe(false); // Invalid IBAN structure
    expect(isValidIban('1234567890')).toBe(false); // Invalid IBAN (incorrect format)
    expect(isValidIban('DE89 3704 0044 0532 0130 0001')).toBe(false); // Invalid IBAN (incorrect checksum)
  });
});
