import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../_services';

@Component({
  selector: 'app-typography',
  templateUrl: 'cases.component.html'
})

export class CasesComponent implements OnInit {
  constructor(private messageService: MessageService) {}

  ngOnInit() {
     this.messageService.sendMessage('flist hide');
  }
}
