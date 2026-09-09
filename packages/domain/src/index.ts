export type OperationStatus = 'Pagado' | 'Pendiente' | 'Anulado';
export type PaymentMethod = 'Efectivo' | 'Yape' | 'Plin' | 'Transferencia';

export interface Operation {
  reference: string;
  applicant: string;
  service: string;
  amount: number;
  status: OperationStatus;
  time: string;
  date?: string;
  requesterType?: 'profesor' | 'alumno' | 'direccion';
  requesterId?: string;
  notes?: string;
  items?: OperationItem[];
  paymentStatus?: 'Sin pago' | 'Pendiente' | 'Pagado';
}

export interface OperationItem {
  serviceId: string;
  service: string;
  salonId?: string;
  salon?: string;
  quantity: number;
  copies?: number;
  unitPrice: number;
  subtotal: number;
  personal: boolean;
}

export interface Payment {
  reference: string;
  operationReference: string;
  amount: number;
  method: PaymentMethod;
  validated: boolean;
}
