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
