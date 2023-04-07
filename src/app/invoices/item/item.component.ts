import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Invoice} from "../../model/invoice";
import {CellValueChangedEvent, ColDef, GridReadyEvent, SideBarDef} from "ag-grid-community";
import {InvoiceService} from "../invoice.service";
import {Unit} from "../../model/unit";
import {Item} from "../../model/item";
import {AgGridAngular} from "ag-grid-angular";
import {GridSelectEditorComponent} from "../../cell-renderers/grid-select-editor/grid-select-editor.component";

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {

  @ViewChild('gridWrapper') agElm: ElementRef;
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

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

  units: Unit [] = [{id:1, tittle:"ks"}, {id:2, tittle: "kg"}, {id:3, tittle:"liter"}];
  newRowIndex = -1;
  deletedRows: Item [] = [];

  constructor(private service: InvoiceService) {
  }

  ngOnInit(): void {
  }

  getNewRow(): any {
    return {id: this.newRowIndex}
  }

  addItem() {
    let newRow = this.getNewRow();
    newRow = {...newRow, editStatus: "INSERT"};

    this.newRowIndex--;
    this.agGrid.gridOptions.api.applyTransaction({
      add: [newRow],
      addIndex: 0
    })
  }

  removeItem() {
    this.closeEditor(false);
    const selected = this.agGrid.gridOptions.api.getSelectedRows();
    if (selected.length > 0) {
      selected.forEach(r => {
        if (r.id > 0) {
          this.deletedRows.push({...r, editStatus: 'DELETE'})
        }
      });
      this.agGrid.gridOptions.api.applyTransaction({
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

  setUpdateStatus(row: any) {
    if (row.id > 0) {
      row.editStatus = 'UPDATE';
    }
    this.agGrid.gridOptions.api.applyTransaction({
      update: [row]
    });
  }

  onGridReady(params: GridReadyEvent) {
    this.agGrid.api.sizeColumnsToFit();
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

  }
}
