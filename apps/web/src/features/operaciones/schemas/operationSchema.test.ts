import { describe, expect, it } from 'vitest';
import { operationSchema } from './operationSchema';

describe('operationSchema', () => {
  it('accepts a valid operation', () => {
    const result = operationSchema.safeParse({
      applicant: 'María López',
      service: 'Impresión A4',
      quantity: 2,
    });

    expect(result.success).toBe(true);
  });

  it('rejects empty applicants and non-positive quantities', () => {
    const result = operationSchema.safeParse({
      applicant: 'A',
      service: '',
      quantity: 0,
    });

    expect(result.success).toBe(false);
  });
});
