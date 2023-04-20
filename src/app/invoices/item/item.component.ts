import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Invoice} from "../../model/invoice";
import {CellValueChangedEvent, ColDef, GridApi, GridReadyEvent, SideBarDef} from "ag-grid-community";
import {InvoiceService} from "../invoice.service";
import {Unit} from "../../model/unit";
import {Item} from "../../model/item";
import {AgGridAngular} from "ag-grid-angular";
import {GridSelectEditorComponent} from "../../cell-renderers/grid-select-editor/grid-select-editor.component";
import {AppService} from "../../app.service";

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {

  @ViewChild('gridWrapper') agElm: ElementRef;
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
  private gridApi!: GridApi;

  @Input()
  rowData: Invoice;
  @Input()
  editMode: boolean;

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

  units: Unit [] = [{id: 1, tittle: "ks"}, {id: 2, tittle: "kg"}, {id: 3, tittle: "liter"}];
  newRowIndex = -1;
  deletedRows: Item [] = [];
  disableEdit: boolean = false;

  constructor(private service: AppService) {
  }

  ngOnInit(): void {
  }

  onSingleRowSelected() {
    if (this.gridApi.getSelectedRows().length > 0) {
      this.disableEdit = true
    }
  }

  getNewRow(): any {
    return {id: this.newRowIndex}
  }

  addItem() {
    let newRow: Item = this.getNewRow();
    newRow = {...newRow, editStatus: "INSERT"};

    this.newRowIndex--;
    this.agGrid.gridOptions.api.applyTransaction({
      add: [newRow],
      addIndex: 0
    })
  }

  removeItem() {
    this.closeEditor(false);
    const selected: Item [] = this.agGrid.gridOptions.api.getSelectedRows();
    if (selected.length > 0) {
      selected.forEach(r => {
        if (r.id > 0) {
          this.deletedRows.push({...r, editStatus: 'DELETE'})
        }
      });
      this.agGrid.api.applyTransaction({
        remove: selected
      })
    }
  }

  closeEditor(update = false) {
    if (update && this.agGrid.gridOptions.api.getEditingCells().length > 0 && this.agGrid.gridOptions.api.getSelectedRows().length > 0) {
      this.setUpdateStatus(this.agGrid.gridOptions.api.getSelectedRows()[0]);
    }
    this.agGrid.gridOptions.api.stopEditing(!update);
  }

  getAllChangedRows() {
    let data: Item [] = [...this.deletedRows];
    this.agGrid.gridOptions.api.forEachNode(node => {
      if (node.data.editStatus === 'INSERT' || node.data.editStatus === 'UPDATE')
        data.push(node.data);
    });
    return data;
  }


  setUpdateStatus(row: Item) {
    let updatedItems: Item [] = [];
    if (row.id > 0) {
      row.editStatus = 'UPDATE';
    }
    updatedItems.push(row)
    this.gridApi.applyTransaction({update: updatedItems});
    console.log(this.gridApi)
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  columnDefs = [
    {headerName: 'Názov položky', field: 'itemName', cellEditor: 'agTextCellEditor', editable: () => this.editMode,},
    {headerName: 'Množstvo', field: 'quantity', editable: () => this.editMode, cellEditor: 'agNumericCellEditor',},
    {
      headerName: 'Jednotka',
      field: 'unitId',
      cellEditor: GridSelectEditorComponent, editable: () => this.editMode,
      valueGetter: (params: any) => {
        const t = this.units.find(s => s.id === params.data?.unitId);
        return t ? t.tittle : null;
      },
      cellEditorParams: {
        items: this.units ? this.units.map(m => ({label: m.tittle, value: m.id})) : [],
      },
    },

    {headerName: 'Predaj', field: 'sellingPrice', editable: () => this.editMode, cellEditor: 'agNumericCellEditor',},
    {headerName: 'Nákup', field: 'shoppingPrice', editable: () => this.editMode, cellEditor: 'agNumericCellEditor',},
    {
      headerName: 'Množstvo na sklade',
      field: 'storeAmount',
      editable: () => this.editMode,
      cellEditor: 'agNumericCellEditor',
    },
    {headerName: 'Poznámka', field: 'description', cellEditor: 'agTextCellEditor', editable: () => this.editMode},
  ]

  onCellValueChanged(change: CellValueChangedEvent) {
    let row: Item = JSON.parse(JSON.stringify(change.data));
    this.setUpdateStatus(row);
  }

  save() {
    this.closeEditor(true);
    let data: Item [] = this.getAllChangedRows();
    this.deletedRows = []
    return data
  }
}
