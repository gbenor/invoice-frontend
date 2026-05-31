export function getTodayDateInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function toDateInputValue(value) {
  if (!value) return '';

  if (typeof value === 'string') {
    const dateOnlyMatch = value.match(/^\d{4}-\d{2}-\d{2}/);
    if (dateOnlyMatch) return dateOnlyMatch[0];
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getDateInputValueOrToday(value) {
  return toDateInputValue(value) || getTodayDateInputValue();
}
