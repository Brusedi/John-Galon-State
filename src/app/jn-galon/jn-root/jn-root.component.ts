/** / \/ |( / |/ /_\    
*   \/\/\_\/\/\_\__/
*  280418-220518 Presentation entity root compnent
*/

import { Component, OnInit, OnDestroy } from '@angular/core';
//import { Injectable, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
//import { Observable } from 'rxjs/observable';

//import { Subscription } from 'rxjs';
import { DataMsEngService, Db } from '../../shared/services/data-ms-eng/data-ms-eng.service';

import 'rxjs/add/operator/map'

const MODULE_NAME = 'John Galon';
const COMPONENT_NAME = 'Root';
const log = (msg:any) => ( console.log("["+MODULE_NAME+"]"+"["+COMPONENT_NAME+"] " + msg )  );

const SUB_SOURCE_PARAM_DATA_KEY = 'ServiceLocation';

@Component({
  selector: 'app-jn-root',
  templateUrl: './jn-root.component.html',
  styleUrls: ['./jn-root.component.css']
})

export class JnRootComponent implements OnInit , OnDestroy {

  //private subscr:Subscription;
  //private db:Db ;
  db:Db ;

  constructor(
    private route: ActivatedRoute,
    private dbEng: DataMsEngService
  ){ 
    //this.subscr = route.data  
    //  .map(x => x.data[SUB_SOURCE_PARAM_DATA_KEY] )
    //  .subscribe( x => { log("Send change request locaton on:"+ x ); db.changeLocation( x )} );
    this.db = dbEng.db( 
       route.data.map(x => x.data[SUB_SOURCE_PARAM_DATA_KEY] ) 
    )
  }

  ngOnInit() {

  }

  ngOnDestroy(){
    //this.subscr.unsubscribe();
  }

}
