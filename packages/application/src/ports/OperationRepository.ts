import type { Operation } from '../../../domain/src';

export interface OperationRepository {
  list(): Operation[];
  save(operation: Operation): void;
}
