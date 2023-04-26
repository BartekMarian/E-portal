import {Item} from "./item";
import {Customer} from "./customer";
import {Supplier} from "./supplier";

export class Invoice {
  id: number;
  invoiceNumber: number;
  status: number;
  subtotal: number;
  vat: number;
  created: Date;
  updated: Date;
  paymentId: number;
  dateOfPayment: Date;
  supplier: Supplier;
  deliveryId: number;
  total: number;
  discount: number;
  currencyId: number;
  paymentMethod: number;
  customer: Customer;
  items: Item [];
  orderStatus: boolean;
}
