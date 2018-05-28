import {Component, Input} from '@angular/core';
import {DataSource} from '@angular/cdk/collections';

import {BehaviorSubject, Observable, Subscription} from 'rxjs';

import 'rxjs/add/operator/map'
import 'rxjs/add/operator/last'
import 'rxjs/add/operator/delay'
import 'rxjs/add/observable/of'
import { DataEngService } from '../../shared/services/data-eng/data-eng.service';
import { DataAdaptBaseService, FieldDescribe } from '../../shared/services/data-adapters/data-adapt-base/data-adapt-base.service';

//import { IDescribe } from '../../shared/service/data-prov-adapter/data-prov-adapter.interface';

@Component({
  selector: 'app-jn-grid',
  templateUrl: './jn-grid.component.html',
  styleUrls: ['./jn-grid.component.css']
})

export class JnGridComponent  {

  columns$: Observable<FieldDescribe[]>
  displayedColumns:string[] ;

  private subscriptions:Subscription[] = [];

  constructor( 
    private adapter:DataAdaptBaseService,
    private dbc: DataEngService ) { 

    this.ininitDataStreams();
  }

  private ininitDataStreams(){
    this.columns$ =  this.adapter.toGridColumns(this.dbc.fieldsMeta$);
    this.subscriptions
      .push(
        this.columns$.map( x => x.map( i=> i.altId ) ).delay(100).subscribe( x => this.displayedColumns = x )       /// !!!!! Delay !!! 
      )  
  }    

  ngOnInit() {
  }

  ngOnDestroy(){
    console.log("check unsubscr");
    while(this.subscriptions.length > 0){
      this.subscriptions.pop().unsubscribe();
    }
  }
}
