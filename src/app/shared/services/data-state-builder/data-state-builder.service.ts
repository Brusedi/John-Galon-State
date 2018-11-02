/** 
 *  311018 Tutoral state builder (Rebuild data-ms-eng ) 
 *  
*/

import { Injectable }         from '@angular/core';
import { Observable }         from 'rxjs/Observable';
import { filter, mergeMap, share, distinctUntilChanged, map, combineLatest } from 'rxjs/operators';

import { DataProvService }    from '../data-prov/data-prov.service';
import { IMetadata }          from '../data-adapters/data-adapt-helper.service';
import { Subject } from 'rxjs';


const IS_FIELD_TAG_BEGIN = "["; 
const IS_FIELD_TAG_END = "]";
const ADD_META_TYPE_KEY_NAME =  IS_FIELD_TAG_BEGIN + "Type"+IS_FIELD_TAG_END;

const MODULE_NAME    = 'John Galon';
const COMPONENT_NAME = 'T-NgRx State builder';

const log = (msg:any) => ( console.log("["+MODULE_NAME+"]"+"["+COMPONENT_NAME+"] " + msg )  );



@Injectable()
export class DataStateBuilderService {

  constructor(  private dataProv: DataProvService ) { }

  private buildDataStreamsByGeneric( loc$: Observable<string> ) {

    // helper funcs
    const isField = (key:string) => key.length > 2 && key[0]== IS_FIELD_TAG_BEGIN && key[key.length-1] ==  IS_FIELD_TAG_END ;
    const clear   = (key:string) => key.length > 2 ? key.substring(1, key.length - 1) : key  ;
    const toFieldsList = (data: IMetadata ) => Object.getOwnPropertyNames(data).filter(isField).map( x =>  ({keyId:clear(x), type:data[x]}) )
    const mergeToArray = ( d:Observable<any>[]) => Observable.from(d).mergeAll().toArray();

    const data$ = loc$.pipe(
      filter(x => x != undefined && x.length > 0 ) ,
      mergeMap(loc => this.dataProv.list(loc)),
      share() 
    ).do(x => "Creating data source instance by location: " + x ) ;

    const meta$ = loc$.pipe(
      filter(x => x != undefined && x.length > 0 ) ,
      distinctUntilChanged() ,
      mergeMap( loc => this.dataProv.data( loc, undefined, true ) ),
      share()
    );

    const fieldsList$ = meta$.pipe(
      map(x => x as IMetadata),
      filter( x => x != null && x != undefined ),
      map( x =>  toFieldsList(x) ) 
    )
    
    const fieldsMeta$ = fieldsList$.pipe(
      combineLatest(loc$, (f,l)=>({ flds:f, loc:l }) ),       //?????   Петля ориона
      map( x => 
            x.flds.map( f => 
                this.dataProv.data(x.loc, f.keyId , true)
                    .map( fi => { fi.id = f.keyId; fi[ADD_META_TYPE_KEY_NAME] = f.type;  return fi ; })
            )),
      mergeMap(mergeToArray),
      share()
    )
    const template$ = loc$.mergeMap( loc => this.dataProv.template(loc) )  

    return ( { data$:data$ , meta$:meta$ , fields$: fieldsList$ , fieldsMeta$: fieldsMeta$ , rowTemplate$ :  template$} )
  }



  // private buildDataStreamsBySubscribe(loc$: Observable<string> ) {

  //   const LocToData = (l:string)=>{

  //   const buildDataStream = (l:string)=>{
  //       return 

  //   } 
  //   var data$ = new Subject<{}[]>() ;



    
  //   loc$.subscribe(
  //      l => dt.next( this.dataProv.list(loc)   ) 

  //   )
       
    
    
  //    }


}
