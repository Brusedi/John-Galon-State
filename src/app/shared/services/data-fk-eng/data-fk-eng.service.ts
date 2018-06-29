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


const FK_MACRO_BEGIN = "{"; 
const FK_MACRO_END = "}";

const DISPLAY_MD_PROP_NAME = "DisplayColumn";
const KEY_MD_PROP_NAME = "Key";
const DISPLAY_NAMES_DEF    = ["name"];

const     fieldNameBung = (origName: string) =>  origName.toUpperCase() == origName ? origName.toLowerCase() : origName[0].toLowerCase() + origName.substring(1);


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
    //console.log( locs );
    return this.cacheAcc.get(locs);
  }

  private buildStream( loc:ICachLocator ){
    const reqRoute = (l:ICachLocator ) => 
      l.rType == ReqType.Item ?  this.dataProv.data(l.loc) 
      :(
        l.rType == ReqType.List ?
          this.dataProv.list(l.loc) :
          this.dataProv.data(l.loc, null, true) 
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
    const prepareLocation  = (key != null && key != undefined) ? location +"/"+key : location 
    const cachLoc:ICachLocator  =  { loc:prepareLocation, rType:type };
    return this.getRequestStream(cachLoc,isFreshVal )
  }

  // **********************************************************************
  /**
   *  Legasy
   *  Get Macros from location  
   */ 
  private getLocationMacros(location: string) {
      var recFun = (s: string, r: string[]) => {
          var bp = s.indexOf(FK_MACRO_BEGIN)
          if (bp > 0 && s.length > (bp+1) ) {
              var ss = s.substring(bp+1);
              var ep = ss.indexOf(FK_MACRO_END);
              if (ep > 0) {
                r.push(ss.substring(0, ep));
                r = recFun(ss.substring(ep), r);
              }
          }
          return r;
      }
      return recFun(location, []);
  }

  private builsFKSteaam(location:string , rowData$:Observable<{}>){ 
      const isNotEmptyJson = (obj) => { for(var key in obj) { if(obj.hasOwnProperty(key)) return true; } return false;};

      const getDispKeyName = ( m:any) => isNotEmptyJson(m)? ( m.hasOwnProperty(DISPLAY_MD_PROP_NAME) ? fieldNameBung(m[DISPLAY_MD_PROP_NAME]):undefined): undefined ;
      const getKeyName = ( m:any) => isNotEmptyJson(m)? ( m.hasOwnProperty(KEY_MD_PROP_NAME) ? fieldNameBung(m[KEY_MD_PROP_NAME]):undefined): undefined ;
      const getKeys = (m:any) => ( { key: getKeyName(m) , disp: ( getDispKeyName(m) ||  getKeyName(m))}); 
      const toKeyVal = ( row:{}, keyName:string, dispName:string ) => ({ key:  row[keyName]  , value: row[dispName]   });



      const buildUndepend = (loc:string) =>{ 
           const o1 = Observable.of(loc).mergeMap(x => this.getList(x));
           return Observable.of(loc).mergeMap(x => this.getMeta(x))
                  .combineLatest(o1, (m,d) => ({ meta:m, data:d})  )
                  .map( x => ( {keys:getKeys(x.meta), data:x.data } ) ) 
                  .map( x=> x.data.map(i =>  toKeyVal(i, x.keys.key, x.keys.disp )  )  ) 
                   


          //return this.getList(loc)
          //      .do(x=>console.log(x));
          // return Observable.of(loc)
          //       .do(console.log)
          //       //.mergeMap(x => this.getList(x))
          //       .mergeMap(x => this.getMeta(x))
          //       .do(x=>console.log(x));
                //.combineLatest( keys$ , (d, ks ) => ({ data:d , keys:ks }) )
                //.combineLatest( keys$ , (d, ks ) => ({ data:d , keys:ks }) )
                //.map( x =>  x.data.map( i=> toKeyVal(i, x.keys.key, x.keys.disp ) ) ) 

                //.map(x=> x.length)
                //.do(x=>console.log(x));
          // return this.getList(loc)
          //     .do(x => console.log('33333333333333333333333'))
          //     .combineLatest( keys$ , (d, ks ) => ({ data:d , keys:ks }) )
          //     .map( x =>  x.data.map( i=> toKeyVal(i, x.keys.key, x.keys.disp ) ) ) 
      }

      return this.getLocationMacros(location).length == 0 ?
                buildUndepend(location) :
                Observable.of([
                       {key: 'solid444',  value: 'DDDD'},
                       {key: 'grea444t',  value: 'Grdddddde44at'},
                       {key: 'go44od',   value: 'Go44oddddddddddd'},
                       {key: 'un44proven', value: 'Unp4ddddddddd4roven'}
                     ]);

          
          


        ;



    //   buildDependStream$ = ( location:string , rowData$:Observable<{}>): Observable<{key: string, value: string}[]> => 
    //       Observable.of([
    //     {key: 'solid444',  value: 'DDDD'},
    //     {key: 'grea444t',  value: 'Grdddddde44at'},
    //     {key: 'go44od',   value: 'Go44oddddddddddd'},
    //     {key: 'un44proven', value: 'Unp4ddddddddd4roven'}
    //   ]);

    //   buildUndependStream$ (location:string): Observable<{key: string, value: string}[]>{

    // //const execData$ = ( data:[] ) => 
    // //  Observable.from(data)
    // const getKeyValFieldsName = (location:string) =>
    //     this.getMeta(location)
    //       .map( )


    //     return this.getList(location)
    //   .
    //   }      

    //   this.getLocationMacros(location).length == 0 ? this.buildUndependStream$(location ) : this.buildDependStream$(location , rowData$ ) ;


  }  
       


  //*****************************************************************************


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


  /**
  * Формирует стрим из прототипа строки список валидных вторичных значений    
  */
  getForeginList = this.builsFKSteaam;
      //this.getLocationMacros(location).length == 0 ? this.buildUndependStream$(location ) : this.buildDependStream$(location , rowData$ ) ;

    // return Observable.of([
    //   {key: 'solid444',  value: 'So44lid'},
    //   {key: 'grea444t',  value: 'Gre44at'},
    //   {key: 'go44od',   value: 'Go44od'},
    //   {key: 'un44proven', value: 'Unp44roven'}
    // ]);
}
