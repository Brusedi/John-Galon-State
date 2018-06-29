import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { 
 
  MatCardModule,
  MatTableModule,
  MatButtonModule
  
} from '@angular/material';

import { CdkTableModule } from '@angular/cdk/table';
import { MatTabsModule } from '@angular/material/tabs';
import {MatInputModule} from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule }          from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';

import { AppComponent } from './app.component';
import { JnRootComponent } from './jn-galon/jn-root/jn-root.component';
//import { DataEngService } from './shared/services/data-eng/data-eng.service';
import { AppSettingsService } from './shared/services/appsettings.service';
import { DataProvService } from './shared/services/data-prov/data-prov.service';
import { HttpModule } from '@angular/http';
import { JnGridComponent } from './jn-galon/jn-grid/jn-grid.component';

import { DataAdaptBaseService } from './shared/services/data-adapters/data-adapt-base/data-adapt-base.service';
import { DataAdaptHelperService } from './shared/services/data-adapters/data-adapt-helper.service';
import { DataMsEngService } from './shared/services/data-ms-eng/data-ms-eng.service';
import { DataAdaptForeginKeyProvService } from './shared/services/data-adapters/data-adapt-foregin-key-prov/data-adapt-foregin-key-prov.service';
import { DataFkEngService } from './shared/services/data-fk-eng/data-fk-eng.service';
import { DataAdaptGridService } from './shared/services/data-adapters/data-adapt-grid/data-adapt-grid.service';
import { JnNewItemComponent } from './jn-galon/jn-item/jn-new-item/jn-new-item.component';
import { DataAdaptItemService } from './shared/services/data-adapters/data-adapt-item/data-adapt-item.service';
import { JnItemQuestionComponent } from './jn-galon/jn-item/jn-item-question/jn-item-question.component';


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
    JnGridComponent,
    JnNewItemComponent,
    JnItemQuestionComponent
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
    MatButtonModule,
    CdkTableModule,
    MatTabsModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule
   
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
    DataAdaptGridService,
    DataAdaptItemService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
