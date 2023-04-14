import {Component} from '@angular/core';
import {ICellRendererAngularComp} from "ag-grid-angular";
import {ICellRendererParams} from "ag-grid-community";
import {Invoice} from "../../model/invoice";
import {MatIconRegistry} from "@angular/material/icon";
import {MatDialog} from "@angular/material/dialog";
import {DomSanitizer} from "@angular/platform-browser";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-generate-pdf-button',
  templateUrl: './generate-pdf-button.component.html',
  styleUrls: ['./generate-pdf-button.component.scss']
})
export class GeneratePdfButtonComponent implements ICellRendererAngularComp {

  singleRow: Invoice;
  private params!: ICellRendererParams;


  constructor(private dialog: MatDialog,
              private iconRegistry: MatIconRegistry,
              private sanitizer: DomSanitizer) {
    iconRegistry.addSvgIconLiteral('view-pdf', this.sanitizer.bypassSecurityTrustHtml(`<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg class="svg-icon" style="overflow:hidden;fill:red" viewBox="0 0 48 48" version="1.1" id="svg6" width="48" height="48" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg"><defs id="defs10" /> <g id="g829" transform="matrix(0.06093251,0,0,0.06093251,-7.1993953,-7.1974451)" style="stroke-width:16.4116"><path d="M 545,793.6 H 243.8 c -11,0 -20,-9 -20,-20 V 250.4 c 0,-11 9,-20 20,-20 h 432.4 c 11,0 20,9 20,20 v 131.8 c 0,11 9,20 20,20 11,0 20,-9 20,-20 V 250.4 c 0,-33.1 -26.9,-60 -60,-60 H 243.8 c -33.1,0 -60,26.9 -60,60 v 523.2 c 0,33.1 26.9,60 60,60 H 545 c 11,0 20,-9 20,-20 0,-11 -8.9,-20 -20,-20 z" id="path2" style="stroke-width:16.4116" /><path d="m 834.6,789.8 -88.8,-91.7 c 23.4,-28.7 37.5,-65.4 37.5,-105.3 0,-92.1 -74.9,-167 -167,-167 -92.1,0 -167,74.9 -167,167 0,92.1 74.9,167 167,167 37.8,0 72.7,-12.6 100.7,-33.9 l 89,91.8 c 3.9,4 9.1,6 14.3,6 5,0 10.1,-1.9 14,-5.7 7.8,-7.6 8,-20.3 0.3,-28.2 z M 616.2,719.9 c -70,0 -127,-57 -127,-127 0,-70 57,-127 127,-127 70,0 127,57 127,127 0,70 -57,127 -127,127 z M 565,382.2 c 0,-11 -9,-20 -20,-20 H 308.7 c -11,0 -20,9 -20,20 0,11 9,20 20,20 H 545 c 11.1,0 20,-9 20,-20 z M 443.5,493.5 c 0,-11 -9,-20 -20,-20 H 308.7 c -11,0 -20,9 -20,20 0,11 9,20 20,20 h 114.8 c 11.1,0 20,-8.9 20,-20 z m -134.8,91.3 c -11,0 -20,9 -20,20 0,11 9,20 20,20 h 61.7 c 11,0 20,-9 20,-20 0,-11 -9,-20 -20,-20 z" id="path4" style="stroke-width:16.4116" /></g></svg>`));
  }

  getViewIcon(mimeType: string) {
    let result;
    switch (mimeType) {
      case 'application/pdf':
        result = 'view-pdf';
        break
    }
    return result;
  }

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.singleRow = params.data;
  }

  async pdfView() {
    let docDefinition = {
      content: [
        {
          image: await this.getBase64ImageFromURL("../../../assets/invoice_euro.png"),
        },
        {
          text: 'Faktúra',
          fontSize: 20,
          bold: true,
          alignment: 'center',
          decoration: 'underline',
          color: 'black'
        },
        {
          columns: [
            [{text: 'Odberateľ', alignment: 'left', style: 'sectionHeader'}],
            [{text: 'Dodávateľ', alignment: 'right', style: 'sectionHeader'}]
          ]
        },
        {
          columns: [
            [
              {text: "Faktúra č. : " + this.singleRow.invoiceNumber, bold: true},
              {text: "Vystavené dňa : " + this.singleRow.created},
              {text: "Zdaniteľné plnenie : " + this.singleRow.created},
              {text: "Dátum splatnosti : " + this.singleRow.dateOfPayment},
              {text: "Variabilný symbol : " + this.singleRow.invoiceNumber},

            ],
            [
              {
                text: `Dátum: ${new Date().toLocaleString()}`,
                alignment: 'right'
              },
              {
                text: `Číslo objednávky : ${((Math.random() * 1000).toFixed(0))}`,
                alignment: 'right'
              }
            ]
          ]
        },
        {
          text: 'Položky',
          style: 'sectionHeader'
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              ['Názov položky', 'Cena', 'Množstvo', 'Spolu'],
              ...this.singleRow.items.map(p => ([p.itemName, p.sellingPrice, p.quantity, (p.sellingPrice * p.quantity).toFixed(2)])),
              [{
                text: 'Celkom',
                colSpan: 3
              }, {}, {}, this.singleRow.items.reduce((sum, p) => sum + (p.quantity * p.sellingPrice), 0).toFixed(2)]
            ]
          }
        },
        {
          text: 'Doplňujúce informácie',
          style: 'sectionHeader'
        },
        {
          text: this.singleRow.dateOfPayment,
          margin: [0, 0, 0, 15]
        },
        {
          columns: [
            [{qr: `${"spolu:" + this.singleRow.total + "cislo faktury:" + this.singleRow.invoiceNumber}`, fit: '85'}],
            [{text: 'Podpis', alignment: 'right', italics: true}],
          ]
        },
        {
          text: 'Podmienky',
          style: 'sectionHeader'
        },
        {
          ul: [
            'Objednávku je možné vrátiť do 10 dní',
            'Záruka na produkt bude podliehať zmluvným podmienkam výrobcu.',
            'Toto je faktúra vygenerovaná systémom.',
          ],
        }
      ],
      styles: {
        sectionHeader: {
          bold: true,
          decoration: 'underline',
          fontSize: 14,
          margin: [0, 15, 0, 15]
        }
      }
    };
    pdfMake.createPdf(docDefinition).open();
  }

  getBase64ImageFromURL(url) {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.setAttribute("crossOrigin", "anonymous");

      img.onload = () => {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        var dataURL = canvas.toDataURL("image/png");

        resolve(dataURL);
      };

      img.onerror = error => {
        reject(error);
      };

      img.src = url;
    });
  }

  refresh(params: ICellRendererParams<any>): boolean {
    this.params = params;
    return true;
  }

}
