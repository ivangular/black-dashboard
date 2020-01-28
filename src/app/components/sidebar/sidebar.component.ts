import {Component, Input, OnInit} from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageService } from '../../_services';

declare interface RouteInfo {
  path: string;
  title: string;
  filter: number;
  selection: string;
  class: string;
}
// TODO I am declaring filters both here andin dashboard component.ts
export const ROUTES: RouteInfo[] = [
        {
                path: '/dashboard',
                title: 'Remove common',
                filter: 2, // COMMON
                class: 'filter',
                selection: 'negative'
        },
        {
                path: '/dashboard',
                title: 'Remove silent',
                filter: 8, // SILENT
                class: 'filter',
                selection: 'negative'
       },
        {
                path: '/dashboard',
                title: 'Remove parent\nhomozygote',
                filter: 32, // PARENT HOMOZYGOTE
                class: 'filter',
                selection: 'negative'
        },
         {
                path: '/dashboard',
                title: 'Remove de novo',
                filter: 16, // DE_NOVO
                class: 'filter',
                selection: 'negative'
        },
       {
                path: '/dashboard',
                title: 'Exonic only',
                filter:  4, // EXONIC
                class: 'filter',
                selection: 'positive'
        },
        {
                path: '/dashboard',
                title: 'Homozygote only',
                filter: 1, // HOMOZYGOTE
                class: 'filter',
                selection: 'positive'
        },
        {
                path: '/dashboard',
                title: 'De novo only',
                filter: 16, // DE_NOVO
                class: 'filter',
                selection: 'positive'
        },

];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

        subscription: Subscription;
        menuItems: any[];
        selection: any;

        constructor(private messageService: MessageService) {
                // subscribe to home component messages
                this.subscription = this.messageService.getMessage().subscribe(message => {
                        if (message) {
                                const field = message.text.split(' ');
                                if (field[0] === 'flist') {
                                         if (field[1] === 'reset') {
                                                this.resetFilters();
                                        } else if (field[1] === 'hide') {
                                                 document.getElementById('filter-list').style.display = 'none';
                                        }  else if (field[1] === 'show') {
                                                document.getElementById('filter-list').style.display = 'block';
                                        }
                                }
                        }
                });
        }

        sendMessage(filter: number, selection: string): void {
                // send message to subscribers via observable subject
                this.messageService.sendMessage(`filter ${filter} ${this.selection[filter]}`);
        }

        ngOnInit() {
                this.menuItems = ROUTES;
                this.resetFilters();
        }
        private resetFilters() {
                this.selection = {};
                for (const menuItem of this.menuItems) {
                        this.selection[menuItem.filter] = 'none';
                }
        }

        toggleFilter(filter, selection) {
                if ( this.selection[filter] === selection ) {
                        this.selection[filter]   = 'none';
                } else {
                        this.selection[filter]   = selection;
                }
        }

}
