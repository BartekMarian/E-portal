import {Item} from "./item";

export class Invoice {
  id: number;
  invoiceNumber: string;
  status: number;
  subtotal: number;
  vat: number;
  created: Date;
  updated: Date;
  paymentId: number;
  dateOfPayment: Date;
  supplierId: number;
  customerId: number;
  deliveryId: number;
  total: number;
  discount: number;
  currencyId: number;
  items: Item [];
}
