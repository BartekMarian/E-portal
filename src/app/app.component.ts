import {Component, OnInit} from '@angular/core';
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer, Meta, Title} from "@angular/platform-browser";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDrawer} from "@angular/material/sidenav";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private titleService: Title,
              private metaTagService: Meta,
              private router: Router,
              private route: ActivatedRoute,
              private iconRegistry: MatIconRegistry,
              private sanitizer: DomSanitizer,) {
  }

  ngOnInit() {
    this.titleService.setTitle("E-portal");
  }

}
