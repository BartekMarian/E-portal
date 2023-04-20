import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AgGridModule} from "ag-grid-angular";
import {HttpClientModule} from "@angular/common/http";
import {InvoicesComponent} from './invoices/invoices.component';
import {InvoiceService} from "./invoices/invoice.service";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatTreeModule} from "@angular/material/tree";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {AngularSplitModule} from "angular-split";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatMenuModule} from "@angular/material/menu";
import {NgSelectModule} from "@ng-select/ng-select";
import {MatBadgeModule} from "@angular/material/badge";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatDialogModule} from "@angular/material/dialog";
import {MatListModule} from "@angular/material/list";
import {MatTooltipModule} from "@angular/material/tooltip";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatRadioModule} from "@angular/material/radio";
import {MatNativeDateModule} from "@angular/material/core";
import {ItemComponent} from './invoices/item/item.component';
import {GridDateEditorComponent} from "./cell-renderers/grid-date-editor/grid-date-editor.component";
import {GridSelectEditorComponent} from "./cell-renderers/grid-select-editor/grid-select-editor.component";
import {MatSelectModule} from "@angular/material/select";
import {GeneratePdfButtonComponent} from "./cell-renderers/generate-pdf-button/generate-pdf-button.component";
import {LoggerModule} from "ngx-logger";
import {environment} from "../enviroments/enviroment";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {RouterModule} from "@angular/router";
import { CustomersComponent } from './customers/customers/customers.component';
import { EshopOrderComponent } from './cell-renderers/eshop-order/eshop-order.component';

@NgModule({
  declarations: [
    AppComponent,
    InvoicesComponent,
    ItemComponent,
    GridDateEditorComponent,
    GridSelectEditorComponent,
    GeneratePdfButtonComponent,
    CustomersComponent,
    EshopOrderComponent,
  ],
  imports: [
    // BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserModule,
    AppRoutingModule,
    AgGridModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatCardModule,
    MatIconModule,
    MatToolbarModule,
    MatTreeModule,
    MatDatepickerModule,
    AngularSplitModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatButtonModule,
    MatListModule,
    MatTooltipModule,
    MatMenuModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatDialogModule,
    MatBadgeModule,
    MatRadioModule,
    NgSelectModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSnackBarModule,
    MatSidenavModule,
    RouterModule,
    LoggerModule.forRoot(environment.logging),
  ],
  providers: [
    InvoiceService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
