export const fromLocalToUtc = (localDateString: string | undefined): string => {
  if (!localDateString) return '';
  const localDate = new Date(localDateString);
  const offset = localDate.getTimezoneOffset();
  const date = new Date(localDate.getTime() + offset * 60 * 1000);
  return date.toISOString();
};

export const fromUtcToLocalDateTime = (utcDateString: string | undefined): string => {
  if (!utcDateString) return '';
  const date = new Date(utcDateString);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

export const fromUtcToLocalDate = (utcDateString: string | undefined): string => {
  if (!utcDateString) return '';
  const date = new Date(utcDateString);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 10);
};

export const formatLocalDate = (utcDatetime: string | undefined) => {
  if (!utcDatetime) return '';
  const date = new Date(utcDatetime + 'Z');
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatLocalDateTime = (utcDatetime: string | undefined) => {
  if (!utcDatetime) return '';
  const date = new Date(utcDatetime + 'Z');
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};