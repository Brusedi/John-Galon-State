import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {DataSource} from '@angular/cdk/collections';

import {BehaviorSubject, Observable, Subscription} from 'rxjs';

import 'rxjs/add/operator/map'
import 'rxjs/add/operator/last'
import 'rxjs/add/operator/delay'
import 'rxjs/add/observable/of'
import { DataEngService } from '../../shared/services/data-eng/data-eng.service';
import { DataAdaptBaseService, FieldDescribe } from '../../shared/services/data-adapters/data-adapt-base/data-adapt-base.service';
import { Db } from '../../shared/services/data-ms-eng/data-ms-eng.service';

@Component({
  selector: 'app-jn-grid',
  templateUrl: './jn-grid.component.html',
  styleUrls: ['./jn-grid.component.css']
})

export class JnGridComponent  implements OnChanges   {

  @Input() private dbc:Db;

  private columns$: Observable<FieldDescribe[]>
  private displayedColumns:string[] ;

  private subscriptions:Subscription[] = [];

  constructor( 
    private adapter:DataAdaptBaseService,
  ) { 
  }

  ngOnChanges(changes: SimpleChanges): void {
    if( changes["dbc"].firstChange){
      this.initDataStreams();
    }
  }

  /**
   *  init streams & subscribes
   */
  private initDataStreams(){
    this.columns$ =  this.adapter.toGridColumns(this.dbc.fieldsMeta$).do(x=> console.log(x));

    this.subscriptions
      .push(
         this.columns$
         .map( x => x.map( i=> i.altId ) )
         //.delay(1000)
         .subscribe( x => this.displayedColumns = x )      
      )  
  }    

  ngOnDestroy(){
    console.log("check unsubscr");
    while(this.subscriptions.length > 0){
      this.subscriptions.pop().unsubscribe();
    }
  }
}
