import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {InvoicesComponent} from "./invoices/invoices.component";
import {AppComponent} from "./app.component";

const routes: Routes = [
  { path: '', redirectTo:"/invoices", pathMatch:"full" },
  { path: 'invoices', component: InvoicesComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
