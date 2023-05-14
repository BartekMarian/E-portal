import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {Invoice} from "./model/invoice";
import {Unit} from "./model/unit";
import {NGXLogger} from "ngx-logger";
import {Customer} from "./model/customer";
import {Supplier} from "./model/supplier";


@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private http: HttpClient,
              private logger: NGXLogger) {

  }

  listInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>('api/invoices');
  }

  getLastInvoiceNumber(): Observable<Invoice> {
    return this.http.get<Invoice>('api/invoices/last');
  }

  listUnits(): Observable<Unit[]> {
    return this.http.get<Unit[]>('api/units');
  }

  saveInvoice(dto: Invoice): Observable<Invoice> {
    return this.http
      .put<Invoice>('api/invoice', dto).pipe(map((res: Invoice) => {
        this.logger.debug("Received Response: ", res)
        return res
      }));
  }

  deleteInvoice(id: number): Observable<Invoice> {
    return this.http.delete<Invoice>('api/invoice/'+id);
  }

  createPdf(data: Invoice): Observable<Invoice> {
    return this.http.put<Invoice>('api/pdf/generate', data);
  };

  listCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>('api/customers');
  }

  listSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>('api/suppliers');
  }

}
