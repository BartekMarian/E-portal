import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {AgGridAngular} from "ag-grid-angular";
import {Invoice} from "../model/invoice";
import {ColDef, GridReadyEvent, SideBarDef} from "ag-grid-community";
import {MatDatepickerInputEvent} from "@angular/material/datepicker";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {combineLatest, filter, map, Subject} from "rxjs";
import {SplitAreaDirective, SplitComponent} from "angular-split";
import {ItemComponent} from "./item/item.component";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import {GeneratePdfButtonComponent} from "../cell-renderers/generate-pdf-button/generate-pdf-button.component";
import {AppService} from "../app.service";
import {NGXLogger} from "ngx-logger";
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from "@angular/material/snack-bar";
import * as moment from "moment";
import {NavigationEnd, Router, RouterEvent} from "@angular/router";
import {Customer} from "../model/customer";

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
  formGroup: FormGroup;
  singleRow: Invoice;
  dateChange$: any;
  statuses: any [] = [{id: 1, name: "Uhradené"}, {id: 2, name: "Čaká na úhradu"}, {id: 3, name: "Po splatnosti"}]
  currencies: any [] = [{id: 1, name: "Euro"}, {id: 2, name: "Dolár"}, {id: 3, name: "CZK"}, {id: 4, name: "PLZ"}]
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
  ) {
    this.createFormGroup();
    this.service.listCustomers().pipe().subscribe(c=>{
      this.customers = c;
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
      width: 100,
      cellRenderer: GeneratePdfButtonComponent
    },
    {
      headerName: 'Číslo Faktúry',
      field: 'invoiceNumber',
    },
    {headerName: 'Dodávateľ', field: 'supplierId'},
    {headerName: 'Odberateľ', field: 'customer.customerName'},
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
    {headerName: 'bez DPH', field: 'subtotal', valueFormatter: this.numberFormatter},
    {headerName: 'DPH', field: 'vat', valueFormatter: this.numberFormatter},
    {headerName: 'Zľava(%)', field: 'discount'},
    {headerName: 'Spolu s DPH (€)', field: 'total', valueFormatter: this.numberFormatter},
    {
      headerName: 'Vystavená', field: 'created', filter: 'agDateColumnFilter',
      valueGetter: (params: any) => {
        return moment(params.data.dateOfPayment).format('DD.MM.YYYY');
      }
    },
    {
      headerName: 'Dátum splatnosti', field: 'dateOfPayment', filter: 'agDateColumnFilter',
      valueGetter: (params: any) => {
        return moment(params.data.dateOfPayment).format('DD.MM.YYYY');
      }
    },
    {headerName: 'Spôsob platby', field: 'paymentId'},
    {headerName: 'Spôsob doručenia', field: 'deliveryId'},
  ];

  externalFilterPass(node: any) {
    return !(node.data.created >= this.formGroup.get('rangeStart').value && node.data.created <= this.formGroup.get('rangeEnd').value);
  }

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
        this.rowData.filter(f => new Date(f.created) >= data.start.value && new Date(f.created) <= data.end.value)
      }
    });
  }

  loadData() {
    this.service.listInvoices().pipe().subscribe((data: Invoice []) => {
      this.rowData = data;
      this.agGrid.gridOptions.rowHeight = 42;
      this.agGrid.gridOptions = {
        doesExternalFilterPass: this.externalFilterPass,
      }
    });
  }

  createFormGroup() {
    this.formGroup = this.fb.group({
      id: this.fb.control(null),
      invoiceNumber: this.fb.control(null, Validators.required),
      supplierId: this.fb.control(null),
      status: this.fb.control(null),
      discount: this.fb.control(null),
      currencyId: this.fb.control(null),
      subtotal: this.fb.control(null),
      vat: this.fb.control(null),
      total: this.fb.control(null),
      customer: this.fb.group({
        id: this.fb.control(null),
        customerName: this.fb.control(null),
      }),
      rangeStart: this.fb.control(null),
      rangeEnd: this.fb.control(null),
    })

    this.formGroup.get('status').valueChanges.subscribe(status => {
      this.changeStatusColor(status);
    });
    this.formGroup.get('subtotal').valueChanges.subscribe(subtotal => {
      this.countAmountWithDiscount(subtotal);
    })
  }

  countAmountWithDiscount(subtotal: number) {
    let discount = this.formGroup.get('discount').value;
    if (discount != null && discount > 0) {
      subtotal = subtotal * (1 - discount / 100)
    }
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
    this.formGroup.get('vat').disable();
    this.formGroup.get('total').disable();
  }

  saveClick() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) {
      return
    }
    let data = this.formGroup.getRawValue();
    console.log(data)
    data.items =  this.itemComponent.save();
    console.log(data.items)
    this.service.saveInvoice(data).subscribe(res => {
      if (res) {
        this.singleRow = null;
        this.loadData()
        this.editMode = false
        this._snackBar.open("Faktúra bola úspešne upravená", "", {
          duration: 3000,
          panelClass: 'green-snackbar',
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
    if (this.formGroup.get('id').value === null) {
      this.closeClick();
    }
  }

  addClick() {
    this.singleRow = {id: 0} as Invoice
    this.formGroup.reset();
    this.formGroup.enable();
    this.editMode = true;
  }

  deleteCLick() {
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

  filterPassed(start: any, end: any) {
    let passed = true;
    if (start && end) {
      // console.log(start + "picker start" + end + "picker end")
      passed = start < this.rowData.map(m => m.created) && end > this.rowData.map(m => m.created);
      if (!passed) {
        return passed;
      }
    }
    return passed
  }

  ngOnDestroy(): void {
    this.destroyed.next(undefined);
    this.destroyed.complete();
  }

}
