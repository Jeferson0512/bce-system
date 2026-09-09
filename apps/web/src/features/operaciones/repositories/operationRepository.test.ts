import { describe, expect, it } from 'vitest';
import { JsonOperationRepository } from '../../../../../../packages/data-access/json/src/operationRepository';

describe('JsonOperationRepository', () => {
  it('returns copies and stores new operations', () => {
    const repository = new JsonOperationRepository();
    const initial = repository.list();
    const savedOperation = {
      reference: 'OP-2026-00483',
      applicant: 'Diego Pérez',
      service: 'Impresión B/N',
      amount: 3,
      status: 'Pendiente' as const,
      time: '11:00 a. m.',
    };

    repository.save(savedOperation);
    const result = repository.list();

    expect(result).toHaveLength(initial.length + 1);
    expect(result[result.length - 1]).toEqual(savedOperation);
    result[0].applicant = 'Modificación aislada';
    expect(repository.list()[0].applicant).not.toBe('Modificación aislada');
  });
});
