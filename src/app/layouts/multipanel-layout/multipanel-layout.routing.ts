import { Routes } from '@angular/router';

import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { CasesComponent } from '../../pages/cases/cases.component';

export const AdminLayoutRoutes: Routes = [
   { path: 'cases', component: CasesComponent },
   { path: 'dashboard/:caseno', component: DashboardComponent }
];
