import { Component } from '@angular/core';
import {AgEditorComponent} from "ag-grid-angular";
import {MatCalendarCellClassFunction} from "@angular/material/datepicker";
import {ICellEditorParams} from "ag-grid-community";

@Component({
  selector: 'app-grid-date-editor',
  templateUrl: './grid-date-editor.component.html',
  styleUrls: ['./grid-date-editor.component.scss']
})
export class GridDateEditorComponent implements AgEditorComponent{
  params: ICellEditorParams;
  dClass: string;
  maxDate: Date;
  minDate: Date;

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
    this.maxDate = params.maxDate;
    this.minDate = params.minDate;
    this.dClass = this.params['dateClass'] || '';
  }

  getValue(): string {
    return this.params.value;
  }

  valid(): boolean {
    return true
  }

  dateClass: MatCalendarCellClassFunction<Date> = () => {
    return this.dClass;
  }
}
