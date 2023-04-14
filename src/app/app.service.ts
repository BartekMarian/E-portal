import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {Invoice} from "./model/invoice";
import {Unit} from "./model/unit";
import {NGXLogger} from "ngx-logger";


@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor( private http: HttpClient,
               private logger: NGXLogger) {

  }

  listInvoices(): Observable< Invoice[]> {
    return this.http.get<Invoice[]>('api/invoices');
  }

  listUnits(): Observable< Unit[]> {
    return this.http.get<Unit[]>('api/units');
  }

  saveInvoice(dto: Invoice): Observable<Invoice> {
    return this.http
      .put<Invoice>('api/invoice', dto).pipe(map((res: Invoice) =>{
      this.logger.debug("Received Response: ", res)
        return res
    }));
  }
}
