export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);

export const formatCurrencyDetailed = (value: number): string =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export const formatHours = (value: number): string =>
  `${value.toFixed(1).replace(".", ",")} h`;

export const formatPercent = (value: number): string =>
  `${(value * 100).toFixed(1).replace(".", ",")} %`;
