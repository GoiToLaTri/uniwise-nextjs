export const DEFAULT_CURRENCY = "VND";

export function normalizeCurrencyCode(currency?: string | null): string {
  return currency?.trim().toUpperCase() || DEFAULT_CURRENCY;
}

export function formatCurrencyAmount(
  amount: number,
  currency?: string | null,
): string {
  return `${new Intl.NumberFormat("vi-VN").format(amount)} ${normalizeCurrencyCode(currency)}`;
}
