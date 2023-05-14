import {Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {AgGridAngular} from "ag-grid-angular";
import {Invoice} from "../model/invoice";
import {ColDef, SideBarDef} from "ag-grid-community";
import {MatDatepickerInputEvent} from "@angular/material/datepicker";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {combineLatest, map, Subject} from "rxjs";
import {SplitAreaDirective, SplitComponent} from "angular-split";
import {ItemComponent} from "./item/item.component";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import {GeneratePdfButtonComponent} from "../cell-renderers/generate-pdf-button/generate-pdf-button.component";
import {AppService} from "../app.service";
import {NGXLogger} from "ngx-logger";
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from "@angular/material/snack-bar";
import * as moment from "moment";
import {Router} from "@angular/router";
import {Customer} from "../model/customer";
import {Supplier} from "../model/supplier";
import {EshopOrderComponent} from "../cell-renderers/eshop-order/eshop-order.component";
import {MatDialog} from "@angular/material/dialog";
import {
  DeleteConfirmationDialogComponent
} from "../dialog/delete-confirmation-dialog/delete-confirmation-dialog.component";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({

  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss'],
})
export class InvoicesComponent implements OnInit, OnDestroy {

  @ViewChild('split') split: SplitComponent
  @ViewChild('area1') area1: SplitAreaDirective
  @ViewChild('area2') area2: SplitAreaDirective
  @ViewChild('itemComponent') itemComponent: ItemComponent;

  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
  @ViewChild('gridWrapper') agElm: ElementRef;

  horizontalPosition: MatSnackBarHorizontalPosition = 'start';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  @Output()
  reloadData = new EventEmitter();

  public sideBar: SideBarDef | string | string[] | boolean | null = {
    toolPanels: ['columns'],
  };
  public rowGroupPanelShow: 'always' | 'onlyWhenGrouping' | 'never' = 'always';
  public destroyed = new Subject<any>();

  editMode: boolean = false;
  rowData: Invoice [] = [];
  customers: Customer [] = [];
  suppliers: Supplier [] = [];
  formGroup: FormGroup;
  singleRow: Invoice;
  dateChange$: any;
  statuses: any [] = [{id: 1, name: "Uhradené"}, {id: 2, name: "Čaká na úhradu"}, {id: 3, name: "Po splatnosti"}]
  paymentMethods: any [] = [{id: 1, name: "Prevodom na účet"}, {id: 2, name: "Dobierkou"}, {id: 3, name: "V hotovosti"}]
  currencies: any [] = [{id: 1, name: "Euro"}, {id: 2, name: "Dolár"}, {id: 3, name: "CZK"}, {id: 4, name: "PLZ"}]
  deliveryMethods: any [] = [{id: 1, name: "Kuriérom"}, {id: 2, name: "Osobne"}, {id: 3, name: "Z-BOX"}]
  startDatePicker = new Subject<MatDatepickerInputEvent<any>>();
  endDatePicker = new Subject<MatDatepickerInputEvent<any>>();
  direction = 'horizontal'
  sizes = {
    percent: {
      area1: 50,
      area2: 50,
    },
  }
  statusColor: string

  constructor(private service: AppService,
              private fb: FormBuilder,
              private logger: NGXLogger,
              private _snackBar: MatSnackBar,
              private router: Router,
              private dialog: MatDialog,
  ) {
    this.createFormGroup();
    this.service.listCustomers().pipe().subscribe(c => {
      this.customers = c;
    })
    this.service.listSuppliers().pipe().subscribe(s => {
      this.suppliers = s;
    })
  }


  public defaultColDef: ColDef = {
    editable: true,
    sortable: true,
    filter: true,
    resizable: true,
  };

  columnDefs = [
    {
      width: 50,
      cellRenderer: GeneratePdfButtonComponent
    },
    {
      width: 50,
      cellRenderer: EshopOrderComponent
    },
    {
      headerName: 'Číslo Faktúry',
      field: 'invoiceNumber',
      width: 140,
    },
    {headerName: 'Dodávateľ', field: 'supplier.supplierName'},
    {headerName: 'Odberateľ', field: 'customer.customerName',width: 140,},
    {
      headerName: 'Stav úhrady', field: 'status',
      valueGetter: (params: any) => {
        const t = this.statuses.find(s => s.id === params.data?.status);
        return t ? t.name : null;
      },
      cellStyle: params => {
        if (params.data.status == 1) {
          return {'font-weight': 'bold', color: 'green'}
        } else if (params.data.status === 2) {
          return {'font-weight': 'bold', color: 'orange'}
        } else if (params.data.status === 3) {
          return {'font-weight': 'bold', color: 'red'}
        }
        return null;
      }
    },
    {headerName: 'bez DPH', field: 'subtotal', valueFormatter: this.numberFormatter, width: 140,},
    {headerName: 'DPH', field: 'vat', valueFormatter: this.numberFormatter, width: 140,},
    {headerName: 'Zľava(%)', field: 'discount', width: 140,},
    {headerName: 'Spolu s DPH (€)', field: 'total', valueFormatter: this.numberFormatter, width: 180,},
    {
      headerName: 'Vystavená', field: 'created', filter: 'agDateColumnFilter',
      valueGetter: (params: any) => {
        return moment(params.data.created).format('DD.MM.YYYY');
      },
    },
    {
      headerName: 'Dátum splatnosti', field: 'dateOfPayment', filter: 'agDateColumnFilter',
      valueGetter: (params: any) => {
        return moment(params.data.dateOfPayment).format('DD.MM.YYYY');
      }
    },
    {
      headerName: 'Spôsob úhrady', field: 'paymentMethod',
      valueGetter: (params: any) => {
        const t = this.paymentMethods.find(s => s.id === params.data?.paymentMethod);
        return t ? t.name : null;
      }
    },
    {headerName: 'Spôsob doručenia', field: 'deliveryId',
      valueGetter: (params: any) => {
        const t = this.deliveryMethods.find(s => s.id === params.data?.deliveryId);
        return t ? t.name : null;
      }},
  ];

  numberFormatter(params) {
    return Number(params.value.toFixed(2))
  }

  ngOnInit(): void {
    this.dateChange$ = combineLatest([this.startDatePicker, this.endDatePicker]).pipe(
      map(([start, end]) => ({
        start: start,
        end: end
      }))
    );
    this.dateChange$.subscribe((data) => {
      if (data.start.value && data.end.value) {
        this.agGrid.gridOptions.api.setRowData(this.rowData.filter(f => new Date(f.created) >= data.start.value && new Date(f.created) <= data.end.value));
      }
    });
  }

  loadData() {
    this.service.listInvoices().pipe().subscribe((data: Invoice []) => {
      this.rowData = data;
      this.agGrid.gridOptions.rowHeight = 42;
    });
  }

  createFormGroup() {
    this.formGroup = this.fb.group({
      id: this.fb.control(null),
      invoiceNumber: this.fb.control(null, Validators.required),
      status: this.fb.control(null),
      discount: this.fb.control(null),
      currencyId: this.fb.control(null),
      subtotal: this.fb.control(null),
      vat: this.fb.control(null),
      total: this.fb.control(null),
      paymentMethod: this.fb.control(null),
      deliveryId: this.fb.control(null),
      orderStatus: this.fb.control(null),
      items:this.fb.control([]),
      supplier: this.fb.group({
        id: this.fb.control(null, Validators.required),
        supplierName: this.fb.control(null),
      }),
      customer: this.fb.group({
        id: this.fb.control(null, Validators.required),
        customerName: this.fb.control(null),
      }),
    })

    this.formGroup.get('status').valueChanges.subscribe(status => {
      this.changeStatusColor(status);
    });
    this.formGroup.get('discount').valueChanges.subscribe(discount => {
      if (this.formGroup.get('id').value > 0){
        let subtotal = 0;
        if (this.singleRow?.items.length > 0) {
          this.singleRow.items.forEach(f => {
            subtotal += f.sellingPrice * f.quantity
          });
        }
        this.formGroup.get('subtotal').setValue(subtotal);
        this.countAmountWithDiscount(discount, subtotal);
      }
    })
  }

  countAmountWithDiscount(discount: number, subtotal: number) {
    if (discount != null && discount > 0) {
      subtotal = subtotal * (1 - discount / 100)
    }
    this.formGroup.get('subtotal').setValue((subtotal).toFixed(2));
    this.formGroup.get('vat').setValue(((subtotal / 100) * 20).toFixed(2));
    this.formGroup.get('total').setValue((subtotal * 1.2).toFixed(2));
  }

  onFilterTextBoxChanged() {
    this.agGrid.api.setQuickFilter(
      (document.getElementById('filter-text-box') as HTMLInputElement).value
    );
  }

  onSingleRowSelected() {
    this.singleRow = this.agGrid.api.getSelectedRows()[0];
    this.changeStatusColor(this.singleRow?.status);
    this.formGroup.patchValue(this.singleRow);
    this.formGroup.disable();
    this.editMode = false;
  }

  changeStatusColor(status: number) {
    if (status === 1) {
      this.statusColor = 'one';
    } else if (status === 2) {
      this.statusColor = 'two';
    } else if (status === 3) {
      this.statusColor = 'three';
    } else {
      this.statusColor = 'none';
    }
  }

  closeClick() {
    this.singleRow = null;
    this.agGrid.api.deselectAll()
  }

  repairClick() {
    this.editMode = true;
    this.formGroup.enable();
    this.formGroup.get('subtotal').disable();
    this.formGroup.get('vat').disable();
    this.formGroup.get('total').disable();
  }

  deleteCLick() {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.service.deleteInvoice(this.singleRow.id).subscribe(res => {
          if (res) {
            this.singleRow = null;
            this.loadData()
            this._snackBar.open("Faktúra bola úspešne vymazaná", "", {
              duration: 5000,
              panelClass: ['red-snackbar'],
              horizontalPosition: this.horizontalPosition,
              verticalPosition: this.verticalPosition,
            });
          }
        });
      }
    });
  }

  saveClick() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) {
      this._snackBar.open("Skontrolujte všetky polia formulára!", "", {
        duration: 5000,
        panelClass: ['orange-snackbar'],
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
      });
      return
    }
    let data = this.formGroup.getRawValue();
    data.orderStatus = false;
    if (this.formGroup.get('id').value === 0){
      data.items = this.itemComponent.save();
    }else {
      data.items.forEach( i => {
        i.editStatus = "INSERT";
      })
    }
    this.service.saveInvoice(data).subscribe(res => {
      if (res) {
        this.singleRow = null;
        this.loadData()
        this.editMode = false
        this._snackBar.open("Faktúra bola úspešne upravená", "", {
          duration: 5000,
          panelClass: ['green-snackbar'],
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
        });
      }

      this.logger.debug("Response status: ", res.status)
    });
  }

  cancelClick() {
    this.formGroup.disable()
    this.editMode = false;
    this.formGroup.patchValue(this.singleRow);
    if (this.formGroup.get('id').value === 0) {
      this.closeClick();
    }
  }

  addClick() {
    this.service.getLastInvoiceNumber().subscribe(s => {
      if (s != undefined) {
        this.formGroup.reset();
        this.formGroup.enable();
        this.formGroup.get('invoiceNumber').disable();
        this.editMode = true;
        this.singleRow = {id: 0, invoiceNumber: s.invoiceNumber + 1, items: []} as Invoice
        this.formGroup.patchValue(this.singleRow);
      }
    });
  }


  duplicateInvoice() {
    this.service.getLastInvoiceNumber().subscribe(s => {
      if (s != undefined) {
        this.editMode = true;
        this.formGroup.patchValue(this.singleRow);
        this.formGroup.get('id').setValue(null);
        this.formGroup.get('invoiceNumber').disable();
        this.formGroup.get('invoiceNumber').setValue(s.invoiceNumber+1);
      }
    });
  }

  pdf() {
    this.service.createPdf(this.singleRow).subscribe();
  }

  dragEnd(unit, {sizes}) {
    if (unit === 'percent') {
      this.sizes.percent.area1 = sizes[0]
      this.sizes.percent.area2 = sizes[1]
    }
  }

  isExternalFilterPresent() {
    return true;
  }

  ngOnDestroy(): void {
    this.destroyed.next(undefined);
    this.destroyed.complete();
  }

}
