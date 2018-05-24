import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { 
 
  MatCardModule 
  
} from '@angular/material';

import { AppComponent } from './app.component';
import { JnRootComponent } from './jn-galon/jn-root/jn-root.component';
import { DataEngService } from './shared/services/data-eng/data-eng.service';
import { AppSettingsService } from './shared/services/appsettings.service';
import { DataProvService } from './shared/services/data-prov/data-prov.service';
import { HttpModule } from '@angular/http';


const appRoutes: Routes = [
  {
    path: 'jonhgalon',
    component: JnRootComponent,
    data: {  data: { ServiceLocation:'NvaSd/Incoming' } }
  },
  { path: '',
    redirectTo: 'jonhgalon',
    pathMatch: 'full'
  },
];



@NgModule({
  declarations: [
    AppComponent,
    JnRootComponent
  ],
  imports: [
    HttpModule,
    BrowserModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    ),
    MatCardModule   
  ],
  providers: [
    AppSettingsService,
    DataEngService,
    DataProvService

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
