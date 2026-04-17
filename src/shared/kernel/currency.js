export function parsePrice(value) {
  if (!value) return 0;
  return (
    parseFloat(
      String(value)
        .replace(/[R$\s]/g, '')
        .replace(/\./g, '')
        .replace(',', '.')
    ) || 0
  );
}

export function formatPrice(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
