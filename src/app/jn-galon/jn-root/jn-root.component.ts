/** / \/ |( / |/ /_\    
*   \/\/\_\/\/\_\__/
*  280418-220518 Presentation entity root compnent
*/



import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, Subscription } from 'rxjs';

//import { ChangeLocation } from '@appStore/actions/router.actions';

import  *  as fromStore from '@appStore/index'

import { DataMsEngService, Db } from '../../shared/services/data-ms-eng/data-ms-eng.service';
import { ChangeLocation }       from '@appStore/actions/router.actions';
import { JnChangeSource } from '@appStore/actions/jn.actions';


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

  private subscr:Subscription;
  //private db:Db ;
  db:Db ;

  constructor(
    private route: ActivatedRoute,
    private dbEng: DataMsEngService,
    private store: Store<fromStore.State>
  ){

    route.data
      .map(x => x.data[SUB_SOURCE_PARAM_DATA_KEY] );

    this.subscr  =  
      route.data
        .map(x => x.data[SUB_SOURCE_PARAM_DATA_KEY] )
        .subscribe( x => store.dispatch(  new JnChangeSource(x) ));


    this.db = dbEng.db( 
        store
          .map(x=>x.jn.location)
          .filter( x => x!='') 
    );

    // посконный релиз    
    // this.db = dbEng.db( 
    //     route.data.map(x => x.data[SUB_SOURCE_PARAM_DATA_KEY] ) 
    // );
    
  }

  onClickMe() {
    this.store.dispatch( new JnChangeSource('/NvaSd2/NvaSdIncoming' )  );
  }  

  ngOnInit() {

  }

  ngOnDestroy(){
    this.subscr.unsubscribe();
  }

}
