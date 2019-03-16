import { Component, OnInit } from '@angular/core';

import { RippyService } from './rippy.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public parseBrowserUrl: string;

  constructor(public rippy: RippyService) { }

  ngOnInit() {
    this.rippy.getParseBrowserURL().subscribe(url => this.parseBrowserUrl = url)
  }
}
