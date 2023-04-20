import { Component } from '@angular/core';
import {ICellRendererAngularComp} from "ag-grid-angular";
import {ICellRendererParams} from "ag-grid-community";
import {Invoice} from "../../model/invoice";
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-eshop-order',
  templateUrl: './eshop-order.component.html',
  styleUrls: ['./eshop-order.component.scss']
})
export class EshopOrderComponent implements ICellRendererAngularComp  {

  rowData: Invoice;
  tooltip: string;

  constructor(private iconRegistry: MatIconRegistry,
              private sanitizer: DomSanitizer) {
    iconRegistry.addSvgIconLiteral('manual', this.sanitizer.bypassSecurityTrustHtml(`<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 96 960 960" width="24"><path style="fill:#3498DB" d="M120 976V176l60 60 60-60 60 60 60-60 60 60 60-60 60 60 60-60 60 60 60-60 60 60 60-60v800l-60-60-60 60-60-60-60 60-60-60-60 60-60-60-60 60-60-60-60 60-60-60-60 60Zm120-200h480v-80H240v80Zm0-160h480v-80H240v80Zm0-160h480v-80H240v80Zm-40 404h560V292H200v568Zm0-568v568-568Z"/></svg>`));
    iconRegistry.addSvgIconLiteral('eshop-order', this.sanitizer.bypassSecurityTrustHtml(`<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 96 960 960" width="24"><path style="fill:#F39C12" d="M280 976q-33 0-56.5-23.5T200 896q0-33 23.5-56.5T280 816q33 0 56.5 23.5T360 896q0 33-23.5 56.5T280 976Zm400 0q-33 0-56.5-23.5T600 896q0-33 23.5-56.5T680 816q33 0 56.5 23.5T760 896q0 33-23.5 56.5T680 976ZM246 336l96 200h280l110-200H246Zm-38-80h590q23 0 35 20.5t1 41.5L692 574q-11 20-29.5 31T622 616H324l-44 80h480v80H280q-45 0-68-39.5t-2-78.5l54-98-144-304H40v-80h130l38 80Zm134 280h280-280Z"/></svg>`));
  }

  agInit(params: ICellRendererParams): void {
    this.rowData = params.data;
  }

  refresh(params: ICellRendererParams<any>): boolean {
    return false;
  }

  getViewIcon(rowData: Invoice) {
    let result;
    switch (rowData.orderStatus) {
      case false:
        result = 'manual';
        this.tooltip = 'Vytvorená ručne'
        break
      case true:
        result = 'eshop-order';
        this.tooltip = 'Vytvorená cez E-shop'
        break
    }
    return result;
  }

}
