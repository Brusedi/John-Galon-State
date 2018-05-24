import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/scan'

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

  baseLocator$ : BehaviorSubject<string> = new BehaviorSubject<string>(undefined);
  data$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  meta$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);

  fieldsList$:Observable<string[]> ; 
    

  constructor(
    private dataProv: DataProvService
  ) { 

    this.baseLocator$
      .filter( x => x != undefined && x.length > 0)
      .mergeMap( loc => this.dataProv.list(loc))
      .subscribe( d => {this.data$.next(d); log("Data load...") } );

    this.baseLocator$  
      .scan( (acc,x) =>  [acc[1],x]  , [ undefined,undefined ]   )
      .filter(x => x[0] != x[1] )
      .map(x => x[1])
      .mergeMap( loc => this.dataProv.data( loc, undefined, true )  )
      .subscribe( d => {this.meta$.next(d) ; log("Metadata load...") } )

    this.fieldsList$ = 
      this.meta$.map( x => x as IMetadata )
      .filter( x => x != null && x != undefined )
      .map( x=> this.toFieldsList(x) )

  }

  connect( location:string ){
    this.baseLocator$.next(location);
  }


  /**
  *  Helper  
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

}
