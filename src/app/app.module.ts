import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { 
  MatCardModule,
  MatTableModule,
  MatButtonModule,
  MatNativeDateModule,
  MatRippleModule,
  MatCheckboxModule,
  MatMenuModule,
  MatDividerModule,
  MatToolbarModule
} from '@angular/material';

import {CdkTableModule } from '@angular/cdk/table';
import {MatTabsModule } from '@angular/material/tabs';
import {MatInputModule} from '@angular/material/input';
import {BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {ReactiveFormsModule }          from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {HttpModule } from '@angular/http';

import { Store, StoreModule } from '@ngrx/store';

import { AppComponent } from './app.component';
import { JnRootComponent } from './jn-galon/jn-root/jn-root.component';
//import { DataEngService } from './shared/services/data-eng/data-eng.service';
import { AppSettingsService } from './shared/services/appsettings.service';
import { DataProvService } from './shared/services/data-prov/data-prov.service';
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
import { JnRootPageComponent } from './jn-galon/jn-root-page/jn-root-page.component';

import * as fromReducers from './store/redusers';
import * as fromStore from './store/index';


 const appRoutes: Routes = [
    { path: '',               component: JnRootComponent, pathMatch: 'full' ,data: {  data: { ServiceLocation:'/NvaSd2/JgMockTable'    } } },
    { path: 'tutoral/mock',   component: JnRootComponent,                    data: {  data: { ServiceLocation:'/NvaSd2/JgMockTable'    } } },  
    { path: 'tutoral/sd',     component: JnRootComponent,                    data: {  data: { ServiceLocation:'/NvaSd2/NvaSdIncoming'  } } },  
 ];

// const appRoutes: Routes = [
//   { path: '',               component: JnRootPageComponent, pathMatch: 'full' ,data: {  data: { ServiceLocation:'/NvaSd2/JgMockTable'    } } },
//   { path: 'tutoral/mock',   component: JnRootPageComponent,                    data: {  data: { ServiceLocation:'/NvaSd2/JgMockTable'    } } },  
//   { path: 'tutoral/sd',     component: JnRootPageComponent,                    data: {  data: { ServiceLocation:'/NvaSd2/NvaSdIncoming'  } } },  

// ];



@NgModule({
  declarations: [
    AppComponent,
    JnRootComponent,
    JnRootPageComponent,
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
    MatMenuModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    CdkTableModule,
    MatTabsModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatDividerModule,
    MatToolbarModule,
    StoreModule.forRoot( fromStore.reducers )
    

  ],
  providers: [
    AppSettingsService,
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
