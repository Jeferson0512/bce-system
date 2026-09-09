import type { OperationRepository } from '../../../application/src/ports/OperationRepository';
import type { Operation } from '../../../domain/src';
import { demoOperations } from './demoData';

export class JsonOperationRepository implements OperationRepository {
  private operations: Operation[] = demoOperations.map((operation) => ({ ...operation }));

  list(): Operation[] {
    return this.operations.map((operation) => ({ ...operation }));
  }

  save(operation: Operation): void {
    this.operations = [...this.operations, { ...operation }];
  }
}

export const operationRepository = new JsonOperationRepository();
