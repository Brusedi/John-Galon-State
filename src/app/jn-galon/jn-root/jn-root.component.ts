/** / \/ |( / |/ /_\    
*   \/\/\_\/\/\_\__/
*  280418-220518 Presentation entity root compnent
*/

import { Component, OnInit } from '@angular/core';
import { Injectable, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/observable';
import { DataEngService } from '../../shared/services/data-eng/data-eng.service';

const MODULE_NAME = 'John Galon';
const COMPONENT_NAME = 'Root';

const SUB_SOURCE_PARAM_DATA_KEY = 'ServiceLocation';

@Component({
  selector: 'app-jn-root',
  templateUrl: './jn-root.component.html',
  styleUrls: ['./jn-root.component.css']
})

export class JnRootComponent implements OnInit {

  private serviceLocation:string; 

  constructor(
    private route: ActivatedRoute,
    private db: DataEngService
  ){ 
    
    var l;

    route.data  //.subscribe( x => { console.log(x) });
      .map(x => x.data[SUB_SOURCE_PARAM_DATA_KEY] )
      .subscribe( x => {l=x;  db.connect( x )} );

      db.data$.subscribe(x=> console.log(x)); 
     //db.meta$.subscribe(x=> console.log(x)); 
      //db.fieldsList$.subscribe(x=> console.log(x)); 


      db.connect( l );
      db.connect( l );
      db.connect( "Ax/Enum/ABC" );
      db.connect( "Ax/Enum/ABC" );
      
      //db.fieldsList$.subscribe(x=> console.log(x));
  }


  ngOnInit() {
  }
}
