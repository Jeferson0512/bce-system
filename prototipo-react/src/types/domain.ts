export type PaymentMethod = 'Efectivo' | 'Yape' | 'Plin' | 'Transferencia';

export type OperationStatus = 'Pagado' | 'Pendiente' | 'Anulado';

export interface Operation {
  reference: string;
  applicant: string;
  service: string;
  amount: number;
  status: OperationStatus;
  time: string;
}

export interface Payment {
  reference: string;
  operationReference: string;
  amount: number;
  method: PaymentMethod;
  validated: boolean;
}
