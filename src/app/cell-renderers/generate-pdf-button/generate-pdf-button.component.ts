import {Component} from '@angular/core';
import {ICellRendererAngularComp} from "ag-grid-angular";
import {ICellRendererParams} from "ag-grid-community";
import {Invoice} from "../../model/invoice";
import {MatIconRegistry} from "@angular/material/icon";
import {MatDialog} from "@angular/material/dialog";
import {DomSanitizer} from "@angular/platform-browser";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import * as moment from "moment";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-generate-pdf-button',
  templateUrl: './generate-pdf-button.component.html',
  styleUrls: ['./generate-pdf-button.component.scss']
})
export class GeneratePdfButtonComponent implements ICellRendererAngularComp {

  singleRow: Invoice;
  private params!: ICellRendererParams;
  paymentMethods: any [] = [{id: 1, name: "Prevodom na účet"}, {id: 2, name: "Dobierkou"}, {id: 3, name: "V hotovosti"}]


  constructor(private dialog: MatDialog,
              private iconRegistry: MatIconRegistry,
              private sanitizer: DomSanitizer) {
    iconRegistry.addSvgIconLiteral('view-pdf', this.sanitizer.bypassSecurityTrustHtml(`<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg class="svg-icon" style="overflow:hidden;fill:#b10e1e" viewBox="0 0 48 48" version="1.1" id="svg6" width="48" height="48" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg"><defs id="defs10" /> <g id="g829" transform="matrix(0.06093251,0,0,0.06093251,-7.1993953,-7.1974451)" style="stroke-width:16.4116"><path d="M 545,793.6 H 243.8 c -11,0 -20,-9 -20,-20 V 250.4 c 0,-11 9,-20 20,-20 h 432.4 c 11,0 20,9 20,20 v 131.8 c 0,11 9,20 20,20 11,0 20,-9 20,-20 V 250.4 c 0,-33.1 -26.9,-60 -60,-60 H 243.8 c -33.1,0 -60,26.9 -60,60 v 523.2 c 0,33.1 26.9,60 60,60 H 545 c 11,0 20,-9 20,-20 0,-11 -8.9,-20 -20,-20 z" id="path2" style="stroke-width:16.4116" /><path d="m 834.6,789.8 -88.8,-91.7 c 23.4,-28.7 37.5,-65.4 37.5,-105.3 0,-92.1 -74.9,-167 -167,-167 -92.1,0 -167,74.9 -167,167 0,92.1 74.9,167 167,167 37.8,0 72.7,-12.6 100.7,-33.9 l 89,91.8 c 3.9,4 9.1,6 14.3,6 5,0 10.1,-1.9 14,-5.7 7.8,-7.6 8,-20.3 0.3,-28.2 z M 616.2,719.9 c -70,0 -127,-57 -127,-127 0,-70 57,-127 127,-127 70,0 127,57 127,127 0,70 -57,127 -127,127 z M 565,382.2 c 0,-11 -9,-20 -20,-20 H 308.7 c -11,0 -20,9 -20,20 0,11 9,20 20,20 H 545 c 11.1,0 20,-9 20,-20 z M 443.5,493.5 c 0,-11 -9,-20 -20,-20 H 308.7 c -11,0 -20,9 -20,20 0,11 9,20 20,20 h 114.8 c 11.1,0 20,-8.9 20,-20 z m -134.8,91.3 c -11,0 -20,9 -20,20 0,11 9,20 20,20 h 61.7 c 11,0 20,-9 20,-20 0,-11 -9,-20 -20,-20 z" id="path4" style="stroke-width:16.4116" /></g></svg>`));
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

  roundTotal() {
    let total = Number(this.singleRow.total.toFixed(2));
    let sum = total.toString();
    let roundSum;
    console.log((sum.substring(sum.length - 1)))
    switch (sum.substring(sum.length - 1)) {
      case '1':
        roundSum = (total - 0.01);
        break
      case '2':
        roundSum = total - 0.02;
        break
      case '3':
        roundSum = total + 0.02;
        break
      case '4':
        roundSum = total + 0.01;
        break
      case '6':
        roundSum = total - 0.01;
        break
      case '7':
        roundSum = total - 0.02;
        break
      case '8':
        roundSum = total + 0.02;
        break
      case '9':
        roundSum = total + 0.01;
        break
      default:
        return roundSum = total
    }
    return roundSum;
  }

  async pdfView() {
    let paymentMethod = this.paymentMethods.find(f => f.id === this.singleRow.paymentMethod)
    if (this.singleRow.paymentMethod === 2) {
      let docDefinition2 = {
        content: [
          [
            {
              columns: [
                [{image: await this.getBase64ImageFromURL("../../../assets/logo.png")}],
                [{
                  text: 'Faktúra / Daňový doklad',
                  fontSize: 18,
                  bold: true,
                  alignment: 'center',
                  decoration: 'underline',
                  color: 'black'
                },]
              ],
            },
            {
              columns: [
                [
                  {text: 'Dodávateľ', alignment: 'left', style: 'sectionHeader'},
                  {text: 'Názov : ' + this.singleRow.supplier.supplierName, alignment: 'left', style: 'subject'},
                  {
                    text: 'Adresa : ' + this.singleRow.supplier.street + ', ' + this.singleRow.supplier.city,
                    alignment: 'left',
                    style: 'subject'
                  },
                  {text: 'IČO: ' + this.singleRow.supplier.ico, alignment: 'left', style: 'subject'},
                  {text: 'DIČ: ' + this.singleRow.supplier.dic, alignment: 'left', style: 'subject'},
                  {text: 'DIČ DPH: ' + this.singleRow.supplier.dicSk, alignment: 'left', style: 'subject'},
                  {text: 'Bankové spojenie : ' + this.singleRow.supplier.iban, alignment: 'left', style: 'subject'},

                  {text: 'Obchodný register Okresného súdu Trnava, oddiel: Sro, vložka č. 34160/T', style: 'subject'},
                  {text: ' '},

                ],
                [{text: 'Odberateľ', alignment: 'right', style: 'sectionHeader'},
                  {text: 'Názov : ' + this.singleRow.customer.customerName, alignment: 'right', style: 'subject'},
                  {
                    text: 'Adresa : ' + this.singleRow.customer.street + ', ' + this.singleRow.customer.city,
                    alignment: 'right',
                    style: 'subject'
                  },
                  {text: 'IČO: ' + this.singleRow.customer.ico, alignment: 'right', style: 'subject'},
                  {text: 'DIČ: ' + this.singleRow.customer.dic, alignment: 'right', style: 'subject'},
                  {text: 'DIČ DPH: ' + this.singleRow.customer.dicSk, alignment: 'right', style: 'subject'},
                  {text: 'Bankové spojenie : ' + this.singleRow.customer.iban, alignment: 'right', style: 'subject'},
                  {text: ' '},]
              ]

            },
            [
              { width:5,
                canvas: [{
                  type: 'line',
                  x1: 0,
                  y1: 0,
                  x2: 515,
                  y2: 0,
                  dash: {length: 2, space: 2},
                  lineWidth: 1.0,
                  lineColor: '#79B4A9',
                }]
              },
              {
               text:' ',
              }
            ],
            {
              columns: [
                [
                  {text: "Faktúra č. : " + this.singleRow.invoiceNumber, bold: true, fontSize: 14},

                  {text: "Vystavené dňa : " + moment(this.singleRow.created).format('DD.MM.YYYY'), style: 'subject'},
                  {
                    text: "Zdaniteľné plnenie : " + moment(this.singleRow.created).format('DD.MM.YYYY'),
                    style: 'subject'
                  },
                  {
                    text: "Dátum splatnosti : " + moment(this.singleRow.dateOfPayment).format('DD.MM.YYYY'),
                    style: 'subject'
                  },
                  {text: "Variabilný symbol : " + this.singleRow.invoiceNumber, style: 'subject'},
                  {text: "Spôsob úhrady : " + paymentMethod.name, style: 'subject'},

                ],
                [
                  {
                    text: "Vytvorené dňa : " + moment(new Date()).format('DD.MM.YYYY'),
                    alignment: 'right', style: 'subject'},
                  {
                    text: `Číslo objednávky : ${((Math.random() * 10000).toFixed(0))}`,
                    alignment: 'right', style: 'subject'
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
                widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                body: [
                  ['Názov a popis položky', 'Množstvo', 'Jednotka', 'Jednotková cena bez DPH', 'DPH', 'Cena s DPH', 'Spolu'],
                  ...this.singleRow.items.map(p => ([p.itemName, p.quantity, 'ks', p.sellingPrice - ((p.sellingPrice / 100) * 20) + '€', ((p.sellingPrice / 100) * 20).toFixed(2) + '€', p.sellingPrice + '€', (p.sellingPrice * p.quantity).toFixed(2) + '€'])),
                  [{text: 'Celkom', colSpan: 6, style: 'table'}, {}, {}, {}, {}, {}, this.singleRow.total + '€'],
                  [{
                    text: 'Po zaokrúhlení',
                    colSpan: 6,
                    style: 'table'
                  }, {}, {}, {}, {}, {}, this.roundTotal().toFixed(2) + '€'],
                ]
              }
            },
            {
              text: 'Doplňujúce informácie',
              style: 'sectionHeader'
            },
            {
              columns: [
                [{
                  qr: `${"Spolu: " + this.singleRow.total + "€, Variabilný symbol:" + this.singleRow.invoiceNumber}`,
                  fit: '85'
                }],
                [{
                  text: 'Pečiatka a podpis',
                  alignment: 'center',
                  italics: true
                }, {
                  image: await this.getBase64ImageFromURL("../../../assets/stamp.png"),
                  alignment: 'center',
                  style: 'width:80px; padding-right: 50px'
                }],

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
                'Toto je faktúra vygenerovaná systémom E-portal.',
              ],
            }
          ],
        ],
        styles: {
          body:{
            fontSize:9
          },
          sectionHeader: {
            bold: true,
            decoration: 'underline',
            color: '#79B4A9',
            fontSize: 14,
            margin: [0, 10, 0, 10]
          },
          subject: {
            fontSize: 10,
          },
          table: {
            fontSize: 12,
            bold: true
          },
          total: {
            background: '#79B4A9'
          }
        }
      };
      pdfMake.createPdf(docDefinition2).open();
    } else {
      let docDefinition = {
        content: [
          {
            columns: [
              [{image: await this.getBase64ImageFromURL("../../../assets/logo.png")}],
              [{
                text: 'Faktúra / Daňový doklad',
                fontSize: 18,
                bold: true,
                alignment: 'center',
                decoration: 'underline',
                color: 'black'
              },]
            ],
          },
          {
            columns: [
              [
                {text: 'Dodávateľ', alignment: 'left', style: 'sectionHeader'},


                {text: 'Obchodný register Okresného súdu Trnava, oddiel: Sro, vložka č. 34160/T'},
                {text: ' '},
              ],
              [
                {text: 'Odberateľ', alignment: 'right', style: 'sectionHeader'},
                {text: 'Názov : ' + this.singleRow.customer.customerName, alignment: 'right', style: 'subject'},
                {
                  text: 'Adresa : ' + this.singleRow.customer.street + ', ' + this.singleRow.customer.city,
                  alignment: 'right',
                  style: 'subject'
                },
                {text: 'IČO: ' + this.singleRow.customer.ico, alignment: 'right', style: 'subject'},
                {text: 'DIČ: ' + this.singleRow.customer.dic, alignment: 'right', style: 'subject'},
                {text: 'DIČ DPH: ' + this.singleRow.customer.dicSk, alignment: 'right', style: 'subject'},
                {text: 'Bankové spojenie : ' + this.singleRow.customer.iban, alignment: 'right', style: 'subject'},
                {text: ' '},
              ]
            ]
          },
          {
            columns: [
              [
                {text: "Faktúra č. : " + this.singleRow.invoiceNumber, bold: true},

                {text: "Vystavené dňa : " + moment(this.singleRow.created).format('DD.MM.YYYY'), style: 'subject'},
                {text: "Zdaniteľné plnenie : " + moment(this.singleRow.created).format('DD.MM.YYYY'), style: 'subject'},
                {
                  text: "Dátum splatnosti : " + moment(this.singleRow.dateOfPayment).format('DD.MM.YYYY'),
                  style: 'subject'
                },
                {text: "Variabilný symbol : " + this.singleRow.invoiceNumber, style: 'subject'},
                {text: "Spôsob úhrady : " + paymentMethod.name, style: 'subject'},

              ],
              [
                {
                  text: "Vytvorené dňa : " + moment(new Date()).format('DD.MM.YYYY'),
                  alignment: 'right'
                },
                {
                  text: `Číslo objednávky : ${((Math.random() * 10000).toFixed(0))}`,
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
              widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
              body: [
                ['Názov a popis položky', 'Množstvo', 'Jednotka', 'Jednotková cena bez DPH', 'DPH', 'Cena s DPH', 'Spolu'],
                ...this.singleRow.items.map(p => ([p.itemName, p.quantity, 'ks', p.sellingPrice - ((p.sellingPrice / 100) * 20) + '€'])),
                [{
                  text: 'Celkom',
                  colSpan: 6,
                  style: 'table'
                }, {}, {}, {}, {}, {}, this.singleRow.items.reduce((sum, p) => sum + (p.quantity * p.sellingPrice), 0).toFixed(2) + '€'],
              ]
            }
          },
          {
            text: 'Doplňujúce informácie',
            style: 'sectionHeader'
          },
          {
            columns: [
              [{
                qr: `${"Spolu: " + this.singleRow.total + "€, Variabilný symbol:" + this.singleRow.invoiceNumber}`,
                fit: '85'
              }],
              [{
                text: 'Pečiatka a podpis',
                alignment: 'center',
                italics: true
              }, {
                image: await this.getBase64ImageFromURL("../../../assets/stamp.png"),
                alignment: 'center',
                style: 'width:80px; padding-right: 50px'
              }],

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
            margin: [0, 10, 0, 10]
          },
          subject: {
            fontSize: 11,
          },
          table: {
            fontSize: 11,
          }
        }
      };
      pdfMake.createPdf(docDefinition).open();
    }
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
