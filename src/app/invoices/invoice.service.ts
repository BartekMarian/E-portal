import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Invoice} from "../model/invoice";
import {Unit} from "../model/unit";

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(
    private http: HttpClient) {
  }

  // listInvoices(): Observable< Invoice[]> {
  //   return this.http.get<Invoice[]>('api/invoices');
  // }
  // listUnits(): Observable< Unit[]> {
  //   return this.http.get<Unit[]>('api/units');
  // }
  // saveInvoice(dto: Invoice): Observable<Invoice> {
  //   return this.http.put<Invoice>('api/invoice', dto);
  // }
}
