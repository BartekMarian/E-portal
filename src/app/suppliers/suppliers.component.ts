import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AgGridAngular} from "ag-grid-angular";
import {Subject} from "rxjs";
import {AppService} from "../app.service";
import {ColDef, SideBarDef} from "ag-grid-community";
import {Supplier} from "../model/supplier";

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.scss']
})
export class SuppliersComponent implements OnInit, OnDestroy {
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
  @ViewChild('gridWrapper') agElm: ElementRef;

  destroy$ = new Subject();

  editMode: boolean;
  rowData: Supplier [] = [];
  singleRow: Supplier;

  constructor(private service: AppService) {
  }

  public sideBar: SideBarDef | string | string[] | boolean | null = {
    toolPanels: ['columns'],
  };
  public rowGroupPanelShow: 'always' | 'onlyWhenGrouping' | 'never' = 'always';


  public defaultColDef: ColDef = {
    editable: true,
    sortable: true,
    filter: true,
    resizable: true,
  };


  ngOnInit(): void {
  }

  loadData() {
    this.service.listSuppliers().pipe().subscribe((data: Supplier []) => {
      this.rowData = data;
      this.agGrid.gridOptions?.api.sizeColumnsToFit();
      this.agGrid.gridOptions.rowHeight = 42;
    });
  }

  columnDefs = [
    {
      headerName: 'Názov subjektu',
      field: 'supplierName',
    },
    {
      headerName: 'IČO',
      field: 'ico',
    },
    {
      headerName: 'DIČ',
      field: 'dic',
    },
    {
      headerName: 'DIČ SK',
      field: 'dicSk',
    },
    {
      headerName: 'Email',
      field: 'email',
    },
    {
      headerName: 'Iban',
      field: 'iban',
    },
    {
      headerName: 'Adresa',
      field: 'street',
      valueGetter: (params: any) => {
        return params.data.street+', '+params.data.city;
      }
    },
  ]

  onSingleRowSelected() {
    this.singleRow = this.agGrid.api.getSelectedRows()[0];
    // this.changeStatusColor(this.singleRow?.status);
    // this.formGroup.patchValue(this.singleRow);
    // this.formGroup.disable();
    this.editMode = false;
  }

  onFilterTextBoxChanged() {
    this.agGrid.api.setQuickFilter(
      (document.getElementById('filter-text-box') as HTMLInputElement).value
    );
  }

  addClick() {
  }

  ngOnDestroy(): void {
    this.destroy$.next(undefined);
    this.destroy$.complete();
  }
}
