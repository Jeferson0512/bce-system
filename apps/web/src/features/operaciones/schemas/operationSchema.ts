import { z } from 'zod';

export const operationSchema = z.object({
  applicant: z.string().trim().min(2, 'Ingresa el nombre del solicitante'),
  service: z.string().min(1, 'Selecciona un servicio'),
  quantity: z.number().int().positive('La cantidad debe ser mayor que cero'),
});

export type OperationFormValues = z.infer<typeof operationSchema>;
