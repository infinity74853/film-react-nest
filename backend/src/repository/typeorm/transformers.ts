import { ValueTransformer } from 'typeorm';

export const arrayTransformer: ValueTransformer = {
  to: (value: string[] | null): string | null => {
    if (!value || value.length === 0) return '';
    return value.join(',');
  },
  from: (value: string | null): string[] => {
    if (!value) return [];
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item !== '');
  },
};

export const numberTransformer: ValueTransformer = {
  to: (value: number | null): number | null => value,
  from: (value: string | null): number | null =>
    value === null ? null : parseFloat(value),
};
