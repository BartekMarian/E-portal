import {Component, ElementRef, NgZone, ViewChild} from '@angular/core';
import {ICellEditorParams} from "ag-grid-community";
import {AgEditorComponent} from "ag-grid-angular";

@Component({
  selector: 'app-grid-select-editor',
  templateUrl: './grid-select-editor.component.html',
  styleUrls: ['./grid-select-editor.component.scss']
})
export class GridSelectEditorComponent implements AgEditorComponent {

  @ViewChild('input') input: ElementRef;
  params: ICellEditorParams;
  userSearchValue: string = '';
  _items = [];
  itemFunc: boolean;
  searchKey: string = null;

  multiple: boolean;
  clearable: boolean;
  searchable: boolean;
  codebook: boolean;
  hideSelected: boolean;
  tagText: string;
  tagFunction: any;


  value: any = undefined;

  paramsReady = false;

  appendTo: string;

  constructor(private _ngZone: NgZone) {
  }

  isPopup(): boolean {
    return false;
  }

  isCancelBeforeStart(): boolean {
    return false;
  }

  isCancelAfterEnd(): boolean {
    return false;
  }

  agInit(params: any): void {
    this.params = params;
    this.multiple = this.params['multiple'] || false;
    this.clearable = this.params['clearable'] || false;
    this.searchable = this.params['searchable'] || false;
    this.tagText = this.params['tagText'] || false;
    this.tagFunction = this.params['tagFunction'] || null;
    this.hideSelected = this.params['hideSelected'] || false;
    this.itemFunc = this.params['itemFunction'] || false;
    this.codebook = this.params['codebook'] || false;
    this.searchKey = this.params['searchKey'] || null;
    this.appendTo = this.params['appendTo'] || 'body';


    //params.context.parentComponent
    if (this.itemFunc) {
      this._items = params.context.componentParent.getItems(params.data);
    } else {
      this._items = this.params['items'] || [];
    }

    let oldValue = this.params.data[this.params.colDef.field];
    if (oldValue && this._items.findIndex(f => f.value === oldValue) === -1) {
      //zrusenie neplatnej hodnoty
      this.value = null;
    } else {
      this.value = this.params.data[this.params.colDef.field];
    }

    this.paramsReady = true;
  }

  getValue(): string {
    return this.value;
  }

  valid(): boolean {
    return true
  }

}
