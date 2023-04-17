import {Component, ElementRef, NgZone, ViewChild, ViewContainerRef} from '@angular/core';
import {ICellEditorParams} from "ag-grid-community";
import {AgEditorComponent, ICellEditorAngularComp} from "ag-grid-angular";

@Component({
  selector: 'app-grid-select-editor',
  templateUrl: './grid-select-editor.component.html',
  styleUrls: ['./grid-select-editor.component.scss']
})
export class GridSelectEditorComponent implements ICellEditorAngularComp  {

  private params!: ICellEditorParams & { items: string[] };

  public items!: any[];
  public selectedValue!: string;
  private selectedIndex!: number;

  @ViewChild("group", { read: ViewContainerRef })
  public group!: ViewContainerRef;

  agInit(params: ICellEditorParams & { items: string[] }): void {
    this.params = params;

    this.selectedValue = this.params.value;

    this.items = this.params.items;

    this.selectedIndex = this.items.findIndex(item => {
      return item.label === this.params.value;
    });
    console.log(this.selectedIndex)
  }

  ngAfterViewInit() {
    this.selectFavouriteVegetableBasedOnSelectedIndex();
  }

  private selectFavouriteVegetableBasedOnSelectedIndex() {
    this.selectedValue = this.items[this.selectedIndex];
  }

  getValue() {
    return this.selectedValue;
  }

  isPopup(): boolean {
    return true;
  }

}
