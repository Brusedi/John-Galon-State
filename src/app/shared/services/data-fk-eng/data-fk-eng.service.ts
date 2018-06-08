/**
 * Http-request cacher (foregin key value provider )
 * 050618 
 * 070618 Надо сделать его потупее, но типологически разделить лист и итем ()
 * 
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { combineLatest, map, filter, mergeMap, publish, refCount, share } from 'rxjs/operators';
import { DataProvService } from '../data-prov/data-prov.service';

enum ReqType{ List, Item, Metadata  };
interface ICachLocator { loc:string ; rType:ReqType };
const lcHsh = (l:ICachLocator) => l.loc+"_"+l.rType.toString();

const MODULE_NAME    = 'John Galon';
const COMPONENT_NAME = 'DataCacherEngine';
const log = (msg:any) => ( console.log("["+MODULE_NAME+"]"+"["+COMPONENT_NAME+"] " + msg )  );


@Injectable()
export class DataFkEngService {

  // root stream  
  private baseLocator$  = new BehaviorSubject<ICachLocator>(undefined);  // Пока оставим
  private cacheAcc:Map<string,Observable<any>> = new Map();

  constructor(private dataProv: DataProvService) {
  }

  //// LOW LEVEL  

  /**
   * Get cached or new response 
   * @param loc 
   * @param isFresh 
   */
  private getRequestStream( loc:ICachLocator, isFresh:boolean = false ){
    const locs = lcHsh(loc);
    const isNew = !this.cacheAcc.has(locs);
    if(isNew) { 
      log("Cached data of location hash:"+locs);
      this.cacheAcc.set(locs,this.buildStream(loc) ); 
    }
    if(isNew || isFresh ) {
      this.baseLocator$.next(loc);
    }   
    return this.cacheAcc.get(locs);
  }

  private buildStream( loc:ICachLocator ){
    const reqRoute = (l:ICachLocator ) => 
      l.rType == ReqType.Item ?  this.dataProv.data(l.loc) 
      :(
        l.rType == ReqType.List ?  this.dataProv.list(l.loc) 
        : this.dataProv.data(l.loc, null, true) 
      );

    return this.baseLocator$.pipe(
      combineLatest( Observable.of(loc)),
      filter( x => x[0].loc == x[1].loc && x[0].rType == x[1].rType),
      map(x => x[0]),
      mergeMap(x => reqRoute(x)),
      share()
    );
  }    

  private getResponse(type:ReqType, location:string, key:any, isFreshVal:boolean  ){
    const prepareLocation  = key != null && key != undefined ? location +"/"+key : location 
    const cachLoc:ICachLocator  =  { loc:prepareLocation, rType:type };
    return this.getRequestStream(cachLoc,isFreshVal )
  }

  //// HIGH LEVEL
  /**
   * Get cached data as Json Item
   * @param location base 
   * @param key if exist
   * @param isFreshVal 
   */
  getData = (location:string, key:any = undefined ,isFreshVal:boolean = false ) => this.getResponse( ReqType.Item , location, key , isFreshVal ) ;

  /**
   * Get cached metadata 
   * @param location base 
   * @param isFreshVal 
   */
  getMeta = (location:string, isFreshVal:boolean = false ) => this.getResponse( ReqType.Metadata ,location, undefined , isFreshVal ) ;

   /**
   * Get cached data as Iterable
   * @param location base 
   * @param key if exist
   * @param isFreshVal 
   */
  getList = (location:string, key:any = undefined ,isFreshVal:boolean = false ) => this.getResponse( ReqType.List , location, key , isFreshVal ) as Observable<any[]>;

}
