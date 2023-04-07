import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {AgGridAngular} from "ag-grid-angular";
import {Invoice} from "../model/invoice";
import {InvoiceService} from "./invoice.service";
import {CellClassParams, ColDef, GridReadyEvent, SideBarDef} from "ag-grid-community";
import {MatDatepicker, MatDatepickerInputEvent} from "@angular/material/datepicker";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {combineLatest, map, Subject} from "rxjs";
import {SplitAreaDirective, SplitComponent} from "angular-split";
import {Unit} from "../model/unit";
import {GridDateEditorComponent} from "../cell-renderers/grid-date-editor/grid-date-editor.component";
import {ItemComponent} from "./item/item.component";
import {GridSelectEditorComponent} from "../cell-renderers/grid-select-editor/grid-select-editor.component";

@Component({

  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicesComponent implements OnInit {

  @ViewChild('split') split: SplitComponent
  @ViewChild('area1') area1: SplitAreaDirective
  @ViewChild('area2') area2: SplitAreaDirective
  @ViewChild('itemComponent') itemComponent: ItemComponent

  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
  @ViewChild('gridWrapper') agElm: ElementRef;

  @Output()
  reloadData = new EventEmitter();

  public sideBar: SideBarDef | string | string[] | boolean | null = {
    toolPanels: ['columns'],
  };
  public rowGroupPanelShow: 'always' | 'onlyWhenGrouping' | 'never' = 'always';

  editMode: boolean = false;
  rowData: Invoice [] = [];
  formGroup: FormGroup;
  singleRow: Invoice;
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


  constructor(private service: InvoiceService,
              private fb: FormBuilder,) {
    this.createFormGroup();

  }


  public defaultColDef: ColDef = {
    editable: true,
    sortable: true,
    filter: true,
    resizable: true,
  };

  columnDefs = [
    {
      headerName: 'Číslo Faktúry',
      field: 'invoiceNumber',
      cellEditor: 'agTextCellEditor',
      editable: () => this.editMode
    },
    {headerName: 'Dodávateľ', field: 'supplierId'},
    {headerName: 'Odberateľ', field: 'customerId'},
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
    {headerName: 'bez DPH', field: 'subtotal'},
    {headerName: 'DPH', field: 'vat'},
    {headerName: 'Odberateľská zľava', field: 'discount'},
    {headerName: 'Spolu s DPH', field: 'total'},
    {headerName: 'Mena', field: 'currencyId',
      valueGetter: (params: any) => {
        const t = this.currencies.find(s => s.id === params.data?.currencyId);
        return t ? t.name : null;
      },},
    {headerName: 'Vystavená', field: 'created', filter: 'agDateColumnFilter'},
    {headerName: 'Upravená', field: 'updated', type: 'Date', filter: 'agDateColumnFilter', cellEditor: 'selectEditor'},
    {headerName: 'Dátum splatnosti', field: 'dateOfPayment', type: 'Date', filter: 'agDateColumnFilter',},
    {headerName: 'Spôsob platby', field: 'paymentId'},
    {headerName: 'Spôsob doručenia', field: 'deliveryId'},
  ];

  ngOnInit(): void {
    this.loadData();
    const dateChange$ = combineLatest([this.startDatePicker, this.endDatePicker]).pipe(
      map(([start, end]) => ({
        start: start,
        end: end
      }))
    );
    dateChange$.subscribe((data) => {
      if (data.start.value && data.end.value) {
        //range
      }
    });

  }

  loadData() {
    this.service.listInvoices().subscribe((data: Invoice []) => {
      this.rowData = data;
      this.agGrid.gridOptions?.api.sizeColumnsToFit()
    });
  }

  createFormGroup() {
    this.formGroup = this.fb.group({
      id: this.fb.control(null),
      invoiceNumber: this.fb.control(null, Validators.required),
      supplierId: this.fb.control(null),
      customerId: this.fb.control(null),
      status: this.fb.control(null),
      discount: this.fb.control(null),
      currencyId: this.fb.control(null),
      subtotal: this.fb.control(null),
      vat: this.fb.control(null),
      total: this.fb.control(null),

      rangeStart: this.fb.control(null),
      rangeEnd: this.fb.control(null),
    })
    this.formGroup.get('status').valueChanges.subscribe(status => {
      this.changeStatusColor(status);
    })
  }

  onFilterTextBoxChanged() {
    this.agGrid.api.setQuickFilter(
      (document.getElementById('filter-text-box') as HTMLInputElement).value
    );
  }

  onGridReady(params: GridReadyEvent) {
    this.agGrid.api = params.api;
  }

  onSingleRowSelected() {
    this.singleRow = this.agGrid.api.getSelectedRows()[0];
    this.changeStatusColor(this.singleRow.status);
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
  }

  saveClick() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) {
      return
    }
    this.service.saveInvoice(this.formGroup.getRawValue());
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

  cancel() {
    this.editMode = false
  }

  save() {
    this.editMode = false
  }

  edit() {
    this.editMode = true
  }

  filterPassed(data: any) {
    let passed = true;
    console.log(data)
  }

}
