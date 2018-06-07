import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { 
 
  MatCardModule, MatTableModule 
  
} from '@angular/material';

import { AppComponent } from './app.component';
import { JnRootComponent } from './jn-galon/jn-root/jn-root.component';
//import { DataEngService } from './shared/services/data-eng/data-eng.service';
import { AppSettingsService } from './shared/services/appsettings.service';
import { DataProvService } from './shared/services/data-prov/data-prov.service';
import { HttpModule } from '@angular/http';
import { JnGridComponent } from './jn-galon/jn-grid/jn-grid.component';
import { CdkTableModule } from '@angular/cdk/table';
import { DataAdaptBaseService } from './shared/services/data-adapters/data-adapt-base/data-adapt-base.service';
import { DataAdaptHelperService } from './shared/services/data-adapters/data-adapt-helper.service';
import { DataMsEngService } from './shared/services/data-ms-eng/data-ms-eng.service';
import { DataAdaptForeginKeyProvService } from './shared/services/data-adapters/data-adapt-foregin-key-prov/data-adapt-foregin-key-prov.service';
import { DataFkEngService } from './shared/services/data-fk-eng/data-fk-eng.service';
import { DataAdaptGridService } from './shared/services/data-adapters/data-adapt-grid/data-adapt-grid.service';


const appRoutes: Routes = [
  {
    path: 'jonhgalon',
    component: JnRootComponent,
    data: {  data: { ServiceLocation:'/NvaSd/Incoming' } }
  },
  { path: '',
    redirectTo: 'jonhgalon',
    pathMatch: 'full'
  },
];


@NgModule({
  declarations: [
    AppComponent,
    JnRootComponent,
    JnGridComponent
  ],
  imports: [
    HttpModule,
    BrowserModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    ),
    MatCardModule,
    MatTableModule,
    CdkTableModule
   
  ],
  providers: [
    AppSettingsService,
    //DataEngService,
    DataMsEngService,
    DataProvService,
    DataAdaptBaseService,
    DataAdaptHelperService,
    DataAdaptForeginKeyProvService,
    DataFkEngService,
    DataAdaptGridService

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
