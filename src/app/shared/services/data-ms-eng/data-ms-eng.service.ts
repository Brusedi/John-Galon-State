/** 
 *  Mike Nizhnevartovskavia
 *  290518 Multisource stream engine (tutoral)
 * 
 *  ... и должно быть примерно так: компонент обращается к сервису используя локатор типа :"\SourceData"
 *  и получает набор подписок пока такого типа :
 *  Данные, метаданные, метаданные полей : 
 *  что делать с датасорсом неясно.....
 *  Важно отметить что инстанс сервиса ненужен .... 
 *  Так же не должно быть кеширования на уровне объектов только роуты стримов
 *  310518 Еще один момент необходимо разделить запрос на подписку с запросом на бновление данных
 *  310518 Будет все по другому....
 *  Все таки пока буду фабриковать инстанс....
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { DataProvService } from '../data-prov/data-prov.service';
import { IMetadata } from '../data-adapters/data-adapt-helper.service';
import { DataSource } from '@angular/cdk/table';
import { CollectionViewer } from '@angular/cdk/collections';

import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/scan'
import 'rxjs/add/operator/combineLatest'
import 'rxjs/add/operator/mergeAll'
import 'rxjs/add/operator/toArray'
import 'rxjs/add/operator/share'
import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/multicast'

const IS_FIELD_TAG_BEGIN = "["; 
const IS_FIELD_TAG_END = "]";

const MODULE_NAME    = 'John Galon';
const COMPONENT_NAME = 'DataMultisourceEngine';
const log = (msg:any) => ( console.log("["+MODULE_NAME+"]"+"["+COMPONENT_NAME+"] " + msg )  );

@Injectable()
export class DataMsEngService {
  
  constructor(
    private dataProv: DataProvService
  ) { 
  }

  /**
   * Creating data source instance by location
   * 
   * @param loc$  Sublocation : /xxx/xxx/xx...
   */
  public db( loc$: Observable<string> ){
    var data$ =
    loc$
      .do( x=> log("Creating data source instance by location: "+x ))
      .filter( x => x != undefined && x.length > 0)
      .mergeMap( loc => this.dataProv.list(loc))
      .share();        

    var meta$ =
      loc$
        .filter( x => x != undefined && x.length > 0)  
        .distinctUntilChanged()
        .mergeMap( loc => this.dataProv.data( loc, undefined, true )  )
        .share();

    var fieldsList$ =
      meta$
        .map(x => x as IMetadata)
        .filter( x => x != null && x != undefined )
        .map( x=> this.toFieldsList(x) ) 

    var fieldsMeta$ = 
      fieldsList$
         .combineLatest(
            loc$,
            (fds, loc) => fds.map( x => {
                var o = this.dataProv.data(loc, x, true)      
                  .map( i => {                                        // вот это может нужно убрать
                    var r = (i as IMetadata);
                    r.id = x;
                    return r;
                  } )
                return o;            
              } )
          )                                                                                                 //.map( y => (y as IMetadata).id = x
          .mergeMap(x=> this.mergeToArray(x) )    
          .share();

    return new Db( data$, meta$, fieldsMeta$ ) ;
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
 *  Datasourse node
 */
export class Db extends DataSource<any>{

  constructor(
    public data$:Observable<any[]>, 
    public meta$:Observable<any>, 
    public fieldsMeta$:any//Observable<any[]>
  ) {
      super();
  }

  connect(){
    return this.data$ ;
  } 

  disconnect(): void {
  }
  
}

 
