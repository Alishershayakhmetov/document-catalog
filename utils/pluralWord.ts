export function pluralize(n: number, forms: string[]) {
  const lastDigit = n % 10;
  const lastTwoDigits = n % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return `${n} ${forms[2]}`;
  if (lastDigit === 1) return `${n} ${forms[0]}`;
  if (lastDigit >= 2 && lastDigit <= 4) return `${n} ${forms[1]}`;
  
  return `${n} ${forms[2]}`;
}