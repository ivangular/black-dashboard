import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';

import { MultipanelLayoutComponent } from './layouts/multipanel-layout/multipanel-layout.component';
import {DashboardComponent} from './pages/dashboard/dashboard.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'cases',
    pathMatch: 'full'
  },
  {
    path: '',
    component: MultipanelLayoutComponent,
    children: [
      {
        path: '',
        loadChildren:
          './layouts/multipanel-layout/multipanel-layout.module#MultipanelLayoutModule'
      }
    ]
  },
  // use the wildcard path - ** - as a catch-all route to render things like a "Not Found" view
  // or to redirect the user back to the root of the application.
  {
    path: '**',
    redirectTo: 'cases'
  },

];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes, {
      useHash: true
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
