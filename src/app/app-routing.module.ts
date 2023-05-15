import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {InvoicesComponent} from "./invoices/invoices.component";
import {CustomersComponent} from "./customers/customers/customers.component";
import {SuppliersComponent} from "./suppliers/suppliers.component";

const routes: Routes = [
  { path: '', redirectTo:"/invoices", pathMatch:"full" },
  { path: 'invoices', component: InvoicesComponent },
  { path: 'customers', component: CustomersComponent },
  { path: 'suppliers', component: SuppliersComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
