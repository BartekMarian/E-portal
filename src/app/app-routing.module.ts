import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {InvoicesComponent} from "./invoices/invoices.component";
import {AppComponent} from "./app.component";
import {CustomersComponent} from "./customers/customers/customers.component";

const routes: Routes = [
  { path: '', redirectTo:"/invoices", pathMatch:"full" },
  { path: 'invoices', component: InvoicesComponent },
  { path: 'customers', component: CustomersComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
