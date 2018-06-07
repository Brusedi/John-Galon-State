/**
 * Http-request cacher (foregin key value provider )
 * 050618 
 * 
 */
import { Injectable } from '@angular/core';
import { DataProvService } from '../data-prov/data-prov.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { combineLatest, map, filter, mergeMap, publish, refCount } from 'rxjs/operators';

import 'rxjs/operator/share';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/publish';

@Injectable()
export class DataFkEngService {
  
  // root stream  
  private baseLocator$  = new BehaviorSubject<string>(undefined);  // Пока оставим
  private cacheAcc:Map<string,Observable<any>> = new Map();

  constructor(private dataProv: DataProvService) {
  }
  
  getValue$(loc:string, isFreshVal:boolean = false){
    //console.log(loc)
    //console.log( this.cacheAcc.has(loc) ? "есть ": "нету");
    if(this.cacheAcc.has(loc)){        
      if(isFreshVal){ 
        this.baseLocator$.next(loc);
      }
    }  
    else{
      this.cacheAcc.set(
        loc, 
        this.buildStream(this.baseLocator$,loc)
        )
        this.baseLocator$.next(loc);
    }  
    return this.cacheAcc.get(loc)//.do(x=> console.log( ) );
  }

  private buildStream( sourseLoc$, loc  ){

    return Observable.of(loc).pipe(
        combineLatest( sourseLoc$ ),
        filter( x => x[0] == x[1]  ),
        map( x => x[0]  ),
        mergeMap( x=> this.dataProv.list(x) ),  // бла
        map( x=> x[0].name ),//,
        //map(x=>x ),
        publish(),
        refCount()
      );
  }

}
