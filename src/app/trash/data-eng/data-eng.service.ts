/** 
 *  Mike Nizhnevartovsk
 *  290518 Single sourse stream engine (tutoral)
 *  Устарело !!!!
 */

import { Injectable } from '@angular/core';
import {DataSource} from '@angular/cdk/collections';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/scan'
import 'rxjs/add/operator/combineLatest'
import 'rxjs/add/operator/mergeAll'
import 'rxjs/add/operator/toArray'
import 'rxjs/add/operator/share'

import 'rxjs/add/observable/from'


//import { DataProvService } from '../data-prov/data-prov.service';
import { DataProvService } from '../../shared/services/data-prov/data-prov.service';

import { ActivatedRoute } from '@angular/router';


const IS_FIELD_TAG_BEGIN = "["; 
const IS_FIELD_TAG_END = "]";
const SUB_SOURCE_PARAM_DATA_KEY = 'ServiceLocation';

const MODULE_NAME    = 'John Galon';
const COMPONENT_NAME = 'DataEngine';
const log = (msg:any) => ( console.log("["+MODULE_NAME+"]"+"["+COMPONENT_NAME+"] " + msg )  );

interface IMetadata{
  [propertyName: string]: any; 
}


@Injectable()
export class DataEngService  extends DataSource<any> {

  // root stream  
  baseLocator$ : BehaviorSubject<string> = new BehaviorSubject<string>(undefined);  // Пока оставим

  // main request stream
  data$: Observable<any[]>;             // BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]); 
  meta$: Observable<any>  ;             //BehaviorSubject<any> = new BehaviorSubject<any>(undefined);

  // derivatives stream 
  fieldsList$: Observable<string[]>;    //:Observable<string[]> ; 
  
  // secondary request streams
  fieldsMeta$: Observable<any[]> ;      //BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]); 

  constructor(
    private dataProv: DataProvService
  ){ 
      super();
      this.initSubscribes();
  }

  /**
   *  Refresh strem root data
   */  
  changeLocation( location:string ){
    this.baseLocator$.next(location);
  }

  /**
   *  
   */ 
  connect(): Observable<any[]> {
    return this.data$;
  }
  disconnect() {}

  private initSubscribes(){

    // main
    this.data$ = 
         this.baseLocator$
           .filter( x => x != undefined && x.length > 0)
           .mergeMap( loc => this.dataProv.list(loc))
           .share();

    this.meta$ =  
      this.baseLocator$ 
        .scan( (acc,x) =>  [acc[1],x]  , [ undefined,undefined ]   )
        .filter(x => x[0] != x[1] )
        .map(x => x[1])
        .mergeMap( loc => this.dataProv.data( loc, undefined, true )  )
        .share();

    // derivatives
    this.fieldsList$ = 
       this.meta$.map( x => x as IMetadata )
       .filter( x => x != null && x != undefined )
       .map( x=> this.toFieldsList(x) ) 

    this.fieldsMeta$ =
      this.fieldsList$
       .combineLatest(
           this.baseLocator$, 
           (fds, loc) =>  fds.map( x =>  this.dataProv.data(loc, x, true ).map( y => (y as IMetadata).id = x )  )
        )
       .mergeMap(x=> this.mergeToArray(x) )
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

