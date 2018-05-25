import { Injectable } from '@angular/core';
import {DataSource} from '@angular/cdk/collections';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/scan'
import 'rxjs/add/operator/combineLatest'
import 'rxjs/add/operator/mergeAll'
import 'rxjs/add/operator/toArray'
import 'rxjs/add/observable/from'

import { DataProvService } from '../data-prov/data-prov.service';

const IS_FIELD_TAG_BEGIN = "["; 
const IS_FIELD_TAG_END = "]";

const MODULE_NAME    = 'John Galon';
const COMPONENT_NAME = 'DataEngine';
const log = (msg:any) => ( console.log("["+MODULE_NAME+"]"+"["+COMPONENT_NAME+"] " + msg )  );

interface IMetadata{
  [propertyName: string]: any; 
}

@Injectable()
export class DataEngService {

  // root stream
  baseLocator$ : BehaviorSubject<string> = new BehaviorSubject<string>(undefined);

  // main request stream
  data$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  meta$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);

  // derivatives stream 
  fieldsList$:Observable<string[]> ; 
  dataSource$ :Observable<DataSource<any>> = Observable.of( new JnDataSource( this.data$ ));

  // secondary request streams
  fieldsMeta$:BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]); 

  constructor(
    private dataProv: DataProvService
  ){ 
    this.initSubscribes();
  }

  private initSubscribes(){
    // main
    this.baseLocator$
      .filter( x => x != undefined && x.length > 0)
      .mergeMap( loc => this.dataProv.list(loc))
      //.publish( )
      //.multic)ast(this.data$)
      //.share()
      //.subscribe(this.data$);
      //
      .subscribe( d => {this.data$.next(d); log("Data load...") } );

    this.baseLocator$  
      .scan( (acc,x) =>  [acc[1],x]  , [ undefined,undefined ]   )
      .filter(x => x[0] != x[1] )
      .map(x => x[1])
      .mergeMap( loc => this.dataProv.data( loc, undefined, true )  )
      .subscribe( d => {this.meta$.next(d) ; log("Metadata load...") } )

    // derivatives  
    this.fieldsList$ = 
      this.meta$.map( x => x as IMetadata )
      .filter( x => x != null && x != undefined )
      .map( x=> this.toFieldsList(x) ) 

    //secondary subscribe
    this.fieldsList$
      .combineLatest(
          this.baseLocator$, 
          (fds, loc) =>  fds.map( x =>  this.dataProv.data(loc, x, true ).map( y => (y as IMetadata).id = x )  )
      )
      .mergeMap(x=> this.mergeToArray(x) )
      .subscribe(d => {this.fieldsMeta$.next(d) ; log("Fields metadata load...") });

    // this.fieldsList$
    //   .subscribe(d => {this.fieldsMeta$.next(d) ; log("Fields metadata load...") });      
      
  }

  connect( location:string ){
    this.baseLocator$.next(location);
  }

  /**
  *  Helpers function  
  */ 
  private toFieldsList(data:IMetadata ){
    const isField = (key:string) => key.length > 2 && key[0]== IS_FIELD_TAG_BEGIN && key[key.length-1] ==  IS_FIELD_TAG_END ;
    const clear   = (key:string) => key.length > 2 ? key.substring(1, key.length - 1) : key  ;
    var ret:string[] = [];
    for (var key in data) {
        if (isField(key)) { 
            ret.push(clear(key) );
        }
    }
    return ret;
  } 

  private mergeToArray<T>( d:Observable<T>[]  ){
    return  Observable.from(d)
    .mergeAll()
    .toArray()
  }
}

/**
 *  Ang dataSourse 
 */
export class JnDataSource extends DataSource<any> {

  constructor(private dataChange$: BehaviorSubject<any[]>) {
    super();
    log("Created Angular dataSource...");
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<any[]> {
    return this.dataChange$;
  }

  disconnect() {}

}