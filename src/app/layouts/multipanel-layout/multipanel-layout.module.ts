import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminLayoutRoutes } from './multipanel-layout.routing';
import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { CasesComponent } from '../../pages/cases/cases.component';


import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
      CommonModule,
      RouterModule.forChild(AdminLayoutRoutes),
      FormsModule,
      HttpClientModule,
      NgbModule
  ],
  declarations: [
      DashboardComponent,
      CasesComponent
  ]
})
export class MultipanelLayoutModule {}
