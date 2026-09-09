import type { OperationStatus } from '../../../../../packages/domain/src/index';

export function StatusBadge({ status }: { status: OperationStatus }) {
  return <span className={`status ${status === 'Pagado' ? 'paid' : 'pending'}`}>{status}</span>;
}
