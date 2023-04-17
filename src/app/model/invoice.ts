import {Item} from "./item";
import {Customer} from "./customer";

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
  deliveryId: number;
  total: number;
  discount: number;
  currencyId: number;
  customer: Customer;
  items: Item [];
}
